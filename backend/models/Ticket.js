const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReplySchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  isStaff: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  editedAt: {
    type: Date
  },
  editedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
});

const TicketSchema = new Schema({
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
    default: 'Open'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  category: {
    type: String,
    enum: ['General', 'Order Issue', 'Payment', 'Return/Refund', 'Technical', 'Product Question'],
    default: 'General'
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  attachments: [{
    fileName: {
      type: String,
      required: true
    },
    fileUrl: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      required: true
    },
    fileType: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  replies: [ReplySchema],
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

TicketSchema.pre('save', function(next) {
  this.lastActivity = new Date();
  next();
});

TicketSchema.index({ customerId: 1, status: 1 });
TicketSchema.index({ status: 1, priority: 1 });
TicketSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Ticket', TicketSchema);