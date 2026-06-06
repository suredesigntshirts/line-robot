---
Source: https://www.pulumi.com/registry/packages/aws/api-docs/iam/getpolicydocument/
Generated: 2026-06-06
Updated: 2026-06-06
---

# aws.iam.getPolicyDocument

1.  [Packages](/registry/)
2.  [Packages](/registry/packages/)
3.  [AWS](/registry/packages/aws/)
4.  [API Docs](/registry/packages/aws/api-docs/)
5.  [iam](/registry/packages/aws/api-docs/iam/)
6.  [getPolicyDocument](/registry/packages/aws/api-docs/iam/getpolicydocument/)

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

Viewing docs for AWS v7.32.0
published on Friday, May 29, 2026 by Pulumi

[Schema (JSON)](/registry/packages/aws/schema.json)

[pulumi/pulumi-aws](https://github.com/pulumi/pulumi-aws)

v7.32.0 (7.x, latest)v6.83.1 (6.x)v5.43.0 (5.x)

# aws.iam.getPolicyDocument[](#aws-iam-getpolicydocument)

Explore with Neo

-   Copy Page

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2fiam%2fgetpolicydocument]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2fiam%2fgetpolicydocument%2f\))

Generates an IAM policy document in JSON format for use with resources that expect policy documents such as `aws.iam.Policy`.

Using this data source to generate policy documents is *optional*. It is also valid to use literal JSON strings in your configuration or to use the `file` interpolation function to read a raw JSON policy document from a file.

## Example Usage[](#example-usage)

### Basic Example[](#basic-example)

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

const example = aws.iam.getPolicyDocument({
    statements: [
        {
            sid: "1",
            actions: [
                "s3:ListAllMyBuckets",
                "s3:GetBucketLocation",
            ],
            resources: ["arn:aws:s3:::*"],
        },
        {
            actions: ["s3:ListBucket"],
            resources: [`arn:aws:s3:::${s3BucketName}`],
            conditions: [{
                test: "StringLike",
                variable: "s3:prefix",
                values: [
                    "",
                    "home/",
                    "home/&{aws:username}/",
                ],
            }],
        },
        {
            actions: ["s3:*"],
            resources: [
                `arn:aws:s3:::${s3BucketName}/home/&{aws:username}`,
                `arn:aws:s3:::${s3BucketName}/home/&{aws:username}/*`,
            ],
        },
    ],
});
const examplePolicy = new aws.iam.Policy("example", {
    name: "example_policy",
    path: "/",
    policy: example.then(example => example.json),
});
```

```python
import pulumi
import pulumi_aws as aws

example = aws.iam.get_policy_document(statements=[
    {
        "sid": "1",
        "actions": [
            "s3:ListAllMyBuckets",
            "s3:GetBucketLocation",
        ],
        "resources": ["arn:aws:s3:::*"],
    },
    {
        "actions": ["s3:ListBucket"],
        "resources": [f"arn:aws:s3:::{s3_bucket_name}"],
        "conditions": [{
            "test": "StringLike",
            "variable": "s3:prefix",
            "values": [
                "",
                "home/",
                "home/&{aws:username}/",
            ],
        }],
    },
    {
        "actions": ["s3:*"],
        "resources": [
            f"arn:aws:s3:::{s3_bucket_name}/home/&{{aws:username}}",
            f"arn:aws:s3:::{s3_bucket_name}/home/&{{aws:username}}/*",
        ],
    },
])
example_policy = aws.iam.Policy("example",
    name="example_policy",
    path="/",
    policy=example.json)
```

```go
package main

import (
	"fmt"

	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/iam"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		example, err := iam.GetPolicyDocument(ctx, &iam.GetPolicyDocumentArgs{
			Statements: []iam.GetPolicyDocumentStatement{
				{
					Sid: pulumi.StringRef("1"),
					Actions: []string{
						"s3:ListAllMyBuckets",
						"s3:GetBucketLocation",
					},
					Resources: []string{
						"arn:aws:s3:::*",
					},
				},
				{
					Actions: []string{
						"s3:ListBucket",
					},
					Resources: []string{
						fmt.Sprintf("arn:aws:s3:::%v", s3BucketName),
					},
					Conditions: []iam.GetPolicyDocumentStatementCondition{
						{
							Test:     "StringLike",
							Variable: "s3:prefix",
							Values: []string{
								"",
								"home/",
								"home/&{aws:username}/",
							},
						},
					},
				},
				{
					Actions: []string{
						"s3:*",
					},
					Resources: []string{
						fmt.Sprintf("arn:aws:s3:::%v/home/&{aws:username}", s3BucketName),
						fmt.Sprintf("arn:aws:s3:::%v/home/&{aws:username}/*", s3BucketName),
					},
				},
			},
		}, nil)
		if err != nil {
			return err
		}
		_, err = iam.NewPolicy(ctx, "example", &iam.PolicyArgs{
			Name:   pulumi.String("example_policy"),
			Path:   pulumi.String("/"),
			Policy: pulumi.String(pulumi.String(example.Json)),
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
    var example = Aws.Iam.GetPolicyDocument.Invoke(new()
    {
        Statements = new[]
        {
            new Aws.Iam.Inputs.GetPolicyDocumentStatementInputArgs
            {
                Sid = "1",
                Actions = new[]
                {
                    "s3:ListAllMyBuckets",
                    "s3:GetBucketLocation",
                },
                Resources = new[]
                {
                    "arn:aws:s3:::*",
                },
            },
            new Aws.Iam.Inputs.GetPolicyDocumentStatementInputArgs
            {
                Actions = new[]
                {
                    "s3:ListBucket",
                },
                Resources = new[]
                {
                    $"arn:aws:s3:::{s3BucketName}",
                },
                Conditions = new[]
                {
                    new Aws.Iam.Inputs.GetPolicyDocumentStatementConditionInputArgs
                    {
                        Test = "StringLike",
                        Variable = "s3:prefix",
                        Values = new[]
                        {
                            "",
                            "home/",
                            "home/&{aws:username}/",
                        },
                    },
                },
            },
            new Aws.Iam.Inputs.GetPolicyDocumentStatementInputArgs
            {
                Actions = new[]
                {
                    "s3:*",
                },
                Resources = new[]
                {
                    $"arn:aws:s3:::{s3BucketName}/home/&{{aws:username}}",
                    $"arn:aws:s3:::{s3BucketName}/home/&{{aws:username}}/*",
                },
            },
        },
    });

    var examplePolicy = new Aws.Iam.Policy("example", new()
    {
        Name = "example_policy",
        Path = "/",
        PolicyDocument = example.Apply(getPolicyDocumentResult => getPolicyDocumentResult.Json),
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.iam.IamFunctions;
import com.pulumi.aws.iam.inputs.GetPolicyDocumentArgs;
import com.pulumi.aws.iam.Policy;
import com.pulumi.aws.iam.PolicyArgs;
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
        final var example = IamFunctions.getPolicyDocument(GetPolicyDocumentArgs.builder()
            .statements(
                GetPolicyDocumentStatementArgs.builder()
                    .sid("1")
                    .actions(
                        "s3:ListAllMyBuckets",
                        "s3:GetBucketLocation")
                    .resources("arn:aws:s3:::*")
                    .build(),
                GetPolicyDocumentStatementArgs.builder()
                    .actions("s3:ListBucket")
                    .resources(String.format("arn:aws:s3:::%s", s3BucketName))
                    .conditions(GetPolicyDocumentStatementConditionArgs.builder()
                        .test("StringLike")
                        .variable("s3:prefix")
                        .values(
                            "",
                            "home/",
                            "home/&{aws:username}/")
                        .build())
                    .build(),
                GetPolicyDocumentStatementArgs.builder()
                    .actions("s3:*")
                    .resources(
                        String.format("arn:aws:s3:::%s/home/&{{aws:username}}", s3BucketName),
                        String.format("arn:aws:s3:::%s/home/&{{aws:username}}/*", s3BucketName))
                    .build())
            .build());

        var examplePolicy = new Policy("examplePolicy", PolicyArgs.builder()
            .name("example_policy")
            .path("/")
            .policy(example.json())
            .build());

    }
}
```

```yaml
resources:
  examplePolicy:
    type: aws:iam:Policy
    name: example
    properties:
      name: example_policy
      path: /
      policy: ${example.json}
variables:
  example:
    fn::invoke:
      function: aws:iam:getPolicyDocument
      arguments:
        statements:
          - sid: '1'
            actions:
              - s3:ListAllMyBuckets
              - s3:GetBucketLocation
            resources:
              - arn:aws:s3:::*
          - actions:
              - s3:ListBucket
            resources:
              - arn:aws:s3:::${s3BucketName}
            conditions:
              - test: StringLike
                variable: s3:prefix
                values:
                  - ""
                  - home/
                  - home/&{aws:username}/
          - actions:
              - s3:*
            resources:
              - arn:aws:s3:::${s3BucketName}/home/&{aws:username}
              - arn:aws:s3:::${s3BucketName}/home/&{aws:username}/*
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

data "aws_iam_getpolicydocument" "example" {
  statements {
    sid       = "1"
    actions   = ["s3:ListAllMyBuckets", "s3:GetBucketLocation"]
    resources = ["arn:aws:s3:::*"]
  }
  statements {
    actions   = ["s3:ListBucket"]
    resources = ["arn:aws:s3:::${s3BucketName}"]
    conditions {
      test     = "StringLike"
      variable = "s3:prefix"
      values   = ["", "home/", "home/&{aws:username}/"]
    }
  }
  statements {
    actions   = ["s3:*"]
    resources = ["arn:aws:s3:::${s3BucketName}/home/&{aws:username}", "arn:aws:s3:::${s3BucketName}/home/&{aws:username}/*"]
  }
}

resource "aws_iam_policy" "example" {
  name   = "example_policy"
  path   = "/"
  policy = data.aws_iam_getpolicydocument.example.json
}
```

### Example Multiple Condition Keys and Values[](#example-multiple-condition-keys-and-values)

You can specify a [condition with multiple keys and values](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_multi-value-conditions.html) by supplying multiple `condition` blocks with the same `test` value, but differing `variable` and `values` values.

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

const exampleMultipleConditionKeysAndValues = aws.iam.getPolicyDocument({
    statements: [{
        actions: [
            "kms:Decrypt",
            "kms:GenerateDataKey",
        ],
        resources: ["*"],
        conditions: [
            {
                test: "ForAnyValue:StringEquals",
                variable: "kms:EncryptionContext:service",
                values: ["pi"],
            },
            {
                test: "ForAnyValue:StringEquals",
                variable: "kms:EncryptionContext:aws:pi:service",
                values: ["rds"],
            },
            {
                test: "ForAnyValue:StringEquals",
                variable: "kms:EncryptionContext:aws:rds:db-id",
                values: [
                    "db-AAAAABBBBBCCCCCDDDDDEEEEE",
                    "db-EEEEEDDDDDCCCCCBBBBBAAAAA",
                ],
            },
        ],
    }],
});
```

```python
import pulumi
import pulumi_aws as aws

example_multiple_condition_keys_and_values = aws.iam.get_policy_document(statements=[{
    "actions": [
        "kms:Decrypt",
        "kms:GenerateDataKey",
    ],
    "resources": ["*"],
    "conditions": [
        {
            "test": "ForAnyValue:StringEquals",
            "variable": "kms:EncryptionContext:service",
            "values": ["pi"],
        },
        {
            "test": "ForAnyValue:StringEquals",
            "variable": "kms:EncryptionContext:aws:pi:service",
            "values": ["rds"],
        },
        {
            "test": "ForAnyValue:StringEquals",
            "variable": "kms:EncryptionContext:aws:rds:db-id",
            "values": [
                "db-AAAAABBBBBCCCCCDDDDDEEEEE",
                "db-EEEEEDDDDDCCCCCBBBBBAAAAA",
            ],
        },
    ],
}])
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/iam"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		_, err := iam.GetPolicyDocument(ctx, &iam.GetPolicyDocumentArgs{
			Statements: []iam.GetPolicyDocumentStatement{
				{
					Actions: []string{
						"kms:Decrypt",
						"kms:GenerateDataKey",
					},
					Resources: []string{
						"*",
					},
					Conditions: []iam.GetPolicyDocumentStatementCondition{
						{
							Test:     "ForAnyValue:StringEquals",
							Variable: "kms:EncryptionContext:service",
							Values: []string{
								"pi",
							},
						},
						{
							Test:     "ForAnyValue:StringEquals",
							Variable: "kms:EncryptionContext:aws:pi:service",
							Values: []string{
								"rds",
							},
						},
						{
							Test:     "ForAnyValue:StringEquals",
							Variable: "kms:EncryptionContext:aws:rds:db-id",
							Values: []string{
								"db-AAAAABBBBBCCCCCDDDDDEEEEE",
								"db-EEEEEDDDDDCCCCCBBBBBAAAAA",
							},
						},
					},
				},
			},
		}, nil)
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
    var exampleMultipleConditionKeysAndValues = Aws.Iam.GetPolicyDocument.Invoke(new()
    {
        Statements = new[]
        {
            new Aws.Iam.Inputs.GetPolicyDocumentStatementInputArgs
            {
                Actions = new[]
                {
                    "kms:Decrypt",
                    "kms:GenerateDataKey",
                },
                Resources = new[]
                {
                    "*",
                },
                Conditions = new[]
                {
                    new Aws.Iam.Inputs.GetPolicyDocumentStatementConditionInputArgs
                    {
                        Test = "ForAnyValue:StringEquals",
                        Variable = "kms:EncryptionContext:service",
                        Values = new[]
                        {
                            "pi",
                        },
                    },
                    new Aws.Iam.Inputs.GetPolicyDocumentStatementConditionInputArgs
                    {
                        Test = "ForAnyValue:StringEquals",
                        Variable = "kms:EncryptionContext:aws:pi:service",
                        Values = new[]
                        {
                            "rds",
                        },
                    },
                    new Aws.Iam.Inputs.GetPolicyDocumentStatementConditionInputArgs
                    {
                        Test = "ForAnyValue:StringEquals",
                        Variable = "kms:EncryptionContext:aws:rds:db-id",
                        Values = new[]
                        {
                            "db-AAAAABBBBBCCCCCDDDDDEEEEE",
                            "db-EEEEEDDDDDCCCCCBBBBBAAAAA",
                        },
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
import com.pulumi.aws.iam.IamFunctions;
import com.pulumi.aws.iam.inputs.GetPolicyDocumentArgs;
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
        final var exampleMultipleConditionKeysAndValues = IamFunctions.getPolicyDocument(GetPolicyDocumentArgs.builder()
            .statements(GetPolicyDocumentStatementArgs.builder()
                .actions(
                    "kms:Decrypt",
                    "kms:GenerateDataKey")
                .resources("*")
                .conditions(
                    GetPolicyDocumentStatementConditionArgs.builder()
                        .test("ForAnyValue:StringEquals")
                        .variable("kms:EncryptionContext:service")
                        .values("pi")
                        .build(),
                    GetPolicyDocumentStatementConditionArgs.builder()
                        .test("ForAnyValue:StringEquals")
                        .variable("kms:EncryptionContext:aws:pi:service")
                        .values("rds")
                        .build(),
                    GetPolicyDocumentStatementConditionArgs.builder()
                        .test("ForAnyValue:StringEquals")
                        .variable("kms:EncryptionContext:aws:rds:db-id")
                        .values(
                            "db-AAAAABBBBBCCCCCDDDDDEEEEE",
                            "db-EEEEEDDDDDCCCCCBBBBBAAAAA")
                        .build())
                .build())
            .build());

    }
}
```

```yaml
variables:
  exampleMultipleConditionKeysAndValues:
    fn::invoke:
      function: aws:iam:getPolicyDocument
      arguments:
        statements:
          - actions:
              - kms:Decrypt
              - kms:GenerateDataKey
            resources:
              - '*'
            conditions:
              - test: ForAnyValue:StringEquals
                variable: kms:EncryptionContext:service
                values:
                  - pi
              - test: ForAnyValue:StringEquals
                variable: kms:EncryptionContext:aws:pi:service
                values:
                  - rds
              - test: ForAnyValue:StringEquals
                variable: kms:EncryptionContext:aws:rds:db-id
                values:
                  - db-AAAAABBBBBCCCCCDDDDDEEEEE
                  - db-EEEEEDDDDDCCCCCBBBBBAAAAA
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

data "aws_iam_getpolicydocument" "exampleMultipleConditionKeysAndValues" {
  statements {
    actions   = ["kms:Decrypt", "kms:GenerateDataKey"]
    resources = ["*"]
    conditions {
      test     = "ForAnyValue:StringEquals"
      variable = "kms:EncryptionContext:service"
      values   = ["pi"]
    }
    conditions {
      test     = "ForAnyValue:StringEquals"
      variable = "kms:EncryptionContext:aws:pi:service"
      values   = ["rds"]
    }
    conditions {
      test     = "ForAnyValue:StringEquals"
      variable = "kms:EncryptionContext:aws:rds:db-id"
      values   = ["db-AAAAABBBBBCCCCCDDDDDEEEEE", "db-EEEEEDDDDDCCCCCBBBBBAAAAA"]
    }
  }
}
```

`data.aws_iam_policy_document.example_multiple_condition_keys_and_values.json` will evaluate to:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "",
      "Effect": "Allow",
      "Action": [
        "kms:GenerateDataKey",
        "kms:Decrypt"
      ],
      "Resource": "*",
      "Condition": {
        "ForAnyValue:StringEquals": {
          "kms:EncryptionContext:aws:pi:service": "rds",
          "kms:EncryptionContext:aws:rds:db-id": [
            "db-AAAAABBBBBCCCCCDDDDDEEEEE",
            "db-EEEEEDDDDDCCCCCBBBBBAAAAA"
          ],
          "kms:EncryptionContext:service": "pi"
        }
      }
    }
  ]
}
```

### Example Assume-Role Policy with Multiple Principals[](#example-assume-role-policy-with-multiple-principals)

You can specify multiple principal blocks with different types. You can also use this data source to generate an assume-role policy.

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

const eventStreamBucketRoleAssumeRolePolicy = aws.iam.getPolicyDocument({
    statements: [{
        actions: ["sts:AssumeRole"],
        principals: [
            {
                type: "Service",
                identifiers: ["firehose.amazonaws.com"],
            },
            {
                type: "AWS",
                identifiers: [trustedRoleArn],
            },
            {
                type: "Federated",
                identifiers: [
                    `arn:aws:iam::${accountId}:saml-provider/${providerName}`,
                    "cognito-identity.amazonaws.com",
                ],
            },
        ],
    }],
});
```

```python
import pulumi
import pulumi_aws as aws

event_stream_bucket_role_assume_role_policy = aws.iam.get_policy_document(statements=[{
    "actions": ["sts:AssumeRole"],
    "principals": [
        {
            "type": "Service",
            "identifiers": ["firehose.amazonaws.com"],
        },
        {
            "type": "AWS",
            "identifiers": [trusted_role_arn],
        },
        {
            "type": "Federated",
            "identifiers": [
                f"arn:aws:iam::{account_id}:saml-provider/{provider_name}",
                "cognito-identity.amazonaws.com",
            ],
        },
    ],
}])
```

```go
package main

import (
	"fmt"

	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/iam"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		_, err := iam.GetPolicyDocument(ctx, &iam.GetPolicyDocumentArgs{
			Statements: []iam.GetPolicyDocumentStatement{
				{
					Actions: []string{
						"sts:AssumeRole",
					},
					Principals: []iam.GetPolicyDocumentStatementPrincipal{
						{
							Type: "Service",
							Identifiers: []string{
								"firehose.amazonaws.com",
							},
						},
						{
							Type: "AWS",
							Identifiers: pulumi.StringArray{
								trustedRoleArn,
							},
						},
						{
							Type: "Federated",
							Identifiers: []string{
								fmt.Sprintf("arn:aws:iam::%v:saml-provider/%v", accountId, providerName),
								"cognito-identity.amazonaws.com",
							},
						},
					},
				},
			},
		}, nil)
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
    var eventStreamBucketRoleAssumeRolePolicy = Aws.Iam.GetPolicyDocument.Invoke(new()
    {
        Statements = new[]
        {
            new Aws.Iam.Inputs.GetPolicyDocumentStatementInputArgs
            {
                Actions = new[]
                {
                    "sts:AssumeRole",
                },
                Principals = new[]
                {
                    new Aws.Iam.Inputs.GetPolicyDocumentStatementPrincipalInputArgs
                    {
                        Type = "Service",
                        Identifiers = new[]
                        {
                            "firehose.amazonaws.com",
                        },
                    },
                    new Aws.Iam.Inputs.GetPolicyDocumentStatementPrincipalInputArgs
                    {
                        Type = "AWS",
                        Identifiers = new[]
                        {
                            trustedRoleArn,
                        },
                    },
                    new Aws.Iam.Inputs.GetPolicyDocumentStatementPrincipalInputArgs
                    {
                        Type = "Federated",
                        Identifiers = new[]
                        {
                            $"arn:aws:iam::{accountId}:saml-provider/{providerName}",
                            "cognito-identity.amazonaws.com",
                        },
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
import com.pulumi.aws.iam.IamFunctions;
import com.pulumi.aws.iam.inputs.GetPolicyDocumentArgs;
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
        final var eventStreamBucketRoleAssumeRolePolicy = IamFunctions.getPolicyDocument(GetPolicyDocumentArgs.builder()
            .statements(GetPolicyDocumentStatementArgs.builder()
                .actions("sts:AssumeRole")
                .principals(
                    GetPolicyDocumentStatementPrincipalArgs.builder()
                        .type("Service")
                        .identifiers("firehose.amazonaws.com")
                        .build(),
                    GetPolicyDocumentStatementPrincipalArgs.builder()
                        .type("AWS")
                        .identifiers(trustedRoleArn)
                        .build(),
                    GetPolicyDocumentStatementPrincipalArgs.builder()
                        .type("Federated")
                        .identifiers(
                            String.format("arn:aws:iam::%s:saml-provider/%s", accountId,providerName),
                            "cognito-identity.amazonaws.com")
                        .build())
                .build())
            .build());

    }
}
```

```yaml
variables:
  eventStreamBucketRoleAssumeRolePolicy:
    fn::invoke:
      function: aws:iam:getPolicyDocument
      arguments:
        statements:
          - actions:
              - sts:AssumeRole
            principals:
              - type: Service
                identifiers:
                  - firehose.amazonaws.com
              - type: AWS
                identifiers:
                  - ${trustedRoleArn}
              - type: Federated
                identifiers:
                  - arn:aws:iam::${accountId}:saml-provider/${providerName}
                  - cognito-identity.amazonaws.com
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

data "aws_iam_getpolicydocument" "eventStreamBucketRoleAssumeRolePolicy" {
  statements {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["firehose.amazonaws.com"]
    }
    principals {
      type        = "AWS"
      identifiers = [trustedRoleArn]
    }
    principals {
      type        = "Federated"
      identifiers = ["arn:aws:iam::${accountId}:saml-provider/${providerName}", "cognito-identity.amazonaws.com"]
    }
  }
}
```

### Example Using A Source Document[](#example-using-a-source-document)

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

const source = aws.iam.getPolicyDocument({
    statements: [
        {
            actions: ["ec2:*"],
            resources: ["*"],
        },
        {
            sid: "SidToOverride",
            actions: ["s3:*"],
            resources: ["*"],
        },
    ],
});
const sourceDocumentExample = source.then(source => aws.iam.getPolicyDocument({
    sourcePolicyDocuments: [source.json],
    statements: [{
        sid: "SidToOverride",
        actions: ["s3:*"],
        resources: [
            "arn:aws:s3:::somebucket",
            "arn:aws:s3:::somebucket/*",
        ],
    }],
}));
```

```python
import pulumi
import pulumi_aws as aws

source = aws.iam.get_policy_document(statements=[
    {
        "actions": ["ec2:*"],
        "resources": ["*"],
    },
    {
        "sid": "SidToOverride",
        "actions": ["s3:*"],
        "resources": ["*"],
    },
])
source_document_example = aws.iam.get_policy_document(source_policy_documents=[source.json],
    statements=[{
        "sid": "SidToOverride",
        "actions": ["s3:*"],
        "resources": [
            "arn:aws:s3:::somebucket",
            "arn:aws:s3:::somebucket/*",
        ],
    }])
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/iam"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		source, err := iam.GetPolicyDocument(ctx, &iam.GetPolicyDocumentArgs{
			Statements: []iam.GetPolicyDocumentStatement{
				{
					Actions: []string{
						"ec2:*",
					},
					Resources: []string{
						"*",
					},
				},
				{
					Sid: pulumi.StringRef("SidToOverride"),
					Actions: []string{
						"s3:*",
					},
					Resources: []string{
						"*",
					},
				},
			},
		}, nil)
		if err != nil {
			return err
		}
		_, err = iam.GetPolicyDocument(ctx, &iam.GetPolicyDocumentArgs{
			SourcePolicyDocuments: pulumi.StringArray{
				source.Json,
			},
			Statements: []iam.GetPolicyDocumentStatement{
				{
					Sid: pulumi.StringRef("SidToOverride"),
					Actions: []string{
						"s3:*",
					},
					Resources: []string{
						"arn:aws:s3:::somebucket",
						"arn:aws:s3:::somebucket/*",
					},
				},
			},
		}, nil)
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
    var source = Aws.Iam.GetPolicyDocument.Invoke(new()
    {
        Statements = new[]
        {
            new Aws.Iam.Inputs.GetPolicyDocumentStatementInputArgs
            {
                Actions = new[]
                {
                    "ec2:*",
                },
                Resources = new[]
                {
                    "*",
                },
            },
            new Aws.Iam.Inputs.GetPolicyDocumentStatementInputArgs
            {
                Sid = "SidToOverride",
                Actions = new[]
                {
                    "s3:*",
                },
                Resources = new[]
                {
                    "*",
                },
            },
        },
    });

    var sourceDocumentExample = Aws.Iam.GetPolicyDocument.Invoke(new()
    {
        SourcePolicyDocuments = new[]
        {
            source.Apply(getPolicyDocumentResult => getPolicyDocumentResult.Json),
        },
        Statements = new[]
        {
            new Aws.Iam.Inputs.GetPolicyDocumentStatementInputArgs
            {
                Sid = "SidToOverride",
                Actions = new[]
                {
                    "s3:*",
                },
                Resources = new[]
                {
                    "arn:aws:s3:::somebucket",
                    "arn:aws:s3:::somebucket/*",
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
import com.pulumi.aws.iam.IamFunctions;
import com.pulumi.aws.iam.inputs.GetPolicyDocumentArgs;
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
        final var source = IamFunctions.getPolicyDocument(GetPolicyDocumentArgs.builder()
            .statements(
                GetPolicyDocumentStatementArgs.builder()
                    .actions("ec2:*")
                    .resources("*")
                    .build(),
                GetPolicyDocumentStatementArgs.builder()
                    .sid("SidToOverride")
                    .actions("s3:*")
                    .resources("*")
                    .build())
            .build());

        final var sourceDocumentExample = IamFunctions.getPolicyDocument(GetPolicyDocumentArgs.builder()
            .sourcePolicyDocuments(source.json())
            .statements(GetPolicyDocumentStatementArgs.builder()
                .sid("SidToOverride")
                .actions("s3:*")
                .resources(
                    "arn:aws:s3:::somebucket",
                    "arn:aws:s3:::somebucket/*")
                .build())
            .build());

    }
}
```

```yaml
variables:
  source:
    fn::invoke:
      function: aws:iam:getPolicyDocument
      arguments:
        statements:
          - actions:
              - ec2:*
            resources:
              - '*'
          - sid: SidToOverride
            actions:
              - s3:*
            resources:
              - '*'
  sourceDocumentExample:
    fn::invoke:
      function: aws:iam:getPolicyDocument
      arguments:
        sourcePolicyDocuments:
          - ${source.json}
        statements:
          - sid: SidToOverride
            actions:
              - s3:*
            resources:
              - arn:aws:s3:::somebucket
              - arn:aws:s3:::somebucket/*
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

data "aws_iam_getpolicydocument" "source" {
  statements {
    actions   = ["ec2:*"]
    resources = ["*"]
  }
  statements {
    sid       = "SidToOverride"
    actions   = ["s3:*"]
    resources = ["*"]
  }
}
data "aws_iam_getpolicydocument" "sourceDocumentExample" {
  source_policy_documents = [data.aws_iam_getpolicydocument.source.json]
  statements {
    sid       = "SidToOverride"
    actions   = ["s3:*"]
    resources = ["arn:aws:s3:::somebucket", "arn:aws:s3:::somebucket/*"]
  }
}
```

`data.aws_iam_policy_document.source_document_example.json` will evaluate to:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "",
      "Effect": "Allow",
      "Action": "ec2:*",
      "Resource": "*"
    },
    {
      "Sid": "SidToOverride",
      "Effect": "Allow",
      "Action": "s3:*",
      "Resource": [
        "arn:aws:s3:::somebucket/*",
        "arn:aws:s3:::somebucket"
      ]
    }
  ]
}
```

### Example Using An Override Document[](#example-using-an-override-document)

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

const override = aws.iam.getPolicyDocument({
    statements: [{
        sid: "SidToOverride",
        actions: ["s3:*"],
        resources: ["*"],
    }],
});
const overridePolicyDocumentExample = override.then(override => aws.iam.getPolicyDocument({
    overridePolicyDocuments: [override.json],
    statements: [
        {
            actions: ["ec2:*"],
            resources: ["*"],
        },
        {
            sid: "SidToOverride",
            actions: ["s3:*"],
            resources: [
                "arn:aws:s3:::somebucket",
                "arn:aws:s3:::somebucket/*",
            ],
        },
    ],
}));
```

```python
import pulumi
import pulumi_aws as aws

override = aws.iam.get_policy_document(statements=[{
    "sid": "SidToOverride",
    "actions": ["s3:*"],
    "resources": ["*"],
}])
override_policy_document_example = aws.iam.get_policy_document(override_policy_documents=[override.json],
    statements=[
        {
            "actions": ["ec2:*"],
            "resources": ["*"],
        },
        {
            "sid": "SidToOverride",
            "actions": ["s3:*"],
            "resources": [
                "arn:aws:s3:::somebucket",
                "arn:aws:s3:::somebucket/*",
            ],
        },
    ])
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/iam"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		override, err := iam.GetPolicyDocument(ctx, &iam.GetPolicyDocumentArgs{
			Statements: []iam.GetPolicyDocumentStatement{
				{
					Sid: pulumi.StringRef("SidToOverride"),
					Actions: []string{
						"s3:*",
					},
					Resources: []string{
						"*",
					},
				},
			},
		}, nil)
		if err != nil {
			return err
		}
		_, err = iam.GetPolicyDocument(ctx, &iam.GetPolicyDocumentArgs{
			OverridePolicyDocuments: pulumi.StringArray{
				override.Json,
			},
			Statements: []iam.GetPolicyDocumentStatement{
				{
					Actions: []string{
						"ec2:*",
					},
					Resources: []string{
						"*",
					},
				},
				{
					Sid: pulumi.StringRef("SidToOverride"),
					Actions: []string{
						"s3:*",
					},
					Resources: []string{
						"arn:aws:s3:::somebucket",
						"arn:aws:s3:::somebucket/*",
					},
				},
			},
		}, nil)
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
    var @override = Aws.Iam.GetPolicyDocument.Invoke(new()
    {
        Statements = new[]
        {
            new Aws.Iam.Inputs.GetPolicyDocumentStatementInputArgs
            {
                Sid = "SidToOverride",
                Actions = new[]
                {
                    "s3:*",
                },
                Resources = new[]
                {
                    "*",
                },
            },
        },
    });

    var overridePolicyDocumentExample = Aws.Iam.GetPolicyDocument.Invoke(new()
    {
        OverridePolicyDocuments = new[]
        {
            @override.Apply(getPolicyDocumentResult => getPolicyDocumentResult.Json),
        },
        Statements = new[]
        {
            new Aws.Iam.Inputs.GetPolicyDocumentStatementInputArgs
            {
                Actions = new[]
                {
                    "ec2:*",
                },
                Resources = new[]
                {
                    "*",
                },
            },
            new Aws.Iam.Inputs.GetPolicyDocumentStatementInputArgs
            {
                Sid = "SidToOverride",
                Actions = new[]
                {
                    "s3:*",
                },
                Resources = new[]
                {
                    "arn:aws:s3:::somebucket",
                    "arn:aws:s3:::somebucket/*",
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
import com.pulumi.aws.iam.IamFunctions;
import com.pulumi.aws.iam.inputs.GetPolicyDocumentArgs;
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
        final var override = IamFunctions.getPolicyDocument(GetPolicyDocumentArgs.builder()
            .statements(GetPolicyDocumentStatementArgs.builder()
                .sid("SidToOverride")
                .actions("s3:*")
                .resources("*")
                .build())
            .build());

        final var overridePolicyDocumentExample = IamFunctions.getPolicyDocument(GetPolicyDocumentArgs.builder()
            .overridePolicyDocuments(override.json())
            .statements(
                GetPolicyDocumentStatementArgs.builder()
                    .actions("ec2:*")
                    .resources("*")
                    .build(),
                GetPolicyDocumentStatementArgs.builder()
                    .sid("SidToOverride")
                    .actions("s3:*")
                    .resources(
                        "arn:aws:s3:::somebucket",
                        "arn:aws:s3:::somebucket/*")
                    .build())
            .build());

    }
}
```

```yaml
variables:
  override:
    fn::invoke:
      function: aws:iam:getPolicyDocument
      arguments:
        statements:
          - sid: SidToOverride
            actions:
              - s3:*
            resources:
              - '*'
  overridePolicyDocumentExample:
    fn::invoke:
      function: aws:iam:getPolicyDocument
      arguments:
        overridePolicyDocuments:
          - ${override.json}
        statements:
          - actions:
              - ec2:*
            resources:
              - '*'
          - sid: SidToOverride
            actions:
              - s3:*
            resources:
              - arn:aws:s3:::somebucket
              - arn:aws:s3:::somebucket/*
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

data "aws_iam_getpolicydocument" "override" {
  statements {
    sid       = "SidToOverride"
    actions   = ["s3:*"]
    resources = ["*"]
  }
}
data "aws_iam_getpolicydocument" "overridePolicyDocumentExample" {
  override_policy_documents = [data.aws_iam_getpolicydocument.override.json]
  statements {
    actions   = ["ec2:*"]
    resources = ["*"]
  }
  statements {
    sid       = "SidToOverride"
    actions   = ["s3:*"]
    resources = ["arn:aws:s3:::somebucket", "arn:aws:s3:::somebucket/*"]
  }
}
```

`data.aws_iam_policy_document.override_policy_document_example.json` will evaluate to:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "",
      "Effect": "Allow",
      "Action": "ec2:*",
      "Resource": "*"
    },
    {
      "Sid": "SidToOverride",
      "Effect": "Allow",
      "Action": "s3:*",
      "Resource": "*"
    }
  ]
}
```

### Example with Both Source and Override Documents[](#example-with-both-source-and-override-documents)

You can also combine `sourcePolicyDocuments` and `overridePolicyDocuments` in the same document.

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

const source = aws.iam.getPolicyDocument({
    statements: [{
        sid: "OverridePlaceholder",
        actions: ["ec2:DescribeAccountAttributes"],
        resources: ["*"],
    }],
});
const override = aws.iam.getPolicyDocument({
    statements: [{
        sid: "OverridePlaceholder",
        actions: ["s3:GetObject"],
        resources: ["*"],
    }],
});
const politik = Promise.all([source, override]).then(([source, override]) => aws.iam.getPolicyDocument({
    sourcePolicyDocuments: [source.json],
    overridePolicyDocuments: [override.json],
}));
```

```python
import pulumi
import pulumi_aws as aws

source = aws.iam.get_policy_document(statements=[{
    "sid": "OverridePlaceholder",
    "actions": ["ec2:DescribeAccountAttributes"],
    "resources": ["*"],
}])
override = aws.iam.get_policy_document(statements=[{
    "sid": "OverridePlaceholder",
    "actions": ["s3:GetObject"],
    "resources": ["*"],
}])
politik = aws.iam.get_policy_document(source_policy_documents=[source.json],
    override_policy_documents=[override.json])
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/iam"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		source, err := iam.GetPolicyDocument(ctx, &iam.GetPolicyDocumentArgs{
			Statements: []iam.GetPolicyDocumentStatement{
				{
					Sid: pulumi.StringRef("OverridePlaceholder"),
					Actions: []string{
						"ec2:DescribeAccountAttributes",
					},
					Resources: []string{
						"*",
					},
				},
			},
		}, nil)
		if err != nil {
			return err
		}
		override, err := iam.GetPolicyDocument(ctx, &iam.GetPolicyDocumentArgs{
			Statements: []iam.GetPolicyDocumentStatement{
				{
					Sid: pulumi.StringRef("OverridePlaceholder"),
					Actions: []string{
						"s3:GetObject",
					},
					Resources: []string{
						"*",
					},
				},
			},
		}, nil)
		if err != nil {
			return err
		}
		_, err = iam.GetPolicyDocument(ctx, &iam.GetPolicyDocumentArgs{
			SourcePolicyDocuments: pulumi.StringArray{
				source.Json,
			},
			OverridePolicyDocuments: pulumi.StringArray{
				override.Json,
			},
		}, nil)
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
    var source = Aws.Iam.GetPolicyDocument.Invoke(new()
    {
        Statements = new[]
        {
            new Aws.Iam.Inputs.GetPolicyDocumentStatementInputArgs
            {
                Sid = "OverridePlaceholder",
                Actions = new[]
                {
                    "ec2:DescribeAccountAttributes",
                },
                Resources = new[]
                {
                    "*",
                },
            },
        },
    });

    var @override = Aws.Iam.GetPolicyDocument.Invoke(new()
    {
        Statements = new[]
        {
            new Aws.Iam.Inputs.GetPolicyDocumentStatementInputArgs
            {
                Sid = "OverridePlaceholder",
                Actions = new[]
                {
                    "s3:GetObject",
                },
                Resources = new[]
                {
                    "*",
                },
            },
        },
    });

    var politik = Aws.Iam.GetPolicyDocument.Invoke(new()
    {
        SourcePolicyDocuments = new[]
        {
            source.Apply(getPolicyDocumentResult => getPolicyDocumentResult.Json),
        },
        OverridePolicyDocuments = new[]
        {
            @override.Apply(getPolicyDocumentResult => getPolicyDocumentResult.Json),
        },
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.iam.IamFunctions;
import com.pulumi.aws.iam.inputs.GetPolicyDocumentArgs;
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
        final var source = IamFunctions.getPolicyDocument(GetPolicyDocumentArgs.builder()
            .statements(GetPolicyDocumentStatementArgs.builder()
                .sid("OverridePlaceholder")
                .actions("ec2:DescribeAccountAttributes")
                .resources("*")
                .build())
            .build());

        final var override = IamFunctions.getPolicyDocument(GetPolicyDocumentArgs.builder()
            .statements(GetPolicyDocumentStatementArgs.builder()
                .sid("OverridePlaceholder")
                .actions("s3:GetObject")
                .resources("*")
                .build())
            .build());

        final var politik = IamFunctions.getPolicyDocument(GetPolicyDocumentArgs.builder()
            .sourcePolicyDocuments(source.json())
            .overridePolicyDocuments(override.json())
            .build());

    }
}
```

```yaml
variables:
  source:
    fn::invoke:
      function: aws:iam:getPolicyDocument
      arguments:
        statements:
          - sid: OverridePlaceholder
            actions:
              - ec2:DescribeAccountAttributes
            resources:
              - '*'
  override:
    fn::invoke:
      function: aws:iam:getPolicyDocument
      arguments:
        statements:
          - sid: OverridePlaceholder
            actions:
              - s3:GetObject
            resources:
              - '*'
  politik:
    fn::invoke:
      function: aws:iam:getPolicyDocument
      arguments:
        sourcePolicyDocuments:
          - ${source.json}
        overridePolicyDocuments:
          - ${override.json}
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

data "aws_iam_getpolicydocument" "source" {
  statements {
    sid       = "OverridePlaceholder"
    actions   = ["ec2:DescribeAccountAttributes"]
    resources = ["*"]
  }
}
data "aws_iam_getpolicydocument" "override" {
  statements {
    sid       = "OverridePlaceholder"
    actions   = ["s3:GetObject"]
    resources = ["*"]
  }
}
data "aws_iam_getpolicydocument" "politik" {
  source_policy_documents   = [data.aws_iam_getpolicydocument.source.json]
  override_policy_documents = [data.aws_iam_getpolicydocument.override.json]
}
```

`data.aws_iam_policy_document.politik.json` will evaluate to:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "OverridePlaceholder",
      "Effect": "Allow",
      "Action": "s3:GetObject",
      "Resource": "*"
    }
  ]
}
```

### Example of Merging Source Documents[](#example-of-merging-source-documents)

Multiple documents can be combined using the `sourcePolicyDocuments` or `overridePolicyDocuments` attributes. `sourcePolicyDocuments` requires that all documents have unique Sids, while `overridePolicyDocuments` will iteratively override matching Sids.

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

const sourceOne = aws.iam.getPolicyDocument({
    statements: [
        {
            actions: ["ec2:*"],
            resources: ["*"],
        },
        {
            sid: "UniqueSidOne",
            actions: ["s3:*"],
            resources: ["*"],
        },
    ],
});
const sourceTwo = aws.iam.getPolicyDocument({
    statements: [
        {
            sid: "UniqueSidTwo",
            actions: ["iam:*"],
            resources: ["*"],
        },
        {
            actions: ["lambda:*"],
            resources: ["*"],
        },
    ],
});
const combined = Promise.all([sourceOne, sourceTwo]).then(([sourceOne, sourceTwo]) => aws.iam.getPolicyDocument({
    sourcePolicyDocuments: [
        sourceOne.json,
        sourceTwo.json,
    ],
}));
```

```python
import pulumi
import pulumi_aws as aws

source_one = aws.iam.get_policy_document(statements=[
    {
        "actions": ["ec2:*"],
        "resources": ["*"],
    },
    {
        "sid": "UniqueSidOne",
        "actions": ["s3:*"],
        "resources": ["*"],
    },
])
source_two = aws.iam.get_policy_document(statements=[
    {
        "sid": "UniqueSidTwo",
        "actions": ["iam:*"],
        "resources": ["*"],
    },
    {
        "actions": ["lambda:*"],
        "resources": ["*"],
    },
])
combined = aws.iam.get_policy_document(source_policy_documents=[
    source_one.json,
    source_two.json,
])
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/iam"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		sourceOne, err := iam.GetPolicyDocument(ctx, &iam.GetPolicyDocumentArgs{
			Statements: []iam.GetPolicyDocumentStatement{
				{
					Actions: []string{
						"ec2:*",
					},
					Resources: []string{
						"*",
					},
				},
				{
					Sid: pulumi.StringRef("UniqueSidOne"),
					Actions: []string{
						"s3:*",
					},
					Resources: []string{
						"*",
					},
				},
			},
		}, nil)
		if err != nil {
			return err
		}
		sourceTwo, err := iam.GetPolicyDocument(ctx, &iam.GetPolicyDocumentArgs{
			Statements: []iam.GetPolicyDocumentStatement{
				{
					Sid: pulumi.StringRef("UniqueSidTwo"),
					Actions: []string{
						"iam:*",
					},
					Resources: []string{
						"*",
					},
				},
				{
					Actions: []string{
						"lambda:*",
					},
					Resources: []string{
						"*",
					},
				},
			},
		}, nil)
		if err != nil {
			return err
		}
		_, err = iam.GetPolicyDocument(ctx, &iam.GetPolicyDocumentArgs{
			SourcePolicyDocuments: pulumi.StringArray{
				sourceOne.Json,
				sourceTwo.Json,
			},
		}, nil)
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
    var sourceOne = Aws.Iam.GetPolicyDocument.Invoke(new()
    {
        Statements = new[]
        {
            new Aws.Iam.Inputs.GetPolicyDocumentStatementInputArgs
            {
                Actions = new[]
                {
                    "ec2:*",
                },
                Resources = new[]
                {
                    "*",
                },
            },
            new Aws.Iam.Inputs.GetPolicyDocumentStatementInputArgs
            {
                Sid = "UniqueSidOne",
                Actions = new[]
                {
                    "s3:*",
                },
                Resources = new[]
                {
                    "*",
                },
            },
        },
    });

    var sourceTwo = Aws.Iam.GetPolicyDocument.Invoke(new()
    {
        Statements = new[]
        {
            new Aws.Iam.Inputs.GetPolicyDocumentStatementInputArgs
            {
                Sid = "UniqueSidTwo",
                Actions = new[]
                {
                    "iam:*",
                },
                Resources = new[]
                {
                    "*",
                },
            },
            new Aws.Iam.Inputs.GetPolicyDocumentStatementInputArgs
            {
                Actions = new[]
                {
                    "lambda:*",
                },
                Resources = new[]
                {
                    "*",
                },
            },
        },
    });

    var combined = Aws.Iam.GetPolicyDocument.Invoke(new()
    {
        SourcePolicyDocuments = new[]
        {
            sourceOne.Apply(getPolicyDocumentResult => getPolicyDocumentResult.Json),
            sourceTwo.Apply(getPolicyDocumentResult => getPolicyDocumentResult.Json),
        },
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.iam.IamFunctions;
import com.pulumi.aws.iam.inputs.GetPolicyDocumentArgs;
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
        final var sourceOne = IamFunctions.getPolicyDocument(GetPolicyDocumentArgs.builder()
            .statements(
                GetPolicyDocumentStatementArgs.builder()
                    .actions("ec2:*")
                    .resources("*")
                    .build(),
                GetPolicyDocumentStatementArgs.builder()
                    .sid("UniqueSidOne")
                    .actions("s3:*")
                    .resources("*")
                    .build())
            .build());

        final var sourceTwo = IamFunctions.getPolicyDocument(GetPolicyDocumentArgs.builder()
            .statements(
                GetPolicyDocumentStatementArgs.builder()
                    .sid("UniqueSidTwo")
                    .actions("iam:*")
                    .resources("*")
                    .build(),
                GetPolicyDocumentStatementArgs.builder()
                    .actions("lambda:*")
                    .resources("*")
                    .build())
            .build());

        final var combined = IamFunctions.getPolicyDocument(GetPolicyDocumentArgs.builder()
            .sourcePolicyDocuments(
                sourceOne.json(),
                sourceTwo.json())
            .build());

    }
}
```

```yaml
variables:
  sourceOne:
    fn::invoke:
      function: aws:iam:getPolicyDocument
      arguments:
        statements:
          - actions:
              - ec2:*
            resources:
              - '*'
          - sid: UniqueSidOne
            actions:
              - s3:*
            resources:
              - '*'
  sourceTwo:
    fn::invoke:
      function: aws:iam:getPolicyDocument
      arguments:
        statements:
          - sid: UniqueSidTwo
            actions:
              - iam:*
            resources:
              - '*'
          - actions:
              - lambda:*
            resources:
              - '*'
  combined:
    fn::invoke:
      function: aws:iam:getPolicyDocument
      arguments:
        sourcePolicyDocuments:
          - ${sourceOne.json}
          - ${sourceTwo.json}
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

data "aws_iam_getpolicydocument" "sourceOne" {
  statements {
    actions   = ["ec2:*"]
    resources = ["*"]
  }
  statements {
    sid       = "UniqueSidOne"
    actions   = ["s3:*"]
    resources = ["*"]
  }
}
data "aws_iam_getpolicydocument" "sourceTwo" {
  statements {
    sid       = "UniqueSidTwo"
    actions   = ["iam:*"]
    resources = ["*"]
  }
  statements {
    actions   = ["lambda:*"]
    resources = ["*"]
  }
}
data "aws_iam_getpolicydocument" "combined" {
  source_policy_documents = [data.aws_iam_getpolicydocument.sourceOne.json, data.aws_iam_getpolicydocument.sourceTwo.json]
}
```

`data.aws_iam_policy_document.combined.json` will evaluate to:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "",
      "Effect": "Allow",
      "Action": "ec2:*",
      "Resource": "*"
    },
    {
      "Sid": "UniqueSidOne",
      "Effect": "Allow",
      "Action": "s3:*",
      "Resource": "*"
    },
    {
      "Sid": "UniqueSidTwo",
      "Effect": "Allow",
      "Action": "iam:*",
      "Resource": "*"
    },
    {
      "Sid": "",
      "Effect": "Allow",
      "Action": "lambda:*",
      "Resource": "*"
    }
  ]
}
```

### Example of Merging Override Documents[](#example-of-merging-override-documents)

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

const policyOne = aws.iam.getPolicyDocument({
    statements: [{
        sid: "OverridePlaceHolderOne",
        effect: "Allow",
        actions: ["s3:*"],
        resources: ["*"],
    }],
});
const policyTwo = aws.iam.getPolicyDocument({
    statements: [
        {
            effect: "Allow",
            actions: ["ec2:*"],
            resources: ["*"],
        },
        {
            sid: "OverridePlaceHolderTwo",
            effect: "Allow",
            actions: ["iam:*"],
            resources: ["*"],
        },
    ],
});
const policyThree = aws.iam.getPolicyDocument({
    statements: [{
        sid: "OverridePlaceHolderOne",
        effect: "Deny",
        actions: ["logs:*"],
        resources: ["*"],
    }],
});
const combined = Promise.all([policyOne, policyTwo, policyThree]).then(([policyOne, policyTwo, policyThree]) => aws.iam.getPolicyDocument({
    overridePolicyDocuments: [
        policyOne.json,
        policyTwo.json,
        policyThree.json,
    ],
    statements: [{
        sid: "OverridePlaceHolderTwo",
        effect: "Deny",
        actions: ["*"],
        resources: ["*"],
    }],
}));
```

```python
import pulumi
import pulumi_aws as aws

policy_one = aws.iam.get_policy_document(statements=[{
    "sid": "OverridePlaceHolderOne",
    "effect": "Allow",
    "actions": ["s3:*"],
    "resources": ["*"],
}])
policy_two = aws.iam.get_policy_document(statements=[
    {
        "effect": "Allow",
        "actions": ["ec2:*"],
        "resources": ["*"],
    },
    {
        "sid": "OverridePlaceHolderTwo",
        "effect": "Allow",
        "actions": ["iam:*"],
        "resources": ["*"],
    },
])
policy_three = aws.iam.get_policy_document(statements=[{
    "sid": "OverridePlaceHolderOne",
    "effect": "Deny",
    "actions": ["logs:*"],
    "resources": ["*"],
}])
combined = aws.iam.get_policy_document(override_policy_documents=[
        policy_one.json,
        policy_two.json,
        policy_three.json,
    ],
    statements=[{
        "sid": "OverridePlaceHolderTwo",
        "effect": "Deny",
        "actions": ["*"],
        "resources": ["*"],
    }])
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/iam"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		policyOne, err := iam.GetPolicyDocument(ctx, &iam.GetPolicyDocumentArgs{
			Statements: []iam.GetPolicyDocumentStatement{
				{
					Sid:    pulumi.StringRef("OverridePlaceHolderOne"),
					Effect: pulumi.StringRef("Allow"),
					Actions: []string{
						"s3:*",
					},
					Resources: []string{
						"*",
					},
				},
			},
		}, nil)
		if err != nil {
			return err
		}
		policyTwo, err := iam.GetPolicyDocument(ctx, &iam.GetPolicyDocumentArgs{
			Statements: []iam.GetPolicyDocumentStatement{
				{
					Effect: pulumi.StringRef("Allow"),
					Actions: []string{
						"ec2:*",
					},
					Resources: []string{
						"*",
					},
				},
				{
					Sid:    pulumi.StringRef("OverridePlaceHolderTwo"),
					Effect: pulumi.StringRef("Allow"),
					Actions: []string{
						"iam:*",
					},
					Resources: []string{
						"*",
					},
				},
			},
		}, nil)
		if err != nil {
			return err
		}
		policyThree, err := iam.GetPolicyDocument(ctx, &iam.GetPolicyDocumentArgs{
			Statements: []iam.GetPolicyDocumentStatement{
				{
					Sid:    pulumi.StringRef("OverridePlaceHolderOne"),
					Effect: pulumi.StringRef("Deny"),
					Actions: []string{
						"logs:*",
					},
					Resources: []string{
						"*",
					},
				},
			},
		}, nil)
		if err != nil {
			return err
		}
		_, err = iam.GetPolicyDocument(ctx, &iam.GetPolicyDocumentArgs{
			OverridePolicyDocuments: pulumi.StringArray{
				policyOne.Json,
				policyTwo.Json,
				policyThree.Json,
			},
			Statements: []iam.GetPolicyDocumentStatement{
				{
					Sid:    pulumi.StringRef("OverridePlaceHolderTwo"),
					Effect: pulumi.StringRef("Deny"),
					Actions: []string{
						"*",
					},
					Resources: []string{
						"*",
					},
				},
			},
		}, nil)
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
    var policyOne = Aws.Iam.GetPolicyDocument.Invoke(new()
    {
        Statements = new[]
        {
            new Aws.Iam.Inputs.GetPolicyDocumentStatementInputArgs
            {
                Sid = "OverridePlaceHolderOne",
                Effect = "Allow",
                Actions = new[]
                {
                    "s3:*",
                },
                Resources = new[]
                {
                    "*",
                },
            },
        },
    });

    var policyTwo = Aws.Iam.GetPolicyDocument.Invoke(new()
    {
        Statements = new[]
        {
            new Aws.Iam.Inputs.GetPolicyDocumentStatementInputArgs
            {
                Effect = "Allow",
                Actions = new[]
                {
                    "ec2:*",
                },
                Resources = new[]
                {
                    "*",
                },
            },
            new Aws.Iam.Inputs.GetPolicyDocumentStatementInputArgs
            {
                Sid = "OverridePlaceHolderTwo",
                Effect = "Allow",
                Actions = new[]
                {
                    "iam:*",
                },
                Resources = new[]
                {
                    "*",
                },
            },
        },
    });

    var policyThree = Aws.Iam.GetPolicyDocument.Invoke(new()
    {
        Statements = new[]
        {
            new Aws.Iam.Inputs.GetPolicyDocumentStatementInputArgs
            {
                Sid = "OverridePlaceHolderOne",
                Effect = "Deny",
                Actions = new[]
                {
                    "logs:*",
                },
                Resources = new[]
                {
                    "*",
                },
            },
        },
    });

    var combined = Aws.Iam.GetPolicyDocument.Invoke(new()
    {
        OverridePolicyDocuments = new[]
        {
            policyOne.Apply(getPolicyDocumentResult => getPolicyDocumentResult.Json),
            policyTwo.Apply(getPolicyDocumentResult => getPolicyDocumentResult.Json),
            policyThree.Apply(getPolicyDocumentResult => getPolicyDocumentResult.Json),
        },
        Statements = new[]
        {
            new Aws.Iam.Inputs.GetPolicyDocumentStatementInputArgs
            {
                Sid = "OverridePlaceHolderTwo",
                Effect = "Deny",
                Actions = new[]
                {
                    "*",
                },
                Resources = new[]
                {
                    "*",
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
import com.pulumi.aws.iam.IamFunctions;
import com.pulumi.aws.iam.inputs.GetPolicyDocumentArgs;
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
        final var policyOne = IamFunctions.getPolicyDocument(GetPolicyDocumentArgs.builder()
            .statements(GetPolicyDocumentStatementArgs.builder()
                .sid("OverridePlaceHolderOne")
                .effect("Allow")
                .actions("s3:*")
                .resources("*")
                .build())
            .build());

        final var policyTwo = IamFunctions.getPolicyDocument(GetPolicyDocumentArgs.builder()
            .statements(
                GetPolicyDocumentStatementArgs.builder()
                    .effect("Allow")
                    .actions("ec2:*")
                    .resources("*")
                    .build(),
                GetPolicyDocumentStatementArgs.builder()
                    .sid("OverridePlaceHolderTwo")
                    .effect("Allow")
                    .actions("iam:*")
                    .resources("*")
                    .build())
            .build());

        final var policyThree = IamFunctions.getPolicyDocument(GetPolicyDocumentArgs.builder()
            .statements(GetPolicyDocumentStatementArgs.builder()
                .sid("OverridePlaceHolderOne")
                .effect("Deny")
                .actions("logs:*")
                .resources("*")
                .build())
            .build());

        final var combined = IamFunctions.getPolicyDocument(GetPolicyDocumentArgs.builder()
            .overridePolicyDocuments(
                policyOne.json(),
                policyTwo.json(),
                policyThree.json())
            .statements(GetPolicyDocumentStatementArgs.builder()
                .sid("OverridePlaceHolderTwo")
                .effect("Deny")
                .actions("*")
                .resources("*")
                .build())
            .build());

    }
}
```

```yaml
variables:
  policyOne:
    fn::invoke:
      function: aws:iam:getPolicyDocument
      arguments:
        statements:
          - sid: OverridePlaceHolderOne
            effect: Allow
            actions:
              - s3:*
            resources:
              - '*'
  policyTwo:
    fn::invoke:
      function: aws:iam:getPolicyDocument
      arguments:
        statements:
          - effect: Allow
            actions:
              - ec2:*
            resources:
              - '*'
          - sid: OverridePlaceHolderTwo
            effect: Allow
            actions:
              - iam:*
            resources:
              - '*'
  policyThree:
    fn::invoke:
      function: aws:iam:getPolicyDocument
      arguments:
        statements:
          - sid: OverridePlaceHolderOne
            effect: Deny
            actions:
              - logs:*
            resources:
              - '*'
  combined:
    fn::invoke:
      function: aws:iam:getPolicyDocument
      arguments:
        overridePolicyDocuments:
          - ${policyOne.json}
          - ${policyTwo.json}
          - ${policyThree.json}
        statements:
          - sid: OverridePlaceHolderTwo
            effect: Deny
            actions:
              - '*'
            resources:
              - '*'
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

data "aws_iam_getpolicydocument" "policyOne" {
  statements {
    sid       = "OverridePlaceHolderOne"
    effect    = "Allow"
    actions   = ["s3:*"]
    resources = ["*"]
  }
}
data "aws_iam_getpolicydocument" "policyTwo" {
  statements {
    effect    = "Allow"
    actions   = ["ec2:*"]
    resources = ["*"]
  }
  statements {
    sid       = "OverridePlaceHolderTwo"
    effect    = "Allow"
    actions   = ["iam:*"]
    resources = ["*"]
  }
}
data "aws_iam_getpolicydocument" "policyThree" {
  statements {
    sid       = "OverridePlaceHolderOne"
    effect    = "Deny"
    actions   = ["logs:*"]
    resources = ["*"]
  }
}
data "aws_iam_getpolicydocument" "combined" {
  override_policy_documents = [data.aws_iam_getpolicydocument.policyOne.json, data.aws_iam_getpolicydocument.policyTwo.json, data.aws_iam_getpolicydocument.policyThree.json]
  statements {
    sid       = "OverridePlaceHolderTwo"
    effect    = "Deny"
    actions   = ["*"]
    resources = ["*"]
  }
}
```

`data.aws_iam_policy_document.combined.json` will evaluate to:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "OverridePlaceholderTwo",
      "Effect": "Allow",
      "Action": "iam:*",
      "Resource": "*"
    },
    {
      "Sid": "OverridePlaceholderOne",
      "Effect": "Deny",
      "Action": "logs:*",
      "Resource": "*"
    },
    {
      "Sid": "",
      "Effect": "Allow",
      "Action": "ec2:*",
      "Resource": "*"
    },
  ]
}
```

## Using getPolicyDocument[](#using)

Two invocation forms are available. The direct form accepts plain arguments and either blocks until the result value is available, or returns a Promise-wrapped result. The output form accepts Input-wrapped arguments and returns an Output-wrapped result.

-   TypeScript
-   Python
-   Go
-   C#
-   Java
-   YAML
-   HCL PREVIEW

```typescript
function getPolicyDocument(args: GetPolicyDocumentArgs, opts?: InvokeOptions): Promise<GetPolicyDocumentResult>
function getPolicyDocumentOutput(args: GetPolicyDocumentOutputArgs, opts?: InvokeOptions): Output<GetPolicyDocumentResult>
```

```python
def get_policy_document(override_json: Optional[str] = None,
                        override_policy_documents: Optional[Sequence[str]] = None,
                        policy_id: Optional[str] = None,
                        source_json: Optional[str] = None,
                        source_policy_documents: Optional[Sequence[str]] = None,
                        statements: Optional[Sequence[GetPolicyDocumentStatement]] = None,
                        version: Optional[str] = None,
                        opts: Optional[InvokeOptions] = None) -> GetPolicyDocumentResult
def get_policy_document_output(override_json: pulumi.Input[Optional[str]] = None,
                        override_policy_documents: pulumi.Input[Optional[Sequence[pulumi.Input[str]]]] = None,
                        policy_id: pulumi.Input[Optional[str]] = None,
                        source_json: pulumi.Input[Optional[str]] = None,
                        source_policy_documents: pulumi.Input[Optional[Sequence[pulumi.Input[str]]]] = None,
                        statements: pulumi.Input[Optional[Sequence[pulumi.Input[GetPolicyDocumentStatementArgs]]]] = None,
                        version: pulumi.Input[Optional[str]] = None,
                        opts: Optional[InvokeOptions] = None) -> Output[GetPolicyDocumentResult]
```

```go
func GetPolicyDocument(ctx *Context, args *GetPolicyDocumentArgs, opts ...InvokeOption) (*GetPolicyDocumentResult, error)
func GetPolicyDocumentOutput(ctx *Context, args *GetPolicyDocumentOutputArgs, opts ...InvokeOption) GetPolicyDocumentResultOutput
```

\> Note: This function is named `GetPolicyDocument` in the Go SDK.

```csharp
public static class GetPolicyDocument
{
    public static Task<GetPolicyDocumentResult> InvokeAsync(GetPolicyDocumentArgs args, InvokeOptions? opts = null)
    public static Output<GetPolicyDocumentResult> Invoke(GetPolicyDocumentInvokeArgs args, InvokeOptions? opts = null)
}
```

```java
public static CompletableFuture<GetPolicyDocumentResult> getPolicyDocument(GetPolicyDocumentArgs args, InvokeOptions options)
public static Output<GetPolicyDocumentResult> getPolicyDocument(GetPolicyDocumentArgs args, InvokeOptions options)
```

```yaml
fn::invoke:
  function: aws:iam/getPolicyDocument:getPolicyDocument
  arguments:
    # arguments dictionary
```

```hcl
data "aws_iam_getpolicydocument" "name" {
    # arguments
}
```

The following arguments are supported:

[OverrideJson](#overridejson_csharp) string

Deprecated: override\_json is deprecated. This argument is retained only for backward compatibility with previous versions of this data source.

[OverridePolicyDocuments](#overridepolicydocuments_csharp) List<string>

List of IAM policy documents that are merged together into the exported document. In merging, statements with non-blank `sid`s will override statements with the same `sid` from earlier documents in the list. Statements with non-blank `sid`s will also override statements with the same `sid` from `sourcePolicyDocuments`. Non-overriding statements will be added to the exported document.

[PolicyId](#policyid_csharp) string

ID for the policy document.

[SourceJson](#sourcejson_csharp) string

Deprecated: source\_json is deprecated. This argument is retained only for backward compatibility with previous versions of this data source.

[SourcePolicyDocuments](#sourcepolicydocuments_csharp) List<string>

List of IAM policy documents that are merged together into the exported document. Statements defined in `sourcePolicyDocuments` must have unique `sid`s. Statements with the same `sid` from `overridePolicyDocuments` will override source statements.

[Statements](#statements_csharp) [List<GetPolicyDocumentStatement>](#getpolicydocumentstatement)

Configuration block for a policy statement. Detailed below.

[Version](#version_csharp) string

IAM policy document version. Valid values are `2008-10-17` and `2012-10-17`. Defaults to `2012-10-17`. For more information, see the [AWS IAM User Guide](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements_version.html).

[OverrideJson](#overridejson_go) string

Deprecated: override\_json is deprecated. This argument is retained only for backward compatibility with previous versions of this data source.

[OverridePolicyDocuments](#overridepolicydocuments_go) \[\]string

List of IAM policy documents that are merged together into the exported document. In merging, statements with non-blank `sid`s will override statements with the same `sid` from earlier documents in the list. Statements with non-blank `sid`s will also override statements with the same `sid` from `sourcePolicyDocuments`. Non-overriding statements will be added to the exported document.

[PolicyId](#policyid_go) string

ID for the policy document.

[SourceJson](#sourcejson_go) string

Deprecated: source\_json is deprecated. This argument is retained only for backward compatibility with previous versions of this data source.

[SourcePolicyDocuments](#sourcepolicydocuments_go) \[\]string

List of IAM policy documents that are merged together into the exported document. Statements defined in `sourcePolicyDocuments` must have unique `sid`s. Statements with the same `sid` from `overridePolicyDocuments` will override source statements.

[Statements](#statements_go) [\[\]GetPolicyDocumentStatement](#getpolicydocumentstatement)

Configuration block for a policy statement. Detailed below.

[Version](#version_go) string

IAM policy document version. Valid values are `2008-10-17` and `2012-10-17`. Defaults to `2012-10-17`. For more information, see the [AWS IAM User Guide](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements_version.html).

[override\_json](#override_json_hcl) string

Deprecated: override\_json is deprecated. This argument is retained only for backward compatibility with previous versions of this data source.

[override\_policy\_documents](#override_policy_documents_hcl) list(string)

List of IAM policy documents that are merged together into the exported document. In merging, statements with non-blank `sid`s will override statements with the same `sid` from earlier documents in the list. Statements with non-blank `sid`s will also override statements with the same `sid` from `sourcePolicyDocuments`. Non-overriding statements will be added to the exported document.

[policy\_id](#policy_id_hcl) string

ID for the policy document.

[source\_json](#source_json_hcl) string

Deprecated: source\_json is deprecated. This argument is retained only for backward compatibility with previous versions of this data source.

[source\_policy\_documents](#source_policy_documents_hcl) list(string)

List of IAM policy documents that are merged together into the exported document. Statements defined in `sourcePolicyDocuments` must have unique `sid`s. Statements with the same `sid` from `overridePolicyDocuments` will override source statements.

[statements](#statements_hcl) [list(object)](#getpolicydocumentstatement)

Configuration block for a policy statement. Detailed below.

[version](#version_hcl) string

IAM policy document version. Valid values are `2008-10-17` and `2012-10-17`. Defaults to `2012-10-17`. For more information, see the [AWS IAM User Guide](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements_version.html).

[overrideJson](#overridejson_java) String

Deprecated: override\_json is deprecated. This argument is retained only for backward compatibility with previous versions of this data source.

[overridePolicyDocuments](#overridepolicydocuments_java) List<String>

List of IAM policy documents that are merged together into the exported document. In merging, statements with non-blank `sid`s will override statements with the same `sid` from earlier documents in the list. Statements with non-blank `sid`s will also override statements with the same `sid` from `sourcePolicyDocuments`. Non-overriding statements will be added to the exported document.

[policyId](#policyid_java) String

ID for the policy document.

[sourceJson](#sourcejson_java) String

Deprecated: source\_json is deprecated. This argument is retained only for backward compatibility with previous versions of this data source.

[sourcePolicyDocuments](#sourcepolicydocuments_java) List<String>

List of IAM policy documents that are merged together into the exported document. Statements defined in `sourcePolicyDocuments` must have unique `sid`s. Statements with the same `sid` from `overridePolicyDocuments` will override source statements.

[statements](#statements_java) [List<GetPolicyDocumentStatement>](#getpolicydocumentstatement)

Configuration block for a policy statement. Detailed below.

[version](#version_java) String

IAM policy document version. Valid values are `2008-10-17` and `2012-10-17`. Defaults to `2012-10-17`. For more information, see the [AWS IAM User Guide](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements_version.html).

[overrideJson](#overridejson_nodejs) string

Deprecated: override\_json is deprecated. This argument is retained only for backward compatibility with previous versions of this data source.

[overridePolicyDocuments](#overridepolicydocuments_nodejs) string\[\]

List of IAM policy documents that are merged together into the exported document. In merging, statements with non-blank `sid`s will override statements with the same `sid` from earlier documents in the list. Statements with non-blank `sid`s will also override statements with the same `sid` from `sourcePolicyDocuments`. Non-overriding statements will be added to the exported document.

[policyId](#policyid_nodejs) string

ID for the policy document.

[sourceJson](#sourcejson_nodejs) string

Deprecated: source\_json is deprecated. This argument is retained only for backward compatibility with previous versions of this data source.

[sourcePolicyDocuments](#sourcepolicydocuments_nodejs) string\[\]

List of IAM policy documents that are merged together into the exported document. Statements defined in `sourcePolicyDocuments` must have unique `sid`s. Statements with the same `sid` from `overridePolicyDocuments` will override source statements.

[statements](#statements_nodejs) [GetPolicyDocumentStatement\[\]](#getpolicydocumentstatement)

Configuration block for a policy statement. Detailed below.

[version](#version_nodejs) string

IAM policy document version. Valid values are `2008-10-17` and `2012-10-17`. Defaults to `2012-10-17`. For more information, see the [AWS IAM User Guide](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements_version.html).

[override\_json](#override_json_python) str

Deprecated: override\_json is deprecated. This argument is retained only for backward compatibility with previous versions of this data source.

[override\_policy\_documents](#override_policy_documents_python) Sequence\[str\]

List of IAM policy documents that are merged together into the exported document. In merging, statements with non-blank `sid`s will override statements with the same `sid` from earlier documents in the list. Statements with non-blank `sid`s will also override statements with the same `sid` from `sourcePolicyDocuments`. Non-overriding statements will be added to the exported document.

[policy\_id](#policy_id_python) str

ID for the policy document.

[source\_json](#source_json_python) str

Deprecated: source\_json is deprecated. This argument is retained only for backward compatibility with previous versions of this data source.

[source\_policy\_documents](#source_policy_documents_python) Sequence\[str\]

List of IAM policy documents that are merged together into the exported document. Statements defined in `sourcePolicyDocuments` must have unique `sid`s. Statements with the same `sid` from `overridePolicyDocuments` will override source statements.

[statements](#statements_python) [Sequence\[GetPolicyDocumentStatement\]](#getpolicydocumentstatement)

Configuration block for a policy statement. Detailed below.

[version](#version_python) str

IAM policy document version. Valid values are `2008-10-17` and `2012-10-17`. Defaults to `2012-10-17`. For more information, see the [AWS IAM User Guide](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements_version.html).

[overrideJson](#overridejson_yaml) String

Deprecated: override\_json is deprecated. This argument is retained only for backward compatibility with previous versions of this data source.

[overridePolicyDocuments](#overridepolicydocuments_yaml) List<String>

List of IAM policy documents that are merged together into the exported document. In merging, statements with non-blank `sid`s will override statements with the same `sid` from earlier documents in the list. Statements with non-blank `sid`s will also override statements with the same `sid` from `sourcePolicyDocuments`. Non-overriding statements will be added to the exported document.

[policyId](#policyid_yaml) String

ID for the policy document.

[sourceJson](#sourcejson_yaml) String

Deprecated: source\_json is deprecated. This argument is retained only for backward compatibility with previous versions of this data source.

[sourcePolicyDocuments](#sourcepolicydocuments_yaml) List<String>

List of IAM policy documents that are merged together into the exported document. Statements defined in `sourcePolicyDocuments` must have unique `sid`s. Statements with the same `sid` from `overridePolicyDocuments` will override source statements.

[statements](#statements_yaml) [List<Property Map>](#getpolicydocumentstatement)

Configuration block for a policy statement. Detailed below.

[version](#version_yaml) String

IAM policy document version. Valid values are `2008-10-17` and `2012-10-17`. Defaults to `2012-10-17`. For more information, see the [AWS IAM User Guide](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements_version.html).

## getPolicyDocument Result[](#result)

The following output properties are available:

[Id](#id_csharp) string

The provider-assigned unique ID for this managed resource.

[Json](#json_csharp) string

Standard JSON policy document rendered based on the arguments above.

[MinifiedJson](#minifiedjson_csharp) string

Minified JSON policy document rendered based on the arguments above.

[OverrideJson](#overridejson_csharp) string

Deprecated: override\_json is deprecated. This argument is retained only for backward compatibility with previous versions of this data source.

[OverridePolicyDocuments](#overridepolicydocuments_csharp) List<string>

[PolicyId](#policyid_csharp) string

[SourceJson](#sourcejson_csharp) string

Deprecated: source\_json is deprecated. This argument is retained only for backward compatibility with previous versions of this data source.

[SourcePolicyDocuments](#sourcepolicydocuments_csharp) List<string>

[Statements](#statements_csharp) [List<GetPolicyDocumentStatement>](#getpolicydocumentstatement)

[Version](#version_csharp) string

[Id](#id_go) string

The provider-assigned unique ID for this managed resource.

[Json](#json_go) string

Standard JSON policy document rendered based on the arguments above.

[MinifiedJson](#minifiedjson_go) string

Minified JSON policy document rendered based on the arguments above.

[OverrideJson](#overridejson_go) string

Deprecated: override\_json is deprecated. This argument is retained only for backward compatibility with previous versions of this data source.

[OverridePolicyDocuments](#overridepolicydocuments_go) \[\]string

[PolicyId](#policyid_go) string

[SourceJson](#sourcejson_go) string

Deprecated: source\_json is deprecated. This argument is retained only for backward compatibility with previous versions of this data source.

[SourcePolicyDocuments](#sourcepolicydocuments_go) \[\]string

[Statements](#statements_go) [\[\]GetPolicyDocumentStatement](#getpolicydocumentstatement)

[Version](#version_go) string

[id](#id_hcl) string

The provider-assigned unique ID for this managed resource.

[json](#json_hcl) string

Standard JSON policy document rendered based on the arguments above.

[minified\_json](#minified_json_hcl) string

Minified JSON policy document rendered based on the arguments above.

[override\_json](#override_json_hcl) string

Deprecated: override\_json is deprecated. This argument is retained only for backward compatibility with previous versions of this data source.

[override\_policy\_documents](#override_policy_documents_hcl) list(string)

[policy\_id](#policy_id_hcl) string

[source\_json](#source_json_hcl) string

Deprecated: source\_json is deprecated. This argument is retained only for backward compatibility with previous versions of this data source.

[source\_policy\_documents](#source_policy_documents_hcl) list(string)

[statements](#statements_hcl) [list(object)](#getpolicydocumentstatement)

[version](#version_hcl) string

[id](#id_java) String

The provider-assigned unique ID for this managed resource.

[json](#json_java) String

Standard JSON policy document rendered based on the arguments above.

[minifiedJson](#minifiedjson_java) String

Minified JSON policy document rendered based on the arguments above.

[overrideJson](#overridejson_java) String

Deprecated: override\_json is deprecated. This argument is retained only for backward compatibility with previous versions of this data source.

[overridePolicyDocuments](#overridepolicydocuments_java) List<String>

[policyId](#policyid_java) String

[sourceJson](#sourcejson_java) String

Deprecated: source\_json is deprecated. This argument is retained only for backward compatibility with previous versions of this data source.

[sourcePolicyDocuments](#sourcepolicydocuments_java) List<String>

[statements](#statements_java) [List<GetPolicyDocumentStatement>](#getpolicydocumentstatement)

[version](#version_java) String

[id](#id_nodejs) string

The provider-assigned unique ID for this managed resource.

[json](#json_nodejs) string

Standard JSON policy document rendered based on the arguments above.

[minifiedJson](#minifiedjson_nodejs) string

Minified JSON policy document rendered based on the arguments above.

[overrideJson](#overridejson_nodejs) string

Deprecated: override\_json is deprecated. This argument is retained only for backward compatibility with previous versions of this data source.

[overridePolicyDocuments](#overridepolicydocuments_nodejs) string\[\]

[policyId](#policyid_nodejs) string

[sourceJson](#sourcejson_nodejs) string

Deprecated: source\_json is deprecated. This argument is retained only for backward compatibility with previous versions of this data source.

[sourcePolicyDocuments](#sourcepolicydocuments_nodejs) string\[\]

[statements](#statements_nodejs) [GetPolicyDocumentStatement\[\]](#getpolicydocumentstatement)

[version](#version_nodejs) string

[id](#id_python) str

The provider-assigned unique ID for this managed resource.

[json](#json_python) str

Standard JSON policy document rendered based on the arguments above.

[minified\_json](#minified_json_python) str

Minified JSON policy document rendered based on the arguments above.

[override\_json](#override_json_python) str

Deprecated: override\_json is deprecated. This argument is retained only for backward compatibility with previous versions of this data source.

[override\_policy\_documents](#override_policy_documents_python) Sequence\[str\]

[policy\_id](#policy_id_python) str

[source\_json](#source_json_python) str

Deprecated: source\_json is deprecated. This argument is retained only for backward compatibility with previous versions of this data source.

[source\_policy\_documents](#source_policy_documents_python) Sequence\[str\]

[statements](#statements_python) [Sequence\[GetPolicyDocumentStatement\]](#getpolicydocumentstatement)

[version](#version_python) str

[id](#id_yaml) String

The provider-assigned unique ID for this managed resource.

[json](#json_yaml) String

Standard JSON policy document rendered based on the arguments above.

[minifiedJson](#minifiedjson_yaml) String

Minified JSON policy document rendered based on the arguments above.

[overrideJson](#overridejson_yaml) String

Deprecated: override\_json is deprecated. This argument is retained only for backward compatibility with previous versions of this data source.

[overridePolicyDocuments](#overridepolicydocuments_yaml) List<String>

[policyId](#policyid_yaml) String

[sourceJson](#sourcejson_yaml) String

Deprecated: source\_json is deprecated. This argument is retained only for backward compatibility with previous versions of this data source.

[sourcePolicyDocuments](#sourcepolicydocuments_yaml) List<String>

[statements](#statements_yaml) [List<Property Map>](#getpolicydocumentstatement)

[version](#version_yaml) String

## Supporting Types[](#supporting-types)

#### GetPolicyDocumentStatement[](#getpolicydocumentstatement)

[Actions](#actions_csharp) List<string>

List of actions that this statement either allows or denies. For example, `["ec2:RunInstances", "s3:*"]`.

[Conditions](#conditions_csharp) [List<GetPolicyDocumentStatementCondition>](#getpolicydocumentstatementcondition)

Configuration block for a condition. Detailed below.

[Effect](#effect_csharp) string

Whether this statement allows or denies the given actions. Valid values are `Allow` and `Deny`. Defaults to `Allow`.

[NotActions](#notactions_csharp) List<string>

List of actions that this statement does *not* apply to. Use to apply a policy statement to all actions *except* those listed.

[NotPrincipals](#notprincipals_csharp) [List<GetPolicyDocumentStatementNotPrincipal>](#getpolicydocumentstatementnotprincipal)

Like `principals` except these are principals that the statement does *not* apply to.

[NotResources](#notresources_csharp) List<string>

List of resource ARNs that this statement does *not* apply to. Use to apply a policy statement to all resources *except* those listed. Conflicts with `resources`.

[Principals](#principals_csharp) [List<GetPolicyDocumentStatementPrincipal>](#getpolicydocumentstatementprincipal)

Configuration block for principals. Detailed below.

[Resources](#resources_csharp) List<string>

List of resource ARNs that this statement applies to. This is required by AWS if used for an IAM policy. Conflicts with `notResources`.

[Sid](#sid_csharp) string

Sid (statement ID) is an identifier for a policy statement.

[Actions](#actions_go) \[\]string

List of actions that this statement either allows or denies. For example, `["ec2:RunInstances", "s3:*"]`.

[Conditions](#conditions_go) [\[\]GetPolicyDocumentStatementCondition](#getpolicydocumentstatementcondition)

Configuration block for a condition. Detailed below.

[Effect](#effect_go) string

Whether this statement allows or denies the given actions. Valid values are `Allow` and `Deny`. Defaults to `Allow`.

[NotActions](#notactions_go) \[\]string

List of actions that this statement does *not* apply to. Use to apply a policy statement to all actions *except* those listed.

[NotPrincipals](#notprincipals_go) [\[\]GetPolicyDocumentStatementNotPrincipal](#getpolicydocumentstatementnotprincipal)

Like `principals` except these are principals that the statement does *not* apply to.

[NotResources](#notresources_go) \[\]string

List of resource ARNs that this statement does *not* apply to. Use to apply a policy statement to all resources *except* those listed. Conflicts with `resources`.

[Principals](#principals_go) [\[\]GetPolicyDocumentStatementPrincipal](#getpolicydocumentstatementprincipal)

Configuration block for principals. Detailed below.

[Resources](#resources_go) \[\]string

List of resource ARNs that this statement applies to. This is required by AWS if used for an IAM policy. Conflicts with `notResources`.

[Sid](#sid_go) string

Sid (statement ID) is an identifier for a policy statement.

[actions](#actions_hcl) list(string)

List of actions that this statement either allows or denies. For example, `["ec2:RunInstances", "s3:*"]`.

[conditions](#conditions_hcl) [list(object)](#getpolicydocumentstatementcondition)

Configuration block for a condition. Detailed below.

[effect](#effect_hcl) string

Whether this statement allows or denies the given actions. Valid values are `Allow` and `Deny`. Defaults to `Allow`.

[not\_actions](#not_actions_hcl) list(string)

List of actions that this statement does *not* apply to. Use to apply a policy statement to all actions *except* those listed.

[not\_principals](#not_principals_hcl) [list(object)](#getpolicydocumentstatementnotprincipal)

Like `principals` except these are principals that the statement does *not* apply to.

[not\_resources](#not_resources_hcl) list(string)

List of resource ARNs that this statement does *not* apply to. Use to apply a policy statement to all resources *except* those listed. Conflicts with `resources`.

[principals](#principals_hcl) [list(object)](#getpolicydocumentstatementprincipal)

Configuration block for principals. Detailed below.

[resources](#resources_hcl) list(string)

List of resource ARNs that this statement applies to. This is required by AWS if used for an IAM policy. Conflicts with `notResources`.

[sid](#sid_hcl) string

Sid (statement ID) is an identifier for a policy statement.

[actions](#actions_java) List<String>

List of actions that this statement either allows or denies. For example, `["ec2:RunInstances", "s3:*"]`.

[conditions](#conditions_java) [List<GetPolicyDocumentStatementCondition>](#getpolicydocumentstatementcondition)

Configuration block for a condition. Detailed below.

[effect](#effect_java) String

Whether this statement allows or denies the given actions. Valid values are `Allow` and `Deny`. Defaults to `Allow`.

[notActions](#notactions_java) List<String>

List of actions that this statement does *not* apply to. Use to apply a policy statement to all actions *except* those listed.

[notPrincipals](#notprincipals_java) [List<GetPolicyDocumentStatementNotPrincipal>](#getpolicydocumentstatementnotprincipal)

Like `principals` except these are principals that the statement does *not* apply to.

[notResources](#notresources_java) List<String>

List of resource ARNs that this statement does *not* apply to. Use to apply a policy statement to all resources *except* those listed. Conflicts with `resources`.

[principals](#principals_java) [List<GetPolicyDocumentStatementPrincipal>](#getpolicydocumentstatementprincipal)

Configuration block for principals. Detailed below.

[resources](#resources_java) List<String>

List of resource ARNs that this statement applies to. This is required by AWS if used for an IAM policy. Conflicts with `notResources`.

[sid](#sid_java) String

Sid (statement ID) is an identifier for a policy statement.

[actions](#actions_nodejs) string\[\]

List of actions that this statement either allows or denies. For example, `["ec2:RunInstances", "s3:*"]`.

[conditions](#conditions_nodejs) [GetPolicyDocumentStatementCondition\[\]](#getpolicydocumentstatementcondition)

Configuration block for a condition. Detailed below.

[effect](#effect_nodejs) string

Whether this statement allows or denies the given actions. Valid values are `Allow` and `Deny`. Defaults to `Allow`.

[notActions](#notactions_nodejs) string\[\]

List of actions that this statement does *not* apply to. Use to apply a policy statement to all actions *except* those listed.

[notPrincipals](#notprincipals_nodejs) [GetPolicyDocumentStatementNotPrincipal\[\]](#getpolicydocumentstatementnotprincipal)

Like `principals` except these are principals that the statement does *not* apply to.

[notResources](#notresources_nodejs) string\[\]

List of resource ARNs that this statement does *not* apply to. Use to apply a policy statement to all resources *except* those listed. Conflicts with `resources`.

[principals](#principals_nodejs) [GetPolicyDocumentStatementPrincipal\[\]](#getpolicydocumentstatementprincipal)

Configuration block for principals. Detailed below.

[resources](#resources_nodejs) string\[\]

List of resource ARNs that this statement applies to. This is required by AWS if used for an IAM policy. Conflicts with `notResources`.

[sid](#sid_nodejs) string

Sid (statement ID) is an identifier for a policy statement.

[actions](#actions_python) Sequence\[str\]

List of actions that this statement either allows or denies. For example, `["ec2:RunInstances", "s3:*"]`.

[conditions](#conditions_python) [Sequence\[GetPolicyDocumentStatementCondition\]](#getpolicydocumentstatementcondition)

Configuration block for a condition. Detailed below.

[effect](#effect_python) str

Whether this statement allows or denies the given actions. Valid values are `Allow` and `Deny`. Defaults to `Allow`.

[not\_actions](#not_actions_python) Sequence\[str\]

List of actions that this statement does *not* apply to. Use to apply a policy statement to all actions *except* those listed.

[not\_principals](#not_principals_python) [Sequence\[GetPolicyDocumentStatementNotPrincipal\]](#getpolicydocumentstatementnotprincipal)

Like `principals` except these are principals that the statement does *not* apply to.

[not\_resources](#not_resources_python) Sequence\[str\]

List of resource ARNs that this statement does *not* apply to. Use to apply a policy statement to all resources *except* those listed. Conflicts with `resources`.

[principals](#principals_python) [Sequence\[GetPolicyDocumentStatementPrincipal\]](#getpolicydocumentstatementprincipal)

Configuration block for principals. Detailed below.

[resources](#resources_python) Sequence\[str\]

List of resource ARNs that this statement applies to. This is required by AWS if used for an IAM policy. Conflicts with `notResources`.

[sid](#sid_python) str

Sid (statement ID) is an identifier for a policy statement.

[actions](#actions_yaml) List<String>

List of actions that this statement either allows or denies. For example, `["ec2:RunInstances", "s3:*"]`.

[conditions](#conditions_yaml) [List<Property Map>](#getpolicydocumentstatementcondition)

Configuration block for a condition. Detailed below.

[effect](#effect_yaml) String

Whether this statement allows or denies the given actions. Valid values are `Allow` and `Deny`. Defaults to `Allow`.

[notActions](#notactions_yaml) List<String>

List of actions that this statement does *not* apply to. Use to apply a policy statement to all actions *except* those listed.

[notPrincipals](#notprincipals_yaml) [List<Property Map>](#getpolicydocumentstatementnotprincipal)

Like `principals` except these are principals that the statement does *not* apply to.

[notResources](#notresources_yaml) List<String>

List of resource ARNs that this statement does *not* apply to. Use to apply a policy statement to all resources *except* those listed. Conflicts with `resources`.

[principals](#principals_yaml) [List<Property Map>](#getpolicydocumentstatementprincipal)

Configuration block for principals. Detailed below.

[resources](#resources_yaml) List<String>

List of resource ARNs that this statement applies to. This is required by AWS if used for an IAM policy. Conflicts with `notResources`.

[sid](#sid_yaml) String

Sid (statement ID) is an identifier for a policy statement.

#### GetPolicyDocumentStatementCondition[](#getpolicydocumentstatementcondition)

[Test](#test_csharp) This property is required. string

Name of the [IAM condition operator](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements_condition_operators.html) to evaluate.

[Values](#values_csharp) This property is required. List<string>

Values to evaluate the condition against. If multiple values are provided, the condition matches if at least one of them applies. That is, AWS evaluates multiple values as though using an "OR" boolean operation.

[Variable](#variable_csharp) This property is required. string

Name of a [Context Variable](http://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements.html#AvailableKeys) to apply the condition to. Context variables may either be standard AWS variables starting with `aws:` or service-specific variables prefixed with the service name.

[Test](#test_go) This property is required. string

Name of the [IAM condition operator](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements_condition_operators.html) to evaluate.

[Values](#values_go) This property is required. \[\]string

Values to evaluate the condition against. If multiple values are provided, the condition matches if at least one of them applies. That is, AWS evaluates multiple values as though using an "OR" boolean operation.

[Variable](#variable_go) This property is required. string

Name of a [Context Variable](http://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements.html#AvailableKeys) to apply the condition to. Context variables may either be standard AWS variables starting with `aws:` or service-specific variables prefixed with the service name.

[test](#test_hcl) This property is required. string

Name of the [IAM condition operator](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements_condition_operators.html) to evaluate.

[values](#values_hcl) This property is required. list(string)

Values to evaluate the condition against. If multiple values are provided, the condition matches if at least one of them applies. That is, AWS evaluates multiple values as though using an "OR" boolean operation.

[variable](#variable_hcl) This property is required. string

Name of a [Context Variable](http://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements.html#AvailableKeys) to apply the condition to. Context variables may either be standard AWS variables starting with `aws:` or service-specific variables prefixed with the service name.

[test](#test_java) This property is required. String

Name of the [IAM condition operator](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements_condition_operators.html) to evaluate.

[values](#values_java) This property is required. List<String>

Values to evaluate the condition against. If multiple values are provided, the condition matches if at least one of them applies. That is, AWS evaluates multiple values as though using an "OR" boolean operation.

[variable](#variable_java) This property is required. String

Name of a [Context Variable](http://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements.html#AvailableKeys) to apply the condition to. Context variables may either be standard AWS variables starting with `aws:` or service-specific variables prefixed with the service name.

[test](#test_nodejs) This property is required. string

Name of the [IAM condition operator](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements_condition_operators.html) to evaluate.

[values](#values_nodejs) This property is required. string\[\]

Values to evaluate the condition against. If multiple values are provided, the condition matches if at least one of them applies. That is, AWS evaluates multiple values as though using an "OR" boolean operation.

[variable](#variable_nodejs) This property is required. string

Name of a [Context Variable](http://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements.html#AvailableKeys) to apply the condition to. Context variables may either be standard AWS variables starting with `aws:` or service-specific variables prefixed with the service name.

[test](#test_python) This property is required. str

Name of the [IAM condition operator](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements_condition_operators.html) to evaluate.

[values](#values_python) This property is required. Sequence\[str\]

Values to evaluate the condition against. If multiple values are provided, the condition matches if at least one of them applies. That is, AWS evaluates multiple values as though using an "OR" boolean operation.

[variable](#variable_python) This property is required. str

Name of a [Context Variable](http://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements.html#AvailableKeys) to apply the condition to. Context variables may either be standard AWS variables starting with `aws:` or service-specific variables prefixed with the service name.

[test](#test_yaml) This property is required. String

Name of the [IAM condition operator](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements_condition_operators.html) to evaluate.

[values](#values_yaml) This property is required. List<String>

Values to evaluate the condition against. If multiple values are provided, the condition matches if at least one of them applies. That is, AWS evaluates multiple values as though using an "OR" boolean operation.

[variable](#variable_yaml) This property is required. String

Name of a [Context Variable](http://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements.html#AvailableKeys) to apply the condition to. Context variables may either be standard AWS variables starting with `aws:` or service-specific variables prefixed with the service name.

#### GetPolicyDocumentStatementNotPrincipal[](#getpolicydocumentstatementnotprincipal)

[Identifiers](#identifiers_csharp) This property is required. List<string>

List of identifiers for principals. When `type` is `AWS`, these are IAM principal ARNs, e.g., `arn:aws:iam::12345678901:role/yak-role`. When `type` is `Service`, these are AWS Service roles, e.g., `lambda.amazonaws.com`. When `type` is `Federated`, these are web identity users or SAML provider ARNs, e.g., `accounts.google.com` or `arn:aws:iam::12345678901:saml-provider/yak-saml-provider`. When `type` is `CanonicalUser`, these are [canonical user IDs](https://docs.aws.amazon.com/general/latest/gr/acct-identifiers.html#FindingCanonicalId), e.g., `79a59df900b949e55d96a1e698fbacedfd6e09d98eacf8f8d5218e7cd47ef2be`.

[Type](#type_csharp) This property is required. string

Type of principal. Valid values include `AWS`, `Service`, `Federated`, `CanonicalUser` and `*`.

[Identifiers](#identifiers_go) This property is required. \[\]string

List of identifiers for principals. When `type` is `AWS`, these are IAM principal ARNs, e.g., `arn:aws:iam::12345678901:role/yak-role`. When `type` is `Service`, these are AWS Service roles, e.g., `lambda.amazonaws.com`. When `type` is `Federated`, these are web identity users or SAML provider ARNs, e.g., `accounts.google.com` or `arn:aws:iam::12345678901:saml-provider/yak-saml-provider`. When `type` is `CanonicalUser`, these are [canonical user IDs](https://docs.aws.amazon.com/general/latest/gr/acct-identifiers.html#FindingCanonicalId), e.g., `79a59df900b949e55d96a1e698fbacedfd6e09d98eacf8f8d5218e7cd47ef2be`.

[Type](#type_go) This property is required. string

Type of principal. Valid values include `AWS`, `Service`, `Federated`, `CanonicalUser` and `*`.

[identifiers](#identifiers_hcl) This property is required. list(string)

List of identifiers for principals. When `type` is `AWS`, these are IAM principal ARNs, e.g., `arn:aws:iam::12345678901:role/yak-role`. When `type` is `Service`, these are AWS Service roles, e.g., `lambda.amazonaws.com`. When `type` is `Federated`, these are web identity users or SAML provider ARNs, e.g., `accounts.google.com` or `arn:aws:iam::12345678901:saml-provider/yak-saml-provider`. When `type` is `CanonicalUser`, these are [canonical user IDs](https://docs.aws.amazon.com/general/latest/gr/acct-identifiers.html#FindingCanonicalId), e.g., `79a59df900b949e55d96a1e698fbacedfd6e09d98eacf8f8d5218e7cd47ef2be`.

[type](#type_hcl) This property is required. string

Type of principal. Valid values include `AWS`, `Service`, `Federated`, `CanonicalUser` and `*`.

[identifiers](#identifiers_java) This property is required. List<String>

List of identifiers for principals. When `type` is `AWS`, these are IAM principal ARNs, e.g., `arn:aws:iam::12345678901:role/yak-role`. When `type` is `Service`, these are AWS Service roles, e.g., `lambda.amazonaws.com`. When `type` is `Federated`, these are web identity users or SAML provider ARNs, e.g., `accounts.google.com` or `arn:aws:iam::12345678901:saml-provider/yak-saml-provider`. When `type` is `CanonicalUser`, these are [canonical user IDs](https://docs.aws.amazon.com/general/latest/gr/acct-identifiers.html#FindingCanonicalId), e.g., `79a59df900b949e55d96a1e698fbacedfd6e09d98eacf8f8d5218e7cd47ef2be`.

[type](#type_java) This property is required. String

Type of principal. Valid values include `AWS`, `Service`, `Federated`, `CanonicalUser` and `*`.

[identifiers](#identifiers_nodejs) This property is required. string\[\]

List of identifiers for principals. When `type` is `AWS`, these are IAM principal ARNs, e.g., `arn:aws:iam::12345678901:role/yak-role`. When `type` is `Service`, these are AWS Service roles, e.g., `lambda.amazonaws.com`. When `type` is `Federated`, these are web identity users or SAML provider ARNs, e.g., `accounts.google.com` or `arn:aws:iam::12345678901:saml-provider/yak-saml-provider`. When `type` is `CanonicalUser`, these are [canonical user IDs](https://docs.aws.amazon.com/general/latest/gr/acct-identifiers.html#FindingCanonicalId), e.g., `79a59df900b949e55d96a1e698fbacedfd6e09d98eacf8f8d5218e7cd47ef2be`.

[type](#type_nodejs) This property is required. string

Type of principal. Valid values include `AWS`, `Service`, `Federated`, `CanonicalUser` and `*`.

[identifiers](#identifiers_python) This property is required. Sequence\[str\]

List of identifiers for principals. When `type` is `AWS`, these are IAM principal ARNs, e.g., `arn:aws:iam::12345678901:role/yak-role`. When `type` is `Service`, these are AWS Service roles, e.g., `lambda.amazonaws.com`. When `type` is `Federated`, these are web identity users or SAML provider ARNs, e.g., `accounts.google.com` or `arn:aws:iam::12345678901:saml-provider/yak-saml-provider`. When `type` is `CanonicalUser`, these are [canonical user IDs](https://docs.aws.amazon.com/general/latest/gr/acct-identifiers.html#FindingCanonicalId), e.g., `79a59df900b949e55d96a1e698fbacedfd6e09d98eacf8f8d5218e7cd47ef2be`.

[type](#type_python) This property is required. str

Type of principal. Valid values include `AWS`, `Service`, `Federated`, `CanonicalUser` and `*`.

[identifiers](#identifiers_yaml) This property is required. List<String>

List of identifiers for principals. When `type` is `AWS`, these are IAM principal ARNs, e.g., `arn:aws:iam::12345678901:role/yak-role`. When `type` is `Service`, these are AWS Service roles, e.g., `lambda.amazonaws.com`. When `type` is `Federated`, these are web identity users or SAML provider ARNs, e.g., `accounts.google.com` or `arn:aws:iam::12345678901:saml-provider/yak-saml-provider`. When `type` is `CanonicalUser`, these are [canonical user IDs](https://docs.aws.amazon.com/general/latest/gr/acct-identifiers.html#FindingCanonicalId), e.g., `79a59df900b949e55d96a1e698fbacedfd6e09d98eacf8f8d5218e7cd47ef2be`.

[type](#type_yaml) This property is required. String

Type of principal. Valid values include `AWS`, `Service`, `Federated`, `CanonicalUser` and `*`.

#### GetPolicyDocumentStatementPrincipal[](#getpolicydocumentstatementprincipal)

[Identifiers](#identifiers_csharp) This property is required. List<string>

List of identifiers for principals. When `type` is `AWS`, these are IAM principal ARNs, e.g., `arn:aws:iam::12345678901:role/yak-role`. When `type` is `Service`, these are AWS Service roles, e.g., `lambda.amazonaws.com`. When `type` is `Federated`, these are web identity users or SAML provider ARNs, e.g., `accounts.google.com` or `arn:aws:iam::12345678901:saml-provider/yak-saml-provider`. When `type` is `CanonicalUser`, these are [canonical user IDs](https://docs.aws.amazon.com/general/latest/gr/acct-identifiers.html#FindingCanonicalId), e.g., `79a59df900b949e55d96a1e698fbacedfd6e09d98eacf8f8d5218e7cd47ef2be`.

[Type](#type_csharp) This property is required. string

Type of principal. Valid values include `AWS`, `Service`, `Federated`, `CanonicalUser` and `*`.

[Identifiers](#identifiers_go) This property is required. \[\]string

List of identifiers for principals. When `type` is `AWS`, these are IAM principal ARNs, e.g., `arn:aws:iam::12345678901:role/yak-role`. When `type` is `Service`, these are AWS Service roles, e.g., `lambda.amazonaws.com`. When `type` is `Federated`, these are web identity users or SAML provider ARNs, e.g., `accounts.google.com` or `arn:aws:iam::12345678901:saml-provider/yak-saml-provider`. When `type` is `CanonicalUser`, these are [canonical user IDs](https://docs.aws.amazon.com/general/latest/gr/acct-identifiers.html#FindingCanonicalId), e.g., `79a59df900b949e55d96a1e698fbacedfd6e09d98eacf8f8d5218e7cd47ef2be`.

[Type](#type_go) This property is required. string

Type of principal. Valid values include `AWS`, `Service`, `Federated`, `CanonicalUser` and `*`.

[identifiers](#identifiers_hcl) This property is required. list(string)

List of identifiers for principals. When `type` is `AWS`, these are IAM principal ARNs, e.g., `arn:aws:iam::12345678901:role/yak-role`. When `type` is `Service`, these are AWS Service roles, e.g., `lambda.amazonaws.com`. When `type` is `Federated`, these are web identity users or SAML provider ARNs, e.g., `accounts.google.com` or `arn:aws:iam::12345678901:saml-provider/yak-saml-provider`. When `type` is `CanonicalUser`, these are [canonical user IDs](https://docs.aws.amazon.com/general/latest/gr/acct-identifiers.html#FindingCanonicalId), e.g., `79a59df900b949e55d96a1e698fbacedfd6e09d98eacf8f8d5218e7cd47ef2be`.

[type](#type_hcl) This property is required. string

Type of principal. Valid values include `AWS`, `Service`, `Federated`, `CanonicalUser` and `*`.

[identifiers](#identifiers_java) This property is required. List<String>

List of identifiers for principals. When `type` is `AWS`, these are IAM principal ARNs, e.g., `arn:aws:iam::12345678901:role/yak-role`. When `type` is `Service`, these are AWS Service roles, e.g., `lambda.amazonaws.com`. When `type` is `Federated`, these are web identity users or SAML provider ARNs, e.g., `accounts.google.com` or `arn:aws:iam::12345678901:saml-provider/yak-saml-provider`. When `type` is `CanonicalUser`, these are [canonical user IDs](https://docs.aws.amazon.com/general/latest/gr/acct-identifiers.html#FindingCanonicalId), e.g., `79a59df900b949e55d96a1e698fbacedfd6e09d98eacf8f8d5218e7cd47ef2be`.

[type](#type_java) This property is required. String

Type of principal. Valid values include `AWS`, `Service`, `Federated`, `CanonicalUser` and `*`.

[identifiers](#identifiers_nodejs) This property is required. string\[\]

List of identifiers for principals. When `type` is `AWS`, these are IAM principal ARNs, e.g., `arn:aws:iam::12345678901:role/yak-role`. When `type` is `Service`, these are AWS Service roles, e.g., `lambda.amazonaws.com`. When `type` is `Federated`, these are web identity users or SAML provider ARNs, e.g., `accounts.google.com` or `arn:aws:iam::12345678901:saml-provider/yak-saml-provider`. When `type` is `CanonicalUser`, these are [canonical user IDs](https://docs.aws.amazon.com/general/latest/gr/acct-identifiers.html#FindingCanonicalId), e.g., `79a59df900b949e55d96a1e698fbacedfd6e09d98eacf8f8d5218e7cd47ef2be`.

[type](#type_nodejs) This property is required. string

Type of principal. Valid values include `AWS`, `Service`, `Federated`, `CanonicalUser` and `*`.

[identifiers](#identifiers_python) This property is required. Sequence\[str\]

List of identifiers for principals. When `type` is `AWS`, these are IAM principal ARNs, e.g., `arn:aws:iam::12345678901:role/yak-role`. When `type` is `Service`, these are AWS Service roles, e.g., `lambda.amazonaws.com`. When `type` is `Federated`, these are web identity users or SAML provider ARNs, e.g., `accounts.google.com` or `arn:aws:iam::12345678901:saml-provider/yak-saml-provider`. When `type` is `CanonicalUser`, these are [canonical user IDs](https://docs.aws.amazon.com/general/latest/gr/acct-identifiers.html#FindingCanonicalId), e.g., `79a59df900b949e55d96a1e698fbacedfd6e09d98eacf8f8d5218e7cd47ef2be`.

[type](#type_python) This property is required. str

Type of principal. Valid values include `AWS`, `Service`, `Federated`, `CanonicalUser` and `*`.

[identifiers](#identifiers_yaml) This property is required. List<String>

List of identifiers for principals. When `type` is `AWS`, these are IAM principal ARNs, e.g., `arn:aws:iam::12345678901:role/yak-role`. When `type` is `Service`, these are AWS Service roles, e.g., `lambda.amazonaws.com`. When `type` is `Federated`, these are web identity users or SAML provider ARNs, e.g., `accounts.google.com` or `arn:aws:iam::12345678901:saml-provider/yak-saml-provider`. When `type` is `CanonicalUser`, these are [canonical user IDs](https://docs.aws.amazon.com/general/latest/gr/acct-identifiers.html#FindingCanonicalId), e.g., `79a59df900b949e55d96a1e698fbacedfd6e09d98eacf8f8d5218e7cd47ef2be`.

[type](#type_yaml) This property is required. String

Type of principal. Valid values include `AWS`, `Service`, `Federated`, `CanonicalUser` and `*`.

## Package Details[](#package-details)

Repository

[AWS Classic pulumi/pulumi-aws](https://github.com/pulumi/pulumi-aws)

License

Apache-2.0

Notes

This Pulumi package is based on the [`aws` Terraform Provider](https://github.com/hashicorp/terraform-provider-aws).

-   Copy Page

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2fiam%2fgetpolicydocument]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2fiam%2fgetpolicydocument%2f\))

#### Try Pulumi Cloud free.
Your team will thank you.

[Start free trial](https://app.pulumi.com/signup?utm_source=registry&utm_medium=right-rail-banner&utm_campaign=try-pulumi-cloud&iaid=docs-try-pulumi-cloud-ad)
