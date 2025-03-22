// Email template for order confirmations
module.exports = function createOrderConfirmationEmail(order) {
  const { orderNumber, customerName, customerEmail, items, total } = order;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation - Resell Depot</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f9f9f9;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
        }
        .header {
          text-align: center;
          padding: 20px 0;
          border-bottom: 1px solid #eee;
        }
        .logo {
          max-width: 150px;
          height: auto;
        }
        .content {
          padding: 20px 0;
        }
        .order-details {
          margin: 20px 0;
          border: 1px solid #eee;
          border-radius: 5px;
          padding: 15px;
        }
        .order-item {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #eee;
        }
        .order-item:last-child {
          border-bottom: none;
        }
        .total {
          font-weight: bold;
          margin-top: 15px;
          text-align: right;
        }
        .button {
          display: inline-block;
          padding: 10px 20px;
          margin: 20px 10px;
          border-radius: 4px;
          text-decoration: none;
          text-align: center;
          font-weight: bold;
        }
        .button-primary {
          background-color: #000;
          color: #fff;
        }
        .button-outline {
          border: 2px solid #000;
          color: #000;
        }
        .footer {
          text-align: center;
          padding: 20px 0;
          font-size: 12px;
          color: #777;
          border-top: 1px solid #eee;
        }
        .highlight-box {
          background-color: #f8f8f8;
          border-left: 4px solid #000;
          padding: 15px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://cdn.shopify.com/s/files/1/0855/1576/4040/files/Logo.png" alt="Resell Depot Logo" class="logo">
          <h1>Order Confirmation</h1>
        </div>
        
        <div class="content">
          <p>Hello ${customerName},</p>
          <p>Thank you for your purchase from Resell Depot. Your order has been successfully processed.</p>
          
          <div class="order-details">
            <h3>Order #${orderNumber}</h3>
            
            ${items.map(item => `
              <div class="order-item">
                <div>
                  <strong>${item.title}</strong>
                  ${item.variant ? `<br><small>${item.variant}</small>` : ''}
                  <br>Quantity: ${item.quantity}
                </div>
                <div>€${(parseFloat(item.price) * item.quantity).toFixed(2)}</div>
              </div>
            `).join('')}
            
            <div class="total">
              Total: €${total.toFixed(2)}
            </div>
          </div>
          
          <div class="highlight-box">
            <h3>🎉 Your PDF files are ready to download!</h3>
            <p>You can access your purchased tutorial files by logging into your account on our website. These tutorials will guide you step-by-step on how to successfully resell these products for maximum profit.</p>
          </div>
          
          <p>If you have any questions about your order or need assistance with the tutorials, please don't hesitate to reply to this email - we're here to help you succeed!</p>
          
          <div style="text-align: center;">
            <a href="https://resell-depot.eth/pages/contact.html" class="button button-outline">Contact Support</a>
            <a href="https://resell-depot.eth/pages/order-tracking.html?order=${orderNumber}" class="button button-primary">Track Your Order</a>
          </div>
        </div>
        
        <div class="footer">
          <p>This email was sent to ${customerEmail}. You're receiving this email because you made a purchase at Resell Depot.</p>
          <p>If you have any questions, please reply directly to this email or contact our support team.</p>
          <p>&copy; ${new Date().getFullYear()} Resell Depot. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
