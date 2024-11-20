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

app.use('/admin', adminRoutes);
app.use('/stocks', stocksRoutes);
app.use('/teacher', teacherRoutes);
app.use('/user', userRoutes);

module.exports = app;
