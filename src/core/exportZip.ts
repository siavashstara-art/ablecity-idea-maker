import JSZip from 'jszip';
import { SiteManifest } from '../types/manifest';
import { renderStaticSite } from './renderer';

export async function generateProjectZip(manifest: SiteManifest): Promise<Blob> {
  const zip = new JSZip();
  const render = renderStaticSite(manifest);

  const webManifest = {
    name: manifest.meta.title,
    short_name: manifest.meta.title.slice(0, 12),
    description: manifest.meta.description || manifest.meta.title,
    start_url: './index.html',
    display: 'standalone',
    background_color: manifest.theme.backgroundColor || '#0b0f17',
    theme_color: manifest.theme.primaryColor || '#f59e0b',
    orientation: 'portrait-primary',
    dir: manifest.meta.rtl ? 'rtl' : 'ltr',
    lang: manifest.meta.language || 'fa',
    icons: [
      {
        src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=192&q=80',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=512&q=80',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      }
    ]
  };

  const serviceWorkerJs = `/**
 * TAVANA PWA & CLOUD CACHE SERVICE WORKER
 * Implements Stale-While-Revalidate caching strategy for instant loads & offline resilience.
 */
const CACHE_NAME = 'tavana-cache-v1';
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './site.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Stale-While-Revalidate: Return cached response immediately while fetching update in background
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cachedResponse = await cache.match(event.request);
      const networkFetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          cache.put(event.request, networkResponse.clone());
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || networkFetchPromise;
    })
  );
});
`;

  const edgeHeadersContent = `# Cloudflare Pages & Netlify Edge Cache Headers
/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: SAMEORIGIN
  Referrer-Policy: strict-origin-when-cross-origin

# Static assets: Cache for 1 year immutable
/*.css
  Cache-Control: public, max-age=31536000, immutable
/*.js
  Cache-Control: public, max-age=31536000, immutable
/*.png
  Cache-Control: public, max-age=31536000, immutable
/*.webp
  Cache-Control: public, max-age=31536000, immutable
/*.woff2
  Cache-Control: public, max-age=31536000, immutable

# HTML Documents: Must revalidate for instant updates
/index.html
  Cache-Control: public, max-age=0, must-revalidate
`;

  const htaccessContent = `# Apache & cPanel Cloud Cache Rules (.htaccess)
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresDefault "access plus 1 month"
  ExpiresByType text/html "access plus 0 seconds"
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType font/woff2 "access plus 1 year"
</IfModule>

<IfModule mod_headers.c>
  <FilesMatch "\\.(css|js|woff2|png|jpg|jpeg|webp)$">
    Header set Cache-Control "max-age=31536000, public, immutable"
  </FilesMatch>
  <FilesMatch "\\.(html|htm)$">
    Header set Cache-Control "max-age=0, must-revalidate"
  </FilesMatch>
</IfModule>
`;

  const cleanIndexHtml = `<!doctype html>
<html lang="${manifest.meta.language || 'fa'}" dir="${manifest.meta.rtl ? 'rtl' : 'ltr'}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${manifest.meta.title}</title>
    <meta name="description" content="${manifest.meta.description || ''}" />
    <meta name="theme-color" content="${manifest.theme.primaryColor || '#f59e0b'}" />
    <link rel="manifest" href="site.webmanifest" />

    <!-- OpenGraph / Social Metadata -->
    <meta property="og:title" content="${manifest.meta.title}" />
    <meta property="og:description" content="${manifest.meta.description || ''}" />
    <meta property="og:type" content="website" />

    <!-- Vazirmatn Persian Font -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
${render.html}
    <script src="script.js"></script>
    <script>
      // Register Cloud & Offline Cache Service Worker
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('./sw.js').then((reg) => {
            console.log('Tavana Cloud Cache ServiceWorker active:', reg.scope);
          }).catch((err) => {
            console.log('ServiceWorker registration skipped:', err);
          });
        });
      }
    </script>
  </body>
</html>`;

  const readmeContent = `# ${manifest.meta.title}
این وب‌سایت با استفاده از **TAVANA PRODUCT FORGE** (کوره ساخت محصول توانا) تولید شده است.

## ساختار فایل‌ها:
- \`index.html\`: سند اصلی وب‌سایت با معماری سمانتیک و واکنش‌گرا
- \`style.css\`: استایل‌های بهینه‌سازی‌شده و طراحی مدرن
- \`script.js\`: رفتارهای تعاملی فرانت‌اند (FAQ، هندلر فرم تماس، دکمه بازگشت به بالا)
- \`manifest.json\`: پرونده منبع حقیقت (Data Manifest) جهت ویرایش مجدد در کوره توانا

## نحوه اجرا و انتشار:
1. برای مشاهده، کافیست فایل \`index.html\` را در هر مرورگری (کامپیوتر یا موبایل) باز کنید.
2. برای استقرار آنلاین، می‌توانید این پوشه را مستقیماً روی سرورهای ابری نظیر Cloudflare Pages، GitHub Pages، Liara یا کنترل‌پنل cPanel بارگذاری کنید.

## نکات فنی و شفافیت عملکردی:
- **فرم تماس (Contact Form):** فرم تماس موجود در این بسته به صورت کاملاً فرانت‌اندی (استاتیک) پیاده شده است و برای جلوگیری از پیچیدگی و وابستگی به سرور در فاز MVP، پس از ثبت پیام بازخورد کلاینت نمایش می‌دهد و نیازمند اتصال بک‌اند یا وب‌هوک برای ارسال ایمیل است.
- **تصاویر خارجی (External Images):** در صورتی که در سایت از تصاویر آنلاین (مانند Unsplash) استفاده شده باشد، لود آن‌ها نیازمند اتصال اینترنت است. برای استفاده کاملاً آفلاین، فایل‌های تصویری را ذخیره کرده و آدرس محلی به آن‌ها بدهید.

تولید شده در: ${new Date().toLocaleString('fa-IR')}
توسط کوره ساخت محصول توانا (Tavana Product Forge)
`;

  // Add files to ZIP
  zip.file('index.html', cleanIndexHtml);
  zip.file('style.css', render.css);
  zip.file('script.js', render.js);
  zip.file('sw.js', serviceWorkerJs);
  zip.file('site.webmanifest', JSON.stringify(webManifest, null, 2));
  zip.file('_headers', edgeHeadersContent);
  zip.file('.htaccess', htaccessContent);
  zip.file('manifest.json', JSON.stringify(manifest, null, 2));
  zip.file('README.md', readmeContent);

  return await zip.generateAsync({ type: 'blob' });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
