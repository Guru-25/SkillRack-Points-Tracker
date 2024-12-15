import React, { useState, useEffect } from 'react';
import './Schedule.css';

const Schedule = ({ initialValues }) => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [finishDate, setFinishDate] = useState('');
  const [manualTarget, setManualTarget] = useState(false);
  const [targetPoints, setTargetPoints] = useState('');
  const [displayPoints, setDisplayPoints] = useState('');
  const [manualTargetModified, setManualTargetModified] = useState(false);

  const [initialValuesState, setInitialValues] = useState({
    codeTrack: '',
    dt: '',
    dc: '',
    points: '',
    requiredPoints: '',
    codeTest: ''
  });

  useEffect(() => {
    if (initialValues) {
      setInitialValues({
        ...initialValues,
        requiredPoints: initialValues.requiredPoints || ''
      });

      if (!manualTargetModified) {
        setManualTarget(
          (initialValues.requiredPoints === 0 || (initialValues.points >= initialValues.requiredPoints))
        );
      }

      if (!manualTarget) {
        setTargetPoints(
          (initialValues.requiredPoints > 0 && initialValues.points < initialValues.requiredPoints) ? initialValues.requiredPoints : ''
        );
        setDisplayPoints(initialValues.requiredPoints);
      }
    }
  }, [initialValues, manualTarget, manualTargetModified]);

  useEffect(() => {
    setDisplayPoints(
      manualTarget ? targetPoints : initialValuesState.requiredPoints
    );
  }, [targetPoints, manualTarget, initialValuesState.requiredPoints]);

  useEffect(() => {
    if (initialValues.deadline) {
      const currentDate = new Date();
      const deadlineDate = new Date(initialValues.deadline);
      if (
        initialValues.points < initialValues.requiredPoints &&
        currentDate < deadlineDate
      ) {
        setFinishDate(initialValues.deadline);
      }
    }
  }, [initialValues.deadline, initialValues.points, initialValues.requiredPoints]);

  const calculatePoints = (tracks, dt, dc, codeTest) => {
    return tracks * 2 + dt * 20 + dc * 2 + codeTest * 30;
  };

  const generateSchedule = () => {
    setLoading(true);
    setError('');

    const { codeTrack, dt, dc, points, codeTest } = initialValuesState;

    if (!finishDate) {
      setError('Please enter the date!!');
      setLoading(false);
      return;
    }

    if (manualTarget && !targetPoints) {
      setError('Please enter target points!!');
      setLoading(false);
      return;
    }

    let currentTracks = parseInt(codeTrack);
    let currentDt = parseInt(dt);
    let currentDc = parseInt(dc);
    let currentPoints = parseInt(points);
    let currentCodeTest = parseInt(codeTest);

    const targetPointsValue = manualTarget ? 
      (targetPoints || 0) : 
      (initialValuesState.requiredPoints || 0);

    if (targetPointsValue <= currentPoints) {
      setError('Target points must be greater than current points!!');
      setLoading(false);
      return;
    }

    const today = new Date();
    const finish = new Date(finishDate);

    today.setHours(0, 0, 0, 0);
    finish.setHours(0, 0, 0, 0);

    const diffMilliseconds = finish - today;
    const oneDayInMilliseconds = 24 * 60 * 60 * 1000;
    const daysToFinish = diffMilliseconds / oneDayInMilliseconds;

    if (daysToFinish <= 0) {
      setError('Date must be in the future!!');
      setLoading(false);
      return;
    }

    let newSchedule = [
      {
        date: today.toLocaleDateString('en-GB', { year: '2-digit', month: '2-digit', day: '2-digit' }),
        tracks: currentTracks,
        dt: currentDt,
        dc: currentDc,
        points: currentPoints,
      },
    ];

    let currentDate = new Date(today);
    let finalDt = currentDt + daysToFinish;
    let finalDc = currentDc + daysToFinish;

    let toScorePoints = currentTracks * 2 + finalDt * 20 + finalDc * 2;
    let neededPoints = targetPointsValue - toScorePoints;
    let trackIncrement = neededPoints / 2 / daysToFinish;
    if (trackIncrement < 0) {
      trackIncrement = 0;
    }

    for (let i = 1; i <= daysToFinish; i++) {
      currentDate.setDate(currentDate.getDate() + 1);

      // Calculate potential new tracks
      let potentialTracks = currentTracks + trackIncrement;
      let potentialDt = currentDt + 1;
      let potentialDc = currentDc + 1;

      // Calculate potential points
      let potentialPoints = calculatePoints(potentialTracks, potentialDt, potentialDc, currentCodeTest);

      // If adding the full increment exceeds the target, adjust the increment
      if (potentialPoints >= targetPointsValue) {
        // Calculate the exact points needed to reach the target
        let pointsNeeded = targetPointsValue - currentPoints;

        // Determine the required increments with priority: dt > dc > tracks
        let additionalDt = 0;
        let additionalDc = 0;
        let additionalTracks = 0;

        // Prioritize daily tests (dt)
        if (pointsNeeded > 0) {
          additionalDt = Math.min(Math.floor(pointsNeeded / 20), daysToFinish - i + 1);
          pointsNeeded -= additionalDt * 20;
        }

        // Then prioritize daily challenges (dc)
        if (pointsNeeded > 0) {
          additionalDc = Math.min(Math.floor(pointsNeeded / 2), daysToFinish - i + 1 - additionalDt);
          pointsNeeded -= additionalDc * 2;
        }

        // Finally, allocate remaining points to tracks
        if (pointsNeeded > 0) {
          additionalTracks = Math.ceil(pointsNeeded / 2);
          pointsNeeded -= additionalTracks * 2;
        }

        // Update the current values with the exact needed increments
        currentDt += additionalDt;
        currentDc += additionalDc;
        currentTracks += additionalTracks;

        currentPoints = calculatePoints(currentTracks, currentDt, currentDc, currentCodeTest);

        newSchedule.push({
          date: currentDate.toLocaleDateString('en-GB', { year: '2-digit', month: '2-digit', day: '2-digit' }),
          tracks: Math.round(currentTracks),
          dt: currentDt,
          dc: currentDc,
          points: Math.round(currentPoints),
        });

        break; // Target reached
      } else {
        // Continue with regular increment
        currentTracks = potentialTracks;
        currentDt = potentialDt;
        currentDc = potentialDc;
        currentPoints = calculatePoints(currentTracks, currentDt, currentDc, currentCodeTest);

        newSchedule.push({
          date: currentDate.toLocaleDateString('en-GB', { year: '2-digit', month: '2-digit', day: '2-digit' }),
          tracks: Math.round(currentTracks),
          dt: currentDt,
          dc: currentDc,
          points: Math.round(currentPoints),
        });
      }
    }

    setSchedule(newSchedule);
    setLoading(false);
  };

  if (loading) return <div className="loading">Generating schedule...</div>;

  return (
    <div className="schedule-container">
      <h2 className="schedule-title">Schedule for {displayPoints === 0 ? "" : `${displayPoints}`} Points</h2>
      <div className="form-container">
        <input
          type="date"
          value={finishDate}
          min={new Date().toISOString().split('T')[0]}
          onChange={(e) => setFinishDate(e.target.value)}
          className="input-field date-input"
        />
        <div className="manual-target-container">
          {(initialValues.requiredPoints !== 0 && (initialValues.points < initialValues.requiredPoints)) && (
            <div>
              <label>
                <input
                  type="checkbox"
                  checked={manualTarget}
                  onChange={() => {
                    setManualTarget(!manualTarget);
                    setManualTargetModified(true);
                    if (!manualTarget) {
                      setTargetPoints(initialValuesState.requiredPoints > 0 ? initialValuesState.requiredPoints : '');
                    }
                  }}
                  style={{ marginBottom: '18px' }}
                />
                &nbsp;Manually set target points
              </label>
            </div>
          )}
          {manualTarget && (
            <div className="fade-in">
              <input
                type="number" 
                value={targetPoints}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setTargetPoints(value ? parseInt(value) : '');
                }}
                onKeyDown={(e) => {
                  if (
                    !/^\d$/.test(e.key) && 
                    !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)
                  ) {
                    e.preventDefault();
                  }
                }}
                min="0"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Enter points"
                className="input-field target-input"
              />
            </div>
          )}
        </div>
        <button onClick={generateSchedule} className="generate-button" style={{ marginTop: '10px'}} >Generate</button>
      </div>
      {error && <div className="error-message">{error}</div>}
      {schedule.length > 0 && (
        <div className="schedule-table-container fade-in">
          <table className="schedule-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Track</th>
                <th>DT</th>
                <th>DC</th>
                <th>PTS</th>
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
