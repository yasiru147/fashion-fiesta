import axios from 'axios';

export const ticketService = {
  createTicket: async (ticketData) => {
    const response = await axios.post('/api/tickets', ticketData);
    return response.data;
  },

  createTicketWithFiles: async (formData) => {
    const response = await axios.post('/api/tickets', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  getMyTickets: async (page = 1, limit = 10) => {
    const response = await axios.get(`/api/tickets/my-tickets?page=${page}&limit=${limit}`);
    return response.data;
  },

  getAllTickets: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });

    const response = await axios.get(`/api/tickets/admin/all?${params.toString()}`);
    return response.data;
  },

  getTicketById: async (ticketId) => {
    const response = await axios.get(`/api/tickets/${ticketId}`);
    return response.data;
  },

  addReply: async (ticketId, message) => {
    const response = await axios.post(`/api/tickets/${ticketId}/reply`, { message });
    return response.data;
  },

  editReply: async (ticketId, replyId, message) => {
    const response = await axios.put(`/api/tickets/${ticketId}/reply/${replyId}`, { message });
    return response.data;
  },

  deleteReply: async (ticketId, replyId) => {
    const response = await axios.delete(`/api/tickets/${ticketId}/reply/${replyId}`);
    return response.data;
  },

  updateTicketStatus: async (ticketId, status, assignedTo) => {
    const response = await axios.put(`/api/tickets/${ticketId}/status`, {
      status,
      assignedTo
    });
    return response.data;
  },

  downloadTicketPDF: async (ticketId) => {
    const response = await axios.get(`/api/tickets/${ticketId}/download-pdf`, {
      responseType: 'blob'
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ticket-${ticketId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  deleteTicket: async (ticketId) => {
    const response = await axios.delete(`/api/tickets/${ticketId}`);
    return response.data;
  },

  updateTicket: async (ticketId, ticketData) => {
    const response = await axios.put(`/api/tickets/${ticketId}`, ticketData);
    return response.data;
  }
};