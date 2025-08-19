#!/bin/bash

# ShareFilesCF Deployment Script
# This script automates the deployment process for both frontend and backend

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_requirements() {
    print_status "Checking requirements..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18 or higher."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
    
    if ! command -v wrangler &> /dev/null; then
        print_error "Wrangler CLI is not installed. Please run: npm install -g wrangler"
        exit 1
    fi
    
    print_success "All requirements satisfied"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Root dependencies
    npm install
    
    # Frontend dependencies
    cd frontend
    npm install
    cd ..
    
    # Backend dependencies
    cd backend
    npm install
    cd ..
    
    print_success "Dependencies installed"
}

# Deploy backend
deploy_backend() {
    print_status "Deploying backend to Cloudflare Workers..."
    
    cd backend
    
    # Check if wrangler.toml exists and is configured
    if [ ! -f "wrangler.toml" ]; then
        print_error "wrangler.toml not found in backend directory"
        exit 1
    fi
    
    # Build TypeScript
    npm run build
    
    # Deploy to Cloudflare Workers
    npm run deploy
    
    cd ..
    
    print_success "Backend deployed successfully"
}

# Deploy frontend
deploy_frontend() {
    print_status "Deploying frontend to Cloudflare Pages..."
    
    cd frontend
    
    # Build the frontend
    npm run build
    
    # Deploy using @cloudflare/next-on-pages
    npm run deploy
    
    cd ..
    
    print_success "Frontend deployed successfully"
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    cd backend
    
    # Run database migrations
    print_status "Running database migrations..."
    npm run db:migrate
    
    cd ..
    
    print_success "Database setup completed"
}

# Main deployment function
main() {
    print_status "Starting ShareFilesCF deployment..."
    
    # Parse command line arguments
    DEPLOY_BACKEND=true
    DEPLOY_FRONTEND=true
    SETUP_DB=false
    INSTALL_DEPS=true
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --backend-only)
                DEPLOY_FRONTEND=false
                shift
                ;;
            --frontend-only)
                DEPLOY_BACKEND=false
                shift
                ;;
            --setup-db)
                SETUP_DB=true
                shift
                ;;
            --skip-deps)
                INSTALL_DEPS=false
                shift
                ;;
            --help)
                echo "ShareFilesCF Deployment Script"
                echo ""
                echo "Usage: $0 [options]"
                echo ""
                echo "Options:"
                echo "  --backend-only    Deploy only the backend"
                echo "  --frontend-only   Deploy only the frontend"
                echo "  --setup-db        Run database migrations"
                echo "  --skip-deps       Skip dependency installation"
                echo "  --help            Show this help message"
                echo ""
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                echo "Use --help for usage information"
                exit 1
                ;;
        esac
    done
    
    # Check requirements
    check_requirements
    
    # Install dependencies
    if [ "$INSTALL_DEPS" = true ]; then
        install_dependencies
    fi
    
    # Setup database if requested
    if [ "$SETUP_DB" = true ]; then
        setup_database
    fi
    
    # Deploy backend
    if [ "$DEPLOY_BACKEND" = true ]; then
        deploy_backend
    fi
    
    # Deploy frontend
    if [ "$DEPLOY_FRONTEND" = true ]; then
        deploy_frontend
    fi
    
    print_success "Deployment completed successfully!"
    
    if [ "$DEPLOY_BACKEND" = true ] && [ "$DEPLOY_FRONTEND" = true ]; then
        print_status "Your application should now be available at:"
        print_status "Frontend: Check your Cloudflare Pages dashboard for the URL"
        print_status "Backend: Check your Cloudflare Workers dashboard for the URL"
        print_warning "Don't forget to update the CORS_ORIGIN environment variable in your Workers settings"
    fi
}

# Run main function with all arguments
main "$@"
