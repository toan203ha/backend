const express = require('express');
const { ObjectId } = require('mongodb');
const Voucher = require('../model/voucher');  // Đảm bảo bạn đã tạo model Voucher
const router = express.Router();

// Lấy tất cả voucher (chỉ lấy những trường cần thiết)
router.get('', async (req, res) => {
    try {
        // Chọn những trường cần lấy
        const vouchers = await Voucher.find({});
        res.json(vouchers);
    } catch (error) {
        console.error('Error fetching vouchers:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Thêm mới voucher
router.post('', async (req, res) => {
    const { titleVoucher, valueVoucher, descVoucher } = req.body;
  
    // Kiểm tra dữ liệu đầu vào
    if (!titleVoucher || !valueVoucher || !descVoucher) {
      return res.status(400).json({ error: 'Thiếu thông tin titleVoucher, valueVoucher hoặc descVoucher' });
    }
  
    try {
        // Tạo mới một Voucher
        const newVoucher = new Voucher({
            titleVoucher,
            valueVoucher,
            descVoucher,
        });
  
        const savedVoucher = await newVoucher.save();
  
        res.status(201).json({ message: 'Thêm voucher thành công', data: { savedVoucher } });
    } catch (error) {
        console.error('Lỗi khi thêm voucher:', error);
        res.status(500).json({ error: 'Lỗi Server nội bộ' });
    }
});

// Xóa voucher theo ID
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
  
    // Kiểm tra id có hợp lệ không
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID không hợp lệ' });
    }
  
    try {
        // Sử dụng `new ObjectId(id)` khi xóa
        await Voucher.deleteOne({ _id: new ObjectId(id) });
  
        res.json({ message: 'Xóa voucher thành công' });
    } catch (error) {
        console.error('Lỗi khi xóa voucher:', error);
        res.status(500).json({ error: 'Lỗi Server nội bộ' });
    }
});

// Cập nhật voucher theo ID
// Cập nhật thông tin voucher
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { titleVoucher, valueVoucher, descVoucher } = req.body;

    try {
        const updatedVoucher = await Voucher.updateOne(
            { _id: new ObjectId(id) }, 
            {
                $set: {
                    titleVoucher: titleVoucher,
                    valueVoucher: valueVoucher,
                    descVoucher: descVoucher,
                }
            }
        );

        if (updatedVoucher.modifiedCount === 0) {
            return res.status(404).json({ error: 'Voucher không tìm thấy' });
        }

        res.json({ message: 'Cập nhật voucher thành công' });
    } catch (error) {
        console.error('Lỗi khi cập nhật voucher:', error);
        res.status(500).json({ error: 'Lỗi Server nội bộ' });
    }
});


module.exports = router;
