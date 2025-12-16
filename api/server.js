import dotenv from 'dotenv';
dotenv.config();
import app from './app.js';
import database from './src/config/database.js';

/**
 * Test database connection
 */
const testDbConnection = async () => {
    try {
        await database.authenticate();
        console.log('✅ Database Successfully Connected');
        
        // Sync models in development
        if (process.env.NODE_ENV === 'development') {
            await database.sync({ alter: false }); // Set to true for auto migrations
            console.log('✅ Database Models Synced');
        }
    } catch (error) {
        console.error('❌ DB Error: Could not connect to the Database', error);
        process.exit(1);
    }
};

testDbConnection();

const port = process.env.PORT || 3600;
app.listen(port, () => {
    console.log(`🚀 Server running on => http://localhost:${port}`);
    console.log(`📚 API documentation available at => http://localhost:${port}/api-docs`);
});
