---
Source: https://www.pulumi.com/registry/packages/aws/api-docs/ssm/getparameter/
Generated: 2026-06-06
Updated: 2026-06-06
---

# aws.ssm.getParameter

1.  [Packages](/registry/)
2.  [Packages](/registry/packages/)
3.  [AWS](/registry/packages/aws/)
4.  [API Docs](/registry/packages/aws/api-docs/)
5.  [ssm](/registry/packages/aws/api-docs/ssm/)
6.  [getParameter](/registry/packages/aws/api-docs/ssm/getparameter/)

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

Viewing docs for AWS v7.32.0
published on Friday, May 29, 2026 by Pulumi

[Schema (JSON)](/registry/packages/aws/schema.json)

[pulumi/pulumi-aws](https://github.com/pulumi/pulumi-aws)

v7.32.0 (7.x, latest)v6.83.1 (6.x)v5.43.0 (5.x)

# aws.ssm.getParameter

Explore with Neo

-   Copy Page

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2fssm%2fgetparameter]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2fssm%2fgetparameter%2f\))

Provides an SSM Parameter data source.

## Example Usage

### Default

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

const foo = aws.ssm.getParameter({
    name: "foo",
});
```

```python
import pulumi
import pulumi_aws as aws

foo = aws.ssm.get_parameter(name="foo")
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/ssm"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		_, err := ssm.LookupParameter(ctx, &ssm.LookupParameterArgs{
			Name: "foo",
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
    var foo = Aws.Ssm.GetParameter.Invoke(new()
    {
        Name = "foo",
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.ssm.SsmFunctions;
import com.pulumi.aws.ssm.inputs.GetParameterArgs;
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
        final var foo = SsmFunctions.getParameter(GetParameterArgs.builder()
            .name("foo")
            .build());

    }
}
```

```yaml
variables:
  foo:
    fn::invoke:
      function: aws:ssm:getParameter
      arguments:
        name: foo
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

data "aws_ssm_getparameter" "foo" {
  name = "foo"
}
```

### With version

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

const foo = aws.ssm.getParameter({
    name: "foo:3",
});
```

```python
import pulumi
import pulumi_aws as aws

foo = aws.ssm.get_parameter(name="foo:3")
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/ssm"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		_, err := ssm.LookupParameter(ctx, &ssm.LookupParameterArgs{
			Name: "foo:3",
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
    var foo = Aws.Ssm.GetParameter.Invoke(new()
    {
        Name = "foo:3",
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.ssm.SsmFunctions;
import com.pulumi.aws.ssm.inputs.GetParameterArgs;
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
        final var foo = SsmFunctions.getParameter(GetParameterArgs.builder()
            .name("foo:3")
            .build());

    }
}
```

```yaml
variables:
  foo:
    fn::invoke:
      function: aws:ssm:getParameter
      arguments:
        name: foo:3
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

data "aws_ssm_getparameter" "foo" {
  name = "foo:3"
}
```

> **Note:** The unencrypted value of a SecureString will be stored in the raw state as plain-text.

## Using getParameter

Two invocation forms are available. The direct form accepts plain arguments and either blocks until the result value is available, or returns a Promise-wrapped result. The output form accepts Input-wrapped arguments and returns an Output-wrapped result.

-   TypeScript
-   Python
-   Go
-   C#
-   Java
-   YAML
-   HCL PREVIEW

```typescript
function getParameter(args: GetParameterArgs, opts?: InvokeOptions): Promise<GetParameterResult>
function getParameterOutput(args: GetParameterOutputArgs, opts?: InvokeOptions): Output<GetParameterResult>
```

```python
def get_parameter(name: Optional[str] = None,
                  region: Optional[str] = None,
                  with_decryption: Optional[bool] = None,
                  opts: Optional[InvokeOptions] = None) -> GetParameterResult
def get_parameter_output(name: pulumi.Input[Optional[str]] = None,
                  region: pulumi.Input[Optional[str]] = None,
                  with_decryption: pulumi.Input[Optional[bool]] = None,
                  opts: Optional[InvokeOptions] = None) -> Output[GetParameterResult]
```

```go
func LookupParameter(ctx *Context, args *LookupParameterArgs, opts ...InvokeOption) (*LookupParameterResult, error)
func LookupParameterOutput(ctx *Context, args *LookupParameterOutputArgs, opts ...InvokeOption) LookupParameterResultOutput
```

\> Note: This function is named `LookupParameter` in the Go SDK.

```csharp
public static class GetParameter
{
    public static Task<GetParameterResult> InvokeAsync(GetParameterArgs args, InvokeOptions? opts = null)
    public static Output<GetParameterResult> Invoke(GetParameterInvokeArgs args, InvokeOptions? opts = null)
}
```

```java
public static CompletableFuture<GetParameterResult> getParameter(GetParameterArgs args, InvokeOptions options)
public static Output<GetParameterResult> getParameter(GetParameterArgs args, InvokeOptions options)
```

```yaml
fn::invoke:
  function: aws:ssm/getParameter:getParameter
  arguments:
    # arguments dictionary
```

```hcl
data "aws_ssm_getparameter" "name" {
    # arguments
}
```

The following arguments are supported:

[Name](#name_csharp) This property is required. string

Name of the parameter. To query by parameter version use `name:version` (e.g., `foo:3`).

[Region](#region_csharp) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[WithDecryption](#withdecryption_csharp) bool

Whether to return decrypted `SecureString` value. Defaults to `true`.

[Name](#name_go) This property is required. string

Name of the parameter. To query by parameter version use `name:version` (e.g., `foo:3`).

[Region](#region_go) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[WithDecryption](#withdecryption_go) bool

Whether to return decrypted `SecureString` value. Defaults to `true`.

[name](#name_hcl) This property is required. string

Name of the parameter. To query by parameter version use `name:version` (e.g., `foo:3`).

[region](#region_hcl) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[with\_decryption](#with_decryption_hcl) bool

Whether to return decrypted `SecureString` value. Defaults to `true`.

[name](#name_java) This property is required. String

Name of the parameter. To query by parameter version use `name:version` (e.g., `foo:3`).

[region](#region_java) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[withDecryption](#withdecryption_java) Boolean

Whether to return decrypted `SecureString` value. Defaults to `true`.

[name](#name_nodejs) This property is required. string

Name of the parameter. To query by parameter version use `name:version` (e.g., `foo:3`).

[region](#region_nodejs) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[withDecryption](#withdecryption_nodejs) boolean

Whether to return decrypted `SecureString` value. Defaults to `true`.

[name](#name_python) This property is required. str

Name of the parameter. To query by parameter version use `name:version` (e.g., `foo:3`).

[region](#region_python) str

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[with\_decryption](#with_decryption_python) bool

Whether to return decrypted `SecureString` value. Defaults to `true`.

[name](#name_yaml) This property is required. String

Name of the parameter. To query by parameter version use `name:version` (e.g., `foo:3`).

[region](#region_yaml) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[withDecryption](#withdecryption_yaml) Boolean

Whether to return decrypted `SecureString` value. Defaults to `true`.

## getParameter Result

The following output properties are available:

[Arn](#arn_csharp) string

ARN of the parameter.

[Id](#id_csharp) string

The provider-assigned unique ID for this managed resource.

[InsecureValue](#insecurevalue_csharp) string

Value of the parameter. **Use caution:** This value is never marked as sensitive.

[Name](#name_csharp) string

Name of the parameter.

[Region](#region_csharp) string

[Type](#type_csharp) string

Type of the parameter. Valid types are `String`, `StringList` and `SecureString`.

[Value](#value_csharp) string

Value of the parameter. This value is always marked as sensitive in the pulumi preview output, regardless of `type`.

[Version](#version_csharp) int

Version of the parameter.

[WithDecryption](#withdecryption_csharp) bool

[Arn](#arn_go) string

ARN of the parameter.

[Id](#id_go) string

The provider-assigned unique ID for this managed resource.

[InsecureValue](#insecurevalue_go) string

Value of the parameter. **Use caution:** This value is never marked as sensitive.

[Name](#name_go) string

Name of the parameter.

[Region](#region_go) string

[Type](#type_go) string

Type of the parameter. Valid types are `String`, `StringList` and `SecureString`.

[Value](#value_go) string

Value of the parameter. This value is always marked as sensitive in the pulumi preview output, regardless of `type`.

[Version](#version_go) int

Version of the parameter.

[WithDecryption](#withdecryption_go) bool

[arn](#arn_hcl) string

ARN of the parameter.

[id](#id_hcl) string

The provider-assigned unique ID for this managed resource.

[insecure\_value](#insecure_value_hcl) string

Value of the parameter. **Use caution:** This value is never marked as sensitive.

[name](#name_hcl) string

Name of the parameter.

[region](#region_hcl) string

[type](#type_hcl) string

Type of the parameter. Valid types are `String`, `StringList` and `SecureString`.

[value](#value_hcl) string

Value of the parameter. This value is always marked as sensitive in the pulumi preview output, regardless of `type`.

[version](#version_hcl) number

Version of the parameter.

[with\_decryption](#with_decryption_hcl) bool

[arn](#arn_java) String

ARN of the parameter.

[id](#id_java) String

The provider-assigned unique ID for this managed resource.

[insecureValue](#insecurevalue_java) String

Value of the parameter. **Use caution:** This value is never marked as sensitive.

[name](#name_java) String

Name of the parameter.

[region](#region_java) String

[type](#type_java) String

Type of the parameter. Valid types are `String`, `StringList` and `SecureString`.

[value](#value_java) String

Value of the parameter. This value is always marked as sensitive in the pulumi preview output, regardless of `type`.

[version](#version_java) Integer

Version of the parameter.

[withDecryption](#withdecryption_java) Boolean

[arn](#arn_nodejs) string

ARN of the parameter.

[id](#id_nodejs) string

The provider-assigned unique ID for this managed resource.

[insecureValue](#insecurevalue_nodejs) string

Value of the parameter. **Use caution:** This value is never marked as sensitive.

[name](#name_nodejs) string

Name of the parameter.

[region](#region_nodejs) string

[type](#type_nodejs) string

Type of the parameter. Valid types are `String`, `StringList` and `SecureString`.

[value](#value_nodejs) string

Value of the parameter. This value is always marked as sensitive in the pulumi preview output, regardless of `type`.

[version](#version_nodejs) number

Version of the parameter.

[withDecryption](#withdecryption_nodejs) boolean

[arn](#arn_python) str

ARN of the parameter.

[id](#id_python) str

The provider-assigned unique ID for this managed resource.

[insecure\_value](#insecure_value_python) str

Value of the parameter. **Use caution:** This value is never marked as sensitive.

[name](#name_python) str

Name of the parameter.

[region](#region_python) str

[type](#type_python) str

Type of the parameter. Valid types are `String`, `StringList` and `SecureString`.

[value](#value_python) str

Value of the parameter. This value is always marked as sensitive in the pulumi preview output, regardless of `type`.

[version](#version_python) int

Version of the parameter.

[with\_decryption](#with_decryption_python) bool

[arn](#arn_yaml) String

ARN of the parameter.

[id](#id_yaml) String

The provider-assigned unique ID for this managed resource.

[insecureValue](#insecurevalue_yaml) String

Value of the parameter. **Use caution:** This value is never marked as sensitive.

[name](#name_yaml) String

Name of the parameter.

[region](#region_yaml) String

[type](#type_yaml) String

Type of the parameter. Valid types are `String`, `StringList` and `SecureString`.

[value](#value_yaml) String

Value of the parameter. This value is always marked as sensitive in the pulumi preview output, regardless of `type`.

[version](#version_yaml) Number

Version of the parameter.

[withDecryption](#withdecryption_yaml) Boolean

## Package Details

Repository

[AWS Classic pulumi/pulumi-aws](https://github.com/pulumi/pulumi-aws)

License

Apache-2.0

Notes

This Pulumi package is based on the [`aws` Terraform Provider](https://github.com/hashicorp/terraform-provider-aws).

-   Copy Page

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2fssm%2fgetparameter]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2fssm%2fgetparameter%2f\))

#### Try Pulumi Cloud free.
Your team will thank you.

[Start free trial](https://app.pulumi.com/signup?utm_source=registry&utm_medium=right-rail-banner&utm_campaign=try-pulumi-cloud&iaid=docs-try-pulumi-cloud-ad)
