import app from './app';
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 3007;

app.listen(PORT, () => console.log(`Media service running on port ${PORT}`));
