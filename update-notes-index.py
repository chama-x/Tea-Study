#!/usr/bin/env python3
"""
Auto-generate notes/index.html from .json files in notes/ folder
Run this whenever you add/rename notes: python3 update-notes-index.py
"""

import os
import json
from pathlib import Path

def get_note_title(json_file):
    """Extract title from JSON file"""
    try:
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
            # Try different title fields
            title = data.get('title') or data.get('main_title') or data.get('topic')
            if title:
                return title
    except:
        pass
    
    # Fallback: use filename
    name = json_file.stem.replace('-', ' ').replace('_', ' ')
    return name.title()

def generate_index():
    """Generate notes/index.html from .json files"""
    notes_dir = Path('notes')
    
    if not notes_dir.exists():
        print("❌ notes/ folder not found!")
        return
    
    # Find all .json files
    json_files = sorted(notes_dir.glob('*.json'))
    
    if not json_files:
        print("⚠️  No .json files found in notes/ folder")
        return
    
    # Generate HTML
    html = """<!DOCTYPE html>
<html>
<head>
    <title>Notes Directory</title>
</head>
<body>
    <h1>Available Notes</h1>
    <ul>
"""
    
    for json_file in json_files:
        filename = json_file.name
        title = get_note_title(json_file)
        html += f'        <li><a href="{filename}">{title}</a></li>\n'
    
    html += """    </ul>
</body>
</html>
"""
    
    # Write index.html
    index_path = notes_dir / 'index.html'
    with open(index_path, 'w', encoding='utf-8') as f:
        f.write(html)
    
    print(f"✅ Generated notes/index.html with {len(json_files)} note(s):")
    for json_file in json_files:
        title = get_note_title(json_file)
        print(f"   📄 {title} ({json_file.name})")

if __name__ == '__main__':
    generate_index()
