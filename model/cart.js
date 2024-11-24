const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderSchema = new Schema({
  idPro: { type: String, required: true },  
  idCus: { type: String, required: true },  
  price: { type: Number, required: true },   
  soLuong: { type: Number, required: true },  
}, {
  collection: 'GIOHANG',   
  timestamps: true   
});

 orderSchema.set('toJSON', {
  virtuals: true, 
  versionKey: false,   
  transform: function (doc, ret) {
    delete ret.id;   
    return ret;       
  }
});

const Order = mongoose.model('Giohang', orderSchema);

module.exports = Order;
