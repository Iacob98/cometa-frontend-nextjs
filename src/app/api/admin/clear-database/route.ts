import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    console.log('🗑️ Starting COMPREHENSIVE database cleanup of ALL tables...');

    // Comprehensive list of ALL possible tables in COMETA database
    // We'll try to clear all of these - errors for non-existent tables are okay
    const tablesToClear = [
      // Core Application Tables - Equipment & Vehicles
      'equipment',
      'equipment_assignments',
      'equipment_categories',
      'equipment_maintenance',
      'equipment_history',
      'vehicles',
      'vehicle_assignments',
      'vehicle_maintenance',
      'vehicle_history',
      'vehicle_categories',

      // Projects & Work Management
      'projects',
      'project_documents',
      'project_phases',
      'project_milestones',
      'work_entries',
      'work_entry_photos',
      'work_entry_documents',
      'cabinets',
      'cabinet_documents',
      'segments',
      'segment_documents',
      'cuts',
      'cut_documents',
      'cut_photos',

      // Materials & Inventory
      'materials',
      'material_categories',
      'material_allocations',
      'material_assignments',
      'material_orders',
      'material_order_items',
      'material_order_history',
      'material_receipts',
      'material_returns',
      'material_adjustments',
      'inventory_transactions',
      'inventory_counts',
      'stock_movements',

      // Suppliers & Vendors
      'suppliers',
      'supplier_contacts',
      'supplier_materials',
      'supplier_agreements',
      'supplier_project_assignments',
      'supplier_evaluations',
      'vendor_contacts',
      'vendor_agreements',

      // Teams & Human Resources
      'teams',
      'team_members',
      'team_assignments',
      'crews',
      'crew_members',
      'crew_assignments',
      'crew_schedules',
      'user_profiles',
      'user_preferences',
      'user_settings',
      'user_permissions',
      'user_roles',
      'user_sessions',
      'user_activity',
      'employee_records',
      'employee_schedules',
      'employee_timesheets',

      // Financial & Cost Management
      'costs',
      'cost_categories',
      'cost_allocations',
      'transactions',
      'transaction_categories',
      'invoices',
      'invoice_items',
      'invoice_payments',
      'purchase_orders',
      'purchase_order_items',
      'receipts',
      'expense_reports',
      'budget_allocations',
      'financial_reports',

      // Notifications & Communications
      'notifications',
      'notification_preferences',
      'messages',
      'announcements',
      'alerts',
      'email_logs',
      'sms_logs',
      'communication_logs',

      // System & Administrative
      'activities',
      'activity_logs',
      'audit_logs',
      'system_logs',
      'error_logs',
      'access_logs',
      'performance_logs',
      'settings',
      'system_settings',
      'application_settings',
      'feature_flags',
      'configuration',

      // Documents & Files
      'documents',
      'document_categories',
      'file_uploads',
      'file_metadata',
      'attachments',
      'photos',
      'photo_metadata',

      // Reports & Analytics
      'reports',
      'report_schedules',
      'report_exports',
      'exports',
      'export_history',
      'imports',
      'import_history',
      'data_exports',
      'analytics_data',

      // Backup & Maintenance
      'backups',
      'backup_history',
      'migrations',
      'migration_history',
      'schema_versions',
      'data_migrations',

      // Temporary & Cache
      'temporary_data',
      'temp_uploads',
      'cache_entries',
      'session_data',
      'job_queue',
      'background_jobs',
      'scheduled_tasks',

      // Quality & Compliance
      'quality_checks',
      'compliance_records',
      'inspection_reports',
      'safety_records',
      'incident_reports',

      // Additional potential tables
      'addresses',
      'contacts',
      'locations',
      'coordinates',
      'measurements',
      'specifications',
      'standards',
      'regulations',
      'approvals',
      'certifications',
      'licenses',
      'permits'
    ];

    const results = [];

    for (const table of tablesToClear) {
      try {
        console.log(`Clearing table: ${table}`);

        const { error } = await supabase
          .from(table)
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

        if (error) {
          console.warn(`Warning clearing ${table}:`, error.message);
          results.push({ table, status: 'warning', message: error.message });
        } else {
          console.log(`✅ Cleared ${table}`);
          results.push({ table, status: 'success' });
        }
      } catch (tableError) {
        console.warn(`Error clearing ${table}:`, tableError);
        results.push({ table, status: 'error', message: String(tableError) });
      }
    }

    // Also clear any file storage buckets if needed
    try {
      const buckets = [
        'project-photos',
        'work-photos',
        'user-avatars',
        'project-documents',
        'house-documents',
        'reports'
      ];

      for (const bucket of buckets) {
        try {
          const { data: files } = await supabase.storage.from(bucket).list();
          if (files && files.length > 0) {
            const filePaths = files.map(file => file.name);
            await supabase.storage.from(bucket).remove(filePaths);
            console.log(`🗑️ Cleared storage bucket: ${bucket}`);
          }
        } catch (bucketError) {
          console.warn(`Warning clearing bucket ${bucket}:`, bucketError);
        }
      }
    } catch (storageError) {
      console.warn('Storage cleanup warning:', storageError);
    }

    console.log('🧹 Database cleanup completed!');

    const successCount = results.filter(r => r.status === 'success').length;
    const warningCount = results.filter(r => r.status === 'warning').length;
    const errorCount = results.filter(r => r.status === 'error').length;

    return NextResponse.json({
      success: true,
      message: `COMPREHENSIVE database cleanup completed (users preserved)`,
      results: results,
      total_tables_attempted: tablesToClear.length,
      successfully_cleared: successCount,
      warnings: warningCount,
      errors: errorCount,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Database cleanup error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to clear database',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}