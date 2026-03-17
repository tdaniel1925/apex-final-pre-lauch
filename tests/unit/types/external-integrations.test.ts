/**
 * Test file for External Integrations TypeScript types
 * Verifies type definitions match database schema
 */

import { describe, it, expect } from 'vitest';
import type {
  Integration,
  DistributorReplicatedSite,
  IntegrationProductMapping,
  ExternalSale,
  IntegrationWebhookLog,
  DistributorReplicatedSiteInsert,
  ExternalSaleInsert,
  IntegrationWithStats,
} from '@/lib/types';

describe('External Integrations Types', () => {
  describe('Integration', () => {
    it('should have correct shape for integration object', () => {
      const integration: Integration = {
        id: 'abc-123',
        platform_name: 'jordyn',
        display_name: 'Jordyn.app',
        is_enabled: true,
        api_endpoint: 'https://api.jordyn.app',
        api_key_encrypted: 'encrypted_key',
        webhook_secret: 'secret_123',
        supports_replicated_sites: true,
        supports_sales_webhooks: true,
        supports_commission_tracking: true,
        auto_create_site_on_signup: false,
        integration_metadata: { version: '1.0' },
        notes: 'Test integration',
        created_at: '2026-03-17T00:00:00Z',
        updated_at: '2026-03-17T00:00:00Z',
      };

      expect(integration).toBeDefined();
      expect(integration.platform_name).toBe('jordyn');
    });

    it('should allow null for optional fields', () => {
      const integration: Integration = {
        id: 'abc-123',
        platform_name: 'agentpulse',
        display_name: 'AgentPulse Cloud',
        is_enabled: true,
        api_endpoint: 'https://api.agentpulse.cloud',
        api_key_encrypted: null,
        webhook_secret: null,
        supports_replicated_sites: false,
        supports_sales_webhooks: false,
        supports_commission_tracking: false,
        auto_create_site_on_signup: false,
        integration_metadata: {},
        notes: null,
        created_at: '2026-03-17T00:00:00Z',
        updated_at: '2026-03-17T00:00:00Z',
      };

      expect(integration.api_key_encrypted).toBeNull();
      expect(integration.notes).toBeNull();
    });
  });

  describe('DistributorReplicatedSite', () => {
    it('should have correct shape for replicated site', () => {
      const site: DistributorReplicatedSite = {
        id: 'site-123',
        distributor_id: 'dist-123',
        integration_id: 'int-123',
        external_site_id: 'ext-site-456',
        external_user_id: 'ext-user-789',
        site_url: 'https://john-smith.jordyn.app',
        site_slug: 'john-smith',
        site_status: 'active',
        created_via: 'auto',
        provisioned_at: '2026-03-17T00:00:00Z',
        last_synced_at: '2026-03-17T12:00:00Z',
        sync_status: 'synced',
        sync_error: null,
        site_metadata: { theme: 'blue' },
        created_at: '2026-03-17T00:00:00Z',
        updated_at: '2026-03-17T00:00:00Z',
      };

      expect(site).toBeDefined();
      expect(site.site_status).toBe('active');
    });

    it('should enforce site_status enum', () => {
      const statuses: DistributorReplicatedSite['site_status'][] = [
        'pending',
        'active',
        'suspended',
        'deleted',
      ];

      statuses.forEach((status) => {
        const site: Pick<DistributorReplicatedSite, 'site_status'> = {
          site_status: status,
        };
        expect(site.site_status).toBe(status);
      });
    });
  });

  describe('IntegrationProductMapping', () => {
    it('should have correct shape for product mapping', () => {
      const mapping: IntegrationProductMapping = {
        id: 'mapping-123',
        integration_id: 'int-123',
        product_id: 'prod-123',
        external_product_id: 'ext-prod-456',
        external_product_name: 'Jordyn Pro Plan',
        external_product_sku: 'JORDYN-PRO',
        tech_credits: 100,
        insurance_credits: 50,
        direct_commission_percentage: 10,
        override_commission_percentage: 5,
        fixed_commission_amount: null,
        is_active: true,
        commission_type: 'credits',
        mapping_metadata: {},
        notes: 'Test mapping',
        created_at: '2026-03-17T00:00:00Z',
        updated_at: '2026-03-17T00:00:00Z',
      };

      expect(mapping).toBeDefined();
      expect(mapping.tech_credits).toBe(100);
    });

    it('should enforce commission_type enum', () => {
      const types: IntegrationProductMapping['commission_type'][] = [
        'credits',
        'percentage',
        'fixed',
        'none',
      ];

      types.forEach((type) => {
        const mapping: Pick<IntegrationProductMapping, 'commission_type'> = {
          commission_type: type,
        };
        expect(mapping.commission_type).toBe(type);
      });
    });
  });

  describe('ExternalSale', () => {
    it('should have correct shape for external sale', () => {
      const sale: ExternalSale = {
        id: 'sale-123',
        integration_id: 'int-123',
        distributor_id: 'dist-123',
        product_mapping_id: 'mapping-123',
        replicated_site_id: 'site-123',
        external_sale_id: 'ext-sale-456',
        external_customer_id: 'ext-cust-789',
        external_product_id: 'ext-prod-456',
        sale_amount: 99.99,
        currency: 'USD',
        quantity: 1,
        tech_credits_earned: 100,
        insurance_credits_earned: 50,
        commission_amount: 9.99,
        commission_type: 'credits',
        sale_status: 'completed',
        sale_date: '2026-03-17T00:00:00Z',
        processed_at: '2026-03-17T00:01:00Z',
        refunded_at: null,
        webhook_payload: { event: 'sale.created' },
        commission_applied: true,
        commission_applied_at: '2026-03-17T00:02:00Z',
        notes: null,
        created_at: '2026-03-17T00:00:00Z',
        updated_at: '2026-03-17T00:00:00Z',
      };

      expect(sale).toBeDefined();
      expect(sale.sale_amount).toBe(99.99);
    });

    it('should enforce sale_status enum', () => {
      const statuses: ExternalSale['sale_status'][] = [
        'pending',
        'completed',
        'refunded',
        'canceled',
      ];

      statuses.forEach((status) => {
        const sale: Pick<ExternalSale, 'sale_status'> = {
          sale_status: status,
        };
        expect(sale.sale_status).toBe(status);
      });
    });
  });

  describe('IntegrationWebhookLog', () => {
    it('should have correct shape for webhook log', () => {
      const log: IntegrationWebhookLog = {
        id: 'log-123',
        integration_id: 'int-123',
        external_sale_id: 'sale-123',
        webhook_event_type: 'sale.created',
        webhook_source_ip: '192.168.1.1',
        webhook_signature: 'sig-abc123',
        signature_verified: true,
        http_method: 'POST',
        headers: { 'content-type': 'application/json' },
        payload: { event: 'sale.created', data: {} },
        processing_status: 'success',
        processing_started_at: '2026-03-17T00:00:00Z',
        processing_completed_at: '2026-03-17T00:00:05Z',
        error_message: null,
        error_details: null,
        retry_count: 0,
        response_code: 200,
        response_body: '{"success": true}',
        received_at: '2026-03-17T00:00:00Z',
        created_at: '2026-03-17T00:00:00Z',
      };

      expect(log).toBeDefined();
      expect(log.signature_verified).toBe(true);
    });

    it('should enforce processing_status enum', () => {
      const statuses: IntegrationWebhookLog['processing_status'][] = [
        'pending',
        'processing',
        'success',
        'error',
        'ignored',
      ];

      statuses.forEach((status) => {
        const log: Pick<IntegrationWebhookLog, 'processing_status'> = {
          processing_status: status,
        };
        expect(log.processing_status).toBe(status);
      });
    });
  });

  describe('Insert Types', () => {
    it('should omit auto-generated fields for DistributorReplicatedSiteInsert', () => {
      const siteInsert: DistributorReplicatedSiteInsert = {
        distributor_id: 'dist-123',
        integration_id: 'int-123',
        external_site_id: 'ext-site-456',
        external_user_id: null,
        site_url: 'https://john-smith.jordyn.app',
        site_slug: 'john-smith',
        site_status: 'pending',
        created_via: 'manual',
        provisioned_at: null,
        last_synced_at: null,
        sync_status: 'pending',
        sync_error: null,
        site_metadata: {},
      };

      expect(siteInsert).toBeDefined();
      // Should not have id, created_at, updated_at
      expect('id' in siteInsert).toBe(false);
      expect('created_at' in siteInsert).toBe(false);
      expect('updated_at' in siteInsert).toBe(false);
    });

    it('should omit auto-generated fields for ExternalSaleInsert', () => {
      const saleInsert: ExternalSaleInsert = {
        integration_id: 'int-123',
        distributor_id: 'dist-123',
        product_mapping_id: 'mapping-123',
        replicated_site_id: 'site-123',
        external_sale_id: 'ext-sale-456',
        external_customer_id: 'ext-cust-789',
        external_product_id: 'ext-prod-456',
        sale_amount: 99.99,
        currency: 'USD',
        quantity: 1,
        tech_credits_earned: 100,
        insurance_credits_earned: 50,
        commission_amount: 9.99,
        commission_type: 'credits',
        sale_status: 'completed',
        sale_date: '2026-03-17T00:00:00Z',
        refunded_at: null,
        webhook_payload: {},
        commission_applied: false,
        commission_applied_at: null,
        notes: null,
      };

      expect(saleInsert).toBeDefined();
      // Should not have id, created_at, updated_at, processed_at
      expect('id' in saleInsert).toBe(false);
      expect('created_at' in saleInsert).toBe(false);
      expect('updated_at' in saleInsert).toBe(false);
      expect('processed_at' in saleInsert).toBe(false);
    });
  });

  describe('IntegrationWithStats', () => {
    it('should extend Integration with statistics', () => {
      const integrationWithStats: IntegrationWithStats = {
        id: 'abc-123',
        platform_name: 'jordyn',
        display_name: 'Jordyn.app',
        is_enabled: true,
        api_endpoint: 'https://api.jordyn.app',
        api_key_encrypted: 'encrypted_key',
        webhook_secret: 'secret_123',
        supports_replicated_sites: true,
        supports_sales_webhooks: true,
        supports_commission_tracking: true,
        auto_create_site_on_signup: false,
        integration_metadata: {},
        notes: null,
        created_at: '2026-03-17T00:00:00Z',
        updated_at: '2026-03-17T00:00:00Z',
        // Statistics
        total_sites: 150,
        active_sites: 120,
        total_sales: 500,
        total_sales_amount: 49950.0,
        total_webhooks_received: 1200,
        last_webhook_at: '2026-03-17T12:00:00Z',
      };

      expect(integrationWithStats).toBeDefined();
      expect(integrationWithStats.total_sites).toBe(150);
      expect(integrationWithStats.active_sites).toBe(120);
    });
  });
});
