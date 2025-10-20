# QSO Logger

A web-based QSO logger for amateur radio operators to track and manage contacts with ADIF file support. Features interactive world maps showing contact locations, grid square conversion, and duplicate detection for clean record keeping.

## Features

- 📡 **QSO Management** - Create, edit, and delete amateur radio contact records
- 📁 **ADIF Support** - Import and export contacts in ADIF format (.adi files)
- 🗺️ **Interactive Maps** - View all contacts on a world map with Leaflet
- 📍 **Grid Square Support** - Maidenhead locator system with coordinate conversion
- 🎨 **Color-Coded Markers** - Visual distinction by operating mode (FM, SSB, Digital, CW)
- 🔍 **Duplicate Detection** - Automatic detection during import based on callsign, frequency, and datetime
- 🌍 **Timezone Support** - Configure your preferred timezone for logging
- ⚙️ **User Settings** - Store station callsign, default transmit power, and timezone preferences
- 🔐 **Google Authentication** - Secure login with user-specific data isolation
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile devices

## Prerequisites

- Node.js 18+
- MongoDB (local or cloud instance)
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

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:
   ```env
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here
   MONGODB_URI=mongodb://localhost:27017/qso-logger
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

4. **Set up Google OAuth**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
   - Copy the Client ID and Client Secret to your `.env.local`

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## Docker Installation

For easier deployment using Docker:

1. **Clone the repository**
   ```bash
   git clone https://github.com/talhaakkaya/ta-qso-logger.git
   cd ta-qso-logger
   ```

2. **Set up environment variables**

   Create a `.env` file in the root directory:
   ```env
   NEXTAUTH_SECRET=your-secret-key-here
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

   You can use `.env.docker` as a template.

3. **Set up Google OAuth**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
   - Copy the Client ID and Client Secret to your `.env` file

4. **Start the application with Docker Compose**
   ```bash
   docker-compose up -d
   ```

   This will start:
   - MongoDB database on port 27017
   - Next.js application on port 3000

5. **View logs** (optional)
   ```bash
   docker-compose logs -f
   ```

6. **Stop the application**
   ```bash
   docker-compose down
   ```

7. **Stop and remove volumes** (deletes all data)
   ```bash
   docker-compose down -v
   ```

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
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/qso-logger` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | From Google Cloud Console |

## Development

### Project Structure

```
src/
├── app/              # Next.js App Router pages and API routes
├── components/       # React components
│   ├── Dashboard/    # Main dashboard components
│   ├── Layout/       # Header, Sidebar
│   ├── Map/          # Leaflet map components
│   ├── Modals/       # Modal dialogs
│   └── Table/        # QSO table components
├── contexts/         # React context providers
├── hooks/            # Custom React hooks
├── models/           # MongoDB Mongoose models
├── services/         # Business logic (ADIF, API)
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Amateur radio community for ADIF specifications
- [Leaflet](https://leafletjs.com/) for mapping capabilities
- [OpenStreetMap](https://www.openstreetmap.org/) contributors for map tiles

---

**73!** Happy logging!
