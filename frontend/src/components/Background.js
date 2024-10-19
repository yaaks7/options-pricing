// src/components/Background.js
import React, { useEffect, useState, useRef } from "react";
import FOG from "vanta/dist/vanta.fog.min"; 
import * as THREE from "three"; 
import '../App.css'; 

const Background = () => {
  const [vantaEffect, setVantaEffect] = useState(null);
  const vantaRef = useRef(null);

  useEffect(() => {
    if (!vantaEffect) {
      setVantaEffect(
        FOG({
          el: vantaRef.current,
          THREE: THREE,
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
