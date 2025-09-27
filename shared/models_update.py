# Additional model definitions to add to models.py

from sqlalchemy import Column, Text, Numeric, Boolean, Date, DateTime, ForeignKey, UUID, CheckConstraint
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

# Company Warehouse Model
class CompanyWarehouse(Base):
    __tablename__ = 'company_warehouse'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    material_id = Column(UUID(as_uuid=True), ForeignKey('materials.id', ondelete='CASCADE'), nullable=False, unique=True)
    total_qty = Column(Numeric(14, 3), nullable=False, default=0)
    reserved_qty = Column(Numeric(14, 3), nullable=False, default=0)
    min_stock_level = Column(Numeric(14, 3), default=0)
    last_updated = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    material = relationship("Material")
    
    @property
    def available_qty(self):
        return float(self.total_qty - self.reserved_qty)

# Material Allocations Model
class MaterialAllocation(Base):
    __tablename__ = 'material_allocations'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    material_id = Column(UUID(as_uuid=True), ForeignKey('materials.id'), nullable=False)
    project_id = Column(UUID(as_uuid=True), ForeignKey('projects.id'), nullable=True)
    crew_id = Column(UUID(as_uuid=True), ForeignKey('crews.id'), nullable=True)
    allocated_qty = Column(Numeric(14, 3), nullable=False)
    used_qty = Column(Numeric(14, 3), default=0)
    allocation_date = Column(Date, nullable=False, default=datetime.now().date())
    return_date = Column(Date, nullable=True)
    status = Column(Text, nullable=False, default='allocated')
    notes = Column(Text)
    allocated_by = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    
    # Relationships
    material = relationship("Material")
    project = relationship("Project")
    crew = relationship("Crew")
    allocator = relationship("User")
    
    __table_args__ = (
        CheckConstraint("status IN ('allocated', 'partially_used', 'fully_used', 'returned')", name='check_allocation_status'),
        CheckConstraint("project_id IS NOT NULL OR crew_id IS NOT NULL", name='check_allocation_target'),
    )

# Resource Usage Model
class ResourceUsage(Base):
    __tablename__ = 'resource_usage'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    resource_type = Column(Text, nullable=False)  # 'material', 'equipment', 'vehicle'
    resource_id = Column(UUID(as_uuid=True), nullable=False)
    project_id = Column(UUID(as_uuid=True), ForeignKey('projects.id'), nullable=True)
    crew_id = Column(UUID(as_uuid=True), ForeignKey('crews.id'), nullable=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=True)
    usage_date = Column(Date, nullable=False, default=datetime.now().date())
    quantity_used = Column(Numeric(14, 3))
    hours_used = Column(Numeric(10, 2))
    cost_eur = Column(Numeric(12, 2))
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    project = relationship("Project")
    crew = relationship("Crew")
    user = relationship("User")
    
    __table_args__ = (
        CheckConstraint("resource_type IN ('material', 'equipment', 'vehicle')", name='check_resource_type'),
    )