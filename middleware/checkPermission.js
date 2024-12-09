const jwt = require('jsonwebtoken');
const Users = require('../model/user');
const Role = require('../model/role'); 

const checkPermission = (requiredPermissions) => {
  return async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(403).json({ error: 'Access denied, token required' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Lấy người dùng và populate các role của họ
      const user = await Users.findById(decoded.id).populate({
        path: 'roleIds',
        populate: {
          path: 'permissionIds', // Populate quyền của role
          select: 'name' // Chỉ lấy tên quyền từ permissionIds
        }
      });

      // Kiểm tra nếu người dùng không tồn tại
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Lấy tất cả các quyền từ các role của người dùng
      const userPermissions = user.roleIds.reduce((permissions, role) => {
        // Chắc chắn quyền có trong mảng và không bị undefined
        const validPermissions = role.permissionIds.map(permission => permission.name).filter(name => name);
        console.log(`Role: ${role.name} has permissions: `, validPermissions);
        return permissions.concat(validPermissions);
      }, []);

      console.log('All permissions for the user:', userPermissions);
      console.log('Required permissions to access this resource:', requiredPermissions); // In ra quyền cần kiểm tra

      // Kiểm tra xem người dùng có quyền yêu cầu không
      const hasPermission = requiredPermissions.some(permission => userPermissions.includes(permission));

      if (!hasPermission) {
        return res.status(403).json({ error: 'You do not have permission to access this resource' });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Error verifying token or checking permissions:', error);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  };
};

module.exports = checkPermission;
