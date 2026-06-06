---
Source: https://www.pulumi.com/automation/
Generated: 2026-06-06
Updated: 2026-06-06
---

# Automation API

### Harness the full power of Infrastructure as Code

Pulumi Automation API exposes the full power of infrastructure as code through a programmatic interface, instead of through CLI commands. Automation API lets you use the Pulumi engine as an SDK, enabling you to create software that can create, update, configure, and destroy infrastructure dynamically. This enables you to build custom cloud interfaces that are tailored to your team, organization, or customers.

[Learn More](/docs/iac/concepts/automation-api/)

## The benefits of using Automation API

##### Programmatic Infrastructure as Code

Use the Pulumi engine as a strongly typed SDK in your application code, enabling it to call functions that can provision and configure infrastructure on any cloud.

##### Scale the distribution of best practices

Codify best practices for cloud infrastructure within custom applications or tools that allow your organization’s developers to easily provision and use approved infrastructure.

##### Build abstractions and custom interfaces

Automation API enables you to build custom cloud interfaces for your technical end users. For example, build self-service developer portals, CLIs, frameworks, and CI/CD workflows.

##### Manage single-tenant deployments at scale

Easily build high-scale, SaaS applications that serve customers with single-tenant instances. Automate creating and managing infrastructure for thousands of unique customers.

## Use Cases

-   ###### [Self-service infrastructure](#self-service)

-   ###### [Single-tenant SaaS instances](#saas)

-   ###### [Workflow Orchestration](#workflow)

-   ###### [Custom Infrastructure Tooling](#tooling)

-   ### Self-service infrastructure

    ##### Overview

    Build developer portals and self-serve platforms that make it easier for your development teams to use cloud infrastructure. Infrastructure and security teams can scale their best practices by creating declarative infrastructure and exposing it behind a REST, gRPC, or Custom Resource API that developers and operators can easily consume, without needing to understand every underlying resource.

    ##### Examples

    Pulumipus’ Self-Service Web App Platform

    This is a self-service interface for creating customized static sites, databases, virtual machines, and more. The code is open source and available on [GitHub](https://github.com/komalali/self-service-platyform).

    Python IaC in your Jupyter notebook

    Use Pulumi’s Python SDK with Automation API to create infrastructure interactively from a Jupyter notebook. Examples are available on [GitHub](https://github.com/pulumi/automation-api-examples/tree/main/python/pulumi_via_jupyter).

    [](/case-studies/sans-institute/)

    SANS Institute provides cybersecurity training and certification. It used Pulumi Automation API to build a self-service platform that enables instructors to provision virtual learning environments using an automated process.

    [Learn More](/case-studies/sans-institute/)

-   ### Single-tenant SaaS instances

    ##### Overview

    Simplify the management of multi-instance SaaS architectures where you need single-tenant infrastructure for each customer. You can create declarative infrastructure defined by your best practices and expose it behind a REST, gRPC, or Custom Resource API that can be consumed by your applications.

    ##### Examples

    Infrastructure as RESTful resources

    This example demonstrates how to run Automation API in an HTTP server to expose infrastructure as RESTful resources. The code is available on GitHub in [Go](https://github.com/pulumi/automation-api-examples/blob/main/go/pulumi_over_http), [Node.js](https://github.com/pulumi/automation-api-examples/blob/main/nodejs/pulumiOverHttp-ts), and [Python](https://github.com/pulumi/automation-api-examples/blob/main/python/pulumi_over_http).

    ![CockroachDB](/logos/customers/cockroach-labs-logo.svg)

    Cockroach Labs provides the CockroachDB database-as-a-service. It uses Pulumi Automation API to manage Kubernetes clusters behind the scenes on behalf of their customers.

-   ### Infrastructure Workflow Orchestration

    ##### Overview

    Manage complicated infrastructure tasks like database migrations, microservice deployments, schema migrations, and more. Distributed systems and microservices incur a significant coordination burden, and dependencies across API boundaries are difficult to track and maintain. With the Automation API, you can use a strongly typed, familiar programming environment to orchestrate multi-stack deployments, codify dependencies, and enable safe incremental deployment.

    ##### Examples

    Database Migration

    This example provisions an AWS Aurora SQL database and executes a database "migration" using the resulting connection info. The code is available on GitHub in [Go](https://github.com/pulumi/automation-api-examples/blob/main/go/database_migration), [Node.js](https://github.com/pulumi/automation-api-examples/blob/main/nodejs/databaseMigration-ts), [Python](https://github.com/pulumi/automation-api-examples/blob/main/python/database_migration), and [.NET](https://github.com/pulumi/automation-api-examples/blob/main/dotnet/DatabaseMigration).

    Multi-Stack Orchestration

    This example shows how to use Automation API to tame the complexity of multiple stacks with dependent stack outputs. The code is available on [GitHub](https://github.com/pulumi/automation-api-examples/blob/main/go/multi_stack_orchestration).

    [![lemonade logo](/fingerprinted/logos/customers/lemonade.81b9ae44e8b4371bb458e2c379e2c85f5d0435ecb6464e295c94232dcb733079.svg)](/case-studies/lemonade/)

    The Automation API allowed Lemonade further automate its deployment process. For example: customizing runners for multi-step provisioning, automating recovery for well-known errors like fixing state for interrupted jobs and managing approvals for sensitive operations like deleting old resources.

    [Learn More](/case-studies/lemonade/)

-   ### Custom Infrastructure Tooling

    ##### Overview

    Build user-friendly infrastructure tooling such as CLIs, higher-level frameworks, CI/CD workflows, and even desktop apps. Infrastructure teams can use Automation API to build self-service tools for building, deploying, and managing infrastructure and offer the right levels of complexity and customization for the tool’s target audience.

    ##### Examples

    Ploy, a CLI in Go

    Ploy is a Heroku-like interface for deploying Docker images to a Kubernetes cluster. Ploy combines Pulumi with a Go CLI using Promptui. It is [open source on GitHub](https://github.com/jaxxstorm/ploy).

    Pulumi GitHub Action for CI/CD

    Pulumi’s GitHub Action is powered by Automation API and it gives you complete control over Pulumi in your CI/CD workflows. [Learn how it was created](/blog/supercharging-our-github-action-with-the-pulumi-automation-api/) or see the [code on GitHub](https://github.com/pulumi/actions).

    [![Mercedes-Benz Research and Development North America](/fingerprinted/logos/customers/mercedes-benz-RDNA_logo_hu_5081c2f0f7dc0d26.f67008168e065b9a15181634fad600d13d92a0c80349c5c93c7af53023ef3aa7.webp)](/case-studies/mercedes-benz/)

    Automation API powers custom infrastructure platforms for organizations like Mercedes-Benz Research & Development North America. These platforms empower their teams to stand up the cloud infrastructure that they need and when they need it.

    [Learn More](/case-studies/mercedes-benz/)

###### Leading engineering organizations are building with Pulumi

![Clearsale](/logos/customers/clearsale-wordmark.svg)

![webflow logo](/fingerprinted/logos/customers/webflow.ea211053359e2269df0e8f987d309eaa73a846f9dfd8043f613f80a491ade3be.svg)

![supabase logo](/fingerprinted/logos/customers/supabase.1ffd73be0a58fc84c53c5093eb7737cb12d4bb14b35a3ad9d92958489b293292.svg)

![snowflake logo](/fingerprinted/logos/customers/snowflake.14b40b364f3d2c7ad689ae0ad8dbcaf21de342f04df6a32f1ab54f96bb59ed6a.svg)

![Atlassian](/fingerprinted/logos/customers/atlassian-wordmark.e3261e2f2208b8f9718191212189fb58217e8197f2732b80a5ce1ba1266cc00c.svg)

![ware2go logo](/fingerprinted/logos/customers/ware2go.69b6aa253067ad08b95da4f6e92416a207b247d8ef446045b80bb1beb253bce5.svg)

![mindbody logo](/fingerprinted/logos/customers/mindbody.414b2c4fe8141f5fcf78153c67fdc17d58e715cab096e9f896b610fd14023f90.svg)

![fenergo logo](/fingerprinted/logos/customers/fenergo.9d91fe9efab387a1cfd4e95a3468629620cee8bac552fbdbf2a2be260cb608c4.svg)

![lemonade logo](/fingerprinted/logos/customers/lemonade.81b9ae44e8b4371bb458e2c379e2c85f5d0435ecb6464e295c94232dcb733079.svg)

![Clearsale](/logos/customers/clearsale-wordmark.svg)

![webflow logo](/fingerprinted/logos/customers/webflow.ea211053359e2269df0e8f987d309eaa73a846f9dfd8043f613f80a491ade3be.svg)

![supabase logo](/fingerprinted/logos/customers/supabase.1ffd73be0a58fc84c53c5093eb7737cb12d4bb14b35a3ad9d92958489b293292.svg)

![snowflake logo](/fingerprinted/logos/customers/snowflake.14b40b364f3d2c7ad689ae0ad8dbcaf21de342f04df6a32f1ab54f96bb59ed6a.svg)

![Atlassian](/fingerprinted/logos/customers/atlassian-wordmark.e3261e2f2208b8f9718191212189fb58217e8197f2732b80a5ce1ba1266cc00c.svg)

![ware2go logo](/fingerprinted/logos/customers/ware2go.69b6aa253067ad08b95da4f6e92416a207b247d8ef446045b80bb1beb253bce5.svg)

#### More Examples

Visit our GitHub repository to see more end-to-end examples of how you can use Automation API.

[View on GitHub](https://github.com/pulumi/automation-api-examples)

#### Workshop

Watch as we build a self-service infrastructure platform with Python and Flask with the Automation API

[Join now](/events/automating-infrastructure-as-code-workflows-with-pulumi/)

## Get started today

To get started with Pulumi Automation API, visit the user guide in our documentation.

[View the Guide](/docs/iac/guides/building-extending/automation-api/)
