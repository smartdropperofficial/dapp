// hooks/useChromeDetection.js

import { useEffect, useState } from "react";

const useChromeDetection = () => {
     const [isChrome, setIsChrome] = useState(false);

     useEffect(() => {
          // Verifica se l'agente utente contiene "Chrome"
          const userAgent = window.navigator.userAgent.toLowerCase();
          const isChromeBrowser = userAgent.includes("chrome");

          setIsChrome(isChromeBrowser);
     }, []);

     return isChrome;
};

export default useChromeDetection;
