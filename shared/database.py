import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.exc import SQLAlchemyError
import logging
from dotenv import load_dotenv

# Optional Streamlit import
try:
    import streamlit as st
    HAS_STREAMLIT = True
except ImportError:
    HAS_STREAMLIT = False

# Load environment variables from .env file
load_dotenv()

# Database configuration
DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    # Supabase connection
    DATABASE_URL = "postgresql://postgres.oijmohlhdxoawzvctnxx:Iasaninja1973..@aws-1-eu-north-1.pooler.supabase.com:6543/postgres"

# Create engine
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=300,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_database_engine():
    """Get cached database engine"""
    return engine

# Apply Streamlit caching if available
if HAS_STREAMLIT:
    get_database_engine = st.cache_resource(get_database_engine)

def get_session() -> Session:
    """Get database session"""
    return SessionLocal()

def init_database():
    """Initialize database with tables and basic data"""
    try:
        from models import Base

        # Create all tables
        Base.metadata.create_all(bind=engine)

        # Initialize basic data
        init_basic_data()

        if HAS_STREAMLIT:
            st.success("Database initialized successfully")
        else:
            logging.info("Database initialized successfully")

    except Exception as e:
        if HAS_STREAMLIT:
            st.error(f"Database initialization failed: {str(e)}")
        else:
            logging.error(f"Database initialization failed: {str(e)}")
        logging.error(f"Database initialization error: {str(e)}")

def init_basic_data():
    """Initialize basic data like stage definitions and admin user"""
    session = get_session()
    
    try:
        from models import StageDef, User
        
        # Check if stage definitions exist
        stage_count = session.query(StageDef).count()
        if stage_count == 0:
            # Add basic stage definitions matching the constraint
            stages = [
                StageDef(
                    code="stage_1_marking",
                    name_ru="Разметка",
                    name_de="Markierung",
                    requires_photos_min=2,
                    requires_measurements=True,
                    requires_density=False
                ),
                StageDef(
                    code="stage_2_excavation",
                    name_ru="Выемка грунта",
                    name_de="Aushub",
                    requires_photos_min=3,
                    requires_measurements=True,
                    requires_density=False
                ),
                StageDef(
                    code="stage_3_conduit",
                    name_ru="Укладка труб",
                    name_de="Rohrverlegung",
                    requires_photos_min=3,
                    requires_measurements=True,
                    requires_density=False
                ),
                StageDef(
                    code="stage_4_cable",
                    name_ru="Прокладка кабеля",
                    name_de="Kabelverlegung",
                    requires_photos_min=3,
                    requires_measurements=True,
                    requires_density=False
                ),
                StageDef(
                    code="stage_5_splice",
                    name_ru="Сварка",
                    name_de="Spleißen",
                    requires_photos_min=3,
                    requires_measurements=True,
                    requires_density=False
                ),
                StageDef(
                    code="stage_6_test",
                    name_ru="Тестирование",
                    name_de="Testen",
                    requires_photos_min=2,
                    requires_measurements=True,
                    requires_density=False
                )
            ]
            
            for stage in stages:
                session.add(stage)
        
        # Check if admin user exists
        admin_count = session.query(User).filter(User.role == 'admin').count()
        if admin_count == 0:
            # Create default admin user
            admin_user = User(
                first_name="Admin",
                last_name="User",
                email="admin@example.com",
                phone="+1234567890",
                role="admin",
                lang_pref="en",
                is_active=True
            )
            session.add(admin_user)
        
        session.commit()
        
    except Exception as e:
        session.rollback()
        logging.error(f"Error initializing basic data: {str(e)}")
        raise e
    finally:
        session.close()

def execute_raw_sql(query: str, params: dict = None):
    """Execute raw SQL query"""
    session = get_session()
    try:
        result = session.execute(text(query), params or {})
        session.commit()
        return result
    except Exception as e:
        session.rollback()
        raise e
    finally:
        session.close()

def test_connection():
    """Test database connection"""
    try:
        session = get_session()
        session.execute(text("SELECT 1"))
        session.close()
        return True
    except Exception as e:
        logging.error(f"Database connection test failed: {str(e)}")
        return False

def get_db() -> Session:
    """FastAPI database dependency - returns a database session"""
    session = get_session()
    try:
        yield session
    except Exception as e:
        session.rollback()
        raise e
    finally:
        session.close()
