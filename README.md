# Amhara Sayint Woreda Communication Affairs Office Portal

A bilingual (Amharic/English), responsive government portal for:
**አምሐራ ሳይንት ወረዳ የመንግስት ኮሙዩኒኬሽን ጉዳዮች ጽ/ቤት**.

## Features

- Responsive public website (Home, About, Services, News & Announcements, Media Gallery, Documents, Contact)
- Bilingual language toggle (Amharic / English)
- Public news and document search
- Contact form with backend persistence
- Admin authentication and dashboard
- News posting and document upload/download
- Security middleware (`helmet`, `cors`, JWT auth)
- SEO basics (meta description/keywords/title)

## Tech Stack

- **Frontend:** React + Vite + TailwindCSS
- **Backend:** Node.js + Express
- **Database:** Sequelize models (MySQL-compatible)

> Note: The request preferred MongoDB, but this repository is implemented with Sequelize models and relational DB config. The structure below reflects the actual running codebase.

## Project Structure

- `frontend/` - public site and admin UI
- `backend/` - API, auth, news, documents, contact, users

## Database Structure (Core Tables)

From Sequelize models in `backend/models`:

- `users`
- `news`
- `documents`
- `document_versions`
- `tasks`
- `task_logs`
- `historical_records`
- `contact_messages`

## Local Development

### 1) Backend

```bash
cd backend
cp .env.example .env   # if you have one; otherwise create .env manually
npm install
npm run dev            # or: node server.js
```

Suggested `.env` values:

```env
NODE_ENV=development
PORT=5000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=sayint_portal
DB_USER=root
DB_PASSWORD=your_password
JWT_SECRET=change_this_secret
```

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

Optional frontend env:

```env
VITE_API_URL=http://localhost:5000/api
```

## Production Deployment (Basic)

### Backend

1. Provision Node.js 20+ and MySQL.
2. Configure environment variables.
3. Run:

```bash
cd backend
npm ci
NODE_ENV=production node server.js
```

Use PM2/systemd and put behind Nginx/Apache reverse proxy.

### Frontend

```bash
cd frontend
npm ci
npm run build
```

Serve `frontend/dist` as static files (Nginx recommended).

## Security Notes

- JWT-protected admin APIs
- Role-based authorization for admin/editor actions
- Helmet and CORS enabled
- File upload validation in backend upload middleware

## Default Admin

On first run in development, backend bootstrap creates:

- Employee ID: `SAY001`
- Password: `Admin@123`

Change this immediately in real deployment.
