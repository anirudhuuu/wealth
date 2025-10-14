-- Database views for complex aggregations and better performance

-- Monthly transaction summary view
CREATE OR REPLACE VIEW monthly_transaction_summary AS
SELECT 
  user_id,
  DATE_TRUNC('month', date) as month,
  type,
  SUM(amount) as total_amount,
  COUNT(*) as transaction_count,
  AVG(amount) as avg_amount
FROM transactions
GROUP BY user_id, DATE_TRUNC('month', date), type;

-- Category spending summary view
CREATE OR REPLACE VIEW category_spending_summary AS
SELECT 
  user_id,
  category,
  type,
  SUM(amount) as total_amount,
  COUNT(*) as transaction_count,
  AVG(amount) as avg_amount,
  MIN(date) as first_transaction_date,
  MAX(date) as last_transaction_date
FROM transactions
GROUP BY user_id, category, type;

-- Asset performance view
CREATE OR REPLACE VIEW asset_performance AS
SELECT 
  user_id,
  id,
  name,
  type,
  current_value,
  purchase_value,
  purchase_date,
  maturity_date,
  CASE 
    WHEN purchase_value IS NOT NULL AND purchase_value > 0 
    THEN ((current_value - purchase_value) / purchase_value) * 100
    ELSE NULL
  END as roi_percentage,
  CASE 
    WHEN purchase_value IS NOT NULL 
    THEN current_value - purchase_value
    ELSE NULL
  END as absolute_gain_loss,
  CASE 
    WHEN maturity_date IS NOT NULL 
    THEN maturity_date - CURRENT_DATE
    ELSE NULL
  END as days_to_maturity
FROM assets;

-- User financial health view
CREATE OR REPLACE VIEW user_financial_health AS
WITH monthly_totals AS (
  SELECT 
    user_id,
    DATE_TRUNC('month', date) as month,
    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses
  FROM transactions
  GROUP BY user_id, DATE_TRUNC('month', date)
),
asset_totals AS (
  SELECT 
    user_id,
    SUM(current_value) as total_assets
  FROM assets
  GROUP BY user_id
)
SELECT 
  mt.user_id,
  mt.month,
  mt.total_income,
  mt.total_expenses,
  mt.total_income - mt.total_expenses as net_savings,
  CASE 
    WHEN mt.total_income > 0 
    THEN ((mt.total_income - mt.total_expenses) / mt.total_income) * 100
    ELSE 0
  END as savings_rate,
  at.total_assets,
  LAG(mt.total_income - mt.total_expenses) OVER (
    PARTITION BY mt.user_id 
    ORDER BY mt.month
  ) as previous_month_savings
FROM monthly_totals mt
LEFT JOIN asset_totals at ON mt.user_id = at.user_id;

-- Note: Indexes cannot be created directly on views in PostgreSQL
-- The underlying tables (transactions, assets) already have the necessary indexes
-- for optimal view performance
