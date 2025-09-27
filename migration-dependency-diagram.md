# COMETA API Routes Migration Dependency Diagram

## Migration Status Overview

```mermaid
graph TB
    subgraph "Migration Status Distribution"
        MIGRATED[MIGRATED<br/>5 routes<br/>5.3%]
        FULL_FASTAPI[FULL_FASTAPI<br/>3 routes<br/>3.2%]
        HYBRID[HYBRID<br/>1 route<br/>1.1%]
        COMPLEX_DB[COMPLEX_DB<br/>3 routes<br/>3.2%]
        SUPABASE_ONLY[SUPABASE_ONLY<br/>83 routes<br/>87.4%]
    end

    style MIGRATED fill:#4CAF50
    style FULL_FASTAPI fill:#FF9800
    style HYBRID fill:#F44336
    style COMPLEX_DB fill:#9C27B0
    style SUPABASE_ONLY fill:#2196F3
```

## Critical Path Migration Dependencies

```mermaid
graph TD
    %% Phase 1: Critical P1 Routes (FastAPI Integration)
    subgraph "Phase 1: P1 Critical Routes"
        A1["/api/teams/crews<br/>FULL_FASTAPI<br/>8h"]
        A2["/api/teams/crews/:id<br/>FULL_FASTAPI<br/>8h"]
        A3["/api/activities<br/>FULL_FASTAPI<br/>8h"]
    end

    %% Phase 2: P2 Hybrid Resolution
    subgraph "Phase 2: P2 Hybrid Resolution"
        B1["/api/projects<br/>HYBRID<br/>12h"]
    end

    %% Phase 3: P3 Complex Operations
    subgraph "Phase 3: P3 Complex Operations"
        C1["/api/users/:id/documents<br/>COMPLEX_DB<br/>16h"]
        C2["/api/materials/orders<br/>COMPLEX_DB<br/>14h"]
        C3["/api/materials/warehouse<br/>COMPLEX_DB<br/>12h"]
        C4["/api/vehicles/assignments<br/>SUPABASE_ONLY<br/>10h"]
        C5["/api/resources/project/:id<br/>SUPABASE_ONLY<br/>10h"]
        C6["/api/financial/summary<br/>SUPABASE_ONLY<br/>10h"]
        C7["/api/dashboard/stats<br/>SUPABASE_ONLY<br/>12h"]
        C8["/api/resources/unified-assignments<br/>SUPABASE_ONLY<br/>10h"]
        C9["/api/project-readiness/:id/checklist<br/>SUPABASE_ONLY<br/>10h"]
    end

    %% Dependencies
    A1 --> A2
    A3 --> |"activities stats"| D1["/api/activities/stats"]

    B1 --> |"project details"| D2["/api/projects/:id"]
    B1 --> |"project documents"| D3["/api/projects/:id/documents"]
    B1 --> |"project team"| D4["/api/projects/:id/team"]
    B1 --> |"project stats"| D5["/api/projects/:id/stats"]

    C1 --> |"documents"| D6["/api/documents"]
    C1 --> |"file upload"| D7["/api/upload"]

    C2 --> |"order details"| D8["/api/materials/orders/:id"]
    C2 --> |"budget management"| D9["/api/materials/orders/:id/budget"]
    C2 --> |"suppliers"| D10["/api/suppliers"]

    C3 --> |"materials"| D11["/api/materials"]
    C3 --> |"low stock"| D12["/api/materials/low-stock"]

    C4 --> |"vehicles"| D13["/api/vehicles"]
    C4 --> |"vehicle resources"| D14["/api/resources/vehicle-assignments"]

    style A1 fill:#FF9800
    style A2 fill:#FF9800
    style A3 fill:#FF9800
    style B1 fill:#F44336
    style C1 fill:#9C27B0
    style C2 fill:#9C27B0
    style C3 fill:#9C27B0
```

## Core System Dependencies

```mermaid
graph LR
    %% Core Systems
    subgraph "Authentication System"
        AUTH1["/api/auth/login<br/>MIGRATED"]
        AUTH2["/api/auth/register<br/>SUPABASE_ONLY"]
        AUTH3["/api/auth/skills<br/>SUPABASE_ONLY"]
    end

    subgraph "User Management"
        USER1["/api/users<br/>MIGRATED"]
        USER2["/api/users/:id<br/>SUPABASE_ONLY"]
        USER3["/api/users/:id/documents<br/>COMPLEX_DB"]
    end

    subgraph "Project System"
        PROJ1["/api/projects<br/>HYBRID"]
        PROJ2["/api/projects/:id<br/>SUPABASE_ONLY"]
        PROJ3["/api/projects/:id/documents<br/>SUPABASE_ONLY"]
        PROJ4["/api/projects/:id/team<br/>SUPABASE_ONLY"]
        PROJ5["/api/projects/:id/stats<br/>SUPABASE_ONLY"]
        PROJ6["/api/projects-optimized<br/>SUPABASE_ONLY"]
        PROJ7["/api/projects-simple<br/>SUPABASE_ONLY"]
    end

    subgraph "Material Management"
        MAT1["/api/materials<br/>SUPABASE_ONLY"]
        MAT2["/api/materials/:id<br/>SUPABASE_ONLY"]
        MAT3["/api/materials/orders<br/>COMPLEX_DB"]
        MAT4["/api/materials/warehouse<br/>COMPLEX_DB"]
        MAT5["/api/materials/allocations<br/>SUPABASE_ONLY"]
        MAT6["/api/materials/unified<br/>SUPABASE_ONLY"]
        MAT7["/api/materials/consume<br/>SUPABASE_ONLY"]
    end

    subgraph "Team & Crew System"
        TEAM1["/api/teams/crews<br/>FULL_FASTAPI"]
        TEAM2["/api/teams/crews/:id<br/>FULL_FASTAPI"]
        TEAM3["/api/crews<br/>SUPABASE_ONLY"]
        TEAM4["/api/crews/:id<br/>SUPABASE_ONLY"]
        TEAM5["/api/crews/:id/members<br/>SUPABASE_ONLY"]
    end

    subgraph "Equipment System"
        EQUIP1["/api/equipment<br/>MIGRATED"]
        EQUIP2["/api/equipment/:id<br/>SUPABASE_ONLY"]
        EQUIP3["/api/equipment/assignments<br/>SUPABASE_ONLY"]
        EQUIP4["/api/equipment/analytics<br/>SUPABASE_ONLY"]
    end

    subgraph "Work Tracking"
        WORK1["/api/work-entries<br/>MIGRATED"]
        WORK2["/api/work-entries/:id<br/>SUPABASE_ONLY"]
        WORK3["/api/work-entries/:id/approve<br/>SUPABASE_ONLY"]
        WORK4["/api/activities<br/>FULL_FASTAPI"]
        WORK5["/api/activities/stats<br/>SUPABASE_ONLY"]
    end

    %% Dependencies
    AUTH1 --> USER1
    USER1 --> USER2
    USER2 --> USER3

    PROJ1 --> PROJ2
    PROJ1 --> PROJ3
    PROJ1 --> PROJ4
    PROJ1 --> PROJ5
    PROJ1 --> PROJ6
    PROJ1 --> PROJ7

    MAT1 --> MAT2
    MAT1 --> MAT3
    MAT1 --> MAT4
    MAT1 --> MAT5
    MAT1 --> MAT6
    MAT1 --> MAT7

    TEAM1 --> TEAM2
    TEAM3 --> TEAM4
    TEAM4 --> TEAM5

    EQUIP1 --> EQUIP2
    EQUIP1 --> EQUIP3
    EQUIP1 --> EQUIP4

    WORK1 --> WORK2
    WORK2 --> WORK3
    WORK4 --> WORK5

    %% Cross-system dependencies
    PROJ1 -.-> MAT1
    PROJ1 -.-> EQUIP1
    PROJ1 -.-> TEAM1
    PROJ1 -.-> WORK1

    style AUTH1 fill:#4CAF50
    style USER1 fill:#4CAF50
    style EQUIP1 fill:#4CAF50
    style WORK1 fill:#4CAF50
    style PROJ1 fill:#F44336
    style TEAM1 fill:#FF9800
    style TEAM2 fill:#FF9800
    style WORK4 fill:#FF9800
    style USER3 fill:#9C27B0
    style MAT3 fill:#9C27B0
    style MAT4 fill:#9C27B0
```

## Migration Priority Timeline

```mermaid
gantt
    title COMETA API Migration Timeline
    dateFormat  YYYY-MM-DD
    section Phase 1 (P1)
    FastAPI Teams Integration    :crit, p1, 2025-01-27, 1w
    section Phase 2 (P2)
    Hybrid Projects Resolution   :crit, p2, after p1, 1.5w
    section Phase 3 (P3)
    Complex DB Operations        :p3, after p2, 6w
    Document Management         :p3-1, after p2, 2w
    Material Orders            :p3-2, after p3-1, 2w
    Warehouse Operations       :p3-3, after p3-2, 1w
    Financial & Analytics      :p3-4, after p3-3, 1w
    section Phase 4 (P4)
    Remaining Routes           :p4, after p3, 11.5w
    Basic CRUD Operations      :p4-1, after p3, 4w
    File Upload Systems        :p4-2, after p4-1, 2w
    Reporting & Analytics      :p4-3, after p4-2, 2w
    Project Preparation        :p4-4, after p4-3, 2w
    Utility Routes            :p4-5, after p4-4, 1.5w
```

## Risk Assessment Matrix

```mermaid
quadrantChart
    title Migration Risk vs Business Impact
    x-axis Low Risk --> High Risk
    y-axis Low Impact --> High Impact
    quadrant-1 Monitor Closely
    quadrant-2 Manage Carefully
    quadrant-3 Watch & Wait
    quadrant-4 Quick Wins

    "/api/auth/login": [0.2, 0.9]
    "/api/projects": [0.8, 0.95]
    "/api/users/:id/documents": [0.9, 0.8]
    "/api/materials/orders": [0.85, 0.8]
    "/api/materials/warehouse": [0.9, 0.8]
    "/api/dashboard/stats": [0.6, 0.8]
    "/api/financial/summary": [0.6, 0.8]
    "/api/teams/crews": [0.5, 0.9]
    "/api/activities": [0.5, 0.7]
    "/api/equipment": [0.3, 0.7]
    "/api/work-entries": [0.3, 0.9]
    "/api/materials": [0.3, 0.8]
    "/api/upload": [0.6, 0.7]
    "/api/documents": [0.5, 0.5]
```

## Summary Statistics

- **Total Routes**: 95
- **Migrated**: 5 (5.3%) - ✅ Complete
- **FastAPI Integration**: 3 (3.2%) - 🔄 In Progress
- **Hybrid Issues**: 1 (1.1%) - ⚠️ Needs Resolution
- **Complex DB**: 3 (3.2%) - 🔴 High Risk
- **Standard Migration**: 83 (87.4%) - 📋 Planned

**Total Estimated Effort**: 796 hours (≈20 weeks with 2 developers)
**Critical Path**: 132 hours (≈3.5 weeks)

**Key Risks**:
- Complex database operations in COMPLEX_DB routes
- File upload and storage dependencies
- Authentication and permission systems
- Inter-service dependencies

**Recommended Approach**:
1. **Phase 1**: Complete FastAPI integration for critical team management
2. **Phase 2**: Resolve hybrid implementation patterns
3. **Phase 3**: Tackle complex database operations with careful testing
4. **Phase 4**: Systematic migration of remaining standard routes