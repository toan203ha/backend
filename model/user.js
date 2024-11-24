const mongoose = require('mongoose');
const { Schema } = mongoose;

const customerSchema = new Schema({
  fullNameCus: { type: String, required: true },
  addressCus: { type: String, required: true },
  emailCus: { type: String, required: true },
  img: { type: String },
  phoneNumCus: { type: String, required: true },
  genderCus: { type: String },
  rank: { type: Number, default: 0 },   
}, {
  collection: 'USER',
  timestamps: true,  
});

customerSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret.idCus;  
    return ret;
  }
});

const Customer = mongoose.model('User', customerSchema);

module.exports = Customer;
