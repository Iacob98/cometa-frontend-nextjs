import streamlit as st
from database import get_session
from models import User
from sqlalchemy.orm import Session

def authenticate_user(email: str = None, password_hash: str = None, phone: str = None, pin: str = None):
    """Authenticate user by email/phone (no password system) or PIN code"""
    if not (email or phone or pin):
        return None
        
    session = get_session()
    try:
        query = session.query(User).filter(User.is_active == True)
        
        if pin:
            # PIN authentication for crew/foreman
            query = query.filter(User.pin_code == pin)
        elif email:
            query = query.filter(User.email == email)
        elif phone:
            query = query.filter(User.phone == phone)
        
        user = query.first()
        
        # Note: No password verification - system uses email/phone/PIN only
        return user
        
    except Exception as e:
        st.error(f"Authentication error: {str(e)}")
        return None
    finally:
        session.close()

def authenticate_by_pin(pin_code: str):
    """Authenticate user by PIN code - simplified for workers"""
    if not pin_code or len(pin_code) < 4:
        return None
        
    session = get_session()
    try:
        user = session.query(User).filter(
            User.pin_code == pin_code,
            User.is_active == True,
            User.role.in_(['crew', 'foreman', 'admin', 'worker'])  # Only roles that can use PIN
        ).first()
        return user
        
    except Exception as e:
        st.error(f"PIN authentication error: {str(e)}")
        return None
    finally:
        session.close()

def authenticate_by_email_and_pin(email: str, pin_code: str):
    """Two-factor authentication: email + PIN code"""
    if not email or not pin_code or len(pin_code) < 4:
        return None
        
    session = get_session()
    try:
        user = session.query(User).filter(
            User.email == email,
            User.pin_code == pin_code,
            User.is_active == True
        ).first()
        return user
        
    except Exception as e:
        st.error(f"Authentication error: {str(e)}")
        return None
    finally:
        session.close()

def get_current_user() -> User:
    """Get current authenticated user from session state"""
    if 'user_id' in st.session_state:
        session = get_session()
        try:
            user = session.query(User).filter(User.id == st.session_state.user_id).first()
            return user
        finally:
            session.close()
    elif 'current_user' in st.session_state:
        return st.session_state.current_user
    return None

def require_auth(required_roles: list = None):
    """Decorator to require authentication and specific roles"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            if not st.session_state.get('authenticated', False):
                st.error("Authentication required")
                st.stop()
            
            user = get_current_user()
            if not user:
                st.error("User not found")
                st.stop()
            
            if required_roles and user.role not in required_roles:
                st.error("Insufficient permissions")
                st.stop()
            
            return func(*args, **kwargs)
        return wrapper
    return decorator

def has_permission(action: str, resource: str = None) -> bool:
    """Check if current user has permission for action"""
    user = get_current_user()
    if not user:
        return False
    
    # Admin has all permissions
    if user.role == 'admin':
        return True
    
    # Project manager permissions
    if user.role == 'pm':
        return action in ['read', 'create', 'update', 'approve']
    
    # Foreman permissions
    if user.role == 'foreman':
        return action in ['read', 'create', 'update']
    
    # Crew permissions
    if user.role == 'crew':
        return action in ['read', 'create']
    
    # Worker permissions (same as crew)
    if user.role == 'worker':
        return action in ['read', 'create']
    
    # Viewer permissions
    if user.role == 'viewer':
        return action == 'read'
    
    return False

def logout_user():
    """Logout current user by clearing session state"""
    if 'authenticated' in st.session_state:
        del st.session_state.authenticated
    if 'current_user' in st.session_state:
        del st.session_state.current_user
    st.success("Успешно вышли из системы")

def get_user_projects() -> list:
    """Get projects accessible to current user"""
    user = get_current_user()
    if not user:
        return []
    
    session = get_session()
    try:
        # Admin and PM can see all projects
        if user.role in ['admin', 'pm']:
            from models import Project
            projects = session.query(Project).all()
            return [p.id for p in projects]
        
        # Crew members and workers see only their assigned projects
        elif user.role in ['crew', 'foreman', 'worker']:
            from models import CrewMember, Crew
            from sqlalchemy import text
            
            # Get projects through crew assignments
            result = session.execute(text("""
                SELECT DISTINCT c.project_id 
                FROM crew_members cm
                JOIN crews c ON cm.crew_id = c.id
                WHERE cm.user_id = :user_id 
                AND cm.active_to IS NULL
            """), {"user_id": user.id})
            
            project_ids = [row[0] for row in result.fetchall()]
            return project_ids
        
        # Viewers can see all projects (read-only)
        elif user.role == 'viewer':
            from models import Project
            projects = session.query(Project).all()
            return [p.id for p in projects]
            
        return []
        
    except Exception as e:
        st.error(f"Error getting user projects: {str(e)}")
        return []
    finally:
        session.close()

def get_user_project_names() -> list:
    """Get project names accessible to current user"""
    user = get_current_user()
    if not user:
        return []
    
    session = get_session()
    try:
        project_ids = get_user_projects()
        if not project_ids:
            return []
        
        from models import Project
        projects = session.query(Project).filter(Project.id.in_(project_ids)).all()
        return [p.name for p in projects]
        
    except Exception as e:
        st.error(f"Error getting project names: {str(e)}")
        return []
    finally:
        session.close()

def filter_data_by_user_projects(query, model, project_field='project_id'):
    """Filter query results by user's accessible projects"""
    user = get_current_user()
    if not user:
        return query.filter(False)  # Return empty query
    
    # Admin and PM see everything
    if user.role in ['admin', 'pm', 'viewer']:
        return query
    
    # Crew members see only their project data
    project_ids = get_user_projects()
    if not project_ids:
        return query.filter(False)  # Return empty query
    
    # Apply project filter
    project_column = getattr(model, project_field)
    return query.filter(project_column.in_(project_ids))

def log_activity(entity_type: str, entity_id: str, action: str, payload: dict = None):
    """Log user activity"""
    user = get_current_user()
    if not user:
        return
    
    session = get_session()
    try:
        from models import ActivityLog
        
        activity = ActivityLog(
            user_id=user.id,
            activity_type='project_updated',
            object_type=entity_type,
            object_id=entity_id,
            action=action,
            description=f"Project {action}",
            extra_data=payload
        )
        
        session.add(activity)
        session.commit()
        
    except Exception as e:
        session.rollback()
        print(f"Error logging activity: {str(e)}")  # Use print instead of st.error
    finally:
        session.close()
