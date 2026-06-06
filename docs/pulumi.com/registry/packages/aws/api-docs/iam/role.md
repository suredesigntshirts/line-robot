---
Source: https://www.pulumi.com/registry/packages/aws/api-docs/iam/role/
Generated: 2026-06-06
Updated: 2026-06-06
---

# aws.iam.Role

1.  [Packages](/registry/)
2.  [Packages](/registry/packages/)
3.  [AWS](/registry/packages/aws/)
4.  [API Docs](/registry/packages/aws/api-docs/)
5.  [iam](/registry/packages/aws/api-docs/iam/)
6.  [Role](/registry/packages/aws/api-docs/iam/role/)

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

Viewing docs for AWS v7.32.0
published on Friday, May 29, 2026 by Pulumi

[Schema (JSON)](/registry/packages/aws/schema.json)

[pulumi/pulumi-aws](https://github.com/pulumi/pulumi-aws)

v7.32.0 (7.x, latest)v6.83.1 (6.x)v5.43.0 (5.x)

# aws.iam.Role[](#aws-iam-role)

Explore with Neo

-   Copy Page

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2fiam%2frole]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2fiam%2frole%2f\))

Provides an IAM role.

> **NOTE:** If policies are attached to the role via the `aws.iam.PolicyAttachment` resource and you are modifying the role `name` or `path`, the `forceDetachPolicies` argument must be set to `true` and applied before attempting the operation otherwise you will encounter a `DeleteConflict` error. The `aws.iam.RolePolicyAttachment` resource (recommended) does not have this requirement.

> **NOTE:** If you use this resource’s `managedPolicyArns` argument or `inlinePolicy` configuration blocks, this resource will take over exclusive management of the role’s respective policy types (e.g., both policy types if both arguments are used). These arguments are incompatible with other ways of managing a role’s policies, such as `aws.iam.PolicyAttachment`, `aws.iam.RolePolicyAttachment`, and `aws.iam.RolePolicy`. If you attempt to manage a role’s policies by multiple means, you will get resource cycling and/or errors.

> **NOTE:** We suggest using explicit JSON encoding or `aws.iam.getPolicyDocument` when assigning a value to `policy`. They seamlessly translate configuration to JSON, enabling you to maintain consistency within your configuration without the need for context switches. Also, you can sidestep potential complications arising from formatting discrepancies, whitespace inconsistencies, and other nuances inherent to JSON.

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

const testRole = new aws.iam.Role("test_role", {
    name: "test_role",
    assumeRolePolicy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [{
            Action: "sts:AssumeRole",
            Effect: "Allow",
            Sid: "",
            Principal: {
                Service: "ec2.amazonaws.com",
            },
        }],
    }),
    tags: {
        "tag-key": "tag-value",
    },
});
```

```python
import pulumi
import json
import pulumi_aws as aws

test_role = aws.iam.Role("test_role",
    name="test_role",
    assume_role_policy=json.dumps({
        "Version": "2012-10-17",
        "Statement": [{
            "Action": "sts:AssumeRole",
            "Effect": "Allow",
            "Sid": "",
            "Principal": {
                "Service": "ec2.amazonaws.com",
            },
        }],
    }),
    tags={
        "tag-key": "tag-value",
    })
```

```go
package main

import (
	"encoding/json"

	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/iam"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		tmpJSON0, err := json.Marshal(map[string]interface{}{
			"Version": "2012-10-17",
			"Statement": []map[string]interface{}{
				map[string]interface{}{
					"Action": "sts:AssumeRole",
					"Effect": "Allow",
					"Sid":    "",
					"Principal": map[string]interface{}{
						"Service": "ec2.amazonaws.com",
					},
				},
			},
		})
		if err != nil {
			return err
		}
		json0 := string(tmpJSON0)
		_, err = iam.NewRole(ctx, "test_role", &iam.RoleArgs{
			Name:             pulumi.String("test_role"),
			AssumeRolePolicy: pulumi.String(pulumi.String(json0)),
			Tags: pulumi.StringMap{
				"tag-key": pulumi.String("tag-value"),
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
using System.Text.Json;
using Pulumi;
using Aws = Pulumi.Aws;

return await Deployment.RunAsync(() =>
{
    var testRole = new Aws.Iam.Role("test_role", new()
    {
        Name = "test_role",
        AssumeRolePolicy = JsonSerializer.Serialize(new Dictionary<string, object?>
        {
            ["Version"] = "2012-10-17",
            ["Statement"] = new[]
            {
                new Dictionary<string, object?>
                {
                    ["Action"] = "sts:AssumeRole",
                    ["Effect"] = "Allow",
                    ["Sid"] = "",
                    ["Principal"] = new Dictionary<string, object?>
                    {
                        ["Service"] = "ec2.amazonaws.com",
                    },
                },
            },
        }),
        Tags =
        {
            { "tag-key", "tag-value" },
        },
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.iam.Role;
import com.pulumi.aws.iam.RoleArgs;
import static com.pulumi.codegen.internal.Serialization.*;
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
        var testRole = new Role("testRole", RoleArgs.builder()
            .name("test_role")
            .assumeRolePolicy(serializeJson(
                jsonObject(
                    jsonProperty("Version", "2012-10-17"),
                    jsonProperty("Statement", jsonArray(jsonObject(
                        jsonProperty("Action", "sts:AssumeRole"),
                        jsonProperty("Effect", "Allow"),
                        jsonProperty("Sid", ""),
                        jsonProperty("Principal", jsonObject(
                            jsonProperty("Service", "ec2.amazonaws.com")
                        ))
                    )))
                )))
            .tags(Map.of("tag-key", "tag-value"))
            .build());

    }
}
```

```yaml
resources:
  testRole:
    type: aws:iam:Role
    name: test_role
    properties:
      name: test_role
      assumeRolePolicy:
        fn::toJSON:
          Version: 2012-10-17
          Statement:
            - Action: sts:AssumeRole
              Effect: Allow
              Sid: ""
              Principal:
                Service: ec2.amazonaws.com
      tags:
        tag-key: tag-value
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_iam_role" "test_role" {
  name = "test_role"
  assume_role_policy = jsonencode({
    "Version" = "2012-10-17"
    "Statement" = [{
      "Action" = "sts:AssumeRole"
      "Effect" = "Allow"
      "Sid"    = ""
      "Principal" = {
        "Service" = "ec2.amazonaws.com"
      }
    }]
  })
  tags = {
    "tag-key" = "tag-value"
  }
}
```

### Example of Using Data Source for Assume Role Policy[](#example-of-using-data-source-for-assume-role-policy)

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

const instanceAssumeRolePolicy = aws.iam.getPolicyDocument({
    statements: [{
        actions: ["sts:AssumeRole"],
        principals: [{
            type: "Service",
            identifiers: ["ec2.amazonaws.com"],
        }],
    }],
});
const instance = new aws.iam.Role("instance", {
    name: "instance_role",
    path: "/system/",
    assumeRolePolicy: instanceAssumeRolePolicy.then(instanceAssumeRolePolicy => instanceAssumeRolePolicy.json),
});
```

```python
import pulumi
import pulumi_aws as aws

instance_assume_role_policy = aws.iam.get_policy_document(statements=[{
    "actions": ["sts:AssumeRole"],
    "principals": [{
        "type": "Service",
        "identifiers": ["ec2.amazonaws.com"],
    }],
}])
instance = aws.iam.Role("instance",
    name="instance_role",
    path="/system/",
    assume_role_policy=instance_assume_role_policy.json)
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/iam"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		instanceAssumeRolePolicy, err := iam.GetPolicyDocument(ctx, &iam.GetPolicyDocumentArgs{
			Statements: []iam.GetPolicyDocumentStatement{
				{
					Actions: []string{
						"sts:AssumeRole",
					},
					Principals: []iam.GetPolicyDocumentStatementPrincipal{
						{
							Type: "Service",
							Identifiers: []string{
								"ec2.amazonaws.com",
							},
						},
					},
				},
			},
		}, nil)
		if err != nil {
			return err
		}
		_, err = iam.NewRole(ctx, "instance", &iam.RoleArgs{
			Name:             pulumi.String("instance_role"),
			Path:             pulumi.String("/system/"),
			AssumeRolePolicy: pulumi.String(pulumi.String(instanceAssumeRolePolicy.Json)),
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
    var instanceAssumeRolePolicy = Aws.Iam.GetPolicyDocument.Invoke(new()
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
                            "ec2.amazonaws.com",
                        },
                    },
                },
            },
        },
    });

    var instance = new Aws.Iam.Role("instance", new()
    {
        Name = "instance_role",
        Path = "/system/",
        AssumeRolePolicy = instanceAssumeRolePolicy.Apply(getPolicyDocumentResult => getPolicyDocumentResult.Json),
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
import com.pulumi.aws.iam.Role;
import com.pulumi.aws.iam.RoleArgs;
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
        final var instanceAssumeRolePolicy = IamFunctions.getPolicyDocument(GetPolicyDocumentArgs.builder()
            .statements(GetPolicyDocumentStatementArgs.builder()
                .actions("sts:AssumeRole")
                .principals(GetPolicyDocumentStatementPrincipalArgs.builder()
                    .type("Service")
                    .identifiers("ec2.amazonaws.com")
                    .build())
                .build())
            .build());

        var instance = new Role("instance", RoleArgs.builder()
            .name("instance_role")
            .path("/system/")
            .assumeRolePolicy(instanceAssumeRolePolicy.json())
            .build());

    }
}
```

```yaml
resources:
  instance:
    type: aws:iam:Role
    properties:
      name: instance_role
      path: /system/
      assumeRolePolicy: ${instanceAssumeRolePolicy.json}
variables:
  instanceAssumeRolePolicy:
    fn::invoke:
      function: aws:iam:getPolicyDocument
      arguments:
        statements:
          - actions:
              - sts:AssumeRole
            principals:
              - type: Service
                identifiers:
                  - ec2.amazonaws.com
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

data "aws_iam_getpolicydocument" "instanceAssumeRolePolicy" {
  statements {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "instance" {
  name               = "instance_role"
  path               = "/system/"
  assume_role_policy = data.aws_iam_getpolicydocument.instanceAssumeRolePolicy.json
}
```

### Example of Exclusive Inline Policies[](#example-of-exclusive-inline-policies)

> The `inlinePolicy` argument is deprecated. Use the `aws.iam.RolePolicy` resource instead. If Pulumi should exclusively manage all inline policy associations (the current behavior of this argument), use the `aws.iam.RolePoliciesExclusive` resource as well.

This example creates an IAM role with two inline IAM policies. If someone adds another inline policy out-of-band, on the next apply, this provider will remove that policy. If someone deletes these policies out-of-band, this provider will recreate them.

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

const inlinePolicy = aws.iam.getPolicyDocument({
    statements: [{
        actions: ["ec2:DescribeAccountAttributes"],
        resources: ["*"],
    }],
});
const example = new aws.iam.Role("example", {
    name: "yak_role",
    assumeRolePolicy: instanceAssumeRolePolicy.json,
    inlinePolicies: [
        {
            name: "my_inline_policy",
            policy: JSON.stringify({
                Version: "2012-10-17",
                Statement: [{
                    Action: ["ec2:Describe*"],
                    Effect: "Allow",
                    Resource: "*",
                }],
            }),
        },
        {
            name: "policy-8675309",
            policy: inlinePolicy.then(inlinePolicy => inlinePolicy.json),
        },
    ],
});
```

```python
import pulumi
import json
import pulumi_aws as aws

inline_policy = aws.iam.get_policy_document(statements=[{
    "actions": ["ec2:DescribeAccountAttributes"],
    "resources": ["*"],
}])
example = aws.iam.Role("example",
    name="yak_role",
    assume_role_policy=instance_assume_role_policy["json"],
    inline_policies=[
        {
            "name": "my_inline_policy",
            "policy": json.dumps({
                "Version": "2012-10-17",
                "Statement": [{
                    "Action": ["ec2:Describe*"],
                    "Effect": "Allow",
                    "Resource": "*",
                }],
            }),
        },
        {
            "name": "policy-8675309",
            "policy": inline_policy.json,
        },
    ])
```

```go
package main

import (
	"encoding/json"

	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/iam"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		inlinePolicy, err := iam.GetPolicyDocument(ctx, &iam.GetPolicyDocumentArgs{
			Statements: []iam.GetPolicyDocumentStatement{
				{
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
		tmpJSON0, err := json.Marshal(map[string]interface{}{
			"Version": "2012-10-17",
			"Statement": []map[string]interface{}{
				map[string]interface{}{
					"Action": []string{
						"ec2:Describe*",
					},
					"Effect":   "Allow",
					"Resource": "*",
				},
			},
		})
		if err != nil {
			return err
		}
		json0 := string(tmpJSON0)
		_, err = iam.NewRole(ctx, "example", &iam.RoleArgs{
			Name:             pulumi.String("yak_role"),
			AssumeRolePolicy: pulumi.Any(instanceAssumeRolePolicy.Json),
			InlinePolicies: iam.RoleInlinePolicyArray{
				&iam.RoleInlinePolicyArgs{
					Name:   pulumi.String("my_inline_policy"),
					Policy: pulumi.String(pulumi.String(json0)),
				},
				&iam.RoleInlinePolicyArgs{
					Name:   pulumi.String("policy-8675309"),
					Policy: pulumi.String(inlinePolicy.Json),
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
using System.Text.Json;
using Pulumi;
using Aws = Pulumi.Aws;

return await Deployment.RunAsync(() =>
{
    var inlinePolicy = Aws.Iam.GetPolicyDocument.Invoke(new()
    {
        Statements = new[]
        {
            new Aws.Iam.Inputs.GetPolicyDocumentStatementInputArgs
            {
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

    var example = new Aws.Iam.Role("example", new()
    {
        Name = "yak_role",
        AssumeRolePolicy = instanceAssumeRolePolicy.Json,
        InlinePolicies = new[]
        {
            new Aws.Iam.Inputs.RoleInlinePolicyArgs
            {
                Name = "my_inline_policy",
                Policy = JsonSerializer.Serialize(new Dictionary<string, object?>
                {
                    ["Version"] = "2012-10-17",
                    ["Statement"] = new[]
                    {
                        new Dictionary<string, object?>
                        {
                            ["Action"] = new[]
                            {
                                "ec2:Describe*",
                            },
                            ["Effect"] = "Allow",
                            ["Resource"] = "*",
                        },
                    },
                }),
            },
            new Aws.Iam.Inputs.RoleInlinePolicyArgs
            {
                Name = "policy-8675309",
                Policy = inlinePolicy.Apply(getPolicyDocumentResult => getPolicyDocumentResult.Json),
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
import com.pulumi.aws.iam.Role;
import com.pulumi.aws.iam.RoleArgs;
import com.pulumi.aws.iam.inputs.RoleInlinePolicyArgs;
import static com.pulumi.codegen.internal.Serialization.*;
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
        final var inlinePolicy = IamFunctions.getPolicyDocument(GetPolicyDocumentArgs.builder()
            .statements(GetPolicyDocumentStatementArgs.builder()
                .actions("ec2:DescribeAccountAttributes")
                .resources("*")
                .build())
            .build());

        var example = new Role("example", RoleArgs.builder()
            .name("yak_role")
            .assumeRolePolicy(instanceAssumeRolePolicy.json())
            .inlinePolicies(
                RoleInlinePolicyArgs.builder()
                    .name("my_inline_policy")
                    .policy(serializeJson(
                        jsonObject(
                            jsonProperty("Version", "2012-10-17"),
                            jsonProperty("Statement", jsonArray(jsonObject(
                                jsonProperty("Action", jsonArray("ec2:Describe*")),
                                jsonProperty("Effect", "Allow"),
                                jsonProperty("Resource", "*")
                            )))
                        )))
                    .build(),
                RoleInlinePolicyArgs.builder()
                    .name("policy-8675309")
                    .policy(inlinePolicy.json())
                    .build())
            .build());

    }
}
```

```yaml
resources:
  example:
    type: aws:iam:Role
    properties:
      name: yak_role
      assumeRolePolicy: ${instanceAssumeRolePolicy.json}
      inlinePolicies:
        - name: my_inline_policy
          policy:
            fn::toJSON:
              Version: 2012-10-17
              Statement:
                - Action:
                    - ec2:Describe*
                  Effect: Allow
                  Resource: '*'
        - name: policy-8675309
          policy: ${inlinePolicy.json}
variables:
  inlinePolicy:
    fn::invoke:
      function: aws:iam:getPolicyDocument
      arguments:
        statements:
          - actions:
              - ec2:DescribeAccountAttributes
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

data "aws_iam_getpolicydocument" "inlinePolicy" {
  statements {
    actions   = ["ec2:DescribeAccountAttributes"]
    resources = ["*"]
  }
}

resource "aws_iam_role" "example" {
  name               = "yak_role"
  assume_role_policy = instanceAssumeRolePolicy.json
  inline_policies {
    name = "my_inline_policy"
    policy = jsonencode({
      "Version" = "2012-10-17"
      "Statement" = [{
        "Action"   = ["ec2:Describe*"]
        "Effect"   = "Allow"
        "Resource" = "*"
      }]
    })
  }
  inline_policies {
    name   = "policy-8675309"
    policy = data.aws_iam_getpolicydocument.inlinePolicy.json
  }
}
```

### Example of Removing Inline Policies[](#example-of-removing-inline-policies)

> The `inlinePolicy` argument is deprecated. Use the `aws.iam.RolePolicy` resource instead. If Pulumi should exclusively manage all inline policy associations (the current behavior of this argument), use the `aws.iam.RolePoliciesExclusive` resource as well.

This example creates an IAM role with what appears to be empty IAM `inlinePolicy` argument instead of using `inlinePolicy` as a configuration block. The result is that if someone were to add an inline policy out-of-band, on the next apply, this provider will remove that policy.

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

const example = new aws.iam.Role("example", {
    inlinePolicies: [{}],
    name: "yak_role",
    assumeRolePolicy: instanceAssumeRolePolicy.json,
});
```

```python
import pulumi
import pulumi_aws as aws

example = aws.iam.Role("example",
    inline_policies=[{}],
    name="yak_role",
    assume_role_policy=instance_assume_role_policy["json"])
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/iam"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		_, err := iam.NewRole(ctx, "example", &iam.RoleArgs{
			InlinePolicies: iam.RoleInlinePolicyArray{
				&iam.RoleInlinePolicyArgs{},
			},
			Name:             pulumi.String("yak_role"),
			AssumeRolePolicy: pulumi.Any(instanceAssumeRolePolicy.Json),
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
    var example = new Aws.Iam.Role("example", new()
    {
        InlinePolicies = new[]
        {
            null,
        },
        Name = "yak_role",
        AssumeRolePolicy = instanceAssumeRolePolicy.Json,
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.iam.Role;
import com.pulumi.aws.iam.RoleArgs;
import com.pulumi.aws.iam.inputs.RoleInlinePolicyArgs;
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
        var example = new Role("example", RoleArgs.builder()
            .inlinePolicies(RoleInlinePolicyArgs.builder()
                .build())
            .name("yak_role")
            .assumeRolePolicy(instanceAssumeRolePolicy.json())
            .build());

    }
}
```

```yaml
resources:
  example:
    type: aws:iam:Role
    properties:
      inlinePolicies:
        - {}
      name: yak_role
      assumeRolePolicy: ${instanceAssumeRolePolicy.json}
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_iam_role" "example" {
  inline_policies {
  }
  name               = "yak_role"
  assume_role_policy = instanceAssumeRolePolicy.json
}
```

### Example of Exclusive Managed Policies[](#example-of-exclusive-managed-policies)

> The `managedPolicyArns` argument is deprecated. Use the `aws.iam.RolePolicyAttachment` resource instead. If Pulumi should exclusively manage all managed policy attachments (the current behavior of this argument), use the `aws.iam.RolePolicyAttachmentsExclusive` resource as well.

This example creates an IAM role and attaches two managed IAM policies. If someone attaches another managed policy out-of-band, on the next apply, this provider will detach that policy. If someone detaches these policies out-of-band, this provider will attach them again.

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

const policyOne = new aws.iam.Policy("policy_one", {
    name: "policy-618033",
    policy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [{
            Action: ["ec2:Describe*"],
            Effect: "Allow",
            Resource: "*",
        }],
    }),
});
const policyTwo = new aws.iam.Policy("policy_two", {
    name: "policy-381966",
    policy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [{
            Action: [
                "s3:ListAllMyBuckets",
                "s3:ListBucket",
                "s3:HeadBucket",
            ],
            Effect: "Allow",
            Resource: "*",
        }],
    }),
});
const example = new aws.iam.Role("example", {
    name: "yak_role",
    assumeRolePolicy: instanceAssumeRolePolicy.json,
    managedPolicyArns: [
        policyOne.arn,
        policyTwo.arn,
    ],
});
```

```python
import pulumi
import json
import pulumi_aws as aws

policy_one = aws.iam.Policy("policy_one",
    name="policy-618033",
    policy=json.dumps({
        "Version": "2012-10-17",
        "Statement": [{
            "Action": ["ec2:Describe*"],
            "Effect": "Allow",
            "Resource": "*",
        }],
    }))
policy_two = aws.iam.Policy("policy_two",
    name="policy-381966",
    policy=json.dumps({
        "Version": "2012-10-17",
        "Statement": [{
            "Action": [
                "s3:ListAllMyBuckets",
                "s3:ListBucket",
                "s3:HeadBucket",
            ],
            "Effect": "Allow",
            "Resource": "*",
        }],
    }))
example = aws.iam.Role("example",
    name="yak_role",
    assume_role_policy=instance_assume_role_policy["json"],
    managed_policy_arns=[
        policy_one.arn,
        policy_two.arn,
    ])
```

```go
package main

import (
	"encoding/json"

	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/iam"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		tmpJSON0, err := json.Marshal(map[string]interface{}{
			"Version": "2012-10-17",
			"Statement": []map[string]interface{}{
				map[string]interface{}{
					"Action": []string{
						"ec2:Describe*",
					},
					"Effect":   "Allow",
					"Resource": "*",
				},
			},
		})
		if err != nil {
			return err
		}
		json0 := string(tmpJSON0)
		policyOne, err := iam.NewPolicy(ctx, "policy_one", &iam.PolicyArgs{
			Name:   pulumi.String("policy-618033"),
			Policy: pulumi.String(pulumi.String(json0)),
		})
		if err != nil {
			return err
		}
		tmpJSON1, err := json.Marshal(map[string]interface{}{
			"Version": "2012-10-17",
			"Statement": []map[string]interface{}{
				map[string]interface{}{
					"Action": []string{
						"s3:ListAllMyBuckets",
						"s3:ListBucket",
						"s3:HeadBucket",
					},
					"Effect":   "Allow",
					"Resource": "*",
				},
			},
		})
		if err != nil {
			return err
		}
		json1 := string(tmpJSON1)
		policyTwo, err := iam.NewPolicy(ctx, "policy_two", &iam.PolicyArgs{
			Name:   pulumi.String("policy-381966"),
			Policy: pulumi.String(pulumi.String(json1)),
		})
		if err != nil {
			return err
		}
		_, err = iam.NewRole(ctx, "example", &iam.RoleArgs{
			Name:             pulumi.String("yak_role"),
			AssumeRolePolicy: pulumi.Any(instanceAssumeRolePolicy.Json),
			ManagedPolicyArns: pulumi.StringArray{
				policyOne.Arn,
				policyTwo.Arn,
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
using System.Text.Json;
using Pulumi;
using Aws = Pulumi.Aws;

return await Deployment.RunAsync(() =>
{
    var policyOne = new Aws.Iam.Policy("policy_one", new()
    {
        Name = "policy-618033",
        PolicyDocument = JsonSerializer.Serialize(new Dictionary<string, object?>
        {
            ["Version"] = "2012-10-17",
            ["Statement"] = new[]
            {
                new Dictionary<string, object?>
                {
                    ["Action"] = new[]
                    {
                        "ec2:Describe*",
                    },
                    ["Effect"] = "Allow",
                    ["Resource"] = "*",
                },
            },
        }),
    });

    var policyTwo = new Aws.Iam.Policy("policy_two", new()
    {
        Name = "policy-381966",
        PolicyDocument = JsonSerializer.Serialize(new Dictionary<string, object?>
        {
            ["Version"] = "2012-10-17",
            ["Statement"] = new[]
            {
                new Dictionary<string, object?>
                {
                    ["Action"] = new[]
                    {
                        "s3:ListAllMyBuckets",
                        "s3:ListBucket",
                        "s3:HeadBucket",
                    },
                    ["Effect"] = "Allow",
                    ["Resource"] = "*",
                },
            },
        }),
    });

    var example = new Aws.Iam.Role("example", new()
    {
        Name = "yak_role",
        AssumeRolePolicy = instanceAssumeRolePolicy.Json,
        ManagedPolicyArns = new[]
        {
            policyOne.Arn,
            policyTwo.Arn,
        },
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.iam.Policy;
import com.pulumi.aws.iam.PolicyArgs;
import com.pulumi.aws.iam.Role;
import com.pulumi.aws.iam.RoleArgs;
import static com.pulumi.codegen.internal.Serialization.*;
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
        var policyOne = new Policy("policyOne", PolicyArgs.builder()
            .name("policy-618033")
            .policy(serializeJson(
                jsonObject(
                    jsonProperty("Version", "2012-10-17"),
                    jsonProperty("Statement", jsonArray(jsonObject(
                        jsonProperty("Action", jsonArray("ec2:Describe*")),
                        jsonProperty("Effect", "Allow"),
                        jsonProperty("Resource", "*")
                    )))
                )))
            .build());

        var policyTwo = new Policy("policyTwo", PolicyArgs.builder()
            .name("policy-381966")
            .policy(serializeJson(
                jsonObject(
                    jsonProperty("Version", "2012-10-17"),
                    jsonProperty("Statement", jsonArray(jsonObject(
                        jsonProperty("Action", jsonArray(
                            "s3:ListAllMyBuckets",
                            "s3:ListBucket",
                            "s3:HeadBucket"
                        )),
                        jsonProperty("Effect", "Allow"),
                        jsonProperty("Resource", "*")
                    )))
                )))
            .build());

        var example = new Role("example", RoleArgs.builder()
            .name("yak_role")
            .assumeRolePolicy(instanceAssumeRolePolicy.json())
            .managedPolicyArns(
                policyOne.arn(),
                policyTwo.arn())
            .build());

    }
}
```

```yaml
resources:
  example:
    type: aws:iam:Role
    properties:
      name: yak_role
      assumeRolePolicy: ${instanceAssumeRolePolicy.json}
      managedPolicyArns:
        - ${policyOne.arn}
        - ${policyTwo.arn}
  policyOne:
    type: aws:iam:Policy
    name: policy_one
    properties:
      name: policy-618033
      policy:
        fn::toJSON:
          Version: 2012-10-17
          Statement:
            - Action:
                - ec2:Describe*
              Effect: Allow
              Resource: '*'
  policyTwo:
    type: aws:iam:Policy
    name: policy_two
    properties:
      name: policy-381966
      policy:
        fn::toJSON:
          Version: 2012-10-17
          Statement:
            - Action:
                - s3:ListAllMyBuckets
                - s3:ListBucket
                - s3:HeadBucket
              Effect: Allow
              Resource: '*'
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_iam_role" "example" {
  name                = "yak_role"
  assume_role_policy  = instanceAssumeRolePolicy.json
  managed_policy_arns = [aws_iam_policy.policy_one.arn, aws_iam_policy.policy_two.arn]
}
resource "aws_iam_policy" "policy_one" {
  name = "policy-618033"
  policy = jsonencode({
    "Version" = "2012-10-17"
    "Statement" = [{
      "Action"   = ["ec2:Describe*"]
      "Effect"   = "Allow"
      "Resource" = "*"
    }]
  })
}
resource "aws_iam_policy" "policy_two" {
  name = "policy-381966"
  policy = jsonencode({
    "Version" = "2012-10-17"
    "Statement" = [{
      "Action"   = ["s3:ListAllMyBuckets", "s3:ListBucket", "s3:HeadBucket"]
      "Effect"   = "Allow"
      "Resource" = "*"
    }]
  })
}
```

### Example of Removing Managed Policies[](#example-of-removing-managed-policies)

> The `managedPolicyArns` argument is deprecated. Use the `aws.iam.RolePolicyAttachment` resource instead. If Pulumi should exclusively manage all managed policy attachments (the current behavior of this argument), use the `aws.iam.RolePolicyAttachmentsExclusive` resource as well.

This example creates an IAM role with an empty `managedPolicyArns` argument. If someone attaches a policy out-of-band, on the next apply, this provider will detach that policy.

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

const example = new aws.iam.Role("example", {
    name: "yak_role",
    assumeRolePolicy: instanceAssumeRolePolicy.json,
    managedPolicyArns: [],
});
```

```python
import pulumi
import pulumi_aws as aws

example = aws.iam.Role("example",
    name="yak_role",
    assume_role_policy=instance_assume_role_policy["json"],
    managed_policy_arns=[])
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/iam"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		_, err := iam.NewRole(ctx, "example", &iam.RoleArgs{
			Name:              pulumi.String("yak_role"),
			AssumeRolePolicy:  pulumi.Any(instanceAssumeRolePolicy.Json),
			ManagedPolicyArns: pulumi.StringArray{},
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
    var example = new Aws.Iam.Role("example", new()
    {
        Name = "yak_role",
        AssumeRolePolicy = instanceAssumeRolePolicy.Json,
        ManagedPolicyArns = new[] {},
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.iam.Role;
import com.pulumi.aws.iam.RoleArgs;
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
        var example = new Role("example", RoleArgs.builder()
            .name("yak_role")
            .assumeRolePolicy(instanceAssumeRolePolicy.json())
            .managedPolicyArns()
            .build());

    }
}
```

```yaml
resources:
  example:
    type: aws:iam:Role
    properties:
      name: yak_role
      assumeRolePolicy: ${instanceAssumeRolePolicy.json}
      managedPolicyArns: []
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_iam_role" "example" {
  name                = "yak_role"
  assume_role_policy  = instanceAssumeRolePolicy.json
  managed_policy_arns = []
}
```

## Create Role Resource[](#create)

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
new Role(name: string, args: RoleArgs, opts?: CustomResourceOptions);
```

```python
@overload
def Role(resource_name: str,
         args: RoleArgs,
         opts: Optional[ResourceOptions] = None)

@overload
def Role(resource_name: str,
         opts: Optional[ResourceOptions] = None,
         assume_role_policy: Optional[Union[str, PolicyDocumentArgs]] = None,
         description: Optional[str] = None,
         force_detach_policies: Optional[bool] = None,
         inline_policies: Optional[Sequence[RoleInlinePolicyArgs]] = None,
         managed_policy_arns: Optional[Sequence[str]] = None,
         max_session_duration: Optional[int] = None,
         name: Optional[str] = None,
         name_prefix: Optional[str] = None,
         path: Optional[str] = None,
         permissions_boundary: Optional[str] = None,
         tags: Optional[Mapping[str, str]] = None)
```

```go
func NewRole(ctx *Context, name string, args RoleArgs, opts ...ResourceOption) (*Role, error)
```

```csharp
public Role(string name, RoleArgs args, CustomResourceOptions? opts = null)
```

```java
public Role(String name, RoleArgs args)
public Role(String name, RoleArgs args, CustomResourceOptions options)
```

```yaml
type: aws:iam:Role
properties: # The arguments to resource properties.
options: # Bag of options to control resource's behavior.
```

```hcl
resource "aws_iam_role" "name" {
    # resource properties
}
```

#### Parameters[](#parameters)

name This property is required. string

The unique name of the resource.

args This property is required. [RoleArgs](#inputs)

The arguments to resource properties.

opts [CustomResourceOptions](/docs/reference/pkg/nodejs/pulumi/pulumi/#CustomResourceOptions)

Bag of options to control resource's behavior.

resource\_name This property is required. str

The unique name of the resource.

args This property is required. [RoleArgs](#inputs)

The arguments to resource properties.

opts [ResourceOptions](/docs/reference/pkg/python/pulumi/#pulumi.ResourceOptions)

Bag of options to control resource's behavior.

ctx [Context](https://pkg.go.dev/github.com/pulumi/pulumi/sdk/v3/go/pulumi?tab=doc#Context)

Context object for the current deployment.

name This property is required. string

The unique name of the resource.

args This property is required. [RoleArgs](#inputs)

The arguments to resource properties.

opts [ResourceOption](https://pkg.go.dev/github.com/pulumi/pulumi/sdk/v3/go/pulumi?tab=doc#ResourceOption)

Bag of options to control resource's behavior.

name This property is required. string

The unique name of the resource.

args This property is required. [RoleArgs](#inputs)

The arguments to resource properties.

opts [CustomResourceOptions](/docs/reference/pkg/dotnet/Pulumi/Pulumi.CustomResourceOptions.html)

Bag of options to control resource's behavior.

name This property is required. String

The unique name of the resource.

args This property is required. [RoleArgs](#inputs)

The arguments to resource properties.

options CustomResourceOptions

Bag of options to control resource's behavior.

### Constructor example[](#constructor-example)

The following reference example uses placeholder values for all [input properties](#inputs).

-   TypeScript
-   Python
-   Go
-   C#
-   Java
-   YAML
-   HCL PREVIEW

```csharp
var roleResource = new Aws.Iam.Role("roleResource", new()
{
    AssumeRolePolicy = "string",
    Description = "string",
    ForceDetachPolicies = false,
    InlinePolicies = new[]
    {
        new Aws.Iam.Inputs.RoleInlinePolicyArgs
        {
            Name = "string",
            Policy = "string",
        },
    },
    ManagedPolicyArns = new[]
    {
        "string",
    },
    MaxSessionDuration = 0,
    Name = "string",
    NamePrefix = "string",
    Path = "string",
    PermissionsBoundary = "string",
    Tags =
    {
        { "string", "string" },
    },
});
```

```go
example, err := iam.NewRole(ctx, "roleResource", &iam.RoleArgs{
	AssumeRolePolicy:    pulumi.Any("string"),
	Description:         pulumi.String("string"),
	ForceDetachPolicies: pulumi.Bool(false),
	InlinePolicies: iam.RoleInlinePolicyArray{
		&iam.RoleInlinePolicyArgs{
			Name:   pulumi.String("string"),
			Policy: pulumi.String("string"),
		},
	},
	ManagedPolicyArns: pulumi.StringArray{
		pulumi.String("string"),
	},
	MaxSessionDuration:  pulumi.Int(0),
	Name:                pulumi.String("string"),
	NamePrefix:          pulumi.String("string"),
	Path:                pulumi.String("string"),
	PermissionsBoundary: pulumi.String("string"),
	Tags: pulumi.StringMap{
		"string": pulumi.String("string"),
	},
})
```

```hcl
resource "aws_iam_role" "roleResource" {
  assume_role_policy    = "string"
  description           = "string"
  force_detach_policies = false
  inline_policies {
    name   = "string"
    policy = "string"
  }
  managed_policy_arns  = ["string"]
  max_session_duration = 0
  name                 = "string"
  name_prefix          = "string"
  path                 = "string"
  permissions_boundary = "string"
  tags = {
    "string" = "string"
  }
}
```

```java
var roleResource = new Role("roleResource", RoleArgs.builder()
    .assumeRolePolicy("string")
    .description("string")
    .forceDetachPolicies(false)
    .inlinePolicies(RoleInlinePolicyArgs.builder()
        .name("string")
        .policy("string")
        .build())
    .managedPolicyArns("string")
    .maxSessionDuration(0)
    .name("string")
    .namePrefix("string")
    .path("string")
    .permissionsBoundary("string")
    .tags(Map.of("string", "string"))
    .build());
```

```python
role_resource = aws.iam.Role("roleResource",
    assume_role_policy="string",
    description="string",
    force_detach_policies=False,
    inline_policies=[{
        "name": "string",
        "policy": "string",
    }],
    managed_policy_arns=["string"],
    max_session_duration=0,
    name="string",
    name_prefix="string",
    path="string",
    permissions_boundary="string",
    tags={
        "string": "string",
    })
```

```typescript
const roleResource = new aws.iam.Role("roleResource", {
    assumeRolePolicy: "string",
    description: "string",
    forceDetachPolicies: false,
    inlinePolicies: [{
        name: "string",
        policy: "string",
    }],
    managedPolicyArns: ["string"],
    maxSessionDuration: 0,
    name: "string",
    namePrefix: "string",
    path: "string",
    permissionsBoundary: "string",
    tags: {
        string: "string",
    },
});
```

```yaml
type: aws:iam:Role
properties:
    assumeRolePolicy: string
    description: string
    forceDetachPolicies: false
    inlinePolicies:
        - name: string
          policy: string
    managedPolicyArns:
        - string
    maxSessionDuration: 0
    name: string
    namePrefix: string
    path: string
    permissionsBoundary: string
    tags:
        string: string
```

## Role Resource Properties[](#properties)

To learn more about resource properties and how to use them, see [Inputs and Outputs](/docs/intro/concepts/inputs-outputs) in the Architecture and Concepts docs.

### Inputs[](#inputs)

In Python, inputs that are objects can be passed either as [argument classes or as dictionary literals](/docs/languages-sdks/python/#inputs-and-outputs).

The Role resource accepts the following [input](/docs/intro/concepts/inputs-outputs) properties:

[AssumeRolePolicy](#assumerolepolicy_csharp) This property is required. string | [PolicyDocument](#policydocument)

Policy that grants an entity permission to assume the role.

> **NOTE:** The `assumeRolePolicy` is very similar to but slightly different than a standard IAM policy and cannot use an `aws.iam.Policy` resource. However, it *can* use an `aws.iam.getPolicyDocument` data source. See the example above of how this works.

The following arguments are optional:

[Description](#description_csharp) string

Description of the role.

[ForceDetachPolicies](#forcedetachpolicies_csharp) bool

Whether to force detaching any policies the role has before destroying it. Defaults to `false`.

[InlinePolicies](#inlinepolicies_csharp) [List<RoleInlinePolicy>](#roleinlinepolicy)

Configuration block defining an exclusive set of IAM inline policies associated with the IAM role. See below. If no blocks are configured, Pulumi will not manage any inline policies in this resource. Configuring one empty block (i.e., `inlinePolicy {}`) will cause Pulumi to remove *all* inline policies added out of band on `apply`.

[ManagedPolicyArns](#managedpolicyarns_csharp) List<string>

Set of exclusive IAM managed policy ARNs to attach to the IAM role. If this attribute is not configured, Pulumi will ignore policy attachments to this resource. When configured, Pulumi will align the role's managed policy attachments with this set by attaching or detaching managed policies. Configuring an empty set (i.e., `managedPolicyArns = []`) will cause Pulumi to remove *all* managed policy attachments.

[MaxSessionDuration](#maxsessionduration_csharp) int

Maximum session duration (in seconds) that you want to set for the specified role. If you do not specify a value for this setting, the default maximum of one hour is applied. This setting can have a value from 1 hour to 12 hours.

[Name](#name_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Friendly name of the role. If omitted, the provider will assign a random, unique name. See [IAM Identifiers](https://docs.aws.amazon.com/IAM/latest/UserGuide/Using_Identifiers.html) for more information.

[NamePrefix](#nameprefix_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Creates a unique friendly name beginning with the specified prefix. Conflicts with `name`.

[Path](#path_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Path to the role. See [IAM Identifiers](https://docs.aws.amazon.com/IAM/latest/UserGuide/Using_Identifiers.html) for more information.

[PermissionsBoundary](#permissionsboundary_csharp) string

ARN of the policy that is used to set the permissions boundary for the role.

[Tags](#tags_csharp) Dictionary<string, string>

Key-value mapping of tags for the IAM role. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[AssumeRolePolicy](#assumerolepolicy_go) This property is required. string | [PolicyDocumentArgs](#policydocument)

Policy that grants an entity permission to assume the role.

> **NOTE:** The `assumeRolePolicy` is very similar to but slightly different than a standard IAM policy and cannot use an `aws.iam.Policy` resource. However, it *can* use an `aws.iam.getPolicyDocument` data source. See the example above of how this works.

The following arguments are optional:

[Description](#description_go) string

Description of the role.

[ForceDetachPolicies](#forcedetachpolicies_go) bool

Whether to force detaching any policies the role has before destroying it. Defaults to `false`.

[InlinePolicies](#inlinepolicies_go) [\[\]RoleInlinePolicyArgs](#roleinlinepolicy)

Configuration block defining an exclusive set of IAM inline policies associated with the IAM role. See below. If no blocks are configured, Pulumi will not manage any inline policies in this resource. Configuring one empty block (i.e., `inlinePolicy {}`) will cause Pulumi to remove *all* inline policies added out of band on `apply`.

[ManagedPolicyArns](#managedpolicyarns_go) \[\]string

Set of exclusive IAM managed policy ARNs to attach to the IAM role. If this attribute is not configured, Pulumi will ignore policy attachments to this resource. When configured, Pulumi will align the role's managed policy attachments with this set by attaching or detaching managed policies. Configuring an empty set (i.e., `managedPolicyArns = []`) will cause Pulumi to remove *all* managed policy attachments.

[MaxSessionDuration](#maxsessionduration_go) int

Maximum session duration (in seconds) that you want to set for the specified role. If you do not specify a value for this setting, the default maximum of one hour is applied. This setting can have a value from 1 hour to 12 hours.

[Name](#name_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Friendly name of the role. If omitted, the provider will assign a random, unique name. See [IAM Identifiers](https://docs.aws.amazon.com/IAM/latest/UserGuide/Using_Identifiers.html) for more information.

[NamePrefix](#nameprefix_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Creates a unique friendly name beginning with the specified prefix. Conflicts with `name`.

[Path](#path_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Path to the role. See [IAM Identifiers](https://docs.aws.amazon.com/IAM/latest/UserGuide/Using_Identifiers.html) for more information.

[PermissionsBoundary](#permissionsboundary_go) string

ARN of the policy that is used to set the permissions boundary for the role.

[Tags](#tags_go) map\[string\]string

Key-value mapping of tags for the IAM role. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[assume\_role\_policy](#assume_role_policy_hcl) This property is required. string | [object](#policydocument)

Policy that grants an entity permission to assume the role.

> **NOTE:** The `assumeRolePolicy` is very similar to but slightly different than a standard IAM policy and cannot use an `aws.iam.Policy` resource. However, it *can* use an `aws.iam.getPolicyDocument` data source. See the example above of how this works.

The following arguments are optional:

[description](#description_hcl) string

Description of the role.

[force\_detach\_policies](#force_detach_policies_hcl) bool

Whether to force detaching any policies the role has before destroying it. Defaults to `false`.

[inline\_policies](#inline_policies_hcl) [list(object)](#roleinlinepolicy)

Configuration block defining an exclusive set of IAM inline policies associated with the IAM role. See below. If no blocks are configured, Pulumi will not manage any inline policies in this resource. Configuring one empty block (i.e., `inlinePolicy {}`) will cause Pulumi to remove *all* inline policies added out of band on `apply`.

[managed\_policy\_arns](#managed_policy_arns_hcl) list(string)

Set of exclusive IAM managed policy ARNs to attach to the IAM role. If this attribute is not configured, Pulumi will ignore policy attachments to this resource. When configured, Pulumi will align the role's managed policy attachments with this set by attaching or detaching managed policies. Configuring an empty set (i.e., `managedPolicyArns = []`) will cause Pulumi to remove *all* managed policy attachments.

[max\_session\_duration](#max_session_duration_hcl) number

Maximum session duration (in seconds) that you want to set for the specified role. If you do not specify a value for this setting, the default maximum of one hour is applied. This setting can have a value from 1 hour to 12 hours.

[name](#name_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Friendly name of the role. If omitted, the provider will assign a random, unique name. See [IAM Identifiers](https://docs.aws.amazon.com/IAM/latest/UserGuide/Using_Identifiers.html) for more information.

[name\_prefix](#name_prefix_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Creates a unique friendly name beginning with the specified prefix. Conflicts with `name`.

[path](#path_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Path to the role. See [IAM Identifiers](https://docs.aws.amazon.com/IAM/latest/UserGuide/Using_Identifiers.html) for more information.

[permissions\_boundary](#permissions_boundary_hcl) string

ARN of the policy that is used to set the permissions boundary for the role.

[tags](#tags_hcl) map(string)

Key-value mapping of tags for the IAM role. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[assumeRolePolicy](#assumerolepolicy_java) This property is required. String | [PolicyDocument](#policydocument)

Policy that grants an entity permission to assume the role.

> **NOTE:** The `assumeRolePolicy` is very similar to but slightly different than a standard IAM policy and cannot use an `aws.iam.Policy` resource. However, it *can* use an `aws.iam.getPolicyDocument` data source. See the example above of how this works.

The following arguments are optional:

[description](#description_java) String

Description of the role.

[forceDetachPolicies](#forcedetachpolicies_java) Boolean

Whether to force detaching any policies the role has before destroying it. Defaults to `false`.

[inlinePolicies](#inlinepolicies_java) [List<RoleInlinePolicy>](#roleinlinepolicy)

Configuration block defining an exclusive set of IAM inline policies associated with the IAM role. See below. If no blocks are configured, Pulumi will not manage any inline policies in this resource. Configuring one empty block (i.e., `inlinePolicy {}`) will cause Pulumi to remove *all* inline policies added out of band on `apply`.

[managedPolicyArns](#managedpolicyarns_java) List<String>

Set of exclusive IAM managed policy ARNs to attach to the IAM role. If this attribute is not configured, Pulumi will ignore policy attachments to this resource. When configured, Pulumi will align the role's managed policy attachments with this set by attaching or detaching managed policies. Configuring an empty set (i.e., `managedPolicyArns = []`) will cause Pulumi to remove *all* managed policy attachments.

[maxSessionDuration](#maxsessionduration_java) Integer

Maximum session duration (in seconds) that you want to set for the specified role. If you do not specify a value for this setting, the default maximum of one hour is applied. This setting can have a value from 1 hour to 12 hours.

[name](#name_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Friendly name of the role. If omitted, the provider will assign a random, unique name. See [IAM Identifiers](https://docs.aws.amazon.com/IAM/latest/UserGuide/Using_Identifiers.html) for more information.

[namePrefix](#nameprefix_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Creates a unique friendly name beginning with the specified prefix. Conflicts with `name`.

[path](#path_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Path to the role. See [IAM Identifiers](https://docs.aws.amazon.com/IAM/latest/UserGuide/Using_Identifiers.html) for more information.

[permissionsBoundary](#permissionsboundary_java) String

ARN of the policy that is used to set the permissions boundary for the role.

[tags](#tags_java) Map<String,String>

Key-value mapping of tags for the IAM role. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[assumeRolePolicy](#assumerolepolicy_nodejs) This property is required. string | [PolicyDocument](#policydocument)

Policy that grants an entity permission to assume the role.

> **NOTE:** The `assumeRolePolicy` is very similar to but slightly different than a standard IAM policy and cannot use an `aws.iam.Policy` resource. However, it *can* use an `aws.iam.getPolicyDocument` data source. See the example above of how this works.

The following arguments are optional:

[description](#description_nodejs) string

Description of the role.

[forceDetachPolicies](#forcedetachpolicies_nodejs) boolean

Whether to force detaching any policies the role has before destroying it. Defaults to `false`.

[inlinePolicies](#inlinepolicies_nodejs) [RoleInlinePolicy\[\]](#roleinlinepolicy)

Configuration block defining an exclusive set of IAM inline policies associated with the IAM role. See below. If no blocks are configured, Pulumi will not manage any inline policies in this resource. Configuring one empty block (i.e., `inlinePolicy {}`) will cause Pulumi to remove *all* inline policies added out of band on `apply`.

[managedPolicyArns](#managedpolicyarns_nodejs) string\[\]

Set of exclusive IAM managed policy ARNs to attach to the IAM role. If this attribute is not configured, Pulumi will ignore policy attachments to this resource. When configured, Pulumi will align the role's managed policy attachments with this set by attaching or detaching managed policies. Configuring an empty set (i.e., `managedPolicyArns = []`) will cause Pulumi to remove *all* managed policy attachments.

[maxSessionDuration](#maxsessionduration_nodejs) number

Maximum session duration (in seconds) that you want to set for the specified role. If you do not specify a value for this setting, the default maximum of one hour is applied. This setting can have a value from 1 hour to 12 hours.

[name](#name_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Friendly name of the role. If omitted, the provider will assign a random, unique name. See [IAM Identifiers](https://docs.aws.amazon.com/IAM/latest/UserGuide/Using_Identifiers.html) for more information.

[namePrefix](#nameprefix_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Creates a unique friendly name beginning with the specified prefix. Conflicts with `name`.

[path](#path_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Path to the role. See [IAM Identifiers](https://docs.aws.amazon.com/IAM/latest/UserGuide/Using_Identifiers.html) for more information.

[permissionsBoundary](#permissionsboundary_nodejs) string

ARN of the policy that is used to set the permissions boundary for the role.

[tags](#tags_nodejs) {\[key: string\]: string}

Key-value mapping of tags for the IAM role. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[assume\_role\_policy](#assume_role_policy_python) This property is required. str | [PolicyDocumentArgs](#policydocument)

Policy that grants an entity permission to assume the role.

> **NOTE:** The `assumeRolePolicy` is very similar to but slightly different than a standard IAM policy and cannot use an `aws.iam.Policy` resource. However, it *can* use an `aws.iam.getPolicyDocument` data source. See the example above of how this works.

The following arguments are optional:

[description](#description_python) str

Description of the role.

[force\_detach\_policies](#force_detach_policies_python) bool

Whether to force detaching any policies the role has before destroying it. Defaults to `false`.

[inline\_policies](#inline_policies_python) [Sequence\[RoleInlinePolicyArgs\]](#roleinlinepolicy)

Configuration block defining an exclusive set of IAM inline policies associated with the IAM role. See below. If no blocks are configured, Pulumi will not manage any inline policies in this resource. Configuring one empty block (i.e., `inlinePolicy {}`) will cause Pulumi to remove *all* inline policies added out of band on `apply`.

[managed\_policy\_arns](#managed_policy_arns_python) Sequence\[str\]

Set of exclusive IAM managed policy ARNs to attach to the IAM role. If this attribute is not configured, Pulumi will ignore policy attachments to this resource. When configured, Pulumi will align the role's managed policy attachments with this set by attaching or detaching managed policies. Configuring an empty set (i.e., `managedPolicyArns = []`) will cause Pulumi to remove *all* managed policy attachments.

[max\_session\_duration](#max_session_duration_python) int

Maximum session duration (in seconds) that you want to set for the specified role. If you do not specify a value for this setting, the default maximum of one hour is applied. This setting can have a value from 1 hour to 12 hours.

[name](#name_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Friendly name of the role. If omitted, the provider will assign a random, unique name. See [IAM Identifiers](https://docs.aws.amazon.com/IAM/latest/UserGuide/Using_Identifiers.html) for more information.

[name\_prefix](#name_prefix_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Creates a unique friendly name beginning with the specified prefix. Conflicts with `name`.

[path](#path_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Path to the role. See [IAM Identifiers](https://docs.aws.amazon.com/IAM/latest/UserGuide/Using_Identifiers.html) for more information.

[permissions\_boundary](#permissions_boundary_python) str

ARN of the policy that is used to set the permissions boundary for the role.

[tags](#tags_python) Mapping\[str, str\]

Key-value mapping of tags for the IAM role. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[assumeRolePolicy](#assumerolepolicy_yaml) This property is required. String | [Property Map](#policydocument)

Policy that grants an entity permission to assume the role.

> **NOTE:** The `assumeRolePolicy` is very similar to but slightly different than a standard IAM policy and cannot use an `aws.iam.Policy` resource. However, it *can* use an `aws.iam.getPolicyDocument` data source. See the example above of how this works.

The following arguments are optional:

[description](#description_yaml) String

Description of the role.

[forceDetachPolicies](#forcedetachpolicies_yaml) Boolean

Whether to force detaching any policies the role has before destroying it. Defaults to `false`.

[inlinePolicies](#inlinepolicies_yaml) [List<Property Map>](#roleinlinepolicy)

Configuration block defining an exclusive set of IAM inline policies associated with the IAM role. See below. If no blocks are configured, Pulumi will not manage any inline policies in this resource. Configuring one empty block (i.e., `inlinePolicy {}`) will cause Pulumi to remove *all* inline policies added out of band on `apply`.

[managedPolicyArns](#managedpolicyarns_yaml) List<String>

Set of exclusive IAM managed policy ARNs to attach to the IAM role. If this attribute is not configured, Pulumi will ignore policy attachments to this resource. When configured, Pulumi will align the role's managed policy attachments with this set by attaching or detaching managed policies. Configuring an empty set (i.e., `managedPolicyArns = []`) will cause Pulumi to remove *all* managed policy attachments.

[maxSessionDuration](#maxsessionduration_yaml) Number

Maximum session duration (in seconds) that you want to set for the specified role. If you do not specify a value for this setting, the default maximum of one hour is applied. This setting can have a value from 1 hour to 12 hours.

[name](#name_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Friendly name of the role. If omitted, the provider will assign a random, unique name. See [IAM Identifiers](https://docs.aws.amazon.com/IAM/latest/UserGuide/Using_Identifiers.html) for more information.

[namePrefix](#nameprefix_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Creates a unique friendly name beginning with the specified prefix. Conflicts with `name`.

[path](#path_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Path to the role. See [IAM Identifiers](https://docs.aws.amazon.com/IAM/latest/UserGuide/Using_Identifiers.html) for more information.

[permissionsBoundary](#permissionsboundary_yaml) String

ARN of the policy that is used to set the permissions boundary for the role.

[tags](#tags_yaml) Map<String>

Key-value mapping of tags for the IAM role. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

### Outputs[](#outputs)

All [input](#inputs) properties are implicitly available as output properties. Additionally, the Role resource produces the following output properties:

[Arn](#arn_csharp) string

Amazon Resource Name (ARN) specifying the role.

[CreateDate](#createdate_csharp) string

Creation date of the IAM role.

[Id](#id_csharp) string

The provider-assigned unique ID for this managed resource.

[TagsAll](#tagsall_csharp) Dictionary<string, string>

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[UniqueId](#uniqueid_csharp) string

Stable and unique string identifying the role.

[Arn](#arn_go) string

Amazon Resource Name (ARN) specifying the role.

[CreateDate](#createdate_go) string

Creation date of the IAM role.

[Id](#id_go) string

The provider-assigned unique ID for this managed resource.

[TagsAll](#tagsall_go) map\[string\]string

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[UniqueId](#uniqueid_go) string

Stable and unique string identifying the role.

[arn](#arn_hcl) string

Amazon Resource Name (ARN) specifying the role.

[create\_date](#create_date_hcl) string

Creation date of the IAM role.

[id](#id_hcl) string

The provider-assigned unique ID for this managed resource.

[tags\_all](#tags_all_hcl) map(string)

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[unique\_id](#unique_id_hcl) string

Stable and unique string identifying the role.

[arn](#arn_java) String

Amazon Resource Name (ARN) specifying the role.

[createDate](#createdate_java) String

Creation date of the IAM role.

[id](#id_java) String

The provider-assigned unique ID for this managed resource.

[tagsAll](#tagsall_java) Map<String,String>

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[uniqueId](#uniqueid_java) String

Stable and unique string identifying the role.

[arn](#arn_nodejs) string

Amazon Resource Name (ARN) specifying the role.

[createDate](#createdate_nodejs) string

Creation date of the IAM role.

[id](#id_nodejs) string

The provider-assigned unique ID for this managed resource.

[tagsAll](#tagsall_nodejs) {\[key: string\]: string}

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[uniqueId](#uniqueid_nodejs) string

Stable and unique string identifying the role.

[arn](#arn_python) str

Amazon Resource Name (ARN) specifying the role.

[create\_date](#create_date_python) str

Creation date of the IAM role.

[id](#id_python) str

The provider-assigned unique ID for this managed resource.

[tags\_all](#tags_all_python) Mapping\[str, str\]

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[unique\_id](#unique_id_python) str

Stable and unique string identifying the role.

[arn](#arn_yaml) String

Amazon Resource Name (ARN) specifying the role.

[createDate](#createdate_yaml) String

Creation date of the IAM role.

[id](#id_yaml) String

The provider-assigned unique ID for this managed resource.

[tagsAll](#tagsall_yaml) Map<String>

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[uniqueId](#uniqueid_yaml) String

Stable and unique string identifying the role.

## Look up Existing Role Resource[](#look-up)

Get an existing Role resource’s state with the given name, ID, and optional extra properties used to qualify the lookup.

-   TypeScript
-   Python
-   Go
-   C#
-   Java
-   YAML
-   HCL PREVIEW

```typescript
public static get(name: string, id: Input<ID>, state?: RoleState, opts?: CustomResourceOptions): Role
```

```python
@staticmethod
def get(resource_name: str,
        id: str,
        opts: Optional[ResourceOptions] = None,
        arn: Optional[str] = None,
        assume_role_policy: Optional[Union[str, PolicyDocumentArgs]] = None,
        create_date: Optional[str] = None,
        description: Optional[str] = None,
        force_detach_policies: Optional[bool] = None,
        inline_policies: Optional[Sequence[RoleInlinePolicyArgs]] = None,
        managed_policy_arns: Optional[Sequence[str]] = None,
        max_session_duration: Optional[int] = None,
        name: Optional[str] = None,
        name_prefix: Optional[str] = None,
        path: Optional[str] = None,
        permissions_boundary: Optional[str] = None,
        tags: Optional[Mapping[str, str]] = None,
        tags_all: Optional[Mapping[str, str]] = None,
        unique_id: Optional[str] = None) -> Role
```

```go
func GetRole(ctx *Context, name string, id IDInput, state *RoleState, opts ...ResourceOption) (*Role, error)
```

```csharp
public static Role Get(string name, Input<string> id, RoleState? state, CustomResourceOptions? opts = null)
```

```java
public static Role get(String name, Output<String> id, RoleState state, CustomResourceOptions options)
```

```yaml
resources:  _:    type: aws:iam:Role    get:      id: ${id}
```

```hcl
import {
  to = aws_iam_role.example
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

[Arn](#state_arn_csharp) string

Amazon Resource Name (ARN) specifying the role.

[AssumeRolePolicy](#state_assumerolepolicy_csharp) string | [PolicyDocument](#policydocument)

Policy that grants an entity permission to assume the role.

> **NOTE:** The `assumeRolePolicy` is very similar to but slightly different than a standard IAM policy and cannot use an `aws.iam.Policy` resource. However, it *can* use an `aws.iam.getPolicyDocument` data source. See the example above of how this works.

The following arguments are optional:

[CreateDate](#state_createdate_csharp) string

Creation date of the IAM role.

[Description](#state_description_csharp) string

Description of the role.

[ForceDetachPolicies](#state_forcedetachpolicies_csharp) bool

Whether to force detaching any policies the role has before destroying it. Defaults to `false`.

[InlinePolicies](#state_inlinepolicies_csharp) [List<RoleInlinePolicy>](#roleinlinepolicy)

Configuration block defining an exclusive set of IAM inline policies associated with the IAM role. See below. If no blocks are configured, Pulumi will not manage any inline policies in this resource. Configuring one empty block (i.e., `inlinePolicy {}`) will cause Pulumi to remove *all* inline policies added out of band on `apply`.

[ManagedPolicyArns](#state_managedpolicyarns_csharp) List<string>

Set of exclusive IAM managed policy ARNs to attach to the IAM role. If this attribute is not configured, Pulumi will ignore policy attachments to this resource. When configured, Pulumi will align the role's managed policy attachments with this set by attaching or detaching managed policies. Configuring an empty set (i.e., `managedPolicyArns = []`) will cause Pulumi to remove *all* managed policy attachments.

[MaxSessionDuration](#state_maxsessionduration_csharp) int

Maximum session duration (in seconds) that you want to set for the specified role. If you do not specify a value for this setting, the default maximum of one hour is applied. This setting can have a value from 1 hour to 12 hours.

[Name](#state_name_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Friendly name of the role. If omitted, the provider will assign a random, unique name. See [IAM Identifiers](https://docs.aws.amazon.com/IAM/latest/UserGuide/Using_Identifiers.html) for more information.

[NamePrefix](#state_nameprefix_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Creates a unique friendly name beginning with the specified prefix. Conflicts with `name`.

[Path](#state_path_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Path to the role. See [IAM Identifiers](https://docs.aws.amazon.com/IAM/latest/UserGuide/Using_Identifiers.html) for more information.

[PermissionsBoundary](#state_permissionsboundary_csharp) string

ARN of the policy that is used to set the permissions boundary for the role.

[Tags](#state_tags_csharp) Dictionary<string, string>

Key-value mapping of tags for the IAM role. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[TagsAll](#state_tagsall_csharp) Dictionary<string, string>

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[UniqueId](#state_uniqueid_csharp) string

Stable and unique string identifying the role.

[Arn](#state_arn_go) string

Amazon Resource Name (ARN) specifying the role.

[AssumeRolePolicy](#state_assumerolepolicy_go) string | [PolicyDocumentArgs](#policydocument)

Policy that grants an entity permission to assume the role.

> **NOTE:** The `assumeRolePolicy` is very similar to but slightly different than a standard IAM policy and cannot use an `aws.iam.Policy` resource. However, it *can* use an `aws.iam.getPolicyDocument` data source. See the example above of how this works.

The following arguments are optional:

[CreateDate](#state_createdate_go) string

Creation date of the IAM role.

[Description](#state_description_go) string

Description of the role.

[ForceDetachPolicies](#state_forcedetachpolicies_go) bool

Whether to force detaching any policies the role has before destroying it. Defaults to `false`.

[InlinePolicies](#state_inlinepolicies_go) [\[\]RoleInlinePolicyArgs](#roleinlinepolicy)

Configuration block defining an exclusive set of IAM inline policies associated with the IAM role. See below. If no blocks are configured, Pulumi will not manage any inline policies in this resource. Configuring one empty block (i.e., `inlinePolicy {}`) will cause Pulumi to remove *all* inline policies added out of band on `apply`.

[ManagedPolicyArns](#state_managedpolicyarns_go) \[\]string

Set of exclusive IAM managed policy ARNs to attach to the IAM role. If this attribute is not configured, Pulumi will ignore policy attachments to this resource. When configured, Pulumi will align the role's managed policy attachments with this set by attaching or detaching managed policies. Configuring an empty set (i.e., `managedPolicyArns = []`) will cause Pulumi to remove *all* managed policy attachments.

[MaxSessionDuration](#state_maxsessionduration_go) int

Maximum session duration (in seconds) that you want to set for the specified role. If you do not specify a value for this setting, the default maximum of one hour is applied. This setting can have a value from 1 hour to 12 hours.

[Name](#state_name_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Friendly name of the role. If omitted, the provider will assign a random, unique name. See [IAM Identifiers](https://docs.aws.amazon.com/IAM/latest/UserGuide/Using_Identifiers.html) for more information.

[NamePrefix](#state_nameprefix_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Creates a unique friendly name beginning with the specified prefix. Conflicts with `name`.

[Path](#state_path_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Path to the role. See [IAM Identifiers](https://docs.aws.amazon.com/IAM/latest/UserGuide/Using_Identifiers.html) for more information.

[PermissionsBoundary](#state_permissionsboundary_go) string

ARN of the policy that is used to set the permissions boundary for the role.

[Tags](#state_tags_go) map\[string\]string

Key-value mapping of tags for the IAM role. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[TagsAll](#state_tagsall_go) map\[string\]string

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[UniqueId](#state_uniqueid_go) string

Stable and unique string identifying the role.

[arn](#state_arn_hcl) string

Amazon Resource Name (ARN) specifying the role.

[assume\_role\_policy](#state_assume_role_policy_hcl) string | [object](#policydocument)

Policy that grants an entity permission to assume the role.

> **NOTE:** The `assumeRolePolicy` is very similar to but slightly different than a standard IAM policy and cannot use an `aws.iam.Policy` resource. However, it *can* use an `aws.iam.getPolicyDocument` data source. See the example above of how this works.

The following arguments are optional:

[create\_date](#state_create_date_hcl) string

Creation date of the IAM role.

[description](#state_description_hcl) string

Description of the role.

[force\_detach\_policies](#state_force_detach_policies_hcl) bool

Whether to force detaching any policies the role has before destroying it. Defaults to `false`.

[inline\_policies](#state_inline_policies_hcl) [list(object)](#roleinlinepolicy)

Configuration block defining an exclusive set of IAM inline policies associated with the IAM role. See below. If no blocks are configured, Pulumi will not manage any inline policies in this resource. Configuring one empty block (i.e., `inlinePolicy {}`) will cause Pulumi to remove *all* inline policies added out of band on `apply`.

[managed\_policy\_arns](#state_managed_policy_arns_hcl) list(string)

Set of exclusive IAM managed policy ARNs to attach to the IAM role. If this attribute is not configured, Pulumi will ignore policy attachments to this resource. When configured, Pulumi will align the role's managed policy attachments with this set by attaching or detaching managed policies. Configuring an empty set (i.e., `managedPolicyArns = []`) will cause Pulumi to remove *all* managed policy attachments.

[max\_session\_duration](#state_max_session_duration_hcl) number

Maximum session duration (in seconds) that you want to set for the specified role. If you do not specify a value for this setting, the default maximum of one hour is applied. This setting can have a value from 1 hour to 12 hours.

[name](#state_name_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Friendly name of the role. If omitted, the provider will assign a random, unique name. See [IAM Identifiers](https://docs.aws.amazon.com/IAM/latest/UserGuide/Using_Identifiers.html) for more information.

[name\_prefix](#state_name_prefix_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Creates a unique friendly name beginning with the specified prefix. Conflicts with `name`.

[path](#state_path_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Path to the role. See [IAM Identifiers](https://docs.aws.amazon.com/IAM/latest/UserGuide/Using_Identifiers.html) for more information.

[permissions\_boundary](#state_permissions_boundary_hcl) string

ARN of the policy that is used to set the permissions boundary for the role.

[tags](#state_tags_hcl) map(string)

Key-value mapping of tags for the IAM role. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tags\_all](#state_tags_all_hcl) map(string)

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[unique\_id](#state_unique_id_hcl) string

Stable and unique string identifying the role.

[arn](#state_arn_java) String

Amazon Resource Name (ARN) specifying the role.

[assumeRolePolicy](#state_assumerolepolicy_java) String | [PolicyDocument](#policydocument)

Policy that grants an entity permission to assume the role.

> **NOTE:** The `assumeRolePolicy` is very similar to but slightly different than a standard IAM policy and cannot use an `aws.iam.Policy` resource. However, it *can* use an `aws.iam.getPolicyDocument` data source. See the example above of how this works.

The following arguments are optional:

[createDate](#state_createdate_java) String

Creation date of the IAM role.

[description](#state_description_java) String

Description of the role.

[forceDetachPolicies](#state_forcedetachpolicies_java) Boolean

Whether to force detaching any policies the role has before destroying it. Defaults to `false`.

[inlinePolicies](#state_inlinepolicies_java) [List<RoleInlinePolicy>](#roleinlinepolicy)

Configuration block defining an exclusive set of IAM inline policies associated with the IAM role. See below. If no blocks are configured, Pulumi will not manage any inline policies in this resource. Configuring one empty block (i.e., `inlinePolicy {}`) will cause Pulumi to remove *all* inline policies added out of band on `apply`.

[managedPolicyArns](#state_managedpolicyarns_java) List<String>

Set of exclusive IAM managed policy ARNs to attach to the IAM role. If this attribute is not configured, Pulumi will ignore policy attachments to this resource. When configured, Pulumi will align the role's managed policy attachments with this set by attaching or detaching managed policies. Configuring an empty set (i.e., `managedPolicyArns = []`) will cause Pulumi to remove *all* managed policy attachments.

[maxSessionDuration](#state_maxsessionduration_java) Integer

Maximum session duration (in seconds) that you want to set for the specified role. If you do not specify a value for this setting, the default maximum of one hour is applied. This setting can have a value from 1 hour to 12 hours.

[name](#state_name_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Friendly name of the role. If omitted, the provider will assign a random, unique name. See [IAM Identifiers](https://docs.aws.amazon.com/IAM/latest/UserGuide/Using_Identifiers.html) for more information.

[namePrefix](#state_nameprefix_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Creates a unique friendly name beginning with the specified prefix. Conflicts with `name`.

[path](#state_path_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Path to the role. See [IAM Identifiers](https://docs.aws.amazon.com/IAM/latest/UserGuide/Using_Identifiers.html) for more information.

[permissionsBoundary](#state_permissionsboundary_java) String

ARN of the policy that is used to set the permissions boundary for the role.

[tags](#state_tags_java) Map<String,String>

Key-value mapping of tags for the IAM role. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tagsAll](#state_tagsall_java) Map<String,String>

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[uniqueId](#state_uniqueid_java) String

Stable and unique string identifying the role.

[arn](#state_arn_nodejs) string

Amazon Resource Name (ARN) specifying the role.

[assumeRolePolicy](#state_assumerolepolicy_nodejs) string | [PolicyDocument](#policydocument)

Policy that grants an entity permission to assume the role.

> **NOTE:** The `assumeRolePolicy` is very similar to but slightly different than a standard IAM policy and cannot use an `aws.iam.Policy` resource. However, it *can* use an `aws.iam.getPolicyDocument` data source. See the example above of how this works.

The following arguments are optional:

[createDate](#state_createdate_nodejs) string

Creation date of the IAM role.

[description](#state_description_nodejs) string

Description of the role.

[forceDetachPolicies](#state_forcedetachpolicies_nodejs) boolean

Whether to force detaching any policies the role has before destroying it. Defaults to `false`.

[inlinePolicies](#state_inlinepolicies_nodejs) [RoleInlinePolicy\[\]](#roleinlinepolicy)

Configuration block defining an exclusive set of IAM inline policies associated with the IAM role. See below. If no blocks are configured, Pulumi will not manage any inline policies in this resource. Configuring one empty block (i.e., `inlinePolicy {}`) will cause Pulumi to remove *all* inline policies added out of band on `apply`.

[managedPolicyArns](#state_managedpolicyarns_nodejs) string\[\]

Set of exclusive IAM managed policy ARNs to attach to the IAM role. If this attribute is not configured, Pulumi will ignore policy attachments to this resource. When configured, Pulumi will align the role's managed policy attachments with this set by attaching or detaching managed policies. Configuring an empty set (i.e., `managedPolicyArns = []`) will cause Pulumi to remove *all* managed policy attachments.

[maxSessionDuration](#state_maxsessionduration_nodejs) number

Maximum session duration (in seconds) that you want to set for the specified role. If you do not specify a value for this setting, the default maximum of one hour is applied. This setting can have a value from 1 hour to 12 hours.

[name](#state_name_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Friendly name of the role. If omitted, the provider will assign a random, unique name. See [IAM Identifiers](https://docs.aws.amazon.com/IAM/latest/UserGuide/Using_Identifiers.html) for more information.

[namePrefix](#state_nameprefix_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Creates a unique friendly name beginning with the specified prefix. Conflicts with `name`.

[path](#state_path_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Path to the role. See [IAM Identifiers](https://docs.aws.amazon.com/IAM/latest/UserGuide/Using_Identifiers.html) for more information.

[permissionsBoundary](#state_permissionsboundary_nodejs) string

ARN of the policy that is used to set the permissions boundary for the role.

[tags](#state_tags_nodejs) {\[key: string\]: string}

Key-value mapping of tags for the IAM role. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tagsAll](#state_tagsall_nodejs) {\[key: string\]: string}

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[uniqueId](#state_uniqueid_nodejs) string

Stable and unique string identifying the role.

[arn](#state_arn_python) str

Amazon Resource Name (ARN) specifying the role.

[assume\_role\_policy](#state_assume_role_policy_python) str | [PolicyDocumentArgs](#policydocument)

Policy that grants an entity permission to assume the role.

> **NOTE:** The `assumeRolePolicy` is very similar to but slightly different than a standard IAM policy and cannot use an `aws.iam.Policy` resource. However, it *can* use an `aws.iam.getPolicyDocument` data source. See the example above of how this works.

The following arguments are optional:

[create\_date](#state_create_date_python) str

Creation date of the IAM role.

[description](#state_description_python) str

Description of the role.

[force\_detach\_policies](#state_force_detach_policies_python) bool

Whether to force detaching any policies the role has before destroying it. Defaults to `false`.

[inline\_policies](#state_inline_policies_python) [Sequence\[RoleInlinePolicyArgs\]](#roleinlinepolicy)

Configuration block defining an exclusive set of IAM inline policies associated with the IAM role. See below. If no blocks are configured, Pulumi will not manage any inline policies in this resource. Configuring one empty block (i.e., `inlinePolicy {}`) will cause Pulumi to remove *all* inline policies added out of band on `apply`.

[managed\_policy\_arns](#state_managed_policy_arns_python) Sequence\[str\]

Set of exclusive IAM managed policy ARNs to attach to the IAM role. If this attribute is not configured, Pulumi will ignore policy attachments to this resource. When configured, Pulumi will align the role's managed policy attachments with this set by attaching or detaching managed policies. Configuring an empty set (i.e., `managedPolicyArns = []`) will cause Pulumi to remove *all* managed policy attachments.

[max\_session\_duration](#state_max_session_duration_python) int

Maximum session duration (in seconds) that you want to set for the specified role. If you do not specify a value for this setting, the default maximum of one hour is applied. This setting can have a value from 1 hour to 12 hours.

[name](#state_name_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Friendly name of the role. If omitted, the provider will assign a random, unique name. See [IAM Identifiers](https://docs.aws.amazon.com/IAM/latest/UserGuide/Using_Identifiers.html) for more information.

[name\_prefix](#state_name_prefix_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Creates a unique friendly name beginning with the specified prefix. Conflicts with `name`.

[path](#state_path_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Path to the role. See [IAM Identifiers](https://docs.aws.amazon.com/IAM/latest/UserGuide/Using_Identifiers.html) for more information.

[permissions\_boundary](#state_permissions_boundary_python) str

ARN of the policy that is used to set the permissions boundary for the role.

[tags](#state_tags_python) Mapping\[str, str\]

Key-value mapping of tags for the IAM role. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tags\_all](#state_tags_all_python) Mapping\[str, str\]

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[unique\_id](#state_unique_id_python) str

Stable and unique string identifying the role.

[arn](#state_arn_yaml) String

Amazon Resource Name (ARN) specifying the role.

[assumeRolePolicy](#state_assumerolepolicy_yaml) String | [Property Map](#policydocument)

Policy that grants an entity permission to assume the role.

> **NOTE:** The `assumeRolePolicy` is very similar to but slightly different than a standard IAM policy and cannot use an `aws.iam.Policy` resource. However, it *can* use an `aws.iam.getPolicyDocument` data source. See the example above of how this works.

The following arguments are optional:

[createDate](#state_createdate_yaml) String

Creation date of the IAM role.

[description](#state_description_yaml) String

Description of the role.

[forceDetachPolicies](#state_forcedetachpolicies_yaml) Boolean

Whether to force detaching any policies the role has before destroying it. Defaults to `false`.

[inlinePolicies](#state_inlinepolicies_yaml) [List<Property Map>](#roleinlinepolicy)

Configuration block defining an exclusive set of IAM inline policies associated with the IAM role. See below. If no blocks are configured, Pulumi will not manage any inline policies in this resource. Configuring one empty block (i.e., `inlinePolicy {}`) will cause Pulumi to remove *all* inline policies added out of band on `apply`.

[managedPolicyArns](#state_managedpolicyarns_yaml) List<String>

Set of exclusive IAM managed policy ARNs to attach to the IAM role. If this attribute is not configured, Pulumi will ignore policy attachments to this resource. When configured, Pulumi will align the role's managed policy attachments with this set by attaching or detaching managed policies. Configuring an empty set (i.e., `managedPolicyArns = []`) will cause Pulumi to remove *all* managed policy attachments.

[maxSessionDuration](#state_maxsessionduration_yaml) Number

Maximum session duration (in seconds) that you want to set for the specified role. If you do not specify a value for this setting, the default maximum of one hour is applied. This setting can have a value from 1 hour to 12 hours.

[name](#state_name_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Friendly name of the role. If omitted, the provider will assign a random, unique name. See [IAM Identifiers](https://docs.aws.amazon.com/IAM/latest/UserGuide/Using_Identifiers.html) for more information.

[namePrefix](#state_nameprefix_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Creates a unique friendly name beginning with the specified prefix. Conflicts with `name`.

[path](#state_path_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Path to the role. See [IAM Identifiers](https://docs.aws.amazon.com/IAM/latest/UserGuide/Using_Identifiers.html) for more information.

[permissionsBoundary](#state_permissionsboundary_yaml) String

ARN of the policy that is used to set the permissions boundary for the role.

[tags](#state_tags_yaml) Map<String>

Key-value mapping of tags for the IAM role. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tagsAll](#state_tagsall_yaml) Map<String>

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[uniqueId](#state_uniqueid_yaml) String

Stable and unique string identifying the role.

## Supporting Types[](#supporting-types)

#### AWSPrincipal

, AWSPrincipalArgs

[](#awsprincipal)

When you use an AWS account identifier as the principal in a policy, the permissions in the policy statement can be granted to all identities contained in that account. This includes IAM users and roles in that account.

[AWS](#aws_csharp) This property is required. string | List<string>

AWS account identifier or ARN.

[AWS](#aws_go) This property is required. string | \[\]string

AWS account identifier or ARN.

[aws](#aws_hcl) This property is required. string | list(string)

AWS account identifier or ARN.

[AWS](#aws_java) This property is required. String | List<String>

AWS account identifier or ARN.

[AWS](#aws_nodejs) This property is required. string | string\[\]

AWS account identifier or ARN.

[aws](#aws_python) This property is required. str | Sequence\[str\]

AWS account identifier or ARN.

[AWS](#aws_yaml) This property is required. String | List<String>

AWS account identifier or ARN.

#### FederatedPrincipal

, FederatedPrincipalArgs

[](#federatedprincipal)

Federated principal for identity providers.

[Federated](#federated_csharp) This property is required. string | List<string>

The federated principal identifier.

[Federated](#federated_go) This property is required. string | \[\]string

The federated principal identifier.

[federated](#federated_hcl) This property is required. string | list(string)

The federated principal identifier.

[Federated](#federated_java) This property is required. String | List<String>

The federated principal identifier.

[Federated](#federated_nodejs) This property is required. string | string\[\]

The federated principal identifier.

[federated](#federated_python) This property is required. str | Sequence\[str\]

The federated principal identifier.

[Federated](#federated_yaml) This property is required. String | List<String>

The federated principal identifier.

#### PolicyDocument

, PolicyDocumentArgs

[](#policydocument)

Represents an AWS IAM policy document that defines permissions for AWS resources and actions.

[Statement](#statement_csharp) This property is required. [List<PolicyStatement>](#policystatement)

[Version](#version_csharp) This property is required. [Pulumi.Aws.Iam.PolicyDocumentVersion](#policydocumentversion)

[Id](#id_csharp) string

[Statement](#statement_go) This property is required. [\[\]PolicyStatement](#policystatement)

[Version](#version_go) This property is required. [PolicyDocumentVersion](#policydocumentversion)

[Id](#id_go) string

[statement](#statement_hcl) This property is required. [list(object)](#policystatement)

[version](#version_hcl) This property is required. ["2012-10-17" | "2008-10-17"](#policydocumentversion)

[id](#id_hcl) string

[Statement](#statement_java) This property is required. [List<PolicyStatement>](#policystatement)

[Version](#version_java) This property is required. [PolicyDocumentVersion](#policydocumentversion)

[Id](#id_java) String

[Statement](#statement_nodejs) This property is required. [PolicyStatement\[\]](#policystatement)

[Version](#version_nodejs) This property is required. [PolicyDocumentVersion](#policydocumentversion)

[Id](#id_nodejs) string

[statement](#statement_python) This property is required. [Sequence\[PolicyStatement\]](#policystatement)

[version](#version_python) This property is required. [PolicyDocumentVersion](#policydocumentversion)

[id](#id_python) str

[Statement](#statement_yaml) This property is required. [List<Property Map>](#policystatement)

[Version](#version_yaml) This property is required. ["2012-10-17" | "2008-10-17"](#policydocumentversion)

[Id](#id_yaml) String

#### PolicyDocumentVersion

, PolicyDocumentVersionArgs

[](#policydocumentversion)

PolicyDocumentVersion\_2012\_10\_17

`2012-10-17`

PolicyDocumentVersion\_2008\_10\_17

`2008-10-17`

PolicyDocumentVersion\_2012\_10\_17

`2012-10-17`

PolicyDocumentVersion\_2008\_10\_17

`2008-10-17`

"2012-10-17"

`2012-10-17`

"2008-10-17"

`2008-10-17`

\_20121017

`2012-10-17`

\_20081017

`2008-10-17`

PolicyDocumentVersion\_2012\_10\_17

`2012-10-17`

PolicyDocumentVersion\_2008\_10\_17

`2008-10-17`

POLICY\_DOCUMENT\_VERSION\_2012\_10\_17

`2012-10-17`

POLICY\_DOCUMENT\_VERSION\_2008\_10\_17

`2008-10-17`

"2012-10-17"

`2012-10-17`

"2008-10-17"

`2008-10-17`

#### PolicyStatement

, PolicyStatementArgs

[](#policystatement)

The Statement element is the main element for a policy. This element is required. It can include multiple elements (see the subsequent sections in this page). The Statement element contains an array of individual statements.

[Effect](#effect_csharp) This property is required. [Pulumi.Aws.Iam.PolicyStatementEffect](#policystatementeffect)

Indicate whether the policy allows or denies access.

[Action](#action_csharp) string | List<string>

Include a list of actions that the policy allows or denies. Required (either Action or NotAction)

[Condition](#condition_csharp) Dictionary<string, object>

Specify the circumstances under which the policy grants permission.

[NotAction](#notaction_csharp) string | List<string>

Include a list of actions that are not covered by this policy. Required (either Action or NotAction)

[NotPrincipal](#notprincipal_csharp) string | [AWSPrincipal](#awsprincipal) | [ServicePrincipal](#serviceprincipal) | [FederatedPrincipal](#federatedprincipal)

Indicate the account, user, role, or federated user to which this policy does not apply.

[NotResource](#notresource_csharp) string | List<string>

A list of resources that are specifically excluded by this policy.

[Principal](#principal_csharp) string | [AWSPrincipal](#awsprincipal) | [ServicePrincipal](#serviceprincipal) | [FederatedPrincipal](#federatedprincipal)

Indicate the account, user, role, or federated user to which you would like to allow or deny access. If you are creating a policy to attach to a user or role, you cannot include this element. The principal is implied as that user or role.

[Resource](#resource_csharp) string | List<string>

A list of resources to which the actions apply.

[Sid](#sid_csharp) string

An optional statement ID to differentiate between your statements.

[Effect](#effect_go) This property is required. [PolicyStatementEffect](#policystatementeffect)

Indicate whether the policy allows or denies access.

[Action](#action_go) string | \[\]string

Include a list of actions that the policy allows or denies. Required (either Action or NotAction)

[Condition](#condition_go) map\[string\]interface{}

Specify the circumstances under which the policy grants permission.

[NotAction](#notaction_go) string | \[\]string

Include a list of actions that are not covered by this policy. Required (either Action or NotAction)

[NotPrincipal](#notprincipal_go) string | [AWSPrincipal](#awsprincipal) | [ServicePrincipal](#serviceprincipal) | [FederatedPrincipal](#federatedprincipal)

Indicate the account, user, role, or federated user to which this policy does not apply.

[NotResource](#notresource_go) string | \[\]string

A list of resources that are specifically excluded by this policy.

[Principal](#principal_go) string | [AWSPrincipal](#awsprincipal) | [ServicePrincipal](#serviceprincipal) | [FederatedPrincipal](#federatedprincipal)

Indicate the account, user, role, or federated user to which you would like to allow or deny access. If you are creating a policy to attach to a user or role, you cannot include this element. The principal is implied as that user or role.

[Resource](#resource_go) string | \[\]string

A list of resources to which the actions apply.

[Sid](#sid_go) string

An optional statement ID to differentiate between your statements.

[effect](#effect_hcl) This property is required. ["Allow" | "Deny"](#policystatementeffect)

Indicate whether the policy allows or denies access.

[action](#action_hcl) string | list(string)

Include a list of actions that the policy allows or denies. Required (either Action or NotAction)

[condition](#condition_hcl) map(any)

Specify the circumstances under which the policy grants permission.

[not\_action](#not_action_hcl) string | list(string)

Include a list of actions that are not covered by this policy. Required (either Action or NotAction)

[not\_principal](#not_principal_hcl) string | [object](#awsprincipal) | [object](#serviceprincipal) | [object](#federatedprincipal)

Indicate the account, user, role, or federated user to which this policy does not apply.

[not\_resource](#not_resource_hcl) string | list(string)

A list of resources that are specifically excluded by this policy.

[principal](#principal_hcl) string | [object](#awsprincipal) | [object](#serviceprincipal) | [object](#federatedprincipal)

Indicate the account, user, role, or federated user to which you would like to allow or deny access. If you are creating a policy to attach to a user or role, you cannot include this element. The principal is implied as that user or role.

[resource](#resource_hcl) string | list(string)

A list of resources to which the actions apply.

[sid](#sid_hcl) string

An optional statement ID to differentiate between your statements.

[Effect](#effect_java) This property is required. [PolicyStatementEffect](#policystatementeffect)

Indicate whether the policy allows or denies access.

[Action](#action_java) String | List<String>

Include a list of actions that the policy allows or denies. Required (either Action or NotAction)

[Condition](#condition_java) Map<String,Object>

Specify the circumstances under which the policy grants permission.

[NotAction](#notaction_java) String | List<String>

Include a list of actions that are not covered by this policy. Required (either Action or NotAction)

[NotPrincipal](#notprincipal_java) String | [AWSPrincipal](#awsprincipal) | [ServicePrincipal](#serviceprincipal) | [FederatedPrincipal](#federatedprincipal)

Indicate the account, user, role, or federated user to which this policy does not apply.

[NotResource](#notresource_java) String | List<String>

A list of resources that are specifically excluded by this policy.

[Principal](#principal_java) String | [AWSPrincipal](#awsprincipal) | [ServicePrincipal](#serviceprincipal) | [FederatedPrincipal](#federatedprincipal)

Indicate the account, user, role, or federated user to which you would like to allow or deny access. If you are creating a policy to attach to a user or role, you cannot include this element. The principal is implied as that user or role.

[Resource](#resource_java) String | List<String>

A list of resources to which the actions apply.

[Sid](#sid_java) String

An optional statement ID to differentiate between your statements.

[Effect](#effect_nodejs) This property is required. [PolicyStatementEffect](#policystatementeffect)

Indicate whether the policy allows or denies access.

[Action](#action_nodejs) string | string\[\]

Include a list of actions that the policy allows or denies. Required (either Action or NotAction)

[Condition](#condition_nodejs) {\[key: string\]: any}

Specify the circumstances under which the policy grants permission.

[NotAction](#notaction_nodejs) string | string\[\]

Include a list of actions that are not covered by this policy. Required (either Action or NotAction)

[NotPrincipal](#notprincipal_nodejs) string | [AWSPrincipal](#awsprincipal) | [ServicePrincipal](#serviceprincipal) | [FederatedPrincipal](#federatedprincipal)

Indicate the account, user, role, or federated user to which this policy does not apply.

[NotResource](#notresource_nodejs) string | string\[\]

A list of resources that are specifically excluded by this policy.

[Principal](#principal_nodejs) string | [AWSPrincipal](#awsprincipal) | [ServicePrincipal](#serviceprincipal) | [FederatedPrincipal](#federatedprincipal)

Indicate the account, user, role, or federated user to which you would like to allow or deny access. If you are creating a policy to attach to a user or role, you cannot include this element. The principal is implied as that user or role.

[Resource](#resource_nodejs) string | string\[\]

A list of resources to which the actions apply.

[Sid](#sid_nodejs) string

An optional statement ID to differentiate between your statements.

[effect](#effect_python) This property is required. [PolicyStatementEffect](#policystatementeffect)

Indicate whether the policy allows or denies access.

[action](#action_python) str | Sequence\[str\]

Include a list of actions that the policy allows or denies. Required (either Action or NotAction)

[condition](#condition_python) Mapping\[str, Any\]

Specify the circumstances under which the policy grants permission.

[not\_action](#not_action_python) str | Sequence\[str\]

Include a list of actions that are not covered by this policy. Required (either Action or NotAction)

[not\_principal](#not_principal_python) str | [AWSPrincipal](#awsprincipal) | [ServicePrincipal](#serviceprincipal) | [FederatedPrincipal](#federatedprincipal)

Indicate the account, user, role, or federated user to which this policy does not apply.

[not\_resource](#not_resource_python) str | Sequence\[str\]

A list of resources that are specifically excluded by this policy.

[principal](#principal_python) str | [AWSPrincipal](#awsprincipal) | [ServicePrincipal](#serviceprincipal) | [FederatedPrincipal](#federatedprincipal)

Indicate the account, user, role, or federated user to which you would like to allow or deny access. If you are creating a policy to attach to a user or role, you cannot include this element. The principal is implied as that user or role.

[resource](#resource_python) str | Sequence\[str\]

A list of resources to which the actions apply.

[sid](#sid_python) str

An optional statement ID to differentiate between your statements.

[Effect](#effect_yaml) This property is required. ["Allow" | "Deny"](#policystatementeffect)

Indicate whether the policy allows or denies access.

[Action](#action_yaml) String | List<String>

Include a list of actions that the policy allows or denies. Required (either Action or NotAction)

[Condition](#condition_yaml) Map<Any>

Specify the circumstances under which the policy grants permission.

[NotAction](#notaction_yaml) String | List<String>

Include a list of actions that are not covered by this policy. Required (either Action or NotAction)

[NotPrincipal](#notprincipal_yaml) String | [Property Map](#awsprincipal) | [Property Map](#serviceprincipal) | [Property Map](#federatedprincipal)

Indicate the account, user, role, or federated user to which this policy does not apply.

[NotResource](#notresource_yaml) String | List<String>

A list of resources that are specifically excluded by this policy.

[Principal](#principal_yaml) String | [Property Map](#awsprincipal) | [Property Map](#serviceprincipal) | [Property Map](#federatedprincipal)

Indicate the account, user, role, or federated user to which you would like to allow or deny access. If you are creating a policy to attach to a user or role, you cannot include this element. The principal is implied as that user or role.

[Resource](#resource_yaml) String | List<String>

A list of resources to which the actions apply.

[Sid](#sid_yaml) String

An optional statement ID to differentiate between your statements.

#### PolicyStatementEffect

, PolicyStatementEffectArgs

[](#policystatementeffect)

ALLOW

`Allow`

DENY

`Deny`

PolicyStatementEffectALLOW

`Allow`

PolicyStatementEffectDENY

`Deny`

"Allow"

`Allow`

"Deny"

`Deny`

ALLOW

`Allow`

DENY

`Deny`

ALLOW

`Allow`

DENY

`Deny`

ALLOW

`Allow`

DENY

`Deny`

"Allow"

`Allow`

"Deny"

`Deny`

#### RoleInlinePolicy

, RoleInlinePolicyArgs

[](#roleinlinepolicy)

[Name](#name_csharp) string

Name of the role policy.

[Policy](#policy_csharp) string

Policy document as a JSON formatted string.

[Name](#name_go) string

Name of the role policy.

[Policy](#policy_go) string

Policy document as a JSON formatted string.

[name](#name_hcl) string

Name of the role policy.

[policy](#policy_hcl) string

Policy document as a JSON formatted string.

[name](#name_java) String

Name of the role policy.

[policy](#policy_java) String

Policy document as a JSON formatted string.

[name](#name_nodejs) string

Name of the role policy.

[policy](#policy_nodejs) string

Policy document as a JSON formatted string.

[name](#name_python) str

Name of the role policy.

[policy](#policy_python) str

Policy document as a JSON formatted string.

[name](#name_yaml) String

Name of the role policy.

[policy](#policy_yaml) String

Policy document as a JSON formatted string.

#### ServicePrincipal

, ServicePrincipalArgs

[](#serviceprincipal)

IAM roles that can be assumed by an AWS service are called service roles. Service roles must include a trust policy. A service principal is an identifier that is used to grant permissions to a service.

[Service](#service_csharp) This property is required. string | List<string>

The service principal identifier.

[Service](#service_go) This property is required. string | \[\]string

The service principal identifier.

[service](#service_hcl) This property is required. string | list(string)

The service principal identifier.

[Service](#service_java) This property is required. String | List<String>

The service principal identifier.

[Service](#service_nodejs) This property is required. string | string\[\]

The service principal identifier.

[service](#service_python) This property is required. str | Sequence\[str\]

The service principal identifier.

[Service](#service_yaml) This property is required. String | List<String>

The service principal identifier.

## Import[](#import)

### Identity Schema[](#identity-schema)

#### Required[](#required)

-   `name` (String) Name of the IAM role.

#### Optional[](#optional)

-   `accountId` (String) AWS Account where this resource is managed.

Using `pulumi import`, import IAM Roles using the `name`. For example:

```bash
$ pulumi import aws:iam/role:Role example developer_name
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

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2fiam%2frole]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2fiam%2frole%2f\))

#### Try Pulumi Cloud free.
Your team will thank you.

[Start free trial](https://app.pulumi.com/signup?utm_source=registry&utm_medium=right-rail-banner&utm_campaign=try-pulumi-cloud&iaid=docs-try-pulumi-cloud-ad)
