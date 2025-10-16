#!/usr/bin/env python3
"""
Script to transform docker-compose.dev.yml by:
1. Replacing build.context sections with ghcr.io image references
2. Changing frontend command from npm run dev to npm run prod
3. Updating dd-agent image to use DD_AGENT_VERSION variable
4. Removing comments
5. Changing "development" to "production"
"""

import sys
import os
import re
from typing import List

# Configuration
SERVICE_TO_IMAGE_MAP = {
    'frontend': 'ghcr.io/datadog/storedog/frontend:${STOREDOG_IMAGE_VERSION:-latest}',
    'backend': 'ghcr.io/datadog/storedog/backend:${STOREDOG_IMAGE_VERSION:-latest}',
    'worker': 'ghcr.io/datadog/storedog/backend:${STOREDOG_IMAGE_VERSION:-latest}',  # worker uses same image as backend
    'discounts': 'ghcr.io/datadog/storedog/discounts:${STOREDOG_IMAGE_VERSION:-latest}',
    'ads': 'ghcr.io/datadog/storedog/ads-java:${STOREDOG_IMAGE_VERSION:-latest}',
    'service-proxy': 'ghcr.io/datadog/storedog/nginx:${STOREDOG_IMAGE_VERSION:-latest}',
    'postgres': 'ghcr.io/datadog/storedog/postgres:${STOREDOG_IMAGE_VERSION:-latest}',
    'puppeteer': 'ghcr.io/datadog/storedog/puppeteer:${STOREDOG_IMAGE_VERSION:-latest}'
}

class ComposeTransformer:
    """Handles transformation of Docker Compose files."""
    
    def __init__(self, content: str):
        self.content = content
        self.transformations_applied = []
    
    def apply_regex_transformation(self, pattern: str, replacement: str, description: str, flags: int = re.MULTILINE) -> 'ComposeTransformer':
        """Apply a regex transformation and track what was changed."""
        if re.search(pattern, self.content, flags=flags):
            self.content = re.sub(pattern, replacement, self.content, flags=flags)
            self.transformations_applied.append(description)
        return self
    
    def replace_build_sections(self) -> 'ComposeTransformer':
        """Replace build sections with image sections for all configured services."""
        for service_name, image_name in SERVICE_TO_IMAGE_MAP.items():
            pattern = rf'(\s+{re.escape(service_name)}:\s*\n(?:.*\n)*?)\s+build:\s*\n\s+context:\s+[^\n]+\n'
            replacement = rf'\1    image: {image_name}\n'
            
            if re.search(pattern, self.content, flags=re.MULTILINE):
                self.content = re.sub(pattern, replacement, self.content, flags=re.MULTILINE)
                self.transformations_applied.append(f"Transformed {service_name}: replaced build with image")
        
        return self
    
    def update_frontend_command(self) -> 'ComposeTransformer':
        """Update frontend command from npm run dev to npm run prod."""
        pattern = r'(\s+frontend:\s*\n(?:.*\n)*?\s+command:\s+)\${FRONTEND_COMMAND:-npm run dev}'
        replacement = r'\1${FRONTEND_COMMAND:-npm run prod}'
        return self.apply_regex_transformation(
            pattern, replacement, "Updated frontend command to use npm run prod"
        )
    
    def update_dd_agent_image(self) -> 'ComposeTransformer':
        """Update dd-agent image to use DD_AGENT_VERSION variable."""
        pattern = r'(\s+dd-agent:\s*\n\s+image:\s+)gcr\.io/datadoghq/agent:[^\n]+'
        replacement = r'\1gcr.io/datadoghq/agent:${DD_AGENT_VERSION:-latest}'
        return self.apply_regex_transformation(
            pattern, replacement, "Updated dd-agent image to use DD_AGENT_VERSION variable"
        )
    
    def remove_header_comments(self) -> 'ComposeTransformer':
        """Remove header comments at the top of the file."""
        pattern = r'^# [^\n]*\n# [^\n]*\n'
        replacement = ''
        return self.apply_regex_transformation(
            pattern, replacement, "Removed header comments"
        )
    
    def remove_service_comments(self) -> 'ComposeTransformer':
        """Remove comments that appear directly before service definitions."""
        pattern = r'\n\s*# [^\n]*\n(\s+[a-zA-Z0-9_-]+:\s*\n)'
        matches = re.findall(pattern, self.content, flags=re.MULTILINE)
        if matches:
            self.content = re.sub(pattern, r'\n\1', self.content, flags=re.MULTILINE)
            self.transformations_applied.append(f"Removed {len(matches)} service section comments")
        return self
    
    def change_development_to_production(self) -> 'ComposeTransformer':
        """Change all instances of 'development' to 'production'."""
        development_matches = len(re.findall(r'development', self.content))
        if development_matches > 0:
            self.content = re.sub(r'development', 'production', self.content)
            self.transformations_applied.append(f"Changed {development_matches} instances of 'development' to 'production'")
        return self
    
    def remove_development_volumes(self) -> 'ComposeTransformer':
        """Remove development volume mounts from services (but keep essential volumes)."""
        # Remove volumes sections from specific services, but preserve dd-agent and redis volumes
        patterns_to_remove = [
            # Frontend volumes (already handled by previous method name, but keeping for completeness)
            r'(\s+frontend:\s*\n(?:.*\n)*?)\s+volumes:\s*\n(?:\s+-[^\n]*\n)+(?=\s+[a-zA-Z0-9_-]+:)',
            # Backend volumes  
            r'(\s+backend:\s*\n(?:.*\n)*?)\s+volumes:\s*\n(?:\s+-[^\n]*\n)+(?=\s+[a-zA-Z0-9_-]+:)',
            # Worker volumes
            r'(\s+worker:\s*\n(?:.*\n)*?)\s+volumes:\s*\n(?:\s+-[^\n]*\n)+(?=\s+[a-zA-Z0-9_-]+:)',
            # Discounts volumes
            r'(\s+discounts:\s*\n(?:.*\n)*?)\s+volumes:\s*\n(?:\s+-[^\n]*\n)+(?=\s+[a-zA-Z0-9_-]+:)',
            # Puppeteer volumes
            r'(\s+puppeteer:\s*\n(?:.*\n)*?)\s+volumes:\s*\n(?:\s+-[^\n]*\n)+(?=\s+[a-zA-Z0-9_-]+:|^volumes:)'
        ]
        
        removed_count = 0
        for pattern in patterns_to_remove:
            if re.search(pattern, self.content, flags=re.MULTILINE):
                self.content = re.sub(pattern, r'\1', self.content, flags=re.MULTILINE)
                removed_count += 1
        
        if removed_count > 0:
            self.transformations_applied.append(f"Removed development volumes from {removed_count} services")
        return self
    
    def get_content(self) -> str:
        """Get the transformed content."""
        return self.content
    
    def get_transformations(self) -> List[str]:
        """Get list of transformations that were applied."""
        return self.transformations_applied

def transform_compose_file(input_file: str, output_file: str = None) -> bool:
    """
    Transform docker-compose.dev.yml file by making only the specified changes
    and preserving all other formatting and structure.
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
    
    # Apply all transformations using the transformer class
    transformer = (ComposeTransformer(content)
                   .replace_build_sections()
                   .update_frontend_command()
                   .update_dd_agent_image()
                   .remove_header_comments()
                   .remove_service_comments()
                   .change_development_to_production()
                   .remove_development_volumes())
    
    # Print what was transformed
    for transformation in transformer.get_transformations():
        print(transformation)
    
    # Determine output file
    if output_file is None:
        output_file = input_file.replace('.yml', '.prod.yml')
    
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