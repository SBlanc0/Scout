const express = require('express');
const cors = require('cors');
const path = require('path');
const { query } = require('./postgres');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

app.get('/api/health', async (_req, res) => {
  try {
    await query('select 1 as ok');
    res.json({ ok: true, database: 'connected' });
  } catch (error) {
    res.status(503).json({ ok: false, database: 'unavailable', message: error.message });
  }
});

app.get('/api/teams', async (_req, res) => {
  const result = await query('select * from teams order by elo desc, name asc');
  res.json(result.rows);
});

app.get('/api/teams/:id', async (req, res) => {
  const result = await query('select * from teams where id = $1', [req.params.id]);
  if (!result.rows.length) return res.status(404).json({ message: 'Team not found' });
  res.json(result.rows[0]);
});

app.get('/api/matches', async (_req, res) => {
  const result = await query(`
    select
      m.*,
      home.name as home_name,
      away.name as away_name
    from matches m
    join teams home on home.id = m.home_team_id
    join teams away on away.id = m.away_team_id
    order by m.match_date asc
  `);
  res.json(result.rows);
});

app.post('/api/predictions', async (req, res) => {
  const {
    matchId,
    probHome,
    probDraw,
    probAway,
    probBtts,
    probOver25,
  } = req.body;

  const result = await query(`
    insert into predictions (
      match_id,
      prob_home,
      prob_draw,
      prob_away,
      prob_btts,
      prob_over25
    )
    values ($1, $2, $3, $4, $5, $6)
    returning *
  `, [matchId, probHome, probDraw, probAway, probBtts, probOver25]);

  res.status(201).json(result.rows[0]);
});

app.listen(port, () => {
  console.log(`Scout Predictor WC 2026 running on http://localhost:${port}`);
});
