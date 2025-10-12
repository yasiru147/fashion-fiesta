const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || process.env.EMAIL_FROM,
      pass: process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS
    }
  });
};

// Send order confirmation email
const sendOrderConfirmationEmail = async (order, user) => {
  try {
    const transporter = createTransporter();

    // Calculate totals
    const subtotal = order.subtotal;
    const tax = order.tax;
    const total = order.totalAmount;

    // Create items list HTML
    const itemsHTML = order.items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
          <strong>${item.name}</strong><br>
          <small style="color: #6b7280;">
            Qty: ${item.quantity} × LKR ${item.price.toFixed(2)}
            ${item.selectedSize ? `<br>Size: ${item.selectedSize}` : ''}
            ${item.selectedColor ? `<br>Color: ${item.selectedColor}` : ''}
          </small>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold; color: #7c3aed;">
          LKR ${(item.quantity * item.price).toFixed(2)}
        </td>
      </tr>
    `).join('');

    const mailOptions = {
      from: process.env.EMAIL_USER || process.env.EMAIL_FROM,
      to: user.email,
      subject: `Order Confirmation - ${order.orderNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmation</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #7c3aed 0%, #ec4899 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">
                Fashion Fiesta
              </h1>
              <p style="color: #fef3c7; margin: 8px 0 0 0; font-size: 14px;">Premium Style Support</p>
            </div>

            <!-- Content -->
            <div style="padding: 40px 30px;">
              <!-- Success Icon -->
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="display: inline-block; width: 80px; height: 80px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; padding: 20px;">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
              </div>

              <h2 style="color: #111827; text-align: center; margin: 0 0 10px 0; font-size: 28px;">
                Order Confirmed!
              </h2>
              <p style="color: #6b7280; text-align: center; margin: 0 0 30px 0; font-size: 16px;">
                Thank you for your order, ${user.name}!
              </p>

              <!-- Order Details Box -->
              <div style="background: linear-gradient(135deg, #ede9fe 0%, #fce7f3 100%); border-radius: 16px; padding: 24px; margin-bottom: 30px; border: 2px solid #e9d5ff;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                  <span style="color: #6b7280; font-size: 14px;">Order Number</span>
                  <strong style="color: #7c3aed; font-size: 16px;">${order.orderNumber}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                  <span style="color: #6b7280; font-size: 14px;">Order Date</span>
                  <strong style="color: #111827;">${new Date(order.createdAt).toLocaleDateString()}</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280; font-size: 14px;">Payment Method</span>
                  <strong style="color: #111827; text-transform: capitalize;">${order.paymentMethod.replace('_', ' ')}</strong>
                </div>
              </div>

              <!-- Shipping Address -->
              <div style="background-color: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
                <h3 style="color: #111827; margin: 0 0 12px 0; font-size: 18px; display: flex; align-items: center;">
                  <span style="margin-right: 8px;">📍</span> Shipping Address
                </h3>
                <p style="color: #4b5563; margin: 0; line-height: 1.6;">
                  ${order.shippingAddress.fullName}<br>
                  ${order.shippingAddress.address}<br>
                  ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}<br>
                  ${order.shippingAddress.country}<br>
                  <strong>Phone:</strong> ${order.shippingAddress.phone}
                </p>
              </div>

              <!-- Order Items -->
              <h3 style="color: #111827; margin: 0 0 16px 0; font-size: 20px;">Order Items</h3>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                <tbody>
                  ${itemsHTML}
                </tbody>
              </table>

              <!-- Order Summary -->
              <div style="background: linear-gradient(135deg, #f3e8ff 0%, #fce7f3 100%); border-radius: 16px; padding: 24px; border: 2px solid #e9d5ff;">
                <h3 style="color: #111827; margin: 0 0 16px 0; font-size: 20px;">Order Summary</h3>
                <div style="display: flex; justify-content: space-between; margin-bottom: 12px; color: #4b5563;">
                  <span>Subtotal</span>
                  <span style="font-weight: 600;">LKR ${subtotal.toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 12px; color: #4b5563;">
                  <span>Shipping</span>
                  <span style="font-weight: 600; color: #10b981;">FREE</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 16px; color: #4b5563;">
                  <span>Tax (10%)</span>
                  <span style="font-weight: 600;">LKR ${tax.toFixed(2)}</span>
                </div>
                <div style="border-top: 2px solid #c084fc; padding-top: 16px; display: flex; justify-content: space-between;">
                  <span style="font-size: 20px; font-weight: bold; color: #111827;">Total</span>
                  <span style="font-size: 24px; font-weight: bold; color: #7c3aed;">LKR ${total.toFixed(2)}</span>
                </div>
              </div>

              ${order.notes ? `
                <div style="background-color: #fef3c7; border-radius: 12px; padding: 16px; margin-top: 24px; border-left: 4px solid #f59e0b;">
                  <strong style="color: #92400e;">Order Notes:</strong>
                  <p style="color: #78350f; margin: 8px 0 0 0;">${order.notes}</p>
                </div>
              ` : ''}

              <!-- What's Next -->
              <div style="margin-top: 40px; padding: 24px; background-color: #eff6ff; border-radius: 12px; border-left: 4px solid #3b82f6;">
                <h3 style="color: #1e40af; margin: 0 0 12px 0; font-size: 18px;">What's Next?</h3>
                <ul style="color: #1e3a8a; margin: 0; padding-left: 20px; line-height: 1.8;">
                  <li>We'll send you another email when your order ships</li>
                  <li>Track your order status in your account</li>
                  <li>Contact us if you have any questions</li>
                </ul>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin-top: 32px;">
                <a href="http://localhost:3000/my-orders" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #ec4899 100%); color: #ffffff; padding: 16px 40px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px;">
                  View Order Details
                </a>
              </div>
            </div>

            <!-- Footer -->
            <div style="background-color: #f9fafb; padding: 30px 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; margin: 0 0 8px 0; font-size: 14px;">
                Thank you for shopping with Fashion Fiesta!
              </p>
              <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                If you have any questions, contact us at ${process.env.EMAIL_USER || process.env.EMAIL_FROM}
              </p>
              <div style="margin-top: 16px;">
                <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                  © ${new Date().getFullYear()} Fashion Fiesta. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Order confirmation email sent to ${user.email}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return { success: false, error: error.message };
  }
};

// Send order status update email
const sendOrderStatusUpdateEmail = async (order, user) => {
  try {
    const transporter = createTransporter();

    // Get status-specific content
    const getStatusContent = (status) => {
      switch (status) {
        case 'processing':
          return {
            icon: '⚙️',
            title: 'Order is Being Processed',
            message: 'Your order is now being prepared by our team!',
            color: '#3b82f6',
            gradient: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            nextSteps: [
              'Our team is carefully preparing your items',
              'Quality checks are being performed',
              'Your order will be shipped soon'
            ]
          };
        case 'shipped':
          return {
            icon: '🚚',
            title: 'Order Has Been Shipped',
            message: 'Your order is on its way to you!',
            color: '#f59e0b',
            gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
            nextSteps: [
              'Your package is in transit',
              'Track your shipment with the tracking number below',
              'Estimated delivery: 3-5 business days'
            ]
          };
        case 'delivered':
          return {
            icon: '✅',
            title: 'Order Delivered Successfully',
            message: 'Your order has been delivered!',
            color: '#10b981',
            gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            nextSteps: [
              'We hope you enjoy your purchase!',
              'Please confirm receipt of your order',
              'Leave a review to help other shoppers'
            ]
          };
        case 'cancelled':
          return {
            icon: '❌',
            title: 'Order Cancelled',
            message: 'Your order has been cancelled',
            color: '#ef4444',
            gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            nextSteps: [
              'Your refund will be processed within 5-7 business days',
              'Stock has been restored for cancelled items',
              'Feel free to place a new order anytime'
            ]
          };
        default:
          return {
            icon: '📦',
            title: 'Order Status Updated',
            message: 'Your order status has been updated',
            color: '#7c3aed',
            gradient: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
            nextSteps: [
              'Check your order details for more information',
              'Track your order status in your account',
              'Contact us if you have any questions'
            ]
          };
      }
    };

    const statusContent = getStatusContent(order.orderStatus);

    const mailOptions = {
      from: process.env.EMAIL_USER || process.env.EMAIL_FROM,
      to: user.email,
      subject: `Order Update - ${order.orderNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Status Update</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #7c3aed 0%, #ec4899 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">
                Fashion Fiesta
              </h1>
              <p style="color: #fef3c7; margin: 8px 0 0 0; font-size: 14px;">Premium Style Support</p>
            </div>

            <!-- Content -->
            <div style="padding: 40px 30px;">
              <!-- Status Icon -->
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="display: inline-block; width: 80px; height: 80px; background: ${statusContent.gradient}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 40px;">
                  ${statusContent.icon}
                </div>
              </div>

              <h2 style="color: #111827; text-align: center; margin: 0 0 10px 0; font-size: 28px;">
                ${statusContent.title}
              </h2>
              <p style="color: #6b7280; text-align: center; margin: 0 0 30px 0; font-size: 16px;">
                ${statusContent.message}
              </p>

              <!-- Order Details Box -->
              <div style="background: linear-gradient(135deg, #ede9fe 0%, #fce7f3 100%); border-radius: 16px; padding: 24px; margin-bottom: 30px; border: 2px solid #e9d5ff;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                  <span style="color: #6b7280; font-size: 14px;">Order Number</span>
                  <strong style="color: #7c3aed; font-size: 16px;">${order.orderNumber}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                  <span style="color: #6b7280; font-size: 14px;">Order Date</span>
                  <strong style="color: #111827;">${new Date(order.createdAt).toLocaleDateString()}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                  <span style="color: #6b7280; font-size: 14px;">Current Status</span>
                  <strong style="color: ${statusContent.color}; text-transform: capitalize;">${order.orderStatus}</strong>
                </div>
                ${order.trackingNumber ? `
                  <div style="display: flex; justify-content: space-between;">
                    <span style="color: #6b7280; font-size: 14px;">Tracking Number</span>
                    <strong style="color: #111827;">${order.trackingNumber}</strong>
                  </div>
                ` : ''}
              </div>

              <!-- Shipping Address -->
              <div style="background-color: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
                <h3 style="color: #111827; margin: 0 0 12px 0; font-size: 18px; display: flex; align-items: center;">
                  <span style="margin-right: 8px;">📍</span> Shipping Address
                </h3>
                <p style="color: #4b5563; margin: 0; line-height: 1.6;">
                  ${order.shippingAddress.fullName}<br>
                  ${order.shippingAddress.address}<br>
                  ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}<br>
                  ${order.shippingAddress.country}<br>
                  <strong>Phone:</strong> ${order.shippingAddress.phone}
                </p>
              </div>

              <!-- What's Next -->
              <div style="margin-top: 40px; padding: 24px; background-color: #eff6ff; border-radius: 12px; border-left: 4px solid ${statusContent.color};">
                <h3 style="color: #1e40af; margin: 0 0 12px 0; font-size: 18px;">What's Next?</h3>
                <ul style="color: #1e3a8a; margin: 0; padding-left: 20px; line-height: 1.8;">
                  ${statusContent.nextSteps.map(step => `<li>${step}</li>`).join('')}
                </ul>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin-top: 32px;">
                <a href="http://localhost:3000/my-orders" style="display: inline-block; background: ${statusContent.gradient}; color: #ffffff; padding: 16px 40px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px;">
                  View Order Details
                </a>
              </div>
            </div>

            <!-- Footer -->
            <div style="background-color: #f9fafb; padding: 30px 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; margin: 0 0 8px 0; font-size: 14px;">
                Thank you for shopping with Fashion Fiesta!
              </p>
              <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                If you have any questions, contact us at ${process.env.EMAIL_USER || process.env.EMAIL_FROM}
              </p>
              <div style="margin-top: 16px;">
                <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                  © ${new Date().getFullYear()} Fashion Fiesta. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Order status update email sent to ${user.email}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending order status update email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail
};
