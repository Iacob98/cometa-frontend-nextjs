#!/usr/bin/env tsx

import 'dotenv/config'
import { Pool } from 'pg'

// Direct PostgreSQL client
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

async function inspectSupabaseDatabase() {
  console.log('🔍 Инспекция Supabase PostgreSQL базы данных COMETA')
  console.log('=================================================')
  console.log('')

  try {
    // Get list of tables
    const tablesQuery = `
      SELECT table_name, table_type
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `

    const tablesResult = await pool.query(tablesQuery)

    console.log('📋 ТАБЛИЦЫ В PUBLIC СХЕМЕ:')
    if (tablesResult.rows.length > 0) {
      tablesResult.rows.forEach((row, index) => {
        console.log(`   ${index + 1}. ${row.table_name} (${row.table_type})`)
      })
    } else {
      console.log('   Таблиц не найдено')
    }

    console.log('')

    // Get storage buckets info (from auth.buckets if exists)
    try {
      const bucketsQuery = `
        SELECT id, name, public, file_size_limit, created_at
        FROM storage.buckets
        ORDER BY name;
      `
      const bucketsResult = await pool.query(bucketsQuery)

      console.log('🗂️  STORAGE BUCKET\'Ы:')
      if (bucketsResult.rows.length > 0) {
        bucketsResult.rows.forEach((bucket, index) => {
          console.log(`   ${index + 1}. ${bucket.name} (public: ${bucket.public}, limit: ${bucket.file_size_limit} bytes)`)
        })
      } else {
        console.log('   Bucket\'ов не найдено')
      }
    } catch (error) {
      console.log('🗂️  STORAGE BUCKET\'Ы: Недоступно (schema не найдена)')
    }

    console.log('')

    // Get functions/procedures
    const functionsQuery = `
      SELECT routine_name, routine_type, security_type
      FROM information_schema.routines
      WHERE routine_schema = 'public'
      ORDER BY routine_name;
    `

    const functionsResult = await pool.query(functionsQuery)

    console.log('⚙️  ФУНКЦИИ И ПРОЦЕДУРЫ:')
    if (functionsResult.rows.length > 0) {
      functionsResult.rows.forEach((row, index) => {
        console.log(`   ${index + 1}. ${row.routine_name} (${row.routine_type}, ${row.security_type})`)
      })
    } else {
      console.log('   Функций не найдено')
    }

    console.log('')

    // Get database size info
    try {
      const sizeQuery = `
        SELECT
          pg_size_pretty(pg_database_size(current_database())) as database_size,
          current_database() as database_name;
      `
      const sizeResult = await pool.query(sizeQuery)

      if (sizeResult.rows.length > 0) {
        const { database_name, database_size } = sizeResult.rows[0]
        console.log('📊 ИНФОРМАЦИЯ О БАЗЕ ДАННЫХ:')
        console.log(`   База данных: ${database_name}`)
        console.log(`   Размер: ${database_size}`)
        console.log('')
      }
    } catch (error) {
      console.log('📊 Информация о размере базы данных недоступна')
    }

    // Connection info
    console.log('🔗 ПОДКЛЮЧЕНИЕ:')
    console.log(`   Host: ${process.env.PGHOST}`)
    console.log(`   Port: ${process.env.PGPORT}`)
    console.log(`   Database: ${process.env.PGDATABASE}`)
    console.log(`   User: ${process.env.PGUSER}`)
    console.log('')

  } catch (error) {
    console.error('💥 Ошибка инспекции:', error)
  } finally {
    await pool.end()
  }
}

inspectSupabaseDatabase()