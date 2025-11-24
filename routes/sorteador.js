const express = require('express');
const router = express.Router();
const Participant = require('../models/Participant');

// helper to always include message default
function renderWithDefaults(res, view, data = {}) {
  if (typeof data.message === 'undefined') data.message = null;
  return res.render(view, data);
}

// show simple UI
router.get('/', async (req,res)=>{
  const list = await Participant.find().lean();
  renderWithDefaults(res, 'sorteador', { user: req.user, participants: list, winner: null });
});

// add participant
router.post('/add', async (req,res)=>{
  const { name } = req.body;
  if(!name) return res.redirect('/sorteador');
  await Participant.create({ name });
  res.redirect('/sorteador');
});

// clear all
router.post('/clear', async (req,res)=>{
  await Participant.deleteMany({});
  res.redirect('/sorteador');
});

// draw one random participant
router.post('/draw', async (req,res)=>{
  const count = await Participant.countDocuments();
  if(count === 0) return renderWithDefaults(res, 'sorteador', { user: req.user, participants: [], winner: null, message: 'Não há participantes' });
  const rand = Math.floor(Math.random() * count);
  const winner = await Participant.findOne().skip(rand).lean();
  const list = await Participant.find().lean();
  renderWithDefaults(res, 'sorteador', { user: req.user, participants: list, winner });
});

module.exports = router;
