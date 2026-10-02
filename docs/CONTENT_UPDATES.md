# Website Update Process

This document describes how code and Notion content are published to the production website.

## Architecture

- **GitHub** is the source of truth for the application code.
- **Notion** is the source of truth for portfolio content.
- **Astro** builds the website and fetches content from Notion.
- **Vercel** builds, deploys, and hosts the website.

Production: [ashemetau.vercel.app](https://ashemetau.vercel.app/)

## Code Updates

Changes to the application code must go through a Pull Request.

1. Create a new branch from `main`.
2. Make and commit the required changes.
3. Open a Pull Request targeting `main`.
4. Wait for the required `Build / build` check to pass.
5. Review the Vercel Preview deployment.
6. Resolve any open review conversations.
7. Merge the Pull Request.
8. Delete the temporary branch.
9. Wait for the Vercel production deployment to finish.

A successful merge into `main` automatically starts a production deployment.

### Protected `main` Branch

The `main` branch is protected by a GitHub ruleset.

The protection includes:

- Direct commits to `main` are blocked.
- Changes require a Pull Request.
- The required build check must pass.
- The Pull Request branch must be up to date.
- Review conversations must be resolved.
- Force pushes are blocked.
- Branch deletion is restricted.

## Notion Content Updates

Editing content in Notion does not automatically update the production website.

After reviewing the changes in Notion, publish them manually:

1. Open the repository on GitHub.
2. Select **Actions**.
3. Select **Publish content**.
4. Click **Run workflow**.
5. Confirm that the selected branch is `main`.
6. Enter exactly `publish` in the confirmation field.
7. Click **Run workflow**.
8. Wait for the workflow to finish with the **Success** status.
9. Open the Vercel project and confirm that the new production deployment has the **Ready** status.
10. Check the production website.

The workflow uses the protected GitHub secret `VERCEL_DEPLOY_HOOK`. The secret value must never be added to source code, documentation, logs, issues, or Pull Requests.

## Update Flow

### Code

```text
Feature branch
    ↓
Pull Request
    ↓
Required build check
    ↓
Vercel Preview
    ↓
Manual merge into main
    ↓
Vercel production deployment
```

### Content

```text
Edit content in Notion
    ↓
Review the changes
    ↓
Run the Publish content workflow
    ↓
Enter "publish"
    ↓
Vercel production deployment
```

## Safety Measures

The following protections prevent accidental deployments:

- Notion webhook automation is paused.
- The public `/api/notion-webhook` endpoint has been removed.
- Notion edits do not automatically trigger deployments.
- Content publishing requires a manual GitHub Actions run.
- The publishing workflow requires the exact confirmation value `publish`.
- Concurrent content publication runs are not cancelled automatically.
- Code changes cannot be committed directly to `main`.
- Production code changes require a successful build.

Do not restore the public Notion webhook unless request verification and appropriate rate limiting are implemented.

## Verifying a Deployment

A content publication is successful when:

- The **Publish content** GitHub Actions run shows **Success**.
- A new **Production** deployment appears in Vercel.
- The Vercel deployment shows **Ready**.
- The production website displays the expected content.

A code update is successful when:

- All Pull Request checks pass.
- The Pull Request is merged into `main`.
- The resulting Vercel production deployment shows **Ready**.
- The production website works as expected.

## Troubleshooting

### The GitHub Action fails before contacting Vercel

Check that:

- The confirmation value is exactly `publish`.
- The `VERCEL_DEPLOY_HOOK` repository secret exists.
- The workflow is running from `main`.

Do not print the secret value in logs.

### GitHub succeeds, but Vercel does not create a deployment

Check that:

- The Vercel Deploy Hook still exists.
- The GitHub secret contains the current Deploy Hook URL.
- The Deploy Hook targets the `main` branch.

If the Deploy Hook is recreated, update the GitHub secret before running the workflow again.

### The Vercel deployment fails

1. Open the failed deployment in Vercel.
2. Review its build logs.
3. Fix the underlying content, configuration, or code issue.
4. For a code fix, create a new branch and Pull Request.
5. For a corrected Notion update, run **Publish content** again.

### The production website is broken after a code merge

Use Vercel to promote or redeploy the last known good production deployment. Then fix the problem through a new Pull Request.

Do not bypass the protected `main` branch for an emergency fix.

## Important Rules

- Never commit secrets or tokens.
- Never share the Vercel Deploy Hook URL.
- Do not push directly to `main`.
- Review the Vercel Preview before merging code changes.
- Review Notion content before running the publishing workflow.
- Keep the Notion webhook subscription paused.
