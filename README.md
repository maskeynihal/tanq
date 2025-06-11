# FuelTrack - Vehicle Fuel Efficiency Tracker

<img src="https://github.com/username/fueltrack/raw/main/public/logo.png" width="120" alt="FuelTrack Logo">

FuelTrack is a comprehensive web application designed to help users track and analyze their vehicle's fuel efficiency. With an intuitive interface and powerful analytics, FuelTrack makes it easy to monitor fuel consumption, costs, and efficiency metrics for multiple vehicles.

## Features

### Authentication
- Multiple authentication methods (Email, Phone, Google, Facebook)
- Persistent sessions using localStorage
- Protected routes with authentication checks
- Supabase authentication integration

### Vehicle Management
- Add, edit, and delete vehicles
- Support for different types of vehicles (cars, motorcycles, trucks, etc.)
- Customizable vehicle details (make, model, year, license plate, etc.)
- Support for various fuel and distance units (km/mi, liters/gallons)
- Vehicle image upload support
- Data persistence with Supabase

### Fuel Logging
- Easy-to-use fuel log entry form
- Record fuel purchases with detailed information
- Support for various fuel types
- Automatically calculated total costs
- Optional trip distance or odometer readings
- Additional details like gas station, notes, etc.
- Date and time recording
- Data persistence with Supabase

### Dashboard and Analytics
- Overview dashboard with key statistics
- Fuel efficiency calculations (MPG, km/L, L/100km)
- Monthly expense tracking and visualization
- Fuel price trend analysis
- Fuel type breakdown charts
- Vehicle usage comparison

### Log History
- Complete history of all fuel logs
- Filtering and sorting capabilities
- Search functionality
- Detailed view of each log
- Edit and delete functionality

### Statistics and Reporting
- Comprehensive statistical analysis
- Interactive charts and graphs
- Multi-vehicle comparisons
- Efficiency trends over time
- Cost analysis by vehicle, month, and fuel type

### Mobile-Optimized Experience
- Responsive design for all screen sizes
- Mobile-specific navigation
- Touch-friendly interface
- Native app-like experience

## Installation

### Prerequisites
- Node.js (v18 or later)
- npm or yarn
- Supabase account

### Steps

1. Clone the repository:
\`\`\`bash
git clone https://github.com/username/fueltrack.git
cd fueltrack
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
# or
yarn install
\`\`\`

3. Configure environment variables:
Create a `.env.local` file in the root directory with the following variables:
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
\`\`\`

4. Set up the database:
   - Create a new Supabase project
   - Run the SQL script in `scripts/create-tables.sql` to create the necessary tables
   - Configure RLS (Row Level Security) policies for your tables

5. Run the development server:
\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Usage

### First time setup
1. Register an account using email, phone, or social login
2. Add your first vehicle with details like make, model, and fuel type
3. Add your first fuel log to start tracking efficiency

### Regular use
1. Log your fuel purchases whenever you refill
2. View your dashboard for real-time statistics
3. Analyze your efficiency and cost trends in the statistics page
4. Manage your vehicles as needed

## Technology Stack

- **Frontend Framework:** Next.js 13+ (App Router)
- **UI Components:** Shadcn UI (built on Radix UI)
- **Styling:** Tailwind CSS
- **State Management:** React Hooks
- **Form Management:** TanStack Form
- **Form Validation:** Zod
- **Charts:** Recharts
- **Animations:** Framer Motion
- **Date Handling:** date-fns
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth

## Project Structure

\`\`\`
fueltrack/
├── app/                  # Next.js App Router structure
│   ├── dashboard/        # Dashboard page
│   ├── logs/             # Logs pages (list, add, edit)
│   ├── settings/         # User settings
│   ├── statistics/       # Statistics and analysis
│   ├── vehicles/         # Vehicle management
│   ├── globals.css       # Global styles
│   └── layout.tsx        # Root layout
├── components/           # Reusable React components
│   ├── navigation/       # Navigation components
│   ├── ui/               # UI components
│   └── ...
├── lib/                  # Utility functions and services
│   ├── log-service.ts    # Fuel log data service
│   ├── vehicle-service.ts # Vehicle data service
│   ├── supabase.ts       # Supabase client
│   ├── database.types.ts # Supabase database types
│   ├── types.ts          # TypeScript type definitions
│   └── utils.ts          # Helper utilities
├── scripts/              # Database scripts
│   └── create-tables.sql # SQL script for creating tables
└── public/               # Static assets
\`\`\`

## Roadmap

- **Sync Capabilities**: Cloud syncing between devices
- **Export/Import**: Data export and import functionality
- **Notifications**: Reminders for regular maintenance
- **Maintenance Tracking**: Vehicle service and maintenance logs
- **Trip Planning**: Fuel cost estimations for planned trips
- **Gamification**: Achievements and goals for improved efficiency

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Shadcn UI](https://ui.shadcn.com/) for the component library
- [Next.js](https://nextjs.org/) for the application framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [TanStack Form](https://tanstack.com/form) for form management
- [Supabase](https://supabase.com/) for database and authentication
- [Recharts](https://recharts.org/) for data visualization
- [Framer Motion](https://www.framer.com/motion/) for animations
- Icons from [Lucide](https://lucide.dev/)
\`\`\`

Let's create a SQL script file for setting up the database tables:
