
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://tanitrack_user:tanitrack_password@localhost:5433/tanitrack'
});

async function createAdmin() {
    try {
        const hashedPassword = await bcrypt.hash('admin123', 10);

        // Check if role exists
        const roleRes = await pool.query("SELECT role_id FROM user_roles WHERE role_name = 'owner'");
        if (roleRes.rows.length === 0) {
            console.error("Role 'owner' not found. Ensure schema is loaded.");
            process.exit(1);
        }
        const roleId = roleRes.rows[0].role_id;

        const res = await pool.query(
            `INSERT INTO users (username, full_name, phone_number, password_hash, role_id)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (username) DO NOTHING
             RETURNING user_id`,
            ['admin', 'System Administrator', '08000000000', hashedPassword, roleId]
        );

        if (res.rows.length > 0) {
            console.log('Admin user created successfully.');
            console.log('Username: admin');
            console.log('Password: admin123');
        } else {
            console.log('Admin user already exists.');
        }
    } catch (err) {
        console.error('Error creating admin:', err);
    } finally {
        await pool.end();
    }
}

createAdmin();
