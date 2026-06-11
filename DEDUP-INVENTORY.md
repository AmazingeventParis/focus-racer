# Divergence Inventory — photographer vs organizer spaces
<!-- Plan 013, Phase 1 — auto-generated 2026-06-11 -->

## Summary

| Classification | Count | Files |
|---|---|---|
| Identical | 2 | clubs, api-keys |
| Trivially different (labels + URL prefix only) | 17 | layout, login, events, events/new, credits, settings, parrainage, carte, marketplace, statistics, team, events/[id]/debug-ocr, events/[id]/live, events/[id]/packs, events/[id]/photos, events/[id]/start-list, **orders** ← consolidation target |
| Substantively different (logic / data shape) | 5 | dashboard, events/[id], events/[id]/upload, events/[id]/analytics, support, wrapped/[year] |

### Consolidation order (lowest divergence first)
1. `orders/page.tsx` — **done in this plan (013)**
2. `login/page.tsx`, `carte/page.tsx` — function-name only, trivial wrappers
3. `events/page.tsx`, `events/new/page.tsx`, `credits/page.tsx`, `settings/page.tsx`, `parrainage/page.tsx`, `marketplace/page.tsx`, `statistics/page.tsx` — URL prefix + one label
4. `team/page.tsx` — all "photographe" → "organisateur" labels, no logic diff
5. `events/[id]/debug-ocr`, `live`, `packs`, `photos`, `start-list` — single back-link URL each
6. `layout.tsx` — sidebar component import + all route hrefs
7. `dashboard/page.tsx` — SmartAlertsList wrapper div + StreakCard position differ (minor layout)
8. `events/[id]/analytics/page.tsx` — organizer shows simpler KPIs (no pack/unit breakdown)
9. `support/page.tsx` — photographer shows sportifId badge for runner messages; organizer does not
10. `wrapped/[year]/page.tsx` — different API response fields (photographer: eventsCovered/photosUploaded/totalRevenue/bestSeller; organizer: eventsOrganized/runnersManaged)
11. `events/[id]/page.tsx` — organizer has redesigned action-button cluster (status-toggle buttons added, SVG removed from upload button, Separator removed, different button ordering)
12. `events/[id]/upload/page.tsx` — **most divergent**: organizer has a condensed always-visible card; photographer shows drop-zone when no files selected. Organizer also has thumbnail-grid preview for selected files (more polished). **Save for last.**

---

## File-by-file classification

### IDENTICAL (no changes)

| File | Notes |
|---|---|
| `clubs/page.tsx` | Byte-identical |
| `api-keys/page.tsx` | Byte-identical |

### TRIVIALLY DIFFERENT — URL prefix + role labels only

All diffs in this category contain only: `"/photographer/"` → `"/organizer/"`, role-label strings ("photographe" → "organisateur"), and function/component names. No logic or conditional-rendering difference.

| File | Changed lines | Divergence detail |
|---|---|---|
| `layout.tsx` | ~28 | Sidebar component import (`ClientSidebar` → `OrganizerSidebar`), all nav hrefs, default role fallback `"PHOTOGRAPHER"` → `"ORGANIZER"` |
| `login/page.tsx` | 2 | Function name only |
| `events/page.tsx` | 6 | 3 hrefs |
| `events/new/page.tsx` | 6 | 2 hrefs |
| `credits/page.tsx` | 6 | 1 href + 1 label ("photographes réguliers" → "organisateurs réguliers") |
| `settings/page.tsx` | 2 | 1 label in parrainage description |
| `parrainage/page.tsx` | 4 | Function name + 1 label |
| `carte/page.tsx` | 2 | Function name only |
| `marketplace/page.tsx` | 4 | Function name + 1 placeholder text |
| `statistics/page.tsx` | 2 | Stats endpoint URL (`/api/stats/photographer` → `/api/stats/organizer`) — note: organizer endpoint is `export { GET } from "../photographer/route"`, same logic |
| `team/page.tsx` | 34 | All "photographe" → "organisateur" throughout UI strings; no logic difference |
| `events/[id]/debug-ocr/page.tsx` | 2 | Back-link href |
| `events/[id]/live/page.tsx` | 2 | Back-link href |
| `events/[id]/packs/page.tsx` | 2 | Back-link href |
| `events/[id]/photos/page.tsx` | 2 | Back-link href |
| `events/[id]/start-list/page.tsx` | 2 | Back-link href |
| `orders/page.tsx` | **4** | **Stats endpoint** (`/api/stats/photographer` → `/api/stats/organizer`, same logic) + **CSV header** (`"Net photographe"` → `"Net"`). **CONSOLIDATION TARGET for Plan 013.** |

### SUBSTANTIVELY DIFFERENT — logic or data shape diverges

| File | Changed lines | Divergence detail | Which copy is more correct/recent? |
|---|---|---|---|
| `dashboard/page.tsx` | 26 | `SmartAlertsList` wrapped in `<div className="mb-6">` in photographer but direct `<SmartAlertsList />` in organizer; `StreakCard` placed inside "Gamification + Quick actions" block in organizer vs separate "Streaks" block in photographer. Minor layout-only difference, no functional change. | **Organizer** (StreakCard placement is cleaner). |
| `events/[id]/page.tsx` | 117 | Organizer redesigned the action-button cluster: (a) added quick status-toggle buttons (Publier/Archiver/Remettre en brouillon); (b) reordered buttons (Start-List and Tarifs moved above Upload/Live in organizer); (c) removed `Separator` between button groups; (d) removed SVG plus icon from upload button; (e) changed "Modifier" from outlined to ghost variant. | **Organizer** (has status-toggle buttons, is more complete). Photographer is missing status toggles. |
| `events/[id]/upload/page.tsx` | 199 | Photographer: drop-zone shown when `selectedFiles.length === 0`, hidden once files selected; selected-files shown as simple count+icon. Organizer: drop-zone removed entirely, card always visible; selected-files shown as a **thumbnail grid** with per-file remove buttons. Organizer version is more polished for UX. Also photographer shows "Ajouter des photos" in hidden `<input>` + conditional card; organizer collapses these into a single always-visible card. | **Organizer** (thumbnail grid is more recent and better UX; photographer is missing it). Photographer is missing the grid preview. |
| `events/[id]/analytics/page.tsx` | 14 | Photographer has `packOrders`/`unitOrders`/`packPhotos`/`unitPhotos` fields in the interface and renders pack vs unit breakdown in subtitles. Organizer uses simpler "Chiffre d'Affaires" label and `{revenue.totalOrders} commandes ({revenue.soldPhotos} photos vendues)`. The underlying API is shared. | **Photographer** (more detailed breakdown). Organizer lost the pack/unit breakdown; unclear if intentional. |
| `support/page.tsx` | 12 | Photographer renders a sportif-badge block (`recipientId` + `sportifId`) for messages from runners; organizer does not have this block. This represents a real feature difference since photographers receive messages from runners (buyers), organizers may not need this flow in the current design. | **Photographer** (more complete — shows sportifId context for runner messages). |
| `wrapped/[year]/page.tsx` | 37 | Different TypeScript interfaces: photographer has `eventsCovered`, `photosUploaded`, `totalRevenue`, `bestSeller`, `reactionsReceived`; organizer has `eventsOrganized`, `runnersManaged`. Different rendered stat cards. Both call the same `/api/wrapped/[year]` endpoint which returns role-appropriate data via `getWrappedStats`. | Neither — they represent genuinely role-specific stats. Both are correct for their role. |

---

## Shared components (already shared, no action needed)

All these components are consumed identically by both spaces:

- `src/components/layout/MobileNav.tsx` — mobile nav shell (instantiated differently per layout)
- `src/components/layout/ClientSidebar.tsx` — photographer sidebar
- `src/components/layout/OrganizerSidebar.tsx` — organizer sidebar
- All `src/components/ui/*` — shadcn/ui primitives
- `src/components/gamification/StreakCard.tsx`
- `src/components/gamification/SmartAlertsList.tsx`

---

## API endpoints (all shared, none per-space)

Both spaces call the same API routes (`/api/events`, `/api/orders`, `/api/stripe/connect/*`, `/api/credits/checkout`, etc.). The single exception `/api/stats/organizer` is a thin re-export of `/api/stats/photographer` — same logic, different URL.

---

## Consolidation conventions (established in Plan 013)

- **Role prop**: `role: "photographer" | "organizer"` drives all per-role behaviour.
- **URL prefix**: derived as `/${role}/` — no hardcoded string literals in shared components.
- **CSV Net label**: `"Net photographe"` for photographer, `"Net organisateur"` for organizer (previously organizer had ambiguous `"Net"`).
- **Stats endpoint**: `/api/stats/${role}` (both return same shape since organizer re-exports).
- **Component location**: `src/components/pro/` for shared pro-space components.
- **Test location**: `src/components/pro/__tests__/` for unit tests of pure helpers.
