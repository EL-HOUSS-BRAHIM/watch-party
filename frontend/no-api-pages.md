# Frontend routes without API requests

This audit covers every Next.js page, layout, and loading state under `frontend/app`. Pages marked with ✅ now use backend APIs, while others remain static with mock data.

## Marketing routes (`app/(public)` and root) - STATIC CONTENT
- `/` – `app/page.tsx` renders marketing sections that only read static testimonial and feature data from `@/lib/data/home` and local constants. No data fetching hooks or `fetch` calls are present.
- `/about` – `app/(public)/about/page.tsx` relies on inline arrays for the company timeline and design principles.
- `/pricing` – `app/(public)/pricing/page.tsx` defines the pricing plans and FAQ copy in local constants.
- `/guides/watch-night` – `app/(public)/guides/watch-night/page.tsx` sources the guide steps and signature rituals from in-file arrays.

Shared marketing chrome (`app/layout.tsx`, `components/layout/site-header.tsx`, `components/layout/site-footer.tsx`, and `components/providers.tsx`) also avoids API calls. Navigation links and hero copy are statically defined.

## Dashboard routes (`app/(dashboard)`) - NOW WITH API INTEGRATION ✅

### ✅ `/dashboard` – `app/(dashboard)/dashboard/page.tsx` 
**API Integration Complete**
- **Endpoints Used**:
  - `/analytics/dashboard/` - Fetches user dashboard statistics
  - `/parties/recent/` - Fetches recent watch parties
- **Features**:
  - Displays real-time stats for total parties, videos, and watch time
  - Shows scheduled parties with actual times and participant counts
  - Falls back gracefully to mock data if API unavailable
  - Includes error notification banner when using fallback data
- **Mock Data Retained**: Crew notes section (lighting, co-hosts, sponsors reminders)

### ✅ `/rooms` – `app/(dashboard)/rooms/page.tsx`
**API Integration Complete**
- **Endpoints Used**:
  - `/parties/` - Lists all user's watch parties
- **Features**:
  - Displays actual party information including titles, participant counts, and status
  - Maps party visibility and status to room cards
  - Falls back gracefully to mock data if API unavailable
  - Includes error notification banner when using fallback data

### ✅ `/library` – `app/(dashboard)/library/page.tsx`
**API Integration Complete**
- **Endpoints Used**:
  - `/videos/` - Lists all user's uploaded videos
- **Features**:
  - Displays actual video information including titles, durations, and source types
  - Shows formatted video duration and visibility settings
  - Falls back gracefully to mock data if API unavailable
  - Includes error notification banner when using fallback data

### ✅ `/settings` – `app/(dashboard)/settings/page.tsx`
**API Integration Complete**
- **Endpoints Used**:
  - `/auth/profile/` - Fetches current user profile
- **Features**:
  - Displays actual user name, email, and premium status
  - Shows premium badge for premium users
  - Falls back gracefully to mock data if API unavailable
  - Includes error notification banner when using fallback data
- **Mock Data Retained**: Preferences cards and integrations section

The dashboard route group layout (`app/(dashboard)/layout.tsx` and `components/dashboard/dashboard-layout.tsx`) determines active navigation with `usePathname` but does not perform any data fetching.

## Global loading state
- `app/loading.tsx` renders a branded loading screen without performing network activity.

## API routes for reference
The only API route present is `app/api/health/route.ts`, which returns a static JSON payload. No page or component invokes it during render.

## Summary of Changes
- ✅ **4 dashboard pages** now integrated with backend APIs
- ✅ **API client utility** created at `lib/api-client.ts`
- ✅ **Graceful fallback** to mock data when API unavailable
- ✅ **Error notifications** inform users when demo data is being used
- 📌 **Marketing pages** remain static (appropriate for marketing content)
- 📌 **Some UI sections** keep mock data as placeholders for future features
