import React, { useState, useEffect } from 'react';
import './Schedule.css'; // Import the CSS file

const Schedule = ({ initialValues }) => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [finishDate, setFinishDate] = useState('');

  useEffect(() => {
    if (initialValues) {
      setInitialValues(initialValues);
    }
  }, [initialValues]);

  const [initialValuesState, setInitialValues] = useState({
    codeTrack: '',
    dt: '',
    dc: '',
    points: '',
    requiredPoints: '',
  });

  const calculatePoints = (tracks, dt, dc) => {
    return tracks * 2 + dt * 20 + dc * 2;
  };

  const generateSchedule = () => {
    setLoading(true);
    setError('');

    const { codeTrack, dt, dc, points, requiredPoints } = initialValuesState;

    if (!finishDate) {
      setError('Please enter the date');
      setLoading(false);
      return;
    }

    let currentTracks = parseInt(codeTrack);
    let currentDt = parseInt(dt);
    let currentDc = parseInt(dc);
    let currentPoints = parseInt(points);

    const targetPoints = parseInt(requiredPoints);
    const today = new Date();
    const finish = new Date(finishDate);

    // Set both dates to the start of the day (midnight) to exclude time
    today.setHours(0, 0, 0, 0);
    finish.setHours(0, 0, 0, 0);

    // Calculate the difference in milliseconds between the two dates
    const diffMilliseconds = finish - today;

    // Convert milliseconds to fraction of a day
    const oneDayInMilliseconds = 24 * 60 * 60 * 1000;
    const daysToFinish = diffMilliseconds / oneDayInMilliseconds;

    if (daysToFinish <= 0) {
      setError('Finish date must be in the future');
      setLoading(false);
      return;
    }

    let newSchedule = [
      {
        date: today.toLocaleDateString('en-GB'),
        tracks: currentTracks,
        dt: currentDt,
        dc: currentDc,
        points: currentPoints,
      },
    ];

    let currentDate = new Date(today);
    let flag = 0;
    let finalDt = currentDt + daysToFinish;
    let finalDc = currentDc + daysToFinish;

    let toScorePoints = currentTracks * 2 + finalDt * 20 + finalDc * 2;
    let neededPoints = targetPoints - toScorePoints;
    let trackIncrement = neededPoints / 2 / daysToFinish;
    if (trackIncrement < 0) {
      trackIncrement = 0;
    }

    for (let i = 1; i <= daysToFinish; i++) {
      currentDate.setDate(currentDate.getDate() + 1);
      currentTracks += trackIncrement;
      currentDt += 1;
      currentDc += 1;

      currentPoints = calculatePoints(currentTracks, currentDt, currentDc);
      if (flag === 1) break;
      if (currentPoints >= targetPoints) {
        flag = 1;
      }
      newSchedule.push({
        date: currentDate.toLocaleDateString('en-GB'),
        tracks: Math.round(currentTracks), // To keep the tracks value an integer
        dt: currentDt,
        dc: currentDc,
        points: Math.round(currentPoints), // Round points to avoid floating-point issues
      });
    }

    setSchedule(newSchedule);
    setLoading(false);
  };

  const { requiredPoints } = initialValuesState; // Extract targetPoints from initialValuesState

  if (loading) return <div className="loading">Generating schedule...</div>;

  return (
    <div className="schedule-container">
      <h2 className="schedule-title">Schedule for {requiredPoints} Points</h2>
      <div className="form-container">
        <input
          type="date"
          value={finishDate}
          onFocus={
            (e) => {
              e.currentTarget.type = "date";
              e.currentTarget.focus();
            }
          }
          onChange={(e) => setFinishDate(e.target.value)}
          className="input-field date-input"
          placeholder="Enter Target Date"
        />
        <button onClick={generateSchedule} className="generate-button">Generate</button>
      </div>
      {error && <div className="error-message">{error}</div>}
      {schedule.length > 0 && (
        <div className="schedule-table-container fade-in">
          <table className="schedule-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Tracks</th>
                <th>DT</th>
                <th>DC</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((day, index) => (
                <tr key={index}>
                  <td>{day.date}</td>
                  <td>{day.tracks}</td>
                  <td>{day.dt}</td>
                  <td>{day.dc}</td>
                  <td>{day.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Schedule;