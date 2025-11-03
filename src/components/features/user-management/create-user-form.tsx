"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X, Plus, Loader2, User, Mail, Phone, Shield, Globe, Code } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

import {
  createUserSchema,
  type CreateUserFormData,
  type UserResponse,
  type SkillsResponse,
  USER_ROLES,
} from "@/lib/validations/user";

interface CreateUserFormProps {
  onSuccess?: (user: UserResponse) => void;
  onCancel?: () => void;
  defaultRole?: string;
  editMode?: boolean;
  initialData?: any;
}

// API functions
async function createUser(data: CreateUserFormData): Promise<UserResponse> {
  const response = await fetch("/api/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to create user");
  }

  return response.json();
}

async function updateUser(id: string, data: CreateUserFormData): Promise<UserResponse> {
  const response = await fetch(`/api/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to update user");
  }

  return response.json();
}

async function getAvailableSkills(): Promise<SkillsResponse> {
  const response = await fetch("/api/auth/skills");

  if (!response.ok) {
    throw new Error("Failed to fetch skills");
  }

  return response.json();
}

export default function CreateUserForm({
  onSuccess,
  onCancel,
  defaultRole = "crew",
  editMode = false,
  initialData
}: CreateUserFormProps) {
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    editMode && initialData?.skills ? initialData.skills : []
  );
  const [customSkill, setCustomSkill] = useState("");
  const queryClient = useQueryClient();

  // Fetch available skills
  const { data: skillsData, isLoading: skillsLoading } = useQuery({
    queryKey: ["skills"],
    queryFn: getAvailableSkills,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Form setup
  const form = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: editMode && initialData ? {
      email: initialData.email || "",
      first_name: initialData.first_name || "",
      last_name: initialData.last_name || "",
      role: initialData.role || defaultRole as any,
      phone: initialData.phone || "",
      pin_code: initialData.pin_code || "",
      skills: initialData.skills || [],
      lang_pref: initialData.lang_pref || "de",
    } : {
      email: "",
      first_name: "",
      last_name: "",
      role: defaultRole as any,
      phone: "",
      pin_code: "",
      skills: [],
      lang_pref: "de",
    },
  });

  // Create/Update user mutation
  const userMutation = useMutation({
    mutationFn: editMode && initialData
      ? (data: CreateUserFormData) => updateUser(initialData.id, data)
      : createUser,
    onSuccess: (data) => {
      const actionText = editMode ? "updated" : "created";
      toast.success(`User ${actionText} successfully!`, {
        description: `${data.first_name} ${data.last_name} has been ${actionText}.`,
      });

      // Invalidate users query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["users"] });

      // Reset form only if creating
      if (!editMode) {
        form.reset();
        setSelectedSkills([]);
      }

      // Call success callback
      onSuccess?.(data);
    },
    onError: (error) => {
      const actionText = editMode ? "update" : "create";
      toast.error(`Failed to ${actionText} user`, {
        description: error.message,
      });
    },
  });

  // Handle form submission
  const onSubmit = async (data: CreateUserFormData) => {
    const formData = {
      ...data,
      skills: selectedSkills,
    };

    userMutation.mutate(formData);
  };

  // Handle skill selection
  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  // Add custom skill
  const addCustomSkill = () => {
    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
      setSelectedSkills(prev => [...prev, customSkill.trim()]);
      setCustomSkill("");
    }
  };

  // Remove skill
  const removeSkill = (skill: string) => {
    setSelectedSkills(prev => prev.filter(s => s !== skill));
  };

  const availableSkills = skillsData?.predefined_skills || [];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {editMode ? "Edit User" : "Create New User"}
        </CardTitle>
        <CardDescription>
          {editMode
            ? "Update user information, roles, and system access."
            : "Add a new user to the COMETA system. PIN codes will be automatically generated if not provided."
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter first name"
                          {...field}
                          disabled={userMutation.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter last name"
                          {...field}
                          disabled={userMutation.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address (Optional)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter email address"
                        {...field}
                        disabled={userMutation.isPending}
                      />
                    </FormControl>
                    <FormDescription>
                      Either email or phone number is required for login.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number (Optional)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="Enter phone number"
                        {...field}
                        disabled={userMutation.isPending}
                      />
                    </FormControl>
                    <FormDescription>
                      Either email or phone number is required for login.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* System Access */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Shield className="h-4 w-4" />
                System Access
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={userMutation.isPending}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select user role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="admin">Administrator</SelectItem>
                          <SelectItem value="pm">Project Manager</SelectItem>
                          <SelectItem value="bauleiter">Bauleiter</SelectItem>
                          <SelectItem value="foreman">Foreman</SelectItem>
                          <SelectItem value="crew">Field Worker</SelectItem>
                          <SelectItem value="viewer">Viewer (Read-only)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Determines what the user can access in the system.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pin_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Code className="h-4 w-4" />
                        PIN Code (Optional)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Leave empty for auto-generation"
                          maxLength={6}
                          {...field}
                          disabled={userMutation.isPending}
                        />
                      </FormControl>
                      <FormDescription>
                        4-6 digits. If empty, will be generated automatically.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="lang_pref"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Language Preference
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={userMutation.isPending}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full md:w-[200px]">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="de">German (Deutsch)</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ru">Russian (Русский)</SelectItem>
                        <SelectItem value="uz">Uzbek (O'zbek)</SelectItem>
                        <SelectItem value="tr">Turkish (Türkçe)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Skills */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Skills & Competencies</h3>

              {/* Selected Skills */}
              {selectedSkills.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Selected Skills:</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedSkills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="pr-1">
                        {skill}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-auto p-1 ml-1"
                          onClick={() => removeSkill(skill)}
                          disabled={userMutation.isPending}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Custom Skill */}
              <div>
                <Label className="text-sm font-medium">Add Custom Skill:</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Enter skill name"
                    value={customSkill}
                    onChange={(e) => setCustomSkill(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCustomSkill())}
                    disabled={userMutation.isPending}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addCustomSkill}
                    disabled={!customSkill.trim() || userMutation.isPending}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Predefined Skills */}
              {skillsLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading skills...
                </div>
              ) : (
                <div>
                  <Label className="text-sm font-medium">Select from predefined skills:</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-2 max-h-60 overflow-y-auto">
                    {availableSkills.map((skill) => (
                      <div key={skill} className="flex items-center space-x-2">
                        <Checkbox
                          id={skill}
                          checked={selectedSkills.includes(skill)}
                          onCheckedChange={() => toggleSkill(skill)}
                          disabled={userMutation.isPending}
                        />
                        <Label
                          htmlFor={skill}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {skill}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-6 border-t">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={userMutation.isPending}
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                disabled={userMutation.isPending}
                className="flex-1"
              >
                {userMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editMode ? "Updating User..." : "Creating User..."}
                  </>
                ) : (
                  editMode ? "Update User" : "Create User"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}