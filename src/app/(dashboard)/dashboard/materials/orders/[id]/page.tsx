"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  Edit,
  ExternalLink,
  Package,
  MapPin,
  Building2,
  User,
  FileText,
  AlertTriangle,
  Truck,
  DollarSign,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

import { useMaterialOrder, useUpdateMaterialOrder, useDeleteMaterialOrder } from "@/hooks/use-material-orders";
import { usePermissions } from "@/hooks/use-auth";
import type { MaterialOrderStatus } from "@/types";

interface Props {
  params: Promise<{ id: string }>;
}

export default function MaterialOrderDetailsPage({ params }: Props) {
  const router = useRouter();
  const { id } = use(params);
  const { canManageInventory } = usePermissions();

  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    status: "" as MaterialOrderStatus,
    actual_delivery_date: "",
    notes: "",
  });

  const { data: order, isLoading, error } = useMaterialOrder(id);
  const updateMutation = useUpdateMaterialOrder();
  const deleteMutation = useDeleteMaterialOrder();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("de-DE");
  };

  const getStatusBadge = (status: MaterialOrderStatus) => {
    const variants = {
      pending: { variant: "outline" as const, icon: Clock, color: "text-yellow-600" },
      ordered: { variant: "secondary" as const, icon: Truck, color: "text-blue-600" },
      delivered: { variant: "default" as const, icon: CheckCircle, color: "text-green-600" },
      cancelled: { variant: "destructive" as const, icon: XCircle, color: "text-red-600" },
      draft: { variant: "outline" as const, icon: FileText, color: "text-gray-600" },
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant}>
        <Icon className={`mr-1 h-3 w-3 ${config.color}`} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleEdit = () => {
    if (order) {
      setEditFormData({
        status: order.status,
        actual_delivery_date: order.actual_delivery_date || "",
        notes: order.notes || "",
      });
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (!order) return;

    try {
      await updateMutation.mutateAsync({
        id: order.id,
        data: {
          status: editFormData.status,
          actual_delivery_date: editFormData.actual_delivery_date || undefined,
          notes: editFormData.notes || undefined,
        },
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update order:", error);
    }
  };

  const handleQuickStatusUpdate = async (status: MaterialOrderStatus, deliveryDate?: string) => {
    if (!order) return;

    try {
      await updateMutation.mutateAsync({
        id: order.id,
        data: {
          status,
          actual_delivery_date: deliveryDate || undefined,
          notes: order.notes || undefined,
        },
      });
    } catch (error) {
      console.error("Failed to update order:", error);
    }
  };

  const handleDelete = async () => {
    if (!order) return;

    try {
      await deleteMutation.mutateAsync(order.id);
      router.push("/dashboard/materials");
    } catch (error) {
      console.error("Failed to delete order:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-lg font-semibold">Order not found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                The material order you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.
              </p>
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
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Order #{order.id.slice(0, 8)}
            </h1>
            <p className="text-muted-foreground">
              Material order details and management
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(order.status)}
          {canManageInventory && !isEditing && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              {(order.status === "draft" || order.status === "pending") && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <XCircle className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Material Order</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this material order? This action cannot be undone.
                        Only draft and pending orders can be deleted.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete Order
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Order Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Material Details */}
              <div>
                <h4 className="font-medium mb-3">Material</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Material Type:</span>
                    <span className="font-medium">{order.material_type || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">SKU:</span>
                    <span className="font-mono text-sm">{order.material_sku || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Unit:</span>
                    <span>{order.material_unit || "—"}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Order Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Quantity</Label>
                  <p className="font-medium">
                    {order.quantity} {order.material_unit || "units"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Unit Price</Label>
                  <p className="font-medium">{formatCurrency(order.unit_price_eur)}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Delivery Cost</Label>
                  <p className="font-medium">{formatCurrency(order.delivery_cost_eur || 0)}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Total Cost</Label>
                  <p className="text-lg font-bold">{formatCurrency(order.total_cost_eur)}</p>
                </div>
              </div>

              <Separator />

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Order Date</Label>
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDate(order.order_date)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Expected Delivery</Label>
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDate(order.expected_delivery_date)}
                  </p>
                </div>
                {order.actual_delivery_date && (
                  <div className="col-span-2">
                    <Label className="text-sm text-muted-foreground">Actual Delivery</Label>
                    <p className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      {formatDate(order.actual_delivery_date)}
                    </p>
                  </div>
                )}
              </div>

              {/* Notes */}
              {order.notes && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-sm text-muted-foreground">Notes</Label>
                    <p className="mt-1 p-3 bg-muted rounded-md text-sm">{order.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Edit Form */}
          {isEditing && (
            <Card>
              <CardHeader>
                <CardTitle>Edit Order</CardTitle>
                <CardDescription>
                  Update order status, delivery date, and notes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={editFormData.status}
                      onValueChange={(value: MaterialOrderStatus) =>
                        setEditFormData({ ...editFormData, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="ordered">Ordered</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="actual_delivery_date">Actual Delivery Date</Label>
                    <Input
                      id="actual_delivery_date"
                      type="date"
                      value={editFormData.actual_delivery_date}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          actual_delivery_date: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={editFormData.notes}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, notes: e.target.value })
                    }
                    placeholder="Add any additional notes about this order..."
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Supplier Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Supplier
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium">{order.supplier_name || "—"}</p>
                {order.supplier_contact && (
                  <p className="text-sm text-muted-foreground">{order.supplier_contact}</p>
                )}
              </div>
              {order.supplier_phone && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Phone:</span>
                  <span>{order.supplier_phone}</span>
                </div>
              )}
              {order.supplier_email && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Email:</span>
                  <span>{order.supplier_email}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Project Information */}
          {order.project_name && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Project
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="font-medium">{order.project_name}</p>
                  {order.project_id && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/dashboard/projects/${order.project_id}`)}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Created by</p>
                <p className="font-medium">{order.created_by_name || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Order ID</p>
                <p className="font-mono text-sm">{order.id}</p>
              </div>
              {order.created_at && (
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="text-sm">{formatDate(order.created_at)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          {canManageInventory && !isEditing && (
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {order.status === "pending" && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleQuickStatusUpdate("ordered")}
                    disabled={updateMutation.isPending}
                  >
                    <Truck className="mr-2 h-4 w-4" />
                    {updateMutation.isPending ? "Updating..." : "Mark as Ordered"}
                  </Button>
                )}
                {(order.status === "pending" || order.status === "ordered") && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() =>
                      handleQuickStatusUpdate("delivered", new Date().toISOString().split("T")[0])
                    }
                    disabled={updateMutation.isPending}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {updateMutation.isPending ? "Updating..." : "Mark as Delivered"}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}