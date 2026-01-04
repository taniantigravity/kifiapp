import { Request, Response } from 'express';
import { query } from '../config/db';

export const getTanks = async (req: Request, res: Response) => {
    try {
        const result = await query(`
            SELECT t.*, 
                   COUNT(b.batch_id)::int as active_batches_count
            FROM tanks t
            LEFT JOIN batches b ON t.tank_id = b.current_tank_id AND b.status = 'Active'
            GROUP BY t.tank_id
            ORDER BY t.tank_name ASC
        `);
        res.json({ success: true, data: result.rows });
    } catch (error: any) {
        console.error('Get tanks error:', error);
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

export const getTankById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ success: false, message: 'Tank ID is required' });
        }

        const result = await query('SELECT * FROM tanks WHERE tank_id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Tank not found' });
        }

        const tank = result.rows[0];

        // Fetch active batches in this tank
        const batchesResult = await query(
            `SELECT batch_id, batch_code, start_date, current_stage, current_count 
             FROM batches 
             WHERE current_tank_id = $1 AND status = 'Active' 
             ORDER BY start_date DESC`,
            [id]
        );

        res.json({
            success: true,
            data: {
                ...tank,
                batches: batchesResult.rows
            }
        });
    } catch (error: any) {
        console.error('Get tank by ID error:', error);
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

export const createTank = async (req: Request, res: Response) => {
    try {
        const { tank_name, tank_type, location, capacity_liters, notes } = req.body;

        if (!tank_name || !tank_type || !capacity_liters) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const tank_code = `TNK-${Date.now().toString().slice(-6)}`;

        const result = await query(
            `INSERT INTO tanks (tank_code, tank_name, tank_type, location, capacity_liters, notes) 
             VALUES ($1, $2, $3, $4, $5, $6) 
             RETURNING *`,
            [tank_code, tank_name, tank_type, location, capacity_liters, notes]
        );
        res.status(201).json({ success: true, data: result.rows[0], message: 'Tank created successfully' });
    } catch (error: any) {
        console.error('Create tank error:', error);
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

export const updateTank = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { tank_name, tank_type, location, capacity_liters, notes, is_active } = req.body;

        const result = await query(
            `UPDATE tanks SET tank_name = $1, tank_type = $2, location = $3, capacity_liters = $4, notes = $5, is_active = $6
             WHERE tank_id = $7 RETURNING *`,
            [tank_name, tank_type, location, capacity_liters, notes, is_active ?? true, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Tank not found' });
        }

        res.json({ success: true, data: result.rows[0], message: 'Tank updated successfully' });
    } catch (error: any) {
        console.error('Update tank error:', error);
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

export const deleteTank = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Check for dependencies (batches)
        const batches = await query('SELECT batch_id FROM batches WHERE current_tank_id = $1 LIMIT 1', [id]);
        if (batches.rows.length > 0) {
            return res.status(400).json({ success: false, message: 'Cannot delete tank with active batches. Move batches first.' });
        }

        // Check for historical logs (feeding, health, movements)
        const feedingLogs = await query('SELECT log_id FROM feeding_logs WHERE tank_id = $1 LIMIT 1', [id]);
        const healthLogs = await query('SELECT log_id FROM health_logs WHERE tank_id = $1 LIMIT 1', [id]);
        const movements = await query('SELECT movement_id FROM batch_movements WHERE from_tank_id = $1 OR to_tank_id = $1 LIMIT 1', [id]);

        if (feedingLogs.rows.length > 0 || healthLogs.rows.length > 0 || movements.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete tank with historical data (feeding/health logs or movements). Archive it instead.'
            });
        }

        const result = await query('DELETE FROM tanks WHERE tank_id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Tank not found' });
        }

        res.json({ success: true, message: 'Tank deleted successfully' });
    } catch (error: any) {
        console.error('Delete tank error:', error);
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};
