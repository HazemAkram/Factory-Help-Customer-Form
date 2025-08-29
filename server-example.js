const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public')); // Serve your HTML/CSS/JS files

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
const csvDir = path.join(__dirname, 'csv-files');

async function ensureDirectories() {
    try {
        await fs.mkdir(uploadsDir, { recursive: true });
        await fs.mkdir(csvDir, { recursive: true });
        console.log('Directories created successfully');
    } catch (error) {
        console.error('Error creating directories:', error);
    }
}

ensureDirectories();

// Factory registration endpoint
app.post('/api/factory-registration', async (req, res) => {
    try {
        const formData = req.body;
        
        // Validate required fields
        const requiredFields = [
            'factoryName', 'country', 'city', 'detailedAddress', 
            'factoryEmail', 'ownerName_1', 'ownerMobile_1',
            'sparePartsManagerName', 'sparePartsManagerMobile', 
            'sparePartsManagerEmail', 'industryField'
        ];
        
        const missingFields = requiredFields.filter(field => !formData[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }
        
        // Generate CSV content
        const csvContent = generateCSVContent(formData);
        
        // Generate filename with timestamp and submission ID
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const filename = `factory_form_${formData.submissionId || timestamp}.csv`;
        const filePath = path.join(csvDir, filename);
        
        // Save CSV file to server
        await fs.writeFile(filePath, csvContent, 'utf8');
        
        // Save form data as JSON for backup
        const jsonFilename = `factory_form_${formData.submissionId || timestamp}.json`;
        const jsonFilePath = path.join(uploadsDir, jsonFilename);
        await fs.writeFile(jsonFilePath, JSON.stringify(formData, null, 2), 'utf8');
        
        // Log submission
        console.log(`Form submitted successfully: ${filename}`);
        console.log(`Submission ID: ${formData.submissionId}`);
        console.log(`Files saved: ${filePath}, ${jsonFilePath}`);
        
        // Send success response
        res.json({
            success: true,
            message: 'Factory registration submitted successfully',
            submissionId: formData.submissionId,
            timestamp: new Date().toISOString(),
            filesGenerated: {
                csv: filename,
                json: jsonFilename
            }
        });
        
    } catch (error) {
        console.error('Error processing factory registration:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error. Please try again later.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Generate CSV content from form data
function generateCSVContent(data) {
    const csvFields = [
        { key: 'submissionId', label: 'Submission ID' },
        { key: 'factoryName', label: 'Factory Name' },
        { key: 'country', label: 'Country' },
        { key: 'city', label: 'City' },
        { key: 'detailedAddress', label: 'Detailed Address' },
        { key: 'latitude', label: 'Latitude' },
        { key: 'longitude', label: 'Longitude' },
        { key: 'landlinePhone', label: 'Landline Phone' },
        { key: 'factoryEmail', label: 'Factory Email' },
        { key: 'ownerName_1', label: 'Owner 1 Name' },
        { key: 'ownerMobile_1', label: 'Owner 1 Mobile' },
        { key: 'sparePartsManagerName', label: 'Spare Parts Manager Name' },
        { key: 'sparePartsManagerMobile', label: 'Spare Parts Manager Mobile' },
        { key: 'sparePartsManagerEmail', label: 'Spare Parts Manager Email' },
        { key: 'industryField', label: 'Industry Field' },
        { key: 'productionLine_1', label: 'Production Line 1' },
        { key: 'brandName_1', label: 'Brand Name 1' },
        { key: 'manufacturingDate', label: 'Manufacturing Date' },
        { key: 'submissionDate', label: 'Submission Date' },
        { key: 'userAgent', label: 'User Agent' },
        { key: 'timestamp', label: 'Timestamp' }
    ];
    
    // Add additional owners if they exist
    const ownersCount = data.__ownersCount || 1;
    for (let i = 2; i <= ownersCount; i++) {
        csvFields.splice(10 + (i-2) * 2, 0, 
            { key: `ownerName_${i}`, label: `Owner ${i} Name` },
            { key: `ownerMobile_${i}`, label: `Owner ${i} Mobile` }
        );
    }
    
    // Add additional production lines if they exist
    const productionLinesCount = data.__productionLinesCount || 1;
    for (let i = 2; i <= productionLinesCount; i++) {
        csvFields.splice(16 + (i-2) * 2, 0,
            { key: `productionLine_${i}`, label: `Production Line ${i}` },
            { key: `brandName_${i}`, label: `Brand Name ${i}` }
        );
    }
    
    // Create CSV header
    const headers = csvFields.map(field => field.label);
    let csvContent = headers.join(',') + '\n';
    
    // Create CSV row
    const row = csvFields.map(field => {
        let value = data[field.key] || '';
        
        // Handle special cases
        if (field.key === 'timestamp') {
            value = new Date(parseInt(value)).toISOString();
        }
        
        // Escape CSV special characters
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            value = '"' + value.replace(/"/g, '""') + '"';
        }
        
        return value;
    });
    
    csvContent += row.join(',') + '\n';
    return csvContent;
}

// Get list of submitted forms (for admin purposes)
app.get('/api/submissions', async (req, res) => {
    try {
        const files = await fs.readdir(csvDir);
        const submissions = [];
        
        for (const file of files) {
            if (file.endsWith('.csv')) {
                const filePath = path.join(csvDir, file);
                const stats = await fs.stat(filePath);
                
                submissions.push({
                    filename: file,
                    submissionId: file.replace('factory_form_', '').replace('.csv', ''),
                    size: stats.size,
                    createdAt: stats.birthtime,
                    modifiedAt: stats.mtime
                });
            }
        }
        
        // Sort by creation date (newest first)
        submissions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        res.json({
            success: true,
            submissions,
            total: submissions.length
        });
        
    } catch (error) {
        console.error('Error reading submissions:', error);
        res.status(500).json({
            success: false,
            message: 'Error reading submissions'
        });
    }
});

// Download specific CSV file (for admin purposes)
app.get('/api/download/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(csvDir, filename);
        
        // Check if file exists
        try {
            await fs.access(filePath);
        } catch {
            return res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }
        
        // Set headers for file download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        
        // Send file
        res.sendFile(filePath);
        
    } catch (error) {
        console.error('Error downloading file:', error);
        res.status(500).json({
            success: false,
            message: 'Error downloading file'
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Factory Registration Server running on port ${PORT}`);
    console.log(`📁 CSV files will be saved to: ${csvDir}`);
    console.log(`📁 Form data will be saved to: ${uploadsDir}`);
    console.log(`🌐 Server URL: http://localhost:${PORT}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server gracefully...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down server gracefully...');
    process.exit(0);
});
