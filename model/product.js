const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema({
  name: { type: String, required: true },   
  des: { type: String },   
  img: { type: String },   
  img2: { type: String },  
  img3: { type: String },  
  img4: { type: String },  
  price: { type: Number, required: true },   
  categoryID: { type: String, required: true }, 
  soLuongTon: { type: Number, default: 0 },   
  soLuongGG: { type: Number, default: 0 },    
  maNXB: { type: String },  // Mã Nhà xuất bản
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
