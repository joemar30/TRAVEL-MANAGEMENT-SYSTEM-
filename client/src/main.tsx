import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Force manual login on initial startup in development mode
if (import.meta.env.DEV && !sessionStorage.getItem('dev_cleared')) {
  localStorage.removeItem('travel_token');
  localStorage.removeItem('travel-storage');
  sessionStorage.setItem('dev_cleared', 'true');
}

createRoot(document.getElementById("root")!).render(<App />);
