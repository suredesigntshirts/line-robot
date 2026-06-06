---
Source: https://www.pulumi.com/registry/packages/aws/api-docs/secretsmanager/secret/
Generated: 2026-06-06
Updated: 2026-06-06
---

# aws.secretsmanager.Secret

1.  [Packages](/registry/)
2.  [Packages](/registry/packages/)
3.  [AWS](/registry/packages/aws/)
4.  [API Docs](/registry/packages/aws/api-docs/)
5.  [secretsmanager](/registry/packages/aws/api-docs/secretsmanager/)
6.  [Secret](/registry/packages/aws/api-docs/secretsmanager/secret/)

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

Viewing docs for AWS v7.32.0
published on Friday, May 29, 2026 by Pulumi

[Schema (JSON)](/registry/packages/aws/schema.json)

[pulumi/pulumi-aws](https://github.com/pulumi/pulumi-aws)

v7.32.0 (7.x, latest)v6.83.1 (6.x)v5.43.0 (5.x)

# aws.secretsmanager.Secret[](#aws-secretsmanager-secret)

Explore with Neo

-   Copy Page

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2fsecretsmanager%2fsecret]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2fsecretsmanager%2fsecret%2f\))

Provides a resource to manage AWS Secrets Manager secret metadata. To manage secret rotation, see the `aws.secretsmanager.SecretRotation` resource. To manage a secret value, see the `aws.secretsmanager.SecretVersion` resource.

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

const example = new aws.secretsmanager.Secret("example", {name: "example"});
```

```python
import pulumi
import pulumi_aws as aws

example = aws.secretsmanager.Secret("example", name="example")
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/secretsmanager"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		_, err := secretsmanager.NewSecret(ctx, "example", &secretsmanager.SecretArgs{
			Name: pulumi.String("example"),
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
    var example = new Aws.SecretsManager.Secret("example", new()
    {
        Name = "example",
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.secretsmanager.Secret;
import com.pulumi.aws.secretsmanager.SecretArgs;
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
        var example = new Secret("example", SecretArgs.builder()
            .name("example")
            .build());

    }
}
```

```yaml
resources:
  example:
    type: aws:secretsmanager:Secret
    properties:
      name: example
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_secretsmanager_secret" "example" {
  name = "example"
}
```

## Create Secret Resource[](#create)

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
new Secret(name: string, args?: SecretArgs, opts?: CustomResourceOptions);
```

```python
@overload
def Secret(resource_name: str,
           args: Optional[SecretArgs] = None,
           opts: Optional[ResourceOptions] = None)

@overload
def Secret(resource_name: str,
           opts: Optional[ResourceOptions] = None,
           description: Optional[str] = None,
           force_overwrite_replica_secret: Optional[bool] = None,
           kms_key_id: Optional[str] = None,
           name: Optional[str] = None,
           name_prefix: Optional[str] = None,
           policy: Optional[str] = None,
           recovery_window_in_days: Optional[int] = None,
           region: Optional[str] = None,
           replicas: Optional[Sequence[SecretReplicaArgs]] = None,
           tags: Optional[Mapping[str, str]] = None)
```

```go
func NewSecret(ctx *Context, name string, args *SecretArgs, opts ...ResourceOption) (*Secret, error)
```

```csharp
public Secret(string name, SecretArgs? args = null, CustomResourceOptions? opts = null)
```

```java
public Secret(String name, SecretArgs args)
public Secret(String name, SecretArgs args, CustomResourceOptions options)
```

```yaml
type: aws:secretsmanager:Secret
properties: # The arguments to resource properties.
options: # Bag of options to control resource's behavior.
```

```hcl
resource "aws_secretsmanager_secret" "name" {
    # resource properties
}
```

#### Parameters[](#parameters)

name This property is required. string

The unique name of the resource.

args [SecretArgs](#inputs)

The arguments to resource properties.

opts [CustomResourceOptions](/docs/reference/pkg/nodejs/pulumi/pulumi/#CustomResourceOptions)

Bag of options to control resource's behavior.

resource\_name This property is required. str

The unique name of the resource.

args [SecretArgs](#inputs)

The arguments to resource properties.

opts [ResourceOptions](/docs/reference/pkg/python/pulumi/#pulumi.ResourceOptions)

Bag of options to control resource's behavior.

ctx [Context](https://pkg.go.dev/github.com/pulumi/pulumi/sdk/v3/go/pulumi?tab=doc#Context)

Context object for the current deployment.

name This property is required. string

The unique name of the resource.

args [SecretArgs](#inputs)

The arguments to resource properties.

opts [ResourceOption](https://pkg.go.dev/github.com/pulumi/pulumi/sdk/v3/go/pulumi?tab=doc#ResourceOption)

Bag of options to control resource's behavior.

name This property is required. string

The unique name of the resource.

args [SecretArgs](#inputs)

The arguments to resource properties.

opts [CustomResourceOptions](/docs/reference/pkg/dotnet/Pulumi/Pulumi.CustomResourceOptions.html)

Bag of options to control resource's behavior.

name This property is required. String

The unique name of the resource.

args This property is required. [SecretArgs](#inputs)

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
var secretResource = new Aws.SecretsManager.Secret("secretResource", new()
{
    Description = "string",
    ForceOverwriteReplicaSecret = false,
    KmsKeyId = "string",
    Name = "string",
    NamePrefix = "string",
    Policy = "string",
    RecoveryWindowInDays = 0,
    Region = "string",
    Replicas = new[]
    {
        new Aws.SecretsManager.Inputs.SecretReplicaArgs
        {
            Region = "string",
            KmsKeyId = "string",
            LastAccessedDate = "string",
            Status = "string",
            StatusMessage = "string",
        },
    },
    Tags =
    {
        { "string", "string" },
    },
});
```

```go
example, err := secretsmanager.NewSecret(ctx, "secretResource", &secretsmanager.SecretArgs{
	Description:                 pulumi.String("string"),
	ForceOverwriteReplicaSecret: pulumi.Bool(false),
	KmsKeyId:                    pulumi.String("string"),
	Name:                        pulumi.String("string"),
	NamePrefix:                  pulumi.String("string"),
	Policy:                      pulumi.String("string"),
	RecoveryWindowInDays:        pulumi.Int(0),
	Region:                      pulumi.String("string"),
	Replicas: secretsmanager.SecretReplicaArray{
		&secretsmanager.SecretReplicaArgs{
			Region:           pulumi.String("string"),
			KmsKeyId:         pulumi.String("string"),
			LastAccessedDate: pulumi.String("string"),
			Status:           pulumi.String("string"),
			StatusMessage:    pulumi.String("string"),
		},
	},
	Tags: pulumi.StringMap{
		"string": pulumi.String("string"),
	},
})
```

```hcl
resource "aws_secretsmanager_secret" "secretResource" {
  description                    = "string"
  force_overwrite_replica_secret = false
  kms_key_id                     = "string"
  name                           = "string"
  name_prefix                    = "string"
  policy                         = "string"
  recovery_window_in_days        = 0
  region                         = "string"
  replicas {
    region             = "string"
    kms_key_id         = "string"
    last_accessed_date = "string"
    status             = "string"
    status_message     = "string"
  }
  tags = {
    "string" = "string"
  }
}
```

```java
var secretResource = new Secret("secretResource", SecretArgs.builder()
    .description("string")
    .forceOverwriteReplicaSecret(false)
    .kmsKeyId("string")
    .name("string")
    .namePrefix("string")
    .policy("string")
    .recoveryWindowInDays(0)
    .region("string")
    .replicas(SecretReplicaArgs.builder()
        .region("string")
        .kmsKeyId("string")
        .lastAccessedDate("string")
        .status("string")
        .statusMessage("string")
        .build())
    .tags(Map.of("string", "string"))
    .build());
```

```python
secret_resource = aws.secretsmanager.Secret("secretResource",
    description="string",
    force_overwrite_replica_secret=False,
    kms_key_id="string",
    name="string",
    name_prefix="string",
    policy="string",
    recovery_window_in_days=0,
    region="string",
    replicas=[{
        "region": "string",
        "kms_key_id": "string",
        "last_accessed_date": "string",
        "status": "string",
        "status_message": "string",
    }],
    tags={
        "string": "string",
    })
```

```typescript
const secretResource = new aws.secretsmanager.Secret("secretResource", {
    description: "string",
    forceOverwriteReplicaSecret: false,
    kmsKeyId: "string",
    name: "string",
    namePrefix: "string",
    policy: "string",
    recoveryWindowInDays: 0,
    region: "string",
    replicas: [{
        region: "string",
        kmsKeyId: "string",
        lastAccessedDate: "string",
        status: "string",
        statusMessage: "string",
    }],
    tags: {
        string: "string",
    },
});
```

```yaml
type: aws:secretsmanager:Secret
properties:
    description: string
    forceOverwriteReplicaSecret: false
    kmsKeyId: string
    name: string
    namePrefix: string
    policy: string
    recoveryWindowInDays: 0
    region: string
    replicas:
        - kmsKeyId: string
          lastAccessedDate: string
          region: string
          status: string
          statusMessage: string
    tags:
        string: string
```

## Secret Resource Properties[](#properties)

To learn more about resource properties and how to use them, see [Inputs and Outputs](/docs/intro/concepts/inputs-outputs) in the Architecture and Concepts docs.

### Inputs[](#inputs)

In Python, inputs that are objects can be passed either as [argument classes or as dictionary literals](/docs/languages-sdks/python/#inputs-and-outputs).

The Secret resource accepts the following [input](/docs/intro/concepts/inputs-outputs) properties:

[Description](#description_csharp) string

Description of the secret.

[ForceOverwriteReplicaSecret](#forceoverwritereplicasecret_csharp) bool

Accepts boolean value to specify whether to overwrite a secret with the same name in the destination Region.

[KmsKeyId](#kmskeyid_csharp) string

ARN or Id of the AWS KMS key to be used to encrypt the secret values in the versions stored in this secret. If you need to reference a CMK in a different account, you can use only the key ARN. If you don't specify this value, then Secrets Manager defaults to using the AWS account's default KMS key (the one named `aws/secretsmanager`). If the default KMS key with that name doesn't yet exist, then AWS Secrets Manager creates it for you automatically the first time.

[Name](#name_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Friendly name of the new secret. The secret name can consist of uppercase letters, lowercase letters, digits, and any of the following characters: `/_+=.@-` Conflicts with `namePrefix`.

[NamePrefix](#nameprefix_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[Policy](#policy_csharp) string

Valid JSON document representing a [resource policy](https://docs.aws.amazon.com/secretsmanager/latest/userguide/auth-and-access_resource-based-policies.html). Removing `policy` from your configuration or setting `policy` to null or an empty string (i.e., `policy = ""`) *will not* delete the policy since it could have been set by `aws.secretsmanager.SecretPolicy`. To delete the `policy`, set it to `"{}"` (an empty JSON document).

[RecoveryWindowInDays](#recoverywindowindays_csharp) int

Number of days that AWS Secrets Manager waits before it can delete the secret. This value can be `0` to force deletion without recovery or range from `7` to `30` days. The default value is `30`.

[Region](#region_csharp) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[Replicas](#replicas_csharp) [List<SecretReplica>](#secretreplica)

Configuration block to support secret replication. See details below.

[Tags](#tags_csharp) Dictionary<string, string>

Key-value map of user-defined tags that are attached to the secret. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[Description](#description_go) string

Description of the secret.

[ForceOverwriteReplicaSecret](#forceoverwritereplicasecret_go) bool

Accepts boolean value to specify whether to overwrite a secret with the same name in the destination Region.

[KmsKeyId](#kmskeyid_go) string

ARN or Id of the AWS KMS key to be used to encrypt the secret values in the versions stored in this secret. If you need to reference a CMK in a different account, you can use only the key ARN. If you don't specify this value, then Secrets Manager defaults to using the AWS account's default KMS key (the one named `aws/secretsmanager`). If the default KMS key with that name doesn't yet exist, then AWS Secrets Manager creates it for you automatically the first time.

[Name](#name_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Friendly name of the new secret. The secret name can consist of uppercase letters, lowercase letters, digits, and any of the following characters: `/_+=.@-` Conflicts with `namePrefix`.

[NamePrefix](#nameprefix_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[Policy](#policy_go) string

Valid JSON document representing a [resource policy](https://docs.aws.amazon.com/secretsmanager/latest/userguide/auth-and-access_resource-based-policies.html). Removing `policy` from your configuration or setting `policy` to null or an empty string (i.e., `policy = ""`) *will not* delete the policy since it could have been set by `aws.secretsmanager.SecretPolicy`. To delete the `policy`, set it to `"{}"` (an empty JSON document).

[RecoveryWindowInDays](#recoverywindowindays_go) int

Number of days that AWS Secrets Manager waits before it can delete the secret. This value can be `0` to force deletion without recovery or range from `7` to `30` days. The default value is `30`.

[Region](#region_go) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[Replicas](#replicas_go) [\[\]SecretReplicaArgs](#secretreplica)

Configuration block to support secret replication. See details below.

[Tags](#tags_go) map\[string\]string

Key-value map of user-defined tags that are attached to the secret. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[description](#description_hcl) string

Description of the secret.

[force\_overwrite\_replica\_secret](#force_overwrite_replica_secret_hcl) bool

Accepts boolean value to specify whether to overwrite a secret with the same name in the destination Region.

[kms\_key\_id](#kms_key_id_hcl) string

ARN or Id of the AWS KMS key to be used to encrypt the secret values in the versions stored in this secret. If you need to reference a CMK in a different account, you can use only the key ARN. If you don't specify this value, then Secrets Manager defaults to using the AWS account's default KMS key (the one named `aws/secretsmanager`). If the default KMS key with that name doesn't yet exist, then AWS Secrets Manager creates it for you automatically the first time.

[name](#name_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Friendly name of the new secret. The secret name can consist of uppercase letters, lowercase letters, digits, and any of the following characters: `/_+=.@-` Conflicts with `namePrefix`.

[name\_prefix](#name_prefix_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[policy](#policy_hcl) string

Valid JSON document representing a [resource policy](https://docs.aws.amazon.com/secretsmanager/latest/userguide/auth-and-access_resource-based-policies.html). Removing `policy` from your configuration or setting `policy` to null or an empty string (i.e., `policy = ""`) *will not* delete the policy since it could have been set by `aws.secretsmanager.SecretPolicy`. To delete the `policy`, set it to `"{}"` (an empty JSON document).

[recovery\_window\_in\_days](#recovery_window_in_days_hcl) number

Number of days that AWS Secrets Manager waits before it can delete the secret. This value can be `0` to force deletion without recovery or range from `7` to `30` days. The default value is `30`.

[region](#region_hcl) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[replicas](#replicas_hcl) [list(object)](#secretreplica)

Configuration block to support secret replication. See details below.

[tags](#tags_hcl) map(string)

Key-value map of user-defined tags that are attached to the secret. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[description](#description_java) String

Description of the secret.

[forceOverwriteReplicaSecret](#forceoverwritereplicasecret_java) Boolean

Accepts boolean value to specify whether to overwrite a secret with the same name in the destination Region.

[kmsKeyId](#kmskeyid_java) String

ARN or Id of the AWS KMS key to be used to encrypt the secret values in the versions stored in this secret. If you need to reference a CMK in a different account, you can use only the key ARN. If you don't specify this value, then Secrets Manager defaults to using the AWS account's default KMS key (the one named `aws/secretsmanager`). If the default KMS key with that name doesn't yet exist, then AWS Secrets Manager creates it for you automatically the first time.

[name](#name_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Friendly name of the new secret. The secret name can consist of uppercase letters, lowercase letters, digits, and any of the following characters: `/_+=.@-` Conflicts with `namePrefix`.

[namePrefix](#nameprefix_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[policy](#policy_java) String

Valid JSON document representing a [resource policy](https://docs.aws.amazon.com/secretsmanager/latest/userguide/auth-and-access_resource-based-policies.html). Removing `policy` from your configuration or setting `policy` to null or an empty string (i.e., `policy = ""`) *will not* delete the policy since it could have been set by `aws.secretsmanager.SecretPolicy`. To delete the `policy`, set it to `"{}"` (an empty JSON document).

[recoveryWindowInDays](#recoverywindowindays_java) Integer

Number of days that AWS Secrets Manager waits before it can delete the secret. This value can be `0` to force deletion without recovery or range from `7` to `30` days. The default value is `30`.

[region](#region_java) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[replicas](#replicas_java) [List<SecretReplica>](#secretreplica)

Configuration block to support secret replication. See details below.

[tags](#tags_java) Map<String,String>

Key-value map of user-defined tags that are attached to the secret. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[description](#description_nodejs) string

Description of the secret.

[forceOverwriteReplicaSecret](#forceoverwritereplicasecret_nodejs) boolean

Accepts boolean value to specify whether to overwrite a secret with the same name in the destination Region.

[kmsKeyId](#kmskeyid_nodejs) string

ARN or Id of the AWS KMS key to be used to encrypt the secret values in the versions stored in this secret. If you need to reference a CMK in a different account, you can use only the key ARN. If you don't specify this value, then Secrets Manager defaults to using the AWS account's default KMS key (the one named `aws/secretsmanager`). If the default KMS key with that name doesn't yet exist, then AWS Secrets Manager creates it for you automatically the first time.

[name](#name_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Friendly name of the new secret. The secret name can consist of uppercase letters, lowercase letters, digits, and any of the following characters: `/_+=.@-` Conflicts with `namePrefix`.

[namePrefix](#nameprefix_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[policy](#policy_nodejs) string

Valid JSON document representing a [resource policy](https://docs.aws.amazon.com/secretsmanager/latest/userguide/auth-and-access_resource-based-policies.html). Removing `policy` from your configuration or setting `policy` to null or an empty string (i.e., `policy = ""`) *will not* delete the policy since it could have been set by `aws.secretsmanager.SecretPolicy`. To delete the `policy`, set it to `"{}"` (an empty JSON document).

[recoveryWindowInDays](#recoverywindowindays_nodejs) number

Number of days that AWS Secrets Manager waits before it can delete the secret. This value can be `0` to force deletion without recovery or range from `7` to `30` days. The default value is `30`.

[region](#region_nodejs) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[replicas](#replicas_nodejs) [SecretReplica\[\]](#secretreplica)

Configuration block to support secret replication. See details below.

[tags](#tags_nodejs) {\[key: string\]: string}

Key-value map of user-defined tags that are attached to the secret. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[description](#description_python) str

Description of the secret.

[force\_overwrite\_replica\_secret](#force_overwrite_replica_secret_python) bool

Accepts boolean value to specify whether to overwrite a secret with the same name in the destination Region.

[kms\_key\_id](#kms_key_id_python) str

ARN or Id of the AWS KMS key to be used to encrypt the secret values in the versions stored in this secret. If you need to reference a CMK in a different account, you can use only the key ARN. If you don't specify this value, then Secrets Manager defaults to using the AWS account's default KMS key (the one named `aws/secretsmanager`). If the default KMS key with that name doesn't yet exist, then AWS Secrets Manager creates it for you automatically the first time.

[name](#name_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Friendly name of the new secret. The secret name can consist of uppercase letters, lowercase letters, digits, and any of the following characters: `/_+=.@-` Conflicts with `namePrefix`.

[name\_prefix](#name_prefix_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[policy](#policy_python) str

Valid JSON document representing a [resource policy](https://docs.aws.amazon.com/secretsmanager/latest/userguide/auth-and-access_resource-based-policies.html). Removing `policy` from your configuration or setting `policy` to null or an empty string (i.e., `policy = ""`) *will not* delete the policy since it could have been set by `aws.secretsmanager.SecretPolicy`. To delete the `policy`, set it to `"{}"` (an empty JSON document).

[recovery\_window\_in\_days](#recovery_window_in_days_python) int

Number of days that AWS Secrets Manager waits before it can delete the secret. This value can be `0` to force deletion without recovery or range from `7` to `30` days. The default value is `30`.

[region](#region_python) str

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[replicas](#replicas_python) [Sequence\[SecretReplicaArgs\]](#secretreplica)

Configuration block to support secret replication. See details below.

[tags](#tags_python) Mapping\[str, str\]

Key-value map of user-defined tags that are attached to the secret. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[description](#description_yaml) String

Description of the secret.

[forceOverwriteReplicaSecret](#forceoverwritereplicasecret_yaml) Boolean

Accepts boolean value to specify whether to overwrite a secret with the same name in the destination Region.

[kmsKeyId](#kmskeyid_yaml) String

ARN or Id of the AWS KMS key to be used to encrypt the secret values in the versions stored in this secret. If you need to reference a CMK in a different account, you can use only the key ARN. If you don't specify this value, then Secrets Manager defaults to using the AWS account's default KMS key (the one named `aws/secretsmanager`). If the default KMS key with that name doesn't yet exist, then AWS Secrets Manager creates it for you automatically the first time.

[name](#name_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Friendly name of the new secret. The secret name can consist of uppercase letters, lowercase letters, digits, and any of the following characters: `/_+=.@-` Conflicts with `namePrefix`.

[namePrefix](#nameprefix_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[policy](#policy_yaml) String

Valid JSON document representing a [resource policy](https://docs.aws.amazon.com/secretsmanager/latest/userguide/auth-and-access_resource-based-policies.html). Removing `policy` from your configuration or setting `policy` to null or an empty string (i.e., `policy = ""`) *will not* delete the policy since it could have been set by `aws.secretsmanager.SecretPolicy`. To delete the `policy`, set it to `"{}"` (an empty JSON document).

[recoveryWindowInDays](#recoverywindowindays_yaml) Number

Number of days that AWS Secrets Manager waits before it can delete the secret. This value can be `0` to force deletion without recovery or range from `7` to `30` days. The default value is `30`.

[region](#region_yaml) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[replicas](#replicas_yaml) [List<Property Map>](#secretreplica)

Configuration block to support secret replication. See details below.

[tags](#tags_yaml) Map<String>

Key-value map of user-defined tags that are attached to the secret. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

### Outputs[](#outputs)

All [input](#inputs) properties are implicitly available as output properties. Additionally, the Secret resource produces the following output properties:

[Arn](#arn_csharp) string

ARN of the secret.

[Id](#id_csharp) string

The provider-assigned unique ID for this managed resource.

[TagsAll](#tagsall_csharp) Dictionary<string, string>

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[Arn](#arn_go) string

ARN of the secret.

[Id](#id_go) string

The provider-assigned unique ID for this managed resource.

[TagsAll](#tagsall_go) map\[string\]string

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[arn](#arn_hcl) string

ARN of the secret.

[id](#id_hcl) string

The provider-assigned unique ID for this managed resource.

[tags\_all](#tags_all_hcl) map(string)

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[arn](#arn_java) String

ARN of the secret.

[id](#id_java) String

The provider-assigned unique ID for this managed resource.

[tagsAll](#tagsall_java) Map<String,String>

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[arn](#arn_nodejs) string

ARN of the secret.

[id](#id_nodejs) string

The provider-assigned unique ID for this managed resource.

[tagsAll](#tagsall_nodejs) {\[key: string\]: string}

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[arn](#arn_python) str

ARN of the secret.

[id](#id_python) str

The provider-assigned unique ID for this managed resource.

[tags\_all](#tags_all_python) Mapping\[str, str\]

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[arn](#arn_yaml) String

ARN of the secret.

[id](#id_yaml) String

The provider-assigned unique ID for this managed resource.

[tagsAll](#tagsall_yaml) Map<String>

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

## Look up Existing Secret Resource[](#look-up)

Get an existing Secret resource’s state with the given name, ID, and optional extra properties used to qualify the lookup.

-   TypeScript
-   Python
-   Go
-   C#
-   Java
-   YAML
-   HCL PREVIEW

```typescript
public static get(name: string, id: Input<ID>, state?: SecretState, opts?: CustomResourceOptions): Secret
```

```python
@staticmethod
def get(resource_name: str,
        id: str,
        opts: Optional[ResourceOptions] = None,
        arn: Optional[str] = None,
        description: Optional[str] = None,
        force_overwrite_replica_secret: Optional[bool] = None,
        kms_key_id: Optional[str] = None,
        name: Optional[str] = None,
        name_prefix: Optional[str] = None,
        policy: Optional[str] = None,
        recovery_window_in_days: Optional[int] = None,
        region: Optional[str] = None,
        replicas: Optional[Sequence[SecretReplicaArgs]] = None,
        tags: Optional[Mapping[str, str]] = None,
        tags_all: Optional[Mapping[str, str]] = None) -> Secret
```

```go
func GetSecret(ctx *Context, name string, id IDInput, state *SecretState, opts ...ResourceOption) (*Secret, error)
```

```csharp
public static Secret Get(string name, Input<string> id, SecretState? state, CustomResourceOptions? opts = null)
```

```java
public static Secret get(String name, Output<String> id, SecretState state, CustomResourceOptions options)
```

```yaml
resources:  _:    type: aws:secretsmanager:Secret    get:      id: ${id}
```

```hcl
import {
  to = aws_secretsmanager_secret.example
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

ARN of the secret.

[Description](#state_description_csharp) string

Description of the secret.

[ForceOverwriteReplicaSecret](#state_forceoverwritereplicasecret_csharp) bool

Accepts boolean value to specify whether to overwrite a secret with the same name in the destination Region.

[KmsKeyId](#state_kmskeyid_csharp) string

ARN or Id of the AWS KMS key to be used to encrypt the secret values in the versions stored in this secret. If you need to reference a CMK in a different account, you can use only the key ARN. If you don't specify this value, then Secrets Manager defaults to using the AWS account's default KMS key (the one named `aws/secretsmanager`). If the default KMS key with that name doesn't yet exist, then AWS Secrets Manager creates it for you automatically the first time.

[Name](#state_name_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Friendly name of the new secret. The secret name can consist of uppercase letters, lowercase letters, digits, and any of the following characters: `/_+=.@-` Conflicts with `namePrefix`.

[NamePrefix](#state_nameprefix_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[Policy](#state_policy_csharp) string

Valid JSON document representing a [resource policy](https://docs.aws.amazon.com/secretsmanager/latest/userguide/auth-and-access_resource-based-policies.html). Removing `policy` from your configuration or setting `policy` to null or an empty string (i.e., `policy = ""`) *will not* delete the policy since it could have been set by `aws.secretsmanager.SecretPolicy`. To delete the `policy`, set it to `"{}"` (an empty JSON document).

[RecoveryWindowInDays](#state_recoverywindowindays_csharp) int

Number of days that AWS Secrets Manager waits before it can delete the secret. This value can be `0` to force deletion without recovery or range from `7` to `30` days. The default value is `30`.

[Region](#state_region_csharp) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[Replicas](#state_replicas_csharp) [List<SecretReplica>](#secretreplica)

Configuration block to support secret replication. See details below.

[Tags](#state_tags_csharp) Dictionary<string, string>

Key-value map of user-defined tags that are attached to the secret. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[TagsAll](#state_tagsall_csharp) Dictionary<string, string>

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[Arn](#state_arn_go) string

ARN of the secret.

[Description](#state_description_go) string

Description of the secret.

[ForceOverwriteReplicaSecret](#state_forceoverwritereplicasecret_go) bool

Accepts boolean value to specify whether to overwrite a secret with the same name in the destination Region.

[KmsKeyId](#state_kmskeyid_go) string

ARN or Id of the AWS KMS key to be used to encrypt the secret values in the versions stored in this secret. If you need to reference a CMK in a different account, you can use only the key ARN. If you don't specify this value, then Secrets Manager defaults to using the AWS account's default KMS key (the one named `aws/secretsmanager`). If the default KMS key with that name doesn't yet exist, then AWS Secrets Manager creates it for you automatically the first time.

[Name](#state_name_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Friendly name of the new secret. The secret name can consist of uppercase letters, lowercase letters, digits, and any of the following characters: `/_+=.@-` Conflicts with `namePrefix`.

[NamePrefix](#state_nameprefix_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[Policy](#state_policy_go) string

Valid JSON document representing a [resource policy](https://docs.aws.amazon.com/secretsmanager/latest/userguide/auth-and-access_resource-based-policies.html). Removing `policy` from your configuration or setting `policy` to null or an empty string (i.e., `policy = ""`) *will not* delete the policy since it could have been set by `aws.secretsmanager.SecretPolicy`. To delete the `policy`, set it to `"{}"` (an empty JSON document).

[RecoveryWindowInDays](#state_recoverywindowindays_go) int

Number of days that AWS Secrets Manager waits before it can delete the secret. This value can be `0` to force deletion without recovery or range from `7` to `30` days. The default value is `30`.

[Region](#state_region_go) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[Replicas](#state_replicas_go) [\[\]SecretReplicaArgs](#secretreplica)

Configuration block to support secret replication. See details below.

[Tags](#state_tags_go) map\[string\]string

Key-value map of user-defined tags that are attached to the secret. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[TagsAll](#state_tagsall_go) map\[string\]string

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[arn](#state_arn_hcl) string

ARN of the secret.

[description](#state_description_hcl) string

Description of the secret.

[force\_overwrite\_replica\_secret](#state_force_overwrite_replica_secret_hcl) bool

Accepts boolean value to specify whether to overwrite a secret with the same name in the destination Region.

[kms\_key\_id](#state_kms_key_id_hcl) string

ARN or Id of the AWS KMS key to be used to encrypt the secret values in the versions stored in this secret. If you need to reference a CMK in a different account, you can use only the key ARN. If you don't specify this value, then Secrets Manager defaults to using the AWS account's default KMS key (the one named `aws/secretsmanager`). If the default KMS key with that name doesn't yet exist, then AWS Secrets Manager creates it for you automatically the first time.

[name](#state_name_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Friendly name of the new secret. The secret name can consist of uppercase letters, lowercase letters, digits, and any of the following characters: `/_+=.@-` Conflicts with `namePrefix`.

[name\_prefix](#state_name_prefix_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[policy](#state_policy_hcl) string

Valid JSON document representing a [resource policy](https://docs.aws.amazon.com/secretsmanager/latest/userguide/auth-and-access_resource-based-policies.html). Removing `policy` from your configuration or setting `policy` to null or an empty string (i.e., `policy = ""`) *will not* delete the policy since it could have been set by `aws.secretsmanager.SecretPolicy`. To delete the `policy`, set it to `"{}"` (an empty JSON document).

[recovery\_window\_in\_days](#state_recovery_window_in_days_hcl) number

Number of days that AWS Secrets Manager waits before it can delete the secret. This value can be `0` to force deletion without recovery or range from `7` to `30` days. The default value is `30`.

[region](#state_region_hcl) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[replicas](#state_replicas_hcl) [list(object)](#secretreplica)

Configuration block to support secret replication. See details below.

[tags](#state_tags_hcl) map(string)

Key-value map of user-defined tags that are attached to the secret. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tags\_all](#state_tags_all_hcl) map(string)

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[arn](#state_arn_java) String

ARN of the secret.

[description](#state_description_java) String

Description of the secret.

[forceOverwriteReplicaSecret](#state_forceoverwritereplicasecret_java) Boolean

Accepts boolean value to specify whether to overwrite a secret with the same name in the destination Region.

[kmsKeyId](#state_kmskeyid_java) String

ARN or Id of the AWS KMS key to be used to encrypt the secret values in the versions stored in this secret. If you need to reference a CMK in a different account, you can use only the key ARN. If you don't specify this value, then Secrets Manager defaults to using the AWS account's default KMS key (the one named `aws/secretsmanager`). If the default KMS key with that name doesn't yet exist, then AWS Secrets Manager creates it for you automatically the first time.

[name](#state_name_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Friendly name of the new secret. The secret name can consist of uppercase letters, lowercase letters, digits, and any of the following characters: `/_+=.@-` Conflicts with `namePrefix`.

[namePrefix](#state_nameprefix_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[policy](#state_policy_java) String

Valid JSON document representing a [resource policy](https://docs.aws.amazon.com/secretsmanager/latest/userguide/auth-and-access_resource-based-policies.html). Removing `policy` from your configuration or setting `policy` to null or an empty string (i.e., `policy = ""`) *will not* delete the policy since it could have been set by `aws.secretsmanager.SecretPolicy`. To delete the `policy`, set it to `"{}"` (an empty JSON document).

[recoveryWindowInDays](#state_recoverywindowindays_java) Integer

Number of days that AWS Secrets Manager waits before it can delete the secret. This value can be `0` to force deletion without recovery or range from `7` to `30` days. The default value is `30`.

[region](#state_region_java) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[replicas](#state_replicas_java) [List<SecretReplica>](#secretreplica)

Configuration block to support secret replication. See details below.

[tags](#state_tags_java) Map<String,String>

Key-value map of user-defined tags that are attached to the secret. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tagsAll](#state_tagsall_java) Map<String,String>

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[arn](#state_arn_nodejs) string

ARN of the secret.

[description](#state_description_nodejs) string

Description of the secret.

[forceOverwriteReplicaSecret](#state_forceoverwritereplicasecret_nodejs) boolean

Accepts boolean value to specify whether to overwrite a secret with the same name in the destination Region.

[kmsKeyId](#state_kmskeyid_nodejs) string

ARN or Id of the AWS KMS key to be used to encrypt the secret values in the versions stored in this secret. If you need to reference a CMK in a different account, you can use only the key ARN. If you don't specify this value, then Secrets Manager defaults to using the AWS account's default KMS key (the one named `aws/secretsmanager`). If the default KMS key with that name doesn't yet exist, then AWS Secrets Manager creates it for you automatically the first time.

[name](#state_name_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Friendly name of the new secret. The secret name can consist of uppercase letters, lowercase letters, digits, and any of the following characters: `/_+=.@-` Conflicts with `namePrefix`.

[namePrefix](#state_nameprefix_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[policy](#state_policy_nodejs) string

Valid JSON document representing a [resource policy](https://docs.aws.amazon.com/secretsmanager/latest/userguide/auth-and-access_resource-based-policies.html). Removing `policy` from your configuration or setting `policy` to null or an empty string (i.e., `policy = ""`) *will not* delete the policy since it could have been set by `aws.secretsmanager.SecretPolicy`. To delete the `policy`, set it to `"{}"` (an empty JSON document).

[recoveryWindowInDays](#state_recoverywindowindays_nodejs) number

Number of days that AWS Secrets Manager waits before it can delete the secret. This value can be `0` to force deletion without recovery or range from `7` to `30` days. The default value is `30`.

[region](#state_region_nodejs) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[replicas](#state_replicas_nodejs) [SecretReplica\[\]](#secretreplica)

Configuration block to support secret replication. See details below.

[tags](#state_tags_nodejs) {\[key: string\]: string}

Key-value map of user-defined tags that are attached to the secret. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tagsAll](#state_tagsall_nodejs) {\[key: string\]: string}

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[arn](#state_arn_python) str

ARN of the secret.

[description](#state_description_python) str

Description of the secret.

[force\_overwrite\_replica\_secret](#state_force_overwrite_replica_secret_python) bool

Accepts boolean value to specify whether to overwrite a secret with the same name in the destination Region.

[kms\_key\_id](#state_kms_key_id_python) str

ARN or Id of the AWS KMS key to be used to encrypt the secret values in the versions stored in this secret. If you need to reference a CMK in a different account, you can use only the key ARN. If you don't specify this value, then Secrets Manager defaults to using the AWS account's default KMS key (the one named `aws/secretsmanager`). If the default KMS key with that name doesn't yet exist, then AWS Secrets Manager creates it for you automatically the first time.

[name](#state_name_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Friendly name of the new secret. The secret name can consist of uppercase letters, lowercase letters, digits, and any of the following characters: `/_+=.@-` Conflicts with `namePrefix`.

[name\_prefix](#state_name_prefix_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[policy](#state_policy_python) str

Valid JSON document representing a [resource policy](https://docs.aws.amazon.com/secretsmanager/latest/userguide/auth-and-access_resource-based-policies.html). Removing `policy` from your configuration or setting `policy` to null or an empty string (i.e., `policy = ""`) *will not* delete the policy since it could have been set by `aws.secretsmanager.SecretPolicy`. To delete the `policy`, set it to `"{}"` (an empty JSON document).

[recovery\_window\_in\_days](#state_recovery_window_in_days_python) int

Number of days that AWS Secrets Manager waits before it can delete the secret. This value can be `0` to force deletion without recovery or range from `7` to `30` days. The default value is `30`.

[region](#state_region_python) str

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[replicas](#state_replicas_python) [Sequence\[SecretReplicaArgs\]](#secretreplica)

Configuration block to support secret replication. See details below.

[tags](#state_tags_python) Mapping\[str, str\]

Key-value map of user-defined tags that are attached to the secret. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tags\_all](#state_tags_all_python) Mapping\[str, str\]

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[arn](#state_arn_yaml) String

ARN of the secret.

[description](#state_description_yaml) String

Description of the secret.

[forceOverwriteReplicaSecret](#state_forceoverwritereplicasecret_yaml) Boolean

Accepts boolean value to specify whether to overwrite a secret with the same name in the destination Region.

[kmsKeyId](#state_kmskeyid_yaml) String

ARN or Id of the AWS KMS key to be used to encrypt the secret values in the versions stored in this secret. If you need to reference a CMK in a different account, you can use only the key ARN. If you don't specify this value, then Secrets Manager defaults to using the AWS account's default KMS key (the one named `aws/secretsmanager`). If the default KMS key with that name doesn't yet exist, then AWS Secrets Manager creates it for you automatically the first time.

[name](#state_name_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Friendly name of the new secret. The secret name can consist of uppercase letters, lowercase letters, digits, and any of the following characters: `/_+=.@-` Conflicts with `namePrefix`.

[namePrefix](#state_nameprefix_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[policy](#state_policy_yaml) String

Valid JSON document representing a [resource policy](https://docs.aws.amazon.com/secretsmanager/latest/userguide/auth-and-access_resource-based-policies.html). Removing `policy` from your configuration or setting `policy` to null or an empty string (i.e., `policy = ""`) *will not* delete the policy since it could have been set by `aws.secretsmanager.SecretPolicy`. To delete the `policy`, set it to `"{}"` (an empty JSON document).

[recoveryWindowInDays](#state_recoverywindowindays_yaml) Number

Number of days that AWS Secrets Manager waits before it can delete the secret. This value can be `0` to force deletion without recovery or range from `7` to `30` days. The default value is `30`.

[region](#state_region_yaml) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[replicas](#state_replicas_yaml) [List<Property Map>](#secretreplica)

Configuration block to support secret replication. See details below.

[tags](#state_tags_yaml) Map<String>

Key-value map of user-defined tags that are attached to the secret. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tagsAll](#state_tagsall_yaml) Map<String>

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

## Supporting Types[](#supporting-types)

#### SecretReplica

, SecretReplicaArgs

[](#secretreplica)

[Region](#region_csharp) This property is required. string

Region for replicating the secret.

[KmsKeyId](#kmskeyid_csharp) string

ARN, Key ID, or Alias of the AWS KMS key within the region secret is replicated to. If one is not specified, then Secrets Manager defaults to using the AWS account's default KMS key (`aws/secretsmanager`) in the region or creates one for use if non-existent.

[LastAccessedDate](#lastaccesseddate_csharp) string

Date that you last accessed the secret in the Region.

[Status](#status_csharp) string

Status can be `InProgress`, `Failed`, or `InSync`.

[StatusMessage](#statusmessage_csharp) string

Message such as `Replication succeeded` or `Secret with this name already exists in this region`.

[Region](#region_go) This property is required. string

Region for replicating the secret.

[KmsKeyId](#kmskeyid_go) string

ARN, Key ID, or Alias of the AWS KMS key within the region secret is replicated to. If one is not specified, then Secrets Manager defaults to using the AWS account's default KMS key (`aws/secretsmanager`) in the region or creates one for use if non-existent.

[LastAccessedDate](#lastaccesseddate_go) string

Date that you last accessed the secret in the Region.

[Status](#status_go) string

Status can be `InProgress`, `Failed`, or `InSync`.

[StatusMessage](#statusmessage_go) string

Message such as `Replication succeeded` or `Secret with this name already exists in this region`.

[region](#region_hcl) This property is required. string

Region for replicating the secret.

[kms\_key\_id](#kms_key_id_hcl) string

ARN, Key ID, or Alias of the AWS KMS key within the region secret is replicated to. If one is not specified, then Secrets Manager defaults to using the AWS account's default KMS key (`aws/secretsmanager`) in the region or creates one for use if non-existent.

[last\_accessed\_date](#last_accessed_date_hcl) string

Date that you last accessed the secret in the Region.

[status](#status_hcl) string

Status can be `InProgress`, `Failed`, or `InSync`.

[status\_message](#status_message_hcl) string

Message such as `Replication succeeded` or `Secret with this name already exists in this region`.

[region](#region_java) This property is required. String

Region for replicating the secret.

[kmsKeyId](#kmskeyid_java) String

ARN, Key ID, or Alias of the AWS KMS key within the region secret is replicated to. If one is not specified, then Secrets Manager defaults to using the AWS account's default KMS key (`aws/secretsmanager`) in the region or creates one for use if non-existent.

[lastAccessedDate](#lastaccesseddate_java) String

Date that you last accessed the secret in the Region.

[status](#status_java) String

Status can be `InProgress`, `Failed`, or `InSync`.

[statusMessage](#statusmessage_java) String

Message such as `Replication succeeded` or `Secret with this name already exists in this region`.

[region](#region_nodejs) This property is required. string

Region for replicating the secret.

[kmsKeyId](#kmskeyid_nodejs) string

ARN, Key ID, or Alias of the AWS KMS key within the region secret is replicated to. If one is not specified, then Secrets Manager defaults to using the AWS account's default KMS key (`aws/secretsmanager`) in the region or creates one for use if non-existent.

[lastAccessedDate](#lastaccesseddate_nodejs) string

Date that you last accessed the secret in the Region.

[status](#status_nodejs) string

Status can be `InProgress`, `Failed`, or `InSync`.

[statusMessage](#statusmessage_nodejs) string

Message such as `Replication succeeded` or `Secret with this name already exists in this region`.

[region](#region_python) This property is required. str

Region for replicating the secret.

[kms\_key\_id](#kms_key_id_python) str

ARN, Key ID, or Alias of the AWS KMS key within the region secret is replicated to. If one is not specified, then Secrets Manager defaults to using the AWS account's default KMS key (`aws/secretsmanager`) in the region or creates one for use if non-existent.

[last\_accessed\_date](#last_accessed_date_python) str

Date that you last accessed the secret in the Region.

[status](#status_python) str

Status can be `InProgress`, `Failed`, or `InSync`.

[status\_message](#status_message_python) str

Message such as `Replication succeeded` or `Secret with this name already exists in this region`.

[region](#region_yaml) This property is required. String

Region for replicating the secret.

[kmsKeyId](#kmskeyid_yaml) String

ARN, Key ID, or Alias of the AWS KMS key within the region secret is replicated to. If one is not specified, then Secrets Manager defaults to using the AWS account's default KMS key (`aws/secretsmanager`) in the region or creates one for use if non-existent.

[lastAccessedDate](#lastaccesseddate_yaml) String

Date that you last accessed the secret in the Region.

[status](#status_yaml) String

Status can be `InProgress`, `Failed`, or `InSync`.

[statusMessage](#statusmessage_yaml) String

Message such as `Replication succeeded` or `Secret with this name already exists in this region`.

## Import[](#import)

### Identity Schema[](#identity-schema)

#### Required[](#required)

-   `arn` (String) Amazon Resource Name (ARN) of the Secrets Manager secret.

Using `pulumi import`, import `aws.secretsmanager.Secret` using the secret Amazon Resource Name (ARN). For example:

```bash
$ pulumi import aws:secretsmanager/secret:Secret example arn:aws:secretsmanager:us-east-1:123456789012:secret:example-123456
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

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2fsecretsmanager%2fsecret]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2fsecretsmanager%2fsecret%2f\))

#### Try Pulumi Cloud free.
Your team will thank you.

[Start free trial](https://app.pulumi.com/signup?utm_source=registry&utm_medium=right-rail-banner&utm_campaign=try-pulumi-cloud&iaid=docs-try-pulumi-cloud-ad)
