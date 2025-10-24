import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  createNotification,
  createBulkNotifications,
  getUserIdsByRole,
  getProjectManagerId,
  daysUntil,
  formatNotificationDate,
} from '@/lib/notification-helpers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Cron job for generating automatic notifications
 * Runs 3 times daily: 6 AM, 12 PM, 6 PM
 *
 * Vercel Cron: Add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/notifications",
 *     "schedule": "0 6,12,18 * * *"
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const results: Record<string, any> = {
    timestamp: new Date().toISOString(),
    triggers: [],
    stats: {
      total_notifications: 0,
      created: 0,
      skipped: 0,
      failed: 0,
    },
  };

  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Starting notification cron job...');

    // 1. Project Start Date Reminders (7, 3, 1, 0 days before)
    const projectStartResults = await generateProjectStartReminders();
    results.triggers.push(projectStartResults);
    updateStats(results.stats, projectStartResults.stats);

    // 2. Project End Date Reminders (30, 14, 7, 3, 1, 0 days before)
    const projectEndResults = await generateProjectEndReminders();
    results.triggers.push(projectEndResults);
    updateStats(results.stats, projectEndResults.stats);

    // 3. Material Delivery Reminders (7, 3, 1, 0, -1 days)
    const materialDeliveryResults = await generateMaterialDeliveryReminders();
    results.triggers.push(materialDeliveryResults);
    updateStats(results.stats, materialDeliveryResults.stats);

    // 4. Vehicle Document Expiration (90, 30, 14, 7, 3, 1, 0 days)
    const vehicleDocsResults = await generateVehicleDocumentReminders();
    results.triggers.push(vehicleDocsResults);
    updateStats(results.stats, vehicleDocsResults.stats);

    // 5. Equipment Document Expiration (90, 30, 14, 7, 3, 1, 0 days)
    const equipmentDocsResults = await generateEquipmentDocumentReminders();
    results.triggers.push(equipmentDocsResults);
    updateStats(results.stats, equipmentDocsResults.stats);

    // 6. Equipment Maintenance Due (30, 14, 7, 3, 1, 0 days)
    const maintenanceResults = await generateMaintenanceReminders();
    results.triggers.push(maintenanceResults);
    updateStats(results.stats, maintenanceResults.stats);

    const executionTime = Date.now() - startTime;
    results.execution_time_ms = executionTime;

    console.log(`Notification cron job completed in ${executionTime}ms`);
    console.log(`Total: ${results.stats.total_notifications}, Created: ${results.stats.created}, Skipped: ${results.stats.skipped}, Failed: ${results.stats.failed}`);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Notification cron job error:', error);
    return NextResponse.json(
      {
        error: 'Cron job failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        results,
      },
      { status: 500 }
    );
  }
}

function updateStats(totalStats: any, triggerStats: any) {
  totalStats.total_notifications += triggerStats.total || 0;
  totalStats.created += triggerStats.created || 0;
  totalStats.skipped += triggerStats.skipped || 0;
  totalStats.failed += triggerStats.failed || 0;
}

/**
 * Generate project start date reminders
 * Notifies PM at 7, 3, 1, and 0 days before project start
 */
async function generateProjectStartReminders() {
  const result = { name: 'project_start_reminders', stats: { total: 0, created: 0, skipped: 0, failed: 0 } };
  const reminderDays = [7, 3, 1, 0];

  try {
    // Get all active projects with future start dates
    const { data: projects, error } = await supabase
      .from('projects')
      .select('id, name, start_date, pm_user_id')
      .in('status', ['draft', 'planning', 'active'])
      .not('start_date', 'is', null)
      .not('pm_user_id', 'is', null);

    if (error) throw error;

    for (const project of projects || []) {
      const daysUntilStart = daysUntil(project.start_date);

      if (reminderDays.includes(daysUntilStart)) {
        const priority = daysUntilStart <= 1 ? 'urgent' : daysUntilStart <= 3 ? 'high' : 'normal';
        const title =
          daysUntilStart === 0
            ? `Projekt startet heute: ${project.name}`
            : `Projekt startet in ${daysUntilStart} Tagen: ${project.name}`;

        const notifResult = await createNotification({
          user_id: project.pm_user_id,
          title,
          message: `Das Projekt "${project.name}" startet am ${formatNotificationDate(project.start_date)}.`,
          type: 'project_start',
          priority,
          action_url: `/dashboard/projects/${project.id}`,
          data: {
            project_id: project.id,
            project_name: project.name,
            start_date: project.start_date,
            days_until: daysUntilStart,
          },
        });

        result.stats.total++;
        if (notifResult.success) {
          notifResult.skipped ? result.stats.skipped++ : result.stats.created++;
        } else {
          result.stats.failed++;
        }
      }
    }
  } catch (error) {
    console.error('Error generating project start reminders:', error);
  }

  return result;
}

/**
 * Generate project end date reminders
 * Notifies PM at 30, 14, 7, 3, 1, and 0 days before deadline
 */
async function generateProjectEndReminders() {
  const result = { name: 'project_end_reminders', stats: { total: 0, created: 0, skipped: 0, failed: 0 } };
  const reminderDays = [30, 14, 7, 3, 1, 0];

  try {
    const { data: projects, error } = await supabase
      .from('projects')
      .select('id, name, end_date_plan, pm_user_id')
      .eq('status', 'active')
      .not('end_date_plan', 'is', null)
      .not('pm_user_id', 'is', null);

    if (error) throw error;

    for (const project of projects || []) {
      const daysUntilEnd = daysUntil(project.end_date_plan);

      if (reminderDays.includes(daysUntilEnd)) {
        const priority = daysUntilEnd <= 3 ? 'urgent' : daysUntilEnd <= 7 ? 'high' : 'normal';
        const title =
          daysUntilEnd === 0
            ? `Projekt-Deadline heute: ${project.name}`
            : `Projekt endet in ${daysUntilEnd} Tagen: ${project.name}`;

        const notifResult = await createNotification({
          user_id: project.pm_user_id,
          title,
          message: `Die geplante Fertigstellung für "${project.name}" ist am ${formatNotificationDate(project.end_date_plan)}.`,
          type: 'project_end',
          priority,
          action_url: `/dashboard/projects/${project.id}`,
          data: {
            project_id: project.id,
            project_name: project.name,
            end_date: project.end_date_plan,
            days_until: daysUntilEnd,
          },
        });

        result.stats.total++;
        if (notifResult.success) {
          notifResult.skipped ? result.stats.skipped++ : result.stats.created++;
        } else {
          result.stats.failed++;
        }
      }
    }
  } catch (error) {
    console.error('Error generating project end reminders:', error);
  }

  return result;
}

/**
 * Generate material delivery reminders
 * Notifies PM at 7, 3, 1, 0, and -1 days (for overdue)
 */
async function generateMaterialDeliveryReminders() {
  const result = { name: 'material_delivery_reminders', stats: { total: 0, created: 0, skipped: 0, failed: 0 } };
  const reminderDays = [7, 3, 1, 0, -1];

  try {
    const { data: orders, error } = await supabase
      .from('material_orders')
      .select('id, expected_delivery_date, project_id, supplier')
      .in('status', ['ordered', 'confirmed'])
      .not('expected_delivery_date', 'is', null)
      .not('project_id', 'is', null);

    if (error) throw error;

    for (const order of orders || []) {
      const daysUntilDelivery = daysUntil(order.expected_delivery_date);

      if (reminderDays.includes(daysUntilDelivery)) {
        const pmId = await getProjectManagerId(order.project_id);
        if (!pmId) continue;

        const isOverdue = daysUntilDelivery < 0;
        const priority = isOverdue ? 'urgent' : daysUntilDelivery <= 1 ? 'high' : 'normal';

        let title, message;
        if (isOverdue) {
          title = `Überfällige Lieferung (Bestellung #${order.id.slice(0, 8)})`;
          message = `Die Lieferung von ${order.supplier || 'Lieferant'} ist überfällig (geplant: ${formatNotificationDate(order.expected_delivery_date)}).`;
        } else if (daysUntilDelivery === 0) {
          title = `Lieferung heute (Bestellung #${order.id.slice(0, 8)})`;
          message = `Materiallieferung von ${order.supplier || 'Lieferant'} wird heute erwartet.`;
        } else {
          title = `Lieferung in ${daysUntilDelivery} Tagen (Bestellung #${order.id.slice(0, 8)})`;
          message = `Materiallieferung von ${order.supplier || 'Lieferant'} geplant für ${formatNotificationDate(order.expected_delivery_date)}.`;
        }

        const notifResult = await createNotification({
          user_id: pmId,
          title,
          message,
          type: 'material_delivery',
          priority,
          action_url: `/dashboard/materials/orders`,
          data: {
            order_id: order.id,
            delivery_date: order.expected_delivery_date,
            days_until: daysUntilDelivery,
            supplier_name: order.supplier,
          },
        });

        result.stats.total++;
        if (notifResult.success) {
          notifResult.skipped ? result.stats.skipped++ : result.stats.created++;
        } else {
          result.stats.failed++;
        }
      }
    }
  } catch (error) {
    console.error('Error generating material delivery reminders:', error);
  }

  return result;
}

/**
 * Generate vehicle document expiration reminders
 */
async function generateVehicleDocumentReminders() {
  const result = { name: 'vehicle_document_expiration', stats: { total: 0, created: 0, skipped: 0, failed: 0 } };
  const reminderDays = [90, 30, 14, 7, 3, 1, 0];

  try {
    const { data: documents, error } = await supabase
      .from('vehicle_documents')
      .select('id, vehicle_id, document_type, expiry_date, vehicles(license_plate)')
      .not('expiry_date', 'is', null);

    if (error) throw error;

    // Notify all admins about vehicle document expiration
    const adminIds = await getUserIdsByRole('admin');

    for (const doc of documents || []) {
      const daysUntilExpiry = daysUntil(doc.expiry_date);

      if (reminderDays.includes(daysUntilExpiry)) {
        const isExpired = daysUntilExpiry < 0;
        const priority = isExpired ? 'urgent' : daysUntilExpiry <= 7 ? 'high' : 'normal';

        const vehiclePlate = (doc as any).vehicles?.license_plate || 'Unbekanntes Fahrzeug';

        let title;
        if (isExpired) {
          title = `Abgelaufenes Dokument: ${doc.document_type} (${vehiclePlate})`;
        } else if (daysUntilExpiry === 0) {
          title = `Dokument läuft heute ab: ${doc.document_type} (${vehiclePlate})`;
        } else {
          title = `Dokument läuft in ${daysUntilExpiry} Tagen ab: ${doc.document_type}`;
        }

        const notifResults = await createBulkNotifications(adminIds, {
          title,
          message: `Fahrzeug ${vehiclePlate}: ${doc.document_type} läuft am ${formatNotificationDate(doc.expiry_date)} ab.`,
          type: 'document_expiration',
          priority,
          action_url: `/dashboard/vehicles`,
          data: {
            document_id: doc.id,
            vehicle_id: doc.vehicle_id,
            document_type: doc.document_type,
            expiration_date: doc.expiry_date,
            days_until: daysUntilExpiry,
          },
        });

        result.stats.total += notifResults.total;
        result.stats.created += notifResults.created;
        result.stats.skipped += notifResults.skipped;
        result.stats.failed += notifResults.failed;
      }
    }
  } catch (error) {
    console.error('Error generating vehicle document reminders:', error);
  }

  return result;
}

/**
 * Generate equipment document expiration reminders
 */
async function generateEquipmentDocumentReminders() {
  const result = { name: 'equipment_document_expiration', stats: { total: 0, created: 0, skipped: 0, failed: 0 } };
  const reminderDays = [90, 30, 14, 7, 3, 1, 0];

  try {
    const { data: documents, error } = await supabase
      .from('equipment_documents')
      .select('id, equipment_id, document_type, expiry_date, equipment(name, inventory_no)')
      .not('expiry_date', 'is', null);

    if (error) throw error;

    const adminIds = await getUserIdsByRole('admin');

    for (const doc of documents || []) {
      const daysUntilExpiry = daysUntil(doc.expiry_date);

      if (reminderDays.includes(daysUntilExpiry)) {
        const isExpired = daysUntilExpiry < 0;
        const priority = isExpired ? 'urgent' : daysUntilExpiry <= 7 ? 'high' : 'normal';

        const equipmentName = (doc as any).equipment?.name || 'Unbekannte Ausrüstung';
        const equipmentInventoryNo = (doc as any).equipment?.inventory_no;

        let title;
        if (isExpired) {
          title = `Abgelaufenes Dokument: ${doc.document_type} (${equipmentName})`;
        } else if (daysUntilExpiry === 0) {
          title = `Dokument läuft heute ab: ${doc.document_type}`;
        } else {
          title = `Dokument läuft in ${daysUntilExpiry} Tagen ab: ${doc.document_type}`;
        }

        const notifResults = await createBulkNotifications(adminIds, {
          title,
          message: `Ausrüstung "${equipmentName}" ${equipmentInventoryNo ? `(${equipmentInventoryNo})` : ''}: ${doc.document_type} läuft am ${formatNotificationDate(doc.expiry_date)} ab.`,
          type: 'document_expiration',
          priority,
          action_url: `/dashboard/equipment`,
          data: {
            document_id: doc.id,
            equipment_id: doc.equipment_id,
            document_type: doc.document_type,
            expiration_date: doc.expiry_date,
            days_until: daysUntilExpiry,
          },
        });

        result.stats.total += notifResults.total;
        result.stats.created += notifResults.created;
        result.stats.skipped += notifResults.skipped;
        result.stats.failed += notifResults.failed;
      }
    }
  } catch (error) {
    console.error('Error generating equipment document reminders:', error);
  }

  return result;
}

/**
 * Generate equipment maintenance reminders
 */
async function generateMaintenanceReminders() {
  const result = { name: 'maintenance_reminders', stats: { total: 0, created: 0, skipped: 0, failed: 0 } };
  const reminderDays = [30, 14, 7, 3, 1, 0];

  try {
    const { data: schedules, error } = await supabase
      .from('equipment_maintenance')
      .select('id, equipment_id, scheduled_date, maintenance_type, equipment(name, inventory_no)')
      .eq('status', 'scheduled')
      .not('scheduled_date', 'is', null);

    if (error) throw error;

    const adminIds = await getUserIdsByRole('admin');

    for (const schedule of schedules || []) {
      const daysUntilMaintenance = daysUntil(schedule.scheduled_date);

      if (reminderDays.includes(daysUntilMaintenance)) {
        const isOverdue = daysUntilMaintenance < 0;
        const priority = isOverdue ? 'urgent' : daysUntilMaintenance <= 3 ? 'high' : 'normal';

        const equipmentName = (schedule as any).equipment?.name || 'Unbekannte Ausrüstung';
        const equipmentInventoryNo = (schedule as any).equipment?.inventory_no;

        let title;
        if (isOverdue) {
          title = `Überfällige Wartung: ${equipmentName}`;
        } else if (daysUntilMaintenance === 0) {
          title = `Wartung heute fällig: ${equipmentName}`;
        } else {
          title = `Wartung in ${daysUntilMaintenance} Tagen: ${equipmentName}`;
        }

        const notifResults = await createBulkNotifications(adminIds, {
          title,
          message: `${schedule.maintenance_type} für "${equipmentName}" ${equipmentInventoryNo ? `(${equipmentInventoryNo})` : ''} geplant am ${formatNotificationDate(schedule.scheduled_date)}.`,
          type: 'maintenance_due',
          priority,
          action_url: `/dashboard/equipment`,
          data: {
            schedule_id: schedule.id,
            equipment_id: schedule.equipment_id,
            maintenance_type: schedule.maintenance_type,
            scheduled_date: schedule.scheduled_date,
            days_until: daysUntilMaintenance,
          },
        });

        result.stats.total += notifResults.total;
        result.stats.created += notifResults.created;
        result.stats.skipped += notifResults.skipped;
        result.stats.failed += notifResults.failed;
      }
    }
  } catch (error) {
    console.error('Error generating maintenance reminders:', error);
  }

  return result;
}
