-- COMETA Database Schema
-- Generated from SQLAlchemy models
-- 

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create all tables

-- Table: users

CREATE TABLE users (
	id UUID NOT NULL, 
	first_name TEXT NOT NULL, 
	last_name TEXT NOT NULL, 
	phone TEXT, 
	email TEXT, 
	lang_pref TEXT, 
	role TEXT NOT NULL, 
	is_active BOOLEAN NOT NULL, 
	skills JSONB, 
	PRIMARY KEY (id), 
	CONSTRAINT check_user_role CHECK (role IN ('admin','pm','foreman','crew','viewer')), 
	UNIQUE (phone), 
	UNIQUE (email)
)

;

-- Table: projects

CREATE TABLE projects (
	id UUID NOT NULL, 
	name TEXT NOT NULL, 
	customer TEXT, 
	city TEXT, 
	address TEXT, 
	contact_24h TEXT, 
	start_date DATE, 
	end_date_plan DATE, 
	status TEXT NOT NULL, 
	total_length_m NUMERIC(10, 2) NOT NULL, 
	base_rate_per_m NUMERIC(12, 2) NOT NULL, 
	pm_user_id UUID, 
	language_default TEXT, 
	PRIMARY KEY (id), 
	CONSTRAINT check_project_status CHECK (status IN ('draft','active','waiting_invoice','closed')), 
	FOREIGN KEY(pm_user_id) REFERENCES users (id)
)

;

-- Table: cabinets

CREATE TABLE cabinets (
	id UUID NOT NULL, 
	project_id UUID NOT NULL, 
	code TEXT, 
	name TEXT, 
	address TEXT, 
	geom_point JSONB, 
	PRIMARY KEY (id), 
	FOREIGN KEY(project_id) REFERENCES projects (id) ON DELETE CASCADE
)

;

-- Table: segments

CREATE TABLE segments (
	id UUID NOT NULL, 
	cabinet_id UUID NOT NULL, 
	name TEXT, 
	length_planned_m NUMERIC(10, 2) NOT NULL, 
	surface TEXT NOT NULL, 
	area TEXT NOT NULL, 
	depth_req_m NUMERIC(6, 3), 
	width_req_m NUMERIC(6, 3), 
	geom_line JSONB, 
	status TEXT NOT NULL, 
	PRIMARY KEY (id), 
	CONSTRAINT check_segment_surface CHECK (surface IN ('asphalt','concrete','pavers','green')), 
	CONSTRAINT check_segment_area CHECK (area IN ('roadway','sidewalk','driveway','green')), 
	CONSTRAINT check_segment_status CHECK (status IN ('open','in_progress','done')), 
	FOREIGN KEY(cabinet_id) REFERENCES cabinets (id) ON DELETE CASCADE
)

;

-- Table: cuts

CREATE TABLE cuts (
	id UUID NOT NULL, 
	segment_id UUID NOT NULL, 
	code TEXT, 
	length_planned_m NUMERIC(10, 2) NOT NULL, 
	length_done_m NUMERIC(10, 2) NOT NULL, 
	status TEXT NOT NULL, 
	PRIMARY KEY (id), 
	CONSTRAINT check_cut_status CHECK (status IN ('open','in_progress','done')), 
	FOREIGN KEY(segment_id) REFERENCES segments (id) ON DELETE CASCADE
)

;

-- Table: crews

CREATE TABLE crews (
	id UUID NOT NULL, 
	project_id UUID, 
	name TEXT NOT NULL, 
	foreman_user_id UUID, 
	PRIMARY KEY (id), 
	FOREIGN KEY(project_id) REFERENCES projects (id), 
	FOREIGN KEY(foreman_user_id) REFERENCES users (id)
)

;

-- Table: crew_members

CREATE TABLE crew_members (
	crew_id UUID NOT NULL, 
	user_id UUID NOT NULL, 
	role_in_crew TEXT NOT NULL, 
	active_from DATE, 
	active_to DATE, 
	PRIMARY KEY (crew_id, user_id), 
	CONSTRAINT check_crew_role CHECK (role_in_crew IN ('foreman','operator','worker')), 
	FOREIGN KEY(crew_id) REFERENCES crews (id) ON DELETE CASCADE, 
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
)

;

-- Table: work_entries

CREATE TABLE work_entries (
	id UUID NOT NULL, 
	project_id UUID NOT NULL, 
	cabinet_id UUID, 
	segment_id UUID, 
	cut_id UUID, 
	house_id UUID, 
	crew_id UUID, 
	user_id UUID, 
	date DATE NOT NULL, 
	stage_code TEXT NOT NULL, 
	meters_done_m NUMERIC(10, 2) NOT NULL, 
	method TEXT, 
	width_m NUMERIC(6, 3), 
	depth_m NUMERIC(6, 3), 
	cables_count INTEGER, 
	has_protection_pipe BOOLEAN, 
	soil_type TEXT, 
	notes TEXT, 
	approved_by UUID, 
	approved_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	CONSTRAINT check_work_method CHECK (method IN ('mole','hand','excavator','trencher','documentation')), 
	CONSTRAINT check_meters_positive CHECK (meters_done_m >= 0), 
	FOREIGN KEY(project_id) REFERENCES projects (id) ON DELETE CASCADE, 
	FOREIGN KEY(cabinet_id) REFERENCES cabinets (id), 
	FOREIGN KEY(segment_id) REFERENCES segments (id), 
	FOREIGN KEY(cut_id) REFERENCES cuts (id), 
	FOREIGN KEY(house_id) REFERENCES houses (id), 
	FOREIGN KEY(crew_id) REFERENCES crews (id), 
	FOREIGN KEY(user_id) REFERENCES users (id), 
	FOREIGN KEY(approved_by) REFERENCES users (id)
)

;

-- Table: costs

CREATE TABLE costs (
	id UUID NOT NULL, 
	project_id UUID NOT NULL, 
	cost_type TEXT NOT NULL, 
	ref_id UUID, 
	date DATE NOT NULL, 
	amount_eur NUMERIC(12, 2) NOT NULL, 
	description TEXT, 
	PRIMARY KEY (id), 
	CONSTRAINT check_cost_type CHECK (cost_type IN ('facility','equipment_rental','material','transport','housing','other')), 
	FOREIGN KEY(project_id) REFERENCES projects (id) ON DELETE CASCADE
)

;

-- Table: materials

CREATE TABLE materials (
	id UUID NOT NULL, 
	name TEXT NOT NULL, 
	unit TEXT NOT NULL, 
	sku TEXT, 
	description TEXT, 
	default_price_eur NUMERIC(12, 2), 
	purchase_price_eur NUMERIC(12, 2), 
	current_stock_qty NUMERIC(14, 3), 
	PRIMARY KEY (id), 
	CONSTRAINT check_material_unit CHECK (unit IN ('m','m2','kg','t','pcs','roll','m3','l','other'))
)

;

-- Table: material_allocations

CREATE TABLE material_allocations (
	id UUID NOT NULL, 
	material_id UUID NOT NULL, 
	project_id UUID, 
	crew_id UUID, 
	allocated_qty NUMERIC(14, 3) NOT NULL, 
	used_qty NUMERIC(14, 3), 
	allocation_date DATE NOT NULL, 
	return_date DATE, 
	status TEXT NOT NULL, 
	notes TEXT, 
	allocated_by UUID, 
	PRIMARY KEY (id), 
	CONSTRAINT check_allocation_status CHECK (status IN ('allocated', 'partially_used', 'fully_used', 'returned')), 
	CONSTRAINT check_allocation_target CHECK (project_id IS NOT NULL OR crew_id IS NOT NULL), 
	FOREIGN KEY(material_id) REFERENCES materials (id), 
	FOREIGN KEY(project_id) REFERENCES projects (id), 
	FOREIGN KEY(crew_id) REFERENCES crews (id), 
	FOREIGN KEY(allocated_by) REFERENCES users (id)
)

;

-- Table: suppliers

CREATE TABLE suppliers (
	id UUID NOT NULL, 
	name TEXT NOT NULL, 
	contact_info TEXT, 
	address TEXT, 
	PRIMARY KEY (id)
)

;

-- Table: stage_defs

CREATE TABLE stage_defs (
	id UUID NOT NULL, 
	code TEXT NOT NULL, 
	name_ru TEXT NOT NULL, 
	name_de TEXT, 
	requires_photos_min INTEGER, 
	requires_measurements BOOLEAN, 
	requires_density BOOLEAN, 
	PRIMARY KEY (id), 
	CONSTRAINT check_stage_code CHECK (code IN ('stage_1_marking','stage_2_excavation','stage_3_conduit','stage_4_cable','stage_5_splice','stage_6_test','stage_7_connect','stage_8_final','stage_9_backfill','stage_10_surface')), 
	UNIQUE (code)
)

;

-- Table: houses

CREATE TABLE houses (
	id UUID NOT NULL, 
	project_id UUID NOT NULL, 
	cabinet_id UUID, 
	address TEXT NOT NULL, 
	house_number TEXT, 
	connection_type TEXT NOT NULL, 
	method TEXT NOT NULL, 
	status TEXT, 
	planned_length_m NUMERIC(10, 2), 
	contact_name TEXT, 
	contact_phone TEXT, 
	contact_email TEXT, 
	appointment_date DATE, 
	appointment_time TEXT, 
	notes TEXT, 
	geom_point JSONB, 
	PRIMARY KEY (id), 
	FOREIGN KEY(project_id) REFERENCES projects (id) ON DELETE CASCADE, 
	FOREIGN KEY(cabinet_id) REFERENCES cabinets (id)
)

;

-- Table: house_documents

CREATE TABLE house_documents (
	id UUID NOT NULL, 
	house_id UUID NOT NULL, 
	doc_type TEXT NOT NULL, 
	file_path TEXT NOT NULL, 
	filename TEXT NOT NULL, 
	upload_date TIMESTAMP WITHOUT TIME ZONE, 
	uploaded_by UUID, 
	PRIMARY KEY (id), 
	FOREIGN KEY(house_id) REFERENCES houses (id) ON DELETE CASCADE, 
	FOREIGN KEY(uploaded_by) REFERENCES users (id)
)

;

-- Table: vehicles

CREATE TABLE vehicles (
	id UUID NOT NULL, 
	plate_number TEXT NOT NULL, 
	type TEXT NOT NULL, 
	brand TEXT, 
	model TEXT, 
	owned BOOLEAN NOT NULL, 
	status TEXT NOT NULL, 
	purchase_price_eur NUMERIC(12, 2), 
	rental_price_per_day_eur NUMERIC(10, 2), 
	rental_price_per_hour_eur NUMERIC(10, 2), 
	fuel_consumption_l_100km NUMERIC(5, 2), 
	current_location TEXT, 
	PRIMARY KEY (id), 
	CONSTRAINT check_vehicle_type CHECK (type IN ('van','truck','trailer','excavator','other')), 
	CONSTRAINT check_vehicle_status CHECK (status IN ('available','in_use','maintenance','broken')), 
	UNIQUE (plate_number)
)

;

-- Table: vehicle_assignments

CREATE TABLE vehicle_assignments (
	id UUID NOT NULL, 
	vehicle_id UUID NOT NULL, 
	project_id UUID NOT NULL, 
	crew_id UUID, 
	from_ts TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	to_ts TIMESTAMP WITHOUT TIME ZONE, 
	is_permanent BOOLEAN, 
	rental_cost_per_day NUMERIC(10, 2), 
	PRIMARY KEY (id), 
	FOREIGN KEY(vehicle_id) REFERENCES vehicles (id), 
	FOREIGN KEY(project_id) REFERENCES projects (id), 
	FOREIGN KEY(crew_id) REFERENCES crews (id)
)

;

-- Table: vehicle_expenses

CREATE TABLE vehicle_expenses (
	id UUID NOT NULL, 
	vehicle_id UUID NOT NULL, 
	type TEXT NOT NULL, 
	amount_eur NUMERIC(10, 2) NOT NULL, 
	date DATE NOT NULL, 
	note TEXT, 
	PRIMARY KEY (id), 
	CONSTRAINT check_expense_type CHECK (type IN ('fuel','repair','toll','parking','other')), 
	FOREIGN KEY(vehicle_id) REFERENCES vehicles (id)
)

;

-- Table: equipment

CREATE TABLE equipment (
	id UUID NOT NULL, 
	type TEXT NOT NULL, 
	name TEXT NOT NULL, 
	inventory_no TEXT, 
	owned BOOLEAN NOT NULL, 
	status TEXT NOT NULL, 
	purchase_price_eur NUMERIC(12, 2), 
	rental_price_per_day_eur NUMERIC(10, 2), 
	rental_price_per_hour_eur NUMERIC(10, 2), 
	current_location TEXT, 
	PRIMARY KEY (id), 
	CONSTRAINT check_equipment_type CHECK (type IN ('machine','tool','measuring_device')), 
	CONSTRAINT check_equipment_status CHECK (status IN ('available','in_use','maintenance','broken'))
)

;

-- Table: equipment_assignments

CREATE TABLE equipment_assignments (
	id UUID NOT NULL, 
	equipment_id UUID NOT NULL, 
	project_id UUID NOT NULL, 
	cabinet_id UUID, 
	crew_id UUID, 
	from_ts TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	to_ts TIMESTAMP WITHOUT TIME ZONE, 
	is_permanent BOOLEAN, 
	rental_cost_per_day NUMERIC(10, 2), 
	PRIMARY KEY (id), 
	FOREIGN KEY(equipment_id) REFERENCES equipment (id), 
	FOREIGN KEY(project_id) REFERENCES projects (id), 
	FOREIGN KEY(cabinet_id) REFERENCES cabinets (id), 
	FOREIGN KEY(crew_id) REFERENCES crews (id)
)

;

-- Table: rentals

CREATE TABLE rentals (
	id UUID NOT NULL, 
	type TEXT NOT NULL, 
	object_id UUID NOT NULL, 
	supplier_id UUID NOT NULL, 
	daily_rate_eur NUMERIC(10, 2) NOT NULL, 
	start_date DATE NOT NULL, 
	end_date_plan DATE NOT NULL, 
	status TEXT NOT NULL, 
	PRIMARY KEY (id), 
	CONSTRAINT check_rental_type CHECK (type IN ('vehicle','equipment','facility')), 
	CONSTRAINT check_rental_status CHECK (status IN ('planned','active','finished','cancelled')), 
	FOREIGN KEY(supplier_id) REFERENCES suppliers (id)
)

;

-- Table: rental_expenses

CREATE TABLE rental_expenses (
	id UUID NOT NULL, 
	rental_id UUID NOT NULL, 
	date DATE NOT NULL, 
	days INTEGER NOT NULL, 
	amount_eur NUMERIC(10, 2) NOT NULL, 
	end_date_plan DATE, 
	status TEXT NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(rental_id) REFERENCES rentals (id)
)

;

-- Table: facilities

CREATE TABLE facilities (
	id UUID NOT NULL, 
	project_id UUID NOT NULL, 
	type TEXT NOT NULL, 
	supplier_id UUID, 
	rent_daily_eur NUMERIC(10, 2) NOT NULL, 
	service_freq TEXT, 
	status TEXT NOT NULL, 
	start_date DATE, 
	end_date DATE, 
	location_text TEXT, 
	geom_point JSONB, 
	PRIMARY KEY (id), 
	FOREIGN KEY(project_id) REFERENCES projects (id) ON DELETE CASCADE, 
	FOREIGN KEY(supplier_id) REFERENCES suppliers (id)
)

;

-- Table: hse_requirements

CREATE TABLE hse_requirements (
	id UUID NOT NULL, 
	project_id UUID NOT NULL, 
	type TEXT NOT NULL, 
	deadline DATE, 
	assignee_user_id UUID, 
	file_url TEXT, 
	status TEXT NOT NULL, 
	notes TEXT, 
	PRIMARY KEY (id), 
	FOREIGN KEY(project_id) REFERENCES projects (id) ON DELETE CASCADE, 
	FOREIGN KEY(assignee_user_id) REFERENCES users (id)
)

;

-- Table: housing_units

CREATE TABLE housing_units (
	id UUID NOT NULL, 
	project_id UUID NOT NULL, 
	address TEXT NOT NULL, 
	rooms_total INTEGER NOT NULL, 
	beds_total INTEGER NOT NULL, 
	rent_daily_eur NUMERIC(10, 2) NOT NULL, 
	status TEXT NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(project_id) REFERENCES projects (id) ON DELETE CASCADE
)

;

-- Table: housing_allocations

CREATE TABLE housing_allocations (
	id UUID NOT NULL, 
	housing_id UUID NOT NULL, 
	user_id UUID NOT NULL, 
	bed_no INTEGER, 
	from_date DATE NOT NULL, 
	to_date DATE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(housing_id) REFERENCES housing_units (id) ON DELETE CASCADE, 
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
)

;

-- Table: asset_assignments

CREATE TABLE asset_assignments (
	id UUID NOT NULL, 
	equipment_id UUID NOT NULL, 
	project_id UUID NOT NULL, 
	cabinet_id UUID, 
	crew_id UUID, 
	from_ts TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	to_ts TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(equipment_id) REFERENCES equipment (id) ON DELETE CASCADE, 
	FOREIGN KEY(project_id) REFERENCES projects (id) ON DELETE CASCADE, 
	FOREIGN KEY(cabinet_id) REFERENCES cabinets (id), 
	FOREIGN KEY(crew_id) REFERENCES crews (id)
)

;

-- Table: material_orders

CREATE TABLE material_orders (
	id UUID NOT NULL, 
	project_id UUID, 
	supplier_id UUID, 
	material_id UUID, 
	qty_ordered NUMERIC(14, 3) NOT NULL, 
	price_per_unit_eur NUMERIC(12, 2) NOT NULL, 
	expected_date DATE, 
	order_date DATE NOT NULL, 
	status TEXT NOT NULL, 
	total_amount NUMERIC(12, 2), 
	PRIMARY KEY (id), 
	CONSTRAINT check_order_status CHECK (status IN ('pending','ordered','received','cancelled')), 
	FOREIGN KEY(project_id) REFERENCES projects (id), 
	FOREIGN KEY(supplier_id) REFERENCES suppliers (id), 
	FOREIGN KEY(material_id) REFERENCES materials (id)
)

;

-- Table: stock_locations

CREATE TABLE stock_locations (
	id UUID NOT NULL, 
	name TEXT NOT NULL, 
	project_id UUID, 
	address TEXT, 
	PRIMARY KEY (id), 
	CONSTRAINT check_location_name CHECK (name IN ('main_warehouse','site_storage','rented_container','other')), 
	FOREIGN KEY(project_id) REFERENCES projects (id)
)

;

-- Table: inventory

CREATE TABLE inventory (
	id UUID NOT NULL, 
	material_id UUID NOT NULL, 
	location_id UUID NOT NULL, 
	qty NUMERIC(14, 3) NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(material_id) REFERENCES materials (id) ON DELETE CASCADE, 
	FOREIGN KEY(location_id) REFERENCES stock_locations (id) ON DELETE CASCADE
)

;

-- Table: material_moves

CREATE TABLE material_moves (
	id UUID NOT NULL, 
	material_id UUID NOT NULL, 
	from_location_id UUID, 
	to_location_id UUID, 
	order_id UUID, 
	qty NUMERIC(14, 3) NOT NULL, 
	move_type TEXT NOT NULL, 
	date DATE NOT NULL, 
	PRIMARY KEY (id), 
	CONSTRAINT check_move_type CHECK (move_type IN ('in','out','transfer','loss','adjustment')), 
	FOREIGN KEY(material_id) REFERENCES materials (id), 
	FOREIGN KEY(from_location_id) REFERENCES stock_locations (id), 
	FOREIGN KEY(to_location_id) REFERENCES stock_locations (id), 
	FOREIGN KEY(order_id) REFERENCES material_orders (id)
)

;

-- Table: house_docs

CREATE TABLE house_docs (
	id UUID NOT NULL, 
	house_id UUID NOT NULL, 
	kind TEXT NOT NULL, 
	file_url TEXT NOT NULL, 
	uploaded_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(house_id) REFERENCES houses (id) ON DELETE CASCADE
)

;

-- Table: house_contacts

CREATE TABLE house_contacts (
	id UUID NOT NULL, 
	house_id UUID NOT NULL, 
	name TEXT NOT NULL, 
	phone TEXT, 
	email TEXT, 
	role TEXT, 
	PRIMARY KEY (id), 
	FOREIGN KEY(house_id) REFERENCES houses (id) ON DELETE CASCADE
)

;

-- Table: appointments

CREATE TABLE appointments (
	id UUID NOT NULL, 
	house_id UUID NOT NULL, 
	crew_id UUID, 
	start_ts TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	end_ts TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	status TEXT NOT NULL, 
	notes TEXT, 
	PRIMARY KEY (id), 
	FOREIGN KEY(house_id) REFERENCES houses (id) ON DELETE CASCADE, 
	FOREIGN KEY(crew_id) REFERENCES crews (id)
)

;

-- Table: resource_requests

CREATE TABLE resource_requests (
	id UUID NOT NULL, 
	request_type TEXT NOT NULL, 
	requested_by UUID NOT NULL, 
	project_id UUID, 
	crew_id UUID, 
	item_name TEXT NOT NULL, 
	material_id UUID, 
	equipment_id UUID, 
	quantity NUMERIC(14, 3) NOT NULL, 
	unit TEXT, 
	urgency TEXT NOT NULL, 
	reason TEXT NOT NULL, 
	description TEXT, 
	delivery_location TEXT, 
	needed_by_date DATE, 
	status TEXT NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	approved_by UUID, 
	approved_at TIMESTAMP WITHOUT TIME ZONE, 
	processed_at TIMESTAMP WITHOUT TIME ZONE, 
	shipped_at TIMESTAMP WITHOUT TIME ZONE, 
	delivered_at TIMESTAMP WITHOUT TIME ZONE, 
	rejected_reason TEXT, 
	notes TEXT, 
	admin_notes TEXT, 
	estimated_cost NUMERIC(12, 2), 
	actual_cost NUMERIC(12, 2), 
	PRIMARY KEY (id), 
	CONSTRAINT check_request_type CHECK (request_type IN ('material', 'equipment', 'tool', 'other')), 
	CONSTRAINT check_urgency CHECK (urgency IN ('low', 'normal', 'high', 'critical')), 
	CONSTRAINT check_request_status CHECK (status IN ('pending', 'approved', 'processing', 'shipped', 'delivered', 'rejected', 'cancelled')), 
	FOREIGN KEY(requested_by) REFERENCES users (id), 
	FOREIGN KEY(project_id) REFERENCES projects (id), 
	FOREIGN KEY(crew_id) REFERENCES crews (id), 
	FOREIGN KEY(material_id) REFERENCES materials (id), 
	FOREIGN KEY(equipment_id) REFERENCES equipment (id), 
	FOREIGN KEY(approved_by) REFERENCES users (id)
)

;

-- Table: activity_log

CREATE TABLE activity_log (
	id UUID NOT NULL, 
	user_id UUID NOT NULL, 
	project_id UUID, 
	activity_type TEXT NOT NULL, 
	object_type TEXT NOT NULL, 
	object_id UUID, 
	action TEXT NOT NULL, 
	description TEXT, 
	extra_data JSONB, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id), 
	FOREIGN KEY(project_id) REFERENCES projects (id)
)

;

-- Table: company_warehouse

CREATE TABLE company_warehouse (
	id UUID NOT NULL, 
	material_id UUID NOT NULL, 
	total_qty NUMERIC(14, 3) NOT NULL, 
	reserved_qty NUMERIC(14, 3) NOT NULL, 
	min_stock_level NUMERIC(14, 3), 
	last_updated TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	UNIQUE (material_id), 
	FOREIGN KEY(material_id) REFERENCES materials (id) ON DELETE CASCADE
)

;

-- Table: constraints

CREATE TABLE constraints (
	id UUID NOT NULL, 
	project_id UUID NOT NULL, 
	segment_id UUID, 
	kind TEXT NOT NULL, 
	description TEXT, 
	geom JSONB, 
	status TEXT, 
	resolved_at TIMESTAMP WITHOUT TIME ZONE, 
	resolved_by UUID, 
	PRIMARY KEY (id), 
	CONSTRAINT check_constraint_kind CHECK (kind IN ('LSA','steel_plate','fire_access','parking','tree','utility_conflict','access_restriction')), 
	CONSTRAINT check_constraint_status CHECK (status IN ('identified','in_progress','resolved','cancelled')), 
	FOREIGN KEY(project_id) REFERENCES projects (id) ON DELETE CASCADE, 
	FOREIGN KEY(segment_id) REFERENCES segments (id), 
	FOREIGN KEY(resolved_by) REFERENCES users (id)
)

;

-- Table: cut_stages

CREATE TABLE cut_stages (
	id UUID NOT NULL, 
	cut_id UUID NOT NULL, 
	stage_code TEXT NOT NULL, 
	status TEXT, 
	started_at TIMESTAMP WITHOUT TIME ZONE, 
	closed_at TIMESTAMP WITHOUT TIME ZONE, 
	closed_by UUID, 
	photos_count INTEGER, 
	density_tests_count INTEGER, 
	PRIMARY KEY (id), 
	CONSTRAINT check_cut_stage_status CHECK (status IN ('open','in_progress','completed','blocked')), 
	FOREIGN KEY(cut_id) REFERENCES cuts (id) ON DELETE CASCADE, 
	FOREIGN KEY(closed_by) REFERENCES users (id)
)

;

-- Table: equipment_maintenance

CREATE TABLE equipment_maintenance (
	id UUID NOT NULL, 
	equipment_id UUID NOT NULL, 
	date DATE NOT NULL, 
	description TEXT NOT NULL, 
	cost_eur NUMERIC(10, 2) NOT NULL, 
	performed_by TEXT, 
	PRIMARY KEY (id), 
	FOREIGN KEY(equipment_id) REFERENCES equipment (id)
)

;

-- Table: house_status

CREATE TABLE house_status (
	id UUID NOT NULL, 
	house_id UUID NOT NULL, 
	status TEXT NOT NULL, 
	reason TEXT, 
	changed_by UUID, 
	changed_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(house_id) REFERENCES houses (id) ON DELETE CASCADE, 
	FOREIGN KEY(changed_by) REFERENCES users (id)
)

;

-- Table: material_stage_mapping

CREATE TABLE material_stage_mapping (
	id UUID NOT NULL, 
	stage_name TEXT NOT NULL, 
	material_id UUID NOT NULL, 
	typical_quantity NUMERIC(10, 2), 
	is_required BOOLEAN, 
	notes TEXT, 
	PRIMARY KEY (id), 
	FOREIGN KEY(material_id) REFERENCES materials (id)
)

;

-- Table: offmass_lines

CREATE TABLE offmass_lines (
	id UUID NOT NULL, 
	project_id UUID NOT NULL, 
	description TEXT NOT NULL, 
	quantity NUMERIC(12, 3) NOT NULL, 
	unit_price NUMERIC(12, 2) NOT NULL, 
	total_amount NUMERIC(12, 2) NOT NULL, 
	date DATE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(project_id) REFERENCES projects (id)
)

;

-- Table: photos

CREATE TABLE photos (
	id UUID NOT NULL, 
	work_entry_id UUID, 
	cut_stage_id UUID, 
	url TEXT NOT NULL, 
	ts TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	gps_lat NUMERIC(10, 6), 
	gps_lon NUMERIC(10, 6), 
	author_user_id UUID, 
	label TEXT, 
	PRIMARY KEY (id), 
	CONSTRAINT check_photo_label CHECK (label IN ('before','during','after','instrument','other')), 
	FOREIGN KEY(work_entry_id) REFERENCES work_entries (id) ON DELETE CASCADE, 
	FOREIGN KEY(author_user_id) REFERENCES users (id)
)

;

-- Table: plan_view_confirms

CREATE TABLE plan_view_confirms (
	id UUID NOT NULL, 
	project_id UUID NOT NULL, 
	user_id UUID NOT NULL, 
	segment_id UUID, 
	street_name TEXT, 
	viewed_at TIMESTAMP WITHOUT TIME ZONE, 
	confirmed BOOLEAN, 
	PRIMARY KEY (id), 
	FOREIGN KEY(project_id) REFERENCES projects (id) ON DELETE CASCADE, 
	FOREIGN KEY(user_id) REFERENCES users (id), 
	FOREIGN KEY(segment_id) REFERENCES segments (id)
)

;

-- Table: price_extras

CREATE TABLE price_extras (
	id UUID NOT NULL, 
	price_list_id UUID NOT NULL, 
	type TEXT NOT NULL, 
	description TEXT NOT NULL, 
	unit TEXT NOT NULL, 
	rate NUMERIC(12, 2) NOT NULL, 
	PRIMARY KEY (id), 
	CONSTRAINT check_extra_type CHECK (type IN ('LSA','steel_plate','debris_removal','traffic_management','weekend_surcharge')), 
	CONSTRAINT check_extra_unit CHECK (unit IN ('per_m','per_piece','per_day','per_hour','lump_sum')), 
	FOREIGN KEY(price_list_id) REFERENCES price_lists (id) ON DELETE CASCADE
)

;

-- Table: price_lists

CREATE TABLE price_lists (
	id UUID NOT NULL, 
	project_id UUID NOT NULL, 
	name TEXT NOT NULL, 
	valid_from DATE, 
	valid_to DATE, 
	is_active BOOLEAN, 
	PRIMARY KEY (id), 
	FOREIGN KEY(project_id) REFERENCES projects (id) ON DELETE CASCADE
)

;

-- Table: price_rules

CREATE TABLE price_rules (
	id UUID NOT NULL, 
	price_list_id UUID NOT NULL, 
	surface TEXT NOT NULL, 
	depth_band TEXT NOT NULL, 
	rate_per_m NUMERIC(12, 2) NOT NULL, 
	PRIMARY KEY (id), 
	CONSTRAINT check_price_surface CHECK (surface IN ('asphalt','concrete','dirt','grass','paving')), 
	CONSTRAINT check_price_depth CHECK (depth_band IN ('0-50cm','50-80cm','80-120cm','120cm+')), 
	FOREIGN KEY(price_list_id) REFERENCES price_lists (id) ON DELETE CASCADE
)

;

-- Table: project_files

CREATE TABLE project_files (
	id UUID NOT NULL, 
	project_id UUID NOT NULL, 
	type TEXT NOT NULL, 
	file_url TEXT NOT NULL, 
	filename TEXT, 
	version TEXT, 
	uploaded_by UUID, 
	uploaded_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	CONSTRAINT check_file_type CHECK (type IN ('traffic_plan','utility_plan','site_plan','contract','permit','other')), 
	FOREIGN KEY(project_id) REFERENCES projects (id) ON DELETE CASCADE, 
	FOREIGN KEY(uploaded_by) REFERENCES users (id)
)

;

-- Table: resource_usage

CREATE TABLE resource_usage (
	id UUID NOT NULL, 
	resource_type TEXT NOT NULL, 
	resource_id UUID NOT NULL, 
	project_id UUID, 
	crew_id UUID, 
	user_id UUID, 
	usage_date DATE NOT NULL, 
	quantity_used NUMERIC(14, 3), 
	hours_used NUMERIC(10, 2), 
	cost_eur NUMERIC(12, 2), 
	notes TEXT, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	CONSTRAINT check_resource_type CHECK (resource_type IN ('material', 'equipment', 'vehicle')), 
	FOREIGN KEY(project_id) REFERENCES projects (id), 
	FOREIGN KEY(crew_id) REFERENCES crews (id), 
	FOREIGN KEY(user_id) REFERENCES users (id)
)

;

-- Table: utility_contacts

CREATE TABLE utility_contacts (
	id UUID NOT NULL, 
	project_id UUID NOT NULL, 
	kind TEXT NOT NULL, 
	org_name TEXT NOT NULL, 
	phone TEXT, 
	email TEXT, 
	contact_person TEXT, 
	notes TEXT, 
	PRIMARY KEY (id), 
	CONSTRAINT check_utility_kind CHECK (kind IN ('power','water','gas','telecom','road','municipality','emergency')), 
	FOREIGN KEY(project_id) REFERENCES projects (id) ON DELETE CASCADE
)

;

-- Table: vehicle_tracking

CREATE TABLE vehicle_tracking (
	id UUID NOT NULL, 
	vehicle_id UUID NOT NULL, 
	timestamp TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	lat NUMERIC(10, 7), 
	lon NUMERIC(10, 7), 
	PRIMARY KEY (id), 
	FOREIGN KEY(vehicle_id) REFERENCES vehicles (id)
)

;

-- Create indexes for performance

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_pm_user_id ON projects(pm_user_id);
CREATE INDEX IF NOT EXISTS idx_cabinets_project_id ON cabinets(project_id);
CREATE INDEX IF NOT EXISTS idx_segments_cabinet_id ON segments(cabinet_id);
CREATE INDEX IF NOT EXISTS idx_segments_status ON segments(status);
CREATE INDEX IF NOT EXISTS idx_cuts_segment_id ON cuts(segment_id);
CREATE INDEX IF NOT EXISTS idx_work_entries_project_id ON work_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_work_entries_cut_id ON work_entries(cut_id);
CREATE INDEX IF NOT EXISTS idx_work_entries_created_by ON work_entries(created_by);
CREATE INDEX IF NOT EXISTS idx_work_entries_approved_by ON work_entries(approved_by);
CREATE INDEX IF NOT EXISTS idx_costs_project_id ON costs(project_id);
CREATE INDEX IF NOT EXISTS idx_material_allocations_project_id ON material_allocations(project_id);
CREATE INDEX IF NOT EXISTS idx_crew_members_user_id ON crew_members(user_id);
CREATE INDEX IF NOT EXISTS idx_crew_members_crew_id ON crew_members(crew_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_project_id ON activity_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON activity_logs(timestamp);

-- Insert basic data

INSERT INTO users (id, first_name, last_name, email, phone, role, is_active) VALUES ('550e8400-e29b-41d4-a716-446655440001', 'Admin', 'User', 'admin@fiber.com', '+1234567890', 'admin', true) ON CONFLICT (email) DO NOTHING;
INSERT INTO users (id, first_name, last_name, email, phone, role, is_active) VALUES ('550e8400-e29b-41d4-a716-446655440002', 'Project', 'Manager', 'pm1@fiber.com', '+1234567891', 'pm', true) ON CONFLICT (email) DO NOTHING;
INSERT INTO users (id, first_name, last_name, email, phone, role, is_active) VALUES ('550e8400-e29b-41d4-a716-446655440003', 'Team', 'Foreman', 'foreman1@fiber.com', '+1234567892', 'foreman', true) ON CONFLICT (email) DO NOTHING;
INSERT INTO users (id, first_name, last_name, email, phone, role, is_active) VALUES ('550e8400-e29b-41d4-a716-446655440004', 'Worker', 'One', 'worker1@fiber.com', '+1234567893', 'crew', true) ON CONFLICT (email) DO NOTHING;
INSERT INTO users (id, first_name, last_name, email, phone, role, is_active) VALUES ('550e8400-e29b-41d4-a716-446655440005', 'Viewer', 'User', 'viewer1@fiber.com', '+1234567894', 'viewer', true) ON CONFLICT (email) DO NOTHING;

INSERT INTO stage_defs (id, name, description, photos_required, gps_required, seq_order) VALUES ('550e8400-e29b-41d4-a716-446655440010', 'Preparation', 'Site preparation and marking', 1, true, 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO stage_defs (id, name, description, photos_required, gps_required, seq_order) VALUES ('550e8400-e29b-41d4-a716-446655440011', 'Excavation', 'Digging and trenching', 2, true, 2) ON CONFLICT (id) DO NOTHING;
INSERT INTO stage_defs (id, name, description, photos_required, gps_required, seq_order) VALUES ('550e8400-e29b-41d4-a716-446655440012', 'Cable Installation', 'Fiber cable installation', 2, true, 3) ON CONFLICT (id) DO NOTHING;
INSERT INTO stage_defs (id, name, description, photos_required, gps_required, seq_order) VALUES ('550e8400-e29b-41d4-a716-446655440013', 'Restoration', 'Site restoration and cleanup', 2, true, 4) ON CONFLICT (id) DO NOTHING;

-- End of schema
COMMIT;
