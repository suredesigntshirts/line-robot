---
Source: https://www.pulumi.com/registry/packages/aws/api-docs/iam/rolepolicyattachment/
Generated: 2026-06-06
Updated: 2026-06-06
---

# aws.iam.RolePolicyAttachment

1.  [Packages](/registry/)
2.  [Packages](/registry/packages/)
3.  [AWS](/registry/packages/aws/)
4.  [API Docs](/registry/packages/aws/api-docs/)
5.  [iam](/registry/packages/aws/api-docs/iam/)
6.  [RolePolicyAttachment](/registry/packages/aws/api-docs/iam/rolepolicyattachment/)

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

Viewing docs for AWS v7.32.0
published on Friday, May 29, 2026 by Pulumi

[Schema (JSON)](/registry/packages/aws/schema.json)

[pulumi/pulumi-aws](https://github.com/pulumi/pulumi-aws)

v7.32.0 (7.x, latest)v6.83.1 (6.x)v5.43.0 (5.x)

# aws.iam.RolePolicyAttachment[](#aws-iam-rolepolicyattachment)

Explore with Neo

-   Copy Page

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2fiam%2frolepolicyattachment]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2fiam%2frolepolicyattachment%2f\))

Attaches a Managed IAM Policy to an IAM role

> **NOTE:** The usage of this resource conflicts with the `aws.iam.PolicyAttachment` resource and will permanently show a difference if both are defined.

> **NOTE:** For a given role, this resource is incompatible with using the `aws.iam.Role` resource `managedPolicyArns` argument. When using that argument and this resource, both will attempt to manage the role’s managed policy attachments and Pulumi will show a permanent difference.

## Example Usage[](#example-usage)

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

const assumeRole = aws.iam.getPolicyDocument({
    statements: [{
        effect: "Allow",
        principals: [{
            type: "Service",
            identifiers: ["ec2.amazonaws.com"],
        }],
        actions: ["sts:AssumeRole"],
    }],
});
const role = new aws.iam.Role("role", {
    name: "test-role",
    assumeRolePolicy: assumeRole.then(assumeRole => assumeRole.json),
});
const policy = aws.iam.getPolicyDocument({
    statements: [{
        effect: "Allow",
        actions: ["ec2:Describe*"],
        resources: ["*"],
    }],
});
const policyPolicy = new aws.iam.Policy("policy", {
    name: "test-policy",
    description: "A test policy",
    policy: policy.then(policy => policy.json),
});
const test_attach = new aws.iam.RolePolicyAttachment("test-attach", {
    role: role.name,
    policyArn: policyPolicy.arn,
});
```

```python
import pulumi
import pulumi_aws as aws

assume_role = aws.iam.get_policy_document(statements=[{
    "effect": "Allow",
    "principals": [{
        "type": "Service",
        "identifiers": ["ec2.amazonaws.com"],
    }],
    "actions": ["sts:AssumeRole"],
}])
role = aws.iam.Role("role",
    name="test-role",
    assume_role_policy=assume_role.json)
policy = aws.iam.get_policy_document(statements=[{
    "effect": "Allow",
    "actions": ["ec2:Describe*"],
    "resources": ["*"],
}])
policy_policy = aws.iam.Policy("policy",
    name="test-policy",
    description="A test policy",
    policy=policy.json)
test_attach = aws.iam.RolePolicyAttachment("test-attach",
    role=role.name,
    policy_arn=policy_policy.arn)
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/iam"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		assumeRole, err := iam.GetPolicyDocument(ctx, &iam.GetPolicyDocumentArgs{
			Statements: []iam.GetPolicyDocumentStatement{
				{
					Effect: pulumi.StringRef("Allow"),
					Principals: []iam.GetPolicyDocumentStatementPrincipal{
						{
							Type: "Service",
							Identifiers: []string{
								"ec2.amazonaws.com",
							},
						},
					},
					Actions: []string{
						"sts:AssumeRole",
					},
				},
			},
		}, nil)
		if err != nil {
			return err
		}
		role, err := iam.NewRole(ctx, "role", &iam.RoleArgs{
			Name:             pulumi.String("test-role"),
			AssumeRolePolicy: pulumi.String(pulumi.String(assumeRole.Json)),
		})
		if err != nil {
			return err
		}
		policy, err := iam.GetPolicyDocument(ctx, &iam.GetPolicyDocumentArgs{
			Statements: []iam.GetPolicyDocumentStatement{
				{
					Effect: pulumi.StringRef("Allow"),
					Actions: []string{
						"ec2:Describe*",
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
		policyPolicy, err := iam.NewPolicy(ctx, "policy", &iam.PolicyArgs{
			Name:        pulumi.String("test-policy"),
			Description: pulumi.String("A test policy"),
			Policy:      pulumi.String(pulumi.String(policy.Json)),
		})
		if err != nil {
			return err
		}
		_, err = iam.NewRolePolicyAttachment(ctx, "test-attach", &iam.RolePolicyAttachmentArgs{
			Role:      role.Name,
			PolicyArn: policyPolicy.Arn,
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
    var assumeRole = Aws.Iam.GetPolicyDocument.Invoke(new()
    {
        Statements = new[]
        {
            new Aws.Iam.Inputs.GetPolicyDocumentStatementInputArgs
            {
                Effect = "Allow",
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
                Actions = new[]
                {
                    "sts:AssumeRole",
                },
            },
        },
    });

    var role = new Aws.Iam.Role("role", new()
    {
        Name = "test-role",
        AssumeRolePolicy = assumeRole.Apply(getPolicyDocumentResult => getPolicyDocumentResult.Json),
    });

    var policy = Aws.Iam.GetPolicyDocument.Invoke(new()
    {
        Statements = new[]
        {
            new Aws.Iam.Inputs.GetPolicyDocumentStatementInputArgs
            {
                Effect = "Allow",
                Actions = new[]
                {
                    "ec2:Describe*",
                },
                Resources = new[]
                {
                    "*",
                },
            },
        },
    });

    var policyPolicy = new Aws.Iam.Policy("policy", new()
    {
        Name = "test-policy",
        Description = "A test policy",
        PolicyDocument = policy.Apply(getPolicyDocumentResult => getPolicyDocumentResult.Json),
    });

    var test_attach = new Aws.Iam.RolePolicyAttachment("test-attach", new()
    {
        Role = role.Name,
        PolicyArn = policyPolicy.Arn,
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
import com.pulumi.aws.iam.Policy;
import com.pulumi.aws.iam.PolicyArgs;
import com.pulumi.aws.iam.RolePolicyAttachment;
import com.pulumi.aws.iam.RolePolicyAttachmentArgs;
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
        final var assumeRole = IamFunctions.getPolicyDocument(GetPolicyDocumentArgs.builder()
            .statements(GetPolicyDocumentStatementArgs.builder()
                .effect("Allow")
                .principals(GetPolicyDocumentStatementPrincipalArgs.builder()
                    .type("Service")
                    .identifiers("ec2.amazonaws.com")
                    .build())
                .actions("sts:AssumeRole")
                .build())
            .build());

        var role = new Role("role", RoleArgs.builder()
            .name("test-role")
            .assumeRolePolicy(assumeRole.json())
            .build());

        final var policy = IamFunctions.getPolicyDocument(GetPolicyDocumentArgs.builder()
            .statements(GetPolicyDocumentStatementArgs.builder()
                .effect("Allow")
                .actions("ec2:Describe*")
                .resources("*")
                .build())
            .build());

        var policyPolicy = new Policy("policyPolicy", PolicyArgs.builder()
            .name("test-policy")
            .description("A test policy")
            .policy(policy.json())
            .build());

        var test_attach = new RolePolicyAttachment("test-attach", RolePolicyAttachmentArgs.builder()
            .role(role.name())
            .policyArn(policyPolicy.arn())
            .build());

    }
}
```

```yaml
resources:
  role:
    type: aws:iam:Role
    properties:
      name: test-role
      assumeRolePolicy: ${assumeRole.json}
  policyPolicy:
    type: aws:iam:Policy
    name: policy
    properties:
      name: test-policy
      description: A test policy
      policy: ${policy.json}
  test-attach:
    type: aws:iam:RolePolicyAttachment
    properties:
      role: ${role.name}
      policyArn: ${policyPolicy.arn}
variables:
  assumeRole:
    fn::invoke:
      function: aws:iam:getPolicyDocument
      arguments:
        statements:
          - effect: Allow
            principals:
              - type: Service
                identifiers:
                  - ec2.amazonaws.com
            actions:
              - sts:AssumeRole
  policy:
    fn::invoke:
      function: aws:iam:getPolicyDocument
      arguments:
        statements:
          - effect: Allow
            actions:
              - ec2:Describe*
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

data "aws_iam_getpolicydocument" "assumeRole" {
  statements {
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
    actions = ["sts:AssumeRole"]
  }
}
data "aws_iam_getpolicydocument" "policy" {
  statements {
    effect    = "Allow"
    actions   = ["ec2:Describe*"]
    resources = ["*"]
  }
}

resource "aws_iam_role" "role" {
  name               = "test-role"
  assume_role_policy = data.aws_iam_getpolicydocument.assumeRole.json
}
resource "aws_iam_policy" "policy" {
  name        = "test-policy"
  description = "A test policy"
  policy      = data.aws_iam_getpolicydocument.policy.json
}
resource "aws_iam_rolepolicyattachment" "test-attach" {
  role       = aws_iam_role.role.name
  policy_arn = aws_iam_policy.policy.arn
}
```

## Create RolePolicyAttachment Resource[](#create)

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
new RolePolicyAttachment(name: string, args: RolePolicyAttachmentArgs, opts?: CustomResourceOptions);
```

```python
@overload
def RolePolicyAttachment(resource_name: str,
                         args: RolePolicyAttachmentArgs,
                         opts: Optional[ResourceOptions] = None)

@overload
def RolePolicyAttachment(resource_name: str,
                         opts: Optional[ResourceOptions] = None,
                         policy_arn: Optional[str] = None,
                         role: Optional[str] = None)
```

```go
func NewRolePolicyAttachment(ctx *Context, name string, args RolePolicyAttachmentArgs, opts ...ResourceOption) (*RolePolicyAttachment, error)
```

```csharp
public RolePolicyAttachment(string name, RolePolicyAttachmentArgs args, CustomResourceOptions? opts = null)
```

```java
public RolePolicyAttachment(String name, RolePolicyAttachmentArgs args)
public RolePolicyAttachment(String name, RolePolicyAttachmentArgs args, CustomResourceOptions options)
```

```yaml
type: aws:iam:RolePolicyAttachment
properties: # The arguments to resource properties.
options: # Bag of options to control resource's behavior.
```

```hcl
resource "aws_iam_rolepolicyattachment" "name" {
    # resource properties
}
```

#### Parameters[](#parameters)

name This property is required. string

The unique name of the resource.

args This property is required. [RolePolicyAttachmentArgs](#inputs)

The arguments to resource properties.

opts [CustomResourceOptions](/docs/reference/pkg/nodejs/pulumi/pulumi/#CustomResourceOptions)

Bag of options to control resource's behavior.

resource\_name This property is required. str

The unique name of the resource.

args This property is required. [RolePolicyAttachmentArgs](#inputs)

The arguments to resource properties.

opts [ResourceOptions](/docs/reference/pkg/python/pulumi/#pulumi.ResourceOptions)

Bag of options to control resource's behavior.

ctx [Context](https://pkg.go.dev/github.com/pulumi/pulumi/sdk/v3/go/pulumi?tab=doc#Context)

Context object for the current deployment.

name This property is required. string

The unique name of the resource.

args This property is required. [RolePolicyAttachmentArgs](#inputs)

The arguments to resource properties.

opts [ResourceOption](https://pkg.go.dev/github.com/pulumi/pulumi/sdk/v3/go/pulumi?tab=doc#ResourceOption)

Bag of options to control resource's behavior.

name This property is required. string

The unique name of the resource.

args This property is required. [RolePolicyAttachmentArgs](#inputs)

The arguments to resource properties.

opts [CustomResourceOptions](/docs/reference/pkg/dotnet/Pulumi/Pulumi.CustomResourceOptions.html)

Bag of options to control resource's behavior.

name This property is required. String

The unique name of the resource.

args This property is required. [RolePolicyAttachmentArgs](#inputs)

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
var rolePolicyAttachmentResource = new Aws.Iam.RolePolicyAttachment("rolePolicyAttachmentResource", new()
{
    PolicyArn = "string",
    Role = "string",
});
```

```go
example, err := iam.NewRolePolicyAttachment(ctx, "rolePolicyAttachmentResource", &iam.RolePolicyAttachmentArgs{
	PolicyArn: pulumi.String("string"),
	Role:      pulumi.Any("string"),
})
```

```hcl
resource "aws_iam_rolepolicyattachment" "rolePolicyAttachmentResource" {
  policy_arn = "string"
  role       = "string"
}
```

```java
var rolePolicyAttachmentResource = new RolePolicyAttachment("rolePolicyAttachmentResource", RolePolicyAttachmentArgs.builder()
    .policyArn("string")
    .role("string")
    .build());
```

```python
role_policy_attachment_resource = aws.iam.RolePolicyAttachment("rolePolicyAttachmentResource",
    policy_arn="string",
    role="string")
```

```typescript
const rolePolicyAttachmentResource = new aws.iam.RolePolicyAttachment("rolePolicyAttachmentResource", {
    policyArn: "string",
    role: "string",
});
```

```yaml
type: aws:iam:RolePolicyAttachment
properties:
    policyArn: string
    role: string
```

## RolePolicyAttachment Resource Properties[](#properties)

To learn more about resource properties and how to use them, see [Inputs and Outputs](/docs/intro/concepts/inputs-outputs) in the Architecture and Concepts docs.

### Inputs[](#inputs)

In Python, inputs that are objects can be passed either as [argument classes or as dictionary literals](/docs/languages-sdks/python/#inputs-and-outputs).

The RolePolicyAttachment resource accepts the following [input](/docs/intro/concepts/inputs-outputs) properties:

[PolicyArn](#policyarn_csharp)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

The ARN of the policy you want to apply

[Role](#role_csharp)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string | string

The name of the IAM role to which the policy should be applied

[PolicyArn](#policyarn_go)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

The ARN of the policy you want to apply

[Role](#role_go)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string | string

The name of the IAM role to which the policy should be applied

[policy\_arn](#policy_arn_hcl)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

The ARN of the policy you want to apply

[role](#role_hcl)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string |

The name of the IAM role to which the policy should be applied

[policyArn](#policyarn_java)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

String

The ARN of the policy you want to apply

[role](#role_java)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

String | String

The name of the IAM role to which the policy should be applied

[policyArn](#policyarn_nodejs)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

The ARN of the policy you want to apply

[role](#role_nodejs)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string | Role

The name of the IAM role to which the policy should be applied

[policy\_arn](#policy_arn_python)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

str

The ARN of the policy you want to apply

[role](#role_python)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

str | str

The name of the IAM role to which the policy should be applied

[policyArn](#policyarn_yaml)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

String

The ARN of the policy you want to apply

[role](#role_yaml)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

String |

The name of the IAM role to which the policy should be applied

### Outputs[](#outputs)

All [input](#inputs) properties are implicitly available as output properties. Additionally, the RolePolicyAttachment resource produces the following output properties:

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

## Look up Existing RolePolicyAttachment Resource[](#look-up)

Get an existing RolePolicyAttachment resource’s state with the given name, ID, and optional extra properties used to qualify the lookup.

-   TypeScript
-   Python
-   Go
-   C#
-   Java
-   YAML
-   HCL PREVIEW

```typescript
public static get(name: string, id: Input<ID>, state?: RolePolicyAttachmentState, opts?: CustomResourceOptions): RolePolicyAttachment
```

```python
@staticmethod
def get(resource_name: str,
        id: str,
        opts: Optional[ResourceOptions] = None,
        policy_arn: Optional[str] = None,
        role: Optional[str] = None) -> RolePolicyAttachment
```

```go
func GetRolePolicyAttachment(ctx *Context, name string, id IDInput, state *RolePolicyAttachmentState, opts ...ResourceOption) (*RolePolicyAttachment, error)
```

```csharp
public static RolePolicyAttachment Get(string name, Input<string> id, RolePolicyAttachmentState? state, CustomResourceOptions? opts = null)
```

```java
public static RolePolicyAttachment get(String name, Output<String> id, RolePolicyAttachmentState state, CustomResourceOptions options)
```

```yaml
resources:  _:    type: aws:iam:RolePolicyAttachment    get:      id: ${id}
```

```hcl
import {
  to = aws_iam_rolepolicyattachment.example
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

[PolicyArn](#state_policyarn_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

The ARN of the policy you want to apply

[Role](#state_role_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string | string

The name of the IAM role to which the policy should be applied

[PolicyArn](#state_policyarn_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

The ARN of the policy you want to apply

[Role](#state_role_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string | string

The name of the IAM role to which the policy should be applied

[policy\_arn](#state_policy_arn_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

The ARN of the policy you want to apply

[role](#state_role_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string |

The name of the IAM role to which the policy should be applied

[policyArn](#state_policyarn_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

The ARN of the policy you want to apply

[role](#state_role_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String | String

The name of the IAM role to which the policy should be applied

[policyArn](#state_policyarn_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

The ARN of the policy you want to apply

[role](#state_role_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string | Role

The name of the IAM role to which the policy should be applied

[policy\_arn](#state_policy_arn_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

The ARN of the policy you want to apply

[role](#state_role_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str | str

The name of the IAM role to which the policy should be applied

[policyArn](#state_policyarn_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

The ARN of the policy you want to apply

[role](#state_role_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String |

The name of the IAM role to which the policy should be applied

## Import[](#import)

### Identity Schema[](#identity-schema)

#### Required[](#required)

-   `role` (String) Name of the IAM role.
-   `policyArn` (String) ARN of the IAM policy.

#### Optional[](#optional)

-   `accountId` (String) AWS Account where this resource is managed.

Using `pulumi import`, import IAM role policy attachments using the role name and policy arn separated by `/`. For example:

```bash
$ pulumi import aws:iam/rolePolicyAttachment:RolePolicyAttachment example test-role/arn:aws:iam::xxxxxxxxxxxx:policy/test-policy
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

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2fiam%2frolepolicyattachment]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2fiam%2frolepolicyattachment%2f\))

#### Try Pulumi Cloud free.
Your team will thank you.

[Start free trial](https://app.pulumi.com/signup?utm_source=registry&utm_medium=right-rail-banner&utm_campaign=try-pulumi-cloud&iaid=docs-try-pulumi-cloud-ad)
