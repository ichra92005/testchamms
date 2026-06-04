# DeliverIt – Interface Screenshot Guide for Project Report

To visually support the **Chapter 3: Implementation** section of your academic report, you should include screenshots representing the core user flows, system configurations, and visual features of the platform. Below is the recommended checklist of figures to capture, grouped by category, with instructions on what to display and why they are important.

---

## 1. Public Facing Interfaces (Tracking & Information Portal)

### Figure 3.1: Public Landing Page & Parcel Search
* **Interface View:** The main landing page (`/` or `HomePage.jsx`).
* **Visual Elements to Capture:**
  * The clean hero section with the branding name "DeliverIt".
  * The tracking search card containing the tracking code text input field.
  * The statistics banner displaying metrics (e.g., "Total Deliveries", "Active Routes", "Delivered Parcels").
* **Purpose:** Demonstrates the entry point of the application where public visitors can track parcels without authentication.

### Figure 3.2: Interactive Parcel Tracking Result (Leaflet Map)
* **Interface View:** The parcel results view (`TrackingResultPage.jsx`) for an active parcel (e.g., status `out_for_delivery`).
* **Visual Elements to Capture:**
  * The **Visual Stepper** showing the package progress through current stages (e.g., `Order Received` → `Registered` → `In Transit` → `On the Way`).
  * The **Leaflet.js interactive map** showing the dotted polyline route from origin to destination.
  * The **Pulsing Orange Driver Marker** positioned on the map showing the driver's current coordinates.
  * The "Live Tracking" blinking indicator badge.
* **Purpose:** Illustrates the implementation of Leaflet.js maps, polyline paths, and real-time client polling for GPS delivery locations.

### Figure 3.3: Digital Payment Proof Upload Form
* **Interface View:** The bottom of `TrackingResultPage.jsx` when a parcel has payment method set to "Online Transfer" and payment is unverified.
* **Visual Elements to Capture:**
  * The file upload area ("Upload Bank Receipt").
  * A mock upload state showing a chosen image/receipt.
  * The green "Submit Proof" action button.
* **Purpose:** Represents the digital receipt validation and verification workflow designed to reduce physical cash handling constraints.

### Figure 3.4: Delivery Reception Confirmation and Stars Rating Form
* **Interface View:** The confirm reception modal on `TrackingResultPage.jsx` when a parcel is delivered but not yet confirmed.
* **Visual Elements to Capture:**
  * The star selector component with 5 interactive stars (e.g., showing 4 or 5 stars hovered/selected in orange).
  * The comment text area containing feedback text.
  * The green "Confirm Reception" validation button.
* **Purpose:** Shows the client-side mechanism for delivery confirmation and service quality feedback audits.

---

## 2. Authentication & Security Portal

### Figure 3.5: User Authentication and Role Selector Portal
* **Interface View:** The authentication page (`AuthPage.jsx`).
* **Visual Elements to Capture:**
  * The login card layout with the email and password inputs.
  * The tabs or selectors distinguishing client logins from staff portals.
  * The validation error prompts (e.g., if invalid credentials are submitted).
* **Purpose:** Shows the portal entry point implementing role-based separation and Laravel Sanctum security controls.

---

## 3. Client Personal Dashboard

### Figure 3.6: Client Dashboard Overview
* **Interface View:** The client main page (`ClientDashboard.jsx`).
* **Visual Elements to Capture:**
  * The welcome header showing the logged-in client's name.
  * The 4 statistics cards (Total, In Transit, Delivered, Failed) summarizing the user's packages.
  * The parcel listing table categorized by filters (All, On the Way, Delivered, Confirmed, Failed).
* **Purpose:** Displays the workspace where individual clients track their specific shipments and update personal profiles.

---

## 4. Delivery Agent Operations Dashboard

### Figure 3.7: Agent Workstation and Incoming Parcels Overview
* **Interface View:** The agent dashboard (`AgentDashboard.jsx`) on the "Parcels" view.
* **Visual Elements to Capture:**
  * The sidebar displaying options: "Parcels List" and "Register New Parcel".
  * The top notification bell showing unread alert badges.
  * The parcel tracking table containing operational buttons (e.g., "Assign to Driver", "Validate").
* **Purpose:** Shows the primary interface where delivery agents review incoming orders from clients.

### Figure 3.8: Parcel Registration Form
* **Interface View:** The agent dashboard on the "Register New Parcel" view (`CreateParcelForm.jsx`).
* **Visual Elements to Capture:**
  * The input fields for sender details (name, phone, origin wilaya).
  * Receiver details (name, phone, destination wilaya, physical delivery address).
  * Parcel weight (kg), description, and payment method selectors.
* **Purpose:** Displays the data entry form verifying and writing parcel models into the database.

### Figure 3.9: Driver Assignment Modal Dialog
* **Interface View:** The "Assign Parcel" modal popup on the agent dashboard.
* **Visual Elements to Capture:**
  * The select dropdown showing available drivers matching the route from origin to destination.
  * The details of the selected parcel to be assigned.
  * The blue "Assign to Driver" confirmation button.
* **Purpose:** Shows the manual dispatch coordination matching parcel routes with available drivers.

### Figure 3.10: Printable Tracking Slip (Waybill)
* **Interface View:** The tracking slip preview modal (`TrackingSlip.jsx` or `DeliverySlip.jsx`).
* **Visual Elements to Capture:**
  * The printable format page featuring the parcel tracking code as a barcode representation (or large clean font).
  * Sender and receiver address details.
  * The print icon button to trigger browser printing.
* **Purpose:** Illustrates the generation of physical routing slips for package packaging and driver handovers.

---

## 5. Driver Workstation Dashboard

### Figure 3.11: Driver Active Delivery Route List
* **Interface View:** The driver dashboard (`DriverDashboard.jsx`).
* **Visual Elements to Capture:**
  * The list of parcels currently assigned to the driver.
  * Action buttons to update parcel status (e.g., "Mark In Transit", "Out for Delivery", "Mark Delivered", "Report Issue").
  * The current target route displaying origin and destination cities.
* **Purpose:** Illustrates the mobile-friendly interface for transit tracking and delivery state controls.

---

## 6. Administrator Control Panel

### Figure 3.12: System Analytics and Staff Management Control
* **Interface View:** The administrator panel (`AdminDashboard.jsx`).
* **Visual Elements to Capture:**
  * Global stats summarizing parcel distributions across all drivers.
  * The staff accounts grid showing names, emails, roles, and assigned zones.
  * Action buttons to add staff, change route assignments, or delete accounts.
* **Purpose:** Represents the highest authorization interface governing security roles and operational reports.

---

## Practical Tips for High-Quality Report Screenshots

1. **Use Modern Browser Layouts:** Take screenshots in standard Chrome or Firefox window sizes. You can press `F12` and use the responsive design toolbar to simulate clean standard laptop sizes (e.g., 1440x900 or 1280x800).
2. **Populate Mock Data:** Make sure to have a few mock parcel items in the tables containing realistic names, cities (e.g., "Alger", "Oran", "Constantine"), and statuses rather than blank screens or "lorem ipsum" test texts.
3. **Capture Specific States:** For interactive elements like dropdowns, modals, and notifications, click to open them before capturing the screenshot so that the visual popups are captured in context.
4. **Zoom level:** Set your browser zoom to 100% or slightly zoom in (110%) if text is too small, to make sure titles and tables remain readable in a printed PDF report.
