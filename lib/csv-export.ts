import type { Asset, Ledger, Transaction } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

/**
 * CSV Export Utilities
 * Provides functions to export data as CSV files
 */

/**
 * Format currency for CSV export (simple number with 2 decimal places)
 */
function formatCurrencyForCsv(amount: number): string {
  return amount.toFixed(2);
}

/**
 * Escapes CSV field values to handle commas, quotes, and newlines
 */
function escapeCsvField(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return "";
  }
  
  const stringValue = String(value);
  
  // If the value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
}

/**
 * Converts array of objects to CSV string
 */
function arrayToCsv<T extends Record<string, any>>(
  data: T[],
  headers: string[],
  getRowData: (item: T) => (string | number | null | undefined)[]
): string {
  if (data.length === 0) {
    return headers.join(",");
  }

  const csvRows = [
    // Header row
    headers.map(escapeCsvField).join(","),
    // Data rows
    ...data.map(item => 
      getRowData(item).map(escapeCsvField).join(",")
    )
  ];

  return csvRows.join("\n");
}

/**
 * Downloads a CSV file
 */
function downloadCsv(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

/**
 * Export transactions to CSV
 */
export function exportTransactionsToCsv(
  transactions: Transaction[],
  ledgers: Ledger[],
  filename?: string
): void {
  const headers = [
    "Date",
    "Description",
    "Category",
    "Type",
    "Amount",
    "Ledger",
    "Notes"
  ];

  const getRowData = (transaction: Transaction) => {
    const ledger = ledgers.find(l => l.id === transaction.ledger_id);
    return [
      formatDate(transaction.date),
      transaction.description,
      transaction.category,
      transaction.type,
      formatCurrencyForCsv(Number(transaction.amount)),
      ledger?.name || "Unknown",
      transaction.notes || ""
    ];
  };

  const csvContent = arrayToCsv(transactions, headers, getRowData);
  const defaultFilename = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
  
  downloadCsv(csvContent, filename || defaultFilename);
}

/**
 * Export assets to CSV
 */
export function exportAssetsToCsv(
  assets: Asset[],
  filename?: string
): void {
  const headers = [
    "Name",
    "Type",
    "Current Value",
    "Purchase Value",
    "Purchase Date",
    "Maturity Date",
    "Currency",
    "Gain/Loss",
    "Gain/Loss %",
    "Notes"
  ];

  const getRowData = (asset: Asset) => {
    const currentValue = Number(asset.current_value);
    const purchaseValue = Number(asset.purchase_value);
    const gain = currentValue - purchaseValue;
    const gainPercentage = purchaseValue > 0 ? (gain / purchaseValue) * 100 : 0;

    return [
      asset.name,
      asset.type,
      formatCurrencyForCsv(currentValue),
      formatCurrencyForCsv(purchaseValue),
      asset.purchase_date ? formatDate(asset.purchase_date) : "",
      asset.maturity_date ? formatDate(asset.maturity_date) : "",
      asset.currency,
      formatCurrencyForCsv(gain),
      `${gainPercentage.toFixed(2)}%`,
      asset.notes || ""
    ];
  };

  const csvContent = arrayToCsv(assets, headers, getRowData);
  const defaultFilename = `assets_${new Date().toISOString().split('T')[0]}.csv`;
  
  downloadCsv(csvContent, filename || defaultFilename);
}

/**
 * Export ledgers to CSV
 */
export function exportLedgersToCsv(
  ledgers: Ledger[],
  transactions: Transaction[],
  filename?: string
): void {
  const headers = [
    "Name",
    "Type",
    "Currency",
    "Total Income",
    "Total Expenses",
    "Net Amount",
    "Transaction Count",
    "Created Date"
  ];

  const getRowData = (ledger: Ledger) => {
    const ledgerTransactions = transactions.filter(t => t.ledger_id === ledger.id);
    
    const totalIncome = ledgerTransactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const totalExpenses = ledgerTransactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const netAmount = totalIncome - totalExpenses;

    return [
      ledger.name,
      ledger.type,
      ledger.currency,
      formatCurrencyForCsv(totalIncome),
      formatCurrencyForCsv(totalExpenses),
      formatCurrencyForCsv(netAmount),
      ledgerTransactions.length,
      formatDate(ledger.created_at)
    ];
  };

  const csvContent = arrayToCsv(ledgers, headers, getRowData);
  const defaultFilename = `ledgers_${new Date().toISOString().split('T')[0]}.csv`;
  
  downloadCsv(csvContent, filename || defaultFilename);
}

/**
 * Export all data to separate CSV files
 */
export function exportAllDataToCsv(
  transactions: Transaction[],
  assets: Asset[],
  ledgers: Ledger[]
): void {
  const datePrefix = new Date().toISOString().split('T')[0];
  
  exportTransactionsToCsv(transactions, ledgers, `${datePrefix}_transactions.csv`);
  exportAssetsToCsv(assets, `${datePrefix}_assets.csv`);
  exportLedgersToCsv(ledgers, transactions, `${datePrefix}_ledgers.csv`);
}
