'use client';

import Link from 'next/link';
import { CheckSquare, Plus, Clock, AlertCircle } from 'lucide-react';

interface TasksContentProps {
  tasks: any[];
}

export default function TasksContent({ tasks }: TasksContentProps) {
  // Filter tasks
  const pendingTasks = tasks.filter((t: any) => t.status === 'pending' || t.status === 'in_progress');
  const completedTasks = tasks.filter((t: any) => t.status === 'completed');

  const now = new Date();
  const overdueTasks = pendingTasks.filter((t: any) => t.due_date && new Date(t.due_date) < now);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Tasks</h2>
          <p className="text-slate-600">Manage your tasks and to-dos</p>
        </div>
        <Link
          href="/dashboard/crm/tasks/new"
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Create Task
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{pendingTasks.length}</div>
              <div className="text-sm text-slate-600">Pending Tasks</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{overdueTasks.length}</div>
              <div className="text-sm text-slate-600">Overdue</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckSquare className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{completedTasks.length}</div>
              <div className="text-sm text-slate-600">Completed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <CheckSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No tasks yet</h3>
          <p className="text-slate-600 mb-6">Create your first task to get started</p>
          <Link
            href="/dashboard/crm/tasks/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Create Task
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pending Tasks */}
          {pendingTasks.length > 0 && (
            <div className="bg-white rounded-lg border border-slate-200">
              <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Pending Tasks</h3>
              </div>
              <div className="divide-y divide-slate-200">
                {pendingTasks.map((task: any) => {
                  const isOverdue = task.due_date && new Date(task.due_date) < now;
                  return (
                    <Link
                      key={task.id}
                      href={`/dashboard/crm/tasks/${task.id}`}
                      className="block px-6 py-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="text-base font-medium text-slate-900 mb-1">
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-sm text-slate-600 mb-2 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span className={`px-2 py-1 rounded ${task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {task.status === 'in_progress' ? 'In Progress' : 'Pending'}
                            </span>
                            {task.due_date && (
                              <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                                {isOverdue && <AlertCircle className="w-3 h-3 inline mr-1" />}
                                Due: {new Date(task.due_date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <div className="bg-white rounded-lg border border-slate-200">
              <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Completed Tasks</h3>
              </div>
              <div className="divide-y divide-slate-200">
                {completedTasks.map((task: any) => (
                  <Link
                    key={task.id}
                    href={`/dashboard/crm/tasks/${task.id}`}
                    className="block px-6 py-4 hover:bg-slate-50 transition-colors opacity-60"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-base font-medium text-slate-900 mb-1 line-through">
                          {task.title}
                        </h4>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="px-2 py-1 rounded bg-green-100 text-green-700">
                            Completed
                          </span>
                          {task.completed_at && (
                            <span>
                              {new Date(task.completed_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
