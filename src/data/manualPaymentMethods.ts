import { ManualPaymentMethod } from '../types';

export const INITIAL_MANUAL_PAYMENT_METHODS: ManualPaymentMethod[] = [
  // 1. Zain Cash Jordan (محفظة زين كاش - الأردن)
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
  // 2. CliQ Jordan (كليك الأردن - فوري لجميع البنوك)
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
  // 3. Orange Money Jordan (محفظة أورنج موني)
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
  // 4. Binance Pay (بينانس باي عبر ID المعرف)
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
  // 5. RedotPay Global Wallet (محفظة ريدوت باي العالمية)
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
  // 6. STC Pay / UrPay (محافظ السعودية الإلكترونية)
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
  // 7. Local Bank Transfer (تحويل بنكي مباشر)
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
