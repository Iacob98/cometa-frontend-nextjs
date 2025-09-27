import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Database schema validation system
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  tableName?: string;
  fieldName?: string;
}

export interface TableField {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default?: string;
}

export class SchemaValidator {
  private static cachedSchema: Map<string, TableField[]> = new Map();
  private static schemaLastUpdated: Date | null = null;
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Validate if a table exists in the database
   */
  static async validateTableExists(
    tableName: string
  ): Promise<ValidationResult> {
    try {
      const { data, error } = await supabase
        .from("information_schema.tables")
        .select("table_name")
        .eq("table_schema", "public")
        .eq("table_name", tableName)
        .limit(1);

      if (error) {
        return {
          isValid: false,
          errors: [`Database query error: ${error.message}`],
          warnings: [],
          tableName,
        };
      }

      const exists = data && data.length > 0;

      return {
        isValid: exists,
        errors: exists
          ? []
          : [`Table '${tableName}' does not exist in the database`],
        warnings: [],
        tableName,
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [`Validation error: ${error}`],
        warnings: [],
        tableName,
      };
    }
  }

  /**
   * Validate if a field exists in a specific table
   */
  static async validateFieldExists(
    tableName: string,
    fieldName: string
  ): Promise<ValidationResult> {
    try {
      // Check if table exists first
      const tableValidation = await this.validateTableExists(tableName);
      if (!tableValidation.isValid) {
        return tableValidation;
      }

      // Get table schema
      const tableFields = await this.getTableSchema(tableName);
      const fieldExists = tableFields.some(
        (field) => field.column_name === fieldName
      );

      return {
        isValid: fieldExists,
        errors: fieldExists
          ? []
          : [`Field '${fieldName}' does not exist in table '${tableName}'`],
        warnings: [],
        tableName,
        fieldName,
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [`Field validation error: ${error}`],
        warnings: [],
        tableName,
        fieldName,
      };
    }
  }

  /**
   * Get table schema from database or cache
   */
  static async getTableSchema(tableName: string): Promise<TableField[]> {
    // Check cache first
    const now = new Date();
    if (
      this.cachedSchema.has(tableName) &&
      this.schemaLastUpdated &&
      now.getTime() - this.schemaLastUpdated.getTime() < this.CACHE_DURATION
    ) {
      return this.cachedSchema.get(tableName)!;
    }

    // Fetch from database
    const { data, error } = await supabase
      .from("information_schema.columns")
      .select("column_name, data_type, is_nullable, column_default")
      .eq("table_schema", "public")
      .eq("table_name", tableName)
      .order("ordinal_position");

    if (error) {
      throw new Error(
        `Failed to fetch schema for table '${tableName}': ${error.message}`
      );
    }

    const fields = data || [];
    this.cachedSchema.set(tableName, fields);
    this.schemaLastUpdated = now;

    return fields;
  }

  /**
   * Validate a Supabase query before execution
   */
  static async validateQuery(
    tableName: string,
    selectFields: string[]
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Validate table exists
      const tableValidation = await this.validateTableExists(tableName);
      if (!tableValidation.isValid) {
        return tableValidation;
      }

      // Validate each field exists
      for (const field of selectFields) {
        // Skip complex field expressions (joins, functions, etc.)
        if (field.includes(":") || field.includes("(") || field.includes(".")) {
          warnings.push(
            `Skipping validation for complex field expression: '${field}'`
          );
          continue;
        }

        const fieldValidation = await this.validateFieldExists(
          tableName,
          field
        );
        if (!fieldValidation.isValid) {
          errors.push(...fieldValidation.errors);
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        tableName,
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [`Query validation error: ${error}`],
        warnings,
        tableName,
      };
    }
  }

  /**
   * Validate API route configuration
   */
  static async validateApiRoute(
    tableName: string,
    selectFields: string[],
    routePath: string
  ): Promise<ValidationResult> {
    const result = await this.validateQuery(tableName, selectFields);

    if (!result.isValid) {
      result.errors = result.errors.map((error) => `[${routePath}] ${error}`);
    }

    return result;
  }

  /**
   * Generate TypeScript types from database schema
   */
  static async generateTypeScript(tableName: string): Promise<string> {
    const fields = await this.getTableSchema(tableName);

    const interfaceName = tableName
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("");

    let typescript = `export interface ${interfaceName} {\n`;

    for (const field of fields) {
      const isOptional =
        field.is_nullable === "YES" || field.column_default !== null;
      const tsType = this.mapPostgresToTypeScript(field.data_type);

      typescript += `  ${field.column_name}${isOptional ? "?" : ""}: ${tsType};\n`;
    }

    typescript += "}\n";

    return typescript;
  }

  /**
   * Map PostgreSQL types to TypeScript types
   */
  private static mapPostgresToTypeScript(pgType: string): string {
    const typeMap: Record<string, string> = {
      uuid: "string",
      text: "string",
      "character varying": "string",
      boolean: "boolean",
      integer: "number",
      bigint: "number",
      numeric: "number",
      real: "number",
      "double precision": "number",
      date: "string",
      "timestamp without time zone": "string",
      "timestamp with time zone": "string",
      jsonb: "any",
      json: "any",
      inet: "string",
      "USER-DEFINED": "string", // for enums
    };

    return typeMap[pgType] || "unknown";
  }

  /**
   * Clear schema cache (useful for development)
   */
  static clearCache(): void {
    this.cachedSchema.clear();
    this.schemaLastUpdated = null;
  }

  /**
   * Get list of all tables in the database
   */
  static async getAllTables(): Promise<string[]> {
    const { data, error } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .order("table_name");

    if (error) {
      throw new Error(`Failed to fetch tables: ${error.message}`);
    }

    return (data || []).map((row) => row.table_name);
  }

  /**
   * Comprehensive validation report for all API routes
   */
  static async generateValidationReport(): Promise<{
    totalRoutes: number;
    validRoutes: number;
    invalidRoutes: number;
    errors: Array<{ route: string; errors: string[] }>;
    warnings: Array<{ route: string; warnings: string[] }>;
  }> {
    // This would be called by a validation script that scans all API routes
    return {
      totalRoutes: 0,
      validRoutes: 0,
      invalidRoutes: 0,
      errors: [],
      warnings: [],
    };
  }
}

// Helper function for API routes to validate their queries
export async function validateApiQuery(
  tableName: string,
  selectFields: string | string[],
  routePath: string
): Promise<void> {
  if (process.env.NODE_ENV === "development") {
    const fields =
      typeof selectFields === "string"
        ? selectFields.split(",").map((f) => f.trim())
        : selectFields;

    const result = await SchemaValidator.validateApiRoute(
      tableName,
      fields,
      routePath
    );

    if (!result.isValid) {
      console.error(
        `🚨 Schema Validation Error in ${routePath}:`,
        result.errors
      );
      // In development, we log but don't break the API
      // In production, you might want to throw an error
    }

    if (result.warnings.length > 0) {
      console.warn(
        `⚠️ Schema Validation Warnings in ${routePath}:`,
        result.warnings
      );
    }
  }
}

// Known good table configurations (for migration reference)
export const VALIDATED_TABLES = {
  activity_logs: [
    "id",
    "user_id",
    "activity_type",
    "description",
    "project_id",
    "entity_type",
    "entity_id",
    "extra_data",
    "ip_address",
    "user_agent",
    "created_at",
  ],
  crews: [
    "id",
    "project_id",
    "name",
    "foreman_user_id",
    "status",
    "description",
  ],
  crew_members: [
    "crew_id",
    "user_id",
    "role_in_crew",
    "active_from",
    "active_to",
  ],
  equipment: [
    "id",
    "type",
    "name",
    "inventory_no",
    "owned",
    "status",
    "purchase_price_eur",
    "rental_price_per_day_eur",
    "rental_price_per_hour_eur",
    "current_location",
  ],
  users: [
    "id",
    "first_name",
    "last_name",
    "phone",
    "email",
    "lang_pref",
    "role",
    "is_active",
    "skills",
    "pin_code",
  ],
  projects: [
    "id",
    "name",
    "customer",
    "city",
    "address",
    "contact_24h",
    "start_date",
    "end_date_plan",
    "status",
    "total_length_m",
    "base_rate_per_m",
    "pm_user_id",
    "language_default",
    "approved",
  ],
  vehicles: [
    "id",
    "plate_number",
    "type",
    "brand",
    "model",
    "owned",
    "status",
    "purchase_price_eur",
    "rental_price_per_day_eur",
    "rental_price_per_hour_eur",
    "fuel_consumption_l_100km",
    "current_location",
    "year_of_manufacture",
    "mileage",
    "vin",
  ],
  materials: [
    "id",
    "name",
    "unit",
    "sku",
    "description",
    "default_price_eur",
    "purchase_price_eur",
    "current_stock_qty",
  ],
  costs: [
    "id",
    "project_id",
    "cost_type",
    "ref_id",
    "date",
    "amount_eur",
    "description",
    "reference_type",
    "reference_id",
  ],
} as const;
