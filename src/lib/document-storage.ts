import fs from 'fs';
import path from 'path';
import { calculateDocumentsExpiration } from './document-expiration';

// Persistent storage directories
const STORAGE_DIR = path.join(process.cwd(), '.tmp', 'documents');
const METADATA_FILE = path.join(STORAGE_DIR, 'metadata.json');

// Ensure storage directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

// Load metadata from file or initialize empty
let uploadedDocuments: Record<string, any[]> = {};
try {
  if (fs.existsSync(METADATA_FILE)) {
    const data = fs.readFileSync(METADATA_FILE, 'utf8');
    uploadedDocuments = JSON.parse(data);
  }
} catch (error) {
  console.warn('Could not load document metadata:', error);
  uploadedDocuments = {};
}

// Save metadata to file
function saveMetadata() {
  try {
    fs.writeFileSync(METADATA_FILE, JSON.stringify(uploadedDocuments, null, 2));
  } catch (error) {
    console.error('Could not save document metadata:', error);
  }
}

// Helper functions for document storage
export function storeDocument(userId: string, document: any) {
  if (!uploadedDocuments[userId]) {
    uploadedDocuments[userId] = [];
  }
  uploadedDocuments[userId].push(document);
  saveMetadata(); // Save to file
  console.log('📝 Document stored:', {
    userId,
    documentId: document.id,
    fileName: document.file_name,
    totalUserDocs: uploadedDocuments[userId].length
  });
}

export function storeFile(documentId: string, fileBuffer: Buffer) {
  const filePath = path.join(STORAGE_DIR, `${documentId}.bin`);
  try {
    fs.writeFileSync(filePath, fileBuffer);
    console.log('💾 File stored:', {
      documentId,
      fileSize: fileBuffer.length,
      filePath
    });
  } catch (error) {
    console.error('Error storing file:', error);
  }
}

export function getDocument(userId: string, documentId: string) {
  const userDocuments = uploadedDocuments[userId] || [];
  const document = userDocuments.find(doc => doc.id === documentId);
  console.log('🔍 Get document:', {
    userId,
    documentId,
    totalUserDocs: userDocuments.length,
    found: !!document,
    fileName: document?.file_name
  });
  return document;
}

export function getFile(documentId: string) {
  const filePath = path.join(STORAGE_DIR, `${documentId}.bin`);
  try {
    if (fs.existsSync(filePath)) {
      const file = fs.readFileSync(filePath);
      console.log('🔍 Get file:', {
        documentId,
        filePath,
        found: true,
        fileSize: file.length
      });
      return file;
    } else {
      console.log('🔍 Get file:', {
        documentId,
        filePath,
        found: false,
        fileSize: undefined
      });
      return null;
    }
  } catch (error) {
    console.error('Error reading file:', error);
    return null;
  }
}

export function updateDocument(userId: string, documentId: string, updates: any) {
  const userDocuments = uploadedDocuments[userId] || [];
  const documentIndex = userDocuments.findIndex(doc => doc.id === documentId);

  if (documentIndex !== -1) {
    // Update the document with new data
    uploadedDocuments[userId][documentIndex] = {
      ...uploadedDocuments[userId][documentIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };
    saveMetadata(); // Save to file

    console.log('✏️ Document updated:', {
      userId,
      documentId,
      fileName: uploadedDocuments[userId][documentIndex].file_name
    });

    return uploadedDocuments[userId][documentIndex];
  }

  return null;
}

export function deleteDocument(userId: string, documentId: string) {
  const userDocuments = uploadedDocuments[userId] || [];
  const documentIndex = userDocuments.findIndex(doc => doc.id === documentId);

  if (documentIndex !== -1) {
    const deletedDoc = userDocuments.splice(documentIndex, 1)[0];
    saveMetadata(); // Save to file

    // Also delete the file content
    const filePath = path.join(STORAGE_DIR, `${documentId}.bin`);
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }

    return deletedDoc;
  }

  return null;
}

export function getUserDocuments(userId: string) {
  const documents = uploadedDocuments[userId] || [];

  // Calculate expiration info for each document
  const { expirationInfo } = calculateDocumentsExpiration(documents);

  return expirationInfo;
}

export function getAllDocuments() {
  const allDocuments: any[] = [];

  Object.values(uploadedDocuments).forEach(userDocs => {
    allDocuments.push(...userDocs);
  });

  return allDocuments;
}

export function getAllDocumentsWithExpiration() {
  const allDocuments = getAllDocuments();
  return calculateDocumentsExpiration(allDocuments);
}