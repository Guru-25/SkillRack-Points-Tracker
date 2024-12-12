// const express = require('express');
// const Certificate = require('../models/Certificate');
// const router = express.Router();
// const { v4: uuidv4 } = require('uuid');

// // Generate a certificate
// router.post('/generate', async (req, res) => {
//   const { userId, name, points, message } = req.body;

//   const uniqueId = uuidv4();
//   const certificate = new Certificate({
//     uniqueId,
//     userId,
//     name,
//     points,
//     message: message || 'Certified SkillRack Points Achiever'
//   });

//   try {
//     await certificate.save();
//     const url = `${process.env.BASE_URL}/certificate/${uniqueId}`;
//     res.json({ url });
//   } catch (error) {
//     console.error('Error generating certificate:', error);
//     res.status(500).json({ error: 'Failed to generate certificate' });
//   }
// });

// // Get certificate details
// router.get('/:id', async (req, res) => {
//   const { id } = req.params;
//   try {
//     const certificate = await Certificate.findOne({ uniqueId: id });
//     if (!certificate) {
//       return res.status(404).json({ error: 'Certificate not found' });
//     }

//     // Increment view count
//     certificate.viewCount += 1;
//     await certificate.save();

//     res.json(certificate);
//   } catch (error) {
//     console.error('Error fetching certificate:', error);
//     res.status(500).json({ error: 'Failed to fetch certificate' });
//   }
// });

// router.get('/:certificateId', async (req, res) => {
//   const { certificateId } = req.params;
//   const certificate = await Certificate.findOne({ certificateId });

//   if (!certificate) {
//     return res.status(404).send('Certificate not found');
//   }

//   res.send(`
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <title>SkillRack Certificate</title>
//       <style>
//         body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
//         .certificate { border: 2px solid #000; padding: 20px; display: inline-block; }
//         h1 { margin-bottom: 20px; }
//       </style>
//     </head>
//     <body>
//       <div class="certificate">
//         <h1>SkillRack Certificate</h1>
//         <p><strong>Name:</strong> ${certificate.name}</p>
//         <p><strong>Department:</strong> ${certificate.dept}</p>
//         <p><strong>Year:</strong> ${certificate.year}</p>
//         <p><strong>Points:</strong> ${certificate.points}</p>
//         <p><strong>Date Issued:</strong> ${certificate.dateIssued.toLocaleDateString()}</p>
//       </div>
//     </body>
//     </html>
//   `);
// });

// module.exports = router;