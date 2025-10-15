const API_URL = 'http://localhost:5000/api/reports';

export const generateUserReport = async (format) => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/users/${format}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to generate report');
        }

        // For direct file download
        if (format === 'pdf' || format === 'excel' || format === 'csv') {
            const downloadResponse = await fetch(`http://localhost:5000${data.downloadUrl}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!downloadResponse.ok) {
                throw new Error('Failed to download report');
            }

            // Create blob and download
            const blob = await downloadResponse.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = data.filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }

        return data;
    } catch (error) {
        console.error('Error generating report:', error);
        throw error;
    }
};