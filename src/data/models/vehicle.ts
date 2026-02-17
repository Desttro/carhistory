import { number, string, table } from '@rocicorp/zero'
import { mutations, serverWhere } from 'on-zero'

export const schema = table('vehicle')
  .columns({
    id: string(),
    vin: string(),
    year: number().optional(),
    make: string().optional(),
    model: string().optional(),
    trim: string().optional(),
    bodyStyle: string().optional(),
    engine: string().optional(),
    transmission: string().optional(),
    drivetrain: string().optional(),
    fuelType: string().optional(),
    vehicleClass: string().optional(),
    countryOfAssembly: string().optional(),
    createdAt: number(),
    updatedAt: number().optional(),
  })
  .primaryKey('id')

// vehicles are publicly readable (just basic info)
export const permissions = serverWhere('vehicle', () => true)

// no client-side mutations for vehicle - created server-side only
export const mutate = mutations(schema, permissions, {})
