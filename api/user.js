const jwt = require('jsonwebtoken');
const { getDb } = require('../config/db');
const express = require('express');
const { ObjectId } = require('mongodb');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const uploadDir = path.join(__dirname, 'uploads');

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

// Lấy danh sách người dùng (có hỗ trợ phân trang và bộ lọc)
router.get('', async (req, res) => {
  const db = getDb();
  const collection = db.collection('USER');
  // Lấy query params cho phân trang và bộ lọc
  const { page = 1, limit = 10, search } = req.query;
  // Tính toán skip và limit
  const skip = (page - 1) * limit;
  // Tạo bộ lọc nếu có tham số "search"
  const filter = search ? { name: { $regex: search, $options: 'i' } } : {};

  try {
    // Lấy dữ liệu và phân trang
    const users = await collection
      .find(filter)
      .skip(Number(skip))
      .limit(Number(limit))
      .toArray();

    // Lấy tổng số bản ghi để tính tổng số trang
    const totalUsers = await collection.countDocuments(filter);

    res.json({
      data: users,
      meta: {
        total: totalUsers,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(totalUsers / limit),
      },
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách người dùng:', error);
    res.status(500).json({ error: 'Lỗi server nội bộ' });
  }

});

// cập nhật thông tin người dùng
router.put('/:id', upload.single('img'), async (req, res) => {
  const { id } = req.params;
  const updatedUserData = req.body;


  if (updatedUserData._id) {
    delete updatedUserData._id;
  }
  if (req.file) {
    updatedUserData.img = req.file.path;
  }

  const db = getDb();
  const collection = db.collection('USER');

  try {
    const objectId = new ObjectId(id);
    const result = await collection.updateOne({ _id: objectId }, { $set: updatedUserData });

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng để cập nhật.' });
    }

    res.status(200).json({ message: 'Cập nhật thông tin người dùng thành công.' });
  } catch (error) {
    console.error('Lỗi khi cập nhật thông tin người dùng:', error);
    res.status(500).json({ error: 'Lỗi Server nội bộ' });
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

// tạo người dùng
router.post('', async (req, res) => {
  const { email, password, phoneNumber } = req.body;
  const db = getDb();
  const collection = db.collection('USER');
  const user = req.body;
  const existingUser = await collection.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'Email đã tồn tại.' });
  }
  await collection.insertOne(user);
  res.status(201).send('User thêm thành công');
});

// lấy thông tin người dùng thông qua id
router.get('/:idCus', async (req, res) => {
  const { idCus } = req.params;
  const db = getDb();
  const collection = db.collection('USER');

  try {
    const cartItems = await collection.find({ _id: new ObjectId(idCus) }).toArray();
    res.json(cartItems);
    console.log(idCus)
  } catch (error) {
    console.error('Lỗi khi lấy thông tin người dùng:', error);
    res.status(500).json({ error: 'Lỗi Server nội bộ' });
  }
});

// xóa người dùng
router.delete('/:id', async (req, res) => {
  const db = getDb();
  const collection = db.collection('USER');
  const { id } = req.params;

  try {
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng để xóa.' });
    }

    res.status(200).json({ message: 'Người dùng đã được xóa thành công.' });
  } catch (error) {
    console.error('Lỗi khi xóa người dùng:', error);
    res.status(500).json({ error: 'Lỗi Server nội bộ', details: error.message, stack: error.stack });
  }
});

// Đăng nhập người dùng  
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const db = getDb();
  const collection = db.collection('USER');

  // Tìm người dùng với email và password
  const user = await collection.findOne({ email, password });

  if (!user) {
    return res.status(400).json({ message: 'Email hoặc mật khẩu không chính xác.' });
  }

  res.status(200).json({ message: 'Đăng nhập thành công!', user });
  // Tạo token JWT
  const token = jwt.sign({ email: user.email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

  res.status(200).json({ token });
});

module.exports = router;
