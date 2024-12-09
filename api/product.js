const { getDb } = require('../config/db');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const Product = require('../model/product');
const Category = require('../model/category');
const Nxb = require('../model/nxb');
// lay toan bo san pham
router.get('', async (req, res) => {
    try {
        const nxb = await Product.find({});
        res.json(nxb);
    } catch (error) {
        console.error('Error fetching nxb:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
// them thong tin san pham
router.post('', async (req, res) => {
    const { TEN, DES, IMG, Hinh_2, Hinh_3, Hinh_4, PRICE, CateID, SoluongTon, soLuongGG, MaNXB } = req.body;
    console.log(req.body);

    if (!TEN || !DES || !IMG || !PRICE || !CateID || !SoluongTon || !soLuongGG || !MaNXB) {
        return res.status(400).json({ error: 'Thiếu thông tin' });
    }
    
            // Kiểm tra tất cả các category va ma nxb có hợp lệ hay không
            const isValidCategories = await Promise.all(
                
                CateID.map(async (id) => {
                    if (!ObjectId.isValid(id)) {
                        return false;
                    }
                    const exists = await Category.findOne({ _id: id });
                    return !!exists;
                }),
            );
    
            if (isValidCategories.includes(false)) {
                return res.status(400).json({ error: 'Category hoac nxb không hợp lệ hoặc không tồn tại' });
            }

    
    try {
        const newProduct = new Product({
            TEN,
            DES,
            IMG,
            Hinh_2,
            Hinh_3,
            Hinh_4,
            PRICE,
            CateID,
            SoluongTon,
            soLuongGG,
            MaNXB,
        });

        const savedProduct = await newProduct.save();

        res.status(201).json({ message: 'Thêm sản phẩm thành công', data: { savedProduct } });
    } catch (error) {
        console.error('Lỗi khi thêm sản phẩm:', error);
        res.status(500).json({ error: 'Lỗi Server nội bộ' });
    }
});


// lay san pham theo id
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findOne({ _id: new ObjectId(id) });
        if (!product) {
            return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
        }
        res.json(product);
    } catch (error) {
        console.error('Lỗi khi lấy sản phẩm:', error);
        res.status(500).json({ error: 'Lỗi Server nội bộ' });
    }
});

// cap nhat san pham theo id params
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { TEN, DES, IMG, Hinh_2, Hinh_3, Hinh_4, PRICE, CateID, SoluongTon, soLuongGG, MaNXB } = req.body;

    try {
        const updatedProduct = await Product.updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    TEN,
                    DES,
                    IMG,
                    Hinh_2,
                    Hinh_3,
                    Hinh_4,
                    PRICE,
                    CateID,
                    SoluongTon,
                    soLuongGG,
                    MaNXB,
                }
            }
        );

        if (updatedProduct.modifiedCount === 0) {
            return res.status(404).json({ error: 'Sản phẩm không tìm thấy' });
        }

        res.json({ message: 'Cập nhật sản phẩm thành công' });
    } catch (error) {
        console.error('Lỗi khi cập nhật sản phẩm:', error);
        res.status(500).json({ error: 'Lỗi Server nội bộ' });
    }
});
 
// xóa sản phẩm
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedProduct = await Product.deleteOne({ _id: new ObjectId(id) });
        if (deletedProduct.deletedCount === 0) {
            return res.status(404).json({ error: 'Sản phẩm không tìm thấy' });
        }
        res.json({ message: 'Xóa sản phẩm thành công' });
    } catch (error) {
        console.error('Lỗi khi xóa sản phẩm:', error);
        res.status(500).json({ error: 'Lỗi Server nội bộ' });
    }
});


module.exports = router;
