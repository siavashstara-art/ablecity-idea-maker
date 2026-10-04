plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "ir.tavana.forge.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "ir.tavana.forge.app"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"

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
                    println("Keystore auto-generation skipped: ${e.message}")
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