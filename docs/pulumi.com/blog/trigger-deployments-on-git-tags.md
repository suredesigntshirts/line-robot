---
Source: https://www.pulumi.com/blog/trigger-deployments-on-git-tags/
Generated: 2026-06-06
Updated: 2026-06-06
---

# Trigger Deployments on Git Tags

![Trigger Deployments on Git Tags](/blog/trigger-deployments-on-git-tags/feature_hu_aa7401c8a5f03d2b.7803c61876ad0988664765ee39e852a1f8e814594fd66b88cd63513ecc90b94e.webp)

# Trigger Deployments on Git Tags

 [![Michael Fallihee](/images/team/michael-fallihee.jpg)](/blog/author/michael-fallihee/)[Michael Fallihee](/blog/author/michael-fallihee/)

Posted on Jun 5th, 2026

A git tag is how many teams mark a release as ready. Pulumi Deployments can now act on that signal directly: configure a tag-based trigger, push a version tag like `v1.2.0`, and Pulumi automatically runs `pulumi up` for your stack. No extra pipeline glue, no manual click — your release tag *is* the deployment.

## Why tags?[](#why-tags)

[Push to Deploy](/docs/deployments/deployments/using/triggers/#push-to-deploy) has long let you preview changes on a pull request and update a stack when commits merge to a branch. That branch-based model is a great fit for continuous delivery to shared development and QA environments, where every merge should flow straight through.

But promotion to production is often deliberate, not continuous. You merge throughout the day, then decide — separately — that a particular commit is the release. The conventional way to record that decision is a git tag: `v1.2.0`, `2026.06.0`, `release-2026-06-04`. Tagging is already part of most teams’ release rituals.

Tag-based triggers connect that ritual to your infrastructure. Instead of wiring up a separate CI job to call the [Pulumi Deployments REST API](/docs/deployments/deployments/using/triggers/#rest-api) on a tag event, you configure the trigger once in your stack’s deployment settings and let Pulumi handle the rest.

## How it works[](#how-it-works)

Tag triggers are controlled by two settings on your stack’s [deployment configuration](/docs/deployments/deployments/using/settings/):

-   **Run updates for pushed tags** — a toggle that enables running `pulumi up` when a matching tag is pushed.
-   **Tag filters** — a list of glob patterns that decide which tag names qualify.

Tag filters use the same model as the [path filters](/docs/deployments/deployments/using/settings/#path-filtering) you may already know, except the patterns match against the tag name rather than changed file paths. A few examples:

-   `v*` — deploy on any tag beginning with `v`, such as `v1.0.0` and `v2.3.1`.
-   `v*` plus `!*-rc*` — deploy on release tags but skip release candidates like `v1.2.0-rc1`.
-   `2026.*` — deploy on calendar-versioned releases such as `2026.06.0`.

Filters prefixed with `!` are exclusions, and an exclusion always wins over an include. With no filters configured and the toggle on, every tag push deploys. Deleting a tag never triggers a deployment.

When a tag push kicks off a deployment, Pulumi sets the `PULUMI_CI_TAG_NAME` environment variable to the tag name. Your pre-run commands or your Pulumi program can read it — for example, to stamp the release version onto a resource tag or an application config value.

## Works across every VCS integration[](#works-across-every-vcs-integration)

Tag triggers are available across all five version control integrations: [GitHub](/docs/integrations/version-control/github-app/), [GitLab](/docs/integrations/version-control/gitlab/), [Bitbucket](/docs/integrations/version-control/bitbucket/), [Azure DevOps](/docs/integrations/version-control/azure-devops-integration/), and [Custom VCS](/docs/integrations/version-control/custom-vcs/).

## Get started[](#get-started)

You can configure tag triggers wherever you manage deployment settings today — the [Pulumi Cloud console](https://app.pulumi.com/signin), the [REST API](/docs/reference/cloud-rest-api/deployments/#patch-settings), or as code with the [`pulumiservice.DeploymentSettings`](/registry/packages/pulumiservice/api-docs/deploymentsettings/) resource.

To try it out:

1.  Open a stack’s **Settings > Deploy** tab in the Pulumi Cloud console.
2.  Enable **Run updates for pushed tags** and add a tag filter such as `v*`.
3.  Push a tag — `git tag v1.0.0 && git push origin v1.0.0` — and watch the deployment run.

For the full details, see the [deployment triggers](/docs/deployments/deployments/using/triggers/#deploying-on-git-tags) and [tag filtering](/docs/deployments/deployments/using/settings/#tag-filtering) documentation. We’d love to hear how you put tag-based deployments to work.

-   [features](/blog/tag/features/)
-   [pulumi-cloud](/blog/tag/pulumi-cloud/)
-   [announcements](/blog/tag/announcements/)

#### Subscribe to the Pulumi Monthly Newsletter[](#subscribe-to-the-pulumi-monthly-newsletter)
