# Release Workflow Diagram

## Visual Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        DEVELOPMENT WORKFLOW                         │
└─────────────────────────────────────────────────────────────────────┘

  Developer                 dev branch              Release Please
     │                          │                          │
     │  1. Create feature       │                          │
     │     branch               │                          │
     ├─────────────────────────>│                          │
     │                          │                          │
     │  2. Create PR            │                          │
     │     (targets dev)        │                          │
     ├─────────────────────────>│                          │
     │                          │                          │
     │  3. Review & Merge       │                          │
     ├─────────────────────────>│                          │
     │                          │                          │
     │                          │  4. Detects changes      │
     │                          │  (on push to dev)        │
     │                          ├─────────────────────────>│
     │                          │                          │
     │                          │  5. Creates Release PR   │
     │                          │  (version bump +         │
     │                          │   CHANGELOG.md)          │
     │                          │<─────────────────────────┤
     │                          │                          │
     │  6. Review Release PR    │                          │
     │     (check version &     │                          │
     │      changelog)          │                          │
     ├─────────────────────────>│                          │
     │                          │                          │
     │  7. Merge Release PR     │                          │
     ├─────────────────────────>│                          │
     │                          │                          │
     │                          │  8. Creates GitHub       │
     │                          │     Release + Tag        │
     │                          │<─────────────────────────┤
     │                          │                          │
     │                          │  9. Creates PR:          │
     │                          │     dev → main           │
     │                          │                          │
     ▼                          ▼                          ▼

┌─────────────────────────────────────────────────────────────────────┐
│                       PRODUCTION DEPLOYMENT                         │
└─────────────────────────────────────────────────────────────────────┘

  Maintainer            dev → main PR            main branch
     │                          │                          │
     │                          │                          │
     │  10. Review prod PR      │                          │
     │      (all changes        │                          │
     │       from dev)          │                          │
     ├─────────────────────────>│                          │
     │                          │                          │
     │  11. Merge to main       │                          │
     │      (deploy!)           │                          │
     ├─────────────────────────>│─────────────────────────>│
     │                          │                          │
     │                          │  12. Production deploy   │
     │                          │      triggered (Vercel,  │
     │                          │      etc.)               │
     │                          │                          ✓
     │                          │                    ┌──────────┐
     │                          │                    │   PROD   │
     │                          │                    │  v0.2.0  │
     │                          │                    └──────────┘
     ▼                          ▼                          ▼
```

## Commit Message Flow

```
┌──────────────────────┐
│  Conventional Commits│
│  in Pull Requests    │
└──────────┬───────────┘
           │
           ├── feat: new feature    → Minor version bump (0.1.0 → 0.2.0)
           │
           ├── fix: bug fix         → Patch version bump (0.1.0 → 0.1.1)
           │
           ├── feat!: breaking      → Major version bump (0.1.0 → 1.0.0)
           │   (or BREAKING CHANGE)
           │
           ├── docs: documentation  → No version bump
           │
           └── chore: maintenance   → No version bump
                      │
                      ▼
            ┌─────────────────────┐
            │  Release Please     │
            │  Analyzes Commits   │
            └──────────┬──────────┘
                       │
                       ▼
            ┌─────────────────────┐
            │  Calculates Version │
            │  Generates CHANGELOG│
            └──────────┬──────────┘
                       │
                       ▼
            ┌─────────────────────┐
            │  Creates Release PR │
            └─────────────────────┘
```

## Branch Strategy

```
    main (production)          dev (development)        feature branches
         │                            │                        │
         │                            │<───── PR #1 ─────────○ feature/ui
         │                            │                        
         │                            │<───── PR #2 ─────────○ feature/api
         │                            │                        
         │                            │<───── PR #3 ─────────○ fix/bug
         │                            │
         │                            ○ (Release Please)
         │                            │  creates release PR
         │                            │
         │                            ○ Release PR merged
         │                            │  → v0.2.0 tagged
         │                            │  → GitHub Release
         │                            │
         │<────── PR: prod ──────────○
         │        (dev → main)        │
         │                            │
         ○ Merge to main              │
         │ → Deploy to prod           │
    (v0.2.0)                          │
         │                            │<───── PR #4 ─────────○ feature/new
         │                            │  (next release cycle)
         ▼                            ▼                        ▼
```

## Key Benefits

```
┌─────────────────────────────────────────────────────────┐
│ ✅ Clear separation: dev (testing) vs main (production) │
│ ✅ Automated versioning (no manual version bumps!)      │
│ ✅ Auto-generated changelogs (from commit messages)     │
│ ✅ Gated releases (review before production)            │
│ ✅ Every release is tagged (easy rollback)              │
│ ✅ Follows semantic versioning automatically            │
└─────────────────────────────────────────────────────────┘
```

## Example Timeline

```
📅 Monday
   └─ Developer creates PR #10 (feat: add export feature) → dev
   └─ PR reviewed and merged to dev

📅 Tuesday  
   └─ Developer creates PR #11 (fix: color picker) → dev
   └─ PR reviewed and merged to dev
   └─ Release Please creates Release PR (v0.2.0)
      - Updates package.json to 0.2.0
      - Generates CHANGELOG with features & fixes

📅 Wednesday
   └─ Maintainer reviews Release PR
   └─ Merges Release PR to dev
   └─ Release Please:
      ✓ Creates GitHub Release v0.2.0
      ✓ Tags commit with v0.2.0
      ✓ Creates PR: "🚀 Release v0.2.0 to Production" (dev → main)

📅 Thursday
   └─ Maintainer reviews production PR
   └─ Merges dev → main
   └─ Vercel deploys to production ✨
   └─ Development continues on dev for v0.3.0...
```

## Troubleshooting Flow

```
┌─────────────────────────────┐
│ PR still targets main?      │
└──────────┬──────────────────┘
           │
           └─→ Check: Is dev set as default branch in Settings?
           
┌─────────────────────────────┐
│ Release Please not running? │
└──────────┬──────────────────┘
           │
           ├─→ Check: Are commits using conventional format?
           ├─→ Check: Is workflow file in .github/workflows/?
           └─→ Check: Are permissions set correctly?

┌─────────────────────────────┐
│ No version bump in PR?      │
└──────────┬──────────────────┘
           │
           └─→ Only feat:, fix:, feat! cause version bumps
               (docs:, chore: don't bump versions)
```

---

For more details, see:
- [BRANCHING_STRATEGY.md](./BRANCHING_STRATEGY.md) - Complete guide
- [QUICKSTART.md](./QUICKSTART.md) - 5-minute setup
- [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md) - Detailed instructions
