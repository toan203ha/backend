const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getDb } = require('./config/db');
const express = require('express');
const crypto = require('crypto');
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


// cập nhật thông tin người dùng
router.put('/users/:id', upload.single('img'), async (req, res) => {
  const { id } = req.params;
  const updatedUserData = req.body;
  

  if (updatedUserData._id) {
    delete updatedUserData._id;
}
  if (req.file) {
    updatedUserData.img = req.file.path;
  }

  const db = getDb();   
  const collection = db.collection('USER');
  
  try {
    const objectId = new ObjectId(id);
    const result = await collection.updateOne({ _id: objectId }, { $set: updatedUserData });
    
    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng để cập nhật.' });
    }
    
    res.status(200).json({ message: 'Cập nhật thông tin người dùng thành công.' });
  } catch (error) {
    console.error('Lỗi khi cập nhật thông tin người dùng:', error);
    res.status(500).json({ error: 'Lỗi Server nội bộ' });
  }
});
// lấy hình ảnh
router.get('/images/:id', async (req, res) => {
  const { id } = req.params;
  const db = getDb();
  const collection = db.collection('USER');

  try {
    const objectId = new ObjectId(id);
    const user = await collection.findOne({ _id: objectId });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
     const imagePath =  user.img;  

    res.sendFile(imagePath);
  } catch (error) {
    console.error('Error getting image:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

 

// Lấy cơ sở dữ liệu
router.get('/categories', async (req, res) => {
  const db = getDb();
  const collection = db.collection('CATEGORY');
  const categories = await collection.find({}).toArray();
  res.json(categories);
});

router.get('/products', async (req, res) => {
  const db = getDb();
  const collection = db.collection('PRODUCT');
  const products = await collection.find({}).toArray();
  res.json(products);
});

router.get('/all/users', async (req, res) => {
  const db = getDb();
  const collection = db.collection('USER');
  const users = await collection.find({}).toArray();
  res.json(users);
});

router.get('/all/products', async (req, res) => {
  const db = getDb();
  const collection = db.collection('PRODUCT');
  const products = await collection.find({}).toArray();
  res.json(products);
});

// lấy thông tin sản phẩm thông qua id
router.get('/products/info/:id', async (req, res) => {
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
//lấy thông tin vourcher
router.get('/vourcher', async (req, res) => {
  try {
  const db = getDb();
  const collection = db.collection('VOURCHER');
  const users = await collection.find({}).toArray();
  res.json(users);
  } catch (error) {
    console.error('Error fetching product information:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
// lấy thông tin voucher thông qua id 
 router.get('/vourcher/info/:idVou', async (req, res) => {
  const { idVou } = req.params;
  const db = getDb();
  const collection = db.collection('VOURCHER');
  
  try {
    const cartItems = await collection.find({ _id: new ObjectId(idVou) }).toArray();
    res.json(cartItems);
    console.log('mã vourcher:'+ idVou)
  } catch (error) {
    console.error('Lỗi khi lấy thông tin người dùng:', error);
    res.status(500).json({ error: 'Lỗi Server nội bộ' });
  }
});
// Thêm dữ liệu
router.post('/categories', async (req, res) => {
  const db = getDb();
  const collection = db.collection('CATEGORY');
  const category = req.body;
  await collection.insertOne(category);
  res.status(201).send('Category thêm thành công');
});

router.post('/products/create', async (req, res) => {
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


////////////////////////////////////////
// cập nhật thông tin
////////////// Sản phẩm ////////////////////// 
 router.put('/products/update/all/:id', upload.single('IMG'), async (req, res) => {
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





// Đăng ký người dùng
router.post('/users', async (req, res) => {
  const { email, password, phoneNumber } = req.body;
  const db = getDb();
  const collection = db.collection('USER');
  const user = req.body;
  const existingUser = await collection.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'Email đã tồn tại.' });
  }
  await collection.insertOne(user);
  res.status(201).send('User thêm thành công');
});

// tạo người dùng
router.post('/users/create', async (req, res) => {
  const { email, password, phoneNumber } = req.body;
  const db = getDb();
  const collection = db.collection('USER');
  const user = req.body;
  const existingUser = await collection.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'Email đã tồn tại.' });
  }
  await collection.insertOne(user);
  res.status(201).send('User thêm thành công');
});

// hiển thị giỏ hàng
router.get('/cart', async (req, res) => {
  const db = getDb();
  const collection = db.collection('GIOHANG');
  const categories = await collection.find({}).toArray();
  res.json(categories);
});

// Lấy giỏ hàng theo idCus
router.get('/cart/:idCus', async (req, res) => {
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

// lấy thông tin người dùng thông qua id
router.get('/users/info/:idCus', async (req, res) => {
  const { idCus } = req.params;
  const db = getDb();
  const collection = db.collection('USER');
  
  try {
    const cartItems = await collection.find({ _id: new ObjectId(idCus) }).toArray();
    res.json(cartItems);
    console.log(idCus)
  } catch (error) {
    console.error('Lỗi khi lấy thông tin người dùng:', error);
    res.status(500).json({ error: 'Lỗi Server nội bộ' });
  }
});

// lấy thông tin sản phẩm thông qua id
router.get('/products/info/:idPro', async (req, res) => {
  const { idPro } = req.params;
  const db = getDb();
  const collection = db.collection('PRODUCTS');
  
  try {
    const cartItems = await collection.find({ _id: new ObjectId(idPro) }).toArray();
    res.json(cartItems);
  } catch (error) {
    console.error('Lỗi khi lấy thông tin người dùng:', error);
    res.status(500).json({ error: 'Lỗi Server nội bộ' });
  }
});
// Thêm giỏ hàng
// router.post('/cart', async (req, res) => {
//   const { idPro, idCus, count, price } = req.body;
//   console.log('Price:', price);
//   console.log('Product ID:', idPro);
//   console.log('Count:', count);
//   console.log('Customer ID:', idCus);

//   try {
//     const db = getDb();
//     const collection = db.collection('GIOHANG');
//     const cart = req.body;
//     await collection.insertOne(cart);
//     res.status(201).send('Giỏ hàng thêm thành công');
//   } catch (error) {
//     console.error('Lỗi khi thêm giỏ hàng:', error);
//     res.status(500).json({ error: 'Lỗi Server nội bộ' });
//   }
// });


// Thêm giỏ hàng
router.post('/cart', async (req, res) => {
  const { idPro, idCus, soLuong, price } = req.body;
  console.log('Price:', price);
  console.log('Product ID:', idPro);
  console.log('soLuong:', soLuong);
  console.log('Customer ID:', idCus);

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
router.delete('/cart/delete/:id', async (req, res) => {
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
router.put('/cart/:id', async (req, res) => {
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

const nodemailer = require('nodemailer');

router.post('/inform/', async (req, res) => {
  // Create a transporter object using SMTP transport
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'toan30112003@gmail.com', // Thay bằng email của bạn
      pass: 'huutoan3011' // Thay bằng mật khẩu của bạn hoặc mã app password
    }
  });

  // Define the email options
  const mailOptions = {
    from: 'toan30112003@gmail.com', // Địa chỉ email người gửi
    to: 'toan30112003b@gmail.com', // Địa chỉ email người nhận
    subject: 'Important Information', // Tiêu đề email
    text: 'This is an important message for you.' // Nội dung email
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
  
    console.log('Email sent:', 'info.response');
    res.status(200).json({ message: 'Email sent successfully' });
  });
});

// // cập nhật số lượng sản phẩm
// router.put('/products/update/:idPro', async (req, res) => {
//   const { idPro,SoluongTon } = req.body;   
//    try {
//     const db = getDb();
//     const procollection = db.collection('PRODUCT');
//      const existingCartItem = await procollection.findOne({ idPro: idPro });
//     if (existingCartItem.SoluongTon>=1) {
//        const updatedCartItem = {
//         ...existingCartItem,
//         SoluongTon: existingCartItem.SoluongTon - SoluongTon,
//       };

//        const updateResult = await procollection.findOneAndUpdate(
//         { idPro: idPro},
//         { $set: updatedCartItem },
//         { returnOriginal: false }
//       );

//       if (updateResult.ok === 1) {
//         res.status(200).send('sản phẩm đã được cập nhật thành công');
//       } else {
//         res.status(500).json({ error: 'Lỗi khi cập nhật hahaah  ' });
//       }
//     }else{
//       res.status(500).json({ error: 'Hết hàng  ' });
//     }  
//   } catch (error) {
//     console.error('Lỗi:', error);
//     res.status(500).json({ error: 'Lỗi Server nội bộ' });
//   }
// });


// cập nhật sản phẩm
// router.put('/products/update/:idPro', async (req, res) => {
//   const { idPro, SoluongTon } = req.body;
//   console.log('Request received:', req.body); 

//   try {
//     const db = getDb();
//     const procollection = db.collection('PRODUCT');
//     const productId = new ObjectId(idPro); 
//     const existingProduct = await procollection.findOne({ _id: productId });

//     if (!existingProduct) {
//       console.log('Sản phẩm không tồn tại:', idPro);
//       return res.status(404).json({ error: 'Sản phẩm không tồn tại' });
//     }

//     if (existingProduct.SoluongTon >= SoluongTon) {
//       const updatedProduct = await procollection.findOneAndUpdate(
//         { _id: productId },
//         { $inc: { SoluongTon: -SoluongTon } },
//         { returnDocument: 'after' }
//       );

//       if (updatedProduct.ok === 1) {
//         console.log('Sản phẩm đã được cập nhật thành công:', updatedProduct.value);
//         res.status(200).send('Sản phẩm đã được cập nhật thành công');
//       } else {
//         console.error('Lỗi khi cập nhật sản phẩm:', updatedProduct.lastErrorObject);
//         res.status(500).json({ error: 'Lỗi khi cập nhật sản phẩm' });
//       }
//     } else {
//       console.log('Hết hàng:', existingProduct.SoluongTon);
//       res.status(400).json({ error: 'Hết hàng' });
//     }
//   } catch (error) {
//     console.error('Lỗi:', error);
//     res.status(500).json({ error: 'Lỗi Server nội bộ' });
//   }
// });
// cập nhật sản phẩm
router.put('/products/update/:idPro', async (req, res) => {
  const { idPro, SoluongTon } = req.body;
  console.log('Request received:', req.body); // Logging the request body to the console

  try {
    const db = getDb();
    const procollection = db.collection('PRODUCT');
    const productId = new ObjectId(idPro);

    // Tìm sản phẩm hiện tại trong cơ sở dữ liệu với idPro được cung cấp
    const existingProduct = await procollection.findOne({ _id: productId });

    if (!existingProduct) {
      console.log('Sản phẩm không tồn tại:', idPro);
      return res.status(404).json({ error: 'Sản phẩm không tồn tại' });
    }

    // Kiểm tra số lượng tồn hiện tại của sản phẩm
    console.log('Số lượng tồn hiện tại:', existingProduct.SoluongTon);
    console.log('Số lượng cần giảm:', SoluongTon);

    if (existingProduct.SoluongTon >= SoluongTon) {
      // Cập nhật số lượng tồn của sản phẩm bằng cách giảm nó đi
      const updatedProduct = await procollection.findOneAndUpdate(
        { _id: productId },
        { $inc: { SoluongTon: -SoluongTon } },
        { returnDocument: 'after' }
      );

      if (updatedProduct.ok === 1) {
        console.log('Sản phẩm đã được cập nhật thành công:', updatedProduct.value);
        console.log('Số lượng tồn sau khi cập nhật:', updatedProduct.value.SoluongTon);
        res.status(200).send('Sản phẩm đã được cập nhật thành công');
      } else {
        console.error('Lỗi khi cập nhật sản phẩm:', updatedProduct.lastErrorObject);
        res.status(500).json({ error: 'Lỗi khi cập nhật sản phẩm' });
      }
    } else {
      console.log('Hết hàng:', existingProduct.SoluongTon);
      res.status(400).json({ error: 'Hết hàng' });
    }
  } catch (error) {
    console.error('Lỗi:', error);
    res.status(500).json({ error: 'Lỗi Server nội bộ' });
  }
});

 

// thanh toán
router.post('/donhang/payment/', async (req, res) => {
  const { idCus, address, tenUser, cartItems,thanhTien,maKM } = req.body;
  const selectedCartItems = cartItems.filter(item => item.selected);

  const db = getDb();
  const ordersCollection = db.collection('DONHANG');
  const orderDetailsCollection = db.collection('CTDH');


  console.log('ID CUS:', idCus);
  console.log('DIA CHI:', address);
  console.log('NAME:', tenUser);
  console.log('SP:', cartItems);
  
  try {
    let totalOrderAmount = 0;
   // const cartItems = await giohangCollection.find({ idCus: idCus }).toArray();

    // Tính tổng số tiền đơn hàng
    for (const item of selectedCartItems ) {
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
      console.log('idPro:', idPro);
      console.log('soLuong:', soLuong);
      console.log('thanhTien:', thanhTien);
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
// lấy danh sách đơn hàng đã thanh toán
router.get('/donhang/payment/:idCus', async (req, res) => {
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

router.get('/donhang/all', async (req, res) => {
  const db = getDb();
  const collection = db.collection('DONHANG');
  const categories = await collection.find({}).toArray();
  res.json(categories);
});

router.get('/donhang/payment/:idCus', async (req, res) => {
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

// lấy danh sách đơn hàng đã thanh toán ở trang thông báo
 router.get('/donhang/thongbao/:idCus', async (req, res) => {
  const { idCus } = req.params;
  const db = getDb();
  const collection = db.collection('DONHANG');

  try {
    const query = {
      idCus: idCus,
      thongBao: false
    };

    const donhang = await collection.find(query).toArray();
    
    res.json(donhang);
  } catch (error) {
    console.error('Lỗi khi lấy đơn hàng:', error);
    res.status(500).json({ error: 'Lỗi Server nội bộ' });
  }
});


// chuyển trạng thái thông báo
// cập nhật thongBao thành true khi người dùng click vào đơn hàng
router.put('/donhang/thongbao/:id', async (req, res) => {
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

// cập nhật trạng thái đơn hàng khi có thay đổi status
// reset thongBao về false
router.put('/donhang/thongbao/status/:id', async (req, res) => {
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

// lấy thông tin chi tiết đơn hàng thông qua id đơn hàng
router.get('/chitietdonhang/info/:idDH', async (req, res) => {
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
// hủy đơn hàng
router.put('/donhang/cancel/:id', async (req, res) => {
  const { id } = req.params;
  const db = getDb();
  const collection = db.collection('DONHANG');

  try {
    const updateResult = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { thongBao: false,
        daHuy:true,
        dangChoXacNhan:false } }
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


router.put('/donhang/restore/:id', async (req, res) => {
  const { id } = req.params;
  const db = getDb();
  const collection = db.collection('DONHANG');
  try {
    const updateResult = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { thongBao: false,
        daHuy:false,
        dangChoXacNhan:true } }
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
router.put('/update/donhang/:id', async(req,res)=>{
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


//----------------------------------------------------------------------------------------------------------------------
// Xóa dữ liệu
router.delete('/categories/:id', async (req, res) => {
  const db = getDb();
  const collection = db.collection('CATEGORY');
  const { id } = req.params;
  await collection.deleteOne({ _id: new ObjectId(id) });
  res.send('Category deleted');
});

// router.delete('/products/:id', async (req, res) => {
//   const db = getDb();
//   const collection = db.collection('PRODUCT');
//   const { id } = req.params;
//   await collection.deleteOne({ _id: new ObjectId(id) });
//   res.send('Product deleted');
// });

// router.delete('/users/:id', async (req, res) => {
//   const db = getDb();
//   const collection = db.collection('USER');
//   const { id } = req.params;
//   await collection.deleteOne({ _id: new ObjectId(id) });
//   res.send('User deleted');
// });

router.delete('/users/delete/:id', async (req, res) => {
  const db = getDb();
  const collection = db.collection('USER');
  const { id } = req.params;

  try {
     const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
       return res.status(404).json({ message: 'Không tìm thấy người dùng để xóa.' });
    }

    res.status(200).json({ message: 'Người dùng đã được xóa thành công.' });
  } catch (error) {
     console.error('Lỗi khi xóa người dùng:', error);
    res.status(500).json({ error: 'Lỗi Server nội bộ', details: error.message, stack: error.stack });
  }
});
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
 //----------------------------------------------------------------------------------------------------------------------
 




// Tìm thông tin user theo mã id
router.get('/users/:id', async (req, res) => {
  try {
    const db = getDb(); 
    const collection = db.collection('USER');
    const { id } = req.params;
    console.log(`Looking for user with ID: ${id}`);
    const objectId = new ObjectId(id);
    console.log('ObjectId created:', objectId);
    
    const user = await collection.findOne({ _id: objectId });

    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'User not found.' });
    }

    console.log('User found:', user);
    res.json(user);
  } catch (error) {
    console.error('Error occurred:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
//----------------------------------------------------------------------------------------------------------------------
// Đăng nhập người dùng  
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const db = getDb();
  const collection = db.collection('USER');
  
  // Tìm người dùng với email và password
  const user = await collection.findOne({ email, password });
  
  if (!user) {
    return res.status(400).json({ message: 'Email hoặc mật khẩu không chính xác.' });
  }
  
  res.status(200).json({ message: 'Đăng nhập thành công!', user });
    // Tạo token JWT
  const token = jwt.sign({ email: user.email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

  res.status(200).json({ token });
});

//----------------------------------------------------------------------------------------------------------------------


module.exports = router;
