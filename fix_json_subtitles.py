#!/usr/bin/env python3
"""
Fix JSON files by adding 'subtitle' field extracted from 'path' field.

The 'path' field contains hierarchical structure like:
"Foundations of Web Technologies > Client-Side vs. Server-Side Scripting > Use Cases"

This script extracts the last part (after the last '>') as the 'subtitle' field.
"""

import json
import os
import sys
from pathlib import Path

def extract_subtitle_from_path(path_string):
    """
    Extract subtitle from path string.
    
    Args:
        path_string: String like "A > B > C"
    
    Returns:
        The last part after the last '>', or the whole string if no '>' exists.
    """
    if not path_string:
        return None
    
    # Split by ' > ' and get the last part
    parts = path_string.split(' > ')
    return parts[-1].strip() if parts else None

def process_json_file(file_path):
    """
    Process a single JSON file to add subtitle fields.
    
    Args:
        file_path: Path to the JSON file
    
    Returns:
        Tuple of (success: bool, message: str, blocks_updated: int)
    """
    try:
        # Read the JSON file
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Validate structure
        if not isinstance(data, dict):
            return False, "Invalid JSON structure: root is not an object", 0
        
        if 'content' not in data or not isinstance(data['content'], list):
            return False, "Invalid JSON structure: missing or invalid 'content' array", 0
        
        # Process each block
        blocks_updated = 0
        for block in data['content']:
            if not isinstance(block, dict):
                continue
            
            # Check if block has a 'path' field
            if 'path' in block and block['path']:
                # Extract subtitle from path
                subtitle = extract_subtitle_from_path(block['path'])
                
                # Add subtitle field (or update if exists)
                if subtitle:
                    # Only add if different from title (avoid redundancy)
                    block_title = block.get('title', '')
                    if subtitle != block_title:
                        block['subtitle'] = subtitle
                        blocks_updated += 1
                    elif 'subtitle' not in block:
                        # If subtitle matches title, still add it for consistency
                        block['subtitle'] = subtitle
                        blocks_updated += 1
        
        # Write back to file with pretty formatting
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        return True, f"Successfully processed {blocks_updated} blocks", blocks_updated
    
    except json.JSONDecodeError as e:
        return False, f"JSON decode error: {e}", 0
    except Exception as e:
        return False, f"Error: {e}", 0

def main():
    """Main function to process all JSON files in the notes directory."""
    
    # Get the notes directory
    notes_dir = Path('notes')
    
    if not notes_dir.exists():
        print("❌ Error: 'notes' directory not found")
        return 1
    
    # Find all JSON files
    json_files = list(notes_dir.glob('*.json'))
    
    if not json_files:
        print("❌ No JSON files found in 'notes' directory")
        return 1
    
    print(f"📁 Found {len(json_files)} JSON file(s) to process\n")
    
    # Process each file
    total_blocks_updated = 0
    successful_files = 0
    failed_files = 0
    
    for json_file in sorted(json_files):
        print(f"📄 Processing: {json_file.name}")
        success, message, blocks_updated = process_json_file(json_file)
        
        if success:
            print(f"   ✅ {message}")
            total_blocks_updated += blocks_updated
            successful_files += 1
        else:
            print(f"   ❌ {message}")
            failed_files += 1
        print()
    
    # Summary
    print("=" * 60)
    print("📊 SUMMARY")
    print("=" * 60)
    print(f"Total files processed:    {len(json_files)}")
    print(f"Successful:               {successful_files}")
    print(f"Failed:                   {failed_files}")
    print(f"Total blocks updated:     {total_blocks_updated}")
    print("=" * 60)
    
    if failed_files > 0:
        print("\n⚠️  Some files failed to process. Please check the errors above.")
        return 1
    else:
        print("\n✅ All files processed successfully!")
        return 0

if __name__ == '__main__':
    sys.exit(main())
