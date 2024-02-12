import React, { useEffect, useState } from 'react'

export const CountdownTimer = ({time}) => {
    const [countdown, setCountdown] = useState(time);

    useEffect(() => {
        const countdownIntervalId = setInterval(() => {
            setCountdown((prevCountdown) => {
              if (prevCountdown <= 1) {
                return time;
              } else {
                return prevCountdown - 1;
              }
            });
          }, 1000);
      
          return () => {
            clearInterval(countdownIntervalId);
          };
        }, [time]);
  return (
    <div>Next update in: {countdown} seconds</div>
  )
}
