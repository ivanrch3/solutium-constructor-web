console.log('API URL:', process.env.VITE_APP_MADRE_API_URL);
console.log('ALL VITE:', Object.keys(process.env).filter(k => k.startsWith('VITE_')));
