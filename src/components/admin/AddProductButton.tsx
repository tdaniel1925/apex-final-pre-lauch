'use client';

import { useState } from 'react';
import { AddProductModal } from './AddProductModal';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface AddProductButtonProps {
  categories: Category[];
}

export function AddProductButton({ categories }: AddProductButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
      >
        + Add Product
      </button>

      {isOpen && (
        <AddProductModal
          categories={categories}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
