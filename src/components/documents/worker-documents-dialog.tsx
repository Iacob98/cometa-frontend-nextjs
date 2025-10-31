"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FileText,
  Shield,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Eye,
  X,
  Plus,
  Edit
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DocumentUpload } from "./document-upload";

import type { DocumentsResponse, WorkerDocument, DocumentStatus } from "@/types";

interface WorkerDocumentsDialogProps {
  userId: string;
  userName: string;
  trigger?: React.ReactNode;
}

async function fetchWorkerDocuments(userId: string): Promise<DocumentsResponse> {
  const response = await fetch(`/api/users/${userId}/documents`);
  if (!response.ok) {
    throw new Error('Failed to fetch documents');
  }
  return response.json();
}

function getStatusColor(status: DocumentStatus): string {
  switch (status) {
    case 'active':
      return 'bg-green-500';
    case 'expired':
      return 'bg-red-500';
    case 'expiring_soon':
      return 'bg-yellow-500';
    case 'pending':
      return 'bg-blue-500';
    case 'inactive':
      return 'bg-gray-500';
    default:
      return 'bg-gray-500';
  }
}

function getStatusIcon(status: DocumentStatus) {
  switch (status) {
    case 'active':
      return <CheckCircle className="h-4 w-4" />;
    case 'expired':
      return <AlertTriangle className="h-4 w-4" />;
    case 'expiring_soon':
      return <Clock className="h-4 w-4" />;
    case 'pending':
      return <Clock className="h-4 w-4" />;
    case 'inactive':
      return <X className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
}

function getStatusText(status: DocumentStatus): string {
  switch (status) {
    case 'active':
      return 'Действителен';
    case 'expired':
      return 'Истёк';
    case 'expiring_soon':
      return 'Истекает скоро';
    case 'pending':
      return 'В ожидании';
    case 'inactive':
      return 'Неактивен';
    default:
      return 'Неизвестен';
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function DocumentCard({ document }: { document: WorkerDocument }) {
  const statusColor = getStatusColor(document.status);
  const statusIcon = getStatusIcon(document.status);
  const statusText = getStatusText(document.status);
  const queryClient = useQueryClient();

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    document_number: document.document_number || '',
    issuing_authority: document.issuing_authority || '',
    issue_date: document.issue_date || '',
    expiry_date: document.expiry_date || '',
    notes: document.notes || ''
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const handleView = () => {
    // Open document in new tab for viewing (not downloading)
    const viewUrl = `/api/users/${document.user_id}/documents/${document.id}/view`;
    console.log(`👁️ Открываю документ "${document.file_name}" для просмотра`);
    window.open(viewUrl, '_blank');
  };

  const handleDownload = async () => {
    try {
      console.log(`💾 Скачиваю документ "${document.file_name}" для работника ID: ${document.user_id}`);
      // Download the document using the API endpoint
      const downloadUrl = `/api/users/${document.user_id}/documents/${document.id}/download`;

      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error('Failed to download document');
      }

      // Create blob from response
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.file_name;
      window.document.body.appendChild(link);
      link.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Ошибка при скачивании документа');
    }
  };

  const handleEdit = () => {
    // Reset form with current document data
    setEditForm({
      document_number: document.document_number || '',
      issuing_authority: document.issuing_authority || '',
      issue_date: document.issue_date || '',
      expiry_date: document.expiry_date || '',
      notes: document.notes || ''
    });
    setShowEditDialog(true);
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      console.log(`✏️ Обновляю документ "${document.file_name}" для работника ID: ${document.user_id}`);

      const response = await fetch(`/api/users/${document.user_id}/documents/${document.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        throw new Error('Failed to update document');
      }

      console.log(`✅ Документ "${document.file_name}" успешно обновлен`);

      // Refresh the documents list
      queryClient.invalidateQueries({
        queryKey: ['worker-documents', document.user_id]
      });

      setShowEditDialog(false);
      alert('Документ успешно обновлен');

    } catch (error) {
      console.error('Update failed:', error);
      alert('Ошибка при обновлении документа');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(`Вы уверены, что хотите удалить документ "${document.file_name}"?`);
    if (!confirmDelete) return;

    try {
      console.log(`🗑️ Удаляю документ "${document.file_name}" для работника ID: ${document.user_id}`);

      const response = await fetch(`/api/users/${document.user_id}/documents/${document.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      console.log(`✅ Документ "${document.file_name}" успешно удален`);

      // Refresh the documents list
      queryClient.invalidateQueries({
        queryKey: ['worker-documents', document.user_id]
      });

      alert('Документ успешно удален');

    } catch (error) {
      console.error('Delete failed:', error);
      alert('Ошибка при удалении документа');
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: document.category.color }}
            />
            {document.category.name_ru || document.category.name_en}
          </CardTitle>
          <Badge
            variant="secondary"
            className={`${statusColor} text-white flex items-center gap-1`}
          >
            {statusIcon}
            {statusText}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {document.document_number && (
            <div>
              <span className="font-medium text-muted-foreground">Номер документа:</span>
              <p>{document.document_number}</p>
            </div>
          )}

          {document.issuing_authority && (
            <div>
              <span className="font-medium text-muted-foreground">Выдавший орган:</span>
              <p>{document.issuing_authority}</p>
            </div>
          )}

          {document.issue_date && (
            <div>
              <span className="font-medium text-muted-foreground">Дата выдачи:</span>
              <p>{new Date(document.issue_date).toLocaleDateString('ru-RU')}</p>
            </div>
          )}

          {document.expiry_date && (
            <div>
              <span className="font-medium text-muted-foreground">Дата истечения:</span>
              <p className={document.status === 'expired' ? 'text-red-600 font-medium' : document.status === 'expiring_soon' ? 'text-yellow-600 font-medium' : ''}>
                {new Date(document.expiry_date).toLocaleDateString('ru-RU')}
              </p>
            </div>
          )}
        </div>

        {document.notes && (
          <div>
            <span className="font-medium text-muted-foreground">Примечания:</span>
            <p className="text-sm mt-1">{document.notes}</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>{document.file_name}</span>
            <span>({formatFileSize(document.file_size)})</span>
            {document.is_verified && (
              <Badge variant="outline" className="text-green-600 border-green-600">
                <Shield className="h-3 w-3 mr-1" />
                Проверен
              </Badge>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleView}>
              <Eye className="h-4 w-4 mr-1" />
              Просмотр
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-1" />
              Скачать
            </Button>
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-1" />
              Редактировать
            </Button>
            <Button variant="outline" size="sm" onClick={handleDelete} className="text-red-600 hover:text-red-700">
              <X className="h-4 w-4 mr-1" />
              Удалить
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="w-full max-w-[95vw] sm:max-w-md md:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Редактировать документ</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 sm:space-y-4 p-3 sm:p-4">
            <div>
              <Label htmlFor="document_number">Номер документа <span className="text-muted-foreground text-xs">(Optional)</span></Label>
              <Input
                id="document_number"
                value={editForm.document_number}
                onChange={(e) => setEditForm({ ...editForm, document_number: e.target.value })}
                placeholder="Введите номер документа..."
              />
            </div>

            <div>
              <Label htmlFor="issuing_authority">Выдающий орган <span className="text-muted-foreground text-xs">(Optional)</span></Label>
              <Input
                id="issuing_authority"
                value={editForm.issuing_authority}
                onChange={(e) => setEditForm({ ...editForm, issuing_authority: e.target.value })}
                placeholder="Введите выдающий орган..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label htmlFor="issue_date">Дата выдачи <span className="text-muted-foreground text-xs">(Optional)</span></Label>
                <Input
                  id="issue_date"
                  type="date"
                  value={editForm.issue_date}
                  onChange={(e) => setEditForm({ ...editForm, issue_date: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="expiry_date">Дата истечения <span className="text-muted-foreground text-xs">(Optional)</span></Label>
                <Input
                  id="expiry_date"
                  type="date"
                  value={editForm.expiry_date}
                  onChange={(e) => setEditForm({ ...editForm, expiry_date: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Примечания <span className="text-muted-foreground text-xs">(Optional)</span></Label>
              <Textarea
                id="notes"
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                placeholder="Введите примечания..."
                rows={3}
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowEditDialog(false)}
                disabled={isUpdating}
              >
                Отмена
              </Button>
              <Button
                onClick={handleUpdate}
                disabled={isUpdating}
              >
                {isUpdating ? 'Сохранение...' : 'Сохранить'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function DocumentsByCategory({ documents }: { documents: WorkerDocument[] }) {
  // Group documents by category
  const documentsByCategory = documents.reduce((acc, doc) => {
    const categoryName = doc.category.name_ru || doc.category.name_en;
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(doc);
    return acc;
  }, {} as Record<string, WorkerDocument[]>);

  return (
    <div className="space-y-6">
      {Object.entries(documentsByCategory).map(([categoryName, categoryDocs]) => (
        <div key={categoryName}>
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: categoryDocs[0].category.color }}
            />
            {categoryName}
            <Badge variant="outline">{categoryDocs.length}</Badge>
          </h3>
          {categoryDocs.map(doc => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function WorkerDocumentsDialog({
  userId,
  userName,
  trigger
}: WorkerDocumentsDialogProps) {
  const [open, setOpen] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['worker-documents', userId],
    queryFn: () => fetchWorkerDocuments(userId),
    enabled: open, // Only fetch when dialog is open
  });

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <FileText className="h-4 w-4 mr-1" />
      Документы
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-2xl lg:max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                Документы работника: {userName}
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Просмотр всех документов работника (страховка, разрешения, удостоверения)
              </DialogDescription>
            </div>
            <Button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 text-xs sm:text-sm w-full sm:w-auto"
              size="sm"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
              Добавить документ
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
          {isLoading && (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-destructive text-sm">Ошибка загрузки документов</p>
            </div>
          )}

          {data && (
            <div className="space-y-4 sm:space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <Card>
                <CardContent className="p-3 sm:p-4 text-center">
                  <div className="text-lg sm:text-2xl font-bold">{data.stats.total}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Всего</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 sm:p-4 text-center">
                  <div className="text-lg sm:text-2xl font-bold text-green-600">{data.stats.active}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Действительных</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 sm:p-4 text-center">
                  <div className="text-lg sm:text-2xl font-bold text-yellow-600">{data.stats.expiring_soon}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Истекают скоро</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 sm:p-4 text-center">
                  <div className="text-lg sm:text-2xl font-bold text-red-600">{data.stats.expired}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Истёкших</div>
                </CardContent>
              </Card>
              </div>

              {/* Documents */}
              {data.documents.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-xs sm:text-sm font-semibold">Нет документов</h3>
                  <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                    У этого работника пока нет загруженных документов.
                  </p>
                </div>
              ) : (
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1">
                    <TabsTrigger value="all" className="text-xs sm:text-sm">Все ({data.stats.total})</TabsTrigger>
                    <TabsTrigger value="active" className="text-xs sm:text-sm">
                      <span className="hidden sm:inline">Действительные </span>
                      <span className="sm:hidden">Активн. </span>
                      ({data.stats.active})
                    </TabsTrigger>
                    <TabsTrigger value="expiring" className="text-xs sm:text-sm">Истекают ({data.stats.expiring_soon})</TabsTrigger>
                    <TabsTrigger value="expired" className="text-xs sm:text-sm">Истёкшие ({data.stats.expired})</TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="mt-4 sm:mt-6">
                  <DocumentsByCategory documents={data.documents.all || []} />
                </TabsContent>

                  <TabsContent value="active" className="mt-4 sm:mt-6">
                    <DocumentsByCategory
                      documents={(data.documents.all || []).filter(doc => doc.status === 'active')}
                    />
                  </TabsContent>

                  <TabsContent value="expiring" className="mt-4 sm:mt-6">
                    <DocumentsByCategory
                      documents={(data.documents.all || []).filter(doc => doc.status === 'expiring_soon')}
                    />
                  </TabsContent>

                  <TabsContent value="expired" className="mt-4 sm:mt-6">
                    <DocumentsByCategory
                      documents={(data.documents.all || []).filter(doc => doc.status === 'expired')}
                    />
                  </TabsContent>
                </Tabs>
              )}
            </div>
          )}
        </div>
      </DialogContent>

      {/* Upload Document Dialog */}
      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent className="w-full max-w-[95vw] sm:max-w-[85vw] md:max-w-xl">
          <DialogHeader>
            <DialogTitle>Загрузить документ для {userName}</DialogTitle>
            <DialogDescription>
              Загрузите новый документ (паспорт, разрешение на работу, страховка и т.д.)
            </DialogDescription>
          </DialogHeader>
          <DocumentUpload
            userId={userId}
            onUploadComplete={(document) => {
              console.log(`✅ Документ "${document.file_name}" успешно добавлен для работника: ${userName} (ID: ${userId})`);
              setShowUpload(false);
              // Refresh the documents data
              queryClient.invalidateQueries({
                queryKey: ['worker-documents', userId]
              });
              // Also invalidate categories data since it might be fetched from the same endpoint
              queryClient.invalidateQueries({
                queryKey: ['user-documents-categories', userId]
              });
            }}
          />
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}