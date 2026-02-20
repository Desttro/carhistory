import type { Messages } from '../types'

export const messages: Record<keyof Messages, string> = {
  // common
  'common.loading': 'Wird geladen...',
  'common.error': 'Ein Fehler ist aufgetreten',
  'common.back': 'Zurück',
  'common.save': 'Speichern',
  'common.cancel': 'Abbrechen',
  'common.delete': 'Löschen',
  'common.miles': 'Meilen',
  'common.more': '+{count} weitere',

  // report detail page
  'report.loading': 'Bericht wird geladen...',
  'report.notFound.title': 'Bericht nicht gefunden',
  'report.notFound.description':
    'Dieser Bericht wurde möglicherweise gelöscht oder Sie haben keinen Zugriff darauf.',
  'report.notFound.back': 'Zurück zu den Berichten',
  'report.expired.title': 'Bericht abgelaufen',
  'report.expired.description':
    'Dieser Bericht ist abgelaufen. Kaufen Sie einen neuen Bericht, um aktuelle Informationen zu erhalten.',
  'report.expired.cta': 'Aktualisierten Bericht erhalten',
  'report.error.title': 'Berichtsdaten nicht verfügbar',
  'report.error.description':
    'Beim Laden der Daten dieses Berichts ist ein Problem aufgetreten.',
  'report.vin': 'FIN: {vin}',

  // report summary
  'report.issuesFound': 'Probleme gefunden',
  'report.cleanHistory': 'Saubere Historie',
  'report.clean': 'Sauber',
  'report.stat.owners': 'Halter',
  'report.stat.accidents': 'Unfälle',
  'report.stat.serviceRecords': 'Wartungsaufzeichnungen',
  'report.stat.totalEvents': 'Ereignisse gesamt',
  'report.stat.unknown': 'Unbekannt',
  'report.odometer.lastReported': 'Zuletzt gemeldeter Kilometerstand',
  'report.odometer.asOf': 'Stand {date}',
  'report.odometer.issuesDetected': 'Kilometerstand-Probleme erkannt',
  'report.totalLoss': 'Totalschaden gemeldet',
  'report.titleBrands': 'Fahrzeugbriefvermerke',
  'report.dataSources': 'Datenquellen',

  // vehicle header
  'vehicle.trim': 'Ausstattung',
  'vehicle.bodyStyle': 'Karosserieform',
  'vehicle.engine': 'Motor',
  'vehicle.drivetrain': 'Antrieb',
  'vehicle.yearMakeModel': 'Jahr / Marke / Modell',

  // timeline
  'report.timeline': 'Zeitverlauf',
  'report.timeline.noEvents': 'Keine Ereignisse gefunden',
  'report.timeline.count': 'Zeitverlauf ({count} Ereignisse)',
  'report.timeline.ownerUnknown': 'Unbekannter Halter',
  'report.timeline.owner': 'Halter {number}',
  'report.timeline.eventCount': '{count, plural, one {# Ereignis} other {# Ereignisse}}',

  // damage visualization
  'damage.severeDamage': 'Schwerer Schaden',
  'damage.moderateDamage': 'Mittlerer Schaden',
  'damage.minorDamage': 'Leichter Schaden',
  'damage.damageReported': 'Schaden gemeldet',
  'damage.hoverHint':
    'Fahren Sie mit der Maus über markierte Bereiche, um Details zu sehen',
  'damage.areasWithDamage':
    '{count, plural, one {# Bereich} other {# Bereiche}} mit gemeldetem Schaden',
  'damage.incidentCount': '{count, plural, one {# Vorfall} other {# Vorfälle}}',
  'damage.severityLabel': 'Schweregrad {severity}',
  'damage.impactArea': '{count, plural, one {Aufprallbereich} other {Aufprallbereiche}}',

  // event types
  'eventType.TITLE': 'Titel',
  'eventType.REGISTRATION': 'Zulassung',
  'eventType.LIEN': 'Pfandrecht',
  'eventType.SERVICE': 'Wartung',
  'eventType.ODOMETER_READING': 'Kilometerstand',
  'eventType.ACCIDENT': 'Unfall',
  'eventType.DAMAGE': 'Schaden',
  'eventType.AUCTION': 'Auktion',
  'eventType.LISTING': 'Inserat',
  'eventType.RECALL': 'Rückruf',
  'eventType.WARRANTY': 'Garantie',
  'eventType.INSPECTION': 'Inspektion',
  'eventType.EMISSION': 'Abgasuntersuchung',
  'eventType.MANUFACTURER': 'Hersteller',
  'eventType.INSURANCE': 'Versicherung',
  'eventType.OTHER': 'Sonstiges',

  // severity
  'severity.minor': 'Leicht',
  'severity.moderate': 'Mittel',
  'severity.severe': 'Schwer',
  'severity.unknown': 'Unbekannt',

  // damage zones
  'damageZone.front': 'Vorne',
  'damageZone.rear': 'Hinten',
  'damageZone.left-side': 'Linke Seite',
  'damageZone.right-side': 'Rechte Seite',
  'damageZone.roof': 'Dach',
  'damageZone.left-front': 'Vorne links',
  'damageZone.right-front': 'Vorne rechts',
  'damageZone.left-rear': 'Hinten links',
  'damageZone.right-rear': 'Hinten rechts',

  // title brands
  'titleBrand.salvage': 'Totalschaden',
  'titleBrand.rebuilt': 'Wiederaufgebaut',
  'titleBrand.flood': 'Wasserschaden',
  'titleBrand.fire': 'Brandschaden',
  'titleBrand.hail': 'Hagelschaden',
  'titleBrand.junk': 'Schrottreif',
  'titleBrand.lemon': 'Montagsauto',
  'titleBrand.manufacturer buyback': 'Herstellerrückkauf',

  // settings
  'settings.account': 'Konto',
  'settings.support': 'Support',
  'settings.other': 'Sonstiges',
  'settings.theme': 'Design: {theme}',
  'settings.pushNotifications': 'Push-Benachrichtigungen',
  'settings.editProfile': 'Profil bearbeiten',
  'settings.blockedUsers': 'Gesperrte Nutzer',
  'settings.helpSupport': 'Hilfe & Support',
  'settings.documentation': 'Dokumentation',
  'settings.termsOfService': 'Nutzungsbedingungen',
  'settings.privacyPolicy': 'Datenschutzrichtlinie',
  'settings.deleteAccount': 'Konto löschen',
  'settings.deleteAccountUnavailable': 'Die Kontolöschung ist derzeit nicht verfügbar.',
  'settings.logOut': 'Abmelden',
  'settings.language': 'Sprache',

  // edit profile
  'editProfile.discardDialog.title': 'Änderungen verwerfen?',
  'editProfile.discardDialog.description':
    'Du hast ungespeicherte Änderungen. Bist du sicher, dass du sie verwerfen möchtest?',
  'editProfile.discardDialog.stay': 'Bleiben',
  'editProfile.discardDialog.discard': 'Verwerfen',
  'editProfile.name': 'Name',
  'editProfile.namePlaceholder': 'Max Mustermann',
  'editProfile.username': 'Benutzername',
  'editProfile.usernamePlaceholder': 'maxmustermann',
  'editProfile.usernameUnavailable': 'Benutzername ist nicht verfügbar',
  'editProfile.usernameInvalid':
    'Mindestens 3 Zeichen, mit Buchstabe beginnen, nur Buchstaben/Zahlen/_',
  'editProfile.saving': 'Wird gespeichert...',

  // theme labels
  'theme.dark': 'Dunkel',
  'theme.light': 'Hell',
  'theme.system': 'System',

  // auth
  'auth.login': 'Anmelden',
  'auth.account': 'Konto',

  // profile
  'profile.reports': 'Berichte',
  'profile.vehicles': 'Fahrzeuge',
  'profile.memberSince': 'Mitglied seit',

  // nav
  'nav.home': 'Startseite',
  'nav.reports': 'Berichte',
  'nav.settings': 'Einstellungen',
}
