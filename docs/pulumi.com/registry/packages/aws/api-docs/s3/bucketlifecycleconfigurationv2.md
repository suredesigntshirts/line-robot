---
Source: https://www.pulumi.com/registry/packages/aws/api-docs/s3/bucketlifecycleconfigurationv2/
Generated: 2026-06-06
Updated: 2026-06-06
---

# aws.s3.BucketLifecycleConfigurationV2

1.  [Packages](/registry/)
2.  [Packages](/registry/packages/)
3.  [AWS](/registry/packages/aws/)
4.  [API Docs](/registry/packages/aws/api-docs/)
5.  [s3](/registry/packages/aws/api-docs/s3/)
6.  [BucketLifecycleConfigurationV2](/registry/packages/aws/api-docs/s3/bucketlifecycleconfigurationv2/)

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

Viewing docs for AWS v7.32.0
published on Friday, May 29, 2026 by Pulumi

[Schema (JSON)](/registry/packages/aws/schema.json)

[pulumi/pulumi-aws](https://github.com/pulumi/pulumi-aws)

v7.32.0 (7.x, latest)v6.83.1 (6.x)v5.43.0 (5.x)

# aws.s3.BucketLifecycleConfigurationV2[](#aws-s3-bucketlifecycleconfigurationv2)

Explore with Neo

-   Copy Page

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2fs3%2fbucketlifecycleconfigurationv2]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2fs3%2fbucketlifecycleconfigurationv2%2f\))

Deprecated: aws.s3/bucketlifecycleconfigurationv2.BucketLifecycleConfigurationV2 has been deprecated in favor of aws.s3/bucketlifecycleconfiguration.BucketLifecycleConfiguration

Provides an independent configuration resource for S3 bucket [lifecycle configuration](https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lifecycle-mgmt.html).

An S3 Lifecycle configuration consists of one or more Lifecycle rules. Each rule consists of the following:

-   Rule metadata (`id` and `status`)
-   Filter identifying objects to which the rule applies
-   One or more transition or expiration actions

For more information see the Amazon S3 User Guide on [`Lifecycle Configuration Elements`](https://docs.aws.amazon.com/AmazonS3/latest/userguide/intro-lifecycle-rules.html).

> S3 Buckets only support a single lifecycle configuration. Declaring multiple `aws.s3.BucketLifecycleConfiguration` resources to the same S3 Bucket will cause a perpetual difference in configuration.

> Lifecycle configurations may take some time to fully propagate to all AWS S3 systems. Running Pulumi operations shortly after creating a lifecycle configuration may result in changes that affect configuration idempotence. See the Amazon S3 User Guide on [setting lifecycle configuration on a bucket](https://docs.aws.amazon.com/AmazonS3/latest/userguide/how-to-set-lifecycle-configuration-intro.html).

## Example Usage[](#example-usage)

### With neither a filter nor prefix specified[](#with-neither-a-filter-nor-prefix-specified)

When you don’t specify a filter or prefix, the lifecycle rule applies to all objects in the bucket. This has the same effect as setting an empty `filter` element.

-   TypeScript
-   Python
-   Go
-   C#
-   Java
-   YAML
-   HCL PREVIEW

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const example = new aws.s3.BucketLifecycleConfiguration("example", {
    bucket: bucket.bucket,
    rules: [{
        id: "rule-1",
        status: "Enabled",
    }],
});
```

```python
import pulumi
import pulumi_aws as aws

example = aws.s3.BucketLifecycleConfiguration("example",
    bucket=bucket["bucket"],
    rules=[{
        "id": "rule-1",
        "status": "Enabled",
    }])
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/s3"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		_, err := s3.NewBucketLifecycleConfiguration(ctx, "example", &s3.BucketLifecycleConfigurationArgs{
			Bucket: pulumi.Any(bucket.Bucket),
			Rules: s3.BucketLifecycleConfigurationRuleArray{
				&s3.BucketLifecycleConfigurationRuleArgs{
					Id:     pulumi.String("rule-1"),
					Status: pulumi.String("Enabled"),
				},
			},
		})
		if err != nil {
			return err
		}
		return nil
	})
}
```

```csharp
using System.Collections.Generic;
using System.Linq;
using Pulumi;
using Aws = Pulumi.Aws;

return await Deployment.RunAsync(() =>
{
    var example = new Aws.S3.BucketLifecycleConfiguration("example", new()
    {
        Bucket = bucket.Bucket,
        Rules = new[]
        {
            new Aws.S3.Inputs.BucketLifecycleConfigurationRuleArgs
            {
                Id = "rule-1",
                Status = "Enabled",
            },
        },
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.s3.BucketLifecycleConfiguration;
import com.pulumi.aws.s3.BucketLifecycleConfigurationArgs;
import com.pulumi.aws.s3.inputs.BucketLifecycleConfigurationRuleArgs;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Map;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Paths;

public class App {
    public static void main(String[] args) {
        Pulumi.run(App::stack);
    }

    public static void stack(Context ctx) {
        var example = new BucketLifecycleConfiguration("example", BucketLifecycleConfigurationArgs.builder()
            .bucket(bucket.bucket())
            .rules(BucketLifecycleConfigurationRuleArgs.builder()
                .id("rule-1")
                .status("Enabled")
                .build())
            .build());

    }
}
```

```yaml
resources:
  example:
    type: aws:s3:BucketLifecycleConfiguration
    properties:
      bucket: ${bucket.bucket}
      rules:
        - id: rule-1
          status: Enabled
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_s3_bucketlifecycleconfiguration" "example" {
  bucket = bucket.bucket
  rules {
    id     = "rule-1"
    status = "Enabled"
  }
}
```

### Specifying an empty filter[](#specifying-an-empty-filter)

The Lifecycle rule applies to all objects in the bucket.

-   TypeScript
-   Python
-   Go
-   C#
-   Java
-   YAML
-   HCL PREVIEW

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const example = new aws.s3.BucketLifecycleConfiguration("example", {
    bucket: bucket.bucket,
    rules: [{
        id: "rule-1",
        filter: {},
        status: "Enabled",
    }],
});
```

```python
import pulumi
import pulumi_aws as aws

example = aws.s3.BucketLifecycleConfiguration("example",
    bucket=bucket["bucket"],
    rules=[{
        "id": "rule-1",
        "filter": {},
        "status": "Enabled",
    }])
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/s3"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		_, err := s3.NewBucketLifecycleConfiguration(ctx, "example", &s3.BucketLifecycleConfigurationArgs{
			Bucket: pulumi.Any(bucket.Bucket),
			Rules: s3.BucketLifecycleConfigurationRuleArray{
				&s3.BucketLifecycleConfigurationRuleArgs{
					Id:     pulumi.String("rule-1"),
					Filter: &s3.BucketLifecycleConfigurationRuleFilterArgs{},
					Status: pulumi.String("Enabled"),
				},
			},
		})
		if err != nil {
			return err
		}
		return nil
	})
}
```

```csharp
using System.Collections.Generic;
using System.Linq;
using Pulumi;
using Aws = Pulumi.Aws;

return await Deployment.RunAsync(() =>
{
    var example = new Aws.S3.BucketLifecycleConfiguration("example", new()
    {
        Bucket = bucket.Bucket,
        Rules = new[]
        {
            new Aws.S3.Inputs.BucketLifecycleConfigurationRuleArgs
            {
                Id = "rule-1",
                Filter = null,
                Status = "Enabled",
            },
        },
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.s3.BucketLifecycleConfiguration;
import com.pulumi.aws.s3.BucketLifecycleConfigurationArgs;
import com.pulumi.aws.s3.inputs.BucketLifecycleConfigurationRuleArgs;
import com.pulumi.aws.s3.inputs.BucketLifecycleConfigurationRuleFilterArgs;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Map;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Paths;

public class App {
    public static void main(String[] args) {
        Pulumi.run(App::stack);
    }

    public static void stack(Context ctx) {
        var example = new BucketLifecycleConfiguration("example", BucketLifecycleConfigurationArgs.builder()
            .bucket(bucket.bucket())
            .rules(BucketLifecycleConfigurationRuleArgs.builder()
                .id("rule-1")
                .filter(BucketLifecycleConfigurationRuleFilterArgs.builder()
                    .build())
                .status("Enabled")
                .build())
            .build());

    }
}
```

```yaml
resources:
  example:
    type: aws:s3:BucketLifecycleConfiguration
    properties:
      bucket: ${bucket.bucket}
      rules:
        - id: rule-1
          filter: {}
          status: Enabled
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_s3_bucketlifecycleconfiguration" "example" {
  bucket = bucket.bucket
  rules {
    id     = "rule-1"
    filter = {}
    status = "Enabled"
  }
}
```

### Specifying a filter using key prefixes[](#specifying-a-filter-using-key-prefixes)

The Lifecycle rule applies to a subset of objects based on the key name prefix (`logs/`).

-   TypeScript
-   Python
-   Go
-   C#
-   Java
-   YAML
-   HCL PREVIEW

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const example = new aws.s3.BucketLifecycleConfiguration("example", {
    bucket: bucket.bucket,
    rules: [{
        id: "rule-1",
        filter: {
            prefix: "logs/",
        },
        status: "Enabled",
    }],
});
```

```python
import pulumi
import pulumi_aws as aws

example = aws.s3.BucketLifecycleConfiguration("example",
    bucket=bucket["bucket"],
    rules=[{
        "id": "rule-1",
        "filter": {
            "prefix": "logs/",
        },
        "status": "Enabled",
    }])
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/s3"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		_, err := s3.NewBucketLifecycleConfiguration(ctx, "example", &s3.BucketLifecycleConfigurationArgs{
			Bucket: pulumi.Any(bucket.Bucket),
			Rules: s3.BucketLifecycleConfigurationRuleArray{
				&s3.BucketLifecycleConfigurationRuleArgs{
					Id: pulumi.String("rule-1"),
					Filter: &s3.BucketLifecycleConfigurationRuleFilterArgs{
						Prefix: pulumi.String("logs/"),
					},
					Status: pulumi.String("Enabled"),
				},
			},
		})
		if err != nil {
			return err
		}
		return nil
	})
}
```

```csharp
using System.Collections.Generic;
using System.Linq;
using Pulumi;
using Aws = Pulumi.Aws;

return await Deployment.RunAsync(() =>
{
    var example = new Aws.S3.BucketLifecycleConfiguration("example", new()
    {
        Bucket = bucket.Bucket,
        Rules = new[]
        {
            new Aws.S3.Inputs.BucketLifecycleConfigurationRuleArgs
            {
                Id = "rule-1",
                Filter = new Aws.S3.Inputs.BucketLifecycleConfigurationRuleFilterArgs
                {
                    Prefix = "logs/",
                },
                Status = "Enabled",
            },
        },
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.s3.BucketLifecycleConfiguration;
import com.pulumi.aws.s3.BucketLifecycleConfigurationArgs;
import com.pulumi.aws.s3.inputs.BucketLifecycleConfigurationRuleArgs;
import com.pulumi.aws.s3.inputs.BucketLifecycleConfigurationRuleFilterArgs;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Map;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Paths;

public class App {
    public static void main(String[] args) {
        Pulumi.run(App::stack);
    }

    public static void stack(Context ctx) {
        var example = new BucketLifecycleConfiguration("example", BucketLifecycleConfigurationArgs.builder()
            .bucket(bucket.bucket())
            .rules(BucketLifecycleConfigurationRuleArgs.builder()
                .id("rule-1")
                .filter(BucketLifecycleConfigurationRuleFilterArgs.builder()
                    .prefix("logs/")
                    .build())
                .status("Enabled")
                .build())
            .build());

    }
}
```

```yaml
resources:
  example:
    type: aws:s3:BucketLifecycleConfiguration
    properties:
      bucket: ${bucket.bucket}
      rules:
        - id: rule-1
          filter:
            prefix: logs/
          status: Enabled
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_s3_bucketlifecycleconfiguration" "example" {
  bucket = bucket.bucket
  rules {
    id = "rule-1"
    filter = {
      prefix = "logs/"
    }
    status = "Enabled"
  }
}
```

If you want to apply a Lifecycle action to a subset of objects based on different key name prefixes, specify separate rules.

-   TypeScript
-   Python
-   Go
-   C#
-   Java
-   YAML
-   HCL PREVIEW

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const example = new aws.s3.BucketLifecycleConfiguration("example", {
    bucket: bucket.bucket,
    rules: [
        {
            id: "rule-1",
            filter: {
                prefix: "logs/",
            },
            status: "Enabled",
        },
        {
            id: "rule-2",
            filter: {
                prefix: "tmp/",
            },
            status: "Enabled",
        },
    ],
});
```

```python
import pulumi
import pulumi_aws as aws

example = aws.s3.BucketLifecycleConfiguration("example",
    bucket=bucket["bucket"],
    rules=[
        {
            "id": "rule-1",
            "filter": {
                "prefix": "logs/",
            },
            "status": "Enabled",
        },
        {
            "id": "rule-2",
            "filter": {
                "prefix": "tmp/",
            },
            "status": "Enabled",
        },
    ])
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/s3"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		_, err := s3.NewBucketLifecycleConfiguration(ctx, "example", &s3.BucketLifecycleConfigurationArgs{
			Bucket: pulumi.Any(bucket.Bucket),
			Rules: s3.BucketLifecycleConfigurationRuleArray{
				&s3.BucketLifecycleConfigurationRuleArgs{
					Id: pulumi.String("rule-1"),
					Filter: &s3.BucketLifecycleConfigurationRuleFilterArgs{
						Prefix: pulumi.String("logs/"),
					},
					Status: pulumi.String("Enabled"),
				},
				&s3.BucketLifecycleConfigurationRuleArgs{
					Id: pulumi.String("rule-2"),
					Filter: &s3.BucketLifecycleConfigurationRuleFilterArgs{
						Prefix: pulumi.String("tmp/"),
					},
					Status: pulumi.String("Enabled"),
				},
			},
		})
		if err != nil {
			return err
		}
		return nil
	})
}
```

```csharp
using System.Collections.Generic;
using System.Linq;
using Pulumi;
using Aws = Pulumi.Aws;

return await Deployment.RunAsync(() =>
{
    var example = new Aws.S3.BucketLifecycleConfiguration("example", new()
    {
        Bucket = bucket.Bucket,
        Rules = new[]
        {
            new Aws.S3.Inputs.BucketLifecycleConfigurationRuleArgs
            {
                Id = "rule-1",
                Filter = new Aws.S3.Inputs.BucketLifecycleConfigurationRuleFilterArgs
                {
                    Prefix = "logs/",
                },
                Status = "Enabled",
            },
            new Aws.S3.Inputs.BucketLifecycleConfigurationRuleArgs
            {
                Id = "rule-2",
                Filter = new Aws.S3.Inputs.BucketLifecycleConfigurationRuleFilterArgs
                {
                    Prefix = "tmp/",
                },
                Status = "Enabled",
            },
        },
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.s3.BucketLifecycleConfiguration;
import com.pulumi.aws.s3.BucketLifecycleConfigurationArgs;
import com.pulumi.aws.s3.inputs.BucketLifecycleConfigurationRuleArgs;
import com.pulumi.aws.s3.inputs.BucketLifecycleConfigurationRuleFilterArgs;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Map;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Paths;

public class App {
    public static void main(String[] args) {
        Pulumi.run(App::stack);
    }

    public static void stack(Context ctx) {
        var example = new BucketLifecycleConfiguration("example", BucketLifecycleConfigurationArgs.builder()
            .bucket(bucket.bucket())
            .rules(
                BucketLifecycleConfigurationRuleArgs.builder()
                    .id("rule-1")
                    .filter(BucketLifecycleConfigurationRuleFilterArgs.builder()
                        .prefix("logs/")
                        .build())
                    .status("Enabled")
                    .build(),
                BucketLifecycleConfigurationRuleArgs.builder()
                    .id("rule-2")
                    .filter(BucketLifecycleConfigurationRuleFilterArgs.builder()
                        .prefix("tmp/")
                        .build())
                    .status("Enabled")
                    .build())
            .build());

    }
}
```

```yaml
resources:
  example:
    type: aws:s3:BucketLifecycleConfiguration
    properties:
      bucket: ${bucket.bucket}
      rules:
        - id: rule-1
          filter:
            prefix: logs/
          status: Enabled
        - id: rule-2
          filter:
            prefix: tmp/
          status: Enabled
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_s3_bucketlifecycleconfiguration" "example" {
  bucket = bucket.bucket
  rules {
    id = "rule-1"
    filter = {
      prefix = "logs/"
    }
    status = "Enabled"
  }
  rules {
    id = "rule-2"
    filter = {
      prefix = "tmp/"
    }
    status = "Enabled"
  }
}
```

### Specifying a filter based on an object tag[](#specifying-a-filter-based-on-an-object-tag)

The Lifecycle rule specifies a filter based on a tag key and value. The rule then applies only to a subset of objects with the specific tag.

-   TypeScript
-   Python
-   Go
-   C#
-   Java
-   YAML
-   HCL PREVIEW

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const example = new aws.s3.BucketLifecycleConfiguration("example", {
    bucket: bucket.bucket,
    rules: [{
        id: "rule-1",
        filter: {
            tag: {
                key: "Name",
                value: "Staging",
            },
        },
        status: "Enabled",
    }],
});
```

```python
import pulumi
import pulumi_aws as aws

example = aws.s3.BucketLifecycleConfiguration("example",
    bucket=bucket["bucket"],
    rules=[{
        "id": "rule-1",
        "filter": {
            "tag": {
                "key": "Name",
                "value": "Staging",
            },
        },
        "status": "Enabled",
    }])
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/s3"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		_, err := s3.NewBucketLifecycleConfiguration(ctx, "example", &s3.BucketLifecycleConfigurationArgs{
			Bucket: pulumi.Any(bucket.Bucket),
			Rules: s3.BucketLifecycleConfigurationRuleArray{
				&s3.BucketLifecycleConfigurationRuleArgs{
					Id: pulumi.String("rule-1"),
					Filter: &s3.BucketLifecycleConfigurationRuleFilterArgs{
						Tag: &s3.BucketLifecycleConfigurationRuleFilterTagArgs{
							Key:   pulumi.String("Name"),
							Value: pulumi.String("Staging"),
						},
					},
					Status: pulumi.String("Enabled"),
				},
			},
		})
		if err != nil {
			return err
		}
		return nil
	})
}
```

```csharp
using System.Collections.Generic;
using System.Linq;
using Pulumi;
using Aws = Pulumi.Aws;

return await Deployment.RunAsync(() =>
{
    var example = new Aws.S3.BucketLifecycleConfiguration("example", new()
    {
        Bucket = bucket.Bucket,
        Rules = new[]
        {
            new Aws.S3.Inputs.BucketLifecycleConfigurationRuleArgs
            {
                Id = "rule-1",
                Filter = new Aws.S3.Inputs.BucketLifecycleConfigurationRuleFilterArgs
                {
                    Tag = new Aws.S3.Inputs.BucketLifecycleConfigurationRuleFilterTagArgs
                    {
                        Key = "Name",
                        Value = "Staging",
                    },
                },
                Status = "Enabled",
            },
        },
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.s3.BucketLifecycleConfiguration;
import com.pulumi.aws.s3.BucketLifecycleConfigurationArgs;
import com.pulumi.aws.s3.inputs.BucketLifecycleConfigurationRuleArgs;
import com.pulumi.aws.s3.inputs.BucketLifecycleConfigurationRuleFilterArgs;
import com.pulumi.aws.s3.inputs.BucketLifecycleConfigurationRuleFilterTagArgs;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Map;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Paths;

public class App {
    public static void main(String[] args) {
        Pulumi.run(App::stack);
    }

    public static void stack(Context ctx) {
        var example = new BucketLifecycleConfiguration("example", BucketLifecycleConfigurationArgs.builder()
            .bucket(bucket.bucket())
            .rules(BucketLifecycleConfigurationRuleArgs.builder()
                .id("rule-1")
                .filter(BucketLifecycleConfigurationRuleFilterArgs.builder()
                    .tag(BucketLifecycleConfigurationRuleFilterTagArgs.builder()
                        .key("Name")
                        .value("Staging")
                        .build())
                    .build())
                .status("Enabled")
                .build())
            .build());

    }
}
```

```yaml
resources:
  example:
    type: aws:s3:BucketLifecycleConfiguration
    properties:
      bucket: ${bucket.bucket}
      rules:
        - id: rule-1
          filter:
            tag:
              key: Name
              value: Staging
          status: Enabled
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_s3_bucketlifecycleconfiguration" "example" {
  bucket = bucket.bucket
  rules {
    id = "rule-1"
    filter = {
      tag = {
        key   = "Name"
        value = "Staging"
      }
    }
    status = "Enabled"
  }
}
```

### Specifying a filter based on multiple tags[](#specifying-a-filter-based-on-multiple-tags)

The Lifecycle rule directs Amazon S3 to perform lifecycle actions on objects with two tags (with the specific tag keys and values). Notice `tags` is wrapped in the `and` configuration block.

-   TypeScript
-   Python
-   Go
-   C#
-   Java
-   YAML
-   HCL PREVIEW

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const example = new aws.s3.BucketLifecycleConfiguration("example", {
    bucket: bucket.bucket,
    rules: [{
        id: "rule-1",
        filter: {
            and: {
                tags: {
                    Key1: "Value1",
                    Key2: "Value2",
                },
            },
        },
        status: "Enabled",
    }],
});
```

```python
import pulumi
import pulumi_aws as aws

example = aws.s3.BucketLifecycleConfiguration("example",
    bucket=bucket["bucket"],
    rules=[{
        "id": "rule-1",
        "filter": {
            "and_": {
                "tags": {
                    "Key1": "Value1",
                    "Key2": "Value2",
                },
            },
        },
        "status": "Enabled",
    }])
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/s3"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		_, err := s3.NewBucketLifecycleConfiguration(ctx, "example", &s3.BucketLifecycleConfigurationArgs{
			Bucket: pulumi.Any(bucket.Bucket),
			Rules: s3.BucketLifecycleConfigurationRuleArray{
				&s3.BucketLifecycleConfigurationRuleArgs{
					Id: pulumi.String("rule-1"),
					Filter: &s3.BucketLifecycleConfigurationRuleFilterArgs{
						And: &s3.BucketLifecycleConfigurationRuleFilterAndArgs{
							Tags: pulumi.StringMap{
								"Key1": pulumi.String("Value1"),
								"Key2": pulumi.String("Value2"),
							},
						},
					},
					Status: pulumi.String("Enabled"),
				},
			},
		})
		if err != nil {
			return err
		}
		return nil
	})
}
```

```csharp
using System.Collections.Generic;
using System.Linq;
using Pulumi;
using Aws = Pulumi.Aws;

return await Deployment.RunAsync(() =>
{
    var example = new Aws.S3.BucketLifecycleConfiguration("example", new()
    {
        Bucket = bucket.Bucket,
        Rules = new[]
        {
            new Aws.S3.Inputs.BucketLifecycleConfigurationRuleArgs
            {
                Id = "rule-1",
                Filter = new Aws.S3.Inputs.BucketLifecycleConfigurationRuleFilterArgs
                {
                    And = new Aws.S3.Inputs.BucketLifecycleConfigurationRuleFilterAndArgs
                    {
                        Tags =
                        {
                            { "Key1", "Value1" },
                            { "Key2", "Value2" },
                        },
                    },
                },
                Status = "Enabled",
            },
        },
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.s3.BucketLifecycleConfiguration;
import com.pulumi.aws.s3.BucketLifecycleConfigurationArgs;
import com.pulumi.aws.s3.inputs.BucketLifecycleConfigurationRuleArgs;
import com.pulumi.aws.s3.inputs.BucketLifecycleConfigurationRuleFilterArgs;
import com.pulumi.aws.s3.inputs.BucketLifecycleConfigurationRuleFilterAndArgs;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Map;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Paths;

public class App {
    public static void main(String[] args) {
        Pulumi.run(App::stack);
    }

    public static void stack(Context ctx) {
        var example = new BucketLifecycleConfiguration("example", BucketLifecycleConfigurationArgs.builder()
            .bucket(bucket.bucket())
            .rules(BucketLifecycleConfigurationRuleArgs.builder()
                .id("rule-1")
                .filter(BucketLifecycleConfigurationRuleFilterArgs.builder()
                    .and(BucketLifecycleConfigurationRuleFilterAndArgs.builder()
                        .tags(Map.ofEntries(
                            Map.entry("Key1", "Value1"),
                            Map.entry("Key2", "Value2")
                        ))
                        .build())
                    .build())
                .status("Enabled")
                .build())
            .build());

    }
}
```

```yaml
resources:
  example:
    type: aws:s3:BucketLifecycleConfiguration
    properties:
      bucket: ${bucket.bucket}
      rules:
        - id: rule-1
          filter:
            and:
              tags:
                Key1: Value1
                Key2: Value2
          status: Enabled
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_s3_bucketlifecycleconfiguration" "example" {
  bucket = bucket.bucket
  rules {
    id = "rule-1"
    filter = {
      and = {
        tags = {
          "Key1" = "Value1"
          "Key2" = "Value2"
        }
      }
    }
    status = "Enabled"
  }
}
```

### Specifying a filter based on both prefix and one or more tags[](#specifying-a-filter-based-on-both-prefix-and-one-or-more-tags)

The Lifecycle rule directs Amazon S3 to perform lifecycle actions on objects with the specified prefix and two tags (with the specific tag keys and values). Notice both `prefix` and `tags` are wrapped in the `and` configuration block.

-   TypeScript
-   Python
-   Go
-   C#
-   Java
-   YAML
-   HCL PREVIEW

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const example = new aws.s3.BucketLifecycleConfiguration("example", {
    bucket: bucket.bucket,
    rules: [{
        id: "rule-1",
        filter: {
            and: {
                prefix: "logs/",
                tags: {
                    Key1: "Value1",
                    Key2: "Value2",
                },
            },
        },
        status: "Enabled",
    }],
});
```

```python
import pulumi
import pulumi_aws as aws

example = aws.s3.BucketLifecycleConfiguration("example",
    bucket=bucket["bucket"],
    rules=[{
        "id": "rule-1",
        "filter": {
            "and_": {
                "prefix": "logs/",
                "tags": {
                    "Key1": "Value1",
                    "Key2": "Value2",
                },
            },
        },
        "status": "Enabled",
    }])
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/s3"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		_, err := s3.NewBucketLifecycleConfiguration(ctx, "example", &s3.BucketLifecycleConfigurationArgs{
			Bucket: pulumi.Any(bucket.Bucket),
			Rules: s3.BucketLifecycleConfigurationRuleArray{
				&s3.BucketLifecycleConfigurationRuleArgs{
					Id: pulumi.String("rule-1"),
					Filter: &s3.BucketLifecycleConfigurationRuleFilterArgs{
						And: &s3.BucketLifecycleConfigurationRuleFilterAndArgs{
							Prefix: pulumi.String("logs/"),
							Tags: pulumi.StringMap{
								"Key1": pulumi.String("Value1"),
								"Key2": pulumi.String("Value2"),
							},
						},
					},
					Status: pulumi.String("Enabled"),
				},
			},
		})
		if err != nil {
			return err
		}
		return nil
	})
}
```

```csharp
using System.Collections.Generic;
using System.Linq;
using Pulumi;
using Aws = Pulumi.Aws;

return await Deployment.RunAsync(() =>
{
    var example = new Aws.S3.BucketLifecycleConfiguration("example", new()
    {
        Bucket = bucket.Bucket,
        Rules = new[]
        {
            new Aws.S3.Inputs.BucketLifecycleConfigurationRuleArgs
            {
                Id = "rule-1",
                Filter = new Aws.S3.Inputs.BucketLifecycleConfigurationRuleFilterArgs
                {
                    And = new Aws.S3.Inputs.BucketLifecycleConfigurationRuleFilterAndArgs
                    {
                        Prefix = "logs/",
                        Tags =
                        {
                            { "Key1", "Value1" },
                            { "Key2", "Value2" },
                        },
                    },
                },
                Status = "Enabled",
            },
        },
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.s3.BucketLifecycleConfiguration;
import com.pulumi.aws.s3.BucketLifecycleConfigurationArgs;
import com.pulumi.aws.s3.inputs.BucketLifecycleConfigurationRuleArgs;
import com.pulumi.aws.s3.inputs.BucketLifecycleConfigurationRuleFilterArgs;
import com.pulumi.aws.s3.inputs.BucketLifecycleConfigurationRuleFilterAndArgs;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Map;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Paths;

public class App {
    public static void main(String[] args) {
        Pulumi.run(App::stack);
    }

    public static void stack(Context ctx) {
        var example = new BucketLifecycleConfiguration("example", BucketLifecycleConfigurationArgs.builder()
            .bucket(bucket.bucket())
            .rules(BucketLifecycleConfigurationRuleArgs.builder()
                .id("rule-1")
                .filter(BucketLifecycleConfigurationRuleFilterArgs.builder()
                    .and(BucketLifecycleConfigurationRuleFilterAndArgs.builder()
                        .prefix("logs/")
                        .tags(Map.ofEntries(
                            Map.entry("Key1", "Value1"),
                            Map.entry("Key2", "Value2")
                        ))
                        .build())
                    .build())
                .status("Enabled")
                .build())
            .build());

    }
}
```

```yaml
resources:
  example:
    type: aws:s3:BucketLifecycleConfiguration
    properties:
      bucket: ${bucket.bucket}
      rules:
        - id: rule-1
          filter:
            and:
              prefix: logs/
              tags:
                Key1: Value1
                Key2: Value2
          status: Enabled
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_s3_bucketlifecycleconfiguration" "example" {
  bucket = bucket.bucket
  rules {
    id = "rule-1"
    filter = {
      and = {
        prefix = "logs/"
        tags = {
          "Key1" = "Value1"
          "Key2" = "Value2"
        }
      }
    }
    status = "Enabled"
  }
}
```

### Specifying a filter based on object size[](#specifying-a-filter-based-on-object-size)

Object size values are in bytes. Maximum filter size is 5TB. Amazon S3 applies a default behavior to your Lifecycle configuration that prevents objects smaller than 128 KB from being transitioned to any storage class. You can allow smaller objects to transition by adding a minimum size (`objectSizeGreaterThan`) or a maximum size (`objectSizeLessThan`) filter that specifies a smaller size to the configuration. This example allows any object smaller than 128 KB to transition to the S3 Glacier Instant Retrieval storage class:

-   TypeScript
-   Python
-   Go
-   C#
-   Java
-   YAML
-   HCL PREVIEW

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const example = new aws.s3.BucketLifecycleConfiguration("example", {
    bucket: bucket.bucket,
    rules: [{
        id: "Allow small object transitions",
        filter: {
            objectSizeGreaterThan: 1,
        },
        status: "Enabled",
        transitions: [{
            days: 365,
            storageClass: "GLACIER_IR",
        }],
    }],
});
```

```python
import pulumi
import pulumi_aws as aws

example = aws.s3.BucketLifecycleConfiguration("example",
    bucket=bucket["bucket"],
    rules=[{
        "id": "Allow small object transitions",
        "filter": {
            "object_size_greater_than": 1,
        },
        "status": "Enabled",
        "transitions": [{
            "days": 365,
            "storage_class": "GLACIER_IR",
        }],
    }])
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/s3"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		_, err := s3.NewBucketLifecycleConfiguration(ctx, "example", &s3.BucketLifecycleConfigurationArgs{
			Bucket: pulumi.Any(bucket.Bucket),
			Rules: s3.BucketLifecycleConfigurationRuleArray{
				&s3.BucketLifecycleConfigurationRuleArgs{
					Id: pulumi.String("Allow small object transitions"),
					Filter: &s3.BucketLifecycleConfigurationRuleFilterArgs{
						ObjectSizeGreaterThan: pulumi.Int(1),
					},
					Status: pulumi.String("Enabled"),
					Transitions: s3.BucketLifecycleConfigurationRuleTransitionArray{
						&s3.BucketLifecycleConfigurationRuleTransitionArgs{
							Days:         pulumi.Int(365),
							StorageClass: pulumi.String("GLACIER_IR"),
						},
					},
				},
			},
		})
		if err != nil {
			return err
		}
		return nil
	})
}
```

```csharp
using System.Collections.Generic;
using System.Linq;
using Pulumi;
using Aws = Pulumi.Aws;

return await Deployment.RunAsync(() =>
{
    var example = new Aws.S3.BucketLifecycleConfiguration("example", new()
    {
        Bucket = bucket.Bucket,
        Rules = new[]
        {
            new Aws.S3.Inputs.BucketLifecycleConfigurationRuleArgs
            {
                Id = "Allow small object transitions",
                Filter = new Aws.S3.Inputs.BucketLifecycleConfigurationRuleFilterArgs
                {
                    ObjectSizeGreaterThan = 1,
                },
                Status = "Enabled",
                Transitions = new[]
                {
                    new Aws.S3.Inputs.BucketLifecycleConfigurationRuleTransitionArgs
                    {
                        Days = 365,
                        StorageClass = "GLACIER_IR",
                    },
                },
            },
        },
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.s3.BucketLifecycleConfiguration;
import com.pulumi.aws.s3.BucketLifecycleConfigurationArgs;
import com.pulumi.aws.s3.inputs.BucketLifecycleConfigurationRuleArgs;
import com.pulumi.aws.s3.inputs.BucketLifecycleConfigurationRuleFilterArgs;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Map;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Paths;

public class App {
    public static void main(String[] args) {
        Pulumi.run(App::stack);
    }

    public static void stack(Context ctx) {
        var example = new BucketLifecycleConfiguration("example", BucketLifecycleConfigurationArgs.builder()
            .bucket(bucket.bucket())
            .rules(BucketLifecycleConfigurationRuleArgs.builder()
                .id("Allow small object transitions")
                .filter(BucketLifecycleConfigurationRuleFilterArgs.builder()
                    .objectSizeGreaterThan(1)
                    .build())
                .status("Enabled")
                .transitions(BucketLifecycleConfigurationRuleTransitionArgs.builder()
                    .days(365)
                    .storageClass("GLACIER_IR")
                    .build())
                .build())
            .build());

    }
}
```

```yaml
resources:
  example:
    type: aws:s3:BucketLifecycleConfiguration
    properties:
      bucket: ${bucket.bucket}
      rules:
        - id: Allow small object transitions
          filter:
            objectSizeGreaterThan: 1
          status: Enabled
          transitions:
            - days: 365
              storageClass: GLACIER_IR
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_s3_bucketlifecycleconfiguration" "example" {
  bucket = bucket.bucket
  rules {
    id = "Allow small object transitions"
    filter = {
      object_size_greater_than = 1
    }
    status = "Enabled"
    transitions {
      days          = 365
      storage_class = "GLACIER_IR"
    }
  }
}
```

### Specifying a filter based on object size range and prefix[](#specifying-a-filter-based-on-object-size-range-and-prefix)

The `objectSizeGreaterThan` must be less than the `objectSizeLessThan`. Notice both the object size range and prefix are wrapped in the `and` configuration block.

-   TypeScript
-   Python
-   Go
-   C#
-   Java
-   YAML
-   HCL PREVIEW

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const example = new aws.s3.BucketLifecycleConfiguration("example", {
    bucket: bucket.bucket,
    rules: [{
        id: "rule-1",
        filter: {
            and: {
                prefix: "logs/",
                objectSizeGreaterThan: 500,
                objectSizeLessThan: 64000,
            },
        },
        status: "Enabled",
    }],
});
```

```python
import pulumi
import pulumi_aws as aws

example = aws.s3.BucketLifecycleConfiguration("example",
    bucket=bucket["bucket"],
    rules=[{
        "id": "rule-1",
        "filter": {
            "and_": {
                "prefix": "logs/",
                "object_size_greater_than": 500,
                "object_size_less_than": 64000,
            },
        },
        "status": "Enabled",
    }])
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/s3"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		_, err := s3.NewBucketLifecycleConfiguration(ctx, "example", &s3.BucketLifecycleConfigurationArgs{
			Bucket: pulumi.Any(bucket.Bucket),
			Rules: s3.BucketLifecycleConfigurationRuleArray{
				&s3.BucketLifecycleConfigurationRuleArgs{
					Id: pulumi.String("rule-1"),
					Filter: &s3.BucketLifecycleConfigurationRuleFilterArgs{
						And: &s3.BucketLifecycleConfigurationRuleFilterAndArgs{
							Prefix:                pulumi.String("logs/"),
							ObjectSizeGreaterThan: pulumi.Int(500),
							ObjectSizeLessThan:    pulumi.Int(64000),
						},
					},
					Status: pulumi.String("Enabled"),
				},
			},
		})
		if err != nil {
			return err
		}
		return nil
	})
}
```

```csharp
using System.Collections.Generic;
using System.Linq;
using Pulumi;
using Aws = Pulumi.Aws;

return await Deployment.RunAsync(() =>
{
    var example = new Aws.S3.BucketLifecycleConfiguration("example", new()
    {
        Bucket = bucket.Bucket,
        Rules = new[]
        {
            new Aws.S3.Inputs.BucketLifecycleConfigurationRuleArgs
            {
                Id = "rule-1",
                Filter = new Aws.S3.Inputs.BucketLifecycleConfigurationRuleFilterArgs
                {
                    And = new Aws.S3.Inputs.BucketLifecycleConfigurationRuleFilterAndArgs
                    {
                        Prefix = "logs/",
                        ObjectSizeGreaterThan = 500,
                        ObjectSizeLessThan = 64000,
                    },
                },
                Status = "Enabled",
            },
        },
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.s3.BucketLifecycleConfiguration;
import com.pulumi.aws.s3.BucketLifecycleConfigurationArgs;
import com.pulumi.aws.s3.inputs.BucketLifecycleConfigurationRuleArgs;
import com.pulumi.aws.s3.inputs.BucketLifecycleConfigurationRuleFilterArgs;
import com.pulumi.aws.s3.inputs.BucketLifecycleConfigurationRuleFilterAndArgs;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Map;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Paths;

public class App {
    public static void main(String[] args) {
        Pulumi.run(App::stack);
    }

    public static void stack(Context ctx) {
        var example = new BucketLifecycleConfiguration("example", BucketLifecycleConfigurationArgs.builder()
            .bucket(bucket.bucket())
            .rules(BucketLifecycleConfigurationRuleArgs.builder()
                .id("rule-1")
                .filter(BucketLifecycleConfigurationRuleFilterArgs.builder()
                    .and(BucketLifecycleConfigurationRuleFilterAndArgs.builder()
                        .prefix("logs/")
                        .objectSizeGreaterThan(500)
                        .objectSizeLessThan(64000)
                        .build())
                    .build())
                .status("Enabled")
                .build())
            .build());

    }
}
```

```yaml
resources:
  example:
    type: aws:s3:BucketLifecycleConfiguration
    properties:
      bucket: ${bucket.bucket}
      rules:
        - id: rule-1
          filter:
            and:
              prefix: logs/
              objectSizeGreaterThan: 500
              objectSizeLessThan: 64000
          status: Enabled
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_s3_bucketlifecycleconfiguration" "example" {
  bucket = bucket.bucket
  rules {
    id = "rule-1"
    filter = {
      and = {
        prefix                   = "logs/"
        object_size_greater_than = 500
        object_size_less_than    = 64000
      }
    }
    status = "Enabled"
  }
}
```

### Creating a Lifecycle Configuration for a bucket with versioning[](#creating-a-lifecycle-configuration-for-a-bucket-with-versioning)

-   TypeScript
-   Python
-   Go
-   C#
-   Java
-   YAML
-   HCL PREVIEW

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const bucket = new aws.s3.Bucket("bucket", {bucket: "my-bucket"});
const bucketAcl = new aws.s3.BucketAcl("bucket_acl", {
    bucket: bucket.bucket,
    acl: "private",
});
const bucket_config = new aws.s3.BucketLifecycleConfiguration("bucket-config", {
    bucket: bucket.bucket,
    rules: [
        {
            id: "log",
            expiration: {
                days: 90,
            },
            filter: {
                and: {
                    prefix: "log/",
                    tags: {
                        rule: "log",
                        autoclean: "true",
                    },
                },
            },
            status: "Enabled",
            transitions: [
                {
                    days: 30,
                    storageClass: "STANDARD_IA",
                },
                {
                    days: 60,
                    storageClass: "GLACIER",
                },
            ],
        },
        {
            id: "tmp",
            filter: {
                prefix: "tmp/",
            },
            expiration: {
                date: "2023-01-13T00:00:00Z",
            },
            status: "Enabled",
        },
    ],
});
const versioningBucket = new aws.s3.Bucket("versioning_bucket", {bucket: "my-versioning-bucket"});
const versioningBucketAcl = new aws.s3.BucketAcl("versioning_bucket_acl", {
    bucket: versioningBucket.bucket,
    acl: "private",
});
const versioning = new aws.s3.BucketVersioning("versioning", {
    bucket: versioningBucket.bucket,
    versioningConfiguration: {
        status: "Enabled",
    },
});
const versioning_bucket_config = new aws.s3.BucketLifecycleConfiguration("versioning-bucket-config", {
    bucket: versioningBucket.bucket,
    rules: [{
        id: "config",
        filter: {
            prefix: "config/",
        },
        noncurrentVersionExpiration: {
            noncurrentDays: 90,
        },
        noncurrentVersionTransitions: [
            {
                noncurrentDays: 30,
                storageClass: "STANDARD_IA",
            },
            {
                noncurrentDays: 60,
                storageClass: "GLACIER",
            },
        ],
        status: "Enabled",
    }],
}, {
    dependsOn: [versioning],
});
```

```python
import pulumi
import pulumi_aws as aws

bucket = aws.s3.Bucket("bucket", bucket="my-bucket")
bucket_acl = aws.s3.BucketAcl("bucket_acl",
    bucket=bucket.bucket,
    acl="private")
bucket_config = aws.s3.BucketLifecycleConfiguration("bucket-config",
    bucket=bucket.bucket,
    rules=[
        {
            "id": "log",
            "expiration": {
                "days": 90,
            },
            "filter": {
                "and_": {
                    "prefix": "log/",
                    "tags": {
                        "rule": "log",
                        "autoclean": "true",
                    },
                },
            },
            "status": "Enabled",
            "transitions": [
                {
                    "days": 30,
                    "storage_class": "STANDARD_IA",
                },
                {
                    "days": 60,
                    "storage_class": "GLACIER",
                },
            ],
        },
        {
            "id": "tmp",
            "filter": {
                "prefix": "tmp/",
            },
            "expiration": {
                "date": "2023-01-13T00:00:00Z",
            },
            "status": "Enabled",
        },
    ])
versioning_bucket = aws.s3.Bucket("versioning_bucket", bucket="my-versioning-bucket")
versioning_bucket_acl = aws.s3.BucketAcl("versioning_bucket_acl",
    bucket=versioning_bucket.bucket,
    acl="private")
versioning = aws.s3.BucketVersioning("versioning",
    bucket=versioning_bucket.bucket,
    versioning_configuration={
        "status": "Enabled",
    })
versioning_bucket_config = aws.s3.BucketLifecycleConfiguration("versioning-bucket-config",
    bucket=versioning_bucket.bucket,
    rules=[{
        "id": "config",
        "filter": {
            "prefix": "config/",
        },
        "noncurrent_version_expiration": {
            "noncurrent_days": 90,
        },
        "noncurrent_version_transitions": [
            {
                "noncurrent_days": 30,
                "storage_class": "STANDARD_IA",
            },
            {
                "noncurrent_days": 60,
                "storage_class": "GLACIER",
            },
        ],
        "status": "Enabled",
    }],
    opts = pulumi.ResourceOptions(depends_on=[versioning]))
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/s3"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		bucket, err := s3.NewBucket(ctx, "bucket", &s3.BucketArgs{
			Bucket: pulumi.String("my-bucket"),
		})
		if err != nil {
			return err
		}
		_, err = s3.NewBucketAcl(ctx, "bucket_acl", &s3.BucketAclArgs{
			Bucket: bucket.Bucket,
			Acl:    pulumi.String("private"),
		})
		if err != nil {
			return err
		}
		_, err = s3.NewBucketLifecycleConfiguration(ctx, "bucket-config", &s3.BucketLifecycleConfigurationArgs{
			Bucket: bucket.Bucket,
			Rules: s3.BucketLifecycleConfigurationRuleArray{
				&s3.BucketLifecycleConfigurationRuleArgs{
					Id: pulumi.String("log"),
					Expiration: &s3.BucketLifecycleConfigurationRuleExpirationArgs{
						Days: pulumi.Int(90),
					},
					Filter: &s3.BucketLifecycleConfigurationRuleFilterArgs{
						And: &s3.BucketLifecycleConfigurationRuleFilterAndArgs{
							Prefix: pulumi.String("log/"),
							Tags: pulumi.StringMap{
								"rule":      pulumi.String("log"),
								"autoclean": pulumi.String("true"),
							},
						},
					},
					Status: pulumi.String("Enabled"),
					Transitions: s3.BucketLifecycleConfigurationRuleTransitionArray{
						&s3.BucketLifecycleConfigurationRuleTransitionArgs{
							Days:         pulumi.Int(30),
							StorageClass: pulumi.String("STANDARD_IA"),
						},
						&s3.BucketLifecycleConfigurationRuleTransitionArgs{
							Days:         pulumi.Int(60),
							StorageClass: pulumi.String("GLACIER"),
						},
					},
				},
				&s3.BucketLifecycleConfigurationRuleArgs{
					Id: pulumi.String("tmp"),
					Filter: &s3.BucketLifecycleConfigurationRuleFilterArgs{
						Prefix: pulumi.String("tmp/"),
					},
					Expiration: &s3.BucketLifecycleConfigurationRuleExpirationArgs{
						Date: pulumi.String("2023-01-13T00:00:00Z"),
					},
					Status: pulumi.String("Enabled"),
				},
			},
		})
		if err != nil {
			return err
		}
		versioningBucket, err := s3.NewBucket(ctx, "versioning_bucket", &s3.BucketArgs{
			Bucket: pulumi.String("my-versioning-bucket"),
		})
		if err != nil {
			return err
		}
		_, err = s3.NewBucketAcl(ctx, "versioning_bucket_acl", &s3.BucketAclArgs{
			Bucket: versioningBucket.Bucket,
			Acl:    pulumi.String("private"),
		})
		if err != nil {
			return err
		}
		versioning, err := s3.NewBucketVersioning(ctx, "versioning", &s3.BucketVersioningArgs{
			Bucket: versioningBucket.Bucket,
			VersioningConfiguration: &s3.BucketVersioningVersioningConfigurationArgs{
				Status: pulumi.String("Enabled"),
			},
		})
		if err != nil {
			return err
		}
		_, err = s3.NewBucketLifecycleConfiguration(ctx, "versioning-bucket-config", &s3.BucketLifecycleConfigurationArgs{
			Bucket: versioningBucket.Bucket,
			Rules: s3.BucketLifecycleConfigurationRuleArray{
				&s3.BucketLifecycleConfigurationRuleArgs{
					Id: pulumi.String("config"),
					Filter: &s3.BucketLifecycleConfigurationRuleFilterArgs{
						Prefix: pulumi.String("config/"),
					},
					NoncurrentVersionExpiration: &s3.BucketLifecycleConfigurationRuleNoncurrentVersionExpirationArgs{
						NoncurrentDays: pulumi.Int(90),
					},
					NoncurrentVersionTransitions: s3.BucketLifecycleConfigurationRuleNoncurrentVersionTransitionArray{
						&s3.BucketLifecycleConfigurationRuleNoncurrentVersionTransitionArgs{
							NoncurrentDays: pulumi.Int(30),
							StorageClass:   pulumi.String("STANDARD_IA"),
						},
						&s3.BucketLifecycleConfigurationRuleNoncurrentVersionTransitionArgs{
							NoncurrentDays: pulumi.Int(60),
							StorageClass:   pulumi.String("GLACIER"),
						},
					},
					Status: pulumi.String("Enabled"),
				},
			},
		}, pulumi.DependsOn([]pulumi.Resource{
			versioning,
		}))
		if err != nil {
			return err
		}
		return nil
	})
}
```

```csharp
using System.Collections.Generic;
using System.Linq;
using Pulumi;
using Aws = Pulumi.Aws;

return await Deployment.RunAsync(() =>
{
    var bucket = new Aws.S3.Bucket("bucket", new()
    {
        BucketName = "my-bucket",
    });

    var bucketAcl = new Aws.S3.BucketAcl("bucket_acl", new()
    {
        Bucket = bucket.BucketName,
        Acl = "private",
    });

    var bucket_config = new Aws.S3.BucketLifecycleConfiguration("bucket-config", new()
    {
        Bucket = bucket.BucketName,
        Rules = new[]
        {
            new Aws.S3.Inputs.BucketLifecycleConfigurationRuleArgs
            {
                Id = "log",
                Expiration = new Aws.S3.Inputs.BucketLifecycleConfigurationRuleExpirationArgs
                {
                    Days = 90,
                },
                Filter = new Aws.S3.Inputs.BucketLifecycleConfigurationRuleFilterArgs
                {
                    And = new Aws.S3.Inputs.BucketLifecycleConfigurationRuleFilterAndArgs
                    {
                        Prefix = "log/",
                        Tags =
                        {
                            { "rule", "log" },
                            { "autoclean", "true" },
                        },
                    },
                },
                Status = "Enabled",
                Transitions = new[]
                {
                    new Aws.S3.Inputs.BucketLifecycleConfigurationRuleTransitionArgs
                    {
                        Days = 30,
                        StorageClass = "STANDARD_IA",
                    },
                    new Aws.S3.Inputs.BucketLifecycleConfigurationRuleTransitionArgs
                    {
                        Days = 60,
                        StorageClass = "GLACIER",
                    },
                },
            },
            new Aws.S3.Inputs.BucketLifecycleConfigurationRuleArgs
            {
                Id = "tmp",
                Filter = new Aws.S3.Inputs.BucketLifecycleConfigurationRuleFilterArgs
                {
                    Prefix = "tmp/",
                },
                Expiration = new Aws.S3.Inputs.BucketLifecycleConfigurationRuleExpirationArgs
                {
                    Date = "2023-01-13T00:00:00Z",
                },
                Status = "Enabled",
            },
        },
    });

    var versioningBucket = new Aws.S3.Bucket("versioning_bucket", new()
    {
        BucketName = "my-versioning-bucket",
    });

    var versioningBucketAcl = new Aws.S3.BucketAcl("versioning_bucket_acl", new()
    {
        Bucket = versioningBucket.BucketName,
        Acl = "private",
    });

    var versioning = new Aws.S3.BucketVersioning("versioning", new()
    {
        Bucket = versioningBucket.BucketName,
        VersioningConfiguration = new Aws.S3.Inputs.BucketVersioningVersioningConfigurationArgs
        {
            Status = "Enabled",
        },
    });

    var versioning_bucket_config = new Aws.S3.BucketLifecycleConfiguration("versioning-bucket-config", new()
    {
        Bucket = versioningBucket.BucketName,
        Rules = new[]
        {
            new Aws.S3.Inputs.BucketLifecycleConfigurationRuleArgs
            {
                Id = "config",
                Filter = new Aws.S3.Inputs.BucketLifecycleConfigurationRuleFilterArgs
                {
                    Prefix = "config/",
                },
                NoncurrentVersionExpiration = new Aws.S3.Inputs.BucketLifecycleConfigurationRuleNoncurrentVersionExpirationArgs
                {
                    NoncurrentDays = 90,
                },
                NoncurrentVersionTransitions = new[]
                {
                    new Aws.S3.Inputs.BucketLifecycleConfigurationRuleNoncurrentVersionTransitionArgs
                    {
                        NoncurrentDays = 30,
                        StorageClass = "STANDARD_IA",
                    },
                    new Aws.S3.Inputs.BucketLifecycleConfigurationRuleNoncurrentVersionTransitionArgs
                    {
                        NoncurrentDays = 60,
                        StorageClass = "GLACIER",
                    },
                },
                Status = "Enabled",
            },
        },
    }, new CustomResourceOptions
    {
        DependsOn =
        {
            versioning,
        },
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.s3.Bucket;
import com.pulumi.aws.s3.BucketArgs;
import com.pulumi.aws.s3.BucketAcl;
import com.pulumi.aws.s3.BucketAclArgs;
import com.pulumi.aws.s3.BucketLifecycleConfiguration;
import com.pulumi.aws.s3.BucketLifecycleConfigurationArgs;
import com.pulumi.aws.s3.inputs.BucketLifecycleConfigurationRuleArgs;
import com.pulumi.aws.s3.inputs.BucketLifecycleConfigurationRuleExpirationArgs;
import com.pulumi.aws.s3.inputs.BucketLifecycleConfigurationRuleFilterArgs;
import com.pulumi.aws.s3.inputs.BucketLifecycleConfigurationRuleFilterAndArgs;
import com.pulumi.aws.s3.BucketVersioning;
import com.pulumi.aws.s3.BucketVersioningArgs;
import com.pulumi.aws.s3.inputs.BucketVersioningVersioningConfigurationArgs;
import com.pulumi.aws.s3.inputs.BucketLifecycleConfigurationRuleNoncurrentVersionExpirationArgs;
import com.pulumi.resources.CustomResourceOptions;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Map;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Paths;

public class App {
    public static void main(String[] args) {
        Pulumi.run(App::stack);
    }

    public static void stack(Context ctx) {
        var bucket = new Bucket("bucket", BucketArgs.builder()
            .bucket("my-bucket")
            .build());

        var bucketAcl = new BucketAcl("bucketAcl", BucketAclArgs.builder()
            .bucket(bucket.bucket())
            .acl("private")
            .build());

        var bucket_config = new BucketLifecycleConfiguration("bucket-config", BucketLifecycleConfigurationArgs.builder()
            .bucket(bucket.bucket())
            .rules(
                BucketLifecycleConfigurationRuleArgs.builder()
                    .id("log")
                    .expiration(BucketLifecycleConfigurationRuleExpirationArgs.builder()
                        .days(90)
                        .build())
                    .filter(BucketLifecycleConfigurationRuleFilterArgs.builder()
                        .and(BucketLifecycleConfigurationRuleFilterAndArgs.builder()
                            .prefix("log/")
                            .tags(Map.ofEntries(
                                Map.entry("rule", "log"),
                                Map.entry("autoclean", "true")
                            ))
                            .build())
                        .build())
                    .status("Enabled")
                    .transitions(
                        BucketLifecycleConfigurationRuleTransitionArgs.builder()
                            .days(30)
                            .storageClass("STANDARD_IA")
                            .build(),
                        BucketLifecycleConfigurationRuleTransitionArgs.builder()
                            .days(60)
                            .storageClass("GLACIER")
                            .build())
                    .build(),
                BucketLifecycleConfigurationRuleArgs.builder()
                    .id("tmp")
                    .filter(BucketLifecycleConfigurationRuleFilterArgs.builder()
                        .prefix("tmp/")
                        .build())
                    .expiration(BucketLifecycleConfigurationRuleExpirationArgs.builder()
                        .date("2023-01-13T00:00:00Z")
                        .build())
                    .status("Enabled")
                    .build())
            .build());

        var versioningBucket = new Bucket("versioningBucket", BucketArgs.builder()
            .bucket("my-versioning-bucket")
            .build());

        var versioningBucketAcl = new BucketAcl("versioningBucketAcl", BucketAclArgs.builder()
            .bucket(versioningBucket.bucket())
            .acl("private")
            .build());

        var versioning = new BucketVersioning("versioning", BucketVersioningArgs.builder()
            .bucket(versioningBucket.bucket())
            .versioningConfiguration(BucketVersioningVersioningConfigurationArgs.builder()
                .status("Enabled")
                .build())
            .build());

        var versioning_bucket_config = new BucketLifecycleConfiguration("versioning-bucket-config", BucketLifecycleConfigurationArgs.builder()
            .bucket(versioningBucket.bucket())
            .rules(BucketLifecycleConfigurationRuleArgs.builder()
                .id("config")
                .filter(BucketLifecycleConfigurationRuleFilterArgs.builder()
                    .prefix("config/")
                    .build())
                .noncurrentVersionExpiration(BucketLifecycleConfigurationRuleNoncurrentVersionExpirationArgs.builder()
                    .noncurrentDays(90)
                    .build())
                .noncurrentVersionTransitions(
                    BucketLifecycleConfigurationRuleNoncurrentVersionTransitionArgs.builder()
                        .noncurrentDays(30)
                        .storageClass("STANDARD_IA")
                        .build(),
                    BucketLifecycleConfigurationRuleNoncurrentVersionTransitionArgs.builder()
                        .noncurrentDays(60)
                        .storageClass("GLACIER")
                        .build())
                .status("Enabled")
                .build())
            .build(), CustomResourceOptions.builder()
                .dependsOn(versioning)
                .build());

    }
}
```

```yaml
resources:
  bucket:
    type: aws:s3:Bucket
    properties:
      bucket: my-bucket
  bucketAcl:
    type: aws:s3:BucketAcl
    name: bucket_acl
    properties:
      bucket: ${bucket.bucket}
      acl: private
  bucket-config:
    type: aws:s3:BucketLifecycleConfiguration
    properties:
      bucket: ${bucket.bucket}
      rules:
        - id: log
          expiration:
            days: 90
          filter:
            and:
              prefix: log/
              tags:
                rule: log
                autoclean: 'true'
          status: Enabled
          transitions:
            - days: 30
              storageClass: STANDARD_IA
            - days: 60
              storageClass: GLACIER
        - id: tmp
          filter:
            prefix: tmp/
          expiration:
            date: 2023-01-13T00:00:00Z
          status: Enabled
  versioningBucket:
    type: aws:s3:Bucket
    name: versioning_bucket
    properties:
      bucket: my-versioning-bucket
  versioningBucketAcl:
    type: aws:s3:BucketAcl
    name: versioning_bucket_acl
    properties:
      bucket: ${versioningBucket.bucket}
      acl: private
  versioning:
    type: aws:s3:BucketVersioning
    properties:
      bucket: ${versioningBucket.bucket}
      versioningConfiguration:
        status: Enabled
  versioning-bucket-config:
    type: aws:s3:BucketLifecycleConfiguration
    properties:
      bucket: ${versioningBucket.bucket}
      rules:
        - id: config
          filter:
            prefix: config/
          noncurrentVersionExpiration:
            noncurrentDays: 90
          noncurrentVersionTransitions:
            - noncurrentDays: 30
              storageClass: STANDARD_IA
            - noncurrentDays: 60
              storageClass: GLACIER
          status: Enabled
    options:
      dependsOn:
        - ${versioning}
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_s3_bucket" "bucket" {
  bucket = "my-bucket"
}
resource "aws_s3_bucketacl" "bucket_acl" {
  bucket = aws_s3_bucket.bucket.bucket
  acl    = "private"
}
resource "aws_s3_bucketlifecycleconfiguration" "bucket-config" {
  bucket = aws_s3_bucket.bucket.bucket
  rules {
    id = "log"
    expiration = {
      days = 90
    }
    filter = {
      and = {
        prefix = "log/"
        tags = {
          "rule"      = "log"
          "autoclean" = "true"
        }
      }
    }
    status = "Enabled"
    transitions {
      days          = 30
      storage_class = "STANDARD_IA"
    }
    transitions {
      days          = 60
      storage_class = "GLACIER"
    }
  }
  rules {
    id = "tmp"
    filter = {
      prefix = "tmp/"
    }
    expiration = {
      date = "2023-01-13T00:00:00Z"
    }
    status = "Enabled"
  }
}
resource "aws_s3_bucket" "versioning_bucket" {
  bucket = "my-versioning-bucket"
}
resource "aws_s3_bucketacl" "versioning_bucket_acl" {
  bucket = aws_s3_bucket.versioning_bucket.bucket
  acl    = "private"
}
resource "aws_s3_bucketversioning" "versioning" {
  bucket = aws_s3_bucket.versioning_bucket.bucket
  versioning_configuration = {
    status = "Enabled"
  }
}
resource "aws_s3_bucketlifecycleconfiguration" "versioning-bucket-config" {
  depends_on = [aws_s3_bucketversioning.versioning]
  bucket     = aws_s3_bucket.versioning_bucket.bucket
  rules {
    id = "config"
    filter = {
      prefix = "config/"
    }
    noncurrent_version_expiration = {
      noncurrent_days = 90
    }
    noncurrent_version_transitions {
      noncurrent_days = 30
      storage_class   = "STANDARD_IA"
    }
    noncurrent_version_transitions {
      noncurrent_days = 60
      storage_class   = "GLACIER"
    }
    status = "Enabled"
  }
}
```

## Create BucketLifecycleConfigurationV2 Resource[](#create)

Resources are created with functions called constructors. To learn more about declaring and configuring resources, see [Resources](/docs/concepts/resources/).

### Constructor syntax[](#constructor-syntax)

-   TypeScript
-   Python
-   Go
-   C#
-   Java
-   YAML
-   HCL PREVIEW

```typescript
new BucketLifecycleConfigurationV2(name: string, args: BucketLifecycleConfigurationV2Args, opts?: CustomResourceOptions);
```

```python
@overload
def BucketLifecycleConfigurationV2(resource_name: str,
                                   args: BucketLifecycleConfigurationV2Args,
                                   opts: Optional[ResourceOptions] = None)

@overload
def BucketLifecycleConfigurationV2(resource_name: str,
                                   opts: Optional[ResourceOptions] = None,
                                   bucket: Optional[str] = None,
                                   expected_bucket_owner: Optional[str] = None,
                                   region: Optional[str] = None,
                                   rules: Optional[Sequence[BucketLifecycleConfigurationV2RuleArgs]] = None,
                                   timeouts: Optional[BucketLifecycleConfigurationV2TimeoutsArgs] = None,
                                   transition_default_minimum_object_size: Optional[str] = None)
```

```go
func NewBucketLifecycleConfigurationV2(ctx *Context, name string, args BucketLifecycleConfigurationV2Args, opts ...ResourceOption) (*BucketLifecycleConfigurationV2, error)
```

```csharp
public BucketLifecycleConfigurationV2(string name, BucketLifecycleConfigurationV2Args args, CustomResourceOptions? opts = null)
```

```java
public BucketLifecycleConfigurationV2(String name, BucketLifecycleConfigurationV2Args args)
public BucketLifecycleConfigurationV2(String name, BucketLifecycleConfigurationV2Args args, CustomResourceOptions options)
```

```yaml
type: aws:s3:BucketLifecycleConfigurationV2
properties: # The arguments to resource properties.
options: # Bag of options to control resource's behavior.
```

```hcl
resource "aws_s3_bucketlifecycleconfigurationv2" "name" {
    # resource properties
}
```

#### Parameters[](#parameters)

name This property is required. string

The unique name of the resource.

args This property is required. [BucketLifecycleConfigurationV2Args](#inputs)

The arguments to resource properties.

opts [CustomResourceOptions](/docs/reference/pkg/nodejs/pulumi/pulumi/#CustomResourceOptions)

Bag of options to control resource's behavior.

resource\_name This property is required. str

The unique name of the resource.

args This property is required. [BucketLifecycleConfigurationV2Args](#inputs)

The arguments to resource properties.

opts [ResourceOptions](/docs/reference/pkg/python/pulumi/#pulumi.ResourceOptions)

Bag of options to control resource's behavior.

ctx [Context](https://pkg.go.dev/github.com/pulumi/pulumi/sdk/v3/go/pulumi?tab=doc#Context)

Context object for the current deployment.

name This property is required. string

The unique name of the resource.

args This property is required. [BucketLifecycleConfigurationV2Args](#inputs)

The arguments to resource properties.

opts [ResourceOption](https://pkg.go.dev/github.com/pulumi/pulumi/sdk/v3/go/pulumi?tab=doc#ResourceOption)

Bag of options to control resource's behavior.

name This property is required. string

The unique name of the resource.

args This property is required. [BucketLifecycleConfigurationV2Args](#inputs)

The arguments to resource properties.

opts [CustomResourceOptions](/docs/reference/pkg/dotnet/Pulumi/Pulumi.CustomResourceOptions.html)

Bag of options to control resource's behavior.

name This property is required. String

The unique name of the resource.

args This property is required. [BucketLifecycleConfigurationV2Args](#inputs)

The arguments to resource properties.

options CustomResourceOptions

Bag of options to control resource's behavior.

## BucketLifecycleConfigurationV2 Resource Properties[](#properties)

To learn more about resource properties and how to use them, see [Inputs and Outputs](/docs/intro/concepts/inputs-outputs) in the Architecture and Concepts docs.

### Inputs[](#inputs)

In Python, inputs that are objects can be passed either as [argument classes or as dictionary literals](/docs/languages-sdks/python/#inputs-and-outputs).

The BucketLifecycleConfigurationV2 resource accepts the following [input](/docs/intro/concepts/inputs-outputs) properties:

[Bucket](#bucket_csharp) This property is required. string

Name of the source S3 bucket you want Amazon S3 to monitor.

[ExpectedBucketOwner](#expectedbucketowner_csharp) string

Account ID of the expected bucket owner. If the bucket is owned by a different account, the request will fail with an HTTP 403 (Access Denied) error.

Deprecated: This attribute will be removed in a future verion of the provider.

[Region](#region_csharp) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[Rules](#rules_csharp) [List<BucketLifecycleConfigurationV2Rule>](#bucketlifecycleconfigurationv2rule)

List of configuration blocks describing the rules managing the replication. See below.

[Timeouts](#timeouts_csharp) [BucketLifecycleConfigurationV2Timeouts](#bucketlifecycleconfigurationv2timeouts)

[TransitionDefaultMinimumObjectSize](#transitiondefaultminimumobjectsize_csharp) string

The default minimum object size behavior applied to the lifecycle configuration. Valid values: `all_storage_classes_128K` (default), `variesByStorageClass`. To customize the minimum object size for any transition you can add a `filter` that specifies a custom `objectSizeGreaterThan` or `objectSizeLessThan` value. Custom filters always take precedence over the default transition behavior.

[Bucket](#bucket_go) This property is required. string

Name of the source S3 bucket you want Amazon S3 to monitor.

[ExpectedBucketOwner](#expectedbucketowner_go) string

Account ID of the expected bucket owner. If the bucket is owned by a different account, the request will fail with an HTTP 403 (Access Denied) error.

Deprecated: This attribute will be removed in a future verion of the provider.

[Region](#region_go) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[Rules](#rules_go) [\[\]BucketLifecycleConfigurationV2RuleArgs](#bucketlifecycleconfigurationv2rule)

List of configuration blocks describing the rules managing the replication. See below.

[Timeouts](#timeouts_go) [BucketLifecycleConfigurationV2TimeoutsArgs](#bucketlifecycleconfigurationv2timeouts)

[TransitionDefaultMinimumObjectSize](#transitiondefaultminimumobjectsize_go) string

The default minimum object size behavior applied to the lifecycle configuration. Valid values: `all_storage_classes_128K` (default), `variesByStorageClass`. To customize the minimum object size for any transition you can add a `filter` that specifies a custom `objectSizeGreaterThan` or `objectSizeLessThan` value. Custom filters always take precedence over the default transition behavior.

[bucket](#bucket_hcl) This property is required. string

Name of the source S3 bucket you want Amazon S3 to monitor.

[expected\_bucket\_owner](#expected_bucket_owner_hcl) string

Account ID of the expected bucket owner. If the bucket is owned by a different account, the request will fail with an HTTP 403 (Access Denied) error.

Deprecated: This attribute will be removed in a future verion of the provider.

[region](#region_hcl) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[rules](#rules_hcl) [list(object)](#bucketlifecycleconfigurationv2rule)

List of configuration blocks describing the rules managing the replication. See below.

[timeouts](#timeouts_hcl) [object](#bucketlifecycleconfigurationv2timeouts)

[transition\_default\_minimum\_object\_size](#transition_default_minimum_object_size_hcl) string

The default minimum object size behavior applied to the lifecycle configuration. Valid values: `all_storage_classes_128K` (default), `variesByStorageClass`. To customize the minimum object size for any transition you can add a `filter` that specifies a custom `objectSizeGreaterThan` or `objectSizeLessThan` value. Custom filters always take precedence over the default transition behavior.

[bucket](#bucket_java) This property is required. String

Name of the source S3 bucket you want Amazon S3 to monitor.

[expectedBucketOwner](#expectedbucketowner_java) String

Account ID of the expected bucket owner. If the bucket is owned by a different account, the request will fail with an HTTP 403 (Access Denied) error.

Deprecated: This attribute will be removed in a future verion of the provider.

[region](#region_java) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[rules](#rules_java) [List<BucketLifecycleConfigurationV2Rule>](#bucketlifecycleconfigurationv2rule)

List of configuration blocks describing the rules managing the replication. See below.

[timeouts](#timeouts_java) [BucketLifecycleConfigurationV2Timeouts](#bucketlifecycleconfigurationv2timeouts)

[transitionDefaultMinimumObjectSize](#transitiondefaultminimumobjectsize_java) String

The default minimum object size behavior applied to the lifecycle configuration. Valid values: `all_storage_classes_128K` (default), `variesByStorageClass`. To customize the minimum object size for any transition you can add a `filter` that specifies a custom `objectSizeGreaterThan` or `objectSizeLessThan` value. Custom filters always take precedence over the default transition behavior.

[bucket](#bucket_nodejs) This property is required. string

Name of the source S3 bucket you want Amazon S3 to monitor.

[expectedBucketOwner](#expectedbucketowner_nodejs) string

Account ID of the expected bucket owner. If the bucket is owned by a different account, the request will fail with an HTTP 403 (Access Denied) error.

Deprecated: This attribute will be removed in a future verion of the provider.

[region](#region_nodejs) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[rules](#rules_nodejs) [BucketLifecycleConfigurationV2Rule\[\]](#bucketlifecycleconfigurationv2rule)

List of configuration blocks describing the rules managing the replication. See below.

[timeouts](#timeouts_nodejs) [BucketLifecycleConfigurationV2Timeouts](#bucketlifecycleconfigurationv2timeouts)

[transitionDefaultMinimumObjectSize](#transitiondefaultminimumobjectsize_nodejs) string

The default minimum object size behavior applied to the lifecycle configuration. Valid values: `all_storage_classes_128K` (default), `variesByStorageClass`. To customize the minimum object size for any transition you can add a `filter` that specifies a custom `objectSizeGreaterThan` or `objectSizeLessThan` value. Custom filters always take precedence over the default transition behavior.

[bucket](#bucket_python) This property is required. str

Name of the source S3 bucket you want Amazon S3 to monitor.

[expected\_bucket\_owner](#expected_bucket_owner_python) str

Account ID of the expected bucket owner. If the bucket is owned by a different account, the request will fail with an HTTP 403 (Access Denied) error.

Deprecated: This attribute will be removed in a future verion of the provider.

[region](#region_python) str

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[rules](#rules_python) [Sequence\[BucketLifecycleConfigurationV2RuleArgs\]](#bucketlifecycleconfigurationv2rule)

List of configuration blocks describing the rules managing the replication. See below.

[timeouts](#timeouts_python) [BucketLifecycleConfigurationV2TimeoutsArgs](#bucketlifecycleconfigurationv2timeouts)

[transition\_default\_minimum\_object\_size](#transition_default_minimum_object_size_python) str

The default minimum object size behavior applied to the lifecycle configuration. Valid values: `all_storage_classes_128K` (default), `variesByStorageClass`. To customize the minimum object size for any transition you can add a `filter` that specifies a custom `objectSizeGreaterThan` or `objectSizeLessThan` value. Custom filters always take precedence over the default transition behavior.

[bucket](#bucket_yaml) This property is required. String

Name of the source S3 bucket you want Amazon S3 to monitor.

[expectedBucketOwner](#expectedbucketowner_yaml) String

Account ID of the expected bucket owner. If the bucket is owned by a different account, the request will fail with an HTTP 403 (Access Denied) error.

Deprecated: This attribute will be removed in a future verion of the provider.

[region](#region_yaml) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[rules](#rules_yaml) [List<Property Map>](#bucketlifecycleconfigurationv2rule)

List of configuration blocks describing the rules managing the replication. See below.

[timeouts](#timeouts_yaml) [Property Map](#bucketlifecycleconfigurationv2timeouts)

[transitionDefaultMinimumObjectSize](#transitiondefaultminimumobjectsize_yaml) String

The default minimum object size behavior applied to the lifecycle configuration. Valid values: `all_storage_classes_128K` (default), `variesByStorageClass`. To customize the minimum object size for any transition you can add a `filter` that specifies a custom `objectSizeGreaterThan` or `objectSizeLessThan` value. Custom filters always take precedence over the default transition behavior.

### Outputs[](#outputs)

All [input](#inputs) properties are implicitly available as output properties. Additionally, the BucketLifecycleConfigurationV2 resource produces the following output properties:

[Id](#id_csharp) string

The provider-assigned unique ID for this managed resource.

[Id](#id_go) string

The provider-assigned unique ID for this managed resource.

[id](#id_hcl) string

The provider-assigned unique ID for this managed resource.

[id](#id_java) String

The provider-assigned unique ID for this managed resource.

[id](#id_nodejs) string

The provider-assigned unique ID for this managed resource.

[id](#id_python) str

The provider-assigned unique ID for this managed resource.

[id](#id_yaml) String

The provider-assigned unique ID for this managed resource.

## Look up Existing BucketLifecycleConfigurationV2 Resource[](#look-up)

Get an existing BucketLifecycleConfigurationV2 resource’s state with the given name, ID, and optional extra properties used to qualify the lookup.

-   TypeScript
-   Python
-   Go
-   C#
-   Java
-   YAML
-   HCL PREVIEW

```typescript
public static get(name: string, id: Input<ID>, state?: BucketLifecycleConfigurationV2State, opts?: CustomResourceOptions): BucketLifecycleConfigurationV2
```

```python
@staticmethod
def get(resource_name: str,
        id: str,
        opts: Optional[ResourceOptions] = None,
        bucket: Optional[str] = None,
        expected_bucket_owner: Optional[str] = None,
        region: Optional[str] = None,
        rules: Optional[Sequence[BucketLifecycleConfigurationV2RuleArgs]] = None,
        timeouts: Optional[BucketLifecycleConfigurationV2TimeoutsArgs] = None,
        transition_default_minimum_object_size: Optional[str] = None) -> BucketLifecycleConfigurationV2
```

```go
func GetBucketLifecycleConfigurationV2(ctx *Context, name string, id IDInput, state *BucketLifecycleConfigurationV2State, opts ...ResourceOption) (*BucketLifecycleConfigurationV2, error)
```

```csharp
public static BucketLifecycleConfigurationV2 Get(string name, Input<string> id, BucketLifecycleConfigurationV2State? state, CustomResourceOptions? opts = null)
```

```java
public static BucketLifecycleConfigurationV2 get(String name, Output<String> id, BucketLifecycleConfigurationV2State state, CustomResourceOptions options)
```

```yaml
resources:  _:    type: aws:s3:BucketLifecycleConfigurationV2    get:      id: ${id}
```

```hcl
import {
  to = aws_s3_bucketlifecycleconfigurationv2.example
  id = "${id}"
}
```

name This property is required.

The unique name of the resulting resource.

id This property is required.

The *unique* provider ID of the resource to lookup.

state

Any extra arguments used during the lookup.

opts

A bag of options that control this resource's behavior.

resource\_name This property is required.

The unique name of the resulting resource.

id This property is required.

The *unique* provider ID of the resource to lookup.

name This property is required.

The unique name of the resulting resource.

id This property is required.

The *unique* provider ID of the resource to lookup.

state

Any extra arguments used during the lookup.

opts

A bag of options that control this resource's behavior.

name This property is required.

The unique name of the resulting resource.

id This property is required.

The *unique* provider ID of the resource to lookup.

state

Any extra arguments used during the lookup.

opts

A bag of options that control this resource's behavior.

name This property is required.

The unique name of the resulting resource.

id This property is required.

The *unique* provider ID of the resource to lookup.

state

Any extra arguments used during the lookup.

opts

A bag of options that control this resource's behavior.

The following state arguments are supported:

[Bucket](#state_bucket_csharp) string

Name of the source S3 bucket you want Amazon S3 to monitor.

[ExpectedBucketOwner](#state_expectedbucketowner_csharp) string

Account ID of the expected bucket owner. If the bucket is owned by a different account, the request will fail with an HTTP 403 (Access Denied) error.

Deprecated: This attribute will be removed in a future verion of the provider.

[Region](#state_region_csharp) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[Rules](#state_rules_csharp) [List<BucketLifecycleConfigurationV2Rule>](#bucketlifecycleconfigurationv2rule)

List of configuration blocks describing the rules managing the replication. See below.

[Timeouts](#state_timeouts_csharp) [BucketLifecycleConfigurationV2Timeouts](#bucketlifecycleconfigurationv2timeouts)

[TransitionDefaultMinimumObjectSize](#state_transitiondefaultminimumobjectsize_csharp) string

The default minimum object size behavior applied to the lifecycle configuration. Valid values: `all_storage_classes_128K` (default), `variesByStorageClass`. To customize the minimum object size for any transition you can add a `filter` that specifies a custom `objectSizeGreaterThan` or `objectSizeLessThan` value. Custom filters always take precedence over the default transition behavior.

[Bucket](#state_bucket_go) string

Name of the source S3 bucket you want Amazon S3 to monitor.

[ExpectedBucketOwner](#state_expectedbucketowner_go) string

Account ID of the expected bucket owner. If the bucket is owned by a different account, the request will fail with an HTTP 403 (Access Denied) error.

Deprecated: This attribute will be removed in a future verion of the provider.

[Region](#state_region_go) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[Rules](#state_rules_go) [\[\]BucketLifecycleConfigurationV2RuleArgs](#bucketlifecycleconfigurationv2rule)

List of configuration blocks describing the rules managing the replication. See below.

[Timeouts](#state_timeouts_go) [BucketLifecycleConfigurationV2TimeoutsArgs](#bucketlifecycleconfigurationv2timeouts)

[TransitionDefaultMinimumObjectSize](#state_transitiondefaultminimumobjectsize_go) string

The default minimum object size behavior applied to the lifecycle configuration. Valid values: `all_storage_classes_128K` (default), `variesByStorageClass`. To customize the minimum object size for any transition you can add a `filter` that specifies a custom `objectSizeGreaterThan` or `objectSizeLessThan` value. Custom filters always take precedence over the default transition behavior.

[bucket](#state_bucket_hcl) string

Name of the source S3 bucket you want Amazon S3 to monitor.

[expected\_bucket\_owner](#state_expected_bucket_owner_hcl) string

Account ID of the expected bucket owner. If the bucket is owned by a different account, the request will fail with an HTTP 403 (Access Denied) error.

Deprecated: This attribute will be removed in a future verion of the provider.

[region](#state_region_hcl) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[rules](#state_rules_hcl) [list(object)](#bucketlifecycleconfigurationv2rule)

List of configuration blocks describing the rules managing the replication. See below.

[timeouts](#state_timeouts_hcl) [object](#bucketlifecycleconfigurationv2timeouts)

[transition\_default\_minimum\_object\_size](#state_transition_default_minimum_object_size_hcl) string

The default minimum object size behavior applied to the lifecycle configuration. Valid values: `all_storage_classes_128K` (default), `variesByStorageClass`. To customize the minimum object size for any transition you can add a `filter` that specifies a custom `objectSizeGreaterThan` or `objectSizeLessThan` value. Custom filters always take precedence over the default transition behavior.

[bucket](#state_bucket_java) String

Name of the source S3 bucket you want Amazon S3 to monitor.

[expectedBucketOwner](#state_expectedbucketowner_java) String

Account ID of the expected bucket owner. If the bucket is owned by a different account, the request will fail with an HTTP 403 (Access Denied) error.

Deprecated: This attribute will be removed in a future verion of the provider.

[region](#state_region_java) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[rules](#state_rules_java) [List<BucketLifecycleConfigurationV2Rule>](#bucketlifecycleconfigurationv2rule)

List of configuration blocks describing the rules managing the replication. See below.

[timeouts](#state_timeouts_java) [BucketLifecycleConfigurationV2Timeouts](#bucketlifecycleconfigurationv2timeouts)

[transitionDefaultMinimumObjectSize](#state_transitiondefaultminimumobjectsize_java) String

The default minimum object size behavior applied to the lifecycle configuration. Valid values: `all_storage_classes_128K` (default), `variesByStorageClass`. To customize the minimum object size for any transition you can add a `filter` that specifies a custom `objectSizeGreaterThan` or `objectSizeLessThan` value. Custom filters always take precedence over the default transition behavior.

[bucket](#state_bucket_nodejs) string

Name of the source S3 bucket you want Amazon S3 to monitor.

[expectedBucketOwner](#state_expectedbucketowner_nodejs) string

Account ID of the expected bucket owner. If the bucket is owned by a different account, the request will fail with an HTTP 403 (Access Denied) error.

Deprecated: This attribute will be removed in a future verion of the provider.

[region](#state_region_nodejs) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[rules](#state_rules_nodejs) [BucketLifecycleConfigurationV2Rule\[\]](#bucketlifecycleconfigurationv2rule)

List of configuration blocks describing the rules managing the replication. See below.

[timeouts](#state_timeouts_nodejs) [BucketLifecycleConfigurationV2Timeouts](#bucketlifecycleconfigurationv2timeouts)

[transitionDefaultMinimumObjectSize](#state_transitiondefaultminimumobjectsize_nodejs) string

The default minimum object size behavior applied to the lifecycle configuration. Valid values: `all_storage_classes_128K` (default), `variesByStorageClass`. To customize the minimum object size for any transition you can add a `filter` that specifies a custom `objectSizeGreaterThan` or `objectSizeLessThan` value. Custom filters always take precedence over the default transition behavior.

[bucket](#state_bucket_python) str

Name of the source S3 bucket you want Amazon S3 to monitor.

[expected\_bucket\_owner](#state_expected_bucket_owner_python) str

Account ID of the expected bucket owner. If the bucket is owned by a different account, the request will fail with an HTTP 403 (Access Denied) error.

Deprecated: This attribute will be removed in a future verion of the provider.

[region](#state_region_python) str

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[rules](#state_rules_python) [Sequence\[BucketLifecycleConfigurationV2RuleArgs\]](#bucketlifecycleconfigurationv2rule)

List of configuration blocks describing the rules managing the replication. See below.

[timeouts](#state_timeouts_python) [BucketLifecycleConfigurationV2TimeoutsArgs](#bucketlifecycleconfigurationv2timeouts)

[transition\_default\_minimum\_object\_size](#state_transition_default_minimum_object_size_python) str

The default minimum object size behavior applied to the lifecycle configuration. Valid values: `all_storage_classes_128K` (default), `variesByStorageClass`. To customize the minimum object size for any transition you can add a `filter` that specifies a custom `objectSizeGreaterThan` or `objectSizeLessThan` value. Custom filters always take precedence over the default transition behavior.

[bucket](#state_bucket_yaml) String

Name of the source S3 bucket you want Amazon S3 to monitor.

[expectedBucketOwner](#state_expectedbucketowner_yaml) String

Account ID of the expected bucket owner. If the bucket is owned by a different account, the request will fail with an HTTP 403 (Access Denied) error.

Deprecated: This attribute will be removed in a future verion of the provider.

[region](#state_region_yaml) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[rules](#state_rules_yaml) [List<Property Map>](#bucketlifecycleconfigurationv2rule)

List of configuration blocks describing the rules managing the replication. See below.

[timeouts](#state_timeouts_yaml) [Property Map](#bucketlifecycleconfigurationv2timeouts)

[transitionDefaultMinimumObjectSize](#state_transitiondefaultminimumobjectsize_yaml) String

The default minimum object size behavior applied to the lifecycle configuration. Valid values: `all_storage_classes_128K` (default), `variesByStorageClass`. To customize the minimum object size for any transition you can add a `filter` that specifies a custom `objectSizeGreaterThan` or `objectSizeLessThan` value. Custom filters always take precedence over the default transition behavior.

## Supporting Types[](#supporting-types)

#### BucketLifecycleConfigurationV2Rule

, BucketLifecycleConfigurationV2RuleArgs

[](#bucketlifecycleconfigurationv2rule)

[Id](#id_csharp) This property is required. string

Unique identifier for the rule. The value cannot be longer than 255 characters.

[Status](#status_csharp) This property is required. string

Whether the rule is currently being applied. Valid values: `Enabled` or `Disabled`.

[AbortIncompleteMultipartUpload](#abortincompletemultipartupload_csharp) [BucketLifecycleConfigurationV2RuleAbortIncompleteMultipartUpload](#bucketlifecycleconfigurationv2ruleabortincompletemultipartupload)

Configuration block that specifies the days since the initiation of an incomplete multipart upload that Amazon S3 will wait before permanently removing all parts of the upload. See below.

[Expiration](#expiration_csharp) [BucketLifecycleConfigurationV2RuleExpiration](#bucketlifecycleconfigurationv2ruleexpiration)

Configuration block that specifies the expiration for the lifecycle of the object in the form of date, days and, whether the object has a delete marker. See below.

[Filter](#filter_csharp) [BucketLifecycleConfigurationV2RuleFilter](#bucketlifecycleconfigurationv2rulefilter)

Configuration block used to identify objects that a Lifecycle Rule applies to. See below.

[NoncurrentVersionExpiration](#noncurrentversionexpiration_csharp) [BucketLifecycleConfigurationV2RuleNoncurrentVersionExpiration](#bucketlifecycleconfigurationv2rulenoncurrentversionexpiration)

Configuration block that specifies when noncurrent object versions expire. See below.

[NoncurrentVersionTransitions](#noncurrentversiontransitions_csharp) [List<BucketLifecycleConfigurationV2RuleNoncurrentVersionTransition>](#bucketlifecycleconfigurationv2rulenoncurrentversiontransition)

Set of configuration blocks that specify the transition rule for the lifecycle rule that describes when noncurrent objects transition to a specific storage class. See below.

[Prefix](#prefix_csharp) string

**DEPRECATED** Use `filter` instead. This has been deprecated by Amazon S3. Prefix identifying one or more objects to which the rule applies.

Deprecated: Specify a prefix using 'filter' instead

[Transitions](#transitions_csharp) [List<BucketLifecycleConfigurationV2RuleTransition>](#bucketlifecycleconfigurationv2ruletransition)

Set of configuration blocks that specify when an Amazon S3 object transitions to a specified storage class. See below.

[Id](#id_go) This property is required. string

Unique identifier for the rule. The value cannot be longer than 255 characters.

[Status](#status_go) This property is required. string

Whether the rule is currently being applied. Valid values: `Enabled` or `Disabled`.

[AbortIncompleteMultipartUpload](#abortincompletemultipartupload_go) [BucketLifecycleConfigurationV2RuleAbortIncompleteMultipartUpload](#bucketlifecycleconfigurationv2ruleabortincompletemultipartupload)

Configuration block that specifies the days since the initiation of an incomplete multipart upload that Amazon S3 will wait before permanently removing all parts of the upload. See below.

[Expiration](#expiration_go) [BucketLifecycleConfigurationV2RuleExpiration](#bucketlifecycleconfigurationv2ruleexpiration)

Configuration block that specifies the expiration for the lifecycle of the object in the form of date, days and, whether the object has a delete marker. See below.

[Filter](#filter_go) [BucketLifecycleConfigurationV2RuleFilter](#bucketlifecycleconfigurationv2rulefilter)

Configuration block used to identify objects that a Lifecycle Rule applies to. See below.

[NoncurrentVersionExpiration](#noncurrentversionexpiration_go) [BucketLifecycleConfigurationV2RuleNoncurrentVersionExpiration](#bucketlifecycleconfigurationv2rulenoncurrentversionexpiration)

Configuration block that specifies when noncurrent object versions expire. See below.

[NoncurrentVersionTransitions](#noncurrentversiontransitions_go) [\[\]BucketLifecycleConfigurationV2RuleNoncurrentVersionTransition](#bucketlifecycleconfigurationv2rulenoncurrentversiontransition)

Set of configuration blocks that specify the transition rule for the lifecycle rule that describes when noncurrent objects transition to a specific storage class. See below.

[Prefix](#prefix_go) string

**DEPRECATED** Use `filter` instead. This has been deprecated by Amazon S3. Prefix identifying one or more objects to which the rule applies.

Deprecated: Specify a prefix using 'filter' instead

[Transitions](#transitions_go) [\[\]BucketLifecycleConfigurationV2RuleTransition](#bucketlifecycleconfigurationv2ruletransition)

Set of configuration blocks that specify when an Amazon S3 object transitions to a specified storage class. See below.

[id](#id_hcl) This property is required. string

Unique identifier for the rule. The value cannot be longer than 255 characters.

[status](#status_hcl) This property is required. string

Whether the rule is currently being applied. Valid values: `Enabled` or `Disabled`.

[abort\_incomplete\_multipart\_upload](#abort_incomplete_multipart_upload_hcl) [object](#bucketlifecycleconfigurationv2ruleabortincompletemultipartupload)

Configuration block that specifies the days since the initiation of an incomplete multipart upload that Amazon S3 will wait before permanently removing all parts of the upload. See below.

[expiration](#expiration_hcl) [object](#bucketlifecycleconfigurationv2ruleexpiration)

Configuration block that specifies the expiration for the lifecycle of the object in the form of date, days and, whether the object has a delete marker. See below.

[filter](#filter_hcl) [object](#bucketlifecycleconfigurationv2rulefilter)

Configuration block used to identify objects that a Lifecycle Rule applies to. See below.

[noncurrent\_version\_expiration](#noncurrent_version_expiration_hcl) [object](#bucketlifecycleconfigurationv2rulenoncurrentversionexpiration)

Configuration block that specifies when noncurrent object versions expire. See below.

[noncurrent\_version\_transitions](#noncurrent_version_transitions_hcl) [list(object)](#bucketlifecycleconfigurationv2rulenoncurrentversiontransition)

Set of configuration blocks that specify the transition rule for the lifecycle rule that describes when noncurrent objects transition to a specific storage class. See below.

[prefix](#prefix_hcl) string

**DEPRECATED** Use `filter` instead. This has been deprecated by Amazon S3. Prefix identifying one or more objects to which the rule applies.

Deprecated: Specify a prefix using 'filter' instead

[transitions](#transitions_hcl) [list(object)](#bucketlifecycleconfigurationv2ruletransition)

Set of configuration blocks that specify when an Amazon S3 object transitions to a specified storage class. See below.

[id](#id_java) This property is required. String

Unique identifier for the rule. The value cannot be longer than 255 characters.

[status](#status_java) This property is required. String

Whether the rule is currently being applied. Valid values: `Enabled` or `Disabled`.

[abortIncompleteMultipartUpload](#abortincompletemultipartupload_java) [BucketLifecycleConfigurationV2RuleAbortIncompleteMultipartUpload](#bucketlifecycleconfigurationv2ruleabortincompletemultipartupload)

Configuration block that specifies the days since the initiation of an incomplete multipart upload that Amazon S3 will wait before permanently removing all parts of the upload. See below.

[expiration](#expiration_java) [BucketLifecycleConfigurationV2RuleExpiration](#bucketlifecycleconfigurationv2ruleexpiration)

Configuration block that specifies the expiration for the lifecycle of the object in the form of date, days and, whether the object has a delete marker. See below.

[filter](#filter_java) [BucketLifecycleConfigurationV2RuleFilter](#bucketlifecycleconfigurationv2rulefilter)

Configuration block used to identify objects that a Lifecycle Rule applies to. See below.

[noncurrentVersionExpiration](#noncurrentversionexpiration_java) [BucketLifecycleConfigurationV2RuleNoncurrentVersionExpiration](#bucketlifecycleconfigurationv2rulenoncurrentversionexpiration)

Configuration block that specifies when noncurrent object versions expire. See below.

[noncurrentVersionTransitions](#noncurrentversiontransitions_java) [List<BucketLifecycleConfigurationV2RuleNoncurrentVersionTransition>](#bucketlifecycleconfigurationv2rulenoncurrentversiontransition)

Set of configuration blocks that specify the transition rule for the lifecycle rule that describes when noncurrent objects transition to a specific storage class. See below.

[prefix](#prefix_java) String

**DEPRECATED** Use `filter` instead. This has been deprecated by Amazon S3. Prefix identifying one or more objects to which the rule applies.

Deprecated: Specify a prefix using 'filter' instead

[transitions](#transitions_java) [List<BucketLifecycleConfigurationV2RuleTransition>](#bucketlifecycleconfigurationv2ruletransition)

Set of configuration blocks that specify when an Amazon S3 object transitions to a specified storage class. See below.

[id](#id_nodejs) This property is required. string

Unique identifier for the rule. The value cannot be longer than 255 characters.

[status](#status_nodejs) This property is required. string

Whether the rule is currently being applied. Valid values: `Enabled` or `Disabled`.

[abortIncompleteMultipartUpload](#abortincompletemultipartupload_nodejs) [BucketLifecycleConfigurationV2RuleAbortIncompleteMultipartUpload](#bucketlifecycleconfigurationv2ruleabortincompletemultipartupload)

Configuration block that specifies the days since the initiation of an incomplete multipart upload that Amazon S3 will wait before permanently removing all parts of the upload. See below.

[expiration](#expiration_nodejs) [BucketLifecycleConfigurationV2RuleExpiration](#bucketlifecycleconfigurationv2ruleexpiration)

Configuration block that specifies the expiration for the lifecycle of the object in the form of date, days and, whether the object has a delete marker. See below.

[filter](#filter_nodejs) [BucketLifecycleConfigurationV2RuleFilter](#bucketlifecycleconfigurationv2rulefilter)

Configuration block used to identify objects that a Lifecycle Rule applies to. See below.

[noncurrentVersionExpiration](#noncurrentversionexpiration_nodejs) [BucketLifecycleConfigurationV2RuleNoncurrentVersionExpiration](#bucketlifecycleconfigurationv2rulenoncurrentversionexpiration)

Configuration block that specifies when noncurrent object versions expire. See below.

[noncurrentVersionTransitions](#noncurrentversiontransitions_nodejs) [BucketLifecycleConfigurationV2RuleNoncurrentVersionTransition\[\]](#bucketlifecycleconfigurationv2rulenoncurrentversiontransition)

Set of configuration blocks that specify the transition rule for the lifecycle rule that describes when noncurrent objects transition to a specific storage class. See below.

[prefix](#prefix_nodejs) string

**DEPRECATED** Use `filter` instead. This has been deprecated by Amazon S3. Prefix identifying one or more objects to which the rule applies.

Deprecated: Specify a prefix using 'filter' instead

[transitions](#transitions_nodejs) [BucketLifecycleConfigurationV2RuleTransition\[\]](#bucketlifecycleconfigurationv2ruletransition)

Set of configuration blocks that specify when an Amazon S3 object transitions to a specified storage class. See below.

[id](#id_python) This property is required. str

Unique identifier for the rule. The value cannot be longer than 255 characters.

[status](#status_python) This property is required. str

Whether the rule is currently being applied. Valid values: `Enabled` or `Disabled`.

[abort\_incomplete\_multipart\_upload](#abort_incomplete_multipart_upload_python) [BucketLifecycleConfigurationV2RuleAbortIncompleteMultipartUpload](#bucketlifecycleconfigurationv2ruleabortincompletemultipartupload)

Configuration block that specifies the days since the initiation of an incomplete multipart upload that Amazon S3 will wait before permanently removing all parts of the upload. See below.

[expiration](#expiration_python) [BucketLifecycleConfigurationV2RuleExpiration](#bucketlifecycleconfigurationv2ruleexpiration)

Configuration block that specifies the expiration for the lifecycle of the object in the form of date, days and, whether the object has a delete marker. See below.

[filter](#filter_python) [BucketLifecycleConfigurationV2RuleFilter](#bucketlifecycleconfigurationv2rulefilter)

Configuration block used to identify objects that a Lifecycle Rule applies to. See below.

[noncurrent\_version\_expiration](#noncurrent_version_expiration_python) [BucketLifecycleConfigurationV2RuleNoncurrentVersionExpiration](#bucketlifecycleconfigurationv2rulenoncurrentversionexpiration)

Configuration block that specifies when noncurrent object versions expire. See below.

[noncurrent\_version\_transitions](#noncurrent_version_transitions_python) [Sequence\[BucketLifecycleConfigurationV2RuleNoncurrentVersionTransition\]](#bucketlifecycleconfigurationv2rulenoncurrentversiontransition)

Set of configuration blocks that specify the transition rule for the lifecycle rule that describes when noncurrent objects transition to a specific storage class. See below.

[prefix](#prefix_python) str

**DEPRECATED** Use `filter` instead. This has been deprecated by Amazon S3. Prefix identifying one or more objects to which the rule applies.

Deprecated: Specify a prefix using 'filter' instead

[transitions](#transitions_python) [Sequence\[BucketLifecycleConfigurationV2RuleTransition\]](#bucketlifecycleconfigurationv2ruletransition)

Set of configuration blocks that specify when an Amazon S3 object transitions to a specified storage class. See below.

[id](#id_yaml) This property is required. String

Unique identifier for the rule. The value cannot be longer than 255 characters.

[status](#status_yaml) This property is required. String

Whether the rule is currently being applied. Valid values: `Enabled` or `Disabled`.

[abortIncompleteMultipartUpload](#abortincompletemultipartupload_yaml) [Property Map](#bucketlifecycleconfigurationv2ruleabortincompletemultipartupload)

Configuration block that specifies the days since the initiation of an incomplete multipart upload that Amazon S3 will wait before permanently removing all parts of the upload. See below.

[expiration](#expiration_yaml) [Property Map](#bucketlifecycleconfigurationv2ruleexpiration)

Configuration block that specifies the expiration for the lifecycle of the object in the form of date, days and, whether the object has a delete marker. See below.

[filter](#filter_yaml) [Property Map](#bucketlifecycleconfigurationv2rulefilter)

Configuration block used to identify objects that a Lifecycle Rule applies to. See below.

[noncurrentVersionExpiration](#noncurrentversionexpiration_yaml) [Property Map](#bucketlifecycleconfigurationv2rulenoncurrentversionexpiration)

Configuration block that specifies when noncurrent object versions expire. See below.

[noncurrentVersionTransitions](#noncurrentversiontransitions_yaml) [List<Property Map>](#bucketlifecycleconfigurationv2rulenoncurrentversiontransition)

Set of configuration blocks that specify the transition rule for the lifecycle rule that describes when noncurrent objects transition to a specific storage class. See below.

[prefix](#prefix_yaml) String

**DEPRECATED** Use `filter` instead. This has been deprecated by Amazon S3. Prefix identifying one or more objects to which the rule applies.

Deprecated: Specify a prefix using 'filter' instead

[transitions](#transitions_yaml) [List<Property Map>](#bucketlifecycleconfigurationv2ruletransition)

Set of configuration blocks that specify when an Amazon S3 object transitions to a specified storage class. See below.

#### BucketLifecycleConfigurationV2RuleAbortIncompleteMultipartUpload

, BucketLifecycleConfigurationV2RuleAbortIncompleteMultipartUploadArgs

[](#bucketlifecycleconfigurationv2ruleabortincompletemultipartupload)

[DaysAfterInitiation](#daysafterinitiation_csharp) int

Number of days after which Amazon S3 aborts an incomplete multipart upload.

[DaysAfterInitiation](#daysafterinitiation_go) int

Number of days after which Amazon S3 aborts an incomplete multipart upload.

[days\_after\_initiation](#days_after_initiation_hcl) number

Number of days after which Amazon S3 aborts an incomplete multipart upload.

[daysAfterInitiation](#daysafterinitiation_java) Integer

Number of days after which Amazon S3 aborts an incomplete multipart upload.

[daysAfterInitiation](#daysafterinitiation_nodejs) number

Number of days after which Amazon S3 aborts an incomplete multipart upload.

[days\_after\_initiation](#days_after_initiation_python) int

Number of days after which Amazon S3 aborts an incomplete multipart upload.

[daysAfterInitiation](#daysafterinitiation_yaml) Number

Number of days after which Amazon S3 aborts an incomplete multipart upload.

#### BucketLifecycleConfigurationV2RuleExpiration

, BucketLifecycleConfigurationV2RuleExpirationArgs

[](#bucketlifecycleconfigurationv2ruleexpiration)

[Date](#date_csharp) string

Date the object is to be moved or deleted. The date value must be in [RFC3339 full-date format](https://datatracker.ietf.org/doc/html/rfc3339#section-5.6) e.g. `2023-08-22`.

[Days](#days_csharp) int

Lifetime, in days, of the objects that are subject to the rule. The value must be a non-zero positive integer.

[ExpiredObjectDeleteMarker](#expiredobjectdeletemarker_csharp) bool

Indicates whether Amazon S3 will remove a delete marker with no noncurrent versions. If set to `true`, the delete marker will be expired; if set to `false` the policy takes no action.

[Date](#date_go) string

Date the object is to be moved or deleted. The date value must be in [RFC3339 full-date format](https://datatracker.ietf.org/doc/html/rfc3339#section-5.6) e.g. `2023-08-22`.

[Days](#days_go) int

Lifetime, in days, of the objects that are subject to the rule. The value must be a non-zero positive integer.

[ExpiredObjectDeleteMarker](#expiredobjectdeletemarker_go) bool

Indicates whether Amazon S3 will remove a delete marker with no noncurrent versions. If set to `true`, the delete marker will be expired; if set to `false` the policy takes no action.

[date](#date_hcl) string

Date the object is to be moved or deleted. The date value must be in [RFC3339 full-date format](https://datatracker.ietf.org/doc/html/rfc3339#section-5.6) e.g. `2023-08-22`.

[days](#days_hcl) number

Lifetime, in days, of the objects that are subject to the rule. The value must be a non-zero positive integer.

[expired\_object\_delete\_marker](#expired_object_delete_marker_hcl) bool

Indicates whether Amazon S3 will remove a delete marker with no noncurrent versions. If set to `true`, the delete marker will be expired; if set to `false` the policy takes no action.

[date](#date_java) String

Date the object is to be moved or deleted. The date value must be in [RFC3339 full-date format](https://datatracker.ietf.org/doc/html/rfc3339#section-5.6) e.g. `2023-08-22`.

[days](#days_java) Integer

Lifetime, in days, of the objects that are subject to the rule. The value must be a non-zero positive integer.

[expiredObjectDeleteMarker](#expiredobjectdeletemarker_java) Boolean

Indicates whether Amazon S3 will remove a delete marker with no noncurrent versions. If set to `true`, the delete marker will be expired; if set to `false` the policy takes no action.

[date](#date_nodejs) string

Date the object is to be moved or deleted. The date value must be in [RFC3339 full-date format](https://datatracker.ietf.org/doc/html/rfc3339#section-5.6) e.g. `2023-08-22`.

[days](#days_nodejs) number

Lifetime, in days, of the objects that are subject to the rule. The value must be a non-zero positive integer.

[expiredObjectDeleteMarker](#expiredobjectdeletemarker_nodejs) boolean

Indicates whether Amazon S3 will remove a delete marker with no noncurrent versions. If set to `true`, the delete marker will be expired; if set to `false` the policy takes no action.

[date](#date_python) str

Date the object is to be moved or deleted. The date value must be in [RFC3339 full-date format](https://datatracker.ietf.org/doc/html/rfc3339#section-5.6) e.g. `2023-08-22`.

[days](#days_python) int

Lifetime, in days, of the objects that are subject to the rule. The value must be a non-zero positive integer.

[expired\_object\_delete\_marker](#expired_object_delete_marker_python) bool

Indicates whether Amazon S3 will remove a delete marker with no noncurrent versions. If set to `true`, the delete marker will be expired; if set to `false` the policy takes no action.

[date](#date_yaml) String

Date the object is to be moved or deleted. The date value must be in [RFC3339 full-date format](https://datatracker.ietf.org/doc/html/rfc3339#section-5.6) e.g. `2023-08-22`.

[days](#days_yaml) Number

Lifetime, in days, of the objects that are subject to the rule. The value must be a non-zero positive integer.

[expiredObjectDeleteMarker](#expiredobjectdeletemarker_yaml) Boolean

Indicates whether Amazon S3 will remove a delete marker with no noncurrent versions. If set to `true`, the delete marker will be expired; if set to `false` the policy takes no action.

#### BucketLifecycleConfigurationV2RuleFilter

, BucketLifecycleConfigurationV2RuleFilterArgs

[](#bucketlifecycleconfigurationv2rulefilter)

[And](#and_csharp) [BucketLifecycleConfigurationV2RuleFilterAnd](#bucketlifecycleconfigurationv2rulefilterand)

Configuration block used to apply a logical `AND` to two or more predicates. See below. The Lifecycle Rule will apply to any object matching all the predicates configured inside the `and` block.

[ObjectSizeGreaterThan](#objectsizegreaterthan_csharp) int

Minimum object size (in bytes) to which the rule applies.

[ObjectSizeLessThan](#objectsizelessthan_csharp) int

Maximum object size (in bytes) to which the rule applies.

[Prefix](#prefix_csharp) string

Prefix identifying one or more objects to which the rule applies. Defaults to an empty string (`""`) if not specified.

[Tag](#tag_csharp) [BucketLifecycleConfigurationV2RuleFilterTag](#bucketlifecycleconfigurationv2rulefiltertag)

Configuration block for specifying a tag key and value. See below.

[And](#and_go) [BucketLifecycleConfigurationV2RuleFilterAnd](#bucketlifecycleconfigurationv2rulefilterand)

Configuration block used to apply a logical `AND` to two or more predicates. See below. The Lifecycle Rule will apply to any object matching all the predicates configured inside the `and` block.

[ObjectSizeGreaterThan](#objectsizegreaterthan_go) int

Minimum object size (in bytes) to which the rule applies.

[ObjectSizeLessThan](#objectsizelessthan_go) int

Maximum object size (in bytes) to which the rule applies.

[Prefix](#prefix_go) string

Prefix identifying one or more objects to which the rule applies. Defaults to an empty string (`""`) if not specified.

[Tag](#tag_go) [BucketLifecycleConfigurationV2RuleFilterTag](#bucketlifecycleconfigurationv2rulefiltertag)

Configuration block for specifying a tag key and value. See below.

[and](#and_hcl) [object](#bucketlifecycleconfigurationv2rulefilterand)

Configuration block used to apply a logical `AND` to two or more predicates. See below. The Lifecycle Rule will apply to any object matching all the predicates configured inside the `and` block.

[object\_size\_greater\_than](#object_size_greater_than_hcl) number

Minimum object size (in bytes) to which the rule applies.

[object\_size\_less\_than](#object_size_less_than_hcl) number

Maximum object size (in bytes) to which the rule applies.

[prefix](#prefix_hcl) string

Prefix identifying one or more objects to which the rule applies. Defaults to an empty string (`""`) if not specified.

[tag](#tag_hcl) [object](#bucketlifecycleconfigurationv2rulefiltertag)

Configuration block for specifying a tag key and value. See below.

[and](#and_java) [BucketLifecycleConfigurationV2RuleFilterAnd](#bucketlifecycleconfigurationv2rulefilterand)

Configuration block used to apply a logical `AND` to two or more predicates. See below. The Lifecycle Rule will apply to any object matching all the predicates configured inside the `and` block.

[objectSizeGreaterThan](#objectsizegreaterthan_java) Integer

Minimum object size (in bytes) to which the rule applies.

[objectSizeLessThan](#objectsizelessthan_java) Integer

Maximum object size (in bytes) to which the rule applies.

[prefix](#prefix_java) String

Prefix identifying one or more objects to which the rule applies. Defaults to an empty string (`""`) if not specified.

[tag](#tag_java) [BucketLifecycleConfigurationV2RuleFilterTag](#bucketlifecycleconfigurationv2rulefiltertag)

Configuration block for specifying a tag key and value. See below.

[and](#and_nodejs) [BucketLifecycleConfigurationV2RuleFilterAnd](#bucketlifecycleconfigurationv2rulefilterand)

Configuration block used to apply a logical `AND` to two or more predicates. See below. The Lifecycle Rule will apply to any object matching all the predicates configured inside the `and` block.

[objectSizeGreaterThan](#objectsizegreaterthan_nodejs) number

Minimum object size (in bytes) to which the rule applies.

[objectSizeLessThan](#objectsizelessthan_nodejs) number

Maximum object size (in bytes) to which the rule applies.

[prefix](#prefix_nodejs) string

Prefix identifying one or more objects to which the rule applies. Defaults to an empty string (`""`) if not specified.

[tag](#tag_nodejs) [BucketLifecycleConfigurationV2RuleFilterTag](#bucketlifecycleconfigurationv2rulefiltertag)

Configuration block for specifying a tag key and value. See below.

[and\_](#and__python) [BucketLifecycleConfigurationV2RuleFilterAnd](#bucketlifecycleconfigurationv2rulefilterand)

Configuration block used to apply a logical `AND` to two or more predicates. See below. The Lifecycle Rule will apply to any object matching all the predicates configured inside the `and` block.

[object\_size\_greater\_than](#object_size_greater_than_python) int

Minimum object size (in bytes) to which the rule applies.

[object\_size\_less\_than](#object_size_less_than_python) int

Maximum object size (in bytes) to which the rule applies.

[prefix](#prefix_python) str

Prefix identifying one or more objects to which the rule applies. Defaults to an empty string (`""`) if not specified.

[tag](#tag_python) [BucketLifecycleConfigurationV2RuleFilterTag](#bucketlifecycleconfigurationv2rulefiltertag)

Configuration block for specifying a tag key and value. See below.

[and](#and_yaml) [Property Map](#bucketlifecycleconfigurationv2rulefilterand)

Configuration block used to apply a logical `AND` to two or more predicates. See below. The Lifecycle Rule will apply to any object matching all the predicates configured inside the `and` block.

[objectSizeGreaterThan](#objectsizegreaterthan_yaml) Number

Minimum object size (in bytes) to which the rule applies.

[objectSizeLessThan](#objectsizelessthan_yaml) Number

Maximum object size (in bytes) to which the rule applies.

[prefix](#prefix_yaml) String

Prefix identifying one or more objects to which the rule applies. Defaults to an empty string (`""`) if not specified.

[tag](#tag_yaml) [Property Map](#bucketlifecycleconfigurationv2rulefiltertag)

Configuration block for specifying a tag key and value. See below.

#### BucketLifecycleConfigurationV2RuleFilterAnd

, BucketLifecycleConfigurationV2RuleFilterAndArgs

[](#bucketlifecycleconfigurationv2rulefilterand)

[ObjectSizeGreaterThan](#objectsizegreaterthan_csharp) int

Minimum object size to which the rule applies. Value must be at least `0` if specified. Defaults to 128000 (128 KB) for all `storageClass` values unless `transitionDefaultMinimumObjectSize` specifies otherwise.

[ObjectSizeLessThan](#objectsizelessthan_csharp) int

Maximum object size to which the rule applies. Value must be at least `1` if specified.

[Prefix](#prefix_csharp) string

Prefix identifying one or more objects to which the rule applies.

[Tags](#tags_csharp) Dictionary<string, string>

Key-value map of resource tags. All of these tags must exist in the object's tag set in order for the rule to apply. If set, must contain at least one key-value pair.

[ObjectSizeGreaterThan](#objectsizegreaterthan_go) int

Minimum object size to which the rule applies. Value must be at least `0` if specified. Defaults to 128000 (128 KB) for all `storageClass` values unless `transitionDefaultMinimumObjectSize` specifies otherwise.

[ObjectSizeLessThan](#objectsizelessthan_go) int

Maximum object size to which the rule applies. Value must be at least `1` if specified.

[Prefix](#prefix_go) string

Prefix identifying one or more objects to which the rule applies.

[Tags](#tags_go) map\[string\]string

Key-value map of resource tags. All of these tags must exist in the object's tag set in order for the rule to apply. If set, must contain at least one key-value pair.

[object\_size\_greater\_than](#object_size_greater_than_hcl) number

Minimum object size to which the rule applies. Value must be at least `0` if specified. Defaults to 128000 (128 KB) for all `storageClass` values unless `transitionDefaultMinimumObjectSize` specifies otherwise.

[object\_size\_less\_than](#object_size_less_than_hcl) number

Maximum object size to which the rule applies. Value must be at least `1` if specified.

[prefix](#prefix_hcl) string

Prefix identifying one or more objects to which the rule applies.

[tags](#tags_hcl) map(string)

Key-value map of resource tags. All of these tags must exist in the object's tag set in order for the rule to apply. If set, must contain at least one key-value pair.

[objectSizeGreaterThan](#objectsizegreaterthan_java) Integer

Minimum object size to which the rule applies. Value must be at least `0` if specified. Defaults to 128000 (128 KB) for all `storageClass` values unless `transitionDefaultMinimumObjectSize` specifies otherwise.

[objectSizeLessThan](#objectsizelessthan_java) Integer

Maximum object size to which the rule applies. Value must be at least `1` if specified.

[prefix](#prefix_java) String

Prefix identifying one or more objects to which the rule applies.

[tags](#tags_java) Map<String,String>

Key-value map of resource tags. All of these tags must exist in the object's tag set in order for the rule to apply. If set, must contain at least one key-value pair.

[objectSizeGreaterThan](#objectsizegreaterthan_nodejs) number

Minimum object size to which the rule applies. Value must be at least `0` if specified. Defaults to 128000 (128 KB) for all `storageClass` values unless `transitionDefaultMinimumObjectSize` specifies otherwise.

[objectSizeLessThan](#objectsizelessthan_nodejs) number

Maximum object size to which the rule applies. Value must be at least `1` if specified.

[prefix](#prefix_nodejs) string

Prefix identifying one or more objects to which the rule applies.

[tags](#tags_nodejs) {\[key: string\]: string}

Key-value map of resource tags. All of these tags must exist in the object's tag set in order for the rule to apply. If set, must contain at least one key-value pair.

[object\_size\_greater\_than](#object_size_greater_than_python) int

Minimum object size to which the rule applies. Value must be at least `0` if specified. Defaults to 128000 (128 KB) for all `storageClass` values unless `transitionDefaultMinimumObjectSize` specifies otherwise.

[object\_size\_less\_than](#object_size_less_than_python) int

Maximum object size to which the rule applies. Value must be at least `1` if specified.

[prefix](#prefix_python) str

Prefix identifying one or more objects to which the rule applies.

[tags](#tags_python) Mapping\[str, str\]

Key-value map of resource tags. All of these tags must exist in the object's tag set in order for the rule to apply. If set, must contain at least one key-value pair.

[objectSizeGreaterThan](#objectsizegreaterthan_yaml) Number

Minimum object size to which the rule applies. Value must be at least `0` if specified. Defaults to 128000 (128 KB) for all `storageClass` values unless `transitionDefaultMinimumObjectSize` specifies otherwise.

[objectSizeLessThan](#objectsizelessthan_yaml) Number

Maximum object size to which the rule applies. Value must be at least `1` if specified.

[prefix](#prefix_yaml) String

Prefix identifying one or more objects to which the rule applies.

[tags](#tags_yaml) Map<String>

Key-value map of resource tags. All of these tags must exist in the object's tag set in order for the rule to apply. If set, must contain at least one key-value pair.

#### BucketLifecycleConfigurationV2RuleFilterTag

, BucketLifecycleConfigurationV2RuleFilterTagArgs

[](#bucketlifecycleconfigurationv2rulefiltertag)

[Key](#key_csharp) This property is required. string

Name of the object key.

[Value](#value_csharp) This property is required. string

Value of the tag.

[Key](#key_go) This property is required. string

Name of the object key.

[Value](#value_go) This property is required. string

Value of the tag.

[key](#key_hcl) This property is required. string

Name of the object key.

[value](#value_hcl) This property is required. string

Value of the tag.

[key](#key_java) This property is required. String

Name of the object key.

[value](#value_java) This property is required. String

Value of the tag.

[key](#key_nodejs) This property is required. string

Name of the object key.

[value](#value_nodejs) This property is required. string

Value of the tag.

[key](#key_python) This property is required. str

Name of the object key.

[value](#value_python) This property is required. str

Value of the tag.

[key](#key_yaml) This property is required. String

Name of the object key.

[value](#value_yaml) This property is required. String

Value of the tag.

#### BucketLifecycleConfigurationV2RuleNoncurrentVersionExpiration

, BucketLifecycleConfigurationV2RuleNoncurrentVersionExpirationArgs

[](#bucketlifecycleconfigurationv2rulenoncurrentversionexpiration)

[NoncurrentDays](#noncurrentdays_csharp) This property is required. int

Number of days an object is noncurrent before Amazon S3 can perform the associated action. Must be a positive integer.

[NewerNoncurrentVersions](#newernoncurrentversions_csharp) int

Number of noncurrent versions Amazon S3 will retain. Must be a non-zero positive integer.

[NoncurrentDays](#noncurrentdays_go) This property is required. int

Number of days an object is noncurrent before Amazon S3 can perform the associated action. Must be a positive integer.

[NewerNoncurrentVersions](#newernoncurrentversions_go) int

Number of noncurrent versions Amazon S3 will retain. Must be a non-zero positive integer.

[noncurrent\_days](#noncurrent_days_hcl) This property is required. number

Number of days an object is noncurrent before Amazon S3 can perform the associated action. Must be a positive integer.

[newer\_noncurrent\_versions](#newer_noncurrent_versions_hcl) number

Number of noncurrent versions Amazon S3 will retain. Must be a non-zero positive integer.

[noncurrentDays](#noncurrentdays_java) This property is required. Integer

Number of days an object is noncurrent before Amazon S3 can perform the associated action. Must be a positive integer.

[newerNoncurrentVersions](#newernoncurrentversions_java) Integer

Number of noncurrent versions Amazon S3 will retain. Must be a non-zero positive integer.

[noncurrentDays](#noncurrentdays_nodejs) This property is required. number

Number of days an object is noncurrent before Amazon S3 can perform the associated action. Must be a positive integer.

[newerNoncurrentVersions](#newernoncurrentversions_nodejs) number

Number of noncurrent versions Amazon S3 will retain. Must be a non-zero positive integer.

[noncurrent\_days](#noncurrent_days_python) This property is required. int

Number of days an object is noncurrent before Amazon S3 can perform the associated action. Must be a positive integer.

[newer\_noncurrent\_versions](#newer_noncurrent_versions_python) int

Number of noncurrent versions Amazon S3 will retain. Must be a non-zero positive integer.

[noncurrentDays](#noncurrentdays_yaml) This property is required. Number

Number of days an object is noncurrent before Amazon S3 can perform the associated action. Must be a positive integer.

[newerNoncurrentVersions](#newernoncurrentversions_yaml) Number

Number of noncurrent versions Amazon S3 will retain. Must be a non-zero positive integer.

#### BucketLifecycleConfigurationV2RuleNoncurrentVersionTransition

, BucketLifecycleConfigurationV2RuleNoncurrentVersionTransitionArgs

[](#bucketlifecycleconfigurationv2rulenoncurrentversiontransition)

[NoncurrentDays](#noncurrentdays_csharp) This property is required. int

Number of days an object is noncurrent before Amazon S3 can perform the associated action.

[StorageClass](#storageclass_csharp) This property is required. string

Class of storage used to store the object. Valid Values: `GLACIER`, `STANDARD_IA`, `ONEZONE_IA`, `INTELLIGENT_TIERING`, `DEEP_ARCHIVE`, `GLACIER_IR`.

[NewerNoncurrentVersions](#newernoncurrentversions_csharp) int

Number of noncurrent versions Amazon S3 will retain. Must be a non-zero positive integer.

[NoncurrentDays](#noncurrentdays_go) This property is required. int

Number of days an object is noncurrent before Amazon S3 can perform the associated action.

[StorageClass](#storageclass_go) This property is required. string

Class of storage used to store the object. Valid Values: `GLACIER`, `STANDARD_IA`, `ONEZONE_IA`, `INTELLIGENT_TIERING`, `DEEP_ARCHIVE`, `GLACIER_IR`.

[NewerNoncurrentVersions](#newernoncurrentversions_go) int

Number of noncurrent versions Amazon S3 will retain. Must be a non-zero positive integer.

[noncurrent\_days](#noncurrent_days_hcl) This property is required. number

Number of days an object is noncurrent before Amazon S3 can perform the associated action.

[storage\_class](#storage_class_hcl) This property is required. string

Class of storage used to store the object. Valid Values: `GLACIER`, `STANDARD_IA`, `ONEZONE_IA`, `INTELLIGENT_TIERING`, `DEEP_ARCHIVE`, `GLACIER_IR`.

[newer\_noncurrent\_versions](#newer_noncurrent_versions_hcl) number

Number of noncurrent versions Amazon S3 will retain. Must be a non-zero positive integer.

[noncurrentDays](#noncurrentdays_java) This property is required. Integer

Number of days an object is noncurrent before Amazon S3 can perform the associated action.

[storageClass](#storageclass_java) This property is required. String

Class of storage used to store the object. Valid Values: `GLACIER`, `STANDARD_IA`, `ONEZONE_IA`, `INTELLIGENT_TIERING`, `DEEP_ARCHIVE`, `GLACIER_IR`.

[newerNoncurrentVersions](#newernoncurrentversions_java) Integer

Number of noncurrent versions Amazon S3 will retain. Must be a non-zero positive integer.

[noncurrentDays](#noncurrentdays_nodejs) This property is required. number

Number of days an object is noncurrent before Amazon S3 can perform the associated action.

[storageClass](#storageclass_nodejs) This property is required. string

Class of storage used to store the object. Valid Values: `GLACIER`, `STANDARD_IA`, `ONEZONE_IA`, `INTELLIGENT_TIERING`, `DEEP_ARCHIVE`, `GLACIER_IR`.

[newerNoncurrentVersions](#newernoncurrentversions_nodejs) number

Number of noncurrent versions Amazon S3 will retain. Must be a non-zero positive integer.

[noncurrent\_days](#noncurrent_days_python) This property is required. int

Number of days an object is noncurrent before Amazon S3 can perform the associated action.

[storage\_class](#storage_class_python) This property is required. str

Class of storage used to store the object. Valid Values: `GLACIER`, `STANDARD_IA`, `ONEZONE_IA`, `INTELLIGENT_TIERING`, `DEEP_ARCHIVE`, `GLACIER_IR`.

[newer\_noncurrent\_versions](#newer_noncurrent_versions_python) int

Number of noncurrent versions Amazon S3 will retain. Must be a non-zero positive integer.

[noncurrentDays](#noncurrentdays_yaml) This property is required. Number

Number of days an object is noncurrent before Amazon S3 can perform the associated action.

[storageClass](#storageclass_yaml) This property is required. String

Class of storage used to store the object. Valid Values: `GLACIER`, `STANDARD_IA`, `ONEZONE_IA`, `INTELLIGENT_TIERING`, `DEEP_ARCHIVE`, `GLACIER_IR`.

[newerNoncurrentVersions](#newernoncurrentversions_yaml) Number

Number of noncurrent versions Amazon S3 will retain. Must be a non-zero positive integer.

#### BucketLifecycleConfigurationV2RuleTransition

, BucketLifecycleConfigurationV2RuleTransitionArgs

[](#bucketlifecycleconfigurationv2ruletransition)

[StorageClass](#storageclass_csharp) This property is required. string

Class of storage used to store the object. Valid Values: `GLACIER`, `STANDARD_IA`, `ONEZONE_IA`, `INTELLIGENT_TIERING`, `DEEP_ARCHIVE`, `GLACIER_IR`.

[Date](#date_csharp) string

Date objects are transitioned to the specified storage class. The date value must be in [RFC3339 full-date format](https://datatracker.ietf.org/doc/html/rfc3339#section-5.6) e.g. `2023-08-22`.

[Days](#days_csharp) int

Number of days after creation when objects are transitioned to the specified storage class. The value must be a positive integer. If both `days` and `date` are not specified, defaults to `0`. Valid values depend on `storageClass`, see [Transition objects using Amazon S3 Lifecycle](https://docs.aws.amazon.com/AmazonS3/latest/userguide/lifecycle-transition-general-considerations.html) for more details.

[StorageClass](#storageclass_go) This property is required. string

Class of storage used to store the object. Valid Values: `GLACIER`, `STANDARD_IA`, `ONEZONE_IA`, `INTELLIGENT_TIERING`, `DEEP_ARCHIVE`, `GLACIER_IR`.

[Date](#date_go) string

Date objects are transitioned to the specified storage class. The date value must be in [RFC3339 full-date format](https://datatracker.ietf.org/doc/html/rfc3339#section-5.6) e.g. `2023-08-22`.

[Days](#days_go) int

Number of days after creation when objects are transitioned to the specified storage class. The value must be a positive integer. If both `days` and `date` are not specified, defaults to `0`. Valid values depend on `storageClass`, see [Transition objects using Amazon S3 Lifecycle](https://docs.aws.amazon.com/AmazonS3/latest/userguide/lifecycle-transition-general-considerations.html) for more details.

[storage\_class](#storage_class_hcl) This property is required. string

Class of storage used to store the object. Valid Values: `GLACIER`, `STANDARD_IA`, `ONEZONE_IA`, `INTELLIGENT_TIERING`, `DEEP_ARCHIVE`, `GLACIER_IR`.

[date](#date_hcl) string

Date objects are transitioned to the specified storage class. The date value must be in [RFC3339 full-date format](https://datatracker.ietf.org/doc/html/rfc3339#section-5.6) e.g. `2023-08-22`.

[days](#days_hcl) number

Number of days after creation when objects are transitioned to the specified storage class. The value must be a positive integer. If both `days` and `date` are not specified, defaults to `0`. Valid values depend on `storageClass`, see [Transition objects using Amazon S3 Lifecycle](https://docs.aws.amazon.com/AmazonS3/latest/userguide/lifecycle-transition-general-considerations.html) for more details.

[storageClass](#storageclass_java) This property is required. String

Class of storage used to store the object. Valid Values: `GLACIER`, `STANDARD_IA`, `ONEZONE_IA`, `INTELLIGENT_TIERING`, `DEEP_ARCHIVE`, `GLACIER_IR`.

[date](#date_java) String

Date objects are transitioned to the specified storage class. The date value must be in [RFC3339 full-date format](https://datatracker.ietf.org/doc/html/rfc3339#section-5.6) e.g. `2023-08-22`.

[days](#days_java) Integer

Number of days after creation when objects are transitioned to the specified storage class. The value must be a positive integer. If both `days` and `date` are not specified, defaults to `0`. Valid values depend on `storageClass`, see [Transition objects using Amazon S3 Lifecycle](https://docs.aws.amazon.com/AmazonS3/latest/userguide/lifecycle-transition-general-considerations.html) for more details.

[storageClass](#storageclass_nodejs) This property is required. string

Class of storage used to store the object. Valid Values: `GLACIER`, `STANDARD_IA`, `ONEZONE_IA`, `INTELLIGENT_TIERING`, `DEEP_ARCHIVE`, `GLACIER_IR`.

[date](#date_nodejs) string

Date objects are transitioned to the specified storage class. The date value must be in [RFC3339 full-date format](https://datatracker.ietf.org/doc/html/rfc3339#section-5.6) e.g. `2023-08-22`.

[days](#days_nodejs) number

Number of days after creation when objects are transitioned to the specified storage class. The value must be a positive integer. If both `days` and `date` are not specified, defaults to `0`. Valid values depend on `storageClass`, see [Transition objects using Amazon S3 Lifecycle](https://docs.aws.amazon.com/AmazonS3/latest/userguide/lifecycle-transition-general-considerations.html) for more details.

[storage\_class](#storage_class_python) This property is required. str

Class of storage used to store the object. Valid Values: `GLACIER`, `STANDARD_IA`, `ONEZONE_IA`, `INTELLIGENT_TIERING`, `DEEP_ARCHIVE`, `GLACIER_IR`.

[date](#date_python) str

Date objects are transitioned to the specified storage class. The date value must be in [RFC3339 full-date format](https://datatracker.ietf.org/doc/html/rfc3339#section-5.6) e.g. `2023-08-22`.

[days](#days_python) int

Number of days after creation when objects are transitioned to the specified storage class. The value must be a positive integer. If both `days` and `date` are not specified, defaults to `0`. Valid values depend on `storageClass`, see [Transition objects using Amazon S3 Lifecycle](https://docs.aws.amazon.com/AmazonS3/latest/userguide/lifecycle-transition-general-considerations.html) for more details.

[storageClass](#storageclass_yaml) This property is required. String

Class of storage used to store the object. Valid Values: `GLACIER`, `STANDARD_IA`, `ONEZONE_IA`, `INTELLIGENT_TIERING`, `DEEP_ARCHIVE`, `GLACIER_IR`.

[date](#date_yaml) String

Date objects are transitioned to the specified storage class. The date value must be in [RFC3339 full-date format](https://datatracker.ietf.org/doc/html/rfc3339#section-5.6) e.g. `2023-08-22`.

[days](#days_yaml) Number

Number of days after creation when objects are transitioned to the specified storage class. The value must be a positive integer. If both `days` and `date` are not specified, defaults to `0`. Valid values depend on `storageClass`, see [Transition objects using Amazon S3 Lifecycle](https://docs.aws.amazon.com/AmazonS3/latest/userguide/lifecycle-transition-general-considerations.html) for more details.

#### BucketLifecycleConfigurationV2Timeouts

, BucketLifecycleConfigurationV2TimeoutsArgs

[](#bucketlifecycleconfigurationv2timeouts)

[Create](#create_csharp) string

A string that can be [parsed as a duration](https://pkg.go.dev/time#ParseDuration) consisting of numbers and unit suffixes, such as "30s" or "2h45m". Valid time units are "s" (seconds), "m" (minutes), "h" (hours).

[Update](#update_csharp) string

A string that can be [parsed as a duration](https://pkg.go.dev/time#ParseDuration) consisting of numbers and unit suffixes, such as "30s" or "2h45m". Valid time units are "s" (seconds), "m" (minutes), "h" (hours).

[Create](#create_go) string

A string that can be [parsed as a duration](https://pkg.go.dev/time#ParseDuration) consisting of numbers and unit suffixes, such as "30s" or "2h45m". Valid time units are "s" (seconds), "m" (minutes), "h" (hours).

[Update](#update_go) string

A string that can be [parsed as a duration](https://pkg.go.dev/time#ParseDuration) consisting of numbers and unit suffixes, such as "30s" or "2h45m". Valid time units are "s" (seconds), "m" (minutes), "h" (hours).

[create](#create_hcl) string

A string that can be [parsed as a duration](https://pkg.go.dev/time#ParseDuration) consisting of numbers and unit suffixes, such as "30s" or "2h45m". Valid time units are "s" (seconds), "m" (minutes), "h" (hours).

[update](#update_hcl) string

A string that can be [parsed as a duration](https://pkg.go.dev/time#ParseDuration) consisting of numbers and unit suffixes, such as "30s" or "2h45m". Valid time units are "s" (seconds), "m" (minutes), "h" (hours).

[create](#create_java) String

A string that can be [parsed as a duration](https://pkg.go.dev/time#ParseDuration) consisting of numbers and unit suffixes, such as "30s" or "2h45m". Valid time units are "s" (seconds), "m" (minutes), "h" (hours).

[update](#update_java) String

A string that can be [parsed as a duration](https://pkg.go.dev/time#ParseDuration) consisting of numbers and unit suffixes, such as "30s" or "2h45m". Valid time units are "s" (seconds), "m" (minutes), "h" (hours).

[create](#create_nodejs) string

A string that can be [parsed as a duration](https://pkg.go.dev/time#ParseDuration) consisting of numbers and unit suffixes, such as "30s" or "2h45m". Valid time units are "s" (seconds), "m" (minutes), "h" (hours).

[update](#update_nodejs) string

A string that can be [parsed as a duration](https://pkg.go.dev/time#ParseDuration) consisting of numbers and unit suffixes, such as "30s" or "2h45m". Valid time units are "s" (seconds), "m" (minutes), "h" (hours).

[create](#create_python) str

A string that can be [parsed as a duration](https://pkg.go.dev/time#ParseDuration) consisting of numbers and unit suffixes, such as "30s" or "2h45m". Valid time units are "s" (seconds), "m" (minutes), "h" (hours).

[update](#update_python) str

A string that can be [parsed as a duration](https://pkg.go.dev/time#ParseDuration) consisting of numbers and unit suffixes, such as "30s" or "2h45m". Valid time units are "s" (seconds), "m" (minutes), "h" (hours).

[create](#create_yaml) String

A string that can be [parsed as a duration](https://pkg.go.dev/time#ParseDuration) consisting of numbers and unit suffixes, such as "30s" or "2h45m". Valid time units are "s" (seconds), "m" (minutes), "h" (hours).

[update](#update_yaml) String

A string that can be [parsed as a duration](https://pkg.go.dev/time#ParseDuration) consisting of numbers and unit suffixes, such as "30s" or "2h45m". Valid time units are "s" (seconds), "m" (minutes), "h" (hours).

## Import[](#import)

### Identity Schema[](#identity-schema)

#### Required[](#required)

-   `bucket` (String) S3 bucket name.

#### Optional[](#optional)

-   `accountId` (String) AWS Account where this resource is managed.
-   `region` (String) Region where this resource is managed.

If the owner (account ID) of the source bucket differs from the account used to configure the AWS Provider, import using the `bucket` and `expectedBucketOwner` separated by a comma (`,`):

Using `pulumi import`, import an S3 bucket lifecycle configuration using the `bucket` or the `bucket` and `expectedBucketOwner` separated by a comma (`,`). For example:

If the owner (account ID) of the source bucket is the same account used to configure the AWS Provider, import using the `bucket`:

```bash
$ pulumi import aws:s3/bucketLifecycleConfigurationV2:BucketLifecycleConfigurationV2 example bucket-name
```

If the owner (account ID) of the source bucket differs from the account used to configure the AWS Provider, import using the `bucket` and `expectedBucketOwner` separated by a comma (`,`):

```bash
$ pulumi import aws:s3/bucketLifecycleConfigurationV2:BucketLifecycleConfigurationV2 example bucket-name,123456789012
```

To learn more about importing existing cloud resources, see [Importing resources](/docs/using-pulumi/adopting-pulumi/import/).

## Package Details[](#package-details)

Repository

[AWS Classic pulumi/pulumi-aws](https://github.com/pulumi/pulumi-aws)

License

Apache-2.0

Notes

This Pulumi package is based on the [`aws` Terraform Provider](https://github.com/hashicorp/terraform-provider-aws).

-   Copy Page

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2fs3%2fbucketlifecycleconfigurationv2]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2fs3%2fbucketlifecycleconfigurationv2%2f\))

#### Try Pulumi Cloud free.
Your team will thank you.

[Start free trial](https://app.pulumi.com/signup?utm_source=registry&utm_medium=right-rail-banner&utm_campaign=try-pulumi-cloud&iaid=docs-try-pulumi-cloud-ad)
