const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const { createObjectCsvWriter } = require('csv-writer');
const fs = require('fs');
const path = require('path');

class ReportService {
    constructor() {
        this.reportsDir = path.join(__dirname, '..', 'reports');
        this.ensureReportsDirectory();
    }

    ensureReportsDirectory() {
        if (!fs.existsSync(this.reportsDir)) {
            fs.mkdirSync(this.reportsDir, { recursive: true });
        }
    }

    generateFilename(prefix, extension) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        return `${prefix}_${timestamp}.${extension}`;
    }

    async generateUserPDFReport(users) {
        return new Promise((resolve, reject) => {
            try {
                const filename = this.generateFilename('users_report', 'pdf');
                const filePath = path.join(this.reportsDir, filename);
                const doc = new PDFDocument({
                    margin: 50,
                    size: 'A4',
                    bufferPages: true
                });
                const stream = fs.createWriteStream(filePath);

                doc.pipe(stream);

                // Color palette
                const colors = {
                    primary: '#4F46E5',      // Indigo
                    secondary: '#EC4899',    // Pink
                    success: '#10B981',      // Green
                    text: '#1F2937',         // Dark gray
                    lightGray: '#F3F4F6',    // Light gray
                    mediumGray: '#9CA3AF',   // Medium gray
                    white: '#FFFFFF'
                };

                // Helper function to draw colored rectangle
                const drawRect = (x, y, width, height, color) => {
                    doc.rect(x, y, width, height).fill(color);
                };

                // Helper function to add page number footer
                const addFooter = () => {
                    const pages = doc.bufferedPageRange();
                    for (let i = 0; i < pages.count; i++) {
                        doc.switchToPage(i);

                        // Footer line
                        doc.strokeColor(colors.lightGray)
                           .lineWidth(1)
                           .moveTo(50, 770)
                           .lineTo(545, 770)
                           .stroke();

                        // Footer text
                        doc.fillColor(colors.mediumGray)
                           .fontSize(9)
                           .text(
                               `Fashion Fiesta User Report | Page ${i + 1} of ${pages.count}`,
                               50,
                               775,
                               { align: 'center', width: 495 }
                           );
                    }
                };

                // Header banner with gradient effect
                drawRect(0, 0, 595, 120, colors.primary);
                drawRect(0, 90, 595, 30, colors.secondary);

                // Title
                doc.fillColor(colors.white)
                   .fontSize(32)
                   .font('Helvetica-Bold')
                   .text('User Report', 50, 35, { align: 'center' });

                doc.fontSize(11)
                   .font('Helvetica')
                   .text('Fashion Fiesta Analytics Dashboard', 50, 70, { align: 'center' });

                doc.fontSize(10)
                   .text(`Generated: ${new Date().toLocaleDateString('en-US', {
                       weekday: 'long',
                       year: 'numeric',
                       month: 'long',
                       day: 'numeric',
                       hour: '2-digit',
                       minute: '2-digit'
                   })}`, 50, 95, { align: 'center' });

                doc.moveDown(3);

                // Calculate statistics
                const roleCount = users.reduce((acc, user) => {
                    acc[user.role] = (acc[user.role] || 0) + 1;
                    return acc;
                }, {});

                const activeUsers = users.filter(u => u.isActive !== false).length;
                const inactiveUsers = users.length - activeUsers;

                // Summary Cards Section
                doc.fillColor(colors.text)
                   .fontSize(18)
                   .font('Helvetica-Bold')
                   .text('Overview Statistics', 50, 150);

                let cardX = 50;
                const cardY = 175;
                const cardWidth = 115;
                const cardHeight = 80;
                const cardSpacing = 10;

                // Summary cards data
                const summaryCards = [
                    { label: 'Total Users', value: users.length, color: colors.primary },
                    { label: 'Active', value: activeUsers, color: colors.success },
                    { label: 'Inactive', value: inactiveUsers, color: colors.secondary },
                    { label: 'Admins', value: roleCount['admin'] || 0, color: '#F59E0B' }
                ];

                summaryCards.forEach((card, index) => {
                    // Card background
                    doc.roundedRect(cardX, cardY, cardWidth, cardHeight, 5)
                       .fill(colors.lightGray);

                    // Color accent bar
                    doc.roundedRect(cardX, cardY, cardWidth, 8, 5)
                       .fill(card.color);

                    // Value
                    doc.fillColor(colors.text)
                       .fontSize(28)
                       .font('Helvetica-Bold')
                       .text(card.value.toString(), cardX + 10, cardY + 25, {
                           width: cardWidth - 20,
                           align: 'center'
                       });

                    // Label
                    doc.fontSize(10)
                       .font('Helvetica')
                       .fillColor(colors.mediumGray)
                       .text(card.label, cardX + 10, cardY + 60, {
                           width: cardWidth - 20,
                           align: 'center'
                       });

                    cardX += cardWidth + cardSpacing;
                });

                // Role Distribution Section
                doc.fillColor(colors.text)
                   .fontSize(18)
                   .font('Helvetica-Bold')
                   .text('Role Distribution', 50, 280);

                let roleY = 305;
                Object.entries(roleCount).forEach(([role, count]) => {
                    const percentage = ((count / users.length) * 100).toFixed(1);
                    const barWidth = (count / users.length) * 400;

                    // Role name
                    doc.fontSize(11)
                       .font('Helvetica')
                       .fillColor(colors.text)
                       .text(`${role.charAt(0).toUpperCase() + role.slice(1)}`, 50, roleY);

                    // Progress bar background
                    doc.roundedRect(150, roleY, 400, 18, 3)
                       .fill(colors.lightGray);

                    // Progress bar fill
                    const roleColors = {
                        admin: '#EF4444',
                        support: '#3B82F6',
                        customer: '#10B981'
                    };
                    doc.roundedRect(150, roleY, barWidth, 18, 3)
                       .fill(roleColors[role] || colors.primary);

                    // Count and percentage
                    doc.fontSize(10)
                       .fillColor(colors.text)
                       .text(`${count} (${percentage}%)`, 150, roleY + 3, {
                           width: 400,
                           align: 'center'
                       });

                    roleY += 30;
                });

                // User Details Table
                doc.addPage();

                doc.fillColor(colors.text)
                   .fontSize(18)
                   .font('Helvetica-Bold')
                   .text('User Details', 50, 50);

                const tableTop = 90;
                let currentY = tableTop;
                const rowHeight = 35;
                const colPositions = {
                    name: 50,
                    email: 180,
                    role: 340,
                    status: 450
                };
                const colWidths = {
                    name: 120,
                    email: 150,
                    role: 100,
                    status: 85
                };

                // Table header
                drawRect(50, currentY, 495, 30, colors.primary);

                doc.fillColor(colors.white)
                   .fontSize(11)
                   .font('Helvetica-Bold');

                doc.text('Name', colPositions.name + 5, currentY + 8, {
                    width: colWidths.name,
                    continued: false
                });
                doc.text('Email', colPositions.email + 5, currentY + 8, {
                    width: colWidths.email,
                    continued: false
                });
                doc.text('Role', colPositions.role + 5, currentY + 8, {
                    width: colWidths.role,
                    continued: false
                });
                doc.text('Status', colPositions.status + 5, currentY + 8, {
                    width: colWidths.status,
                    continued: false
                });

                currentY += 30;

                // Table rows
                doc.font('Helvetica');
                users.forEach((user, index) => {
                    if (currentY > 730) {
                        doc.addPage();
                        currentY = 50;

                        // Redraw header
                        drawRect(50, currentY, 495, 30, colors.primary);
                        doc.fillColor(colors.white)
                           .fontSize(11)
                           .font('Helvetica-Bold');

                        doc.text('Name', colPositions.name + 5, currentY + 8, {
                            width: colWidths.name,
                            continued: false
                        });
                        doc.text('Email', colPositions.email + 5, currentY + 8, {
                            width: colWidths.email,
                            continued: false
                        });
                        doc.text('Role', colPositions.role + 5, currentY + 8, {
                            width: colWidths.role,
                            continued: false
                        });
                        doc.text('Status', colPositions.status + 5, currentY + 8, {
                            width: colWidths.status,
                            continued: false
                        });

                        currentY += 30;
                        doc.font('Helvetica');
                    }

                    // Alternating row colors
                    if (index % 2 === 0) {
                        drawRect(50, currentY, 495, rowHeight, colors.lightGray);
                    }

                    const name = user.name || 'N/A';
                    const email = user.email || 'N/A';
                    const role = user.role || 'N/A';
                    const isActive = user.isActive !== undefined ? user.isActive : true;

                    doc.fillColor(colors.text)
                       .fontSize(10);

                    doc.text(name, colPositions.name + 5, currentY + 10, {
                        width: colWidths.name - 10,
                        continued: false,
                        ellipsis: true
                    });
                    doc.text(email, colPositions.email + 5, currentY + 10, {
                        width: colWidths.email - 10,
                        continued: false,
                        ellipsis: true
                    });

                    // Role badge
                    const roleColor = {
                        admin: '#EF4444',
                        support: '#3B82F6',
                        customer: '#10B981'
                    }[role] || colors.mediumGray;

                    doc.roundedRect(colPositions.role + 5, currentY + 8, 70, 20, 3)
                       .fill(roleColor);
                    doc.fillColor(colors.white)
                       .fontSize(9)
                       .text(role.toUpperCase(), colPositions.role + 5, currentY + 12, {
                           width: 70,
                           align: 'center',
                           continued: false
                       });

                    // Status badge
                    const statusColor = isActive ? colors.success : colors.secondary;
                    doc.roundedRect(colPositions.status + 5, currentY + 8, 70, 20, 3)
                       .fill(statusColor);
                    doc.fillColor(colors.white)
                       .fontSize(9)
                       .text(isActive ? 'ACTIVE' : 'INACTIVE', colPositions.status + 5, currentY + 12, {
                           width: 70,
                           align: 'center',
                           continued: false
                       });

                    currentY += rowHeight;
                });

                // Add footers to all pages
                addFooter();

                doc.end();

                stream.on('finish', () => {
                    resolve(filename);
                });

                stream.on('error', (error) => {
                    reject(error);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    async generateUserExcelReport(users) {
        try {
            const filename = this.generateFilename('users_report', 'xlsx');
            const filePath = path.join(this.reportsDir, filename);
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Users');

            // Set column widths and headers
            worksheet.columns = [
                { header: 'Name', key: 'name', width: 30 },
                { header: 'Email', key: 'email', width: 40 },
                { header: 'Role', key: 'role', width: 15 },
                { header: 'Status', key: 'status', width: 15 },
                { header: 'Created At', key: 'createdAt', width: 20 }
            ];

            // Style the header row
            worksheet.getRow(1).font = { bold: true };
            worksheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFD3D3D3' }
            };

            // Add data rows
            users.forEach(user => {
                worksheet.addRow({
                    name: user.name || 'N/A',
                    email: user.email || 'N/A',
                    role: user.role || 'N/A',
                    status: user.isActive !== undefined ? (user.isActive ? 'Active' : 'Inactive') : 'N/A',
                    createdAt: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'
                });
            });

            // Add summary sheet
            const summarySheet = workbook.addWorksheet('Summary');
            summarySheet.columns = [
                { header: 'Metric', key: 'metric', width: 30 },
                { header: 'Value', key: 'value', width: 20 }
            ];

            summarySheet.getRow(1).font = { bold: true };
            summarySheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFD3D3D3' }
            };

            summarySheet.addRow({ metric: 'Total Users', value: users.length });

            const roleCount = users.reduce((acc, user) => {
                acc[user.role] = (acc[user.role] || 0) + 1;
                return acc;
            }, {});

            Object.entries(roleCount).forEach(([role, count]) => {
                summarySheet.addRow({
                    metric: `${role.charAt(0).toUpperCase() + role.slice(1)} Users`,
                    value: count
                });
            });

            await workbook.xlsx.writeFile(filePath);
            return filename;
        } catch (error) {
            throw error;
        }
    }

    async generateUserCSVReport(users) {
        try {
            const filename = this.generateFilename('users_report', 'csv');
            const filePath = path.join(this.reportsDir, filename);

            const csvWriter = createObjectCsvWriter({
                path: filePath,
                header: [
                    { id: 'name', title: 'Name' },
                    { id: 'email', title: 'Email' },
                    { id: 'role', title: 'Role' },
                    { id: 'status', title: 'Status' },
                    { id: 'createdAt', title: 'Created At' }
                ]
            });

            const records = users.map(user => ({
                name: user.name || 'N/A',
                email: user.email || 'N/A',
                role: user.role || 'N/A',
                status: user.isActive !== undefined ? (user.isActive ? 'Active' : 'Inactive') : 'N/A',
                createdAt: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'
            }));

            await csvWriter.writeRecords(records);
            return filename;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new ReportService();
