const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');

// real Google auth (only works if GOOGLE_CLIENT_ID/SECRET set)
router.get('/google', passport.authenticate('google', { scope: ['profile','email'] }));
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/fail' }),
  (req, res) => res.redirect('/')); // success

router.get('/fail', (req, res) => res.send('Falha na autenticação'));

// mock login for testing when Google credentials are not available
router.get('/mock', (req,res)=>{
  res.render('login', { message: null });
});
router.post('/mock', async (req,res)=>{
  const { email, name } = req.body;
  if(!email && !name) return res.render('login', { message: 'Informe nome ou e-mail' });
  // create or find
  let user = await User.findOne({ email });
  if(!user){
    user = await User.create({ email, name });
  }
  req.login(user, err=>{
    if(err) return res.render('login', { message: 'Erro ao logar' });
    return res.redirect('/');
  });
});

// logout
router.get('/logout',(req,res)=>{
  req.logout(function(err){
    if(err) console.error(err);
    res.redirect('/');
  });
});

module.exports = router;
