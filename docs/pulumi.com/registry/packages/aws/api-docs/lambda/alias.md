---
Source: https://www.pulumi.com/registry/packages/aws/api-docs/lambda/alias/
Generated: 2026-06-06
Updated: 2026-06-06
---

# aws.lambda.Alias

1.  [Packages](/registry/)
2.  [Packages](/registry/packages/)
3.  [AWS](/registry/packages/aws/)
4.  [API Docs](/registry/packages/aws/api-docs/)
5.  [lambda](/registry/packages/aws/api-docs/lambda/)
6.  [Alias](/registry/packages/aws/api-docs/lambda/alias/)

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

Viewing docs for AWS v7.32.0
published on Friday, May 29, 2026 by Pulumi

[Schema (JSON)](/registry/packages/aws/schema.json)

[pulumi/pulumi-aws](https://github.com/pulumi/pulumi-aws)

v7.32.0 (7.x, latest)v6.83.1 (6.x)v5.43.0 (5.x)

# aws.lambda.Alias[](#aws-lambda-alias)

Explore with Neo

-   Copy Page

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2flambda%2falias]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2flambda%2falias%2f\))

Manages an AWS Lambda Alias. Use this resource to create an alias that points to a specific Lambda function version for traffic management and deployment strategies.

For information about Lambda and how to use it, see [What is AWS Lambda?](http://docs.aws.amazon.com/lambda/latest/dg/welcome.html). For information about function aliases, see [CreateAlias](http://docs.aws.amazon.com/lambda/latest/dg/API_CreateAlias.html) and [AliasRoutingConfiguration](https://docs.aws.amazon.com/lambda/latest/dg/API_AliasRoutingConfiguration.html) in the API docs.

## Example Usage[](#example-usage)

### Basic Alias[](#basic-alias)

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

const example = new aws.lambda.Alias("example", {
    name: "production",
    description: "Production environment alias",
    functionName: exampleAwsLambdaFunction.arn,
    functionVersion: "1",
});
```

```python
import pulumi
import pulumi_aws as aws

example = aws.lambda_.Alias("example",
    name="production",
    description="Production environment alias",
    function_name=example_aws_lambda_function["arn"],
    function_version="1")
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/lambda"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		_, err := lambda.NewAlias(ctx, "example", &lambda.AliasArgs{
			Name:            pulumi.String("production"),
			Description:     pulumi.String("Production environment alias"),
			FunctionName:    pulumi.Any(exampleAwsLambdaFunction.Arn),
			FunctionVersion: pulumi.String("1"),
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
    var example = new Aws.Lambda.Alias("example", new()
    {
        Name = "production",
        Description = "Production environment alias",
        FunctionName = exampleAwsLambdaFunction.Arn,
        FunctionVersion = "1",
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.lambda.Alias;
import com.pulumi.aws.lambda.AliasArgs;
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
        var example = new Alias("example", AliasArgs.builder()
            .name("production")
            .description("Production environment alias")
            .functionName(exampleAwsLambdaFunction.arn())
            .functionVersion("1")
            .build());

    }
}
```

```yaml
resources:
  example:
    type: aws:lambda:Alias
    properties:
      name: production
      description: Production environment alias
      functionName: ${exampleAwsLambdaFunction.arn}
      functionVersion: '1'
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_lambda_alias" "example" {
  name             = "production"
  description      = "Production environment alias"
  function_name    = exampleAwsLambdaFunction.arn
  function_version = "1"
}
```

### Alias with Traffic Splitting[](#alias-with-traffic-splitting)

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

const example = new aws.lambda.Alias("example", {
    name: "staging",
    description: "Staging environment with traffic splitting",
    functionName: exampleAwsLambdaFunction.functionName,
    functionVersion: "2",
    routingConfig: {
        additionalVersionWeights: {
            "1": 0.1,
        },
    },
});
```

```python
import pulumi
import pulumi_aws as aws

example = aws.lambda_.Alias("example",
    name="staging",
    description="Staging environment with traffic splitting",
    function_name=example_aws_lambda_function["functionName"],
    function_version="2",
    routing_config={
        "additional_version_weights": {
            "1": 0.1,
        },
    })
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/lambda"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		_, err := lambda.NewAlias(ctx, "example", &lambda.AliasArgs{
			Name:            pulumi.String("staging"),
			Description:     pulumi.String("Staging environment with traffic splitting"),
			FunctionName:    pulumi.Any(exampleAwsLambdaFunction.FunctionName),
			FunctionVersion: pulumi.String("2"),
			RoutingConfig: &lambda.AliasRoutingConfigArgs{
				AdditionalVersionWeights: pulumi.Float64Map{
					"1": pulumi.Float64(0.1),
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
using Pulumi;
using Aws = Pulumi.Aws;

return await Deployment.RunAsync(() =>
{
    var example = new Aws.Lambda.Alias("example", new()
    {
        Name = "staging",
        Description = "Staging environment with traffic splitting",
        FunctionName = exampleAwsLambdaFunction.FunctionName,
        FunctionVersion = "2",
        RoutingConfig = new Aws.Lambda.Inputs.AliasRoutingConfigArgs
        {
            AdditionalVersionWeights =
            {
                { "1", 0.1 },
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
import com.pulumi.aws.lambda.Alias;
import com.pulumi.aws.lambda.AliasArgs;
import com.pulumi.aws.lambda.inputs.AliasRoutingConfigArgs;
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
        var example = new Alias("example", AliasArgs.builder()
            .name("staging")
            .description("Staging environment with traffic splitting")
            .functionName(exampleAwsLambdaFunction.functionName())
            .functionVersion("2")
            .routingConfig(AliasRoutingConfigArgs.builder()
                .additionalVersionWeights(Map.of("1", 0.1))
                .build())
            .build());

    }
}
```

```yaml
resources:
  example:
    type: aws:lambda:Alias
    properties:
      name: staging
      description: Staging environment with traffic splitting
      functionName: ${exampleAwsLambdaFunction.functionName}
      functionVersion: '2'
      routingConfig:
        additionalVersionWeights:
          '1': 0.1
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_lambda_alias" "example" {
  name             = "staging"
  description      = "Staging environment with traffic splitting"
  function_name    = exampleAwsLambdaFunction.functionName
  function_version = "2"
  routing_config = {
    additional_version_weights = {
      "1" = 0.1
    }
  }
}
```

### Blue-Green Deployment Alias[](#blue-green-deployment-alias)

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

// Alias for gradual rollout
const example = new aws.lambda.Alias("example", {
    name: "live",
    description: "Live traffic with gradual rollout to new version",
    functionName: exampleAwsLambdaFunction.functionName,
    functionVersion: "5",
    routingConfig: {
        additionalVersionWeights: {
            "6": 0.05,
        },
    },
});
```

```python
import pulumi
import pulumi_aws as aws

# Alias for gradual rollout
example = aws.lambda_.Alias("example",
    name="live",
    description="Live traffic with gradual rollout to new version",
    function_name=example_aws_lambda_function["functionName"],
    function_version="5",
    routing_config={
        "additional_version_weights": {
            "6": 0.05,
        },
    })
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/lambda"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		// Alias for gradual rollout
		_, err := lambda.NewAlias(ctx, "example", &lambda.AliasArgs{
			Name:            pulumi.String("live"),
			Description:     pulumi.String("Live traffic with gradual rollout to new version"),
			FunctionName:    pulumi.Any(exampleAwsLambdaFunction.FunctionName),
			FunctionVersion: pulumi.String("5"),
			RoutingConfig: &lambda.AliasRoutingConfigArgs{
				AdditionalVersionWeights: pulumi.Float64Map{
					"6": pulumi.Float64(0.05),
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
using Pulumi;
using Aws = Pulumi.Aws;

return await Deployment.RunAsync(() =>
{
    // Alias for gradual rollout
    var example = new Aws.Lambda.Alias("example", new()
    {
        Name = "live",
        Description = "Live traffic with gradual rollout to new version",
        FunctionName = exampleAwsLambdaFunction.FunctionName,
        FunctionVersion = "5",
        RoutingConfig = new Aws.Lambda.Inputs.AliasRoutingConfigArgs
        {
            AdditionalVersionWeights =
            {
                { "6", 0.05 },
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
import com.pulumi.aws.lambda.Alias;
import com.pulumi.aws.lambda.AliasArgs;
import com.pulumi.aws.lambda.inputs.AliasRoutingConfigArgs;
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
        // Alias for gradual rollout
        var example = new Alias("example", AliasArgs.builder()
            .name("live")
            .description("Live traffic with gradual rollout to new version")
            .functionName(exampleAwsLambdaFunction.functionName())
            .functionVersion("5")
            .routingConfig(AliasRoutingConfigArgs.builder()
                .additionalVersionWeights(Map.of("6", 0.05))
                .build())
            .build());

    }
}
```

```yaml
resources:
  # Alias for gradual rollout
  example:
    type: aws:lambda:Alias
    properties:
      name: live
      description: Live traffic with gradual rollout to new version
      functionName: ${exampleAwsLambdaFunction.functionName}
      functionVersion: '5'
      routingConfig:
        additionalVersionWeights:
          '6': 0.05
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

# Alias for gradual rollout
resource "aws_lambda_alias" "example" {
  name             = "live"
  description      = "Live traffic with gradual rollout to new version"
  function_name    = exampleAwsLambdaFunction.functionName
  function_version = "5"
  routing_config = {
    additional_version_weights = {
      "6" = 0.05
    }
  }
}
```

### Development Alias[](#development-alias)

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

const example = new aws.lambda.Alias("example", {
    name: "dev",
    description: "Development environment - always points to latest",
    functionName: exampleAwsLambdaFunction.functionName,
    functionVersion: "$LATEST",
});
```

```python
import pulumi
import pulumi_aws as aws

example = aws.lambda_.Alias("example",
    name="dev",
    description="Development environment - always points to latest",
    function_name=example_aws_lambda_function["functionName"],
    function_version="$LATEST")
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/lambda"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		_, err := lambda.NewAlias(ctx, "example", &lambda.AliasArgs{
			Name:            pulumi.String("dev"),
			Description:     pulumi.String("Development environment - always points to latest"),
			FunctionName:    pulumi.Any(exampleAwsLambdaFunction.FunctionName),
			FunctionVersion: pulumi.String("$LATEST"),
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
    var example = new Aws.Lambda.Alias("example", new()
    {
        Name = "dev",
        Description = "Development environment - always points to latest",
        FunctionName = exampleAwsLambdaFunction.FunctionName,
        FunctionVersion = "$LATEST",
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.lambda.Alias;
import com.pulumi.aws.lambda.AliasArgs;
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
        var example = new Alias("example", AliasArgs.builder()
            .name("dev")
            .description("Development environment - always points to latest")
            .functionName(exampleAwsLambdaFunction.functionName())
            .functionVersion("$LATEST")
            .build());

    }
}
```

```yaml
resources:
  example:
    type: aws:lambda:Alias
    properties:
      name: dev
      description: Development environment - always points to latest
      functionName: ${exampleAwsLambdaFunction.functionName}
      functionVersion: $LATEST
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_lambda_alias" "example" {
  name             = "dev"
  description      = "Development environment - always points to latest"
  function_name    = exampleAwsLambdaFunction.functionName
  function_version = "$LATEST"
}
```

## Create Alias Resource[](#create)

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
new Alias(name: string, args: AliasArgs, opts?: CustomResourceOptions);
```

```python
@overload
def Alias(resource_name: str,
          args: AliasArgs,
          opts: Optional[ResourceOptions] = None)

@overload
def Alias(resource_name: str,
          opts: Optional[ResourceOptions] = None,
          function_name: Optional[str] = None,
          function_version: Optional[str] = None,
          description: Optional[str] = None,
          name: Optional[str] = None,
          region: Optional[str] = None,
          routing_config: Optional[AliasRoutingConfigArgs] = None)
```

```go
func NewAlias(ctx *Context, name string, args AliasArgs, opts ...ResourceOption) (*Alias, error)
```

```csharp
public Alias(string name, AliasArgs args, CustomResourceOptions? opts = null)
```

```java
public Alias(String name, AliasArgs args)
public Alias(String name, AliasArgs args, CustomResourceOptions options)
```

```yaml
type: aws:lambda:Alias
properties: # The arguments to resource properties.
options: # Bag of options to control resource's behavior.
```

```hcl
resource "aws_lambda_alias" "name" {
    # resource properties
}
```

#### Parameters[](#parameters)

name This property is required. string

The unique name of the resource.

args This property is required. [AliasArgs](#inputs)

The arguments to resource properties.

opts [CustomResourceOptions](/docs/reference/pkg/nodejs/pulumi/pulumi/#CustomResourceOptions)

Bag of options to control resource's behavior.

resource\_name This property is required. str

The unique name of the resource.

args This property is required. [AliasArgs](#inputs)

The arguments to resource properties.

opts [ResourceOptions](/docs/reference/pkg/python/pulumi/#pulumi.ResourceOptions)

Bag of options to control resource's behavior.

ctx [Context](https://pkg.go.dev/github.com/pulumi/pulumi/sdk/v3/go/pulumi?tab=doc#Context)

Context object for the current deployment.

name This property is required. string

The unique name of the resource.

args This property is required. [AliasArgs](#inputs)

The arguments to resource properties.

opts [ResourceOption](https://pkg.go.dev/github.com/pulumi/pulumi/sdk/v3/go/pulumi?tab=doc#ResourceOption)

Bag of options to control resource's behavior.

name This property is required. string

The unique name of the resource.

args This property is required. [AliasArgs](#inputs)

The arguments to resource properties.

opts [CustomResourceOptions](/docs/reference/pkg/dotnet/Pulumi/Pulumi.CustomResourceOptions.html)

Bag of options to control resource's behavior.

name This property is required. String

The unique name of the resource.

args This property is required. [AliasArgs](#inputs)

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
var examplealiasResourceResourceFromLambdaalias = new Aws.Lambda.Alias("examplealiasResourceResourceFromLambdaalias", new()
{
    FunctionName = "string",
    FunctionVersion = "string",
    Description = "string",
    Name = "string",
    Region = "string",
    RoutingConfig = new Aws.Lambda.Inputs.AliasRoutingConfigArgs
    {
        AdditionalVersionWeights =
        {
            { "string", 0 },
        },
    },
});
```

```go
example, err := lambda.NewAlias(ctx, "examplealiasResourceResourceFromLambdaalias", &lambda.AliasArgs{
	FunctionName:    pulumi.String("string"),
	FunctionVersion: pulumi.String("string"),
	Description:     pulumi.String("string"),
	Name:            pulumi.String("string"),
	Region:          pulumi.String("string"),
	RoutingConfig: &lambda.AliasRoutingConfigArgs{
		AdditionalVersionWeights: pulumi.Float64Map{
			"string": pulumi.Float64(0),
		},
	},
})
```

```hcl
resource "aws_lambda_alias" "examplealiasResourceResourceFromLambdaalias" {
  function_name    = "string"
  function_version = "string"
  description      = "string"
  name             = "string"
  region           = "string"
  routing_config = {
    additional_version_weights = {
      "string" = 0
    }
  }
}
```

```java
var examplealiasResourceResourceFromLambdaalias = new com.pulumi.aws.lambda.Alias("examplealiasResourceResourceFromLambdaalias", com.pulumi.aws.lambda.AliasArgs.builder()
    .functionName("string")
    .functionVersion("string")
    .description("string")
    .name("string")
    .region("string")
    .routingConfig(AliasRoutingConfigArgs.builder()
        .additionalVersionWeights(Map.of("string", 0.0))
        .build())
    .build());
```

```python
examplealias_resource_resource_from_lambdaalias = aws.lambda_.Alias("examplealiasResourceResourceFromLambdaalias",
    function_name="string",
    function_version="string",
    description="string",
    name="string",
    region="string",
    routing_config={
        "additional_version_weights": {
            "string": float(0),
        },
    })
```

```typescript
const examplealiasResourceResourceFromLambdaalias = new aws.lambda.Alias("examplealiasResourceResourceFromLambdaalias", {
    functionName: "string",
    functionVersion: "string",
    description: "string",
    name: "string",
    region: "string",
    routingConfig: {
        additionalVersionWeights: {
            string: 0,
        },
    },
});
```

```yaml
type: aws:lambda:Alias
properties:
    description: string
    functionName: string
    functionVersion: string
    name: string
    region: string
    routingConfig:
        additionalVersionWeights:
            string: 0
```

## Alias Resource Properties[](#properties)

To learn more about resource properties and how to use them, see [Inputs and Outputs](/docs/intro/concepts/inputs-outputs) in the Architecture and Concepts docs.

### Inputs[](#inputs)

In Python, inputs that are objects can be passed either as [argument classes or as dictionary literals](/docs/languages-sdks/python/#inputs-and-outputs).

The Alias resource accepts the following [input](/docs/intro/concepts/inputs-outputs) properties:

[FunctionName](#functionname_csharp)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

Name or ARN of the Lambda function.

[FunctionVersion](#functionversion_csharp) This property is required. string

Lambda function version for which you are creating the alias. Pattern: `(\$LATEST|[0-9]+)`.

[Description](#description_csharp) string

Description of the alias.

[Name](#name_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Name for the alias. Pattern: `(?!^[0-9]+$)([a-zA-Z0-9-_]+)`.

The following arguments are optional:

[Region](#region_csharp) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[RoutingConfig](#routingconfig_csharp) [AliasRoutingConfig](#aliasroutingconfig)

Lambda alias' route configuration settings. See below.

[FunctionName](#functionname_go)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

Name or ARN of the Lambda function.

[FunctionVersion](#functionversion_go) This property is required. string

Lambda function version for which you are creating the alias. Pattern: `(\$LATEST|[0-9]+)`.

[Description](#description_go) string

Description of the alias.

[Name](#name_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Name for the alias. Pattern: `(?!^[0-9]+$)([a-zA-Z0-9-_]+)`.

The following arguments are optional:

[Region](#region_go) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[RoutingConfig](#routingconfig_go) [AliasRoutingConfigArgs](#aliasroutingconfig)

Lambda alias' route configuration settings. See below.

[function\_name](#function_name_hcl)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

Name or ARN of the Lambda function.

[function\_version](#function_version_hcl) This property is required. string

Lambda function version for which you are creating the alias. Pattern: `(\$LATEST|[0-9]+)`.

[description](#description_hcl) string

Description of the alias.

[name](#name_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Name for the alias. Pattern: `(?!^[0-9]+$)([a-zA-Z0-9-_]+)`.

The following arguments are optional:

[region](#region_hcl) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[routing\_config](#routing_config_hcl) [object](#aliasroutingconfig)

Lambda alias' route configuration settings. See below.

[functionName](#functionname_java)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

String

Name or ARN of the Lambda function.

[functionVersion](#functionversion_java) This property is required. String

Lambda function version for which you are creating the alias. Pattern: `(\$LATEST|[0-9]+)`.

[description](#description_java) String

Description of the alias.

[name](#name_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Name for the alias. Pattern: `(?!^[0-9]+$)([a-zA-Z0-9-_]+)`.

The following arguments are optional:

[region](#region_java) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[routingConfig](#routingconfig_java) [AliasRoutingConfig](#aliasroutingconfig)

Lambda alias' route configuration settings. See below.

[functionName](#functionname_nodejs)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

Name or ARN of the Lambda function.

[functionVersion](#functionversion_nodejs) This property is required. string

Lambda function version for which you are creating the alias. Pattern: `(\$LATEST|[0-9]+)`.

[description](#description_nodejs) string

Description of the alias.

[name](#name_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Name for the alias. Pattern: `(?!^[0-9]+$)([a-zA-Z0-9-_]+)`.

The following arguments are optional:

[region](#region_nodejs) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[routingConfig](#routingconfig_nodejs) [AliasRoutingConfig](#aliasroutingconfig)

Lambda alias' route configuration settings. See below.

[function\_name](#function_name_python)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

str

Name or ARN of the Lambda function.

[function\_version](#function_version_python) This property is required. str

Lambda function version for which you are creating the alias. Pattern: `(\$LATEST|[0-9]+)`.

[description](#description_python) str

Description of the alias.

[name](#name_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Name for the alias. Pattern: `(?!^[0-9]+$)([a-zA-Z0-9-_]+)`.

The following arguments are optional:

[region](#region_python) str

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[routing\_config](#routing_config_python) [AliasRoutingConfigArgs](#aliasroutingconfig)

Lambda alias' route configuration settings. See below.

[functionName](#functionname_yaml)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

String

Name or ARN of the Lambda function.

[functionVersion](#functionversion_yaml) This property is required. String

Lambda function version for which you are creating the alias. Pattern: `(\$LATEST|[0-9]+)`.

[description](#description_yaml) String

Description of the alias.

[name](#name_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Name for the alias. Pattern: `(?!^[0-9]+$)([a-zA-Z0-9-_]+)`.

The following arguments are optional:

[region](#region_yaml) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[routingConfig](#routingconfig_yaml) [Property Map](#aliasroutingconfig)

Lambda alias' route configuration settings. See below.

### Outputs[](#outputs)

All [input](#inputs) properties are implicitly available as output properties. Additionally, the Alias resource produces the following output properties:

[Arn](#arn_csharp) string

ARN identifying your Lambda function alias.

[Id](#id_csharp) string

The provider-assigned unique ID for this managed resource.

[InvokeArn](#invokearn_csharp) string

ARN to be used for invoking Lambda Function from API Gateway - to be used in `aws.apigateway.Integration`'s `uri`.

[Arn](#arn_go) string

ARN identifying your Lambda function alias.

[Id](#id_go) string

The provider-assigned unique ID for this managed resource.

[InvokeArn](#invokearn_go) string

ARN to be used for invoking Lambda Function from API Gateway - to be used in `aws.apigateway.Integration`'s `uri`.

[arn](#arn_hcl) string

ARN identifying your Lambda function alias.

[id](#id_hcl) string

The provider-assigned unique ID for this managed resource.

[invoke\_arn](#invoke_arn_hcl) string

ARN to be used for invoking Lambda Function from API Gateway - to be used in `aws.apigateway.Integration`'s `uri`.

[arn](#arn_java) String

ARN identifying your Lambda function alias.

[id](#id_java) String

The provider-assigned unique ID for this managed resource.

[invokeArn](#invokearn_java) String

ARN to be used for invoking Lambda Function from API Gateway - to be used in `aws.apigateway.Integration`'s `uri`.

[arn](#arn_nodejs) string

ARN identifying your Lambda function alias.

[id](#id_nodejs) string

The provider-assigned unique ID for this managed resource.

[invokeArn](#invokearn_nodejs) string

ARN to be used for invoking Lambda Function from API Gateway - to be used in `aws.apigateway.Integration`'s `uri`.

[arn](#arn_python) str

ARN identifying your Lambda function alias.

[id](#id_python) str

The provider-assigned unique ID for this managed resource.

[invoke\_arn](#invoke_arn_python) str

ARN to be used for invoking Lambda Function from API Gateway - to be used in `aws.apigateway.Integration`'s `uri`.

[arn](#arn_yaml) String

ARN identifying your Lambda function alias.

[id](#id_yaml) String

The provider-assigned unique ID for this managed resource.

[invokeArn](#invokearn_yaml) String

ARN to be used for invoking Lambda Function from API Gateway - to be used in `aws.apigateway.Integration`'s `uri`.

## Look up Existing Alias Resource[](#look-up)

Get an existing Alias resource’s state with the given name, ID, and optional extra properties used to qualify the lookup.

-   TypeScript
-   Python
-   Go
-   C#
-   Java
-   YAML
-   HCL PREVIEW

```typescript
public static get(name: string, id: Input<ID>, state?: AliasState, opts?: CustomResourceOptions): Alias
```

```python
@staticmethod
def get(resource_name: str,
        id: str,
        opts: Optional[ResourceOptions] = None,
        arn: Optional[str] = None,
        description: Optional[str] = None,
        function_name: Optional[str] = None,
        function_version: Optional[str] = None,
        invoke_arn: Optional[str] = None,
        name: Optional[str] = None,
        region: Optional[str] = None,
        routing_config: Optional[AliasRoutingConfigArgs] = None) -> Alias
```

```go
func GetAlias(ctx *Context, name string, id IDInput, state *AliasState, opts ...ResourceOption) (*Alias, error)
```

```csharp
public static Alias Get(string name, Input<string> id, AliasState? state, CustomResourceOptions? opts = null)
```

```java
public static Alias get(String name, Output<String> id, AliasState state, CustomResourceOptions options)
```

```yaml
resources:  _:    type: aws:lambda:Alias    get:      id: ${id}
```

```hcl
import {
  to = aws_lambda_alias.example
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

ARN identifying your Lambda function alias.

[Description](#state_description_csharp) string

Description of the alias.

[FunctionName](#state_functionname_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Name or ARN of the Lambda function.

[FunctionVersion](#state_functionversion_csharp) string

Lambda function version for which you are creating the alias. Pattern: `(\$LATEST|[0-9]+)`.

[InvokeArn](#state_invokearn_csharp) string

ARN to be used for invoking Lambda Function from API Gateway - to be used in `aws.apigateway.Integration`'s `uri`.

[Name](#state_name_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Name for the alias. Pattern: `(?!^[0-9]+$)([a-zA-Z0-9-_]+)`.

The following arguments are optional:

[Region](#state_region_csharp) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[RoutingConfig](#state_routingconfig_csharp) [AliasRoutingConfig](#aliasroutingconfig)

Lambda alias' route configuration settings. See below.

[Arn](#state_arn_go) string

ARN identifying your Lambda function alias.

[Description](#state_description_go) string

Description of the alias.

[FunctionName](#state_functionname_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Name or ARN of the Lambda function.

[FunctionVersion](#state_functionversion_go) string

Lambda function version for which you are creating the alias. Pattern: `(\$LATEST|[0-9]+)`.

[InvokeArn](#state_invokearn_go) string

ARN to be used for invoking Lambda Function from API Gateway - to be used in `aws.apigateway.Integration`'s `uri`.

[Name](#state_name_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Name for the alias. Pattern: `(?!^[0-9]+$)([a-zA-Z0-9-_]+)`.

The following arguments are optional:

[Region](#state_region_go) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[RoutingConfig](#state_routingconfig_go) [AliasRoutingConfigArgs](#aliasroutingconfig)

Lambda alias' route configuration settings. See below.

[arn](#state_arn_hcl) string

ARN identifying your Lambda function alias.

[description](#state_description_hcl) string

Description of the alias.

[function\_name](#state_function_name_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Name or ARN of the Lambda function.

[function\_version](#state_function_version_hcl) string

Lambda function version for which you are creating the alias. Pattern: `(\$LATEST|[0-9]+)`.

[invoke\_arn](#state_invoke_arn_hcl) string

ARN to be used for invoking Lambda Function from API Gateway - to be used in `aws.apigateway.Integration`'s `uri`.

[name](#state_name_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Name for the alias. Pattern: `(?!^[0-9]+$)([a-zA-Z0-9-_]+)`.

The following arguments are optional:

[region](#state_region_hcl) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[routing\_config](#state_routing_config_hcl) [object](#aliasroutingconfig)

Lambda alias' route configuration settings. See below.

[arn](#state_arn_java) String

ARN identifying your Lambda function alias.

[description](#state_description_java) String

Description of the alias.

[functionName](#state_functionname_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Name or ARN of the Lambda function.

[functionVersion](#state_functionversion_java) String

Lambda function version for which you are creating the alias. Pattern: `(\$LATEST|[0-9]+)`.

[invokeArn](#state_invokearn_java) String

ARN to be used for invoking Lambda Function from API Gateway - to be used in `aws.apigateway.Integration`'s `uri`.

[name](#state_name_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Name for the alias. Pattern: `(?!^[0-9]+$)([a-zA-Z0-9-_]+)`.

The following arguments are optional:

[region](#state_region_java) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[routingConfig](#state_routingconfig_java) [AliasRoutingConfig](#aliasroutingconfig)

Lambda alias' route configuration settings. See below.

[arn](#state_arn_nodejs) string

ARN identifying your Lambda function alias.

[description](#state_description_nodejs) string

Description of the alias.

[functionName](#state_functionname_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Name or ARN of the Lambda function.

[functionVersion](#state_functionversion_nodejs) string

Lambda function version for which you are creating the alias. Pattern: `(\$LATEST|[0-9]+)`.

[invokeArn](#state_invokearn_nodejs) string

ARN to be used for invoking Lambda Function from API Gateway - to be used in `aws.apigateway.Integration`'s `uri`.

[name](#state_name_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Name for the alias. Pattern: `(?!^[0-9]+$)([a-zA-Z0-9-_]+)`.

The following arguments are optional:

[region](#state_region_nodejs) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[routingConfig](#state_routingconfig_nodejs) [AliasRoutingConfig](#aliasroutingconfig)

Lambda alias' route configuration settings. See below.

[arn](#state_arn_python) str

ARN identifying your Lambda function alias.

[description](#state_description_python) str

Description of the alias.

[function\_name](#state_function_name_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Name or ARN of the Lambda function.

[function\_version](#state_function_version_python) str

Lambda function version for which you are creating the alias. Pattern: `(\$LATEST|[0-9]+)`.

[invoke\_arn](#state_invoke_arn_python) str

ARN to be used for invoking Lambda Function from API Gateway - to be used in `aws.apigateway.Integration`'s `uri`.

[name](#state_name_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Name for the alias. Pattern: `(?!^[0-9]+$)([a-zA-Z0-9-_]+)`.

The following arguments are optional:

[region](#state_region_python) str

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[routing\_config](#state_routing_config_python) [AliasRoutingConfigArgs](#aliasroutingconfig)

Lambda alias' route configuration settings. See below.

[arn](#state_arn_yaml) String

ARN identifying your Lambda function alias.

[description](#state_description_yaml) String

Description of the alias.

[functionName](#state_functionname_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Name or ARN of the Lambda function.

[functionVersion](#state_functionversion_yaml) String

Lambda function version for which you are creating the alias. Pattern: `(\$LATEST|[0-9]+)`.

[invokeArn](#state_invokearn_yaml) String

ARN to be used for invoking Lambda Function from API Gateway - to be used in `aws.apigateway.Integration`'s `uri`.

[name](#state_name_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Name for the alias. Pattern: `(?!^[0-9]+$)([a-zA-Z0-9-_]+)`.

The following arguments are optional:

[region](#state_region_yaml) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[routingConfig](#state_routingconfig_yaml) [Property Map](#aliasroutingconfig)

Lambda alias' route configuration settings. See below.

## Supporting Types[](#supporting-types)

#### AliasRoutingConfig

, AliasRoutingConfigArgs

[](#aliasroutingconfig)

[AdditionalVersionWeights](#additionalversionweights_csharp) Dictionary<string, double>

Map that defines the proportion of events that should be sent to different versions of a Lambda function.

[AdditionalVersionWeights](#additionalversionweights_go) map\[string\]float64

Map that defines the proportion of events that should be sent to different versions of a Lambda function.

[additional\_version\_weights](#additional_version_weights_hcl) map(number)

Map that defines the proportion of events that should be sent to different versions of a Lambda function.

[additionalVersionWeights](#additionalversionweights_java) Map<String,Double>

Map that defines the proportion of events that should be sent to different versions of a Lambda function.

[additionalVersionWeights](#additionalversionweights_nodejs) {\[key: string\]: number}

Map that defines the proportion of events that should be sent to different versions of a Lambda function.

[additional\_version\_weights](#additional_version_weights_python) Mapping\[str, float\]

Map that defines the proportion of events that should be sent to different versions of a Lambda function.

[additionalVersionWeights](#additionalversionweights_yaml) Map<Number>

Map that defines the proportion of events that should be sent to different versions of a Lambda function.

## Import[](#import)

For backwards compatibility, the following legacy `pulumi import` command is also supported:

```bash
$ pulumi import aws:lambda/alias:Alias example example/production
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

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2flambda%2falias]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2flambda%2falias%2f\))

#### Try Pulumi Cloud free.
Your team will thank you.

[Start free trial](https://app.pulumi.com/signup?utm_source=registry&utm_medium=right-rail-banner&utm_campaign=try-pulumi-cloud&iaid=docs-try-pulumi-cloud-ad)
