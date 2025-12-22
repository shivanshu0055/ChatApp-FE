import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';

const NotFound = () => {

    const [timer,setTimer] = useState(5);
    const navigate = useNavigate();

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prev) => prev - 1)
        }, 1000);

        setTimeout(() => {
            navigate("/");
        }, 5000);

        return () => clearInterval(interval);
    }, []);

  return (
    <>
    <div>NotFound</div>
    <div>Redirecting to LandingPage in {timer} seconds...</div>
    </>
  )
}

export default NotFound