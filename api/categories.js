const { getDb } = require('../config/db');
const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const Category = require('../model/category');


// Lấy cơ sở dữ liệu
router.get('', async (req, res) => {
    try {
        // chỉ lấy name 
        const categories = await Category.find({});
         res.json(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ error: 'Error server' });
    }
  });

// Thêm dữ liệu
router.post('', async (req, res) => {
    const { TenLoai, Img } = req.body; 
  
    // Kiểm tra dữ liệu đầu vào
    if (!TenLoai || !Img) {
      return res.status(400).json({ error: 'Thiếu thông tin name hoặc img' });
    }
  
    try {
      // Tạo mới một Category
      const newCategory = new Category({
        TenLoai: TenLoai,
        Img: Img,
      });
  
      const savedCategory = await newCategory.save();
  
      res.status(201).json({ message: 'Thêm danh mục thành công', data:{
        savedCategory
      }  });
    } catch (error) {
      console.error('Lỗi khi thêm danh mục:', error);
      res.status(500).json({ error: 'Lỗi Server nội bộ' });
    }
  });

// Xóa dữ liệu
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    // Kiểm tra id có hợp lệ không
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID không hợp lệ' });
    }
    try {
      // Xóa Category
      await Category.deleteOne({ _id: ObjectId(id) });
  
      res.json({ message: 'Xóa danh mục thành công' });
    } catch (error) {
      console.error('Lỗi khi xóa danh mục:', error);
      res.status(500).json({ error: 'Lỗi Server nội bộ' });
    }
  });

module.exports = router;
