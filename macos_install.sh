#! /bin/bash

# Homebrew:
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
eval "$(/opt/homebrew/bin/brew shellenv)"

# Node dependency for Prisma and Next.js:
brew install node

# Git:
brew install git

# Install Project Dependencies:
npm install

# Generate TypeScript types from schema.prisma:
npx prisma generate
