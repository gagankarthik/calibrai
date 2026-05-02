import { NextResponse } from 'next/server'
import { db, Tables, GetCommand } from '@/lib/aws/dynamodb'

export async function GET() {
  let dbStatus: 'ok' | 'error' = 'error'

  try {
    // Lightweight DynamoDB check — describe a single non-existent item (no data read)
    await db.send(new GetCommand({ TableName: Tables.Companies, Key: { companyId: '__health__' } }))
    dbStatus = 'ok'
  } catch {
    dbStatus = 'error'
  }

  const healthy = dbStatus === 'ok'
  return NextResponse.json(
    {
      status: healthy ? 'ok' : 'degraded',
      version: process.env.npm_package_version ?? '0.1.0',
      db: dbStatus,
      timestamp: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503 },
  )
}
