const mongoose = require('mongoose');
const { Schema } = mongoose;

const roleSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, auto: true }, // ID của role
    name: { type: String, required: true, unique: true }, // Tên role
    description: { type: String }, // Mô tả
    permissionIds: [
      { type: Schema.Types.ObjectId, ref: 'Permission', required: false }, // ID của Permission
    ],
    userIds: [
      { type: Schema.Types.ObjectId, ref: 'User', required: false }, // ID của User
    ],
  },
  {
    collection: 'ROLE',
    timestamps: true, // Thêm `createdAt` và `updatedAt`
  }
);

roleSchema.set('toJSON', {
    virtuals: true, 
    versionKey: false,  
    transform: function (doc, ret) {
      delete ret.id;    
      return ret;       
    }
  });

const Role = mongoose.model('Role', roleSchema);
module.exports = Role;
