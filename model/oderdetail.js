const mongoose = require('mongoose');
const { Schema } = mongoose;

const ctdhSchema = new Schema({
  idDH: { type: String, required: true },
  idPro: { type: String, required: true },
  soLuong: { type: String, required: true },
  thanhTien: { type: Number, required: true },
}, {
  collection: 'CTDH',
  timestamps: true,  
});

ctdhSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret.id;   
    return ret;
  }
});

const CTDH = mongoose.model('CTDH', ctdhSchema);

module.exports = CTDH;
