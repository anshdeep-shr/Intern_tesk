import { Response } from 'express';
import { z } from 'zod';
import prisma from '../db/prisma';
import { AuthRequest } from '../middleware/auth';

const createTaskSchema = z.object({
  name: z.string().min(1, 'Task name is required'),
  description: z.string().optional(),
  priority: z.enum(['Low', 'Medium', 'High']).optional().default('Medium'),
  status: z.enum(['Pending', 'In Progress', 'Completed']).optional().default('Pending'),
  dueDate: z.string().nullable().optional(),
  projectId: z.string().min(1, 'Project ID is required')
});

const updateTaskSchema = z.object({
  name: z.string().min(1, 'Task name cannot be empty').optional(),
  description: z.string().optional(),
  priority: z.enum(['Low', 'Medium', 'High']).optional(),
  status: z.enum(['Pending', 'In Progress', 'Completed']).optional(),
  dueDate: z.string().nullable().optional(),
  projectId: z.string().optional()
});

export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { projectId, search, status, priority } = req.query;

    const whereClause: any = { userId };

    if (projectId && typeof projectId === 'string' && projectId.trim() !== '') {
      whereClause.projectId = projectId.trim();
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      whereClause.name = { contains: search.trim() };
    }

    if (status && typeof status === 'string' && status.trim() !== '') {
      whereClause.status = status.trim();
    }

    if (priority && typeof priority === 'string' && priority.trim() !== '') {
      whereClause.priority = priority.trim();
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        project: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({ tasks });
  } catch (error: any) {
    console.error('getTasks Error:', error);
    return res.status(500).json({ error: 'Server Error', message: error.message });
  }
};

export const getTaskById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const task = await prisma.task.findFirst({
      where: { id, userId },
      include: {
        project: {
          select: { id: true, name: true }
        }
      }
    });

    if (!task) {
      return res.status(404).json({ error: 'Not Found', message: 'Task not found or access denied' });
    }

    return res.status(200).json({ task });
  } catch (error: any) {
    console.error('getTaskById Error:', error);
    return res.status(500).json({ error: 'Server Error', message: error.message });
  }
};

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const parseResult = createTaskSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation Error',
        details: parseResult.error.errors.map(err => ({ field: err.path.join('.'), message: err.message }))
      });
    }

    const { name, description, priority, status, dueDate, projectId } = parseResult.data;

    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId }
    });

    if (!project) {
      return res.status(404).json({ error: 'Not Found', message: 'Associated project not found or access denied' });
    }

    const task = await prisma.task.create({
      data: {
        name,
        description,
        priority,
        status,
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        userId
      },
      include: {
        project: {
          select: { id: true, name: true }
        }
      }
    });

    return res.status(201).json({ message: 'Task created successfully', task });
  } catch (error: any) {
    console.error('createTask Error:', error);
    return res.status(500).json({ error: 'Server Error', message: error.message });
  }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const existingTask = await prisma.task.findFirst({ where: { id, userId } });
    if (!existingTask) {
      return res.status(404).json({ error: 'Not Found', message: 'Task not found or access denied' });
    }

    const parseResult = updateTaskSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation Error',
        details: parseResult.error.errors.map(err => ({ field: err.path.join('.'), message: err.message }))
      });
    }

    const { name, description, priority, status, dueDate, projectId } = parseResult.data;

    if (projectId && projectId !== existingTask.projectId) {
      const project = await prisma.project.findFirst({ where: { id: projectId, userId } });
      if (!project) {
        return res.status(404).json({ error: 'Not Found', message: 'Target project not found or access denied' });
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(priority !== undefined && { priority }),
        ...(status !== undefined && { status }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(projectId !== undefined && { projectId })
      },
      include: {
        project: {
          select: { id: true, name: true }
        }
      }
    });

    return res.status(200).json({ message: 'Task updated successfully', task: updatedTask });
  } catch (error: any) {
    console.error('updateTask Error:', error);
    return res.status(500).json({ error: 'Server Error', message: error.message });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const existingTask = await prisma.task.findFirst({ where: { id, userId } });
    if (!existingTask) {
      return res.status(404).json({ error: 'Not Found', message: 'Task not found or access denied' });
    }

    await prisma.task.delete({ where: { id } });

    return res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error: any) {
    console.error('deleteTask Error:', error);
    return res.status(500).json({ error: 'Server Error', message: error.message });
  }
};
