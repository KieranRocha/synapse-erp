import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient()

export function validateDatabaseUrl(databaseUrl = process.env.DATABASE_URL): void {
  if (!databaseUrl?.trim()) {
    throw new Error(
      'DATABASE_URL is required. Configure it in .env or in the deployment environment.'
    )
  }

  if (!databaseUrl.startsWith('postgresql://') && !databaseUrl.startsWith('postgres://')) {
    throw new Error(
      'DATABASE_URL must be a PostgreSQL connection string starting with postgresql:// or postgres://.'
    )
  }
}

export async function initializeDatabase() {
  try {
    validateDatabaseUrl()

    // Test database connection
    await prisma.$connect()
    console.log('Database connected successfully')
    return true
  } catch (error) {
    console.error('Database initialization failed:', error)
    throw error
  }
}

export async function closeDatabase() {
  try {
    await prisma.$disconnect()
    console.log('Database connection closed')
  } catch (error) {
    console.error('Error closing database connection:', error)
  }
}
