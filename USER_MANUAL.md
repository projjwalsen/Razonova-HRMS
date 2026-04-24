# HRAutomata HRMS — User Manual

---

## Table of Contents

1. [Getting Started](#1-getting-started)
   - [1.1 Landing Page](#11-landing-page)
   - [1.2 Signing Up](#12-signing-up)
   - [1.3 Logging In](#13-logging-in)
2. [Organization Setup](#2-organization-setup)
   - [2.1 Organization Details](#21-organization-details)
   - [2.2 Departments](#22-departments)
   - [2.3 Designations](#23-designations)
   - [2.4 Roles & Permissions](#24-roles--permissions)
   - [2.5 Permissions List](#25-permissions-list)
   - [2.6 Settings](#26-settings)
3. [Company Admin Portal](#3-company-admin-portal)
   - [3.1 Dashboard](#31-dashboard)
   - [3.2 Employees](#32-employees)
   - [3.3 Attendance Management](#33-attendance-management)
   - [3.4 Leave Management](#34-leave-management)
   - [3.5 Payroll Management](#35-payroll-management)
4. [Employee Self-Service Portal](#4-employee-self-service-portal)
   - [4.1 Employee Dashboard](#41-employee-dashboard)
   - [4.2 My Attendance](#42-my-attendance)
   - [4.3 My Leave](#43-my-leave)
   - [4.4 My Payroll](#44-my-payroll)
5. [Role-Based Access Control](#5-role-based-access-control)
6. [Permission Reference](#6-permission-reference)

---

## 1. Getting Started

### 1.1 Landing Page

**URL:** `/`

The landing page is the public marketing site for HRAutomata. It includes:

- **Navbar**: Feature highlights, product modules, AI capabilities, and company information via dropdown menus
- **Hero Section**: Product overview with "Get Started" and "Book Demo" call-to-action buttons
- **Feature Modules**: Employee Management, Attendance & Time, Leave Management, Payroll Suite, Performance Reviews, Reports & Analytics, Recruitment, Compliance & Security
- **AI Features**: Intelligent automation capabilities
- **Role-Based Access**: Security and access control features
- **Integrations & Security**: Third-party integrations and security posture

Use the **Login** or **Get Started** button in the top-right to access your account.

---

### 1.2 Signing Up

**URL:** `/signup`

New users can create an account by filling in:

| Field | Description |
|---|---|
| Name | Your full name |
| Email | Valid email address (used for login) |
| Password | Account password |
| Confirm Password | Re-enter password to confirm |
| Phone | Contact phone number |
| Company Name | Name of your organization |

> You must accept the Terms & Conditions checkbox before registering.

On successful registration, you are redirected to the login page to sign in with your new credentials.

---

### 1.3 Logging In

**URL:** `/login`

**For Company Admins / HR:** Use `/admin/login` to access the organization setup portal.

**Standard Login** (`/login`) — Enter your email and password. After login:

| Role | Redirects To |
|---|---|
| `COMPANY_ADMIN` | `/organization` — Organization Setup Portal |
| `EMPLOYEE` | `/employee` — Employee Self-Service Portal |

Other users are redirected to `/employee`.

> **Note:** Social login buttons (LinkedIn, Google, Twitter, Facebook) are present on the login page for display purposes.

---

### Accepting an Invitation (New Employees)

If an administrator invites you to join the system, you will receive an email with an invitation link.

**Step 1 — Accept Invite:** Open the link with a `?token=` query parameter. The system verifies your token and redirects to the password setup page.

**Step 2 — Set Password:** Choose your password and confirm it. On success, you are redirected to the login page to sign in with your new credentials.

---

## 2. Organization Setup

**URL:** `/organization`

The Organization Setup Portal is where company administrators configure the foundational structure of the organization — departments, designations, roles, and system settings. It is accessed after logging in as a `COMPANY_ADMIN` user.

The sidebar navigation includes: Organization Details, Organization Settings, Departments, Designations, Roles & Permissions, Permissions List, Structure, and Dashboard.

---

### 2.1 Organization Details

**URL:** `/organization`

View and update your company's basic information. This includes the company name, logo, contact details, and other foundational data.

---

### 2.2 Departments

**URL:** `/organization/departments`

Departments are the primary grouping units for your workforce (e.g., Engineering, Marketing, Sales).

**How to add a department:**

1. Click the **Add Department** button
2. Enter the department name in the modal form
3. Click **Save**

**How to edit a department:**

1. Click the **Edit** icon next to the department
2. Update the name in the modal form
3. Click **Save**

**How to delete a department:**

1. Click the **Delete** icon next to the department
2. Click **Confirm** in the inline confirmation prompt (or **Cancel** to abort)

---

### 2.3 Designations

**URL:** `/organization/designations`

Designations are job titles within each department (e.g., "Software Engineer" within Engineering, "Content Writer" within Marketing).

Designations are grouped by department using an accordion layout — click a department header to expand/collapse its designations.

**How to add a designation:**

1. Expand the relevant department accordion
2. Click **Add Designation**
3. Enter the designation name (the department is pre-selected and locked)
4. Click **Save**

**How to edit a designation:** Click the Edit icon on the designation row and update the name.

**How to delete a designation:** Click the Delete icon and confirm.

---

### 2.4 Roles & Permissions

**URL:** `/organization/roles`

The Roles & Permissions page manages role definitions and assigns permissions and users to roles. It has three tabs:

#### Tab 1 — Roles

Create new roles and assign specific permissions to them.

**How to create a role:**

1. Click **Create Role**
2. Enter the role name in uppercase (e.g., `HR_MANAGER`)
3. Click **Save**

**How to assign permissions to a role:**

1. Select a role from the left panel
2. The right panel shows a permission grid grouped by module
3. Click on any permission chip to toggle it:
   - **Green chip** = permission is assigned to this role
   - **Gray chip** = permission is available but not assigned
4. Changes are saved automatically or via a Save button (check UI)

> Permission chips are organized by module (PAYROLL, ATTENDANCE, LEAVE, PERMISSION, etc.) making it easy to find relevant permissions.

---

#### Tab 2 — Assign / Unassign Role

Assign existing roles to users, or remove role assignments.

**Assign a role to a user:**

1. Use the "Assign Role" form
2. Select the **User** from the dropdown
3. Select the **Role** to assign
4. Click **Assign**

The user immediately gains all permissions associated with that role.

**Unassign a role from a user:**

1. Find the user in the "Assigned Users" table (grouped by role)
2. Click the **✕** (unassign) button next to the user
3. A confirmation popup appears: *"Do you really want to unassign this user from this role?"*
4. Click **Yes** to confirm or **Cancel** to abort

**Required permission:** `PERMISSION:CREATE`

---

#### Tab 3 — Transfer Role

Transfer all roles from one user to another (useful during team restructuring or when an employee takes over another's responsibilities).

1. Select the **From User** (who currently holds the role)
2. Select the **To User** (who will receive the role)
3. Select the **Role** to transfer
4. Click **Transfer**

All role assignments are moved from the source user to the target user.

---

### 2.5 Permissions List

**URL:** `/organization/permissions`

A read-only reference of all available permissions in the system.

**How to use:**

- Switch between **Grid View** and **List View** using the view toggle
- Filter by module using the dropdown or module pill buttons
- Search by permission name using the search bar

Permissions are grouped by module with descriptive action labels:

| Icon | Meaning |
|---|---|
| 👁 Eye | Read permissions |
| 🔒 Lock | Delete/write permissions |
| 🔓 Unlock | Other actions (create, update, configure) |

---

### 2.6 Settings

**URL:** `/organization/settings`

Configure organization-wide defaults for time, date, and location settings.

| Setting | Options | Notes |
|---|---|---|
| Country | Dropdown with flags | Selecting a country updates the timezone list |
| Timezone | Cascaded from country | Defaults to Asia/Kolkata |
| Time Format | 12-hour / 24-hour | Controls time display throughout the app |
| Name Format | Various formats | Controls how names are displayed |
| Date Format | Various formats | Controls date display throughout the app |

Click **Save Settings** to persist your changes.

---

## 3. Company Admin Portal

**URL:** `/company/*`

The Company Admin Portal is where HR and administrative staff manage the day-to-day operations of the organization. Accessed via `/company/dashboard` or other `/company/*` routes.

The sidebar navigation includes: Dashboard, Employees, Departments, Attendance, Leave, Payroll, Recruitment, Performance, Training, Reports, and Settings.

---

### 3.1 Dashboard

**URL:** `/company/dashboard`

An overview of the organization's health with key metrics and quick actions.

**KPI Stats Cards:**

- Total Employees
- Active Positions
- Pending Reviews
- Training Completion rate

**Quick Action Buttons:**

- Manage Employees
- Recruitment
- Payroll
- Reports

**Recent Activity Feed:** Shows the last 4 system activities.

**Upcoming Tasks:** Tasks with priority labels (High / Medium / Low).

**Notifications:** Bell icon with a notification badge for alerts.

---

### 3.2 Employees

**URL:** `/company/employees`

Manage the organization's employee directory. Three tabs:

#### Tab 1 — Employee List

- Searchable and filterable table of all employees
- Columns: Name, Department, Designation, Status, Join Date
- Click **Edit** to open the Update Employee modal
- Click **Add Employee** to onboard a new team member

#### Tab 2 — Add Employee

Onboard a new employee with the following fields:

| Field | Description |
|---|---|
| First Name / Last Name | Employee's full name |
| Email | Official email address |
| Phone | Contact number |
| Department | Dropdown (fetched from org setup) |
| Designation | Dropdown (filtered by selected department) |
| Role | EMPLOYEE / ADMIN / HR / MANAGER |
| Employee Code | Unique identifier |
| Joining Date | Date picker |
| Proposed Salary | Numeric input |

#### Tab 3 — Pending Invitations

Shows all pending invitees who have not yet accepted. Use the **Resend Invite** button to re-send the invitation email.

#### Update Employee Modal

When editing an employee, a multi-tab modal opens:

- **Basic Info**: Name, email, phone
- **Department/Designation/Manager**: Organizational placement
- **Joining/Salary**: Employment terms
- **Address**: Residential address
- **Account Status**: Enable/disable the account

---

### 3.3 Attendance Management

**URL:** `/company/attendance`

**Permission required:** `ATTENDANCE:READ`  
**Config tab permission:** `ATTENDANCE:CONFIGURE`

Track and manage employee attendance across the organization.

#### Overview Stats

Four key metrics aggregated from monthly data:

- **Days Present** — Total days employees were present
- **Days Absent** — Total absent days
- **Late Arrivals** — Count of late check-ins
- **Total Hours** — Total logged hours

#### Check In / Out Panel

A live clock panel at the top of the page where you (or each employee) can record daily attendance:

- **Check In** button (green) — Click to record arrival time
- **Check Out** button (red) — Click to record departure time (replaces Check In after check-in)
- Both timestamps are displayed live

#### Tabs

**Today's Attendance**

See a snapshot of all employees' current-day attendance status.

**Attendance History**

Browse historical attendance records with date range filtering and search.

**Calendar View**

A calendar-style view of attendance across the team.

**Regularization Requests**

Handle attendance correction requests from employees (e.g., missed check-in due to system outage).

**Configuration**

> Requires `ATTENDANCE:CONFIGURE` permission.

Configure attendance rules:

| Setting | Description |
|---|---|
| Check In Time | Standard start time (e.g., 09:00) |
| Check Out Time | Standard end time (e.g., 18:00) |
| Grace Minutes | Buffer allowed before marking as late (e.g., 15 min) |
| Half Day Minutes | Min minutes for a full-day attendance |
| Full Day Minutes | Min minutes counted as a full working day |
| Working Days | Select which days of the week are working (Mon–Sun toggle buttons) |

> At least one working day must be selected before saving.

#### View User Attendance

Click on any employee's row to open the **User Detail Modal**, which shows:

- **Today**: Check-in/out times for the selected user
- **History**: Full attendance history for the user
- **Summary**: Monthly summary (present days, absent days, late days, total hours)

---

### 3.4 Leave Management

**URL:** `/company/leave`

**Permission required:** `LEAVE:READ`

Manage leave types, policies, and incoming leave requests.

> Note: The exact tab structure depends on your organization's setup. Common tabs include Requests, Leave Types, Policies, Team View, Holiday Calendar, and Work Week.

#### Leave Requests Tab

View and act on all leave requests submitted by employees.

| Status | Badge Color | Actions Available |
|---|---|---|
| PENDING | Yellow | Approve / Reject |
| APPROVED | Green | — |
| REJECTED | Red | — |
| CANCELLED | Gray | — |

Click on a request row to expand the **Request Detail Drawer** showing:

- Employee name and department
- Leave type and date range
- Reason provided by the employee
- Number of days
- Any attached documents
- **Approve** and **Reject** action buttons for pending requests

Click **Approve** or **Reject** to take action. The request status updates immediately.

#### Other Tabs (Setup)

**Leave Types** — Define leave categories (e.g., Sick Leave, Casual Leave, Maternity Leave, Loss of Pay). Requires `LEAVE_TYPE:MANAGE`.

**Leave Policies** — Set rules per leave type (accrual rate, carry-over limits, max days, etc.). Requires `LEAVE_POLICY:MANAGE`.

**Holiday Calendar** — Define company holidays. Employees cannot take leave on marked holidays, and holidays themselves do not count as leave.

**Work Week** — Set which days are working days (overrides the default calendar work week).

---

### 3.5 Payroll Management

**URL:** `/company/payroll`

**Permission required:** `PAYROLL:READ`  
Other actions have their own permission gates (see [Permission Reference](#6-permission-reference)).

Manage salary components, pay structures, employee overrides, and the full payroll processing lifecycle.

#### Tab 1 — Dashboard

An overview of payroll health:

- **KPI Cards:** Total Payroll, Processed, Pending, Failed, Average Salary
- **Quick Actions:** Generate Payroll, Process Payroll
- **Recent Payrolls:** A list of the most recent payroll runs

#### Tab 2 — Components

Define the building blocks of a salary.

**How to create a payroll component:**

1. Click **Add Component**
2. Fill in the **Component Master Modal**:

| Field | Description | Example |
|---|---|---|
| Name | Component display name | House Rent Allowance |
| Type | Category of component | EARNING / ALLOWANCE / DEDUCTION / TAX / BONUS |
| Value Type | How the value is calculated | PERCENTAGE_OF_BASIC, COMPANY_FIXED, EMPLOYEE_FIXED, CUSTOM |
| Default Value | Numeric default | 5000 |
| Is Taxable | Whether it contributes to taxable income | Toggle |
| Is Optional | Whether employees can opt out | Toggle |
| Is Active | Whether the component is in use | Toggle |

3. Click **Save**

Click **Edit** on any component row to modify it, or **Delete** to remove it.

#### Tab 3 — Structures

Group salary components into named pay structures that can be assigned to employees or departments.

**How to create a pay structure:**

1. Click **Add Structure**
2. In the **Pay Structure Modal**:

| Field | Description |
|---|---|
| Structure Name | e.g., "Software Engineer L3" |
| Department | (optional) Scope to a specific department |
| Default | Set as the default structure for the department |
| Active | Toggle active status |

3. Add components using the chip selector
4. For each component, enter a value and select the value type
5. Click **Save**

**To edit a structure:** Click the Edit icon on the structure row.

**To delete a structure:** Click the Delete icon → confirm in the popup.

#### Tab 4 — Overrides

Override salary components for specific employees (e.g., special bonuses, one-time deductions).

**How to apply an override:**

1. Search for the employee in the search table
2. Select the employee → their override panel opens
3. Choose which components to override using the chip selector
4. Enter a value for each overridden component
5. Click **Save Overrides**

> Requires `EMPLOYEE_PAYROLL:OVERRIDE` permission.

#### Tab 5 — All Payrolls

A master list of all payroll runs across the organization.

**Filtering:** Filter by Month, Year, Status, or use the search bar.

**Status-based action buttons:**

| Current Status | Next Action | Resulting Status | Permission Required |
|---|---|---|---|
| DRAFT | Process | PROCESSED | `PAYROLL:PROCESS` |
| PROCESSED | Mark Disbursing | DISBURSING | `PAYROLL:MARK_DISBURSE` |
| DISBURSING | Mark Paid | PAID | `PAYROLL:MARK_PAID` |
| PROCESSED | Mark Failed | FAILED | `PAYROLL:MARK_FAILED` |

#### Generate Payroll Modal

1. Select **Month** and **Year**
2. Toggle **Leave Deduction** (deduct from salary for unpaid leave)
3. Toggle **Attendance Deduction** (deduct for attendance irregularities)
4. Click **Generate**

This creates a DRAFT payroll for all active employees for the selected period.

#### Process Payroll Modal

Add extra items to a draft payroll before finalizing:

- **Bonus** — one-time bonus amount
- **Extra Earning** — additional earnings
- **Extra Deduction** — additional deductions

#### Adjust User Payroll

Regenerate payroll for a single employee within an existing payroll run:

- Adjust **Leave Deduction** for that user
- Adjust **Attendance Deduction** for that user
- Click **Regenerate**

#### View Payroll Detail

Click on any payroll row to open the **Payroll Detail Modal** showing:

- Employee name, department, designation
- **Base Salary** and **Gross Salary**
- **Total Earnings** breakdown (itemized)
- **Total Deductions** breakdown (itemized)
- **Net Salary**
- **Attendance Summary** (present days, absent days, paid leaves, unpaid leaves)
- Status-appropriate action buttons at the bottom

---

## 4. Employee Self-Service Portal

**URL:** `/employee/*`

The Employee Portal is the self-service area for employees to manage their own attendance, leave, and payroll. It is accessed at `/employee` after logging in as an `EMPLOYEE` role user.

**Admin Switch:** If an employee has any role other than `EMPLOYEE` (e.g., they are also an HR Manager), a **"Switch to Admin"** button appears in the sidebar. Clicking it navigates to `/company/dashboard`.

---

### 4.1 Employee Dashboard

**URL:** `/employee`

A personalized welcome screen showing:

- A welcome card with the employee's name
- Four quick-access stat cards: Attendance, Leave, Payroll, Documents

> The Documents card currently shows "Coming Soon" — this feature is under development.

---

### 4.2 My Attendance

**URL:** `/employee/attendance`

View and record your own daily attendance.

**Live Status Banner:**

- Shows the current time and date
- Current week number
- Attendance status badge (PRESENT / ABSENT / LATE / HALF_DAY / ON_LEAVE / HOLIDAY / WEEK_OFF / PENDING)

**Check In / Out Section:**

- **Check In** (green) — Click to record your arrival
- **Check Out** (red) — Click to record your departure
- Both timestamps are displayed in real time
- **Hours Worked** card shows total logged hours for the day

**Tabs:**

**Today's Attendance** — Current-day status and check-in/out record.

**Attendance History** — Full historical record with a searchable, paginated table:

| Column | Description |
|---|---|
| Date | The work date |
| Check In | Arrival time |
| Check Out | Departure time |
| Status | Day status |
| Hours | Total hours worked |

Use the search bar and pagination controls to navigate large histories.

---

### 4.3 My Leave

**URL:** `/employee/leave`

Manage your leave balances, submit requests, and view company holidays.

#### Tab 1 — Leave Balances

A grid of cards, one for each leave type available in the organization.

Each card shows:

- Leave type name and icon
- Progress bar: used vs. remaining
- Three numbers: **Allocated**, **Used**, **Remaining**
- Summary totals at the bottom of the grid

#### Tab 2 — My Requests

A table of all leave requests you have submitted.

| Column | Description |
|---|---|
| Type | Leave category |
| From / To | Date range |
| Days | Total days requested |
| Reason | Brief description |
| Status | PENDING / APPROVED / REJECTED / CANCELLED |
| Action | Cancel (for pending requests) |

**How to apply for leave:**

1. Click **Apply for Leave** (if balances are available)
2. Fill in the **Apply Leave Modal**:

| Field | Description |
|---|---|
| Leave Type | Select from available types |
| Start Date | First day of leave |
| End Date | Last day of leave |
| Reason | Brief explanation (textarea) |
| Attachments | Upload supporting documents (max 5 files; pdf/doc/docx/jpg/png) |

3. The modal shows your current balance for the selected leave type
4. Click **Submit**

**How to cancel a request:**

1. Click **Cancel** on any pending request row
2. Enter an optional cancellation reason
3. Click **Confirm**

> Cancelled requests cannot be undone.

#### Tab 3 — Upcoming Holidays

A calendar banner at the top shows the next holiday, followed by a card grid of all company holidays with a countdown ("X days away").

---

### 4.4 My Payroll

**URL:** `/employee/payroll`

View your salary breakdown, payroll records, and download your payslips.

**Controls:** Use the Month / Year dropdowns and the Refresh button to load specific payroll records.

**Summary Cards:**

| Card | Description |
|---|---|
| Net Salary | Your take-home pay |
| Gross Salary | Total before deductions |
| Deductions | Total deductions |
| Status Counts | Number of payslips by status |

#### My Pay Structure

A breakdown of your current salary structure:

- Base Salary
- Gross Salary
- Net Salary
- Component breakdown table with columns: Type, Component Name, Value

#### Payslips Table

A complete history of your payroll records:

| Column | Description |
|---|---|
| Period | Month and year |
| Base | Base salary amount |
| Gross | Gross salary |
| Deductions | Total deductions |
| Net | Net salary |
| Status | DRAFT / PROCESSED / DISBURSING / PAID |
| Action | View / Download |

**View Payslip** — Opens a full breakdown drawer showing:

- Earnings breakdown (all earnings items)
- Deductions breakdown (all deduction items)
- Bonuses breakdown
- Attendance summary: present days, absent days, paid leaves, unpaid leaves

**Download Payslip** — Click the Download button:

1. The system attempts to download a pre-generated PDF from the server
2. If the server PDF is unavailable, it generates a PDF client-side using jsPDF
3. The PDF downloads automatically

---

## 5. Role-Based Access Control

HRAutomata uses a Role-Based Access Control (RBAC) system. Each user is assigned one or more **roles**, and each role has one or more **permissions**.

### Key Concepts

| Concept | Description |
|---|---|
| **Role** | A named collection of permissions (e.g., `HR_MANAGER`, `EMPLOYEE`) |
| **Permission** | A specific action a user can perform (e.g., `PAYROLL:READ`, `LEAVE:APPROVE`) |
| **Permission Format** | `MODULE:ACTION` — e.g., `PAYROLL:GENERATE`, `ATTENDANCE:CONFIGURE` |
| **Self-Permissions** | `*_SELF` suffix restricts access to own data only (e.g., `PAYROLL:READ_SELF`) |

### How Roles Work

1. An administrator creates a role at `/organization/roles`
2. Permissions are assigned to the role by clicking chips in the permission grid
3. The role is assigned to one or more users
4. Users immediately gain the permissions associated with their roles

### Key Roles (Common Setup)

| Role | Typical Permissions |
|---|---|
| `EMPLOYEE` | Self-only: ATTENDANCE:READ_SELF, LEAVE:READ_SELF, PAYROLL:READ_SELF |
| `HR_MANAGER` | Full HR modules: ATTENDANCE:READ, LEAVE:* (full), PAYROLL:READ |
| `PAYROLL_ADMIN` | PAYROLL:READ, PAYROLL:GENERATE, PAYROLL:PROCESS, PAYROLL:MARK_PAID |
| `COMPANY_ADMIN` | All permissions (system super admin role) |

### Admin Switch

Users who have both an `EMPLOYEE` role AND a non-employee role (e.g., HR Manager) see a **"Switch to Admin"** button in their Employee Portal sidebar. This allows them to quickly jump to the Company Admin Portal without logging out and back in.

---

## 6. Permission Reference

The following permissions control access to HRAutomata features:

| Permission | Where Used | Description |
|---|---|---|
| `PAYROLL:READ` | `/company/payroll` | View the payroll management module |
| `PAYROLL:GENERATE` | `/company/payroll` — Generate button | Create a new payroll run |
| `PAYROLL:PROCESS` | `/company/payroll` — Process button | Process a draft payroll into processed status |
| `PAYROLL:MARK_DISBURSE` | `/company/payroll` — Mark Disbursing button | Move payroll from PROCESSED to DISBURSING |
| `PAYROLL:MARK_PAID` | `/company/payroll` — Mark Paid button | Move payroll from DISBURSING to PAID |
| `EMPLOYEE_PAYROLL:OVERRIDE` | `/company/payroll` — Overrides tab | Apply salary component overrides for employees |
| `ATTENDANCE:READ` | `/company/attendance` | View the attendance management module |
| `ATTENDANCE:CONFIGURE` | `/company/attendance` — Config tab | Configure attendance rules and working days |
| `LEAVE:READ` | `/company/leave` | View the leave management module |
| `LEAVE:APPROVE` | `/company/leave` — Requests tab | Approve or reject leave requests |
| `LEAVE_TYPE:MANAGE` | `/company/leave` — Types tab | Create and edit leave types |
| `LEAVE_POLICY:MANAGE` | `/company/leave` — Policies tab | Configure leave policy rules |
| `PERMISSION:CREATE` | `/organization/roles` | Create new roles |

---

*Document version 1.0 — generated for HRAutomata HRMS*
