# Discovery Response Contract

The discovery experiences on the Watch Party dashboard ("Trending", "Recommendations", future curated lists) should all follow a consistent data contract so client features can reuse the same plumbing without bespoke fallbacks.

## Backend Response Shape

Discovery endpoints continue to return a `StandardResponse` envelope:

```jsonc
{
  "success": true,
  "message": "Trending parties retrieved successfully",
  "data": {
    "trending_parties": [/* WatchParty */],
    "generated_at": "2024-03-15T12:30:00Z"
  }
}
```

Key guidelines:

- The payload MUST live inside the `data` key of the envelope.
- Party collections should use a descriptive key (e.g. `trending_parties`, `recommended_parties`) and MAY include metadata (timestamps, scoring method, etc.).
- Avoid mixing paginated and non-paginated schemas—discovery surfaces return curated arrays, not `results` collections.

## Frontend Client Expectations

`frontend/lib/api-client.ts` unwraps the envelope for discovery helpers and returns plain arrays:

```ts
const parties = await partiesApi.getTrending() // => WatchParty[]
```

Consumers can rely on:

- `partiesApi.getTrending()` resolving to a `WatchParty[]` (empty array when nothing is trending).
- `partiesApi.getRecommendations()` resolving to a `WatchParty[]`.
- Any future discovery helper following the same pattern: the client unwraps the `StandardResponse` and exposes the array directly.

If additional metadata is required, extend the helper to return an object such as `{ parties, meta }` but maintain the StandardResponse envelope at the transport layer.

## UI Handling

The dashboard now displays an informational message when curated lists return no items (e.g. no trending parties). Future discovery views should provide similar user feedback rather than falling back to unrelated lists.
