# Performance Optimization Guide

## Supabase Connection Performance

### Current Setup
- **Database**: Supabase PostgreSQL (EU North 1)
- **Connection**: Pooler on port 6543
- **Latency**: ~320-330ms per query (expected for pooler)

### Timeout Configuration

#### Supabase Pooler Limits
- Connection timeout: 30 seconds
- Query timeout: 60 seconds
- Idle timeout: 10 minutes
- Max pool size: 20 connections

#### Application Timeouts
Set in `.env.local`:
```bash
DB_POOL_MAX=20                      # Maximum connections
DB_POOL_IDLE_TIMEOUT=30000          # 30 seconds
DB_POOL_CONNECTION_TIMEOUT=10000    # 10 seconds
DB_STATEMENT_TIMEOUT=60000          # 60 seconds
DB_QUERY_TIMEOUT=30000              # 30 seconds
```

### Query Performance Tips

#### 1. Use Connection Pooling
```typescript
import { getSupabaseClient } from '@/lib/db-pool';

const supabase = getSupabaseClient();
const { data, error } = await supabase
  .from('projects')
  .select('*')
  .limit(20);
```

#### 2. Add Database Indexes
```sql
-- Index for frequently queried columns
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_work_entries_project_id ON work_entries(project_id);
CREATE INDEX idx_materials_category ON materials(category);
```

#### 3. Use Pagination
```typescript
const { data, count } = await supabase
  .from('projects')
  .select('*', { count: 'exact' })
  .range(0, 19); // First 20 items
```

#### 4. Optimize Queries
```typescript
// ❌ Bad: Fetch all data
const { data } = await supabase.from('projects').select('*');

// ✅ Good: Select only needed columns
const { data } = await supabase
  .from('projects')
  .select('id, name, status, created_at')
  .limit(20);
```

### Monitoring Slow Queries

#### Server Logs
```bash
# View query execution times
grep "Executed query" server.log

# Find queries > 500ms
grep "Executed query" server.log | awk '{if($4 > 500) print}'
```

#### Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select project
3. Navigate to "Database" → "Query Performance"
4. Check slow queries

### Network Optimization

#### 1. Enable Compression
Already enabled in `next.config.ts`:
```typescript
compress: true
```

#### 2. Use CDN for Static Assets
Configure in production:
```typescript
images: {
  domains: ['oijmohlhdxoawzvctnxx.supabase.co'],
  formats: ['image/avif', 'image/webp'],
}
```

#### 3. Reduce Bundle Size
```bash
# Analyze bundle
npm run build
npx @next/bundle-analyzer
```

### Production Deployment

#### PM2 Configuration
Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'cometa-nextjs',
    script: 'npm',
    args: 'start -- -H 0.0.0.0 -p 3000',
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      DB_POOL_MAX: 20,
    }
  }]
};
```

Start with PM2:
```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Troubleshooting

#### Timeout Errors
```
Error: Query timeout
```
**Solution**: Increase `DB_QUERY_TIMEOUT` in `.env.local`

#### Connection Pool Exhausted
```
Error: Connection pool exhausted
```
**Solution**: Increase `DB_POOL_MAX` or optimize concurrent queries

#### Slow Page Load
1. Check Network tab in DevTools
2. Look for slow API calls
3. Add loading states
4. Implement caching with React Query

### React Query Caching

Already configured in `src/app/providers.tsx`:
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,     // 1 minute cache
      cacheTime: 5 * 60 * 1000, // 5 minutes
      retry: 3,
    },
  },
});
```

### Recommendations

1. **Short term**:
   - Use existing optimizations
   - Monitor query performance
   - Add indexes for slow queries

2. **Medium term**:
   - Implement Redis cache
   - Use Supabase Edge Functions
   - Optimize database schema

3. **Long term**:
   - Consider Supabase direct connection (port 5432)
   - Implement read replicas
   - Use CDN for static content
