# Admin Rejection Photo Upload - Diagnostic Guide

**Date:** 2025-10-22
**Issue:** Admin rejection photos are NOT being uploaded when rejecting work entries
**Status:** Diagnostic logging added, awaiting test results

## Problem Summary

**Current Database Evidence:**
```sql
-- PROBLEM: 0 photos with these characteristics:
SELECT COUNT(*) FROM photos WHERE is_after_photo = true;        -- Expected: >0, Actual: 0
SELECT COUNT(*) FROM photos WHERE photo_type = 'issue';         -- Expected: >0, Actual: 0
SELECT COUNT(*) FROM photos WHERE label = 'after';              -- Expected: >0, Actual: 0

-- All photos currently have:
label = 'during'
is_after_photo = false
photo_type = 'during'

-- Latest rejection example:
work_entry_id: 3ebee70a-7227-4c49-a01b-7d8c5cfc7e10
rejected_at: 2025-10-22 11:42:28
Photos for this work entry: 1 (created at 11:41:58 - BEFORE rejection)
Photos after rejection: 0 (PROBLEM!)
```

**Expected Behavior:**
When admin rejects a work entry with photos attached:
1. Photos should be uploaded to Supabase Storage (`work-photos` bucket)
2. Photo metadata should be saved to `photos` table with:
   - `label = 'after'`
   - `is_after_photo = true`
   - `photo_type = 'issue'`
   - `work_entry_id = <rejected work entry id>`

## Investigation Hypothesis

The API endpoint `/api/upload/work-photos` is **NOT being called** when admin clicks "Reject Work Entry" with photos. Possible reasons:

1. Photos not being selected/stored in dialog state
2. Photos not being passed to `handleReject` callback
3. Condition `if (photos && photos.length > 0)` evaluating to false
4. Fetch call failing silently before reaching server
5. Dialog closing interrupting async upload

## Diagnostic Logging Added

### Commit: c56105a

Added comprehensive logging at 3 critical checkpoints:

### 1. Photo Selection (Dialog Component)
**File:** `/src/components/work-entries/reject-work-entry-dialog.tsx`
**Function:** `handlePhotoSelect` (lines 59-91)

**Logs to expect:**
```
📷 [RejectDialog] Photo selection triggered
📷 [RejectDialog] Files selected: 2
📷 [RejectDialog] Valid files after filtering: 2
📷 [RejectDialog] Updated selectedPhotos count: 2
📷 [RejectDialog] Photo names: ["IMG_1234.jpg", "IMG_5678.jpg"]
```

### 2. Form Submission (Dialog Component)
**File:** `/src/components/work-entries/reject-work-entry-dialog.tsx`
**Function:** `onSubmit` (lines 93-113)

**Logs to expect:**
```
🚨 [RejectDialog] onSubmit called
🚨 [RejectDialog] selectedPhotos.length: 2
🚨 [RejectDialog] selectedPhotos array: [File, File]
🚨 [RejectDialog] Photo names: ["IMG_1234.jpg", "IMG_5678.jpg"]
🚨 [RejectDialog] Passing photos to onReject: 2
🚨 [RejectDialog] Cleaning up dialog state...
🚨 [RejectDialog] Dialog state cleaned up
```

### 3. Rejection Handler (Page Component)
**File:** `/src/app/(dashboard)/dashboard/work-entries/[id]/page.tsx`
**Function:** `handleReject` (lines 50-116)

**Logs to expect:**
```
🎯 [handleReject] Function called
🎯 [handleReject] rejection_reason: "Quality issues with cable installation..."
🎯 [handleReject] photos parameter: [File, File]
🎯 [handleReject] photos?.length: 2
🎯 [handleReject] photos array: [File, File]
🎯 [handleReject] Photo names received: ["IMG_1234.jpg", "IMG_5678.jpg"]
🎯 [handleReject] Step 1: Rejecting work entry...
🎯 [handleReject] Step 1: Work entry rejected successfully
🎯 [handleReject] Step 2: Checking if photos need to be uploaded...
🎯 [handleReject] Step 2: YES - Photos need upload. Count: 2
🎯 [handleReject] Metadata prepared: {workEntryId: "...", stage: "issue", ...}
🎯 [handleReject] Adding file0: IMG_1234.jpg 2345678 bytes
🎯 [handleReject] Adding file1: IMG_5678.jpg 3456789 bytes
🎯 [handleReject] FormData prepared. Calling API...
🎯 [handleReject] API response status: 200
🎯 [handleReject] ✅ Rejection photos uploaded successfully: {...}
🎯 [handleReject] Step 3: Closing dialog...
🎯 [handleReject] ✅ All steps completed
```

### 4. API Endpoint (Already Added)
**File:** `/src/app/api/upload/work-photos/route.ts`
**Function:** `POST` (lines 29-274)

**Logs to expect:**
```
🚀 POST /api/upload/work-photos called
📦 FormData received, parsing metadata...
📄 Raw metadata JSON: {"workEntryId":"...","stage":"issue",...}
✅ Metadata parsed successfully: {...}
📸 Uploading photo with metadata: {...}
📝 Computed label: after
📝 Computed photo_type: issue
📝 Computed is_after_photo: true
💾 Inserting photo to database: {...}
✅ Photo saved to database successfully!
✅ Photo ID: ...
✅ Work Entry ID: ...
✅ Work photo uploaded: IMG_1234.jpg -> work-entries/.../...
```

## Testing Procedure

### Prerequisites
1. Dev server running on port 3002
2. Browser DevTools Console open (F12)
3. Console filter: Clear all filters, show all log levels
4. Network tab open (to monitor API calls)

### Test Steps

1. **Login as Admin:**
   - Navigate to: http://localhost:3002/login
   - Login with admin credentials

2. **Navigate to Work Entry:**
   - Go to: Dashboard → Work Entries
   - Find a work entry with status "submitted" or "pending"
   - Click to open work entry details

3. **Open Rejection Dialog:**
   - Click "Reject" button
   - Dialog should open
   - Console should show: (none yet - dialog just opened)

4. **Select Photos:**
   - Click "Select Photos" button
   - Choose 2-3 image files from your computer
   - **EXPECTED LOGS:**
     ```
     📷 [RejectDialog] Photo selection triggered
     📷 [RejectDialog] Files selected: 2
     📷 [RejectDialog] Valid files after filtering: 2
     📷 [RejectDialog] Updated selectedPhotos count: 2
     📷 [RejectDialog] Photo names: ["photo1.jpg", "photo2.jpg"]
     ```
   - Photo previews should appear in dialog

5. **Enter Rejection Reason:**
   - Type rejection reason (minimum 10 characters)
   - Example: "Poor cable quality, needs rework"

6. **Submit Rejection:**
   - Click "Reject Work Entry" button
   - **EXPECTED LOGS (in order):**
     ```
     🚨 [RejectDialog] onSubmit called
     🚨 [RejectDialog] selectedPhotos.length: 2
     🚨 [RejectDialog] selectedPhotos array: [File, File]
     🚨 [RejectDialog] Photo names: ["photo1.jpg", "photo2.jpg"]
     🚨 [RejectDialog] Passing photos to onReject: 2
     🎯 [handleReject] Function called
     🎯 [handleReject] rejection_reason: "Poor cable quality, needs rework"
     🎯 [handleReject] photos parameter: [File, File]
     🎯 [handleReject] photos?.length: 2
     🎯 [handleReject] Photo names received: ["photo1.jpg", "photo2.jpg"]
     🎯 [handleReject] Step 1: Rejecting work entry...
     🎯 [handleReject] Step 1: Work entry rejected successfully
     🎯 [handleReject] Step 2: Checking if photos need to be uploaded...
     🎯 [handleReject] Step 2: YES - Photos need upload. Count: 2
     🎯 [handleReject] Metadata prepared: {workEntryId: "...", stage: "issue", ...}
     🎯 [handleReject] Adding file0: photo1.jpg 123456 bytes
     🎯 [handleReject] Adding file1: photo2.jpg 234567 bytes
     🎯 [handleReject] FormData prepared. Calling API...
     🚀 POST /api/upload/work-photos called
     📦 FormData received, parsing metadata...
     📄 Raw metadata JSON: {"workEntryId":"...","stage":"issue",...}
     ✅ Metadata parsed successfully: {...}
     📸 Uploading photo with metadata: {...}
     📝 Computed label: after
     📝 Computed photo_type: issue
     📝 Computed is_after_photo: true
     💾 Inserting photo to database: {...}
     ✅ Photo saved to database successfully!
     🎯 [handleReject] API response status: 200
     🎯 [handleReject] ✅ Rejection photos uploaded successfully: {...}
     🎯 [handleReject] Step 3: Closing dialog...
     🎯 [handleReject] ✅ All steps completed
     🚨 [RejectDialog] Cleaning up dialog state...
     🚨 [RejectDialog] Dialog state cleaned up
     ```

7. **Check Network Tab:**
   - Should see POST request to `/api/upload/work-photos`
   - Status: 200 OK
   - Response payload: `{success: true, photos: [...], ...}`

8. **Verify Database:**
   ```sql
   -- Run in Supabase SQL Editor:
   SELECT
     id,
     work_entry_id,
     label,
     photo_type,
     is_after_photo,
     is_before_photo,
     caption,
     ts
   FROM photos
   WHERE work_entry_id = '<rejected_work_entry_id>'
   ORDER BY ts DESC;

   -- Should see NEW rows with:
   -- label = 'after'
   -- photo_type = 'issue'
   -- is_after_photo = true
   ```

## Diagnostic Scenarios

### Scenario A: No logs at all
**Symptom:** No console logs appear after clicking "Reject Work Entry"

**Diagnosis:** JavaScript error preventing execution, or page not loaded correctly

**Action:**
1. Check console for ANY errors (red text)
2. Refresh page (Ctrl+R)
3. Clear browser cache and reload (Ctrl+Shift+R)
4. Check if Next.js dev server is running

### Scenario B: Photo selection logs missing
**Symptom:** No 📷 logs when selecting photos

**Diagnosis:** Photo selection handler not firing

**Action:**
1. Verify file input is visible (check HTML inspector)
2. Try clicking "Select Photos" button again
3. Check if browser file dialog opens
4. Try selecting different image files

### Scenario C: Photos not passed to handleReject
**Symptom:** Logs show:
```
🚨 [RejectDialog] Passing photos to onReject: 2
🎯 [handleReject] photos parameter: undefined
🎯 [handleReject] photos?.length: undefined
```

**Diagnosis:** Photos lost between dialog and page component (React state issue)

**Possible causes:**
- Dialog component unmounting too quickly
- State cleanup happening before callback completes
- React strict mode causing double-render issues

**Action:**
1. Check React version (should be 19.1.0)
2. Verify dialog doesn't close before `onReject` completes
3. Test with React DevTools to inspect state

### Scenario D: Condition fails
**Symptom:** Logs show:
```
🎯 [handleReject] Step 2: Checking if photos need to be uploaded...
🎯 [handleReject] Step 2: NO - No photos to upload (photos: [])
```

**Diagnosis:** Photos array is empty or undefined despite being passed

**Possible causes:**
- Photos cleared from state before upload
- Array reference lost
- Garbage collection issue

**Action:**
1. Log `typeof photos` and `Array.isArray(photos)`
2. Log `photos` object structure before condition
3. Test with smaller photos (< 1MB)

### Scenario E: API not called
**Symptom:** Logs show:
```
🎯 [handleReject] FormData prepared. Calling API...
(no 🚀 POST /api/upload/work-photos called)
```

**Diagnosis:** Fetch call failing before reaching server

**Possible causes:**
- Network error
- CORS issue
- Browser blocking request
- Server not running

**Action:**
1. Check Network tab for failed requests (red)
2. Verify dev server is running on port 3002
3. Check server terminal for errors
4. Test API directly with curl:
   ```bash
   curl -X POST http://localhost:3002/api/upload/work-photos \
     -F "metadata={\"workEntryId\":\"test\",\"stage\":\"issue\"}" \
     -F "file0=@test.jpg"
   ```

### Scenario F: API called but no database insert
**Symptom:** Logs show:
```
✅ Metadata parsed successfully: {...}
📸 Uploading photo with metadata: {...}
❌ Database insert error: ...
```

**Diagnosis:** Supabase insert failing

**Possible causes:**
- Database connection issue
- Permission error
- Invalid data format
- Missing required fields

**Action:**
1. Check Supabase project status
2. Verify database credentials in `.env`
3. Check if `photos` table exists and has correct schema
4. Test direct insert in Supabase SQL Editor

## Expected Fix

Based on diagnostic results, the fix will likely be one of:

1. **State Management Fix:** Delay dialog state cleanup until after upload completes
2. **Async/Await Fix:** Ensure proper async handling of photo upload
3. **React Lifecycle Fix:** Prevent dialog unmounting during upload
4. **API Client Fix:** Fix FormData construction or fetch call
5. **Database Schema Fix:** Add missing fields or fix constraints

## Files Modified (Commit c56105a)

1. `/src/components/work-entries/reject-work-entry-dialog.tsx`
   - Added logging to `handlePhotoSelect` (lines 60-62, 78, 84-88)
   - Added logging to `onSubmit` (lines 94-101, 105-112)

2. `/src/app/(dashboard)/dashboard/work-entries/[id]/page.tsx`
   - Added comprehensive logging to `handleReject` (lines 51-116)
   - Logs every step: entry, rejection, photo check, upload, completion

3. `/src/app/api/upload/work-photos/route.ts`
   - Already has comprehensive logging (added in commit db4e5c9)
   - Logs: API call, metadata parsing, file processing, database insert

## Next Steps

1. **Run Test:** Follow testing procedure above
2. **Collect Logs:** Copy ALL console logs from test
3. **Analyze Results:** Match logs against expected scenarios
4. **Identify Root Cause:** Determine which scenario matches
5. **Implement Fix:** Based on diagnostic results
6. **Verify Fix:** Test again with same procedure
7. **Clean Up:** Remove or reduce diagnostic logging once fixed

## Contact

If you need help interpreting the logs or implementing a fix, provide:
1. Full console log output
2. Network tab screenshot showing requests
3. Browser and version
4. Any error messages (red text in console)

---

**Generated:** 2025-10-22
**Commit:** c56105a
**Status:** Ready for testing
