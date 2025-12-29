/**
 * VehicleDocumentUpload Component
 * Handles file upload for vehicle documents with drag & drop support
 */

'use client';

import { useState, useCallback } from 'react';
import { Upload, X, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  useUploadVehicleDocuments,
  type VehicleDocumentType,
  getDocumentTypeLabel,
  requiresExpiryDate,
  formatFileSize,
} from '@/hooks/use-vehicle-documents';

// ==============================================================================
// Types
// ==============================================================================

interface VehicleDocumentUploadProps {
  vehicleId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface SelectedFile extends File {
  id: string;
  preview?: string;
}

// ==============================================================================
// Component
// ==============================================================================

export function VehicleDocumentUpload({
  vehicleId,
  onSuccess,
  onCancel,
}: VehicleDocumentUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [documentType, setDocumentType] = useState<VehicleDocumentType>('sonstiges');
  const [documentNumber, setDocumentNumber] = useState('');
  const [issuingAuthority, setIssuingAuthority] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadMutation = useUploadVehicleDocuments();

  // File validation
  const validateFile = (file: File): string | null => {
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ];

    if (file.size > maxSize) {
      return `Файл ${file.name} превышает максимальный размер 50МБ`;
    }

    if (!allowedTypes.includes(file.type)) {
      return `Файл ${file.name} имеет недопустимый тип. Разрешены только PDF и изображения.`;
    }

    return null;
  };

  // Handle file selection
  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    setError(null);
    const newFiles: SelectedFile[] = [];

    Array.from(files).forEach((file) => {
      const validationError = validateFile(file);

      if (validationError) {
        setError(validationError);
        return;
      }

      const fileWithId = Object.assign(file, {
        id: `${Date.now()}-${file.name}`,
      });

      newFiles.push(fileWithId);
    });

    if (newFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...newFiles]);
    }
  }, []);

  // Handle drag & drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFileSelect(e.dataTransfer.files);
      }
    },
    [handleFileSelect]
  );

  // Remove file from selection
  const removeFile = (fileId: string) => {
    setSelectedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedFiles.length === 0) {
      setError('Пожалуйста, выберите хотя бы один файл');
      return;
    }

    // Validate expiry date for required document types
    if (requiresExpiryDate(documentType) && !expiryDate) {
      setError(`Срок действия обязателен для ${getDocumentTypeLabel(documentType)}`);
      return;
    }

    try {
      await uploadMutation.mutateAsync({
        vehicleId,
        documentType,
        files: selectedFiles,
        documentNumber: documentNumber || undefined,
        issuingAuthority: issuingAuthority || undefined,
        issueDate: issueDate || undefined,
        expiryDate: expiryDate || undefined,
        notes: notes || undefined,
      });

      // Reset form
      setSelectedFiles([]);
      setDocumentNumber('');
      setIssuingAuthority('');
      setIssueDate('');
      setExpiryDate('');
      setNotes('');
      setError(null);

      onSuccess?.();
    } catch (err) {
      // Error is handled by the mutation hook
      console.error('Upload error:', err);
    }
  };

  const requiresExpiry = requiresExpiryDate(documentType);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Document Type Selection */}
      <div className="space-y-2">
        <Label htmlFor="documentType">Тип документа *</Label>
        <Select
          value={documentType}
          onValueChange={(value) => setDocumentType(value as VehicleDocumentType)}
        >
          <SelectTrigger id="documentType">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fahrzeugschein">
              {getDocumentTypeLabel('fahrzeugschein')}
            </SelectItem>
            <SelectItem value="fahrzeugbrief">
              {getDocumentTypeLabel('fahrzeugbrief')}
            </SelectItem>
            <SelectItem value="tuv">{getDocumentTypeLabel('tuv')}</SelectItem>
            <SelectItem value="versicherung">{getDocumentTypeLabel('versicherung')}</SelectItem>
            <SelectItem value="au">{getDocumentTypeLabel('au')}</SelectItem>
            <SelectItem value="wartung">{getDocumentTypeLabel('wartung')}</SelectItem>
            <SelectItem value="sonstiges">{getDocumentTypeLabel('sonstiges')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* File Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
          onChange={(e) => handleFileSelect(e.target.files)}
        />

        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <Label htmlFor="file-upload" className="cursor-pointer">
          <span className="text-blue-600 hover:text-blue-700 font-medium">
            Выберите файлы
          </span>
          <span className="text-gray-600"> или перетащите сюда</span>
        </Label>
        <p className="text-xs text-gray-500 mt-2">
          PDF или изображения (макс. 50МБ на файл)
        </p>
      </div>

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <Label>Выбранные файлы ({selectedFiles.length})</Label>
          <div className="space-y-2">
            {selectedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file.id)}
                  className="flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Document Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="documentNumber">Номер документа</Label>
          <Input
            id="documentNumber"
            value={documentNumber}
            onChange={(e) => setDocumentNumber(e.target.value)}
            placeholder="напр. номер страховки"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="issuingAuthority">Орган выдачи</Label>
          <Input
            id="issuingAuthority"
            value={issuingAuthority}
            onChange={(e) => setIssuingAuthority(e.target.value)}
            placeholder="напр. ГИБДД"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="issueDate">Дата выдачи</Label>
          <Input
            id="issueDate"
            type="date"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="expiryDate">
            Срок действия {requiresExpiry && <span className="text-red-500">*</span>}
          </Label>
          <Input
            id="expiryDate"
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            required={requiresExpiry}
          />
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Примечания</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Дополнительная информация..."
          rows={3}
        />
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Отмена
          </Button>
        )}
        <Button type="submit" disabled={uploadMutation.isPending || selectedFiles.length === 0}>
          {uploadMutation.isPending ? 'Загрузка...' : 'Загрузить'}
        </Button>
      </div>
    </form>
  );
}
