# 🛡️ Role-Based Access Provisioning Dashboard (RBAP)

> **Enterprise Identity Governance System** — Full-stack application for secure user onboarding, role-based access control (RBAC), real-time status management, and administrative analytics.

[![Angular](https://img.shields.io/badge/Angular-v18+-DD0031?logo=angular&logoColor=white)](https://angular.io)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.1-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Java](https://img.shields.io/badge/Java-17-ED8B00?logo=openjdk&logoColor=white)](https://openjdk.org)
[![Maven](https://img.shields.io/badge/Maven-3.9-C71A36?logo=apachemaven&logoColor=white)](https://maven.apache.org)

---

## 📐 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                            │
│  Angular 18+ (Standalone Components) · TypeScript · RxJS   │
│  ┌──────────┐  ┌───────────┐  ┌──────────┐  ┌──────────┐  │
│  │Analytics │  │  User     │  │ Filter   │  │  Modal   │  │
│  │  Cards   │  │  Roster   │  │  Engine  │  │  Forms   │  │
│  └──────────┘  └───────────┘  └──────────┘  └──────────┘  │
│              ChangeDetectorRef · Two-way Binding            │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/JSON (CORS secured)
                    port 4200 → 8080
┌──────────────────────────▼──────────────────────────────────┐
│                    SERVICE LAYER                             │
│         Spring Boot 4.1 · Spring MVC · Jackson              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  UserController  /api/users                          │   │
│  │  GET ·  POST · PUT /{id} · DELETE /{id}              │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │ Spring Data JPA / Hibernate ORM
┌──────────────────────────▼──────────────────────────────────┐
│                  PERSISTENCE LAYER                           │
│         PostgreSQL 15 · Auto-DDL Schema Generation          │
│  Table: users (id, email UNIQUE, department, accessRole,    │
│                isActive) — NOT NULL constraints enforced     │
└─────────────────────────────────────────────────────────────┘
```

---

## ✨ Features

### 🔐 User Management & CRUD
| Operation | Endpoint | Description |
|-----------|----------|-------------|
| `GET /api/users` | Read | Fetch all users |
| `POST /api/users` | Create | Add new user with role assignment |
| `PUT /api/users/{id}` | Update | Modify role, department, or active status |
| `DELETE /api/users/{id}` | Delete | Delete user record completely |

### 📊 Administrative Analytics
- **Real-time metric cards** — Total users, active accounts, inactive accounts, unique departments
- **Department distribution** — Live bar chart computed from database state
- **Role breakdown** — Visual distribution across Admin / Developer / Analyst / Viewer
- **Active workforce gauge** — Animated SVG arc displaying active percentage

### 🔍 Advanced Filtering Engine
- **Full-text search** across email, department, and role fields
- **Multi-dimensional filters** — Combinable role, status, and department filters
- **Zero-API-call client-side pipeline** — All filtering occurs reactively in memory

### 🎨 UI/UX Highlights
- Dark glassmorphism design system with animated gradient cards
- Color-coded role badges (Admin → red, Developer → blue, Analyst → purple, Viewer → gray)
- Clickable status toggles for instant Active/Inactive toggling
- Accessible modal forms with animated entrance transitions
- Toast notification system with success/error/info states
- Personalised user avatars generated from email initials + gradient seeding
- Fully responsive layout (sidebar collapses on mobile)

---

## 🛠️ Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend Framework** | Angular (Standalone Components) | 18+ |
| **Language (FE)** | TypeScript | 5.x |
| **HTTP Client** | Angular HttpClient + RxJS Observables | — |
| **Styling** | Vanilla CSS (Design tokens, glassmorphism) | — |
| **Icons / Typography** | Material Icons Round · Inter (Google Fonts) | — |
| **Backend Framework** | Spring Boot (spring-boot-starter-webmvc) | 4.1.1 |
| **Language (BE)** | Java | 17 |
| **ORM** | Spring Data JPA / Hibernate | — |
| **JSON Serialization** | Jackson (via Spring Boot autoconfigure) | — |
| **Database** | PostgreSQL | 15+ |
| **Build Tool** | Apache Maven | 3.9+ |
| **Boilerplate Reduction** | Project Lombok (@Data, @NoArgsConstructor) | — |

---

## 🚀 Local Setup

### Prerequisites
- **Node.js** 18+ and **npm** 9+
- **Java 17** (OpenJDK or Oracle)
- **Maven 3.9+**
- **PostgreSQL 15+** running locally

### 1. Database Setup
```sql
-- Connect as superuser and create the database
CREATE DATABASE access_dashboard;
CREATE USER rbap_user WITH PASSWORD 'yourpassword';
GRANT ALL PRIVILEGES ON DATABASE access_dashboard TO rbap_user;
```

### 2. Backend Configuration
Edit `access-dashboard/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/access_dashboard
spring.datasource.username=rbap_user
spring.datasource.password=yourpassword
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
```

### 3. Start Backend
```bash
cd access-dashboard
./mvnw spring-boot:run
# Backend running at http://localhost:8080
```

### 4. Start Frontend
```bash
cd access-dashboard-ui
npm install
npm run start
# Frontend running at http://localhost:4200
```

---

## 🔌 REST API Reference

### Get All Users
```http
GET /api/users
Content-Type: application/json
```
```json
[
  {
    "id": 1,
    "email": "jane.doe@company.com",
    "department": "Engineering",
    "accessRole": "Developer",
    "isActive": true
  }
]
```

### Add New User
```http
POST /api/users
Content-Type: application/json

{
  "email": "john.smith@company.com",
  "department": "Finance",
  "accessRole": "Analyst",
  "isActive": true
}
```

### Update User Access
```http
PUT /api/users/{id}
Content-Type: application/json

{
  "email": "john.smith@company.com",
  "department": "Finance",
  "accessRole": "Admin",
  "isActive": true
}
```

### Delete User
```http
DELETE /api/users/{id}
→ 200 OK: "User with ID 1 has been completely deleted."
```

---

## 📁 Project Structure

```
access-provisioning-dashboard/
├── access-dashboard/                    # Spring Boot Backend
│   ├── src/main/java/com/campushare/access_dashboard/
│   │   ├── AccessDashboardApplication.java  # Application entry point
│   │   ├── controller/
│   │   │   └── UserController.java          # REST API endpoints (CRUD)
│   │   ├── model/
│   │   │   └── User.java                    # JPA Entity + Lombok annotations
│   │   └── repository/
│   │       └── UserRepository.java          # Spring Data JPA repository
│   ├── src/main/resources/
│   │   └── application.properties           # DB & JPA configuration
│   └── pom.xml                              # Maven dependencies
│
└── access-dashboard-ui/                 # Angular Frontend
    └── src/
        ├── index.html                       # Root HTML (SEO meta, fonts)
        ├── styles.css                       # Global design tokens
        ├── main.ts                          # Angular bootstrapper
        └── app/
            ├── app.ts                       # Root component + all state logic
            ├── app.html                     # Full dashboard template
            ├── app.css                      # Component styles
            ├── user.ts                      # User TypeScript interface
            ├── user.service.ts              # HTTP service (CRUD operations)
            ├── app.config.ts                # App providers (HttpClient, Router)
            └── app.routes.ts                # Router configuration
```

---

## 🔧 Engineering Challenges & Solutions

### 1. Boolean Serialization Alignment
**Problem:** Java's `boolean isActive` generates `isActive()` getter via Lombok. Jackson, by default, serializes this as `active` (stripping the `is` prefix), causing Angular payload mismatch and silent `400 Bad Request` errors.

**Solution:** Explicit Lombok `@JsonProperty("isActive")` awareness combined with aligned TypeScript interface property naming, ensuring the `isActive` field is correctly round-tripped across the client-server boundary.

### 2. Component Reactivity & Lifecycle Management
**Problem:** Angular's `OnPush`-compatible lifecycle doesn't automatically re-render when RxJS subscription side-effects update shared component state from async HTTP operations.

**Solution:** Injected `ChangeDetectorRef` and called `detectChanges()` after each asynchronous mutation (load, delete, toggle), ensuring immediate, thread-safe UI synchronization without full-page refresh cycles.

### 3. CORS Cross-Origin Security
**Problem:** Angular (port 4200) and Spring Boot (port 8080) run on different origins, triggering browser CORS preflight rejections on all non-GET requests.

**Solution:** Applied `@CrossOrigin("http://localhost:4200")` at the controller level, enabling method-specific cross-origin access during development while maintaining origin allowlist control.

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

<p align="center">Built with ❤️ for Google Internship Application | Identity & Security Infrastructure</p>
