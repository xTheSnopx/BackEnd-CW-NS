require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const authRoutes = require('./routes/auth');
const dataRoutes = require('./routes/data'); // Include Data Routes
const db = require('./database'); 
const startScraperCron = require('./scraper/cron'); 

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Cron
startScraperCron();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve Frontend Static Files
const frontendPath = path.resolve(__dirname, '../../frontend/dist');
app.use(express.static(frontendPath));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes); // Use Data Routes

// Fallback for SPA Routing (React Router)
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Static files served from: ${frontendPath}`);
});
