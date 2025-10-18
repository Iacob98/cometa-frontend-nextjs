/**
 * VehicleDocumentCard Component
 * Displays individual vehicle document with actions
 */

'use client';

import { useState } from 'react';
import {
  FileText,
  Download,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Building,
  Hash,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  useDeleteVehicleDocument,
  type VehicleDocument,
  getDocumentTypeLabel,
  getExpiryStatusColor,
  getExpiryStatusLabel,
  formatFileSize,
  formatDate,
  getDocumentDownloadUrl,
} from '@/hooks/use-vehicle-documents';

// ==============================================================================
// Types
// ==============================================================================

interface VehicleDocumentCardProps {
  document: VehicleDocument;
  onEdit?: (document: VehicleDocument) => void;
  onDelete?: () => void;
}

// ==============================================================================
// Component
// ==============================================================================

export function VehicleDocumentCard({ document, onEdit, onDelete }: VehicleDocumentCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const deleteMutation = useDeleteVehicleDocument();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync({
        vehicleId: document.vehicle_id,
        documentId: document.id,
      });
      onDelete?.();
      setShowDeleteDialog(false);
    } catch (error) {
      // Error is handled by the mutation hook
      console.error('Delete error:', error);
    }
  };

  const handleDownload = () => {
    const url = getDocumentDownloadUrl(document.vehicle_id, document.id, 'download');
    window.open(url, '_blank');
  };

  const handleView = () => {
    const url = getDocumentDownloadUrl(document.vehicle_id, document.id, 'view');
    window.open(url, '_blank');
  };

  const isExpiringSoon = document.expiry_status === 'expiring_soon';
  const isExpired = document.expiry_status === 'expired';
  const showWarning = isExpiringSoon || isExpired;

  return (
    <>
      <Card className={showWarning ? 'border-orange-200 bg-orange-50/30' : ''}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-gray-500" />
              <div>
                <CardTitle className="text-base">
                  {getDocumentTypeLabel(document.document_type)}
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  {document.file_name}
                </CardDescription>
              </div>
            </div>

            {/* Expiry Status Badge */}
            {document.expiry_status && (
              <Badge
                variant="outline"
                className={getExpiryStatusColor(document.expiry_status)}
              >
                {getExpiryStatusLabel(document.expiry_status)}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Expiry Warning */}
          {showWarning && document.expiry_date && (
            <div className="flex items-start space-x-2 p-3 bg-orange-100 border border-orange-300 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-orange-800">
                {isExpired ? (
                  <p>
                    <strong>Abgelaufen am:</strong> {formatDate(document.expiry_date)}
                  </p>
                ) : (
                  <p>
                    <strong>Läuft ab am:</strong> {formatDate(document.expiry_date)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Document Metadata */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {document.document_number && (
              <div className="flex items-center space-x-2 text-gray-600">
                <Hash className="h-4 w-4" />
                <div>
                  <p className="text-xs text-gray-500">Nummer</p>
                  <p className="font-medium text-gray-900">{document.document_number}</p>
                </div>
              </div>
            )}

            {document.issuing_authority && (
              <div className="flex items-center space-x-2 text-gray-600">
                <Building className="h-4 w-4" />
                <div>
                  <p className="text-xs text-gray-500">Behörde</p>
                  <p className="font-medium text-gray-900">{document.issuing_authority}</p>
                </div>
              </div>
            )}

            {document.issue_date && (
              <div className="flex items-center space-x-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                <div>
                  <p className="text-xs text-gray-500">Ausgestellt</p>
                  <p className="font-medium text-gray-900">{formatDate(document.issue_date)}</p>
                </div>
              </div>
            )}

            {document.expiry_date && (
              <div className="flex items-center space-x-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                <div>
                  <p className="text-xs text-gray-500">Gültig bis</p>
                  <p className={`font-medium ${showWarning ? 'text-orange-600' : 'text-gray-900'}`}>
                    {formatDate(document.expiry_date)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          {document.notes && (
            <div className="pt-2 border-t">
              <p className="text-xs text-gray-500 mb-1">Notizen</p>
              <p className="text-sm text-gray-700">{document.notes}</p>
            </div>
          )}

          {/* File Info */}
          <div className="flex items-center justify-between pt-2 border-t text-xs text-gray-500">
            <span>{formatFileSize(document.file_size)}</span>
            <span>Hochgeladen: {formatDate(document.created_at)}</span>
            {document.is_verified && (
              <Badge variant="outline" className="text-green-600 bg-green-50">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verifiziert
              </Badge>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex justify-between border-t pt-4">
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleView}>
              <Eye className="h-4 w-4 mr-2" />
              Ansehen
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>

          <div className="flex space-x-2">
            {onEdit && (
              <Button variant="outline" size="sm" onClick={() => onEdit(document)}>
                <Edit className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Dokument löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Sind Sie sicher, dass Sie &quot;{document.file_name}&quot; löschen möchten? Diese
              Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Wird gelöscht...' : 'Löschen'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
