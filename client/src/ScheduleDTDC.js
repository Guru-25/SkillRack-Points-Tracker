import React, { useState, useEffect } from 'react';
import './Schedule.css'; // Import the CSS file

const ScheduledtDc = ({ initialValues }) => {
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
    problems: ''
  });

  const generateSchedule = () => {
    setLoading(true);
    setError('');

    const { codeTrack, problems } = initialValuesState;

    if (!finishDate) {
      setError('Please enter the date');
      setLoading(false);
      return;
    }

    let currentTracks = parseInt(codeTrack);
    let currentProblems = parseInt(problems);

    const targetProblems = 600;
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
        track: currentTracks,
        totalSolved: currentProblems,
      },
    ];

    let currentDate = new Date(today);
    let neededToSolve = targetProblems - currentProblems;
    let trackIncrement = neededToSolve / daysToFinish;

    for (let i = 1; i <= daysToFinish; i++) {
      currentDate.setDate(currentDate.getDate() + 1);

      currentTracks += trackIncrement;
      currentProblems += trackIncrement;

      newSchedule.push({
        date: currentDate.toLocaleDateString('en-GB'),
        track: Math.round(currentTracks), // To keep the track value an integer
        totalSolved: Math.round(currentProblems), // Round totalSolved to avoid floating-point issues
      });

      if (currentProblems >= targetProblems) break;
    }

    setSchedule(newSchedule);
    setLoading(false);
  };

  if (loading) return <div className="loading">Generating schedule...</div>;

  return (
    <div className="schedule-container">
      <h2 className="schedule-title">Schedule to Unlock DT/DC</h2>
      <div className="form-container">
        <input
          type="text"
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
        <button onClick={generateSchedule} className="generate-button">Generate Schedule</button>
      </div>
      {error && <div className="error-message">{error}</div>}
      {schedule.length > 0 && (
        <div className="schedule-table-container">
          <table className="schedule-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Tracks</th>
                <th>Solved</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((day, index) => (
                <tr key={index}>
                  <td>{day.date}</td>
                  <td>{day.track}</td>
                  <td>{day.totalSolved}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ScheduledtDc;
