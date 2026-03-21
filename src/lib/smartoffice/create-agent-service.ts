/**
 * SmartOffice Agent Creation Service
 * Automatically creates SmartOffice Contact + Agent when new Apex distributor signs up
 */

import { getSmartOfficeClient } from './client';
import { buildInsertRequest } from './xml-builder';
import { createServiceClient } from '@/lib/supabase/service';
import type { SmartOfficeResponse } from './types';

export interface CreateAgentParams {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  taxId?: string; // SSN or EIN
  apexDistributorId: string; // Link back to Apex distributor
}

export interface CreateAgentResult {
  success: boolean;
  contactId?: string;
  agentId?: string;
  error?: string;
  details?: {
    contactCreated: boolean;
    agentCreated: boolean;
    linkedToApex: boolean;
  };
}

/**
 * Create a Contact + Agent in SmartOffice for a new Apex distributor
 *
 * Process:
 * 1. Create Contact record (person's profile)
 * 2. Create Agent record (links to Contact, designates them as an advisor)
 * 3. Store SmartOffice IDs back in Apex database
 * 4. Link SmartOffice agent to Apex distributor in smartoffice_agents table
 */
export class SmartOfficeAgentCreator {
  private supabase = createServiceClient();

  /**
   * Create a new agent in SmartOffice and link to Apex distributor
   */
  async createAgent(params: CreateAgentParams): Promise<CreateAgentResult> {
    const result: CreateAgentResult = {
      success: false,
      details: {
        contactCreated: false,
        agentCreated: false,
        linkedToApex: false,
      },
    };

    try {
      console.log('[SmartOffice Agent Creator] Creating agent for:', params.email);

      // Step 1: Check if Contact already exists by email
      const client = await getSmartOfficeClient();
      const existingAgent = await client.findAgentByEmail(params.email);

      if (existingAgent) {
        console.log('[SmartOffice Agent Creator] Agent already exists:', existingAgent.id);

        // Link existing agent to Apex distributor
        await this.linkAgentToApex(existingAgent.id, existingAgent.contactId, params.apexDistributorId);

        return {
          success: true,
          contactId: existingAgent.contactId,
          agentId: existingAgent.id,
          details: {
            contactCreated: false,
            agentCreated: false,
            linkedToApex: true,
          },
        };
      }

      // Step 2: Create Contact record
      const contactResult = await this.createContact(params);
      if (!contactResult.success || !contactResult.contactId) {
        return {
          success: false,
          error: contactResult.error || 'Failed to create Contact',
          details: result.details,
        };
      }

      result.contactId = contactResult.contactId;
      result.details!.contactCreated = true;
      console.log('[SmartOffice Agent Creator] Contact created:', contactResult.contactId);

      // Step 3: Create Agent record (linked to Contact)
      const agentResult = await this.createAgentRecord(contactResult.contactId);
      if (!agentResult.success || !agentResult.agentId) {
        return {
          success: false,
          error: agentResult.error || 'Failed to create Agent',
          contactId: contactResult.contactId,
          details: result.details,
        };
      }

      result.agentId = agentResult.agentId;
      result.details!.agentCreated = true;
      console.log('[SmartOffice Agent Creator] Agent created:', agentResult.agentId);

      // Step 4: Link to Apex distributor in database
      await this.linkAgentToApex(agentResult.agentId, contactResult.contactId, params.apexDistributorId);
      result.details!.linkedToApex = true;

      result.success = true;
      console.log('[SmartOffice Agent Creator] ✅ Successfully created and linked agent');

      return result;
    } catch (error) {
      console.error('[SmartOffice Agent Creator] Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error creating agent',
        details: result.details,
      };
    }
  }

  /**
   * Create a Contact record in SmartOffice
   */
  private async createContact(params: CreateAgentParams): Promise<{
    success: boolean;
    contactId?: string;
    error?: string;
  }> {
    try {
      const client = await getSmartOfficeClient();

      // Parse phone number into area code + number
      let areaCode: string | null = null;
      let phoneNumber: string | null = null;
      if (params.phone) {
        const cleanPhone = params.phone.replace(/\D/g, ''); // Remove non-digits
        if (cleanPhone.length === 10) {
          areaCode = cleanPhone.substring(0, 3);
          phoneNumber = cleanPhone.substring(3);
        }
      }

      // Build Contact insert request
      const contactProperties: Record<string, string | number | null> = {
        FirstName: params.firstName,
        LastName: params.lastName,
        ClientType: 7, // 7 = Agent/Advisor in SmartOffice
      };

      if (params.taxId) {
        contactProperties.TaxID = params.taxId;
      }

      // Build nested objects for email and phone
      const nestedObjects: Record<string, Record<string, string | number | null>> = {};

      // Email address
      if (params.email) {
        nestedObjects.WebAddresses = {
          WebAddress: {
            Address: params.email,
            WebAddressType: 1, // 1 = Email
          } as any, // Type assertion needed for nested structure
        };
      }

      // Phone number
      if (areaCode && phoneNumber) {
        nestedObjects.Phones = {
          Phone: {
            AreaCode: areaCode,
            Number: phoneNumber,
            PhoneType: 1, // 1 = Primary phone
          } as any,
        };
      }

      const xml = buildInsertRequest({
        object: 'Contact',
        properties: contactProperties,
        nestedObjects,
      });

      const response: SmartOfficeResponse = await client.sendRequest(xml);

      if (!response.success) {
        return {
          success: false,
          error: response.error?.message || 'Contact creation failed',
        };
      }

      // Extract Contact ID from response
      // SmartOffice returns the new ID in the response
      const contactId = this.extractIdFromResponse(response, 'Contact');
      if (!contactId) {
        return {
          success: false,
          error: 'Contact created but ID not returned',
        };
      }

      return {
        success: true,
        contactId,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create Contact',
      };
    }
  }

  /**
   * Create an Agent record in SmartOffice (linked to Contact)
   */
  private async createAgentRecord(contactId: string): Promise<{
    success: boolean;
    agentId?: string;
    error?: string;
  }> {
    try {
      const client = await getSmartOfficeClient();

      // Build Agent insert request
      // Agent just links to the Contact and sets Status
      const xml = buildInsertRequest({
        object: 'Agent',
        properties: {
          ContactID: contactId,
          Status: 0, // 0 = Active agent
        },
      });

      const response: SmartOfficeResponse = await client.sendRequest(xml);

      if (!response.success) {
        return {
          success: false,
          error: response.error?.message || 'Agent creation failed',
        };
      }

      // Extract Agent ID from response
      const agentId = this.extractIdFromResponse(response, 'Agent');
      if (!agentId) {
        return {
          success: false,
          error: 'Agent created but ID not returned',
        };
      }

      return {
        success: true,
        agentId,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create Agent',
      };
    }
  }

  /**
   * Link SmartOffice agent to Apex distributor in database
   */
  private async linkAgentToApex(
    smartofficeAgentId: string,
    contactId: string,
    apexDistributorId: string
  ): Promise<void> {
    try {
      // Insert or update smartoffice_agents table
      const { error } = await this.supabase.from('smartoffice_agents').upsert(
        {
          smartoffice_id: smartofficeAgentId,
          contact_id: contactId,
          apex_agent_id: apexDistributorId,
          synced_at: new Date().toISOString(),
        },
        {
          onConflict: 'smartoffice_id',
        }
      );

      if (error) {
        throw new Error(`Failed to link agent to Apex: ${error.message}`);
      }

      console.log(
        `[SmartOffice Agent Creator] Linked SmartOffice agent ${smartofficeAgentId} to Apex distributor ${apexDistributorId}`
      );
    } catch (error) {
      console.error('[SmartOffice Agent Creator] Error linking to Apex:', error);
      throw error;
    }
  }

  /**
   * Extract object ID from SmartOffice response
   * SmartOffice returns inserted IDs in the response XML
   */
  private extractIdFromResponse(response: SmartOfficeResponse, objectType: string): string | null {
    try {
      // SmartOffice insert responses typically include the new ID
      // The exact structure depends on the response format
      // Common patterns:
      // - response.data[objectType].id
      // - response.data.id
      // - response.id

      if (response.data) {
        const data = response.data as any;

        // Try direct ID
        if (data.id) {
          return String(data.id);
        }

        // Try object type key
        if (data[objectType] && data[objectType].id) {
          return String(data[objectType].id);
        }

        // Try lowercase
        const lowerType = objectType.toLowerCase();
        if (data[lowerType] && data[lowerType].id) {
          return String(data[lowerType].id);
        }
      }

      console.warn('[SmartOffice Agent Creator] Could not extract ID from response:', response);
      return null;
    } catch (error) {
      console.error('[SmartOffice Agent Creator] Error extracting ID:', error);
      return null;
    }
  }

  /**
   * Check if a distributor already has a SmartOffice agent linked
   */
  async hasSmartOfficeAgent(apexDistributorId: string): Promise<boolean> {
    const { data } = await this.supabase
      .from('smartoffice_agents')
      .select('id')
      .eq('apex_agent_id', apexDistributorId)
      .single();

    return !!data;
  }

  /**
   * Get SmartOffice agent info for an Apex distributor
   */
  async getLinkedAgent(apexDistributorId: string): Promise<{
    smartofficeId: string;
    contactId: string;
  } | null> {
    const { data } = await this.supabase
      .from('smartoffice_agents')
      .select('smartoffice_id, contact_id')
      .eq('apex_agent_id', apexDistributorId)
      .single();

    if (!data) return null;

    return {
      smartofficeId: data.smartoffice_id,
      contactId: data.contact_id,
    };
  }
}

// Export singleton instance getter
let creatorInstance: SmartOfficeAgentCreator | null = null;

export function getSmartOfficeAgentCreator(): SmartOfficeAgentCreator {
  if (!creatorInstance) {
    creatorInstance = new SmartOfficeAgentCreator();
  }
  return creatorInstance;
}
