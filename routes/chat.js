const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Session = require('../models/Session');


function ensureAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/auth/login');
}


router.post('/request', ensureAuth, async (req, res) => {
  const user = req.user;
  if (user.role !== 'Talker') {
    req.flash('error', 'Only Talkers can request a chat');
    return res.redirect('/dashboard');
  }

  
  const activeSessions = await Session.find({}, 'listener');
  const activeListenerIds = activeSessions.map(s => s.listener.toString());

  
  const listener = await User.findOne({
    role: 'Listener',
    _id: { $nin: activeListenerIds }
  });

  if (!listener) {
    req.flash('error', 'No Listeners available right now.');
    return res.redirect('/dashboard');
  }

  
  const session = await Session.create({
    talker: user._id,
    listener: listener._id
  });

  res.redirect(`/chat/room/${session._id}`);
});


router.get('/room/:id', ensureAuth, async (req, res) => {
  const session = await Session.findById(req.params.id).populate('talker listener');
  if (!session) return res.status(404).send('Session not found');

  res.render('chatroom', {
    session,
    user: req.user
  });
});

module.exports = router;
