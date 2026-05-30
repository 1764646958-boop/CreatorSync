import dotenv from 'dotenv';
import { createApp } from './app';

dotenv.config();

const port = Number(process.env.PORT) || 3001;
const app = createApp();

app.listen(port, () => {
  console.log(`[${new Date().toISOString()}] CreatorSync backend listening on port ${port}`);
});
