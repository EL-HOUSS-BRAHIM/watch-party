# Marketing Page Architecture & Navigation Visibility

## Modular marketing components

The marketing landing page (`app/page.tsx`) now composes focused presentational blocks from `components/marketing/`:

- `HeroSection` – renders the hero banner and dynamic CTA buttons based on authentication state.
- `FeatureGrid` – showcases the feature cards provided in the marketing content data module.
- `Testimonials` – displays community feedback cards with ratings and verification badges.
- `CtaBanner` – highlights the conversion CTA with supporting bullet points.

Static marketing copy lives in `app/(marketing)/data/home-content.ts` where the features, stats, and testimonials are typed. Sections accept the relevant data via props, making it simple to swap in CMS-driven content or async loaders without modifying the layout components.

## Centralised navigation visibility rules

Shared helpers in `lib/navigation/visibility.ts` encapsulate the logic that determines when dashboard chrome or public headers render:

- `isAuthRoute(pathname)` – matches authentication related routes and segments.
- `isMarketingRoute(pathname)` – checks if the pathname belongs to public marketing pages.
- `shouldShowDashboardChrome(pathname)` – reuses the predicates above to keep dashboard-only UI in sync across header and sidebar components.

`CinemaHeader` and `CinemaNavigation` both consume these helpers, so updates to route visibility now require changes in a single file. A lightweight Jest suite in `__tests__/lib/navigation/visibility.test.ts` guards the helper behaviour across representative paths.

## Mobile navigation providers

`components/navigation/mobile-navigation.tsx` now reads authentication, notifications, and theme state from the shared providers (`useAuth`, `useNotifications`, and `useTheme`). This keeps the mobile sheet aligned with the session-aware desktop experience while avoiding duplicate fetch logic. Tests in `__tests__/components/navigation/mobile-navigation.test.tsx` mock these providers to validate guest and authenticated renders.
