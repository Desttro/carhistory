import type { Messages } from '../types'

export const messages: Record<keyof Messages, string> = {
  // common
  'common.loading': 'جارٍ التحميل...',
  'common.error': 'حدث خطأ',
  'common.back': 'رجوع',
  'common.save': 'حفظ',
  'common.cancel': 'إلغاء',
  'common.delete': 'حذف',
  'common.miles': 'ميل',
  'common.more': '+{count} المزيد',

  // report detail page
  'report.loading': 'جارٍ تحميل التقرير...',
  'report.notFound.title': 'التقرير غير موجود',
  'report.notFound.description':
    'ربما تم حذف هذا التقرير أو أنك لا تملك صلاحية الوصول إليه.',
  'report.notFound.back': 'العودة إلى التقارير',
  'report.expired.title': 'انتهت صلاحية التقرير',
  'report.expired.description':
    'انتهت صلاحية هذا التقرير. قم بشراء تقرير جديد للحصول على معلومات محدّثة.',
  'report.expired.cta': 'الحصول على تقرير محدّث',
  'report.error.title': 'بيانات التقرير غير متاحة',
  'report.error.description': 'حدثت مشكلة أثناء تحميل بيانات هذا التقرير.',
  'report.vin': 'رقم الهيكل: {vin}',

  // report summary
  'report.issuesFound': 'مشاكل مكتشفة',
  'report.cleanHistory': 'سجل نظيف',
  'report.clean': 'نظيف',
  'report.stat.owners': 'الملاك',
  'report.stat.accidents': 'الحوادث',
  'report.stat.serviceRecords': 'سجلات الصيانة',
  'report.stat.totalEvents': 'إجمالي الأحداث',
  'report.stat.unknown': 'غير معروف',
  'report.odometer.lastReported': 'آخر قراءة مسجّلة للعداد',
  'report.odometer.asOf': 'بتاريخ {date}',
  'report.odometer.issuesDetected': 'تم اكتشاف مشاكل في عداد المسافات',
  'report.totalLoss': 'تم الإبلاغ عن خسارة كلية',
  'report.titleBrands': 'سجلات الملكية',
  'report.dataSources': 'مصادر البيانات',

  // vehicle header
  'vehicle.trim': 'الفئة التجهيزية',
  'vehicle.bodyStyle': 'شكل الهيكل',
  'vehicle.engine': 'المحرك',
  'vehicle.drivetrain': 'نظام الدفع',
  'vehicle.yearMakeModel': 'السنة / الشركة المصنّعة / الطراز',

  // timeline
  'report.timeline': 'الجدول الزمني',
  'report.timeline.noEvents': 'لا توجد أحداث',
  'report.timeline.count': 'الجدول الزمني ({count} أحداث)',
  'report.timeline.ownerUnknown': 'مالك غير معروف',
  'report.timeline.owner': 'المالك {number}',
  'report.timeline.eventCount':
    '{count, plural, zero {لا أحداث} one {حدث واحد} two {حدثان} few {# أحداث} many {# حدثًا} other {# حدث}}',

  // damage visualization
  'damage.severeDamage': 'أضرار بالغة',
  'damage.moderateDamage': 'أضرار متوسطة',
  'damage.minorDamage': 'أضرار طفيفة',
  'damage.damageReported': 'تم الإبلاغ عن أضرار',
  'damage.hoverHint': 'مرر المؤشر فوق المناطق المميزة لعرض التفاصيل',
  'damage.areasWithDamage':
    '{count, plural, zero {لا مناطق} one {منطقة واحدة} two {منطقتان} few {# مناطق} many {# منطقة} other {# منطقة}} بأضرار مبلَّغ عنها',
  'damage.incidentCount':
    '{count, plural, zero {لا حوادث} one {حادثة واحدة} two {حادثتان} few {# حوادث} many {# حادثة} other {# حادثة}}',
  'damage.severityLabel': 'خطورة {severity}',
  'damage.impactArea':
    '{count, plural, zero {لا مناطق تأثير} one {منطقة التأثير} two {منطقتا التأثير} few {مناطق التأثير} many {مناطق التأثير} other {مناطق التأثير}}',

  // event types
  'eventType.TITLE': 'الملكية',
  'eventType.REGISTRATION': 'التسجيل',
  'eventType.LIEN': 'حق الامتياز',
  'eventType.SERVICE': 'الصيانة',
  'eventType.ODOMETER_READING': 'قراءة العداد',
  'eventType.ACCIDENT': 'حادث',
  'eventType.DAMAGE': 'أضرار',
  'eventType.AUCTION': 'مزاد',
  'eventType.LISTING': 'إعلان بيع',
  'eventType.RECALL': 'استدعاء',
  'eventType.WARRANTY': 'ضمان',
  'eventType.INSPECTION': 'فحص',
  'eventType.EMISSION': 'الانبعاثات',
  'eventType.MANUFACTURER': 'الشركة المصنّعة',
  'eventType.INSURANCE': 'التأمين',
  'eventType.OTHER': 'أخرى',

  // severity
  'severity.minor': 'طفيفة',
  'severity.moderate': 'متوسطة',
  'severity.severe': 'بالغة',
  'severity.unknown': 'غير معروفة',

  // damage zones
  'damageZone.front': 'الأمام',
  'damageZone.rear': 'الخلف',
  'damageZone.left-side': 'الجانب الأيسر',
  'damageZone.right-side': 'الجانب الأيمن',
  'damageZone.roof': 'السقف',
  'damageZone.left-front': 'الأمام الأيسر',
  'damageZone.right-front': 'الأمام الأيمن',
  'damageZone.left-rear': 'الخلف الأيسر',
  'damageZone.right-rear': 'الخلف الأيمن',

  // title brands
  'titleBrand.salvage': 'مُهالَك',
  'titleBrand.rebuilt': 'مُعاد بناؤه',
  'titleBrand.flood': 'تعرض للفيضان',
  'titleBrand.fire': 'تعرض للحريق',
  'titleBrand.hail': 'تعرض للبَرَد',
  'titleBrand.junk': 'خردة',
  'titleBrand.lemon': 'معيب',
  'titleBrand.manufacturer buyback': 'استرداد من الشركة المصنّعة',

  // settings
  'settings.title': 'الإعدادات',
  'settings.account': 'الحساب',
  'settings.support': 'الدعم',
  'settings.other': 'أخرى',
  'settings.theme': 'المظهر: {theme}',
  'settings.pushNotifications': 'الإشعارات الفورية',
  'settings.editProfile': 'تعديل الملف الشخصي',
  'settings.helpSupport': 'المساعدة والدعم',
  'settings.documentation': 'التوثيق',
  'settings.termsOfService': 'شروط الخدمة',
  'settings.privacyPolicy': 'سياسة الخصوصية',
  'settings.deleteAccount': 'حذف الحساب',
  'settings.deleteAccountUnavailable': 'حذف الحساب غير متاح حاليًا.',
  'settings.logOut': 'تسجيل الخروج',
  'settings.language': 'اللغة',

  // edit profile
  'editProfile.discardDialog.title': 'تجاهل التغييرات؟',
  'editProfile.discardDialog.description':
    'لديك تغييرات غير محفوظة. هل أنت متأكد من رغبتك في تجاهلها؟',
  'editProfile.discardDialog.stay': 'البقاء',
  'editProfile.discardDialog.discard': 'تجاهل',
  'editProfile.name': 'الاسم',
  'editProfile.namePlaceholder': 'أحمد محمد',
  'editProfile.username': 'اسم المستخدم',
  'editProfile.usernamePlaceholder': 'ahmedmohamed',
  'editProfile.usernameUnavailable': 'اسم المستخدم غير متاح',
  'editProfile.usernameInvalid':
    'الحد الأدنى 3 أحرف، يبدأ بحرف، أحرف/أرقام/_ فقط',
  'editProfile.saving': 'جارٍ الحفظ...',

  // theme labels
  'theme.dark': 'داكن',
  'theme.light': 'فاتح',
  'theme.system': 'تلقائي',

  // auth
  'auth.login': 'تسجيل الدخول',
  'auth.account': 'الحساب',

  // profile
  'profile.reports': 'التقارير',
  'profile.vehicles': 'المركبات',
  'profile.memberSince': 'عضو منذ',

  // nav
  'nav.home': 'الرئيسية',
  'nav.reports': 'التقارير',
  'nav.settings': 'الإعدادات',
}
