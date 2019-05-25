import app from './app';
import AuthService from './lib/AuthService';

AuthService.init();

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}`);
});
