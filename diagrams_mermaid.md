# DeliverIt – Mermaid Diagram Code

This document provides the complete Mermaid code for the **Package Diagram** and **Class Diagram** representing the **DeliverIt** architecture. You can render these diagrams natively on GitHub, in Obsidian, or using online editors such as [mermaid.live](https://mermaid.live).

---

## 1. Package Diagram (Architecture Flowchart)

The package diagram shows the high-level decoupled architecture of the platform. It separates the frontend user interface, backend server routing/business logic, and cloud database storage.

```mermaid
flowchart TB
    subgraph Frontend ["Frontend App (React + Vite)"]
        subgraph Components ["Components"]
            Navbar["Navbar"]
            Footer["Footer"]
            Stepper["Stepper"]
            RouteMap["RouteMap"]
            TrackingSlip["TrackingSlip"]
        end
        
        subgraph Pages ["Pages"]
            HomePage["HomePage"]
            TrackingResultPage["TrackingResultPage"]
            AuthPage["AuthPage"]
            
            subgraph Dashboards ["Dashboards"]
                AdminDashboard["AdminDashboard"]
                AgentDashboard["AgentDashboard"]
                ClientDashboard["ClientDashboard"]
                DriverDashboard["DriverDashboard"]
            end
        end
        
        subgraph Services ["Services"]
            APIClient["api.js (Axios)"]
        end
    end

    subgraph Backend ["Backend API (Laravel)"]
        Routes["api.php (Routes)"]
        
        subgraph Controllers ["Controllers"]
            AuthController["AuthController"]
            ParcelController["ParcelController"]
            UserController["UserController"]
            AdminController["AdminController"]
            LocationController["LocationController"]
            PaymentProofController["PaymentProofController"]
            NotificationController["NotificationController"]
        end
        
        subgraph Models ["Models (Eloquent ORM)"]
            UserModel["User"]
            ParcelModel["Parcel"]
            HistoryModel["ParcelStatusHistory"]
            NotificationModel["Notification"]
        end
    end

    subgraph Database ["Cloud Database (Supabase)"]
        DB["PostgreSQL DB"]
    end

    %% Relations
    Pages --> Components
    Pages --> APIClient
    APIClient -->|JSON HTTP Requests| Routes
    Routes --> Controllers
    Controllers --> Models
    Models -->|SQL Queries| DB

    %% Styling
    classDef frontend fill:#e6f2ff,stroke:#1a2e6e,stroke-width:2px;
    classDef backend fill:#fff0e6,stroke:#f97316,stroke-width:2px;
    classDef database fill:#e6ffe6,stroke:#22c55e,stroke-width:2px;

    class Frontend,Components,Pages,Dashboards,Services frontend;
    class Backend,Routes,Controllers,Models backend;
    class Database,DB database;
```

---

## 2. Class Diagram

The class diagram maps the backend logic structure. It depicts the standard Laravel base controller extension hierarchy, user models, parcel models, notification models, and their respective relationships.

```mermaid
classDiagram
    class User {
        +int id
        +string name
        +string email
        +string phone
        +string password
        +string role
        +string driver_type
        +string wilaya
        +string route_from
        +string route_to
        +datetime email_verified_at
        +parcels() HasMany
        +notifications() HasMany
    }
    
    class Parcel {
        +int id
        +string tracking_code
        +string sender_name
        +string sender_phone
        +string origin_wilaya
        +string receiver_name
        +string receiver_phone
        +string destination_wilaya
        +string delivery_address
        +string description
        +float weight
        +string status
        +string payment_method
        +string delivery_type
        +string pickup_location
        +string destination
        +string failure_reason
        +string refusal_reason
        +int rating
        +string rating_comment
        +datetime confirmed_at
        +int created_by
        +int delivery_man_id
        +string payment_proof
        +float driver_lat
        +float driver_lng
        +datetime location_updated_at
        +deliveryMan() BelongsTo
        +createdBy() BelongsTo
        +statusHistory() HasMany
    }

    class ParcelStatusHistory {
        +int id
        +int parcel_id
        +string status
        +datetime created_at
        +parcel() BelongsTo
    }

    class Notification {
        +int id
        +int user_id
        +string message
        +datetime read_at
        +datetime created_at
        +user() BelongsTo
    }

    class Controller {
        <<Laravel Base>>
    }

    class AuthController {
        +login(Request) Response
        +register(Request) Response
        +logout(Request) Response
        +me(Request) Response
        +updateProfile(Request) Response
        +forgotPassword(Request) Response
        +resetPassword(Request) Response
    }

    class ParcelController {
        +index(Request) Response
        +store(Request) Response
        +updateStatus(Request, id) Response
        +assign(Request, id) Response
        +driverParcels(Request) Response
        +track(code) Response
        +stats() Response
        +searchByPhone(Request) Response
        +confirmReception(Request, id) Response
    }

    class UserController {
        +drivers() Response
    }

    class AdminController {
        +users() Response
        +show(id) : Response
        +update(Request, id) Response
        +deleteUser(id) Response
    }

    class LocationController {
        +get(code) Response
        +update(Request, id) Response
    }

    class PaymentProofController {
        +upload(Request, code) Response
        +show(Request, id) Response
    }

    class NotificationController {
        +index(Request) Response
        +markRead(Request, id) Response
    }

    %% Controller Inheritance
    AuthController --|> Controller
    ParcelController --|> Controller
    UserController --|> Controller
    AdminController --|> Controller
    LocationController --|> Controller
    PaymentProofController --|> Controller
    NotificationController --|> Controller

    %% Model Relationships
    User "1" --> "0..*" Parcel : creates (created_by)
    User "1" --> "0..*" Parcel : delivers (delivery_man_id)
    User "1" --> "0..*" Notification : receives
    Parcel "1" --> "0..*" ParcelStatusHistory : logs history

    %% Dependency associations
    AuthController ..> User : authenticates
    ParcelController ..> Parcel : manages
    AdminController ..> User : manages users
    NotificationController ..> Notification : manages read states
    LocationController ..> Parcel : updates GPS
    PaymentProofController ..> Parcel : attaches files
```
