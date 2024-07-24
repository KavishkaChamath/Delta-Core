import React from 'react';
import p1 from './p1.jpg';
import p2 from './p2.jpg';

const MyComponent = () => {
  return (
    <div className="container">
      <img src={p1} alt="Wolf" className="background" />
      <img src={p2} alt="Succulent" className="foreground" />
    </div>
  );
};

export default MyComponent;