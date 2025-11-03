'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, Eye, Download, X, AlertCircle } from 'lucide-react';
import { useCabinetPlan, useUploadCabinetPlan, useDeleteCabinetPlan } from '@/hooks/use-cabinet-plan';
import { toast } from 'sonner';

interface NVTInstallationPlanProps {
  cabinetId: string;
  cabinetCode?: string;
  cabinetName?: string;
}

const PLAN_TYPES = [
  { value: 'verlegeplan', label: 'Verlegeplan', color: 'bg-green-100 text-green-800' },
  { value: 'fremdleitungsplan', label: 'Fremdleitungsplan', color: 'bg-purple-100 text-purple-800' },
  { value: 'verkehrsanordnung', label: 'Verkehrsanordnung (VAO)', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'nvt_standortsicherung', label: 'NVT Standortsicherung', color: 'bg-blue-100 text-blue-800' },
  { value: 'hausanschluss_liste', label: 'Hausanschluss-Liste', color: 'bg-orange-100 text-orange-800' },
  { value: 'technische_details', label: 'Technische Details', color: 'bg-red-100 text-red-800' },
  { value: 'andere', label: 'Andere', color: 'bg-gray-100 text-gray-800' },
];

export default function NVTInstallationPlan({ cabinetId, cabinetCode, cabinetName }: NVTInstallationPlanProps) {
  const { data, isLoading } = useCabinetPlan(cabinetId);
  const uploadMutation = useUploadCabinetPlan();
  const deleteMutation = useDeleteCabinetPlan();

  const [showUploadForm, setShowUploadForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    plan_type: '',
    files: [] as File[],
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    if (newFiles.length === 0) return;

    // Validate file sizes (max 50MB each)
    const maxSize = 50 * 1024 * 1024; // 50MB
    const validFiles = newFiles.filter(file => {
      if (file.size > maxSize) {
        toast.error(`File "${file.name}" is too large. Maximum size is 50MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      // ADD new files to existing files instead of replacing
      setFormData(prev => ({ ...prev, files: [...prev.files, ...validFiles] }));
    }

    // Reset input to allow selecting the same file again
    e.target.value = '';
  };

  const handleRemoveFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.plan_type || formData.files.length === 0) {
      toast.error('Please fill in all required fields and select at least one file');
      return;
    }

    try {
      let successCount = 0;
      let failCount = 0;

      // Upload each file separately
      for (const file of formData.files) {
        try {
          await uploadMutation.mutateAsync({
            cabinetId,
            title: `${formData.title}${formData.files.length > 1 ? ` - ${file.name}` : ''}`,
            description: formData.description,
            planType: formData.plan_type,
            file: file,
          });
          successCount++;
        } catch (error) {
          console.error('File upload error:', error);
          failCount++;
        }
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        plan_type: '',
        files: [],
      });
      setShowUploadForm(false);

      // Show appropriate success/error message
      if (failCount === 0) {
        toast.success(`${successCount} file(s) uploaded successfully`);
      } else if (successCount > 0) {
        toast.warning(`${successCount} file(s) uploaded, ${failCount} failed`);
      } else {
        toast.error('All file uploads failed');
      }
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const handleDelete = async () => {
    if (!data?.plan) return;

    if (confirm(`Are you sure you want to delete the installation plan "${data.plan.title}"?`)) {
      try {
        await deleteMutation.mutateAsync(cabinetId);
      } catch (error) {
        // Error handling is done in the mutation
      }
    }
  };

  const getPlanTypeInfo = (planType: string) => {
    return PLAN_TYPES.find(p => p.value === planType) || {
      label: planType,
      color: 'bg-gray-100 text-gray-800'
    };
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return <div>Loading installation plan...</div>;
  }

  const cabinetLabel = cabinetCode || cabinetName || 'NVT Point';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Installation Plans for {cabinetLabel}
            </CardTitle>
            <CardDescription>
              Upload and manage installation plan documents for this NVT point
            </CardDescription>
          </div>
          <Button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {data?.plan ? 'Upload More Plans' : 'Upload Plan'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Upload Form */}
        {showUploadForm && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="plan-title">Plan Title *</Label>
                  <Input
                    id="plan-title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Installation plan for..."
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="plan-type">Plan Type *</Label>
                  <Select
                    value={formData.plan_type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, plan_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select plan type" />
                    </SelectTrigger>
                    <SelectContent>
                      {PLAN_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="plan-description">Description</Label>
                <Textarea
                  id="plan-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the installation plan..."
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="plan-file">Files *</Label>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <label htmlFor="plan-file-input" className="cursor-pointer">
                      <div className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm font-medium">
                        <Upload className="w-4 h-4" />
                        <span>Add Files</span>
                      </div>
                    </label>
                    <Input
                      id="plan-file-input"
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png,.gif,.dwg,.dxf"
                      className="hidden"
                      multiple
                    />
                    <span className="text-sm text-gray-500">
                      Click "Add Files" to select one or more files
                    </span>
                  </div>

                  {formData.files.length > 0 && (
                    <div className="space-y-2">
                      {formData.files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between gap-2 p-2 bg-green-50 border border-green-200 rounded">
                          <div className="flex items-center gap-2 text-sm text-green-700">
                            <FileText className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{file.name} ({formatFileSize(file.size)})</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFile(index)}
                          >
                            <X className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                      <p className="text-xs text-green-600 font-medium">
                        {formData.files.length} file(s) selected - You can add more files
                      </p>
                    </div>
                  )}
                  <p className="text-sm text-gray-500">
                    Supported formats: PDF, Images (JPG, PNG, GIF), CAD files (DWG, DXF)
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={uploadMutation.isPending}>
                  <Upload className="w-4 h-4 mr-2" />
                  {uploadMutation.isPending ? 'Uploading...' : 'Upload Plan'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowUploadForm(false);
                    setFormData({ title: '', description: '', plan_type: '', files: [] });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Display Existing Plan */}
        {data?.plan ? (
          <div className="space-y-4">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Badge className={getPlanTypeInfo(data.plan.plan_type).color}>
                      {getPlanTypeInfo(data.plan.plan_type).label}
                    </Badge>
                    <h4 className="font-semibold mt-2 mb-1">{data.plan.title}</h4>
                    {data.plan.description && (
                      <p className="text-sm text-gray-600 mb-2">{data.plan.description}</p>
                    )}
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>File: {data.plan.filename}</p>
                      <p>Size: {formatFileSize(data.plan.file_size)}</p>
                      <p>Uploaded: {new Date(data.plan.uploaded_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      title="View"
                      onClick={() => window.open(data.plan!.file_url, '_blank')}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      title="Download"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = data.plan!.file_url;
                        link.download = data.plan!.filename;
                        link.target = '_blank';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      title="Delete"
                      onClick={handleDelete}
                      disabled={deleteMutation.isPending}
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : !showUploadForm ? (
          <div className="text-center py-8">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Installation Plan</h3>
            <p className="text-gray-600 mb-4">
              Upload an installation plan document for this NVT point to help guide the installation process.
            </p>
            <Button onClick={() => setShowUploadForm(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Installation Plan
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
