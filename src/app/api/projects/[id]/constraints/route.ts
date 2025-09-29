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

export async function GET(request: NextRequest, { params }: Context) {
  try {
    const { id: projectId } = await params

    const { data: constraints, error } = await supabase
      .from('constraints')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Constraints query error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch constraints' },
        { status: 500 }
      )
    }

    // Transform database constraint types to frontend format
    const transformedConstraints = (constraints || []).map(constraint => ({
      ...constraint,
      frontend_type: extractFrontendType(constraint.description) || mapDatabaseTypeToFrontend(constraint.constraint_type),
      location: extractLocation(constraint.description)
    }))

    return NextResponse.json(transformedConstraints)

  } catch (error) {
    console.error('Project constraints error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project constraints' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest, { params }: Context) {
  try {
    const { id: projectId } = await params
    const body = await request.json()
    const { type, severity, location, description } = body

    if (!type || !severity || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: type, severity, description' },
        { status: 400 }
      )
    }

    // Map frontend constraint type to database constraint type
    const dbConstraintType = mapFrontendTypeToDatabase(type)
    if (!dbConstraintType) {
      return NextResponse.json(
        { error: 'Invalid constraint type' },
        { status: 400 }
      )
    }

    const { data: constraint, error } = await supabase
      .from('constraints')
      .insert({
        project_id: projectId,
        constraint_type: dbConstraintType,
        description: location ? `[${type}]${location}: ${description}` : `[${type}]${description}`,
        severity: severity,
        status: 'active'
      })
      .select()
      .single()

    if (error) {
      console.error('Constraint creation error:', error)
      return NextResponse.json(
        { error: 'Failed to create constraint' },
        { status: 500 }
      )
    }

    // Transform response to match frontend format
    const transformedConstraint = {
      ...constraint,
      frontend_type: type,
      location: location
    }

    return NextResponse.json(transformedConstraint)

  } catch (error) {
    console.error('Project constraint creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create constraint' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: Context) {
  try {
    const { id: projectId } = await params
    const url = new URL(request.url)
    const constraintId = url.searchParams.get('constraint_id')

    if (!constraintId) {
      return NextResponse.json(
        { error: 'Constraint ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('constraints')
      .delete()
      .eq('id', constraintId)
      .eq('project_id', projectId) // Ensure constraint belongs to project

    if (error) {
      console.error('Constraint deletion error:', error)
      return NextResponse.json(
        { error: 'Failed to delete constraint' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Project constraint deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete constraint' },
      { status: 500 }
    )
  }
}

// Helper functions to map between frontend and database constraint types
function mapFrontendTypeToDatabase(frontendType: string): string | null {
  const mapping: Record<string, string> = {
    'road_work': 'technical',
    'power_lines': 'environmental',
    'utilities': 'technical',
    'vegetation': 'environmental',
    'buildings': 'technical',
    'road_crossing': 'technical',
    'telecom': 'technical',
    'underground': 'technical'
  }
  return mapping[frontendType] || null
}

function mapDatabaseTypeToFrontend(databaseType: string): string {
  // This is a reverse mapping - for display purposes we'll use generic types
  const mapping: Record<string, string> = {
    'technical': 'technical',
    'environmental': 'environmental',
    'regulatory': 'regulatory',
    'resource': 'resource',
    'timeline': 'timeline',
    'budget': 'budget'
  }
  return mapping[databaseType] || databaseType
}

function extractFrontendType(description: string): string | null {
  const match = description.match(/^\[([^\]]+)\]/)
  return match ? match[1] : null
}

function extractLocation(description: string): string {
  // Remove the [type] prefix and extract location before the first colon
  const withoutType = description.replace(/^\[[^\]]+\]/, '')
  const colonIndex = withoutType.indexOf(':')
  if (colonIndex > 0) {
    return withoutType.substring(0, colonIndex).trim()
  }
  return ''
}