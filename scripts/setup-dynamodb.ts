/**
 * Run once to create all required DynamoDB tables.
 * Usage: npx ts-node -r tsconfig-paths/register scripts/setup-dynamodb.ts
 * Or: AWS_REGION=us-east-1 npx tsx scripts/setup-dynamodb.ts
 */

import {
  DynamoDBClient,
  CreateTableCommand,
  ListTablesCommand,
} from '@aws-sdk/client-dynamodb'

const client = new DynamoDBClient({ region: process.env.AWS_REGION ?? 'us-east-1' })

const tables = [
  {
    TableName: 'talentbridge-companies',
    KeySchema: [{ AttributeName: 'companyId', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'companyId', AttributeType: 'S' }],
    BillingMode: 'PAY_PER_REQUEST' as const,
  },
  {
    TableName: 'talentbridge-jobs',
    KeySchema: [
      { AttributeName: 'companyId', KeyType: 'HASH' },
      { AttributeName: 'jobId', KeyType: 'RANGE' },
    ],
    AttributeDefinitions: [
      { AttributeName: 'companyId', AttributeType: 'S' },
      { AttributeName: 'jobId', AttributeType: 'S' },
    ],
    BillingMode: 'PAY_PER_REQUEST' as const,
  },
  {
    TableName: 'talentbridge-candidates',
    KeySchema: [{ AttributeName: 'candidateId', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'candidateId', AttributeType: 'S' }],
    BillingMode: 'PAY_PER_REQUEST' as const,
  },
  {
    TableName: 'talentbridge-applications',
    KeySchema: [
      { AttributeName: 'jobId', KeyType: 'HASH' },
      { AttributeName: 'applicationId', KeyType: 'RANGE' },
    ],
    AttributeDefinitions: [
      { AttributeName: 'jobId', AttributeType: 'S' },
      { AttributeName: 'applicationId', AttributeType: 'S' },
      { AttributeName: 'candidateId', AttributeType: 'S' },
      { AttributeName: 'appliedAt', AttributeType: 'S' },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'candidateId-appliedAt-index',
        KeySchema: [
          { AttributeName: 'candidateId', KeyType: 'HASH' },
          { AttributeName: 'appliedAt', KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'ALL' },
      },
    ],
    BillingMode: 'PAY_PER_REQUEST' as const,
  },
  {
    TableName: 'talentbridge-conversations',
    KeySchema: [{ AttributeName: 'conversationId', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'conversationId', AttributeType: 'S' }],
    BillingMode: 'PAY_PER_REQUEST' as const,
  },
  {
    TableName: 'talentbridge-messages',
    KeySchema: [
      { AttributeName: 'conversationId', KeyType: 'HASH' },
      { AttributeName: 'messageId', KeyType: 'RANGE' },
    ],
    AttributeDefinitions: [
      { AttributeName: 'conversationId', AttributeType: 'S' },
      { AttributeName: 'messageId', AttributeType: 'S' },
    ],
    BillingMode: 'PAY_PER_REQUEST' as const,
  },
  {
    TableName: 'talentbridge-discovered-candidates',
    KeySchema: [
      { AttributeName: 'jobId', KeyType: 'HASH' },
      { AttributeName: 'profileId', KeyType: 'RANGE' },
    ],
    AttributeDefinitions: [
      { AttributeName: 'jobId', AttributeType: 'S' },
      { AttributeName: 'profileId', AttributeType: 'S' },
    ],
    BillingMode: 'PAY_PER_REQUEST' as const,
  },
  {
    TableName: 'talentbridge-crm-jobs',
    KeySchema: [{ AttributeName: 'jobId', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'jobId', AttributeType: 'S' }],
    BillingMode: 'PAY_PER_REQUEST' as const,
  },
  {
    TableName: 'talentbridge-audit-logs',
    KeySchema: [
      { AttributeName: 'companyId', KeyType: 'HASH' },
      { AttributeName: 'createdAt', KeyType: 'RANGE' },
    ],
    AttributeDefinitions: [
      { AttributeName: 'companyId', AttributeType: 'S' },
      { AttributeName: 'createdAt', AttributeType: 'S' },
    ],
    BillingMode: 'PAY_PER_REQUEST' as const,
  },
  {
    TableName: 'talentbridge-users',
    KeySchema: [{ AttributeName: 'userId', KeyType: 'HASH' }],
    AttributeDefinitions: [
      { AttributeName: 'userId', AttributeType: 'S' },
      { AttributeName: 'companyId', AttributeType: 'S' },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'companyId-index',
        KeySchema: [{ AttributeName: 'companyId', KeyType: 'HASH' }],
        Projection: { ProjectionType: 'ALL' },
      },
    ],
    BillingMode: 'PAY_PER_REQUEST' as const,
  },
]

async function setup() {
  const existing = await client.send(new ListTablesCommand({}))
  const existingTables = new Set(existing.TableNames ?? [])

  for (const table of tables) {
    if (existingTables.has(table.TableName)) {
      console.log(`✓ ${table.TableName} already exists`)
      continue
    }
    try {
      await client.send(new CreateTableCommand(table))
      console.log(`✅ Created ${table.TableName}`)
    } catch (err) {
      console.error(`❌ Failed to create ${table.TableName}:`, err)
    }
  }
}

setup().catch(console.error)
