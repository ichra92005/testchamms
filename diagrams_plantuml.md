# DeliverIt – PlantUML Diagram Code

This document provides the complete PlantUML code for the **Package Diagram** and **Class Diagram** representing the **DeliverIt** architecture. You can render these diagrams using online PlantUML viewers (like [planttext.com](https://www.planttext.com) or [plantuml.com/plantuml](http://www.plantuml.com/plantuml)) or by using the PlantUML VS Code extension.

---

## 1. Package Diagram

The package diagram shows the high-level decoupled architecture of the platform. It separates the frontend user interface, backend server routing/business logic, and cloud database storage.

```plantuml
@startuml DeliverIt_Package_Diagram
skinparam packageStyle rectangle
skinparam roundCorner 10
skinparam monochrome false
skinparam Handwritten false

skinparam package {
    BackgroundColor<<Frontend>> #E6F2FF
    BorderColor<<Frontend>> #1A2E6E
    BackgroundColor<<Backend>> #FFF0E6
    BorderColor<<Backend>> #F97316
    BackgroundColor<<Database>> #E6FFE6
    BorderColor<<Database>> #22C55E
}

package "Frontend Application (React + Vite)" as Frontend <<Frontend>> {
    package "Components" as FE_Components {
        [Navbar]
        [Footer]
        [Stepper]
        [RouteMap]
        [TrackingSlip]
        [Toast]
    }
    
    package "Pages" as FE_Pages {
        package "Admin Portal" as FE_Admin {
            [AdminDashboard]
        }
        package "Agent Portal" as FE_Agent {
            [AgentDashboard]
        }
        package "Client Portal" as FE_Client {
            [ClientDashboard]
        }
        package "Driver Portal" as FE_Driver {
            [DriverDashboard]
        }
        [HomePage]
        [TrackingResultPage]
        [AuthPage]
        [ResetPasswordPage]
    }
    
    package "Services" as FE_Services {
        [api (Axios Client)]
    }
}

package "Backend Server (Laravel API)" as Backend <<Backend>> {
    package "Routes" as BE_Routes {
        [api.php]
    }
    
    package "Controllers" as BE_Controllers {
        [AuthController]
        [ParcelController]
        [UserController]
        [AdminController]
        [LocationController]
        [PaymentProofController]
        [NotificationController]
    }
    
    package "Models" as BE_Models {
        [User]
        [Parcel]
        [ParcelStatusHistory]
        [Notification]
    }
}

package "Database (Supabase)" as Database <<Database>> {
    database "PostgreSQL Relational DB" as DB_Stores {
        [users table]
        [parcels table]
        [parcel_status_history table]
        [notifications table]
    }
}

' Relationships
FE_Pages ..> FE_Components : uses
FE_Pages ..> FE_Services : calls APIs via
FE_Services ..> BE_Routes : HTTP REST Requests (JSON)
BE_Routes ..> BE_Controllers : routes to
BE_Controllers ..> BE_Models : interacts with Eloquent ORM
BE_Models ..> DB_Stores : syncs schema and queries (SQL)

@enduml
```

---

## 2. Class Diagram

The class diagram maps the backend logic structure. It depicts the standard Laravel base controller extension hierarchy, user models, parcel models, notification models, and their respective relationships (multiplicities).

```plantuml
@startuml DeliverIt_Class_Diagram
skinparam classAttributeIconSize 0
skinparam roundCorner 10
skinparam monochrome false

package "Backend Models (Eloquent ORM)" {
    class User {
        + int id
        + string name
        + string email
        + string phone
        + string password
        + string role
        + string driver_type
        + string wilaya
        + string route_from
        + string route_to
        + datetime email_verified_at
        + parcels() : HasMany
        + notifications() : HasMany
    }

    class Parcel {
        + int id
        + string tracking_code
        + string sender_name
        + string sender_phone
        + string origin_wilaya
        + string receiver_name
        + string receiver_phone
        + string destination_wilaya
        + string delivery_address
        + string description
        + float weight
        + string status
        + string payment_method
        + string delivery_type
        + string pickup_location
        + string destination
        + string failure_reason
        + string refusal_reason
        + int rating
        + string rating_comment
        + datetime confirmed_at
        + int created_by
        + int delivery_man_id
        + string payment_proof
        + float driver_lat
        + float driver_lng
        + datetime location_updated_at
        + deliveryMan() : BelongsTo
        + createdBy() : BelongsTo
        + statusHistory() : HasMany
    }

    class ParcelStatusHistory {
        + int id
        + int parcel_id
        + string status
        + datetime created_at
        + parcel() : BelongsTo
    }

    class Notification {
        + int id
        + int user_id
        + string message
        + datetime read_at
        + datetime created_at
        + user() : BelongsTo
    }
}

package "Backend Controllers" {
    class Controller {
        ' Base Laravel Controller
    }

    class AuthController {
        + login(Request) : Response
        + register(Request) : Response
        + logout(Request) : Response
        + me(Request) : Response
        + updateProfile(Request) : Response
        + forgotPassword(Request) : Response
        + resetPassword(Request) : Response
    }

    class ParcelController {
        + index(Request) : Response
        + store(Request) : Response
        + updateStatus(Request, id) : Response
        + assign(Request, id) : Response
        + driverParcels(Request) : Response
        + track(code) : Response
        + stats() : Response
        + searchByPhone(Request) : Response
        + confirmReception(Request, id) : Response
    }

    class UserController {
        + drivers() : Response
    }

    class AdminController {
        + users() : Response
        + show(id) : Response
        + update(Request, id) : Response
        + deleteUser(id) : Response
    }

    class LocationController {
        + get(code) : Response
        + update(Request, id) : Response
    }

    class PaymentProofController {
        + upload(Request, code) : Response
        + show(Request, id) : Response
    }

    class NotificationController {
        + index(Request) : Response
        + markRead(Request, id) : Response
    }
}

' Controller inheritance
AuthController --|> Controller
ParcelController --|> Controller
UserController --|> Controller
AdminController --|> Controller
LocationController --|> Controller
PaymentProofController --|> Controller
NotificationController --|> Controller

' Model Associations
User "1" *-- "0..*" Parcel : creates (created_by)
User "1" *-- "0..*" Parcel : delivers (delivery_man_id)
User "1" *-- "0..*" Notification : receives
Parcel "1" *-- "0..*" ParcelStatusHistory : has historical logs

' Controller interaction (dependency)
AuthController ..> User : authenticates
ParcelController ..> Parcel : manages
AdminController ..> User : manages users
NotificationController ..> Notification : manages read states
LocationController ..> Parcel : updates GPS
PaymentProofController ..> Parcel : attaches files

@enduml
```
