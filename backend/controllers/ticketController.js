const Ticket = require('../models/Ticket');
const User = require('../models/User');
const PDFDocument = require('pdfkit');
const { sendStaffReplyNotification } = require('../services/emailService');

// Mock tickets for demo when database is not available
const mockTickets = [
  {
    _id: 't1',
    ticketId: 'TKT-2024-001',
    customerId: { _id: '4', id: '4', name: 'Ravindu Pasanjith', email: 'ravindupasanjith1542@gmail.com' },
    subject: 'Issue with Order Delivery',
    message: 'My order has not been delivered yet. It has been 5 days since I placed the order.',
    category: 'Delivery',
    priority: 'High',
    status: 'Open',
    customerName: 'Ravindu Pasanjith',
    customerEmail: 'ravindupasanjith1542@gmail.com',
    customerPhone: '+94771234567',
    orderNumber: 'ORD-2024-789',
    productName: 'Designer Jacket',
    issueType: 'Delivery Delay',
    attachments: [],
    replies: [],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    lastActivity: new Date('2024-01-15')
  },
  {
    _id: 't2',
    ticketId: 'TKT-2024-002',
    customerId: { _id: '4', id: '4', name: 'Ravindu Pasanjith', email: 'ravindupasanjith1542@gmail.com' },
    subject: 'Product Quality Issue',
    message: 'The product quality is not as expected. The fabric seems different from the photos.',
    category: 'Quality',
    priority: 'Medium',
    status: 'Resolved',
    customerName: 'Ravindu Pasanjith',
    customerEmail: 'ravindupasanjith1542@gmail.com',
    customerPhone: '+94771234567',
    orderNumber: 'ORD-2024-456',
    productName: 'Premium T-Shirt',
    issueType: 'Quality Issue',
    attachments: [],
    replies: [
      {
        _id: 'r1',
        userId: { _id: '2', name: 'Support Staff', role: 'support' },
        message: 'We apologize for the inconvenience. A replacement has been sent.',
        createdAt: new Date('2024-01-16')
      }
    ],
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-16'),
    lastActivity: new Date('2024-01-16')
  },
  {
    _id: 't3',
    ticketId: 'TKT-2024-003',
    customerId: { _id: '1', id: '1', name: 'Admin User', email: 'admin@fashionfiesta.com' },
    subject: 'System Feature Request',
    message: 'Request to add dark mode to the dashboard.',
    category: 'Feature Request',
    priority: 'Low',
    status: 'Open',
    attachments: [],
    replies: [],
    createdAt: new Date('2024-01-13'),
    updatedAt: new Date('2024-01-13'),
    lastActivity: new Date('2024-01-13')
  }
];

const createTicket = async (req, res) => {
  try {
    const { subject, message, category, priority } = req.body;
    const files = req.files || [];

    // Process uploaded files
    const attachments = files.map(file => ({
      fileName: file.originalname,
      fileUrl: file.path,
      fileSize: file.size,
      fileType: file.mimetype
    }));

    const ticket = new Ticket({
      customerId: req.user._id,
      subject,
      message,
      category: category || 'General',
      priority: priority || 'Medium',
      attachments
    });

    await ticket.save();
    await ticket.populate('customerId', 'name email');

    res.status(201).json({
      success: true,
      ticket
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating ticket'
    });
  }
};

const getMyTickets = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Try database first
    try {
      const tickets = await Ticket.find({ customerId: req.user._id })
        .populate('customerId', 'name email')
        .populate('replies.userId', 'name role')
        .sort({ lastActivity: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Ticket.countDocuments({ customerId: req.user._id });

      return res.json({
        success: true,
        tickets,
        pagination: {
          page,
          pages: Math.ceil(total / limit),
          total
        }
      });
    } catch (dbError) {
      console.log('Database not available, using mock tickets');
    }

    // Fallback to mock tickets
    const userTickets = mockTickets.filter(t =>
      t.customerId._id === req.user.id ||
      t.customerId._id === req.user._id ||
      t.customerId.id === req.user.id
    );

    const paginatedTickets = userTickets.slice(skip, skip + limit);

    res.json({
      success: true,
      tickets: paginatedTickets,
      pagination: {
        page,
        pages: Math.ceil(userTickets.length / limit),
        total: userTickets.length
      }
    });
  } catch (error) {
    console.error('Get my tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching tickets'
    });
  }
};

const getAllTickets = async (req, res) => {
  try {
    const { search, status, priority, category, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    if (category) {
      query.category = category;
    }

    const tickets = await Ticket.find(query)
      .populate('customerId', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ lastActivity: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Ticket.countDocuments(query);

    res.json({
      success: true,
      tickets,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get all tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching tickets'
    });
  }
};

const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('customerId', 'name email phone')
      .populate('assignedTo', 'name email')
      .populate('replies.userId', 'name role');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    if (req.user.role === 'customer' && ticket.customerId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      ticket
    });
  } catch (error) {
    console.error('Get ticket by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching ticket'
    });
  }
};

const addReply = async (req, res) => {
  try {
    const { message } = req.body;
    const ticketId = req.params.id; //read the path param

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    if (req.user.role === 'customer' && ticket.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const reply = {
      userId: req.user._id,
      message,
      isStaff: req.user.role === 'admin' || req.user.role === 'support'
    };

    ticket.replies.push(reply);
    ticket.lastActivity = new Date();

    if (req.user.role === 'admin' || req.user.role === 'support') {
      if (ticket.status === 'Open') {
        ticket.status = 'In Progress';
      }
      if (!ticket.assignedTo) {
        ticket.assignedTo = req.user._id;
      }
    }

    await ticket.save();
    await ticket.populate('replies.userId', 'name role');

    // Send email notification if staff replied to customer ticket
    console.log('🔍 Checking if should send email notification...');
    console.log('User role:', req.user.role);
    console.log('Is admin or support?', req.user.role === 'admin' || req.user.role === 'support');

    if (req.user.role === 'admin' || req.user.role === 'support') {
      console.log('🚀 Staff user detected, attempting to send email...');
      try {
        // Populate customer information if not already populated
        await ticket.populate('customerId', 'name email');
        console.log('📧 Customer email:', ticket.customerId.email);

        const newReply = ticket.replies[ticket.replies.length - 1];
        console.log('💬 Reply message:', newReply.message);

        const emailResult = await sendStaffReplyNotification(ticket, newReply, req.user);
        console.log('📬 Email service result:', emailResult);

        if (emailResult.success) {
          console.log('✅ Email notification sent successfully to customer');
        } else {
          console.log('⚠️ Email notification failed:', emailResult.error);
        }
      } catch (emailError) {
        // Don't fail the reply if email fails - just log it
        console.error('❌ Email notification error:', emailError);
      }
    } else {
      console.log('👤 Customer reply detected, no email needed');
    }

    res.json({
      success: true,
      reply: ticket.replies[ticket.replies.length - 1]
    });
  } catch (error) {
    console.error('Add reply error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding reply'
    });
  }
};

const updateTicketStatus = async (req, res) => {
  try {
    const { status, assignedTo } = req.body;
    const ticketId = req.params.id;

    const updateData = {};

    if (status) {
      updateData.status = status;
      updateData.lastActivity = new Date();
    }

    if (assignedTo) {
      updateData.assignedTo = assignedTo;
    }

    const ticket = await Ticket.findByIdAndUpdate(
      ticketId,
      updateData,
      { new: true }
    )
    .populate('customerId', 'name email')
    .populate('assignedTo', 'name email');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    res.json({
      success: true,
      ticket
    });
  } catch (error) {
    console.error('Update ticket status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating ticket'
    });
  }
};

const downloadTicketPDF = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('customerId', 'name email phone')
      .populate('assignedTo', 'name email')
      .populate('replies.userId', 'name role');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    if (req.user.role === 'customer' && ticket.customerId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Fashion-Fiesta-Ticket-${ticket._id}.pdf"`);

    doc.pipe(res);

    // Define colors
    const colors = {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      accent: '#06b6d4',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      dark: '#1f2937',
      gray: '#6b7280',
      lightGray: '#f3f4f6'
    };

    // Helper functions for better formatting
    const addHeader = () => {
      // Create gradient-like effect with multiple layers
      doc.rect(0, 0, doc.page.width, 100)
         .fillAndStroke('#1e40af', '#1e40af');

      doc.rect(0, 0, doc.page.width, 90)
         .fillAndStroke('#2563eb', '#2563eb');

      doc.rect(0, 0, doc.page.width, 80)
         .fillAndStroke('#3b82f6', '#3b82f6');

      doc.rect(0, 0, doc.page.width, 70)
         .fillAndStroke('#6366f1', '#6366f1');

      // Decorative elements
      doc.circle(doc.page.width - 50, 25, 15)
         .fillAndStroke('#8b5cf6', '#8b5cf6');

      doc.circle(doc.page.width - 80, 45, 10)
         .fillAndStroke('#a855f7', '#a855f7');

      doc.circle(doc.page.width - 110, 30, 8)
         .fillAndStroke('#c084fc', '#c084fc');

      // Fashion icon simulation
      doc.rect(50, 15, 30, 3)
         .fillAndStroke('#fbbf24', '#fbbf24');

      doc.rect(52, 20, 26, 2)
         .fillAndStroke('#f59e0b', '#f59e0b');

      doc.rect(54, 25, 22, 2)
         .fillAndStroke('#d97706', '#d97706');

      // Company logo area with enhanced styling
      doc.fillColor('#ffffff')
         .fontSize(28)
         .font('Helvetica-Bold')
         .text('Fashion Fiesta', 90, 15);

      // Add stylish underline
      doc.moveTo(90, 45)
         .lineTo(280, 45)
         .strokeColor('#fbbf24')
         .lineWidth(3)
         .stroke();

      // Tagline with gradient-like effect
      doc.fillColor('#fef3c7')
         .fontSize(14)
         .font('Helvetica-Bold')
         .text('Premium Fashion Support', 90, 50);

      doc.fillColor('#fde68a')
         .fontSize(12)
         .font('Helvetica')
         .text('Your Style, Our Priority', 90, 68);

      // Right side information box
      const rightBoxX = doc.page.width - 220;
      doc.rect(rightBoxX, 15, 180, 55)
         .fillAndStroke('#1e1b4b', '#312e81')
         .lineWidth(1);

      // Ticket info
      doc.fillColor('#fbbf24')
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('TICKET INFORMATION', rightBoxX + 10, 22);

      doc.fillColor('#ffffff')
         .fontSize(11)
         .font('Helvetica-Bold')
         .text(`ID: ${ticket._id.toString().slice(-8).toUpperCase()}`, rightBoxX + 10, 38);

      doc.fillColor('#e2e8f0')
         .fontSize(9)
         .font('Helvetica')
         .text(`Generated: ${new Date().toLocaleString()}`, rightBoxX + 10, 50);

      doc.fillColor('#cbd5e1')
         .fontSize(9)
         .font('Helvetica')
         .text(`Status: ${ticket.status} | Priority: ${ticket.priority}`, rightBoxX + 10, 62);

      // Bottom border with pattern
      for (let i = 0; i < doc.page.width; i += 20) {
        doc.rect(i, 85, 15, 3)
           .fillAndStroke('#8b5cf6', '#8b5cf6');
      }

      // Add shadow effect
      doc.rect(0, 88, doc.page.width, 2)
         .fillAndStroke('#64748b', '#64748b');

      doc.rect(0, 90, doc.page.width, 1)
         .fillAndStroke('#94a3b8', '#94a3b8');
    };

    const addSection = (title, yPos) => {
      doc.fillColor(colors.dark)
         .fontSize(16)
         .font('Helvetica-Bold')
         .text(title, 50, yPos);

      // Add underline
      doc.moveTo(50, yPos + 20)
         .lineTo(300, yPos + 20)
         .strokeColor(colors.primary)
         .lineWidth(2)
         .stroke();

      return yPos + 35;
    };

    const addInfoBox = (title, content, xPos, yPos, width = 240, height = 60) => {
      // Box background
      doc.rect(xPos, yPos, width, height)
         .fillAndStroke(colors.lightGray, colors.gray);

      // Title
      doc.fillColor(colors.dark)
         .fontSize(10)
         .font('Helvetica-Bold')
         .text(title, xPos + 10, yPos + 10);

      // Content
      doc.fillColor(colors.dark)
         .fontSize(12)
         .font('Helvetica')
         .text(content, xPos + 10, yPos + 25, { width: width - 20 });

      return yPos + height + 10;
    };

    const addStatusBadge = (status, xPos, yPos) => {
      const statusColors = {
        'Open': colors.error,
        'In Progress': colors.warning,
        'Resolved': colors.success,
        'Closed': colors.gray
      };

      const badgeColor = statusColors[status] || colors.gray;

      doc.rect(xPos, yPos, 80, 25)
         .fillAndStroke(badgeColor, badgeColor);

      doc.fillColor('white')
         .fontSize(10)
         .font('Helvetica-Bold')
         .text(status, xPos + 5, yPos + 8);
    };

    const addPriorityBadge = (priority, xPos, yPos) => {
      const priorityColors = {
        'Low': colors.success,
        'Medium': colors.warning,
        'High': '#f97316',
        'Urgent': colors.error
      };

      const badgeColor = priorityColors[priority] || colors.gray;

      doc.rect(xPos, yPos, 80, 25)
         .fillAndStroke(badgeColor, badgeColor);

      doc.fillColor('white')
         .fontSize(10)
         .font('Helvetica-Bold')
         .text(priority, xPos + 5, yPos + 8);
    };

    // Start building the PDF
    addHeader();

    let currentY = 110;

    // Ticket Subject - Large and prominent
    doc.fillColor(colors.dark)
       .fontSize(20)
       .font('Helvetica-Bold')
       .text(ticket.subject, 50, currentY, { width: 500 });

    currentY += 40;

    // Status and Priority badges
    doc.fillColor(colors.gray)
       .fontSize(12)
       .font('Helvetica')
       .text('Status:', 50, currentY + 5);

    addStatusBadge(ticket.status, 100, currentY);

    doc.fillColor(colors.gray)
       .fontSize(12)
       .font('Helvetica')
       .text('Priority:', 200, currentY + 5);

    addPriorityBadge(ticket.priority, 250, currentY);

    doc.fillColor(colors.gray)
       .fontSize(12)
       .font('Helvetica')
       .text('Category:', 350, currentY + 5);

    doc.rect(400, currentY, 100, 25)
       .fillAndStroke(colors.lightGray, colors.gray);

    doc.fillColor(colors.dark)
       .fontSize(10)
       .font('Helvetica')
       .text(ticket.category, 405, currentY + 8);

    currentY += 50;

    // Customer Information Section
    currentY = addSection('Customer Information', currentY);

    currentY = addInfoBox(
      'Customer Name',
      ticket.customerId.name,
      50, currentY, 240, 50
    );

    addInfoBox(
      'Email Address',
      ticket.customerId.email,
      310, currentY - 60, 240, 50
    );

    if (ticket.customerId.phone) {
      currentY = addInfoBox(
        'Phone Number',
        ticket.customerId.phone,
        50, currentY, 240, 50
      );
    }

    currentY += 20;

    // Ticket Details Section
    currentY = addSection('Ticket Details', currentY);

    currentY = addInfoBox(
      'Created Date',
      new Date(ticket.createdAt).toLocaleString(),
      50, currentY, 240, 50
    );

    addInfoBox(
      'Last Activity',
      new Date(ticket.lastActivity).toLocaleString(),
      310, currentY - 60, 240, 50
    );

    if (ticket.assignedTo) {
      currentY = addInfoBox(
        'Assigned To',
        `${ticket.assignedTo.name} (${ticket.assignedTo.email})`,
        50, currentY, 500, 50
      );
    }

    currentY += 20;

    // Parse and display structured message content
    const parseTicketMessage = (message) => {
      const sections = {};

      const customerMatch = message.match(/CUSTOMER INFORMATION:(.*?)(?=ORDER INFORMATION|ADDITIONAL DETAILS|$)/s);
      if (customerMatch) {
        sections.customer = customerMatch[1].trim();
      }

      const orderMatch = message.match(/ORDER INFORMATION:(.*?)(?=ADDITIONAL DETAILS|CATEGORY|$)/s);
      if (orderMatch) {
        sections.order = orderMatch[1].trim();
      }

      const detailsMatch = message.match(/ADDITIONAL DETAILS:(.*?)(?=CATEGORY|PRIORITY|$)/s);
      if (detailsMatch) {
        sections.details = detailsMatch[1].trim();
      }

      return sections;
    };

    const parsedMessage = parseTicketMessage(ticket.message);

    // Original Message Section
    currentY = addSection('Issue Description', currentY);

    if (parsedMessage.details) {
      // Structured content
      doc.rect(50, currentY, 500, 80)
         .fillAndStroke('#f8fafc', '#e2e8f0');

      doc.fillColor(colors.dark)
         .fontSize(12)
         .font('Helvetica')
         .text(parsedMessage.details, 60, currentY + 15, {
           width: 480,
           align: 'justify'
         });

      currentY += 100;

      if (parsedMessage.order && parsedMessage.order !== 'Order Number: Not applicable\nIssue Date: Not specified') {
        currentY = addSection('Order Information', currentY);

        doc.rect(50, currentY, 500, 60)
           .fillAndStroke('#fef3c7', '#f59e0b');

        doc.fillColor(colors.dark)
           .fontSize(11)
           .font('Helvetica')
           .text(parsedMessage.order, 60, currentY + 15, {
             width: 480
           });

        currentY += 80;
      }
    } else {
      // Fallback for unstructured content
      doc.rect(50, currentY, 500, 100)
         .fillAndStroke('#f8fafc', '#e2e8f0');

      doc.fillColor(colors.dark)
         .fontSize(12)
         .font('Helvetica')
         .text(ticket.message, 60, currentY + 15, {
           width: 480,
           align: 'justify'
         });

      currentY += 120;
    }

    // Conversation Section
    if (ticket.replies && ticket.replies.length > 0) {
      currentY = addSection('Conversation History', currentY);

      ticket.replies.forEach((reply, index) => {
        const isStaff = reply.isStaff;
        const bgColor = isStaff ? '#dcfdf7' : '#f0f9ff';
        const borderColor = isStaff ? '#10b981' : '#0ea5e9';

        // Reply container
        doc.rect(50, currentY, 500, 80)
           .fillAndStroke(bgColor, borderColor);

        // Reply header
        doc.fillColor(colors.dark)
           .fontSize(11)
           .font('Helvetica-Bold')
           .text(`${reply.userId.name} ${isStaff ? '(Support Staff)' : '(Customer)'}`, 60, currentY + 10);

        doc.fillColor(colors.gray)
           .fontSize(9)
           .font('Helvetica')
           .text(new Date(reply.createdAt).toLocaleString(), 400, currentY + 10);

        // Reply content
        doc.fillColor(colors.dark)
           .fontSize(11)
           .font('Helvetica')
           .text(reply.message, 60, currentY + 30, {
             width: 480,
             height: 40
           });

        currentY += 90;
      });
    }

    // Footer
    const footerY = doc.page.height - 60;
    doc.rect(0, footerY, doc.page.width, 60)
       .fillAndStroke('#f3f4f6', '#d1d5db');

    doc.fillColor(colors.gray)
       .fontSize(10)
       .font('Helvetica')
       .text('Fashion Fiesta Support System', 50, footerY + 15);

    doc.fillColor(colors.gray)
       .fontSize(9)
       .text(`This ticket was generated on ${new Date().toLocaleString()}`, 50, footerY + 30);

    doc.fillColor(colors.gray)
       .fontSize(9)
       .text('For support inquiries, contact: support@fashionfiesta.com', 50, footerY + 45);

    doc.end();
  } catch (error) {
    console.error('Download PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error generating PDF'
    });
  }
};

const updateTicket = async (req, res) => {
  try {
    const ticketId = req.params.id;
    const { subject, message, category, priority, attachments } = req.body;

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check if user owns the ticket or is admin/support
    if (req.user.role === 'customer' && ticket.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Prevent editing ticket content that have staff replies (unless user is admin/staff)
    // Allow attachment-only updates even with staff replies
    console.log('🔍 Update ticket request:', { attachments: !!attachments, subject: !!subject, message: !!message, category: !!category, priority: !!priority });
    const hasStaffReplies = ticket.replies.some(reply => reply.isStaff);
    const isAttachmentOnlyUpdate = req.body.attachments &&
                                  !req.body.subject &&
                                  !req.body.message &&
                                  !req.body.category &&
                                  !req.body.priority;

    if (hasStaffReplies && req.user.role === 'customer' && !isAttachmentOnlyUpdate) {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit ticket with staff responses. Please contact support.'
      });
    }

    // Update ticket fields
    const updateData = {};
    if (subject) updateData.subject = subject;
    if (message) updateData.message = message;
    if (category) updateData.category = category;
    if (priority) updateData.priority = priority;
    if (attachments) updateData.attachments = attachments;
    updateData.lastActivity = new Date();

    const updatedTicket = await Ticket.findByIdAndUpdate(
      ticketId,
      updateData,
      { new: true }
    )
    .populate('customerId', 'name email')
    .populate('assignedTo', 'name email')
    .populate('replies.userId', 'name role');

    res.json({
      success: true,
      ticket: updatedTicket,
      message: 'Ticket updated successfully'
    });
  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating ticket'
    });
  }
};

const deleteTicket = async (req, res) => {
  try {
    const ticketId = req.params.id;

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check if user owns the ticket or is admin/support
    if (req.user.role === 'customer' && ticket.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Prevent deletion of tickets that have replies from staff
    const hasStaffReplies = ticket.replies.some(reply => reply.isStaff);
    if (hasStaffReplies && req.user.role === 'customer') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete ticket with staff responses. Please contact support.'
      });
    }

    await Ticket.findByIdAndDelete(ticketId);

    res.json({
      success: true,
      message: 'Ticket deleted successfully'
    });
  } catch (error) {
    console.error('Delete ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting ticket'
    });
  }
};

const editReply = async (req, res) => {
  try {
    const { ticketId, replyId } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Reply message is required'
      });
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    const reply = ticket.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({
        success: false,
        message: 'Reply not found'
      });
    }

    // Only allow staff to edit staff replies
    if (req.user.role !== 'admin' && req.user.role !== 'support') {
      return res.status(403).json({
        success: false,
        message: 'Only staff can edit replies'
      });
    }

    // Check if this is a staff reply
    if (!reply.isStaff) {
      return res.status(403).json({
        success: false,
        message: 'Can only edit staff replies'
      });
    }

    // Check if the user is the author of the reply or admin
    if (req.user.role !== 'admin' && reply.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own replies'
      });
    }

    reply.message = message;
    reply.editedAt = new Date();
    reply.editedBy = req.user._id;

    await ticket.save();

    const updatedTicket = await Ticket.findById(ticketId)
      .populate('customerId', 'name email')
      .populate('replies.userId', 'name email role')
      .populate('replies.editedBy', 'name role');

    res.json({
      success: true,
      ticket: updatedTicket
    });
  } catch (error) {
    console.error('Edit reply error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error editing reply'
    });
  }
};

const deleteReply = async (req, res) => {
  try {
    const { ticketId, replyId } = req.params;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    const reply = ticket.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({
        success: false,
        message: 'Reply not found'
      });
    }

    // Only allow staff to delete staff replies
    if (req.user.role !== 'admin' && req.user.role !== 'support') {
      return res.status(403).json({
        success: false,
        message: 'Only staff can delete replies'
      });
    }

    // Check if this is a staff reply
    if (!reply.isStaff) {
      return res.status(403).json({
        success: false,
        message: 'Can only delete staff replies'
      });
    }

    // Check if the user is the author of the reply or admin
    if (req.user.role !== 'admin' && reply.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own replies'
      });
    }

    ticket.replies.pull(replyId);
    await ticket.save();

    const updatedTicket = await Ticket.findById(ticketId)
      .populate('customerId', 'name email')
      .populate('replies.userId', 'name email role');

    res.json({
      success: true,
      ticket: updatedTicket
    });
  } catch (error) {
    console.error('Delete reply error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting reply'
    });
  }
};

module.exports = {
  createTicket,
  getMyTickets,
  getAllTickets,
  getTicketById,
  addReply,
  editReply,
  deleteReply,
  updateTicketStatus,
  downloadTicketPDF,
  updateTicket,
  deleteTicket
};