import type { Messages } from '../types'

export const messages: Record<keyof Messages, string> = {
  // common
  'common.loading': 'Cargando...',
  'common.error': 'Ocurrió un error',
  'common.back': 'Volver',
  'common.save': 'Guardar',
  'common.cancel': 'Cancelar',
  'common.delete': 'Eliminar',
  'common.miles': 'millas',
  'common.more': '+{count} más',

  // report detail page
  'report.loading': 'Cargando informe...',
  'report.notFound.title': 'Informe no encontrado',
  'report.notFound.description':
    'Es posible que este informe haya sido eliminado o que no tengas acceso a él.',
  'report.notFound.back': 'Volver a los informes',
  'report.expired.title': 'Informe vencido',
  'report.expired.description':
    'Este informe ha vencido. Compra un nuevo informe para obtener información actualizada.',
  'report.expired.cta': 'Obtener informe actualizado',
  'report.error.title': 'Datos del informe no disponibles',
  'report.error.description': 'Hubo un problema al cargar los datos de este informe.',
  'report.vin': 'VIN: {vin}',

  // report summary
  'report.issuesFound': 'Problemas encontrados',
  'report.cleanHistory': 'Historial limpio',
  'report.clean': 'Limpio',
  'report.stat.owners': 'Propietarios',
  'report.stat.accidents': 'Accidentes',
  'report.stat.serviceRecords': 'Registros de servicio',
  'report.stat.totalEvents': 'Eventos totales',
  'report.stat.unknown': 'Desconocido',
  'report.odometer.lastReported': 'Último odómetro registrado',
  'report.odometer.asOf': 'al {date}',
  'report.odometer.issuesDetected': 'Problemas de odómetro detectados',
  'report.totalLoss': 'Pérdida total declarada',
  'report.titleBrands': 'Marcas de título',
  'report.dataSources': 'Fuentes de datos',

  // vehicle header
  'vehicle.trim': 'Versión',
  'vehicle.bodyStyle': 'Carrocería',
  'vehicle.engine': 'Motor',
  'vehicle.drivetrain': 'Tracción',
  'vehicle.yearMakeModel': 'Año / Marca / Modelo',

  // timeline
  'report.timeline': 'Cronología',
  'report.timeline.noEvents': 'No se encontraron eventos',
  'report.timeline.count': 'Cronología ({count} eventos)',
  'report.timeline.ownerUnknown': 'Propietario desconocido',
  'report.timeline.owner': 'Propietario {number}',
  'report.timeline.eventCount': '{count, plural, one {# evento} other {# eventos}}',

  // damage visualization
  'damage.severeDamage': 'Daño grave',
  'damage.moderateDamage': 'Daño moderado',
  'damage.minorDamage': 'Daño menor',
  'damage.damageReported': 'Daño reportado',
  'damage.hoverHint': 'Pasa el cursor sobre las áreas resaltadas para ver los detalles',
  'damage.areasWithDamage':
    '{count, plural, one {# área} other {# áreas}} con daño reportado',
  'damage.incidentCount': '{count, plural, one {# incidente} other {# incidentes}}',
  'damage.severityLabel': 'Gravedad {severity}',
  'damage.impactArea': '{count, plural, one {Área de impacto} other {Áreas de impacto}}',

  // event types
  'eventType.TITLE': 'Título',
  'eventType.REGISTRATION': 'Registro',
  'eventType.LIEN': 'Gravamen',
  'eventType.SERVICE': 'Servicio',
  'eventType.ODOMETER_READING': 'Lectura de odómetro',
  'eventType.ACCIDENT': 'Accidente',
  'eventType.DAMAGE': 'Daño',
  'eventType.AUCTION': 'Subasta',
  'eventType.LISTING': 'Anuncio',
  'eventType.RECALL': 'Retiro del mercado',
  'eventType.WARRANTY': 'Garantía',
  'eventType.INSPECTION': 'Inspección',
  'eventType.EMISSION': 'Emisión',
  'eventType.MANUFACTURER': 'Fabricante',
  'eventType.INSURANCE': 'Seguro',
  'eventType.OTHER': 'Otro',

  // severity
  'severity.minor': 'Menor',
  'severity.moderate': 'Moderado',
  'severity.severe': 'Grave',
  'severity.unknown': 'Desconocido',

  // damage zones
  'damageZone.front': 'Frente',
  'damageZone.rear': 'Parte trasera',
  'damageZone.left-side': 'Lado izquierdo',
  'damageZone.right-side': 'Lado derecho',
  'damageZone.roof': 'Techo',
  'damageZone.left-front': 'Frontal izquierdo',
  'damageZone.right-front': 'Frontal derecho',
  'damageZone.left-rear': 'Trasero izquierdo',
  'damageZone.right-rear': 'Trasero derecho',

  // title brands
  'titleBrand.salvage': 'Salvamento',
  'titleBrand.rebuilt': 'Reconstruido',
  'titleBrand.flood': 'Inundación',
  'titleBrand.fire': 'Incendio',
  'titleBrand.hail': 'Granizo',
  'titleBrand.junk': 'Chatarra',
  'titleBrand.lemon': 'Defectuoso',
  'titleBrand.manufacturer buyback': 'Recompra del fabricante',

  // settings
  'settings.account': 'Cuenta',
  'settings.support': 'Soporte',
  'settings.other': 'Otro',
  'settings.theme': 'Tema: {theme}',
  'settings.pushNotifications': 'Notificaciones push',
  'settings.editProfile': 'Editar perfil',
  'settings.blockedUsers': 'Usuarios bloqueados',
  'settings.helpSupport': 'Ayuda y soporte',
  'settings.documentation': 'Documentación',
  'settings.termsOfService': 'Términos de servicio',
  'settings.privacyPolicy': 'Política de privacidad',
  'settings.deleteAccount': 'Eliminar cuenta',
  'settings.deleteAccountUnavailable':
    'La eliminación de cuenta no está disponible actualmente.',
  'settings.logOut': 'Cerrar sesión',
  'settings.language': 'Idioma',

  // theme labels
  'theme.dark': 'Oscuro',
  'theme.light': 'Claro',
  'theme.system': 'Sistema',

  // auth
  'auth.login': 'Iniciar sesión',
  'auth.account': 'Cuenta',

  // nav
  'nav.home': 'Inicio',
  'nav.reports': 'Informes',
  'nav.settings': 'Configuración',
}
