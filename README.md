# HairLegance Appointment Booking System

A modern, responsive web application for managing hair salon appointments. Built with Next.js, MongoDB, and TypeScript.

## Features

- 📅 Online Appointment Booking
- 👩‍💼 Admin Dashboard
- 📊 Appointment Management
- 📆 Available Dates Management
- 🔐 Secure Authentication
- 📱 Responsive Design
- 💅 Modern UI with Tailwind CSS

## Tech Stack

- **Frontend:**
  - Next.js 14
  - React
  - TypeScript
  - Tailwind CSS
  - Lucide Icons
  - React DatePicker

- **Backend:**
  - Next.js API Routes
  - MongoDB with Mongoose
  - NextAuth.js for Authentication

- **Development Tools:**
  - ESLint
  - Prettier
  - TypeScript
  - PostCSS
  - Git

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Database
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/hairlegance-gh-webapp.git
cd hairlegance-gh-webapp
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory with the following variables:
```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_admin_password
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
hairlegance-gh-webapp/
├── app/
│   ├── admin/           # Admin dashboard pages
│   ├── api/            # API routes
│   ├── components/     # React components
│   ├── lib/           # Utility functions and configurations
│   ├── models/        # MongoDB models
│   └── ...
├── public/            # Static files
└── ...
```

## Key Features Explained

### Appointment Booking
- Users can select available dates
- Form validation for required fields
- Optional social media contact information
- Real-time availability checking

### Admin Dashboard
- Secure admin login
- View all appointments
- Manage appointment status
- Add/remove available dates
- Protected routes

### Data Management
- MongoDB integration
- Mongoose models for data structure
- API routes for CRUD operations
- Error handling and validation

## API Routes

- `GET /api/appointments` - Get all appointments
- `POST /api/appointments` - Create new appointment
- `PUT /api/appointments` - Update appointment status
- `GET /api/available-dates` - Get available dates
- `POST /api/available-dates` - Add new available date
- `DELETE /api/available-dates` - Remove available date

## Authentication

- Protected admin routes using NextAuth.js
- Credential-based authentication
- Session management
- Secure cookie handling

## Styling

- Tailwind CSS for styling
- Responsive design
- Custom color scheme
- Modern UI components

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Format code
npm run format

# Lint code
npm run lint
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Your Name - [@yourusername](https://github.com/yourusername)

Project Link: [https://github.com/yourusername/hairlegance-gh-webapp](https://github.com/yourusername/hairlegance-gh-webapp) 