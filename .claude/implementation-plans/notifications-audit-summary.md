# Notifications System Audit - Executive Summary
**Date:** 2025-10-24
**Full Report:** `notifications-audit-20251024.md`

---

## Current Status: 40% Complete

### What's Working ✅
- Database schema exists (`in_app_notifications` table with proper indexes)
- API endpoints functional (GET, POST, PUT)
- UI components production-ready (notifications page, real-time updates, filters)
- Manual generation endpoint (`/api/notifications/generate`) with 6 categories
- WebSocket integration for live updates
- TanStack Query hooks for state management
- TypeScript types well-defined

### Critical Gaps ❌
- **No automation** - notifications only generated when button clicked
- **Missing 8/8 notification types** - all lack automatic triggers
- **No background scheduler** - need cron job or pg_cron setup
- **No work entry approval notifications** - no trigger on submission/approval/rejection

---

## Required Notification Types (All Missing Automation)

| Type | Trigger | Current Status | Priority |
|------|---------|----------------|----------|
| 1. Project Start Date | 7/3/1/0 days before | ❌ Manual only | 🔴 Critical |
| 2. Project End Date | 30/14/7/3/1/0 days before | ❌ Manual only | 🔴 Critical |
| 3. Material Delivery | 7/3/1/0/-1 days | ❌ Manual only | 🟠 High |
| 4. Vehicle Documents | 90-day countdown | ✅ Logic exists, manual | 🟠 High |
| 5. Equipment Documents | 90-day countdown | ✅ Logic exists, manual | 🟠 High |
| 6. Maintenance Due | 30-day countdown | ✅ Logic exists, manual | 🟡 Medium |
| 7. Work Entry Approval | On submission | ❌ Not implemented | 🔴 Critical |
| 8. Material Low Stock | Below threshold | ✅ Logic exists, manual | 🟡 Medium |

---

## Implementation Phases (66 Hours Total)

### Phase 1: Infrastructure (16h) 🔴 START HERE
**Goal:** Automate notification generation
- Add `data` JSONB column to database (2h)
- Set up Next.js Cron job (6h)
- Implement deduplication logic (4h)
- Add logging & monitoring (4h)

**Deliverable:** Notifications auto-generate 3x daily (6 AM, 12 PM, 6 PM)

---

### Phase 2: Project & Materials (14h) 🟠
**Goal:** Project deadlines and material delivery alerts
- Project start reminders (4h)
- Project end reminders (4h)
- Material delivery reminders (6h)

**Deliverable:** Managers notified before critical dates

---

### Phase 3: Work Entries (12h) 🟡
**Goal:** Approval workflow notifications
- Database trigger for approval requests (5h)
- Approved notification (3h)
- Rejected notification (4h)

**Deliverable:** Real-time work entry notifications

---

### Phase 4: Documents & Maintenance (16h) 🟢
**Goal:** Track expiring documents and maintenance
- Vehicle document expiration (5h)
- Equipment document expiration (5h)
- Maintenance reminders (6h)

**Deliverable:** Never miss document renewals

---

### Phase 5: Testing & Docs (8h) ⚪
**Goal:** Production-ready system
- Integration tests (4h)
- Performance optimization (2h)
- Documentation updates (2h)

**Deliverable:** Bulletproof notification system

---

## Quick Start Guide (Minimum Viable)

**17 Hours to Core Functionality:**

1. **Add Database Column** (1h)
   ```sql
   ALTER TABLE in_app_notifications ADD COLUMN data JSONB DEFAULT '{}';
   CREATE INDEX idx_notifications_data_gin ON in_app_notifications USING GIN (data);
   ```

2. **Create Cron Endpoint** (4h)
   - File: `/src/app/api/cron/notifications/route.ts`
   - Add to `vercel.json`: `{ "crons": [{ "path": "/api/cron/notifications", "schedule": "0 6,12,18 * * *" }] }`
   - Environment: Add `CRON_SECRET` to Vercel

3. **Project Start Reminders** (4h)
   - File: `/src/app/api/notifications/triggers/project-start-reminders.ts`
   - Query projects with `start_date` in (7, 3, 1, 0) days
   - Notify PM + admins

4. **Work Entry Trigger** (5h)
   - File: `/database/migrations/20251024_work_entry_approval_trigger.sql`
   - PostgreSQL trigger on `work_entries` INSERT
   - Notify PM when `approved = false`

5. **Test & Deploy** (3h)
   - Run migrations in staging
   - Test cron endpoint manually
   - Deploy to production

---

## Critical Decisions

### 1. Automation Strategy
**Choice:** Next.js Cron (Vercel) ⭐ **Recommended**
- **Pros:** Easy setup, native Next.js support, serverless-friendly
- **Cons:** Depends on Vercel platform
- **Alternative:** pg_cron (PostgreSQL native, guaranteed execution)

### 2. Work Entry Notifications
**Choice:** Database Trigger ⭐ **Recommended**
- **Pros:** Reliable, decoupled from API, automatic
- **Cons:** Requires PostgreSQL function
- **Alternative:** Application-level (in API route)

### 3. Deduplication
**Method:** Check for existing notification with same title + user_id in last 24 hours
- Prevents spam (e.g., same document reminder every hour)
- Allows re-notification after 24 hours

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Cron job failures | High | Error logging, email alerts, fallback to manual |
| Duplicate notifications | Medium | Robust deduplication logic |
| Notification fatigue | High | User preferences, priority filtering |
| Database performance | Low | Existing indexes sufficient, optimize queries |

---

## Success Metrics

**Phase 1 Success:**
- ✅ Cron job runs 3x daily without errors
- ✅ Zero duplicate notifications within 24h
- ✅ Execution time < 10 seconds

**Full System Success:**
- ✅ 100% of work entries trigger notifications
- ✅ Project managers notified 7 days before deadlines
- ✅ Document expiration tracked for all vehicles/equipment
- ✅ 80%+ notification open rate (engagement)

---

## Files to Create (20 New Files)

```
/database/migrations/
├── 20251024_add_notifications_data_column.sql
└── 20251024_work_entry_approval_trigger.sql

/src/app/api/cron/notifications/route.ts
/src/app/api/notifications/logs/route.ts
/src/app/api/notifications/triggers/
├── project-start-reminders.ts
├── project-end-reminders.ts
├── material-delivery-reminders.ts
├── vehicle-document-expiration.ts
├── equipment-document-expiration.ts
└── equipment-maintenance-due.ts

/src/lib/notification-helpers.ts
/src/__tests__/notifications/integration.test.ts
/docs/notifications-system.md
/vercel.json (add crons)
/.env.example (add CRON_SECRET)
```

---

## Files to Modify (4 Existing Files)

```
/src/app/api/work-entries/[id]/approve/route.ts  (add notification after line 92)
/src/app/api/work-entries/[id]/reject/route.ts   (add notification)
/src/app/api/notifications/generate/route.ts     (refactor into modular triggers)
/CLAUDE.md                                        (update documentation)
```

---

## Next Actions

1. **Read Full Report:** Review `notifications-audit-20251024.md` (31 pages)
2. **Plan Sprint:** Allocate 2-4 weeks for implementation
3. **Start Phase 1:** Database migration + cron infrastructure (16 hours)
4. **Test in Staging:** Before production deployment
5. **Gather Feedback:** Tune notification thresholds based on user response

---

## Key Technical Details

### Database Schema Enhancement
```sql
-- Add flexible metadata storage
ALTER TABLE in_app_notifications ADD COLUMN data JSONB DEFAULT '{}';

-- Example usage:
data: {
  "project_id": "uuid-here",
  "days_until_start": 7,
  "notification_category": "project_start_reminder"
}
```

### Cron Schedule (Vercel)
```json
{
  "crons": [{
    "path": "/api/cron/notifications",
    "schedule": "0 6,12,18 * * *"
  }]
}
```
**Runs:** 6 AM, 12 PM, 6 PM daily (UTC)

### Database Trigger Example
```sql
CREATE OR REPLACE FUNCTION notify_work_entry_approval_needed()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.approved = false) THEN
    INSERT INTO in_app_notifications (user_id, title, message, priority)
    VALUES (
      (SELECT pm_user_id FROM projects WHERE id = NEW.project_id),
      'Work Entry Awaiting Approval',
      'New work entry requires your review',
      'high'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_work_entry_approval_notification
AFTER INSERT ON work_entries FOR EACH ROW
EXECUTE FUNCTION notify_work_entry_approval_needed();
```

---

## Contact & Questions

**For Implementation Questions:**
- Review full report: `notifications-audit-20251024.md`
- Check existing code: `/src/app/api/notifications/generate/route.ts`
- Test manual generation: Click "Generate Alerts" button at `/dashboard/notifications`

**For Technical Support:**
- Supabase: https://supabase.com/docs
- Next.js Cron: https://vercel.com/docs/cron-jobs
- TanStack Query: https://tanstack.com/query/latest

---

**Audit Complete** ✅
**Total Implementation Time:** 66 hours across 5 phases
**Minimum Viable:** 17 hours for core functionality
**Recommended Start Date:** Week of Nov 1, 2025
**Expected Completion:** End of November 2025
