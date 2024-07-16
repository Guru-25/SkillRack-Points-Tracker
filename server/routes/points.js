const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const User = require('../models/User');
const router = express.Router();
const request = require('request');
const nodemailer = require('nodemailer');
require('dotenv').config();

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
    const dept = $('div.ui.large.label').text().trim();
    // Locate the text containing the year information and extract the year
    const textNodes = $('div.ui.four.wide.center.aligned.column').contents().filter(function() {
      return this.nodeType === 3; // Node type 3 is a text node
    });

    let year;
    textNodes.each(function() {
      const text = $(this).text().trim();
      const match = text.match(/\(Second Year\)\s*(\d{4})/);
      if (match) {
          year = match[1];
          return false; // Break the loop
      }
    });
    const codeTutor = parseInt($('div:contains("DT")').next().find('.value').text().trim()) || 0;
    const codeTrack = parseInt($('div:contains("CODE TEST")').next().find('.value').text().trim()) || 0;
    const codeTest = parseInt($('div:contains("PROGRAMS SOLVED")').next().find('.value').text().trim()) || 0;
    const dt = parseInt($('div:contains("DC")').next().find('.value').text().trim()) || 0;
    const dc = parseInt($('div:contains("CODE TRACK")').next().find('.value').text().trim()) || 0;

    let requiredPoints = 5000;
    if (year == 2025) {
      requiredPoints = 3000;
    }
    console.log({ name, dept, year, codeTutor, codeTrack, codeTest, dt, dc, requiredPoints, url}); // Log the parsed values

    return { name, dept, year, codeTutor, codeTrack, codeTest, dt, dc, requiredPoints, url};
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

async function sendLogMessage(message) {
  const botToken = process.env.LOG_BOT_TOKEN;
  const chatId = process.env.LOG_CHAT_ID;
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    await axios.post(url, {
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown'
    });
  } catch (error) {
    console.error('Error sending Log message:', error);
  }
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function sendNewUserEmail(user, year, redirectedUrl) {
  try {
    let info = await transporter.sendMail({
      from: `"SkillRack Points Tracker" <${process.env.FROM_ADDRESS}>`,
      to: process.env.TO_ADDRESS,
      subject: "New User Registered",
      text: `Name: ${user.name} (${user.dept}'${year})\nURL: ${redirectedUrl}`,
      html: `
        <p><strong>Name:</strong> ${user.name} (${user.dept}'${year})</p>
        <p><strong>URL:</strong> <a href="${redirectedUrl}">${redirectedUrl}</a></p>
      `
    });
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

router.post('/', async (req, res) => {
  // clear cookie set by server
  if (req.cookies.lastUrl) {
    res.clearCookie('lastUrl');
  }

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
    
    const logMessage = `[${data.name} (${data.dept}'${data.year.slice(-2)})](${data.url})\n\n`;
    // Perform database operations before sending response
    let user = await User.findOne({ url: redirectedUrl });
    if (data.name !== '') {
      if (!user) {
        user = new User({ name: data.name, dept: data.dept, url: redirectedUrl });
        await user.save();
        console.log(`${data.name} is stored in DB`);
        await sendLogMessage(logMessage + "⭐️ #registered");
        await sendNewUserEmail(user, data.year.slice(-2), redirectedUrl);
      } else {
        await sendLogMessage(logMessage + "🔑 #loggedin");
      }
    }
    // Send the redirectedUrl back to the client
    res.json({ ...data, redirectedUrl });
    
  } catch (error) {
    console.error('Error in request processing:', error);
    res.status(500).json({ error: 'An error occurred while processing the request' });
  }
});

router.get('/refresh', async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: 'No URL provided' });
  }

  const data = await fetchDataWithRetry(url);
  if (data) {
    const logMessage = `[${data.name} (${data.dept}'${data.year.slice(-2)})](${data.url})\n\n`;
    await sendLogMessage(logMessage + "♻️ #refreshed");

    res.json(data);
  } else {
    res.status(500).json({ error: 'Failed to fetch data after retry' });
  }
});

module.exports = router;