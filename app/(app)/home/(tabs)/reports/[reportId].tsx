import { createRoute } from 'one'

const route = createRoute<'/(app)/home/(tabs)/reports/[reportId]'>()

export { ReportDetailPage as default } from '~/features/reports/ReportDetailPage'
