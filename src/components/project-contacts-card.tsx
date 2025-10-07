"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Plus, Trash2, Mail, Phone as PhoneIcon, Briefcase } from "lucide-react";

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

interface Contact {
  id: string;
  project_id: string;
  first_name: string;
  last_name: string;
  department?: string;
  phone?: string;
  email?: string;
  position?: string;
  notes?: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

interface ProjectContactsCardProps {
  projectId: string;
}

export default function ProjectContactsCard({ projectId }: ProjectContactsCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newContact, setNewContact] = useState({
    first_name: "",
    last_name: "",
    department: "",
    phone: "",
    email: "",
    position: "",
    notes: "",
  });

  // Fetch contacts
  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ["project-contacts", projectId],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}/contacts`);
      if (!response.ok) throw new Error("Failed to fetch contacts");
      return response.json();
    },
  });

  // Add contact mutation
  const addContact = useMutation({
    mutationFn: async (data: typeof newContact) => {
      const response = await fetch(`/api/projects/${projectId}/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: data.first_name,
          last_name: data.last_name,
          department: data.department || undefined,
          phone: data.phone || undefined,
          email: data.email || undefined,
          position: data.position || undefined,
          notes: data.notes || undefined,
        }),
      });
      if (!response.ok) throw new Error("Failed to add contact");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-contacts", projectId] });
      setIsAddDialogOpen(false);
      setNewContact({
        first_name: "",
        last_name: "",
        department: "",
        phone: "",
        email: "",
        position: "",
        notes: "",
      });
      toast({
        title: "Success",
        description: "Contact added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add contact",
        variant: "destructive",
      });
    },
  });

  // Delete contact mutation
  const deleteContact = useMutation({
    mutationFn: async (contactId: string) => {
      const response = await fetch(
        `/api/projects/${projectId}/contacts?contact_id=${contactId}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Failed to delete contact");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-contacts", projectId] });
      toast({
        title: "Success",
        description: "Contact deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete contact",
        variant: "destructive",
      });
    },
  });

  const handleAddContact = () => {
    if (!newContact.first_name || !newContact.last_name) {
      toast({
        title: "Validation Error",
        description: "First name and last name are required",
        variant: "destructive",
      });
      return;
    }
    addContact.mutate(newContact);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Project Contacts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading contacts...</p>
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
                <Users className="h-5 w-5" />
                <span>Project Contacts</span>
                {contacts.length > 0 && (
                  <Badge variant="secondary">{contacts.length}</Badge>
                )}
              </CardTitle>
              <CardDescription>Key contacts for this project</CardDescription>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {contacts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No contacts added yet
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((contact: Contact) => (
                  <TableRow key={contact.id}>
                    <TableCell className="font-medium">
                      {contact.first_name} {contact.last_name}
                      {contact.is_primary && (
                        <Badge variant="secondary" className="ml-2">
                          Primary
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {contact.department ? (
                        <div className="flex items-center space-x-1">
                          <Briefcase className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{contact.department}</span>
                        </div>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {contact.position || "—"}
                    </TableCell>
                    <TableCell>
                      {contact.phone ? (
                        <div className="flex items-center space-x-1">
                          <PhoneIcon className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm font-mono">{contact.phone}</span>
                        </div>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      {contact.email ? (
                        <div className="flex items-center space-x-1">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{contact.email}</span>
                        </div>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteContact.mutate(contact.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Contact Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Contact</DialogTitle>
            <DialogDescription>Add a new contact to this project</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  placeholder="e.g., John"
                  value={newContact.first_name}
                  onChange={(e) =>
                    setNewContact({ ...newContact, first_name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  placeholder="e.g., Smith"
                  value={newContact.last_name}
                  onChange={(e) =>
                    setNewContact({ ...newContact, last_name: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  placeholder="e.g., Engineering"
                  value={newContact.department}
                  onChange={(e) =>
                    setNewContact({ ...newContact, department: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  placeholder="e.g., Project Coordinator"
                  value={newContact.position}
                  onChange={(e) =>
                    setNewContact({ ...newContact, position: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  placeholder="e.g., +49 30 12345678"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="e.g., john.smith@example.com"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddContact} disabled={addContact.isPending}>
              {addContact.isPending ? "Adding..." : "Add Contact"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
