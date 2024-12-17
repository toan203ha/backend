const { getDb } = require('../config/db');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const Product = require('../model/product');
const Category = require('../model/category');
const Oderdetail = require('../model/oderdetail');
const Order = require('../model/order');
const User = require('../model/user');
const jwt = require('jsonwebtoken');

// Hàm lấy token từ cookies
function getIDCus(req) {
    const cookies = req.headers.cookie.split('; ').reduce((acc, cookie) => {
        const [name, value] = cookie.split('=');
        acc[name] = value;
        return acc;
    }, {});
    console.log('Cookies:', cookies); // Log tất cả cookie để kiểm tra
    // Kiểm tra token có trong cookies không
    if (cookies['authToken']) {
        const token = cookies['authToken']; // Lấy token từ cookie
        console.log('Token from cookie:', token); // Log token lấy từ cookie
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        return decoded.id;
    } else {
        console.log('No authToken found in cookies');
        return null;
    }
}

// Lấy toàn bộ đơn hàng
router.get('', async (req, res) => {
    // Truyền req vào getIDCus để lấy token
    const token = getIDCus(req);
    console.log('Token from cookie:', token); // Log token lấy từ cookie
    try {
        const orders = await Order.find({});
        res.json({
            isEmpty: orders.length === 0,
            data: orders
        });
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
// function lấy thông tin sản phẩm theo id
// Hàm lấy thông tin sản phẩm theo ID
async function getProductById(id) {
    try {
        const product = await Product.findOne({ _id: new ObjectId(id) });
        if (!product) {
            throw new Error('Không tìm thấy product');
        }
        return product;
    } catch (error) {
        console.error('Lỗi khi lấy product:', error);
        throw error;  // Ném lỗi để có thể xử lý ở nơi gọi hàm
    }
}


// Thêm thông tin đơn hàng
router.post('', async (req, res) => {
    const { ngayNhan, idPro, address, tenUser, thongBao, thanhTien, daGiao, daHuy, dangChoXacNhan } = req.body;
    const idCus = getIDCus(req);
    console.log('IdCus from cookie:', idCus);

    try {
        // Tạo đơn hàng mới
        const newOrder = new Order({
            idCus, ngayNhan, address, tenUser, thongBao, thanhTien, daGiao, daHuy,dangChoXacNhan,
        });
        await newOrder.save();

        // Nếu idPro không phải là mảng, chuyển thành mảng
        const products = Array.isArray(idPro) ? idPro : [idPro];

        // Tạo chi tiết đơn hàng cho từng sản phẩm
        const orderDetails = [];
        for (let i = 0; i < products.length; i++) {
            const product = await getProductById(products[i]);
            const newOrderDetail = new Oderdetail({
                idDH: newOrder._id,
                idPro: product._id, 
                soLuong: 1,  // Lấy từ số lượng trong giỏ hàng
                giaTien: product.PRICE, 
            });

            orderDetails.push(newOrderDetail);
            await newOrderDetail.save();  
            // lấy thông tin từ giỏ hàng truyền vào
            // cập nhật số lượng sản phẩm
            updatedProduct(products[i],1)
        }
        
        // Trả về thông tin đơn hàng cùng chi tiết đơn hàng
        res.json({
            newOrder,
            orderDetails
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// cập nhật số lượng sản phẩm
async function updatedProduct(id, soluong) {
    try {
        // Tìm sản phẩm trước để kiểm tra số lượng tồn
        const product = await Product.findOne({ _id: id });
        if (!product) {
            throw new Error('Không tìm thấy sản phẩm');
        }

        // Kiểm tra số lượng tồn kho
        if (product.SoluongTon < soluong) {
            throw new Error('Số lượng tồn không đủ để cập nhật');
        }

        // Cập nhật số lượng sản phẩm
        const updatedProduct = await Product.updateOne(
            { _id: id },
            { $set: { SoluongTon: product.SoluongTon - soluong } }
        );

        // Kiểm tra kết quả cập nhật
        if (updatedProduct.modifiedCount === 0) {
            throw new Error('Không tìm thấy dữ liệu input product');
        }

        return { success: true, message: 'Cập nhật số lượng sản phẩm thành công' };
    } catch (error) {
        console.error('Lỗi khi cập nhật sản phẩm:', error.message);
        return { success: false, message: error.message };
    }
}

// phục hồi số lượng sản phẩm
async function updatedRestoreProduct(id, soluong) {
    try {
        // Tìm sản phẩm trước để kiểm tra số lượng tồn
        const product = await Product.findOne({ _id: id });
        if (!product) {
            throw new Error('Không tìm thấy sản phẩm');
        }
        // chuyển sô lượng về dạng số
        soluong = parseInt(soluong)
        // Cập nhật số lượng sản phẩm
        const updatedProduct = await Product.updateOne(
            { _id: id },
            { $set: { SoluongTon: product.SoluongTon + soluong } }
        );

        // Kiểm tra kết quả cập nhật
        if (updatedProduct.modifiedCount === 0) {
            throw new Error('Không tìm thấy dữ liệu input product');
        }

        return { success: true, message: 'Cập nhật số lượng sản phẩm thành công' };
    } catch (error) {
        console.error('Lỗi khi cập nhật sản phẩm:', error.message);
        return { success: false, message: error.message };
    }
}


// cập nhật đơn hàng
router.put('/orders/:id', async (req, res) => {
    const { id } = req.params;
    const { status, thanhTien, ngayNhan, address, tenUser } = req.body;

    console.log('Received update request for order:', req.body);

    try {
        // Kiểm tra định dạng ObjectId
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ error: 'Invalid order ID format' });
        }

        // Tìm đơn hàng và chi tiết đơn hàng
        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
        }

        // Tìm tất cả chi tiết đơn hàng liên quan đến đơn hàng
        const orderDetails = await Oderdetail.find({ idDH: order._id });
        if (!orderDetails || orderDetails.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy chi tiết đơn hàng liên quan' });
        }
        
    
        // Cập nhật các trường được truyền
        if (status) {
            if (!['pending', 'completed', 'cancelled', 'in-progress'].includes(status)) {
                return res.status(400).json({ error: 'Invalid status value' });
            }
            order.status = status;
            if (status === 'cancelled') {
                orderDetails.forEach(detail => {
                    updatedRestoreProduct(detail.idPro,detail.soLuong)
                });
            }
        }

        if (thanhTien) {
            if (isNaN(thanhTien) || thanhTien < 0) {
                return res.status(400).json({ error: 'Invalid thanhTien value' });
            }
            order.thanhTien = thanhTien;
        }

        if (ngayNhan) {
            const ngayNhanDate = new Date(ngayNhan);
            if (isNaN(ngayNhanDate.getTime())) {
                return res.status(400).json({ error: 'Invalid ngayNhan value' });
            }
            order.ngayNhan = ngayNhanDate;
        }

        if (address) {
            if (typeof address !== 'string' || address.trim().length === 0) {
                return res.status(400).json({ error: 'Invalid address value' });
            }
            order.address = address;
        }

        if (tenUser) {
            if (typeof tenUser !== 'string' || tenUser.trim().length === 0) {
                return res.status(400).json({ error: 'Invalid tenUser value' });
            }
            order.tenUser = tenUser;
        }

        // Lưu đơn hàng sau khi cập nhật
        await order.save();

        res.json({ message: 'Order updated successfully', order });
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});



module.exports = router;
