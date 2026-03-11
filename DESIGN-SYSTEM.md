# Apex CFO Finance Dashboard — Design System
> Extracted from Screen 31 (SaaS Comp Engine Config). All CFO Finance screens must follow this spec exactly.

---

## Brand Tokens

```
Primary Navy:   #1B3A7D  (sidebar bg, header save button, change log header)
Primary Red:    #C7181F  (error states, warning banner, validation failures)
Neutral Light:  #F8FAFC  (section headers bg, table headers bg)
White:          #FFFFFF  (main content bg, cards)
```

### Tailwind Color Classes (use these — do not use violet, emerald, blue, or any other colors)
```
primary-800 = #1B3A7D  (navy)
primary-900 = #0f172a  (darkest nav bg)
primary-700 = active nav item bg
primary-300/400 = nav text secondary
secondary-600 = #C7181F (red)
secondary-50/100/200 = red tint backgrounds for errors
neutral-50/100/200 = light gray surfaces
```

---

## Page Shell Layout

Every CFO Finance screen uses this exact shell — do not alter it:

```
┌─────────────────────────────────────────────────────┐
│ LEFT SIDEBAR (w-56, bg-primary-900, full height)    │
│  - Logo block: "A" icon + "Apex Affinity" +         │
│    "CFO Finance Tool" label                         │
│  - Nav sections: Operations / Configuration /       │
│    Reporting                                        │
│  - Active item: bg-primary-700 + red left border    │
│  - User profile at bottom                           │
├─────────────────────────────────────────────────────┤
│ TOP HEADER BAR (bg-white, border-b, shadow)         │
│  Left: breadcrumb + page title + badges             │
│  Right: Mode toggle + Effective Date + Save/Discard │
├─────────────────────────────────────────────────────┤
│ WARNING BANNER (conditional, bg-secondary-50)       │
│  Only shown when validation errors exist            │
│  Red triangle icon + error message + Jump to Error  │
├──────────────────────────────────┬──────────────────┤
│ MAIN CONFIG AREA (flex-1)        │ CHANGE LOG PANEL │
│  Collapsible sections, scroll    │ (w-72, fixed)    │
│                                  │ Navy header      │
│                                  │ Filter bar       │
│                                  │ Timeline entries │
│                                  │ Export button    │
└──────────────────────────────────┴──────────────────┘
```

---

## Component Patterns

### Collapsible Section

Every config block is a collapsible section. Pattern:

```tsx
<section className="bg-white rounded-large shadow-custom border border-neutral-200 overflow-hidden">
  {/* Header — clickable, toggles open/closed */}
  <div
    className="bg-neutral-50 px-5 py-3 border-b border-neutral-200 flex justify-between items-center cursor-pointer hover:bg-neutral-100 transition-colors"
    onClick={() => toggleSection('secN')}
  >
    <h2 className="font-heading font-semibold text-neutral-800 text-sm flex items-center gap-2">
      {/* SVG icon in text-primary-600 */}
      Section Title
      <span className="text-[10px] font-medium text-neutral-400 font-normal">subtitle</span>
    </h2>
    <div className="flex items-center gap-2">
      {/* Valid badge (green) or Error badge (red) */}
      <span className="text-[10px] font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-small">Valid</span>
      {/* Chevron rotates on collapse */}
      <ChevronIcon />
    </div>
  </div>
  {/* Body — shown/hidden via useState */}
  <div className={isOpen ? 'block' : 'hidden'}>
    {/* content */}
  </div>
</section>
```

**Error state** — section header changes to red when invalid:
```tsx
// Header bg: bg-secondary-50, border: border-secondary-200
// Badge: bg-secondary-100 text-secondary-700 with warning icon
// "Error: Sum = 103%" style label
```

### Data Table (inside sections)

```tsx
<table className="w-full text-sm">
  <thead className="bg-neutral-50 border-b border-neutral-200">
    <tr>
      <th className="px-4 py-2 text-left text-[10px] font-bold text-neutral-500 uppercase tracking-wide">
        Column Name
      </th>
    </tr>
  </thead>
  <tbody className="divide-y divide-neutral-100">
    <tr className="hover:bg-neutral-50 group">
      <td className="px-4 py-2">
        {/* Read-only: plain text. Edit mode: input field */}
        <input
          type="text"
          className="w-full border border-neutral-300 rounded-small px-2 py-1 text-xs
                     focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
          disabled={!editMode}
        />
      </td>
    </tr>
  </tbody>
</table>
```

### Editable Input Field

```tsx
// Normal state
<input className="border border-neutral-300 rounded-small px-2 py-1 text-xs
                  focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none" />

// Error state (validation failure)
<input className="border border-secondary-400 rounded-small px-2 py-1 text-xs
                  focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500 
                  outline-none bg-secondary-50" />

// Disabled (read-only mode)
<input className="bg-neutral-50 text-neutral-400 outline-none" disabled />
```

### Header Controls

```tsx
{/* Read-Only / Edit Toggle */}
<div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-small px-3 py-2">
  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide">Mode:</span>
  <span className="text-[10px] font-medium text-neutral-400">Read-Only</span>
  <button /* toggle switch */ />
  <span className="text-[10px] font-bold text-primary-700">Edit</span>
</div>

{/* Effective Date Picker */}
<div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-small px-3 py-2">
  <CalendarIcon className="text-neutral-400" />
  <div>
    <div className="text-[9px] text-neutral-400 uppercase tracking-wider font-semibold">Effective Date</div>
    <input type="date" className="text-xs font-bold text-neutral-800 bg-transparent border-none outline-none" />
  </div>
</div>

{/* Save Button */}
<button className="px-5 py-2 text-sm font-bold text-white bg-primary-800 hover:bg-primary-700
                   rounded-small shadow-custom transition-all flex items-center gap-2">
  Save Configuration
</button>

{/* Discard Button */}
<button className="px-4 py-2 text-sm font-semibold text-neutral-600 hover:bg-neutral-100
                   rounded-small border border-neutral-200 transition-colors">
  Discard
</button>
```

### Warning Banner

```tsx
{hasErrors && (
  <div className="bg-secondary-50 border-b border-secondary-200 px-6 py-2.5 flex items-center gap-3">
    <WarningIcon className="text-secondary-600 flex-shrink-0" />
    <div className="flex-1">
      <span className="text-xs font-bold text-secondary-700">Error Name: </span>
      <span className="text-xs text-secondary-600">Description. Affected section: <strong>Section Name</strong>. Save is blocked.</span>
    </div>
    <button className="text-[10px] font-bold text-secondary-600 border border-secondary-300 rounded-small px-2 py-1">
      Jump to Error
    </button>
  </div>
)}
```

### Change Log Panel

```tsx
{/* Panel shell */}
<div className="w-72 flex-shrink-0 border-l border-neutral-200 bg-white flex flex-col">
  
  {/* Header — always navy */}
  <div className="bg-primary-800 px-4 py-3 flex justify-between items-center">
    <h3 className="font-heading font-bold text-white text-sm">Change Log</h3>
    <div className="flex items-center gap-2">
      <span className="text-[10px] bg-primary-600 text-primary-100 px-1.5 py-0.5 rounded-small font-bold">
        {count} changes
      </span>
      <button className="text-xs text-primary-200 hover:text-white underline">Export</button>
    </div>
  </div>

  {/* Filter bar */}
  <div className="px-3 py-2 border-b border-neutral-200 bg-neutral-50">
    {['All', 'Today', 'Errors', 'Mine'].map(f => (
      <button className={active === f
        ? "text-[10px] font-bold px-2 py-1 rounded-small bg-primary-800 text-white"
        : "text-[10px] font-medium px-2 py-1 rounded-small bg-white border border-neutral-200 text-neutral-500"
      }>{f}</button>
    ))}
  </div>

  {/* Log entries — scrollable */}
  <div className="flex-1 overflow-y-auto p-3 space-y-3">
    {/* Normal entry: border-l-2 border-neutral-200, dot bg-primary-500 */}
    {/* Error entry: border-l-2 border-secondary-300, dot bg-secondary-500 */}
    {/* Each entry: timestamp, user name, field_key, old_value → new_value */}
  </div>

  {/* Footer */}
  <div className="p-3 border-t border-neutral-200 bg-neutral-50">
    <button className="w-full text-xs font-semibold text-primary-700 text-center py-1">
      View Full Audit Log →
    </button>
  </div>
</div>
```

### Carrier/Tab Switcher (for Insurance Engine)

```tsx
<div className="flex gap-1 px-4 pt-3 pb-0 border-b border-neutral-200 bg-white overflow-x-auto">
  {carriers.map(c => (
    <button
      className={active === c
        ? "px-4 py-2 text-xs font-bold rounded-t-small border border-b-0 bg-white border-neutral-200 text-primary-700"
        : "px-4 py-2 text-xs font-bold rounded-t-small border border-b-0 bg-neutral-50 border-neutral-200 text-neutral-500"
      }
    >{c}</button>
  ))}
</div>
```

---

## Typography Scale

```
Page title:       text-lg font-bold font-heading text-neutral-900
Section title:    text-sm font-semibold font-heading text-neutral-800
Table header:     text-[10px] font-bold text-neutral-500 uppercase tracking-wide
Table cell:       text-xs text-neutral-700
Label:            text-[10px] font-semibold text-neutral-500 uppercase tracking-wider
Micro/timestamp:  text-[10px] text-neutral-400
Nav item:         text-xs font-medium
Nav section:      text-[9px] font-bold text-primary-400 uppercase tracking-widest
```

---

## Validation Rules (all screens)

| Validation | Rule | Blocks Save |
|---|---|---|
| Override pool levels | L1+L2+L3+L4+L5 must = 100% | Yes |
| Seller/override split | Seller% + Override% must = 100% | Yes |
| Business center split | All 5 parts must sum to $39 | Yes |
| Insurance override gen | Gen1+Gen2+...+Gen6 shown as informational | No |

When validation fails:
1. Section header turns red (bg-secondary-50, border-secondary-200)
2. Error badge appears in section header ("Error: Sum = X%")
3. Warning banner appears at top
4. Save button is disabled

---

## Supabase Tables

| Table | Used For |
|---|---|
| `saas_comp_engine_config` | All SaaS comp values |
| `insurance_comp_engine_config` | All insurance comp values |
| `comp_engine_change_log` | Both engines, filtered by `engine_type` |
| `carrier_rate_grids` | Insurance carrier rates by rank |
| `insurance_ranks` | Insurance rank structure |

Change log entry shape:
```ts
{
  id: string
  engine_type: 'saas' | 'insurance'
  field_key: string        // e.g. "Override.L3.Pct"
  old_value: string
  new_value: string
  changed_by: string       // user display name
  changed_at: string       // ISO timestamp
  effective_date: string
  has_error: boolean
}
```

---

## Role Gating

All `/finance/*` routes:
```ts
// In page.tsx — top of component
const { data: { user } } = await supabase.auth.getUser()
const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
if (!['cfo', 'admin'].includes(profile.role)) redirect('/dashboard')
```

---

## File Naming Convention

```
/mockups/screen-{N}-{slug}.html       Source mockup HTML from UX Magic
/app/finance/{slug}/page.tsx          Next.js page
/app/finance/{slug}/components/       Sub-components if needed
/tests/unit/finance/{slug}.test.ts    Unit tests
```

---

## Rules for Claude Code

1. **Always check /mockups folder** before writing any CFO Finance screen
2. **Never invent layout** — if there's a mockup, match it exactly
3. **Never use colors** other than the brand tokens above
4. **Never add sections** not present in the mockup or spec
5. **Correct placeholder data** — UX Magic uses fake carriers/ranks, always replace with real Apex values from BRAIN.md
6. **Change log panel** is required on every config screen — right side, w-72, navy header
7. **Validation must block save** — never let invalid data save silently
8. **Role gate every /finance route** — cfo and admin only
