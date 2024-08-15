import React, { useState, useEffect, useCallback } from 'react';
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
      <div className="modal-content fade-in">
        <p>{message}</p>
        <button onClick={onConfirm} className="modal-button">Yes</button>
        <button onClick={onClose} className="modal-button">No</button>
      </div>
    </div>
  );
};

const App = () => {
  const initialState = {
    url: '',
    points: 0,
    percentage: 0,
    error: '',
    isValidUrl: false,
    lastFetched: null,
    loading: false,
    name: '',
    codeTutor: 0,
    codeTrack: 0,
    codeTest: 0,
    dt: 0,
    dc: 0,
    medals: 0,
    requiredPoints: 0,
    showSchedule: false,
    showScheduleDTDC: false,
    showLogoutModal: false
  };

  const [state, setState] = useState(initialState);

  const handleStateChange = useCallback((newState) => {
    setState((prevState) => ({ ...prevState, ...newState }));
  }, []);

  const fetchData = useCallback((data) => {
    handleStateChange({
      name: data.name,
      points: data.points,
      percentage: data.percentage,
      lastFetched: data.lastFetched,
      codeTutor: data.codeTutor,
      codeTrack: data.codeTrack,
      codeTest: data.codeTest,
      dt: data.dt,
      dc: data.dc,
      medals: data.medals,
      requiredPoints: data.requiredPoints
    });
  }, [handleStateChange]);

  useEffect(() => {
    const fetchInitialData = async () => {
      const lastUrl = Cookies.get('lastUrl');

      if (lastUrl) {
        handleStateChange({ loading: true });
        try {
          const { data } = await axios.get(`/api/points/refresh?url=${encodeURIComponent(lastUrl)}`);
          if (data && data.name !== '') {
            fetchData(data);
            handleStateChange({ isValidUrl: true, url: lastUrl });
          }
        } catch (error) {
          console.error(error);
          // If there's an error, clear the cookie
          Cookies.remove('lastUrl');
        }
        handleStateChange({ loading: false });
      }
    };

    fetchInitialData();
  }, [fetchData, handleStateChange]);

  const isValidSkillRackUrl = (url) => {
    const regex = /^https?:\/\/www\.skillrack\.com/;
    return regex.test(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    handleStateChange({ error: '' });

    if (!isValidSkillRackUrl(state.url)) {
      handleStateChange({ error: 'Please enter a valid SkillRack Profile URL!!' });
      return;
    }

    handleStateChange({ loading: true });
    try {
      const { data } = await axios.post('/api/points', { url: state.url });
      if (data && data.name !== '') {
        fetchData(data);
        handleStateChange({ isValidUrl: true });
        Cookies.set('lastUrl', data.redirectedUrl, {
          expires: 365, // Set to expire in 1 year
          sameSite: 'Lax',
          secure: true // Use this if your site is served over HTTPS
        });
      } else {
        handleStateChange({ error: 'Please enter a valid SkillRack Profile URL!!' });
      }
    } catch (error) {
      handleStateChange({ error: 'Invalid URL. Please enter a valid SkillRack Profile URL!!' });
      console.error(error);
    }
    handleStateChange({ loading: false });
  };

  const handleLogout = () => {
    handleStateChange({ showLogoutModal: true });
  };

  const confirmLogout = () => {
    setState(initialState);
    Cookies.remove('lastUrl');
  };

  const handleGenerateSchedule = () => {
    handleStateChange({ showSchedule: true });
  };

  const handleGenerateScheduleDTDC = () => {
    handleStateChange({ showScheduleDTDC: true });
  };

  if (state.loading) {
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
        {!state.isValidUrl && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <p>Login to <a href="https://www.skillrack.com/faces/candidate/manageprofile.xhtml" target="_blank" rel="noopener noreferrer"><b>SkillRack</b></a> -&gt; Profile -&gt; Enter Password -&gt; Click "View" -&gt; Copy the URL</p>
            <input
              type="text"
              value={state.url}
              onChange={(e) => handleStateChange({ url: e.target.value })}
              placeholder="Paste Profile URL"
              name="profile_url"
              style={{ width: '100%', maxWidth: '300px', padding: '10px', boxSizing: 'border-box' }}
            />
            <button type="submit" className="submit-button">Submit</button>
          </form>
        )}
        {state.error && <p style={{ color: 'red' }}>{state.error}</p>}
        {state.isValidUrl && (
          <>
            <p>Updated on {state.lastFetched}</p>
            <br />
            <h2>Hi.. {state.name} 😊</h2>
            <div style={{ width: '200px', margin: '50px auto' }}>
              <CircularProgressbar
                value={state.percentage}
                text={(state.points <= state.requiredPoints) && (state.points !== 0) ? `${state.points}/${state.requiredPoints}` : `${state.points}`}
                styles={buildStyles({
                  textColor: '#000',
                  pathColor: '#4caf50',
                  trailColor: '#d6d6d6',
                  textSize: '16px'
                })}
              />
            </div>

            {state.points >= state.requiredPoints && state.requiredPoints !== 0 && (
              <>
                <h3>Congratulations 🎉 {state.name} on completing {state.requiredPoints} points!</h3>
                <br />
              </>
            )}
            <Summary
              codeTutor={state.codeTutor}
              codeTrack={state.codeTrack}
              codeTest={state.codeTest}
              dt={state.dt}
              dc={state.dc}
              medals={state.medals}
              totalPoints={state.points}
              percentage={state.percentage}
            />
            <br />
            
            {((state.codeTutor + state.codeTrack) >= 600 && state.points < state.requiredPoints) && (
              <>
                <button onClick={handleGenerateSchedule} className="generate-schedule-button">✨ Plan with AI ✨</button><br /><br /><br />
                {state.showSchedule && (
                  <div className="fade-in">
                    <Schedule
                      initialValues={{
                        codeTrack: state.codeTrack,
                        dt: state.dt,
                        dc: state.dc,
                        points: state.points,
                        requiredPoints: state.requiredPoints
                      }}
                    />
                  </div>
                )}
              </>
            )}
            {(state.codeTutor + state.codeTrack) < 600 && (
              <>
                <button onClick={handleGenerateScheduleDTDC} className="generate-schedule-button">✨ Plan with AI ✨</button><br /><br />
                {state.showScheduleDTDC && (
                  <div className="fade-in">
                    <ScheduleDTDC
                      initialValues={{
                        codeTrack: state.codeTrack,
                        problems: state.codeTrack + state.codeTutor
                      }}
                    />
                  </div>
                )}
              </>
            )}

            <br /><br />
            <button onClick={handleLogout} className="logout-button">Logout</button><br /><br />
          </>
        )}
        <footer style={{ marginTop: '50px' }}>
          <br /><br />
          {state.isValidUrl && (
            <>
              <aside>
                <details>
                  <summary>Is the required points incorrect?</summary>
                  <p>If required points ({state.requiredPoints}) is incorrect, please <a href="mailto:mail@gururaja.in">email us</a>.</p>
                </details>
              </aside>
              <br /><br />
            </>
          )}
          Powered by <a href="https://github.com/Guru-25/skillrack-points-tracker" target="_blank" rel="noopener noreferrer"><b>Express.js</b></a> ❤️
        </footer>
        <Modal
          show={state.showLogoutModal}
          onClose={() => handleStateChange({ showLogoutModal: false })}
          onConfirm={confirmLogout}
          message="Are you sure you want to Logout?"
        />
      </div>
    </HelmetProvider>
  );
};

export default App;
