# API Fix Plan - Watch Party Backend

## Test Results Summary
- **Total Endpoints:** 56
- **Working:** 38 (68%)
- **Need Fixes:** 18 (32%)

---

## 🔴 Critical Issues (Server Errors - 500)

### 1. Analytics Dashboard (`/api/analytics/dashboard/`)
**Status:** 500 Internal Server Error
**Root Cause:** DashboardView tries to call AdminAnalyticsView() or UserDetailedStatsView() methods incorrectly
**Location:** `apps/analytics/views.py:26-38`

**Fix:**
```python
# Line 36-37 issue:
if request.user.is_staff:
    return AdminAnalyticsView().get(request)  # ❌ Wrong instantiation
else:
    return UserDetailedStatsView().get(request)  # ❌ Wrong instantiation

# Should be:
if request.user.is_staff:
    view = AdminAnalyticsView()
    view.request = request
    return view.get(request)
else:
    view = UserDetailedStatsView()
    view.request = request
    return view.get(request)
```

**Priority:** HIGH
**Estimated Time:** 10 minutes

---

### 2. Notification Preferences (`/api/notifications/preferences/`)
**Status:** 500 Internal Server Error
**Root Cause:** Likely missing NotificationPreferences model import or database migration issue
**Location:** `apps/notifications/views.py:178-187`

**Investigation Needed:**
1. Check if NotificationPreferences model exists and is migrated
2. Verify model import in views.py
3. Check for duplicate NotificationPreferencesSerializer definitions (found 2 at lines 130 and 363)

**Fix Steps:**
1. Consolidate duplicate serializers
2. Ensure proper model import
3. Add try-except error handling

**Priority:** HIGH
**Estimated Time:** 15 minutes

---

### 3. Search - Discover Content (`/api/search/discover/`)
**Status:** 500 Internal Server Error
**Root Cause:** Missing required fields on Video/WatchParty models (view_count, profile_picture)
**Location:** `apps/search/views.py:549` (DiscoverContentView)

**Fix:**
```python
# Lines causing issues:
'views': getattr(video, 'view_count', 0),  # ❌ view_count might not exist
'profile_picture': suggested_user.profile_picture.url if suggested_user.profile_picture else None  # ❌ profile_picture might not exist

# Should use safe attribute access with defaults
'views': getattr(video, 'view_count', 0) if hasattr(video, 'view_count') else 0,
'profile_picture': getattr(suggested_user, 'profile_picture', None).url if hasattr(suggested_user, 'profile_picture') and suggested_user.profile_picture else None,
```

**Priority:** HIGH  
**Estimated Time:** 20 minutes

---

### 4. Search - Suggestions (`/api/search/suggestions/`)
**Status:** 500 Internal Server Error
**Root Cause:** SearchSuggestion model query failing (model might not be properly populated)
**Location:** `apps/search/views.py:358` (SearchSuggestionsView)

**Fix:**
- Add try-except around SearchSuggestion queries
- Handle empty results gracefully
- Return empty list when no suggestions exist

**Priority:** MEDIUM
**Estimated Time:** 10 minutes

---

### 5. Search - Trending (`/api/search/trending/`)
**Status:** 500 Internal Server Error
**Root Cause:** TrendingQuery model query failing or date filtering issue
**Location:** `apps/search/views.py:474` (TrendingSearchView)

**Fix:**
```python
# Add error handling:
try:
    trending = TrendingQuery.objects.filter(
        period=period,
        date__gte=date_threshold
    ).order_by('-search_count')[:limit]
except Exception as e:
    # Return empty trending data
    return StandardResponse.success(
        data={'trending_searches': []},
        message="No trending searches available"
    )
```

**Priority:** MEDIUM
**Estimated Time:** 10 minutes

---

### 6. Mobile Home (`/api/mobile/home/`)
**Status:** 500 Internal Server Error
**Root Cause:** Need to check MobileHomeView implementation (not visible in current code)
**Location:** `apps/mobile/views.py` (line 51+)

**Investigation Needed:**
1. Read full MobileHomeView implementation
2. Check for missing model relationships
3. Verify all required fields exist

**Priority:** MEDIUM
**Estimated Time:** 20 minutes

---

## 🟡 Missing Endpoints (404 Not Found)

### 7. Video Search (`/api/videos/search/`)
**Status:** 404 Not Found
**Root Cause:** Endpoint not implemented in videos URLs
**Location:** `apps/videos/urls.py`

**Fix Options:**
1. **Option A:** Implement video search endpoint
2. **Option B:** Redirect to global search with video filter
3. **Option C:** Remove from API routes list (not needed if global search covers it)

**Recommendation:** Use global search (`/api/search/?type=videos&q=query`)
**Priority:** LOW
**Estimated Time:** 5 minutes (documentation update)

---

### 8. Google Drive Movies (`/api/videos/gdrive/`)
**Status:** 404 Not Found
**Root Cause:** Endpoint not implemented
**Location:** `apps/videos/urls.py`

**Fix:**
- Implement endpoint or mark as "Coming Soon" feature
- Alternative: Use existing `/api/auth/google-drive/status/` for GDrive features

**Priority:** LOW
**Estimated Time:** 30 minutes (if implementing)

---

### 9. Party Invitations (`/api/parties/invitations/`)
**Status:** 404 Not Found
**Root Cause:** Endpoint not implemented
**Location:** `apps/parties/urls.py`

**Fix:**
- Implement endpoint to list user's party invitations
- Should filter WatchParty where user is invited but not joined

**Priority:** MEDIUM
**Estimated Time:** 30 minutes

---

## 🟢 Expected Behaviors (Working as Designed)

### 10-12. Admin Endpoints (403 Forbidden) ✅
- `/api/analytics/platform-overview/` - Requires staff/admin
- `/api/analytics/real-time/` - Requires staff/admin  
- `/api/integrations/status/` - Requires staff/admin
- `/api/admin/dashboard/` - Requires staff/admin
- `/api/admin/users/` - Requires staff/admin
- `/api/admin/parties/` - Requires staff/admin

**Status:** Working correctly (403 expected for non-admin users)
**Priority:** N/A (No fix needed)

---

### 13. Global Search (400 Bad Request) ✅
**Status:** 400 - Missing query parameter
**Root Cause:** Test didn't provide `?q=query` parameter
**Fix:** Update test JSON to include query parameter

**Priority:** LOW
**Estimated Time:** 5 minutes

---

### 14-15. Auth Test Endpoints (400 Bad Request) ✅
- `/api/auth/register/` - Test data incomplete (missing fields)
- `/api/auth/login/` - Test data incomplete (wrong fields)

**Status:** Working correctly (validation errors expected)
**Priority:** N/A (Fix test data in JSON)

---

## 📋 Implementation Order

### Phase 1: Critical Fixes (1-2 hours)
1. ✅ **Analytics Dashboard** - Fix view instantiation
2. ✅ **Notification Preferences** - Consolidate serializers & add error handling
3. ✅ **Search Discover** - Fix attribute access safety
4. ✅ **Mobile Home** - Investigate and fix errors

### Phase 2: Search Fixes (30 minutes)
5. ✅ **Search Suggestions** - Add error handling
6. ✅ **Search Trending** - Add error handling & graceful fallback

### Phase 3: Missing Endpoints (1 hour)
7. ✅ **Party Invitations** - Implement endpoint
8. 🔄 **Video Search** - Document or implement
9. 🔄 **Google Drive Movies** - Document or implement

### Phase 4: Test Data Fixes (15 minutes)
10. ✅ Update `api_routes_test.json` with correct request bodies
11. ✅ Add query parameters where needed

---

## 🛠️ Required Files to Modify

1. **`apps/analytics/views.py`**
   - Fix DashboardView.get() method (lines 26-38)

2. **`apps/notifications/views.py`**
   - Add error handling in NotificationPreferencesView (lines 178-187)

3. **`apps/notifications/serializers.py`**
   - Remove duplicate NotificationPreferencesSerializer
   - Keep one at line 363 (appears more complete)

4. **`apps/search/views.py`**
   - Fix DiscoverContentView attribute access (lines 549+)
   - Add error handling in SearchSuggestionsView (lines 358+)
   - Add error handling in TrendingSearchView (lines 474+)

5. **`apps/mobile/views.py`**
   - Fix MobileHomeView (need to read full implementation)

6. **`apps/parties/urls.py` + `apps/parties/views.py`**
   - Add party invitations endpoint

7. **`api_routes_test.json`**
   - Fix test data for search endpoint (add ?q=test)
   - Fix auth test endpoints (optional - just for testing)

---

## 🧪 Testing Strategy

After each fix:
```bash
python3 test_all_routes.py
```

Target Success Rate: **95%+ (53/56 endpoints)**
- 6 admin endpoints will remain 403 (expected)
- 0-3 endpoints may be 404 if marked as "not implemented"

---

## 📊 Success Metrics

**Before Fixes:** 38/56 working (68%)
**After Fixes:** 50+/56 working (89%+)

**Time Estimate:** 3-4 hours total
**Complexity:** Medium

---

## 🚀 Quick Start Commands

```bash
# 1. Run tests to confirm current state
cd /home/bross/watch-party/backend
python3 test_all_routes.py

# 2. Make fixes in order (Phase 1 → Phase 2 → Phase 3 → Phase 4)

# 3. Re-run tests after each phase
python3 test_all_routes.py

# 4. Check specific error logs if needed
tail -f logs/django.log
```

---

## Notes

- All 500 errors need investigation with actual error logs
- Some errors might be related to database state (missing data)
- Consider adding comprehensive error handling middleware
- Add API monitoring/logging for production
