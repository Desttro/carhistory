import type { Messages } from '../types'

export const messages: Record<keyof Messages, string> = {
  // common
  'common.loading': '加载中...',
  'common.error': '发生了一个错误',
  'common.back': '返回',
  'common.save': '保存',
  'common.cancel': '取消',
  'common.delete': '删除',
  'common.miles': '英里',
  'common.more': '+{count} 更多',

  // report detail page
  'report.loading': '正在加载报告...',
  'report.notFound.title': '未找到报告',
  'report.notFound.description': '此报告可能已被删除，或您无权访问。',
  'report.notFound.back': '返回报告列表',
  'report.expired.title': '报告已过期',
  'report.expired.description': '此报告已过期。请购买新报告以获取最新信息。',
  'report.expired.cta': '获取更新报告',
  'report.error.title': '报告数据不可用',
  'report.error.description': '加载此报告数据时出现问题。',
  'report.vin': 'VIN：{vin}',

  // report summary
  'report.issuesFound': '发现问题',
  'report.cleanHistory': '清洁历史',
  'report.clean': '清洁',
  'report.stat.owners': '车主',
  'report.stat.accidents': '事故',
  'report.stat.serviceRecords': '维修记录',
  'report.stat.totalEvents': '总事件数',
  'report.stat.unknown': '未知',
  'report.odometer.lastReported': '最后报告的里程数',
  'report.odometer.asOf': '截至 {date}',
  'report.odometer.issuesDetected': '检测到里程表问题',
  'report.totalLoss': '已报告全损',
  'report.titleBrands': '产权记录',
  'report.dataSources': '数据来源',

  // vehicle header
  'vehicle.trim': '配置',
  'vehicle.bodyStyle': '车身类型',
  'vehicle.engine': '发动机',
  'vehicle.drivetrain': '驱动系统',
  'vehicle.yearMakeModel': '年份 / 品牌 / 型号',

  // timeline
  'report.timeline': '时间线',
  'report.timeline.noEvents': '未找到事件',
  'report.timeline.count': '时间线（{count} 个事件）',
  'report.timeline.ownerUnknown': '未知车主',
  'report.timeline.owner': '车主 {number}',
  'report.timeline.eventCount': '{count, plural, other {# 个事件}}',

  // damage visualization
  'damage.severeDamage': '严重损坏',
  'damage.moderateDamage': '中等损坏',
  'damage.minorDamage': '轻微损坏',
  'damage.damageReported': '已报告损坏',
  'damage.hoverHint': '将鼠标悬停在高亮区域以查看详情',
  'damage.areasWithDamage': '{count, plural, other {# 个区域}}有报告损坏',
  'damage.incidentCount': '{count, plural, other {# 起事故}}',
  'damage.severityLabel': '{severity} 严重程度',
  'damage.impactArea': '{count, plural, other {撞击区域}}',

  // event types
  'eventType.TITLE': '产权',
  'eventType.REGISTRATION': '登记注册',
  'eventType.LIEN': '留置权',
  'eventType.SERVICE': '维修保养',
  'eventType.ODOMETER_READING': '里程表读数',
  'eventType.ACCIDENT': '事故',
  'eventType.DAMAGE': '损坏',
  'eventType.AUCTION': '拍卖',
  'eventType.LISTING': '挂牌出售',
  'eventType.RECALL': '召回',
  'eventType.WARRANTY': '保修',
  'eventType.INSPECTION': '检验',
  'eventType.EMISSION': '排放',
  'eventType.MANUFACTURER': '制造商',
  'eventType.INSURANCE': '保险',
  'eventType.OTHER': '其他',

  // severity
  'severity.minor': '轻微',
  'severity.moderate': '中等',
  'severity.severe': '严重',
  'severity.unknown': '未知',

  // damage zones
  'damageZone.front': '前部',
  'damageZone.rear': '后部',
  'damageZone.left-side': '左侧',
  'damageZone.right-side': '右侧',
  'damageZone.roof': '车顶',
  'damageZone.left-front': '左前部',
  'damageZone.right-front': '右前部',
  'damageZone.left-rear': '左后部',
  'damageZone.right-rear': '右后部',

  // title brands
  'titleBrand.salvage': '事故车',
  'titleBrand.rebuilt': '修复车',
  'titleBrand.flood': '水淹车',
  'titleBrand.fire': '火灾车',
  'titleBrand.hail': '冰雹损坏',
  'titleBrand.junk': '报废车',
  'titleBrand.lemon': '缺陷车',
  'titleBrand.manufacturer buyback': '厂家回购',

  // settings
  'settings.account': '账户',
  'settings.support': '支持',
  'settings.other': '其他',
  'settings.theme': '主题：{theme}',
  'settings.pushNotifications': '推送通知',
  'settings.editProfile': '编辑资料',
  'settings.blockedUsers': '已屏蔽用户',
  'settings.helpSupport': '帮助与支持',
  'settings.documentation': '文档',
  'settings.termsOfService': '服务条款',
  'settings.privacyPolicy': '隐私政策',
  'settings.deleteAccount': '删除账户',
  'settings.deleteAccountUnavailable': '目前无法删除账户。',
  'settings.logOut': '退出登录',
  'settings.language': '语言',

  // edit profile
  'editProfile.discardDialog.title': '放弃更改？',
  'editProfile.discardDialog.description':
    '您有未保存的更改。确定要放弃吗？',
  'editProfile.discardDialog.stay': '留下',
  'editProfile.discardDialog.discard': '放弃',
  'editProfile.name': '姓名',
  'editProfile.namePlaceholder': '张三',
  'editProfile.username': '用户名',
  'editProfile.usernamePlaceholder': 'zhangsan',
  'editProfile.usernameUnavailable': '用户名不可用',
  'editProfile.usernameInvalid':
    '至少3个字符，以字母开头，仅限字母/数字/_',
  'editProfile.saving': '保存中...',

  // theme labels
  'theme.dark': '深色',
  'theme.light': '浅色',
  'theme.system': '跟随系统',

  // auth
  'auth.login': '登录',
  'auth.account': '账户',

  // profile
  'profile.reports': '报告',
  'profile.vehicles': '车辆',
  'profile.memberSince': '加入时间',

  // nav
  'nav.home': '首页',
  'nav.reports': '报告',
  'nav.settings': '设置',
}
