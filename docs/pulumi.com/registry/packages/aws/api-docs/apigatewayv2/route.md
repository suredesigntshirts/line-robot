---
Source: https://www.pulumi.com/registry/packages/aws/api-docs/apigatewayv2/route/
Generated: 2026-06-06
Updated: 2026-06-06
---

# aws.apigatewayv2.Route

1.  [Packages](/registry/)
2.  [Packages](/registry/packages/)
3.  [AWS](/registry/packages/aws/)
4.  [API Docs](/registry/packages/aws/api-docs/)
5.  [apigatewayv2](/registry/packages/aws/api-docs/apigatewayv2/)
6.  [Route](/registry/packages/aws/api-docs/apigatewayv2/route/)

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

Viewing docs for AWS v7.32.0
published on Friday, May 29, 2026 by Pulumi

[Schema (JSON)](/registry/packages/aws/schema.json)

[pulumi/pulumi-aws](https://github.com/pulumi/pulumi-aws)

v7.32.0 (7.x, latest)v6.83.1 (6.x)v5.43.0 (5.x)

# aws.apigatewayv2.Route

Explore with Neo

-   Copy Page

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2fapigatewayv2%2froute]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2fapigatewayv2%2froute%2f\))

Manages an Amazon API Gateway Version 2 route. More information can be found in the [Amazon API Gateway Developer Guide](https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html) for [WebSocket](https://docs.aws.amazon.com/apigateway/latest/developerguide/websocket-api-develop-routes.html) and [HTTP](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-routes.html) APIs.

## Example Usage

### Basic

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
const exampleRoute = new aws.apigatewayv2.Route("example", {
    apiId: example.id,
    routeKey: "$default",
});
```

```python
import pulumi
import pulumi_aws as aws

example = aws.apigatewayv2.Api("example",
    name="example-websocket-api",
    protocol_type="WEBSOCKET",
    route_selection_expression="$request.body.action")
example_route = aws.apigatewayv2.Route("example",
    api_id=example.id,
    route_key="$default")
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/apigatewayv2"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		example, err := apigatewayv2.NewApi(ctx, "example", &apigatewayv2.ApiArgs{
			Name:                     pulumi.String("example-websocket-api"),
			ProtocolType:             pulumi.String("WEBSOCKET"),
			RouteSelectionExpression: pulumi.String("$request.body.action"),
		})
		if err != nil {
			return err
		}
		_, err = apigatewayv2.NewRoute(ctx, "example", &apigatewayv2.RouteArgs{
			ApiId:    example.ID(),
			RouteKey: pulumi.String("$default"),
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

    var exampleRoute = new Aws.ApiGatewayV2.Route("example", new()
    {
        ApiId = example.Id,
        RouteKey = "$default",
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
import com.pulumi.aws.apigatewayv2.Route;
import com.pulumi.aws.apigatewayv2.RouteArgs;
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

        var exampleRoute = new Route("exampleRoute", RouteArgs.builder()
            .apiId(example.id())
            .routeKey("$default")
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
  exampleRoute:
    type: aws:apigatewayv2:Route
    name: example
    properties:
      apiId: ${example.id}
      routeKey: $default
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
resource "aws_apigatewayv2_route" "example" {
  api_id    = aws_apigatewayv2_api.example.id
  route_key = "$default"
}
```

### HTTP Proxy Integration

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
const exampleIntegration = new aws.apigatewayv2.Integration("example", {
    apiId: example.id,
    integrationType: "HTTP_PROXY",
    integrationMethod: "ANY",
    integrationUri: "https://example.com/{proxy}",
});
const exampleRoute = new aws.apigatewayv2.Route("example", {
    apiId: example.id,
    routeKey: "ANY /example/{proxy+}",
    target: pulumi.interpolate`integrations/${exampleIntegration.id}`,
});
```

```python
import pulumi
import pulumi_aws as aws

example = aws.apigatewayv2.Api("example",
    name="example-http-api",
    protocol_type="HTTP")
example_integration = aws.apigatewayv2.Integration("example",
    api_id=example.id,
    integration_type="HTTP_PROXY",
    integration_method="ANY",
    integration_uri="https://example.com/{proxy}")
example_route = aws.apigatewayv2.Route("example",
    api_id=example.id,
    route_key="ANY /example/{proxy+}",
    target=example_integration.id.apply(lambda id: f"integrations/{id}"))
```

```go
package main

import (
	"fmt"

	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/apigatewayv2"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		example, err := apigatewayv2.NewApi(ctx, "example", &apigatewayv2.ApiArgs{
			Name:         pulumi.String("example-http-api"),
			ProtocolType: pulumi.String("HTTP"),
		})
		if err != nil {
			return err
		}
		exampleIntegration, err := apigatewayv2.NewIntegration(ctx, "example", &apigatewayv2.IntegrationArgs{
			ApiId:             example.ID(),
			IntegrationType:   pulumi.String("HTTP_PROXY"),
			IntegrationMethod: pulumi.String("ANY"),
			IntegrationUri:    pulumi.String("https://example.com/{proxy}"),
		})
		if err != nil {
			return err
		}
		_, err = apigatewayv2.NewRoute(ctx, "example", &apigatewayv2.RouteArgs{
			ApiId:    example.ID(),
			RouteKey: pulumi.String("ANY /example/{proxy+}"),
			Target: exampleIntegration.ID().ApplyT(func(id string) (string, error) {
				return fmt.Sprintf("integrations/%v", id), nil
			}).(pulumi.StringOutput),
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

    var exampleIntegration = new Aws.ApiGatewayV2.Integration("example", new()
    {
        ApiId = example.Id,
        IntegrationType = "HTTP_PROXY",
        IntegrationMethod = "ANY",
        IntegrationUri = "https://example.com/{proxy}",
    });

    var exampleRoute = new Aws.ApiGatewayV2.Route("example", new()
    {
        ApiId = example.Id,
        RouteKey = "ANY /example/{proxy+}",
        Target = exampleIntegration.Id.Apply(id => $"integrations/{id}"),
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
import com.pulumi.aws.apigatewayv2.Integration;
import com.pulumi.aws.apigatewayv2.IntegrationArgs;
import com.pulumi.aws.apigatewayv2.Route;
import com.pulumi.aws.apigatewayv2.RouteArgs;
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

        var exampleIntegration = new Integration("exampleIntegration", IntegrationArgs.builder()
            .apiId(example.id())
            .integrationType("HTTP_PROXY")
            .integrationMethod("ANY")
            .integrationUri("https://example.com/{proxy}")
            .build());

        var exampleRoute = new Route("exampleRoute", RouteArgs.builder()
            .apiId(example.id())
            .routeKey("ANY /example/{proxy+}")
            .target(exampleIntegration.id().applyValue(_id -> String.format("integrations/%s", _id)))
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
  exampleIntegration:
    type: aws:apigatewayv2:Integration
    name: example
    properties:
      apiId: ${example.id}
      integrationType: HTTP_PROXY
      integrationMethod: ANY
      integrationUri: https://example.com/{proxy}
  exampleRoute:
    type: aws:apigatewayv2:Route
    name: example
    properties:
      apiId: ${example.id}
      routeKey: ANY /example/{proxy+}
      target: integrations/${exampleIntegration.id}
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
resource "aws_apigatewayv2_integration" "example" {
  api_id             = aws_apigatewayv2_api.example.id
  integration_type   = "HTTP_PROXY"
  integration_method = "ANY"
  integration_uri    = "https://example.com/{proxy}"
}
resource "aws_apigatewayv2_route" "example" {
  api_id    = aws_apigatewayv2_api.example.id
  route_key = "ANY /example/{proxy+}"
  target    ="integrations/${aws_apigatewayv2_integration.example.id}"
}
```

## Create Route Resource

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
new Route(name: string, args: RouteArgs, opts?: CustomResourceOptions);
```

```python
@overload
def Route(resource_name: str,
          args: RouteArgs,
          opts: Optional[ResourceOptions] = None)

@overload
def Route(resource_name: str,
          opts: Optional[ResourceOptions] = None,
          api_id: Optional[str] = None,
          route_key: Optional[str] = None,
          operation_name: Optional[str] = None,
          authorization_type: Optional[str] = None,
          authorizer_id: Optional[str] = None,
          model_selection_expression: Optional[str] = None,
          authorization_scopes: Optional[Sequence[str]] = None,
          region: Optional[str] = None,
          request_models: Optional[Mapping[str, str]] = None,
          request_parameters: Optional[Sequence[RouteRequestParameterArgs]] = None,
          api_key_required: Optional[bool] = None,
          route_response_selection_expression: Optional[str] = None,
          target: Optional[str] = None)
```

```go
func NewRoute(ctx *Context, name string, args RouteArgs, opts ...ResourceOption) (*Route, error)
```

```csharp
public Route(string name, RouteArgs args, CustomResourceOptions? opts = null)
```

```java
public Route(String name, RouteArgs args)
public Route(String name, RouteArgs args, CustomResourceOptions options)
```

```yaml
type: aws:apigatewayv2:Route
properties: # The arguments to resource properties.
options: # Bag of options to control resource's behavior.
```

```hcl
resource "aws_apigatewayv2_route" "name" {
    # resource properties
}
```

#### Parameters

name This property is required. string

The unique name of the resource.

args This property is required. [RouteArgs](#inputs)

The arguments to resource properties.

opts [CustomResourceOptions](/docs/reference/pkg/nodejs/pulumi/pulumi/#CustomResourceOptions)

Bag of options to control resource's behavior.

resource\_name This property is required. str

The unique name of the resource.

args This property is required. [RouteArgs](#inputs)

The arguments to resource properties.

opts [ResourceOptions](/docs/reference/pkg/python/pulumi/#pulumi.ResourceOptions)

Bag of options to control resource's behavior.

ctx [Context](https://pkg.go.dev/github.com/pulumi/pulumi/sdk/v3/go/pulumi?tab=doc#Context)

Context object for the current deployment.

name This property is required. string

The unique name of the resource.

args This property is required. [RouteArgs](#inputs)

The arguments to resource properties.

opts [ResourceOption](https://pkg.go.dev/github.com/pulumi/pulumi/sdk/v3/go/pulumi?tab=doc#ResourceOption)

Bag of options to control resource's behavior.

name This property is required. string

The unique name of the resource.

args This property is required. [RouteArgs](#inputs)

The arguments to resource properties.

opts [CustomResourceOptions](/docs/reference/pkg/dotnet/Pulumi/Pulumi.CustomResourceOptions.html)

Bag of options to control resource's behavior.

name This property is required. String

The unique name of the resource.

args This property is required. [RouteArgs](#inputs)

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
var routeResource = new Aws.ApiGatewayV2.Route("routeResource", new()
{
    ApiId = "string",
    RouteKey = "string",
    OperationName = "string",
    AuthorizationType = "string",
    AuthorizerId = "string",
    ModelSelectionExpression = "string",
    AuthorizationScopes = new[]
    {
        "string",
    },
    Region = "string",
    RequestModels =
    {
        { "string", "string" },
    },
    RequestParameters = new[]
    {
        new Aws.ApiGatewayV2.Inputs.RouteRequestParameterArgs
        {
            RequestParameterKey = "string",
            Required = false,
        },
    },
    ApiKeyRequired = false,
    RouteResponseSelectionExpression = "string",
    Target = "string",
});
```

```go
example, err := apigatewayv2.NewRoute(ctx, "routeResource", &apigatewayv2.RouteArgs{
	ApiId:                    pulumi.String("string"),
	RouteKey:                 pulumi.String("string"),
	OperationName:            pulumi.String("string"),
	AuthorizationType:        pulumi.String("string"),
	AuthorizerId:             pulumi.String("string"),
	ModelSelectionExpression: pulumi.String("string"),
	AuthorizationScopes: pulumi.StringArray{
		pulumi.String("string"),
	},
	Region: pulumi.String("string"),
	RequestModels: pulumi.StringMap{
		"string": pulumi.String("string"),
	},
	RequestParameters: apigatewayv2.RouteRequestParameterArray{
		&apigatewayv2.RouteRequestParameterArgs{
			RequestParameterKey: pulumi.String("string"),
			Required:            pulumi.Bool(false),
		},
	},
	ApiKeyRequired:                   pulumi.Bool(false),
	RouteResponseSelectionExpression: pulumi.String("string"),
	Target:                           pulumi.String("string"),
})
```

```hcl
resource "aws_apigatewayv2_route" "routeResource" {
  api_id                     = "string"
  route_key                  = "string"
  operation_name             = "string"
  authorization_type         = "string"
  authorizer_id              = "string"
  model_selection_expression = "string"
  authorization_scopes       = ["string"]
  region                     = "string"
  request_models = {
    "string" = "string"
  }
  request_parameters {
    request_parameter_key = "string"
    required              = false
  }
  api_key_required                    = false
  route_response_selection_expression = "string"
  target                              = "string"
}
```

```java
var routeResource = new com.pulumi.aws.apigatewayv2.Route("routeResource", com.pulumi.aws.apigatewayv2.RouteArgs.builder()
    .apiId("string")
    .routeKey("string")
    .operationName("string")
    .authorizationType("string")
    .authorizerId("string")
    .modelSelectionExpression("string")
    .authorizationScopes("string")
    .region("string")
    .requestModels(Map.of("string", "string"))
    .requestParameters(RouteRequestParameterArgs.builder()
        .requestParameterKey("string")
        .required(false)
        .build())
    .apiKeyRequired(false)
    .routeResponseSelectionExpression("string")
    .target("string")
    .build());
```

```python
route_resource = aws.apigatewayv2.Route("routeResource",
    api_id="string",
    route_key="string",
    operation_name="string",
    authorization_type="string",
    authorizer_id="string",
    model_selection_expression="string",
    authorization_scopes=["string"],
    region="string",
    request_models={
        "string": "string",
    },
    request_parameters=[{
        "request_parameter_key": "string",
        "required": False,
    }],
    api_key_required=False,
    route_response_selection_expression="string",
    target="string")
```

```typescript
const routeResource = new aws.apigatewayv2.Route("routeResource", {
    apiId: "string",
    routeKey: "string",
    operationName: "string",
    authorizationType: "string",
    authorizerId: "string",
    modelSelectionExpression: "string",
    authorizationScopes: ["string"],
    region: "string",
    requestModels: {
        string: "string",
    },
    requestParameters: [{
        requestParameterKey: "string",
        required: false,
    }],
    apiKeyRequired: false,
    routeResponseSelectionExpression: "string",
    target: "string",
});
```

```yaml
type: aws:apigatewayv2:Route
properties:
    apiId: string
    apiKeyRequired: false
    authorizationScopes:
        - string
    authorizationType: string
    authorizerId: string
    modelSelectionExpression: string
    operationName: string
    region: string
    requestModels:
        string: string
    requestParameters:
        - requestParameterKey: string
          required: false
    routeKey: string
    routeResponseSelectionExpression: string
    target: string
```

## Route Resource Properties

To learn more about resource properties and how to use them, see [Inputs and Outputs](/docs/intro/concepts/inputs-outputs) in the Architecture and Concepts docs.

### Inputs

In Python, inputs that are objects can be passed either as [argument classes or as dictionary literals](/docs/languages-sdks/python/#inputs-and-outputs).

The Route resource accepts the following [input](/docs/intro/concepts/inputs-outputs) properties:

[ApiId](#apiid_csharp)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

API identifier.

[RouteKey](#routekey_csharp) This property is required. string

Route key for the route. For HTTP APIs, the route key can be either `$default`, or a combination of an HTTP method and resource path, for example, `GET /pets`.

[ApiKeyRequired](#apikeyrequired_csharp) bool

Boolean whether an API key is required for the route. Defaults to `false`. Supported only for WebSocket APIs.

[AuthorizationScopes](#authorizationscopes_csharp) List<string>

Authorization scopes supported by this route. The scopes are used with a JWT authorizer to authorize the method invocation.

[AuthorizationType](#authorizationtype_csharp) string

Authorization type for the route. For WebSocket APIs, valid values are `NONE` for open access, `AWS_IAM` for using AWS IAM permissions, and `CUSTOM` for using a Lambda authorizer. For HTTP APIs, valid values are `NONE` for open access, `JWT` for using JSON Web Tokens, `AWS_IAM` for using AWS IAM permissions, and `CUSTOM` for using a Lambda authorizer. Defaults to `NONE`.

[AuthorizerId](#authorizerid_csharp) string

Identifier of the `aws.apigatewayv2.Authorizer` resource to be associated with this route.

[ModelSelectionExpression](#modelselectionexpression_csharp) string

The [model selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-model-selection-expressions) for the route. Supported only for WebSocket APIs.

[OperationName](#operationname_csharp) string

Operation name for the route. Must be between 1 and 64 characters in length.

[Region](#region_csharp) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[RequestModels](#requestmodels_csharp) Dictionary<string, string>

Request models for the route. Supported only for WebSocket APIs.

[RequestParameters](#requestparameters_csharp) [List<RouteRequestParameter>](#routerequestparameter)

Request parameters for the route. Supported only for WebSocket APIs.

[RouteResponseSelectionExpression](#routeresponseselectionexpression_csharp) string

The [route response selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-route-response-selection-expressions) for the route. Supported only for WebSocket APIs.

[Target](#target_csharp) string

Target for the route, of the form `integrations/`*`IntegrationID`*, where *`IntegrationID`* is the identifier of an `aws.apigatewayv2.Integration` resource.

[ApiId](#apiid_go)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

API identifier.

[RouteKey](#routekey_go) This property is required. string

Route key for the route. For HTTP APIs, the route key can be either `$default`, or a combination of an HTTP method and resource path, for example, `GET /pets`.

[ApiKeyRequired](#apikeyrequired_go) bool

Boolean whether an API key is required for the route. Defaults to `false`. Supported only for WebSocket APIs.

[AuthorizationScopes](#authorizationscopes_go) \[\]string

Authorization scopes supported by this route. The scopes are used with a JWT authorizer to authorize the method invocation.

[AuthorizationType](#authorizationtype_go) string

Authorization type for the route. For WebSocket APIs, valid values are `NONE` for open access, `AWS_IAM` for using AWS IAM permissions, and `CUSTOM` for using a Lambda authorizer. For HTTP APIs, valid values are `NONE` for open access, `JWT` for using JSON Web Tokens, `AWS_IAM` for using AWS IAM permissions, and `CUSTOM` for using a Lambda authorizer. Defaults to `NONE`.

[AuthorizerId](#authorizerid_go) string

Identifier of the `aws.apigatewayv2.Authorizer` resource to be associated with this route.

[ModelSelectionExpression](#modelselectionexpression_go) string

The [model selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-model-selection-expressions) for the route. Supported only for WebSocket APIs.

[OperationName](#operationname_go) string

Operation name for the route. Must be between 1 and 64 characters in length.

[Region](#region_go) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[RequestModels](#requestmodels_go) map\[string\]string

Request models for the route. Supported only for WebSocket APIs.

[RequestParameters](#requestparameters_go) [\[\]RouteRequestParameterArgs](#routerequestparameter)

Request parameters for the route. Supported only for WebSocket APIs.

[RouteResponseSelectionExpression](#routeresponseselectionexpression_go) string

The [route response selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-route-response-selection-expressions) for the route. Supported only for WebSocket APIs.

[Target](#target_go) string

Target for the route, of the form `integrations/`*`IntegrationID`*, where *`IntegrationID`* is the identifier of an `aws.apigatewayv2.Integration` resource.

[api\_id](#api_id_hcl)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

API identifier.

[route\_key](#route_key_hcl) This property is required. string

Route key for the route. For HTTP APIs, the route key can be either `$default`, or a combination of an HTTP method and resource path, for example, `GET /pets`.

[api\_key\_required](#api_key_required_hcl) bool

Boolean whether an API key is required for the route. Defaults to `false`. Supported only for WebSocket APIs.

[authorization\_scopes](#authorization_scopes_hcl) list(string)

Authorization scopes supported by this route. The scopes are used with a JWT authorizer to authorize the method invocation.

[authorization\_type](#authorization_type_hcl) string

Authorization type for the route. For WebSocket APIs, valid values are `NONE` for open access, `AWS_IAM` for using AWS IAM permissions, and `CUSTOM` for using a Lambda authorizer. For HTTP APIs, valid values are `NONE` for open access, `JWT` for using JSON Web Tokens, `AWS_IAM` for using AWS IAM permissions, and `CUSTOM` for using a Lambda authorizer. Defaults to `NONE`.

[authorizer\_id](#authorizer_id_hcl) string

Identifier of the `aws.apigatewayv2.Authorizer` resource to be associated with this route.

[model\_selection\_expression](#model_selection_expression_hcl) string

The [model selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-model-selection-expressions) for the route. Supported only for WebSocket APIs.

[operation\_name](#operation_name_hcl) string

Operation name for the route. Must be between 1 and 64 characters in length.

[region](#region_hcl) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[request\_models](#request_models_hcl) map(string)

Request models for the route. Supported only for WebSocket APIs.

[request\_parameters](#request_parameters_hcl) [list(object)](#routerequestparameter)

Request parameters for the route. Supported only for WebSocket APIs.

[route\_response\_selection\_expression](#route_response_selection_expression_hcl) string

The [route response selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-route-response-selection-expressions) for the route. Supported only for WebSocket APIs.

[target](#target_hcl) string

Target for the route, of the form `integrations/`*`IntegrationID`*, where *`IntegrationID`* is the identifier of an `aws.apigatewayv2.Integration` resource.

[apiId](#apiid_java)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

String

API identifier.

[routeKey](#routekey_java) This property is required. String

Route key for the route. For HTTP APIs, the route key can be either `$default`, or a combination of an HTTP method and resource path, for example, `GET /pets`.

[apiKeyRequired](#apikeyrequired_java) Boolean

Boolean whether an API key is required for the route. Defaults to `false`. Supported only for WebSocket APIs.

[authorizationScopes](#authorizationscopes_java) List<String>

Authorization scopes supported by this route. The scopes are used with a JWT authorizer to authorize the method invocation.

[authorizationType](#authorizationtype_java) String

Authorization type for the route. For WebSocket APIs, valid values are `NONE` for open access, `AWS_IAM` for using AWS IAM permissions, and `CUSTOM` for using a Lambda authorizer. For HTTP APIs, valid values are `NONE` for open access, `JWT` for using JSON Web Tokens, `AWS_IAM` for using AWS IAM permissions, and `CUSTOM` for using a Lambda authorizer. Defaults to `NONE`.

[authorizerId](#authorizerid_java) String

Identifier of the `aws.apigatewayv2.Authorizer` resource to be associated with this route.

[modelSelectionExpression](#modelselectionexpression_java) String

The [model selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-model-selection-expressions) for the route. Supported only for WebSocket APIs.

[operationName](#operationname_java) String

Operation name for the route. Must be between 1 and 64 characters in length.

[region](#region_java) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[requestModels](#requestmodels_java) Map<String,String>

Request models for the route. Supported only for WebSocket APIs.

[requestParameters](#requestparameters_java) [List<RouteRequestParameter>](#routerequestparameter)

Request parameters for the route. Supported only for WebSocket APIs.

[routeResponseSelectionExpression](#routeresponseselectionexpression_java) String

The [route response selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-route-response-selection-expressions) for the route. Supported only for WebSocket APIs.

[target](#target_java) String

Target for the route, of the form `integrations/`*`IntegrationID`*, where *`IntegrationID`* is the identifier of an `aws.apigatewayv2.Integration` resource.

[apiId](#apiid_nodejs)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

API identifier.

[routeKey](#routekey_nodejs) This property is required. string

Route key for the route. For HTTP APIs, the route key can be either `$default`, or a combination of an HTTP method and resource path, for example, `GET /pets`.

[apiKeyRequired](#apikeyrequired_nodejs) boolean

Boolean whether an API key is required for the route. Defaults to `false`. Supported only for WebSocket APIs.

[authorizationScopes](#authorizationscopes_nodejs) string\[\]

Authorization scopes supported by this route. The scopes are used with a JWT authorizer to authorize the method invocation.

[authorizationType](#authorizationtype_nodejs) string

Authorization type for the route. For WebSocket APIs, valid values are `NONE` for open access, `AWS_IAM` for using AWS IAM permissions, and `CUSTOM` for using a Lambda authorizer. For HTTP APIs, valid values are `NONE` for open access, `JWT` for using JSON Web Tokens, `AWS_IAM` for using AWS IAM permissions, and `CUSTOM` for using a Lambda authorizer. Defaults to `NONE`.

[authorizerId](#authorizerid_nodejs) string

Identifier of the `aws.apigatewayv2.Authorizer` resource to be associated with this route.

[modelSelectionExpression](#modelselectionexpression_nodejs) string

The [model selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-model-selection-expressions) for the route. Supported only for WebSocket APIs.

[operationName](#operationname_nodejs) string

Operation name for the route. Must be between 1 and 64 characters in length.

[region](#region_nodejs) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[requestModels](#requestmodels_nodejs) {\[key: string\]: string}

Request models for the route. Supported only for WebSocket APIs.

[requestParameters](#requestparameters_nodejs) [RouteRequestParameter\[\]](#routerequestparameter)

Request parameters for the route. Supported only for WebSocket APIs.

[routeResponseSelectionExpression](#routeresponseselectionexpression_nodejs) string

The [route response selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-route-response-selection-expressions) for the route. Supported only for WebSocket APIs.

[target](#target_nodejs) string

Target for the route, of the form `integrations/`*`IntegrationID`*, where *`IntegrationID`* is the identifier of an `aws.apigatewayv2.Integration` resource.

[api\_id](#api_id_python)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

str

API identifier.

[route\_key](#route_key_python) This property is required. str

Route key for the route. For HTTP APIs, the route key can be either `$default`, or a combination of an HTTP method and resource path, for example, `GET /pets`.

[api\_key\_required](#api_key_required_python) bool

Boolean whether an API key is required for the route. Defaults to `false`. Supported only for WebSocket APIs.

[authorization\_scopes](#authorization_scopes_python) Sequence\[str\]

Authorization scopes supported by this route. The scopes are used with a JWT authorizer to authorize the method invocation.

[authorization\_type](#authorization_type_python) str

Authorization type for the route. For WebSocket APIs, valid values are `NONE` for open access, `AWS_IAM` for using AWS IAM permissions, and `CUSTOM` for using a Lambda authorizer. For HTTP APIs, valid values are `NONE` for open access, `JWT` for using JSON Web Tokens, `AWS_IAM` for using AWS IAM permissions, and `CUSTOM` for using a Lambda authorizer. Defaults to `NONE`.

[authorizer\_id](#authorizer_id_python) str

Identifier of the `aws.apigatewayv2.Authorizer` resource to be associated with this route.

[model\_selection\_expression](#model_selection_expression_python) str

The [model selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-model-selection-expressions) for the route. Supported only for WebSocket APIs.

[operation\_name](#operation_name_python) str

Operation name for the route. Must be between 1 and 64 characters in length.

[region](#region_python) str

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[request\_models](#request_models_python) Mapping\[str, str\]

Request models for the route. Supported only for WebSocket APIs.

[request\_parameters](#request_parameters_python) [Sequence\[RouteRequestParameterArgs\]](#routerequestparameter)

Request parameters for the route. Supported only for WebSocket APIs.

[route\_response\_selection\_expression](#route_response_selection_expression_python) str

The [route response selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-route-response-selection-expressions) for the route. Supported only for WebSocket APIs.

[target](#target_python) str

Target for the route, of the form `integrations/`*`IntegrationID`*, where *`IntegrationID`* is the identifier of an `aws.apigatewayv2.Integration` resource.

[apiId](#apiid_yaml)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

String

API identifier.

[routeKey](#routekey_yaml) This property is required. String

Route key for the route. For HTTP APIs, the route key can be either `$default`, or a combination of an HTTP method and resource path, for example, `GET /pets`.

[apiKeyRequired](#apikeyrequired_yaml) Boolean

Boolean whether an API key is required for the route. Defaults to `false`. Supported only for WebSocket APIs.

[authorizationScopes](#authorizationscopes_yaml) List<String>

Authorization scopes supported by this route. The scopes are used with a JWT authorizer to authorize the method invocation.

[authorizationType](#authorizationtype_yaml) String

Authorization type for the route. For WebSocket APIs, valid values are `NONE` for open access, `AWS_IAM` for using AWS IAM permissions, and `CUSTOM` for using a Lambda authorizer. For HTTP APIs, valid values are `NONE` for open access, `JWT` for using JSON Web Tokens, `AWS_IAM` for using AWS IAM permissions, and `CUSTOM` for using a Lambda authorizer. Defaults to `NONE`.

[authorizerId](#authorizerid_yaml) String

Identifier of the `aws.apigatewayv2.Authorizer` resource to be associated with this route.

[modelSelectionExpression](#modelselectionexpression_yaml) String

The [model selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-model-selection-expressions) for the route. Supported only for WebSocket APIs.

[operationName](#operationname_yaml) String

Operation name for the route. Must be between 1 and 64 characters in length.

[region](#region_yaml) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[requestModels](#requestmodels_yaml) Map<String>

Request models for the route. Supported only for WebSocket APIs.

[requestParameters](#requestparameters_yaml) [List<Property Map>](#routerequestparameter)

Request parameters for the route. Supported only for WebSocket APIs.

[routeResponseSelectionExpression](#routeresponseselectionexpression_yaml) String

The [route response selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-route-response-selection-expressions) for the route. Supported only for WebSocket APIs.

[target](#target_yaml) String

Target for the route, of the form `integrations/`*`IntegrationID`*, where *`IntegrationID`* is the identifier of an `aws.apigatewayv2.Integration` resource.

### Outputs

All [input](#inputs) properties are implicitly available as output properties. Additionally, the Route resource produces the following output properties:

[Id](#id_csharp) string

The provider-assigned unique ID for this managed resource.

[Id](#id_go) string

The provider-assigned unique ID for this managed resource.

[id](#id_hcl) string

The provider-assigned unique ID for this managed resource.

[id](#id_java) String

The provider-assigned unique ID for this managed resource.

[id](#id_nodejs) string

The provider-assigned unique ID for this managed resource.

[id](#id_python) str

The provider-assigned unique ID for this managed resource.

[id](#id_yaml) String

The provider-assigned unique ID for this managed resource.

## Look up Existing Route Resource

Get an existing Route resource’s state with the given name, ID, and optional extra properties used to qualify the lookup.

-   TypeScript
-   Python
-   Go
-   C#
-   Java
-   YAML
-   HCL PREVIEW

```typescript
public static get(name: string, id: Input<ID>, state?: RouteState, opts?: CustomResourceOptions): Route
```

```python
@staticmethod
def get(resource_name: str,
        id: str,
        opts: Optional[ResourceOptions] = None,
        api_id: Optional[str] = None,
        api_key_required: Optional[bool] = None,
        authorization_scopes: Optional[Sequence[str]] = None,
        authorization_type: Optional[str] = None,
        authorizer_id: Optional[str] = None,
        model_selection_expression: Optional[str] = None,
        operation_name: Optional[str] = None,
        region: Optional[str] = None,
        request_models: Optional[Mapping[str, str]] = None,
        request_parameters: Optional[Sequence[RouteRequestParameterArgs]] = None,
        route_key: Optional[str] = None,
        route_response_selection_expression: Optional[str] = None,
        target: Optional[str] = None) -> Route
```

```go
func GetRoute(ctx *Context, name string, id IDInput, state *RouteState, opts ...ResourceOption) (*Route, error)
```

```csharp
public static Route Get(string name, Input<string> id, RouteState? state, CustomResourceOptions? opts = null)
```

```java
public static Route get(String name, Output<String> id, RouteState state, CustomResourceOptions options)
```

```yaml
resources:  _:    type: aws:apigatewayv2:Route    get:      id: ${id}
```

```hcl
import {
  to = aws_apigatewayv2_route.example
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

[ApiId](#state_apiid_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

API identifier.

[ApiKeyRequired](#state_apikeyrequired_csharp) bool

Boolean whether an API key is required for the route. Defaults to `false`. Supported only for WebSocket APIs.

[AuthorizationScopes](#state_authorizationscopes_csharp) List<string>

Authorization scopes supported by this route. The scopes are used with a JWT authorizer to authorize the method invocation.

[AuthorizationType](#state_authorizationtype_csharp) string

Authorization type for the route. For WebSocket APIs, valid values are `NONE` for open access, `AWS_IAM` for using AWS IAM permissions, and `CUSTOM` for using a Lambda authorizer. For HTTP APIs, valid values are `NONE` for open access, `JWT` for using JSON Web Tokens, `AWS_IAM` for using AWS IAM permissions, and `CUSTOM` for using a Lambda authorizer. Defaults to `NONE`.

[AuthorizerId](#state_authorizerid_csharp) string

Identifier of the `aws.apigatewayv2.Authorizer` resource to be associated with this route.

[ModelSelectionExpression](#state_modelselectionexpression_csharp) string

The [model selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-model-selection-expressions) for the route. Supported only for WebSocket APIs.

[OperationName](#state_operationname_csharp) string

Operation name for the route. Must be between 1 and 64 characters in length.

[Region](#state_region_csharp) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[RequestModels](#state_requestmodels_csharp) Dictionary<string, string>

Request models for the route. Supported only for WebSocket APIs.

[RequestParameters](#state_requestparameters_csharp) [List<RouteRequestParameter>](#routerequestparameter)

Request parameters for the route. Supported only for WebSocket APIs.

[RouteKey](#state_routekey_csharp) string

Route key for the route. For HTTP APIs, the route key can be either `$default`, or a combination of an HTTP method and resource path, for example, `GET /pets`.

[RouteResponseSelectionExpression](#state_routeresponseselectionexpression_csharp) string

The [route response selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-route-response-selection-expressions) for the route. Supported only for WebSocket APIs.

[Target](#state_target_csharp) string

Target for the route, of the form `integrations/`*`IntegrationID`*, where *`IntegrationID`* is the identifier of an `aws.apigatewayv2.Integration` resource.

[ApiId](#state_apiid_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

API identifier.

[ApiKeyRequired](#state_apikeyrequired_go) bool

Boolean whether an API key is required for the route. Defaults to `false`. Supported only for WebSocket APIs.

[AuthorizationScopes](#state_authorizationscopes_go) \[\]string

Authorization scopes supported by this route. The scopes are used with a JWT authorizer to authorize the method invocation.

[AuthorizationType](#state_authorizationtype_go) string

Authorization type for the route. For WebSocket APIs, valid values are `NONE` for open access, `AWS_IAM` for using AWS IAM permissions, and `CUSTOM` for using a Lambda authorizer. For HTTP APIs, valid values are `NONE` for open access, `JWT` for using JSON Web Tokens, `AWS_IAM` for using AWS IAM permissions, and `CUSTOM` for using a Lambda authorizer. Defaults to `NONE`.

[AuthorizerId](#state_authorizerid_go) string

Identifier of the `aws.apigatewayv2.Authorizer` resource to be associated with this route.

[ModelSelectionExpression](#state_modelselectionexpression_go) string

The [model selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-model-selection-expressions) for the route. Supported only for WebSocket APIs.

[OperationName](#state_operationname_go) string

Operation name for the route. Must be between 1 and 64 characters in length.

[Region](#state_region_go) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[RequestModels](#state_requestmodels_go) map\[string\]string

Request models for the route. Supported only for WebSocket APIs.

[RequestParameters](#state_requestparameters_go) [\[\]RouteRequestParameterArgs](#routerequestparameter)

Request parameters for the route. Supported only for WebSocket APIs.

[RouteKey](#state_routekey_go) string

Route key for the route. For HTTP APIs, the route key can be either `$default`, or a combination of an HTTP method and resource path, for example, `GET /pets`.

[RouteResponseSelectionExpression](#state_routeresponseselectionexpression_go) string

The [route response selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-route-response-selection-expressions) for the route. Supported only for WebSocket APIs.

[Target](#state_target_go) string

Target for the route, of the form `integrations/`*`IntegrationID`*, where *`IntegrationID`* is the identifier of an `aws.apigatewayv2.Integration` resource.

[api\_id](#state_api_id_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

API identifier.

[api\_key\_required](#state_api_key_required_hcl) bool

Boolean whether an API key is required for the route. Defaults to `false`. Supported only for WebSocket APIs.

[authorization\_scopes](#state_authorization_scopes_hcl) list(string)

Authorization scopes supported by this route. The scopes are used with a JWT authorizer to authorize the method invocation.

[authorization\_type](#state_authorization_type_hcl) string

Authorization type for the route. For WebSocket APIs, valid values are `NONE` for open access, `AWS_IAM` for using AWS IAM permissions, and `CUSTOM` for using a Lambda authorizer. For HTTP APIs, valid values are `NONE` for open access, `JWT` for using JSON Web Tokens, `AWS_IAM` for using AWS IAM permissions, and `CUSTOM` for using a Lambda authorizer. Defaults to `NONE`.

[authorizer\_id](#state_authorizer_id_hcl) string

Identifier of the `aws.apigatewayv2.Authorizer` resource to be associated with this route.

[model\_selection\_expression](#state_model_selection_expression_hcl) string

The [model selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-model-selection-expressions) for the route. Supported only for WebSocket APIs.

[operation\_name](#state_operation_name_hcl) string

Operation name for the route. Must be between 1 and 64 characters in length.

[region](#state_region_hcl) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[request\_models](#state_request_models_hcl) map(string)

Request models for the route. Supported only for WebSocket APIs.

[request\_parameters](#state_request_parameters_hcl) [list(object)](#routerequestparameter)

Request parameters for the route. Supported only for WebSocket APIs.

[route\_key](#state_route_key_hcl) string

Route key for the route. For HTTP APIs, the route key can be either `$default`, or a combination of an HTTP method and resource path, for example, `GET /pets`.

[route\_response\_selection\_expression](#state_route_response_selection_expression_hcl) string

The [route response selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-route-response-selection-expressions) for the route. Supported only for WebSocket APIs.

[target](#state_target_hcl) string

Target for the route, of the form `integrations/`*`IntegrationID`*, where *`IntegrationID`* is the identifier of an `aws.apigatewayv2.Integration` resource.

[apiId](#state_apiid_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

API identifier.

[apiKeyRequired](#state_apikeyrequired_java) Boolean

Boolean whether an API key is required for the route. Defaults to `false`. Supported only for WebSocket APIs.

[authorizationScopes](#state_authorizationscopes_java) List<String>

Authorization scopes supported by this route. The scopes are used with a JWT authorizer to authorize the method invocation.

[authorizationType](#state_authorizationtype_java) String

Authorization type for the route. For WebSocket APIs, valid values are `NONE` for open access, `AWS_IAM` for using AWS IAM permissions, and `CUSTOM` for using a Lambda authorizer. For HTTP APIs, valid values are `NONE` for open access, `JWT` for using JSON Web Tokens, `AWS_IAM` for using AWS IAM permissions, and `CUSTOM` for using a Lambda authorizer. Defaults to `NONE`.

[authorizerId](#state_authorizerid_java) String

Identifier of the `aws.apigatewayv2.Authorizer` resource to be associated with this route.

[modelSelectionExpression](#state_modelselectionexpression_java) String

The [model selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-model-selection-expressions) for the route. Supported only for WebSocket APIs.

[operationName](#state_operationname_java) String

Operation name for the route. Must be between 1 and 64 characters in length.

[region](#state_region_java) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[requestModels](#state_requestmodels_java) Map<String,String>

Request models for the route. Supported only for WebSocket APIs.

[requestParameters](#state_requestparameters_java) [List<RouteRequestParameter>](#routerequestparameter)

Request parameters for the route. Supported only for WebSocket APIs.

[routeKey](#state_routekey_java) String

Route key for the route. For HTTP APIs, the route key can be either `$default`, or a combination of an HTTP method and resource path, for example, `GET /pets`.

[routeResponseSelectionExpression](#state_routeresponseselectionexpression_java) String

The [route response selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-route-response-selection-expressions) for the route. Supported only for WebSocket APIs.

[target](#state_target_java) String

Target for the route, of the form `integrations/`*`IntegrationID`*, where *`IntegrationID`* is the identifier of an `aws.apigatewayv2.Integration` resource.

[apiId](#state_apiid_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

API identifier.

[apiKeyRequired](#state_apikeyrequired_nodejs) boolean

Boolean whether an API key is required for the route. Defaults to `false`. Supported only for WebSocket APIs.

[authorizationScopes](#state_authorizationscopes_nodejs) string\[\]

Authorization scopes supported by this route. The scopes are used with a JWT authorizer to authorize the method invocation.

[authorizationType](#state_authorizationtype_nodejs) string

Authorization type for the route. For WebSocket APIs, valid values are `NONE` for open access, `AWS_IAM` for using AWS IAM permissions, and `CUSTOM` for using a Lambda authorizer. For HTTP APIs, valid values are `NONE` for open access, `JWT` for using JSON Web Tokens, `AWS_IAM` for using AWS IAM permissions, and `CUSTOM` for using a Lambda authorizer. Defaults to `NONE`.

[authorizerId](#state_authorizerid_nodejs) string

Identifier of the `aws.apigatewayv2.Authorizer` resource to be associated with this route.

[modelSelectionExpression](#state_modelselectionexpression_nodejs) string

The [model selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-model-selection-expressions) for the route. Supported only for WebSocket APIs.

[operationName](#state_operationname_nodejs) string

Operation name for the route. Must be between 1 and 64 characters in length.

[region](#state_region_nodejs) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[requestModels](#state_requestmodels_nodejs) {\[key: string\]: string}

Request models for the route. Supported only for WebSocket APIs.

[requestParameters](#state_requestparameters_nodejs) [RouteRequestParameter\[\]](#routerequestparameter)

Request parameters for the route. Supported only for WebSocket APIs.

[routeKey](#state_routekey_nodejs) string

Route key for the route. For HTTP APIs, the route key can be either `$default`, or a combination of an HTTP method and resource path, for example, `GET /pets`.

[routeResponseSelectionExpression](#state_routeresponseselectionexpression_nodejs) string

The [route response selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-route-response-selection-expressions) for the route. Supported only for WebSocket APIs.

[target](#state_target_nodejs) string

Target for the route, of the form `integrations/`*`IntegrationID`*, where *`IntegrationID`* is the identifier of an `aws.apigatewayv2.Integration` resource.

[api\_id](#state_api_id_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

API identifier.

[api\_key\_required](#state_api_key_required_python) bool

Boolean whether an API key is required for the route. Defaults to `false`. Supported only for WebSocket APIs.

[authorization\_scopes](#state_authorization_scopes_python) Sequence\[str\]

Authorization scopes supported by this route. The scopes are used with a JWT authorizer to authorize the method invocation.

[authorization\_type](#state_authorization_type_python) str

Authorization type for the route. For WebSocket APIs, valid values are `NONE` for open access, `AWS_IAM` for using AWS IAM permissions, and `CUSTOM` for using a Lambda authorizer. For HTTP APIs, valid values are `NONE` for open access, `JWT` for using JSON Web Tokens, `AWS_IAM` for using AWS IAM permissions, and `CUSTOM` for using a Lambda authorizer. Defaults to `NONE`.

[authorizer\_id](#state_authorizer_id_python) str

Identifier of the `aws.apigatewayv2.Authorizer` resource to be associated with this route.

[model\_selection\_expression](#state_model_selection_expression_python) str

The [model selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-model-selection-expressions) for the route. Supported only for WebSocket APIs.

[operation\_name](#state_operation_name_python) str

Operation name for the route. Must be between 1 and 64 characters in length.

[region](#state_region_python) str

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[request\_models](#state_request_models_python) Mapping\[str, str\]

Request models for the route. Supported only for WebSocket APIs.

[request\_parameters](#state_request_parameters_python) [Sequence\[RouteRequestParameterArgs\]](#routerequestparameter)

Request parameters for the route. Supported only for WebSocket APIs.

[route\_key](#state_route_key_python) str

Route key for the route. For HTTP APIs, the route key can be either `$default`, or a combination of an HTTP method and resource path, for example, `GET /pets`.

[route\_response\_selection\_expression](#state_route_response_selection_expression_python) str

The [route response selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-route-response-selection-expressions) for the route. Supported only for WebSocket APIs.

[target](#state_target_python) str

Target for the route, of the form `integrations/`*`IntegrationID`*, where *`IntegrationID`* is the identifier of an `aws.apigatewayv2.Integration` resource.

[apiId](#state_apiid_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

API identifier.

[apiKeyRequired](#state_apikeyrequired_yaml) Boolean

Boolean whether an API key is required for the route. Defaults to `false`. Supported only for WebSocket APIs.

[authorizationScopes](#state_authorizationscopes_yaml) List<String>

Authorization scopes supported by this route. The scopes are used with a JWT authorizer to authorize the method invocation.

[authorizationType](#state_authorizationtype_yaml) String

Authorization type for the route. For WebSocket APIs, valid values are `NONE` for open access, `AWS_IAM` for using AWS IAM permissions, and `CUSTOM` for using a Lambda authorizer. For HTTP APIs, valid values are `NONE` for open access, `JWT` for using JSON Web Tokens, `AWS_IAM` for using AWS IAM permissions, and `CUSTOM` for using a Lambda authorizer. Defaults to `NONE`.

[authorizerId](#state_authorizerid_yaml) String

Identifier of the `aws.apigatewayv2.Authorizer` resource to be associated with this route.

[modelSelectionExpression](#state_modelselectionexpression_yaml) String

The [model selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-model-selection-expressions) for the route. Supported only for WebSocket APIs.

[operationName](#state_operationname_yaml) String

Operation name for the route. Must be between 1 and 64 characters in length.

[region](#state_region_yaml) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[requestModels](#state_requestmodels_yaml) Map<String>

Request models for the route. Supported only for WebSocket APIs.

[requestParameters](#state_requestparameters_yaml) [List<Property Map>](#routerequestparameter)

Request parameters for the route. Supported only for WebSocket APIs.

[routeKey](#state_routekey_yaml) String

Route key for the route. For HTTP APIs, the route key can be either `$default`, or a combination of an HTTP method and resource path, for example, `GET /pets`.

[routeResponseSelectionExpression](#state_routeresponseselectionexpression_yaml) String

The [route response selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-route-response-selection-expressions) for the route. Supported only for WebSocket APIs.

[target](#state_target_yaml) String

Target for the route, of the form `integrations/`*`IntegrationID`*, where *`IntegrationID`* is the identifier of an `aws.apigatewayv2.Integration` resource.

## Supporting Types

#### RouteRequestParameter

, RouteRequestParameterArgs

[RequestParameterKey](#requestparameterkey_csharp) This property is required. string

Request parameter key. This is a [request data mapping parameter](https://docs.aws.amazon.com/apigateway/latest/developerguide/websocket-api-data-mapping.html#websocket-mapping-request-parameters).

[Required](#required_csharp) This property is required. bool

Boolean whether or not the parameter is required.

[RequestParameterKey](#requestparameterkey_go) This property is required. string

Request parameter key. This is a [request data mapping parameter](https://docs.aws.amazon.com/apigateway/latest/developerguide/websocket-api-data-mapping.html#websocket-mapping-request-parameters).

[Required](#required_go) This property is required. bool

Boolean whether or not the parameter is required.

[request\_parameter\_key](#request_parameter_key_hcl) This property is required. string

Request parameter key. This is a [request data mapping parameter](https://docs.aws.amazon.com/apigateway/latest/developerguide/websocket-api-data-mapping.html#websocket-mapping-request-parameters).

[required](#required_hcl) This property is required. bool

Boolean whether or not the parameter is required.

[requestParameterKey](#requestparameterkey_java) This property is required. String

Request parameter key. This is a [request data mapping parameter](https://docs.aws.amazon.com/apigateway/latest/developerguide/websocket-api-data-mapping.html#websocket-mapping-request-parameters).

[required](#required_java) This property is required. Boolean

Boolean whether or not the parameter is required.

[requestParameterKey](#requestparameterkey_nodejs) This property is required. string

Request parameter key. This is a [request data mapping parameter](https://docs.aws.amazon.com/apigateway/latest/developerguide/websocket-api-data-mapping.html#websocket-mapping-request-parameters).

[required](#required_nodejs) This property is required. boolean

Boolean whether or not the parameter is required.

[request\_parameter\_key](#request_parameter_key_python) This property is required. str

Request parameter key. This is a [request data mapping parameter](https://docs.aws.amazon.com/apigateway/latest/developerguide/websocket-api-data-mapping.html#websocket-mapping-request-parameters).

[required](#required_python) This property is required. bool

Boolean whether or not the parameter is required.

[requestParameterKey](#requestparameterkey_yaml) This property is required. String

Request parameter key. This is a [request data mapping parameter](https://docs.aws.amazon.com/apigateway/latest/developerguide/websocket-api-data-mapping.html#websocket-mapping-request-parameters).

[required](#required_yaml) This property is required. Boolean

Boolean whether or not the parameter is required.

## Import

### Identity Schema

#### Required

-   `apiId` (String) API identifier.
-   `id` (String) Route identifier.

#### Optional

-   `accountId` (String) AWS Account where this resource is managed.
-   `region` (String) Region where this resource is managed.

Using `pulumi import`, import `aws.apigatewayv2.Route` using `apiId` and `id` (route identifier), delimited by a `/`. For example:

```bash
$ pulumi import aws:apigatewayv2/route:Route example aabbccddee/1122334
```

> **Note:** The API Gateway managed route created as part of [*quick\_create*](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-basic-concept.html#apigateway-definition-quick-create) cannot be imported.

To learn more about importing existing cloud resources, see [Importing resources](/docs/using-pulumi/adopting-pulumi/import/).

## Package Details

Repository

[AWS Classic pulumi/pulumi-aws](https://github.com/pulumi/pulumi-aws)

License

Apache-2.0

Notes

This Pulumi package is based on the [`aws` Terraform Provider](https://github.com/hashicorp/terraform-provider-aws).

-   Copy Page

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2fapigatewayv2%2froute]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2fapigatewayv2%2froute%2f\))

#### Try Pulumi Cloud free.
Your team will thank you.

[Start free trial](https://app.pulumi.com/signup?utm_source=registry&utm_medium=right-rail-banner&utm_campaign=try-pulumi-cloud&iaid=docs-try-pulumi-cloud-ad)
