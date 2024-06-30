// client/src/Summary.js
import React from 'react';

const Summary = ({ codeTest, codeTrack, dt, dc, totalPoints }) => {
  return (
    <aside style={{ 
      textAlign: 'center', 
      margin: '20px auto', 
      padding: '20px', 
      border: '1px solid #ccc', 
      borderRadius: '8px', 
      backgroundColor: '#f9f9f9', 
      width: 'fit-content' 
    }}>
      <h3>Points Calculation Summary</h3>
      <p>Code Test: {codeTest} x 30 = {codeTest * 30}</p>
      <p>Code Track: {codeTrack} x 2 = {codeTrack * 2}</p>
      <p>Daily Challenge: {dc} x 2 = {dc * 2}</p>
      <p>Dailt Test: {dt} x 20 = {dt * 20}</p>
      <hr />
      <p><strong>Total Points: {totalPoints}</strong></p>
    </aside>
  );
};

export default Summary;