import knex from 'knex'
import path from 'path'

const knexConfig = require(path.join(process.cwd(), 'knexfile.js'))
const environment = process.env.NODE_ENV || 'development'

export const db = knex(knexConfig[environment])

export async function initializeDatabase() {
  try {
    // Run migrations
    await db.migrate.latest()
    console.log('Database migrations completed successfully')
    return true
  } catch (error) {
    console.error('Database initialization failed:', error)
    throw error
  }
}

export async function closeDatabase() {
  try {
    await db.destroy()
    console.log('Database connection closed')
  } catch (error) {
    console.error('Error closing database connection:', error)
  }
}