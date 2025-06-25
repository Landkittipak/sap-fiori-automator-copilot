
# SAP Copilot - Intelligent SAP Automation Platform

SAP Copilot is a modern web application that provides intelligent automation capabilities for SAP systems. Built with React, TypeScript, and Supabase, it offers a comprehensive platform for creating, managing, and executing SAP automation tasks.

## 🚀 Features

### Core Functionality
- **Task Automation**: Execute SAP operations with pre-built and custom templates
- **Real-time Monitoring**: Track task execution with live progress updates
- **Template Management**: Create, edit, and organize automation templates
- **Run History**: Comprehensive logging and tracking of all executions

### Advanced Features
- **Analytics Dashboard**: Performance insights, success rates, and usage analytics
- **Template Marketplace**: Discover and install community-created templates
- **Bulk Operations**: Execute multiple tasks efficiently with CSV upload
- **Export & Reports**: Download execution data in multiple formats
- **User Profile Management**: Customizable preferences and settings

### Technical Features
- **Authentication**: Secure user authentication with email/password and Google OAuth
- **Database Integration**: Full Supabase integration with Row Level Security
- **Real-time Updates**: Live task status updates using Supabase Realtime
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Type Safety**: Full TypeScript implementation

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Authentication, Real-time)
- **Charts**: Recharts for analytics visualization
- **State Management**: React hooks, Supabase client
- **Build Tool**: Vite for fast development and building

## 📋 Prerequisites

- Node.js 18+ or Bun
- A Supabase account and project
- Google OAuth credentials (optional, for Google sign-in)

## ⚡ Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd sap-copilot
npm install  # or: bun install
```

### 2. Environment Setup

The application uses Supabase for backend services. The Supabase configuration is already included in the codebase:

- **Supabase URL**: `https://psqdqpazmvrrhkyiqwom.supabase.co`
- **Public Key**: Already configured in `src/integrations/supabase/client.ts`

### 3. Database Setup

The database schema is automatically created through Supabase migrations. The following tables are included:

- `profiles` - User profile information
- `templates` - Automation templates
- `task_runs` - Task execution records
- `execution_logs` - Detailed execution logs

### 4. Authentication Configuration

#### Email Authentication
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard/project/psqdqpazmvrrhkyiqwom/auth/url-configuration)
2. Set your site URL and redirect URLs:
   - **Site URL**: Your application URL (e.g., `https://yourdomain.com`)
   - **Redirect URLs**: Add your application URL

#### Google OAuth (Optional)
1. Go to [Supabase Auth Providers](https://supabase.com/dashboard/project/psqdqpazmvrrhkyiqwom/auth/providers)
2. Enable Google provider
3. Add your Google OAuth credentials

#### Disable Email Confirmation (Development)
For easier testing, you can disable email confirmation:
1. Go to [Auth Settings](https://supabase.com/dashboard/project/psqdqpazmvrrhkyiqwom/auth/url-configuration)
2. Turn off "Enable email confirmations"

### 5. Run the Application

```bash
npm run dev  # or: bun dev
```

The application will be available at `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── analytics/      # Analytics dashboard components
│   ├── bulk/          # Bulk operations components
│   ├── export/        # Export functionality components
│   ├── marketplace/   # Template marketplace components
│   ├── profile/       # User profile components
│   └── ui/           # Reusable UI components
├── hooks/              # Custom React hooks
├── integrations/       # External service integrations
│   └── supabase/      # Supabase client and types
├── services/          # Business logic services
└── pages/             # Application pages
```

## 🔧 Configuration

### Supabase Configuration

The application is pre-configured to work with the included Supabase project. If you need to use your own Supabase project:

1. Update `src/integrations/supabase/client.ts` with your project credentials
2. Run the database migrations from `supabase/migrations/`
3. Update the authentication settings in your Supabase dashboard

### Environment Variables

No environment variables are required for basic functionality. All configuration is handled through the Supabase client.

## 🚀 Deployment

### Option 1: Lovable Platform (Recommended)
The application is ready to deploy on the Lovable platform:
1. Click the "Publish" button in the Lovable editor
2. Your app will be automatically deployed and accessible

### Option 2: Custom Deployment
The application can be deployed to any static hosting service:

```bash
npm run build  # or: bun run build
```

Deploy the `dist/` folder to your hosting service of choice:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

### Domain Configuration
For custom domains, update the Supabase authentication settings:
1. Add your domain to the allowed redirect URLs
2. Update the site URL in Supabase settings

## 📊 Usage Guide

### Getting Started
1. **Sign Up**: Create an account using email/password or Google OAuth
2. **Explore Templates**: Browse pre-built automation templates
3. **Submit Tasks**: Execute automation tasks with the task submission interface
4. **Monitor Progress**: Track executions in real-time with the run history

### Advanced Features
- **Analytics**: View performance metrics and usage insights
- **Bulk Operations**: Upload CSV files to execute multiple tasks
- **Template Marketplace**: Install community templates
- **Export Data**: Download execution logs and analytics reports

## 🔒 Security

- **Row Level Security**: All database operations are secured with RLS policies
- **Authentication**: Secure user authentication through Supabase Auth
- **Data Isolation**: Users can only access their own data
- **HTTPS**: All communications are encrypted in transit

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Check the [Supabase Dashboard](https://supabase.com/dashboard/project/psqdqpazmvrrhkyiqwom) for database issues
2. Verify authentication settings in Supabase
3. Check browser console for error messages
4. Ensure all dependencies are installed correctly

## 🔮 Roadmap

- [ ] Real SAP system integration
- [ ] Advanced workflow automation
- [ ] Mobile application
- [ ] API endpoints for external integrations
- [ ] Advanced role-based access control
- [ ] Multi-tenant support

---

**Built with ❤️ using React, TypeScript, and Supabase**
