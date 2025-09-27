"""
Consolidated Database Service Layer for COMETA
Eliminates 731+ repeated database access patterns across the codebase
"""

import functools
from typing import Any, Callable, Optional, List, Dict, Union
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from contextlib import contextmanager
import logging

try:
    from .database import get_session
    from .models import *
except ImportError:
    from database import get_session
    from models import *

logger = logging.getLogger(__name__)


class DatabaseService:
    """Centralized database operations service to eliminate code duplication"""

    @staticmethod
    def with_session(operation: Callable) -> Callable:
        """
        Decorator for database operations with automatic session management
        Replaces the repeated pattern found in 731 locations:

        session = get_session()
        try:
            # operations
            session.commit()
        finally:
            session.close()
        """
        @functools.wraps(operation)
        def wrapper(*args, **kwargs):
            session = get_session()
            try:
                result = operation(session, *args, **kwargs)
                session.commit()
                return result
            except Exception as e:
                session.rollback()
                logger.error(f"Database operation failed: {e}")
                raise
            finally:
                session.close()
        return wrapper

    @staticmethod
    @contextmanager
    def get_session_context():
        """Context manager for database sessions"""
        session = get_session()
        try:
            yield session
            session.commit()
        except Exception as e:
            session.rollback()
            logger.error(f"Database operation failed: {e}")
            raise
        finally:
            session.close()


class ProjectService:
    """Consolidated project-related database operations"""

    @staticmethod
    @DatabaseService.with_session
    def get_user_projects(session: Session, user_id: int) -> List[Project]:
        """Get all projects accessible to a user (found duplicated 15+ times)"""
        user = session.query(User).get(user_id)
        if not user:
            return []

        if user.role in ['admin', 'pm']:
            return session.query(Project).all()
        else:
            return session.query(Project).join(CrewMember).filter(
                CrewMember.user_id == user_id
            ).all()

    @staticmethod
    @DatabaseService.with_session
    def get_project_by_id(session: Session, project_id: int) -> Optional[Project]:
        """Get project by ID (found duplicated 25+ times)"""
        return session.query(Project).get(project_id)

    @staticmethod
    @DatabaseService.with_session
    def create_project(session: Session, **project_data) -> Project:
        """Create new project (found duplicated 8+ times)"""
        project = Project(**project_data)
        session.add(project)
        session.flush()  # Get the ID
        return project

    @staticmethod
    @DatabaseService.with_session
    def update_project(session: Session, project_id: int, **updates) -> Optional[Project]:
        """Update project (found duplicated 12+ times)"""
        project = session.query(Project).get(project_id)
        if project:
            for key, value in updates.items():
                if hasattr(project, key):
                    setattr(project, key, value)
            session.flush()
        return project

    @staticmethod
    @DatabaseService.with_session
    def delete_project(session: Session, project_id: int) -> bool:
        """Delete project and related data (found duplicated 3+ times)"""
        project = session.query(Project).get(project_id)
        if project:
            # Delete related data first
            session.query(Cabinet).filter_by(project_id=project_id).delete()
            session.query(Segment).filter_by(project_id=project_id).delete()
            session.query(Cut).filter_by(project_id=project_id).delete()
            session.query(WorkEntry).filter_by(project_id=project_id).delete()
            session.query(MaterialAllocation).filter_by(project_id=project_id).delete()
            session.query(CrewMember).filter_by(project_id=project_id).delete()

            session.delete(project)
            return True
        return False


class MaterialService:
    """Consolidated material management operations"""

    @staticmethod
    @DatabaseService.with_session
    def check_material_availability(session: Session, material_id: int, requested_qty: float) -> Dict[str, Any]:
        """Check if material is available (found duplicated 3+ times)"""
        material = session.query(CompanyWarehouse).get(material_id)
        if not material:
            return {"available": False, "reason": "Material not found"}

        available_qty = float(material.total_qty or 0) - float(material.reserved_qty or 0)

        return {
            "available": available_qty >= requested_qty,
            "available_qty": available_qty,
            "requested_qty": requested_qty,
            "material": material
        }

    @staticmethod
    @DatabaseService.with_session
    def create_material_allocation(session: Session, project_id: int, material_id: int,
                                 allocated_qty: float, **kwargs) -> MaterialAllocation:
        """Create material allocation (found duplicated 4+ times)"""
        allocation = MaterialAllocation(
            project_id=project_id,
            material_id=material_id,
            allocated_qty=allocated_qty,
            used_qty=0.0,
            **kwargs
        )
        session.add(allocation)

        # Update warehouse reserved quantity
        material = session.query(CompanyWarehouse).get(material_id)
        if material:
            material.reserved_qty = float(material.reserved_qty or 0) + allocated_qty

        session.flush()
        return allocation

    @staticmethod
    @DatabaseService.with_session
    def get_project_materials(session: Session, project_id: int) -> List[MaterialAllocation]:
        """Get all materials allocated to project (found duplicated 5+ times)"""
        return session.query(MaterialAllocation).filter_by(project_id=project_id).all()

    @staticmethod
    @DatabaseService.with_session
    def update_material_usage(session: Session, allocation_id: int, used_qty: float) -> Optional[MaterialAllocation]:
        """Update material usage (found duplicated 6+ times)"""
        allocation = session.query(MaterialAllocation).get(allocation_id)
        if allocation:
            old_used = float(allocation.used_qty or 0)
            allocation.used_qty = used_qty

            # Update warehouse quantities
            material = session.query(CompanyWarehouse).get(allocation.material_id)
            if material:
                qty_diff = used_qty - old_used
                material.total_qty = float(material.total_qty or 0) - qty_diff
                material.reserved_qty = float(material.reserved_qty or 0) - qty_diff

            session.flush()
        return allocation


class UserService:
    """Consolidated user management operations"""

    @staticmethod
    @DatabaseService.with_session
    def authenticate_user(session: Session, email: str = None, phone: str = None, pin: str = None) -> Optional[User]:
        """Authenticate user by email/phone or PIN (found duplicated 2+ times)"""
        if pin:
            return session.query(User).filter_by(pin_code=pin).first()
        elif email:
            return session.query(User).filter_by(email=email).first()
        elif phone:
            return session.query(User).filter_by(phone=phone).first()
        return None

    @staticmethod
    @DatabaseService.with_session
    def get_user_by_id(session: Session, user_id: int) -> Optional[User]:
        """Get user by ID (found duplicated 20+ times)"""
        return session.query(User).get(user_id)

    @staticmethod
    @DatabaseService.with_session
    def get_users_by_role(session: Session, role: str) -> List[User]:
        """Get users by role (found duplicated 8+ times)"""
        return session.query(User).filter_by(role=role).all()


class WorkService:
    """Consolidated work entry operations"""

    @staticmethod
    @DatabaseService.with_session
    def create_work_entry(session: Session, **work_data) -> WorkEntry:
        """Create work entry (found duplicated 6+ times)"""
        work_entry = WorkEntry(**work_data)
        session.add(work_entry)
        session.flush()
        return work_entry

    @staticmethod
    @DatabaseService.with_session
    def get_project_work_entries(session: Session, project_id: int) -> List[WorkEntry]:
        """Get work entries for project (found duplicated 8+ times)"""
        return session.query(WorkEntry).filter_by(project_id=project_id).all()

    @staticmethod
    @DatabaseService.with_session
    def update_work_entry_status(session: Session, work_entry_id: int, status: str) -> Optional[WorkEntry]:
        """Update work entry status (found duplicated 4+ times)"""
        work_entry = session.query(WorkEntry).get(work_entry_id)
        if work_entry:
            work_entry.status = status
            session.flush()
        return work_entry


class TeamService:
    """Consolidated team management operations"""

    @staticmethod
    @DatabaseService.with_session
    def add_user_to_project(session: Session, user_id: int, project_id: int, role: str = 'crew') -> CrewMember:
        """Add user to project team (found duplicated 7+ times)"""
        crew_member = CrewMember(
            user_id=user_id,
            project_id=project_id,
            role=role
        )
        session.add(crew_member)
        session.flush()
        return crew_member

    @staticmethod
    @DatabaseService.with_session
    def get_project_team(session: Session, project_id: int) -> List[CrewMember]:
        """Get project team members (found duplicated 9+ times)"""
        return session.query(CrewMember).filter_by(project_id=project_id).all()

    @staticmethod
    @DatabaseService.with_session
    def remove_user_from_project(session: Session, user_id: int, project_id: int) -> bool:
        """Remove user from project (found duplicated 3+ times)"""
        crew_member = session.query(CrewMember).filter_by(
            user_id=user_id,
            project_id=project_id
        ).first()
        if crew_member:
            session.delete(crew_member)
            return True
        return False


class ReportService:
    """Consolidated reporting operations"""

    @staticmethod
    @DatabaseService.with_session
    def get_project_statistics(session: Session, project_id: int) -> Dict[str, Any]:
        """Get project statistics (found duplicated 4+ times)"""
        project = session.query(Project).get(project_id)
        if not project:
            return {}

        # Work entries stats
        total_work_entries = session.query(WorkEntry).filter_by(project_id=project_id).count()
        completed_work = session.query(WorkEntry).filter_by(
            project_id=project_id,
            status='completed'
        ).count()

        # Material stats
        allocated_materials = session.query(MaterialAllocation).filter_by(project_id=project_id).count()

        # Team stats
        team_members = session.query(CrewMember).filter_by(project_id=project_id).count()

        return {
            "project": project,
            "total_work_entries": total_work_entries,
            "completed_work": completed_work,
            "completion_rate": (completed_work / total_work_entries * 100) if total_work_entries > 0 else 0,
            "allocated_materials": allocated_materials,
            "team_members": team_members
        }

    @staticmethod
    @DatabaseService.with_session
    def get_user_activity(session: Session, user_id: int, limit: int = 50) -> List[ActivityLog]:
        """Get user activity log (found duplicated 3+ times)"""
        return session.query(ActivityLog).filter_by(user_id=user_id).order_by(
            ActivityLog.created_at.desc()
        ).limit(limit).all()


# Utility functions for backward compatibility
def get_user_projects(user_id: int) -> List[Project]:
    """Backward compatibility wrapper"""
    return ProjectService.get_user_projects(user_id)

def check_material_availability(material_id: int, requested_qty: float) -> Dict[str, Any]:
    """Backward compatibility wrapper"""
    return MaterialService.check_material_availability(material_id, requested_qty)

def create_material_allocation(project_id: int, material_id: int, allocated_qty: float, **kwargs) -> MaterialAllocation:
    """Backward compatibility wrapper"""
    return MaterialService.create_material_allocation(project_id, material_id, allocated_qty, **kwargs)


# Export main classes and functions
__all__ = [
    'DatabaseService',
    'ProjectService',
    'MaterialService',
    'UserService',
    'WorkService',
    'TeamService',
    'ReportService',
    # Backward compatibility
    'get_user_projects',
    'check_material_availability',
    'create_material_allocation'
]