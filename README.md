# Study Notes App

A beautiful, paper-inspired study notes viewer for Thathsarani.

## How to Run

You need to run a local web server because browsers block file:// protocol requests.

### Option 1: Python (Recommended)

If you have Python installed:

```bash
# Python 3
python3 -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Then open: http://localhost:8000

### Option 2: Node.js

If you have Node.js installed:

```bash
npx http-server -p 8000
```

Then open: http://localhost:8000

### Option 3: VS Code Live Server

1. Install "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

### Option 4: PHP

If you have PHP installed:

```bash
php -S localhost:8000
```

Then open: http://localhost:8000

## Adding Notes

1. Place your `.json` note files in the `notes/` folder
2. Update `notes/index.html` to list the new files
3. Or use the "Import File" option in the library

## Features

- 📝 Exam Mode / Full Understanding Mode
- 💡 Hover tooltips for learning aids
- 🎯 Path navigation
- 🎉 Confetti celebration on completion
- 📱 Fully responsive design
- 🖨️ Print-friendly with paper aesthetic
