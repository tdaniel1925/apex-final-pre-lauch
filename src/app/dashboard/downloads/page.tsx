// =============================================
// Downloads Page - Rep Back Office
// Searchable and paginated table of downloadable files
// =============================================

'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Download, Search, FileText, Image as ImageIcon, File, Loader2 } from 'lucide-react';

// Download file structure
interface DownloadFile {
  id: string;
  file_name: string;
  file_type: string;
  purpose: string;
  file_url: string;
  category: string;
  created_at: string;
}

interface PaginationData {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

const ITEMS_PER_PAGE = 10;

export default function DownloadsPage() {
  const [downloads, setDownloads] = useState<DownloadFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    pageSize: ITEMS_PER_PAGE,
    total: 0,
    totalPages: 0,
  });

  // Fetch downloads from API
  useEffect(() => {
    fetchDownloads();
  }, [currentPage, searchQuery]);

  const fetchDownloads = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: ITEMS_PER_PAGE.toString(),
      });

      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      const response = await fetch(`/api/dashboard/downloads?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch downloads');
      }

      const data = await response.json();
      setDownloads(data.downloads || []);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching downloads:', err);
      setError('Failed to load downloads. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Track download
  const handleDownload = async (download: DownloadFile) => {
    try {
      // Track download in background
      fetch(`/api/dashboard/downloads/${download.id}/track`, {
        method: 'POST',
      }).catch((err) => console.error('Error tracking download:', err));

      // Trigger browser download
      const link = document.createElement('a');
      link.href = download.file_url;
      link.download = download.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error downloading file:', err);
    }
  };

  // Reset to page 1 when search changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  // Get file icon based on type
  const getFileIcon = (fileType: string) => {
    if (fileType.toLowerCase().includes('powerpoint') || fileType.toLowerCase().includes('pptx')) {
      return <FileText className="w-5 h-5 text-orange-600" />;
    }
    if (fileType.toLowerCase().includes('image') || fileType.toLowerCase().includes('png') || fileType.toLowerCase().includes('jpg')) {
      return <ImageIcon className="w-5 h-5 text-blue-600" />;
    }
    return <File className="w-5 h-5 text-slate-600" />;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Downloads</h1>
          <p className="text-slate-600 mt-1">
            Marketing materials, flyers, and resources for your business
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by file name, type, or purpose..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Downloads Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
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
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
                        <p className="text-slate-500">Loading downloads...</p>
                      </div>
                    </td>
                  </tr>
                ) : downloads.length > 0 ? (
                  downloads.map((download) => (
                    <tr key={download.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {getFileIcon(download.file_type)}
                          <span className="text-sm font-medium text-slate-900">
                            {download.file_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">{download.file_type}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">{download.purpose}</span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDownload(download)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-[#2B4C7E] text-white text-sm font-medium rounded-lg hover:bg-[#1a2c4e] transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <File className="w-12 h-12 text-slate-300" />
                        <p className="text-slate-500 font-medium">No downloads found</p>
                        {searchQuery && (
                          <p className="text-sm text-slate-400">
                            Try adjusting your search query
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && !loading && (
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">
                  Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
                  {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
                  {pagination.total} downloads
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    // Show first 2, current page, and last 2
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 border rounded-md text-sm font-medium transition-colors ${
                          currentPage === pageNum
                            ? 'bg-[#2B4C7E] text-white border-[#2B4C7E]'
                            : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                    disabled={currentPage === pagination.totalPages}
                    className="px-3 py-1 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-900 mb-1">Need more resources?</h3>
              <p className="text-sm text-blue-800">
                New marketing materials and resources are added regularly. Check back often or contact support if you need something specific.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
