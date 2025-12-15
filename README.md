# Wealth

A personal finance management application that helps you track expenses, manage budgets, and monitor investments in one place.

**[try Wealth app now](https://wealth.anirudhjwala.in/)**

## Features

**Expense Management**

- Track daily expenses with categories and descriptions
- Set up recurring transactions for bills and subscriptions (weekly, monthly, yearly)
- Filter and search through transaction history
- Advanced filtering by ledger, category, type, and date range
- Sort transactions by date, amount, description, category, or type
- Pagination with customizable items per page (5, 10, 20, 50)
- View spending patterns with visual charts and analytics
- Add notes to transactions for additional context
- Visual indicators for recurring transactions

**Budget Management**

- Create multiple ledgers for different purposes
- Organize expenses by personal, family, or loan categories
- Support for multiple currencies (INR, USD, EUR, GBP)
- Monitor spending against budget limits
- Track income and expense flows
- Filter transactions by specific ledger

**Investment Tracking**

- Record investments across different asset types
- Support for Fixed Deposits, Mutual Funds, Stocks, Gold, Real Estate, Cryptocurrency, and more
- Track current value vs purchase price
- Monitor profit and loss on investments with percentage calculations
- Track purchase dates and maturity dates
- Add notes to investments for additional context
- Search and filter investments by name, type, or notes
- Sort investments by name, value, profit/loss, or type
- Expandable asset cards with detailed information

**Analytics & Reporting**

- Comprehensive dashboard with key financial metrics
- Monthly income and expense trends with time range filters (3, 6, 12 months)
- Category-wise spending breakdown with pie charts
- Savings rate calculation
- Net savings tracking
- Portfolio value and performance metrics
- Average return percentage across all investments
- Total profit/loss tracking for investments
- Visual trend indicators (trending up/down)

**User Experience**

- Clean, responsive design that works on all devices
- Mobile-optimized with drawer and dialog patterns
- Dark and light theme support
- Secure Google OAuth authentication
- Real-time data synchronization
- Breadcrumb navigation for easy orientation
- Expandable transaction and asset cards for detailed views
- User profile settings with display name management

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
