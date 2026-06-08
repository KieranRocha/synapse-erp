import { afterEach, describe, expect, it } from 'vitest'

import { validateDatabaseUrl } from './index'

describe('validateDatabaseUrl', () => {
  const originalDatabaseUrl = process.env.DATABASE_URL

  afterEach(() => {
    process.env.DATABASE_URL = originalDatabaseUrl
  })

  it('throws a clear error when DATABASE_URL is missing', () => {
    delete process.env.DATABASE_URL

    expect(() => validateDatabaseUrl()).toThrow(
      'DATABASE_URL is required. Configure it in .env or in the deployment environment.'
    )
  })

  it('throws a clear error when DATABASE_URL is not a PostgreSQL URL', () => {
    expect(() => validateDatabaseUrl('mysql://user:pass@localhost:3306/db')).toThrow(
      'DATABASE_URL must be a PostgreSQL connection string starting with postgresql:// or postgres://.'
    )
  })

  it('accepts PostgreSQL connection strings', () => {
    expect(() =>
      validateDatabaseUrl('postgresql://postgres:password@db.example.supabase.co:5432/postgres')
    ).not.toThrow()
  })
})
