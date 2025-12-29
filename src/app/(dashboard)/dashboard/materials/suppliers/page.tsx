"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Search, Edit, Trash2, Building2, Phone, Mail, User, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";

import { useSuppliers, useCreateSupplier, useUpdateSupplier, useDeleteSupplier } from "@/hooks/use-suppliers";
import { usePermissions } from "@/hooks/use-auth";

const supplierSchema = z.object({
  org_name: z.string().min(1, "Название организации обязательно"),
  contact_person: z.string().min(1, "Контактное лицо обязательно"),
  phone: z.string().optional(),
  email: z.string().email("Некорректный email").optional().or(z.literal("")),
  address: z.string().optional(),
  notes: z.string().optional(),
});

type SupplierFormData = z.infer<typeof supplierSchema>;

export default function SuppliersPage() {
  const router = useRouter();
  const { canManageInventory } = usePermissions();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);

  const { data: suppliers = [], isLoading } = useSuppliers();
  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();
  const deleteSupplier = useDeleteSupplier();

  const form = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      org_name: "",
      contact_person: "",
      phone: "",
      email: "",
      address: "",
      notes: "",
    },
  });

  const filteredSuppliers = Array.isArray(suppliers)
    ? suppliers.filter((supplier: any) =>
        supplier.org_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const handleCreateSupplier = async (data: SupplierFormData) => {
    try {
      await createSupplier.mutateAsync(data);
      setIsCreateDialogOpen(false);
      form.reset();
      toast.success("Поставщик успешно создан");
    } catch (error) {
      toast.error("Не удалось создать поставщика");
    }
  };

  const handleUpdateSupplier = async (data: SupplierFormData) => {
    if (!editingSupplier) return;

    try {
      await updateSupplier.mutateAsync({
        id: editingSupplier.id,
        ...data,
      });
      setEditingSupplier(null);
      form.reset();
      toast.success("Поставщик успешно обновлён");
    } catch (error) {
      toast.error("Не удалось обновить поставщика");
    }
  };

  const handleDeleteSupplier = async (id: string) => {
    if (!window.confirm("Вы уверены, что хотите удалить этого поставщика?")) return;

    try {
      await deleteSupplier.mutateAsync(id);
      toast.success("Поставщик успешно удалён");
    } catch (error) {
      toast.error("Не удалось удалить поставщика");
    }
  };

  const openEditDialog = (supplier: any) => {
    setEditingSupplier(supplier);
    form.reset({
      org_name: supplier.org_name || "",
      contact_person: supplier.contact_person || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
      address: typeof supplier.address === 'string'
        ? supplier.address
        : supplier.address
          ? `${supplier.address.street || ''} ${supplier.address.city || ''} ${supplier.address.postal_code || ''} ${supplier.address.country || ''}`.trim()
          : "",
      notes: supplier.notes || "",
    });
  };

  const closeDialog = () => {
    setIsCreateDialogOpen(false);
    setEditingSupplier(null);
    form.reset();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Поставщики</h1>
            <p className="text-muted-foreground">Управление поставщиками материалов</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-4">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Поставщики</h1>
          <p className="text-muted-foreground">
            Управление поставщиками материалов
          </p>
        </div>
        {canManageInventory && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Добавить поставщика
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Добавить нового поставщика</DialogTitle>
                <DialogDescription>
                  Создайте нового поставщика для управления закупками материалов
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCreateSupplier)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="org_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Название организации *</FormLabel>
                        <FormControl>
                          <Input placeholder="напр., ООО Стройматериалы" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contact_person"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Контактное лицо *</FormLabel>
                        <FormControl>
                          <Input placeholder="напр., Иван Петров" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Телефон</FormLabel>
                          <FormControl>
                            <Input placeholder="+7 999 123 45 67" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="contact@company.ru" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Адрес</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Адрес компании..." rows={2} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Примечания</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Дополнительные примечания..." rows={2} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={closeDialog}>
                      Отмена
                    </Button>
                    <Button type="submit" disabled={createSupplier.isPending}>
                      {createSupplier.isPending ? "Создание..." : "Создать поставщика"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Поиск поставщиков..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="secondary">
          {filteredSuppliers.length} {filteredSuppliers.length === 1 ? 'поставщик' : filteredSuppliers.length >= 2 && filteredSuppliers.length <= 4 ? 'поставщика' : 'поставщиков'}
        </Badge>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.map((supplier: any) => (
          <Card
            key={supplier.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => router.push(`/dashboard/materials/suppliers/${supplier.id}`)}
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback>
                      <Building2 className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{supplier.org_name}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <User className="h-3 w-3 mr-1" />
                      {supplier.contact_person}
                    </CardDescription>
                  </div>
                </div>
                {canManageInventory && (
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditDialog(supplier);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSupplier(supplier.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {supplier.phone && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Phone className="h-3 w-3 mr-2" />
                  {supplier.phone}
                </div>
              )}
              {supplier.email && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Mail className="h-3 w-3 mr-2" />
                  {supplier.email}
                </div>
              )}
              {supplier.address && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3 mr-2" />
                  <span className="truncate">
                    {typeof supplier.address === 'string'
                      ? supplier.address
                      : `${supplier.address.street || ''} ${supplier.address.city || ''} ${supplier.address.postal_code || ''} ${supplier.address.country || ''}`.trim()
                    }
                  </span>
                </div>
              )}
              {supplier.notes && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {supplier.notes}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSuppliers.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Поставщики не найдены</h3>
          <p className="text-muted-foreground">
            {searchTerm ? "Попробуйте изменить критерии поиска" : "Начните с добавления первого поставщика"}
          </p>
          {canManageInventory && !searchTerm && (
            <Button className="mt-4" onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Добавить поставщика
            </Button>
          )}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingSupplier} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Редактировать поставщика</DialogTitle>
            <DialogDescription>
              Обновите информацию о поставщике
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdateSupplier)} className="space-y-4">
              <FormField
                control={form.control}
                name="org_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Название организации *</FormLabel>
                    <FormControl>
                      <Input placeholder="напр., ООО Стройматериалы" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contact_person"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Контактное лицо *</FormLabel>
                    <FormControl>
                      <Input placeholder="напр., Иван Петров" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Телефон</FormLabel>
                      <FormControl>
                        <Input placeholder="+7 999 123 45 67" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="contact@company.ru" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Адрес</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Адрес компании..." rows={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Примечания</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Дополнительные примечания..." rows={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeDialog}>
                  Отмена
                </Button>
                <Button type="submit" disabled={updateSupplier.isPending}>
                  {updateSupplier.isPending ? "Обновление..." : "Обновить поставщика"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}