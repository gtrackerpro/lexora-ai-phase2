#!/bin/bash

# Wav2Lip Service Runner Script
# This script builds and runs the Wav2Lip Docker container

set -e

# Configuration
IMAGE_NAME="lexora-wav2lip"
CONTAINER_NAME="lexora-wav2lip-service"
PORT=5001
NETWORK="lexora-network"

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

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to create Docker network if it doesn't exist
create_network() {
    if ! docker network ls | grep -q "$NETWORK"; then
        print_status "Creating Docker network: $NETWORK"
        docker network create "$NETWORK"
        print_success "Network created: $NETWORK"
    else
        print_status "Network already exists: $NETWORK"
    fi
}

# Function to stop and remove existing container
cleanup_container() {
    if docker ps -a | grep -q "$CONTAINER_NAME"; then
        print_status "Stopping and removing existing container: $CONTAINER_NAME"
        docker stop "$CONTAINER_NAME" > /dev/null 2>&1 || true
        docker rm "$CONTAINER_NAME" > /dev/null 2>&1 || true
        print_success "Container cleaned up: $CONTAINER_NAME"
    fi
}

# Function to build Docker image
build_image() {
    print_status "Building Docker image: $IMAGE_NAME"
    docker build -t "$IMAGE_NAME" .
    print_success "Image built successfully: $IMAGE_NAME"
}

# Function to run Docker container
run_container() {
    print_status "Starting container: $CONTAINER_NAME"
    
    docker run -d \
        --name "$CONTAINER_NAME" \
        --network "$NETWORK" \
        -p "$PORT:$PORT" \
        -v "$(pwd)/models:/app/models:ro" \
        -v "/tmp/wav2lip:/tmp/wav2lip" \
        -e "PORT=$PORT" \
        -e "PYTHONUNBUFFERED=1" \
        --restart unless-stopped \
        "$IMAGE_NAME"
    
    print_success "Container started: $CONTAINER_NAME"
    print_status "Service available at: http://localhost:$PORT"
}

# Function to show container logs
show_logs() {
    print_status "Showing container logs (press Ctrl+C to exit):"
    docker logs -f "$CONTAINER_NAME"
}

# Function to check service health
check_health() {
    print_status "Checking service health..."
    
    # Wait for service to start
    sleep 5
    
    if curl -f "http://localhost:$PORT/health" > /dev/null 2>&1; then
        print_success "Service is healthy and responding"
        curl -s "http://localhost:$PORT/health" | python -m json.tool
    else
        print_warning "Service health check failed. Check logs for details."
        return 1
    fi
}

# Function to download Wav2Lip models (placeholder)
download_models() {
    print_status "Checking for Wav2Lip models..."
    
    MODELS_DIR="$(pwd)/models"
    mkdir -p "$MODELS_DIR"
    
    if [ ! -f "$MODELS_DIR/wav2lip_gan.pth" ]; then
        print_warning "Wav2Lip model not found. Please download the model manually:"
        echo "  1. Download wav2lip_gan.pth from the official Wav2Lip repository"
        echo "  2. Place it in: $MODELS_DIR/wav2lip_gan.pth"
        echo "  3. Model URL: https://github.com/Rudrabha/Wav2Lip"
    else
        print_success "Wav2Lip model found: $MODELS_DIR/wav2lip_gan.pth"
    fi
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  build     Build the Docker image"
    echo "  run       Run the container (builds if needed)"
    echo "  stop      Stop the container"
    echo "  restart   Restart the container"
    echo "  logs      Show container logs"
    echo "  health    Check service health"
    echo "  clean     Remove container and image"
    echo "  models    Check/download models"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 run      # Build and run the service"
    echo "  $0 logs     # View service logs"
    echo "  $0 health   # Check if service is running"
}

# Main script logic
case "${1:-run}" in
    "build")
        check_docker
        download_models
        build_image
        ;;
    
    "run")
        check_docker
        download_models
        create_network
        cleanup_container
        build_image
        run_container
        sleep 3
        check_health
        ;;
    
    "stop")
        check_docker
        print_status "Stopping container: $CONTAINER_NAME"
        docker stop "$CONTAINER_NAME" > /dev/null 2>&1 || true
        print_success "Container stopped: $CONTAINER_NAME"
        ;;
    
    "restart")
        check_docker
        cleanup_container
        run_container
        sleep 3
        check_health
        ;;
    
    "logs")
        check_docker
        show_logs
        ;;
    
    "health")
        check_health
        ;;
    
    "clean")
        check_docker
        print_status "Cleaning up container and image..."
        docker stop "$CONTAINER_NAME" > /dev/null 2>&1 || true
        docker rm "$CONTAINER_NAME" > /dev/null 2>&1 || true
        docker rmi "$IMAGE_NAME" > /dev/null 2>&1 || true
        print_success "Cleanup completed"
        ;;
    
    "models")
        download_models
        ;;
    
    "help"|"-h"|"--help")
        show_usage
        ;;
    
    *)
        print_error "Unknown command: $1"
        show_usage
        exit 1
        ;;
esac