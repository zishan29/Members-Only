const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const Message = require('../models/message');

exports.addMessage = asyncHandler(async (req, res, next) => {
  const newMessage = new Message({
    title: req.body.title,
    message: req.body.message,
    user: res.locals.currentUser,
  });
  await newMessage.save();
  res.redirect('/');
});

exports.deleteMessage = asyncHandler(async (req, res, next) => {
  await Message.findByIdAndDelete(req.params.id);
  res.redirect('/');
});
