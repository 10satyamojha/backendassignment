import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import winston from 'winston';


dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));
app.use(cookieParser());

// Rate limiting for all routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests, please try again ',
});
app.use('/api', apiLimiter);

// Swagger options
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Task Management API',
      version: '1.0.0',
      description: 'API for managing tasks with role-based access control and user management',
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'server',
      },
    ],
    components: {
      schemas: {
        Task: {
          type: 'object',
          required: ['title', 'createdBy'],
          properties: {
            _id: { type: 'string', description: 'Task ID' },
            title: { type: 'string', description: 'Task title' },
            description: { type: 'string', description: 'Detailed description of the task' },
            dueDate: { type: 'string', format: 'date', description: 'Due date of the task' },
            priority: { type: 'string', enum: ['Low', 'Medium', 'High'], description: 'Priority level of the task' },
            status: { type: 'string', enum: ['Pending', 'In Progress', 'Completed'], description: 'Current status of the task' },
            createdBy: { type: 'string', description: 'ID of the user who created the task' },
            assignedTo: { type: 'string', nullable: true, description: 'ID of the user to whom the task is assigned' },
            createdAt: { type: 'string', format: 'date-time', description: 'Task creation timestamp' },
            updatedAt: { type: 'string', format: 'date-time', description: 'Task last update timestamp' },
          },
        },
      },
    },
  },
  apis: ['./routes/Index.js'],
};
const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Import routes
import router from './routes/Index.js'; 
app.use('/api/v1', router);


const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'socket.log' }),
  ],
});

// Create HTTP server
const server = http.createServer(app);

// Setup Redis for scaling Socket.io
const pubClient = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
const subClient = pubClient.duplicate();
pubClient.connect();
subClient.connect();

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});
io.adapter(createAdapter(pubClient, subClient));

// Namespace for task-related events
const taskNamespace = io.of('/tasks');

// Middleware for namespace authentication
taskNamespace.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (isValidToken(token)) {
    next();
  } else {
    next(new Error('Unauthorized'));
  }
});

// Event listeners
taskNamespace.on('connection', (socket) => {
  logger.info(`User connected to /tasks: ${socket.id}`);

  socket.on('taskUpdated', (data) => {
    logger.info(`Task updated: ${JSON.stringify(data)}`);
    taskNamespace.emit('taskUpdated', data); // Broadcast to all clients in the namespace
  });

  socket.on('disconnect', () => {
    logger.info(`User disconnected from /tasks: ${socket.id}`);
  });
});

function isValidToken(token) {
 
  return true; 
}


app.set('io', io);


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger Docs available at http://localhost:${PORT}/api-docs`);
});
