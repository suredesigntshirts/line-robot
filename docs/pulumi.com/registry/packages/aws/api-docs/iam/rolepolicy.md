---
Source: https://www.pulumi.com/registry/packages/aws/api-docs/iam/rolepolicy/
Generated: 2026-06-06
Updated: 2026-06-06
---

# aws.iam.RolePolicy

1.  [Packages](/registry/)
2.  [Packages](/registry/packages/)
3.  [AWS](/registry/packages/aws/)
4.  [API Docs](/registry/packages/aws/api-docs/)
5.  [iam](/registry/packages/aws/api-docs/iam/)
6.  [RolePolicy](/registry/packages/aws/api-docs/iam/rolepolicy/)

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

Viewing docs for AWS v7.32.0
published on Friday, May 29, 2026 by Pulumi

[Schema (JSON)](/registry/packages/aws/schema.json)

[pulumi/pulumi-aws](https://github.com/pulumi/pulumi-aws)

v7.32.0 (7.x, latest)v6.83.1 (6.x)v5.43.0 (5.x)

# aws.iam.RolePolicy[](#aws-iam-rolepolicy)

Explore with Neo

-   Copy Page

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2fiam%2frolepolicy]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2fiam%2frolepolicy%2f\))

Provides an IAM role inline policy.

> **NOTE:** For a given role, this resource is incompatible with using the `aws.iam.Role` resource `inlinePolicy` argument. When using that argument and this resource, both will attempt to manage the role’s inline policies and the provider will show a permanent difference.

> **NOTE:** We suggest using explicit JSON encoding or `aws.iam.getPolicyDocument` when assigning a value to `policy`. They seamlessly translate configuration to JSON, enabling you to maintain consistency within your configuration without the need for context switches. Also, you can sidestep potential complications arising from formatting discrepancies, whitespace inconsistencies, and other nuances inherent to JSON.

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
});
const testPolicy = new aws.iam.RolePolicy("test_policy", {
    name: "test_policy",
    role: testRole.id,
    policy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [{
            Action: ["ec2:Describe*"],
            Effect: "Allow",
            Resource: "*",
        }],
    }),
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
    }))
test_policy = aws.iam.RolePolicy("test_policy",
    name="test_policy",
    role=test_role.id,
    policy=json.dumps({
        "Version": "2012-10-17",
        "Statement": [{
            "Action": ["ec2:Describe*"],
            "Effect": "Allow",
            "Resource": "*",
        }],
    }))
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
		testRole, err := iam.NewRole(ctx, "test_role", &iam.RoleArgs{
			Name:             pulumi.String("test_role"),
			AssumeRolePolicy: pulumi.String(pulumi.String(json0)),
		})
		if err != nil {
			return err
		}
		tmpJSON1, err := json.Marshal(map[string]interface{}{
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
		json1 := string(tmpJSON1)
		_, err = iam.NewRolePolicy(ctx, "test_policy", &iam.RolePolicyArgs{
			Name:   pulumi.String("test_policy"),
			Role:   testRole.ID(),
			Policy: pulumi.String(pulumi.String(json1)),
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
    });

    var testPolicy = new Aws.Iam.RolePolicy("test_policy", new()
    {
        Name = "test_policy",
        Role = testRole.Id,
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
import com.pulumi.aws.iam.RolePolicy;
import com.pulumi.aws.iam.RolePolicyArgs;
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
            .build());

        var testPolicy = new RolePolicy("testPolicy", RolePolicyArgs.builder()
            .name("test_policy")
            .role(testRole.id())
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

    }
}
```

```yaml
resources:
  testPolicy:
    type: aws:iam:RolePolicy
    name: test_policy
    properties:
      name: test_policy
      role: ${testRole.id}
      policy:
        fn::toJSON:
          Version: 2012-10-17
          Statement:
            - Action:
                - ec2:Describe*
              Effect: Allow
              Resource: '*'
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
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_iam_rolepolicy" "test_policy" {
  name = "test_policy"
  role = aws_iam_role.test_role.id
  policy = jsonencode({
    "Version" = "2012-10-17"
    "Statement" = [{
      "Action"   = ["ec2:Describe*"]
      "Effect"   = "Allow"
      "Resource" = "*"
    }]
  })
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
}
```

## Create RolePolicy Resource[](#create)

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
new RolePolicy(name: string, args: RolePolicyArgs, opts?: CustomResourceOptions);
```

```python
@overload
def RolePolicy(resource_name: str,
               args: RolePolicyArgs,
               opts: Optional[ResourceOptions] = None)

@overload
def RolePolicy(resource_name: str,
               opts: Optional[ResourceOptions] = None,
               policy: Optional[Union[str, PolicyDocumentArgs]] = None,
               role: Optional[str] = None,
               name: Optional[str] = None,
               name_prefix: Optional[str] = None)
```

```go
func NewRolePolicy(ctx *Context, name string, args RolePolicyArgs, opts ...ResourceOption) (*RolePolicy, error)
```

```csharp
public RolePolicy(string name, RolePolicyArgs args, CustomResourceOptions? opts = null)
```

```java
public RolePolicy(String name, RolePolicyArgs args)
public RolePolicy(String name, RolePolicyArgs args, CustomResourceOptions options)
```

```yaml
type: aws:iam:RolePolicy
properties: # The arguments to resource properties.
options: # Bag of options to control resource's behavior.
```

```hcl
resource "aws_iam_rolepolicy" "name" {
    # resource properties
}
```

#### Parameters[](#parameters)

name This property is required. string

The unique name of the resource.

args This property is required. [RolePolicyArgs](#inputs)

The arguments to resource properties.

opts [CustomResourceOptions](/docs/reference/pkg/nodejs/pulumi/pulumi/#CustomResourceOptions)

Bag of options to control resource's behavior.

resource\_name This property is required. str

The unique name of the resource.

args This property is required. [RolePolicyArgs](#inputs)

The arguments to resource properties.

opts [ResourceOptions](/docs/reference/pkg/python/pulumi/#pulumi.ResourceOptions)

Bag of options to control resource's behavior.

ctx [Context](https://pkg.go.dev/github.com/pulumi/pulumi/sdk/v3/go/pulumi?tab=doc#Context)

Context object for the current deployment.

name This property is required. string

The unique name of the resource.

args This property is required. [RolePolicyArgs](#inputs)

The arguments to resource properties.

opts [ResourceOption](https://pkg.go.dev/github.com/pulumi/pulumi/sdk/v3/go/pulumi?tab=doc#ResourceOption)

Bag of options to control resource's behavior.

name This property is required. string

The unique name of the resource.

args This property is required. [RolePolicyArgs](#inputs)

The arguments to resource properties.

opts [CustomResourceOptions](/docs/reference/pkg/dotnet/Pulumi/Pulumi.CustomResourceOptions.html)

Bag of options to control resource's behavior.

name This property is required. String

The unique name of the resource.

args This property is required. [RolePolicyArgs](#inputs)

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
var rolePolicyResource = new Aws.Iam.RolePolicy("rolePolicyResource", new()
{
    Policy = "string",
    Role = "string",
    Name = "string",
    NamePrefix = "string",
});
```

```go
example, err := iam.NewRolePolicy(ctx, "rolePolicyResource", &iam.RolePolicyArgs{
	Policy:     pulumi.Any("string"),
	Role:       pulumi.Any("string"),
	Name:       pulumi.String("string"),
	NamePrefix: pulumi.String("string"),
})
```

```hcl
resource "aws_iam_rolepolicy" "rolePolicyResource" {
  policy      = "string"
  role        = "string"
  name        = "string"
  name_prefix = "string"
}
```

```java
var rolePolicyResource = new RolePolicy("rolePolicyResource", RolePolicyArgs.builder()
    .policy("string")
    .role("string")
    .name("string")
    .namePrefix("string")
    .build());
```

```python
role_policy_resource = aws.iam.RolePolicy("rolePolicyResource",
    policy="string",
    role="string",
    name="string",
    name_prefix="string")
```

```typescript
const rolePolicyResource = new aws.iam.RolePolicy("rolePolicyResource", {
    policy: "string",
    role: "string",
    name: "string",
    namePrefix: "string",
});
```

```yaml
type: aws:iam:RolePolicy
properties:
    name: string
    namePrefix: string
    policy: string
    role: string
```

## RolePolicy Resource Properties[](#properties)

To learn more about resource properties and how to use them, see [Inputs and Outputs](/docs/intro/concepts/inputs-outputs) in the Architecture and Concepts docs.

### Inputs[](#inputs)

In Python, inputs that are objects can be passed either as [argument classes or as dictionary literals](/docs/languages-sdks/python/#inputs-and-outputs).

The RolePolicy resource accepts the following [input](/docs/intro/concepts/inputs-outputs) properties:

[Policy](#policy_csharp) This property is required. string | [PolicyDocument](#policydocument)

The inline policy document. This is a JSON formatted string. For more information about building IAM policy documents with Pulumi, see the AWS IAM Policy Document Guide

[Role](#role_csharp)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string | string

The name of the IAM role to attach to the policy.

[Name](#name_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

The name of the role policy. If omitted, the provider will assign a random, unique name.

[NamePrefix](#nameprefix_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[Policy](#policy_go) This property is required. string | [PolicyDocumentArgs](#policydocument)

The inline policy document. This is a JSON formatted string. For more information about building IAM policy documents with Pulumi, see the AWS IAM Policy Document Guide

[Role](#role_go)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string | string

The name of the IAM role to attach to the policy.

[Name](#name_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

The name of the role policy. If omitted, the provider will assign a random, unique name.

[NamePrefix](#nameprefix_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[policy](#policy_hcl) This property is required. string | [object](#policydocument)

The inline policy document. This is a JSON formatted string. For more information about building IAM policy documents with Pulumi, see the AWS IAM Policy Document Guide

[role](#role_hcl)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string |

The name of the IAM role to attach to the policy.

[name](#name_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

The name of the role policy. If omitted, the provider will assign a random, unique name.

[name\_prefix](#name_prefix_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[policy](#policy_java) This property is required. String | [PolicyDocument](#policydocument)

The inline policy document. This is a JSON formatted string. For more information about building IAM policy documents with Pulumi, see the AWS IAM Policy Document Guide

[role](#role_java)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

String | String

The name of the IAM role to attach to the policy.

[name](#name_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

The name of the role policy. If omitted, the provider will assign a random, unique name.

[namePrefix](#nameprefix_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[policy](#policy_nodejs) This property is required. string | [PolicyDocument](#policydocument)

The inline policy document. This is a JSON formatted string. For more information about building IAM policy documents with Pulumi, see the AWS IAM Policy Document Guide

[role](#role_nodejs)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string | Role

The name of the IAM role to attach to the policy.

[name](#name_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

The name of the role policy. If omitted, the provider will assign a random, unique name.

[namePrefix](#nameprefix_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[policy](#policy_python) This property is required. str | [PolicyDocumentArgs](#policydocument)

The inline policy document. This is a JSON formatted string. For more information about building IAM policy documents with Pulumi, see the AWS IAM Policy Document Guide

[role](#role_python)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

str | str

The name of the IAM role to attach to the policy.

[name](#name_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

The name of the role policy. If omitted, the provider will assign a random, unique name.

[name\_prefix](#name_prefix_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[policy](#policy_yaml) This property is required. String | [Property Map](#policydocument)

The inline policy document. This is a JSON formatted string. For more information about building IAM policy documents with Pulumi, see the AWS IAM Policy Document Guide

[role](#role_yaml)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

String |

The name of the IAM role to attach to the policy.

[name](#name_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

The name of the role policy. If omitted, the provider will assign a random, unique name.

[namePrefix](#nameprefix_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

### Outputs[](#outputs)

All [input](#inputs) properties are implicitly available as output properties. Additionally, the RolePolicy resource produces the following output properties:

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

## Look up Existing RolePolicy Resource[](#look-up)

Get an existing RolePolicy resource’s state with the given name, ID, and optional extra properties used to qualify the lookup.

-   TypeScript
-   Python
-   Go
-   C#
-   Java
-   YAML
-   HCL PREVIEW

```typescript
public static get(name: string, id: Input<ID>, state?: RolePolicyState, opts?: CustomResourceOptions): RolePolicy
```

```python
@staticmethod
def get(resource_name: str,
        id: str,
        opts: Optional[ResourceOptions] = None,
        name: Optional[str] = None,
        name_prefix: Optional[str] = None,
        policy: Optional[Union[str, PolicyDocumentArgs]] = None,
        role: Optional[str] = None) -> RolePolicy
```

```go
func GetRolePolicy(ctx *Context, name string, id IDInput, state *RolePolicyState, opts ...ResourceOption) (*RolePolicy, error)
```

```csharp
public static RolePolicy Get(string name, Input<string> id, RolePolicyState? state, CustomResourceOptions? opts = null)
```

```java
public static RolePolicy get(String name, Output<String> id, RolePolicyState state, CustomResourceOptions options)
```

```yaml
resources:  _:    type: aws:iam:RolePolicy    get:      id: ${id}
```

```hcl
import {
  to = aws_iam_rolepolicy.example
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

[Name](#state_name_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

The name of the role policy. If omitted, the provider will assign a random, unique name.

[NamePrefix](#state_nameprefix_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[Policy](#state_policy_csharp) string | [PolicyDocument](#policydocument)

The inline policy document. This is a JSON formatted string. For more information about building IAM policy documents with Pulumi, see the AWS IAM Policy Document Guide

[Role](#state_role_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string | string

The name of the IAM role to attach to the policy.

[Name](#state_name_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

The name of the role policy. If omitted, the provider will assign a random, unique name.

[NamePrefix](#state_nameprefix_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[Policy](#state_policy_go) string | [PolicyDocumentArgs](#policydocument)

The inline policy document. This is a JSON formatted string. For more information about building IAM policy documents with Pulumi, see the AWS IAM Policy Document Guide

[Role](#state_role_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string | string

The name of the IAM role to attach to the policy.

[name](#state_name_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

The name of the role policy. If omitted, the provider will assign a random, unique name.

[name\_prefix](#state_name_prefix_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[policy](#state_policy_hcl) string | [object](#policydocument)

The inline policy document. This is a JSON formatted string. For more information about building IAM policy documents with Pulumi, see the AWS IAM Policy Document Guide

[role](#state_role_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string |

The name of the IAM role to attach to the policy.

[name](#state_name_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

The name of the role policy. If omitted, the provider will assign a random, unique name.

[namePrefix](#state_nameprefix_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[policy](#state_policy_java) String | [PolicyDocument](#policydocument)

The inline policy document. This is a JSON formatted string. For more information about building IAM policy documents with Pulumi, see the AWS IAM Policy Document Guide

[role](#state_role_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String | String

The name of the IAM role to attach to the policy.

[name](#state_name_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

The name of the role policy. If omitted, the provider will assign a random, unique name.

[namePrefix](#state_nameprefix_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[policy](#state_policy_nodejs) string | [PolicyDocument](#policydocument)

The inline policy document. This is a JSON formatted string. For more information about building IAM policy documents with Pulumi, see the AWS IAM Policy Document Guide

[role](#state_role_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string | Role

The name of the IAM role to attach to the policy.

[name](#state_name_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

The name of the role policy. If omitted, the provider will assign a random, unique name.

[name\_prefix](#state_name_prefix_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[policy](#state_policy_python) str | [PolicyDocumentArgs](#policydocument)

The inline policy document. This is a JSON formatted string. For more information about building IAM policy documents with Pulumi, see the AWS IAM Policy Document Guide

[role](#state_role_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str | str

The name of the IAM role to attach to the policy.

[name](#state_name_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

The name of the role policy. If omitted, the provider will assign a random, unique name.

[namePrefix](#state_nameprefix_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[policy](#state_policy_yaml) String | [Property Map](#policydocument)

The inline policy document. This is a JSON formatted string. For more information about building IAM policy documents with Pulumi, see the AWS IAM Policy Document Guide

[role](#state_role_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String |

The name of the IAM role to attach to the policy.

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

-   `role` (String) Name of the IAM role.
-   `name` (String) Name of the role policy.

#### Optional[](#optional)

-   `accountId` (String) AWS Account where this resource is managed.

Using `pulumi import`, import IAM Role Policies using the `role_name:role_policy_name`. For example:

```bash
$ pulumi import aws:iam/rolePolicy:RolePolicy example role_of_mypolicy_name:mypolicy_name
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

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2fiam%2frolepolicy]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2fiam%2frolepolicy%2f\))

#### Try Pulumi Cloud free.
Your team will thank you.

[Start free trial](https://app.pulumi.com/signup?utm_source=registry&utm_medium=right-rail-banner&utm_campaign=try-pulumi-cloud&iaid=docs-try-pulumi-cloud-ad)
