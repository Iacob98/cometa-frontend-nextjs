"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Users, Save, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useUsers } from "@/hooks/use-users";
import { useCreateCrew } from "@/hooks/use-teams";
import { useProjects } from "@/hooks/use-projects";

// Validation schema for creating teams
const createTeamSchema = z.object({
  name: z.string().min(1, "Название команды обязательно"),
  description: z.string().optional(),
  foreman_user_id: z.string().optional(),
  project_id: z.string().optional(),
});

type CreateTeamFormData = z.infer<typeof createTeamSchema>;

export default function NewTeamPage() {
  const router = useRouter();
  const createCrew = useCreateCrew();

  const createTeamForm = useForm<CreateTeamFormData>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      name: "",
      description: "",
      foreman_user_id: "",
      project_id: "",
    },
  });

  const { data: usersResponse, isLoading: usersLoading } = useUsers({
    page: 1,
    per_page: 100
  });
  const { data: projectsResponse, isLoading: projectsLoading } = useProjects({
    page: 1,
    per_page: 50
  });

  const users = usersResponse?.items || [];
  const projects = projectsResponse?.items || [];

  // Filter users by role for foreman selection
  const foremen = users.filter(user => ["foreman", "pm", "admin"].includes(user.role));

  const handleCreateTeam = async (data: CreateTeamFormData) => {
    try {
      const teamData = {
        name: data.name,
        description: data.description,
        foreman_user_id: data.foreman_user_id === "none" ? undefined : data.foreman_user_id,
        project_id: data.project_id === "none" ? undefined : data.project_id,
      };

      const createdTeam = await createCrew.mutateAsync(teamData);

      // Redirect to team members management page after successful creation
      router.push(`/dashboard/teams/${createdTeam.id}/members`);
    } catch (error) {
      console.error("Failed to create team:", error);
      // If members page doesn't exist yet, fallback to teams list
      router.push("/dashboard/teams");
    }
  };

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
            <span>Назад</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Создать команду</h1>
            <p className="text-muted-foreground">
              Создайте новую рабочую бригаду с базовой информацией
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Team Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Информация о команде</span>
            </CardTitle>
            <CardDescription>
              Основная информация о команде и назначение руководителя
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...createTeamForm}>
              <form onSubmit={createTeamForm.handleSubmit(handleCreateTeam)} className="space-y-4">
                <FormField
                  control={createTeamForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Название команды *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="напр., Монтажная бригада Альфа"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createTeamForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Описание</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Краткое описание назначения и обязанностей команды"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createTeamForm.control}
                  name="foreman_user_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Руководитель команды / Бригадир</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите руководителя" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Руководитель не назначен</SelectItem>
                          {foremen.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.full_name} ({user.role})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createTeamForm.control}
                  name="project_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Назначить на проект</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите проект (необязательно)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Проект не назначен</SelectItem>
                          {projectsLoading ? (
                            <SelectItem value="loading" disabled>Загрузка проектов...</SelectItem>
                          ) : (
                            projects.map((project) => (
                              <SelectItem key={project.id} value={project.id}>
                                {project.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Отмена
                  </Button>
                  <Button type="submit" disabled={createCrew.isPending}>
                    {createCrew.isPending ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Создать команду
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}