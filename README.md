# Templyfy

Templyfy is a full-stack digital ecommerce platform for selling Excel templates, VBA tools, Google Sheets resources, dashboards, and premium productivity downloads.

## Stack

- Frontend: Vite, React, TypeScript, Tailwind CSS, React Router, TanStack Query, React Hook Form, Zod, Lucide, Recharts
- Backend: Node.js, Express, TypeScript, Prisma, PostgreSQL, JWT admin auth, Razorpay, Nodemailer or Resend, Multer
- Database: PostgreSQL

## Features

- Public storefront with a premium digital marketplace layout
- Product catalog, search, filters, sorting, and product detail pages
- Backend Razorpay order creation and payment verification
- Secure private file delivery with signed expiring download links
- Email delivery flow with HTML order email template
- Blog listing and markdown article rendering
- JWT-protected admin panel
- Admin product, blog, order, and settings management
- Seeded demo catalog, sample blog posts, sample orders, and placeholder download files

## Project Structure

```text
.
|-- src/                    # Frontend app
|-- shared/                 # Shared brand and seed content
|-- deployment/             # Production deployment examples
|-- server/
|   |-- src/                # Express API + Prisma schema/seed
|   `-- storage/            # Private files and uploads
|-- .env.example
`-- docker-compose.yml
```

## Local Setup

1. Install dependencies

```bash
npm install
```

2. Copy the environment file

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

3. Start PostgreSQL

If you already have PostgreSQL running, update `DATABASE_URL` in `.env` and skip this step.

```bash
docker compose up -d postgres
```

4. Run Prisma migration

```bash
npm run db:migrate
```

If you are already inside `server/`, use:

```bash
npx dotenv -e ../.env -- prisma migrate dev
```

5. Seed the database

```bash
npm run db:seed
```

6. Start the app

```bash
npm run dev
```

Frontend: `http://localhost:5173`  
Backend API: `http://localhost:4000`

## Available Scripts

- `npm run dev` starts client and server together
- `npm run dev:client` starts the Vite frontend
- `npm run dev:server` starts the Express API
- `npm run build` builds frontend and backend
- `npm run start:server` starts the built backend
- `npm run db:generate` generates the Prisma client
- `npm run db:migrate` runs Prisma migrations for local development
- `npm run db:deploy` runs Prisma migrations for production
- `npm run db:seed` seeds demo data

Inside `server/`, direct Prisma CLI commands should use:

```bash
npx dotenv -e ../.env -- prisma <command>
```

## Admin Login

The seed script creates an admin user from:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

## Environment Notes

- `APP_URL` should be the public backend-facing base used in download links.
- `CORS_ORIGINS` accepts a comma-separated list of allowed frontend origins.
- `TRUST_PROXY=true` should be set when the backend is behind Nginx or another reverse proxy.
- `STORAGE_PROVIDER=supabase` moves uploaded files and protected downloads to Supabase Storage, which is recommended for free hosting.
- `RESEND_API_KEY` enables HTTP-based email sending, which is recommended on free hosts that block SMTP.
- `VITE_API_URL` should be `http://localhost:4000/api` in local development.
- For same-domain production behind Nginx, set `VITE_API_URL=/api` before building the frontend.

## Recommended Free Deployment

If you only bought a domain and want the cheapest possible setup, use this stack:

- Frontend: Render Static Site free plan
- Backend: Render Web Service free plan
- Database: Supabase free Postgres
- File storage: Supabase Storage free plan
- Email delivery: Resend free plan

This setup is good for learning, testing, portfolio use, and low-volume demos.

Do not treat it as a strong production setup for real paid traffic because:

- Render free web services spin down when idle
- Render free services are explicitly not intended for production use
- Supabase free projects can pause after inactivity
- Resend free has daily and monthly sending limits

### Why this stack

- You do not need to buy a VPS
- You do not need to buy storage separately
- You still get PostgreSQL, file storage, HTTPS, and a public domain
- This project now supports Supabase Storage and Resend email directly

## Free Deployment Walkthrough

### 1. Put the code on GitHub

Create a GitHub repository and push this project.

Render will deploy from GitHub, so this is the easiest starting point.

### 2. Create your free database and storage in Supabase

1. Create a free project in Supabase.
2. Go to the project dashboard.
3. Open `Connect` and copy the `Session pooler` Postgres connection string.
4. Put that value into `DATABASE_URL`.
5. Open `Storage`.
6. Create a public bucket named `templyfy-public`.
7. Create a private bucket named `templyfy-private`.

Important:

- Do not use the direct connection host `db.<project-ref>.supabase.co:5432` on free Render if it fails with `P1001`.
- Supabase documents that direct connections use IPv6 by default, while the Session pooler supports IPv4 and IPv6.

Use these values in `.env`:

```env
STORAGE_PROVIDER="supabase"
SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="YOUR_SUPABASE_SERVICE_ROLE_KEY"
SUPABASE_PUBLIC_BUCKET="templyfy-public"
SUPABASE_PRIVATE_BUCKET="templyfy-private"
```

How to access and manage your DB later:

- Use the Supabase dashboard `Table Editor` for tables and data
- Use the Supabase `SQL Editor` to run SQL manually
- If you want desktop access, use pgAdmin with the connection string from Supabase

### 3. Create your free email sender in Resend

1. Create a Resend account.
2. Add your purchased domain.
3. Add the DNS records Resend asks for at your domain registrar.
4. Wait for domain verification.
5. Create an API key.

Use this in `.env`:

```env
RESEND_API_KEY="re_xxxxxxxxx"
EMAIL_FROM="Templyfy <noreply@yourdomain.com>"
```

If you use Resend, SMTP is not required.

### 4. Prepare production environment values

For a simple free setup:

- frontend domain: `https://yourdomain.com`
- backend URL: keep the default Render backend URL first, for example `https://templyfy-api.onrender.com`

Use values like these:

```env
NODE_ENV="production"
PORT="10000"
DATABASE_URL="YOUR_SUPABASE_POSTGRES_CONNECTION_STRING"
JWT_SECRET="replace-with-a-long-random-secret"
ADMIN_EMAIL="admin@yourdomain.com"
ADMIN_PASSWORD="replace-with-a-strong-password"
RAZORPAY_KEY_ID="rzp_test_or_live_key"
RAZORPAY_KEY_SECRET="your_razorpay_secret"
RAZORPAY_WEBHOOK_SECRET="your_razorpay_webhook_secret"
RESEND_API_KEY="re_xxxxxxxxx"
EMAIL_FROM="Templyfy <noreply@yourdomain.com>"
APP_URL="https://templyfy-api.onrender.com"
CORS_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"
TRUST_PROXY="true"
STORAGE_PROVIDER="supabase"
SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="YOUR_SUPABASE_SERVICE_ROLE_KEY"
SUPABASE_PUBLIC_BUCKET="templyfy-public"
SUPABASE_PRIVATE_BUCKET="templyfy-private"
DOWNLOAD_TOKEN_SECRET="replace-with-a-long-random-secret"
DOWNLOAD_LINK_EXPIRY_HOURS="72"
VITE_API_URL="https://templyfy-api.onrender.com/api"
```

### 5. Deploy the backend on Render

1. Sign in to Render.
2. Click `New` -> `Web Service`.
3. Connect your GitHub repo.
4. Use these settings:

- Environment: `Node`
- Build Command: `npm install && npm run build:server`
- Start Command: `npm run start:server`
- Plan: `Free`

Add all backend environment variables from the previous step in the Render dashboard.

After the first deploy:

1. Open the Render backend shell or local machine.
2. Run:

```bash
npm run db:deploy
npm run db:seed
```

Keep the generated backend URL. It will look like:

```text
https://templyfy-api.onrender.com
```

### 6. Deploy the frontend on Render Static Site

1. In Render, click `New` -> `Static Site`.
2. Connect the same GitHub repo.
3. Use these settings:

- Build Command: `npm install && npm run build:client`
- Publish Directory: `dist`

Set this environment variable for the frontend build:

```env
VITE_API_URL=https://templyfy-api.onrender.com/api
```

### 7. Connect your domain to the frontend

In the Render static site settings:

1. Add your custom domain `yourdomain.com`
2. Add `www.yourdomain.com` if you want
3. Render will show the DNS records you need
4. Add those records where you bought your domain
5. Wait for SSL to finish provisioning

### 8. Optional: connect an API subdomain later

After everything works, you can also connect:

- `api.yourdomain.com` -> Render backend

Then change:

```env
APP_URL="https://api.yourdomain.com"
VITE_API_URL="https://api.yourdomain.com/api"
CORS_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"
```

Redeploy backend and frontend after changing those values.

### 9. Razorpay setup

Before taking real money:

1. Start with Razorpay test keys
2. Configure the Razorpay webhook URL to:

```text
https://YOUR_BACKEND_DOMAIN/api/webhooks/razorpay
```

3. Add the webhook secret to `RAZORPAY_WEBHOOK_SECRET`
4. Test payment flow first

### 10. Where you will log in later

- Store admin: `/admin` on your frontend site
- Database and files: Supabase dashboard
- Backend logs and deploys: Render dashboard
- Email logs and domain verification: Resend dashboard
- Domain DNS records: your domain registrar dashboard

## Production Deployment

The simplest production setup for this project is:

- Frontend on `https://yourdomain.com`
- Backend proxied through `https://yourdomain.com/api`
- Node API running locally on port `4000`
- Nginx serving the built `dist/` folder and reverse proxying `/api` and `/uploads`

### 1. Point your domain

Create DNS records pointing to your server IP:

- `A` record for `@`
- `A` record for `www`

### 2. Prepare the server

Install:

- Node.js 20+
- PostgreSQL
- Nginx
- PM2

PM2 install example:

```bash
npm install -g pm2
```

### 3. Upload the project

Example path:

```bash
/var/www/templyfy
```

Then run:

```bash
cd /var/www/templyfy
npm install
```

### 4. Configure production environment

Use values like these in `.env`:

```env
NODE_ENV="production"
PORT="4000"
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/templyfy"
JWT_SECRET="replace-with-a-long-random-secret"
ADMIN_EMAIL="admin@yourdomain.com"
ADMIN_PASSWORD="replace-with-a-strong-password"
RAZORPAY_KEY_ID="rzp_live_or_test_key"
RAZORPAY_KEY_SECRET="your_razorpay_secret"
RAZORPAY_WEBHOOK_SECRET="your_webhook_secret"
EMAIL_HOST="smtp.yourprovider.com"
EMAIL_PORT="587"
EMAIL_USER="smtp-user"
EMAIL_PASS="smtp-password"
EMAIL_FROM="Templyfy <noreply@yourdomain.com>"
APP_URL="https://yourdomain.com"
CORS_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"
TRUST_PROXY="true"
DOWNLOAD_TOKEN_SECRET="replace-with-a-long-random-secret"
DOWNLOAD_LINK_EXPIRY_HOURS="72"
VITE_API_URL="/api"
```

### 5. Build and migrate

```bash
npm run build
npm run db:deploy
```

Seed only the first time if you want demo content:

```bash
npm run db:seed
```

### 6. Start the backend with PM2

An example PM2 config is included at [deployment/pm2.ecosystem.config.cjs](deployment/pm2.ecosystem.config.cjs).

Start it with:

```bash
pm2 start deployment/pm2.ecosystem.config.cjs
pm2 save
pm2 startup
```

### 7. Configure Nginx

An example config is included at [deployment/nginx.templyfy.conf](deployment/nginx.templyfy.conf).

Typical flow:

```bash
sudo cp deployment/nginx.templyfy.conf /etc/nginx/sites-available/templyfy
sudo ln -s /etc/nginx/sites-available/templyfy /etc/nginx/sites-enabled/templyfy
sudo nginx -t
sudo systemctl reload nginx
```

Update these placeholders first:

- `yourdomain.com`
- `/var/www/templyfy`

### 8. Enable HTTPS

Example with Certbot:

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Alternative: API on a Subdomain

If you prefer:

- Frontend: `https://yourdomain.com`
- Backend: `https://api.yourdomain.com`

Use:

```env
APP_URL="https://api.yourdomain.com"
CORS_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"
VITE_API_URL="https://api.yourdomain.com/api"
TRUST_PROXY="true"
```

## Development Notes

- Seeded product downloads are placeholder files stored in `server/storage/private/`.
- Uploaded digital product files stay private and are only served through signed download tokens.
- If `EMAIL_HOST` stays as `smtp.example.com` or `EMAIL_USER` stays as `smtp-user`, the backend uses Nodemailer JSON transport for local development instead of sending real email.
- Razorpay checkout requires valid Razorpay credentials in `.env` for real payment testing.

## Verification

Verified locally:

- `npm run build`

Not run here:

- `npm run db:migrate` and `npm run db:seed` against a live PostgreSQL instance in this session
- Live Razorpay payments without real Razorpay credentials
