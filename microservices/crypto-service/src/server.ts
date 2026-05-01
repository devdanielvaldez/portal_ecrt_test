import "./instrumentation";
import app from './app';
import dotenv from 'dotenv';

dotenv.config();
const PORT = process.env.PORT || 3009;

app.listen(PORT, () => {
  console.log(`Crypto service running on port ${PORT}`);
});
