import { db, Tables, PutCommand } from '@/lib/aws/dynamodb'

export interface AuditEvent {
  action: string           // e.g. 'job.created', 'application.status_changed', 'profile.updated'
  resource: string         // e.g. 'job', 'application', 'talent_profile'
  resourceId?: string
  userId?: string
  userEmail?: string
  companyId?: string
  ipAddress?: string
  oldValue?: Record<string, unknown>
  newValue?: Record<string, unknown>
  metadata?: Record<string, unknown>
}

export async function logAuditEvent(event: AuditEvent): Promise<void> {
  try {
    await db.send(new PutCommand({
      TableName: Tables.AuditLogs,
      Item: {
        id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        ...event,
        createdAt: new Date().toISOString(),
      },
    }))
  } catch (err) {
    // Never let audit logging failure break the main operation
    console.error('[audit] Failed to log event:', err)
  }
}
