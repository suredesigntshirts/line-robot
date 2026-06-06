---
Source: https://www.pulumi.com/registry/packages/aws/api-docs/apigatewayv2/deployment/
Generated: 2026-06-06
Updated: 2026-06-06
---

# aws.apigatewayv2.Deployment

1.  [Packages](/registry/)
2.  [Packages](/registry/packages/)
3.  [AWS](/registry/packages/aws/)
4.  [API Docs](/registry/packages/aws/api-docs/)
5.  [apigatewayv2](/registry/packages/aws/api-docs/apigatewayv2/)
6.  [Deployment](/registry/packages/aws/api-docs/apigatewayv2/deployment/)

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

Viewing docs for AWS v7.32.0
published on Friday, May 29, 2026 by Pulumi

[Schema (JSON)](/registry/packages/aws/schema.json)

[pulumi/pulumi-aws](https://github.com/pulumi/pulumi-aws)

v7.32.0 (7.x, latest)v6.83.1 (6.x)v5.43.0 (5.x)

# aws.apigatewayv2.Deployment

Explore with Neo

-   Copy Page

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2fapigatewayv2%2fdeployment]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2fapigatewayv2%2fdeployment%2f\))

Manages an Amazon API Gateway Version 2 deployment. More information can be found in the [Amazon API Gateway Developer Guide](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api.html).

> **Note:** Creating a deployment for an API requires at least one `aws.apigatewayv2.Route` resource associated with that API. To avoid race conditions when all resources are being created together, you need to add implicit resource references via the `triggers` argument or explicit resource references using the [resource `dependsOn` meta-argument](https://www.pulumi.com/docs/intro/concepts/programming-model/#dependson).

## Example Usage

## Create Deployment Resource

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
new Deployment(name: string, args: DeploymentArgs, opts?: CustomResourceOptions);
```

```python
@overload
def Deployment(resource_name: str,
               args: DeploymentArgs,
               opts: Optional[ResourceOptions] = None)

@overload
def Deployment(resource_name: str,
               opts: Optional[ResourceOptions] = None,
               api_id: Optional[str] = None,
               description: Optional[str] = None,
               region: Optional[str] = None,
               triggers: Optional[Mapping[str, str]] = None)
```

```go
func NewDeployment(ctx *Context, name string, args DeploymentArgs, opts ...ResourceOption) (*Deployment, error)
```

```csharp
public Deployment(string name, DeploymentArgs args, CustomResourceOptions? opts = null)
```

```java
public Deployment(String name, DeploymentArgs args)
public Deployment(String name, DeploymentArgs args, CustomResourceOptions options)
```

```yaml
type: aws:apigatewayv2:Deployment
properties: # The arguments to resource properties.
options: # Bag of options to control resource's behavior.
```

```hcl
resource "aws_apigatewayv2_deployment" "name" {
    # resource properties
}
```

#### Parameters

name This property is required. string

The unique name of the resource.

args This property is required. [DeploymentArgs](#inputs)

The arguments to resource properties.

opts [CustomResourceOptions](/docs/reference/pkg/nodejs/pulumi/pulumi/#CustomResourceOptions)

Bag of options to control resource's behavior.

resource\_name This property is required. str

The unique name of the resource.

args This property is required. [DeploymentArgs](#inputs)

The arguments to resource properties.

opts [ResourceOptions](/docs/reference/pkg/python/pulumi/#pulumi.ResourceOptions)

Bag of options to control resource's behavior.

ctx [Context](https://pkg.go.dev/github.com/pulumi/pulumi/sdk/v3/go/pulumi?tab=doc#Context)

Context object for the current deployment.

name This property is required. string

The unique name of the resource.

args This property is required. [DeploymentArgs](#inputs)

The arguments to resource properties.

opts [ResourceOption](https://pkg.go.dev/github.com/pulumi/pulumi/sdk/v3/go/pulumi?tab=doc#ResourceOption)

Bag of options to control resource's behavior.

name This property is required. string

The unique name of the resource.

args This property is required. [DeploymentArgs](#inputs)

The arguments to resource properties.

opts [CustomResourceOptions](/docs/reference/pkg/dotnet/Pulumi/Pulumi.CustomResourceOptions.html)

Bag of options to control resource's behavior.

name This property is required. String

The unique name of the resource.

args This property is required. [DeploymentArgs](#inputs)

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
var awsDeploymentResource = new Aws.ApiGatewayV2.Deployment("awsDeploymentResource", new()
{
    ApiId = "string",
    Description = "string",
    Region = "string",
    Triggers =
    {
        { "string", "string" },
    },
});
```

```go
example, err := apigatewayv2.NewDeployment(ctx, "awsDeploymentResource", &apigatewayv2.DeploymentArgs{
	ApiId:       pulumi.String("string"),
	Description: pulumi.String("string"),
	Region:      pulumi.String("string"),
	Triggers: pulumi.StringMap{
		"string": pulumi.String("string"),
	},
})
```

```hcl
resource "aws_apigatewayv2_deployment" "awsDeploymentResource" {
  api_id      = "string"
  description = "string"
  region      = "string"
  triggers = {
    "string" = "string"
  }
}
```

```java
var awsDeploymentResource = new com.pulumi.aws.apigatewayv2.Deployment("awsDeploymentResource", com.pulumi.aws.apigatewayv2.DeploymentArgs.builder()
    .apiId("string")
    .description("string")
    .region("string")
    .triggers(Map.of("string", "string"))
    .build());
```

```python
aws_deployment_resource = aws.apigatewayv2.Deployment("awsDeploymentResource",
    api_id="string",
    description="string",
    region="string",
    triggers={
        "string": "string",
    })
```

```typescript
const awsDeploymentResource = new aws.apigatewayv2.Deployment("awsDeploymentResource", {
    apiId: "string",
    description: "string",
    region: "string",
    triggers: {
        string: "string",
    },
});
```

```yaml
type: aws:apigatewayv2:Deployment
properties:
    apiId: string
    description: string
    region: string
    triggers:
        string: string
```

## Deployment Resource Properties

To learn more about resource properties and how to use them, see [Inputs and Outputs](/docs/intro/concepts/inputs-outputs) in the Architecture and Concepts docs.

### Inputs

In Python, inputs that are objects can be passed either as [argument classes or as dictionary literals](/docs/languages-sdks/python/#inputs-and-outputs).

The Deployment resource accepts the following [input](/docs/intro/concepts/inputs-outputs) properties:

[ApiId](#apiid_csharp)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

API identifier.

[Description](#description_csharp) string

Description for the deployment resource. Must be less than or equal to 1024 characters in length.

[Region](#region_csharp) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[Triggers](#triggers_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. Dictionary<string, string>

Map of arbitrary keys and values that, when changed, will trigger a redeployment.

[ApiId](#apiid_go)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

API identifier.

[Description](#description_go) string

Description for the deployment resource. Must be less than or equal to 1024 characters in length.

[Region](#region_go) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[Triggers](#triggers_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. map\[string\]string

Map of arbitrary keys and values that, when changed, will trigger a redeployment.

[api\_id](#api_id_hcl)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

API identifier.

[description](#description_hcl) string

Description for the deployment resource. Must be less than or equal to 1024 characters in length.

[region](#region_hcl) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[triggers](#triggers_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. map(string)

Map of arbitrary keys and values that, when changed, will trigger a redeployment.

[apiId](#apiid_java)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

String

API identifier.

[description](#description_java) String

Description for the deployment resource. Must be less than or equal to 1024 characters in length.

[region](#region_java) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[triggers](#triggers_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. Map<String,String>

Map of arbitrary keys and values that, when changed, will trigger a redeployment.

[apiId](#apiid_nodejs)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

API identifier.

[description](#description_nodejs) string

Description for the deployment resource. Must be less than or equal to 1024 characters in length.

[region](#region_nodejs) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[triggers](#triggers_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. {\[key: string\]: string}

Map of arbitrary keys and values that, when changed, will trigger a redeployment.

[api\_id](#api_id_python)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

str

API identifier.

[description](#description_python) str

Description for the deployment resource. Must be less than or equal to 1024 characters in length.

[region](#region_python) str

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[triggers](#triggers_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. Mapping\[str, str\]

Map of arbitrary keys and values that, when changed, will trigger a redeployment.

[apiId](#apiid_yaml)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

String

API identifier.

[description](#description_yaml) String

Description for the deployment resource. Must be less than or equal to 1024 characters in length.

[region](#region_yaml) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[triggers](#triggers_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. Map<String>

Map of arbitrary keys and values that, when changed, will trigger a redeployment.

### Outputs

All [input](#inputs) properties are implicitly available as output properties. Additionally, the Deployment resource produces the following output properties:

[AutoDeployed](#autodeployed_csharp) bool

Whether the deployment was automatically released.

[Id](#id_csharp) string

The provider-assigned unique ID for this managed resource.

[AutoDeployed](#autodeployed_go) bool

Whether the deployment was automatically released.

[Id](#id_go) string

The provider-assigned unique ID for this managed resource.

[auto\_deployed](#auto_deployed_hcl) bool

Whether the deployment was automatically released.

[id](#id_hcl) string

The provider-assigned unique ID for this managed resource.

[autoDeployed](#autodeployed_java) Boolean

Whether the deployment was automatically released.

[id](#id_java) String

The provider-assigned unique ID for this managed resource.

[autoDeployed](#autodeployed_nodejs) boolean

Whether the deployment was automatically released.

[id](#id_nodejs) string

The provider-assigned unique ID for this managed resource.

[auto\_deployed](#auto_deployed_python) bool

Whether the deployment was automatically released.

[id](#id_python) str

The provider-assigned unique ID for this managed resource.

[autoDeployed](#autodeployed_yaml) Boolean

Whether the deployment was automatically released.

[id](#id_yaml) String

The provider-assigned unique ID for this managed resource.

## Look up Existing Deployment Resource

Get an existing Deployment resource’s state with the given name, ID, and optional extra properties used to qualify the lookup.

-   TypeScript
-   Python
-   Go
-   C#
-   Java
-   YAML
-   HCL PREVIEW

```typescript
public static get(name: string, id: Input<ID>, state?: DeploymentState, opts?: CustomResourceOptions): Deployment
```

```python
@staticmethod
def get(resource_name: str,
        id: str,
        opts: Optional[ResourceOptions] = None,
        api_id: Optional[str] = None,
        auto_deployed: Optional[bool] = None,
        description: Optional[str] = None,
        region: Optional[str] = None,
        triggers: Optional[Mapping[str, str]] = None) -> Deployment
```

```go
func GetDeployment(ctx *Context, name string, id IDInput, state *DeploymentState, opts ...ResourceOption) (*Deployment, error)
```

```csharp
public static Deployment Get(string name, Input<string> id, DeploymentState? state, CustomResourceOptions? opts = null)
```

```java
public static Deployment get(String name, Output<String> id, DeploymentState state, CustomResourceOptions options)
```

```yaml
resources:  _:    type: aws:apigatewayv2:Deployment    get:      id: ${id}
```

```hcl
import {
  to = aws_apigatewayv2_deployment.example
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

[AutoDeployed](#state_autodeployed_csharp) bool

Whether the deployment was automatically released.

[Description](#state_description_csharp) string

Description for the deployment resource. Must be less than or equal to 1024 characters in length.

[Region](#state_region_csharp) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[Triggers](#state_triggers_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. Dictionary<string, string>

Map of arbitrary keys and values that, when changed, will trigger a redeployment.

[ApiId](#state_apiid_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

API identifier.

[AutoDeployed](#state_autodeployed_go) bool

Whether the deployment was automatically released.

[Description](#state_description_go) string

Description for the deployment resource. Must be less than or equal to 1024 characters in length.

[Region](#state_region_go) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[Triggers](#state_triggers_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. map\[string\]string

Map of arbitrary keys and values that, when changed, will trigger a redeployment.

[api\_id](#state_api_id_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

API identifier.

[auto\_deployed](#state_auto_deployed_hcl) bool

Whether the deployment was automatically released.

[description](#state_description_hcl) string

Description for the deployment resource. Must be less than or equal to 1024 characters in length.

[region](#state_region_hcl) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[triggers](#state_triggers_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. map(string)

Map of arbitrary keys and values that, when changed, will trigger a redeployment.

[apiId](#state_apiid_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

API identifier.

[autoDeployed](#state_autodeployed_java) Boolean

Whether the deployment was automatically released.

[description](#state_description_java) String

Description for the deployment resource. Must be less than or equal to 1024 characters in length.

[region](#state_region_java) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[triggers](#state_triggers_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. Map<String,String>

Map of arbitrary keys and values that, when changed, will trigger a redeployment.

[apiId](#state_apiid_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

API identifier.

[autoDeployed](#state_autodeployed_nodejs) boolean

Whether the deployment was automatically released.

[description](#state_description_nodejs) string

Description for the deployment resource. Must be less than or equal to 1024 characters in length.

[region](#state_region_nodejs) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[triggers](#state_triggers_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. {\[key: string\]: string}

Map of arbitrary keys and values that, when changed, will trigger a redeployment.

[api\_id](#state_api_id_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

API identifier.

[auto\_deployed](#state_auto_deployed_python) bool

Whether the deployment was automatically released.

[description](#state_description_python) str

Description for the deployment resource. Must be less than or equal to 1024 characters in length.

[region](#state_region_python) str

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[triggers](#state_triggers_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. Mapping\[str, str\]

Map of arbitrary keys and values that, when changed, will trigger a redeployment.

[apiId](#state_apiid_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

API identifier.

[autoDeployed](#state_autodeployed_yaml) Boolean

Whether the deployment was automatically released.

[description](#state_description_yaml) String

Description for the deployment resource. Must be less than or equal to 1024 characters in length.

[region](#state_region_yaml) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[triggers](#state_triggers_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. Map<String>

Map of arbitrary keys and values that, when changed, will trigger a redeployment.

## Import

Using `pulumi import`, import `aws.apigatewayv2.Deployment` using the API identifier and deployment identifier. For example:

```bash
$ pulumi import aws:apigatewayv2/deployment:Deployment example aabbccddee/1122334
```

The `triggers` argument cannot be imported.

To learn more about importing existing cloud resources, see [Importing resources](/docs/using-pulumi/adopting-pulumi/import/).

## Package Details

Repository

[AWS Classic pulumi/pulumi-aws](https://github.com/pulumi/pulumi-aws)

License

Apache-2.0

Notes

This Pulumi package is based on the [`aws` Terraform Provider](https://github.com/hashicorp/terraform-provider-aws).

-   Copy Page

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2fapigatewayv2%2fdeployment]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2fapigatewayv2%2fdeployment%2f\))

#### Try Pulumi Cloud free.
Your team will thank you.

[Start free trial](https://app.pulumi.com/signup?utm_source=registry&utm_medium=right-rail-banner&utm_campaign=try-pulumi-cloud&iaid=docs-try-pulumi-cloud-ad)
