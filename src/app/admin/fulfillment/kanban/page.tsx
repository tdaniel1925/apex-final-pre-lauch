'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Filter, ChevronLeft } from 'lucide-react';

const STAGE_LABELS: Record<string, string> = {
  service_payment_made: 'Payment Made',
  onboarding_date_set: 'Onboarding Scheduled',
  onboarding_complete: 'Onboarding Complete',
  pages_being_built: 'Building Pages',
  social_media_proofs: 'Creating Proofs',
  content_approved: 'Content Approved',
  campaigns_launched: 'Campaigns Live',
  service_completed: 'Completed',
};

const STAGES = Object.keys(STAGE_LABELS);

interface FulfillmentCard {
  id: string;
  client_name: string;
  client_email: string;
  product_slug: string;
  stage: string;
  moved_to_current_stage_at: string;
  distributor: {
    id: string;
    first_name: string;
    last_name: string;
  };
  onboarding?: {
    onboarding_date?: string;
  };
}

interface KanbanData {
  [key: string]: FulfillmentCard[];
}

export default function FulfillmentKanbanPage() {
  const [kanbanData, setKanbanData] = useState<KanbanData>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [selectedDistributor, setSelectedDistributor] = useState('all');
  const [selectedCard, setSelectedCard] = useState<FulfillmentCard | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadKanbanData();
  }, []);

  async function loadKanbanData() {
    try {
      const response = await fetch('/api/fulfillment/kanban');
      if (!response.ok) throw new Error('Failed to load kanban data');
      const data = await response.json();
      setKanbanData(data);
    } catch (error) {
      console.error('Error loading kanban data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDrop(cardId: string, newStage: string) {
    try {
      const response = await fetch('/api/fulfillment/update-stage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fulfillment_id: cardId,
          new_stage: newStage,
        }),
      });

      if (!response.ok) throw new Error('Failed to update stage');

      // Reload data
      await loadKanbanData();
    } catch (error) {
      console.error('Error updating stage:', error);
      alert('Failed to update stage. Please try again.');
    }
  }

  function handleDragStart(e: React.DragEvent, cardId: string) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('cardId', cardId);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function handleDropOnColumn(e: React.DragEvent, stage: string) {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('cardId');
    if (cardId) {
      handleDrop(cardId, stage);
    }
  }

  function openCardModal(card: FulfillmentCard) {
    setSelectedCard(card);
    setShowModal(true);
  }

  function getCardAgeColor(movedAt: string): string {
    const daysAgo = Math.floor(
      (Date.now() - new Date(movedAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysAgo < 3) return 'border-l-green-500';
    if (daysAgo < 7) return 'border-l-yellow-500';
    return 'border-l-red-500';
  }

  function formatProductName(slug: string): string {
    return slug
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }

  // Filter cards based on search and filters
  function filterCards(cards: FulfillmentCard[]): FulfillmentCard[] {
    return cards.filter((card) => {
      const matchesSearch =
        searchQuery === '' ||
        card.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.client_email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesProduct =
        selectedProduct === 'all' || card.product_slug === selectedProduct;

      const matchesDistributor =
        selectedDistributor === 'all' ||
        card.distributor.id === selectedDistributor;

      return matchesSearch && matchesProduct && matchesDistributor;
    });
  }

  // Get unique products for filter
  const products = Array.from(
    new Set(
      Object.values(kanbanData)
        .flat()
        .map((card) => card.product_slug)
    )
  );

  // Get unique distributors for filter
  const distributors = Array.from(
    new Set(
      Object.values(kanbanData)
        .flat()
        .map((card) => card.distributor)
    )
  ).reduce((acc, dist) => {
    if (!acc.find((d) => d.id === dist.id)) {
      acc.push(dist);
    }
    return acc;
  }, [] as Array<{ id: string; first_name: string; last_name: string }>);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading fulfillment board...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Link
                href="/admin"
                className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-2"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Admin
              </Link>
              <h1 className="text-3xl font-bold text-slate-900">
                Fulfillment Kanban Board
              </h1>
              <p className="text-slate-600 mt-1">
                Track client progress through the 8-stage fulfillment pipeline
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by client name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Product Filter */}
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Products</option>
              {products.map((product) => (
                <option key={product} value={product}>
                  {formatProductName(product)}
                </option>
              ))}
            </select>

            {/* Distributor Filter */}
            <select
              value={selectedDistributor}
              onChange={(e) => setSelectedDistributor(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Reps</option>
              {distributors.map((dist) => (
                <option key={dist.id} value={dist.id}>
                  {dist.first_name} {dist.last_name}
                </option>
              ))}
            </select>

            {/* Refresh Button */}
            <button
              onClick={loadKanbanData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="p-8">
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map((stage) => {
            const cards = filterCards(kanbanData[stage] || []);
            const cardCount = cards.length;

            return (
              <div
                key={stage}
                className="flex-shrink-0 w-80"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropOnColumn(e, stage)}
              >
                {/* Column Header */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900">
                      {STAGE_LABELS[stage]}
                    </h3>
                    <span className="bg-slate-100 text-slate-700 text-sm font-medium px-2 py-1 rounded">
                      {cardCount}
                    </span>
                  </div>
                </div>

                {/* Cards */}
                <div className="space-y-3 min-h-[200px]">
                  {cards.map((card) => (
                    <div
                      key={card.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, card.id)}
                      onClick={() => openCardModal(card)}
                      className={`bg-white rounded-lg shadow-sm border-l-4 ${getCardAgeColor(
                        card.moved_to_current_stage_at
                      )} border-r border-t border-b border-slate-200 p-4 cursor-move hover:shadow-md transition-shadow`}
                    >
                      <h4 className="font-semibold text-slate-900 mb-1">
                        {card.client_name}
                      </h4>
                      <p className="text-sm text-slate-600 mb-2">
                        {formatProductName(card.product_slug)}
                      </p>
                      <p className="text-xs text-slate-500 mb-2">
                        Rep: {card.distributor.first_name}{' '}
                        {card.distributor.last_name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(
                          card.moved_to_current_stage_at
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Card Detail Modal */}
      {showModal && selectedCard && (
        <CardDetailModal
          card={selectedCard}
          onClose={() => {
            setShowModal(false);
            setSelectedCard(null);
          }}
          onUpdate={loadKanbanData}
        />
      )}
    </div>
  );
}

// Card Detail Modal Component
function CardDetailModal({
  card,
  onClose,
  onUpdate,
}: {
  card: FulfillmentCard;
  onClose: () => void;
  onUpdate: () => void;
}) {
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  async function moveToNextStage() {
    const stageIndex = STAGES.indexOf(card.stage);
    if (stageIndex === -1 || stageIndex === STAGES.length - 1) {
      alert('Already at the final stage');
      return;
    }

    const nextStage = STAGES[stageIndex + 1];

    setSaving(true);
    try {
      const response = await fetch('/api/fulfillment/update-stage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fulfillment_id: card.id,
          new_stage: nextStage,
          notes: notes || undefined,
        }),
      });

      if (!response.ok) throw new Error('Failed to update stage');

      await onUpdate();
      onClose();
    } catch (error) {
      console.error('Error moving to next stage:', error);
      alert('Failed to update stage. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-slate-800 text-white p-6 rounded-t-lg">
          <h2 className="text-2xl font-bold">{card.client_name}</h2>
          <p className="text-slate-300 mt-1">
            {card.product_slug
              .replace(/-/g, ' ')
              .replace(/\b\w/g, (l) => l.toUpperCase())}
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Client Info */}
          <div className="bg-slate-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-slate-900 mb-3">
              Client Information
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600">Email:</span>
                <span className="text-slate-900">{card.client_email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Rep:</span>
                <span className="text-slate-900">
                  {card.distributor.first_name} {card.distributor.last_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Current Stage:</span>
                <span className="font-semibold text-blue-600">
                  {STAGE_LABELS[card.stage]}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Last Updated:</span>
                <span className="text-slate-900">
                  {new Date(card.moved_to_current_stage_at).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Add Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this stage change..."
              rows={4}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={moveToNextStage}
              disabled={saving || card.stage === 'service_completed'}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors font-semibold"
            >
              {saving
                ? 'Moving...'
                : card.stage === 'service_completed'
                ? 'Already Completed'
                : 'Move to Next Stage'}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
