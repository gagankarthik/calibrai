import { NextRequest, NextResponse } from 'next/server'
import { cognitoSignIn } from '@/lib/aws/cognito'
import { db, Tables, GetCommand } from '@/lib/aws/dynamodb'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = (await req.json()) as { email: string; password: string }

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const authResult = await cognitoSignIn(email, password, 'talent')
    if (!authResult?.IdToken) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Get talent profile from DynamoDB
    const candidateResult = await db.send(
      new GetCommand({ TableName: Tables.Candidates, Key: { candidateId: email } }),
    )
    const talent = candidateResult.Item ?? null

    const response = NextResponse.json({
      token: authResult.IdToken,
      accessToken: authResult.AccessToken,
      talent,
    })

    response.cookies.set('tb-talent-token', authResult.IdToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    })

    return response
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Authentication failed'
    if (message.includes('NotAuthorizedException') || message.includes('UserNotFoundException')) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
