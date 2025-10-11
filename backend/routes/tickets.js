const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
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
} = require('../controllers/ticketController');

router.post('/', auth, upload.array('attachments', 5), createTicket);

router.get('/my-tickets', auth, getMyTickets);

router.get('/admin/all', adminAuth, getAllTickets);

router.get('/:id', auth, getTicketById);

router.post('/:id/reply', auth, addReply);

router.put('/:ticketId/reply/:replyId', auth, editReply);

router.delete('/:ticketId/reply/:replyId', auth, deleteReply);

router.put('/:id/status', adminAuth, updateTicketStatus);

router.get('/:id/download-pdf', auth, downloadTicketPDF);

router.put('/:id', auth, updateTicket);

router.delete('/:id', auth, deleteTicket);

module.exports = router;