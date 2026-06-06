---
Source: https://www.pulumi.com/registry/packages/aws/api-docs/secretsmanager/secretversion/
Generated: 2026-06-06
Updated: 2026-06-06
---

# aws.secretsmanager.SecretVersion

1.  [Packages](/registry/)
2.  [Packages](/registry/packages/)
3.  [AWS](/registry/packages/aws/)
4.  [API Docs](/registry/packages/aws/api-docs/)
5.  [secretsmanager](/registry/packages/aws/api-docs/secretsmanager/)
6.  [SecretVersion](/registry/packages/aws/api-docs/secretsmanager/secretversion/)

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

Viewing docs for AWS v7.32.0
published on Friday, May 29, 2026 by Pulumi

[Schema (JSON)](/registry/packages/aws/schema.json)

[pulumi/pulumi-aws](https://github.com/pulumi/pulumi-aws)

v7.32.0 (7.x, latest)v6.83.1 (6.x)v5.43.0 (5.x)

# aws.secretsmanager.SecretVersion

Explore with Neo

-   Copy Page

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2fsecretsmanager%2fsecretversion]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2fsecretsmanager%2fsecretversion%2f\))

Provides a resource to manage AWS Secrets Manager secret version including its secret value. To manage secret metadata, see the `aws.secretsmanager.Secret` resource.

> **NOTE:** If the `AWSCURRENT` staging label is present on this version during resource deletion, that label cannot be removed and will be skipped to prevent errors when fully deleting the secret. That label will leave this secret version active even after the resource is deleted from this provider unless the secret itself is deleted. Move the `AWSCURRENT` staging label before or after deleting this resource from this provider to fully trigger version deprecation if necessary.

## Example Usage

### Simple String Value

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

const example = new aws.secretsmanager.SecretVersion("example", {
    secretId: exampleAwsSecretsmanagerSecret.id,
    secretString: "example-string-to-protect",
});
```

```python
import pulumi
import pulumi_aws as aws

example = aws.secretsmanager.SecretVersion("example",
    secret_id=example_aws_secretsmanager_secret["id"],
    secret_string="example-string-to-protect")
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/secretsmanager"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		_, err := secretsmanager.NewSecretVersion(ctx, "example", &secretsmanager.SecretVersionArgs{
			SecretId:     pulumi.Any(exampleAwsSecretsmanagerSecret.Id),
			SecretString: pulumi.String("example-string-to-protect"),
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
    var example = new Aws.SecretsManager.SecretVersion("example", new()
    {
        SecretId = exampleAwsSecretsmanagerSecret.Id,
        SecretString = "example-string-to-protect",
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.secretsmanager.SecretVersion;
import com.pulumi.aws.secretsmanager.SecretVersionArgs;
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
        var example = new SecretVersion("example", SecretVersionArgs.builder()
            .secretId(exampleAwsSecretsmanagerSecret.id())
            .secretString("example-string-to-protect")
            .build());

    }
}
```

```yaml
resources:
  example:
    type: aws:secretsmanager:SecretVersion
    properties:
      secretId: ${exampleAwsSecretsmanagerSecret.id}
      secretString: example-string-to-protect
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_secretsmanager_secretversion" "example" {
  secret_id     = exampleAwsSecretsmanagerSecret.id
  secret_string = "example-string-to-protect"
}
```

### Key-Value Pairs

Secrets Manager also accepts key-value pairs in JSON.

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

const config = new pulumi.Config();
const example = config.getObject<Record<string, string>>("example") || {
    key1: "value1",
    key2: "value2",
};
const exampleSecretVersion = new aws.secretsmanager.SecretVersion("example", {
    secretId: exampleAwsSecretsmanagerSecret.id,
    secretString: JSON.stringify(example),
});
```

```python
import pulumi
import json
import pulumi_aws as aws

config = pulumi.Config()
example = config.get_object("example")
if example is None:
    example = {
        "key1": "value1",
        "key2": "value2",
    }
example_secret_version = aws.secretsmanager.SecretVersion("example",
    secret_id=example_aws_secretsmanager_secret["id"],
    secret_string=json.dumps(example))
```

```go
package main

import (
	"encoding/json"

	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/secretsmanager"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi/config"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		cfg := config.New(ctx, "")
		example := map[string]interface{}{
			"key1": "value1",
			"key2": "value2",
		}
		if param := cfg.GetObject("example"); param != nil {
			example = param
		}
		tmpJSON0, err := json.Marshal(example)
		if err != nil {
			return err
		}
		json0 := string(tmpJSON0)
		_, err = secretsmanager.NewSecretVersion(ctx, "example", &secretsmanager.SecretVersionArgs{
			SecretId:     pulumi.Any(exampleAwsSecretsmanagerSecret.Id),
			SecretString: pulumi.String(pulumi.String(json0)),
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
    var config = new Config();
    var example = config.GetObject<Dictionary<string, string>>("example") ??
    {
        { "key1", "value1" },
        { "key2", "value2" },
    };
    var exampleSecretVersion = new Aws.SecretsManager.SecretVersion("example", new()
    {
        SecretId = exampleAwsSecretsmanagerSecret.Id,
        SecretString = JsonSerializer.Serialize(example),
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.secretsmanager.SecretVersion;
import com.pulumi.aws.secretsmanager.SecretVersionArgs;
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
        final var config = ctx.config();
        final var example = config.get("example").orElse(Map.ofEntries(
            Map.entry("key1", "value1"),
            Map.entry("key2", "value2")
        ));
        var exampleSecretVersion = new SecretVersion("exampleSecretVersion", SecretVersionArgs.builder()
            .secretId(exampleAwsSecretsmanagerSecret.id())
            .secretString(serializeJson(
                example))
            .build());

    }
}
```

```yaml
configuration:
  # The map here can come from other supported configurations
  # like locals, resource attribute, map() built-in, etc.
  example:
    type: object
    default:
      key1: value1
      key2: value2
resources:
  exampleSecretVersion:
    type: aws:secretsmanager:SecretVersion
    name: example
    properties:
      secretId: ${exampleAwsSecretsmanagerSecret.id}
      secretString:
        fn::toJSON: ${example}
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_secretsmanager_secretversion" "example" {
  secret_id     = exampleAwsSecretsmanagerSecret.id
  secret_string = jsonencode(var.example)
}

# The map here can come from other supported configurations

# like locals, resource attribute, map() built-in, etc.
variable "example" {
  type = map(string)
  default = {
    "key1" = "value1"
    "key2" = "value2"
  }
}
```

Reading key-value pairs from JSON back into a native map

-   TypeScript
-   Python
-   Go
-   C#
-   Java
-   YAML
-   HCL PREVIEW

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as std from "@pulumi/std";

export const example = std.jsondecode({
    input: exampleAwsSecretsmanagerSecretVersion.secretString,
}).then(invoke => invoke.result?.key1);
```

```python
import pulumi
import pulumi_std as std

pulumi.export("example", std.jsondecode(input=example_aws_secretsmanager_secret_version["secretString"]).result["key1"])
```

```go
package main

import (
	"github.com/pulumi/pulumi-std/sdk/go/std"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		ctx.Export("example", pulumi.Any(std.Jsondecode(ctx, &std.JsondecodeArgs{
			Input: exampleAwsSecretsmanagerSecretVersion.SecretString,
		}, nil).Result.Key1))
		return nil
	})
}
```

```csharp
using System.Collections.Generic;
using System.Linq;
using Pulumi;
using Std = Pulumi.Std;

return await Deployment.RunAsync(() =>
{
    return new Dictionary<string, object?>
    {
        ["example"] = Std.Jsondecode.Invoke(new()
        {
            Input = exampleAwsSecretsmanagerSecretVersion.SecretString,
        }).Apply(invoke => invoke.Result?.Key1),
    };
});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.std.StdFunctions;
import com.pulumi.std.inputs.JsondecodeArgs;
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
        ctx.export("example", StdFunctions.jsondecode(JsondecodeArgs.builder()
            .input(exampleAwsSecretsmanagerSecretVersion.secretString())
            .build()).result().key1());
    }
}
```

```yaml
outputs:
  example:
    fn::invoke:
      function: std:jsondecode
      arguments:
        input: ${exampleAwsSecretsmanagerSecretVersion.secretString}
      return: result.key1
```

```hcl
pulumi {
  required_providers {
    std = {
      source = "pulumi/std"
    }
  }
}

output "example" {
  value = jsondecode(exampleAwsSecretsmanagerSecretVersion.secretString)["key1"]
}
```

## Create SecretVersion Resource

Resources are created with functions called constructors. To learn more about declaring and configuring resources, see [Resources](/docs/concepts/resources/).

### Constructor syntax

-   TypeScript
-   Python
-   Go
-   C#
-   Java
-   YAML
-   HCL PREVIEW

```typescript
new SecretVersion(name: string, args: SecretVersionArgs, opts?: CustomResourceOptions);
```

```python
@overload
def SecretVersion(resource_name: str,
                  args: SecretVersionArgs,
                  opts: Optional[ResourceOptions] = None)

@overload
def SecretVersion(resource_name: str,
                  opts: Optional[ResourceOptions] = None,
                  secret_id: Optional[str] = None,
                  region: Optional[str] = None,
                  secret_binary: Optional[str] = None,
                  secret_string: Optional[str] = None,
                  secret_string_wo: Optional[str] = None,
                  secret_string_wo_version: Optional[int] = None,
                  version_stages: Optional[Sequence[str]] = None)
```

```go
func NewSecretVersion(ctx *Context, name string, args SecretVersionArgs, opts ...ResourceOption) (*SecretVersion, error)
```

```csharp
public SecretVersion(string name, SecretVersionArgs args, CustomResourceOptions? opts = null)
```

```java
public SecretVersion(String name, SecretVersionArgs args)
public SecretVersion(String name, SecretVersionArgs args, CustomResourceOptions options)
```

```yaml
type: aws:secretsmanager:SecretVersion
properties: # The arguments to resource properties.
options: # Bag of options to control resource's behavior.
```

```hcl
resource "aws_secretsmanager_secretversion" "name" {
    # resource properties
}
```

#### Parameters

name This property is required. string

The unique name of the resource.

args This property is required. [SecretVersionArgs](#inputs)

The arguments to resource properties.

opts [CustomResourceOptions](/docs/reference/pkg/nodejs/pulumi/pulumi/#CustomResourceOptions)

Bag of options to control resource's behavior.

resource\_name This property is required. str

The unique name of the resource.

args This property is required. [SecretVersionArgs](#inputs)

The arguments to resource properties.

opts [ResourceOptions](/docs/reference/pkg/python/pulumi/#pulumi.ResourceOptions)

Bag of options to control resource's behavior.

ctx [Context](https://pkg.go.dev/github.com/pulumi/pulumi/sdk/v3/go/pulumi?tab=doc#Context)

Context object for the current deployment.

name This property is required. string

The unique name of the resource.

args This property is required. [SecretVersionArgs](#inputs)

The arguments to resource properties.

opts [ResourceOption](https://pkg.go.dev/github.com/pulumi/pulumi/sdk/v3/go/pulumi?tab=doc#ResourceOption)

Bag of options to control resource's behavior.

name This property is required. string

The unique name of the resource.

args This property is required. [SecretVersionArgs](#inputs)

The arguments to resource properties.

opts [CustomResourceOptions](/docs/reference/pkg/dotnet/Pulumi/Pulumi.CustomResourceOptions.html)

Bag of options to control resource's behavior.

name This property is required. String

The unique name of the resource.

args This property is required. [SecretVersionArgs](#inputs)

The arguments to resource properties.

options CustomResourceOptions

Bag of options to control resource's behavior.

### Constructor example

The following reference example uses placeholder values for all [input properties](#inputs).

-   TypeScript
-   Python
-   Go
-   C#
-   Java
-   YAML
-   HCL PREVIEW

```csharp
var secretVersionResource = new Aws.SecretsManager.SecretVersion("secretVersionResource", new()
{
    SecretId = "string",
    Region = "string",
    SecretBinary = "string",
    SecretString = "string",
    SecretStringWo = "string",
    SecretStringWoVersion = 0,
    VersionStages = new[]
    {
        "string",
    },
});
```

```go
example, err := secretsmanager.NewSecretVersion(ctx, "secretVersionResource", &secretsmanager.SecretVersionArgs{
	SecretId:              pulumi.String("string"),
	Region:                pulumi.String("string"),
	SecretBinary:          pulumi.String("string"),
	SecretString:          pulumi.String("string"),
	SecretStringWo:        pulumi.String("string"),
	SecretStringWoVersion: pulumi.Int(0),
	VersionStages: pulumi.StringArray{
		pulumi.String("string"),
	},
})
```

```hcl
resource "aws_secretsmanager_secretversion" "secretVersionResource" {
  secret_id                = "string"
  region                   = "string"
  secret_binary            = "string"
  secret_string            = "string"
  secret_string_wo         = "string"
  secret_string_wo_version = 0
  version_stages           = ["string"]
}
```

```java
var secretVersionResource = new SecretVersion("secretVersionResource", SecretVersionArgs.builder()
    .secretId("string")
    .region("string")
    .secretBinary("string")
    .secretString("string")
    .secretStringWo("string")
    .secretStringWoVersion(0)
    .versionStages("string")
    .build());
```

```python
secret_version_resource = aws.secretsmanager.SecretVersion("secretVersionResource",
    secret_id="string",
    region="string",
    secret_binary="string",
    secret_string="string",
    secret_string_wo="string",
    secret_string_wo_version=0,
    version_stages=["string"])
```

```typescript
const secretVersionResource = new aws.secretsmanager.SecretVersion("secretVersionResource", {
    secretId: "string",
    region: "string",
    secretBinary: "string",
    secretString: "string",
    secretStringWo: "string",
    secretStringWoVersion: 0,
    versionStages: ["string"],
});
```

```yaml
type: aws:secretsmanager:SecretVersion
properties:
    region: string
    secretBinary: string
    secretId: string
    secretString: string
    secretStringWo: string
    secretStringWoVersion: 0
    versionStages:
        - string
```

## SecretVersion Resource Properties

To learn more about resource properties and how to use them, see [Inputs and Outputs](/docs/intro/concepts/inputs-outputs) in the Architecture and Concepts docs.

### Inputs

In Python, inputs that are objects can be passed either as [argument classes or as dictionary literals](/docs/languages-sdks/python/#inputs-and-outputs).

The SecretVersion resource accepts the following [input](/docs/intro/concepts/inputs-outputs) properties:

[SecretId](#secretid_csharp)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

Specifies the secret to which you want to add a new version. You can specify either the Amazon Resource Name (ARN) or the friendly name of the secret. The secret must already exist.

[Region](#region_csharp) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[SecretBinary](#secretbinary_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Specifies binary data that you want to encrypt and store in this version of the secret. This is required if `secretString` or `secretStringWo` is not set. Needs to be encoded to base64.

[SecretString](#secretstring_csharp) string

Specifies text data that you want to encrypt and store in this version of the secret. This is required if `secretBinary` or `secretStringWo` is not set.

[SecretStringWo](#secretstringwo_csharp) string

**NOTE:** This field is write-only and its value will not be updated in state as part of read operations. Specifies text data that you want to encrypt and store in this version of the secret. This is required if `secretBinary` or `secretString` is not set.

[SecretStringWoVersion](#secretstringwoversion_csharp) int

Used together with `secretStringWo` to trigger an update. Increment this value when an update to `secretStringWo` is required.

[VersionStages](#versionstages_csharp) List<string>

Specifies a list of staging labels that are attached to this version of the secret. A staging label must be unique to a single version of the secret. If you specify a staging label that's already associated with a different version of the same secret then that staging label is automatically removed from the other version and attached to this version. If you do not specify a value, then AWS Secrets Manager automatically moves the staging label `AWSCURRENT` to this new version on creation.

> **NOTE:** If `versionStages` is configured, you must include the `AWSCURRENT` staging label if this secret version is the only version or if the label is currently present on this secret version, otherwise this provider will show a perpetual difference.

[SecretId](#secretid_go)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

Specifies the secret to which you want to add a new version. You can specify either the Amazon Resource Name (ARN) or the friendly name of the secret. The secret must already exist.

[Region](#region_go) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[SecretBinary](#secretbinary_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Specifies binary data that you want to encrypt and store in this version of the secret. This is required if `secretString` or `secretStringWo` is not set. Needs to be encoded to base64.

[SecretString](#secretstring_go) string

Specifies text data that you want to encrypt and store in this version of the secret. This is required if `secretBinary` or `secretStringWo` is not set.

[SecretStringWo](#secretstringwo_go) string

**NOTE:** This field is write-only and its value will not be updated in state as part of read operations. Specifies text data that you want to encrypt and store in this version of the secret. This is required if `secretBinary` or `secretString` is not set.

[SecretStringWoVersion](#secretstringwoversion_go) int

Used together with `secretStringWo` to trigger an update. Increment this value when an update to `secretStringWo` is required.

[VersionStages](#versionstages_go) \[\]string

Specifies a list of staging labels that are attached to this version of the secret. A staging label must be unique to a single version of the secret. If you specify a staging label that's already associated with a different version of the same secret then that staging label is automatically removed from the other version and attached to this version. If you do not specify a value, then AWS Secrets Manager automatically moves the staging label `AWSCURRENT` to this new version on creation.

> **NOTE:** If `versionStages` is configured, you must include the `AWSCURRENT` staging label if this secret version is the only version or if the label is currently present on this secret version, otherwise this provider will show a perpetual difference.

[secret\_id](#secret_id_hcl)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

Specifies the secret to which you want to add a new version. You can specify either the Amazon Resource Name (ARN) or the friendly name of the secret. The secret must already exist.

[region](#region_hcl) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[secret\_binary](#secret_binary_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Specifies binary data that you want to encrypt and store in this version of the secret. This is required if `secretString` or `secretStringWo` is not set. Needs to be encoded to base64.

[secret\_string](#secret_string_hcl) string

Specifies text data that you want to encrypt and store in this version of the secret. This is required if `secretBinary` or `secretStringWo` is not set.

[secret\_string\_wo](#secret_string_wo_hcl) string

**NOTE:** This field is write-only and its value will not be updated in state as part of read operations. Specifies text data that you want to encrypt and store in this version of the secret. This is required if `secretBinary` or `secretString` is not set.

[secret\_string\_wo\_version](#secret_string_wo_version_hcl) number

Used together with `secretStringWo` to trigger an update. Increment this value when an update to `secretStringWo` is required.

[version\_stages](#version_stages_hcl) list(string)

Specifies a list of staging labels that are attached to this version of the secret. A staging label must be unique to a single version of the secret. If you specify a staging label that's already associated with a different version of the same secret then that staging label is automatically removed from the other version and attached to this version. If you do not specify a value, then AWS Secrets Manager automatically moves the staging label `AWSCURRENT` to this new version on creation.

> **NOTE:** If `versionStages` is configured, you must include the `AWSCURRENT` staging label if this secret version is the only version or if the label is currently present on this secret version, otherwise this provider will show a perpetual difference.

[secretId](#secretid_java)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

String

Specifies the secret to which you want to add a new version. You can specify either the Amazon Resource Name (ARN) or the friendly name of the secret. The secret must already exist.

[region](#region_java) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[secretBinary](#secretbinary_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Specifies binary data that you want to encrypt and store in this version of the secret. This is required if `secretString` or `secretStringWo` is not set. Needs to be encoded to base64.

[secretString](#secretstring_java) String

Specifies text data that you want to encrypt and store in this version of the secret. This is required if `secretBinary` or `secretStringWo` is not set.

[secretStringWo](#secretstringwo_java) String

**NOTE:** This field is write-only and its value will not be updated in state as part of read operations. Specifies text data that you want to encrypt and store in this version of the secret. This is required if `secretBinary` or `secretString` is not set.

[secretStringWoVersion](#secretstringwoversion_java) Integer

Used together with `secretStringWo` to trigger an update. Increment this value when an update to `secretStringWo` is required.

[versionStages](#versionstages_java) List<String>

Specifies a list of staging labels that are attached to this version of the secret. A staging label must be unique to a single version of the secret. If you specify a staging label that's already associated with a different version of the same secret then that staging label is automatically removed from the other version and attached to this version. If you do not specify a value, then AWS Secrets Manager automatically moves the staging label `AWSCURRENT` to this new version on creation.

> **NOTE:** If `versionStages` is configured, you must include the `AWSCURRENT` staging label if this secret version is the only version or if the label is currently present on this secret version, otherwise this provider will show a perpetual difference.

[secretId](#secretid_nodejs)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

Specifies the secret to which you want to add a new version. You can specify either the Amazon Resource Name (ARN) or the friendly name of the secret. The secret must already exist.

[region](#region_nodejs) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[secretBinary](#secretbinary_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Specifies binary data that you want to encrypt and store in this version of the secret. This is required if `secretString` or `secretStringWo` is not set. Needs to be encoded to base64.

[secretString](#secretstring_nodejs) string

Specifies text data that you want to encrypt and store in this version of the secret. This is required if `secretBinary` or `secretStringWo` is not set.

[secretStringWo](#secretstringwo_nodejs) string

**NOTE:** This field is write-only and its value will not be updated in state as part of read operations. Specifies text data that you want to encrypt and store in this version of the secret. This is required if `secretBinary` or `secretString` is not set.

[secretStringWoVersion](#secretstringwoversion_nodejs) number

Used together with `secretStringWo` to trigger an update. Increment this value when an update to `secretStringWo` is required.

[versionStages](#versionstages_nodejs) string\[\]

Specifies a list of staging labels that are attached to this version of the secret. A staging label must be unique to a single version of the secret. If you specify a staging label that's already associated with a different version of the same secret then that staging label is automatically removed from the other version and attached to this version. If you do not specify a value, then AWS Secrets Manager automatically moves the staging label `AWSCURRENT` to this new version on creation.

> **NOTE:** If `versionStages` is configured, you must include the `AWSCURRENT` staging label if this secret version is the only version or if the label is currently present on this secret version, otherwise this provider will show a perpetual difference.

[secret\_id](#secret_id_python)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

str

Specifies the secret to which you want to add a new version. You can specify either the Amazon Resource Name (ARN) or the friendly name of the secret. The secret must already exist.

[region](#region_python) str

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[secret\_binary](#secret_binary_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Specifies binary data that you want to encrypt and store in this version of the secret. This is required if `secretString` or `secretStringWo` is not set. Needs to be encoded to base64.

[secret\_string](#secret_string_python) str

Specifies text data that you want to encrypt and store in this version of the secret. This is required if `secretBinary` or `secretStringWo` is not set.

[secret\_string\_wo](#secret_string_wo_python) str

**NOTE:** This field is write-only and its value will not be updated in state as part of read operations. Specifies text data that you want to encrypt and store in this version of the secret. This is required if `secretBinary` or `secretString` is not set.

[secret\_string\_wo\_version](#secret_string_wo_version_python) int

Used together with `secretStringWo` to trigger an update. Increment this value when an update to `secretStringWo` is required.

[version\_stages](#version_stages_python) Sequence\[str\]

Specifies a list of staging labels that are attached to this version of the secret. A staging label must be unique to a single version of the secret. If you specify a staging label that's already associated with a different version of the same secret then that staging label is automatically removed from the other version and attached to this version. If you do not specify a value, then AWS Secrets Manager automatically moves the staging label `AWSCURRENT` to this new version on creation.

> **NOTE:** If `versionStages` is configured, you must include the `AWSCURRENT` staging label if this secret version is the only version or if the label is currently present on this secret version, otherwise this provider will show a perpetual difference.

[secretId](#secretid_yaml)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

String

Specifies the secret to which you want to add a new version. You can specify either the Amazon Resource Name (ARN) or the friendly name of the secret. The secret must already exist.

[region](#region_yaml) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[secretBinary](#secretbinary_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Specifies binary data that you want to encrypt and store in this version of the secret. This is required if `secretString` or `secretStringWo` is not set. Needs to be encoded to base64.

[secretString](#secretstring_yaml) String

Specifies text data that you want to encrypt and store in this version of the secret. This is required if `secretBinary` or `secretStringWo` is not set.

[secretStringWo](#secretstringwo_yaml) String

**NOTE:** This field is write-only and its value will not be updated in state as part of read operations. Specifies text data that you want to encrypt and store in this version of the secret. This is required if `secretBinary` or `secretString` is not set.

[secretStringWoVersion](#secretstringwoversion_yaml) Number

Used together with `secretStringWo` to trigger an update. Increment this value when an update to `secretStringWo` is required.

[versionStages](#versionstages_yaml) List<String>

Specifies a list of staging labels that are attached to this version of the secret. A staging label must be unique to a single version of the secret. If you specify a staging label that's already associated with a different version of the same secret then that staging label is automatically removed from the other version and attached to this version. If you do not specify a value, then AWS Secrets Manager automatically moves the staging label `AWSCURRENT` to this new version on creation.

> **NOTE:** If `versionStages` is configured, you must include the `AWSCURRENT` staging label if this secret version is the only version or if the label is currently present on this secret version, otherwise this provider will show a perpetual difference.

### Outputs

All [input](#inputs) properties are implicitly available as output properties. Additionally, the SecretVersion resource produces the following output properties:

[Arn](#arn_csharp) string

(**Deprecated**) The ARN of the secret. Use `secretArn` instead.

Deprecated: arn is deprecated. Use secretArn instead.

[HasSecretStringWo](#hassecretstringwo_csharp) bool

[Id](#id_csharp) string

The provider-assigned unique ID for this managed resource.

[SecretArn](#secretarn_csharp) string

The ARN of the secret.

[VersionId](#versionid_csharp) string

The unique identifier of the version of the secret.

[Arn](#arn_go) string

(**Deprecated**) The ARN of the secret. Use `secretArn` instead.

Deprecated: arn is deprecated. Use secretArn instead.

[HasSecretStringWo](#hassecretstringwo_go) bool

[Id](#id_go) string

The provider-assigned unique ID for this managed resource.

[SecretArn](#secretarn_go) string

The ARN of the secret.

[VersionId](#versionid_go) string

The unique identifier of the version of the secret.

[arn](#arn_hcl) string

(**Deprecated**) The ARN of the secret. Use `secretArn` instead.

Deprecated: arn is deprecated. Use secretArn instead.

[has\_secret\_string\_wo](#has_secret_string_wo_hcl) bool

[id](#id_hcl) string

The provider-assigned unique ID for this managed resource.

[secret\_arn](#secret_arn_hcl) string

The ARN of the secret.

[version\_id](#version_id_hcl) string

The unique identifier of the version of the secret.

[arn](#arn_java) String

(**Deprecated**) The ARN of the secret. Use `secretArn` instead.

Deprecated: arn is deprecated. Use secretArn instead.

[hasSecretStringWo](#hassecretstringwo_java) Boolean

[id](#id_java) String

The provider-assigned unique ID for this managed resource.

[secretArn](#secretarn_java) String

The ARN of the secret.

[versionId](#versionid_java) String

The unique identifier of the version of the secret.

[arn](#arn_nodejs) string

(**Deprecated**) The ARN of the secret. Use `secretArn` instead.

Deprecated: arn is deprecated. Use secretArn instead.

[hasSecretStringWo](#hassecretstringwo_nodejs) boolean

[id](#id_nodejs) string

The provider-assigned unique ID for this managed resource.

[secretArn](#secretarn_nodejs) string

The ARN of the secret.

[versionId](#versionid_nodejs) string

The unique identifier of the version of the secret.

[arn](#arn_python) str

(**Deprecated**) The ARN of the secret. Use `secretArn` instead.

Deprecated: arn is deprecated. Use secretArn instead.

[has\_secret\_string\_wo](#has_secret_string_wo_python) bool

[id](#id_python) str

The provider-assigned unique ID for this managed resource.

[secret\_arn](#secret_arn_python) str

The ARN of the secret.

[version\_id](#version_id_python) str

The unique identifier of the version of the secret.

[arn](#arn_yaml) String

(**Deprecated**) The ARN of the secret. Use `secretArn` instead.

Deprecated: arn is deprecated. Use secretArn instead.

[hasSecretStringWo](#hassecretstringwo_yaml) Boolean

[id](#id_yaml) String

The provider-assigned unique ID for this managed resource.

[secretArn](#secretarn_yaml) String

The ARN of the secret.

[versionId](#versionid_yaml) String

The unique identifier of the version of the secret.

## Look up Existing SecretVersion Resource

Get an existing SecretVersion resource’s state with the given name, ID, and optional extra properties used to qualify the lookup.

-   TypeScript
-   Python
-   Go
-   C#
-   Java
-   YAML
-   HCL PREVIEW

```typescript
public static get(name: string, id: Input<ID>, state?: SecretVersionState, opts?: CustomResourceOptions): SecretVersion
```

```python
@staticmethod
def get(resource_name: str,
        id: str,
        opts: Optional[ResourceOptions] = None,
        arn: Optional[str] = None,
        has_secret_string_wo: Optional[bool] = None,
        region: Optional[str] = None,
        secret_arn: Optional[str] = None,
        secret_binary: Optional[str] = None,
        secret_id: Optional[str] = None,
        secret_string: Optional[str] = None,
        secret_string_wo: Optional[str] = None,
        secret_string_wo_version: Optional[int] = None,
        version_id: Optional[str] = None,
        version_stages: Optional[Sequence[str]] = None) -> SecretVersion
```

```go
func GetSecretVersion(ctx *Context, name string, id IDInput, state *SecretVersionState, opts ...ResourceOption) (*SecretVersion, error)
```

```csharp
public static SecretVersion Get(string name, Input<string> id, SecretVersionState? state, CustomResourceOptions? opts = null)
```

```java
public static SecretVersion get(String name, Output<String> id, SecretVersionState state, CustomResourceOptions options)
```

```yaml
resources:  _:    type: aws:secretsmanager:SecretVersion    get:      id: ${id}
```

```hcl
import {
  to = aws_secretsmanager_secretversion.example
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

(**Deprecated**) The ARN of the secret. Use `secretArn` instead.

Deprecated: arn is deprecated. Use secretArn instead.

[HasSecretStringWo](#state_hassecretstringwo_csharp) bool

[Region](#state_region_csharp) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[SecretArn](#state_secretarn_csharp) string

The ARN of the secret.

[SecretBinary](#state_secretbinary_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Specifies binary data that you want to encrypt and store in this version of the secret. This is required if `secretString` or `secretStringWo` is not set. Needs to be encoded to base64.

[SecretId](#state_secretid_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Specifies the secret to which you want to add a new version. You can specify either the Amazon Resource Name (ARN) or the friendly name of the secret. The secret must already exist.

[SecretString](#state_secretstring_csharp) string

Specifies text data that you want to encrypt and store in this version of the secret. This is required if `secretBinary` or `secretStringWo` is not set.

[SecretStringWo](#state_secretstringwo_csharp) string

**NOTE:** This field is write-only and its value will not be updated in state as part of read operations. Specifies text data that you want to encrypt and store in this version of the secret. This is required if `secretBinary` or `secretString` is not set.

[SecretStringWoVersion](#state_secretstringwoversion_csharp) int

Used together with `secretStringWo` to trigger an update. Increment this value when an update to `secretStringWo` is required.

[VersionId](#state_versionid_csharp) string

The unique identifier of the version of the secret.

[VersionStages](#state_versionstages_csharp) List<string>

Specifies a list of staging labels that are attached to this version of the secret. A staging label must be unique to a single version of the secret. If you specify a staging label that's already associated with a different version of the same secret then that staging label is automatically removed from the other version and attached to this version. If you do not specify a value, then AWS Secrets Manager automatically moves the staging label `AWSCURRENT` to this new version on creation.

> **NOTE:** If `versionStages` is configured, you must include the `AWSCURRENT` staging label if this secret version is the only version or if the label is currently present on this secret version, otherwise this provider will show a perpetual difference.

[Arn](#state_arn_go) string

(**Deprecated**) The ARN of the secret. Use `secretArn` instead.

Deprecated: arn is deprecated. Use secretArn instead.

[HasSecretStringWo](#state_hassecretstringwo_go) bool

[Region](#state_region_go) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[SecretArn](#state_secretarn_go) string

The ARN of the secret.

[SecretBinary](#state_secretbinary_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Specifies binary data that you want to encrypt and store in this version of the secret. This is required if `secretString` or `secretStringWo` is not set. Needs to be encoded to base64.

[SecretId](#state_secretid_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Specifies the secret to which you want to add a new version. You can specify either the Amazon Resource Name (ARN) or the friendly name of the secret. The secret must already exist.

[SecretString](#state_secretstring_go) string

Specifies text data that you want to encrypt and store in this version of the secret. This is required if `secretBinary` or `secretStringWo` is not set.

[SecretStringWo](#state_secretstringwo_go) string

**NOTE:** This field is write-only and its value will not be updated in state as part of read operations. Specifies text data that you want to encrypt and store in this version of the secret. This is required if `secretBinary` or `secretString` is not set.

[SecretStringWoVersion](#state_secretstringwoversion_go) int

Used together with `secretStringWo` to trigger an update. Increment this value when an update to `secretStringWo` is required.

[VersionId](#state_versionid_go) string

The unique identifier of the version of the secret.

[VersionStages](#state_versionstages_go) \[\]string

Specifies a list of staging labels that are attached to this version of the secret. A staging label must be unique to a single version of the secret. If you specify a staging label that's already associated with a different version of the same secret then that staging label is automatically removed from the other version and attached to this version. If you do not specify a value, then AWS Secrets Manager automatically moves the staging label `AWSCURRENT` to this new version on creation.

> **NOTE:** If `versionStages` is configured, you must include the `AWSCURRENT` staging label if this secret version is the only version or if the label is currently present on this secret version, otherwise this provider will show a perpetual difference.

[arn](#state_arn_hcl) string

(**Deprecated**) The ARN of the secret. Use `secretArn` instead.

Deprecated: arn is deprecated. Use secretArn instead.

[has\_secret\_string\_wo](#state_has_secret_string_wo_hcl) bool

[region](#state_region_hcl) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[secret\_arn](#state_secret_arn_hcl) string

The ARN of the secret.

[secret\_binary](#state_secret_binary_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Specifies binary data that you want to encrypt and store in this version of the secret. This is required if `secretString` or `secretStringWo` is not set. Needs to be encoded to base64.

[secret\_id](#state_secret_id_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Specifies the secret to which you want to add a new version. You can specify either the Amazon Resource Name (ARN) or the friendly name of the secret. The secret must already exist.

[secret\_string](#state_secret_string_hcl) string

Specifies text data that you want to encrypt and store in this version of the secret. This is required if `secretBinary` or `secretStringWo` is not set.

[secret\_string\_wo](#state_secret_string_wo_hcl) string

**NOTE:** This field is write-only and its value will not be updated in state as part of read operations. Specifies text data that you want to encrypt and store in this version of the secret. This is required if `secretBinary` or `secretString` is not set.

[secret\_string\_wo\_version](#state_secret_string_wo_version_hcl) number

Used together with `secretStringWo` to trigger an update. Increment this value when an update to `secretStringWo` is required.

[version\_id](#state_version_id_hcl) string

The unique identifier of the version of the secret.

[version\_stages](#state_version_stages_hcl) list(string)

Specifies a list of staging labels that are attached to this version of the secret. A staging label must be unique to a single version of the secret. If you specify a staging label that's already associated with a different version of the same secret then that staging label is automatically removed from the other version and attached to this version. If you do not specify a value, then AWS Secrets Manager automatically moves the staging label `AWSCURRENT` to this new version on creation.

> **NOTE:** If `versionStages` is configured, you must include the `AWSCURRENT` staging label if this secret version is the only version or if the label is currently present on this secret version, otherwise this provider will show a perpetual difference.

[arn](#state_arn_java) String

(**Deprecated**) The ARN of the secret. Use `secretArn` instead.

Deprecated: arn is deprecated. Use secretArn instead.

[hasSecretStringWo](#state_hassecretstringwo_java) Boolean

[region](#state_region_java) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[secretArn](#state_secretarn_java) String

The ARN of the secret.

[secretBinary](#state_secretbinary_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Specifies binary data that you want to encrypt and store in this version of the secret. This is required if `secretString` or `secretStringWo` is not set. Needs to be encoded to base64.

[secretId](#state_secretid_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Specifies the secret to which you want to add a new version. You can specify either the Amazon Resource Name (ARN) or the friendly name of the secret. The secret must already exist.

[secretString](#state_secretstring_java) String

Specifies text data that you want to encrypt and store in this version of the secret. This is required if `secretBinary` or `secretStringWo` is not set.

[secretStringWo](#state_secretstringwo_java) String

**NOTE:** This field is write-only and its value will not be updated in state as part of read operations. Specifies text data that you want to encrypt and store in this version of the secret. This is required if `secretBinary` or `secretString` is not set.

[secretStringWoVersion](#state_secretstringwoversion_java) Integer

Used together with `secretStringWo` to trigger an update. Increment this value when an update to `secretStringWo` is required.

[versionId](#state_versionid_java) String

The unique identifier of the version of the secret.

[versionStages](#state_versionstages_java) List<String>

Specifies a list of staging labels that are attached to this version of the secret. A staging label must be unique to a single version of the secret. If you specify a staging label that's already associated with a different version of the same secret then that staging label is automatically removed from the other version and attached to this version. If you do not specify a value, then AWS Secrets Manager automatically moves the staging label `AWSCURRENT` to this new version on creation.

> **NOTE:** If `versionStages` is configured, you must include the `AWSCURRENT` staging label if this secret version is the only version or if the label is currently present on this secret version, otherwise this provider will show a perpetual difference.

[arn](#state_arn_nodejs) string

(**Deprecated**) The ARN of the secret. Use `secretArn` instead.

Deprecated: arn is deprecated. Use secretArn instead.

[hasSecretStringWo](#state_hassecretstringwo_nodejs) boolean

[region](#state_region_nodejs) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[secretArn](#state_secretarn_nodejs) string

The ARN of the secret.

[secretBinary](#state_secretbinary_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Specifies binary data that you want to encrypt and store in this version of the secret. This is required if `secretString` or `secretStringWo` is not set. Needs to be encoded to base64.

[secretId](#state_secretid_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Specifies the secret to which you want to add a new version. You can specify either the Amazon Resource Name (ARN) or the friendly name of the secret. The secret must already exist.

[secretString](#state_secretstring_nodejs) string

Specifies text data that you want to encrypt and store in this version of the secret. This is required if `secretBinary` or `secretStringWo` is not set.

[secretStringWo](#state_secretstringwo_nodejs) string

**NOTE:** This field is write-only and its value will not be updated in state as part of read operations. Specifies text data that you want to encrypt and store in this version of the secret. This is required if `secretBinary` or `secretString` is not set.

[secretStringWoVersion](#state_secretstringwoversion_nodejs) number

Used together with `secretStringWo` to trigger an update. Increment this value when an update to `secretStringWo` is required.

[versionId](#state_versionid_nodejs) string

The unique identifier of the version of the secret.

[versionStages](#state_versionstages_nodejs) string\[\]

Specifies a list of staging labels that are attached to this version of the secret. A staging label must be unique to a single version of the secret. If you specify a staging label that's already associated with a different version of the same secret then that staging label is automatically removed from the other version and attached to this version. If you do not specify a value, then AWS Secrets Manager automatically moves the staging label `AWSCURRENT` to this new version on creation.

> **NOTE:** If `versionStages` is configured, you must include the `AWSCURRENT` staging label if this secret version is the only version or if the label is currently present on this secret version, otherwise this provider will show a perpetual difference.

[arn](#state_arn_python) str

(**Deprecated**) The ARN of the secret. Use `secretArn` instead.

Deprecated: arn is deprecated. Use secretArn instead.

[has\_secret\_string\_wo](#state_has_secret_string_wo_python) bool

[region](#state_region_python) str

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[secret\_arn](#state_secret_arn_python) str

The ARN of the secret.

[secret\_binary](#state_secret_binary_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Specifies binary data that you want to encrypt and store in this version of the secret. This is required if `secretString` or `secretStringWo` is not set. Needs to be encoded to base64.

[secret\_id](#state_secret_id_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Specifies the secret to which you want to add a new version. You can specify either the Amazon Resource Name (ARN) or the friendly name of the secret. The secret must already exist.

[secret\_string](#state_secret_string_python) str

Specifies text data that you want to encrypt and store in this version of the secret. This is required if `secretBinary` or `secretStringWo` is not set.

[secret\_string\_wo](#state_secret_string_wo_python) str

**NOTE:** This field is write-only and its value will not be updated in state as part of read operations. Specifies text data that you want to encrypt and store in this version of the secret. This is required if `secretBinary` or `secretString` is not set.

[secret\_string\_wo\_version](#state_secret_string_wo_version_python) int

Used together with `secretStringWo` to trigger an update. Increment this value when an update to `secretStringWo` is required.

[version\_id](#state_version_id_python) str

The unique identifier of the version of the secret.

[version\_stages](#state_version_stages_python) Sequence\[str\]

Specifies a list of staging labels that are attached to this version of the secret. A staging label must be unique to a single version of the secret. If you specify a staging label that's already associated with a different version of the same secret then that staging label is automatically removed from the other version and attached to this version. If you do not specify a value, then AWS Secrets Manager automatically moves the staging label `AWSCURRENT` to this new version on creation.

> **NOTE:** If `versionStages` is configured, you must include the `AWSCURRENT` staging label if this secret version is the only version or if the label is currently present on this secret version, otherwise this provider will show a perpetual difference.

[arn](#state_arn_yaml) String

(**Deprecated**) The ARN of the secret. Use `secretArn` instead.

Deprecated: arn is deprecated. Use secretArn instead.

[hasSecretStringWo](#state_hassecretstringwo_yaml) Boolean

[region](#state_region_yaml) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[secretArn](#state_secretarn_yaml) String

The ARN of the secret.

[secretBinary](#state_secretbinary_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Specifies binary data that you want to encrypt and store in this version of the secret. This is required if `secretString` or `secretStringWo` is not set. Needs to be encoded to base64.

[secretId](#state_secretid_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Specifies the secret to which you want to add a new version. You can specify either the Amazon Resource Name (ARN) or the friendly name of the secret. The secret must already exist.

[secretString](#state_secretstring_yaml) String

Specifies text data that you want to encrypt and store in this version of the secret. This is required if `secretBinary` or `secretStringWo` is not set.

[secretStringWo](#state_secretstringwo_yaml) String

**NOTE:** This field is write-only and its value will not be updated in state as part of read operations. Specifies text data that you want to encrypt and store in this version of the secret. This is required if `secretBinary` or `secretString` is not set.

[secretStringWoVersion](#state_secretstringwoversion_yaml) Number

Used together with `secretStringWo` to trigger an update. Increment this value when an update to `secretStringWo` is required.

[versionId](#state_versionid_yaml) String

The unique identifier of the version of the secret.

[versionStages](#state_versionstages_yaml) List<String>

Specifies a list of staging labels that are attached to this version of the secret. A staging label must be unique to a single version of the secret. If you specify a staging label that's already associated with a different version of the same secret then that staging label is automatically removed from the other version and attached to this version. If you do not specify a value, then AWS Secrets Manager automatically moves the staging label `AWSCURRENT` to this new version on creation.

> **NOTE:** If `versionStages` is configured, you must include the `AWSCURRENT` staging label if this secret version is the only version or if the label is currently present on this secret version, otherwise this provider will show a perpetual difference.

## Import

### Identity Schema

#### Required

-   `secretId` - (String) ID of the secret.
-   `versionId` - (String) ID of the secret version.

#### Optional

-   `accountId` (String) AWS Account where this resource is managed.
-   `region` (String) Region where this resource is managed.

Using `pulumi import`, import `aws.secretsmanager.SecretVersion` using the secret ID and version ID. For example:

```bash
$ pulumi import aws:secretsmanager/secretVersion:SecretVersion example 'arn:aws:secretsmanager:us-east-1:123456789012:secret:example-123456|xxxxx-xxxxxxx-xxxxxxx-xxxxx'
```

To learn more about importing existing cloud resources, see [Importing resources](/docs/using-pulumi/adopting-pulumi/import/).

## Package Details

Repository

[AWS Classic pulumi/pulumi-aws](https://github.com/pulumi/pulumi-aws)

License

Apache-2.0

Notes

This Pulumi package is based on the [`aws` Terraform Provider](https://github.com/hashicorp/terraform-provider-aws).

-   Copy Page

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2fsecretsmanager%2fsecretversion]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2fsecretsmanager%2fsecretversion%2f\))

#### Try Pulumi Cloud free.
Your team will thank you.

[Start free trial](https://app.pulumi.com/signup?utm_source=registry&utm_medium=right-rail-banner&utm_campaign=try-pulumi-cloud&iaid=docs-try-pulumi-cloud-ad)
