const express = require('express');
const cors = require('cors');
require('dotenv').config();

const adminRoutes = require('./routes/admin');
const stocksRoutes = require('./routes/stocks');
const teacherRoutes = require('./routes/teacher');
const userRoutes = require('./routes/user');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send('ISPH_SSE API'));

app.use('/admin', adminRoutes);
app.use('/stocks', stocksRoutes);
app.use('/teacher', teacherRoutes);
app.use('/user', userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});
