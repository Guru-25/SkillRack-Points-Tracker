const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const User = require('../models/User');
const router = express.Router();
const request = require('request');
require('dotenv').config();

// Fetch redirected URL
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

// Fetch data from SkillRack profile
async function fetchData(url) {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // Extract data from the page
    const rawText = $('div.ui.four.wide.center.aligned.column').text().trim().split('\n');
    const name = rawText[0].trim();
    const dept = rawText[4].trim();
    const year = rawText[8].trim().match(/\d{4}$/)[0];
    const collegeName = rawText[6].trim();
    const codeTutor = parseInt($('div:contains("DT")').next().find('.value').text().trim()) || 0;
    const codeTrack = parseInt($('div:contains("CODE TEST")').next().find('.value').text().trim()) || 0;
    const codeTest = parseInt($('div:contains("PROGRAMS SOLVED")').next().find('.value').text().trim()) || 0;
    const dt = parseInt($('div:contains("DC")').next().find('.value').text().trim()) || 0;
    const dc = parseInt($('div:contains("CODE TRACK")').next().find('.value').text().trim()) || 0;
    const gold = parseInt($('div:contains("LEVEL")').next().find('.value').text().trim()) || 0;
    const silver = parseInt($('div:contains("GOLD")').next().find('.value').text().trim()) || 0;
    const bronze = parseInt($('div:contains("SILVER")').next().find('.value').text().trim()) || 0;

    // Calculate points and percentage
    const points = codeTrack * 2 + codeTest * 30 + dt * 20 + dc * 2;
    let requiredPoints = 0;

    const collegeCriteria = {
      "Thiagarajar College of Engineering (TCE), Madurai": (year, dept) => {
        return (year === "2025" || dept !== "CSE") ? 3000 : 5000;
      },
      "K.L.N College of Engineering, Madurai": (year) => {
        return (year === "2025" || year === "2026") ? 1500 : 0;
      }
    };

    if (collegeCriteria[collegeName]) {
      requiredPoints = collegeCriteria[collegeName](year, dept);
    }

    const percentageCalculate = points / requiredPoints * 100;
    const percentage = !isFinite(percentageCalculate) ? 100 : percentageCalculate;

    // Format last fetched date
    const date = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true });
    const lastFetched = date.split(',')[1].trim();

    const medals = gold + silver + bronze;

    console.log({ name, dept, year, collegeName, codeTutor, codeTrack, codeTest, dt, dc, medals, points, requiredPoints, percentage, lastFetched, url}); // Log the parsed values

    return { name, dept, year, collegeName, codeTutor, codeTrack, codeTest, dt, dc, medals, points, requiredPoints, percentage, lastFetched, url};
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
}

// Retry fetching data if it fails initially
async function fetchDataWithRetry(url, retries = 1) {
  let data = await fetchData(url);
  if (!data && retries > 0) {
    console.log('Retrying fetch...');
    data = await fetchData(url);
  }
  return data;
}

const IS_RECORD_ENABLED = process.env.IS_RECORD_ENABLED === 'true';

// Send log message to Telegram bot
async function sendLogMessage(message, topic) {
  const botToken = process.env.BOT_TOKEN;
  const chatId = process.env.CHAT_ID;
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    await axios.post(url, {
      chat_id: chatId,
      message_thread_id: topic,
      text: message,
      parse_mode: 'Markdown'
    });
  } catch (error) {
    console.error('Error sending Log message:', error);
  }
}

// Handle POST request for tracking points
router.post('/', async (req, res) => {
  // Clear cookie set by server
  if (req.cookies.lastUrl) {
    res.clearCookie('lastUrl');
  }

  let { url } = req.body;
  try {
    if (!url.includes('resume')) {
      url = await fetchRedirectedUrl(url);
      console.log("fetched");
      if (!url) {
        return res.status(500).json({ error: 'Failed to fetch redirected URL' });
      }
    }
    
    const data = await fetchDataWithRetry(url);
    if (!data) {
      return res.status(500).json({ error: 'Failed to fetch data' });
    }

    if (IS_RECORD_ENABLED) {
      // Extract the resume id from the URL
      const urlParams = new URLSearchParams(new URL(url).search);
      const resumeId = urlParams.get('id');

      // Perform database operations before sending response
      let user = await User.findOne({ id: resumeId });
      const logMessage = `\`${data.name} (${data.dept}'${data.year.slice(-2)})\`\n\n\`(${data.codeTutor} x 0) + (${data.codeTrack} x 2) + (${data.codeTest} x 30) + (${data.dt} x 20) + (${data.dc} x 2) = ${data.points} (${parseFloat(data.percentage.toFixed(2))}%)\`\n\n`;
      if (data.name !== '') {
        if (!user) {
          user = new User({ id: resumeId, name: data.name, dept: data.dept, url: url });
          await user.save();
          console.log(`${data.name} is stored in DB`);
          await sendLogMessage(logMessage + `[Profile](${data.url})`, process.env.TOPIC1_ID); // Registered
        } else {
          await sendLogMessage(logMessage, process.env.TOPIC2_ID); // Logged in
        }
      }
    }

    res.json(data);
  } catch (error) {
    console.error('Error in request processing:', error);
    res.status(500).json({ error: 'An error occurred while processing the request' });
  }
});

// Handle GET request for refreshing data
router.get('/refresh', async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: 'No URL provided' });
  }

  const data = await fetchDataWithRetry(url);
  if (data) {
    const logMessage = `\`${data.name} (${data.dept}'${data.year.slice(-2)})\`\n\n\`(${data.codeTutor} x 0) + (${data.codeTrack} x 2) + (${data.codeTest} x 30) + (${data.dt} x 20) + (${data.dc} x 2) = ${data.points} (${parseFloat(data.percentage.toFixed(2))}%)\`\n\n`;
    if (IS_RECORD_ENABLED) {
      await sendLogMessage(logMessage, process.env.TOPIC3_ID); // Refreshed
    }
    res.json(data);
  } else {
    res.status(500).json({ error: 'Failed to fetch data after retry' });
  }
});

module.exports = router;