const mongoose = require('mongoose');
const { Schema } = mongoose;

const voucherSchema = new Schema({
  titleVoucher: { type: String, required: true },
  valueVoucher: { type: Number, required: true }, // giá trị require không áp dung với cập nhật
  descVoucher: { type: String },
}, {
  collection: 'VOURCHER',
  timestamps: true,   
});

voucherSchema.set('toJSON', {
  virtuals: true,  
  versionKey: false,  
  transform: function (doc, ret) {
    delete ret.id;    
    return ret;      
  }
});

const Voucher = mongoose.model('VOURCHER', voucherSchema);

module.exports = Voucher;
