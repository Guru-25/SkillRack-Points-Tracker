import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { MdDarkMode, MdLightMode } from "react-icons/md";
import { IoMdArrowRoundForward } from "react-icons/io";
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
    name: '',
    codeTutor: 0,
    codeTrack: 0,
    codeTest: 0,
    dt: 0,
    dc: 0,
    requiredPoints: 0,
    showSchedule: false,
    showScheduleDTDC: false,
    loading: false,
    showLogoutModal: false
  };

  // const [isStandalone, setIsStandalone] = useState(false);
  // const [isMobile, setIsMobile] = useState(false);

  const [state, setState] = useState(initialState);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState(() => {
    const savedTheme = Cookies.get('theme');
    if (savedTheme) return savedTheme;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const [isVisible, setIsVisible] = useState(true);
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
      requiredPoints: data.requiredPoints
    });
  }, [handleStateChange]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    // Save theme to cookie
    Cookies.set('theme', theme, { expires: 365 }); // Expires in 1 year
  }, [theme]);

  useEffect(() => {
    // // Check if the app is running as an installed PWA
    // const checkStandalone = () => {
    //   if (window.matchMedia('(display-mode: standalone)').matches) {
    //     setIsStandalone(true);
    //   } else if (window.navigator.standalone) {  // For iOS devices
    //     setIsStandalone(true);
    //   } else {
    //     setIsStandalone(false);
    //   }
    // };

    // // Check if the user is on a mobile device
    // const checkMobile = () => {
    //   setIsMobile(window.innerWidth <= 768); // Adjust the width as necessary
    // };

    // checkStandalone();
    // checkMobile();

    // window.addEventListener('resize', checkMobile);

    const fetchInitialData = async () => {
      const lastUrl = Cookies.get('lastUrl');

      if (lastUrl) {
        try {
          const { data } = await axios.get(`/api/points/refresh?url=${encodeURIComponent(lastUrl)}`);
          if (data && data.name !== '') {
            fetchData(data);
            handleStateChange({ isValidUrl: true, url: lastUrl });
          }
        } catch (error) {
          console.error(error);
          Cookies.remove('lastUrl');
        }
      }
      setIsInitialized(true);
      setIsLoading(false);
    };

    fetchInitialData();
  }, [fetchData, handleStateChange]);

  // Theme management
  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      return newTheme;
    });
  };

  // Scroll handling
  useEffect(() => {
    let prevScrollPos = window.pageYOffset;
    
    const handleScroll = () => {
      const currentScrollPos = window.pageYOffset;
      setIsVisible(prevScrollPos > currentScrollPos || currentScrollPos < 50);
      prevScrollPos = currentScrollPos;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
        handleStateChange({ isValidUrl: true, loading: false });
        Cookies.set('lastUrl', data.url, {
          expires: 365, // Set to expire in 1 year
          sameSite: 'Lax',
          secure: true
        });
      } else {
        handleStateChange({ error: 'Please enter a valid SkillRack Profile URL!!', loading: false });
      }
    } catch (error) {
      handleStateChange({ error: 'Invalid URL. Please enter a valid SkillRack Profile URL!!', loading: false });
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

  // Don't render anything until initialization is complete or while loading
  if (!isInitialized || isLoading || state.loading) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '50px',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--background-color)'
      }}>
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <HelmetProvider>
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Helmet>
          <title>SkillRack Tracker</title>
          <meta property="og:title" content="SkillRack Tracker" />
          <meta name="description" content="Track and calculate your SkillRack points effortlessly using this powerful tool." />
          <link rel="canonical" href="https://skillrack.gururaja.in" />
          <script type="application/ld+json">
            {`
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "SkillRack Tracker",
                "alternateName": "SkillTrack",
                "url": "https://skillrack.gururaja.in/",
                "description": "Track and calculate your SkillRack points effortlessly using this powerful tool.",
                "author": {
                  "@type": "Person",
                  "name": "Guru"
                }
              }
            `}
          </script>
        </Helmet>
        <h1>SkillRack Tracker</h1>
        <Analytics/>
        <SpeedInsights/>
        <button 
          className={`theme-toggle ${isVisible ? 'visible' : 'hidden'}`}
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <MdDarkMode color='orange' size={18} /> : <MdLightMode color='orange' size={18} />}
        </button>
        {!state.isValidUrl && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <p>Login to <a href="https://www.skillrack.com/faces/candidate/manageprofile.xhtml" target="_blank" rel="noopener noreferrer"><b>SkillRack</b></a> <IoMdArrowRoundForward size={12}/> Profile <IoMdArrowRoundForward size={12}/> Enter Password <IoMdArrowRoundForward size={12}/> Click "View" <IoMdArrowRoundForward size={12}/> Copy the URL</p>
            <input
              type="text"
              value={state.url}
              onChange={(e) => handleStateChange({ url: e.target.value.trim() })}
              placeholder="Paste Profile URL"
              name="profile_url"
              style={{ width: '100%', maxWidth: '300px', padding: '10px', boxSizing: 'border-box' }}
            />
            <button type="submit" className="submit-button">Submit</button>
          </form>
        )}
        {state.error && (
          <p style={{ 
            color: 'var(--error-color)',
            fontWeight: '300',
            padding: '8px',
            borderRadius: '4px',
            transition: 'color 0.3s ease'
          }}>
            {state.error}
          </p>
        )}
        {state.isValidUrl && (
          <>
            <p>Updated on {state.lastFetched}</p>
            <br />
            <h2 className='fix-width' >Hi.. {state.name} 😊</h2>
            <div style={{ width: '200px', margin: '50px auto' }}>
              <CircularProgressbar
                value={state.percentage}
                text={(state.points <= state.requiredPoints) && (state.points !== 0) 
                  ? `${state.points}/${state.requiredPoints}` 
                  : `${state.points}`}
                styles={buildStyles({
                  // Use CSS variables for theme-aware colors
                  textColor: 'var(--progress-text)',
                  pathColor: 'var(--progress-circle)',
                  trailColor: 'var(--input-border)',
                  textSize: '16px',
                  // Add transition for smooth theme switching
                  transition: 'stroke-dashoffset 0.5s ease 0s',
                })}
              />
            </div>

            {state.points >= state.requiredPoints && state.requiredPoints !== 0 && (
              <>
                <h3 className='fix-width'>Congratulations 🎉 {state.name} on completing {state.requiredPoints} points!</h3>
                <br />
              </>
            )}
            <Summary
              codeTutor={state.codeTutor}
              codeTrack={state.codeTrack}
              codeTest={state.codeTest}
              dt={state.dt}
              dc={state.dc}
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
          {/* {!isStandalone && isMobile && (
            <a href="https://play.google.com/store/apps/details?id=in.gururaja.in.skillrack" target="_blank" rel="noopener noreferrer">
              <img src=".assets/badge_googleplay.png" alt="Get it on Google Play" height="80" />
            </a>
          )}
          <br /><br /> */}
          {state.isValidUrl && state.requiredPoints === 0 && (
            <>
              <div className='para-container'>
                <p>Your college is not in our database! Help us update your college's required points by emailing the "Required points" assigned by your college with the "College name" to <a href="mailto:mail@gururaja.in">mail@gururaja.in</a>. Once submitted, you'll unlock features like Schedule Planner!</p>
              </div>
              <br /><br />
            </>
          )}
          <br /><br />
          made with ❤️ by <a href="https://gururaja.in" target="_blank" rel="noopener noreferrer"><b>someone</b></a>
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
