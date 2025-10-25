# Expense Tracker

A personal finance management application that helps you track expenses, manage budgets, and monitor investments in one place.

## Features

**Expense Management**

- Track daily expenses with categories and descriptions
- Set up recurring transactions for bills and subscriptions
- Filter and search through transaction history
- View spending patterns with visual charts

**Budget Management**

- Create multiple budget books for different purposes
- Organize expenses by personal, family, or loan categories
- Monitor spending against budget limits
- Track income and expense flows

**Investment Tracking**

- Record investments across different asset types
- Track current value vs purchase price
- Monitor profit and loss on investments
- Support for stocks, mutual funds, gold, real estate, and more

**User Experience**

- Clean, responsive design that works on all devices
- Dark and light theme support
- Secure Google OAuth authentication
- Real-time data synchronization

## Getting Started

1. Clone the repository
2. Install dependencies: `bun install`
3. Set up environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Run database migrations from the `scripts/` directory
5. Start the development server: `bun dev`
