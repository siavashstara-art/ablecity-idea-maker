/**
 * TAVANA PRODUCT FORGE - Manifest & Schema Definitions
 * The Manifest is the single source of truth for the site.
 * Pure data only. No executable code.
 */

export type SchemaVersion = 1;

export interface SiteMeta {
  title: string;
  description: string;
  language: 'fa' | 'en';
  rtl: boolean;
  favicon?: string;
  author?: string;
  packageName?: string;
  versionName?: string;
  versionCode?: number;
  enableCloudCache?: boolean;
}

export interface SiteTheme {
  primaryColor: string;     // e.g. '#f59e0b'
  accentColor: string;      // e.g. '#0284c7'
  backgroundColor: string;  // e.g. '#0b0f17' or '#ffffff'
  textColor: string;        // e.g. '#0f172a' or '#f8fafc'
  cardBackground: string;   // e.g. '#131b2e' or '#f8fafc'
  fontFamily: 'Vazirmatn' | 'IRANSans' | 'System';
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  darkMode: boolean;
}

export type BlockType =
  | 'hero'
  | 'features'
  | 'services'
  | 'gallery'
  | 'testimonials'
  | 'pricing'
  | 'faq'
  | 'contact'
  | 'about'
  | 'cta'
  | 'footer';

export interface BaseBlock {
  id: string;
  type: BlockType;
  visible: boolean;
  customId?: string; // HTML anchor id like #contact
}

// 1. Hero Block
export interface HeroBlock extends BaseBlock {
  type: 'hero';
  title: string;
  subtitle: string;
  badge?: string;
  ctaPrimary?: {
    text: string;
    link: string;
  };
  ctaSecondary?: {
    text: string;
    link: string;
  };
  imageUrl?: string;
  layout?: 'centered' | 'split-right' | 'split-left';
}

// 2. Features Block
export interface FeatureItem {
  id: string;
  icon: string; // Lucide icon name or emoji
  title: string;
  description: string;
}

export interface FeaturesBlock extends BaseBlock {
  type: 'features';
  title: string;
  subtitle?: string;
  items: FeatureItem[];
  columns?: 2 | 3 | 4;
}

// 3. Services Block
export interface ServiceItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  price?: string;
  badge?: string;
}

export interface ServicesBlock extends BaseBlock {
  type: 'services';
  title: string;
  subtitle?: string;
  items: ServiceItem[];
}

// 4. Gallery Block
export interface GalleryItem {
  id: string;
  imageUrl: string;
  title: string;
  caption?: string;
}

export interface GalleryBlock extends BaseBlock {
  type: 'gallery';
  title: string;
  subtitle?: string;
  items: GalleryItem[];
}

// 5. Testimonials Block
export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  quote: string;
  avatarUrl?: string;
  rating?: number; // 1-5
}

export interface TestimonialsBlock extends BaseBlock {
  type: 'testimonials';
  title: string;
  subtitle?: string;
  items: TestimonialItem[];
}

// 6. Pricing Block
export interface PricingItem {
  id: string;
  name: string;
  price: string;
  period?: string;
  description?: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
  ctaText: string;
  ctaLink: string;
}

export interface PricingBlock extends BaseBlock {
  type: 'pricing';
  title: string;
  subtitle?: string;
  items: PricingItem[];
}

// 7. FAQ Block
export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface FAQBlock extends BaseBlock {
  type: 'faq';
  title: string;
  subtitle?: string;
  items: FaqItem[];
}

// 8. Contact Block
export interface ContactBlock extends BaseBlock {
  type: 'contact';
  title: string;
  subtitle?: string;
  email?: string;
  phone?: string;
  address?: string;
  workingHours?: string;
  showForm: boolean;
  formButtonText?: string;
}

// 9. About Block
export interface AboutStatItem {
  id: string;
  label: string;
  value: string;
}

export interface AboutBlock extends BaseBlock {
  type: 'about';
  title: string;
  subtitle?: string;
  content: string;
  imageUrl?: string;
  stats?: AboutStatItem[];
}

// 10. CTA Block
export interface CtaBlock extends BaseBlock {
  type: 'cta';
  title: string;
  subtitle?: string;
  badge?: string;
  buttonText: string;
  buttonLink: string;
}

// 11. Footer Block
export interface FooterLink {
  id: string;
  title: string;
  url: string;
}

export interface SocialLink {
  id: string;
  platform: 'telegram' | 'instagram' | 'whatsapp' | 'twitter' | 'linkedin' | 'website';
  url: string;
}

export interface FooterBlock extends BaseBlock {
  type: 'footer';
  brandName: string;
  description?: string;
  copyright: string;
  links: FooterLink[];
  socialLinks?: SocialLink[];
}

export type Block =
  | HeroBlock
  | FeaturesBlock
  | ServicesBlock
  | GalleryBlock
  | TestimonialsBlock
  | PricingBlock
  | FAQBlock
  | ContactBlock
  | AboutBlock
  | CtaBlock
  | FooterBlock;

export interface SiteSettings {
  smoothScroll: boolean;
  backToTop: boolean;
  customCss?: string;
}

export interface SiteManifest {
  schemaVersion: SchemaVersion;
  projectId: string;
  type: 'website';
  meta: SiteMeta;
  theme: SiteTheme;
  backend: 'none';
  blocks: Block[];
  settings: SiteSettings;
  createdAt: string;
  updatedAt: string;
}
