# Azure Cloud Development Guide

_A comprehensive guide for developing, testing, and deploying applications in Microsoft Azure using virtual machines and cloud services._

## Table of Contents

- [Overview](#overview)
- [Setting Up Your Azure Development Environment](#setting-up-your-azure-development-environment)
- [Virtual Machine Setup for Development](#virtual-machine-setup-for-development)
- [Building Applications for Azure](#building-applications-for-azure)
- [Testing Strategies](#testing-strategies)
- [Deployment Options](#deployment-options)
- [CI/CD Pipeline Integration](#cicd-pipeline-integration)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

Microsoft Azure provides a comprehensive cloud platform for building, testing, and deploying applications. This guide covers the essential steps and best practices for developing applications in Azure using virtual machines and various Azure services.

### Key Benefits of Azure Development

- **Scalability**: Easily scale your applications up or down based on demand
- **Global Reach**: Deploy applications across multiple regions worldwide
- **Integrated Services**: Leverage Azure's extensive portfolio of services
- **Cost Optimization**: Pay only for what you use with flexible pricing models
- **Security**: Built-in security features and compliance certifications

## Setting Up Your Azure Development Environment

### Prerequisites

1. **Azure Account**: Create a free Azure account at [azure.microsoft.com](https://azure.microsoft.com)
2. **Azure CLI**: Install the Azure Command Line Interface
3. **Development Tools**: VS Code, Visual Studio, or your preferred IDE
4. **Git**: For version control and code management

### Initial Setup Steps

```bash
# Install Azure CLI (Windows)
winget install Microsoft.AzureCLI

# Install Azure CLI (macOS)
brew install azure-cli

# Install Azure CLI (Ubuntu/Debian)
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Login to Azure
az login

# Set your subscription
az account set --subscription "your-subscription-name"

# Create a resource group
az group create --name myDevResourceGroup --location eastus
```

## Virtual Machine Setup for Development

### Creating a Development VM

#### Option 1: Using Azure Portal

1. Navigate to the Azure Portal
2. Click "Create a resource" → "Virtual Machine"
3. Configure basic settings:
   - **Resource Group**: myDevResourceGroup
   - **VM Name**: dev-vm-001
   - **Region**: East US (or your preferred region)
   - **Image**: Ubuntu 20.04 LTS or Windows Server 2022
   - **Size**: Standard_B2s (2 vCPUs, 4 GB RAM) for development

#### Option 2: Using Azure CLI

```bash
# Create a Linux development VM
az vm create \
  --resource-group myDevResourceGroup \
  --name dev-vm-linux \
  --image UbuntuLTS \
  --admin-username azureuser \
  --generate-ssh-keys \
  --size Standard_B2ms

# Create a Windows development VM
az vm create \
  --resource-group myDevResourceGroup \
  --name dev-vm-windows \
  --image Win2022Datacenter \
  --admin-username azureuser \
  --admin-password SecurePassword123! \
  --size Standard_B2ms
```

### Configuring Your Development VM

#### For Linux VMs

```bash
# Connect to your Linux VM
ssh azureuser@<vm-public-ip>

# Update the system
sudo apt update && sudo apt upgrade -y

# Install development tools
sudo apt install -y git curl wget vim nodejs npm python3 python3-pip docker.io

# Install Azure CLI on the VM
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Configure Docker (optional)
sudo usermod -aG docker $USER
```

#### For Windows VMs

1. Connect via RDP using the credentials you set
2. Install Chocolatey package manager:
   ```powershell
   Set-ExecutionPolicy Bypass -Scope Process -Force
   [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
   iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
   ```

3. Install development tools:
   ```powershell
   choco install git nodejs python vscode azure-cli docker-desktop -y
   ```

## Building Applications for Azure

### Application Architecture Patterns

#### 1. N-Tier Applications
- **Frontend**: Web application (React, Angular, Vue.js)
- **Backend**: API layer (Node.js, .NET Core, Python)
- **Database**: Azure SQL Database, CosmosDB, or PostgreSQL

#### 2. Microservices Architecture
- **Containers**: Docker containers for each service
- **Orchestration**: Azure Kubernetes Service (AKS)
- **API Gateway**: Azure API Management
- **Service Discovery**: Built into AKS

#### 3. Serverless Applications
- **Functions**: Azure Functions for event-driven computing
- **Storage**: Azure Storage for data persistence
- **Integration**: Azure Logic Apps for workflows

### Sample Application Structure

```
my-azure-app/
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── Dockerfile
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── package.json
│   └── Dockerfile
├── infrastructure/
│   ├── arm-templates/
│   ├── terraform/
│   └── bicep/
├── .github/
│   └── workflows/
├── docker-compose.yml
└── azure-pipelines.yml
```

### Example: Node.js Application for Azure

```javascript
// server.js
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Sample API endpoint
app.get('/api/users', (req, res) => {
    res.json([
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
    ]);
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
```

```json
// package.json
{
  "name": "azure-node-app",
  "version": "1.0.0",
  "description": "Sample Node.js app for Azure",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.0",
    "jest": "^28.0.0"
  }
}
```

## Testing Strategies

### Local Testing

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run the application locally
npm run dev
```

### Testing in Azure

#### 1. Development Environment Testing

```bash
# Deploy to development slot
az webapp deployment slot create \
  --name myapp \
  --resource-group myDevResourceGroup \
  --slot development

# Deploy code to development slot
az webapp deployment source config \
  --name myapp \
  --resource-group myDevResourceGroup \
  --slot development \
  --repo-url https://github.com/username/myapp \
  --branch develop
```

#### 2. Load Testing with Azure Load Testing

```yaml
# load-test-config.yaml
version: v0.1
testName: myapp-load-test
testPlan: load-test.jmx
engineInstances: 1
configurationFiles:
  - config.csv
parameters:
  users: 10
  duration: 60
```

#### 3. Application Insights for Monitoring

```javascript
// Add Application Insights to your Node.js app
const appInsights = require('applicationinsights');
appInsights.setup(process.env.APPINSIGHTS_INSTRUMENTATIONKEY);
appInsights.start();

// Custom telemetry
const client = appInsights.defaultClient;
client.trackEvent({ name: 'UserLogin', properties: { userId: '123' } });
```

## Deployment Options

### 1. Azure App Service

```bash
# Create an App Service plan
az appservice plan create \
  --name myAppServicePlan \
  --resource-group myDevResourceGroup \
  --sku B1 \
  --is-linux

# Create a web app
az webapp create \
  --resource-group myDevResourceGroup \
  --plan myAppServicePlan \
  --name myUniqueAppName \
  --runtime "NODE|18-lts"

# Deploy from local Git
az webapp deployment source config-local-git \
  --name myUniqueAppName \
  --resource-group myDevResourceGroup
```

### 2. Azure Container Instances

```bash
# Build and push Docker image
docker build -t myapp:latest .
docker tag myapp:latest myregistry.azurecr.io/myapp:latest
docker push myregistry.azurecr.io/myapp:latest

# Deploy to Azure Container Instances
az container create \
  --resource-group myDevResourceGroup \
  --name myapp-container \
  --image myregistry.azurecr.io/myapp:latest \
  --ports 80 \
  --dns-name-label myapp-unique
```

### 3. Azure Kubernetes Service (AKS)

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: myapp
        image: myregistry.azurecr.io/myapp:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
---
apiVersion: v1
kind: Service
metadata:
  name: myapp-service
spec:
  selector:
    app: myapp
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

## CI/CD Pipeline Integration

### GitHub Actions for Azure

```yaml
# .github/workflows/azure-deploy.yml
name: Deploy to Azure

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Build application
      run: npm run build
    
    - name: Login to Azure
      uses: azure/login@v1
      with:
        creds: ${{ secrets.AZURE_CREDENTIALS }}
    
    - name: Deploy to Azure App Service
      uses: azure/webapps-deploy@v2
      with:
        app-name: 'myUniqueAppName'
        package: '.'
```

### Azure DevOps Pipeline

```yaml
# azure-pipelines.yml
trigger:
- main

pool:
  vmImage: 'ubuntu-latest'

variables:
  buildConfiguration: 'Release'

stages:
- stage: Build
  jobs:
  - job: BuildJob
    steps:
    - task: NodeTool@0
      inputs:
        versionSpec: '18.x'
      displayName: 'Install Node.js'
    
    - script: |
        npm install
        npm run build
        npm test
      displayName: 'npm install, build and test'
    
    - task: ArchiveFiles@2
      inputs:
        rootFolderOrFile: '$(Build.SourcesDirectory)'
        includeRootFolder: false
        archiveType: 'zip'
        archiveFile: '$(Build.ArtifactStagingDirectory)/$(Build.BuildId).zip'
      displayName: 'Archive files'
    
    - task: PublishBuildArtifacts@1
      inputs:
        PathtoPublish: '$(Build.ArtifactStagingDirectory)'
        ArtifactName: 'drop'
      displayName: 'Publish artifacts'

- stage: Deploy
  dependsOn: Build
  condition: succeeded()
  jobs:
  - deployment: DeploymentJob
    environment: 'production'
    strategy:
      runOnce:
        deploy:
          steps:
          - task: AzureWebApp@1
            inputs:
              azureSubscription: 'Azure-Connection'
              appType: 'webAppLinux'
              appName: 'myUniqueAppName'
              package: '$(Pipeline.Workspace)/drop/$(Build.BuildId).zip'
              runtimeStack: 'NODE|18-lts'
```

## Best Practices

### Security

1. **Use Azure Key Vault** for storing secrets and certificates
2. **Enable Azure Active Directory** authentication
3. **Implement network security groups** to control traffic
4. **Use managed identities** for Azure resource authentication
5. **Enable Azure Security Center** for security recommendations

### Performance

1. **Use Azure CDN** for static content delivery
2. **Implement caching strategies** with Azure Redis Cache
3. **Use Application Gateway** for load balancing
4. **Monitor performance** with Azure Monitor and Application Insights
5. **Optimize database queries** and use read replicas

### Cost Optimization

1. **Use Azure Cost Management** to monitor spending
2. **Implement auto-scaling** to match demand
3. **Use Azure Reserved Instances** for predictable workloads
4. **Leverage Azure Spot VMs** for development environments
5. **Set up billing alerts** to avoid unexpected costs

### Monitoring and Logging

```javascript
// Example: Structured logging with Winston
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'myapp' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Use throughout your application
logger.info('Application started', { port: 3000 });
logger.error('Database connection failed', { error: error.message });
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Application Won't Start

**Problem**: App fails to start in Azure App Service
**Solution**:
- Check application logs in Azure Portal
- Verify startup command in package.json
- Ensure all environment variables are set
- Check port configuration (use process.env.PORT)

#### 2. Database Connection Issues

**Problem**: Cannot connect to Azure SQL Database
**Solution**:
- Verify connection string format
- Check firewall rules
- Ensure the app's IP is whitelisted
- Use managed identity for authentication

#### 3. Performance Issues

**Problem**: Slow application response times
**Solution**:
- Enable Application Insights for detailed metrics
- Check for memory leaks
- Optimize database queries
- Consider scaling up the App Service plan

#### 4. Deployment Failures

**Problem**: CI/CD pipeline fails during deployment
**Solution**:
- Check service principal permissions
- Verify resource names and regions
- Review build logs for errors
- Ensure all required secrets are configured

### Useful Azure CLI Commands

```bash
# View resource groups
az group list --output table

# Check App Service status
az webapp show --name myapp --resource-group myResourceGroup

# View logs
az webapp log tail --name myapp --resource-group myResourceGroup

# Scale the application
az appservice plan update --name myAppServicePlan --resource-group myResourceGroup --sku P1V2

# Restart the application
az webapp restart --name myapp --resource-group myResourceGroup

# Get connection strings
az webapp connection-string list --name myapp --resource-group myResourceGroup
```

### Monitoring Scripts

```bash
#!/bin/bash
# monitor-app.sh - Simple application monitoring script

APP_URL="https://myapp.azurewebsites.net/health"
WEBHOOK_URL="your-teams-or-slack-webhook"

response=$(curl -s -o /dev/null -w "%{http_code}" $APP_URL)

if [ $response -ne 200 ]; then
    echo "Application is down! HTTP Status: $response"
    # Send alert to Teams/Slack
    curl -X POST -H 'Content-type: application/json' \
        --data '{"text":"🚨 Application is down! HTTP Status: '$response'"}' \
        $WEBHOOK_URL
else
    echo "Application is healthy"
fi
```

## Additional Resources

- [Azure Documentation](https://docs.microsoft.com/azure/)
- [Azure Architecture Center](https://docs.microsoft.com/azure/architecture/)
- [Azure Well-Architected Framework](https://docs.microsoft.com/azure/architecture/framework/)
- [Azure DevOps Documentation](https://docs.microsoft.com/azure/devops/)
- [Azure Samples on GitHub](https://github.com/Azure-Samples)

## Conclusion

This guide provides a comprehensive foundation for developing applications in Azure. Remember to:

1. Start small and iterate
2. Use Infrastructure as Code (ARM templates, Terraform, or Bicep)
3. Implement proper monitoring and logging
4. Follow security best practices
5. Optimize for cost and performance
6. Automate testing and deployment processes

For specific implementation details or advanced scenarios, refer to the official Azure documentation and consider consulting with Azure architects or specialists.