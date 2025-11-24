require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const mongoose = require('mongoose');
const path = require('path');

const authRoutes = require('./routes/auth');
const sorteadorRoutes = require('./routes/sorteador');

const app = express();

app.set('view engine','ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(express.static(path.join(__dirname,'public')));

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/projdwii';

// Mongo + start server after connected
mongoose.connect(MONGO_URI)
.then(() => {
  console.log('✅ MongoDB connected');
  // session store in Mongo so sessions persist
  app.use(session({
    secret: process.env.SESSION_SECRET || 'algumsegredo',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: MONGO_URI })
  }));
  // passport
  require('./config/passport')(passport);
  app.use(passport.initialize());
  app.use(passport.session());

  // routes
  app.use('/auth', authRoutes);
  app.use('/sorteador', sorteadorRoutes);

  app.get('/', (req, res) => {
    res.render('index', { user: req.user });
  });

  app.listen(PORT, ()=> {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });

})
.catch(err=>{
  console.error('❌ Could not connect to MongoDB. Error:', err.message);
  console.error('Start MongoDB and try again, or set MONGO_URI to a valid MongoDB (e.g., MongoDB Atlas).');
  process.exit(1);
});
