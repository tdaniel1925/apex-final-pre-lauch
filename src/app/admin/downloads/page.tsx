// =============================================
// Admin Downloads Management
// Add, edit, and delete downloadable files for distributors
// =============================================

'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Download, X, Loader2, CheckCircle } from 'lucide-react';

// Download file structure
interface DownloadFile {
  id: string;
  file_name: string;
  file_type: string;
  purpose: string;
  file_url: string;
  file_size_bytes?: number;
  mime_type?: string;
  category: string;
  is_active: boolean;
  download_count: number;
  view_count: number;
  created_at: string;
}

interface PaginationData {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export default function AdminDownloadsPage() {
  const [downloads, setDownloads] = useState<DownloadFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDownload, setEditingDownload] = useState<DownloadFile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    pageSize: 50,
    total: 0,
    totalPages: 0,
  });
  const [formData, setFormData] = useState({
    file_name: '',
    file_type: '',
    purpose: '',
    file_url: '',
    category: 'general',
    is_active: true,
  });

  // Fetch downloads
  useEffect(() => {
    fetchDownloads();
  }, [currentPage, searchQuery]);

  const fetchDownloads = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: '50',
        status: 'all',
      });

      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      const response = await fetch(`/api/admin/downloads?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch downloads');
      }

      const data = await response.json();
      setDownloads(data.downloads || []);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching downloads:', err);
      setError('Failed to load downloads');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData({
      file_name: '',
      file_type: '',
      purpose: '',
      file_url: '',
      category: 'general',
      is_active: true,
    });
    setEditingDownload(null);
    setShowAddModal(true);
  };

  const handleEdit = (download: DownloadFile) => {
    setFormData({
      file_name: download.file_name,
      file_type: download.file_type,
      purpose: download.purpose,
      file_url: download.file_url,
      category: download.category,
      is_active: download.is_active,
    });
    setEditingDownload(download);
    setShowAddModal(true);
  };

  const handleSave = async () => {
    if (!formData.file_name || !formData.file_type || !formData.purpose || !formData.file_url) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      let response;
      if (editingDownload) {
        // Update existing
        response = await fetch(`/api/admin/downloads/${editingDownload.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        // Create new
        response = await fetch('/api/admin/downloads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save download');
      }

      setSuccess(editingDownload ? 'Download updated successfully' : 'Download created successfully');
      setShowAddModal(false);
      setFormData({
        file_name: '',
        file_type: '',
        purpose: '',
        file_url: '',
        category: 'general',
        is_active: true,
      });

      // Refresh list
      await fetchDownloads();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error saving download:', err);
      setError(err.message || 'Failed to save download');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this download? This action cannot be undone.')) {
      return;
    }

    try {
      setError(null);
      const response = await fetch(`/api/admin/downloads/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete download');
      }

      setSuccess('Download deleted successfully');
      await fetchDownloads();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error deleting download:', err);
      setError(err.message || 'Failed to delete download');
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

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-sm text-green-800">{success}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search downloads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent"
          />
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
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Downloads
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
                      <p className="text-slate-500">Loading downloads...</p>
                    </div>
                  </td>
                </tr>
              ) : downloads.length > 0 ? (
                downloads.map((download) => (
                  <tr key={download.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      {download.file_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {download.file_type}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs">
                        {download.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {download.is_active ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {download.download_count || 0}
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
                          href={download.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                          title="Preview"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No downloads found. Click "Add Download" to get started.
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
          <div className="bg-white rounded-lg max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white">
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
                  value={formData.file_name}
                  onChange={(e) => setFormData({ ...formData, file_name: e.target.value })}
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
                  value={formData.file_type}
                  onChange={(e) => setFormData({ ...formData, file_type: e.target.value })}
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

              {/* File URL */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  File URL *
                </label>
                <input
                  type="text"
                  value={formData.file_url}
                  onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                  placeholder="/path/to/file.ext or full URL"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Enter the path to the file in the public folder (e.g., /General - Apex Flyer.pptx) or a full URL
                </p>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent"
                >
                  <option value="general">General</option>
                  <option value="marketing">Marketing</option>
                  <option value="training">Training</option>
                  <option value="compliance">Compliance</option>
                  <option value="forms">Forms</option>
                </select>
              </div>

              {/* Active Status */}
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-[#2B4C7E] border-slate-300 rounded focus:ring-[#2B4C7E]"
                  />
                  <span className="text-sm font-medium text-slate-700">Active (visible to distributors)</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
              <button
                onClick={() => setShowAddModal(false)}
                disabled={saving}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-[#2B4C7E] text-white rounded-lg hover:bg-[#1a2c4e] transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingDownload ? 'Update' : 'Add'} Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
