'use client';

// ============================================================
// Social Content Manager — Admin Interface
// Upload and manage social media content library
// ============================================================

import { useState, useRef } from 'react';
import Image from 'next/image';

interface SocialContent {
  id: string;
  title: string;
  category: 'personal' | 'educational' | 'cta' | 'engagement' | 'testimonial' | 'recruiting';
  image_url: string;
  caption_template: string | null;
  hashtags: string | null;
  best_day: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

const CATEGORIES = [
  { value: 'personal', label: 'Personal Branding' },
  { value: 'educational', label: 'Educational' },
  { value: 'cta', label: 'Call to Action' },
  { value: 'engagement', label: 'Engagement' },
  { value: 'testimonial', label: 'Testimonials' },
  { value: 'recruiting', label: 'Recruiting' },
];

const DAYS = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

export default function SocialContentManager({ initialContent }: { initialContent: SocialContent[] }) {
  const [content, setContent] = useState<SocialContent[]>(initialContent);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>('personal');
  const [imageUrl, setImageUrl] = useState('');
  const [captionTemplate, setCaptionTemplate] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [bestDay, setBestDay] = useState('');
  const [sortOrder, setSortOrder] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/upload-social-content', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setImageUrl(data.url);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !category || !imageUrl) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const body = {
        title,
        category,
        image_url: imageUrl,
        caption_template: captionTemplate || null,
        hashtags: hashtags || null,
        best_day: bestDay || null,
        sort_order: sortOrder,
      };

      const url = editingId
        ? `/api/admin/social-content/${editingId}`
        : '/api/admin/social-content';

      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('Failed to save content');

      const { data } = await response.json();

      if (editingId) {
        setContent(content.map((c) => (c.id === editingId ? data : c)));
      } else {
        setContent([data, ...content]);
      }

      resetForm();
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save content');
    }
  };

  const handleEdit = (item: SocialContent) => {
    setEditingId(item.id);
    setTitle(item.title);
    setCategory(item.category);
    setImageUrl(item.image_url);
    setCaptionTemplate(item.caption_template || '');
    setHashtags(item.hashtags || '');
    setBestDay(item.best_day || '');
    setSortOrder(item.sort_order);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return;

    try {
      const response = await fetch(`/api/admin/social-content/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      setContent(content.filter((c) => c.id !== id));
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete content');
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/social-content/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      const { data } = await response.json();
      setContent(content.map((c) => (c.id === id ? data : c)));
    } catch (error) {
      console.error('Toggle error:', error);
      alert('Failed to update status');
    }
  };

  const resetForm = () => {
    setTitle('');
    setCategory('personal');
    setImageUrl('');
    setCaptionTemplate('');
    setHashtags('');
    setBestDay('');
    setSortOrder(0);
    setEditingId(null);
    setShowForm(false);
  };

  const filteredContent = filterCategory === 'all'
    ? content
    : content.filter((c) => c.category === filterCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Social Media Content Library</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage pre-made graphics and caption templates for distributors
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showForm ? 'Cancel' : '+ Add Content'}
        </button>
      </div>

      {/* Upload Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingId ? 'Edit Content' : 'Add New Content'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image *
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : imageUrl ? 'Change Image' : 'Upload Image'}
              </button>
              {imageUrl && (
                <div className="mt-3 relative w-48 h-48">
                  <Image
                    src={imageUrl}
                    alt="Preview"
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Success Story Post"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Caption Template */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Caption Template
              </label>
              <textarea
                value={captionTemplate}
                onChange={(e) => setCaptionTemplate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="Use {NAME}, {CITY}, {WEBSITE} as placeholders"
              />
              <p className="text-xs text-gray-500 mt-1">
                Placeholders: {'{NAME}'}, {'{CITY}'}, {'{WEBSITE}'}
              </p>
            </div>

            {/* Hashtags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hashtags
              </label>
              <input
                type="text"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="#insurance #financialfreedom #apexaffinity"
              />
            </div>

            {/* Best Day */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Best Day to Post
              </label>
              <select
                value={bestDay}
                onChange={(e) => setBestDay(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">No preference</option>
                {DAYS.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort Order
              </label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min={0}
              />
            </div>

            {/* Submit */}
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingId ? 'Update Content' : 'Add Content'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterCategory('all')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filterCategory === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All ({content.length})
        </button>
        {CATEGORIES.map((cat) => {
          const count = content.filter((c) => c.category === cat.value).length;
          return (
            <button
              key={cat.value}
              onClick={() => setFilterCategory(cat.value)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterCategory === cat.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContent.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="relative w-full h-64">
              <Image
                src={item.image_url}
                alt={item.title}
                fill
                className="object-cover"
              />
              {!item.is_active && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <span className="text-white font-semibold">INACTIVE</span>
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                  {CATEGORIES.find((c) => c.value === item.category)?.label}
                </span>
              </div>
              {item.caption_template && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {item.caption_template}
                </p>
              )}
              {item.best_day && (
                <p className="text-xs text-gray-500 mb-3">
                  Best day: {item.best_day}
                </p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => toggleActive(item.id, item.is_active)}
                  className={`flex-1 px-3 py-2 text-sm rounded transition-colors ${
                    item.is_active
                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {item.is_active ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="px-3 py-2 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredContent.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No content found in this category.</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 text-blue-600 hover:underline"
          >
            Add your first content
          </button>
        </div>
      )}
    </div>
  );
}
