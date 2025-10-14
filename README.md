# Puja Budget Management System

A modern, responsive web application built with Next.js 14+ for managing Puja committee budgets, members, and expenses. Features real-time updates using Firebase Firestore and a clean, mobile-friendly interface.

## Features

- 📊 **Dashboard**: Overview of total collected, spent, remaining balance, upcoming tasks, and pending items
- 🎯 **Budget**: Plan and allocate budget for different items (Pandal, Mic Set, Lighting, etc.)
- 👤 **Members**: Track members with roles and contributions
- 💰 **Expenses**: Record and categorize expenses with budget item integration
- ✅ **Tasks & Volunteers**: Assign tasks to volunteers and track completion status
- 📦 **Inventory**: Track puja items (flowers, prasad, decorations) with received vs pending status
- 🎁 **Sponsors & Donations**: Track sponsors and donation amounts
- 🔄 **Real-time Updates**: Live data synchronization with Firebase
- 📱 **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- 🎨 **Modern UI**: Clean, professional design with Lucide React icons

## Tech Stack

- **Frontend**: Next.js 14+ with App Router
- **Styling**: Tailwind CSS
- **Database**: Firebase Firestore
- **State Management**: Zustand
- **Icons**: Lucide React
- **Language**: JavaScript (ES6+)

## Prerequisites

- Node.js 18+ installed on your system
- Firebase project with Firestore enabled
- Git (for cloning the repository)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd kali-puja-budget
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable Firestore Database
4. Go to Project Settings > General > Your apps
5. Add a web app and copy the configuration
6. Open `lib/firebaseConfig.js` and replace the placeholder configuration:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-actual-sender-id",
  appId: "your-actual-app-id"
};
```

### 4. Firestore Security Rules

Set up your Firestore security rules for development (⚠️ **Not for production**):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**For production**, implement proper authentication and security rules.

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
kali-puja-budget/
├── app/                    # Next.js App Router
│   ├── committees/         # Committees page
│   ├── expenses/          # Expenses page
│   ├── members/           # Members page
│   ├── globals.css        # Global styles
│   ├── layout.js          # Root layout
│   └── page.js            # Dashboard page
├── components/            # Reusable components
│   └── Header.js          # Navigation header
├── lib/                   # Utility libraries
│   ├── firebase.js        # Firebase operations
│   └── firebaseConfig.js  # Firebase configuration
├── store/                 # State management
│   └── useStore.js        # Zustand store
├── package.json           # Dependencies and scripts
├── tailwind.config.js     # Tailwind configuration
├── tsconfig.json          # TypeScript configuration
└── README.md              # This file
```

## Usage Guide

### Dashboard
- View total collected amount from member contributions and donations
- Monitor total expenses and remaining balance
- Track upcoming tasks and pending inventory items
- See recent members, expenses, tasks, and items

### Budget
- Plan and allocate budget for different items (Pandal, Mic Set, Lighting, etc.)
- Track budget vs actual spending with progress indicators
- Monitor remaining budget for each item
- Budget items automatically appear as expense categories

### Members
- Add members with roles and contribution amounts
- Track member contact information
- View total contributions from all members

### Expenses
- Record expenses with descriptions and amounts
- Categorize expenses using budget items and default categories
- Add notes and dates for better tracking
- Budget items automatically appear as expense categories

### Tasks & Volunteers
- Create and assign tasks to volunteers
- Set priority levels (High, Medium, Low)
- Track task completion status
- View upcoming and completed tasks

### Inventory
- Track puja items and supplies
- Categorize items (Flowers, Prasad, Decorations, etc.)
- Mark items as received or pending
- Estimate costs for budget planning

### Sponsors & Donations
- Record individual and business sponsors
- Track donation amounts and status
- Manage sponsor contact information
- Monitor received vs pending donations

## Data Structure

### Members Collection
```javascript
{
  name: "John Doe",
  role: "President",
  contribution: 5000,
  committee: "Main Committee",
  contact: "+1234567890",
  email: "john@example.com",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z"
}
```

### Expenses Collection
```javascript
{
  description: "Puja Materials",
  amount: 2500,
  category: "Puja Materials",
  date: "2024-01-01T00:00:00.000Z",
  notes: "Bought from local vendor",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z"
}
```

### Budget Collection
```javascript
{
  name: "Pandal",
  description: "Main pandal setup and decoration",
  allocatedAmount: 50000,
  notes: "Include lighting and basic decoration",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z"
}
```

### Tasks Collection
```javascript
{
  title: "Setup Decoration",
  description: "Arrange flowers and lights",
  assignedTo: "John Doe",
  priority: "high",
  dueDate: "2024-01-15T00:00:00.000Z",
  completed: false,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z"
}
```

### Inventory Collection
```javascript
{
  name: "Marigold Flowers",
  category: "Flowers & Garlands",
  quantity: 50,
  unit: "kg",
  estimatedCost: 2500,
  received: false,
  notes: "Order from local vendor",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z"
}
```

### Sponsors Collection
```javascript
{
  name: "ABC Company",
  type: "business",
  amount: 10000,
  contact: "+1234567890",
  email: "contact@abc.com",
  address: "123 Business St",
  received: true,
  notes: "Main sponsor for the event",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z"
}
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Add environment variables if needed
4. Deploy automatically

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

## Customization

### Styling
- Modify `tailwind.config.js` for theme customization
- Update `app/globals.css` for global styles
- Use Tailwind utility classes for component styling

### Features
- Add new expense categories in `app/expenses/page.js`
- Modify member roles in `app/members/page.js`
- Extend the data model in Firebase collections

## Troubleshooting

### Common Issues

1. **Firebase connection errors**: Verify your Firebase configuration
2. **Build errors**: Ensure all dependencies are installed
3. **Real-time updates not working**: Check Firestore security rules
4. **Styling issues**: Verify Tailwind CSS is properly configured

### Support

For issues and questions:
1. Check the browser console for errors
2. Verify Firebase configuration
3. Ensure all dependencies are up to date

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Powered by [Firebase](https://firebase.google.com/)
- Icons by [Lucide](https://lucide.dev/)