# Multi-Apps Demo

This repository is structured to host multiple independent web projects, each in its own folder, and serve them as live sites using GitHub Pages.

## Structure

```
multi-apps-demo/
  breathing-app/
    index.html
    script.js
  another-app/
    index.html
    ...
  README.md
```

## How to Use

1. **Add a new project:**
   - Create a new folder (e.g., `my-new-app`) in the root of the repo.
   - Add your `index.html`, JS, CSS, and other files to that folder.

2. **Push to GitHub:**
   - Commit and push your changes to the `main` branch.

3. **Enable GitHub Pages:**
   - Go to your repository's **Settings → Pages**.
   - Set the source to the `main` branch and the `/ (root)` folder.

4. **Access your projects live:**
   - Each project will be available at:
     - `https://<your-username>.github.io/<repo-name>/<project-folder>/`
   - Example: `https://your-username.github.io/multi-apps-demo/breathing-app/`

## Adding More Projects
- Just add a new folder for each project and push to GitHub.
- You can add a simple `index.html` in the root to list and link to all projects if you wish.

---

**Enjoy hosting multiple live web projects from a single repository!**
