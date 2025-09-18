const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
require('dotenv').config();

// Initialize Application Insights (for Azure monitoring)
const appInsights = require('applicationinsights');
if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY) {
    appInsights.setup()
        .setAutoDependencyCorrelation(true)
        .setAutoCollectRequests(true)
        .setAutoCollectPerformance(true, true)
        .setAutoCollectExceptions(true)
        .setAutoCollectDependencies(true)
        .setAutoCollectConsole(true)
        .setUseDiskRetryCaching(true)
        .setSendLiveMetrics(false)
        .setDistributedTracingMode(appInsights.DistributedTracingModes.AI)
        .start();
}

const app = express();
const port = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

// Enable CORS
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
    credentials: true
}));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
        
        // Custom telemetry for Application Insights
        if (appInsights.defaultClient) {
            appInsights.defaultClient.trackRequest({
                name: `${req.method} ${req.path}`,
                url: req.url,
                duration: duration,
                resultCode: res.statusCode,
                success: res.statusCode < 400
            });
        }
    });
    
    next();
});

// Health check endpoint (required for Azure App Service)
app.get('/health', (req, res) => {
    const healthCheck = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
        memory: process.memoryUsage(),
        pid: process.pid
    };
    
    res.status(200).json(healthCheck);
});

// API routes
app.get('/api/status', (req, res) => {
    res.json({
        message: 'Azure sample application is running!',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
        region: process.env.REGION || 'unknown'
    });
});

app.get('/api/users', (req, res) => {
    // Sample user data
    const users = [
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user' },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'user' }
    ];
    
    res.json({
        users: users,
        total: users.length,
        timestamp: new Date().toISOString()
    });
});

app.post('/api/users', (req, res) => {
    const { name, email, role } = req.body;
    
    // Basic validation
    if (!name || !email) {
        return res.status(400).json({
            error: 'Name and email are required',
            timestamp: new Date().toISOString()
        });
    }
    
    // Simulate creating a user
    const newUser = {
        id: Math.floor(Math.random() * 1000) + 100,
        name,
        email,
        role: role || 'user',
        createdAt: new Date().toISOString()
    };
    
    res.status(201).json({
        message: 'User created successfully',
        user: newUser,
        timestamp: new Date().toISOString()
    });
});

// Environment info endpoint (useful for debugging deployments)
app.get('/api/env', (req, res) => {
    const envInfo = {
        nodeVersion: process.version,
        platform: process.platform,
        architecture: process.arch,
        environment: process.env.NODE_ENV || 'development',
        hostname: require('os').hostname(),
        loadAverage: require('os').loadavg(),
        timestamp: new Date().toISOString()
    };
    
    res.json(envInfo);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    // Log error to Application Insights
    if (appInsights.defaultClient) {
        appInsights.defaultClient.trackException({ exception: err });
    }
    
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl,
        timestamp: new Date().toISOString()
    });
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    server.close(() => {
        console.log('Process terminated');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully...');
    server.close(() => {
        console.log('Process terminated');
        process.exit(0);
    });
});

// Start server
const server = app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Azure sample app listening on port ${port}`);
    console.log(`📊 Health check: http://localhost:${port}/health`);
    console.log(`🔍 Environment: ${process.env.NODE_ENV || 'development'}`);
    
    // Track startup event
    if (appInsights.defaultClient) {
        appInsights.defaultClient.trackEvent({
            name: 'ApplicationStarted',
            properties: {
                port: port,
                environment: process.env.NODE_ENV || 'development',
                nodeVersion: process.version
            }
        });
    }
});

module.exports = app;