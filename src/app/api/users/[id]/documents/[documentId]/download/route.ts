import { NextRequest, NextResponse } from 'next/server';
import { getDocument, getFile } from '@/lib/document-storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  try {
    const { id, documentId } = await params;

    if (!id || !documentId) {
      return NextResponse.json(
        { error: 'User ID and Document ID are required' },
        { status: 400 }
      );
    }

    // First check if we have the actual file stored
    const fileContent = getFile(documentId);
    const document = getDocument(id, documentId);

    console.log('🔍 Download Debug:', {
      userId: id,
      documentId,
      hasFileContent: !!fileContent,
      hasDocument: !!document,
      documentFileName: document?.file_name
    });

    if (fileContent && document) {
      // Create response with Blob for proper binary data handling
      const blob = new Blob([fileContent], {
        type: document.file_type || 'application/octet-stream'
      });

      // Properly encode filename for header
      const encodedFilename = encodeURIComponent(document.file_name);

      return new Response(blob, {
        status: 200,
        headers: {
          'Content-Type': document.file_type || 'application/octet-stream',
          'Content-Disposition': `attachment; filename*=UTF-8''${encodedFilename}`,
          'Content-Length': fileContent.length.toString(),
        },
      });
    }

    // Fall back to mock PDF if no real file is found
    const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/ProcSet [/PDF /Text]
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(Mock Document Content) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f
0000000010 00000 n
0000000053 00000 n
0000000110 00000 n
0000000297 00000 n
0000000389 00000 n
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
456
%%EOF`;

    // Return the mock PDF with appropriate headers
    return new Response(pdfContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="document-${documentId}.pdf"`,
        'Content-Length': pdfContent.length.toString(),
      },
    });
  } catch (error) {
    console.error('Document download API error:', error);
    return NextResponse.json(
      { error: 'Failed to download document' },
      { status: 500 }
    );
  }
}