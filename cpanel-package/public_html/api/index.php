<?php
/**
 * Digitex Store - Main REST API Controller
 * Production PHP 8.2+ Router for Namecheap cPanel & Apache
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../app/Config/Config.php';
require_once __DIR__ . '/../../app/Config/Database.php';

use App\Config\Config;
use App\Config\Database;

// Load .env
Config::loadEnv(__DIR__ . '/../../.env');

// Helper function to return JSON responses
function jsonResponse(mixed $data, int $status = 200): void {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

// Parse request path
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$scriptName = dirname($_SERVER['SCRIPT_NAME']);
$path = trim(str_replace(['/api', $scriptName], '', $uri), '/');
$method = $_SERVER['REQUEST_METHOD'];
$body = json_decode(file_get_contents('php://input'), true) ?? [];

// Database Connection
try {
    $db = Database::getConnection();
} catch (Exception $e) {
    jsonResponse(['success' => false, 'error' => 'Database connection failed: ' . $e->getMessage()], 500);
}

// -------------------------------------------------------------
// ROUTE: Health check & system check
// -------------------------------------------------------------
if ($path === '' || $path === 'health') {
    jsonResponse([
        'success' => true,
        'app' => 'Digitex Store API',
        'version' => '1.0.0-production',
        'php_version' => PHP_VERSION,
        'database' => 'connected',
        'server_time' => date('Y-m-d H:i:s')
    ]);
}

// -------------------------------------------------------------
// ROUTE: Settings & Branding
// -------------------------------------------------------------
if ($path === 'settings' && $method === 'GET') {
    $stmt = $db->query("SELECT `key`, `value`, `group` FROM settings");
    $settingsRaw = $stmt->fetchAll();
    $settings = [];
    foreach ($settingsRaw as $row) {
        $val = $row['value'];
        if (str_starts_with($val, '{') || str_starts_with($val, '[')) {
            $val = json_decode($val, true);
        }
        $settings[$row['key']] = $val;
    }
    jsonResponse(['success' => true, 'settings' => $settings]);
}

// -------------------------------------------------------------
// ROUTE: Categories
// -------------------------------------------------------------
if ($path === 'categories' && $method === 'GET') {
    $stmt = $db->query("SELECT * FROM categories WHERE is_active = 1 ORDER BY sort_order ASC");
    $categories = $stmt->fetchAll();
    jsonResponse(['success' => true, 'categories' => $categories]);
}

// -------------------------------------------------------------
// ROUTE: Products (List & Filter)
// -------------------------------------------------------------
if ($path === 'products' && $method === 'GET') {
    $categoryId = $_GET['category_id'] ?? null;
    $type = $_GET['type'] ?? null;
    $search = $_GET['search'] ?? null;
    $featured = $_GET['featured'] ?? null;

    $sql = "SELECT p.*, c.name AS category_name, c.slug AS category_slug 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            WHERE p.is_active = 1";
    $params = [];

    if ($categoryId) {
        $sql .= " AND p.category_id = :cat";
        $params['cat'] = $categoryId;
    }
    if ($type) {
        $sql .= " AND p.type = :type";
        $params['type'] = $type;
    }
    if ($featured) {
        $sql .= " AND p.is_featured = 1";
    }
    if ($search) {
        $sql .= " AND (p.name LIKE :s1 OR p.name_en LIKE :s2 OR p.description LIKE :s3 OR p.sku LIKE :s4)";
        $params['s1'] = "%$search%";
        $params['s2'] = "%$search%";
        $params['s3'] = "%$search%";
        $params['s4'] = "%$search%";
    }

    $sql .= " ORDER BY p.id DESC";
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $products = $stmt->fetchAll();

    // Attach variants & requirements to each
    foreach ($products as &$prod) {
        $vStmt = $db->prepare("SELECT * FROM product_variants WHERE product_id = ? AND is_active = 1 ORDER BY sort_order ASC");
        $vStmt->execute([$prod['id']]);
        $prod['variants'] = $vStmt->fetchAll();

        $rStmt = $db->prepare("SELECT * FROM product_requirements WHERE product_id = ? ORDER BY sort_order ASC");
        $rStmt->execute([$prod['id']]);
        $prod['requirements'] = $rStmt->fetchAll();
    }

    jsonResponse(['success' => true, 'products' => $products]);
}

// -------------------------------------------------------------
// ROUTE: Product Single by Slug or ID
// -------------------------------------------------------------
if (preg_match('#^products/([a-zA-Z0-9_-]+)$#', $path, $matches) && $method === 'GET') {
    $slugOrId = $matches[1];
    $stmt = $db->prepare("SELECT p.*, c.name AS category_name, c.slug AS category_slug 
                          FROM products p 
                          LEFT JOIN categories c ON p.category_id = c.id 
                          WHERE (p.slug = :s OR p.id = :id) AND p.is_active = 1 LIMIT 1");
    $stmt->execute(['s' => $slugOrId, 'id' => is_numeric($slugOrId) ? (int)$slugOrId : 0]);
    $product = $stmt->fetch();

    if (!$product) {
        jsonResponse(['success' => false, 'error' => 'Product not found'], 404);
    }

    $vStmt = $db->prepare("SELECT * FROM product_variants WHERE product_id = ? AND is_active = 1 ORDER BY sort_order ASC");
    $vStmt->execute([$product['id']]);
    $product['variants'] = $vStmt->fetchAll();

    $rStmt = $db->prepare("SELECT * FROM product_requirements WHERE product_id = ? ORDER BY sort_order ASC");
    $rStmt->execute([$product['id']]);
    $product['requirements'] = $rStmt->fetchAll();

    $revStmt = $db->prepare("SELECT * FROM reviews WHERE product_id = ? AND is_approved = 1 ORDER BY id DESC");
    $revStmt->execute([$product['id']]);
    $product['reviews'] = $revStmt->fetchAll();

    jsonResponse(['success' => true, 'product' => $product]);
}

// -------------------------------------------------------------
// ROUTE: Validate Coupon
// -------------------------------------------------------------
if ($path === 'coupons/validate' && $method === 'POST') {
    $code = strtoupper(trim($body['code'] ?? ''));
    $subtotal = floatval($body['subtotal'] ?? 0);

    $stmt = $db->prepare("SELECT * FROM coupons WHERE code = ? AND is_active = 1 LIMIT 1");
    $stmt->execute([$code]);
    $coupon = $stmt->fetch();

    if (!$coupon) {
        jsonResponse(['success' => false, 'error' => 'كوبون الخصم غير صحيح أو منتهي الصلاحية'], 400);
    }

    if ($coupon['expires_at'] && strtotime($coupon['expires_at']) < time()) {
        jsonResponse(['success' => false, 'error' => 'عذراً، هذا الكوبون انتهت صلاحيته'], 400);
    }

    if ($coupon['min_order_amount'] > 0 && $subtotal < $coupon['min_order_amount']) {
        jsonResponse(['success' => false, 'error' => "الحد الأدنى لتطبيق الكوبون هو {$coupon['min_order_amount']}"], 400);
    }

    $discount = 0.0;
    if ($coupon['type'] === 'percentage') {
        $discount = ($subtotal * floatval($coupon['value'])) / 100.0;
        if ($coupon['max_discount_amount'] && $discount > floatval($coupon['max_discount_amount'])) {
            $discount = floatval($coupon['max_discount_amount']);
        }
    } else {
        $discount = floatval($coupon['value']);
    }

    jsonResponse([
        'success' => true,
        'coupon' => [
            'id' => $coupon['id'],
            'code' => $coupon['code'],
            'type' => $coupon['type'],
            'value' => $coupon['value'],
            'discount_amount' => round($discount, 2)
        ]
    ]);
}

// -------------------------------------------------------------
// ROUTE: Create Order / Checkout
// -------------------------------------------------------------
if ($path === 'orders' && $method === 'POST') {
    $db->beginTransaction();
    try {
        $orderNumber = 'DG-' . date('Y') . '-' . strtoupper(substr(uniqid(), -6));
        $userId = $body['user_id'] ?? null;
        $guestName = $body['customer_name'] ?? 'عميل المتجر';
        $guestEmail = $body['customer_email'] ?? 'guest@example.com';
        $guestPhone = $body['customer_phone'] ?? '';
        $subtotal = floatval($body['subtotal'] ?? 0);
        $discountAmount = floatval($body['discount_amount'] ?? 0);
        $totalAmount = max(0, $subtotal - $discountAmount);
        $currency = $body['currency'] ?? 'SAR';
        $paymentMethod = $body['payment_method'] ?? 'card';
        $customerNotes = $body['customer_notes'] ?? null;
        $couponId = $body['coupon_id'] ?? null;

        // If paying via wallet, check balance
        if ($paymentMethod === 'wallet' && $userId) {
            $wStmt = $db->prepare("SELECT balance FROM wallets WHERE user_id = ? FOR UPDATE");
            $wStmt->execute([$userId]);
            $wallet = $wStmt->fetch();
            if (!$wallet || floatval($wallet['balance']) < $totalAmount) {
                $db->rollBack();
                jsonResponse(['success' => false, 'error' => 'رصيد المحفظة الحالي غير كافٍ لإتمام الطلب'], 400);
            }
            // Deduct balance
            $upd = $db->prepare("UPDATE wallets SET balance = balance - ? WHERE user_id = ?");
            $upd->execute([$totalAmount, $userId]);

            // Add transaction log
            $tStmt = $db->prepare("INSERT INTO wallet_transactions (wallet_id, type, amount, description) VALUES ((SELECT id FROM wallets WHERE user_id = ?), 'deduction', ?, ?)");
            $tStmt->execute([$userId, $totalAmount, "دفع قيمة الطلب رقم $orderNumber"]);
        }

        $paymentStatus = in_array($paymentMethod, ['card', 'apple_pay', 'mada', 'wallet']) ? 'paid' : 'pending';
        $orderStatus = ($paymentStatus === 'paid') ? 'pending_processing' : 'pending_payment';

        $stmt = $db->prepare("INSERT INTO orders 
            (order_number, user_id, guest_name, guest_email, guest_phone, subtotal, discount_amount, total_amount, currency, coupon_id, payment_status, payment_method, order_status, customer_notes) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $orderNumber, $userId, $guestName, $guestEmail, $guestPhone,
            $subtotal, $discountAmount, $totalAmount, $currency, $couponId,
            $paymentStatus, $paymentMethod, $orderStatus, $customerNotes
        ]);
        $orderId = $db->lastInsertId();

        // Items and Requirements
        $items = $body['items'] ?? [];
        foreach ($items as $item) {
            $iStmt = $db->prepare("INSERT INTO order_items (order_id, product_id, variant_id, product_name, variant_title, price, quantity, subtotal) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            $iStmt->execute([
                $orderId,
                $item['product_id'],
                $item['variant_id'] ?? null,
                $item['product_name'],
                $item['variant_title'] ?? null,
                $item['price'],
                $item['quantity'] ?? 1,
                floatval($item['price']) * intval($item['quantity'] ?? 1)
            ]);
            $orderItemId = $db->lastInsertId();

            // Save customer requirements answers
            if (!empty($item['requirements']) && is_array($item['requirements'])) {
                $rStmt = $db->prepare("INSERT INTO order_item_requirements (order_item_id, field_label, field_value) VALUES (?, ?, ?)");
                foreach ($item['requirements'] as $label => $val) {
                    $rStmt->execute([$orderItemId, $label, is_array($val) ? json_encode($val) : strval($val)]);
                }
            }

            // Auto-fulfill digital key if product is digital
            if ($paymentStatus === 'paid') {
                $pStmt = $db->prepare("SELECT type, duration_days FROM products WHERE id = ?");
                $pStmt->execute([$item['product_id']]);
                $prod = $pStmt->fetch();

                if ($prod && $prod['type'] === 'digital') {
                    $kStmt = $db->prepare("SELECT * FROM digital_products WHERE product_id = ? AND is_used = 0 LIMIT 1 FOR UPDATE");
                    $kStmt->execute([$item['product_id']]);
                    $key = $kStmt->fetch();
                    if ($key) {
                        $upKey = $db->prepare("UPDATE digital_products SET is_used = 1, order_item_id = ?, assigned_at = NOW() WHERE id = ?");
                        $upKey->execute([$orderItemId, $key['id']]);
                    }
                }

                // If subscription, create subscription record
                if ($prod && ($prod['type'] === 'subscription' || !empty($prod['duration_days'])) && $userId) {
                    $days = $item['duration_days'] ?? $prod['duration_days'] ?? 30;
                    $subStmt = $db->prepare("INSERT INTO subscriptions (user_id, order_id, product_id, variant_id, start_date, expires_at, duration_days, status, credentials) VALUES (?, ?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL ? DAY), ?, 'active', ?)");
                    $subStmt->execute([
                        $userId, $orderId, $item['product_id'], $item['variant_id'] ?? null,
                        $days, $days, 'بيانات الحساب: تم تفعيل الاشتراك بنجاح'
                    ]);
                }
            }
        }

        // Add payment record
        $payStmt = $db->prepare("INSERT INTO payments (order_id, transaction_reference, payment_gateway, amount, currency, status, paid_at) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $payStmt->execute([
            $orderId,
            'TXN_' . strtoupper(substr(md5(uniqid()), 0, 10)),
            $paymentMethod,
            $totalAmount,
            $currency,
            $paymentStatus === 'paid' ? 'completed' : 'pending',
            $paymentStatus === 'paid' ? date('Y-m-d H:i:s') : null
        ]);

        $db->commit();

        jsonResponse([
            'success' => true,
            'message' => 'تم إنشاء الطلب بنجاح',
            'order_id' => $orderId,
            'order_number' => $orderNumber,
            'total' => $totalAmount,
            'status' => $orderStatus
        ]);
    } catch (Exception $e) {
        $db->rollBack();
        jsonResponse(['success' => false, 'error' => 'تعذر إتمام الطلب: ' . $e->getMessage()], 500);
    }
}

// -------------------------------------------------------------
// ROUTE: Get Order Details (Tracking)
// -------------------------------------------------------------
if (preg_match('#^orders/([a-zA-Z0-9_-]+)$#', $path, $matches) && $method === 'GET') {
    $orderNumber = $matches[1];
    $stmt = $db->prepare("SELECT * FROM orders WHERE order_number = ? OR id = ? LIMIT 1");
    $stmt->execute([$orderNumber, is_numeric($orderNumber) ? $orderNumber : 0]);
    $order = $stmt->fetch();

    if (!$order) {
        jsonResponse(['success' => false, 'error' => 'الطلب غير موجود'], 404);
    }

    $iStmt = $db->prepare("SELECT oi.*, p.image, p.type AS product_type 
                           FROM order_items oi 
                           LEFT JOIN products p ON oi.product_id = p.id 
                           WHERE oi.order_id = ?");
    $iStmt->execute([$order['id']]);
    $items = $iStmt->fetchAll();

    foreach ($items as &$item) {
        $rStmt = $db->prepare("SELECT field_label, field_value FROM order_item_requirements WHERE order_item_id = ?");
        $rStmt->execute([$item['id']]);
        $item['requirements'] = $rStmt->fetchAll();

        // Check if digital product was assigned
        $kStmt = $db->prepare("SELECT content, item_type FROM digital_products WHERE order_item_id = ?");
        $kStmt->execute([$item['id']]);
        $item['delivered_item'] = $kStmt->fetch();
    }
    $order['items'] = $items;

    jsonResponse(['success' => true, 'order' => $order]);
}

// -------------------------------------------------------------
// ROUTE: Customer Subscriptions
// -------------------------------------------------------------
if ($path === 'subscriptions' && $method === 'GET') {
    $userId = $_GET['user_id'] ?? 1;
    $stmt = $db->prepare("SELECT s.*, p.name AS product_name, p.image, p.slug 
                          FROM subscriptions s 
                          JOIN products p ON s.product_id = p.id 
                          WHERE s.user_id = ? 
                          ORDER BY s.id DESC");
    $stmt->execute([$userId]);
    $subs = $stmt->fetchAll();
    jsonResponse(['success' => true, 'subscriptions' => $subs]);
}

// -------------------------------------------------------------
// ROUTE: Customer Digital Library
// -------------------------------------------------------------
if ($path === 'digital-inventory' && $method === 'GET') {
    $userId = $_GET['user_id'] ?? 1;
    $stmt = $db->prepare("SELECT dp.*, p.name AS product_name, p.image, o.order_number 
                          FROM digital_products dp 
                          JOIN order_items oi ON dp.order_item_id = oi.id 
                          JOIN orders o ON oi.order_id = o.id 
                          JOIN products p ON dp.product_id = p.id 
                          WHERE o.user_id = ? 
                          ORDER BY dp.id DESC");
    $stmt->execute([$userId]);
    $items = $stmt->fetchAll();
    jsonResponse(['success' => true, 'items' => $items]);
}

// -------------------------------------------------------------
// ROUTE: Wallet
// -------------------------------------------------------------
if ($path === 'wallet' && $method === 'GET') {
    $userId = $_GET['user_id'] ?? 1;
    $stmt = $db->prepare("SELECT * FROM wallets WHERE user_id = ?");
    $stmt->execute([$userId]);
    $wallet = $stmt->fetch();

    if (!$wallet) {
        $db->prepare("INSERT INTO wallets (user_id, balance, currency) VALUES (?, 0.00, 'SAR')")->execute([$userId]);
        $wallet = ['user_id' => $userId, 'balance' => 0.00, 'currency' => 'SAR'];
    }

    $tStmt = $db->prepare("SELECT * FROM wallet_transactions WHERE wallet_id = (SELECT id FROM wallets WHERE user_id = ?) ORDER BY id DESC LIMIT 20");
    $tStmt->execute([$userId]);
    $transactions = $tStmt->fetchAll();

    jsonResponse(['success' => true, 'wallet' => $wallet, 'transactions' => $transactions]);
}

// -------------------------------------------------------------
// ROUTE: Admin Login
// -------------------------------------------------------------
if ($path === 'admin/login' && $method === 'POST') {
    $email = trim($body['email'] ?? '');
    $password = $body['password'] ?? '';

    $stmt = $db->prepare("SELECT * FROM admins WHERE email = ? AND status = 'active' LIMIT 1");
    $stmt->execute([$email]);
    $admin = $stmt->fetch();

    if ($admin && password_verify($password, $admin['password'])) {
        unset($admin['password']);
        $token = bin2hex(random_bytes(32));
        jsonResponse([
            'success' => true,
            'token' => $token,
            'admin' => $admin
        ]);
    } else {
        jsonResponse(['success' => false, 'error' => 'بيانات الدخول غير صحيحة'], 401);
    }
}

// Fallback for unhandled routes
jsonResponse(['success' => false, 'error' => 'Endpoint not found', 'path' => $path], 404);
