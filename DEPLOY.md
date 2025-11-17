# Deployment Guide - GitHub Pages

## Quick Deploy (5 minutes)

### Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `study-notes-T` (or any name you like)
3. Description: "Beautiful study notes app for T"
4. Choose **Public** (required for free GitHub Pages)
5. **Don't** initialize with README (we already have files)
6. Click "Create repository"

### Step 2: Push Your Code

Open terminal in your project folder and run:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Study Notes App for T"

# Add GitHub as remote (replace YOUR-USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR-USERNAME/study-notes-T.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** (top right)
3. Click **Pages** (left sidebar)
4. Under "Source":
   - Branch: Select `main`
   - Folder: Select `/ (root)`
5. Click **Save**
6. Wait 1-2 minutes
7. Your site will be live at: `https://YOUR-USERNAME.github.io/study-notes-T/`

### Step 4: Share with T 💝

Your app is now live! Share the URL with her.

---

## Custom Domain (Optional)

Want a custom domain like `notes.T.com`?

1. Buy a domain (Namecheap, Google Domains, etc.)
2. In GitHub Pages settings, add your custom domain
3. In your domain registrar, add these DNS records:
   ```
   Type: CNAME
   Name: notes (or www)
   Value: YOUR-USERNAME.github.io
   ```
4. Wait for DNS propagation (5-30 minutes)

---

## Updating the App

Whenever you make changes:

```bash
git add .
git commit -m "Description of changes"
git push
```

GitHub Pages will automatically update in 1-2 minutes!

---

## Alternative: Netlify Deploy

If you prefer Netlify:

### Option A: Drag & Drop (Easiest)
1. Go to https://app.netlify.com/drop
2. Drag your entire project folder
3. Done! You get a URL like `random-name-123.netlify.app`

### Option B: GitHub Integration
1. Push code to GitHub (steps above)
2. Go to https://app.netlify.com
3. Click "Add new site" → "Import from Git"
4. Connect GitHub and select your repo
5. Deploy settings:
   - Build command: (leave empty)
   - Publish directory: (leave empty or put `/`)
6. Click "Deploy"

---

## Troubleshooting

### Issue: 404 errors when loading notes
**Solution:** Make sure `notes/` folder is committed to git:
```bash
git add notes/
git commit -m "Add notes folder"
git push
```

### Issue: Changes not showing
**Solution:** Hard refresh the page:
- Mac: `Cmd + Shift + R`
- Windows/Linux: `Ctrl + Shift + R`

### Issue: Want to keep it private?
**Solution:** 
- GitHub Pages requires public repos for free tier
- Use Netlify with password protection (free)
- Or upgrade to GitHub Pro ($4/month) for private repos

---

## Making it Special for T 💕

After deploying, you can:

1. **Custom URL**: Get a domain like `notes.T.com`
2. **Add more notes**: Just add JSON files to `notes/` folder
3. **Share the link**: Send her the URL with a sweet message
4. **Track usage**: Add Google Analytics (optional)
5. **Keep updating**: Add new features and push updates

---

## Need Help?

If you get stuck:
1. Check the GitHub Pages documentation
2. Make sure all files are committed and pushed
3. Wait 2-3 minutes after pushing for changes to appear
4. Clear browser cache if changes don't show

Good luck! 🚀
