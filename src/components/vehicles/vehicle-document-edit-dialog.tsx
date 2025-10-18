/**
 * VehicleDocumentEditDialog Component
 * Dialog for editing vehicle document metadata
 */

'use client';

import { useState, useEffect } from 'react';
import { Calendar, Hash, Building, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useUpdateVehicleDocument,
  type VehicleDocument,
  type VehicleDocumentType,
  getDocumentTypeLabel,
} from '@/hooks/use-vehicle-documents';

// ==============================================================================
// Types
// ==============================================================================

interface VehicleDocumentEditDialogProps {
  document: VehicleDocument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

// ==============================================================================
// Component
// ==============================================================================

export function VehicleDocumentEditDialog({
  document,
  open,
  onOpenChange,
  onSuccess,
}: VehicleDocumentEditDialogProps) {
  const updateMutation = useUpdateVehicleDocument();

  const [documentType, setDocumentType] = useState<VehicleDocumentType>('sonstiges');
  const [documentNumber, setDocumentNumber] = useState('');
  const [issuingAuthority, setIssuingAuthority] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  // Initialize form with document data
  useEffect(() => {
    if (document) {
      setDocumentType(document.document_type);
      setDocumentNumber(document.document_number || '');
      setIssuingAuthority(document.issuing_authority || '');
      setIssueDate(document.issue_date || '');
      setExpiryDate(document.expiry_date || '');
      setNotes(document.notes || '');
      setIsVerified(document.is_verified || false);
    }
  }, [document]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!document) return;

    try {
      await updateMutation.mutateAsync({
        vehicleId: document.vehicle_id,
        documentId: document.id,
        updates: {
          document_number: documentNumber || null,
          issuing_authority: issuingAuthority || null,
          issue_date: issueDate || null,
          expiry_date: expiryDate || null,
          notes: notes || null,
          is_verified: isVerified,
        },
      });

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating document:', error);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Dokument bearbeiten</span>
          </DialogTitle>
          <DialogDescription>
            Aktualisieren Sie die Metadaten für {document.file_name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Document Type (read-only display) */}
          <div className="space-y-2">
            <Label>Dokumenttyp</Label>
            <Input
              value={getDocumentTypeLabel(documentType)}
              disabled
              className="bg-gray-50"
            />
          </div>

          {/* Document Number */}
          <div className="space-y-2">
            <Label htmlFor="documentNumber" className="flex items-center space-x-2">
              <Hash className="h-4 w-4" />
              <span>Dokumentnummer</span>
            </Label>
            <Input
              id="documentNumber"
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              placeholder="z.B. TUV-2025-001"
            />
          </div>

          {/* Issuing Authority */}
          <div className="space-y-2">
            <Label htmlFor="issuingAuthority" className="flex items-center space-x-2">
              <Building className="h-4 w-4" />
              <span>Ausstellende Behörde</span>
            </Label>
            <Input
              id="issuingAuthority"
              value={issuingAuthority}
              onChange={(e) => setIssuingAuthority(e.target.value)}
              placeholder="z.B. TÜV Berlin, Allianz Versicherung"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="issueDate" className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Ausstellungsdatum</span>
              </Label>
              <Input
                id="issueDate"
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiryDate" className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Ablaufdatum</span>
              </Label>
              <Input
                id="expiryDate"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notizen</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Zusätzliche Informationen oder Anmerkungen..."
              rows={3}
            />
          </div>

          {/* Verification Status */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isVerified"
              checked={isVerified}
              onCheckedChange={(checked) => setIsVerified(checked as boolean)}
            />
            <Label
              htmlFor="isVerified"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Dokument als verifiziert markieren
            </Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={updateMutation.isPending}
            >
              Abbrechen
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Wird gespeichert...' : 'Speichern'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
