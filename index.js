const express = require('express');
const { connectDB } = require('./config/db');
const routes = require('./routes');
const cookieParser = require('cookie-parser');
const cors = require('cors');
// const authenticate = require('./middleware/authenticate'); // Đường dẫn đúng

require('dotenv').config();

const app = express();
const port = 3000;

// Kết nối cơ sở dữ liệu
connectDB();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: 'https://localhost:7020', credentials: true }));

// Sử dụng middleware authenticate trước tất cả các route (nếu cần bảo vệ tất cả)
//app.use(authenticate);

// Định nghĩa routes
app.use('/api', routes);

// Khởi chạy server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
