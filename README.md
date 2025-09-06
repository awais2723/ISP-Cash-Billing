# ISP Cash Bill Collection System

A robust, full-stack application designed to streamline and audit the cash collection process for Internet Service Providers (ISPs). This system empowers field collectors with a mobile-first Progressive Web App (PWA) for on-the-go payments and provides administrators with a powerful dashboard for real-time management and reconciliation.

---

## Table of Contents

- [About The Project](#about-the-project)
- [Key Features](#key-features)
  - [Admin Dashboard](#admin-dashboard)
  - [Field Collector PWA](#field-collector-pwa)
- [Core Workflow](#core-workflow)
- [Built With](#built-with)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Data Schema Overview](#data-schema-overview)
- [Reporting & KPIs](#reporting--kpis)
- [Contributing](#contributing)
- [License](#license)

---

## About The Project

ISPs often face challenges in managing door-to-door cash bill collections. This process can be prone to errors, delays in reconciliation, and lack of real-time visibility. This project solves that problem by providing a digital, auditable, and efficient system.

The application enables field collectors to view their assigned routes, log cash payments securely (even offline), and issue digital receipts. Simultaneously, it gives HQ administrators and managers complete control over customer management, billing, collector assignments, and financial reconciliation through a comprehensive web dashboard.

The primary goal is to **increase transparency, reduce revenue leakage, and improve operational efficiency** in the cash collection lifecycle.

---

## Key Features

### Admin Dashboard
* **👤 Customer Management**: Full CRUD operations for customers, including their plans, addresses, and status.
* **🗺️ Region & Assignment Management**: Define geographical regions and assign them to specific field collectors.
* **⚙️ Billing Engine**: Generate monthly invoices, apply late fees, handle partial payments, and manage credit notes.
* **📊 Real-time Dashboards**: Monitor key metrics like collection rates, outstanding balances, and collector productivity.
* **🔐 User & Role Management**: Securely manage access for Admins, Managers, and Collectors.
* **💰 Cash Reconciliation**: A complete workflow to approve collector cash sessions, track bank deposits (`Cash Drops`), and resolve variances.

### Field Collector PWA
* **📱 Mobile-First & Offline-Ready**: Designed for on-the-field use, with functionality that works seamlessly without an internet connection and syncs automatically when online.
* **🚗 Route & Task View**: View a clear list of assigned customers and outstanding invoices.
* **💵 Payment Collection**: Easily record full or partial cash payments and generate unique, shareable digital receipts via WhatsApp or SMS.
* **⏱️ Auditable Cash Sessions**: Start and end work sessions with a clear record of expected vs. actual cash collected.
* **📝 Issue Reporting**: Log customer-related issues like "house locked" or "customer moved" to keep data clean.

---

## Core Workflow

The end-to-end cash collection process follows a simple, auditable path:

1.  **Session Start**: A Collector logs in and opens a new `Cash Session` for the day.
2.  **Collection**: The Collector visits customers, views due invoices, and records the cash received.
3.  **Receipt Generation**: The app generates a numbered digital receipt which can be shared instantly.
4.  **Session End**: At the end of the day, the Collector counts their cash and closes the session. The app highlights any variance between expected and counted amounts.
5.  **Deposit**: The Collector submits the cash to an admin/bank and records a `Cash Drop` in the app.
6.  **Approval**: An Admin reviews the session, approves the payments, and reconciles the `Cash Drop`, closing the financial loop.

---

## Built With

This project leverages a modern, powerful tech stack to deliver a seamless user experience.

* **Frontend**: [React.js](https://reactjs.org/) & [Next.js](https://nextjs.org/)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
* **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/)
* **Backend/ORM**: [Prisma](https://www.prisma.io/)
* **Database**: [MongoDB](https://www.mongodb.com/)

---

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

Make sure you have the following installed on your machine:
* Node.js (v18 or later recommended)
* npm or yarn
* A running MongoDB instance (local or on Atlas)

### Installation

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/your-username/isp-cash-collection.git](https://github.com/your-username/isp-cash-collection.git)
    cd isp-cash-collection
    ```

2.  **Install NPM packages:**
    ```sh
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the root of the project and add your database connection string.
    ```env
    # .env.local
    DATABASE_URL="mongodb+srv://<user>:<password>@<cluster-url>/<db-name>?retryWrites=true&w=majority"
    ```

4.  **Push the Prisma schema to your database:**
    This command will sync your data model with the MongoDB database.
    ```sh
    npx prisma db push
    ```

5.  **Generate the Prisma Client:**
    ```sh
    npx prisma generate
    ```

6.  **Run the development server:**
    ```sh
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## Data Schema Overview

The database schema is designed to be relational and auditable. Key entities include:

<details>
  <summary>Click to expand entity list</summary>
  
  - **`User`**: Stores credentials and roles (Admin, Collector, Manager).
  - **`Region`**: Defines geographical areas for assignment.
  - **`Customer`**: Contains customer details and links them to a region and plan.
  - **`Plan`**: Defines billing plans with pricing and taxes.
  - **`Invoice`**: Represents a monthly bill for a customer.
  - **`Payment`**: A record of a payment made against an invoice.
  - **`CashSession`**: An auditable session for a collector's workday.
  - **`CashDrop`**: A record of a collector depositing collected cash.
  - **`AuditLog`**: Tracks significant actions performed by users for accountability.

</details>

---

## Reporting & KPIs

The system is designed to provide valuable insights through its reporting module. Key Performance Indicators include:

* **Collection Rate (%)**: `(Total Collected / Total Billed)`
* **Outstanding Aging**: Balances broken down by 0-30, 31-60, 61-90, and 90+ days.
* **Collector Productivity**: Average collections per collector.
* **Visit Outcomes**: A breakdown of visit results (e.g., Paid, Not Home, Refused).

---

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## License

Distributed under the MIT License. See `LICENSE` for more information.
