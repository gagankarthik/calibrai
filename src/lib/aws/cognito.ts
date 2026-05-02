import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  GlobalSignOutCommand,
  SignUpCommand,
  AdminGetUserCommand,
  AuthFlowType,
} from '@aws-sdk/client-cognito-identity-provider'
import { CognitoJwtVerifier } from 'aws-jwt-verify'

const cognito = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION ?? 'us-east-1',
  credentials: process.env.AWS_ACCESS_KEY_ID
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      }
    : undefined,
})

export const COMPANY_POOL_ID = process.env.NEXT_PUBLIC_COGNITO_COMPANY_USER_POOL_ID ?? ''
export const COMPANY_CLIENT_ID = process.env.NEXT_PUBLIC_COGNITO_COMPANY_CLIENT_ID ?? ''
export const TALENT_POOL_ID = process.env.NEXT_PUBLIC_COGNITO_TALENT_USER_POOL_ID ?? ''
export const TALENT_CLIENT_ID = process.env.NEXT_PUBLIC_COGNITO_TALENT_CLIENT_ID ?? ''

export type CognitoPool = 'company' | 'talent'

function getPoolConfig(pool: CognitoPool) {
  return pool === 'company'
    ? { userPoolId: COMPANY_POOL_ID, clientId: COMPANY_CLIENT_ID }
    : { userPoolId: TALENT_POOL_ID, clientId: TALENT_CLIENT_ID }
}

export async function cognitoSignIn(email: string, password: string, pool: CognitoPool) {
  const { userPoolId, clientId } = getPoolConfig(pool)
  const command = new InitiateAuthCommand({
    AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
    ClientId: clientId,
    AuthParameters: { USERNAME: email, PASSWORD: password },
  })
  const result = await cognito.send(command)
  return result.AuthenticationResult
}

export async function cognitoSignOut(accessToken: string) {
  await cognito.send(new GlobalSignOutCommand({ AccessToken: accessToken }))
}

export async function cognitoSignUp(
  email: string,
  password: string,
  pool: CognitoPool,
  attributes: Record<string, string> = {},
) {
  const { clientId } = getPoolConfig(pool)
  return cognito.send(
    new SignUpCommand({
      ClientId: clientId,
      Username: email,
      Password: password,
      UserAttributes: Object.entries(attributes).map(([Name, Value]) => ({ Name, Value })),
    }),
  )
}

export async function cognitoGetUser(username: string, pool: CognitoPool) {
  const { userPoolId } = getPoolConfig(pool)
  return cognito.send(new AdminGetUserCommand({ UserPoolId: userPoolId, Username: username }))
}

let companyVerifier: ReturnType<typeof CognitoJwtVerifier.create> | null = null
let talentVerifier: ReturnType<typeof CognitoJwtVerifier.create> | null = null

function getVerifier(pool: CognitoPool) {
  if (pool === 'company') {
    if (!companyVerifier && COMPANY_POOL_ID && COMPANY_CLIENT_ID) {
      companyVerifier = CognitoJwtVerifier.create({
        userPoolId: COMPANY_POOL_ID,
        tokenUse: 'id',
        clientId: COMPANY_CLIENT_ID,
      })
    }
    return companyVerifier
  } else {
    if (!talentVerifier && TALENT_POOL_ID && TALENT_CLIENT_ID) {
      talentVerifier = CognitoJwtVerifier.create({
        userPoolId: TALENT_POOL_ID,
        tokenUse: 'id',
        clientId: TALENT_CLIENT_ID,
      })
    }
    return talentVerifier
  }
}

export async function verifyCognitoToken(token: string, pool: CognitoPool) {
  const verifier = getVerifier(pool)
  if (!verifier) throw new Error('Cognito verifier not configured')
  return verifier.verify(token)
}

export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null
  return authHeader.slice(7)
}
