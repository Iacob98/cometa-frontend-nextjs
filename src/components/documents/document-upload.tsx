"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useQuery } from "@tanstack/react-query";
import { Upload, X, FileText, Image, FileIcon, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import {
  useUploadDocument,
  useDocumentCategories,
  useClassifyDocument,
} from "@/hooks/use-documents";
import { cn } from "@/lib/utils";
import type {
  CreateDocumentRequest,
  DocumentCategoryCode,
  DocumentAccessLevel,
} from "@/types";

interface DocumentUploadProps {
  projectId?: string;
  houseId?: string;
  workEntryId?: string;
  teamId?: string;
  userId?: string;
  onUploadComplete?: (document: any) => void;
  maxFiles?: number;
  acceptedFileTypes?: string[];
  maxFileSize?: number; // in bytes
}

interface FileWithPreview {
  file: File; // Original File object
  preview?: string;
  category?: DocumentCategoryCode;
  tags?: string[];
  description?: string;
  accessLevel?: DocumentAccessLevel;
  documentNumber?: string;
  issuingAuthority?: string;
  issueDate?: string;
  expiryDate?: string;
  // File properties for compatibility
  name: string;
  size: number;
  type: string;
}

const getFileIcon = (fileType: string | undefined) => {
  if (!fileType) return FileIcon;
  if (fileType.startsWith("image/")) return Image;
  if (fileType.includes("pdf") || fileType.includes("document")) return FileText;
  return FileIcon;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export function DocumentUpload({
  projectId,
  houseId,
  workEntryId,
  teamId,
  userId,
  onUploadComplete,
  maxFiles = 10,
  acceptedFileTypes = [
    "image/*",
    "application/pdf",
    "application/msword", // .doc files
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx files
    "application/vnd.ms-excel", // .xls files
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx files
    ".doc",
    ".docx",
    ".xls",
    ".xlsx"
  ],
  maxFileSize = 50 * 1024 * 1024, // 50MB
}: DocumentUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const uploadDocument = useUploadDocument();

  // Custom upload function for user documents
  const uploadUserDocument = async (file: FileWithPreview, userId: string) => {
    console.log('Starting upload for:', file.name, 'to user:', userId, 'category:', file.category);

    if (!file.category) {
      throw new Error('Please select a document category before uploading');
    }

    // Use the original file object from our wrapper
    const formData = new FormData();
    formData.append('file', file.file); // Use the original File object
    formData.append('category_id', file.category || '');
    formData.append('title', file.name || file.file.name); // Required field - use file name as default title
    formData.append('document_number', file.documentNumber || '');
    formData.append('issuing_authority', file.issuingAuthority || '');
    formData.append('issue_date', file.issueDate || '');
    formData.append('expiry_date', file.expiryDate || '');
    formData.append('description', file.description || ''); // Changed from 'notes' to 'description' to match API

    console.log('FormData prepared:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      categoryId: file.category,
      notes: file.description || ''
    });

    console.log('FormData entries:');
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: File(name="${value.name}", size=${value.size}, type="${value.type}")`);
      } else {
        console.log(`  ${key}: "${value}"`);
      }
    }

    const response = await fetch(`/api/users/${userId}/documents`, {
      method: 'POST',
      body: formData,
    });

    console.log('Response status:', response.status, response.statusText);

    if (!response.ok) {
      let errorMessage = 'Failed to upload document';
      try {
        const errorText = await response.text();
        console.log('Error response text:', errorText);
        if (errorText && errorText.trim()) {
          try {
            const error = JSON.parse(errorText);
            errorMessage = error.error || error.message || errorMessage;
          } catch (parseError) {
            // If JSON parsing fails, use the raw text as error message
            errorMessage = errorText;
          }
        }
      } catch (e) {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      console.error('Upload error:', errorMessage);
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('Upload successful:', result);
    return result;
  };
  // Custom hook to fetch document categories
  const { data: userDocumentsData } = useQuery({
    queryKey: ['user-documents-categories', userId],
    queryFn: async () => {
      if (!userId) return { categories: [] };
      const response = await fetch(`/api/users/${userId}/documents`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    },
    enabled: !!userId,
  });

  const categories = userDocumentsData?.categories?.all || [];
  const classifyDocument = useClassifyDocument();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      console.log('📁 Файлы выбраны:', acceptedFiles.map(f => ({
        name: f.name,
        size: f.size,
        type: f.type
      })));

      if (files.length + acceptedFiles.length > maxFiles) {
        toast.error(`Maximum ${maxFiles} files allowed`);
        return;
      }

      const newFiles: FileWithPreview[] = acceptedFiles.map((file) => {
        console.log('🔧 Обрабатываю файл:', {
          name: file.name,
          size: file.size,
          type: file.type,
          constructor: file.constructor.name
        });

        // Create preview for images
        const preview = file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : undefined;

        // Create a wrapper object that preserves the original File object
        const enhancedFile: FileWithPreview = {
          file, // Store the original File object
          preview,
          category: undefined,
          tags: [],
          description: "",
          accessLevel: "project",
          documentNumber: "",
          issuingAuthority: "",
          issueDate: "",
          expiryDate: "",
          // Copy File properties for compatibility
          name: file.name,
          size: file.size,
          type: file.type
        };

        console.log('✅ Файл обработан:', {
          name: enhancedFile.name,
          size: enhancedFile.size,
          type: enhancedFile.type,
          hasPreview: !!enhancedFile.preview,
          originalFile: enhancedFile.file,
          hasArrayBuffer: typeof enhancedFile.file.arrayBuffer === 'function',
          hasStream: typeof enhancedFile.file.stream === 'function'
        });

        return enhancedFile;
      });

      console.log('📋 Добавляю файлы в состояние:', newFiles.length);
      setFiles((prev) => [...prev, ...newFiles]);

      // Auto-classify documents
      for (const file of newFiles) {
        try {
          const result = await classifyDocument.mutateAsync(file.file);

          setFiles((prev) =>
            prev.map((f) =>
              f.name === file.name && f.size === file.size
                ? {
                    ...f,
                    category: result.category_code as DocumentCategoryCode,
                    tags: [], // No tags returned from this hook
                  }
                : f
            )
          );
        } catch (error) {
          console.error("Classification failed for", file.name, error);
        }
      }
    },
    [files.length, maxFiles, classifyDocument]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    maxSize: maxFileSize,
    multiple: true,
  });

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const file = prev[index];
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const updateFileMetadata = (
    index: number,
    field: keyof FileWithPreview,
    value: any
  ) => {
    setFiles((prev) =>
      prev.map((file, i) =>
        i === index ? { ...file, [field]: value } : file
      )
    );
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error("Пожалуйста, выберите файл для загрузки");
      return;
    }
    if (!userId) {
      toast.error("User ID is required for uploading documents");
      return;
    }

    // Check if all files have categories
    const filesWithoutCategory = files.filter(file => !file.category);
    if (filesWithoutCategory.length > 0) {
      toast.error("Пожалуйста, выберите категорию для всех файлов");
      return;
    }

    console.log('📤 Начинаем загрузку файлов:', files.map((f, i) => ({
      name: f.name || `file-${i}`,
      size: f.size,
      type: f.type,
      category: f.category
    })));

    setUploading(true);

    for (const [index, file] of files.entries()) {
      // Store original filename before it gets corrupted
      const originalFileName = file.name || `file-${index}`;

      try {
        setUploadProgress((prev) => ({ ...prev, [originalFileName]: 0 }));

        // Simulate progress (in real implementation, this would come from upload progress)
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => ({
            ...prev,
            [originalFileName]: Math.min(prev[originalFileName] + 10, 90),
          }));
        }, 100);

        const document = await uploadUserDocument(file, userId);

        clearInterval(progressInterval);
        setUploadProgress((prev) => ({ ...prev, [originalFileName]: 100 }));

        onUploadComplete?.(document);
      } catch (error) {
        console.error("Upload failed for", originalFileName, error);
        setUploadProgress((prev) => ({ ...prev, [originalFileName]: -1 }));
      }
    }

    setUploading(false);
    setFiles([]);
    setUploadProgress({});
  };

  return (
    <div className="w-full space-y-3">
        {/* Drop Zone */}
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors",
            isDragActive
              ? "border-primary bg-primary/10"
              : "border-muted-foreground/25 hover:border-primary/50"
          )}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
          {isDragActive ? (
            <p className="text-primary text-sm">Drop the files here...</p>
          ) : (
            <div>
              <p className="text-muted-foreground mb-1 text-sm">
                Drag and drop files here, or click to select files
              </p>
              <p className="text-xs text-muted-foreground">
                Supported: PDF, Images, Office docs
              </p>
            </div>
          )}
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
            <h4 className="font-medium text-sm sticky top-0 bg-background py-1">Files to Upload ({files.length})</h4>
            {files.map((file, index) => {
              const FileIconComponent = getFileIcon(file.type);
              const progress = uploadProgress[file.name] || 0;
              const isError = progress === -1;

              return (
                <Card key={`${file.name}-${file.size}`} className="p-2">
                  <div className="flex items-start gap-3">
                    {/* File Icon/Preview */}
                    <div className="flex-shrink-0">
                      {file.preview ? (
                        <img
                          src={file.preview}
                          alt={file.name}
                          className="w-12 h-12 object-cover rounded"
                          onLoad={() => URL.revokeObjectURL(file.preview!)}
                        />
                      ) : (
                        <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                          <FileIconComponent className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* File Details */}
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate text-xs">
                            {file.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          disabled={uploading}
                          className="h-6 w-6 p-0"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>

                      {/* Metadata Form */}
                      <div className="grid grid-cols-2 gap-1.5">
                        <div>
                          <Label htmlFor={`category-${index}`} className="text-xs">Category</Label>
                          <Select
                            value={file.category || ""}
                            onValueChange={(value) =>
                              updateFileMetadata(index, "category", value)
                            }
                            disabled={uploading}
                          >
                            <SelectTrigger className="h-7 text-xs">
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                            <SelectContent>
                              {categories?.map((category: any) => (
                                <SelectItem key={category.id} value={category.id} className="text-xs">
                                  {category.name_en || category.name_ru || category.code}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor={`access-${index}`} className="text-xs">Access</Label>
                          <Select
                            value={file.accessLevel || "project"}
                            onValueChange={(value) =>
                              updateFileMetadata(index, "accessLevel", value)
                            }
                            disabled={uploading}
                          >
                            <SelectTrigger className="h-7 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="public" className="text-xs">Public</SelectItem>
                              <SelectItem value="project" className="text-xs">Project</SelectItem>
                              <SelectItem value="team" className="text-xs">Team</SelectItem>
                              <SelectItem value="private" className="text-xs">Private</SelectItem>
                              <SelectItem value="admin" className="text-xs">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor={`document-number-${index}`} className="text-xs">Doc # <span className="text-muted-foreground">(Opt)</span></Label>
                          <Input
                            id={`document-number-${index}`}
                            placeholder="Number..."
                            value={file.documentNumber || ""}
                            onChange={(e) =>
                              updateFileMetadata(index, "documentNumber", e.target.value)
                            }
                            disabled={uploading}
                            className="h-7 text-xs"
                          />
                        </div>

                        <div>
                          <Label htmlFor={`issuing-authority-${index}`} className="text-xs">Authority <span className="text-muted-foreground">(Opt)</span></Label>
                          <Input
                            id={`issuing-authority-${index}`}
                            placeholder="Authority..."
                            value={file.issuingAuthority || ""}
                            onChange={(e) =>
                              updateFileMetadata(index, "issuingAuthority", e.target.value)
                            }
                            disabled={uploading}
                            className="h-7 text-xs"
                          />
                        </div>

                        <div>
                          <Label htmlFor={`issue-date-${index}`} className="text-xs">Issue <span className="text-muted-foreground">(Opt)</span></Label>
                          <Input
                            id={`issue-date-${index}`}
                            type="date"
                            value={file.issueDate || ""}
                            onChange={(e) =>
                              updateFileMetadata(index, "issueDate", e.target.value)
                            }
                            disabled={uploading}
                            className="h-7 text-xs"
                          />
                        </div>

                        <div>
                          <Label htmlFor={`expiry-date-${index}`} className="text-xs">Expiry <span className="text-muted-foreground">(Opt)</span></Label>
                          <Input
                            id={`expiry-date-${index}`}
                            type="date"
                            value={file.expiryDate || ""}
                            onChange={(e) =>
                              updateFileMetadata(index, "expiryDate", e.target.value)
                            }
                            disabled={uploading}
                            className="h-7 text-xs"
                          />
                        </div>
                      </div>

                      <div className="col-span-2">
                        <Label htmlFor={`description-${index}`} className="text-xs">Description</Label>
                        <Textarea
                          id={`description-${index}`}
                          placeholder="Optional..."
                          value={file.description || ""}
                          onChange={(e) =>
                            updateFileMetadata(index, "description", e.target.value)
                          }
                          disabled={uploading}
                          rows={1}
                          className="text-xs resize-none h-7"
                        />
                      </div>

                      {/* Tags */}
                      {file.tags && file.tags.length > 0 && (
                        <div>
                          <Label>Suggested Tags</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {file.tags.map((tag, tagIndex) => (
                              <Badge key={tagIndex} variant="secondary">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Upload Progress */}
                      {uploading && progress >= 0 && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span>Uploading...</span>
                            <span>{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      )}

                      {/* Error State */}
                      {isError && (
                        <div className="flex items-center gap-2 text-destructive text-sm">
                          <AlertCircle className="w-4 h-4" />
                          <span>Upload failed</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}

            {/* Upload Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleUpload}
                disabled={uploading || files.length === 0}
                className="min-w-32"
              >
                {uploading ? "Uploading..." : `Upload ${files.length} Files`}
              </Button>
            </div>
          </div>
        )}
    </div>
  );
}