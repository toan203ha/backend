const mongoose = require('mongoose');
const { Schema } = mongoose;

const DonhangStatus = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  IN_PROGRESS: 'in-progress'
};

const orderSchema = new Schema({
  _id: { type: Schema.Types.ObjectId, auto: true },
  idCus: { type: String, required: true },
  ngayDat: { type: Date, default: Date.now },
  ngayNhan: { type: Date },
  status: { type: String, enum: Object.values(DonhangStatus), default: DonhangStatus.PENDING },
  address: { type: String },
  tenUser: { type: String },
  thongBao: { type: Boolean, default: false },
  thanhTien: { type: Number },
  daGiao: { type: Boolean, default: false },
  daHuy: { type: Boolean, default: false },
  dangChoXacNhan: { type: Boolean, default: false },
  maKM: { type: String },
}, {
  collection: 'DONHANG',
  timestamps: true,
});

orderSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret.id;
    return ret;
  }
});

const Order = mongoose.model('Donhang', orderSchema);

module.exports = Order;
