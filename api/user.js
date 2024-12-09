const jwt = require('jsonwebtoken');
const { getDb } = require('../config/db');
const express = require('express');
const { ObjectId } = require('mongodb');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Users = require('../model/user');
const router = express.Router();
const uploadDir = path.join(__dirname, 'uploads');
const checkRole = require('../middleware/checkrole'); 
const checkPermission = require('../middleware/checkPermission'); 

router.get('/admin', checkRole(['Admin', 'manager']), (req, res) => {
  res.send('Welcome to the admin section');
});

router.get('/adminpermission', checkPermission(['create', 'read', 'update', 'delete']), (req, res) => {
  res.send('Welcome to the admin section');
});

router.get('/adminpermissiondelete', checkPermission(['delete']), (req, res) => {
  res.send('Welcome to the admin section');
});

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// // Lấy danh sách người dùng (có hỗ trợ phân trang và bộ lọc)
// router.get('', async (req, res) => {
//   const db = getDb();
//   const collection = db.collection('USER');
//   // Lấy query params cho phân trang và bộ lọc
//   const { page = 1, limit = 10, search } = req.query;
//   // Tính toán skip và limit
//   const skip = (page - 1) * limit;
//   // Tạo bộ lọc nếu có tham số "search"
//   const filter = search ? { name: { $regex: search, $options: 'i' } } : {};

//   try {
//     // Lấy dữ liệu và phân trang
//     const users = await collection
//       .find(filter)
//       .skip(Number(skip))
//       .limit(Number(limit))
//       .toArray();

//     // Lấy tổng số bản ghi để tính tổng số trang
//     const totalUsers = await collection.countDocuments(filter);

//     res.json({
//       data: users,
//       meta: {
//         total: totalUsers,
//         page: Number(page),
//         limit: Number(limit),
//         totalPages: Math.ceil(totalUsers / limit),
//       },
//     });
//   } catch (error) {
//     console.error('Lỗi khi lấy danh sách người dùng:', error);
//     res.status(500).json({ error: 'Lỗi server nội bộ' });
//   }

// });

// lấy danh sách người dùng
router.get('', async (req, res) => {
  try {
    const user = await Users.find({});

    res.json({

      isEmpty: user.length === 0,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// cập nhật thông tin người dùng thông qua id qua mongoose
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { fullNameCus,passWord, addressCus, emailCus, phoneNumCus, genderCus, rank,roleIds, isActive } = req.body;
  try {
    const user = await Users.findByIdAndUpdate(id, { fullNameCus,passWord, addressCus, emailCus, phoneNumCus, genderCus, rank, roleIds, isActive }, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



// lấy thông tin người dùng thông qua id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
      const user = await Users.findOne({ _id: new ObjectId(id) });
      if (!user) {
          return res.status(404).json({ error: 'Không tìm thấy user' });
      }
      res.json(user);
  } catch (error) {
      console.error('Lỗi khi lấy user:', error);
      res.status(500).json({ error: 'Lỗi Server nội bộ' });
  }
});

// xóa người dùng
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await Users.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



// tạo người dùng mới sữ dụng mongoose
router.post('', async (req, res) => {
  const { fullNameCus,passWord, addressCus, emailCus, phoneNumCus, genderCus, rank,roleIds, isActive } = req.body;
  // email alf phải là duy nhất
  const user = await Users.findOne({ emailCus });
  if (user) {
    return res.status(400).json({ error: 'Email đã tồn tại' });
  }
  
  try {
    const user = new Users({ fullNameCus,passWord, addressCus, emailCus, phoneNumCus, genderCus, rank,roleIds, isActive});

    await user.save();
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// lấy hình ảnh
router.get('/images/:id', async (req, res) => {
  const { id } = req.params;
  const db = getDb();
  const collection = db.collection('USER');

  try {
    const objectId = new ObjectId(id);
    const user = await collection.findOne({ _id: objectId });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const imagePath = user.img;

    res.sendFile(imagePath);
  } catch (error) {
    console.error('Error getting image:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
// Đăng nhập người dùng  
router.post('/login', async (req, res) => {
  const { emailCus, passWord } = req.body;
  try {
    const users = await Users.findOne({ emailCus, passWord });
    if (!users) {
      return res.status(404).json({ error: 'User not found' });
    }

    const id = users._id;
    const roles = users.roleIds;
    const token = jwt.sign({id,emailCus, passWord, roleIds: roles},
      process.env.JWT_SECRET,
      { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
