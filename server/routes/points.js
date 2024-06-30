const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const User = require('../models/User');
const router = express.Router();
const request = require('request');
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function sendNewUserEmail(user, redirectedUrl) {
  try {
    let info = await transporter.sendMail({
      from: `"SkillRack Points Calculator" <${process.env.FROM_ADDRESS}>`,
      to: process.env.TO_ADDRESS,
      subject: "New User Registered",
      text: `A new user has registered:\nName: ${user.name}\nURL: ${redirectedUrl}`,
      html: `
        <h2>New User Registered</h2>
        <p><strong>Name:</strong> ${user.name}</p>
        <p><strong>URL:</strong> <a href="${redirectedUrl}">${redirectedUrl}</a></p>
      `
    });
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

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

async function fetchDataWithRetry(url, retries = 1) {
  let data = await fetchData(url);
  if (!data && retries > 0) {
    console.log('Retrying fetch...');
    data = await fetchData(url);
  }
  return data;
}

router.post('/', async (req, res) => {
  const { url } = req.body;
  try {
    const redirectedUrl = await fetchRedirectedUrl(url);
    if (!redirectedUrl) {
      return res.status(500).json({ error: 'Failed to fetch redirected URL' });
    }

    const data = await fetchDataWithRetry(redirectedUrl);
    if (!data) {
      return res.status(500).json({ error: 'Failed to fetch data' });
    }

    // Set cookie and respond to the user immediately
    const farFutureDate = new Date(new Date().setFullYear(new Date().getFullYear() + 10));
    res.cookie('lastUrl', redirectedUrl, { expires: farFutureDate, httpOnly: true });
    res.json(data);

    // Run database and email operations in the background
    setImmediate(async () => {
      try {
        let user = await User.findOne({ url: redirectedUrl });
        if (!user && data.name != '') {
          user = new User({ name: data.name, url: redirectedUrl });
          await user.save();
          await sendNewUserEmail(user, redirectedUrl);
        }
      } catch (error) {
        console.error('Background operation error:', error);
      }
    });

  } catch (error) {
    console.error('Error in request processing:', error);
    res.status(500).json({ error: 'An error occurred while processing the request' });
  }
});

router.get('/refresh', async (req, res) => {
  const url = req.cookies.lastUrl;
  if (!url) {
    return res.status(400).json({ error: 'No URL found in cookies' });
  }

  const data = await fetchDataWithRetry(url);
  if (data) {
    res.json(data);
  } else {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

module.exports = router;