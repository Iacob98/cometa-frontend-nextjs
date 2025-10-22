"use client";

import { Home, MapPin, User, Phone, Mail, Calendar, Building2, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface HouseInfoCardProps {
  house: {
    id: string;
    project_id: string;
    street?: string | null;
    city?: string | null;
    postal_code?: string | null;
    house_number?: string | null;
    apartment_count?: number | null;
    floor_count?: number | null;
    connection_type?: string | null;
    method?: string | null;
    house_type?: string | null;
    status?: string | null;
    planned_connection_date?: string | null;
    actual_connection_date?: string | null;
    owner_first_name?: string | null;
    owner_last_name?: string | null;
    owner_phone?: string | null;
    contact_email?: string | null;
    notes?: string | null;
    project?: {
      id: string;
      name: string;
      customer?: string | null;
      status?: string | null;
      start_date?: string | null;
      end_date?: string | null;
    };
  };
}

export function HouseInfoCard({ house }: HouseInfoCardProps) {
  const getStatusBadgeVariant = (status: string | null | undefined) => {
    switch (status) {
      case "finished":
      case "completed":
        return "default";
      case "started":
      case "in_progress":
        return "secondary";
      case "created":
      case "pending":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getStatusLabel = (status: string | null | undefined) => {
    switch (status) {
      case "finished":
        return "Finished";
      case "started":
        return "Started";
      case "created":
        return "Created";
      default:
        return status || "Unknown";
    }
  };

  // Format address
  const fullAddress = [
    house.street,
    house.house_number && `#${house.house_number}`,
    house.postal_code && house.city && `${house.postal_code} ${house.city}`,
  ]
    .filter(Boolean)
    .join(", ");

  // Format owner name
  const ownerName = [house.owner_first_name, house.owner_last_name]
    .filter(Boolean)
    .join(" ") || "—";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Home className="h-5 w-5" />
            <span>House Connection</span>
          </CardTitle>
          {house.status && (
            <Badge variant={getStatusBadgeVariant(house.status)}>
              {getStatusLabel(house.status)}
            </Badge>
          )}
        </div>
        <CardDescription>
          House connection work details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Address */}
        <div>
          <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            Address
          </label>
          <p className="font-medium">{fullAddress || "—"}</p>
        </div>

        {/* Project Information */}
        {house.project && (
          <>
            <Separator />
            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                Project
              </label>
              <p className="font-medium">{house.project.name}</p>
              {house.project.customer && (
                <p className="text-sm text-muted-foreground">{house.project.customer}</p>
              )}
            </div>
          </>
        )}

        {/* Building Info */}
        <Separator />
        <div className="grid grid-cols-2 gap-4">
          {house.apartment_count !== null && house.apartment_count !== undefined && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Apartments</label>
              <p className="font-medium">{house.apartment_count}</p>
            </div>
          )}
          {house.floor_count !== null && house.floor_count !== undefined && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Floors</label>
              <p className="font-medium">{house.floor_count}</p>
            </div>
          )}
        </div>

        {/* Connection Details */}
        {(house.connection_type || house.method) && (
          <>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              {house.connection_type && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Connection Type</label>
                  <p className="font-medium">{house.connection_type}</p>
                </div>
              )}
              {house.method && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Method</label>
                  <p className="font-medium">{house.method}</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Dates */}
        {(house.planned_connection_date || house.actual_connection_date) && (
          <>
            <Separator />
            <div className="space-y-2">
              {house.planned_connection_date && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Planned Date
                  </label>
                  <p className="font-medium">
                    {new Date(house.planned_connection_date).toLocaleDateString()}
                  </p>
                </div>
              )}
              {house.actual_connection_date && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Actual Date
                  </label>
                  <p className="font-medium">
                    {new Date(house.actual_connection_date).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Owner Contact */}
        {(ownerName !== "—" || house.owner_phone || house.contact_email) && (
          <>
            <Separator />
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <User className="h-3 w-3" />
                Owner Contact
              </label>
              {ownerName !== "—" && <p className="font-medium">{ownerName}</p>}
              {house.owner_phone && (
                <p className="text-sm flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {house.owner_phone}
                </p>
              )}
              {house.contact_email && (
                <p className="text-sm flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {house.contact_email}
                </p>
              )}
            </div>
          </>
        )}

        {/* Notes */}
        {house.notes && (
          <>
            <Separator />
            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Info className="h-3 w-3" />
                Notes
              </label>
              <p className="text-sm text-muted-foreground">{house.notes}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
