const express = require('express');
const router = express.Router();
const User = require('../models/User');
const ReportService = require('../services/reportService');
const { auth } = require('../middleware/auth');
const path = require('path');

// Middleware to check admin access
const checkAdminAccess = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    next();
};

// Generate PDF report
router.get('/users/pdf', auth, checkAdminAccess, async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        if (!users || users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No users found to generate report'
            });
        }

        const filename = await ReportService.generateUserPDFReport(users);
        const downloadUrl = `/api/reports/download/${filename}`;

        res.json({
            success: true,
            filename,
            downloadUrl,
            message: 'PDF report generated successfully'
        });
    } catch (error) {
        console.error('PDF generation error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error generating PDF report', 
            error: error.message 
        });
    }
});

// Generate Excel report
router.get('/users/excel', auth, checkAdminAccess, async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        if (!users || users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No users found to generate report'
            });
        }

        const filename = await ReportService.generateUserExcelReport(users);
        const downloadUrl = `/api/reports/download/${filename}`;

        res.json({
            success: true,
            filename,
            downloadUrl,
            message: 'Excel report generated successfully'
        });
    } catch (error) {
        console.error('Excel generation error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error generating Excel report', 
            error: error.message 
        });
    }
});

// Generate CSV report
router.get('/users/csv', auth, checkAdminAccess, async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        if (!users || users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No users found to generate report'
            });
        }

        const filename = await ReportService.generateUserCSVReport(users);
        const downloadUrl = `/api/reports/download/${filename}`;

        res.json({
            success: true,
            filename,
            downloadUrl,
            message: 'CSV report generated successfully'
        });
    } catch (error) {
        console.error('CSV generation error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error generating CSV report', 
            error: error.message 
        });
    }
});

// Download report file
router.get('/download/:filename', auth, checkAdminAccess, (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(__dirname, '..', 'reports', filename);
        
        res.download(filePath, filename, (err) => {
            if (err) {
                console.error('Download error:', err);
                res.status(500).json({ 
                    success: false, 
                    message: 'Error downloading file', 
                    error: err.message 
                });
            }
        });
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error accessing file', 
            error: error.message 
        });
    }
});

module.exports = router;