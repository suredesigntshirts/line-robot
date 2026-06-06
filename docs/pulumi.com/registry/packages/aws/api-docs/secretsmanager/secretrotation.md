---
Source: https://www.pulumi.com/registry/packages/aws/api-docs/secretsmanager/secretrotation/
Generated: 2026-06-06
Updated: 2026-06-06
---

# aws.secretsmanager.SecretRotation

1.  [Packages](/registry/)
2.  [Packages](/registry/packages/)
3.  [AWS](/registry/packages/aws/)
4.  [API Docs](/registry/packages/aws/api-docs/)
5.  [secretsmanager](/registry/packages/aws/api-docs/secretsmanager/)
6.  [SecretRotation](/registry/packages/aws/api-docs/secretsmanager/secretrotation/)

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

Viewing docs for AWS v7.32.0
published on Friday, May 29, 2026 by Pulumi

[Schema (JSON)](/registry/packages/aws/schema.json)

[pulumi/pulumi-aws](https://github.com/pulumi/pulumi-aws)

v7.32.0 (7.x, latest)v6.83.1 (6.x)v5.43.0 (5.x)

# aws.secretsmanager.SecretRotation[](#aws-secretsmanager-secretrotation)

Explore with Neo

-   Copy Page

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2fsecretsmanager%2fsecretrotation]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2fsecretsmanager%2fsecretrotation%2f\))

Provides a resource to manage AWS Secrets Manager secret rotation. To manage a secret, see the `aws.secretsmanager.Secret` resource. To manage a secret value, see the `aws.secretsmanager.SecretVersion` resource.

## Example Usage[](#example-usage)

### Basic[](#basic)

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

const example = new aws.secretsmanager.SecretRotation("example", {
    secretId: exampleAwsSecretsmanagerSecret.id,
    rotationLambdaArn: exampleAwsLambdaFunction.arn,
    rotationRules: {
        automaticallyAfterDays: 30,
    },
});
```

```python
import pulumi
import pulumi_aws as aws

example = aws.secretsmanager.SecretRotation("example",
    secret_id=example_aws_secretsmanager_secret["id"],
    rotation_lambda_arn=example_aws_lambda_function["arn"],
    rotation_rules={
        "automatically_after_days": 30,
    })
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/secretsmanager"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		_, err := secretsmanager.NewSecretRotation(ctx, "example", &secretsmanager.SecretRotationArgs{
			SecretId:          pulumi.Any(exampleAwsSecretsmanagerSecret.Id),
			RotationLambdaArn: pulumi.Any(exampleAwsLambdaFunction.Arn),
			RotationRules: &secretsmanager.SecretRotationRotationRulesArgs{
				AutomaticallyAfterDays: pulumi.Int(30),
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
    var example = new Aws.SecretsManager.SecretRotation("example", new()
    {
        SecretId = exampleAwsSecretsmanagerSecret.Id,
        RotationLambdaArn = exampleAwsLambdaFunction.Arn,
        RotationRules = new Aws.SecretsManager.Inputs.SecretRotationRotationRulesArgs
        {
            AutomaticallyAfterDays = 30,
        },
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.secretsmanager.SecretRotation;
import com.pulumi.aws.secretsmanager.SecretRotationArgs;
import com.pulumi.aws.secretsmanager.inputs.SecretRotationRotationRulesArgs;
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
        var example = new SecretRotation("example", SecretRotationArgs.builder()
            .secretId(exampleAwsSecretsmanagerSecret.id())
            .rotationLambdaArn(exampleAwsLambdaFunction.arn())
            .rotationRules(SecretRotationRotationRulesArgs.builder()
                .automaticallyAfterDays(30)
                .build())
            .build());

    }
}
```

```yaml
resources:
  example:
    type: aws:secretsmanager:SecretRotation
    properties:
      secretId: ${exampleAwsSecretsmanagerSecret.id}
      rotationLambdaArn: ${exampleAwsLambdaFunction.arn}
      rotationRules:
        automaticallyAfterDays: 30
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_secretsmanager_secretrotation" "example" {
  secret_id           = exampleAwsSecretsmanagerSecret.id
  rotation_lambda_arn = exampleAwsLambdaFunction.arn
  rotation_rules = {
    automatically_after_days = 30
  }
}
```

### Rotation Configuration[](#rotation-configuration)

To enable automatic secret rotation, the Secrets Manager service requires usage of a Lambda function. The [Rotate Secrets section in the Secrets Manager User Guide](https://docs.aws.amazon.com/secretsmanager/latest/userguide/rotating-secrets.html) provides additional information about deploying a prebuilt Lambda functions for supported credential rotation (e.g., RDS) or deploying a custom Lambda function.

> **NOTE:** Configuring rotation causes the secret to rotate once as soon as you enable rotation. Before you do this, you must ensure that all of your applications that use the credentials stored in the secret are updated to retrieve the secret from AWS Secrets Manager. The old credentials might no longer be usable after the initial rotation and any applications that you fail to update will break as soon as the old credentials are no longer valid.

> **NOTE:** If you cancel a rotation that is in progress (by removing the `rotation` configuration), it can leave the VersionStage labels in an unexpected state. Depending on what step of the rotation was in progress, you might need to remove the staging label AWSPENDING from the partially created version, specified by the SecretVersionId response value. You should also evaluate the partially rotated new version to see if it should be deleted, which you can do by removing all staging labels from the new version’s VersionStage field.

## Create SecretRotation Resource[](#create)

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
new SecretRotation(name: string, args: SecretRotationArgs, opts?: CustomResourceOptions);
```

```python
@overload
def SecretRotation(resource_name: str,
                   args: SecretRotationArgs,
                   opts: Optional[ResourceOptions] = None)

@overload
def SecretRotation(resource_name: str,
                   opts: Optional[ResourceOptions] = None,
                   rotation_rules: Optional[SecretRotationRotationRulesArgs] = None,
                   secret_id: Optional[str] = None,
                   region: Optional[str] = None,
                   rotate_immediately: Optional[bool] = None,
                   rotation_lambda_arn: Optional[str] = None)
```

```go
func NewSecretRotation(ctx *Context, name string, args SecretRotationArgs, opts ...ResourceOption) (*SecretRotation, error)
```

```csharp
public SecretRotation(string name, SecretRotationArgs args, CustomResourceOptions? opts = null)
```

```java
public SecretRotation(String name, SecretRotationArgs args)
public SecretRotation(String name, SecretRotationArgs args, CustomResourceOptions options)
```

```yaml
type: aws:secretsmanager:SecretRotation
properties: # The arguments to resource properties.
options: # Bag of options to control resource's behavior.
```

```hcl
resource "aws_secretsmanager_secretrotation" "name" {
    # resource properties
}
```

#### Parameters[](#parameters)

name This property is required. string

The unique name of the resource.

args This property is required. [SecretRotationArgs](#inputs)

The arguments to resource properties.

opts [CustomResourceOptions](/docs/reference/pkg/nodejs/pulumi/pulumi/#CustomResourceOptions)

Bag of options to control resource's behavior.

resource\_name This property is required. str

The unique name of the resource.

args This property is required. [SecretRotationArgs](#inputs)

The arguments to resource properties.

opts [ResourceOptions](/docs/reference/pkg/python/pulumi/#pulumi.ResourceOptions)

Bag of options to control resource's behavior.

ctx [Context](https://pkg.go.dev/github.com/pulumi/pulumi/sdk/v3/go/pulumi?tab=doc#Context)

Context object for the current deployment.

name This property is required. string

The unique name of the resource.

args This property is required. [SecretRotationArgs](#inputs)

The arguments to resource properties.

opts [ResourceOption](https://pkg.go.dev/github.com/pulumi/pulumi/sdk/v3/go/pulumi?tab=doc#ResourceOption)

Bag of options to control resource's behavior.

name This property is required. string

The unique name of the resource.

args This property is required. [SecretRotationArgs](#inputs)

The arguments to resource properties.

opts [CustomResourceOptions](/docs/reference/pkg/dotnet/Pulumi/Pulumi.CustomResourceOptions.html)

Bag of options to control resource's behavior.

name This property is required. String

The unique name of the resource.

args This property is required. [SecretRotationArgs](#inputs)

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
var secretRotationResource = new Aws.SecretsManager.SecretRotation("secretRotationResource", new()
{
    RotationRules = new Aws.SecretsManager.Inputs.SecretRotationRotationRulesArgs
    {
        AutomaticallyAfterDays = 0,
        Duration = "string",
        ScheduleExpression = "string",
    },
    SecretId = "string",
    Region = "string",
    RotateImmediately = false,
    RotationLambdaArn = "string",
});
```

```go
example, err := secretsmanager.NewSecretRotation(ctx, "secretRotationResource", &secretsmanager.SecretRotationArgs{
	RotationRules: &secretsmanager.SecretRotationRotationRulesArgs{
		AutomaticallyAfterDays: pulumi.Int(0),
		Duration:               pulumi.String("string"),
		ScheduleExpression:     pulumi.String("string"),
	},
	SecretId:          pulumi.String("string"),
	Region:            pulumi.String("string"),
	RotateImmediately: pulumi.Bool(false),
	RotationLambdaArn: pulumi.String("string"),
})
```

```hcl
resource "aws_secretsmanager_secretrotation" "secretRotationResource" {
  rotation_rules = {
    automatically_after_days = 0
    duration                 = "string"
    schedule_expression      = "string"
  }
  secret_id           = "string"
  region              = "string"
  rotate_immediately  = false
  rotation_lambda_arn = "string"
}
```

```java
var secretRotationResource = new SecretRotation("secretRotationResource", SecretRotationArgs.builder()
    .rotationRules(SecretRotationRotationRulesArgs.builder()
        .automaticallyAfterDays(0)
        .duration("string")
        .scheduleExpression("string")
        .build())
    .secretId("string")
    .region("string")
    .rotateImmediately(false)
    .rotationLambdaArn("string")
    .build());
```

```python
secret_rotation_resource = aws.secretsmanager.SecretRotation("secretRotationResource",
    rotation_rules={
        "automatically_after_days": 0,
        "duration": "string",
        "schedule_expression": "string",
    },
    secret_id="string",
    region="string",
    rotate_immediately=False,
    rotation_lambda_arn="string")
```

```typescript
const secretRotationResource = new aws.secretsmanager.SecretRotation("secretRotationResource", {
    rotationRules: {
        automaticallyAfterDays: 0,
        duration: "string",
        scheduleExpression: "string",
    },
    secretId: "string",
    region: "string",
    rotateImmediately: false,
    rotationLambdaArn: "string",
});
```

```yaml
type: aws:secretsmanager:SecretRotation
properties:
    region: string
    rotateImmediately: false
    rotationLambdaArn: string
    rotationRules:
        automaticallyAfterDays: 0
        duration: string
        scheduleExpression: string
    secretId: string
```

## SecretRotation Resource Properties[](#properties)

To learn more about resource properties and how to use them, see [Inputs and Outputs](/docs/intro/concepts/inputs-outputs) in the Architecture and Concepts docs.

### Inputs[](#inputs)

In Python, inputs that are objects can be passed either as [argument classes or as dictionary literals](/docs/languages-sdks/python/#inputs-and-outputs).

The SecretRotation resource accepts the following [input](/docs/intro/concepts/inputs-outputs) properties:

[RotationRules](#rotationrules_csharp) This property is required. [SecretRotationRotationRules](#secretrotationrotationrules)

A structure that defines the rotation configuration for this secret. Defined below.

[SecretId](#secretid_csharp)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

Specifies the secret to which you want to add a new version. You can specify either the Amazon Resource Name (ARN) or the friendly name of the secret. The secret must already exist.

[Region](#region_csharp) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[RotateImmediately](#rotateimmediately_csharp) bool

Specifies whether to rotate the secret immediately or wait until the next scheduled rotation window. The rotation schedule is defined in `rotationRules`. For secrets that use a Lambda rotation function to rotate, if you don't immediately rotate the secret, Secrets Manager tests the rotation configuration by running the testSecret step (https://docs.aws.amazon.com/secretsmanager/latest/userguide/rotate-secrets\_how.html) of the Lambda rotation function. The test creates an AWSPENDING version of the secret and then removes it. Defaults to `true`.

[RotationLambdaArn](#rotationlambdaarn_csharp) string

Specifies the ARN of the Lambda function that can rotate the secret. Must be supplied if the secret is not managed by AWS.

[RotationRules](#rotationrules_go) This property is required. [SecretRotationRotationRulesArgs](#secretrotationrotationrules)

A structure that defines the rotation configuration for this secret. Defined below.

[SecretId](#secretid_go)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

Specifies the secret to which you want to add a new version. You can specify either the Amazon Resource Name (ARN) or the friendly name of the secret. The secret must already exist.

[Region](#region_go) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[RotateImmediately](#rotateimmediately_go) bool

Specifies whether to rotate the secret immediately or wait until the next scheduled rotation window. The rotation schedule is defined in `rotationRules`. For secrets that use a Lambda rotation function to rotate, if you don't immediately rotate the secret, Secrets Manager tests the rotation configuration by running the testSecret step (https://docs.aws.amazon.com/secretsmanager/latest/userguide/rotate-secrets\_how.html) of the Lambda rotation function. The test creates an AWSPENDING version of the secret and then removes it. Defaults to `true`.

[RotationLambdaArn](#rotationlambdaarn_go) string

Specifies the ARN of the Lambda function that can rotate the secret. Must be supplied if the secret is not managed by AWS.

[rotation\_rules](#rotation_rules_hcl) This property is required. [object](#secretrotationrotationrules)

A structure that defines the rotation configuration for this secret. Defined below.

[secret\_id](#secret_id_hcl)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

Specifies the secret to which you want to add a new version. You can specify either the Amazon Resource Name (ARN) or the friendly name of the secret. The secret must already exist.

[region](#region_hcl) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[rotate\_immediately](#rotate_immediately_hcl) bool

Specifies whether to rotate the secret immediately or wait until the next scheduled rotation window. The rotation schedule is defined in `rotationRules`. For secrets that use a Lambda rotation function to rotate, if you don't immediately rotate the secret, Secrets Manager tests the rotation configuration by running the testSecret step (https://docs.aws.amazon.com/secretsmanager/latest/userguide/rotate-secrets\_how.html) of the Lambda rotation function. The test creates an AWSPENDING version of the secret and then removes it. Defaults to `true`.

[rotation\_lambda\_arn](#rotation_lambda_arn_hcl) string

Specifies the ARN of the Lambda function that can rotate the secret. Must be supplied if the secret is not managed by AWS.

[rotationRules](#rotationrules_java) This property is required. [SecretRotationRotationRules](#secretrotationrotationrules)

A structure that defines the rotation configuration for this secret. Defined below.

[secretId](#secretid_java)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

String

Specifies the secret to which you want to add a new version. You can specify either the Amazon Resource Name (ARN) or the friendly name of the secret. The secret must already exist.

[region](#region_java) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[rotateImmediately](#rotateimmediately_java) Boolean

Specifies whether to rotate the secret immediately or wait until the next scheduled rotation window. The rotation schedule is defined in `rotationRules`. For secrets that use a Lambda rotation function to rotate, if you don't immediately rotate the secret, Secrets Manager tests the rotation configuration by running the testSecret step (https://docs.aws.amazon.com/secretsmanager/latest/userguide/rotate-secrets\_how.html) of the Lambda rotation function. The test creates an AWSPENDING version of the secret and then removes it. Defaults to `true`.

[rotationLambdaArn](#rotationlambdaarn_java) String

Specifies the ARN of the Lambda function that can rotate the secret. Must be supplied if the secret is not managed by AWS.

[rotationRules](#rotationrules_nodejs) This property is required. [SecretRotationRotationRules](#secretrotationrotationrules)

A structure that defines the rotation configuration for this secret. Defined below.

[secretId](#secretid_nodejs)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

Specifies the secret to which you want to add a new version. You can specify either the Amazon Resource Name (ARN) or the friendly name of the secret. The secret must already exist.

[region](#region_nodejs) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[rotateImmediately](#rotateimmediately_nodejs) boolean

Specifies whether to rotate the secret immediately or wait until the next scheduled rotation window. The rotation schedule is defined in `rotationRules`. For secrets that use a Lambda rotation function to rotate, if you don't immediately rotate the secret, Secrets Manager tests the rotation configuration by running the testSecret step (https://docs.aws.amazon.com/secretsmanager/latest/userguide/rotate-secrets\_how.html) of the Lambda rotation function. The test creates an AWSPENDING version of the secret and then removes it. Defaults to `true`.

[rotationLambdaArn](#rotationlambdaarn_nodejs) string

Specifies the ARN of the Lambda function that can rotate the secret. Must be supplied if the secret is not managed by AWS.

[rotation\_rules](#rotation_rules_python) This property is required. [SecretRotationRotationRulesArgs](#secretrotationrotationrules)

A structure that defines the rotation configuration for this secret. Defined below.

[secret\_id](#secret_id_python)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

str

Specifies the secret to which you want to add a new version. You can specify either the Amazon Resource Name (ARN) or the friendly name of the secret. The secret must already exist.

[region](#region_python) str

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[rotate\_immediately](#rotate_immediately_python) bool

Specifies whether to rotate the secret immediately or wait until the next scheduled rotation window. The rotation schedule is defined in `rotationRules`. For secrets that use a Lambda rotation function to rotate, if you don't immediately rotate the secret, Secrets Manager tests the rotation configuration by running the testSecret step (https://docs.aws.amazon.com/secretsmanager/latest/userguide/rotate-secrets\_how.html) of the Lambda rotation function. The test creates an AWSPENDING version of the secret and then removes it. Defaults to `true`.

[rotation\_lambda\_arn](#rotation_lambda_arn_python) str

Specifies the ARN of the Lambda function that can rotate the secret. Must be supplied if the secret is not managed by AWS.

[rotationRules](#rotationrules_yaml) This property is required. [Property Map](#secretrotationrotationrules)

A structure that defines the rotation configuration for this secret. Defined below.

[secretId](#secretid_yaml)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

String

Specifies the secret to which you want to add a new version. You can specify either the Amazon Resource Name (ARN) or the friendly name of the secret. The secret must already exist.

[region](#region_yaml) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[rotateImmediately](#rotateimmediately_yaml) Boolean

Specifies whether to rotate the secret immediately or wait until the next scheduled rotation window. The rotation schedule is defined in `rotationRules`. For secrets that use a Lambda rotation function to rotate, if you don't immediately rotate the secret, Secrets Manager tests the rotation configuration by running the testSecret step (https://docs.aws.amazon.com/secretsmanager/latest/userguide/rotate-secrets\_how.html) of the Lambda rotation function. The test creates an AWSPENDING version of the secret and then removes it. Defaults to `true`.

[rotationLambdaArn](#rotationlambdaarn_yaml) String

Specifies the ARN of the Lambda function that can rotate the secret. Must be supplied if the secret is not managed by AWS.

### Outputs[](#outputs)

All [input](#inputs) properties are implicitly available as output properties. Additionally, the SecretRotation resource produces the following output properties:

[Id](#id_csharp) string

The provider-assigned unique ID for this managed resource.

[RotationEnabled](#rotationenabled_csharp) bool

Specifies whether automatic rotation is enabled for this secret.

[Id](#id_go) string

The provider-assigned unique ID for this managed resource.

[RotationEnabled](#rotationenabled_go) bool

Specifies whether automatic rotation is enabled for this secret.

[id](#id_hcl) string

The provider-assigned unique ID for this managed resource.

[rotation\_enabled](#rotation_enabled_hcl) bool

Specifies whether automatic rotation is enabled for this secret.

[id](#id_java) String

The provider-assigned unique ID for this managed resource.

[rotationEnabled](#rotationenabled_java) Boolean

Specifies whether automatic rotation is enabled for this secret.

[id](#id_nodejs) string

The provider-assigned unique ID for this managed resource.

[rotationEnabled](#rotationenabled_nodejs) boolean

Specifies whether automatic rotation is enabled for this secret.

[id](#id_python) str

The provider-assigned unique ID for this managed resource.

[rotation\_enabled](#rotation_enabled_python) bool

Specifies whether automatic rotation is enabled for this secret.

[id](#id_yaml) String

The provider-assigned unique ID for this managed resource.

[rotationEnabled](#rotationenabled_yaml) Boolean

Specifies whether automatic rotation is enabled for this secret.

## Look up Existing SecretRotation Resource[](#look-up)

Get an existing SecretRotation resource’s state with the given name, ID, and optional extra properties used to qualify the lookup.

-   TypeScript
-   Python
-   Go
-   C#
-   Java
-   YAML
-   HCL PREVIEW

```typescript
public static get(name: string, id: Input<ID>, state?: SecretRotationState, opts?: CustomResourceOptions): SecretRotation
```

```python
@staticmethod
def get(resource_name: str,
        id: str,
        opts: Optional[ResourceOptions] = None,
        region: Optional[str] = None,
        rotate_immediately: Optional[bool] = None,
        rotation_enabled: Optional[bool] = None,
        rotation_lambda_arn: Optional[str] = None,
        rotation_rules: Optional[SecretRotationRotationRulesArgs] = None,
        secret_id: Optional[str] = None) -> SecretRotation
```

```go
func GetSecretRotation(ctx *Context, name string, id IDInput, state *SecretRotationState, opts ...ResourceOption) (*SecretRotation, error)
```

```csharp
public static SecretRotation Get(string name, Input<string> id, SecretRotationState? state, CustomResourceOptions? opts = null)
```

```java
public static SecretRotation get(String name, Output<String> id, SecretRotationState state, CustomResourceOptions options)
```

```yaml
resources:  _:    type: aws:secretsmanager:SecretRotation    get:      id: ${id}
```

```hcl
import {
  to = aws_secretsmanager_secretrotation.example
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

[Region](#state_region_csharp) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[RotateImmediately](#state_rotateimmediately_csharp) bool

Specifies whether to rotate the secret immediately or wait until the next scheduled rotation window. The rotation schedule is defined in `rotationRules`. For secrets that use a Lambda rotation function to rotate, if you don't immediately rotate the secret, Secrets Manager tests the rotation configuration by running the testSecret step (https://docs.aws.amazon.com/secretsmanager/latest/userguide/rotate-secrets\_how.html) of the Lambda rotation function. The test creates an AWSPENDING version of the secret and then removes it. Defaults to `true`.

[RotationEnabled](#state_rotationenabled_csharp) bool

Specifies whether automatic rotation is enabled for this secret.

[RotationLambdaArn](#state_rotationlambdaarn_csharp) string

Specifies the ARN of the Lambda function that can rotate the secret. Must be supplied if the secret is not managed by AWS.

[RotationRules](#state_rotationrules_csharp) [SecretRotationRotationRules](#secretrotationrotationrules)

A structure that defines the rotation configuration for this secret. Defined below.

[SecretId](#state_secretid_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Specifies the secret to which you want to add a new version. You can specify either the Amazon Resource Name (ARN) or the friendly name of the secret. The secret must already exist.

[Region](#state_region_go) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[RotateImmediately](#state_rotateimmediately_go) bool

Specifies whether to rotate the secret immediately or wait until the next scheduled rotation window. The rotation schedule is defined in `rotationRules`. For secrets that use a Lambda rotation function to rotate, if you don't immediately rotate the secret, Secrets Manager tests the rotation configuration by running the testSecret step (https://docs.aws.amazon.com/secretsmanager/latest/userguide/rotate-secrets\_how.html) of the Lambda rotation function. The test creates an AWSPENDING version of the secret and then removes it. Defaults to `true`.

[RotationEnabled](#state_rotationenabled_go) bool

Specifies whether automatic rotation is enabled for this secret.

[RotationLambdaArn](#state_rotationlambdaarn_go) string

Specifies the ARN of the Lambda function that can rotate the secret. Must be supplied if the secret is not managed by AWS.

[RotationRules](#state_rotationrules_go) [SecretRotationRotationRulesArgs](#secretrotationrotationrules)

A structure that defines the rotation configuration for this secret. Defined below.

[SecretId](#state_secretid_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Specifies the secret to which you want to add a new version. You can specify either the Amazon Resource Name (ARN) or the friendly name of the secret. The secret must already exist.

[region](#state_region_hcl) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[rotate\_immediately](#state_rotate_immediately_hcl) bool

Specifies whether to rotate the secret immediately or wait until the next scheduled rotation window. The rotation schedule is defined in `rotationRules`. For secrets that use a Lambda rotation function to rotate, if you don't immediately rotate the secret, Secrets Manager tests the rotation configuration by running the testSecret step (https://docs.aws.amazon.com/secretsmanager/latest/userguide/rotate-secrets\_how.html) of the Lambda rotation function. The test creates an AWSPENDING version of the secret and then removes it. Defaults to `true`.

[rotation\_enabled](#state_rotation_enabled_hcl) bool

Specifies whether automatic rotation is enabled for this secret.

[rotation\_lambda\_arn](#state_rotation_lambda_arn_hcl) string

Specifies the ARN of the Lambda function that can rotate the secret. Must be supplied if the secret is not managed by AWS.

[rotation\_rules](#state_rotation_rules_hcl) [object](#secretrotationrotationrules)

A structure that defines the rotation configuration for this secret. Defined below.

[secret\_id](#state_secret_id_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Specifies the secret to which you want to add a new version. You can specify either the Amazon Resource Name (ARN) or the friendly name of the secret. The secret must already exist.

[region](#state_region_java) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[rotateImmediately](#state_rotateimmediately_java) Boolean

Specifies whether to rotate the secret immediately or wait until the next scheduled rotation window. The rotation schedule is defined in `rotationRules`. For secrets that use a Lambda rotation function to rotate, if you don't immediately rotate the secret, Secrets Manager tests the rotation configuration by running the testSecret step (https://docs.aws.amazon.com/secretsmanager/latest/userguide/rotate-secrets\_how.html) of the Lambda rotation function. The test creates an AWSPENDING version of the secret and then removes it. Defaults to `true`.

[rotationEnabled](#state_rotationenabled_java) Boolean

Specifies whether automatic rotation is enabled for this secret.

[rotationLambdaArn](#state_rotationlambdaarn_java) String

Specifies the ARN of the Lambda function that can rotate the secret. Must be supplied if the secret is not managed by AWS.

[rotationRules](#state_rotationrules_java) [SecretRotationRotationRules](#secretrotationrotationrules)

A structure that defines the rotation configuration for this secret. Defined below.

[secretId](#state_secretid_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Specifies the secret to which you want to add a new version. You can specify either the Amazon Resource Name (ARN) or the friendly name of the secret. The secret must already exist.

[region](#state_region_nodejs) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[rotateImmediately](#state_rotateimmediately_nodejs) boolean

Specifies whether to rotate the secret immediately or wait until the next scheduled rotation window. The rotation schedule is defined in `rotationRules`. For secrets that use a Lambda rotation function to rotate, if you don't immediately rotate the secret, Secrets Manager tests the rotation configuration by running the testSecret step (https://docs.aws.amazon.com/secretsmanager/latest/userguide/rotate-secrets\_how.html) of the Lambda rotation function. The test creates an AWSPENDING version of the secret and then removes it. Defaults to `true`.

[rotationEnabled](#state_rotationenabled_nodejs) boolean

Specifies whether automatic rotation is enabled for this secret.

[rotationLambdaArn](#state_rotationlambdaarn_nodejs) string

Specifies the ARN of the Lambda function that can rotate the secret. Must be supplied if the secret is not managed by AWS.

[rotationRules](#state_rotationrules_nodejs) [SecretRotationRotationRules](#secretrotationrotationrules)

A structure that defines the rotation configuration for this secret. Defined below.

[secretId](#state_secretid_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Specifies the secret to which you want to add a new version. You can specify either the Amazon Resource Name (ARN) or the friendly name of the secret. The secret must already exist.

[region](#state_region_python) str

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[rotate\_immediately](#state_rotate_immediately_python) bool

Specifies whether to rotate the secret immediately or wait until the next scheduled rotation window. The rotation schedule is defined in `rotationRules`. For secrets that use a Lambda rotation function to rotate, if you don't immediately rotate the secret, Secrets Manager tests the rotation configuration by running the testSecret step (https://docs.aws.amazon.com/secretsmanager/latest/userguide/rotate-secrets\_how.html) of the Lambda rotation function. The test creates an AWSPENDING version of the secret and then removes it. Defaults to `true`.

[rotation\_enabled](#state_rotation_enabled_python) bool

Specifies whether automatic rotation is enabled for this secret.

[rotation\_lambda\_arn](#state_rotation_lambda_arn_python) str

Specifies the ARN of the Lambda function that can rotate the secret. Must be supplied if the secret is not managed by AWS.

[rotation\_rules](#state_rotation_rules_python) [SecretRotationRotationRulesArgs](#secretrotationrotationrules)

A structure that defines the rotation configuration for this secret. Defined below.

[secret\_id](#state_secret_id_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Specifies the secret to which you want to add a new version. You can specify either the Amazon Resource Name (ARN) or the friendly name of the secret. The secret must already exist.

[region](#state_region_yaml) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[rotateImmediately](#state_rotateimmediately_yaml) Boolean

Specifies whether to rotate the secret immediately or wait until the next scheduled rotation window. The rotation schedule is defined in `rotationRules`. For secrets that use a Lambda rotation function to rotate, if you don't immediately rotate the secret, Secrets Manager tests the rotation configuration by running the testSecret step (https://docs.aws.amazon.com/secretsmanager/latest/userguide/rotate-secrets\_how.html) of the Lambda rotation function. The test creates an AWSPENDING version of the secret and then removes it. Defaults to `true`.

[rotationEnabled](#state_rotationenabled_yaml) Boolean

Specifies whether automatic rotation is enabled for this secret.

[rotationLambdaArn](#state_rotationlambdaarn_yaml) String

Specifies the ARN of the Lambda function that can rotate the secret. Must be supplied if the secret is not managed by AWS.

[rotationRules](#state_rotationrules_yaml) [Property Map](#secretrotationrotationrules)

A structure that defines the rotation configuration for this secret. Defined below.

[secretId](#state_secretid_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Specifies the secret to which you want to add a new version. You can specify either the Amazon Resource Name (ARN) or the friendly name of the secret. The secret must already exist.

## Supporting Types[](#supporting-types)

#### SecretRotationRotationRules

, SecretRotationRotationRulesArgs

[](#secretrotationrotationrules)

[AutomaticallyAfterDays](#automaticallyafterdays_csharp) int

Specifies the number of days between automatic scheduled rotations of the secret. Either `automaticallyAfterDays` or `scheduleExpression` must be specified.

[Duration](#duration_csharp) string

The length of the rotation window in hours. For example, `3h` for a three hour window.

[ScheduleExpression](#scheduleexpression_csharp) string

A `cron()` or `rate()` expression that defines the schedule for rotating your secret. Either `automaticallyAfterDays` or `scheduleExpression` must be specified.

[AutomaticallyAfterDays](#automaticallyafterdays_go) int

Specifies the number of days between automatic scheduled rotations of the secret. Either `automaticallyAfterDays` or `scheduleExpression` must be specified.

[Duration](#duration_go) string

The length of the rotation window in hours. For example, `3h` for a three hour window.

[ScheduleExpression](#scheduleexpression_go) string

A `cron()` or `rate()` expression that defines the schedule for rotating your secret. Either `automaticallyAfterDays` or `scheduleExpression` must be specified.

[automatically\_after\_days](#automatically_after_days_hcl) number

Specifies the number of days between automatic scheduled rotations of the secret. Either `automaticallyAfterDays` or `scheduleExpression` must be specified.

[duration](#duration_hcl) string

The length of the rotation window in hours. For example, `3h` for a three hour window.

[schedule\_expression](#schedule_expression_hcl) string

A `cron()` or `rate()` expression that defines the schedule for rotating your secret. Either `automaticallyAfterDays` or `scheduleExpression` must be specified.

[automaticallyAfterDays](#automaticallyafterdays_java) Integer

Specifies the number of days between automatic scheduled rotations of the secret. Either `automaticallyAfterDays` or `scheduleExpression` must be specified.

[duration](#duration_java) String

The length of the rotation window in hours. For example, `3h` for a three hour window.

[scheduleExpression](#scheduleexpression_java) String

A `cron()` or `rate()` expression that defines the schedule for rotating your secret. Either `automaticallyAfterDays` or `scheduleExpression` must be specified.

[automaticallyAfterDays](#automaticallyafterdays_nodejs) number

Specifies the number of days between automatic scheduled rotations of the secret. Either `automaticallyAfterDays` or `scheduleExpression` must be specified.

[duration](#duration_nodejs) string

The length of the rotation window in hours. For example, `3h` for a three hour window.

[scheduleExpression](#scheduleexpression_nodejs) string

A `cron()` or `rate()` expression that defines the schedule for rotating your secret. Either `automaticallyAfterDays` or `scheduleExpression` must be specified.

[automatically\_after\_days](#automatically_after_days_python) int

Specifies the number of days between automatic scheduled rotations of the secret. Either `automaticallyAfterDays` or `scheduleExpression` must be specified.

[duration](#duration_python) str

The length of the rotation window in hours. For example, `3h` for a three hour window.

[schedule\_expression](#schedule_expression_python) str

A `cron()` or `rate()` expression that defines the schedule for rotating your secret. Either `automaticallyAfterDays` or `scheduleExpression` must be specified.

[automaticallyAfterDays](#automaticallyafterdays_yaml) Number

Specifies the number of days between automatic scheduled rotations of the secret. Either `automaticallyAfterDays` or `scheduleExpression` must be specified.

[duration](#duration_yaml) String

The length of the rotation window in hours. For example, `3h` for a three hour window.

[scheduleExpression](#scheduleexpression_yaml) String

A `cron()` or `rate()` expression that defines the schedule for rotating your secret. Either `automaticallyAfterDays` or `scheduleExpression` must be specified.

## Import[](#import)

### Identity Schema[](#identity-schema)

#### Required[](#required)

-   `arn` (String) Amazon Resource Name (ARN) of the Secrets Manager secret.

Using `pulumi import`, import `aws.secretsmanager.SecretRotation` using the secret Amazon Resource Name (ARN). For example:

```bash
$ pulumi import aws:secretsmanager/secretRotation:SecretRotation example arn:aws:secretsmanager:us-east-1:123456789012:secret:example-123456
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

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2fsecretsmanager%2fsecretrotation]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2fsecretsmanager%2fsecretrotation%2f\))

#### Try Pulumi Cloud free.
Your team will thank you.

[Start free trial](https://app.pulumi.com/signup?utm_source=registry&utm_medium=right-rail-banner&utm_campaign=try-pulumi-cloud&iaid=docs-try-pulumi-cloud-ad)
