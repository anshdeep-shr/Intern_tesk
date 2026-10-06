import { Response } from 'express';
import { z } from 'zod';
import prisma from '../db/prisma';
import { AuthRequest } from '../middleware/auth';

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  status: z.enum(['Not Started', 'In Progress', 'Completed']).optional().default('Not Started'),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional()
});

export const getProjects = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { search, status } = req.query;

    const whereClause: any = { userId };

    if (search && typeof search === 'string' && search.trim() !== '') {
      whereClause.name = { contains: search.trim() };
    }

    if (status && typeof status === 'string' && status.trim() !== '') {
      whereClause.status = status.trim();
    }

    const projects = await prisma.project.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { tasks: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({ projects });
  } catch (error: any) {
    console.error('getProjects Error:', error);
    return res.status(500).json({ error: 'Server Error', message: error.message });
  }
};

export const getProjectById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const project = await prisma.project.findFirst({
      where: { id, userId },
      include: {
        tasks: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Not Found', message: 'Project not found or access denied' });
    }

    return res.status(200).json({ project });
  } catch (error: any) {
    console.error('getProjectById Error:', error);
    return res.status(500).json({ error: 'Server Error', message: error.message });
  }
};

export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const parseResult = projectSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation Error',
        details: parseResult.error.errors.map(err => ({ field: err.path.join('.'), message: err.message }))
      });
    }

    const { name, description, status, startDate, endDate } = parseResult.data;

    const project = await prisma.project.create({
      data: {
        name,
        description,
        status,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        userId
      }
    });

    return res.status(201).json({ message: 'Project created successfully', project });
  } catch (error: any) {
    console.error('createProject Error:', error);
    return res.status(500).json({ error: 'Server Error', message: error.message });
  }
};

export const updateProject = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const existingProject = await prisma.project.findFirst({ where: { id, userId } });
    if (!existingProject) {
      return res.status(404).json({ error: 'Not Found', message: 'Project not found or access denied' });
    }

    const parseResult = projectSchema.partial().safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation Error',
        details: parseResult.error.errors.map(err => ({ field: err.path.join('.'), message: err.message }))
      });
    }

    const { name, description, status, startDate, endDate } = parseResult.data;

    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null })
      }
    });

    return res.status(200).json({ message: 'Project updated successfully', project: updatedProject });
  } catch (error: any) {
    console.error('updateProject Error:', error);
    return res.status(500).json({ error: 'Server Error', message: error.message });
  }
};

export const deleteProject = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const existingProject = await prisma.project.findFirst({ where: { id, userId } });
    if (!existingProject) {
      return res.status(404).json({ error: 'Not Found', message: 'Project not found or access denied' });
    }

    await prisma.project.delete({ where: { id } });

    return res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error: any) {
    console.error('deleteProject Error:', error);
    return res.status(500).json({ error: 'Server Error', message: error.message });
  }
};
