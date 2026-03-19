// =============================================
// ProductMappingModal Component Tests
// Tests for form validation and submission
// =============================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProductMappingModal } from '@/components/admin/ProductMappingModal';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: vi.fn(),
    push: vi.fn(),
  }),
}));

// Mock fetch
global.fetch = vi.fn();

describe('ProductMappingModal', () => {
  const mockIntegrations = [
    {
      id: 'int-1',
      platform_name: 'jordyn',
      display_name: 'Jordyn.app',
      is_enabled: true,
    },
    {
      id: 'int-2',
      platform_name: 'agentpulse',
      display_name: 'AgentPulse Cloud',
      is_enabled: true,
    },
  ];

  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render modal with form fields', () => {
    render(
      <ProductMappingModal
        integrations={mockIntegrations}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Add Product Mapping')).toBeInTheDocument();
    expect(screen.getByLabelText(/Integration Platform/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/External Product ID/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Product Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tech Credits/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Insurance Credits/i)).toBeInTheDocument();
  });

  it('should show edit mode when editingMapping is provided', () => {
    const editingMapping = {
      id: 'mapping-1',
      integration_id: 'int-1',
      external_product_id: 'prod_123',
      external_product_name: 'Test Product',
      tech_credits: 100,
      insurance_credits: 50,
      direct_commission_percentage: 20,
      override_commission_percentage: 10,
      commission_type: 'percentage' as const,
      is_active: true,
    };

    render(
      <ProductMappingModal
        integrations={mockIntegrations}
        editingMapping={editingMapping}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Edit Product Mapping')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Product')).toBeInTheDocument();
    expect(screen.getByDisplayValue('prod_123')).toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    render(
      <ProductMappingModal
        integrations={mockIntegrations}
        onClose={mockOnClose}
      />
    );

    const submitButton = screen.getByRole('button', { name: /Create Mapping/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.queryByText(/is required/i)).toBeInTheDocument();
    });
  });

  it('should validate credits are >= 0', async () => {
    render(
      <ProductMappingModal
        integrations={mockIntegrations}
        onClose={mockOnClose}
      />
    );

    const techCreditsInput = screen.getByLabelText(/Tech Credits/i);
    fireEvent.change(techCreditsInput, { target: { value: '-10' } });

    const submitButton = screen.getByRole('button', { name: /Create Mapping/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/must be >= 0/i)).toBeInTheDocument();
    });
  });

  it('should validate commission percentages are 0-100', async () => {
    render(
      <ProductMappingModal
        integrations={mockIntegrations}
        onClose={mockOnClose}
      />
    );

    // Change commission type to percentage
    const commissionTypeSelect = screen.getByLabelText(/Commission Type/i);
    fireEvent.change(commissionTypeSelect, { target: { value: 'percentage' } });

    // Set invalid commission percentage
    const directCommissionInput = screen.getByLabelText(/Direct Commission/i);
    fireEvent.change(directCommissionInput, { target: { value: '150' } });

    const submitButton = screen.getByRole('button', { name: /Create Mapping/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/between 0 and 100/i)).toBeInTheDocument();
    });
  });

  it('should submit form with valid data', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ mapping: { id: 'new-mapping' } }),
    } as Response);

    render(
      <ProductMappingModal
        integrations={mockIntegrations}
        onClose={mockOnClose}
      />
    );

    // Fill in form
    const externalIdInput = screen.getByLabelText(/External Product ID/i);
    fireEvent.change(externalIdInput, { target: { value: 'prod_123' } });

    const productNameInput = screen.getByLabelText(/Product Name/i);
    fireEvent.change(productNameInput, { target: { value: 'Test Product' } });

    const techCreditsInput = screen.getByLabelText(/Tech Credits/i);
    fireEvent.change(techCreditsInput, { target: { value: '100' } });

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Create Mapping/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/admin/integrations/product-mappings',
        expect.objectContaining({
          method: 'POST',
        })
      );
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('should handle API errors', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Duplicate mapping' }),
    } as Response);

    render(
      <ProductMappingModal
        integrations={mockIntegrations}
        onClose={mockOnClose}
      />
    );

    // Fill in form
    const externalIdInput = screen.getByLabelText(/External Product ID/i);
    fireEvent.change(externalIdInput, { target: { value: 'prod_123' } });

    const productNameInput = screen.getByLabelText(/Product Name/i);
    fireEvent.change(productNameInput, { target: { value: 'Test Product' } });

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Create Mapping/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Duplicate mapping/i)).toBeInTheDocument();
    });
  });

  it('should close modal when cancel button is clicked', () => {
    render(
      <ProductMappingModal
        integrations={mockIntegrations}
        onClose={mockOnClose}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should show percentage inputs when commission type is percentage', () => {
    render(
      <ProductMappingModal
        integrations={mockIntegrations}
        onClose={mockOnClose}
      />
    );

    const commissionTypeSelect = screen.getByLabelText(/Commission Type/i);
    fireEvent.change(commissionTypeSelect, { target: { value: 'percentage' } });

    expect(screen.getByLabelText(/Direct Commission/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Override Commission/i)).toBeInTheDocument();
  });

  it('should show fixed amount input when commission type is fixed', () => {
    render(
      <ProductMappingModal
        integrations={mockIntegrations}
        onClose={mockOnClose}
      />
    );

    const commissionTypeSelect = screen.getByLabelText(/Commission Type/i);
    fireEvent.change(commissionTypeSelect, { target: { value: 'fixed' } });

    expect(screen.getByLabelText(/Fixed Commission Amount/i)).toBeInTheDocument();
  });
});
