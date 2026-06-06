---
Source: https://www.pulumi.com/registry/packages/aws/api-docs/cloudwatch/dashboard/
Generated: 2026-06-06
Updated: 2026-06-06
---

# aws.cloudwatch.Dashboard

1.  [Packages](/registry/)
2.  [Packages](/registry/packages/)
3.  [AWS](/registry/packages/aws/)
4.  [API Docs](/registry/packages/aws/api-docs/)
5.  [cloudwatch](/registry/packages/aws/api-docs/cloudwatch/)
6.  [Dashboard](/registry/packages/aws/api-docs/cloudwatch/dashboard/)

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

Viewing docs for AWS v7.32.0
published on Friday, May 29, 2026 by Pulumi

[Schema (JSON)](/registry/packages/aws/schema.json)

[pulumi/pulumi-aws](https://github.com/pulumi/pulumi-aws)

v7.32.0 (7.x, latest)v6.83.1 (6.x)v5.43.0 (5.x)

# aws.cloudwatch.Dashboard

Explore with Neo

-   Copy Page

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2fcloudwatch%2fdashboard]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2fcloudwatch%2fdashboard%2f\))

Provides a CloudWatch Dashboard resource.

## Example Usage

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

const main = new aws.cloudwatch.Dashboard("main", {
    dashboardName: "my-dashboard",
    dashboardBody: JSON.stringify({
        widgets: [
            {
                type: "metric",
                x: 0,
                y: 0,
                width: 12,
                height: 6,
                properties: {
                    metrics: [[
                        "AWS/EC2",
                        "CPUUtilization",
                        "InstanceId",
                        "i-012345",
                    ]],
                    period: 300,
                    stat: "Average",
                    region: "us-east-1",
                    title: "EC2 Instance CPU",
                },
            },
            {
                type: "text",
                x: 0,
                y: 7,
                width: 3,
                height: 3,
                properties: {
                    markdown: "Hello world",
                },
            },
        ],
    }),
});
```

```python
import pulumi
import json
import pulumi_aws as aws

main = aws.cloudwatch.Dashboard("main",
    dashboard_name="my-dashboard",
    dashboard_body=json.dumps({
        "widgets": [
            {
                "type": "metric",
                "x": 0,
                "y": 0,
                "width": 12,
                "height": 6,
                "properties": {
                    "metrics": [[
                        "AWS/EC2",
                        "CPUUtilization",
                        "InstanceId",
                        "i-012345",
                    ]],
                    "period": 300,
                    "stat": "Average",
                    "region": "us-east-1",
                    "title": "EC2 Instance CPU",
                },
            },
            {
                "type": "text",
                "x": 0,
                "y": 7,
                "width": 3,
                "height": 3,
                "properties": {
                    "markdown": "Hello world",
                },
            },
        ],
    }))
```

```go
package main

import (
	"encoding/json"

	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/cloudwatch"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		tmpJSON0, err := json.Marshal(map[string]interface{}{
			"widgets": []interface{}{
				map[string]interface{}{
					"type":   "metric",
					"x":      0,
					"y":      0,
					"width":  12,
					"height": 6,
					"properties": map[string]interface{}{
						"metrics": [][]string{
							[]string{
								"AWS/EC2",
								"CPUUtilization",
								"InstanceId",
								"i-012345",
							},
						},
						"period": 300,
						"stat":   "Average",
						"region": "us-east-1",
						"title":  "EC2 Instance CPU",
					},
				},
				map[string]interface{}{
					"type":   "text",
					"x":      0,
					"y":      7,
					"width":  3,
					"height": 3,
					"properties": map[string]interface{}{
						"markdown": "Hello world",
					},
				},
			},
		})
		if err != nil {
			return err
		}
		json0 := string(tmpJSON0)
		_, err = cloudwatch.NewDashboard(ctx, "main", &cloudwatch.DashboardArgs{
			DashboardName: pulumi.String("my-dashboard"),
			DashboardBody: pulumi.String(pulumi.String(json0)),
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
    var main = new Aws.CloudWatch.Dashboard("main", new()
    {
        DashboardName = "my-dashboard",
        DashboardBody = JsonSerializer.Serialize(new Dictionary<string, object?>
        {
            ["widgets"] = new[]
            {
                new Dictionary<string, object?>
                {
                    ["type"] = "metric",
                    ["x"] = 0,
                    ["y"] = 0,
                    ["width"] = 12,
                    ["height"] = 6,
                    ["properties"] = new Dictionary<string, object?>
                    {
                        ["metrics"] = new[]
                        {
                            new[]
                            {
                                "AWS/EC2",
                                "CPUUtilization",
                                "InstanceId",
                                "i-012345",
                            },
                        },
                        ["period"] = 300,
                        ["stat"] = "Average",
                        ["region"] = "us-east-1",
                        ["title"] = "EC2 Instance CPU",
                    },
                },
                new Dictionary<string, object?>
                {
                    ["type"] = "text",
                    ["x"] = 0,
                    ["y"] = 7,
                    ["width"] = 3,
                    ["height"] = 3,
                    ["properties"] = new Dictionary<string, object?>
                    {
                        ["markdown"] = "Hello world",
                    },
                },
            },
        }),
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.cloudwatch.Dashboard;
import com.pulumi.aws.cloudwatch.DashboardArgs;
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
        var main = new Dashboard("main", DashboardArgs.builder()
            .dashboardName("my-dashboard")
            .dashboardBody(serializeJson(
                jsonObject(
                    jsonProperty("widgets", jsonArray(
                        jsonObject(
                            jsonProperty("type", "metric"),
                            jsonProperty("x", 0),
                            jsonProperty("y", 0),
                            jsonProperty("width", 12),
                            jsonProperty("height", 6),
                            jsonProperty("properties", jsonObject(
                                jsonProperty("metrics", jsonArray(jsonArray(
                                    "AWS/EC2",
                                    "CPUUtilization",
                                    "InstanceId",
                                    "i-012345"
                                ))),
                                jsonProperty("period", 300),
                                jsonProperty("stat", "Average"),
                                jsonProperty("region", "us-east-1"),
                                jsonProperty("title", "EC2 Instance CPU")
                            ))
                        ),
                        jsonObject(
                            jsonProperty("type", "text"),
                            jsonProperty("x", 0),
                            jsonProperty("y", 7),
                            jsonProperty("width", 3),
                            jsonProperty("height", 3),
                            jsonProperty("properties", jsonObject(
                                jsonProperty("markdown", "Hello world")
                            ))
                        )
                    ))
                )))
            .build());

    }
}
```

```yaml
resources:
  main:
    type: aws:cloudwatch:Dashboard
    properties:
      dashboardName: my-dashboard
      dashboardBody:
        fn::toJSON:
          widgets:
            - type: metric
              x: 0
              y: 0
              width: 12
              height: 6
              properties:
                metrics:
                  - - AWS/EC2
                    - CPUUtilization
                    - InstanceId
                    - i-012345
                period: 300
                stat: Average
                region: us-east-1
                title: EC2 Instance CPU
            - type: text
              x: 0
              y: 7
              width: 3
              height: 3
              properties:
                markdown: Hello world
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "my-dashboard"
  dashboard_body = jsonencode({
    "widgets" = [{
      "type"   = "metric"
      "x"      = 0
      "y"      = 0
      "width"  = 12
      "height" = 6
      "properties" = {
        "metrics" = [["AWS/EC2", "CPUUtilization", "InstanceId", "i-012345"]]
        "period"  = 300
        "stat"    = "Average"
        "region"  = "us-east-1"
        "title"   = "EC2 Instance CPU"
      }
      }, {
      "type"   = "text"
      "x"      = 0
      "y"      = 7
      "width"  = 3
      "height" = 3
      "properties" = {
        "markdown" = "Hello world"
      }
    }]
  })
}
```

## Create Dashboard Resource

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
new Dashboard(name: string, args: DashboardArgs, opts?: CustomResourceOptions);
```

```python
@overload
def Dashboard(resource_name: str,
              args: DashboardArgs,
              opts: Optional[ResourceOptions] = None)

@overload
def Dashboard(resource_name: str,
              opts: Optional[ResourceOptions] = None,
              dashboard_body: Optional[str] = None,
              dashboard_name: Optional[str] = None,
              region: Optional[str] = None)
```

```go
func NewDashboard(ctx *Context, name string, args DashboardArgs, opts ...ResourceOption) (*Dashboard, error)
```

```csharp
public Dashboard(string name, DashboardArgs args, CustomResourceOptions? opts = null)
```

```java
public Dashboard(String name, DashboardArgs args)
public Dashboard(String name, DashboardArgs args, CustomResourceOptions options)
```

```yaml
type: aws:cloudwatch:Dashboard
properties: # The arguments to resource properties.
options: # Bag of options to control resource's behavior.
```

```hcl
resource "aws_cloudwatch_dashboard" "name" {
    # resource properties
}
```

#### Parameters

name This property is required. string

The unique name of the resource.

args This property is required. [DashboardArgs](#inputs)

The arguments to resource properties.

opts [CustomResourceOptions](/docs/reference/pkg/nodejs/pulumi/pulumi/#CustomResourceOptions)

Bag of options to control resource's behavior.

resource\_name This property is required. str

The unique name of the resource.

args This property is required. [DashboardArgs](#inputs)

The arguments to resource properties.

opts [ResourceOptions](/docs/reference/pkg/python/pulumi/#pulumi.ResourceOptions)

Bag of options to control resource's behavior.

ctx [Context](https://pkg.go.dev/github.com/pulumi/pulumi/sdk/v3/go/pulumi?tab=doc#Context)

Context object for the current deployment.

name This property is required. string

The unique name of the resource.

args This property is required. [DashboardArgs](#inputs)

The arguments to resource properties.

opts [ResourceOption](https://pkg.go.dev/github.com/pulumi/pulumi/sdk/v3/go/pulumi?tab=doc#ResourceOption)

Bag of options to control resource's behavior.

name This property is required. string

The unique name of the resource.

args This property is required. [DashboardArgs](#inputs)

The arguments to resource properties.

opts [CustomResourceOptions](/docs/reference/pkg/dotnet/Pulumi/Pulumi.CustomResourceOptions.html)

Bag of options to control resource's behavior.

name This property is required. String

The unique name of the resource.

args This property is required. [DashboardArgs](#inputs)

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
var dashboardResource = new Aws.CloudWatch.Dashboard("dashboardResource", new()
{
    DashboardBody = "string",
    DashboardName = "string",
    Region = "string",
});
```

```go
example, err := cloudwatch.NewDashboard(ctx, "dashboardResource", &cloudwatch.DashboardArgs{
	DashboardBody: pulumi.String("string"),
	DashboardName: pulumi.String("string"),
	Region:        pulumi.String("string"),
})
```

```hcl
resource "aws_cloudwatch_dashboard" "dashboardResource" {
  dashboard_body = "string"
  dashboard_name = "string"
  region         = "string"
}
```

```java
var dashboardResource = new com.pulumi.aws.cloudwatch.Dashboard("dashboardResource", com.pulumi.aws.cloudwatch.DashboardArgs.builder()
    .dashboardBody("string")
    .dashboardName("string")
    .region("string")
    .build());
```

```python
dashboard_resource = aws.cloudwatch.Dashboard("dashboardResource",
    dashboard_body="string",
    dashboard_name="string",
    region="string")
```

```typescript
const dashboardResource = new aws.cloudwatch.Dashboard("dashboardResource", {
    dashboardBody: "string",
    dashboardName: "string",
    region: "string",
});
```

```yaml
type: aws:cloudwatch:Dashboard
properties:
    dashboardBody: string
    dashboardName: string
    region: string
```

## Dashboard Resource Properties

To learn more about resource properties and how to use them, see [Inputs and Outputs](/docs/intro/concepts/inputs-outputs) in the Architecture and Concepts docs.

### Inputs

In Python, inputs that are objects can be passed either as [argument classes or as dictionary literals](/docs/languages-sdks/python/#inputs-and-outputs).

The Dashboard resource accepts the following [input](/docs/intro/concepts/inputs-outputs) properties:

[DashboardBody](#dashboardbody_csharp) This property is required. string

The detailed information about the dashboard, including what widgets are included and their location on the dashboard. You can read more about the body structure in the [documentation](https://docs.aws.amazon.com/AmazonCloudWatch/latest/APIReference/CloudWatch-Dashboard-Body-Structure.html).

[DashboardName](#dashboardname_csharp)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

The name of the dashboard.

[Region](#region_csharp) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[DashboardBody](#dashboardbody_go) This property is required. string

The detailed information about the dashboard, including what widgets are included and their location on the dashboard. You can read more about the body structure in the [documentation](https://docs.aws.amazon.com/AmazonCloudWatch/latest/APIReference/CloudWatch-Dashboard-Body-Structure.html).

[DashboardName](#dashboardname_go)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

The name of the dashboard.

[Region](#region_go) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[dashboard\_body](#dashboard_body_hcl) This property is required. string

The detailed information about the dashboard, including what widgets are included and their location on the dashboard. You can read more about the body structure in the [documentation](https://docs.aws.amazon.com/AmazonCloudWatch/latest/APIReference/CloudWatch-Dashboard-Body-Structure.html).

[dashboard\_name](#dashboard_name_hcl)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

The name of the dashboard.

[region](#region_hcl) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[dashboardBody](#dashboardbody_java) This property is required. String

The detailed information about the dashboard, including what widgets are included and their location on the dashboard. You can read more about the body structure in the [documentation](https://docs.aws.amazon.com/AmazonCloudWatch/latest/APIReference/CloudWatch-Dashboard-Body-Structure.html).

[dashboardName](#dashboardname_java)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

String

The name of the dashboard.

[region](#region_java) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[dashboardBody](#dashboardbody_nodejs) This property is required. string

The detailed information about the dashboard, including what widgets are included and their location on the dashboard. You can read more about the body structure in the [documentation](https://docs.aws.amazon.com/AmazonCloudWatch/latest/APIReference/CloudWatch-Dashboard-Body-Structure.html).

[dashboardName](#dashboardname_nodejs)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

The name of the dashboard.

[region](#region_nodejs) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[dashboard\_body](#dashboard_body_python) This property is required. str

The detailed information about the dashboard, including what widgets are included and their location on the dashboard. You can read more about the body structure in the [documentation](https://docs.aws.amazon.com/AmazonCloudWatch/latest/APIReference/CloudWatch-Dashboard-Body-Structure.html).

[dashboard\_name](#dashboard_name_python)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

str

The name of the dashboard.

[region](#region_python) str

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[dashboardBody](#dashboardbody_yaml) This property is required. String

The detailed information about the dashboard, including what widgets are included and their location on the dashboard. You can read more about the body structure in the [documentation](https://docs.aws.amazon.com/AmazonCloudWatch/latest/APIReference/CloudWatch-Dashboard-Body-Structure.html).

[dashboardName](#dashboardname_yaml)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

String

The name of the dashboard.

[region](#region_yaml) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

### Outputs

All [input](#inputs) properties are implicitly available as output properties. Additionally, the Dashboard resource produces the following output properties:

[DashboardArn](#dashboardarn_csharp) string

The Amazon Resource Name (ARN) of the dashboard.

[Id](#id_csharp) string

The provider-assigned unique ID for this managed resource.

[DashboardArn](#dashboardarn_go) string

The Amazon Resource Name (ARN) of the dashboard.

[Id](#id_go) string

The provider-assigned unique ID for this managed resource.

[dashboard\_arn](#dashboard_arn_hcl) string

The Amazon Resource Name (ARN) of the dashboard.

[id](#id_hcl) string

The provider-assigned unique ID for this managed resource.

[dashboardArn](#dashboardarn_java) String

The Amazon Resource Name (ARN) of the dashboard.

[id](#id_java) String

The provider-assigned unique ID for this managed resource.

[dashboardArn](#dashboardarn_nodejs) string

The Amazon Resource Name (ARN) of the dashboard.

[id](#id_nodejs) string

The provider-assigned unique ID for this managed resource.

[dashboard\_arn](#dashboard_arn_python) str

The Amazon Resource Name (ARN) of the dashboard.

[id](#id_python) str

The provider-assigned unique ID for this managed resource.

[dashboardArn](#dashboardarn_yaml) String

The Amazon Resource Name (ARN) of the dashboard.

[id](#id_yaml) String

The provider-assigned unique ID for this managed resource.

## Look up Existing Dashboard Resource

Get an existing Dashboard resource’s state with the given name, ID, and optional extra properties used to qualify the lookup.

-   TypeScript
-   Python
-   Go
-   C#
-   Java
-   YAML
-   HCL PREVIEW

```typescript
public static get(name: string, id: Input<ID>, state?: DashboardState, opts?: CustomResourceOptions): Dashboard
```

```python
@staticmethod
def get(resource_name: str,
        id: str,
        opts: Optional[ResourceOptions] = None,
        dashboard_arn: Optional[str] = None,
        dashboard_body: Optional[str] = None,
        dashboard_name: Optional[str] = None,
        region: Optional[str] = None) -> Dashboard
```

```go
func GetDashboard(ctx *Context, name string, id IDInput, state *DashboardState, opts ...ResourceOption) (*Dashboard, error)
```

```csharp
public static Dashboard Get(string name, Input<string> id, DashboardState? state, CustomResourceOptions? opts = null)
```

```java
public static Dashboard get(String name, Output<String> id, DashboardState state, CustomResourceOptions options)
```

```yaml
resources:  _:    type: aws:cloudwatch:Dashboard    get:      id: ${id}
```

```hcl
import {
  to = aws_cloudwatch_dashboard.example
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

[DashboardArn](#state_dashboardarn_csharp) string

The Amazon Resource Name (ARN) of the dashboard.

[DashboardBody](#state_dashboardbody_csharp) string

The detailed information about the dashboard, including what widgets are included and their location on the dashboard. You can read more about the body structure in the [documentation](https://docs.aws.amazon.com/AmazonCloudWatch/latest/APIReference/CloudWatch-Dashboard-Body-Structure.html).

[DashboardName](#state_dashboardname_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

The name of the dashboard.

[Region](#state_region_csharp) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[DashboardArn](#state_dashboardarn_go) string

The Amazon Resource Name (ARN) of the dashboard.

[DashboardBody](#state_dashboardbody_go) string

The detailed information about the dashboard, including what widgets are included and their location on the dashboard. You can read more about the body structure in the [documentation](https://docs.aws.amazon.com/AmazonCloudWatch/latest/APIReference/CloudWatch-Dashboard-Body-Structure.html).

[DashboardName](#state_dashboardname_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

The name of the dashboard.

[Region](#state_region_go) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[dashboard\_arn](#state_dashboard_arn_hcl) string

The Amazon Resource Name (ARN) of the dashboard.

[dashboard\_body](#state_dashboard_body_hcl) string

The detailed information about the dashboard, including what widgets are included and their location on the dashboard. You can read more about the body structure in the [documentation](https://docs.aws.amazon.com/AmazonCloudWatch/latest/APIReference/CloudWatch-Dashboard-Body-Structure.html).

[dashboard\_name](#state_dashboard_name_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

The name of the dashboard.

[region](#state_region_hcl) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[dashboardArn](#state_dashboardarn_java) String

The Amazon Resource Name (ARN) of the dashboard.

[dashboardBody](#state_dashboardbody_java) String

The detailed information about the dashboard, including what widgets are included and their location on the dashboard. You can read more about the body structure in the [documentation](https://docs.aws.amazon.com/AmazonCloudWatch/latest/APIReference/CloudWatch-Dashboard-Body-Structure.html).

[dashboardName](#state_dashboardname_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

The name of the dashboard.

[region](#state_region_java) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[dashboardArn](#state_dashboardarn_nodejs) string

The Amazon Resource Name (ARN) of the dashboard.

[dashboardBody](#state_dashboardbody_nodejs) string

The detailed information about the dashboard, including what widgets are included and their location on the dashboard. You can read more about the body structure in the [documentation](https://docs.aws.amazon.com/AmazonCloudWatch/latest/APIReference/CloudWatch-Dashboard-Body-Structure.html).

[dashboardName](#state_dashboardname_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

The name of the dashboard.

[region](#state_region_nodejs) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[dashboard\_arn](#state_dashboard_arn_python) str

The Amazon Resource Name (ARN) of the dashboard.

[dashboard\_body](#state_dashboard_body_python) str

The detailed information about the dashboard, including what widgets are included and their location on the dashboard. You can read more about the body structure in the [documentation](https://docs.aws.amazon.com/AmazonCloudWatch/latest/APIReference/CloudWatch-Dashboard-Body-Structure.html).

[dashboard\_name](#state_dashboard_name_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

The name of the dashboard.

[region](#state_region_python) str

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[dashboardArn](#state_dashboardarn_yaml) String

The Amazon Resource Name (ARN) of the dashboard.

[dashboardBody](#state_dashboardbody_yaml) String

The detailed information about the dashboard, including what widgets are included and their location on the dashboard. You can read more about the body structure in the [documentation](https://docs.aws.amazon.com/AmazonCloudWatch/latest/APIReference/CloudWatch-Dashboard-Body-Structure.html).

[dashboardName](#state_dashboardname_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

The name of the dashboard.

[region](#state_region_yaml) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

## Import

Using `pulumi import`, import CloudWatch dashboards using the `dashboardName`. For example:

```bash
$ pulumi import aws:cloudwatch/dashboard:Dashboard sample dashboard_name
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

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2fcloudwatch%2fdashboard]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2fcloudwatch%2fdashboard%2f\))

#### Try Pulumi Cloud free.
Your team will thank you.

[Start free trial](https://app.pulumi.com/signup?utm_source=registry&utm_medium=right-rail-banner&utm_campaign=try-pulumi-cloud&iaid=docs-try-pulumi-cloud-ad)
