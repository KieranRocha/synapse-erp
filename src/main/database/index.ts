import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient()

export async function initializeDatabase() {
  try {
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