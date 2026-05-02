import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  GlobalSignOutCommand,
  SignUpCommand,
  ConfirmSignUpCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  AdminGetUserCommand,
  AuthFlowType,
} from '@aws-sdk/client-cognito-identity-provider'
import { CognitoJwtVerifier } from 'aws-jwt-verify'

const cognito = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION ?? 'us-east-2',
  credentials: process.env.AWS_ACCESS_KEY_ID
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      }
    : undefined,
})

// Single user pool — role (company | talent) stored in custom:role attribute
export const USER_POOL_ID  = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID  ?? ''
export const USER_CLIENT_ID = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID ?? ''

// Backwards-compat aliases used by existing API routes
export const COMPANY_POOL_ID    = USER_POOL_ID
export const COMPANY_CLIENT_ID  = USER_CLIENT_ID
export const TALENT_POOL_ID     = USER_POOL_ID
export const TALENT_CLIENT_ID   = USER_CLIENT_ID

// CognitoPool type kept for API compatibility — both resolve to the same pool
export type CognitoPool = 'company' | 'talent'

export async function cognitoSignIn(email: string, password: string, _pool?: CognitoPool) {
  const command = new InitiateAuthCommand({
    AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
    ClientId: USER_CLIENT_ID,
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
  _pool?: CognitoPool,
  attributes: Record<string, string> = {},
) {
  return cognito.send(
    new SignUpCommand({
      ClientId: USER_CLIENT_ID,
      Username: email,
      Password: password,
      UserAttributes: Object.entries(attributes).map(([Name, Value]) => ({ Name, Value })),
    }),
  )
}

export async function cognitoConfirmSignUp(email: string, code: string, _pool?: CognitoPool) {
  return cognito.send(
    new ConfirmSignUpCommand({ ClientId: USER_CLIENT_ID, Username: email, ConfirmationCode: code }),
  )
}

export async function cognitoForgotPassword(email: string, _pool?: CognitoPool) {
  return cognito.send(new ForgotPasswordCommand({ ClientId: USER_CLIENT_ID, Username: email }))
}

export async function cognitoConfirmForgotPassword(
  email: string,
  code: string,
  newPassword: string,
  _pool?: CognitoPool,
) {
  return cognito.send(
    new ConfirmForgotPasswordCommand({
      ClientId: USER_CLIENT_ID,
      Username: email,
      ConfirmationCode: code,
      Password: newPassword,
    }),
  )
}

export async function cognitoGetUser(username: string, _pool?: CognitoPool) {
  return cognito.send(new AdminGetUserCommand({ UserPoolId: USER_POOL_ID, Username: username }))
}

let verifier: ReturnType<typeof CognitoJwtVerifier.create> | null = null

function getVerifier() {
  if (!verifier && USER_POOL_ID && USER_CLIENT_ID) {
    verifier = CognitoJwtVerifier.create({
      userPoolId: USER_POOL_ID,
      tokenUse: 'id',
      clientId: USER_CLIENT_ID,
    })
  }
  return verifier
}

export async function verifyCognitoToken(token: string, _pool?: CognitoPool) {
  const v = getVerifier()
  if (!v) throw new Error('Cognito verifier not configured — check NEXT_PUBLIC_COGNITO_USER_POOL_ID and NEXT_PUBLIC_COGNITO_CLIENT_ID')
  return v.verify(token)
}

export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null
  return authHeader.slice(7)
}
