import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import 'reflect-metadata';
import cors from 'cors';
import mongoose from 'mongoose';

import './services/helpers/Secrets'
import { NotFoundError } from './errors/NotFoundError';
import { errorHandler } from './middlewares/ErrorHandler';

import cron from 'node-cron';
import { MigrationManager } from './services/MigrationManager';
import { MixpanelManager } from './services/analytics/MixpanelManager';
import { manageRouter } from './routes/v1/Manage';
import { highTableRouter } from './routes/v1/HighTableRoutes';
import { campaignRouter } from './routes/v1/CampaignRoutes'; // Add this line

const app = express();
app.use(json());
app.use(cors());

// Apply routes
if (process.env.API_ENABLED == 'true'){
    app.use(manageRouter);
    app.use(campaignRouter); // Add this line
}
app.use(highTableRouter);  

// Catch-all route for unmatched routes
app.all('*', async () => {
    throw new NotFoundError();
});

// Error handling middleware should be last
app.use(errorHandler);

const start = async () => {
    await mongoose.connect(process.env.MONGODB_CONNECTION_URL!);
    console.log('Connected to mongodb!');

    // await Auth.syncIndexes();

    await MixpanelManager.init();
    await MigrationManager.migrate();

    const port = process.env.PORT;
    app.listen(port, () => {
        console.log(`Listening on port ${port}.`);

        setupCron();
    });
}

const setupCron = async () => {
    if (process.env.CRON_ENABLED == 'true'){
        // cron.schedule('* * * * *', () => {
        //     console.log('running a task every minute');
        // });
    }
}

start();