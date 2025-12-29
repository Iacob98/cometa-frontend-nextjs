'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CheckCircle,
  Circle,
  AlertCircle,
  FileText,
  Users,
  Home,
  Truck,
  Package,
  MapPin,
  Phone,
  Building
} from 'lucide-react';
import { useProjectPreparation } from '@/hooks/use-project-preparation';
import ProjectOverview from '@/components/project-preparation/project-overview';
import UtilityContacts from '@/components/project-preparation/utility-contacts';
import ZoneLayout from '@/components/project-preparation/zone-layout';
import FacilitiesManagement from '@/components/project-preparation/facilities-management';
import HousingManagement from '@/components/project-preparation/housing-management';
import Houses from '@/components/project-preparation/houses';
import TeamAccess from '@/components/project-preparation/team-access';
import Resources from '@/components/project-preparation/resources';
import Materials from '@/components/project-preparation/materials';
import Readiness from '@/components/project-preparation/readiness';
import { cn } from '@/lib/utils';

// Safe component wrapper to catch runtime errors
const SafeComponent = ({ Component, projectId, stepName }: { Component: any, projectId: string, stepName: string }) => {
  try {
    if (!Component) {
      console.error(`Component ${stepName} is undefined`);
      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-lg font-medium text-red-800 mb-2">Компонент не найден</h3>
          <p className="text-red-600">Компонент {stepName} неправильно импортирован</p>
        </div>
      );
    }
    return <Component projectId={projectId} />;
  } catch (error) {
    console.error(`Error rendering ${stepName}:`, error);
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-medium text-yellow-800 mb-2">Ошибка компонента</h3>
        <p className="text-yellow-600">Ошибка отображения {stepName}</p>
        <p className="text-sm text-yellow-500 mt-2">{error?.toString()}</p>
      </div>
    );
  }
};

const PREPARATION_STEPS = [
  {
    id: 0,
    title: 'Создание проекта',
    description: 'Основная информация и настройка проекта',
    icon: FileText,
    component: ProjectOverview,
  },
  {
    id: 1,
    title: 'Планы и коммуникации',
    description: 'Контакты коммунальных служб и настройка связи',
    icon: Phone,
    component: UtilityContacts,
  },
  {
    id: 2,
    title: 'Разметка зон',
    description: 'Разметка зон и планирование материалов',
    icon: MapPin,
    component: ZoneLayout,
  },
  {
    id: 3,
    title: 'Объекты и жильё',
    description: 'Настройка объектов и жилищных условий',
    icon: Building,
    component: FacilitiesManagement,
  },
  {
    id: 4,
    title: 'Команды и доступ',
    description: 'Назначение команд и управление доступом',
    icon: Users,
    component: TeamAccess,
  },
  {
    id: 5,
    title: 'Ресурсы',
    description: 'Управление транспортом и оборудованием',
    icon: Truck,
    component: Resources,
  },
  {
    id: 6,
    title: 'Материалы',
    description: 'Распределение и заказ материалов',
    icon: Package,
    component: Materials,
  },
  {
    id: 7,
    title: 'Дома',
    description: 'Отслеживание подключения домов',
    icon: Home,
    component: Houses,
  },
  {
    id: 8,
    title: 'Готовность',
    description: 'Финальные проверки и активация',
    icon: CheckCircle,
    component: Readiness,
  },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'draft':
      return <Circle className="w-4 h-4 text-gray-400" />;
    case 'planning':
      return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    case 'active':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'waiting_invoice':
      return <AlertCircle className="w-4 h-4 text-blue-500" />;
    case 'closed':
      return <CheckCircle className="w-4 h-4 text-gray-500" />;
    default:
      return <Circle className="w-4 h-4 text-gray-400" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'draft':
      return 'bg-gray-100 text-gray-800';
    case 'planning':
      return 'bg-yellow-100 text-yellow-800';
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'waiting_invoice':
      return 'bg-blue-100 text-blue-800';
    case 'closed':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

interface ProjectPreparationTabProps {
  projectId: string;
}

export default function ProjectPreparationTab({ projectId }: ProjectPreparationTabProps) {
  const [activeStep, setActiveStep] = useState(0);
  const { data: preparation, isLoading, error } = useProjectPreparation(projectId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error || !preparation) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">Ошибка загрузки проекта</h3>
            <p className="text-gray-600">
              {error?.message || 'Не удалось загрузить данные подготовки проекта'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { project, potential_revenue, preparation_progress, steps_summary } = preparation;

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Прогресс подготовки</p>
                <p className="text-2xl font-bold">{preparation_progress}%</p>
                <Progress value={preparation_progress} className="mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Общая длина</p>
                <p className="text-2xl font-bold">{(project.total_length_m || 0).toLocaleString()} м</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Truck className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Базовая ставка</p>
                <p className="text-2xl font-bold">€{project.base_rate_per_m}/м</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Потенциальный доход</p>
                <p className="text-2xl font-bold">€{(potential_revenue || 0).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Step Navigation */}
      <Card>
        <CardHeader>
          <CardTitle>Шаги подготовки</CardTitle>
          <CardDescription>
            Завершите каждый шаг для подготовки проекта к активации
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-9 gap-2">
            {PREPARATION_STEPS.map((step) => {
              const Icon = step.icon;
              const isCompleted = getStepCompletionStatus(step.id, steps_summary);
              const isActive = activeStep === step.id;

              return (
                <Button
                  key={step.id}
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  className={cn(
                    'flex flex-col items-center p-3 h-auto',
                    isCompleted && 'bg-green-50 border-green-200',
                    isActive && 'ring-2 ring-blue-500'
                  )}
                  onClick={() => setActiveStep(step.id)}
                >
                  <Icon className={cn(
                    'w-5 h-5 mb-1',
                    isCompleted ? 'text-green-600' : 'text-current'
                  )} />
                  <span className="text-xs">{step.id}</span>
                  {isCompleted && (
                    <CheckCircle className="w-3 h-3 text-green-600 mt-1" />
                  )}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            {(() => {
              const step = PREPARATION_STEPS[activeStep];
              const Icon = step.icon;
              return <Icon className="w-6 h-6" />;
            })()}
            <div>
              <CardTitle>
                Шаг {activeStep}: {PREPARATION_STEPS[activeStep].title}
              </CardTitle>
              <CardDescription>
                {PREPARATION_STEPS[activeStep].description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {(() => {
            const step = PREPARATION_STEPS[activeStep];
            const Component = step.component;

            console.log('Debug: Active step:', activeStep, 'Component:', Component, 'Step:', step);

            return <SafeComponent
              Component={Component}
              projectId={projectId}
              stepName={step.title}
            />;
          })()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
          disabled={activeStep === 0}
        >
          Предыдущий шаг
        </Button>
        <Button
          onClick={() => setActiveStep(Math.min(PREPARATION_STEPS.length - 1, activeStep + 1))}
          disabled={activeStep === PREPARATION_STEPS.length - 1}
        >
          Следующий шаг
        </Button>
      </div>
    </div>
  );
}

function getStepCompletionStatus(stepId: number, summary: any): boolean {
  // Safe fallback if summary is undefined or null
  if (!summary) return false;

  switch (stepId) {
    case 0: // Project Creation - always completed if we can see this page
      return true;
    case 1: // Plans & Communications
      return (summary.utility_contacts || 0) > 0;
    case 2: // Zone Layout
      return (summary.cabinets || 0) > 0;
    case 3: // Facilities & Housing
      return (summary.facilities || 0) > 0 || (summary.housing_units || 0) > 0;
    case 4: // Teams & Access
      return (summary.crews || 0) > 0;
    case 5: // Resources
      return (summary.equipment || 0) > 0;
    case 6: // Materials
      return (summary.materials || 0) > 0;
    case 7: // Houses
      return false; // TODO: Implement proper check
    case 8: // Readiness
      return false; // TODO: Implement proper check
    default:
      return false;
  }
}