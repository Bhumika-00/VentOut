const express = require('express');
const router = express.Router();
const Session = require('../models/Session'); 


const ensureAuth = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.redirect('/auth/login');
};


router.get('/', (req, res) => res.render('login'));


router.get('/dashboard', ensureAuth, async (req, res) => {
  const user = req.user;

  
  const session = await Session.findOne({
    $or: [{ talker: user._id }, { listener: user._id }]
  });

  if (session) {
    return res.redirect(`/chat/room/${session._id}`);
  }

  res.render('dashboard', {
    user,
    messages: {
      error: req.flash('error'),
      success: req.flash('success')
    }
  });
});


router.get('/api/check-session', ensureAuth, async (req, res) => {
  const session = await Session.findOne({
    $or: [{ talker: req.user._id }, { listener: req.user._id }]
  });

  if (session) {
    return res.json({ sessionId: session._id });
  }

  res.json({ sessionId: null });
});

module.exports = router;
