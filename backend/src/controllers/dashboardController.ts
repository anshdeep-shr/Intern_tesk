import { Response } from 'express';
import prisma from '../db/prisma';
import { AuthRequest } from '../middleware/auth';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const [
      totalProjects,
      projectsInProgress,
      totalTasks,
      completedTasks,
      pendingTasks,
      recentProjects,
      recentTasks
    ] = await Promise.all([
      prisma.project.count({ where: { userId } }),
      prisma.project.count({ where: { userId, status: 'In Progress' } }),
      prisma.task.count({ where: { userId } }),
      prisma.task.count({ where: { userId, status: 'Completed' } }),
      prisma.task.count({ where: { userId, status: 'Pending' } }),
      prisma.project.findMany({
        where: { userId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { tasks: true } } }
      }),
      prisma.task.findMany({
        where: { userId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { project: { select: { name: true } } }
      })
    ]);

    return res.status(200).json({
      stats: {
        totalProjects,
        projectsInProgress,
        totalTasks,
        completedTasks,
        pendingTasks
      },
      recentProjects,
      recentTasks
    });
  } catch (error: any) {
    console.error('getDashboardStats Error:', error);
    return res.status(500).json({ error: 'Server Error', message: error.message });
  }
};
