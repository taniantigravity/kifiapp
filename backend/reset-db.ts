import { readFileSync } from 'fs';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function resetDatabase() {
    try {
        console.log('Connecting to database...');
        
        // Read the clean schema SQL file
        const schemaSQL = readFileSync('./clean-schema.sql', 'utf-8');
        
        console.log('Executing schema...');
        
        // Split by semicolons and execute each statement
        const statements = schemaSQL.split(';').filter(s => s.trim().length > 0);
        
        for (const statement of statements) {
            try {
                await pool.query(statement);
            } catch (err: any) {
                console.error('Error executing statement:', err.message);
                // Continue with next statement
            }
        }
        
        console.log('✓ Database reset completed!');
        
        // Verify: count rows in key tables
        const broodRes = await pool.query('SELECT COUNT(*) FROM broodstock');
        const tankRes = await pool.query('SELECT COUNT(*) FROM tanks');
        
        console.log(`Broodstock rows: ${broodRes.rows[0].count}`);
        console.log(`Tank rows: ${tankRes.rows[0].count}`);
        
        process.exit(0);
    } catch (error: any) {
        console.error('Fatal error:', error.message);
        process.exit(1);
    }
}

resetDatabase();
