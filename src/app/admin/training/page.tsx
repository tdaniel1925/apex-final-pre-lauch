'use client';

/**
 * Admin Training Manager
 * Upload and manage training materials that the AI will use
 * AI automatically learns from this content
 */

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration_minutes: number;
  content: any;
  is_active: boolean;
  created_at: string;
}

export default function AdminTrainingManager() {
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'sales',
    difficulty: 'beginner',
    duration_minutes: 15,
    content_text: '', // Plain text or markdown that AI will learn
    quiz_questions: [
      { question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }
    ]
  });

  useEffect(() => {
    loadModules();
  }, []);

  async function loadModules() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('training_modules')
      .select('*')
      .order('order_index', { ascending: true });

    if (data) {
      setModules(data);
    }
    setIsLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();

    // Convert plain text content into structured format
    const contentObject = {
      sections: [
        {
          title: formData.title,
          content: formData.content_text,
          keyPoints: formData.content_text
            .split('\n')
            .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'))
            .map(line => line.replace(/^[-•]\s*/, '').trim())
        }
      ],
      quiz: formData.quiz_questions.map(q => ({
        question: q.question,
        options: q.options.filter(opt => opt.trim() !== ''),
        correctAnswer: q.correctAnswer,
        explanation: q.explanation
      }))
    };

    const { error } = await supabase
      .from('training_modules')
      .insert({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        difficulty: formData.difficulty,
        duration_minutes: formData.duration_minutes,
        content_type: 'interactive',
        content: contentObject,
        is_active: true
      });

    if (!error) {
      alert('✅ Training module added! AI has learned this material.');
      setShowAddModal(false);
      loadModules();
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: 'sales',
        difficulty: 'beginner',
        duration_minutes: 15,
        content_text: '',
        quiz_questions: [
          { question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }
        ]
      });
    } else {
      alert('Error adding module: ' + error.message);
    }
  }

  async function toggleActive(id: string, currentStatus: boolean) {
    const supabase = createClient();
    const { error } = await supabase
      .from('training_modules')
      .update({ is_active: !currentStatus })
      .eq('id', id);

    if (!error) {
      loadModules();
    }
  }

  function addQuizQuestion() {
    setFormData({
      ...formData,
      quiz_questions: [
        ...formData.quiz_questions,
        { question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }
      ]
    });
  }

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Training Manager</h1>
            <p className="text-gray-600 mt-2">Upload materials and the AI will automatically learn them</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-[#2c5aa0] to-[#1a4075] text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Training Module
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-[#2c5aa0]">{modules.length}</div>
            <div className="text-sm text-gray-600 mt-1">Total Modules</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-green-600">{modules.filter(m => m.is_active).length}</div>
            <div className="text-sm text-gray-600 mt-1">Active Modules</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-blue-600">{modules.filter(m => m.category === 'sales').length}</div>
            <div className="text-sm text-gray-600 mt-1">Sales Training</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-purple-600">{modules.filter(m => m.category === 'prospecting').length}</div>
            <div className="text-sm text-gray-600 mt-1">Prospecting</div>
          </div>
        </div>

        {/* Modules List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-bold text-gray-900">Training Modules (AI Knowledge Base)</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {modules.map((module) => (
              <div key={module.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-gray-900 text-lg">{module.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        module.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {module.is_active ? '✓ Active - AI Knows This' : 'Inactive'}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        {module.category}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                        {module.difficulty}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{module.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>⏱️ {module.duration_minutes} minutes</span>
                      <span>📝 {module.content?.quiz?.length || 0} quiz questions</span>
                      <span>📚 {module.content?.sections?.length || 0} sections</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleActive(module.id, module.is_active)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        module.is_active
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {module.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Module Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#2c5aa0] to-[#1a4075]">
              <h2 className="text-xl font-bold text-white">Add Training Module</h2>
              <p className="text-white/80 text-sm mt-1">The AI will learn this material and teach it to distributors</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2c5aa0] focus:border-transparent"
                    placeholder="e.g., Advanced Closing Techniques"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <input
                    type="text"
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2c5aa0] focus:border-transparent"
                    placeholder="Brief description of what this training covers"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2c5aa0]"
                    >
                      <option value="sales">Sales</option>
                      <option value="prospecting">Prospecting</option>
                      <option value="leadership">Leadership</option>
                      <option value="product">Product Knowledge</option>
                      <option value="compliance">Compliance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2c5aa0]"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration (mins)</label>
                    <input
                      type="number"
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2c5aa0]"
                      min="5"
                      max="120"
                    />
                  </div>
                </div>
              </div>

              {/* Training Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Training Content (What the AI will teach)
                </label>
                <textarea
                  required
                  value={formData.content_text}
                  onChange={(e) => setFormData({ ...formData, content_text: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2c5aa0] focus:border-transparent font-mono text-sm"
                  rows={10}
                  placeholder="Enter your training content here. The AI will learn this and teach it to distributors.

Use bullet points for key points:
- First key point
- Second key point
- Third key point

You can use markdown formatting."
                />
                <p className="text-xs text-gray-500 mt-2">💡 Tip: Use bullet points (- or •) for key takeaways. The AI will extract and remember them.</p>
              </div>

              {/* Quiz Questions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Quiz Questions (Optional)</label>
                {formData.quiz_questions.map((q, qIdx) => (
                  <div key={qIdx} className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
                    <div className="mb-3">
                      <input
                        type="text"
                        placeholder="Question text"
                        value={q.question}
                        onChange={(e) => {
                          const newQuestions = [...formData.quiz_questions];
                          newQuestions[qIdx].question = e.target.value;
                          setFormData({ ...formData, quiz_questions: newQuestions });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div className="space-y-2 mb-3">
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${qIdx}`}
                            checked={q.correctAnswer === optIdx}
                            onChange={() => {
                              const newQuestions = [...formData.quiz_questions];
                              newQuestions[qIdx].correctAnswer = optIdx;
                              setFormData({ ...formData, quiz_questions: newQuestions });
                            }}
                            className="text-[#2c5aa0]"
                          />
                          <input
                            type="text"
                            placeholder={`Option ${optIdx + 1}`}
                            value={opt}
                            onChange={(e) => {
                              const newQuestions = [...formData.quiz_questions];
                              newQuestions[qIdx].options[optIdx] = e.target.value;
                              setFormData({ ...formData, quiz_questions: newQuestions });
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Explanation (shown after answer)"
                      value={q.explanation}
                      onChange={(e) => {
                        const newQuestions = [...formData.quiz_questions];
                        newQuestions[qIdx].explanation = e.target.value;
                        setFormData({ ...formData, quiz_questions: newQuestions });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addQuizQuestion}
                  className="px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-[#2c5aa0] hover:text-[#2c5aa0] transition-all w-full"
                >
                  + Add Quiz Question
                </button>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-2 bg-gradient-to-r from-[#2c5aa0] to-[#1a4075] text-white rounded-lg font-medium hover:shadow-lg transition-all"
                >
                  Save & Train AI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
