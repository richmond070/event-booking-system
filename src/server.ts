import config from './config/env';
import Logging from './utils/logger';
import app from './app';
import { Pool } from 'pg';
import http from 'http';

const httpServer = http.createServer(app);

const startServer = async () => {
    try {
        const pool = new Pool({
            connectionString: config.postgres_db
        });

        await pool.connect();

        Logging.info(`Connected to database`);

        httpServer.listen(config.port, () => {
            Logging.info(`Server running on port ${config.port}`);
        });

    } catch (err) {
        Logging.error(`Failed to start server: ${err}`);
        process.exit(1);
    }
};

startServer();
