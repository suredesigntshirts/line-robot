---
Source: https://www.pulumi.com/registry/packages/aws/api-docs/ssm/parameter/
Generated: 2026-06-06
Updated: 2026-06-06
---

# aws.ssm.Parameter

1.  [Packages](/registry/)
2.  [Packages](/registry/packages/)
3.  [AWS](/registry/packages/aws/)
4.  [API Docs](/registry/packages/aws/api-docs/)
5.  [ssm](/registry/packages/aws/api-docs/ssm/)
6.  [Parameter](/registry/packages/aws/api-docs/ssm/parameter/)

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

Viewing docs for AWS v7.32.0
published on Friday, May 29, 2026 by Pulumi

[Schema (JSON)](/registry/packages/aws/schema.json)

[pulumi/pulumi-aws](https://github.com/pulumi/pulumi-aws)

v7.32.0 (7.x, latest)v6.83.1 (6.x)v5.43.0 (5.x)

# aws.ssm.Parameter[](#aws-ssm-parameter)

Explore with Neo

-   Copy Page

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2fssm%2fparameter]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2fssm%2fparameter%2f\))

Provides an SSM Parameter resource.

> **Note:** The `overwrite` argument makes it possible to overwrite an existing SSM Parameter created outside of IAC.

## Example Usage[](#example-usage)

### Basic example[](#basic-example)

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

const foo = new aws.ssm.Parameter("foo", {
    name: "foo",
    type: aws.ssm.ParameterType.String,
    value: "bar",
});
```

```python
import pulumi
import pulumi_aws as aws

foo = aws.ssm.Parameter("foo",
    name="foo",
    type=aws.ssm.ParameterType.STRING,
    value="bar")
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/ssm"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		_, err := ssm.NewParameter(ctx, "foo", &ssm.ParameterArgs{
			Name:  pulumi.String("foo"),
			Type:  pulumi.String(ssm.ParameterTypeString),
			Value: pulumi.String("bar"),
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
    var foo = new Aws.Ssm.Parameter("foo", new()
    {
        Name = "foo",
        Type = Aws.Ssm.ParameterType.String,
        Value = "bar",
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.ssm.Parameter;
import com.pulumi.aws.ssm.ParameterArgs;
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
        var foo = new Parameter("foo", ParameterArgs.builder()
            .name("foo")
            .type("String")
            .value("bar")
            .build());

    }
}
```

```yaml
resources:
  foo:
    type: aws:ssm:Parameter
    properties:
      name: foo
      type: String
      value: bar
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_ssm_parameter" "foo" {
  name  = "foo"
  type  = "String"
  value = "bar"
}
```

### Encrypted string using default SSM KMS key[](#encrypted-string-using-default-ssm-kms-key)

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

const _default = new aws.rds.Instance("default", {
    allocatedStorage: 10,
    storageType: aws.rds.StorageType.GP2,
    engine: "mysql",
    engineVersion: "5.7.16",
    instanceClass: aws.rds.InstanceType.T2_Micro,
    dbName: "mydb",
    username: "foo",
    password: databaseMasterPassword,
    dbSubnetGroupName: "my_database_subnet_group",
    parameterGroupName: "default.mysql5.7",
});
const secret = new aws.ssm.Parameter("secret", {
    name: "/production/database/password/master",
    description: "The parameter description",
    type: aws.ssm.ParameterType.SecureString,
    value: databaseMasterPassword,
    tags: {
        environment: "production",
    },
});
```

```python
import pulumi
import pulumi_aws as aws

default = aws.rds.Instance("default",
    allocated_storage=10,
    storage_type=aws.rds.StorageType.GP2,
    engine="mysql",
    engine_version="5.7.16",
    instance_class=aws.rds.InstanceType.T2_MICRO,
    db_name="mydb",
    username="foo",
    password=database_master_password,
    db_subnet_group_name="my_database_subnet_group",
    parameter_group_name="default.mysql5.7")
secret = aws.ssm.Parameter("secret",
    name="/production/database/password/master",
    description="The parameter description",
    type=aws.ssm.ParameterType.SECURE_STRING,
    value=database_master_password,
    tags={
        "environment": "production",
    })
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/rds"
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/ssm"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		_, err := rds.NewInstance(ctx, "default", &rds.InstanceArgs{
			AllocatedStorage:   pulumi.Int(10),
			StorageType:        pulumi.String(rds.StorageTypeGP2),
			Engine:             pulumi.String("mysql"),
			EngineVersion:      pulumi.String("5.7.16"),
			InstanceClass:      pulumi.String(rds.InstanceType_T2_Micro),
			DbName:             pulumi.String("mydb"),
			Username:           pulumi.String("foo"),
			Password:           pulumi.Any(databaseMasterPassword),
			DbSubnetGroupName:  pulumi.String("my_database_subnet_group"),
			ParameterGroupName: pulumi.String("default.mysql5.7"),
		})
		if err != nil {
			return err
		}
		_, err = ssm.NewParameter(ctx, "secret", &ssm.ParameterArgs{
			Name:        pulumi.String("/production/database/password/master"),
			Description: pulumi.String("The parameter description"),
			Type:        pulumi.String(ssm.ParameterTypeSecureString),
			Value:       pulumi.Any(databaseMasterPassword),
			Tags: pulumi.StringMap{
				"environment": pulumi.String("production"),
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
    var @default = new Aws.Rds.Instance("default", new()
    {
        AllocatedStorage = 10,
        StorageType = Aws.Rds.StorageType.GP2,
        Engine = "mysql",
        EngineVersion = "5.7.16",
        InstanceClass = Aws.Rds.InstanceType.T2_Micro,
        DbName = "mydb",
        Username = "foo",
        Password = databaseMasterPassword,
        DbSubnetGroupName = "my_database_subnet_group",
        ParameterGroupName = "default.mysql5.7",
    });

    var secret = new Aws.Ssm.Parameter("secret", new()
    {
        Name = "/production/database/password/master",
        Description = "The parameter description",
        Type = Aws.Ssm.ParameterType.SecureString,
        Value = databaseMasterPassword,
        Tags =
        {
            { "environment", "production" },
        },
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.rds.Instance;
import com.pulumi.aws.rds.InstanceArgs;
import com.pulumi.aws.ssm.Parameter;
import com.pulumi.aws.ssm.ParameterArgs;
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
        var default_ = new Instance("default", InstanceArgs.builder()
            .allocatedStorage(10)
            .storageType("gp2")
            .engine("mysql")
            .engineVersion("5.7.16")
            .instanceClass("db.t2.micro")
            .dbName("mydb")
            .username("foo")
            .password(databaseMasterPassword)
            .dbSubnetGroupName("my_database_subnet_group")
            .parameterGroupName("default.mysql5.7")
            .build());

        var secret = new Parameter("secret", ParameterArgs.builder()
            .name("/production/database/password/master")
            .description("The parameter description")
            .type("SecureString")
            .value(databaseMasterPassword)
            .tags(Map.of("environment", "production"))
            .build());

    }
}
```

```yaml
resources:
  default:
    type: aws:rds:Instance
    properties:
      allocatedStorage: 10
      storageType: gp2
      engine: mysql
      engineVersion: 5.7.16
      instanceClass: db.t2.micro
      dbName: mydb
      username: foo
      password: ${databaseMasterPassword}
      dbSubnetGroupName: my_database_subnet_group
      parameterGroupName: default.mysql5.7
  secret:
    type: aws:ssm:Parameter
    properties:
      name: /production/database/password/master
      description: The parameter description
      type: SecureString
      value: ${databaseMasterPassword}
      tags:
        environment: production
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_rds_instance" "default" {
  allocated_storage    = 10
  storage_type         = "gp2"
  engine               = "mysql"
  engine_version       = "5.7.16"
  instance_class       = "db.t2.micro"
  db_name              = "mydb"
  username             = "foo"
  password             = databaseMasterPassword
  db_subnet_group_name = "my_database_subnet_group"
  parameter_group_name = "default.mysql5.7"
}
resource "aws_ssm_parameter" "secret" {
  name        = "/production/database/password/master"
  description = "The parameter description"
  type        = "SecureString"
  value       = databaseMasterPassword
  tags = {
    "environment" = "production"
  }
}
```

## Create Parameter Resource[](#create)

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
new Parameter(name: string, args: ParameterArgs, opts?: CustomResourceOptions);
```

```python
@overload
def Parameter(resource_name: str,
              args: ParameterArgs,
              opts: Optional[ResourceOptions] = None)

@overload
def Parameter(resource_name: str,
              opts: Optional[ResourceOptions] = None,
              type: Optional[Union[str, ParameterType]] = None,
              name: Optional[str] = None,
              region: Optional[str] = None,
              description: Optional[str] = None,
              insecure_value: Optional[str] = None,
              key_id: Optional[str] = None,
              allowed_pattern: Optional[str] = None,
              overwrite: Optional[bool] = None,
              data_type: Optional[str] = None,
              tags: Optional[Mapping[str, str]] = None,
              tier: Optional[str] = None,
              arn: Optional[str] = None,
              value: Optional[str] = None,
              value_wo: Optional[str] = None,
              value_wo_version: Optional[int] = None)
```

```go
func NewParameter(ctx *Context, name string, args ParameterArgs, opts ...ResourceOption) (*Parameter, error)
```

```csharp
public Parameter(string name, ParameterArgs args, CustomResourceOptions? opts = null)
```

```java
public Parameter(String name, ParameterArgs args)
public Parameter(String name, ParameterArgs args, CustomResourceOptions options)
```

```yaml
type: aws:ssm:Parameter
properties: # The arguments to resource properties.
options: # Bag of options to control resource's behavior.
```

```hcl
resource "aws_ssm_parameter" "name" {
    # resource properties
}
```

#### Parameters[](#parameters)

name This property is required. string

The unique name of the resource.

args This property is required. [ParameterArgs](#inputs)

The arguments to resource properties.

opts [CustomResourceOptions](/docs/reference/pkg/nodejs/pulumi/pulumi/#CustomResourceOptions)

Bag of options to control resource's behavior.

resource\_name This property is required. str

The unique name of the resource.

args This property is required. [ParameterArgs](#inputs)

The arguments to resource properties.

opts [ResourceOptions](/docs/reference/pkg/python/pulumi/#pulumi.ResourceOptions)

Bag of options to control resource's behavior.

ctx [Context](https://pkg.go.dev/github.com/pulumi/pulumi/sdk/v3/go/pulumi?tab=doc#Context)

Context object for the current deployment.

name This property is required. string

The unique name of the resource.

args This property is required. [ParameterArgs](#inputs)

The arguments to resource properties.

opts [ResourceOption](https://pkg.go.dev/github.com/pulumi/pulumi/sdk/v3/go/pulumi?tab=doc#ResourceOption)

Bag of options to control resource's behavior.

name This property is required. string

The unique name of the resource.

args This property is required. [ParameterArgs](#inputs)

The arguments to resource properties.

opts [CustomResourceOptions](/docs/reference/pkg/dotnet/Pulumi/Pulumi.CustomResourceOptions.html)

Bag of options to control resource's behavior.

name This property is required. String

The unique name of the resource.

args This property is required. [ParameterArgs](#inputs)

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
var parameterResource = new Aws.Ssm.Parameter("parameterResource", new()
{
    Type = "string",
    Name = "string",
    Region = "string",
    Description = "string",
    InsecureValue = "string",
    KeyId = "string",
    AllowedPattern = "string",
    Overwrite = false,
    DataType = "string",
    Tags =
    {
        { "string", "string" },
    },
    Tier = "string",
    Arn = "string",
    Value = "string",
    ValueWo = "string",
    ValueWoVersion = 0,
});
```

```go
example, err := ssm.NewParameter(ctx, "parameterResource", &ssm.ParameterArgs{
	Type:           pulumi.String("string"),
	Name:           pulumi.String("string"),
	Region:         pulumi.String("string"),
	Description:    pulumi.String("string"),
	InsecureValue:  pulumi.String("string"),
	KeyId:          pulumi.String("string"),
	AllowedPattern: pulumi.String("string"),
	Overwrite:      pulumi.Bool(false),
	DataType:       pulumi.String("string"),
	Tags: pulumi.StringMap{
		"string": pulumi.String("string"),
	},
	Tier:           pulumi.String("string"),
	Arn:            pulumi.String("string"),
	Value:          pulumi.String("string"),
	ValueWo:        pulumi.String("string"),
	ValueWoVersion: pulumi.Int(0),
})
```

```hcl
resource "aws_ssm_parameter" "parameterResource" {
  type            = "string"
  name            = "string"
  region          = "string"
  description     = "string"
  insecure_value  = "string"
  key_id          = "string"
  allowed_pattern = "string"
  overwrite       = false
  data_type       = "string"
  tags = {
    "string" = "string"
  }
  tier             = "string"
  arn              = "string"
  value            = "string"
  value_wo         = "string"
  value_wo_version = 0
}
```

```java
var parameterResource = new Parameter("parameterResource", ParameterArgs.builder()
    .type("string")
    .name("string")
    .region("string")
    .description("string")
    .insecureValue("string")
    .keyId("string")
    .allowedPattern("string")
    .overwrite(false)
    .dataType("string")
    .tags(Map.of("string", "string"))
    .tier("string")
    .arn("string")
    .value("string")
    .valueWo("string")
    .valueWoVersion(0)
    .build());
```

```python
parameter_resource = aws.ssm.Parameter("parameterResource",
    type="string",
    name="string",
    region="string",
    description="string",
    insecure_value="string",
    key_id="string",
    allowed_pattern="string",
    overwrite=False,
    data_type="string",
    tags={
        "string": "string",
    },
    tier="string",
    arn="string",
    value="string",
    value_wo="string",
    value_wo_version=0)
```

```typescript
const parameterResource = new aws.ssm.Parameter("parameterResource", {
    type: "string",
    name: "string",
    region: "string",
    description: "string",
    insecureValue: "string",
    keyId: "string",
    allowedPattern: "string",
    overwrite: false,
    dataType: "string",
    tags: {
        string: "string",
    },
    tier: "string",
    arn: "string",
    value: "string",
    valueWo: "string",
    valueWoVersion: 0,
});
```

```yaml
type: aws:ssm:Parameter
properties:
    allowedPattern: string
    arn: string
    dataType: string
    description: string
    insecureValue: string
    keyId: string
    name: string
    overwrite: false
    region: string
    tags:
        string: string
    tier: string
    type: string
    value: string
    valueWo: string
    valueWoVersion: 0
```

## Parameter Resource Properties[](#properties)

To learn more about resource properties and how to use them, see [Inputs and Outputs](/docs/intro/concepts/inputs-outputs) in the Architecture and Concepts docs.

### Inputs[](#inputs)

In Python, inputs that are objects can be passed either as [argument classes or as dictionary literals](/docs/languages-sdks/python/#inputs-and-outputs).

The Parameter resource accepts the following [input](/docs/intro/concepts/inputs-outputs) properties:

[Type](#type_csharp) This property is required. string | [Pulumi.Aws.Ssm.ParameterType](#parametertype)

Type of the parameter. Valid types are `String`, `StringList` and `SecureString`.

The following arguments are optional:

[AllowedPattern](#allowedpattern_csharp) string

Regular expression used to validate the parameter value.

[Arn](#arn_csharp) string

ARN of the parameter.

[DataType](#datatype_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Data type of the parameter. Valid values: `text`, `aws:ssm:integration` and `aws:ec2:image` for AMI format, see the [Native parameter support for Amazon Machine Image IDs](https://docs.aws.amazon.com/systems-manager/latest/userguide/parameter-store-ec2-aliases.html).

[Description](#description_csharp) string

Description of the parameter.

[InsecureValue](#insecurevalue_csharp) string

Value of the parameter. **Use caution:** This value is *never* marked as sensitive in the pulumi preview output. This argument is not valid with a `type` of `SecureString`.

[KeyId](#keyid_csharp) string

KMS key ID or ARN for encrypting a SecureString.

[Name](#name_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Name of the parameter. If the name contains a path (e.g., any forward slashes (`/`)), it must be fully qualified with a leading forward slash (`/`). For additional requirements and constraints, see the [AWS SSM User Guide](https://docs.aws.amazon.com/systems-manager/latest/userguide/sysman-parameter-name-constraints.html).

[Overwrite](#overwrite_csharp) bool

Overwrite an existing parameter. If not specified, defaults to `false` during create operations to avoid overwriting existing resources and then `true` for all subsequent operations once the resource is managed by IAC. Lifecycle rules should be used to manage non-standard update behavior.

[Region](#region_csharp) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[Tags](#tags_csharp) Dictionary<string, string>

Map of tags to assign to the object. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[Tier](#tier_csharp) string

Parameter tier to assign to the parameter. If not specified, will use the default parameter tier for the region. Valid tiers are `Standard`, `Advanced`, and `Intelligent-Tiering`. Downgrading an `Advanced` tier parameter to `Standard` will recreate the resource. For more information on parameter tiers, see the [AWS SSM Parameter tier comparison and guide](https://docs.aws.amazon.com/systems-manager/latest/userguide/parameter-store-advanced-parameters.html).

[Value](#value_csharp) string

Value of the parameter. This value is always marked as sensitive in the pulumi preview output, regardless of \`type

[ValueWo](#valuewo_csharp) string

**NOTE:** This field is write-only and its value will not be updated in state as part of read operations. Value of the parameter. This value is always marked as sensitive in the pulumi preview output, regardless of `type`. Additionally, `write-only` values are never stored to state. `valueWoVersion` can be used to trigger an update and is required with this argument.

[ValueWoVersion](#valuewoversion_csharp) int

Used together with `valueWo` to trigger an update. Increment this value when an update to the `valueWo` is required.

> **NOTE:** `aws:ssm:integration` dataType parameters must be of the type `SecureString` and the name must start with the prefix `/d9d01087-4a3f-49e0-b0b4-d568d7826553/ssm/integrations/webhook/`. See [here](https://docs.aws.amazon.com/systems-manager/latest/userguide/creating-integrations.html) for information on the usage of `aws:ssm:integration` parameters.

[Type](#type_go) This property is required. string | [ParameterType](#parametertype)

Type of the parameter. Valid types are `String`, `StringList` and `SecureString`.

The following arguments are optional:

[AllowedPattern](#allowedpattern_go) string

Regular expression used to validate the parameter value.

[Arn](#arn_go) string

ARN of the parameter.

[DataType](#datatype_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Data type of the parameter. Valid values: `text`, `aws:ssm:integration` and `aws:ec2:image` for AMI format, see the [Native parameter support for Amazon Machine Image IDs](https://docs.aws.amazon.com/systems-manager/latest/userguide/parameter-store-ec2-aliases.html).

[Description](#description_go) string

Description of the parameter.

[InsecureValue](#insecurevalue_go) string

Value of the parameter. **Use caution:** This value is *never* marked as sensitive in the pulumi preview output. This argument is not valid with a `type` of `SecureString`.

[KeyId](#keyid_go) string

KMS key ID or ARN for encrypting a SecureString.

[Name](#name_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Name of the parameter. If the name contains a path (e.g., any forward slashes (`/`)), it must be fully qualified with a leading forward slash (`/`). For additional requirements and constraints, see the [AWS SSM User Guide](https://docs.aws.amazon.com/systems-manager/latest/userguide/sysman-parameter-name-constraints.html).

[Overwrite](#overwrite_go) bool

Overwrite an existing parameter. If not specified, defaults to `false` during create operations to avoid overwriting existing resources and then `true` for all subsequent operations once the resource is managed by IAC. Lifecycle rules should be used to manage non-standard update behavior.

[Region](#region_go) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[Tags](#tags_go) map\[string\]string

Map of tags to assign to the object. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[Tier](#tier_go) string

Parameter tier to assign to the parameter. If not specified, will use the default parameter tier for the region. Valid tiers are `Standard`, `Advanced`, and `Intelligent-Tiering`. Downgrading an `Advanced` tier parameter to `Standard` will recreate the resource. For more information on parameter tiers, see the [AWS SSM Parameter tier comparison and guide](https://docs.aws.amazon.com/systems-manager/latest/userguide/parameter-store-advanced-parameters.html).

[Value](#value_go) string

Value of the parameter. This value is always marked as sensitive in the pulumi preview output, regardless of \`type

[ValueWo](#valuewo_go) string

**NOTE:** This field is write-only and its value will not be updated in state as part of read operations. Value of the parameter. This value is always marked as sensitive in the pulumi preview output, regardless of `type`. Additionally, `write-only` values are never stored to state. `valueWoVersion` can be used to trigger an update and is required with this argument.

[ValueWoVersion](#valuewoversion_go) int

Used together with `valueWo` to trigger an update. Increment this value when an update to the `valueWo` is required.

> **NOTE:** `aws:ssm:integration` dataType parameters must be of the type `SecureString` and the name must start with the prefix `/d9d01087-4a3f-49e0-b0b4-d568d7826553/ssm/integrations/webhook/`. See [here](https://docs.aws.amazon.com/systems-manager/latest/userguide/creating-integrations.html) for information on the usage of `aws:ssm:integration` parameters.

[type](#type_hcl) This property is required. string | ["String" | "StringList" | "SecureString"](#parametertype)

Type of the parameter. Valid types are `String`, `StringList` and `SecureString`.

The following arguments are optional:

[allowed\_pattern](#allowed_pattern_hcl) string

Regular expression used to validate the parameter value.

[arn](#arn_hcl) string

ARN of the parameter.

[data\_type](#data_type_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Data type of the parameter. Valid values: `text`, `aws:ssm:integration` and `aws:ec2:image` for AMI format, see the [Native parameter support for Amazon Machine Image IDs](https://docs.aws.amazon.com/systems-manager/latest/userguide/parameter-store-ec2-aliases.html).

[description](#description_hcl) string

Description of the parameter.

[insecure\_value](#insecure_value_hcl) string

Value of the parameter. **Use caution:** This value is *never* marked as sensitive in the pulumi preview output. This argument is not valid with a `type` of `SecureString`.

[key\_id](#key_id_hcl) string

KMS key ID or ARN for encrypting a SecureString.

[name](#name_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Name of the parameter. If the name contains a path (e.g., any forward slashes (`/`)), it must be fully qualified with a leading forward slash (`/`). For additional requirements and constraints, see the [AWS SSM User Guide](https://docs.aws.amazon.com/systems-manager/latest/userguide/sysman-parameter-name-constraints.html).

[overwrite](#overwrite_hcl) bool

Overwrite an existing parameter. If not specified, defaults to `false` during create operations to avoid overwriting existing resources and then `true` for all subsequent operations once the resource is managed by IAC. Lifecycle rules should be used to manage non-standard update behavior.

[region](#region_hcl) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[tags](#tags_hcl) map(string)

Map of tags to assign to the object. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tier](#tier_hcl) string

Parameter tier to assign to the parameter. If not specified, will use the default parameter tier for the region. Valid tiers are `Standard`, `Advanced`, and `Intelligent-Tiering`. Downgrading an `Advanced` tier parameter to `Standard` will recreate the resource. For more information on parameter tiers, see the [AWS SSM Parameter tier comparison and guide](https://docs.aws.amazon.com/systems-manager/latest/userguide/parameter-store-advanced-parameters.html).

[value](#value_hcl) string

Value of the parameter. This value is always marked as sensitive in the pulumi preview output, regardless of \`type

[value\_wo](#value_wo_hcl) string

**NOTE:** This field is write-only and its value will not be updated in state as part of read operations. Value of the parameter. This value is always marked as sensitive in the pulumi preview output, regardless of `type`. Additionally, `write-only` values are never stored to state. `valueWoVersion` can be used to trigger an update and is required with this argument.

[value\_wo\_version](#value_wo_version_hcl) number

Used together with `valueWo` to trigger an update. Increment this value when an update to the `valueWo` is required.

> **NOTE:** `aws:ssm:integration` dataType parameters must be of the type `SecureString` and the name must start with the prefix `/d9d01087-4a3f-49e0-b0b4-d568d7826553/ssm/integrations/webhook/`. See [here](https://docs.aws.amazon.com/systems-manager/latest/userguide/creating-integrations.html) for information on the usage of `aws:ssm:integration` parameters.

[type](#type_java) This property is required. String | [ParameterType](#parametertype)

Type of the parameter. Valid types are `String`, `StringList` and `SecureString`.

The following arguments are optional:

[allowedPattern](#allowedpattern_java) String

Regular expression used to validate the parameter value.

[arn](#arn_java) String

ARN of the parameter.

[dataType](#datatype_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Data type of the parameter. Valid values: `text`, `aws:ssm:integration` and `aws:ec2:image` for AMI format, see the [Native parameter support for Amazon Machine Image IDs](https://docs.aws.amazon.com/systems-manager/latest/userguide/parameter-store-ec2-aliases.html).

[description](#description_java) String

Description of the parameter.

[insecureValue](#insecurevalue_java) String

Value of the parameter. **Use caution:** This value is *never* marked as sensitive in the pulumi preview output. This argument is not valid with a `type` of `SecureString`.

[keyId](#keyid_java) String

KMS key ID or ARN for encrypting a SecureString.

[name](#name_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Name of the parameter. If the name contains a path (e.g., any forward slashes (`/`)), it must be fully qualified with a leading forward slash (`/`). For additional requirements and constraints, see the [AWS SSM User Guide](https://docs.aws.amazon.com/systems-manager/latest/userguide/sysman-parameter-name-constraints.html).

[overwrite](#overwrite_java) Boolean

Overwrite an existing parameter. If not specified, defaults to `false` during create operations to avoid overwriting existing resources and then `true` for all subsequent operations once the resource is managed by IAC. Lifecycle rules should be used to manage non-standard update behavior.

[region](#region_java) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[tags](#tags_java) Map<String,String>

Map of tags to assign to the object. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tier](#tier_java) String

Parameter tier to assign to the parameter. If not specified, will use the default parameter tier for the region. Valid tiers are `Standard`, `Advanced`, and `Intelligent-Tiering`. Downgrading an `Advanced` tier parameter to `Standard` will recreate the resource. For more information on parameter tiers, see the [AWS SSM Parameter tier comparison and guide](https://docs.aws.amazon.com/systems-manager/latest/userguide/parameter-store-advanced-parameters.html).

[value](#value_java) String

Value of the parameter. This value is always marked as sensitive in the pulumi preview output, regardless of \`type

[valueWo](#valuewo_java) String

**NOTE:** This field is write-only and its value will not be updated in state as part of read operations. Value of the parameter. This value is always marked as sensitive in the pulumi preview output, regardless of `type`. Additionally, `write-only` values are never stored to state. `valueWoVersion` can be used to trigger an update and is required with this argument.

[valueWoVersion](#valuewoversion_java) Integer

Used together with `valueWo` to trigger an update. Increment this value when an update to the `valueWo` is required.

> **NOTE:** `aws:ssm:integration` dataType parameters must be of the type `SecureString` and the name must start with the prefix `/d9d01087-4a3f-49e0-b0b4-d568d7826553/ssm/integrations/webhook/`. See [here](https://docs.aws.amazon.com/systems-manager/latest/userguide/creating-integrations.html) for information on the usage of `aws:ssm:integration` parameters.

[type](#type_nodejs) This property is required. string | [ParameterType](#parametertype)

Type of the parameter. Valid types are `String`, `StringList` and `SecureString`.

The following arguments are optional:

[allowedPattern](#allowedpattern_nodejs) string

Regular expression used to validate the parameter value.

[arn](#arn_nodejs) string

ARN of the parameter.

[dataType](#datatype_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Data type of the parameter. Valid values: `text`, `aws:ssm:integration` and `aws:ec2:image` for AMI format, see the [Native parameter support for Amazon Machine Image IDs](https://docs.aws.amazon.com/systems-manager/latest/userguide/parameter-store-ec2-aliases.html).

[description](#description_nodejs) string

Description of the parameter.

[insecureValue](#insecurevalue_nodejs) string

Value of the parameter. **Use caution:** This value is *never* marked as sensitive in the pulumi preview output. This argument is not valid with a `type` of `SecureString`.

[keyId](#keyid_nodejs) string

KMS key ID or ARN for encrypting a SecureString.

[name](#name_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Name of the parameter. If the name contains a path (e.g., any forward slashes (`/`)), it must be fully qualified with a leading forward slash (`/`). For additional requirements and constraints, see the [AWS SSM User Guide](https://docs.aws.amazon.com/systems-manager/latest/userguide/sysman-parameter-name-constraints.html).

[overwrite](#overwrite_nodejs) boolean

Overwrite an existing parameter. If not specified, defaults to `false` during create operations to avoid overwriting existing resources and then `true` for all subsequent operations once the resource is managed by IAC. Lifecycle rules should be used to manage non-standard update behavior.

[region](#region_nodejs) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[tags](#tags_nodejs) {\[key: string\]: string}

Map of tags to assign to the object. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tier](#tier_nodejs) string

Parameter tier to assign to the parameter. If not specified, will use the default parameter tier for the region. Valid tiers are `Standard`, `Advanced`, and `Intelligent-Tiering`. Downgrading an `Advanced` tier parameter to `Standard` will recreate the resource. For more information on parameter tiers, see the [AWS SSM Parameter tier comparison and guide](https://docs.aws.amazon.com/systems-manager/latest/userguide/parameter-store-advanced-parameters.html).

[value](#value_nodejs) string

Value of the parameter. This value is always marked as sensitive in the pulumi preview output, regardless of \`type

[valueWo](#valuewo_nodejs) string

**NOTE:** This field is write-only and its value will not be updated in state as part of read operations. Value of the parameter. This value is always marked as sensitive in the pulumi preview output, regardless of `type`. Additionally, `write-only` values are never stored to state. `valueWoVersion` can be used to trigger an update and is required with this argument.

[valueWoVersion](#valuewoversion_nodejs) number

Used together with `valueWo` to trigger an update. Increment this value when an update to the `valueWo` is required.

> **NOTE:** `aws:ssm:integration` dataType parameters must be of the type `SecureString` and the name must start with the prefix `/d9d01087-4a3f-49e0-b0b4-d568d7826553/ssm/integrations/webhook/`. See [here](https://docs.aws.amazon.com/systems-manager/latest/userguide/creating-integrations.html) for information on the usage of `aws:ssm:integration` parameters.

[type](#type_python) This property is required. str | [ParameterType](#parametertype)

Type of the parameter. Valid types are `String`, `StringList` and `SecureString`.

The following arguments are optional:

[allowed\_pattern](#allowed_pattern_python) str

Regular expression used to validate the parameter value.

[arn](#arn_python) str

ARN of the parameter.

[data\_type](#data_type_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Data type of the parameter. Valid values: `text`, `aws:ssm:integration` and `aws:ec2:image` for AMI format, see the [Native parameter support for Amazon Machine Image IDs](https://docs.aws.amazon.com/systems-manager/latest/userguide/parameter-store-ec2-aliases.html).

[description](#description_python) str

Description of the parameter.

[insecure\_value](#insecure_value_python) str

Value of the parameter. **Use caution:** This value is *never* marked as sensitive in the pulumi preview output. This argument is not valid with a `type` of `SecureString`.

[key\_id](#key_id_python) str

KMS key ID or ARN for encrypting a SecureString.

[name](#name_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Name of the parameter. If the name contains a path (e.g., any forward slashes (`/`)), it must be fully qualified with a leading forward slash (`/`). For additional requirements and constraints, see the [AWS SSM User Guide](https://docs.aws.amazon.com/systems-manager/latest/userguide/sysman-parameter-name-constraints.html).

[overwrite](#overwrite_python) bool

Overwrite an existing parameter. If not specified, defaults to `false` during create operations to avoid overwriting existing resources and then `true` for all subsequent operations once the resource is managed by IAC. Lifecycle rules should be used to manage non-standard update behavior.

[region](#region_python) str

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[tags](#tags_python) Mapping\[str, str\]

Map of tags to assign to the object. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tier](#tier_python) str

Parameter tier to assign to the parameter. If not specified, will use the default parameter tier for the region. Valid tiers are `Standard`, `Advanced`, and `Intelligent-Tiering`. Downgrading an `Advanced` tier parameter to `Standard` will recreate the resource. For more information on parameter tiers, see the [AWS SSM Parameter tier comparison and guide](https://docs.aws.amazon.com/systems-manager/latest/userguide/parameter-store-advanced-parameters.html).

[value](#value_python) str

Value of the parameter. This value is always marked as sensitive in the pulumi preview output, regardless of \`type

[value\_wo](#value_wo_python) str

**NOTE:** This field is write-only and its value will not be updated in state as part of read operations. Value of the parameter. This value is always marked as sensitive in the pulumi preview output, regardless of `type`. Additionally, `write-only` values are never stored to state. `valueWoVersion` can be used to trigger an update and is required with this argument.

[value\_wo\_version](#value_wo_version_python) int

Used together with `valueWo` to trigger an update. Increment this value when an update to the `valueWo` is required.

> **NOTE:** `aws:ssm:integration` dataType parameters must be of the type `SecureString` and the name must start with the prefix `/d9d01087-4a3f-49e0-b0b4-d568d7826553/ssm/integrations/webhook/`. See [here](https://docs.aws.amazon.com/systems-manager/latest/userguide/creating-integrations.html) for information on the usage of `aws:ssm:integration` parameters.

[type](#type_yaml) This property is required. String | ["String" | "StringList" | "SecureString"](#parametertype)

Type of the parameter. Valid types are `String`, `StringList` and `SecureString`.

The following arguments are optional:

[allowedPattern](#allowedpattern_yaml) String

Regular expression used to validate the parameter value.

[arn](#arn_yaml) String

ARN of the parameter.

[dataType](#datatype_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Data type of the parameter. Valid values: `text`, `aws:ssm:integration` and `aws:ec2:image` for AMI format, see the [Native parameter support for Amazon Machine Image IDs](https://docs.aws.amazon.com/systems-manager/latest/userguide/parameter-store-ec2-aliases.html).

[description](#description_yaml) String

Description of the parameter.

[insecureValue](#insecurevalue_yaml) String

Value of the parameter. **Use caution:** This value is *never* marked as sensitive in the pulumi preview output. This argument is not valid with a `type` of `SecureString`.

[keyId](#keyid_yaml) String

KMS key ID or ARN for encrypting a SecureString.

[name](#name_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Name of the parameter. If the name contains a path (e.g., any forward slashes (`/`)), it must be fully qualified with a leading forward slash (`/`). For additional requirements and constraints, see the [AWS SSM User Guide](https://docs.aws.amazon.com/systems-manager/latest/userguide/sysman-parameter-name-constraints.html).

[overwrite](#overwrite_yaml) Boolean

Overwrite an existing parameter. If not specified, defaults to `false` during create operations to avoid overwriting existing resources and then `true` for all subsequent operations once the resource is managed by IAC. Lifecycle rules should be used to manage non-standard update behavior.

[region](#region_yaml) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[tags](#tags_yaml) Map<String>

Map of tags to assign to the object. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tier](#tier_yaml) String

Parameter tier to assign to the parameter. If not specified, will use the default parameter tier for the region. Valid tiers are `Standard`, `Advanced`, and `Intelligent-Tiering`. Downgrading an `Advanced` tier parameter to `Standard` will recreate the resource. For more information on parameter tiers, see the [AWS SSM Parameter tier comparison and guide](https://docs.aws.amazon.com/systems-manager/latest/userguide/parameter-store-advanced-parameters.html).

[value](#value_yaml) String

Value of the parameter. This value is always marked as sensitive in the pulumi preview output, regardless of \`type

[valueWo](#valuewo_yaml) String

**NOTE:** This field is write-only and its value will not be updated in state as part of read operations. Value of the parameter. This value is always marked as sensitive in the pulumi preview output, regardless of `type`. Additionally, `write-only` values are never stored to state. `valueWoVersion` can be used to trigger an update and is required with this argument.

[valueWoVersion](#valuewoversion_yaml) Number

Used together with `valueWo` to trigger an update. Increment this value when an update to the `valueWo` is required.

> **NOTE:** `aws:ssm:integration` dataType parameters must be of the type `SecureString` and the name must start with the prefix `/d9d01087-4a3f-49e0-b0b4-d568d7826553/ssm/integrations/webhook/`. See [here](https://docs.aws.amazon.com/systems-manager/latest/userguide/creating-integrations.html) for information on the usage of `aws:ssm:integration` parameters.

### Outputs[](#outputs)

All [input](#inputs) properties are implicitly available as output properties. Additionally, the Parameter resource produces the following output properties:

[HasValueWo](#hasvaluewo_csharp) bool

Indicates whether the resource has a `valueWo` set.

[Id](#id_csharp) string

The provider-assigned unique ID for this managed resource.

[TagsAll](#tagsall_csharp) Dictionary<string, string>

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[Version](#version_csharp) int

Version of the parameter.

[HasValueWo](#hasvaluewo_go) bool

Indicates whether the resource has a `valueWo` set.

[Id](#id_go) string

The provider-assigned unique ID for this managed resource.

[TagsAll](#tagsall_go) map\[string\]string

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[Version](#version_go) int

Version of the parameter.

[has\_value\_wo](#has_value_wo_hcl) bool

Indicates whether the resource has a `valueWo` set.

[id](#id_hcl) string

The provider-assigned unique ID for this managed resource.

[tags\_all](#tags_all_hcl) map(string)

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[version](#version_hcl) number

Version of the parameter.

[hasValueWo](#hasvaluewo_java) Boolean

Indicates whether the resource has a `valueWo` set.

[id](#id_java) String

The provider-assigned unique ID for this managed resource.

[tagsAll](#tagsall_java) Map<String,String>

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[version](#version_java) Integer

Version of the parameter.

[hasValueWo](#hasvaluewo_nodejs) boolean

Indicates whether the resource has a `valueWo` set.

[id](#id_nodejs) string

The provider-assigned unique ID for this managed resource.

[tagsAll](#tagsall_nodejs) {\[key: string\]: string}

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[version](#version_nodejs) number

Version of the parameter.

[has\_value\_wo](#has_value_wo_python) bool

Indicates whether the resource has a `valueWo` set.

[id](#id_python) str

The provider-assigned unique ID for this managed resource.

[tags\_all](#tags_all_python) Mapping\[str, str\]

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[version](#version_python) int

Version of the parameter.

[hasValueWo](#hasvaluewo_yaml) Boolean

Indicates whether the resource has a `valueWo` set.

[id](#id_yaml) String

The provider-assigned unique ID for this managed resource.

[tagsAll](#tagsall_yaml) Map<String>

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[version](#version_yaml) Number

Version of the parameter.

## Look up Existing Parameter Resource[](#look-up)

Get an existing Parameter resource’s state with the given name, ID, and optional extra properties used to qualify the lookup.

-   TypeScript
-   Python
-   Go
-   C#
-   Java
-   YAML
-   HCL PREVIEW

```typescript
public static get(name: string, id: Input<ID>, state?: ParameterState, opts?: CustomResourceOptions): Parameter
```

```python
@staticmethod
def get(resource_name: str,
        id: str,
        opts: Optional[ResourceOptions] = None,
        allowed_pattern: Optional[str] = None,
        arn: Optional[str] = None,
        data_type: Optional[str] = None,
        description: Optional[str] = None,
        has_value_wo: Optional[bool] = None,
        insecure_value: Optional[str] = None,
        key_id: Optional[str] = None,
        name: Optional[str] = None,
        overwrite: Optional[bool] = None,
        region: Optional[str] = None,
        tags: Optional[Mapping[str, str]] = None,
        tags_all: Optional[Mapping[str, str]] = None,
        tier: Optional[str] = None,
        type: Optional[Union[str, ParameterType]] = None,
        value: Optional[str] = None,
        value_wo: Optional[str] = None,
        value_wo_version: Optional[int] = None,
        version: Optional[int] = None) -> Parameter
```

```go
func GetParameter(ctx *Context, name string, id IDInput, state *ParameterState, opts ...ResourceOption) (*Parameter, error)
```

```csharp
public static Parameter Get(string name, Input<string> id, ParameterState? state, CustomResourceOptions? opts = null)
```

```java
public static Parameter get(String name, Output<String> id, ParameterState state, CustomResourceOptions options)
```

```yaml
resources:  _:    type: aws:ssm:Parameter    get:      id: ${id}
```

```hcl
import {
  to = aws_ssm_parameter.example
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

[AllowedPattern](#state_allowedpattern_csharp) string

Regular expression used to validate the parameter value.

[Arn](#state_arn_csharp) string

ARN of the parameter.

[DataType](#state_datatype_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Data type of the parameter. Valid values: `text`, `aws:ssm:integration` and `aws:ec2:image` for AMI format, see the [Native parameter support for Amazon Machine Image IDs](https://docs.aws.amazon.com/systems-manager/latest/userguide/parameter-store-ec2-aliases.html).

[Description](#state_description_csharp) string

Description of the parameter.

[HasValueWo](#state_hasvaluewo_csharp) bool

Indicates whether the resource has a `valueWo` set.

[InsecureValue](#state_insecurevalue_csharp) string

Value of the parameter. **Use caution:** This value is *never* marked as sensitive in the pulumi preview output. This argument is not valid with a `type` of `SecureString`.

[KeyId](#state_keyid_csharp) string

KMS key ID or ARN for encrypting a SecureString.

[Name](#state_name_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Name of the parameter. If the name contains a path (e.g., any forward slashes (`/`)), it must be fully qualified with a leading forward slash (`/`). For additional requirements and constraints, see the [AWS SSM User Guide](https://docs.aws.amazon.com/systems-manager/latest/userguide/sysman-parameter-name-constraints.html).

[Overwrite](#state_overwrite_csharp) bool

Overwrite an existing parameter. If not specified, defaults to `false` during create operations to avoid overwriting existing resources and then `true` for all subsequent operations once the resource is managed by IAC. Lifecycle rules should be used to manage non-standard update behavior.

[Region](#state_region_csharp) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[Tags](#state_tags_csharp) Dictionary<string, string>

Map of tags to assign to the object. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[TagsAll](#state_tagsall_csharp) Dictionary<string, string>

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[Tier](#state_tier_csharp) string

Parameter tier to assign to the parameter. If not specified, will use the default parameter tier for the region. Valid tiers are `Standard`, `Advanced`, and `Intelligent-Tiering`. Downgrading an `Advanced` tier parameter to `Standard` will recreate the resource. For more information on parameter tiers, see the [AWS SSM Parameter tier comparison and guide](https://docs.aws.amazon.com/systems-manager/latest/userguide/parameter-store-advanced-parameters.html).

[Type](#state_type_csharp) string | [Pulumi.Aws.Ssm.ParameterType](#parametertype)

Type of the parameter. Valid types are `String`, `StringList` and `SecureString`.

The following arguments are optional:

[Value](#state_value_csharp) string

Value of the parameter. This value is always marked as sensitive in the pulumi preview output, regardless of \`type

[ValueWo](#state_valuewo_csharp) string

**NOTE:** This field is write-only and its value will not be updated in state as part of read operations. Value of the parameter. This value is always marked as sensitive in the pulumi preview output, regardless of `type`. Additionally, `write-only` values are never stored to state. `valueWoVersion` can be used to trigger an update and is required with this argument.

[ValueWoVersion](#state_valuewoversion_csharp) int

Used together with `valueWo` to trigger an update. Increment this value when an update to the `valueWo` is required.

> **NOTE:** `aws:ssm:integration` dataType parameters must be of the type `SecureString` and the name must start with the prefix `/d9d01087-4a3f-49e0-b0b4-d568d7826553/ssm/integrations/webhook/`. See [here](https://docs.aws.amazon.com/systems-manager/latest/userguide/creating-integrations.html) for information on the usage of `aws:ssm:integration` parameters.

[Version](#state_version_csharp) int

Version of the parameter.

[AllowedPattern](#state_allowedpattern_go) string

Regular expression used to validate the parameter value.

[Arn](#state_arn_go) string

ARN of the parameter.

[DataType](#state_datatype_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Data type of the parameter. Valid values: `text`, `aws:ssm:integration` and `aws:ec2:image` for AMI format, see the [Native parameter support for Amazon Machine Image IDs](https://docs.aws.amazon.com/systems-manager/latest/userguide/parameter-store-ec2-aliases.html).

[Description](#state_description_go) string

Description of the parameter.

[HasValueWo](#state_hasvaluewo_go) bool

Indicates whether the resource has a `valueWo` set.

[InsecureValue](#state_insecurevalue_go) string

Value of the parameter. **Use caution:** This value is *never* marked as sensitive in the pulumi preview output. This argument is not valid with a `type` of `SecureString`.

[KeyId](#state_keyid_go) string

KMS key ID or ARN for encrypting a SecureString.

[Name](#state_name_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Name of the parameter. If the name contains a path (e.g., any forward slashes (`/`)), it must be fully qualified with a leading forward slash (`/`). For additional requirements and constraints, see the [AWS SSM User Guide](https://docs.aws.amazon.com/systems-manager/latest/userguide/sysman-parameter-name-constraints.html).

[Overwrite](#state_overwrite_go) bool

Overwrite an existing parameter. If not specified, defaults to `false` during create operations to avoid overwriting existing resources and then `true` for all subsequent operations once the resource is managed by IAC. Lifecycle rules should be used to manage non-standard update behavior.

[Region](#state_region_go) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[Tags](#state_tags_go) map\[string\]string

Map of tags to assign to the object. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[TagsAll](#state_tagsall_go) map\[string\]string

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[Tier](#state_tier_go) string

Parameter tier to assign to the parameter. If not specified, will use the default parameter tier for the region. Valid tiers are `Standard`, `Advanced`, and `Intelligent-Tiering`. Downgrading an `Advanced` tier parameter to `Standard` will recreate the resource. For more information on parameter tiers, see the [AWS SSM Parameter tier comparison and guide](https://docs.aws.amazon.com/systems-manager/latest/userguide/parameter-store-advanced-parameters.html).

[Type](#state_type_go) string | [ParameterType](#parametertype)

Type of the parameter. Valid types are `String`, `StringList` and `SecureString`.

The following arguments are optional:

[Value](#state_value_go) string

Value of the parameter. This value is always marked as sensitive in the pulumi preview output, regardless of \`type

[ValueWo](#state_valuewo_go) string

**NOTE:** This field is write-only and its value will not be updated in state as part of read operations. Value of the parameter. This value is always marked as sensitive in the pulumi preview output, regardless of `type`. Additionally, `write-only` values are never stored to state. `valueWoVersion` can be used to trigger an update and is required with this argument.

[ValueWoVersion](#state_valuewoversion_go) int

Used together with `valueWo` to trigger an update. Increment this value when an update to the `valueWo` is required.

> **NOTE:** `aws:ssm:integration` dataType parameters must be of the type `SecureString` and the name must start with the prefix `/d9d01087-4a3f-49e0-b0b4-d568d7826553/ssm/integrations/webhook/`. See [here](https://docs.aws.amazon.com/systems-manager/latest/userguide/creating-integrations.html) for information on the usage of `aws:ssm:integration` parameters.

[Version](#state_version_go) int

Version of the parameter.

[allowed\_pattern](#state_allowed_pattern_hcl) string

Regular expression used to validate the parameter value.

[arn](#state_arn_hcl) string

ARN of the parameter.

[data\_type](#state_data_type_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Data type of the parameter. Valid values: `text`, `aws:ssm:integration` and `aws:ec2:image` for AMI format, see the [Native parameter support for Amazon Machine Image IDs](https://docs.aws.amazon.com/systems-manager/latest/userguide/parameter-store-ec2-aliases.html).

[description](#state_description_hcl) string

Description of the parameter.

[has\_value\_wo](#state_has_value_wo_hcl) bool

Indicates whether the resource has a `valueWo` set.

[insecure\_value](#state_insecure_value_hcl) string

Value of the parameter. **Use caution:** This value is *never* marked as sensitive in the pulumi preview output. This argument is not valid with a `type` of `SecureString`.

[key\_id](#state_key_id_hcl) string

KMS key ID or ARN for encrypting a SecureString.

[name](#state_name_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Name of the parameter. If the name contains a path (e.g., any forward slashes (`/`)), it must be fully qualified with a leading forward slash (`/`). For additional requirements and constraints, see the [AWS SSM User Guide](https://docs.aws.amazon.com/systems-manager/latest/userguide/sysman-parameter-name-constraints.html).

[overwrite](#state_overwrite_hcl) bool

Overwrite an existing parameter. If not specified, defaults to `false` during create operations to avoid overwriting existing resources and then `true` for all subsequent operations once the resource is managed by IAC. Lifecycle rules should be used to manage non-standard update behavior.

[region](#state_region_hcl) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[tags](#state_tags_hcl) map(string)

Map of tags to assign to the object. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tags\_all](#state_tags_all_hcl) map(string)

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[tier](#state_tier_hcl) string

Parameter tier to assign to the parameter. If not specified, will use the default parameter tier for the region. Valid tiers are `Standard`, `Advanced`, and `Intelligent-Tiering`. Downgrading an `Advanced` tier parameter to `Standard` will recreate the resource. For more information on parameter tiers, see the [AWS SSM Parameter tier comparison and guide](https://docs.aws.amazon.com/systems-manager/latest/userguide/parameter-store-advanced-parameters.html).

[type](#state_type_hcl) string | ["String" | "StringList" | "SecureString"](#parametertype)

Type of the parameter. Valid types are `String`, `StringList` and `SecureString`.

The following arguments are optional:

[value](#state_value_hcl) string

Value of the parameter. This value is always marked as sensitive in the pulumi preview output, regardless of \`type

[value\_wo](#state_value_wo_hcl) string

**NOTE:** This field is write-only and its value will not be updated in state as part of read operations. Value of the parameter. This value is always marked as sensitive in the pulumi preview output, regardless of `type`. Additionally, `write-only` values are never stored to state. `valueWoVersion` can be used to trigger an update and is required with this argument.

[value\_wo\_version](#state_value_wo_version_hcl) number

Used together with `valueWo` to trigger an update. Increment this value when an update to the `valueWo` is required.

> **NOTE:** `aws:ssm:integration` dataType parameters must be of the type `SecureString` and the name must start with the prefix `/d9d01087-4a3f-49e0-b0b4-d568d7826553/ssm/integrations/webhook/`. See [here](https://docs.aws.amazon.com/systems-manager/latest/userguide/creating-integrations.html) for information on the usage of `aws:ssm:integration` parameters.

[version](#state_version_hcl) number

Version of the parameter.

[allowedPattern](#state_allowedpattern_java) String

Regular expression used to validate the parameter value.

[arn](#state_arn_java) String

ARN of the parameter.

[dataType](#state_datatype_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Data type of the parameter. Valid values: `text`, `aws:ssm:integration` and `aws:ec2:image` for AMI format, see the [Native parameter support for Amazon Machine Image IDs](https://docs.aws.amazon.com/systems-manager/latest/userguide/parameter-store-ec2-aliases.html).

[description](#state_description_java) String

Description of the parameter.

[hasValueWo](#state_hasvaluewo_java) Boolean

Indicates whether the resource has a `valueWo` set.

[insecureValue](#state_insecurevalue_java) String

Value of the parameter. **Use caution:** This value is *never* marked as sensitive in the pulumi preview output. This argument is not valid with a `type` of `SecureString`.

[keyId](#state_keyid_java) String

KMS key ID or ARN for encrypting a SecureString.

[name](#state_name_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Name of the parameter. If the name contains a path (e.g., any forward slashes (`/`)), it must be fully qualified with a leading forward slash (`/`). For additional requirements and constraints, see the [AWS SSM User Guide](https://docs.aws.amazon.com/systems-manager/latest/userguide/sysman-parameter-name-constraints.html).

[overwrite](#state_overwrite_java) Boolean

Overwrite an existing parameter. If not specified, defaults to `false` during create operations to avoid overwriting existing resources and then `true` for all subsequent operations once the resource is managed by IAC. Lifecycle rules should be used to manage non-standard update behavior.

[region](#state_region_java) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[tags](#state_tags_java) Map<String,String>

Map of tags to assign to the object. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tagsAll](#state_tagsall_java) Map<String,String>

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[tier](#state_tier_java) String

Parameter tier to assign to the parameter. If not specified, will use the default parameter tier for the region. Valid tiers are `Standard`, `Advanced`, and `Intelligent-Tiering`. Downgrading an `Advanced` tier parameter to `Standard` will recreate the resource. For more information on parameter tiers, see the [AWS SSM Parameter tier comparison and guide](https://docs.aws.amazon.com/systems-manager/latest/userguide/parameter-store-advanced-parameters.html).

[type](#state_type_java) String | [ParameterType](#parametertype)

Type of the parameter. Valid types are `String`, `StringList` and `SecureString`.

The following arguments are optional:

[value](#state_value_java) String

Value of the parameter. This value is always marked as sensitive in the pulumi preview output, regardless of \`type

[valueWo](#state_valuewo_java) String

**NOTE:** This field is write-only and its value will not be updated in state as part of read operations. Value of the parameter. This value is always marked as sensitive in the pulumi preview output, regardless of `type`. Additionally, `write-only` values are never stored to state. `valueWoVersion` can be used to trigger an update and is required with this argument.

[valueWoVersion](#state_valuewoversion_java) Integer

Used together with `valueWo` to trigger an update. Increment this value when an update to the `valueWo` is required.

> **NOTE:** `aws:ssm:integration` dataType parameters must be of the type `SecureString` and the name must start with the prefix `/d9d01087-4a3f-49e0-b0b4-d568d7826553/ssm/integrations/webhook/`. See [here](https://docs.aws.amazon.com/systems-manager/latest/userguide/creating-integrations.html) for information on the usage of `aws:ssm:integration` parameters.

[version](#state_version_java) Integer

Version of the parameter.

[allowedPattern](#state_allowedpattern_nodejs) string

Regular expression used to validate the parameter value.

[arn](#state_arn_nodejs) string

ARN of the parameter.

[dataType](#state_datatype_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Data type of the parameter. Valid values: `text`, `aws:ssm:integration` and `aws:ec2:image` for AMI format, see the [Native parameter support for Amazon Machine Image IDs](https://docs.aws.amazon.com/systems-manager/latest/userguide/parameter-store-ec2-aliases.html).

[description](#state_description_nodejs) string

Description of the parameter.

[hasValueWo](#state_hasvaluewo_nodejs) boolean

Indicates whether the resource has a `valueWo` set.

[insecureValue](#state_insecurevalue_nodejs) string

Value of the parameter. **Use caution:** This value is *never* marked as sensitive in the pulumi preview output. This argument is not valid with a `type` of `SecureString`.

[keyId](#state_keyid_nodejs) string

KMS key ID or ARN for encrypting a SecureString.

[name](#state_name_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Name of the parameter. If the name contains a path (e.g., any forward slashes (`/`)), it must be fully qualified with a leading forward slash (`/`). For additional requirements and constraints, see the [AWS SSM User Guide](https://docs.aws.amazon.com/systems-manager/latest/userguide/sysman-parameter-name-constraints.html).

[overwrite](#state_overwrite_nodejs) boolean

Overwrite an existing parameter. If not specified, defaults to `false` during create operations to avoid overwriting existing resources and then `true` for all subsequent operations once the resource is managed by IAC. Lifecycle rules should be used to manage non-standard update behavior.

[region](#state_region_nodejs) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[tags](#state_tags_nodejs) {\[key: string\]: string}

Map of tags to assign to the object. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tagsAll](#state_tagsall_nodejs) {\[key: string\]: string}

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[tier](#state_tier_nodejs) string

Parameter tier to assign to the parameter. If not specified, will use the default parameter tier for the region. Valid tiers are `Standard`, `Advanced`, and `Intelligent-Tiering`. Downgrading an `Advanced` tier parameter to `Standard` will recreate the resource. For more information on parameter tiers, see the [AWS SSM Parameter tier comparison and guide](https://docs.aws.amazon.com/systems-manager/latest/userguide/parameter-store-advanced-parameters.html).

[type](#state_type_nodejs) string | [ParameterType](#parametertype)

Type of the parameter. Valid types are `String`, `StringList` and `SecureString`.

The following arguments are optional:

[value](#state_value_nodejs) string

Value of the parameter. This value is always marked as sensitive in the pulumi preview output, regardless of \`type

[valueWo](#state_valuewo_nodejs) string

**NOTE:** This field is write-only and its value will not be updated in state as part of read operations. Value of the parameter. This value is always marked as sensitive in the pulumi preview output, regardless of `type`. Additionally, `write-only` values are never stored to state. `valueWoVersion` can be used to trigger an update and is required with this argument.

[valueWoVersion](#state_valuewoversion_nodejs) number

Used together with `valueWo` to trigger an update. Increment this value when an update to the `valueWo` is required.

> **NOTE:** `aws:ssm:integration` dataType parameters must be of the type `SecureString` and the name must start with the prefix `/d9d01087-4a3f-49e0-b0b4-d568d7826553/ssm/integrations/webhook/`. See [here](https://docs.aws.amazon.com/systems-manager/latest/userguide/creating-integrations.html) for information on the usage of `aws:ssm:integration` parameters.

[version](#state_version_nodejs) number

Version of the parameter.

[allowed\_pattern](#state_allowed_pattern_python) str

Regular expression used to validate the parameter value.

[arn](#state_arn_python) str

ARN of the parameter.

[data\_type](#state_data_type_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Data type of the parameter. Valid values: `text`, `aws:ssm:integration` and `aws:ec2:image` for AMI format, see the [Native parameter support for Amazon Machine Image IDs](https://docs.aws.amazon.com/systems-manager/latest/userguide/parameter-store-ec2-aliases.html).

[description](#state_description_python) str

Description of the parameter.

[has\_value\_wo](#state_has_value_wo_python) bool

Indicates whether the resource has a `valueWo` set.

[insecure\_value](#state_insecure_value_python) str

Value of the parameter. **Use caution:** This value is *never* marked as sensitive in the pulumi preview output. This argument is not valid with a `type` of `SecureString`.

[key\_id](#state_key_id_python) str

KMS key ID or ARN for encrypting a SecureString.

[name](#state_name_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Name of the parameter. If the name contains a path (e.g., any forward slashes (`/`)), it must be fully qualified with a leading forward slash (`/`). For additional requirements and constraints, see the [AWS SSM User Guide](https://docs.aws.amazon.com/systems-manager/latest/userguide/sysman-parameter-name-constraints.html).

[overwrite](#state_overwrite_python) bool

Overwrite an existing parameter. If not specified, defaults to `false` during create operations to avoid overwriting existing resources and then `true` for all subsequent operations once the resource is managed by IAC. Lifecycle rules should be used to manage non-standard update behavior.

[region](#state_region_python) str

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[tags](#state_tags_python) Mapping\[str, str\]

Map of tags to assign to the object. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tags\_all](#state_tags_all_python) Mapping\[str, str\]

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[tier](#state_tier_python) str

Parameter tier to assign to the parameter. If not specified, will use the default parameter tier for the region. Valid tiers are `Standard`, `Advanced`, and `Intelligent-Tiering`. Downgrading an `Advanced` tier parameter to `Standard` will recreate the resource. For more information on parameter tiers, see the [AWS SSM Parameter tier comparison and guide](https://docs.aws.amazon.com/systems-manager/latest/userguide/parameter-store-advanced-parameters.html).

[type](#state_type_python) str | [ParameterType](#parametertype)

Type of the parameter. Valid types are `String`, `StringList` and `SecureString`.

The following arguments are optional:

[value](#state_value_python) str

Value of the parameter. This value is always marked as sensitive in the pulumi preview output, regardless of \`type

[value\_wo](#state_value_wo_python) str

**NOTE:** This field is write-only and its value will not be updated in state as part of read operations. Value of the parameter. This value is always marked as sensitive in the pulumi preview output, regardless of `type`. Additionally, `write-only` values are never stored to state. `valueWoVersion` can be used to trigger an update and is required with this argument.

[value\_wo\_version](#state_value_wo_version_python) int

Used together with `valueWo` to trigger an update. Increment this value when an update to the `valueWo` is required.

> **NOTE:** `aws:ssm:integration` dataType parameters must be of the type `SecureString` and the name must start with the prefix `/d9d01087-4a3f-49e0-b0b4-d568d7826553/ssm/integrations/webhook/`. See [here](https://docs.aws.amazon.com/systems-manager/latest/userguide/creating-integrations.html) for information on the usage of `aws:ssm:integration` parameters.

[version](#state_version_python) int

Version of the parameter.

[allowedPattern](#state_allowedpattern_yaml) String

Regular expression used to validate the parameter value.

[arn](#state_arn_yaml) String

ARN of the parameter.

[dataType](#state_datatype_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Data type of the parameter. Valid values: `text`, `aws:ssm:integration` and `aws:ec2:image` for AMI format, see the [Native parameter support for Amazon Machine Image IDs](https://docs.aws.amazon.com/systems-manager/latest/userguide/parameter-store-ec2-aliases.html).

[description](#state_description_yaml) String

Description of the parameter.

[hasValueWo](#state_hasvaluewo_yaml) Boolean

Indicates whether the resource has a `valueWo` set.

[insecureValue](#state_insecurevalue_yaml) String

Value of the parameter. **Use caution:** This value is *never* marked as sensitive in the pulumi preview output. This argument is not valid with a `type` of `SecureString`.

[keyId](#state_keyid_yaml) String

KMS key ID or ARN for encrypting a SecureString.

[name](#state_name_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Name of the parameter. If the name contains a path (e.g., any forward slashes (`/`)), it must be fully qualified with a leading forward slash (`/`). For additional requirements and constraints, see the [AWS SSM User Guide](https://docs.aws.amazon.com/systems-manager/latest/userguide/sysman-parameter-name-constraints.html).

[overwrite](#state_overwrite_yaml) Boolean

Overwrite an existing parameter. If not specified, defaults to `false` during create operations to avoid overwriting existing resources and then `true` for all subsequent operations once the resource is managed by IAC. Lifecycle rules should be used to manage non-standard update behavior.

[region](#state_region_yaml) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[tags](#state_tags_yaml) Map<String>

Map of tags to assign to the object. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tagsAll](#state_tagsall_yaml) Map<String>

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[tier](#state_tier_yaml) String

Parameter tier to assign to the parameter. If not specified, will use the default parameter tier for the region. Valid tiers are `Standard`, `Advanced`, and `Intelligent-Tiering`. Downgrading an `Advanced` tier parameter to `Standard` will recreate the resource. For more information on parameter tiers, see the [AWS SSM Parameter tier comparison and guide](https://docs.aws.amazon.com/systems-manager/latest/userguide/parameter-store-advanced-parameters.html).

[type](#state_type_yaml) String | ["String" | "StringList" | "SecureString"](#parametertype)

Type of the parameter. Valid types are `String`, `StringList` and `SecureString`.

The following arguments are optional:

[value](#state_value_yaml) String

Value of the parameter. This value is always marked as sensitive in the pulumi preview output, regardless of \`type

[valueWo](#state_valuewo_yaml) String

**NOTE:** This field is write-only and its value will not be updated in state as part of read operations. Value of the parameter. This value is always marked as sensitive in the pulumi preview output, regardless of `type`. Additionally, `write-only` values are never stored to state. `valueWoVersion` can be used to trigger an update and is required with this argument.

[valueWoVersion](#state_valuewoversion_yaml) Number

Used together with `valueWo` to trigger an update. Increment this value when an update to the `valueWo` is required.

> **NOTE:** `aws:ssm:integration` dataType parameters must be of the type `SecureString` and the name must start with the prefix `/d9d01087-4a3f-49e0-b0b4-d568d7826553/ssm/integrations/webhook/`. See [here](https://docs.aws.amazon.com/systems-manager/latest/userguide/creating-integrations.html) for information on the usage of `aws:ssm:integration` parameters.

[version](#state_version_yaml) Number

Version of the parameter.

## Supporting Types[](#supporting-types)

#### ParameterType

, ParameterTypeArgs

[](#parametertype)

String

`String`

StringList

`StringList`

SecureString

`SecureString`

ParameterTypeString

`String`

ParameterTypeStringList

`StringList`

ParameterTypeSecureString

`SecureString`

"String"

`String`

"StringList"

`StringList`

"SecureString"

`SecureString`

String

`String`

StringList

`StringList`

SecureString

`SecureString`

String

`String`

StringList

`StringList`

SecureString

`SecureString`

STRING

`String`

STRING\_LIST

`StringList`

SECURE\_STRING

`SecureString`

"String"

`String`

"StringList"

`StringList`

"SecureString"

`SecureString`

## Import[](#import)

### Identity Schema[](#identity-schema)

#### Required[](#required)

-   `name` - (String) Name of the parameter.

#### Optional[](#optional)

-   `accountId` (String) AWS Account where this resource is managed.
-   `region` (String) Region where this resource is managed.

Using `pulumi import`, import SSM Parameters using the parameter store `name`. For example:

```bash
$ pulumi import aws:ssm/parameter:Parameter example /my_path/my_paramname
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

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2fssm%2fparameter]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2fssm%2fparameter%2f\))

#### Try Pulumi Cloud free.
Your team will thank you.

[Start free trial](https://app.pulumi.com/signup?utm_source=registry&utm_medium=right-rail-banner&utm_campaign=try-pulumi-cloud&iaid=docs-try-pulumi-cloud-ad)
