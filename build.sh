#!/bin/bash
# Build the rule engine bundle for browser use
# Run this after editing any rule file or schoolRuleMap.js
npx esbuild rules/bundle-entry.js --bundle --outfile=rules-bundle.js --format=iife --global-name=RuleEngine
echo "✅ rules-bundle.js built successfully"
