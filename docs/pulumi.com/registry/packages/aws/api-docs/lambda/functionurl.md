---
Source: https://www.pulumi.com/registry/packages/aws/api-docs/lambda/functionurl/
Generated: 2026-06-06
Updated: 2026-06-06
---

# aws.lambda.FunctionUrl

1.  [Packages](/registry/)
2.  [Packages](/registry/packages/)
3.  [AWS](/registry/packages/aws/)
4.  [API Docs](/registry/packages/aws/api-docs/)
5.  [lambda](/registry/packages/aws/api-docs/lambda/)
6.  [FunctionUrl](/registry/packages/aws/api-docs/lambda/functionurl/)

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

Viewing docs for AWS v7.32.0
published on Friday, May 29, 2026 by Pulumi

[Schema (JSON)](/registry/packages/aws/schema.json)

[pulumi/pulumi-aws](https://github.com/pulumi/pulumi-aws)

v7.32.0 (7.x, latest)v6.83.1 (6.x)v5.43.0 (5.x)

# aws.lambda.FunctionUrl[](#aws-lambda-functionurl)

Explore with Neo

-   Copy Page

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2flambda%2ffunctionurl]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2flambda%2ffunctionurl%2f\))

Manages a Lambda function URL. Creates a dedicated HTTP(S) endpoint for a Lambda function to enable direct invocation via HTTP requests.

> **NOTE:** When [`authorizationType` is `"NONE"`](https://docs.aws.amazon.com/lambda/latest/dg/urls-auth.html#urls-auth-none) the `lambda:InvokeFunctionUrl` permission allowing a public endpoint and `lambda:InvokeFunction` permission with the `InvokedViaFunctionUrl` flag set to `true` are automatically added to the Lambda function on creation. These policies are NOT removed from AWS when the resource is destroyed.

## Example Usage[](#example-usage)

### Basic Function URL with No Authentication[](#basic-function-url-with-no-authentication)

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

const example = new aws.lambda.FunctionUrl("example", {
    functionName: exampleAwsLambdaFunction.functionName,
    authorizationType: "NONE",
});
```

```python
import pulumi
import pulumi_aws as aws

example = aws.lambda_.FunctionUrl("example",
    function_name=example_aws_lambda_function["functionName"],
    authorization_type="NONE")
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/lambda"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		_, err := lambda.NewFunctionUrl(ctx, "example", &lambda.FunctionUrlArgs{
			FunctionName:      pulumi.Any(exampleAwsLambdaFunction.FunctionName),
			AuthorizationType: pulumi.String("NONE"),
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
    var example = new Aws.Lambda.FunctionUrl("example", new()
    {
        FunctionName = exampleAwsLambdaFunction.FunctionName,
        AuthorizationType = "NONE",
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.lambda.FunctionUrl;
import com.pulumi.aws.lambda.FunctionUrlArgs;
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
        var example = new FunctionUrl("example", FunctionUrlArgs.builder()
            .functionName(exampleAwsLambdaFunction.functionName())
            .authorizationType("NONE")
            .build());

    }
}
```

```yaml
resources:
  example:
    type: aws:lambda:FunctionUrl
    properties:
      functionName: ${exampleAwsLambdaFunction.functionName}
      authorizationType: NONE
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_lambda_functionurl" "example" {
  function_name      = exampleAwsLambdaFunction.functionName
  authorization_type = "NONE"
}
```

### Function URL with IAM Authentication and CORS Configuration[](#function-url-with-iam-authentication-and-cors-configuration)

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

const example = new aws.lambda.FunctionUrl("example", {
    functionName: exampleAwsLambdaFunction.functionName,
    qualifier: "my_alias",
    authorizationType: "AWS_IAM",
    invokeMode: "RESPONSE_STREAM",
    cors: {
        allowCredentials: true,
        allowOrigins: ["https://example.com"],
        allowMethods: [
            "GET",
            "POST",
        ],
        allowHeaders: [
            "date",
            "keep-alive",
        ],
        exposeHeaders: [
            "keep-alive",
            "date",
        ],
        maxAge: 86400,
    },
});
```

```python
import pulumi
import pulumi_aws as aws

example = aws.lambda_.FunctionUrl("example",
    function_name=example_aws_lambda_function["functionName"],
    qualifier="my_alias",
    authorization_type="AWS_IAM",
    invoke_mode="RESPONSE_STREAM",
    cors={
        "allow_credentials": True,
        "allow_origins": ["https://example.com"],
        "allow_methods": [
            "GET",
            "POST",
        ],
        "allow_headers": [
            "date",
            "keep-alive",
        ],
        "expose_headers": [
            "keep-alive",
            "date",
        ],
        "max_age": 86400,
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
		_, err := lambda.NewFunctionUrl(ctx, "example", &lambda.FunctionUrlArgs{
			FunctionName:      pulumi.Any(exampleAwsLambdaFunction.FunctionName),
			Qualifier:         pulumi.String("my_alias"),
			AuthorizationType: pulumi.String("AWS_IAM"),
			InvokeMode:        pulumi.String("RESPONSE_STREAM"),
			Cors: &lambda.FunctionUrlCorsArgs{
				AllowCredentials: pulumi.Bool(true),
				AllowOrigins: pulumi.StringArray{
					pulumi.String("https://example.com"),
				},
				AllowMethods: pulumi.StringArray{
					pulumi.String("GET"),
					pulumi.String("POST"),
				},
				AllowHeaders: pulumi.StringArray{
					pulumi.String("date"),
					pulumi.String("keep-alive"),
				},
				ExposeHeaders: pulumi.StringArray{
					pulumi.String("keep-alive"),
					pulumi.String("date"),
				},
				MaxAge: pulumi.Int(86400),
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
    var example = new Aws.Lambda.FunctionUrl("example", new()
    {
        FunctionName = exampleAwsLambdaFunction.FunctionName,
        Qualifier = "my_alias",
        AuthorizationType = "AWS_IAM",
        InvokeMode = "RESPONSE_STREAM",
        Cors = new Aws.Lambda.Inputs.FunctionUrlCorsArgs
        {
            AllowCredentials = true,
            AllowOrigins = new[]
            {
                "https://example.com",
            },
            AllowMethods = new[]
            {
                "GET",
                "POST",
            },
            AllowHeaders = new[]
            {
                "date",
                "keep-alive",
            },
            ExposeHeaders = new[]
            {
                "keep-alive",
                "date",
            },
            MaxAge = 86400,
        },
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.lambda.FunctionUrl;
import com.pulumi.aws.lambda.FunctionUrlArgs;
import com.pulumi.aws.lambda.inputs.FunctionUrlCorsArgs;
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
        var example = new FunctionUrl("example", FunctionUrlArgs.builder()
            .functionName(exampleAwsLambdaFunction.functionName())
            .qualifier("my_alias")
            .authorizationType("AWS_IAM")
            .invokeMode("RESPONSE_STREAM")
            .cors(FunctionUrlCorsArgs.builder()
                .allowCredentials(true)
                .allowOrigins("https://example.com")
                .allowMethods(
                    "GET",
                    "POST")
                .allowHeaders(
                    "date",
                    "keep-alive")
                .exposeHeaders(
                    "keep-alive",
                    "date")
                .maxAge(86400)
                .build())
            .build());

    }
}
```

```yaml
resources:
  example:
    type: aws:lambda:FunctionUrl
    properties:
      functionName: ${exampleAwsLambdaFunction.functionName}
      qualifier: my_alias
      authorizationType: AWS_IAM
      invokeMode: RESPONSE_STREAM
      cors:
        allowCredentials: true
        allowOrigins:
          - https://example.com
        allowMethods:
          - GET
          - POST
        allowHeaders:
          - date
          - keep-alive
        exposeHeaders:
          - keep-alive
          - date
        maxAge: 86400
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_lambda_functionurl" "example" {
  function_name      = exampleAwsLambdaFunction.functionName
  qualifier          = "my_alias"
  authorization_type = "AWS_IAM"
  invoke_mode        = "RESPONSE_STREAM"
  cors = {
    allow_credentials = true
    allow_origins     = ["https://example.com"]
    allow_methods     = ["GET", "POST"]
    allow_headers     = ["date", "keep-alive"]
    expose_headers    = ["keep-alive", "date"]
    max_age           = 86400
  }
}
```

## Create FunctionUrl Resource[](#create)

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
new FunctionUrl(name: string, args: FunctionUrlArgs, opts?: CustomResourceOptions);
```

```python
@overload
def FunctionUrl(resource_name: str,
                args: FunctionUrlArgs,
                opts: Optional[ResourceOptions] = None)

@overload
def FunctionUrl(resource_name: str,
                opts: Optional[ResourceOptions] = None,
                authorization_type: Optional[str] = None,
                function_name: Optional[str] = None,
                cors: Optional[FunctionUrlCorsArgs] = None,
                invoke_mode: Optional[str] = None,
                qualifier: Optional[str] = None,
                region: Optional[str] = None)
```

```go
func NewFunctionUrl(ctx *Context, name string, args FunctionUrlArgs, opts ...ResourceOption) (*FunctionUrl, error)
```

```csharp
public FunctionUrl(string name, FunctionUrlArgs args, CustomResourceOptions? opts = null)
```

```java
public FunctionUrl(String name, FunctionUrlArgs args)
public FunctionUrl(String name, FunctionUrlArgs args, CustomResourceOptions options)
```

```yaml
type: aws:lambda:FunctionUrl
properties: # The arguments to resource properties.
options: # Bag of options to control resource's behavior.
```

```hcl
resource "aws_lambda_functionurl" "name" {
    # resource properties
}
```

#### Parameters[](#parameters)

name This property is required. string

The unique name of the resource.

args This property is required. [FunctionUrlArgs](#inputs)

The arguments to resource properties.

opts [CustomResourceOptions](/docs/reference/pkg/nodejs/pulumi/pulumi/#CustomResourceOptions)

Bag of options to control resource's behavior.

resource\_name This property is required. str

The unique name of the resource.

args This property is required. [FunctionUrlArgs](#inputs)

The arguments to resource properties.

opts [ResourceOptions](/docs/reference/pkg/python/pulumi/#pulumi.ResourceOptions)

Bag of options to control resource's behavior.

ctx [Context](https://pkg.go.dev/github.com/pulumi/pulumi/sdk/v3/go/pulumi?tab=doc#Context)

Context object for the current deployment.

name This property is required. string

The unique name of the resource.

args This property is required. [FunctionUrlArgs](#inputs)

The arguments to resource properties.

opts [ResourceOption](https://pkg.go.dev/github.com/pulumi/pulumi/sdk/v3/go/pulumi?tab=doc#ResourceOption)

Bag of options to control resource's behavior.

name This property is required. string

The unique name of the resource.

args This property is required. [FunctionUrlArgs](#inputs)

The arguments to resource properties.

opts [CustomResourceOptions](/docs/reference/pkg/dotnet/Pulumi/Pulumi.CustomResourceOptions.html)

Bag of options to control resource's behavior.

name This property is required. String

The unique name of the resource.

args This property is required. [FunctionUrlArgs](#inputs)

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
var functionUrlResource = new Aws.Lambda.FunctionUrl("functionUrlResource", new()
{
    AuthorizationType = "string",
    FunctionName = "string",
    Cors = new Aws.Lambda.Inputs.FunctionUrlCorsArgs
    {
        AllowCredentials = false,
        AllowHeaders = new[]
        {
            "string",
        },
        AllowMethods = new[]
        {
            "string",
        },
        AllowOrigins = new[]
        {
            "string",
        },
        ExposeHeaders = new[]
        {
            "string",
        },
        MaxAge = 0,
    },
    InvokeMode = "string",
    Qualifier = "string",
    Region = "string",
});
```

```go
example, err := lambda.NewFunctionUrl(ctx, "functionUrlResource", &lambda.FunctionUrlArgs{
	AuthorizationType: pulumi.String("string"),
	FunctionName:      pulumi.String("string"),
	Cors: &lambda.FunctionUrlCorsArgs{
		AllowCredentials: pulumi.Bool(false),
		AllowHeaders: pulumi.StringArray{
			pulumi.String("string"),
		},
		AllowMethods: pulumi.StringArray{
			pulumi.String("string"),
		},
		AllowOrigins: pulumi.StringArray{
			pulumi.String("string"),
		},
		ExposeHeaders: pulumi.StringArray{
			pulumi.String("string"),
		},
		MaxAge: pulumi.Int(0),
	},
	InvokeMode: pulumi.String("string"),
	Qualifier:  pulumi.String("string"),
	Region:     pulumi.String("string"),
})
```

```hcl
resource "aws_lambda_functionurl" "functionUrlResource" {
  authorization_type = "string"
  function_name      = "string"
  cors = {
    allow_credentials = false
    allow_headers     = ["string"]
    allow_methods     = ["string"]
    allow_origins     = ["string"]
    expose_headers    = ["string"]
    max_age           = 0
  }
  invoke_mode = "string"
  qualifier   = "string"
  region      = "string"
}
```

```java
var functionUrlResource = new FunctionUrl("functionUrlResource", FunctionUrlArgs.builder()
    .authorizationType("string")
    .functionName("string")
    .cors(FunctionUrlCorsArgs.builder()
        .allowCredentials(false)
        .allowHeaders("string")
        .allowMethods("string")
        .allowOrigins("string")
        .exposeHeaders("string")
        .maxAge(0)
        .build())
    .invokeMode("string")
    .qualifier("string")
    .region("string")
    .build());
```

```python
function_url_resource = aws.lambda_.FunctionUrl("functionUrlResource",
    authorization_type="string",
    function_name="string",
    cors={
        "allow_credentials": False,
        "allow_headers": ["string"],
        "allow_methods": ["string"],
        "allow_origins": ["string"],
        "expose_headers": ["string"],
        "max_age": 0,
    },
    invoke_mode="string",
    qualifier="string",
    region="string")
```

```typescript
const functionUrlResource = new aws.lambda.FunctionUrl("functionUrlResource", {
    authorizationType: "string",
    functionName: "string",
    cors: {
        allowCredentials: false,
        allowHeaders: ["string"],
        allowMethods: ["string"],
        allowOrigins: ["string"],
        exposeHeaders: ["string"],
        maxAge: 0,
    },
    invokeMode: "string",
    qualifier: "string",
    region: "string",
});
```

```yaml
type: aws:lambda:FunctionUrl
properties:
    authorizationType: string
    cors:
        allowCredentials: false
        allowHeaders:
            - string
        allowMethods:
            - string
        allowOrigins:
            - string
        exposeHeaders:
            - string
        maxAge: 0
    functionName: string
    invokeMode: string
    qualifier: string
    region: string
```

## FunctionUrl Resource Properties[](#properties)

To learn more about resource properties and how to use them, see [Inputs and Outputs](/docs/intro/concepts/inputs-outputs) in the Architecture and Concepts docs.

### Inputs[](#inputs)

In Python, inputs that are objects can be passed either as [argument classes or as dictionary literals](/docs/languages-sdks/python/#inputs-and-outputs).

The FunctionUrl resource accepts the following [input](/docs/intro/concepts/inputs-outputs) properties:

[AuthorizationType](#authorizationtype_csharp) This property is required. string

Type of authentication that the function URL uses. Valid values are `AWS_IAM` and `NONE`.

[FunctionName](#functionname_csharp)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

Name or ARN of the Lambda function.

The following arguments are optional:

[Cors](#cors_csharp) [FunctionUrlCors](#functionurlcors)

Cross-origin resource sharing (CORS) settings for the function URL. See below.

[InvokeMode](#invokemode_csharp) string

How the Lambda function responds to an invocation. Valid values are `BUFFERED` (default) and `RESPONSE_STREAM`.

[Qualifier](#qualifier_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Alias name or `$LATEST`.

[Region](#region_csharp) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[AuthorizationType](#authorizationtype_go) This property is required. string

Type of authentication that the function URL uses. Valid values are `AWS_IAM` and `NONE`.

[FunctionName](#functionname_go)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

Name or ARN of the Lambda function.

The following arguments are optional:

[Cors](#cors_go) [FunctionUrlCorsArgs](#functionurlcors)

Cross-origin resource sharing (CORS) settings for the function URL. See below.

[InvokeMode](#invokemode_go) string

How the Lambda function responds to an invocation. Valid values are `BUFFERED` (default) and `RESPONSE_STREAM`.

[Qualifier](#qualifier_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Alias name or `$LATEST`.

[Region](#region_go) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[authorization\_type](#authorization_type_hcl) This property is required. string

Type of authentication that the function URL uses. Valid values are `AWS_IAM` and `NONE`.

[function\_name](#function_name_hcl)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

Name or ARN of the Lambda function.

The following arguments are optional:

[cors](#cors_hcl) [object](#functionurlcors)

Cross-origin resource sharing (CORS) settings for the function URL. See below.

[invoke\_mode](#invoke_mode_hcl) string

How the Lambda function responds to an invocation. Valid values are `BUFFERED` (default) and `RESPONSE_STREAM`.

[qualifier](#qualifier_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Alias name or `$LATEST`.

[region](#region_hcl) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[authorizationType](#authorizationtype_java) This property is required. String

Type of authentication that the function URL uses. Valid values are `AWS_IAM` and `NONE`.

[functionName](#functionname_java)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

String

Name or ARN of the Lambda function.

The following arguments are optional:

[cors](#cors_java) [FunctionUrlCors](#functionurlcors)

Cross-origin resource sharing (CORS) settings for the function URL. See below.

[invokeMode](#invokemode_java) String

How the Lambda function responds to an invocation. Valid values are `BUFFERED` (default) and `RESPONSE_STREAM`.

[qualifier](#qualifier_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Alias name or `$LATEST`.

[region](#region_java) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[authorizationType](#authorizationtype_nodejs) This property is required. string

Type of authentication that the function URL uses. Valid values are `AWS_IAM` and `NONE`.

[functionName](#functionname_nodejs)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

Name or ARN of the Lambda function.

The following arguments are optional:

[cors](#cors_nodejs) [FunctionUrlCors](#functionurlcors)

Cross-origin resource sharing (CORS) settings for the function URL. See below.

[invokeMode](#invokemode_nodejs) string

How the Lambda function responds to an invocation. Valid values are `BUFFERED` (default) and `RESPONSE_STREAM`.

[qualifier](#qualifier_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Alias name or `$LATEST`.

[region](#region_nodejs) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[authorization\_type](#authorization_type_python) This property is required. str

Type of authentication that the function URL uses. Valid values are `AWS_IAM` and `NONE`.

[function\_name](#function_name_python)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

str

Name or ARN of the Lambda function.

The following arguments are optional:

[cors](#cors_python) [FunctionUrlCorsArgs](#functionurlcors)

Cross-origin resource sharing (CORS) settings for the function URL. See below.

[invoke\_mode](#invoke_mode_python) str

How the Lambda function responds to an invocation. Valid values are `BUFFERED` (default) and `RESPONSE_STREAM`.

[qualifier](#qualifier_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Alias name or `$LATEST`.

[region](#region_python) str

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[authorizationType](#authorizationtype_yaml) This property is required. String

Type of authentication that the function URL uses. Valid values are `AWS_IAM` and `NONE`.

[functionName](#functionname_yaml)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

String

Name or ARN of the Lambda function.

The following arguments are optional:

[cors](#cors_yaml) [Property Map](#functionurlcors)

Cross-origin resource sharing (CORS) settings for the function URL. See below.

[invokeMode](#invokemode_yaml) String

How the Lambda function responds to an invocation. Valid values are `BUFFERED` (default) and `RESPONSE_STREAM`.

[qualifier](#qualifier_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Alias name or `$LATEST`.

[region](#region_yaml) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

### Outputs[](#outputs)

All [input](#inputs) properties are implicitly available as output properties. Additionally, the FunctionUrl resource produces the following output properties:

[FunctionArn](#functionarn_csharp) string

ARN of the Lambda function.

[FunctionUrlResult](#functionurlresult_csharp) string

HTTP URL endpoint for the function in the format `https://<url_id>.lambda-url.<region>.on.aws/`.

[Id](#id_csharp) string

The provider-assigned unique ID for this managed resource.

[UrlId](#urlid_csharp) string

Generated ID for the endpoint.

[FunctionArn](#functionarn_go) string

ARN of the Lambda function.

[FunctionUrl](#functionurl_go) string

HTTP URL endpoint for the function in the format `https://<url_id>.lambda-url.<region>.on.aws/`.

[Id](#id_go) string

The provider-assigned unique ID for this managed resource.

[UrlId](#urlid_go) string

Generated ID for the endpoint.

[function\_arn](#function_arn_hcl) string

ARN of the Lambda function.

[function\_url](#function_url_hcl) string

HTTP URL endpoint for the function in the format `https://<url_id>.lambda-url.<region>.on.aws/`.

[id](#id_hcl) string

The provider-assigned unique ID for this managed resource.

[url\_id](#url_id_hcl) string

Generated ID for the endpoint.

[functionArn](#functionarn_java) String

ARN of the Lambda function.

[functionUrl](#functionurl_java) String

HTTP URL endpoint for the function in the format `https://<url_id>.lambda-url.<region>.on.aws/`.

[id](#id_java) String

The provider-assigned unique ID for this managed resource.

[urlId](#urlid_java) String

Generated ID for the endpoint.

[functionArn](#functionarn_nodejs) string

ARN of the Lambda function.

[functionUrl](#functionurl_nodejs) string

HTTP URL endpoint for the function in the format `https://<url_id>.lambda-url.<region>.on.aws/`.

[id](#id_nodejs) string

The provider-assigned unique ID for this managed resource.

[urlId](#urlid_nodejs) string

Generated ID for the endpoint.

[function\_arn](#function_arn_python) str

ARN of the Lambda function.

[function\_url](#function_url_python) str

HTTP URL endpoint for the function in the format `https://<url_id>.lambda-url.<region>.on.aws/`.

[id](#id_python) str

The provider-assigned unique ID for this managed resource.

[url\_id](#url_id_python) str

Generated ID for the endpoint.

[functionArn](#functionarn_yaml) String

ARN of the Lambda function.

[functionUrl](#functionurl_yaml) String

HTTP URL endpoint for the function in the format `https://<url_id>.lambda-url.<region>.on.aws/`.

[id](#id_yaml) String

The provider-assigned unique ID for this managed resource.

[urlId](#urlid_yaml) String

Generated ID for the endpoint.

## Look up Existing FunctionUrl Resource[](#look-up)

Get an existing FunctionUrl resource’s state with the given name, ID, and optional extra properties used to qualify the lookup.

-   TypeScript
-   Python
-   Go
-   C#
-   Java
-   YAML
-   HCL PREVIEW

```typescript
public static get(name: string, id: Input<ID>, state?: FunctionUrlState, opts?: CustomResourceOptions): FunctionUrl
```

```python
@staticmethod
def get(resource_name: str,
        id: str,
        opts: Optional[ResourceOptions] = None,
        authorization_type: Optional[str] = None,
        cors: Optional[FunctionUrlCorsArgs] = None,
        function_arn: Optional[str] = None,
        function_name: Optional[str] = None,
        function_url: Optional[str] = None,
        invoke_mode: Optional[str] = None,
        qualifier: Optional[str] = None,
        region: Optional[str] = None,
        url_id: Optional[str] = None) -> FunctionUrl
```

```go
func GetFunctionUrl(ctx *Context, name string, id IDInput, state *FunctionUrlState, opts ...ResourceOption) (*FunctionUrl, error)
```

```csharp
public static FunctionUrl Get(string name, Input<string> id, FunctionUrlState? state, CustomResourceOptions? opts = null)
```

```java
public static FunctionUrl get(String name, Output<String> id, FunctionUrlState state, CustomResourceOptions options)
```

```yaml
resources:  _:    type: aws:lambda:FunctionUrl    get:      id: ${id}
```

```hcl
import {
  to = aws_lambda_functionurl.example
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

[AuthorizationType](#state_authorizationtype_csharp) string

Type of authentication that the function URL uses. Valid values are `AWS_IAM` and `NONE`.

[Cors](#state_cors_csharp) [FunctionUrlCors](#functionurlcors)

Cross-origin resource sharing (CORS) settings for the function URL. See below.

[FunctionArn](#state_functionarn_csharp) string

ARN of the Lambda function.

[FunctionName](#state_functionname_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Name or ARN of the Lambda function.

The following arguments are optional:

[FunctionUrlResult](#state_functionurlresult_csharp) string

HTTP URL endpoint for the function in the format `https://<url_id>.lambda-url.<region>.on.aws/`.

[InvokeMode](#state_invokemode_csharp) string

How the Lambda function responds to an invocation. Valid values are `BUFFERED` (default) and `RESPONSE_STREAM`.

[Qualifier](#state_qualifier_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Alias name or `$LATEST`.

[Region](#state_region_csharp) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[UrlId](#state_urlid_csharp) string

Generated ID for the endpoint.

[AuthorizationType](#state_authorizationtype_go) string

Type of authentication that the function URL uses. Valid values are `AWS_IAM` and `NONE`.

[Cors](#state_cors_go) [FunctionUrlCorsArgs](#functionurlcors)

Cross-origin resource sharing (CORS) settings for the function URL. See below.

[FunctionArn](#state_functionarn_go) string

ARN of the Lambda function.

[FunctionName](#state_functionname_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Name or ARN of the Lambda function.

The following arguments are optional:

[FunctionUrl](#state_functionurl_go) string

HTTP URL endpoint for the function in the format `https://<url_id>.lambda-url.<region>.on.aws/`.

[InvokeMode](#state_invokemode_go) string

How the Lambda function responds to an invocation. Valid values are `BUFFERED` (default) and `RESPONSE_STREAM`.

[Qualifier](#state_qualifier_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Alias name or `$LATEST`.

[Region](#state_region_go) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[UrlId](#state_urlid_go) string

Generated ID for the endpoint.

[authorization\_type](#state_authorization_type_hcl) string

Type of authentication that the function URL uses. Valid values are `AWS_IAM` and `NONE`.

[cors](#state_cors_hcl) [object](#functionurlcors)

Cross-origin resource sharing (CORS) settings for the function URL. See below.

[function\_arn](#state_function_arn_hcl) string

ARN of the Lambda function.

[function\_name](#state_function_name_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Name or ARN of the Lambda function.

The following arguments are optional:

[function\_url](#state_function_url_hcl) string

HTTP URL endpoint for the function in the format `https://<url_id>.lambda-url.<region>.on.aws/`.

[invoke\_mode](#state_invoke_mode_hcl) string

How the Lambda function responds to an invocation. Valid values are `BUFFERED` (default) and `RESPONSE_STREAM`.

[qualifier](#state_qualifier_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Alias name or `$LATEST`.

[region](#state_region_hcl) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[url\_id](#state_url_id_hcl) string

Generated ID for the endpoint.

[authorizationType](#state_authorizationtype_java) String

Type of authentication that the function URL uses. Valid values are `AWS_IAM` and `NONE`.

[cors](#state_cors_java) [FunctionUrlCors](#functionurlcors)

Cross-origin resource sharing (CORS) settings for the function URL. See below.

[functionArn](#state_functionarn_java) String

ARN of the Lambda function.

[functionName](#state_functionname_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Name or ARN of the Lambda function.

The following arguments are optional:

[functionUrl](#state_functionurl_java) String

HTTP URL endpoint for the function in the format `https://<url_id>.lambda-url.<region>.on.aws/`.

[invokeMode](#state_invokemode_java) String

How the Lambda function responds to an invocation. Valid values are `BUFFERED` (default) and `RESPONSE_STREAM`.

[qualifier](#state_qualifier_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Alias name or `$LATEST`.

[region](#state_region_java) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[urlId](#state_urlid_java) String

Generated ID for the endpoint.

[authorizationType](#state_authorizationtype_nodejs) string

Type of authentication that the function URL uses. Valid values are `AWS_IAM` and `NONE`.

[cors](#state_cors_nodejs) [FunctionUrlCors](#functionurlcors)

Cross-origin resource sharing (CORS) settings for the function URL. See below.

[functionArn](#state_functionarn_nodejs) string

ARN of the Lambda function.

[functionName](#state_functionname_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Name or ARN of the Lambda function.

The following arguments are optional:

[functionUrl](#state_functionurl_nodejs) string

HTTP URL endpoint for the function in the format `https://<url_id>.lambda-url.<region>.on.aws/`.

[invokeMode](#state_invokemode_nodejs) string

How the Lambda function responds to an invocation. Valid values are `BUFFERED` (default) and `RESPONSE_STREAM`.

[qualifier](#state_qualifier_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Alias name or `$LATEST`.

[region](#state_region_nodejs) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[urlId](#state_urlid_nodejs) string

Generated ID for the endpoint.

[authorization\_type](#state_authorization_type_python) str

Type of authentication that the function URL uses. Valid values are `AWS_IAM` and `NONE`.

[cors](#state_cors_python) [FunctionUrlCorsArgs](#functionurlcors)

Cross-origin resource sharing (CORS) settings for the function URL. See below.

[function\_arn](#state_function_arn_python) str

ARN of the Lambda function.

[function\_name](#state_function_name_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Name or ARN of the Lambda function.

The following arguments are optional:

[function\_url](#state_function_url_python) str

HTTP URL endpoint for the function in the format `https://<url_id>.lambda-url.<region>.on.aws/`.

[invoke\_mode](#state_invoke_mode_python) str

How the Lambda function responds to an invocation. Valid values are `BUFFERED` (default) and `RESPONSE_STREAM`.

[qualifier](#state_qualifier_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Alias name or `$LATEST`.

[region](#state_region_python) str

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[url\_id](#state_url_id_python) str

Generated ID for the endpoint.

[authorizationType](#state_authorizationtype_yaml) String

Type of authentication that the function URL uses. Valid values are `AWS_IAM` and `NONE`.

[cors](#state_cors_yaml) [Property Map](#functionurlcors)

Cross-origin resource sharing (CORS) settings for the function URL. See below.

[functionArn](#state_functionarn_yaml) String

ARN of the Lambda function.

[functionName](#state_functionname_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Name or ARN of the Lambda function.

The following arguments are optional:

[functionUrl](#state_functionurl_yaml) String

HTTP URL endpoint for the function in the format `https://<url_id>.lambda-url.<region>.on.aws/`.

[invokeMode](#state_invokemode_yaml) String

How the Lambda function responds to an invocation. Valid values are `BUFFERED` (default) and `RESPONSE_STREAM`.

[qualifier](#state_qualifier_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Alias name or `$LATEST`.

[region](#state_region_yaml) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[urlId](#state_urlid_yaml) String

Generated ID for the endpoint.

## Supporting Types[](#supporting-types)

#### FunctionUrlCors

, FunctionUrlCorsArgs

[](#functionurlcors)

[AllowCredentials](#allowcredentials_csharp) bool

Whether to allow cookies or other credentials in requests to the function URL.

[AllowHeaders](#allowheaders_csharp) List<string>

HTTP headers that origins can include in requests to the function URL.

[AllowMethods](#allowmethods_csharp) List<string>

HTTP methods that are allowed when calling the function URL.

[AllowOrigins](#alloworigins_csharp) List<string>

Origins that can access the function URL.

[ExposeHeaders](#exposeheaders_csharp) List<string>

HTTP headers in your function response that you want to expose to origins that call the function URL.

[MaxAge](#maxage_csharp) int

Maximum amount of time, in seconds, that web browsers can cache results of a preflight request. Maximum value is `86400`.

[AllowCredentials](#allowcredentials_go) bool

Whether to allow cookies or other credentials in requests to the function URL.

[AllowHeaders](#allowheaders_go) \[\]string

HTTP headers that origins can include in requests to the function URL.

[AllowMethods](#allowmethods_go) \[\]string

HTTP methods that are allowed when calling the function URL.

[AllowOrigins](#alloworigins_go) \[\]string

Origins that can access the function URL.

[ExposeHeaders](#exposeheaders_go) \[\]string

HTTP headers in your function response that you want to expose to origins that call the function URL.

[MaxAge](#maxage_go) int

Maximum amount of time, in seconds, that web browsers can cache results of a preflight request. Maximum value is `86400`.

[allow\_credentials](#allow_credentials_hcl) bool

Whether to allow cookies or other credentials in requests to the function URL.

[allow\_headers](#allow_headers_hcl) list(string)

HTTP headers that origins can include in requests to the function URL.

[allow\_methods](#allow_methods_hcl) list(string)

HTTP methods that are allowed when calling the function URL.

[allow\_origins](#allow_origins_hcl) list(string)

Origins that can access the function URL.

[expose\_headers](#expose_headers_hcl) list(string)

HTTP headers in your function response that you want to expose to origins that call the function URL.

[max\_age](#max_age_hcl) number

Maximum amount of time, in seconds, that web browsers can cache results of a preflight request. Maximum value is `86400`.

[allowCredentials](#allowcredentials_java) Boolean

Whether to allow cookies or other credentials in requests to the function URL.

[allowHeaders](#allowheaders_java) List<String>

HTTP headers that origins can include in requests to the function URL.

[allowMethods](#allowmethods_java) List<String>

HTTP methods that are allowed when calling the function URL.

[allowOrigins](#alloworigins_java) List<String>

Origins that can access the function URL.

[exposeHeaders](#exposeheaders_java) List<String>

HTTP headers in your function response that you want to expose to origins that call the function URL.

[maxAge](#maxage_java) Integer

Maximum amount of time, in seconds, that web browsers can cache results of a preflight request. Maximum value is `86400`.

[allowCredentials](#allowcredentials_nodejs) boolean

Whether to allow cookies or other credentials in requests to the function URL.

[allowHeaders](#allowheaders_nodejs) string\[\]

HTTP headers that origins can include in requests to the function URL.

[allowMethods](#allowmethods_nodejs) string\[\]

HTTP methods that are allowed when calling the function URL.

[allowOrigins](#alloworigins_nodejs) string\[\]

Origins that can access the function URL.

[exposeHeaders](#exposeheaders_nodejs) string\[\]

HTTP headers in your function response that you want to expose to origins that call the function URL.

[maxAge](#maxage_nodejs) number

Maximum amount of time, in seconds, that web browsers can cache results of a preflight request. Maximum value is `86400`.

[allow\_credentials](#allow_credentials_python) bool

Whether to allow cookies or other credentials in requests to the function URL.

[allow\_headers](#allow_headers_python) Sequence\[str\]

HTTP headers that origins can include in requests to the function URL.

[allow\_methods](#allow_methods_python) Sequence\[str\]

HTTP methods that are allowed when calling the function URL.

[allow\_origins](#allow_origins_python) Sequence\[str\]

Origins that can access the function URL.

[expose\_headers](#expose_headers_python) Sequence\[str\]

HTTP headers in your function response that you want to expose to origins that call the function URL.

[max\_age](#max_age_python) int

Maximum amount of time, in seconds, that web browsers can cache results of a preflight request. Maximum value is `86400`.

[allowCredentials](#allowcredentials_yaml) Boolean

Whether to allow cookies or other credentials in requests to the function URL.

[allowHeaders](#allowheaders_yaml) List<String>

HTTP headers that origins can include in requests to the function URL.

[allowMethods](#allowmethods_yaml) List<String>

HTTP methods that are allowed when calling the function URL.

[allowOrigins](#alloworigins_yaml) List<String>

Origins that can access the function URL.

[exposeHeaders](#exposeheaders_yaml) List<String>

HTTP headers in your function response that you want to expose to origins that call the function URL.

[maxAge](#maxage_yaml) Number

Maximum amount of time, in seconds, that web browsers can cache results of a preflight request. Maximum value is `86400`.

## Import[](#import)

Using `pulumi import`, import Lambda function URLs using the `functionName` or `function_name/qualifier`. For example:

```bash
$ pulumi import aws:lambda/functionUrl:FunctionUrl example example
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

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2flambda%2ffunctionurl]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2flambda%2ffunctionurl%2f\))

#### Try Pulumi Cloud free.
Your team will thank you.

[Start free trial](https://app.pulumi.com/signup?utm_source=registry&utm_medium=right-rail-banner&utm_campaign=try-pulumi-cloud&iaid=docs-try-pulumi-cloud-ad)
