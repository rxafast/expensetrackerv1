import { GoogleGenAI } from "@google/genai";
import { Transaction, Account, Budget } from '../types';

const getAiClient = () => {
  const apiKey = (typeof process !== 'undefined' && process.env?.API_KEY) || '';
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const suggestCategory = async (description: string, categories: string[]): Promise<string> => {
  try {
    const ai = getAiClient();
    if (!ai) {
      // Heuristic fallback
      const descLower = description.toLowerCase();
      if (descLower.includes('uber') || descLower.includes('fuel') || descLower.includes('petrol') || descLower.includes('taxi')) return 'Transport & Fuel';
      if (descLower.includes('grocery') || descLower.includes('market') || descLower.includes('milk') || descLower.includes('bread')) return 'Groceries & Food';
      if (descLower.includes('salary') || descLower.includes('bonus')) return 'Salary';
      if (descLower.includes('rent') || descLower.includes('flat')) return 'Rent & Housing';
      if (descLower.includes('bill') || descLower.includes('electric') || descLower.includes('wifi') || descLower.includes('internet')) return 'Utilities & Bills';
      if (descLower.includes('dinner') || descLower.includes('lunch') || descLower.includes('burger') || descLower.includes('cafe')) return 'Dining & Cafes';
      return 'Other';
    }

    const prompt = `Given the transaction description "${description}", which of the following categories is the most suitable?
Categories: ${categories.join(', ')}
Reply ONLY with the exact matching category name from the list. If none match well, reply with "Other".`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const suggested = response.text ? response.text.trim() : 'Other';
    return categories.includes(suggested) ? suggested : 'Other';
  } catch (error) {
    console.error("Error suggesting category:", error);
    return 'Other';
  }
};

export const getFinancialInsights = async (
  question: string, 
  transactions: Transaction[],
  accounts: Account[] = [],
  budgets: Budget[] = []
): Promise<string> => {
  if (transactions.length === 0) {
    return "No transactions are recorded yet. Start by logging some income, expenses, or transfers to unlock AI insights!";
  }

  try {
    const ai = getAiClient();
    if (!ai) {
      return "AI Advisor is ready! (Note: Set API_KEY in your environment to enable real-time Gemini LLM answers. For now, you can explore your charts and financial health metrics on the Dashboard and Analytics tabs.)";
    }

    const transactionsSummary = transactions.slice(0, 50).map(t =>
      `${t.date}: ${t.type.toUpperCase()} | ${t.category} | ${t.amount} | "${t.description}"`
    ).join('\n');

    const accountsSummary = accounts.map(a => `${a.name} (${a.type}): initial ${a.initialBalance}`).join(', ');

    const prompt = `You are FinTrack Pro AI, an expert, encouraging, and highly analytical personal financial advisor.
Current Date: ${new Date().toISOString().split('T')[0]}

User Accounts: ${accountsSummary}
Number of Recorded Transactions: ${transactions.length}

Recent Transactions Sample:
${transactionsSummary}

User's Question: "${question}"

Provide a crisp, actionable, structured financial response. Highlight specific numbers, spending patterns, and practical steps to save money and reach financial freedom. Use formatting (bullet points, bold text) for easy reading.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "I was unable to analyze your finances at this moment. Please try again shortly.";
  } catch (error: any) {
    console.error("Error getting financial insights:", error);
    return `Unable to fetch AI response: ${error.message || 'Please check your connection and try again.'}`;
  }
};

export const generateFinancialAudit = async (
  transactions: Transaction[],
  accounts: Account[]
): Promise<string> => {
  const prompt = `Perform a comprehensive 1-paragraph Financial Health Check and 3 bulleted recommendations based on these transactions.`;
  return getFinancialInsights(prompt, transactions, accounts);
};
