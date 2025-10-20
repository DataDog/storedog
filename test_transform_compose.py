#!/usr/bin/env python3
"""
Unit tests for transform_compose.py

Run with: python3 -m pytest test_transform_compose.py -v
Or: python3 test_transform_compose.py
"""

import unittest
import tempfile
import os
from transform_compose import ComposeTransformer, transform_compose_file, SERVICE_TO_IMAGE_MAP


class TestComposeTransformer(unittest.TestCase):
    """Test cases for the ComposeTransformer class."""
    
    def setUp(self):
        """Set up test fixtures before each test method."""
        self.sample_compose_content = """# Storedog Development Environment
# This docker-compose file sets up a complete development environment for the Storedog application.
services:
  # Datadog Agent for monitoring and observability
  dd-agent:
    image: gcr.io/datadoghq/agent:latest
    pid: host
    environment:
      - DD_API_KEY=${DD_API_KEY}
      - DD_ENV=${DD_ENV:-development}
      - DD_HOSTNAME=${DD_HOSTNAME-development-host}

  # Frontend service (Next.js)
  frontend:
    build:
      context: ./services/frontend
      dockerfile: Dockerfile
      target: ${FRONTEND_BUILD_TARGET:-development}
      args: 
        DD_ENV: ${DD_ENV:-development}
        DD_VERSION: ${DD_VERSION_FRONTEND:-1.0.0}
        DD_SERVICE: ${DD_SERVICE_FRONTEND:-store-frontend}
        DD_SITE: ${DD_SITE:-datadoghq.com}
        NEXT_PUBLIC_DD_APPLICATION_ID: ${NEXT_PUBLIC_DD_APPLICATION_ID:-not-set-in-docker-compose}
        NEXT_PUBLIC_DD_CLIENT_TOKEN: ${NEXT_PUBLIC_DD_CLIENT_TOKEN:-not-set-in-docker-compose}
    command: ${FRONTEND_COMMAND:-npm run dev}
    depends_on:
      dd-agent:
        condition: service_started
    environment:
      - DD_ENV=${DD_ENV:-development}
      - DD_SERVICE=store-frontend

  # Backend service (Ruby on Rails/Spree)
  backend:
    build:
      context: ./services/backend
    command: /bin/bash -c "rm -f /app/tmp/pids/server.pid && bundle exec ddprofrb exec rails s -b 0.0.0.0 -p 4000"
    environment:
      - DD_ENV=${DD_ENV:-development}
      - DD_SERVICE=store-backend

  # Background job processor (Sidekiq)
  worker:
    build:
      context: ./services/backend
    command: bundle exec ddprofrb exec sidekiq -C config/sidekiq.yml
    environment:
      - DD_ENV=${DD_ENV:-development}
      - DD_SERVICE=store-worker

volumes:
  redis:
  postgres_logs:

networks:
  storedog-network:
"""
    
    def test_replace_build_sections(self):
        """Test that build sections are correctly replaced with image sections."""
        transformer = ComposeTransformer(self.sample_compose_content)
        result = transformer.replace_build_sections()
        
        content = result.get_content()
        transformations = result.get_transformations()
        
        # Check that build sections are removed
        self.assertNotIn('build:', content)
        self.assertNotIn('context:', content)
        self.assertNotIn('dockerfile:', content)
        self.assertNotIn('target:', content)
        self.assertNotIn('args:', content)
        
        # Check that image sections are added
        self.assertIn('image: ghcr.io/datadog/storedog/frontend:${STOREDOG_IMAGE_VERSION:-latest}', content)
        self.assertIn('image: ghcr.io/datadog/storedog/backend:${STOREDOG_IMAGE_VERSION:-latest}', content)
        
        # Check transformations were tracked
        self.assertIn('Transformed frontend: replaced build with image', transformations)
        self.assertIn('Transformed backend: replaced build with image', transformations)
        self.assertIn('Transformed worker: replaced build with image', transformations)
    
    def test_update_frontend_command(self):
        """Test that frontend command is updated from dev to prod."""
        transformer = ComposeTransformer(self.sample_compose_content)
        result = transformer.update_frontend_command()
        
        content = result.get_content()
        transformations = result.get_transformations()
        
        # Check that command was updated
        self.assertNotIn('${FRONTEND_COMMAND:-npm run dev}', content)
        self.assertIn('${FRONTEND_COMMAND:-npm run prod}', content)
        
        # Check transformation was tracked
        self.assertIn('Updated frontend command to use npm run prod', transformations)
    
    def test_update_dd_agent_image(self):
        """Test that dd-agent image is updated to use DD_AGENT_VERSION variable."""
        transformer = ComposeTransformer(self.sample_compose_content)
        result = transformer.update_dd_agent_image()
        
        content = result.get_content()
        transformations = result.get_transformations()
        
        # Check that image was updated
        self.assertNotIn('gcr.io/datadoghq/agent:latest', content)
        self.assertIn('gcr.io/datadoghq/agent:${DD_AGENT_VERSION:-latest}', content)
        
        # Check transformation was tracked
        self.assertIn('Updated dd-agent image to use DD_AGENT_VERSION variable', transformations)
    
    def test_remove_header_comments(self):
        """Test that header comments are removed."""
        transformer = ComposeTransformer(self.sample_compose_content)
        result = transformer.remove_header_comments()
        
        content = result.get_content()
        transformations = result.get_transformations()
        
        # Check that header comments are removed
        self.assertNotIn('# Storedog Development Environment', content)
        self.assertNotIn('# This docker-compose file sets up', content)
        
        # Content should start with services:
        self.assertTrue(content.strip().startswith('services:'))
        
        # Check transformation was tracked
        self.assertIn('Removed header comments', transformations)
    
    def test_remove_service_comments(self):
        """Test that service section comments are removed."""
        transformer = ComposeTransformer(self.sample_compose_content)
        result = transformer.remove_service_comments()
        
        content = result.get_content()
        transformations = result.get_transformations()
        
        # Check that service comments are removed
        self.assertNotIn('# Datadog Agent for monitoring', content)
        self.assertNotIn('# Frontend service (Next.js)', content)
        self.assertNotIn('# Backend service (Ruby on Rails/Spree)', content)
        self.assertNotIn('# Background job processor (Sidekiq)', content)
        
        # Check transformation was tracked
        self.assertTrue(any('service section comments' in t for t in transformations))
    
    def test_change_development_to_production(self):
        """Test that development is changed to production."""
        transformer = ComposeTransformer(self.sample_compose_content)
        result = transformer.change_development_to_production()
        
        content = result.get_content()
        transformations = result.get_transformations()
        
        # Check that development is replaced with production
        self.assertNotIn('development', content)
        self.assertIn('production', content)
        self.assertIn('DD_ENV=${DD_ENV:-production}', content)
        self.assertIn('DD_HOSTNAME=${DD_HOSTNAME-production-host}', content)
        
        # Check transformation was tracked
        self.assertTrue(any('development\' to \'production' in t for t in transformations))
    
    def test_remove_development_volumes(self):
        """Test that development volumes are removed from multiple services."""
        # Create content with volumes to test removal
        content_with_volumes = """services:
  frontend:
    build:
      context: ./services/frontend
    volumes:
      - ./services/frontend:/app
      - /app/node_modules
    networks:
      - storedog-network
  backend:
    build:
      context: ./services/backend
    volumes:
      - ./services/backend:/app
    networks:
      - storedog-network
"""
        transformer = ComposeTransformer(content_with_volumes)
        result = transformer.remove_development_volumes()
        
        content = result.get_content()
        transformations = result.get_transformations()
        
        # Check that volumes sections are removed from development services
        self.assertNotIn('volumes:', content)
        
        # Check transformation was tracked (if volumes were found and removed)
        if transformations:
            self.assertTrue(any('development volumes' in t for t in transformations))
    
    def test_method_chaining(self):
        """Test that methods can be chained together."""
        transformer = ComposeTransformer(self.sample_compose_content)
        result = (transformer
                  .replace_build_sections()
                  .update_frontend_command()
                  .update_dd_agent_image()
                  .remove_header_comments()
                  .remove_service_comments()
                  .change_development_to_production()
                  .remove_development_volumes())
        
        content = result.get_content()
        transformations = result.get_transformations()
        
        # Check that all transformations were applied
        self.assertNotIn('build:', content)
        self.assertNotIn('target:', content)
        self.assertNotIn('args:', content)
        self.assertIn('image: ghcr.io/datadog/storedog/frontend:${STOREDOG_IMAGE_VERSION:-latest}', content)
        self.assertIn('${FRONTEND_COMMAND:-npm run prod}', content)
        self.assertIn('gcr.io/datadoghq/agent:${DD_AGENT_VERSION:-latest}', content)
        self.assertTrue(content.strip().startswith('services:'))
        self.assertNotIn('development', content)
        self.assertIn('production', content)
        
        # Check that multiple transformations were tracked
        self.assertGreater(len(transformations), 5)
    
    def test_no_transformations_when_patterns_not_found(self):
        """Test that no transformations are applied when patterns are not found."""
        simple_content = """services:
  redis:
    image: redis:6.2-alpine
"""
        transformer = ComposeTransformer(simple_content)
        result = (transformer
                  .replace_build_sections()
                  .update_frontend_command()
                  .update_dd_agent_image())
        
        transformations = result.get_transformations()
        
        # No transformations should be applied
        self.assertEqual(len(transformations), 0)
        
        # Content should remain unchanged
        self.assertEqual(result.get_content(), simple_content)


class TestTransformComposeFile(unittest.TestCase):
    """Test cases for the transform_compose_file function."""
    
    def setUp(self):
        """Set up test fixtures before each test method."""
        self.sample_content = """# Header comment
# Another header comment
services:
  frontend:
    build:
      context: ./services/frontend
      dockerfile: Dockerfile
      target: ${FRONTEND_BUILD_TARGET:-development}
      args: 
        DD_ENV: ${DD_ENV:-development}
        DD_VERSION: ${DD_VERSION_FRONTEND:-1.0.0}
    command: ${FRONTEND_COMMAND:-npm run dev}
  dd-agent:
    image: gcr.io/datadoghq/agent:latest
    environment:
      - DD_ENV=${DD_ENV:-development}
"""
    
    def test_transform_compose_file_success(self):
        """Test successful transformation of a compose file."""
        # Create temporary input file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.yml', delete=False) as f:
            f.write(self.sample_content)
            input_file = f.name
        
        # Create temporary output file
        with tempfile.NamedTemporaryFile(suffix='.yml', delete=False) as f:
            output_file = f.name
        
        try:
            # Transform the file
            result = transform_compose_file(input_file, output_file)
            self.assertTrue(result)
            
            # Check that output file was created and contains expected content
            self.assertTrue(os.path.exists(output_file))
            
            with open(output_file, 'r') as f:
                output_content = f.read()
            
            # Verify transformations
            self.assertIn('image: ghcr.io/datadog/storedog/frontend:${STOREDOG_IMAGE_VERSION:-latest}', output_content)
            self.assertIn('${FRONTEND_COMMAND:-npm run prod}', output_content)
            self.assertIn('gcr.io/datadoghq/agent:${DD_AGENT_VERSION:-latest}', output_content)
            self.assertNotIn('# Header comment', output_content)
            self.assertNotIn('development', output_content)
            self.assertIn('production', output_content)
            
        finally:
            # Clean up temporary files
            os.unlink(input_file)
            os.unlink(output_file)
    
    def test_transform_compose_file_nonexistent_input(self):
        """Test handling of nonexistent input file."""
        result = transform_compose_file('nonexistent_file.yml')
        self.assertFalse(result)
    
    def test_default_output_filename(self):
        """Test that default output filename is generated correctly."""
        # Create temporary input file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.yml', delete=False) as f:
            f.write(self.sample_content)
            input_file = f.name
        
        try:
            # Transform without specifying output file
            result = transform_compose_file(input_file)
            self.assertTrue(result)
            
            # Check that default output file was created
            expected_output = input_file.replace('.yml', '.prod.yml')
            self.assertTrue(os.path.exists(expected_output))
            
            # Clean up
            os.unlink(expected_output)
            
        finally:
            os.unlink(input_file)


class TestServiceToImageMap(unittest.TestCase):
    """Test cases for the SERVICE_TO_IMAGE_MAP configuration."""
    
    def test_service_to_image_map_completeness(self):
        """Test that all expected services are in the mapping."""
        expected_services = {
            'frontend', 'backend', 'worker', 'discounts', 
            'ads', 'service-proxy', 'postgres', 'puppeteer'
        }
        
        actual_services = set(SERVICE_TO_IMAGE_MAP.keys())
        self.assertEqual(expected_services, actual_services)
    
    def test_worker_uses_backend_image(self):
        """Test that worker service uses the same image as backend."""
        self.assertEqual(
            SERVICE_TO_IMAGE_MAP['worker'],
            SERVICE_TO_IMAGE_MAP['backend']
        )
    
    def test_all_images_use_storedog_image_version(self):
        """Test that all images use the STOREDOG_IMAGE_VERSION variable."""
        for service, image in SERVICE_TO_IMAGE_MAP.items():
            self.assertIn('${STOREDOG_IMAGE_VERSION:-latest}', image)
            self.assertIn('ghcr.io/datadog/storedog/', image)


if __name__ == '__main__':
    # Run the tests
    unittest.main(verbosity=2)
