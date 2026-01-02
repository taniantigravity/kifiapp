import express, { Router } from 'express';
import {
    getTanks,
    createTank,
    updateTank,
    deleteTank,
    getTankById
} from '../controllers/tank.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router: Router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Get all tanks
router.get('/', getTanks);

// Get single tank by ID
router.get('/:id', getTankById);

// Create new tank
router.post('/', createTank);

// Update tank
router.put('/:id', updateTank);

// Delete tank
router.delete('/:id', deleteTank);

export default router;
