// frontend/src/config/api.js

const DEV_BASE_URL = "http://127.0.0.1:8000";
const PROD_BASE_URL = "https://api.floriankoehl.com";

// Vite setzt import.meta.env.DEV = true im Dev-Server (npm run dev)
// und false im Build/Production.
export const BASE_URL = import.meta.env.DEV ? DEV_BASE_URL : PROD_BASE_URL;
