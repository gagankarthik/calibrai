# Calibr — AWS Production Infrastructure Setup Guide

Complete, step-by-step deployment guide for the Calibr AI hiring platform on AWS.
Every command is copy-pasteable. Estimated total setup time: 4–6 hours.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Prerequisites](#2-prerequisites)
3. [Step-by-Step Setup](#3-step-by-step-setup)
   - [3.1 Cognito (Auth)](#31-cognito-setup)
   - [3.2 RDS PostgreSQL](#32-rds-postgresql)
   - [3.3 ElastiCache Redis](#33-elasticache-redis)
   - [3.4 S3 Buckets](#34-s3-buckets)
   - [3.5 SES Email](#35-ses-email-setup)
   - [3.6 OpenSearch](#36-opensearch)
   - [3.7 SQS + Lambda (AI Matching)](#37-sqs--lambda-ai-matching)
   - [3.8 Amplify Deployment](#38-amplify-deployment)
   - [3.9 CloudFront + WAF](#39-cloudfront--waf)
4. [Environment Variables](#4-environment-variables)
5. [Database Schema](#5-database-schema-postgresql)
6. [CI/CD Pipeline](#6-cicd-pipeline-github-actions)
7. [Estimated Costs](#7-estimated-costs)
8. [Monitoring & Alerts](#8-monitoring--alerts)

---

## 1. Architecture Overview

```
                          ┌─────────────────────────────────────────────────────────────┐
                          │                        INTERNET                             │
                          └────────────────────────────┬────────────────────────────────┘
                                                       │
                                                  ┌────▼────┐
                                                  │ Route53 │  calibr.ai DNS
                                                  └────┬────┘
                                                       │
                                              ┌────────▼────────┐
                                              │   CloudFront    │  CDN + WAF
                                              │  + AWS WAF      │  (rate limit, SQLi, XSS)
                                              └────┬────────┬───┘
                                                   │        │
                            ┌──────────────────────▼──┐  ┌──▼─────────────────────────┐
                            │   AWS Amplify Hosting   │  │   API Gateway (HTTP API)   │
                            │   (Next.js SSR/SSG)     │  │   + Lambda (API routes)    │
                            │   calibr.ai             │  │   api.calibr.ai            │
                            └─────────────────────────┘  └──┬─────────────────────────┘
                                                            │
                          ┌─────────────────────────────────┼──────────────────────────┐
                          │              PRIVATE VPC (10.0.0.0/16)                     │
                          │                                  │                          │
                          │   ┌──────────────────┐   ┌──────▼──────────┐              │
                          │   │  Cognito User    │   │   RDS Postgres  │              │
                          │   │  Pools           │   │   15 (Primary)  │              │
                          │   │  - CompanyPool   │   │   Multi-AZ      │              │
                          │   │  - TalentPool    │   │   Private Subnet│              │
                          │   └──────────────────┘   └──────┬──────────┘              │
                          │                                  │ Read Replica            │
                          │   ┌──────────────────┐   ┌──────▼──────────┐              │
                          │   │  ElastiCache     │   │   RDS Postgres  │              │
                          │   │  Redis 7.x       │   │   (Read Replica)│              │
                          │   │  Session/Cache   │   │   Private Subnet│              │
                          │   └──────────────────┘   └─────────────────┘              │
                          │                                                             │
                          │   ┌──────────────────┐   ┌─────────────────┐              │
                          │   │  SQS Queue       │   │  OpenSearch     │              │
                          │   │  calibr-matching │   │  Domain         │              │
                          │   │  + DLQ           │   │  Jobs/Candidates│              │
                          │   └────────┬─────────┘   └─────────────────┘              │
                          │            │                                                │
                          │   ┌────────▼─────────┐   ┌─────────────────┐              │
                          │   │  Lambda Function │   │  S3 Buckets     │              │
                          │   │  AI Match Scorer │   │  - resumes      │              │
                          │   │  (Node.js 20)    │   │  - assets       │              │
                          │   └──────────────────┘   │  - exports      │              │
                          │                           └─────────────────┘              │
                          │                                                             │
                          │   ┌──────────────────┐   ┌─────────────────┐              │
                          │   │  SES             │   │  CloudWatch     │              │
                          │   │  Email service   │   │  Logs + Metrics │              │
                          │   │  Verified domain │   │  + Alarms       │              │
                          │   └──────────────────┘   └─────────────────┘              │
                          └─────────────────────────────────────────────────────────────┘
```

**Key design decisions:**
- Next.js runs on Amplify (handles SSR, ISR, edge functions automatically)
- API routes become Lambda functions via Amplify or a separate API Gateway
- RDS is in a private subnet — only accessible from within the VPC
- Redis handles session tokens and caches expensive OpenSearch queries
- SQS decouples the AI matching pipeline from the main request cycle
- Cognito manages two separate user pools: companies and talent

---

## 2. Prerequisites

### 2.1 AWS CLI v2

**Windows (PowerShell as Administrator):**
```powershell
# Download and install AWS CLI v2
msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi /quiet
# Verify
aws --version
# Expected: aws-cli/2.x.x Python/3.x.x Windows/10 exe/AMD64
```

**macOS:**
```bash
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /
aws --version
```

**Linux (Ubuntu/Debian):**
```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
aws --version
```

### 2.2 Configure AWS CLI

```bash
aws configure
# AWS Access Key ID: <your-access-key>
# AWS Secret Access Key: <your-secret-key>
# Default region name: us-east-1
# Default output format: json

# Verify your identity
aws sts get-caller-identity
```

### 2.3 Node.js 20+ and pnpm

```bash
# Install Node.js 20 (use nvm)
nvm install 20
nvm use 20
node --version  # v20.x.x

# Install pnpm
npm install -g pnpm
pnpm --version
```

### 2.4 Terraform (Option A)

```bash
# Windows (via Chocolatey)
choco install terraform

# macOS
brew tap hashicorp/tap
brew install hashicorp/tap/terraform

# Linux
wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt update && sudo apt install terraform

terraform --version
```

### 2.5 AWS CDK (Option B)

```bash
npm install -g aws-cdk
cdk --version

# Bootstrap CDK in your account (one-time per account/region)
cdk bootstrap aws://ACCOUNT-NUMBER/us-east-1
```

### 2.6 Required IAM Permissions

Create an IAM user or role with these managed policies attached. For production, use least-privilege inline policies. For setup, these managed policies cover everything:

```
AmazonCognitoPowerUser
AmazonRDSFullAccess
AmazonElastiCacheFullAccess
AmazonS3FullAccess
AmazonSESFullAccess
AmazonOpenSearchServiceFullAccess
AmazonSQSFullAccess
AWSLambda_FullAccess
AmazonAPIGatewayAdministrator
AWSAmplifyFullAccess
CloudFrontFullAccess
AWSWAFFullAccess
CloudWatchFullAccess
AmazonRoute53FullAccess
IAMFullAccess
AmazonVPCFullAccess
```

**Create the IAM user:**
```bash
aws iam create-user --user-name calibr-deployer

# Attach managed policies
for policy in \
  "AmazonCognitoPowerUser" \
  "AmazonRDSFullAccess" \
  "AmazonElastiCacheFullAccess" \
  "AmazonS3FullAccess" \
  "AmazonSESFullAccess" \
  "AWSLambda_FullAccess" \
  "AmazonSQSFullAccess" \
  "AWSAmplifyFullAccess" \
  "CloudWatchFullAccess" \
  "AmazonVPCFullAccess"; do
  aws iam attach-user-policy \
    --user-name calibr-deployer \
    --policy-arn "arn:aws:iam::aws:policy/$policy"
done

# Create access keys
aws iam create-access-key --user-name calibr-deployer
```

### 2.7 Set Environment Variables for This Guide

```bash
# Set these before running any commands below
export AWS_REGION="us-east-1"
export APP_ENV="dev"          # or "prod"
export APP_NAME="calibr"
export ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

echo "Account: $ACCOUNT_ID | Region: $AWS_REGION | Env: $APP_ENV"
```

---

## 3. Step-by-Step Setup

### 3.1 Cognito Setup

Calibr uses two separate User Pools: one for company (recruiter) accounts and one for talent (candidate) accounts. This allows completely independent auth flows, password policies, and custom attributes.

#### 3.1.1 Create the Company User Pool

```bash
# Create CompanyPool
COMPANY_POOL_ID=$(aws cognito-idp create-user-pool \
  --pool-name "calibr-company-pool-${APP_ENV}" \
  --region "$AWS_REGION" \
  --policies '{
    "PasswordPolicy": {
      "MinimumLength": 12,
      "RequireUppercase": true,
      "RequireLowercase": true,
      "RequireNumbers": true,
      "RequireSymbols": true,
      "TemporaryPasswordValidityDays": 7
    }
  }' \
  --auto-verified-attributes email \
  --username-attributes email \
  --mfa-configuration OPTIONAL \
  --sms-mfa-configuration '{"SmsAuthenticationMessage": "Your Calibr verification code is {####}"}' \
  --email-configuration '{
    "EmailSendingAccount": "COGNITO_DEFAULT"
  }' \
  --verification-message-template '{
    "DefaultEmailOption": "CONFIRM_WITH_CODE",
    "EmailSubject": "Verify your Calibr company account",
    "EmailMessage": "Your Calibr verification code is {####}. This code expires in 24 hours."
  }' \
  --schema '[
    {
      "Name": "company_name",
      "AttributeDataType": "String",
      "Mutable": true,
      "Required": false,
      "StringAttributeConstraints": {"MinLength": "1", "MaxLength": "256"}
    },
    {
      "Name": "plan",
      "AttributeDataType": "String",
      "Mutable": true,
      "Required": false,
      "StringAttributeConstraints": {"MinLength": "1", "MaxLength": "50"}
    },
    {
      "Name": "stripe_customer_id",
      "AttributeDataType": "String",
      "Mutable": true,
      "Required": false,
      "StringAttributeConstraints": {"MinLength": "1", "MaxLength": "256"}
    }
  ]' \
  --query 'UserPool.Id' \
  --output text)

echo "Company Pool ID: $COMPANY_POOL_ID"
```

#### 3.1.2 Create the Talent User Pool

```bash
# Create TalentPool
TALENT_POOL_ID=$(aws cognito-idp create-user-pool \
  --pool-name "calibr-talent-pool-${APP_ENV}" \
  --region "$AWS_REGION" \
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
  --mfa-configuration OFF \
  --email-configuration '{
    "EmailSendingAccount": "COGNITO_DEFAULT"
  }' \
  --verification-message-template '{
    "DefaultEmailOption": "CONFIRM_WITH_CODE",
    "EmailSubject": "Welcome to Calibr — verify your account",
    "EmailMessage": "Your Calibr verification code is {####}. Start discovering top opportunities today!"
  }' \
  --schema '[
    {
      "Name": "headline",
      "AttributeDataType": "String",
      "Mutable": true,
      "Required": false,
      "StringAttributeConstraints": {"MinLength": "1", "MaxLength": "256"}
    },
    {
      "Name": "availability",
      "AttributeDataType": "String",
      "Mutable": true,
      "Required": false,
      "StringAttributeConstraints": {"MinLength": "1", "MaxLength": "100"}
    }
  ]' \
  --query 'UserPool.Id' \
  --output text)

echo "Talent Pool ID: $TALENT_POOL_ID"
```

#### 3.1.3 Create App Clients

```bash
# Company App Client (for Next.js frontend - no secret, uses PKCE)
COMPANY_CLIENT_ID=$(aws cognito-idp create-user-pool-client \
  --user-pool-id "$COMPANY_POOL_ID" \
  --client-name "calibr-company-web-${APP_ENV}" \
  --no-generate-secret \
  --explicit-auth-flows \
    ALLOW_USER_SRP_AUTH \
    ALLOW_REFRESH_TOKEN_AUTH \
    ALLOW_USER_PASSWORD_AUTH \
  --supported-identity-providers COGNITO \
  --callback-urls "https://calibr.ai/auth/callback" "http://localhost:3000/auth/callback" \
  --logout-urls "https://calibr.ai/login" "http://localhost:3000/login" \
  --allowed-o-auth-flows code \
  --allowed-o-auth-scopes openid email profile \
  --allowed-o-auth-flows-user-pool-client \
  --token-validity-units '{"AccessToken":"hours","IdToken":"hours","RefreshToken":"days"}' \
  --access-token-validity 1 \
  --id-token-validity 1 \
  --refresh-token-validity 30 \
  --query 'UserPoolClient.ClientId' \
  --output text)

echo "Company Client ID: $COMPANY_CLIENT_ID"

# Talent App Client
TALENT_CLIENT_ID=$(aws cognito-idp create-user-pool-client \
  --user-pool-id "$TALENT_POOL_ID" \
  --client-name "calibr-talent-web-${APP_ENV}" \
  --no-generate-secret \
  --explicit-auth-flows \
    ALLOW_USER_SRP_AUTH \
    ALLOW_REFRESH_TOKEN_AUTH \
    ALLOW_USER_PASSWORD_AUTH \
  --supported-identity-providers COGNITO \
  --callback-urls "https://calibr.ai/talent/auth/callback" "http://localhost:3000/talent/auth/callback" \
  --logout-urls "https://calibr.ai/login" "http://localhost:3000/login" \
  --allowed-o-auth-flows code \
  --allowed-o-auth-scopes openid email profile \
  --allowed-o-auth-flows-user-pool-client \
  --access-token-validity 1 \
  --id-token-validity 1 \
  --refresh-token-validity 30 \
  --query 'UserPoolClient.ClientId' \
  --output text)

echo "Talent Client ID: $TALENT_CLIENT_ID"
```

#### 3.1.4 Configure Hosted UI Domain

```bash
# Set a custom domain prefix for each pool
aws cognito-idp create-user-pool-domain \
  --domain "calibr-company-${APP_ENV}" \
  --user-pool-id "$COMPANY_POOL_ID"

aws cognito-idp create-user-pool-domain \
  --domain "calibr-talent-${APP_ENV}" \
  --user-pool-id "$TALENT_POOL_ID"

# The hosted UI URLs will be:
# Company: https://calibr-company-dev.auth.us-east-1.amazoncognito.com
# Talent:  https://calibr-talent-dev.auth.us-east-1.amazoncognito.com
```

#### 3.1.5 Save the Cognito Values

```bash
echo "=========================================="
echo "COGNITO VALUES (save to .env.local)"
echo "=========================================="
echo "NEXT_PUBLIC_COGNITO_USER_POOL_ID_COMPANY=$COMPANY_POOL_ID"
echo "NEXT_PUBLIC_COGNITO_USER_POOL_ID_TALENT=$TALENT_POOL_ID"
echo "NEXT_PUBLIC_COGNITO_CLIENT_ID_COMPANY=$COMPANY_CLIENT_ID"
echo "NEXT_PUBLIC_COGNITO_CLIENT_ID_TALENT=$TALENT_CLIENT_ID"
echo "NEXT_PUBLIC_COGNITO_REGION=$AWS_REGION"
```

---

### 3.2 RDS PostgreSQL

#### 3.2.1 Create the VPC and Subnets

```bash
# Create VPC
VPC_ID=$(aws ec2 create-vpc \
  --cidr-block 10.0.0.0/16 \
  --tag-specifications "ResourceType=vpc,Tags=[{Key=Name,Value=calibr-vpc-${APP_ENV}}]" \
  --query 'Vpc.VpcId' \
  --output text)

echo "VPC ID: $VPC_ID"

# Enable DNS hostnames (required for RDS)
aws ec2 modify-vpc-attribute --vpc-id "$VPC_ID" --enable-dns-hostnames

# Create Internet Gateway
IGW_ID=$(aws ec2 create-internet-gateway \
  --tag-specifications "ResourceType=internet-gateway,Tags=[{Key=Name,Value=calibr-igw-${APP_ENV}}]" \
  --query 'InternetGateway.InternetGatewayId' \
  --output text)

aws ec2 attach-internet-gateway --vpc-id "$VPC_ID" --internet-gateway-id "$IGW_ID"

# Create public subnets (for NAT Gateway and Amplify)
PUB_SUBNET_1=$(aws ec2 create-subnet \
  --vpc-id "$VPC_ID" \
  --cidr-block 10.0.1.0/24 \
  --availability-zone "${AWS_REGION}a" \
  --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=calibr-public-1a}]" \
  --query 'Subnet.SubnetId' \
  --output text)

PUB_SUBNET_2=$(aws ec2 create-subnet \
  --vpc-id "$VPC_ID" \
  --cidr-block 10.0.2.0/24 \
  --availability-zone "${AWS_REGION}b" \
  --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=calibr-public-1b}]" \
  --query 'Subnet.SubnetId' \
  --output text)

# Create private subnets (for RDS, Redis, Lambda)
PRIV_SUBNET_1=$(aws ec2 create-subnet \
  --vpc-id "$VPC_ID" \
  --cidr-block 10.0.11.0/24 \
  --availability-zone "${AWS_REGION}a" \
  --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=calibr-private-1a}]" \
  --query 'Subnet.SubnetId' \
  --output text)

PRIV_SUBNET_2=$(aws ec2 create-subnet \
  --vpc-id "$VPC_ID" \
  --cidr-block 10.0.12.0/24 \
  --availability-zone "${AWS_REGION}b" \
  --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=calibr-private-1b}]" \
  --query 'Subnet.SubnetId' \
  --output text)

echo "Public subnets:  $PUB_SUBNET_1, $PUB_SUBNET_2"
echo "Private subnets: $PRIV_SUBNET_1, $PRIV_SUBNET_2"
```

#### 3.2.2 Create NAT Gateway and Route Tables

```bash
# Allocate Elastic IP for NAT Gateway
EIP_ALLOC=$(aws ec2 allocate-address \
  --domain vpc \
  --query 'AllocationId' \
  --output text)

# Create NAT Gateway in first public subnet
NAT_GW=$(aws ec2 create-nat-gateway \
  --subnet-id "$PUB_SUBNET_1" \
  --allocation-id "$EIP_ALLOC" \
  --query 'NatGateway.NatGatewayId' \
  --output text)

echo "Waiting for NAT Gateway to become available..."
aws ec2 wait nat-gateway-available --nat-gateway-ids "$NAT_GW"

# Create public route table
PUB_RT=$(aws ec2 create-route-table \
  --vpc-id "$VPC_ID" \
  --query 'RouteTable.RouteTableId' \
  --output text)

aws ec2 create-route --route-table-id "$PUB_RT" --destination-cidr-block 0.0.0.0/0 --gateway-id "$IGW_ID"
aws ec2 associate-route-table --subnet-id "$PUB_SUBNET_1" --route-table-id "$PUB_RT"
aws ec2 associate-route-table --subnet-id "$PUB_SUBNET_2" --route-table-id "$PUB_RT"

# Create private route table (routes internet-bound traffic through NAT)
PRIV_RT=$(aws ec2 create-route-table \
  --vpc-id "$VPC_ID" \
  --query 'RouteTable.RouteTableId' \
  --output text)

aws ec2 create-route --route-table-id "$PRIV_RT" --destination-cidr-block 0.0.0.0/0 --nat-gateway-id "$NAT_GW"
aws ec2 associate-route-table --subnet-id "$PRIV_SUBNET_1" --route-table-id "$PRIV_RT"
aws ec2 associate-route-table --subnet-id "$PRIV_SUBNET_2" --route-table-id "$PRIV_RT"
```

#### 3.2.3 Create Security Groups

```bash
# Security group for RDS
RDS_SG=$(aws ec2 create-security-group \
  --group-name "calibr-rds-sg-${APP_ENV}" \
  --description "Calibr RDS PostgreSQL security group" \
  --vpc-id "$VPC_ID" \
  --query 'GroupId' \
  --output text)

# Security group for Lambda/App (will call RDS)
APP_SG=$(aws ec2 create-security-group \
  --group-name "calibr-app-sg-${APP_ENV}" \
  --description "Calibr application security group" \
  --vpc-id "$VPC_ID" \
  --query 'GroupId' \
  --output text)

# Allow app security group to access RDS on port 5432
aws ec2 authorize-security-group-ingress \
  --group-id "$RDS_SG" \
  --protocol tcp \
  --port 5432 \
  --source-group "$APP_SG"

# Security group for Redis
REDIS_SG=$(aws ec2 create-security-group \
  --group-name "calibr-redis-sg-${APP_ENV}" \
  --description "Calibr ElastiCache Redis security group" \
  --vpc-id "$VPC_ID" \
  --query 'GroupId' \
  --output text)

# Allow app to access Redis on port 6379
aws ec2 authorize-security-group-ingress \
  --group-id "$REDIS_SG" \
  --protocol tcp \
  --port 6379 \
  --source-group "$APP_SG"

echo "RDS SG: $RDS_SG | App SG: $APP_SG | Redis SG: $REDIS_SG"
```

#### 3.2.4 Create RDS Subnet Group

```bash
aws rds create-db-subnet-group \
  --db-subnet-group-name "calibr-db-subnet-group-${APP_ENV}" \
  --db-subnet-group-description "Calibr private subnet group for RDS" \
  --subnet-ids "$PRIV_SUBNET_1" "$PRIV_SUBNET_2"
```

#### 3.2.5 Create RDS Parameter Group

```bash
aws rds create-db-parameter-group \
  --db-parameter-group-name "calibr-pg15-params-${APP_ENV}" \
  --db-parameter-group-family postgres15 \
  --description "Calibr PostgreSQL 15 parameter group"

# Tune key parameters
aws rds modify-db-parameter-group \
  --db-parameter-group-name "calibr-pg15-params-${APP_ENV}" \
  --parameters \
    "ParameterName=max_connections,ParameterValue=200,ApplyMethod=pending-reboot" \
    "ParameterName=shared_buffers,ParameterValue={DBInstanceClassMemory/4},ApplyMethod=pending-reboot" \
    "ParameterName=effective_cache_size,ParameterValue={DBInstanceClassMemory*3/4},ApplyMethod=immediate" \
    "ParameterName=maintenance_work_mem,ParameterValue=65536,ApplyMethod=immediate" \
    "ParameterName=checkpoint_completion_target,ParameterValue=0.9,ApplyMethod=immediate" \
    "ParameterName=wal_buffers,ParameterValue=16384,ApplyMethod=pending-reboot" \
    "ParameterName=default_statistics_target,ParameterValue=100,ApplyMethod=immediate" \
    "ParameterName=log_min_duration_statement,ParameterValue=1000,ApplyMethod=immediate" \
    "ParameterName=log_connections,ParameterValue=1,ApplyMethod=immediate"
```

#### 3.2.6 Create RDS Instance

**Dev environment (db.t3.medium):**
```bash
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
echo "DB PASSWORD (save this!): $DB_PASSWORD"

aws rds create-db-instance \
  --db-instance-identifier "calibr-db-${APP_ENV}" \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --engine-version 15.4 \
  --master-username calibr_admin \
  --master-user-password "$DB_PASSWORD" \
  --db-name calibr \
  --db-subnet-group-name "calibr-db-subnet-group-${APP_ENV}" \
  --vpc-security-group-ids "$RDS_SG" \
  --db-parameter-group-name "calibr-pg15-params-${APP_ENV}" \
  --allocated-storage 100 \
  --max-allocated-storage 500 \
  --storage-type gp3 \
  --storage-encrypted \
  --backup-retention-period 7 \
  --preferred-backup-window "02:00-03:00" \
  --preferred-maintenance-window "sun:04:00-sun:05:00" \
  --no-publicly-accessible \
  --deletion-protection \
  --copy-tags-to-snapshot \
  --tags "Key=Environment,Value=${APP_ENV}" "Key=Project,Value=calibr"

echo "Waiting for RDS instance (this takes 5-10 minutes)..."
aws rds wait db-instance-available --db-instance-identifier "calibr-db-${APP_ENV}"

# Get the endpoint
RDS_ENDPOINT=$(aws rds describe-db-instances \
  --db-instance-identifier "calibr-db-${APP_ENV}" \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text)

echo "RDS Endpoint: $RDS_ENDPOINT"
echo "DATABASE_URL=postgresql://calibr_admin:${DB_PASSWORD}@${RDS_ENDPOINT}:5432/calibr"
```

**Production environment (db.r6g.xlarge, Multi-AZ):**
```bash
# Replace the create-db-instance command with:
aws rds create-db-instance \
  --db-instance-identifier "calibr-db-prod" \
  --db-instance-class db.r6g.xlarge \
  --engine postgres \
  --engine-version 15.4 \
  --master-username calibr_admin \
  --master-user-password "$DB_PASSWORD" \
  --db-name calibr \
  --db-subnet-group-name "calibr-db-subnet-group-prod" \
  --vpc-security-group-ids "$RDS_SG" \
  --db-parameter-group-name "calibr-pg15-params-prod" \
  --allocated-storage 500 \
  --max-allocated-storage 2000 \
  --storage-type gp3 \
  --iops 3000 \
  --storage-encrypted \
  --kms-key-id alias/aws/rds \
  --backup-retention-period 35 \
  --preferred-backup-window "01:00-02:00" \
  --multi-az \
  --no-publicly-accessible \
  --deletion-protection \
  --performance-insights-enabled \
  --performance-insights-retention-period 7 \
  --monitoring-interval 60 \
  --tags "Key=Environment,Value=prod" "Key=Project,Value=calibr"
```

---

### 3.3 ElastiCache Redis

#### 3.3.1 Create Redis Subnet Group

```bash
aws elasticache create-cache-subnet-group \
  --cache-subnet-group-name "calibr-redis-subnet-${APP_ENV}" \
  --cache-subnet-group-description "Calibr Redis subnet group" \
  --subnet-ids "$PRIV_SUBNET_1" "$PRIV_SUBNET_2"
```

#### 3.3.2 Create Redis Cluster

```bash
aws elasticache create-replication-group \
  --replication-group-id "calibr-redis-${APP_ENV}" \
  --replication-group-description "Calibr session cache and job queue cache" \
  --cache-node-type cache.t3.medium \
  --engine redis \
  --engine-version 7.0 \
  --num-cache-clusters 2 \
  --cache-subnet-group-name "calibr-redis-subnet-${APP_ENV}" \
  --security-group-ids "$REDIS_SG" \
  --at-rest-encryption-enabled \
  --transit-encryption-enabled \
  --auth-token "$(openssl rand -base64 32 | tr -d '=+/' | cut -c1-32)" \
  --snapshot-retention-limit 3 \
  --snapshot-window "03:00-04:00" \
  --tags "Key=Environment,Value=${APP_ENV}" "Key=Project,Value=calibr"

echo "Waiting for Redis cluster (this takes 5-10 minutes)..."
aws elasticache wait replication-group-available \
  --replication-group-id "calibr-redis-${APP_ENV}"

# Get the primary endpoint
REDIS_ENDPOINT=$(aws elasticache describe-replication-groups \
  --replication-group-id "calibr-redis-${APP_ENV}" \
  --query 'ReplicationGroups[0].NodeGroups[0].PrimaryEndpoint.Address' \
  --output text)

echo "Redis Endpoint: $REDIS_ENDPOINT"
echo "REDIS_URL=rediss://:AUTH_TOKEN@${REDIS_ENDPOINT}:6379"
```

#### 3.3.3 Redis Usage in Next.js

Install the redis client:
```bash
pnpm add ioredis
```

Create `src/lib/redis.ts`:
```typescript
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL!, {
  tls: process.env.NODE_ENV === 'production' ? {} : undefined,
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => Math.min(times * 100, 2000),
})

export default redis

// Session helpers
export const SESSION_TTL = 60 * 60 * 24 * 7 // 7 days

export async function getSession(sessionId: string) {
  const data = await redis.get(`session:${sessionId}`)
  return data ? JSON.parse(data) : null
}

export async function setSession(sessionId: string, data: object) {
  await redis.setex(`session:${sessionId}`, SESSION_TTL, JSON.stringify(data))
}

export async function deleteSession(sessionId: string) {
  await redis.del(`session:${sessionId}`)
}

// Cache helpers
export async function getCache<T>(key: string): Promise<T | null> {
  const data = await redis.get(key)
  return data ? JSON.parse(data) : null
}

export async function setCache(key: string, data: unknown, ttlSeconds = 300) {
  await redis.setex(key, ttlSeconds, JSON.stringify(data))
}
```

---

### 3.4 S3 Buckets

#### 3.4.1 Create Resume Bucket

```bash
# Resume storage bucket
aws s3api create-bucket \
  --bucket "calibr-resumes-${APP_ENV}" \
  --region "$AWS_REGION" \
  --create-bucket-configuration LocationConstraint="$AWS_REGION"

# Block all public access (resumes are NEVER public)
aws s3api put-public-access-block \
  --bucket "calibr-resumes-${APP_ENV}" \
  --public-access-block-configuration \
    BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true

# Enable versioning (recover accidentally deleted resumes)
aws s3api put-bucket-versioning \
  --bucket "calibr-resumes-${APP_ENV}" \
  --versioning-configuration Status=Enabled

# Enable server-side encryption
aws s3api put-bucket-encryption \
  --bucket "calibr-resumes-${APP_ENV}" \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "aws:kms"
      },
      "BucketKeyEnabled": true
    }]
  }'

# Lifecycle policy — move old versions to Glacier
aws s3api put-bucket-lifecycle-configuration \
  --bucket "calibr-resumes-${APP_ENV}" \
  --lifecycle-configuration '{
    "Rules": [
      {
        "ID": "archive-old-versions",
        "Status": "Enabled",
        "NoncurrentVersionTransitions": [
          {
            "NoncurrentDays": 30,
            "StorageClass": "STANDARD_IA"
          },
          {
            "NoncurrentDays": 365,
            "StorageClass": "GLACIER"
          }
        ],
        "NoncurrentVersionExpiration": {
          "NoncurrentDays": 1825
        }
      },
      {
        "ID": "abort-incomplete-multipart",
        "Status": "Enabled",
        "AbortIncompleteMultipartUpload": {
          "DaysAfterInitiation": 7
        }
      }
    ]
  }'
```

#### 3.4.2 Create Assets Bucket (Logos, Profile Pics)

```bash
aws s3api create-bucket \
  --bucket "calibr-assets-${APP_ENV}" \
  --region "$AWS_REGION" \
  --create-bucket-configuration LocationConstraint="$AWS_REGION"

# Assets ARE publicly readable via CloudFront only — block direct S3 access
aws s3api put-public-access-block \
  --bucket "calibr-assets-${APP_ENV}" \
  --public-access-block-configuration \
    BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true

# CORS configuration (allow upload from calibr.ai)
aws s3api put-bucket-cors \
  --bucket "calibr-assets-${APP_ENV}" \
  --cors-configuration '{
    "CORSRules": [
      {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
        "AllowedOrigins": ["https://calibr.ai", "http://localhost:3000"],
        "ExposeHeaders": ["ETag", "x-amz-request-id"],
        "MaxAgeSeconds": 3600
      }
    ]
  }'

# Lifecycle — move to Infrequent Access after 90 days
aws s3api put-bucket-lifecycle-configuration \
  --bucket "calibr-assets-${APP_ENV}" \
  --lifecycle-configuration '{
    "Rules": [
      {
        "ID": "transition-to-ia",
        "Status": "Enabled",
        "Transitions": [
          {
            "Days": 90,
            "StorageClass": "STANDARD_IA"
          },
          {
            "Days": 365,
            "StorageClass": "GLACIER_IR"
          }
        ]
      }
    ]
  }'
```

#### 3.4.3 Pre-Signed URL Generation (for uploads)

Create `src/lib/s3.ts`:
```typescript
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

// Generate a pre-signed URL for a talent to upload their resume
export async function getResumeUploadUrl(talentId: string, filename: string) {
  const key = `resumes/${talentId}/${Date.now()}-${filename}`
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_RESUMES!,
    Key: key,
    ContentType: 'application/pdf',
    Metadata: { talentId, originalName: filename },
  })
  const url = await getSignedUrl(s3, command, { expiresIn: 300 }) // 5 minutes
  return { url, key }
}

// Generate a pre-signed URL for a recruiter to download a resume
export async function getResumeDownloadUrl(key: string) {
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET_RESUMES!,
    Key: key,
  })
  return getSignedUrl(s3, command, { expiresIn: 3600 }) // 1 hour
}

// Generate upload URL for profile picture or company logo
export async function getAssetUploadUrl(
  entityType: 'company' | 'talent',
  entityId: string,
  contentType: string,
  filename: string
) {
  const ext = filename.split('.').pop()
  const key = `${entityType}/${entityId}/avatar-${Date.now()}.${ext}`
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_ASSETS!,
    Key: key,
    ContentType: contentType,
  })
  const url = await getSignedUrl(s3, command, { expiresIn: 300 })
  return { url, key }
}
```

---

### 3.5 SES Email Setup

#### 3.5.1 Verify Your Domain

```bash
DOMAIN="calibr.ai"

# Start domain verification
aws ses verify-domain-identity \
  --domain "$DOMAIN" \
  --region "$AWS_REGION"

# This returns a TXT verification token. Add it to your DNS:
# Name: _amazonses.calibr.ai
# Type: TXT
# Value: <returned token>
```

#### 3.5.2 Set Up DKIM

```bash
# Generate DKIM keys (returns 3 CNAME records to add to DNS)
aws ses verify-domain-dkim \
  --domain "$DOMAIN" \
  --region "$AWS_REGION"

# Add the 3 returned CNAME records to DNS:
# <token1>._domainkey.calibr.ai -> <token1>.dkim.amazonses.com
# <token2>._domainkey.calibr.ai -> <token2>.dkim.amazonses.com
# <token3>._domainkey.calibr.ai -> <token3>.dkim.amazonses.com

# Wait for verification (check status)
aws ses get-identity-verification-attributes \
  --identities "$DOMAIN" \
  --region "$AWS_REGION"
```

#### 3.5.3 Request Production Access (Exit Sandbox)

```bash
# By default SES is in sandbox mode — you can only send to verified addresses.
# Submit a support case to move to production:
aws support create-case \
  --subject "Request to move SES out of sandbox for calibr.ai" \
  --service-code "ses" \
  --severity-code "normal" \
  --category-code "other" \
  --communication-body "We are building Calibr, an AI-powered hiring platform at calibr.ai. We need production SES access to send: welcome emails, interview invitations, application status updates, and offer letters to verified company and talent users."
```

#### 3.5.4 Create Email Templates

```bash
# Welcome email template for companies
aws ses create-template \
  --template '{
    "TemplateName": "calibr-company-welcome",
    "SubjectPart": "Welcome to Calibr, {{company_name}}!",
    "HtmlPart": "<!DOCTYPE html><html><body><h1>Welcome to Calibr, {{company_name}}!</h1><p>Hi {{first_name}}, your company account is ready. <a href=\"https://calibr.ai/company/dashboard\">Start hiring</a>.</p></body></html>",
    "TextPart": "Welcome to Calibr, {{company_name}}! Your account is ready. Visit https://calibr.ai/company/dashboard to start hiring."
  }' \
  --region "$AWS_REGION"

# Interview invite template
aws ses create-template \
  --template '{
    "TemplateName": "calibr-interview-invite",
    "SubjectPart": "Interview Invitation — {{job_title}} at {{company_name}}",
    "HtmlPart": "<!DOCTYPE html><html><body><h2>You have an interview!</h2><p>Hi {{candidate_name}},<br><br>{{company_name}} would like to interview you for <strong>{{job_title}}</strong>.<br><br>Proposed time: {{interview_time}}<br>Format: {{interview_format}}<br><br><a href=\"{{accept_url}}\">Confirm this time</a> | <a href=\"{{reschedule_url}}\">Suggest another time</a></p></body></html>",
    "TextPart": "Hi {{candidate_name}}, {{company_name}} wants to interview you for {{job_title}}. Time: {{interview_time}}. Confirm: {{accept_url}}"
  }' \
  --region "$AWS_REGION"

# Application status update template
aws ses create-template \
  --template '{
    "TemplateName": "calibr-application-update",
    "SubjectPart": "Application Update: {{job_title}} at {{company_name}}",
    "HtmlPart": "<!DOCTYPE html><html><body><p>Hi {{candidate_name}},<br><br>Your application for <strong>{{job_title}}</strong> at {{company_name}} has been updated to: <strong>{{new_status}}</strong>.<br><br>{{custom_message}}<br><br><a href=\"https://calibr.ai/talent/applications\">View your applications</a></p></body></html>",
    "TextPart": "Hi {{candidate_name}}, your application for {{job_title}} at {{company_name}} is now: {{new_status}}. {{custom_message}}"
  }' \
  --region "$AWS_REGION"

# Offer letter notification
aws ses create-template \
  --template '{
    "TemplateName": "calibr-offer-letter",
    "SubjectPart": "Offer Letter: {{job_title}} at {{company_name}}",
    "HtmlPart": "<!DOCTYPE html><html><body><h2>You have received an offer!</h2><p>Congratulations {{candidate_name}}!<br><br>{{company_name}} is excited to offer you the role of <strong>{{job_title}}</strong>.<br>Compensation: {{salary}}<br>Start date: {{start_date}}<br><br><a href=\"{{offer_url}}\">Review and respond to your offer</a></p></body></html>",
    "TextPart": "Congratulations {{candidate_name}}! {{company_name}} is offering you {{job_title}} at {{salary}}. Review your offer: {{offer_url}}"
  }' \
  --region "$AWS_REGION"
```

#### 3.5.5 Set Up Bounce/Complaint Handling (SNS)

```bash
# Create SNS topics for bounce and complaint notifications
BOUNCE_TOPIC=$(aws sns create-topic --name "calibr-ses-bounces" --query 'TopicArn' --output text)
COMPLAINT_TOPIC=$(aws sns create-topic --name "calibr-ses-complaints" --query 'TopicArn' --output text)

# Configure SES to publish bounces and complaints to SNS
aws ses set-identity-notification-topic \
  --identity "$DOMAIN" \
  --notification-type Bounce \
  --sns-topic "$BOUNCE_TOPIC" \
  --region "$AWS_REGION"

aws ses set-identity-notification-topic \
  --identity "$DOMAIN" \
  --notification-type Complaint \
  --sns-topic "$COMPLAINT_TOPIC" \
  --region "$AWS_REGION"

# Subscribe your webhook endpoint to these topics
aws sns subscribe \
  --topic-arn "$BOUNCE_TOPIC" \
  --protocol https \
  --notification-endpoint "https://calibr.ai/api/webhooks/ses/bounce"

aws sns subscribe \
  --topic-arn "$COMPLAINT_TOPIC" \
  --protocol https \
  --notification-endpoint "https://calibr.ai/api/webhooks/ses/complaint"
```

---

### 3.6 OpenSearch

#### 3.6.1 Create OpenSearch Domain

```bash
OPENSEARCH_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)

aws opensearch create-domain \
  --domain-name "calibr-search-${APP_ENV}" \
  --engine-version "OpenSearch_2.9" \
  --cluster-config '{
    "InstanceType": "t3.medium.search",
    "InstanceCount": 2,
    "DedicatedMasterEnabled": false,
    "ZoneAwarenessEnabled": true,
    "ZoneAwarenessConfig": {"AvailabilityZoneCount": 2}
  }' \
  --ebs-options '{
    "EBSEnabled": true,
    "VolumeType": "gp3",
    "VolumeSize": 100
  }' \
  --node-to-node-encryption-options '{"Enabled": true}' \
  --encryption-at-rest-options '{"Enabled": true}' \
  --domain-endpoint-options '{"EnforceHTTPS": true, "TLSSecurityPolicy": "Policy-Min-TLS-1-2-2019-07"}' \
  --advanced-security-options '{
    "Enabled": true,
    "InternalUserDatabaseEnabled": true,
    "MasterUserOptions": {
      "MasterUserName": "calibr_admin",
      "MasterUserPassword": "'"$OPENSEARCH_PASSWORD"'"
    }
  }' \
  --access-policies '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {"AWS": "*"},
      "Action": "es:*",
      "Resource": "arn:aws:es:'"$AWS_REGION"':'"$ACCOUNT_ID"':domain/calibr-search-'"$APP_ENV"'/*"
    }]
  }' \
  --region "$AWS_REGION"

echo "Waiting for OpenSearch domain (takes 10-15 minutes)..."
aws opensearch wait domain-available --domain-name "calibr-search-${APP_ENV}" --region "$AWS_REGION"

OPENSEARCH_ENDPOINT=$(aws opensearch describe-domain \
  --domain-name "calibr-search-${APP_ENV}" \
  --query 'DomainStatus.Endpoint' \
  --output text \
  --region "$AWS_REGION")

echo "OpenSearch Endpoint: $OPENSEARCH_ENDPOINT"
```

#### 3.6.2 Create Index Mappings

```bash
# Create jobs index
curl -X PUT "https://${OPENSEARCH_ENDPOINT}/jobs" \
  -u "calibr_admin:${OPENSEARCH_PASSWORD}" \
  -H "Content-Type: application/json" \
  -d '{
    "settings": {
      "number_of_shards": 2,
      "number_of_replicas": 1,
      "analysis": {
        "analyzer": {
          "skill_analyzer": {
            "type": "custom",
            "tokenizer": "standard",
            "filter": ["lowercase", "stop", "snowball"]
          }
        }
      }
    },
    "mappings": {
      "properties": {
        "id": {"type": "keyword"},
        "companyId": {"type": "keyword"},
        "companyName": {"type": "text", "fields": {"keyword": {"type": "keyword"}}},
        "title": {"type": "text", "analyzer": "english", "fields": {"keyword": {"type": "keyword"}}},
        "department": {"type": "keyword"},
        "type": {"type": "keyword"},
        "workMode": {"type": "keyword"},
        "level": {"type": "keyword"},
        "location": {"type": "text", "fields": {"keyword": {"type": "keyword"}}},
        "salaryMin": {"type": "integer"},
        "salaryMax": {"type": "integer"},
        "description": {"type": "text", "analyzer": "english"},
        "skills": {"type": "keyword"},
        "status": {"type": "keyword"},
        "featured": {"type": "boolean"},
        "postedAt": {"type": "date"},
        "expiresAt": {"type": "date"}
      }
    }
  }'

# Create candidates index
curl -X PUT "https://${OPENSEARCH_ENDPOINT}/candidates" \
  -u "calibr_admin:${OPENSEARCH_PASSWORD}" \
  -H "Content-Type: application/json" \
  -d '{
    "settings": {
      "number_of_shards": 2,
      "number_of_replicas": 1
    },
    "mappings": {
      "properties": {
        "id": {"type": "keyword"},
        "userId": {"type": "keyword"},
        "name": {"type": "text"},
        "headline": {"type": "text", "analyzer": "english"},
        "bio": {"type": "text", "analyzer": "english"},
        "skills": {
          "type": "nested",
          "properties": {
            "name": {"type": "keyword"},
            "level": {"type": "keyword"},
            "verified": {"type": "boolean"},
            "score": {"type": "float"}
          }
        },
        "location": {"type": "text", "fields": {"keyword": {"type": "keyword"}}},
        "workPreference": {"type": "keyword"},
        "salaryExpectation": {"type": "integer"},
        "availability": {"type": "keyword"},
        "experienceYears": {"type": "integer"},
        "verified": {"type": "boolean"},
        "premium": {"type": "boolean"},
        "lastActive": {"type": "date"}
      }
    }
  }'
```

#### 3.6.3 Example Search Queries

**Search jobs by skill + location:**
```json
{
  "query": {
    "bool": {
      "must": [
        {"match": {"title": "software engineer"}},
        {"terms": {"skills": ["React", "TypeScript"]}}
      ],
      "filter": [
        {"term": {"status": "active"}},
        {"term": {"workMode": "remote"}},
        {"range": {"salaryMin": {"gte": 150000}}}
      ]
    }
  },
  "sort": [
    {"featured": "desc"},
    {"postedAt": "desc"},
    "_score"
  ]
}
```

**Find candidates matching a job (AI pre-filter before scoring):**
```json
{
  "query": {
    "bool": {
      "must": [
        {
          "nested": {
            "path": "skills",
            "query": {
              "terms": {"skills.name": ["React", "TypeScript", "Next.js"]}
            }
          }
        }
      ],
      "filter": [
        {"terms": {"workPreference": ["remote", "hybrid"]}},
        {"range": {"salaryExpectation": {"lte": 220000}}}
      ]
    }
  }
}
```

---

### 3.7 SQS + Lambda (AI Matching)

#### 3.7.1 Create SQS Queues

```bash
# Dead-letter queue first
DLQ_URL=$(aws sqs create-queue \
  --queue-name "calibr-matching-dlq-${APP_ENV}" \
  --attributes '{
    "MessageRetentionPeriod": "1209600",
    "VisibilityTimeout": "60"
  }' \
  --query 'QueueUrl' \
  --output text)

DLQ_ARN=$(aws sqs get-queue-attributes \
  --queue-url "$DLQ_URL" \
  --attribute-names QueueArn \
  --query 'Attributes.QueueArn' \
  --output text)

# Main matching queue
QUEUE_URL=$(aws sqs create-queue \
  --queue-name "calibr-matching-queue-${APP_ENV}" \
  --attributes '{
    "VisibilityTimeout": "300",
    "MessageRetentionPeriod": "86400",
    "ReceiveMessageWaitTimeSeconds": "20",
    "RedrivePolicy": "{\"deadLetterTargetArn\":\"'"$DLQ_ARN"'\",\"maxReceiveCount\":\"3\"}"
  }' \
  --query 'QueueUrl' \
  --output text)

echo "Queue URL: $QUEUE_URL"
echo "SQS_QUEUE_URL=$QUEUE_URL"
```

#### 3.7.2 Create Lambda IAM Role

```bash
# Create execution role for Lambda
aws iam create-role \
  --role-name "calibr-matching-lambda-role-${APP_ENV}" \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {"Service": "lambda.amazonaws.com"},
      "Action": "sts:AssumeRole"
    }]
  }'

# Attach basic execution policy
aws iam attach-role-policy \
  --role-name "calibr-matching-lambda-role-${APP_ENV}" \
  --policy-arn "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"

# Add SQS permissions
aws iam put-role-policy \
  --role-name "calibr-matching-lambda-role-${APP_ENV}" \
  --policy-name "calibr-matching-sqs-policy" \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": [
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes",
          "sqs:ChangeMessageVisibility"
        ],
        "Resource": "'"$DLQ_ARN"'"
      },
      {
        "Effect": "Allow",
        "Action": ["rds:DescribeDBInstances"],
        "Resource": "*"
      },
      {
        "Effect": "Allow",
        "Action": ["ssm:GetParameter", "ssm:GetParameters"],
        "Resource": "arn:aws:ssm:'"$AWS_REGION"':'"$ACCOUNT_ID"':parameter/calibr/*"
      }
    ]
  }'

LAMBDA_ROLE_ARN=$(aws iam get-role \
  --role-name "calibr-matching-lambda-role-${APP_ENV}" \
  --query 'Role.Arn' \
  --output text)
```

#### 3.7.3 Package and Deploy Lambda

Create `functions/matching/index.mjs`:
```javascript
import { SQSClient, DeleteMessageCommand } from '@aws-sdk/client-sqs'
import pkg from 'pg'
const { Pool } = pkg

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

export async function handler(event) {
  const results = []
  
  for (const record of event.Records) {
    try {
      const message = JSON.parse(record.body)
      const { jobId, candidateId, applicationId } = message
      
      // Fetch job requirements and candidate profile from DB
      const client = await pool.connect()
      try {
        const [jobResult, candidateResult] = await Promise.all([
          client.query('SELECT * FROM jobs WHERE id = $1', [jobId]),
          client.query('SELECT * FROM talent_profiles WHERE id = $1', [candidateId]),
        ])
        
        const job = jobResult.rows[0]
        const candidate = candidateResult.rows[0]
        
        // Compute match score (replace with your AI model call)
        const matchScore = computeMatchScore(job, candidate)
        
        // Update application with match score
        await client.query(
          'UPDATE applications SET match_score = $1, match_computed_at = NOW() WHERE id = $2',
          [matchScore, applicationId]
        )
      } finally {
        client.release()
      }
      
      results.push({ messageId: record.messageId, status: 'success' })
    } catch (error) {
      console.error('Match scoring failed:', error)
      // Throwing causes the message to go to DLQ after maxReceiveCount
      throw error
    }
  }
  
  return { batchItemFailures: [] }
}

function computeMatchScore(job, candidate) {
  // TODO: Replace with real AI model (Bedrock, OpenAI, custom model)
  // Current: simple skill overlap scoring
  const jobSkills = new Set(job.skills || [])
  const candidateSkills = candidate.skills || []
  
  let matchedSkills = 0
  let verifiedMatchedSkills = 0
  
  for (const skill of candidateSkills) {
    if (jobSkills.has(skill.name)) {
      matchedSkills++
      if (skill.verified) verifiedMatchedSkills++
    }
  }
  
  const skillCoverage = jobSkills.size > 0 ? matchedSkills / jobSkills.size : 0
  const verificationBonus = verifiedMatchedSkills * 0.05
  const experienceScore = Math.min(candidate.experience_years / 10, 1) * 0.3
  
  return Math.min(Math.round((skillCoverage * 0.6 + experienceScore + verificationBonus) * 100), 100)
}
```

```bash
# Package the Lambda (zip)
cd functions/matching
npm init -y
npm install pg @aws-sdk/client-sqs
zip -r ../../matching-lambda.zip . -x "*.git*"
cd ../..

# Deploy Lambda
aws lambda create-function \
  --function-name "calibr-ai-matching-${APP_ENV}" \
  --runtime nodejs20.x \
  --role "$LAMBDA_ROLE_ARN" \
  --handler index.handler \
  --zip-file fileb://matching-lambda.zip \
  --timeout 300 \
  --memory-size 512 \
  --environment "Variables={DATABASE_URL=<your-db-url>,APP_ENV=${APP_ENV}}" \
  --vpc-config "SubnetIds=${PRIV_SUBNET_1},${PRIV_SUBNET_2},SecurityGroupIds=${APP_SG}" \
  --region "$AWS_REGION"

# Connect SQS queue to Lambda (event source mapping)
aws lambda create-event-source-mapping \
  --function-name "calibr-ai-matching-${APP_ENV}" \
  --event-source-arn "$DLQ_ARN" \
  --batch-size 10 \
  --bisect-batch-on-function-error \
  --maximum-retry-attempts 2 \
  --region "$AWS_REGION"
```

---

### 3.8 Amplify Deployment

#### 3.8.1 Connect GitHub Repository

```bash
# Create Amplify app
AMPLIFY_APP_ID=$(aws amplify create-app \
  --name "calibr-${APP_ENV}" \
  --repository "https://github.com/YOUR_ORG/calibr" \
  --platform WEB_COMPUTE \
  --oauth-token "YOUR_GITHUB_PAT" \
  --build-spec "$(cat amplify.yml)" \
  --environment-variables \
    "NEXT_PUBLIC_COGNITO_USER_POOL_ID_COMPANY=${COMPANY_POOL_ID}" \
    "NEXT_PUBLIC_COGNITO_USER_POOL_ID_TALENT=${TALENT_POOL_ID}" \
    "NEXT_PUBLIC_COGNITO_CLIENT_ID_COMPANY=${COMPANY_CLIENT_ID}" \
    "NEXT_PUBLIC_COGNITO_CLIENT_ID_TALENT=${TALENT_CLIENT_ID}" \
    "NEXT_PUBLIC_COGNITO_REGION=${AWS_REGION}" \
    "NEXT_PUBLIC_APP_URL=https://calibr.ai" \
    "NEXT_PUBLIC_USE_MOCK=false" \
  --query 'app.appId' \
  --output text)

echo "Amplify App ID: $AMPLIFY_APP_ID"
```

#### 3.8.2 Create amplify.yml

Create `amplify.yml` in the project root:
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install -g pnpm
        - pnpm install --frozen-lockfile
    build:
      commands:
        - pnpm build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - .next/cache/**/*
      - node_modules/**/*
```

#### 3.8.3 Create Branch and Start Deployment

```bash
# Connect the main branch
aws amplify create-branch \
  --app-id "$AMPLIFY_APP_ID" \
  --branch-name main \
  --stage PRODUCTION \
  --enable-auto-build \
  --environment-variables \
    "DATABASE_URL=postgresql://calibr_admin:${DB_PASSWORD}@${RDS_ENDPOINT}:5432/calibr" \
    "REDIS_URL=rediss://AUTH_TOKEN@${REDIS_ENDPOINT}:6379" \
    "NEXTAUTH_SECRET=$(openssl rand -base64 32)" \
    "NEXTAUTH_URL=https://calibr.ai" \
    "AWS_REGION=${AWS_REGION}" \
    "S3_BUCKET_RESUMES=calibr-resumes-${APP_ENV}" \
    "S3_BUCKET_ASSETS=calibr-assets-${APP_ENV}" \
    "SES_FROM_EMAIL=noreply@calibr.ai" \
    "SES_REGION=${AWS_REGION}" \
    "OPENSEARCH_ENDPOINT=https://${OPENSEARCH_ENDPOINT}" \
    "OPENSEARCH_USERNAME=calibr_admin" \
    "OPENSEARCH_PASSWORD=${OPENSEARCH_PASSWORD}"

# Trigger first deployment
aws amplify start-job \
  --app-id "$AMPLIFY_APP_ID" \
  --branch-name main \
  --job-type RELEASE
```

#### 3.8.4 Custom Domain Setup

```bash
# Associate your domain (Route53 must have the hosted zone)
aws amplify create-domain-association \
  --app-id "$AMPLIFY_APP_ID" \
  --domain-name "calibr.ai" \
  --sub-domain-settings \
    "prefix=,branchName=main" \
    "prefix=www,branchName=main"
```

---

### 3.9 CloudFront + WAF

#### 3.9.1 Create WAF Web ACL

```bash
# Create WAF Web ACL with managed rules
WAF_ACL_ARN=$(aws wafv2 create-web-acl \
  --name "calibr-waf-${APP_ENV}" \
  --scope CLOUDFRONT \
  --region us-east-1 \
  --default-action Allow={} \
  --rules '[
    {
      "Name": "AWSManagedRulesCommonRuleSet",
      "Priority": 1,
      "OverrideAction": {"None": {}},
      "Statement": {
        "ManagedRuleGroupStatement": {
          "VendorName": "AWS",
          "Name": "AWSManagedRulesCommonRuleSet"
        }
      },
      "VisibilityConfig": {
        "SampledRequestsEnabled": true,
        "CloudWatchMetricsEnabled": true,
        "MetricName": "CommonRuleSet"
      }
    },
    {
      "Name": "RateLimitRule",
      "Priority": 2,
      "Action": {"Block": {}},
      "Statement": {
        "RateBasedStatement": {
          "Limit": 2000,
          "AggregateKeyType": "IP"
        }
      },
      "VisibilityConfig": {
        "SampledRequestsEnabled": true,
        "CloudWatchMetricsEnabled": true,
        "MetricName": "RateLimit"
      }
    },
    {
      "Name": "AWSManagedRulesSQLiRuleSet",
      "Priority": 3,
      "OverrideAction": {"None": {}},
      "Statement": {
        "ManagedRuleGroupStatement": {
          "VendorName": "AWS",
          "Name": "AWSManagedRulesSQLiRuleSet"
        }
      },
      "VisibilityConfig": {
        "SampledRequestsEnabled": true,
        "CloudWatchMetricsEnabled": true,
        "MetricName": "SQLiRuleSet"
      }
    }
  ]' \
  --visibility-config "SampledRequestsEnabled=true,CloudWatchMetricsEnabled=true,MetricName=calibr-waf" \
  --query 'Summary.ARN' \
  --output text)

echo "WAF ACL ARN: $WAF_ACL_ARN"
```

#### 3.9.2 Create CloudFront Distribution

```bash
# Get Amplify app domain for origin
AMPLIFY_DOMAIN=$(aws amplify get-domain-association \
  --app-id "$AMPLIFY_APP_ID" \
  --domain-name "calibr.ai" \
  --query 'domainAssociation.domainName' \
  --output text 2>/dev/null || echo "${AMPLIFY_APP_ID}.amplifyapp.com")

aws cloudfront create-distribution \
  --distribution-config '{
    "CallerReference": "calibr-dist-'"$(date +%s)"'",
    "Comment": "Calibr production distribution",
    "DefaultCacheBehavior": {
      "TargetOriginId": "calibr-amplify-origin",
      "ViewerProtocolPolicy": "redirect-to-https",
      "AllowedMethods": {
        "Quantity": 7,
        "Items": ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"],
        "CachedMethods": {"Quantity": 2, "Items": ["GET", "HEAD"]}
      },
      "CachePolicyId": "658327ea-f89d-4fab-a63d-7e88639e58f6",
      "OriginRequestPolicyId": "b689b0a8-53d0-40ab-baf2-68738e2966ac",
      "Compress": true
    },
    "Origins": {
      "Quantity": 1,
      "Items": [{
        "Id": "calibr-amplify-origin",
        "DomainName": "'"$AMPLIFY_DOMAIN"'",
        "CustomOriginConfig": {
          "HTTPSPort": 443,
          "OriginProtocolPolicy": "https-only",
          "OriginSSLProtocols": {"Quantity": 1, "Items": ["TLSv1.2"]}
        }
      }]
    },
    "CustomErrorResponses": {
      "Quantity": 2,
      "Items": [
        {
          "ErrorCode": 404,
          "ResponsePagePath": "/404",
          "ResponseCode": "404",
          "ErrorCachingMinTTL": 60
        },
        {
          "ErrorCode": 500,
          "ResponsePagePath": "/500",
          "ResponseCode": "500",
          "ErrorCachingMinTTL": 10
        }
      ]
    },
    "Enabled": true,
    "HttpVersion": "http2and3",
    "WebACLId": "'"$WAF_ACL_ARN"'",
    "PriceClass": "PriceClass_100"
  }'
```

---

## 4. Environment Variables

Create `.env.local` for local development and add all of these to Amplify environment variables for production. Never commit `.env.local` to git.

```bash
# ============================================================
# AUTHENTICATION — AWS Cognito
# ============================================================
NEXT_PUBLIC_COGNITO_USER_POOL_ID_COMPANY=us-east-1_XXXXXXXXX
NEXT_PUBLIC_COGNITO_USER_POOL_ID_TALENT=us-east-1_YYYYYYYYY
NEXT_PUBLIC_COGNITO_CLIENT_ID_COMPANY=xxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_COGNITO_CLIENT_ID_TALENT=yyyyyyyyyyyyyyyyyyyyyyyyyyyy
NEXT_PUBLIC_COGNITO_REGION=us-east-1
NEXT_PUBLIC_COGNITO_HOSTED_UI_COMPANY=https://calibr-company-dev.auth.us-east-1.amazoncognito.com
NEXT_PUBLIC_COGNITO_HOSTED_UI_TALENT=https://calibr-talent-dev.auth.us-east-1.amazoncognito.com

# ============================================================
# DATABASE
# ============================================================
DATABASE_URL=postgresql://calibr_admin:YOUR_PASSWORD@your-rds-endpoint.us-east-1.rds.amazonaws.com:5432/calibr?sslmode=require
REDIS_URL=rediss://:YOUR_AUTH_TOKEN@your-redis-endpoint.cache.amazonaws.com:6379

# ============================================================
# AWS CREDENTIALS & CONFIGURATION
# ============================================================
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
S3_BUCKET_RESUMES=calibr-resumes-dev
S3_BUCKET_ASSETS=calibr-assets-dev
SQS_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/123456789/calibr-matching-queue-dev

# ============================================================
# STRIPE BILLING
# ============================================================
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxx
STRIPE_PRICE_STARTER=price_xxxxxxxxxxxxxxxxxxxx
STRIPE_PRICE_GROWTH=price_yyyyyyyyyyyyyyyyyyyy
STRIPE_PRICE_ENTERPRISE=price_zzzzzzzzzzzzzzzzzz

# ============================================================
# EMAIL — AWS SES
# ============================================================
SES_FROM_EMAIL=noreply@calibr.ai
SES_FROM_NAME=Calibr
SES_REGION=us-east-1
SES_REPLY_TO=support@calibr.ai

# ============================================================
# SEARCH — AWS OpenSearch
# ============================================================
OPENSEARCH_ENDPOINT=https://search-calibr-search-dev-xxxx.us-east-1.es.amazonaws.com
OPENSEARCH_USERNAME=calibr_admin
OPENSEARCH_PASSWORD=YOUR_OPENSEARCH_PASSWORD

# ============================================================
# APPLICATION
# ============================================================
NEXT_PUBLIC_APP_URL=https://calibr.ai
NEXTAUTH_SECRET=your-32-char-random-secret-here
NEXTAUTH_URL=https://calibr.ai
NEXT_PUBLIC_USE_MOCK=false

# ============================================================
# ANALYTICS & MONITORING
# ============================================================
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
SENTRY_DSN=https://xxxxxxxxxxxxxxxx@sentry.io/xxxxxxx
SENTRY_AUTH_TOKEN=your-sentry-auth-token

# ============================================================
# FEATURE FLAGS (optional)
# ============================================================
NEXT_PUBLIC_FEATURE_AI_MATCHING=true
NEXT_PUBLIC_FEATURE_ASSESSMENTS=true
NEXT_PUBLIC_FEATURE_VIDEO_INTERVIEWS=false
```

---

## 5. Database Schema (PostgreSQL)

Run this entire script after connecting to your RDS instance. Use a tool like `psql`, TablePlus, or DBeaver.

```bash
# Connect to RDS (from within the VPC, or via bastion host)
psql "postgresql://calibr_admin:${DB_PASSWORD}@${RDS_ENDPOINT}:5432/calibr?sslmode=require"
```

```sql
-- ============================================================
-- Enable extensions
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for fuzzy text search

-- ============================================================
-- Enum types
-- ============================================================
CREATE TYPE plan_type AS ENUM ('starter', 'growth', 'enterprise');
CREATE TYPE job_type AS ENUM ('full-time', 'part-time', 'contract', 'internship', 'freelance');
CREATE TYPE work_mode AS ENUM ('remote', 'hybrid', 'onsite');
CREATE TYPE experience_level AS ENUM ('entry', 'mid', 'senior', 'lead', 'executive');
CREATE TYPE job_status AS ENUM ('draft', 'active', 'paused', 'closed', 'expired');
CREATE TYPE application_status AS ENUM ('applied', 'screening', 'interview', 'technical', 'offer', 'hired', 'rejected', 'withdrawn');
CREATE TYPE pipeline_stage AS ENUM ('new', 'screening', 'phone_screen', 'technical', 'onsite', 'offer', 'hired', 'rejected');
CREATE TYPE subscription_status AS ENUM ('trialing', 'active', 'past_due', 'canceled', 'unpaid');
CREATE TYPE user_role AS ENUM ('owner', 'admin', 'recruiter', 'interviewer', 'viewer');
CREATE TYPE skill_level AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');

-- ============================================================
-- companies
-- ============================================================
CREATE TABLE companies (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(256) NOT NULL,
    slug            VARCHAR(256) UNIQUE,
    email           VARCHAR(256) NOT NULL UNIQUE,
    logo_url        TEXT,
    website         VARCHAR(512),
    industry        VARCHAR(128),
    size            VARCHAR(64),
    location        VARCHAR(256),
    description     TEXT,
    culture         TEXT[],
    benefits        TEXT[],
    plan            plan_type NOT NULL DEFAULT 'starter',
    stripe_customer_id VARCHAR(128) UNIQUE,
    verified        BOOLEAN DEFAULT FALSE,
    rating          DECIMAL(3,2) DEFAULT 0,
    review_count    INTEGER DEFAULT 0,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    settings        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_companies_slug ON companies(slug);
CREATE INDEX idx_companies_email ON companies(email);
CREATE INDEX idx_companies_plan ON companies(plan);

-- ============================================================
-- users (company team members)
-- ============================================================
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    email           VARCHAR(256) NOT NULL UNIQUE,
    full_name       VARCHAR(256),
    avatar_url      TEXT,
    role            user_role NOT NULL DEFAULT 'recruiter',
    cognito_sub     VARCHAR(256) UNIQUE, -- Cognito user sub
    last_sign_in_at TIMESTAMPTZ,
    invited_by      UUID REFERENCES users(id),
    invite_accepted_at TIMESTAMPTZ,
    preferences     JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_cognito_sub ON users(cognito_sub);

-- ============================================================
-- talent_profiles
-- ============================================================
CREATE TABLE talent_profiles (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cognito_sub         VARCHAR(256) UNIQUE NOT NULL,
    email               VARCHAR(256) NOT NULL UNIQUE,
    full_name           VARCHAR(256),
    avatar_url          TEXT,
    headline            VARCHAR(512),
    bio                 TEXT,
    location            VARCHAR(256),
    phone               VARCHAR(64),
    resume_url          TEXT,
    resume_key          TEXT, -- S3 key for pre-signed URL generation
    skills              JSONB DEFAULT '[]', -- [{name, level, verified, score}]
    work_preference     work_mode[],
    salary_expectation  INTEGER,
    availability        VARCHAR(128),
    experience_years    INTEGER,
    github_url          TEXT,
    linkedin_url        TEXT,
    portfolio_url       TEXT,
    languages           TEXT[],
    open_to_work        BOOLEAN DEFAULT TRUE,
    premium             BOOLEAN DEFAULT FALSE,
    verified            BOOLEAN DEFAULT FALSE,
    profile_complete    BOOLEAN DEFAULT FALSE,
    search_synced_at    TIMESTAMPTZ,
    last_active_at      TIMESTAMPTZ,
    preferences         JSONB DEFAULT '{}',
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ
);

CREATE INDEX idx_talent_cognito_sub ON talent_profiles(cognito_sub);
CREATE INDEX idx_talent_email ON talent_profiles(email);
CREATE INDEX idx_talent_open_to_work ON talent_profiles(open_to_work) WHERE deleted_at IS NULL;
CREATE INDEX idx_talent_skills ON talent_profiles USING GIN(skills);

-- ============================================================
-- talent_experience
-- ============================================================
CREATE TABLE talent_experience (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    talent_id       UUID NOT NULL REFERENCES talent_profiles(id) ON DELETE CASCADE,
    company         VARCHAR(256) NOT NULL,
    company_logo_url TEXT,
    title           VARCHAR(256) NOT NULL,
    description     TEXT,
    skills          TEXT[],
    start_date      DATE NOT NULL,
    end_date        DATE,
    is_current      BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_exp_talent_id ON talent_experience(talent_id);

-- ============================================================
-- talent_education
-- ============================================================
CREATE TABLE talent_education (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    talent_id   UUID NOT NULL REFERENCES talent_profiles(id) ON DELETE CASCADE,
    institution VARCHAR(256) NOT NULL,
    degree      VARCHAR(128),
    field       VARCHAR(256),
    gpa         DECIMAL(3,2),
    start_date  DATE,
    end_date    DATE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_edu_talent_id ON talent_education(talent_id);

-- ============================================================
-- jobs
-- ============================================================
CREATE TABLE jobs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    created_by      UUID REFERENCES users(id),
    title           VARCHAR(256) NOT NULL,
    department      VARCHAR(128),
    type            job_type NOT NULL DEFAULT 'full-time',
    work_mode       work_mode NOT NULL DEFAULT 'hybrid',
    level           experience_level NOT NULL DEFAULT 'mid',
    location        VARCHAR(256),
    salary_min      INTEGER,
    salary_max      INTEGER,
    currency        VARCHAR(8) DEFAULT 'USD',
    description     TEXT NOT NULL,
    requirements    TEXT[],
    nice_to_have    TEXT[],
    skills          TEXT[] NOT NULL,
    benefits        TEXT[],
    status          job_status NOT NULL DEFAULT 'draft',
    featured        BOOLEAN DEFAULT FALSE,
    applicant_count INTEGER DEFAULT 0,
    view_count      INTEGER DEFAULT 0,
    posted_at       TIMESTAMPTZ,
    expires_at      TIMESTAMPTZ,
    search_synced_at TIMESTAMPTZ,
    meta            JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_jobs_status ON jobs(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_jobs_skills ON jobs USING GIN(skills);
CREATE INDEX idx_jobs_posted_at ON jobs(posted_at DESC) WHERE deleted_at IS NULL;

-- ============================================================
-- applications
-- ============================================================
CREATE TABLE applications (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id          UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    talent_id       UUID NOT NULL REFERENCES talent_profiles(id) ON DELETE CASCADE,
    status          application_status NOT NULL DEFAULT 'applied',
    stage           pipeline_stage NOT NULL DEFAULT 'new',
    cover_letter    TEXT,
    match_score     INTEGER DEFAULT 0, -- 0-100 computed by Lambda
    match_computed_at TIMESTAMPTZ,
    rating          INTEGER CHECK (rating BETWEEN 1 AND 5),
    notes           TEXT,
    rejected_reason VARCHAR(256),
    source          VARCHAR(128) DEFAULT 'calibr', -- calibr, linkedin, referral, direct
    referrer_id     UUID REFERENCES users(id),
    applied_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(job_id, talent_id)
);

CREATE INDEX idx_apps_job_id ON applications(job_id);
CREATE INDEX idx_apps_talent_id ON applications(talent_id);
CREATE INDEX idx_apps_status ON applications(status);
CREATE INDEX idx_apps_stage ON applications(stage);
CREATE INDEX idx_apps_match_score ON applications(match_score DESC);

-- ============================================================
-- pipeline_stages (audit trail of stage changes)
-- ============================================================
CREATE TABLE pipeline_stage_history (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id  UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    from_stage      pipeline_stage,
    to_stage        pipeline_stage NOT NULL,
    changed_by      UUID REFERENCES users(id),
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pipeline_history_app_id ON pipeline_stage_history(application_id);

-- ============================================================
-- messages
-- ============================================================
CREATE TABLE messages (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL,
    sender_type     VARCHAR(16) NOT NULL CHECK (sender_type IN ('company', 'talent')),
    sender_id       UUID NOT NULL,
    receiver_type   VARCHAR(16) NOT NULL CHECK (receiver_type IN ('company', 'talent')),
    receiver_id     UUID NOT NULL,
    application_id  UUID REFERENCES applications(id),
    body            TEXT NOT NULL,
    message_type    VARCHAR(32) DEFAULT 'text', -- text, system, interview_request, offer
    metadata        JSONB DEFAULT '{}',
    read_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);

-- ============================================================
-- assessments
-- ============================================================
CREATE TABLE assessments (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    talent_id       UUID NOT NULL REFERENCES talent_profiles(id) ON DELETE CASCADE,
    skill           VARCHAR(128) NOT NULL,
    score           INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
    percentile      INTEGER,
    verified        BOOLEAN DEFAULT FALSE,
    verified_at     TIMESTAMPTZ,
    expires_at      TIMESTAMPTZ,
    attempt_count   INTEGER DEFAULT 1,
    provider        VARCHAR(64) DEFAULT 'calibr', -- calibr, hackerrank, codility
    external_id     VARCHAR(256),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(talent_id, skill, provider)
);

CREATE INDEX idx_assessments_talent_id ON assessments(talent_id);
CREATE INDEX idx_assessments_skill ON assessments(skill);

-- ============================================================
-- subscriptions
-- ============================================================
CREATE TABLE subscriptions (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id              UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE UNIQUE,
    stripe_subscription_id  VARCHAR(256) UNIQUE,
    stripe_price_id         VARCHAR(256),
    plan                    plan_type NOT NULL DEFAULT 'starter',
    status                  subscription_status NOT NULL DEFAULT 'trialing',
    trial_ends_at           TIMESTAMPTZ,
    current_period_start    TIMESTAMPTZ,
    current_period_end      TIMESTAMPTZ,
    cancel_at               TIMESTAMPTZ,
    canceled_at             TIMESTAMPTZ,
    ai_credits_used         INTEGER DEFAULT 0,
    ai_credits_limit        INTEGER DEFAULT 100,
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_company_id ON subscriptions(company_id);
CREATE INDEX idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);

-- ============================================================
-- audit_logs
-- ============================================================
CREATE TABLE audit_logs (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id  UUID REFERENCES companies(id),
    user_id     UUID REFERENCES users(id),
    talent_id   UUID REFERENCES talent_profiles(id),
    action      VARCHAR(128) NOT NULL, -- e.g. "application.status_changed"
    resource    VARCHAR(128),          -- e.g. "application"
    resource_id UUID,
    old_value   JSONB,
    new_value   JSONB,
    ip_address  INET,
    user_agent  TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_company_id ON audit_logs(company_id, created_at DESC);
CREATE INDEX idx_audit_user_id ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_action ON audit_logs(action);

-- ============================================================
-- webhooks
-- ============================================================
CREATE TABLE webhooks (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id  UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    url         TEXT NOT NULL,
    events      TEXT[] NOT NULL, -- e.g. ['application.created', 'application.hired']
    secret      VARCHAR(256) NOT NULL, -- HMAC signing secret
    active      BOOLEAN DEFAULT TRUE,
    last_triggered_at TIMESTAMPTZ,
    failure_count INTEGER DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_webhooks_company_id ON webhooks(company_id);

-- ============================================================
-- interviews
-- ============================================================
CREATE TABLE interviews (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id  UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    scheduled_by    UUID REFERENCES users(id),
    interview_type  VARCHAR(64) NOT NULL, -- phone, video, onsite, technical
    scheduled_at    TIMESTAMPTZ NOT NULL,
    duration_mins   INTEGER DEFAULT 60,
    location        TEXT, -- Zoom link, address, etc.
    notes           TEXT,
    outcome         VARCHAR(32), -- passed, failed, no_show, rescheduled
    feedback        JSONB DEFAULT '{}', -- structured scorecard
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_interviews_application_id ON interviews(application_id);
CREATE INDEX idx_interviews_scheduled_at ON interviews(scheduled_at);

-- ============================================================
-- Triggers: auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['companies','users','talent_profiles','jobs','applications','subscriptions','webhooks','interviews'] LOOP
    EXECUTE format(
      'CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at()',
      t, t
    );
  END LOOP;
END;
$$;

-- ============================================================
-- Seed: initial data check
-- ============================================================
SELECT 'Schema created successfully' AS status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
```

---

## 6. CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, staging]
    tags: ['v*']
  pull_request:
    branches: [main, staging]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

env:
  NODE_VERSION: '20'
  PNPM_VERSION: '8'

jobs:
  # ============================================================
  # Quality checks — run on every PR and push
  # ============================================================
  quality:
    name: Quality Checks
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v3
        with:
          version: ${{ env.PNPM_VERSION }}

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Type check
        run: pnpm tsc --noEmit

      - name: Lint
        run: pnpm lint

      - name: Build check
        run: pnpm build
        env:
          NEXT_PUBLIC_USE_MOCK: 'true'
          NEXT_PUBLIC_APP_URL: 'https://calibr.ai'
          NEXTAUTH_SECRET: 'ci-secret-not-real'
          NEXTAUTH_URL: 'http://localhost:3000'
          NEXT_PUBLIC_COGNITO_REGION: 'us-east-1'
          NEXT_PUBLIC_COGNITO_USER_POOL_ID_COMPANY: 'us-east-1_placeholder'
          NEXT_PUBLIC_COGNITO_USER_POOL_ID_TALENT: 'us-east-1_placeholder'
          NEXT_PUBLIC_COGNITO_CLIENT_ID_COMPANY: 'placeholder'
          NEXT_PUBLIC_COGNITO_CLIENT_ID_TALENT: 'placeholder'

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build-output
          path: .next/
          retention-days: 1

  # ============================================================
  # Deploy to staging — on push to main
  # ============================================================
  deploy-staging:
    name: Deploy to Staging
    needs: quality
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    environment:
      name: staging
      url: https://staging.calibr.ai

    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Trigger Amplify staging deployment
        run: |
          JOB_ID=$(aws amplify start-job \
            --app-id ${{ secrets.AMPLIFY_APP_ID_STAGING }} \
            --branch-name staging \
            --job-type RELEASE \
            --query 'jobSummary.jobId' \
            --output text)
          
          echo "Triggered Amplify job: $JOB_ID"
          echo "JOB_ID=$JOB_ID" >> $GITHUB_ENV

      - name: Wait for staging deployment
        run: |
          echo "Waiting for Amplify deployment..."
          for i in {1..30}; do
            STATUS=$(aws amplify get-job \
              --app-id ${{ secrets.AMPLIFY_APP_ID_STAGING }} \
              --branch-name staging \
              --job-id $JOB_ID \
              --query 'job.summary.status' \
              --output text)
            
            echo "Status: $STATUS (attempt $i/30)"
            
            if [ "$STATUS" = "SUCCEED" ]; then
              echo "Deployment succeeded!"
              exit 0
            elif [ "$STATUS" = "FAILED" ] || [ "$STATUS" = "CANCELLED" ]; then
              echo "Deployment failed with status: $STATUS"
              exit 1
            fi
            
            sleep 30
          done
          echo "Deployment timed out"
          exit 1

      - name: Run smoke tests against staging
        run: |
          curl -f https://staging.calibr.ai/api/health || exit 1
          echo "Smoke test passed"

      - name: Notify Slack on failure
        if: failure()
        uses: slackapi/slack-github-action@v1
        with:
          payload: '{"text":"Staging deployment failed for ${{ github.sha }}"}'
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}

  # ============================================================
  # Deploy to production — on version tag
  # ============================================================
  deploy-production:
    name: Deploy to Production
    needs: quality
    runs-on: ubuntu-latest
    if: startsWith(github.ref, 'refs/tags/v')
    environment:
      name: production
      url: https://calibr.ai

    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID_PROD }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY_PROD }}
          aws-region: us-east-1

      - name: Extract version
        run: echo "VERSION=${GITHUB_REF#refs/tags/}" >> $GITHUB_ENV

      - name: Trigger Amplify production deployment
        run: |
          JOB_ID=$(aws amplify start-job \
            --app-id ${{ secrets.AMPLIFY_APP_ID_PROD }} \
            --branch-name main \
            --job-type RELEASE \
            --query 'jobSummary.jobId' \
            --output text)
          
          echo "JOB_ID=$JOB_ID" >> $GITHUB_ENV
          echo "Triggered production deployment: $JOB_ID"

      - name: Wait for production deployment
        run: |
          for i in {1..40}; do
            STATUS=$(aws amplify get-job \
              --app-id ${{ secrets.AMPLIFY_APP_ID_PROD }} \
              --branch-name main \
              --job-id $JOB_ID \
              --query 'job.summary.status' \
              --output text)
            
            echo "Status: $STATUS (attempt $i/40)"
            
            if [ "$STATUS" = "SUCCEED" ]; then
              echo "Production deployment succeeded!"
              exit 0
            elif [ "$STATUS" = "FAILED" ] || [ "$STATUS" = "CANCELLED" ]; then
              echo "Production deployment FAILED"
              exit 1
            fi
            
            sleep 30
          done
          exit 1

      - name: Invalidate CloudFront cache
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
            --paths "/*"

      - name: Create GitHub release
        uses: softprops/action-gh-release@v2
        with:
          tag_name: ${{ env.VERSION }}
          name: "Calibr ${{ env.VERSION }}"
          generate_release_notes: true

      - name: Notify Slack on success
        uses: slackapi/slack-github-action@v1
        with:
          payload: '{"text":"Production deployment ${{ env.VERSION }} succeeded"}'
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}

      - name: Notify Slack on failure
        if: failure()
        uses: slackapi/slack-github-action@v1
        with:
          payload: '{"text":"PRODUCTION deployment FAILED for ${{ env.VERSION }}"}'
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

**Required GitHub Secrets:**
```
AWS_ACCESS_KEY_ID          — AWS key for staging deploys
AWS_SECRET_ACCESS_KEY      — AWS secret for staging deploys
AWS_ACCESS_KEY_ID_PROD     — AWS key for production deploys
AWS_SECRET_ACCESS_KEY_PROD — AWS secret for production deploys
AMPLIFY_APP_ID_STAGING     — Amplify app ID for staging
AMPLIFY_APP_ID_PROD        — Amplify app ID for production
CLOUDFRONT_DISTRIBUTION_ID — CloudFront distribution ID
SLACK_WEBHOOK_URL          — Slack incoming webhook URL
```

---

## 7. Estimated Costs

All prices are approximate AWS us-east-2 monthly costs as of 2026. Actual costs vary with usage.

### Dev Environment (1 developer, testing only)

| Service | Configuration | Monthly Cost |
|---|---|---|
| RDS PostgreSQL | db.t3.medium, 100GB gp3, Single-AZ | $60 |
| ElastiCache Redis | cache.t3.micro, 1 node | $15 |
| OpenSearch | t3.small.search, 2 nodes, 50GB | $60 |
| S3 | 10GB storage + 10K requests | $2 |
| SQS | 1M requests | $0.40 |
| Lambda | 100K invocations, 512MB | $1 |
| Cognito | Up to 50K MAU free tier | $0 |
| SES | 1,000 emails | $0.10 |
| Amplify | Build minutes (free tier) | $0 |
| CloudFront | 1GB transfer | $0.09 |
| **Total** | | **~$140/month** |

### 50 Companies (~$50K MRR, 500 users)

| Service | Configuration | Monthly Cost |
|---|---|---|
| RDS PostgreSQL | db.t3.medium, 200GB gp3, Single-AZ, 1 Read Replica | $200 |
| ElastiCache Redis | cache.t3.medium, 2 nodes | $65 |
| OpenSearch | t3.medium.search, 2 nodes, 100GB | $180 |
| S3 | 100GB storage + 500K requests | $15 |
| SQS | 10M requests | $4 |
| Lambda | 5M invocations | $10 |
| Cognito | 50K MAU | $0 |
| SES | 100K emails | $10 |
| Amplify Hosting | SSR compute | $40 |
| CloudFront + WAF | 50GB transfer, WAF rules | $45 |
| Route53 | Hosted zone + queries | $5 |
| CloudWatch | Logs, metrics, alarms | $20 |
| **Total** | | **~$595/month** |

### 500 Companies ($2M ARR target, 5,000 users)

| Service | Configuration | Monthly Cost |
|---|---|---|
| RDS PostgreSQL | db.r6g.xlarge, 1TB gp3, Multi-AZ, 2 Read Replicas | $1,200 |
| ElastiCache Redis | cache.r6g.large, 2 nodes, cluster mode | $380 |
| OpenSearch | r6g.large.search, 3 nodes, 500GB | $900 |
| S3 | 2TB storage + 5M requests | $80 |
| SQS | 100M requests | $40 |
| Lambda | 50M invocations, 512MB | $90 |
| Cognito | 500K MAU ($0.0055/MAU after 50K) | $2,475 |
| SES | 1M emails | $100 |
| Amplify Hosting | SSR compute, high traffic | $300 |
| CloudFront + WAF | 500GB transfer | $200 |
| Route53 | Hosted zones + queries | $10 |
| CloudWatch + alarms | Full observability | $100 |
| NAT Gateway | Data processing | $150 |
| Data Transfer | Cross-service | $100 |
| **Total** | | **~$6,125/month** |

**Note on Cognito cost at scale:** At 500 companies with an average of 10 users/company = 5,000 MAU. Cognito charges $0.0055/MAU after the free 50K. For talent users you may have 100K+ MAU which becomes the dominant cost. Consider using a custom auth solution (Auth.js + your own DB) if Cognito costs exceed ~$5K/month.

**Cost optimization tips:**
- Use Savings Plans or Reserved Instances for RDS (save up to 40%)
- Enable RDS proxy to reduce connection overhead (saves ~$30/month at scale but costs ~$20)
- Use S3 Intelligent-Tiering instead of manual lifecycle rules
- Set Cognito advanced security features only on the CompanyPool (higher risk)

---

## 8. Monitoring & Alerts

#### 8.1 Create CloudWatch Alarms

```bash
# Get your RDS instance ID for monitoring
RDS_INSTANCE_ID="calibr-db-${APP_ENV}"
REDIS_CLUSTER_ID="calibr-redis-${APP_ENV}"
SNS_ALERT_TOPIC="arn:aws:sns:${AWS_REGION}:${ACCOUNT_ID}:calibr-alerts"

# Create SNS alert topic
aws sns create-topic --name "calibr-alerts"
aws sns subscribe \
  --topic-arn "$SNS_ALERT_TOPIC" \
  --protocol email \
  --notification-endpoint "alerts@calibr.ai"

# ---- API Latency > 2s ----
aws cloudwatch put-metric-alarm \
  --alarm-name "calibr-api-high-latency" \
  --alarm-description "API p99 latency exceeded 2 seconds" \
  --metric-name "Latency" \
  --namespace "AWS/ApiGateway" \
  --statistic p99 \
  --period 300 \
  --threshold 2000 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --alarm-actions "$SNS_ALERT_TOPIC" \
  --ok-actions "$SNS_ALERT_TOPIC"

# ---- API Error Rate > 1% ----
aws cloudwatch put-metric-alarm \
  --alarm-name "calibr-api-high-error-rate" \
  --alarm-description "API 5xx error rate exceeded 1%" \
  --metric-name "5XXError" \
  --namespace "AWS/ApiGateway" \
  --statistic Average \
  --period 300 \
  --threshold 0.01 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --alarm-actions "$SNS_ALERT_TOPIC"

# ---- RDS Connections > 80% of max (max=200, so threshold=160) ----
aws cloudwatch put-metric-alarm \
  --alarm-name "calibr-rds-high-connections" \
  --alarm-description "RDS connections exceeded 80% of max_connections" \
  --metric-name "DatabaseConnections" \
  --namespace "AWS/RDS" \
  --dimensions "Name=DBInstanceIdentifier,Value=${RDS_INSTANCE_ID}" \
  --statistic Average \
  --period 300 \
  --threshold 160 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --alarm-actions "$SNS_ALERT_TOPIC"

# ---- RDS CPU > 80% ----
aws cloudwatch put-metric-alarm \
  --alarm-name "calibr-rds-high-cpu" \
  --alarm-description "RDS CPU usage exceeded 80%" \
  --metric-name "CPUUtilization" \
  --namespace "AWS/RDS" \
  --dimensions "Name=DBInstanceIdentifier,Value=${RDS_INSTANCE_ID}" \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 3 \
  --alarm-actions "$SNS_ALERT_TOPIC"

# ---- RDS Free Storage < 10GB ----
aws cloudwatch put-metric-alarm \
  --alarm-name "calibr-rds-low-storage" \
  --alarm-description "RDS free storage below 10GB" \
  --metric-name "FreeStorageSpace" \
  --namespace "AWS/RDS" \
  --dimensions "Name=DBInstanceIdentifier,Value=${RDS_INSTANCE_ID}" \
  --statistic Average \
  --period 300 \
  --threshold 10000000000 \
  --comparison-operator LessThanThreshold \
  --evaluation-periods 1 \
  --alarm-actions "$SNS_ALERT_TOPIC"

# ---- Redis Memory > 85% ----
aws cloudwatch put-metric-alarm \
  --alarm-name "calibr-redis-high-memory" \
  --alarm-description "Redis memory usage exceeded 85%" \
  --metric-name "DatabaseMemoryUsagePercentage" \
  --namespace "AWS/ElastiCache" \
  --dimensions "Name=ReplicationGroupId,Value=${REDIS_CLUSTER_ID}" \
  --statistic Average \
  --period 300 \
  --threshold 85 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --alarm-actions "$SNS_ALERT_TOPIC"

# ---- Lambda DLQ message count > 0 (matching failures) ----
aws cloudwatch put-metric-alarm \
  --alarm-name "calibr-matching-dlq-messages" \
  --alarm-description "Messages in AI matching DLQ — matching failures detected" \
  --metric-name "ApproximateNumberOfMessagesVisible" \
  --namespace "AWS/SQS" \
  --dimensions "Name=QueueName,Value=calibr-matching-dlq-${APP_ENV}" \
  --statistic Sum \
  --period 300 \
  --threshold 1 \
  --comparison-operator GreaterThanOrEqualToThreshold \
  --evaluation-periods 1 \
  --alarm-actions "$SNS_ALERT_TOPIC"

# ---- Amplify build failures ----
# (Set up in Amplify console under "Email notifications")
```

#### 8.2 CloudWatch Dashboard

```bash
aws cloudwatch put-dashboard \
  --dashboard-name "calibr-${APP_ENV}" \
  --dashboard-body '{
    "widgets": [
      {
        "type": "metric",
        "properties": {
          "title": "API Requests & Errors",
          "metrics": [
            ["AWS/ApiGateway", "Count"],
            ["AWS/ApiGateway", "5XXError"],
            ["AWS/ApiGateway", "4XXError"]
          ],
          "period": 300,
          "stat": "Sum",
          "view": "timeSeries"
        }
      },
      {
        "type": "metric",
        "properties": {
          "title": "RDS Performance",
          "metrics": [
            ["AWS/RDS", "CPUUtilization", "DBInstanceIdentifier", "'"$RDS_INSTANCE_ID"'"],
            ["AWS/RDS", "DatabaseConnections", "DBInstanceIdentifier", "'"$RDS_INSTANCE_ID"'"],
            ["AWS/RDS", "ReadLatency", "DBInstanceIdentifier", "'"$RDS_INSTANCE_ID"'"],
            ["AWS/RDS", "WriteLatency", "DBInstanceIdentifier", "'"$RDS_INSTANCE_ID"'"]
          ],
          "period": 300,
          "view": "timeSeries"
        }
      },
      {
        "type": "metric",
        "properties": {
          "title": "AI Matching Queue",
          "metrics": [
            ["AWS/SQS", "NumberOfMessagesSent", "QueueName", "calibr-matching-queue-'"$APP_ENV"'"],
            ["AWS/SQS", "NumberOfMessagesDeleted", "QueueName", "calibr-matching-queue-'"$APP_ENV"'"],
            ["AWS/SQS", "ApproximateNumberOfMessagesVisible", "QueueName", "calibr-matching-dlq-'"$APP_ENV"'"]
          ],
          "period": 300,
          "stat": "Sum",
          "view": "timeSeries"
        }
      }
    ]
  }'
```

#### 8.3 Log Insights Queries (save these in CloudWatch)

**Find slow API routes:**
```
fields @timestamp, @message
| filter @message like /duration/
| parse @message "duration: * ms" as duration_ms
| filter duration_ms > 2000
| sort @timestamp desc
| limit 50
```

**Count errors by type:**
```
fields @timestamp, errorType, @message
| filter level = "error"
| stats count() by errorType
| sort count() desc
```

**Track failed auth attempts:**
```
fields @timestamp, @message
| filter @message like /Unauthorized/ or @message like /401/
| stats count() by bin(5m)
| sort @timestamp desc
```

---

## Appendix: Quick Reference

### Common Commands

```bash
# Check Amplify deployment status
aws amplify list-jobs --app-id $AMPLIFY_APP_ID --branch-name main --max-results 5

# View Lambda logs
aws logs tail /aws/lambda/calibr-ai-matching-dev --follow

# Check SQS queue depth
aws sqs get-queue-attributes \
  --queue-url $QUEUE_URL \
  --attribute-names ApproximateNumberOfMessages

# Connect to RDS via bastion (if needed)
# First create a bastion EC2 instance in the public subnet with your SG
ssh -i bastion-key.pem -L 5432:${RDS_ENDPOINT}:5432 ec2-user@BASTION_IP
# Then connect locally:
psql "postgresql://calibr_admin:${DB_PASSWORD}@localhost:5432/calibr"

# Manual database backup
aws rds create-db-snapshot \
  --db-instance-identifier calibr-db-dev \
  --db-snapshot-identifier calibr-manual-backup-$(date +%Y%m%d)

# Scale up Redis
aws elasticache modify-replication-group \
  --replication-group-id calibr-redis-dev \
  --cache-node-type cache.r6g.large \
  --apply-immediately

# Rotate database password
aws rds modify-db-instance \
  --db-instance-identifier calibr-db-dev \
  --master-user-password "NEW_SECURE_PASSWORD" \
  --apply-immediately
```

### Security Checklist Before Go-Live

- [ ] All S3 buckets have public access blocked
- [ ] RDS is not publicly accessible
- [ ] All secrets stored in AWS Secrets Manager or Parameter Store, not in env vars
- [ ] WAF is enabled on CloudFront
- [ ] Cognito MFA enabled on CompanyPool (admin accounts)
- [ ] CloudTrail enabled for audit logging of AWS API calls
- [ ] GuardDuty enabled for threat detection
- [ ] SSL/TLS enforced on all endpoints (RDS, Redis, OpenSearch)
- [ ] SES out of sandbox mode
- [ ] DKIM and SPF records configured for calibr.ai
- [ ] Deletion protection enabled on RDS
- [ ] Automated backups verified and tested (run a restore)
- [ ] IAM roles follow least-privilege principle
- [ ] GitHub Secrets rotated from setup credentials
