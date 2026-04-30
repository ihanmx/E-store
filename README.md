# 🛒 E-Store Backend

A full-featured e-commerce web application built with Node.js and Express, progressing through multiple versions to cover core backend concepts from database integration to payment processing.

---

## 📚 Live Concepts Covered

| Version | Branch                             | Concept                                                 |
| ------- | ---------------------------------- | ------------------------------------------------------- |
| v3      | `store-v3-Sequelize`               | 🗄️ SQL database with Sequelize ORM                      |
| v4      | `store-v4-MongoDb`                 | 🍃 NoSQL with raw MongoDB driver                        |
| v5      | `store-v5-mongoose`                | MongoDB with Mongoose ODM                               |
| v6      | `store-v6-sessions-cookies`        | 🔐 Sessions, cookies, authentication                    |
| v7      | `store-v7-mailing-service`         | 📧 Transactional email with Nodemailer + SendGrid       |
| v8      | `store-v8-advanced-authentication` | 🛡️ Password reset, authorization, role-based access     |
| v9      | `store-v9-validation`              | ✅ Server-side input validation with express-validator  |
| v10     | `store-v10-error-handling`         | 🚨 Centralized error handling middleware                |
| v11     | `store-v11-files-upload-download`  | 📁 File uploads with Multer, PDF generation with PDFKit |
| v12     | `store-v12-pagination`             | 📄 Server-side pagination                               |
| v13     | `store-v13-payment`                | 💳 Stripe Checkout integration                          |

---

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js v5
- **Template Engine:** EJS
- **Database:** MongoDB + Mongoose
- **Authentication:** express-session + bcrypt
- **Validation:** express-validator
- **File Uploads:** Multer
- **PDF Generation:** PDFKit
- **Payments:** Stripe Checkout
- **Email:** Nodemailer + SendGrid
- **Dev Tool:** Nodemon

---

## ✨ Features

- 👤 User registration and login with hashed passwords
- 🔒 Session-based authentication and route protection
- 🛠️ Admin panel: create, edit, delete products (with image upload)
- 🛍️ Shop: browse products, add to cart, place orders
- 📄 Server-side pagination on product listings
- 🧾 Invoice PDF generation and download per order
- 💳 Stripe Checkout for secure card payments
- 🔑 Password reset via email link
- 💬 Flash messages for user feedback
- 🚨 Centralized error handling (404 / 500 pages)

---

## 📂 Project Structure

```
├── controllers/
│   ├── admin.js       # Product CRUD for admin
│   ├── shop.js        # Shop, cart, orders, checkout, invoices
│   ├── auth.js        # Login, signup, password reset
│   └── error.js       # 404 and 500 handlers
├── models/
│   ├── product.js     # Product schema
│   ├── order.js       # Order schema
│   └── user.js        # User schema with cart methods
├── routes/
│   ├── admin.js       # Admin routes
│   ├── shop.js        # Shop routes
│   └── auth.js        # Auth routes
├── middleware/
│   └── is-auth.js     # Auth guard middleware
├── views/             # EJS templates
│   ├── admin/
│   ├── shop/
│   ├── auth/
│   └── includes/      # Shared partials (nav, pagination, head)
├── public/            # Static assets (CSS, JS)
├── images/            # Uploaded product images
├── data/invoices/     # Generated PDF invoices
├── helper/
│   └── file.js        # File deletion utility
└── app.js             # App entry point
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- Stripe account (test keys)
- SendGrid account (for email)

### Installation

```bash
git clone https://github.com/ihanmx/e-store-backend.git
cd e-store-backend
npm install
```

### ⚙️ Environment Variables

Create a `.env` file in the root:

```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/<dbname>
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLIC_KEY=pk_test_...
SENDGRID_API_KEY=SG....
```

### ▶️ Run

```bash
# Development (with auto-restart)
nodemon app.js

# Production
node app.js
```

App runs at `http://localhost:3000`

---

## 🧠 Key Concepts Explained

### 🔐 Sessions & Authentication

User login state is stored server-side using `express-session` with MongoDB as the session store (`connect-mongodb-session`). Passwords are hashed with `bcrypt` before saving.

### 🛡️ Authorization

The `is-auth` middleware protects routes by checking `req.session.isLoggedIn`. Admin routes additionally verify that the product being edited/deleted belongs to the logged-in user.

### 📁 File Uploads

`Multer` handles `multipart/form-data` requests. Files are stored to the `images/` directory using `diskStorage`. Only PNG/JPG/JPEG files pass the `fileFilter`.

### 🧾 PDF Invoices

`PDFKit` streams the generated PDF simultaneously to the file system and the HTTP response, avoiding buffering the entire file in memory.

### 📄 Pagination

Products are paginated using Mongoose's `.skip()` and `.limit()`. The controller passes `currentPage`, `hasNextPage`, `hasPreviousPage`, `nextPage`, `previousPage`, and `lastPage` to the view for the pagination partial.

### 💳 Stripe Checkout

On checkout, a Stripe `Session` is created server-side with `line_items` built from the user's cart. The client-side Stripe.js SDK redirects the user to Stripe's hosted payment page. On success, Stripe redirects to `/checkout/success` where the order is saved and the cart is cleared.

### 🚨 Error Handling

A custom error class with `httpStatusCode` is used. Errors are forwarded via `next(error)` to a centralized Express error-handling middleware that renders the appropriate error page.

---

## 💳 Stripe Test Cards

| Card Number           | Result              |
| --------------------- | ------------------- |
| `4242 4242 4242 4242` | ✅ Payment succeeds |
| `4000 0000 0000 0002` | ❌ Payment declined |

Use any future expiry date and any 3-digit CVC.
