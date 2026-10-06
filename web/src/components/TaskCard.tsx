import React from 'react';
import { Calendar, Edit2, Trash2, CheckCircle, Clock, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { Task, TaskPriority, TaskStatus } from '../types';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onToggleStatus }) => {
  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'High':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-700">High</span>;
      case 'Medium':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-yellow-100 text-yellow-700">Medium</span>;
      case 'Low':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-700">Low</span>;
    }
  };

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" /> Completed
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3 h-3 mr-1" /> In Progress
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3 h-3 mr-1" /> Pending
          </span>
        );
    }
  };

  const isCompleted = task.status === 'Completed';

  return (
    <div className={`bg-white rounded-xl shadow-sm border p-5 transition-all ${isCompleted ? 'border-gray-200 bg-gray-50/50' : 'border-gray-200 hover:shadow-md'}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <button
            onClick={() => onToggleStatus(task)}
            className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
              isCompleted
                ? 'bg-green-600 border-green-600 text-white'
                : 'border-gray-300 hover:border-blue-500'
            }`}
            title={isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
          >
            {isCompleted && <CheckCircle className="w-4 h-4" />}
          </button>
          <div>
            <h3 className={`font-semibold text-gray-900 ${isCompleted ? 'line-through text-gray-500' : ''}`}>
              {task.name}
            </h3>
            {task.project && (
              <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded inline-block mt-1">
                {task.project.name}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getPriorityBadge(task.priority)}
          {getStatusBadge(task.status)}
        </div>
      </div>

      {task.description && (
        <p className="text-sm text-gray-600 mt-3 pl-8">
          {task.description}
        </p>
      )}

      <div className="mt-4 pl-8 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center">
          {task.dueDate && (
            <span className={`flex items-center ${new Date(task.dueDate) < new Date() && !isCompleted ? 'text-red-600 font-medium' : ''}`}>
              <Calendar className="w-3.5 h-3.5 mr-1" />
              Due: {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(task)}
            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Edit Task"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete Task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
