import type { Messages } from '../types'

export const messages: Record<keyof Messages, string> = {
  // common
  'common.loading': 'Загрузка...',
  'common.error': 'Произошла ошибка',
  'common.back': 'Назад',
  'common.save': 'Сохранить',
  'common.cancel': 'Отмена',
  'common.delete': 'Удалить',
  'common.miles': 'миль',
  'common.more': '+{count} ещё',

  // report detail page
  'report.loading': 'Загрузка отчёта...',
  'report.notFound.title': 'Отчёт не найден',
  'report.notFound.description':
    'Этот отчёт мог быть удалён, или у вас нет доступа к нему.',
  'report.notFound.back': 'Назад к отчётам',
  'report.expired.title': 'Отчёт устарел',
  'report.expired.description':
    'Срок действия этого отчёта истёк. Приобретите новый отчёт для получения актуальной информации.',
  'report.expired.cta': 'Получить обновлённый отчёт',
  'report.error.title': 'Данные отчёта недоступны',
  'report.error.description': 'При загрузке данных этого отчёта возникла проблема.',
  'report.vin': 'VIN: {vin}',

  // report summary
  'report.issuesFound': 'Обнаруженные проблемы',
  'report.cleanHistory': 'Чистая история',
  'report.clean': 'Чисто',
  'report.stat.owners': 'Владельцы',
  'report.stat.accidents': 'ДТП',
  'report.stat.serviceRecords': 'Записи обслуживания',
  'report.stat.totalEvents': 'Всего событий',
  'report.stat.unknown': 'Неизвестно',
  'report.odometer.lastReported': 'Последние показания одометра',
  'report.odometer.asOf': 'по состоянию на {date}',
  'report.odometer.issuesDetected': 'Обнаружены проблемы с одометром',
  'report.totalLoss': 'Зарегистрирована полная гибель',
  'report.titleBrands': 'Отметки в документах',
  'report.dataSources': 'Источники данных',

  // vehicle header
  'vehicle.trim': 'Комплектация',
  'vehicle.bodyStyle': 'Тип кузова',
  'vehicle.engine': 'Двигатель',
  'vehicle.drivetrain': 'Привод',
  'vehicle.yearMakeModel': 'Год / Марка / Модель',

  // timeline
  'report.timeline': 'Хронология',
  'report.timeline.noEvents': 'События не найдены',
  'report.timeline.count': 'Хронология ({count} событий)',
  'report.timeline.ownerUnknown': 'Неизвестный владелец',
  'report.timeline.owner': 'Владелец {number}',
  'report.timeline.eventCount':
    '{count, plural, one {# событие} few {# события} many {# событий} other {# события}}',

  // damage visualization
  'damage.severeDamage': 'Серьёзные повреждения',
  'damage.moderateDamage': 'Умеренные повреждения',
  'damage.minorDamage': 'Незначительные повреждения',
  'damage.damageReported': 'Зарегистрированы повреждения',
  'damage.hoverHint': 'Наведите курсор на выделенные области для просмотра подробностей',
  'damage.areasWithDamage':
    '{count, plural, one {# область} few {# области} many {# областей} other {# области}} с зарегистрированными повреждениями',
  'damage.incidentCount':
    '{count, plural, one {# инцидент} few {# инцидента} many {# инцидентов} other {# инцидента}}',
  'damage.severityLabel': 'Степень серьёзности: {severity}',
  'damage.impactArea':
    '{count, plural, one {Зона удара} few {Зоны удара} many {Зон удара} other {Зоны удара}}',

  // event types
  'eventType.TITLE': 'Документ',
  'eventType.REGISTRATION': 'Регистрация',
  'eventType.LIEN': 'Залог',
  'eventType.SERVICE': 'Обслуживание',
  'eventType.ODOMETER_READING': 'Показание одометра',
  'eventType.ACCIDENT': 'ДТП',
  'eventType.DAMAGE': 'Повреждение',
  'eventType.AUCTION': 'Аукцион',
  'eventType.LISTING': 'Объявление',
  'eventType.RECALL': 'Отзыв',
  'eventType.WARRANTY': 'Гарантия',
  'eventType.INSPECTION': 'Технический осмотр',
  'eventType.EMISSION': 'Выброс',
  'eventType.MANUFACTURER': 'Производитель',
  'eventType.INSURANCE': 'Страхование',
  'eventType.OTHER': 'Другое',

  // severity
  'severity.minor': 'Незначительный',
  'severity.moderate': 'Умеренный',
  'severity.severe': 'Серьёзный',
  'severity.unknown': 'Неизвестно',

  // damage zones
  'damageZone.front': 'Передняя часть',
  'damageZone.rear': 'Задняя часть',
  'damageZone.left-side': 'Левая сторона',
  'damageZone.right-side': 'Правая сторона',
  'damageZone.roof': 'Крыша',
  'damageZone.left-front': 'Левый передний',
  'damageZone.right-front': 'Правый передний',
  'damageZone.left-rear': 'Левый задний',
  'damageZone.right-rear': 'Правый задний',

  // title brands
  'titleBrand.salvage': 'Аварийный',
  'titleBrand.rebuilt': 'Восстановленный',
  'titleBrand.flood': 'Затопленный',
  'titleBrand.fire': 'Пожар',
  'titleBrand.hail': 'Град',
  'titleBrand.junk': 'Утиль',
  'titleBrand.lemon': 'Бракованный',
  'titleBrand.manufacturer buyback': 'Выкуп производителем',

  // settings
  'settings.account': 'Аккаунт',
  'settings.support': 'Поддержка',
  'settings.other': 'Другое',
  'settings.theme': 'Тема: {theme}',
  'settings.pushNotifications': 'Push-уведомления',
  'settings.editProfile': 'Редактировать профиль',
  'settings.blockedUsers': 'Заблокированные пользователи',
  'settings.helpSupport': 'Помощь и поддержка',
  'settings.documentation': 'Документация',
  'settings.termsOfService': 'Условия использования',
  'settings.privacyPolicy': 'Политика конфиденциальности',
  'settings.deleteAccount': 'Удалить аккаунт',
  'settings.deleteAccountUnavailable': 'Удаление аккаунта в настоящее время недоступно.',
  'settings.logOut': 'Выйти',
  'settings.language': 'Язык',

  // theme labels
  'theme.dark': 'Тёмная',
  'theme.light': 'Светлая',
  'theme.system': 'Системная',

  // auth
  'auth.login': 'Войти',
  'auth.account': 'Аккаунт',

  // nav
  'nav.home': 'Главная',
  'nav.reports': 'Отчёты',
  'nav.settings': 'Настройки',
}
