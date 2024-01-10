#!/bin/bash

# Get a list of all directories containing package.json
directories=$(find . -name "package.json" -exec dirname {} \;)

# Iterate over each directory and run npm install
for dir in $directories; do
    echo "Installing dependencies in $dir..."
    (cd "$dir" && npm install)
done
