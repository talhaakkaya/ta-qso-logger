# QSO Logger

A modern web-based QSO logger for amateur radio operators to track and manage contacts with ADIF and CSV file support. Features interactive world maps, dark/light theme, grid square conversion, and a clean responsive interface built with Next.js and shadcn/ui.

## Features

- 📡 **QSO Management** - Create, edit, and delete amateur radio contact records
- 📚 **Multiple Logbooks** - Organize QSOs into separate logbooks (contests, DXpeditions, portable operations, etc.)
- 📁 **ADIF Support** - Import and export contacts in ADIF format (.adi files)
- 📊 **CSV Import/Export** - Import and export contacts in CSV format with flexible column mapping
- 📖 **Logbook Selection** - Choose destination logbook when importing ADIF or CSV files
- 🗺️ **Interactive Maps** - View all contacts on a world map with Leaflet
- 📍 **Grid Square Support** - Maidenhead locator system with coordinate conversion
- 🎨 **Color-Coded Markers** - Visual distinction by operating mode (FM, SSB, Digital, CW)
- 🔎 **Duplicate Detection** - Automatic detection during import based on callsign, frequency, and datetime
- 🌍 **Timezone Support** - Configure your preferred timezone for logging
- ⚙️ **User Settings** - Store station callsign, default transmit power, and timezone preferences
- 🔐 **Google Authentication** - Secure login with user-specific data isolation
- 🌓 **Dark/Light Mode** - Beautiful theme support with system preference detection
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile devices with expandable table rows
- 🎯 **Simple & Advanced Modes** - Beginner-friendly simple mode or advanced mode for experienced operators

## Recent Updates

### UI Modernization (Latest)
- ✨ **Migrated to shadcn/ui + Tailwind CSS** - Modern, accessible component library replacing Bootstrap
- 🎨 **New Login Page Design** - Light-themed landing page with dark mode support
- 🌓 **Dark/Light Theme Toggle** - Seamless theme switching across the entire application
- 📱 **Enhanced Mobile Experience** - Improved responsive tables with expandable rows

### Code Refactoring
- 🏗️ **Service Layer Architecture** - Extracted business logic into dedicated services:
  - `csvService` - CSV parsing and import/export logic
  - `locationService` - Nominatim API integration for location search
- 🎣 **Custom React Hooks** - Reusable hooks for cleaner code:
  - `useUserMode` - User mode state management
  - `useModal` - Generic modal state handling
  - `useLocationSearch` - Location search functionality
  - `useQSOActions` - Consolidated CRUD operations
- ♻️ **Shared Components** - Eliminated code duplication with reusable components
- 📉 **Reduced File Sizes** - Major components reduced by 12-25% through refactoring
- 🧪 **Improved Testability** - Better separation of concerns and modular architecture

### Technology Stack Updates
- ⬆️ **Next.js 15.5.6** - Latest features and performance improvements
- ⬆️ **React 19.1.0** - Latest React version
- 📦 **@tanstack/react-table** - Advanced table functionality with sorting and pagination
- 🎭 **next-themes** - Seamless dark mode implementation
- 🎨 **lucide-react** - Beautiful, consistent icon set

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Google OAuth 2.0 credentials

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/talhaakkaya/ta-qso-logger.git
   cd ta-qso-logger
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up PostgreSQL database**
   ```bash
   # Create a PostgreSQL database
   createdb qso_logger

   # Run Prisma migrations
   npx prisma migrate deploy

   # Generate Prisma Client
   npx prisma generate
   ```

4. **Set up environment variables**

   Create a `.env.local` file in the root directory:
   ```env
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here
   DATABASE_URL=postgresql://user:password@localhost:5432/qso_logger
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

5. **Set up Google OAuth**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
   - Copy the Client ID and Client Secret to your `.env.local`

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Logging QSOs

1. Click the **"+ Yeni QSO"** button in the dashboard
2. Fill in contact details (callsign, frequency, mode, etc.)
3. Optionally enter a grid square to see the location on the map
4. Click **Save** to add the contact to your log

### Importing ADIF Files

1. Click **"İçe Aktar"** in the sidebar
2. Select an ADIF file (.adi or .adif)
3. Click **"İçe Aktar"** to process the file
4. Duplicates (same callsign + frequency + datetime) will be automatically skipped

### Exporting ADIF Files

1. Click **"Dışa Aktar"** in the sidebar
2. Your QSO log will be downloaded in ADIF format

### Importing CSV Files

1. Click **"İçe Aktar (CSV)"** in the sidebar
2. Select a CSV file containing your QSO records
3. Map CSV columns to QSO fields (callsign, datetime, frequency, etc.)
4. Click **"İçe Aktar"** to process the file
5. Records will be validated and imported into your log

### Exporting CSV Files

1. Click **"Dışa Aktar"** in the sidebar
2. Choose CSV format from the export options
3. Your QSO log will be downloaded as a CSV file

### Viewing Contact Map

1. Click **"QSO Haritası"** in the sidebar
2. See all contacts with grid squares plotted on an interactive world map
3. Click markers to see callsign and frequency
4. Markers are color-coded by operating mode

### Settings

1. Click **"Ayarlar"** in the sidebar
2. Configure:
   - **Station Callsign** - Your call sign for ADIF exports
   - **Default Power** - Default transmit power for new QSOs
   - **Timezone** - Your preferred timezone for logging

## Configuration

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXTAUTH_URL` | URL where the app is hosted | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Secret for NextAuth.js session encryption | Generate with `openssl rand -base64 32` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:password@localhost:5432/qso_logger` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | From Google Cloud Console |

## Development

### Project Structure

```
src/
├── app/              # Next.js App Router pages and API routes
│   ├── (authenticated)/      # Protected routes
│   ├── api/                  # API endpoints (QSO, logbooks, auth, etc.)
│   └── auth/                 # Authentication pages
├── components/       # React components
│   ├── Dashboard/    # Main dashboard components
│   ├── Filters/      # Search and filter components
│   ├── Layout/       # Header, Sidebar, AppSidebar, ThemeToggle
│   ├── Modals/       # Modal dialogs (QSO, Import, Settings, Logbooks, etc.)
│   ├── Providers/    # Theme and context providers
│   ├── shared/       # Reusable shared components
│   ├── Table/        # QSO table components with @tanstack/react-table
│   └── ui/           # shadcn/ui components (Button, Card, Dialog, etc.)
├── contexts/         # React context providers (QSOContext)
├── hooks/            # Custom React hooks
│   ├── useModal.ts           # Generic modal state management
│   ├── useQSOActions.ts      # CRUD operations with notifications
│   ├── useLocationSearch.ts  # Location search functionality
│   ├── useUserMode.ts        # User mode state (simple/advanced)
│   ├── useToast.ts           # Toast notifications
│   └── use-mobile.tsx        # Mobile detection hook
├── lib/              # Utility libraries
│   ├── prisma.ts             # Prisma Client instance
│   └── user-helpers.ts       # User/profile helper functions
├── services/         # Business logic
│   ├── adifService.ts        # ADIF import/export
│   ├── apiService.ts         # API communication
│   ├── csvService.ts         # CSV parsing and import
│   └── locationService.ts    # Nominatim API integration
├── types/            # TypeScript type definitions
└── utils/            # Utility functions (grid square, timezone, etc.)

prisma/
└── schema.prisma     # Prisma schema definition and database models
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Tech Stack

**Frontend:**
- Next.js 15.5.6 (App Router)
- React 19.1.0
- TypeScript
- Tailwind CSS 3.x
- shadcn/ui (Radix UI primitives)
- lucide-react (icons)
- next-themes (dark mode)
- @tanstack/react-table (advanced tables)

**Backend:**
- Next.js API Routes
- PostgreSQL 14+
- Prisma ORM
- NextAuth.js v5 (Google OAuth)

**Mapping & Data:**
- Leaflet & react-leaflet (interactive maps)
- OpenStreetMap Nominatim API (location search)
- papaparse (CSV parsing)

**Development:**
- ESLint
- Prettier
- TypeScript strict mode

## Contributing

We welcome contributions! Whether you're fixing bugs, adding features, or improving documentation, your help is appreciated.

### Getting Started

1. **Fork the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/ta-qso-logger.git
   cd ta-qso-logger
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up your database**
   - Install PostgreSQL 14+
   - Create a database: `createdb qso_logger`
   - Copy `.env.example` to `.env.local` and configure DATABASE_URL
   - Run migrations: `npx prisma migrate deploy`
   - Generate Prisma Client: `npx prisma generate`

4. **Start development server**
   ```bash
   npm run dev
   ```

### Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, readable code
   - Follow existing code style and patterns
   - Add comments for complex logic

3. **Test your changes**
   - Run type check: `npm run type-check`
   - Run linting: `npm run lint`
   - Build the project: `npm run build`
   - Test functionality manually in the browser

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "Brief description of your changes"
   ```

5. **Push and create a Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```
   Then open a Pull Request on GitHub with a clear description of your changes.

### Code Style Guidelines

- Use TypeScript for type safety
- Follow existing component patterns (shadcn/ui components)
- Use meaningful variable and function names
- Keep functions small and focused
- Add proper error handling
- Comment complex logic

### Database Changes

If your changes require database schema updates:

1. Modify `prisma/schema.prisma`
2. Create migration: `npx prisma migrate dev --name your_migration_name`
3. Test migration thoroughly
4. Include migration files in your PR

### Reporting Issues

Found a bug or have a feature request?

1. Check existing issues first
2. Create a new issue with:
   - Clear title and description
   - Steps to reproduce (for bugs)
   - Expected vs actual behavior
   - Screenshots if applicable
   - Your environment (OS, browser, Node version)

### Questions?

Feel free to open a discussion or issue if you need help!

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Amateur radio community for ADIF specifications
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Radix UI](https://www.radix-ui.com/) for accessible UI primitives
- [Prisma](https://www.prisma.io/) for the excellent ORM
- [Leaflet](https://leafletjs.com/) for mapping capabilities
- [OpenStreetMap](https://www.openstreetmap.org/) contributors for map tiles and Nominatim API
- [TanStack Table](https://tanstack.com/table) for advanced table functionality
- [Lucide](https://lucide.dev/) for the icon set

---

**73!** Happy logging!
