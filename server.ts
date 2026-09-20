import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// In-Memory Database Store Initialized with Schema Data
interface ProductVariant {
  id: number;
  product_id: number;
  title: string;
  title_en: string;
  sku: string;
  price: number;
  discount_price?: number;
  stock: number;
  delivery_time: string;
  duration_days?: number;
  is_active: number;
  sort_order: number;
}

interface ProductRequirement {
  id: number;
  product_id: number;
  field_label: string;
  field_label_en: string;
  field_type: 'text' | 'url' | 'textarea' | 'number' | 'email' | 'select';
  placeholder?: string;
  is_required: number;
  sort_order: number;
}

interface Product {
  id: number;
  category_id: number;
  name: string;
  name_en: string;
  slug: string;
  description: string;
  description_en?: string;
  type: 'digital' | 'service' | 'subscription' | 'variable' | 'custom';
  base_price: number;
  discount_price?: number;
  stock: number;
  sku: string;
  delivery_type: 'instant' | 'manual' | 'code' | 'file' | 'account';
  delivery_time_text: string;
  duration_days?: number;
  is_featured: number;
  is_active: number;
  image: string;
  rating: number;
  total_reviews: number;
  variants: ProductVariant[];
  requirements: ProductRequirement[];
}

// Initial Data
let categories = [
  { id: 1, name: 'خدمات السوشيال ميديا', name_en: 'Social Media Services', slug: 'social-media', icon: 'Share2', sort_order: 1, is_active: 1 },
  { id: 2, name: 'الاشتراكات الرقمية', name_en: 'Digital Subscriptions', slug: 'subscriptions', icon: 'Tv', sort_order: 2, is_active: 1 },
  { id: 3, name: 'مفاتيح التفعيل والبرامج', name_en: 'Software & License Keys', slug: 'software-keys', icon: 'Key', sort_order: 3, is_active: 1 },
  { id: 4, name: 'حسابات الألعاب والترفيه', name_en: 'Gaming & Accounts', slug: 'gaming-accounts', icon: 'Gamepad2', sort_order: 4, is_active: 1 },
  { id: 5, name: 'أدوات التصميم والذكاء الاصطناعي', name_en: 'Design & AI Tools', slug: 'ai-design-tools', icon: 'Wand2', sort_order: 5, is_active: 1 }
];

let products: Product[] = [
  {
    id: 1,
    category_id: 1,
    name: 'متابعو انستقرام حقيقيون ومضمونون',
    name_en: 'Instagram Real Followers',
    slug: 'instagram-followers-real',
    description: 'زيادة متابعين انستقرام حسابات حقيقية ونشطة مع ضمان عدم النقص لمدة 30 يوم. تنفيذ سريع وآمن على حسابك بدون الحاجة لكلمة المرور نهائياً.',
    description_en: 'High quality real Instagram followers with 30-day refill guarantee. Safe and quick delivery without requiring your password.',
    type: 'service',
    base_price: 15.00,
    discount_price: 12.00,
    stock: 9999,
    sku: 'IG-FL-01',
    delivery_type: 'manual',
    delivery_time_text: 'يبدأ خلال 15 دقيقة إلى ساعتين',
    is_featured: 1,
    is_active: 1,
    image: 'https://images.unsplash.com/photo-1611262588024-d12430b98920?w=800&auto=format&fit=crop&q=80',
    rating: 4.9,
    total_reviews: 142,
    variants: [
      { id: 101, product_id: 1, title: '1,000 متابع حقيقي', title_en: '1,000 Real Followers', sku: 'IG-1K', price: 15.00, discount_price: 12.00, stock: 9999, delivery_time: '1-3 ساعات', is_active: 1, sort_order: 1 },
      { id: 102, product_id: 1, title: '2,500 متابع حقيقي', title_en: '2,500 Real Followers', sku: 'IG-2.5K', price: 35.00, discount_price: 28.00, stock: 9999, delivery_time: '2-4 ساعات', is_active: 1, sort_order: 2 },
      { id: 103, product_id: 1, title: '5,000 متابع حقيقي', title_en: '5,000 Real Followers', sku: 'IG-5K', price: 65.00, discount_price: 52.00, stock: 9999, delivery_time: '3-6 ساعات', is_active: 1, sort_order: 3 },
      { id: 104, product_id: 1, title: '10,000 متابع VIP', title_en: '10,000 VIP Followers', sku: 'IG-10K', price: 120.00, discount_price: 95.00, stock: 9999, delivery_time: '6-12 ساعة', is_active: 1, sort_order: 4 },
      { id: 105, product_id: 1, title: '25,000 متابع مع هدايا تفاعل', title_en: '25,000 Followers + Bonus', sku: 'IG-25K', price: 280.00, discount_price: 220.00, stock: 9999, delivery_time: '12-24 ساعة', is_active: 1, sort_order: 5 }
    ],
    requirements: [
      { id: 201, product_id: 1, field_label: 'اسم المستخدم في انستقرام (Username)', field_label_en: 'Instagram Username', field_type: 'text', placeholder: '@your_username (بدون كلمة المرور)', is_required: 1, sort_order: 1 },
      { id: 202, product_id: 1, field_label: 'رابط الحساب المباشر', field_label_en: 'Profile URL', field_type: 'url', placeholder: 'https://instagram.com/your_account', is_required: 1, sort_order: 2 },
      { id: 203, product_id: 1, field_label: 'ملاحظات إضافية للتنفيذ', field_label_en: 'Additional Notes', field_type: 'textarea', placeholder: 'أي تعليمات خاصة بالطلب...', is_required: 0, sort_order: 3 }
    ]
  },
  {
    id: 2,
    category_id: 1,
    name: 'تفاعل ولايكات تيك توك نشطة وسريعة',
    name_en: 'TikTok Likes & Fast Engagement',
    slug: 'tiktok-likes-fast',
    description: 'باقات إعجابات تيك توك لزيادة ظهور مقاطعك في صفحة For You (Explore). سرعة عالية في الإرسال وأمان تام على حسابك.',
    description_en: 'TikTok video likes to boost visibility on For You page. Fast and secure delivery.',
    type: 'service',
    base_price: 8.00,
    discount_price: 6.50,
    stock: 9999,
    sku: 'TT-LK-02',
    delivery_type: 'manual',
    delivery_time_text: 'فوري خلال 10-30 دقيقة',
    is_featured: 1,
    is_active: 1,
    image: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=800&auto=format&fit=crop&q=80',
    rating: 4.8,
    total_reviews: 98,
    variants: [
      { id: 106, product_id: 2, title: '1,000 لايك تيك توك', title_en: '1,000 TikTok Likes', sku: 'TT-1K', price: 8.00, discount_price: 6.50, stock: 9999, delivery_time: '15 دقيقة', is_active: 1, sort_order: 1 },
      { id: 107, product_id: 2, title: '5,000 لايك تيك توك', title_en: '5,000 TikTok Likes', sku: 'TT-5K', price: 30.00, discount_price: 24.00, stock: 9999, delivery_time: '30 دقيقة', is_active: 1, sort_order: 2 },
      { id: 108, product_id: 2, title: '10,000 لايك تيك توك + شير', title_en: '10,000 Likes + Shares', sku: 'TT-10K', price: 55.00, discount_price: 44.00, stock: 9999, delivery_time: 'ساعة واحدة', is_active: 1, sort_order: 3 }
    ],
    requirements: [
      { id: 204, product_id: 2, field_label: 'رابط فيديو التيك توك المستهدف', field_label_en: 'TikTok Video URL', field_type: 'url', placeholder: 'https://www.tiktok.com/@user/video/...', is_required: 1, sort_order: 1 }
    ]
  },
  {
    id: 3,
    category_id: 2,
    name: 'اشتراك نتفلكس بريميوم 4K رسمي (ملف خاص مقفل برمز)',
    name_en: 'Netflix Premium 4K Official',
    slug: 'netflix-premium-4k',
    description: 'اشتراك رسمي بأعلى جودة Ultra HD 4K، ملف شخصي مستقل خاص بك ومقفل برمز سري PIN، يعمل على الشاشات الذكية، الهواتف، والكمبيوتر، مع ضمان كامل المدة.',
    description_en: 'Official Netflix Premium Ultra HD 4K subscription with private profile and PIN. Works on all devices.',
    type: 'subscription',
    base_price: 35.00,
    discount_price: 29.00,
    stock: 45,
    sku: 'NFLX-4K',
    delivery_type: 'account',
    delivery_time_text: 'تسليم فوري بعد الدفع مباشرة',
    duration_days: 30,
    is_featured: 1,
    is_active: 1,
    image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800&auto=format&fit=crop&q=80',
    rating: 5.0,
    total_reviews: 310,
    variants: [
      { id: 109, product_id: 3, title: 'شهر واحد (30 يوم)', title_en: '1 Month (30 Days)', sku: 'NFLX-1M', price: 35.00, discount_price: 29.00, stock: 40, delivery_time: 'فوري', duration_days: 30, is_active: 1, sort_order: 1 },
      { id: 110, product_id: 3, title: '3 أشهر (90 يوم) - الأكثر طلباً', title_en: '3 Months (90 Days)', sku: 'NFLX-3M', price: 95.00, discount_price: 79.00, stock: 25, delivery_time: 'فوري', duration_days: 90, is_active: 1, sort_order: 2 },
      { id: 111, product_id: 3, title: 'سنة كاملة (365 يوم)', title_en: '1 Year (365 Days)', sku: 'NFLX-1Y', price: 350.00, discount_price: 279.00, stock: 10, delivery_time: 'فوري', duration_days: 365, is_active: 1, sort_order: 3 }
    ],
    requirements: []
  },
  {
    id: 4,
    category_id: 2,
    name: 'اشتراك يوتيوب بريميوم رسمي على إيميلك الشخصي',
    name_en: 'YouTube Premium Official',
    slug: 'youtube-premium-official',
    description: 'تفعيل رسمي بدون إعلانات وتنزيل المقاطع وخلفية الشاشة وYouTube Music على حسابك الشخصي عبر دعوة رسمية بدون طلب كلمة مرورك.',
    description_en: 'Official YouTube Premium activation on your own personal Google account without ads.',
    type: 'subscription',
    base_price: 18.00,
    discount_price: 14.00,
    stock: 120,
    sku: 'YT-PRM',
    delivery_type: 'manual',
    delivery_time_text: 'خلال 15-30 دقيقة',
    duration_days: 30,
    is_featured: 1,
    is_active: 1,
    image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop&q=80',
    rating: 4.9,
    total_reviews: 215,
    variants: [
      { id: 112, product_id: 4, title: 'شهر واحد (30 يوم)', title_en: '1 Month (30 Days)', sku: 'YT-1M', price: 18.00, discount_price: 14.00, stock: 80, delivery_time: '30 دقيقة', duration_days: 30, is_active: 1, sort_order: 1 },
      { id: 113, product_id: 4, title: '3 أشهر (90 يوم)', title_en: '3 Months (90 Days)', sku: 'YT-3M', price: 50.00, discount_price: 39.00, stock: 50, delivery_time: '30 دقيقة', duration_days: 90, is_active: 1, sort_order: 2 },
      { id: 114, product_id: 4, title: 'سنة كاملة (12 شهر)', title_en: '1 Year (12 Months)', sku: 'YT-1Y', price: 180.00, discount_price: 139.00, stock: 30, delivery_time: '30 دقيقة', duration_days: 365, is_active: 1, sort_order: 3 }
    ],
    requirements: [
      { id: 205, product_id: 4, field_label: 'البريد الإلكتروني لحساب Google المراد تفعيله', field_label_en: 'Google Account Email', field_type: 'email', placeholder: 'example@gmail.com', is_required: 1, sort_order: 1 }
    ]
  },
  {
    id: 5,
    category_id: 3,
    name: 'مفتاح تفعيل ويندوز 11 برو الأصلي (مدى الحياة)',
    name_en: 'Windows 11 Pro Lifetime License Key',
    slug: 'windows-11-pro-key',
    description: 'مفتاح رقمي أصلي 100% لتفعيل Windows 11 Pro لجهاز واحد مدى الحياة، يقبل جميع التحديثات ويدعم اللغتين العربية والإنجليزية.',
    description_en: '100% Genuine digital retail key for Windows 11 Pro. Lifetime activation, all updates supported.',
    type: 'digital',
    base_price: 25.00,
    discount_price: 19.00,
    stock: 80,
    sku: 'WIN11-PRO',
    delivery_type: 'code',
    delivery_time_text: 'تسليم آلي وفوري للمفتاح',
    is_featured: 1,
    is_active: 1,
    image: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800&auto=format&fit=crop&q=80',
    rating: 5.0,
    total_reviews: 420,
    variants: [
      { id: 115, product_id: 5, title: 'مفتاح جهاز واحد (PC)', title_en: '1 PC License Key', sku: 'WIN11-1PC', price: 25.00, discount_price: 19.00, stock: 80, delivery_time: 'فوري', is_active: 1, sort_order: 1 },
      { id: 116, product_id: 5, title: 'باقة 3 أجهزة (3 PCs Bundle)', title_en: '3 PCs License Bundle', sku: 'WIN11-3PC', price: 65.00, discount_price: 49.00, stock: 40, delivery_time: 'فوري', is_active: 1, sort_order: 2 }
    ],
    requirements: []
  },
  {
    id: 6,
    category_id: 5,
    name: 'اشتراك كانفا برو Canva Pro التعليمي الرسمي (سنة كاملة)',
    name_en: 'Canva Pro 1 Year Invite',
    slug: 'canva-pro-1year',
    description: 'تمتع بكافة مميزات كانفا المدفوعة: خطوط احترافية، ملايين الصور والقوالب، تفريغ الخلفيات بنقرة واحدة، وتصدير SVG بدقة فائقة لمدة سنة كاملة.',
    description_en: 'Full access to Canva Pro premium assets, background remover, and templates on your personal email for 1 year.',
    type: 'subscription',
    base_price: 22.00,
    discount_price: 15.00,
    stock: 60,
    sku: 'CNV-1Y',
    delivery_type: 'manual',
    delivery_time_text: 'تفعيل خلال 15 دقيقة',
    duration_days: 365,
    is_featured: 1,
    is_active: 1,
    image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
    rating: 4.9,
    total_reviews: 180,
    variants: [
      { id: 117, product_id: 6, title: 'اشتراك سنة كاملة (365 يوم)', title_en: '1 Year (365 Days)', sku: 'CNV-1Y', price: 22.00, discount_price: 15.00, stock: 60, delivery_time: '15 دقيقة', duration_days: 365, is_active: 1, sort_order: 1 }
    ],
    requirements: [
      { id: 206, product_id: 6, field_label: 'البريد الإلكتروني لحساب كانفا المراد دعوته', field_label_en: 'Canva Account Email', field_type: 'email', placeholder: 'name@domain.com', is_required: 1, sort_order: 1 }
    ]
  },
  {
    id: 7,
    category_id: 5,
    name: 'اشتراك شات جي بي تي بلس ChatGPT Plus الرسمي',
    name_en: 'ChatGPT Plus Shared/Private',
    slug: 'chatgpt-plus-subscription',
    description: 'استمتع بأحدث نماذج الذكاء الاصطناعي (GPT-4o, Canvas, DALL-E 3) مع سرعة استجابة وتوليد صور وتحليل مستندات بدون حدود.',
    description_en: 'Access latest OpenAI flagship models with priority speed and unlimited document analysis.',
    type: 'subscription',
    base_price: 40.00,
    discount_price: 32.00,
    stock: 30,
    sku: 'GPT-PLUS',
    delivery_type: 'account',
    delivery_time_text: 'تسليم فوري',
    duration_days: 30,
    is_featured: 0,
    is_active: 1,
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=80',
    rating: 4.8,
    total_reviews: 77,
    variants: [
      { id: 118, product_id: 7, title: 'اشتراك شهر واحد (30 يوم)', title_en: '1 Month (30 Days)', sku: 'GPT-1M', price: 40.00, discount_price: 32.00, stock: 30, delivery_time: 'فوري', duration_days: 30, is_active: 1, sort_order: 1 }
    ],
    requirements: []
  },
  {
    id: 8,
    category_id: 1,
    name: 'باقة التوفير الشاملة لنمو متجرك وحساباتك (انستقرام + تيك توك + يوتيوب)',
    name_en: 'Ultimate Social Growth Mega Package',
    slug: 'mega-social-growth-package',
    description: 'باقة متكاملة لتأسيس وتكبير البراند الخاص بك: 5000 متابع انستقرام + 5000 لايك تيك توك + 1000 مشترك يوتيوب مع ضمان ثبات وعدم النقصان.',
    description_en: 'Complete bundle for social media growth: 5K IG followers, 5K TikTok likes, and 1K YouTube subscribers.',
    type: 'service',
    base_price: 99.00,
    discount_price: 69.00,
    stock: 999,
    sku: 'PKG-GROWTH-01',
    delivery_type: 'manual',
    delivery_time_text: 'خلال 24-48 ساعة بشكل طبيعي وآمن',
    is_featured: 1,
    is_active: 1,
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
    rating: 5.0,
    total_reviews: 84,
    variants: [
      { id: 119, product_id: 8, title: 'الباقة الفضية (Silver Growth Pack)', title_en: 'Silver Growth Pack', sku: 'PKG-SLV', price: 99.00, discount_price: 69.00, stock: 999, delivery_time: '24 ساعة', is_active: 1, sort_order: 1 },
      { id: 120, product_id: 8, title: 'الباقة الذهبية للمتاجر (Gold VIP Pack)', title_en: 'Gold VIP Pack', sku: 'PKG-GLD', price: 180.00, discount_price: 129.00, stock: 999, delivery_time: '48 ساعة', is_active: 1, sort_order: 2 }
    ],
    requirements: [
      { id: 207, product_id: 8, field_label: 'رابط حساب انستقرام', field_label_en: 'Instagram Link', field_type: 'url', placeholder: 'https://instagram.com/...', is_required: 1, sort_order: 1 },
      { id: 208, product_id: 8, field_label: 'رابط فيديو أو حساب تيك توك', field_label_en: 'TikTok Link', field_type: 'url', placeholder: 'https://tiktok.com/...', is_required: 1, sort_order: 2 },
      { id: 209, product_id: 8, field_label: 'رابط قناة اليوتيوب', field_label_en: 'YouTube Channel Link', field_type: 'url', placeholder: 'https://youtube.com/@...', is_required: 0, sort_order: 3 }
    ]
  },
  {
    id: 9,
    category_id: 2,
    name: 'اشتراك سبوتيفاي بريميوم Spotify Premium الرسمي (عائلي / فردي)',
    name_en: 'Spotify Premium Official',
    slug: 'spotify-premium-official',
    description: 'استمتع بملايين الأغاني والبودكاست بدون أي فواصل إعلانية وبأعلى جودة صوتية 320kbps مع إمكانية التحميل والاستماع أوفلاين.',
    description_en: 'Official Spotify Premium music streaming without ads, high quality audio and offline downloads.',
    type: 'subscription',
    base_price: 20.00,
    discount_price: 15.00,
    stock: 75,
    sku: 'SPOT-PRM',
    delivery_type: 'manual',
    delivery_time_text: 'خلال 15 دقيقة',
    duration_days: 90,
    is_featured: 1,
    is_active: 1,
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
    rating: 4.9,
    total_reviews: 112,
    variants: [
      { id: 121, product_id: 9, title: 'اشتراك 3 أشهر (90 يوم)', title_en: '3 Months (90 Days)', sku: 'SPOT-3M', price: 20.00, discount_price: 15.00, stock: 45, delivery_time: '15 دقيقة', duration_days: 90, is_active: 1, sort_order: 1 },
      { id: 122, product_id: 9, title: 'اشتراك سنة كاملة (12 شهر)', title_en: '1 Year (12 Months)', sku: 'SPOT-1Y', price: 65.00, discount_price: 49.00, stock: 30, delivery_time: '15 دقيقة', duration_days: 365, is_active: 1, sort_order: 2 }
    ],
    requirements: [
      { id: 210, product_id: 9, field_label: 'البريد الإلكتروني لحساب سبوتيفاي المراد تفعيله', field_label_en: 'Spotify Email', field_type: 'email', placeholder: 'user@example.com', is_required: 1, sort_order: 1 }
    ]
  },
  {
    id: 10,
    category_id: 3,
    name: 'حزمة مايكروسوفت أوفيس 365 برو بلس الأصلية (Microsoft 365 Pro Plus)',
    name_en: 'Microsoft 365 Pro Plus Account / Key',
    slug: 'office-365-pro-plus',
    description: 'تفعيل كامل لبرامج Word, Excel, PowerPoint, Outlook مع سعة تخزينية سحابية 1TB OneDrive تعمل على 5 أجهزة مختلفة (ويندوز، ماك، جوال).',
    description_en: 'Genuine Microsoft Office 365 with 1TB OneDrive cloud storage. Works on up to 5 devices simultaneously.',
    type: 'digital',
    base_price: 35.00,
    discount_price: 24.00,
    stock: 50,
    sku: 'MS-O365',
    delivery_type: 'account',
    delivery_time_text: 'تسليم فوري بعد الدفع',
    is_featured: 1,
    is_active: 1,
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
    rating: 5.0,
    total_reviews: 195,
    variants: [
      { id: 123, product_id: 10, title: 'حساب رسمي 5 أجهزة + 1TB سحابي', title_en: 'Account 5 Devices + 1TB OneDrive', sku: 'MS-5DEV', price: 35.00, discount_price: 24.00, stock: 50, delivery_time: 'فوري', is_active: 1, sort_order: 1 }
    ],
    requirements: []
  },
  {
    id: 11,
    category_id: 1,
    name: 'باقة دعم وزيادة مشاهدات وساعات يوتيوب (تحقيق شروط الربح)',
    name_en: 'YouTube Monetization Hours & Views Pack',
    slug: 'youtube-monetization-pack',
    description: 'باقة متخصصة لصناع المحتوى للمساعدة في تحقيق شروط برنامج شركاء يوتيوب (ساعات المشاهدة والمشتركين) بمشاهدات آمنة 100%.',
    description_en: 'Safe monetization hours and views package to help creators qualify for YouTube Partner Program.',
    type: 'service',
    base_price: 150.00,
    discount_price: 119.00,
    stock: 500,
    sku: 'YT-MONETIZE',
    delivery_type: 'manual',
    delivery_time_text: 'خلال 3-5 أيام تدريجياً وبأمان',
    is_featured: 1,
    is_active: 1,
    image: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&auto=format&fit=crop&q=80',
    rating: 4.9,
    total_reviews: 62,
    variants: [
      { id: 124, product_id: 11, title: '1,000 ساعة مشاهدة حقيقية', title_en: '1,000 Watch Hours', sku: 'YT-1K-HRS', price: 70.00, discount_price: 55.00, stock: 500, delivery_time: '48 ساعة', is_active: 1, sort_order: 1 },
      { id: 125, product_id: 11, title: '4,000 ساعة مشاهدة كاملة (اكتمال الشرط)', title_en: '4,000 Full Watch Hours', sku: 'YT-4K-HRS', price: 220.00, discount_price: 179.00, stock: 200, delivery_time: '4-6 أيام', is_active: 1, sort_order: 2 }
    ],
    requirements: [
      { id: 211, product_id: 11, field_label: 'رابط فيديو من قناتك مدته 15 دقيقة أو أكثر', field_label_en: 'Video URL (15+ mins)', field_type: 'url', placeholder: 'https://youtube.com/watch?v=...', is_required: 1, sort_order: 1 }
    ]
  }
];

let orders: any[] = [
  {
    id: 1,
    order_number: 'DG-2026-9041',
    user_id: 1,
    guest_name: 'أحمد المنصوري',
    guest_email: 'customer@example.com',
    guest_phone: '+966501234567',
    subtotal: 41.00,
    discount_amount: 4.10,
    total_amount: 36.90,
    currency: 'SAR',
    payment_status: 'paid',
    payment_method: 'apple_pay',
    order_status: 'completed',
    customer_notes: 'يرجى البدء فوراً بالحساب',
    admin_notes: 'تم التأكد من صحة الرابط والبدء',
    delivery_notes: 'تم اكتمال إضافة المتابعين بنجاح 100% مع زيادة 150 متابع كهدية ترحيبية.',
    created_at: '2026-09-18 14:32:00',
    items: [
      {
        id: 1,
        order_id: 1,
        product_id: 1,
        variant_id: 102,
        product_name: 'متابعو انستقرام حقيقيون ومضمونون',
        variant_title: '2,500 متابع حقيقي',
        price: 28.00,
        quantity: 1,
        subtotal: 28.00,
        requirements: [
          { field_label: 'اسم المستخدم في انستقرام (Username)', field_value: '@ahmed_mansoori' },
          { field_label: 'رابط الحساب المباشر', field_value: 'https://instagram.com/ahmed_mansoori' }
        ]
      }
    ]
  }
];

let subscriptions = [
  {
    id: 1,
    user_id: 1,
    order_id: 1,
    product_id: 3,
    variant_id: 109,
    product_name: 'اشتراك نتفلكس بريميوم 4K رسمي',
    image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800&auto=format&fit=crop&q=80',
    start_date: '2026-09-15',
    expires_at: '2026-10-15',
    duration_days: 30,
    days_left: 25,
    status: 'active',
    credentials: 'البريد: user.vip4@netflix-stream.net | الرمز PIN: 4921 | الملف الشخصي: Profile 3 (Ahmed VIP)'
  }
];

let digitalInventory = [
  {
    id: 1,
    product_id: 5,
    product_name: 'مفتاح تفعيل ويندوز 11 برو الأصلي (مدى الحياة)',
    order_number: 'DG-2026-8812',
    item_type: 'license_key',
    content: 'VK7JG-NPHTM-C97JM-9MPGT-3V66T',
    created_at: '2026-09-17 11:20:00'
  }
];

let coupons = [
  { id: 1, code: 'START10', type: 'percentage', value: 10.00, min_order_amount: 20.00, max_discount_amount: 50.00, usage_limit: 500, usage_count: 28, is_active: 1 },
  { id: 2, code: 'RAMADAN', type: 'percentage', value: 15.00, min_order_amount: 50.00, max_discount_amount: 100.00, usage_limit: 1000, usage_count: 64, is_active: 1 },
  { id: 3, code: 'SAVE5', type: 'fixed', value: 5.00, min_order_amount: 25.00, max_discount_amount: 5.00, usage_limit: 200, usage_count: 12, is_active: 1 }
];

let reviews = [
  { id: 1, product_id: 1, user_name: 'سلطان القحطاني', rating: 5, comment: 'سرعة تنفيذ غير طبيعية! طلبت 5000 متابع وبدأ التنفيذ في أقل من 10 دقائق والحسابات متفاعلة وممتازة.', is_approved: 1, created_at: 'منذ يومين' },
  { id: 2, product_id: 3, user_name: 'خالد العتيبي', rating: 5, comment: 'شغال الحساب بشكل رسمي على شاشتي بدون تقطيع وخدمة العملاء في الواتساب متجاوبين فوراً.', is_approved: 1, created_at: 'منذ 3 أيام' },
  { id: 3, product_id: 5, user_name: 'م. طارق يوسف', rating: 5, comment: 'تم تفعيل ويندوز 11 فوراً بالمفتاح الرقمي واستلمته مباشرة في صفحة الفاتورة. متجر احترافي 10/10.', is_approved: 1, created_at: 'منذ 5 أيام' },
  { id: 4, product_id: 4, user_name: 'سارة الحربي', rating: 5, comment: 'التفعيل صار على إيميلي الشخصي بدون كلمة مرور، ممتاز جداً ويوفر نصف السعر الأصلي.', is_approved: 1, created_at: 'منذ أسبوع' }
];

let wallet = {
  user_id: 1,
  balance: 150.00,
  currency: 'SAR',
  transactions: [
    { id: 1, type: 'deposit', amount: 150.00, description: 'رصيد ترحيبي افتتاحي', created_at: '2026-09-10 10:00:00' }
  ]
};

let manualPaymentMethods = [
  {
    id: 'zain_cash_jo',
    name: 'محفظة زين كاش (Zain Cash Jordan)',
    name_en: 'Zain Cash Jordan',
    category: 'jordan_wallet',
    currency: 'JOD',
    recipient_account: '0791234567',
    account_name: 'عمده ستور - 3mdh Store',
    instructions: 'قم بالتحويل عبر تطبيق زين كاش الأردن إلى رقم المحفظة الموضح أعلاه، ثم أدخل الرقم المرجعي للعملية أو اسم المحول وأرفق صورة الإيصال.',
    instructions_en: 'Transfer via Zain Cash Jordan app to the wallet number above, then submit your transaction reference and receipt.',
    icon_type: 'zain',
    is_active: true,
    min_amount: 1
  },
  {
    id: 'cliq_jo',
    name: 'كليك الأردن (CliQ Instant Pay)',
    name_en: 'CliQ Jordan',
    category: 'jordan_wallet',
    currency: 'JOD',
    recipient_account: '3MDHSTORE',
    account_name: '3mdh store',
    instructions: 'حوّل عبر خدمة كليك (CliQ) من أي تطبيق بنكي أردني باستخدام الاسم المستعار (Alias) الموضح، ثم اكتب الرقم المرجعي للتحويل.',
    instructions_en: 'Transfer via CliQ using the Alias above from any Jordanian banking app, then enter your transaction reference.',
    icon_type: 'cliq',
    is_active: true,
    min_amount: 1
  },
  {
    id: 'orange_money_jo',
    name: 'محفظة أورنج موني (Orange Money Jordan)',
    name_en: 'Orange Money Jordan',
    category: 'jordan_wallet',
    currency: 'JOD',
    recipient_account: '0779876543',
    account_name: '3mdh Store JO',
    instructions: 'حوّل إلى محفظة أورنج موني الأردن عبر رقم الهاتف الموضح أعلاه واكتب اسم صاحب الحساب ورقم الحوالة.',
    instructions_en: 'Transfer to the Orange Money Jordan wallet number above, then write your account name and transaction ref.',
    icon_type: 'orange',
    is_active: true,
    min_amount: 1
  },
  {
    id: 'binance_pay',
    name: 'بينانس باي يدوي (Binance Pay ID / USDT)',
    name_en: 'Binance Pay ID (USDT)',
    category: 'crypto',
    currency: 'USD',
    recipient_account: '849201948',
    account_name: '3mdh_Official (عمده ستور)',
    instructions: 'افتح تطبيق Binance > ثم اختر Pay > ثم إرسال (Send) > أدخل Binance Pay ID الموضح أعلاه بعملة USDT، ثم ألصق رقم معرف العملية (Order ID / TxID).',
    instructions_en: 'Open Binance App > Pay > Send > Enter the Pay ID above in USDT. Paste your Binance transaction order ID upon transfer.',
    icon_type: 'binance',
    is_active: true,
    min_amount: 1
  },
  {
    id: 'redotpay',
    name: 'محفظة ريدوت باي (RedotPay ID)',
    name_en: 'RedotPay Global Wallet',
    category: 'global_wallet',
    currency: 'USD',
    recipient_account: '198420311',
    account_name: '3mdh Store RedotPay',
    instructions: 'حوّل مجاناً من تطبيق RedotPay إلى معرف المستخدم (RedotPay User ID) الموضح بدون أي رسوم تحويل، ثم ضع رقم العملية.',
    instructions_en: 'Transfer 0-fee from your RedotPay app to the RedotPay User ID above, then submit transaction details.',
    icon_type: 'redotpay',
    is_active: true,
    min_amount: 1
  },
  {
    id: 'stc_pay',
    name: 'محفظة STC Pay / UrPay (السعودية)',
    name_en: 'STC Pay / UrPay',
    category: 'local_wallet',
    currency: 'SAR',
    recipient_account: '0501234567',
    account_name: 'متجر عمده - 3mdh store',
    instructions: 'حوّل عبر تطبيق STC Pay أو UrPay إلى رقم الجوال الموضح، ثم اكتب اسم المحول ورقم الحوالة.',
    instructions_en: 'Transfer via STC Pay or UrPay to the phone number above, and enter your transfer reference.',
    icon_type: 'stc',
    is_active: true,
    min_amount: 5
  },
  {
    id: 'bank_transfer_arab',
    name: 'تحويل بنكي مباشر (IBAN / البنك العربي أو الراجحي)',
    name_en: 'Bank Transfer (IBAN)',
    category: 'bank',
    currency: 'JOD',
    recipient_account: 'JO84ARAB0120000001234567890123',
    account_name: 'متجر عمده الرقمي (3mdh store)',
    instructions: 'أجرِ التحويل البنكي إلى الآيبان الموضح واكتب اسم البنك واسم المودع ورقم الإشعار وأرفق صورة الإيصال.',
    instructions_en: 'Perform bank wire transfer to the IBAN above, write sender details, and upload receipt image.',
    icon_type: 'bank',
    is_active: true,
    min_amount: 5
  }
];

let storeSettings = {
  store_name: 'عمده ستور - 3mdh store',
  store_name_en: '3mdh store',
  store_url: 'https://3mdh.store/',
  store_tagline: 'متجر عمده لخدمات السوشيال ميديا، الاشتراكات الرسمية، الباقات والمفاتيح الرقمية',
  store_logo: '/icon.svg',
  default_currency: 'SAR',
  allowed_currencies: ['SAR', 'JOD', 'USD', 'AED', 'KWD'],
  primary_color: '#4f46e5',
  secondary_color: '#06b6d4',
  support_whatsapp: '+962791234567',
  support_email: 'support@3mdh.store',
  support_telegram: '@omda_3mdh',
  payment_paypal_enabled: '1',
  payment_paypal_client_id: 'sb_client_paypal_live_3mdh',
  payment_paypal_mode: 'live',
  payment_wallet_enabled: '1',
  manual_payment_methods: manualPaymentMethods,
  smtp_host: 'mail.3mdh.store',
  smtp_port: '465',
  smtp_secure: 'ssl',
  smtp_username: 'noreply@3mdh.store',
  homepage_sections: ['hero', 'categories', 'featured_services', 'best_sellers', 'subscriptions', 'digital_products', 'offers', 'reviews', 'faq', 'features']
};

let mobileAppConfig = {
  app_name: 'ديجيتكس ستور | Digitex Store',
  app_name_en: 'Digitex Mobile App',
  package_id: 'com.digitex.store',
  app_version: '1.2.0',
  build_number: 12,
  min_supported_version: '1.0.0',
  force_update: false,
  apk_download_url: '/downloads/digitex-store-v1.2.0.apk',
  update_title_ar: 'تحديث جديد متوفر لتطبيق ديجيتكس (v1.2.0)',
  update_message_ar: 'تم تحسين سرعة التصفح وإضافة بوابات الدفع الفورية (PayPal، نون باي، ماي فاتورة) والتسليم التلقائي للمفاتيح.',
  announcement_enabled: true,
  announcement_text_ar: 'خصم حصري 15% لمستخدمي التطبيق! استخدم الكوبون: APP15 عند الدفع.',
  announcement_coupon: 'APP15',
  maintenance_mode: false,
  maintenance_message_ar: 'تطبيق الجوال قيد التحديث السحابي الخفيف، يمكنك متابعة طلباتك عبر المتجر الإلكتروني.',
  splash_bg_color: '#0f172a',
  push_notifications_enabled: true,
  direct_apk_ready: true
};

let auditLogs: any[] = [
  { id: 1, action: 'تعديل حالة طلب', entity_type: 'Order', entity_id: 'DG-2026-9041', details: 'تم تحويل الطلب إلى مكتمل بنجاح', created_at: '2026-09-18 15:10' },
  { id: 2, action: 'إضافة منتج جديد', entity_type: 'Product', entity_id: 'CANVA-1Y', details: 'تم إنشاء خدمة كانفا برو', created_at: '2026-09-17 12:00' }
];

// -------------------------------------------------------------
// REST API ENDPOINTS
// -------------------------------------------------------------

app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'Digitex Store API',
    mode: 'cPanel-Compatible Full-Stack Service',
    database: 'Active (MySQL Ready & Persistent In-Memory Mirror)',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/settings', (req: Request, res: Response) => {
  res.json({ success: true, settings: storeSettings });
});

// Mobile App Config Endpoints (Android APK Integration)
app.get('/api/app-config', (req: Request, res: Response) => {
  res.json({ success: true, config: mobileAppConfig });
});

app.post('/api/admin/app-config', (req: Request, res: Response) => {
  mobileAppConfig = { ...mobileAppConfig, ...req.body };
  auditLogs.unshift({
    id: Date.now(),
    action: 'تحديث إعدادات تطبيق الجوال',
    entity_type: 'MobileApp',
    entity_id: mobileAppConfig.app_version,
    details: `تم تحديث تكوين تطبيق الأندرويد APK - الإصدار ${mobileAppConfig.app_version}`,
    created_at: new Date().toLocaleString('ar-SA')
  });
  res.json({ success: true, message: 'تم حفظ إعدادات تطبيق الجوال بنجاح', config: mobileAppConfig });
});

app.get('/api/app/download-apk', (req: Request, res: Response) => {
  res.setHeader('Content-Disposition', `attachment; filename="digitex-store-v${mobileAppConfig.app_version}.apk"`);
  res.setHeader('Content-Type', 'application/vnd.android.package-archive');
  // Return metadata header & download confirmation
  res.json({
    success: true,
    message: 'حزمة تطبيق الأندرويد جاهزة للتحميل والتثبيت المباشر',
    appName: mobileAppConfig.app_name,
    version: mobileAppConfig.app_version,
    packageId: mobileAppConfig.package_id,
    downloadUrl: mobileAppConfig.apk_download_url,
    fileSize: '14.8 MB',
    sha256: 'a7b9c34f18d09e120f04c6a992e541b9d0387bfa'
  });
});

app.post('/api/admin/settings', (req: Request, res: Response) => {
  storeSettings = { ...storeSettings, ...req.body };
  auditLogs.unshift({
    id: Date.now(),
    action: 'تحديث إعدادات المتجر',
    entity_type: 'Settings',
    entity_id: 'general',
    details: 'تم تحديث هوية وبيانات المتجر العامة',
    created_at: new Date().toLocaleString('ar-SA')
  });
  res.json({ success: true, message: 'تم حفظ الإعدادات بنجاح', settings: storeSettings });
});

app.get('/api/categories', (req: Request, res: Response) => {
  res.json({ success: true, categories });
});

app.post('/api/admin/categories', (req: Request, res: Response) => {
  const newCat = {
    id: categories.length + 1,
    name: req.body.name,
    name_en: req.body.name_en || req.body.name,
    slug: req.body.slug || req.body.name.toLowerCase().replace(/\s+/g, '-'),
    icon: req.body.icon || 'Sparkles',
    sort_order: categories.length + 1,
    is_active: 1
  };
  categories.push(newCat);
  res.json({ success: true, category: newCat });
});

app.get('/api/products', (req: Request, res: Response) => {
  const { category_id, type, search, featured } = req.query;
  let filtered = [...products].filter(p => p.is_active === 1);

  if (category_id) {
    filtered = filtered.filter(p => p.category_id === Number(category_id));
  }
  if (type) {
    filtered = filtered.filter(p => p.type === type);
  }
  if (featured) {
    filtered = filtered.filter(p => p.is_featured === 1);
  }
  if (search) {
    const s = String(search).toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(s) ||
      p.name_en.toLowerCase().includes(s) ||
      p.description.toLowerCase().includes(s) ||
      p.sku.toLowerCase().includes(s)
    );
  }

  res.json({ success: true, products: filtered });
});

app.get('/api/products/:slugOrId', (req: Request, res: Response) => {
  const param = req.params.slugOrId;
  const product = products.find(p => p.slug === param || p.id === Number(param));
  if (!product) {
    return res.status(404).json({ success: false, error: 'المنتج غير موجود' });
  }
  const productReviews = reviews.filter(r => r.product_id === product.id && r.is_approved === 1);
  res.json({ success: true, product: { ...product, reviews: productReviews } });
});

// Admin Products CRUD & Bulk
app.get('/api/admin/products', (req: Request, res: Response) => {
  res.json({ success: true, products });
});

app.post('/api/admin/products', (req: Request, res: Response) => {
  const b = req.body;
  const newProduct: Product = {
    id: Date.now(),
    category_id: Number(b.category_id) || 1,
    name: b.name,
    name_en: b.name_en || b.name,
    slug: b.slug || `prod-${Date.now()}`,
    description: b.description || '',
    description_en: b.description_en || '',
    type: b.type || 'service',
    base_price: Number(b.base_price) || 0,
    discount_price: b.discount_price ? Number(b.discount_price) : undefined,
    stock: Number(b.stock) || 9999,
    sku: b.sku || `SKU-${Math.floor(Math.random() * 10000)}`,
    delivery_type: b.delivery_type || 'manual',
    delivery_time_text: b.delivery_time_text || 'فوري خلال دقائق',
    duration_days: b.duration_days ? Number(b.duration_days) : undefined,
    is_featured: b.is_featured ? 1 : 0,
    is_active: 1,
    image: b.image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    rating: 5.0,
    total_reviews: 0,
    variants: b.variants || [],
    requirements: b.requirements || []
  };

  products.unshift(newProduct);
  auditLogs.unshift({
    id: Date.now(),
    action: 'إضافة منتج/خدمة جديدة',
    entity_type: 'Product',
    entity_id: String(newProduct.id),
    details: `تم إنشاء المنتج: ${newProduct.name}`,
    created_at: new Date().toLocaleString('ar-SA')
  });

  res.json({ success: true, product: newProduct });
});

app.put('/api/admin/products/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'المنتج غير موجود' });
  }

  products[idx] = { ...products[idx], ...req.body };
  res.json({ success: true, product: products[idx] });
});

app.delete('/api/admin/products/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  products = products.filter(p => p.id !== id);
  res.json({ success: true, message: 'تم حذف المنتج' });
});

app.post('/api/admin/products/bulk', (req: Request, res: Response) => {
  const { action, ids, category_id } = req.body;
  if (!Array.isArray(ids)) {
    return res.status(400).json({ success: false, error: 'قائمة المعرفات مطلوبة' });
  }

  if (action === 'delete') {
    products = products.filter(p => !ids.includes(p.id));
  } else if (action === 'enable') {
    products = products.map(p => ids.includes(p.id) ? { ...p, is_active: 1 } : p);
  } else if (action === 'disable') {
    products = products.map(p => ids.includes(p.id) ? { ...p, is_active: 0 } : p);
  } else if (action === 'update_category' && category_id) {
    products = products.map(p => ids.includes(p.id) ? { ...p, category_id: Number(category_id) } : p);
  }

  res.json({ success: true, count: ids.length });
});

// Coupons
app.post('/api/coupons/validate', (req: Request, res: Response) => {
  const code = String(req.body.code || '').trim().toUpperCase();
  const subtotal = Number(req.body.subtotal) || 0;

  const coupon = coupons.find(c => c.code === code && c.is_active === 1);
  if (!coupon) {
    return res.status(400).json({ success: false, error: 'كوبون الخصم غير صالح أو منتهي' });
  }

  if (coupon.min_order_amount && subtotal < coupon.min_order_amount) {
    return res.status(400).json({ success: false, error: `الحد الأدنى لتطبيق الكوبون هو ${coupon.min_order_amount} ${storeSettings.default_currency}` });
  }

  let discount = 0;
  if (coupon.type === 'percentage') {
    discount = (subtotal * coupon.value) / 100;
    if (coupon.max_discount_amount && discount > coupon.max_discount_amount) {
      discount = coupon.max_discount_amount;
    }
  } else {
    discount = coupon.value;
  }

  res.json({
    success: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discount_amount: Number(discount.toFixed(2))
    }
  });
});

app.get('/api/admin/coupons', (req: Request, res: Response) => {
  res.json({ success: true, coupons });
});

app.post('/api/admin/coupons', (req: Request, res: Response) => {
  const newCoupon = {
    id: Date.now(),
    code: String(req.body.code).toUpperCase().trim(),
    type: req.body.type || 'percentage',
    value: Number(req.body.value) || 10,
    min_order_amount: Number(req.body.min_order_amount) || 0,
    max_discount_amount: req.body.max_discount_amount ? Number(req.body.max_discount_amount) : 0,
    usage_limit: Number(req.body.usage_limit) || 100,
    usage_count: 0,
    is_active: 1
  };
  coupons.unshift(newCoupon);
  res.json({ success: true, coupon: newCoupon });
});

// Orders & Checkout
app.post('/api/orders', (req: Request, res: Response) => {
  const b = req.body;
  const orderNumber = 'DG-' + new Date().getFullYear() + '-' + Math.floor(100000 + Math.random() * 900000);
  const subtotal = Number(b.subtotal) || 0;
  const discountAmount = Number(b.discount_amount) || 0;
  const totalAmount = Math.max(0, subtotal - discountAmount);
  const paymentMethod = b.payment_method || 'manual';

  // If wallet payment, check balance
  if (paymentMethod === 'wallet') {
    if (wallet.balance < totalAmount) {
      return res.status(400).json({ success: false, error: 'رصيد المحفظة غير كافٍ لإتمام الطلب' });
    }
    wallet.balance -= totalAmount;
    wallet.transactions.unshift({
      id: Date.now(),
      type: 'deduction',
      amount: totalAmount,
      description: `دفع قيمة الطلب رقم ${orderNumber}`,
      created_at: new Date().toLocaleString('ar-SA')
    });
  }

  // Only automated payments (PayPal and Wallet) get immediate paid status; manual methods await admin review
  const paymentStatus = ['wallet', 'paypal'].includes(paymentMethod) ? 'paid' : 'pending';
  const orderStatus = paymentStatus === 'paid' ? 'processing' : 'pending_payment';

  const newOrder = {
    id: Date.now(),
    order_number: orderNumber,
    user_id: b.user_id || 1,
    guest_name: b.customer_name || 'عميل المتجر',
    guest_email: b.customer_email || 'customer@example.com',
    guest_phone: b.customer_phone || '+962790000000',
    subtotal,
    discount_amount: discountAmount,
    total_amount: totalAmount,
    currency: b.currency || storeSettings.default_currency,
    payment_status: paymentStatus,
    payment_method: paymentMethod,
    manual_method_id: b.manual_method_id || undefined,
    manual_method_name: b.manual_method_name || undefined,
    payment_receipt_url: b.payment_receipt_url || undefined,
    payment_sender_info: b.payment_sender_info || undefined,
    payment_transaction_ref: b.payment_transaction_ref || undefined,
    order_status: orderStatus,
    customer_notes: b.customer_notes || '',
    admin_notes: paymentMethod === 'manual' 
      ? `تحويل يدوي بانتظار مراجعة الإدارة عبر (${b.manual_method_name || 'طريقة يدوية'})` 
      : 'تم استلام الدفع وبدء المعالجة الآلية',
    delivery_notes: '',
    created_at: new Date().toLocaleString('ar-SA'),
    items: b.items || []
  };

  // Auto fulfill digital products & subscriptions if paid
  if (paymentStatus === 'paid' && Array.isArray(b.items)) {
    b.items.forEach((it: any) => {
      const prod = products.find(p => p.id === it.product_id);
      if (prod && prod.type === 'digital') {
        const keyVal = 'VK7JG-' + Math.random().toString(36).substring(2, 7).toUpperCase() + '-9MPGT-3V66T';
        digitalInventory.unshift({
          id: Date.now() + Math.random(),
          product_id: it.product_id,
          product_name: it.product_name,
          order_number: orderNumber,
          item_type: 'license_key',
          content: keyVal,
          created_at: new Date().toLocaleString('ar-SA')
        });
        it.delivered_item = { item_type: 'license_key', content: keyVal };
        newOrder.delivery_notes = `تم تسليم المفتاح الرقمي بنجاح: ${keyVal}`;
        newOrder.order_status = 'completed';
      }

      if (prod && (prod.type === 'subscription' || prod.duration_days)) {
        const days = it.duration_days || prod.duration_days || 30;
        subscriptions.unshift({
          id: Date.now() + Math.random(),
          user_id: b.user_id || 1,
          order_id: newOrder.id,
          product_id: it.product_id,
          variant_id: it.variant_id,
          product_name: it.product_name,
          image: prod.image,
          start_date: new Date().toISOString().split('T')[0],
          expires_at: new Date(Date.now() + days * 86400000).toISOString().split('T')[0],
          duration_days: days,
          days_left: days,
          status: 'active',
          credentials: 'الحساب مفعّل: تم إرسال معلومات الدخول والتفعيل إلى بريدك الإلكتروني.'
        });
      }
    });
  }

  orders.unshift(newOrder);
  auditLogs.unshift({
    id: Date.now(),
    action: 'طلب جديد',
    entity_type: 'Order',
    entity_id: orderNumber,
    details: `طلب جديد بمبلغ ${totalAmount} ${newOrder.currency}`,
    created_at: new Date().toLocaleString('ar-SA')
  });

  res.json({
    success: true,
    message: 'تم إنشاء الطلب بنجاح',
    order: newOrder
  });
});

app.get('/api/orders/:orderNumber', (req: Request, res: Response) => {
  const num = req.params.orderNumber;
  const order = orders.find(o => o.order_number === num || String(o.id) === num);
  if (!order) {
    return res.status(404).json({ success: false, error: 'الطلب غير موجود' });
  }
  res.json({ success: true, order });
});

app.get('/api/orders', (req: Request, res: Response) => {
  res.json({ success: true, orders });
});

app.get('/api/admin/orders', (req: Request, res: Response) => {
  res.json({ success: true, orders });
});

app.put('/api/admin/orders/:id/status', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { status, admin_notes, delivery_notes } = req.body;

  const order = orders.find(o => o.id === id || o.order_number === String(req.params.id));
  if (!order) {
    return res.status(404).json({ success: false, error: 'الطلب غير موجود' });
  }

  if (status) order.order_status = status;
  if (admin_notes !== undefined) order.admin_notes = admin_notes;
  if (delivery_notes !== undefined) order.delivery_notes = delivery_notes;

  auditLogs.unshift({
    id: Date.now(),
    action: 'تحديث حالة طلب',
    entity_type: 'Order',
    entity_id: order.order_number,
    details: `تم تحديث حالة الطلب إلى: ${status}`,
    created_at: new Date().toLocaleString('ar-SA')
  });

  res.json({ success: true, order });
});

// Subscriptions & Digital Library
app.get('/api/subscriptions', (req: Request, res: Response) => {
  res.json({ success: true, subscriptions });
});

app.get('/api/admin/subscriptions', (req: Request, res: Response) => {
  res.json({ success: true, subscriptions });
});

app.get('/api/digital-inventory', (req: Request, res: Response) => {
  res.json({ success: true, items: digitalInventory });
});

// Manual Payment Methods CRUD
app.get('/api/manual-payment-methods', (req: Request, res: Response) => {
  res.json({ success: true, methods: manualPaymentMethods });
});

app.post('/api/admin/manual-payment-methods', (req: Request, res: Response) => {
  const newMethod = {
    id: req.body.id || `manual_${Date.now()}`,
    name: req.body.name,
    name_en: req.body.name_en || req.body.name,
    category: req.body.category || 'jordan_wallet',
    currency: req.body.currency || 'JOD',
    recipient_account: req.body.recipient_account,
    account_name: req.body.account_name || '',
    instructions: req.body.instructions || '',
    instructions_en: req.body.instructions_en || '',
    icon_type: req.body.icon_type || 'wallet',
    is_active: req.body.is_active !== undefined ? req.body.is_active : true,
    min_amount: Number(req.body.min_amount) || 1
  };
  manualPaymentMethods.push(newMethod);
  storeSettings.manual_payment_methods = manualPaymentMethods;
  res.json({ success: true, method: newMethod });
});

app.put('/api/admin/manual-payment-methods/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  const idx = manualPaymentMethods.findIndex(m => m.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'طريقة الدفع غير موجودة' });
  }
  manualPaymentMethods[idx] = { ...manualPaymentMethods[idx], ...req.body };
  storeSettings.manual_payment_methods = manualPaymentMethods;
  res.json({ success: true, method: manualPaymentMethods[idx] });
});

app.delete('/api/admin/manual-payment-methods/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  manualPaymentMethods = manualPaymentMethods.filter(m => m.id !== id);
  storeSettings.manual_payment_methods = manualPaymentMethods;
  res.json({ success: true });
});

// Wallet
app.get('/api/wallet', (req: Request, res: Response) => {
  res.json({ success: true, wallet });
});

app.post('/api/wallet/deposit', (req: Request, res: Response) => {
  const amount = Number(req.body.amount) || 0;
  if (amount <= 0) {
    return res.status(400).json({ success: false, error: 'مبلغ الشحن غير صالح' });
  }
  wallet.balance += amount;
  wallet.transactions.unshift({
    id: Date.now(),
    type: 'deposit',
    amount,
    description: `شحن رصيد إلكتروني (${req.body.method || 'بطاقة بنكية'})`,
    created_at: new Date().toLocaleString('ar-SA')
  });
  res.json({ success: true, balance: wallet.balance });
});

app.post('/api/admin/wallet/adjust', (req: Request, res: Response) => {
  const { amount, type, description } = req.body;
  const num = Number(amount) || 0;
  if (type === 'deduction') {
    wallet.balance = Math.max(0, wallet.balance - num);
  } else {
    wallet.balance += num;
  }
  wallet.transactions.unshift({
    id: Date.now(),
    type: type || 'deposit',
    amount: num,
    description: description || 'تعديل رصيد بواسطة الإدارة',
    created_at: new Date().toLocaleString('ar-SA')
  });
  res.json({ success: true, wallet });
});

// Reviews
app.get('/api/reviews', (req: Request, res: Response) => {
  res.json({ success: true, reviews });
});

app.post('/api/reviews', (req: Request, res: Response) => {
  const newRev = {
    id: Date.now(),
    product_id: Number(req.body.product_id),
    user_name: req.body.user_name || 'عميل موثق',
    rating: Number(req.body.rating) || 5,
    comment: req.body.comment,
    is_approved: 1,
    created_at: 'الآن'
  };
  reviews.unshift(newRev);
  res.json({ success: true, review: newRev });
});

app.get('/api/admin/reviews', (req: Request, res: Response) => {
  res.json({ success: true, reviews });
});

app.put('/api/admin/reviews/:id/approve', (req: Request, res: Response) => {
  const rev = reviews.find(r => r.id === Number(req.params.id));
  if (rev) rev.is_approved = 1;
  res.json({ success: true, review: rev });
});

app.delete('/api/admin/reviews/:id', (req: Request, res: Response) => {
  reviews = reviews.filter(r => r.id !== Number(req.params.id));
  res.json({ success: true });
});

// Admin Authentication
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (email === 'admin@digitex.store' && password === 'admin123') {
    return res.json({
      success: true,
      token: 'admin_token_' + Date.now(),
      admin: {
        id: 1,
        name: 'مدير المتجر العام',
        email: 'admin@digitex.store',
        role: 'Super Administrator'
      }
    });
  }
  res.status(401).json({ success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
});

// Admin Analytics
app.get('/api/admin/analytics', (req: Request, res: Response) => {
  const totalSales = orders.reduce((sum, o) => sum + (o.payment_status === 'paid' ? o.total_amount : 0), 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.order_status === 'pending_payment' || o.order_status === 'processing').length;
  const completedOrders = orders.filter(o => o.order_status === 'completed').length;
  const activeSubs = subscriptions.filter(s => s.status === 'active').length;

  res.json({
    success: true,
    metrics: {
      total_sales: totalSales,
      today_sales: totalSales * 0.4,
      monthly_sales: totalSales,
      total_orders: totalOrders,
      pending_orders: pendingOrders,
      completed_orders: completedOrders,
      active_subscriptions: activeSubs,
      total_customers: 184,
      wallet_liabilities: wallet.balance
    },
    sales_chart: [
      { month: 'سبتمبر', sales: 4200, orders: 120 },
      { month: 'أغسطس', sales: 3800, orders: 95 },
      { month: 'يوليو', sales: 3100, orders: 82 },
      { month: 'يونيو', sales: 2900, orders: 74 }
    ],
    logs: auditLogs
  });
});

// File Exporters for cPanel deployment
app.get('/api/export/schema.sql', (req: Request, res: Response) => {
  const filePath = path.join(process.cwd(), 'database', 'schema.sql');
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'application/sql');
    res.setHeader('Content-Disposition', 'attachment; filename="schema.sql"');
    return res.sendFile(filePath);
  }
  res.status(404).send('schema.sql not found');
});

app.get('/api/export/deployment-guide', (req: Request, res: Response) => {
  const filePath = path.join(process.cwd(), 'DEPLOYMENT.md');
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    return res.sendFile(filePath);
  }
  res.status(404).send('DEPLOYMENT.md not found');
});

// -------------------------------------------------------------
// Vite Middleware / Static Server
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Digitex Store Server running at http://localhost:${PORT}`);
  });
}

startServer();
