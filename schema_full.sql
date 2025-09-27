--
-- PostgreSQL database dump
--

\restrict 5uMFH00Jf3aFrvpYjzb9rQcg91HmckSPwmjnGjHpuOiQeBH2khG1KdZFV7UupAM

-- Dumped from database version 14.19 (Debian 14.19-1.pgdg13+1)
-- Dumped by pg_dump version 14.19 (Debian 14.19-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: btree_gist; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS btree_gist WITH SCHEMA public;


--
-- Name: EXTENSION btree_gist; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION btree_gist IS 'support for indexing common datatypes in GiST';


--
-- Name: update_equipment_status(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_equipment_status() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Update status for affected equipment
    UPDATE equipment 
    SET status = CASE 
        WHEN equipment.id IN (
            SELECT DISTINCT equipment_id 
            FROM equipment_assignments 
            WHERE equipment_id = COALESCE(NEW.equipment_id, OLD.equipment_id)
            AND (to_ts IS NULL OR to_ts > NOW())
        ) THEN 'in_use'
        ELSE 'available'
    END
    WHERE id = COALESCE(NEW.equipment_id, OLD.equipment_id)
    AND status IN ('available', 'in_use');
    
    RETURN COALESCE(NEW, OLD);
END;
$$;


--
-- Name: update_vehicle_status(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_vehicle_status() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Update status for affected vehicle
    UPDATE vehicles 
    SET status = CASE 
        WHEN vehicles.id IN (
            SELECT DISTINCT vehicle_id 
            FROM vehicle_assignments 
            WHERE vehicle_id = COALESCE(NEW.vehicle_id, OLD.vehicle_id)
            AND (to_ts IS NULL OR to_ts > NOW())
        ) THEN 'in_use'
        ELSE 'available'
    END
    WHERE id = COALESCE(NEW.vehicle_id, OLD.vehicle_id)
    AND status IN ('available', 'in_use');
    
    RETURN COALESCE(NEW, OLD);
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: activity_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activity_log (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    project_id uuid,
    activity_type text NOT NULL,
    object_type text NOT NULL,
    object_id uuid,
    action text NOT NULL,
    description text,
    extra_data jsonb,
    created_at timestamp without time zone NOT NULL
);


--
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activity_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    activity_type text NOT NULL,
    description text NOT NULL,
    project_id uuid,
    entity_type text,
    entity_id uuid,
    extra_data jsonb,
    ip_address inet,
    user_agent text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: appointments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.appointments (
    id uuid NOT NULL,
    house_id uuid NOT NULL,
    crew_id uuid,
    start_ts timestamp without time zone NOT NULL,
    end_ts timestamp without time zone NOT NULL,
    status text NOT NULL,
    notes text
);


--
-- Name: asset_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.asset_assignments (
    id uuid NOT NULL,
    equipment_id uuid NOT NULL,
    project_id uuid NOT NULL,
    cabinet_id uuid,
    crew_id uuid,
    from_ts timestamp without time zone NOT NULL,
    to_ts timestamp without time zone
);


--
-- Name: cabinets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cabinets (
    id uuid NOT NULL,
    project_id uuid NOT NULL,
    code text,
    name text,
    address text,
    geom_point jsonb
);


--
-- Name: company_warehouse; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.company_warehouse (
    id uuid NOT NULL,
    material_id uuid NOT NULL,
    total_qty numeric(14,3) NOT NULL,
    reserved_qty numeric(14,3) NOT NULL,
    min_stock_level numeric(14,3),
    last_updated timestamp without time zone
);


--
-- Name: company_warehouse_materials; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.company_warehouse_materials (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    material_id uuid,
    warehouse_id uuid,
    quantity numeric(14,3) DEFAULT 0,
    min_stock_level numeric(14,3) DEFAULT 0,
    max_stock_level numeric(14,3),
    unit_cost numeric(12,2),
    last_updated timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: constraints; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.constraints (
    id uuid NOT NULL,
    project_id uuid NOT NULL,
    segment_id uuid,
    kind text NOT NULL,
    description text,
    geom jsonb,
    status text,
    resolved_at timestamp without time zone,
    resolved_by uuid,
    CONSTRAINT check_constraint_kind CHECK ((kind = ANY (ARRAY['LSA'::text, 'steel_plate'::text, 'fire_access'::text, 'parking'::text, 'tree'::text, 'utility_conflict'::text, 'access_restriction'::text]))),
    CONSTRAINT check_constraint_status CHECK ((status = ANY (ARRAY['identified'::text, 'in_progress'::text, 'resolved'::text, 'cancelled'::text])))
);


--
-- Name: costs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.costs (
    id uuid NOT NULL,
    project_id uuid NOT NULL,
    cost_type text NOT NULL,
    ref_id uuid,
    date date NOT NULL,
    amount_eur numeric(12,2) NOT NULL,
    description text,
    reference_type text,
    reference_id uuid,
    CONSTRAINT check_cost_type CHECK ((cost_type = ANY (ARRAY['facility'::text, 'equipment_rental'::text, 'material'::text, 'transport'::text, 'housing'::text, 'other'::text])))
);


--
-- Name: crew_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.crew_members (
    crew_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role_in_crew text NOT NULL,
    active_from date,
    active_to date,
    CONSTRAINT check_crew_role CHECK ((role_in_crew = ANY (ARRAY['foreman'::text, 'operator'::text, 'worker'::text])))
);


--
-- Name: crews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.crews (
    id uuid NOT NULL,
    project_id uuid,
    name text NOT NULL,
    foreman_user_id uuid,
    status text DEFAULT 'active'::text,
    description text
);


--
-- Name: cut_stages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cut_stages (
    id uuid NOT NULL,
    cut_id uuid NOT NULL,
    stage_code text NOT NULL,
    status text,
    started_at timestamp without time zone,
    closed_at timestamp without time zone,
    closed_by uuid,
    photos_count integer,
    density_tests_count integer,
    CONSTRAINT check_cut_stage_status CHECK ((status = ANY (ARRAY['open'::text, 'in_progress'::text, 'completed'::text, 'blocked'::text])))
);


--
-- Name: cuts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cuts (
    id uuid NOT NULL,
    segment_id uuid NOT NULL,
    code text,
    length_planned_m numeric(10,2) NOT NULL,
    length_done_m numeric(10,2) NOT NULL,
    status text NOT NULL,
    CONSTRAINT check_cut_status CHECK ((status = ANY (ARRAY['open'::text, 'in_progress'::text, 'done'::text])))
);


--
-- Name: document_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.document_categories (
    id uuid NOT NULL,
    code text NOT NULL,
    name_de text NOT NULL,
    name_ru text NOT NULL,
    name_en text,
    description text,
    icon text,
    color text,
    required_for_work boolean,
    max_validity_years integer,
    renewal_notice_days integer,
    required_fields jsonb,
    created_at timestamp without time zone,
    CONSTRAINT check_document_category_code CHECK ((code = ANY (ARRAY['WORK_PERMIT'::text, 'RESIDENCE_PERMIT'::text, 'PASSPORT'::text, 'VISA'::text, 'HEALTH_INSURANCE'::text, 'DRIVER_LICENSE'::text, 'QUALIFICATION_CERT'::text, 'OTHER'::text])))
);


--
-- Name: document_reminders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.document_reminders (
    id uuid NOT NULL,
    document_id uuid NOT NULL,
    reminder_date date NOT NULL,
    reminder_type text,
    days_before_expiry integer,
    sent_at timestamp without time zone,
    notification_method text,
    message text,
    status text,
    CONSTRAINT check_notification_method CHECK ((notification_method = ANY (ARRAY['email'::text, 'sms'::text, 'system'::text]))),
    CONSTRAINT check_reminder_status CHECK ((status = ANY (ARRAY['pending'::text, 'sent'::text, 'failed'::text]))),
    CONSTRAINT check_reminder_type CHECK ((reminder_type = ANY (ARRAY['expiry'::text, 'renewal'::text, 'verification'::text, 'custom'::text])))
);


--
-- Name: equipment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.equipment (
    id uuid NOT NULL,
    type text NOT NULL,
    name text NOT NULL,
    inventory_no text,
    owned boolean NOT NULL,
    status text NOT NULL,
    purchase_price_eur numeric(12,2),
    rental_price_per_day_eur numeric(10,2),
    rental_price_per_hour_eur numeric(10,2),
    current_location text,
    CONSTRAINT check_equipment_status CHECK ((status = ANY (ARRAY['available'::text, 'in_use'::text, 'maintenance'::text, 'broken'::text, 'assigned'::text, 'out_of_service'::text]))),
    CONSTRAINT check_equipment_type CHECK ((type = ANY (ARRAY['machine'::text, 'tool'::text, 'measuring_device'::text])))
);


--
-- Name: equipment_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.equipment_assignments (
    id uuid NOT NULL,
    equipment_id uuid NOT NULL,
    project_id uuid,
    cabinet_id uuid,
    crew_id uuid NOT NULL,
    from_ts timestamp without time zone NOT NULL,
    to_ts timestamp without time zone,
    is_permanent boolean,
    rental_cost_per_day numeric(10,2)
);


--
-- Name: equipment_maintenance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.equipment_maintenance (
    id uuid NOT NULL,
    equipment_id uuid NOT NULL,
    date date NOT NULL,
    description text NOT NULL,
    cost_eur numeric(10,2) NOT NULL,
    performed_by text
);


--
-- Name: facilities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.facilities (
    id uuid NOT NULL,
    project_id uuid NOT NULL,
    type text NOT NULL,
    supplier_id uuid,
    rent_daily_eur numeric(10,2) NOT NULL,
    service_freq text,
    status text NOT NULL,
    start_date date,
    end_date date,
    location_text text,
    geom_point jsonb
);


--
-- Name: house_contacts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.house_contacts (
    id uuid NOT NULL,
    house_id uuid NOT NULL,
    name text NOT NULL,
    phone text,
    email text,
    role text
);


--
-- Name: house_docs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.house_docs (
    id uuid NOT NULL,
    house_id uuid NOT NULL,
    kind text NOT NULL,
    file_url text NOT NULL,
    uploaded_at timestamp without time zone NOT NULL
);


--
-- Name: house_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.house_documents (
    id uuid NOT NULL,
    house_id uuid NOT NULL,
    doc_type text NOT NULL,
    file_path text NOT NULL,
    filename text NOT NULL,
    upload_date timestamp without time zone,
    uploaded_by uuid
);


--
-- Name: house_status; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.house_status (
    id uuid NOT NULL,
    house_id uuid NOT NULL,
    status text NOT NULL,
    reason text,
    changed_by uuid,
    changed_at timestamp without time zone NOT NULL
);


--
-- Name: houses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.houses (
    id uuid NOT NULL,
    project_id uuid NOT NULL,
    cabinet_id uuid,
    address text NOT NULL,
    house_number text,
    connection_type text NOT NULL,
    method text NOT NULL,
    status text,
    planned_length_m numeric(10,2),
    contact_name text,
    contact_phone text,
    contact_email text,
    appointment_date date,
    appointment_time text,
    notes text,
    geom_point jsonb
);


--
-- Name: housing_allocations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.housing_allocations (
    id uuid NOT NULL,
    housing_id uuid NOT NULL,
    user_id uuid NOT NULL,
    bed_no integer,
    from_date date NOT NULL,
    to_date date
);


--
-- Name: housing_units; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.housing_units (
    id uuid NOT NULL,
    project_id uuid NOT NULL,
    address text NOT NULL,
    rooms_total integer NOT NULL,
    beds_total integer NOT NULL,
    rent_daily_eur numeric(10,2) NOT NULL,
    status text NOT NULL
);


--
-- Name: hse_requirements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hse_requirements (
    id uuid NOT NULL,
    project_id uuid NOT NULL,
    type text NOT NULL,
    deadline date,
    assignee_user_id uuid,
    file_url text,
    status text NOT NULL,
    notes text
);


--
-- Name: in_app_notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.in_app_notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    title text NOT NULL,
    message text NOT NULL,
    notification_type text DEFAULT 'info'::text,
    priority text DEFAULT 'normal'::text,
    is_read boolean DEFAULT false,
    metadata_json jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    read_at timestamp with time zone,
    expires_at timestamp with time zone
);


--
-- Name: inventory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory (
    id uuid NOT NULL,
    material_id uuid NOT NULL,
    location_id uuid NOT NULL,
    qty numeric(14,3) NOT NULL
);


--
-- Name: material_allocations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.material_allocations (
    id uuid NOT NULL,
    material_id uuid NOT NULL,
    project_id uuid,
    crew_id uuid,
    allocated_qty numeric(14,3) NOT NULL,
    used_qty numeric(14,3),
    allocation_date date NOT NULL,
    return_date date,
    status text NOT NULL,
    notes text,
    allocated_by uuid,
    CONSTRAINT check_allocation_status CHECK ((status = ANY (ARRAY['allocated'::text, 'partially_used'::text, 'fully_used'::text, 'returned'::text]))),
    CONSTRAINT check_allocation_target CHECK (((project_id IS NOT NULL) OR (crew_id IS NOT NULL)))
);


--
-- Name: material_moves; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.material_moves (
    id uuid NOT NULL,
    material_id uuid NOT NULL,
    from_location_id uuid,
    to_location_id uuid,
    order_id uuid,
    qty numeric(14,3) NOT NULL,
    move_type text NOT NULL,
    date date NOT NULL,
    CONSTRAINT check_move_type CHECK ((move_type = ANY (ARRAY['in'::text, 'out'::text, 'transfer'::text, 'loss'::text, 'adjustment'::text])))
);


--
-- Name: material_orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.material_orders (
    id uuid NOT NULL,
    project_id uuid,
    supplier_material_id uuid NOT NULL,
    quantity numeric(14,3) NOT NULL,
    unit_price_eur numeric(12,2) NOT NULL,
    delivery_cost_eur numeric(12,2),
    total_cost_eur numeric(12,2) NOT NULL,
    status text NOT NULL,
    order_date date NOT NULL,
    expected_delivery_date date,
    actual_delivery_date date,
    notes text,
    ordered_by uuid,
    created_at timestamp without time zone,
    CONSTRAINT check_order_status CHECK ((status = ANY (ARRAY['ordered'::text, 'delivered'::text, 'cancelled'::text]))),
    CONSTRAINT check_quantity_positive CHECK ((quantity > (0)::numeric)),
    CONSTRAINT check_total_cost_positive CHECK ((total_cost_eur >= (0)::numeric))
);


--
-- Name: material_stage_mapping; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.material_stage_mapping (
    id uuid NOT NULL,
    stage_name text NOT NULL,
    material_id uuid NOT NULL,
    typical_quantity numeric(10,2),
    is_required boolean,
    notes text
);


--
-- Name: materials; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.materials (
    id uuid NOT NULL,
    name text NOT NULL,
    unit text NOT NULL,
    sku text,
    description text,
    default_price_eur numeric(12,2),
    purchase_price_eur numeric(12,2),
    current_stock_qty numeric(14,3),
    CONSTRAINT check_material_unit CHECK ((unit = ANY (ARRAY['m'::text, 'm2'::text, 'kg'::text, 't'::text, 'pcs'::text, 'roll'::text, 'm3'::text, 'l'::text, 'other'::text])))
);


--
-- Name: offmass_lines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.offmass_lines (
    id uuid NOT NULL,
    project_id uuid NOT NULL,
    description text NOT NULL,
    quantity numeric(12,3) NOT NULL,
    unit_price numeric(12,2) NOT NULL,
    total_amount numeric(12,2) NOT NULL,
    date date NOT NULL
);


--
-- Name: photos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.photos (
    id uuid NOT NULL,
    work_entry_id uuid,
    cut_stage_id uuid,
    url text NOT NULL,
    ts timestamp without time zone NOT NULL,
    gps_lat numeric(10,6),
    gps_lon numeric(10,6),
    author_user_id uuid,
    label text,
    CONSTRAINT check_photo_label CHECK ((label = ANY (ARRAY['before'::text, 'during'::text, 'after'::text, 'instrument'::text, 'other'::text])))
);


--
-- Name: plan_view_confirms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.plan_view_confirms (
    id uuid NOT NULL,
    project_id uuid NOT NULL,
    user_id uuid NOT NULL,
    segment_id uuid,
    street_name text,
    viewed_at timestamp without time zone,
    confirmed boolean
);


--
-- Name: price_extras; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.price_extras (
    id uuid NOT NULL,
    price_list_id uuid NOT NULL,
    type text NOT NULL,
    description text NOT NULL,
    unit text NOT NULL,
    rate numeric(12,2) NOT NULL,
    CONSTRAINT check_extra_type CHECK ((type = ANY (ARRAY['LSA'::text, 'steel_plate'::text, 'debris_removal'::text, 'traffic_management'::text, 'weekend_surcharge'::text]))),
    CONSTRAINT check_extra_unit CHECK ((unit = ANY (ARRAY['per_m'::text, 'per_piece'::text, 'per_day'::text, 'per_hour'::text, 'lump_sum'::text])))
);


--
-- Name: price_lists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.price_lists (
    id uuid NOT NULL,
    project_id uuid NOT NULL,
    name text NOT NULL,
    valid_from date,
    valid_to date,
    is_active boolean
);


--
-- Name: price_rules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.price_rules (
    id uuid NOT NULL,
    price_list_id uuid NOT NULL,
    surface text NOT NULL,
    depth_band text NOT NULL,
    rate_per_m numeric(12,2) NOT NULL,
    CONSTRAINT check_price_depth CHECK ((depth_band = ANY (ARRAY['0-50cm'::text, '50-80cm'::text, '80-120cm'::text, '120cm+'::text]))),
    CONSTRAINT check_price_surface CHECK ((surface = ANY (ARRAY['asphalt'::text, 'concrete'::text, 'dirt'::text, 'grass'::text, 'paving'::text])))
);


--
-- Name: project_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    document_type text DEFAULT 'other'::text NOT NULL,
    file_name text NOT NULL,
    file_path text,
    file_size integer DEFAULT 0,
    mime_type text,
    uploaded_at timestamp without time zone DEFAULT now(),
    uploaded_by uuid,
    notes text,
    status text DEFAULT 'active'::text,
    tags text[]
);


--
-- Name: project_files; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_files (
    id uuid NOT NULL,
    project_id uuid NOT NULL,
    type text NOT NULL,
    file_url text NOT NULL,
    filename text,
    version text,
    uploaded_by uuid,
    uploaded_at timestamp without time zone,
    CONSTRAINT check_file_type CHECK ((type = ANY (ARRAY['traffic_plan'::text, 'utility_plan'::text, 'site_plan'::text, 'contract'::text, 'permit'::text, 'other'::text])))
);


--
-- Name: project_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_plans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    plan_type character varying(100) NOT NULL,
    filename character varying(255) NOT NULL,
    file_path character varying(500) NOT NULL,
    file_size bigint NOT NULL,
    uploaded_at timestamp without time zone DEFAULT now(),
    uploaded_by uuid,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: project_suppliers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_suppliers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    supplier_id uuid NOT NULL,
    assigned_by uuid,
    assigned_at timestamp without time zone DEFAULT now(),
    status character varying(50) DEFAULT 'active'::character varying,
    notes text,
    is_active boolean DEFAULT true
);


--
-- Name: projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.projects (
    id uuid NOT NULL,
    name text NOT NULL,
    customer text,
    city text,
    address text,
    contact_24h text,
    start_date date,
    end_date_plan date,
    status text NOT NULL,
    total_length_m numeric(10,2) NOT NULL,
    base_rate_per_m numeric(12,2) NOT NULL,
    pm_user_id uuid,
    language_default text,
    approved boolean DEFAULT false,
    CONSTRAINT check_project_status CHECK ((status = ANY (ARRAY['draft'::text, 'planning'::text, 'active'::text, 'waiting_invoice'::text, 'closed'::text])))
);


--
-- Name: rental_expenses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rental_expenses (
    id uuid NOT NULL,
    rental_id uuid NOT NULL,
    date date NOT NULL,
    days integer NOT NULL,
    amount_eur numeric(10,2) NOT NULL,
    end_date_plan date,
    status text NOT NULL
);


--
-- Name: rentals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rentals (
    id uuid NOT NULL,
    type text NOT NULL,
    object_id uuid NOT NULL,
    supplier_id uuid NOT NULL,
    daily_rate_eur numeric(10,2) NOT NULL,
    start_date date NOT NULL,
    end_date_plan date NOT NULL,
    status text NOT NULL,
    CONSTRAINT check_rental_status CHECK ((status = ANY (ARRAY['planned'::text, 'active'::text, 'finished'::text, 'cancelled'::text]))),
    CONSTRAINT check_rental_type CHECK ((type = ANY (ARRAY['vehicle'::text, 'equipment'::text, 'facility'::text])))
);


--
-- Name: resource_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.resource_requests (
    id uuid NOT NULL,
    request_type text NOT NULL,
    requested_by uuid NOT NULL,
    project_id uuid,
    crew_id uuid,
    item_name text,
    material_id uuid,
    equipment_id uuid,
    quantity numeric(14,3) NOT NULL,
    unit text,
    urgency text NOT NULL,
    reason text NOT NULL,
    description text,
    delivery_location text,
    needed_by_date date,
    status text NOT NULL,
    created_at timestamp without time zone NOT NULL,
    approved_by uuid,
    approved_at timestamp without time zone,
    processed_at timestamp without time zone,
    shipped_at timestamp without time zone,
    delivered_at timestamp without time zone,
    rejected_reason text,
    notes text,
    admin_notes text,
    estimated_cost numeric(12,2),
    actual_cost numeric(12,2),
    CONSTRAINT check_request_status CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'processing'::text, 'shipped'::text, 'delivered'::text, 'cancelled'::text]))),
    CONSTRAINT check_request_type CHECK ((request_type = ANY (ARRAY['material'::text, 'equipment'::text]))),
    CONSTRAINT check_urgency CHECK ((urgency = ANY (ARRAY['low'::text, 'normal'::text, 'high'::text, 'critical'::text])))
);


--
-- Name: resource_usage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.resource_usage (
    id uuid NOT NULL,
    resource_type text NOT NULL,
    resource_id uuid NOT NULL,
    project_id uuid,
    crew_id uuid,
    user_id uuid,
    usage_date date NOT NULL,
    quantity_used numeric(14,3),
    hours_used numeric(10,2),
    cost_eur numeric(12,2),
    notes text,
    created_at timestamp without time zone,
    CONSTRAINT check_resource_type CHECK ((resource_type = ANY (ARRAY['material'::text, 'equipment'::text, 'vehicle'::text])))
);


--
-- Name: segments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.segments (
    id uuid NOT NULL,
    cabinet_id uuid NOT NULL,
    name text,
    length_planned_m numeric(10,2) NOT NULL,
    surface text NOT NULL,
    area text NOT NULL,
    depth_req_m numeric(6,3),
    width_req_m numeric(6,3),
    geom_line jsonb,
    status text NOT NULL,
    CONSTRAINT check_segment_area CHECK ((area = ANY (ARRAY['roadway'::text, 'sidewalk'::text, 'driveway'::text, 'green'::text]))),
    CONSTRAINT check_segment_status CHECK ((status = ANY (ARRAY['open'::text, 'in_progress'::text, 'done'::text]))),
    CONSTRAINT check_segment_surface CHECK ((surface = ANY (ARRAY['asphalt'::text, 'concrete'::text, 'pavers'::text, 'green'::text])))
);


--
-- Name: stage_defs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stage_defs (
    id uuid NOT NULL,
    code text NOT NULL,
    name_ru text NOT NULL,
    name_de text,
    requires_photos_min integer,
    requires_measurements boolean,
    requires_density boolean,
    CONSTRAINT check_stage_code CHECK ((code = ANY (ARRAY['stage_1_marking'::text, 'stage_2_excavation'::text, 'stage_3_conduit'::text, 'stage_4_cable'::text, 'stage_5_splice'::text, 'stage_6_test'::text, 'stage_7_connect'::text, 'stage_8_final'::text, 'stage_9_backfill'::text, 'stage_10_surface'::text])))
);


--
-- Name: stock_locations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stock_locations (
    id uuid NOT NULL,
    name text NOT NULL,
    project_id uuid,
    address text,
    CONSTRAINT check_location_name CHECK ((name = ANY (ARRAY['main_warehouse'::text, 'site_storage'::text, 'rented_container'::text, 'other'::text])))
);


--
-- Name: supplier_contacts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.supplier_contacts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    supplier_id uuid NOT NULL,
    contact_name character varying(255) NOT NULL,
    "position" character varying(255),
    department character varying(255),
    phone character varying(50),
    email character varying(255),
    is_primary boolean DEFAULT false,
    is_active boolean DEFAULT true,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: supplier_materials; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.supplier_materials (
    id uuid NOT NULL,
    supplier_id uuid NOT NULL,
    project_id uuid,
    material_type text NOT NULL,
    unit text NOT NULL,
    unit_price_eur numeric(12,2) NOT NULL,
    currency text NOT NULL,
    has_delivery boolean,
    delivery_cost_eur numeric(12,2),
    pickup_address text,
    min_order_quantity numeric(14,3),
    notes text,
    is_active boolean,
    created_at timestamp without time zone,
    created_by uuid,
    CONSTRAINT check_currency CHECK ((currency = 'EUR'::text)),
    CONSTRAINT check_supplier_unit CHECK ((unit = ANY (ARRAY['ton'::text, 'm3'::text, 'kg'::text, 'piece'::text, 'meter'::text, 'liter'::text, 'box'::text, 'pallet'::text])))
);


--
-- Name: suppliers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.suppliers (
    id uuid NOT NULL,
    name text NOT NULL,
    contact_info text,
    address text,
    company_name text,
    contact_person text,
    phone text,
    email text,
    is_active boolean DEFAULT true,
    notes text,
    org_name text
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    phone text,
    email text,
    lang_pref text,
    role text NOT NULL,
    is_active boolean NOT NULL,
    skills jsonb,
    pin_code text,
    CONSTRAINT check_user_role CHECK ((role = ANY (ARRAY['admin'::text, 'pm'::text, 'foreman'::text, 'crew'::text, 'viewer'::text, 'worker'::text])))
);


--
-- Name: utility_contacts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.utility_contacts (
    id uuid NOT NULL,
    project_id uuid NOT NULL,
    kind text NOT NULL,
    org_name text NOT NULL,
    phone text,
    email text,
    contact_person text,
    notes text,
    CONSTRAINT check_utility_kind CHECK ((kind = ANY (ARRAY['power'::text, 'water'::text, 'gas'::text, 'telecom'::text, 'road'::text, 'municipality'::text, 'emergency'::text])))
);


--
-- Name: vehicle_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vehicle_assignments (
    id uuid NOT NULL,
    vehicle_id uuid NOT NULL,
    project_id uuid,
    crew_id uuid NOT NULL,
    from_ts timestamp without time zone NOT NULL,
    to_ts timestamp without time zone,
    is_permanent boolean,
    rental_cost_per_day numeric(10,2)
);


--
-- Name: vehicle_expenses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vehicle_expenses (
    id uuid NOT NULL,
    vehicle_id uuid NOT NULL,
    type text NOT NULL,
    amount_eur numeric(10,2) NOT NULL,
    date date NOT NULL,
    note text,
    CONSTRAINT check_expense_type CHECK ((type = ANY (ARRAY['fuel'::text, 'repair'::text, 'toll'::text, 'parking'::text, 'other'::text])))
);


--
-- Name: vehicle_tracking; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vehicle_tracking (
    id uuid NOT NULL,
    vehicle_id uuid NOT NULL,
    "timestamp" timestamp without time zone NOT NULL,
    lat numeric(10,7),
    lon numeric(10,7)
);


--
-- Name: vehicles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vehicles (
    id uuid NOT NULL,
    plate_number text NOT NULL,
    type text NOT NULL,
    brand text,
    model text,
    owned boolean NOT NULL,
    status text NOT NULL,
    purchase_price_eur numeric(12,2),
    rental_price_per_day_eur numeric(10,2),
    rental_price_per_hour_eur numeric(10,2),
    fuel_consumption_l_100km numeric(5,2),
    current_location text,
    year_of_manufacture integer,
    mileage numeric(10,2),
    vin text,
    CONSTRAINT check_vehicle_status CHECK ((status = ANY (ARRAY['available'::text, 'in_use'::text, 'maintenance'::text, 'broken'::text, 'assigned'::text, 'out_of_service'::text]))),
    CONSTRAINT check_vehicle_type CHECK ((type = ANY (ARRAY['van'::text, 'truck'::text, 'trailer'::text, 'excavator'::text, 'other'::text])))
);


--
-- Name: work_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.work_entries (
    id uuid NOT NULL,
    project_id uuid NOT NULL,
    cabinet_id uuid,
    segment_id uuid,
    cut_id uuid,
    house_id uuid,
    crew_id uuid,
    user_id uuid,
    date date NOT NULL,
    stage_code text NOT NULL,
    meters_done_m numeric(10,2) NOT NULL,
    method text,
    width_m numeric(6,3),
    depth_m numeric(6,3),
    cables_count integer,
    has_protection_pipe boolean,
    soil_type text,
    notes text,
    approved_by uuid,
    approved_at timestamp without time zone,
    approved boolean DEFAULT false,
    CONSTRAINT check_meters_positive CHECK ((meters_done_m >= (0)::numeric)),
    CONSTRAINT check_work_method CHECK ((method = ANY (ARRAY['mole'::text, 'hand'::text, 'excavator'::text, 'trencher'::text, 'documentation'::text])))
);


--
-- Name: worker_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.worker_documents (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    category_id uuid NOT NULL,
    document_type text NOT NULL,
    document_number text,
    issuing_authority text,
    issue_date date,
    expiry_date date,
    file_url text NOT NULL,
    file_path text,
    file_name text,
    file_size integer,
    file_hash text,
    mime_type text,
    encrypted boolean,
    status text,
    notes text,
    verified_at timestamp without time zone,
    verified_by uuid,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    uploaded_by uuid NOT NULL,
    CONSTRAINT check_worker_document_status CHECK ((status = ANY (ARRAY['active'::text, 'pending_verification'::text, 'expired'::text, 'archived'::text, 'rejected'::text])))
);


--
-- Name: activity_log activity_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_log
    ADD CONSTRAINT activity_log_pkey PRIMARY KEY (id);


--
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);


--
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- Name: asset_assignments asset_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asset_assignments
    ADD CONSTRAINT asset_assignments_pkey PRIMARY KEY (id);


--
-- Name: cabinets cabinets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cabinets
    ADD CONSTRAINT cabinets_pkey PRIMARY KEY (id);


--
-- Name: company_warehouse company_warehouse_material_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_warehouse
    ADD CONSTRAINT company_warehouse_material_id_key UNIQUE (material_id);


--
-- Name: company_warehouse_materials company_warehouse_materials_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_warehouse_materials
    ADD CONSTRAINT company_warehouse_materials_pkey PRIMARY KEY (id);


--
-- Name: company_warehouse company_warehouse_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_warehouse
    ADD CONSTRAINT company_warehouse_pkey PRIMARY KEY (id);


--
-- Name: constraints constraints_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.constraints
    ADD CONSTRAINT constraints_pkey PRIMARY KEY (id);


--
-- Name: costs costs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.costs
    ADD CONSTRAINT costs_pkey PRIMARY KEY (id);


--
-- Name: crew_members crew_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crew_members
    ADD CONSTRAINT crew_members_pkey PRIMARY KEY (crew_id, user_id);


--
-- Name: crews crews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crews
    ADD CONSTRAINT crews_pkey PRIMARY KEY (id);


--
-- Name: cut_stages cut_stages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cut_stages
    ADD CONSTRAINT cut_stages_pkey PRIMARY KEY (id);


--
-- Name: cuts cuts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cuts
    ADD CONSTRAINT cuts_pkey PRIMARY KEY (id);


--
-- Name: document_categories document_categories_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_categories
    ADD CONSTRAINT document_categories_code_key UNIQUE (code);


--
-- Name: document_categories document_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_categories
    ADD CONSTRAINT document_categories_pkey PRIMARY KEY (id);


--
-- Name: document_reminders document_reminders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_reminders
    ADD CONSTRAINT document_reminders_pkey PRIMARY KEY (id);


--
-- Name: equipment_assignments equipment_assignment_no_overlap; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_assignments
    ADD CONSTRAINT equipment_assignment_no_overlap EXCLUDE USING gist (equipment_id WITH =, tsrange(from_ts, COALESCE(to_ts, 'infinity'::timestamp without time zone), '[)'::text) WITH &&);


--
-- Name: equipment_assignments equipment_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_assignments
    ADD CONSTRAINT equipment_assignments_pkey PRIMARY KEY (id);


--
-- Name: equipment_maintenance equipment_maintenance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_maintenance
    ADD CONSTRAINT equipment_maintenance_pkey PRIMARY KEY (id);


--
-- Name: equipment equipment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT equipment_pkey PRIMARY KEY (id);


--
-- Name: facilities facilities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.facilities
    ADD CONSTRAINT facilities_pkey PRIMARY KEY (id);


--
-- Name: house_contacts house_contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.house_contacts
    ADD CONSTRAINT house_contacts_pkey PRIMARY KEY (id);


--
-- Name: house_docs house_docs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.house_docs
    ADD CONSTRAINT house_docs_pkey PRIMARY KEY (id);


--
-- Name: house_documents house_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.house_documents
    ADD CONSTRAINT house_documents_pkey PRIMARY KEY (id);


--
-- Name: house_status house_status_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.house_status
    ADD CONSTRAINT house_status_pkey PRIMARY KEY (id);


--
-- Name: houses houses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.houses
    ADD CONSTRAINT houses_pkey PRIMARY KEY (id);


--
-- Name: housing_allocations housing_allocations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.housing_allocations
    ADD CONSTRAINT housing_allocations_pkey PRIMARY KEY (id);


--
-- Name: housing_units housing_units_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.housing_units
    ADD CONSTRAINT housing_units_pkey PRIMARY KEY (id);


--
-- Name: hse_requirements hse_requirements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hse_requirements
    ADD CONSTRAINT hse_requirements_pkey PRIMARY KEY (id);


--
-- Name: in_app_notifications in_app_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.in_app_notifications
    ADD CONSTRAINT in_app_notifications_pkey PRIMARY KEY (id);


--
-- Name: inventory inventory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_pkey PRIMARY KEY (id);


--
-- Name: material_allocations material_allocations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.material_allocations
    ADD CONSTRAINT material_allocations_pkey PRIMARY KEY (id);


--
-- Name: material_moves material_moves_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.material_moves
    ADD CONSTRAINT material_moves_pkey PRIMARY KEY (id);


--
-- Name: material_orders material_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.material_orders
    ADD CONSTRAINT material_orders_pkey PRIMARY KEY (id);


--
-- Name: material_stage_mapping material_stage_mapping_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.material_stage_mapping
    ADD CONSTRAINT material_stage_mapping_pkey PRIMARY KEY (id);


--
-- Name: materials materials_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.materials
    ADD CONSTRAINT materials_pkey PRIMARY KEY (id);


--
-- Name: offmass_lines offmass_lines_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offmass_lines
    ADD CONSTRAINT offmass_lines_pkey PRIMARY KEY (id);


--
-- Name: photos photos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.photos
    ADD CONSTRAINT photos_pkey PRIMARY KEY (id);


--
-- Name: plan_view_confirms plan_view_confirms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_view_confirms
    ADD CONSTRAINT plan_view_confirms_pkey PRIMARY KEY (id);


--
-- Name: price_extras price_extras_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.price_extras
    ADD CONSTRAINT price_extras_pkey PRIMARY KEY (id);


--
-- Name: price_lists price_lists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.price_lists
    ADD CONSTRAINT price_lists_pkey PRIMARY KEY (id);


--
-- Name: price_rules price_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.price_rules
    ADD CONSTRAINT price_rules_pkey PRIMARY KEY (id);


--
-- Name: project_documents project_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_documents
    ADD CONSTRAINT project_documents_pkey PRIMARY KEY (id);


--
-- Name: project_files project_files_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_files
    ADD CONSTRAINT project_files_pkey PRIMARY KEY (id);


--
-- Name: project_plans project_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_plans
    ADD CONSTRAINT project_plans_pkey PRIMARY KEY (id);


--
-- Name: project_suppliers project_suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_suppliers
    ADD CONSTRAINT project_suppliers_pkey PRIMARY KEY (id);


--
-- Name: project_suppliers project_suppliers_project_id_supplier_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_suppliers
    ADD CONSTRAINT project_suppliers_project_id_supplier_id_key UNIQUE (project_id, supplier_id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: rental_expenses rental_expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rental_expenses
    ADD CONSTRAINT rental_expenses_pkey PRIMARY KEY (id);


--
-- Name: rentals rentals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rentals
    ADD CONSTRAINT rentals_pkey PRIMARY KEY (id);


--
-- Name: resource_requests resource_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_requests
    ADD CONSTRAINT resource_requests_pkey PRIMARY KEY (id);


--
-- Name: resource_usage resource_usage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_usage
    ADD CONSTRAINT resource_usage_pkey PRIMARY KEY (id);


--
-- Name: segments segments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.segments
    ADD CONSTRAINT segments_pkey PRIMARY KEY (id);


--
-- Name: stage_defs stage_defs_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stage_defs
    ADD CONSTRAINT stage_defs_code_key UNIQUE (code);


--
-- Name: stage_defs stage_defs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stage_defs
    ADD CONSTRAINT stage_defs_pkey PRIMARY KEY (id);


--
-- Name: stock_locations stock_locations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_locations
    ADD CONSTRAINT stock_locations_pkey PRIMARY KEY (id);


--
-- Name: supplier_contacts supplier_contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supplier_contacts
    ADD CONSTRAINT supplier_contacts_pkey PRIMARY KEY (id);


--
-- Name: supplier_materials supplier_materials_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supplier_materials
    ADD CONSTRAINT supplier_materials_pkey PRIMARY KEY (id);


--
-- Name: suppliers suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: utility_contacts utility_contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.utility_contacts
    ADD CONSTRAINT utility_contacts_pkey PRIMARY KEY (id);


--
-- Name: vehicle_assignments vehicle_assignment_no_overlap; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicle_assignments
    ADD CONSTRAINT vehicle_assignment_no_overlap EXCLUDE USING gist (vehicle_id WITH =, tsrange(from_ts, COALESCE(to_ts, 'infinity'::timestamp without time zone), '[)'::text) WITH &&);


--
-- Name: vehicle_assignments vehicle_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicle_assignments
    ADD CONSTRAINT vehicle_assignments_pkey PRIMARY KEY (id);


--
-- Name: vehicle_expenses vehicle_expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicle_expenses
    ADD CONSTRAINT vehicle_expenses_pkey PRIMARY KEY (id);


--
-- Name: vehicle_tracking vehicle_tracking_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicle_tracking
    ADD CONSTRAINT vehicle_tracking_pkey PRIMARY KEY (id);


--
-- Name: vehicles vehicles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_pkey PRIMARY KEY (id);


--
-- Name: vehicles vehicles_plate_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_plate_number_key UNIQUE (plate_number);


--
-- Name: work_entries work_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_entries
    ADD CONSTRAINT work_entries_pkey PRIMARY KEY (id);


--
-- Name: worker_documents worker_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.worker_documents
    ADD CONSTRAINT worker_documents_pkey PRIMARY KEY (id);


--
-- Name: idx_activity_logs_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_logs_created_at ON public.activity_logs USING btree (created_at);


--
-- Name: idx_activity_logs_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_logs_project_id ON public.activity_logs USING btree (project_id);


--
-- Name: idx_activity_logs_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_logs_user_id ON public.activity_logs USING btree (user_id);


--
-- Name: idx_company_warehouse_materials_material_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_company_warehouse_materials_material_id ON public.company_warehouse_materials USING btree (material_id);


--
-- Name: idx_company_warehouse_materials_warehouse_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_company_warehouse_materials_warehouse_id ON public.company_warehouse_materials USING btree (warehouse_id);


--
-- Name: idx_equipment_assignments_crew_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_equipment_assignments_crew_id ON public.equipment_assignments USING btree (crew_id);


--
-- Name: idx_equipment_assignments_crew_project; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_equipment_assignments_crew_project ON public.equipment_assignments USING btree (crew_id, project_id) WHERE (project_id IS NOT NULL);


--
-- Name: idx_equipment_assignments_crew_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_equipment_assignments_crew_time ON public.equipment_assignments USING btree (crew_id, from_ts, to_ts);


--
-- Name: idx_notifications_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_created ON public.in_app_notifications USING btree (created_at DESC);


--
-- Name: idx_notifications_priority; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_priority ON public.in_app_notifications USING btree (priority);


--
-- Name: idx_notifications_user_read; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_user_read ON public.in_app_notifications USING btree (user_id, is_read);


--
-- Name: idx_project_suppliers_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_project_suppliers_project_id ON public.project_suppliers USING btree (project_id);


--
-- Name: idx_project_suppliers_supplier_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_project_suppliers_supplier_id ON public.project_suppliers USING btree (supplier_id);


--
-- Name: idx_supplier_contacts_is_primary; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_supplier_contacts_is_primary ON public.supplier_contacts USING btree (is_primary);


--
-- Name: idx_supplier_contacts_supplier_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_supplier_contacts_supplier_id ON public.supplier_contacts USING btree (supplier_id);


--
-- Name: idx_vehicle_assignments_crew_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vehicle_assignments_crew_id ON public.vehicle_assignments USING btree (crew_id);


--
-- Name: idx_vehicle_assignments_crew_project; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vehicle_assignments_crew_project ON public.vehicle_assignments USING btree (crew_id, project_id) WHERE (project_id IS NOT NULL);


--
-- Name: idx_vehicle_assignments_crew_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vehicle_assignments_crew_time ON public.vehicle_assignments USING btree (crew_id, from_ts, to_ts);


--
-- Name: equipment_assignments equipment_assignment_status_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER equipment_assignment_status_trigger AFTER INSERT OR DELETE OR UPDATE ON public.equipment_assignments FOR EACH ROW EXECUTE FUNCTION public.update_equipment_status();


--
-- Name: vehicle_assignments vehicle_assignment_status_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER vehicle_assignment_status_trigger AFTER INSERT OR DELETE OR UPDATE ON public.vehicle_assignments FOR EACH ROW EXECUTE FUNCTION public.update_vehicle_status();


--
-- Name: activity_log activity_log_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_log
    ADD CONSTRAINT activity_log_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: activity_log activity_log_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_log
    ADD CONSTRAINT activity_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: activity_logs activity_logs_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: activity_logs activity_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: appointments appointments_crew_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_crew_id_fkey FOREIGN KEY (crew_id) REFERENCES public.crews(id);


--
-- Name: appointments appointments_house_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_house_id_fkey FOREIGN KEY (house_id) REFERENCES public.houses(id) ON DELETE CASCADE;


--
-- Name: asset_assignments asset_assignments_cabinet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asset_assignments
    ADD CONSTRAINT asset_assignments_cabinet_id_fkey FOREIGN KEY (cabinet_id) REFERENCES public.cabinets(id);


--
-- Name: asset_assignments asset_assignments_crew_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asset_assignments
    ADD CONSTRAINT asset_assignments_crew_id_fkey FOREIGN KEY (crew_id) REFERENCES public.crews(id);


--
-- Name: asset_assignments asset_assignments_equipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asset_assignments
    ADD CONSTRAINT asset_assignments_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(id) ON DELETE CASCADE;


--
-- Name: asset_assignments asset_assignments_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asset_assignments
    ADD CONSTRAINT asset_assignments_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: cabinets cabinets_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cabinets
    ADD CONSTRAINT cabinets_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: company_warehouse company_warehouse_material_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_warehouse
    ADD CONSTRAINT company_warehouse_material_id_fkey FOREIGN KEY (material_id) REFERENCES public.materials(id) ON DELETE CASCADE;


--
-- Name: company_warehouse_materials company_warehouse_materials_material_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_warehouse_materials
    ADD CONSTRAINT company_warehouse_materials_material_id_fkey FOREIGN KEY (material_id) REFERENCES public.materials(id) ON DELETE CASCADE;


--
-- Name: constraints constraints_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.constraints
    ADD CONSTRAINT constraints_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: constraints constraints_resolved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.constraints
    ADD CONSTRAINT constraints_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES public.users(id);


--
-- Name: constraints constraints_segment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.constraints
    ADD CONSTRAINT constraints_segment_id_fkey FOREIGN KEY (segment_id) REFERENCES public.segments(id);


--
-- Name: costs costs_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.costs
    ADD CONSTRAINT costs_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: crew_members crew_members_crew_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crew_members
    ADD CONSTRAINT crew_members_crew_id_fkey FOREIGN KEY (crew_id) REFERENCES public.crews(id) ON DELETE CASCADE;


--
-- Name: crew_members crew_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crew_members
    ADD CONSTRAINT crew_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: crews crews_foreman_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crews
    ADD CONSTRAINT crews_foreman_user_id_fkey FOREIGN KEY (foreman_user_id) REFERENCES public.users(id);


--
-- Name: crews crews_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crews
    ADD CONSTRAINT crews_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: cut_stages cut_stages_closed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cut_stages
    ADD CONSTRAINT cut_stages_closed_by_fkey FOREIGN KEY (closed_by) REFERENCES public.users(id);


--
-- Name: cut_stages cut_stages_cut_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cut_stages
    ADD CONSTRAINT cut_stages_cut_id_fkey FOREIGN KEY (cut_id) REFERENCES public.cuts(id) ON DELETE CASCADE;


--
-- Name: cuts cuts_segment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cuts
    ADD CONSTRAINT cuts_segment_id_fkey FOREIGN KEY (segment_id) REFERENCES public.segments(id) ON DELETE CASCADE;


--
-- Name: document_reminders document_reminders_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_reminders
    ADD CONSTRAINT document_reminders_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.worker_documents(id) ON DELETE CASCADE;


--
-- Name: equipment_assignments equipment_assignments_cabinet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_assignments
    ADD CONSTRAINT equipment_assignments_cabinet_id_fkey FOREIGN KEY (cabinet_id) REFERENCES public.cabinets(id);


--
-- Name: equipment_assignments equipment_assignments_crew_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_assignments
    ADD CONSTRAINT equipment_assignments_crew_id_fkey FOREIGN KEY (crew_id) REFERENCES public.crews(id);


--
-- Name: equipment_assignments equipment_assignments_equipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_assignments
    ADD CONSTRAINT equipment_assignments_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(id);


--
-- Name: equipment_assignments equipment_assignments_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_assignments
    ADD CONSTRAINT equipment_assignments_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: equipment_maintenance equipment_maintenance_equipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_maintenance
    ADD CONSTRAINT equipment_maintenance_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(id);


--
-- Name: facilities facilities_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.facilities
    ADD CONSTRAINT facilities_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: facilities facilities_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.facilities
    ADD CONSTRAINT facilities_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);


--
-- Name: house_contacts house_contacts_house_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.house_contacts
    ADD CONSTRAINT house_contacts_house_id_fkey FOREIGN KEY (house_id) REFERENCES public.houses(id) ON DELETE CASCADE;


--
-- Name: house_docs house_docs_house_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.house_docs
    ADD CONSTRAINT house_docs_house_id_fkey FOREIGN KEY (house_id) REFERENCES public.houses(id) ON DELETE CASCADE;


--
-- Name: house_documents house_documents_house_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.house_documents
    ADD CONSTRAINT house_documents_house_id_fkey FOREIGN KEY (house_id) REFERENCES public.houses(id) ON DELETE CASCADE;


--
-- Name: house_documents house_documents_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.house_documents
    ADD CONSTRAINT house_documents_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id);


--
-- Name: house_status house_status_changed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.house_status
    ADD CONSTRAINT house_status_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.users(id);


--
-- Name: house_status house_status_house_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.house_status
    ADD CONSTRAINT house_status_house_id_fkey FOREIGN KEY (house_id) REFERENCES public.houses(id) ON DELETE CASCADE;


--
-- Name: houses houses_cabinet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.houses
    ADD CONSTRAINT houses_cabinet_id_fkey FOREIGN KEY (cabinet_id) REFERENCES public.cabinets(id);


--
-- Name: houses houses_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.houses
    ADD CONSTRAINT houses_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: housing_allocations housing_allocations_housing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.housing_allocations
    ADD CONSTRAINT housing_allocations_housing_id_fkey FOREIGN KEY (housing_id) REFERENCES public.housing_units(id) ON DELETE CASCADE;


--
-- Name: housing_allocations housing_allocations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.housing_allocations
    ADD CONSTRAINT housing_allocations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: housing_units housing_units_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.housing_units
    ADD CONSTRAINT housing_units_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: hse_requirements hse_requirements_assignee_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hse_requirements
    ADD CONSTRAINT hse_requirements_assignee_user_id_fkey FOREIGN KEY (assignee_user_id) REFERENCES public.users(id);


--
-- Name: hse_requirements hse_requirements_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hse_requirements
    ADD CONSTRAINT hse_requirements_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: in_app_notifications in_app_notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.in_app_notifications
    ADD CONSTRAINT in_app_notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: inventory inventory_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.stock_locations(id) ON DELETE CASCADE;


--
-- Name: inventory inventory_material_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_material_id_fkey FOREIGN KEY (material_id) REFERENCES public.materials(id) ON DELETE CASCADE;


--
-- Name: material_allocations material_allocations_allocated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.material_allocations
    ADD CONSTRAINT material_allocations_allocated_by_fkey FOREIGN KEY (allocated_by) REFERENCES public.users(id);


--
-- Name: material_allocations material_allocations_crew_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.material_allocations
    ADD CONSTRAINT material_allocations_crew_id_fkey FOREIGN KEY (crew_id) REFERENCES public.crews(id);


--
-- Name: material_allocations material_allocations_material_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.material_allocations
    ADD CONSTRAINT material_allocations_material_id_fkey FOREIGN KEY (material_id) REFERENCES public.materials(id);


--
-- Name: material_allocations material_allocations_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.material_allocations
    ADD CONSTRAINT material_allocations_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: material_moves material_moves_from_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.material_moves
    ADD CONSTRAINT material_moves_from_location_id_fkey FOREIGN KEY (from_location_id) REFERENCES public.stock_locations(id);


--
-- Name: material_moves material_moves_material_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.material_moves
    ADD CONSTRAINT material_moves_material_id_fkey FOREIGN KEY (material_id) REFERENCES public.materials(id);


--
-- Name: material_moves material_moves_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.material_moves
    ADD CONSTRAINT material_moves_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.material_orders(id);


--
-- Name: material_moves material_moves_to_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.material_moves
    ADD CONSTRAINT material_moves_to_location_id_fkey FOREIGN KEY (to_location_id) REFERENCES public.stock_locations(id);


--
-- Name: material_orders material_orders_ordered_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.material_orders
    ADD CONSTRAINT material_orders_ordered_by_fkey FOREIGN KEY (ordered_by) REFERENCES public.users(id);


--
-- Name: material_orders material_orders_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.material_orders
    ADD CONSTRAINT material_orders_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: material_orders material_orders_supplier_material_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.material_orders
    ADD CONSTRAINT material_orders_supplier_material_id_fkey FOREIGN KEY (supplier_material_id) REFERENCES public.supplier_materials(id);


--
-- Name: material_stage_mapping material_stage_mapping_material_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.material_stage_mapping
    ADD CONSTRAINT material_stage_mapping_material_id_fkey FOREIGN KEY (material_id) REFERENCES public.materials(id);


--
-- Name: offmass_lines offmass_lines_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offmass_lines
    ADD CONSTRAINT offmass_lines_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: photos photos_author_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.photos
    ADD CONSTRAINT photos_author_user_id_fkey FOREIGN KEY (author_user_id) REFERENCES public.users(id);


--
-- Name: photos photos_work_entry_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.photos
    ADD CONSTRAINT photos_work_entry_id_fkey FOREIGN KEY (work_entry_id) REFERENCES public.work_entries(id) ON DELETE CASCADE;


--
-- Name: plan_view_confirms plan_view_confirms_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_view_confirms
    ADD CONSTRAINT plan_view_confirms_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: plan_view_confirms plan_view_confirms_segment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_view_confirms
    ADD CONSTRAINT plan_view_confirms_segment_id_fkey FOREIGN KEY (segment_id) REFERENCES public.segments(id);


--
-- Name: plan_view_confirms plan_view_confirms_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_view_confirms
    ADD CONSTRAINT plan_view_confirms_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: price_extras price_extras_price_list_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.price_extras
    ADD CONSTRAINT price_extras_price_list_id_fkey FOREIGN KEY (price_list_id) REFERENCES public.price_lists(id) ON DELETE CASCADE;


--
-- Name: price_lists price_lists_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.price_lists
    ADD CONSTRAINT price_lists_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: price_rules price_rules_price_list_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.price_rules
    ADD CONSTRAINT price_rules_price_list_id_fkey FOREIGN KEY (price_list_id) REFERENCES public.price_lists(id) ON DELETE CASCADE;


--
-- Name: project_documents project_documents_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_documents
    ADD CONSTRAINT project_documents_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_documents project_documents_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_documents
    ADD CONSTRAINT project_documents_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id);


--
-- Name: project_files project_files_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_files
    ADD CONSTRAINT project_files_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_files project_files_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_files
    ADD CONSTRAINT project_files_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id);


--
-- Name: project_suppliers project_suppliers_assigned_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_suppliers
    ADD CONSTRAINT project_suppliers_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES public.users(id);


--
-- Name: project_suppliers project_suppliers_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_suppliers
    ADD CONSTRAINT project_suppliers_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_suppliers project_suppliers_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_suppliers
    ADD CONSTRAINT project_suppliers_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON DELETE CASCADE;


--
-- Name: projects projects_pm_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pm_user_id_fkey FOREIGN KEY (pm_user_id) REFERENCES public.users(id);


--
-- Name: rental_expenses rental_expenses_rental_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rental_expenses
    ADD CONSTRAINT rental_expenses_rental_id_fkey FOREIGN KEY (rental_id) REFERENCES public.rentals(id);


--
-- Name: rentals rentals_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rentals
    ADD CONSTRAINT rentals_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);


--
-- Name: resource_requests resource_requests_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_requests
    ADD CONSTRAINT resource_requests_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: resource_requests resource_requests_crew_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_requests
    ADD CONSTRAINT resource_requests_crew_id_fkey FOREIGN KEY (crew_id) REFERENCES public.crews(id);


--
-- Name: resource_requests resource_requests_equipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_requests
    ADD CONSTRAINT resource_requests_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(id);


--
-- Name: resource_requests resource_requests_material_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_requests
    ADD CONSTRAINT resource_requests_material_id_fkey FOREIGN KEY (material_id) REFERENCES public.materials(id);


--
-- Name: resource_requests resource_requests_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_requests
    ADD CONSTRAINT resource_requests_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: resource_requests resource_requests_requested_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_requests
    ADD CONSTRAINT resource_requests_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES public.users(id);


--
-- Name: resource_usage resource_usage_crew_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_usage
    ADD CONSTRAINT resource_usage_crew_id_fkey FOREIGN KEY (crew_id) REFERENCES public.crews(id);


--
-- Name: resource_usage resource_usage_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_usage
    ADD CONSTRAINT resource_usage_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: resource_usage resource_usage_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_usage
    ADD CONSTRAINT resource_usage_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: segments segments_cabinet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.segments
    ADD CONSTRAINT segments_cabinet_id_fkey FOREIGN KEY (cabinet_id) REFERENCES public.cabinets(id) ON DELETE CASCADE;


--
-- Name: stock_locations stock_locations_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_locations
    ADD CONSTRAINT stock_locations_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: supplier_contacts supplier_contacts_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supplier_contacts
    ADD CONSTRAINT supplier_contacts_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON DELETE CASCADE;


--
-- Name: supplier_materials supplier_materials_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supplier_materials
    ADD CONSTRAINT supplier_materials_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: supplier_materials supplier_materials_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supplier_materials
    ADD CONSTRAINT supplier_materials_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: supplier_materials supplier_materials_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supplier_materials
    ADD CONSTRAINT supplier_materials_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);


--
-- Name: utility_contacts utility_contacts_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.utility_contacts
    ADD CONSTRAINT utility_contacts_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: vehicle_assignments vehicle_assignments_crew_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicle_assignments
    ADD CONSTRAINT vehicle_assignments_crew_id_fkey FOREIGN KEY (crew_id) REFERENCES public.crews(id);


--
-- Name: vehicle_assignments vehicle_assignments_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicle_assignments
    ADD CONSTRAINT vehicle_assignments_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: vehicle_assignments vehicle_assignments_vehicle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicle_assignments
    ADD CONSTRAINT vehicle_assignments_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id);


--
-- Name: vehicle_expenses vehicle_expenses_vehicle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicle_expenses
    ADD CONSTRAINT vehicle_expenses_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id);


--
-- Name: vehicle_tracking vehicle_tracking_vehicle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicle_tracking
    ADD CONSTRAINT vehicle_tracking_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id);


--
-- Name: work_entries work_entries_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_entries
    ADD CONSTRAINT work_entries_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: work_entries work_entries_cabinet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_entries
    ADD CONSTRAINT work_entries_cabinet_id_fkey FOREIGN KEY (cabinet_id) REFERENCES public.cabinets(id);


--
-- Name: work_entries work_entries_crew_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_entries
    ADD CONSTRAINT work_entries_crew_id_fkey FOREIGN KEY (crew_id) REFERENCES public.crews(id);


--
-- Name: work_entries work_entries_cut_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_entries
    ADD CONSTRAINT work_entries_cut_id_fkey FOREIGN KEY (cut_id) REFERENCES public.cuts(id);


--
-- Name: work_entries work_entries_house_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_entries
    ADD CONSTRAINT work_entries_house_id_fkey FOREIGN KEY (house_id) REFERENCES public.houses(id);


--
-- Name: work_entries work_entries_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_entries
    ADD CONSTRAINT work_entries_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: work_entries work_entries_segment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_entries
    ADD CONSTRAINT work_entries_segment_id_fkey FOREIGN KEY (segment_id) REFERENCES public.segments(id);


--
-- Name: work_entries work_entries_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_entries
    ADD CONSTRAINT work_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: worker_documents worker_documents_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.worker_documents
    ADD CONSTRAINT worker_documents_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.document_categories(id);


--
-- Name: worker_documents worker_documents_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.worker_documents
    ADD CONSTRAINT worker_documents_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id);


--
-- Name: worker_documents worker_documents_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.worker_documents
    ADD CONSTRAINT worker_documents_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: worker_documents worker_documents_verified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.worker_documents
    ADD CONSTRAINT worker_documents_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict 5uMFH00Jf3aFrvpYjzb9rQcg91HmckSPwmjnGjHpuOiQeBH2khG1KdZFV7UupAM

