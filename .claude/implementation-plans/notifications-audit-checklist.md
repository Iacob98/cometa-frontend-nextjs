# Notifications System Implementation Checklist

## Quick Reference: 66 Hours Across 5 Phases

---

## Phase 1: Infrastructure & Automation (16h) 🔴 CRITICAL

### 1.1 Database Schema (2h)
- [ ] Create migration file `20251024_add_notifications_data_column.sql`
- [ ] Add `data JSONB DEFAULT '{}'` column to `in_app_notifications`
- [ ] Create GIN index: `idx_in_app_notifications_data_gin`
- [ ] Test migration in development
- [ ] Run migration in staging

### 1.2 Cron Job Infrastructure (6h)
- [ ] Create `/src/app/api/cron/notifications/route.ts`
- [ ] Add `CRON_SECRET` to `.env.example`
- [ ] Add `CRON_SECRET` to Vercel environment variables
- [ ] Configure `vercel.json` with cron schedule: `"0 6,12,18 * * *"`
- [ ] Test cron endpoint manually: `curl -X GET https://domain.com/api/cron/notifications -H "Authorization: Bearer $CRON_SECRET"`
- [ ] Verify cron executes on schedule (wait for first run)

### 1.3 Deduplication Logic (4h)
- [ ] Create `/src/lib/notification-helpers.ts`
- [ ] Implement `createNotificationIfNotExists()` function
- [ ] Add duplicate check to `/api/notifications/generate`
- [ ] Write unit tests for deduplication
- [ ] Test: Create same notification twice → only 1 created

### 1.4 Logging & Monitoring (4h)
- [ ] Add structured logging to cron endpoint
- [ ] Create `/src/app/api/notifications/logs/route.ts`
- [ ] Log: execution time, notifications created, errors
- [ ] Implement error alerting (console + optional email)
- [ ] Test: View logs at `/api/notifications/logs`

**Phase 1 Done When:**
- ✅ Cron job runs 3x daily automatically
- ✅ No duplicate notifications within 24 hours
- ✅ Execution time < 10 seconds logged

---

## Phase 2: Project & Material Notifications (14h) 🟠 HIGH PRIORITY

### 2.1 Project Start Reminders (4h)
- [ ] Create `/src/app/api/notifications/triggers/project-start-reminders.ts`
- [ ] Implement SQL query: `WHERE (start_date - CURRENT_DATE) IN (7, 3, 1, 0)`
- [ ] Target users: PM (`pm_user_id`) + admins
- [ ] Priority: `urgent` if ≤1 day, else `high`
- [ ] Add to cron job execution flow
- [ ] Test: Create project with `start_date = today + 3 days` → notification appears

### 2.2 Project End Reminders (4h)
- [ ] Create `/src/app/api/notifications/triggers/project-end-reminders.ts`
- [ ] Implement SQL query: `WHERE (end_date_plan - CURRENT_DATE) IN (30, 14, 7, 3, 1, 0)`
- [ ] Priority escalation: `urgent` ≤1 day, `high` ≤7 days, `normal` ≤14 days, `low` >14 days
- [ ] Add to cron job execution flow
- [ ] Test: Create project with `end_date_plan = today + 7 days` → notification appears

### 2.3 Material Delivery Reminders (6h)
- [ ] Create `/src/app/api/notifications/triggers/material-delivery-reminders.ts`
- [ ] Implement SQL query: `WHERE (expected_delivery_date - CURRENT_DATE) IN (7, 3, 1, 0, -1)`
- [ ] Handle overdue deliveries (`actual_delivery_date IS NULL AND expected_delivery_date < today`)
- [ ] Target users: PM (via `project_id`) + admins
- [ ] Priority: `urgent` if overdue or ≤1 day
- [ ] Add to cron job execution flow
- [ ] Test: Create order with `expected_delivery_date = today + 1 day` → notification appears

**Phase 2 Done When:**
- ✅ Project managers notified 7/3/1 days before start
- ✅ Project end date reminders sent 30/14/7/3/1 days before
- ✅ Material delivery reminders sent 7/3/1 days before + overdue alerts

---

## Phase 3: Work Entry Notifications (12h) 🟡 MEDIUM PRIORITY

### 3.1 Work Entry Approval Trigger (5h)
- [ ] Create `/database/migrations/20251024_work_entry_approval_trigger.sql`
- [ ] Implement function `notify_work_entry_approval_needed()`
- [ ] Create trigger: `AFTER INSERT ON work_entries`
- [ ] Target users: PM (`project_id → projects.pm_user_id`) + admins/foremen
- [ ] Priority: `high` for PM, `normal` for admins
- [ ] Run migration in development
- [ ] Test: Submit work entry → PM receives notification

### 3.2 Work Entry Approved (3h)
- [ ] Modify `/src/app/api/work-entries/[id]/approve/route.ts`
- [ ] Add notification insert after line 92 (after successful approval)
- [ ] Target user: Worker (`work_entries.user_id`)
- [ ] Priority: `normal`
- [ ] Test: Approve work entry → worker receives notification

### 3.3 Work Entry Rejected (4h)
- [ ] Modify `/src/app/api/work-entries/[id]/reject/route.ts`
- [ ] Add notification insert after successful rejection
- [ ] Include rejection reason in message
- [ ] Target user: Worker (`work_entries.user_id`)
- [ ] Priority: `high`
- [ ] Action URL: `/dashboard/work-entries/${id}/resubmit`
- [ ] Test: Reject work entry → worker receives notification with reason

**Phase 3 Done When:**
- ✅ PM/admins notified immediately when work entry submitted
- ✅ Workers notified when entry approved
- ✅ Workers notified when entry rejected (with reason)
- ✅ 100% of work entry submissions trigger notifications

---

## Phase 4: Document & Maintenance Notifications (16h) 🟢 MEDIUM PRIORITY

### 4.1 Vehicle Document Expiration (5h)
- [ ] Extract logic from `/api/notifications/generate` (lines 204-256)
- [ ] Create `/src/app/api/notifications/triggers/vehicle-document-expiration.ts`
- [ ] Implement SQL query: `WHERE (expiry_date - CURRENT_DATE) IN (90, 60, 30, 14, 7, 3, 1, 0, -1)`
- [ ] Add German document labels: `fahrzeugschein`, `tuv`, `versicherung`, etc.
- [ ] Priority: `urgent` if expired or ≤7 days
- [ ] Add to cron job execution flow
- [ ] Test: Add document with `expiry_date = today + 7 days` → notification appears

### 4.2 Equipment Document Expiration (5h)
- [ ] Extract logic from `/api/notifications/generate`
- [ ] Create `/src/app/api/notifications/triggers/equipment-document-expiration.ts`
- [ ] Implement SQL query: `WHERE (expiry_date - CURRENT_DATE) IN (90, 60, 30, 14, 7, 3, 1, 0, -1)`
- [ ] Document types: `warranty`, `manual`, `calibration`, `inspection`, `safety`
- [ ] Priority: `urgent` if expired or ≤7 days
- [ ] Add to cron job execution flow
- [ ] Test: Add document with `expiry_date = today + 3 days` → notification appears

### 4.3 Equipment Maintenance Reminders (6h)
- [ ] Extract logic from `/api/notifications/generate`
- [ ] Create `/src/app/api/notifications/triggers/equipment-maintenance-due.ts`
- [ ] Implement SQL query: `WHERE (next_maintenance_date - CURRENT_DATE) IN (30, 14, 7, 3, 1, 0, -1)`
- [ ] Handle overdue maintenance (`status != 'completed' AND next_maintenance_date < today`)
- [ ] Priority: `urgent` if overdue or ≤7 days
- [ ] Add to cron job execution flow
- [ ] Test: Schedule maintenance with `next_maintenance_date = today + 7 days` → notification appears

**Phase 4 Done When:**
- ✅ Vehicle document expiration tracked (90-day countdown)
- ✅ Equipment document expiration tracked (90-day countdown)
- ✅ Maintenance reminders sent 30/14/7/3/1 days before due date
- ✅ Overdue items flagged as urgent

---

## Phase 5: Testing & Optimization (8h) ⚪ LOW PRIORITY (POLISH)

### 5.1 Integration Testing (4h)
- [ ] Create `/src/__tests__/notifications/integration.test.ts`
- [ ] Test: Cron job execution flow
- [ ] Test: Notification generation for each type
- [ ] Test: Deduplication logic (same notification twice)
- [ ] Test: WebSocket real-time updates
- [ ] Test: Priority escalation logic
- [ ] Run all tests: `npm run test`

### 5.2 Performance Optimization (2h)
- [ ] Run `EXPLAIN ANALYZE` on all SQL queries
- [ ] Add missing indexes if needed
- [ ] Combine queries with CTEs (Common Table Expressions)
- [ ] Measure cron execution time (target: <10s)
- [ ] Optimize slow queries (>1s)

### 5.3 Documentation (2h)
- [ ] Update `/CLAUDE.md` with notification system details
- [ ] Create `/docs/notifications-system.md`
- [ ] Document cron job setup for deployment
- [ ] Add troubleshooting guide
- [ ] Update environment variable documentation

**Phase 5 Done When:**
- ✅ 80%+ test coverage
- ✅ All queries execute in <1 second
- ✅ Cron job completes in <10 seconds
- ✅ Documentation complete and reviewed

---

## Final Deployment Checklist

### Pre-Deployment
- [ ] All tests passing in development
- [ ] All migrations tested in staging
- [ ] Cron job tested in staging (run manually)
- [ ] No breaking changes to existing API endpoints
- [ ] Code review completed
- [ ] Backup production database

### Deployment Steps
1. [ ] Run database migrations:
   ```bash
   psql "$DATABASE_URL" -f database/migrations/20251024_add_notifications_data_column.sql
   psql "$DATABASE_URL" -f database/migrations/20251024_work_entry_approval_trigger.sql
   ```

2. [ ] Deploy application code:
   ```bash
   git checkout main
   git merge dev
   git push origin main  # Vercel auto-deploys
   ```

3. [ ] Configure environment:
   - [ ] Add `CRON_SECRET` to Vercel
   - [ ] Verify `vercel.json` cron schedule active

4. [ ] Test production:
   - [ ] Test cron endpoint manually
   - [ ] Wait for first scheduled run (6 AM, 12 PM, or 6 PM)
   - [ ] Check `/api/notifications/logs`
   - [ ] Verify notifications in database

### Post-Deployment
- [ ] Monitor error logs for 24 hours
- [ ] Verify notification counts match expected values
- [ ] Check user feedback on notification relevance
- [ ] Tune trigger thresholds if needed (e.g., 7 days → 10 days)

---

## Success Metrics Tracking

### Daily Monitoring (First Week)
- [ ] Cron job execution success rate: ___%
- [ ] Average execution time: ___ms (target: <10,000ms)
- [ ] Total notifications created: ___
- [ ] Duplicate notifications: ___ (target: 0)
- [ ] Database query errors: ___ (target: 0)

### Weekly Monitoring (First Month)
- [ ] Notification open rate: ___% (target: >60%)
- [ ] Average time to read: ___minutes
- [ ] User complaints about spam: ___ (target: <5)
- [ ] Missed critical alerts: ___ (target: 0)

### SQL Query for Stats
```sql
SELECT
  notification_type,
  COUNT(*) AS total_sent,
  COUNT(CASE WHEN is_read THEN 1 END) AS read_count,
  ROUND(COUNT(CASE WHEN is_read THEN 1 END)::NUMERIC / COUNT(*) * 100, 2) AS read_percentage
FROM in_app_notifications
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY notification_type
ORDER BY total_sent DESC;
```

---

## Rollback Plan (If Needed)

### Rollback Database Changes
```sql
-- Remove data column
ALTER TABLE in_app_notifications DROP COLUMN IF EXISTS data;

-- Drop work entry trigger
DROP TRIGGER IF EXISTS trigger_work_entry_approval_notification ON work_entries;
DROP FUNCTION IF EXISTS notify_work_entry_approval_needed();
```

### Rollback Application Code
```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or rollback in Vercel dashboard
# Settings → Deployments → Redeploy previous version
```

### Disable Cron Job
```json
// vercel.json - remove crons array
{
  "crons": []
}
```

---

## Timeline Summary

| Week | Phase | Tasks | Hours | Deliverable |
|------|-------|-------|-------|-------------|
| 1 | Phase 1 | Infrastructure | 16h | Automated notifications (3x daily) |
| 2 | Phase 2 | Project & Materials | 14h | Deadline reminders |
| 3 | Phase 3 | Work Entries | 12h | Approval workflow notifications |
| 4 | Phase 4 | Documents & Maintenance | 16h | Expiration tracking |
| 5 | Phase 5 | Testing & Docs | 8h | Production-ready system |

**Total:** 5 weeks, 66 hours, 87 tasks

---

## Quick Commands Reference

### Development
```bash
# Run migrations
psql "$DATABASE_URL" -f database/migrations/20251024_add_notifications_data_column.sql

# Test cron endpoint
curl -X GET http://localhost:3000/api/cron/notifications \
  -H "Authorization: Bearer $CRON_SECRET"

# View notification logs
curl http://localhost:3000/api/notifications/logs

# Run tests
npm run test
npm run test:e2e
```

### Production
```bash
# Deploy to production
git push origin main

# View cron job logs (Vercel)
vercel logs --follow

# Check notification count
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM in_app_notifications WHERE created_at::date = CURRENT_DATE;"
```

---

**Checklist Complete** ✅
**Ready to Start:** Phase 1, Task 1.1 (Database Schema)
**Next Review:** After Phase 1 completion (estimate: 1 week)
