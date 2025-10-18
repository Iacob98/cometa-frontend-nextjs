/**
 * API Route: /api/vehicles/[id]/documents/[documentId]/download
 * Handles document download
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { downloadVehicleDocument, getVehicleDocumentSignedUrl } from '@/lib/vehicle-document-storage';

// Service role client for bypassing RLS
const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ==============================================================================
// GET: Download document file
// ==============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  try {
    const { id: vehicleId, documentId } = await params;

    if (!vehicleId || !documentId) {
      return NextResponse.json(
        { error: 'Vehicle ID and Document ID are required' },
        { status: 400 }
      );
    }

    // Get download mode from query params
    const searchParams = request.nextUrl.searchParams;
    const mode = searchParams.get('mode') || 'download'; // 'download' or 'view'
    const redirect = searchParams.get('redirect') === 'true';

    // Fetch document metadata from database
    const { data: document, error } = await supabaseService
      .from('vehicle_documents')
      .select('file_path, file_name, file_type')
      .eq('id', documentId)
      .eq('vehicle_id', vehicleId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Document not found' },
          { status: 404 }
        );
      }
      console.error('❌ Error fetching document:', error);
      return NextResponse.json(
        { error: 'Failed to fetch document' },
        { status: 500 }
      );
    }

    // If redirect mode, return signed URL for direct download
    if (redirect) {
      try {
        const signedUrl = await getVehicleDocumentSignedUrl(document.file_path, 300); // 5 min expiry

        console.log('✅ Redirecting to signed URL:', {
          vehicleId,
          documentId,
          fileName: document.file_name,
        });

        return NextResponse.redirect(signedUrl);
      } catch (urlError) {
        console.error('❌ Error generating signed URL:', urlError);
        return NextResponse.json(
          { error: 'Failed to generate download URL' },
          { status: 500 }
        );
      }
    }

    // Otherwise, download file and return as response
    try {
      const fileBlob = await downloadVehicleDocument(document.file_path);
      const arrayBuffer = await fileBlob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Set appropriate headers
      const headers = new Headers();
      headers.set('Content-Type', document.file_type || 'application/octet-stream');

      if (mode === 'download') {
        // Force download
        headers.set('Content-Disposition', `attachment; filename="${document.file_name}"`);
      } else {
        // Display in browser (for PDFs and images)
        headers.set('Content-Disposition', `inline; filename="${document.file_name}"`);
      }

      headers.set('Content-Length', buffer.length.toString());
      headers.set('Cache-Control', 'private, max-age=3600'); // Cache for 1 hour

      console.log('✅ Document downloaded:', {
        vehicleId,
        documentId,
        fileName: document.file_name,
        mode,
        size: buffer.length,
      });

      return new NextResponse(buffer, {
        status: 200,
        headers,
      });
    } catch (downloadError) {
      console.error('❌ Error downloading file:', downloadError);
      return NextResponse.json(
        { error: 'Failed to download file' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ GET download error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
