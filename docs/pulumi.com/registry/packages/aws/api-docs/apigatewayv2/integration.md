---
Source: https://www.pulumi.com/registry/packages/aws/api-docs/apigatewayv2/integration/
Generated: 2026-06-06
Updated: 2026-06-06
---

# aws.apigatewayv2.Integration

1.  [Packages](/registry/)
2.  [Packages](/registry/packages/)
3.  [AWS](/registry/packages/aws/)
4.  [API Docs](/registry/packages/aws/api-docs/)
5.  [apigatewayv2](/registry/packages/aws/api-docs/apigatewayv2/)
6.  [Integration](/registry/packages/aws/api-docs/apigatewayv2/integration/)

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

Viewing docs for AWS v7.32.0
published on Friday, May 29, 2026 by Pulumi

[Schema (JSON)](/registry/packages/aws/schema.json)

[pulumi/pulumi-aws](https://github.com/pulumi/pulumi-aws)

v7.32.0 (7.x, latest)v6.83.1 (6.x)v5.43.0 (5.x)

# aws.apigatewayv2.Integration[](#aws-apigatewayv2-integration)

Explore with Neo

-   Copy Page

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2fapigatewayv2%2fintegration]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2fapigatewayv2%2fintegration%2f\))

Manages an Amazon API Gateway Version 2 integration. More information can be found in the [Amazon API Gateway Developer Guide](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api.html).

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

const example = new aws.apigatewayv2.Integration("example", {
    apiId: exampleAwsApigatewayv2Api.id,
    integrationType: "MOCK",
});
```

```python
import pulumi
import pulumi_aws as aws

example = aws.apigatewayv2.Integration("example",
    api_id=example_aws_apigatewayv2_api["id"],
    integration_type="MOCK")
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/apigatewayv2"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		_, err := apigatewayv2.NewIntegration(ctx, "example", &apigatewayv2.IntegrationArgs{
			ApiId:           pulumi.Any(exampleAwsApigatewayv2Api.Id),
			IntegrationType: pulumi.String("MOCK"),
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
    var example = new Aws.ApiGatewayV2.Integration("example", new()
    {
        ApiId = exampleAwsApigatewayv2Api.Id,
        IntegrationType = "MOCK",
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.apigatewayv2.Integration;
import com.pulumi.aws.apigatewayv2.IntegrationArgs;
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
        var example = new Integration("example", IntegrationArgs.builder()
            .apiId(exampleAwsApigatewayv2Api.id())
            .integrationType("MOCK")
            .build());

    }
}
```

```yaml
resources:
  example:
    type: aws:apigatewayv2:Integration
    properties:
      apiId: ${exampleAwsApigatewayv2Api.id}
      integrationType: MOCK
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_apigatewayv2_integration" "example" {
  api_id           = exampleAwsApigatewayv2Api.id
  integration_type = "MOCK"
}
```

### Lambda Integration[](#lambda-integration)

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

const example = new aws.lambda.Function("example", {
    code: new pulumi.asset.FileArchive("example.zip"),
    name: "Example",
    role: exampleAwsIamRole.arn,
    handler: "index.handler",
    runtime: aws.lambda.Runtime.NodeJS24dX,
});
const exampleIntegration = new aws.apigatewayv2.Integration("example", {
    apiId: exampleAwsApigatewayv2Api.id,
    integrationType: "AWS_PROXY",
    connectionType: "INTERNET",
    contentHandlingStrategy: "CONVERT_TO_TEXT",
    description: "Lambda example",
    integrationMethod: "POST",
    integrationUri: example.invokeArn,
    passthroughBehavior: "WHEN_NO_MATCH",
});
```

```python
import pulumi
import pulumi_aws as aws

example = aws.lambda_.Function("example",
    code=pulumi.FileArchive("example.zip"),
    name="Example",
    role=example_aws_iam_role["arn"],
    handler="index.handler",
    runtime=aws.lambda_.Runtime.NODE_JS24D_X)
example_integration = aws.apigatewayv2.Integration("example",
    api_id=example_aws_apigatewayv2_api["id"],
    integration_type="AWS_PROXY",
    connection_type="INTERNET",
    content_handling_strategy="CONVERT_TO_TEXT",
    description="Lambda example",
    integration_method="POST",
    integration_uri=example.invoke_arn,
    passthrough_behavior="WHEN_NO_MATCH")
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/apigatewayv2"
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/lambda"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		example, err := lambda.NewFunction(ctx, "example", &lambda.FunctionArgs{
			Code:    pulumi.NewFileArchive("example.zip"),
			Name:    pulumi.String("Example"),
			Role:    pulumi.Any(exampleAwsIamRole.Arn),
			Handler: pulumi.String("index.handler"),
			Runtime: pulumi.String(lambda.RuntimeNodeJS24dX),
		})
		if err != nil {
			return err
		}
		_, err = apigatewayv2.NewIntegration(ctx, "example", &apigatewayv2.IntegrationArgs{
			ApiId:                   pulumi.Any(exampleAwsApigatewayv2Api.Id),
			IntegrationType:         pulumi.String("AWS_PROXY"),
			ConnectionType:          pulumi.String("INTERNET"),
			ContentHandlingStrategy: pulumi.String("CONVERT_TO_TEXT"),
			Description:             pulumi.String("Lambda example"),
			IntegrationMethod:       pulumi.String("POST"),
			IntegrationUri:          example.InvokeArn,
			PassthroughBehavior:     pulumi.String("WHEN_NO_MATCH"),
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
    var example = new Aws.Lambda.Function("example", new()
    {
        Code = new FileArchive("example.zip"),
        Name = "Example",
        Role = exampleAwsIamRole.Arn,
        Handler = "index.handler",
        Runtime = Aws.Lambda.Runtime.NodeJS24dX,
    });

    var exampleIntegration = new Aws.ApiGatewayV2.Integration("example", new()
    {
        ApiId = exampleAwsApigatewayv2Api.Id,
        IntegrationType = "AWS_PROXY",
        ConnectionType = "INTERNET",
        ContentHandlingStrategy = "CONVERT_TO_TEXT",
        Description = "Lambda example",
        IntegrationMethod = "POST",
        IntegrationUri = example.InvokeArn,
        PassthroughBehavior = "WHEN_NO_MATCH",
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.lambda.Function;
import com.pulumi.aws.lambda.FunctionArgs;
import com.pulumi.aws.apigatewayv2.Integration;
import com.pulumi.aws.apigatewayv2.IntegrationArgs;
import com.pulumi.asset.FileArchive;
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
        var example = new Function("example", FunctionArgs.builder()
            .code(new FileArchive("example.zip"))
            .name("Example")
            .role(exampleAwsIamRole.arn())
            .handler("index.handler")
            .runtime("nodejs24.x")
            .build());

        var exampleIntegration = new Integration("exampleIntegration", IntegrationArgs.builder()
            .apiId(exampleAwsApigatewayv2Api.id())
            .integrationType("AWS_PROXY")
            .connectionType("INTERNET")
            .contentHandlingStrategy("CONVERT_TO_TEXT")
            .description("Lambda example")
            .integrationMethod("POST")
            .integrationUri(example.invokeArn())
            .passthroughBehavior("WHEN_NO_MATCH")
            .build());

    }
}
```

```yaml
resources:
  example:
    type: aws:lambda:Function
    properties:
      code:
        fn::fileArchive: example.zip
      name: Example
      role: ${exampleAwsIamRole.arn}
      handler: index.handler
      runtime: nodejs24.x
  exampleIntegration:
    type: aws:apigatewayv2:Integration
    name: example
    properties:
      apiId: ${exampleAwsApigatewayv2Api.id}
      integrationType: AWS_PROXY
      connectionType: INTERNET
      contentHandlingStrategy: CONVERT_TO_TEXT
      description: Lambda example
      integrationMethod: POST
      integrationUri: ${example.invokeArn}
      passthroughBehavior: WHEN_NO_MATCH
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_lambda_function" "example" {
  code    = fileArchive("example.zip")
  name    = "Example"
  role    = exampleAwsIamRole.arn
  handler = "index.handler"
  runtime = "nodejs24.x"
}
resource "aws_apigatewayv2_integration" "example" {
  api_id                    = exampleAwsApigatewayv2Api.id
  integration_type          = "AWS_PROXY"
  connection_type           = "INTERNET"
  content_handling_strategy = "CONVERT_TO_TEXT"
  description               = "Lambda example"
  integration_method        = "POST"
  integration_uri           = aws_lambda_function.example.invoke_arn
  passthrough_behavior      = "WHEN_NO_MATCH"
}
```

### AWS Service Integration[](#aws-service-integration)

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

const example = new aws.apigatewayv2.Integration("example", {
    apiId: exampleAwsApigatewayv2Api.id,
    credentialsArn: exampleAwsIamRole.arn,
    description: "SQS example",
    integrationType: "AWS_PROXY",
    integrationSubtype: "SQS-SendMessage",
    requestParameters: {
        QueueUrl: "$request.header.queueUrl",
        MessageBody: "$request.body.message",
    },
});
```

```python
import pulumi
import pulumi_aws as aws

example = aws.apigatewayv2.Integration("example",
    api_id=example_aws_apigatewayv2_api["id"],
    credentials_arn=example_aws_iam_role["arn"],
    description="SQS example",
    integration_type="AWS_PROXY",
    integration_subtype="SQS-SendMessage",
    request_parameters={
        "QueueUrl": "$request.header.queueUrl",
        "MessageBody": "$request.body.message",
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
		_, err := apigatewayv2.NewIntegration(ctx, "example", &apigatewayv2.IntegrationArgs{
			ApiId:              pulumi.Any(exampleAwsApigatewayv2Api.Id),
			CredentialsArn:     pulumi.Any(exampleAwsIamRole.Arn),
			Description:        pulumi.String("SQS example"),
			IntegrationType:    pulumi.String("AWS_PROXY"),
			IntegrationSubtype: pulumi.String("SQS-SendMessage"),
			RequestParameters: pulumi.StringMap{
				"QueueUrl":    pulumi.String("$request.header.queueUrl"),
				"MessageBody": pulumi.String("$request.body.message"),
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
    var example = new Aws.ApiGatewayV2.Integration("example", new()
    {
        ApiId = exampleAwsApigatewayv2Api.Id,
        CredentialsArn = exampleAwsIamRole.Arn,
        Description = "SQS example",
        IntegrationType = "AWS_PROXY",
        IntegrationSubtype = "SQS-SendMessage",
        RequestParameters =
        {
            { "QueueUrl", "$request.header.queueUrl" },
            { "MessageBody", "$request.body.message" },
        },
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.apigatewayv2.Integration;
import com.pulumi.aws.apigatewayv2.IntegrationArgs;
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
        var example = new Integration("example", IntegrationArgs.builder()
            .apiId(exampleAwsApigatewayv2Api.id())
            .credentialsArn(exampleAwsIamRole.arn())
            .description("SQS example")
            .integrationType("AWS_PROXY")
            .integrationSubtype("SQS-SendMessage")
            .requestParameters(Map.ofEntries(
                Map.entry("QueueUrl", "$request.header.queueUrl"),
                Map.entry("MessageBody", "$request.body.message")
            ))
            .build());

    }
}
```

```yaml
resources:
  example:
    type: aws:apigatewayv2:Integration
    properties:
      apiId: ${exampleAwsApigatewayv2Api.id}
      credentialsArn: ${exampleAwsIamRole.arn}
      description: SQS example
      integrationType: AWS_PROXY
      integrationSubtype: SQS-SendMessage
      requestParameters:
        QueueUrl: $request.header.queueUrl
        MessageBody: $request.body.message
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_apigatewayv2_integration" "example" {
  api_id              = exampleAwsApigatewayv2Api.id
  credentials_arn     = exampleAwsIamRole.arn
  description         = "SQS example"
  integration_type    = "AWS_PROXY"
  integration_subtype = "SQS-SendMessage"
  request_parameters = {
    "QueueUrl"    = "$request.header.queueUrl"
    "MessageBody" = "$request.body.message"
  }
}
```

### Private Integration[](#private-integration)

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

const example = new aws.apigatewayv2.Integration("example", {
    apiId: exampleAwsApigatewayv2Api.id,
    credentialsArn: exampleAwsIamRole.arn,
    description: "Example with a load balancer",
    integrationType: "HTTP_PROXY",
    integrationUri: exampleAwsLbListener.arn,
    integrationMethod: "ANY",
    connectionType: "VPC_LINK",
    connectionId: exampleAwsApigatewayv2VpcLink.id,
    tlsConfig: {
        serverNameToVerify: "example.com",
    },
    requestParameters: {
        "append:header.authforintegration": "$context.authorizer.authorizerResponse",
        "overwrite:path": "staticValueForIntegration",
    },
    responseParameters: [
        {
            statusCode: "403",
            mappings: {
                "append:header.auth": "$context.authorizer.authorizerResponse",
            },
        },
        {
            statusCode: "200",
            mappings: {
                "overwrite:statuscode": "204",
            },
        },
    ],
});
```

```python
import pulumi
import pulumi_aws as aws

example = aws.apigatewayv2.Integration("example",
    api_id=example_aws_apigatewayv2_api["id"],
    credentials_arn=example_aws_iam_role["arn"],
    description="Example with a load balancer",
    integration_type="HTTP_PROXY",
    integration_uri=example_aws_lb_listener["arn"],
    integration_method="ANY",
    connection_type="VPC_LINK",
    connection_id=example_aws_apigatewayv2_vpc_link["id"],
    tls_config={
        "server_name_to_verify": "example.com",
    },
    request_parameters={
        "append:header.authforintegration": "$context.authorizer.authorizerResponse",
        "overwrite:path": "staticValueForIntegration",
    },
    response_parameters=[
        {
            "status_code": "403",
            "mappings": {
                "append:header.auth": "$context.authorizer.authorizerResponse",
            },
        },
        {
            "status_code": "200",
            "mappings": {
                "overwrite:statuscode": "204",
            },
        },
    ])
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/apigatewayv2"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		_, err := apigatewayv2.NewIntegration(ctx, "example", &apigatewayv2.IntegrationArgs{
			ApiId:             pulumi.Any(exampleAwsApigatewayv2Api.Id),
			CredentialsArn:    pulumi.Any(exampleAwsIamRole.Arn),
			Description:       pulumi.String("Example with a load balancer"),
			IntegrationType:   pulumi.String("HTTP_PROXY"),
			IntegrationUri:    pulumi.Any(exampleAwsLbListener.Arn),
			IntegrationMethod: pulumi.String("ANY"),
			ConnectionType:    pulumi.String("VPC_LINK"),
			ConnectionId:      pulumi.Any(exampleAwsApigatewayv2VpcLink.Id),
			TlsConfig: &apigatewayv2.IntegrationTlsConfigArgs{
				ServerNameToVerify: pulumi.String("example.com"),
			},
			RequestParameters: pulumi.StringMap{
				"append:header.authforintegration": pulumi.String("$context.authorizer.authorizerResponse"),
				"overwrite:path":                   pulumi.String("staticValueForIntegration"),
			},
			ResponseParameters: apigatewayv2.IntegrationResponseParameterArray{
				&apigatewayv2.IntegrationResponseParameterArgs{
					StatusCode: pulumi.String("403"),
					Mappings: pulumi.StringMap{
						"append:header.auth": pulumi.String("$context.authorizer.authorizerResponse"),
					},
				},
				&apigatewayv2.IntegrationResponseParameterArgs{
					StatusCode: pulumi.String("200"),
					Mappings: pulumi.StringMap{
						"overwrite:statuscode": pulumi.String("204"),
					},
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
    var example = new Aws.ApiGatewayV2.Integration("example", new()
    {
        ApiId = exampleAwsApigatewayv2Api.Id,
        CredentialsArn = exampleAwsIamRole.Arn,
        Description = "Example with a load balancer",
        IntegrationType = "HTTP_PROXY",
        IntegrationUri = exampleAwsLbListener.Arn,
        IntegrationMethod = "ANY",
        ConnectionType = "VPC_LINK",
        ConnectionId = exampleAwsApigatewayv2VpcLink.Id,
        TlsConfig = new Aws.ApiGatewayV2.Inputs.IntegrationTlsConfigArgs
        {
            ServerNameToVerify = "example.com",
        },
        RequestParameters =
        {
            { "append:header.authforintegration", "$context.authorizer.authorizerResponse" },
            { "overwrite:path", "staticValueForIntegration" },
        },
        ResponseParameters = new[]
        {
            new Aws.ApiGatewayV2.Inputs.IntegrationResponseParameterArgs
            {
                StatusCode = "403",
                Mappings =
                {
                    { "append:header.auth", "$context.authorizer.authorizerResponse" },
                },
            },
            new Aws.ApiGatewayV2.Inputs.IntegrationResponseParameterArgs
            {
                StatusCode = "200",
                Mappings =
                {
                    { "overwrite:statuscode", "204" },
                },
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
import com.pulumi.aws.apigatewayv2.Integration;
import com.pulumi.aws.apigatewayv2.IntegrationArgs;
import com.pulumi.aws.apigatewayv2.inputs.IntegrationTlsConfigArgs;
import com.pulumi.aws.apigatewayv2.inputs.IntegrationResponseParameterArgs;
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
        var example = new Integration("example", IntegrationArgs.builder()
            .apiId(exampleAwsApigatewayv2Api.id())
            .credentialsArn(exampleAwsIamRole.arn())
            .description("Example with a load balancer")
            .integrationType("HTTP_PROXY")
            .integrationUri(exampleAwsLbListener.arn())
            .integrationMethod("ANY")
            .connectionType("VPC_LINK")
            .connectionId(exampleAwsApigatewayv2VpcLink.id())
            .tlsConfig(IntegrationTlsConfigArgs.builder()
                .serverNameToVerify("example.com")
                .build())
            .requestParameters(Map.ofEntries(
                Map.entry("append:header.authforintegration", "$context.authorizer.authorizerResponse"),
                Map.entry("overwrite:path", "staticValueForIntegration")
            ))
            .responseParameters(
                IntegrationResponseParameterArgs.builder()
                    .statusCode("403")
                    .mappings(Map.of("append:header.auth", "$context.authorizer.authorizerResponse"))
                    .build(),
                IntegrationResponseParameterArgs.builder()
                    .statusCode("200")
                    .mappings(Map.of("overwrite:statuscode", "204"))
                    .build())
            .build());

    }
}
```

```yaml
resources:
  example:
    type: aws:apigatewayv2:Integration
    properties:
      apiId: ${exampleAwsApigatewayv2Api.id}
      credentialsArn: ${exampleAwsIamRole.arn}
      description: Example with a load balancer
      integrationType: HTTP_PROXY
      integrationUri: ${exampleAwsLbListener.arn}
      integrationMethod: ANY
      connectionType: VPC_LINK
      connectionId: ${exampleAwsApigatewayv2VpcLink.id}
      tlsConfig:
        serverNameToVerify: example.com
      requestParameters:
        append:header.authforintegration: $context.authorizer.authorizerResponse
        overwrite:path: staticValueForIntegration
      responseParameters:
        - statusCode: 403
          mappings:
            append:header.auth: $context.authorizer.authorizerResponse
        - statusCode: 200
          mappings:
            overwrite:statuscode: '204'
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_apigatewayv2_integration" "example" {
  api_id             = exampleAwsApigatewayv2Api.id
  credentials_arn    = exampleAwsIamRole.arn
  description        = "Example with a load balancer"
  integration_type   = "HTTP_PROXY"
  integration_uri    = exampleAwsLbListener.arn
  integration_method = "ANY"
  connection_type    = "VPC_LINK"
  connection_id      = exampleAwsApigatewayv2VpcLink.id
  tls_config = {
    server_name_to_verify = "example.com"
  }
  request_parameters = {
    "append:header.authforintegration" = "$context.authorizer.authorizerResponse"
    "overwrite:path"                   = "staticValueForIntegration"
  }
  response_parameters {
    status_code = 403
    mappings = {
      "append:header.auth" = "$context.authorizer.authorizerResponse"
    }
  }
  response_parameters {
    status_code = 200
    mappings = {
      "overwrite:statuscode" = "204"
    }
  }
}
```

## Create Integration Resource[](#create)

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
new Integration(name: string, args: IntegrationArgs, opts?: CustomResourceOptions);
```

```python
@overload
def Integration(resource_name: str,
                args: IntegrationArgs,
                opts: Optional[ResourceOptions] = None)

@overload
def Integration(resource_name: str,
                opts: Optional[ResourceOptions] = None,
                api_id: Optional[str] = None,
                integration_type: Optional[str] = None,
                credentials_arn: Optional[str] = None,
                payload_format_version: Optional[str] = None,
                connection_type: Optional[str] = None,
                description: Optional[str] = None,
                integration_method: Optional[str] = None,
                integration_subtype: Optional[str] = None,
                connection_id: Optional[str] = None,
                integration_uri: Optional[str] = None,
                passthrough_behavior: Optional[str] = None,
                content_handling_strategy: Optional[str] = None,
                region: Optional[str] = None,
                request_parameters: Optional[Mapping[str, str]] = None,
                request_templates: Optional[Mapping[str, str]] = None,
                response_parameters: Optional[Sequence[IntegrationResponseParameterArgs]] = None,
                template_selection_expression: Optional[str] = None,
                timeout_milliseconds: Optional[int] = None,
                tls_config: Optional[IntegrationTlsConfigArgs] = None)
```

```go
func NewIntegration(ctx *Context, name string, args IntegrationArgs, opts ...ResourceOption) (*Integration, error)
```

```csharp
public Integration(string name, IntegrationArgs args, CustomResourceOptions? opts = null)
```

```java
public Integration(String name, IntegrationArgs args)
public Integration(String name, IntegrationArgs args, CustomResourceOptions options)
```

```yaml
type: aws:apigatewayv2:Integration
properties: # The arguments to resource properties.
options: # Bag of options to control resource's behavior.
```

```hcl
resource "aws_apigatewayv2_integration" "name" {
    # resource properties
}
```

#### Parameters[](#parameters)

name This property is required. string

The unique name of the resource.

args This property is required. [IntegrationArgs](#inputs)

The arguments to resource properties.

opts [CustomResourceOptions](/docs/reference/pkg/nodejs/pulumi/pulumi/#CustomResourceOptions)

Bag of options to control resource's behavior.

resource\_name This property is required. str

The unique name of the resource.

args This property is required. [IntegrationArgs](#inputs)

The arguments to resource properties.

opts [ResourceOptions](/docs/reference/pkg/python/pulumi/#pulumi.ResourceOptions)

Bag of options to control resource's behavior.

ctx [Context](https://pkg.go.dev/github.com/pulumi/pulumi/sdk/v3/go/pulumi?tab=doc#Context)

Context object for the current deployment.

name This property is required. string

The unique name of the resource.

args This property is required. [IntegrationArgs](#inputs)

The arguments to resource properties.

opts [ResourceOption](https://pkg.go.dev/github.com/pulumi/pulumi/sdk/v3/go/pulumi?tab=doc#ResourceOption)

Bag of options to control resource's behavior.

name This property is required. string

The unique name of the resource.

args This property is required. [IntegrationArgs](#inputs)

The arguments to resource properties.

opts [CustomResourceOptions](/docs/reference/pkg/dotnet/Pulumi/Pulumi.CustomResourceOptions.html)

Bag of options to control resource's behavior.

name This property is required. String

The unique name of the resource.

args This property is required. [IntegrationArgs](#inputs)

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
var awsIntegrationResource = new Aws.ApiGatewayV2.Integration("awsIntegrationResource", new()
{
    ApiId = "string",
    IntegrationType = "string",
    CredentialsArn = "string",
    PayloadFormatVersion = "string",
    ConnectionType = "string",
    Description = "string",
    IntegrationMethod = "string",
    IntegrationSubtype = "string",
    ConnectionId = "string",
    IntegrationUri = "string",
    PassthroughBehavior = "string",
    ContentHandlingStrategy = "string",
    Region = "string",
    RequestParameters =
    {
        { "string", "string" },
    },
    RequestTemplates =
    {
        { "string", "string" },
    },
    ResponseParameters = new[]
    {
        new Aws.ApiGatewayV2.Inputs.IntegrationResponseParameterArgs
        {
            Mappings =
            {
                { "string", "string" },
            },
            StatusCode = "string",
        },
    },
    TemplateSelectionExpression = "string",
    TimeoutMilliseconds = 0,
    TlsConfig = new Aws.ApiGatewayV2.Inputs.IntegrationTlsConfigArgs
    {
        ServerNameToVerify = "string",
    },
});
```

```go
example, err := apigatewayv2.NewIntegration(ctx, "awsIntegrationResource", &apigatewayv2.IntegrationArgs{
	ApiId:                   pulumi.String("string"),
	IntegrationType:         pulumi.String("string"),
	CredentialsArn:          pulumi.String("string"),
	PayloadFormatVersion:    pulumi.String("string"),
	ConnectionType:          pulumi.String("string"),
	Description:             pulumi.String("string"),
	IntegrationMethod:       pulumi.String("string"),
	IntegrationSubtype:      pulumi.String("string"),
	ConnectionId:            pulumi.String("string"),
	IntegrationUri:          pulumi.String("string"),
	PassthroughBehavior:     pulumi.String("string"),
	ContentHandlingStrategy: pulumi.String("string"),
	Region:                  pulumi.String("string"),
	RequestParameters: pulumi.StringMap{
		"string": pulumi.String("string"),
	},
	RequestTemplates: pulumi.StringMap{
		"string": pulumi.String("string"),
	},
	ResponseParameters: apigatewayv2.IntegrationResponseParameterArray{
		&apigatewayv2.IntegrationResponseParameterArgs{
			Mappings: pulumi.StringMap{
				"string": pulumi.String("string"),
			},
			StatusCode: pulumi.String("string"),
		},
	},
	TemplateSelectionExpression: pulumi.String("string"),
	TimeoutMilliseconds:         pulumi.Int(0),
	TlsConfig: &apigatewayv2.IntegrationTlsConfigArgs{
		ServerNameToVerify: pulumi.String("string"),
	},
})
```

```hcl
resource "aws_apigatewayv2_integration" "awsIntegrationResource" {
  api_id                    = "string"
  integration_type          = "string"
  credentials_arn           = "string"
  payload_format_version    = "string"
  connection_type           = "string"
  description               = "string"
  integration_method        = "string"
  integration_subtype       = "string"
  connection_id             = "string"
  integration_uri           = "string"
  passthrough_behavior      = "string"
  content_handling_strategy = "string"
  region                    = "string"
  request_parameters = {
    "string" = "string"
  }
  request_templates = {
    "string" = "string"
  }
  response_parameters {
    mappings = {
      "string" = "string"
    }
    status_code = "string"
  }
  template_selection_expression = "string"
  timeout_milliseconds          = 0
  tls_config = {
    server_name_to_verify = "string"
  }
}
```

```java
var awsIntegrationResource = new com.pulumi.aws.apigatewayv2.Integration("awsIntegrationResource", com.pulumi.aws.apigatewayv2.IntegrationArgs.builder()
    .apiId("string")
    .integrationType("string")
    .credentialsArn("string")
    .payloadFormatVersion("string")
    .connectionType("string")
    .description("string")
    .integrationMethod("string")
    .integrationSubtype("string")
    .connectionId("string")
    .integrationUri("string")
    .passthroughBehavior("string")
    .contentHandlingStrategy("string")
    .region("string")
    .requestParameters(Map.of("string", "string"))
    .requestTemplates(Map.of("string", "string"))
    .responseParameters(IntegrationResponseParameterArgs.builder()
        .mappings(Map.of("string", "string"))
        .statusCode("string")
        .build())
    .templateSelectionExpression("string")
    .timeoutMilliseconds(0)
    .tlsConfig(IntegrationTlsConfigArgs.builder()
        .serverNameToVerify("string")
        .build())
    .build());
```

```python
aws_integration_resource = aws.apigatewayv2.Integration("awsIntegrationResource",
    api_id="string",
    integration_type="string",
    credentials_arn="string",
    payload_format_version="string",
    connection_type="string",
    description="string",
    integration_method="string",
    integration_subtype="string",
    connection_id="string",
    integration_uri="string",
    passthrough_behavior="string",
    content_handling_strategy="string",
    region="string",
    request_parameters={
        "string": "string",
    },
    request_templates={
        "string": "string",
    },
    response_parameters=[{
        "mappings": {
            "string": "string",
        },
        "status_code": "string",
    }],
    template_selection_expression="string",
    timeout_milliseconds=0,
    tls_config={
        "server_name_to_verify": "string",
    })
```

```typescript
const awsIntegrationResource = new aws.apigatewayv2.Integration("awsIntegrationResource", {
    apiId: "string",
    integrationType: "string",
    credentialsArn: "string",
    payloadFormatVersion: "string",
    connectionType: "string",
    description: "string",
    integrationMethod: "string",
    integrationSubtype: "string",
    connectionId: "string",
    integrationUri: "string",
    passthroughBehavior: "string",
    contentHandlingStrategy: "string",
    region: "string",
    requestParameters: {
        string: "string",
    },
    requestTemplates: {
        string: "string",
    },
    responseParameters: [{
        mappings: {
            string: "string",
        },
        statusCode: "string",
    }],
    templateSelectionExpression: "string",
    timeoutMilliseconds: 0,
    tlsConfig: {
        serverNameToVerify: "string",
    },
});
```

```yaml
type: aws:apigatewayv2:Integration
properties:
    apiId: string
    connectionId: string
    connectionType: string
    contentHandlingStrategy: string
    credentialsArn: string
    description: string
    integrationMethod: string
    integrationSubtype: string
    integrationType: string
    integrationUri: string
    passthroughBehavior: string
    payloadFormatVersion: string
    region: string
    requestParameters:
        string: string
    requestTemplates:
        string: string
    responseParameters:
        - mappings:
            string: string
          statusCode: string
    templateSelectionExpression: string
    timeoutMilliseconds: 0
    tlsConfig:
        serverNameToVerify: string
```

## Integration Resource Properties[](#properties)

To learn more about resource properties and how to use them, see [Inputs and Outputs](/docs/intro/concepts/inputs-outputs) in the Architecture and Concepts docs.

### Inputs[](#inputs)

In Python, inputs that are objects can be passed either as [argument classes or as dictionary literals](/docs/languages-sdks/python/#inputs-and-outputs).

The Integration resource accepts the following [input](/docs/intro/concepts/inputs-outputs) properties:

[ApiId](#apiid_csharp)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

API identifier.

[IntegrationType](#integrationtype_csharp)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

Integration type of an integration. Valid values: `AWS` (supported only for WebSocket APIs), `AWS_PROXY`, `HTTP` (supported only for WebSocket APIs), `HTTP_PROXY`, `MOCK` (supported only for WebSocket APIs). For an HTTP API private integration, use `HTTP_PROXY`.

[ConnectionId](#connectionid_csharp) string

ID of the VPC link for a private integration. Supported only for HTTP APIs. Must be between 1 and 1024 characters in length.

[ConnectionType](#connectiontype_csharp) string

Type of the network connection to the integration endpoint. Valid values: `INTERNET`, `VPC_LINK`. Default is `INTERNET`.

[ContentHandlingStrategy](#contenthandlingstrategy_csharp) string

How to handle response payload content type conversions. Valid values: `CONVERT_TO_BINARY`, `CONVERT_TO_TEXT`. Supported only for WebSocket APIs.

[CredentialsArn](#credentialsarn_csharp) string

Credentials required for the integration, if any.

[Description](#description_csharp) string

Description of the integration.

[IntegrationMethod](#integrationmethod_csharp) string

Integration's HTTP method. Must be specified if `integrationType` is not `MOCK`.

[IntegrationSubtype](#integrationsubtype_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

AWS service action to invoke. Supported only for HTTP APIs when `integrationType` is `AWS_PROXY`. See the [AWS service integration reference](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-aws-services-reference.html) documentation for supported values. Must be between 1 and 128 characters in length.

[IntegrationUri](#integrationuri_csharp) string

URI of the Lambda function for a Lambda proxy integration, when `integrationType` is `AWS_PROXY`. For an `HTTP` integration, specify a fully-qualified URL. For an HTTP API private integration, specify the ARN of an Application Load Balancer listener, Network Load Balancer listener, or AWS Cloud Map service.

[PassthroughBehavior](#passthroughbehavior_csharp) string

Pass-through behavior for incoming requests based on the Content-Type header in the request, and the available mapping templates specified as the `requestTemplates` attribute. Valid values: `WHEN_NO_MATCH`, `WHEN_NO_TEMPLATES`, `NEVER`. Default is `WHEN_NO_MATCH`. Supported only for WebSocket APIs.

[PayloadFormatVersion](#payloadformatversion_csharp) string

The [format of the payload](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html#http-api-develop-integrations-lambda.proxy-format) sent to an integration. Valid values: `1.0`, `2.0`. Default is `1.0`.

[Region](#region_csharp) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[RequestParameters](#requestparameters_csharp) Dictionary<string, string>

For WebSocket APIs, a key-value map specifying request parameters that are passed from the method request to the backend. For HTTP APIs with a specified `integrationSubtype`, a key-value map specifying parameters that are passed to `AWS_PROXY` integrations. For HTTP APIs without a specified `integrationSubtype`, a key-value map specifying how to transform HTTP requests before sending them to the backend. See the [Amazon API Gateway Developer Guide](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-parameter-mapping.html) for details.

[RequestTemplates](#requesttemplates_csharp) Dictionary<string, string>

Map of [Velocity](https://velocity.apache.org/) templates that are applied on the request payload based on the value of the Content-Type header sent by the client. Supported only for WebSocket APIs.

[ResponseParameters](#responseparameters_csharp) [List<IntegrationResponseParameter>](#integrationresponseparameter)

Mappings to transform the HTTP response from a backend integration before returning the response to clients. Supported only for HTTP APIs.

[TemplateSelectionExpression](#templateselectionexpression_csharp) string

The [template selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-template-selection-expressions) for the integration.

[TimeoutMilliseconds](#timeoutmilliseconds_csharp) int

Custom timeout between 50 and 29,000 milliseconds for WebSocket APIs and between 50 and 30,000 milliseconds for HTTP APIs. The default timeout is 29 seconds for WebSocket APIs and 30 seconds for HTTP APIs. this provider will only perform drift detection of its value when present in a configuration.

[TlsConfig](#tlsconfig_csharp) [IntegrationTlsConfig](#integrationtlsconfig)

TLS configuration for a private integration. Supported only for HTTP APIs.

[ApiId](#apiid_go)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

API identifier.

[IntegrationType](#integrationtype_go)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

Integration type of an integration. Valid values: `AWS` (supported only for WebSocket APIs), `AWS_PROXY`, `HTTP` (supported only for WebSocket APIs), `HTTP_PROXY`, `MOCK` (supported only for WebSocket APIs). For an HTTP API private integration, use `HTTP_PROXY`.

[ConnectionId](#connectionid_go) string

ID of the VPC link for a private integration. Supported only for HTTP APIs. Must be between 1 and 1024 characters in length.

[ConnectionType](#connectiontype_go) string

Type of the network connection to the integration endpoint. Valid values: `INTERNET`, `VPC_LINK`. Default is `INTERNET`.

[ContentHandlingStrategy](#contenthandlingstrategy_go) string

How to handle response payload content type conversions. Valid values: `CONVERT_TO_BINARY`, `CONVERT_TO_TEXT`. Supported only for WebSocket APIs.

[CredentialsArn](#credentialsarn_go) string

Credentials required for the integration, if any.

[Description](#description_go) string

Description of the integration.

[IntegrationMethod](#integrationmethod_go) string

Integration's HTTP method. Must be specified if `integrationType` is not `MOCK`.

[IntegrationSubtype](#integrationsubtype_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

AWS service action to invoke. Supported only for HTTP APIs when `integrationType` is `AWS_PROXY`. See the [AWS service integration reference](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-aws-services-reference.html) documentation for supported values. Must be between 1 and 128 characters in length.

[IntegrationUri](#integrationuri_go) string

URI of the Lambda function for a Lambda proxy integration, when `integrationType` is `AWS_PROXY`. For an `HTTP` integration, specify a fully-qualified URL. For an HTTP API private integration, specify the ARN of an Application Load Balancer listener, Network Load Balancer listener, or AWS Cloud Map service.

[PassthroughBehavior](#passthroughbehavior_go) string

Pass-through behavior for incoming requests based on the Content-Type header in the request, and the available mapping templates specified as the `requestTemplates` attribute. Valid values: `WHEN_NO_MATCH`, `WHEN_NO_TEMPLATES`, `NEVER`. Default is `WHEN_NO_MATCH`. Supported only for WebSocket APIs.

[PayloadFormatVersion](#payloadformatversion_go) string

The [format of the payload](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html#http-api-develop-integrations-lambda.proxy-format) sent to an integration. Valid values: `1.0`, `2.0`. Default is `1.0`.

[Region](#region_go) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[RequestParameters](#requestparameters_go) map\[string\]string

For WebSocket APIs, a key-value map specifying request parameters that are passed from the method request to the backend. For HTTP APIs with a specified `integrationSubtype`, a key-value map specifying parameters that are passed to `AWS_PROXY` integrations. For HTTP APIs without a specified `integrationSubtype`, a key-value map specifying how to transform HTTP requests before sending them to the backend. See the [Amazon API Gateway Developer Guide](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-parameter-mapping.html) for details.

[RequestTemplates](#requesttemplates_go) map\[string\]string

Map of [Velocity](https://velocity.apache.org/) templates that are applied on the request payload based on the value of the Content-Type header sent by the client. Supported only for WebSocket APIs.

[ResponseParameters](#responseparameters_go) [\[\]IntegrationResponseParameterArgs](#integrationresponseparameter)

Mappings to transform the HTTP response from a backend integration before returning the response to clients. Supported only for HTTP APIs.

[TemplateSelectionExpression](#templateselectionexpression_go) string

The [template selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-template-selection-expressions) for the integration.

[TimeoutMilliseconds](#timeoutmilliseconds_go) int

Custom timeout between 50 and 29,000 milliseconds for WebSocket APIs and between 50 and 30,000 milliseconds for HTTP APIs. The default timeout is 29 seconds for WebSocket APIs and 30 seconds for HTTP APIs. this provider will only perform drift detection of its value when present in a configuration.

[TlsConfig](#tlsconfig_go) [IntegrationTlsConfigArgs](#integrationtlsconfig)

TLS configuration for a private integration. Supported only for HTTP APIs.

[api\_id](#api_id_hcl)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

API identifier.

[integration\_type](#integration_type_hcl)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

Integration type of an integration. Valid values: `AWS` (supported only for WebSocket APIs), `AWS_PROXY`, `HTTP` (supported only for WebSocket APIs), `HTTP_PROXY`, `MOCK` (supported only for WebSocket APIs). For an HTTP API private integration, use `HTTP_PROXY`.

[connection\_id](#connection_id_hcl) string

ID of the VPC link for a private integration. Supported only for HTTP APIs. Must be between 1 and 1024 characters in length.

[connection\_type](#connection_type_hcl) string

Type of the network connection to the integration endpoint. Valid values: `INTERNET`, `VPC_LINK`. Default is `INTERNET`.

[content\_handling\_strategy](#content_handling_strategy_hcl) string

How to handle response payload content type conversions. Valid values: `CONVERT_TO_BINARY`, `CONVERT_TO_TEXT`. Supported only for WebSocket APIs.

[credentials\_arn](#credentials_arn_hcl) string

Credentials required for the integration, if any.

[description](#description_hcl) string

Description of the integration.

[integration\_method](#integration_method_hcl) string

Integration's HTTP method. Must be specified if `integrationType` is not `MOCK`.

[integration\_subtype](#integration_subtype_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

AWS service action to invoke. Supported only for HTTP APIs when `integrationType` is `AWS_PROXY`. See the [AWS service integration reference](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-aws-services-reference.html) documentation for supported values. Must be between 1 and 128 characters in length.

[integration\_uri](#integration_uri_hcl) string

URI of the Lambda function for a Lambda proxy integration, when `integrationType` is `AWS_PROXY`. For an `HTTP` integration, specify a fully-qualified URL. For an HTTP API private integration, specify the ARN of an Application Load Balancer listener, Network Load Balancer listener, or AWS Cloud Map service.

[passthrough\_behavior](#passthrough_behavior_hcl) string

Pass-through behavior for incoming requests based on the Content-Type header in the request, and the available mapping templates specified as the `requestTemplates` attribute. Valid values: `WHEN_NO_MATCH`, `WHEN_NO_TEMPLATES`, `NEVER`. Default is `WHEN_NO_MATCH`. Supported only for WebSocket APIs.

[payload\_format\_version](#payload_format_version_hcl) string

The [format of the payload](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html#http-api-develop-integrations-lambda.proxy-format) sent to an integration. Valid values: `1.0`, `2.0`. Default is `1.0`.

[region](#region_hcl) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[request\_parameters](#request_parameters_hcl) map(string)

For WebSocket APIs, a key-value map specifying request parameters that are passed from the method request to the backend. For HTTP APIs with a specified `integrationSubtype`, a key-value map specifying parameters that are passed to `AWS_PROXY` integrations. For HTTP APIs without a specified `integrationSubtype`, a key-value map specifying how to transform HTTP requests before sending them to the backend. See the [Amazon API Gateway Developer Guide](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-parameter-mapping.html) for details.

[request\_templates](#request_templates_hcl) map(string)

Map of [Velocity](https://velocity.apache.org/) templates that are applied on the request payload based on the value of the Content-Type header sent by the client. Supported only for WebSocket APIs.

[response\_parameters](#response_parameters_hcl) [list(object)](#integrationresponseparameter)

Mappings to transform the HTTP response from a backend integration before returning the response to clients. Supported only for HTTP APIs.

[template\_selection\_expression](#template_selection_expression_hcl) string

The [template selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-template-selection-expressions) for the integration.

[timeout\_milliseconds](#timeout_milliseconds_hcl) number

Custom timeout between 50 and 29,000 milliseconds for WebSocket APIs and between 50 and 30,000 milliseconds for HTTP APIs. The default timeout is 29 seconds for WebSocket APIs and 30 seconds for HTTP APIs. this provider will only perform drift detection of its value when present in a configuration.

[tls\_config](#tls_config_hcl) [object](#integrationtlsconfig)

TLS configuration for a private integration. Supported only for HTTP APIs.

[apiId](#apiid_java)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

String

API identifier.

[integrationType](#integrationtype_java)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

String

Integration type of an integration. Valid values: `AWS` (supported only for WebSocket APIs), `AWS_PROXY`, `HTTP` (supported only for WebSocket APIs), `HTTP_PROXY`, `MOCK` (supported only for WebSocket APIs). For an HTTP API private integration, use `HTTP_PROXY`.

[connectionId](#connectionid_java) String

ID of the VPC link for a private integration. Supported only for HTTP APIs. Must be between 1 and 1024 characters in length.

[connectionType](#connectiontype_java) String

Type of the network connection to the integration endpoint. Valid values: `INTERNET`, `VPC_LINK`. Default is `INTERNET`.

[contentHandlingStrategy](#contenthandlingstrategy_java) String

How to handle response payload content type conversions. Valid values: `CONVERT_TO_BINARY`, `CONVERT_TO_TEXT`. Supported only for WebSocket APIs.

[credentialsArn](#credentialsarn_java) String

Credentials required for the integration, if any.

[description](#description_java) String

Description of the integration.

[integrationMethod](#integrationmethod_java) String

Integration's HTTP method. Must be specified if `integrationType` is not `MOCK`.

[integrationSubtype](#integrationsubtype_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

AWS service action to invoke. Supported only for HTTP APIs when `integrationType` is `AWS_PROXY`. See the [AWS service integration reference](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-aws-services-reference.html) documentation for supported values. Must be between 1 and 128 characters in length.

[integrationUri](#integrationuri_java) String

URI of the Lambda function for a Lambda proxy integration, when `integrationType` is `AWS_PROXY`. For an `HTTP` integration, specify a fully-qualified URL. For an HTTP API private integration, specify the ARN of an Application Load Balancer listener, Network Load Balancer listener, or AWS Cloud Map service.

[passthroughBehavior](#passthroughbehavior_java) String

Pass-through behavior for incoming requests based on the Content-Type header in the request, and the available mapping templates specified as the `requestTemplates` attribute. Valid values: `WHEN_NO_MATCH`, `WHEN_NO_TEMPLATES`, `NEVER`. Default is `WHEN_NO_MATCH`. Supported only for WebSocket APIs.

[payloadFormatVersion](#payloadformatversion_java) String

The [format of the payload](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html#http-api-develop-integrations-lambda.proxy-format) sent to an integration. Valid values: `1.0`, `2.0`. Default is `1.0`.

[region](#region_java) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[requestParameters](#requestparameters_java) Map<String,String>

For WebSocket APIs, a key-value map specifying request parameters that are passed from the method request to the backend. For HTTP APIs with a specified `integrationSubtype`, a key-value map specifying parameters that are passed to `AWS_PROXY` integrations. For HTTP APIs without a specified `integrationSubtype`, a key-value map specifying how to transform HTTP requests before sending them to the backend. See the [Amazon API Gateway Developer Guide](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-parameter-mapping.html) for details.

[requestTemplates](#requesttemplates_java) Map<String,String>

Map of [Velocity](https://velocity.apache.org/) templates that are applied on the request payload based on the value of the Content-Type header sent by the client. Supported only for WebSocket APIs.

[responseParameters](#responseparameters_java) [List<IntegrationResponseParameter>](#integrationresponseparameter)

Mappings to transform the HTTP response from a backend integration before returning the response to clients. Supported only for HTTP APIs.

[templateSelectionExpression](#templateselectionexpression_java) String

The [template selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-template-selection-expressions) for the integration.

[timeoutMilliseconds](#timeoutmilliseconds_java) Integer

Custom timeout between 50 and 29,000 milliseconds for WebSocket APIs and between 50 and 30,000 milliseconds for HTTP APIs. The default timeout is 29 seconds for WebSocket APIs and 30 seconds for HTTP APIs. this provider will only perform drift detection of its value when present in a configuration.

[tlsConfig](#tlsconfig_java) [IntegrationTlsConfig](#integrationtlsconfig)

TLS configuration for a private integration. Supported only for HTTP APIs.

[apiId](#apiid_nodejs)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

API identifier.

[integrationType](#integrationtype_nodejs)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

Integration type of an integration. Valid values: `AWS` (supported only for WebSocket APIs), `AWS_PROXY`, `HTTP` (supported only for WebSocket APIs), `HTTP_PROXY`, `MOCK` (supported only for WebSocket APIs). For an HTTP API private integration, use `HTTP_PROXY`.

[connectionId](#connectionid_nodejs) string

ID of the VPC link for a private integration. Supported only for HTTP APIs. Must be between 1 and 1024 characters in length.

[connectionType](#connectiontype_nodejs) string

Type of the network connection to the integration endpoint. Valid values: `INTERNET`, `VPC_LINK`. Default is `INTERNET`.

[contentHandlingStrategy](#contenthandlingstrategy_nodejs) string

How to handle response payload content type conversions. Valid values: `CONVERT_TO_BINARY`, `CONVERT_TO_TEXT`. Supported only for WebSocket APIs.

[credentialsArn](#credentialsarn_nodejs) string

Credentials required for the integration, if any.

[description](#description_nodejs) string

Description of the integration.

[integrationMethod](#integrationmethod_nodejs) string

Integration's HTTP method. Must be specified if `integrationType` is not `MOCK`.

[integrationSubtype](#integrationsubtype_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

AWS service action to invoke. Supported only for HTTP APIs when `integrationType` is `AWS_PROXY`. See the [AWS service integration reference](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-aws-services-reference.html) documentation for supported values. Must be between 1 and 128 characters in length.

[integrationUri](#integrationuri_nodejs) string

URI of the Lambda function for a Lambda proxy integration, when `integrationType` is `AWS_PROXY`. For an `HTTP` integration, specify a fully-qualified URL. For an HTTP API private integration, specify the ARN of an Application Load Balancer listener, Network Load Balancer listener, or AWS Cloud Map service.

[passthroughBehavior](#passthroughbehavior_nodejs) string

Pass-through behavior for incoming requests based on the Content-Type header in the request, and the available mapping templates specified as the `requestTemplates` attribute. Valid values: `WHEN_NO_MATCH`, `WHEN_NO_TEMPLATES`, `NEVER`. Default is `WHEN_NO_MATCH`. Supported only for WebSocket APIs.

[payloadFormatVersion](#payloadformatversion_nodejs) string

The [format of the payload](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html#http-api-develop-integrations-lambda.proxy-format) sent to an integration. Valid values: `1.0`, `2.0`. Default is `1.0`.

[region](#region_nodejs) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[requestParameters](#requestparameters_nodejs) {\[key: string\]: string}

For WebSocket APIs, a key-value map specifying request parameters that are passed from the method request to the backend. For HTTP APIs with a specified `integrationSubtype`, a key-value map specifying parameters that are passed to `AWS_PROXY` integrations. For HTTP APIs without a specified `integrationSubtype`, a key-value map specifying how to transform HTTP requests before sending them to the backend. See the [Amazon API Gateway Developer Guide](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-parameter-mapping.html) for details.

[requestTemplates](#requesttemplates_nodejs) {\[key: string\]: string}

Map of [Velocity](https://velocity.apache.org/) templates that are applied on the request payload based on the value of the Content-Type header sent by the client. Supported only for WebSocket APIs.

[responseParameters](#responseparameters_nodejs) [IntegrationResponseParameter\[\]](#integrationresponseparameter)

Mappings to transform the HTTP response from a backend integration before returning the response to clients. Supported only for HTTP APIs.

[templateSelectionExpression](#templateselectionexpression_nodejs) string

The [template selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-template-selection-expressions) for the integration.

[timeoutMilliseconds](#timeoutmilliseconds_nodejs) number

Custom timeout between 50 and 29,000 milliseconds for WebSocket APIs and between 50 and 30,000 milliseconds for HTTP APIs. The default timeout is 29 seconds for WebSocket APIs and 30 seconds for HTTP APIs. this provider will only perform drift detection of its value when present in a configuration.

[tlsConfig](#tlsconfig_nodejs) [IntegrationTlsConfig](#integrationtlsconfig)

TLS configuration for a private integration. Supported only for HTTP APIs.

[api\_id](#api_id_python)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

str

API identifier.

[integration\_type](#integration_type_python)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

str

Integration type of an integration. Valid values: `AWS` (supported only for WebSocket APIs), `AWS_PROXY`, `HTTP` (supported only for WebSocket APIs), `HTTP_PROXY`, `MOCK` (supported only for WebSocket APIs). For an HTTP API private integration, use `HTTP_PROXY`.

[connection\_id](#connection_id_python) str

ID of the VPC link for a private integration. Supported only for HTTP APIs. Must be between 1 and 1024 characters in length.

[connection\_type](#connection_type_python) str

Type of the network connection to the integration endpoint. Valid values: `INTERNET`, `VPC_LINK`. Default is `INTERNET`.

[content\_handling\_strategy](#content_handling_strategy_python) str

How to handle response payload content type conversions. Valid values: `CONVERT_TO_BINARY`, `CONVERT_TO_TEXT`. Supported only for WebSocket APIs.

[credentials\_arn](#credentials_arn_python) str

Credentials required for the integration, if any.

[description](#description_python) str

Description of the integration.

[integration\_method](#integration_method_python) str

Integration's HTTP method. Must be specified if `integrationType` is not `MOCK`.

[integration\_subtype](#integration_subtype_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

AWS service action to invoke. Supported only for HTTP APIs when `integrationType` is `AWS_PROXY`. See the [AWS service integration reference](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-aws-services-reference.html) documentation for supported values. Must be between 1 and 128 characters in length.

[integration\_uri](#integration_uri_python) str

URI of the Lambda function for a Lambda proxy integration, when `integrationType` is `AWS_PROXY`. For an `HTTP` integration, specify a fully-qualified URL. For an HTTP API private integration, specify the ARN of an Application Load Balancer listener, Network Load Balancer listener, or AWS Cloud Map service.

[passthrough\_behavior](#passthrough_behavior_python) str

Pass-through behavior for incoming requests based on the Content-Type header in the request, and the available mapping templates specified as the `requestTemplates` attribute. Valid values: `WHEN_NO_MATCH`, `WHEN_NO_TEMPLATES`, `NEVER`. Default is `WHEN_NO_MATCH`. Supported only for WebSocket APIs.

[payload\_format\_version](#payload_format_version_python) str

The [format of the payload](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html#http-api-develop-integrations-lambda.proxy-format) sent to an integration. Valid values: `1.0`, `2.0`. Default is `1.0`.

[region](#region_python) str

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[request\_parameters](#request_parameters_python) Mapping\[str, str\]

For WebSocket APIs, a key-value map specifying request parameters that are passed from the method request to the backend. For HTTP APIs with a specified `integrationSubtype`, a key-value map specifying parameters that are passed to `AWS_PROXY` integrations. For HTTP APIs without a specified `integrationSubtype`, a key-value map specifying how to transform HTTP requests before sending them to the backend. See the [Amazon API Gateway Developer Guide](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-parameter-mapping.html) for details.

[request\_templates](#request_templates_python) Mapping\[str, str\]

Map of [Velocity](https://velocity.apache.org/) templates that are applied on the request payload based on the value of the Content-Type header sent by the client. Supported only for WebSocket APIs.

[response\_parameters](#response_parameters_python) [Sequence\[IntegrationResponseParameterArgs\]](#integrationresponseparameter)

Mappings to transform the HTTP response from a backend integration before returning the response to clients. Supported only for HTTP APIs.

[template\_selection\_expression](#template_selection_expression_python) str

The [template selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-template-selection-expressions) for the integration.

[timeout\_milliseconds](#timeout_milliseconds_python) int

Custom timeout between 50 and 29,000 milliseconds for WebSocket APIs and between 50 and 30,000 milliseconds for HTTP APIs. The default timeout is 29 seconds for WebSocket APIs and 30 seconds for HTTP APIs. this provider will only perform drift detection of its value when present in a configuration.

[tls\_config](#tls_config_python) [IntegrationTlsConfigArgs](#integrationtlsconfig)

TLS configuration for a private integration. Supported only for HTTP APIs.

[apiId](#apiid_yaml)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

String

API identifier.

[integrationType](#integrationtype_yaml)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

String

Integration type of an integration. Valid values: `AWS` (supported only for WebSocket APIs), `AWS_PROXY`, `HTTP` (supported only for WebSocket APIs), `HTTP_PROXY`, `MOCK` (supported only for WebSocket APIs). For an HTTP API private integration, use `HTTP_PROXY`.

[connectionId](#connectionid_yaml) String

ID of the VPC link for a private integration. Supported only for HTTP APIs. Must be between 1 and 1024 characters in length.

[connectionType](#connectiontype_yaml) String

Type of the network connection to the integration endpoint. Valid values: `INTERNET`, `VPC_LINK`. Default is `INTERNET`.

[contentHandlingStrategy](#contenthandlingstrategy_yaml) String

How to handle response payload content type conversions. Valid values: `CONVERT_TO_BINARY`, `CONVERT_TO_TEXT`. Supported only for WebSocket APIs.

[credentialsArn](#credentialsarn_yaml) String

Credentials required for the integration, if any.

[description](#description_yaml) String

Description of the integration.

[integrationMethod](#integrationmethod_yaml) String

Integration's HTTP method. Must be specified if `integrationType` is not `MOCK`.

[integrationSubtype](#integrationsubtype_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

AWS service action to invoke. Supported only for HTTP APIs when `integrationType` is `AWS_PROXY`. See the [AWS service integration reference](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-aws-services-reference.html) documentation for supported values. Must be between 1 and 128 characters in length.

[integrationUri](#integrationuri_yaml) String

URI of the Lambda function for a Lambda proxy integration, when `integrationType` is `AWS_PROXY`. For an `HTTP` integration, specify a fully-qualified URL. For an HTTP API private integration, specify the ARN of an Application Load Balancer listener, Network Load Balancer listener, or AWS Cloud Map service.

[passthroughBehavior](#passthroughbehavior_yaml) String

Pass-through behavior for incoming requests based on the Content-Type header in the request, and the available mapping templates specified as the `requestTemplates` attribute. Valid values: `WHEN_NO_MATCH`, `WHEN_NO_TEMPLATES`, `NEVER`. Default is `WHEN_NO_MATCH`. Supported only for WebSocket APIs.

[payloadFormatVersion](#payloadformatversion_yaml) String

The [format of the payload](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html#http-api-develop-integrations-lambda.proxy-format) sent to an integration. Valid values: `1.0`, `2.0`. Default is `1.0`.

[region](#region_yaml) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[requestParameters](#requestparameters_yaml) Map<String>

For WebSocket APIs, a key-value map specifying request parameters that are passed from the method request to the backend. For HTTP APIs with a specified `integrationSubtype`, a key-value map specifying parameters that are passed to `AWS_PROXY` integrations. For HTTP APIs without a specified `integrationSubtype`, a key-value map specifying how to transform HTTP requests before sending them to the backend. See the [Amazon API Gateway Developer Guide](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-parameter-mapping.html) for details.

[requestTemplates](#requesttemplates_yaml) Map<String>

Map of [Velocity](https://velocity.apache.org/) templates that are applied on the request payload based on the value of the Content-Type header sent by the client. Supported only for WebSocket APIs.

[responseParameters](#responseparameters_yaml) [List<Property Map>](#integrationresponseparameter)

Mappings to transform the HTTP response from a backend integration before returning the response to clients. Supported only for HTTP APIs.

[templateSelectionExpression](#templateselectionexpression_yaml) String

The [template selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-template-selection-expressions) for the integration.

[timeoutMilliseconds](#timeoutmilliseconds_yaml) Number

Custom timeout between 50 and 29,000 milliseconds for WebSocket APIs and between 50 and 30,000 milliseconds for HTTP APIs. The default timeout is 29 seconds for WebSocket APIs and 30 seconds for HTTP APIs. this provider will only perform drift detection of its value when present in a configuration.

[tlsConfig](#tlsconfig_yaml) [Property Map](#integrationtlsconfig)

TLS configuration for a private integration. Supported only for HTTP APIs.

### Outputs[](#outputs)

All [input](#inputs) properties are implicitly available as output properties. Additionally, the Integration resource produces the following output properties:

[Id](#id_csharp) string

The provider-assigned unique ID for this managed resource.

[IntegrationResponseSelectionExpression](#integrationresponseselectionexpression_csharp) string

The [integration response selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-integration-response-selection-expressions) for the integration.

[Id](#id_go) string

The provider-assigned unique ID for this managed resource.

[IntegrationResponseSelectionExpression](#integrationresponseselectionexpression_go) string

The [integration response selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-integration-response-selection-expressions) for the integration.

[id](#id_hcl) string

The provider-assigned unique ID for this managed resource.

[integration\_response\_selection\_expression](#integration_response_selection_expression_hcl) string

The [integration response selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-integration-response-selection-expressions) for the integration.

[id](#id_java) String

The provider-assigned unique ID for this managed resource.

[integrationResponseSelectionExpression](#integrationresponseselectionexpression_java) String

The [integration response selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-integration-response-selection-expressions) for the integration.

[id](#id_nodejs) string

The provider-assigned unique ID for this managed resource.

[integrationResponseSelectionExpression](#integrationresponseselectionexpression_nodejs) string

The [integration response selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-integration-response-selection-expressions) for the integration.

[id](#id_python) str

The provider-assigned unique ID for this managed resource.

[integration\_response\_selection\_expression](#integration_response_selection_expression_python) str

The [integration response selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-integration-response-selection-expressions) for the integration.

[id](#id_yaml) String

The provider-assigned unique ID for this managed resource.

[integrationResponseSelectionExpression](#integrationresponseselectionexpression_yaml) String

The [integration response selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-integration-response-selection-expressions) for the integration.

## Look up Existing Integration Resource[](#look-up)

Get an existing Integration resource’s state with the given name, ID, and optional extra properties used to qualify the lookup.

-   TypeScript
-   Python
-   Go
-   C#
-   Java
-   YAML
-   HCL PREVIEW

```typescript
public static get(name: string, id: Input<ID>, state?: IntegrationState, opts?: CustomResourceOptions): Integration
```

```python
@staticmethod
def get(resource_name: str,
        id: str,
        opts: Optional[ResourceOptions] = None,
        api_id: Optional[str] = None,
        connection_id: Optional[str] = None,
        connection_type: Optional[str] = None,
        content_handling_strategy: Optional[str] = None,
        credentials_arn: Optional[str] = None,
        description: Optional[str] = None,
        integration_method: Optional[str] = None,
        integration_response_selection_expression: Optional[str] = None,
        integration_subtype: Optional[str] = None,
        integration_type: Optional[str] = None,
        integration_uri: Optional[str] = None,
        passthrough_behavior: Optional[str] = None,
        payload_format_version: Optional[str] = None,
        region: Optional[str] = None,
        request_parameters: Optional[Mapping[str, str]] = None,
        request_templates: Optional[Mapping[str, str]] = None,
        response_parameters: Optional[Sequence[IntegrationResponseParameterArgs]] = None,
        template_selection_expression: Optional[str] = None,
        timeout_milliseconds: Optional[int] = None,
        tls_config: Optional[IntegrationTlsConfigArgs] = None) -> Integration
```

```go
func GetIntegration(ctx *Context, name string, id IDInput, state *IntegrationState, opts ...ResourceOption) (*Integration, error)
```

```csharp
public static Integration Get(string name, Input<string> id, IntegrationState? state, CustomResourceOptions? opts = null)
```

```java
public static Integration get(String name, Output<String> id, IntegrationState state, CustomResourceOptions options)
```

```yaml
resources:  _:    type: aws:apigatewayv2:Integration    get:      id: ${id}
```

```hcl
import {
  to = aws_apigatewayv2_integration.example
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

[ConnectionId](#state_connectionid_csharp) string

ID of the VPC link for a private integration. Supported only for HTTP APIs. Must be between 1 and 1024 characters in length.

[ConnectionType](#state_connectiontype_csharp) string

Type of the network connection to the integration endpoint. Valid values: `INTERNET`, `VPC_LINK`. Default is `INTERNET`.

[ContentHandlingStrategy](#state_contenthandlingstrategy_csharp) string

How to handle response payload content type conversions. Valid values: `CONVERT_TO_BINARY`, `CONVERT_TO_TEXT`. Supported only for WebSocket APIs.

[CredentialsArn](#state_credentialsarn_csharp) string

Credentials required for the integration, if any.

[Description](#state_description_csharp) string

Description of the integration.

[IntegrationMethod](#state_integrationmethod_csharp) string

Integration's HTTP method. Must be specified if `integrationType` is not `MOCK`.

[IntegrationResponseSelectionExpression](#state_integrationresponseselectionexpression_csharp) string

The [integration response selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-integration-response-selection-expressions) for the integration.

[IntegrationSubtype](#state_integrationsubtype_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

AWS service action to invoke. Supported only for HTTP APIs when `integrationType` is `AWS_PROXY`. See the [AWS service integration reference](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-aws-services-reference.html) documentation for supported values. Must be between 1 and 128 characters in length.

[IntegrationType](#state_integrationtype_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Integration type of an integration. Valid values: `AWS` (supported only for WebSocket APIs), `AWS_PROXY`, `HTTP` (supported only for WebSocket APIs), `HTTP_PROXY`, `MOCK` (supported only for WebSocket APIs). For an HTTP API private integration, use `HTTP_PROXY`.

[IntegrationUri](#state_integrationuri_csharp) string

URI of the Lambda function for a Lambda proxy integration, when `integrationType` is `AWS_PROXY`. For an `HTTP` integration, specify a fully-qualified URL. For an HTTP API private integration, specify the ARN of an Application Load Balancer listener, Network Load Balancer listener, or AWS Cloud Map service.

[PassthroughBehavior](#state_passthroughbehavior_csharp) string

Pass-through behavior for incoming requests based on the Content-Type header in the request, and the available mapping templates specified as the `requestTemplates` attribute. Valid values: `WHEN_NO_MATCH`, `WHEN_NO_TEMPLATES`, `NEVER`. Default is `WHEN_NO_MATCH`. Supported only for WebSocket APIs.

[PayloadFormatVersion](#state_payloadformatversion_csharp) string

The [format of the payload](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html#http-api-develop-integrations-lambda.proxy-format) sent to an integration. Valid values: `1.0`, `2.0`. Default is `1.0`.

[Region](#state_region_csharp) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[RequestParameters](#state_requestparameters_csharp) Dictionary<string, string>

For WebSocket APIs, a key-value map specifying request parameters that are passed from the method request to the backend. For HTTP APIs with a specified `integrationSubtype`, a key-value map specifying parameters that are passed to `AWS_PROXY` integrations. For HTTP APIs without a specified `integrationSubtype`, a key-value map specifying how to transform HTTP requests before sending them to the backend. See the [Amazon API Gateway Developer Guide](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-parameter-mapping.html) for details.

[RequestTemplates](#state_requesttemplates_csharp) Dictionary<string, string>

Map of [Velocity](https://velocity.apache.org/) templates that are applied on the request payload based on the value of the Content-Type header sent by the client. Supported only for WebSocket APIs.

[ResponseParameters](#state_responseparameters_csharp) [List<IntegrationResponseParameter>](#integrationresponseparameter)

Mappings to transform the HTTP response from a backend integration before returning the response to clients. Supported only for HTTP APIs.

[TemplateSelectionExpression](#state_templateselectionexpression_csharp) string

The [template selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-template-selection-expressions) for the integration.

[TimeoutMilliseconds](#state_timeoutmilliseconds_csharp) int

Custom timeout between 50 and 29,000 milliseconds for WebSocket APIs and between 50 and 30,000 milliseconds for HTTP APIs. The default timeout is 29 seconds for WebSocket APIs and 30 seconds for HTTP APIs. this provider will only perform drift detection of its value when present in a configuration.

[TlsConfig](#state_tlsconfig_csharp) [IntegrationTlsConfig](#integrationtlsconfig)

TLS configuration for a private integration. Supported only for HTTP APIs.

[ApiId](#state_apiid_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

API identifier.

[ConnectionId](#state_connectionid_go) string

ID of the VPC link for a private integration. Supported only for HTTP APIs. Must be between 1 and 1024 characters in length.

[ConnectionType](#state_connectiontype_go) string

Type of the network connection to the integration endpoint. Valid values: `INTERNET`, `VPC_LINK`. Default is `INTERNET`.

[ContentHandlingStrategy](#state_contenthandlingstrategy_go) string

How to handle response payload content type conversions. Valid values: `CONVERT_TO_BINARY`, `CONVERT_TO_TEXT`. Supported only for WebSocket APIs.

[CredentialsArn](#state_credentialsarn_go) string

Credentials required for the integration, if any.

[Description](#state_description_go) string

Description of the integration.

[IntegrationMethod](#state_integrationmethod_go) string

Integration's HTTP method. Must be specified if `integrationType` is not `MOCK`.

[IntegrationResponseSelectionExpression](#state_integrationresponseselectionexpression_go) string

The [integration response selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-integration-response-selection-expressions) for the integration.

[IntegrationSubtype](#state_integrationsubtype_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

AWS service action to invoke. Supported only for HTTP APIs when `integrationType` is `AWS_PROXY`. See the [AWS service integration reference](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-aws-services-reference.html) documentation for supported values. Must be between 1 and 128 characters in length.

[IntegrationType](#state_integrationtype_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Integration type of an integration. Valid values: `AWS` (supported only for WebSocket APIs), `AWS_PROXY`, `HTTP` (supported only for WebSocket APIs), `HTTP_PROXY`, `MOCK` (supported only for WebSocket APIs). For an HTTP API private integration, use `HTTP_PROXY`.

[IntegrationUri](#state_integrationuri_go) string

URI of the Lambda function for a Lambda proxy integration, when `integrationType` is `AWS_PROXY`. For an `HTTP` integration, specify a fully-qualified URL. For an HTTP API private integration, specify the ARN of an Application Load Balancer listener, Network Load Balancer listener, or AWS Cloud Map service.

[PassthroughBehavior](#state_passthroughbehavior_go) string

Pass-through behavior for incoming requests based on the Content-Type header in the request, and the available mapping templates specified as the `requestTemplates` attribute. Valid values: `WHEN_NO_MATCH`, `WHEN_NO_TEMPLATES`, `NEVER`. Default is `WHEN_NO_MATCH`. Supported only for WebSocket APIs.

[PayloadFormatVersion](#state_payloadformatversion_go) string

The [format of the payload](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html#http-api-develop-integrations-lambda.proxy-format) sent to an integration. Valid values: `1.0`, `2.0`. Default is `1.0`.

[Region](#state_region_go) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[RequestParameters](#state_requestparameters_go) map\[string\]string

For WebSocket APIs, a key-value map specifying request parameters that are passed from the method request to the backend. For HTTP APIs with a specified `integrationSubtype`, a key-value map specifying parameters that are passed to `AWS_PROXY` integrations. For HTTP APIs without a specified `integrationSubtype`, a key-value map specifying how to transform HTTP requests before sending them to the backend. See the [Amazon API Gateway Developer Guide](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-parameter-mapping.html) for details.

[RequestTemplates](#state_requesttemplates_go) map\[string\]string

Map of [Velocity](https://velocity.apache.org/) templates that are applied on the request payload based on the value of the Content-Type header sent by the client. Supported only for WebSocket APIs.

[ResponseParameters](#state_responseparameters_go) [\[\]IntegrationResponseParameterArgs](#integrationresponseparameter)

Mappings to transform the HTTP response from a backend integration before returning the response to clients. Supported only for HTTP APIs.

[TemplateSelectionExpression](#state_templateselectionexpression_go) string

The [template selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-template-selection-expressions) for the integration.

[TimeoutMilliseconds](#state_timeoutmilliseconds_go) int

Custom timeout between 50 and 29,000 milliseconds for WebSocket APIs and between 50 and 30,000 milliseconds for HTTP APIs. The default timeout is 29 seconds for WebSocket APIs and 30 seconds for HTTP APIs. this provider will only perform drift detection of its value when present in a configuration.

[TlsConfig](#state_tlsconfig_go) [IntegrationTlsConfigArgs](#integrationtlsconfig)

TLS configuration for a private integration. Supported only for HTTP APIs.

[api\_id](#state_api_id_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

API identifier.

[connection\_id](#state_connection_id_hcl) string

ID of the VPC link for a private integration. Supported only for HTTP APIs. Must be between 1 and 1024 characters in length.

[connection\_type](#state_connection_type_hcl) string

Type of the network connection to the integration endpoint. Valid values: `INTERNET`, `VPC_LINK`. Default is `INTERNET`.

[content\_handling\_strategy](#state_content_handling_strategy_hcl) string

How to handle response payload content type conversions. Valid values: `CONVERT_TO_BINARY`, `CONVERT_TO_TEXT`. Supported only for WebSocket APIs.

[credentials\_arn](#state_credentials_arn_hcl) string

Credentials required for the integration, if any.

[description](#state_description_hcl) string

Description of the integration.

[integration\_method](#state_integration_method_hcl) string

Integration's HTTP method. Must be specified if `integrationType` is not `MOCK`.

[integration\_response\_selection\_expression](#state_integration_response_selection_expression_hcl) string

The [integration response selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-integration-response-selection-expressions) for the integration.

[integration\_subtype](#state_integration_subtype_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

AWS service action to invoke. Supported only for HTTP APIs when `integrationType` is `AWS_PROXY`. See the [AWS service integration reference](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-aws-services-reference.html) documentation for supported values. Must be between 1 and 128 characters in length.

[integration\_type](#state_integration_type_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Integration type of an integration. Valid values: `AWS` (supported only for WebSocket APIs), `AWS_PROXY`, `HTTP` (supported only for WebSocket APIs), `HTTP_PROXY`, `MOCK` (supported only for WebSocket APIs). For an HTTP API private integration, use `HTTP_PROXY`.

[integration\_uri](#state_integration_uri_hcl) string

URI of the Lambda function for a Lambda proxy integration, when `integrationType` is `AWS_PROXY`. For an `HTTP` integration, specify a fully-qualified URL. For an HTTP API private integration, specify the ARN of an Application Load Balancer listener, Network Load Balancer listener, or AWS Cloud Map service.

[passthrough\_behavior](#state_passthrough_behavior_hcl) string

Pass-through behavior for incoming requests based on the Content-Type header in the request, and the available mapping templates specified as the `requestTemplates` attribute. Valid values: `WHEN_NO_MATCH`, `WHEN_NO_TEMPLATES`, `NEVER`. Default is `WHEN_NO_MATCH`. Supported only for WebSocket APIs.

[payload\_format\_version](#state_payload_format_version_hcl) string

The [format of the payload](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html#http-api-develop-integrations-lambda.proxy-format) sent to an integration. Valid values: `1.0`, `2.0`. Default is `1.0`.

[region](#state_region_hcl) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[request\_parameters](#state_request_parameters_hcl) map(string)

For WebSocket APIs, a key-value map specifying request parameters that are passed from the method request to the backend. For HTTP APIs with a specified `integrationSubtype`, a key-value map specifying parameters that are passed to `AWS_PROXY` integrations. For HTTP APIs without a specified `integrationSubtype`, a key-value map specifying how to transform HTTP requests before sending them to the backend. See the [Amazon API Gateway Developer Guide](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-parameter-mapping.html) for details.

[request\_templates](#state_request_templates_hcl) map(string)

Map of [Velocity](https://velocity.apache.org/) templates that are applied on the request payload based on the value of the Content-Type header sent by the client. Supported only for WebSocket APIs.

[response\_parameters](#state_response_parameters_hcl) [list(object)](#integrationresponseparameter)

Mappings to transform the HTTP response from a backend integration before returning the response to clients. Supported only for HTTP APIs.

[template\_selection\_expression](#state_template_selection_expression_hcl) string

The [template selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-template-selection-expressions) for the integration.

[timeout\_milliseconds](#state_timeout_milliseconds_hcl) number

Custom timeout between 50 and 29,000 milliseconds for WebSocket APIs and between 50 and 30,000 milliseconds for HTTP APIs. The default timeout is 29 seconds for WebSocket APIs and 30 seconds for HTTP APIs. this provider will only perform drift detection of its value when present in a configuration.

[tls\_config](#state_tls_config_hcl) [object](#integrationtlsconfig)

TLS configuration for a private integration. Supported only for HTTP APIs.

[apiId](#state_apiid_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

API identifier.

[connectionId](#state_connectionid_java) String

ID of the VPC link for a private integration. Supported only for HTTP APIs. Must be between 1 and 1024 characters in length.

[connectionType](#state_connectiontype_java) String

Type of the network connection to the integration endpoint. Valid values: `INTERNET`, `VPC_LINK`. Default is `INTERNET`.

[contentHandlingStrategy](#state_contenthandlingstrategy_java) String

How to handle response payload content type conversions. Valid values: `CONVERT_TO_BINARY`, `CONVERT_TO_TEXT`. Supported only for WebSocket APIs.

[credentialsArn](#state_credentialsarn_java) String

Credentials required for the integration, if any.

[description](#state_description_java) String

Description of the integration.

[integrationMethod](#state_integrationmethod_java) String

Integration's HTTP method. Must be specified if `integrationType` is not `MOCK`.

[integrationResponseSelectionExpression](#state_integrationresponseselectionexpression_java) String

The [integration response selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-integration-response-selection-expressions) for the integration.

[integrationSubtype](#state_integrationsubtype_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

AWS service action to invoke. Supported only for HTTP APIs when `integrationType` is `AWS_PROXY`. See the [AWS service integration reference](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-aws-services-reference.html) documentation for supported values. Must be between 1 and 128 characters in length.

[integrationType](#state_integrationtype_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Integration type of an integration. Valid values: `AWS` (supported only for WebSocket APIs), `AWS_PROXY`, `HTTP` (supported only for WebSocket APIs), `HTTP_PROXY`, `MOCK` (supported only for WebSocket APIs). For an HTTP API private integration, use `HTTP_PROXY`.

[integrationUri](#state_integrationuri_java) String

URI of the Lambda function for a Lambda proxy integration, when `integrationType` is `AWS_PROXY`. For an `HTTP` integration, specify a fully-qualified URL. For an HTTP API private integration, specify the ARN of an Application Load Balancer listener, Network Load Balancer listener, or AWS Cloud Map service.

[passthroughBehavior](#state_passthroughbehavior_java) String

Pass-through behavior for incoming requests based on the Content-Type header in the request, and the available mapping templates specified as the `requestTemplates` attribute. Valid values: `WHEN_NO_MATCH`, `WHEN_NO_TEMPLATES`, `NEVER`. Default is `WHEN_NO_MATCH`. Supported only for WebSocket APIs.

[payloadFormatVersion](#state_payloadformatversion_java) String

The [format of the payload](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html#http-api-develop-integrations-lambda.proxy-format) sent to an integration. Valid values: `1.0`, `2.0`. Default is `1.0`.

[region](#state_region_java) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[requestParameters](#state_requestparameters_java) Map<String,String>

For WebSocket APIs, a key-value map specifying request parameters that are passed from the method request to the backend. For HTTP APIs with a specified `integrationSubtype`, a key-value map specifying parameters that are passed to `AWS_PROXY` integrations. For HTTP APIs without a specified `integrationSubtype`, a key-value map specifying how to transform HTTP requests before sending them to the backend. See the [Amazon API Gateway Developer Guide](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-parameter-mapping.html) for details.

[requestTemplates](#state_requesttemplates_java) Map<String,String>

Map of [Velocity](https://velocity.apache.org/) templates that are applied on the request payload based on the value of the Content-Type header sent by the client. Supported only for WebSocket APIs.

[responseParameters](#state_responseparameters_java) [List<IntegrationResponseParameter>](#integrationresponseparameter)

Mappings to transform the HTTP response from a backend integration before returning the response to clients. Supported only for HTTP APIs.

[templateSelectionExpression](#state_templateselectionexpression_java) String

The [template selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-template-selection-expressions) for the integration.

[timeoutMilliseconds](#state_timeoutmilliseconds_java) Integer

Custom timeout between 50 and 29,000 milliseconds for WebSocket APIs and between 50 and 30,000 milliseconds for HTTP APIs. The default timeout is 29 seconds for WebSocket APIs and 30 seconds for HTTP APIs. this provider will only perform drift detection of its value when present in a configuration.

[tlsConfig](#state_tlsconfig_java) [IntegrationTlsConfig](#integrationtlsconfig)

TLS configuration for a private integration. Supported only for HTTP APIs.

[apiId](#state_apiid_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

API identifier.

[connectionId](#state_connectionid_nodejs) string

ID of the VPC link for a private integration. Supported only for HTTP APIs. Must be between 1 and 1024 characters in length.

[connectionType](#state_connectiontype_nodejs) string

Type of the network connection to the integration endpoint. Valid values: `INTERNET`, `VPC_LINK`. Default is `INTERNET`.

[contentHandlingStrategy](#state_contenthandlingstrategy_nodejs) string

How to handle response payload content type conversions. Valid values: `CONVERT_TO_BINARY`, `CONVERT_TO_TEXT`. Supported only for WebSocket APIs.

[credentialsArn](#state_credentialsarn_nodejs) string

Credentials required for the integration, if any.

[description](#state_description_nodejs) string

Description of the integration.

[integrationMethod](#state_integrationmethod_nodejs) string

Integration's HTTP method. Must be specified if `integrationType` is not `MOCK`.

[integrationResponseSelectionExpression](#state_integrationresponseselectionexpression_nodejs) string

The [integration response selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-integration-response-selection-expressions) for the integration.

[integrationSubtype](#state_integrationsubtype_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

AWS service action to invoke. Supported only for HTTP APIs when `integrationType` is `AWS_PROXY`. See the [AWS service integration reference](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-aws-services-reference.html) documentation for supported values. Must be between 1 and 128 characters in length.

[integrationType](#state_integrationtype_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Integration type of an integration. Valid values: `AWS` (supported only for WebSocket APIs), `AWS_PROXY`, `HTTP` (supported only for WebSocket APIs), `HTTP_PROXY`, `MOCK` (supported only for WebSocket APIs). For an HTTP API private integration, use `HTTP_PROXY`.

[integrationUri](#state_integrationuri_nodejs) string

URI of the Lambda function for a Lambda proxy integration, when `integrationType` is `AWS_PROXY`. For an `HTTP` integration, specify a fully-qualified URL. For an HTTP API private integration, specify the ARN of an Application Load Balancer listener, Network Load Balancer listener, or AWS Cloud Map service.

[passthroughBehavior](#state_passthroughbehavior_nodejs) string

Pass-through behavior for incoming requests based on the Content-Type header in the request, and the available mapping templates specified as the `requestTemplates` attribute. Valid values: `WHEN_NO_MATCH`, `WHEN_NO_TEMPLATES`, `NEVER`. Default is `WHEN_NO_MATCH`. Supported only for WebSocket APIs.

[payloadFormatVersion](#state_payloadformatversion_nodejs) string

The [format of the payload](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html#http-api-develop-integrations-lambda.proxy-format) sent to an integration. Valid values: `1.0`, `2.0`. Default is `1.0`.

[region](#state_region_nodejs) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[requestParameters](#state_requestparameters_nodejs) {\[key: string\]: string}

For WebSocket APIs, a key-value map specifying request parameters that are passed from the method request to the backend. For HTTP APIs with a specified `integrationSubtype`, a key-value map specifying parameters that are passed to `AWS_PROXY` integrations. For HTTP APIs without a specified `integrationSubtype`, a key-value map specifying how to transform HTTP requests before sending them to the backend. See the [Amazon API Gateway Developer Guide](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-parameter-mapping.html) for details.

[requestTemplates](#state_requesttemplates_nodejs) {\[key: string\]: string}

Map of [Velocity](https://velocity.apache.org/) templates that are applied on the request payload based on the value of the Content-Type header sent by the client. Supported only for WebSocket APIs.

[responseParameters](#state_responseparameters_nodejs) [IntegrationResponseParameter\[\]](#integrationresponseparameter)

Mappings to transform the HTTP response from a backend integration before returning the response to clients. Supported only for HTTP APIs.

[templateSelectionExpression](#state_templateselectionexpression_nodejs) string

The [template selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-template-selection-expressions) for the integration.

[timeoutMilliseconds](#state_timeoutmilliseconds_nodejs) number

Custom timeout between 50 and 29,000 milliseconds for WebSocket APIs and between 50 and 30,000 milliseconds for HTTP APIs. The default timeout is 29 seconds for WebSocket APIs and 30 seconds for HTTP APIs. this provider will only perform drift detection of its value when present in a configuration.

[tlsConfig](#state_tlsconfig_nodejs) [IntegrationTlsConfig](#integrationtlsconfig)

TLS configuration for a private integration. Supported only for HTTP APIs.

[api\_id](#state_api_id_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

API identifier.

[connection\_id](#state_connection_id_python) str

ID of the VPC link for a private integration. Supported only for HTTP APIs. Must be between 1 and 1024 characters in length.

[connection\_type](#state_connection_type_python) str

Type of the network connection to the integration endpoint. Valid values: `INTERNET`, `VPC_LINK`. Default is `INTERNET`.

[content\_handling\_strategy](#state_content_handling_strategy_python) str

How to handle response payload content type conversions. Valid values: `CONVERT_TO_BINARY`, `CONVERT_TO_TEXT`. Supported only for WebSocket APIs.

[credentials\_arn](#state_credentials_arn_python) str

Credentials required for the integration, if any.

[description](#state_description_python) str

Description of the integration.

[integration\_method](#state_integration_method_python) str

Integration's HTTP method. Must be specified if `integrationType` is not `MOCK`.

[integration\_response\_selection\_expression](#state_integration_response_selection_expression_python) str

The [integration response selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-integration-response-selection-expressions) for the integration.

[integration\_subtype](#state_integration_subtype_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

AWS service action to invoke. Supported only for HTTP APIs when `integrationType` is `AWS_PROXY`. See the [AWS service integration reference](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-aws-services-reference.html) documentation for supported values. Must be between 1 and 128 characters in length.

[integration\_type](#state_integration_type_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Integration type of an integration. Valid values: `AWS` (supported only for WebSocket APIs), `AWS_PROXY`, `HTTP` (supported only for WebSocket APIs), `HTTP_PROXY`, `MOCK` (supported only for WebSocket APIs). For an HTTP API private integration, use `HTTP_PROXY`.

[integration\_uri](#state_integration_uri_python) str

URI of the Lambda function for a Lambda proxy integration, when `integrationType` is `AWS_PROXY`. For an `HTTP` integration, specify a fully-qualified URL. For an HTTP API private integration, specify the ARN of an Application Load Balancer listener, Network Load Balancer listener, or AWS Cloud Map service.

[passthrough\_behavior](#state_passthrough_behavior_python) str

Pass-through behavior for incoming requests based on the Content-Type header in the request, and the available mapping templates specified as the `requestTemplates` attribute. Valid values: `WHEN_NO_MATCH`, `WHEN_NO_TEMPLATES`, `NEVER`. Default is `WHEN_NO_MATCH`. Supported only for WebSocket APIs.

[payload\_format\_version](#state_payload_format_version_python) str

The [format of the payload](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html#http-api-develop-integrations-lambda.proxy-format) sent to an integration. Valid values: `1.0`, `2.0`. Default is `1.0`.

[region](#state_region_python) str

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[request\_parameters](#state_request_parameters_python) Mapping\[str, str\]

For WebSocket APIs, a key-value map specifying request parameters that are passed from the method request to the backend. For HTTP APIs with a specified `integrationSubtype`, a key-value map specifying parameters that are passed to `AWS_PROXY` integrations. For HTTP APIs without a specified `integrationSubtype`, a key-value map specifying how to transform HTTP requests before sending them to the backend. See the [Amazon API Gateway Developer Guide](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-parameter-mapping.html) for details.

[request\_templates](#state_request_templates_python) Mapping\[str, str\]

Map of [Velocity](https://velocity.apache.org/) templates that are applied on the request payload based on the value of the Content-Type header sent by the client. Supported only for WebSocket APIs.

[response\_parameters](#state_response_parameters_python) [Sequence\[IntegrationResponseParameterArgs\]](#integrationresponseparameter)

Mappings to transform the HTTP response from a backend integration before returning the response to clients. Supported only for HTTP APIs.

[template\_selection\_expression](#state_template_selection_expression_python) str

The [template selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-template-selection-expressions) for the integration.

[timeout\_milliseconds](#state_timeout_milliseconds_python) int

Custom timeout between 50 and 29,000 milliseconds for WebSocket APIs and between 50 and 30,000 milliseconds for HTTP APIs. The default timeout is 29 seconds for WebSocket APIs and 30 seconds for HTTP APIs. this provider will only perform drift detection of its value when present in a configuration.

[tls\_config](#state_tls_config_python) [IntegrationTlsConfigArgs](#integrationtlsconfig)

TLS configuration for a private integration. Supported only for HTTP APIs.

[apiId](#state_apiid_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

API identifier.

[connectionId](#state_connectionid_yaml) String

ID of the VPC link for a private integration. Supported only for HTTP APIs. Must be between 1 and 1024 characters in length.

[connectionType](#state_connectiontype_yaml) String

Type of the network connection to the integration endpoint. Valid values: `INTERNET`, `VPC_LINK`. Default is `INTERNET`.

[contentHandlingStrategy](#state_contenthandlingstrategy_yaml) String

How to handle response payload content type conversions. Valid values: `CONVERT_TO_BINARY`, `CONVERT_TO_TEXT`. Supported only for WebSocket APIs.

[credentialsArn](#state_credentialsarn_yaml) String

Credentials required for the integration, if any.

[description](#state_description_yaml) String

Description of the integration.

[integrationMethod](#state_integrationmethod_yaml) String

Integration's HTTP method. Must be specified if `integrationType` is not `MOCK`.

[integrationResponseSelectionExpression](#state_integrationresponseselectionexpression_yaml) String

The [integration response selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-integration-response-selection-expressions) for the integration.

[integrationSubtype](#state_integrationsubtype_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

AWS service action to invoke. Supported only for HTTP APIs when `integrationType` is `AWS_PROXY`. See the [AWS service integration reference](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-aws-services-reference.html) documentation for supported values. Must be between 1 and 128 characters in length.

[integrationType](#state_integrationtype_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Integration type of an integration. Valid values: `AWS` (supported only for WebSocket APIs), `AWS_PROXY`, `HTTP` (supported only for WebSocket APIs), `HTTP_PROXY`, `MOCK` (supported only for WebSocket APIs). For an HTTP API private integration, use `HTTP_PROXY`.

[integrationUri](#state_integrationuri_yaml) String

URI of the Lambda function for a Lambda proxy integration, when `integrationType` is `AWS_PROXY`. For an `HTTP` integration, specify a fully-qualified URL. For an HTTP API private integration, specify the ARN of an Application Load Balancer listener, Network Load Balancer listener, or AWS Cloud Map service.

[passthroughBehavior](#state_passthroughbehavior_yaml) String

Pass-through behavior for incoming requests based on the Content-Type header in the request, and the available mapping templates specified as the `requestTemplates` attribute. Valid values: `WHEN_NO_MATCH`, `WHEN_NO_TEMPLATES`, `NEVER`. Default is `WHEN_NO_MATCH`. Supported only for WebSocket APIs.

[payloadFormatVersion](#state_payloadformatversion_yaml) String

The [format of the payload](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html#http-api-develop-integrations-lambda.proxy-format) sent to an integration. Valid values: `1.0`, `2.0`. Default is `1.0`.

[region](#state_region_yaml) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[requestParameters](#state_requestparameters_yaml) Map<String>

For WebSocket APIs, a key-value map specifying request parameters that are passed from the method request to the backend. For HTTP APIs with a specified `integrationSubtype`, a key-value map specifying parameters that are passed to `AWS_PROXY` integrations. For HTTP APIs without a specified `integrationSubtype`, a key-value map specifying how to transform HTTP requests before sending them to the backend. See the [Amazon API Gateway Developer Guide](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-parameter-mapping.html) for details.

[requestTemplates](#state_requesttemplates_yaml) Map<String>

Map of [Velocity](https://velocity.apache.org/) templates that are applied on the request payload based on the value of the Content-Type header sent by the client. Supported only for WebSocket APIs.

[responseParameters](#state_responseparameters_yaml) [List<Property Map>](#integrationresponseparameter)

Mappings to transform the HTTP response from a backend integration before returning the response to clients. Supported only for HTTP APIs.

[templateSelectionExpression](#state_templateselectionexpression_yaml) String

The [template selection expression](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-template-selection-expressions) for the integration.

[timeoutMilliseconds](#state_timeoutmilliseconds_yaml) Number

Custom timeout between 50 and 29,000 milliseconds for WebSocket APIs and between 50 and 30,000 milliseconds for HTTP APIs. The default timeout is 29 seconds for WebSocket APIs and 30 seconds for HTTP APIs. this provider will only perform drift detection of its value when present in a configuration.

[tlsConfig](#state_tlsconfig_yaml) [Property Map](#integrationtlsconfig)

TLS configuration for a private integration. Supported only for HTTP APIs.

## Supporting Types[](#supporting-types)

#### IntegrationResponseParameter

, IntegrationResponseParameterArgs

[](#integrationresponseparameter)

[Mappings](#mappings_csharp) This property is required. Dictionary<string, string>

Key-value map. The key of this map identifies the location of the request parameter to change, and how to change it. The corresponding value specifies the new data for the parameter. See the [Amazon API Gateway Developer Guide](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-parameter-mapping.html) for details.

[StatusCode](#statuscode_csharp) This property is required. string

HTTP status code in the range 200-599.

[Mappings](#mappings_go) This property is required. map\[string\]string

Key-value map. The key of this map identifies the location of the request parameter to change, and how to change it. The corresponding value specifies the new data for the parameter. See the [Amazon API Gateway Developer Guide](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-parameter-mapping.html) for details.

[StatusCode](#statuscode_go) This property is required. string

HTTP status code in the range 200-599.

[mappings](#mappings_hcl) This property is required. map(string)

Key-value map. The key of this map identifies the location of the request parameter to change, and how to change it. The corresponding value specifies the new data for the parameter. See the [Amazon API Gateway Developer Guide](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-parameter-mapping.html) for details.

[status\_code](#status_code_hcl) This property is required. string

HTTP status code in the range 200-599.

[mappings](#mappings_java) This property is required. Map<String,String>

Key-value map. The key of this map identifies the location of the request parameter to change, and how to change it. The corresponding value specifies the new data for the parameter. See the [Amazon API Gateway Developer Guide](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-parameter-mapping.html) for details.

[statusCode](#statuscode_java) This property is required. String

HTTP status code in the range 200-599.

[mappings](#mappings_nodejs) This property is required. {\[key: string\]: string}

Key-value map. The key of this map identifies the location of the request parameter to change, and how to change it. The corresponding value specifies the new data for the parameter. See the [Amazon API Gateway Developer Guide](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-parameter-mapping.html) for details.

[statusCode](#statuscode_nodejs) This property is required. string

HTTP status code in the range 200-599.

[mappings](#mappings_python) This property is required. Mapping\[str, str\]

Key-value map. The key of this map identifies the location of the request parameter to change, and how to change it. The corresponding value specifies the new data for the parameter. See the [Amazon API Gateway Developer Guide](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-parameter-mapping.html) for details.

[status\_code](#status_code_python) This property is required. str

HTTP status code in the range 200-599.

[mappings](#mappings_yaml) This property is required. Map<String>

Key-value map. The key of this map identifies the location of the request parameter to change, and how to change it. The corresponding value specifies the new data for the parameter. See the [Amazon API Gateway Developer Guide](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-parameter-mapping.html) for details.

[statusCode](#statuscode_yaml) This property is required. String

HTTP status code in the range 200-599.

#### IntegrationTlsConfig

, IntegrationTlsConfigArgs

[](#integrationtlsconfig)

[ServerNameToVerify](#servernametoverify_csharp) string

If you specify a server name, API Gateway uses it to verify the hostname on the integration's certificate. The server name is also included in the TLS handshake to support Server Name Indication (SNI) or virtual hosting.

[ServerNameToVerify](#servernametoverify_go) string

If you specify a server name, API Gateway uses it to verify the hostname on the integration's certificate. The server name is also included in the TLS handshake to support Server Name Indication (SNI) or virtual hosting.

[server\_name\_to\_verify](#server_name_to_verify_hcl) string

If you specify a server name, API Gateway uses it to verify the hostname on the integration's certificate. The server name is also included in the TLS handshake to support Server Name Indication (SNI) or virtual hosting.

[serverNameToVerify](#servernametoverify_java) String

If you specify a server name, API Gateway uses it to verify the hostname on the integration's certificate. The server name is also included in the TLS handshake to support Server Name Indication (SNI) or virtual hosting.

[serverNameToVerify](#servernametoverify_nodejs) string

If you specify a server name, API Gateway uses it to verify the hostname on the integration's certificate. The server name is also included in the TLS handshake to support Server Name Indication (SNI) or virtual hosting.

[server\_name\_to\_verify](#server_name_to_verify_python) str

If you specify a server name, API Gateway uses it to verify the hostname on the integration's certificate. The server name is also included in the TLS handshake to support Server Name Indication (SNI) or virtual hosting.

[serverNameToVerify](#servernametoverify_yaml) String

If you specify a server name, API Gateway uses it to verify the hostname on the integration's certificate. The server name is also included in the TLS handshake to support Server Name Indication (SNI) or virtual hosting.

## Import[](#import)

Using `pulumi import`, import `aws.apigatewayv2.Integration` using the API identifier and integration identifier. For example:

```bash
$ pulumi import aws:apigatewayv2/integration:Integration example aabbccddee/1122334
```

> **Note:** The API Gateway managed integration created as part of [*quick\_create*](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-basic-concept.html#apigateway-definition-quick-create) cannot be imported.

To learn more about importing existing cloud resources, see [Importing resources](/docs/using-pulumi/adopting-pulumi/import/).

## Package Details[](#package-details)

Repository

[AWS Classic pulumi/pulumi-aws](https://github.com/pulumi/pulumi-aws)

License

Apache-2.0

Notes

This Pulumi package is based on the [`aws` Terraform Provider](https://github.com/hashicorp/terraform-provider-aws).

-   Copy Page

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2fapigatewayv2%2fintegration]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2fapigatewayv2%2fintegration%2f\))

#### Try Pulumi Cloud free.
Your team will thank you.

[Start free trial](https://app.pulumi.com/signup?utm_source=registry&utm_medium=right-rail-banner&utm_campaign=try-pulumi-cloud&iaid=docs-try-pulumi-cloud-ad)
