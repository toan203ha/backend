const { getDb } = require('../config/db');
const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
 
// hiển thị giỏ hàng
router.get('', async (req, res) => {
    const db = getDb();
    const collection = db.collection('GIOHANG');
    const categories = await collection.find({}).toArray();
    res.json(categories);
});

// Lấy giỏ hàng theo idCus
router.get('/:idCus', async (req, res) => {
    const { idCus } = req.params;
    const db = getDb();
    const collection = db.collection('GIOHANG');

    try {
        const cartItems = await collection.find({ idCus: idCus }).toArray();
        res.json(cartItems);
    } catch (error) {
        console.error('Lỗi khi lấy giỏ hàng:', error);
        res.status(500).json({ error: 'Lỗi Server nội bộ' });
    }
});


// Thêm giỏ hàng
router.post('', async (req, res) => {
    const { idPro, idCus, soLuong, price } = req.body;
    try {
        const db = getDb();
        const giohangCollection = db.collection('GIOHANG');
        const existingCartItem = await giohangCollection.findOne({ idPro: idPro, idCus: idCus });
        if (existingCartItem) {
            const updatedCartItem = {
                ...existingCartItem,
                soLuong: existingCartItem.soLuong + soLuong,
            };
            const updateResult = await giohangCollection.findOneAndUpdate(
                { idPro: idPro, idCus: idCus },
                { $set: updatedCartItem },
                { returnOriginal: false }
            );

            if (updateResult.ok === 1) {
                res.status(200).send('Giỏ hàng đã được cập nhật thành công');
            } else {
                res.status(500).json({ error: 'Lỗi khi cập nhật giỏ hàng' });
            }
        } else {
            const cart = req.body;
            await giohangCollection.insertOne(cart);
            res.status(201).send('Sản phẩm đã được thêm vào giỏ hàng thành công');
        }
    } catch (error) {
        console.error('Lỗi khi thêm giỏ hàng:', error);
        res.status(500).json({ error: 'Lỗi Server nội bộ' });
    }
});



//xoa gio hang
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        if (!ObjectId.isValid(id)) {
            return res.status(400).send('Invalid ID format');
        }
        const db = getDb();
        const collection = db.collection('GIOHANG');

        const result = await collection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 1) {
            res.send('Giỏ hàng đã được xóa thành công');
        } else {
            res.status(404).send('Không tìm thấy giỏ hàng để xóa');
        }
    } catch (error) {
        console.error('Lỗi khi xóa giỏ hàng:', error);
        res.status(500).send('Lỗi server khi xóa giỏ hàng');
    }
});


//CAP NHAT GIO HANG
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const updatedCartData = req.body;
    const db = getDb();
    const collection = db.collection('GIOHANG');

    try {
        const objectId = new ObjectId(id);
        const result = await collection.updateOne({ _id: objectId }, { $set: updatedCartData });

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm để cập nhật.' });
        }

        res.status(200).json({ message: 'Cập nhật thông tin sản phẩm trong giỏ hàng thành công.' });
    } catch (error) {
        console.error('Lỗi khi cập nhật thông tin giỏ hàng:', error);
        res.status(500).json({ error: 'Lỗi Server nội bộ' });
    }
});

module.exports = router;
