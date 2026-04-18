# Product Requirements Document (PRD)
# Attendance System

**Version:** 1.0  
**Date:** April 18, 2026  
**Status:** Active Development

---

## 1. Executive Summary

### Project Overview
A web-based attendance tracking system with credit management for customers, built with React and Supabase. The system enables administrators to manage customers and issue credits while allowing customers to mark their daily attendance and track their credits.

### Target Users
- **Administrators**: Manage customers, view analytics, issue credits
- **Customers**: Mark attendance, view credits, track history

---

## 2. Technical Stack

| Component | Technology |
|-----------|-------------|
| Frontend | React 19 + Vite |
| Styling | Tailwind CSS v4 |
| Backend/Database | Supabase (PostgreSQL + Auth) |
| Routing | React Router v7 |
| Icons | Lucide React |
| Notifications | React Hot Toast |
| Date Handling | date-fns |

---

## 3. User Roles & Permissions

### Admin Role
- View dashboard with system-wide statistics
- Manage customers (view, delete)
- Issue credits to customers
- Delete customer credits
- Access customer details

### Customer Role
- View personal dashboard
- Mark daily attendance via calendar
- Delete own attendance records
- View credit balance and history

---

## 4. Database Schema

### 4.1 Profiles Table
```sql
- id: UUID (primary key, from auth.users)
- customer_id: TEXT (e.g., "CUST-XXXXXXXX")
- name: TEXT
- phone: TEXT
- role: TEXT ('admin' | 'customer')
- created_at: TIMESTAMP WITH TIME ZONE
```

### 4.2 Attendance Table
```sql
- id: UUID (primary key, auto-generated)
- user_id: UUID (foreign key to profiles)
- date: DATE
- created_at: TIMESTAMP WITH TIME ZONE
```

### 4.3 Credits Table
```sql
- id: UUID (primary key, auto-generated)
- user_id: UUID (foreign key to profiles)
- amount: DECIMAL(10,2)
- valid_until: DATE
- description: TEXT
- created_at: TIMESTAMP WITH TIME ZONE
```

---

## 5. Feature Specifications

### 5.1 Authentication
- **Login**: Email/password authentication via Supabase Auth
- **Register**: New user registration (defaults to 'customer' role)
- **Session Management**: JWT-based session with auto-redirect based on role

### 5.2 Admin Features

#### Dashboard
- Total customers count
- Total attendance records count
- Total credits issued (sum of all amounts)
- Monthly attendance count
- Recent activity display (currently disabled)
- Quick action links

#### Customer Management
- List all customers (filter out admin users)
- Search customers by name or customer_id
- View customer details (attendance, credits, valid till)
- Delete customers (cascades to attendance and credits)
- Quick actions: View details, Add credits

#### Credit Management
- Select customer from dropdown
- Enter credit amount
- Add optional description
- Credits valid for 45 days from issue date
- Optional WhatsApp notification (requires env configuration)
- View customer's credit history
- Delete individual credits

### 5.3 Customer Features

#### Dashboard
- Welcome message with user name
- Interactive calendar (mark attendance)
- Stats cards: Total credits, Total attendance, This month, Expiring soon
- Credits expiring within 7 days indicator

#### Attendance
- Calendar view with marked dates
- Mark attendance for any date
- One attendance per day limit
- View attendance history in table format
- Delete individual attendance records

#### Credits
- View all credits (active and expired)
- Credit status indicators (Active/Expired)
- Total active credits calculation
- Expiration date display

---

## 6. API Endpoints

### Supabase Tables
All CRUD operations via Supabase client with RLS policies:

| Table | Operations |
|-------|------------|
| profiles | SELECT, INSERT, UPDATE |
| attendance | SELECT, INSERT, DELETE |
| credits | SELECT, INSERT, DELETE |

### WhatsApp Integration (Optional)
- Endpoint: `https://graph.facebook.com/v17.0/{PHONE_NUMBER_ID}/messages`
- Environment variables required:
  - `VITE_WHATSAPP_PHONE_NUMBER_ID`
  - `VITE_WHATSAPP_ACCESS_TOKEN`

---

## 7. Routing Structure

| Path | Role | Component |
|------|------|-----------|
| `/login` | Public | Login |
| `/register` | Public | Register |
| `/customer/dashboard` | Customer | CustomerDashboard |
| `/customer/attendance` | Customer | Attendance |
| `/customer/credits` | Customer | Credits |
| `/admin/dashboard` | Admin | AdminDashboard |
| `/admin/customers` | Admin | AdminCustomers |
| `/admin/customer/:id` | Admin | CustomerDetail |
| `/admin/credits` | Admin | AdminCredits |

---

## 8. UI/UX Requirements

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), lg (1024px)
- Dark mode support (via Tailwind dark: classes)

### Components
- Navbar (navigation + logout)
- StatsCard (icon + value + title)
- Card, CardHeader, CardBody (layout)
- Table (data display)
- Calendar (attendance marking)
- Input, Button (forms)
- Modal, ConfirmModal (dialogs)
- LoadingSpinner (loading states)

### Color Scheme
- Primary: Blue (#3B82F6)
- Success: Green (#22C55E)
- Warning: Orange (#F97316)
- Error: Red (#EF4444)
- Background: Gray (#F9FAFB / #111827)

---

## 9. Environment Variables

```env
VITE_SUPABASE_URL=<supabase-project-url>
VITE_SUPABASE_ANON_KEY=<supabase-anon-key>
VITE_WHATSAPP_PHONE_NUMBER_ID=<whatsapp-phone-number-id>
VITE_WHATSAPP_ACCESS_TOKEN=<whatsapp-access-token>
```

---

## 10. Security

### Row Level Security (RLS)
- profiles: Users can read all; insert/update own profile only
- attendance: Users can read all; insert/delete own records only
- credits: Users can read all; insert/delete own records only

### Protected Routes
- All customer and admin routes require authentication
- Role-based route redirection

---

## 11. Current Issues / Known Limitations

1. Recent activity query returns 400 error (disabled in Dashboard)
2. WhatsApp integration requires manual .env configuration
3. No password reset functionality
4. No email verification
5. Customer ID generated from user ID (not sequential)

---

## 12. Future Enhancements

- Password reset functionality
- Email notifications
- Export reports (CSV/PDF)
- Attendance reminders
- Credit usage tracking
- Multiple credit packages with different validity periods
- Customer profile editing
- Bulk credit operations
- Attendance analytics charts