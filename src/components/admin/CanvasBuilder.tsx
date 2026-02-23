'use client';

// =============================================
// Canvas-Based Business Card Template Builder
// Canva-like drag-and-drop designer for admins
// =============================================

import { useState, useRef, useEffect } from 'react';

// Element types
type ElementType = 'text' | 'image';

type FieldType =
  | 'name'
  | 'first_name'
  | 'last_name'
  | 'title'
  | 'email'
  | 'phone_primary'
  | 'phone_secondary'
  | 'website'
  | 'business_address_line1'
  | 'business_address_line2'
  | 'business_city_state_zip'
  | 'tagline'
  | 'qr_code'
  | null; // null = static content

interface CardElement {
  id: string;
  type: ElementType;
  field: FieldType;
  content: string;
  x: number;  // percentage
  y: number;  // percentage
  width: number;
  height: number;
  fontSize?: number;
  fontWeight?: number;
  fontFamily?: string;
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  zIndex: number;
}

interface Template {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  is_default: boolean;
  front_elements: CardElement[];
  back_elements: CardElement[];
  required_fields: string[];
  optional_fields: string[];
}

interface Props {
  templates: Template[];
}

const FIELD_OPTIONS: { value: FieldType; label: string }[] = [
  { value: null, label: 'Static Text' },
  { value: 'name', label: 'Full Name' },
  { value: 'first_name', label: 'First Name' },
  { value: 'last_name', label: 'Last Name' },
  { value: 'title', label: 'Title/Position' },
  { value: 'email', label: 'Email' },
  { value: 'phone_primary', label: 'Phone (Primary)' },
  { value: 'phone_secondary', label: 'Phone (Secondary)' },
  { value: 'website', label: 'Website' },
  { value: 'business_address_line1', label: 'Address Line 1' },
  { value: 'business_address_line2', label: 'Address Line 2' },
  { value: 'business_city_state_zip', label: 'City, State ZIP' },
  { value: 'tagline', label: 'Tagline/Motto' },
];

export default function CanvasBuilder({ templates }: Props) {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(templates[0] || null);
  const [side, setSide] = useState<'front' | 'back'>('front');
  const [elements, setElements] = useState<CardElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [saving, setSaving] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Load elements when template or side changes
  useEffect(() => {
    if (!selectedTemplate) return;
    const currentElements = side === 'front'
      ? selectedTemplate.front_elements
      : selectedTemplate.back_elements;
    setElements(currentElements || []);
    setSelectedElement(null);
  }, [selectedTemplate, side]);

  // Add text element
  const addText = () => {
    const newElement: CardElement = {
      id: `elem_${Date.now()}`,
      type: 'text',
      field: null,
      content: 'Double-click to edit',
      x: 50,
      y: 50,
      width: 200,
      height: 40,
      fontSize: 16,
      fontWeight: 400,
      fontFamily: 'Inter',
      color: '#000000',
      textAlign: 'center',
      zIndex: elements.length,
    };
    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
  };

  // Add image element
  const addImage = async () => {
    // Create file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png,image/jpeg,image/jpg,image/svg+xml';

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // Check file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        alert('File too large. Maximum size is 10MB');
        return;
      }

      // Upload file
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/admin/upload-template-asset', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const { url } = await response.json();

        const newElement: CardElement = {
          id: `elem_${Date.now()}`,
          type: 'image',
          field: null,
          content: url,
          x: 50,
          y: 50,
          width: 100,
          height: 100,
          zIndex: elements.length,
        };
        setElements([...elements, newElement]);
        setSelectedElement(newElement.id);
      } catch (error) {
        console.error('Upload error:', error);
        alert('Failed to upload image');
      }
    };

    input.click();
  };

  // Update element property
  const updateElement = (id: string, updates: Partial<CardElement>) => {
    setElements(elements.map(el =>
      el.id === id ? { ...el, ...updates } : el
    ));
  };

  // Delete element
  const deleteElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id));
    if (selectedElement === id) setSelectedElement(null);
  };

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const elementX = (element.x / 100) * rect.width;
    const elementY = (element.y / 100) * rect.height;

    setDragging(elementId);
    setSelectedElement(elementId);
    setDragOffset({
      x: e.clientX - rect.left - elementX,
      y: e.clientY - rect.top - elementY,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left - dragOffset.x) / rect.width) * 100;
    const y = ((e.clientY - rect.top - dragOffset.y) / rect.height) * 100;

    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));

    updateElement(dragging, { x: clampedX, y: clampedY });
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  // Save template
  const saveTemplate = async () => {
    if (!selectedTemplate) return;

    setSaving(true);
    try {
      const updateData = side === 'front'
        ? { front_elements: elements }
        : { back_elements: elements };

      const response = await fetch(`/api/admin/business-card-templates/${selectedTemplate.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        alert('Template saved successfully!');
      } else {
        alert('Failed to save template');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Error saving template');
    } finally {
      setSaving(false);
    }
  };

  const selected = elements.find(el => el.id === selectedElement);

  return (
    <div className="grid lg:grid-cols-4 gap-6">
      {/* Left: Template List */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="font-bold text-gray-900 mb-4">Templates</h2>
          <div className="space-y-2">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  selectedTemplate?.id === template.id
                    ? 'bg-blue-50 border-blue-500'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className="font-semibold text-gray-900">{template.name}</div>
                <div className="text-xs text-gray-500 mt-1">{template.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mt-4">
          <h3 className="font-bold text-gray-900 mb-4">Add Elements</h3>
          <div className="space-y-2">
            <button
              onClick={addText}
              className="w-full flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
              Add Text
            </button>
            <button
              onClick={addImage}
              className="w-full flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Add Image
            </button>
          </div>
        </div>
      </div>

      {/* Center: Canvas */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          {/* Controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              <button
                onClick={() => setSide('front')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  side === 'front'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Front
              </button>
              <button
                onClick={() => setSide('back')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  side === 'back'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Back
              </button>
            </div>
            <button
              onClick={saveTemplate}
              disabled={saving}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400"
            >
              {saving ? 'Saving...' : 'Save Template'}
            </button>
          </div>

          {/* Canvas */}
          <div
            ref={canvasRef}
            className="relative bg-gray-100 border-2 border-gray-300 rounded-lg mx-auto cursor-crosshair"
            style={{
              width: '700px',
              height: '400px',
              backgroundImage: 'linear-gradient(#e0e0e0 1px, transparent 1px), linear-gradient(90deg, #e0e0e0 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={() => setSelectedElement(null)}
          >
            {elements.map((element) => (
              <div
                key={element.id}
                className={`absolute cursor-move ${
                  selectedElement === element.id ? 'ring-2 ring-blue-500' : ''
                }`}
                style={{
                  left: `${element.x}%`,
                  top: `${element.y}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: element.zIndex,
                }}
                onMouseDown={(e) => handleMouseDown(e, element.id)}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedElement(element.id);
                }}
              >
                {element.type === 'text' && (
                  <div
                    style={{
                      fontSize: `${element.fontSize}px`,
                      fontWeight: element.fontWeight,
                      fontFamily: element.fontFamily,
                      color: element.color,
                      textAlign: element.textAlign,
                      padding: '4px 8px',
                      backgroundColor: selectedElement === element.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                      minWidth: `${element.width}px`,
                      minHeight: `${element.height}px`,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {element.content}
                  </div>
                )}
                {element.type === 'image' && (
                  <img
                    src={element.content}
                    alt="Element"
                    style={{
                      width: `${element.width}px`,
                      height: `${element.height}px`,
                      objectFit: 'contain',
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-500 mt-2 text-center">
            Click and drag elements to position. Click element to select and edit properties.
          </p>
        </div>
      </div>

      {/* Right: Properties */}
      <div className="lg:col-span-1">
        {selected ? (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Properties</h3>
              <button
                onClick={() => deleteElement(selected.id)}
                className="text-red-600 hover:text-red-700 text-sm font-semibold"
              >
                Delete
              </button>
            </div>

            <div className="space-y-4">
              {/* Field Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Field Type
                </label>
                <select
                  value={selected.field || ''}
                  onChange={(e) => updateElement(selected.id, {
                    field: (e.target.value || null) as FieldType
                  })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  {FIELD_OPTIONS.map(opt => (
                    <option key={opt.label} value={opt.value || ''}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {selected.field ? 'Dynamic field - content from user' : 'Static content'}
                </p>
              </div>

              {/* Content */}
              {selected.type === 'text' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content {selected.field && '(Placeholder)'}
                  </label>
                  <textarea
                    value={selected.content}
                    onChange={(e) => updateElement(selected.id, { content: e.target.value })}
                    rows={2}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              )}

              {selected.type === 'image' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={selected.content}
                    onChange={(e) => updateElement(selected.id, { content: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              )}

              {/* Text Properties */}
              {selected.type === 'text' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Font Size
                    </label>
                    <input
                      type="number"
                      value={selected.fontSize}
                      onChange={(e) => updateElement(selected.id, { fontSize: parseInt(e.target.value) })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Font Weight
                    </label>
                    <select
                      value={selected.fontWeight}
                      onChange={(e) => updateElement(selected.id, { fontWeight: parseInt(e.target.value) })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value={400}>Regular</option>
                      <option value={500}>Medium</option>
                      <option value={600}>Semi-Bold</option>
                      <option value={700}>Bold</option>
                      <option value={800}>Extra Bold</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={selected.color}
                        onChange={(e) => updateElement(selected.id, { color: e.target.value })}
                        className="w-12 h-10 rounded border border-gray-300"
                      />
                      <input
                        type="text"
                        value={selected.color}
                        onChange={(e) => updateElement(selected.id, { color: e.target.value })}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Text Align
                    </label>
                    <select
                      value={selected.textAlign}
                      onChange={(e) => updateElement(selected.id, { textAlign: e.target.value as any })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                </>
              )}

              {/* Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Width (px)
                </label>
                <input
                  type="number"
                  value={selected.width}
                  onChange={(e) => updateElement(selected.id, { width: parseInt(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Height (px)
                </label>
                <input
                  type="number"
                  value={selected.height}
                  onChange={(e) => updateElement(selected.id, { height: parseInt(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              {/* Position */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    X (%)
                  </label>
                  <input
                    type="number"
                    value={selected.x.toFixed(1)}
                    onChange={(e) => updateElement(selected.id, { x: parseFloat(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Y (%)
                  </label>
                  <input
                    type="number"
                    value={selected.y.toFixed(1)}
                    onChange={(e) => updateElement(selected.id, { y: parseFloat(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-8 text-center">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
            <p className="text-gray-600">Select an element to edit its properties</p>
          </div>
        )}
      </div>
    </div>
  );
}
