# 🚗 SmartCar Dealer Management System with AI Sales Assistant

A full-stack, enterprise-grade used car dealership platform and CRM powered by **Next.js (App Router, TypeScript)**, **Supabase (PostgreSQL, Auth, RLS)**, and **Vercel AI SDK (Gemini / OpenAI)**.

---

## 🌟 Key Features

### 1. Customer & Public Experience
- **Dynamic Showroom Catalog**: Real-time filtering by Brand/Make, Fuel Type (Petrol, Diesel, Electric, Hybrid, CNG), Transmission, and Budget.
- **Detailed Vehicle Showcase (`/cars/[id]`)**: High-res multi-angle photo gallery, 150-point inspection badge, transparent specifications, and EMI finance calculator.
- **24/7 AI Sales Concierge (`AutoAssist AI`)**:
  - Live inventory querying directly via Supabase tool calling.
  - Answers questions (e.g., *"Show me SUVs under ₹15 Lakhs"* or *"Is Honda City available?"*).
  - Automatically captures customer contact info & intent to book VIP test drives into CRM.

### 2. Dealer & Admin Management Dashboard (`/admin/dashboard`)
- **Real-Time Analytics KPIs**: Total Active Inventory, Leads Captured Today, Sold Cars, and Conversion Metrics.
- **Inventory Management**: Add new vehicles, toggle between `Available` and `Sold`, and view full fleet specs.
- **Lead & CRM Management**: Monitor leads from AI Chatbot and Web Forms, change status (`New`, `Contacted`, `Test Drive Booked`, `Closed`), and view customer contact details with one-click call/WhatsApp links.
- **Supabase Security**: Row-Level Security (RLS) policies guaranteeing public access to available stock while protecting dealer management data.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | Next.js 14 (App Router, Server & Client Components) |
| **Language & Typing** | TypeScript 5 (Strict Mode) |
| **Styling & UI** | Tailwind CSS, Lucide Icons, Glassmorphic Design Tokens |
| **Database & Auth** | Supabase (PostgreSQL, RLS Policies, UUID triggers) |
| **AI Layer** | Vercel AI SDK (`ai`), Google Gemini (`@ai-sdk/google`) / OpenAI |
| **Deployment Target** | Vercel |

---

## 🚀 Quick Start Guide

### 1. Clone & Install Dependencies
```bash
cd smartcardealerandaichatbox
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your Supabase project credentials and Google Gemini / OpenAI API key:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# AI Provider ("google" or "openai")
AI_PROVIDER=google
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-api-key
```

### 3. Setup Supabase Database
1. Go to your [Supabase Dashboard](https://database.new) -> **SQL Editor**.
2. Run the SQL script from `supabase/schema.sql` to initialize tables, enums, triggers, and Row Level Security (RLS) policies.
3. (Optional) Run `supabase/seed.sql` to populate sample certified inventory (Honda City, Creta Turbo, Nexon EV, Fortuner, Swift).

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the customer showroom and [http://localhost:3000/admin/dashboard](http://localhost:3000/admin/dashboard) for the dealer CRM dashboard.

---

## 📂 Project Architecture

```
smartcardealerandaichatbox/
├── supabase/
│   ├── schema.sql              # Database schema, enums, indexes, and RLS policies
│   └── seed.sql                # Certified vehicle and lead seed data
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/route.ts   # Vercel AI SDK route with tool calling
│   │   │   ├── cars/route.ts   # Inventory API route (GET, POST)
│   │   │   └── leads/route.ts  # CRM Leads API route (GET, POST, PATCH)
│   │   ├── admin/
│   │   │   └── dashboard/      # Protected Dealer CRM & Inventory Portal
│   │   ├── cars/[id]/          # Dynamic Vehicle Specification & Booking Page
│   │   ├── globals.css         # Theme tokens and modern styling
│   │   ├── layout.tsx          # Root layout with Navbar and Footer
│   │   └── page.tsx            # Main Landing & Search page with AI Chatbot
│   ├── components/
│   │   ├── chatbot.tsx         # Floating 24/7 AI Sales Assistant Widget
│   │   ├── car-card.tsx        # High-res car card with specs & CTA
│   │   ├── search-filters.tsx  # Dynamic multi-parameter filter bar
│   │   ├── test-drive-modal.tsx# Doorstep test drive booking modal
│   │   ├── navbar.tsx          # Top navigation bar
│   │   └── footer.tsx          # Dealership footer with trust certifications
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts       # Browser Supabase client
│   │   │   ├── server.ts       # Server Supabase client
│   │   │   └── admin.ts        # Admin Service Role Supabase client
│   │   └── utils.ts            # Formatting utilities (Lakhs, KM, cn)
│   └── types/
│       ├── database.ts         # Supabase PostgreSQL schema types
│       └── index.ts            # Domain interfaces and filters
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```
