# Teams Page Data Inconsistencies Report

**Date**: 2025-10-07
**Page**: `/dashboard/teams` (http://localhost:3000/dashboard/teams)
**User Report**: "там много работ несоответствия данным" (there are many data inconsistencies)

## Executive Summary

After thorough analysis of the Teams page, API endpoints, database queries, and data flow, I've identified **5 critical data inconsistencies** that are causing incorrect information to be displayed to users. These issues affect member counts, team leader visibility, and the "Available Workers" calculation.

---

## Critical Issues Found

### 1. **Member Count Missing Leader** ⚠️ HIGH PRIORITY

**Issue**: Teams with assigned leaders show incorrect member counts because leaders are NOT counted as members when they should be.

**Example**:
- **Team**: "Бригада №1"
- **Leader**: Admin User (ID: 9e81e275-8b8d-4d3c-99e3-45ffff80af20)
- **Database Reality**:
  - Leader: Admin User (assigned as `leader_user_id`)
  - Active members in `crew_members`: 3 people (Anatolii XXX, Construction Worker, Project Manager)
  - **Total team size**: 4 people (3 members + 1 leader)
- **Displayed on Teams Page**: 3 members ❌
- **Should Display**: 4 members ✅

**Root Cause**:
```typescript
// In /api/crews/route.ts line 119
member_count: crew.crew_members?.length || 0,
```

The `member_count` only counts entries in the `crew_members` table. However, the team leader is stored in `crews.leader_user_id` and is NOT automatically added to `crew_members`. This causes the leader to be excluded from the count.

**Database Evidence**:
```sql
-- Query showing the discrepancy
SELECT c.name,
       c.leader_user_id,
       COUNT(cm.id) FILTER (WHERE cm.is_active = true) as displayed_count,
       CASE WHEN c.leader_user_id IS NULL
            THEN COUNT(cm.id) FILTER (WHERE cm.is_active = true)
            ELSE COUNT(cm.id) FILTER (WHERE cm.is_active = true) + 1
       END as correct_count
FROM crews c
LEFT JOIN crew_members cm ON c.id = cm.crew_id
GROUP BY c.id, c.name, c.leader_user_id;

-- Results:
-- "test team 1" with leader: displays 0, should be 1
-- "Бригада №1" with leader: displays 3, should be 4
```

**Impact**:
- Misleading team size information
- Affects resource planning and allocation
- Statistics in "Team Overview" tab show incorrect totals

**Fix Required**:
- Add logic to include leader in member count when `leader_user_id` is set
- Update both list endpoint (`/api/crews`) and individual endpoint (`/api/crews/[id]`)

---

### 2. **Individual Crew Endpoint Missing Members** ⚠️ CRITICAL

**Issue**: The individual crew detail API endpoint (`/api/crews/[id]`) returns `null` for both `member_count` and `members`, making it impossible to display team composition on detail pages.

**Example**:
```bash
curl http://localhost:3000/api/crews/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
```

**Returns**:
```json
{
  "name": "Бригада №1",
  "leader": { ... },
  "member_count": null,  // ❌ MISSING
  "members": null        // ❌ MISSING
}
```

**Root Cause**: The query in `/src/app/api/crews/[id]/route.ts` doesn't include the `crew_members` join:

```typescript
// Current query (lines 24-38)
const { data: crew, error } = await supabaseService
  .from('crews')
  .select(`
    id, name, description, status,
    leader_user_id, project_id,
    created_at, updated_at,
    leader:users!crews_leader_user_id_fkey(id, first_name, last_name, email, phone)
  `)
  .eq('id', id)
  .single();

// MISSING: crew_members join and member_count calculation
```

**Impact**:
- Team detail pages cannot show member lists
- Links from team cards to detail pages fail to show critical information
- Makes team management operations impossible

**Fix Required**:
- Add `crew_members` join to the SELECT query
- Calculate `member_count` in the response formatting
- Ensure consistency with the list endpoint format

---

### 3. **"Available Workers" Shows Workers Already Assigned to Teams** ⚠️ HIGH PRIORITY

**Issue**: The "Available Workers" tab shows workers who are actually already assigned to teams as "available".

**Example**:
The frontend logic checks if a user is assigned by looking at:
```typescript
// Line 111-119 in page.tsx
const isUserAssignedToTeam = (userId: string): boolean => {
  if (!crews) return false;

  return crews.some(crew =>
    // Check if user is foreman of any crew
    crew.foreman?.id === userId ||
    // Check if user is member of any crew
    crew.members?.some(member => member.user_id === userId)
  );
};
```

**However**, this logic has a flaw:
1. It correctly checks if user is a foreman (`crew.foreman?.id`)
2. It checks `crew.members` which comes from the API
3. **BUT** the API returns `members` with `crew_members.is_active = true` filter

**The Problem**:
- If the API data is stale or the cache isn't invalidated
- Workers will show as "available" even though they're in a crew
- This is a cache invalidation issue combined with the member count problem

**Database Reality**:
```sql
-- Workers who ARE assigned
SELECT u.first_name || ' ' || u.last_name as name,
       c.name as crew_name
FROM users u
JOIN crew_members cm ON u.id = cm.user_id AND cm.is_active = true
JOIN crews c ON cm.crew_id = c.id
WHERE u.role IN ('crew', 'worker', 'foreman');

-- Results: 8 workers are assigned
-- But frontend might show some as "available" due to cache issues
```

**Impact**:
- Users cannot trust the "Available Workers" list
- Risk of double-assigning workers to multiple teams
- Confusion about actual team composition

**Fix Required**:
- Ensure proper cache invalidation after team membership changes
- Consider using server-side filtering instead of client-side
- Add real-time validation before allowing assignment

---

### 4. **Leaders Not Showing as Team Members** ⚠️ MEDIUM PRIORITY

**Issue**: When viewing team member lists, the team leader is not included in the `members` array, even though they should be considered part of the team.

**Example**:
- **Team**: "test team 1"
- **Leader**: Project Manager (stored in `crews.leader_user_id`)
- **Members Array**: Empty `[]`
- **Expected**: Leader should appear in members list OR be clearly counted separately

**Database Structure**:
The database has two separate concepts:
1. `crews.leader_user_id` - The team leader (foreign key to `users`)
2. `crew_members` table - Team members (junction table)

**Current API Behavior**:
```json
{
  "name": "test team 1",
  "foreman": {
    "id": "cc46f737-2e0b-402c-a069-975c07888d36",
    "full_name": "Project Manager"
  },
  "members": [],          // Leader NOT in members array
  "member_count": 0       // Leader NOT counted
}
```

**Database Query Shows**:
```sql
SELECT * FROM crews WHERE id = '882f41e0-62d1-4392-b661-eec685677ea4';
-- leader_user_id = 'cc46f737-2e0b-402c-a069-975c07888d36'

SELECT * FROM crew_members WHERE crew_id = '882f41e0-62d1-4392-b661-eec685677ea4';
-- Returns 0 rows (leader is NOT in crew_members)
```

**Impact**:
- Team appears to have 0 members when it actually has 1 (the leader)
- Confusing UI showing "No members assigned" when there's a foreman
- Statistics are incorrect

**Fix Required**:
- Either: Add leader to `crew_members` table automatically when assigned
- Or: Include leader in the `members` array in API response
- Or: Clearly separate and count leaders in UI (e.g., "1 leader + 3 members = 4 total")

**Recommendation**: **Option 2** is best - include leader in `members` array in API response with a special flag like `is_leader: true` or `role: 'leader'`.

---

### 5. **"Team Overview" Statistics Are Incorrect** ⚠️ MEDIUM PRIORITY

**Issue**: The statistics cards in the "Team Overview" tab show incorrect totals due to the member count issues above.

**Current Display**:
- Total Workers: Sum of `crew.member_count` for all crews
- Problem: This excludes leaders who aren't in `crew_members`

**Example Calculation**:
```typescript
// Line 1029 in page.tsx
<div className="text-2xl font-bold">
  {crews?.reduce((sum, crew) => sum + (crew.member_count || 0), 0) || 0}
</div>
```

**Database Reality vs Display**:
- "awd" crew: 3 members, no leader = **3 total** ✅ (correct)
- "test 4" crew: 1 member, no leader = **1 total** ✅ (correct)
- "test team 1" crew: 0 members, 1 leader = **displays 0, should be 1** ❌
- "Бригада №1" crew: 3 members, 1 leader = **displays 3, should be 4** ❌

**Total Workers Displayed**: 7
**Actual Total Workers**: 9

**Impact**:
- Management dashboards show incorrect capacity
- Resource planning based on wrong numbers
- Reporting and analytics are skewed

**Fix Required**:
- Update calculation to include leaders
- Ensure consistency with member count fixes above

---

## Additional Observations

### Database Constraint: One Active Crew Per User
The database has a unique constraint preventing users from being in multiple active crews:
```sql
-- From crew_members table schema
"idx_crew_members_one_active_per_user" UNIQUE, btree (user_id) WHERE is_active = true
```

This is **GOOD** and prevents double-assignment at the database level. However, the frontend doesn't validate this before allowing assignment attempts.

### API Endpoints Using Different Supabase Clients
- `/api/teams/crews/route.ts` - Uses **anon key** (RLS applied)
- `/api/crews/route.ts` - Uses **service role key** (RLS bypassed)

**Recommendation**: Standardize on service role key for admin operations to avoid RLS permission issues.

### Duplicate API Routes
There are two sets of crew endpoints:
1. `/api/teams/crews/*` - Older implementation
2. `/api/crews/*` - Newer implementation with better formatting

The Teams page uses `/api/crews`, which is correct. The `/api/teams/crews` routes should be deprecated or removed to avoid confusion.

---

## Recommended Fixes (Priority Order)

### 1. Fix Individual Crew Endpoint (CRITICAL)
**File**: `/src/app/api/crews/[id]/route.ts`

Add the `crew_members` join and member count calculation:

```typescript
const { data: crew, error } = await supabaseService
  .from('crews')
  .select(`
    id, name, description, status,
    leader_user_id, project_id,
    created_at, updated_at,
    leader:users!crews_leader_user_id_fkey(
      id, first_name, last_name, email, phone, role
    ),
    crew_members(
      id, user_id, role, is_active, joined_at,
      user:users(
        id, first_name, last_name, email, phone, role
      )
    )
  `)
  .eq('id', id)
  .eq('crew_members.is_active', true)
  .single();

// Add member count calculation (including leader)
const formattedCrew = {
  ...crew,
  leader: crew.leader ? {
    ...crew.leader,
    full_name: `${crew.leader.first_name || ''} ${crew.leader.last_name || ''}`.trim(),
  } : null,
  members: (crew.crew_members || []).map(member => ({
    id: member.id,
    user_id: member.user_id,
    role: member.role,
    full_name: member.user ? `${member.user.first_name} ${member.user.last_name}` : '',
    user: member.user
  })),
  member_count: (crew.crew_members?.length || 0) + (crew.leader_user_id ? 1 : 0)
};
```

### 2. Fix Member Count in List Endpoint (HIGH PRIORITY)
**File**: `/src/app/api/crews/route.ts`

Update line 119:
```typescript
// Current (WRONG)
member_count: crew.crew_members?.length || 0,

// Fixed (CORRECT)
member_count: (crew.crew_members?.length || 0) + (crew.leader_user_id ? 1 : 0),
```

### 3. Include Leader in Members Array (HIGH PRIORITY)
**File**: `/src/app/api/crews/route.ts`

After formatting members (line 96-117), add leader to the array:

```typescript
const formattedMembers = (crew.crew_members || []).map((member: any) => ({
  // ... existing member formatting
}));

// Add leader as the first member if exists
if (crew.leader) {
  formattedMembers.unshift({
    id: `leader-${crew.leader.id}`, // Unique ID for leader
    user_id: crew.leader.id,
    role: 'leader',
    role_in_crew: 'leader',
    is_active: true,
    joined_at: crew.created_at, // Leader joined when crew was created
    active_from: crew.created_at,
    first_name: crew.leader.first_name,
    last_name: crew.leader.last_name,
    full_name: `${crew.leader.first_name} ${crew.leader.last_name}`,
    email: crew.leader.email,
    user: {
      id: crew.leader.id,
      first_name: crew.leader.first_name,
      last_name: crew.leader.last_name,
      full_name: `${crew.leader.first_name} ${crew.leader.last_name}`,
      email: crew.leader.email,
      role: crew.leader.role
    }
  });
}

// Then assign to formatted crew
members: formattedMembers,
```

### 4. Fix Available Workers Cache Invalidation (MEDIUM PRIORITY)
**File**: `/src/hooks/use-teams.ts`

Ensure all team member operations invalidate the users cache:

```typescript
// In useUpdateCrew, useDeleteCrew, add:
queryClient.invalidateQueries({ queryKey: ['users'] });
```

Also consider adding a dedicated hook for crew member assignment:
```typescript
export function useAssignUserToCrew() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ crewId, userId }: { crewId: string; userId: string }) => {
      const response = await fetch(`/api/crews/${crewId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      });
      if (!response.ok) throw new Error('Failed to assign user');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.crews() });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User assigned to crew successfully');
    }
  });
}
```

### 5. Update Team Overview Statistics (LOW PRIORITY)
**File**: `/src/app/(dashboard)/dashboard/teams/page.tsx`

The statistics will automatically fix themselves once the member_count fixes above are implemented. No additional changes needed.

---

## Testing Checklist

After implementing fixes, verify:

- [ ] "test team 1" shows member count of 1 (includes leader)
- [ ] "Бригада №1" shows member count of 4 (3 members + 1 leader)
- [ ] Individual crew detail page shows full member list including leader
- [ ] "Available Workers" tab correctly excludes assigned users
- [ ] "Available Workers" tab updates immediately after assignment
- [ ] "Team Overview" statistics show correct totals
- [ ] Leader appears in members list with special badge/indicator
- [ ] Assigning a leader doesn't create duplicate entries
- [ ] Changing a leader updates member count correctly

---

## Database Schema Recommendations

For future improvement, consider:

1. **Add a trigger** to automatically add leaders to `crew_members` when `leader_user_id` is set:
```sql
CREATE OR REPLACE FUNCTION sync_crew_leader_to_members()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.leader_user_id IS NOT NULL AND
     (OLD.leader_user_id IS NULL OR OLD.leader_user_id != NEW.leader_user_id) THEN
    -- Remove old leader from members if exists
    IF OLD.leader_user_id IS NOT NULL THEN
      UPDATE crew_members
      SET is_active = false, left_at = NOW()
      WHERE crew_id = NEW.id
        AND user_id = OLD.leader_user_id
        AND role = 'leader';
    END IF;

    -- Add new leader to members
    INSERT INTO crew_members (crew_id, user_id, role, is_active)
    VALUES (NEW.id, NEW.leader_user_id, 'leader', true)
    ON CONFLICT (crew_id, user_id)
    DO UPDATE SET is_active = true, role = 'leader', left_at = NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_crew_leader
  AFTER INSERT OR UPDATE OF leader_user_id ON crews
  FOR EACH ROW
  EXECUTE FUNCTION sync_crew_leader_to_members();
```

2. **Add a materialized view** for efficient team statistics:
```sql
CREATE MATERIALIZED VIEW crew_statistics AS
SELECT
  c.id as crew_id,
  c.name,
  COUNT(DISTINCT cm.user_id) + CASE WHEN c.leader_user_id IS NOT NULL THEN 1 ELSE 0 END as total_members,
  COUNT(DISTINCT cm.user_id) FILTER (WHERE cm.is_active = true) as active_members,
  c.leader_user_id
FROM crews c
LEFT JOIN crew_members cm ON c.id = cm.crew_id
GROUP BY c.id, c.name, c.leader_user_id;

-- Refresh after crew changes
CREATE INDEX idx_crew_stats_crew_id ON crew_statistics(crew_id);
```

---

## Conclusion

The Teams page has **5 critical data inconsistencies** all stemming from a fundamental architectural issue: **team leaders are stored separately from team members**, but the UI and statistics treat them as mutually exclusive.

The fixes are straightforward and can be implemented quickly:
1. Include leader in member count calculations (2 line changes)
2. Add leader to members array in API responses (10-15 lines)
3. Add crew_members join to individual endpoint (20 lines)
4. Ensure proper cache invalidation (5 lines)

**Estimated Time to Fix**: 2-3 hours including testing

**Impact**: HIGH - These fixes will make the Teams page accurately reflect database reality and restore user trust in the system.
