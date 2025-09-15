const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// UPI Configuration (securely stored server-side)
const UPI_CONFIG = {
  UPI_ID: process.env.UPI_ID || 'dandiyaa@ptyes', // Your UPI ID
  PAYEE_NAME: 'Navratri Store'
};

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files from current directory

// Get UPI payment details (without exposing UPI ID directly)
app.get('/upi-payment-details', (req, res) => {
  const { amount } = req.query;

  if (!amount || isNaN(amount)) {
    return res.status(400).json({ error: 'Valid amount required' });
  }

  const transactionNote = `Navratri Store Purchase - ₹${amount}`;

  // Create UPI URL server-side for security
  const upiUrl = `upi://pay?pa=${UPI_CONFIG.UPI_ID}&pn=${encodeURIComponent(UPI_CONFIG.PAYEE_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;

  res.json({
    payeeName: UPI_CONFIG.PAYEE_NAME,
    amount: amount,
    transactionNote: transactionNote,
    upiUrl: upiUrl
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});