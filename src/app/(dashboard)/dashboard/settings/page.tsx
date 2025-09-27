"use client";

import { useState } from "react";
import { Plus, Users, Settings as SettingsIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


export default function SettingsPage() {

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <SettingsIcon className="h-8 w-8" />
            Settings
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage system settings and user accounts
          </p>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            User Management
          </TabsTrigger>
          <TabsTrigger value="system">System Settings</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                User management has been moved to the Teams page for better workflow integration.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">User Management</h3>
                <p className="text-muted-foreground mb-4">
                  Create and manage user accounts from the Teams page where you can assign roles and manage team members.
                </p>
                <Button onClick={() => window.location.href = '/dashboard/teams'}>
                  <Users className="mr-2 h-4 w-4" />
                  Go to Teams Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Configure global system preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">System settings will be available here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Manage notification preferences and alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Notification settings will be available here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}