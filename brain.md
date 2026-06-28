# Z.ai Dashboard - Brain 🧠

> **Single Source of Truth** for AI Agents and Developers. This file provides complete project context to minimize codebase scanning and token usage.

---

## 1. Project Overview
* **Project Name**: Aura CRM
* **Purpose**: A role-based business intelligence and CRM platform that integrates AI for outbound calling, SMS, chat, and lead management.
* **Target Users**: Admins (system managers), Managers (team/campaign leaders), and Clients (end-users/customers).
* **Core Features**:
  - Role-based access control (Admin, Manager, Client)
  - Lead and interaction tracking
  - AI Voice Calls (Vapi/Twilio) and SMS
  - Support ticket management
  - Internal messaging and document management
* **Current Status**: Active development / Hackathon project finalizing for deployment.

---

## 2. Tech Stack
* **Frontend Framework**: Next.js 15 (App Router), React 19
* **Backend Framework**: Next.js API Routes (Serverless)
* **Database**: Prisma ORM with PostgreSQL (migrated from SQLite)
* **Authentication**: NextAuth.js (Credentials/JWT) with bcrypt
* **State Management**: Zustand (Global), React Query (Data Fetching)
* **Styling System**: Tailwind CSS v4, Radix UI (shadcn/ui), Framer Motion
* **Build Tools**: npm, TypeScript, ESLint
* **Deployment Platform**: Vercel / Netlify
* **External Services/APIs**: Twilio (Calls/SMS), Vapi (AI Voice), Anthropic, React Query (Polling for real-time)

---

## 3. Folder Structure
```text
src/
 ├── app/            → Next.js App Router (pages and API endpoints)
 │   ├── api/        → Backend API routes
 │   ├── admin/      → Admin dashboard routes
 │   ├── manager/    → Manager dashboard routes
 │   ├── client/     → Client dashboard routes
 │   └── login/      → Authentication routes
 ├── components/     → Reusable UI components
 │   ├── ui/         → Base UI components (Radix/Tailwind)
 │   ├── layout/     → Navigation, Sidebar, Topbar
 │   └── ...         → Feature-specific components (AI Chat, Calls)
 ├── hooks/          → Custom React hooks
 ├── lib/            → Utility functions, services, and configs
 │   ├── db.ts       → Prisma client instance
 │   ├── auth.ts     → NextAuth configuration
 │   ├── twilio-service.ts
 │   └── ai-service.ts
prisma/              → Database schema (`schema.prisma`) and migrations
public/              → Static assets
```

---

## 4. Architecture

* **Application Flow**: User authenticates via NextAuth -> Middleware redirects based on `UserRole` -> User accesses role-specific dashboards.
* **Data Flow**: Client Components -> React Query/Zustand -> Next.js API Routes -> Prisma -> PostgreSQL Database.
* **API Flow**: API routes validate session -> Process business logic (e.g., trigger Twilio/Vapi) -> Update Database -> Return JSON response.
* **Authentication Flow**: Credential login -> NextAuth generates JWT -> Session injected into context.
* **State Management Flow**: Zustand for UI state (sidebar, modals). React Query for server state (leads, tickets).

---

## 5. Features
* [x] Role-based dashboards
* [x] Authentication & Authorization
* [x] Lead Management
* [x] AI Outbound Voice Calls (Vapi)
* [x] Support Ticket System
* [x] Internal Messaging
* [ ] Advanced Analytics Dashboards
* [ ] Automated AI Campaigns (In Progress)

---

## 6. Routes
* `/` - Landing/Login Page
* `/admin` - Admin overview dashboard
* `/admin/leads` - Admin lead management
* `/admin/users` - User management
* `/manager` - Manager overview dashboard
* `/client` - Client overview dashboard
* `/login`, `/signup` - Authentication pages

---

## 7. Components
* `layout/Sidebar.tsx` & `layout/Topbar.tsx` - Main navigation structure.
* `AIChatWidget.tsx` - Floating AI chat interface for users.
* `VapiCallButton.tsx` - Triggers AI voice calls to leads.
* `OutboundCallButton.tsx` - Traditional/Twilio call triggers.
* `ui/*` - shadcn/ui primitive components (Buttons, Dialogs, Selects, Tables).

---

## 8. Database
* **Provider**: PostgreSQL
* **Core Models**:
  - `User`, `UserProfile`, `UserSession`, `UserActivity`
  - `Lead`, `LeadInteraction` (Tracks calls/emails)
  - `Team`, `TeamMember`
  - `SupportTicket`, `SupportReply`
  - `Message`, `Document`, `Campaign`
  - `AICall`, `AICampaign`, `AIInsight`, `AITemplate`
* **Relationships**: Users manage Teams/Leads. Leads have Interactions. AICalls are linked to Leads and Users.

---

## 9. API Documentation
* `/api/auth/[...nextauth]` - NextAuth endpoints.
* `/api/leads` (GET, POST, PUT, DELETE) - Lead CRUD operations.
* `/api/ai/calls/initiate` (POST) - Initiates an AI voice call to a lead via Twilio/Vapi.
* `/api/ai/sms/send` (POST) - Sends AI-generated SMS to a lead.
* `/api/support-tickets` (GET, POST) - Ticket management.
* `/api/messages` (GET, POST) - Internal messaging.
* `/api/profile` (GET, PUT) - User profile management.

---

## 10. Environment Variables
* `DATABASE_URL`, `DIRECT_URL` - PostgreSQL connection strings (Supabase).
* `JWT_SECRET` - Secret for signing NextAuth tokens.
* `NEXT_PUBLIC_BASE_URL` - Absolute URL of the frontend.
* `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` - Twilio API credentials.
* `NEXT_PUBLIC_VAPI_PUBLIC_KEY`, `VAPI_PRIVATE_KEY` - Vapi AI Voice API keys.
* `ANTHROPIC_API_KEY` - AI text generation key.

---

## 11. External Dependencies
* `prisma` / `@prisma/client`: Database ORM.
* `next-auth`: Authentication.
* `@tanstack/react-query`: Server state caching and fetching.
* `zustand`: Lightweight global client state.
* `twilio` & `@vapi-ai/web`: Voice and SMS integrations.
* `zod`: Schema validation and strict API types.

---

## 12. Coding Conventions
* **Naming**: camelCase for variables/functions, PascalCase for React components, kebab-case for files (if utilities) or PascalCase for component files.
* **Architecture**: Next.js App Router conventions (page.tsx, layout.tsx, route.ts).
* **Error Handling**: Try/catch blocks in API routes returning `{ error: 'message' }` with standard HTTP status codes.
* **Styling**: Tailwind utility classes using `cn()` (clsx + tailwind-merge) utility for conditional styling.

---

## 13. Development Workflow
* **Install**: `npm install --legacy-peer-deps`
* **Database Sync**: `npm run db:push` followed by `npm run db:generate`
* **Run Local**: `npm run dev`
* **Build**: `npm run build`
* **Deploy**: Connect repository to Vercel/Netlify. Ensure `DATABASE_URL` is set to a remote PostgreSQL instance. `postinstall` script handles Prisma generation.

---

## 14. Current Progress
* **Current Milestone**: Vercel Deployment Preparation.
* **Recent Changes**: Migrated SQLite to PostgreSQL in `schema.prisma`. Replaced Socket.io with React Query polling. Replaced OpenAI with Anthropic. Added Zod validation.
* **Pending Tasks**: Verify Vapi webhook URLs for production. Set up Vercel environment variables.

---

## 15. Decision Log
* **Serverless Deployment**: Removed Socket.io and implemented polling to support serverless deployment on Vercel without connection limits.
* **Database**: Moved away from SQLite to PostgreSQL to support ephemeral serverless environments.
* **UI Library**: Used Radix/shadcn for accessible, customizable components without heavy runtime overhead.

---

## 16. AI Agent Notes
* **Important Assumptions**: The app relies heavily on NextAuth sessions. API routes must validate `session.user` before performing database operations.
* **Do Not Modify**: `next.config.ts` ignore build error settings unless explicitly requested, as they are intentional for hackathon rapid iteration.
* **Critical Logic**: The `src/lib/` folder contains core API clients. Treat `twilio-service.ts` and `ai-service.ts` carefully as they incur real-world costs.
* **Workflow**: Read this `brain.md` file first. If adding a new feature, implement the Prisma schema change -> `npm run db:push` -> API Route -> React Query Hook -> UI Component. Update `brain.md` when adding new features or routes.
