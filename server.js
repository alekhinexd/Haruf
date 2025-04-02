const express = require('express');
const cors = require('cors');
const path = require('path');
const csv = require('csv-parse');
const fs = require('fs');
const { Client, Environment } = require('square');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const createOrderConfirmationEmail = require('./email-templates/order-confirmation');
require('dotenv').config();

// Validate environment variables
const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN;
const SQUARE_LOCATION_ID = process.env.SQUARE_LOCATION_ID;
const SQUARE_ENVIRONMENT = process.env.SQUARE_ENVIRONMENT || 'sandbox'; // 'sandbox' or 'production'
const APP_URL = process.env.APP_URL;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_HOST = process.env.EMAIL_HOST;
const EMAIL_PORT = process.env.EMAIL_PORT;
const EMAIL_FROM = process.env.EMAIL_FROM;

if (!SQUARE_ACCESS_TOKEN || !SQUARE_LOCATION_ID) {
    console.error('ERROR: Missing SQUARE_ACCESS_TOKEN or SQUARE_LOCATION_ID environment variables. Check your .env file or Render.com environment settings.');
    process.exit(1);
}

if (!APP_URL) {
    console.error('ERROR: Missing APP_URL environment variable. Check your .env file or Render.com environment settings.');
    process.exit(1);
}

// Remove trailing slash from APP_URL if present
const normalizedAppUrl = APP_URL.endsWith('/') ? APP_URL.slice(0, -1) : APP_URL;

console.log('Environment configuration:');
console.log(`- APP_URL: ${normalizedAppUrl}`);
console.log(`- SQUARE_ENVIRONMENT: ${SQUARE_ENVIRONMENT}`);
console.log(`- SQUARE_LOCATION_ID: ${SQUARE_LOCATION_ID}`);

// Initialize Square client
const squareClient = new Client({
    accessToken: SQUARE_ACCESS_TOKEN,
    environment: SQUARE_ENVIRONMENT === 'production' ? Environment.Production : Environment.Sandbox
});

// Initialize Nodemailer transporter
const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: false,
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Function to send order confirmation email
async function sendOrderConfirmationEmail(order) {
    try {
        const htmlContent = createOrderConfirmationEmail(order);
        
        const mailOptions = {
            from: `"Resell Depot" <${EMAIL_FROM}>`,
            to: order.customerEmail,
            subject: `Order Confirmation #${order.orderNumber}`,
            html: htmlContent,
            replyTo: EMAIL_FROM
        };
        
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Import hardcoded products data
const { products } = require('./public/js/data/products.js');

// Secure payment endpoint with proper validation and error handling
app.post('/api/create-payment', async (req, res) => {
    try {
        console.log('Payment request received:', req.body);
        const { cartItems, customerName, customerEmail } = req.body;
        
        if (!Array.isArray(cartItems) || cartItems.length === 0) {
            console.error('Invalid cart items:', cartItems);
            return res.status(400).json({ error: 'Invalid cart items' });
        }

        // Calculate total amount from cart items
        const total = cartItems.reduce((sum, item) => {
            return sum + (parseFloat(item.price) * parseInt(item.quantity));
        }, 0);

        if (isNaN(total) || total <= 0) {
            console.error('Invalid total amount:', total);
            return res.status(400).json({ error: 'Invalid total amount' });
        }

        // Format amount for Square (in cents)
        const amountInCents = Math.round(total * 100);
        console.log('Calculated amount in cents:', amountInCents);

        // Create payment with Square
        try {
            // Construct the redirect URLs
            const redirectUrl = `${normalizedAppUrl}/pages/order-confirmation.html`;
            const cancelUrl = `${normalizedAppUrl}/pages/checkout.html`;
            
            console.log('Using the following URLs:');
            console.log(`- Success URL: ${redirectUrl}`);
            console.log(`- Cancel URL: ${cancelUrl}`);
            
            // Create a unique order ID
            const orderId = uuidv4();
            
            // Create line items for Square checkout
            const lineItems = cartItems.map(item => ({
                name: item.title,
                quantity: item.quantity.toString(),
                basePriceMoney: {
                    amount: Math.round(parseFloat(item.price) * 100),
                    currency: 'EUR'
                }
            }));
            
            // Create a payment link with Square
            const response = await squareClient.checkoutApi.createPaymentLink({
                idempotencyKey: uuidv4(),
                quickPay: {
                    name: 'Resell Depot Order',
                    priceMoney: {
                        amount: amountInCents,
                        currency: 'EUR'
                    },
                    locationId: SQUARE_LOCATION_ID
                },
                checkoutOptions: {
                    redirectUrl: redirectUrl,
                    merchantSupportEmail: EMAIL_FROM,
                    askForShippingAddress: true
                },
                prePopulatedData: {
                    buyerEmail: customerEmail,
                    buyerAddress: {
                        firstName: customerName.split(' ')[0],
                        lastName: customerName.split(' ').slice(1).join(' ')
                    }
                },
                note: `Order details: ${JSON.stringify({
                    customerName,
                    customerEmail,
                    items: cartItems.map(item => ({
                        title: item.title,
                        price: item.price,
                        quantity: item.quantity
                    }))
                })}`
            });
            
            console.log('Payment link created successfully:', response.result);
            
            // Return the checkout URL and payment ID to the client
            res.json({
                checkoutUrl: response.result.paymentLink.url,
                paymentId: response.result.paymentLink.id
            });
        } catch (squareError) {
            console.error('Square API error:', squareError);
            
            // Provide more detailed error information
            let errorMessage = 'Payment provider error';
            
            if (squareError.errors && squareError.errors.length > 0) {
                errorMessage += ': ' + squareError.errors[0].detail;
            } else if (squareError.message) {
                errorMessage += ': ' + squareError.message;
            }
            
            res.status(500).json({
                error: errorMessage
            });
        }
    } catch (error) {
        console.error('Payment creation failed:', error);
        res.status(500).json({
            error: 'Payment processing failed. Please try again or contact support.'
        });
    }
});

// Add payment verification endpoint
app.get('/api/verify-payment/:paymentId', async (req, res) => {
    try {
        const { paymentId } = req.params;
        
        if (!paymentId) {
            return res.status(400).json({ error: 'Payment ID is required' });
        }

        // Get payment link details from Square
        const response = await squareClient.checkoutApi.retrievePaymentLink(paymentId);
        const paymentLink = response.result.paymentLink;
        
        // Check if the payment has been completed
        const isPaid = paymentLink.orderStatus === 'COMPLETED';
        
        res.json({
            isPaid: isPaid,
            status: paymentLink.orderStatus || 'UNKNOWN'
        });

    } catch (error) {
        console.error('Payment verification failed:', error);
        res.status(500).json({
            error: 'Payment verification failed'
        });
    }
});

// Webhook endpoint for Square callbacks
app.post('/api/webhooks/square', async (req, res) => {
    try {
        console.log('Webhook called with body:', req.body);
        
        // Extract the event type and data
        const { type, data } = req.body;
        
        if (type === 'payment.updated') {
            const paymentId = data.id;
            
            // Get payment details from Square
            const response = await squareClient.paymentsApi.getPayment(paymentId);
            const payment = response.result.payment;
            
            if (payment.status === 'COMPLETED') {
                console.log(`Payment ${paymentId} completed successfully`);
                
                // Extract order information from payment note or metadata
                let orderInfo = {};
                try {
                    if (payment.note) {
                        // Extract the JSON part from the note
                        const jsonStr = payment.note.substring(payment.note.indexOf('{'), payment.note.lastIndexOf('}') + 1);
                        orderInfo = JSON.parse(jsonStr);
                    }
                } catch (e) {
                    console.error('Error parsing order info:', e);
                }
                
                // Generate order number
                const orderNumber = 'RD' + Date.now().toString().slice(-6);
                
                // Get customer data from order info or use defaults
                const customerName = orderInfo.customerName || 'Valued Customer';
                const customerEmail = orderInfo.customerEmail || payment.buyerEmail || 'customer@example.com';
                
                // Create order object for email
                const order = {
                    orderNumber,
                    customerName,
                    customerEmail,
                    items: orderInfo.items || [{ title: 'Order from Resell Depot', price: payment.amountMoney.amount / 100, quantity: 1 }],
                    total: payment.amountMoney.amount / 100
                };
                
                // Send confirmation email
                await sendOrderConfirmationEmail(order);
                
                console.log(`Confirmation email sent to ${customerEmail} for order #${orderNumber}`);
            }
        }
        
        res.status(200).send('OK');
    } catch (error) {
        console.error('Webhook processing failed:', error);
        res.status(200).send('OK'); // Always return 200 to Square
    }
});

// Product detail page route - must come before static file handling
app.get('/pages/product.html', (req, res) => {
    console.log('Serving product detail page');
    res.sendFile(path.join(__dirname, 'public', 'pages', 'product.html'));
});

// API route for product data
app.get('/api/products/:handle', (req, res) => {
    console.log('Product handle requested:', req.params.handle);
    const product = products.find(p => p.handle === req.params.handle);
    if (product) {
        console.log('Product found:', product.title);
        // Maintain exact Shopify data structure
        const transformedProduct = {
            handle: product.handle,
            title: product.title,
            body_html: product.body_html,
            vendor: product.vendor,
            rating_count: product.rating_count || 0,
            variants: product.variants,
            image: {
                src: product.image.src
            }
        };
        res.json(transformedProduct);
    } else {
        console.log('Product not found for handle:', req.params.handle);
        res.status(404).json({ error: 'Product not found' });
    }
});

// API route for all products
app.get('/api/products', (req, res) => {
    res.json(products);
});

// Reviews endpoint
app.get('/api/reviews', (req, res) => {
    const reviews = [];
    fs.createReadStream('reviews.csv')
        .pipe(csv.parse({ columns: true, skip_empty_lines: true }))
        .on('data', (row) => {
            reviews.push(row);
        })
        .on('end', () => {
            res.json(reviews);
        })
        .on('error', (error) => {
            console.error('Error reading reviews:', error);
            res.status(500).json({ error: 'Failed to load reviews' });
        });
});

// Test email endpoint (remove in production)
app.get('/api/test-email', async (req, res) => {
    try {
        // Sample order data
        const order = {
            orderNumber: 'RD' + Date.now().toString().slice(-6),
            customerName: 'Test Customer',
            customerEmail: req.query.email || 'test@example.com',
            items: [
                {
                    title: 'Test Product',
                    price: 24.95,
                    quantity: 1
                }
            ],
            total: 24.95
        };
        
        // Send test email
        const result = await sendOrderConfirmationEmail(order);
        
        if (result) {
            res.json({ success: true, message: 'Test email sent successfully' });
        } else {
            res.status(500).json({ success: false, message: 'Failed to send test email' });
        }
    } catch (error) {
        console.error('Test email error:', error);
        res.status(500).json({ success: false, message: 'Error sending test email', error: error.message });
    }
});

// Frontend Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle other static pages
app.get('/pages/*', (req, res, next) => {
    const filePath = path.join(__dirname, 'public', req.path);
    res.sendFile(filePath, (err) => {
        if (err) {
            next();
        }
    });
});

// Catch-all route for SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
