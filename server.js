import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import NodeCache from 'node-cache';
import cors from 'cors';

// Setup directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a cache with TTL of 1 hour
const urlCache = new NodeCache({ stdTTL: 3600, checkperiod: 120 });

const app = express();
// Set trust proxy BEFORE creating the rate limiter
app.set('trust proxy', true);
const PORT = process.env.PORT || 3000;

// Apply rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  // Add custom keyGenerator to handle undefined IP addresses
  keyGenerator: (req) => {
    return req.ip || '127.0.0.1';
  },
});

// Apply middleware
app.use(compression()); // Compress responses
app.use(cors());
app.use(limiter);
app.use(express.static(path.join(__dirname, 'public')));

// Route to get paginated URLs
app.get('/api/urls', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const search = req.query.search || '';
    
    const cacheKey = `urls_${page}_${limit}_${search}`;
    const cachedData = urlCache.get(cacheKey);
    
    if (cachedData) {
      return res.json(cachedData);
    }
    
    // Read the URLs file
    const filePath = path.join(__dirname, 'url0.txt');
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'URL file not found. Please place url0.txt in the root directory.' });
    }
    
    // Process the file in an efficient way for large files
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const allUrls = fileContent.split('\n').filter(url => url.trim() !== '');
    
    // Filter URLs if search parameter is provided
    const filteredUrls = search 
      ? allUrls.filter(url => url.toLowerCase().includes(search.toLowerCase())) 
      : allUrls;
    
    // Calculate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const results = {
      total: filteredUrls.length,
      totalPages: Math.ceil(filteredUrls.length / limit),
      currentPage: page,
      urls: filteredUrls.slice(startIndex, endIndex)
    };
    
    // Cache the results
    urlCache.set(cacheKey, results);
    
    res.json(results);
  } catch (error) {
    console.error('Error processing URLs:', error);
    res.status(500).json({ error: 'Failed to process URLs' });
  }
});

// Serve the main HTML file for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Make sure to place your url0.txt file in the root directory.`);
});