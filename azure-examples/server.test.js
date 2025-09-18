const request = require('supertest');
const app = require('./server');

describe('Azure Sample App', () => {
    describe('GET /health', () => {
        it('should return health status', async () => {
            const response = await request(app)
                .get('/health')
                .expect(200);
            
            expect(response.body).toHaveProperty('status', 'healthy');
            expect(response.body).toHaveProperty('timestamp');
            expect(response.body).toHaveProperty('uptime');
        });
    });

    describe('GET /api/status', () => {
        it('should return application status', async () => {
            const response = await request(app)
                .get('/api/status')
                .expect(200);
            
            expect(response.body).toHaveProperty('message');
            expect(response.body).toHaveProperty('timestamp');
        });
    });

    describe('GET /api/users', () => {
        it('should return list of users', async () => {
            const response = await request(app)
                .get('/api/users')
                .expect(200);
            
            expect(response.body).toHaveProperty('users');
            expect(response.body).toHaveProperty('total');
            expect(Array.isArray(response.body.users)).toBe(true);
        });
    });

    describe('POST /api/users', () => {
        it('should create a new user', async () => {
            const newUser = {
                name: 'Test User',
                email: 'test@example.com',
                role: 'user'
            };

            const response = await request(app)
                .post('/api/users')
                .send(newUser)
                .expect(201);
            
            expect(response.body).toHaveProperty('message');
            expect(response.body).toHaveProperty('user');
            expect(response.body.user).toHaveProperty('name', newUser.name);
            expect(response.body.user).toHaveProperty('email', newUser.email);
        });

        it('should return error for missing required fields', async () => {
            const response = await request(app)
                .post('/api/users')
                .send({})
                .expect(400);
            
            expect(response.body).toHaveProperty('error');
        });
    });

    describe('GET /api/env', () => {
        it('should return environment information', async () => {
            const response = await request(app)
                .get('/api/env')
                .expect(200);
            
            expect(response.body).toHaveProperty('nodeVersion');
            expect(response.body).toHaveProperty('platform');
            expect(response.body).toHaveProperty('architecture');
        });
    });

    describe('404 handler', () => {
        it('should return 404 for unknown routes', async () => {
            const response = await request(app)
                .get('/unknown-route')
                .expect(404);
            
            expect(response.body).toHaveProperty('error', 'Route not found');
            expect(response.body).toHaveProperty('path', '/unknown-route');
        });
    });
});