import axios from 'axios';

const uploadService = {
  // Upload single file to Cloudinary
  uploadSingleFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post('/api/upload/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  // Upload multiple files to Cloudinary
  uploadMultipleFiles: async (files) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await axios.post('/api/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  // Delete file from Cloudinary
  deleteFile: async (publicId) => {
    // Encode the public_id to handle special characters
    const encodedPublicId = encodeURIComponent(publicId);
    const response = await axios.delete(`/api/upload/${encodedPublicId}`);
    return response.data;
  }
};

export { uploadService };