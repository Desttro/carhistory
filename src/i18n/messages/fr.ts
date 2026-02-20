import type { Messages } from '../types'

export const messages: Record<keyof Messages, string> = {
  // common
  'common.loading': 'Chargement...',
  'common.error': 'Une erreur est survenue',
  'common.back': 'Retour',
  'common.save': 'Enregistrer',
  'common.cancel': 'Annuler',
  'common.delete': 'Supprimer',
  'common.miles': 'miles',
  'common.more': '+{count} de plus',

  // report detail page
  'report.loading': 'Chargement du rapport...',
  'report.notFound.title': 'Rapport introuvable',
  'report.notFound.description':
    "Ce rapport a peut-être été supprimé ou vous n'y avez pas accès.",
  'report.notFound.back': 'Retour aux rapports',
  'report.expired.title': 'Rapport expiré',
  'report.expired.description':
    'Ce rapport a expiré. Achetez un nouveau rapport pour obtenir des informations à jour.',
  'report.expired.cta': 'Obtenir un rapport à jour',
  'report.error.title': 'Données du rapport indisponibles',
  'report.error.description':
    'Un problème est survenu lors du chargement des données de ce rapport.',
  'report.vin': 'VIN : {vin}',

  // report summary
  'report.issuesFound': 'Problèmes détectés',
  'report.cleanHistory': 'Historique sans problème',
  'report.clean': 'Sans problème',
  'report.stat.owners': 'Propriétaires',
  'report.stat.accidents': 'Accidents',
  'report.stat.serviceRecords': "Registres d'entretien",
  'report.stat.totalEvents': 'Événements totaux',
  'report.stat.unknown': 'Inconnu',
  'report.odometer.lastReported': 'Dernier kilométrage déclaré',
  'report.odometer.asOf': 'au {date}',
  'report.odometer.issuesDetected': 'Anomalies de kilométrage détectées',
  'report.totalLoss': 'Perte totale déclarée',
  'report.titleBrands': 'Mentions au titre',
  'report.dataSources': 'Sources de données',

  // vehicle header
  'vehicle.trim': 'Finition',
  'vehicle.bodyStyle': 'Carrosserie',
  'vehicle.engine': 'Moteur',
  'vehicle.drivetrain': 'Transmission',
  'vehicle.yearMakeModel': 'Année / Marque / Modèle',

  // timeline
  'report.timeline': 'Chronologie',
  'report.timeline.noEvents': 'Aucun événement trouvé',
  'report.timeline.count': 'Chronologie ({count} événements)',
  'report.timeline.ownerUnknown': 'Propriétaire inconnu',
  'report.timeline.owner': 'Propriétaire {number}',
  'report.timeline.eventCount': '{count, plural, one {# événement} other {# événements}}',

  // damage visualization
  'damage.severeDamage': 'Dommages graves',
  'damage.moderateDamage': 'Dommages modérés',
  'damage.minorDamage': 'Dommages mineurs',
  'damage.damageReported': 'Dommages déclarés',
  'damage.hoverHint': 'Survolez les zones en surbrillance pour voir les détails',
  'damage.areasWithDamage':
    '{count, plural, one {# zone} other {# zones}} avec dommages déclarés',
  'damage.incidentCount': '{count, plural, one {# incident} other {# incidents}}',
  'damage.severityLabel': 'Gravité {severity}',
  'damage.impactArea': "{count, plural, one {Zone d'impact} other {Zones d'impact}}",

  // event types
  'eventType.TITLE': 'Titre',
  'eventType.REGISTRATION': 'Immatriculation',
  'eventType.LIEN': 'Gage',
  'eventType.SERVICE': 'Entretien',
  'eventType.ODOMETER_READING': 'Relevé de kilométrage',
  'eventType.ACCIDENT': 'Accident',
  'eventType.DAMAGE': 'Dommage',
  'eventType.AUCTION': 'Enchère',
  'eventType.LISTING': 'Annonce',
  'eventType.RECALL': 'Rappel',
  'eventType.WARRANTY': 'Garantie',
  'eventType.INSPECTION': 'Contrôle technique',
  'eventType.EMISSION': 'Émission',
  'eventType.MANUFACTURER': 'Fabricant',
  'eventType.INSURANCE': 'Assurance',
  'eventType.OTHER': 'Autre',

  // severity
  'severity.minor': 'Mineur',
  'severity.moderate': 'Modéré',
  'severity.severe': 'Grave',
  'severity.unknown': 'Inconnu',

  // damage zones
  'damageZone.front': 'Avant',
  'damageZone.rear': 'Arrière',
  'damageZone.left-side': 'Côté gauche',
  'damageZone.right-side': 'Côté droit',
  'damageZone.roof': 'Toit',
  'damageZone.left-front': 'Avant gauche',
  'damageZone.right-front': 'Avant droit',
  'damageZone.left-rear': 'Arrière gauche',
  'damageZone.right-rear': 'Arrière droit',

  // title brands
  'titleBrand.salvage': 'Épave',
  'titleBrand.rebuilt': 'Reconstruit',
  'titleBrand.flood': 'Inondation',
  'titleBrand.fire': 'Incendie',
  'titleBrand.hail': 'Grêle',
  'titleBrand.junk': 'Ferraille',
  'titleBrand.lemon': 'Véhicule défectueux',
  'titleBrand.manufacturer buyback': 'Rachat constructeur',

  // settings
  'settings.account': 'Compte',
  'settings.support': 'Assistance',
  'settings.other': 'Autre',
  'settings.theme': 'Thème : {theme}',
  'settings.pushNotifications': 'Notifications push',
  'settings.editProfile': 'Modifier le profil',
  'settings.blockedUsers': 'Utilisateurs bloqués',
  'settings.helpSupport': 'Aide et assistance',
  'settings.documentation': 'Documentation',
  'settings.termsOfService': "Conditions d'utilisation",
  'settings.privacyPolicy': 'Politique de confidentialité',
  'settings.deleteAccount': 'Supprimer le compte',
  'settings.deleteAccountUnavailable':
    "La suppression de compte n'est pas disponible actuellement.",
  'settings.logOut': 'Se déconnecter',
  'settings.language': 'Langue',

  // edit profile
  'editProfile.discardDialog.title': 'Abandonner les modifications ?',
  'editProfile.discardDialog.description':
    'Vous avez des modifications non enregistrées. Êtes-vous sûr de vouloir les abandonner ?',
  'editProfile.discardDialog.stay': 'Rester',
  'editProfile.discardDialog.discard': 'Abandonner',
  'editProfile.name': 'Nom',
  'editProfile.namePlaceholder': 'Jean Dupont',
  'editProfile.username': "Nom d'utilisateur",
  'editProfile.usernamePlaceholder': 'jeandupont',
  'editProfile.usernameUnavailable': "Le nom d'utilisateur n'est pas disponible",
  'editProfile.usernameInvalid':
    'Minimum 3 caractères, commencer par une lettre, uniquement lettres/chiffres/_',
  'editProfile.saving': 'Enregistrement...',

  // theme labels
  'theme.dark': 'Sombre',
  'theme.light': 'Clair',
  'theme.system': 'Système',

  // auth
  'auth.login': 'Se connecter',
  'auth.account': 'Compte',

  // profile
  'profile.reports': 'Rapports',
  'profile.vehicles': 'Véhicules',
  'profile.memberSince': 'Membre depuis',

  // nav
  'nav.home': 'Accueil',
  'nav.reports': 'Rapports',
  'nav.settings': 'Paramètres',
}
