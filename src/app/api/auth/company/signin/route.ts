import { NextRequest, NextResponse } from 'next/server'
import { cognitoSignIn } from '@/lib/aws/cognito'
import { db, Tables, GetCommand } from '@/lib/aws/dynamodb'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = (await req.json()) as { email: string; password: string }

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const authResult = await cognitoSignIn(email, password, 'company')
    if (!authResult?.IdToken) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Get company record from DynamoDB using the user's email
    const usersResult = await db.send(
      new GetCommand({ TableName: Tables.Users, Key: { userId: email } }),
    )
    const userRecord = usersResult.Item

    let company = null
    if (userRecord?.companyId) {
      const companyResult = await db.send(
        new GetCommand({ TableName: Tables.Companies, Key: { companyId: userRecord.companyId } }),
      )
      company = companyResult.Item ?? null
    }

    const response = NextResponse.json({
      token: authResult.IdToken,
      accessToken: authResult.AccessToken,
      company,
      user: {
        id: userRecord?.userId ?? email,
        email,
        fullName: userRecord?.fullName ?? '',
        role: userRecord?.role ?? 'admin',
        companyId: userRecord?.companyId,
      },
    })

    // Set httpOnly cookie for server-side auth checks
    response.cookies.set('tb-company-token', authResult.IdToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24h
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
