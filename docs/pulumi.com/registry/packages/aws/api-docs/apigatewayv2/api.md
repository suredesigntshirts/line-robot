---
Source: https://www.pulumi.com/registry/packages/aws/api-docs/apigatewayv2/api/
Generated: 2026-06-06
Updated: 2026-06-06
---

# aws.apigatewayv2.Api

1.  [Packages](/registry/)
2.  [Packages](/registry/packages/)
3.  [AWS](/registry/packages/aws/)
4.  [API Docs](/registry/packages/aws/api-docs/)
5.  [apigatewayv2](/registry/packages/aws/api-docs/apigatewayv2/)
6.  [Api](/registry/packages/aws/api-docs/apigatewayv2/api/)

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

Viewing docs for AWS v7.32.0
published on Friday, May 29, 2026 by Pulumi

[Schema (JSON)](/registry/packages/aws/schema.json)

[pulumi/pulumi-aws](https://github.com/pulumi/pulumi-aws)

v7.32.0 (7.x, latest)v6.83.1 (6.x)v5.43.0 (5.x)

# aws.apigatewayv2.Api[](#aws-apigatewayv2-api)

Explore with Neo

-   Copy Page

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2fapigatewayv2%2fapi]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2fapigatewayv2%2fapi%2f\))

Manages an Amazon API Gateway Version 2 API.

> **Note:** Amazon API Gateway Version 2 resources are used for creating and deploying WebSocket and HTTP APIs. To create and deploy REST APIs, use Amazon API Gateway Version 1 resources.

## Example Usage[](#example-usage)

### Basic WebSocket API[](#basic-websocket-api)

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

const example = new aws.apigatewayv2.Api("example", {
    name: "example-websocket-api",
    protocolType: "WEBSOCKET",
    routeSelectionExpression: "$request.body.action",
});
```

```python
import pulumi
import pulumi_aws as aws

example = aws.apigatewayv2.Api("example",
    name="example-websocket-api",
    protocol_type="WEBSOCKET",
    route_selection_expression="$request.body.action")
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/apigatewayv2"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		_, err := apigatewayv2.NewApi(ctx, "example", &apigatewayv2.ApiArgs{
			Name:                     pulumi.String("example-websocket-api"),
			ProtocolType:             pulumi.String("WEBSOCKET"),
			RouteSelectionExpression: pulumi.String("$request.body.action"),
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
    var example = new Aws.ApiGatewayV2.Api("example", new()
    {
        Name = "example-websocket-api",
        ProtocolType = "WEBSOCKET",
        RouteSelectionExpression = "$request.body.action",
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.apigatewayv2.Api;
import com.pulumi.aws.apigatewayv2.ApiArgs;
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
        var example = new Api("example", ApiArgs.builder()
            .name("example-websocket-api")
            .protocolType("WEBSOCKET")
            .routeSelectionExpression("$request.body.action")
            .build());

    }
}
```

```yaml
resources:
  example:
    type: aws:apigatewayv2:Api
    properties:
      name: example-websocket-api
      protocolType: WEBSOCKET
      routeSelectionExpression: $request.body.action
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_apigatewayv2_api" "example" {
  name                       = "example-websocket-api"
  protocol_type              = "WEBSOCKET"
  route_selection_expression = "$request.body.action"
}
```

### Basic HTTP API[](#basic-http-api)

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

const example = new aws.apigatewayv2.Api("example", {
    name: "example-http-api",
    protocolType: "HTTP",
});
```

```python
import pulumi
import pulumi_aws as aws

example = aws.apigatewayv2.Api("example",
    name="example-http-api",
    protocol_type="HTTP")
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/apigatewayv2"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		_, err := apigatewayv2.NewApi(ctx, "example", &apigatewayv2.ApiArgs{
			Name:         pulumi.String("example-http-api"),
			ProtocolType: pulumi.String("HTTP"),
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
    var example = new Aws.ApiGatewayV2.Api("example", new()
    {
        Name = "example-http-api",
        ProtocolType = "HTTP",
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.apigatewayv2.Api;
import com.pulumi.aws.apigatewayv2.ApiArgs;
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
        var example = new Api("example", ApiArgs.builder()
            .name("example-http-api")
            .protocolType("HTTP")
            .build());

    }
}
```

```yaml
resources:
  example:
    type: aws:apigatewayv2:Api
    properties:
      name: example-http-api
      protocolType: HTTP
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_apigatewayv2_api" "example" {
  name          = "example-http-api"
  protocol_type = "HTTP"
}
```

## Create Api Resource[](#create)

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
new Api(name: string, args: ApiArgs, opts?: CustomResourceOptions);
```

```python
@overload
def Api(resource_name: str,
        args: ApiArgs,
        opts: Optional[ResourceOptions] = None)

@overload
def Api(resource_name: str,
        opts: Optional[ResourceOptions] = None,
        protocol_type: Optional[str] = None,
        name: Optional[str] = None,
        route_key: Optional[str] = None,
        credentials_arn: Optional[str] = None,
        description: Optional[str] = None,
        disable_execute_api_endpoint: Optional[bool] = None,
        fail_on_warnings: Optional[bool] = None,
        cors_configuration: Optional[ApiCorsConfigurationArgs] = None,
        body: Optional[str] = None,
        ip_address_type: Optional[str] = None,
        region: Optional[str] = None,
        api_key_selection_expression: Optional[str] = None,
        route_selection_expression: Optional[str] = None,
        tags: Optional[Mapping[str, str]] = None,
        target: Optional[str] = None,
        version: Optional[str] = None)
```

```go
func NewApi(ctx *Context, name string, args ApiArgs, opts ...ResourceOption) (*Api, error)
```

```csharp
public Api(string name, ApiArgs args, CustomResourceOptions? opts = null)
```

```java
public Api(String name, ApiArgs args)
public Api(String name, ApiArgs args, CustomResourceOptions options)
```

```yaml
type: aws:apigatewayv2:Api
properties: # The arguments to resource properties.
options: # Bag of options to control resource's behavior.
```

```hcl
resource "aws_apigatewayv2_api" "name" {
    # resource properties
}
```

#### Parameters[](#parameters)

name This property is required. string

The unique name of the resource.

args This property is required. [ApiArgs](#inputs)

The arguments to resource properties.

opts [CustomResourceOptions](/docs/reference/pkg/nodejs/pulumi/pulumi/#CustomResourceOptions)

Bag of options to control resource's behavior.

resource\_name This property is required. str

The unique name of the resource.

args This property is required. [ApiArgs](#inputs)

The arguments to resource properties.

opts [ResourceOptions](/docs/reference/pkg/python/pulumi/#pulumi.ResourceOptions)

Bag of options to control resource's behavior.

ctx [Context](https://pkg.go.dev/github.com/pulumi/pulumi/sdk/v3/go/pulumi?tab=doc#Context)

Context object for the current deployment.

name This property is required. string

The unique name of the resource.

args This property is required. [ApiArgs](#inputs)

The arguments to resource properties.

opts [ResourceOption](https://pkg.go.dev/github.com/pulumi/pulumi/sdk/v3/go/pulumi?tab=doc#ResourceOption)

Bag of options to control resource's behavior.

name This property is required. string

The unique name of the resource.

args This property is required. [ApiArgs](#inputs)

The arguments to resource properties.

opts [CustomResourceOptions](/docs/reference/pkg/dotnet/Pulumi/Pulumi.CustomResourceOptions.html)

Bag of options to control resource's behavior.

name This property is required. String

The unique name of the resource.

args This property is required. [ApiArgs](#inputs)

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
var apiResource = new Aws.ApiGatewayV2.Api("apiResource", new()
{
    ProtocolType = "string",
    Name = "string",
    RouteKey = "string",
    CredentialsArn = "string",
    Description = "string",
    DisableExecuteApiEndpoint = false,
    FailOnWarnings = false,
    CorsConfiguration = new Aws.ApiGatewayV2.Inputs.ApiCorsConfigurationArgs
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
    Body = "string",
    IpAddressType = "string",
    Region = "string",
    ApiKeySelectionExpression = "string",
    RouteSelectionExpression = "string",
    Tags =
    {
        { "string", "string" },
    },
    Target = "string",
    Version = "string",
});
```

```go
example, err := apigatewayv2.NewApi(ctx, "apiResource", &apigatewayv2.ApiArgs{
	ProtocolType:              pulumi.String("string"),
	Name:                      pulumi.String("string"),
	RouteKey:                  pulumi.String("string"),
	CredentialsArn:            pulumi.String("string"),
	Description:               pulumi.String("string"),
	DisableExecuteApiEndpoint: pulumi.Bool(false),
	FailOnWarnings:            pulumi.Bool(false),
	CorsConfiguration: &apigatewayv2.ApiCorsConfigurationArgs{
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
	Body:                      pulumi.String("string"),
	IpAddressType:             pulumi.String("string"),
	Region:                    pulumi.String("string"),
	ApiKeySelectionExpression: pulumi.String("string"),
	RouteSelectionExpression:  pulumi.String("string"),
	Tags: pulumi.StringMap{
		"string": pulumi.String("string"),
	},
	Target:  pulumi.String("string"),
	Version: pulumi.String("string"),
})
```

```hcl
resource "aws_apigatewayv2_api" "apiResource" {
  protocol_type                = "string"
  name                         = "string"
  route_key                    = "string"
  credentials_arn              = "string"
  description                  = "string"
  disable_execute_api_endpoint = false
  fail_on_warnings             = false
  cors_configuration = {
    allow_credentials = false
    allow_headers     = ["string"]
    allow_methods     = ["string"]
    allow_origins     = ["string"]
    expose_headers    = ["string"]
    max_age           = 0
  }
  body                         = "string"
  ip_address_type              = "string"
  region                       = "string"
  api_key_selection_expression = "string"
  route_selection_expression   = "string"
  tags = {
    "string" = "string"
  }
  target  = "string"
  version = "string"
}
```

```java
var apiResource = new com.pulumi.aws.apigatewayv2.Api("apiResource", com.pulumi.aws.apigatewayv2.ApiArgs.builder()
    .protocolType("string")
    .name("string")
    .routeKey("string")
    .credentialsArn("string")
    .description("string")
    .disableExecuteApiEndpoint(false)
    .failOnWarnings(false)
    .corsConfiguration(ApiCorsConfigurationArgs.builder()
        .allowCredentials(false)
        .allowHeaders("string")
        .allowMethods("string")
        .allowOrigins("string")
        .exposeHeaders("string")
        .maxAge(0)
        .build())
    .body("string")
    .ipAddressType("string")
    .region("string")
    .apiKeySelectionExpression("string")
    .routeSelectionExpression("string")
    .tags(Map.of("string", "string"))
    .target("string")
    .version("string")
    .build());
```

```python
api_resource = aws.apigatewayv2.Api("apiResource",
    protocol_type="string",
    name="string",
    route_key="string",
    credentials_arn="string",
    description="string",
    disable_execute_api_endpoint=False,
    fail_on_warnings=False,
    cors_configuration={
        "allow_credentials": False,
        "allow_headers": ["string"],
        "allow_methods": ["string"],
        "allow_origins": ["string"],
        "expose_headers": ["string"],
        "max_age": 0,
    },
    body="string",
    ip_address_type="string",
    region="string",
    api_key_selection_expression="string",
    route_selection_expression="string",
    tags={
        "string": "string",
    },
    target="string",
    version="string")
```

```typescript
const apiResource = new aws.apigatewayv2.Api("apiResource", {
    protocolType: "string",
    name: "string",
    routeKey: "string",
    credentialsArn: "string",
    description: "string",
    disableExecuteApiEndpoint: false,
    failOnWarnings: false,
    corsConfiguration: {
        allowCredentials: false,
        allowHeaders: ["string"],
        allowMethods: ["string"],
        allowOrigins: ["string"],
        exposeHeaders: ["string"],
        maxAge: 0,
    },
    body: "string",
    ipAddressType: "string",
    region: "string",
    apiKeySelectionExpression: "string",
    routeSelectionExpression: "string",
    tags: {
        string: "string",
    },
    target: "string",
    version: "string",
});
```

```yaml
type: aws:apigatewayv2:Api
properties:
    apiKeySelectionExpression: string
    body: string
    corsConfiguration:
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
    credentialsArn: string
    description: string
    disableExecuteApiEndpoint: false
    failOnWarnings: false
    ipAddressType: string
    name: string
    protocolType: string
    region: string
    routeKey: string
    routeSelectionExpression: string
    tags:
        string: string
    target: string
    version: string
```

## Api Resource Properties[](#properties)

To learn more about resource properties and how to use them, see [Inputs and Outputs](/docs/intro/concepts/inputs-outputs) in the Architecture and Concepts docs.

### Inputs[](#inputs)

In Python, inputs that are objects can be passed either as [argument classes or as dictionary literals](/docs/languages-sdks/python/#inputs-and-outputs).

The Api resource accepts the following [input](/docs/intro/concepts/inputs-outputs) properties:

[ProtocolType](#protocoltype_csharp)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

API protocol. Valid values: `HTTP`, `WEBSOCKET`.

[ApiKeySelectionExpression](#apikeyselectionexpression_csharp) string

An [API key selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-apikey-selection-expressions). Valid values: `$context.authorizer.usageIdentifierKey`, `$request.header.x-api-key`. Defaults to `$request.header.x-api-key`. Applicable for WebSocket APIs.

[Body](#body_csharp) string

An OpenAPI specification that defines the set of routes and integrations to create as part of the HTTP APIs. Supported only for HTTP APIs.

[CorsConfiguration](#corsconfiguration_csharp) [ApiCorsConfiguration](#apicorsconfiguration)

Cross-origin resource sharing (CORS) [configuration](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-cors.html). Applicable for HTTP APIs.

[CredentialsArn](#credentialsarn_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Part of *quick create*. Specifies any credentials required for the integration. Applicable for HTTP APIs.

[Description](#description_csharp) string

Description of the API. Must be less than or equal to 1024 characters in length.

[DisableExecuteApiEndpoint](#disableexecuteapiendpoint_csharp) bool

Whether clients can invoke the API by using the default `execute-api` endpoint. By default, clients can invoke the API with the default `{api_id}.execute-api.{region}.amazonaws.com endpoint`. To require that clients use a custom domain name to invoke the API, disable the default endpoint.

[FailOnWarnings](#failonwarnings_csharp) bool

Whether warnings should return an error while API Gateway is creating or updating the resource using an OpenAPI specification. Defaults to `false`. Applicable for HTTP APIs.

[IpAddressType](#ipaddresstype_csharp) string

The IP address types that can invoke the API. Valid values: `ipv4`, `dualstack`. Use `ipv4` to allow only IPv4 addresses to invoke your API, or use `dualstack` to allow both IPv4 and IPv6 addresses to invoke your API. Defaults to `ipv4`.

[Name](#name_csharp) string

Name of the API. Must be less than or equal to 128 characters in length.

[Region](#region_csharp) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[RouteKey](#routekey_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Part of *quick create*. Specifies any [route key](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-routes.html). Applicable for HTTP APIs.

[RouteSelectionExpression](#routeselectionexpression_csharp) string

The [route selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-route-selection-expressions) for the API. Defaults to `$request.method $request.path`.

[Tags](#tags_csharp) Dictionary<string, string>

Map of tags to assign to the API. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[Target](#target_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Part of *quick create*. Quick create produces an API with an integration, a default catch-all route, and a default stage which is configured to automatically deploy changes. For HTTP integrations, specify a fully qualified URL. For Lambda integrations, specify a function ARN. The type of the integration will be `HTTP_PROXY` or `AWS_PROXY`, respectively. Applicable for HTTP APIs.

[Version](#version_csharp) string

Version identifier for the API. Must be between 1 and 64 characters in length.

[ProtocolType](#protocoltype_go)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

API protocol. Valid values: `HTTP`, `WEBSOCKET`.

[ApiKeySelectionExpression](#apikeyselectionexpression_go) string

An [API key selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-apikey-selection-expressions). Valid values: `$context.authorizer.usageIdentifierKey`, `$request.header.x-api-key`. Defaults to `$request.header.x-api-key`. Applicable for WebSocket APIs.

[Body](#body_go) string

An OpenAPI specification that defines the set of routes and integrations to create as part of the HTTP APIs. Supported only for HTTP APIs.

[CorsConfiguration](#corsconfiguration_go) [ApiCorsConfigurationArgs](#apicorsconfiguration)

Cross-origin resource sharing (CORS) [configuration](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-cors.html). Applicable for HTTP APIs.

[CredentialsArn](#credentialsarn_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Part of *quick create*. Specifies any credentials required for the integration. Applicable for HTTP APIs.

[Description](#description_go) string

Description of the API. Must be less than or equal to 1024 characters in length.

[DisableExecuteApiEndpoint](#disableexecuteapiendpoint_go) bool

Whether clients can invoke the API by using the default `execute-api` endpoint. By default, clients can invoke the API with the default `{api_id}.execute-api.{region}.amazonaws.com endpoint`. To require that clients use a custom domain name to invoke the API, disable the default endpoint.

[FailOnWarnings](#failonwarnings_go) bool

Whether warnings should return an error while API Gateway is creating or updating the resource using an OpenAPI specification. Defaults to `false`. Applicable for HTTP APIs.

[IpAddressType](#ipaddresstype_go) string

The IP address types that can invoke the API. Valid values: `ipv4`, `dualstack`. Use `ipv4` to allow only IPv4 addresses to invoke your API, or use `dualstack` to allow both IPv4 and IPv6 addresses to invoke your API. Defaults to `ipv4`.

[Name](#name_go) string

Name of the API. Must be less than or equal to 128 characters in length.

[Region](#region_go) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[RouteKey](#routekey_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Part of *quick create*. Specifies any [route key](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-routes.html). Applicable for HTTP APIs.

[RouteSelectionExpression](#routeselectionexpression_go) string

The [route selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-route-selection-expressions) for the API. Defaults to `$request.method $request.path`.

[Tags](#tags_go) map\[string\]string

Map of tags to assign to the API. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[Target](#target_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Part of *quick create*. Quick create produces an API with an integration, a default catch-all route, and a default stage which is configured to automatically deploy changes. For HTTP integrations, specify a fully qualified URL. For Lambda integrations, specify a function ARN. The type of the integration will be `HTTP_PROXY` or `AWS_PROXY`, respectively. Applicable for HTTP APIs.

[Version](#version_go) string

Version identifier for the API. Must be between 1 and 64 characters in length.

[protocol\_type](#protocol_type_hcl)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

API protocol. Valid values: `HTTP`, `WEBSOCKET`.

[api\_key\_selection\_expression](#api_key_selection_expression_hcl) string

An [API key selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-apikey-selection-expressions). Valid values: `$context.authorizer.usageIdentifierKey`, `$request.header.x-api-key`. Defaults to `$request.header.x-api-key`. Applicable for WebSocket APIs.

[body](#body_hcl) string

An OpenAPI specification that defines the set of routes and integrations to create as part of the HTTP APIs. Supported only for HTTP APIs.

[cors\_configuration](#cors_configuration_hcl) [object](#apicorsconfiguration)

Cross-origin resource sharing (CORS) [configuration](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-cors.html). Applicable for HTTP APIs.

[credentials\_arn](#credentials_arn_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Part of *quick create*. Specifies any credentials required for the integration. Applicable for HTTP APIs.

[description](#description_hcl) string

Description of the API. Must be less than or equal to 1024 characters in length.

[disable\_execute\_api\_endpoint](#disable_execute_api_endpoint_hcl) bool

Whether clients can invoke the API by using the default `execute-api` endpoint. By default, clients can invoke the API with the default `{api_id}.execute-api.{region}.amazonaws.com endpoint`. To require that clients use a custom domain name to invoke the API, disable the default endpoint.

[fail\_on\_warnings](#fail_on_warnings_hcl) bool

Whether warnings should return an error while API Gateway is creating or updating the resource using an OpenAPI specification. Defaults to `false`. Applicable for HTTP APIs.

[ip\_address\_type](#ip_address_type_hcl) string

The IP address types that can invoke the API. Valid values: `ipv4`, `dualstack`. Use `ipv4` to allow only IPv4 addresses to invoke your API, or use `dualstack` to allow both IPv4 and IPv6 addresses to invoke your API. Defaults to `ipv4`.

[name](#name_hcl) string

Name of the API. Must be less than or equal to 128 characters in length.

[region](#region_hcl) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[route\_key](#route_key_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Part of *quick create*. Specifies any [route key](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-routes.html). Applicable for HTTP APIs.

[route\_selection\_expression](#route_selection_expression_hcl) string

The [route selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-route-selection-expressions) for the API. Defaults to `$request.method $request.path`.

[tags](#tags_hcl) map(string)

Map of tags to assign to the API. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[target](#target_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Part of *quick create*. Quick create produces an API with an integration, a default catch-all route, and a default stage which is configured to automatically deploy changes. For HTTP integrations, specify a fully qualified URL. For Lambda integrations, specify a function ARN. The type of the integration will be `HTTP_PROXY` or `AWS_PROXY`, respectively. Applicable for HTTP APIs.

[version](#version_hcl) string

Version identifier for the API. Must be between 1 and 64 characters in length.

[protocolType](#protocoltype_java)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

String

API protocol. Valid values: `HTTP`, `WEBSOCKET`.

[apiKeySelectionExpression](#apikeyselectionexpression_java) String

An [API key selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-apikey-selection-expressions). Valid values: `$context.authorizer.usageIdentifierKey`, `$request.header.x-api-key`. Defaults to `$request.header.x-api-key`. Applicable for WebSocket APIs.

[body](#body_java) String

An OpenAPI specification that defines the set of routes and integrations to create as part of the HTTP APIs. Supported only for HTTP APIs.

[corsConfiguration](#corsconfiguration_java) [ApiCorsConfiguration](#apicorsconfiguration)

Cross-origin resource sharing (CORS) [configuration](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-cors.html). Applicable for HTTP APIs.

[credentialsArn](#credentialsarn_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Part of *quick create*. Specifies any credentials required for the integration. Applicable for HTTP APIs.

[description](#description_java) String

Description of the API. Must be less than or equal to 1024 characters in length.

[disableExecuteApiEndpoint](#disableexecuteapiendpoint_java) Boolean

Whether clients can invoke the API by using the default `execute-api` endpoint. By default, clients can invoke the API with the default `{api_id}.execute-api.{region}.amazonaws.com endpoint`. To require that clients use a custom domain name to invoke the API, disable the default endpoint.

[failOnWarnings](#failonwarnings_java) Boolean

Whether warnings should return an error while API Gateway is creating or updating the resource using an OpenAPI specification. Defaults to `false`. Applicable for HTTP APIs.

[ipAddressType](#ipaddresstype_java) String

The IP address types that can invoke the API. Valid values: `ipv4`, `dualstack`. Use `ipv4` to allow only IPv4 addresses to invoke your API, or use `dualstack` to allow both IPv4 and IPv6 addresses to invoke your API. Defaults to `ipv4`.

[name](#name_java) String

Name of the API. Must be less than or equal to 128 characters in length.

[region](#region_java) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[routeKey](#routekey_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Part of *quick create*. Specifies any [route key](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-routes.html). Applicable for HTTP APIs.

[routeSelectionExpression](#routeselectionexpression_java) String

The [route selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-route-selection-expressions) for the API. Defaults to `$request.method $request.path`.

[tags](#tags_java) Map<String,String>

Map of tags to assign to the API. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[target](#target_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Part of *quick create*. Quick create produces an API with an integration, a default catch-all route, and a default stage which is configured to automatically deploy changes. For HTTP integrations, specify a fully qualified URL. For Lambda integrations, specify a function ARN. The type of the integration will be `HTTP_PROXY` or `AWS_PROXY`, respectively. Applicable for HTTP APIs.

[version](#version_java) String

Version identifier for the API. Must be between 1 and 64 characters in length.

[protocolType](#protocoltype_nodejs)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

API protocol. Valid values: `HTTP`, `WEBSOCKET`.

[apiKeySelectionExpression](#apikeyselectionexpression_nodejs) string

An [API key selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-apikey-selection-expressions). Valid values: `$context.authorizer.usageIdentifierKey`, `$request.header.x-api-key`. Defaults to `$request.header.x-api-key`. Applicable for WebSocket APIs.

[body](#body_nodejs) string

An OpenAPI specification that defines the set of routes and integrations to create as part of the HTTP APIs. Supported only for HTTP APIs.

[corsConfiguration](#corsconfiguration_nodejs) [ApiCorsConfiguration](#apicorsconfiguration)

Cross-origin resource sharing (CORS) [configuration](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-cors.html). Applicable for HTTP APIs.

[credentialsArn](#credentialsarn_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Part of *quick create*. Specifies any credentials required for the integration. Applicable for HTTP APIs.

[description](#description_nodejs) string

Description of the API. Must be less than or equal to 1024 characters in length.

[disableExecuteApiEndpoint](#disableexecuteapiendpoint_nodejs) boolean

Whether clients can invoke the API by using the default `execute-api` endpoint. By default, clients can invoke the API with the default `{api_id}.execute-api.{region}.amazonaws.com endpoint`. To require that clients use a custom domain name to invoke the API, disable the default endpoint.

[failOnWarnings](#failonwarnings_nodejs) boolean

Whether warnings should return an error while API Gateway is creating or updating the resource using an OpenAPI specification. Defaults to `false`. Applicable for HTTP APIs.

[ipAddressType](#ipaddresstype_nodejs) string

The IP address types that can invoke the API. Valid values: `ipv4`, `dualstack`. Use `ipv4` to allow only IPv4 addresses to invoke your API, or use `dualstack` to allow both IPv4 and IPv6 addresses to invoke your API. Defaults to `ipv4`.

[name](#name_nodejs) string

Name of the API. Must be less than or equal to 128 characters in length.

[region](#region_nodejs) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[routeKey](#routekey_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Part of *quick create*. Specifies any [route key](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-routes.html). Applicable for HTTP APIs.

[routeSelectionExpression](#routeselectionexpression_nodejs) string

The [route selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-route-selection-expressions) for the API. Defaults to `$request.method $request.path`.

[tags](#tags_nodejs) {\[key: string\]: string}

Map of tags to assign to the API. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[target](#target_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Part of *quick create*. Quick create produces an API with an integration, a default catch-all route, and a default stage which is configured to automatically deploy changes. For HTTP integrations, specify a fully qualified URL. For Lambda integrations, specify a function ARN. The type of the integration will be `HTTP_PROXY` or `AWS_PROXY`, respectively. Applicable for HTTP APIs.

[version](#version_nodejs) string

Version identifier for the API. Must be between 1 and 64 characters in length.

[protocol\_type](#protocol_type_python)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

str

API protocol. Valid values: `HTTP`, `WEBSOCKET`.

[api\_key\_selection\_expression](#api_key_selection_expression_python) str

An [API key selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-apikey-selection-expressions). Valid values: `$context.authorizer.usageIdentifierKey`, `$request.header.x-api-key`. Defaults to `$request.header.x-api-key`. Applicable for WebSocket APIs.

[body](#body_python) str

An OpenAPI specification that defines the set of routes and integrations to create as part of the HTTP APIs. Supported only for HTTP APIs.

[cors\_configuration](#cors_configuration_python) [ApiCorsConfigurationArgs](#apicorsconfiguration)

Cross-origin resource sharing (CORS) [configuration](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-cors.html). Applicable for HTTP APIs.

[credentials\_arn](#credentials_arn_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Part of *quick create*. Specifies any credentials required for the integration. Applicable for HTTP APIs.

[description](#description_python) str

Description of the API. Must be less than or equal to 1024 characters in length.

[disable\_execute\_api\_endpoint](#disable_execute_api_endpoint_python) bool

Whether clients can invoke the API by using the default `execute-api` endpoint. By default, clients can invoke the API with the default `{api_id}.execute-api.{region}.amazonaws.com endpoint`. To require that clients use a custom domain name to invoke the API, disable the default endpoint.

[fail\_on\_warnings](#fail_on_warnings_python) bool

Whether warnings should return an error while API Gateway is creating or updating the resource using an OpenAPI specification. Defaults to `false`. Applicable for HTTP APIs.

[ip\_address\_type](#ip_address_type_python) str

The IP address types that can invoke the API. Valid values: `ipv4`, `dualstack`. Use `ipv4` to allow only IPv4 addresses to invoke your API, or use `dualstack` to allow both IPv4 and IPv6 addresses to invoke your API. Defaults to `ipv4`.

[name](#name_python) str

Name of the API. Must be less than or equal to 128 characters in length.

[region](#region_python) str

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[route\_key](#route_key_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Part of *quick create*. Specifies any [route key](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-routes.html). Applicable for HTTP APIs.

[route\_selection\_expression](#route_selection_expression_python) str

The [route selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-route-selection-expressions) for the API. Defaults to `$request.method $request.path`.

[tags](#tags_python) Mapping\[str, str\]

Map of tags to assign to the API. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[target](#target_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Part of *quick create*. Quick create produces an API with an integration, a default catch-all route, and a default stage which is configured to automatically deploy changes. For HTTP integrations, specify a fully qualified URL. For Lambda integrations, specify a function ARN. The type of the integration will be `HTTP_PROXY` or `AWS_PROXY`, respectively. Applicable for HTTP APIs.

[version](#version_python) str

Version identifier for the API. Must be between 1 and 64 characters in length.

[protocolType](#protocoltype_yaml)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

String

API protocol. Valid values: `HTTP`, `WEBSOCKET`.

[apiKeySelectionExpression](#apikeyselectionexpression_yaml) String

An [API key selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-apikey-selection-expressions). Valid values: `$context.authorizer.usageIdentifierKey`, `$request.header.x-api-key`. Defaults to `$request.header.x-api-key`. Applicable for WebSocket APIs.

[body](#body_yaml) String

An OpenAPI specification that defines the set of routes and integrations to create as part of the HTTP APIs. Supported only for HTTP APIs.

[corsConfiguration](#corsconfiguration_yaml) [Property Map](#apicorsconfiguration)

Cross-origin resource sharing (CORS) [configuration](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-cors.html). Applicable for HTTP APIs.

[credentialsArn](#credentialsarn_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Part of *quick create*. Specifies any credentials required for the integration. Applicable for HTTP APIs.

[description](#description_yaml) String

Description of the API. Must be less than or equal to 1024 characters in length.

[disableExecuteApiEndpoint](#disableexecuteapiendpoint_yaml) Boolean

Whether clients can invoke the API by using the default `execute-api` endpoint. By default, clients can invoke the API with the default `{api_id}.execute-api.{region}.amazonaws.com endpoint`. To require that clients use a custom domain name to invoke the API, disable the default endpoint.

[failOnWarnings](#failonwarnings_yaml) Boolean

Whether warnings should return an error while API Gateway is creating or updating the resource using an OpenAPI specification. Defaults to `false`. Applicable for HTTP APIs.

[ipAddressType](#ipaddresstype_yaml) String

The IP address types that can invoke the API. Valid values: `ipv4`, `dualstack`. Use `ipv4` to allow only IPv4 addresses to invoke your API, or use `dualstack` to allow both IPv4 and IPv6 addresses to invoke your API. Defaults to `ipv4`.

[name](#name_yaml) String

Name of the API. Must be less than or equal to 128 characters in length.

[region](#region_yaml) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[routeKey](#routekey_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Part of *quick create*. Specifies any [route key](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-routes.html). Applicable for HTTP APIs.

[routeSelectionExpression](#routeselectionexpression_yaml) String

The [route selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-route-selection-expressions) for the API. Defaults to `$request.method $request.path`.

[tags](#tags_yaml) Map<String>

Map of tags to assign to the API. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[target](#target_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Part of *quick create*. Quick create produces an API with an integration, a default catch-all route, and a default stage which is configured to automatically deploy changes. For HTTP integrations, specify a fully qualified URL. For Lambda integrations, specify a function ARN. The type of the integration will be `HTTP_PROXY` or `AWS_PROXY`, respectively. Applicable for HTTP APIs.

[version](#version_yaml) String

Version identifier for the API. Must be between 1 and 64 characters in length.

### Outputs[](#outputs)

All [input](#inputs) properties are implicitly available as output properties. Additionally, the Api resource produces the following output properties:

[ApiEndpoint](#apiendpoint_csharp) string

URI of the API, of the form `https://{api-id}.execute-api.{region}.amazonaws.com` for HTTP APIs and `wss://{api-id}.execute-api.{region}.amazonaws.com` for WebSocket APIs.

[Arn](#arn_csharp) string

ARN of the API.

[ExecutionArn](#executionarn_csharp) string

ARN prefix to be used in an `aws.lambda.Permission`'s `sourceArn` attribute or in an `aws.iam.Policy` to authorize access to the [`@connections` API](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-how-to-call-websocket-api-connections.html). See the [Amazon API Gateway Developer Guide](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-control-access-iam.html) for details.

[Id](#id_csharp) string

The provider-assigned unique ID for this managed resource.

[TagsAll](#tagsall_csharp) Dictionary<string, string>

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[ApiEndpoint](#apiendpoint_go) string

URI of the API, of the form `https://{api-id}.execute-api.{region}.amazonaws.com` for HTTP APIs and `wss://{api-id}.execute-api.{region}.amazonaws.com` for WebSocket APIs.

[Arn](#arn_go) string

ARN of the API.

[ExecutionArn](#executionarn_go) string

ARN prefix to be used in an `aws.lambda.Permission`'s `sourceArn` attribute or in an `aws.iam.Policy` to authorize access to the [`@connections` API](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-how-to-call-websocket-api-connections.html). See the [Amazon API Gateway Developer Guide](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-control-access-iam.html) for details.

[Id](#id_go) string

The provider-assigned unique ID for this managed resource.

[TagsAll](#tagsall_go) map\[string\]string

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[api\_endpoint](#api_endpoint_hcl) string

URI of the API, of the form `https://{api-id}.execute-api.{region}.amazonaws.com` for HTTP APIs and `wss://{api-id}.execute-api.{region}.amazonaws.com` for WebSocket APIs.

[arn](#arn_hcl) string

ARN of the API.

[execution\_arn](#execution_arn_hcl) string

ARN prefix to be used in an `aws.lambda.Permission`'s `sourceArn` attribute or in an `aws.iam.Policy` to authorize access to the [`@connections` API](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-how-to-call-websocket-api-connections.html). See the [Amazon API Gateway Developer Guide](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-control-access-iam.html) for details.

[id](#id_hcl) string

The provider-assigned unique ID for this managed resource.

[tags\_all](#tags_all_hcl) map(string)

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[apiEndpoint](#apiendpoint_java) String

URI of the API, of the form `https://{api-id}.execute-api.{region}.amazonaws.com` for HTTP APIs and `wss://{api-id}.execute-api.{region}.amazonaws.com` for WebSocket APIs.

[arn](#arn_java) String

ARN of the API.

[executionArn](#executionarn_java) String

ARN prefix to be used in an `aws.lambda.Permission`'s `sourceArn` attribute or in an `aws.iam.Policy` to authorize access to the [`@connections` API](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-how-to-call-websocket-api-connections.html). See the [Amazon API Gateway Developer Guide](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-control-access-iam.html) for details.

[id](#id_java) String

The provider-assigned unique ID for this managed resource.

[tagsAll](#tagsall_java) Map<String,String>

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[apiEndpoint](#apiendpoint_nodejs) string

URI of the API, of the form `https://{api-id}.execute-api.{region}.amazonaws.com` for HTTP APIs and `wss://{api-id}.execute-api.{region}.amazonaws.com` for WebSocket APIs.

[arn](#arn_nodejs) string

ARN of the API.

[executionArn](#executionarn_nodejs) string

ARN prefix to be used in an `aws.lambda.Permission`'s `sourceArn` attribute or in an `aws.iam.Policy` to authorize access to the [`@connections` API](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-how-to-call-websocket-api-connections.html). See the [Amazon API Gateway Developer Guide](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-control-access-iam.html) for details.

[id](#id_nodejs) string

The provider-assigned unique ID for this managed resource.

[tagsAll](#tagsall_nodejs) {\[key: string\]: string}

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[api\_endpoint](#api_endpoint_python) str

URI of the API, of the form `https://{api-id}.execute-api.{region}.amazonaws.com` for HTTP APIs and `wss://{api-id}.execute-api.{region}.amazonaws.com` for WebSocket APIs.

[arn](#arn_python) str

ARN of the API.

[execution\_arn](#execution_arn_python) str

ARN prefix to be used in an `aws.lambda.Permission`'s `sourceArn` attribute or in an `aws.iam.Policy` to authorize access to the [`@connections` API](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-how-to-call-websocket-api-connections.html). See the [Amazon API Gateway Developer Guide](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-control-access-iam.html) for details.

[id](#id_python) str

The provider-assigned unique ID for this managed resource.

[tags\_all](#tags_all_python) Mapping\[str, str\]

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[apiEndpoint](#apiendpoint_yaml) String

URI of the API, of the form `https://{api-id}.execute-api.{region}.amazonaws.com` for HTTP APIs and `wss://{api-id}.execute-api.{region}.amazonaws.com` for WebSocket APIs.

[arn](#arn_yaml) String

ARN of the API.

[executionArn](#executionarn_yaml) String

ARN prefix to be used in an `aws.lambda.Permission`'s `sourceArn` attribute or in an `aws.iam.Policy` to authorize access to the [`@connections` API](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-how-to-call-websocket-api-connections.html). See the [Amazon API Gateway Developer Guide](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-control-access-iam.html) for details.

[id](#id_yaml) String

The provider-assigned unique ID for this managed resource.

[tagsAll](#tagsall_yaml) Map<String>

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

## Look up Existing Api Resource[](#look-up)

Get an existing Api resource’s state with the given name, ID, and optional extra properties used to qualify the lookup.

-   TypeScript
-   Python
-   Go
-   C#
-   Java
-   YAML
-   HCL PREVIEW

```typescript
public static get(name: string, id: Input<ID>, state?: ApiState, opts?: CustomResourceOptions): Api
```

```python
@staticmethod
def get(resource_name: str,
        id: str,
        opts: Optional[ResourceOptions] = None,
        api_endpoint: Optional[str] = None,
        api_key_selection_expression: Optional[str] = None,
        arn: Optional[str] = None,
        body: Optional[str] = None,
        cors_configuration: Optional[ApiCorsConfigurationArgs] = None,
        credentials_arn: Optional[str] = None,
        description: Optional[str] = None,
        disable_execute_api_endpoint: Optional[bool] = None,
        execution_arn: Optional[str] = None,
        fail_on_warnings: Optional[bool] = None,
        ip_address_type: Optional[str] = None,
        name: Optional[str] = None,
        protocol_type: Optional[str] = None,
        region: Optional[str] = None,
        route_key: Optional[str] = None,
        route_selection_expression: Optional[str] = None,
        tags: Optional[Mapping[str, str]] = None,
        tags_all: Optional[Mapping[str, str]] = None,
        target: Optional[str] = None,
        version: Optional[str] = None) -> Api
```

```go
func GetApi(ctx *Context, name string, id IDInput, state *ApiState, opts ...ResourceOption) (*Api, error)
```

```csharp
public static Api Get(string name, Input<string> id, ApiState? state, CustomResourceOptions? opts = null)
```

```java
public static Api get(String name, Output<String> id, ApiState state, CustomResourceOptions options)
```

```yaml
resources:  _:    type: aws:apigatewayv2:Api    get:      id: ${id}
```

```hcl
import {
  to = aws_apigatewayv2_api.example
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

[ApiEndpoint](#state_apiendpoint_csharp) string

URI of the API, of the form `https://{api-id}.execute-api.{region}.amazonaws.com` for HTTP APIs and `wss://{api-id}.execute-api.{region}.amazonaws.com` for WebSocket APIs.

[ApiKeySelectionExpression](#state_apikeyselectionexpression_csharp) string

An [API key selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-apikey-selection-expressions). Valid values: `$context.authorizer.usageIdentifierKey`, `$request.header.x-api-key`. Defaults to `$request.header.x-api-key`. Applicable for WebSocket APIs.

[Arn](#state_arn_csharp) string

ARN of the API.

[Body](#state_body_csharp) string

An OpenAPI specification that defines the set of routes and integrations to create as part of the HTTP APIs. Supported only for HTTP APIs.

[CorsConfiguration](#state_corsconfiguration_csharp) [ApiCorsConfiguration](#apicorsconfiguration)

Cross-origin resource sharing (CORS) [configuration](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-cors.html). Applicable for HTTP APIs.

[CredentialsArn](#state_credentialsarn_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Part of *quick create*. Specifies any credentials required for the integration. Applicable for HTTP APIs.

[Description](#state_description_csharp) string

Description of the API. Must be less than or equal to 1024 characters in length.

[DisableExecuteApiEndpoint](#state_disableexecuteapiendpoint_csharp) bool

Whether clients can invoke the API by using the default `execute-api` endpoint. By default, clients can invoke the API with the default `{api_id}.execute-api.{region}.amazonaws.com endpoint`. To require that clients use a custom domain name to invoke the API, disable the default endpoint.

[ExecutionArn](#state_executionarn_csharp) string

ARN prefix to be used in an `aws.lambda.Permission`'s `sourceArn` attribute or in an `aws.iam.Policy` to authorize access to the [`@connections` API](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-how-to-call-websocket-api-connections.html). See the [Amazon API Gateway Developer Guide](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-control-access-iam.html) for details.

[FailOnWarnings](#state_failonwarnings_csharp) bool

Whether warnings should return an error while API Gateway is creating or updating the resource using an OpenAPI specification. Defaults to `false`. Applicable for HTTP APIs.

[IpAddressType](#state_ipaddresstype_csharp) string

The IP address types that can invoke the API. Valid values: `ipv4`, `dualstack`. Use `ipv4` to allow only IPv4 addresses to invoke your API, or use `dualstack` to allow both IPv4 and IPv6 addresses to invoke your API. Defaults to `ipv4`.

[Name](#state_name_csharp) string

Name of the API. Must be less than or equal to 128 characters in length.

[ProtocolType](#state_protocoltype_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

API protocol. Valid values: `HTTP`, `WEBSOCKET`.

[Region](#state_region_csharp) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[RouteKey](#state_routekey_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Part of *quick create*. Specifies any [route key](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-routes.html). Applicable for HTTP APIs.

[RouteSelectionExpression](#state_routeselectionexpression_csharp) string

The [route selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-route-selection-expressions) for the API. Defaults to `$request.method $request.path`.

[Tags](#state_tags_csharp) Dictionary<string, string>

Map of tags to assign to the API. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[TagsAll](#state_tagsall_csharp) Dictionary<string, string>

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[Target](#state_target_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Part of *quick create*. Quick create produces an API with an integration, a default catch-all route, and a default stage which is configured to automatically deploy changes. For HTTP integrations, specify a fully qualified URL. For Lambda integrations, specify a function ARN. The type of the integration will be `HTTP_PROXY` or `AWS_PROXY`, respectively. Applicable for HTTP APIs.

[Version](#state_version_csharp) string

Version identifier for the API. Must be between 1 and 64 characters in length.

[ApiEndpoint](#state_apiendpoint_go) string

URI of the API, of the form `https://{api-id}.execute-api.{region}.amazonaws.com` for HTTP APIs and `wss://{api-id}.execute-api.{region}.amazonaws.com` for WebSocket APIs.

[ApiKeySelectionExpression](#state_apikeyselectionexpression_go) string

An [API key selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-apikey-selection-expressions). Valid values: `$context.authorizer.usageIdentifierKey`, `$request.header.x-api-key`. Defaults to `$request.header.x-api-key`. Applicable for WebSocket APIs.

[Arn](#state_arn_go) string

ARN of the API.

[Body](#state_body_go) string

An OpenAPI specification that defines the set of routes and integrations to create as part of the HTTP APIs. Supported only for HTTP APIs.

[CorsConfiguration](#state_corsconfiguration_go) [ApiCorsConfigurationArgs](#apicorsconfiguration)

Cross-origin resource sharing (CORS) [configuration](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-cors.html). Applicable for HTTP APIs.

[CredentialsArn](#state_credentialsarn_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Part of *quick create*. Specifies any credentials required for the integration. Applicable for HTTP APIs.

[Description](#state_description_go) string

Description of the API. Must be less than or equal to 1024 characters in length.

[DisableExecuteApiEndpoint](#state_disableexecuteapiendpoint_go) bool

Whether clients can invoke the API by using the default `execute-api` endpoint. By default, clients can invoke the API with the default `{api_id}.execute-api.{region}.amazonaws.com endpoint`. To require that clients use a custom domain name to invoke the API, disable the default endpoint.

[ExecutionArn](#state_executionarn_go) string

ARN prefix to be used in an `aws.lambda.Permission`'s `sourceArn` attribute or in an `aws.iam.Policy` to authorize access to the [`@connections` API](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-how-to-call-websocket-api-connections.html). See the [Amazon API Gateway Developer Guide](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-control-access-iam.html) for details.

[FailOnWarnings](#state_failonwarnings_go) bool

Whether warnings should return an error while API Gateway is creating or updating the resource using an OpenAPI specification. Defaults to `false`. Applicable for HTTP APIs.

[IpAddressType](#state_ipaddresstype_go) string

The IP address types that can invoke the API. Valid values: `ipv4`, `dualstack`. Use `ipv4` to allow only IPv4 addresses to invoke your API, or use `dualstack` to allow both IPv4 and IPv6 addresses to invoke your API. Defaults to `ipv4`.

[Name](#state_name_go) string

Name of the API. Must be less than or equal to 128 characters in length.

[ProtocolType](#state_protocoltype_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

API protocol. Valid values: `HTTP`, `WEBSOCKET`.

[Region](#state_region_go) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[RouteKey](#state_routekey_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Part of *quick create*. Specifies any [route key](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-routes.html). Applicable for HTTP APIs.

[RouteSelectionExpression](#state_routeselectionexpression_go) string

The [route selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-route-selection-expressions) for the API. Defaults to `$request.method $request.path`.

[Tags](#state_tags_go) map\[string\]string

Map of tags to assign to the API. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[TagsAll](#state_tagsall_go) map\[string\]string

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[Target](#state_target_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Part of *quick create*. Quick create produces an API with an integration, a default catch-all route, and a default stage which is configured to automatically deploy changes. For HTTP integrations, specify a fully qualified URL. For Lambda integrations, specify a function ARN. The type of the integration will be `HTTP_PROXY` or `AWS_PROXY`, respectively. Applicable for HTTP APIs.

[Version](#state_version_go) string

Version identifier for the API. Must be between 1 and 64 characters in length.

[api\_endpoint](#state_api_endpoint_hcl) string

URI of the API, of the form `https://{api-id}.execute-api.{region}.amazonaws.com` for HTTP APIs and `wss://{api-id}.execute-api.{region}.amazonaws.com` for WebSocket APIs.

[api\_key\_selection\_expression](#state_api_key_selection_expression_hcl) string

An [API key selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-apikey-selection-expressions). Valid values: `$context.authorizer.usageIdentifierKey`, `$request.header.x-api-key`. Defaults to `$request.header.x-api-key`. Applicable for WebSocket APIs.

[arn](#state_arn_hcl) string

ARN of the API.

[body](#state_body_hcl) string

An OpenAPI specification that defines the set of routes and integrations to create as part of the HTTP APIs. Supported only for HTTP APIs.

[cors\_configuration](#state_cors_configuration_hcl) [object](#apicorsconfiguration)

Cross-origin resource sharing (CORS) [configuration](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-cors.html). Applicable for HTTP APIs.

[credentials\_arn](#state_credentials_arn_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Part of *quick create*. Specifies any credentials required for the integration. Applicable for HTTP APIs.

[description](#state_description_hcl) string

Description of the API. Must be less than or equal to 1024 characters in length.

[disable\_execute\_api\_endpoint](#state_disable_execute_api_endpoint_hcl) bool

Whether clients can invoke the API by using the default `execute-api` endpoint. By default, clients can invoke the API with the default `{api_id}.execute-api.{region}.amazonaws.com endpoint`. To require that clients use a custom domain name to invoke the API, disable the default endpoint.

[execution\_arn](#state_execution_arn_hcl) string

ARN prefix to be used in an `aws.lambda.Permission`'s `sourceArn` attribute or in an `aws.iam.Policy` to authorize access to the [`@connections` API](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-how-to-call-websocket-api-connections.html). See the [Amazon API Gateway Developer Guide](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-control-access-iam.html) for details.

[fail\_on\_warnings](#state_fail_on_warnings_hcl) bool

Whether warnings should return an error while API Gateway is creating or updating the resource using an OpenAPI specification. Defaults to `false`. Applicable for HTTP APIs.

[ip\_address\_type](#state_ip_address_type_hcl) string

The IP address types that can invoke the API. Valid values: `ipv4`, `dualstack`. Use `ipv4` to allow only IPv4 addresses to invoke your API, or use `dualstack` to allow both IPv4 and IPv6 addresses to invoke your API. Defaults to `ipv4`.

[name](#state_name_hcl) string

Name of the API. Must be less than or equal to 128 characters in length.

[protocol\_type](#state_protocol_type_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

API protocol. Valid values: `HTTP`, `WEBSOCKET`.

[region](#state_region_hcl) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[route\_key](#state_route_key_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Part of *quick create*. Specifies any [route key](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-routes.html). Applicable for HTTP APIs.

[route\_selection\_expression](#state_route_selection_expression_hcl) string

The [route selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-route-selection-expressions) for the API. Defaults to `$request.method $request.path`.

[tags](#state_tags_hcl) map(string)

Map of tags to assign to the API. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tags\_all](#state_tags_all_hcl) map(string)

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[target](#state_target_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Part of *quick create*. Quick create produces an API with an integration, a default catch-all route, and a default stage which is configured to automatically deploy changes. For HTTP integrations, specify a fully qualified URL. For Lambda integrations, specify a function ARN. The type of the integration will be `HTTP_PROXY` or `AWS_PROXY`, respectively. Applicable for HTTP APIs.

[version](#state_version_hcl) string

Version identifier for the API. Must be between 1 and 64 characters in length.

[apiEndpoint](#state_apiendpoint_java) String

URI of the API, of the form `https://{api-id}.execute-api.{region}.amazonaws.com` for HTTP APIs and `wss://{api-id}.execute-api.{region}.amazonaws.com` for WebSocket APIs.

[apiKeySelectionExpression](#state_apikeyselectionexpression_java) String

An [API key selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-apikey-selection-expressions). Valid values: `$context.authorizer.usageIdentifierKey`, `$request.header.x-api-key`. Defaults to `$request.header.x-api-key`. Applicable for WebSocket APIs.

[arn](#state_arn_java) String

ARN of the API.

[body](#state_body_java) String

An OpenAPI specification that defines the set of routes and integrations to create as part of the HTTP APIs. Supported only for HTTP APIs.

[corsConfiguration](#state_corsconfiguration_java) [ApiCorsConfiguration](#apicorsconfiguration)

Cross-origin resource sharing (CORS) [configuration](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-cors.html). Applicable for HTTP APIs.

[credentialsArn](#state_credentialsarn_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Part of *quick create*. Specifies any credentials required for the integration. Applicable for HTTP APIs.

[description](#state_description_java) String

Description of the API. Must be less than or equal to 1024 characters in length.

[disableExecuteApiEndpoint](#state_disableexecuteapiendpoint_java) Boolean

Whether clients can invoke the API by using the default `execute-api` endpoint. By default, clients can invoke the API with the default `{api_id}.execute-api.{region}.amazonaws.com endpoint`. To require that clients use a custom domain name to invoke the API, disable the default endpoint.

[executionArn](#state_executionarn_java) String

ARN prefix to be used in an `aws.lambda.Permission`'s `sourceArn` attribute or in an `aws.iam.Policy` to authorize access to the [`@connections` API](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-how-to-call-websocket-api-connections.html). See the [Amazon API Gateway Developer Guide](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-control-access-iam.html) for details.

[failOnWarnings](#state_failonwarnings_java) Boolean

Whether warnings should return an error while API Gateway is creating or updating the resource using an OpenAPI specification. Defaults to `false`. Applicable for HTTP APIs.

[ipAddressType](#state_ipaddresstype_java) String

The IP address types that can invoke the API. Valid values: `ipv4`, `dualstack`. Use `ipv4` to allow only IPv4 addresses to invoke your API, or use `dualstack` to allow both IPv4 and IPv6 addresses to invoke your API. Defaults to `ipv4`.

[name](#state_name_java) String

Name of the API. Must be less than or equal to 128 characters in length.

[protocolType](#state_protocoltype_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

API protocol. Valid values: `HTTP`, `WEBSOCKET`.

[region](#state_region_java) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[routeKey](#state_routekey_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Part of *quick create*. Specifies any [route key](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-routes.html). Applicable for HTTP APIs.

[routeSelectionExpression](#state_routeselectionexpression_java) String

The [route selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-route-selection-expressions) for the API. Defaults to `$request.method $request.path`.

[tags](#state_tags_java) Map<String,String>

Map of tags to assign to the API. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tagsAll](#state_tagsall_java) Map<String,String>

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[target](#state_target_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Part of *quick create*. Quick create produces an API with an integration, a default catch-all route, and a default stage which is configured to automatically deploy changes. For HTTP integrations, specify a fully qualified URL. For Lambda integrations, specify a function ARN. The type of the integration will be `HTTP_PROXY` or `AWS_PROXY`, respectively. Applicable for HTTP APIs.

[version](#state_version_java) String

Version identifier for the API. Must be between 1 and 64 characters in length.

[apiEndpoint](#state_apiendpoint_nodejs) string

URI of the API, of the form `https://{api-id}.execute-api.{region}.amazonaws.com` for HTTP APIs and `wss://{api-id}.execute-api.{region}.amazonaws.com` for WebSocket APIs.

[apiKeySelectionExpression](#state_apikeyselectionexpression_nodejs) string

An [API key selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-apikey-selection-expressions). Valid values: `$context.authorizer.usageIdentifierKey`, `$request.header.x-api-key`. Defaults to `$request.header.x-api-key`. Applicable for WebSocket APIs.

[arn](#state_arn_nodejs) string

ARN of the API.

[body](#state_body_nodejs) string

An OpenAPI specification that defines the set of routes and integrations to create as part of the HTTP APIs. Supported only for HTTP APIs.

[corsConfiguration](#state_corsconfiguration_nodejs) [ApiCorsConfiguration](#apicorsconfiguration)

Cross-origin resource sharing (CORS) [configuration](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-cors.html). Applicable for HTTP APIs.

[credentialsArn](#state_credentialsarn_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Part of *quick create*. Specifies any credentials required for the integration. Applicable for HTTP APIs.

[description](#state_description_nodejs) string

Description of the API. Must be less than or equal to 1024 characters in length.

[disableExecuteApiEndpoint](#state_disableexecuteapiendpoint_nodejs) boolean

Whether clients can invoke the API by using the default `execute-api` endpoint. By default, clients can invoke the API with the default `{api_id}.execute-api.{region}.amazonaws.com endpoint`. To require that clients use a custom domain name to invoke the API, disable the default endpoint.

[executionArn](#state_executionarn_nodejs) string

ARN prefix to be used in an `aws.lambda.Permission`'s `sourceArn` attribute or in an `aws.iam.Policy` to authorize access to the [`@connections` API](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-how-to-call-websocket-api-connections.html). See the [Amazon API Gateway Developer Guide](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-control-access-iam.html) for details.

[failOnWarnings](#state_failonwarnings_nodejs) boolean

Whether warnings should return an error while API Gateway is creating or updating the resource using an OpenAPI specification. Defaults to `false`. Applicable for HTTP APIs.

[ipAddressType](#state_ipaddresstype_nodejs) string

The IP address types that can invoke the API. Valid values: `ipv4`, `dualstack`. Use `ipv4` to allow only IPv4 addresses to invoke your API, or use `dualstack` to allow both IPv4 and IPv6 addresses to invoke your API. Defaults to `ipv4`.

[name](#state_name_nodejs) string

Name of the API. Must be less than or equal to 128 characters in length.

[protocolType](#state_protocoltype_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

API protocol. Valid values: `HTTP`, `WEBSOCKET`.

[region](#state_region_nodejs) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[routeKey](#state_routekey_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Part of *quick create*. Specifies any [route key](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-routes.html). Applicable for HTTP APIs.

[routeSelectionExpression](#state_routeselectionexpression_nodejs) string

The [route selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-route-selection-expressions) for the API. Defaults to `$request.method $request.path`.

[tags](#state_tags_nodejs) {\[key: string\]: string}

Map of tags to assign to the API. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tagsAll](#state_tagsall_nodejs) {\[key: string\]: string}

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[target](#state_target_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Part of *quick create*. Quick create produces an API with an integration, a default catch-all route, and a default stage which is configured to automatically deploy changes. For HTTP integrations, specify a fully qualified URL. For Lambda integrations, specify a function ARN. The type of the integration will be `HTTP_PROXY` or `AWS_PROXY`, respectively. Applicable for HTTP APIs.

[version](#state_version_nodejs) string

Version identifier for the API. Must be between 1 and 64 characters in length.

[api\_endpoint](#state_api_endpoint_python) str

URI of the API, of the form `https://{api-id}.execute-api.{region}.amazonaws.com` for HTTP APIs and `wss://{api-id}.execute-api.{region}.amazonaws.com` for WebSocket APIs.

[api\_key\_selection\_expression](#state_api_key_selection_expression_python) str

An [API key selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-apikey-selection-expressions). Valid values: `$context.authorizer.usageIdentifierKey`, `$request.header.x-api-key`. Defaults to `$request.header.x-api-key`. Applicable for WebSocket APIs.

[arn](#state_arn_python) str

ARN of the API.

[body](#state_body_python) str

An OpenAPI specification that defines the set of routes and integrations to create as part of the HTTP APIs. Supported only for HTTP APIs.

[cors\_configuration](#state_cors_configuration_python) [ApiCorsConfigurationArgs](#apicorsconfiguration)

Cross-origin resource sharing (CORS) [configuration](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-cors.html). Applicable for HTTP APIs.

[credentials\_arn](#state_credentials_arn_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Part of *quick create*. Specifies any credentials required for the integration. Applicable for HTTP APIs.

[description](#state_description_python) str

Description of the API. Must be less than or equal to 1024 characters in length.

[disable\_execute\_api\_endpoint](#state_disable_execute_api_endpoint_python) bool

Whether clients can invoke the API by using the default `execute-api` endpoint. By default, clients can invoke the API with the default `{api_id}.execute-api.{region}.amazonaws.com endpoint`. To require that clients use a custom domain name to invoke the API, disable the default endpoint.

[execution\_arn](#state_execution_arn_python) str

ARN prefix to be used in an `aws.lambda.Permission`'s `sourceArn` attribute or in an `aws.iam.Policy` to authorize access to the [`@connections` API](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-how-to-call-websocket-api-connections.html). See the [Amazon API Gateway Developer Guide](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-control-access-iam.html) for details.

[fail\_on\_warnings](#state_fail_on_warnings_python) bool

Whether warnings should return an error while API Gateway is creating or updating the resource using an OpenAPI specification. Defaults to `false`. Applicable for HTTP APIs.

[ip\_address\_type](#state_ip_address_type_python) str

The IP address types that can invoke the API. Valid values: `ipv4`, `dualstack`. Use `ipv4` to allow only IPv4 addresses to invoke your API, or use `dualstack` to allow both IPv4 and IPv6 addresses to invoke your API. Defaults to `ipv4`.

[name](#state_name_python) str

Name of the API. Must be less than or equal to 128 characters in length.

[protocol\_type](#state_protocol_type_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

API protocol. Valid values: `HTTP`, `WEBSOCKET`.

[region](#state_region_python) str

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[route\_key](#state_route_key_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Part of *quick create*. Specifies any [route key](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-routes.html). Applicable for HTTP APIs.

[route\_selection\_expression](#state_route_selection_expression_python) str

The [route selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-route-selection-expressions) for the API. Defaults to `$request.method $request.path`.

[tags](#state_tags_python) Mapping\[str, str\]

Map of tags to assign to the API. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tags\_all](#state_tags_all_python) Mapping\[str, str\]

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[target](#state_target_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Part of *quick create*. Quick create produces an API with an integration, a default catch-all route, and a default stage which is configured to automatically deploy changes. For HTTP integrations, specify a fully qualified URL. For Lambda integrations, specify a function ARN. The type of the integration will be `HTTP_PROXY` or `AWS_PROXY`, respectively. Applicable for HTTP APIs.

[version](#state_version_python) str

Version identifier for the API. Must be between 1 and 64 characters in length.

[apiEndpoint](#state_apiendpoint_yaml) String

URI of the API, of the form `https://{api-id}.execute-api.{region}.amazonaws.com` for HTTP APIs and `wss://{api-id}.execute-api.{region}.amazonaws.com` for WebSocket APIs.

[apiKeySelectionExpression](#state_apikeyselectionexpression_yaml) String

An [API key selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-apikey-selection-expressions). Valid values: `$context.authorizer.usageIdentifierKey`, `$request.header.x-api-key`. Defaults to `$request.header.x-api-key`. Applicable for WebSocket APIs.

[arn](#state_arn_yaml) String

ARN of the API.

[body](#state_body_yaml) String

An OpenAPI specification that defines the set of routes and integrations to create as part of the HTTP APIs. Supported only for HTTP APIs.

[corsConfiguration](#state_corsconfiguration_yaml) [Property Map](#apicorsconfiguration)

Cross-origin resource sharing (CORS) [configuration](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-cors.html). Applicable for HTTP APIs.

[credentialsArn](#state_credentialsarn_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Part of *quick create*. Specifies any credentials required for the integration. Applicable for HTTP APIs.

[description](#state_description_yaml) String

Description of the API. Must be less than or equal to 1024 characters in length.

[disableExecuteApiEndpoint](#state_disableexecuteapiendpoint_yaml) Boolean

Whether clients can invoke the API by using the default `execute-api` endpoint. By default, clients can invoke the API with the default `{api_id}.execute-api.{region}.amazonaws.com endpoint`. To require that clients use a custom domain name to invoke the API, disable the default endpoint.

[executionArn](#state_executionarn_yaml) String

ARN prefix to be used in an `aws.lambda.Permission`'s `sourceArn` attribute or in an `aws.iam.Policy` to authorize access to the [`@connections` API](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-how-to-call-websocket-api-connections.html). See the [Amazon API Gateway Developer Guide](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-control-access-iam.html) for details.

[failOnWarnings](#state_failonwarnings_yaml) Boolean

Whether warnings should return an error while API Gateway is creating or updating the resource using an OpenAPI specification. Defaults to `false`. Applicable for HTTP APIs.

[ipAddressType](#state_ipaddresstype_yaml) String

The IP address types that can invoke the API. Valid values: `ipv4`, `dualstack`. Use `ipv4` to allow only IPv4 addresses to invoke your API, or use `dualstack` to allow both IPv4 and IPv6 addresses to invoke your API. Defaults to `ipv4`.

[name](#state_name_yaml) String

Name of the API. Must be less than or equal to 128 characters in length.

[protocolType](#state_protocoltype_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

API protocol. Valid values: `HTTP`, `WEBSOCKET`.

[region](#state_region_yaml) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[routeKey](#state_routekey_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Part of *quick create*. Specifies any [route key](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-routes.html). Applicable for HTTP APIs.

[routeSelectionExpression](#state_routeselectionexpression_yaml) String

The [route selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-route-selection-expressions) for the API. Defaults to `$request.method $request.path`.

[tags](#state_tags_yaml) Map<String>

Map of tags to assign to the API. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tagsAll](#state_tagsall_yaml) Map<String>

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[target](#state_target_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Part of *quick create*. Quick create produces an API with an integration, a default catch-all route, and a default stage which is configured to automatically deploy changes. For HTTP integrations, specify a fully qualified URL. For Lambda integrations, specify a function ARN. The type of the integration will be `HTTP_PROXY` or `AWS_PROXY`, respectively. Applicable for HTTP APIs.

[version](#state_version_yaml) String

Version identifier for the API. Must be between 1 and 64 characters in length.

## Supporting Types[](#supporting-types)

#### ApiCorsConfiguration

, ApiCorsConfigurationArgs

[](#apicorsconfiguration)

[AllowCredentials](#allowcredentials_csharp) bool

Whether credentials are included in the CORS request.

[AllowHeaders](#allowheaders_csharp) List<string>

Set of allowed HTTP headers.

[AllowMethods](#allowmethods_csharp) List<string>

Set of allowed HTTP methods.

[AllowOrigins](#alloworigins_csharp) List<string>

Set of allowed origins.

[ExposeHeaders](#exposeheaders_csharp) List<string>

Set of exposed HTTP headers.

[MaxAge](#maxage_csharp) int

Number of seconds that the browser should cache preflight request results.

[AllowCredentials](#allowcredentials_go) bool

Whether credentials are included in the CORS request.

[AllowHeaders](#allowheaders_go) \[\]string

Set of allowed HTTP headers.

[AllowMethods](#allowmethods_go) \[\]string

Set of allowed HTTP methods.

[AllowOrigins](#alloworigins_go) \[\]string

Set of allowed origins.

[ExposeHeaders](#exposeheaders_go) \[\]string

Set of exposed HTTP headers.

[MaxAge](#maxage_go) int

Number of seconds that the browser should cache preflight request results.

[allow\_credentials](#allow_credentials_hcl) bool

Whether credentials are included in the CORS request.

[allow\_headers](#allow_headers_hcl) list(string)

Set of allowed HTTP headers.

[allow\_methods](#allow_methods_hcl) list(string)

Set of allowed HTTP methods.

[allow\_origins](#allow_origins_hcl) list(string)

Set of allowed origins.

[expose\_headers](#expose_headers_hcl) list(string)

Set of exposed HTTP headers.

[max\_age](#max_age_hcl) number

Number of seconds that the browser should cache preflight request results.

[allowCredentials](#allowcredentials_java) Boolean

Whether credentials are included in the CORS request.

[allowHeaders](#allowheaders_java) List<String>

Set of allowed HTTP headers.

[allowMethods](#allowmethods_java) List<String>

Set of allowed HTTP methods.

[allowOrigins](#alloworigins_java) List<String>

Set of allowed origins.

[exposeHeaders](#exposeheaders_java) List<String>

Set of exposed HTTP headers.

[maxAge](#maxage_java) Integer

Number of seconds that the browser should cache preflight request results.

[allowCredentials](#allowcredentials_nodejs) boolean

Whether credentials are included in the CORS request.

[allowHeaders](#allowheaders_nodejs) string\[\]

Set of allowed HTTP headers.

[allowMethods](#allowmethods_nodejs) string\[\]

Set of allowed HTTP methods.

[allowOrigins](#alloworigins_nodejs) string\[\]

Set of allowed origins.

[exposeHeaders](#exposeheaders_nodejs) string\[\]

Set of exposed HTTP headers.

[maxAge](#maxage_nodejs) number

Number of seconds that the browser should cache preflight request results.

[allow\_credentials](#allow_credentials_python) bool

Whether credentials are included in the CORS request.

[allow\_headers](#allow_headers_python) Sequence\[str\]

Set of allowed HTTP headers.

[allow\_methods](#allow_methods_python) Sequence\[str\]

Set of allowed HTTP methods.

[allow\_origins](#allow_origins_python) Sequence\[str\]

Set of allowed origins.

[expose\_headers](#expose_headers_python) Sequence\[str\]

Set of exposed HTTP headers.

[max\_age](#max_age_python) int

Number of seconds that the browser should cache preflight request results.

[allowCredentials](#allowcredentials_yaml) Boolean

Whether credentials are included in the CORS request.

[allowHeaders](#allowheaders_yaml) List<String>

Set of allowed HTTP headers.

[allowMethods](#allowmethods_yaml) List<String>

Set of allowed HTTP methods.

[allowOrigins](#alloworigins_yaml) List<String>

Set of allowed origins.

[exposeHeaders](#exposeheaders_yaml) List<String>

Set of exposed HTTP headers.

[maxAge](#maxage_yaml) Number

Number of seconds that the browser should cache preflight request results.

## Import[](#import)

### Identity Schema[](#identity-schema)

#### Required[](#required)

-   `id` (String) API identifier.

#### Optional[](#optional)

-   `accountId` (String) AWS Account where this resource is managed.
-   `region` (String) Region where this resource is managed.

Using `pulumi import`, import `aws.apigatewayv2.Api` using the API identifier. For example:

```bash
$ pulumi import aws:apigatewayv2/api:Api example aabbccddee
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

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2fapigatewayv2%2fapi]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2fapigatewayv2%2fapi%2f\))

#### Try Pulumi Cloud free.
Your team will thank you.

[Start free trial](https://app.pulumi.com/signup?utm_source=registry&utm_medium=right-rail-banner&utm_campaign=try-pulumi-cloud&iaid=docs-try-pulumi-cloud-ad)
