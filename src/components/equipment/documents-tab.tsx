"use client";

import { useState } from "react";
import { format } from "date-fns";
import { FileText, Plus, Trash2, Download, Upload, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { useEquipmentDocuments, useUploadEquipmentDocument, useDeleteEquipmentDocument, useExpiringDocuments } from "@/hooks/use-equipment-documents";
import { useEquipment } from "@/hooks/use-equipment";

const DOCUMENT_TYPES = [
  { value: "warranty", label: "Warranty" },
  { value: "manual", label: "Manual" },
  { value: "calibration", label: "Calibration Certificate" },
  { value: "inspection", label: "Inspection Report" },
  { value: "safety", label: "Safety Certificate" },
  { value: "purchase", label: "Purchase Invoice" },
  { value: "other", label: "Other" },
];

export function DocumentsTab() {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [equipmentFilter, setEquipmentFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [expiringFilter, setExpiringFilter] = useState<"all" | "expiring" | "expired">("all");

  const { data: documentsData, isLoading } = useEquipmentDocuments({
    equipment_id: equipmentFilter || undefined,
    document_type: typeFilter || undefined,
    expiring_within_days: expiringFilter === "expiring" ? 60 : undefined,
    expired_only: expiringFilter === "expired" ? true : undefined,
    active_only: true,
  });

  const { data: expiringData } = useExpiringDocuments(30);
  const { data: equipmentData } = useEquipment({ per_page: 1000 });

  const documents = documentsData?.items || [];
  const equipment = equipmentData?.items || [];
  const expiringCount = expiringData?.total || 0;

  const handleClearFilters = () => {
    setEquipmentFilter("");
    setTypeFilter("");
    setExpiringFilter("all");
  };

  return (
    <div className="space-y-4">
      {/* Header with Upload Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Equipment Documents</h2>
          <p className="text-muted-foreground">
            Manage warranties, manuals, calibration certificates, and other documents
          </p>
        </div>
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </DialogTrigger>
          <UploadDocumentDialog
            equipment={equipment}
            onClose={() => setIsUploadDialogOpen(false)}
          />
        </Dialog>
      </div>

      {/* Expiring Documents Alert */}
      {expiringCount > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <span className="font-semibold">{expiringCount} document{expiringCount !== 1 ? 's' : ''}</span> expiring within 30 days.{" "}
            <Button
              variant="link"
              className="h-auto p-0 text-sm"
              onClick={() => setExpiringFilter("expiring")}
            >
              View expiring documents
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Equipment</Label>
              <Select value={equipmentFilter || "all"} onValueChange={(v) => setEquipmentFilter(v === "all" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="All equipment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All equipment</SelectItem>
                  {equipment.map((eq) => (
                    <SelectItem key={eq.id} value={eq.id}>
                      {eq.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Document Type</Label>
              <Select value={typeFilter || "all"} onValueChange={(v) => setTypeFilter(v === "all" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {DOCUMENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Expiry Status</Label>
              <Select value={expiringFilter} onValueChange={(v: any) => setExpiringFilter(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All documents</SelectItem>
                  <SelectItem value="expiring">Expiring soon (60 days)</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={handleClearFilters} className="w-full">
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
          <CardDescription>
            {documents.length} document{documents.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : documents.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document Name</TableHead>
                    <TableHead>Equipment</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((document) => (
                    <DocumentRow key={document.id} document={document} />
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No documents found</h3>
              <p className="text-muted-foreground">
                Upload documents to track warranties, calibrations, and certificates.
              </p>
              <Button className="mt-4" onClick={() => setIsUploadDialogOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Upload First Document
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface DocumentRowProps {
  document: any;
}

function DocumentRow({ document }: DocumentRowProps) {
  const deleteMutation = useDeleteEquipmentDocument();

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${document.document_name}"?`)) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(document.id);
      toast.success("Document deleted successfully");
    } catch (error) {
      toast.error("Failed to delete document");
    }
  };

  const handleDownload = () => {
    // Open signed URL in new tab
    if (document.file_url) {
      window.open(document.file_url, "_blank");
    } else {
      toast.error("Document URL not available");
    }
  };

  const getExpiryBadge = () => {
    if (!document.expiry_date) return null;

    const daysUntilExpiry = document.days_until_expiry;

    if (daysUntilExpiry < 0) {
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Expired
        </Badge>
      );
    }

    if (daysUntilExpiry <= 30) {
      return (
        <Badge className="bg-orange-100 text-orange-800 border-orange-200">
          <Clock className="h-3 w-3 mr-1" />
          Expires in {daysUntilExpiry} days
        </Badge>
      );
    }

    if (daysUntilExpiry <= 60) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
          <Clock className="h-3 w-3 mr-1" />
          Expires in {daysUntilExpiry} days
        </Badge>
      );
    }

    return (
      <Badge className="bg-green-100 text-green-800 border-green-200">
        <CheckCircle className="h-3 w-3 mr-1" />
        Valid
      </Badge>
    );
  };

  const documentType = DOCUMENT_TYPES.find((t) => t.value === document.document_type);

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center space-x-2">
          <FileText className="h-4 w-4 text-blue-600" />
          <div>
            <div className="font-medium">{document.document_name}</div>
            {document.notes && (
              <div className="text-sm text-muted-foreground">{document.notes}</div>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="font-medium">
          {document.equipment_name || "Unknown Equipment"}
        </div>
      </TableCell>
      <TableCell>
        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
          {documentType?.label || document.document_type}
        </Badge>
      </TableCell>
      <TableCell>
        {document.issue_date ? format(new Date(document.issue_date), "MMM dd, yyyy") : "-"}
      </TableCell>
      <TableCell>
        {document.expiry_date ? format(new Date(document.expiry_date), "MMM dd, yyyy") : "-"}
      </TableCell>
      <TableCell>{getExpiryBadge()}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

interface UploadDocumentDialogProps {
  equipment: any[];
  onClose: () => void;
}

function UploadDocumentDialog({ equipment, onClose }: UploadDocumentDialogProps) {
  const [formData, setFormData] = useState({
    equipment_id: "",
    document_type: "",
    document_name: "",
    issue_date: "",
    expiry_date: "",
    notes: "",
  });
  const [file, setFile] = useState<File | null>(null);

  const uploadMutation = useUploadEquipmentDocument();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.equipment_id || !formData.document_type || !formData.document_name || !file) {
      toast.error("Please fill in all required fields and select a file");
      return;
    }

    try {
      await uploadMutation.mutateAsync({
        equipment_id: formData.equipment_id,
        document_type: formData.document_type,
        document_name: formData.document_name,
        file,
        issue_date: formData.issue_date || undefined,
        expiry_date: formData.expiry_date || undefined,
        notes: formData.notes || undefined,
      });

      toast.success("Document uploaded successfully");
      onClose();

      // Reset form
      setFormData({
        equipment_id: "",
        document_type: "",
        document_name: "",
        issue_date: "",
        expiry_date: "",
        notes: "",
      });
      setFile(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to upload document");
    }
  };

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Upload Equipment Document</DialogTitle>
        <DialogDescription>
          Upload warranties, manuals, calibration certificates, and other documents
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Equipment Selection */}
        <div>
          <Label htmlFor="equipment">Equipment *</Label>
          <Select
            value={formData.equipment_id}
            onValueChange={(value) => setFormData({ ...formData, equipment_id: value })}
          >
            <SelectTrigger id="equipment">
              <SelectValue placeholder="Select equipment" />
            </SelectTrigger>
            <SelectContent>
              {equipment.map((eq) => (
                <SelectItem key={eq.id} value={eq.id}>
                  {eq.name} ({eq.inventory_no || "No inventory #"})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Document Type */}
        <div>
          <Label htmlFor="type">Document Type *</Label>
          <Select
            value={formData.document_type}
            onValueChange={(value) => setFormData({ ...formData, document_type: value })}
          >
            <SelectTrigger id="type">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {DOCUMENT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Document Name */}
        <div>
          <Label htmlFor="name">Document Name *</Label>
          <Input
            id="name"
            placeholder="e.g., Annual Calibration Certificate 2024"
            value={formData.document_name}
            onChange={(e) => setFormData({ ...formData, document_name: e.target.value })}
          />
        </div>

        {/* File Upload */}
        <div>
          <Label htmlFor="file">File *</Label>
          <Input
            id="file"
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          />
          <p className="text-sm text-muted-foreground mt-1">
            Supported formats: PDF, DOC, DOCX, JPG, PNG (max 10MB)
          </p>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="issue">Issue Date</Label>
            <Input
              id="issue"
              type="date"
              value={formData.issue_date}
              onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="expiry">Expiry Date</Label>
            <Input
              id="expiry"
              type="date"
              value={formData.expiry_date}
              onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Additional notes..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={uploadMutation.isPending}>
            {uploadMutation.isPending ? "Uploading..." : "Upload Document"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
