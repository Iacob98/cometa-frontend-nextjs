#!/usr/bin/env tsx

/**
 * COMETA Database Cleanup Script
 *
 * This script cleans up old tables and resets the database to a fresh state.
 *
 * Usage:
 *   npm run cleanup:db
 *   or
 *   npx tsx scripts/cleanup-database.ts
 */

import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

// Admin client with service_role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function listTables(): Promise<string[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .neq('table_name', 'migrations')

    if (error) {
      console.error('Ошибка получения списка таблиц:', error)
      return []
    }

    return data?.map(row => row.table_name) || []
  } catch (error) {
    console.error('Ошибка:', error)
    return []
  }
}

async function listStorageBuckets(): Promise<string[]> {
  try {
    const { data, error } = await supabaseAdmin.storage.listBuckets()

    if (error) {
      console.error('Ошибка получения списка bucket\'ов:', error)
      return []
    }

    return data?.map(bucket => bucket.name) || []
  } catch (error) {
    console.error('Ошибка:', error)
    return []
  }
}

async function dropTable(tableName: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin.rpc('exec_sql', {
      sql: `DROP TABLE IF EXISTS "${tableName}" CASCADE;`
    })

    if (error) {
      console.error(`Ошибка удаления таблицы ${tableName}:`, error)
      return false
    }

    return true
  } catch (error) {
    console.error(`Ошибка удаления таблицы ${tableName}:`, error)
    return false
  }
}

async function deleteBucket(bucketName: string): Promise<boolean> {
  try {
    // First, delete all files in the bucket
    const { data: files } = await supabaseAdmin.storage
      .from(bucketName)
      .list()

    if (files && files.length > 0) {
      const filePaths = files.map(file => file.name)
      await supabaseAdmin.storage
        .from(bucketName)
        .remove(filePaths)
    }

    // Then delete the bucket
    const { error } = await supabaseAdmin.storage.deleteBucket(bucketName)

    if (error) {
      console.error(`Ошибка удаления bucket'а ${bucketName}:`, error)
      return false
    }

    return true
  } catch (error) {
    console.error(`Ошибка удаления bucket'а ${bucketName}:`, error)
    return false
  }
}

async function main() {
  console.log('🧹 COMETA Database Cleanup')
  console.log('==========================')
  console.log('')

  // Check environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Отсутствуют переменные окружения Supabase')
    process.exit(1)
  }

  console.log('✅ Переменные окружения настроены')
  console.log(`   - Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`)
  console.log('')

  try {
    // List existing tables
    console.log('📋 Получение списка таблиц...')
    const tables = await listTables()
    console.log(`Найдено таблиц: ${tables.length}`)
    tables.forEach(table => console.log(`   - ${table}`))
    console.log('')

    // List existing storage buckets
    console.log('🗂️  Получение списка storage bucket\'ов...')
    const buckets = await listStorageBuckets()
    console.log(`Найдено bucket'ов: ${buckets.length}`)
    buckets.forEach(bucket => console.log(`   - ${bucket}`))
    console.log('')

    // Ask for confirmation
    console.log('⚠️  ВНИМАНИЕ: Это действие удалит ВСЕ таблицы и данные!')
    console.log('Вы уверены, что хотите продолжить? (yes/no)')

    // For automated execution, skip confirmation
    const shouldCleanup = process.argv.includes('--force') || process.env.NODE_ENV === 'development'

    if (!shouldCleanup) {
      console.log('❌ Очистка отменена. Используйте --force для принудительной очистки.')
      process.exit(0)
    }

    console.log('🗑️  Начинается очистка базы данных...')
    console.log('')

    // Drop tables
    let droppedTables = 0
    for (const table of tables) {
      console.log(`Удаление таблицы: ${table}`)
      const success = await dropTable(table)
      if (success) {
        droppedTables++
        console.log(`✅ Удалена: ${table}`)
      } else {
        console.log(`❌ Ошибка удаления: ${table}`)
      }
    }

    // Delete storage buckets
    let deletedBuckets = 0
    for (const bucket of buckets) {
      console.log(`Удаление bucket'а: ${bucket}`)
      const success = await deleteBucket(bucket)
      if (success) {
        deletedBuckets++
        console.log(`✅ Удален: ${bucket}`)
      } else {
        console.log(`❌ Ошибка удаления: ${bucket}`)
      }
    }

    console.log('')
    console.log('🎉 ОЧИСТКА ЗАВЕРШЕНА!')
    console.log(`✅ Удалено таблиц: ${droppedTables}/${tables.length}`)
    console.log(`✅ Удалено bucket'ов: ${deletedBuckets}/${buckets.length}`)
    console.log('')
    console.log('Теперь можно запустить:')
    console.log('1. npm run init:storage  # Создать storage bucket\'ы')
    console.log('2. Настроить схему базы данных')
    console.log('')

  } catch (error) {
    console.error('💥 КРИТИЧЕСКАЯ ОШИБКА при очистке:', error)
    process.exit(1)
  }
}

// Run the script
main().catch(error => {
  console.error('Необработанная ошибка:', error)
  process.exit(1)
})