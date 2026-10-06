import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Calendar, FolderKanban, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { TaskCard } from '../components/TaskCard';
import { TaskModal } from '../components/TaskModal';
import { ProjectModal } from '../components/ProjectModal';
import { Project, Task } from '../types';
import api from '../services/api';

export const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  const fetchProjectDetail = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data.project);
      setTasks(res.data.project.tasks || []);
    } catch (err) {
      console.error('Failed to fetch project details', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetail();
  }, [id]);

  const handleUpdateProject = async (data: Partial<Project>) => {
    if (!id) return;
    await api.put(`/projects/${id}`, data);
    fetchProjectDetail();
  };

  const handleCreateOrUpdateTask = async (data: Partial<Task>) => {
    if (editingTask) {
      await api.put(`/tasks/${editingTask.id}`, data);
    } else {
      await api.post('/tasks', { ...data, projectId: id });
    }
    fetchProjectDetail();
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await api.delete(`/tasks/${taskId}`);
      fetchProjectDetail();
    }
  };

  const handleToggleTaskStatus = async (task: Task) => {
    const nextStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    await api.put(`/tasks/${task.id}`, { status: nextStatus });
    fetchProjectDetail();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h2 className="text-xl font-bold text-gray-900">Project Not Found</h2>
        <Link to="/projects" className="mt-4 text-blue-600 hover:underline inline-block">
          Return to Projects
        </Link>
      </div>
    );
  }

  const completedCount = tasks.filter((t) => t.status === 'Completed').length;
  const progressPercentage = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link to="/projects" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Projects
      </Link>

      {/* Project Header Banner */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <FolderKanban className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {project.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-2">{project.description || 'No description provided.'}</p>
            
            <div className="mt-4 flex items-center space-x-6 text-xs text-gray-500">
              {project.startDate && (
                <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1" /> Start: {new Date(project.startDate).toLocaleDateString()}</span>
              )}
              {project.endDate && (
                <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1" /> End: {new Date(project.endDate).toLocaleDateString()}</span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsProjectModalOpen(true)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700"
            >
              Edit Project
            </button>
            <button
              onClick={() => { setEditingTask(null); setIsTaskModalOpen(true); }}
              className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 shadow-sm"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Task
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex justify-between text-xs font-medium text-gray-600 mb-1">
            <span>Project Completion</span>
            <span>{progressPercentage}% ({completedCount}/{tasks.length} tasks)</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Project Tasks ({tasks.length})</h2>

        {tasks.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-8 text-center">
            <p className="text-sm text-gray-500">No tasks created under this project yet.</p>
            <button
              onClick={() => { setEditingTask(null); setIsTaskModalOpen(true); }}
              className="mt-3 text-sm text-blue-600 font-medium hover:underline inline-flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" /> Create the first task
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={(t) => { setEditingTask(t); setIsTaskModalOpen(true); }}
                onDelete={handleDeleteTask}
                onToggleStatus={handleToggleTaskStatus}
              />
            ))}
          </div>
        )}
      </div>

      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSubmit={handleUpdateProject}
        project={project}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleCreateOrUpdateTask}
        task={editingTask}
        projects={project ? [project] : []}
        defaultProjectId={id}
      />
    </div>
  );
};
