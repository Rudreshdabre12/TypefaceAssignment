import Transaction from "../models/Transactions.js";
import Tesseract from "tesseract.js";
import { PDFExtract } from "pdf.js-extract";
import fs from "fs";
import { GoogleGenerativeAI } from "@google/generative-ai";

// helper: call Gemini to parse receipt text
export async function extractReceiptData(text) {
  // Fail fast if API key not present
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Gemini API key is missing. Please set GEMINI_API_KEY in your environment.");
  }

  // Check if OCR text is meaningful
  if (!text || text.trim().length < 10) {
    throw new Error("OCR text is too short or empty. Please ensure the image is clear and contains readable text.");
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Try gemini-1.5-pro for better parsing capabilities
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const prompt = `
You are an expert receipt data extractor. Your job is to find and extract specific information from receipt text.

CRITICAL: You MUST return valid JSON only. No explanations, no markdown, just the JSON object.
IMPORTANT: Categories are case sensitive and must match EXACTLY as shown below (all lowercase).

Rules for extraction:
1. AMOUNT: Look for words like "Total", "Grand Total", "Amount Due", "Net Amount", "Bill Amount" followed by a number. Extract the final amount paid (usually the largest number).
2. MERCHANT: Find the store/business name (usually at the top of receipt).
3. DATE: Look for any date format (DD/MM/YYYY, DD-MM-YYYY, MM/DD/YYYY, etc.).
4. CATEGORY: Classify based on merchant type into EXACTLY one of these categories (all lowercase, exact match required):
   - Income categories:
     'salary', 'freelance', 'investment returns', 'business income', 'rental income', 'side hustle', 'bonus', 'gift', 'other income'
   - Expense categories:
     'food & dining', 'groceries', 'transportation', 'shopping', 'entertainment', 'bills & utilities', 'healthcare', 'education',
     'travel', 'insurance', 'investment', 'rent', 'home maintenance', 'personal care', 'subscriptions', 'other'
5. PAYMENT MODE: Look for payment indicators and return exactly one of: "cash", "card", "upi", "netbanking". Default to "cash" if unclear.
    
Extract from this receipt text:
${text}

Return this exact JSON structure:
{
  "amount": [number - the total amount],
  "merchant": "[store name]",
  "date": "[YYYY-MM-DD format]",
  "category": "[must match exactly one of the lowercase categories listed above]",
  "paymentMode": "[cash|card|upi|netbanking]"
}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    
    // console.log("Raw OCR text:", text);
    // console.log("Gemini response:", responseText);

    // Clean the response - remove any markdown formatting
    let cleanResponse = responseText;
    if (cleanResponse.includes("```json")) {
      cleanResponse = cleanResponse.replace(/```json\n?/g, "").replace(/```/g, "");
    }
    if (cleanResponse.includes("```")) {
      cleanResponse = cleanResponse.replace(/```/g, "");
    }

    // Parse JSON
    const parsedData = JSON.parse(cleanResponse);

    // Validate required fields
    if (!parsedData.amount && parsedData.amount !== 0) {
      throw new Error("Invalid amount in parsed data");
    }
    if (!parsedData.merchant) {
      parsedData.merchant = "Unknown Merchant";
    }
    if (!parsedData.date) {
      parsedData.date = new Date().toISOString().split('T')[0];
    }

    return parsedData;
  } catch (err) {
    // console.error("Gemini API error:", err.message);
    // console.error("OCR text was:", text);
    
    // Return fallback data instead of throwing
    return {
      amount: 0,
      merchant: "Parse Failed - Check Image Quality",
      date: new Date().toISOString().split('T')[0],
      category: "other",
      paymentMode: "card"
    };
  }
}

// Upload POS receipt (image)
export const uploadReceiptImage = async (req, res) => {
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded" });
    }

    const filePath = req.file.path;
    const userId = req.user._id;

    // Improved OCR with better configuration
    const { data: { text } } = await Tesseract.recognize(filePath, "eng", {
      logger: m => console.log("OCR Progress:", m)
    });

    if (!text || text.trim().length < 5) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ 
        error: "Could not extract readable text from image. Please ensure the image is clear and contains a receipt." 
      });
    }

    const receiptData = await extractReceiptData(text);

    const transaction = new Transaction({
      userId,
      transactionType: "expense",
      amount: receiptData.amount,
      merchant: receiptData.merchant,
      category: receiptData.category,
      paymentMode: receiptData.paymentMode,
      createdAt: new Date(receiptData.date),
    });

    await transaction.save();
    fs.unlinkSync(filePath);

    res.json({ 
      message: "Receipt processed with AI", 
      transaction,
      debug: {
        ocrTextLength: text.length,
        extractedData: receiptData
      }
    });
  } catch (err) {
    console.error("Upload receipt error:", err);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: err.message });
  }
};

// Upload POS receipt (PDF)
export const uploadReceiptPdf = async (req, res) => {
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file uploaded" });
    }

    const filePath = req.file.path;
    const userId = req.user._id;

    // Extract text from PDF using pdf.js-extract
    const pdfExtract = new PDFExtract();
    const data = await pdfExtract.extract(filePath, {});
    const text = data.pages.map(page => 
        page.content.map(item => item.str).join(' ')
    ).join('\n');

    if (!text || text.trim().length < 5) {
      // Cleanup PDF file
      fs.unlinkSync(filePath);
      
      return res.status(400).json({ 
        error: "Could not extract readable text from PDF. Please ensure the PDF contains text."
      });
    }

    const receiptData = await extractReceiptData(text);

    const transaction = new Transaction({
      userId,
      transactionType: "expense",
      amount: receiptData.amount,
      merchant: receiptData.merchant,
      category: receiptData.category,
      paymentMode: receiptData.paymentMode,
      createdAt: new Date(receiptData.date),
    });

    await transaction.save();

    // Cleanup PDF file
    fs.unlinkSync(filePath);

    res.json({ 
      message: "PDF processed with AI", 
      transaction,
      debug: {
        ocrTextLength: text.length,
        extractedData: receiptData
      }
    });
  } catch (err) {
    console.error("Upload PDF error:", err);
    
    // Cleanup PDF file in case of error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ error: err.message });
  }
};

// helper: call Gemini to parse a list of transactions
export async function extractMultipleTransactions(text) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Gemini API key is missing.");
  }
  if (!text || text.trim().length < 10) {
    throw new Error("PDF text is too short or empty.");
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    You are an expert transaction data extractor from bank or credit card statements.
    Your job is to find and extract all individual transactions from the provided text.

    CRITICAL: You MUST return a valid JSON array of objects only. No explanations, no markdown, just the JSON array.
    IMPORTANT: Categories are case sensitive and must match EXACTLY as shown below (all lowercase).

    Rules for extraction for EACH transaction:
    1. TRANSACTION TYPE: Determine if the transaction is 'income' or 'expense'. If the statement has "credit" and "debit" columns, amounts in the credit column are 'income' and amounts in the debit column are 'expense'.
    2. AMOUNT: Extract the transaction amount. This should always be a positive number.
    3. MERCHANT: Extract the merchant or description of the transaction.
    4. DATE: Extract the transaction date. If the year is not specified, assume the current year.
    5. CATEGORY: Classify based on merchant type into EXACTLY one of these categories (all lowercase, exact match required):
       - Income categories: 'salary', 'freelance', 'investment returns', 'business income', 'rental income', 'side hustle', 'bonus', 'gift', 'other income'
       - Expense categories: 'food & dining', 'groceries', 'transportation', 'shopping', 'entertainment', 'bills & utilities', 'healthcare', 'education', 'travel', 'insurance', 'investment', 'rent', 'home maintenance', 'personal care', 'subscriptions', 'other'
    6. PAYMENT MODE: Determine if it was 'card', 'upi', 'netbanking', or 'cash'. Default to 'card' if unclear.

    Extract from this text block:
    ${text}

    Return this exact JSON structure: an array of objects.
    [
      {
        "transactionType": "[income|expense]",
        "amount": [number - the transaction amount as a positive number],
        "merchant": "[store name or description]",
        "date": "[YYYY-MM-DD format]",
        "category": "[must match exactly one of the lowercase categories listed above]",
        "paymentMode": "[card|upi|netbanking|cash]"
      },
      {
        "transactionType": "[income|expense]",
        "amount": [number - the transaction amount as a positive number],
        "merchant": "[store name or description]",
        "date": "[YYYY-MM-DD format]",
        "category": "[must match exactly one of the lowercase categories listed above]",
        "paymentMode": "[card|upi|netbanking|cash]"
      }
    ]
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    let cleanResponse = responseText;
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.substring(7, cleanResponse.length - 3).trim();
    }

    const parsedData = JSON.parse(cleanResponse);
    return parsedData;

  } catch (err) {
    console.error("Gemini API error (multiple transactions):", err.message);
    // Return an empty array on failure to prevent crashes
    return [];
  }
}

// Upload transaction history (PDF)
export const uploadTransactionHistoryPdf = async (req, res) => {
  console.log("here");
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file uploaded" });
    }

    const filePath = req.file.path;
    const userId = req.user._id;

    const pdfExtract = new PDFExtract();
    const data = await pdfExtract.extract(filePath, {});
    const text = data.pages.map(page => 
        page.content.map(item => item.str).join(' ')
    ).join('\n');

    fs.unlinkSync(filePath); // Delete file immediately after text extraction

    if (!text || text.trim().length < 10) {
      return res.status(400).json({ 
        error: "Could not extract readable text from PDF."
      });
    }

    const transactionsData = await extractMultipleTransactions(text);

    if (!transactionsData || transactionsData.length === 0) {
      return res.status(400).json({ 
        error: "AI could not parse any transactions from the document."
      });
    }

    const transactionsToSave = transactionsData.map(t => ({
      userId,
      transactionType: t.transactionType || 'expense', // Default to expense if not specified
      amount: Math.abs(t.amount),
      merchant: t.merchant || 'Unknown Merchant',
      category: t.category || 'other',
      paymentMode: t.paymentMode || 'card',
      date: new Date(t.date || Date.now()),
    }));

    const savedTransactions = await Transaction.insertMany(transactionsToSave);

    res.json({ 
      message: `Successfully imported ${savedTransactions.length} transactions.`, 
      transactions: savedTransactions
    });

  } catch (err) {
    console.error("Upload history PDF error:", err);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: err.message });
  }
};