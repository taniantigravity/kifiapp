import { query } from './src/config/db';

async function deleteAllData() {
  try {
    console.log('Starting data deletion...');

    // Delete in reverse order of foreign key dependencies
    await query('DELETE FROM app_settings;');
    await query('DELETE FROM notifications;');
    await query('DELETE FROM treatments;');
    await query('DELETE FROM health_logs;');
    await query('DELETE FROM batch_costs;');
    await query('DELETE FROM expenses;');
    await query('DELETE FROM sale_items;');
    await query('DELETE FROM sales;');
    await query('DELETE FROM customers;');
    await query('DELETE FROM plant_feed_harvest;');
    await query('DELETE FROM feeding_logs;');
    await query('DELETE FROM feed_inventory;');
    await query('DELETE FROM stage_records;');
    await query('DELETE FROM batch_movements;');
    await query('DELETE FROM batches;');
    await query('DELETE FROM tank_stocking;');
    await query('DELETE FROM tanks;');
    await query('DELETE FROM spawn_updates;');
    await query('DELETE FROM spawns;');
    await query('DELETE FROM broodstock;');
    await query('DELETE FROM users;');

    console.log('✓ All data deleted successfully!');
    
    // Verify
    const broodRes = await query('SELECT COUNT(*) FROM broodstock');
    const tankRes = await query('SELECT COUNT(*) FROM tanks');
    const userRes = await query('SELECT COUNT(*) FROM users');
    
    console.log(`Broodstock rows: ${broodRes.rows[0].count}`);
    console.log(`Tank rows: ${tankRes.rows[0].count}`);
    console.log(`User rows: ${userRes.rows[0].count}`);
    
    process.exit(0);
  } catch (error: any) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

deleteAllData();
