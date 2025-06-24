const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const path = require('path');
const engine = require('ejs-mate');
const http = require('http');
const socketio = require('socket.io');

// Load environment variables
dotenv.config();

// Express and HTTP server
const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set up ejs-mate for layout support
app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static and form middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log(' MongoDB connected'))
  .catch((err) => console.error(' MongoDB connection error:', err));

// Passport config
require('./config/passport')(passport);

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

// Flash messages
app.use(flash());

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/chat', require('./routes/chat'));

// Socket.io chat logic
io.on('connection', (socket) => {
  console.log(' New user connected');

  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`Socket joined room: ${roomId}`);
  });

  socket.on('chatMessage', ({ roomId, sender, message }) => {
    io.to(roomId).emit('chatMessage', { sender, message });
  });

  socket.on('disconnect', () => {
    console.log(' User disconnected');
  });
});

// Attach io to app if needed in routes
app.set('io', io);

// Start the server
server.listen(process.env.PORT, () => {
  console.log(` Server running at http://localhost:${process.env.PORT}`);
});
