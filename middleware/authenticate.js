const jwt = require('jsonwebtoken');
const User = require('../model/user.js'); // Đường dẫn đến model User

const authenticate = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    // Giải mã token và lấy ID người dùng
    const decoded = jwt.verify(token, 'your-secret-key'); // Thay thế 'your-secret-key' bằng secret key của bạn
    const user = await User.findById(decoded.id).populate('roles'); // Lấy thông tin người dùng từ DB

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = user; // Gắn User vào request để các middleware sau sử dụng
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authenticate;
