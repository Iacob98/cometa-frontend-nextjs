import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/**
 * POST /api/notifications/generate
 * Auto-generate notifications for:
 * - Low stock materials
 * - Expiring rentals (facilities, housing, equipment, vehicles)
 * - Due documents
 */
export async function POST(request: NextRequest) {
  try {
    const generatedNotifications: Array<{
      type: string
      title: string
      message: string
      priority: string
      metadata: any
    }> = []

    // 1. Check for low stock materials
    const { data: lowStockMaterials, error: materialsError } = await supabase
      .from('materials')
      .select('id, name, current_stock, min_stock_threshold, unit')
      .eq('is_active', true)

    if (materialsError) {
      console.error('Error fetching low stock materials:', materialsError)
    } else if (lowStockMaterials && lowStockMaterials.length > 0) {
      for (const material of lowStockMaterials) {
        if (material.current_stock < material.min_stock_threshold) {
          const priority = material.current_stock === 0 ? 'urgent' :
                          material.current_stock <= material.min_stock_threshold / 2 ? 'high' : 'medium'

          generatedNotifications.push({
            type: 'warning',
            title: `Low Stock Alert: ${material.name}`,
            message: `${material.name} is running low. Current stock: ${material.current_stock} ${material.unit}, minimum threshold: ${material.min_stock_threshold} ${material.unit}`,
            priority,
            metadata: {
              material_id: material.id,
              material_name: material.name,
              current_stock: material.current_stock,
              min_stock_threshold: material.min_stock_threshold,
              notification_category: 'material_low_stock'
            }
          })
        }
      }
    }

    // 2. Check for expiring facilities (within 7 days)
    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)

    const { data: expiringFacilities, error: facilitiesError } = await supabase
      .from('facilities')
      .select(`
        id,
        type,
        end_date,
        project_id,
        projects:project_id (
          id,
          name
        )
      `)
      .not('end_date', 'is', null)
      .lte('end_date', sevenDaysFromNow.toISOString().split('T')[0])
      .gte('end_date', new Date().toISOString().split('T')[0])
      .eq('status', 'active')

    if (facilitiesError) {
      console.error('Error fetching expiring facilities:', facilitiesError)
    } else if (expiringFacilities && expiringFacilities.length > 0) {
      for (const facility of expiringFacilities) {
        const daysUntilExpiry = Math.ceil(
          (new Date(facility.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        )
        const priority = daysUntilExpiry <= 2 ? 'urgent' : daysUntilExpiry <= 5 ? 'high' : 'medium'

        generatedNotifications.push({
          type: 'reminder',
          title: `Facility Rental Expiring: ${facility.type}`,
          message: `Facility rental for ${facility.type} expires in ${daysUntilExpiry} days (${facility.end_date}). Project: ${(facility.projects as any)?.name || 'Unknown'}`,
          priority,
          metadata: {
            facility_id: facility.id,
            facility_type: facility.type,
            end_date: facility.end_date,
            project_id: facility.project_id,
            project_name: (facility.projects as any)?.name,
            days_until_expiry: daysUntilExpiry,
            notification_category: 'rental_expiring'
          }
        })
      }
    }

    // 3. Check for expiring housing units (within 7 days)
    const { data: expiringHousing, error: housingError } = await supabase
      .from('housing_units')
      .select(`
        id,
        address,
        unit_number,
        check_out_date,
        project_id,
        projects:project_id (
          id,
          name
        )
      `)
      .not('check_out_date', 'is', null)
      .lte('check_out_date', sevenDaysFromNow.toISOString().split('T')[0])
      .gte('check_out_date', new Date().toISOString().split('T')[0])
      .eq('status', 'occupied')

    if (housingError) {
      console.error('Error fetching expiring housing:', housingError)
    } else if (expiringHousing && expiringHousing.length > 0) {
      for (const housing of expiringHousing) {
        const daysUntilExpiry = Math.ceil(
          (new Date(housing.check_out_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        )
        const priority = daysUntilExpiry <= 2 ? 'urgent' : daysUntilExpiry <= 5 ? 'high' : 'medium'

        generatedNotifications.push({
          type: 'reminder',
          title: `Housing Unit Check-out: ${housing.address || housing.unit_number}`,
          message: `Housing unit check-out in ${daysUntilExpiry} days (${housing.check_out_date}). Project: ${(housing.projects as any)?.name || 'Unknown'}`,
          priority,
          metadata: {
            housing_id: housing.id,
            address: housing.address,
            unit_number: housing.unit_number,
            check_out_date: housing.check_out_date,
            project_id: housing.project_id,
            project_name: (housing.projects as any)?.name,
            days_until_expiry: daysUntilExpiry,
            notification_category: 'rental_expiring'
          }
        })
      }
    }

    // 4. Check for expiring equipment assignments (within 7 days)
    const { data: expiringEquipment, error: equipmentError } = await supabase
      .from('equipment_assignments')
      .select(`
        id,
        to_ts,
        equipment_id,
        project_id,
        equipment:equipment_id (
          id,
          name,
          model
        ),
        projects:project_id (
          id,
          name
        )
      `)
      .not('to_ts', 'is', null)
      .lte('to_ts', sevenDaysFromNow.toISOString())
      .gte('to_ts', new Date().toISOString())
      .eq('is_active', true)

    if (equipmentError) {
      console.error('Error fetching expiring equipment:', equipmentError)
    } else if (expiringEquipment && expiringEquipment.length > 0) {
      for (const assignment of expiringEquipment) {
        const daysUntilExpiry = Math.ceil(
          (new Date(assignment.to_ts).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        )
        const priority = daysUntilExpiry <= 2 ? 'urgent' : daysUntilExpiry <= 5 ? 'high' : 'medium'
        const equipmentName = (assignment.equipment as any)?.name || 'Equipment'

        generatedNotifications.push({
          type: 'reminder',
          title: `Equipment Rental Expiring: ${equipmentName}`,
          message: `Equipment assignment for ${equipmentName} expires in ${daysUntilExpiry} days. Project: ${(assignment.projects as any)?.name || 'Unknown'}`,
          priority,
          metadata: {
            assignment_id: assignment.id,
            equipment_id: assignment.equipment_id,
            equipment_name: equipmentName,
            to_ts: assignment.to_ts,
            project_id: assignment.project_id,
            project_name: (assignment.projects as any)?.name,
            days_until_expiry: daysUntilExpiry,
            notification_category: 'rental_expiring'
          }
        })
      }
    }

    // 5. Check for expiring vehicle assignments (within 7 days)
    const { data: expiringVehicles, error: vehiclesError } = await supabase
      .from('vehicle_assignments')
      .select(`
        id,
        to_ts,
        vehicle_id,
        project_id,
        vehicles:vehicle_id (
          id,
          make,
          model,
          license_plate
        ),
        projects:project_id (
          id,
          name
        )
      `)
      .not('to_ts', 'is', null)
      .lte('to_ts', sevenDaysFromNow.toISOString())
      .gte('to_ts', new Date().toISOString())
      .eq('is_active', true)

    if (vehiclesError) {
      console.error('Error fetching expiring vehicles:', vehiclesError)
    } else if (expiringVehicles && expiringVehicles.length > 0) {
      for (const assignment of expiringVehicles) {
        const daysUntilExpiry = Math.ceil(
          (new Date(assignment.to_ts).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        )
        const priority = daysUntilExpiry <= 2 ? 'urgent' : daysUntilExpiry <= 5 ? 'high' : 'medium'
        const vehicle = assignment.vehicles as any
        const vehicleName = vehicle ? `${vehicle.make} ${vehicle.model} (${vehicle.license_plate})` : 'Vehicle'

        generatedNotifications.push({
          type: 'reminder',
          title: `Vehicle Rental Expiring: ${vehicleName}`,
          message: `Vehicle assignment expires in ${daysUntilExpiry} days. Project: ${(assignment.projects as any)?.name || 'Unknown'}`,
          priority,
          metadata: {
            assignment_id: assignment.id,
            vehicle_id: assignment.vehicle_id,
            vehicle_name: vehicleName,
            to_ts: assignment.to_ts,
            project_id: assignment.project_id,
            project_name: (assignment.projects as any)?.name,
            days_until_expiry: daysUntilExpiry,
            notification_category: 'rental_expiring'
          }
        })
      }
    }

    // 6. Check for project documents with due dates (within 30 days)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

    const { data: dueDocuments, error: documentsError } = await supabase
      .from('project_documents')
      .select(`
        id,
        title,
        document_type,
        due_date,
        project_id,
        projects:project_id (
          id,
          name
        )
      `)
      .not('due_date', 'is', null)
      .lte('due_date', thirtyDaysFromNow.toISOString().split('T')[0])
      .gte('due_date', new Date().toISOString().split('T')[0])

    if (documentsError) {
      console.error('Error fetching due documents:', documentsError)
    } else if (dueDocuments && dueDocuments.length > 0) {
      for (const document of dueDocuments) {
        const daysUntilDue = Math.ceil(
          (new Date(document.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        )
        const priority = daysUntilDue <= 3 ? 'urgent' :
                        daysUntilDue <= 7 ? 'high' :
                        daysUntilDue <= 14 ? 'medium' : 'low'

        generatedNotifications.push({
          type: 'reminder',
          title: `Document Due: ${document.title}`,
          message: `Document "${document.title}" is due in ${daysUntilDue} days (${document.due_date}). Project: ${(document.projects as any)?.name || 'Unknown'}`,
          priority,
          metadata: {
            document_id: document.id,
            document_title: document.title,
            document_type: document.document_type,
            due_date: document.due_date,
            project_id: document.project_id,
            project_name: (document.projects as any)?.name,
            days_until_due: daysUntilDue,
            notification_category: 'document_due'
          }
        })
      }
    }

    // Get all admin users to notify
    const { data: adminUsers, error: usersError } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .eq('is_active', true)

    if (usersError) {
      console.error('Error fetching admin users:', usersError)
      return NextResponse.json(
        { error: 'Failed to fetch admin users' },
        { status: 500 }
      )
    }

    // Create notifications for all admins
    const notificationsToInsert = []
    for (const notification of generatedNotifications) {
      for (const user of (adminUsers || [])) {
        // Check if similar notification already exists (within last 24 hours)
        const { data: existing } = await supabase
          .from('in_app_notifications')
          .select('id')
          .eq('user_id', user.id)
          .eq('title', notification.title)
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .limit(1)

        if (!existing || existing.length === 0) {
          notificationsToInsert.push({
            user_id: user.id,
            notification_type: notification.type,
            title: notification.title,
            message: notification.message,
            priority: notification.priority,
            data: notification.metadata,
            is_read: false,
            created_at: new Date().toISOString()
          })
        }
      }
    }

    if (notificationsToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('in_app_notifications')
        .insert(notificationsToInsert)

      if (insertError) {
        console.error('Error inserting notifications:', insertError)
        return NextResponse.json(
          { error: 'Failed to create notifications' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      generated: generatedNotifications.length,
      inserted: notificationsToInsert.length,
      categories: {
        low_stock: generatedNotifications.filter(n => n.metadata?.notification_category === 'material_low_stock').length,
        expiring_rentals: generatedNotifications.filter(n => n.metadata?.notification_category === 'rental_expiring').length,
        due_documents: generatedNotifications.filter(n => n.metadata?.notification_category === 'document_due').length,
      }
    })

  } catch (error) {
    console.error('Error generating notifications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
