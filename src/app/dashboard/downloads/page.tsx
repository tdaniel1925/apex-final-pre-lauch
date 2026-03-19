// =============================================
// Downloads Page - Rep Back Office
// Searchable and paginated table of downloadable files
// =============================================

'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Download, Search, FileText, Image as ImageIcon, File } from 'lucide-react';

// Download file structure
interface DownloadFile {
  id: string;
  fileName: string;
  fileType: string;
  purpose: string;
  filePath: string;
  dateAdded: string;
}

// Hardcoded downloads list (will be managed in admin later)
const DOWNLOADS: DownloadFile[] = [
  {
    id: '1',
    fileName: 'General - Apex Flyer.pptx',
    fileType: 'PowerPoint',
    purpose: 'Event invitation flyer for Tuesday/Thursday online events',
    filePath: '/General - Apex Flyer.pptx',
    dateAdded: '2026-03-19',
  },
];

const ITEMS_PER_PAGE = 10;

export default function DownloadsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter downloads based on search query
  const filteredDownloads = useMemo(() => {
    if (!searchQuery.trim()) return DOWNLOADS;

    const query = searchQuery.toLowerCase();
    return DOWNLOADS.filter(
      (download) =>
        download.fileName.toLowerCase().includes(query) ||
        download.fileType.toLowerCase().includes(query) ||
        download.purpose.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Paginate filtered results
  const totalPages = Math.ceil(filteredDownloads.length / ITEMS_PER_PAGE);
  const paginatedDownloads = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredDownloads.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredDownloads, currentPage]);

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
                {paginatedDownloads.length > 0 ? (
                  paginatedDownloads.map((download) => (
                    <tr key={download.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {getFileIcon(download.fileType)}
                          <span className="text-sm font-medium text-slate-900">
                            {download.fileName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">{download.fileType}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">{download.purpose}</span>
                      </td>
                      <td className="px-6 py-4">
                        <a
                          href={download.filePath}
                          download
                          className="inline-flex items-center gap-2 px-4 py-2 bg-[#2B4C7E] text-white text-sm font-medium rounded-lg hover:bg-[#1a2c4e] transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </a>
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
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">
                  Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to{' '}
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredDownloads.length)} of{' '}
                  {filteredDownloads.length} downloads
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 border rounded-md text-sm font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-[#2B4C7E] text-white border-[#2B4C7E]'
                          : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
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
