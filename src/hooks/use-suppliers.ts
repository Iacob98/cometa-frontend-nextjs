import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Query keys
export const supplierKeys = {
  all: ["suppliers"] as const,
  lists: () => [...supplierKeys.all, "list"] as const,
  list: (filters: string) => [...supplierKeys.lists(), { filters }] as const,
  details: () => [...supplierKeys.all, "detail"] as const,
  detail: (id: string) => [...supplierKeys.details(), id] as const,
};

export interface Supplier {
  id: string;
  org_name: string;
  contact_person: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateSupplierData {
  org_name: string;
  contact_person: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

export interface UpdateSupplierData {
  id: string;
  org_name?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

export interface SupplierContact {
  id: string;
  supplier_id: string;
  contact_name: string;
  position?: string;
  department?: string;
  phone?: string;
  email?: string;
  is_primary: boolean;
  is_active: boolean;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateContactData {
  contact_name: string;
  position?: string;
  department?: string;
  phone?: string;
  email?: string;
  is_primary?: boolean;
  notes?: string;
}

export interface UpdateContactData {
  contact_name?: string;
  position?: string;
  department?: string;
  phone?: string;
  email?: string;
  is_primary?: boolean;
  notes?: string;
}

export interface SupplierMaterial {
  id: string;
  supplier_id: string;
  material_id: string;
  supplier_part_number?: string;
  unit_price: number;
  minimum_order_qty: number;
  lead_time_days?: number;
  is_preferred: boolean;
  last_price_update?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  material: {
    id: string;
    name: string;
    category?: string;
    unit: string;
    unit_price_eur: number;
    supplier_name?: string;
    description?: string;
    is_active: boolean;
  };
  material_name?: string;
  material_category?: string;
  material_unit?: string;
  material_description?: string;
}

export interface CreateMaterialData {
  material_id?: string;
  material_name?: string;
  category?: string;
  unit?: string;
  supplier_part_number?: string;
  unit_price: number;
  minimum_order_qty?: number;
  lead_time_days?: number;
  is_preferred?: boolean;
  notes?: string;
}

export interface ProjectAssignment {
  id: string;
  project_id: string;
  supplier_id: string;
  supplier_role: string;
  contact_person?: string;
  contract_reference?: string;
  start_date?: string;
  end_date?: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  assigned_at?: string; // For compatibility
  project_name?: string;
  project_customer?: string;
  project_city?: string;
  project_status?: string;
}

export interface CreateProjectAssignmentData {
  project_id: string;
  supplier_role?: string;
  contact_person?: string;
  contract_reference?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  notes?: string;
}

// Fetch suppliers
async function fetchSuppliers(): Promise<Supplier[]> {
  const response = await fetch("/api/suppliers");
  if (!response.ok) {
    throw new Error("Failed to fetch suppliers");
  }
  const data = await response.json();
  // Extract items array from paginated response and map name to org_name
  const suppliers = data.items || [];
  return suppliers.map((supplier: any) => ({
    ...supplier,
    org_name: supplier.name,
  }));
}

// Fetch single supplier
async function fetchSupplier(id: string): Promise<Supplier> {
  const response = await fetch(`/api/suppliers/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch supplier");
  }
  return response.json();
}

// Create supplier
async function createSupplier(data: CreateSupplierData): Promise<Supplier> {
  // Map org_name to name for API compatibility
  const { org_name, ...restData } = data;
  const apiData = {
    ...restData,
    name: org_name,
  };

  const response = await fetch("/api/suppliers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(apiData),
  });

  if (!response.ok) {
    throw new Error("Failed to create supplier");
  }

  const result = await response.json();

  // Map name back to org_name for frontend compatibility
  return {
    ...result,
    org_name: result.name,
  };
}

// Update supplier
async function updateSupplier(data: UpdateSupplierData): Promise<Supplier> {
  const { id, ...updateData } = data;
  const response = await fetch(`/api/suppliers/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    throw new Error("Failed to update supplier");
  }

  return response.json();
}

// Delete supplier
async function deleteSupplier(id: string): Promise<void> {
  const response = await fetch(`/api/suppliers/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete supplier");
  }
}

// Fetch supplier contacts
async function fetchSupplierContacts(supplierId: string): Promise<SupplierContact[]> {
  const response = await fetch(`/api/suppliers/${supplierId}/contacts`);
  if (!response.ok) {
    throw new Error("Failed to fetch supplier contacts");
  }
  return response.json();
}

// Create supplier contact
async function createSupplierContact(supplierId: string, data: CreateContactData): Promise<SupplierContact> {
  const response = await fetch(`/api/suppliers/${supplierId}/contacts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create supplier contact");
  }

  return response.json();
}

// Update supplier contact
async function updateSupplierContact(supplierId: string, contactId: string, data: UpdateContactData): Promise<SupplierContact> {
  const response = await fetch(`/api/suppliers/${supplierId}/contacts/${contactId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to update supplier contact");
  }

  return response.json();
}

// Delete supplier contact
async function deleteSupplierContact(supplierId: string, contactId: string): Promise<void> {
  const response = await fetch(`/api/suppliers/${supplierId}/contacts/${contactId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete supplier contact");
  }
}

// Fetch supplier materials
async function fetchSupplierMaterials(supplierId: string, projectId?: string): Promise<SupplierMaterial[]> {
  const url = new URL(`/api/suppliers/${supplierId}/materials`, window.location.origin);
  if (projectId) {
    url.searchParams.set('project_id', projectId);
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error("Failed to fetch supplier materials");
  }
  return response.json();
}

// Create supplier material
async function createSupplierMaterial(supplierId: string, data: CreateMaterialData): Promise<SupplierMaterial> {
  const response = await fetch(`/api/suppliers/${supplierId}/materials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `Failed to create supplier material (${response.status})`);
  }

  return response.json();
}

// Fetch supplier project assignments
async function fetchSupplierProjects(supplierId: string): Promise<ProjectAssignment[]> {
  const response = await fetch(`/api/suppliers/${supplierId}/projects`);
  if (!response.ok) {
    throw new Error("Failed to fetch supplier projects");
  }
  return response.json();
}

// Create supplier project assignment
async function createSupplierProjectAssignment(supplierId: string, data: CreateProjectAssignmentData): Promise<ProjectAssignment> {
  const response = await fetch(`/api/suppliers/${supplierId}/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to assign supplier to project");
  }

  return response.json();
}

// Hooks
export function useSuppliers() {
  return useQuery({
    queryKey: supplierKeys.lists(),
    queryFn: fetchSuppliers,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useSupplier(id: string) {
  return useQuery({
    queryKey: supplierKeys.detail(id),
    queryFn: () => fetchSupplier(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSupplier,
    onSuccess: (newSupplier) => {
      // Update suppliers list
      queryClient.setQueryData<Supplier[]>(
        supplierKeys.lists(),
        (oldSuppliers = []) => [...oldSuppliers, newSupplier]
      );

      // Invalidate suppliers queries
      queryClient.invalidateQueries({ queryKey: supplierKeys.all });

      toast.success("Supplier created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create supplier: ${error.message}`);
    },
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSupplier,
    onSuccess: (updatedSupplier) => {
      // Update suppliers list
      queryClient.setQueryData<Supplier[]>(
        supplierKeys.lists(),
        (oldSuppliers = []) =>
          oldSuppliers.map((supplier) =>
            supplier.id === updatedSupplier.id ? updatedSupplier : supplier
          )
      );

      // Update individual supplier cache
      queryClient.setQueryData(
        supplierKeys.detail(updatedSupplier.id),
        updatedSupplier
      );

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: supplierKeys.all });

      toast.success("Supplier updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update supplier: ${error.message}`);
    },
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSupplier,
    onSuccess: (_, deletedId) => {
      // Remove from suppliers list
      queryClient.setQueryData<Supplier[]>(
        supplierKeys.lists(),
        (oldSuppliers = []) =>
          oldSuppliers.filter((supplier) => supplier.id !== deletedId)
      );

      // Remove individual supplier cache
      queryClient.removeQueries({
        queryKey: supplierKeys.detail(deletedId),
      });

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: supplierKeys.all });

      toast.success("Supplier deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete supplier: ${error.message}`);
    },
  });
}

// Supplier Contacts Hooks
export function useSupplierContacts(supplierId: string) {
  return useQuery({
    queryKey: [...supplierKeys.detail(supplierId), "contacts"],
    queryFn: () => fetchSupplierContacts(supplierId),
    enabled: !!supplierId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateSupplierContact(supplierId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateContactData) => createSupplierContact(supplierId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...supplierKeys.detail(supplierId), "contacts"]
      });
      toast.success("Contact created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create contact: ${error.message}`);
    },
  });
}

export function useUpdateSupplierContact(supplierId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ contactId, data }: { contactId: string; data: UpdateContactData }) =>
      updateSupplierContact(supplierId, contactId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...supplierKeys.detail(supplierId), "contacts"]
      });
      toast.success("Contact updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update contact: ${error.message}`);
    },
  });
}

export function useDeleteSupplierContact(supplierId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contactId: string) => deleteSupplierContact(supplierId, contactId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...supplierKeys.detail(supplierId), "contacts"]
      });
      toast.success("Contact deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete contact: ${error.message}`);
    },
  });
}

// Supplier Materials Hooks
export function useSupplierMaterials(supplierId: string, projectId?: string) {
  return useQuery({
    queryKey: [...supplierKeys.detail(supplierId), "materials", { projectId }],
    queryFn: () => fetchSupplierMaterials(supplierId, projectId),
    enabled: !!supplierId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateSupplierMaterial(supplierId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMaterialData) => createSupplierMaterial(supplierId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...supplierKeys.detail(supplierId), "materials"]
      });
      toast.success("Material created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create material: ${error.message}`);
    },
  });
}

// Supplier Projects Hooks
export function useSupplierProjects(supplierId: string) {
  return useQuery({
    queryKey: [...supplierKeys.detail(supplierId), "projects"],
    queryFn: () => fetchSupplierProjects(supplierId),
    enabled: !!supplierId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateSupplierProjectAssignment(supplierId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectAssignmentData) => createSupplierProjectAssignment(supplierId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...supplierKeys.detail(supplierId), "projects"]
      });
      toast.success("Supplier assigned to project successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to assign supplier to project: ${error.message}`);
    },
  });
}