#!/usr/bin/env tsx

import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

// Admin client
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

async function inspectDatabase() {
  console.log('🔍 Инспекция базы данных COMETA')
  console.log('==============================')
  console.log('')

  try {
    // Get list of tables
    const { data: tablesData, error: tablesError } = await supabaseAdmin
      .rpc('sql', {
        query: `
          SELECT table_name
          FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_type = 'BASE TABLE'
          ORDER BY table_name;
        `
      })

    if (tablesError) {
      console.error('Ошибка получения таблиц:', tablesError)
    } else {
      console.log('📋 ТАБЛИЦЫ В PUBLIC СХЕМЕ:')
      if (tablesData && tablesData.length > 0) {
        tablesData.forEach((row: any, index: number) => {
          console.log(`   ${index + 1}. ${row.table_name}`)
        })
      } else {
        console.log('   Таблиц не найдено')
      }
    }

    console.log('')

    // Get storage buckets
    const { data: bucketsData, error: bucketsError } = await supabaseAdmin.storage.listBuckets()

    console.log('🗂️  STORAGE BUCKET\'Ы:')
    if (bucketsError) {
      console.error('Ошибка получения bucket\'ов:', bucketsError)
    } else if (bucketsData && bucketsData.length > 0) {
      bucketsData.forEach((bucket, index) => {
        console.log(`   ${index + 1}. ${bucket.name} (public: ${bucket.public})`)
      })
    } else {
      console.log('   Bucket\'ов не найдено')
    }

    console.log('')

    // Get functions/procedures
    const { data: functionsData, error: functionsError } = await supabaseAdmin
      .rpc('sql', {
        query: `
          SELECT routine_name, routine_type
          FROM information_schema.routines
          WHERE routine_schema = 'public'
          ORDER BY routine_name;
        `
      })

    if (functionsError) {
      console.error('Ошибка получения функций:', functionsError)
    } else {
      console.log('⚙️  ФУНКЦИИ И ПРОЦЕДУРЫ:')
      if (functionsData && functionsData.length > 0) {
        functionsData.forEach((row: any, index: number) => {
          console.log(`   ${index + 1}. ${row.routine_name} (${row.routine_type})`)
        })
      } else {
        console.log('   Функций не найдено')
      }
    }

  } catch (error) {
    console.error('💥 Ошибка инспекции:', error)
  }
}

inspectDatabase()