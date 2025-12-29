'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, CheckCircle, Euro, MapPin, Calendar, User } from 'lucide-react';
import { useProjectPreparation, useUpdateProjectStatus } from '@/hooks/use-project-preparation';
import { toast } from 'sonner';

interface ProjectOverviewProps {
  projectId: string;
}

export default function ProjectOverview({ projectId }: ProjectOverviewProps) {
  const { data: preparation, isLoading } = useProjectPreparation(projectId);
  const updateStatusMutation = useUpdateProjectStatus();
  const [showStatusForm, setShowStatusForm] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [reason, setReason] = useState('');

  if (isLoading || !preparation) {
    return <div>Загрузка информации о проекте...</div>;
  }

  const { project, potential_revenue } = preparation;

  const handleStatusChange = async () => {
    if (!newStatus) {
      toast.error('Пожалуйста, выберите статус');
      return;
    }

    try {
      await updateStatusMutation.mutateAsync({
        project_id: projectId,
        status: newStatus,
        reason,
      });
      setShowStatusForm(false);
      setNewStatus('');
      setReason('');
    } catch (error) {
      // Error is handled by the mutation
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'waiting_invoice':
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Основная информация о проекте
          </CardTitle>
          <CardDescription>
            Основные данные проекта и контактная информация
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Название проекта</Label>
              <p className="text-lg font-semibold">{project.name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Заказчик</Label>
              <p className="text-lg">{project.customer || 'Не указано'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Город</Label>
              <p className="text-lg">{project.city || 'Не указано'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Адрес</Label>
              <p className="text-lg">{project.address || 'Не указано'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Круглосуточный контакт</Label>
              <p className="text-lg">{project.contact_24h || 'Не указано'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Менеджер проекта</Label>
              <p className="text-lg">
                {project.manager_name || project.manager?.full_name || 'Не назначен'}
                {!(project.manager_name || project.manager?.full_name) && (
                  <span className="text-red-500 ml-2">Менеджер не назначен</span>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Planning and Revenue */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Euro className="w-5 h-5" />
            Планирование и доход
          </CardTitle>
          <CardDescription>
            Сроки проекта и расчёт потенциального дохода
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Дата начала
              </Label>
              <p className="text-lg">{project.start_date || 'Не установлено'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Плановая дата окончания
              </Label>
              <p className="text-lg">{project.end_date_plan || 'Не установлено'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Общая длина</Label>
              <p className="text-lg font-semibold">{(project.total_length_m || 0).toLocaleString()} м</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Базовая ставка за метр</Label>
              <p className="text-lg font-semibold">€{(project.base_rate_per_m || 0).toLocaleString()}/м</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Потенциальный доход</Label>
              <p className="text-2xl font-bold text-green-600">
                €{(potential_revenue || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(project.status)}
            Управление статусом проекта
          </CardTitle>
          <CardDescription>
            Текущий статус и управление изменением статуса
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Текущий статус</Label>
              <div className="flex items-center gap-2 mt-1">
                {getStatusIcon(project.status)}
                <Badge className={getStatusColor(project.status)}>
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </Badge>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowStatusForm(!showStatusForm)}
            >
              Изменить статус
            </Button>
          </div>

          {showStatusForm && (
            <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
              <div>
                <Label htmlFor="new-status">Новый статус</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите новый статус" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Черновик</SelectItem>
                    <SelectItem value="planning">Планирование</SelectItem>
                    <SelectItem value="active">Активный</SelectItem>
                    <SelectItem value="waiting_invoice">Ожидание счёта</SelectItem>
                    <SelectItem value="closed">Закрыт</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="reason">Причина изменения</Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Опишите причину изменения статуса..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleStatusChange}
                  disabled={updateStatusMutation.isPending}
                >
                  Сохранить статус
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowStatusForm(false);
                    setNewStatus('');
                    setReason('');
                  }}
                >
                  Отмена
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}