/**
 * Custom SmartOffice Query Builders
 * These match the exact queries from "Requests to fetch Advisor and Policy Details"
 */

import { buildSearchRequest, buildGetRequest } from './xml-builder';

/**
 * Query 1: Fetch Advisor Details (with Supervisor info)
 * From: Screenshot #1
 */
export function buildAdvisorDetailsQuery(agentId: string): string {
  return buildGetRequest({
    object: 'Agent',
    id: agentId,
    properties: [],
    nestedProperties: {
      Supervisor: ['FirstName', 'LastName'],
      Contact: ['FirstName', 'LastName', 'ReferentName', 'Source', 'SubSource'],
    },
  });
}

/**
 * Query 2: Fetch Policy Status Details (with application history)
 * From: Screenshot #2
 */
export function buildPolicyStatusQuery(policyNumber: string): string {
  return buildSearchRequest({
    object: 'Policy',
    properties: ['PolicyDate', 'PolicyStatus', 'PolicyStatusText'],
    nestedProperties: {
      NBHistorys: ['NBHistory'],
      // NBHistory nested inside NBHistorys
      NBHistory: ['Status', 'StatusDate'],
    },
    condition: {
      property: 'Policy.PolicyNumber',
      operator: 'eq',
      value: policyNumber,
    },
  });
}

/**
 * Query 3: Fetch Policy List Details (with advisor and product info)
 * From: Screenshot #3
 */
export function buildPolicyListQuery(policyNumber: string): string {
  return buildSearchRequest({
    object: 'Policy',
    properties: [
      'PolicyStatus',
      'PolicyStatusText',
      'StatusDate',
      'CarrierName',
      'CommAnnPrem',
    ],
    nestedProperties: {
      PrimaryAdvisor: ['LastName', 'FirstName', 'Source', 'SubSource'],
      Product: ['Name'],
      InsProduct: ['InsProductType', 'InsProductTypeText'],
      Contact: ['FirstName', 'LastName'],
    },
    condition: {
      property: 'Policy.PolicyNumber',
      operator: 'eq',
      value: policyNumber,
    },
  });
}

/**
 * Search all policies with detailed info (no filter)
 */
export function buildAllPoliciesQuery(pageSize = 100): string {
  return buildSearchRequest({
    object: 'Policy',
    properties: [
      'PolicyNumber',
      'PolicyStatus',
      'PolicyStatusText',
      'StatusDate',
      'CarrierName',
      'CommAnnPrem',
      'PolicyDate',
    ],
    nestedProperties: {
      PrimaryAdvisor: ['LastName', 'FirstName', 'Source', 'SubSource'],
      Product: ['Name'],
      InsProduct: ['InsProductType', 'InsProductTypeText'],
      Contact: ['FirstName', 'LastName'],
    },
    options: {
      pageSize,
      keepSession: true,
    },
  });
}

/**
 * Search agents with supervisor info
 */
export function buildAgentsWithSupervisorQuery(pageSize = 100): string {
  return buildSearchRequest({
    object: 'Agent',
    properties: ['Status'],
    nestedProperties: {
      Supervisor: ['FirstName', 'LastName'],
      Contact: ['FirstName', 'LastName', 'ReferentName', 'Source', 'SubSource'],
    },
    options: {
      pageSize,
      keepSession: true,
    },
  });
}

/**
 * Get policy application history (NBHistory = New Business History)
 * Shows the lifecycle: submitted -> underwriting -> approved -> issued
 */
export function buildPolicyHistoryQuery(policyNumber: string): string {
  return buildSearchRequest({
    object: 'Policy',
    properties: [
      'PolicyNumber',
      'PolicyDate',
      'PolicyStatus',
      'PolicyStatusText',
      'CarrierName',
    ],
    nestedProperties: {
      NBHistorys: ['NBHistory'],
      NBHistory: ['Status', 'StatusDate', 'StatusText'],
    },
    condition: {
      property: 'Policy.PolicyNumber',
      operator: 'eq',
      value: policyNumber,
    },
  });
}
