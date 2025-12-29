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
            Настройки
          </h1>
          <p className="text-muted-foreground mt-2">
            Управление системными настройками и учётными записями
          </p>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Управление пользователями
          </TabsTrigger>
          <TabsTrigger value="system">Системные настройки</TabsTrigger>
          <TabsTrigger value="notifications">Уведомления</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Управление пользователями</CardTitle>
              <CardDescription>
                Управление пользователями перенесено на страницу Команды для удобства работы.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Управление пользователями</h3>
                <p className="text-muted-foreground mb-4">
                  Создавайте и управляйте учётными записями на странице Команды, где вы можете назначать роли и управлять участниками.
                </p>
                <Button onClick={() => window.location.href = '/dashboard/teams'}>
                  <Users className="mr-2 h-4 w-4" />
                  Перейти к Командам
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>Системные настройки</CardTitle>
              <CardDescription>
                Настройка глобальных параметров системы
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Системные настройки будут доступны здесь.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Настройки уведомлений</CardTitle>
              <CardDescription>
                Управление настройками уведомлений и оповещений
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Настройки уведомлений будут доступны здесь.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}