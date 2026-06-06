---
Source: https://www.pulumi.com/registry/packages/aws/api-docs/apigatewayv2/domainname/
Generated: 2026-06-06
Updated: 2026-06-06
---

# aws.apigatewayv2.DomainName

1.  [Packages](/registry/)
2.  [Packages](/registry/packages/)
3.  [AWS](/registry/packages/aws/)
4.  [API Docs](/registry/packages/aws/api-docs/)
5.  [apigatewayv2](/registry/packages/aws/api-docs/apigatewayv2/)
6.  [DomainName](/registry/packages/aws/api-docs/apigatewayv2/domainname/)

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

Viewing docs for AWS v7.32.0
published on Friday, May 29, 2026 by Pulumi

[Schema (JSON)](/registry/packages/aws/schema.json)

[pulumi/pulumi-aws](https://github.com/pulumi/pulumi-aws)

v7.32.0 (7.x, latest)v6.83.1 (6.x)v5.43.0 (5.x)

# aws.apigatewayv2.DomainName[](#aws-apigatewayv2-domainname)

Explore with Neo

-   Copy Page

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2fapigatewayv2%2fdomainname]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2fapigatewayv2%2fdomainname%2f\))

Manages an Amazon API Gateway Version 2 domain name. More information can be found in the [Amazon API Gateway Developer Guide](https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-custom-domains.html).

> **Note:** This resource establishes ownership of and the TLS settings for a particular domain name. An API stage can be associated with the domain name using the `aws.apigatewayv2.ApiMapping` resource.

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

const example = new aws.apigatewayv2.DomainName("example", {
    domainName: "ws-api.example.com",
    domainNameConfiguration: {
        certificateArn: exampleAwsAcmCertificate.arn,
        endpointType: "REGIONAL",
        securityPolicy: "TLS_1_2",
    },
});
```

```python
import pulumi
import pulumi_aws as aws

example = aws.apigatewayv2.DomainName("example",
    domain_name="ws-api.example.com",
    domain_name_configuration={
        "certificate_arn": example_aws_acm_certificate["arn"],
        "endpoint_type": "REGIONAL",
        "security_policy": "TLS_1_2",
    })
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/apigatewayv2"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		_, err := apigatewayv2.NewDomainName(ctx, "example", &apigatewayv2.DomainNameArgs{
			DomainName: pulumi.String("ws-api.example.com"),
			DomainNameConfiguration: &apigatewayv2.DomainNameDomainNameConfigurationArgs{
				CertificateArn: pulumi.Any(exampleAwsAcmCertificate.Arn),
				EndpointType:   pulumi.String("REGIONAL"),
				SecurityPolicy: pulumi.String("TLS_1_2"),
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
    var example = new Aws.ApiGatewayV2.DomainName("example", new()
    {
        Domain = "ws-api.example.com",
        DomainNameConfiguration = new Aws.ApiGatewayV2.Inputs.DomainNameDomainNameConfigurationArgs
        {
            CertificateArn = exampleAwsAcmCertificate.Arn,
            EndpointType = "REGIONAL",
            SecurityPolicy = "TLS_1_2",
        },
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.apigatewayv2.DomainName;
import com.pulumi.aws.apigatewayv2.DomainNameArgs;
import com.pulumi.aws.apigatewayv2.inputs.DomainNameDomainNameConfigurationArgs;
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
        var example = new DomainName("example", DomainNameArgs.builder()
            .domainName("ws-api.example.com")
            .domainNameConfiguration(DomainNameDomainNameConfigurationArgs.builder()
                .certificateArn(exampleAwsAcmCertificate.arn())
                .endpointType("REGIONAL")
                .securityPolicy("TLS_1_2")
                .build())
            .build());

    }
}
```

```yaml
resources:
  example:
    type: aws:apigatewayv2:DomainName
    properties:
      domainName: ws-api.example.com
      domainNameConfiguration:
        certificateArn: ${exampleAwsAcmCertificate.arn}
        endpointType: REGIONAL
        securityPolicy: TLS_1_2
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_apigatewayv2_domainname" "example" {
  domain_name = "ws-api.example.com"
  domain_name_configuration = {
    certificate_arn = exampleAwsAcmCertificate.arn
    endpoint_type   = "REGIONAL"
    security_policy = "TLS_1_2"
  }
}
```

### Associated Route 53 Resource Record[](#associated-route-53-resource-record)

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

const example = new aws.apigatewayv2.DomainName("example", {
    domainName: "http-api.example.com",
    domainNameConfiguration: {
        certificateArn: exampleAwsAcmCertificate.arn,
        endpointType: "REGIONAL",
        securityPolicy: "TLS_1_2",
    },
});
const exampleRecord = new aws.route53.Record("example", {
    name: example.domainName,
    type: aws.route53.RecordType.A,
    zoneId: exampleAwsRoute53Zone.zoneId,
    aliases: [{
        name: example.domainNameConfiguration.apply(domainNameConfiguration => domainNameConfiguration.targetDomainName),
        zoneId: example.domainNameConfiguration.apply(domainNameConfiguration => domainNameConfiguration.hostedZoneId),
        evaluateTargetHealth: false,
    }],
});
```

```python
import pulumi
import pulumi_aws as aws

example = aws.apigatewayv2.DomainName("example",
    domain_name="http-api.example.com",
    domain_name_configuration={
        "certificate_arn": example_aws_acm_certificate["arn"],
        "endpoint_type": "REGIONAL",
        "security_policy": "TLS_1_2",
    })
example_record = aws.route53.Record("example",
    name=example.domain_name,
    type=aws.route53.RecordType.A,
    zone_id=example_aws_route53_zone["zoneId"],
    aliases=[{
        "name": example.domain_name_configuration.target_domain_name,
        "zone_id": example.domain_name_configuration.hosted_zone_id,
        "evaluate_target_health": False,
    }])
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/apigatewayv2"
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/route53"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		example, err := apigatewayv2.NewDomainName(ctx, "example", &apigatewayv2.DomainNameArgs{
			DomainName: pulumi.String("http-api.example.com"),
			DomainNameConfiguration: &apigatewayv2.DomainNameDomainNameConfigurationArgs{
				CertificateArn: pulumi.Any(exampleAwsAcmCertificate.Arn),
				EndpointType:   pulumi.String("REGIONAL"),
				SecurityPolicy: pulumi.String("TLS_1_2"),
			},
		})
		if err != nil {
			return err
		}
		_, err = route53.NewRecord(ctx, "example", &route53.RecordArgs{
			Name:   example.DomainName,
			Type:   pulumi.String(route53.RecordTypeA),
			ZoneId: pulumi.Any(exampleAwsRoute53Zone.ZoneId),
			Aliases: route53.RecordAliasArray{
				&route53.RecordAliasArgs{
					Name: example.DomainNameConfiguration.ApplyT(func(domainNameConfiguration apigatewayv2.DomainNameDomainNameConfiguration) (*string, error) {
						return &domainNameConfiguration.TargetDomainName, nil
					}).(pulumi.StringPtrOutput),
					ZoneId: example.DomainNameConfiguration.ApplyT(func(domainNameConfiguration apigatewayv2.DomainNameDomainNameConfiguration) (*string, error) {
						return &domainNameConfiguration.HostedZoneId, nil
					}).(pulumi.StringPtrOutput),
					EvaluateTargetHealth: pulumi.Bool(false),
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
    var example = new Aws.ApiGatewayV2.DomainName("example", new()
    {
        Domain = "http-api.example.com",
        DomainNameConfiguration = new Aws.ApiGatewayV2.Inputs.DomainNameDomainNameConfigurationArgs
        {
            CertificateArn = exampleAwsAcmCertificate.Arn,
            EndpointType = "REGIONAL",
            SecurityPolicy = "TLS_1_2",
        },
    });

    var exampleRecord = new Aws.Route53.Record("example", new()
    {
        Name = example.Domain,
        Type = Aws.Route53.RecordType.A,
        ZoneId = exampleAwsRoute53Zone.ZoneId,
        Aliases = new[]
        {
            new Aws.Route53.Inputs.RecordAliasArgs
            {
                Name = example.DomainNameConfiguration.Apply(domainNameConfiguration => domainNameConfiguration.TargetDomainName),
                ZoneId = example.DomainNameConfiguration.Apply(domainNameConfiguration => domainNameConfiguration.HostedZoneId),
                EvaluateTargetHealth = false,
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
import com.pulumi.aws.apigatewayv2.DomainName;
import com.pulumi.aws.apigatewayv2.DomainNameArgs;
import com.pulumi.aws.apigatewayv2.inputs.DomainNameDomainNameConfigurationArgs;
import com.pulumi.aws.route53.Record;
import com.pulumi.aws.route53.RecordArgs;
import com.pulumi.aws.route53.inputs.RecordAliasArgs;
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
        var example = new DomainName("example", DomainNameArgs.builder()
            .domainName("http-api.example.com")
            .domainNameConfiguration(DomainNameDomainNameConfigurationArgs.builder()
                .certificateArn(exampleAwsAcmCertificate.arn())
                .endpointType("REGIONAL")
                .securityPolicy("TLS_1_2")
                .build())
            .build());

        var exampleRecord = new Record("exampleRecord", RecordArgs.builder()
            .name(example.domainName())
            .type("A")
            .zoneId(exampleAwsRoute53Zone.zoneId())
            .aliases(RecordAliasArgs.builder()
                .name(example.domainNameConfiguration().applyValue(_domainNameConfiguration -> _domainNameConfiguration.targetDomainName()))
                .zoneId(example.domainNameConfiguration().applyValue(_domainNameConfiguration -> _domainNameConfiguration.hostedZoneId()))
                .evaluateTargetHealth(false)
                .build())
            .build());

    }
}
```

```yaml
resources:
  example:
    type: aws:apigatewayv2:DomainName
    properties:
      domainName: http-api.example.com
      domainNameConfiguration:
        certificateArn: ${exampleAwsAcmCertificate.arn}
        endpointType: REGIONAL
        securityPolicy: TLS_1_2
  exampleRecord:
    type: aws:route53:Record
    name: example
    properties:
      name: ${example.domainName}
      type: A
      zoneId: ${exampleAwsRoute53Zone.zoneId}
      aliases:
        - name: ${example.domainNameConfiguration.targetDomainName}
          zoneId: ${example.domainNameConfiguration.hostedZoneId}
          evaluateTargetHealth: false
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_apigatewayv2_domainname" "example" {
  domain_name = "http-api.example.com"
  domain_name_configuration = {
    certificate_arn = exampleAwsAcmCertificate.arn
    endpoint_type   = "REGIONAL"
    security_policy = "TLS_1_2"
  }
}
resource "aws_route53_record" "example" {
  name    = aws_apigatewayv2_domainname.example.domain_name
  type    = "A"
  zone_id = exampleAwsRoute53Zone.zoneId
  aliases {
    name                   = aws_apigatewayv2_domainname.example.domain_name_configuration.target_domain_name
    zone_id                = aws_apigatewayv2_domainname.example.domain_name_configuration.hosted_zone_id
    evaluate_target_health = false
  }
}
```

## Create DomainName Resource[](#create)

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
new DomainName(name: string, args: DomainNameArgs, opts?: CustomResourceOptions);
```

```python
@overload
def DomainName(resource_name: str,
               args: DomainNameArgs,
               opts: Optional[ResourceOptions] = None)

@overload
def DomainName(resource_name: str,
               opts: Optional[ResourceOptions] = None,
               domain_name: Optional[str] = None,
               domain_name_configuration: Optional[DomainNameDomainNameConfigurationArgs] = None,
               mutual_tls_authentication: Optional[DomainNameMutualTlsAuthenticationArgs] = None,
               region: Optional[str] = None,
               routing_mode: Optional[str] = None,
               tags: Optional[Mapping[str, str]] = None)
```

```go
func NewDomainName(ctx *Context, name string, args DomainNameArgs, opts ...ResourceOption) (*DomainName, error)
```

```csharp
public DomainName(string name, DomainNameArgs args, CustomResourceOptions? opts = null)
```

```java
public DomainName(String name, DomainNameArgs args)
public DomainName(String name, DomainNameArgs args, CustomResourceOptions options)
```

```yaml
type: aws:apigatewayv2:DomainName
properties: # The arguments to resource properties.
options: # Bag of options to control resource's behavior.
```

```hcl
resource "aws_apigatewayv2_domainname" "name" {
    # resource properties
}
```

#### Parameters[](#parameters)

name This property is required. string

The unique name of the resource.

args This property is required. [DomainNameArgs](#inputs)

The arguments to resource properties.

opts [CustomResourceOptions](/docs/reference/pkg/nodejs/pulumi/pulumi/#CustomResourceOptions)

Bag of options to control resource's behavior.

resource\_name This property is required. str

The unique name of the resource.

args This property is required. [DomainNameArgs](#inputs)

The arguments to resource properties.

opts [ResourceOptions](/docs/reference/pkg/python/pulumi/#pulumi.ResourceOptions)

Bag of options to control resource's behavior.

ctx [Context](https://pkg.go.dev/github.com/pulumi/pulumi/sdk/v3/go/pulumi?tab=doc#Context)

Context object for the current deployment.

name This property is required. string

The unique name of the resource.

args This property is required. [DomainNameArgs](#inputs)

The arguments to resource properties.

opts [ResourceOption](https://pkg.go.dev/github.com/pulumi/pulumi/sdk/v3/go/pulumi?tab=doc#ResourceOption)

Bag of options to control resource's behavior.

name This property is required. string

The unique name of the resource.

args This property is required. [DomainNameArgs](#inputs)

The arguments to resource properties.

opts [CustomResourceOptions](/docs/reference/pkg/dotnet/Pulumi/Pulumi.CustomResourceOptions.html)

Bag of options to control resource's behavior.

name This property is required. String

The unique name of the resource.

args This property is required. [DomainNameArgs](#inputs)

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
var awsDomainNameResource = new Aws.ApiGatewayV2.DomainName("awsDomainNameResource", new()
{
    Domain = "string",
    DomainNameConfiguration = new Aws.ApiGatewayV2.Inputs.DomainNameDomainNameConfigurationArgs
    {
        CertificateArn = "string",
        EndpointType = "string",
        SecurityPolicy = "string",
        HostedZoneId = "string",
        IpAddressType = "string",
        OwnershipVerificationCertificateArn = "string",
        TargetDomainName = "string",
    },
    MutualTlsAuthentication = new Aws.ApiGatewayV2.Inputs.DomainNameMutualTlsAuthenticationArgs
    {
        TruststoreUri = "string",
        TruststoreVersion = "string",
    },
    Region = "string",
    RoutingMode = "string",
    Tags =
    {
        { "string", "string" },
    },
});
```

```go
example, err := apigatewayv2.NewDomainName(ctx, "awsDomainNameResource", &apigatewayv2.DomainNameArgs{
	DomainName: pulumi.String("string"),
	DomainNameConfiguration: &apigatewayv2.DomainNameDomainNameConfigurationArgs{
		CertificateArn:                      pulumi.String("string"),
		EndpointType:                        pulumi.String("string"),
		SecurityPolicy:                      pulumi.String("string"),
		HostedZoneId:                        pulumi.String("string"),
		IpAddressType:                       pulumi.String("string"),
		OwnershipVerificationCertificateArn: pulumi.String("string"),
		TargetDomainName:                    pulumi.String("string"),
	},
	MutualTlsAuthentication: &apigatewayv2.DomainNameMutualTlsAuthenticationArgs{
		TruststoreUri:     pulumi.String("string"),
		TruststoreVersion: pulumi.String("string"),
	},
	Region:      pulumi.String("string"),
	RoutingMode: pulumi.String("string"),
	Tags: pulumi.StringMap{
		"string": pulumi.String("string"),
	},
})
```

```hcl
resource "aws_apigatewayv2_domainname" "awsDomainNameResource" {
  domain_name = "string"
  domain_name_configuration = {
    certificate_arn                        = "string"
    endpoint_type                          = "string"
    security_policy                        = "string"
    hosted_zone_id                         = "string"
    ip_address_type                        = "string"
    ownership_verification_certificate_arn = "string"
    target_domain_name                     = "string"
  }
  mutual_tls_authentication = {
    truststore_uri     = "string"
    truststore_version = "string"
  }
  region       = "string"
  routing_mode = "string"
  tags = {
    "string" = "string"
  }
}
```

```java
var awsDomainNameResource = new com.pulumi.aws.apigatewayv2.DomainName("awsDomainNameResource", com.pulumi.aws.apigatewayv2.DomainNameArgs.builder()
    .domainName("string")
    .domainNameConfiguration(DomainNameDomainNameConfigurationArgs.builder()
        .certificateArn("string")
        .endpointType("string")
        .securityPolicy("string")
        .hostedZoneId("string")
        .ipAddressType("string")
        .ownershipVerificationCertificateArn("string")
        .targetDomainName("string")
        .build())
    .mutualTlsAuthentication(DomainNameMutualTlsAuthenticationArgs.builder()
        .truststoreUri("string")
        .truststoreVersion("string")
        .build())
    .region("string")
    .routingMode("string")
    .tags(Map.of("string", "string"))
    .build());
```

```python
aws_domain_name_resource = aws.apigatewayv2.DomainName("awsDomainNameResource",
    domain_name="string",
    domain_name_configuration={
        "certificate_arn": "string",
        "endpoint_type": "string",
        "security_policy": "string",
        "hosted_zone_id": "string",
        "ip_address_type": "string",
        "ownership_verification_certificate_arn": "string",
        "target_domain_name": "string",
    },
    mutual_tls_authentication={
        "truststore_uri": "string",
        "truststore_version": "string",
    },
    region="string",
    routing_mode="string",
    tags={
        "string": "string",
    })
```

```typescript
const awsDomainNameResource = new aws.apigatewayv2.DomainName("awsDomainNameResource", {
    domainName: "string",
    domainNameConfiguration: {
        certificateArn: "string",
        endpointType: "string",
        securityPolicy: "string",
        hostedZoneId: "string",
        ipAddressType: "string",
        ownershipVerificationCertificateArn: "string",
        targetDomainName: "string",
    },
    mutualTlsAuthentication: {
        truststoreUri: "string",
        truststoreVersion: "string",
    },
    region: "string",
    routingMode: "string",
    tags: {
        string: "string",
    },
});
```

```yaml
type: aws:apigatewayv2:DomainName
properties:
    domainName: string
    domainNameConfiguration:
        certificateArn: string
        endpointType: string
        hostedZoneId: string
        ipAddressType: string
        ownershipVerificationCertificateArn: string
        securityPolicy: string
        targetDomainName: string
    mutualTlsAuthentication:
        truststoreUri: string
        truststoreVersion: string
    region: string
    routingMode: string
    tags:
        string: string
```

## DomainName Resource Properties[](#properties)

To learn more about resource properties and how to use them, see [Inputs and Outputs](/docs/intro/concepts/inputs-outputs) in the Architecture and Concepts docs.

### Inputs[](#inputs)

In Python, inputs that are objects can be passed either as [argument classes or as dictionary literals](/docs/languages-sdks/python/#inputs-and-outputs).

The DomainName resource accepts the following [input](/docs/intro/concepts/inputs-outputs) properties:

[Domain](#domain_csharp)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

Domain name. Must be between 1 and 512 characters in length.

[DomainNameConfiguration](#domainnameconfiguration_csharp) This property is required. [DomainNameDomainNameConfiguration](#domainnamedomainnameconfiguration)

Domain name configuration. See below.

[MutualTlsAuthentication](#mutualtlsauthentication_csharp) [DomainNameMutualTlsAuthentication](#domainnamemutualtlsauthentication)

Mutual TLS authentication configuration for the domain name.

[Region](#region_csharp) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[RoutingMode](#routingmode_csharp) string

Mode to route traffic for the domain name. Valid values: `API_MAPPING_ONLY`, `ROUTING_RULE_ONLY`, `ROUTING_RULE_THEN_API_MAPPING`.

[Tags](#tags_csharp) Dictionary<string, string>

Map of tags to assign to the domain name. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[DomainName](#domainname_go)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

Domain name. Must be between 1 and 512 characters in length.

[DomainNameConfiguration](#domainnameconfiguration_go) This property is required. [DomainNameDomainNameConfigurationArgs](#domainnamedomainnameconfiguration)

Domain name configuration. See below.

[MutualTlsAuthentication](#mutualtlsauthentication_go) [DomainNameMutualTlsAuthenticationArgs](#domainnamemutualtlsauthentication)

Mutual TLS authentication configuration for the domain name.

[Region](#region_go) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[RoutingMode](#routingmode_go) string

Mode to route traffic for the domain name. Valid values: `API_MAPPING_ONLY`, `ROUTING_RULE_ONLY`, `ROUTING_RULE_THEN_API_MAPPING`.

[Tags](#tags_go) map\[string\]string

Map of tags to assign to the domain name. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[domain\_name](#domain_name_hcl)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

Domain name. Must be between 1 and 512 characters in length.

[domain\_name\_configuration](#domain_name_configuration_hcl) This property is required. [object](#domainnamedomainnameconfiguration)

Domain name configuration. See below.

[mutual\_tls\_authentication](#mutual_tls_authentication_hcl) [object](#domainnamemutualtlsauthentication)

Mutual TLS authentication configuration for the domain name.

[region](#region_hcl) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[routing\_mode](#routing_mode_hcl) string

Mode to route traffic for the domain name. Valid values: `API_MAPPING_ONLY`, `ROUTING_RULE_ONLY`, `ROUTING_RULE_THEN_API_MAPPING`.

[tags](#tags_hcl) map(string)

Map of tags to assign to the domain name. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[domainName](#domainname_java)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

String

Domain name. Must be between 1 and 512 characters in length.

[domainNameConfiguration](#domainnameconfiguration_java) This property is required. [DomainNameDomainNameConfiguration](#domainnamedomainnameconfiguration)

Domain name configuration. See below.

[mutualTlsAuthentication](#mutualtlsauthentication_java) [DomainNameMutualTlsAuthentication](#domainnamemutualtlsauthentication)

Mutual TLS authentication configuration for the domain name.

[region](#region_java) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[routingMode](#routingmode_java) String

Mode to route traffic for the domain name. Valid values: `API_MAPPING_ONLY`, `ROUTING_RULE_ONLY`, `ROUTING_RULE_THEN_API_MAPPING`.

[tags](#tags_java) Map<String,String>

Map of tags to assign to the domain name. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[domainName](#domainname_nodejs)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

Domain name. Must be between 1 and 512 characters in length.

[domainNameConfiguration](#domainnameconfiguration_nodejs) This property is required. [DomainNameDomainNameConfiguration](#domainnamedomainnameconfiguration)

Domain name configuration. See below.

[mutualTlsAuthentication](#mutualtlsauthentication_nodejs) [DomainNameMutualTlsAuthentication](#domainnamemutualtlsauthentication)

Mutual TLS authentication configuration for the domain name.

[region](#region_nodejs) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[routingMode](#routingmode_nodejs) string

Mode to route traffic for the domain name. Valid values: `API_MAPPING_ONLY`, `ROUTING_RULE_ONLY`, `ROUTING_RULE_THEN_API_MAPPING`.

[tags](#tags_nodejs) {\[key: string\]: string}

Map of tags to assign to the domain name. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[domain\_name](#domain_name_python)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

str

Domain name. Must be between 1 and 512 characters in length.

[domain\_name\_configuration](#domain_name_configuration_python) This property is required. [DomainNameDomainNameConfigurationArgs](#domainnamedomainnameconfiguration)

Domain name configuration. See below.

[mutual\_tls\_authentication](#mutual_tls_authentication_python) [DomainNameMutualTlsAuthenticationArgs](#domainnamemutualtlsauthentication)

Mutual TLS authentication configuration for the domain name.

[region](#region_python) str

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[routing\_mode](#routing_mode_python) str

Mode to route traffic for the domain name. Valid values: `API_MAPPING_ONLY`, `ROUTING_RULE_ONLY`, `ROUTING_RULE_THEN_API_MAPPING`.

[tags](#tags_python) Mapping\[str, str\]

Map of tags to assign to the domain name. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[domainName](#domainname_yaml)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

String

Domain name. Must be between 1 and 512 characters in length.

[domainNameConfiguration](#domainnameconfiguration_yaml) This property is required. [Property Map](#domainnamedomainnameconfiguration)

Domain name configuration. See below.

[mutualTlsAuthentication](#mutualtlsauthentication_yaml) [Property Map](#domainnamemutualtlsauthentication)

Mutual TLS authentication configuration for the domain name.

[region](#region_yaml) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[routingMode](#routingmode_yaml) String

Mode to route traffic for the domain name. Valid values: `API_MAPPING_ONLY`, `ROUTING_RULE_ONLY`, `ROUTING_RULE_THEN_API_MAPPING`.

[tags](#tags_yaml) Map<String>

Map of tags to assign to the domain name. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

### Outputs[](#outputs)

All [input](#inputs) properties are implicitly available as output properties. Additionally, the DomainName resource produces the following output properties:

[ApiMappingSelectionExpression](#apimappingselectionexpression_csharp) string

[API mapping selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-mapping-selection-expressions) for the domain name.

[Arn](#arn_csharp) string

ARN of the domain name.

[Id](#id_csharp) string

The provider-assigned unique ID for this managed resource.

[TagsAll](#tagsall_csharp) Dictionary<string, string>

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[ApiMappingSelectionExpression](#apimappingselectionexpression_go) string

[API mapping selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-mapping-selection-expressions) for the domain name.

[Arn](#arn_go) string

ARN of the domain name.

[Id](#id_go) string

The provider-assigned unique ID for this managed resource.

[TagsAll](#tagsall_go) map\[string\]string

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[api\_mapping\_selection\_expression](#api_mapping_selection_expression_hcl) string

[API mapping selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-mapping-selection-expressions) for the domain name.

[arn](#arn_hcl) string

ARN of the domain name.

[id](#id_hcl) string

The provider-assigned unique ID for this managed resource.

[tags\_all](#tags_all_hcl) map(string)

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[apiMappingSelectionExpression](#apimappingselectionexpression_java) String

[API mapping selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-mapping-selection-expressions) for the domain name.

[arn](#arn_java) String

ARN of the domain name.

[id](#id_java) String

The provider-assigned unique ID for this managed resource.

[tagsAll](#tagsall_java) Map<String,String>

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[apiMappingSelectionExpression](#apimappingselectionexpression_nodejs) string

[API mapping selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-mapping-selection-expressions) for the domain name.

[arn](#arn_nodejs) string

ARN of the domain name.

[id](#id_nodejs) string

The provider-assigned unique ID for this managed resource.

[tagsAll](#tagsall_nodejs) {\[key: string\]: string}

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[api\_mapping\_selection\_expression](#api_mapping_selection_expression_python) str

[API mapping selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-mapping-selection-expressions) for the domain name.

[arn](#arn_python) str

ARN of the domain name.

[id](#id_python) str

The provider-assigned unique ID for this managed resource.

[tags\_all](#tags_all_python) Mapping\[str, str\]

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[apiMappingSelectionExpression](#apimappingselectionexpression_yaml) String

[API mapping selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-mapping-selection-expressions) for the domain name.

[arn](#arn_yaml) String

ARN of the domain name.

[id](#id_yaml) String

The provider-assigned unique ID for this managed resource.

[tagsAll](#tagsall_yaml) Map<String>

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

## Look up Existing DomainName Resource[](#look-up)

Get an existing DomainName resource’s state with the given name, ID, and optional extra properties used to qualify the lookup.

-   TypeScript
-   Python
-   Go
-   C#
-   Java
-   YAML
-   HCL PREVIEW

```typescript
public static get(name: string, id: Input<ID>, state?: DomainNameState, opts?: CustomResourceOptions): DomainName
```

```python
@staticmethod
def get(resource_name: str,
        id: str,
        opts: Optional[ResourceOptions] = None,
        api_mapping_selection_expression: Optional[str] = None,
        arn: Optional[str] = None,
        domain_name: Optional[str] = None,
        domain_name_configuration: Optional[DomainNameDomainNameConfigurationArgs] = None,
        mutual_tls_authentication: Optional[DomainNameMutualTlsAuthenticationArgs] = None,
        region: Optional[str] = None,
        routing_mode: Optional[str] = None,
        tags: Optional[Mapping[str, str]] = None,
        tags_all: Optional[Mapping[str, str]] = None) -> DomainName
```

```go
func GetDomainName(ctx *Context, name string, id IDInput, state *DomainNameState, opts ...ResourceOption) (*DomainName, error)
```

```csharp
public static DomainName Get(string name, Input<string> id, DomainNameState? state, CustomResourceOptions? opts = null)
```

```java
public static DomainName get(String name, Output<String> id, DomainNameState state, CustomResourceOptions options)
```

```yaml
resources:  _:    type: aws:apigatewayv2:DomainName    get:      id: ${id}
```

```hcl
import {
  to = aws_apigatewayv2_domainname.example
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

[ApiMappingSelectionExpression](#state_apimappingselectionexpression_csharp) string

[API mapping selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-mapping-selection-expressions) for the domain name.

[Arn](#state_arn_csharp) string

ARN of the domain name.

[Domain](#state_domain_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Domain name. Must be between 1 and 512 characters in length.

[DomainNameConfiguration](#state_domainnameconfiguration_csharp) [DomainNameDomainNameConfiguration](#domainnamedomainnameconfiguration)

Domain name configuration. See below.

[MutualTlsAuthentication](#state_mutualtlsauthentication_csharp) [DomainNameMutualTlsAuthentication](#domainnamemutualtlsauthentication)

Mutual TLS authentication configuration for the domain name.

[Region](#state_region_csharp) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[RoutingMode](#state_routingmode_csharp) string

Mode to route traffic for the domain name. Valid values: `API_MAPPING_ONLY`, `ROUTING_RULE_ONLY`, `ROUTING_RULE_THEN_API_MAPPING`.

[Tags](#state_tags_csharp) Dictionary<string, string>

Map of tags to assign to the domain name. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[TagsAll](#state_tagsall_csharp) Dictionary<string, string>

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[ApiMappingSelectionExpression](#state_apimappingselectionexpression_go) string

[API mapping selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-mapping-selection-expressions) for the domain name.

[Arn](#state_arn_go) string

ARN of the domain name.

[DomainName](#state_domainname_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Domain name. Must be between 1 and 512 characters in length.

[DomainNameConfiguration](#state_domainnameconfiguration_go) [DomainNameDomainNameConfigurationArgs](#domainnamedomainnameconfiguration)

Domain name configuration. See below.

[MutualTlsAuthentication](#state_mutualtlsauthentication_go) [DomainNameMutualTlsAuthenticationArgs](#domainnamemutualtlsauthentication)

Mutual TLS authentication configuration for the domain name.

[Region](#state_region_go) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[RoutingMode](#state_routingmode_go) string

Mode to route traffic for the domain name. Valid values: `API_MAPPING_ONLY`, `ROUTING_RULE_ONLY`, `ROUTING_RULE_THEN_API_MAPPING`.

[Tags](#state_tags_go) map\[string\]string

Map of tags to assign to the domain name. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[TagsAll](#state_tagsall_go) map\[string\]string

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[api\_mapping\_selection\_expression](#state_api_mapping_selection_expression_hcl) string

[API mapping selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-mapping-selection-expressions) for the domain name.

[arn](#state_arn_hcl) string

ARN of the domain name.

[domain\_name](#state_domain_name_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Domain name. Must be between 1 and 512 characters in length.

[domain\_name\_configuration](#state_domain_name_configuration_hcl) [object](#domainnamedomainnameconfiguration)

Domain name configuration. See below.

[mutual\_tls\_authentication](#state_mutual_tls_authentication_hcl) [object](#domainnamemutualtlsauthentication)

Mutual TLS authentication configuration for the domain name.

[region](#state_region_hcl) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[routing\_mode](#state_routing_mode_hcl) string

Mode to route traffic for the domain name. Valid values: `API_MAPPING_ONLY`, `ROUTING_RULE_ONLY`, `ROUTING_RULE_THEN_API_MAPPING`.

[tags](#state_tags_hcl) map(string)

Map of tags to assign to the domain name. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tags\_all](#state_tags_all_hcl) map(string)

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[apiMappingSelectionExpression](#state_apimappingselectionexpression_java) String

[API mapping selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-mapping-selection-expressions) for the domain name.

[arn](#state_arn_java) String

ARN of the domain name.

[domainName](#state_domainname_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Domain name. Must be between 1 and 512 characters in length.

[domainNameConfiguration](#state_domainnameconfiguration_java) [DomainNameDomainNameConfiguration](#domainnamedomainnameconfiguration)

Domain name configuration. See below.

[mutualTlsAuthentication](#state_mutualtlsauthentication_java) [DomainNameMutualTlsAuthentication](#domainnamemutualtlsauthentication)

Mutual TLS authentication configuration for the domain name.

[region](#state_region_java) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[routingMode](#state_routingmode_java) String

Mode to route traffic for the domain name. Valid values: `API_MAPPING_ONLY`, `ROUTING_RULE_ONLY`, `ROUTING_RULE_THEN_API_MAPPING`.

[tags](#state_tags_java) Map<String,String>

Map of tags to assign to the domain name. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tagsAll](#state_tagsall_java) Map<String,String>

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[apiMappingSelectionExpression](#state_apimappingselectionexpression_nodejs) string

[API mapping selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-mapping-selection-expressions) for the domain name.

[arn](#state_arn_nodejs) string

ARN of the domain name.

[domainName](#state_domainname_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Domain name. Must be between 1 and 512 characters in length.

[domainNameConfiguration](#state_domainnameconfiguration_nodejs) [DomainNameDomainNameConfiguration](#domainnamedomainnameconfiguration)

Domain name configuration. See below.

[mutualTlsAuthentication](#state_mutualtlsauthentication_nodejs) [DomainNameMutualTlsAuthentication](#domainnamemutualtlsauthentication)

Mutual TLS authentication configuration for the domain name.

[region](#state_region_nodejs) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[routingMode](#state_routingmode_nodejs) string

Mode to route traffic for the domain name. Valid values: `API_MAPPING_ONLY`, `ROUTING_RULE_ONLY`, `ROUTING_RULE_THEN_API_MAPPING`.

[tags](#state_tags_nodejs) {\[key: string\]: string}

Map of tags to assign to the domain name. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tagsAll](#state_tagsall_nodejs) {\[key: string\]: string}

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[api\_mapping\_selection\_expression](#state_api_mapping_selection_expression_python) str

[API mapping selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-mapping-selection-expressions) for the domain name.

[arn](#state_arn_python) str

ARN of the domain name.

[domain\_name](#state_domain_name_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Domain name. Must be between 1 and 512 characters in length.

[domain\_name\_configuration](#state_domain_name_configuration_python) [DomainNameDomainNameConfigurationArgs](#domainnamedomainnameconfiguration)

Domain name configuration. See below.

[mutual\_tls\_authentication](#state_mutual_tls_authentication_python) [DomainNameMutualTlsAuthenticationArgs](#domainnamemutualtlsauthentication)

Mutual TLS authentication configuration for the domain name.

[region](#state_region_python) str

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[routing\_mode](#state_routing_mode_python) str

Mode to route traffic for the domain name. Valid values: `API_MAPPING_ONLY`, `ROUTING_RULE_ONLY`, `ROUTING_RULE_THEN_API_MAPPING`.

[tags](#state_tags_python) Mapping\[str, str\]

Map of tags to assign to the domain name. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tags\_all](#state_tags_all_python) Mapping\[str, str\]

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[apiMappingSelectionExpression](#state_apimappingselectionexpression_yaml) String

[API mapping selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-mapping-selection-expressions) for the domain name.

[arn](#state_arn_yaml) String

ARN of the domain name.

[domainName](#state_domainname_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Domain name. Must be between 1 and 512 characters in length.

[domainNameConfiguration](#state_domainnameconfiguration_yaml) [Property Map](#domainnamedomainnameconfiguration)

Domain name configuration. See below.

[mutualTlsAuthentication](#state_mutualtlsauthentication_yaml) [Property Map](#domainnamemutualtlsauthentication)

Mutual TLS authentication configuration for the domain name.

[region](#state_region_yaml) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[routingMode](#state_routingmode_yaml) String

Mode to route traffic for the domain name. Valid values: `API_MAPPING_ONLY`, `ROUTING_RULE_ONLY`, `ROUTING_RULE_THEN_API_MAPPING`.

[tags](#state_tags_yaml) Map<String>

Map of tags to assign to the domain name. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tagsAll](#state_tagsall_yaml) Map<String>

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

## Supporting Types[](#supporting-types)

#### DomainNameDomainNameConfiguration

, DomainNameDomainNameConfigurationArgs

[](#domainnamedomainnameconfiguration)

[CertificateArn](#certificatearn_csharp) This property is required. string

ARN of an AWS-managed certificate that will be used by the endpoint for the domain name. AWS Certificate Manager is the only supported source. Use the `aws.acm.Certificate` resource to configure an ACM certificate.

[EndpointType](#endpointtype_csharp) This property is required. string

Endpoint type. Valid values: `REGIONAL`.

[SecurityPolicy](#securitypolicy_csharp) This property is required. string

Transport Layer Security (TLS) version of the [security policy](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-custom-domain-tls-version.html) for the domain name. Valid values: `TLS_1_2`.

[HostedZoneId](#hostedzoneid_csharp) string

Amazon Route 53 Hosted Zone ID of the endpoint.

[IpAddressType](#ipaddresstype_csharp) string

The IP address types that can invoke the domain name. Valid values: `ipv4`, `dualstack`. Use `ipv4` to allow only IPv4 addresses to invoke your domain name, or use `dualstack` to allow both IPv4 and IPv6 addresses to invoke your domain name. Defaults to `ipv4`.

[OwnershipVerificationCertificateArn](#ownershipverificationcertificatearn_csharp) string

ARN of the AWS-issued certificate used to validate custom domain ownership (when `certificateArn` is issued via an ACM Private CA or `mutualTlsAuthentication` is configured with an ACM-imported certificate.)

[TargetDomainName](#targetdomainname_csharp) string

Target domain name.

[CertificateArn](#certificatearn_go) This property is required. string

ARN of an AWS-managed certificate that will be used by the endpoint for the domain name. AWS Certificate Manager is the only supported source. Use the `aws.acm.Certificate` resource to configure an ACM certificate.

[EndpointType](#endpointtype_go) This property is required. string

Endpoint type. Valid values: `REGIONAL`.

[SecurityPolicy](#securitypolicy_go) This property is required. string

Transport Layer Security (TLS) version of the [security policy](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-custom-domain-tls-version.html) for the domain name. Valid values: `TLS_1_2`.

[HostedZoneId](#hostedzoneid_go) string

Amazon Route 53 Hosted Zone ID of the endpoint.

[IpAddressType](#ipaddresstype_go) string

The IP address types that can invoke the domain name. Valid values: `ipv4`, `dualstack`. Use `ipv4` to allow only IPv4 addresses to invoke your domain name, or use `dualstack` to allow both IPv4 and IPv6 addresses to invoke your domain name. Defaults to `ipv4`.

[OwnershipVerificationCertificateArn](#ownershipverificationcertificatearn_go) string

ARN of the AWS-issued certificate used to validate custom domain ownership (when `certificateArn` is issued via an ACM Private CA or `mutualTlsAuthentication` is configured with an ACM-imported certificate.)

[TargetDomainName](#targetdomainname_go) string

Target domain name.

[certificate\_arn](#certificate_arn_hcl) This property is required. string

ARN of an AWS-managed certificate that will be used by the endpoint for the domain name. AWS Certificate Manager is the only supported source. Use the `aws.acm.Certificate` resource to configure an ACM certificate.

[endpoint\_type](#endpoint_type_hcl) This property is required. string

Endpoint type. Valid values: `REGIONAL`.

[security\_policy](#security_policy_hcl) This property is required. string

Transport Layer Security (TLS) version of the [security policy](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-custom-domain-tls-version.html) for the domain name. Valid values: `TLS_1_2`.

[hosted\_zone\_id](#hosted_zone_id_hcl) string

Amazon Route 53 Hosted Zone ID of the endpoint.

[ip\_address\_type](#ip_address_type_hcl) string

The IP address types that can invoke the domain name. Valid values: `ipv4`, `dualstack`. Use `ipv4` to allow only IPv4 addresses to invoke your domain name, or use `dualstack` to allow both IPv4 and IPv6 addresses to invoke your domain name. Defaults to `ipv4`.

[ownership\_verification\_certificate\_arn](#ownership_verification_certificate_arn_hcl) string

ARN of the AWS-issued certificate used to validate custom domain ownership (when `certificateArn` is issued via an ACM Private CA or `mutualTlsAuthentication` is configured with an ACM-imported certificate.)

[target\_domain\_name](#target_domain_name_hcl) string

Target domain name.

[certificateArn](#certificatearn_java) This property is required. String

ARN of an AWS-managed certificate that will be used by the endpoint for the domain name. AWS Certificate Manager is the only supported source. Use the `aws.acm.Certificate` resource to configure an ACM certificate.

[endpointType](#endpointtype_java) This property is required. String

Endpoint type. Valid values: `REGIONAL`.

[securityPolicy](#securitypolicy_java) This property is required. String

Transport Layer Security (TLS) version of the [security policy](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-custom-domain-tls-version.html) for the domain name. Valid values: `TLS_1_2`.

[hostedZoneId](#hostedzoneid_java) String

Amazon Route 53 Hosted Zone ID of the endpoint.

[ipAddressType](#ipaddresstype_java) String

The IP address types that can invoke the domain name. Valid values: `ipv4`, `dualstack`. Use `ipv4` to allow only IPv4 addresses to invoke your domain name, or use `dualstack` to allow both IPv4 and IPv6 addresses to invoke your domain name. Defaults to `ipv4`.

[ownershipVerificationCertificateArn](#ownershipverificationcertificatearn_java) String

ARN of the AWS-issued certificate used to validate custom domain ownership (when `certificateArn` is issued via an ACM Private CA or `mutualTlsAuthentication` is configured with an ACM-imported certificate.)

[targetDomainName](#targetdomainname_java) String

Target domain name.

[certificateArn](#certificatearn_nodejs) This property is required. string

ARN of an AWS-managed certificate that will be used by the endpoint for the domain name. AWS Certificate Manager is the only supported source. Use the `aws.acm.Certificate` resource to configure an ACM certificate.

[endpointType](#endpointtype_nodejs) This property is required. string

Endpoint type. Valid values: `REGIONAL`.

[securityPolicy](#securitypolicy_nodejs) This property is required. string

Transport Layer Security (TLS) version of the [security policy](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-custom-domain-tls-version.html) for the domain name. Valid values: `TLS_1_2`.

[hostedZoneId](#hostedzoneid_nodejs) string

Amazon Route 53 Hosted Zone ID of the endpoint.

[ipAddressType](#ipaddresstype_nodejs) string

The IP address types that can invoke the domain name. Valid values: `ipv4`, `dualstack`. Use `ipv4` to allow only IPv4 addresses to invoke your domain name, or use `dualstack` to allow both IPv4 and IPv6 addresses to invoke your domain name. Defaults to `ipv4`.

[ownershipVerificationCertificateArn](#ownershipverificationcertificatearn_nodejs) string

ARN of the AWS-issued certificate used to validate custom domain ownership (when `certificateArn` is issued via an ACM Private CA or `mutualTlsAuthentication` is configured with an ACM-imported certificate.)

[targetDomainName](#targetdomainname_nodejs) string

Target domain name.

[certificate\_arn](#certificate_arn_python) This property is required. str

ARN of an AWS-managed certificate that will be used by the endpoint for the domain name. AWS Certificate Manager is the only supported source. Use the `aws.acm.Certificate` resource to configure an ACM certificate.

[endpoint\_type](#endpoint_type_python) This property is required. str

Endpoint type. Valid values: `REGIONAL`.

[security\_policy](#security_policy_python) This property is required. str

Transport Layer Security (TLS) version of the [security policy](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-custom-domain-tls-version.html) for the domain name. Valid values: `TLS_1_2`.

[hosted\_zone\_id](#hosted_zone_id_python) str

Amazon Route 53 Hosted Zone ID of the endpoint.

[ip\_address\_type](#ip_address_type_python) str

The IP address types that can invoke the domain name. Valid values: `ipv4`, `dualstack`. Use `ipv4` to allow only IPv4 addresses to invoke your domain name, or use `dualstack` to allow both IPv4 and IPv6 addresses to invoke your domain name. Defaults to `ipv4`.

[ownership\_verification\_certificate\_arn](#ownership_verification_certificate_arn_python) str

ARN of the AWS-issued certificate used to validate custom domain ownership (when `certificateArn` is issued via an ACM Private CA or `mutualTlsAuthentication` is configured with an ACM-imported certificate.)

[target\_domain\_name](#target_domain_name_python) str

Target domain name.

[certificateArn](#certificatearn_yaml) This property is required. String

ARN of an AWS-managed certificate that will be used by the endpoint for the domain name. AWS Certificate Manager is the only supported source. Use the `aws.acm.Certificate` resource to configure an ACM certificate.

[endpointType](#endpointtype_yaml) This property is required. String

Endpoint type. Valid values: `REGIONAL`.

[securityPolicy](#securitypolicy_yaml) This property is required. String

Transport Layer Security (TLS) version of the [security policy](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-custom-domain-tls-version.html) for the domain name. Valid values: `TLS_1_2`.

[hostedZoneId](#hostedzoneid_yaml) String

Amazon Route 53 Hosted Zone ID of the endpoint.

[ipAddressType](#ipaddresstype_yaml) String

The IP address types that can invoke the domain name. Valid values: `ipv4`, `dualstack`. Use `ipv4` to allow only IPv4 addresses to invoke your domain name, or use `dualstack` to allow both IPv4 and IPv6 addresses to invoke your domain name. Defaults to `ipv4`.

[ownershipVerificationCertificateArn](#ownershipverificationcertificatearn_yaml) String

ARN of the AWS-issued certificate used to validate custom domain ownership (when `certificateArn` is issued via an ACM Private CA or `mutualTlsAuthentication` is configured with an ACM-imported certificate.)

[targetDomainName](#targetdomainname_yaml) String

Target domain name.

#### DomainNameMutualTlsAuthentication

, DomainNameMutualTlsAuthenticationArgs

[](#domainnamemutualtlsauthentication)

[TruststoreUri](#truststoreuri_csharp) This property is required. string

Amazon S3 URL that specifies the truststore for mutual TLS authentication, for example, `s3://bucket-name/key-name`. The truststore can contain certificates from public or private certificate authorities. To update the truststore, upload a new version to S3, and then update your custom domain name to use the new version.

[TruststoreVersion](#truststoreversion_csharp) string

Version of the S3 object that contains the truststore. To specify a version, you must have versioning enabled for the S3 bucket.

[TruststoreUri](#truststoreuri_go) This property is required. string

Amazon S3 URL that specifies the truststore for mutual TLS authentication, for example, `s3://bucket-name/key-name`. The truststore can contain certificates from public or private certificate authorities. To update the truststore, upload a new version to S3, and then update your custom domain name to use the new version.

[TruststoreVersion](#truststoreversion_go) string

Version of the S3 object that contains the truststore. To specify a version, you must have versioning enabled for the S3 bucket.

[truststore\_uri](#truststore_uri_hcl) This property is required. string

Amazon S3 URL that specifies the truststore for mutual TLS authentication, for example, `s3://bucket-name/key-name`. The truststore can contain certificates from public or private certificate authorities. To update the truststore, upload a new version to S3, and then update your custom domain name to use the new version.

[truststore\_version](#truststore_version_hcl) string

Version of the S3 object that contains the truststore. To specify a version, you must have versioning enabled for the S3 bucket.

[truststoreUri](#truststoreuri_java) This property is required. String

Amazon S3 URL that specifies the truststore for mutual TLS authentication, for example, `s3://bucket-name/key-name`. The truststore can contain certificates from public or private certificate authorities. To update the truststore, upload a new version to S3, and then update your custom domain name to use the new version.

[truststoreVersion](#truststoreversion_java) String

Version of the S3 object that contains the truststore. To specify a version, you must have versioning enabled for the S3 bucket.

[truststoreUri](#truststoreuri_nodejs) This property is required. string

Amazon S3 URL that specifies the truststore for mutual TLS authentication, for example, `s3://bucket-name/key-name`. The truststore can contain certificates from public or private certificate authorities. To update the truststore, upload a new version to S3, and then update your custom domain name to use the new version.

[truststoreVersion](#truststoreversion_nodejs) string

Version of the S3 object that contains the truststore. To specify a version, you must have versioning enabled for the S3 bucket.

[truststore\_uri](#truststore_uri_python) This property is required. str

Amazon S3 URL that specifies the truststore for mutual TLS authentication, for example, `s3://bucket-name/key-name`. The truststore can contain certificates from public or private certificate authorities. To update the truststore, upload a new version to S3, and then update your custom domain name to use the new version.

[truststore\_version](#truststore_version_python) str

Version of the S3 object that contains the truststore. To specify a version, you must have versioning enabled for the S3 bucket.

[truststoreUri](#truststoreuri_yaml) This property is required. String

Amazon S3 URL that specifies the truststore for mutual TLS authentication, for example, `s3://bucket-name/key-name`. The truststore can contain certificates from public or private certificate authorities. To update the truststore, upload a new version to S3, and then update your custom domain name to use the new version.

[truststoreVersion](#truststoreversion_yaml) String

Version of the S3 object that contains the truststore. To specify a version, you must have versioning enabled for the S3 bucket.

## Import[](#import)

Using `pulumi import`, import `aws.apigatewayv2.DomainName` using the domain name. For example:

```bash
$ pulumi import aws:apigatewayv2/domainName:DomainName example ws-api.example.com
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

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2fapigatewayv2%2fdomainname]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2fapigatewayv2%2fdomainname%2f\))

#### Try Pulumi Cloud free.
Your team will thank you.

[Start free trial](https://app.pulumi.com/signup?utm_source=registry&utm_medium=right-rail-banner&utm_campaign=try-pulumi-cloud&iaid=docs-try-pulumi-cloud-ad)
