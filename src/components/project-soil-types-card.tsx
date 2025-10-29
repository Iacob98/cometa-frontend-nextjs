"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layers, Plus, Trash2, Edit2, X, Check } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { ProjectSoilType } from "@/types";

interface ProjectSoilTypesCardProps {
  projectId: string;
}

export default function ProjectSoilTypesCard({ projectId }: ProjectSoilTypesCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newSoilType, setNewSoilType] = useState({
    soil_type_name: "",
    price_per_meter: "",
    quantity_meters: "",
    notes: "",
  });

  // Fetch soil types
  const { data: soilTypes = [], isLoading } = useQuery({
    queryKey: ["project-soil-types", projectId],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}/soil-types`);
      if (!response.ok) throw new Error("Failed to fetch soil types");
      return response.json();
    },
  });

  // Add soil type mutation
  const addSoilType = useMutation({
    mutationFn: async (data: typeof newSoilType) => {
      const response = await fetch(`/api/projects/${projectId}/soil-types`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          soil_type_name: data.soil_type_name,
          price_per_meter: parseFloat(data.price_per_meter),
          quantity_meters: data.quantity_meters ? parseFloat(data.quantity_meters) : undefined,
          notes: data.notes || undefined,
        }),
      });
      if (!response.ok) throw new Error("Failed to add soil type");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-soil-types", projectId] });
      setIsAddDialogOpen(false);
      setNewSoilType({
        soil_type_name: "",
        price_per_meter: "",
        quantity_meters: "",
        notes: "",
      });
      toast({
        title: "Success",
        description: "Soil type added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add soil type",
        variant: "destructive",
      });
    },
  });

  // Delete soil type mutation
  const deleteSoilType = useMutation({
    mutationFn: async (soilTypeId: string) => {
      const response = await fetch(
        `/api/projects/${projectId}/soil-types?soil_type_id=${soilTypeId}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Failed to delete soil type");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-soil-types", projectId] });
      toast({
        title: "Success",
        description: "Soil type deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete soil type",
        variant: "destructive",
      });
    },
  });

  const handleAddSoilType = () => {
    if (!newSoilType.soil_type_name || !newSoilType.price_per_meter) {
      toast({
        title: "Validation Error",
        description: "Soil type name and price per meter are required",
        variant: "destructive",
      });
      return;
    }
    addSoilType.mutate(newSoilType);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Layers className="h-5 w-5" />
            <span>Soil Types</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading soil types...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Layers className="h-5 w-5" />
                <span>Soil Types</span>
                {soilTypes.length > 0 && (
                  <Badge variant="secondary">{soilTypes.length}</Badge>
                )}
              </CardTitle>
              <CardDescription>Soil types with pricing per meter</CardDescription>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Soil Type
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {soilTypes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No soil types defined yet
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Soil Type</TableHead>
                    <TableHead className="text-right">Price/Meter</TableHead>
                    <TableHead className="text-right">Quantity (m)</TableHead>
                    <TableHead className="text-right">Total Cost</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {soilTypes.map((soilType: ProjectSoilType) => (
                    <TableRow key={soilType.id}>
                      <TableCell className="font-medium">
                        {soilType.soil_type_name}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        €{soilType.price_per_meter.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {soilType.quantity_meters?.toFixed(2) || "—"}
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium">
                        {soilType.quantity_meters
                          ? `€${(soilType.quantity_meters * soilType.price_per_meter).toFixed(2)}`
                          : "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {soilType.notes || "—"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteSoilType.mutate(soilType.id)}
                          aria-label={`Delete ${soilType.soil_type_name}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {(() => {
                const totalCost = soilTypes.reduce((sum: number, st: ProjectSoilType) => {
                  const quantity = st.quantity_meters || 0;
                  return sum + quantity * st.price_per_meter;
                }, 0);

                return totalCost > 0 ? (
                  <div className="mt-4 pt-4 border-t flex justify-end">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total Estimated Cost</p>
                      <p className="text-2xl font-bold">€{totalCost.toFixed(2)}</p>
                    </div>
                  </div>
                ) : null;
              })()}
            </>
          )}
        </CardContent>
      </Card>

      {/* Add Soil Type Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Soil Type</DialogTitle>
            <DialogDescription>
              Add a new soil type with pricing information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="soil_type_name">Soil Type Name *</Label>
              <Input
                id="soil_type_name"
                placeholder="e.g., Sand, Clay, Rock"
                value={newSoilType.soil_type_name}
                onChange={(e) =>
                  setNewSoilType({ ...newSoilType, soil_type_name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price_per_meter">Price per Meter (€) *</Label>
              <Input
                id="price_per_meter"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="e.g., 12.50"
                value={newSoilType.price_per_meter}
                onChange={(e) =>
                  setNewSoilType({ ...newSoilType, price_per_meter: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity_meters">Quantity (meters)</Label>
              <Input
                id="quantity_meters"
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g., 500"
                value={newSoilType.quantity_meters}
                onChange={(e) =>
                  setNewSoilType({ ...newSoilType, quantity_meters: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                placeholder="Additional notes"
                value={newSoilType.notes}
                onChange={(e) =>
                  setNewSoilType({ ...newSoilType, notes: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSoilType} disabled={addSoilType.isPending}>
              {addSoilType.isPending ? "Adding..." : "Add Soil Type"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
