"use client";

import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { ArrowLeft, MapPin, Calendar, User, CheckCircle, Clock, Edit, Trash2, FileText, ThumbsUp, X, RefreshCw, AlertTriangle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { useWorkEntry, useDeleteWorkEntry, useApproveWorkEntry, useRejectWorkEntry, useResubmitWorkEntry } from "@/hooks/use-work-entries";
import { RejectWorkEntryDialog } from "@/components/work-entries/reject-work-entry-dialog";
import { UploadPhotos } from "@/components/work-entries/upload-photos";
import { PhotoGallery } from "@/components/work-entries/photo-gallery";
import { requireAuth } from "@/lib/auth";

interface WorkEntryDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default function WorkEntryDetailsPage({ params }: WorkEntryDetailsPageProps) {
  requireAuth();

  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = use(params);
  const { data: workEntry, isLoading, error } = useWorkEntry(id);
  const deleteWorkEntry = useDeleteWorkEntry();
  const approveWorkEntry = useApproveWorkEntry();
  const rejectWorkEntry = useRejectWorkEntry();
  const resubmitWorkEntry = useResubmitWorkEntry();
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const handleDeleteWorkEntry = async () => {
    if (confirm("Are you sure you want to delete this work entry? This action cannot be undone.")) {
      await deleteWorkEntry.mutateAsync(id);
      router.push("/dashboard/work-entries");
    }
  };

  const handleApprove = async () => {
    if (confirm("Are you sure you want to approve this work entry?")) {
      await approveWorkEntry.mutateAsync(id);
    }
  };

  const handleReject = async (rejection_reason: string, photos?: File[]) => {
    try {
      // First reject the work entry
      await rejectWorkEntry.mutateAsync({ id, rejection_reason });

      // If photos are provided, upload them
      if (photos && photos.length > 0) {
        const formData = new FormData();

        // Add metadata as JSON (required by API)
        const metadata = {
          workEntryId: id,
          stage: 'issue' as const, // Rejection photos are issues
          description: `Rejection: ${rejection_reason.substring(0, 100)}${rejection_reason.length > 100 ? '...' : ''}`,
          issueType: 'quality' as const,
        };
        formData.append('metadata', JSON.stringify(metadata));

        // Add photos with correct field name (fileN)
        photos.forEach((file, index) => {
          formData.append(`file${index}`, file);
        });

        const uploadResponse = await fetch('/api/upload/work-photos', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          console.error('Failed to upload rejection photos:', uploadResponse.status, errorText);
        } else {
          console.log('Rejection photos uploaded successfully');
          // Invalidate work entry query to refresh photos immediately
          await queryClient.invalidateQueries({ queryKey: ['work-entry', id] });
        }
      }

      setShowRejectDialog(false);
    } catch (error) {
      console.error('Error rejecting work entry:', error);
      alert('Failed to reject work entry. Please try again.');
    }
  };

  const handleResubmit = async () => {
    if (confirm("Resubmit this work entry for approval? The rejection will be cleared.")) {
      await resubmitWorkEntry.mutateAsync(id);
    }
  };

  const getStatusBadgeVariant = (status: string | undefined) => {
    switch (status) {
      case "completed":
        return "default";
      case "pending_approval":
        return "secondary";
      case "in_progress":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getStatusLabel = (status: string | undefined) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "pending_approval":
        return "Pending Approval";
      case "in_progress":
        return "In Progress";
      default:
        return status || "Unknown";
    }
  };

  const getMethodLabel = (method: string | null | undefined) => {
    switch (method) {
      case "hand":
        return "Manual";
      case "excavator":
        return "Excavator";
      case "trencher":
        return "Trencher";
      case "mole":
        return "Mole";
      default:
        return method || "—";
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Work Entry Details</h1>
          </div>
        </div>
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              Failed to load work entry. Please try again later.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Work Entry Details</h1>
          </div>
        </div>
        <Card>
          <CardContent className="py-8">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex space-x-4">
                  <div className="h-4 bg-muted animate-pulse rounded flex-1" />
                  <div className="h-4 bg-muted animate-pulse rounded w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!workEntry) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Work Entry Details</h1>
          </div>
        </div>
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              Work entry not found.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">Work Entry Details</h1>
              {workEntry.was_rejected_before && !workEntry.rejected_by && (
                <Badge variant="outline" className="border-orange-500 text-orange-600">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Resubmitted
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              {workEntry.project?.name || 'No project'} • {workEntry.project?.city || ''}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {/* Resubmit button - only show for rejected entries */}
          {workEntry.rejected_by && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResubmit}
              disabled={resubmitWorkEntry.isPending}
              className="border-orange-500 text-orange-600 hover:bg-orange-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {resubmitWorkEntry.isPending ? "Resubmitting..." : "Resubmit for Approval"}
            </Button>
          )}

          {/* Approval buttons - only show if not yet approved or rejected */}
          {!workEntry.approved && !workEntry.rejected_by && (
            <>
              <Button
                variant="default"
                size="sm"
                onClick={handleApprove}
                disabled={approveWorkEntry.isPending}
              >
                <ThumbsUp className="h-4 w-4 mr-2" />
                {approveWorkEntry.isPending ? "Approving..." : "Approve"}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowRejectDialog(true)}
                disabled={rejectWorkEntry.isPending}
              >
                <X className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </>
          )}
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteWorkEntry}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Show rejection info if work entry was rejected */}
      {workEntry.rejected_by && workEntry.rejection_reason && (
        <Alert variant="destructive">
          <X className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-semibold">This work entry was rejected</p>
              <p className="text-sm">{workEntry.rejection_reason}</p>
              {workEntry.rejected_at && (
                <p className="text-xs text-muted-foreground">
                  Rejected on {new Date(workEntry.rejected_at).toLocaleString()}
                </p>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Reject Dialog */}
      <RejectWorkEntryDialog
        open={showRejectDialog}
        onOpenChange={setShowRejectDialog}
        onReject={handleReject}
        isLoading={rejectWorkEntry.isPending}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Work Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Work Details</span>
                </CardTitle>
                <Badge variant={getStatusBadgeVariant(workEntry.status)}>
                  {getStatusLabel(workEntry.status)}
                </Badge>
              </div>
              <CardDescription>
                {workEntry.notes || 'No description'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Stage</label>
                  <p className="font-medium">{workEntry.stage_code || '—'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Method</label>
                  <p className="font-medium">{getMethodLabel(workEntry.method)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Meters Completed</label>
                  <p className="font-medium">{workEntry.meters_done_m || 0}m</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date</label>
                  <p className="font-medium">{new Date(workEntry.date).toLocaleDateString()}</p>
                </div>
              </div>

              {(workEntry.width_m || workEntry.depth_m || workEntry.cables_count) && (
                <>
                  <Separator />
                  <div className="grid grid-cols-3 gap-4">
                    {workEntry.width_m && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Width</label>
                        <p className="font-medium">{workEntry.width_m}m</p>
                      </div>
                    )}
                    {workEntry.depth_m && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Depth</label>
                        <p className="font-medium">{workEntry.depth_m}m</p>
                      </div>
                    )}
                    {workEntry.cables_count && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Cables</label>
                        <p className="font-medium">{workEntry.cables_count}</p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {workEntry.has_protection_pipe && (
                <>
                  <Separator />
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Protection pipe installed</span>
                  </div>
                </>
              )}

              {workEntry.soil_type && (
                <>
                  <Separator />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Soil Type</label>
                    <p className="font-medium">{workEntry.soil_type}</p>
                  </div>
                </>
              )}

              {workEntry.notes && (
                <>
                  <Separator />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Notes</label>
                    <p className="text-sm text-muted-foreground">{workEntry.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Photos Section */}
          <Card>
            <CardHeader>
              <CardTitle>Photos</CardTitle>
              <CardDescription>
                Work progress and completion photos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PhotoGallery photos={workEntry.photos || []} />
            </CardContent>
          </Card>

          {/* Upload Photos Section */}
          <UploadPhotos workEntryId={id} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Project</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <p className="font-medium">{workEntry.project?.name || 'No project'}</p>
              </div>
              {workEntry.project?.city && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Location</label>
                  <p className="font-medium">{workEntry.project.city}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Worker Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Worker</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <p className="font-medium">
                  {workEntry.user ? `${workEntry.user.first_name} ${workEntry.user.last_name}` : 'Unknown worker'}
                </p>
              </div>
              {workEntry.user?.email && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-sm text-muted-foreground">{workEntry.user.email}</p>
                </div>
              )}
              {workEntry.crew?.name && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Crew</label>
                  <p className="font-medium">{workEntry.crew.name}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Approval Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {workEntry.approved ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <Clock className="h-5 w-5 text-yellow-600" />
                )}
                <span>Approval Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Badge variant={workEntry.approved ? "default" : "secondary"}>
                  {workEntry.approved ? "Approved" : "Pending Approval"}
                </Badge>
              </div>
              {workEntry.approved && workEntry.approved_by_name && (
                <>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Approved by</label>
                    <p className="font-medium">{workEntry.approved_by_name}</p>
                  </div>
                  {workEntry.approved_at && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Approved on</label>
                      <p className="text-sm text-muted-foreground">
                        {new Date(workEntry.approved_at).toLocaleString()}
                      </p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Timeline</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created</label>
                <p className="text-sm text-muted-foreground">
                  {workEntry.created_at ? new Date(workEntry.created_at).toLocaleString() : "—"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                <p className="text-sm text-muted-foreground">
                  {workEntry.updated_at ? new Date(workEntry.updated_at).toLocaleString() : "—"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}