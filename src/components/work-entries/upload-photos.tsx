"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import type { PhotoLabel } from "@/types";

interface UploadPhotosProps {
  workEntryId: string;
}

interface FileWithLabel {
  file: File;
  label: PhotoLabel;
}

export function UploadPhotos({ workEntryId }: UploadPhotosProps) {
  const [selectedFiles, setSelectedFiles] = useState<FileWithLabel[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const filesWithLabels: FileWithLabel[] = files.map(file => ({
      file,
      label: 'before' as PhotoLabel, // Default label
    }));
    setSelectedFiles(prev => [...prev, ...filesWithLabels].slice(0, 5)); // Max 5 files
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const updateFileLabel = (index: number, label: PhotoLabel) => {
    setSelectedFiles(prev =>
      prev.map((item, i) => i === index ? { ...item, label } : item)
    );
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select at least one photo");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();

      // Add metadata
      formData.append('metadata', JSON.stringify({
        bucketName: 'work-photos',
        workEntryId: workEntryId,
      }));

      // Add files
      selectedFiles.forEach((item, index) => {
        formData.append(`file${index}`, item.file);
      });

      // Upload to Supabase Storage
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json();
        throw new Error(error.error || 'Upload failed');
      }

      const uploadResult = await uploadResponse.json();

      // Save photo metadata to database with labels
      for (let i = 0; i < uploadResult.files.length; i++) {
        const file = uploadResult.files[i];
        const label = selectedFiles[i]?.label || 'other';

        await fetch('/api/photos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            work_entry_id: workEntryId,
            filename: file.fileName,
            file_path: file.path,
            photo_type: 'progress',
            label: label, // Add photo label
          }),
        });
      }

      toast.success(`${uploadResult.successCount} photo(s) uploaded successfully`);
      setSelectedFiles([]);

      // Refresh work entry data
      queryClient.invalidateQueries({ queryKey: ['work-entries', 'detail', workEntryId] });

    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload photos');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Photos</CardTitle>
        <CardDescription>
          Add work progress photos (max 5 files, JPG/PNG, 10MB each)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/jpg"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        {selectedFiles.length > 0 && (
          <div className="space-y-3">
            {selectedFiles.map((item, index) => (
              <div
                key={index}
                className="flex flex-col gap-3 p-3 border rounded-lg bg-card"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-muted rounded flex items-center justify-center flex-shrink-0">
                      <Upload className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(item.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    disabled={uploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Photo Label Selection */}
                <div className="flex items-center gap-2">
                  <Label htmlFor={`label-${index}`} className="flex items-center gap-1.5 text-sm whitespace-nowrap">
                    <Tag className="h-3.5 w-3.5" />
                    Label:
                  </Label>
                  <Select
                    value={item.label}
                    onValueChange={(value) => updateFileLabel(index, value as PhotoLabel)}
                    disabled={uploading}
                  >
                    <SelectTrigger id={`label-${index}`} className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="before">Before Work</SelectItem>
                      <SelectItem value="during">During Work</SelectItem>
                      <SelectItem value="after">After Work</SelectItem>
                      <SelectItem value="instrument">Equipment Reading</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || selectedFiles.length >= 5}
          >
            <Upload className="h-4 w-4 mr-2" />
            Select Photos
          </Button>

          {selectedFiles.length > 0 && (
            <Button
              type="button"
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload {selectedFiles.length} Photo(s)
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
