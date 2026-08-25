<div align="center">

# 🍽️ FinalProjectRestaurant

**🚀 A modern, full-stack Restaurant Management Platform powered by .NET 9 Web API and Next.js 15.**

*✨ Supports comprehensive multi-role workflows for Customers 🧑‍🤝‍🧑, Restaurant Owners 👨‍🍳, Employees 👩‍💼, Delivery Personnel 🛵, and System Administrators 🛡️.*

---

[![Backend Stack](https://img.shields.io/badge/Backend-.NET%209%20%7C%20EF%20Core-512BD4?style=flat-square&logo=dotnet)](https://dotnet.microsoft.com/)
[![Frontend Stack](https://img.shields.io/badge/Frontend-Next.js%2015%20%7C%20React%2019-000000?style=flat-square&logo=nextdotjs)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Database](https://img.shields.io/badge/Database-SQL%20Server-CC292B?style=flat-square&logo=microsoftsqlserver)](https://www.microsoft.com/sql-server)
[![Styling](https://img.shields.io/badge/Styling-Tailwind%20CSS%20%7C%20shadcn%2Fui-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)

</div>

---

## 🛠️ Tech Stack

### ⚙️ Backend (.NET Web API)
* 🚀 **Framework:** .NET 9 Web API
* 🗄️ **ORM & Database:** Entity Framework Core & Microsoft SQL Server
* 🔑 **Authentication & Authorization:** ASP.NET Core Identity, JWT, Google OAuth
* ⚡ **Real-time Engine:** SignalR (WebSockets)
* 📖 **Documentation:** Swagger / OpenAPI

### 💻 Frontend (Next.js Application)
* ⚛️ **Framework:** Next.js 15 (App Router) & React 19
* 📘 **Language:** TypeScript
* 🎨 **Styling & UI Components:** Tailwind CSS, shadcn/ui
* 🗺️ **Interactive Utilities:** SignalR Client, Leaflet Maps

---

## 📁 Project Architecture
```text
🏛️ The backend follows **Onion Architecture** principles to ensure clear separation of concerns, maintainability, and scalability.


FinalProjectRestaurant/
├── Src/
│   ├── Core/
│   │   ├── RestaurantManagment.Domain         # 🧱 Entities, Enums, Domain Logic
│   │   └── RestaurantManagment.Application    # 🧠 Interfaces, DTOs, Business Logic, CQRS/Services
│   ├── Infrastructure/
│   │   ├── RestaurantManagment.Persistance    # 💾 EF Core, DbContext, Migrations, Repositories
│   │   └── RestaurantManagment.Infrastructure # 🌐 External Services (Email, File Storage, OAuth)
│   └── Presentation/
│       └── RestaurantManagment.WebAPI         # 🔌 Controllers, Middlewares, SignalR Hubs
└── FrontEnd/
    └── Restoran                               # 🖥️ Next.js 15 Frontend Application
```
---

## 🔥 Key Features by Role

### 🔐 Authentication & Account Management
* 🔑 **JWT & OAuth:** Registration, login, and Google OAuth flow.
* 🛡️ **Security & Tokens:** Email verification, resend confirmation, forgot/reset/change password workflows.
* 👤 **Profile Controls:** User profile management, avatar uploads, and account deletion workflows.
* 📋 **Applications:** Direct restaurant ownership application flow.

---

### 🛒 Customer Experience
* 🔍 **Restaurant Discovery:** Search, category filters, nearby discovery (maps), and top-rated sorting.
* 🍕 **Menu Browsing:** Interactive menus, available item filtering, and live search.
* 🛍️ **Cart & Checkout:** Single-restaurant cart protection, item quantity updates, coupon and reward applications.
* 📦 **Order Tracking:** Real-time status updates, order history, active tracking, and cancellation capabilities.
* 🪑 **Table Reservations:** Available table checks, reservation booking, updates, and history tracking.
* ⭐ **Reviews & Socials:** Review submission, rating management, and favorites listing.
* 🎁 **Loyalty & Insights:** Point accumulation, reward redemptions, personal spending statistics, and recommendations.

---

### 👨‍🍳 Restaurant Owner Dashboard
* 🏪 **Restaurant Operations:** Manage restaurant details, menus, menu items, availability toggles, and tables.
* 📊 **Analytics & Reports:** Real-time revenue metrics, daily sales reports, top-selling items, and category analytics.
* 👥 **Staff Management:** Employee CRUD, role assignments, and active staff counts.
* 💼 **Hiring Pipeline:** Job posting management and job application processing (pending/accept/reject).
* 🛎️ **Order & Reservation Dispatch:** Live status updates for incoming orders and table reservations.
* 💬 **Engagement & Loyalty:** Customer review responses, reporting, rating averages, and custom reward programs.

---

### 👩‍💼 Staff & Operations

#### 🧑‍🍳 Employees
* 📅 Manage assigned restaurant reservations, tables, menus, and incoming orders.
* 📈 Access daily operational counts and status dashboards.

#### 🛵 Delivery Personnel
* 📍 View available delivery requests, accept orders, update delivery status, and view routes.

---

### 🛡️ System Administration
* 📈 **Platform Analytics:** Global system overview and performance dashboards.
* 👥 **User Management:** Access listing, activation/deactivation, and role management.
* 🏛️ **Governance:** Restaurant approvals, category assignments, and ownership application workflows.
* 🚨 **Moderation:** Review moderation (flagged, reported, pending) and policy enforcement.
* 🎟️ **Loyalty Controls:** System-wide loyalty code generation and management.

---

## 💬 Real-Time Chat System

⚡ Built with **SignalR** (`/chatHub`) to support live order communications:

* 💬 **Dedicated Chat Rooms:** Order-based real-time communication.
* ✍️ **Live Interactions:** Instant messaging and typing indicators.
* 👀 **Read Receipts:** Track message status and unread counters.

---

## 🚦 API Reference

* 🌐 **Base API URL:** `http://localhost:5000/api`
* 📖 **Swagger Documentation:** `http://localhost:5000/swagger` (Available in development mode)

### 📑 Role-Based Controllers

| Controller Area | Access Scope | Key Capabilities |
| :--- | :--- | :--- |
| 🔐 **Account / Auth** | Public / Auth | Authentication, Profiles, Identity, OAuth |
| 🛒 **Customer** | Customer | Discovery, Orders, Cart, Reservations, Loyalty |
| 👨‍🍳 **Owner** | Owner | Restaurant Ops, Staff, Analytics, Menu CRUD |
| 👩‍💼 **Employee** | Staff | Orders, Table Statuses, Daily Tasks |
| 🛵 **Delivery** | Delivery | Order Pickup, Delivery Tracking, Status Updates |
| 🛡️ **Admin** | Admin | User Auditing, Approvals, Platform Settings |
| 💬 **Chat** | Authenticated | Live Messaging, Order Rooms |

---

## ⚡ Quick Start Guide

### 📋 Prerequisites
* 🔹 [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
* 🔹 [Node.js 20+](https://nodejs.org/) & `npm`
* 🔹 [Microsoft SQL Server](https://www.microsoft.com/sql-server)

---

### 1️⃣ Backend Setup

1. 📦 **Restore dependencies:**
   ```bash
   dotnet restore Src/Presentation/RestaurantManagment.WebAPI/RestaurantManagment.WebAPI.csproj


🗄️ Apply Database Migrations (Optional):
Bash
dotnet ef database update \
  --project Src/Infrastructure/RestaurantManagment.Persistance \
  --startup-project Src/Presentation/RestaurantManagment.WebAPI

  
🚀 Run the API Server:
Bash
dotnet run --project Src/Presentation/RestaurantManagment.WebAPI/RestaurantManagment.WebAPI.csproj


Frontend Setup
📂 Navigate to the frontend directory:
Bash
cd FrontEnd/Restoran

📥 Install dependencies:
Bash
npm install

⚙️ Configure Environment:
Create a .env.local file in the frontend directory:
Code snippet
NEXT_PUBLIC_API_URL=http://localhost:5000/api

🔥 Launch Development Server:
Bash
npm run dev
```text
Frontend Route Structure
Plaintext
FrontEnd/Restoran/src/app/
├── (public)/             # 🌐 /, /restaurants, /restaurants/[id], /jobs, /cart, /checkout
├── (auth)/               # 🔐 /login, /register, /forgot-password
├── customer/             # 🛒 /customer/orders, /customer/reservations, /customer/profile
├── owner/                # 👨‍🍳 /owner/dashboard, /owner/menu, /owner/analytics, /owner/staff
├── employee/             # 👩‍💼 /employee/orders, /employee/tables
├── delivery/             # 🛵 /delivery/active, /delivery/history
└── admin/                # 🛡️ /admin/users, /admin/applications, /admin/moderation
```
