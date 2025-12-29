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
            Документы ({documents.length})
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Документы транспорта - {vehicleName}</span>
          </DialogTitle>
          <DialogDescription>
            Управление всеми документами для этого транспорта
          </DialogDescription>
        </DialogHeader>

        {/* Warning Summary */}
        {(expiredCount > 0 || expiringSoonCount > 0) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {expiredCount > 0 && (
                <span className="font-medium">{expiredCount} просроченных документов. </span>
              )}
              {expiringSoonCount > 0 && (
                <span className="font-medium">
                  {expiringSoonCount} документов скоро истекут.
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'view' | 'upload')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="view">
              Просмотр документов ({documents.length})
            </TabsTrigger>
            <TabsTrigger value="upload">
              <Plus className="h-4 w-4 mr-2" />
              Загрузить
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
                  Ошибка загрузки документов: {(error as Error).message}
                </AlertDescription>
              </Alert>
            ) : documents.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600 mb-4">Документы ещё не загружены</p>
                <Button onClick={() => setActiveTab('upload')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Загрузить первый документ
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
                      <SelectValue placeholder="Все типы документов" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все типы документов</SelectItem>
                      <SelectItem value="fahrzeugschein">Свид-во о регистрации (СТС)</SelectItem>
                      <SelectItem value="fahrzeugbrief">ПТС</SelectItem>
                      <SelectItem value="tuv">Техосмотр</SelectItem>
                      <SelectItem value="versicherung">Страховка</SelectItem>
                      <SelectItem value="au">Экол. проверка</SelectItem>
                      <SelectItem value="wartung">Сервисная книжка</SelectItem>
                      <SelectItem value="sonstiges">Прочее</SelectItem>
                    </SelectContent>
                  </Select>

                  <p className="text-sm text-gray-600">
                    {filteredDocuments.length} из {documents.length} документов
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
                      Документы выбранного типа не найдены
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
