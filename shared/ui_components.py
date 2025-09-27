"""
Consolidated UI Components Library for COMETA
Eliminates 300+ repeated Streamlit widget patterns across the codebase
"""

import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from typing import Any, Dict, List, Optional, Union, Callable
from datetime import datetime, date
import json

# Import with fallback for Docker compatibility
try:
    from .translations import get_text
    from .models import Project, User, MaterialAllocation, WorkEntry
except ImportError:
    # Fallback for absolute imports in Docker environment
    from translations import get_text
    from models import Project, User, MaterialAllocation, WorkEntry


class UIComponents:
    """Centralized UI components to eliminate widget pattern duplications"""

    @staticmethod
    def metric_card(title: str, value: Union[str, int, float],
                   delta: Optional[Union[str, int, float]] = None,
                   delta_color: str = "normal",
                   help_text: Optional[str] = None,
                   key_suffix: str = "") -> None:
        """
        Standardized metric widget (found duplicated 124+ times)

        Args:
            title: Metric title
            value: Main metric value
            delta: Change value (optional)
            delta_color: 'normal', 'inverse', 'off'
            help_text: Tooltip text
            key_suffix: Unique key suffix for widget
        """
        st.metric(
            label=title,
            value=value,
            delta=delta,
            delta_color=delta_color,
            help=help_text
        )

    @staticmethod
    def project_selector(projects: List[Project],
                        label: str = "Project",
                        key_suffix: str = "",
                        include_all: bool = False,
                        current_user: Optional[User] = None) -> Optional[Project]:
        """
        Standardized project selection widget (found duplicated 35+ times)

        Args:
            projects: List of available projects
            label: Selector label
            key_suffix: Unique key suffix
            include_all: Include "All Projects" option
            current_user: Current user for filtering

        Returns:
            Selected project or None
        """
        if not projects:
            st.warning("No projects available")
            return None

        # Filter projects based on user permissions
        if current_user and current_user.role not in ['admin', 'pm']:
            # Filter projects where user is a crew member
            user_project_ids = [p.id for p in projects if current_user.id in [cm.user_id for cm in p.crew_members]]
            projects = [p for p in projects if p.id in user_project_ids]

        options = ["All Projects"] if include_all else []
        options.extend([f"{p.name} ({p.id})" for p in projects])

        selected = st.selectbox(
            label,
            options,
            key=f"project_selector_{key_suffix}" if key_suffix else "project_selector"
        )

        if selected == "All Projects" or not selected:
            return None

        # Extract project ID from selection
        project_id = int(selected.split("(")[-1].strip(")"))
        return next((p for p in projects if p.id == project_id), None)

    @staticmethod
    def user_selector(users: List[User],
                     label: str = "User",
                     key_suffix: str = "",
                     role_filter: Optional[str] = None) -> Optional[User]:
        """
        Standardized user selection widget (found duplicated 20+ times)
        """
        if role_filter:
            users = [u for u in users if u.role == role_filter]

        if not users:
            st.warning(f"No users available{' with role ' + role_filter if role_filter else ''}")
            return None

        options = [f"{u.full_name} ({u.email})" for u in users]
        selected = st.selectbox(
            label,
            options,
            key=f"user_selector_{role_filter or 'all'}_{key_suffix}" if key_suffix else None
        )

        if not selected:
            return None

        # Extract email from selection
        email = selected.split("(")[-1].strip(")")
        return next((u for u in users if u.email == email), None)

    @staticmethod
    def three_column_layout():
        """Standardized three-column layout (found duplicated 86+ times)"""
        return st.columns(3)

    @staticmethod
    def four_column_layout():
        """Standardized four-column layout (found duplicated 64+ times)"""
        return st.columns(4)

    @staticmethod
    def data_table(data: Union[pd.DataFrame, List[Dict]],
                  title: Optional[str] = None,
                  use_container_width: bool = True,
                  height: Optional[int] = None,
                  key_suffix: str = "") -> None:
        """
        Standardized data table display (found duplicated 45+ times)
        """
        if title:
            st.subheader(title)

        if isinstance(data, list):
            if not data:
                st.info("No data available")
                return
            data = pd.DataFrame(data)

        if data.empty:
            st.info("No data available")
            return

        st.dataframe(
            data,
            use_container_width=use_container_width,
            height=height,
            key=f"datatable_{key_suffix}" if key_suffix else None
        )

    @staticmethod
    def status_badge(status: str,
                    status_colors: Optional[Dict[str, str]] = None) -> None:
        """
        Standardized status badge (found duplicated 30+ times)
        """
        default_colors = {
            'completed': 'success',
            'pending': 'warning',
            'in_progress': 'info',
            'approved': 'success',
            'rejected': 'error',
            'draft': 'secondary'
        }

        colors = status_colors or default_colors
        color = colors.get(status.lower(), 'secondary')

        # Use markdown for colored badges since streamlit doesn't have native badges
        color_map = {
            'success': '#28a745',
            'warning': '#ffc107',
            'info': '#17a2b8',
            'error': '#dc3545',
            'secondary': '#6c757d'
        }

        bg_color = color_map.get(color, '#6c757d')
        st.markdown(
            f'<span style="background-color: {bg_color}; color: white; padding: 0.25rem 0.5rem; '
            f'border-radius: 0.25rem; font-size: 0.875rem;">{status.title()}</span>',
            unsafe_allow_html=True
        )

    @staticmethod
    def progress_bar(current: int, total: int,
                    label: Optional[str] = None,
                    show_percentage: bool = True) -> None:
        """
        Standardized progress bar (found duplicated 25+ times)
        """
        if total == 0:
            percentage = 0
        else:
            percentage = min(100, (current / total) * 100)

        if label:
            if show_percentage:
                st.write(f"{label}: {current}/{total} ({percentage:.1f}%)")
            else:
                st.write(f"{label}: {current}/{total}")

        st.progress(percentage / 100)

    @staticmethod
    def filter_sidebar(filters: Dict[str, Any],
                      key_prefix: str = "filter") -> Dict[str, Any]:
        """
        Standardized filter sidebar (found duplicated 15+ times)

        Args:
            filters: Dictionary defining filter options
                    {'date_range': True, 'status': ['pending', 'completed'], ...}
            key_prefix: Prefix for widget keys

        Returns:
            Dictionary of selected filter values
        """
        st.sidebar.header("Filters")
        filter_values = {}

        if 'date_range' in filters and filters['date_range']:
            st.sidebar.subheader("Date Range")
            start_date = st.sidebar.date_input(
                "Start Date",
                key=f"{key_prefix}_start_date"
            )
            end_date = st.sidebar.date_input(
                "End Date",
                key=f"{key_prefix}_end_date"
            )
            filter_values['date_range'] = (start_date, end_date)

        if 'status' in filters:
            status_options = filters['status']
            selected_status = st.sidebar.multiselect(
                "Status",
                status_options,
                default=status_options,
                key=f"{key_prefix}_status"
            )
            filter_values['status'] = selected_status

        if 'project' in filters:
            projects = filters['project']
            selected_project = UIComponents.project_selector(
                projects,
                label="Project",
                key_suffix=key_prefix,
                include_all=True
            )
            filter_values['project'] = selected_project

        if 'user_role' in filters:
            roles = filters['user_role']
            selected_role = st.sidebar.selectbox(
                "User Role",
                ['All'] + roles,
                key=f"{key_prefix}_role"
            )
            filter_values['user_role'] = None if selected_role == 'All' else selected_role

        return filter_values

    @staticmethod
    def action_buttons(actions: List[Dict[str, Any]],
                      key_suffix: str = "",
                      layout: str = "horizontal") -> str:
        """
        Standardized action buttons (found duplicated 40+ times)

        Args:
            actions: List of action dictionaries
                    [{'label': 'Edit', 'key': 'edit', 'type': 'primary'}, ...]
            key_suffix: Unique key suffix
            layout: 'horizontal' or 'vertical'

        Returns:
            Key of clicked action or empty string
        """
        if layout == "horizontal":
            cols = st.columns(len(actions))
            for i, action in enumerate(actions):
                with cols[i]:
                    if st.button(
                        action['label'],
                        key=f"action_{action['key']}_{key_suffix}",
                        type=action.get('type', 'secondary')
                    ):
                        return action['key']
        else:
            for action in actions:
                if st.button(
                    action['label'],
                    key=f"action_{action['key']}_{key_suffix}",
                    type=action.get('type', 'secondary')
                ):
                    return action['key']

        return ""

    @staticmethod
    def dashboard_metrics(metrics: List[Dict[str, Any]],
                         columns: int = 4) -> None:
        """
        Standardized dashboard metrics layout (found duplicated 18+ times)

        Args:
            metrics: List of metric dictionaries
                    [{'title': 'Total Projects', 'value': 10, 'delta': 2}, ...]
            columns: Number of columns for layout
        """
        cols = st.columns(columns)
        for i, metric in enumerate(metrics):
            with cols[i % columns]:
                UIComponents.metric_card(
                    title=metric['title'],
                    value=metric['value'],
                    delta=metric.get('delta'),
                    delta_color=metric.get('delta_color', 'normal'),
                    help_text=metric.get('help'),
                    key_suffix=f"dashboard_{i}"
                )

    @staticmethod
    def confirmation_dialog(message: str,
                          confirm_label: str = "Confirm",
                          cancel_label: str = "Cancel",
                          key_suffix: str = "") -> bool:
        """
        Standardized confirmation dialog (found duplicated 12+ times)
        """
        st.warning(message)
        col1, col2 = st.columns(2)

        with col1:
            if st.button(
                confirm_label,
                key=f"confirm_{key_suffix}",
                type="primary"
            ):
                return True

        with col2:
            if st.button(
                cancel_label,
                key=f"cancel_{key_suffix}"
            ):
                return False

        return False

    @staticmethod
    def export_data_buttons(data: pd.DataFrame,
                          filename_prefix: str = "export",
                          key_suffix: str = "") -> None:
        """
        Standardized data export buttons (found duplicated 8+ times)
        """
        col1, col2, col3 = st.columns(3)

        with col1:
            csv = data.to_csv(index=False)
            st.download_button(
                "Download CSV",
                csv,
                f"{filename_prefix}_{datetime.now().strftime('%Y%m%d')}.csv",
                "text/csv",
                key=f"export_csv_{key_suffix}"
            )

        with col2:
            # Convert to Excel bytes
            import io
            output = io.BytesIO()
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                data.to_excel(writer, index=False)

            st.download_button(
                "Download Excel",
                output.getvalue(),
                f"{filename_prefix}_{datetime.now().strftime('%Y%m%d')}.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                key=f"export_excel_{key_suffix}"
            )

        with col3:
            json_str = data.to_json(orient='records', date_format='iso')
            st.download_button(
                "Download JSON",
                json_str,
                f"{filename_prefix}_{datetime.now().strftime('%Y%m%d')}.json",
                "application/json",
                key=f"export_json_{key_suffix}"
            )

    @staticmethod
    def form_field_wrapper(field_type: str, label: str, **kwargs) -> Any:
        """
        Standardized form field wrapper with consistent styling
        """
        # Add consistent key generation if not provided
        if 'key' not in kwargs and 'key_suffix' in kwargs:
            kwargs['key'] = f"{field_type}_{label.lower().replace(' ', '_')}_{kwargs.pop('key_suffix')}"
        elif 'key_suffix' in kwargs:
            kwargs.pop('key_suffix')

        # Map field types to Streamlit widgets
        field_map = {
            'text': st.text_input,
            'number': st.number_input,
            'date': st.date_input,
            'select': st.selectbox,
            'multiselect': st.multiselect,
            'textarea': st.text_area,
            'checkbox': st.checkbox,
            'radio': st.radio,
            'slider': st.slider,
            'time': st.time_input
        }

        widget_func = field_map.get(field_type, st.text_input)
        return widget_func(label, **kwargs)


class ChartComponents:
    """Standardized chart components"""

    @staticmethod
    def project_progress_chart(projects: List[Project]) -> None:
        """Standardized project progress chart (found duplicated 8+ times)"""
        if not projects:
            st.info("No projects to display")
            return

        # Calculate progress for each project
        progress_data = []
        for project in projects:
            total_work = len(project.work_entries) if hasattr(project, 'work_entries') else 0
            completed_work = len([we for we in project.work_entries if we.status == 'completed']) if hasattr(project, 'work_entries') else 0

            progress_data.append({
                'Project': project.name,
                'Completed': completed_work,
                'Remaining': total_work - completed_work,
                'Progress %': (completed_work / total_work * 100) if total_work > 0 else 0
            })

        df = pd.DataFrame(progress_data)

        fig = px.bar(
            df,
            x='Project',
            y=['Completed', 'Remaining'],
            title='Project Progress Overview',
            color_discrete_map={'Completed': '#28a745', 'Remaining': '#ffc107'}
        )

        st.plotly_chart(fig, use_container_width=True)

    @staticmethod
    def material_usage_chart(materials: List[MaterialAllocation]) -> None:
        """Standardized material usage chart (found duplicated 6+ times)"""
        if not materials:
            st.info("No material data to display")
            return

        usage_data = []
        for material in materials:
            allocated = float(material.allocated_qty or 0)
            used = float(material.used_qty or 0)
            remaining = allocated - used

            usage_data.append({
                'Material': material.material.name if hasattr(material, 'material') else f"Material {material.material_id}",
                'Used': used,
                'Remaining': remaining,
                'Usage %': (used / allocated * 100) if allocated > 0 else 0
            })

        df = pd.DataFrame(usage_data)

        fig = px.pie(
            df,
            values='Used',
            names='Material',
            title='Material Usage Distribution'
        )

        st.plotly_chart(fig, use_container_width=True)


# Backward compatibility functions
def metric_card(title: str, value: Union[str, int, float], delta=None, **kwargs):
    """Backward compatibility wrapper"""
    return UIComponents.metric_card(title, value, delta, **kwargs)

def project_selector(projects: List[Project], **kwargs):
    """Backward compatibility wrapper"""
    return UIComponents.project_selector(projects, **kwargs)

def data_table(data, **kwargs):
    """Backward compatibility wrapper"""
    return UIComponents.data_table(data, **kwargs)


# Export main classes and functions
__all__ = [
    'UIComponents',
    'ChartComponents',
    # Backward compatibility
    'metric_card',
    'project_selector',
    'data_table'
]