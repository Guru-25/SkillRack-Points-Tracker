const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const User = require('../models/User');
const router = express.Router();

async function fetchData(url) {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const rawName = $('div.ui.big.label.black').text().trim();
    const name = rawName.split('\n')[0].trim(); // Split by newline and take the first part
    const codeTest = parseInt($('div:contains("PROGRAMS SOLVED")').next().find('.value').text().trim()) || 0;
    const codeTrack = parseInt($('div:contains("CODE TEST")').next().find('.value').text().trim()) || 0;
    const dt = parseInt($('div:contains("DC")').next().find('.value').text().trim()) || 0;
    const dc = parseInt($('div:contains("CODE TRACK")').next().find('.value').text().trim()) || 0;

    console.log({ name, codeTest, codeTrack, dc, dt }); // Log the parsed values

    return { name, codeTest, codeTrack, dc, dt };
  } catch (error) {
    console.error(error);
    return null;
  }
}

router.post('/', async (req, res) => {
  const { url } = req.body;
  const data = await fetchData(url);

  if (data) {
    try {
        let user = await User.findOne({ url });
        if (!user) {
          user = new User({ name: data.name, url });
          await user.save();
        }

    res.cookie('lastUrl', url, { maxAge: 900000, httpOnly: true });
    res.json(data);
} catch (error) {
    console.error('Error saving user data:', error);
    res.status(500).json({ error: 'Failed to save user data' });
  }
  } else {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

router.get('/refresh', async (req, res) => {
  const url = req.cookies.lastUrl;
  if (!url) {
    return res.status(400).json({ error: 'No URL found in cookies' });
  }

  const data = await fetchData(url);
  if (data) {
    res.json(data);
  } else {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

module.exports = router;