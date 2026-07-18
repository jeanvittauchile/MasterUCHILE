import 'dotenv/config';
import { createApp } from '../src/app';

// Vercel's Node builder acepta un request handler Express directamente, sin serverless-http.
export default createApp();
