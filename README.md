# FinalProjectRestaurant

Restaurant management platform with a **.NET 9 Web API** backend and a **Next.js 15** frontend.  
The system supports full multi-role workflows for customers, restaurant owners, employees, delivery staff, and admins.

## Tech Stack

- **Backend:** ASP.NET Core Web API, Entity Framework Core, SQL Server, ASP.NET Identity, JWT, SignalR, Swagger/OpenAPI
- **Frontend:** Next.js (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui, SignalR client, Leaflet maps

## Project Structure

```text
FinalProjectRestaurant/
├── Src/
│   ├── Core/
│   │   ├── RestaurantManagment.Domain
│   │   └── RestaurantManagment.Application
│   ├── Infrastructure/
│   │   ├── RestaurantManagment.Persistance
│   │   └── RestaurantManagment.Infrastructure
│   └── Presentation/
│       └── RestaurantManagment.WebAPI
└── FrontEnd/
    └── Restoran
```

## Main Features

## Authentication & Account

- Register / login with JWT
- Google authentication flow
- Email verification and resend verification
- Forgot/reset/change password
- Profile view/update and profile image upload
- Logout
- Account deletion request and confirmation
- Restaurant ownership application from account flow

## Customer Features

- Restaurant discovery:
  - List, detail, search
  - Category filtering
  - Nearby restaurants
  - Top-rated restaurants
- Menu browsing:
  - Restaurant menus and menu items
  - Available items and menu-item search
- Cart & checkout:
  - Add/remove/update quantities
  - Single-restaurant cart protection
  - Coupon/reward discount application
- Orders:
  - Create/update/cancel orders
  - Active orders, history, current order, order count
  - Order detail and status tracking
- Reservations:
  - Create/update/cancel reservations
  - Upcoming and past reservations
  - Available table checks
- Reviews:
  - Create, update, delete own reviews
  - Check if user can review
  - View own review per restaurant
- Favorites:
  - Add/remove/check favorites
  - Favorites listing
- Loyalty:
  - View points and rewards per restaurant
  - Redeem loyalty rewards
- Personal insights:
  - Statistics, recommendations
  - Total spent, total orders, total reservations

## Restaurant Owner Features

- Restaurant management:
  - Create, update, delete own restaurants
  - Restaurant list/detail
- Owner dashboards & analytics:
  - Dashboard metrics
  - Statistics
  - Revenue (total/today), revenue chart
  - Sales report, orders by date range, category sales
  - Top-selling items
- Employee management:
  - List/detail/create/update/delete employees
  - Employee count
- Job pipeline:
  - Job posting management
  - Job application list/detail/pending/accept/reject
- Order operations:
  - List/detail orders
  - Filter by status
  - Update order status
  - Active/today counts
- Reservation operations:
  - List/detail reservations
  - Filter by status
  - Update reservation status
  - Active/today counts
- Menu operations:
  - Menu CRUD
  - Menu-item CRUD
  - Item availability toggle
  - Menu-item count
- Table operations:
  - Table CRUD
  - Table status updates
  - Available table counts
- Review engagement:
  - View reviews/pending reviews
  - Respond to reviews
  - Report reviews
  - Average rating and pending count
- Rewards:
  - Create/update/delete restaurant rewards
  - List/detail rewards
- Restaurant applications:
  - Submit and track restaurant applications

## Employee Features

- Reservation management for assigned restaurants
- Menu and menu-item management
- Table management and status updates
- Order management and status updates
- Daily/active operational counts (orders/reservations/tables/menu data)

## Delivery Features

- View available delivery orders
- Accept delivery orders
- Update delivery order status
- View own delivery orders and order details

## Admin Features

- Dashboard overview
- User management:
  - User listing
  - Activate/deactivate users
  - Role view/add/remove
- Restaurant governance:
  - Restaurant listing/detail/update
  - Activate/deactivate restaurants
  - Category listing/assignment
- Application management:
  - Ownership/restaurant application list/detail
  - Pending filters
  - Approve/reject workflows
- Review moderation:
  - All/pending/reported review views
  - Approve/reject/delete review actions
- Loyalty administration:
  - Create loyalty codes
  - List/detail/deactivate loyalty codes

## Real-Time Chat

- SignalR hub (`/chatHub`) for order-based chat
- Join/leave order rooms
- Send/receive live messages
- Typing indicators
- Mark message as read / mark all read
- Unread message count per order

## Domain Coverage

Core entities include:

- Restaurant, Menu, MenuItem
- Order, Reservation, Table
- Review
- Reward, LoyaltyPoint, LoyaltyRedemption, LoyaltyCode
- JobPosting, JobApplication
- OwnershipApplication, RestaurantApplication
- ChatMessage

## API

- Base URL (default): `http://localhost:5000/api`
- Swagger UI enabled in backend
- Role-based controllers:
  - `Account`, `Auth`
  - `Customer`, `Owner`, `Employee`, `Delivery`, `Admin`
  - `Loyalty`, `Chat`

## Setup & Run

## Prerequisites

- .NET 9 SDK
- Node.js 20+ and npm
- SQL Server

## 1) Backend

```bash
dotnet restore /home/runner/work/FinalProjectRestaurant/FinalProjectRestaurant/RestaurantManagment.sln
dotnet run --project /home/runner/work/FinalProjectRestaurant/FinalProjectRestaurant/Src/Presentation/RestaurantManagment.WebAPI/RestaurantManagment.WebAPI.csproj
```

Optional EF migration apply:

```bash
dotnet ef database update \
  --project /home/runner/work/FinalProjectRestaurant/FinalProjectRestaurant/Src/Infrastructure/RestaurantManagment.Persistance \
  --startup-project /home/runner/work/FinalProjectRestaurant/FinalProjectRestaurant/Src/Presentation/RestaurantManagment.WebAPI
```

## 2) Frontend

```bash
cd /home/runner/work/FinalProjectRestaurant/FinalProjectRestaurant/FrontEnd/Restoran
npm install
npm run dev
```

Other scripts:

```bash
npm run build
npm run start
npm run lint
```

## Configuration Notes

- Frontend API base is controlled by `NEXT_PUBLIC_API_URL`.
- Backend expects valid DB, JWT, email, and Google auth settings in configuration.
- Keep secrets in environment-specific configs or secret stores; do not commit real credentials.

## Frontend Route Areas

- Public: `/`, `/restaurants`, `/restaurants/[id]`, `/jobs`, `/cart`, `/checkout`, `/login`, `/register`, etc.
- Customer: `/customer/*`
- Owner: `/owner/*`
- Employee: `/employee/*`
- Delivery: `/delivery/*`
- Admin: `/admin/*`

## Notes

- API and UI are role-driven and protected by authentication/authorization rules.
- The repository includes detailed customer frontend documentation at:
  - `/home/runner/work/FinalProjectRestaurant/FinalProjectRestaurant/FrontEnd/Restoran/CUSTOMER_FRONTEND_README.md`
