// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { useParams } from 'react-router-dom'; // Import useParams
// import './Certificate.css';

// const Certificate = () => {
//   const { id } = useParams(); // Use useParams to get the 'id' parameter
//   const [certificate, setCertificate] = useState(null);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     const fetchCertificate = async () => {
//       try {
//         const { data } = await axios.get(`/api/certificate/${id}`);
//         setCertificate(data);
//       } catch (error) {
//         setError('Certificate not found.');
//       }
//     };
//     fetchCertificate();
//   }, [id]);

//   if (error) {
//     return <div className="certificate-container">{error}</div>;
//   }

//   if (!certificate) {
//     return <div className="certificate-container">Loading...</div>;
//   }

//   return (
//     <div className="certificate-container">
//       <h1>{certificate.message}</h1>
//       <p>This certifies that</p>
//       <h2>{certificate.name}</h2>
//       <p>has achieved</p>
//       <h3>{certificate.points} Points</h3>
//       <p>on {new Date(certificate.achievementDate).toLocaleDateString()}</p>
//     </div>
//   );
// };

// export default Certificate;