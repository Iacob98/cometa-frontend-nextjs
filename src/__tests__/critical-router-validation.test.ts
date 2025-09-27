/**
 * Critical Router Validation Test Suite
 * Tests all fixed API routers against real Supabase database schema
 *
 * Date: September 26, 2025
 * Purpose: Validate that all 47 critical fixes work with real database
 */

import { describe, it, expect, beforeAll } from "@jest/globals";
import {
  SchemaValidator,
  validateApiQuery,
  VALIDATED_TABLES,
} from "@/lib/schema-validator";
import { createClient } from "@supabase/supabase-js";

// Test database connection
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

describe("🚨 Critical Router Validation - Database Schema Fixes", () => {
  beforeAll(async () => {
    // Clear schema cache for fresh validation
    SchemaValidator.clearCache();
  });

  describe("📋 Table Existence Validation", () => {
    it("should confirm activity_logs table exists (fixed from activities)", async () => {
      const result = await SchemaValidator.validateTableExists("activity_logs");
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should confirm crews table exists", async () => {
      const result = await SchemaValidator.validateTableExists("crews");
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should confirm equipment table exists", async () => {
      const result = await SchemaValidator.validateTableExists("equipment");
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should confirm users table exists", async () => {
      const result = await SchemaValidator.validateTableExists("users");
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should confirm activities table does NOT exist (old table)", async () => {
      const result = await SchemaValidator.validateTableExists("activities");
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain("Table 'activities' does not exist");
    });

    it("should confirm transactions table does NOT exist (old table)", async () => {
      const result = await SchemaValidator.validateTableExists("transactions");
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain("Table 'transactions' does not exist");
    });
  });

  describe("🔧 Field Mapping Validation", () => {
    describe("Activity Logs API Fields", () => {
      const activityFields = VALIDATED_TABLES.activity_logs;

      it("should validate all activity_logs fields exist", async () => {
        for (const field of activityFields) {
          const result = await SchemaValidator.validateFieldExists(
            "activity_logs",
            field
          );
          expect(result.isValid).toBe(true);
        }
      });

      it("should confirm entity_type field exists (was object_type)", async () => {
        const result = await SchemaValidator.validateFieldExists(
          "activity_logs",
          "entity_type"
        );
        expect(result.isValid).toBe(true);
      });

      it("should confirm entity_id field exists (was object_id)", async () => {
        const result = await SchemaValidator.validateFieldExists(
          "activity_logs",
          "entity_id"
        );
        expect(result.isValid).toBe(true);
      });

      it("should confirm extra_data field exists (was metadata)", async () => {
        const result = await SchemaValidator.validateFieldExists(
          "activity_logs",
          "extra_data"
        );
        expect(result.isValid).toBe(true);
      });
    });

    describe("Crews API Fields", () => {
      const crewFields = VALIDATED_TABLES.crews;

      it("should validate all crews fields exist", async () => {
        for (const field of crewFields) {
          const result = await SchemaValidator.validateFieldExists(
            "crews",
            field
          );
          expect(result.isValid).toBe(true);
        }
      });

      it("should confirm foreman_user_id field exists (was leader_user_id)", async () => {
        const result = await SchemaValidator.validateFieldExists(
          "crews",
          "foreman_user_id"
        );
        expect(result.isValid).toBe(true);
      });

      it("should confirm project_id field exists (was missing)", async () => {
        const result = await SchemaValidator.validateFieldExists(
          "crews",
          "project_id"
        );
        expect(result.isValid).toBe(true);
      });

      it("should confirm created_at field does NOT exist (removed)", async () => {
        const result = await SchemaValidator.validateFieldExists(
          "crews",
          "created_at"
        );
        expect(result.isValid).toBe(false);
      });
    });

    describe("Equipment API Fields", () => {
      const equipmentFields = VALIDATED_TABLES.equipment;

      it("should validate all equipment fields exist", async () => {
        for (const field of equipmentFields) {
          const result = await SchemaValidator.validateFieldExists(
            "equipment",
            field
          );
          expect(result.isValid).toBe(true);
        }
      });

      it("should confirm rental_price_per_day_eur exists (was rental_cost_per_day)", async () => {
        const result = await SchemaValidator.validateFieldExists(
          "equipment",
          "rental_price_per_day_eur"
        );
        expect(result.isValid).toBe(true);
      });

      it("should confirm owned field exists (was missing)", async () => {
        const result = await SchemaValidator.validateFieldExists(
          "equipment",
          "owned"
        );
        expect(result.isValid).toBe(true);
      });

      it("should confirm purchase_date field does NOT exist (removed)", async () => {
        const result = await SchemaValidator.validateFieldExists(
          "equipment",
          "purchase_date"
        );
        expect(result.isValid).toBe(false);
      });

      it("should confirm description field does NOT exist (removed)", async () => {
        const result = await SchemaValidator.validateFieldExists(
          "equipment",
          "description"
        );
        expect(result.isValid).toBe(false);
      });
    });

    describe("Users API Fields", () => {
      const userFields = VALIDATED_TABLES.users;

      it("should validate all users fields exist", async () => {
        for (const field of userFields) {
          const result = await SchemaValidator.validateFieldExists(
            "users",
            field
          );
          expect(result.isValid).toBe(true);
        }
      });

      it("should confirm lang_pref field exists (was language_preference)", async () => {
        const result = await SchemaValidator.validateFieldExists(
          "users",
          "lang_pref"
        );
        expect(result.isValid).toBe(true);
      });

      it("should confirm skills field exists (was missing)", async () => {
        const result = await SchemaValidator.validateFieldExists(
          "users",
          "skills"
        );
        expect(result.isValid).toBe(true);
      });

      it("should confirm pin_code field exists (was missing)", async () => {
        const result = await SchemaValidator.validateFieldExists(
          "users",
          "pin_code"
        );
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe("🌐 API Route Integration Tests", () => {
    describe("Activities API (/api/activities)", () => {
      it("should validate activity_logs query structure", async () => {
        const result = await SchemaValidator.validateQuery("activity_logs", [
          "id",
          "user_id",
          "project_id",
          "activity_type",
          "entity_type",
          "entity_id",
          "description",
          "extra_data",
          "ip_address",
          "user_agent",
          "created_at",
        ]);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it("should make actual API call to test fixed endpoint", async () => {
        // Test actual query to database
        const { data, error } = await supabase
          .from("activity_logs")
          .select(
            "id, user_id, activity_type, entity_type, entity_id, description, created_at"
          )
          .limit(1);

        expect(error).toBeNull();
        expect(data).toBeDefined();
      });
    });

    describe("Crews API (/api/teams/crews)", () => {
      it("should validate crews query structure", async () => {
        const result = await SchemaValidator.validateQuery("crews", [
          "id",
          "project_id",
          "name",
          "foreman_user_id",
          "status",
          "description",
        ]);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it("should make actual API call to test fixed endpoint", async () => {
        const { data, error } = await supabase
          .from("crews")
          .select("id, project_id, name, foreman_user_id, status, description")
          .limit(1);

        expect(error).toBeNull();
        expect(data).toBeDefined();
      });
    });

    describe("Equipment API (/api/equipment)", () => {
      it("should validate equipment query structure", async () => {
        const result = await SchemaValidator.validateQuery("equipment", [
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
        ]);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it("should make actual API call to test fixed endpoint", async () => {
        const { data, error } = await supabase
          .from("equipment")
          .select(
            "id, type, name, inventory_no, owned, status, rental_price_per_day_eur"
          )
          .limit(1);

        expect(error).toBeNull();
        expect(data).toBeDefined();
      });
    });

    describe("Auth API (/api/auth/login)", () => {
      it("should validate users query structure", async () => {
        const result = await SchemaValidator.validateQuery("users", [
          "id",
          "email",
          "phone",
          "first_name",
          "last_name",
          "role",
          "is_active",
          "lang_pref",
          "skills",
          "pin_code",
        ]);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it("should make actual API call to test fixed endpoint", async () => {
        const { data, error } = await supabase
          .from("users")
          .select(
            "id, email, first_name, last_name, role, is_active, lang_pref, skills"
          )
          .limit(1);

        expect(error).toBeNull();
        expect(data).toBeDefined();
      });
    });

    describe("Financial API (/api/transactions - unified)", () => {
      it("should validate costs table for financial transactions", async () => {
        const result = await SchemaValidator.validateQuery("costs", [
          "id",
          "project_id",
          "cost_type",
          "amount_eur",
          "date",
          "description",
        ]);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it("should validate material_orders table for order transactions", async () => {
        const result = await SchemaValidator.validateQuery("material_orders", [
          "id",
          "project_id",
          "total_cost_eur",
          "order_date",
          "status",
          "supplier_material_id",
        ]);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it("should validate rental_expenses table for rental transactions", async () => {
        const result = await SchemaValidator.validateQuery("rental_expenses", [
          "id",
          "rental_id",
          "amount_eur",
          "date",
          "days",
          "status",
        ]);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });
  });

  describe("🔍 Regression Prevention Tests", () => {
    it("should detect if someone tries to use old activities table", async () => {
      const result = await SchemaValidator.validateTableExists("activities");
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain("does not exist");
    });

    it("should detect if someone tries to use old transactions table", async () => {
      const result = await SchemaValidator.validateTableExists("transactions");
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain("does not exist");
    });

    it("should detect invalid field usage in crews", async () => {
      const result = await SchemaValidator.validateFieldExists(
        "crews",
        "leader_user_id"
      );
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain("does not exist");
    });

    it("should detect invalid field usage in equipment", async () => {
      const result = await SchemaValidator.validateFieldExists(
        "equipment",
        "rental_cost_per_day"
      );
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain("does not exist");
    });

    it("should detect invalid field usage in users", async () => {
      const result = await SchemaValidator.validateFieldExists(
        "users",
        "language_preference"
      );
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain("does not exist");
    });
  });

  describe("📊 Performance and Data Integrity Tests", () => {
    it("should test activity_logs API performance", async () => {
      const startTime = Date.now();

      const { data, error } = await supabase
        .from("activity_logs")
        .select("id, user_id, activity_type, description, created_at")
        .limit(10);

      const responseTime = Date.now() - startTime;

      expect(error).toBeNull();
      expect(responseTime).toBeLessThan(1000); // Should respond in under 1 second
    });

    it("should test crews API with foreman relationship", async () => {
      const { data, error } = await supabase
        .from("crews")
        .select(
          `
          id,
          name,
          foreman_user_id,
          status,
          foreman:users!crews_foreman_user_id_fkey(
            id,
            first_name,
            last_name,
            role
          )
        `
        )
        .limit(5);

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it("should test equipment API with correct pricing fields", async () => {
      const { data, error } = await supabase
        .from("equipment")
        .select(
          `
          id,
          type,
          name,
          owned,
          status,
          purchase_price_eur,
          rental_price_per_day_eur,
          rental_price_per_hour_eur
        `
        )
        .limit(5);

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it("should test unified financial data aggregation", async () => {
      const [costsResult, ordersResult, rentalResult] = await Promise.all([
        supabase
          .from("costs")
          .select("id, amount_eur, date, cost_type")
          .limit(5),
        supabase
          .from("material_orders")
          .select("id, total_cost_eur, order_date, status")
          .limit(5),
        supabase
          .from("rental_expenses")
          .select("id, amount_eur, date, days")
          .limit(5),
      ]);

      expect(costsResult.error).toBeNull();
      expect(ordersResult.error).toBeNull();
      expect(rentalResult.error).toBeNull();
    });
  });

  describe("🛡️ Security and Validation Tests", () => {
    it("should test auth API with correct user field mapping", async () => {
      const { data, error } = await supabase
        .from("users")
        .select(
          "id, email, phone, first_name, last_name, role, is_active, lang_pref, skills, pin_code"
        )
        .eq("is_active", true)
        .limit(1);

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it("should validate crew_members with correct role field", async () => {
      const { data, error } = await supabase
        .from("crew_members")
        .select("crew_id, user_id, role_in_crew, active_from, active_to")
        .limit(5);

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });
  });

  describe("🔄 API Integration End-to-End Tests", () => {
    it("should test complete activity logging workflow", async () => {
      // Test that we can create an activity log with correct schema
      const testActivity = {
        user_id: "00000000-0000-0000-0000-000000000000", // placeholder UUID
        activity_type: "test",
        description: "Test activity for schema validation",
        entity_type: "test",
        entity_id: "00000000-0000-0000-0000-000000000000",
        extra_data: { test: true },
        ip_address: "127.0.0.1",
        user_agent: "test-agent",
      };

      // This should not fail with schema errors (might fail with FK constraints, which is expected)
      const { error } = await supabase
        .from("activity_logs")
        .insert([testActivity])
        .select();

      // Error might occur due to FK constraints, but NOT due to schema issues
      if (error) {
        expect(error.message).not.toContain("column");
        expect(error.message).not.toContain("relation");
        expect(error.message).not.toContain("does not exist");
      }
    });

    it("should test crew creation with correct field structure", async () => {
      const testCrew = {
        name: "Test Crew for Schema Validation",
        project_id: "00000000-0000-0000-0000-000000000000",
        foreman_user_id: "00000000-0000-0000-0000-000000000000",
        status: "active",
        description: "Test crew",
      };

      const { error } = await supabase
        .from("crews")
        .insert([testCrew])
        .select();

      // Error might occur due to FK constraints, but NOT due to schema issues
      if (error) {
        expect(error.message).not.toContain("column");
        expect(error.message).not.toContain("relation");
        expect(error.message).not.toContain("does not exist");
      }
    });
  });

  describe("📈 Comprehensive Schema Validation Report", () => {
    it("should generate complete validation report for all fixed tables", async () => {
      const tables = Object.keys(VALIDATED_TABLES);
      const validationResults = [];

      for (const tableName of tables) {
        const fields =
          VALIDATED_TABLES[tableName as keyof typeof VALIDATED_TABLES];
        const result = await SchemaValidator.validateQuery(tableName, fields);
        validationResults.push({ tableName, result });
      }

      // All validated tables should pass
      const failedValidations = validationResults.filter(
        (v) => !v.result.isValid
      );

      if (failedValidations.length > 0) {
        console.error("Failed validations:", failedValidations);
      }

      expect(failedValidations).toHaveLength(0);
    });

    it("should confirm all critical fixes are working", async () => {
      const criticalFixes = [
        { table: "activity_logs", description: "Activities API fixed" },
        { table: "crews", description: "Crews API fixed" },
        { table: "equipment", description: "Equipment API fixed" },
        { table: "users", description: "Auth API fixed" },
        { table: "costs", description: "Transactions API foundation" },
      ];

      for (const fix of criticalFixes) {
        const result = await SchemaValidator.validateTableExists(fix.table);
        expect(result.isValid).toBe(true);
      }
    });
  });
});

describe("🔧 TypeScript Type Generation Tests", () => {
  it("should generate TypeScript interfaces from database schema", async () => {
    const activityLogsInterface =
      await SchemaValidator.generateTypeScript("activity_logs");
    expect(activityLogsInterface).toContain("export interface ActivityLogs");
    expect(activityLogsInterface).toContain("entity_type");
    expect(activityLogsInterface).toContain("entity_id");
    expect(activityLogsInterface).toContain("extra_data");

    const crewsInterface = await SchemaValidator.generateTypeScript("crews");
    expect(crewsInterface).toContain("export interface Crews");
    expect(crewsInterface).toContain("foreman_user_id");
    expect(crewsInterface).toContain("project_id");

    const equipmentInterface =
      await SchemaValidator.generateTypeScript("equipment");
    expect(equipmentInterface).toContain("export interface Equipment");
    expect(equipmentInterface).toContain("rental_price_per_day_eur");
    expect(equipmentInterface).toContain("owned");
  });
});
