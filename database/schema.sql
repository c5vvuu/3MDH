-- ==========================================================
-- Digitex Store - Complete Production MySQL Database Schema
-- Compatible with MySQL 8.0+ / 5.7+ & MariaDB on cPanel
-- Character set: utf8mb4 / utf8mb4_unicode_ci
-- ==========================================================

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS media;
DROP TABLE IF EXISTS settings;
DROP TABLE IF EXISTS wallet_transactions;
DROP TABLE IF EXISTS wallets;
DROP TABLE IF EXISTS digital_products;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS wishlist_items;
DROP TABLE IF EXISTS wishlists;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS coupon_usage;
DROP TABLE IF EXISTS coupons;
DROP TABLE IF EXISTS subscriptions;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS order_item_requirements;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS product_requirements;
DROP TABLE IF EXISTS product_categories;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS product_variants;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS role_permissions;
DROP TABLE IF EXISTS permissions;
DROP TABLE IF EXISTS admins;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- --------------------------------------------------------
-- Table: users (Customers)
-- --------------------------------------------------------
CREATE TABLE users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(191) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(50) DEFAULT NULL,
    status ENUM('active', 'suspended', 'pending') DEFAULT 'active',
    avatar VARCHAR(255) DEFAULT NULL,
    remember_token VARCHAR(100) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email),
    INDEX idx_user_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: roles
-- --------------------------------------------------------
CREATE TABLE roles (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: admins
-- --------------------------------------------------------
CREATE TABLE admins (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    role_id INT UNSIGNED NOT NULL,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(191) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    last_login_at DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: permissions
-- --------------------------------------------------------
CREATE TABLE permissions (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    module VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: role_permissions
-- --------------------------------------------------------
CREATE TABLE role_permissions (
    role_id INT UNSIGNED NOT NULL,
    permission_id INT UNSIGNED NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: categories
-- --------------------------------------------------------
CREATE TABLE categories (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    parent_id INT UNSIGNED DEFAULT NULL,
    name VARCHAR(150) NOT NULL,
    name_en VARCHAR(150) NOT NULL,
    slug VARCHAR(191) NOT NULL UNIQUE,
    icon VARCHAR(100) DEFAULT 'Sparkles',
    image VARCHAR(255) DEFAULT NULL,
    sort_order INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_category_slug (slug),
    INDEX idx_category_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: products
-- --------------------------------------------------------
CREATE TABLE products (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    category_id INT UNSIGNED DEFAULT NULL,
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    slug VARCHAR(191) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    description_en TEXT DEFAULT NULL,
    type ENUM('digital', 'service', 'subscription', 'variable', 'custom') NOT NULL DEFAULT 'service',
    base_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    discount_price DECIMAL(10,2) DEFAULT NULL,
    stock INT DEFAULT 9999,
    sku VARCHAR(100) DEFAULT NULL,
    delivery_type ENUM('instant', 'manual', 'code', 'file', 'account') DEFAULT 'manual',
    delivery_time_text VARCHAR(100) DEFAULT 'فوري خلال 1-24 ساعة',
    duration_days INT DEFAULT NULL,
    is_featured TINYINT(1) DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    image VARCHAR(255) DEFAULT NULL,
    gallery JSON DEFAULT NULL,
    seo_title VARCHAR(255) DEFAULT NULL,
    seo_description TEXT DEFAULT NULL,
    rating DECIMAL(2,1) DEFAULT 5.0,
    total_reviews INT UNSIGNED DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_prod_slug (slug),
    INDEX idx_prod_type (type),
    INDEX idx_prod_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: product_categories (Many-to-Many support)
-- --------------------------------------------------------
CREATE TABLE product_categories (
    product_id INT UNSIGNED NOT NULL,
    category_id INT UNSIGNED NOT NULL,
    PRIMARY KEY (product_id, category_id),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: product_variants
-- --------------------------------------------------------
CREATE TABLE product_variants (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id INT UNSIGNED NOT NULL,
    title VARCHAR(150) NOT NULL,
    title_en VARCHAR(150) NOT NULL,
    sku VARCHAR(100) DEFAULT NULL,
    price DECIMAL(10,2) NOT NULL,
    discount_price DECIMAL(10,2) DEFAULT NULL,
    stock INT DEFAULT 9999,
    delivery_time VARCHAR(100) DEFAULT NULL,
    duration_days INT DEFAULT NULL,
    is_active TINYINT(1) DEFAULT 1,
    sort_order INT DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_variant_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: product_requirements (Customer fields required)
-- --------------------------------------------------------
CREATE TABLE product_requirements (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id INT UNSIGNED NOT NULL,
    field_label VARCHAR(150) NOT NULL,
    field_label_en VARCHAR(150) NOT NULL,
    field_type ENUM('text', 'url', 'textarea', 'number', 'email', 'select') NOT NULL DEFAULT 'text',
    placeholder VARCHAR(255) DEFAULT NULL,
    options JSON DEFAULT NULL,
    is_required TINYINT(1) DEFAULT 1,
    sort_order INT DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_req_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: coupons
-- --------------------------------------------------------
CREATE TABLE coupons (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    type ENUM('percentage', 'fixed') NOT NULL DEFAULT 'percentage',
    value DECIMAL(10,2) NOT NULL,
    min_order_amount DECIMAL(10,2) DEFAULT 0.00,
    max_discount_amount DECIMAL(10,2) DEFAULT NULL,
    usage_limit INT DEFAULT NULL,
    usage_count INT DEFAULT 0,
    per_customer_limit INT DEFAULT 1,
    expires_at DATETIME DEFAULT NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_coupon_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: orders
-- --------------------------------------------------------
CREATE TABLE orders (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    user_id INT UNSIGNED DEFAULT NULL,
    guest_name VARCHAR(150) DEFAULT NULL,
    guest_email VARCHAR(191) DEFAULT NULL,
    guest_phone VARCHAR(50) DEFAULT NULL,
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) NOT NULL DEFAULT 'SAR',
    coupon_id INT UNSIGNED DEFAULT NULL,
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
    payment_method VARCHAR(50) NOT NULL DEFAULT 'card',
    order_status ENUM('pending_payment', 'paid', 'pending_processing', 'processing', 'completed', 'cancelled', 'refunded') NOT NULL DEFAULT 'pending_payment',
    customer_notes TEXT DEFAULT NULL,
    admin_notes TEXT DEFAULT NULL,
    delivery_notes TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE SET NULL,
    INDEX idx_order_number (order_number),
    INDEX idx_order_user (user_id),
    INDEX idx_order_status (order_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: order_items
-- --------------------------------------------------------
CREATE TABLE order_items (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id INT UNSIGNED NOT NULL,
    product_id INT UNSIGNED NOT NULL,
    variant_id INT UNSIGNED DEFAULT NULL,
    product_name VARCHAR(255) NOT NULL,
    variant_title VARCHAR(150) DEFAULT NULL,
    price DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: order_item_requirements (Answers from customer)
-- --------------------------------------------------------
CREATE TABLE order_item_requirements (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_item_id INT UNSIGNED NOT NULL,
    field_label VARCHAR(150) NOT NULL,
    field_value TEXT NOT NULL,
    FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: payments
-- --------------------------------------------------------
CREATE TABLE payments (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id INT UNSIGNED NOT NULL,
    transaction_reference VARCHAR(191) NOT NULL UNIQUE,
    payment_gateway VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'SAR',
    status ENUM('pending', 'completed', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
    gateway_response JSON DEFAULT NULL,
    paid_at DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_payment_ref (transaction_reference)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: subscriptions
-- --------------------------------------------------------
CREATE TABLE subscriptions (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    order_id INT UNSIGNED NOT NULL,
    product_id INT UNSIGNED NOT NULL,
    variant_id INT UNSIGNED DEFAULT NULL,
    start_date DATETIME NOT NULL,
    expires_at DATETIME NOT NULL,
    duration_days INT NOT NULL,
    status ENUM('active', 'expiring', 'expired', 'cancelled') NOT NULL DEFAULT 'active',
    auto_renew TINYINT(1) DEFAULT 0,
    credentials TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    INDEX idx_sub_expires (expires_at),
    INDEX idx_sub_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: digital_products (Inventory & Deliverables)
-- --------------------------------------------------------
CREATE TABLE digital_products (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id INT UNSIGNED NOT NULL,
    variant_id INT UNSIGNED DEFAULT NULL,
    order_item_id INT UNSIGNED DEFAULT NULL,
    item_type ENUM('license_key', 'code', 'account', 'file_link', 'text_instruction') NOT NULL DEFAULT 'license_key',
    content TEXT NOT NULL,
    is_used TINYINT(1) DEFAULT 0,
    assigned_at DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL,
    FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE SET NULL,
    INDEX idx_dig_used (is_used)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: coupon_usage
-- --------------------------------------------------------
CREATE TABLE coupon_usage (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    coupon_id INT UNSIGNED NOT NULL,
    user_id INT UNSIGNED DEFAULT NULL,
    order_id INT UNSIGNED NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: reviews
-- --------------------------------------------------------
CREATE TABLE reviews (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id INT UNSIGNED NOT NULL,
    user_id INT UNSIGNED DEFAULT NULL,
    order_id INT UNSIGNED DEFAULT NULL,
    user_name VARCHAR(150) NOT NULL,
    rating TINYINT UNSIGNED NOT NULL DEFAULT 5,
    comment TEXT NOT NULL,
    is_approved TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
    INDEX idx_review_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: wishlists
-- --------------------------------------------------------
CREATE TABLE wishlists (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: wishlist_items
-- --------------------------------------------------------
CREATE TABLE wishlist_items (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    wishlist_id INT UNSIGNED NOT NULL,
    product_id INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_wishlist_product (wishlist_id, product_id),
    FOREIGN KEY (wishlist_id) REFERENCES wishlists(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: wallets
-- --------------------------------------------------------
CREATE TABLE wallets (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL UNIQUE,
    balance DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) NOT NULL DEFAULT 'SAR',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: wallet_transactions
-- --------------------------------------------------------
CREATE TABLE wallet_transactions (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    wallet_id INT UNSIGNED NOT NULL,
    type ENUM('deposit', 'deduction', 'refund') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    reference_type VARCHAR(50) DEFAULT NULL,
    reference_id VARCHAR(100) DEFAULT NULL,
    description VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: notifications
-- --------------------------------------------------------
CREATE TABLE notifications (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED DEFAULT NULL,
    title VARCHAR(191) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'order',
    link VARCHAR(255) DEFAULT NULL,
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notif_user (user_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: settings
-- --------------------------------------------------------
CREATE TABLE settings (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `key` VARCHAR(100) NOT NULL UNIQUE,
    `value` TEXT DEFAULT NULL,
    `group` VARCHAR(50) DEFAULT 'general',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_settings_key (`key`),
    INDEX idx_settings_group (`group`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: media
-- --------------------------------------------------------
CREATE TABLE media (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    filepath VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size INT UNSIGNED NOT NULL,
    uploaded_by INT UNSIGNED DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: audit_logs
-- --------------------------------------------------------
CREATE TABLE audit_logs (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    admin_id INT UNSIGNED DEFAULT NULL,
    user_id INT UNSIGNED DEFAULT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(50) DEFAULT NULL,
    ip_address VARCHAR(45) DEFAULT NULL,
    user_agent VARCHAR(255) DEFAULT NULL,
    details TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_action (action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================================
-- DEFAULT SEED DATA
-- ==========================================================

-- Roles
INSERT INTO roles (id, name, slug, description) VALUES
(1, 'Super Administrator', 'super-admin', 'Full access to all store operations, database, and configurations'),
(2, 'Operations Manager', 'manager', 'Can manage products, orders, and customer queries');

-- Default Admin (Password: admin123 hashed using BCRYPT)
INSERT INTO admins (id, role_id, name, email, password, status) VALUES
(1, 1, 'مدير المتجر العام', 'admin@digitex.store', '$2y$12$4e9Lg8X/o0M1V4k2n.fweu2rC76p5k7uOqT3y21rK.B1C3oVlZgUe', 'active');

-- Default Customer User (Password: user123)
INSERT INTO users (id, name, email, password, phone, status) VALUES
(1, 'أحمد المنصوري', 'customer@example.com', '$2y$12$4e9Lg8X/o0M1V4k2n.fweu2rC76p5k7uOqT3y21rK.B1C3oVlZgUe', '+966501234567', 'active');

-- Initialize Wallet for Default Customer
INSERT INTO wallets (id, user_id, balance, currency) VALUES
(1, 1, 150.00, 'SAR');

INSERT INTO wallet_transactions (wallet_id, type, amount, description) VALUES
(1, 'deposit', 150.00, 'رصيد ترحيبي افتتاحي');

-- Categories
INSERT INTO categories (id, name, name_en, slug, icon, sort_order) VALUES
(1, 'خدمات السوشيال ميديا', 'Social Media Services', 'social-media', 'Share2', 1),
(2, 'الاشتراكات الرقمية', 'Digital Subscriptions', 'subscriptions', 'Tv', 2),
(3, 'مفاتيح التفعيل والبرامج', 'Software & License Keys', 'software-keys', 'Key', 3),
(4, 'حسابات الألعاب والترفيه', 'Gaming & Accounts', 'gaming-accounts', 'Gamepad2', 4),
(5, 'أدوات التصميم والذكاء الاصطناعي', 'Design & AI Tools', 'ai-design-tools', 'Wand2', 5);

-- Products
INSERT INTO products (id, category_id, name, name_en, slug, description, description_en, type, base_price, discount_price, stock, sku, delivery_type, delivery_time_text, duration_days, is_featured, is_active, image, rating, total_reviews) VALUES
(1, 1, 'متابعو انستقرام حقيقيون ومضمونون', 'Instagram Real Followers', 'instagram-followers-real', 'زيادة متابعين انستقرام حسابات نشطة مع ضمان عدم النقص لمدة 30 يوم. تنفيذ سريع وآمن على حسابك بدون الحاجة لكلمة المرور.', 'High quality real Instagram followers with 30-day refill guarantee. Safe and quick delivery without requiring your password.', 'service', 15.00, 12.00, 9999, 'IG-FL-01', 'manual', 'يبدأ خلال 15 دقيقة إلى ساعتين', NULL, 1, 1, 'https://images.unsplash.com/photo-1611262588024-d12430b98920?w=800&auto=format&fit=crop&q=80', 4.9, 142),
(2, 1, 'تفاعل ولايكات تيك توك نشطة', 'TikTok Likes & Engagement', 'tiktok-likes-fast', 'باقات إعجابات تيك توك لزيادة ظهور مقاطعك في صفحة For You (Explore). سرعة عالية وأمان تام.', 'TikTok video likes to boost visibility on For You page. Fast and secure.', 'service', 8.00, 6.50, 9999, 'TT-LK-02', 'manual', 'فوري خلال 10-30 دقيقة', NULL, 1, 1, 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=800&auto=format&fit=crop&q=80', 4.8, 98),
(3, 2, 'اشتراك نتفلكس بريميوم 4K رسمي', 'Netflix Premium 4K Official', 'netflix-premium-4k', 'اشتراك أصلي بأعلى جودة Ultra HD 4K، ملف شخصي خاص بك ومقفل برمز سري PIN، يعمل على جميع الأجهزة.', 'Official Netflix Premium Ultra HD 4K subscription with private profile and PIN. Works on all devices.', 'subscription', 35.00, 29.00, 45, 'NFLX-4K', 'account', 'تسليم فوري بعد الدفع مباشرة', 30, 1, 1, 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800&auto=format&fit=crop&q=80', 5.0, 310),
(4, 2, 'اشتراك يوتيوب بريميوم رسمي على إيميلك', 'YouTube Premium Family/Individual', 'youtube-premium-official', 'تفعيل رسمي بدون إعلانات وتنزيل المقاطع وخلفية الشاشة وYouTube Music على حسابك الشخصي عبر دعوة رسمية.', 'Official YouTube Premium activation on your own personal Google account without ads.', 'subscription', 18.00, 14.00, 120, 'YT-PRM', 'manual', 'خلال 30 دقيقة', 30, 1, 1, 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop&q=80', 4.9, 215),
(5, 3, 'مفتاح تفعيل ويندوز 11 برو الأصلي (مدى الحياة)', 'Windows 11 Pro Lifetime License Key', 'windows-11-pro-key', 'مفتاح رقمي أصلي 100% لتفعيل Windows 11 Pro لجهاز واحد مدى الحياة، يقبل جميع التحديثات ويدعم اللغتين العربية والإنجليزية.', '100% Genuine digital retail key for Windows 11 Pro. Lifetime activation, all updates supported.', 'digital', 25.00, 19.00, 80, 'WIN11-PRO', 'code', 'تسليم آلي وفوري للمفتاح', NULL, 1, 1, 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800&auto=format&fit=crop&q=80', 5.0, 420),
(6, 5, 'اشتراك كانفا برو Canva Pro التعليمي الرسمي', 'Canva Pro 1 Year Invite', 'canva-pro-1year', 'تمتع بكافة مميزات كانفا المدفوعة: خطوط، ملايين الصور، تفريغ الخلفيات بنقرة واحدة، والمكتبات الكاملة لمدة سنة كاملة.', 'Full access to Canva Pro premium assets, background remover, and templates on your personal email for 1 year.', 'subscription', 22.00, 15.00, 60, 'CNV-1Y', 'manual', 'تفعيل خلال 15 دقيقة', 365, 1, 1, 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80', 4.9, 180),
(7, 5, 'اشتراك شات جي بي تي بلس ChatGPT Plus', 'ChatGPT Plus Shared/Private', 'chatgpt-plus-subscription', 'استمتع بأحدث نماذج OpenAI (GPT-4o, Canvas, Sora) مع سرعة استجابة وتوليد صور غير محدود.', 'Access latest OpenAI flagship models with priority speed and image generation.', 'subscription', 40.00, 32.00, 30, 'GPT-PLUS', 'account', 'تسليم فوري', 30, 0, 1, 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=80', 4.8, 77);

-- Product Variants
INSERT INTO product_variants (product_id, title, title_en, sku, price, discount_price, stock, delivery_time, duration_days, sort_order) VALUES
-- Instagram variants
(1, '1,000 متابع حقيقي', '1,000 Real Followers', 'IG-1K', 15.00, 12.00, 9999, '1-3 ساعات', NULL, 1),
(1, '2,500 متابع حقيقي', '2,500 Real Followers', 'IG-2.5K', 35.00, 28.00, 9999, '2-4 ساعات', NULL, 2),
(1, '5,000 متابع حقيقي', '5,000 Real Followers', 'IG-5K', 65.00, 52.00, 9999, '3-6 ساعات', NULL, 3),
(1, '10,000 متابع VIP', '10,000 VIP Followers', 'IG-10K', 120.00, 95.00, 9999, '6-12 ساعة', NULL, 4),
(1, '25,000 متابع مع هدايا تفاعل', '25,000 Followers + Bonus', 'IG-25K', 280.00, 220.00, 9999, '12-24 ساعة', NULL, 5),

-- TikTok variants
(2, '1,000 لايك تيك توك', '1,000 TikTok Likes', 'TT-1K', 8.00, 6.50, 9999, '15 دقيقة', NULL, 1),
(2, '5,000 لايك تيك توك', '5,000 TikTok Likes', 'TT-5K', 30.00, 24.00, 9999, '30 دقيقة', NULL, 2),
(2, '10,000 لايك تيك توك + شير', '10,000 Likes + Shares', 'TT-10K', 55.00, 44.00, 9999, 'ساعة واحدة', NULL, 3),

-- Netflix variants
(3, 'شهر واحد (30 يوم)', '1 Month (30 Days)', 'NFLX-1M', 35.00, 29.00, 40, 'فوري', 30, 1),
(3, '3 أشهر (90 يوم) - الأكثر طلباً', '3 Months (90 Days)', 'NFLX-3M', 95.00, 79.00, 25, 'فوري', 90, 2),
(3, 'سنة كاملة (365 يوم)', '1 Year (365 Days)', 'NFLX-1Y', 350.00, 279.00, 10, 'فوري', 365, 3),

-- YouTube variants
(4, 'شهر واحد (30 يوم)', '1 Month (30 Days)', 'YT-1M', 18.00, 14.00, 80, 'خلال 30 دقيقة', 30, 1),
(4, '3 أشهر (90 يوم)', '3 Months (90 Days)', 'YT-3M', 50.00, 39.00, 50, 'خلال 30 دقيقة', 90, 2),
(4, 'سنة كاملة (12 شهر)', '1 Year (12 Months)', 'YT-1Y', 180.00, 139.00, 30, 'خلال 30 دقيقة', 365, 3);

-- Customer Requirements Fields
INSERT INTO product_requirements (product_id, field_label, field_label_en, field_type, placeholder, is_required, sort_order) VALUES
(1, 'اسم المستخدم في انستقرام (Username)', 'Instagram Username', 'text', '@your_username (بدون كلمة المرور)', 1, 1),
(1, 'رابط الحساب المباشر', 'Profile URL', 'url', 'https://instagram.com/your_account', 1, 2),
(1, 'ملاحظات إضافية للتنفيذ', 'Additional Notes', 'textarea', 'أي تعليمات خاصة بالطلب...', 0, 3),

(2, 'رابط فيديو التيك توك المستهدف', 'TikTok Video URL', 'url', 'https://www.tiktok.com/@user/video/...', 1, 1),

(4, 'البريد الإلكتروني لحساب Google المراد تفعيله', 'Google Account Email', 'email', 'example@gmail.com', 1, 1),

(6, 'البريد الإلكتروني لحساب كانفا المراد دعوته', 'Canva Account Email', 'email', 'name@domain.com', 1, 1);

-- Coupons
INSERT INTO coupons (code, type, value, min_order_amount, max_discount_amount, usage_limit, usage_count, is_active) VALUES
('START10', 'percentage', 10.00, 20.00, 50.00, 500, 28, 1),
('RAMADAN', 'percentage', 15.00, 50.00, 100.00, 1000, 64, 1),
('SAVE5', 'fixed', 5.00, 25.00, 5.00, 200, 12, 1);

-- Store Settings
INSERT INTO settings (`key`, `value`, `group`) VALUES
('store_name', 'عمده ستور - متجر الخدمات الرقمية والباقات', 'general'),
('store_name_en', '3mdh store', 'general'),
('store_url', 'https://3mdh.store/', 'general'),
('store_tagline', 'وجهتك الأولى للخدمات الرقمية، الباقات، ومفاتيح البرامج بأعلى أمان وسرعة تنفيذ', 'general'),
('store_logo', '/icon.svg', 'general'),
('default_currency', 'JOD', 'general'),
('allowed_currencies', '["JOD", "USDT", "USD", "SAR", "AED", "EGP"]', 'general'),
('primary_color', '#4f46e5', 'theme'),
('secondary_color', '#06b6d4', 'theme'),
('support_whatsapp', '+962791234567', 'contact'),
('support_email', 'support@3mdh.store', 'contact'),
('support_telegram', '@amdh_support', 'contact'),
('payment_paypal_enabled', '1', 'payment'),
('payment_paypal_client_id', 'sb-paypal-client-id-live-demo', 'payment'),
('payment_paypal_mode', 'live', 'payment'),
('payment_wallet_enabled', '1', 'payment'),
('smtp_host', 'mail.3mdh.store', 'smtp'),
('smtp_port', '465', 'smtp'),
('smtp_secure', 'ssl', 'smtp'),
('smtp_username', 'noreply@3mdh.store', 'smtp'),
('smtp_password', 'CHANGE_IN_CPANEL', 'smtp'),
('smtp_from_name', '3mdh Store Orders', 'smtp'),
('homepage_sections', '["hero","categories","featured_services","best_sellers","subscriptions","digital_products","offers","reviews","faq","features"]', 'layout');

-- Sample Digital Delivery Inventory (Ready Keys)
INSERT INTO digital_products (product_id, variant_id, item_type, content, is_used) VALUES
(5, NULL, 'license_key', 'VK7JG-NPHTM-C97JM-9MPGT-3V66T', 0),
(5, NULL, 'license_key', 'W269N-WFGWX-YVC9B-4J6C9-T83GX', 0),
(5, NULL, 'license_key', 'MH37W-N47XK-V7XM9-C7227-GCQG9', 0);

-- Sample Reviews
INSERT INTO reviews (product_id, user_name, rating, comment, is_approved) VALUES
(1, 'سلطان القحطاني', 5, 'سرعة تنفيذ غير طبيعية! طلبت 5000 متابع وبدأ التنفيذ في أقل من 10 دقائق والحسابات متفاعلة وممتازة.', 1),
(3, 'خالد العتيبي', 5, 'شغال الحساب بشكل رسمي على شاشتي بدون تقطيع وخدمة العملاء في الواتساب متجاوبين فوراً.', 1),
(5, 'م. طارق يوسف', 5, 'تم تفعيل ويندوز 11 فوراً بالمفتاح الرقمي واستلمته مباشرة في صفحة الفاتورة. متجر احترافي 10/10.', 1),
(4, 'سارة الحربي', 5, 'التفعيل صار على إيميلي الشخصي بدون كلمة مرور، ممتاز جداً ويوفر نصف السعر الأصلي.', 1);

-- Sample Order with History
INSERT INTO orders (id, order_number, user_id, guest_name, guest_email, guest_phone, subtotal, discount_amount, total_amount, currency, payment_status, payment_method, order_status, customer_notes, admin_notes, delivery_notes) VALUES
(1, 'DG-2026-9041', 1, 'أحمد المنصوري', 'customer@example.com', '+966501234567', 41.00, 4.10, 36.90, 'SAR', 'paid', 'apple_pay', 'completed', 'يرجى البدء فوراً بالحساب', 'تم التأكد من صحة الرابط والبدء', 'تم اكتمال إضافة المتابعين بنجاح 100% مع زيادة 150 متابع كهدية.');

INSERT INTO order_items (id, order_id, product_id, variant_id, product_name, variant_title, price, quantity, subtotal) VALUES
(1, 1, 1, 2, 'متابعو انستقرام حقيقيون ومضمونون', '2,500 متابع حقيقي', 28.00, 1, 28.00);

INSERT INTO order_item_requirements (order_item_id, field_label, field_value) VALUES
(1, 'اسم المستخدم في انستقرام (Username)', '@ahmed_mansoori'),
(1, 'رابط الحساب المباشر', 'https://instagram.com/ahmed_mansoori');

INSERT INTO payments (order_id, transaction_reference, payment_gateway, amount, currency, status, paid_at) VALUES
(1, 'TXN_AP_8839219', 'apple_pay', 36.90, 'SAR', 'completed', NOW());

INSERT INTO subscriptions (id, user_id, order_id, product_id, variant_id, start_date, expires_at, duration_days, status, credentials) VALUES
(1, 1, 1, 3, 1, NOW(), DATE_ADD(NOW(), INTERVAL 28 DAY), 30, 'active', 'Email: user.vip4@netflix-stream.net | PIN: 4921 | Profile: Ahmed VIP');
