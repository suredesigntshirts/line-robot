---
Source: https://www.pulumi.com/registry/packages/aws/api-docs/cloudwatch/loggroup/
Generated: 2026-06-06
Updated: 2026-06-06
---

# aws.cloudwatch.LogGroup

1.  [Packages](/registry/)
2.  [Packages](/registry/packages/)
3.  [AWS](/registry/packages/aws/)
4.  [API Docs](/registry/packages/aws/api-docs/)
5.  [cloudwatch](/registry/packages/aws/api-docs/cloudwatch/)
6.  [LogGroup](/registry/packages/aws/api-docs/cloudwatch/loggroup/)

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

Viewing docs for AWS v7.32.0
published on Friday, May 29, 2026 by Pulumi

[Schema (JSON)](/registry/packages/aws/schema.json)

[pulumi/pulumi-aws](https://github.com/pulumi/pulumi-aws)

v7.32.0 (7.x, latest)v6.83.1 (6.x)v5.43.0 (5.x)

# aws.cloudwatch.LogGroup[](#aws-cloudwatch-loggroup)

Explore with Neo

-   Copy Page

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2fcloudwatch%2floggroup]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2fcloudwatch%2floggroup%2f\))

Provides a CloudWatch Log Group resource.

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

const yada = new aws.cloudwatch.LogGroup("yada", {
    name: "Yada",
    tags: {
        Environment: "production",
        Application: "serviceA",
    },
});
```

```python
import pulumi
import pulumi_aws as aws

yada = aws.cloudwatch.LogGroup("yada",
    name="Yada",
    tags={
        "Environment": "production",
        "Application": "serviceA",
    })
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/cloudwatch"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		_, err := cloudwatch.NewLogGroup(ctx, "yada", &cloudwatch.LogGroupArgs{
			Name: pulumi.String("Yada"),
			Tags: pulumi.StringMap{
				"Environment": pulumi.String("production"),
				"Application": pulumi.String("serviceA"),
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
    var yada = new Aws.CloudWatch.LogGroup("yada", new()
    {
        Name = "Yada",
        Tags =
        {
            { "Environment", "production" },
            { "Application", "serviceA" },
        },
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.cloudwatch.LogGroup;
import com.pulumi.aws.cloudwatch.LogGroupArgs;
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
        var yada = new LogGroup("yada", LogGroupArgs.builder()
            .name("Yada")
            .tags(Map.ofEntries(
                Map.entry("Environment", "production"),
                Map.entry("Application", "serviceA")
            ))
            .build());

    }
}
```

```yaml
resources:
  yada:
    type: aws:cloudwatch:LogGroup
    properties:
      name: Yada
      tags:
        Environment: production
        Application: serviceA
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_cloudwatch_loggroup" "yada" {
  name = "Yada"
  tags = {
    "Environment" = "production"
    "Application" = "serviceA"
  }
}
```

## Create LogGroup Resource[](#create)

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
new LogGroup(name: string, args?: LogGroupArgs, opts?: CustomResourceOptions);
```

```python
@overload
def LogGroup(resource_name: str,
             args: Optional[LogGroupArgs] = None,
             opts: Optional[ResourceOptions] = None)

@overload
def LogGroup(resource_name: str,
             opts: Optional[ResourceOptions] = None,
             deletion_protection_enabled: Optional[bool] = None,
             kms_key_id: Optional[str] = None,
             log_group_class: Optional[str] = None,
             name: Optional[str] = None,
             name_prefix: Optional[str] = None,
             region: Optional[str] = None,
             retention_in_days: Optional[int] = None,
             skip_destroy: Optional[bool] = None,
             tags: Optional[Mapping[str, str]] = None)
```

```go
func NewLogGroup(ctx *Context, name string, args *LogGroupArgs, opts ...ResourceOption) (*LogGroup, error)
```

```csharp
public LogGroup(string name, LogGroupArgs? args = null, CustomResourceOptions? opts = null)
```

```java
public LogGroup(String name, LogGroupArgs args)
public LogGroup(String name, LogGroupArgs args, CustomResourceOptions options)
```

```yaml
type: aws:cloudwatch:LogGroup
properties: # The arguments to resource properties.
options: # Bag of options to control resource's behavior.
```

```hcl
resource "aws_cloudwatch_loggroup" "name" {
    # resource properties
}
```

#### Parameters[](#parameters)

name This property is required. string

The unique name of the resource.

args [LogGroupArgs](#inputs)

The arguments to resource properties.

opts [CustomResourceOptions](/docs/reference/pkg/nodejs/pulumi/pulumi/#CustomResourceOptions)

Bag of options to control resource's behavior.

resource\_name This property is required. str

The unique name of the resource.

args [LogGroupArgs](#inputs)

The arguments to resource properties.

opts [ResourceOptions](/docs/reference/pkg/python/pulumi/#pulumi.ResourceOptions)

Bag of options to control resource's behavior.

ctx [Context](https://pkg.go.dev/github.com/pulumi/pulumi/sdk/v3/go/pulumi?tab=doc#Context)

Context object for the current deployment.

name This property is required. string

The unique name of the resource.

args [LogGroupArgs](#inputs)

The arguments to resource properties.

opts [ResourceOption](https://pkg.go.dev/github.com/pulumi/pulumi/sdk/v3/go/pulumi?tab=doc#ResourceOption)

Bag of options to control resource's behavior.

name This property is required. string

The unique name of the resource.

args [LogGroupArgs](#inputs)

The arguments to resource properties.

opts [CustomResourceOptions](/docs/reference/pkg/dotnet/Pulumi/Pulumi.CustomResourceOptions.html)

Bag of options to control resource's behavior.

name This property is required. String

The unique name of the resource.

args This property is required. [LogGroupArgs](#inputs)

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
var logGroupResource = new Aws.CloudWatch.LogGroup("logGroupResource", new()
{
    DeletionProtectionEnabled = false,
    KmsKeyId = "string",
    LogGroupClass = "string",
    Name = "string",
    NamePrefix = "string",
    Region = "string",
    RetentionInDays = 0,
    SkipDestroy = false,
    Tags =
    {
        { "string", "string" },
    },
});
```

```go
example, err := cloudwatch.NewLogGroup(ctx, "logGroupResource", &cloudwatch.LogGroupArgs{
	DeletionProtectionEnabled: pulumi.Bool(false),
	KmsKeyId:                  pulumi.String("string"),
	LogGroupClass:             pulumi.String("string"),
	Name:                      pulumi.String("string"),
	NamePrefix:                pulumi.String("string"),
	Region:                    pulumi.String("string"),
	RetentionInDays:           pulumi.Int(0),
	SkipDestroy:               pulumi.Bool(false),
	Tags: pulumi.StringMap{
		"string": pulumi.String("string"),
	},
})
```

```hcl
resource "aws_cloudwatch_loggroup" "logGroupResource" {
  deletion_protection_enabled = false
  kms_key_id                  = "string"
  log_group_class             = "string"
  name                        = "string"
  name_prefix                 = "string"
  region                      = "string"
  retention_in_days           = 0
  skip_destroy                = false
  tags = {
    "string" = "string"
  }
}
```

```java
var logGroupResource = new LogGroup("logGroupResource", LogGroupArgs.builder()
    .deletionProtectionEnabled(false)
    .kmsKeyId("string")
    .logGroupClass("string")
    .name("string")
    .namePrefix("string")
    .region("string")
    .retentionInDays(0)
    .skipDestroy(false)
    .tags(Map.of("string", "string"))
    .build());
```

```python
log_group_resource = aws.cloudwatch.LogGroup("logGroupResource",
    deletion_protection_enabled=False,
    kms_key_id="string",
    log_group_class="string",
    name="string",
    name_prefix="string",
    region="string",
    retention_in_days=0,
    skip_destroy=False,
    tags={
        "string": "string",
    })
```

```typescript
const logGroupResource = new aws.cloudwatch.LogGroup("logGroupResource", {
    deletionProtectionEnabled: false,
    kmsKeyId: "string",
    logGroupClass: "string",
    name: "string",
    namePrefix: "string",
    region: "string",
    retentionInDays: 0,
    skipDestroy: false,
    tags: {
        string: "string",
    },
});
```

```yaml
type: aws:cloudwatch:LogGroup
properties:
    deletionProtectionEnabled: false
    kmsKeyId: string
    logGroupClass: string
    name: string
    namePrefix: string
    region: string
    retentionInDays: 0
    skipDestroy: false
    tags:
        string: string
```

## LogGroup Resource Properties[](#properties)

To learn more about resource properties and how to use them, see [Inputs and Outputs](/docs/intro/concepts/inputs-outputs) in the Architecture and Concepts docs.

### Inputs[](#inputs)

In Python, inputs that are objects can be passed either as [argument classes or as dictionary literals](/docs/languages-sdks/python/#inputs-and-outputs).

The LogGroup resource accepts the following [input](/docs/intro/concepts/inputs-outputs) properties:

[DeletionProtectionEnabled](#deletionprotectionenabled_csharp) bool

Boolean to indicate whether deletion protection is enabled. Defaults to `false`. Once set, switching to `false` requires explicitly specifying `false` rather than removing this argument.

[KmsKeyId](#kmskeyid_csharp) string

The ARN of the KMS Key to use when encrypting log data. Please note, after the AWS KMS CMK is disassociated from the log group, AWS CloudWatch Logs stops encrypting newly ingested data for the log group. All previously ingested data remains encrypted, and AWS CloudWatch Logs requires permissions for the CMK whenever the encrypted data is requested.

[LogGroupClass](#loggroupclass_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Specified the log class of the log group. Possible values are: `STANDARD`, `INFREQUENT_ACCESS`, or `DELIVERY`.

[Name](#name_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

The name of the log group. If omitted, this provider will assign a random, unique name.

[NamePrefix](#nameprefix_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[Region](#region_csharp) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[RetentionInDays](#retentionindays_csharp) int

Specifies the number of days you want to retain log events in the specified log group. Possible values are: 1, 3, 5, 7, 14, 30, 60, 90, 120, 150, 180, 365, 400, 545, 731, 1096, 1827, 2192, 2557, 2922, 3288, 3653, and 0. If you select 0, the events in the log group are always retained and never expire. If `logGroupClass` is set to `DELIVERY`, this argument is ignored and `retentionInDays` is forcibly set to 2.

[SkipDestroy](#skipdestroy_csharp) bool

Set to true if you do not wish the log group (and any logs it may contain) to be deleted at destroy time, and instead just remove the log group from the state.

[Tags](#tags_csharp) Dictionary<string, string>

A map of tags to assign to the resource. .If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[DeletionProtectionEnabled](#deletionprotectionenabled_go) bool

Boolean to indicate whether deletion protection is enabled. Defaults to `false`. Once set, switching to `false` requires explicitly specifying `false` rather than removing this argument.

[KmsKeyId](#kmskeyid_go) string

The ARN of the KMS Key to use when encrypting log data. Please note, after the AWS KMS CMK is disassociated from the log group, AWS CloudWatch Logs stops encrypting newly ingested data for the log group. All previously ingested data remains encrypted, and AWS CloudWatch Logs requires permissions for the CMK whenever the encrypted data is requested.

[LogGroupClass](#loggroupclass_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Specified the log class of the log group. Possible values are: `STANDARD`, `INFREQUENT_ACCESS`, or `DELIVERY`.

[Name](#name_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

The name of the log group. If omitted, this provider will assign a random, unique name.

[NamePrefix](#nameprefix_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[Region](#region_go) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[RetentionInDays](#retentionindays_go) int

Specifies the number of days you want to retain log events in the specified log group. Possible values are: 1, 3, 5, 7, 14, 30, 60, 90, 120, 150, 180, 365, 400, 545, 731, 1096, 1827, 2192, 2557, 2922, 3288, 3653, and 0. If you select 0, the events in the log group are always retained and never expire. If `logGroupClass` is set to `DELIVERY`, this argument is ignored and `retentionInDays` is forcibly set to 2.

[SkipDestroy](#skipdestroy_go) bool

Set to true if you do not wish the log group (and any logs it may contain) to be deleted at destroy time, and instead just remove the log group from the state.

[Tags](#tags_go) map\[string\]string

A map of tags to assign to the resource. .If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[deletion\_protection\_enabled](#deletion_protection_enabled_hcl) bool

Boolean to indicate whether deletion protection is enabled. Defaults to `false`. Once set, switching to `false` requires explicitly specifying `false` rather than removing this argument.

[kms\_key\_id](#kms_key_id_hcl) string

The ARN of the KMS Key to use when encrypting log data. Please note, after the AWS KMS CMK is disassociated from the log group, AWS CloudWatch Logs stops encrypting newly ingested data for the log group. All previously ingested data remains encrypted, and AWS CloudWatch Logs requires permissions for the CMK whenever the encrypted data is requested.

[log\_group\_class](#log_group_class_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Specified the log class of the log group. Possible values are: `STANDARD`, `INFREQUENT_ACCESS`, or `DELIVERY`.

[name](#name_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

The name of the log group. If omitted, this provider will assign a random, unique name.

[name\_prefix](#name_prefix_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[region](#region_hcl) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[retention\_in\_days](#retention_in_days_hcl) number

Specifies the number of days you want to retain log events in the specified log group. Possible values are: 1, 3, 5, 7, 14, 30, 60, 90, 120, 150, 180, 365, 400, 545, 731, 1096, 1827, 2192, 2557, 2922, 3288, 3653, and 0. If you select 0, the events in the log group are always retained and never expire. If `logGroupClass` is set to `DELIVERY`, this argument is ignored and `retentionInDays` is forcibly set to 2.

[skip\_destroy](#skip_destroy_hcl) bool

Set to true if you do not wish the log group (and any logs it may contain) to be deleted at destroy time, and instead just remove the log group from the state.

[tags](#tags_hcl) map(string)

A map of tags to assign to the resource. .If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[deletionProtectionEnabled](#deletionprotectionenabled_java) Boolean

Boolean to indicate whether deletion protection is enabled. Defaults to `false`. Once set, switching to `false` requires explicitly specifying `false` rather than removing this argument.

[kmsKeyId](#kmskeyid_java) String

The ARN of the KMS Key to use when encrypting log data. Please note, after the AWS KMS CMK is disassociated from the log group, AWS CloudWatch Logs stops encrypting newly ingested data for the log group. All previously ingested data remains encrypted, and AWS CloudWatch Logs requires permissions for the CMK whenever the encrypted data is requested.

[logGroupClass](#loggroupclass_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Specified the log class of the log group. Possible values are: `STANDARD`, `INFREQUENT_ACCESS`, or `DELIVERY`.

[name](#name_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

The name of the log group. If omitted, this provider will assign a random, unique name.

[namePrefix](#nameprefix_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[region](#region_java) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[retentionInDays](#retentionindays_java) Integer

Specifies the number of days you want to retain log events in the specified log group. Possible values are: 1, 3, 5, 7, 14, 30, 60, 90, 120, 150, 180, 365, 400, 545, 731, 1096, 1827, 2192, 2557, 2922, 3288, 3653, and 0. If you select 0, the events in the log group are always retained and never expire. If `logGroupClass` is set to `DELIVERY`, this argument is ignored and `retentionInDays` is forcibly set to 2.

[skipDestroy](#skipdestroy_java) Boolean

Set to true if you do not wish the log group (and any logs it may contain) to be deleted at destroy time, and instead just remove the log group from the state.

[tags](#tags_java) Map<String,String>

A map of tags to assign to the resource. .If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[deletionProtectionEnabled](#deletionprotectionenabled_nodejs) boolean

Boolean to indicate whether deletion protection is enabled. Defaults to `false`. Once set, switching to `false` requires explicitly specifying `false` rather than removing this argument.

[kmsKeyId](#kmskeyid_nodejs) string

The ARN of the KMS Key to use when encrypting log data. Please note, after the AWS KMS CMK is disassociated from the log group, AWS CloudWatch Logs stops encrypting newly ingested data for the log group. All previously ingested data remains encrypted, and AWS CloudWatch Logs requires permissions for the CMK whenever the encrypted data is requested.

[logGroupClass](#loggroupclass_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Specified the log class of the log group. Possible values are: `STANDARD`, `INFREQUENT_ACCESS`, or `DELIVERY`.

[name](#name_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

The name of the log group. If omitted, this provider will assign a random, unique name.

[namePrefix](#nameprefix_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[region](#region_nodejs) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[retentionInDays](#retentionindays_nodejs) number

Specifies the number of days you want to retain log events in the specified log group. Possible values are: 1, 3, 5, 7, 14, 30, 60, 90, 120, 150, 180, 365, 400, 545, 731, 1096, 1827, 2192, 2557, 2922, 3288, 3653, and 0. If you select 0, the events in the log group are always retained and never expire. If `logGroupClass` is set to `DELIVERY`, this argument is ignored and `retentionInDays` is forcibly set to 2.

[skipDestroy](#skipdestroy_nodejs) boolean

Set to true if you do not wish the log group (and any logs it may contain) to be deleted at destroy time, and instead just remove the log group from the state.

[tags](#tags_nodejs) {\[key: string\]: string}

A map of tags to assign to the resource. .If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[deletion\_protection\_enabled](#deletion_protection_enabled_python) bool

Boolean to indicate whether deletion protection is enabled. Defaults to `false`. Once set, switching to `false` requires explicitly specifying `false` rather than removing this argument.

[kms\_key\_id](#kms_key_id_python) str

The ARN of the KMS Key to use when encrypting log data. Please note, after the AWS KMS CMK is disassociated from the log group, AWS CloudWatch Logs stops encrypting newly ingested data for the log group. All previously ingested data remains encrypted, and AWS CloudWatch Logs requires permissions for the CMK whenever the encrypted data is requested.

[log\_group\_class](#log_group_class_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Specified the log class of the log group. Possible values are: `STANDARD`, `INFREQUENT_ACCESS`, or `DELIVERY`.

[name](#name_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

The name of the log group. If omitted, this provider will assign a random, unique name.

[name\_prefix](#name_prefix_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[region](#region_python) str

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[retention\_in\_days](#retention_in_days_python) int

Specifies the number of days you want to retain log events in the specified log group. Possible values are: 1, 3, 5, 7, 14, 30, 60, 90, 120, 150, 180, 365, 400, 545, 731, 1096, 1827, 2192, 2557, 2922, 3288, 3653, and 0. If you select 0, the events in the log group are always retained and never expire. If `logGroupClass` is set to `DELIVERY`, this argument is ignored and `retentionInDays` is forcibly set to 2.

[skip\_destroy](#skip_destroy_python) bool

Set to true if you do not wish the log group (and any logs it may contain) to be deleted at destroy time, and instead just remove the log group from the state.

[tags](#tags_python) Mapping\[str, str\]

A map of tags to assign to the resource. .If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[deletionProtectionEnabled](#deletionprotectionenabled_yaml) Boolean

Boolean to indicate whether deletion protection is enabled. Defaults to `false`. Once set, switching to `false` requires explicitly specifying `false` rather than removing this argument.

[kmsKeyId](#kmskeyid_yaml) String

The ARN of the KMS Key to use when encrypting log data. Please note, after the AWS KMS CMK is disassociated from the log group, AWS CloudWatch Logs stops encrypting newly ingested data for the log group. All previously ingested data remains encrypted, and AWS CloudWatch Logs requires permissions for the CMK whenever the encrypted data is requested.

[logGroupClass](#loggroupclass_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Specified the log class of the log group. Possible values are: `STANDARD`, `INFREQUENT_ACCESS`, or `DELIVERY`.

[name](#name_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

The name of the log group. If omitted, this provider will assign a random, unique name.

[namePrefix](#nameprefix_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[region](#region_yaml) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[retentionInDays](#retentionindays_yaml) Number

Specifies the number of days you want to retain log events in the specified log group. Possible values are: 1, 3, 5, 7, 14, 30, 60, 90, 120, 150, 180, 365, 400, 545, 731, 1096, 1827, 2192, 2557, 2922, 3288, 3653, and 0. If you select 0, the events in the log group are always retained and never expire. If `logGroupClass` is set to `DELIVERY`, this argument is ignored and `retentionInDays` is forcibly set to 2.

[skipDestroy](#skipdestroy_yaml) Boolean

Set to true if you do not wish the log group (and any logs it may contain) to be deleted at destroy time, and instead just remove the log group from the state.

[tags](#tags_yaml) Map<String>

A map of tags to assign to the resource. .If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

### Outputs[](#outputs)

All [input](#inputs) properties are implicitly available as output properties. Additionally, the LogGroup resource produces the following output properties:

[Arn](#arn_csharp) string

The Amazon Resource Name (ARN) specifying the log group. Any `:*` suffix added by the API, denoting all CloudWatch Log Streams under the CloudWatch Log Group, is removed for greater compatibility with other AWS services that do not accept the suffix.

[Id](#id_csharp) string

The provider-assigned unique ID for this managed resource.

[TagsAll](#tagsall_csharp) Dictionary<string, string>

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[Arn](#arn_go) string

The Amazon Resource Name (ARN) specifying the log group. Any `:*` suffix added by the API, denoting all CloudWatch Log Streams under the CloudWatch Log Group, is removed for greater compatibility with other AWS services that do not accept the suffix.

[Id](#id_go) string

The provider-assigned unique ID for this managed resource.

[TagsAll](#tagsall_go) map\[string\]string

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[arn](#arn_hcl) string

The Amazon Resource Name (ARN) specifying the log group. Any `:*` suffix added by the API, denoting all CloudWatch Log Streams under the CloudWatch Log Group, is removed for greater compatibility with other AWS services that do not accept the suffix.

[id](#id_hcl) string

The provider-assigned unique ID for this managed resource.

[tags\_all](#tags_all_hcl) map(string)

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[arn](#arn_java) String

The Amazon Resource Name (ARN) specifying the log group. Any `:*` suffix added by the API, denoting all CloudWatch Log Streams under the CloudWatch Log Group, is removed for greater compatibility with other AWS services that do not accept the suffix.

[id](#id_java) String

The provider-assigned unique ID for this managed resource.

[tagsAll](#tagsall_java) Map<String,String>

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[arn](#arn_nodejs) string

The Amazon Resource Name (ARN) specifying the log group. Any `:*` suffix added by the API, denoting all CloudWatch Log Streams under the CloudWatch Log Group, is removed for greater compatibility with other AWS services that do not accept the suffix.

[id](#id_nodejs) string

The provider-assigned unique ID for this managed resource.

[tagsAll](#tagsall_nodejs) {\[key: string\]: string}

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[arn](#arn_python) str

The Amazon Resource Name (ARN) specifying the log group. Any `:*` suffix added by the API, denoting all CloudWatch Log Streams under the CloudWatch Log Group, is removed for greater compatibility with other AWS services that do not accept the suffix.

[id](#id_python) str

The provider-assigned unique ID for this managed resource.

[tags\_all](#tags_all_python) Mapping\[str, str\]

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[arn](#arn_yaml) String

The Amazon Resource Name (ARN) specifying the log group. Any `:*` suffix added by the API, denoting all CloudWatch Log Streams under the CloudWatch Log Group, is removed for greater compatibility with other AWS services that do not accept the suffix.

[id](#id_yaml) String

The provider-assigned unique ID for this managed resource.

[tagsAll](#tagsall_yaml) Map<String>

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

## Look up Existing LogGroup Resource[](#look-up)

Get an existing LogGroup resource’s state with the given name, ID, and optional extra properties used to qualify the lookup.

-   TypeScript
-   Python
-   Go
-   C#
-   Java
-   YAML
-   HCL PREVIEW

```typescript
public static get(name: string, id: Input<ID>, state?: LogGroupState, opts?: CustomResourceOptions): LogGroup
```

```python
@staticmethod
def get(resource_name: str,
        id: str,
        opts: Optional[ResourceOptions] = None,
        arn: Optional[str] = None,
        deletion_protection_enabled: Optional[bool] = None,
        kms_key_id: Optional[str] = None,
        log_group_class: Optional[str] = None,
        name: Optional[str] = None,
        name_prefix: Optional[str] = None,
        region: Optional[str] = None,
        retention_in_days: Optional[int] = None,
        skip_destroy: Optional[bool] = None,
        tags: Optional[Mapping[str, str]] = None,
        tags_all: Optional[Mapping[str, str]] = None) -> LogGroup
```

```go
func GetLogGroup(ctx *Context, name string, id IDInput, state *LogGroupState, opts ...ResourceOption) (*LogGroup, error)
```

```csharp
public static LogGroup Get(string name, Input<string> id, LogGroupState? state, CustomResourceOptions? opts = null)
```

```java
public static LogGroup get(String name, Output<String> id, LogGroupState state, CustomResourceOptions options)
```

```yaml
resources:  _:    type: aws:cloudwatch:LogGroup    get:      id: ${id}
```

```hcl
import {
  to = aws_cloudwatch_loggroup.example
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

The Amazon Resource Name (ARN) specifying the log group. Any `:*` suffix added by the API, denoting all CloudWatch Log Streams under the CloudWatch Log Group, is removed for greater compatibility with other AWS services that do not accept the suffix.

[DeletionProtectionEnabled](#state_deletionprotectionenabled_csharp) bool

Boolean to indicate whether deletion protection is enabled. Defaults to `false`. Once set, switching to `false` requires explicitly specifying `false` rather than removing this argument.

[KmsKeyId](#state_kmskeyid_csharp) string

The ARN of the KMS Key to use when encrypting log data. Please note, after the AWS KMS CMK is disassociated from the log group, AWS CloudWatch Logs stops encrypting newly ingested data for the log group. All previously ingested data remains encrypted, and AWS CloudWatch Logs requires permissions for the CMK whenever the encrypted data is requested.

[LogGroupClass](#state_loggroupclass_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Specified the log class of the log group. Possible values are: `STANDARD`, `INFREQUENT_ACCESS`, or `DELIVERY`.

[Name](#state_name_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

The name of the log group. If omitted, this provider will assign a random, unique name.

[NamePrefix](#state_nameprefix_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[Region](#state_region_csharp) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[RetentionInDays](#state_retentionindays_csharp) int

Specifies the number of days you want to retain log events in the specified log group. Possible values are: 1, 3, 5, 7, 14, 30, 60, 90, 120, 150, 180, 365, 400, 545, 731, 1096, 1827, 2192, 2557, 2922, 3288, 3653, and 0. If you select 0, the events in the log group are always retained and never expire. If `logGroupClass` is set to `DELIVERY`, this argument is ignored and `retentionInDays` is forcibly set to 2.

[SkipDestroy](#state_skipdestroy_csharp) bool

Set to true if you do not wish the log group (and any logs it may contain) to be deleted at destroy time, and instead just remove the log group from the state.

[Tags](#state_tags_csharp) Dictionary<string, string>

A map of tags to assign to the resource. .If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[TagsAll](#state_tagsall_csharp) Dictionary<string, string>

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[Arn](#state_arn_go) string

The Amazon Resource Name (ARN) specifying the log group. Any `:*` suffix added by the API, denoting all CloudWatch Log Streams under the CloudWatch Log Group, is removed for greater compatibility with other AWS services that do not accept the suffix.

[DeletionProtectionEnabled](#state_deletionprotectionenabled_go) bool

Boolean to indicate whether deletion protection is enabled. Defaults to `false`. Once set, switching to `false` requires explicitly specifying `false` rather than removing this argument.

[KmsKeyId](#state_kmskeyid_go) string

The ARN of the KMS Key to use when encrypting log data. Please note, after the AWS KMS CMK is disassociated from the log group, AWS CloudWatch Logs stops encrypting newly ingested data for the log group. All previously ingested data remains encrypted, and AWS CloudWatch Logs requires permissions for the CMK whenever the encrypted data is requested.

[LogGroupClass](#state_loggroupclass_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Specified the log class of the log group. Possible values are: `STANDARD`, `INFREQUENT_ACCESS`, or `DELIVERY`.

[Name](#state_name_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

The name of the log group. If omitted, this provider will assign a random, unique name.

[NamePrefix](#state_nameprefix_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[Region](#state_region_go) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[RetentionInDays](#state_retentionindays_go) int

Specifies the number of days you want to retain log events in the specified log group. Possible values are: 1, 3, 5, 7, 14, 30, 60, 90, 120, 150, 180, 365, 400, 545, 731, 1096, 1827, 2192, 2557, 2922, 3288, 3653, and 0. If you select 0, the events in the log group are always retained and never expire. If `logGroupClass` is set to `DELIVERY`, this argument is ignored and `retentionInDays` is forcibly set to 2.

[SkipDestroy](#state_skipdestroy_go) bool

Set to true if you do not wish the log group (and any logs it may contain) to be deleted at destroy time, and instead just remove the log group from the state.

[Tags](#state_tags_go) map\[string\]string

A map of tags to assign to the resource. .If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[TagsAll](#state_tagsall_go) map\[string\]string

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[arn](#state_arn_hcl) string

The Amazon Resource Name (ARN) specifying the log group. Any `:*` suffix added by the API, denoting all CloudWatch Log Streams under the CloudWatch Log Group, is removed for greater compatibility with other AWS services that do not accept the suffix.

[deletion\_protection\_enabled](#state_deletion_protection_enabled_hcl) bool

Boolean to indicate whether deletion protection is enabled. Defaults to `false`. Once set, switching to `false` requires explicitly specifying `false` rather than removing this argument.

[kms\_key\_id](#state_kms_key_id_hcl) string

The ARN of the KMS Key to use when encrypting log data. Please note, after the AWS KMS CMK is disassociated from the log group, AWS CloudWatch Logs stops encrypting newly ingested data for the log group. All previously ingested data remains encrypted, and AWS CloudWatch Logs requires permissions for the CMK whenever the encrypted data is requested.

[log\_group\_class](#state_log_group_class_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Specified the log class of the log group. Possible values are: `STANDARD`, `INFREQUENT_ACCESS`, or `DELIVERY`.

[name](#state_name_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

The name of the log group. If omitted, this provider will assign a random, unique name.

[name\_prefix](#state_name_prefix_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[region](#state_region_hcl) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[retention\_in\_days](#state_retention_in_days_hcl) number

Specifies the number of days you want to retain log events in the specified log group. Possible values are: 1, 3, 5, 7, 14, 30, 60, 90, 120, 150, 180, 365, 400, 545, 731, 1096, 1827, 2192, 2557, 2922, 3288, 3653, and 0. If you select 0, the events in the log group are always retained and never expire. If `logGroupClass` is set to `DELIVERY`, this argument is ignored and `retentionInDays` is forcibly set to 2.

[skip\_destroy](#state_skip_destroy_hcl) bool

Set to true if you do not wish the log group (and any logs it may contain) to be deleted at destroy time, and instead just remove the log group from the state.

[tags](#state_tags_hcl) map(string)

A map of tags to assign to the resource. .If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tags\_all](#state_tags_all_hcl) map(string)

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[arn](#state_arn_java) String

The Amazon Resource Name (ARN) specifying the log group. Any `:*` suffix added by the API, denoting all CloudWatch Log Streams under the CloudWatch Log Group, is removed for greater compatibility with other AWS services that do not accept the suffix.

[deletionProtectionEnabled](#state_deletionprotectionenabled_java) Boolean

Boolean to indicate whether deletion protection is enabled. Defaults to `false`. Once set, switching to `false` requires explicitly specifying `false` rather than removing this argument.

[kmsKeyId](#state_kmskeyid_java) String

The ARN of the KMS Key to use when encrypting log data. Please note, after the AWS KMS CMK is disassociated from the log group, AWS CloudWatch Logs stops encrypting newly ingested data for the log group. All previously ingested data remains encrypted, and AWS CloudWatch Logs requires permissions for the CMK whenever the encrypted data is requested.

[logGroupClass](#state_loggroupclass_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Specified the log class of the log group. Possible values are: `STANDARD`, `INFREQUENT_ACCESS`, or `DELIVERY`.

[name](#state_name_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

The name of the log group. If omitted, this provider will assign a random, unique name.

[namePrefix](#state_nameprefix_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[region](#state_region_java) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[retentionInDays](#state_retentionindays_java) Integer

Specifies the number of days you want to retain log events in the specified log group. Possible values are: 1, 3, 5, 7, 14, 30, 60, 90, 120, 150, 180, 365, 400, 545, 731, 1096, 1827, 2192, 2557, 2922, 3288, 3653, and 0. If you select 0, the events in the log group are always retained and never expire. If `logGroupClass` is set to `DELIVERY`, this argument is ignored and `retentionInDays` is forcibly set to 2.

[skipDestroy](#state_skipdestroy_java) Boolean

Set to true if you do not wish the log group (and any logs it may contain) to be deleted at destroy time, and instead just remove the log group from the state.

[tags](#state_tags_java) Map<String,String>

A map of tags to assign to the resource. .If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tagsAll](#state_tagsall_java) Map<String,String>

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[arn](#state_arn_nodejs) string

The Amazon Resource Name (ARN) specifying the log group. Any `:*` suffix added by the API, denoting all CloudWatch Log Streams under the CloudWatch Log Group, is removed for greater compatibility with other AWS services that do not accept the suffix.

[deletionProtectionEnabled](#state_deletionprotectionenabled_nodejs) boolean

Boolean to indicate whether deletion protection is enabled. Defaults to `false`. Once set, switching to `false` requires explicitly specifying `false` rather than removing this argument.

[kmsKeyId](#state_kmskeyid_nodejs) string

The ARN of the KMS Key to use when encrypting log data. Please note, after the AWS KMS CMK is disassociated from the log group, AWS CloudWatch Logs stops encrypting newly ingested data for the log group. All previously ingested data remains encrypted, and AWS CloudWatch Logs requires permissions for the CMK whenever the encrypted data is requested.

[logGroupClass](#state_loggroupclass_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Specified the log class of the log group. Possible values are: `STANDARD`, `INFREQUENT_ACCESS`, or `DELIVERY`.

[name](#state_name_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

The name of the log group. If omitted, this provider will assign a random, unique name.

[namePrefix](#state_nameprefix_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[region](#state_region_nodejs) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[retentionInDays](#state_retentionindays_nodejs) number

Specifies the number of days you want to retain log events in the specified log group. Possible values are: 1, 3, 5, 7, 14, 30, 60, 90, 120, 150, 180, 365, 400, 545, 731, 1096, 1827, 2192, 2557, 2922, 3288, 3653, and 0. If you select 0, the events in the log group are always retained and never expire. If `logGroupClass` is set to `DELIVERY`, this argument is ignored and `retentionInDays` is forcibly set to 2.

[skipDestroy](#state_skipdestroy_nodejs) boolean

Set to true if you do not wish the log group (and any logs it may contain) to be deleted at destroy time, and instead just remove the log group from the state.

[tags](#state_tags_nodejs) {\[key: string\]: string}

A map of tags to assign to the resource. .If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tagsAll](#state_tagsall_nodejs) {\[key: string\]: string}

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[arn](#state_arn_python) str

The Amazon Resource Name (ARN) specifying the log group. Any `:*` suffix added by the API, denoting all CloudWatch Log Streams under the CloudWatch Log Group, is removed for greater compatibility with other AWS services that do not accept the suffix.

[deletion\_protection\_enabled](#state_deletion_protection_enabled_python) bool

Boolean to indicate whether deletion protection is enabled. Defaults to `false`. Once set, switching to `false` requires explicitly specifying `false` rather than removing this argument.

[kms\_key\_id](#state_kms_key_id_python) str

The ARN of the KMS Key to use when encrypting log data. Please note, after the AWS KMS CMK is disassociated from the log group, AWS CloudWatch Logs stops encrypting newly ingested data for the log group. All previously ingested data remains encrypted, and AWS CloudWatch Logs requires permissions for the CMK whenever the encrypted data is requested.

[log\_group\_class](#state_log_group_class_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Specified the log class of the log group. Possible values are: `STANDARD`, `INFREQUENT_ACCESS`, or `DELIVERY`.

[name](#state_name_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

The name of the log group. If omitted, this provider will assign a random, unique name.

[name\_prefix](#state_name_prefix_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[region](#state_region_python) str

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[retention\_in\_days](#state_retention_in_days_python) int

Specifies the number of days you want to retain log events in the specified log group. Possible values are: 1, 3, 5, 7, 14, 30, 60, 90, 120, 150, 180, 365, 400, 545, 731, 1096, 1827, 2192, 2557, 2922, 3288, 3653, and 0. If you select 0, the events in the log group are always retained and never expire. If `logGroupClass` is set to `DELIVERY`, this argument is ignored and `retentionInDays` is forcibly set to 2.

[skip\_destroy](#state_skip_destroy_python) bool

Set to true if you do not wish the log group (and any logs it may contain) to be deleted at destroy time, and instead just remove the log group from the state.

[tags](#state_tags_python) Mapping\[str, str\]

A map of tags to assign to the resource. .If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tags\_all](#state_tags_all_python) Mapping\[str, str\]

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[arn](#state_arn_yaml) String

The Amazon Resource Name (ARN) specifying the log group. Any `:*` suffix added by the API, denoting all CloudWatch Log Streams under the CloudWatch Log Group, is removed for greater compatibility with other AWS services that do not accept the suffix.

[deletionProtectionEnabled](#state_deletionprotectionenabled_yaml) Boolean

Boolean to indicate whether deletion protection is enabled. Defaults to `false`. Once set, switching to `false` requires explicitly specifying `false` rather than removing this argument.

[kmsKeyId](#state_kmskeyid_yaml) String

The ARN of the KMS Key to use when encrypting log data. Please note, after the AWS KMS CMK is disassociated from the log group, AWS CloudWatch Logs stops encrypting newly ingested data for the log group. All previously ingested data remains encrypted, and AWS CloudWatch Logs requires permissions for the CMK whenever the encrypted data is requested.

[logGroupClass](#state_loggroupclass_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Specified the log class of the log group. Possible values are: `STANDARD`, `INFREQUENT_ACCESS`, or `DELIVERY`.

[name](#state_name_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

The name of the log group. If omitted, this provider will assign a random, unique name.

[namePrefix](#state_nameprefix_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[region](#state_region_yaml) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[retentionInDays](#state_retentionindays_yaml) Number

Specifies the number of days you want to retain log events in the specified log group. Possible values are: 1, 3, 5, 7, 14, 30, 60, 90, 120, 150, 180, 365, 400, 545, 731, 1096, 1827, 2192, 2557, 2922, 3288, 3653, and 0. If you select 0, the events in the log group are always retained and never expire. If `logGroupClass` is set to `DELIVERY`, this argument is ignored and `retentionInDays` is forcibly set to 2.

[skipDestroy](#state_skipdestroy_yaml) Boolean

Set to true if you do not wish the log group (and any logs it may contain) to be deleted at destroy time, and instead just remove the log group from the state.

[tags](#state_tags_yaml) Map<String>

A map of tags to assign to the resource. .If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tagsAll](#state_tagsall_yaml) Map<String>

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

## Import[](#import)

### Identity Schema[](#identity-schema)

#### Required[](#required)

-   `name` (String) Name of the CloudWatch log group.

#### Optional[](#optional)

-   `accountId` (String) AWS Account where this resource is managed.
-   `region` (String) Region where this resource is managed.

Using `pulumi import`, import Cloudwatch Log Groups using the `name`. For example:

```bash
$ pulumi import aws:cloudwatch/logGroup:LogGroup example yada
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

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2fcloudwatch%2floggroup]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2fcloudwatch%2floggroup%2f\))

#### Try Pulumi Cloud free.
Your team will thank you.

[Start free trial](https://app.pulumi.com/signup?utm_source=registry&utm_medium=right-rail-banner&utm_campaign=try-pulumi-cloud&iaid=docs-try-pulumi-cloud-ad)
