import type { Messages } from '../types'

export const messages: Record<keyof Messages, string> = {
  // common
  'common.loading': 'Načítání...',
  'common.error': 'Došlo k chybě',
  'common.back': 'Zpět',
  'common.save': 'Uložit',
  'common.cancel': 'Zrušit',
  'common.delete': 'Smazat',
  'common.miles': 'mil',
  'common.more': '+{count} dalších',

  // report detail page
  'report.loading': 'Načítání zprávy...',
  'report.notFound.title': 'Zpráva nenalezena',
  'report.notFound.description':
    'Tato zpráva mohla být smazána nebo k ní nemáte přístup.',
  'report.notFound.back': 'Zpět na zprávy',
  'report.expired.title': 'Zpráva vypršela',
  'report.expired.description':
    'Platnost této zprávy vypršela. Zakupte novou zprávu pro aktuální informace.',
  'report.expired.cta': 'Získat aktualizovanou zprávu',
  'report.error.title': 'Data zprávy nejsou dostupná',
  'report.error.description': 'Při načítání dat této zprávy došlo k chybě.',
  'report.vin': 'VIN: {vin}',

  // report summary
  'report.issuesFound': 'Nalezeny problémy',
  'report.cleanHistory': 'Čistá historie',
  'report.clean': 'Čistý',
  'report.stat.owners': 'Majitelé',
  'report.stat.accidents': 'Nehody',
  'report.stat.serviceRecords': 'Záznamy o servisu',
  'report.stat.totalEvents': 'Celkem událostí',
  'report.stat.unknown': 'Neznámý',
  'report.odometer.lastReported': 'Naposledy nahlášený stav kilometrů',
  'report.odometer.asOf': 'k {date}',
  'report.odometer.issuesDetected': 'Zjištěny problémy s tachometrem',
  'report.totalLoss': 'Hlášena totální škoda',
  'report.titleBrands': 'Záznamy titulu',
  'report.dataSources': 'Zdroje dat',

  // vehicle header
  'vehicle.trim': 'Výbava',
  'vehicle.bodyStyle': 'Karoserie',
  'vehicle.engine': 'Motor',
  'vehicle.drivetrain': 'Pohon',
  'vehicle.yearMakeModel': 'Rok / Značka / Model',

  // timeline
  'report.timeline': 'Časová osa',
  'report.timeline.noEvents': 'Žádné události nenalezeny',
  'report.timeline.count': 'Časová osa ({count} událostí)',
  'report.timeline.ownerUnknown': 'Neznámý majitel',
  'report.timeline.owner': 'Majitel {number}',
  'report.timeline.eventCount':
    '{count, plural, one {# událost} few {# události} many {# události} other {# událostí}}',

  // damage visualization
  'damage.severeDamage': 'Závažné poškození',
  'damage.moderateDamage': 'Střední poškození',
  'damage.minorDamage': 'Mírné poškození',
  'damage.damageReported': 'Hlášeno poškození',
  'damage.hoverHint': 'Najeďte na zvýrazněné oblasti pro zobrazení detailů',
  'damage.areasWithDamage':
    '{count, plural, one {# oblast} few {# oblasti} many {# oblasti} other {# oblastí}} s hlášeným poškozením',
  'damage.incidentCount':
    '{count, plural, one {# incident} few {# incidenty} many {# incidentu} other {# incidentů}}',
  'damage.severityLabel': 'Závažnost: {severity}',
  'damage.impactArea':
    '{count, plural, one {Oblast nárazu} few {Oblasti nárazu} many {Oblasti nárazu} other {Oblasti nárazu}}',

  // event types
  'eventType.TITLE': 'Titul',
  'eventType.REGISTRATION': 'Registrace',
  'eventType.LIEN': 'Zástavní právo',
  'eventType.SERVICE': 'Servis',
  'eventType.ODOMETER_READING': 'Odečet tachometru',
  'eventType.ACCIDENT': 'Nehoda',
  'eventType.DAMAGE': 'Poškození',
  'eventType.AUCTION': 'Aukce',
  'eventType.LISTING': 'Inzerát',
  'eventType.RECALL': 'Stažení z provozu',
  'eventType.WARRANTY': 'Záruka',
  'eventType.INSPECTION': 'Technická kontrola',
  'eventType.EMISSION': 'Emise',
  'eventType.MANUFACTURER': 'Výrobce',
  'eventType.INSURANCE': 'Pojištění',
  'eventType.OTHER': 'Ostatní',

  // severity
  'severity.minor': 'Mírná',
  'severity.moderate': 'Střední',
  'severity.severe': 'Závažná',
  'severity.unknown': 'Neznámá',

  // damage zones
  'damageZone.front': 'Přední část',
  'damageZone.rear': 'Zadní část',
  'damageZone.left-side': 'Levá strana',
  'damageZone.right-side': 'Pravá strana',
  'damageZone.roof': 'Střecha',
  'damageZone.left-front': 'Levá přední část',
  'damageZone.right-front': 'Pravá přední část',
  'damageZone.left-rear': 'Levá zadní část',
  'damageZone.right-rear': 'Pravá zadní část',

  // title brands
  'titleBrand.salvage': 'Havarované',
  'titleBrand.rebuilt': 'Opravené',
  'titleBrand.flood': 'Povodňové',
  'titleBrand.fire': 'Požárové',
  'titleBrand.hail': 'Krupobití',
  'titleBrand.junk': 'Vrakoviště',
  'titleBrand.lemon': 'Vadný vůz',
  'titleBrand.manufacturer buyback': 'Odkup výrobcem',

  // settings
  'settings.title': 'Nastavení',
  'settings.account': 'Účet',
  'settings.support': 'Podpora',
  'settings.other': 'Ostatní',
  'settings.theme': 'Motiv: {theme}',
  'settings.pushNotifications': 'Pushová oznámení',
  'settings.editProfile': 'Upravit profil',
  'settings.helpSupport': 'Nápověda a podpora',
  'settings.documentation': 'Dokumentace',
  'settings.termsOfService': 'Podmínky služby',
  'settings.privacyPolicy': 'Zásady ochrany osobních údajů',
  'settings.deleteAccount': 'Smazat účet',
  'settings.deleteAccountUnavailable': 'Smazání účtu momentálně není dostupné.',
  'settings.logOut': 'Odhlásit se',
  'settings.language': 'Jazyk',

  // edit profile
  'editProfile.discardDialog.title': 'Zahodit změny?',
  'editProfile.discardDialog.description':
    'Máte neuložené změny. Opravdu je chcete zahodit?',
  'editProfile.discardDialog.stay': 'Zůstat',
  'editProfile.discardDialog.discard': 'Zahodit',
  'editProfile.name': 'Jméno',
  'editProfile.namePlaceholder': 'Jan Novák',
  'editProfile.username': 'Uživatelské jméno',
  'editProfile.usernamePlaceholder': 'jannovak',
  'editProfile.usernameUnavailable': 'Uživatelské jméno není dostupné',
  'editProfile.usernameInvalid':
    'Minimálně 3 znaky, začít písmenem, pouze písmena/čísla/_',
  'editProfile.saving': 'Ukládání...',

  // theme labels
  'theme.dark': 'Tmavý',
  'theme.light': 'Světlý',
  'theme.system': 'Systémový',

  // auth
  'auth.login': 'Přihlásit se',
  'auth.account': 'Účet',

  // profile
  'profile.reports': 'Zprávy',
  'profile.vehicles': 'Vozidla',
  'profile.memberSince': 'Členem od',

  // share
  'share.badge': 'Sdílená zpráva',
  'share.pageTitle': 'Sdílená zpráva o vozidle',
  'share.pageDescription': 'Zobrazit tuto sdílenou zprávu o historii vozidla.',
  'share.notFound.title': 'Zpráva nenalezena',
  'share.notFound.description':
    'Tento odkaz na sdílenou zprávu je neplatný nebo vypršel.',
  'share.expired.title': 'Zpráva vypršela',
  'share.expired.description': 'Tato sdílená zpráva již není k dispozici.',
  'share.revoked.title': 'Odkaz zrušen',
  'share.revoked.description': 'Vlastník zrušil přístup k této sdílené zprávě.',
  'share.button': 'Sdílet',
  'share.copied': 'Odkaz na zprávu zkopírován do schránky!',
  'share.shared': 'Zpráva sdílena!',
  'share.revoke': 'Zrušit odkaz sdílení',

  // nav
  'nav.home': 'Domů',
  'nav.reports': 'Zprávy',
  'nav.settings': 'Nastavení',
}
