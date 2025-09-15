// Razorpay configuration - fetches from server
let RAZORPAY_CONFIG = null;

async function loadRazorpayConfig() {
  try {
    const response = await fetch('/razorpay-config');
    RAZORPAY_CONFIG = await response.json();
  } catch (error) {
    console.error('Failed to load Razorpay config:', error);
    // Fallback to environment variable if server fails
    RAZORPAY_CONFIG = {
      key_id: 'rzp_test_replace_here', // Replace with your Razorpay key_id
      currency: 'INR'
    };
  }
}

// Load config on module load
loadRazorpayConfig();

export { RAZORPAY_CONFIG };
export default RAZORPAY_CONFIG;