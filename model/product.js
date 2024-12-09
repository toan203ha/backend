const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema({
  TEN: { type: String, required: true },   
  DES: { type: String },   
  IMG: { type: String },   
  Hinh_2: { type: String },  
  Hinh_3: { type: String },  
  Hinh_4: { type: String },  
  PRICE: { type: Number, required: true },   
  CateID: { type: [String], required: true }, 
  SoluongTon: { type: Number, default: 0 },   
  soLuongGG: { type: Number, default: 0 },    
  MaNXB: { type: String },   
}, { 
  collection: 'PRODUCT',  
  timestamps: true   
});

 productSchema.set('toJSON', {
  virtuals: true, 
  versionKey: false,  
  transform: function (doc, ret) {
    delete ret.id;    
    return ret;       
  }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
