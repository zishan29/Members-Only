const express = require('express');
const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const LocalStrategy = require('passport-local').Strategy;
const userController = require('../controllers/userController');
const messageController = require('../controllers/messageController');

const User = require('../models/user');
const Message = require('../models/message');

const router = express.Router();

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ userName: username });
      if (!user) {
        return done(null, false, { message: 'Incorrect username' });
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return done(null, false, { message: 'Incorrect password' });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }),
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/log-in');
};

router.get(
  '/',
  asyncHandler(async (req, res, next) => {
    const messages = await Message.find().exec();
    res.render('index', { user: req.user, messages });
  }),
);

router.get('/sign-up', (req, res, next) => {
  res.render('signup');
});

router.post(
  '/sign-up',
  body('firstName')
    .isLength({ min: 3 })
    .withMessage('First name must be at least 3 characters long'),
  body('lastName')
    .isLength({ min: 3 })
    .withMessage('Last name must be at least 3 characters long'),
  body('userName').custom(async (value) => {
    const user = await User.findOne({ userName: value });
    if (user) {
      throw new Error('Username already exists');
    }
    return true;
  }),
  body('email').custom(async (value) => {
    const user = await User.findOne({ email: value });
    if (user) {
      throw new Error('E-mail already exists');
    }
    return true;
  }),
  body('password')
    .isLength({ min: 5 })
    .withMessage('Password must be at least 5 characters long'),
  body('passwordConfirmation').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  }),
  userController.signUp,
);

router.get('/log-in', (req, res, next) => {
  const errorMessage = req.flash('error')[0];
  res.render('login', { errorMessage });
});

router.post(
  '/log-in',
  (req, res, next) => {
    next();
  },
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/log-in',
    failureFlash: true,
  }),
);

router.get(
  '/activate-membership/:id',
  ensureAuthenticated,
  (req, res, next) => {
    res.render('membershipForm', { user: req.user });
  },
);

router.post(
  '/activate-membership/:id',
  ensureAuthenticated,
  userController.activateMember,
);

router.get('/log-out', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});

router.get('/add-message', ensureAuthenticated, (req, res, next) => {
  res.render('addMessageForm', { user: req.user });
});

router.post('/add-message', ensureAuthenticated, messageController.addMessage);

router.get('/add-admin/:id', ensureAuthenticated, (req, res, next) => {
  res.render('adminForm', { user: req.user });
});

router.post('/add-admin/:id', ensureAuthenticated, userController.addAdmin);

router.get('/delete-message/:id', messageController.deleteMessage);

module.exports = router;
