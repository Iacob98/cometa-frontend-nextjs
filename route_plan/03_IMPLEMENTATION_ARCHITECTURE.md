# Архитектура реализации API роутов

## 🏗️ Общие архитектурные принципы

### 1. Подключение к базе данных

**ТОЛЬКО Supabase клиент** - никаких прямых SQL запросов или заглушек

```typescript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

### 2. Стандартная структура роута

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Логика GET запроса
  } catch (error) {
    // Обработка ошибок
  }
}

export async function POST(request: NextRequest) {
  try {
    // Логика POST запроса
  } catch (error) {
    // Обработка ошибок
  }
}
```

### 3. Стандартная пагинация

```typescript
const { searchParams } = new URL(request.url);
const page = parseInt(searchParams.get("page") || "1");
const per_page = parseInt(searchParams.get("per_page") || "20");
const offset = (page - 1) * per_page;

const query = supabase
  .from("table_name")
  .select("*", { count: "exact" })
  .order("created_at", { ascending: false })
  .range(offset, offset + per_page - 1);
```

### 4. Консистентная обработка ошибок

```typescript
try {
  // Операция с БД
} catch (error) {
  console.error("API Error:", error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

// Для ошибок Supabase
if (supabaseError) {
  console.error("Supabase error:", supabaseError);
  return NextResponse.json(
    { error: "Database operation failed" },
    { status: 500 }
  );
}
```

### 5. Валидация входных данных

```typescript
// Проверка обязательных полей
if (!body.required_field) {
  return NextResponse.json(
    { error: "Required field is missing" },
    { status: 400 }
  );
}

// Проверка форматов
if (!/^[0-9]+$/.test(body.numeric_field)) {
  return NextResponse.json(
    { error: "Invalid numeric format" },
    { status: 400 }
  );
}
```

## 🔧 Примеры реализации по приоритетам

### КРИТИЧЕСКИЙ: `/api/materials`

```typescript
// GET /api/materials
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const per_page = parseInt(searchParams.get("per_page") || "20");
    const offset = (page - 1) * per_page;
    const search = searchParams.get("search");
    const unit = searchParams.get("unit");
    const in_stock = searchParams.get("in_stock");

    let query = supabase
      .from("materials")
      .select(
        `
        id,
        name,
        unit,
        sku,
        description,
        default_price_eur,
        purchase_price_eur,
        current_stock_qty
      `,
        { count: "exact" }
      )
      .order("name", { ascending: true })
      .range(offset, offset + per_page - 1);

    // Фильтры
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,sku.ilike.%${search}%,description.ilike.%${search}%`
      );
    }

    if (unit) {
      query = query.eq("unit", unit);
    }

    if (in_stock === "true") {
      query = query.gt("current_stock_qty", 0);
    }

    const { data: materials, error, count } = await query;

    if (error) {
      console.error("Supabase materials query error:", error);
      return NextResponse.json(
        { error: "Failed to fetch materials" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      items: materials || [],
      total: count || 0,
      page,
      per_page,
      total_pages: Math.ceil((count || 0) / per_page),
      summary: {
        total_items: count || 0,
        in_stock_items:
          materials?.filter((m) => m.current_stock_qty > 0).length || 0,
        avg_price:
          materials?.length > 0
            ? materials.reduce(
                (sum, m) => sum + (m.default_price_eur || 0),
                0
              ) / materials.length
            : 0,
      },
    });
  } catch (error) {
    console.error("Materials API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/materials
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      unit,
      sku,
      description,
      default_price_eur,
      purchase_price_eur,
    } = body;

    // Валидация
    if (!name || !unit) {
      return NextResponse.json(
        { error: "Name and unit are required" },
        { status: 400 }
      );
    }

    // Проверка допустимых единиц измерения
    const validUnits = [
      "m",
      "m2",
      "kg",
      "t",
      "pcs",
      "roll",
      "m3",
      "l",
      "other",
    ];
    if (!validUnits.includes(unit)) {
      return NextResponse.json(
        { error: `Invalid unit. Must be one of: ${validUnits.join(", ")}` },
        { status: 400 }
      );
    }

    // Создание материала
    const { data: material, error } = await supabase
      .from("materials")
      .insert([
        {
          name,
          unit,
          sku: sku || null,
          description: description || null,
          default_price_eur: default_price_eur || null,
          purchase_price_eur: purchase_price_eur || null,
          current_stock_qty: 0,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase material creation error:", error);

      // Обработка дублирования SKU
      if (error.code === "23505" && error.constraint === "materials_sku_key") {
        return NextResponse.json(
          { error: "Material with this SKU already exists" },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: "Failed to create material" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Material created successfully",
        material,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Materials POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### КРИТИЧЕСКИЙ: `/api/suppliers`

```typescript
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const per_page = parseInt(searchParams.get("per_page") || "20");
    const offset = (page - 1) * per_page;
    const search = searchParams.get("search");
    const is_active = searchParams.get("is_active");

    let query = supabase
      .from("suppliers")
      .select(
        `
        id,
        name,
        contact_info,
        address,
        company_name,
        contact_person,
        phone,
        email,
        is_active,
        notes,
        org_name,
        supplier_materials(
          count
        )
      `,
        { count: "exact" }
      )
      .order("name", { ascending: true })
      .range(offset, offset + per_page - 1);

    // Фильтры
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,company_name.ilike.%${search}%,contact_person.ilike.%${search}%`
      );
    }

    if (is_active !== null) {
      query = query.eq("is_active", is_active === "true");
    }

    const { data: suppliers, error, count } = await query;

    if (error) {
      console.error("Supabase suppliers query error:", error);
      return NextResponse.json(
        { error: "Failed to fetch suppliers" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      items: suppliers || [],
      total: count || 0,
      page,
      per_page,
      total_pages: Math.ceil((count || 0) / per_page),
    });
  } catch (error) {
    console.error("Suppliers API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

## 🔗 Работа со связанными данными

### Связи через JOIN (предпочтительно)

```typescript
const query = supabase.from("material_orders").select(`
    id,
    quantity,
    total_cost_eur,
    status,
    order_date,
    supplier_material:supplier_materials(
      id,
      material_type,
      unit_price_eur,
      supplier:suppliers(
        id,
        name,
        company_name
      )
    ),
    project:projects(
      id,
      name,
      city
    ),
    ordered_by_user:users!material_orders_ordered_by_fkey(
      id,
      first_name,
      last_name,
      email
    )
  `);
```

### Агрегация данных

```typescript
// Подсчет связанных записей
const { data: suppliersWithCounts } = await supabase.from("suppliers").select(`
    *,
    materials_count:supplier_materials(count),
    orders_count:material_orders(count)
  `);

// Сводная статистика
const summary = {
  total_suppliers: suppliers.length,
  active_suppliers: suppliers.filter((s) => s.is_active).length,
  total_materials: suppliers.reduce(
    (sum, s) => sum + (s.materials_count || 0),
    0
  ),
};
```

## 📝 Паттерны валидации

### Проверка существования связанных записей

```typescript
// Проверка существования проекта
if (project_id) {
  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("id", project_id)
    .single();

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }
}
```

### Валидация enum значений

```typescript
const validStatuses = ["ordered", "delivered", "cancelled"];
if (status && !validStatuses.includes(status)) {
  return NextResponse.json(
    { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
    { status: 400 }
  );
}
```

## 🎯 Принципы ответов API

### Успешные операции

```typescript
// GET - списки
return NextResponse.json({
  items: data,
  total: count,
  page,
  per_page,
  total_pages: Math.ceil(count / per_page),
  summary: {
    /* дополнительная статистика */
  },
});

// POST - создание
return NextResponse.json(
  {
    message: "Entity created successfully",
    entity: createdData,
  },
  { status: 201 }
);

// PUT - обновление
return NextResponse.json({
  message: "Entity updated successfully",
  entity: updatedData,
});
```

### Обработка ошибок

```typescript
// 400 - неверные данные
return NextResponse.json(
  { error: "Validation failed", details: ["field is required"] },
  { status: 400 }
);

// 404 - не найдено
return NextResponse.json({ error: "Entity not found" }, { status: 404 });

// 409 - конфликт (дублирование)
return NextResponse.json({ error: "Entity already exists" }, { status: 409 });

// 500 - серверная ошибка
return NextResponse.json({ error: "Internal server error" }, { status: 500 });
```

## 🚀 Оптимизация производительности

### Индексы и оптимизация запросов

- Использовать `.select()` только для нужных полей
- Применять фильтры на уровне БД, а не в коде
- Использовать пагинацию для больших наборов данных
- Кэшировать справочные данные

### Пакетные операции

```typescript
// Массовые вставки
const { data, error } = await supabase
  .from("materials")
  .insert(materialsList)
  .select();

// Массовые обновления через upsert
const { data, error } = await supabase
  .from("materials")
  .upsert(materialsToUpdate)
  .select();
```

---

_Архитектурные принципы основаны на анализе работающих роутов_  
_Все примеры используют реальные подключения к Supabase_
_Дата: 2025-01-26_
