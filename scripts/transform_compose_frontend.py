#!/usr/bin/env python3
"""
Script to transform docker-compose.dev.yml by modifying only the frontend service:
1. Remove volumes from frontend service
2. Change frontend build target from development to production
"""

import sys
import os
import re
from typing import List

class FrontendComposeTransformer:
    """Handles transformation of Docker Compose files for frontend service only."""
    
    def __init__(self, content: str):
        self.content = content
        self.transformations_applied = []
    
    def apply_regex_transformation(self, pattern: str, replacement: str, description: str, flags: int = re.MULTILINE) -> 'FrontendComposeTransformer':
        """Apply a regex transformation and track what was changed."""
        if re.search(pattern, self.content, flags=flags):
            self.content = re.sub(pattern, replacement, self.content, flags=flags)
            self.transformations_applied.append(description)
        return self
    
    def remove_frontend_volumes(self) -> 'FrontendComposeTransformer':
        """Remove volumes section from frontend service only."""
        # Pattern to match frontend service volumes section
        pattern = r'(\s+frontend:\s*\n(?:.*\n)*?)\s+volumes:\s*\n(?:\s+-[^\n]*\n)+(\s+(?:[a-zA-Z0-9_-]+:|$))'
        replacement = r'\1\2'
        
        return self.apply_regex_transformation(
            pattern, replacement, "Removed volumes from frontend service"
        )
    
    def change_frontend_target_to_production(self) -> 'FrontendComposeTransformer':
        """Change frontend build target from development to production."""
        # Pattern to match frontend service build target that is NOT already production
        pattern = r'(\s+frontend:\s*\n(?:.*\n)*?\s+build:\s*\n(?:.*\n)*?\s+target:\s+)(?!production\b)(\S+)'
        replacement = r'\1production'
        
        return self.apply_regex_transformation(
            pattern, replacement, "Changed frontend build target to production"
        )
    
    def get_content(self) -> str:
        """Get the transformed content."""
        return self.content
    
    def get_transformations(self) -> List[str]:
        """Get list of transformations that were applied."""
        return self.transformations_applied

def transform_compose_file(input_file: str, output_file: str = None) -> bool:
    """
    Transform docker-compose.dev.yml file by modifying only the frontend service
    to remove volumes and change target to production.
    """
    
    # Read the input file
    try:
        with open(input_file, 'r') as f:
            content = f.read()
    except FileNotFoundError:
        print(f"Error: Input file '{input_file}' not found!")
        return False
    except Exception as e:
        print(f"Error reading file: {e}")
        return False
    
    # Apply frontend-specific transformations
    transformer = (FrontendComposeTransformer(content)
                   .remove_frontend_volumes()
                   .change_frontend_target_to_production())
    
    # Print what was transformed
    transformations = transformer.get_transformations()
    if transformations:
        for transformation in transformations:
            print(transformation)
    else:
        print("No transformations were applied - frontend service may already be configured correctly")
    
    # Determine output file
    if output_file is None:
        output_file = input_file.replace('.yml', '.frontend-prod.yml')
    
    # Write the transformed content
    try:
        with open(output_file, 'w') as f:
            f.write(transformer.get_content())
        print(f"Transformation complete! Output written to: {output_file}")
        
        return True
    except Exception as e:
        print(f"Error writing file: {e}")
        return False

def main() -> int:
    """Main function to handle command line arguments and execute transformation."""
    
    # Default input file
    input_file = "docker-compose.dev.yml"
    output_file = None
    
    # Parse command line arguments
    if len(sys.argv) > 1:
        input_file = sys.argv[1]
    if len(sys.argv) > 2:
        output_file = sys.argv[2]
    
    # Check if input file exists
    if not os.path.exists(input_file):
        print(f"Error: Input file '{input_file}' not found!")
        print(f"Usage: {sys.argv[0]} [input_file] [output_file]")
        return 1
    
    # Perform transformation
    success = transform_compose_file(input_file, output_file)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
