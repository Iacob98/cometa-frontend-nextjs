"""
Pydantic schemas for FastAPI microservices
"""
from datetime import datetime, date
from decimal import Decimal
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict


# Base schemas
class BaseResponse(BaseModel):
    """Base response model"""
    model_config = ConfigDict(from_attributes=True)


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    service: str
    timestamp: datetime
    database_connected: bool


# User schemas
class UserBase(BaseModel):
    """Base user schema"""
    username: str
    email: str
    full_name: Optional[str] = None
    role: str
    is_active: bool = True
    phone: Optional[str] = None
    pin: Optional[str] = None
    language: str = "ru"


class UserCreate(UserBase):
    """User creation schema"""
    pass


class UserUpdate(BaseModel):
    """User update schema"""
    username: Optional[str] = None
    email: Optional[str] = None
    full_name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    phone: Optional[str] = None
    pin: Optional[str] = None
    language: Optional[str] = None


class UserResponse(UserBase, BaseResponse):
    """User response schema"""
    id: UUID
    created_at: datetime


# Authentication schemas
class LoginRequest(BaseModel):
    """Login request schema"""
    username: str
    pin: Optional[str] = None


class TokenResponse(BaseModel):
    """Token response schema"""
    access_token: str
    token_type: str
    expires_in: int
    user: UserResponse


# Project schemas
class ProjectBase(BaseModel):
    """Base project schema"""
    name: str
    description: Optional[str] = None
    status: str = "active"
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    budget: Optional[Decimal] = None
    location: Optional[str] = None


class ProjectCreate(ProjectBase):
    """Project creation schema"""
    pass


class ProjectUpdate(BaseModel):
    """Project update schema"""
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    budget: Optional[Decimal] = None
    location: Optional[str] = None


class ProjectResponse(ProjectBase, BaseResponse):
    """Project response schema"""
    id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None


# Material schemas
class MaterialBase(BaseModel):
    """Base material schema"""
    name: str
    unit: str
    description: Optional[str] = None
    purchase_price: Optional[Decimal] = None
    selling_price: Optional[Decimal] = None
    current_stock_qty: Optional[Decimal] = None
    min_stock_level: Optional[Decimal] = None


class MaterialCreate(MaterialBase):
    """Material creation schema"""
    pass


class MaterialUpdate(BaseModel):
    """Material update schema"""
    name: Optional[str] = None
    unit: Optional[str] = None
    description: Optional[str] = None
    purchase_price: Optional[Decimal] = None
    selling_price: Optional[Decimal] = None
    current_stock_qty: Optional[Decimal] = None
    min_stock_level: Optional[Decimal] = None


class MaterialResponse(MaterialBase, BaseResponse):
    """Material response schema"""
    id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None


# Supplier schemas
class SupplierBase(BaseModel):
    """Base supplier schema"""
    name: str
    contact_info: Optional[str] = None
    address: Optional[str] = None
    is_active: bool = True


class SupplierCreate(SupplierBase):
    """Supplier creation schema"""
    pass


class SupplierUpdate(BaseModel):
    """Supplier update schema"""
    name: Optional[str] = None
    contact_info: Optional[str] = None
    address: Optional[str] = None
    is_active: Optional[bool] = None


class SupplierResponse(SupplierBase, BaseResponse):
    """Supplier response schema"""
    id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None


# Supplier Material schemas
class SupplierMaterialBase(BaseModel):
    """Base supplier material schema"""
    supplier_id: UUID
    material_type: str
    unit: str
    unit_price_eur: Decimal
    delivery_cost_eur: Optional[Decimal] = None
    min_order_quantity: Optional[Decimal] = None
    project_id: Optional[UUID] = None


class SupplierMaterialCreate(SupplierMaterialBase):
    """Supplier material creation schema"""
    pass


class SupplierMaterialUpdate(BaseModel):
    """Supplier material update schema"""
    material_type: Optional[str] = None
    unit: Optional[str] = None
    unit_price_eur: Optional[Decimal] = None
    delivery_cost_eur: Optional[Decimal] = None
    min_order_quantity: Optional[Decimal] = None
    project_id: Optional[UUID] = None


class SupplierMaterialResponse(SupplierMaterialBase, BaseResponse):
    """Supplier material response schema"""
    id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None


# Material Order schemas
class MaterialOrderBase(BaseModel):
    """Base material order schema"""
    supplier_material_id: UUID
    project_id: UUID
    quantity: Decimal
    total_cost: Decimal
    status: str = "pending"
    order_date: Optional[date] = None
    expected_delivery_date: Optional[date] = None
    actual_delivery_date: Optional[date] = None
    notes: Optional[str] = None


class MaterialOrderCreate(MaterialOrderBase):
    """Material order creation schema"""
    pass


class MaterialOrderUpdate(BaseModel):
    """Material order update schema"""
    quantity: Optional[Decimal] = None
    total_cost: Optional[Decimal] = None
    status: Optional[str] = None
    order_date: Optional[date] = None
    expected_delivery_date: Optional[date] = None
    actual_delivery_date: Optional[date] = None
    notes: Optional[str] = None


class MaterialOrderResponse(MaterialOrderBase, BaseResponse):
    """Material order response schema"""
    id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None


# Work Entry schemas
class WorkEntryBase(BaseModel):
    """Base work entry schema"""
    project_id: UUID
    user_id: UUID
    stage: str
    work_date: date
    description: str
    hours_worked: Optional[Decimal] = None
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None
    status: str = "pending"
    cut_id: Optional[UUID] = None


class WorkEntryCreate(WorkEntryBase):
    """Work entry creation schema"""
    pass


class WorkEntryUpdate(BaseModel):
    """Work entry update schema"""
    stage: Optional[str] = None
    work_date: Optional[date] = None
    description: Optional[str] = None
    hours_worked: Optional[Decimal] = None
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None
    status: Optional[str] = None


class WorkEntryResponse(WorkEntryBase, BaseResponse):
    """Work entry response schema"""
    id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None


# Equipment schemas
class EquipmentBase(BaseModel):
    """Base equipment schema"""
    name: str
    type: str
    daily_rate: Optional[Decimal] = None
    hourly_rate: Optional[Decimal] = None
    is_available: bool = True
    description: Optional[str] = None


class EquipmentCreate(EquipmentBase):
    """Equipment creation schema"""
    pass


class EquipmentUpdate(BaseModel):
    """Equipment update schema"""
    name: Optional[str] = None
    type: Optional[str] = None
    daily_rate: Optional[Decimal] = None
    hourly_rate: Optional[Decimal] = None
    is_available: Optional[bool] = None
    description: Optional[str] = None


class EquipmentResponse(EquipmentBase, BaseResponse):
    """Equipment response schema"""
    id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None


# Financial schemas
class TransactionBase(BaseModel):
    """Base transaction schema"""
    project_id: UUID
    amount: Decimal
    transaction_type: str
    category: str
    description: str
    transaction_date: date
    reference_id: Optional[UUID] = None


class TransactionCreate(TransactionBase):
    """Transaction creation schema"""
    pass


class TransactionUpdate(BaseModel):
    """Transaction update schema"""
    amount: Optional[Decimal] = None
    transaction_type: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    transaction_date: Optional[date] = None


class TransactionResponse(TransactionBase, BaseResponse):
    """Transaction response schema"""
    id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None


# List response schemas
class UserListResponse(BaseModel):
    """User list response"""
    users: List[UserResponse]
    total: int
    page: int
    size: int


class ProjectListResponse(BaseModel):
    """Project list response"""
    projects: List[ProjectResponse]
    total: int
    page: int
    size: int


class MaterialListResponse(BaseModel):
    """Material list response"""
    materials: List[MaterialResponse]
    total: int
    page: int
    size: int


# Error schemas
class ErrorResponse(BaseModel):
    """Error response schema"""
    error: str
    detail: Optional[str] = None
    code: Optional[str] = None