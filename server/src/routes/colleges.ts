import { Router, Request, Response } from 'express';
import { prisma } from '../db.js';

export const collegesRouter = Router();

// GET /colleges - fetch all colleges from database
collegesRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const colleges = await prisma.college.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    res.json({
      success: true,
      count: colleges.length,
      data: colleges,
    });
  } catch (error) {
    console.error('Error fetching colleges:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch colleges',
    });
  }
});
