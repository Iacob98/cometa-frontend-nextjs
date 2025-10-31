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
import { useHousePlan, useUploadHousePlan, useDeleteHousePlan } from '@/hooks/use-house-plan';
import { toast } from 'sonner';

interface HouseConnectionPlanProps {
  houseId: string;
  houseNumber?: string;
  address?: string;
}

const PLAN_TYPES = [
  { value: 'connection_plan', label: 'Connection Plan', color: 'bg-green-100 text-green-800' },
  { value: 'wiring_diagram', label: 'Wiring Diagram', color: 'bg-red-100 text-red-800' },
  { value: 'technical_drawing', label: 'Technical Drawing', color: 'bg-blue-100 text-blue-800' },
  { value: 'installation_guide', label: 'Installation Guide', color: 'bg-purple-100 text-purple-800' },
  { value: 'as_built', label: 'As-Built Drawing', color: 'bg-orange-100 text-orange-800' },
  { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-800' },
];

export default function HouseConnectionPlan({ houseId, houseNumber, address }: HouseConnectionPlanProps) {
  const { data, isLoading } = useHousePlan(houseId);
  const uploadMutation = useUploadHousePlan();
  const deleteMutation = useDeleteHousePlan();

  const [showUploadForm, setShowUploadForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    plan_type: '',
    file: null as File | null,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      toast.error('File size must be less than 50MB');
      e.target.value = '';
      return;
    }

    setFormData(prev => ({ ...prev, file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.plan_type || !formData.file) {
      toast.error('Please fill in all required fields and select a file');
      return;
    }

    try {
      await uploadMutation.mutateAsync({
        houseId,
        title: formData.title,
        description: formData.description,
        planType: formData.plan_type,
        file: formData.file,
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        plan_type: '',
        file: null,
      });
      setShowUploadForm(false);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const handleDelete = async () => {
    if (!data?.plan) return;

    if (confirm(`Are you sure you want to delete the connection plan "${data.plan.title}"?`)) {
      try {
        await deleteMutation.mutateAsync(houseId);
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
    return <div>Loading connection plan...</div>;
  }

  const houseLabel = address || houseNumber || 'House';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Connection Plan for {houseLabel}
            </CardTitle>
            <CardDescription>
              Upload and manage the connection plan document for this house
            </CardDescription>
          </div>
          {!data?.plan && (
            <Button
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Plan
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Upload Form */}
        {showUploadForm && !data?.plan && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="plan-title">Plan Title *</Label>
                  <Input
                    id="plan-title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Connection plan for..."
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
                  placeholder="Brief description of the connection plan..."
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="plan-file">File *</Label>
                <Input
                  id="plan-file"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.dwg,.dxf"
                  required
                />
                {formData.file && (
                  <p className="text-sm text-green-600 mt-2">
                    Selected: {formData.file.name} ({formatFileSize(formData.file.size)})
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  Supported formats: PDF, Images (JPG, PNG, GIF), CAD files (DWG, DXF)
                </p>
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
                    setFormData({ title: '', description: '', plan_type: '', file: null });
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
            <h3 className="text-lg font-medium mb-2">No Connection Plan</h3>
            <p className="text-gray-600 mb-4">
              Upload a connection plan document for this house to help guide the fiber optic installation process.
            </p>
            <Button onClick={() => setShowUploadForm(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Connection Plan
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
