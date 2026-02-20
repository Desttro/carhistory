import type { Messages } from '../types'

export const messages: Record<keyof Messages, string> = {
  // common
  'common.loading': 'Caricamento...',
  'common.error': 'Si è verificato un errore',
  'common.back': 'Indietro',
  'common.save': 'Salva',
  'common.cancel': 'Annulla',
  'common.delete': 'Elimina',
  'common.miles': 'miglia',
  'common.more': '+{count} altri',

  // report detail page
  'report.loading': 'Caricamento del rapporto...',
  'report.notFound.title': 'Rapporto non trovato',
  'report.notFound.description':
    'Questo rapporto potrebbe essere stato eliminato o non hai accesso ad esso.',
  'report.notFound.back': 'Torna ai rapporti',
  'report.expired.title': 'Rapporto scaduto',
  'report.expired.description':
    'Questo rapporto è scaduto. Acquista un nuovo rapporto per ottenere informazioni aggiornate.',
  'report.expired.cta': 'Ottieni rapporto aggiornato',
  'report.error.title': 'Dati del rapporto non disponibili',
  'report.error.description':
    'Si è verificato un problema nel caricamento dei dati di questo rapporto.',
  'report.vin': 'VIN: {vin}',

  // report summary
  'report.issuesFound': 'Problemi rilevati',
  'report.cleanHistory': 'Cronologia pulita',
  'report.clean': 'Pulito',
  'report.stat.owners': 'Proprietari',
  'report.stat.accidents': 'Incidenti',
  'report.stat.serviceRecords': 'Registri di servizio',
  'report.stat.totalEvents': 'Totale eventi',
  'report.stat.unknown': 'Sconosciuto',
  'report.odometer.lastReported': 'Ultimo chilometraggio registrato',
  'report.odometer.asOf': 'al {date}',
  'report.odometer.issuesDetected': 'Problemi al contachilometri rilevati',
  'report.totalLoss': 'Perdita totale segnalata',
  'report.titleBrands': 'Marchi del titolo',
  'report.dataSources': 'Fonti dei dati',

  // vehicle header
  'vehicle.trim': 'Allestimento',
  'vehicle.bodyStyle': 'Carrozzeria',
  'vehicle.engine': 'Motore',
  'vehicle.drivetrain': 'Trasmissione',
  'vehicle.yearMakeModel': 'Anno / Marca / Modello',

  // timeline
  'report.timeline': 'Cronologia',
  'report.timeline.noEvents': 'Nessun evento trovato',
  'report.timeline.count': 'Cronologia ({count} eventi)',
  'report.timeline.ownerUnknown': 'Proprietario sconosciuto',
  'report.timeline.owner': 'Proprietario {number}',
  'report.timeline.eventCount': '{count, plural, one {# evento} other {# eventi}}',

  // damage visualization
  'damage.severeDamage': 'Danno grave',
  'damage.moderateDamage': 'Danno moderato',
  'damage.minorDamage': 'Danno lieve',
  'damage.damageReported': 'Danno segnalato',
  'damage.hoverHint': 'Passa il cursore sulle aree evidenziate per vedere i dettagli',
  'damage.areasWithDamage':
    '{count, plural, one {# area} other {# aree}} con danni segnalati',
  'damage.incidentCount': '{count, plural, one {# incidente} other {# incidenti}}',
  'damage.severityLabel': 'Gravità {severity}',
  'damage.impactArea': '{count, plural, one {Area di impatto} other {Aree di impatto}}',

  // event types
  'eventType.TITLE': 'Titolo',
  'eventType.REGISTRATION': 'Immatricolazione',
  'eventType.LIEN': 'Pegno',
  'eventType.SERVICE': 'Servizio',
  'eventType.ODOMETER_READING': 'Lettura contachilometri',
  'eventType.ACCIDENT': 'Incidente',
  'eventType.DAMAGE': 'Danno',
  'eventType.AUCTION': 'Asta',
  'eventType.LISTING': 'Annuncio',
  'eventType.RECALL': 'Richiamo',
  'eventType.WARRANTY': 'Garanzia',
  'eventType.INSPECTION': 'Ispezione',
  'eventType.EMISSION': 'Emissione',
  'eventType.MANUFACTURER': 'Produttore',
  'eventType.INSURANCE': 'Assicurazione',
  'eventType.OTHER': 'Altro',

  // severity
  'severity.minor': 'Lieve',
  'severity.moderate': 'Moderato',
  'severity.severe': 'Grave',
  'severity.unknown': 'Sconosciuto',

  // damage zones
  'damageZone.front': 'Anteriore',
  'damageZone.rear': 'Posteriore',
  'damageZone.left-side': 'Lato sinistro',
  'damageZone.right-side': 'Lato destro',
  'damageZone.roof': 'Tetto',
  'damageZone.left-front': 'Anteriore sinistro',
  'damageZone.right-front': 'Anteriore destro',
  'damageZone.left-rear': 'Posteriore sinistro',
  'damageZone.right-rear': 'Posteriore destro',

  // title brands
  'titleBrand.salvage': 'Recupero',
  'titleBrand.rebuilt': 'Ricostruito',
  'titleBrand.flood': 'Alluvione',
  'titleBrand.fire': 'Incendio',
  'titleBrand.hail': 'Grandine',
  'titleBrand.junk': 'Rottame',
  'titleBrand.lemon': 'Difettoso',
  'titleBrand.manufacturer buyback': 'Riacquisto del produttore',

  // settings
  'settings.title': 'Impostazioni',
  'settings.account': 'Account',
  'settings.support': 'Supporto',
  'settings.other': 'Altro',
  'settings.theme': 'Tema: {theme}',
  'settings.pushNotifications': 'Notifiche push',
  'settings.editProfile': 'Modifica profilo',
  'settings.helpSupport': 'Aiuto e supporto',
  'settings.documentation': 'Documentazione',
  'settings.termsOfService': 'Termini di servizio',
  'settings.privacyPolicy': 'Informativa sulla privacy',
  'settings.deleteAccount': 'Elimina account',
  'settings.deleteAccountUnavailable':
    "L'eliminazione dell'account non è attualmente disponibile.",
  'settings.logOut': 'Esci',
  'settings.language': 'Lingua',

  // edit profile
  'editProfile.discardDialog.title': 'Annullare le modifiche?',
  'editProfile.discardDialog.description':
    'Hai modifiche non salvate. Sei sicuro di volerle annullare?',
  'editProfile.discardDialog.stay': 'Resta',
  'editProfile.discardDialog.discard': 'Annulla',
  'editProfile.name': 'Nome',
  'editProfile.namePlaceholder': 'Mario Rossi',
  'editProfile.username': 'Nome utente',
  'editProfile.usernamePlaceholder': 'mariorossi',
  'editProfile.usernameUnavailable': 'Nome utente non disponibile',
  'editProfile.usernameInvalid':
    'Minimo 3 caratteri, iniziare con lettera, solo lettere/numeri/_',
  'editProfile.saving': 'Salvataggio...',

  // theme labels
  'theme.dark': 'Scuro',
  'theme.light': 'Chiaro',
  'theme.system': 'Sistema',

  // auth
  'auth.login': 'Accedi',
  'auth.account': 'Account',

  // profile
  'profile.reports': 'Rapporti',
  'profile.vehicles': 'Veicoli',
  'profile.memberSince': 'Membro dal',

  // share
  'share.badge': 'Report condiviso',
  'share.pageTitle': 'Report veicolo condiviso',
  'share.pageDescription': 'Visualizza questo report di cronologia veicolo condiviso.',
  'share.notFound.title': 'Report non trovato',
  'share.notFound.description':
    'Questo link di report condiviso non è valido o è scaduto.',
  'share.expired.title': 'Report scaduto',
  'share.expired.description': 'Questo report condiviso non è più disponibile.',
  'share.revoked.title': 'Link revocato',
  'share.revoked.description':
    "Il proprietario ha revocato l'accesso a questo report condiviso.",
  'share.button': 'Condividi',
  'share.copied': 'Link del report copiato negli appunti!',
  'share.shared': 'Report condiviso!',
  'share.revoke': 'Revoca link di condivisione',

  // nav
  'nav.home': 'Home',
  'nav.reports': 'Rapporti',
  'nav.settings': 'Impostazioni',
}
