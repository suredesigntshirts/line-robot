---
Source: https://www.pulumi.com/registry/packages/aws/
Generated: 2026-06-06
Updated: 2026-06-06
---

# AWS

1.  [Packages](/registry/)
2.  [Packages](/registry/packages/)
3.  [AWS](/registry/packages/aws/)

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

Viewing docs for AWS v7.32.0
published on Friday, May 29, 2026 by Pulumi

[Schema (JSON)](/registry/packages/aws/schema.json)

[pulumi/pulumi-aws](https://github.com/pulumi/pulumi-aws)

v7.32.0 (7.x, latest)v6.83.1 (6.x)v5.43.0 (5.x)

# AWS

Use with AI

-   Copy Page

-
-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2f\))

The Amazon Web Services (AWS) provider for Pulumi can provision many of the cloud resources available in [AWS](https://aws.amazon.com/). It uses the AWS SDK to manage and provision resources.

The AWS provider must be configured with credentials to deploy and update resources in AWS; see [Installation & Configuration](./installation-configuration/) for instructions.

**New to Pulumi and AWS?** [Get started with AWS using our tutorial](/docs/get-started/aws).

## Example

-   TypeScript
-   Python
-   Go
-   C#
-   Java
-   YAML

```typescript
const aws = require("@pulumi/aws");

const bucket = new aws.s3.Bucket("mybucket");
```

```python
import pulumi
import pulumi_aws as aws

bucket = aws.s3.Bucket("bucket")
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/s3"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		_, err := s3.NewBucket(ctx, "bucket", &s3.BucketArgs{})
		if err != nil {
			return err
		}
		return nil
	})
}
```

```csharp
using Pulumi;
using Aws = Pulumi.Aws;

await Deployment.RunAsync(() =>
{
    var bucket = new Aws.S3.Bucket("bucket");
});
```

```java
import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.aws.s3.Bucket;

public class App {
    public static void main(String[] args) {
        Pulumi.run(App::stack);
    }

    private static void stack(Context ctx) {
        final var bucket = new Bucket("my-bucket");
        ctx.export("bucketName", bucket.name());
  }
}
```

```yaml
resources:
  mybucket:
    type: aws:s3:Bucket
outputs:
  bucketName: ${mybucket.name}
```

Visit the [How-to Guides](./how-to-guides) to find step-by-step guides for specific scenarios like creating a serverless application or setting up Athena search.

## Components

Pulumi offers Components that provide simpler interfaces and higher-productivity APIs for many areas of AWS:

-   [Amazon EKS](/registry/packages/eks)
-   [Crosswalk for AWS](/docs/guides/crosswalk/aws), which includes API Gateway, CloudWatch, Elastic Container Registry, Elastic Container Service, Elastic Kubernetes Service, Elastic Load Balancing, Identity & Access Management, Lambda, Virtual Private Cloud, and more

## Migrations

Information about updating the major versions of the AWS Provider, along with any breaking changes that you should be aware of can be found on the following pages:

-   [Migrating to v6.x.x guide](/registry/packages/aws/how-to-guides/6-0-migration/)
-   [Migrating to v7.x.x guide](/registry/packages/aws/how-to-guides/7-0-migration/)

-   Copy Page

-
-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2f\))

#### Try Pulumi Cloud free.
Your team will thank you.

[Start free trial](https://app.pulumi.com/signup?utm_source=registry&utm_medium=right-rail-banner&utm_campaign=try-pulumi-cloud&iaid=docs-try-pulumi-cloud-ad)
