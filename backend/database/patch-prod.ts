import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const patchSchema = async () => {
    try {
        const patchPath = path.join(__dirname, '../fix-schema-full.sql');
        const patchSql = fs.readFileSync(patchPath, 'utf8');

        console.log('Applying schema patch...');
        await pool.query(patchSql);
        console.log('✅ Schema patch applied successfully.');
    } catch (error) {
        console.error('❌ Error applying patch:', error);
    } finally {
        await pool.end();
    }
};

patchSchema();
