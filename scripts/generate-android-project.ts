import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { TEMPLATES } from '../src/templates/index';
import { renderStaticSite } from '../src/core/renderer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const outDir = path.resolve(rootDir, 'android-build');

console.log('--- Generating Android Studio Project Files for CI ---');
console.log('Output directory:', outDir);

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const manifest = TEMPLATES[0].manifest;
const render = renderStaticSite(manifest);
const cleanPackageName = 'ir.tavana.forge';
const appVersionName = (manifest.meta as any).versionName || '1.0.0';
const appVersionCode = (manifest.meta as any).versionCode || 1;

// 1. settings.gradle.kts
fs.writeFileSync(path.join(outDir, 'settings.gradle.kts'), `
pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.PREFER_SETTINGS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "TavanaProductForge"
include(":app")
`.trim());

// 2. build.gradle.kts
fs.writeFileSync(path.join(outDir, 'build.gradle.kts'), `
plugins {
    id("com.android.application") version "8.7.0" apply false
    id("org.jetbrains.kotlin.android") version "2.0.21" apply false
}
`.trim());

// 3. gradle.properties
fs.writeFileSync(path.join(outDir, 'gradle.properties'), `
org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.enableJetifier=true
android.nonTransitiveRClass=true
`.trim());

// 4. gradle wrapper properties
const wrapperDir = path.join(outDir, 'gradle', 'wrapper');
fs.mkdirSync(wrapperDir, { recursive: true });
fs.writeFileSync(path.join(wrapperDir, 'gradle-wrapper.properties'), `
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.10.2-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`.trim());

// 5. gradlew (POSIX)
const gradlewScript = `#!/usr/bin/env sh
APP_HOME="\`pwd -P\`"
if [ -f "$APP_HOME/gradle/wrapper/gradle-wrapper.jar" ]; then
    exec java -classpath "$APP_HOME/gradle/wrapper/gradle-wrapper.jar" org.gradle.wrapper.GradleWrapperMain "$@"
elif which gradle >/dev/null 2>&1; then
    exec gradle "$@"
else
    echo "Using gradle wrapper..."
    gradle wrapper || true
    exec gradle "$@"
fi
`.trim();
fs.writeFileSync(path.join(outDir, 'gradlew'), gradlewScript, { mode: 0o755 });

// 6. app module
const appDir = path.join(outDir, 'app');
fs.mkdirSync(appDir, { recursive: true });

fs.writeFileSync(path.join(appDir, 'build.gradle.kts'), `
plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "${cleanPackageName}"
    compileSdk = 35

    defaultConfig {
        applicationId = "${cleanPackageName}"
        minSdk = 24
        targetSdk = 35
        versionCode = ${appVersionCode}
        versionName = "${appVersionName}"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    signingConfigs {
        create("release") {
            val keystorePath = System.getenv("KEYSTORE_FILE") ?: "release-key.jks"
            val keystoreFile = rootProject.file(keystorePath)
            val storePass = System.getenv("KEYSTORE_PASSWORD") ?: "tavana_release_pass_2026"
            val kAlias = System.getenv("KEY_ALIAS") ?: "tavana_key"
            val kPass = System.getenv("KEY_PASSWORD") ?: "tavana_release_pass_2026"

            // 100% Automated Keystore Generation if file does not exist
            if (!keystoreFile.exists()) {
                try {
                    val process = ProcessBuilder(
                        "keytool", "-genkey", "-v",
                        "-keystore", keystoreFile.absolutePath,
                        "-alias", kAlias,
                        "-keyalg", "RSA",
                        "-keysize", "2048",
                        "-validity", "10000",
                        "-storepass", storePass,
                        "-keypass", kPass,
                        "-dname", "CN=TavanaRelease, OU=Forge, O=Tavana, L=Tehran, ST=Tehran, C=IR"
                    ).redirectErrorStream(true).start()
                    process.waitFor()
                } catch (e: Exception) {
                    println("Keystore auto-generation skipped: \${e.message}")
                }
            }

            if (keystoreFile.exists()) {
                storeFile = keystoreFile
                storePassword = storePass
                keyAlias = kAlias
                keyPassword = kPass
            }
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("release")
        }
        debug {
            isMinifyEnabled = false
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        viewBinding = true
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("com.google.android.material:material:1.12.0")
    implementation("androidx.webkit:webkit:1.12.1")
    implementation("androidx.constraintlayout:constraintlayout:2.2.0")
}
`.trim());

fs.writeFileSync(path.join(appDir, 'proguard-rules.pro'), `
-keepattributes JavascriptInterface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-dontwarn com.google.android.material.**
`.trim());

// 7. Source directory & Android Resources
const mainDir = path.join(appDir, 'src', 'main');
fs.mkdirSync(mainDir, { recursive: true });

const resDir = path.join(mainDir, 'res', 'values');
fs.mkdirSync(resDir, { recursive: true });

fs.writeFileSync(path.join(resDir, 'strings.xml'), `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">Tavana Forge</string>
</resources>`.trim());

fs.writeFileSync(path.join(resDir, 'themes.xml'), `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="Theme.App" parent="android:Theme.NoTitleBar">
        <item name="android:windowBackground">#0F172A</item>
    </style>
</resources>`.trim());

// 8. AndroidManifest.xml
fs.writeFileSync(path.join(mainDir, 'AndroidManifest.xml'), `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:icon="@android:drawable/sym_def_app_icon"
        android:label="@string/app_name"
        android:roundIcon="@android:drawable/sym_def_app_icon"
        android:supportsRtl="true"
        android:hardwareAccelerated="true"
        android:usesCleartextTraffic="true"
        android:theme="@style/Theme.App">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize|keyboardHidden|screenLayout"
            android:theme="@style/Theme.App">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`.trim());

// 9. MainActivity.kt (Robust native Activity that never crashes on launch)
const javaDir = path.join(mainDir, 'java', 'ir', 'tavana', 'forge');
fs.mkdirSync(javaDir, { recursive: true });

fs.writeFileSync(path.join(javaDir, 'MainActivity.kt'), `package ir.tavana.forge

import android.annotation.SuppressLint
import android.app.Activity
import android.graphics.Color
import android.os.Bundle
import android.view.ViewGroup
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient

class MainActivity : Activity() {

    private lateinit var webView: WebView

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        try {
            window.statusBarColor = Color.parseColor("#0F172A")
            window.navigationBarColor = Color.parseColor("#0F172A")
        } catch (_: Exception) {}

        webView = WebView(this).apply {
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
            setBackgroundColor(Color.parseColor("#0F172A"))
        }
        setContentView(webView)

        with(webView.settings) {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            allowFileAccess = true
            allowContentAccess = true
            allowFileAccessFromFileURLs = true
            allowUniversalAccessFromFileURLs = true
            useWideViewPort = true
            loadWithOverviewMode = true
            cacheMode = WebSettings.LOAD_DEFAULT
            builtInZoomControls = false
            displayZoomControls = false
        }

        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                return false
            }
        }

        webView.webChromeClient = WebChromeClient()
        webView.loadUrl("file:///android_asset/index.html")
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        if (this::webView.isInitialized && webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}
`.trim());

// 10. Assets
const assetsDir = path.join(mainDir, 'assets');
fs.mkdirSync(assetsDir, { recursive: true });

const indexHtml = `<!doctype html>
<html lang="${manifest.meta.language || 'fa'}" dir="${manifest.meta.rtl ? 'rtl' : 'ltr'}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <title>${manifest.meta.title}</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
${render.html}
    <script src="script.js"></script>
  </body>
</html>`;

fs.writeFileSync(path.join(assetsDir, 'index.html'), indexHtml);
fs.writeFileSync(path.join(assetsDir, 'style.css'), render.css);
fs.writeFileSync(path.join(assetsDir, 'script.js'), render.js);

console.log('✓ Android project generated successfully in:', outDir);
