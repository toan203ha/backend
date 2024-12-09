const mongoose = require('mongoose');
const { Schema } = mongoose;

const permissionSchema = new Schema(
    {
      _id: { type: Schema.Types.ObjectId, auto: true }, // ID của permission
      name: { type: String, required: true, unique: true }, // Tên permission
      description: { type: String }, // Mô tả
      roleIds: [
        { type: Schema.Types.ObjectId, ref: 'Role', required: false }, // ID của Role
      ],
    },
    {
      collection: 'PERMISSION',
      timestamps: true,  
    }
  );
  
  permissionSchema.set('toJSON', {
    virtuals: true, 
    versionKey: false,  
    transform: function (doc, ret) {
      delete ret.id;    
      return ret;       
    }
  });
  const Permission = mongoose.model('Permission', permissionSchema);
module.exports = Permission;
  