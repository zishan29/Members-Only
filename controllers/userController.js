const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
require('dotenv').config();

exports.signUp = asyncHandler(async (req, res, next) => {
  let errors = validationResult(req);
  errors = errors.array();

  const errorMessages = {};
  errors.forEach((error) => {
    const { path, msg } = error;
    if (!errorMessages[path]) {
      errorMessages[path] = [];
    }
    errorMessages[path].push(msg);
  });
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  const user = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    userName: req.body.userName,
    email: req.body.email,
    password: hashedPassword,
    membership: false,
  });
  if (errors.length) {
    console.log(errorMessages);
    res.render('signup', { errorMessages, formData: req.body });
  } else {
    await user.save();
    res.redirect('/log-in');
  }
});

exports.activateMember = asyncHandler(async (req, res, next) => {
  if (req.body.password === process.env.MEMBER_PASS) {
    const user = await User.findById(req.params.id);
    const newUser = new User({
      firstName: user.firstName,
      lastName: user.lastName,
      userName: user.userName,
      email: user.email,
      password: user.password,
      membership: true,
      role: user.role,
      _id: req.params.id,
    });
    await User.findByIdAndUpdate(req.params.id, newUser, {});
    res.redirect('/');
  }
  res.render('membershipForm', {
    error: 'Wrong password! Try again.',
    user: req.user,
  });
});

exports.addAdmin = asyncHandler(async (req, res, next) => {
  if (req.body.password === process.env.ADMIN_PASS) {
    console.log('Success');
    console.log(req.params.id);
    const user = await User.findById(req.params.id);
    const newUser = new User({
      firstName: user.firstName,
      lastName: user.lastName,
      userName: user.userName,
      email: user.email,
      password: user.password,
      membership: user.membership,
      role: 'admin',
      _id: req.params.id,
    });
    console.log(newUser);
    await User.findByIdAndUpdate(req.params.id, newUser, {});
    res.redirect('/');
  }
  res.render('adminForm', {
    error: 'Wrong password! Try again.',
    user: req.user,
  });
});
