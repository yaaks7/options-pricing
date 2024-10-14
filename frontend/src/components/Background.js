import React, { useEffect, useState, useRef } from "react";
import FOG from "vanta/dist/vanta.fog.min"; // Import FOG effect
import * as THREE from "three"; // Ensure "three" is installed
import '../App.css'; 

const Background = () => {
  const [vantaEffect, setVantaEffect] = useState(null);
  const vantaRef = useRef(null);

  useEffect(() => {
    if (!vantaEffect) {
      setVantaEffect(
        FOG({
          el: vantaRef.current,
          THREE: THREE,  // Make sure Vanta uses THREE.js
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          highlightColor: 0x557B83,
          midtoneColor: 0x0,
          lowlightColor: 0x0,
          baseColor: 0x0,
          blurFactor: 0.99,
          speed: 0.50,
          zoom: 1.80
        })
      );
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  return <div ref={vantaRef} className="vanta-background"></div>;
};

export default Background;
