import streamlit as st
import os
from datetime import datetime, date
import uuid
import json
from PIL import Image
import io

def setup_page_config():
    """Setup Streamlit page configuration"""
    st.set_page_config(
        page_title="Fiber Optic Construction Management",
        page_icon="🔌",
        layout="wide",
        initial_sidebar_state="expanded"
    )

def format_currency(amount: float, currency: str = "EUR") -> str:
    """Format currency amount"""
    if amount is None:
        return "€0.00"
    return f"€{amount:,.2f}"

def format_date(date_obj) -> str:
    """Format date for display"""
    if date_obj is None:
        return "N/A"
    if isinstance(date_obj, datetime):
        return date_obj.strftime("%Y-%m-%d")
    elif isinstance(date_obj, date):
        return date_obj.strftime("%Y-%m-%d")
    return str(date_obj)

def format_datetime(datetime_obj) -> str:
    """Format datetime for display"""
    if datetime_obj is None:
        return "N/A"
    if isinstance(datetime_obj, datetime):
        return datetime_obj.strftime("%Y-%m-%d %H:%M")
    return str(datetime_obj)

def safe_float(value, default: float = 0.0) -> float:
    """Safely convert value to float"""
    try:
        return float(value) if value is not None else default
    except (ValueError, TypeError):
        return default

def safe_int(value, default: int = 0) -> int:
    """Safely convert value to int"""
    try:
        return int(value) if value is not None else default
    except (ValueError, TypeError):
        return default

def validate_required_fields(fields: dict) -> tuple[bool, list]:
    """Validate required fields"""
    errors = []
    for field_name, field_value in fields.items():
        if not field_value or (isinstance(field_value, str) and field_value.strip() == ""):
            errors.append(f"{field_name} is required")
    
    return len(errors) == 0, errors

def handle_file_upload(uploaded_file, upload_type: str = "photo") -> str:
    """Handle file upload and return file path - simplified version"""
    if uploaded_file is None:
        return None
    
    try:
        # Create uploads directory if it doesn't exist
        upload_dir = f"uploads/{upload_type}s"
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate unique filename
        file_extension = uploaded_file.name.split('.')[-1].lower() if '.' in uploaded_file.name else 'jpg'
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = os.path.join(upload_dir, unique_filename)
        
        # Save file with proper error handling
        with open(file_path, "wb") as f:
            if hasattr(uploaded_file, 'getbuffer'):
                f.write(uploaded_file.getbuffer())
            elif hasattr(uploaded_file, 'read'):
                f.write(uploaded_file.read())
            else:
                st.error("File format not supported")
                return None
        
        return file_path
        
    except PermissionError:
        st.error("Permission denied: Cannot save file to uploads directory")
        return None
    except Exception as e:
        st.error(f"File upload failed: {str(e)}")
        return None

def improved_file_uploader(label, file_types=['jpg', 'jpeg', 'png'], accept_multiple_files=False, 
                          key_prefix="upload", clear_after_submit=True, **kwargs):
    """
    Improved file uploader with dynamic key rotation for clearing uploads
    
    Args:
        label: Label for the file uploader
        file_types: List of accepted file types
        accept_multiple_files: Whether to accept multiple files
        key_prefix: Prefix for the session state key
        clear_after_submit: Whether to clear the uploader after successful upload
        **kwargs: Additional arguments for st.file_uploader
    
    Returns:
        uploaded_file(s) or None
    """
    import streamlit as st
    
    # Initialize upload key if not exists
    if 'upload_key' not in st.session_state:
        st.session_state.upload_key = 0
    
    # Create unique key for this uploader
    upload_key = f"{key_prefix}_{st.session_state.upload_key}"
    
    try:
        uploaded_file = st.file_uploader(
            label,
            type=file_types,
            accept_multiple_files=accept_multiple_files,
            key=upload_key,
            **kwargs
        )
        
        return uploaded_file
        
    except Exception as e:
        st.warning(f"File upload temporarily unavailable: {str(e)}")
        return None

def clear_file_uploader():
    """Clear file uploader by incrementing the upload key"""
    import streamlit as st
    
    if 'upload_key' not in st.session_state:
        st.session_state.upload_key = 0
    
    st.session_state.upload_key += 1

def display_photo(photo_path: str, caption: str = None, width: int = 300):
    """Display photo with error handling"""
    if not photo_path or not os.path.exists(photo_path):
        st.write("Photo not available")
        return
    
    try:
        image = Image.open(photo_path)
        st.image(image, caption=caption, width=width)
    except Exception as e:
        st.error(f"Error displaying photo: {str(e)}")

def get_status_color(status: str) -> str:
    """Get color for status display"""
    status_colors = {
        'draft': '#FFA500',
        'active': '#32CD32',
        'waiting_invoice': '#FFD700',
        'closed': '#808080',
        'open': '#87CEEB',
        'in_progress': '#FF6347',
        'done': '#32CD32',
        'planned': '#DDA0DD',
        'confirmed': '#32CD32',
        'canceled': '#DC143C'
    }
    return status_colors.get(status, '#000000')

def export_to_csv(data, filename: str = None):
    """Export data to CSV"""
    if filename is None:
        filename = f"export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    
    try:
        csv_data = data.to_csv(index=False)
        st.download_button(
            label="Download CSV",
            data=csv_data,
            file_name=filename,
            mime="text/csv"
        )
    except Exception as e:
        st.error(f"Export failed: {str(e)}")

def create_sidebar_navigation():
    """Create sidebar navigation"""
    from translations import get_text
    
    st.sidebar.title(get_text("navigation"))
    
    pages = {
        "Dashboard": "🏠",
        "Projects": "📋",
        "Work_Entries": "⚡",
        "Teams": "👥",
        "Materials": "📦",
        "Financial": "💰",
        "Reports": "📊"
    }
    
    current_page = st.sidebar.selectbox(
        "Select Page",
        options=list(pages.keys()),
        format_func=lambda x: f"{pages[x]} {get_text(x.lower())}"
    )
    
    return current_page

def calculate_project_progress(project_id: str) -> dict:
    """Calculate project progress metrics"""
    from database import get_session
    from models import WorkEntry, Cut, Project
    
    session = get_session()
    try:
        # Get project
        project = session.query(Project).filter(Project.id == project_id).first()
        if not project:
            return {}
        
        # Get approved work entries
        approved_work = session.query(WorkEntry).filter(
            WorkEntry.project_id == project_id,
            WorkEntry.approved_by.isnot(None)
        ).all()
        
        completed_length = sum(w.meters_done_m or 0 for w in approved_work)
        progress_percentage = (completed_length / project.total_length_m * 100) if project.total_length_m > 0 else 0
        
        # Calculate estimated revenue
        estimated_revenue = completed_length * (project.base_rate_per_m or 0)
        
        return {
            'completed_length': completed_length,
            'total_length': project.total_length_m,
            'progress_percentage': progress_percentage,
            'estimated_revenue': estimated_revenue,
            'work_entries_count': len(approved_work)
        }
        
    except Exception as e:
        st.error(f"Error calculating project progress: {str(e)}")
        return {}
    finally:
        session.close()

def validate_gps_coordinates(lat: float, lon: float) -> bool:
    """Validate GPS coordinates"""
    try:
        lat = float(lat)
        lon = float(lon)
        return -90 <= lat <= 90 and -180 <= lon <= 180
    except (ValueError, TypeError):
        return False

def get_work_entry_summary(work_entry_id: str) -> dict:
    """Get work entry summary with related data"""
    from database import get_session
    from models import WorkEntry, Photo, User, Project
    
    session = get_session()
    try:
        work_entry = session.query(WorkEntry).filter(WorkEntry.id == work_entry_id).first()
        if not work_entry:
            return {}
        
        photos = session.query(Photo).filter(Photo.work_entry_id == work_entry_id).all()
        user = session.query(User).filter(User.id == work_entry.user_id).first()
        project = session.query(Project).filter(Project.id == work_entry.project_id).first()
        
        return {
            'work_entry': work_entry,
            'photos_count': len(photos),
            'user_name': f"{user.first_name} {user.last_name}" if user else "Unknown",
            'project_name': project.name if project else "Unknown",
            'is_approved': work_entry.approved_by is not None
        }
        
    except Exception as e:
        st.error(f"Error getting work entry summary: {str(e)}")
        return {}
    finally:
        session.close()

def safe_dataframe(data):
    """Create DataFrame safely converting UUID objects to strings to avoid PyArrow errors"""
    import pandas as pd
    
    if not data:
        return pd.DataFrame()
    
    # Convert UUID objects to strings in the data
    safe_data = []
    for row in data:
        safe_row = {}
        for key, value in row.items():
            if isinstance(value, uuid.UUID):
                safe_row[key] = str(value)
            elif value is None:
                safe_row[key] = 'N/A'
            else:
                safe_row[key] = value
        safe_data.append(safe_row)
    
    df = pd.DataFrame(safe_data)
    
    # Additional safety check for object columns that might contain UUIDs
    for col in df.columns:
        if df[col].dtype == 'object':
            df[col] = df[col].apply(lambda x: str(x) if x is not None else 'N/A')
    
    return df

def log_activity(activity_type, object_type, object_id, action, description=None, project_id=None, extra_data=None):
    """Log user activity to activity_log table"""
    try:
        from models import ActivityLog
        from database import get_session
        from auth import get_current_user
        
        session = get_session()
        user = get_current_user()
        
        if user:
            activity = ActivityLog(
                user_id=user.id,
                project_id=project_id,
                activity_type=activity_type,
                object_type=object_type,
                object_id=object_id,
                action=action,
                description=description or f"{action} {object_type.lower()}",
                extra_data=extra_data
            )
            session.add(activity)
            session.commit()
            session.close()
            
    except Exception as e:
        # Don't break the app if logging fails - but show the error for debugging
        if session:
            session.rollback()
            session.close()
        print(f"Activity logging error: {str(e)}")

def get_suggested_materials_for_stage(stage_name):
    """Get suggested materials for a work stage with typical quantities"""
    try:
        from models import MaterialStageMapping, Material
        from database import get_session
        session = get_session()
        
        suggestions = session.query(
            MaterialStageMapping, Material
        ).join(
            Material, MaterialStageMapping.material_id == Material.id
        ).filter(
            MaterialStageMapping.stage_name == stage_name
        ).order_by(
            MaterialStageMapping.is_required.desc(),
            Material.name
        ).all()
        
        result = []
        for mapping, material in suggestions:
            result.append({
                'material_id': material.id,
                'material_name': material.name,
                'unit': material.unit,
                'typical_quantity': float(mapping.typical_quantity) if mapping.typical_quantity else 0,
                'is_required': mapping.is_required,
                'notes': mapping.notes,
                'current_stock': 100  # Default stock for demo - would come from stock locations in real system
            })
        
        return result
        
    except Exception as e:
        st.error(f"Error getting material suggestions: {str(e)}")
        return []
    finally:
        session.close()

def populate_default_material_mappings():
    """Populate default material mappings for work stages"""
    try:
        from models import MaterialStageMapping, Material
        from database import get_session
        session = get_session()
        
        # Check if already populated
        existing = session.query(MaterialStageMapping).first()
        if existing:
            return
        
        # Default mappings based on typical fiber construction stages
        default_mappings = {
            'stage_1_plan': [],  # Planning - no materials needed
            'stage_2_excavation': [
                ('Fiber Cable - Single Mode', 100, True, 'Typical cable per 100m segment'),
                ('Conduit Pipe', 105, True, 'Extra 5% for curves and connections'),
            ],
            'stage_3_conduit': [
                ('Conduit Pipe', 100, True, 'Main conduit installation'),
                ('Conduit Connectors', 5, True, 'For joining sections'),
                ('Warning Tape', 100, True, 'Buried cable warning'),
            ],
            'stage_4_cable': [
                ('Fiber Cable - Single Mode', 100, True, 'Main fiber cable'),
                ('Cable Lubricant', 1, True, 'For easier pulling'),
                ('Cable Markers', 10, False, 'Distance markers'),
            ],
            'stage_5_splice': [
                ('Splice Closure', 2, True, 'Connection points'),
                ('Fiber Splice Sleeves', 12, True, 'Individual fiber splicing'),
                ('Cleaning Supplies', 1, True, 'Fiber cleaning kit'),
            ],
            'stage_6_test': [
                ('Testing Equipment', 1, False, 'OTDR testing'),
                ('Test Cables', 2, True, 'Reference cables'),
            ],
            'stage_7_connect': [
                ('Fiber Connectors', 4, True, 'End connections'),
                ('Connector Boots', 4, True, 'Protection'),
                ('Adapter Plates', 2, True, 'Wall/cabinet mounting'),
            ],
            'stage_8_final': [
                ('Documentation Supplies', 1, True, 'Labels and documentation'),
                ('Protective Covers', 2, True, 'Final protection'),
            ],
            'stage_9_cleanup': [
                ('Cleanup Supplies', 1, True, 'Site restoration materials'),
            ],
            'stage_10_inspect': []  # Inspection - no materials needed
        }
        
        for stage_name, materials in default_mappings.items():
            for material_name, quantity, required, notes in materials:
                # Try to find material by name
                material = session.query(Material).filter(Material.name == material_name).first()
                if material:
                    mapping = MaterialStageMapping(
                        stage_name=stage_name,
                        material_id=material.id,
                        typical_quantity=quantity,
                        is_required=required,
                        notes=notes
                    )
                    session.add(mapping)
        
        session.commit()
        
    except Exception as e:
        session.rollback()
        st.error(f"Error populating material mappings: {str(e)}")
    finally:
        session.close()
