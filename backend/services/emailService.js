const nodemailer = require('nodemailer');

// Create transporter configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send email notification when staff replies to ticket
const sendStaffReplyNotification = async (ticket, reply, staffUser) => {
  console.log('📧 EMAIL SERVICE: Starting email notification process...');

  try {
    const transporter = createTransporter();

    const customerName = ticket.customerId.name || 'Valued Customer';
    const customerEmail = ticket.customerId.email;
    const staffName = staffUser.name || 'Support Staff';
    const ticketSubject = ticket.subject;
    const replyMessage = reply.message;
    const ticketId = ticket._id.toString().slice(-8).toUpperCase();

    console.log('📊 EMAIL SERVICE: Email details:');
    console.log('  - To:', customerEmail);
    console.log('  - From Staff:', staffName);
    console.log('  - Ticket:', ticketSubject);
    console.log('  - Environment Variables:');
    console.log('    - EMAIL_USER:', process.env.EMAIL_USER ? '✅ Set' : '❌ Missing');
    console.log('    - EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Set' : '❌ Missing');
    console.log('    - EMAIL_HOST:', process.env.EMAIL_HOST || 'Using default');
    console.log('    - EMAIL_PORT:', process.env.EMAIL_PORT || 'Using default');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Fashion Fiesta - New Reply to Your Ticket</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f8fafc;
          }
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .header p {
            margin: 8px 0 0 0;
            opacity: 0.9;
            font-size: 16px;
          }
          .content {
            padding: 30px;
          }
          .ticket-info {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #0ea5e9;
          }
          .ticket-info h3 {
            margin: 0 0 10px 0;
            color: #0c4a6e;
            font-size: 18px;
          }
          .ticket-info p {
            margin: 5px 0;
            color: #0f172a;
          }
          .reply-box {
            background: linear-gradient(135deg, #dcfdf7 0%, #ccfbf1 100%);
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #10b981;
          }
          .reply-box h3 {
            margin: 0 0 15px 0;
            color: #064e3b;
            font-size: 18px;
            display: flex;
            align-items: center;
          }
          .staff-badge {
            background: #10b981;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            margin-left: 10px;
          }
          .reply-message {
            color: #0f172a;
            font-size: 16px;
            line-height: 1.6;
            background: white;
            padding: 15px;
            border-radius: 6px;
            border: 1px solid #d1fae5;
          }
          .action-button {
            display: inline-block;
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 8px;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
            transition: transform 0.2s;
          }
          .action-button:hover {
            transform: translateY(-2px);
          }
          .footer {
            background: #f8fafc;
            padding: 20px;
            text-align: center;
            color: #64748b;
            font-size: 14px;
            border-top: 1px solid #e2e8f0;
          }
          .footer a {
            color: #6366f1;
            text-decoration: none;
          }
          .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
            margin: 20px 0;
          }
          .status-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
          }
          .status-in-progress {
            background: #fef3c7;
            color: #92400e;
          }
          .status-open {
            background: #fee2e2;
            color: #991b1b;
          }
          .status-resolved {
            background: #d1fae5;
            color: #065f46;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>👗 Fashion Fiesta</h1>
            <p>Premium Fashion Support</p>
          </div>

          <div class="content">
            <h2 style="color: #1e293b; margin-bottom: 10px;">Dear ${customerName},</h2>
            <p style="color: #475569; font-size: 16px;">Great news! Our support team has replied to your ticket.</p>

            <div class="ticket-info">
              <h3>📋 Ticket Information</h3>
              <p><strong>Ticket ID:</strong> #${ticketId}</p>
              <p><strong>Subject:</strong> ${ticketSubject}</p>
              <p><strong>Status:</strong> <span class="status-badge status-${ticket.status.toLowerCase().replace(' ', '-')}">${ticket.status}</span></p>
              <p><strong>Priority:</strong> ${ticket.priority}</p>
            </div>

            <div class="reply-box">
              <h3>
                💬 New Reply from ${staffName}
                <span class="staff-badge">STAFF</span>
              </h3>
              <div class="reply-message">
                ${replyMessage.replace(/\n/g, '<br>')}
              </div>
            </div>

            <div class="divider"></div>

            <p style="color: #475569; text-align: center;">
              <a href="http://localhost:3000/tickets/${ticket._id}" class="action-button">
                🔗 View Full Conversation
              </a>
            </p>

            <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin-top: 30px;">
              <h4 style="margin: 0 0 10px 0; color: #334155;">💡 What's Next?</h4>
              <ul style="color: #475569; padding-left: 20px;">
                <li>Log into your account to view the full conversation</li>
                <li>Reply directly to continue the discussion</li>
                <li>Check your ticket status and updates</li>
              </ul>
            </div>
          </div>

          <div class="footer">
            <p>
              This is an automated message from Fashion Fiesta Support System.<br>
              If you have any questions, please contact us at
              <a href="mailto:support@fashionfiesta.com">support@fashionfiesta.com</a>
            </p>
            <p style="margin-top: 15px;">
              <a href="http://localhost:3000">Visit Fashion Fiesta</a> |
              <a href="http://localhost:3000/my-tickets">My Tickets</a> |
              <a href="mailto:support@fashionfiesta.com">Contact Support</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: {
        name: 'Fashion Fiesta Support',
        address: process.env.EMAIL_FROM || process.env.EMAIL_USER
      },
      to: customerEmail,
      subject: `✅ New Reply to Your Ticket: ${ticketSubject} (#${ticketId})`,
      html: htmlContent,
      // Fallback text version
      text: `
Dear ${customerName},

Great news! Our support team has replied to your ticket.

Ticket Information:
- Ticket ID: #${ticketId}
- Subject: ${ticketSubject}
- Status: ${ticket.status}
- Priority: ${ticket.priority}

New Reply from ${staffName} (Staff):
${replyMessage}

You can view the full conversation and reply by visiting:
http://localhost:3000/tickets/${ticket._id}

Best regards,
Fashion Fiesta Support Team
      `
    };

    // Send email if credentials are configured
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully to:', customerEmail);
        console.log('📧 Message ID:', info.messageId);
        return { success: true, messageId: info.messageId };
      } catch (emailError) {
        console.error('❌ Email sending failed:', emailError.message);

        // Fallback to development mode display
        console.log('📧 EMAIL NOTIFICATION (FALLBACK - SMTP ERROR)');
        console.log('═══════════════════════════════════════════');
        console.log(`To: ${customerEmail}`);
        console.log(`Subject: ${mailOptions.subject}`);
        console.log('Content Preview:');
        console.log(`- Customer: ${customerName}`);
        console.log(`- Ticket: #${ticketId} - ${ticketSubject}`);
        console.log(`- Reply from: ${staffName} (Staff)`);
        console.log(`- Message: ${replyMessage.substring(0, 100)}${replyMessage.length > 100 ? '...' : ''}`);
        console.log('═══════════════════════════════════════════');

        return { success: false, error: emailError.message, fallback: true };
      }
    } else {
      // Simulate email sending when credentials not configured
      console.log('📧 EMAIL NOTIFICATION (DEVELOPMENT MODE - NO CREDENTIALS)');
      console.log('═══════════════════════════════════════════');
      console.log(`To: ${customerEmail}`);
      console.log(`Subject: ${mailOptions.subject}`);
      console.log('Content Preview:');
      console.log(`- Customer: ${customerName}`);
      console.log(`- Ticket: #${ticketId} - ${ticketSubject}`);
      console.log(`- Reply from: ${staffName} (Staff)`);
      console.log(`- Message: ${replyMessage.substring(0, 100)}${replyMessage.length > 100 ? '...' : ''}`);
      console.log('💡 Add EMAIL_USER and EMAIL_PASS to .env to send real emails');
      console.log('═══════════════════════════════════════════');

      return {
        success: true,
        messageId: 'dev-mode-' + Date.now(),
        note: 'Email simulated - add credentials to .env for real emails'
      };
    }
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendStaffReplyNotification
};