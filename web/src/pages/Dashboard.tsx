import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderKanban, CheckSquare, Clock, CheckCircle2, AlertCircle, Plus } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { ProjectModal } from '../components/ProjectModal';
import { TaskModal } from '../components/TaskModal';
import { DashboardStats, Project, Task } from '../types';
import api from '../services/api';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const fetchDashboard = async () => {
    setIsLoading(true);
    try {
      const [dashRes, projRes] = await Promise.all([
        api.get('/dashboard'),
        api.get('/projects')
      ]);
      setStats(dashRes.data.stats);
      setRecentProjects(dashRes.data.recentProjects || []);
      setRecentTasks(dashRes.data.recentTasks || []);
      setAllProjects(projRes.data.projects || []);
    } catch (err) {
      console.error('Failed to fetch dashboard stats', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleCreateProject = async (data: Partial<Project>) => {
    await api.post('/projects', data);
    fetchDashboard();
  };

  const handleCreateTask = async (data: Partial<Task>) => {
    await api.post('/tasks', data);
    fetchDashboard();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome back! Here is an overview of your projects and progress.</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsProjectModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg text-sm hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            New Project
          </button>
          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="flex items-center px-4 py-2 bg-white text-gray-700 font-medium rounded-lg text-sm border border-gray-300 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            New Task
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        <StatCard
          title="Total Projects"
          value={stats?.totalProjects ?? 0}
          icon={FolderKanban}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <StatCard
          title="Projects In Progress"
          value={stats?.projectsInProgress ?? 0}
          icon={Clock}
          color="text-indigo-600"
          bgColor="bg-indigo-50"
        />
        <StatCard
          title="Total Tasks"
          value={stats?.totalTasks ?? 0}
          icon={CheckSquare}
          color="text-purple-600"
          bgColor="bg-purple-50"
        />
        <StatCard
          title="Completed Tasks"
          value={stats?.completedTasks ?? 0}
          icon={CheckCircle2}
          color="text-green-600"
          bgColor="bg-green-50"
        />
        <StatCard
          title="Pending Tasks"
          value={stats?.pendingTasks ?? 0}
          icon={AlertCircle}
          color="text-amber-600"
          bgColor="bg-amber-50"
        />
      </div>

      {/* Recent Lists Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Projects */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
            <Link to="/projects" className="text-sm font-medium text-blue-600 hover:text-blue-500">
              View all
            </Link>
          </div>
          {recentProjects.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No projects created yet.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentProjects.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between">
                  <div>
                    <Link to={`/projects/${p.id}`} className="font-medium text-gray-900 hover:text-blue-600 text-sm">
                      {p.name}
                    </Link>
                    <p className="text-xs text-gray-500">{p._count?.tasks ?? 0} tasks</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    p.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    p.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Tasks */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Tasks</h2>
            <Link to="/tasks" className="text-sm font-medium text-blue-600 hover:text-blue-500">
              View all
            </Link>
          </div>
          {recentTasks.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No tasks created yet.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentTasks.map((t) => (
                <div key={t.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className={`font-medium text-sm ${t.status === 'Completed' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                      {t.name}
                    </p>
                    {t.project && (
                      <p className="text-xs text-blue-600">{t.project.name}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                      t.priority === 'High' ? 'bg-red-100 text-red-700' :
                      t.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {t.priority}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      t.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      t.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSubmit={handleCreateProject}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleCreateTask}
        projects={allProjects}
      />
    </div>
  );
};
