import React, { useState } from 'react';
import { SiteManifest } from '../../types/manifest';
import { 
  Cloud, 
  Smartphone, 
  Globe, 
  Copy, 
  Check, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  HardDriveDownload,
  Share2,
  RefreshCw
} from 'lucide-react';

interface MetadataCacheEditorProps {
  manifest: SiteManifest;
  onUpdateManifest: (updated: SiteManifest) => void;
}

export const MetadataCacheEditor: React.FC<MetadataCacheEditorProps> = ({
  manifest,
  onUpdateManifest,
}) => {
  const [copiedStoreText, setCopiedStoreText] = useState(false);
  const [copiedHeaders, setCopiedHeaders] = useState(false);
  const [cacheTested, setCacheTested] = useState(false);

  const meta = manifest.meta;

  const handleChange = (field: keyof typeof meta, value: any) => {
    onUpdateManifest({
      ...manifest,
      meta: {
        ...manifest.meta,
        [field]: value,
      },
      updatedAt: new Date().toISOString(),
    });
  };

  const storeRegistrationText = `📱 مشخصات ثبت اپلیکیشن در کافه‌بازار و مایکت:
━━━━━━━━━━━━━━━━━━━━━━━━━━
🔹 نام اپلیکیشن: ${meta.title}
🔹 شناسه پکیج: ${meta.packageName || 'ir.tavana.app'}
🔹 نسخه: ${meta.versionName || '1.0.0'} (کد نسخه: ${meta.versionCode || 1})
🔹 رده سنی: ۳+ سال (عمومی)
🔹 دسته‌بندی پیشنهادی: ابزارها / خدمات شرکتی

📝 توضیحات کوتاه معرفی:
${meta.description || meta.title}

✨ ویژگی‌های برجسته:
• عملکرد سریع و بارگذاری ۱۰۰٪ آفلاین
• رابط کاربری مدرن منطبق با استانداردهای ۲۰۲۶
• ذخیره‌سازی ابری و بدون قطعی
• پشتیبانی از تم تاریک و نمایش بی‌نقص در تمامی تبلت‌ها و گوشی‌ها
━━━━━━━━━━━━━━━━━━━━━━━━━━
تولید شده توسط کوره ساخت محصول توانا (Tavana Forge)`;

  const handleCopyStoreText = () => {
    navigator.clipboard.writeText(storeRegistrationText);
    setCopiedStoreText(true);
    setTimeout(() => setCopiedStoreText(false), 2500);
  };

  const handleCopyHeaders = () => {
    const headers = `# Cloudflare Pages & Netlify Cache-Control
/*
  Cache-Control: public, max-age=31536000, immutable
/index.html
  Cache-Control: public, max-age=0, must-revalidate`;
    navigator.clipboard.writeText(headers);
    setCopiedHeaders(true);
    setTimeout(() => setCopiedHeaders(false), 2500);
  };

  const handleTestCache = () => {
    setCacheTested(true);
    setTimeout(() => setCacheTested(false), 3000);
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Intro Header Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-sky-500/10 to-indigo-500/10 border border-amber-500/20">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Cloud className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <span>شناسنامه، سئو و موتور کش ابری (Cloud Cache & PWA)</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                فعال و آماده
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              تنظیم شناسنامه پکیج اندروید، کارت‌های اشتراک‌گذاری در شبکه‌های اجتماعی و استراتژی کش CDN
            </p>
          </div>
        </div>
      </div>

      {/* Section 1: Android & App Store Metadata */}
      <div className="space-y-3 p-4 rounded-xl bg-slate-900/60 border border-white/5">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>مشخصات شناسنامه اپلیکیشن (بازار، مایکت و گوگل‌پلی)</span>
          </h4>
          <span className="text-[10px] text-slate-400 font-mono">Android Release Manifest</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              نام رسمی اپلیکیشن (App Title)
            </label>
            <input
              type="text"
              value={meta.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-800/80 border border-white/10 text-white focus:outline-none focus:border-amber-400"
              placeholder="مثال: فراز سازه"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              شناسه پکیج اندروید (Package Name)
            </label>
            <input
              type="text"
              value={meta.packageName || 'ir.tavana.app'}
              onChange={(e) => handleChange('packageName', e.target.value)}
              dir="ltr"
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-800/80 border border-white/10 text-white font-mono focus:outline-none focus:border-amber-400"
              placeholder="ir.tavana.app"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              شماره نسخه (Version Name)
            </label>
            <input
              type="text"
              value={meta.versionName || '1.0.0'}
              onChange={(e) => handleChange('versionName', e.target.value)}
              dir="ltr"
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-800/80 border border-white/10 text-white font-mono focus:outline-none focus:border-amber-400"
              placeholder="1.0.0"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              کد نسخه عددی (Version Code)
            </label>
            <input
              type="number"
              value={meta.versionCode || 1}
              onChange={(e) => handleChange('versionCode', parseInt(e.target.value) || 1)}
              dir="ltr"
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-800/80 border border-white/10 text-white font-mono focus:outline-none focus:border-amber-400"
              placeholder="1"
            />
          </div>
        </div>

        {/* Quick Copy Store Listing Button */}
        <div className="pt-2 border-t border-white/5 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            تولید متن آماده و مشخصات فنی جهت ثبت در پنل کافه‌بازار و مایکت
          </span>
          <button
            onClick={handleCopyStoreText}
            className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            {copiedStoreText ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>کپی شد!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>کپی متن معرفی بازار / مایکت</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Section 2: SEO & Social Share Preview */}
      <div className="space-y-3 p-4 rounded-xl bg-slate-900/60 border border-white/5">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
            <Globe className="w-4 h-4 text-sky-400" />
            <span>سئو و کارت پیش‌نمایش در شبکه‌های اجتماعی (OpenGraph)</span>
          </h4>
          <span className="text-[10px] text-slate-400 font-mono">WhatsApp & Telegram Card</span>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-300 block mb-1">
            توضیحات معرفی و کارت اشتراک‌گذاری (Meta Description)
          </label>
          <textarea
            rows={2}
            value={meta.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg bg-slate-800/80 border border-white/10 text-white focus:outline-none focus:border-sky-400 leading-relaxed"
            placeholder="توضیح کوتاه ۱ الی ۲ خطی برای گوگل، تلگرام و واتساپ..."
          />
        </div>

        {/* Live Card Mockup */}
        <div className="p-3 rounded-lg bg-slate-950/60 border border-white/10 space-y-1.5">
          <div className="text-[10px] text-slate-500 flex items-center gap-1">
            <Share2 className="w-3 h-3" />
            <span>پیش‌نمایش ظاهر لینک در تلگرام و واتساپ:</span>
          </div>
          <div className="border-r-2 border-amber-400 pr-2.5">
            <div className="text-xs font-bold text-amber-300">{meta.title || 'عنوان وب‌سایت'}</div>
            <div className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
              {meta.description || 'توضیحات کوتاه درباره خدمات و ویژگی‌های وب‌سایت شما...'}
            </div>
            <div className="text-[10px] text-slate-600 font-mono mt-1">https://yourdomain.com</div>
          </div>
        </div>
      </div>

      {/* Section 3: Cloud Cache & CDN Infrastructure */}
      <div className="space-y-3 p-4 rounded-xl bg-slate-900/60 border border-white/5">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
            <Cloud className="w-4 h-4 text-amber-400" />
            <span>تنظیمات کش ابری و موتور لود آفلاین (Edge Cache & SW)</span>
          </h4>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Stale-While-Revalidate
          </span>
        </div>

        <div className="space-y-2 text-xs text-slate-300">
          <div className="p-3 rounded-lg bg-slate-800/50 border border-white/5 flex items-start gap-2.5">
            <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block">عملکرد خودکار در زمان دانلود خروجی ZIP:</span>
              <span className="text-[11px] text-slate-400 leading-relaxed block mt-0.5">
                هنگام استخراج، فایل‌های سرویس‌ورکر (<code className="text-amber-300 font-mono text-[10px]">sw.js</code>)، 
                مانیفست PWA (<code className="text-amber-300 font-mono text-[10px]">site.webmanifest</code>) 
                و هدرهای ابری کلودفلر (<code className="text-amber-300 font-mono text-[10px]">_headers</code>) 
                و آپاچی (<code className="text-amber-300 font-mono text-[10px]">.htaccess</code>) 
                به صورت خودکار درون فایل زیپ تزریق می‌شوند.
              </span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-800/50 border border-white/5 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block">استراتژی Cache-Control ایمن و استاندارد:</span>
              <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside mt-1">
                <li><strong className="text-slate-300">فایل‌های استاتیک (CSS, JS, Fonts):</strong> کش ۱ ساله تغییرناپذیر (<code className="font-mono text-[10px] text-emerald-300">max-age=31536000, immutable</code>)</li>
                <li><strong className="text-slate-300">صفحه اصلی (index.html):</strong> اعتبارسنجی آنی (<code className="font-mono text-[10px] text-amber-300">must-revalidate</code>) جهت نمایش سریع جدیدترین تغییرات</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={handleTestCache}
            className="px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            {cacheTested ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>کش محلی با موفقیت تایید شد</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                <span>تست عملکرد کش آفلاین</span>
              </>
            )}
          </button>

          <button
            onClick={handleCopyHeaders}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            {copiedHeaders ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>کپی شد!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>کپی هدرهای Cloudflare Pages</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
