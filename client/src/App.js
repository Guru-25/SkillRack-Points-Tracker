import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import Cookies from 'js-cookie';
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { HelmetProvider, Helmet } from 'react-helmet-async';
import Summary from './Summary';
import Schedule from './Schedule';
import ScheduleDTDC from './ScheduleDTDC';
import './App.css';

// Custom Modal Component
const Modal = ({ show, onClose, onConfirm, message }) => {
  if (!show) return null;
  return (
    <div className="modal">
      <div className="modal-content">
        <p>{message}</p>
        <button onClick={onConfirm} className="modal-button">Ok</button>
        <button onClick={onClose} className="modal-button">Cancel</button>
      </div>
    </div>
  );
};

const App = () => {
  const [url, setUrl] = useState('');
  const [points, setPoints] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [error, setError] = useState('');
  const [isValidUrl, setIsValidUrl] = useState(false);
  const [lastFetched, setLastFetched] = useState(null);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [codeTutor, setCodeTutor] = useState(0);
  const [codeTrack, setCodeTrack] = useState(0);
  const [codeTest, setCodeTest] = useState(0);
  const [dt, setDt] = useState(0);
  const [dc, setDc] = useState(0);
  const [requiredPoints, setRequiredPoints] = useState(5000); // Default value
  const [showSchedule, setShowSchedule] = useState(false);
  const [showScheduleDTDC, setShowScheduleDTDC] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false); // State for logout modal

  const handleLogout = () => {
    setShowLogoutModal(true); // Show the modal
  };

  const confirmLogout = () => {
    setUrl('');
    setPoints(0);
    setPercentage(0);
    setError('');
    setIsValidUrl(false);
    setLastFetched(null);
    setName('');
    setCodeTutor(0);
    setCodeTrack(0);
    setCodeTest(0);
    setDt(0);
    setDc(0);
    setRequiredPoints(5000); // Reset to default value
    setShowSchedule(false);
    setShowScheduleDTDC(false);
    Cookies.remove('lastUrl');
    setShowLogoutModal(false); // Close the modal after logging out
  };

  const calculatePoints = (data) => {
    const totalPoints = data.codeTrack * 2 + data.codeTest * 30 + data.dt * 20 + data.dc * 2;
    setPoints(totalPoints);
    setPercentage((totalPoints / data.requiredPoints) * 100);
    setLastFetched(new Date().toLocaleString('en-GB', { timeZone: 'Asia/Kolkata', hour12: true }));
    setCodeTutor(data.codeTutor);
    setCodeTrack(data.codeTrack);
    setCodeTest(data.codeTest);
    setDt(data.dt);
    setDc(data.dc);
    setRequiredPoints(data.requiredPoints);
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      const lastUrl = Cookies.get('lastUrl');
      
      if (lastUrl) {
        setLoading(true);
        try {
          const { data } = await axios.get(`/api/points/refresh?url=${encodeURIComponent(lastUrl)}`);
          if (data && data.name !== '') {
            calculatePoints(data);
            setIsValidUrl(true);
            setUrl(lastUrl);
            setName(data.name);
          }
        } catch (error) {
          console.error(error);
          // If there's an error, clear the cookie
          Cookies.remove('lastUrl');
        }
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const isValidSkillRackUrl = (url) => {
    const regex = /^https?:\/\/www\.skillrack\.com/;
    return regex.test(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isValidSkillRackUrl(url)) {
      setError('Invalid URL. Please enter a valid SkillRack Profile URL!!');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post('/api/points', { url });
      if (data && data.name !== '') {
        calculatePoints(data);
        setIsValidUrl(true);
        Cookies.set('lastUrl', data.redirectedUrl, { 
          expires: 365, // Set to expire in 1 year
          sameSite: 'Lax',
          secure: true // Use this if your site is served over HTTPS
        });
        setName(data.name);
      } else {
        setError('Invalid URL. Please enter a valid SkillRack Profile URL!!');
      }
    } catch (error) {
      setError('Invalid URL. Please enter a valid SkillRack Profile URL!!');
      console.error(error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Helmet>
          <title>Loading... | SkillRack Points Tracker and Calculator</title>
          <meta name="description" content="Loading data for SkillRack Points Tracker and Calculator." />
        </Helmet>
        <h1>Loading...</h1>
      </div>
    );
  }

  const handleGenerateSchedule = () => {
    setShowSchedule(true);
  };

  const handleGenerateScheduleDTDC = () => {
    setShowScheduleDTDC(true);
  };

  return (
    <HelmetProvider>
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Helmet>
          <title>SkillRack Points Tracker and Calculator</title>
          <meta name="description" content="Track and calculate your SkillRack points effortlessly using this powerful tool." />
          <link rel="canonical" href="http://skillrack.gururaja.in" />
          <script type="application/ld+json">
            {`
              {
                "@context": "http://schema.org",
                "@type": "WebSite",
                "name": "SkillRack Points Tracker and Calculator",
                "url": "http://skillrack.gururaja.in",
                "description": "A tool to track and calculate SkillRack points using React, Express, Node.js, and more.",
                "author": {
                  "@type": "Person",
                  "name": "Guru"
                }
              }
            `}
          </script>
        </Helmet>
        <h1>SkillRack Points Tracker</h1>
        <Analytics/>
        <SpeedInsights/>
        {!isValidUrl && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <p>Login to <a href="https://www.skillrack.com/faces/candidate/manageprofile.xhtml" target="_blank" rel="noopener noreferrer"><b>SkillRack</b></a> -&gt; Profile -&gt; Enter Password -&gt; Click "View" -&gt; Copy the URL</p>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste Profile URL"
              name="profile_url"
              style={{ width: '100%', maxWidth: '300px', padding: '10px', boxSizing: 'border-box' }}
            />
            <button type="submit" className="submit-button">Submit</button>
          </form>
        )}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {isValidUrl && (
          <>
            <p>Updated on {lastFetched}</p>
            <br />
            <h2>Hi.. {name} 😊</h2>
            <div style={{ width: '200px', margin: '50px auto' }}>
              <CircularProgressbar
                value={percentage}
                text={points <= requiredPoints ? `${points}/${requiredPoints}` : `${points}`}
                styles={buildStyles({
                  textColor: '#000',
                  pathColor: '#4caf50',
                  trailColor: '#d6d6d6',
                  textSize: '16px'
                })}
              />
            </div>

            {points >= requiredPoints && (
              <>
                <h3>Congratulations 🎉 {name} on completing {requiredPoints} points!</h3>
                <br />
              </>
            )}
            <Summary codeTutor={codeTutor} codeTrack={codeTrack} codeTest={codeTest} dt={dt} dc={dc} totalPoints={points} />
            
            {((codeTutor + codeTrack) >= 600 && points < requiredPoints) &&  (
              <>
                <button onClick={handleGenerateSchedule} className="generate-schedule-button">✨ Plan with AI ✨</button><br /><br />
                {showSchedule && (
                  <Schedule
                    initialValues={{
                      codeTrack: codeTrack,
                      dt: dt,
                      dc: dc,
                      points: points,
                      requiredPoints: requiredPoints
                    }}
                  />
                )}
              </>
            )}
            {(codeTutor + codeTrack) < 600 && (
              <>
                <button onClick={handleGenerateScheduleDTDC} className="generate-schedule-button">✨ Plan with AI ✨</button><br /><br />
                {showScheduleDTDC && (
                  <ScheduleDTDC
                    initialValues={{
                      codeTrack: codeTrack,
                      problems: codeTrack + codeTutor
                    }}
                  />
                )}
              </>
            )}

            <br /><br />
            <button onClick={handleLogout} className="logout-button">Logout</button><br /><br />
          </>
        )}
        <footer style={{ marginTop: '50px' }}>
          <br /><br />
          Built with MERN stack by <a href="https://github.com/Guru-25" target="_blank" rel="noopener noreferrer"><b>Guru</b></a>
          <br /><br />
          Give a ⭐️ on <a href="https://github.com/Guru-25/skillrack-points-tracker" target="_blank" rel="noopener noreferrer"><b>GitHub</b></a>
        </footer>
        <Modal
          show={showLogoutModal}
          onClose={() => setShowLogoutModal(false)}
          onConfirm={confirmLogout}
          message="Are you sure you want to logout? Refreshing the site will reload the data. Press 'Ok' to Logout."
        />
      </div>
    </HelmetProvider>
  );
};

export default App;
