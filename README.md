# Z.ai Dashboard - Role-Based Business Intelligence Platform

A comprehensive Next.js 15 application featuring role-based dashboards with AI-powered analytics, real-time communication, and intelligent lead management.

## 🚀 Features

### 🔐 Authentication System
- **Role-based access control** (Admin, Manager, Client)
- **JWT authentication** with secure token management
- **Demo login** functionality for quick testing
- **Password hashing** with bcrypt
- **Session management** with activity tracking

### 🏢 Role-Based Dashboards

#### Admin Dashboard
- System overview with real-time metrics
- User management and permissions
- System configuration and monitoring
- Advanced analytics and reporting
- Performance monitoring (CPU, Memory, Disk)

#### Manager Dashboard
- Team performance tracking
- Lead pipeline management
- Campaign creation and monitoring
- Conversion analytics
- Team member performance metrics

#### Client Dashboard
- Personal interaction history
- Profile management
- Support ticket system
- Communication center
- Satisfaction tracking

### 🎨 UI/UX Features
- **Responsive design** for all devices
- **Modern UI** with shadcn/ui components
- **Dark/light theme** support ready
- **Mobile-first** navigation
- **Real-time updates** with WebSocket integration

## 🛠️ Technology Stack

### Core Framework
- **Next.js 15** with App Router
- **TypeScript 5** for type safety
- **Tailwind CSS 4** for styling
- **shadcn/ui** component library

### Database & ORM
- **Prisma ORM** with SQLite
- **Database migrations** and schema management
- **Type-safe database queries**

### Authentication & Security
- **JWT tokens** for authentication
- **bcryptjs** for password hashing
- **Zod** for input validation
- **Middleware-based route protection**

### Additional Features
- **Socket.IO** for real-time communication
- **Lucide React** for icons
- **React Hook form** ready for forms
- **Toast notifications** with Sonner

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication pages
│   │   ├── login/               # Login page
│   │   └── signup/              # Signup page
│   ├── admin/                   # Admin dashboard routes
│   │   └── dashboard/           # Admin dashboard
│   ├── manager/                 # Manager dashboard routes
│   │   └── dashboard/           # Manager dashboard
│   ├── client/                  # Client dashboard routes
│   │   └── dashboard/           # Client dashboard
│   ├── api/                     # API routes
│   │   └── auth/                # Authentication endpoints
│   └── globals.css              # Global styles
├── components/
│   ├── ui/                      # shadcn/ui components
│   └── layout/                  # Layout components
├── lib/
│   ├── db.ts                    # Database client
│   ├── utils.ts                 # Utility functions
│   └── socket.ts                # Socket.IO configuration
├── hooks/                       # Custom React hooks
├── middleware.ts                # Route protection middleware
└── prisma/
    └── schema.prisma            # Database schema
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd z-ai-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Configure your environment variables:
   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="your-super-secret-jwt-key"
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔐 Demo Access

The application includes demo accounts for testing all three roles:

### Admin Dashboard
- **Email**: admin@demo.com
- **Password**: demo123
- **Access**: Full system control and user management

### Manager Dashboard  
- **Email**: manager@demo.com
- **Password**: demo123
- **Access**: Team management and lead tracking

### Client Dashboard
- **Email**: client@demo.com
- **Password**: demo123
- **Access**: Personal dashboard and support

**Quick Demo**: Use the "Demo Access" buttons on the login page for instant access without credentials.

## 📊 Database Schema

The application uses a comprehensive database schema with the following key models:

### Core Models
- **User**: Authentication and role management
- **UserProfile**: Extended user information
- **UserSession**: Active session tracking
- **UserActivity**: Audit log and activity tracking

### Business Models
- **Team**: Team management for managers
- **TeamMember**: Team membership relationships
- **Lead**: Lead management and tracking
- **LeadInteraction**: Communication history
- **Campaign**: Marketing campaign management

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run db:push      # Push schema changes
npm run db:studio    # Open Prisma Studio
npm run db:generate  # Generate Prisma client

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

### Code Quality

The project follows strict code quality standards:
- **ESLint** for code linting
- **TypeScript** for type safety
- **Prettier** for code formatting
- **Husky** for git hooks (configured)

## 🚀 Deployment

### Environment Variables

Ensure these environment variables are set in production:

```env
DATABASE_URL="your-production-database-url"
JWT_SECRET="your-production-jwt-secret"
NEXTAUTH_URL="your-production-url"
```

### Build and Deploy

```bash
# Build the application
npm run build

# Start the production server
npm run start
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Route Protection**: Middleware-based access control
- **Input Validation**: Zod schema validation
- **Activity Logging**: Comprehensive audit trail
- **Session Management**: Secure session handling

## 🎯 Role-Based Access

### Admin Role
- ✅ Full system access
- ✅ User management
- ✅ System configuration
- ✅ All analytics
- ✅ Security monitoring

### Manager Role
- ✅ Team management
- ✅ Lead management
- ✅ Campaign management
- ✅ Team analytics
- ✅ Performance reports

### Client Role
- ✅ Personal dashboard
- ✅ Interaction history
- ✅ Profile management
- ✅ Support access
- ❌ No admin features

## 🔄 Real-Time Features

The application includes Socket.IO integration for:
- **Live notifications**
- **Real-time updates**
- **Activity feeds**
- **Chat functionality** (ready to implement)

## 📱 Responsive Design

- **Mobile-first** approach
- **Responsive layouts** for all screen sizes
- **Touch-friendly** interactions
- **Progressive enhancement**

## 🎨 UI Components

Built with shadcn/ui components:
- **Cards**, **Buttons**, **Forms**
- **Navigation**, **Tabs**, **Tables**
- **Charts**, **Progress bars**
- **Modals**, **Tooltips**, **Alerts**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the demo accounts for testing

---

**Built with ❤️ using Next.js 15, TypeScript, and Tailwind CSS**