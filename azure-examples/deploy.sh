#!/bin/bash

# Azure deployment script
# This script helps automate the deployment process to Azure

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
RESOURCE_GROUP=""
APP_NAME=""
LOCATION="eastus"
SKU="B1"
SUBSCRIPTION=""

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Azure CLI is installed
check_azure_cli() {
    if ! command -v az &> /dev/null; then
        print_error "Azure CLI is not installed. Please install it first."
        exit 1
    fi
}

# Function to check if user is logged in
check_azure_login() {
    if ! az account show &> /dev/null; then
        print_error "You are not logged in to Azure. Please run 'az login' first."
        exit 1
    fi
}

# Function to set subscription
set_subscription() {
    if [ -n "$SUBSCRIPTION" ]; then
        print_status "Setting subscription to $SUBSCRIPTION"
        az account set --subscription "$SUBSCRIPTION"
    fi
}

# Function to create resource group
create_resource_group() {
    print_status "Creating resource group: $RESOURCE_GROUP"
    az group create \
        --name "$RESOURCE_GROUP" \
        --location "$LOCATION" \
        --output table
}

# Function to deploy ARM template
deploy_arm_template() {
    print_status "Deploying ARM template..."
    az deployment group create \
        --resource-group "$RESOURCE_GROUP" \
        --template-file arm-template.json \
        --parameters appName="$APP_NAME" \
                    appServicePlanName="$APP_NAME-plan" \
                    sku="$SKU" \
                    location="$LOCATION" \
        --output table
}

# Function to deploy using Bicep
deploy_bicep() {
    print_status "Deploying Bicep template..."
    az deployment group create \
        --resource-group "$RESOURCE_GROUP" \
        --template-file bicep/main.bicep \
        --parameters appName="$APP_NAME" \
                    location="$LOCATION" \
                    appServicePlanSku="$SKU" \
        --output table
}

# Function to deploy application code
deploy_app() {
    print_status "Deploying application code..."
    
    # Build the application
    npm install
    npm run build --if-present
    
    # Create deployment package
    zip -r deployment.zip . -x "node_modules/*" ".git/*" "*.md"
    
    # Deploy to Azure App Service
    az webapp deployment source config-zip \
        --resource-group "$RESOURCE_GROUP" \
        --name "$APP_NAME" \
        --src deployment.zip
    
    # Clean up
    rm deployment.zip
}

# Function to show deployment status
show_status() {
    print_status "Checking deployment status..."
    
    # Get app URL
    APP_URL=$(az webapp show \
        --resource-group "$RESOURCE_GROUP" \
        --name "$APP_NAME" \
        --query "defaultHostName" \
        --output tsv)
    
    print_status "Application URL: https://$APP_URL"
    
    # Test health endpoint
    print_status "Testing health endpoint..."
    sleep 30  # Wait for app to start
    
    if curl -f "https://$APP_URL/health" > /dev/null 2>&1; then
        print_status "Health check passed!"
    else
        print_warning "Health check failed. Please check the application logs."
    fi
}

# Function to show logs
show_logs() {
    print_status "Showing application logs..."
    az webapp log tail \
        --resource-group "$RESOURCE_GROUP" \
        --name "$APP_NAME"
}

# Function to clean up resources
cleanup() {
    print_warning "This will delete the entire resource group: $RESOURCE_GROUP"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Deleting resource group..."
        az group delete \
            --name "$RESOURCE_GROUP" \
            --yes \
            --no-wait
        print_status "Cleanup initiated (running in background)"
    fi
}

# Function to show help
show_help() {
    echo "Azure Deployment Script"
    echo ""
    echo "Usage: $0 [OPTIONS] COMMAND"
    echo ""
    echo "Commands:"
    echo "  deploy     Deploy infrastructure and application"
    echo "  app-only   Deploy application code only"
    echo "  status     Show deployment status"
    echo "  logs       Show application logs"
    echo "  cleanup    Delete all resources"
    echo "  help       Show this help message"
    echo ""
    echo "Options:"
    echo "  -g, --resource-group  Resource group name (required)"
    echo "  -a, --app-name        Application name (required)"
    echo "  -l, --location        Azure region (default: eastus)"
    echo "  -s, --sku             App Service Plan SKU (default: B1)"
    echo "  -u, --subscription    Azure subscription ID"
    echo ""
    echo "Examples:"
    echo "  $0 -g myapp-rg -a myapp deploy"
    echo "  $0 -g myapp-rg -a myapp app-only"
    echo "  $0 -g myapp-rg -a myapp status"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -g|--resource-group)
            RESOURCE_GROUP="$2"
            shift 2
            ;;
        -a|--app-name)
            APP_NAME="$2"
            shift 2
            ;;
        -l|--location)
            LOCATION="$2"
            shift 2
            ;;
        -s|--sku)
            SKU="$2"
            shift 2
            ;;
        -u|--subscription)
            SUBSCRIPTION="$2"
            shift 2
            ;;
        deploy|app-only|status|logs|cleanup|help)
            COMMAND="$1"
            shift
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Validate required parameters
if [ -z "$COMMAND" ]; then
    print_error "Command is required"
    show_help
    exit 1
fi

if [ "$COMMAND" != "help" ] && ([ -z "$RESOURCE_GROUP" ] || [ -z "$APP_NAME" ]); then
    print_error "Resource group and app name are required"
    show_help
    exit 1
fi

# Main execution
case $COMMAND in
    deploy)
        check_azure_cli
        check_azure_login
        set_subscription
        create_resource_group
        deploy_arm_template
        deploy_app
        show_status
        ;;
    app-only)
        check_azure_cli
        check_azure_login
        set_subscription
        deploy_app
        show_status
        ;;
    status)
        check_azure_cli
        check_azure_login
        set_subscription
        show_status
        ;;
    logs)
        check_azure_cli
        check_azure_login
        set_subscription
        show_logs
        ;;
    cleanup)
        check_azure_cli
        check_azure_login
        set_subscription
        cleanup
        ;;
    help)
        show_help
        ;;
    *)
        print_error "Unknown command: $COMMAND"
        show_help
        exit 1
        ;;
esac