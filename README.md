# 📦 Benchmark Dashboard — Setup Instructions (Mac)

This project uses **Next.js**, **Tailwind CSS**, **React**, and a **Flask API backend with SQLAlchemy**. Follow these steps to install everything you need.

---

## 📖 Prerequisites

- **Node.js** (v18+ recommended)
- **Python 3.x** (with `pip`)
- **npm** (comes with Node)

---

## 📦 Install Node & Next.js Dependencies

In your project root:

```bash
npm install
```

If `package-lock.json` is broken or outdated:

```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📦 Install Missing Next.js / React Dependencies

If not already in `package.json`:

```bash
npm install react react-dom next
```

---

## 📦 Install Tailwind CSS and PostCSS Plugins

Install `tailwindcss`, `postcss`, `autoprefixer` and the new PostCSS plugin:

```bash
npm install -D tailwindcss postcss autoprefixer @tailwindcss/postcss
```

---

## 📦 Install Python Dependencies (for Flask API)

In your Python backend folder:

```bash
pip install Flask Flask-Cors SQLAlchemy psycopg2-binary
```

- `Flask` — for the API
- `Flask-Cors` — to handle cross-origin requests
- `SQLAlchemy` — ORM for database connections
- `psycopg2-binary` — PostgreSQL adapter for Python

---

## 📦 Check Installed Tailwind CSS Version

```bash
npm list tailwindcss
```

---

## 📦 Common Errors & Fixes

**1️⃣ Next.js SWC error on Mac (Apple Silicon)**  
If you see:
```
Attempted to load @next/swc-darwin-arm64, but it was not installed
```
Fix it with:

```bash
npm install
```

**2️⃣ Tailwind/PostCSS Plugin Error**
If you see:
```
Cannot find module '@tailwindcss/postcss'
```
Fix it with:

```bash
npm install -D @tailwindcss/postcss
```

---

## 📦 Development Scripts

```bash
npm run dev
```

---

## ✅ Summary — All Required Installs

**Node dependencies:**

```bash
npm install
npm install react react-dom next
npm install -D tailwindcss postcss autoprefixer @tailwindcss/postcss
```

**Python dependencies:**

```bash
pip install Flask Flask-Cors SQLAlchemy psycopg2-binary
```
