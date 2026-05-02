# TalentBridge — AWS Setup Guide

Three services required: **Cognito** (auth), **DynamoDB** (database), **S3** (file storage).
Estimated setup time: **30–45 minutes**.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Cognito — User Pool](#2-cognito--user-pool)
3. [DynamoDB — Tables](#3-dynamodb--tables)
4. [S3 — File Storage](#4-s3--file-storage)
5. [IAM — Permissions](#5-iam--permissions)
6. [Environment Variables](#6-environment-variables)
7. [Verify Setup](#7-verify-setup)

---

## 1. Prerequisites

- AWS account with admin access
- AWS CLI installed and configured (`aws configure`)
- Node.js 18+ and npm

```bash
# Verify AWS CLI is working
aws sts get-caller-identity
```

Set your region (all commands below use `us-east-2` — change if needed):

```bash
export AWS_REGION=us-east-2
```

---

## 2. Cognito — User Pool

TalentBridge uses **one user pool** for both companies and talent. The role is stored in a `custom:role` attribute (`company` or `talent`).

### 2.1 Create User Pool

```bash
aws cognito-idp create-user-pool \
  --pool-name talentbridge-users \
  --region $AWS_REGION \
  --policies '{
    "PasswordPolicy": {
      "MinimumLength": 8,
      "RequireUppercase": true,
      "RequireLowercase": true,
      "RequireNumbers": true,
      "RequireSymbols": false,
      "TemporaryPasswordValidityDays": 7
    }
  }' \
  --auto-verified-attributes email \
  --username-attributes email \
  --verification-message-template '{
    "DefaultEmailOption": "CONFIRM_WITH_CODE",
    "EmailSubject": "TalentBridge — Verify your email",
    "EmailMessage": "Your verification code is {####}. It expires in 10 minutes."
  }' \
  --schema '[
    {"Name":"email","AttributeDataType":"String","Required":true,"Mutable":true},
    {"Name":"name","AttributeDataType":"String","Required":false,"Mutable":true},
    {"Name":"role","AttributeDataType":"String","Required":false,"Mutable":false,"StringAttributeConstraints":{"MinLength":"1","MaxLength":"10"}},
    {"Name":"companyName","AttributeDataType":"String","Required":false,"Mutable":true,"StringAttributeConstraints":{"MinLength":"0","MaxLength":"200"}}
  ]' \
  --account-recovery-setting '{
    "RecoveryMechanisms": [{"Priority": 1, "Name": "verified_email"}]
  }'
```

Copy the `Id` from the output — this is your `NEXT_PUBLIC_COGNITO_USER_POOL_ID`.

### 2.2 Create App Client

```bash
# Replace USER_POOL_ID with the Id from above
aws cognito-idp create-user-pool-client \
  --user-pool-id USER_POOL_ID \
  --client-name talentbridge-web \
  --region $AWS_REGION \
  --no-generate-secret \
  --explicit-auth-flows ALLOW_USER_PASSWORD_AUTH ALLOW_REFRESH_TOKEN_AUTH \
  --token-validity-units '{"AccessToken":"hours","IdToken":"hours","RefreshToken":"days"}' \
  --access-token-validity 24 \
  --id-token-validity 24 \
  --refresh-token-validity 30 \
  --prevent-user-existence-errors ENABLED
```

Copy the `ClientId` from the output — this is your `NEXT_PUBLIC_COGNITO_CLIENT_ID`.

### 2.3 Enable USER_PASSWORD_AUTH

In the AWS Console:
1. Go to **Cognito → User pools → talentbridge-users → App clients**
2. Click the app client → **Edit**
3. Under Authentication flows, enable **ALLOW_USER_PASSWORD_AUTH**
4. Save

### 2.4 Configure Email (Optional — SES for production)

By default Cognito uses its own email sender (limited to 50 emails/day). For production:

1. Verify your domain in **SES**
2. In Cognito → User pool → **Messaging → Email**
3. Switch from "Cognito default" to "Send email with SES"
4. Enter your verified SES identity ARN

For development, the default Cognito email is fine.

---

## 3. DynamoDB — Tables


create them manually with the CLI:

### 3.1 Companies

```bash
aws dynamodb create-table \
  --table-name talentbridge-companies \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region $AWS_REGION
```

### 3.2 Jobs

```bash
aws dynamodb create-table \
  --table-name talentbridge-jobs \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=companyId,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --global-secondary-indexes '[{
    "IndexName": "companyId-index",
    "KeySchema": [{"AttributeName":"companyId","KeyType":"HASH"}],
    "Projection": {"ProjectionType":"ALL"}
  }]' \
  --billing-mode PAY_PER_REQUEST \
  --region $AWS_REGION
```

### 3.3 Candidates (Talent Profiles)

```bash
aws dynamodb create-table \
  --table-name talentbridge-candidates \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region $AWS_REGION
```

### 3.4 Applications

```bash
aws dynamodb create-table \
  --table-name talentbridge-applications \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=jobId,AttributeType=S \
    AttributeName=candidateId,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --global-secondary-indexes '[
    {
      "IndexName": "jobId-index",
      "KeySchema": [{"AttributeName":"jobId","KeyType":"HASH"}],
      "Projection": {"ProjectionType":"ALL"}
    },
    {
      "IndexName": "candidateId-index",
      "KeySchema": [{"AttributeName":"candidateId","KeyType":"HASH"}],
      "Projection": {"ProjectionType":"ALL"}
    }
  ]' \
  --billing-mode PAY_PER_REQUEST \
  --region $AWS_REGION
```

### 3.5 Conversations

```bash
aws dynamodb create-table \
  --table-name talentbridge-conversations \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region $AWS_REGION
```

### 3.6 Messages

```bash
aws dynamodb create-table \
  --table-name talentbridge-messages \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=conversationId,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --global-secondary-indexes '[{
    "IndexName": "conversationId-index",
    "KeySchema": [{"AttributeName":"conversationId","KeyType":"HASH"}],
    "Projection": {"ProjectionType":"ALL"}
  }]' \
  --billing-mode PAY_PER_REQUEST \
  --region $AWS_REGION
```

### 3.7 Users

```bash
aws dynamodb create-table \
  --table-name talentbridge-users \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=email,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --global-secondary-indexes '[{
    "IndexName": "email-index",
    "KeySchema": [{"AttributeName":"email","KeyType":"HASH"}],
    "Projection": {"ProjectionType":"ALL"}
  }]' \
  --billing-mode PAY_PER_REQUEST \
  --region $AWS_REGION
```

### 3.8 Audit Logs

```bash
aws dynamodb create-table \
  --table-name talentbridge-audit-logs \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region $AWS_REGION
```

### 3.9 CRM Jobs (Scraped)

```bash
aws dynamodb create-table \
  --table-name talentbridge-crm-jobs \
  --attribute-definitions AttributeName=pk,AttributeType=S \
  --key-schema AttributeName=pk,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region $AWS_REGION
```

### 3.10 Discovered Candidates (CRM)

```bash
aws dynamodb create-table \
  --table-name talentbridge-discovered-candidates \
  --attribute-definitions AttributeName=pk,AttributeType=S \
  --key-schema AttributeName=pk,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region $AWS_REGION
```

### Verify Tables Were Created

```bash
aws dynamodb list-tables --region $AWS_REGION
```

Expected output:
```json
{
  "TableNames": [
    "talentbridge-applications",
    "talentbridge-audit-logs",
    "talentbridge-candidates",
    "talentbridge-companies",
    "talentbridge-conversations",
    "talentbridge-crm-jobs",
    "talentbridge-discovered-candidates",
    "talentbridge-jobs",
    "talentbridge-messages",
    "talentbridge-users"
  ]
}
```

---

## 4. S3 — File Storage

One bucket stores resumes, avatars, and company logos.

### 4.1 Create Bucket

```bash
# Create bucket (us-east-2 requires LocationConstraint)
aws s3api create-bucket \
  --bucket talentbridge-uploads \
  --region us-east-2 \
  --create-bucket-configuration LocationConstraint=us-east-2
```

### 4.2 Block Public Access

```bash
aws s3api put-public-access-block \
  --bucket talentbridge-uploads \
  --public-access-block-configuration \
    BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
```

### 4.3 Enable CORS (for browser direct uploads)

```bash
aws s3api put-bucket-cors \
  --bucket talentbridge-uploads \
  --cors-configuration '{
    "CORSRules": [{
      "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
      "AllowedMethods": ["GET", "PUT", "POST"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3600
    }]
  }'
```

### 4.4 Enable Server-Side Encryption

```bash
aws s3api put-bucket-encryption \
  --bucket talentbridge-uploads \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      },
      "BucketKeyEnabled": true
    }]
  }'
```

### 4.5 Lifecycle Policy (auto-delete temp files)

```bash
aws s3api put-bucket-lifecycle-configuration \
  --bucket talentbridge-uploads \
  --lifecycle-configuration '{
    "Rules": [{
      "ID": "delete-temp-uploads",
      "Status": "Enabled",
      "Filter": {"Prefix": "temp/"},
      "Expiration": {"Days": 1}
    }]
  }'
```

---

## 5. IAM — Permissions

Create an IAM user (or role) with the minimum permissions TalentBridge needs.

### 5.1 Create Policy

```bash
aws iam create-policy \
  --policy-name TalentBridgeAppPolicy \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Sid": "CognitoAccess",
        "Effect": "Allow",
        "Action": [
          "cognito-idp:InitiateAuth",
          "cognito-idp:SignUp",
          "cognito-idp:ConfirmSignUp",
          "cognito-idp:ForgotPassword",
          "cognito-idp:ConfirmForgotPassword",
          "cognito-idp:GlobalSignOut",
          "cognito-idp:AdminGetUser",
          "cognito-idp:AdminCreateUser",
          "cognito-idp:AdminDeleteUser"
        ],
        "Resource": "arn:aws:cognito-idp:*:*:userpool/*"
      },
      {
        "Sid": "DynamoDBAccess",
        "Effect": "Allow",
        "Action": [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:TransactWrite",
          "dynamodb:BatchGetItem",
          "dynamodb:BatchWriteItem"
        ],
        "Resource": [
          "arn:aws:dynamodb:*:*:table/talentbridge-*",
          "arn:aws:dynamodb:*:*:table/talentbridge-*/index/*"
        ]
      },
      {
        "Sid": "S3Access",
        "Effect": "Allow",
        "Action": [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:GeneratePresignedUrl"
        ],
        "Resource": "arn:aws:s3:::talentbridge-uploads/*"
      },
      {
        "Sid": "S3ListBucket",
        "Effect": "Allow",
        "Action": "s3:ListBucket",
        "Resource": "arn:aws:s3:::talentbridge-uploads"
      }
    ]
  }'
```

### 5.2 Create IAM User and Attach Policy

```bash
# Create user
aws iam create-user --user-name talentbridge-app

# Attach policy (replace ACCOUNT_ID)
aws iam attach-user-policy \
  --user-name talentbridge-app \
  --policy-arn arn:aws:iam::ACCOUNT_ID:policy/TalentBridgeAppPolicy

# Create access key
aws iam create-access-key --user-name talentbridge-app
```

Save the `AccessKeyId` and `SecretAccessKey` from the output into `.env.local`.

---

## 6. Environment Variables

After completing the setup above, your `.env.local` should look like this:

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=TalentBridge

# AWS Cognito — single pool, role stored in custom:role attribute
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-2_XXXXXXXXX   # from step 2.1
NEXT_PUBLIC_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx # from step 2.2

# AWS Credentials — from step 5.2
AWS_REGION=us-east-2
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# DynamoDB Tables
DYNAMODB_COMPANIES_TABLE=talentbridge-companies
DYNAMODB_JOBS_TABLE=talentbridge-jobs
DYNAMODB_CANDIDATES_TABLE=talentbridge-candidates
DYNAMODB_APPLICATIONS_TABLE=talentbridge-applications
DYNAMODB_CONVERSATIONS_TABLE=talentbridge-conversations
DYNAMODB_MESSAGES_TABLE=talentbridge-messages
DYNAMODB_DISCOVERED_TABLE=talentbridge-discovered-candidates
DYNAMODB_CRM_JOBS_TABLE=talentbridge-crm-jobs
DYNAMODB_AUDIT_TABLE=talentbridge-audit-logs
DYNAMODB_USERS_TABLE=talentbridge-users

# S3
S3_BUCKET_NAME=talentbridge-uploads
S3_REGION=us-east-2
NEXT_PUBLIC_S3_BUCKET_URL=https://talentbridge-uploads.s3.us-east-2.amazonaws.com

# Internal Security
INTERNAL_API_SECRET=   # openssl rand -hex 32
ADMIN_PASSWORD=talentbridge-admin

# Optional: GitHub token for CRM candidate discovery
GITHUB_TOKEN=
```

---

## 7. Verify Setup

### Health check

```bash
# Start the dev server
npm run dev

# Hit the health endpoint
curl http://localhost:3000/api/health
```

Expected response:
```json
{ "status": "ok", "dynamodb": "connected", "timestamp": "..." }
```

### Test auth flow

1. Open `http://localhost:3000/auth/register`
2. Create a company account
3. Check your email for the 6-digit code
4. Enter it on the verify page → should redirect to onboarding

### Test S3 upload

After logging in as talent, go to `/talent/profile` → try uploading a profile photo or resume.

---

## Cost Estimate (Monthly)

| Service   | Free Tier                          | Paid (after free tier)     |
|-----------|-------------------------------------|----------------------------|
| Cognito   | 50,000 MAU free                    | $0.0055 / MAU              |
| DynamoDB  | 25 GB storage + 25 WCU/RCU free    | $0.25/GB + $0.00065/WCU    |
| S3        | 5 GB storage + 20k GET free        | $0.023/GB storage          |
| **Total** | **$0 for early stage**              | **~$5–15/mo at 1k users**  |

All three services have generous free tiers — you won't pay anything until you have real traffic.
