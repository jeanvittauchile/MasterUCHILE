import 'dotenv/config';
import { createApp } from './app';
import { env } from './db/env';

const app = createApp();
const port = Number(env.PORT);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API escuchando en http://localhost:${port}`);
});
