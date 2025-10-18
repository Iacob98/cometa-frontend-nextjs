/**
 * VehicleDocumentsDialog Component
 * Main dialog for managing vehicle documents
 */

'use client';

import { useState } from 'react';
import { FileText, Plus, AlertCircle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { VehicleDocumentUpload } from './vehicle-document-upload';
import { VehicleDocumentCard } from './vehicle-document-card';
import { VehicleDocumentEditDialog } from './vehicle-document-edit-dialog';
import {
  useVehicleDocuments,
  useUpdateVehicleDocument,
  type VehicleDocument,
  type VehicleDocumentType,
} from '@/hooks/use-vehicle-documents';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ==============================================================================
// Types
// ==============================================================================

interface VehicleDocumentsDialogProps {
  vehicleId: string;
  vehicleName: string;
  trigger?: React.ReactNode;
}

// ==============================================================================
// Component
// ==============================================================================

export function VehicleDocumentsDialog({
  vehicleId,
  vehicleName,
  trigger,
}: VehicleDocumentsDialogProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'view' | 'upload'>('view');
  const [filterType, setFilterType] = useState<VehicleDocumentType | 'all'>('all');
  const [editingDocument, setEditingDocument] = useState<VehicleDocument | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const { data, isLoading, error } = useVehicleDocuments(vehicleId);
  const updateMutation = useUpdateVehicleDocument();

  const documents = data?.documents || [];

  // Filter documents by type
  const filteredDocuments =
    filterType === 'all'
      ? documents
      : documents.filter((doc) => doc.document_type === filterType);

  // Group documents by type
  const documentsByType = documents.reduce((acc, doc) => {
    if (!acc[doc.document_type]) {
      acc[doc.document_type] = [];
    }
    acc[doc.document_type].push(doc);
    return acc;
  }, {} as Record<VehicleDocumentType, VehicleDocument[]>);

  // Count documents with warnings
  const expiredCount = documents.filter((doc) => doc.expiry_status === 'expired').length;
  const expiringSoonCount = documents.filter(
    (doc) => doc.expiry_status === 'expiring_soon' || doc.expiry_status === 'expiring_warning'
  ).length;

  const handleUploadSuccess = () => {
    setActiveTab('view');
  };

  const handleEditDocument = (document: VehicleDocument) => {
    setEditingDocument(document);
    setShowEditDialog(true);
  };

  const handleEditSuccess = () => {
    setShowEditDialog(false);
    setEditingDocument(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Dokumente ({documents.length})
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Fahrzeugdokumente - {vehicleName}</span>
          </DialogTitle>
          <DialogDescription>
            Verwalten Sie alle Dokumente für dieses Fahrzeug
          </DialogDescription>
        </DialogHeader>

        {/* Warning Summary */}
        {(expiredCount > 0 || expiringSoonCount > 0) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {expiredCount > 0 && (
                <span className="font-medium">{expiredCount} abgelaufene Dokumente. </span>
              )}
              {expiringSoonCount > 0 && (
                <span className="font-medium">
                  {expiringSoonCount} Dokumente laufen bald ab.
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'view' | 'upload')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="view">
              Dokumente anzeigen ({documents.length})
            </TabsTrigger>
            <TabsTrigger value="upload">
              <Plus className="h-4 w-4 mr-2" />
              Hochladen
            </TabsTrigger>
          </TabsList>

          {/* View Tab */}
          <TabsContent value="view" className="flex-1 overflow-auto space-y-4 mt-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Fehler beim Laden der Dokumente: {(error as Error).message}
                </AlertDescription>
              </Alert>
            ) : documents.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600 mb-4">Noch keine Dokumente hochgeladen</p>
                <Button onClick={() => setActiveTab('upload')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Erstes Dokument hochladen
                </Button>
              </div>
            ) : (
              <>
                {/* Filter */}
                <div className="flex items-center justify-between">
                  <Select
                    value={filterType}
                    onValueChange={(value) => setFilterType(value as VehicleDocumentType | 'all')}
                  >
                    <SelectTrigger className="w-[250px]">
                      <SelectValue placeholder="Alle Dokumenttypen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle Dokumenttypen</SelectItem>
                      <SelectItem value="fahrzeugschein">Fahrzeugschein</SelectItem>
                      <SelectItem value="fahrzeugbrief">Fahrzeugbrief</SelectItem>
                      <SelectItem value="tuv">TÜV/HU</SelectItem>
                      <SelectItem value="versicherung">Versicherung</SelectItem>
                      <SelectItem value="au">AU</SelectItem>
                      <SelectItem value="wartung">Wartungsnachweis</SelectItem>
                      <SelectItem value="sonstiges">Sonstiges</SelectItem>
                    </SelectContent>
                  </Select>

                  <p className="text-sm text-gray-600">
                    {filteredDocuments.length} von {documents.length} Dokumenten
                  </p>
                </div>

                {/* Documents Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredDocuments.map((document) => (
                    <VehicleDocumentCard
                      key={document.id}
                      document={document}
                      onEdit={handleEditDocument}
                    />
                  ))}
                </div>

                {filteredDocuments.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-600">
                      Keine Dokumente für den ausgewählten Typ gefunden
                    </p>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Upload Tab */}
          <TabsContent value="upload" className="flex-1 overflow-auto mt-4">
            <VehicleDocumentUpload
              vehicleId={vehicleId}
              onSuccess={handleUploadSuccess}
              onCancel={() => setActiveTab('view')}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>

      {/* Edit Dialog */}
      <VehicleDocumentEditDialog
        document={editingDocument}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSuccess={handleEditSuccess}
      />
    </Dialog>
  );
}
