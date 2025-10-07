import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Service role client for bypassing RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Context {
  params: { id: string }
}

// GET /api/projects/[id]/contacts - Get all contacts for a project
export async function GET(request: NextRequest, { params }: Context) {
  try {
    const { id: projectId } = await params

    const { data: contacts, error } = await supabase
      .from('project_contacts')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Contacts query error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch contacts' },
        { status: 500 }
      )
    }

    return NextResponse.json(contacts || [])

  } catch (error) {
    console.error('Project contacts error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project contacts' },
      { status: 500 }
    )
  }
}

// POST /api/projects/[id]/contacts - Add a new contact
export async function POST(request: NextRequest, { params }: Context) {
  try {
    const { id: projectId } = await params
    const body = await request.json()
    const { first_name, last_name, department, phone, email, position, notes } = body

    // Validation
    if (!first_name || !last_name) {
      return NextResponse.json(
        { error: 'Missing required fields: first_name, last_name' },
        { status: 400 }
      )
    }

    const { data: contact, error } = await supabase
      .from('project_contacts')
      .insert({
        project_id: projectId,
        first_name,
        last_name,
        department: department || null,
        phone: phone || null,
        email: email || null,
        position: position || null,
        notes: notes || null,
        is_primary: false
      })
      .select()
      .single()

    if (error) {
      console.error('Contact creation error:', error)
      return NextResponse.json(
        { error: 'Failed to create contact' },
        { status: 500 }
      )
    }

    return NextResponse.json(contact, { status: 201 })

  } catch (error) {
    console.error('Project contact creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create contact' },
      { status: 500 }
    )
  }
}

// DELETE /api/projects/[id]/contacts?contact_id=... - Delete a contact
export async function DELETE(request: NextRequest, { params }: Context) {
  try {
    const { id: projectId } = await params
    const url = new URL(request.url)
    const contactId = url.searchParams.get('contact_id')

    if (!contactId) {
      return NextResponse.json(
        { error: 'contact_id is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('project_contacts')
      .delete()
      .eq('id', contactId)
      .eq('project_id', projectId) // Ensure contact belongs to project

    if (error) {
      console.error('Contact deletion error:', error)
      return NextResponse.json(
        { error: 'Failed to delete contact' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Project contact deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete contact' },
      { status: 500 }
    )
  }
}
