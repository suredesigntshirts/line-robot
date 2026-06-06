---
Source: https://www.pulumi.com/registry/packages/aws/api-docs/iam/policy/
Generated: 2026-06-06
Updated: 2026-06-06
---

# aws.iam.Policy

1.  [Packages](/registry/)
2.  [Packages](/registry/packages/)
3.  [AWS](/registry/packages/aws/)
4.  [API Docs](/registry/packages/aws/api-docs/)
5.  [iam](/registry/packages/aws/api-docs/iam/)
6.  [Policy](/registry/packages/aws/api-docs/iam/policy/)

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

Viewing docs for AWS v7.32.0
published on Friday, May 29, 2026 by Pulumi

[Schema (JSON)](/registry/packages/aws/schema.json)

[pulumi/pulumi-aws](https://github.com/pulumi/pulumi-aws)

v7.32.0 (7.x, latest)v6.83.1 (6.x)v5.43.0 (5.x)

# aws.iam.Policy[](#aws-iam-policy)

Explore with Neo

-   Copy Page

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2fiam%2fpolicy]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2fiam%2fpolicy%2f\))

Provides an IAM policy.

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

const policy = new aws.iam.Policy("policy", {
    name: "test_policy",
    path: "/",
    description: "My test policy",
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

policy = aws.iam.Policy("policy",
    name="test_policy",
    path="/",
    description="My test policy",
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
		_, err = iam.NewPolicy(ctx, "policy", &iam.PolicyArgs{
			Name:        pulumi.String("test_policy"),
			Path:        pulumi.String("/"),
			Description: pulumi.String("My test policy"),
			Policy:      pulumi.String(pulumi.String(json0)),
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
    var policy = new Aws.Iam.Policy("policy", new()
    {
        Name = "test_policy",
        Path = "/",
        Description = "My test policy",
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

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.iam.Policy;
import com.pulumi.aws.iam.PolicyArgs;
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
        var policy = new Policy("policy", PolicyArgs.builder()
            .name("test_policy")
            .path("/")
            .description("My test policy")
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
  policy:
    type: aws:iam:Policy
    properties:
      name: test_policy
      path: /
      description: My test policy
      policy:
        fn::toJSON:
          Version: 2012-10-17
          Statement:
            - Action:
                - ec2:Describe*
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

resource "aws_iam_policy" "policy" {
  name        = "test_policy"
  path        = "/"
  description = "My test policy"
  policy = jsonencode({
    "Version" = "2012-10-17"
    "Statement" = [{
      "Action"   = ["ec2:Describe*"]
      "Effect"   = "Allow"
      "Resource" = "*"
    }]
  })
}
```

## Create Policy Resource[](#create)

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
new Policy(name: string, args: PolicyArgs, opts?: CustomResourceOptions);
```

```python
@overload
def Policy(resource_name: str,
           args: PolicyArgs,
           opts: Optional[ResourceOptions] = None)

@overload
def Policy(resource_name: str,
           opts: Optional[ResourceOptions] = None,
           policy: Optional[Union[str, PolicyDocumentArgs]] = None,
           delay_after_policy_creation_in_ms: Optional[int] = None,
           description: Optional[str] = None,
           name: Optional[str] = None,
           name_prefix: Optional[str] = None,
           path: Optional[str] = None,
           tags: Optional[Mapping[str, str]] = None)
```

```go
func NewPolicy(ctx *Context, name string, args PolicyArgs, opts ...ResourceOption) (*Policy, error)
```

```csharp
public Policy(string name, PolicyArgs args, CustomResourceOptions? opts = null)
```

```java
public Policy(String name, PolicyArgs args)
public Policy(String name, PolicyArgs args, CustomResourceOptions options)
```

```yaml
type: aws:iam:Policy
properties: # The arguments to resource properties.
options: # Bag of options to control resource's behavior.
```

```hcl
resource "aws_iam_policy" "name" {
    # resource properties
}
```

#### Parameters[](#parameters)

name This property is required. string

The unique name of the resource.

args This property is required. [PolicyArgs](#inputs)

The arguments to resource properties.

opts [CustomResourceOptions](/docs/reference/pkg/nodejs/pulumi/pulumi/#CustomResourceOptions)

Bag of options to control resource's behavior.

resource\_name This property is required. str

The unique name of the resource.

args This property is required. [PolicyArgs](#inputs)

The arguments to resource properties.

opts [ResourceOptions](/docs/reference/pkg/python/pulumi/#pulumi.ResourceOptions)

Bag of options to control resource's behavior.

ctx [Context](https://pkg.go.dev/github.com/pulumi/pulumi/sdk/v3/go/pulumi?tab=doc#Context)

Context object for the current deployment.

name This property is required. string

The unique name of the resource.

args This property is required. [PolicyArgs](#inputs)

The arguments to resource properties.

opts [ResourceOption](https://pkg.go.dev/github.com/pulumi/pulumi/sdk/v3/go/pulumi?tab=doc#ResourceOption)

Bag of options to control resource's behavior.

name This property is required. string

The unique name of the resource.

args This property is required. [PolicyArgs](#inputs)

The arguments to resource properties.

opts [CustomResourceOptions](/docs/reference/pkg/dotnet/Pulumi/Pulumi.CustomResourceOptions.html)

Bag of options to control resource's behavior.

name This property is required. String

The unique name of the resource.

args This property is required. [PolicyArgs](#inputs)

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
var examplepolicyResourceResourceFromIampolicy = new Aws.Iam.Policy("examplepolicyResourceResourceFromIampolicy", new()
{
    PolicyDocument = "string",
    DelayAfterPolicyCreationInMs = 0,
    Description = "string",
    Name = "string",
    NamePrefix = "string",
    Path = "string",
    Tags =
    {
        { "string", "string" },
    },
});
```

```go
example, err := iam.NewPolicy(ctx, "examplepolicyResourceResourceFromIampolicy", &iam.PolicyArgs{
	Policy:                       pulumi.Any("string"),
	DelayAfterPolicyCreationInMs: pulumi.Int(0),
	Description:                  pulumi.String("string"),
	Name:                         pulumi.String("string"),
	NamePrefix:                   pulumi.String("string"),
	Path:                         pulumi.String("string"),
	Tags: pulumi.StringMap{
		"string": pulumi.String("string"),
	},
})
```

```hcl
resource "aws_iam_policy" "examplepolicyResourceResourceFromIampolicy" {
  policy                            = "string"
  delay_after_policy_creation_in_ms = 0
  description                       = "string"
  name                              = "string"
  name_prefix                       = "string"
  path                              = "string"
  tags = {
    "string" = "string"
  }
}
```

```java
var examplepolicyResourceResourceFromIampolicy = new com.pulumi.aws.iam.Policy("examplepolicyResourceResourceFromIampolicy", com.pulumi.aws.iam.PolicyArgs.builder()
    .policy("string")
    .delayAfterPolicyCreationInMs(0)
    .description("string")
    .name("string")
    .namePrefix("string")
    .path("string")
    .tags(Map.of("string", "string"))
    .build());
```

```python
examplepolicy_resource_resource_from_iampolicy = aws.iam.Policy("examplepolicyResourceResourceFromIampolicy",
    policy="string",
    delay_after_policy_creation_in_ms=0,
    description="string",
    name="string",
    name_prefix="string",
    path="string",
    tags={
        "string": "string",
    })
```

```typescript
const examplepolicyResourceResourceFromIampolicy = new aws.iam.Policy("examplepolicyResourceResourceFromIampolicy", {
    policy: "string",
    delayAfterPolicyCreationInMs: 0,
    description: "string",
    name: "string",
    namePrefix: "string",
    path: "string",
    tags: {
        string: "string",
    },
});
```

```yaml
type: aws:iam:Policy
properties:
    delayAfterPolicyCreationInMs: 0
    description: string
    name: string
    namePrefix: string
    path: string
    policy: string
    tags:
        string: string
```

## Policy Resource Properties[](#properties)

To learn more about resource properties and how to use them, see [Inputs and Outputs](/docs/intro/concepts/inputs-outputs) in the Architecture and Concepts docs.

### Inputs[](#inputs)

In Python, inputs that are objects can be passed either as [argument classes or as dictionary literals](/docs/languages-sdks/python/#inputs-and-outputs).

The Policy resource accepts the following [input](/docs/intro/concepts/inputs-outputs) properties:

[PolicyDocument](#policydocument_csharp) This property is required. string | [PolicyDocument](#policydocument)

Policy document. This is a JSON formatted string. For more information about building AWS IAM policy documents, see the AWS IAM Policy Document Guide

[DelayAfterPolicyCreationInMs](#delayafterpolicycreationinms_csharp) int

Number of ms to wait between creating the policy and setting its version as default. May be required in environments with very high S3 IO loads.

[Description](#description_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Description of the IAM policy.

[Name](#name_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Name of the policy. If omitted, the provider will assign a random, unique name.

[NamePrefix](#nameprefix_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[Path](#path_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Path in which to create the policy. See [IAM Identifiers](https://docs.aws.amazon.com/IAM/latest/UserGuide/Using_Identifiers.html) for more information.

[Tags](#tags_csharp) Dictionary<string, string>

Map of resource tags for the IAM Policy. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[Policy](#policy_go) This property is required. string | [PolicyDocumentArgs](#policydocument)

Policy document. This is a JSON formatted string. For more information about building AWS IAM policy documents, see the AWS IAM Policy Document Guide

[DelayAfterPolicyCreationInMs](#delayafterpolicycreationinms_go) int

Number of ms to wait between creating the policy and setting its version as default. May be required in environments with very high S3 IO loads.

[Description](#description_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Description of the IAM policy.

[Name](#name_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Name of the policy. If omitted, the provider will assign a random, unique name.

[NamePrefix](#nameprefix_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[Path](#path_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Path in which to create the policy. See [IAM Identifiers](https://docs.aws.amazon.com/IAM/latest/UserGuide/Using_Identifiers.html) for more information.

[Tags](#tags_go) map\[string\]string

Map of resource tags for the IAM Policy. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[policy](#policy_hcl) This property is required. string | [object](#policydocument)

Policy document. This is a JSON formatted string. For more information about building AWS IAM policy documents, see the AWS IAM Policy Document Guide

[delay\_after\_policy\_creation\_in\_ms](#delay_after_policy_creation_in_ms_hcl) number

Number of ms to wait between creating the policy and setting its version as default. May be required in environments with very high S3 IO loads.

[description](#description_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Description of the IAM policy.

[name](#name_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Name of the policy. If omitted, the provider will assign a random, unique name.

[name\_prefix](#name_prefix_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[path](#path_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Path in which to create the policy. See [IAM Identifiers](https://docs.aws.amazon.com/IAM/latest/UserGuide/Using_Identifiers.html) for more information.

[tags](#tags_hcl) map(string)

Map of resource tags for the IAM Policy. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[policy](#policy_java) This property is required. String | [PolicyDocument](#policydocument)

Policy document. This is a JSON formatted string. For more information about building AWS IAM policy documents, see the AWS IAM Policy Document Guide

[delayAfterPolicyCreationInMs](#delayafterpolicycreationinms_java) Integer

Number of ms to wait between creating the policy and setting its version as default. May be required in environments with very high S3 IO loads.

[description](#description_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Description of the IAM policy.

[name](#name_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Name of the policy. If omitted, the provider will assign a random, unique name.

[namePrefix](#nameprefix_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[path](#path_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Path in which to create the policy. See [IAM Identifiers](https://docs.aws.amazon.com/IAM/latest/UserGuide/Using_Identifiers.html) for more information.

[tags](#tags_java) Map<String,String>

Map of resource tags for the IAM Policy. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[policy](#policy_nodejs) This property is required. string | [PolicyDocument](#policydocument)

Policy document. This is a JSON formatted string. For more information about building AWS IAM policy documents, see the AWS IAM Policy Document Guide

[delayAfterPolicyCreationInMs](#delayafterpolicycreationinms_nodejs) number

Number of ms to wait between creating the policy and setting its version as default. May be required in environments with very high S3 IO loads.

[description](#description_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Description of the IAM policy.

[name](#name_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Name of the policy. If omitted, the provider will assign a random, unique name.

[namePrefix](#nameprefix_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[path](#path_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Path in which to create the policy. See [IAM Identifiers](https://docs.aws.amazon.com/IAM/latest/UserGuide/Using_Identifiers.html) for more information.

[tags](#tags_nodejs) {\[key: string\]: string}

Map of resource tags for the IAM Policy. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[policy](#policy_python) This property is required. str | [PolicyDocumentArgs](#policydocument)

Policy document. This is a JSON formatted string. For more information about building AWS IAM policy documents, see the AWS IAM Policy Document Guide

[delay\_after\_policy\_creation\_in\_ms](#delay_after_policy_creation_in_ms_python) int

Number of ms to wait between creating the policy and setting its version as default. May be required in environments with very high S3 IO loads.

[description](#description_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Description of the IAM policy.

[name](#name_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Name of the policy. If omitted, the provider will assign a random, unique name.

[name\_prefix](#name_prefix_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[path](#path_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Path in which to create the policy. See [IAM Identifiers](https://docs.aws.amazon.com/IAM/latest/UserGuide/Using_Identifiers.html) for more information.

[tags](#tags_python) Mapping\[str, str\]

Map of resource tags for the IAM Policy. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[policy](#policy_yaml) This property is required. String | [Property Map](#policydocument)

Policy document. This is a JSON formatted string. For more information about building AWS IAM policy documents, see the AWS IAM Policy Document Guide

[delayAfterPolicyCreationInMs](#delayafterpolicycreationinms_yaml) Number

Number of ms to wait between creating the policy and setting its version as default. May be required in environments with very high S3 IO loads.

[description](#description_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Description of the IAM policy.

[name](#name_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Name of the policy. If omitted, the provider will assign a random, unique name.

[namePrefix](#nameprefix_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[path](#path_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Path in which to create the policy. See [IAM Identifiers](https://docs.aws.amazon.com/IAM/latest/UserGuide/Using_Identifiers.html) for more information.

[tags](#tags_yaml) Map<String>

Map of resource tags for the IAM Policy. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

### Outputs[](#outputs)

All [input](#inputs) properties are implicitly available as output properties. Additionally, the Policy resource produces the following output properties:

[Arn](#arn_csharp) string

ARN assigned by AWS to this policy.

[AttachmentCount](#attachmentcount_csharp) int

Number of entities (users, groups, and roles) that the policy is attached to.

[Id](#id_csharp) string

The provider-assigned unique ID for this managed resource.

[PolicyId](#policyid_csharp) string

Policy's ID.

[TagsAll](#tagsall_csharp) Dictionary<string, string>

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[Arn](#arn_go) string

ARN assigned by AWS to this policy.

[AttachmentCount](#attachmentcount_go) int

Number of entities (users, groups, and roles) that the policy is attached to.

[Id](#id_go) string

The provider-assigned unique ID for this managed resource.

[PolicyId](#policyid_go) string

Policy's ID.

[TagsAll](#tagsall_go) map\[string\]string

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[arn](#arn_hcl) string

ARN assigned by AWS to this policy.

[attachment\_count](#attachment_count_hcl) number

Number of entities (users, groups, and roles) that the policy is attached to.

[id](#id_hcl) string

The provider-assigned unique ID for this managed resource.

[policy\_id](#policy_id_hcl) string

Policy's ID.

[tags\_all](#tags_all_hcl) map(string)

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[arn](#arn_java) String

ARN assigned by AWS to this policy.

[attachmentCount](#attachmentcount_java) Integer

Number of entities (users, groups, and roles) that the policy is attached to.

[id](#id_java) String

The provider-assigned unique ID for this managed resource.

[policyId](#policyid_java) String

Policy's ID.

[tagsAll](#tagsall_java) Map<String,String>

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[arn](#arn_nodejs) string

ARN assigned by AWS to this policy.

[attachmentCount](#attachmentcount_nodejs) number

Number of entities (users, groups, and roles) that the policy is attached to.

[id](#id_nodejs) string

The provider-assigned unique ID for this managed resource.

[policyId](#policyid_nodejs) string

Policy's ID.

[tagsAll](#tagsall_nodejs) {\[key: string\]: string}

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[arn](#arn_python) str

ARN assigned by AWS to this policy.

[attachment\_count](#attachment_count_python) int

Number of entities (users, groups, and roles) that the policy is attached to.

[id](#id_python) str

The provider-assigned unique ID for this managed resource.

[policy\_id](#policy_id_python) str

Policy's ID.

[tags\_all](#tags_all_python) Mapping\[str, str\]

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[arn](#arn_yaml) String

ARN assigned by AWS to this policy.

[attachmentCount](#attachmentcount_yaml) Number

Number of entities (users, groups, and roles) that the policy is attached to.

[id](#id_yaml) String

The provider-assigned unique ID for this managed resource.

[policyId](#policyid_yaml) String

Policy's ID.

[tagsAll](#tagsall_yaml) Map<String>

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

## Look up Existing Policy Resource[](#look-up)

Get an existing Policy resource’s state with the given name, ID, and optional extra properties used to qualify the lookup.

-   TypeScript
-   Python
-   Go
-   C#
-   Java
-   YAML
-   HCL PREVIEW

```typescript
public static get(name: string, id: Input<ID>, state?: PolicyState, opts?: CustomResourceOptions): Policy
```

```python
@staticmethod
def get(resource_name: str,
        id: str,
        opts: Optional[ResourceOptions] = None,
        arn: Optional[str] = None,
        attachment_count: Optional[int] = None,
        delay_after_policy_creation_in_ms: Optional[int] = None,
        description: Optional[str] = None,
        name: Optional[str] = None,
        name_prefix: Optional[str] = None,
        path: Optional[str] = None,
        policy: Optional[Union[str, PolicyDocumentArgs]] = None,
        policy_id: Optional[str] = None,
        tags: Optional[Mapping[str, str]] = None,
        tags_all: Optional[Mapping[str, str]] = None) -> Policy
```

```go
func GetPolicy(ctx *Context, name string, id IDInput, state *PolicyState, opts ...ResourceOption) (*Policy, error)
```

```csharp
public static Policy Get(string name, Input<string> id, PolicyState? state, CustomResourceOptions? opts = null)
```

```java
public static Policy get(String name, Output<String> id, PolicyState state, CustomResourceOptions options)
```

```yaml
resources:  _:    type: aws:iam:Policy    get:      id: ${id}
```

```hcl
import {
  to = aws_iam_policy.example
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

ARN assigned by AWS to this policy.

[AttachmentCount](#state_attachmentcount_csharp) int

Number of entities (users, groups, and roles) that the policy is attached to.

[DelayAfterPolicyCreationInMs](#state_delayafterpolicycreationinms_csharp) int

Number of ms to wait between creating the policy and setting its version as default. May be required in environments with very high S3 IO loads.

[Description](#state_description_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Description of the IAM policy.

[Name](#state_name_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Name of the policy. If omitted, the provider will assign a random, unique name.

[NamePrefix](#state_nameprefix_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[Path](#state_path_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Path in which to create the policy. See [IAM Identifiers](https://docs.aws.amazon.com/IAM/latest/UserGuide/Using_Identifiers.html) for more information.

[PolicyDocument](#state_policydocument_csharp) string | [PolicyDocument](#policydocument)

Policy document. This is a JSON formatted string. For more information about building AWS IAM policy documents, see the AWS IAM Policy Document Guide

[PolicyId](#state_policyid_csharp) string

Policy's ID.

[Tags](#state_tags_csharp) Dictionary<string, string>

Map of resource tags for the IAM Policy. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[TagsAll](#state_tagsall_csharp) Dictionary<string, string>

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[Arn](#state_arn_go) string

ARN assigned by AWS to this policy.

[AttachmentCount](#state_attachmentcount_go) int

Number of entities (users, groups, and roles) that the policy is attached to.

[DelayAfterPolicyCreationInMs](#state_delayafterpolicycreationinms_go) int

Number of ms to wait between creating the policy and setting its version as default. May be required in environments with very high S3 IO loads.

[Description](#state_description_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Description of the IAM policy.

[Name](#state_name_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Name of the policy. If omitted, the provider will assign a random, unique name.

[NamePrefix](#state_nameprefix_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[Path](#state_path_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Path in which to create the policy. See [IAM Identifiers](https://docs.aws.amazon.com/IAM/latest/UserGuide/Using_Identifiers.html) for more information.

[Policy](#state_policy_go) string | [PolicyDocumentArgs](#policydocument)

Policy document. This is a JSON formatted string. For more information about building AWS IAM policy documents, see the AWS IAM Policy Document Guide

[PolicyId](#state_policyid_go) string

Policy's ID.

[Tags](#state_tags_go) map\[string\]string

Map of resource tags for the IAM Policy. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[TagsAll](#state_tagsall_go) map\[string\]string

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[arn](#state_arn_hcl) string

ARN assigned by AWS to this policy.

[attachment\_count](#state_attachment_count_hcl) number

Number of entities (users, groups, and roles) that the policy is attached to.

[delay\_after\_policy\_creation\_in\_ms](#state_delay_after_policy_creation_in_ms_hcl) number

Number of ms to wait between creating the policy and setting its version as default. May be required in environments with very high S3 IO loads.

[description](#state_description_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Description of the IAM policy.

[name](#state_name_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Name of the policy. If omitted, the provider will assign a random, unique name.

[name\_prefix](#state_name_prefix_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[path](#state_path_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Path in which to create the policy. See [IAM Identifiers](https://docs.aws.amazon.com/IAM/latest/UserGuide/Using_Identifiers.html) for more information.

[policy](#state_policy_hcl) string | [object](#policydocument)

Policy document. This is a JSON formatted string. For more information about building AWS IAM policy documents, see the AWS IAM Policy Document Guide

[policy\_id](#state_policy_id_hcl) string

Policy's ID.

[tags](#state_tags_hcl) map(string)

Map of resource tags for the IAM Policy. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tags\_all](#state_tags_all_hcl) map(string)

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[arn](#state_arn_java) String

ARN assigned by AWS to this policy.

[attachmentCount](#state_attachmentcount_java) Integer

Number of entities (users, groups, and roles) that the policy is attached to.

[delayAfterPolicyCreationInMs](#state_delayafterpolicycreationinms_java) Integer

Number of ms to wait between creating the policy and setting its version as default. May be required in environments with very high S3 IO loads.

[description](#state_description_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Description of the IAM policy.

[name](#state_name_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Name of the policy. If omitted, the provider will assign a random, unique name.

[namePrefix](#state_nameprefix_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[path](#state_path_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Path in which to create the policy. See [IAM Identifiers](https://docs.aws.amazon.com/IAM/latest/UserGuide/Using_Identifiers.html) for more information.

[policy](#state_policy_java) String | [PolicyDocument](#policydocument)

Policy document. This is a JSON formatted string. For more information about building AWS IAM policy documents, see the AWS IAM Policy Document Guide

[policyId](#state_policyid_java) String

Policy's ID.

[tags](#state_tags_java) Map<String,String>

Map of resource tags for the IAM Policy. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tagsAll](#state_tagsall_java) Map<String,String>

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[arn](#state_arn_nodejs) string

ARN assigned by AWS to this policy.

[attachmentCount](#state_attachmentcount_nodejs) number

Number of entities (users, groups, and roles) that the policy is attached to.

[delayAfterPolicyCreationInMs](#state_delayafterpolicycreationinms_nodejs) number

Number of ms to wait between creating the policy and setting its version as default. May be required in environments with very high S3 IO loads.

[description](#state_description_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Description of the IAM policy.

[name](#state_name_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Name of the policy. If omitted, the provider will assign a random, unique name.

[namePrefix](#state_nameprefix_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[path](#state_path_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Path in which to create the policy. See [IAM Identifiers](https://docs.aws.amazon.com/IAM/latest/UserGuide/Using_Identifiers.html) for more information.

[policy](#state_policy_nodejs) string | [PolicyDocument](#policydocument)

Policy document. This is a JSON formatted string. For more information about building AWS IAM policy documents, see the AWS IAM Policy Document Guide

[policyId](#state_policyid_nodejs) string

Policy's ID.

[tags](#state_tags_nodejs) {\[key: string\]: string}

Map of resource tags for the IAM Policy. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tagsAll](#state_tagsall_nodejs) {\[key: string\]: string}

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[arn](#state_arn_python) str

ARN assigned by AWS to this policy.

[attachment\_count](#state_attachment_count_python) int

Number of entities (users, groups, and roles) that the policy is attached to.

[delay\_after\_policy\_creation\_in\_ms](#state_delay_after_policy_creation_in_ms_python) int

Number of ms to wait between creating the policy and setting its version as default. May be required in environments with very high S3 IO loads.

[description](#state_description_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Description of the IAM policy.

[name](#state_name_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Name of the policy. If omitted, the provider will assign a random, unique name.

[name\_prefix](#state_name_prefix_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[path](#state_path_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Path in which to create the policy. See [IAM Identifiers](https://docs.aws.amazon.com/IAM/latest/UserGuide/Using_Identifiers.html) for more information.

[policy](#state_policy_python) str | [PolicyDocumentArgs](#policydocument)

Policy document. This is a JSON formatted string. For more information about building AWS IAM policy documents, see the AWS IAM Policy Document Guide

[policy\_id](#state_policy_id_python) str

Policy's ID.

[tags](#state_tags_python) Mapping\[str, str\]

Map of resource tags for the IAM Policy. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tags\_all](#state_tags_all_python) Mapping\[str, str\]

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[arn](#state_arn_yaml) String

ARN assigned by AWS to this policy.

[attachmentCount](#state_attachmentcount_yaml) Number

Number of entities (users, groups, and roles) that the policy is attached to.

[delayAfterPolicyCreationInMs](#state_delayafterpolicycreationinms_yaml) Number

Number of ms to wait between creating the policy and setting its version as default. May be required in environments with very high S3 IO loads.

[description](#state_description_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Description of the IAM policy.

[name](#state_name_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Name of the policy. If omitted, the provider will assign a random, unique name.

[namePrefix](#state_nameprefix_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[path](#state_path_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Path in which to create the policy. See [IAM Identifiers](https://docs.aws.amazon.com/IAM/latest/UserGuide/Using_Identifiers.html) for more information.

[policy](#state_policy_yaml) String | [Property Map](#policydocument)

Policy document. This is a JSON formatted string. For more information about building AWS IAM policy documents, see the AWS IAM Policy Document Guide

[policyId](#state_policyid_yaml) String

Policy's ID.

[tags](#state_tags_yaml) Map<String>

Map of resource tags for the IAM Policy. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tagsAll](#state_tagsall_yaml) Map<String>

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

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

-   `arn` (String) Amazon Resource Name (ARN) of the IAM policy.

Using `pulumi import`, import IAM Policies using the `arn`. For example:

```bash
$ pulumi import aws:iam/policy:Policy administrator arn:aws:iam::123456789012:policy/UsersManageOwnCredentials
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

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2fiam%2fpolicy]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2fiam%2fpolicy%2f\))

#### Try Pulumi Cloud free.
Your team will thank you.

[Start free trial](https://app.pulumi.com/signup?utm_source=registry&utm_medium=right-rail-banner&utm_campaign=try-pulumi-cloud&iaid=docs-try-pulumi-cloud-ad)
