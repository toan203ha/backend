const express = require('express');
const userRoutes = require('./api/user'); 
const productRoutes = require('./api/product');
const orderRoutes = require('./api/order');
const orderDetailRoutes = require('./api/orderdetail');

const voucherRoutes = require('./api/vourcher');
const categoryRoutes = require('./api/categories');
const cartRoutes = require('./api/cart');
const payment = require('./api/payment');

const router = express.Router();

router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/vouchers', voucherRoutes);
router.use('/categories', categoryRoutes);
router.use('/carts', cartRoutes);
router.use('/payment', payment);

module.exports = router;
