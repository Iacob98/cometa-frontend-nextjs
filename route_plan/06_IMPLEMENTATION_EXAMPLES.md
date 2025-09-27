# Примеры реализации критичных API роутов

## 🥇 Приоритет 1: `/api/materials`

### Полная реализация materials route.ts

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET /api/materials
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Пагинация
    const page = parseInt(searchParams.get("page") || "1");
    const per_page = parseInt(searchParams.get("per_page") || "20");
    const offset = (page - 1) * per_page;

    // Фильтры
    const search = searchParams.get("search");
    const unit = searchParams.get("unit");
    const in_stock = searchParams.get("in_stock");
    const min_price = searchParams.get("min_price");
    const max_price = searchParams.get("max_price");

    // Базовый запрос
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

    // Применение фильтров
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

    if (min_price) {
      query = query.gte("default_price_eur", parseFloat(min_price));
    }

    if (max_price) {
      query = query.lte("default_price_eur", parseFloat(max_price));
    }

    const { data: materials, error, count } = await query;

    if (error) {
      console.error("Supabase materials query error:", error);
      return NextResponse.json(
        { error: "Failed to fetch materials from database" },
        { status: 500 }
      );
    }

    // Вычисление сводной статистики
    const summary = {
      total_items: count || 0,
      in_stock_items:
        materials?.filter((m) => (m.current_stock_qty || 0) > 0).length || 0,
      out_of_stock_items:
        materials?.filter((m) => (m.current_stock_qty || 0) === 0).length || 0,
      avg_price:
        materials?.length > 0
          ? materials.reduce((sum, m) => sum + (m.default_price_eur || 0), 0) /
            materials.length
          : 0,
      total_stock_value:
        materials?.reduce(
          (sum, m) =>
            sum + (m.current_stock_qty || 0) * (m.default_price_eur || 0),
          0
        ) || 0,
    };

    return NextResponse.json({
      items: materials || [],
      total: count || 0,
      page,
      per_page,
      total_pages: Math.ceil((count || 0) / per_page),
      summary,
      filters: {
        search,
        unit,
        in_stock,
        min_price,
        max_price,
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

    // Валидация обязательных полей
    if (!name || !unit) {
      return NextResponse.json(
        { error: "Name and unit are required" },
        { status: 400 }
      );
    }

    // Валидация единиц измерения
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

    // Валидация цен
    if (default_price_eur !== undefined && default_price_eur < 0) {
      return NextResponse.json(
        { error: "Default price must be non-negative" },
        { status: 400 }
      );
    }

    if (purchase_price_eur !== undefined && purchase_price_eur < 0) {
      return NextResponse.json(
        { error: "Purchase price must be non-negative" },
        { status: 400 }
      );
    }

    // Проверка уникальности SKU (если указан)
    if (sku) {
      const { data: existingMaterial } = await supabase
        .from("materials")
        .select("id")
        .eq("sku", sku)
        .single();

      if (existingMaterial) {
        return NextResponse.json(
          { error: "Material with this SKU already exists" },
          { status: 409 }
        );
      }
    }

    // Создание материала
    const { data: material, error } = await supabase
      .from("materials")
      .insert([
        {
          name: name.trim(),
          unit,
          sku: sku?.trim() || null,
          description: description?.trim() || null,
          default_price_eur: default_price_eur || null,
          purchase_price_eur: purchase_price_eur || null,
          current_stock_qty: 0, // Новые материалы начинают с нулевого остатка
        },
      ])
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
      `
      )
      .single();

    if (error) {
      console.error("Supabase material creation error:", error);
      return NextResponse.json(
        { error: "Failed to create material in database" },
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

// PUT /api/materials/[id]
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { pathname } = new URL(request.url);
    const id = pathname.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { error: "Material ID is required" },
        { status: 400 }
      );
    }

    // Проверка существования материала
    const { data: existingMaterial } = await supabase
      .from("materials")
      .select("id")
      .eq("id", id)
      .single();

    if (!existingMaterial) {
      return NextResponse.json(
        { error: "Material not found" },
        { status: 404 }
      );
    }

    // Подготовка данных для обновления
    const updateData: any = {};

    if (body.name !== undefined) {
      if (!body.name.trim()) {
        return NextResponse.json(
          { error: "Name cannot be empty" },
          { status: 400 }
        );
      }
      updateData.name = body.name.trim();
    }

    if (body.unit !== undefined) {
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
      if (!validUnits.includes(body.unit)) {
        return NextResponse.json(
          { error: `Invalid unit. Must be one of: ${validUnits.join(", ")}` },
          { status: 400 }
        );
      }
      updateData.unit = body.unit;
    }

    if (body.sku !== undefined) {
      if (body.sku && body.sku.trim()) {
        // Проверка уникальности SKU
        const { data: duplicateMaterial } = await supabase
          .from("materials")
          .select("id")
          .eq("sku", body.sku.trim())
          .neq("id", id)
          .single();

        if (duplicateMaterial) {
          return NextResponse.json(
            { error: "Material with this SKU already exists" },
            { status: 409 }
          );
        }
        updateData.sku = body.sku.trim();
      } else {
        updateData.sku = null;
      }
    }

    if (body.description !== undefined) {
      updateData.description = body.description?.trim() || null;
    }

    if (body.default_price_eur !== undefined) {
      if (body.default_price_eur < 0) {
        return NextResponse.json(
          { error: "Default price must be non-negative" },
          { status: 400 }
        );
      }
      updateData.default_price_eur = body.default_price_eur;
    }

    if (body.purchase_price_eur !== undefined) {
      if (body.purchase_price_eur < 0) {
        return NextResponse.json(
          { error: "Purchase price must be non-negative" },
          { status: 400 }
        );
      }
      updateData.purchase_price_eur = body.purchase_price_eur;
    }

    // Обновление материала
    const { data: updatedMaterial, error } = await supabase
      .from("materials")
      .update(updateData)
      .eq("id", id)
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
      `
      )
      .single();

    if (error) {
      console.error("Supabase material update error:", error);
      return NextResponse.json(
        { error: "Failed to update material in database" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Material updated successfully",
      material: updatedMaterial,
    });
  } catch (error) {
    console.error("Materials PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/materials/[id]
export async function DELETE(request: NextRequest) {
  try {
    const { pathname } = new URL(request.url);
    const id = pathname.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { error: "Material ID is required" },
        { status: 400 }
      );
    }

    // Проверка существования материала
    const { data: existingMaterial } = await supabase
      .from("materials")
      .select("id, name")
      .eq("id", id)
      .single();

    if (!existingMaterial) {
      return NextResponse.json(
        { error: "Material not found" },
        { status: 404 }
      );
    }

    // Проверка использования материала в заказах
    const { data: orders } = await supabase
      .from("material_orders")
      .select("id")
      .eq("supplier_material_id", id)
      .limit(1);

    if (orders && orders.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete material that has been ordered" },
        { status: 409 }
      );
    }

    // Проверка распределений материала
    const { data: allocations } = await supabase
      .from("material_allocations")
      .select("id")
      .eq("material_id", id)
      .limit(1);

    if (allocations && allocations.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete material that has been allocated" },
        { status: 409 }
      );
    }

    // Удаление материала
    const { error } = await supabase.from("materials").delete().eq("id", id);

    if (error) {
      console.error("Supabase material deletion error:", error);
      return NextResponse.json(
        { error: "Failed to delete material from database" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: `Material "${existingMaterial.name}" deleted successfully`,
    });
  } catch (error) {
    console.error("Materials DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

## 🥈 Приоритет 2: `/api/suppliers`

### Полная реализация suppliers route.ts

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Валидация email
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Валидация телефона
function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ""));
}

// GET /api/suppliers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Пагинация
    const page = parseInt(searchParams.get("page") || "1");
    const per_page = parseInt(searchParams.get("per_page") || "20");
    const offset = (page - 1) * per_page;

    // Фильтры
    const search = searchParams.get("search");
    const is_active = searchParams.get("is_active");
    const with_materials = searchParams.get("with_materials");

    // Базовый запрос с подсчетом связанных данных
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
        supplier_materials(count),
        material_orders(count)
      `,
        { count: "exact" }
      )
      .order("name", { ascending: true })
      .range(offset, offset + per_page - 1);

    // Применение фильтров
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,company_name.ilike.%${search}%,contact_person.ilike.%${search}%,email.ilike.%${search}%`
      );
    }

    if (is_active !== null && is_active !== undefined) {
      query = query.eq("is_active", is_active === "true");
    }

    const { data: suppliers, error, count } = await query;

    if (error) {
      console.error("Supabase suppliers query error:", error);
      return NextResponse.json(
        { error: "Failed to fetch suppliers from database" },
        { status: 500 }
      );
    }

    // Форматирование ответа с дополнительными данными
    const formattedSuppliers = (suppliers || []).map((supplier: any) => ({
      ...supplier,
      materials_count: supplier.supplier_materials?.[0]?.count || 0,
      orders_count: supplier.material_orders?.[0]?.count || 0,
      // Очистка служебных полей
      supplier_materials: undefined,
      material_orders: undefined,
    }));

    // Сводная статистика
    const summary = {
      total_suppliers: count || 0,
      active_suppliers: formattedSuppliers.filter((s) => s.is_active).length,
      inactive_suppliers: formattedSuppliers.filter((s) => !s.is_active).length,
      total_materials: formattedSuppliers.reduce(
        (sum, s) => sum + s.materials_count,
        0
      ),
      total_orders: formattedSuppliers.reduce(
        (sum, s) => sum + s.orders_count,
        0
      ),
      suppliers_with_email: formattedSuppliers.filter((s) => s.email).length,
      suppliers_with_phone: formattedSuppliers.filter((s) => s.phone).length,
    };

    return NextResponse.json({
      items: formattedSuppliers,
      total: count || 0,
      page,
      per_page,
      total_pages: Math.ceil((count || 0) / per_page),
      summary,
      filters: {
        search,
        is_active,
        with_materials,
      },
    });
  } catch (error) {
    console.error("Suppliers API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/suppliers
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      company_name,
      contact_person,
      phone,
      email,
      address,
      contact_info,
      notes,
      org_name,
      is_active = true,
    } = body;

    // Валидация обязательных полей
    if (!name) {
      return NextResponse.json(
        { error: "Supplier name is required" },
        { status: 400 }
      );
    }

    // Валидация email (если указан)
    if (email && !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Валидация телефона (если указан)
    if (phone && !isValidPhone(phone)) {
      return NextResponse.json(
        { error: "Invalid phone format" },
        { status: 400 }
      );
    }

    // Проверка уникальности email (если указан)
    if (email) {
      const { data: existingSupplier } = await supabase
        .from("suppliers")
        .select("id")
        .eq("email", email)
        .single();

      if (existingSupplier) {
        return NextResponse.json(
          { error: "Supplier with this email already exists" },
          { status: 409 }
        );
      }
    }

    // Создание поставщика
    const { data: supplier, error } = await supabase
      .from("suppliers")
      .insert([
        {
          name: name.trim(),
          company_name: company_name?.trim() || null,
          contact_person: contact_person?.trim() || null,
          phone: phone?.trim() || null,
          email: email?.trim() || null,
          address: address?.trim() || null,
          contact_info: contact_info?.trim() || null,
          notes: notes?.trim() || null,
          org_name: org_name?.trim() || null,
          is_active,
        },
      ])
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
        org_name
      `
      )
      .single();

    if (error) {
      console.error("Supabase supplier creation error:", error);
      return NextResponse.json(
        { error: "Failed to create supplier in database" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Supplier created successfully",
        supplier: {
          ...supplier,
          materials_count: 0,
          orders_count: 0,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Suppliers POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

## 🥉 Приоритет 3: `/api/material-orders`

### Упрощенная реализация material-orders route.ts

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET /api/material-orders
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1");
    const per_page = parseInt(searchParams.get("per_page") || "20");
    const offset = (page - 1) * per_page;

    const project_id = searchParams.get("project_id");
    const status = searchParams.get("status");
    const date_from = searchParams.get("date_from");
    const date_to = searchParams.get("date_to");

    let query = supabase
      .from("material_orders")
      .select(
        `
        id,
        project_id,
        supplier_material_id,
        quantity,
        unit_price_eur,
        delivery_cost_eur,
        total_cost_eur,
        status,
        order_date,
        expected_delivery_date,
        actual_delivery_date,
        notes,
        ordered_by,
        created_at,
        supplier_material:supplier_materials(
          id,
          material_type,
          unit,
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
      `,
        { count: "exact" }
      )
      .order("order_date", { ascending: false })
      .range(offset, offset + per_page - 1);

    // Фильтры
    if (project_id) {
      query = query.eq("project_id", project_id);
    }

    if (status) {
      query = query.eq("status", status);
    }

    if (date_from) {
      query = query.gte("order_date", date_from);
    }

    if (date_to) {
      query = query.lte("order_date", date_to);
    }

    const { data: orders, error, count } = await query;

    if (error) {
      console.error("Supabase material orders query error:", error);
      return NextResponse.json(
        { error: "Failed to fetch material orders" },
        { status: 500 }
      );
    }

    // Сводная статистика
    const summary = {
      total_orders: count || 0,
      total_value:
        orders?.reduce((sum, order) => sum + (order.total_cost_eur || 0), 0) ||
        0,
      by_status: {
        ordered: orders?.filter((o) => o.status === "ordered").length || 0,
        delivered: orders?.filter((o) => o.status === "delivered").length || 0,
        cancelled: orders?.filter((o) => o.status === "cancelled").length || 0,
      },
      pending_delivery:
        orders?.filter(
          (o) =>
            o.status === "ordered" &&
            (!o.expected_delivery_date ||
              new Date(o.expected_delivery_date) < new Date())
        ).length || 0,
    };

    return NextResponse.json({
      items: orders || [],
      total: count || 0,
      page,
      per_page,
      total_pages: Math.ceil((count || 0) / per_page),
      summary,
    });
  } catch (error) {
    console.error("Material orders API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/material-orders
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      project_id,
      supplier_material_id,
      quantity,
      unit_price_eur,
      delivery_cost_eur = 0,
      expected_delivery_date,
      notes,
      ordered_by,
    } = body;

    // Валидация
    if (!supplier_material_id || !quantity || !unit_price_eur || !ordered_by) {
      return NextResponse.json(
        {
          error:
            "Supplier material, quantity, unit price, and ordered_by are required",
        },
        { status: 400 }
      );
    }

    if (quantity <= 0 || unit_price_eur < 0) {
      return NextResponse.json(
        { error: "Quantity must be positive and price non-negative" },
        { status: 400 }
      );
    }

    // Проверка существования поставщика материала
    const { data: supplierMaterial } = await supabase
      .from("supplier_materials")
      .select("id, material_type, unit_price_eur")
      .eq("id", supplier_material_id)
      .single();

    if (!supplierMaterial) {
      return NextResponse.json(
        { error: "Supplier material not found" },
        { status: 404 }
      );
    }

    // Расчет общей стоимости
    const total_cost_eur = quantity * unit_price_eur + delivery_cost_eur;

    // Создание заказа
    const { data: order, error } = await supabase
      .from("material_orders")
      .insert([
        {
          project_id: project_id || null,
          supplier_material_id,
          quantity,
          unit_price_eur,
          delivery_cost_eur,
          total_cost_eur,
          status: "ordered",
          order_date: new Date().toISOString().split("T")[0],
          expected_delivery_date: expected_delivery_date || null,
          notes: notes?.trim() || null,
          ordered_by,
          created_at: new Date().toISOString(),
        },
      ])
      .select(
        `
        id,
        project_id,
        supplier_material_id,
        quantity,
        unit_price_eur,
        delivery_cost_eur,
        total_cost_eur,
        status,
        order_date,
        expected_delivery_date,
        notes,
        ordered_by,
        created_at
      `
      )
      .single();

    if (error) {
      console.error("Supabase material order creation error:", error);
      return NextResponse.json(
        { error: "Failed to create material order" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Material order created successfully",
        order,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Material orders POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

## 📋 Ключевые паттерны из примеров

### 1. Структура ответов

```typescript
// Успешный список
{
  items: Array<T>,
  total: number,
  page: number,
  per_page: number,
  total_pages: number,
  summary: object,
  filters?: object
}

// Успешное создание
{
  message: string,
  entity: object
}

// Ошибка
{
  error: string,
  details?: string[]
}
```

### 2. Валидация и обработка ошибок

- Проверка обязательных полей
- Валидация форматов (email, phone, числа)
- Проверка существования связанных сущностей
- Обработка конфликтов (дублирование)
- Консистентные HTTP статусы

### 3. Фильтрация и поиск

- Стандартная пагинация
- Текстовый поиск через `ilike`
- Фильтры по полям
- Диапазоны дат и чисел

### 4. Связанные данные

- JOIN через `.select()` с связанными таблицами
- Подсчет связанных записей
- Проверка ограничений при удалении

### 5. Сводная статистика

- Подсчеты по категориям
- Агрегация значений
- Дополнительная аналитика

---

_Примеры основаны на анализе рабочих роутов проекта_  
_Все коды используют реальные подключения к Supabase_
_Готовы для копирования и адаптации_
