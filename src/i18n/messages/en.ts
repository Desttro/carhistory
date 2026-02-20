export const messages = {
  // common
  'common.loading': 'Loading...',
  'common.error': 'An error occurred',
  'common.back': 'Back',
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.delete': 'Delete',
  'common.miles': 'miles',
  'common.more': '+{count} more',

  // report detail page
  'report.loading': 'Loading report...',
  'report.notFound.title': 'Report Not Found',
  'report.notFound.description':
    "This report may have been deleted or you don't have access to it.",
  'report.notFound.back': 'Back to Reports',
  'report.expired.title': 'Report Expired',
  'report.expired.description':
    'This report has expired. Purchase a new report to get updated information.',
  'report.expired.cta': 'Get Updated Report',
  'report.error.title': 'Report Data Unavailable',
  'report.error.description': "There was an issue loading this report's data.",
  'report.vin': 'VIN: {vin}',

  // report summary
  'report.issuesFound': 'Issues Found',
  'report.cleanHistory': 'Clean History',
  'report.clean': 'Clean',
  'report.stat.owners': 'Owners',
  'report.stat.accidents': 'Accidents',
  'report.stat.serviceRecords': 'Service Records',
  'report.stat.totalEvents': 'Total Events',
  'report.stat.unknown': 'Unknown',
  'report.odometer.lastReported': 'Last Reported Odometer',
  'report.odometer.asOf': 'as of {date}',
  'report.odometer.issuesDetected': 'Odometer issues detected',
  'report.totalLoss': 'Total Loss Reported',
  'report.titleBrands': 'Title Brands',
  'report.dataSources': 'Data Sources',

  // vehicle header
  'vehicle.trim': 'Trim',
  'vehicle.bodyStyle': 'Body Style',
  'vehicle.engine': 'Engine',
  'vehicle.drivetrain': 'Drivetrain',
  'vehicle.yearMakeModel': 'Year / Make / Model',

  // timeline
  'report.timeline': 'Timeline',
  'report.timeline.noEvents': 'No events found',
  'report.timeline.count': 'Timeline ({count} events)',
  'report.timeline.ownerUnknown': 'Unknown Owner',
  'report.timeline.owner': 'Owner {number}',
  'report.timeline.eventCount': '{count, plural, one {# event} other {# events}}',

  // damage visualization
  'damage.severeDamage': 'Severe Damage',
  'damage.moderateDamage': 'Moderate Damage',
  'damage.minorDamage': 'Minor Damage',
  'damage.damageReported': 'Damage Reported',
  'damage.hoverHint': 'Hover over highlighted areas to see details',
  'damage.areasWithDamage':
    '{count, plural, one {# area} other {# areas}} with reported damage',
  'damage.incidentCount': '{count, plural, one {# incident} other {# incidents}}',
  'damage.severityLabel': '{severity} severity',
  'damage.impactArea': '{count, plural, one {Impact area} other {Impact areas}}',

  // event types
  'eventType.TITLE': 'Title',
  'eventType.REGISTRATION': 'Registration',
  'eventType.LIEN': 'Lien',
  'eventType.SERVICE': 'Service',
  'eventType.ODOMETER_READING': 'Odometer Reading',
  'eventType.ACCIDENT': 'Accident',
  'eventType.DAMAGE': 'Damage',
  'eventType.AUCTION': 'Auction',
  'eventType.LISTING': 'Listing',
  'eventType.RECALL': 'Recall',
  'eventType.WARRANTY': 'Warranty',
  'eventType.INSPECTION': 'Inspection',
  'eventType.EMISSION': 'Emission',
  'eventType.MANUFACTURER': 'Manufacturer',
  'eventType.INSURANCE': 'Insurance',
  'eventType.OTHER': 'Other',

  // severity
  'severity.minor': 'Minor',
  'severity.moderate': 'Moderate',
  'severity.severe': 'Severe',
  'severity.unknown': 'Unknown',

  // damage zones
  'damageZone.front': 'Front',
  'damageZone.rear': 'Rear',
  'damageZone.left-side': 'Left Side',
  'damageZone.right-side': 'Right Side',
  'damageZone.roof': 'Roof',
  'damageZone.left-front': 'Left Front',
  'damageZone.right-front': 'Right Front',
  'damageZone.left-rear': 'Left Rear',
  'damageZone.right-rear': 'Right Rear',

  // title brands
  'titleBrand.salvage': 'Salvage',
  'titleBrand.rebuilt': 'Rebuilt',
  'titleBrand.flood': 'Flood',
  'titleBrand.fire': 'Fire',
  'titleBrand.hail': 'Hail',
  'titleBrand.junk': 'Junk',
  'titleBrand.lemon': 'Lemon',
  'titleBrand.manufacturer buyback': 'Manufacturer Buyback',

  // settings
  'settings.account': 'Account',
  'settings.support': 'Support',
  'settings.other': 'Other',
  'settings.theme': 'Theme: {theme}',
  'settings.pushNotifications': 'Push Notifications',
  'settings.editProfile': 'Edit Profile',
  'settings.blockedUsers': 'Blocked Users',
  'settings.helpSupport': 'Help & Support',
  'settings.documentation': 'Documentation',
  'settings.termsOfService': 'Terms of Service',
  'settings.privacyPolicy': 'Privacy Policy',
  'settings.deleteAccount': 'Delete Account',
  'settings.deleteAccountUnavailable': 'Account deletion is not currently available.',
  'settings.logOut': 'Log Out',
  'settings.language': 'Language',

  // theme labels
  'theme.dark': 'Dark',
  'theme.light': 'Light',
  'theme.system': 'System',

  // auth
  'auth.login': 'Login',
  'auth.account': 'Account',

  // profile
  'profile.reports': 'Reports',
  'profile.vehicles': 'Vehicles',
  'profile.memberSince': 'Member Since',

  // nav
  'nav.home': 'Home',
  'nav.reports': 'Reports',
  'nav.settings': 'Settings',
} as const satisfies Record<string, string>
