#!/usr/bin/env python3
"""
Unit tests for transform_compose_frontend.py

Run with: python3 test_transform_compose_frontend.py
"""

import unittest
import tempfile
import os
from transform_compose_frontend import FrontendComposeTransformer, transform_compose_file


class TestFrontendTransformer(unittest.TestCase):
    """Test the frontend transformer functionality."""
    
    def test_removes_volumes_and_changes_target(self):
        """Test that volumes are removed and target is changed to production."""
        content = """services:
  frontend:
    build:
      context: ./services/frontend
      target: development
    volumes:
      - ./services/frontend:/app
      - /app/node_modules
    ports:
      - '3000:3000'
  backend:
    volumes:
      - ./services/backend:/app
"""
        
        transformer = FrontendComposeTransformer(content)
        result = transformer.remove_frontend_volumes().change_frontend_target_to_production()
        
        output = result.get_content()
        transformations = result.get_transformations()
        
        # Check transformations were applied
        self.assertEqual(len(transformations), 2)
        self.assertIn("Removed volumes from frontend service", transformations)
        self.assertIn("Changed frontend build target to production", transformations)
        
        # Check output
        self.assertIn("target: production", output)
        self.assertNotIn("target: development", output)
        self.assertNotIn("- ./services/frontend:/app", output)
        self.assertIn("- ./services/backend:/app", output)  # Backend volumes should remain
    
    def test_no_changes_when_already_production(self):
        """Test no changes when frontend is already configured for production."""
        content = """services:
  frontend:
    build:
      target: production
    ports:
      - '3000:3000'
"""
        
        transformer = FrontendComposeTransformer(content)
        result = transformer.remove_frontend_volumes().change_frontend_target_to_production()
        
        # Should be no transformations
        self.assertEqual(len(result.get_transformations()), 0)
        self.assertEqual(result.get_content(), content)
    
    def test_no_changes_when_no_frontend_service(self):
        """Test no changes when there's no frontend service."""
        content = """services:
  backend:
    build:
      context: ./services/backend
    volumes:
      - ./services/backend:/app
"""
        
        transformer = FrontendComposeTransformer(content)
        result = transformer.remove_frontend_volumes().change_frontend_target_to_production()
        
        # Should be no transformations
        self.assertEqual(len(result.get_transformations()), 0)
        self.assertEqual(result.get_content(), content)


class TestTransformFile(unittest.TestCase):
    """Test the file transformation functionality."""
    
    def test_transform_file_success(self):
        """Test successful file transformation."""
        content = """services:
  frontend:
    build:
      context: ./services/frontend
      target: development
    volumes:
      - ./services/frontend:/app
    ports:
      - '3000:3000'
"""
        
        # Create temporary files
        with tempfile.NamedTemporaryFile(mode='w', suffix='.yml', delete=False) as input_f:
            input_f.write(content)
            input_file = input_f.name
        
        with tempfile.NamedTemporaryFile(suffix='.yml', delete=False) as output_f:
            output_file = output_f.name
        
        try:
            # Transform the file
            result = transform_compose_file(input_file, output_file)
            self.assertTrue(result)
            
            # Check output file
            with open(output_file, 'r') as f:
                output_content = f.read()
            
            self.assertIn("target: production", output_content)
            self.assertNotIn("volumes:", output_content)
            
        finally:
            os.unlink(input_file)
            os.unlink(output_file)
    
    def test_nonexistent_input_file(self):
        """Test handling of nonexistent input file."""
        result = transform_compose_file('nonexistent.yml')
        self.assertFalse(result)


if __name__ == '__main__':
    unittest.main(verbosity=2)