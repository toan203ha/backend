const { getDb } = require('../config/db');
const express = require('express');
const router = express.Router();


// lấy thông tin chi tiết đơn hàng thông qua id đơn hàng
router.get('/:idDH', async (req, res) => {
    const { idDH } = req.params;
    const db = getDb();
    const collection = db.collection('CTDH');

    try {
        const cartItems = await collection.find({ idDH: idDH }).toArray();
        res.json(cartItems);
        console.log('đã lấy được dữ liệu:', cartItems);

    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu CTDH:', error);
        res.status(500).json({ error: 'Lỗi Server nội bộ' });
    }
});
module.exports = router;
