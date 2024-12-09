const jwt = require('jsonwebtoken');
const Users = require('../model/user');  // Đảm bảo đường dẫn đúng

const checkRole = (allowedRoles) => {
  return async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', ''); 
    if (!token) {
      return res.status(403).json({ error: 'Access denied, token required' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Giải mã token
      const user = await Users.findById(decoded.id).populate('roleIds'); // Lấy thông tin user từ DB và populate roleIds

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userRoles = user.roleIds.map(role => role.name);  // Lấy các tên role từ user
      const hasRole = allowedRoles.some(role => userRoles.includes(role));  // Kiểm tra nếu user có bất kỳ role nào trong allowedRoles

      if (!hasRole) {
        return res.status(403).json({ error: 'You do not have permission to access this resource' });
      }

      req.user = user; // Lưu thông tin người dùng vào req.user để sử dụng sau
      next();  // Tiếp tục với các middleware hoặc handler tiếp theo
    } catch (error) {
      console.error('Error verifying token or checking role:', error);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  };
};

module.exports = checkRole;
