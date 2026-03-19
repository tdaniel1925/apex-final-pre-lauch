// =============================================
// Admin Downloads Management
// Add, edit, and delete downloadable files for distributors
// =============================================

'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2, Download, X } from 'lucide-react';

// Download file structure
interface DownloadFile {
  id: string;
  fileName: string;
  fileType: string;
  purpose: string;
  filePath: string;
  dateAdded: string;
}

// Hardcoded downloads list (matching rep page)
const INITIAL_DOWNLOADS: DownloadFile[] = [
  {
    id: '1',
    fileName: 'General - Apex Flyer.pptx',
    fileType: 'PowerPoint',
    purpose: 'Event invitation flyer for Tuesday/Thursday online events',
    filePath: '/General - Apex Flyer.pptx',
    dateAdded: '2026-03-19',
  },
];

export default function AdminDownloadsPage() {
  const [downloads, setDownloads] = useState<DownloadFile[]>(INITIAL_DOWNLOADS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDownload, setEditingDownload] = useState<DownloadFile | null>(null);
  const [formData, setFormData] = useState({
    fileName: '',
    fileType: '',
    purpose: '',
    filePath: '',
  });

  const handleAdd = () => {
    setFormData({ fileName: '', fileType: '', purpose: '', filePath: '' });
    setEditingDownload(null);
    setShowAddModal(true);
  };

  const handleEdit = (download: DownloadFile) => {
    setFormData({
      fileName: download.fileName,
      fileType: download.fileType,
      purpose: download.purpose,
      filePath: download.filePath,
    });
    setEditingDownload(download);
    setShowAddModal(true);
  };

  const handleSave = () => {
    if (!formData.fileName || !formData.fileType || !formData.purpose || !formData.filePath) {
      alert('Please fill in all fields');
      return;
    }

    if (editingDownload) {
      // Update existing
      setDownloads(
        downloads.map((d) =>
          d.id === editingDownload.id
            ? { ...d, ...formData }
            : d
        )
      );
    } else {
      // Add new
      const newDownload: DownloadFile = {
        id: String(Date.now()),
        ...formData,
        dateAdded: new Date().toISOString().split('T')[0],
      };
      setDownloads([...downloads, newDownload]);
    }

    setShowAddModal(false);
    setFormData({ fileName: '', fileType: '', purpose: '', filePath: '' });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this download?')) {
      setDownloads(downloads.filter((d) => d.id !== id));
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Downloads Management</h1>
            <p className="text-slate-600 mt-1">
              Manage downloadable files for distributors
            </p>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-[#2B4C7E] text-white rounded-lg hover:bg-[#1a2c4e] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Download
          </button>
        </div>

        {/* Info Box */}
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-yellow-900 mb-1">Note: Changes are temporary</h3>
              <p className="text-sm text-yellow-800">
                Currently, downloads are hardcoded in the page component. To make changes permanent, you'll need to update the code in both <code>src/app/dashboard/downloads/page.tsx</code> and <code>src/app/admin/downloads/page.tsx</code>. Future versions will use a database.
              </p>
            </div>
          </div>
        </div>

        {/* Downloads Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  File Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  File Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Purpose
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Date Added
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {downloads.length > 0 ? (
                downloads.map((download) => (
                  <tr key={download.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      {download.fileName}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {download.fileType}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {download.purpose}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(download.dateAdded).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(download)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(download.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <a
                          href={download.filePath}
                          download
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No downloads added yet. Click "Add Download" to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">
                {editingDownload ? 'Edit Download' : 'Add New Download'}
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* File Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  File Name *
                </label>
                <input
                  type="text"
                  value={formData.fileName}
                  onChange={(e) => setFormData({ ...formData, fileName: e.target.value })}
                  placeholder="e.g., General - Apex Flyer.pptx"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent"
                />
              </div>

              {/* File Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  File Type *
                </label>
                <input
                  type="text"
                  value={formData.fileType}
                  onChange={(e) => setFormData({ ...formData, fileType: e.target.value })}
                  placeholder="e.g., PowerPoint, PDF, Image"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent"
                />
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Purpose *
                </label>
                <textarea
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  placeholder="e.g., Event invitation flyer for Tuesday/Thursday online events"
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent"
                />
              </div>

              {/* File Path */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  File Path *
                </label>
                <input
                  type="text"
                  value={formData.filePath}
                  onChange={(e) => setFormData({ ...formData, filePath: e.target.value })}
                  placeholder="/path/to/file.ext or full URL"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Enter the path to the file in the public folder (e.g., /General - Apex Flyer.pptx) or a full URL
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-[#2B4C7E] text-white rounded-lg hover:bg-[#1a2c4e] transition-colors"
              >
                {editingDownload ? 'Update' : 'Add'} Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
