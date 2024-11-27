#!/bin/bash

# Prompt for a commit message
read -p "Enter commit message: " commit_message

# Add all changes
echo "Adding changes..."
git add .

# Commit with the user-provided message
echo "Committing changes..."
git commit -m "$commit_message"

# Push to GitHub
echo "Pushing to GitHub..."
git push

# Push to Heroku
echo "Pushing to Heroku..."
git push heroku main

# Confirmation message
echo "Changes pushed to GitHub and Heroku successfully!"
