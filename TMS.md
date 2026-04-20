# Travel - Travel Booking Management System

Travel is a modern, full-stack travel booking management system designed for individual travelers and travel managers. It provides a comprehensive dashboard for managing flights, hotels, car rentals, expenses, itineraries, and traveler profiles with an intuitive, professional interface.

## Features

### 1. Dashboard Overview
The main dashboard displays key metrics at a glance:
- **Active Bookings**: Count of non-cancelled bookings with trend indicators
- **Total Spend**: Aggregated cost across all bookings and expenses
- **Upcoming Trips**: Number of scheduled trips with next departure date
- **Pending Approvals**: Bookings awaiting manager review

The dashboard also features:
- **Recent Bookings**: Quick access to the latest 5 bookings with status indicators
- **Upcoming Trips**: Chronological list of trips with destination, duration, and booking count
- **Quick Actions**: Shortcuts to common tasks (New Booking, View Calendar, Rebook Flight, Manage Expenses)

### 2. Booking Management
A comprehensive booking management system with:
- **Filterable List**: Filter by booking type (Flight, Hotel, Car) and status (Confirmed, Pending, In Review, Cancelled)
- **Status Management**: Inline status selection with color-coded pills
- **Booking Details**: Route/property name, dates, price, and status at a glance
- **Actions**: Edit and delete bookings with confirmation
- **Add New**: Create new bookings with a dedicated form

### 3. Itinerary Builder
Chain multiple bookings into organized trip itineraries:
- **Trip Overview**: Destination, dates, number of nights, and linked bookings
- **Booking Aggregation**: View all flights, hotels, and cars for a trip
- **Route Visualization**: See the complete travel route (e.g., MNL → NRT → DXB)
- **Trip Management**: Create, edit, and delete itineraries
- **Visual Organization**: Grid layout with date blocks for easy scanning

### 4. Expense Tracker
Log and categorize travel costs:
- **Expense Logging**: Record expenses with date, category, amount, and description
- **Trip Association**: Link expenses to specific trips or mark as general
- **Category Breakdown**: Visualize spending by category (meals, activities, transport, accommodation)
- **Filtering**: Filter expenses by trip for detailed cost analysis
- **Total Tracking**: Real-time expense totals

### 5. Traveler Profiles
Store and manage traveler information:
- **Profile Management**: Create and edit traveler profiles
- **Passport Information**: Store passport numbers for quick reference
- **Seat Preferences**: Save preferred seating (window, aisle, etc.)
- **Loyalty Numbers**: Store airline and hotel loyalty program numbers
- **Quick Autofill**: Use saved profiles during booking creation

### 6. Approval Workflow
Manage booking approvals for organizational compliance:
- **Status Tracking**: Monitor bookings in different approval states
- **In-Review Status**: Bookings awaiting manager approval
- **Approval Management**: Accept or reject bookings with comments
- **Audit Trail**: Track approval history and decision makers

### 7. Reports & Analytics
Gain insights into travel spending and patterns:
- **Key Metrics**: Total bookings, spend, average booking cost, and trip count
- **Booking Breakdown**: Distribution of bookings by type (flight, hotel, car)
- **Expense Analysis**: Spending patterns by category
- **Status Overview**: Visual representation of booking statuses
- **Trend Indicators**: Track spending trends over time

### 8. Settings & Profile Management
Customize your Travel experience:
- **General Settings**: Company name, currency, budget thresholds
- **Notification Preferences**: Control email alerts and reminders
- **Security**: Password management and session control
- **Appearance**: Theme selection (dark/light)
- **User Profile**: Update personal information and preferences

## Design Language

Travel features a modern, minimalist design with the following characteristics:

### Color Palette
- **Primary Background**: Deep charcoal (#1A1F2E)
- **Card Background**: Slightly lighter charcoal (#22272F)
- **Brand Accent**: Teal (#1D9E75) — used for CTAs, highlights, and status indicators
- **Status Colors**:
  - Green (#10B981) — Confirmed
  - Amber (#F59E0B) — Pending
  - Purple (#A855F7) — In Review
  - Red (#EF4444) — Cancelled
- **Text**: Off-white (#F5F7FA) for primary, muted gray (#8B92A0) for secondary

### Typography
- **Headings**: Syne (bold, geometric, 700 weight)
- **Body**: DM Sans (clean, readable, 400-600 weight)
- **Hierarchy**: Intentional use of weight and size for visual distinction

### Components
- **Cards**: 12px border-radius with 0.5px borders
- **Buttons**: Smooth transitions with hover states
- **Status Badges**: Color-coded with semi-transparent backgrounds
- **Icons**: Lucide React icons for consistency
- **Spacing**: 16px base unit for margins and padding

### Interactions
- **Hover States**: Subtle lift effect (shadow increase) on cards and buttons
- **Micro-interactions**: 200ms smooth transitions on all state changes
- **Loading States**: Teal spinner with gentle rotation
- **Feedback**: Toast notifications for confirmations and errors
- **Animations**: Entrance animations and smooth transitions throughout

## Navigation

The application uses a fixed sidebar navigation with collapsible sections:

### Overview Section
- Dashboard
- Bookings (with badge showing count)
- Itineraries

### Manage Section
- Travelers
- Expenses
- Reports

### Account Section
- Profile
- Settings

The sidebar collapses to icon-only mode on tablets and transforms to a hamburger menu on mobile devices.

## Getting Started

### Installation
```bash
cd /home/ubuntu/Travel
pnpm install
```

### Development
```bash
pnpm dev
```

The application will be available at `http://localhost:3000/`

### Building
```bash
pnpm build
```

## Technology Stack

- **Frontend**: React 19 with TypeScript
- **Styling**: Tailwind CSS 4 with custom theme variables
- **State Management**: Zustand for global store
- **Routing**: Wouter for client-side routing
- **UI Components**: shadcn/ui with Radix UI primitives
- **Icons**: Lucide React
- **Animations**: Framer Motion (configured)
- **Forms**: React Hook Form with Zod validation

## File Structure

```
client/
  src/
    pages/           # Page components for each route
    components/      # Reusable UI components
    lib/            # Utilities and store
    contexts/       # React contexts
    App.tsx         # Main app with routing
    index.css       # Global styles and theme
    main.tsx        # React entry point
  public/           # Static files
  index.html        # HTML template
```

## Mock Data

The application includes comprehensive mock data for demonstration:
- 7 bookings across different types and statuses
- 3 upcoming trips with associated bookings
- 3 expense entries across categories
- 1 traveler profile with loyalty numbers

This mock data is managed through Zustand store and can be easily replaced with API calls.

## Key Features Implemented

✅ Dashboard with stat cards and trends
✅ Booking management with filtering and status control
✅ Itinerary builder with trip aggregation
✅ Expense tracking with categorization
✅ Traveler profile management
✅ Reports and analytics
✅ Settings and preferences
✅ Responsive design (desktop, tablet, mobile)
✅ Dark theme with teal accent
✅ Smooth animations and transitions
✅ Comprehensive navigation

## Future Enhancements

Potential features for future development:
- Integration with real flight/hotel booking APIs (Amadeus, Duffel)
- Real-time notifications
- Multi-user support with role-based access
- Budget alerts and spending limits
- Expense receipt uploads
- Calendar view with drag-and-drop
- Export to PDF/CSV
- Mobile app version
- Integration with payment systems
- Advanced analytics and reporting

## Browser Support

Travel is optimized for modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Performance

The application is optimized for performance:
- Fast page transitions with client-side routing
- Efficient state management with Zustand
- Optimized component rendering
- CSS-in-JS with Tailwind for minimal bundle size

## Accessibility

Travel follows accessibility best practices:
- Semantic HTML structure
- Keyboard navigation support
- Focus indicators on interactive elements
- Color contrast compliance
- ARIA labels where appropriate

## Support & Feedback

For issues, suggestions, or feature requests, please contact the development team.

---

**Travel v1.0.0** — Built with React, Tailwind CSS, and modern web technologies.
