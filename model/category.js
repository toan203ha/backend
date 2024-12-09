const mongoose = require('mongoose');
const { Schema } = mongoose;

const categorySchema = new Schema({
  TENLOAI: String,
  Img: String
}, { 
  collection: 'CATEGORY',
  timestamps: true
});

 categorySchema.set('toJSON', {
  virtuals: true,  
  versionKey: false,  
  transform: function (doc, ret) {
    delete ret.id;    
    return ret;      
  }
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
