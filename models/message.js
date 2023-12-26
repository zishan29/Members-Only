const mongoose = require('mongoose');
const { formatDistanceToNow } = require('date-fns');

const { Schema } = mongoose;

const MessageSchema = new Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    user: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true },
);

MessageSchema.virtual('timeElapsed').get(function () {
  return formatDistanceToNow(this.createdAt, { addSuffix: true });
});

module.exports = mongoose.model('Message', MessageSchema);
