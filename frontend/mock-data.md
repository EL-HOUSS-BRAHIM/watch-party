# Frontend Mock Data Catalogue

## frontend/lib/data/home.ts
- `features`: Feature[] marketing blurbs for ambient palette, stage manager, guided arrivals, community overlays.
- `metrics`: Metric[] highlighting rooms orchestrated monthly, average sync drift, setup time saved.
- `testimonials`: Testimonial[] with quotes from Maya Castillo, Arjun Patel, Sophie Lin.

## frontend/app/(public)/pricing/page.tsx
- `plans`: array of tier descriptors for Matinee, Premiere, Marathon including price, perks list, and CTA links.
- Hero banner copy with pricing badges describing "Plans that scale" messaging.
- FAQ card grid with four hard-coded Q&A entries on ambience switching, branding, host failover, and education discount.

## frontend/app/(public)/guides/watch-night/page.tsx
- `steps`: onboarding ritual phases covering tone setup, invites, staging segments, going live.
- `tips`: signature ritual suggestions like dawn warm-up, intermission ritual, midnight encore.
- Hero introduction text positioning the ritual guide plus checklist bullet points for pre-show tasks.

## frontend/app/(public)/about/page.tsx
- `timeline`: company history milestones for years 2020, 2021, 2023 with narrative descriptions.
- Hero section copy highlighting WatchParty's mission and CTA buttons.
- Principle cards outlining ambience, host flow, and community rituals alongside a static metrics card of watch nights, rating, and countries.

## ~~frontend/app/(dashboard)/dashboard/page.tsx~~ ✅ NOW USING API
- **API Integration**: Uses `/analytics/dashboard/` endpoint for real-time stats
- Falls back to mock data if API unavailable: `mockHighlights`, `mockTimeline`
- Displays total parties, total videos, and watch time from backend
- Shows recent parties with scheduled times and participant counts
- Static crew notes remain as placeholder content

## ~~frontend/app/(dashboard)/rooms/page.tsx~~ ✅ NOW USING API
- **API Integration**: Uses `/parties/` endpoint to list user's watch parties
- Falls back to mock data if API unavailable: `mockRooms`
- Displays actual party titles, participant counts, visibility settings, and status
- Maps API party data to room card format for consistent UI

## ~~frontend/app/(dashboard)/settings/page.tsx~~ ✅ NOW USING API
- **API Integration**: Uses `/auth/profile/` endpoint for user profile data
- Falls back to mock data if API unavailable: `mockPreferences`
- Displays user's name, email, and premium status from backend
- Static preferences and integrations remain as placeholder content

## ~~frontend/app/(dashboard)/library/page.tsx~~ ✅ NOW USING API
- **API Integration**: Uses `/videos/` endpoint to list user's uploaded videos
- Falls back to mock data if API unavailable: `mockMedia`
- Displays actual video titles, durations, source types, and visibility settings
- Maps API video data to media card format for consistent UI

## frontend/components/dashboard/dashboard-layout.tsx
- `navigation`: client-side menu definitions for overview, rooms, library, and settings routes.
- Sidebar tagline describing the "Host lounge" and dual ambience status pill.

## frontend/components/layout/site-footer.tsx
- `footerLinks`: footer sections with headings and navigation items for Platform, Guides, Product.
- Footer hero copy describing WatchParty, ambience badges, and status pill text.

## frontend/components/layout/site-header.tsx
- `navigation`: marketing header links for Story, Plans, Guide, Toolkit, Impact, Community anchors.
- Static hero badge trio ("Day & night", "Live") and CTAs for Inside WatchParty / Launch studio.

## frontend/components/marketing/hero.tsx
- Hard-coded hero badges, headline, and descriptive paragraph describing WatchParty's ambience automation.
- Stats trio for preset palettes, sync drift, and hosts onboarded plus timeline cards for sunrise lobby and midnight encore.
- Ritual checklist listing tonight's rituals and auto cues progress meter.

## frontend/components/marketing/feature-grid.tsx
- Host toolkit heading, subtitle, and descriptive paragraphs for the primary feature card.
- Four static callout cards covering scene designer, collaborative hosting, automated rituals, and audience orchestration.

## frontend/components/marketing/metric-strip.tsx
- Intro copy under "Proof in the glow" describing host adoption.
- Background badges and descriptive paragraph complementing metrics pulled from `@/lib/data/home`.

## frontend/components/marketing/testimonial-grid.tsx
- Section framing text under "Community glow".
- Spotlight testimonial card copy and audience badge trio preceding the mapped testimonial data.

## frontend/components/marketing/call-to-action.tsx
- CTA banner badges, headline, descriptive paragraph, and buttons linking to dashboard/pricing.
- Supporting caption summarizing included features beneath the buttons.

## frontend/app/layout.tsx
- `metadata` export establishing default site title template and marketing description.
- Layout wrapper includes static decorative overlays for ambience context.

## frontend/app/loading.tsx
- Loading screen copy: uppercase status line and descriptive sentence about blending ambience.

## frontend/app/api/health/route.ts
- JSON response with static `status: "ok"` and `service: "watch-party-frontend"` payload for health checks.
