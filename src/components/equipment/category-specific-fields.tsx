"use client";

import { UseFormReturn } from "react-hook-form";
import type { EquipmentCategory } from "@/types";
import { PowerToolFields } from "./fields/power-tool-fields";
import { FusionSplicerFields } from "./fields/fusion-splicer-fields";
import { OTDRFields } from "./fields/otdr-fields";
import { SafetyGearFields } from "./fields/safety-gear-fields";
import { VehicleEquipmentFields } from "./fields/vehicle-equipment-fields";
import { MeasuringDeviceFields } from "./fields/measuring-device-fields";
import { AccessoryFields } from "./fields/accessory-fields";

interface CategorySpecificFieldsProps {
  category: EquipmentCategory | undefined;
  form: UseFormReturn<any>;
}

export function CategorySpecificFields({ category, form }: CategorySpecificFieldsProps) {
  if (!category) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <p>Select a category to see category-specific fields</p>
      </div>
    );
  }

  switch (category) {
    case "power_tool":
      return <PowerToolFields form={form} />;
    case "fusion_splicer":
      return <FusionSplicerFields form={form} />;
    case "otdr":
      return <OTDRFields form={form} />;
    case "safety_gear":
      return <SafetyGearFields form={form} />;
    case "vehicle":
      return <VehicleEquipmentFields form={form} />;
    case "measuring_device":
      return <MeasuringDeviceFields form={form} />;
    case "accessory":
      return <AccessoryFields form={form} />;
    default:
      return null;
  }
}
