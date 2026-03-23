/**
 * Configuration globale de l'application frontend
 */
const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const config = {
    apiUrl: apiBase.endsWith('/api') ? apiBase : `${apiBase}/api`,
    appName: 'G-SECU — DG/SECU Sonatel',
    version: '1.0.0',
} as const;

export default config;
