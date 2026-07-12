# z-gallery Session Log

## Session 2025-01-22

- **Portrait aspect ratio bug fixed**: 16:9 aspect_ratio was being applied to 2:3 portrait frame, generating landscape images that were severely cropped into portrait slot. The correct mapping is `2:3 → 2:3` (or `4:6` normalized), not hardcoded `16:9`.
- **IIFE pattern removed**: Unnecessary immediately-invoked function expression wrapping simplified to direct initialization.
- **innerHTML pattern on `.meta` element flagged**: Safe today but should convert to `textContent` + separate `<br>` element if field becomes dynamic in future.
- **Deferred: poll-failure feedback UX**: Silent poll drops need UX decision on error copy and which item types should surface individual errors vs. aggregate feedback. Requires follow-up decision.
