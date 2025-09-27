# Стратегия тестирования и валидации API роутов

## 🧪 Общая стратегия тестирования

### Пирамида тестирования для API роутов:

```
    /\     E2E Tests (10%)
   /  \    - Полные пользовательские сценарии
  /____\   - Интеграция фронтенд-бэкенд
 /      \
/________\  Integration Tests (30%)
           - API + Database
           - Реальные HTTP запросы

Unit Tests (60%)
- Логика валидации
- Обработка ошибок
- Бизнес-логика
```

## 🔍 Уровни тестирования

### 1. Unit Tests (60% покрытия)

**Цель:** Тестирование изолированной логики
**Инструменты:** Jest, @testing-library

```typescript
// Пример: Валидация материалов
describe("Material Validation", () => {
  test("should validate required fields", () => {
    const material = { name: "", unit: "kg" };
    const errors = validateMaterial(material);
    expect(errors).toContain("Name is required");
  });

  test("should validate unit enum", () => {
    const material = { name: "Steel", unit: "invalid" };
    const errors = validateMaterial(material);
    expect(errors).toContain("Invalid unit");
  });

  test("should validate price format", () => {
    const material = { name: "Steel", unit: "kg", price: -10 };
    const errors = validateMaterial(material);
    expect(errors).toContain("Price must be positive");
  });
});
```

### 2. Integration Tests (30% покрытия)

**Цель:** Тестирование API + Database взаимодействия
**Инструменты:** Jest, Supertest, Test Database

```typescript
// Пример: Тестирование API материалов
describe("/api/materials", () => {
  beforeEach(async () => {
    await setupTestDatabase();
    await seedTestData();
  });

  afterEach(async () => {
    await cleanupTestDatabase();
  });

  describe("GET /api/materials", () => {
    test("should return paginated materials", async () => {
      const response = await request(app)
        .get("/api/materials?page=1&per_page=10")
        .expect(200);

      expect(response.body).toMatchObject({
        items: expect.any(Array),
        total: expect.any(Number),
        page: 1,
        per_page: 10,
        total_pages: expect.any(Number),
      });
    });

    test("should filter materials by unit", async () => {
      const response = await request(app)
        .get("/api/materials?unit=kg")
        .expect(200);

      response.body.items.forEach((item) => {
        expect(item.unit).toBe("kg");
      });
    });

    test("should search materials by name", async () => {
      const response = await request(app)
        .get("/api/materials?search=steel")
        .expect(200);

      response.body.items.forEach((item) => {
        expect(item.name.toLowerCase()).toContain("steel");
      });
    });
  });

  describe("POST /api/materials", () => {
    test("should create new material", async () => {
      const newMaterial = {
        name: "Test Material",
        unit: "kg",
        sku: "TEST001",
        default_price_eur: 10.5,
      };

      const response = await request(app)
        .post("/api/materials")
        .send(newMaterial)
        .expect(201);

      expect(response.body).toMatchObject({
        message: "Material created successfully",
        material: expect.objectContaining(newMaterial),
      });
    });

    test("should reject invalid unit", async () => {
      const invalidMaterial = {
        name: "Test Material",
        unit: "invalid_unit",
      };

      const response = await request(app)
        .post("/api/materials")
        .send(invalidMaterial)
        .expect(400);

      expect(response.body.error).toContain("Invalid unit");
    });

    test("should handle duplicate SKU", async () => {
      await createTestMaterial({ sku: "DUPLICATE" });

      const duplicateMaterial = {
        name: "Another Material",
        unit: "kg",
        sku: "DUPLICATE",
      };

      const response = await request(app)
        .post("/api/materials")
        .send(duplicateMaterial)
        .expect(409);

      expect(response.body.error).toContain("already exists");
    });
  });
});
```

### 3. E2E Tests (10% покрытия)

**Цель:** Тестирование полных пользовательских сценариев
**Инструменты:** Playwright, Cypress

```typescript
// Пример: E2E тест заказа материалов
test("Material ordering workflow", async ({ page }) => {
  // 1. Логин администратора
  await page.goto("/login");
  await page.fill("[data-testid=email]", "admin@test.com");
  await page.fill("[data-testid=pin]", "1234");
  await page.click("[data-testid=login-btn]");

  // 2. Переход к материалам
  await page.click("[data-testid=materials-menu]");
  await expect(page).toHaveURL("/materials");

  // 3. Создание материала
  await page.click("[data-testid=add-material-btn]");
  await page.fill("[data-testid=material-name]", "Steel Rebar");
  await page.selectOption("[data-testid=material-unit]", "kg");
  await page.fill("[data-testid=material-price]", "2.50");
  await page.click("[data-testid=save-material-btn]");

  // 4. Проверка создания
  await expect(page.locator("[data-testid=material-item]")).toContainText(
    "Steel Rebar"
  );

  // 5. Создание заказа
  await page.click("[data-testid=order-material-btn]");
  await page.selectOption("[data-testid=supplier-select]", "Test Supplier");
  await page.fill("[data-testid=quantity-input]", "100");
  await page.click("[data-testid=place-order-btn]");

  // 6. Проверка заказа
  await page.goto("/material-orders");
  await expect(page.locator("[data-testid=order-item]")).toContainText(
    "Steel Rebar"
  );
  await expect(page.locator("[data-testid=order-status]")).toContainText(
    "ordered"
  );
});
```

## 📝 Тестовые данные и фикстуры

### Структура тестовых данных

```typescript
// test-data/materials.ts
export const testMaterials = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    name: "Steel Rebar 12mm",
    unit: "kg",
    sku: "STEEL_12MM",
    description: "High-strength steel rebar",
    default_price_eur: 2.5,
    current_stock_qty: 1000,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    name: "Concrete Mix",
    unit: "m3",
    sku: "CONCRETE_MIX",
    description: "Ready-mix concrete",
    default_price_eur: 85.0,
    current_stock_qty: 50,
  },
];

// test-data/suppliers.ts
export const testSuppliers = [
  {
    id: "550e8400-e29b-41d4-a716-446655440010",
    name: "Steel Supplies Ltd",
    company_name: "Steel Supplies Limited",
    contact_person: "John Smith",
    phone: "+49-123-456789",
    email: "john@steelsupplies.de",
    is_active: true,
  },
];
```

### Утилиты для тестов

```typescript
// test-utils/database.ts
export async function setupTestDatabase() {
  // Создание тестовой схемы
  await testSupabase.from("materials").delete().neq("id", "");
  await testSupabase.from("suppliers").delete().neq("id", "");
  await testSupabase.from("material_orders").delete().neq("id", "");
}

export async function seedTestData() {
  await testSupabase.from("materials").insert(testMaterials);
  await testSupabase.from("suppliers").insert(testSuppliers);
}

export async function cleanupTestDatabase() {
  await setupTestDatabase();
}

// test-utils/api.ts
export function createTestRequest(app: any) {
  return {
    get: (url: string) => request(app).get(url),
    post: (url: string, data: any) => request(app).post(url).send(data),
    put: (url: string, data: any) => request(app).put(url).send(data),
    delete: (url: string) => request(app).delete(url),
  };
}
```

## 🔧 Настройка тестовой среды

### Jest конфигурация

```javascript
// jest.config.js
module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/test-setup.ts"],
  testMatch: ["**/__tests__/**/*.test.ts"],
  collectCoverageFrom: ["src/app/api/**/*.ts", "!src/app/api/**/*.d.ts"],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

### Тестовая база данных

```typescript
// test-setup.ts
import { createClient } from "@supabase/supabase-js";

const testSupabase = createClient(
  process.env.TEST_SUPABASE_URL!,
  process.env.TEST_SUPABASE_KEY!
);

beforeAll(async () => {
  await setupTestDatabase();
});

afterAll(async () => {
  await cleanupTestDatabase();
});
```

## 📊 Test Cases по роутам

### `/api/materials` - Test Cases

```typescript
describe("Materials API", () => {
  // Happy Path Tests
  test("GET: should return all materials with pagination");
  test("GET: should filter by unit");
  test("GET: should search by name/sku");
  test("POST: should create new material");
  test("PUT: should update existing material");
  test("DELETE: should delete material");

  // Edge Cases
  test("GET: should handle empty results");
  test("GET: should handle invalid pagination parameters");
  test("POST: should reject missing required fields");
  test("POST: should reject invalid unit");
  test("POST: should handle duplicate SKU");
  test("PUT: should return 404 for non-existent material");
  test("DELETE: should return 404 for non-existent material");

  // Error Cases
  test("should handle database connection errors");
  test("should handle malformed JSON requests");
  test("should validate price ranges");
  test("should validate SKU format");
});
```

### `/api/suppliers` - Test Cases

```typescript
describe("Suppliers API", () => {
  // Happy Path Tests
  test("GET: should return all suppliers");
  test("GET: should filter by is_active");
  test("POST: should create new supplier");
  test("PUT: should update supplier info");

  // Business Logic Tests
  test("POST: should validate email format");
  test("POST: should validate phone format");
  test("PUT: should not allow deactivating supplier with active orders");

  // Integration Tests
  test("GET: should include materials count");
  test("GET: should include orders count");
});
```

### `/api/material-orders` - Test Cases

```typescript
describe("Material Orders API", () => {
  // Complex Business Logic
  test("POST: should calculate total cost correctly");
  test("POST: should validate material availability");
  test("POST: should check supplier material relationship");
  test("PUT: should update order status");
  test("PUT: should handle delivery date updates");

  // Financial Operations
  test("should handle currency calculations");
  test("should validate delivery costs");
  test("should calculate taxes if applicable");

  // Workflow Tests
  test("should support order cancellation");
  test("should track order status changes");
  test("should generate order notifications");
});
```

## 🎯 Performance Testing

### Load Testing параметры

```typescript
// performance/load-test.js
import { check } from "k6";
import http from "k6/http";

export let options = {
  stages: [
    { duration: "2m", target: 10 }, // Ramp up
    { duration: "5m", target: 50 }, // Stay at 50 users
    { duration: "2m", target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"], // 95% requests under 500ms
    http_req_failed: ["rate<0.1"], // Error rate under 10%
  },
};

export default function () {
  // Test materials endpoint
  let response = http.get(
    "http://localhost:3000/api/materials?page=1&per_page=20"
  );
  check(response, {
    "status is 200": (r) => r.status === 200,
    "response time < 200ms": (r) => r.timings.duration < 200,
  });

  // Test suppliers endpoint
  response = http.get("http://localhost:3000/api/suppliers");
  check(response, {
    "status is 200": (r) => r.status === 200,
  });
}
```

## 📈 Метрики и мониторинг

### Test Metrics Dashboard

```typescript
// Автоматические метрики после каждого тест-рана
const testMetrics = {
  coverage: {
    lines: 85.2,
    functions: 88.1,
    branches: 82.5,
    statements: 86.3,
  },
  performance: {
    avg_response_time: 145, // ms
    max_response_time: 320, // ms
    success_rate: 99.2, // %
  },
  test_results: {
    total_tests: 156,
    passed: 152,
    failed: 4,
    skipped: 0,
  },
};
```

### Continuous Integration

```yaml
# .github/workflows/api-tests.yml
name: API Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: "18"

      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:integration
      - run: npm run test:e2e

      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

## ✅ Definition of Done для тестирования

### Для каждого API роута:

- ✅ Покрытие unit тестами > 80%
- ✅ Все happy path сценарии протестированы
- ✅ Все edge cases покрыты
- ✅ Error handling протестирован
- ✅ Performance тесты пройдены
- ✅ Integration тесты с реальной БД работают
- ✅ E2E тесты критичных сценариев готовы

### Для релиза:

- ✅ Общее покрытие тестами > 85%
- ✅ Все тесты проходят в CI/CD
- ✅ Performance метрики в пределах нормы
- ✅ Manual testing завершен
- ✅ Security testing пройден

---

_Стратегия тестирования учитывает специфику строительной отрасли_
_Акцент на бизнес-критичных операциях с материалами и финансами_
_Дата: 2025-01-26_
