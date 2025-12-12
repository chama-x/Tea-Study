# Study Notes App

A beautiful, paper-inspired study notes viewer for the IS Degree module at Sabaragamuwa University of Sri Lanka.

## 🤖 For AI Agents

**Start every chat session by reading these context files:**

1. **`PROJECT_CONTEXT.md`** - Comprehensive project documentation (architecture, data structures, features)
2. **`QUICK_REFERENCE.md`** - Quick reference for common tasks and debugging

These files use proven context engineering techniques to help you understand and work with this project seamlessly.

```
Load context files → Understand project structure → Execute user requests
```

### 📚 Complete Context Documentation

This project includes a comprehensive context documentation system:

| File | Purpose | When to Use |
|------|---------|-------------|
| 📇 `CONTEXT_INDEX.md` | Master navigation guide | Finding the right doc |
| 📘 `PROJECT_CONTEXT.md` | Full project documentation | Every fresh chat (essential) |
| ⚡ `QUICK_REFERENCE.md` | Commands & quick tasks | Task execution (essential) |
| 🎯 `FRESH_CHAT_PROMPT.md` | Ready-to-use prompts | Starting new chats |
| 📖 `HOW_TO_USE_CONTEXT.md` | Usage instructions | First time / training |
| 🧪 `CONTEXT_ENGINEERING.md` | Methodology explained | Understanding approach |

**Quick Start**: Use the prompt template from `FRESH_CHAT_PROMPT.md` in every new chat session!

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
