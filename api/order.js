const { getDb } = require('../config/db');
const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
 

// lấy danh sách đơn hàng theo trạng thái đơn hàng
router.get('/status/:idCus', async (req, res) => {
    const { idCus } = req.params;
    const { daGiao, daHuy, dangChoXacNhan } = req.query;
    const db = getDb();
    const collection = db.collection('DONHANG');
    try {
        const query = {
            idCus: idCus,
        };
        if (daGiao === 'true') {
            query.daGiao = true;
        }
        if (daHuy === 'true') {
            query.daHuy = true;
        }
        if (dangChoXacNhan === 'true') {
            query.dangChoXacNhan = true;
        }
        const donhang = await collection.find(query).toArray();
        res.json(donhang);
    } catch (error) {
        console.error('Lỗi khi lấy đơn hàng:', error);
        res.status(500).json({ error: 'Lỗi Server nội bộ' });
    }
});
// lấy toàn bộ đơn hàng
router.get('', async (req, res) => {
    const db = getDb();
    const collection = db.collection('DONHANG');
    const categories = await collection.find({}).toArray();
    res.json(categories);
});

// lấy đơn hàng theo id khách hàng
router.get('/:idCus', async (req, res) => {
    const { idCus } = req.params;
    const db = getDb();
    const collection = db.collection('DONHANG');

    try {
        const donhang = await collection.find({ idCus: idCus }).toArray();
        res.json(donhang);
    } catch (error) {
        console.error('Lỗi khi lấy đơn hàng:', error);
        res.status(500).json({ error: 'Lỗi Server nội bộ' });
    }
});

// lấy danh sách đơn hàng đã thanh toán và chưa thông báo ở trang thông báo
router.get('/thongbao/:idCus', async (req, res) => {
    const { idCus } = req.params;
    const db = getDb();
    const collection = db.collection('DONHANG');

    try {
        const query = {
            idCus: idCus,
            // lấy những đơn hàng chưa thông báo
            thongBao: false 
        };

        const donhang = await collection.find(query).toArray();

        res.json(donhang);
    } catch (error) {
         res.status(500).json({ error: 'Lỗi Server nội bộ' });
    }
});

// chuyển trạng thái thông báo
// cập nhật thongBao thành true khi người dùng click vào đơn hàng
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const db = getDb();
    const collection = db.collection('DONHANG');

    try {
        const updateResult = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { thongBao: true } }
        );

        if (updateResult.modifiedCount === 1) {
            res.status(200).json({ message: 'Cập nhật thông báo thành công' });
        } else {
            res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
        }
    } catch (error) {
        console.error('Lỗi khi cập nhật đơn hàng:', error);
        res.status(500).json({ error: 'Lỗi Server nội bộ' });
    }
});

// cập nhật trạng thái đơn hàng khi có bất cứ thay đổi status
// reset thongBao về false
router.put('/status/:id', async (req, res) => {
    const { id } = req.params;
    const { daGiao, daHuy, dangChoXacNhan } = req.body;
    const db = getDb();
    const collection = db.collection('DONHANG');

    try {
        const updateFields = { thongBao: false };
        if (daGiao !== undefined) updateFields.daGiao = daGiao;
        if (daHuy !== undefined) updateFields.daHuy = daHuy;
        if (dangChoXacNhan !== undefined) updateFields.dangChoXacNhan = dangChoXacNhan;

        const updateResult = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateFields }
        );

        if (updateResult.modifiedCount === 1) {
            res.status(200).json({ message: 'Cập nhật trạng thái đơn hàng thành công' });
        } else {
            res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
        }
    } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error);
        res.status(500).json({ error: 'Lỗi Server nội bộ' });
    }
});

// hủy đơn hàng
router.put('/cancel/:id', async (req, res) => {
    const { id } = req.params;
    const db = getDb();
    const collection = db.collection('DONHANG');

    try {
        const updateResult = await collection.updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    thongBao: false,
                    daHuy: true,
                    dangChoXacNhan: false
                }
            }
        );

        if (updateResult.modifiedCount === 1) {
            res.status(200).json({ message: 'Cập nhật thành công' });
        } else {
            res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
        }
    } catch (error) {
        console.error('Lỗi khi cập nhật đơn hàng:', error);
        res.status(500).json({ error: 'Lỗi Server nội bộ' });
    }
});

// khôi phục đơn hàng
router.put('/restore/:id', async (req, res) => {
    const { id } = req.params;
    const db = getDb();
    const collection = db.collection('DONHANG');
    try {
        const updateResult = await collection.updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    thongBao: false,
                    daHuy: false,
                    dangChoXacNhan: true
                }
            }
        );
        if (updateResult.modifiedCount === 1) {
            res.status(200).json({ message: 'Cập nhật thành công' });
        } else {
            res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
        }
    } catch (error) {
        console.error('Lỗi khi cập nhật đơn hàng:', error);
        res.status(500).json({ error: 'Lỗi Server nội bộ' });
    }
});

// cập nhật thông tin người dùng 
router.put('/update/:id', async (req, res) => {
    const { id } = req.params;
    const db = getDb();
    const collection = db.collection('DONHANG');
    try {
        const updatedUserData = req.body;
        if (updatedData._id) {
            delete updatedUserData._id;
        }
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updatedUserData }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng để cập nhật.' });
        }
        res.status(200).json({ message: 'Cập nhật thông tin người dùng thành công.' });
    } catch (error) {
    }
})

module.exports = router;
