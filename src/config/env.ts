import dotenv from 'dotenv';
dotenv.config();

interface Config {
  port: number;
  postgres_db: string;
  nodeEnv: string;
}


const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const DATABASE_URL = process.env.DATABASE_URL || "";

const config: Config = {
  port: PORT,
  nodeEnv: NODE_ENV,
  postgres_db: DATABASE_URL,  
};

export default config;
