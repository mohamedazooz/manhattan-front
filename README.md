# Manhattan Language School — Frontend

React + Vite frontend for Manhattan Language School public website, parent portal, and admin CMS.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4 (Brand Guide tokens)
- React Router, TanStack Query, Axios
- react-i18next (English / Arabic + RTL)

## Setup

```bash
npm install
cp .env.example .env   # or use existing .env
npm run dev
```

Frontend: http://localhost:5173  
Backend API: http://localhost:3000/api

## Admin Login

- URL: `/admin/login`
- Credentials: Set via `ADMIN_EMAIL` and `ADMIN_PASSWORD` environment variables in backend `.env` during seeding.

## Routes (42 total)

- **Public (20):** Home, About, Academics, Admissions, Student Life, News, Careers, Contact, Parents pages, Login, Register, Portal, Search
- **Admin (22):** Dashboard, Landing CMS, About, Pages, Settings, Education, Gallery, Blog, Comments, Admissions, Requirements, Careers, Inquiries, Users, Roles, Email

## Build

```bash
npm run build
```
