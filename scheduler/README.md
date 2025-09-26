# <img src="https://mern-joytify-bucket-yj.s3.ap-northeast-1.amazonaws.com/defaults/logo.svg" alt="Joytify" width="26" height="26"> Joytify Scheduler Infrastructure

> Terragrunt-managed serverless scheduler for Joytify's automated data processing pipeline with monthly statistics and intelligent cleanup

## 📋 Project Documentation

- **🏠 [Main Application](https://github.com/JIAN11442/joytify-app)** - Application overview, tech stack, features
- **⏰ [Scheduler Infrastructure](https://github.com/JIAN11442/joytify-app/tree/main/scheduler)** - Terragrunt-managed serverless scheduler _(You are here)_
- **📚 [Shared Types](https://github.com/JIAN11442/joytify-types)** - Shared TypeScript types, constants, and utilities

---

## 📋 Table of Contents

- [🏗️ Architecture & Design](#architecture-design)

  - [System Architecture](#system-architecture)
  - [Design Evolution](#design-evolution)
    - [Design Principles](#design-principles)
    - [Evolution Process](#evolution-process)
      - [Phase 1: Unified Monthly Statistics Processing](#phase-1-unified-monthly-statistics-processing)
      - [Phase 2: Batch Processing Implementation](#phase-2-batch-processing-implementation)
      - [Phase 3: Event-Driven Architecture with Intelligent Data Lifecycle Management](#phase-3-event-driven-architecture-with-intelligent-data-lifecycle-management)

- [🚀 Quick Start](#-quick-start)

  - [Prerequisites](#prerequisites)
  - [Environment Architecture](#environment-architecture)
    - [Core Environment Differences](#core-environment-differences)
    - [Configuration Management](#configuration-management)
  - [Deployment Steps](#deployment-steps)
    - [1. Clone and Navigate](#1-clone-and-navigate)
    - [2. Install Task (if needed)](#2-install-task-if-needed)
    - [3. View Available Operations](#3-view-available-operations)
    - [4. Configure AWS Credentials](#4-configure-aws-credentials)
    - [5. Set up AWS Secrets Manager](#5-set-up-aws-secrets-manager)
    - [6. Choose Your Environment](#6-choose-your-environment)
    - [7. Verify Deployment](#7-verify-deployment)
  - [Testing the Functions](#testing-the-functions)
    - [Development Environment Testing](#development-environment-testing)
    - [Production Environment Testing](#production-environment-testing)
    - [Monitor Execution](#monitor-execution)
  - [Cleanup](#cleanup)
    - [Remove Specific Environment](#remove-specific-environment)
    - [Complete Cleanup](#complete-cleanup)

- [⚙️ Configuration & Operations](#configuration-operations)

  - [Variables Reference](#variables-reference)
    - [Environment & Schedule Configuration](#environment--schedule-configuration)
    - [Lambda Configuration](#lambda-configuration)
    - [Data Processing Configuration](#data-processing-configuration)
    - [Monitoring Configuration](#monitoring-configuration)
  - [Monitoring & Troubleshooting](#monitoring--troubleshooting)
    - [Real-time Log Monitoring](#real-time-log-monitoring)
    - [Performance Analytics](#performance-analytics)
    - [Infrastructure Health Check](#infrastructure-health-check)

- [📊 Performance & Scaling](#performance-scaling)
  - [Capacity Planning](#capacity-planning)
    - [Real-world Data Structure Analysis](#real-world-data-structure-analysis)
    - [User Data Generation Patterns](#user-data-generation-patterns)
    - [Storage Requirements (60-day Retention)](#storage-requirements-60-day-retention)
    - [Data Accumulation Process (60-day Retention)](#data-accumulation-process-60-day-retention)
    - [Capacity Summary](#capacity-summary)
    - [Capacity Growth Projections](#capacity-growth-projections)
    - [Conclusion](#conclusion)
  - [Scaling Strategies](#scaling-strategies)
    - [Alternative Data Lifecycle Strategies](#alternative-data-lifecycle-strategies)

---

<h1 id="architecture-design">🏗️ Architecture & Design</h1>

> Serverless infrastructure for Joytify's automated data processing pipeline

This Terraform project implements a **serverless event-driven architecture** that provides essential backend automation services for the Joytify music streaming platform. The infrastructure handles monthly statistics generation, intelligent data cleanup, and real-time monitoring without requiring any server management.

## System Architecture

```mermaid
graph TB
    subgraph "External Services"
        MONGO[📦 MongoDB Atlas<br/>Notifications & Playbacks]
        API[🔗 Backend API<br/>WebSocket Integration]
    end

    subgraph "AWS Infrastructure (Terraform Managed)"
        %% CloudWatch Event Schedulers
        EB1[📅 Monthly Schedule<br/>Every 1st 2AM UTC]
        EB2[📅 Weekly Schedule<br/>Every Mon 4AM UTC]

        %% Lambda Functions
        STATS(📊 Monthly Stats Lambda<br/>Notification Generation)
        CLEANUP(🧹 Playback Cleanup Lambda<br/>Data Retention)
        DISCORD(🤖 Discord Notification<br/>Execution Monitoring)

        %% AWS Services
        SNS[📢 SNS Topic<br/>Results Coordination]
        CW1[📊 CloudWatch Logs<br/>Centralized Logging]
        CW2[🚨 CloudWatch Alarms<br/>Error Monitoring]
        IAM[🛡️ IAM Roles & Policies<br/>Access Control]
        SECRETS[🔐 Secrets Manager<br/>JOYTIFY_SCHEDULER_ENVS]
    end

    %% External Users (Final Output)
    USERS[👤 Discord Users<br/>Notification Recipients]

    %% Monthly Main Execution Path (Blue solid line)
    EB1 --> STATS
    STATS -->|Auto Invoke| CLEANUP
    STATS -->|Results| SNS
    CLEANUP -->|Results| SNS
    SNS -->|Trigger| DISCORD
    DISCORD -->|Send Notifications| USERS

    %% Weekly Main Execution Path (Orange solid line)
    EB2 --> CLEANUP
    CLEANUP -->|Results| SNS
    SNS -->|Trigger| DISCORD
    DISCORD -->|Send Notifications| USERS

    %% Data Injections (Dotted lines)
    STATS -.->|Read/Write| MONGO
    CLEANUP -.->|Clean Data| MONGO
    STATS -.->|Notification| API

    %% Configuration Injections (Deploy-time)
    SECRETS -.->|Deploy: Env Vars| STATS
    SECRETS -.->|Deploy: Env Vars| CLEANUP
    SECRETS -.->|Deploy: Env Vars| DISCORD

    %% Logging (Thin lines)
    STATS -...->|Logs| CW1
    CLEANUP -...->|Logs| CW1
    DISCORD -...->|Logs| CW1

    %% Alarm tracking
    CW2 -->|Alarm| SNS

    %% Apply styles
    class MONGO database
    class API api
    class STATS,CLEANUP,DISCORD lambda
    class EB1,EB2,CW1,CW2 cloudwatch
    class SECRETS secrets
    class SNS sns
    class IAM iam
    class USERS users

    %% Styling - Unified stroke width
    classDef database fill:#e1f5fe,stroke:#0277bd,stroke-width:2px
    classDef api fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef lambda fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef cloudwatch fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef secrets fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    classDef sns fill:#fff8e1,stroke:#f9a825,stroke-width:2px
    classDef iam fill:#e8eaf6,stroke:#3f51b5,stroke-width:2px
    classDef users fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px

    %% Essential paths
    linkStyle 0 stroke:#004c99,stroke-width:3px
    linkStyle 1 stroke:#004c99,stroke-width:3px
    linkStyle 2 stroke:#004c99,stroke-width:3px
    linkStyle 3 stroke:#004c99,stroke-width:3px
    linkStyle 4 stroke:#004c99,stroke-width:3px
    linkStyle 5 stroke:#004c99,stroke-width:3px
    linkStyle 6 stroke:#cc5500,stroke-width:3px
    linkStyle 7 stroke:#cc5500,stroke-width:3px
    linkStyle 8 stroke:#cc5500,stroke-width:3px
    linkStyle 9 stroke:#cc5500,stroke-width:3px

    %% MongoDB Data connections (Blue dotted)
    linkStyle 10 stroke:#2196f3,stroke-width:2px,stroke-dasharray:5 5
    linkStyle 11 stroke:#2196f3,stroke-width:2px,stroke-dasharray:5 5
    linkStyle 12 stroke:#2196f3,stroke-width:2px,stroke-dasharray:5 5

    %% Alarm connection (Red)
    linkStyle 15 stroke:#f44336,stroke-width:2px

```

| Component                          | Purpose                     | Key Features                                                                   |
| ---------------------------------- | --------------------------- | ------------------------------------------------------------------------------ |
| **📊 Monthly Stats Lambda**        | Notification generation     | Aggregates user stats, creates notifications, triggers cleanup & WebSocket     |
| **🧹 Playback Cleanup Lambda**     | Intelligent data cleanup    | Batch deletion with timeout protection, configurable retention logic           |
| **🤖 Discord Notification Lambda** | Execution monitoring        | SNS message formatting, Discord webhook notifications, CloudWatch alarm alerts |
| **📅 CloudWatch Events**           | Scheduled automation        | Monthly (1st 2AM UTC) + Weekly (Mon 4AM UTC) triggers                          |
| **📢 SNS Topic**                   | Inter-service communication | Coordinates execution results and triggers Discord notifications               |
| **📊 CloudWatch Logs**             | Observability               | Centralized logging for all Lambda functions with configurable retention       |
| **🚨 CloudWatch Alarms**           | Error monitoring            | Lambda error detection, SNS alerting to Discord                                |
| **🛡️ IAM Roles & Policies**        | Security & access control   | Lambda execution, SNS publishing, Secrets Manager access                       |
| **🔐 Secrets Manager**             | Deploy-time configuration   | Stores environment variables (MongoDB URI, Discord webhooks, API keys)         |

## Design Evolution

### Design Principles

- **Storage Optimization**: Maximize processing efficiency within MongoDB M0 (512MB) tier with intelligent data retention and cleanup.
- **Development-First Automation**: Prioritize automation and reliability for development-stage workloads without manual intervention.
- **Cost-Effective Operations**: Minimize operational complexity and cost through serverless architecture and shared resources.
- **Future Scalability**: Design for seamless scaling and production deployments with established upgrade paths.

### Evolution Process

#### Phase 1: Unified Monthly Statistics Processing

| Service                | Description                                         | Status | Issue                                                                                   | Solution                                                                                          |
| ---------------------- | --------------------------------------------------- | ------ | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| CloudWatch Events      | Monthly trigger at 2 AM on 1st                      | ✅     | -                                                                                       | -                                                                                                 |
| Lambda (Statistics)    | Generate reports from user monthly playback records | ✅     | Tested with 250M records, processed via MongoDB aggregate                               | -                                                                                                 |
| Lambda (Data Transfer) | Transfer playback data to backup history collection | ❌     | 2.5M records exceeded 15-minute Lambda timeout                                          | Trigger multiple CloudWatch-based Lambda invocations to distribute load across multiple functions |
| Auxiliary Services     | SNS, CloudWatch, Secrets Manager, Discord           | ✅     | **Design Philosophy**: Complete data preservation approach started failing due to scale | -                                                                                                 |

#### Phase 2: Batch Processing Implementation

| Service             | Description                                       | Status | Issue                                                                                              | Solution                                                                                                                 |
| ------------------- | ------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| CloudWatch Events   | Monthly trigger at 2 AM on 1st                    | ✅     | -                                                                                                  | -                                                                                                                        |
| Lambda (Dispatcher) | Determine number of Lambdas based on data volume  | ✅     | -                                                                                                  | -                                                                                                                        |
| Lambda (Statistics) | Process statistics in batches (10K records/batch) | ✅     | -                                                                                                  | -                                                                                                                        |
| Lambda (Transfer)   | Transfer data in batches                          | ❌     | 2.5M records still timeout, MongoDB memory constraints on M0 tier couldn't handle batch processing | **Architecture Shift**: Move data retention away from schedule-based transfers to application-layer lifecycle management |
| Auxiliary Services  | SNS, CloudWatch, Secrets Manager, Discord         | ✅     | -                                                                                                  | -                                                                                                                        |

#### Phase 3: Event-Driven Architecture with Intelligent Data Lifecycle Management

| Service                     | Description                                                                 | Status | Performance                                        | Design Rationale                                                                         |
| --------------------------- | --------------------------------------------------------------------------- | ------ | -------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| CloudWatch Events (Monthly) | Trigger at 2 AM on 1st                                                      | ✅     | Reliable scheduling                                | Monthly statistics + auto-invoke cleanup integration                                     |
| CloudWatch Events (Weekly)  | Trigger at 4 AM every Monday                                                | ✅     | Consistent cleanup                                 | Independent lifecycle maintenance ensuring M0 capacity stability                         |
| Lambda (Notifications)      | Generate notifications, update user associations, trigger WebSocket updates | ✅     | Real-time processing                               | Event-driven notification system built for development-stage monitoring                  |
| Lambda (Cleanup)            | Smart retention policy with batch deletion (optimized for M0 tier)          | ✅     | Efficient batch processing with timeout protection | **Solution**: Intelligent data lifecycle replaces preservation-focused transfer approach |
| Auxiliary Services          | SNS, CloudWatch, Secrets Manager, Discord                                   | ✅     | Comprehensive monitoring                           | Complete observability and error handling for operational excellence                     |

**Evolution Summary**: The architecture evolved from data preservation focus (preserving all historical records) to intelligent lifecycle management (maintaining data only as long as business value) under MongoDB M0 constraints. This transition from "collect everything" to "manage effectively" enables sustainable development-stage operation within resource limits.

This is why the current framework is designed as it is: to achieve the best possible efficiency and reliability under strict development-stage constraints. If you are interested in scaling or production-level deployment, please refer to the [Scaling Strategies](#scaling-strategies) section below for recommended upgrade strategies.

---

# 🚀 Quick Start

This guide helps you deploy the Joytify serverless scheduler using Terragrunt and Task automation.

## Prerequisites

**Required AWS Permissions:**

- **IAM**: Create execution roles and policies for Lambda execution (lambda execution role + policy attachments)
- **Lambda**: Create functions, manage permissions, manage environment variables and invoke targets
- **CloudWatch Events**: Create CloudWatch Event rules and targets (for scheduled triggers)
- **SNS**: Create topics, manage SNS topic policies and subscribe to topics
- **CloudWatch**: Create log groups, metric alarms with SNS actions; manage CloudWatch events
- **Secrets Manager**: Access and read existing secrets (no create/delete permissions needed for deployment)

**Development Tools:**

- **Terragrunt** (v0.45+) - Multi-environment infrastructure management
- **Task** (automation tool) - `brew install go-task` or [download](https://taskfile.dev/installation/)
- **Node.js** (v18+) - For packaging and running Lambda deployment packages

**External Services:**

- **MongoDB Atlas** account - Database for processing data and storing statistics
- **Discord webhook URL** - For real-time execution monitoring and alerting

## Environment Architecture

This scheduler uses Terragrunt for multi-environment management with distinct configurations designed for safe development practices:

### Core Environment Differences

| Feature                  | Development (`dev/`)          | Production (`prod/`)           |
| ------------------------ | ----------------------------- | ------------------------------ |
| **Purpose**              | Manual testing & development  | Automated production schedules |
| **Database Collections** | `test-*` prefixed collections | Production collections         |
| **Auto Scheduling**      | ❌ Disabled                   | ✅ Enabled                     |
| **Lambda Memory**        | 128MB                         | 256MB                          |
| **Log Retention**        | 1 day                         | 7 days                         |
| **Cleanup Period**       | 1 day (for testing)           | 60 days (production retention) |
| **Batch Size**           | 100 records                   | 10,000 records                 |
| **Monthly Schedule**     | Manual triggers only          | 1st of month, 2AM UTC          |
| **Weekly Cleanup**       | Manual triggers only          | Every Monday, 4AM UTC          |
| **Timeout Settings**     | 30s/60s                       | 300s/900s (5min/15min)         |

### Configuration Management

Environment settings are defined in dedicated configuration files:

- **`environments/dev/terragrunt.hcl`** - Development optimization settings
- **`environments/prod/terragrunt.hcl`** - Production reliability settings

> 💡 **Design Philosophy**: Development auto-scheduling is disabled (`enable_auto_schedule = false`) to prevent accidental production triggers, while using isolated `test-*` database collections for safe testing.

> 🔧 **Advanced Configuration**: For detailed parameter tuning, variable ranges, and operational commands, see [Configuration & Operations](#configuration-operations).

## Deployment Steps

### 1. Clone and Navigate

```bash
git clone https://github.com/JIAN11442/joytify-app.git
cd joytify-app/scheduler
```

### 2. Install Task (if needed)

```bash
# macOS
brew install go-task

# Verify installation
task --version
```

### 3. View Available Operations

```bash
# See all available commands
task --list

# Check current deployment status
task status
```

### 4. Configure AWS Credentials

Ensure your AWS CLI is configured with appropriate permissions for the scheduler deployment.

### 5. Set up AWS Secrets Manager

Create a secret named `JOYTIFY_SCHEDULER_ENVS` with these keys:

| Key                       | Description                        | Example Value                                    |
| ------------------------- | ---------------------------------- | ------------------------------------------------ |
| MONGODB_CONNECTION_STRING | MongoDB Atlas connection string    | mongodb+srv://user:pass@cluster.mongodb.net/db   |
| DISCORD_WEBHOOK_URL       | Discord webhook for notifications  | https://discord.com/api/webhooks/YOUR_WEBHOOK_ID |
| DISCORD_TIMEZONE          | Timezone for Discord notifications | Asia/Taipei                                      |
| API_INTERNAL_SECRET_KEY   | Internal API key for backend auth  | your-random-secret-key                           |
| API_DOMAIN                | Main backend API URL               | https://api.joytify.com                          |

### 6. Choose Your Environment

**For Development/Testing:**

Development environment uses separate `test-*` database collections for safe testing.

**Generate Test Data:**

```bash
# Navigate to test data generator
cd test && npm install

# Configure database connection (copy template and edit)
cp .env.example .env

# Generate 1000 test users with realistic playback data
node generator.js generate 1000

# View all available commands
node generator.js
```

**Deploy Development Infrastructure:**

```bash
# Return to scheduler directory
cd ..

# Preview changes
task envs:dev:plan

# Deploy development infrastructure
task envs:dev:deploy
```

**For Production:**

```bash
# Preview changes
task envs:prod:plan

# Deploy production infrastructure
task envs:prod:deploy
```

### 7. Verify Deployment

```bash
# Check deployment status
task status

# View specific environment outputs
task envs:dev:output
# or
task envs:prod:output
```

## Testing the Functions

### Development Environment Testing

Development environment is designed for manual testing and uses separate test database collections:

```bash
# Generate the base64 payload
echo '{"testMode": true}' | base64
# Output: eyJ0ZXN0TW9kZSI6dHJ1ZX0=

# Test monthly stats function (processes test-* collections)
aws lambda invoke --function-name joytify-app-dev-monthly-stats-notification --payload 'eyJ0ZXN0TW9kZSI6dHJ1ZX0=' response.json

# Test cleanup function (cleans test-playbacks collection)
aws lambda invoke --function-name joytify-app-dev-playback-data-cleanup --payload 'eyJ0ZXN0TW9kZSI6dHJ1ZX0=' response.json
```

> 📝 **Note**: If you don't have test data, these functions will complete quickly with zero records processed.

### Production Environment Testing

Production environment runs on automated schedules, but can be manually triggered for testing:

```bash
# Generate the base64 payload
echo '{}' | base64
# Output: e30=

# Manual trigger for testing (normally runs automatically)
aws lambda invoke --function-name joytify-app-prod-monthly-stats-notification --payload 'e30=' response.json
```

> ⚠️ **Note**: Production environment processes real user data and is configured for automated execution. Manual triggers should only be used for testing or emergency situations.

### Monitor Execution

The infrastructure automatically sends real-time execution status and monitoring alerts to your Discord channel:

<div align="left">
  <img src="https://mern-joytify-bucket-yj.s3.ap-northeast-1.amazonaws.com/readme/discord-notifications.png" width="60%" alt="Discord Notifications">
</div>

## Cleanup

### Remove Specific Environment

```bash
task envs:dev:destroy
# or
task envs:prod:destroy
```

### Complete Cleanup

```bash
# Remove environments sequentially and clean up backend resources
task envs:prod:destroy
task envs:dev:destroy
task cleanup-state
```

> ⚠️ **Warning**: Complete cleanup removes Terraform state backend (S3 bucket and DynamoDB table). Use with caution.

---

<h1 id="configuration-operations">⚙️ Configuration & Operations</h1>

> **Infrastructure parameter reference and operational monitoring guide**

## Variables Reference

### Environment & Schedule Configuration

| Variable                  | Default             | Range/Options            | Purpose                             |
| ------------------------- | ------------------- | ------------------------ | ----------------------------------- |
| `environment`             | `prod`              | `dev`, `staging`, `prod` | Environment name                    |
| `project_name`            | `joytify`           | String                   | Resource naming prefix              |
| `nodejs_runtime`          | `nodejs20.x`        | Node.js versions         | Lambda runtime version              |
| `enable_auto_schedule`    | `true`              | `true`, `false`          | Enable/disable automatic scheduling |
| `monthly_stats_schedule`  | `cron(0 2 1 * ? *)` | Cron/Rate expressions    | Monthly stats trigger schedule      |
| `weekly_cleanup_schedule` | `cron(0 4 ? * 2 *)` | Cron/Rate expressions    | Weekly cleanup trigger schedule     |

### Lambda Configuration

| Variable                           | Default | Range     | Purpose                               |
| ---------------------------------- | ------- | --------- | ------------------------------------- |
| `lambda_memory_size`               | `256`   | 128-10240 | Lambda memory allocation (MB)         |
| `monthly_stats_timeout_seconds`    | `300`   | 1-900     | Monthly stats Lambda timeout (sec)    |
| `playback_cleanup_timeout_seconds` | `900`   | 1-900     | Playback cleanup Lambda timeout (sec) |

### Data Processing Configuration

| Variable                         | Default | Range    | Purpose                            |
| -------------------------------- | ------- | -------- | ---------------------------------- |
| `cleanup_days`                   | `60`    | 1-365    | Data retention period (days)       |
| `cleanup_batch_size`             | `10000` | 1-100000 | Records per batch processing       |
| `cleanup_batch_delay_ms`         | `100`   | 0-5000   | Delay between batches (ms)         |
| `cleanup_timeout_safety_minutes` | `14`    | 1-60     | Safety timeout before Lambda limit |

### Monitoring Configuration

| Variable                        | Default | Range | Purpose              |
| ------------------------------- | ------- | ----- | -------------------- |
| `cloudwatch_log_retention_days` | `7`     | 1-∞   | Log retention period |

> 💡 **Configuration Changes**: Edit variables in `environments/{env}/terragrunt.hcl` and apply with `task envs:{env}:apply`.

## Monitoring & Troubleshooting

### Real-time Log Monitoring

```bash
# View live execution logs
aws logs tail /aws/lambda/joytify-app-{env}-monthly-stats-notification --follow
aws logs tail /aws/lambda/joytify-app-{env}-playback-data-cleanup --follow
aws logs tail /aws/lambda/joytify-app-{env}-discord-notification --follow

# Search for errors in recent logs
aws logs filter-log-events --log-group-name /aws/lambda/joytify-app-{env}-monthly-stats-notification --filter-pattern "ERROR" --start-time $(date -d '1 day ago' +%s)000
```

### Performance Analytics

```bash
# Function execution duration (last 24 hours)
aws cloudwatch get-metric-statistics --namespace AWS/Lambda --metric-name Duration --dimensions Name=FunctionName,Value=joytify-app-{env}-monthly-stats-notification --start-time $(date -d '1 day ago' -u +%Y-%m-%dT%H:%M:%S) --end-time $(date -u +%Y-%m-%dT%H:%M:%S) --period 3600 --statistics Average,Maximum

# Error and throttle monitoring
aws cloudwatch get-metric-statistics --namespace AWS/Lambda --metric-name Errors --dimensions Name=FunctionName,Value=joytify-app-{env}-monthly-stats-notification --start-time $(date -d '1 day ago' -u +%Y-%m-%dT%H:%M:%S) --end-time $(date -u +%Y-%m-%dT%H:%M:%S) --period 3600 --statistics Sum

# Memory utilization tracking
aws cloudwatch get-metric-statistics --namespace AWS/Lambda --metric-name MemoryUtilization --dimensions Name=FunctionName,Value=joytify-app-{env}-monthly-stats-notification --start-time $(date -d '1 day ago' -u +%Y-%m-%dT%H:%M:%S) --end-time $(date -u +%Y-%m-%dT%H:%M:%S) --period 3600 --statistics Maximum
```

### Infrastructure Health Check

```bash
# Verify CloudWatch Events scheduling
aws events describe-rule --name joytify-app-{env}-monthly-stats-schedule
aws events list-targets-by-rule --rule joytify-app-{env}-monthly-stats-schedule

# SNS topic status and subscriptions
aws sns get-topic-attributes --topic-arn $(task envs:{env}:output | grep sns_topic_arn | cut -d'"' -f4)
aws sns list-subscriptions-by-topic --topic-arn $(task envs:{env}:output | grep sns_topic_arn | cut -d'"' -f4)

# Lambda function configuration verification
aws lambda get-function --function-name joytify-app-{env}-monthly-stats-notification --query 'Configuration.[FunctionName,Runtime,MemorySize,Timeout,LastModified]'
```

---

<h1 id="performance-scaling">📊 Performance & Scaling</h1>

## Capacity Planning

### Real-world Data Structure Analysis

Based on actual MongoDB database analysis:

**Collection Data Sizes:**

| Collection           | Avg Document Size | Description                |
| -------------------- | ----------------- | -------------------------- |
| **👥 users**         | 1,183 bytes       | User profiles, preferences |
| **🎵 playbacks**     | 150 bytes         | Play history (main growth) |
| **📈 stats**         | 348 bytes         | Monthly statistics         |
| **🔔 notifications** | 300 bytes         | System notifications       |
| **📋 playlists**     | 546 bytes         | User-created playlists     |
| **🎶 songs**         | 948 bytes         | User-uploaded songs        |
| **💿 albums**        | 450 bytes         | User-created albums        |
| **🔐 sessions**      | 844 bytes         | Login sessions             |

### User Data Generation Patterns

**Active Users (High Usage):**

| Data Type            | Daily | Weekly | Monthly | Description                           |
| -------------------- | ----- | ------ | ------- | ------------------------------------- |
| **🎵 Playbacks**     | 30    | 210    | 900     | Daily/weekly play count               |
| **🔐 Sessions**      | 2     | 14     | 60      | Session management (max 5 per user)   |
| **🔔 Notifications** | 0.005 | 0.143  | 1       | System notifications                  |
| **📈 Statistics**    | -     | -      | -       | User stats (one base record per user) |
| **📋 Playlists**     | 0.010 | 0.286  | 2       | User-created playlists                |
| **🎶 Songs**         | 0.024 | 0.714  | 5       | User-uploaded songs                   |
| **💿 Albums**        | 0.010 | 0.286  | 2       | User-created albums                   |

**Regular Users (Moderate Usage):**

| Data Type            | Daily | Weekly | Monthly | Description                                      |
| -------------------- | ----- | ------ | ------- | ------------------------------------------------ |
| **🎵 Playbacks**     | 10    | 70     | 300     | Weekly usage 2-3 times, ~18-20 plays per session |
| **🔐 Sessions**      | 0.3   | 2.1    | 9       | Session management (max 5 per user)              |
| **🔔 Notifications** | 0.005 | 0.143  | 1       | System notifications                             |
| **📈 Statistics**    | -     | -      | -       | User stats (one base record per user)            |
| **📋 Playlists**     | 0.002 | 0.057  | 0.4     | User-created playlists (lower frequency)         |
| **🎶 Songs**         | 0.005 | 0.143  | 1       | User-uploaded songs (lower frequency)            |
| **💿 Albums**        | 0.002 | 0.057  | 0.4     | User-created albums (lower frequency)            |

### Storage Requirements (60-day Retention)

**Weekly Data Generation per User:**

| Data Type            | Active Users | Regular Users | Notes                            |
| -------------------- | ------------ | ------------- | -------------------------------- |
| **👥 User**          | 1,183 bytes  | 1,183 bytes   | Fixed, created on registration   |
| **🎵 Playbacks**     | 31,500 bytes | 10,500 bytes  | Weekly cleanup, 60-day retention |
| **🔐 Sessions**      | 11,816 bytes | 1,772 bytes   | Weekly cleanup, 60-day retention |
| **🔔 Notifications** | 75 bytes     | 75 bytes      | Weekly average                   |
| **📈 Statistics**    | 87 bytes     | 87 bytes      | Weekly average                   |
| **📋 Playlists**     | 27 bytes     | 14 bytes      | Weekly average                   |
| **🎶 Songs**         | 119 bytes    | 47 bytes      | Weekly average                   |
| **💿 Albums**        | 11 bytes     | 6 bytes       | Weekly average                   |
| **📦 Weekly Total**  | **~45 KB**   | **~14 KB**    | Single week generation           |

### Data Accumulation Process (60-day Retention)

**Data Growth Phase (First 8 Weeks):**

| Week | Active Users | Regular Users | Status                |
| ---- | ------------ | ------------- | --------------------- |
| 1    | 45 KB        | 14 KB         | Starting accumulation |
| 2    | 90 KB        | 28 KB         | Growing               |
| 3    | 135 KB       | 42 KB         | Growing               |
| 4    | 180 KB       | 56 KB         | Growing               |
| 5    | 225 KB       | 70 KB         | Growing               |
| 6    | 270 KB       | 84 KB         | Growing               |
| 7    | 315 KB       | 98 KB         | Growing               |
| 8    | 360 KB       | 112 KB        | Start cleanup         |

**Stable Operation Phase (After Week 8):**

| Week   | Active Users | Regular Users | Cleanup                         | Notes                 |
| ------ | ------------ | ------------- | ------------------------------- | --------------------- |
| 9      | 361.7 KB     | 112.7 KB      | Clean week 1 playbacks/sessions | +1.7 KB net growth    |
| 10     | 363.4 KB     | 113.4 KB      | Clean week 2 playbacks/sessions | +1.7 KB net growth    |
| 11     | 365.1 KB     | 114.1 KB      | Clean week 3 playbacks/sessions | +1.7 KB net growth    |
| Stable | **~365 KB**  | **~114 KB**   | Maintain 60 days                | Slow growth continues |

> **Note:** Cleanup only removes playbacks and sessions. Other collections (notifications, stats, playlists, songs, albums) continue to accumulate, causing slow capacity growth.

### Capacity Summary

Based on real data analysis and 60-day retention policy:

| User Type            | Per User Storage | Max Users | Notes                          |
| -------------------- | ---------------- | --------- | ------------------------------ |
| **🔥 Active Users**  | ~365 KB          | ~1,400    | Stable state, 60-day retention |
| **👤 Regular Users** | ~114 KB          | ~4,500    | Stable state, 60-day retention |
| **🎯 Mixed Model**   | ~147 KB          | ~3,500    | 20% active + 80% regular       |
| **🛡️ Conservative**  | ~185 KB          | ~2,800    | 20% buffer space               |

### Capacity Growth Projections

- **+1,000 Active Users**: ~365 MB additional data
- **+1,000 Regular Users**: ~114 MB additional data
- **First 8 weeks**: Data accumulation phase
- **After Week 8**: Weekly cleanup with slow growth
- **Index Space**: ~20-25% of total storage
- **Monitor Threshold**: 400 MB (80% capacity)

### Conclusion

Based on real data analysis and 60-day retention, MongoDB M0 (512MB) can sustainably support **2,800-3,500 total users** in stable operation. The first 8 weeks are data accumulation phase, after which weekly cleanup maintains near-stable capacity with slow growth.

## Scaling Strategies

| Scenario        | Users Limit   | Scaling Action        | Infrastructure                            | Setup Time | Monthly Cost | Alternative Choices                               |
| --------------- | ------------- | --------------------- | ----------------------------------------- | ---------- | ------------ | ------------------------------------------------- |
| **Current**     | 3,500 users   | -                     | M0 MongoDB (512MB)<br/>256MB Lambda       | Current    | $0           | -                                                 |
| **Performance** | 3,500 users   | Memory upgrade        | M0 MongoDB (512MB)<br/>512MB Lambda       | 5 min      | +$0.33       | Increase batch size                               |
| **Growth**      | 10,000 users  | Database upgrade      | M10 MongoDB (10GB)<br/>Optimized Lambda   | 1 day      | +$57         | Alternative: PostgreSQL<br/>Alternative: DynamoDB |
| **Enterprise**  | 50,000+ users | Architecture redesign | M30+ MongoDB<br/>Microservices + Sharding | 2-4 weeks  | +$200        | Alternative: Multi-database strategy              |

### Alternative Data Lifecycle Strategies

Before infrastructure scaling, consider these data management optimizations:

- **Aggressive Retention Policy**: Reduce from 60 days to 30 days, doubling user capacity with same hardware
- **Tiered Storage**: Hot data (MongoDB) + cold data (S3 archival) for cost-effective long-term storage
- **Selective Cleanup**: Different retention periods per data type to optimize storage efficiency

---
