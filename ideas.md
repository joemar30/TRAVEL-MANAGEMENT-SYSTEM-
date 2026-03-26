# Wayfarer Design Brainstorm

## Selected Design Approach: Modern Minimalist with Teal Accent

### Design Movement
**Contemporary Minimalism with Functional Depth** — A refined, clean aesthetic that prioritizes clarity and usability while introducing subtle depth through carefully placed shadows, micro-interactions, and intentional whitespace. This approach draws from modern SaaS design (Figma, Linear) with a travel-centric personality.

### Core Principles
1. **Information Hierarchy through Whitespace** — Use generous spacing and breathing room to guide attention. Dense information is broken into digestible cards with clear visual separation.
2. **Functional Elegance** — Every visual element serves a purpose. No decorative flourishes; instead, subtle shadows and borders create depth that aids usability.
3. **Teal as Narrative** — The brand teal (#1D9E75) acts as a wayfinding tool, highlighting actionable elements, status indicators, and key metrics. It represents trust and movement.
4. **Responsive Fluidity** — The layout adapts gracefully from desktop to mobile without compromising the design language. Sidebar collapses intelligently; cards reflow naturally.

### Color Philosophy
- **Primary Background**: Deep charcoal (#1A1F2E) — sophisticated, reduces eye strain, creates canvas for content
- **Card Background**: Slightly lighter charcoal (#22272F) — subtle elevation through tone
- **Accent Teal**: #1D9E75 — energetic, trustworthy, used for CTAs, status indicators, and highlights
- **Complementary Neutrals**: Soft grays (#8B92A0) for secondary text, borders at 0.5px for refinement
- **Status Colors**: Green (#10B981) for confirmed, Amber (#F59E0B) for pending, Purple (#A855F7) for in-review, Red (#EF4444) for cancelled
- **Text**: Off-white (#F5F7FA) for primary, muted gray (#B4BAC4) for secondary

### Layout Paradigm
**Asymmetric Dashboard with Sidebar Navigation** — The fixed left sidebar (collapsible on mobile) anchors navigation, while the main content area uses a flexible grid that combines:
- Wide stat cards at the top (4-column on desktop, responsive below)
- Two-column layout for main content: left for "Recent Bookings" list, right for "Upcoming Trips" and "Quick Actions"
- Full-width sections for detailed pages (Bookings, Itineraries, Expenses, etc.)
- Sidebar collapses to icons on tablets; hamburger menu on mobile

### Signature Elements
1. **Stat Cards with Trend Indicators** — Each dashboard metric includes a small trend badge (e.g., "↑ 3 this week") in teal, creating visual interest and context
2. **Booking Icons by Type** — Flight, hotel, and car rental icons (from lucide-react) distinguish booking types at a glance; each has a subtle background circle
3. **Date Blocks** — In the Upcoming Trips panel, large date numbers (e.g., "2 APR") paired with destination name and booking count create a scannable timeline

### Interaction Philosophy
- **Hover States**: Subtle lift effect (shadow increase) on cards and buttons; teal underline on navigation items
- **Micro-interactions**: Smooth transitions (0.2s) on all state changes; loading spinners use teal
- **Feedback**: Toast notifications (via Sonner) for confirmations, errors, and info; no jarring alerts
- **Modals**: Smooth fade-in/out with backdrop blur; forms use clear labeling and inline validation

### Animation Guidelines
- **Entrance**: Cards fade in with a slight upward motion (100ms) when page loads
- **Transitions**: All color changes, hover states, and modal appearances use 200ms ease-in-out
- **Loading**: Teal spinner with gentle rotation (1.5s loop)
- **Micro-feedback**: Button press shrinks slightly (scale 0.98) for tactile feel
- **Sidebar Collapse**: Smooth width transition (300ms) with icon repositioning

### Typography System
- **Headings (Syne)**: Bold, geometric, used for page titles and section headers
  - H1: 32px, weight 700 — page titles (Dashboard, Bookings, etc.)
  - H2: 24px, weight 600 — section headers (Recent Bookings, Upcoming Trips)
  - H3: 18px, weight 600 — card titles and subsections
- **Body (DM Sans)**: Clean, readable, used for all body text
  - Large: 16px, weight 500 — primary information (booking names, prices)
  - Regular: 14px, weight 400 — secondary text, descriptions
  - Small: 12px, weight 400 — metadata, timestamps, status labels
- **Hierarchy**: Combine weight and size; never rely on color alone for emphasis

---

## Implementation Notes
- Use Tailwind CSS with custom theme variables for consistency
- Leverage shadcn/ui components for modals, dropdowns, and form elements
- Ensure 0.5px borders on cards for refinement
- Border-radius: 12px for all cards and interactive elements
- Sidebar width: 240px (desktop), collapses to 64px (icon-only), hamburger on mobile
- Maintain 16px base spacing unit for all margins and padding
- Use Framer Motion for entrance animations and transitions
