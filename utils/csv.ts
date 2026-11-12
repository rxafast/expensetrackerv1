import { Transaction, Category, Budget } from '../types';

// Function to escape CSV fields to handle commas and quotes
const escapeCsvField = (field: string | number): string => {
  const stringField = String(field);
  if (/[",\n\r]/.test(stringField)) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }
  return stringField;
};

const downloadCSV = (csvString: string, filename: string): void => {
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-s-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export const exportTransactionsToCSV = (transactions: Transaction[]): void => {
  const headers = ['type', 'category', 'amount', 'date', 'description'];
  const csvRows = [headers.join(',')];

  for (const transaction of transactions) {
    const values = [
      escapeCsvField(transaction.type),
      escapeCsvField(transaction.category),
      escapeCsvField(transaction.amount),
      escapeCsvField(transaction.date),
      escapeCsvField(transaction.description),
    ];
    csvRows.push(values.join(','));
  }

  downloadCSV(csvRows.join('\n'), `transactions-export-${new Date().toISOString().split('T')[0]}.csv`);
};

export const parseTransactionsCSV = (csvString: string): Omit<Transaction, 'id'>[] => {
    const transactions: Omit<Transaction, 'id'>[] = [];
    const lines = csvString.trim().split('\n');

    if (lines.length < 2) {
        throw new Error("CSV file is empty or contains only a header.");
    }
    
    const headers = lines[0].trim().toLowerCase().split(',');
    const expectedHeaders = ['type', 'category', 'amount', 'date', 'description'];
    if (JSON.stringify(headers) !== JSON.stringify(expectedHeaders)) {
        throw new Error(`Invalid CSV headers. Expected: ${expectedHeaders.join(',')}`);
    }

    for (let i = 1; i < lines.length; i++) {
        // This is a very basic parser. It won't handle commas within quoted fields.
        const values = lines[i].trim().split(',');
        if (values.length !== 5) {
            console.warn(`Skipping malformed CSV row: ${lines[i]}`);
            continue;
        }

        const [type, category, amount, date, description] = values;
        
        if ((type === 'income' || type === 'expense') && !isNaN(parseFloat(amount)) && new Date(date).toString() !== 'Invalid Date') {
            transactions.push({
                type: type as 'income' | 'expense',
                category,
                amount: parseFloat(amount),
                date: new Date(date).toISOString(),
                description,
            });
        } else {
             console.warn(`Skipping invalid transaction data in row: ${lines[i]}`);
        }
    }
    return transactions;
};

export const exportCategoriesToCSV = (categories: Category[]): void => {
    const headers = ['name', 'color'];
    const csvRows = [headers.join(',')];

    for (const category of categories) {
        const values = [
            escapeCsvField(category.name),
            escapeCsvField(category.color),
        ];
        csvRows.push(values.join(','));
    }

    downloadCSV(csvRows.join('\n'), `categories-export-${new Date().toISOString().split('T')[0]}.csv`);
};

export const parseCategoriesCSV = (csvString: string): Omit<Category, 'id'>[] => {
    const categories: Omit<Category, 'id'>[] = [];
    const lines = csvString.trim().split('\n');

    if (lines.length < 2) {
        throw new Error("CSV file is empty or contains only a header.");
    }

    const headers = lines[0].trim().toLowerCase().split(',');
    const expectedHeaders = ['name', 'color'];
    if (JSON.stringify(headers) !== JSON.stringify(expectedHeaders)) {
        throw new Error(`Invalid CSV headers. Expected: ${expectedHeaders.join(',')}`);
    }

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].trim().split(',');
        if (values.length !== 2) {
            console.warn(`Skipping malformed CSV row: ${lines[i]}`);
            continue;
        }

        const [name, color] = values;
        if (name && color && /^#[0-9A-F]{6}$/i.test(color)) {
            categories.push({ name, color });
        } else {
            console.warn(`Skipping invalid category data in row: ${lines[i]}`);
        }
    }
    return categories;
};

export const exportBudgetsToCSV = (budgets: Budget[], categories: Category[]): void => {
    const categoryMap = new Map(categories.map(c => [c.id, c.name]));
    const headers = ['categoryName', 'amount', 'period'];
    const csvRows = [headers.join(',')];

    for (const budget of budgets) {
        const categoryName = categoryMap.get(budget.categoryId);
        if (!categoryName) continue; // Skip budgets for deleted categories

        const values = [
            escapeCsvField(categoryName),
            escapeCsvField(budget.amount),
            escapeCsvField(budget.period),
        ];
        csvRows.push(values.join(','));
    }

    downloadCSV(csvRows.join('\n'), `budgets-export-${new Date().toISOString().split('T')[0]}.csv`);
};

export const parseBudgetsCSV = (csvString: string, categories: Category[]): Omit<Budget, 'id'>[] => {
    const categoryMap = new Map(categories.map(c => [c.name.toLowerCase(), c.id]));
    const budgets: Omit<Budget, 'id'>[] = [];
    const lines = csvString.trim().split('\n');

    if (lines.length < 2) {
        throw new Error("CSV file is empty or contains only a header.");
    }
    
    const headers = lines[0].trim().toLowerCase().split(',');
    const expectedHeaders = ['categoryname', 'amount', 'period'];
    if (headers[0] !== expectedHeaders[0] || headers[1] !== expectedHeaders[1] || headers[2] !== expectedHeaders[2]) {
        throw new Error(`Invalid CSV headers. Expected: categoryName,amount,period. Got: ${headers.join(',')}`);
    }

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].trim().split(',');
        if (values.length !== 3) {
            console.warn(`Skipping malformed CSV row: ${lines[i]}`);
            continue;
        }

        const [categoryName, amount, period] = values;
        const categoryId = categoryMap.get(categoryName.toLowerCase());

        if (categoryId && (period === 'monthly') && !isNaN(parseFloat(amount))) {
            budgets.push({
                categoryId,
                amount: parseFloat(amount),
                period: 'monthly',
            });
        } else {
             console.warn(`Skipping invalid budget data in row: ${lines[i]}`);
        }
    }
    return budgets;
};