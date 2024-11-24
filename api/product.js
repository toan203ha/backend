const { getDb } = require('../config/db');
const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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

// lấy tất cả sản phẩm
router.get('', async (req, res) => {
    const db = getDb();
    const collection = db.collection('PRODUCT');
    const products = await collection.find({}).toArray();
    res.json(products);
});

// lấy thông tin sản phẩm thông qua id
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const db = getDb();
    const collection = db.collection('PRODUCT');

    try {
        const productInfo = await collection.findOne({ _id: new ObjectId(id) });
        res.json(productInfo);
    } catch (error) {
        console.error('Error fetching product information:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// tạo sản phẩm
router.post('/create', async (req, res) => {
    const db = getDb();
    const collection = db.collection('PRODUCT');
    const product = req.body;

    try {
        // Kiểm tra dữ liệu đầu vào
        const { TEN, PRICE, SoluongTon, DES, SoLuongGG, CateID, MaNXB, IMG } = product;
        if (!TEN || !PRICE || SoluongTon === undefined || !CateID || !MaNXB) {
            return res.status(400).json({ error: 'Dữ liệu đầu vào không hợp lệ' });
        }

        await collection.insertOne(product);
        res.status(201).send('Product thêm thành công');
    } catch (error) {
        console.error('Lỗi khi thêm sản phẩm:', error);
        res.status(500).json({ error: 'Lỗi Server nội bộ' });
    }
});

// cập nhật thông tin sản phẩm
router.put('/:id', upload.single('IMG'), async (req, res) => {
    const { id } = req.params;
    const updatedUserData = req.body;


    if (updatedUserData._id) {
        delete updatedUserData._id;
    }
    if (req.file) {
        updatedUserData.img = req.file.path;
    }

    const db = getDb();
    const collection = db.collection('PRODUCT');

    try {
        const objectId = new ObjectId(id);
        const result = await collection.updateOne({ _id: objectId }, { $set: updatedUserData });

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: 'Không tìm thấy SẢN PHẨM để cập nhật.' });
        }

        res.status(200).json({ message: 'Cập nhật thông tin SẢN PHẨM thành công.' });
    } catch (error) {
        console.error('Lỗi khi cập nhật thông tin SẢN PHẨM:', error);
        res.status(500).json({ error: 'Lỗi Server nội bộ' });
    }
});


// cập nhật số lượng sản phẩm
router.put('/products/update/:idPro', async (req, res) => {
    const { idPro, SoluongTon } = req.body;
    try {
        const db = getDb();
        const procollection = db.collection('PRODUCT');
        const productId = new ObjectId(idPro);
        const existingProduct = await procollection.findOne({ _id: productId });

        if (!existingProduct) {
            return res.status(404).json({ error: 'Sản phẩm không tồn tại' });
        }

        if (existingProduct.SoluongTon >= SoluongTon) {
            // Cập nhật số lượng tồn của sản phẩm bằng cách giảm nó đi
            const updatedProduct = await procollection.findOneAndUpdate(
                { _id: productId },
                { $inc: { SoluongTon: -SoluongTon } },
                { returnDocument: 'after' }
            );

            if (updatedProduct.ok === 1) {
                res.status(200).send('Sản phẩm đã được cập nhật thành công');
            } else {
                res.status(500).json({ error: 'Lỗi khi cập nhật sản phẩm' });
            }
        } else {
            res.status(400).json({ error: 'Hết hàng' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Lỗi Server nội bộ' });
    }
});

// xóa sản phẩm
router.delete('/products/delete/:id', async (req, res) => {
    const db = getDb();
    const collection = db.collection('PRODUCT');
    const { id } = req.params;

    try {
        const result = await collection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm để xóa.' });
        }

        res.status(200).json({ message: 'Sản phẩm đã được xóa thành công.' });
    } catch (error) {
        console.error('Lỗi khi xóa:', error);
        res.status(500).json({ error: 'Lỗi Server nội bộ', details: error.message, stack: error.stack });
    }
});
module.exports = router;
