#!/bin/bash
# Simple setup script for development

echo "Installing dependencies..."
npm install

if [ ! -f .env ]; then
  echo "Setting up .env from example..."
  cp .env.example .env
fi

echo "You're ready to go. Run: npm start"
