'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, User, Building, Plus, Edit, Trash2, FileText, Upload, Download, Eye, X } from 'lucide-react';
import {
  useUtilityContacts,
  useCreateUtilityContact,
  useUpdateUtilityContact,
  useDeleteUtilityContact,
  useProjectPlans,
  useCreateProjectPlan,
  useDeleteProjectPlan,
  type ProjectPlan
} from '@/hooks/use-project-preparation';
import { toast } from 'sonner';

interface UtilityContactsProps {
  projectId: string;
}

const UTILITY_KINDS = [
  { value: 'power', label: 'Strom', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'water', label: 'Wasser', color: 'bg-blue-100 text-blue-800' },
  { value: 'gas', label: 'Gas', color: 'bg-red-100 text-red-800' },
  { value: 'telecom', label: 'Internet', color: 'bg-purple-100 text-purple-800' },
  { value: 'road', label: 'Straße', color: 'bg-gray-100 text-gray-800' },
  { value: 'municipality', label: 'Gemeinde', color: 'bg-green-100 text-green-800' },
  { value: 'emergency', label: 'Notfall', color: 'bg-red-100 text-red-800' },
  { value: 'other', label: 'Andere', color: 'bg-slate-100 text-slate-800' },
];

const PLAN_TYPES = [
  { value: 'lageplan_gesamtprojekt', label: 'Lageplan Gesamtprojekt', color: 'bg-blue-100 text-blue-800' },
  { value: 'gesamt_verlegeplan', label: 'Gesamt-Verlegeplan', color: 'bg-green-100 text-green-800' },
  { value: 'gesamt_fremdleitungsplan', label: 'Gesamt-Fremdleitungsplan', color: 'bg-purple-100 text-purple-800' },
  { value: 'gesamt_verkehrsfuehrung', label: 'Gesamt-Verkehrsführung (VAO Gesamt)', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'grabungs_oberflaechenplan', label: 'Grabungs- & Oberflächenplan', color: 'bg-orange-100 text-orange-800' },
  { value: 'fotodokumentation', label: 'Fotodokumentation', color: 'bg-pink-100 text-pink-800' },
  { value: 'genehmigungen', label: 'Genehmigungen', color: 'bg-cyan-100 text-cyan-800' },
  { value: 'technische_details', label: 'Technische Details', color: 'bg-red-100 text-red-800' },
  { value: 'andere', label: 'Andere', color: 'bg-gray-100 text-gray-800' },
];

export default function UtilityContacts({ projectId }: UtilityContactsProps) {
  const { data: contacts, isLoading } = useUtilityContacts(projectId);
  const createContactMutation = useCreateUtilityContact();
  const updateContactMutation = useUpdateUtilityContact();
  const deleteContactMutation = useDeleteUtilityContact();

  // Plans data and mutations
  const { data: plans, isLoading: plansLoading } = useProjectPlans(projectId);
  const createPlanMutation = useCreateProjectPlan();
  const deletePlanMutation = useDeleteProjectPlan();

  const [showForm, setShowForm] = useState(false);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    kind: '',
    organization: '',
    phone: '',
    email: '',
    contact_person: '',
    notes: '',
  });

  // Plans state
  const [showPlanUpload, setShowPlanUpload] = useState(false);
  const [planFormData, setPlanFormData] = useState({
    title: '',
    description: '',
    plan_type: '',
    files: [] as File[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.kind || !formData.organization) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingContactId) {
        // Update existing contact
        await updateContactMutation.mutateAsync({
          id: editingContactId,
          ...formData,
        });
        setEditingContactId(null);
      } else {
        // Create new contact
        await createContactMutation.mutateAsync({
          project_id: projectId,
          ...formData,
        });
      }

      // Reset form
      setFormData({
        kind: '',
        organization: '',
        phone: '',
        email: '',
        contact_person: '',
        notes: '',
      });
      setShowForm(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleEdit = (contact: any) => {
    setFormData({
      kind: contact.kind,
      organization: contact.organization,
      phone: contact.phone || '',
      email: contact.email || '',
      contact_person: contact.contact_person || '',
      notes: contact.notes || '',
    });
    setEditingContactId(contact.id);
    setShowForm(true);
  };

  const handleDelete = async (contactId: string, organization: string) => {
    if (confirm(`Are you sure you want to delete the contact for "${organization}"?`)) {
      try {
        await deleteContactMutation.mutateAsync(contactId);
      } catch (error) {
        // Error is handled by the mutation
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingContactId(null);
    setFormData({
      kind: '',
      organization: '',
      phone: '',
      email: '',
      contact_person: '',
      notes: '',
    });
    setShowForm(false);
  };

  const getKindInfo = (kind: string) => {
    return UTILITY_KINDS.find(k => k.value === kind) || {
      label: kind,
      color: 'bg-gray-100 text-gray-800'
    };
  };

  const getPlanTypeInfo = (planType: string) => {
    return PLAN_TYPES.find(p => p.value === planType) || {
      label: planType,
      color: 'bg-gray-100 text-gray-800'
    };
  };

  const handlePlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!planFormData.title || !planFormData.plan_type || planFormData.files.length === 0) {
      toast.error('Please fill in all required fields and select at least one file');
      return;
    }

    try {
      let successCount = 0;
      let failCount = 0;

      // Upload each file separately
      for (const file of planFormData.files) {
        try {
          await createPlanMutation.mutateAsync({
            project_id: projectId,
            title: `${planFormData.title}${planFormData.files.length > 1 ? ` - ${file.name}` : ''}`,
            description: planFormData.description,
            plan_type: planFormData.plan_type,
            file: file,
          });
          successCount++;
        } catch (error) {
          console.error('Plan upload error:', error);
          failCount++;
        }
      }

      // Reset form
      setPlanFormData({
        title: '',
        description: '',
        plan_type: '',
        files: [],
      });
      setShowPlanUpload(false);

      if (failCount === 0) {
        toast.success(`${successCount} plan(s) uploaded successfully`);
      } else if (successCount > 0) {
        toast.warning(`${successCount} plan(s) uploaded, ${failCount} failed`);
      } else {
        toast.error('All plan uploads failed');
      }

    } catch (error) {
      console.error('Plan upload error:', error);
      toast.error(`Failed to upload plan: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    if (newFiles.length === 0) return;

    // Validate file types
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    const validFiles = newFiles.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`File "${file.name}" is not supported. Only PDF, image files, and Excel files are allowed`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      // ADD new files to existing files instead of replacing
      setPlanFormData(prev => ({ ...prev, files: [...prev.files, ...validFiles] }));
    }

    // Reset input to allow selecting the same file again
    e.target.value = '';
  };

  const handleRemoveFile = (index: number) => {
    setPlanFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const handleDeletePlan = async (planId: string, planTitle: string) => {
    if (confirm(`Are you sure you want to delete the plan "${planTitle}"?`)) {
      try {
        await deletePlanMutation.mutateAsync(planId);
        toast.success('Plan deleted successfully');
      } catch (error) {
        console.error('Plan deletion error:', error);
        toast.error('Failed to delete plan');
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading || plansLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Main Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Plans & Communications</h2>
          <p className="text-gray-600">
            Manage project plans and utility company contacts
          </p>
        </div>
      </div>

      {/* Project Plans Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Project Plans
              </CardTitle>
              <CardDescription>
                Upload and manage technical plans and documents
              </CardDescription>
            </div>
            <Button
              onClick={() => setShowPlanUpload(!showPlanUpload)}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Plan
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Plan Upload Form */}
          {showPlanUpload && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-6">
              <form onSubmit={handlePlanSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="plan-title">Plan Title *</Label>
                    <Input
                      id="plan-title"
                      value={planFormData.title}
                      onChange={(e) => setPlanFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Site plan, Network design, etc."
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="plan-type">Plan Type *</Label>
                    <Select
                      value={planFormData.plan_type}
                      onValueChange={(value) => setPlanFormData(prev => ({ ...prev, plan_type: value }))}
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
                    value={planFormData.description}
                    onChange={(e) => setPlanFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the plan..."
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
                        accept=".pdf,.jpg,.jpeg,.png,.gif,.xls,.xlsx"
                        className="hidden"
                        multiple
                      />
                      <span className="text-sm text-gray-500">
                        Click "Add Files" to select one or more files
                      </span>
                    </div>

                    {planFormData.files.length > 0 && (
                      <div className="space-y-2">
                        {planFormData.files.map((file, index) => (
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
                          {planFormData.files.length} file(s) selected - You can add more files
                        </p>
                      </div>
                    )}
                    <p className="text-sm text-gray-500">
                      Supported formats: PDF, Images (JPG, PNG, GIF), Excel files
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={createPlanMutation.isPending}>
                    <Upload className="w-4 h-4 mr-2" />
                    {createPlanMutation.isPending ? 'Uploading...' : 'Upload Plan'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowPlanUpload(false);
                      setPlanFormData({ title: '', description: '', plan_type: '', files: [] });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Plans List */}
          {!plans || plans.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No Plans Uploaded</h3>
              <p className="text-gray-600 mb-4">
                Upload project plans, technical drawings, and design documents to get started.
              </p>
              <Button onClick={() => setShowPlanUpload(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Upload First Plan
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plans.map((plan: ProjectPlan) => {
                const planTypeInfo = getPlanTypeInfo(plan.plan_type);
                return (
                  <Card key={plan.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <Badge className={planTypeInfo.color}>
                            {planTypeInfo.label}
                          </Badge>
                          <h4 className="font-semibold mt-2 mb-1 truncate" title={plan.title}>
                            {plan.title}
                          </h4>
                          {plan.description && (
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                              {plan.description}
                            </p>
                          )}
                          <div className="text-xs text-gray-500 space-y-1">
                            <p className="truncate" title={plan.filename}>
                              <span className="font-medium">File:</span> {plan.filename}
                            </p>
                            <p>
                              <span className="font-medium">Size:</span> {formatFileSize(plan.file_size)}
                            </p>
                            <p>
                              <span className="font-medium">Uploaded:</span> {new Date(plan.uploaded_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            title="View"
                            onClick={() => window.open(`/api/project-preparation/plans/${plan.id}/download`, '_blank')}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Download"
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = `/api/project-preparation/plans/${plan.id}/download?download=true`;
                              link.download = plan.filename;
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
                            onClick={() => handleDeletePlan(plan.id, plan.title)}
                          >
                            <X className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Utility Contacts Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Utility Contacts</h3>
          <p className="text-gray-600">
            Manage utility companies and emergency contacts for the project
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Contact
        </Button>
      </div>

      {/* Add Contact Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingContactId ? 'Edit Utility Contact' : 'Add New Utility Contact'}
            </CardTitle>
            <CardDescription>
              {editingContactId
                ? 'Update contact information for utility company'
                : 'Add contact information for utility companies and emergency services'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="kind">Type *</Label>
                  <Select
                    value={formData.kind}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, kind: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select utility type" />
                    </SelectTrigger>
                    <SelectContent>
                      {UTILITY_KINDS.map((kind) => (
                        <SelectItem key={kind.value} value={kind.value}>
                          {kind.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="organization">Organization *</Label>
                  <Input
                    id="organization"
                    value={formData.organization}
                    onChange={(e) => setFormData(prev => ({ ...prev, organization: e.target.value }))}
                    placeholder="Organization name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+49 xxx xxx xxxx"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="contact@utility.com"
                  />
                </div>

                <div>
                  <Label htmlFor="contact_person">Contact Person</Label>
                  <Input
                    id="contact_person"
                    value={formData.contact_person}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_person: e.target.value }))}
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional information or special instructions..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={createContactMutation.isPending || updateContactMutation.isPending}
                >
                  {editingContactId ? 'Update Contact' : 'Add Contact'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Contacts List */}
      <Card>
        <CardHeader>
          <CardTitle>Current Utility Contacts</CardTitle>
          <CardDescription>
            {contacts?.length || 0} contacts configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!contacts || contacts.length === 0 ? (
            <div className="text-center py-8">
              <Building className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No Utility Contacts</h3>
              <p className="text-gray-600 mb-4">
                Add utility companies and emergency contacts to get started.
              </p>
              <Button onClick={() => setShowForm(true)}>
                Add First Contact
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Contact Person</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contacts.map((contact) => {
                    const kindInfo = getKindInfo(contact.kind);
                    return (
                      <TableRow key={contact.id}>
                        <TableCell>
                          <Badge className={kindInfo.color}>
                            {kindInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {contact.organization}
                        </TableCell>
                        <TableCell>
                          {contact.contact_person ? (
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              {contact.contact_person}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {contact.phone ? (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <a href={`tel:${contact.phone}`} className="text-blue-600 hover:underline">
                                {contact.phone}
                              </a>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {contact.email ? (
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">
                                {contact.email}
                              </a>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {contact.notes ? (
                            <span className="text-sm text-gray-600 max-w-xs truncate block">
                              {contact.notes}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(contact)}
                              disabled={updateContactMutation.isPending}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(contact.id, contact.organization)}
                              disabled={deleteContactMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      {contacts && contacts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Contact Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {UTILITY_KINDS.map((kind) => {
                const count = contacts.filter(c => c.kind === kind.value).length;
                return (
                  <div key={kind.value} className="text-center">
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-sm text-gray-600">{kind.label}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}