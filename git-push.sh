#!/bin/bash

# Define color variables
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Prompt for a commit message
echo -e "${BLUE}Enter commit message:${NC}"
read commit_message

# Add all changes
echo -e "${YELLOW}Adding changes...${NC}"
git add .

# Commit with the user-provided message
echo -e "${YELLOW}Committing changes...${NC}"
git commit -m "$commit_message"

# Push to GitHub
echo -e "${YELLOW}Pushing to GitHub...${NC}"
git push

# Push to Heroku
echo -e "${YELLOW}Pushing to Heroku...${NC}"
git push heroku main

# Confirmation message
echo -e "${GREEN}Changes pushed to GitHub and Heroku successfully!${NC}"
