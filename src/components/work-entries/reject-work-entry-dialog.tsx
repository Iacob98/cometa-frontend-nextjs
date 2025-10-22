"use client";

import { useState } from "react";
import { X, AlertCircle, Upload, Image as ImageIcon, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";

const rejectFormSchema = z.object({
  rejection_reason: z.string().min(10, "Rejection reason must be at least 10 characters"),
});

type RejectFormValues = z.infer<typeof rejectFormSchema>;

interface RejectWorkEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReject: (rejection_reason: string, photos?: File[]) => void;
  isLoading?: boolean;
}

export function RejectWorkEntryDialog({
  open,
  onOpenChange,
  onReject,
  isLoading,
}: RejectWorkEntryDialogProps) {
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);

  const form = useForm<RejectFormValues>({
    resolver: zodResolver(rejectFormSchema),
    defaultValues: {
      rejection_reason: "",
    },
  });

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📷 [RejectDialog] Photo selection triggered');
    const files = Array.from(e.target.files || []);
    console.log('📷 [RejectDialog] Files selected:', files.length);
    if (files.length === 0) return;

    // Validate file types and size
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        alert(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name} is larger than 10MB`);
        return false;
      }
      return true;
    });

    console.log('📷 [RejectDialog] Valid files after filtering:', validFiles.length);
    if (validFiles.length === 0) return;

    // Create preview URLs
    const newPreviewUrls = validFiles.map((file) => URL.createObjectURL(file));

    setSelectedPhotos((prev) => {
      const updated = [...prev, ...validFiles];
      console.log('📷 [RejectDialog] Updated selectedPhotos count:', updated.length);
      console.log('📷 [RejectDialog] Photo names:', updated.map(p => p.name));
      return updated;
    });
    setPhotoPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
  };

  const handleRemovePhoto = (index: number) => {
    // Revoke the preview URL to free memory
    URL.revokeObjectURL(photoPreviewUrls[index]);

    setSelectedPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (values: RejectFormValues) => {
    // 🔍 DIAGNOSTIC LOGGING: Track photo flow from dialog
    console.log('🚨 [RejectDialog] onSubmit called');
    console.log('🚨 [RejectDialog] selectedPhotos.length:', selectedPhotos.length);
    console.log('🚨 [RejectDialog] selectedPhotos array:', selectedPhotos);
    console.log('🚨 [RejectDialog] Photo names:', selectedPhotos.map(p => p.name));

    const photosToPass = selectedPhotos.length > 0 ? selectedPhotos : undefined;
    console.log('🚨 [RejectDialog] Passing photos to onReject:', photosToPass ? photosToPass.length : 'undefined');

    onReject(values.rejection_reason, photosToPass);

    // 🔍 State cleanup happens AFTER onReject is called (but onReject is async!)
    console.log('🚨 [RejectDialog] Cleaning up dialog state...');
    form.reset();
    setSelectedPhotos([]);
    // Cleanup preview URLs
    photoPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    setPhotoPreviewUrls([]);
    console.log('🚨 [RejectDialog] Dialog state cleaned up');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <X className="h-5 w-5 text-destructive" />
            <span>Reject Work Entry</span>
          </DialogTitle>
          <DialogDescription>
            Please provide a detailed reason for rejecting this work entry. This information will be shared with the worker.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This action will reject the work entry and notify the worker. Please ensure you provide a clear explanation.
              </AlertDescription>
            </Alert>

            <FormField
              control={form.control}
              name="rejection_reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rejection Reason *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe why this work entry is being rejected (e.g., incomplete work, incorrect measurements, missing photos, safety violations...)"
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Photo Upload Section */}
            <div className="space-y-3">
              <FormLabel>Attach Photos (Optional)</FormLabel>
              <p className="text-sm text-muted-foreground">
                Add photos to illustrate the issue (max 5 files, 10MB each)
              </p>

              {/* Photo Upload Button */}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById("rejection-photo-input")?.click()}
                  disabled={isLoading || selectedPhotos.length >= 5}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Select Photos
                </Button>
                <span className="text-sm text-muted-foreground">
                  {selectedPhotos.length}/5 photos
                </span>
              </div>

              <input
                id="rejection-photo-input"
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoSelect}
                className="hidden"
              />

              {/* Photo Preview Grid */}
              {selectedPhotos.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {photoPreviewUrls.map((url, index) => (
                    <Card key={index} className="relative aspect-square overflow-hidden group">
                      <img
                        src={url}
                        alt={`Rejection photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemovePhoto(index)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                        {selectedPhotos[index].name}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  setSelectedPhotos([]);
                  photoPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
                  setPhotoPreviewUrls([]);
                  onOpenChange(false);
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={isLoading}
              >
                {isLoading ? "Rejecting..." : "Reject Work Entry"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
