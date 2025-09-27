"""
Supabase Storage utilities for COMETA
Handles file uploads, downloads, and management
"""

import os
import requests
from typing import Optional, BinaryIO
from datetime import datetime
import uuid

class SupabaseStorageClient:
    """Client for Supabase Storage operations"""
    
    def __init__(self):
        self.base_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
        self.anon_key = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
        
        if not self.base_url or not self.anon_key:
            raise ValueError("Supabase URL and ANON_KEY must be set in environment variables")
        
        self.storage_url = f"{self.base_url}/storage/v1"
        self.headers = {
            'Authorization': f'Bearer {self.anon_key}',
            'apikey': self.anon_key
        }
    
    def upload_file(self, bucket: str, file_path: str, file_data: BinaryIO, 
                   content_type: str = 'application/octet-stream') -> Optional[str]:
        """
        Upload file to Supabase Storage
        
        Args:
            bucket: Storage bucket name
            file_path: Path within bucket (e.g., 'projects/123/photo.jpg')
            file_data: File binary data
            content_type: MIME type of file
            
        Returns:
            Public URL if successful, None if failed
        """
        try:
            url = f"{self.storage_url}/object/{bucket}/{file_path}"
            headers = {**self.headers, 'Content-Type': content_type}
            
            response = requests.post(url, headers=headers, data=file_data)
            
            if response.status_code in [200, 201]:
                return self.get_public_url(bucket, file_path)
            else:
                print(f"Upload failed: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            print(f"Upload error: {str(e)}")
            return None
    
    def get_public_url(self, bucket: str, file_path: str) -> str:
        """Get public URL for a file"""
        return f"{self.storage_url}/object/public/{bucket}/{file_path}"
    
    def delete_file(self, bucket: str, file_path: str) -> bool:
        """Delete file from storage"""
        try:
            url = f"{self.storage_url}/object/{bucket}/{file_path}"
            response = requests.delete(url, headers=self.headers)
            return response.status_code == 200
        except Exception as e:
            print(f"Delete error: {str(e)}")
            return False
    
    def list_files(self, bucket: str, folder: str = "") -> list:
        """List files in bucket/folder"""
        try:
            url = f"{self.storage_url}/object/list/{bucket}"
            data = {"prefix": folder} if folder else {}
            
            response = requests.post(url, headers=self.headers, json=data)
            
            if response.status_code == 200:
                return response.json()
            else:
                return []
        except Exception as e:
            print(f"List files error: {str(e)}")
            return []

def generate_file_path(project_id: str, file_type: str, filename: str) -> str:
    """
    Generate organized file path for storage
    
    Args:
        project_id: Project UUID
        file_type: Type of file ('photos', 'documents', 'reports', etc.)
        filename: Original filename
        
    Returns:
        Organized path like 'projects/abc123/photos/2024/01/filename.jpg'
    """
    now = datetime.now()
    year = now.strftime('%Y')
    month = now.strftime('%m')
    
    # Generate unique filename to avoid conflicts
    file_ext = filename.split('.')[-1] if '.' in filename else ''
    unique_filename = f"{uuid.uuid4().hex}.{file_ext}" if file_ext else str(uuid.uuid4())
    
    return f"projects/{project_id}/{file_type}/{year}/{month}/{unique_filename}"

def upload_work_photo(project_id: str, filename: str, file_data: BinaryIO) -> Optional[str]:
    """Upload work photo to storage"""
    client = SupabaseStorageClient()
    bucket = os.getenv('SUPABASE_WORK_PHOTOS_BUCKET', 'work-photos')
    file_path = generate_file_path(project_id, 'work-photos', filename)
    
    return client.upload_file(bucket, file_path, file_data, 'image/jpeg')

def upload_project_document(project_id: str, filename: str, file_data: BinaryIO) -> Optional[str]:
    """Upload project document to storage"""
    client = SupabaseStorageClient()
    bucket = os.getenv('SUPABASE_PROJECT_DOCUMENTS_BUCKET', 'project-documents')
    file_path = generate_file_path(project_id, 'documents', filename)
    
    # Determine content type
    if filename.lower().endswith('.pdf'):
        content_type = 'application/pdf'
    elif filename.lower().endswith(('.doc', '.docx')):
        content_type = 'application/msword'
    elif filename.lower().endswith(('.xls', '.xlsx')):
        content_type = 'application/vnd.ms-excel'
    else:
        content_type = 'application/octet-stream'
    
    return client.upload_file(bucket, file_path, file_data, content_type)

def upload_user_avatar(user_id: str, filename: str, file_data: BinaryIO) -> Optional[str]:
    """Upload user avatar to storage"""
    client = SupabaseStorageClient()
    bucket = os.getenv('SUPABASE_USER_AVATARS_BUCKET', 'user-avatars')
    file_path = f"users/{user_id}/avatar.jpg"  # Standard avatar path
    
    return client.upload_file(bucket, file_path, file_data, 'image/jpeg')

def upload_house_document(house_id: str, filename: str, file_data: BinaryIO) -> Optional[str]:
    """Upload house document to storage"""
    client = SupabaseStorageClient()
    bucket = os.getenv('SUPABASE_HOUSE_DOCUMENTS_BUCKET', 'house-documents')
    file_path = generate_file_path(house_id, 'documents', filename)
    
    # Determine content type
    if filename.lower().endswith('.pdf'):
        content_type = 'application/pdf'
    elif filename.lower().endswith(('.doc', '.docx')):
        content_type = 'application/msword'
    elif filename.lower().endswith(('.jpg', '.jpeg', '.png')):
        content_type = 'image/jpeg'
    else:
        content_type = 'application/octet-stream'
    
    return client.upload_file(bucket, file_path, file_data, content_type)

def get_storage_info():
    """Get storage configuration info"""
    return {
        'base_url': os.getenv('NEXT_PUBLIC_SUPABASE_URL'),
        'buckets': {
            'project_photos': os.getenv('SUPABASE_PROJECT_PHOTOS_BUCKET', 'project-photos'),
            'work_photos': os.getenv('SUPABASE_WORK_PHOTOS_BUCKET', 'work-photos'),
            'project_documents': os.getenv('SUPABASE_PROJECT_DOCUMENTS_BUCKET', 'project-documents'),
            'house_documents': os.getenv('SUPABASE_HOUSE_DOCUMENTS_BUCKET', 'house-documents'),
            'user_avatars': os.getenv('SUPABASE_USER_AVATARS_BUCKET', 'user-avatars'),
            'reports': os.getenv('SUPABASE_REPORTS_BUCKET', 'reports')
        }
    }

# For backward compatibility with existing code
def save_uploaded_file(uploaded_file, project_id: str = None) -> Optional[str]:
    """
    Save uploaded Streamlit file to storage
    
    Args:
        uploaded_file: Streamlit UploadedFile object
        project_id: Project ID for organization (or 'house_documents' for house files)
        
    Returns:
        Public URL if successful
    """
    if not uploaded_file:
        return None
    
    try:
        # Special handling for house documents
        if project_id == 'house_documents':
            return upload_house_document('general', uploaded_file.name, uploaded_file)
        
        # Determine bucket based on file type
        if uploaded_file.type.startswith('image/'):
            return upload_work_photo(project_id or 'general', uploaded_file.name, uploaded_file)
        else:
            return upload_project_document(project_id or 'general', uploaded_file.name, uploaded_file)
            
    except Exception as e:
        print(f"File upload error: {str(e)}")
        return None