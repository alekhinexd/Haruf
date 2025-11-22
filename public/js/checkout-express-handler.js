// Custom Express Checkout Handler
// Handles Apple Pay and Google Pay button clicks to pre-select payment methods

function setupCustomExpressButtons() {
    const applePayBtn = document.getElementById('apple-pay-btn');
    const googlePayBtn = document.getElementById('google-pay-btn');
    
    if (applePayBtn) {
        applePayBtn.addEventListener('click', () => {
            console.log('🍎 Apple Pay button clicked - will pre-select when available');
            // Scroll to payment section
            document.getElementById('payment-element').scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
            
            // Show hint to user
            showMessage('Bitte wählen Sie Apple Pay aus den Zahlungsmethoden unten', false);
        });
    }
    
    if (googlePayBtn) {
        googlePayBtn.addEventListener('click', () => {
            console.log('📱 Google Pay button clicked - will pre-select when available');
            // Scroll to payment section
            document.getElementById('payment-element').scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
            
            // Show hint to user
            showMessage('Bitte wählen Sie Google Pay aus den Zahlungsmethoden unten', false);
        });
    }
}

function handlePaymentMethodChange(event) {
    console.log('💳 Payment method changed:', event);
    
    const emailSection = document.getElementById('email-section');
    const deliverySection = document.getElementById('delivery-section');
    const shippingSection = document.getElementById('shipping-section');
    const expressMessage = document.getElementById('express-message');
    const submitBtn = document.getElementById('submit-btn');
    
    // Check if express payment method is selected
    // Check both event.value.type and event.complete for Stripe's payment element structure
    const paymentType = event.value?.type || event.value?.paymentMethod?.type;
    const isExpressMethod = paymentType === 'apple_pay' || 
                           paymentType === 'google_pay' ||
                           paymentType === 'klarna' ||
                           paymentType === 'paypal';
    
    console.log('Is express method:', isExpressMethod, 'Type:', paymentType);
    
    if (isExpressMethod) {
        // Smooth fade out form sections
        [emailSection, deliverySection, shippingSection].forEach(section => {
            if (section) {
                section.style.opacity = '0';
                section.style.maxHeight = section.scrollHeight + 'px';
                setTimeout(() => {
                    section.style.maxHeight = '0';
                    section.style.overflow = 'hidden';
                    section.style.marginBottom = '0';
                    setTimeout(() => {
                        section.style.display = 'none';
                    }, 300);
                }, 10);
            }
        });
        
        // Show express message with animation
        if (expressMessage) {
            setTimeout(() => {
                expressMessage.style.display = 'block';
            }, 300);
        }
        
        // Update submit button text based on method
        if (submitBtn) {
            if (paymentType === 'apple_pay') {
                submitBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 50 20" fill="white" style="margin-right: 8px;"><path d="M9.536 3.785c.627-.784 1.043-1.869.929-2.954-.898.04-1.998.627-2.645 1.41-.588.705-1.103 1.83-.968 2.895.997.08 2.014-.509 2.684-1.351z"/></svg> Mit Apple Pay bezahlen';
            } else if (paymentType === 'google_pay') {
                submitBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 42 17" fill="white" style="margin-right: 8px;"><path d="M19.526 7.727v3.91h-.933V.64h2.463c.604 0 1.122.203 1.558.608.435.404.653.893.653 1.465z"/></svg> Mit Google Pay bezahlen';
            } else if (paymentType === 'klarna') {
                submitBtn.textContent = '💳 Mit Klarna bezahlen';
            } else if (paymentType === 'paypal') {
                submitBtn.textContent = '💙 Mit PayPal bezahlen';
            }
            submitBtn.style.background = '#5A3518';
        }
        
        // Remove required from all inputs
        document.querySelectorAll('#checkout-form input[required], #checkout-form select[required]').forEach(input => {
            input.removeAttribute('required');
            input.dataset.wasRequired = 'true';
        });
        
        console.log('✅ Express checkout mode activated');
    } else {
        // Smooth fade in form sections
        [emailSection, deliverySection, shippingSection].forEach(section => {
            if (section && section.style.display === 'none') {
                section.style.display = 'flex';
                section.style.overflow = 'visible';
                section.style.marginBottom = '';
                setTimeout(() => {
                    section.style.maxHeight = section.scrollHeight + 'px';
                    section.style.opacity = '1';
                    setTimeout(() => {
                        section.style.maxHeight = '';
                    }, 300);
                }, 10);
            }
        });
        
        // Hide express message
        if (expressMessage) {
            expressMessage.style.display = 'none';
        }
        
        // Restore submit button text
        if (submitBtn) {
            submitBtn.textContent = 'Bestellung überprüfen';
            submitBtn.style.background = '';
        }
        
        // Restore required attributes
        document.querySelectorAll('#checkout-form input[data-was-required="true"], #checkout-form select[data-was-required="true"]').forEach(input => {
            input.setAttribute('required', '');
            delete input.dataset.wasRequired;
        });
        
        console.log('✅ Standard checkout mode activated');
    }
}
