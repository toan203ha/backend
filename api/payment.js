const { getDb } = require('../config/db');
const express = require('express');
const router = express.Router();


// thanh toán
router.post('/donhang/payment/', async (req, res) => {
    const { idCus, address, tenUser, cartItems, thanhTien, maKM } = req.body;
    const selectedCartItems = cartItems.filter(item => item.selected);
    const db = getDb();
    const ordersCollection = db.collection('DONHANG');
    const orderDetailsCollection = db.collection('CTDH');

    try {
        let totalOrderAmount = 0;
        // Tính tổng số tiền đơn hàng
        for (const item of selectedCartItems) {
            const { idPro, soLuong, thanhTien } = item;
            totalOrderAmount += parseFloat(thanhTien);
        }
        // Tạo đối tượng đơn hàng mới
        const newOrder = {
            idCus: idCus,
            ngayDat: new Date(),
            ngayNhan: null,
            address: address,
            tenUser: tenUser,
            daGiao: false,
            daHuy: false,
            dangChoXacNhan: true,
            thongBao: false,
            thanhTien: thanhTien,
            maKM: maKM,
        };
        const insertOrderResult = await ordersCollection.insertOne(newOrder);
        const orderID = insertOrderResult.insertedId;

        // Thêm chi tiết đơn hàng vào cơ sở dữ liệu
        for (const item of cartItems) {
            const { idPro, soLuong, thanhTien } = item;
            const orderDetail = {
                idDH: orderID.toHexString(),
                idPro: idPro,
                soLuong: soLuong,
                thanhTien: thanhTien,
            };

            const insertDetailResult = await orderDetailsCollection.insertOne(orderDetail);

        }
        // Trả về thông báo thành công
        res.status(201).json({ message: 'Order placed successfully.' });
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
module.exports = router;
