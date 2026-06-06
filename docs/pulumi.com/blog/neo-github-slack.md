---
Source: https://www.pulumi.com/blog/neo-github-slack/
Generated: 2026-06-06
Updated: 2026-06-06
---

# Bringing Neo to GitHub and Slack

![Bringing Neo to GitHub and Slack](/blog/neo-github-slack/feature_hu_6d4f3196e943d337.dadd5395a9fa580d170210945e86e4ec1f40f32f38dfa67ce37a3cd6b83c8dbb.webp)

# Bringing Neo to GitHub and Slack

 [![Pulumi Neo Team](/images/team/neo-team.jpg)](/blog/author/neo-team/)[Pulumi Neo Team](/blog/author/neo-team/)

Posted on May 21st, 2026

This week, [Pulumi Neo](/blog/pulumi-neo/) started working in two more places: GitHub and Slack. The agent that already runs Pulumi tasks from the Cloud console and the [terminal](/blog/pulumi-neo-cli/) now participates in the threads where your team discusses changes.

Mention `@pulumi-neo` in a [pull request or issue](/docs/ai/integrations/github/) and Neo replies in the thread. Mention `@Neo` in a [Slack channel](/docs/ai/integrations/slack/) and Neo starts a [task](/docs/ai/tasks/), continuing the conversation as you reply.

## Neo in GitHub[](#neo-in-github)

Mention `@pulumi-neo` in a pull request description, a top-level or inline review comment, or an issue. Neo sees the diff, the stacks linked to the repository, and their current state. Reviewers can ask Neo to walk through what a proposed change does, including resources that change in stacks the PR doesn’t touch directly. Responses land in the same thread, so the analysis becomes part of the review record and any follow-up stays with it.

## Neo in Slack[](#neo-in-slack)

Mention `@Neo` in any channel where Neo has been added, and Neo starts a task in the thread. The reply lands in the same thread, and follow-up messages continue the conversation there. The rest of the channel can see what was asked and what Neo found. Neo has the same capabilities here as in the Pulumi Cloud console or the terminal: check stack state, investigate failures, walk through what a change will do, or carry out actions the team has approved.

## Integrations in action[](#integrations-in-action)

A teammate posts in `#platform-engineering`: “API latency p95 has been climbing for two days, nobody can figure out why.” You reply:

> **You:** @Neo check the production API stack. Anything change in the last 72 hours?

Neo starts a task in the thread, walks the stack history, and finds a configuration change to the load balancer’s idle-timeout setting that landed Friday afternoon. It posts the change, who deployed it, and when. The rest of the channel sees the finding without you having to retell it.

> **You:** @Neo open a PR to revert idle-timeout to the previous value.

Neo edits the stack’s Pulumi program, runs `pulumi preview` to confirm the change touches only the load balancer, and opens a pull request with the diff and the preview output. A reviewer pulls it up:

> **Reviewer:** @pulumi-neo what else does this change affect downstream?

Neo replies in the same review thread with the resources that change: the listener config and the target group health check. The reviewer reads, approves, and the change ships.

The investigation moved from Slack to GitHub, and both threads keep the record.

## Permissions and governance[](#permissions-and-governance)

Whether the conversation starts in GitHub or Slack, Neo runs with the [RBAC permissions](/docs/administration/access-identity/rbac/) of your Pulumi Cloud user. Stack-level controls, organization-level guardrails, and audit logging apply the same way they do for a task started from the console. Starting a conversation in a new place doesn’t grant Neo new permissions; it just changes where the conversation happens.

## Try it out[](#try-it-out)

Both integrations are available now for Neo-enabled organizations. The [GitHub integration docs](/docs/ai/integrations/github/) and [Slack integration docs](/docs/ai/integrations/slack/) cover the one-time setup. From there, every engineer with a linked Pulumi Cloud identity can mention Neo from the threads they already work in.

Today’s launch is part of a [bigger story](/releases/agentic-infrastructure-era/). Read our launch-day piece on [the agentic infrastructure era](/blog/the-agentic-infrastructure-era/) for the broader vision, the [Neo CLI launch post](/blog/pulumi-neo-cli/) for Neo’s new home in the terminal, and the [Neo Integrations post](/blog/neo-integrations/) for the MCP servers and cloud CLIs that ship with this release.

As always, we’d love to hear what you think — and if you have any suggestions for places we should put Neo next, file an issue in [pulumi-cloud-requests](https://github.com/pulumi/pulumi-cloud-requests/issues/new/choose).

-   [ai](/blog/tag/ai/)
-   [ai-agents](/blog/tag/ai-agents/)
-   [features](/blog/tag/features/)
-   [pulumi-neo](/blog/tag/pulumi-neo/)

#### Subscribe to the Pulumi Monthly Newsletter[](#subscribe-to-the-pulumi-monthly-newsletter)
