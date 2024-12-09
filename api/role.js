const { getDb } = require('../config/db');
const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const role = require('../model/role');

// lấy toàn bộ dánh sách role
router.get('', async (req, res) => {
    try {
        const roles = await role.find({});
        res.json(roles);
    } catch (error) {
        console.error('Error fetching roles:', error);
        res.status(500).json({ error: 'Error server' });
    }
});

// thêm role mới
router.post('', async (req, res) => {
    const { name, description, permissionIds, userIds } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!name) {
        return res.status(400).json({ error: 'Thiếu thông tin name' });
    }

    try {
        // Tạo mới một role
        const newRole = new role({
            name: name,
            description: description,
            permissionIds: permissionIds,
            userIds: userIds
        });

        const savedRole = await newRole.save();

        res.status(201).json({ message: 'Thêm role thành công', data: savedRole });
    } catch (error) {
        console.error('Lỗi khi thêm role:', error);
        res.status(500).json({ error: 'Lỗi Server nội bộ' });
    }
});

// xóa role
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    // Kiểm tra id có hợp lệ không
    if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'ID không hợp lệ' });
    }
    try {
        // Xóa role
        await role.deleteOne({ _id: ObjectId(id) });

        res.json({ message: 'Xóa role thành công' });
    } catch (error) {
        console.error('Lỗi khi xóa role:', error);
        res.status(500).json({ error: 'Lỗi Server nội bộ' });
    }
});
// lấy thông tin role theo id
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const roles = await role.findOne({ _id: new ObjectId(id) });
        if (!roles) {
            return res.status(404).json({ error: 'Không tìm thấy role' });
        }
        res.json(roles);
    } catch (error) {
        console.error('Lỗi khi lấy role:', error);
        res.status(500).json({ error: 'Lỗi Server nội bộ' });
    }
});

// cập nhât role
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, permissionIds, userIds } = req.body;

    // Kiểm tra id có hợp lệ không
    if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'ID không hợp lệ' });
    }

    // Kiểm tra dữ liệu đầu vào
    if (!name) {
        return res.status(400).json({ error: 'Thiếu thông tin name' });
    }

    try {
        // Cập nhật role
        const updatedRole = await role.findOneAndUpdate({ _id: ObjectId(id) }, {
            name: name,
            description: description,
            permissionIds: permissionIds,
            userIds: userIds
        }, { new: true });

        res.json({ message: 'Cập nhật role thành công', data: updatedRole });
    } catch (error) {
        console.error('Lỗi khi cập nhật role:', error);
        res.status(500).json({ error: 'Lỗi Server nội bộ' });
    }
});

 // Assign Role to User
router.put('/users/:id/assign-role', async (req, res) => {
    const { id } = req.params;
    const { roleIds } = req.body;
    try {
      const user = await User.findByIdAndUpdate(
        id,
        { $set: { roleIds: roleIds } },
        { new: true }
      ).populate('roleIds');
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.json(user);
    } catch (error) {
      console.error('Error assigning role:', error);
      res.status(500).json({ message: 'Failed to assign role' });
    }
  });
//   router.get('/admin-only', checkRole(['Admin', 'Manager']), (req, res) => {
//     res.json({ message: 'Welcome Admin or Manager!' });
//   });
  

module.exports = router;