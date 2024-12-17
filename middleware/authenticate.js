const jwt = require('jsonwebtoken');

const excludedRoutes = [ '/api/users/login', '/api/register']; // Danh sách route loại trừ

const authenticate = (req, res, next) => {
    // Kiểm tra nếu route hiện tại nằm trong danh sách loại trừ
    if (excludedRoutes.includes(req.path)) {
        return next(); // Bỏ qua middleware này
    }
    try {
        let token = req.header('Authorization')?.replace('Bearer ', '');
        // trong header có set-cookie thì sẽ lấy token từ cookie
        if (!token && req.headers.cookie) {
          // Tách cookie từ header và kiểm tra
          const cookies = req.headers.cookie.split('; ').reduce((acc, cookie) => {
              const [name, value] = cookie.split('=');
              acc[name] = value;
              return acc;
          }, {});
      
          console.log('Cookies:', cookies); // Log tất cả cookie để kiểm tra
      
          // Kiểm tra token có trong cookies không
          if (cookies['authToken']) {
              token = cookies['authToken']; // Lấy token từ cookie
              console.log('Token from cookie:', token); // Log token lấy từ cookie
          } else {
              console.log('No authToken found in cookies');
          }
      }
      
      
        if (!token) {
            return res.status(403).json({ error: 'Access denied, token required' });
        }
        console.log('token2: ',token);
        console.log('process.env  : ',jwt.verify(token, process.env.JWT_SECRET));
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Lưu thông tin người dùng vào request object
        
        next();
        console.log('token3: ');
    }catch (err) {
      // Kiểm tra nếu lỗi là do token hết hạn
      if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ error: 'Token đã hết hạn', message: err.message });
      }
  
      // Kiểm tra nếu lỗi là do token không hợp lệ (sai định dạng, chữ ký không đúng)
      if (err.name === 'JsonWebTokenError') {
          return res.status(401).json({ error: 'Token không hợp lệ', message: err.message });
      }
  
      // Kiểm tra nếu lỗi là do token chưa được phép sử dụng (NotBeforeError)
      if (err.name === 'NotBeforeError') {
          return res.status(401).json({ error: 'Token chưa hợp lệ', message: err.message });
      }
  
      // Nếu không xác định được lỗi, trả về lỗi chung
      return res.status(401).json({ error: 'Invalid or expired token', message: err.message });
  }
  
};

module.exports = authenticate;
