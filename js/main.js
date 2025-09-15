// Cart management
let cart = [];

// Toast notification system
function showToast(message, type = 'success') {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => toast.remove());

    // Create new toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span>${message}</span>
    `;

    document.body.appendChild(toast);

    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}


// Load cart from localStorage on page load
function loadCart() {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
        cart = JSON.parse(storedCart);
        updateCartDisplay();
    }
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Update cart count and subtotal
function updateCartDisplay() {
    const cartCount = document.getElementById('cart-count');
    const subtotal = document.getElementById('subtotal');
    const cartItems = document.getElementById('cart-items');

    let totalItems = 0;
    let totalPrice = 0;

    cartItems.innerHTML = '';
    cart.forEach(item => {
        totalItems += item.qty;
        totalPrice += item.price * item.qty;

        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        itemDiv.innerHTML = `
            <div class="cart-item-info">
                <span class="cart-item-name">${item.name} (x${item.qty})</span>
                <span class="cart-item-price">₹${item.price * item.qty}</span>
            </div>
            <div class="cart-item-actions">
                <button onclick="buyNowFromCart('${item.id}')" class="cart-buy-now-btn">Buy Now</button>
                <button onclick="removeFromCart('${item.id}')" class="cart-remove-btn">Remove</button>
            </div>
        `;
        cartItems.appendChild(itemDiv);
    });

    cartCount.textContent = totalItems;
    cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    subtotal.textContent = totalPrice;
}

// Add item to cart
function addToCart(id, name, price) {
    const qtyText = document.getElementById(`qty-${id}`).textContent;
    const qty = parseInt(qtyText.replace(' pair', ''));
    const itemName = name;

    const existingItem = cart.find(item => item.id === id && item.name === itemName);

    if (existingItem) {
        existingItem.qty += qty;
    } else {
        cart.push({ id, name: itemName, price, qty });
    }

    saveCart();
    updateCartDisplay();
    showToast(`${itemName} added to cart!`, 'success');
}

// Buy now functionality - add to cart and open checkout
function buyNow(id, name, price) {
    // First add to cart
    addToCart(id, name, price);

    // Then open checkout modal after a short delay to show the toast
    setTimeout(() => {
        openCheckout();
    }, 1000);
}

// Buy now from cart - directly open checkout for existing cart items
function buyNowFromCart(id) {
    // Find the item in cart
    const cartItem = cart.find(item => item.id === id);
    if (cartItem) {
        showToast(`Proceeding to checkout for ${cartItem.name}!`, 'success');
        // Open checkout modal after a short delay
        setTimeout(() => {
            openCheckout();
        }, 500);
    }
}

// Product prices
const productPrices = {
    basic: 99,
    decorative: 149,
    premium: 199
};

// Change quantity for product
function changeQuantity(id, delta) {
    const qtySpan = document.getElementById(`qty-${id}`);
    const priceSpan = document.getElementById(`price-${id}`);
    let qty = parseInt(qtySpan.textContent.replace(' pair', ''));
    qty += delta;
    if (qty < 1) qty = 1;
    qtySpan.textContent = qty + ' pair';

    // Update price display
    const totalPrice = productPrices[id] * qty;
    priceSpan.textContent = totalPrice;
}


// Remove item from cart
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    updateCartDisplay();
}

// Toggle cart visibility
function toggleCart() {
    const cartEl = document.getElementById('cart');
    cartEl.classList.toggle('open');
}

// Scroll to products section
function scrollToProducts() {
    document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
}

// Open checkout modal
function openCheckout() {
    const modal = document.getElementById('checkout-modal');
    const orderSummary = document.getElementById('order-summary');

    // Update checkout steps
    updateCheckoutSteps(1);

    orderSummary.innerHTML = '';
    cart.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.innerHTML = `<p>${item.name} (x${item.qty}) - ₹${item.price * item.qty}</p>`;
        orderSummary.appendChild(itemDiv);
    });

    modal.style.display = 'block';
    toggleCart(); // Close cart if open
}

// Update checkout steps
function updateCheckoutSteps(activeStep) {
    const steps = document.querySelectorAll('.step');
    steps.forEach((step, index) => {
        step.classList.remove('active', 'completed');
        if (index + 1 === activeStep) {
            step.classList.add('active');
        } else if (index + 1 < activeStep) {
            step.classList.add('completed');
        }
    });
}

// Close checkout modal
function closeCheckout() {
    document.getElementById('checkout-modal').style.display = 'none';
}

// Validate shipping form with visual feedback
function validateForm() {
    const form = document.getElementById('shipping-form');
    const inputs = form.querySelectorAll('input, textarea');
    let isValid = true;
    let firstInvalidInput = null;

    // Clear previous errors
    form.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
    form.querySelectorAll('.error-message').forEach(el => el.remove());

    for (let input of inputs) {
        const inputWrapper = input.parentElement;
        const value = input.value.trim();

        if (!value) {
            isValid = false;
            input.classList.add('input-error');

            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.textContent = `${input.previousElementSibling.previousElementSibling.textContent.replace(/[^\w\s]/g, '').trim()} is required`;
            inputWrapper.appendChild(errorMessage);

            if (!firstInvalidInput) {
                firstInvalidInput = input;
            }
        } else {
            // Additional validation for specific fields
            if (input.type === 'email' && !isValidEmail(value)) {
                isValid = false;
                input.classList.add('input-error');

                const errorMessage = document.createElement('div');
                errorMessage.className = 'error-message';
                errorMessage.textContent = 'Please enter a valid email address';
                inputWrapper.appendChild(errorMessage);

                if (!firstInvalidInput) {
                    firstInvalidInput = input;
                }
            } else if (input.id === 'phone' && !isValidPhone(value)) {
                isValid = false;
                input.classList.add('input-error');

                const errorMessage = document.createElement('div');
                errorMessage.className = 'error-message';
                errorMessage.textContent = 'Please enter a valid phone number';
                inputWrapper.appendChild(errorMessage);

                if (!firstInvalidInput) {
                    firstInvalidInput = input;
                }
            } else if (input.id === 'pincode' && !isValidPincode(value)) {
                isValid = false;
                input.classList.add('input-error');

                const errorMessage = document.createElement('div');
                errorMessage.className = 'error-message';
                errorMessage.textContent = 'Please enter a valid 6-digit pincode';
                inputWrapper.appendChild(errorMessage);

                if (!firstInvalidInput) {
                    firstInvalidInput = input;
                }
            }
        }
    }

    if (!isValid && firstInvalidInput) {
        firstInvalidInput.focus();
        firstInvalidInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return isValid;
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Phone validation (Indian phone numbers)
function isValidPhone(phone) {
    const phoneRegex = /^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Pincode validation (Indian pincodes)
function isValidPincode(pincode) {
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    return pincodeRegex.test(pincode);
}

// Show UPI payment modal
function showUpiPaymentModal(paymentDetails) {
    // Create payment modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'upi-payment-modal';
    modal.innerHTML = `
        <div class="modal-content payment-modal-content">
            <span class="close" onclick="closeUpiPaymentModal()">&times;</span>
            <h3>💳 Complete Your Payment</h3>
            <div class="payment-details">
                <div class="payment-info">
                    <h4>Payment Details:</h4>
                    <p><strong>Amount:</strong> ₹${paymentDetails.amount}</p>
                    <p><strong>Payee:</strong> ${paymentDetails.payeeName}</p>
                    <p><strong>Note:</strong> ${paymentDetails.transactionNote}</p>
                </div>
                <div class="payment-instructions">
                    <h4>📱 How to Pay:</h4>
                    <ol>
                        <li>Click "Open UPI App" to automatically open your UPI app</li>
                        <li>If that doesn't work, use this UPI ID: <code>dandiyaa@ptyes</code></li>
                        <li>Enter the amount: ₹${paymentDetails.amount}</li>
                        <li>Complete the payment in your UPI app</li>
                        <li>Click "Payment Completed" below</li>
                    </ol>
                </div>
                <div class="payment-actions">
                    <button onclick="openUpiApp('${paymentDetails.upiUrl}')" class="open-upi-btn">💰 Open UPI App</button>
                    <button onclick="showUpiId()" class="upi-id-btn">📋 Show UPI ID</button>
                    <button onclick="confirmPayment()" class="confirm-payment-btn">✅ Payment Completed</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = 'block';
}

// Close UPI payment modal
function closeUpiPaymentModal() {
    const modal = document.getElementById('upi-payment-modal');
    if (modal) {
        modal.remove();
    }
}

// Show UPI ID for manual payment
function showUpiId() {
    // Create a temporary element to show UPI ID
    const upiIdElement = document.createElement('div');
    upiIdElement.innerHTML = `
        <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); z-index: 10000; text-align: center;">
            <h4>📋 UPI ID for Manual Payment</h4>
            <p style="font-size: 18px; font-weight: bold; color: #ff6600; margin: 15px 0;">dandiyaa@ptyes</p>
            <p style="margin: 10px 0; color: #666;">Copy this UPI ID and use it in your UPI app</p>
            <button onclick="navigator.clipboard.writeText('dandiyaa@ptyes').then(() => showToast('UPI ID copied!', 'success'))" style="background: #ff6600; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-right: 10px;">Copy UPI ID</button>
            <button onclick="this.parentElement.parentElement.remove()" style="background: #666; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Close</button>
        </div>
    `;
    document.body.appendChild(upiIdElement);
}

// Open UPI app with error handling
function openUpiApp(upiUrl) {
    try {
        console.log('Opening UPI URL:', upiUrl);

        // Try to open UPI app
        const upiWindow = window.open(upiUrl, '_blank');

        // Check if popup was blocked
        if (!upiWindow || upiWindow.closed || typeof upiWindow.closed === 'undefined') {
            console.warn('UPI popup was blocked or failed to open');
            showToast('Popup blocked! Click "Show UPI ID" to copy the UPI ID manually.', 'error');
            return;
        }

        showToast('Opening UPI app to complete payment...', 'success');

        // Fallback: if UPI app doesn't open within 2 seconds, show manual instructions
        setTimeout(() => {
            if (!upiWindow.closed) {
                // Window is still open, UPI app might be opening
                return;
            }
            // Window closed quickly, might indicate UPI app opened
            console.log('UPI window closed, payment app may have opened');
        }, 2000);

    } catch (error) {
        console.error('Failed to open UPI app:', error);
        showToast('Could not open UPI app automatically. Click "Show UPI ID" to copy manually.', 'error');
    }
}

// Confirm payment completion
async function confirmPayment() {
    // Submit the form data to Formspree
    const form = document.getElementById('shipping-form');
    const formData = new FormData(form);

    // Add order details
    formData.append('order_details', JSON.stringify(cart));
    formData.append('total_amount', cart.reduce((sum, item) => sum + item.price * item.qty, 0));

    try {
        const response = await fetch('https://formspree.io/f/xyzdvrlr', {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to send data to Formspree');
        }

        // Update to completion step
        updateCheckoutSteps(3);
        showToast('Thank you for your payment! Your order has been placed successfully.', 'success');

        // Clear cart after a short delay
        setTimeout(() => {
            cart = [];
            saveCart();
            updateCartDisplay();
            closeCheckout();
            closeUpiPaymentModal();
        }, 2000);
    } catch (error) {
        console.error('Formspree error:', error);
        showToast('Payment confirmed but failed to process order details. Please contact support.', 'error');
        // Still clear cart and close modals even if form submission fails
        setTimeout(() => {
            cart = [];
            saveCart();
            updateCartDisplay();
            closeCheckout();
            closeUpiPaymentModal();
        }, 2000);
    }
}

// Pay with UPI
async function payWithRazorpay() {
    if (!validateForm()) return;

    // Update to payment step
    updateCheckoutSteps(2);

    const payButton = document.querySelector('#checkout-modal button');
    const originalText = payButton.textContent;
    payButton.innerHTML = '<span class="loading-spinner"></span>Processing...';
    payButton.disabled = true;

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

    try {
        console.log('Fetching payment details for amount:', subtotal);

        // Get UPI payment details from server
        const paymentResponse = await fetch(`http://localhost:3001/upi-payment-details?amount=${subtotal}`);

        console.log('Payment response status:', paymentResponse.status);

        if (!paymentResponse.ok) {
            const errorText = await paymentResponse.text();
            console.error('Payment response error:', errorText);
            throw new Error(`Failed to get payment details: ${paymentResponse.status}`);
        }

        const paymentDetails = await paymentResponse.json();
        console.log('Payment details received:', paymentDetails);

        // Show UPI payment modal
        showUpiPaymentModal(paymentDetails);

        payButton.innerHTML = originalText;
        payButton.disabled = false;
    } catch (error) {
        console.error('Payment setup error:', error);
        showToast(`Payment setup failed: ${error.message}`, 'error');
        payButton.innerHTML = originalText;
        payButton.disabled = false;
    }
}


// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    loadCart();
    loadCustomerInfo();
});

// Mobile-specific enhancements
function initMobileFeatures() {
    // Prevent zoom on input focus for iOS
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            if (window.innerWidth < 768) {
                input.setAttribute('inputmode', 'text');
            }
        });
    });

    // Add swipe to close cart on mobile
    let startX = 0;
    let startY = 0;

    const cart = document.getElementById('cart');
    cart.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    });

    cart.addEventListener('touchend', (e) => {
        if (!startX || !startY) return;

        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const diffX = startX - endX;
        const diffY = startY - endY;

        // Swipe left to close cart
        if (Math.abs(diffX) > Math.abs(diffY) && diffX > 50) {
            toggleCart();
        }

        startX = 0;
        startY = 0;
    });

    // Add swipe to close modal on mobile
    const modal = document.getElementById('checkout-modal');
    modal.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    });

    modal.addEventListener('touchend', (e) => {
        if (!startX || !startY) return;

        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const diffX = startX - endX;
        const diffY = startY - endY;

        // Swipe down to close modal
        if (Math.abs(diffY) > Math.abs(diffX) && diffY > 50) {
            closeCheckout();
        }

        startX = 0;
        startY = 0;
    });

    // Add pull-to-refresh for cart
    let pullStart = 0;
    const cartItems = document.getElementById('cart-items');

    cartItems.addEventListener('touchstart', (e) => {
        pullStart = e.touches[0].clientY;
    });

    cartItems.addEventListener('touchmove', (e) => {
        if (pullStart && cartItems.scrollTop === 0) {
            const pull = e.touches[0].clientY - pullStart;
            if (pull > 50) {
                // Add visual feedback for pull-to-refresh
                cartItems.style.transform = `translateY(${Math.min(pull - 50, 30)}px)`;
            }
        }
    });

    cartItems.addEventListener('touchend', () => {
        cartItems.style.transform = '';
        pullStart = 0;
    });

    // Improve button tap feedback on mobile
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('touchstart', () => {
            button.style.transform = 'scale(0.98)';
        });

        button.addEventListener('touchend', () => {
            setTimeout(() => {
                button.style.transform = '';
            }, 150);
        });
    });
}

// Detect if device supports touch
function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// Initialize mobile features if on touch device
if (isTouchDevice()) {
    document.addEventListener('DOMContentLoaded', initMobileFeatures);
}

// Handle orientation changes
window.addEventListener('orientationchange', () => {
    // Close any open modals on orientation change
    setTimeout(() => {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (modal.style.display === 'block') {
                // Re-center modal after orientation change
                modal.style.display = 'none';
                setTimeout(() => {
                    modal.style.display = 'block';
                }, 100);
            }
        });
    }, 500);
});

// Handle window resize for responsive adjustments
window.addEventListener('resize', () => {
    // Close cart on very small screens when resizing
    if (window.innerWidth < 480 && document.getElementById('cart').classList.contains('open')) {
        // Keep cart open but adjust positioning if needed
    }
});

// Login modal functions
function login() {
    const modal = document.getElementById('login-modal');
    modal.style.display = 'block';
}

function closeLoginModal() {
    document.getElementById('login-modal').style.display = 'none';
}

// Handle login form submission
function handleLoginSubmit(event) {
    event.preventDefault();

    const name = document.getElementById('customer-name').value.trim();
    const mobile = document.getElementById('customer-mobile').value.trim();

    if (!name || !mobile) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    if (mobile.length !== 10 || !/^\d{10}$/.test(mobile)) {
        showToast('Please enter a valid 10-digit mobile number', 'error');
        return;
    }

    // Store customer info in localStorage
    const customerInfo = { name, mobile };
    localStorage.setItem('customerInfo', JSON.stringify(customerInfo));

    showToast(`Welcome ${name}!`, 'success');
    closeLoginModal();

    // Update login button to show logged in state
    updateLoginButton(name);
}

// Update login button appearance when logged in
function updateLoginButton(name) {
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) {
        loginBtn.textContent = `👤 ${name}`;
        loginBtn.onclick = () => showToast(`Logged in as ${name}`, 'success');
    }
}

// Load customer info on page load
function loadCustomerInfo() {
    const storedInfo = localStorage.getItem('customerInfo');
    if (storedInfo) {
        const customerInfo = JSON.parse(storedInfo);
        updateLoginButton(customerInfo.name);
    }
}

// Make functions global for onclick handlers
window.addToCart = addToCart;
window.changeQuantity = changeQuantity;
window.removeFromCart = removeFromCart;
window.toggleCart = toggleCart;
window.scrollToProducts = scrollToProducts;
window.openCheckout = openCheckout;
window.closeCheckout = closeCheckout;
window.payWithRazorpay = payWithRazorpay;
window.buyNow = buyNow;
window.buyNowFromCart = buyNowFromCart;
window.login = login;
window.closeLoginModal = closeLoginModal;
window.handleLoginSubmit = handleLoginSubmit;
window.closeUpiPaymentModal = closeUpiPaymentModal;
window.confirmPayment = confirmPayment;
window.openUpiApp = openUpiApp;
window.showUpiId = showUpiId;