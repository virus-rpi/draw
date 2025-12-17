# Repository Setup Instructions

This document contains manual setup steps required to complete the branching strategy and Release Please configuration.

## Required Manual Steps

### 1. Create the `dev` Branch

If the `dev` branch doesn't already exist, create it from `main`:

```bash
git checkout main
git pull origin main
git checkout -b dev
git push origin dev
```

Or create it through the GitHub UI:
1. Go to your repository on GitHub
2. Click the branch dropdown
3. Type "dev" in the search box
4. Click "Create branch: dev from 'main'"

### 2. Set `dev` as the Default Branch

This ensures all new PRs automatically target `dev` instead of `main`:

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Branches**
3. Under "Default branch", click the switch icon (⇄)
4. Select `dev` from the dropdown
5. Click "Update"
6. Confirm the change

**Why this matters:** This makes `dev` the default target for all new Pull Requests.

### 3. Add Branch Protection Rules (Recommended)

Protect both `main` and `dev` branches to ensure code quality:

#### For `main` branch:
1. Go to **Settings** → **Branches**
2. Click "Add rule" or "Add branch protection rule"
3. Branch name pattern: `main`
4. Enable these settings:
   - ✅ **Require a pull request before merging**
     - ✅ Require approvals: 1
   - ✅ **Require status checks to pass before merging** (if you have CI)
   - ✅ **Do not allow bypassing the above settings**
   - ✅ **Restrict who can push to matching branches** (only Release Please bot/admin)
5. Click "Create" or "Save changes"

#### For `dev` branch:
1. Add another rule with branch name pattern: `dev`
2. Enable these settings:
   - ✅ **Require a pull request before merging**
     - ✅ Require approvals: 1
   - ✅ **Require status checks to pass before merging** (if you have CI)
3. Click "Create" or "Save changes"

### 4. Configure Release Please Permissions (Already in workflow)

The workflow already includes required permissions:
- `contents: write` - To update version files
- `pull-requests: write` - To create release PRs

No additional action needed unless you have strict organization settings.

### 5. Test the Setup

1. **Create a test PR to `dev`:**
   ```bash
   git checkout dev
   git checkout -b test/release-please-setup
   echo "# Test" >> TEST.md
   git add TEST.md
   git commit -m "feat: test release please setup"
   git push origin test/release-please-setup
   ```
   
2. **Create PR on GitHub:**
   - The PR should automatically target `dev` ✅
   
3. **Merge the PR to `dev`:**
   - After merging, Release Please should trigger
   - Check the "Actions" tab on GitHub
   - Release Please will create a release PR on `dev`
   
4. **Review the Release PR on dev:**
   - Look for a PR titled like "chore(main): release 0.2.0"
   - It should include:
     - Updated version in `package.json`
     - New/updated `CHANGELOG.md`
   
5. **Merge the Release PR to `dev`:**
   - When merged, Release Please will:
     - Create a GitHub Release
     - Tag the commit with the version number
     - Automatically create a PR from `dev` to `main` for production deployment
   
6. **Review and merge the dev → main PR:**
   - A new PR will be automatically created from `dev` to `main`
   - Titled like "🚀 Release v0.2.0 to Production"
   - Review the changes
   - Merge to deploy to production

7. **Clean up test:**
   ```bash
   git checkout dev
   git pull origin dev
   git branch -d test/release-please-setup
   git push origin --delete test/release-please-setup
   ```

## Verification Checklist

After completing the setup, verify:

- [ ] `dev` branch exists
- [ ] `dev` is set as the default branch
- [ ] New PRs automatically target `dev`
- [ ] Branch protection is enabled on `main` (prevents direct pushes)
- [ ] Branch protection is enabled on `dev` (requires PR review)
- [ ] Release Please workflow runs when pushing to `dev`
- [ ] Release Please creates PR from `dev` to `main` with changelog

## Troubleshooting

### Release Please not creating PRs

1. **Check the Actions tab** for any workflow errors
2. **Verify permissions** - The GitHub token needs `contents: write` and `pull-requests: write`
3. **Check commit messages** - Use conventional commits format (feat:, fix:, etc.)
4. **Ensure releases** - Make sure you have at least one commit since the last release

### PRs still targeting `main` by default

1. Double-check that `dev` is set as the default branch in Settings
2. You may need to manually change the target branch when creating PRs until GitHub updates

### Release Please creates empty PRs

This can happen if there are no releasable changes (e.g., only chore: commits). Add a feat: or fix: commit to trigger a proper release.

## Additional Resources

- [Release Please Documentation](https://github.com/googleapis/release-please)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches)
- [Branching Strategy Guide](./.github/BRANCHING_STRATEGY.md)
