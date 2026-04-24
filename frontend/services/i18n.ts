import type { Locale } from './preferences';

type Dict = Record<string, string>;

const en: Dict = {
  // Tabs
  'tab.scan': 'Scan',
  'tab.search': 'Search',
  'tab.history': 'History',
  'tab.settings': 'Settings',

  // Home (scan)
  'home.tip.eyebrow': 'QUICK TIP',
  'home.tip.fallback': 'Better light · faster detection.',
  'home.search.placeholder': 'Search for medicine or brand…',
  'home.status.idle': 'ALIGN MEDICINE PACKAGING WITHIN THE FRAME',
  'home.status.capturing': 'CAPTURING...',
  'home.status.analyzing': 'READING TEXT FROM IMAGE...',
  'home.status.searchingPrefix': 'SEARCHING',
  'home.status.found': 'MEDICINE FOUND',
  'home.status.noMatch': 'NO MATCH — TAP CAPTURE TO TRY AGAIN',
  'home.loader.capturing': 'Capturing',
  'home.loader.analyzing': 'Reading text from image',
  'home.loader.searching': 'Searching for medicine',
  'home.loader.matching': 'matching',
  'home.found': 'FOUND',
  'home.noMatch': 'NO MATCH',
  'home.salt': 'Salt',
  'home.alsoAs': 'Also as:',
  'home.viewFull': 'View full details',
  'home.noMatchTitle': 'No matching medicine',
  'home.similarSalts': 'SIMILAR SALTS',
  'home.tryAgain': 'Try again',
  'home.permission.title': 'Camera Access Required',
  'home.permission.body':
    'DawaLens needs camera access to scan medicine packaging.',
  'home.permission.grant': 'Grant Permission',

  // Search
  'search.title': 'Search',
  'search.module': 'MODULE — 02',
  'search.placeholder': 'Salt or brand — e.g. Paracetamol',
  'search.previous': 'PREVIOUS SEARCHES',
  'search.clear': 'Clear',
  'search.empty.title': 'Your searches will appear here',
  'search.empty.body':
    "Once you look up a medicine, we'll keep the last few handy so you can jump back in with one tap.",
  'search.lookup': 'Looking up',
  'search.matches': 'MATCHES',
  'search.match': 'MATCH',
  'search.noExact': 'No exact match for',
  'search.noResults.title': 'No matching medicine',
  'search.noResults.body':
    "We couldn't find a salt or brand matching your query. Check the spelling, or try the scanner — it reads directly from packaging.",
  'search.openScanner': 'Open scanner',
  'search.brandsLabel': 'Brands:',
  'search.alsoAs': 'Also as:',
  'search.contains': 'Salt',

  // History
  'history.title': 'History',
  'history.filter.all': 'All',
  'history.filter.scans': 'Scans',
  'history.filter.searches': 'Searches',
  'history.filter.saved': 'Saved',
  'history.section.activity': 'RECENT ACTIVITY',
  'history.section.saved': 'YOUR SAVES',
  'history.empty.all.title': 'Nothing here yet',
  'history.empty.all.body':
    'Scanned or searched medicines will appear in this list.',
  'history.empty.scan.title': 'No scans yet',
  'history.empty.scan.body':
    'Use the scanner on the home tab to identify medicine packaging.',
  'history.empty.search.title': 'No searches yet',
  'history.empty.search.body':
    'Try looking up a medicine by salt or brand from the search tab.',
  'history.empty.saved.title': 'No saved medicines',
  'history.empty.saved.body':
    'Open a medicine detail and tap the bookmark icon to save it here.',
  'history.badge.scan': 'SCAN',
  'history.badge.search': 'SEARCH',
  'history.badge.saved': 'SAVED',
  'history.retry': 'Retry',
  'history.justNow': 'Just now',

  // Settings
  'settings.title': 'Settings',
  'settings.section.preferences': 'PREFERENCES',
  'settings.theme': 'Appearance',
  'settings.theme.light': 'Light',
  'settings.theme.dark': 'Dark',
  'settings.language': 'Language',
  'settings.section.about': 'ABOUT',
  'settings.privacy': 'Privacy Policy',
  'settings.deviceId': 'DEVICE ID',
  'settings.deviceHint':
    'Your history is saved anonymously against this device. No account needed.',
  'settings.version': 'DawaLens Version 1.0.0',
  'settings.disclaimer.title': 'MEDICAL DISCLAIMER',
  'settings.disclaimer.body':
    'DawaLens is an AI-powered assistant designed for informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.',
  'settings.restart.title': 'App restart required',
  'settings.restart.body':
    'Switching to Urdu changes the layout direction. Please close and reopen DawaLens for the change to fully apply.',
  'settings.restart.ok': 'OK',

  // Medicine detail
  'medicine.title': 'Medicine Details',
  'medicine.translate.toUrdu': 'Translate to Urdu',
  'medicine.translate.toEnglish': 'Translate to English',
  'medicine.tab.overview': 'Overview',
  'medicine.tab.dosage': 'Dosage',
  'medicine.tab.warnings': 'Warnings',
  'medicine.tab.special': 'Special Use',
  'medicine.tab.products': 'Products',
  'medicine.loading': 'Loading medicine...',
  'medicine.error.title': 'Unable to load',
  'medicine.error.body': 'Medicine not found.',
  'medicine.retry': 'Retry',

  // Common
  'common.close': 'Close',
  'common.ok': 'OK',
};

const ur: Dict = {
  'tab.scan': 'اسکین',
  'tab.search': 'تلاش',
  'tab.history': 'تاریخ',
  'tab.settings': 'ترتیبات',

  'home.tip.eyebrow': 'ضروری ہدایت',
  'home.tip.fallback': 'بہتر روشنی · تیز شناخت۔',
  'home.search.placeholder': 'دوا یا برانڈ تلاش کریں…',
  'home.status.idle': 'دوا کی پیکنگ کو فریم میں درست رکھیں',
  'home.status.capturing': 'تصویر لی جا رہی ہے...',
  'home.status.analyzing': 'تصویر سے متن پڑھا جا رہا ہے...',
  'home.status.searchingPrefix': 'تلاش',
  'home.status.found': 'دوا مل گئی',
  'home.status.noMatch': 'کوئی مماثلت نہیں — دوبارہ کوشش کریں',
  'home.loader.capturing': 'تصویر لی جا رہی ہے',
  'home.loader.analyzing': 'متن پڑھا جا رہا ہے',
  'home.loader.searching': 'دوا تلاش کی جا رہی ہے',
  'home.loader.matching': 'مماثلت',
  'home.found': 'مل گئی',
  'home.noMatch': 'دستیاب نہیں',
  'home.salt': 'نمک',
  'home.alsoAs': 'دیگر نام:',
  'home.viewFull': 'مکمل تفصیل دیکھیں',
  'home.noMatchTitle': 'کوئی مماثل دوا نہیں',
  'home.similarSalts': 'ملتے جلتے اجزاء',
  'home.tryAgain': 'دوبارہ کوشش کریں',
  'home.permission.title': 'کیمرہ کی اجازت درکار ہے',
  'home.permission.body':
    'دوا کی پیکنگ اسکین کرنے کے لیے ڈاوا لینس کو کیمرہ کی اجازت چاہیے۔',
  'home.permission.grant': 'اجازت دیں',

  'search.title': 'تلاش',
  'search.module': 'ماڈیول — ۰۲',
  'search.placeholder': 'نمک یا برانڈ — مثال: پیراسیٹامول',
  'search.previous': 'پچھلی تلاش',
  'search.clear': 'صاف کریں',
  'search.empty.title': 'آپ کی تلاش یہاں ظاہر ہو گی',
  'search.empty.body':
    'ایک بار دوا تلاش کرنے پر، آخری تلاشیں یہاں محفوظ ہوں گی۔',
  'search.lookup': 'تلاش جاری',
  'search.matches': 'نتائج',
  'search.match': 'نتیجہ',
  'search.noExact': 'کوئی مکمل مماثلت نہیں',
  'search.noResults.title': 'کوئی مماثل دوا نہیں',
  'search.noResults.body':
    'املا درست کریں یا اسکینر استعمال کریں — یہ پیکنگ سے براہ راست پڑھتا ہے۔',
  'search.openScanner': 'اسکینر کھولیں',
  'search.brandsLabel': 'برانڈز:',
  'search.alsoAs': 'دیگر نام:',
  'search.contains': 'نمک',

  'history.title': 'تاریخ',
  'history.filter.all': 'تمام',
  'history.filter.scans': 'اسکین',
  'history.filter.searches': 'تلاش',
  'history.filter.saved': 'محفوظ',
  'history.section.activity': 'حالیہ سرگرمی',
  'history.section.saved': 'محفوظ شدہ',
  'history.empty.all.title': 'ابھی یہاں کچھ نہیں',
  'history.empty.all.body': 'اسکین یا تلاش کردہ دوائیں یہاں نظر آئیں گی۔',
  'history.empty.scan.title': 'ابھی کوئی اسکین نہیں',
  'history.empty.scan.body':
    'ہوم ٹیب سے اسکینر استعمال کریں تاکہ پیکنگ شناخت ہو سکے۔',
  'history.empty.search.title': 'ابھی کوئی تلاش نہیں',
  'history.empty.search.body':
    'تلاش ٹیب سے نمک یا برانڈ کے ذریعے دوا تلاش کریں۔',
  'history.empty.saved.title': 'کوئی محفوظ دوا نہیں',
  'history.empty.saved.body':
    'دوا کی تفصیل کھولیں اور بک مارک کا آئیکن دبائیں۔',
  'history.badge.scan': 'اسکین',
  'history.badge.search': 'تلاش',
  'history.badge.saved': 'محفوظ',
  'history.retry': 'دوبارہ کوشش',
  'history.justNow': 'ابھی',

  'settings.title': 'ترتیبات',
  'settings.section.preferences': 'ترجیحات',
  'settings.theme': 'ظاہری حالت',
  'settings.theme.light': 'روشن',
  'settings.theme.dark': 'تاریک',
  'settings.language': 'زبان',
  'settings.section.about': 'تعارف',
  'settings.privacy': 'رازداری کی پالیسی',
  'settings.deviceId': 'ڈیوائس آئی ڈی',
  'settings.deviceHint':
    'آپ کی تاریخ اس ڈیوائس کے ساتھ گمنام طور پر محفوظ ہوتی ہے۔ اکاؤنٹ کی ضرورت نہیں۔',
  'settings.version': 'ڈاوا لینس ورژن 1.0.0',
  'settings.disclaimer.title': 'طبی تنبیہ',
  'settings.disclaimer.body':
    'ڈاوا لینس صرف معلوماتی مقاصد کے لیے ہے۔ یہ پیشہ ورانہ طبی مشورے، تشخیص یا علاج کا متبادل نہیں۔ کسی بھی طبی حالت کے بارے میں اپنے معالج سے رجوع کریں۔',
  'settings.restart.title': 'ایپ دوبارہ شروع کرنا ضروری',
  'settings.restart.body':
    'اردو منتخب کرنے سے لیے آؤٹ کی سمت بدل جاتی ہے۔ مکمل اطلاق کے لیے ایپ بند کر کے دوبارہ کھولیں۔',
  'settings.restart.ok': 'ٹھیک ہے',

  'medicine.title': 'دوا کی تفصیل',
  'medicine.translate.toUrdu': 'اردو میں ترجمہ',
  'medicine.translate.toEnglish': 'انگریزی میں ترجمہ',
  'medicine.tab.overview': 'جائزہ',
  'medicine.tab.dosage': 'مقدار',
  'medicine.tab.warnings': 'احتیاطیں',
  'medicine.tab.special': 'خاص استعمال',
  'medicine.tab.products': 'مصنوعات',
  'medicine.loading': 'دوا لوڈ ہو رہی ہے...',
  'medicine.error.title': 'لوڈ نہیں ہو سکا',
  'medicine.error.body': 'دوا نہیں ملی۔',
  'medicine.retry': 'دوبارہ کوشش',

  'common.close': 'بند کریں',
  'common.ok': 'ٹھیک ہے',
};

const DICTS: Record<Locale, Dict> = { en, ur };

export const translate = (locale: Locale, key: string): string => {
  const dict = DICTS[locale] || DICTS.en;
  return dict[key] ?? DICTS.en[key] ?? key;
};

export const isRTL = (locale: Locale): boolean => locale === 'ur';
