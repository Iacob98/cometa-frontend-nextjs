"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import {
  Map,
  MapPin,
  Navigation,
  Layers,
  Ruler,
  Globe,
  Settings,
  Download,
  Upload,
  Camera,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useProjects } from "@/hooks/use-projects";
import {
  useGeospatialFeatures,
  useGeoRoutes,
  useGeoLayers,
  useGeoMeasurements,
  useProjectGeospatialFeatures,
} from "@/hooks/use-geospatial";
import { usePhotosWithCoordinates, type PhotoFilters } from "@/hooks/use-photo-markers";
import { useAuth } from "@/hooks/use-auth";
import type { UUID } from "@/types";

// Dynamic import to avoid SSR issues
const ProjectMap = dynamic(() => import("@/components/maps/project-map"), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] bg-muted rounded-lg flex items-center justify-center">
      <div className="text-center">
        <Map className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Загрузка карты...</p>
      </div>
    </div>
  ),
});

export default function GeospatialPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<UUID | undefined>();
  const [activeTab, setActiveTab] = useState("map");
  const [photoFilters, setPhotoFilters] = useState<PhotoFilters>({
    label: 'all',
    dateFrom: undefined,
    dateTo: undefined,
  });
  const { user } = useAuth();

  // Data queries
  const { data: projects } = useProjects({ page: 1, per_page: 100 });
  const { data: allFeatures } = useGeospatialFeatures();
  const { data: allRoutes } = useGeoRoutes();
  const { data: allLayers } = useGeoLayers();
  const { data: allMeasurements } = useGeoMeasurements();
  const { data: projectFeatures } = useProjectGeospatialFeatures(
    selectedProjectId || ""
  );
  const { data: photosData } = usePhotosWithCoordinates(selectedProjectId, photoFilters);

  const getStatsForProject = (projectId?: UUID) => {
    if (!projectId) {
      return {
        features: allFeatures?.total || 0,
        routes: allRoutes?.total || 0,
        layers: allLayers?.total || 0,
        measurements: allMeasurements?.total || 0,
        photos: 0,
      };
    }

    return {
      features: projectFeatures?.total || 0,
      routes: 0,
      layers: 0,
      measurements: 0,
      photos: photosData?.total || 0,
    };
  };

  const stats = getStatsForProject(selectedProjectId);

  // Photo filter handlers
  const handlePhotoLabelChange = (value: string) => {
    setPhotoFilters(prev => ({
      ...prev,
      label: value as 'before' | 'during' | 'after' | 'all',
    }));
  };

  const handlePhotoDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoFilters(prev => ({
      ...prev,
      dateFrom: e.target.value || undefined,
    }));
  };

  const handlePhotoDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoFilters(prev => ({
      ...prev,
      dateTo: e.target.value || undefined,
    }));
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Геоданные</h2>
          <p className="text-muted-foreground">
            Интерактивные карты и управление геопространственными данными
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Импорт GIS
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Экспорт
          </Button>
          <Button>
            <Settings className="mr-2 h-4 w-4" />
            Настройки карты
          </Button>
        </div>
      </div>

      {/* Project Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Выбор проекта</CardTitle>
          <CardDescription>
            Выберите проект для просмотра геоданных или просмотрите все данные
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Select
                value={selectedProjectId || "all"}
                onValueChange={(value) =>
                  setSelectedProjectId(value === "all" ? undefined : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите проект" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все проекты</SelectItem>
                  {projects?.data?.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="secondary">
                <MapPin className="w-3 h-3 mr-1" />
                {stats.features} объектов
              </Badge>
              <Badge variant="secondary">
                <Navigation className="w-3 h-3 mr-1" />
                {stats.routes} маршрутов
              </Badge>
              <Badge variant="secondary">
                <Layers className="w-3 h-3 mr-1" />
                {stats.layers} слоёв
              </Badge>
              <Badge variant="secondary">
                <Ruler className="w-3 h-3 mr-1" />
                {stats.measurements} измерений
              </Badge>
              <Badge variant="secondary">
                <Camera className="w-3 h-3 mr-1" />
                {stats.photos} фото
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="map">
            <Map className="w-4 h-4 mr-2" />
            Карта
          </TabsTrigger>
          <TabsTrigger value="features">
            <MapPin className="w-4 h-4 mr-2" />
            Объекты
          </TabsTrigger>
          <TabsTrigger value="routes">
            <Navigation className="w-4 h-4 mr-2" />
            Маршруты
          </TabsTrigger>
          <TabsTrigger value="layers">
            <Layers className="w-4 h-4 mr-2" />
            Слои
          </TabsTrigger>
          <TabsTrigger value="measurements">
            <Ruler className="w-4 h-4 mr-2" />
            Измерения
          </TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="space-y-4">
          {/* Photo Filters Card */}
          {selectedProjectId && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Фильтры фото на карте
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 items-end">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Тип фото</Label>
                    <Select
                      value={photoFilters.label || 'all'}
                      onValueChange={handlePhotoLabelChange}
                    >
                      <SelectTrigger className="w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все типы</SelectItem>
                        <SelectItem value="before">До работ</SelectItem>
                        <SelectItem value="during">Во время</SelectItem>
                        <SelectItem value="after">После работ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Дата от</Label>
                    <Input
                      type="date"
                      value={photoFilters.dateFrom || ''}
                      onChange={handlePhotoDateFromChange}
                      className="w-[150px]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Дата до</Label>
                    <Input
                      type="date"
                      value={photoFilters.dateTo || ''}
                      onChange={handlePhotoDateToChange}
                      className="w-[150px]"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPhotoFilters({ label: 'all', dateFrom: undefined, dateTo: undefined })}
                  >
                    Сбросить
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Карта проекта</CardTitle>
              <CardDescription>
                Интерактивная карта с объектами, GPS-трекингом и инструментами измерения
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedProjectId ? (
                <ProjectMap
                  projectId={selectedProjectId}
                  height="600px"
                  showControls={true}
                  showMeasurementTools={user?.role === "admin" || user?.role === "pm"}
                  showGPSTracking={true}
                  showPhotos={true}
                  photoFilters={photoFilters}
                  defaultCenter={[52.52, 13.405]}
                  defaultZoom={13}
                />
              ) : (
                <div className="h-[600px] bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Globe className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Проект не выбран</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Выберите проект выше, чтобы просмотреть его геоданные на карте
                    </p>
                    <Button
                      onClick={() => {
                        if (projects?.data?.[0]) {
                          setSelectedProjectId(projects.data[0].id);
                        }
                      }}
                      disabled={!projects?.data?.length}
                    >
                      <Map className="w-4 h-4 mr-2" />
                      Открыть первый проект
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Геообъекты</CardTitle>
              <CardDescription>
                Управление точками, линиями и полигонами проектов
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Поиск объектов..."
                      className="w-64"
                    />
                    <Select defaultValue="all">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все типы</SelectItem>
                        <SelectItem value="point">Точки</SelectItem>
                        <SelectItem value="line">Линии</SelectItem>
                        <SelectItem value="polygon">Полигоны</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button>
                    <MapPin className="w-4 h-4 mr-2" />
                    Добавить объект
                  </Button>
                </div>

                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="w-8 h-8 mx-auto mb-2" />
                  <p>Объекты для выбранного проекта не найдены</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Маршруты</CardTitle>
              <CardDescription>
                Запланированные и оптимизированные маршруты работ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Поиск маршрутов..."
                      className="w-64"
                    />
                    <Select defaultValue="all">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все статусы</SelectItem>
                        <SelectItem value="planned">Запланирован</SelectItem>
                        <SelectItem value="active">Активен</SelectItem>
                        <SelectItem value="completed">Завершён</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button>
                    <Navigation className="w-4 h-4 mr-2" />
                    Создать маршрут
                  </Button>
                </div>

                <div className="text-center py-8 text-muted-foreground">
                  <Navigation className="w-8 h-8 mx-auto mb-2" />
                  <p>Маршруты для выбранного проекта не найдены</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="layers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Слои карты</CardTitle>
              <CardDescription>
                Организация геоданных в тематические слои
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Поиск слоёв..."
                      className="w-64"
                    />
                    <Select defaultValue="all">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все типы</SelectItem>
                        <SelectItem value="base">Базовый</SelectItem>
                        <SelectItem value="overlay">Накладка</SelectItem>
                        <SelectItem value="annotation">Аннотации</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button>
                    <Layers className="w-4 h-4 mr-2" />
                    Создать слой
                  </Button>
                </div>

                <div className="text-center py-8 text-muted-foreground">
                  <Layers className="w-8 h-8 mx-auto mb-2" />
                  <p>Слои для выбранного проекта не найдены</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="measurements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Измерения</CardTitle>
              <CardDescription>
                Измерения расстояний и площадей на карте
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Поиск измерений..."
                      className="w-64"
                    />
                    <Select defaultValue="all">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все типы</SelectItem>
                        <SelectItem value="distance">Расстояние</SelectItem>
                        <SelectItem value="area">Площадь</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button>
                    <Ruler className="w-4 h-4 mr-2" />
                    Новое измерение
                  </Button>
                </div>

                <div className="text-center py-8 text-muted-foreground">
                  <Ruler className="w-8 h-8 mx-auto mb-2" />
                  <p>Измерения для выбранного проекта не найдены</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}