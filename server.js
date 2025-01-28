const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const cors = require('cors');
const favicon = require('serve-favicon');
const http = require('http');
const path = require('path');

require('dotenv').config();

const createWebSocketServer = require('./services/webSocketServer');

const adminRoutes = require('./routes/admin');
const stocksRoutes = require('./routes/stocks');
const teacherRoutes = require('./routes/teacher');
const userRoutes = require('./routes/user');
const healthRoutes = require('./routes/health');

const app = express();
const server = http.createServer(app);

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ISPH Stock Exchange API',
      version: '1.0.0',
      description: 'API documentation for ISPH-SSE',
    },
  },
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  apis: ['./routes/*.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

app.use(cors());
app.use(express.json());

const CSS_URL =
  'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css';

app.get('/', (req, res) => res.redirect('/api-docs'));
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocs, {
    customCss:
      '.swagger-ui .opblock .opblock-summary-path-description-wrapper { align-items: center; display: flex; flex-wrap: wrap; gap: 0 10px; padding: 0 10px; width: 100%; }',
    customCssUrl: CSS_URL,
  })
);

app.get('/api-docs/swagger.json', (req, res) => {
  res.json(swaggerDocs);
});

// Create a WebSocket server for real-time updates
const io = createWebSocketServer(server);

app.use('/admin', adminRoutes);
app.use('/stocks', stocksRoutes);
app.use('/teacher', teacherRoutes);
app.use('/user', userRoutes);
app.use('/health', healthRoutes);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});
