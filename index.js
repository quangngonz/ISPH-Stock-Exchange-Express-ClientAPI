import ViteExpress from 'vite-express';
const app = require('./server');

const PORT = process.env.PORT || 3000;

ViteExpress({
  app,
  isProduction: process.env.NODE_ENV === 'production',
}).listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
