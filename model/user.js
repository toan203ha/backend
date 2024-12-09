const mongoose = require('mongoose');
const { Schema } = mongoose;

const customerSchema = new Schema({
  _id: { type: Schema.Types.ObjectId, auto: true },
  fullNameCus: { type: String },
  passWord: { type: String,minlength: 6, maxlength: 15 },
  addressCus: { type: String},
  emailCus: { type: String },
  img: { type: String },
  phoneNumCus: { type: String },
  genderCus: { type: String },
  rank: { type: Number, default: 0 },   
  roleIds: [
    { type: Schema.Types.ObjectId, ref: 'Role', required: false },  
  ],
  isActive: { type: Boolean, default: true },  
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
