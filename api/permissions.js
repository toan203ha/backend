const { getDb } = require('../config/db');
const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const permission = require('../model/permission');

// tao moi permission
router.post('', async (req, res) => {
    const { name, description, roleIds } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!name) {
        return res.status(400).json({ error: 'Thiếu thông tin name' });
    }

    try {
        // Tạo mới một permission
        const newPermission = new permission({
            name: name,
            description: description,
            roleIds: roleIds
        });

        const savedPermission = await newPermission.save();

        res.status(201).json({ message: 'Thêm permission thành công', data: savedPermission });
    } catch (error) {
        console.error('Lỗi khi thêm permission:', error);
        res.status(500).json({ error: 'Lỗi Server nội bộ' });
    }
});

// lấy toàn bộ danh sách permission
router.get('', async (req, res) => {
    try {
        const permissions = await permission.find({});
        res.json(permissions);
    } catch (error) {
        console.error('Error fetching permissions:', error);
        res.status(500).json({ error: 'Error server' });
    }
});
// xóa permission
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    // Kiểm tra id có hợp lệ không
    if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'ID không hợp lệ' });
    }
    try {
        // Xóa permission
        await permission.deleteOne({ _id: ObjectId(id) });

        res.json({ message: 'Xóa permission thành công' });
    } catch (error) {
        console.error('Lỗi khi xóa permission:', error);
        res.status(500).json({ error: 'Lỗi Server nội bộ' });
    }
});

// cập nhật thông tin permission thông qua id qua mongoose
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, roleIds } = req.body;
    try {
        const permission = await permission.findByIdAndUpdate(id, { name, description, roleIds }, { new: true });
        if (!permission) {
            return res.status(404).json({ message: 'Permission not found' });
        }
        res.json(permission);
    } catch (error) {
        console.error('Error updating permission:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;

