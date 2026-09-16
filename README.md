# Real Estate CRM — Frontend

Enterprise-grade Real Estate CRM client application built with React, Bootstrap 5, and modern RESTful architecture. Designed for managing lead lifecycles, real estate inventory (projects, buildings, units), customer bookings, and employee assignments with role-based access control.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Architecture](#project-architecture)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [API Integration](#api-integration)
- [Production Deployment](#production-deployment)

---

## Features

### 1. Authentication & Role-Based Access Control (RBAC)
- Secure JWT-based authentication with automatic bearer header injection.
- Role-based routing: **Admin** and **Sales Employee** access levels.
- Automatic session invalidation and redirection on `401 Unauthorized`.

### 2. Dashboard & Analytics
- Overview metrics: Total Leads, New Inquiries, Interested Prospects, Scheduled Follow-ups, and Total Bookings.
- Interactive lead stage pipeline breakdown with visual conversion bars.
- Quick-access tables for upcoming follow-ups and recent bookings.

### 3. Lead Lifecycle Management
- Full CRUD workflow for lead records with real-time status transitions.
- Multi-criteria filtering: Search by name/phone/email, filter by stage, and filter by assigned employee.
- Comprehensive lead details view: Note logs, follow-up scheduling, stage progression, and ownership assignment.

### 4. Property & Inventory Management
- Hierarchical inventory structure: **Project** &rarr; **Building** &rarr; **Unit**.
- Project catalog with real-time text search.
- Tabbed building views with unit-level status badges (`Available`, `Booked`), pricing formatted in INR (`₹`), and specifications.

### 5. Booking Workflow
- Dynamic cascading booking wizard: Lead selection &rarr; Project &rarr; Building &rarr; Unit.
- Real-time unit preview card displaying pricing and specifications.
- Pre-confirmation modal to prevent accidental submissions.
- Search and pagination support (`?page=1&limit=10&search=...`) with URL synchronization.
- HTTP 409 conflict handling for preventing duplicate bookings on reserved units.

### 6. Employee Management (Admin Only)
- Team directory with role badges (`Admin`, `Sales Employee`) and active status.
- Add and manage employee profiles with secure assignment options.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Core** | React 19, JavaScript (ES6+) |
| **Routing** | React Router DOM v7 |
| **Server State / Caching** | TanStack React Query v5 |
| **UI & Layout** | Bootstrap 5, Custom CSS Variables |
| **Styling Utilities** | Tailwind CSS (prefixed, utility-only) |
| **Form Management** | React Hook Form |
| **HTTP Client** | Axios (centralized interceptors) |
| **Notifications** | React Toastify |
| **Icons** | Custom SVG Icons |

---

## Project Architecture

```
frontend/taskui/
├── public/                 # Static assets, branding, and index.html
├── src/
│   ├── assets/             # Brand logos and vector graphics
│   ├── components/         # Modular UI components
│   │   ├── bookings/       # BookingTable, BookingForm, BookingConfirmModal
│   │   ├── common/         # PageHeader, SearchInput, Pagination, LoadingSpinner, EmptyState
│   │   ├── layout/         # AppLayout, Sidebar, Header
│   │   ├── leads/          # LeadTable, LeadForm, LeadFilters, LeadNotes
│   │   └── properties/     # ProjectCard, BuildingList, UnitTable
│   ├── context/            # Global React Context (AuthContext)
│   ├── hooks/              # TanStack React Query custom hooks
│   │   ├── queryKeys.js    # Centralized query key factory
│   │   ├── useDashboard.js # Dashboard summary, follow-ups, recent bookings
│   │   ├── useLeads.js     # useLeads, useLeadById, CRUD mutations
│   │   ├── useEmployees.js # useEmployees, CRUD mutations
│   │   ├── useProperties.js# useProjects, useProject, CRUD mutations
│   │   ├── useBuildings.js # useBuildings, CRUD mutations
│   │   ├── useUnits.js     # useUnits, CRUD mutations
│   │   └── useBookings.js  # useBookings, useCreateBooking
│   ├── pages/              # Route view components
│   │   ├── auth/           # Login
│   │   ├── bookings/       # Bookings list & creation
│   │   ├── dashboard/      # Metrics & pipeline dashboard
│   │   ├── employees/      # Employee directory
│   │   ├── leads/          # Leads list & lead details
│   │   └── properties/     # Property catalog & building view
│   ├── routes/             # AppRoutes, ProtectedRoute, AdminRoute
│   ├── services/           # Axios API service layer (auth, leads, bookings, etc.)
│   ├── utils/              # Formatters (currency, dates) and helpers
│   ├── App.js              # Application entry and layout wrapper
│   └── index.js            # React DOM mounting
├── .env                    # Environment configuration
└── package.json            # Dependencies and scripts
```

---

## Prerequisites

- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher (or `yarn` / `pnpm`)
- **Backend API**: Running instance of the CRM backend service

---

## Getting Started

### 1. Clone & Navigate

```bash
git clone <repository-url>
cd frontend/taskui
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Create or update `.env` in the root directory:

```env
REACT_APP_API_BASE_URL=https://manju-group-crm-backend.onrender.com/api
REACT_APP_NAME="Real Estate CRM"
REACT_APP_VERSION=1.0.0
```

### 4. Start Development Server

```bash
npm start
```

The application will be accessible at [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

| Variable | Description | Default / Example |
|---|---|---|
| `REACT_APP_API_BASE_URL` | Base URL of the backend REST API | `https://manju-group-crm-backend.onrender.com/api` |
| `REACT_APP_NAME` | Application display name | `Real Estate CRM` |
| `REACT_APP_VERSION` | Current application release version | `1.0.0` |

---

## Available Scripts

| Command | Description |
|---|---|
| `npm start` | Runs the app in development mode with hot reloading. |
| `npm run build` | Compiles and optimizes production assets into the `build/` folder. |
| `npm test` | Launches the test runner in interactive watch mode. |
| `npm run eject` | Ejects Create React App configuration (one-way operation). |

---

## API Integration

The frontend communicates with the backend via the following REST endpoints:

| Domain | Method | Endpoint | Description |
|---|---|---|---|
| **Auth** | `POST` | `/api/auth/login` | Authenticate user and return JWT |
| | `POST` | `/api/auth/logout` | Revoke session |
| **Dashboard** | `GET` | `/api/dashboard` | Fetch summary metrics and pipeline stats |
| **Leads** | `GET` | `/api/leads?page=1&limit=10&search=&stage=&assignedTo=` | Paginated lead list with filters |
| | `POST` | `/api/leads` | Create new lead record |
| | `GET` | `/api/leads/:id` | Fetch lead details and history |
| | `PUT` | `/api/leads/:id` | Update lead record |
| | `DELETE` | `/api/leads/:id` | Delete lead |
| | `POST` | `/api/leads/:id/notes` | Add progress note to lead |
| **Properties** | `GET` | `/api/properties/projects?page=1&limit=10&search=` | List projects with search |
| | `GET` | `/api/properties/projects/:id` | Project details |
| | `GET` | `/api/properties/projects/:id/buildings` | Buildings under a project |
| | `GET` | `/api/properties/buildings/:id/units` | Units under a building |
| **Bookings** | `GET` | `/api/bookings?page=1&limit=10&search=` | Paginated bookings with search |
| | `POST` | `/api/bookings` | Create new booking (`{ leadId, unitId, bookingDate }`) |
| | `GET` | `/api/bookings/:id` | Single booking detail |
| **Employees** | `GET` | `/api/employees?page=1&limit=10&search=` | List employee directory |
| | `POST` | `/api/employees` | Create new employee profile |

---

## State Management & Data Fetching (TanStack React Query)

All server-side data fetching is handled via **TanStack React Query v5**. This provides automatic caching, background re-synchronization, and clean mutation invalidation without navigation-triggered loading flickers.

### QueryClient Configuration (`App.js`)

```js
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // No reload when switching browser tabs
      staleTime: 30_000,           // Cache is fresh for 30 seconds
      retry: 1,                    // Retry failed requests once
    },
  },
});
```

### Custom Hooks (`src/hooks/`)

| Hook File | Exported Hooks |
|---|---|
| `queryKeys.js` | Centralized key factory — ensures consistent cache invalidation |
| `useDashboard.js` | `useDashboard`, `useFollowUpLeads`, `useRecentBookings` |
| `useLeads.js` | `useLeads`, `useLeadById`, `useCreateLead`, `useUpdateLead`, `useDeleteLead` |
| `useEmployees.js` | `useEmployees`, `useCreateEmployee`, `useUpdateEmployee`, `useDeleteEmployee` |
| `useProperties.js` | `useProjects`, `useProject`, `useCreateProject`, `useUpdateProject`, `useDeleteProject` |
| `useBuildings.js` | `useBuildings`, `useCreateBuilding`, `useUpdateBuilding`, `useDeleteBuilding` |
| `useUnits.js` | `useUnits`, `useCreateUnit`, `useUpdateUnit`, `useDeleteUnit` |
| `useBookings.js` | `useBookings`, `useCreateBooking` |

### Cache Invalidation Pattern

Every mutation hook calls `queryClient.invalidateQueries(...)` on success, triggering a background refetch of only the affected list or detail. **Navigation between pages does NOT trigger loading states** if the data is still within `staleTime`.

```js
// Example: after creating a lead
queryClient.invalidateQueries({ queryKey: queryKeys.leads.lists() });
```

---

## Production Deployment

### Building the Application

Generate the production bundle:

```bash
npm run build
```

This generates minified, optimized static HTML, CSS, and JS bundles in the `build/` directory.

### Serving with Nginx

Example Nginx virtual host configuration (`nginx.conf`):

```nginx
server {
    listen 80;
    server_name crm.example.com;

    root /var/www/taskui/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
