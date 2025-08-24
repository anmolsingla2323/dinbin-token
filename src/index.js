import express from 'express';
import dotenv from 'dotenv';
import routes from './routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/token', routes);

app.listen(PORT, () => {
  console.log(`Token Service running on port ${PORT}`);
});
