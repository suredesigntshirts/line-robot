---
Source: https://www.pulumi.com/registry/packages/aws/api-docs/apigatewayv2/stage/
Generated: 2026-06-06
Updated: 2026-06-06
---

# aws.apigatewayv2.Stage

1.  [Packages](/registry/)
2.  [Packages](/registry/packages/)
3.  [AWS](/registry/packages/aws/)
4.  [API Docs](/registry/packages/aws/api-docs/)
5.  [apigatewayv2](/registry/packages/aws/api-docs/apigatewayv2/)
6.  [Stage](/registry/packages/aws/api-docs/apigatewayv2/stage/)

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

Viewing docs for AWS v7.32.0
published on Friday, May 29, 2026 by Pulumi

[Schema (JSON)](/registry/packages/aws/schema.json)

[pulumi/pulumi-aws](https://github.com/pulumi/pulumi-aws)

v7.32.0 (7.x, latest)v6.83.1 (6.x)v5.43.0 (5.x)

# aws.apigatewayv2.Stage[](#aws-apigatewayv2-stage)

Explore with Neo

-   Copy Page

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2fapigatewayv2%2fstage]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2fapigatewayv2%2fstage%2f\))

Manages an Amazon API Gateway Version 2 stage. More information can be found in the [Amazon API Gateway Developer Guide](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api.html).

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

const example = new aws.apigatewayv2.Stage("example", {
    apiId: exampleAwsApigatewayv2Api.id,
    name: "example-stage",
});
```

```python
import pulumi
import pulumi_aws as aws

example = aws.apigatewayv2.Stage("example",
    api_id=example_aws_apigatewayv2_api["id"],
    name="example-stage")
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/apigatewayv2"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		_, err := apigatewayv2.NewStage(ctx, "example", &apigatewayv2.StageArgs{
			ApiId: pulumi.Any(exampleAwsApigatewayv2Api.Id),
			Name:  pulumi.String("example-stage"),
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
    var example = new Aws.ApiGatewayV2.Stage("example", new()
    {
        ApiId = exampleAwsApigatewayv2Api.Id,
        Name = "example-stage",
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.apigatewayv2.Stage;
import com.pulumi.aws.apigatewayv2.StageArgs;
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
        var example = new Stage("example", StageArgs.builder()
            .apiId(exampleAwsApigatewayv2Api.id())
            .name("example-stage")
            .build());

    }
}
```

```yaml
resources:
  example:
    type: aws:apigatewayv2:Stage
    properties:
      apiId: ${exampleAwsApigatewayv2Api.id}
      name: example-stage
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_apigatewayv2_stage" "example" {
  api_id = exampleAwsApigatewayv2Api.id
  name   = "example-stage"
}
```

## Create Stage Resource[](#create)

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
new Stage(name: string, args: StageArgs, opts?: CustomResourceOptions);
```

```python
@overload
def Stage(resource_name: str,
          args: StageArgs,
          opts: Optional[ResourceOptions] = None)

@overload
def Stage(resource_name: str,
          opts: Optional[ResourceOptions] = None,
          api_id: Optional[str] = None,
          access_log_settings: Optional[StageAccessLogSettingsArgs] = None,
          auto_deploy: Optional[bool] = None,
          client_certificate_id: Optional[str] = None,
          default_route_settings: Optional[StageDefaultRouteSettingsArgs] = None,
          deployment_id: Optional[str] = None,
          description: Optional[str] = None,
          name: Optional[str] = None,
          region: Optional[str] = None,
          route_settings: Optional[Sequence[StageRouteSettingArgs]] = None,
          stage_variables: Optional[Mapping[str, str]] = None,
          tags: Optional[Mapping[str, str]] = None)
```

```go
func NewStage(ctx *Context, name string, args StageArgs, opts ...ResourceOption) (*Stage, error)
```

```csharp
public Stage(string name, StageArgs args, CustomResourceOptions? opts = null)
```

```java
public Stage(String name, StageArgs args)
public Stage(String name, StageArgs args, CustomResourceOptions options)
```

```yaml
type: aws:apigatewayv2:Stage
properties: # The arguments to resource properties.
options: # Bag of options to control resource's behavior.
```

```hcl
resource "aws_apigatewayv2_stage" "name" {
    # resource properties
}
```

#### Parameters[](#parameters)

name This property is required. string

The unique name of the resource.

args This property is required. [StageArgs](#inputs)

The arguments to resource properties.

opts [CustomResourceOptions](/docs/reference/pkg/nodejs/pulumi/pulumi/#CustomResourceOptions)

Bag of options to control resource's behavior.

resource\_name This property is required. str

The unique name of the resource.

args This property is required. [StageArgs](#inputs)

The arguments to resource properties.

opts [ResourceOptions](/docs/reference/pkg/python/pulumi/#pulumi.ResourceOptions)

Bag of options to control resource's behavior.

ctx [Context](https://pkg.go.dev/github.com/pulumi/pulumi/sdk/v3/go/pulumi?tab=doc#Context)

Context object for the current deployment.

name This property is required. string

The unique name of the resource.

args This property is required. [StageArgs](#inputs)

The arguments to resource properties.

opts [ResourceOption](https://pkg.go.dev/github.com/pulumi/pulumi/sdk/v3/go/pulumi?tab=doc#ResourceOption)

Bag of options to control resource's behavior.

name This property is required. string

The unique name of the resource.

args This property is required. [StageArgs](#inputs)

The arguments to resource properties.

opts [CustomResourceOptions](/docs/reference/pkg/dotnet/Pulumi/Pulumi.CustomResourceOptions.html)

Bag of options to control resource's behavior.

name This property is required. String

The unique name of the resource.

args This property is required. [StageArgs](#inputs)

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
var awsStageResource = new Aws.ApiGatewayV2.Stage("awsStageResource", new()
{
    ApiId = "string",
    AccessLogSettings = new Aws.ApiGatewayV2.Inputs.StageAccessLogSettingsArgs
    {
        DestinationArn = "string",
        Format = "string",
    },
    AutoDeploy = false,
    ClientCertificateId = "string",
    DefaultRouteSettings = new Aws.ApiGatewayV2.Inputs.StageDefaultRouteSettingsArgs
    {
        DataTraceEnabled = false,
        DetailedMetricsEnabled = false,
        LoggingLevel = "string",
        ThrottlingBurstLimit = 0,
        ThrottlingRateLimit = 0,
    },
    DeploymentId = "string",
    Description = "string",
    Name = "string",
    Region = "string",
    RouteSettings = new[]
    {
        new Aws.ApiGatewayV2.Inputs.StageRouteSettingArgs
        {
            RouteKey = "string",
            DataTraceEnabled = false,
            DetailedMetricsEnabled = false,
            LoggingLevel = "string",
            ThrottlingBurstLimit = 0,
            ThrottlingRateLimit = 0,
        },
    },
    StageVariables =
    {
        { "string", "string" },
    },
    Tags =
    {
        { "string", "string" },
    },
});
```

```go
example, err := apigatewayv2.NewStage(ctx, "awsStageResource", &apigatewayv2.StageArgs{
	ApiId: pulumi.String("string"),
	AccessLogSettings: &apigatewayv2.StageAccessLogSettingsArgs{
		DestinationArn: pulumi.String("string"),
		Format:         pulumi.String("string"),
	},
	AutoDeploy:          pulumi.Bool(false),
	ClientCertificateId: pulumi.String("string"),
	DefaultRouteSettings: &apigatewayv2.StageDefaultRouteSettingsArgs{
		DataTraceEnabled:       pulumi.Bool(false),
		DetailedMetricsEnabled: pulumi.Bool(false),
		LoggingLevel:           pulumi.String("string"),
		ThrottlingBurstLimit:   pulumi.Int(0),
		ThrottlingRateLimit:    pulumi.Float64(0),
	},
	DeploymentId: pulumi.String("string"),
	Description:  pulumi.String("string"),
	Name:         pulumi.String("string"),
	Region:       pulumi.String("string"),
	RouteSettings: apigatewayv2.StageRouteSettingArray{
		&apigatewayv2.StageRouteSettingArgs{
			RouteKey:               pulumi.String("string"),
			DataTraceEnabled:       pulumi.Bool(false),
			DetailedMetricsEnabled: pulumi.Bool(false),
			LoggingLevel:           pulumi.String("string"),
			ThrottlingBurstLimit:   pulumi.Int(0),
			ThrottlingRateLimit:    pulumi.Float64(0),
		},
	},
	StageVariables: pulumi.StringMap{
		"string": pulumi.String("string"),
	},
	Tags: pulumi.StringMap{
		"string": pulumi.String("string"),
	},
})
```

```hcl
resource "aws_apigatewayv2_stage" "awsStageResource" {
  api_id = "string"
  access_log_settings = {
    destination_arn = "string"
    format          = "string"
  }
  auto_deploy           = false
  client_certificate_id = "string"
  default_route_settings = {
    data_trace_enabled       = false
    detailed_metrics_enabled = false
    logging_level            = "string"
    throttling_burst_limit   = 0
    throttling_rate_limit    = 0
  }
  deployment_id = "string"
  description   = "string"
  name          = "string"
  region        = "string"
  route_settings {
    route_key                = "string"
    data_trace_enabled       = false
    detailed_metrics_enabled = false
    logging_level            = "string"
    throttling_burst_limit   = 0
    throttling_rate_limit    = 0
  }
  stage_variables = {
    "string" = "string"
  }
  tags = {
    "string" = "string"
  }
}
```

```java
var awsStageResource = new com.pulumi.aws.apigatewayv2.Stage("awsStageResource", com.pulumi.aws.apigatewayv2.StageArgs.builder()
    .apiId("string")
    .accessLogSettings(StageAccessLogSettingsArgs.builder()
        .destinationArn("string")
        .format("string")
        .build())
    .autoDeploy(false)
    .clientCertificateId("string")
    .defaultRouteSettings(StageDefaultRouteSettingsArgs.builder()
        .dataTraceEnabled(false)
        .detailedMetricsEnabled(false)
        .loggingLevel("string")
        .throttlingBurstLimit(0)
        .throttlingRateLimit(0.0)
        .build())
    .deploymentId("string")
    .description("string")
    .name("string")
    .region("string")
    .routeSettings(StageRouteSettingArgs.builder()
        .routeKey("string")
        .dataTraceEnabled(false)
        .detailedMetricsEnabled(false)
        .loggingLevel("string")
        .throttlingBurstLimit(0)
        .throttlingRateLimit(0.0)
        .build())
    .stageVariables(Map.of("string", "string"))
    .tags(Map.of("string", "string"))
    .build());
```

```python
aws_stage_resource = aws.apigatewayv2.Stage("awsStageResource",
    api_id="string",
    access_log_settings={
        "destination_arn": "string",
        "format": "string",
    },
    auto_deploy=False,
    client_certificate_id="string",
    default_route_settings={
        "data_trace_enabled": False,
        "detailed_metrics_enabled": False,
        "logging_level": "string",
        "throttling_burst_limit": 0,
        "throttling_rate_limit": float(0),
    },
    deployment_id="string",
    description="string",
    name="string",
    region="string",
    route_settings=[{
        "route_key": "string",
        "data_trace_enabled": False,
        "detailed_metrics_enabled": False,
        "logging_level": "string",
        "throttling_burst_limit": 0,
        "throttling_rate_limit": float(0),
    }],
    stage_variables={
        "string": "string",
    },
    tags={
        "string": "string",
    })
```

```typescript
const awsStageResource = new aws.apigatewayv2.Stage("awsStageResource", {
    apiId: "string",
    accessLogSettings: {
        destinationArn: "string",
        format: "string",
    },
    autoDeploy: false,
    clientCertificateId: "string",
    defaultRouteSettings: {
        dataTraceEnabled: false,
        detailedMetricsEnabled: false,
        loggingLevel: "string",
        throttlingBurstLimit: 0,
        throttlingRateLimit: 0,
    },
    deploymentId: "string",
    description: "string",
    name: "string",
    region: "string",
    routeSettings: [{
        routeKey: "string",
        dataTraceEnabled: false,
        detailedMetricsEnabled: false,
        loggingLevel: "string",
        throttlingBurstLimit: 0,
        throttlingRateLimit: 0,
    }],
    stageVariables: {
        string: "string",
    },
    tags: {
        string: "string",
    },
});
```

```yaml
type: aws:apigatewayv2:Stage
properties:
    accessLogSettings:
        destinationArn: string
        format: string
    apiId: string
    autoDeploy: false
    clientCertificateId: string
    defaultRouteSettings:
        dataTraceEnabled: false
        detailedMetricsEnabled: false
        loggingLevel: string
        throttlingBurstLimit: 0
        throttlingRateLimit: 0
    deploymentId: string
    description: string
    name: string
    region: string
    routeSettings:
        - dataTraceEnabled: false
          detailedMetricsEnabled: false
          loggingLevel: string
          routeKey: string
          throttlingBurstLimit: 0
          throttlingRateLimit: 0
    stageVariables:
        string: string
    tags:
        string: string
```

## Stage Resource Properties[](#properties)

To learn more about resource properties and how to use them, see [Inputs and Outputs](/docs/intro/concepts/inputs-outputs) in the Architecture and Concepts docs.

### Inputs[](#inputs)

In Python, inputs that are objects can be passed either as [argument classes or as dictionary literals](/docs/languages-sdks/python/#inputs-and-outputs).

The Stage resource accepts the following [input](/docs/intro/concepts/inputs-outputs) properties:

[ApiId](#apiid_csharp)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

API identifier.

[AccessLogSettings](#accesslogsettings_csharp) [StageAccessLogSettings](#stageaccesslogsettings)

Settings for logging access in this stage. Use the `aws.apigateway.Account` resource to configure [permissions for CloudWatch Logging](https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-logging.html#set-up-access-logging-permissions).

[AutoDeploy](#autodeploy_csharp) bool

Whether updates to an API automatically trigger a new deployment. Defaults to `false`. Applicable for HTTP APIs.

[ClientCertificateId](#clientcertificateid_csharp) string

Identifier of a client certificate for the stage. Use the `aws.apigateway.ClientCertificate` resource to configure a client certificate. Supported only for WebSocket APIs.

[DefaultRouteSettings](#defaultroutesettings_csharp) [StageDefaultRouteSettings](#stagedefaultroutesettings)

Default route settings for the stage.

[DeploymentId](#deploymentid_csharp) string

Deployment identifier of the stage. Use the `aws.apigatewayv2.Deployment` resource to configure a deployment.

[Description](#description_csharp) string

Description for the stage. Must be less than or equal to 1024 characters in length.

[Name](#name_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Name of the stage. Must be between 1 and 128 characters in length.

The following arguments are optional:

[Region](#region_csharp) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[RouteSettings](#routesettings_csharp) [List<StageRouteSetting>](#stageroutesetting)

Route settings for the stage.

[StageVariables](#stagevariables_csharp) Dictionary<string, string>

Map that defines the stage variables for the stage.

[Tags](#tags_csharp) Dictionary<string, string>

Map of tags to assign to the stage. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[ApiId](#apiid_go)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

API identifier.

[AccessLogSettings](#accesslogsettings_go) [StageAccessLogSettingsArgs](#stageaccesslogsettings)

Settings for logging access in this stage. Use the `aws.apigateway.Account` resource to configure [permissions for CloudWatch Logging](https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-logging.html#set-up-access-logging-permissions).

[AutoDeploy](#autodeploy_go) bool

Whether updates to an API automatically trigger a new deployment. Defaults to `false`. Applicable for HTTP APIs.

[ClientCertificateId](#clientcertificateid_go) string

Identifier of a client certificate for the stage. Use the `aws.apigateway.ClientCertificate` resource to configure a client certificate. Supported only for WebSocket APIs.

[DefaultRouteSettings](#defaultroutesettings_go) [StageDefaultRouteSettingsArgs](#stagedefaultroutesettings)

Default route settings for the stage.

[DeploymentId](#deploymentid_go) string

Deployment identifier of the stage. Use the `aws.apigatewayv2.Deployment` resource to configure a deployment.

[Description](#description_go) string

Description for the stage. Must be less than or equal to 1024 characters in length.

[Name](#name_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Name of the stage. Must be between 1 and 128 characters in length.

The following arguments are optional:

[Region](#region_go) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[RouteSettings](#routesettings_go) [\[\]StageRouteSettingArgs](#stageroutesetting)

Route settings for the stage.

[StageVariables](#stagevariables_go) map\[string\]string

Map that defines the stage variables for the stage.

[Tags](#tags_go) map\[string\]string

Map of tags to assign to the stage. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[api\_id](#api_id_hcl)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

API identifier.

[access\_log\_settings](#access_log_settings_hcl) [object](#stageaccesslogsettings)

Settings for logging access in this stage. Use the `aws.apigateway.Account` resource to configure [permissions for CloudWatch Logging](https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-logging.html#set-up-access-logging-permissions).

[auto\_deploy](#auto_deploy_hcl) bool

Whether updates to an API automatically trigger a new deployment. Defaults to `false`. Applicable for HTTP APIs.

[client\_certificate\_id](#client_certificate_id_hcl) string

Identifier of a client certificate for the stage. Use the `aws.apigateway.ClientCertificate` resource to configure a client certificate. Supported only for WebSocket APIs.

[default\_route\_settings](#default_route_settings_hcl) [object](#stagedefaultroutesettings)

Default route settings for the stage.

[deployment\_id](#deployment_id_hcl) string

Deployment identifier of the stage. Use the `aws.apigatewayv2.Deployment` resource to configure a deployment.

[description](#description_hcl) string

Description for the stage. Must be less than or equal to 1024 characters in length.

[name](#name_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Name of the stage. Must be between 1 and 128 characters in length.

The following arguments are optional:

[region](#region_hcl) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[route\_settings](#route_settings_hcl) [list(object)](#stageroutesetting)

Route settings for the stage.

[stage\_variables](#stage_variables_hcl) map(string)

Map that defines the stage variables for the stage.

[tags](#tags_hcl) map(string)

Map of tags to assign to the stage. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[apiId](#apiid_java)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

String

API identifier.

[accessLogSettings](#accesslogsettings_java) [StageAccessLogSettings](#stageaccesslogsettings)

Settings for logging access in this stage. Use the `aws.apigateway.Account` resource to configure [permissions for CloudWatch Logging](https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-logging.html#set-up-access-logging-permissions).

[autoDeploy](#autodeploy_java) Boolean

Whether updates to an API automatically trigger a new deployment. Defaults to `false`. Applicable for HTTP APIs.

[clientCertificateId](#clientcertificateid_java) String

Identifier of a client certificate for the stage. Use the `aws.apigateway.ClientCertificate` resource to configure a client certificate. Supported only for WebSocket APIs.

[defaultRouteSettings](#defaultroutesettings_java) [StageDefaultRouteSettings](#stagedefaultroutesettings)

Default route settings for the stage.

[deploymentId](#deploymentid_java) String

Deployment identifier of the stage. Use the `aws.apigatewayv2.Deployment` resource to configure a deployment.

[description](#description_java) String

Description for the stage. Must be less than or equal to 1024 characters in length.

[name](#name_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Name of the stage. Must be between 1 and 128 characters in length.

The following arguments are optional:

[region](#region_java) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[routeSettings](#routesettings_java) [List<StageRouteSetting>](#stageroutesetting)

Route settings for the stage.

[stageVariables](#stagevariables_java) Map<String,String>

Map that defines the stage variables for the stage.

[tags](#tags_java) Map<String,String>

Map of tags to assign to the stage. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[apiId](#apiid_nodejs)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

API identifier.

[accessLogSettings](#accesslogsettings_nodejs) [StageAccessLogSettings](#stageaccesslogsettings)

Settings for logging access in this stage. Use the `aws.apigateway.Account` resource to configure [permissions for CloudWatch Logging](https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-logging.html#set-up-access-logging-permissions).

[autoDeploy](#autodeploy_nodejs) boolean

Whether updates to an API automatically trigger a new deployment. Defaults to `false`. Applicable for HTTP APIs.

[clientCertificateId](#clientcertificateid_nodejs) string

Identifier of a client certificate for the stage. Use the `aws.apigateway.ClientCertificate` resource to configure a client certificate. Supported only for WebSocket APIs.

[defaultRouteSettings](#defaultroutesettings_nodejs) [StageDefaultRouteSettings](#stagedefaultroutesettings)

Default route settings for the stage.

[deploymentId](#deploymentid_nodejs) string

Deployment identifier of the stage. Use the `aws.apigatewayv2.Deployment` resource to configure a deployment.

[description](#description_nodejs) string

Description for the stage. Must be less than or equal to 1024 characters in length.

[name](#name_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Name of the stage. Must be between 1 and 128 characters in length.

The following arguments are optional:

[region](#region_nodejs) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[routeSettings](#routesettings_nodejs) [StageRouteSetting\[\]](#stageroutesetting)

Route settings for the stage.

[stageVariables](#stagevariables_nodejs) {\[key: string\]: string}

Map that defines the stage variables for the stage.

[tags](#tags_nodejs) {\[key: string\]: string}

Map of tags to assign to the stage. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[api\_id](#api_id_python)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

str

API identifier.

[access\_log\_settings](#access_log_settings_python) [StageAccessLogSettingsArgs](#stageaccesslogsettings)

Settings for logging access in this stage. Use the `aws.apigateway.Account` resource to configure [permissions for CloudWatch Logging](https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-logging.html#set-up-access-logging-permissions).

[auto\_deploy](#auto_deploy_python) bool

Whether updates to an API automatically trigger a new deployment. Defaults to `false`. Applicable for HTTP APIs.

[client\_certificate\_id](#client_certificate_id_python) str

Identifier of a client certificate for the stage. Use the `aws.apigateway.ClientCertificate` resource to configure a client certificate. Supported only for WebSocket APIs.

[default\_route\_settings](#default_route_settings_python) [StageDefaultRouteSettingsArgs](#stagedefaultroutesettings)

Default route settings for the stage.

[deployment\_id](#deployment_id_python) str

Deployment identifier of the stage. Use the `aws.apigatewayv2.Deployment` resource to configure a deployment.

[description](#description_python) str

Description for the stage. Must be less than or equal to 1024 characters in length.

[name](#name_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Name of the stage. Must be between 1 and 128 characters in length.

The following arguments are optional:

[region](#region_python) str

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[route\_settings](#route_settings_python) [Sequence\[StageRouteSettingArgs\]](#stageroutesetting)

Route settings for the stage.

[stage\_variables](#stage_variables_python) Mapping\[str, str\]

Map that defines the stage variables for the stage.

[tags](#tags_python) Mapping\[str, str\]

Map of tags to assign to the stage. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[apiId](#apiid_yaml)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

String

API identifier.

[accessLogSettings](#accesslogsettings_yaml) [Property Map](#stageaccesslogsettings)

Settings for logging access in this stage. Use the `aws.apigateway.Account` resource to configure [permissions for CloudWatch Logging](https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-logging.html#set-up-access-logging-permissions).

[autoDeploy](#autodeploy_yaml) Boolean

Whether updates to an API automatically trigger a new deployment. Defaults to `false`. Applicable for HTTP APIs.

[clientCertificateId](#clientcertificateid_yaml) String

Identifier of a client certificate for the stage. Use the `aws.apigateway.ClientCertificate` resource to configure a client certificate. Supported only for WebSocket APIs.

[defaultRouteSettings](#defaultroutesettings_yaml) [Property Map](#stagedefaultroutesettings)

Default route settings for the stage.

[deploymentId](#deploymentid_yaml) String

Deployment identifier of the stage. Use the `aws.apigatewayv2.Deployment` resource to configure a deployment.

[description](#description_yaml) String

Description for the stage. Must be less than or equal to 1024 characters in length.

[name](#name_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Name of the stage. Must be between 1 and 128 characters in length.

The following arguments are optional:

[region](#region_yaml) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[routeSettings](#routesettings_yaml) [List<Property Map>](#stageroutesetting)

Route settings for the stage.

[stageVariables](#stagevariables_yaml) Map<String>

Map that defines the stage variables for the stage.

[tags](#tags_yaml) Map<String>

Map of tags to assign to the stage. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

### Outputs[](#outputs)

All [input](#inputs) properties are implicitly available as output properties. Additionally, the Stage resource produces the following output properties:

[Arn](#arn_csharp) string

ARN of the stage.

[ExecutionArn](#executionarn_csharp) string

ARN prefix to be used in an `aws.lambda.Permission`'s `sourceArn` attribute. For WebSocket APIs this attribute can additionally be used in an `aws.iam.Policy` to authorize access to the [`@connections` API](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-how-to-call-websocket-api-connections.html). See the [Amazon API Gateway Developer Guide](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-control-access-iam.html) for details.

[Id](#id_csharp) string

The provider-assigned unique ID for this managed resource.

[InvokeUrl](#invokeurl_csharp) string

URL to invoke the API pointing to the stage, e.g., `wss://z4675bid1j.execute-api.eu-west-2.amazonaws.com/example-stage`, or `https://z4675bid1j.execute-api.eu-west-2.amazonaws.com/`

[TagsAll](#tagsall_csharp) Dictionary<string, string>

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[Arn](#arn_go) string

ARN of the stage.

[ExecutionArn](#executionarn_go) string

ARN prefix to be used in an `aws.lambda.Permission`'s `sourceArn` attribute. For WebSocket APIs this attribute can additionally be used in an `aws.iam.Policy` to authorize access to the [`@connections` API](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-how-to-call-websocket-api-connections.html). See the [Amazon API Gateway Developer Guide](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-control-access-iam.html) for details.

[Id](#id_go) string

The provider-assigned unique ID for this managed resource.

[InvokeUrl](#invokeurl_go) string

URL to invoke the API pointing to the stage, e.g., `wss://z4675bid1j.execute-api.eu-west-2.amazonaws.com/example-stage`, or `https://z4675bid1j.execute-api.eu-west-2.amazonaws.com/`

[TagsAll](#tagsall_go) map\[string\]string

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[arn](#arn_hcl) string

ARN of the stage.

[execution\_arn](#execution_arn_hcl) string

ARN prefix to be used in an `aws.lambda.Permission`'s `sourceArn` attribute. For WebSocket APIs this attribute can additionally be used in an `aws.iam.Policy` to authorize access to the [`@connections` API](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-how-to-call-websocket-api-connections.html). See the [Amazon API Gateway Developer Guide](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-control-access-iam.html) for details.

[id](#id_hcl) string

The provider-assigned unique ID for this managed resource.

[invoke\_url](#invoke_url_hcl) string

URL to invoke the API pointing to the stage, e.g., `wss://z4675bid1j.execute-api.eu-west-2.amazonaws.com/example-stage`, or `https://z4675bid1j.execute-api.eu-west-2.amazonaws.com/`

[tags\_all](#tags_all_hcl) map(string)

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[arn](#arn_java) String

ARN of the stage.

[executionArn](#executionarn_java) String

ARN prefix to be used in an `aws.lambda.Permission`'s `sourceArn` attribute. For WebSocket APIs this attribute can additionally be used in an `aws.iam.Policy` to authorize access to the [`@connections` API](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-how-to-call-websocket-api-connections.html). See the [Amazon API Gateway Developer Guide](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-control-access-iam.html) for details.

[id](#id_java) String

The provider-assigned unique ID for this managed resource.

[invokeUrl](#invokeurl_java) String

URL to invoke the API pointing to the stage, e.g., `wss://z4675bid1j.execute-api.eu-west-2.amazonaws.com/example-stage`, or `https://z4675bid1j.execute-api.eu-west-2.amazonaws.com/`

[tagsAll](#tagsall_java) Map<String,String>

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[arn](#arn_nodejs) string

ARN of the stage.

[executionArn](#executionarn_nodejs) string

ARN prefix to be used in an `aws.lambda.Permission`'s `sourceArn` attribute. For WebSocket APIs this attribute can additionally be used in an `aws.iam.Policy` to authorize access to the [`@connections` API](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-how-to-call-websocket-api-connections.html). See the [Amazon API Gateway Developer Guide](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-control-access-iam.html) for details.

[id](#id_nodejs) string

The provider-assigned unique ID for this managed resource.

[invokeUrl](#invokeurl_nodejs) string

URL to invoke the API pointing to the stage, e.g., `wss://z4675bid1j.execute-api.eu-west-2.amazonaws.com/example-stage`, or `https://z4675bid1j.execute-api.eu-west-2.amazonaws.com/`

[tagsAll](#tagsall_nodejs) {\[key: string\]: string}

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[arn](#arn_python) str

ARN of the stage.

[execution\_arn](#execution_arn_python) str

ARN prefix to be used in an `aws.lambda.Permission`'s `sourceArn` attribute. For WebSocket APIs this attribute can additionally be used in an `aws.iam.Policy` to authorize access to the [`@connections` API](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-how-to-call-websocket-api-connections.html). See the [Amazon API Gateway Developer Guide](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-control-access-iam.html) for details.

[id](#id_python) str

The provider-assigned unique ID for this managed resource.

[invoke\_url](#invoke_url_python) str

URL to invoke the API pointing to the stage, e.g., `wss://z4675bid1j.execute-api.eu-west-2.amazonaws.com/example-stage`, or `https://z4675bid1j.execute-api.eu-west-2.amazonaws.com/`

[tags\_all](#tags_all_python) Mapping\[str, str\]

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[arn](#arn_yaml) String

ARN of the stage.

[executionArn](#executionarn_yaml) String

ARN prefix to be used in an `aws.lambda.Permission`'s `sourceArn` attribute. For WebSocket APIs this attribute can additionally be used in an `aws.iam.Policy` to authorize access to the [`@connections` API](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-how-to-call-websocket-api-connections.html). See the [Amazon API Gateway Developer Guide](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-control-access-iam.html) for details.

[id](#id_yaml) String

The provider-assigned unique ID for this managed resource.

[invokeUrl](#invokeurl_yaml) String

URL to invoke the API pointing to the stage, e.g., `wss://z4675bid1j.execute-api.eu-west-2.amazonaws.com/example-stage`, or `https://z4675bid1j.execute-api.eu-west-2.amazonaws.com/`

[tagsAll](#tagsall_yaml) Map<String>

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

## Look up Existing Stage Resource[](#look-up)

Get an existing Stage resource’s state with the given name, ID, and optional extra properties used to qualify the lookup.

-   TypeScript
-   Python
-   Go
-   C#
-   Java
-   YAML
-   HCL PREVIEW

```typescript
public static get(name: string, id: Input<ID>, state?: StageState, opts?: CustomResourceOptions): Stage
```

```python
@staticmethod
def get(resource_name: str,
        id: str,
        opts: Optional[ResourceOptions] = None,
        access_log_settings: Optional[StageAccessLogSettingsArgs] = None,
        api_id: Optional[str] = None,
        arn: Optional[str] = None,
        auto_deploy: Optional[bool] = None,
        client_certificate_id: Optional[str] = None,
        default_route_settings: Optional[StageDefaultRouteSettingsArgs] = None,
        deployment_id: Optional[str] = None,
        description: Optional[str] = None,
        execution_arn: Optional[str] = None,
        invoke_url: Optional[str] = None,
        name: Optional[str] = None,
        region: Optional[str] = None,
        route_settings: Optional[Sequence[StageRouteSettingArgs]] = None,
        stage_variables: Optional[Mapping[str, str]] = None,
        tags: Optional[Mapping[str, str]] = None,
        tags_all: Optional[Mapping[str, str]] = None) -> Stage
```

```go
func GetStage(ctx *Context, name string, id IDInput, state *StageState, opts ...ResourceOption) (*Stage, error)
```

```csharp
public static Stage Get(string name, Input<string> id, StageState? state, CustomResourceOptions? opts = null)
```

```java
public static Stage get(String name, Output<String> id, StageState state, CustomResourceOptions options)
```

```yaml
resources:  _:    type: aws:apigatewayv2:Stage    get:      id: ${id}
```

```hcl
import {
  to = aws_apigatewayv2_stage.example
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

[AccessLogSettings](#state_accesslogsettings_csharp) [StageAccessLogSettings](#stageaccesslogsettings)

Settings for logging access in this stage. Use the `aws.apigateway.Account` resource to configure [permissions for CloudWatch Logging](https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-logging.html#set-up-access-logging-permissions).

[ApiId](#state_apiid_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

API identifier.

[Arn](#state_arn_csharp) string

ARN of the stage.

[AutoDeploy](#state_autodeploy_csharp) bool

Whether updates to an API automatically trigger a new deployment. Defaults to `false`. Applicable for HTTP APIs.

[ClientCertificateId](#state_clientcertificateid_csharp) string

Identifier of a client certificate for the stage. Use the `aws.apigateway.ClientCertificate` resource to configure a client certificate. Supported only for WebSocket APIs.

[DefaultRouteSettings](#state_defaultroutesettings_csharp) [StageDefaultRouteSettings](#stagedefaultroutesettings)

Default route settings for the stage.

[DeploymentId](#state_deploymentid_csharp) string

Deployment identifier of the stage. Use the `aws.apigatewayv2.Deployment` resource to configure a deployment.

[Description](#state_description_csharp) string

Description for the stage. Must be less than or equal to 1024 characters in length.

[ExecutionArn](#state_executionarn_csharp) string

ARN prefix to be used in an `aws.lambda.Permission`'s `sourceArn` attribute. For WebSocket APIs this attribute can additionally be used in an `aws.iam.Policy` to authorize access to the [`@connections` API](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-how-to-call-websocket-api-connections.html). See the [Amazon API Gateway Developer Guide](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-control-access-iam.html) for details.

[InvokeUrl](#state_invokeurl_csharp) string

URL to invoke the API pointing to the stage, e.g., `wss://z4675bid1j.execute-api.eu-west-2.amazonaws.com/example-stage`, or `https://z4675bid1j.execute-api.eu-west-2.amazonaws.com/`

[Name](#state_name_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Name of the stage. Must be between 1 and 128 characters in length.

The following arguments are optional:

[Region](#state_region_csharp) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[RouteSettings](#state_routesettings_csharp) [List<StageRouteSetting>](#stageroutesetting)

Route settings for the stage.

[StageVariables](#state_stagevariables_csharp) Dictionary<string, string>

Map that defines the stage variables for the stage.

[Tags](#state_tags_csharp) Dictionary<string, string>

Map of tags to assign to the stage. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[TagsAll](#state_tagsall_csharp) Dictionary<string, string>

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[AccessLogSettings](#state_accesslogsettings_go) [StageAccessLogSettingsArgs](#stageaccesslogsettings)

Settings for logging access in this stage. Use the `aws.apigateway.Account` resource to configure [permissions for CloudWatch Logging](https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-logging.html#set-up-access-logging-permissions).

[ApiId](#state_apiid_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

API identifier.

[Arn](#state_arn_go) string

ARN of the stage.

[AutoDeploy](#state_autodeploy_go) bool

Whether updates to an API automatically trigger a new deployment. Defaults to `false`. Applicable for HTTP APIs.

[ClientCertificateId](#state_clientcertificateid_go) string

Identifier of a client certificate for the stage. Use the `aws.apigateway.ClientCertificate` resource to configure a client certificate. Supported only for WebSocket APIs.

[DefaultRouteSettings](#state_defaultroutesettings_go) [StageDefaultRouteSettingsArgs](#stagedefaultroutesettings)

Default route settings for the stage.

[DeploymentId](#state_deploymentid_go) string

Deployment identifier of the stage. Use the `aws.apigatewayv2.Deployment` resource to configure a deployment.

[Description](#state_description_go) string

Description for the stage. Must be less than or equal to 1024 characters in length.

[ExecutionArn](#state_executionarn_go) string

ARN prefix to be used in an `aws.lambda.Permission`'s `sourceArn` attribute. For WebSocket APIs this attribute can additionally be used in an `aws.iam.Policy` to authorize access to the [`@connections` API](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-how-to-call-websocket-api-connections.html). See the [Amazon API Gateway Developer Guide](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-control-access-iam.html) for details.

[InvokeUrl](#state_invokeurl_go) string

URL to invoke the API pointing to the stage, e.g., `wss://z4675bid1j.execute-api.eu-west-2.amazonaws.com/example-stage`, or `https://z4675bid1j.execute-api.eu-west-2.amazonaws.com/`

[Name](#state_name_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Name of the stage. Must be between 1 and 128 characters in length.

The following arguments are optional:

[Region](#state_region_go) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[RouteSettings](#state_routesettings_go) [\[\]StageRouteSettingArgs](#stageroutesetting)

Route settings for the stage.

[StageVariables](#state_stagevariables_go) map\[string\]string

Map that defines the stage variables for the stage.

[Tags](#state_tags_go) map\[string\]string

Map of tags to assign to the stage. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[TagsAll](#state_tagsall_go) map\[string\]string

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[access\_log\_settings](#state_access_log_settings_hcl) [object](#stageaccesslogsettings)

Settings for logging access in this stage. Use the `aws.apigateway.Account` resource to configure [permissions for CloudWatch Logging](https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-logging.html#set-up-access-logging-permissions).

[api\_id](#state_api_id_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

API identifier.

[arn](#state_arn_hcl) string

ARN of the stage.

[auto\_deploy](#state_auto_deploy_hcl) bool

Whether updates to an API automatically trigger a new deployment. Defaults to `false`. Applicable for HTTP APIs.

[client\_certificate\_id](#state_client_certificate_id_hcl) string

Identifier of a client certificate for the stage. Use the `aws.apigateway.ClientCertificate` resource to configure a client certificate. Supported only for WebSocket APIs.

[default\_route\_settings](#state_default_route_settings_hcl) [object](#stagedefaultroutesettings)

Default route settings for the stage.

[deployment\_id](#state_deployment_id_hcl) string

Deployment identifier of the stage. Use the `aws.apigatewayv2.Deployment` resource to configure a deployment.

[description](#state_description_hcl) string

Description for the stage. Must be less than or equal to 1024 characters in length.

[execution\_arn](#state_execution_arn_hcl) string

ARN prefix to be used in an `aws.lambda.Permission`'s `sourceArn` attribute. For WebSocket APIs this attribute can additionally be used in an `aws.iam.Policy` to authorize access to the [`@connections` API](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-how-to-call-websocket-api-connections.html). See the [Amazon API Gateway Developer Guide](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-control-access-iam.html) for details.

[invoke\_url](#state_invoke_url_hcl) string

URL to invoke the API pointing to the stage, e.g., `wss://z4675bid1j.execute-api.eu-west-2.amazonaws.com/example-stage`, or `https://z4675bid1j.execute-api.eu-west-2.amazonaws.com/`

[name](#state_name_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Name of the stage. Must be between 1 and 128 characters in length.

The following arguments are optional:

[region](#state_region_hcl) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[route\_settings](#state_route_settings_hcl) [list(object)](#stageroutesetting)

Route settings for the stage.

[stage\_variables](#state_stage_variables_hcl) map(string)

Map that defines the stage variables for the stage.

[tags](#state_tags_hcl) map(string)

Map of tags to assign to the stage. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tags\_all](#state_tags_all_hcl) map(string)

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[accessLogSettings](#state_accesslogsettings_java) [StageAccessLogSettings](#stageaccesslogsettings)

Settings for logging access in this stage. Use the `aws.apigateway.Account` resource to configure [permissions for CloudWatch Logging](https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-logging.html#set-up-access-logging-permissions).

[apiId](#state_apiid_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

API identifier.

[arn](#state_arn_java) String

ARN of the stage.

[autoDeploy](#state_autodeploy_java) Boolean

Whether updates to an API automatically trigger a new deployment. Defaults to `false`. Applicable for HTTP APIs.

[clientCertificateId](#state_clientcertificateid_java) String

Identifier of a client certificate for the stage. Use the `aws.apigateway.ClientCertificate` resource to configure a client certificate. Supported only for WebSocket APIs.

[defaultRouteSettings](#state_defaultroutesettings_java) [StageDefaultRouteSettings](#stagedefaultroutesettings)

Default route settings for the stage.

[deploymentId](#state_deploymentid_java) String

Deployment identifier of the stage. Use the `aws.apigatewayv2.Deployment` resource to configure a deployment.

[description](#state_description_java) String

Description for the stage. Must be less than or equal to 1024 characters in length.

[executionArn](#state_executionarn_java) String

ARN prefix to be used in an `aws.lambda.Permission`'s `sourceArn` attribute. For WebSocket APIs this attribute can additionally be used in an `aws.iam.Policy` to authorize access to the [`@connections` API](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-how-to-call-websocket-api-connections.html). See the [Amazon API Gateway Developer Guide](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-control-access-iam.html) for details.

[invokeUrl](#state_invokeurl_java) String

URL to invoke the API pointing to the stage, e.g., `wss://z4675bid1j.execute-api.eu-west-2.amazonaws.com/example-stage`, or `https://z4675bid1j.execute-api.eu-west-2.amazonaws.com/`

[name](#state_name_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Name of the stage. Must be between 1 and 128 characters in length.

The following arguments are optional:

[region](#state_region_java) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[routeSettings](#state_routesettings_java) [List<StageRouteSetting>](#stageroutesetting)

Route settings for the stage.

[stageVariables](#state_stagevariables_java) Map<String,String>

Map that defines the stage variables for the stage.

[tags](#state_tags_java) Map<String,String>

Map of tags to assign to the stage. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tagsAll](#state_tagsall_java) Map<String,String>

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[accessLogSettings](#state_accesslogsettings_nodejs) [StageAccessLogSettings](#stageaccesslogsettings)

Settings for logging access in this stage. Use the `aws.apigateway.Account` resource to configure [permissions for CloudWatch Logging](https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-logging.html#set-up-access-logging-permissions).

[apiId](#state_apiid_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

API identifier.

[arn](#state_arn_nodejs) string

ARN of the stage.

[autoDeploy](#state_autodeploy_nodejs) boolean

Whether updates to an API automatically trigger a new deployment. Defaults to `false`. Applicable for HTTP APIs.

[clientCertificateId](#state_clientcertificateid_nodejs) string

Identifier of a client certificate for the stage. Use the `aws.apigateway.ClientCertificate` resource to configure a client certificate. Supported only for WebSocket APIs.

[defaultRouteSettings](#state_defaultroutesettings_nodejs) [StageDefaultRouteSettings](#stagedefaultroutesettings)

Default route settings for the stage.

[deploymentId](#state_deploymentid_nodejs) string

Deployment identifier of the stage. Use the `aws.apigatewayv2.Deployment` resource to configure a deployment.

[description](#state_description_nodejs) string

Description for the stage. Must be less than or equal to 1024 characters in length.

[executionArn](#state_executionarn_nodejs) string

ARN prefix to be used in an `aws.lambda.Permission`'s `sourceArn` attribute. For WebSocket APIs this attribute can additionally be used in an `aws.iam.Policy` to authorize access to the [`@connections` API](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-how-to-call-websocket-api-connections.html). See the [Amazon API Gateway Developer Guide](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-control-access-iam.html) for details.

[invokeUrl](#state_invokeurl_nodejs) string

URL to invoke the API pointing to the stage, e.g., `wss://z4675bid1j.execute-api.eu-west-2.amazonaws.com/example-stage`, or `https://z4675bid1j.execute-api.eu-west-2.amazonaws.com/`

[name](#state_name_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Name of the stage. Must be between 1 and 128 characters in length.

The following arguments are optional:

[region](#state_region_nodejs) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[routeSettings](#state_routesettings_nodejs) [StageRouteSetting\[\]](#stageroutesetting)

Route settings for the stage.

[stageVariables](#state_stagevariables_nodejs) {\[key: string\]: string}

Map that defines the stage variables for the stage.

[tags](#state_tags_nodejs) {\[key: string\]: string}

Map of tags to assign to the stage. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tagsAll](#state_tagsall_nodejs) {\[key: string\]: string}

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[access\_log\_settings](#state_access_log_settings_python) [StageAccessLogSettingsArgs](#stageaccesslogsettings)

Settings for logging access in this stage. Use the `aws.apigateway.Account` resource to configure [permissions for CloudWatch Logging](https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-logging.html#set-up-access-logging-permissions).

[api\_id](#state_api_id_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

API identifier.

[arn](#state_arn_python) str

ARN of the stage.

[auto\_deploy](#state_auto_deploy_python) bool

Whether updates to an API automatically trigger a new deployment. Defaults to `false`. Applicable for HTTP APIs.

[client\_certificate\_id](#state_client_certificate_id_python) str

Identifier of a client certificate for the stage. Use the `aws.apigateway.ClientCertificate` resource to configure a client certificate. Supported only for WebSocket APIs.

[default\_route\_settings](#state_default_route_settings_python) [StageDefaultRouteSettingsArgs](#stagedefaultroutesettings)

Default route settings for the stage.

[deployment\_id](#state_deployment_id_python) str

Deployment identifier of the stage. Use the `aws.apigatewayv2.Deployment` resource to configure a deployment.

[description](#state_description_python) str

Description for the stage. Must be less than or equal to 1024 characters in length.

[execution\_arn](#state_execution_arn_python) str

ARN prefix to be used in an `aws.lambda.Permission`'s `sourceArn` attribute. For WebSocket APIs this attribute can additionally be used in an `aws.iam.Policy` to authorize access to the [`@connections` API](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-how-to-call-websocket-api-connections.html). See the [Amazon API Gateway Developer Guide](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-control-access-iam.html) for details.

[invoke\_url](#state_invoke_url_python) str

URL to invoke the API pointing to the stage, e.g., `wss://z4675bid1j.execute-api.eu-west-2.amazonaws.com/example-stage`, or `https://z4675bid1j.execute-api.eu-west-2.amazonaws.com/`

[name](#state_name_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Name of the stage. Must be between 1 and 128 characters in length.

The following arguments are optional:

[region](#state_region_python) str

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[route\_settings](#state_route_settings_python) [Sequence\[StageRouteSettingArgs\]](#stageroutesetting)

Route settings for the stage.

[stage\_variables](#state_stage_variables_python) Mapping\[str, str\]

Map that defines the stage variables for the stage.

[tags](#state_tags_python) Mapping\[str, str\]

Map of tags to assign to the stage. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tags\_all](#state_tags_all_python) Mapping\[str, str\]

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[accessLogSettings](#state_accesslogsettings_yaml) [Property Map](#stageaccesslogsettings)

Settings for logging access in this stage. Use the `aws.apigateway.Account` resource to configure [permissions for CloudWatch Logging](https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-logging.html#set-up-access-logging-permissions).

[apiId](#state_apiid_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

API identifier.

[arn](#state_arn_yaml) String

ARN of the stage.

[autoDeploy](#state_autodeploy_yaml) Boolean

Whether updates to an API automatically trigger a new deployment. Defaults to `false`. Applicable for HTTP APIs.

[clientCertificateId](#state_clientcertificateid_yaml) String

Identifier of a client certificate for the stage. Use the `aws.apigateway.ClientCertificate` resource to configure a client certificate. Supported only for WebSocket APIs.

[defaultRouteSettings](#state_defaultroutesettings_yaml) [Property Map](#stagedefaultroutesettings)

Default route settings for the stage.

[deploymentId](#state_deploymentid_yaml) String

Deployment identifier of the stage. Use the `aws.apigatewayv2.Deployment` resource to configure a deployment.

[description](#state_description_yaml) String

Description for the stage. Must be less than or equal to 1024 characters in length.

[executionArn](#state_executionarn_yaml) String

ARN prefix to be used in an `aws.lambda.Permission`'s `sourceArn` attribute. For WebSocket APIs this attribute can additionally be used in an `aws.iam.Policy` to authorize access to the [`@connections` API](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-how-to-call-websocket-api-connections.html). See the [Amazon API Gateway Developer Guide](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-control-access-iam.html) for details.

[invokeUrl](#state_invokeurl_yaml) String

URL to invoke the API pointing to the stage, e.g., `wss://z4675bid1j.execute-api.eu-west-2.amazonaws.com/example-stage`, or `https://z4675bid1j.execute-api.eu-west-2.amazonaws.com/`

[name](#state_name_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Name of the stage. Must be between 1 and 128 characters in length.

The following arguments are optional:

[region](#state_region_yaml) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[routeSettings](#state_routesettings_yaml) [List<Property Map>](#stageroutesetting)

Route settings for the stage.

[stageVariables](#state_stagevariables_yaml) Map<String>

Map that defines the stage variables for the stage.

[tags](#state_tags_yaml) Map<String>

Map of tags to assign to the stage. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tagsAll](#state_tagsall_yaml) Map<String>

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

## Supporting Types[](#supporting-types)

#### StageAccessLogSettings

, StageAccessLogSettingsArgs

[](#stageaccesslogsettings)

[DestinationArn](#destinationarn_csharp) This property is required. string

ARN of the CloudWatch Logs log group to receive access logs. Any trailing `:*` is trimmed from the ARN.

[Format](#format_csharp) This property is required. string

Single line [format](https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-logging.html#apigateway-cloudwatch-log-formats) of the access logs of data. Refer to log settings for [HTTP](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-logging-variables.html) or [Websocket](https://docs.aws.amazon.com/apigateway/latest/developerguide/websocket-api-logging.html).

[DestinationArn](#destinationarn_go) This property is required. string

ARN of the CloudWatch Logs log group to receive access logs. Any trailing `:*` is trimmed from the ARN.

[Format](#format_go) This property is required. string

Single line [format](https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-logging.html#apigateway-cloudwatch-log-formats) of the access logs of data. Refer to log settings for [HTTP](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-logging-variables.html) or [Websocket](https://docs.aws.amazon.com/apigateway/latest/developerguide/websocket-api-logging.html).

[destination\_arn](#destination_arn_hcl) This property is required. string

ARN of the CloudWatch Logs log group to receive access logs. Any trailing `:*` is trimmed from the ARN.

[format](#format_hcl) This property is required. string

Single line [format](https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-logging.html#apigateway-cloudwatch-log-formats) of the access logs of data. Refer to log settings for [HTTP](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-logging-variables.html) or [Websocket](https://docs.aws.amazon.com/apigateway/latest/developerguide/websocket-api-logging.html).

[destinationArn](#destinationarn_java) This property is required. String

ARN of the CloudWatch Logs log group to receive access logs. Any trailing `:*` is trimmed from the ARN.

[format](#format_java) This property is required. String

Single line [format](https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-logging.html#apigateway-cloudwatch-log-formats) of the access logs of data. Refer to log settings for [HTTP](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-logging-variables.html) or [Websocket](https://docs.aws.amazon.com/apigateway/latest/developerguide/websocket-api-logging.html).

[destinationArn](#destinationarn_nodejs) This property is required. string

ARN of the CloudWatch Logs log group to receive access logs. Any trailing `:*` is trimmed from the ARN.

[format](#format_nodejs) This property is required. string

Single line [format](https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-logging.html#apigateway-cloudwatch-log-formats) of the access logs of data. Refer to log settings for [HTTP](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-logging-variables.html) or [Websocket](https://docs.aws.amazon.com/apigateway/latest/developerguide/websocket-api-logging.html).

[destination\_arn](#destination_arn_python) This property is required. str

ARN of the CloudWatch Logs log group to receive access logs. Any trailing `:*` is trimmed from the ARN.

[format](#format_python) This property is required. str

Single line [format](https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-logging.html#apigateway-cloudwatch-log-formats) of the access logs of data. Refer to log settings for [HTTP](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-logging-variables.html) or [Websocket](https://docs.aws.amazon.com/apigateway/latest/developerguide/websocket-api-logging.html).

[destinationArn](#destinationarn_yaml) This property is required. String

ARN of the CloudWatch Logs log group to receive access logs. Any trailing `:*` is trimmed from the ARN.

[format](#format_yaml) This property is required. String

Single line [format](https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-logging.html#apigateway-cloudwatch-log-formats) of the access logs of data. Refer to log settings for [HTTP](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-logging-variables.html) or [Websocket](https://docs.aws.amazon.com/apigateway/latest/developerguide/websocket-api-logging.html).

#### StageDefaultRouteSettings

, StageDefaultRouteSettingsArgs

[](#stagedefaultroutesettings)

[DataTraceEnabled](#datatraceenabled_csharp) bool

Whether data trace logging is enabled for the default route. Affects the log entries pushed to Amazon CloudWatch Logs. Defaults to `false`. Supported only for WebSocket APIs.

[DetailedMetricsEnabled](#detailedmetricsenabled_csharp) bool

Whether detailed metrics are enabled for the default route. Defaults to `false`.

[LoggingLevel](#logginglevel_csharp) string

Logging level for the default route. Affects the log entries pushed to Amazon CloudWatch Logs. Valid values: `ERROR`, `INFO`, `OFF`. Defaults to `OFF`. Supported only for WebSocket APIs. This provider will only perform drift detection of its value when present in a configuration.

[ThrottlingBurstLimit](#throttlingburstlimit_csharp) int

Throttling burst limit for the default route.

[ThrottlingRateLimit](#throttlingratelimit_csharp) double

Throttling rate limit for the default route.

[DataTraceEnabled](#datatraceenabled_go) bool

Whether data trace logging is enabled for the default route. Affects the log entries pushed to Amazon CloudWatch Logs. Defaults to `false`. Supported only for WebSocket APIs.

[DetailedMetricsEnabled](#detailedmetricsenabled_go) bool

Whether detailed metrics are enabled for the default route. Defaults to `false`.

[LoggingLevel](#logginglevel_go) string

Logging level for the default route. Affects the log entries pushed to Amazon CloudWatch Logs. Valid values: `ERROR`, `INFO`, `OFF`. Defaults to `OFF`. Supported only for WebSocket APIs. This provider will only perform drift detection of its value when present in a configuration.

[ThrottlingBurstLimit](#throttlingburstlimit_go) int

Throttling burst limit for the default route.

[ThrottlingRateLimit](#throttlingratelimit_go) float64

Throttling rate limit for the default route.

[data\_trace\_enabled](#data_trace_enabled_hcl) bool

Whether data trace logging is enabled for the default route. Affects the log entries pushed to Amazon CloudWatch Logs. Defaults to `false`. Supported only for WebSocket APIs.

[detailed\_metrics\_enabled](#detailed_metrics_enabled_hcl) bool

Whether detailed metrics are enabled for the default route. Defaults to `false`.

[logging\_level](#logging_level_hcl) string

Logging level for the default route. Affects the log entries pushed to Amazon CloudWatch Logs. Valid values: `ERROR`, `INFO`, `OFF`. Defaults to `OFF`. Supported only for WebSocket APIs. This provider will only perform drift detection of its value when present in a configuration.

[throttling\_burst\_limit](#throttling_burst_limit_hcl) number

Throttling burst limit for the default route.

[throttling\_rate\_limit](#throttling_rate_limit_hcl) number

Throttling rate limit for the default route.

[dataTraceEnabled](#datatraceenabled_java) Boolean

Whether data trace logging is enabled for the default route. Affects the log entries pushed to Amazon CloudWatch Logs. Defaults to `false`. Supported only for WebSocket APIs.

[detailedMetricsEnabled](#detailedmetricsenabled_java) Boolean

Whether detailed metrics are enabled for the default route. Defaults to `false`.

[loggingLevel](#logginglevel_java) String

Logging level for the default route. Affects the log entries pushed to Amazon CloudWatch Logs. Valid values: `ERROR`, `INFO`, `OFF`. Defaults to `OFF`. Supported only for WebSocket APIs. This provider will only perform drift detection of its value when present in a configuration.

[throttlingBurstLimit](#throttlingburstlimit_java) Integer

Throttling burst limit for the default route.

[throttlingRateLimit](#throttlingratelimit_java) Double

Throttling rate limit for the default route.

[dataTraceEnabled](#datatraceenabled_nodejs) boolean

Whether data trace logging is enabled for the default route. Affects the log entries pushed to Amazon CloudWatch Logs. Defaults to `false`. Supported only for WebSocket APIs.

[detailedMetricsEnabled](#detailedmetricsenabled_nodejs) boolean

Whether detailed metrics are enabled for the default route. Defaults to `false`.

[loggingLevel](#logginglevel_nodejs) string

Logging level for the default route. Affects the log entries pushed to Amazon CloudWatch Logs. Valid values: `ERROR`, `INFO`, `OFF`. Defaults to `OFF`. Supported only for WebSocket APIs. This provider will only perform drift detection of its value when present in a configuration.

[throttlingBurstLimit](#throttlingburstlimit_nodejs) number

Throttling burst limit for the default route.

[throttlingRateLimit](#throttlingratelimit_nodejs) number

Throttling rate limit for the default route.

[data\_trace\_enabled](#data_trace_enabled_python) bool

Whether data trace logging is enabled for the default route. Affects the log entries pushed to Amazon CloudWatch Logs. Defaults to `false`. Supported only for WebSocket APIs.

[detailed\_metrics\_enabled](#detailed_metrics_enabled_python) bool

Whether detailed metrics are enabled for the default route. Defaults to `false`.

[logging\_level](#logging_level_python) str

Logging level for the default route. Affects the log entries pushed to Amazon CloudWatch Logs. Valid values: `ERROR`, `INFO`, `OFF`. Defaults to `OFF`. Supported only for WebSocket APIs. This provider will only perform drift detection of its value when present in a configuration.

[throttling\_burst\_limit](#throttling_burst_limit_python) int

Throttling burst limit for the default route.

[throttling\_rate\_limit](#throttling_rate_limit_python) float

Throttling rate limit for the default route.

[dataTraceEnabled](#datatraceenabled_yaml) Boolean

Whether data trace logging is enabled for the default route. Affects the log entries pushed to Amazon CloudWatch Logs. Defaults to `false`. Supported only for WebSocket APIs.

[detailedMetricsEnabled](#detailedmetricsenabled_yaml) Boolean

Whether detailed metrics are enabled for the default route. Defaults to `false`.

[loggingLevel](#logginglevel_yaml) String

Logging level for the default route. Affects the log entries pushed to Amazon CloudWatch Logs. Valid values: `ERROR`, `INFO`, `OFF`. Defaults to `OFF`. Supported only for WebSocket APIs. This provider will only perform drift detection of its value when present in a configuration.

[throttlingBurstLimit](#throttlingburstlimit_yaml) Number

Throttling burst limit for the default route.

[throttlingRateLimit](#throttlingratelimit_yaml) Number

Throttling rate limit for the default route.

#### StageRouteSetting

, StageRouteSettingArgs

[](#stageroutesetting)

[RouteKey](#routekey_csharp) This property is required. string

Route key.

[DataTraceEnabled](#datatraceenabled_csharp) bool

Whether data trace logging is enabled for the route. Affects the log entries pushed to Amazon CloudWatch Logs. Defaults to `false`. Supported only for WebSocket APIs.

[DetailedMetricsEnabled](#detailedmetricsenabled_csharp) bool

Whether detailed metrics are enabled for the route. Defaults to `false`.

[LoggingLevel](#logginglevel_csharp) string

Logging level for the route. Affects the log entries pushed to Amazon CloudWatch Logs. Valid values: `ERROR`, `INFO`, `OFF`. Defaults to `OFF`. Supported only for WebSocket APIs. This provider will only perform drift detection of its value when present in a configuration.

[ThrottlingBurstLimit](#throttlingburstlimit_csharp) int

Throttling burst limit for the route.

[ThrottlingRateLimit](#throttlingratelimit_csharp) double

Throttling rate limit for the route.

[RouteKey](#routekey_go) This property is required. string

Route key.

[DataTraceEnabled](#datatraceenabled_go) bool

Whether data trace logging is enabled for the route. Affects the log entries pushed to Amazon CloudWatch Logs. Defaults to `false`. Supported only for WebSocket APIs.

[DetailedMetricsEnabled](#detailedmetricsenabled_go) bool

Whether detailed metrics are enabled for the route. Defaults to `false`.

[LoggingLevel](#logginglevel_go) string

Logging level for the route. Affects the log entries pushed to Amazon CloudWatch Logs. Valid values: `ERROR`, `INFO`, `OFF`. Defaults to `OFF`. Supported only for WebSocket APIs. This provider will only perform drift detection of its value when present in a configuration.

[ThrottlingBurstLimit](#throttlingburstlimit_go) int

Throttling burst limit for the route.

[ThrottlingRateLimit](#throttlingratelimit_go) float64

Throttling rate limit for the route.

[route\_key](#route_key_hcl) This property is required. string

Route key.

[data\_trace\_enabled](#data_trace_enabled_hcl) bool

Whether data trace logging is enabled for the route. Affects the log entries pushed to Amazon CloudWatch Logs. Defaults to `false`. Supported only for WebSocket APIs.

[detailed\_metrics\_enabled](#detailed_metrics_enabled_hcl) bool

Whether detailed metrics are enabled for the route. Defaults to `false`.

[logging\_level](#logging_level_hcl) string

Logging level for the route. Affects the log entries pushed to Amazon CloudWatch Logs. Valid values: `ERROR`, `INFO`, `OFF`. Defaults to `OFF`. Supported only for WebSocket APIs. This provider will only perform drift detection of its value when present in a configuration.

[throttling\_burst\_limit](#throttling_burst_limit_hcl) number

Throttling burst limit for the route.

[throttling\_rate\_limit](#throttling_rate_limit_hcl) number

Throttling rate limit for the route.

[routeKey](#routekey_java) This property is required. String

Route key.

[dataTraceEnabled](#datatraceenabled_java) Boolean

Whether data trace logging is enabled for the route. Affects the log entries pushed to Amazon CloudWatch Logs. Defaults to `false`. Supported only for WebSocket APIs.

[detailedMetricsEnabled](#detailedmetricsenabled_java) Boolean

Whether detailed metrics are enabled for the route. Defaults to `false`.

[loggingLevel](#logginglevel_java) String

Logging level for the route. Affects the log entries pushed to Amazon CloudWatch Logs. Valid values: `ERROR`, `INFO`, `OFF`. Defaults to `OFF`. Supported only for WebSocket APIs. This provider will only perform drift detection of its value when present in a configuration.

[throttlingBurstLimit](#throttlingburstlimit_java) Integer

Throttling burst limit for the route.

[throttlingRateLimit](#throttlingratelimit_java) Double

Throttling rate limit for the route.

[routeKey](#routekey_nodejs) This property is required. string

Route key.

[dataTraceEnabled](#datatraceenabled_nodejs) boolean

Whether data trace logging is enabled for the route. Affects the log entries pushed to Amazon CloudWatch Logs. Defaults to `false`. Supported only for WebSocket APIs.

[detailedMetricsEnabled](#detailedmetricsenabled_nodejs) boolean

Whether detailed metrics are enabled for the route. Defaults to `false`.

[loggingLevel](#logginglevel_nodejs) string

Logging level for the route. Affects the log entries pushed to Amazon CloudWatch Logs. Valid values: `ERROR`, `INFO`, `OFF`. Defaults to `OFF`. Supported only for WebSocket APIs. This provider will only perform drift detection of its value when present in a configuration.

[throttlingBurstLimit](#throttlingburstlimit_nodejs) number

Throttling burst limit for the route.

[throttlingRateLimit](#throttlingratelimit_nodejs) number

Throttling rate limit for the route.

[route\_key](#route_key_python) This property is required. str

Route key.

[data\_trace\_enabled](#data_trace_enabled_python) bool

Whether data trace logging is enabled for the route. Affects the log entries pushed to Amazon CloudWatch Logs. Defaults to `false`. Supported only for WebSocket APIs.

[detailed\_metrics\_enabled](#detailed_metrics_enabled_python) bool

Whether detailed metrics are enabled for the route. Defaults to `false`.

[logging\_level](#logging_level_python) str

Logging level for the route. Affects the log entries pushed to Amazon CloudWatch Logs. Valid values: `ERROR`, `INFO`, `OFF`. Defaults to `OFF`. Supported only for WebSocket APIs. This provider will only perform drift detection of its value when present in a configuration.

[throttling\_burst\_limit](#throttling_burst_limit_python) int

Throttling burst limit for the route.

[throttling\_rate\_limit](#throttling_rate_limit_python) float

Throttling rate limit for the route.

[routeKey](#routekey_yaml) This property is required. String

Route key.

[dataTraceEnabled](#datatraceenabled_yaml) Boolean

Whether data trace logging is enabled for the route. Affects the log entries pushed to Amazon CloudWatch Logs. Defaults to `false`. Supported only for WebSocket APIs.

[detailedMetricsEnabled](#detailedmetricsenabled_yaml) Boolean

Whether detailed metrics are enabled for the route. Defaults to `false`.

[loggingLevel](#logginglevel_yaml) String

Logging level for the route. Affects the log entries pushed to Amazon CloudWatch Logs. Valid values: `ERROR`, `INFO`, `OFF`. Defaults to `OFF`. Supported only for WebSocket APIs. This provider will only perform drift detection of its value when present in a configuration.

[throttlingBurstLimit](#throttlingburstlimit_yaml) Number

Throttling burst limit for the route.

[throttlingRateLimit](#throttlingratelimit_yaml) Number

Throttling rate limit for the route.

## Import[](#import)

Using `pulumi import`, import `aws.apigatewayv2.Stage` using the API identifier and stage name. For example:

```bash
$ pulumi import aws:apigatewayv2/stage:Stage example aabbccddee/example-stage
```

> **Note:** The API Gateway managed stage created as part of [*quick\_create*](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-basic-concept.html#apigateway-definition-quick-create) cannot be imported.

To learn more about importing existing cloud resources, see [Importing resources](/docs/using-pulumi/adopting-pulumi/import/).

## Package Details[](#package-details)

Repository

[AWS Classic pulumi/pulumi-aws](https://github.com/pulumi/pulumi-aws)

License

Apache-2.0

Notes

This Pulumi package is based on the [`aws` Terraform Provider](https://github.com/hashicorp/terraform-provider-aws).

-   Copy Page

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2fapigatewayv2%2fstage]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2fapigatewayv2%2fstage%2f\))

#### Try Pulumi Cloud free.
Your team will thank you.

[Start free trial](https://app.pulumi.com/signup?utm_source=registry&utm_medium=right-rail-banner&utm_campaign=try-pulumi-cloud&iaid=docs-try-pulumi-cloud-ad)
