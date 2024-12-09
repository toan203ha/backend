const mongoose = require('mongoose');
const { Schema } = mongoose;

const nxbSchema = new Schema({
  TenNXB: { type: String, required: true, maxlength: 100, minlength: 1 },
  DiaChi: { type: String, required: true, maxlength: 100, minlength: 1 },
  SDT: { type: String, required: true, maxlength: 10, minlength: 1 },
  Website: { type: String, required: true, maxlength: 100, minlength: 1 },
  Region: {
    type: String,
    required: true,
    enum: ["Toàn quốc", "Quốc tế", "Miền Bắc", "Miền Nam", "Miền Trung"]
  },
  Description: { type: String, required: true, maxlength: 500, minlength: 1 },
  representative: { type: String, required: true, maxlength: 100, minlength: 1 },

  category: { type: [String] },
  Email: {
    type: String,
    required: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  }
}, {
  collection: 'NXB',
  timestamps: true,
});

nxbSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret.id;
    return ret;
  }
});

const nxb = mongoose.model('NXB', nxbSchema);

module.exports = nxb;
