# 🚀 Quick Start: Branch Strategy Setup

This repository is now configured with a **dev → main** branch strategy and automated releases via **Release Please**.

## ✅ What's Already Done

All code changes have been made! This PR includes:

1. ✅ **Release Please Workflow** - Automates version bumps and changelog generation
2. ✅ **Configuration Files** - Release Please is fully configured for Node.js projects
3. ✅ **Documentation** - Complete guides for the branching strategy
4. ✅ **PR Template** - Helps contributors write good PRs

## 🔧 What You Need to Do (5 minutes)

After merging this PR, complete these 3 manual steps in GitHub:

### Step 1: Create the `dev` Branch (30 seconds)

```bash
# Option A: Via command line
git checkout -b dev
git push origin dev

# Option B: Via GitHub UI
# Go to your repo → click branch dropdown → type "dev" → create branch
```

### Step 2: Set `dev` as Default Branch (30 seconds)

1. Go to your repository on GitHub
2. Click **Settings** → **Branches**
3. Click the switch icon (⇄) next to "Default branch"
4. Select **`dev`**
5. Click **Update** and confirm

**Result:** All new PRs will now automatically target `dev` instead of `main` 🎉

### Step 3: Add Branch Protection (optional but recommended) (2-3 minutes)

**For `main` branch:**
1. Go to **Settings** → **Branches** → **Add rule**
2. Branch name pattern: `main`
3. Enable:
   - ✅ Require a pull request before merging
   - ✅ Require approvals (1)
4. Save

**For `dev` branch:**
1. Add another rule for `dev`
2. Enable:
   - ✅ Require a pull request before merging
   - ✅ Require approvals (1)
3. Save

## 🎯 How It Works

### For Developers:

```bash
# 1. Create feature branch from dev
git checkout dev
git checkout -b feature/my-feature

# 2. Make changes and commit (use conventional commits!)
git add .
git commit -m "feat: add new feature"

# 3. Push and create PR to dev
git push origin feature/my-feature
# Create PR on GitHub → targets dev automatically ✅
```

### For Releases (Automated!):

1. **Merge PRs to `dev`** → Release Please analyzes commits
2. **Release Please creates a Release PR on `dev`** → Updates version & changelog
3. **Merge the Release PR** → Release Please:
   - Creates a GitHub Release
   - Tags the version
   - **Automatically creates a PR from `dev` to `main`** 🎉
4. **Review and merge the `dev → main` PR** → Deploy to production!

## 📖 Learn More

- **[BRANCHING_STRATEGY.md](./.github/BRANCHING_STRATEGY.md)** - Complete guide
- **[SETUP_INSTRUCTIONS.md](./.github/SETUP_INSTRUCTIONS.md)** - Detailed setup and troubleshooting
- **[Release Please Docs](https://github.com/googleapis/release-please)** - Official documentation

## 🎉 That's It!

Once you complete the 3 manual steps above, your repo will be fully configured!

---

**Questions?** Check [SETUP_INSTRUCTIONS.md](./.github/SETUP_INSTRUCTIONS.md) for troubleshooting and detailed explanations.
