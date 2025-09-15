# Navratri Store - Dandiya Sticks E-commerce

A complete e-commerce website for purchasing handcrafted Dandiya sticks with secure UPI payment integration.

## Features

- Product catalog with quantity selection
- Shopping cart with local storage persistence
- Secure checkout with shipping details
- UPI payment integration (secure server-side)
- Responsive design for all devices
- Form validation and error handling
- Mobile-optimized interface
- Order confirmation via Formspree

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- UPI ID for receiving payments

### Installation

1. Clone or download the project files
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with your UPI configuration:
    ```
    UPI_ID=your_upi_id_here
    PORT=3001
    ```

4. Start the server:
   ```bash
   npm start
   ```

5. Open `index.html` in your browser or visit `http://localhost:3001`

### UPI Setup

1. Your UPI ID is securely stored in the server environment variables
2. The UPI ID is never exposed to the frontend for security
3. UPI payment URLs are generated server-side to prevent tampering

## API Endpoints

- `GET /upi-payment-details` - Get secure UPI payment details (amount, payee, UPI URL)

## Security Features

- Helmet for security headers
- Rate limiting
- Input validation
- Secure UPI payment URL generation
- CSP headers
- UPI ID stored server-side only

## Development

The frontend is built with vanilla JavaScript, HTML, and CSS. The backend uses Node.js with Express.

## Deployment

### Production Deployment Checklist

- [ ] Update `.env` file with your UPI ID
- [ ] Set up HTTPS certificate
- [ ] Configure production database (optional, currently using Formspree)
- [ ] Set up proper logging and monitoring
- [ ] Configure rate limiting based on production traffic
- [ ] Update Formspree endpoint if needed
- [ ] Test UPI payment flow
- [ ] Set up proper error handling and user feedback

### Environment Variables

Make sure to set these in your production environment:
```
UPI_ID=your_upi_id_here
PORT=3001
```

### Security Considerations

- UPI ID is stored securely in server environment variables
- UPI payment URLs are generated server-side to prevent tampering
- Rate limiting prevents abuse
- Helmet provides security headers
- Input validation on both client and server side
- UPI ID is never exposed to the frontend

## License

This project is for educational purposes. Modify and use as needed.