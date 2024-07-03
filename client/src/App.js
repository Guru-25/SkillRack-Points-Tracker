import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import Cookies from 'js-cookie';
import Summary from './Summary'; // Import the Summary component
import './App.css'; // Import the CSS file

const App = () => {
  const [url, setUrl] = useState('');
  const [points, setPoints] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [error, setError] = useState('');
  const [isValidUrl, setIsValidUrl] = useState(false);
  const [lastFetched, setLastFetched] = useState(null);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [codeTest, setCodeTest] = useState(0);
  const [codeTrack, setCodeTrack] = useState(0);
  const [dt, setDt] = useState(0);
  const [dc, setDc] = useState(0);

  const handleLogout = () => {
    setUrl('');
    setPoints(0);
    setPercentage(0);
    setError('');
    setIsValidUrl(false);
    setLastFetched(null);
    setName('');
    setCodeTest(0);
    setCodeTrack(0);
    setDt(0);
    setDc(0);
    Cookies.remove('lastUrl');
  };
  

  useEffect(() => {
    const fetchInitialData = async () => {
      const lastUrl = Cookies.get('lastUrl');
      console.log('Initial lastUrl cookie:', lastUrl);
      setLoading(true);
      try {
        const { data } = await axios.get('/api/points/refresh');
        if (data && data.name !== '') {
          calculatePoints(data);
          setIsValidUrl(true);
          setUrl(Cookies.get('lastUrl') || '');
          setName(data.name);
        }
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    };

    fetchInitialData();
  }, []);

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
        Cookies.set('lastUrl', url, { 
          expires: 7, 
          sameSite: 'Lax',
          secure: true 
        });
        console.log('Cookie set:', Cookies.get('lastUrl'));
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

  const calculatePoints = (data) => {
    const totalPoints = data.codeTest * 30 + data.codeTrack * 2 + data.dt * 20 + data.dc * 2;
    setPoints(totalPoints);
    setPercentage((totalPoints / 5000) * 100);
    setLastFetched(new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
    setCodeTest(data.codeTest);
    setCodeTrack(data.codeTrack);
    setDt(data.dt);
    setDc(data.dc);
  };

  const isValidSkillRackUrl = (url) => {
    const regex = /^https?:\/\/www\.skillrack\.com/;
    return regex.test(url);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>SkillRack Points Tracker</h1>
      {!isValidUrl && (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <p>Login to <a href="https://www.skillrack.com/faces/candidate/manageprofile.xhtml" target="_blank" rel="noopener noreferrer"><b>SkillRack</b></a> -&gt; Profile -&gt; Enter Password -&gt; Click "View" -&gt; Copy the URL</p>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste Profile URL"
            style={{ width: '100%', maxWidth: '300px', padding: '10px', boxSizing: 'border-box' }}
          />
          <button type="submit" className="submit-button">Submit</button>
        </form>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {isValidUrl && (
        <>
          <p>Last fetched: {lastFetched}</p>
          <br />
          <h2>Hi.. {name} 😊</h2>
          <div style={{ width: '200px', margin: '50px auto' }}>
            <CircularProgressbar
              value={percentage}
              text={`${points}/5000`}
              styles={buildStyles({
                textColor: '#000',
                pathColor: '#4caf50',
                trailColor: '#d6d6d6',
                textSize: '16px'
              })}
            />
          </div>
          <Summary codeTest={codeTest} codeTrack={codeTrack} dt={dt} dc={dc} totalPoints={points} />
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </>
      )}
      <footer style={{ marginTop: '50px' }}>
        <br /><br />
        Made with GPT-4 & Claude 3.5 Sonnet by <a href="https://github.com/Guru-25" target="_blank" rel="noopener noreferrer"><b>Guru</b></a>
        <br /><br />
        Give a ⭐️ on <a href="https://github.com/Guru-25/skillrack-points-tracker" target="_blank" rel="noopener noreferrer"><b>GitHub</b></a>
      </footer>
    </div>
  );
};

export default App;