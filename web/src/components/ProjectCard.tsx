import React from 'react';
import { Link } from 'react-router-dom';
import { Folder, Calendar, Edit2, Trash2, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Project, ProjectStatus } from '../types';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onEdit, onDelete }) => {
  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Completed
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3 mr-1" />
            In Progress
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Not Started
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
      <div>
        <div className="flex items-start justify-between">
          <Link
            to={`/projects/${project.id}`}
            className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-1 flex items-center gap-2"
          >
            <Folder className="w-5 h-5 text-blue-500 shrink-0" />
            {project.name}
          </Link>
          {getStatusBadge(project.status)}
        </div>

        <p className="text-sm text-gray-600 mt-2 line-clamp-2 min-h-[40px]">
          {project.description || 'No description provided.'}
        </p>

        <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
          {project.startDate && (
            <div className="flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1 text-gray-400" />
              <span>Start: {new Date(project.startDate).toLocaleDateString()}</span>
            </div>
          )}
          {project.endDate && (
            <div className="flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1 text-gray-400" />
              <span>End: {new Date(project.endDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500">
          {project._count?.tasks ?? project.tasks?.length ?? 0} tasks
        </span>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(project)}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit Project"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(project.id)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete Project"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
