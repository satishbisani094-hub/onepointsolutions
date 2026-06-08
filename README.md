# One Point Solutions – Multi-Location Electronics Rental Logistics Coordinator

A modern, full-stack SaaS web application for managing electronics rental logistics across multiple locations.

---

## 🗂 Project Structure

```
onepointsolutions1/
│
├── backend/                    # Express.js REST API
│   ├── prisma/
│   │   └── schema.prisma       # Prisma ORM data model (SQLite)
│   ├── routes/
│   │   ├── analytics.js        # Dashboard analytics API
│   │   ├── customers.js        # Customer CRUD API
│   │   ├── devices.js          # Device/Inventory CRUD API
│   │   ├── staff.js            # Staff management API
│   │   └── tasks.js            # Tasks API + Clash Detection
│   ├── .env                    # Environment variables
│   ├── package.json            # Backend dependencies
│   ├── seed.js                 # Database seeder script
│   └── server.js               # Express server entry point
│
├── frontend/                   # React + Vite SPA
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout.jsx      # Main app layout (sidebar + navbar)
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx   # Live analytics dashboard
│   │   │   ├── Tasks.jsx       # Kanban task board + clash alerts
│   │   │   ├── Inventory.jsx   # Device inventory table
│   │   │   ├── Staff.jsx       # Staff card grid
│   │   │   └── Customers.jsx   # Customer directory
│   │   ├── App.jsx             # React Router configuration
│   │   ├── App.css             # Global styles
│   │   ├── index.css           # Tailwind CSS entry
│   │   └── main.jsx            # Vite entry point
│   ├── index.html              # HTML template
│   ├── vite.config.js          # Vite configuration
│   ├── tailwind.config.js      # Tailwind CSS configuration
│   ├── postcss.config.js       # PostCSS configuration
│   └── package.json            # Frontend dependencies
│
└── README.md                   # This file
```

---

## ⚙️ Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 19, Vite, Tailwind CSS v4     |
| Backend    | Node.js, Express.js                 |
| Database   | SQLite (via Prisma ORM)             |
| Charts     | Recharts                            |
| Icons      | React Icons (Feather Icons)         |
| HTTP       | Axios                               |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18 or later
- **npm** v9 or later

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Initialize the Database
```bash
cd backend
npx prisma db push
```

### 3. Seed the Database (Optional – adds sample data)
```bash
cd backend
node seed.js
```

### 4. Start the Backend Server
```bash
cd backend
node server.js
```
The API will be available at **http://localhost:5000**.

### 5. Install Frontend Dependencies
```bash
cd frontend
npm install
```

### 6. Start the Frontend Dev Server
```bash
cd frontend
npm run dev
```
Open **http://localhost:5173** in your browser.

---

## 🔑 Key Features

- **Dashboard** – Live analytics with summary cards, weekly bar charts, and task status pie charts.
- **Kanban Task Board** – Drag-and-drop style board with Pending, Assigned, In Progress, and Completed columns.
- **Schedule Clash Detection** – Automatically flags staff who are double-booked within a 2-hour window.
- **Task Status Actions** – Update task statuses directly from the UI with instant database persistence.
- **Device Inventory** – Full table view of rental devices with status badges, pricing, and serial numbers.
- **Staff Management** – Card-based view showing availability, contact info, and active task counts.
- **Customer Directory** – Searchable list of corporate clients with contact details and task history.

---

## 📡 API Endpoints

| Method | Endpoint                    | Description                        |
|--------|-----------------------------|------------------------------------|
| GET    | `/api/analytics/dashboard`  | Dashboard summary + charts data    |
| GET    | `/api/tasks`                | List all tasks                     |
| POST   | `/api/tasks`                | Create a new task                  |
| PUT    | `/api/tasks/:id/status`     | Update task status                 |
| GET    | `/api/tasks/conflicts`      | Detect schedule clashes            |
| GET    | `/api/devices`              | List all devices                   |
| POST   | `/api/devices`              | Add a new device                   |
| GET    | `/api/staff`                | List all staff                     |
| GET    | `/api/customers`            | List all customers                 |
| POST   | `/api/customers`            | Add a new customer                 |

---

## 📄 License

This project is proprietary software built for **One Point Solutions**.
