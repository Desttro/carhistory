import type { Messages } from '../types'

export const messages: Record<keyof Messages, string> = {
  // common
  'common.loading': 'Ładowanie...',
  'common.error': 'Wystąpił błąd',
  'common.back': 'Wstecz',
  'common.save': 'Zapisz',
  'common.cancel': 'Anuluj',
  'common.delete': 'Usuń',
  'common.miles': 'mil',
  'common.more': '+{count} więcej',

  // report detail page
  'report.loading': 'Ładowanie raportu...',
  'report.notFound.title': 'Raport nie znaleziony',
  'report.notFound.description':
    'Ten raport mógł zostać usunięty lub nie masz do niego dostępu.',
  'report.notFound.back': 'Wróć do raportów',
  'report.expired.title': 'Raport wygasł',
  'report.expired.description':
    'Ten raport wygasł. Kup nowy raport, aby uzyskać zaktualizowane informacje.',
  'report.expired.cta': 'Pobierz zaktualizowany raport',
  'report.error.title': 'Dane raportu niedostępne',
  'report.error.description': 'Wystąpił problem podczas ładowania danych tego raportu.',
  'report.vin': 'VIN: {vin}',

  // report summary
  'report.issuesFound': 'Znalezione problemy',
  'report.cleanHistory': 'Czysta historia',
  'report.clean': 'Czyste',
  'report.stat.owners': 'Właściciele',
  'report.stat.accidents': 'Wypadki',
  'report.stat.serviceRecords': 'Zapisy serwisowe',
  'report.stat.totalEvents': 'Łączna liczba zdarzeń',
  'report.stat.unknown': 'Nieznane',
  'report.odometer.lastReported': 'Ostatni odczyt licznika',
  'report.odometer.asOf': 'stan na {date}',
  'report.odometer.issuesDetected': 'Wykryto problemy z licznikiem',
  'report.totalLoss': 'Zgłoszona całkowita strata',
  'report.titleBrands': 'Oznaczenia tytułu',
  'report.dataSources': 'Źródła danych',

  // vehicle header
  'vehicle.trim': 'Wyposażenie',
  'vehicle.bodyStyle': 'Typ nadwozia',
  'vehicle.engine': 'Silnik',
  'vehicle.drivetrain': 'Napęd',
  'vehicle.yearMakeModel': 'Rok / Marka / Model',

  // timeline
  'report.timeline': 'Oś czasu',
  'report.timeline.noEvents': 'Nie znaleziono zdarzeń',
  'report.timeline.count': 'Oś czasu ({count} zdarzeń)',
  'report.timeline.ownerUnknown': 'Nieznany właściciel',
  'report.timeline.owner': 'Właściciel {number}',
  'report.timeline.eventCount':
    '{count, plural, one {# zdarzenie} few {# zdarzenia} many {# zdarzeń} other {# zdarzenia}}',

  // damage visualization
  'damage.severeDamage': 'Poważne uszkodzenia',
  'damage.moderateDamage': 'Umiarkowane uszkodzenia',
  'damage.minorDamage': 'Drobne uszkodzenia',
  'damage.damageReported': 'Zgłoszone uszkodzenia',
  'damage.hoverHint': 'Najedź kursorem na podświetlone obszary, aby zobaczyć szczegóły',
  'damage.areasWithDamage':
    '{count, plural, one {# obszar} few {# obszary} many {# obszarów} other {# obszaru}} ze zgłoszonymi uszkodzeniami',
  'damage.incidentCount':
    '{count, plural, one {# incydent} few {# incydenty} many {# incydentów} other {# incydentu}}',
  'damage.severityLabel': 'Stopień nasilenia: {severity}',
  'damage.impactArea':
    '{count, plural, one {Strefa uderzenia} few {Strefy uderzenia} many {Stref uderzenia} other {Strefy uderzenia}}',

  // event types
  'eventType.TITLE': 'Tytuł',
  'eventType.REGISTRATION': 'Rejestracja',
  'eventType.LIEN': 'Zastaw',
  'eventType.SERVICE': 'Serwis',
  'eventType.ODOMETER_READING': 'Odczyt licznika',
  'eventType.ACCIDENT': 'Wypadek',
  'eventType.DAMAGE': 'Uszkodzenie',
  'eventType.AUCTION': 'Aukcja',
  'eventType.LISTING': 'Ogłoszenie',
  'eventType.RECALL': 'Recall',
  'eventType.WARRANTY': 'Gwarancja',
  'eventType.INSPECTION': 'Inspekcja',
  'eventType.EMISSION': 'Emisja',
  'eventType.MANUFACTURER': 'Producent',
  'eventType.INSURANCE': 'Ubezpieczenie',
  'eventType.OTHER': 'Inne',

  // severity
  'severity.minor': 'Drobne',
  'severity.moderate': 'Umiarkowane',
  'severity.severe': 'Poważne',
  'severity.unknown': 'Nieznane',

  // damage zones
  'damageZone.front': 'Przód',
  'damageZone.rear': 'Tył',
  'damageZone.left-side': 'Lewa strona',
  'damageZone.right-side': 'Prawa strona',
  'damageZone.roof': 'Dach',
  'damageZone.left-front': 'Lewy przód',
  'damageZone.right-front': 'Prawy przód',
  'damageZone.left-rear': 'Lewy tył',
  'damageZone.right-rear': 'Prawy tył',

  // title brands
  'titleBrand.salvage': 'Powypadkowy',
  'titleBrand.rebuilt': 'Odbudowany',
  'titleBrand.flood': 'Zalany',
  'titleBrand.fire': 'Pożar',
  'titleBrand.hail': 'Grad',
  'titleBrand.junk': 'Złom',
  'titleBrand.lemon': 'Wadliwy',
  'titleBrand.manufacturer buyback': 'Odkup od producenta',

  // settings
  'settings.account': 'Konto',
  'settings.support': 'Wsparcie',
  'settings.other': 'Inne',
  'settings.theme': 'Motyw: {theme}',
  'settings.pushNotifications': 'Powiadomienia push',
  'settings.editProfile': 'Edytuj profil',
  'settings.blockedUsers': 'Zablokowani użytkownicy',
  'settings.helpSupport': 'Pomoc i wsparcie',
  'settings.documentation': 'Dokumentacja',
  'settings.termsOfService': 'Warunki korzystania z usługi',
  'settings.privacyPolicy': 'Polityka prywatności',
  'settings.deleteAccount': 'Usuń konto',
  'settings.deleteAccountUnavailable': 'Usuwanie konta jest obecnie niedostępne.',
  'settings.logOut': 'Wyloguj się',
  'settings.language': 'Język',

  // theme labels
  'theme.dark': 'Ciemny',
  'theme.light': 'Jasny',
  'theme.system': 'Systemowy',

  // auth
  'auth.login': 'Zaloguj się',
  'auth.account': 'Konto',

  // profile
  'profile.reports': 'Raporty',
  'profile.vehicles': 'Pojazdy',
  'profile.memberSince': 'Członek od',

  // nav
  'nav.home': 'Strona główna',
  'nav.reports': 'Raporty',
  'nav.settings': 'Ustawienia',
}
