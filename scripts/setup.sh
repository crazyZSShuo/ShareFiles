#!/bin/bash

# ShareFilesCF Setup Script
# This script helps set up the initial Cloudflare resources

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

# Check if wrangler is installed and authenticated
check_wrangler() {
    print_status "Checking Wrangler CLI..."
    
    if ! command -v wrangler &> /dev/null; then
        print_error "Wrangler CLI is not installed. Please run: npm install -g wrangler"
        exit 1
    fi
    
    # Check if authenticated
    if ! wrangler whoami &> /dev/null; then
        print_error "Wrangler is not authenticated. Please run: wrangler login"
        exit 1
    fi
    
    print_success "Wrangler CLI is ready"
}

# Create D1 database
create_database() {
    print_status "Creating D1 database..."
    
    cd backend
    
    # Create the database
    DB_OUTPUT=$(wrangler d1 create sharefiles-db 2>&1)
    
    if echo "$DB_OUTPUT" | grep -q "already exists"; then
        print_warning "Database 'sharefiles-db' already exists"
        # Extract database ID from existing database
        DB_ID=$(wrangler d1 list | grep sharefiles-db | awk '{print $2}')
    else
        # Extract database ID from creation output
        DB_ID=$(echo "$DB_OUTPUT" | grep -o 'database_id = "[^"]*"' | cut -d'"' -f2)
    fi
    
    if [ -z "$DB_ID" ]; then
        print_error "Failed to get database ID"
        exit 1
    fi
    
    print_success "Database created/found with ID: $DB_ID"
    
    # Update wrangler.toml with the database ID
    if [ -f "wrangler.toml" ]; then
        # Use sed to replace the database_id
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s/database_id = \".*\"/database_id = \"$DB_ID\"/" wrangler.toml
        else
            # Linux
            sed -i "s/database_id = \".*\"/database_id = \"$DB_ID\"/" wrangler.toml
        fi
        print_success "Updated wrangler.toml with database ID"
    else
        print_error "wrangler.toml not found"
        exit 1
    fi
    
    cd ..
}

# Create R2 bucket
create_r2_bucket() {
    print_status "Creating R2 bucket..."
    
    cd backend
    
    # Create the bucket
    BUCKET_OUTPUT=$(wrangler r2 bucket create sharefiles-storage 2>&1)
    
    if echo "$BUCKET_OUTPUT" | grep -q "already exists"; then
        print_warning "R2 bucket 'sharefiles-storage' already exists"
    else
        print_success "R2 bucket 'sharefiles-storage' created"
    fi
    
    cd ..
}

# Create KV namespace
create_kv_namespace() {
    print_status "Creating KV namespace for rate limiting..."
    
    cd backend
    
    # Create KV namespace
    KV_OUTPUT=$(wrangler kv:namespace create "RATE_LIMITER" 2>&1)
    
    if echo "$KV_OUTPUT" | grep -q "already exists"; then
        print_warning "KV namespace 'RATE_LIMITER' already exists"
        # Get existing namespace ID
        KV_ID=$(wrangler kv:namespace list | grep RATE_LIMITER | awk '{print $2}')
    else
        # Extract namespace ID from creation output
        KV_ID=$(echo "$KV_OUTPUT" | grep -o 'id = "[^"]*"' | cut -d'"' -f2)
    fi
    
    if [ -z "$KV_ID" ]; then
        print_warning "Could not get KV namespace ID. You may need to update wrangler.toml manually."
    else
        print_success "KV namespace created/found with ID: $KV_ID"
        
        # Update wrangler.toml with the KV namespace ID
        if [ -f "wrangler.toml" ]; then
            if [[ "$OSTYPE" == "darwin"* ]]; then
                # macOS
                sed -i '' "s/id = \"your-kv-namespace-id\"/id = \"$KV_ID\"/" wrangler.toml
            else
                # Linux
                sed -i "s/id = \"your-kv-namespace-id\"/id = \"$KV_ID\"/" wrangler.toml
            fi
            print_success "Updated wrangler.toml with KV namespace ID"
        fi
    fi
    
    cd ..
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    cd backend
    
    # Run migrations
    wrangler d1 migrations apply sharefiles-db
    
    print_success "Database migrations completed"
    
    cd ..
}

# Configure environment variables
configure_environment() {
    print_status "Configuring environment variables..."
    
    # Get user input for CORS origin
    echo ""
    print_status "Please enter your frontend domain (e.g., https://sharefiles.pages.dev):"
    read -r CORS_ORIGIN
    
    if [ -z "$CORS_ORIGIN" ]; then
        CORS_ORIGIN="*"
        print_warning "No CORS origin provided, using '*' (not recommended for production)"
    fi
    
    cd backend
    
    # Update wrangler.toml with CORS origin
    if [ -f "wrangler.toml" ]; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s|CORS_ORIGIN = \".*\"|CORS_ORIGIN = \"$CORS_ORIGIN\"|" wrangler.toml
        else
            # Linux
            sed -i "s|CORS_ORIGIN = \".*\"|CORS_ORIGIN = \"$CORS_ORIGIN\"|" wrangler.toml
        fi
        print_success "Updated CORS_ORIGIN in wrangler.toml"
    fi
    
    cd ..
}

# Main setup function
main() {
    print_status "Starting ShareFilesCF setup..."
    
    # Parse command line arguments
    SKIP_DB=false
    SKIP_R2=false
    SKIP_KV=false
    SKIP_MIGRATIONS=false
    SKIP_ENV=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-db)
                SKIP_DB=true
                shift
                ;;
            --skip-r2)
                SKIP_R2=true
                shift
                ;;
            --skip-kv)
                SKIP_KV=true
                shift
                ;;
            --skip-migrations)
                SKIP_MIGRATIONS=true
                shift
                ;;
            --skip-env)
                SKIP_ENV=true
                shift
                ;;
            --help)
                echo "ShareFilesCF Setup Script"
                echo ""
                echo "Usage: $0 [options]"
                echo ""
                echo "Options:"
                echo "  --skip-db          Skip D1 database creation"
                echo "  --skip-r2          Skip R2 bucket creation"
                echo "  --skip-kv          Skip KV namespace creation"
                echo "  --skip-migrations  Skip database migrations"
                echo "  --skip-env         Skip environment configuration"
                echo "  --help             Show this help message"
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
    
    # Check wrangler
    check_wrangler
    
    # Create resources
    if [ "$SKIP_DB" = false ]; then
        create_database
    fi
    
    if [ "$SKIP_R2" = false ]; then
        create_r2_bucket
    fi
    
    if [ "$SKIP_KV" = false ]; then
        create_kv_namespace
    fi
    
    if [ "$SKIP_MIGRATIONS" = false ]; then
        run_migrations
    fi
    
    if [ "$SKIP_ENV" = false ]; then
        configure_environment
    fi
    
    print_success "Setup completed successfully!"
    
    echo ""
    print_status "Next steps:"
    print_status "1. Review and update backend/wrangler.toml if needed"
    print_status "2. Update frontend/next.config.js with your Workers URL"
    print_status "3. Run './scripts/deploy.sh' to deploy your application"
    echo ""
}

# Run main function with all arguments
main "$@"
