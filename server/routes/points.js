const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const User = require('../models/User');
const router = express.Router();
const request = require('request');

async function fetchRedirectedUrl(url) {
  return new Promise((resolve, reject) => {
    request.get(url, function (err, res, body) {
      if (err) {
        reject(err);
      } else {
        resolve(this.uri.href);
      }
    });
  });
}

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
    console.error('Error fetching data:', error);
    return null;
  }
}

router.post('/', async (req, res) => {
  const { url } = req.body;
  const redirectedUrl = await fetchRedirectedUrl(url);
  if (redirectedUrl) {
    const data = await fetchData(redirectedUrl);

    if (data) {
      try {
        let user = await User.findOne({ url: redirectedUrl });
        if (!user) {
          user = new User({ name: data.name, url: redirectedUrl });
          await user.save();
        }

        const farFutureDate = new Date(new Date().setFullYear(new Date().getFullYear() + 10));
        res.cookie('lastUrl', redirectedUrl, { expires: farFutureDate, httpOnly: true });
        res.json(data);
      } catch (error) {
        console.error('Error saving user data:', error);
        res.status(500).json({ error: 'Failed to save user data' });
      }
    } else {
      res.status(500).json({ error: 'Failed to fetch data' });
    }
  } else {
    res.status(500).json({ error: 'Failed to fetch redirected URL' });
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