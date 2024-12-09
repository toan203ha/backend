const express = require('express');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const NXB = require('../model/nxb');
const Category = require('../model/category');
const router = express.Router();

// Lấy tất cả nxb
router.get('', async (req, res) => {
    try {
        const nxb = await NXB.find({});
        res.json(nxb);
    } catch (error) {
        console.error('Error fetching nxb:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Thêm mới nxb và kiểm tra category có hợp lệ và đã tồn tại trong bảng category
router.post('', async (req, res) => {
    const { TenNXB, DiaChi, SDT, Website, Region, Description, representative, category, Email } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!TenNXB || !DiaChi || !SDT || !Website || !Region || !Description || !representative || !Email || !category) {
        return res.status(400).json({ error: 'Thiếu thông tin' });
    }

    try {
        // Kiểm tra tất cả các category có hợp lệ hay không
        const isValidCategories = await Promise.all(
            category.map(async (id) => {
                if (!ObjectId.isValid(id)) {
                    return false;
                }
                const exists = await Category.findOne({ _id: id });
                return !!exists;
            })
        );

        if (isValidCategories.includes(false)) {
            return res.status(400).json({ error: 'Category không hợp lệ hoặc không tồn tại' });
        }

        // Tạo mới một NXB
        const newNXB = new NXB({
            TenNXB,
            DiaChi,
            SDT,
            Website,
            Region,
            Description,
            representative,
            category,
            Email,
        });

        const savedNXB = await newNXB.save();

        res.status(201).json({ message: 'Thêm NXB thành công', data: { savedNXB } });
    } catch (error) {
        console.error('Lỗi khi thêm NXB:', error);
        res.status(500).json({ error: 'Lỗi Server nội bộ' });
    }
});

// xóa nxb theo ID
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    // Kiểm tra id có hợp lệ không
    if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'ID không hợp lệ' });
    }

    try {
        // Sử dụng `new ObjectId(id)` khi xóa
        await NXB.deleteOne({ _id: new ObjectId(id) });

        res.json({ message: 'Xóa NXB thành công' });
    } catch (error) {
        console.error('Lỗi khi xóa NXB:', error);
        res.status(500).json({ error: 'Lỗi Server nội bộ' });
    }
});

// lấy thông tin theo id
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const nxb = await NXB.findOne({ _id: new ObjectId(id) });

        if (!nxb) {
            return res.status(404).json({ error: 'NXB không tồn tại' });
        }

        res.json(nxb);
    } catch (error) {
        console.error('Lỗi khi lấy thông tin NXB:', error);
        res.status(500).json({ error: 'Lỗi Server nội bộ' });
    }
});

// cap nhat nxb theo id
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { TenNXB, DiaChi, SDT, Website, Region, Description, representative, category, Email } = req.body;

    if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'ID không hợp lệ' });
    }

    try {
        const updatedNXB = await NXB.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { TenNXB, DiaChi, SDT, Website, Region, Description, representative, category, Email },
            { new: true }
        );

        if (!updatedNXB) {
            return res.status(404).json({ error: 'NXB không tồn tại' });
        }

        res.json({ message: 'Cập nhật NXB thành công', data: { updatedNXB } });
    } catch (error) {
        console.error('Lỗi khi cập nhật NXB:', error);
        res.status(500).json({ error: 'Lỗi Server nội bộ' });
    }
});

module.exports = router;
