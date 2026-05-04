import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
  ScanCommand,
  TransactWriteCommand,
} from '@aws-sdk/lib-dynamodb'

const client = new DynamoDBClient({
  region: process.env.AWS_REGION ?? 'us-east-1',
  credentials: process.env.AWS_ACCESS_KEY_ID
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      }
    : undefined,
})

export const db = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
})

export const Tables = {
  Companies: process.env.DYNAMODB_COMPANIES_TABLE ?? 'talentbridge-companies',
  Jobs: process.env.DYNAMODB_JOBS_TABLE ?? 'talentbridge-jobs',
  Candidates: process.env.DYNAMODB_CANDIDATES_TABLE ?? 'talentbridge-candidates',
  Applications: process.env.DYNAMODB_APPLICATIONS_TABLE ?? 'talentbridge-applications',
  Conversations: process.env.DYNAMODB_CONVERSATIONS_TABLE ?? 'talentbridge-conversations',
  Messages: process.env.DYNAMODB_MESSAGES_TABLE ?? 'talentbridge-messages',
  DiscoveredCandidates: process.env.DYNAMODB_DISCOVERED_TABLE ?? 'talentbridge-discovered-candidates',
  CrmJobs: process.env.DYNAMODB_CRM_JOBS_TABLE ?? 'talentbridge-crm-jobs',
  AuditLogs: process.env.DYNAMODB_AUDIT_TABLE ?? 'talentbridge-audit-logs',
  Users: process.env.DYNAMODB_USERS_TABLE ?? 'talentbridge-users',
  Notifications: process.env.DYNAMODB_NOTIFICATIONS_TABLE ?? 'talentbridge-notifications',
  SourcerBriefs: process.env.DYNAMODB_SOURCER_BRIEFS_TABLE ?? 'talentbridge-sourcer-briefs',
} as const

export { GetCommand, PutCommand, UpdateCommand, DeleteCommand, QueryCommand, ScanCommand, TransactWriteCommand }
