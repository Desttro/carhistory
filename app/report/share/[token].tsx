import { createRoute } from 'one'

const route = createRoute<'/report/share/[token]'>()

export { SharedReportPage as default } from '~/features/reports/SharedReportPage'
