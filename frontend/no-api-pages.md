# Frontend routes without API requests

This audit covers every Next.js page, layout, and loading state under `frontend/app` as well as the dashboard layout wrapper. None of these surfaces perform client-side or server-side API requests; all data is hard-coded in the component files or imported from local static modules like `@/lib/data/home`.

## Marketing routes (`app/(public)` and root)
- `/` – `app/page.tsx` renders marketing sections that only read static testimonial and feature data from `@/lib/data/home` and local constants. No data fetching hooks or `fetch` calls are present.
- `/about` – `app/(public)/about/page.tsx` relies on inline arrays for the company timeline and design principles.
- `/pricing` – `app/(public)/pricing/page.tsx` defines the pricing plans and FAQ copy in local constants.
- `/guides/watch-night` – `app/(public)/guides/watch-night/page.tsx` sources the guide steps and signature rituals from in-file arrays.

Shared marketing chrome (`app/layout.tsx`, `components/layout/site-header.tsx`, `components/layout/site-footer.tsx`, and `components/providers.tsx`) also avoids API calls. Navigation links and hero copy are statically defined.

## Dashboard routes (`app/(dashboard)`)
- `/dashboard` – `app/(dashboard)/dashboard/page.tsx` renders overview highlights, timelines, and crew notes from static arrays.
- `/rooms` – `app/(dashboard)/rooms/page.tsx` lists room cards using a locally declared `rooms` array.
- `/library` – `app/(dashboard)/library/page.tsx` displays media items defined in a constant.
- `/settings` – `app/(dashboard)/settings/page.tsx` shows preferences and integrations defined inline.

The dashboard route group layout (`app/(dashboard)/layout.tsx` and `components/dashboard/dashboard-layout.tsx`) determines active navigation with `usePathname` but does not perform any data fetching.

## Global loading state
- `app/loading.tsx` renders a branded loading screen without performing network activity.

## API routes for reference
The only API route present is `app/api/health/route.ts`, which returns a static JSON payload. No page or component invokes it during render.
