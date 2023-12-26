const mongoose = require('mongoose');

const { Schema } = mongoose;

const UserSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  userName: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  membership: { type: Boolean },
  role: { type: String, default: 'user' },
});

UserSchema.virtual('url').get(function () {
  return `/activate-membership/${this._id}`;
});

UserSchema.virtual('adminURL').get(function () {
  return `/add-admin/${this._id}`;
});

module.exports = mongoose.model('User', UserSchema);
