<div align="center">

# ☕ T-Study

**Your notes deserve to look good.**

[![Vanilla JS](https://img.shields.io/badge/Vanilla-JavaScript-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8)](https://web.dev/progressive-web-apps/)
[![Works Offline](https://img.shields.io/badge/Works-Offline-4CAF50)](https://web.dev/offline-cookbook/)

---

</div>

## What's this?

I built T-Study because I was tired of ugly study apps. I wanted something that feels like a real notebook — warm paper, ruled lines, that red margin we all know from school. But digital, so I can switch between "show me everything" and "just the exam stuff."

It's a web app that reads your study notes (in JSON format) and displays them beautifully. No accounts, no subscriptions, works offline. Just you and your notes.

**Built for:** Students at Sabaragamuwa University of Sri Lanka (IS Degree), but anyone can use it.

---

## Features

**📝 Two study modes**
- *Full Mode* — see all your notes with full explanations
- *Exam Mode* — only shows the critical stuff (marked with ⚡)

**💡 Tooltips that actually help**  
Hover on a concept and get a simple explanation, a real-world analogy, and context for why it matters. Great for those "wait, what does this mean again?" moments.

**📱 Works on your phone**  
Responsive design. Looks good on desktop, tablet, phone.

**⚡ Works offline**  
It's a PWA. Install it, and you can study without internet.

**🎨 Paper aesthetic**  
Warm off-white background, blue ruled lines, red margin, 3-hole punch decoration. Feels like a real notebook.

**🎉 Confetti when you finish**  
Small thing, but it feels good.

---

## Quick Start

You need a local server (browsers block file:// requests). Pick whatever you have installed:

```bash
# Python
python3 -m http.server 8000

# Node.js
npx http-server -p 8000

# PHP
php -S localhost:8000
```

Then go to `http://localhost:8000`

**VS Code users:** Just install Live Server extension, right-click `index.html`, done.

---

## Adding Your Notes

1. Create a `.json` file with your notes (see format below)
2. Put it in the `notes/` folder
3. Add a link to it in `notes/index.html`
4. Refresh the app

### Note Format

```json
{
  "title": "Course Name",
  "topic": "Chapter or Topic",
  "content": [
    {
      "type": "concept",
      "title": "Some Concept",
      "exam_text": "Short version for exams",
      "full_text": "Longer explanation with details",
      "key_sentence": "The one thing to remember",
      "simple_explanation": "ELI5 version",
      "analogy": "It's like...",
      "exam_critical": true
    }
  ]
}
```

Check `AI_CONTEXT.md` for the full spec if you want all the details.

---

## Tech

No frameworks. No npm install. No build step. Just:

- Vanilla JavaScript (~40 KB)
- CSS3 with custom properties
- Service Worker for offline
- LocalStorage for preferences

Total size: ~63 KB. Loads fast.

---

## Contributing

PRs welcome! Just keep it simple:

- No frameworks (React, Vue, etc.)
- No npm dependencies
- Keep the paper look
- Test both study modes
- Make sure it works offline

---

## For AI Agents

If you're using AI tools to work on this project, have them read `AI_CONTEXT.md` first. It has everything — architecture, code patterns, common issues, the works.

This project is **human-made** but AI-assisted. The code and design decisions are mine. I use AI as a tool for faster development and documentation.

---

## License

MIT — do whatever you want with it.

---

<div align="center">

Made by [Chamath Thiwanka](https://github.com/chama-x) for students who deserve better study tools.

⭐ Star if you find it useful

</div>
