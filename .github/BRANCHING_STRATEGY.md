# Branching Strategy

This repository uses a two-branch strategy with automated releases.

## Branch Structure

### `dev` (Development Branch)
- **Default branch for all Pull Requests**
- All feature branches should be created from `dev`
- All PRs should target `dev`
- This is where active development happens
- Changes are tested and reviewed here before release

### `main` (Production Branch)
- **Protected branch for production releases**
- Only updated through Release Please automated PRs
- Should always reflect the latest production-ready code
- Tagged with version numbers for each release

## Workflow

### For Developers

1. **Create a feature branch from `dev`:**
   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes and commit:**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```
   
   Use [Conventional Commits](https://www.conventionalcommits.org/) format:
   - `feat:` - New features
   - `fix:` - Bug fixes
   - `docs:` - Documentation changes
   - `chore:` - Maintenance tasks
   - `refactor:` - Code refactoring
   - `test:` - Adding tests
   - `ci:` - CI/CD changes

3. **Push and create a PR to `dev`:**
   ```bash
   git push origin feature/your-feature-name
   ```
   - Open a Pull Request targeting the `dev` branch
   - Get review and approval
   - Merge to `dev`

### Release Process (Automated)

1. **Release Please monitors the `dev` branch**
   - When changes are pushed to `dev`, Release Please analyzes commit messages
   - It automatically creates/updates a Release PR from `dev` to `main`
   - The Release PR includes:
     - Updated version in `package.json`
     - Generated `CHANGELOG.md` with all changes
     - Proper version bumping based on conventional commits

2. **Review and merge the Release PR**
   - Review the generated changelog and version bump
   - When ready to release, merge the Release PR from `dev` to `main`
   - Release Please will automatically:
     - Create a GitHub Release
     - Tag the release with the version number
     - Publish the changelog

3. **After release**
   - The `main` branch now has the latest production code
   - Deployments can be triggered from the `main` branch
   - Continue development on `dev` for the next release

## Benefits

- ✅ Clear separation between development and production code
- ✅ Automated version management and changelog generation
- ✅ All PRs go through proper review on `dev` first
- ✅ Controlled, documented releases to `main`
- ✅ Easy rollback - every release is tagged
- ✅ Follows semantic versioning automatically

## Version Bumping

Release Please automatically determines version bumps based on commit messages:

- `feat:` → Minor version bump (0.1.0 → 0.2.0)
- `fix:` → Patch version bump (0.1.0 → 0.1.1)
- `feat!:` or `BREAKING CHANGE:` → Major version bump (0.1.0 → 1.0.0)

## Example Timeline

```
Day 1: Developer merges PR #1 (feat: new drawing tool) to dev
Day 2: Developer merges PR #2 (fix: color picker bug) to dev
Day 3: Release Please creates/updates Release PR: "chore(main): release 0.2.0"
Day 4: Maintainer reviews and merges Release PR to main
       → Version 0.2.0 is released
       → GitHub Release created with changelog
Day 5: Development continues on dev for version 0.3.0
```

## Important Notes

- **Never push directly to `main`** - always go through the release PR
- **Use conventional commits** - this is crucial for automated versioning
- **Review Release PRs carefully** - they determine what goes to production
- **Keep `dev` stable** - it should always be in a releasable state
