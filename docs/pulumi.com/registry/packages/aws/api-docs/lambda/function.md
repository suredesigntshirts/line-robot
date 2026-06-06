---
Source: https://www.pulumi.com/registry/packages/aws/api-docs/lambda/function/
Generated: 2026-06-06
Updated: 2026-06-06
---

# aws.lambda.Function

1.  [Packages](/registry/)
2.  [Packages](/registry/packages/)
3.  [AWS](/registry/packages/aws/)
4.  [API Docs](/registry/packages/aws/api-docs/)
5.  [lambda](/registry/packages/aws/api-docs/lambda/)
6.  [Function](/registry/packages/aws/api-docs/lambda/function/)

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

Viewing docs for AWS v7.32.0
published on Friday, May 29, 2026 by Pulumi

[Schema (JSON)](/registry/packages/aws/schema.json)

[pulumi/pulumi-aws](https://github.com/pulumi/pulumi-aws)

v7.32.0 (7.x, latest)v6.83.1 (6.x)v5.43.0 (5.x)

# aws.lambda.Function[](#aws-lambda-function)

Explore with Neo

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2flambda%2ffunction]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2flambda%2ffunction%2f\))

Manages an AWS Lambda Function. Use this resource to create serverless functions that run code in response to events without provisioning or managing servers.

For information about Lambda and how to use it, see [What is AWS Lambda?](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html). For a detailed example of setting up Lambda and API Gateway, see Serverless Applications with AWS Lambda and API Gateway.

> **Note:** Due to [AWS Lambda improved VPC networking changes that began deploying in September 2019](https://aws.amazon.com/blogs/compute/announcing-improved-vpc-networking-for-aws-lambda-functions/), EC2 subnets and security groups associated with Lambda Functions can take up to 45 minutes to successfully delete. Pulumi AWS Provider version 2.31.0 and later automatically handles this increased timeout, however prior versions require setting the customizable deletion timeouts of those Pulumi resources to 45 minutes (`delete = "45m"`). AWS and HashiCorp are working together to reduce the amount of time required for resource deletion and updates can be tracked in this GitHub issue.

> **Note:** If you get a `KMSAccessDeniedException: Lambda was unable to decrypt the environment variables because KMS access was denied` error when invoking an `aws.lambda.Function` with environment variables, the IAM role associated with the function may have been deleted and recreated after the function was created. You can fix the problem two ways: 1) updating the function’s role to another role and then updating it back again to the recreated role. (When you create a function, Lambda grants permissions on the KMS key to the function’s IAM role. If the IAM role is recreated, the grant is no longer valid. Changing the function’s role or recreating the function causes Lambda to update the grant.)

> **Tip:** To give an external source (like an EventBridge Rule, SNS, or S3) permission to access the Lambda function, use the `aws.lambda.Permission` resource. See [Lambda Permission Model](https://docs.aws.amazon.com/lambda/latest/dg/intro-permission-model.html) for more details. On the other hand, the `role` argument of this resource is the function’s execution role for identity and access to AWS services and resources.

## Example Usage[](#example-usage)

### Container Image Function[](#container-image-function)

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const example = new aws.lambda.Function("example", {
    name: "example_container_function",
    role: exampleAwsIamRole.arn,
    packageType: "Image",
    imageUri: `${exampleAwsEcrRepository.repositoryUrl}:latest`,
    imageConfig: {
        entryPoints: ["/lambda-entrypoint.sh"],
        commands: ["app.handler"],
    },
    memorySize: 512,
    timeout: 30,
    architectures: ["arm64"],
});
```

```python
import pulumi
import pulumi_aws as aws

example = aws.lambda_.Function("example",
    name="example_container_function",
    role=example_aws_iam_role["arn"],
    package_type="Image",
    image_uri=f"{example_aws_ecr_repository['repositoryUrl']}:latest",
    image_config={
        "entry_points": ["/lambda-entrypoint.sh"],
        "commands": ["app.handler"],
    },
    memory_size=512,
    timeout=30,
    architectures=["arm64"])
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/lambda"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		_, err := lambda.NewFunction(ctx, "example", &lambda.FunctionArgs{
			Name:        pulumi.String("example_container_function"),
			Role:        pulumi.Any(exampleAwsIamRole.Arn),
			PackageType: pulumi.String("Image"),
			ImageUri:    pulumi.Sprintf("%v:latest", exampleAwsEcrRepository.RepositoryUrl),
			ImageConfig: &lambda.FunctionImageConfigArgs{
				EntryPoints: pulumi.StringArray{
					pulumi.String("/lambda-entrypoint.sh"),
				},
				Commands: pulumi.StringArray{
					pulumi.String("app.handler"),
				},
			},
			MemorySize: pulumi.Int(512),
			Timeout:    pulumi.Int(30),
			Architectures: pulumi.StringArray{
				pulumi.String("arm64"),
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
    var example = new Aws.Lambda.Function("example", new()
    {
        Name = "example_container_function",
        Role = exampleAwsIamRole.Arn,
        PackageType = "Image",
        ImageUri = $"{exampleAwsEcrRepository.RepositoryUrl}:latest",
        ImageConfig = new Aws.Lambda.Inputs.FunctionImageConfigArgs
        {
            EntryPoints = new[]
            {
                "/lambda-entrypoint.sh",
            },
            Commands = new[]
            {
                "app.handler",
            },
        },
        MemorySize = 512,
        Timeout = 30,
        Architectures = new[]
        {
            "arm64",
        },
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
import com.pulumi.aws.lambda.inputs.FunctionImageConfigArgs;
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
            .name("example_container_function")
            .role(exampleAwsIamRole.arn())
            .packageType("Image")
            .imageUri(String.format("%s:latest", exampleAwsEcrRepository.repositoryUrl()))
            .imageConfig(FunctionImageConfigArgs.builder()
                .entryPoints("/lambda-entrypoint.sh")
                .commands("app.handler")
                .build())
            .memorySize(512)
            .timeout(30)
            .architectures("arm64")
            .build());

    }
}
```

```yaml
resources:
  example:
    type: aws:lambda:Function
    properties:
      name: example_container_function
      role: ${exampleAwsIamRole.arn}
      packageType: Image
      imageUri: ${exampleAwsEcrRepository.repositoryUrl}:latest
      imageConfig:
        entryPoints:
          - /lambda-entrypoint.sh
        commands:
          - app.handler
      memorySize: 512
      timeout: 30
      architectures: # Graviton support for better price/performance
        - arm64
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
  name         = "example_container_function"
  role         = exampleAwsIamRole.arn
  package_type = "Image"
  image_uri    ="${exampleAwsEcrRepository.repositoryUrl}:latest"
  image_config = {
    entry_points = ["/lambda-entrypoint.sh"]
    commands     = ["app.handler"]
  }
  memory_size   = 512
  timeout       = 30
  architectures = ["arm64"] # Graviton support for better price/performance
}
```

### Function with Lambda Layers[](#function-with-lambda-layers)

> **Note:** The `aws.lambda.LayerVersion` attribute values for `arn` and `layerArn` were swapped in version 2.0.0 of the Pulumi AWS Provider. For version 2.x, use `arn` references.

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

// Common dependencies layer
const example = new aws.lambda.LayerVersion("example", {
    code: new pulumi.asset.FileArchive("layer.zip"),
    layerName: "example_dependencies_layer",
    description: "Common dependencies for Lambda functions",
    compatibleRuntimes: [
        "nodejs24.x",
        "python3.12",
    ],
    compatibleArchitectures: [
        "x86_64",
        "arm64",
    ],
});
// Function using the layer
const exampleFunction = new aws.lambda.Function("example", {
    code: new pulumi.asset.FileArchive("function.zip"),
    name: "example_layered_function",
    role: exampleAwsIamRole.arn,
    handler: "index.handler",
    runtime: aws.lambda.Runtime.NodeJS24dX,
    layers: [example.arn],
    tracingConfig: {
        mode: "Active",
    },
});
```

```python
import pulumi
import pulumi_aws as aws

# Common dependencies layer
example = aws.lambda_.LayerVersion("example",
    code=pulumi.FileArchive("layer.zip"),
    layer_name="example_dependencies_layer",
    description="Common dependencies for Lambda functions",
    compatible_runtimes=[
        "nodejs24.x",
        "python3.12",
    ],
    compatible_architectures=[
        "x86_64",
        "arm64",
    ])

# Function using the layer
example_function = aws.lambda_.Function("example",
    code=pulumi.FileArchive("function.zip"),
    name="example_layered_function",
    role=example_aws_iam_role["arn"],
    handler="index.handler",
    runtime=aws.lambda_.Runtime.NODE_JS24D_X,
    layers=[example.arn],
    tracing_config={
        "mode": "Active",
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
		// Common dependencies layer
		example, err := lambda.NewLayerVersion(ctx, "example", &lambda.LayerVersionArgs{
			Code:        pulumi.NewFileArchive("layer.zip"),
			LayerName:   pulumi.String("example_dependencies_layer"),
			Description: pulumi.String("Common dependencies for Lambda functions"),
			CompatibleRuntimes: pulumi.StringArray{
				pulumi.String("nodejs24.x"),
				pulumi.String("python3.12"),
			},
			CompatibleArchitectures: pulumi.StringArray{
				pulumi.String("x86_64"),
				pulumi.String("arm64"),
			},
		})
		if err != nil {
			return err
		}
		// Function using the layer
		_, err = lambda.NewFunction(ctx, "example", &lambda.FunctionArgs{
			Code:    pulumi.NewFileArchive("function.zip"),
			Name:    pulumi.String("example_layered_function"),
			Role:    pulumi.Any(exampleAwsIamRole.Arn),
			Handler: pulumi.String("index.handler"),
			Runtime: pulumi.String(lambda.RuntimeNodeJS24dX),
			Layers: pulumi.StringArray{
				example.Arn,
			},
			TracingConfig: &lambda.FunctionTracingConfigArgs{
				Mode: pulumi.String("Active"),
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
    // Common dependencies layer
    var example = new Aws.Lambda.LayerVersion("example", new()
    {
        Code = new FileArchive("layer.zip"),
        LayerName = "example_dependencies_layer",
        Description = "Common dependencies for Lambda functions",
        CompatibleRuntimes = new[]
        {
            "nodejs24.x",
            "python3.12",
        },
        CompatibleArchitectures = new[]
        {
            "x86_64",
            "arm64",
        },
    });

    // Function using the layer
    var exampleFunction = new Aws.Lambda.Function("example", new()
    {
        Code = new FileArchive("function.zip"),
        Name = "example_layered_function",
        Role = exampleAwsIamRole.Arn,
        Handler = "index.handler",
        Runtime = Aws.Lambda.Runtime.NodeJS24dX,
        Layers = new[]
        {
            example.Arn,
        },
        TracingConfig = new Aws.Lambda.Inputs.FunctionTracingConfigArgs
        {
            Mode = "Active",
        },
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.lambda.LayerVersion;
import com.pulumi.aws.lambda.LayerVersionArgs;
import com.pulumi.aws.lambda.Function;
import com.pulumi.aws.lambda.FunctionArgs;
import com.pulumi.aws.lambda.inputs.FunctionTracingConfigArgs;
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
        // Common dependencies layer
        var example = new LayerVersion("example", LayerVersionArgs.builder()
            .code(new FileArchive("layer.zip"))
            .layerName("example_dependencies_layer")
            .description("Common dependencies for Lambda functions")
            .compatibleRuntimes(
                "nodejs24.x",
                "python3.12")
            .compatibleArchitectures(
                "x86_64",
                "arm64")
            .build());

        // Function using the layer
        var exampleFunction = new Function("exampleFunction", FunctionArgs.builder()
            .code(new FileArchive("function.zip"))
            .name("example_layered_function")
            .role(exampleAwsIamRole.arn())
            .handler("index.handler")
            .runtime("nodejs24.x")
            .layers(example.arn())
            .tracingConfig(FunctionTracingConfigArgs.builder()
                .mode("Active")
                .build())
            .build());

    }
}
```

```yaml
resources:
  # Common dependencies layer
  example:
    type: aws:lambda:LayerVersion
    properties:
      code:
        fn::fileArchive: layer.zip
      layerName: example_dependencies_layer
      description: Common dependencies for Lambda functions
      compatibleRuntimes:
        - nodejs24.x
        - python3.12
      compatibleArchitectures:
        - x86_64
        - arm64
  # Function using the layer
  exampleFunction:
    type: aws:lambda:Function
    name: example
    properties:
      code:
        fn::fileArchive: function.zip
      name: example_layered_function
      role: ${exampleAwsIamRole.arn}
      handler: index.handler
      runtime: nodejs24.x
      layers:
        - ${example.arn}
      tracingConfig:
        mode: Active
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

# Common dependencies layer
resource "aws_lambda_layerversion" "example" {
  code                     = fileArchive("layer.zip")
  layer_name               = "example_dependencies_layer"
  description              = "Common dependencies for Lambda functions"
  compatible_runtimes      = ["nodejs24.x", "python3.12"]
  compatible_architectures = ["x86_64", "arm64"]
}

# Function using the layer
resource "aws_lambda_function" "example" {
  code    = fileArchive("function.zip")
  name    = "example_layered_function"
  role    = exampleAwsIamRole.arn
  handler = "index.handler"
  runtime = "nodejs24.x"
  layers  = [aws_lambda_layerversion.example.arn]
  tracing_config = {
    mode = "Active"
  }
}
```

### VPC Function with Enhanced Networking[](#vpc-function-with-enhanced-networking)

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const example = new aws.lambda.Function("example", {
    code: new pulumi.asset.FileArchive("function.zip"),
    name: "example_vpc_function",
    role: exampleAwsIamRole.arn,
    handler: "app.handler",
    runtime: aws.lambda.Runtime.Python3d12,
    memorySize: 1024,
    timeout: 30,
    vpcConfig: {
        subnetIds: [
            examplePrivate1.id,
            examplePrivate2.id,
        ],
        securityGroupIds: [exampleLambda.id],
        ipv6AllowedForDualStack: true,
    },
    ephemeralStorage: {
        size: 5120,
    },
    snapStart: {
        applyOn: "PublishedVersions",
    },
});
```

```python
import pulumi
import pulumi_aws as aws

example = aws.lambda_.Function("example",
    code=pulumi.FileArchive("function.zip"),
    name="example_vpc_function",
    role=example_aws_iam_role["arn"],
    handler="app.handler",
    runtime=aws.lambda_.Runtime.PYTHON3D12,
    memory_size=1024,
    timeout=30,
    vpc_config={
        "subnet_ids": [
            example_private1["id"],
            example_private2["id"],
        ],
        "security_group_ids": [example_lambda["id"]],
        "ipv6_allowed_for_dual_stack": True,
    },
    ephemeral_storage={
        "size": 5120,
    },
    snap_start={
        "apply_on": "PublishedVersions",
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
		_, err := lambda.NewFunction(ctx, "example", &lambda.FunctionArgs{
			Code:       pulumi.NewFileArchive("function.zip"),
			Name:       pulumi.String("example_vpc_function"),
			Role:       pulumi.Any(exampleAwsIamRole.Arn),
			Handler:    pulumi.String("app.handler"),
			Runtime:    pulumi.String(lambda.RuntimePython3d12),
			MemorySize: pulumi.Int(1024),
			Timeout:    pulumi.Int(30),
			VpcConfig: &lambda.FunctionVpcConfigArgs{
				SubnetIds: pulumi.StringArray{
					examplePrivate1.Id,
					examplePrivate2.Id,
				},
				SecurityGroupIds: pulumi.StringArray{
					exampleLambda.Id,
				},
				Ipv6AllowedForDualStack: pulumi.Bool(true),
			},
			EphemeralStorage: &lambda.FunctionEphemeralStorageArgs{
				Size: pulumi.Int(5120),
			},
			SnapStart: &lambda.FunctionSnapStartArgs{
				ApplyOn: pulumi.String("PublishedVersions"),
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
    var example = new Aws.Lambda.Function("example", new()
    {
        Code = new FileArchive("function.zip"),
        Name = "example_vpc_function",
        Role = exampleAwsIamRole.Arn,
        Handler = "app.handler",
        Runtime = Aws.Lambda.Runtime.Python3d12,
        MemorySize = 1024,
        Timeout = 30,
        VpcConfig = new Aws.Lambda.Inputs.FunctionVpcConfigArgs
        {
            SubnetIds = new[]
            {
                examplePrivate1.Id,
                examplePrivate2.Id,
            },
            SecurityGroupIds = new[]
            {
                exampleLambda.Id,
            },
            Ipv6AllowedForDualStack = true,
        },
        EphemeralStorage = new Aws.Lambda.Inputs.FunctionEphemeralStorageArgs
        {
            Size = 5120,
        },
        SnapStart = new Aws.Lambda.Inputs.FunctionSnapStartArgs
        {
            ApplyOn = "PublishedVersions",
        },
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
import com.pulumi.aws.lambda.inputs.FunctionVpcConfigArgs;
import com.pulumi.aws.lambda.inputs.FunctionEphemeralStorageArgs;
import com.pulumi.aws.lambda.inputs.FunctionSnapStartArgs;
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
            .code(new FileArchive("function.zip"))
            .name("example_vpc_function")
            .role(exampleAwsIamRole.arn())
            .handler("app.handler")
            .runtime("python3.12")
            .memorySize(1024)
            .timeout(30)
            .vpcConfig(FunctionVpcConfigArgs.builder()
                .subnetIds(
                    examplePrivate1.id(),
                    examplePrivate2.id())
                .securityGroupIds(exampleLambda.id())
                .ipv6AllowedForDualStack(true)
                .build())
            .ephemeralStorage(FunctionEphemeralStorageArgs.builder()
                .size(5120)
                .build())
            .snapStart(FunctionSnapStartArgs.builder()
                .applyOn("PublishedVersions")
                .build())
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
        fn::fileArchive: function.zip
      name: example_vpc_function
      role: ${exampleAwsIamRole.arn}
      handler: app.handler
      runtime: python3.12
      memorySize: 1024
      timeout: 30
      vpcConfig:
        subnetIds:
          - ${examplePrivate1.id}
          - ${examplePrivate2.id}
        securityGroupIds:
          - ${exampleLambda.id}
        ipv6AllowedForDualStack: true
      ephemeralStorage:
        size: 5120
      snapStart:
        applyOn: PublishedVersions
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
  code        = fileArchive("function.zip")
  name        = "example_vpc_function"
  role        = exampleAwsIamRole.arn
  handler     = "app.handler"
  runtime     = "python3.12"
  memory_size = 1024
  timeout     = 30
  vpc_config = {
    subnet_ids                  = [examplePrivate1.id, examplePrivate2.id]
    security_group_ids          = [exampleLambda.id]
    ipv6_allowed_for_dual_stack = true
  }
  # Enable IPv6 support
  ephemeral_storage = {
    size = 5120
  }
  snap_start = {
    apply_on = "PublishedVersions"
  }
}
```

### Function with EFS Integration[](#function-with-efs-integration)

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

// EFS file system for Lambda
const example = new aws.efs.FileSystem("example", {
    encrypted: true,
    tags: {
        Name: "lambda-efs",
    },
});
const config = new pulumi.Config();
// List of subnet IDs for EFS mount targets
const subnetIds = config.getObject<Array<string>>("subnetIds") || [
    "subnet-12345678",
    "subnet-87654321",
];
// Mount target in each subnet
const exampleMountTarget: aws.efs.MountTarget[] = [];
for (const range = {value: 0}; range.value < subnetIds.length; range.value++) {
    exampleMountTarget.push(new aws.efs.MountTarget(`example-${range.value}`, {
        fileSystemId: example.id,
        subnetId: subnetIds[range.value],
        securityGroups: [efs.id],
    }));
}
// Access point for Lambda
const exampleAccessPoint = new aws.efs.AccessPoint("example", {
    fileSystemId: example.id,
    rootDirectory: {
        path: "/lambda",
        creationInfo: {
            ownerGid: 1000,
            ownerUid: 1000,
            permissions: "755",
        },
    },
    posixUser: {
        gid: 1000,
        uid: 1000,
    },
});
// Lambda function with EFS
const exampleFunction = new aws.lambda.Function("example", {
    code: new pulumi.asset.FileArchive("function.zip"),
    name: "example_efs_function",
    role: exampleAwsIamRole.arn,
    handler: "index.handler",
    runtime: aws.lambda.Runtime.NodeJS24dX,
    vpcConfig: {
        subnetIds: subnetIds,
        securityGroupIds: [lambda.id],
    },
    fileSystemConfig: {
        arn: exampleAccessPoint.arn,
        localMountPath: "/mnt/data",
    },
}, {
    dependsOn: [exampleMountTarget],
});
```

```python
import pulumi
from typing import Any
import pulumi_aws as aws

# EFS file system for Lambda
example = aws.efs.FileSystem("example",
    encrypted=True,
    tags={
        "Name": "lambda-efs",
    })
config = pulumi.Config()

# List of subnet IDs for EFS mount targets
subnet_ids = config.get_object("subnetIds")
if subnet_ids is None:
    subnet_ids = [
        "subnet-12345678",
        "subnet-87654321",
    ]

# Mount target in each subnet
example_mount_target: list[Any] = []
for range in [{"value": i} for i in range(0, len(subnet_ids))]:
    example_mount_target.append(aws.efs.MountTarget(f"example-{range['value']}",
        file_system_id=example.id,
        subnet_id=subnet_ids[range["value"]],
        security_groups=[efs["id"]]))

# Access point for Lambda
example_access_point = aws.efs.AccessPoint("example",
    file_system_id=example.id,
    root_directory={
        "path": "/lambda",
        "creation_info": {
            "owner_gid": 1000,
            "owner_uid": 1000,
            "permissions": "755",
        },
    },
    posix_user={
        "gid": 1000,
        "uid": 1000,
    })

# Lambda function with EFS
example_function = aws.lambda_.Function("example",
    code=pulumi.FileArchive("function.zip"),
    name="example_efs_function",
    role=example_aws_iam_role["arn"],
    handler="index.handler",
    runtime=aws.lambda_.Runtime.NODE_JS24D_X,
    vpc_config={
        "subnet_ids": subnet_ids,
        "security_group_ids": [lambda_["id"]],
    },
    file_system_config={
        "arn": example_access_point.arn,
        "local_mount_path": "/mnt/data",
    },
    opts = pulumi.ResourceOptions(depends_on=[example_mount_target]))
```

```go
package main

import (
	"fmt"

	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/efs"
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/lambda"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi/config"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		// EFS file system for Lambda
		example, err := efs.NewFileSystem(ctx, "example", &efs.FileSystemArgs{
			Encrypted: pulumi.Bool(true),
			Tags: pulumi.StringMap{
				"Name": pulumi.String("lambda-efs"),
			},
		})
		if err != nil {
			return err
		}
		cfg := config.New(ctx, "")
		// List of subnet IDs for EFS mount targets
		subnetIds := []string{
			"subnet-12345678",
			"subnet-87654321",
		}
		if param := cfg.GetObject("subnetIds"); param != nil {
			subnetIds = param
		}
		// Mount target in each subnet
		var exampleMountTarget []*efs.MountTarget
		for index := 0; index < len(subnetIds); index++ {
			key0 := index
			val0 := index
			__res, err := efs.NewMountTarget(ctx, fmt.Sprintf("example-%v", key0), &efs.MountTargetArgs{
				FileSystemId: example.ID(),
				SubnetId:     pulumi.String(subnetIds[val0]),
				SecurityGroups: pulumi.StringArray{
					efs.Id,
				},
			})
			if err != nil {
				return err
			}
			exampleMountTarget = append(exampleMountTarget, __res)
		}
		// Access point for Lambda
		exampleAccessPoint, err := efs.NewAccessPoint(ctx, "example", &efs.AccessPointArgs{
			FileSystemId: example.ID(),
			RootDirectory: &efs.AccessPointRootDirectoryArgs{
				Path: pulumi.String("/lambda"),
				CreationInfo: &efs.AccessPointRootDirectoryCreationInfoArgs{
					OwnerGid:    pulumi.Int(1000),
					OwnerUid:    pulumi.Int(1000),
					Permissions: pulumi.String("755"),
				},
			},
			PosixUser: &efs.AccessPointPosixUserArgs{
				Gid: pulumi.Int(1000),
				Uid: pulumi.Int(1000),
			},
		})
		if err != nil {
			return err
		}
		// Lambda function with EFS
		_, err = lambda.NewFunction(ctx, "example", &lambda.FunctionArgs{
			Code:    pulumi.NewFileArchive("function.zip"),
			Name:    pulumi.String("example_efs_function"),
			Role:    pulumi.Any(exampleAwsIamRole.Arn),
			Handler: pulumi.String("index.handler"),
			Runtime: pulumi.String(lambda.RuntimeNodeJS24dX),
			VpcConfig: &lambda.FunctionVpcConfigArgs{
				SubnetIds: subnetIds,
				SecurityGroupIds: pulumi.StringArray{
					lambda.Id,
				},
			},
			FileSystemConfig: &lambda.FunctionFileSystemConfigArgs{
				Arn:            exampleAccessPoint.Arn,
				LocalMountPath: pulumi.String("/mnt/data"),
			},
		}, pulumi.DependsOn([]pulumi.Resource{
			exampleMountTarget,
		}))
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
    // EFS file system for Lambda
    var example = new Aws.Efs.FileSystem("example", new()
    {
        Encrypted = true,
        Tags =
        {
            { "Name", "lambda-efs" },
        },
    });

    var config = new Config();
    // List of subnet IDs for EFS mount targets
    var subnetIds = config.GetObject<string[]>("subnetIds") ?? new[]
    {
        "subnet-12345678",
        "subnet-87654321",
    };
    // Mount target in each subnet
    var exampleMountTarget = new List<Aws.Efs.MountTarget>();
    for (var rangeIndex = 0; rangeIndex < subnetIds.Length; rangeIndex++)
    {
        var range = new { Value = rangeIndex };
        exampleMountTarget.Add(new Aws.Efs.MountTarget($"example-{range.Value}", new()
        {
            FileSystemId = example.Id,
            SubnetId = subnetIds[range.Value],
            SecurityGroups = new[]
            {
                efs.Id,
            },
        }));
    }
    // Access point for Lambda
    var exampleAccessPoint = new Aws.Efs.AccessPoint("example", new()
    {
        FileSystemId = example.Id,
        RootDirectory = new Aws.Efs.Inputs.AccessPointRootDirectoryArgs
        {
            Path = "/lambda",
            CreationInfo = new Aws.Efs.Inputs.AccessPointRootDirectoryCreationInfoArgs
            {
                OwnerGid = 1000,
                OwnerUid = 1000,
                Permissions = "755",
            },
        },
        PosixUser = new Aws.Efs.Inputs.AccessPointPosixUserArgs
        {
            Gid = 1000,
            Uid = 1000,
        },
    });

    // Lambda function with EFS
    var exampleFunction = new Aws.Lambda.Function("example", new()
    {
        Code = new FileArchive("function.zip"),
        Name = "example_efs_function",
        Role = exampleAwsIamRole.Arn,
        Handler = "index.handler",
        Runtime = Aws.Lambda.Runtime.NodeJS24dX,
        VpcConfig = new Aws.Lambda.Inputs.FunctionVpcConfigArgs
        {
            SubnetIds = subnetIds,
            SecurityGroupIds = new[]
            {
                lambda.Id,
            },
        },
        FileSystemConfig = new Aws.Lambda.Inputs.FunctionFileSystemConfigArgs
        {
            Arn = exampleAccessPoint.Arn,
            LocalMountPath = "/mnt/data",
        },
    }, new CustomResourceOptions
    {
        DependsOn =
        {
            exampleMountTarget,
        },
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.efs.FileSystem;
import com.pulumi.aws.efs.FileSystemArgs;
import com.pulumi.aws.efs.MountTarget;
import com.pulumi.aws.efs.MountTargetArgs;
import com.pulumi.aws.efs.AccessPoint;
import com.pulumi.aws.efs.AccessPointArgs;
import com.pulumi.aws.efs.inputs.AccessPointRootDirectoryArgs;
import com.pulumi.aws.efs.inputs.AccessPointRootDirectoryCreationInfoArgs;
import com.pulumi.aws.efs.inputs.AccessPointPosixUserArgs;
import com.pulumi.aws.lambda.Function;
import com.pulumi.aws.lambda.FunctionArgs;
import com.pulumi.aws.lambda.inputs.FunctionVpcConfigArgs;
import com.pulumi.aws.lambda.inputs.FunctionFileSystemConfigArgs;
import com.pulumi.asset.FileArchive;
import com.pulumi.codegen.internal.KeyedValue;
import com.pulumi.resources.CustomResourceOptions;
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
        final var config = ctx.config();
        // EFS file system for Lambda
        var example = new FileSystem("example", FileSystemArgs.builder()
            .encrypted(true)
            .tags(Map.of("Name", "lambda-efs"))
            .build());

        final var subnetIds = config.get("subnetIds").orElse(
            "subnet-12345678",
            "subnet-87654321");
        // Mount target in each subnet
        for (var i = 0; i < subnetIds.length(); i++) {
            new MountTarget("exampleMountTarget-" + i, MountTargetArgs.builder()
                .fileSystemId(example.id())
                .subnetId(subnetIds[range.value()])
                .securityGroups(efs.id())
                .build());

}
        // Access point for Lambda
        var exampleAccessPoint = new AccessPoint("exampleAccessPoint", AccessPointArgs.builder()
            .fileSystemId(example.id())
            .rootDirectory(AccessPointRootDirectoryArgs.builder()
                .path("/lambda")
                .creationInfo(AccessPointRootDirectoryCreationInfoArgs.builder()
                    .ownerGid(1000)
                    .ownerUid(1000)
                    .permissions("755")
                    .build())
                .build())
            .posixUser(AccessPointPosixUserArgs.builder()
                .gid(1000)
                .uid(1000)
                .build())
            .build());

        // Lambda function with EFS
        var exampleFunction = new Function("exampleFunction", FunctionArgs.builder()
            .code(new FileArchive("function.zip"))
            .name("example_efs_function")
            .role(exampleAwsIamRole.arn())
            .handler("index.handler")
            .runtime("nodejs24.x")
            .vpcConfig(FunctionVpcConfigArgs.builder()
                .subnetIds(subnetIds)
                .securityGroupIds(lambda.id())
                .build())
            .fileSystemConfig(FunctionFileSystemConfigArgs.builder()
                .arn(exampleAccessPoint.arn())
                .localMountPath("/mnt/data")
                .build())
            .build(), CustomResourceOptions.builder()
                .dependsOn(exampleMountTarget)
                .build());

    }
}
```

```
Example coming soon!
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

# EFS file system for Lambda
resource "aws_efs_filesystem" "example" {
  encrypted = true
  tags = {
    "Name" = "lambda-efs"
  }
}

# Mount target in each subnet
resource "aws_efs_mounttarget" "example" {
  count           = length(var.subnetIds)
  file_system_id  = aws_efs_filesystem.example.id
  subnet_id       = var.subnetIds[count.index]
  security_groups = [efs.id]
}

# Access point for Lambda
resource "aws_efs_accesspoint" "example" {
  file_system_id = aws_efs_filesystem.example.id
  root_directory = {
    path = "/lambda"
    creation_info = {
      owner_gid   = 1000
      owner_uid   = 1000
      permissions = "755"
    }
  }
  posix_user = {
    gid = 1000
    uid = 1000
  }
}

# Lambda function with EFS
resource "aws_lambda_function" "example" {
  depends_on = [aws_efs_mounttarget.example]
  code       = fileArchive("function.zip")
  name       = "example_efs_function"
  role       = exampleAwsIamRole.arn
  handler    = "index.handler"
  runtime    = "nodejs24.x"
  vpc_config = {
    subnet_ids         = var.subnetIds
    security_group_ids = [lambda.id]
  }
  file_system_config = {
    arn              = aws_efs_accesspoint.example.arn
    local_mount_path = "/mnt/data"
  }
}

# Example subnet IDs (replace with your actual subnet IDs)
variable "subnetIds" {
  type        = list(string)
  default     = ["subnet-12345678", "subnet-87654321"]
  description = "List of subnet IDs for EFS mount targets"
}
```

### Function with S3 Files File System[](#function-with-s3-files-file-system)

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const current = aws.getCallerIdentity({});
const currentGetRegion = aws.getRegion({});
const lambdaFileSystem = new aws.s3.Bucket("lambda_file_system", {
    bucket: Promise.all([current, currentGetRegion]).then(([current, currentGetRegion]) => `example-${current.accountId}-${currentGetRegion.name}-an`),
    bucketNamespace: "account-regional",
});
const lambdaFileSystemBucketVersioning = new aws.s3.BucketVersioning("lambda_file_system", {
    bucket: lambdaFileSystem.bucket,
    versioningConfiguration: {
        status: "Enabled",
    },
});
const forLambda = new aws.s3.FilesFileSystem("for_lambda", {
    bucket: lambdaFileSystem.arn,
    roleArn: s3files.arn,
}, {
    dependsOn: [lambdaFileSystemBucketVersioning],
});
const forLambdaFilesAccessPoint = new aws.s3.FilesAccessPoint("for_lambda", {
    fileSystemId: forLambda.id,
    rootDirectories: [{
        path: "/lambda",
        creationPermissions: [{
            ownerGid: 1000,
            ownerUid: 1000,
            permissions: "755",
        }],
    }],
    posixUsers: [{
        gid: 1000,
        uid: 1000,
    }],
});
const s3filesMountTargets = new aws.ec2.SecurityGroup("s3files_mount_targets", {
    name: "example-s3files-mount-targets-sg",
    vpcId: vpcForLambda.id,
});
const lambdaS3files = new aws.ec2.SecurityGroup("lambda_s3files", {
    name: "example-lambda-s3files-sg",
    vpcId: vpcForLambda.id,
});
const s3filesMountTargetsNfs = new aws.vpc.SecurityGroupIngressRule("s3files_mount_targets_nfs", {
    ipProtocol: "tcp",
    fromPort: 2049,
    toPort: 2049,
    referencedSecurityGroupId: lambdaS3files.id,
    securityGroupId: s3filesMountTargets.id,
});
const lambdaS3filesNfs = new aws.vpc.SecurityGroupEgressRule("lambda_s3files_nfs", {
    ipProtocol: "tcp",
    securityGroupId: lambdaS3files.id,
    fromPort: 2049,
    toPort: 2049,
    referencedSecurityGroupId: s3filesMountTargets.id,
});
const example = new aws.lambda.Function("example", {
    code: new pulumi.asset.FileArchive("function.zip"),
    name: "example_s3files_function",
    role: iamForLambda.arn,
    handler: "exports.example",
    runtime: aws.lambda.Runtime.NodeJS24dX,
    vpcConfig: {
        subnetIds: [subnetForLambdaAz1.id],
        securityGroupIds: [lambdaS3files.id],
    },
    fileSystemConfig: {
        arn: forLambdaFilesAccessPoint.arn,
        localMountPath: "/mnt/s3files",
    },
}, {
    dependsOn: [forLambdaAwsS3filesMountTarget],
});
```

```python
import pulumi
import pulumi_aws as aws

current = aws.get_caller_identity()
current_get_region = aws.get_region()
lambda_file_system = aws.s3.Bucket("lambda_file_system",
    bucket=f"example-{current.account_id}-{current_get_region.name}-an",
    bucket_namespace="account-regional")
lambda_file_system_bucket_versioning = aws.s3.BucketVersioning("lambda_file_system",
    bucket=lambda_file_system.bucket,
    versioning_configuration={
        "status": "Enabled",
    })
for_lambda = aws.s3.FilesFileSystem("for_lambda",
    bucket=lambda_file_system.arn,
    role_arn=s3files["arn"],
    opts = pulumi.ResourceOptions(depends_on=[lambda_file_system_bucket_versioning]))
for_lambda_files_access_point = aws.s3.FilesAccessPoint("for_lambda",
    file_system_id=for_lambda.id,
    root_directories=[{
        "path": "/lambda",
        "creation_permissions": [{
            "owner_gid": 1000,
            "owner_uid": 1000,
            "permissions": "755",
        }],
    }],
    posix_users=[{
        "gid": 1000,
        "uid": 1000,
    }])
s3files_mount_targets = aws.ec2.SecurityGroup("s3files_mount_targets",
    name="example-s3files-mount-targets-sg",
    vpc_id=vpc_for_lambda["id"])
lambda_s3files = aws.ec2.SecurityGroup("lambda_s3files",
    name="example-lambda-s3files-sg",
    vpc_id=vpc_for_lambda["id"])
s3files_mount_targets_nfs = aws.vpc.SecurityGroupIngressRule("s3files_mount_targets_nfs",
    ip_protocol="tcp",
    from_port=2049,
    to_port=2049,
    referenced_security_group_id=lambda_s3files.id,
    security_group_id=s3files_mount_targets.id)
lambda_s3files_nfs = aws.vpc.SecurityGroupEgressRule("lambda_s3files_nfs",
    ip_protocol="tcp",
    security_group_id=lambda_s3files.id,
    from_port=2049,
    to_port=2049,
    referenced_security_group_id=s3files_mount_targets.id)
example = aws.lambda_.Function("example",
    code=pulumi.FileArchive("function.zip"),
    name="example_s3files_function",
    role=iam_for_lambda["arn"],
    handler="exports.example",
    runtime=aws.lambda_.Runtime.NODE_JS24D_X,
    vpc_config={
        "subnet_ids": [subnet_for_lambda_az1["id"]],
        "security_group_ids": [lambda_s3files.id],
    },
    file_system_config={
        "arn": for_lambda_files_access_point.arn,
        "local_mount_path": "/mnt/s3files",
    },
    opts = pulumi.ResourceOptions(depends_on=[for_lambda_aws_s3files_mount_target]))
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws"
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/ec2"
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/lambda"
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/s3"
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/vpc"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		current, err := aws.GetCallerIdentity(ctx, &aws.GetCallerIdentityArgs{}, nil)
		if err != nil {
			return err
		}
		currentGetRegion, err := aws.GetRegion(ctx, &aws.GetRegionArgs{}, nil)
		if err != nil {
			return err
		}
		lambdaFileSystem, err := s3.NewBucket(ctx, "lambda_file_system", &s3.BucketArgs{
			Bucket:          pulumi.Sprintf("example-%v-%v-an", current.AccountId, currentGetRegion.Name),
			BucketNamespace: pulumi.String("account-regional"),
		})
		if err != nil {
			return err
		}
		lambdaFileSystemBucketVersioning, err := s3.NewBucketVersioning(ctx, "lambda_file_system", &s3.BucketVersioningArgs{
			Bucket: lambdaFileSystem.Bucket,
			VersioningConfiguration: &s3.BucketVersioningVersioningConfigurationArgs{
				Status: pulumi.String("Enabled"),
			},
		})
		if err != nil {
			return err
		}
		forLambda, err := s3.NewFilesFileSystem(ctx, "for_lambda", &s3.FilesFileSystemArgs{
			Bucket:  lambdaFileSystem.Arn,
			RoleArn: pulumi.Any(s3files.Arn),
		}, pulumi.DependsOn([]pulumi.Resource{
			lambdaFileSystemBucketVersioning,
		}))
		if err != nil {
			return err
		}
		forLambdaFilesAccessPoint, err := s3.NewFilesAccessPoint(ctx, "for_lambda", &s3.FilesAccessPointArgs{
			FileSystemId: forLambda.ID(),
			RootDirectories: s3.FilesAccessPointRootDirectoryArray{
				&s3.FilesAccessPointRootDirectoryArgs{
					Path: pulumi.String("/lambda"),
					CreationPermissions: s3.FilesAccessPointRootDirectoryCreationPermissionArray{
						&s3.FilesAccessPointRootDirectoryCreationPermissionArgs{
							OwnerGid:    pulumi.Int(1000),
							OwnerUid:    pulumi.Int(1000),
							Permissions: pulumi.String("755"),
						},
					},
				},
			},
			PosixUsers: s3.FilesAccessPointPosixUserArray{
				&s3.FilesAccessPointPosixUserArgs{
					Gid: pulumi.Int(1000),
					Uid: pulumi.Int(1000),
				},
			},
		})
		if err != nil {
			return err
		}
		s3filesMountTargets, err := ec2.NewSecurityGroup(ctx, "s3files_mount_targets", &ec2.SecurityGroupArgs{
			Name:  pulumi.String("example-s3files-mount-targets-sg"),
			VpcId: pulumi.Any(vpcForLambda.Id),
		})
		if err != nil {
			return err
		}
		lambdaS3files, err := ec2.NewSecurityGroup(ctx, "lambda_s3files", &ec2.SecurityGroupArgs{
			Name:  pulumi.String("example-lambda-s3files-sg"),
			VpcId: pulumi.Any(vpcForLambda.Id),
		})
		if err != nil {
			return err
		}
		_, err = vpc.NewSecurityGroupIngressRule(ctx, "s3files_mount_targets_nfs", &vpc.SecurityGroupIngressRuleArgs{
			IpProtocol:                pulumi.String("tcp"),
			FromPort:                  pulumi.Int(2049),
			ToPort:                    pulumi.Int(2049),
			ReferencedSecurityGroupId: lambdaS3files.ID(),
			SecurityGroupId:           s3filesMountTargets.ID(),
		})
		if err != nil {
			return err
		}
		_, err = vpc.NewSecurityGroupEgressRule(ctx, "lambda_s3files_nfs", &vpc.SecurityGroupEgressRuleArgs{
			IpProtocol:                pulumi.String("tcp"),
			SecurityGroupId:           lambdaS3files.ID(),
			FromPort:                  pulumi.Int(2049),
			ToPort:                    pulumi.Int(2049),
			ReferencedSecurityGroupId: s3filesMountTargets.ID(),
		})
		if err != nil {
			return err
		}
		_, err = lambda.NewFunction(ctx, "example", &lambda.FunctionArgs{
			Code:    pulumi.NewFileArchive("function.zip"),
			Name:    pulumi.String("example_s3files_function"),
			Role:    pulumi.Any(iamForLambda.Arn),
			Handler: pulumi.String("exports.example"),
			Runtime: pulumi.String(lambda.RuntimeNodeJS24dX),
			VpcConfig: &lambda.FunctionVpcConfigArgs{
				SubnetIds: pulumi.StringArray{
					subnetForLambdaAz1.Id,
				},
				SecurityGroupIds: pulumi.StringArray{
					lambdaS3files.ID(),
				},
			},
			FileSystemConfig: &lambda.FunctionFileSystemConfigArgs{
				Arn:            forLambdaFilesAccessPoint.Arn,
				LocalMountPath: pulumi.String("/mnt/s3files"),
			},
		}, pulumi.DependsOn([]pulumi.Resource{
			forLambdaAwsS3filesMountTarget,
		}))
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
    var current = Aws.GetCallerIdentity.Invoke();

    var currentGetRegion = Aws.GetRegion.Invoke();

    var lambdaFileSystem = new Aws.S3.Bucket("lambda_file_system", new()
    {
        BucketName = Output.Tuple(current, currentGetRegion).Apply(values =>
        {
            var current = values.Item1;
            var currentGetRegion = values.Item2;
            return $"example-{current.Apply(getCallerIdentityResult => getCallerIdentityResult.AccountId)}-{currentGetRegion.Apply(getRegionResult => getRegionResult.Name)}-an";
        }),
        BucketNamespace = "account-regional",
    });

    var lambdaFileSystemBucketVersioning = new Aws.S3.BucketVersioning("lambda_file_system", new()
    {
        Bucket = lambdaFileSystem.BucketName,
        VersioningConfiguration = new Aws.S3.Inputs.BucketVersioningVersioningConfigurationArgs
        {
            Status = "Enabled",
        },
    });

    var forLambda = new Aws.S3.FilesFileSystem("for_lambda", new()
    {
        Bucket = lambdaFileSystem.Arn,
        RoleArn = s3files.Arn,
    }, new CustomResourceOptions
    {
        DependsOn =
        {
            lambdaFileSystemBucketVersioning,
        },
    });

    var forLambdaFilesAccessPoint = new Aws.S3.FilesAccessPoint("for_lambda", new()
    {
        FileSystemId = forLambda.Id,
        RootDirectories = new[]
        {
            new Aws.S3.Inputs.FilesAccessPointRootDirectoryArgs
            {
                Path = "/lambda",
                CreationPermissions = new[]
                {
                    new Aws.S3.Inputs.FilesAccessPointRootDirectoryCreationPermissionArgs
                    {
                        OwnerGid = 1000,
                        OwnerUid = 1000,
                        Permissions = "755",
                    },
                },
            },
        },
        PosixUsers = new[]
        {
            new Aws.S3.Inputs.FilesAccessPointPosixUserArgs
            {
                Gid = 1000,
                Uid = 1000,
            },
        },
    });

    var s3filesMountTargets = new Aws.Ec2.SecurityGroup("s3files_mount_targets", new()
    {
        Name = "example-s3files-mount-targets-sg",
        VpcId = vpcForLambda.Id,
    });

    var lambdaS3files = new Aws.Ec2.SecurityGroup("lambda_s3files", new()
    {
        Name = "example-lambda-s3files-sg",
        VpcId = vpcForLambda.Id,
    });

    var s3filesMountTargetsNfs = new Aws.Vpc.SecurityGroupIngressRule("s3files_mount_targets_nfs", new()
    {
        IpProtocol = "tcp",
        FromPort = 2049,
        ToPort = 2049,
        ReferencedSecurityGroupId = lambdaS3files.Id,
        SecurityGroupId = s3filesMountTargets.Id,
    });

    var lambdaS3filesNfs = new Aws.Vpc.SecurityGroupEgressRule("lambda_s3files_nfs", new()
    {
        IpProtocol = "tcp",
        SecurityGroupId = lambdaS3files.Id,
        FromPort = 2049,
        ToPort = 2049,
        ReferencedSecurityGroupId = s3filesMountTargets.Id,
    });

    var example = new Aws.Lambda.Function("example", new()
    {
        Code = new FileArchive("function.zip"),
        Name = "example_s3files_function",
        Role = iamForLambda.Arn,
        Handler = "exports.example",
        Runtime = Aws.Lambda.Runtime.NodeJS24dX,
        VpcConfig = new Aws.Lambda.Inputs.FunctionVpcConfigArgs
        {
            SubnetIds = new[]
            {
                subnetForLambdaAz1.Id,
            },
            SecurityGroupIds = new[]
            {
                lambdaS3files.Id,
            },
        },
        FileSystemConfig = new Aws.Lambda.Inputs.FunctionFileSystemConfigArgs
        {
            Arn = forLambdaFilesAccessPoint.Arn,
            LocalMountPath = "/mnt/s3files",
        },
    }, new CustomResourceOptions
    {
        DependsOn =
        {
            forLambdaAwsS3filesMountTarget,
        },
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.AwsFunctions;
import com.pulumi.aws.inputs.GetCallerIdentityArgs;
import com.pulumi.aws.inputs.GetRegionArgs;
import com.pulumi.aws.s3.Bucket;
import com.pulumi.aws.s3.BucketArgs;
import com.pulumi.aws.s3.BucketVersioning;
import com.pulumi.aws.s3.BucketVersioningArgs;
import com.pulumi.aws.s3.inputs.BucketVersioningVersioningConfigurationArgs;
import com.pulumi.aws.s3.FilesFileSystem;
import com.pulumi.aws.s3.FilesFileSystemArgs;
import com.pulumi.aws.s3.FilesAccessPoint;
import com.pulumi.aws.s3.FilesAccessPointArgs;
import com.pulumi.aws.s3.inputs.FilesAccessPointRootDirectoryArgs;
import com.pulumi.aws.s3.inputs.FilesAccessPointPosixUserArgs;
import com.pulumi.aws.ec2.SecurityGroup;
import com.pulumi.aws.ec2.SecurityGroupArgs;
import com.pulumi.aws.vpc.SecurityGroupIngressRule;
import com.pulumi.aws.vpc.SecurityGroupIngressRuleArgs;
import com.pulumi.aws.vpc.SecurityGroupEgressRule;
import com.pulumi.aws.vpc.SecurityGroupEgressRuleArgs;
import com.pulumi.aws.lambda.Function;
import com.pulumi.aws.lambda.FunctionArgs;
import com.pulumi.aws.lambda.inputs.FunctionVpcConfigArgs;
import com.pulumi.aws.lambda.inputs.FunctionFileSystemConfigArgs;
import com.pulumi.asset.FileArchive;
import com.pulumi.resources.CustomResourceOptions;
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
        final var current = AwsFunctions.getCallerIdentity(GetCallerIdentityArgs.builder()
            .build());

        final var currentGetRegion = AwsFunctions.getRegion(GetRegionArgs.builder()
            .build());

        var lambdaFileSystem = new Bucket("lambdaFileSystem", BucketArgs.builder()
            .bucket(String.format("example-%s-%s-an", current.accountId(),currentGetRegion.name()))
            .bucketNamespace("account-regional")
            .build());

        var lambdaFileSystemBucketVersioning = new BucketVersioning("lambdaFileSystemBucketVersioning", BucketVersioningArgs.builder()
            .bucket(lambdaFileSystem.bucket())
            .versioningConfiguration(BucketVersioningVersioningConfigurationArgs.builder()
                .status("Enabled")
                .build())
            .build());

        var forLambda = new FilesFileSystem("forLambda", FilesFileSystemArgs.builder()
            .bucket(lambdaFileSystem.arn())
            .roleArn(s3files.arn())
            .build(), CustomResourceOptions.builder()
                .dependsOn(lambdaFileSystemBucketVersioning)
                .build());

        var forLambdaFilesAccessPoint = new FilesAccessPoint("forLambdaFilesAccessPoint", FilesAccessPointArgs.builder()
            .fileSystemId(forLambda.id())
            .rootDirectories(FilesAccessPointRootDirectoryArgs.builder()
                .path("/lambda")
                .creationPermissions(FilesAccessPointRootDirectoryCreationPermissionArgs.builder()
                    .ownerGid(1000)
                    .ownerUid(1000)
                    .permissions("755")
                    .build())
                .build())
            .posixUsers(FilesAccessPointPosixUserArgs.builder()
                .gid(1000)
                .uid(1000)
                .build())
            .build());

        var s3filesMountTargets = new SecurityGroup("s3filesMountTargets", SecurityGroupArgs.builder()
            .name("example-s3files-mount-targets-sg")
            .vpcId(vpcForLambda.id())
            .build());

        var lambdaS3files = new SecurityGroup("lambdaS3files", SecurityGroupArgs.builder()
            .name("example-lambda-s3files-sg")
            .vpcId(vpcForLambda.id())
            .build());

        var s3filesMountTargetsNfs = new SecurityGroupIngressRule("s3filesMountTargetsNfs", SecurityGroupIngressRuleArgs.builder()
            .ipProtocol("tcp")
            .fromPort(2049)
            .toPort(2049)
            .referencedSecurityGroupId(lambdaS3files.id())
            .securityGroupId(s3filesMountTargets.id())
            .build());

        var lambdaS3filesNfs = new SecurityGroupEgressRule("lambdaS3filesNfs", SecurityGroupEgressRuleArgs.builder()
            .ipProtocol("tcp")
            .securityGroupId(lambdaS3files.id())
            .fromPort(2049)
            .toPort(2049)
            .referencedSecurityGroupId(s3filesMountTargets.id())
            .build());

        var example = new Function("example", FunctionArgs.builder()
            .code(new FileArchive("function.zip"))
            .name("example_s3files_function")
            .role(iamForLambda.arn())
            .handler("exports.example")
            .runtime("nodejs24.x")
            .vpcConfig(FunctionVpcConfigArgs.builder()
                .subnetIds(subnetForLambdaAz1.id())
                .securityGroupIds(lambdaS3files.id())
                .build())
            .fileSystemConfig(FunctionFileSystemConfigArgs.builder()
                .arn(forLambdaFilesAccessPoint.arn())
                .localMountPath("/mnt/s3files")
                .build())
            .build(), CustomResourceOptions.builder()
                .dependsOn(forLambdaAwsS3filesMountTarget)
                .build());

    }
}
```

```yaml
resources:
  lambdaFileSystem:
    type: aws:s3:Bucket
    name: lambda_file_system
    properties:
      bucket: example-${current.accountId}-${currentGetRegion.name}-an
      bucketNamespace: account-regional
  lambdaFileSystemBucketVersioning:
    type: aws:s3:BucketVersioning
    name: lambda_file_system
    properties:
      bucket: ${lambdaFileSystem.bucket}
      versioningConfiguration:
        status: Enabled
  forLambda:
    type: aws:s3:FilesFileSystem
    name: for_lambda
    properties:
      bucket: ${lambdaFileSystem.arn}
      roleArn: ${s3files.arn}
    options:
      dependsOn:
        - ${lambdaFileSystemBucketVersioning}
  forLambdaFilesAccessPoint:
    type: aws:s3:FilesAccessPoint
    name: for_lambda
    properties:
      fileSystemId: ${forLambda.id}
      rootDirectories:
        - path: /lambda
          creationPermissions:
            - ownerGid: 1000
              ownerUid: 1000
              permissions: '755'
      posixUsers:
        - gid: 1000
          uid: 1000
  s3filesMountTargets:
    type: aws:ec2:SecurityGroup
    name: s3files_mount_targets
    properties:
      name: example-s3files-mount-targets-sg
      vpcId: ${vpcForLambda.id}
  s3filesMountTargetsNfs:
    type: aws:vpc:SecurityGroupIngressRule
    name: s3files_mount_targets_nfs
    properties:
      ipProtocol: tcp
      fromPort: 2049
      toPort: 2049
      referencedSecurityGroupId: ${lambdaS3files.id}
      securityGroupId: ${s3filesMountTargets.id}
  lambdaS3files:
    type: aws:ec2:SecurityGroup
    name: lambda_s3files
    properties:
      name: example-lambda-s3files-sg
      vpcId: ${vpcForLambda.id}
  lambdaS3filesNfs:
    type: aws:vpc:SecurityGroupEgressRule
    name: lambda_s3files_nfs
    properties:
      ipProtocol: tcp
      securityGroupId: ${lambdaS3files.id}
      fromPort: 2049
      toPort: 2049
      referencedSecurityGroupId: ${s3filesMountTargets.id}
  example:
    type: aws:lambda:Function
    properties:
      code:
        fn::fileArchive: function.zip
      name: example_s3files_function
      role: ${iamForLambda.arn}
      handler: exports.example
      runtime: nodejs24.x
      vpcConfig:
        subnetIds:
          - ${subnetForLambdaAz1.id}
        securityGroupIds:
          - ${lambdaS3files.id}
      fileSystemConfig:
        arn: ${forLambdaFilesAccessPoint.arn}
        localMountPath: /mnt/s3files
    options:
      dependsOn:
        - ${forLambdaAwsS3filesMountTarget}
variables:
  current:
    fn::invoke:
      function: aws:getCallerIdentity
      arguments: {}
  currentGetRegion:
    fn::invoke:
      function: aws:getRegion
      arguments: {}
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

data "aws_getcalleridentity" "current" {
}
data "aws_getregion" "currentGetRegion" {
}

resource "aws_s3_bucket" "lambda_file_system" {
  bucket           ="example-${data.aws_getcalleridentity.current.account_id}-${data.aws_getregion.currentGetRegion.name}-an"
  bucket_namespace = "account-regional"
}
resource "aws_s3_bucketversioning" "lambda_file_system" {
  bucket = aws_s3_bucket.lambda_file_system.bucket
  versioning_configuration = {
    status = "Enabled"
  }
}
resource "aws_s3_filesfilesystem" "for_lambda" {
  depends_on = [aws_s3_bucketversioning.lambda_file_system]
  bucket     = aws_s3_bucket.lambda_file_system.arn
  role_arn   = s3files.arn
}
resource "aws_s3_filesaccesspoint" "for_lambda" {
  file_system_id = aws_s3_filesfilesystem.for_lambda.id
  root_directories {
    path = "/lambda"
    creation_permissions {
      owner_gid   = 1000
      owner_uid   = 1000
      permissions = "755"
    }
  }
  posix_users {
    gid = 1000
    uid = 1000
  }
}
resource "aws_ec2_securitygroup" "s3files_mount_targets" {
  name   = "example-s3files-mount-targets-sg"
  vpc_id = vpcForLambda.id
}
resource "aws_vpc_securitygroupingressrule" "s3files_mount_targets_nfs" {
  ip_protocol                  = "tcp"
  from_port                    = 2049
  to_port                      = 2049
  referenced_security_group_id = aws_ec2_securitygroup.lambda_s3files.id
  security_group_id            = aws_ec2_securitygroup.s3files_mount_targets.id
}
resource "aws_ec2_securitygroup" "lambda_s3files" {
  name   = "example-lambda-s3files-sg"
  vpc_id = vpcForLambda.id
}
resource "aws_vpc_securitygroupegressrule" "lambda_s3files_nfs" {
  ip_protocol                  = "tcp"
  security_group_id            = aws_ec2_securitygroup.lambda_s3files.id
  from_port                    = 2049
  to_port                      = 2049
  referenced_security_group_id = aws_ec2_securitygroup.s3files_mount_targets.id
}
resource "aws_lambda_function" "example" {
  depends_on = [forLambdaAwsS3filesMountTarget]
  code       = fileArchive("function.zip")
  name       = "example_s3files_function"
  role       = iamForLambda.arn
  handler    = "exports.example"
  runtime    = "nodejs24.x"
  vpc_config = {
    subnet_ids         = [subnetForLambdaAz1.id]
    security_group_ids = [aws_ec2_securitygroup.lambda_s3files.id]
  }
  file_system_config = {
    arn              = aws_s3_filesaccesspoint.for_lambda.arn
    local_mount_path = "/mnt/s3files"
  }
}
```

### Function with Advanced Logging[](#function-with-advanced-logging)

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const example = new aws.cloudwatch.LogGroup("example", {
    name: "/aws/lambda/example_function",
    retentionInDays: 14,
    tags: {
        Environment: "production",
        Application: "example",
    },
});
const exampleFunction = new aws.lambda.Function("example", {
    code: new pulumi.asset.FileArchive("function.zip"),
    name: "example_function",
    role: exampleAwsIamRole.arn,
    handler: "index.handler",
    runtime: aws.lambda.Runtime.NodeJS24dX,
    loggingConfig: {
        logFormat: "JSON",
        applicationLogLevel: "INFO",
        systemLogLevel: "WARN",
    },
}, {
    dependsOn: [example],
});
```

```python
import pulumi
import pulumi_aws as aws

example = aws.cloudwatch.LogGroup("example",
    name="/aws/lambda/example_function",
    retention_in_days=14,
    tags={
        "Environment": "production",
        "Application": "example",
    })
example_function = aws.lambda_.Function("example",
    code=pulumi.FileArchive("function.zip"),
    name="example_function",
    role=example_aws_iam_role["arn"],
    handler="index.handler",
    runtime=aws.lambda_.Runtime.NODE_JS24D_X,
    logging_config={
        "log_format": "JSON",
        "application_log_level": "INFO",
        "system_log_level": "WARN",
    },
    opts = pulumi.ResourceOptions(depends_on=[example]))
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/cloudwatch"
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/lambda"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		example, err := cloudwatch.NewLogGroup(ctx, "example", &cloudwatch.LogGroupArgs{
			Name:            pulumi.String("/aws/lambda/example_function"),
			RetentionInDays: pulumi.Int(14),
			Tags: pulumi.StringMap{
				"Environment": pulumi.String("production"),
				"Application": pulumi.String("example"),
			},
		})
		if err != nil {
			return err
		}
		_, err = lambda.NewFunction(ctx, "example", &lambda.FunctionArgs{
			Code:    pulumi.NewFileArchive("function.zip"),
			Name:    pulumi.String("example_function"),
			Role:    pulumi.Any(exampleAwsIamRole.Arn),
			Handler: pulumi.String("index.handler"),
			Runtime: pulumi.String(lambda.RuntimeNodeJS24dX),
			LoggingConfig: &lambda.FunctionLoggingConfigArgs{
				LogFormat:           pulumi.String("JSON"),
				ApplicationLogLevel: pulumi.String("INFO"),
				SystemLogLevel:      pulumi.String("WARN"),
			},
		}, pulumi.DependsOn([]pulumi.Resource{
			example,
		}))
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
    var example = new Aws.CloudWatch.LogGroup("example", new()
    {
        Name = "/aws/lambda/example_function",
        RetentionInDays = 14,
        Tags =
        {
            { "Environment", "production" },
            { "Application", "example" },
        },
    });

    var exampleFunction = new Aws.Lambda.Function("example", new()
    {
        Code = new FileArchive("function.zip"),
        Name = "example_function",
        Role = exampleAwsIamRole.Arn,
        Handler = "index.handler",
        Runtime = Aws.Lambda.Runtime.NodeJS24dX,
        LoggingConfig = new Aws.Lambda.Inputs.FunctionLoggingConfigArgs
        {
            LogFormat = "JSON",
            ApplicationLogLevel = "INFO",
            SystemLogLevel = "WARN",
        },
    }, new CustomResourceOptions
    {
        DependsOn =
        {
            example,
        },
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.cloudwatch.LogGroup;
import com.pulumi.aws.cloudwatch.LogGroupArgs;
import com.pulumi.aws.lambda.Function;
import com.pulumi.aws.lambda.FunctionArgs;
import com.pulumi.aws.lambda.inputs.FunctionLoggingConfigArgs;
import com.pulumi.asset.FileArchive;
import com.pulumi.resources.CustomResourceOptions;
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
        var example = new LogGroup("example", LogGroupArgs.builder()
            .name("/aws/lambda/example_function")
            .retentionInDays(14)
            .tags(Map.ofEntries(
                Map.entry("Environment", "production"),
                Map.entry("Application", "example")
            ))
            .build());

        var exampleFunction = new Function("exampleFunction", FunctionArgs.builder()
            .code(new FileArchive("function.zip"))
            .name("example_function")
            .role(exampleAwsIamRole.arn())
            .handler("index.handler")
            .runtime("nodejs24.x")
            .loggingConfig(FunctionLoggingConfigArgs.builder()
                .logFormat("JSON")
                .applicationLogLevel("INFO")
                .systemLogLevel("WARN")
                .build())
            .build(), CustomResourceOptions.builder()
                .dependsOn(example)
                .build());

    }
}
```

```yaml
resources:
  example:
    type: aws:cloudwatch:LogGroup
    properties:
      name: /aws/lambda/example_function
      retentionInDays: 14
      tags:
        Environment: production
        Application: example
  exampleFunction:
    type: aws:lambda:Function
    name: example
    properties:
      code:
        fn::fileArchive: function.zip
      name: example_function
      role: ${exampleAwsIamRole.arn}
      handler: index.handler
      runtime: nodejs24.x
      loggingConfig:
        logFormat: JSON
        applicationLogLevel: INFO
        systemLogLevel: WARN
    options:
      dependsOn:
        - ${example}
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_cloudwatch_loggroup" "example" {
  name              = "/aws/lambda/example_function"
  retention_in_days = 14
  tags = {
    "Environment" = "production"
    "Application" = "example"
  }
}
resource "aws_lambda_function" "example" {
  depends_on = [aws_cloudwatch_loggroup.example]
  code       = fileArchive("function.zip")
  name       = "example_function"
  role       = exampleAwsIamRole.arn
  handler    = "index.handler"
  runtime    = "nodejs24.x"
  logging_config = {
    log_format            = "JSON"
    application_log_level = "INFO"
    system_log_level      = "WARN"
  }
}
```

### Function with logging to S3 or Data Firehose[](#function-with-logging-to-s3-or-data-firehose)

#### Required Resources[](#required-resources)

-   An S3 bucket or Data Firehose delivery stream to store the logs.

-   A CloudWatch Log Group with:

    -   `logGroupClass = "DELIVERY"`
    -   A subscription filter whose `destinationArn` points to the S3 bucket or the Data Firehose delivery stream.
-   IAM roles:

    -   Assumed by the `logs.amazonaws.com` service to deliver logs to the S3 bucket or Data Firehose delivery stream.
    -   Assumed by the `lambda.amazonaws.com` service to send logs to CloudWatch Logs
-   A Lambda function:

    -   In the `loggingConfiguration`, specify the name of the Log Group created above using the `logGroup` field
    -   No special configuration is required to use S3 or Firehose as the log destination

For more details, see [Sending Lambda function logs to Amazon S3](https://docs.aws.amazon.com/lambda/latest/dg/logging-with-s3.html).

### Example: Exporting Lambda Logs to S3 Bucket[](#example-exporting-lambda-logs-to-s3-bucket)

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const lambdaFunctionName = "lambda-log-export-example";
const lambdaLogExportBucket = new aws.s3.Bucket("lambda_log_export", {bucket: `${lambdaFunctionName}-bucket`});
const _export = new aws.cloudwatch.LogGroup("export", {
    name: `/aws/lambda/${lambdaFunctionName}`,
    logGroupClass: "DELIVERY",
});
const logsAssumeRole = aws.iam.getPolicyDocument({
    statements: [{
        actions: ["sts:AssumeRole"],
        effect: "Allow",
        principals: [{
            type: "Service",
            identifiers: ["logs.amazonaws.com"],
        }],
    }],
});
const logsLogExport = new aws.iam.Role("logs_log_export", {
    name: `${lambdaFunctionName}-lambda-log-export-role`,
    assumeRolePolicy: logsAssumeRole.then(logsAssumeRole => logsAssumeRole.json),
});
const lambdaLogExport = aws.iam.getPolicyDocumentOutput({
    statements: [{
        actions: ["s3:PutObject"],
        effect: "Allow",
        resources: [pulumi.interpolate`${lambdaLogExportBucket.arn}/*`],
    }],
});
const lambdaLogExportRolePolicy = new aws.iam.RolePolicy("lambda_log_export", {
    policy: lambdaLogExport.apply(lambdaLogExport => lambdaLogExport.json),
    role: logsLogExport.name,
});
const lambdaLogExportLogSubscriptionFilter = new aws.cloudwatch.LogSubscriptionFilter("lambda_log_export", {
    name: `${lambdaFunctionName}-filter`,
    logGroup: _export.name,
    filterPattern: "",
    destinationArn: lambdaLogExportBucket.arn,
    roleArn: logsLogExport.arn,
});
const logExport = new aws.lambda.Function("log_export", {
    name: lambdaFunctionName,
    handler: "index.lambda_handler",
    runtime: aws.lambda.Runtime.Python3d13,
    role: example.arn,
    code: new pulumi.asset.FileArchive("function.zip"),
    loggingConfig: {
        logFormat: "Text",
        logGroup: _export.name,
    },
}, {
    dependsOn: [_export],
});
```

```python
import pulumi
import pulumi_aws as aws

lambda_function_name = "lambda-log-export-example"
lambda_log_export_bucket = aws.s3.Bucket("lambda_log_export", bucket=f"{lambda_function_name}-bucket")
export = aws.cloudwatch.LogGroup("export",
    name=f"/aws/lambda/{lambda_function_name}",
    log_group_class="DELIVERY")
logs_assume_role = aws.iam.get_policy_document(statements=[{
    "actions": ["sts:AssumeRole"],
    "effect": "Allow",
    "principals": [{
        "type": "Service",
        "identifiers": ["logs.amazonaws.com"],
    }],
}])
logs_log_export = aws.iam.Role("logs_log_export",
    name=f"{lambda_function_name}-lambda-log-export-role",
    assume_role_policy=logs_assume_role.json)
lambda_log_export = aws.iam.get_policy_document_output(statements=[{
    "actions": ["s3:PutObject"],
    "effect": "Allow",
    "resources": [lambda_log_export_bucket.arn.apply(lambda arn: f"{arn}/*")],
}])
lambda_log_export_role_policy = aws.iam.RolePolicy("lambda_log_export",
    policy=lambda_log_export.json,
    role=logs_log_export.name)
lambda_log_export_log_subscription_filter = aws.cloudwatch.LogSubscriptionFilter("lambda_log_export",
    name=f"{lambda_function_name}-filter",
    log_group=export.name,
    filter_pattern="",
    destination_arn=lambda_log_export_bucket.arn,
    role_arn=logs_log_export.arn)
log_export = aws.lambda_.Function("log_export",
    name=lambda_function_name,
    handler="index.lambda_handler",
    runtime=aws.lambda_.Runtime.PYTHON3D13,
    role=example["arn"],
    code=pulumi.FileArchive("function.zip"),
    logging_config={
        "log_format": "Text",
        "log_group": export.name,
    },
    opts = pulumi.ResourceOptions(depends_on=[export]))
```

```go
package main

import (
	"fmt"

	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/cloudwatch"
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/iam"
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/lambda"
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/s3"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		lambdaFunctionName := "lambda-log-export-example"
		lambdaLogExportBucket, err := s3.NewBucket(ctx, "lambda_log_export", &s3.BucketArgs{
			Bucket: pulumi.Sprintf("%v-bucket", lambdaFunctionName),
		})
		if err != nil {
			return err
		}
		export, err := cloudwatch.NewLogGroup(ctx, "export", &cloudwatch.LogGroupArgs{
			Name:          pulumi.Sprintf("/aws/lambda/%v", lambdaFunctionName),
			LogGroupClass: pulumi.String("DELIVERY"),
		})
		if err != nil {
			return err
		}
		logsAssumeRole, err := iam.GetPolicyDocument(ctx, &iam.GetPolicyDocumentArgs{
			Statements: []iam.GetPolicyDocumentStatement{
				{
					Actions: []string{
						"sts:AssumeRole",
					},
					Effect: pulumi.StringRef("Allow"),
					Principals: []iam.GetPolicyDocumentStatementPrincipal{
						{
							Type: "Service",
							Identifiers: []string{
								"logs.amazonaws.com",
							},
						},
					},
				},
			},
		}, nil)
		if err != nil {
			return err
		}
		logsLogExport, err := iam.NewRole(ctx, "logs_log_export", &iam.RoleArgs{
			Name:             pulumi.Sprintf("%v-lambda-log-export-role", lambdaFunctionName),
			AssumeRolePolicy: pulumi.String(pulumi.String(logsAssumeRole.Json)),
		})
		if err != nil {
			return err
		}
		lambdaLogExport := iam.GetPolicyDocumentOutput(ctx, iam.GetPolicyDocumentOutputArgs{
			Statements: iam.GetPolicyDocumentStatementArray{
				&iam.GetPolicyDocumentStatementArgs{
					Actions: pulumi.StringArray{
						pulumi.String("s3:PutObject"),
					},
					Effect: pulumi.String("Allow"),
					Resources: pulumi.StringArray{
						lambdaLogExportBucket.Arn.ApplyT(func(arn string) (string, error) {
							return fmt.Sprintf("%v/*", arn), nil
						}).(pulumi.StringOutput),
					},
				},
			},
		}, nil)
		_, err = iam.NewRolePolicy(ctx, "lambda_log_export", &iam.RolePolicyArgs{
			Policy: pulumi.String(lambdaLogExport.ApplyT(func(lambdaLogExport iam.GetPolicyDocumentResult) (*string, error) {
				return &lambdaLogExport.Json, nil
			}).(pulumi.StringPtrOutput)),
			Role: logsLogExport.Name,
		})
		if err != nil {
			return err
		}
		_, err = cloudwatch.NewLogSubscriptionFilter(ctx, "lambda_log_export", &cloudwatch.LogSubscriptionFilterArgs{
			Name:           pulumi.Sprintf("%v-filter", lambdaFunctionName),
			LogGroup:       export.Name,
			FilterPattern:  pulumi.String(""),
			DestinationArn: lambdaLogExportBucket.Arn,
			RoleArn:        logsLogExport.Arn,
		})
		if err != nil {
			return err
		}
		_, err = lambda.NewFunction(ctx, "log_export", &lambda.FunctionArgs{
			Name:    pulumi.String(pulumi.String(lambdaFunctionName)),
			Handler: pulumi.String("index.lambda_handler"),
			Runtime: pulumi.String(lambda.RuntimePython3d13),
			Role:    pulumi.Any(example.Arn),
			Code:    pulumi.NewFileArchive("function.zip"),
			LoggingConfig: &lambda.FunctionLoggingConfigArgs{
				LogFormat: pulumi.String("Text"),
				LogGroup:  export.Name,
			},
		}, pulumi.DependsOn([]pulumi.Resource{
			export,
		}))
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
    var lambdaFunctionName = "lambda-log-export-example";

    var lambdaLogExportBucket = new Aws.S3.Bucket("lambda_log_export", new()
    {
        BucketName = $"{lambdaFunctionName}-bucket",
    });

    var export = new Aws.CloudWatch.LogGroup("export", new()
    {
        Name = $"/aws/lambda/{lambdaFunctionName}",
        LogGroupClass = "DELIVERY",
    });

    var logsAssumeRole = Aws.Iam.GetPolicyDocument.Invoke(new()
    {
        Statements = new[]
        {
            new Aws.Iam.Inputs.GetPolicyDocumentStatementInputArgs
            {
                Actions = new[]
                {
                    "sts:AssumeRole",
                },
                Effect = "Allow",
                Principals = new[]
                {
                    new Aws.Iam.Inputs.GetPolicyDocumentStatementPrincipalInputArgs
                    {
                        Type = "Service",
                        Identifiers = new[]
                        {
                            "logs.amazonaws.com",
                        },
                    },
                },
            },
        },
    });

    var logsLogExport = new Aws.Iam.Role("logs_log_export", new()
    {
        Name = $"{lambdaFunctionName}-lambda-log-export-role",
        AssumeRolePolicy = logsAssumeRole.Apply(getPolicyDocumentResult => getPolicyDocumentResult.Json),
    });

    var lambdaLogExport = Aws.Iam.GetPolicyDocument.Invoke(new()
    {
        Statements = new[]
        {
            new Aws.Iam.Inputs.GetPolicyDocumentStatementInputArgs
            {
                Actions = new[]
                {
                    "s3:PutObject",
                },
                Effect = "Allow",
                Resources = new[]
                {
                    $"{lambdaLogExportBucket.Arn}/*",
                },
            },
        },
    });

    var lambdaLogExportRolePolicy = new Aws.Iam.RolePolicy("lambda_log_export", new()
    {
        Policy = lambdaLogExport.Apply(getPolicyDocumentResult => getPolicyDocumentResult.Json),
        Role = logsLogExport.Name,
    });

    var lambdaLogExportLogSubscriptionFilter = new Aws.CloudWatch.LogSubscriptionFilter("lambda_log_export", new()
    {
        Name = $"{lambdaFunctionName}-filter",
        LogGroup = export.Name,
        FilterPattern = "",
        DestinationArn = lambdaLogExportBucket.Arn,
        RoleArn = logsLogExport.Arn,
    });

    var logExport = new Aws.Lambda.Function("log_export", new()
    {
        Name = lambdaFunctionName,
        Handler = "index.lambda_handler",
        Runtime = Aws.Lambda.Runtime.Python3d13,
        Role = example.Arn,
        Code = new FileArchive("function.zip"),
        LoggingConfig = new Aws.Lambda.Inputs.FunctionLoggingConfigArgs
        {
            LogFormat = "Text",
            LogGroup = export.Name,
        },
    }, new CustomResourceOptions
    {
        DependsOn =
        {
            export,
        },
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.s3.Bucket;
import com.pulumi.aws.s3.BucketArgs;
import com.pulumi.aws.cloudwatch.LogGroup;
import com.pulumi.aws.cloudwatch.LogGroupArgs;
import com.pulumi.aws.iam.IamFunctions;
import com.pulumi.aws.iam.inputs.GetPolicyDocumentArgs;
import com.pulumi.aws.iam.Role;
import com.pulumi.aws.iam.RoleArgs;
import com.pulumi.aws.iam.RolePolicy;
import com.pulumi.aws.iam.RolePolicyArgs;
import com.pulumi.aws.cloudwatch.LogSubscriptionFilter;
import com.pulumi.aws.cloudwatch.LogSubscriptionFilterArgs;
import com.pulumi.aws.lambda.Function;
import com.pulumi.aws.lambda.FunctionArgs;
import com.pulumi.aws.lambda.inputs.FunctionLoggingConfigArgs;
import com.pulumi.asset.FileArchive;
import com.pulumi.resources.CustomResourceOptions;
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
        final var lambdaFunctionName = "lambda-log-export-example";

        var lambdaLogExportBucket = new Bucket("lambdaLogExportBucket", BucketArgs.builder()
            .bucket(String.format("%s-bucket", lambdaFunctionName))
            .build());

        var export = new LogGroup("export", LogGroupArgs.builder()
            .name(String.format("/aws/lambda/%s", lambdaFunctionName))
            .logGroupClass("DELIVERY")
            .build());

        final var logsAssumeRole = IamFunctions.getPolicyDocument(GetPolicyDocumentArgs.builder()
            .statements(GetPolicyDocumentStatementArgs.builder()
                .actions("sts:AssumeRole")
                .effect("Allow")
                .principals(GetPolicyDocumentStatementPrincipalArgs.builder()
                    .type("Service")
                    .identifiers("logs.amazonaws.com")
                    .build())
                .build())
            .build());

        var logsLogExport = new Role("logsLogExport", RoleArgs.builder()
            .name(String.format("%s-lambda-log-export-role", lambdaFunctionName))
            .assumeRolePolicy(logsAssumeRole.json())
            .build());

        final var lambdaLogExport = IamFunctions.getPolicyDocument(GetPolicyDocumentArgs.builder()
            .statements(GetPolicyDocumentStatementArgs.builder()
                .actions("s3:PutObject")
                .effect("Allow")
                .resources(lambdaLogExportBucket.arn().applyValue(_arn -> String.format("%s/*", _arn)))
                .build())
            .build());

        var lambdaLogExportRolePolicy = new RolePolicy("lambdaLogExportRolePolicy", RolePolicyArgs.builder()
            .policy(lambdaLogExport.applyValue(_lambdaLogExport -> _lambdaLogExport.json()))
            .role(logsLogExport.name())
            .build());

        var lambdaLogExportLogSubscriptionFilter = new LogSubscriptionFilter("lambdaLogExportLogSubscriptionFilter", LogSubscriptionFilterArgs.builder()
            .name(String.format("%s-filter", lambdaFunctionName))
            .logGroup(export.name())
            .filterPattern("")
            .destinationArn(lambdaLogExportBucket.arn())
            .roleArn(logsLogExport.arn())
            .build());

        var logExport = new Function("logExport", FunctionArgs.builder()
            .name(lambdaFunctionName)
            .handler("index.lambda_handler")
            .runtime("python3.13")
            .role(example.arn())
            .code(new FileArchive("function.zip"))
            .loggingConfig(FunctionLoggingConfigArgs.builder()
                .logFormat("Text")
                .logGroup(export.name())
                .build())
            .build(), CustomResourceOptions.builder()
                .dependsOn(export)
                .build());

    }
}
```

```yaml
resources:
  lambdaLogExportBucket:
    type: aws:s3:Bucket
    name: lambda_log_export
    properties:
      bucket: ${lambdaFunctionName}-bucket
  export:
    type: aws:cloudwatch:LogGroup
    properties:
      name: /aws/lambda/${lambdaFunctionName}
      logGroupClass: DELIVERY
  logsLogExport:
    type: aws:iam:Role
    name: logs_log_export
    properties:
      name: ${lambdaFunctionName}-lambda-log-export-role
      assumeRolePolicy: ${logsAssumeRole.json}
  lambdaLogExportRolePolicy:
    type: aws:iam:RolePolicy
    name: lambda_log_export
    properties:
      policy: ${lambdaLogExport.json}
      role: ${logsLogExport.name}
  lambdaLogExportLogSubscriptionFilter:
    type: aws:cloudwatch:LogSubscriptionFilter
    name: lambda_log_export
    properties:
      name: ${lambdaFunctionName}-filter
      logGroup: ${export.name}
      filterPattern: ""
      destinationArn: ${lambdaLogExportBucket.arn}
      roleArn: ${logsLogExport.arn}
  logExport:
    type: aws:lambda:Function
    name: log_export
    properties:
      name: ${lambdaFunctionName}
      handler: index.lambda_handler
      runtime: python3.13
      role: ${example.arn}
      code:
        fn::fileArchive: function.zip
      loggingConfig:
        logFormat: Text
        logGroup: ${export.name}
    options:
      dependsOn:
        - ${export}
variables:
  lambdaFunctionName: lambda-log-export-example
  logsAssumeRole:
    fn::invoke:
      function: aws:iam:getPolicyDocument
      arguments:
        statements:
          - actions:
              - sts:AssumeRole
            effect: Allow
            principals:
              - type: Service
                identifiers:
                  - logs.amazonaws.com
  lambdaLogExport:
    fn::invoke:
      function: aws:iam:getPolicyDocument
      arguments:
        statements:
          - actions:
              - s3:PutObject
            effect: Allow
            resources:
              - ${lambdaLogExportBucket.arn}/*
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

data "aws_iam_getpolicydocument" "logsAssumeRole" {
  statements {
    actions = ["sts:AssumeRole"]
    effect  = "Allow"
    principals {
      type        = "Service"
      identifiers = ["logs.amazonaws.com"]
    }
  }
}
data "aws_iam_getpolicydocument" "lambdaLogExport" {
  statements {
    actions   = ["s3:PutObject"]
    effect    = "Allow"
    resources = ["${aws_s3_bucket.lambda_log_export.arn}/*"]
  }
}

resource "aws_s3_bucket" "lambda_log_export" {
  bucket ="${local.lambdaFunctionName}-bucket"
}
resource "aws_cloudwatch_loggroup" "export" {
  name            ="/aws/lambda/${local.lambdaFunctionName}"
  log_group_class = "DELIVERY"
}
resource "aws_iam_role" "logs_log_export" {
  name               ="${local.lambdaFunctionName}-lambda-log-export-role"
  assume_role_policy = data.aws_iam_getpolicydocument.logsAssumeRole.json
}
resource "aws_iam_rolepolicy" "lambda_log_export" {
  policy = data.aws_iam_getpolicydocument.lambdaLogExport.json
  role   = aws_iam_role.logs_log_export.name
}
resource "aws_cloudwatch_logsubscriptionfilter" "lambda_log_export" {
  name            ="${local.lambdaFunctionName}-filter"
  log_group       = aws_cloudwatch_loggroup.export.name
  filter_pattern  = ""
  destination_arn = aws_s3_bucket.lambda_log_export.arn
  role_arn        = aws_iam_role.logs_log_export.arn
}
resource "aws_lambda_function" "log_export" {
  depends_on = [aws_cloudwatch_loggroup.export]
  name       = local.lambdaFunctionName
  handler    = "index.lambda_handler"
  runtime    = "python3.13"
  role       = example.arn
  code       = fileArchive("function.zip")
  logging_config = {
    log_format = "Text"
    log_group  = aws_cloudwatch_loggroup.export.name
  }
}
locals {
  lambdaFunctionName = "lambda-log-export-example"
}
```

### Function with Error Handling[](#function-with-error-handling)

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

// Main Lambda function
const example = new aws.lambda.Function("example", {
    code: new pulumi.asset.FileArchive("function.zip"),
    name: "example_function",
    role: exampleAwsIamRole.arn,
    handler: "index.handler",
    runtime: aws.lambda.Runtime.NodeJS24dX,
    deadLetterConfig: {
        targetArn: dlq.arn,
    },
});
// Event invoke configuration for retries
const exampleFunctionEventInvokeConfig = new aws.lambda.FunctionEventInvokeConfig("example", {
    functionName: example.name,
    maximumEventAgeInSeconds: 60,
    maximumRetryAttempts: 2,
    destinationConfig: {
        onFailure: {
            destination: dlq.arn,
        },
        onSuccess: {
            destination: success.arn,
        },
    },
});
```

```python
import pulumi
import pulumi_aws as aws

# Main Lambda function
example = aws.lambda_.Function("example",
    code=pulumi.FileArchive("function.zip"),
    name="example_function",
    role=example_aws_iam_role["arn"],
    handler="index.handler",
    runtime=aws.lambda_.Runtime.NODE_JS24D_X,
    dead_letter_config={
        "target_arn": dlq["arn"],
    })

# Event invoke configuration for retries
example_function_event_invoke_config = aws.lambda_.FunctionEventInvokeConfig("example",
    function_name=example.name,
    maximum_event_age_in_seconds=60,
    maximum_retry_attempts=2,
    destination_config={
        "on_failure": {
            "destination": dlq["arn"],
        },
        "on_success": {
            "destination": success["arn"],
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
		// Main Lambda function
		example, err := lambda.NewFunction(ctx, "example", &lambda.FunctionArgs{
			Code:    pulumi.NewFileArchive("function.zip"),
			Name:    pulumi.String("example_function"),
			Role:    pulumi.Any(exampleAwsIamRole.Arn),
			Handler: pulumi.String("index.handler"),
			Runtime: pulumi.String(lambda.RuntimeNodeJS24dX),
			DeadLetterConfig: &lambda.FunctionDeadLetterConfigArgs{
				TargetArn: pulumi.Any(dlq.Arn),
			},
		})
		if err != nil {
			return err
		}
		// Event invoke configuration for retries
		_, err = lambda.NewFunctionEventInvokeConfig(ctx, "example", &lambda.FunctionEventInvokeConfigArgs{
			FunctionName:             example.Name,
			MaximumEventAgeInSeconds: pulumi.Int(60),
			MaximumRetryAttempts:     pulumi.Int(2),
			DestinationConfig: &lambda.FunctionEventInvokeConfigDestinationConfigArgs{
				OnFailure: &lambda.FunctionEventInvokeConfigDestinationConfigOnFailureArgs{
					Destination: pulumi.Any(dlq.Arn),
				},
				OnSuccess: &lambda.FunctionEventInvokeConfigDestinationConfigOnSuccessArgs{
					Destination: pulumi.Any(success.Arn),
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
    // Main Lambda function
    var example = new Aws.Lambda.Function("example", new()
    {
        Code = new FileArchive("function.zip"),
        Name = "example_function",
        Role = exampleAwsIamRole.Arn,
        Handler = "index.handler",
        Runtime = Aws.Lambda.Runtime.NodeJS24dX,
        DeadLetterConfig = new Aws.Lambda.Inputs.FunctionDeadLetterConfigArgs
        {
            TargetArn = dlq.Arn,
        },
    });

    // Event invoke configuration for retries
    var exampleFunctionEventInvokeConfig = new Aws.Lambda.FunctionEventInvokeConfig("example", new()
    {
        FunctionName = example.Name,
        MaximumEventAgeInSeconds = 60,
        MaximumRetryAttempts = 2,
        DestinationConfig = new Aws.Lambda.Inputs.FunctionEventInvokeConfigDestinationConfigArgs
        {
            OnFailure = new Aws.Lambda.Inputs.FunctionEventInvokeConfigDestinationConfigOnFailureArgs
            {
                Destination = dlq.Arn,
            },
            OnSuccess = new Aws.Lambda.Inputs.FunctionEventInvokeConfigDestinationConfigOnSuccessArgs
            {
                Destination = success.Arn,
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
import com.pulumi.aws.lambda.Function;
import com.pulumi.aws.lambda.FunctionArgs;
import com.pulumi.aws.lambda.inputs.FunctionDeadLetterConfigArgs;
import com.pulumi.aws.lambda.FunctionEventInvokeConfig;
import com.pulumi.aws.lambda.FunctionEventInvokeConfigArgs;
import com.pulumi.aws.lambda.inputs.FunctionEventInvokeConfigDestinationConfigArgs;
import com.pulumi.aws.lambda.inputs.FunctionEventInvokeConfigDestinationConfigOnFailureArgs;
import com.pulumi.aws.lambda.inputs.FunctionEventInvokeConfigDestinationConfigOnSuccessArgs;
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
        // Main Lambda function
        var example = new Function("example", FunctionArgs.builder()
            .code(new FileArchive("function.zip"))
            .name("example_function")
            .role(exampleAwsIamRole.arn())
            .handler("index.handler")
            .runtime("nodejs24.x")
            .deadLetterConfig(FunctionDeadLetterConfigArgs.builder()
                .targetArn(dlq.arn())
                .build())
            .build());

        // Event invoke configuration for retries
        var exampleFunctionEventInvokeConfig = new FunctionEventInvokeConfig("exampleFunctionEventInvokeConfig", FunctionEventInvokeConfigArgs.builder()
            .functionName(example.name())
            .maximumEventAgeInSeconds(60)
            .maximumRetryAttempts(2)
            .destinationConfig(FunctionEventInvokeConfigDestinationConfigArgs.builder()
                .onFailure(FunctionEventInvokeConfigDestinationConfigOnFailureArgs.builder()
                    .destination(dlq.arn())
                    .build())
                .onSuccess(FunctionEventInvokeConfigDestinationConfigOnSuccessArgs.builder()
                    .destination(success.arn())
                    .build())
                .build())
            .build());

    }
}
```

```yaml
resources:
  # Main Lambda function
  example:
    type: aws:lambda:Function
    properties:
      code:
        fn::fileArchive: function.zip
      name: example_function
      role: ${exampleAwsIamRole.arn}
      handler: index.handler
      runtime: nodejs24.x
      deadLetterConfig:
        targetArn: ${dlq.arn}
  # Event invoke configuration for retries
  exampleFunctionEventInvokeConfig:
    type: aws:lambda:FunctionEventInvokeConfig
    name: example
    properties:
      functionName: ${example.name}
      maximumEventAgeInSeconds: 60
      maximumRetryAttempts: 2
      destinationConfig:
        onFailure:
          destination: ${dlq.arn}
        onSuccess:
          destination: ${success.arn}
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

# Main Lambda function
resource "aws_lambda_function" "example" {
  code    = fileArchive("function.zip")
  name    = "example_function"
  role    = exampleAwsIamRole.arn
  handler = "index.handler"
  runtime = "nodejs24.x"
  dead_letter_config = {
    target_arn = dlq.arn
  }
}

# Event invoke configuration for retries
resource "aws_lambda_functioneventinvokeconfig" "example" {
  function_name                = aws_lambda_function.example.name
  maximum_event_age_in_seconds = 60
  maximum_retry_attempts       = 2
  destination_config = {
    on_failure = {
      destination = dlq.arn
    }
    on_success = {
      destination = success.arn
    }
  }
}
```

### CloudWatch Logging and Permissions[](#cloudwatch-logging-and-permissions)

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const config = new pulumi.Config();
// Name of the Lambda function
const functionName = config.get("functionName") || "example_function";
// CloudWatch Log Group with retention
const example = new aws.cloudwatch.LogGroup("example", {
    name: `/aws/lambda/${functionName}`,
    retentionInDays: 14,
    tags: {
        Environment: "production",
        Function: functionName,
    },
});
// Lambda execution role
const exampleRole = new aws.iam.Role("example", {
    name: "lambda_execution_role",
    assumeRolePolicy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [{
            Action: "sts:AssumeRole",
            Effect: "Allow",
            Principal: {
                Service: "lambda.amazonaws.com",
            },
        }],
    }),
});
// CloudWatch Logs policy
const lambdaLogging = new aws.iam.Policy("lambda_logging", {
    name: "lambda_logging",
    path: "/",
    description: "IAM policy for logging from Lambda",
    policy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [{
            Effect: "Allow",
            Action: [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents",
            ],
            Resource: ["arn:aws:logs:*:*:*"],
        }],
    }),
});
// Attach logging policy to Lambda role
const lambdaLogs = new aws.iam.RolePolicyAttachment("lambda_logs", {
    role: exampleRole.name,
    policyArn: lambdaLogging.arn,
});
// Lambda function with logging
const exampleFunction = new aws.lambda.Function("example", {
    code: new pulumi.asset.FileArchive("function.zip"),
    name: functionName,
    role: exampleRole.arn,
    handler: "index.handler",
    runtime: aws.lambda.Runtime.NodeJS24dX,
    loggingConfig: {
        logFormat: "JSON",
        applicationLogLevel: "INFO",
        systemLogLevel: "WARN",
    },
}, {
    dependsOn: [
        lambdaLogs,
        example,
    ],
});
```

```python
import pulumi
import json
import pulumi_aws as aws

config = pulumi.Config()

# Name of the Lambda function
function_name = config.get("functionName")
if function_name is None:
    function_name = "example_function"

# CloudWatch Log Group with retention
example = aws.cloudwatch.LogGroup("example",
    name=f"/aws/lambda/{function_name}",
    retention_in_days=14,
    tags={
        "Environment": "production",
        "Function": function_name,
    })

# Lambda execution role
example_role = aws.iam.Role("example",
    name="lambda_execution_role",
    assume_role_policy=json.dumps({
        "Version": "2012-10-17",
        "Statement": [{
            "Action": "sts:AssumeRole",
            "Effect": "Allow",
            "Principal": {
                "Service": "lambda.amazonaws.com",
            },
        }],
    }))

# CloudWatch Logs policy
lambda_logging = aws.iam.Policy("lambda_logging",
    name="lambda_logging",
    path="/",
    description="IAM policy for logging from Lambda",
    policy=json.dumps({
        "Version": "2012-10-17",
        "Statement": [{
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents",
            ],
            "Resource": ["arn:aws:logs:*:*:*"],
        }],
    }))

# Attach logging policy to Lambda role
lambda_logs = aws.iam.RolePolicyAttachment("lambda_logs",
    role=example_role.name,
    policy_arn=lambda_logging.arn)

# Lambda function with logging
example_function = aws.lambda_.Function("example",
    code=pulumi.FileArchive("function.zip"),
    name=function_name,
    role=example_role.arn,
    handler="index.handler",
    runtime=aws.lambda_.Runtime.NODE_JS24D_X,
    logging_config={
        "log_format": "JSON",
        "application_log_level": "INFO",
        "system_log_level": "WARN",
    },
    opts = pulumi.ResourceOptions(depends_on=[
            lambda_logs,
            example,
        ]))
```

```go
package main

import (
	"encoding/json"

	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/cloudwatch"
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/iam"
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/lambda"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi/config"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		cfg := config.New(ctx, "")
		// Name of the Lambda function
		functionName := "example_function"
		if param := cfg.Get("functionName"); param != "" {
			functionName = param
		}
		// CloudWatch Log Group with retention
		example, err := cloudwatch.NewLogGroup(ctx, "example", &cloudwatch.LogGroupArgs{
			Name:            pulumi.Sprintf("/aws/lambda/%v", functionName),
			RetentionInDays: pulumi.Int(14),
			Tags: pulumi.StringMap{
				"Environment": pulumi.String("production"),
				"Function":    pulumi.String(pulumi.String(functionName)),
			},
		})
		if err != nil {
			return err
		}
		tmpJSON0, err := json.Marshal(map[string]interface{}{
			"Version": "2012-10-17",
			"Statement": []map[string]interface{}{
				map[string]interface{}{
					"Action": "sts:AssumeRole",
					"Effect": "Allow",
					"Principal": map[string]interface{}{
						"Service": "lambda.amazonaws.com",
					},
				},
			},
		})
		if err != nil {
			return err
		}
		json0 := string(tmpJSON0)
		// Lambda execution role
		exampleRole, err := iam.NewRole(ctx, "example", &iam.RoleArgs{
			Name:             pulumi.String("lambda_execution_role"),
			AssumeRolePolicy: pulumi.String(pulumi.String(json0)),
		})
		if err != nil {
			return err
		}
		tmpJSON1, err := json.Marshal(map[string]interface{}{
			"Version": "2012-10-17",
			"Statement": []map[string]interface{}{
				map[string]interface{}{
					"Effect": "Allow",
					"Action": []string{
						"logs:CreateLogGroup",
						"logs:CreateLogStream",
						"logs:PutLogEvents",
					},
					"Resource": []string{
						"arn:aws:logs:*:*:*",
					},
				},
			},
		})
		if err != nil {
			return err
		}
		json1 := string(tmpJSON1)
		// CloudWatch Logs policy
		lambdaLogging, err := iam.NewPolicy(ctx, "lambda_logging", &iam.PolicyArgs{
			Name:        pulumi.String("lambda_logging"),
			Path:        pulumi.String("/"),
			Description: pulumi.String("IAM policy for logging from Lambda"),
			Policy:      pulumi.String(pulumi.String(json1)),
		})
		if err != nil {
			return err
		}
		// Attach logging policy to Lambda role
		lambdaLogs, err := iam.NewRolePolicyAttachment(ctx, "lambda_logs", &iam.RolePolicyAttachmentArgs{
			Role:      exampleRole.Name,
			PolicyArn: lambdaLogging.Arn,
		})
		if err != nil {
			return err
		}
		// Lambda function with logging
		_, err = lambda.NewFunction(ctx, "example", &lambda.FunctionArgs{
			Code:    pulumi.NewFileArchive("function.zip"),
			Name:    pulumi.String(pulumi.String(functionName)),
			Role:    exampleRole.Arn,
			Handler: pulumi.String("index.handler"),
			Runtime: pulumi.String(lambda.RuntimeNodeJS24dX),
			LoggingConfig: &lambda.FunctionLoggingConfigArgs{
				LogFormat:           pulumi.String("JSON"),
				ApplicationLogLevel: pulumi.String("INFO"),
				SystemLogLevel:      pulumi.String("WARN"),
			},
		}, pulumi.DependsOn([]pulumi.Resource{
			lambdaLogs,
			example,
		}))
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
    var config = new Config();
    // Name of the Lambda function
    var functionName = config.Get("functionName") ?? "example_function";
    // CloudWatch Log Group with retention
    var example = new Aws.CloudWatch.LogGroup("example", new()
    {
        Name = $"/aws/lambda/{functionName}",
        RetentionInDays = 14,
        Tags =
        {
            { "Environment", "production" },
            { "Function", functionName },
        },
    });

    // Lambda execution role
    var exampleRole = new Aws.Iam.Role("example", new()
    {
        Name = "lambda_execution_role",
        AssumeRolePolicy = JsonSerializer.Serialize(new Dictionary<string, object?>
        {
            ["Version"] = "2012-10-17",
            ["Statement"] = new[]
            {
                new Dictionary<string, object?>
                {
                    ["Action"] = "sts:AssumeRole",
                    ["Effect"] = "Allow",
                    ["Principal"] = new Dictionary<string, object?>
                    {
                        ["Service"] = "lambda.amazonaws.com",
                    },
                },
            },
        }),
    });

    // CloudWatch Logs policy
    var lambdaLogging = new Aws.Iam.Policy("lambda_logging", new()
    {
        Name = "lambda_logging",
        Path = "/",
        Description = "IAM policy for logging from Lambda",
        PolicyDocument = JsonSerializer.Serialize(new Dictionary<string, object?>
        {
            ["Version"] = "2012-10-17",
            ["Statement"] = new[]
            {
                new Dictionary<string, object?>
                {
                    ["Effect"] = "Allow",
                    ["Action"] = new[]
                    {
                        "logs:CreateLogGroup",
                        "logs:CreateLogStream",
                        "logs:PutLogEvents",
                    },
                    ["Resource"] = new[]
                    {
                        "arn:aws:logs:*:*:*",
                    },
                },
            },
        }),
    });

    // Attach logging policy to Lambda role
    var lambdaLogs = new Aws.Iam.RolePolicyAttachment("lambda_logs", new()
    {
        Role = exampleRole.Name,
        PolicyArn = lambdaLogging.Arn,
    });

    // Lambda function with logging
    var exampleFunction = new Aws.Lambda.Function("example", new()
    {
        Code = new FileArchive("function.zip"),
        Name = functionName,
        Role = exampleRole.Arn,
        Handler = "index.handler",
        Runtime = Aws.Lambda.Runtime.NodeJS24dX,
        LoggingConfig = new Aws.Lambda.Inputs.FunctionLoggingConfigArgs
        {
            LogFormat = "JSON",
            ApplicationLogLevel = "INFO",
            SystemLogLevel = "WARN",
        },
    }, new CustomResourceOptions
    {
        DependsOn =
        {
            lambdaLogs,
            example,
        },
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.cloudwatch.LogGroup;
import com.pulumi.aws.cloudwatch.LogGroupArgs;
import com.pulumi.aws.iam.Role;
import com.pulumi.aws.iam.RoleArgs;
import com.pulumi.aws.iam.Policy;
import com.pulumi.aws.iam.PolicyArgs;
import com.pulumi.aws.iam.RolePolicyAttachment;
import com.pulumi.aws.iam.RolePolicyAttachmentArgs;
import com.pulumi.aws.lambda.Function;
import com.pulumi.aws.lambda.FunctionArgs;
import com.pulumi.aws.lambda.inputs.FunctionLoggingConfigArgs;
import com.pulumi.asset.FileArchive;
import static com.pulumi.codegen.internal.Serialization.*;
import com.pulumi.resources.CustomResourceOptions;
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
        final var config = ctx.config();
        final var functionName = config.get("functionName").orElse("example_function");
        // CloudWatch Log Group with retention
        var example = new LogGroup("example", LogGroupArgs.builder()
            .name(String.format("/aws/lambda/%s", functionName))
            .retentionInDays(14)
            .tags(Map.ofEntries(
                Map.entry("Environment", "production"),
                Map.entry("Function", functionName)
            ))
            .build());

        // Lambda execution role
        var exampleRole = new Role("exampleRole", RoleArgs.builder()
            .name("lambda_execution_role")
            .assumeRolePolicy(serializeJson(
                jsonObject(
                    jsonProperty("Version", "2012-10-17"),
                    jsonProperty("Statement", jsonArray(jsonObject(
                        jsonProperty("Action", "sts:AssumeRole"),
                        jsonProperty("Effect", "Allow"),
                        jsonProperty("Principal", jsonObject(
                            jsonProperty("Service", "lambda.amazonaws.com")
                        ))
                    )))
                )))
            .build());

        // CloudWatch Logs policy
        var lambdaLogging = new Policy("lambdaLogging", PolicyArgs.builder()
            .name("lambda_logging")
            .path("/")
            .description("IAM policy for logging from Lambda")
            .policy(serializeJson(
                jsonObject(
                    jsonProperty("Version", "2012-10-17"),
                    jsonProperty("Statement", jsonArray(jsonObject(
                        jsonProperty("Effect", "Allow"),
                        jsonProperty("Action", jsonArray(
                            "logs:CreateLogGroup",
                            "logs:CreateLogStream",
                            "logs:PutLogEvents"
                        )),
                        jsonProperty("Resource", jsonArray("arn:aws:logs:*:*:*"))
                    )))
                )))
            .build());

        // Attach logging policy to Lambda role
        var lambdaLogs = new RolePolicyAttachment("lambdaLogs", RolePolicyAttachmentArgs.builder()
            .role(exampleRole.name())
            .policyArn(lambdaLogging.arn())
            .build());

        // Lambda function with logging
        var exampleFunction = new Function("exampleFunction", FunctionArgs.builder()
            .code(new FileArchive("function.zip"))
            .name(functionName)
            .role(exampleRole.arn())
            .handler("index.handler")
            .runtime("nodejs24.x")
            .loggingConfig(FunctionLoggingConfigArgs.builder()
                .logFormat("JSON")
                .applicationLogLevel("INFO")
                .systemLogLevel("WARN")
                .build())
            .build(), CustomResourceOptions.builder()
                .dependsOn(
                    lambdaLogs,
                    example)
                .build());

    }
}
```

```yaml
configuration:
  # Function name variable
  functionName:
    type: string
    default: example_function
resources:
  # CloudWatch Log Group with retention
  example:
    type: aws:cloudwatch:LogGroup
    properties:
      name: /aws/lambda/${functionName}
      retentionInDays: 14
      tags:
        Environment: production
        Function: ${functionName}
  # Lambda execution role
  exampleRole:
    type: aws:iam:Role
    name: example
    properties:
      name: lambda_execution_role
      assumeRolePolicy:
        fn::toJSON:
          Version: 2012-10-17
          Statement:
            - Action: sts:AssumeRole
              Effect: Allow
              Principal:
                Service: lambda.amazonaws.com
  # CloudWatch Logs policy
  lambdaLogging:
    type: aws:iam:Policy
    name: lambda_logging
    properties:
      name: lambda_logging
      path: /
      description: IAM policy for logging from Lambda
      policy:
        fn::toJSON:
          Version: 2012-10-17
          Statement:
            - Effect: Allow
              Action:
                - logs:CreateLogGroup
                - logs:CreateLogStream
                - logs:PutLogEvents
              Resource:
                - arn:aws:logs:*:*:*
  # Attach logging policy to Lambda role
  lambdaLogs:
    type: aws:iam:RolePolicyAttachment
    name: lambda_logs
    properties:
      role: ${exampleRole.name}
      policyArn: ${lambdaLogging.arn}
  # Lambda function with logging
  exampleFunction:
    type: aws:lambda:Function
    name: example
    properties:
      code:
        fn::fileArchive: function.zip
      name: ${functionName}
      role: ${exampleRole.arn}
      handler: index.handler
      runtime: nodejs24.x
      loggingConfig:
        logFormat: JSON
        applicationLogLevel: INFO
        systemLogLevel: WARN
    options:
      dependsOn:
        - ${lambdaLogs}
        - ${example}
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

# CloudWatch Log Group with retention
resource "aws_cloudwatch_loggroup" "example" {
  name              ="/aws/lambda/${var.functionName}"
  retention_in_days = 14
  tags = {
    "Environment" = "production"
    "Function"    = var.functionName
  }
}

# Lambda execution role
resource "aws_iam_role" "example" {
  name = "lambda_execution_role"
  assume_role_policy = jsonencode({
    "Version" = "2012-10-17"
    "Statement" = [{
      "Action" = "sts:AssumeRole"
      "Effect" = "Allow"
      "Principal" = {
        "Service" = "lambda.amazonaws.com"
      }
    }]
  })
}

# CloudWatch Logs policy
resource "aws_iam_policy" "lambda_logging" {
  name        = "lambda_logging"
  path        = "/"
  description = "IAM policy for logging from Lambda"
  policy = jsonencode({
    "Version" = "2012-10-17"
    "Statement" = [{
      "Effect"   = "Allow"
      "Action"   = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"]
      "Resource" = ["arn:aws:logs:*:*:*"]
    }]
  })
}

# Attach logging policy to Lambda role
resource "aws_iam_rolepolicyattachment" "lambda_logs" {
  role       = aws_iam_role.example.name
  policy_arn = aws_iam_policy.lambda_logging.arn
}

# Lambda function with logging
resource "aws_lambda_function" "example" {
  depends_on = [aws_iam_rolepolicyattachment.lambda_logs, aws_cloudwatch_loggroup.example]
  code       = fileArchive("function.zip")
  name       = var.functionName
  role       = aws_iam_role.example.arn
  handler    = "index.handler"
  runtime    = "nodejs24.x"
  logging_config = {
    log_format            = "JSON"
    application_log_level = "INFO"
    system_log_level      = "WARN"
  }
}

# Function name variable
variable "functionName" {
  type        = string
  default     = "example_function"
  description = "Name of the Lambda function"
}
```

### Function with Durable Configuration[](#function-with-durable-configuration)

Stopping durable executions and deleting the Lambda function may take up to `60m`. Use configured `timeouts` as shown below.

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const example = new aws.lambda.Function("example", {
    code: new pulumi.asset.FileArchive("function.zip"),
    name: "example_durable_function",
    role: exampleAwsIamRole.arn,
    handler: "index.handler",
    runtime: aws.lambda.Runtime.NodeJS22dX,
    memorySize: 512,
    timeout: 30,
    durableConfig: {
        executionTimeout: 3600,
        retentionPeriod: 7,
    },
    environment: {
        variables: {
            DURABLE_MODE: "enabled",
        },
    },
    tags: {
        Environment: "production",
        Type: "durable",
    },
});
```

```python
import pulumi
import pulumi_aws as aws

example = aws.lambda_.Function("example",
    code=pulumi.FileArchive("function.zip"),
    name="example_durable_function",
    role=example_aws_iam_role["arn"],
    handler="index.handler",
    runtime=aws.lambda_.Runtime.NODE_JS22D_X,
    memory_size=512,
    timeout=30,
    durable_config={
        "execution_timeout": 3600,
        "retention_period": 7,
    },
    environment={
        "variables": {
            "DURABLE_MODE": "enabled",
        },
    },
    tags={
        "Environment": "production",
        "Type": "durable",
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
		_, err := lambda.NewFunction(ctx, "example", &lambda.FunctionArgs{
			Code:       pulumi.NewFileArchive("function.zip"),
			Name:       pulumi.String("example_durable_function"),
			Role:       pulumi.Any(exampleAwsIamRole.Arn),
			Handler:    pulumi.String("index.handler"),
			Runtime:    pulumi.String(lambda.RuntimeNodeJS22dX),
			MemorySize: pulumi.Int(512),
			Timeout:    pulumi.Int(30),
			DurableConfig: &lambda.FunctionDurableConfigArgs{
				ExecutionTimeout: pulumi.Int(3600),
				RetentionPeriod:  pulumi.Int(7),
			},
			Environment: &lambda.FunctionEnvironmentArgs{
				Variables: pulumi.StringMap{
					"DURABLE_MODE": pulumi.String("enabled"),
				},
			},
			Tags: pulumi.StringMap{
				"Environment": pulumi.String("production"),
				"Type":        pulumi.String("durable"),
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
    var example = new Aws.Lambda.Function("example", new()
    {
        Code = new FileArchive("function.zip"),
        Name = "example_durable_function",
        Role = exampleAwsIamRole.Arn,
        Handler = "index.handler",
        Runtime = Aws.Lambda.Runtime.NodeJS22dX,
        MemorySize = 512,
        Timeout = 30,
        DurableConfig = new Aws.Lambda.Inputs.FunctionDurableConfigArgs
        {
            ExecutionTimeout = 3600,
            RetentionPeriod = 7,
        },
        Environment = new Aws.Lambda.Inputs.FunctionEnvironmentArgs
        {
            Variables =
            {
                { "DURABLE_MODE", "enabled" },
            },
        },
        Tags =
        {
            { "Environment", "production" },
            { "Type", "durable" },
        },
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
import com.pulumi.aws.lambda.inputs.FunctionDurableConfigArgs;
import com.pulumi.aws.lambda.inputs.FunctionEnvironmentArgs;
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
            .code(new FileArchive("function.zip"))
            .name("example_durable_function")
            .role(exampleAwsIamRole.arn())
            .handler("index.handler")
            .runtime("nodejs22.x")
            .memorySize(512)
            .timeout(30)
            .durableConfig(FunctionDurableConfigArgs.builder()
                .executionTimeout(3600)
                .retentionPeriod(7)
                .build())
            .environment(FunctionEnvironmentArgs.builder()
                .variables(Map.of("DURABLE_MODE", "enabled"))
                .build())
            .tags(Map.ofEntries(
                Map.entry("Environment", "production"),
                Map.entry("Type", "durable")
            ))
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
        fn::fileArchive: function.zip
      name: example_durable_function
      role: ${exampleAwsIamRole.arn}
      handler: index.handler
      runtime: nodejs22.x
      memorySize: 512
      timeout: 30 # Durable function configuration for long-running processes
      durableConfig:
        executionTimeout: 3600
        retentionPeriod: 7
      environment:
        variables:
          DURABLE_MODE: enabled
      tags:
        Environment: production
        Type: durable
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
  code        = fileArchive("function.zip")
  name        = "example_durable_function"
  role        = exampleAwsIamRole.arn
  handler     = "index.handler"
  runtime     = "nodejs22.x"
  memory_size = 512
  timeout     = 30
  # Durable function configuration for long-running processes
  durable_config = {
    execution_timeout = 3600
    retention_period  = 7
  }
  # 1 hour maximum execution time
  # 1 hour maximum execution time
  # Retain execution state for 7 days
  environment = {
    variables = {
      "DURABLE_MODE" = "enabled"
    }
  }
  tags = {
    "Environment" = "production"
    "Type"        = "durable"
  }
}
```

### Capacity Provider Configuration[](#capacity-provider-configuration)

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const exampleCapacityProvider = new aws.lambda.CapacityProvider("example", {
    name: "example",
    vpcConfig: {
        subnetIds: [exampleAwsSubnet.id],
        securityGroupIds: [exampleAwsSecurityGroup.id],
    },
    permissionsConfig: {
        capacityProviderOperatorRoleArn: exampleAwsIamRole.arn,
    },
});
const example = new aws.lambda.Function("example", {
    code: new pulumi.asset.FileArchive("function.zip"),
    name: "example",
    role: exampleAwsIamRole.arn,
    handler: "index.handler",
    runtime: aws.lambda.Runtime.NodeJS24dX,
    memorySize: 2048,
    publish: true,
    capacityProviderConfig: {
        lambdaManagedInstancesCapacityProviderConfig: {
            capacityProviderArn: exampleCapacityProvider.arn,
        },
    },
});
```

```python
import pulumi
import pulumi_aws as aws

example_capacity_provider = aws.lambda_.CapacityProvider("example",
    name="example",
    vpc_config={
        "subnet_ids": [example_aws_subnet["id"]],
        "security_group_ids": [example_aws_security_group["id"]],
    },
    permissions_config={
        "capacity_provider_operator_role_arn": example_aws_iam_role["arn"],
    })
example = aws.lambda_.Function("example",
    code=pulumi.FileArchive("function.zip"),
    name="example",
    role=example_aws_iam_role["arn"],
    handler="index.handler",
    runtime=aws.lambda_.Runtime.NODE_JS24D_X,
    memory_size=2048,
    publish=True,
    capacity_provider_config={
        "lambda_managed_instances_capacity_provider_config": {
            "capacity_provider_arn": example_capacity_provider.arn,
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
		exampleCapacityProvider, err := lambda.NewCapacityProvider(ctx, "example", &lambda.CapacityProviderArgs{
			Name: pulumi.String("example"),
			VpcConfig: &lambda.CapacityProviderVpcConfigArgs{
				SubnetIds: pulumi.StringArray{
					exampleAwsSubnet.Id,
				},
				SecurityGroupIds: pulumi.StringArray{
					exampleAwsSecurityGroup.Id,
				},
			},
			PermissionsConfig: &lambda.CapacityProviderPermissionsConfigArgs{
				CapacityProviderOperatorRoleArn: pulumi.Any(exampleAwsIamRole.Arn),
			},
		})
		if err != nil {
			return err
		}
		_, err = lambda.NewFunction(ctx, "example", &lambda.FunctionArgs{
			Code:       pulumi.NewFileArchive("function.zip"),
			Name:       pulumi.String("example"),
			Role:       pulumi.Any(exampleAwsIamRole.Arn),
			Handler:    pulumi.String("index.handler"),
			Runtime:    pulumi.String(lambda.RuntimeNodeJS24dX),
			MemorySize: pulumi.Int(2048),
			Publish:    pulumi.Bool(true),
			CapacityProviderConfig: &lambda.FunctionCapacityProviderConfigArgs{
				LambdaManagedInstancesCapacityProviderConfig: &lambda.FunctionCapacityProviderConfigLambdaManagedInstancesCapacityProviderConfigArgs{
					CapacityProviderArn: exampleCapacityProvider.Arn,
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
    var exampleCapacityProvider = new Aws.Lambda.CapacityProvider("example", new()
    {
        Name = "example",
        VpcConfig = new Aws.Lambda.Inputs.CapacityProviderVpcConfigArgs
        {
            SubnetIds = new[]
            {
                exampleAwsSubnet.Id,
            },
            SecurityGroupIds = new[]
            {
                exampleAwsSecurityGroup.Id,
            },
        },
        PermissionsConfig = new Aws.Lambda.Inputs.CapacityProviderPermissionsConfigArgs
        {
            CapacityProviderOperatorRoleArn = exampleAwsIamRole.Arn,
        },
    });

    var example = new Aws.Lambda.Function("example", new()
    {
        Code = new FileArchive("function.zip"),
        Name = "example",
        Role = exampleAwsIamRole.Arn,
        Handler = "index.handler",
        Runtime = Aws.Lambda.Runtime.NodeJS24dX,
        MemorySize = 2048,
        Publish = true,
        CapacityProviderConfig = new Aws.Lambda.Inputs.FunctionCapacityProviderConfigArgs
        {
            LambdaManagedInstancesCapacityProviderConfig = new Aws.Lambda.Inputs.FunctionCapacityProviderConfigLambdaManagedInstancesCapacityProviderConfigArgs
            {
                CapacityProviderArn = exampleCapacityProvider.Arn,
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
import com.pulumi.aws.lambda.CapacityProvider;
import com.pulumi.aws.lambda.CapacityProviderArgs;
import com.pulumi.aws.lambda.inputs.CapacityProviderVpcConfigArgs;
import com.pulumi.aws.lambda.inputs.CapacityProviderPermissionsConfigArgs;
import com.pulumi.aws.lambda.Function;
import com.pulumi.aws.lambda.FunctionArgs;
import com.pulumi.aws.lambda.inputs.FunctionCapacityProviderConfigArgs;
import com.pulumi.aws.lambda.inputs.FunctionCapacityProviderConfigLambdaManagedInstancesCapacityProviderConfigArgs;
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
        var exampleCapacityProvider = new CapacityProvider("exampleCapacityProvider", CapacityProviderArgs.builder()
            .name("example")
            .vpcConfig(CapacityProviderVpcConfigArgs.builder()
                .subnetIds(exampleAwsSubnet.id())
                .securityGroupIds(exampleAwsSecurityGroup.id())
                .build())
            .permissionsConfig(CapacityProviderPermissionsConfigArgs.builder()
                .capacityProviderOperatorRoleArn(exampleAwsIamRole.arn())
                .build())
            .build());

        var example = new Function("example", FunctionArgs.builder()
            .code(new FileArchive("function.zip"))
            .name("example")
            .role(exampleAwsIamRole.arn())
            .handler("index.handler")
            .runtime("nodejs24.x")
            .memorySize(2048)
            .publish(true)
            .capacityProviderConfig(FunctionCapacityProviderConfigArgs.builder()
                .lambdaManagedInstancesCapacityProviderConfig(FunctionCapacityProviderConfigLambdaManagedInstancesCapacityProviderConfigArgs.builder()
                    .capacityProviderArn(exampleCapacityProvider.arn())
                    .build())
                .build())
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
        fn::fileArchive: function.zip
      name: example
      role: ${exampleAwsIamRole.arn}
      handler: index.handler
      runtime: nodejs24.x
      memorySize: 2048
      publish: true
      capacityProviderConfig:
        lambdaManagedInstancesCapacityProviderConfig:
          capacityProviderArn: ${exampleCapacityProvider.arn}
  exampleCapacityProvider:
    type: aws:lambda:CapacityProvider
    name: example
    properties:
      name: example
      vpcConfig:
        subnetIds:
          - ${exampleAwsSubnet.id}
        securityGroupIds:
          - ${exampleAwsSecurityGroup.id}
      permissionsConfig:
        capacityProviderOperatorRoleArn: ${exampleAwsIamRole.arn}
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
  code        = fileArchive("function.zip")
  name        = "example"
  role        = exampleAwsIamRole.arn
  handler     = "index.handler"
  runtime     = "nodejs24.x"
  memory_size = 2048
  publish     = true
  capacity_provider_config = {
    lambda_managed_instances_capacity_provider_config = {
      capacity_provider_arn = aws_lambda_capacityprovider.example.arn
    }
  }
}
resource "aws_lambda_capacityprovider" "example" {
  name = "example"
  vpc_config = {
    subnet_ids         = [exampleAwsSubnet.id]
    security_group_ids = [exampleAwsSecurityGroup.id]
  }
  permissions_config = {
    capacity_provider_operator_role_arn = exampleAwsIamRole.arn
  }
}
```

See the `aws.lambda.CapacityProvider` resource for more details, such as configuring instance requirements and the scaling policy.

## Specifying the Deployment Package[](#specifying-the-deployment-package)

AWS Lambda expects source code to be provided as a deployment package whose structure varies depending on which `runtime` is in use. See [Runtimes](https://docs.aws.amazon.com/lambda/latest/dg/API_CreateFunction.html#SSS-CreateFunction-request-Runtime) for the valid values of `runtime`. The expected structure of the deployment package can be found in [the AWS Lambda documentation for each runtime](https://docs.aws.amazon.com/lambda/latest/dg/deployment-package-v2.html).

Once you have created your deployment package you can specify it either directly as a local file (using the `filename` argument) or indirectly via Amazon S3 (using the `s3Bucket`, `s3Key` and `s3ObjectVersion` arguments). When providing the deployment package via S3 it may be useful to use the `aws.s3.BucketObjectv2` resource to upload it.

For larger deployment packages it is recommended by Amazon to upload via S3, since the S3 API has better support for uploading large files efficiently.

## Create Function Resource[](#create)

Resources are created with functions called constructors. To learn more about declaring and configuring resources, see [Resources](/docs/concepts/resources/).

### Constructor syntax[](#constructor-syntax)

```typescript
new Function(name: string, args: FunctionArgs, opts?: CustomResourceOptions);
```

```python
@overload
def Function(resource_name: str,
             args: FunctionArgs,
             opts: Optional[ResourceOptions] = None)

@overload
def Function(resource_name: str,
             opts: Optional[ResourceOptions] = None,
             role: Optional[str] = None,
             publish: Optional[bool] = None,
             memory_size: Optional[int] = None,
             code_sha256: Optional[str] = None,
             code_signing_config_arn: Optional[str] = None,
             dead_letter_config: Optional[FunctionDeadLetterConfigArgs] = None,
             description: Optional[str] = None,
             durable_config: Optional[FunctionDurableConfigArgs] = None,
             environment: Optional[FunctionEnvironmentArgs] = None,
             ephemeral_storage: Optional[FunctionEphemeralStorageArgs] = None,
             file_system_config: Optional[FunctionFileSystemConfigArgs] = None,
             handler: Optional[str] = None,
             image_config: Optional[FunctionImageConfigArgs] = None,
             image_uri: Optional[str] = None,
             kms_key_arn: Optional[str] = None,
             layers: Optional[Sequence[str]] = None,
             logging_config: Optional[FunctionLoggingConfigArgs] = None,
             architectures: Optional[Sequence[str]] = None,
             name: Optional[str] = None,
             code: Optional[pulumi.Archive] = None,
             package_type: Optional[str] = None,
             replacement_security_group_ids: Optional[Sequence[str]] = None,
             region: Optional[str] = None,
             replace_security_groups_on_destroy: Optional[bool] = None,
             publish_to: Optional[str] = None,
             reserved_concurrent_executions: Optional[int] = None,
             capacity_provider_config: Optional[FunctionCapacityProviderConfigArgs] = None,
             runtime: Optional[Union[str, Runtime]] = None,
             s3_bucket: Optional[str] = None,
             s3_key: Optional[str] = None,
             s3_object_version: Optional[str] = None,
             skip_destroy: Optional[bool] = None,
             snap_start: Optional[FunctionSnapStartArgs] = None,
             source_code_hash: Optional[str] = None,
             source_kms_key_arn: Optional[str] = None,
             tags: Optional[Mapping[str, str]] = None,
             tenancy_config: Optional[FunctionTenancyConfigArgs] = None,
             timeout: Optional[int] = None,
             tracing_config: Optional[FunctionTracingConfigArgs] = None,
             vpc_config: Optional[FunctionVpcConfigArgs] = None)
```

```go
func NewFunction(ctx *Context, name string, args FunctionArgs, opts ...ResourceOption) (*Function, error)
```

```csharp
public Function(string name, FunctionArgs args, CustomResourceOptions? opts = null)
```

```java
public Function(String name, FunctionArgs args)
public Function(String name, FunctionArgs args, CustomResourceOptions options)
```

```yaml
type: aws:lambda:Function
properties: # The arguments to resource properties.
options: # Bag of options to control resource's behavior.
```

```hcl
resource "aws_lambda_function" "name" {
    # resource properties
}
```

#### Parameters[](#parameters)

name This property is required. string

The unique name of the resource.

args This property is required. [FunctionArgs](#inputs)

The arguments to resource properties.

opts [CustomResourceOptions](/docs/reference/pkg/nodejs/pulumi/pulumi/#CustomResourceOptions)

Bag of options to control resource's behavior.

resource\_name This property is required. str

The unique name of the resource.

args This property is required. [FunctionArgs](#inputs)

The arguments to resource properties.

opts [ResourceOptions](/docs/reference/pkg/python/pulumi/#pulumi.ResourceOptions)

Bag of options to control resource's behavior.

ctx [Context](https://pkg.go.dev/github.com/pulumi/pulumi/sdk/v3/go/pulumi?tab=doc#Context)

Context object for the current deployment.

name This property is required. string

The unique name of the resource.

args This property is required. [FunctionArgs](#inputs)

The arguments to resource properties.

opts [ResourceOption](https://pkg.go.dev/github.com/pulumi/pulumi/sdk/v3/go/pulumi?tab=doc#ResourceOption)

Bag of options to control resource's behavior.

name This property is required. string

The unique name of the resource.

args This property is required. [FunctionArgs](#inputs)

The arguments to resource properties.

opts [CustomResourceOptions](/docs/reference/pkg/dotnet/Pulumi/Pulumi.CustomResourceOptions.html)

Bag of options to control resource's behavior.

name This property is required. String

The unique name of the resource.

args This property is required. [FunctionArgs](#inputs)

The arguments to resource properties.

options CustomResourceOptions

Bag of options to control resource's behavior.

### Constructor example[](#constructor-example)

The following reference example uses placeholder values for all [input properties](#inputs).

```csharp
var examplefunctionResourceResourceFromLambdafunction = new Aws.Lambda.Function("examplefunctionResourceResourceFromLambdafunction", new()
{
    Role = "string",
    Publish = false,
    MemorySize = 0,
    CodeSha256 = "string",
    CodeSigningConfigArn = "string",
    DeadLetterConfig = new Aws.Lambda.Inputs.FunctionDeadLetterConfigArgs
    {
        TargetArn = "string",
    },
    Description = "string",
    DurableConfig = new Aws.Lambda.Inputs.FunctionDurableConfigArgs
    {
        ExecutionTimeout = 0,
        RetentionPeriod = 0,
    },
    Environment = new Aws.Lambda.Inputs.FunctionEnvironmentArgs
    {
        Variables =
        {
            { "string", "string" },
        },
    },
    EphemeralStorage = new Aws.Lambda.Inputs.FunctionEphemeralStorageArgs
    {
        Size = 0,
    },
    FileSystemConfig = new Aws.Lambda.Inputs.FunctionFileSystemConfigArgs
    {
        Arn = "string",
        LocalMountPath = "string",
    },
    Handler = "string",
    ImageConfig = new Aws.Lambda.Inputs.FunctionImageConfigArgs
    {
        Commands = new[]
        {
            "string",
        },
        EntryPoints = new[]
        {
            "string",
        },
        WorkingDirectory = "string",
    },
    ImageUri = "string",
    KmsKeyArn = "string",
    Layers = new[]
    {
        "string",
    },
    LoggingConfig = new Aws.Lambda.Inputs.FunctionLoggingConfigArgs
    {
        LogFormat = "string",
        ApplicationLogLevel = "string",
        LogGroup = "string",
        SystemLogLevel = "string",
    },
    Architectures = new[]
    {
        "string",
    },
    Name = "string",
    Code = new FileArchive("./path/to/archive"),
    PackageType = "string",
    ReplacementSecurityGroupIds = new[]
    {
        "string",
    },
    Region = "string",
    ReplaceSecurityGroupsOnDestroy = false,
    PublishTo = "string",
    ReservedConcurrentExecutions = 0,
    CapacityProviderConfig = new Aws.Lambda.Inputs.FunctionCapacityProviderConfigArgs
    {
        LambdaManagedInstancesCapacityProviderConfig = new Aws.Lambda.Inputs.FunctionCapacityProviderConfigLambdaManagedInstancesCapacityProviderConfigArgs
        {
            CapacityProviderArn = "string",
            ExecutionEnvironmentMemoryGibPerVcpu = 0,
            PerExecutionEnvironmentMaxConcurrency = 0,
        },
    },
    Runtime = "string",
    S3Bucket = "string",
    S3Key = "string",
    S3ObjectVersion = "string",
    SkipDestroy = false,
    SnapStart = new Aws.Lambda.Inputs.FunctionSnapStartArgs
    {
        ApplyOn = "string",
        OptimizationStatus = "string",
    },
    SourceCodeHash = "string",
    SourceKmsKeyArn = "string",
    Tags =
    {
        { "string", "string" },
    },
    TenancyConfig = new Aws.Lambda.Inputs.FunctionTenancyConfigArgs
    {
        TenantIsolationMode = "string",
    },
    Timeout = 0,
    TracingConfig = new Aws.Lambda.Inputs.FunctionTracingConfigArgs
    {
        Mode = "string",
    },
    VpcConfig = new Aws.Lambda.Inputs.FunctionVpcConfigArgs
    {
        SecurityGroupIds = new[]
        {
            "string",
        },
        SubnetIds = new[]
        {
            "string",
        },
        Ipv6AllowedForDualStack = false,
        VpcId = "string",
    },
});
```

```go
example, err := lambda.NewFunction(ctx, "examplefunctionResourceResourceFromLambdafunction", &lambda.FunctionArgs{
	Role:                 pulumi.String("string"),
	Publish:              pulumi.Bool(false),
	MemorySize:           pulumi.Int(0),
	CodeSha256:           pulumi.String("string"),
	CodeSigningConfigArn: pulumi.String("string"),
	DeadLetterConfig: &lambda.FunctionDeadLetterConfigArgs{
		TargetArn: pulumi.String("string"),
	},
	Description: pulumi.String("string"),
	DurableConfig: &lambda.FunctionDurableConfigArgs{
		ExecutionTimeout: pulumi.Int(0),
		RetentionPeriod:  pulumi.Int(0),
	},
	Environment: &lambda.FunctionEnvironmentArgs{
		Variables: pulumi.StringMap{
			"string": pulumi.String("string"),
		},
	},
	EphemeralStorage: &lambda.FunctionEphemeralStorageArgs{
		Size: pulumi.Int(0),
	},
	FileSystemConfig: &lambda.FunctionFileSystemConfigArgs{
		Arn:            pulumi.String("string"),
		LocalMountPath: pulumi.String("string"),
	},
	Handler: pulumi.String("string"),
	ImageConfig: &lambda.FunctionImageConfigArgs{
		Commands: pulumi.StringArray{
			pulumi.String("string"),
		},
		EntryPoints: pulumi.StringArray{
			pulumi.String("string"),
		},
		WorkingDirectory: pulumi.String("string"),
	},
	ImageUri:  pulumi.String("string"),
	KmsKeyArn: pulumi.String("string"),
	Layers: pulumi.StringArray{
		pulumi.String("string"),
	},
	LoggingConfig: &lambda.FunctionLoggingConfigArgs{
		LogFormat:           pulumi.String("string"),
		ApplicationLogLevel: pulumi.String("string"),
		LogGroup:            pulumi.String("string"),
		SystemLogLevel:      pulumi.String("string"),
	},
	Architectures: pulumi.StringArray{
		pulumi.String("string"),
	},
	Name:        pulumi.String("string"),
	Code:        pulumi.NewFileArchive("./path/to/archive"),
	PackageType: pulumi.String("string"),
	ReplacementSecurityGroupIds: pulumi.StringArray{
		pulumi.String("string"),
	},
	Region:                         pulumi.String("string"),
	ReplaceSecurityGroupsOnDestroy: pulumi.Bool(false),
	PublishTo:                      pulumi.String("string"),
	ReservedConcurrentExecutions:   pulumi.Int(0),
	CapacityProviderConfig: &lambda.FunctionCapacityProviderConfigArgs{
		LambdaManagedInstancesCapacityProviderConfig: &lambda.FunctionCapacityProviderConfigLambdaManagedInstancesCapacityProviderConfigArgs{
			CapacityProviderArn:                   pulumi.String("string"),
			ExecutionEnvironmentMemoryGibPerVcpu:  pulumi.Float64(0),
			PerExecutionEnvironmentMaxConcurrency: pulumi.Int(0),
		},
	},
	Runtime:         pulumi.String("string"),
	S3Bucket:        pulumi.String("string"),
	S3Key:           pulumi.String("string"),
	S3ObjectVersion: pulumi.String("string"),
	SkipDestroy:     pulumi.Bool(false),
	SnapStart: &lambda.FunctionSnapStartArgs{
		ApplyOn:            pulumi.String("string"),
		OptimizationStatus: pulumi.String("string"),
	},
	SourceCodeHash:  pulumi.String("string"),
	SourceKmsKeyArn: pulumi.String("string"),
	Tags: pulumi.StringMap{
		"string": pulumi.String("string"),
	},
	TenancyConfig: &lambda.FunctionTenancyConfigArgs{
		TenantIsolationMode: pulumi.String("string"),
	},
	Timeout: pulumi.Int(0),
	TracingConfig: &lambda.FunctionTracingConfigArgs{
		Mode: pulumi.String("string"),
	},
	VpcConfig: &lambda.FunctionVpcConfigArgs{
		SecurityGroupIds: pulumi.StringArray{
			pulumi.String("string"),
		},
		SubnetIds: pulumi.StringArray{
			pulumi.String("string"),
		},
		Ipv6AllowedForDualStack: pulumi.Bool(false),
		VpcId:                   pulumi.String("string"),
	},
})
```

```hcl
resource "aws_lambda_function" "examplefunctionResourceResourceFromLambdafunction" {
  role                    = "string"
  publish                 = false
  memory_size             = 0
  code_sha256             = "string"
  code_signing_config_arn = "string"
  dead_letter_config = {
    target_arn = "string"
  }
  description = "string"
  durable_config = {
    execution_timeout = 0
    retention_period  = 0
  }
  environment = {
    variables = {
      "string" = "string"
    }
  }
  ephemeral_storage = {
    size = 0
  }
  file_system_config = {
    arn              = "string"
    local_mount_path = "string"
  }
  handler = "string"
  image_config = {
    commands          = ["string"]
    entry_points      = ["string"]
    working_directory = "string"
  }
  image_uri   = "string"
  kms_key_arn = "string"
  layers      = ["string"]
  logging_config = {
    log_format            = "string"
    application_log_level = "string"
    log_group             = "string"
    system_log_level      = "string"
  }
  architectures                      = ["string"]
  name                               = "string"
  code                               = fileArchive("./path/to/archive")
  package_type                       = "string"
  replacement_security_group_ids     = ["string"]
  region                             = "string"
  replace_security_groups_on_destroy = false
  publish_to                         = "string"
  reserved_concurrent_executions     = 0
  capacity_provider_config = {
    lambda_managed_instances_capacity_provider_config = {
      capacity_provider_arn                     = "string"
      execution_environment_memory_gib_per_vcpu = 0
      per_execution_environment_max_concurrency = 0
    }
  }
  runtime           = "string"
  s3_bucket         = "string"
  s3_key            = "string"
  s3_object_version = "string"
  skip_destroy      = false
  snap_start = {
    apply_on            = "string"
    optimization_status = "string"
  }
  source_code_hash   = "string"
  source_kms_key_arn = "string"
  tags = {
    "string" = "string"
  }
  tenancy_config = {
    tenant_isolation_mode = "string"
  }
  timeout = 0
  tracing_config = {
    mode = "string"
  }
  vpc_config = {
    security_group_ids          = ["string"]
    subnet_ids                  = ["string"]
    ipv6_allowed_for_dual_stack = false
    vpc_id                      = "string"
  }
}
```

```java
var examplefunctionResourceResourceFromLambdafunction = new com.pulumi.aws.lambda.Function("examplefunctionResourceResourceFromLambdafunction", com.pulumi.aws.lambda.FunctionArgs.builder()
    .role("string")
    .publish(false)
    .memorySize(0)
    .codeSha256("string")
    .codeSigningConfigArn("string")
    .deadLetterConfig(FunctionDeadLetterConfigArgs.builder()
        .targetArn("string")
        .build())
    .description("string")
    .durableConfig(FunctionDurableConfigArgs.builder()
        .executionTimeout(0)
        .retentionPeriod(0)
        .build())
    .environment(FunctionEnvironmentArgs.builder()
        .variables(Map.of("string", "string"))
        .build())
    .ephemeralStorage(FunctionEphemeralStorageArgs.builder()
        .size(0)
        .build())
    .fileSystemConfig(FunctionFileSystemConfigArgs.builder()
        .arn("string")
        .localMountPath("string")
        .build())
    .handler("string")
    .imageConfig(FunctionImageConfigArgs.builder()
        .commands("string")
        .entryPoints("string")
        .workingDirectory("string")
        .build())
    .imageUri("string")
    .kmsKeyArn("string")
    .layers("string")
    .loggingConfig(FunctionLoggingConfigArgs.builder()
        .logFormat("string")
        .applicationLogLevel("string")
        .logGroup("string")
        .systemLogLevel("string")
        .build())
    .architectures("string")
    .name("string")
    .code(new FileArchive("./path/to/archive"))
    .packageType("string")
    .replacementSecurityGroupIds("string")
    .region("string")
    .replaceSecurityGroupsOnDestroy(false)
    .publishTo("string")
    .reservedConcurrentExecutions(0)
    .capacityProviderConfig(FunctionCapacityProviderConfigArgs.builder()
        .lambdaManagedInstancesCapacityProviderConfig(FunctionCapacityProviderConfigLambdaManagedInstancesCapacityProviderConfigArgs.builder()
            .capacityProviderArn("string")
            .executionEnvironmentMemoryGibPerVcpu(0.0)
            .perExecutionEnvironmentMaxConcurrency(0)
            .build())
        .build())
    .runtime("string")
    .s3Bucket("string")
    .s3Key("string")
    .s3ObjectVersion("string")
    .skipDestroy(false)
    .snapStart(FunctionSnapStartArgs.builder()
        .applyOn("string")
        .optimizationStatus("string")
        .build())
    .sourceCodeHash("string")
    .sourceKmsKeyArn("string")
    .tags(Map.of("string", "string"))
    .tenancyConfig(FunctionTenancyConfigArgs.builder()
        .tenantIsolationMode("string")
        .build())
    .timeout(0)
    .tracingConfig(FunctionTracingConfigArgs.builder()
        .mode("string")
        .build())
    .vpcConfig(FunctionVpcConfigArgs.builder()
        .securityGroupIds("string")
        .subnetIds("string")
        .ipv6AllowedForDualStack(false)
        .vpcId("string")
        .build())
    .build());
```

```python
examplefunction_resource_resource_from_lambdafunction = aws.lambda_.Function("examplefunctionResourceResourceFromLambdafunction",
    role="string",
    publish=False,
    memory_size=0,
    code_sha256="string",
    code_signing_config_arn="string",
    dead_letter_config={
        "target_arn": "string",
    },
    description="string",
    durable_config={
        "execution_timeout": 0,
        "retention_period": 0,
    },
    environment={
        "variables": {
            "string": "string",
        },
    },
    ephemeral_storage={
        "size": 0,
    },
    file_system_config={
        "arn": "string",
        "local_mount_path": "string",
    },
    handler="string",
    image_config={
        "commands": ["string"],
        "entry_points": ["string"],
        "working_directory": "string",
    },
    image_uri="string",
    kms_key_arn="string",
    layers=["string"],
    logging_config={
        "log_format": "string",
        "application_log_level": "string",
        "log_group": "string",
        "system_log_level": "string",
    },
    architectures=["string"],
    name="string",
    code=pulumi.FileArchive("./path/to/archive"),
    package_type="string",
    replacement_security_group_ids=["string"],
    region="string",
    replace_security_groups_on_destroy=False,
    publish_to="string",
    reserved_concurrent_executions=0,
    capacity_provider_config={
        "lambda_managed_instances_capacity_provider_config": {
            "capacity_provider_arn": "string",
            "execution_environment_memory_gib_per_vcpu": float(0),
            "per_execution_environment_max_concurrency": 0,
        },
    },
    runtime="string",
    s3_bucket="string",
    s3_key="string",
    s3_object_version="string",
    skip_destroy=False,
    snap_start={
        "apply_on": "string",
        "optimization_status": "string",
    },
    source_code_hash="string",
    source_kms_key_arn="string",
    tags={
        "string": "string",
    },
    tenancy_config={
        "tenant_isolation_mode": "string",
    },
    timeout=0,
    tracing_config={
        "mode": "string",
    },
    vpc_config={
        "security_group_ids": ["string"],
        "subnet_ids": ["string"],
        "ipv6_allowed_for_dual_stack": False,
        "vpc_id": "string",
    })
```

```typescript
const examplefunctionResourceResourceFromLambdafunction = new aws.lambda.Function("examplefunctionResourceResourceFromLambdafunction", {
    role: "string",
    publish: false,
    memorySize: 0,
    codeSha256: "string",
    codeSigningConfigArn: "string",
    deadLetterConfig: {
        targetArn: "string",
    },
    description: "string",
    durableConfig: {
        executionTimeout: 0,
        retentionPeriod: 0,
    },
    environment: {
        variables: {
            string: "string",
        },
    },
    ephemeralStorage: {
        size: 0,
    },
    fileSystemConfig: {
        arn: "string",
        localMountPath: "string",
    },
    handler: "string",
    imageConfig: {
        commands: ["string"],
        entryPoints: ["string"],
        workingDirectory: "string",
    },
    imageUri: "string",
    kmsKeyArn: "string",
    layers: ["string"],
    loggingConfig: {
        logFormat: "string",
        applicationLogLevel: "string",
        logGroup: "string",
        systemLogLevel: "string",
    },
    architectures: ["string"],
    name: "string",
    code: new pulumi.asset.FileArchive("./path/to/archive"),
    packageType: "string",
    replacementSecurityGroupIds: ["string"],
    region: "string",
    replaceSecurityGroupsOnDestroy: false,
    publishTo: "string",
    reservedConcurrentExecutions: 0,
    capacityProviderConfig: {
        lambdaManagedInstancesCapacityProviderConfig: {
            capacityProviderArn: "string",
            executionEnvironmentMemoryGibPerVcpu: 0,
            perExecutionEnvironmentMaxConcurrency: 0,
        },
    },
    runtime: "string",
    s3Bucket: "string",
    s3Key: "string",
    s3ObjectVersion: "string",
    skipDestroy: false,
    snapStart: {
        applyOn: "string",
        optimizationStatus: "string",
    },
    sourceCodeHash: "string",
    sourceKmsKeyArn: "string",
    tags: {
        string: "string",
    },
    tenancyConfig: {
        tenantIsolationMode: "string",
    },
    timeout: 0,
    tracingConfig: {
        mode: "string",
    },
    vpcConfig: {
        securityGroupIds: ["string"],
        subnetIds: ["string"],
        ipv6AllowedForDualStack: false,
        vpcId: "string",
    },
});
```

```yaml
type: aws:lambda:Function
properties:
    architectures:
        - string
    capacityProviderConfig:
        lambdaManagedInstancesCapacityProviderConfig:
            capacityProviderArn: string
            executionEnvironmentMemoryGibPerVcpu: 0
            perExecutionEnvironmentMaxConcurrency: 0
    code:
        fn::fileArchive: ./path/to/archive
    codeSha256: string
    codeSigningConfigArn: string
    deadLetterConfig:
        targetArn: string
    description: string
    durableConfig:
        executionTimeout: 0
        retentionPeriod: 0
    environment:
        variables:
            string: string
    ephemeralStorage:
        size: 0
    fileSystemConfig:
        arn: string
        localMountPath: string
    handler: string
    imageConfig:
        commands:
            - string
        entryPoints:
            - string
        workingDirectory: string
    imageUri: string
    kmsKeyArn: string
    layers:
        - string
    loggingConfig:
        applicationLogLevel: string
        logFormat: string
        logGroup: string
        systemLogLevel: string
    memorySize: 0
    name: string
    packageType: string
    publish: false
    publishTo: string
    region: string
    replaceSecurityGroupsOnDestroy: false
    replacementSecurityGroupIds:
        - string
    reservedConcurrentExecutions: 0
    role: string
    runtime: string
    s3Bucket: string
    s3Key: string
    s3ObjectVersion: string
    skipDestroy: false
    snapStart:
        applyOn: string
        optimizationStatus: string
    sourceCodeHash: string
    sourceKmsKeyArn: string
    tags:
        string: string
    tenancyConfig:
        tenantIsolationMode: string
    timeout: 0
    tracingConfig:
        mode: string
    vpcConfig:
        ipv6AllowedForDualStack: false
        securityGroupIds:
            - string
        subnetIds:
            - string
        vpcId: string
```

## Function Resource Properties[](#properties)

To learn more about resource properties and how to use them, see [Inputs and Outputs](/docs/intro/concepts/inputs-outputs) in the Architecture and Concepts docs.

### Inputs[](#inputs)

In Python, inputs that are objects can be passed either as [argument classes or as dictionary literals](/docs/languages-sdks/python/#inputs-and-outputs).

The Function resource accepts the following [input](/docs/intro/concepts/inputs-outputs) properties:

[Role](#role_csharp) This property is required. string

ARN of the function's execution role. The role provides the function's identity and access to AWS services and resources.

The following arguments are optional:

[Architectures](#architectures_csharp) List<string>

Instruction set architecture for your Lambda function. Valid values are `["x8664"]` and `["arm64"]`. Default is `["x8664"]`. Removing this attribute, function's architecture stays the same.

[CapacityProviderConfig](#capacityproviderconfig_csharp) [FunctionCapacityProviderConfig](#functioncapacityproviderconfig)

Configuration block for Lambda Capacity Provider. See below.

[Code](#code_csharp) Archive

Path to the function's deployment package within the local filesystem. Conflicts with `imageUri` and `s3Bucket`. One of `filename`, `imageUri`, or `s3Bucket` must be specified.

[CodeSha256](#codesha256_csharp) string

Base64-encoded representation the source code package file. Use this argument to trigger updates when the function source code changes. For OCI, this value is relayed directly from the image digest. For zip files, this value is the Base64 encoded SHA-256 hash of the `.zip` file. Layers are not included in the calculation. To trigger updates using a non-standard hashing algorithm, use the `sourceCodeHash` argument instead.

[CodeSigningConfigArn](#codesigningconfigarn_csharp) string

ARN of a code-signing configuration to enable code signing for this function.

[DeadLetterConfig](#deadletterconfig_csharp) [FunctionDeadLetterConfig](#functiondeadletterconfig)

Configuration block for dead letter queue. See below.

[Description](#description_csharp) string

Description of what your Lambda Function does.

[DurableConfig](#durableconfig_csharp) [FunctionDurableConfig](#functiondurableconfig)

Configuration block for durable function settings. See below. `durableConfig` may only be available in [limited regions](https://builder.aws.com/build/capabilities), including `us-east-2`.

[Environment](#environment_csharp) [FunctionEnvironment](#functionenvironment)

Configuration block for environment variables. See below.

[EphemeralStorage](#ephemeralstorage_csharp) [FunctionEphemeralStorage](#functionephemeralstorage)

Amount of ephemeral storage (`/tmp`) to allocate for the Lambda Function. See below.

[FileSystemConfig](#filesystemconfig_csharp) [FunctionFileSystemConfig](#functionfilesystemconfig)

Configuration block for EFS or S3 Files file system. See below.

[Handler](#handler_csharp) string

Function entry point in your code. Required if `packageType` is `Zip`.

[ImageConfig](#imageconfig_csharp) [FunctionImageConfig](#functionimageconfig)

Container image configuration values. See below.

[ImageUri](#imageuri_csharp) string

ECR image URI containing the function's deployment package. Conflicts with `filename` and `s3Bucket`. One of `filename`, `imageUri`, or `s3Bucket` must be specified.

[KmsKeyArn](#kmskeyarn_csharp) string

ARN of the AWS Key Management Service key used to encrypt environment variables. If not provided when environment variables are in use, AWS Lambda uses a default service key. If provided when environment variables are not in use, the AWS Lambda API does not save this configuration.

[Layers](#layers_csharp) List<string>

List of Lambda Layer Version ARNs (maximum of 5) to attach to your Lambda Function.

[LoggingConfig](#loggingconfig_csharp) [FunctionLoggingConfig](#functionloggingconfig)

Configuration block for advanced logging settings. See below.

[MemorySize](#memorysize_csharp) int

Amount of memory in MB your Lambda Function can use at runtime. Valid value between 128 MB to 32,768 MB (32 GB), in 1 MB increments. Defaults to 128.

[Name](#name_csharp) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

Unique name for your Lambda Function.

[PackageType](#packagetype_csharp) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

Lambda deployment package type. Valid values are `Zip` and `Image`. Defaults to `Zip`.

[Publish](#publish_csharp) bool

Whether to publish creation/change as new Lambda Function Version. Defaults to `false`.

[PublishTo](#publishto_csharp) string

Whether to publish to a alias or version number. Omit for regular version publishing. Option is `LATEST_PUBLISHED`.

[Region](#region_csharp) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[ReplaceSecurityGroupsOnDestroy](#replacesecuritygroupsondestroy_csharp) bool

Whether to replace the security groups on the function's VPC configuration prior to destruction. Default is `false`.

[ReplacementSecurityGroupIds](#replacementsecuritygroupids_csharp) List<string>

List of security group IDs to assign to the function's VPC configuration prior to destruction. Required if `replaceSecurityGroupsOnDestroy` is `true`.

[ReservedConcurrentExecutions](#reservedconcurrentexecutions_csharp) int

Amount of reserved concurrent executions for this lambda function. A value of `0` disables lambda from being triggered and `-1` removes any concurrency limitations. Defaults to Unreserved Concurrency Limits `-1`.

[Runtime](#runtime_csharp) string | [Pulumi.Aws.Lambda.Runtime](#runtime)

Identifier of the function's runtime. Required if `packageType` is `Zip`. See [Runtimes](https://docs.aws.amazon.com/lambda/latest/dg/API_CreateFunction.html#SSS-CreateFunction-request-Runtime) for valid values.

[S3Bucket](#s3bucket_csharp) string

S3 bucket location containing the function's deployment package. Conflicts with `filename` and `imageUri`. One of `filename`, `imageUri`, or `s3Bucket` must be specified.

[S3Key](#s3key_csharp) string

S3 key of an object containing the function's deployment package. Required if `s3Bucket` is set.

[S3ObjectVersion](#s3objectversion_csharp) string

Object version containing the function's deployment package. Conflicts with `filename` and `imageUri`.

[SkipDestroy](#skipdestroy_csharp) bool

Whether to retain the old version of a previously deployed Lambda Layer. Default is `false`.

[SnapStart](#snapstart_csharp) [FunctionSnapStart](#functionsnapstart)

Configuration block for snap start settings. See below.

[SourceCodeHash](#sourcecodehash_csharp) string

User-defined hash of the source code package file. Use this argument to trigger updates when the local function source code changes. This is a synthetic argument tracked only by the AWS provider and does not need to match the hashing algorithm used by Lambda to compute the `CodeSha256` response value. Out-of-band changes to the source code *will not* be captured by this argument. To include out-of-band source code changes as an update trigger, use the `codeSha256` argument instead.

[SourceKmsKeyArn](#sourcekmskeyarn_csharp) string

ARN of the AWS Key Management Service key used to encrypt the function's `.zip` deployment package. Conflicts with `imageUri`.

[Tags](#tags_csharp) Dictionary<string, string>

Key-value map of tags for the Lambda function. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[TenancyConfig](#tenancyconfig_csharp) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. [FunctionTenancyConfig](#functiontenancyconfig)

Configuration block for Tenancy. See below.

[Timeout](#timeout_csharp) int

Amount of time your Lambda Function has to run in seconds. Defaults to 3. Valid between 1 and 900.

[TracingConfig](#tracingconfig_csharp) [FunctionTracingConfig](#functiontracingconfig)

Configuration block for X-Ray tracing. See below.

[VpcConfig](#vpcconfig_csharp) [FunctionVpcConfig](#functionvpcconfig)

Configuration block for VPC. See below.

[Role](#role_go) This property is required. string

ARN of the function's execution role. The role provides the function's identity and access to AWS services and resources.

The following arguments are optional:

[Architectures](#architectures_go) \[\]string

Instruction set architecture for your Lambda function. Valid values are `["x8664"]` and `["arm64"]`. Default is `["x8664"]`. Removing this attribute, function's architecture stays the same.

[CapacityProviderConfig](#capacityproviderconfig_go) [FunctionCapacityProviderConfigArgs](#functioncapacityproviderconfig)

Configuration block for Lambda Capacity Provider. See below.

[Code](#code_go) pulumi.Archive

Path to the function's deployment package within the local filesystem. Conflicts with `imageUri` and `s3Bucket`. One of `filename`, `imageUri`, or `s3Bucket` must be specified.

[CodeSha256](#codesha256_go) string

Base64-encoded representation the source code package file. Use this argument to trigger updates when the function source code changes. For OCI, this value is relayed directly from the image digest. For zip files, this value is the Base64 encoded SHA-256 hash of the `.zip` file. Layers are not included in the calculation. To trigger updates using a non-standard hashing algorithm, use the `sourceCodeHash` argument instead.

[CodeSigningConfigArn](#codesigningconfigarn_go) string

ARN of a code-signing configuration to enable code signing for this function.

[DeadLetterConfig](#deadletterconfig_go) [FunctionDeadLetterConfigArgs](#functiondeadletterconfig)

Configuration block for dead letter queue. See below.

[Description](#description_go) string

Description of what your Lambda Function does.

[DurableConfig](#durableconfig_go) [FunctionDurableConfigArgs](#functiondurableconfig)

Configuration block for durable function settings. See below. `durableConfig` may only be available in [limited regions](https://builder.aws.com/build/capabilities), including `us-east-2`.

[Environment](#environment_go) [FunctionEnvironmentArgs](#functionenvironment)

Configuration block for environment variables. See below.

[EphemeralStorage](#ephemeralstorage_go) [FunctionEphemeralStorageArgs](#functionephemeralstorage)

Amount of ephemeral storage (`/tmp`) to allocate for the Lambda Function. See below.

[FileSystemConfig](#filesystemconfig_go) [FunctionFileSystemConfigArgs](#functionfilesystemconfig)

Configuration block for EFS or S3 Files file system. See below.

[Handler](#handler_go) string

Function entry point in your code. Required if `packageType` is `Zip`.

[ImageConfig](#imageconfig_go) [FunctionImageConfigArgs](#functionimageconfig)

Container image configuration values. See below.

[ImageUri](#imageuri_go) string

ECR image URI containing the function's deployment package. Conflicts with `filename` and `s3Bucket`. One of `filename`, `imageUri`, or `s3Bucket` must be specified.

[KmsKeyArn](#kmskeyarn_go) string

ARN of the AWS Key Management Service key used to encrypt environment variables. If not provided when environment variables are in use, AWS Lambda uses a default service key. If provided when environment variables are not in use, the AWS Lambda API does not save this configuration.

[Layers](#layers_go) \[\]string

List of Lambda Layer Version ARNs (maximum of 5) to attach to your Lambda Function.

[LoggingConfig](#loggingconfig_go) [FunctionLoggingConfigArgs](#functionloggingconfig)

Configuration block for advanced logging settings. See below.

[MemorySize](#memorysize_go) int

Amount of memory in MB your Lambda Function can use at runtime. Valid value between 128 MB to 32,768 MB (32 GB), in 1 MB increments. Defaults to 128.

[Name](#name_go) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

Unique name for your Lambda Function.

[PackageType](#packagetype_go) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

Lambda deployment package type. Valid values are `Zip` and `Image`. Defaults to `Zip`.

[Publish](#publish_go) bool

Whether to publish creation/change as new Lambda Function Version. Defaults to `false`.

[PublishTo](#publishto_go) string

Whether to publish to a alias or version number. Omit for regular version publishing. Option is `LATEST_PUBLISHED`.

[Region](#region_go) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[ReplaceSecurityGroupsOnDestroy](#replacesecuritygroupsondestroy_go) bool

Whether to replace the security groups on the function's VPC configuration prior to destruction. Default is `false`.

[ReplacementSecurityGroupIds](#replacementsecuritygroupids_go) \[\]string

List of security group IDs to assign to the function's VPC configuration prior to destruction. Required if `replaceSecurityGroupsOnDestroy` is `true`.

[ReservedConcurrentExecutions](#reservedconcurrentexecutions_go) int

Amount of reserved concurrent executions for this lambda function. A value of `0` disables lambda from being triggered and `-1` removes any concurrency limitations. Defaults to Unreserved Concurrency Limits `-1`.

[Runtime](#runtime_go) string | [Runtime](#runtime)

Identifier of the function's runtime. Required if `packageType` is `Zip`. See [Runtimes](https://docs.aws.amazon.com/lambda/latest/dg/API_CreateFunction.html#SSS-CreateFunction-request-Runtime) for valid values.

[S3Bucket](#s3bucket_go) string

S3 bucket location containing the function's deployment package. Conflicts with `filename` and `imageUri`. One of `filename`, `imageUri`, or `s3Bucket` must be specified.

[S3Key](#s3key_go) string

S3 key of an object containing the function's deployment package. Required if `s3Bucket` is set.

[S3ObjectVersion](#s3objectversion_go) string

Object version containing the function's deployment package. Conflicts with `filename` and `imageUri`.

[SkipDestroy](#skipdestroy_go) bool

Whether to retain the old version of a previously deployed Lambda Layer. Default is `false`.

[SnapStart](#snapstart_go) [FunctionSnapStartArgs](#functionsnapstart)

Configuration block for snap start settings. See below.

[SourceCodeHash](#sourcecodehash_go) string

User-defined hash of the source code package file. Use this argument to trigger updates when the local function source code changes. This is a synthetic argument tracked only by the AWS provider and does not need to match the hashing algorithm used by Lambda to compute the `CodeSha256` response value. Out-of-band changes to the source code *will not* be captured by this argument. To include out-of-band source code changes as an update trigger, use the `codeSha256` argument instead.

[SourceKmsKeyArn](#sourcekmskeyarn_go) string

ARN of the AWS Key Management Service key used to encrypt the function's `.zip` deployment package. Conflicts with `imageUri`.

[Tags](#tags_go) map\[string\]string

Key-value map of tags for the Lambda function. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[TenancyConfig](#tenancyconfig_go) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. [FunctionTenancyConfigArgs](#functiontenancyconfig)

Configuration block for Tenancy. See below.

[Timeout](#timeout_go) int

Amount of time your Lambda Function has to run in seconds. Defaults to 3. Valid between 1 and 900.

[TracingConfig](#tracingconfig_go) [FunctionTracingConfigArgs](#functiontracingconfig)

Configuration block for X-Ray tracing. See below.

[VpcConfig](#vpcconfig_go) [FunctionVpcConfigArgs](#functionvpcconfig)

Configuration block for VPC. See below.

[role](#role_hcl) This property is required. string

ARN of the function's execution role. The role provides the function's identity and access to AWS services and resources.

The following arguments are optional:

[architectures](#architectures_hcl) list(string)

Instruction set architecture for your Lambda function. Valid values are `["x8664"]` and `["arm64"]`. Default is `["x8664"]`. Removing this attribute, function's architecture stays the same.

[capacity\_provider\_config](#capacity_provider_config_hcl) [object](#functioncapacityproviderconfig)

Configuration block for Lambda Capacity Provider. See below.

[code](#code_hcl) archive

Path to the function's deployment package within the local filesystem. Conflicts with `imageUri` and `s3Bucket`. One of `filename`, `imageUri`, or `s3Bucket` must be specified.

[code\_sha256](#code_sha256_hcl) string

Base64-encoded representation the source code package file. Use this argument to trigger updates when the function source code changes. For OCI, this value is relayed directly from the image digest. For zip files, this value is the Base64 encoded SHA-256 hash of the `.zip` file. Layers are not included in the calculation. To trigger updates using a non-standard hashing algorithm, use the `sourceCodeHash` argument instead.

[code\_signing\_config\_arn](#code_signing_config_arn_hcl) string

ARN of a code-signing configuration to enable code signing for this function.

[dead\_letter\_config](#dead_letter_config_hcl) [object](#functiondeadletterconfig)

Configuration block for dead letter queue. See below.

[description](#description_hcl) string

Description of what your Lambda Function does.

[durable\_config](#durable_config_hcl) [object](#functiondurableconfig)

Configuration block for durable function settings. See below. `durableConfig` may only be available in [limited regions](https://builder.aws.com/build/capabilities), including `us-east-2`.

[environment](#environment_hcl) [object](#functionenvironment)

Configuration block for environment variables. See below.

[ephemeral\_storage](#ephemeral_storage_hcl) [object](#functionephemeralstorage)

Amount of ephemeral storage (`/tmp`) to allocate for the Lambda Function. See below.

[file\_system\_config](#file_system_config_hcl) [object](#functionfilesystemconfig)

Configuration block for EFS or S3 Files file system. See below.

[handler](#handler_hcl) string

Function entry point in your code. Required if `packageType` is `Zip`.

[image\_config](#image_config_hcl) [object](#functionimageconfig)

Container image configuration values. See below.

[image\_uri](#image_uri_hcl) string

ECR image URI containing the function's deployment package. Conflicts with `filename` and `s3Bucket`. One of `filename`, `imageUri`, or `s3Bucket` must be specified.

[kms\_key\_arn](#kms_key_arn_hcl) string

ARN of the AWS Key Management Service key used to encrypt environment variables. If not provided when environment variables are in use, AWS Lambda uses a default service key. If provided when environment variables are not in use, the AWS Lambda API does not save this configuration.

[layers](#layers_hcl) list(string)

List of Lambda Layer Version ARNs (maximum of 5) to attach to your Lambda Function.

[logging\_config](#logging_config_hcl) [object](#functionloggingconfig)

Configuration block for advanced logging settings. See below.

[memory\_size](#memory_size_hcl) number

Amount of memory in MB your Lambda Function can use at runtime. Valid value between 128 MB to 32,768 MB (32 GB), in 1 MB increments. Defaults to 128.

[name](#name_hcl) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

Unique name for your Lambda Function.

[package\_type](#package_type_hcl) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

Lambda deployment package type. Valid values are `Zip` and `Image`. Defaults to `Zip`.

[publish](#publish_hcl) bool

Whether to publish creation/change as new Lambda Function Version. Defaults to `false`.

[publish\_to](#publish_to_hcl) string

Whether to publish to a alias or version number. Omit for regular version publishing. Option is `LATEST_PUBLISHED`.

[region](#region_hcl) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[replace\_security\_groups\_on\_destroy](#replace_security_groups_on_destroy_hcl) bool

Whether to replace the security groups on the function's VPC configuration prior to destruction. Default is `false`.

[replacement\_security\_group\_ids](#replacement_security_group_ids_hcl) list(string)

List of security group IDs to assign to the function's VPC configuration prior to destruction. Required if `replaceSecurityGroupsOnDestroy` is `true`.

[reserved\_concurrent\_executions](#reserved_concurrent_executions_hcl) number

Amount of reserved concurrent executions for this lambda function. A value of `0` disables lambda from being triggered and `-1` removes any concurrency limitations. Defaults to Unreserved Concurrency Limits `-1`.

[runtime](#runtime_hcl) string | ["dotnet6" | "dotnet8" | "dotnet10" | "java11" | "java17" | "java21" | "java25" | "java8.al2" | "nodejs18.x" | "nodejs20.x" | "nodejs22.x" | "nodejs24.x" | "provided.al2" | "provided.al2023" | "python3.10" | "python3.11" | "python3.12" | "python3.13" | "python3.14" | "python3.9" | "ruby3.2" | "ruby3.3" | "ruby3.4" | "dotnet5.0" | "dotnet7" | "dotnetcore2.1" | "dotnetcore3.1" | "go1.x" | "java8" | "nodejs10.x" | "nodejs12.x" | "nodejs14.x" | "nodejs16.x" | "provided" | "python2.7" | "python3.6" | "python3.7" | "python3.8" | "ruby2.5" | "ruby2.7"](#runtime)

Identifier of the function's runtime. Required if `packageType` is `Zip`. See [Runtimes](https://docs.aws.amazon.com/lambda/latest/dg/API_CreateFunction.html#SSS-CreateFunction-request-Runtime) for valid values.

[s3\_bucket](#s3_bucket_hcl) string

S3 bucket location containing the function's deployment package. Conflicts with `filename` and `imageUri`. One of `filename`, `imageUri`, or `s3Bucket` must be specified.

[s3\_key](#s3_key_hcl) string

S3 key of an object containing the function's deployment package. Required if `s3Bucket` is set.

[s3\_object\_version](#s3_object_version_hcl) string

Object version containing the function's deployment package. Conflicts with `filename` and `imageUri`.

[skip\_destroy](#skip_destroy_hcl) bool

Whether to retain the old version of a previously deployed Lambda Layer. Default is `false`.

[snap\_start](#snap_start_hcl) [object](#functionsnapstart)

Configuration block for snap start settings. See below.

[source\_code\_hash](#source_code_hash_hcl) string

User-defined hash of the source code package file. Use this argument to trigger updates when the local function source code changes. This is a synthetic argument tracked only by the AWS provider and does not need to match the hashing algorithm used by Lambda to compute the `CodeSha256` response value. Out-of-band changes to the source code *will not* be captured by this argument. To include out-of-band source code changes as an update trigger, use the `codeSha256` argument instead.

[source\_kms\_key\_arn](#source_kms_key_arn_hcl) string

ARN of the AWS Key Management Service key used to encrypt the function's `.zip` deployment package. Conflicts with `imageUri`.

[tags](#tags_hcl) map(string)

Key-value map of tags for the Lambda function. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tenancy\_config](#tenancy_config_hcl) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. [object](#functiontenancyconfig)

Configuration block for Tenancy. See below.

[timeout](#timeout_hcl) number

Amount of time your Lambda Function has to run in seconds. Defaults to 3. Valid between 1 and 900.

[tracing\_config](#tracing_config_hcl) [object](#functiontracingconfig)

Configuration block for X-Ray tracing. See below.

[vpc\_config](#vpc_config_hcl) [object](#functionvpcconfig)

Configuration block for VPC. See below.

[role](#role_java) This property is required. String

ARN of the function's execution role. The role provides the function's identity and access to AWS services and resources.

The following arguments are optional:

[architectures](#architectures_java) List<String>

Instruction set architecture for your Lambda function. Valid values are `["x8664"]` and `["arm64"]`. Default is `["x8664"]`. Removing this attribute, function's architecture stays the same.

[capacityProviderConfig](#capacityproviderconfig_java) [FunctionCapacityProviderConfig](#functioncapacityproviderconfig)

Configuration block for Lambda Capacity Provider. See below.

[code](#code_java) Archive

Path to the function's deployment package within the local filesystem. Conflicts with `imageUri` and `s3Bucket`. One of `filename`, `imageUri`, or `s3Bucket` must be specified.

[codeSha256](#codesha256_java) String

Base64-encoded representation the source code package file. Use this argument to trigger updates when the function source code changes. For OCI, this value is relayed directly from the image digest. For zip files, this value is the Base64 encoded SHA-256 hash of the `.zip` file. Layers are not included in the calculation. To trigger updates using a non-standard hashing algorithm, use the `sourceCodeHash` argument instead.

[codeSigningConfigArn](#codesigningconfigarn_java) String

ARN of a code-signing configuration to enable code signing for this function.

[deadLetterConfig](#deadletterconfig_java) [FunctionDeadLetterConfig](#functiondeadletterconfig)

Configuration block for dead letter queue. See below.

[description](#description_java) String

Description of what your Lambda Function does.

[durableConfig](#durableconfig_java) [FunctionDurableConfig](#functiondurableconfig)

Configuration block for durable function settings. See below. `durableConfig` may only be available in [limited regions](https://builder.aws.com/build/capabilities), including `us-east-2`.

[environment](#environment_java) [FunctionEnvironment](#functionenvironment)

Configuration block for environment variables. See below.

[ephemeralStorage](#ephemeralstorage_java) [FunctionEphemeralStorage](#functionephemeralstorage)

Amount of ephemeral storage (`/tmp`) to allocate for the Lambda Function. See below.

[fileSystemConfig](#filesystemconfig_java) [FunctionFileSystemConfig](#functionfilesystemconfig)

Configuration block for EFS or S3 Files file system. See below.

[handler](#handler_java) String

Function entry point in your code. Required if `packageType` is `Zip`.

[imageConfig](#imageconfig_java) [FunctionImageConfig](#functionimageconfig)

Container image configuration values. See below.

[imageUri](#imageuri_java) String

ECR image URI containing the function's deployment package. Conflicts with `filename` and `s3Bucket`. One of `filename`, `imageUri`, or `s3Bucket` must be specified.

[kmsKeyArn](#kmskeyarn_java) String

ARN of the AWS Key Management Service key used to encrypt environment variables. If not provided when environment variables are in use, AWS Lambda uses a default service key. If provided when environment variables are not in use, the AWS Lambda API does not save this configuration.

[layers](#layers_java) List<String>

List of Lambda Layer Version ARNs (maximum of 5) to attach to your Lambda Function.

[loggingConfig](#loggingconfig_java) [FunctionLoggingConfig](#functionloggingconfig)

Configuration block for advanced logging settings. See below.

[memorySize](#memorysize_java) Integer

Amount of memory in MB your Lambda Function can use at runtime. Valid value between 128 MB to 32,768 MB (32 GB), in 1 MB increments. Defaults to 128.

[name](#name_java) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. String

Unique name for your Lambda Function.

[packageType](#packagetype_java) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. String

Lambda deployment package type. Valid values are `Zip` and `Image`. Defaults to `Zip`.

[publish](#publish_java) Boolean

Whether to publish creation/change as new Lambda Function Version. Defaults to `false`.

[publishTo](#publishto_java) String

Whether to publish to a alias or version number. Omit for regular version publishing. Option is `LATEST_PUBLISHED`.

[region](#region_java) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[replaceSecurityGroupsOnDestroy](#replacesecuritygroupsondestroy_java) Boolean

Whether to replace the security groups on the function's VPC configuration prior to destruction. Default is `false`.

[replacementSecurityGroupIds](#replacementsecuritygroupids_java) List<String>

List of security group IDs to assign to the function's VPC configuration prior to destruction. Required if `replaceSecurityGroupsOnDestroy` is `true`.

[reservedConcurrentExecutions](#reservedconcurrentexecutions_java) Integer

Amount of reserved concurrent executions for this lambda function. A value of `0` disables lambda from being triggered and `-1` removes any concurrency limitations. Defaults to Unreserved Concurrency Limits `-1`.

[runtime](#runtime_java) String | [Runtime](#runtime)

Identifier of the function's runtime. Required if `packageType` is `Zip`. See [Runtimes](https://docs.aws.amazon.com/lambda/latest/dg/API_CreateFunction.html#SSS-CreateFunction-request-Runtime) for valid values.

[s3Bucket](#s3bucket_java) String

S3 bucket location containing the function's deployment package. Conflicts with `filename` and `imageUri`. One of `filename`, `imageUri`, or `s3Bucket` must be specified.

[s3Key](#s3key_java) String

S3 key of an object containing the function's deployment package. Required if `s3Bucket` is set.

[s3ObjectVersion](#s3objectversion_java) String

Object version containing the function's deployment package. Conflicts with `filename` and `imageUri`.

[skipDestroy](#skipdestroy_java) Boolean

Whether to retain the old version of a previously deployed Lambda Layer. Default is `false`.

[snapStart](#snapstart_java) [FunctionSnapStart](#functionsnapstart)

Configuration block for snap start settings. See below.

[sourceCodeHash](#sourcecodehash_java) String

User-defined hash of the source code package file. Use this argument to trigger updates when the local function source code changes. This is a synthetic argument tracked only by the AWS provider and does not need to match the hashing algorithm used by Lambda to compute the `CodeSha256` response value. Out-of-band changes to the source code *will not* be captured by this argument. To include out-of-band source code changes as an update trigger, use the `codeSha256` argument instead.

[sourceKmsKeyArn](#sourcekmskeyarn_java) String

ARN of the AWS Key Management Service key used to encrypt the function's `.zip` deployment package. Conflicts with `imageUri`.

[tags](#tags_java) Map<String,String>

Key-value map of tags for the Lambda function. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tenancyConfig](#tenancyconfig_java) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. [FunctionTenancyConfig](#functiontenancyconfig)

Configuration block for Tenancy. See below.

[timeout](#timeout_java) Integer

Amount of time your Lambda Function has to run in seconds. Defaults to 3. Valid between 1 and 900.

[tracingConfig](#tracingconfig_java) [FunctionTracingConfig](#functiontracingconfig)

Configuration block for X-Ray tracing. See below.

[vpcConfig](#vpcconfig_java) [FunctionVpcConfig](#functionvpcconfig)

Configuration block for VPC. See below.

[role](#role_nodejs) This property is required. string

ARN of the function's execution role. The role provides the function's identity and access to AWS services and resources.

The following arguments are optional:

[architectures](#architectures_nodejs) string\[\]

Instruction set architecture for your Lambda function. Valid values are `["x8664"]` and `["arm64"]`. Default is `["x8664"]`. Removing this attribute, function's architecture stays the same.

[capacityProviderConfig](#capacityproviderconfig_nodejs) [FunctionCapacityProviderConfig](#functioncapacityproviderconfig)

Configuration block for Lambda Capacity Provider. See below.

[code](#code_nodejs) pulumi.asset.Archive

Path to the function's deployment package within the local filesystem. Conflicts with `imageUri` and `s3Bucket`. One of `filename`, `imageUri`, or `s3Bucket` must be specified.

[codeSha256](#codesha256_nodejs) string

Base64-encoded representation the source code package file. Use this argument to trigger updates when the function source code changes. For OCI, this value is relayed directly from the image digest. For zip files, this value is the Base64 encoded SHA-256 hash of the `.zip` file. Layers are not included in the calculation. To trigger updates using a non-standard hashing algorithm, use the `sourceCodeHash` argument instead.

[codeSigningConfigArn](#codesigningconfigarn_nodejs) string

ARN of a code-signing configuration to enable code signing for this function.

[deadLetterConfig](#deadletterconfig_nodejs) [FunctionDeadLetterConfig](#functiondeadletterconfig)

Configuration block for dead letter queue. See below.

[description](#description_nodejs) string

Description of what your Lambda Function does.

[durableConfig](#durableconfig_nodejs) [FunctionDurableConfig](#functiondurableconfig)

Configuration block for durable function settings. See below. `durableConfig` may only be available in [limited regions](https://builder.aws.com/build/capabilities), including `us-east-2`.

[environment](#environment_nodejs) [FunctionEnvironment](#functionenvironment)

Configuration block for environment variables. See below.

[ephemeralStorage](#ephemeralstorage_nodejs) [FunctionEphemeralStorage](#functionephemeralstorage)

Amount of ephemeral storage (`/tmp`) to allocate for the Lambda Function. See below.

[fileSystemConfig](#filesystemconfig_nodejs) [FunctionFileSystemConfig](#functionfilesystemconfig)

Configuration block for EFS or S3 Files file system. See below.

[handler](#handler_nodejs) string

Function entry point in your code. Required if `packageType` is `Zip`.

[imageConfig](#imageconfig_nodejs) [FunctionImageConfig](#functionimageconfig)

Container image configuration values. See below.

[imageUri](#imageuri_nodejs) string

ECR image URI containing the function's deployment package. Conflicts with `filename` and `s3Bucket`. One of `filename`, `imageUri`, or `s3Bucket` must be specified.

[kmsKeyArn](#kmskeyarn_nodejs) string

ARN of the AWS Key Management Service key used to encrypt environment variables. If not provided when environment variables are in use, AWS Lambda uses a default service key. If provided when environment variables are not in use, the AWS Lambda API does not save this configuration.

[layers](#layers_nodejs) string\[\]

List of Lambda Layer Version ARNs (maximum of 5) to attach to your Lambda Function.

[loggingConfig](#loggingconfig_nodejs) [FunctionLoggingConfig](#functionloggingconfig)

Configuration block for advanced logging settings. See below.

[memorySize](#memorysize_nodejs) number

Amount of memory in MB your Lambda Function can use at runtime. Valid value between 128 MB to 32,768 MB (32 GB), in 1 MB increments. Defaults to 128.

[name](#name_nodejs) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

Unique name for your Lambda Function.

[packageType](#packagetype_nodejs) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

Lambda deployment package type. Valid values are `Zip` and `Image`. Defaults to `Zip`.

[publish](#publish_nodejs) boolean

Whether to publish creation/change as new Lambda Function Version. Defaults to `false`.

[publishTo](#publishto_nodejs) string

Whether to publish to a alias or version number. Omit for regular version publishing. Option is `LATEST_PUBLISHED`.

[region](#region_nodejs) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[replaceSecurityGroupsOnDestroy](#replacesecuritygroupsondestroy_nodejs) boolean

Whether to replace the security groups on the function's VPC configuration prior to destruction. Default is `false`.

[replacementSecurityGroupIds](#replacementsecuritygroupids_nodejs) string\[\]

List of security group IDs to assign to the function's VPC configuration prior to destruction. Required if `replaceSecurityGroupsOnDestroy` is `true`.

[reservedConcurrentExecutions](#reservedconcurrentexecutions_nodejs) number

Amount of reserved concurrent executions for this lambda function. A value of `0` disables lambda from being triggered and `-1` removes any concurrency limitations. Defaults to Unreserved Concurrency Limits `-1`.

[runtime](#runtime_nodejs) string | [Runtime](#runtime)

Identifier of the function's runtime. Required if `packageType` is `Zip`. See [Runtimes](https://docs.aws.amazon.com/lambda/latest/dg/API_CreateFunction.html#SSS-CreateFunction-request-Runtime) for valid values.

[s3Bucket](#s3bucket_nodejs) string

S3 bucket location containing the function's deployment package. Conflicts with `filename` and `imageUri`. One of `filename`, `imageUri`, or `s3Bucket` must be specified.

[s3Key](#s3key_nodejs) string

S3 key of an object containing the function's deployment package. Required if `s3Bucket` is set.

[s3ObjectVersion](#s3objectversion_nodejs) string

Object version containing the function's deployment package. Conflicts with `filename` and `imageUri`.

[skipDestroy](#skipdestroy_nodejs) boolean

Whether to retain the old version of a previously deployed Lambda Layer. Default is `false`.

[snapStart](#snapstart_nodejs) [FunctionSnapStart](#functionsnapstart)

Configuration block for snap start settings. See below.

[sourceCodeHash](#sourcecodehash_nodejs) string

User-defined hash of the source code package file. Use this argument to trigger updates when the local function source code changes. This is a synthetic argument tracked only by the AWS provider and does not need to match the hashing algorithm used by Lambda to compute the `CodeSha256` response value. Out-of-band changes to the source code *will not* be captured by this argument. To include out-of-band source code changes as an update trigger, use the `codeSha256` argument instead.

[sourceKmsKeyArn](#sourcekmskeyarn_nodejs) string

ARN of the AWS Key Management Service key used to encrypt the function's `.zip` deployment package. Conflicts with `imageUri`.

[tags](#tags_nodejs) {\[key: string\]: string}

Key-value map of tags for the Lambda function. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tenancyConfig](#tenancyconfig_nodejs) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. [FunctionTenancyConfig](#functiontenancyconfig)

Configuration block for Tenancy. See below.

[timeout](#timeout_nodejs) number

Amount of time your Lambda Function has to run in seconds. Defaults to 3. Valid between 1 and 900.

[tracingConfig](#tracingconfig_nodejs) [FunctionTracingConfig](#functiontracingconfig)

Configuration block for X-Ray tracing. See below.

[vpcConfig](#vpcconfig_nodejs) [FunctionVpcConfig](#functionvpcconfig)

Configuration block for VPC. See below.

[role](#role_python) This property is required. str

ARN of the function's execution role. The role provides the function's identity and access to AWS services and resources.

The following arguments are optional:

[architectures](#architectures_python) Sequence\[str\]

Instruction set architecture for your Lambda function. Valid values are `["x8664"]` and `["arm64"]`. Default is `["x8664"]`. Removing this attribute, function's architecture stays the same.

[capacity\_provider\_config](#capacity_provider_config_python) [FunctionCapacityProviderConfigArgs](#functioncapacityproviderconfig)

Configuration block for Lambda Capacity Provider. See below.

[code](#code_python) pulumi.Archive

Path to the function's deployment package within the local filesystem. Conflicts with `imageUri` and `s3Bucket`. One of `filename`, `imageUri`, or `s3Bucket` must be specified.

[code\_sha256](#code_sha256_python) str

Base64-encoded representation the source code package file. Use this argument to trigger updates when the function source code changes. For OCI, this value is relayed directly from the image digest. For zip files, this value is the Base64 encoded SHA-256 hash of the `.zip` file. Layers are not included in the calculation. To trigger updates using a non-standard hashing algorithm, use the `sourceCodeHash` argument instead.

[code\_signing\_config\_arn](#code_signing_config_arn_python) str

ARN of a code-signing configuration to enable code signing for this function.

[dead\_letter\_config](#dead_letter_config_python) [FunctionDeadLetterConfigArgs](#functiondeadletterconfig)

Configuration block for dead letter queue. See below.

[description](#description_python) str

Description of what your Lambda Function does.

[durable\_config](#durable_config_python) [FunctionDurableConfigArgs](#functiondurableconfig)

Configuration block for durable function settings. See below. `durableConfig` may only be available in [limited regions](https://builder.aws.com/build/capabilities), including `us-east-2`.

[environment](#environment_python) [FunctionEnvironmentArgs](#functionenvironment)

Configuration block for environment variables. See below.

[ephemeral\_storage](#ephemeral_storage_python) [FunctionEphemeralStorageArgs](#functionephemeralstorage)

Amount of ephemeral storage (`/tmp`) to allocate for the Lambda Function. See below.

[file\_system\_config](#file_system_config_python) [FunctionFileSystemConfigArgs](#functionfilesystemconfig)

Configuration block for EFS or S3 Files file system. See below.

[handler](#handler_python) str

Function entry point in your code. Required if `packageType` is `Zip`.

[image\_config](#image_config_python) [FunctionImageConfigArgs](#functionimageconfig)

Container image configuration values. See below.

[image\_uri](#image_uri_python) str

ECR image URI containing the function's deployment package. Conflicts with `filename` and `s3Bucket`. One of `filename`, `imageUri`, or `s3Bucket` must be specified.

[kms\_key\_arn](#kms_key_arn_python) str

ARN of the AWS Key Management Service key used to encrypt environment variables. If not provided when environment variables are in use, AWS Lambda uses a default service key. If provided when environment variables are not in use, the AWS Lambda API does not save this configuration.

[layers](#layers_python) Sequence\[str\]

List of Lambda Layer Version ARNs (maximum of 5) to attach to your Lambda Function.

[logging\_config](#logging_config_python) [FunctionLoggingConfigArgs](#functionloggingconfig)

Configuration block for advanced logging settings. See below.

[memory\_size](#memory_size_python) int

Amount of memory in MB your Lambda Function can use at runtime. Valid value between 128 MB to 32,768 MB (32 GB), in 1 MB increments. Defaults to 128.

[name](#name_python) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. str

Unique name for your Lambda Function.

[package\_type](#package_type_python) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. str

Lambda deployment package type. Valid values are `Zip` and `Image`. Defaults to `Zip`.

[publish](#publish_python) bool

Whether to publish creation/change as new Lambda Function Version. Defaults to `false`.

[publish\_to](#publish_to_python) str

Whether to publish to a alias or version number. Omit for regular version publishing. Option is `LATEST_PUBLISHED`.

[region](#region_python) str

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[replace\_security\_groups\_on\_destroy](#replace_security_groups_on_destroy_python) bool

Whether to replace the security groups on the function's VPC configuration prior to destruction. Default is `false`.

[replacement\_security\_group\_ids](#replacement_security_group_ids_python) Sequence\[str\]

List of security group IDs to assign to the function's VPC configuration prior to destruction. Required if `replaceSecurityGroupsOnDestroy` is `true`.

[reserved\_concurrent\_executions](#reserved_concurrent_executions_python) int

Amount of reserved concurrent executions for this lambda function. A value of `0` disables lambda from being triggered and `-1` removes any concurrency limitations. Defaults to Unreserved Concurrency Limits `-1`.

[runtime](#runtime_python) str | [Runtime](#runtime)

Identifier of the function's runtime. Required if `packageType` is `Zip`. See [Runtimes](https://docs.aws.amazon.com/lambda/latest/dg/API_CreateFunction.html#SSS-CreateFunction-request-Runtime) for valid values.

[s3\_bucket](#s3_bucket_python) str

S3 bucket location containing the function's deployment package. Conflicts with `filename` and `imageUri`. One of `filename`, `imageUri`, or `s3Bucket` must be specified.

[s3\_key](#s3_key_python) str

S3 key of an object containing the function's deployment package. Required if `s3Bucket` is set.

[s3\_object\_version](#s3_object_version_python) str

Object version containing the function's deployment package. Conflicts with `filename` and `imageUri`.

[skip\_destroy](#skip_destroy_python) bool

Whether to retain the old version of a previously deployed Lambda Layer. Default is `false`.

[snap\_start](#snap_start_python) [FunctionSnapStartArgs](#functionsnapstart)

Configuration block for snap start settings. See below.

[source\_code\_hash](#source_code_hash_python) str

User-defined hash of the source code package file. Use this argument to trigger updates when the local function source code changes. This is a synthetic argument tracked only by the AWS provider and does not need to match the hashing algorithm used by Lambda to compute the `CodeSha256` response value. Out-of-band changes to the source code *will not* be captured by this argument. To include out-of-band source code changes as an update trigger, use the `codeSha256` argument instead.

[source\_kms\_key\_arn](#source_kms_key_arn_python) str

ARN of the AWS Key Management Service key used to encrypt the function's `.zip` deployment package. Conflicts with `imageUri`.

[tags](#tags_python) Mapping\[str, str\]

Key-value map of tags for the Lambda function. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tenancy\_config](#tenancy_config_python) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. [FunctionTenancyConfigArgs](#functiontenancyconfig)

Configuration block for Tenancy. See below.

[timeout](#timeout_python) int

Amount of time your Lambda Function has to run in seconds. Defaults to 3. Valid between 1 and 900.

[tracing\_config](#tracing_config_python) [FunctionTracingConfigArgs](#functiontracingconfig)

Configuration block for X-Ray tracing. See below.

[vpc\_config](#vpc_config_python) [FunctionVpcConfigArgs](#functionvpcconfig)

Configuration block for VPC. See below.

[role](#role_yaml) This property is required. String

ARN of the function's execution role. The role provides the function's identity and access to AWS services and resources.

The following arguments are optional:

[architectures](#architectures_yaml) List<String>

Instruction set architecture for your Lambda function. Valid values are `["x8664"]` and `["arm64"]`. Default is `["x8664"]`. Removing this attribute, function's architecture stays the same.

[capacityProviderConfig](#capacityproviderconfig_yaml) [Property Map](#functioncapacityproviderconfig)

Configuration block for Lambda Capacity Provider. See below.

[code](#code_yaml) Archive

Path to the function's deployment package within the local filesystem. Conflicts with `imageUri` and `s3Bucket`. One of `filename`, `imageUri`, or `s3Bucket` must be specified.

[codeSha256](#codesha256_yaml) String

Base64-encoded representation the source code package file. Use this argument to trigger updates when the function source code changes. For OCI, this value is relayed directly from the image digest. For zip files, this value is the Base64 encoded SHA-256 hash of the `.zip` file. Layers are not included in the calculation. To trigger updates using a non-standard hashing algorithm, use the `sourceCodeHash` argument instead.

[codeSigningConfigArn](#codesigningconfigarn_yaml) String

ARN of a code-signing configuration to enable code signing for this function.

[deadLetterConfig](#deadletterconfig_yaml) [Property Map](#functiondeadletterconfig)

Configuration block for dead letter queue. See below.

[description](#description_yaml) String

Description of what your Lambda Function does.

[durableConfig](#durableconfig_yaml) [Property Map](#functiondurableconfig)

Configuration block for durable function settings. See below. `durableConfig` may only be available in [limited regions](https://builder.aws.com/build/capabilities), including `us-east-2`.

[environment](#environment_yaml) [Property Map](#functionenvironment)

Configuration block for environment variables. See below.

[ephemeralStorage](#ephemeralstorage_yaml) [Property Map](#functionephemeralstorage)

Amount of ephemeral storage (`/tmp`) to allocate for the Lambda Function. See below.

[fileSystemConfig](#filesystemconfig_yaml) [Property Map](#functionfilesystemconfig)

Configuration block for EFS or S3 Files file system. See below.

[handler](#handler_yaml) String

Function entry point in your code. Required if `packageType` is `Zip`.

[imageConfig](#imageconfig_yaml) [Property Map](#functionimageconfig)

Container image configuration values. See below.

[imageUri](#imageuri_yaml) String

ECR image URI containing the function's deployment package. Conflicts with `filename` and `s3Bucket`. One of `filename`, `imageUri`, or `s3Bucket` must be specified.

[kmsKeyArn](#kmskeyarn_yaml) String

ARN of the AWS Key Management Service key used to encrypt environment variables. If not provided when environment variables are in use, AWS Lambda uses a default service key. If provided when environment variables are not in use, the AWS Lambda API does not save this configuration.

[layers](#layers_yaml) List<String>

List of Lambda Layer Version ARNs (maximum of 5) to attach to your Lambda Function.

[loggingConfig](#loggingconfig_yaml) [Property Map](#functionloggingconfig)

Configuration block for advanced logging settings. See below.

[memorySize](#memorysize_yaml) Number

Amount of memory in MB your Lambda Function can use at runtime. Valid value between 128 MB to 32,768 MB (32 GB), in 1 MB increments. Defaults to 128.

[name](#name_yaml) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. String

Unique name for your Lambda Function.

[packageType](#packagetype_yaml) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. String

Lambda deployment package type. Valid values are `Zip` and `Image`. Defaults to `Zip`.

[publish](#publish_yaml) Boolean

Whether to publish creation/change as new Lambda Function Version. Defaults to `false`.

[publishTo](#publishto_yaml) String

Whether to publish to a alias or version number. Omit for regular version publishing. Option is `LATEST_PUBLISHED`.

[region](#region_yaml) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[replaceSecurityGroupsOnDestroy](#replacesecuritygroupsondestroy_yaml) Boolean

Whether to replace the security groups on the function's VPC configuration prior to destruction. Default is `false`.

[replacementSecurityGroupIds](#replacementsecuritygroupids_yaml) List<String>

List of security group IDs to assign to the function's VPC configuration prior to destruction. Required if `replaceSecurityGroupsOnDestroy` is `true`.

[reservedConcurrentExecutions](#reservedconcurrentexecutions_yaml) Number

Amount of reserved concurrent executions for this lambda function. A value of `0` disables lambda from being triggered and `-1` removes any concurrency limitations. Defaults to Unreserved Concurrency Limits `-1`.

[runtime](#runtime_yaml) String | ["dotnet6" | "dotnet8" | "dotnet10" | "java11" | "java17" | "java21" | "java25" | "java8.al2" | "nodejs18.x" | "nodejs20.x" | "nodejs22.x" | "nodejs24.x" | "provided.al2" | "provided.al2023" | "python3.10" | "python3.11" | "python3.12" | "python3.13" | "python3.14" | "python3.9" | "ruby3.2" | "ruby3.3" | "ruby3.4" | "dotnet5.0" | "dotnet7" | "dotnetcore2.1" | "dotnetcore3.1" | "go1.x" | "java8" | "nodejs10.x" | "nodejs12.x" | "nodejs14.x" | "nodejs16.x" | "provided" | "python2.7" | "python3.6" | "python3.7" | "python3.8" | "ruby2.5" | "ruby2.7"](#runtime)

Identifier of the function's runtime. Required if `packageType` is `Zip`. See [Runtimes](https://docs.aws.amazon.com/lambda/latest/dg/API_CreateFunction.html#SSS-CreateFunction-request-Runtime) for valid values.

[s3Bucket](#s3bucket_yaml) String

S3 bucket location containing the function's deployment package. Conflicts with `filename` and `imageUri`. One of `filename`, `imageUri`, or `s3Bucket` must be specified.

[s3Key](#s3key_yaml) String

S3 key of an object containing the function's deployment package. Required if `s3Bucket` is set.

[s3ObjectVersion](#s3objectversion_yaml) String

Object version containing the function's deployment package. Conflicts with `filename` and `imageUri`.

[skipDestroy](#skipdestroy_yaml) Boolean

Whether to retain the old version of a previously deployed Lambda Layer. Default is `false`.

[snapStart](#snapstart_yaml) [Property Map](#functionsnapstart)

Configuration block for snap start settings. See below.

[sourceCodeHash](#sourcecodehash_yaml) String

User-defined hash of the source code package file. Use this argument to trigger updates when the local function source code changes. This is a synthetic argument tracked only by the AWS provider and does not need to match the hashing algorithm used by Lambda to compute the `CodeSha256` response value. Out-of-band changes to the source code *will not* be captured by this argument. To include out-of-band source code changes as an update trigger, use the `codeSha256` argument instead.

[sourceKmsKeyArn](#sourcekmskeyarn_yaml) String

ARN of the AWS Key Management Service key used to encrypt the function's `.zip` deployment package. Conflicts with `imageUri`.

[tags](#tags_yaml) Map<String>

Key-value map of tags for the Lambda function. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tenancyConfig](#tenancyconfig_yaml) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. [Property Map](#functiontenancyconfig)

Configuration block for Tenancy. See below.

[timeout](#timeout_yaml) Number

Amount of time your Lambda Function has to run in seconds. Defaults to 3. Valid between 1 and 900.

[tracingConfig](#tracingconfig_yaml) [Property Map](#functiontracingconfig)

Configuration block for X-Ray tracing. See below.

[vpcConfig](#vpcconfig_yaml) [Property Map](#functionvpcconfig)

Configuration block for VPC. See below.

### Outputs[](#outputs)

All [input](#inputs) properties are implicitly available as output properties. Additionally, the Function resource produces the following output properties:

[Arn](#arn_csharp) string

ARN identifying your Lambda Function.

[Id](#id_csharp) string

The provider-assigned unique ID for this managed resource.

[InvokeArn](#invokearn_csharp) string

ARN to be used for invoking Lambda Function from API Gateway - to be used in `aws.apigateway.Integration`'s `uri`.

[LastModified](#lastmodified_csharp) string

Date this resource was last modified.

[QualifiedArn](#qualifiedarn_csharp) string

ARN identifying your Lambda Function Version (if versioning is enabled via `publish = true`).

[QualifiedInvokeArn](#qualifiedinvokearn_csharp) string

Qualified ARN (ARN with lambda version number) to be used for invoking Lambda Function from API Gateway - to be used in `aws.apigateway.Integration`'s `uri`.

[ResponseStreamingInvokeArn](#responsestreaminginvokearn_csharp) string

ARN to be used for invoking Lambda Function from API Gateway with response streaming - to be used in `aws.apigateway.Integration`'s `uri`.

[SigningJobArn](#signingjobarn_csharp) string

ARN of the signing job.

[SigningProfileVersionArn](#signingprofileversionarn_csharp) string

ARN of the signing profile version.

[SourceCodeSize](#sourcecodesize_csharp) int

Size in bytes of the function .zip file.

[TagsAll](#tagsall_csharp) Dictionary<string, string>

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[Version](#version_csharp) string

Latest published version of your Lambda Function.

[Arn](#arn_go) string

ARN identifying your Lambda Function.

[Id](#id_go) string

The provider-assigned unique ID for this managed resource.

[InvokeArn](#invokearn_go) string

ARN to be used for invoking Lambda Function from API Gateway - to be used in `aws.apigateway.Integration`'s `uri`.

[LastModified](#lastmodified_go) string

Date this resource was last modified.

[QualifiedArn](#qualifiedarn_go) string

ARN identifying your Lambda Function Version (if versioning is enabled via `publish = true`).

[QualifiedInvokeArn](#qualifiedinvokearn_go) string

Qualified ARN (ARN with lambda version number) to be used for invoking Lambda Function from API Gateway - to be used in `aws.apigateway.Integration`'s `uri`.

[ResponseStreamingInvokeArn](#responsestreaminginvokearn_go) string

ARN to be used for invoking Lambda Function from API Gateway with response streaming - to be used in `aws.apigateway.Integration`'s `uri`.

[SigningJobArn](#signingjobarn_go) string

ARN of the signing job.

[SigningProfileVersionArn](#signingprofileversionarn_go) string

ARN of the signing profile version.

[SourceCodeSize](#sourcecodesize_go) int

Size in bytes of the function .zip file.

[TagsAll](#tagsall_go) map\[string\]string

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[Version](#version_go) string

Latest published version of your Lambda Function.

[arn](#arn_hcl) string

ARN identifying your Lambda Function.

[id](#id_hcl) string

The provider-assigned unique ID for this managed resource.

[invoke\_arn](#invoke_arn_hcl) string

ARN to be used for invoking Lambda Function from API Gateway - to be used in `aws.apigateway.Integration`'s `uri`.

[last\_modified](#last_modified_hcl) string

Date this resource was last modified.

[qualified\_arn](#qualified_arn_hcl) string

ARN identifying your Lambda Function Version (if versioning is enabled via `publish = true`).

[qualified\_invoke\_arn](#qualified_invoke_arn_hcl) string

Qualified ARN (ARN with lambda version number) to be used for invoking Lambda Function from API Gateway - to be used in `aws.apigateway.Integration`'s `uri`.

[response\_streaming\_invoke\_arn](#response_streaming_invoke_arn_hcl) string

ARN to be used for invoking Lambda Function from API Gateway with response streaming - to be used in `aws.apigateway.Integration`'s `uri`.

[signing\_job\_arn](#signing_job_arn_hcl) string

ARN of the signing job.

[signing\_profile\_version\_arn](#signing_profile_version_arn_hcl) string

ARN of the signing profile version.

[source\_code\_size](#source_code_size_hcl) number

Size in bytes of the function .zip file.

[tags\_all](#tags_all_hcl) map(string)

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[version](#version_hcl) string

Latest published version of your Lambda Function.

[arn](#arn_java) String

ARN identifying your Lambda Function.

[id](#id_java) String

The provider-assigned unique ID for this managed resource.

[invokeArn](#invokearn_java) String

ARN to be used for invoking Lambda Function from API Gateway - to be used in `aws.apigateway.Integration`'s `uri`.

[lastModified](#lastmodified_java) String

Date this resource was last modified.

[qualifiedArn](#qualifiedarn_java) String

ARN identifying your Lambda Function Version (if versioning is enabled via `publish = true`).

[qualifiedInvokeArn](#qualifiedinvokearn_java) String

Qualified ARN (ARN with lambda version number) to be used for invoking Lambda Function from API Gateway - to be used in `aws.apigateway.Integration`'s `uri`.

[responseStreamingInvokeArn](#responsestreaminginvokearn_java) String

ARN to be used for invoking Lambda Function from API Gateway with response streaming - to be used in `aws.apigateway.Integration`'s `uri`.

[signingJobArn](#signingjobarn_java) String

ARN of the signing job.

[signingProfileVersionArn](#signingprofileversionarn_java) String

ARN of the signing profile version.

[sourceCodeSize](#sourcecodesize_java) Integer

Size in bytes of the function .zip file.

[tagsAll](#tagsall_java) Map<String,String>

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[version](#version_java) String

Latest published version of your Lambda Function.

[arn](#arn_nodejs) string

ARN identifying your Lambda Function.

[id](#id_nodejs) string

The provider-assigned unique ID for this managed resource.

[invokeArn](#invokearn_nodejs) string

ARN to be used for invoking Lambda Function from API Gateway - to be used in `aws.apigateway.Integration`'s `uri`.

[lastModified](#lastmodified_nodejs) string

Date this resource was last modified.

[qualifiedArn](#qualifiedarn_nodejs) string

ARN identifying your Lambda Function Version (if versioning is enabled via `publish = true`).

[qualifiedInvokeArn](#qualifiedinvokearn_nodejs) string

Qualified ARN (ARN with lambda version number) to be used for invoking Lambda Function from API Gateway - to be used in `aws.apigateway.Integration`'s `uri`.

[responseStreamingInvokeArn](#responsestreaminginvokearn_nodejs) string

ARN to be used for invoking Lambda Function from API Gateway with response streaming - to be used in `aws.apigateway.Integration`'s `uri`.

[signingJobArn](#signingjobarn_nodejs) string

ARN of the signing job.

[signingProfileVersionArn](#signingprofileversionarn_nodejs) string

ARN of the signing profile version.

[sourceCodeSize](#sourcecodesize_nodejs) number

Size in bytes of the function .zip file.

[tagsAll](#tagsall_nodejs) {\[key: string\]: string}

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[version](#version_nodejs) string

Latest published version of your Lambda Function.

[arn](#arn_python) str

ARN identifying your Lambda Function.

[id](#id_python) str

The provider-assigned unique ID for this managed resource.

[invoke\_arn](#invoke_arn_python) str

ARN to be used for invoking Lambda Function from API Gateway - to be used in `aws.apigateway.Integration`'s `uri`.

[last\_modified](#last_modified_python) str

Date this resource was last modified.

[qualified\_arn](#qualified_arn_python) str

ARN identifying your Lambda Function Version (if versioning is enabled via `publish = true`).

[qualified\_invoke\_arn](#qualified_invoke_arn_python) str

Qualified ARN (ARN with lambda version number) to be used for invoking Lambda Function from API Gateway - to be used in `aws.apigateway.Integration`'s `uri`.

[response\_streaming\_invoke\_arn](#response_streaming_invoke_arn_python) str

ARN to be used for invoking Lambda Function from API Gateway with response streaming - to be used in `aws.apigateway.Integration`'s `uri`.

[signing\_job\_arn](#signing_job_arn_python) str

ARN of the signing job.

[signing\_profile\_version\_arn](#signing_profile_version_arn_python) str

ARN of the signing profile version.

[source\_code\_size](#source_code_size_python) int

Size in bytes of the function .zip file.

[tags\_all](#tags_all_python) Mapping\[str, str\]

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[version](#version_python) str

Latest published version of your Lambda Function.

[arn](#arn_yaml) String

ARN identifying your Lambda Function.

[id](#id_yaml) String

The provider-assigned unique ID for this managed resource.

[invokeArn](#invokearn_yaml) String

ARN to be used for invoking Lambda Function from API Gateway - to be used in `aws.apigateway.Integration`'s `uri`.

[lastModified](#lastmodified_yaml) String

Date this resource was last modified.

[qualifiedArn](#qualifiedarn_yaml) String

ARN identifying your Lambda Function Version (if versioning is enabled via `publish = true`).

[qualifiedInvokeArn](#qualifiedinvokearn_yaml) String

Qualified ARN (ARN with lambda version number) to be used for invoking Lambda Function from API Gateway - to be used in `aws.apigateway.Integration`'s `uri`.

[responseStreamingInvokeArn](#responsestreaminginvokearn_yaml) String

ARN to be used for invoking Lambda Function from API Gateway with response streaming - to be used in `aws.apigateway.Integration`'s `uri`.

[signingJobArn](#signingjobarn_yaml) String

ARN of the signing job.

[signingProfileVersionArn](#signingprofileversionarn_yaml) String

ARN of the signing profile version.

[sourceCodeSize](#sourcecodesize_yaml) Number

Size in bytes of the function .zip file.

[tagsAll](#tagsall_yaml) Map<String>

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[version](#version_yaml) String

Latest published version of your Lambda Function.

## Look up Existing Function Resource[](#look-up)

Get an existing Function resource’s state with the given name, ID, and optional extra properties used to qualify the lookup.

```typescript
public static get(name: string, id: Input<ID>, state?: FunctionState, opts?: CustomResourceOptions): Function
```

```python
@staticmethod
def get(resource_name: str,
        id: str,
        opts: Optional[ResourceOptions] = None,
        architectures: Optional[Sequence[str]] = None,
        arn: Optional[str] = None,
        capacity_provider_config: Optional[FunctionCapacityProviderConfigArgs] = None,
        code: Optional[pulumi.Archive] = None,
        code_sha256: Optional[str] = None,
        code_signing_config_arn: Optional[str] = None,
        dead_letter_config: Optional[FunctionDeadLetterConfigArgs] = None,
        description: Optional[str] = None,
        durable_config: Optional[FunctionDurableConfigArgs] = None,
        environment: Optional[FunctionEnvironmentArgs] = None,
        ephemeral_storage: Optional[FunctionEphemeralStorageArgs] = None,
        file_system_config: Optional[FunctionFileSystemConfigArgs] = None,
        handler: Optional[str] = None,
        image_config: Optional[FunctionImageConfigArgs] = None,
        image_uri: Optional[str] = None,
        invoke_arn: Optional[str] = None,
        kms_key_arn: Optional[str] = None,
        last_modified: Optional[str] = None,
        layers: Optional[Sequence[str]] = None,
        logging_config: Optional[FunctionLoggingConfigArgs] = None,
        memory_size: Optional[int] = None,
        name: Optional[str] = None,
        package_type: Optional[str] = None,
        publish: Optional[bool] = None,
        publish_to: Optional[str] = None,
        qualified_arn: Optional[str] = None,
        qualified_invoke_arn: Optional[str] = None,
        region: Optional[str] = None,
        replace_security_groups_on_destroy: Optional[bool] = None,
        replacement_security_group_ids: Optional[Sequence[str]] = None,
        reserved_concurrent_executions: Optional[int] = None,
        response_streaming_invoke_arn: Optional[str] = None,
        role: Optional[str] = None,
        runtime: Optional[Union[str, Runtime]] = None,
        s3_bucket: Optional[str] = None,
        s3_key: Optional[str] = None,
        s3_object_version: Optional[str] = None,
        signing_job_arn: Optional[str] = None,
        signing_profile_version_arn: Optional[str] = None,
        skip_destroy: Optional[bool] = None,
        snap_start: Optional[FunctionSnapStartArgs] = None,
        source_code_hash: Optional[str] = None,
        source_code_size: Optional[int] = None,
        source_kms_key_arn: Optional[str] = None,
        tags: Optional[Mapping[str, str]] = None,
        tags_all: Optional[Mapping[str, str]] = None,
        tenancy_config: Optional[FunctionTenancyConfigArgs] = None,
        timeout: Optional[int] = None,
        tracing_config: Optional[FunctionTracingConfigArgs] = None,
        version: Optional[str] = None,
        vpc_config: Optional[FunctionVpcConfigArgs] = None) -> Function
```

```go
func GetFunction(ctx *Context, name string, id IDInput, state *FunctionState, opts ...ResourceOption) (*Function, error)
```

```csharp
public static Function Get(string name, Input<string> id, FunctionState? state, CustomResourceOptions? opts = null)
```

```java
public static Function get(String name, Output<String> id, FunctionState state, CustomResourceOptions options)
```

```yaml
resources:  _:    type: aws:lambda:Function    get:      id: ${id}
```

```hcl
import {
  to = aws_lambda_function.example
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

[Architectures](#state_architectures_csharp) List<string>

Instruction set architecture for your Lambda function. Valid values are `["x8664"]` and `["arm64"]`. Default is `["x8664"]`. Removing this attribute, function's architecture stays the same.

[Arn](#state_arn_csharp) string

ARN identifying your Lambda Function.

[CapacityProviderConfig](#state_capacityproviderconfig_csharp) [FunctionCapacityProviderConfig](#functioncapacityproviderconfig)

Configuration block for Lambda Capacity Provider. See below.

[Code](#state_code_csharp) Archive

Path to the function's deployment package within the local filesystem. Conflicts with `imageUri` and `s3Bucket`. One of `filename`, `imageUri`, or `s3Bucket` must be specified.

[CodeSha256](#state_codesha256_csharp) string

Base64-encoded representation the source code package file. Use this argument to trigger updates when the function source code changes. For OCI, this value is relayed directly from the image digest. For zip files, this value is the Base64 encoded SHA-256 hash of the `.zip` file. Layers are not included in the calculation. To trigger updates using a non-standard hashing algorithm, use the `sourceCodeHash` argument instead.

[CodeSigningConfigArn](#state_codesigningconfigarn_csharp) string

ARN of a code-signing configuration to enable code signing for this function.

[DeadLetterConfig](#state_deadletterconfig_csharp) [FunctionDeadLetterConfig](#functiondeadletterconfig)

Configuration block for dead letter queue. See below.

[Description](#state_description_csharp) string

Description of what your Lambda Function does.

[DurableConfig](#state_durableconfig_csharp) [FunctionDurableConfig](#functiondurableconfig)

Configuration block for durable function settings. See below. `durableConfig` may only be available in [limited regions](https://builder.aws.com/build/capabilities), including `us-east-2`.

[Environment](#state_environment_csharp) [FunctionEnvironment](#functionenvironment)

Configuration block for environment variables. See below.

[EphemeralStorage](#state_ephemeralstorage_csharp) [FunctionEphemeralStorage](#functionephemeralstorage)

Amount of ephemeral storage (`/tmp`) to allocate for the Lambda Function. See below.

[FileSystemConfig](#state_filesystemconfig_csharp) [FunctionFileSystemConfig](#functionfilesystemconfig)

Configuration block for EFS or S3 Files file system. See below.

[Handler](#state_handler_csharp) string

Function entry point in your code. Required if `packageType` is `Zip`.

[ImageConfig](#state_imageconfig_csharp) [FunctionImageConfig](#functionimageconfig)

Container image configuration values. See below.

[ImageUri](#state_imageuri_csharp) string

ECR image URI containing the function's deployment package. Conflicts with `filename` and `s3Bucket`. One of `filename`, `imageUri`, or `s3Bucket` must be specified.

[InvokeArn](#state_invokearn_csharp) string

ARN to be used for invoking Lambda Function from API Gateway - to be used in `aws.apigateway.Integration`'s `uri`.

[KmsKeyArn](#state_kmskeyarn_csharp) string

ARN of the AWS Key Management Service key used to encrypt environment variables. If not provided when environment variables are in use, AWS Lambda uses a default service key. If provided when environment variables are not in use, the AWS Lambda API does not save this configuration.

[LastModified](#state_lastmodified_csharp) string

Date this resource was last modified.

[Layers](#state_layers_csharp) List<string>

List of Lambda Layer Version ARNs (maximum of 5) to attach to your Lambda Function.

[LoggingConfig](#state_loggingconfig_csharp) [FunctionLoggingConfig](#functionloggingconfig)

Configuration block for advanced logging settings. See below.

[MemorySize](#state_memorysize_csharp) int

Amount of memory in MB your Lambda Function can use at runtime. Valid value between 128 MB to 32,768 MB (32 GB), in 1 MB increments. Defaults to 128.

[Name](#state_name_csharp) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

Unique name for your Lambda Function.

[PackageType](#state_packagetype_csharp) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

Lambda deployment package type. Valid values are `Zip` and `Image`. Defaults to `Zip`.

[Publish](#state_publish_csharp) bool

Whether to publish creation/change as new Lambda Function Version. Defaults to `false`.

[PublishTo](#state_publishto_csharp) string

Whether to publish to a alias or version number. Omit for regular version publishing. Option is `LATEST_PUBLISHED`.

[QualifiedArn](#state_qualifiedarn_csharp) string

ARN identifying your Lambda Function Version (if versioning is enabled via `publish = true`).

[QualifiedInvokeArn](#state_qualifiedinvokearn_csharp) string

Qualified ARN (ARN with lambda version number) to be used for invoking Lambda Function from API Gateway - to be used in `aws.apigateway.Integration`'s `uri`.

[Region](#state_region_csharp) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[ReplaceSecurityGroupsOnDestroy](#state_replacesecuritygroupsondestroy_csharp) bool

Whether to replace the security groups on the function's VPC configuration prior to destruction. Default is `false`.

[ReplacementSecurityGroupIds](#state_replacementsecuritygroupids_csharp) List<string>

List of security group IDs to assign to the function's VPC configuration prior to destruction. Required if `replaceSecurityGroupsOnDestroy` is `true`.

[ReservedConcurrentExecutions](#state_reservedconcurrentexecutions_csharp) int

Amount of reserved concurrent executions for this lambda function. A value of `0` disables lambda from being triggered and `-1` removes any concurrency limitations. Defaults to Unreserved Concurrency Limits `-1`.

[ResponseStreamingInvokeArn](#state_responsestreaminginvokearn_csharp) string

ARN to be used for invoking Lambda Function from API Gateway with response streaming - to be used in `aws.apigateway.Integration`'s `uri`.

[Role](#state_role_csharp) string

ARN of the function's execution role. The role provides the function's identity and access to AWS services and resources.

The following arguments are optional:

[Runtime](#state_runtime_csharp) string | [Pulumi.Aws.Lambda.Runtime](#runtime)

Identifier of the function's runtime. Required if `packageType` is `Zip`. See [Runtimes](https://docs.aws.amazon.com/lambda/latest/dg/API_CreateFunction.html#SSS-CreateFunction-request-Runtime) for valid values.

[S3Bucket](#state_s3bucket_csharp) string

S3 bucket location containing the function's deployment package. Conflicts with `filename` and `imageUri`. One of `filename`, `imageUri`, or `s3Bucket` must be specified.

[S3Key](#state_s3key_csharp) string

S3 key of an object containing the function's deployment package. Required if `s3Bucket` is set.

[S3ObjectVersion](#state_s3objectversion_csharp) string

Object version containing the function's deployment package. Conflicts with `filename` and `imageUri`.

[SigningJobArn](#state_signingjobarn_csharp) string

ARN of the signing job.

[SigningProfileVersionArn](#state_signingprofileversionarn_csharp) string

ARN of the signing profile version.

[SkipDestroy](#state_skipdestroy_csharp) bool

Whether to retain the old version of a previously deployed Lambda Layer. Default is `false`.

[SnapStart](#state_snapstart_csharp) [FunctionSnapStart](#functionsnapstart)

Configuration block for snap start settings. See below.

[SourceCodeHash](#state_sourcecodehash_csharp) string

User-defined hash of the source code package file. Use this argument to trigger updates when the local function source code changes. This is a synthetic argument tracked only by the AWS provider and does not need to match the hashing algorithm used by Lambda to compute the `CodeSha256` response value. Out-of-band changes to the source code *will not* be captured by this argument. To include out-of-band source code changes as an update trigger, use the `codeSha256` argument instead.

[SourceCodeSize](#state_sourcecodesize_csharp) int

Size in bytes of the function .zip file.

[SourceKmsKeyArn](#state_sourcekmskeyarn_csharp) string

ARN of the AWS Key Management Service key used to encrypt the function's `.zip` deployment package. Conflicts with `imageUri`.

[Tags](#state_tags_csharp) Dictionary<string, string>

Key-value map of tags for the Lambda function. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[TagsAll](#state_tagsall_csharp) Dictionary<string, string>

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[TenancyConfig](#state_tenancyconfig_csharp) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. [FunctionTenancyConfig](#functiontenancyconfig)

Configuration block for Tenancy. See below.

[Timeout](#state_timeout_csharp) int

Amount of time your Lambda Function has to run in seconds. Defaults to 3. Valid between 1 and 900.

[TracingConfig](#state_tracingconfig_csharp) [FunctionTracingConfig](#functiontracingconfig)

Configuration block for X-Ray tracing. See below.

[Version](#state_version_csharp) string

Latest published version of your Lambda Function.

[VpcConfig](#state_vpcconfig_csharp) [FunctionVpcConfig](#functionvpcconfig)

Configuration block for VPC. See below.

[Architectures](#state_architectures_go) \[\]string

Instruction set architecture for your Lambda function. Valid values are `["x8664"]` and `["arm64"]`. Default is `["x8664"]`. Removing this attribute, function's architecture stays the same.

[Arn](#state_arn_go) string

ARN identifying your Lambda Function.

[CapacityProviderConfig](#state_capacityproviderconfig_go) [FunctionCapacityProviderConfigArgs](#functioncapacityproviderconfig)

Configuration block for Lambda Capacity Provider. See below.

[Code](#state_code_go) pulumi.Archive

Path to the function's deployment package within the local filesystem. Conflicts with `imageUri` and `s3Bucket`. One of `filename`, `imageUri`, or `s3Bucket` must be specified.

[CodeSha256](#state_codesha256_go) string

Base64-encoded representation the source code package file. Use this argument to trigger updates when the function source code changes. For OCI, this value is relayed directly from the image digest. For zip files, this value is the Base64 encoded SHA-256 hash of the `.zip` file. Layers are not included in the calculation. To trigger updates using a non-standard hashing algorithm, use the `sourceCodeHash` argument instead.

[CodeSigningConfigArn](#state_codesigningconfigarn_go) string

ARN of a code-signing configuration to enable code signing for this function.

[DeadLetterConfig](#state_deadletterconfig_go) [FunctionDeadLetterConfigArgs](#functiondeadletterconfig)

Configuration block for dead letter queue. See below.

[Description](#state_description_go) string

Description of what your Lambda Function does.

[DurableConfig](#state_durableconfig_go) [FunctionDurableConfigArgs](#functiondurableconfig)

Configuration block for durable function settings. See below. `durableConfig` may only be available in [limited regions](https://builder.aws.com/build/capabilities), including `us-east-2`.

[Environment](#state_environment_go) [FunctionEnvironmentArgs](#functionenvironment)

Configuration block for environment variables. See below.

[EphemeralStorage](#state_ephemeralstorage_go) [FunctionEphemeralStorageArgs](#functionephemeralstorage)

Amount of ephemeral storage (`/tmp`) to allocate for the Lambda Function. See below.

[FileSystemConfig](#state_filesystemconfig_go) [FunctionFileSystemConfigArgs](#functionfilesystemconfig)

Configuration block for EFS or S3 Files file system. See below.

[Handler](#state_handler_go) string

Function entry point in your code. Required if `packageType` is `Zip`.

[ImageConfig](#state_imageconfig_go) [FunctionImageConfigArgs](#functionimageconfig)

Container image configuration values. See below.

[ImageUri](#state_imageuri_go) string

ECR image URI containing the function's deployment package. Conflicts with `filename` and `s3Bucket`. One of `filename`, `imageUri`, or `s3Bucket` must be specified.

[InvokeArn](#state_invokearn_go) string

ARN to be used for invoking Lambda Function from API Gateway - to be used in `aws.apigateway.Integration`'s `uri`.

[KmsKeyArn](#state_kmskeyarn_go) string

ARN of the AWS Key Management Service key used to encrypt environment variables. If not provided when environment variables are in use, AWS Lambda uses a default service key. If provided when environment variables are not in use, the AWS Lambda API does not save this configuration.

[LastModified](#state_lastmodified_go) string

Date this resource was last modified.

[Layers](#state_layers_go) \[\]string

List of Lambda Layer Version ARNs (maximum of 5) to attach to your Lambda Function.

[LoggingConfig](#state_loggingconfig_go) [FunctionLoggingConfigArgs](#functionloggingconfig)

Configuration block for advanced logging settings. See below.

[MemorySize](#state_memorysize_go) int

Amount of memory in MB your Lambda Function can use at runtime. Valid value between 128 MB to 32,768 MB (32 GB), in 1 MB increments. Defaults to 128.

[Name](#state_name_go) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

Unique name for your Lambda Function.

[PackageType](#state_packagetype_go) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

Lambda deployment package type. Valid values are `Zip` and `Image`. Defaults to `Zip`.

[Publish](#state_publish_go) bool

Whether to publish creation/change as new Lambda Function Version. Defaults to `false`.

[PublishTo](#state_publishto_go) string

Whether to publish to a alias or version number. Omit for regular version publishing. Option is `LATEST_PUBLISHED`.

[QualifiedArn](#state_qualifiedarn_go) string

ARN identifying your Lambda Function Version (if versioning is enabled via `publish = true`).

[QualifiedInvokeArn](#state_qualifiedinvokearn_go) string

Qualified ARN (ARN with lambda version number) to be used for invoking Lambda Function from API Gateway - to be used in `aws.apigateway.Integration`'s `uri`.

[Region](#state_region_go) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[ReplaceSecurityGroupsOnDestroy](#state_replacesecuritygroupsondestroy_go) bool

Whether to replace the security groups on the function's VPC configuration prior to destruction. Default is `false`.

[ReplacementSecurityGroupIds](#state_replacementsecuritygroupids_go) \[\]string

List of security group IDs to assign to the function's VPC configuration prior to destruction. Required if `replaceSecurityGroupsOnDestroy` is `true`.

[ReservedConcurrentExecutions](#state_reservedconcurrentexecutions_go) int

Amount of reserved concurrent executions for this lambda function. A value of `0` disables lambda from being triggered and `-1` removes any concurrency limitations. Defaults to Unreserved Concurrency Limits `-1`.

[ResponseStreamingInvokeArn](#state_responsestreaminginvokearn_go) string

ARN to be used for invoking Lambda Function from API Gateway with response streaming - to be used in `aws.apigateway.Integration`'s `uri`.

[Role](#state_role_go) string

ARN of the function's execution role. The role provides the function's identity and access to AWS services and resources.

The following arguments are optional:

[Runtime](#state_runtime_go) string | [Runtime](#runtime)

Identifier of the function's runtime. Required if `packageType` is `Zip`. See [Runtimes](https://docs.aws.amazon.com/lambda/latest/dg/API_CreateFunction.html#SSS-CreateFunction-request-Runtime) for valid values.

[S3Bucket](#state_s3bucket_go) string

S3 bucket location containing the function's deployment package. Conflicts with `filename` and `imageUri`. One of `filename`, `imageUri`, or `s3Bucket` must be specified.

[S3Key](#state_s3key_go) string

S3 key of an object containing the function's deployment package. Required if `s3Bucket` is set.

[S3ObjectVersion](#state_s3objectversion_go) string

Object version containing the function's deployment package. Conflicts with `filename` and `imageUri`.

[SigningJobArn](#state_signingjobarn_go) string

ARN of the signing job.

[SigningProfileVersionArn](#state_signingprofileversionarn_go) string

ARN of the signing profile version.

[SkipDestroy](#state_skipdestroy_go) bool

Whether to retain the old version of a previously deployed Lambda Layer. Default is `false`.

[SnapStart](#state_snapstart_go) [FunctionSnapStartArgs](#functionsnapstart)

Configuration block for snap start settings. See below.

[SourceCodeHash](#state_sourcecodehash_go) string

User-defined hash of the source code package file. Use this argument to trigger updates when the local function source code changes. This is a synthetic argument tracked only by the AWS provider and does not need to match the hashing algorithm used by Lambda to compute the `CodeSha256` response value. Out-of-band changes to the source code *will not* be captured by this argument. To include out-of-band source code changes as an update trigger, use the `codeSha256` argument instead.

[SourceCodeSize](#state_sourcecodesize_go) int

Size in bytes of the function .zip file.

[SourceKmsKeyArn](#state_sourcekmskeyarn_go) string

ARN of the AWS Key Management Service key used to encrypt the function's `.zip` deployment package. Conflicts with `imageUri`.

[Tags](#state_tags_go) map\[string\]string

Key-value map of tags for the Lambda function. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[TagsAll](#state_tagsall_go) map\[string\]string

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[TenancyConfig](#state_tenancyconfig_go) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. [FunctionTenancyConfigArgs](#functiontenancyconfig)

Configuration block for Tenancy. See below.

[Timeout](#state_timeout_go) int

Amount of time your Lambda Function has to run in seconds. Defaults to 3. Valid between 1 and 900.

[TracingConfig](#state_tracingconfig_go) [FunctionTracingConfigArgs](#functiontracingconfig)

Configuration block for X-Ray tracing. See below.

[Version](#state_version_go) string

Latest published version of your Lambda Function.

[VpcConfig](#state_vpcconfig_go) [FunctionVpcConfigArgs](#functionvpcconfig)

Configuration block for VPC. See below.

[architectures](#state_architectures_hcl) list(string)

Instruction set architecture for your Lambda function. Valid values are `["x8664"]` and `["arm64"]`. Default is `["x8664"]`. Removing this attribute, function's architecture stays the same.

[arn](#state_arn_hcl) string

ARN identifying your Lambda Function.

[capacity\_provider\_config](#state_capacity_provider_config_hcl) [object](#functioncapacityproviderconfig)

Configuration block for Lambda Capacity Provider. See below.

[code](#state_code_hcl) archive

Path to the function's deployment package within the local filesystem. Conflicts with `imageUri` and `s3Bucket`. One of `filename`, `imageUri`, or `s3Bucket` must be specified.

[code\_sha256](#state_code_sha256_hcl) string

Base64-encoded representation the source code package file. Use this argument to trigger updates when the function source code changes. For OCI, this value is relayed directly from the image digest. For zip files, this value is the Base64 encoded SHA-256 hash of the `.zip` file. Layers are not included in the calculation. To trigger updates using a non-standard hashing algorithm, use the `sourceCodeHash` argument instead.

[code\_signing\_config\_arn](#state_code_signing_config_arn_hcl) string

ARN of a code-signing configuration to enable code signing for this function.

[dead\_letter\_config](#state_dead_letter_config_hcl) [object](#functiondeadletterconfig)

Configuration block for dead letter queue. See below.

[description](#state_description_hcl) string

Description of what your Lambda Function does.

[durable\_config](#state_durable_config_hcl) [object](#functiondurableconfig)

Configuration block for durable function settings. See below. `durableConfig` may only be available in [limited regions](https://builder.aws.com/build/capabilities), including `us-east-2`.

[environment](#state_environment_hcl) [object](#functionenvironment)

Configuration block for environment variables. See below.

[ephemeral\_storage](#state_ephemeral_storage_hcl) [object](#functionephemeralstorage)

Amount of ephemeral storage (`/tmp`) to allocate for the Lambda Function. See below.

[file\_system\_config](#state_file_system_config_hcl) [object](#functionfilesystemconfig)

Configuration block for EFS or S3 Files file system. See below.

[handler](#state_handler_hcl) string

Function entry point in your code. Required if `packageType` is `Zip`.

[image\_config](#state_image_config_hcl) [object](#functionimageconfig)

Container image configuration values. See below.

[image\_uri](#state_image_uri_hcl) string

ECR image URI containing the function's deployment package. Conflicts with `filename` and `s3Bucket`. One of `filename`, `imageUri`, or `s3Bucket` must be specified.

[invoke\_arn](#state_invoke_arn_hcl) string

ARN to be used for invoking Lambda Function from API Gateway - to be used in `aws.apigateway.Integration`'s `uri`.

[kms\_key\_arn](#state_kms_key_arn_hcl) string

ARN of the AWS Key Management Service key used to encrypt environment variables. If not provided when environment variables are in use, AWS Lambda uses a default service key. If provided when environment variables are not in use, the AWS Lambda API does not save this configuration.

[last\_modified](#state_last_modified_hcl) string

Date this resource was last modified.

[layers](#state_layers_hcl) list(string)

List of Lambda Layer Version ARNs (maximum of 5) to attach to your Lambda Function.

[logging\_config](#state_logging_config_hcl) [object](#functionloggingconfig)

Configuration block for advanced logging settings. See below.

[memory\_size](#state_memory_size_hcl) number

Amount of memory in MB your Lambda Function can use at runtime. Valid value between 128 MB to 32,768 MB (32 GB), in 1 MB increments. Defaults to 128.

[name](#state_name_hcl) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

Unique name for your Lambda Function.

[package\_type](#state_package_type_hcl) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

Lambda deployment package type. Valid values are `Zip` and `Image`. Defaults to `Zip`.

[publish](#state_publish_hcl) bool

Whether to publish creation/change as new Lambda Function Version. Defaults to `false`.

[publish\_to](#state_publish_to_hcl) string

Whether to publish to a alias or version number. Omit for regular version publishing. Option is `LATEST_PUBLISHED`.

[qualified\_arn](#state_qualified_arn_hcl) string

ARN identifying your Lambda Function Version (if versioning is enabled via `publish = true`).

[qualified\_invoke\_arn](#state_qualified_invoke_arn_hcl) string

Qualified ARN (ARN with lambda version number) to be used for invoking Lambda Function from API Gateway - to be used in `aws.apigateway.Integration`'s `uri`.

[region](#state_region_hcl) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[replace\_security\_groups\_on\_destroy](#state_replace_security_groups_on_destroy_hcl) bool

Whether to replace the security groups on the function's VPC configuration prior to destruction. Default is `false`.

[replacement\_security\_group\_ids](#state_replacement_security_group_ids_hcl) list(string)

List of security group IDs to assign to the function's VPC configuration prior to destruction. Required if `replaceSecurityGroupsOnDestroy` is `true`.

[reserved\_concurrent\_executions](#state_reserved_concurrent_executions_hcl) number

Amount of reserved concurrent executions for this lambda function. A value of `0` disables lambda from being triggered and `-1` removes any concurrency limitations. Defaults to Unreserved Concurrency Limits `-1`.

[response\_streaming\_invoke\_arn](#state_response_streaming_invoke_arn_hcl) string

ARN to be used for invoking Lambda Function from API Gateway with response streaming - to be used in `aws.apigateway.Integration`'s `uri`.

[role](#state_role_hcl) string

ARN of the function's execution role. The role provides the function's identity and access to AWS services and resources.

The following arguments are optional:

[runtime](#state_runtime_hcl) string | ["dotnet6" | "dotnet8" | "dotnet10" | "java11" | "java17" | "java21" | "java25" | "java8.al2" | "nodejs18.x" | "nodejs20.x" | "nodejs22.x" | "nodejs24.x" | "provided.al2" | "provided.al2023" | "python3.10" | "python3.11" | "python3.12" | "python3.13" | "python3.14" | "python3.9" | "ruby3.2" | "ruby3.3" | "ruby3.4" | "dotnet5.0" | "dotnet7" | "dotnetcore2.1" | "dotnetcore3.1" | "go1.x" | "java8" | "nodejs10.x" | "nodejs12.x" | "nodejs14.x" | "nodejs16.x" | "provided" | "python2.7" | "python3.6" | "python3.7" | "python3.8" | "ruby2.5" | "ruby2.7"](#runtime)

Identifier of the function's runtime. Required if `packageType` is `Zip`. See [Runtimes](https://docs.aws.amazon.com/lambda/latest/dg/API_CreateFunction.html#SSS-CreateFunction-request-Runtime) for valid values.

[s3\_bucket](#state_s3_bucket_hcl) string

S3 bucket location containing the function's deployment package. Conflicts with `filename` and `imageUri`. One of `filename`, `imageUri`, or `s3Bucket` must be specified.

[s3\_key](#state_s3_key_hcl) string

S3 key of an object containing the function's deployment package. Required if `s3Bucket` is set.

[s3\_object\_version](#state_s3_object_version_hcl) string

Object version containing the function's deployment package. Conflicts with `filename` and `imageUri`.

[signing\_job\_arn](#state_signing_job_arn_hcl) string

ARN of the signing job.

[signing\_profile\_version\_arn](#state_signing_profile_version_arn_hcl) string

ARN of the signing profile version.

[skip\_destroy](#state_skip_destroy_hcl) bool

Whether to retain the old version of a previously deployed Lambda Layer. Default is `false`.

[snap\_start](#state_snap_start_hcl) [object](#functionsnapstart)

Configuration block for snap start settings. See below.

[source\_code\_hash](#state_source_code_hash_hcl) string

User-defined hash of the source code package file. Use this argument to trigger updates when the local function source code changes. This is a synthetic argument tracked only by the AWS provider and does not need to match the hashing algorithm used by Lambda to compute the `CodeSha256` response value. Out-of-band changes to the source code *will not* be captured by this argument. To include out-of-band source code changes as an update trigger, use the `codeSha256` argument instead.

[source\_code\_size](#state_source_code_size_hcl) number

Size in bytes of the function .zip file.

[source\_kms\_key\_arn](#state_source_kms_key_arn_hcl) string

ARN of the AWS Key Management Service key used to encrypt the function's `.zip` deployment package. Conflicts with `imageUri`.

[tags](#state_tags_hcl) map(string)

Key-value map of tags for the Lambda function. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tags\_all](#state_tags_all_hcl) map(string)

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[tenancy\_config](#state_tenancy_config_hcl) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. [object](#functiontenancyconfig)

Configuration block for Tenancy. See below.

[timeout](#state_timeout_hcl) number

Amount of time your Lambda Function has to run in seconds. Defaults to 3. Valid between 1 and 900.

[tracing\_config](#state_tracing_config_hcl) [object](#functiontracingconfig)

Configuration block for X-Ray tracing. See below.

[version](#state_version_hcl) string

Latest published version of your Lambda Function.

[vpc\_config](#state_vpc_config_hcl) [object](#functionvpcconfig)

Configuration block for VPC. See below.

[architectures](#state_architectures_java) List<String>

Instruction set architecture for your Lambda function. Valid values are `["x8664"]` and `["arm64"]`. Default is `["x8664"]`. Removing this attribute, function's architecture stays the same.

[arn](#state_arn_java) String

ARN identifying your Lambda Function.

[capacityProviderConfig](#state_capacityproviderconfig_java) [FunctionCapacityProviderConfig](#functioncapacityproviderconfig)

Configuration block for Lambda Capacity Provider. See below.

[code](#state_code_java) Archive

Path to the function's deployment package within the local filesystem. Conflicts with `imageUri` and `s3Bucket`. One of `filename`, `imageUri`, or `s3Bucket` must be specified.

[codeSha256](#state_codesha256_java) String

Base64-encoded representation the source code package file. Use this argument to trigger updates when the function source code changes. For OCI, this value is relayed directly from the image digest. For zip files, this value is the Base64 encoded SHA-256 hash of the `.zip` file. Layers are not included in the calculation. To trigger updates using a non-standard hashing algorithm, use the `sourceCodeHash` argument instead.

[codeSigningConfigArn](#state_codesigningconfigarn_java) String

ARN of a code-signing configuration to enable code signing for this function.

[deadLetterConfig](#state_deadletterconfig_java) [FunctionDeadLetterConfig](#functiondeadletterconfig)

Configuration block for dead letter queue. See below.

[description](#state_description_java) String

Description of what your Lambda Function does.

[durableConfig](#state_durableconfig_java) [FunctionDurableConfig](#functiondurableconfig)

Configuration block for durable function settings. See below. `durableConfig` may only be available in [limited regions](https://builder.aws.com/build/capabilities), including `us-east-2`.

[environment](#state_environment_java) [FunctionEnvironment](#functionenvironment)

Configuration block for environment variables. See below.

[ephemeralStorage](#state_ephemeralstorage_java) [FunctionEphemeralStorage](#functionephemeralstorage)

Amount of ephemeral storage (`/tmp`) to allocate for the Lambda Function. See below.

[fileSystemConfig](#state_filesystemconfig_java) [FunctionFileSystemConfig](#functionfilesystemconfig)

Configuration block for EFS or S3 Files file system. See below.

[handler](#state_handler_java) String

Function entry point in your code. Required if `packageType` is `Zip`.

[imageConfig](#state_imageconfig_java) [FunctionImageConfig](#functionimageconfig)

Container image configuration values. See below.

[imageUri](#state_imageuri_java) String

ECR image URI containing the function's deployment package. Conflicts with `filename` and `s3Bucket`. One of `filename`, `imageUri`, or `s3Bucket` must be specified.

[invokeArn](#state_invokearn_java) String

ARN to be used for invoking Lambda Function from API Gateway - to be used in `aws.apigateway.Integration`'s `uri`.

[kmsKeyArn](#state_kmskeyarn_java) String

ARN of the AWS Key Management Service key used to encrypt environment variables. If not provided when environment variables are in use, AWS Lambda uses a default service key. If provided when environment variables are not in use, the AWS Lambda API does not save this configuration.

[lastModified](#state_lastmodified_java) String

Date this resource was last modified.

[layers](#state_layers_java) List<String>

List of Lambda Layer Version ARNs (maximum of 5) to attach to your Lambda Function.

[loggingConfig](#state_loggingconfig_java) [FunctionLoggingConfig](#functionloggingconfig)

Configuration block for advanced logging settings. See below.

[memorySize](#state_memorysize_java) Integer

Amount of memory in MB your Lambda Function can use at runtime. Valid value between 128 MB to 32,768 MB (32 GB), in 1 MB increments. Defaults to 128.

[name](#state_name_java) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. String

Unique name for your Lambda Function.

[packageType](#state_packagetype_java) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. String

Lambda deployment package type. Valid values are `Zip` and `Image`. Defaults to `Zip`.

[publish](#state_publish_java) Boolean

Whether to publish creation/change as new Lambda Function Version. Defaults to `false`.

[publishTo](#state_publishto_java) String

Whether to publish to a alias or version number. Omit for regular version publishing. Option is `LATEST_PUBLISHED`.

[qualifiedArn](#state_qualifiedarn_java) String

ARN identifying your Lambda Function Version (if versioning is enabled via `publish = true`).

[qualifiedInvokeArn](#state_qualifiedinvokearn_java) String

Qualified ARN (ARN with lambda version number) to be used for invoking Lambda Function from API Gateway - to be used in `aws.apigateway.Integration`'s `uri`.

[region](#state_region_java) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[replaceSecurityGroupsOnDestroy](#state_replacesecuritygroupsondestroy_java) Boolean

Whether to replace the security groups on the function's VPC configuration prior to destruction. Default is `false`.

[replacementSecurityGroupIds](#state_replacementsecuritygroupids_java) List<String>

List of security group IDs to assign to the function's VPC configuration prior to destruction. Required if `replaceSecurityGroupsOnDestroy` is `true`.

[reservedConcurrentExecutions](#state_reservedconcurrentexecutions_java) Integer

Amount of reserved concurrent executions for this lambda function. A value of `0` disables lambda from being triggered and `-1` removes any concurrency limitations. Defaults to Unreserved Concurrency Limits `-1`.

[responseStreamingInvokeArn](#state_responsestreaminginvokearn_java) String

ARN to be used for invoking Lambda Function from API Gateway with response streaming - to be used in `aws.apigateway.Integration`'s `uri`.

[role](#state_role_java) String

ARN of the function's execution role. The role provides the function's identity and access to AWS services and resources.

The following arguments are optional:

[runtime](#state_runtime_java) String | [Runtime](#runtime)

Identifier of the function's runtime. Required if `packageType` is `Zip`. See [Runtimes](https://docs.aws.amazon.com/lambda/latest/dg/API_CreateFunction.html#SSS-CreateFunction-request-Runtime) for valid values.

[s3Bucket](#state_s3bucket_java) String

S3 bucket location containing the function's deployment package. Conflicts with `filename` and `imageUri`. One of `filename`, `imageUri`, or `s3Bucket` must be specified.

[s3Key](#state_s3key_java) String

S3 key of an object containing the function's deployment package. Required if `s3Bucket` is set.

[s3ObjectVersion](#state_s3objectversion_java) String

Object version containing the function's deployment package. Conflicts with `filename` and `imageUri`.

[signingJobArn](#state_signingjobarn_java) String

ARN of the signing job.

[signingProfileVersionArn](#state_signingprofileversionarn_java) String

ARN of the signing profile version.

[skipDestroy](#state_skipdestroy_java) Boolean

Whether to retain the old version of a previously deployed Lambda Layer. Default is `false`.

[snapStart](#state_snapstart_java) [FunctionSnapStart](#functionsnapstart)

Configuration block for snap start settings. See below.

[sourceCodeHash](#state_sourcecodehash_java) String

User-defined hash of the source code package file. Use this argument to trigger updates when the local function source code changes. This is a synthetic argument tracked only by the AWS provider and does not need to match the hashing algorithm used by Lambda to compute the `CodeSha256` response value. Out-of-band changes to the source code *will not* be captured by this argument. To include out-of-band source code changes as an update trigger, use the `codeSha256` argument instead.

[sourceCodeSize](#state_sourcecodesize_java) Integer

Size in bytes of the function .zip file.

[sourceKmsKeyArn](#state_sourcekmskeyarn_java) String

ARN of the AWS Key Management Service key used to encrypt the function's `.zip` deployment package. Conflicts with `imageUri`.

[tags](#state_tags_java) Map<String,String>

Key-value map of tags for the Lambda function. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tagsAll](#state_tagsall_java) Map<String,String>

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[tenancyConfig](#state_tenancyconfig_java) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. [FunctionTenancyConfig](#functiontenancyconfig)

Configuration block for Tenancy. See below.

[timeout](#state_timeout_java) Integer

Amount of time your Lambda Function has to run in seconds. Defaults to 3. Valid between 1 and 900.

[tracingConfig](#state_tracingconfig_java) [FunctionTracingConfig](#functiontracingconfig)

Configuration block for X-Ray tracing. See below.

[version](#state_version_java) String

Latest published version of your Lambda Function.

[vpcConfig](#state_vpcconfig_java) [FunctionVpcConfig](#functionvpcconfig)

Configuration block for VPC. See below.

[architectures](#state_architectures_nodejs) string\[\]

Instruction set architecture for your Lambda function. Valid values are `["x8664"]` and `["arm64"]`. Default is `["x8664"]`. Removing this attribute, function's architecture stays the same.

[arn](#state_arn_nodejs) string

ARN identifying your Lambda Function.

[capacityProviderConfig](#state_capacityproviderconfig_nodejs) [FunctionCapacityProviderConfig](#functioncapacityproviderconfig)

Configuration block for Lambda Capacity Provider. See below.

[code](#state_code_nodejs) pulumi.asset.Archive

Path to the function's deployment package within the local filesystem. Conflicts with `imageUri` and `s3Bucket`. One of `filename`, `imageUri`, or `s3Bucket` must be specified.

[codeSha256](#state_codesha256_nodejs) string

Base64-encoded representation the source code package file. Use this argument to trigger updates when the function source code changes. For OCI, this value is relayed directly from the image digest. For zip files, this value is the Base64 encoded SHA-256 hash of the `.zip` file. Layers are not included in the calculation. To trigger updates using a non-standard hashing algorithm, use the `sourceCodeHash` argument instead.

[codeSigningConfigArn](#state_codesigningconfigarn_nodejs) string

ARN of a code-signing configuration to enable code signing for this function.

[deadLetterConfig](#state_deadletterconfig_nodejs) [FunctionDeadLetterConfig](#functiondeadletterconfig)

Configuration block for dead letter queue. See below.

[description](#state_description_nodejs) string

Description of what your Lambda Function does.

[durableConfig](#state_durableconfig_nodejs) [FunctionDurableConfig](#functiondurableconfig)

Configuration block for durable function settings. See below. `durableConfig` may only be available in [limited regions](https://builder.aws.com/build/capabilities), including `us-east-2`.

[environment](#state_environment_nodejs) [FunctionEnvironment](#functionenvironment)

Configuration block for environment variables. See below.

[ephemeralStorage](#state_ephemeralstorage_nodejs) [FunctionEphemeralStorage](#functionephemeralstorage)

Amount of ephemeral storage (`/tmp`) to allocate for the Lambda Function. See below.

[fileSystemConfig](#state_filesystemconfig_nodejs) [FunctionFileSystemConfig](#functionfilesystemconfig)

Configuration block for EFS or S3 Files file system. See below.

[handler](#state_handler_nodejs) string

Function entry point in your code. Required if `packageType` is `Zip`.

[imageConfig](#state_imageconfig_nodejs) [FunctionImageConfig](#functionimageconfig)

Container image configuration values. See below.

[imageUri](#state_imageuri_nodejs) string

ECR image URI containing the function's deployment package. Conflicts with `filename` and `s3Bucket`. One of `filename`, `imageUri`, or `s3Bucket` must be specified.

[invokeArn](#state_invokearn_nodejs) string

ARN to be used for invoking Lambda Function from API Gateway - to be used in `aws.apigateway.Integration`'s `uri`.

[kmsKeyArn](#state_kmskeyarn_nodejs) string

ARN of the AWS Key Management Service key used to encrypt environment variables. If not provided when environment variables are in use, AWS Lambda uses a default service key. If provided when environment variables are not in use, the AWS Lambda API does not save this configuration.

[lastModified](#state_lastmodified_nodejs) string

Date this resource was last modified.

[layers](#state_layers_nodejs) string\[\]

List of Lambda Layer Version ARNs (maximum of 5) to attach to your Lambda Function.

[loggingConfig](#state_loggingconfig_nodejs) [FunctionLoggingConfig](#functionloggingconfig)

Configuration block for advanced logging settings. See below.

[memorySize](#state_memorysize_nodejs) number

Amount of memory in MB your Lambda Function can use at runtime. Valid value between 128 MB to 32,768 MB (32 GB), in 1 MB increments. Defaults to 128.

[name](#state_name_nodejs) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

Unique name for your Lambda Function.

[packageType](#state_packagetype_nodejs) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

Lambda deployment package type. Valid values are `Zip` and `Image`. Defaults to `Zip`.

[publish](#state_publish_nodejs) boolean

Whether to publish creation/change as new Lambda Function Version. Defaults to `false`.

[publishTo](#state_publishto_nodejs) string

Whether to publish to a alias or version number. Omit for regular version publishing. Option is `LATEST_PUBLISHED`.

[qualifiedArn](#state_qualifiedarn_nodejs) string

ARN identifying your Lambda Function Version (if versioning is enabled via `publish = true`).

[qualifiedInvokeArn](#state_qualifiedinvokearn_nodejs) string

Qualified ARN (ARN with lambda version number) to be used for invoking Lambda Function from API Gateway - to be used in `aws.apigateway.Integration`'s `uri`.

[region](#state_region_nodejs) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[replaceSecurityGroupsOnDestroy](#state_replacesecuritygroupsondestroy_nodejs) boolean

Whether to replace the security groups on the function's VPC configuration prior to destruction. Default is `false`.

[replacementSecurityGroupIds](#state_replacementsecuritygroupids_nodejs) string\[\]

List of security group IDs to assign to the function's VPC configuration prior to destruction. Required if `replaceSecurityGroupsOnDestroy` is `true`.

[reservedConcurrentExecutions](#state_reservedconcurrentexecutions_nodejs) number

Amount of reserved concurrent executions for this lambda function. A value of `0` disables lambda from being triggered and `-1` removes any concurrency limitations. Defaults to Unreserved Concurrency Limits `-1`.

[responseStreamingInvokeArn](#state_responsestreaminginvokearn_nodejs) string

ARN to be used for invoking Lambda Function from API Gateway with response streaming - to be used in `aws.apigateway.Integration`'s `uri`.

[role](#state_role_nodejs) string

ARN of the function's execution role. The role provides the function's identity and access to AWS services and resources.

The following arguments are optional:

[runtime](#state_runtime_nodejs) string | [Runtime](#runtime)

Identifier of the function's runtime. Required if `packageType` is `Zip`. See [Runtimes](https://docs.aws.amazon.com/lambda/latest/dg/API_CreateFunction.html#SSS-CreateFunction-request-Runtime) for valid values.

[s3Bucket](#state_s3bucket_nodejs) string

S3 bucket location containing the function's deployment package. Conflicts with `filename` and `imageUri`. One of `filename`, `imageUri`, or `s3Bucket` must be specified.

[s3Key](#state_s3key_nodejs) string

S3 key of an object containing the function's deployment package. Required if `s3Bucket` is set.

[s3ObjectVersion](#state_s3objectversion_nodejs) string

Object version containing the function's deployment package. Conflicts with `filename` and `imageUri`.

[signingJobArn](#state_signingjobarn_nodejs) string

ARN of the signing job.

[signingProfileVersionArn](#state_signingprofileversionarn_nodejs) string

ARN of the signing profile version.

[skipDestroy](#state_skipdestroy_nodejs) boolean

Whether to retain the old version of a previously deployed Lambda Layer. Default is `false`.

[snapStart](#state_snapstart_nodejs) [FunctionSnapStart](#functionsnapstart)

Configuration block for snap start settings. See below.

[sourceCodeHash](#state_sourcecodehash_nodejs) string

User-defined hash of the source code package file. Use this argument to trigger updates when the local function source code changes. This is a synthetic argument tracked only by the AWS provider and does not need to match the hashing algorithm used by Lambda to compute the `CodeSha256` response value. Out-of-band changes to the source code *will not* be captured by this argument. To include out-of-band source code changes as an update trigger, use the `codeSha256` argument instead.

[sourceCodeSize](#state_sourcecodesize_nodejs) number

Size in bytes of the function .zip file.

[sourceKmsKeyArn](#state_sourcekmskeyarn_nodejs) string

ARN of the AWS Key Management Service key used to encrypt the function's `.zip` deployment package. Conflicts with `imageUri`.

[tags](#state_tags_nodejs) {\[key: string\]: string}

Key-value map of tags for the Lambda function. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tagsAll](#state_tagsall_nodejs) {\[key: string\]: string}

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[tenancyConfig](#state_tenancyconfig_nodejs) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. [FunctionTenancyConfig](#functiontenancyconfig)

Configuration block for Tenancy. See below.

[timeout](#state_timeout_nodejs) number

Amount of time your Lambda Function has to run in seconds. Defaults to 3. Valid between 1 and 900.

[tracingConfig](#state_tracingconfig_nodejs) [FunctionTracingConfig](#functiontracingconfig)

Configuration block for X-Ray tracing. See below.

[version](#state_version_nodejs) string

Latest published version of your Lambda Function.

[vpcConfig](#state_vpcconfig_nodejs) [FunctionVpcConfig](#functionvpcconfig)

Configuration block for VPC. See below.

[architectures](#state_architectures_python) Sequence\[str\]

Instruction set architecture for your Lambda function. Valid values are `["x8664"]` and `["arm64"]`. Default is `["x8664"]`. Removing this attribute, function's architecture stays the same.

[arn](#state_arn_python) str

ARN identifying your Lambda Function.

[capacity\_provider\_config](#state_capacity_provider_config_python) [FunctionCapacityProviderConfigArgs](#functioncapacityproviderconfig)

Configuration block for Lambda Capacity Provider. See below.

[code](#state_code_python) pulumi.Archive

Path to the function's deployment package within the local filesystem. Conflicts with `imageUri` and `s3Bucket`. One of `filename`, `imageUri`, or `s3Bucket` must be specified.

[code\_sha256](#state_code_sha256_python) str

Base64-encoded representation the source code package file. Use this argument to trigger updates when the function source code changes. For OCI, this value is relayed directly from the image digest. For zip files, this value is the Base64 encoded SHA-256 hash of the `.zip` file. Layers are not included in the calculation. To trigger updates using a non-standard hashing algorithm, use the `sourceCodeHash` argument instead.

[code\_signing\_config\_arn](#state_code_signing_config_arn_python) str

ARN of a code-signing configuration to enable code signing for this function.

[dead\_letter\_config](#state_dead_letter_config_python) [FunctionDeadLetterConfigArgs](#functiondeadletterconfig)

Configuration block for dead letter queue. See below.

[description](#state_description_python) str

Description of what your Lambda Function does.

[durable\_config](#state_durable_config_python) [FunctionDurableConfigArgs](#functiondurableconfig)

Configuration block for durable function settings. See below. `durableConfig` may only be available in [limited regions](https://builder.aws.com/build/capabilities), including `us-east-2`.

[environment](#state_environment_python) [FunctionEnvironmentArgs](#functionenvironment)

Configuration block for environment variables. See below.

[ephemeral\_storage](#state_ephemeral_storage_python) [FunctionEphemeralStorageArgs](#functionephemeralstorage)

Amount of ephemeral storage (`/tmp`) to allocate for the Lambda Function. See below.

[file\_system\_config](#state_file_system_config_python) [FunctionFileSystemConfigArgs](#functionfilesystemconfig)

Configuration block for EFS or S3 Files file system. See below.

[handler](#state_handler_python) str

Function entry point in your code. Required if `packageType` is `Zip`.

[image\_config](#state_image_config_python) [FunctionImageConfigArgs](#functionimageconfig)

Container image configuration values. See below.

[image\_uri](#state_image_uri_python) str

ECR image URI containing the function's deployment package. Conflicts with `filename` and `s3Bucket`. One of `filename`, `imageUri`, or `s3Bucket` must be specified.

[invoke\_arn](#state_invoke_arn_python) str

ARN to be used for invoking Lambda Function from API Gateway - to be used in `aws.apigateway.Integration`'s `uri`.

[kms\_key\_arn](#state_kms_key_arn_python) str

ARN of the AWS Key Management Service key used to encrypt environment variables. If not provided when environment variables are in use, AWS Lambda uses a default service key. If provided when environment variables are not in use, the AWS Lambda API does not save this configuration.

[last\_modified](#state_last_modified_python) str

Date this resource was last modified.

[layers](#state_layers_python) Sequence\[str\]

List of Lambda Layer Version ARNs (maximum of 5) to attach to your Lambda Function.

[logging\_config](#state_logging_config_python) [FunctionLoggingConfigArgs](#functionloggingconfig)

Configuration block for advanced logging settings. See below.

[memory\_size](#state_memory_size_python) int

Amount of memory in MB your Lambda Function can use at runtime. Valid value between 128 MB to 32,768 MB (32 GB), in 1 MB increments. Defaults to 128.

[name](#state_name_python) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. str

Unique name for your Lambda Function.

[package\_type](#state_package_type_python) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. str

Lambda deployment package type. Valid values are `Zip` and `Image`. Defaults to `Zip`.

[publish](#state_publish_python) bool

Whether to publish creation/change as new Lambda Function Version. Defaults to `false`.

[publish\_to](#state_publish_to_python) str

Whether to publish to a alias or version number. Omit for regular version publishing. Option is `LATEST_PUBLISHED`.

[qualified\_arn](#state_qualified_arn_python) str

ARN identifying your Lambda Function Version (if versioning is enabled via `publish = true`).

[qualified\_invoke\_arn](#state_qualified_invoke_arn_python) str

Qualified ARN (ARN with lambda version number) to be used for invoking Lambda Function from API Gateway - to be used in `aws.apigateway.Integration`'s `uri`.

[region](#state_region_python) str

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[replace\_security\_groups\_on\_destroy](#state_replace_security_groups_on_destroy_python) bool

Whether to replace the security groups on the function's VPC configuration prior to destruction. Default is `false`.

[replacement\_security\_group\_ids](#state_replacement_security_group_ids_python) Sequence\[str\]

List of security group IDs to assign to the function's VPC configuration prior to destruction. Required if `replaceSecurityGroupsOnDestroy` is `true`.

[reserved\_concurrent\_executions](#state_reserved_concurrent_executions_python) int

Amount of reserved concurrent executions for this lambda function. A value of `0` disables lambda from being triggered and `-1` removes any concurrency limitations. Defaults to Unreserved Concurrency Limits `-1`.

[response\_streaming\_invoke\_arn](#state_response_streaming_invoke_arn_python) str

ARN to be used for invoking Lambda Function from API Gateway with response streaming - to be used in `aws.apigateway.Integration`'s `uri`.

[role](#state_role_python) str

ARN of the function's execution role. The role provides the function's identity and access to AWS services and resources.

The following arguments are optional:

[runtime](#state_runtime_python) str | [Runtime](#runtime)

Identifier of the function's runtime. Required if `packageType` is `Zip`. See [Runtimes](https://docs.aws.amazon.com/lambda/latest/dg/API_CreateFunction.html#SSS-CreateFunction-request-Runtime) for valid values.

[s3\_bucket](#state_s3_bucket_python) str

S3 bucket location containing the function's deployment package. Conflicts with `filename` and `imageUri`. One of `filename`, `imageUri`, or `s3Bucket` must be specified.

[s3\_key](#state_s3_key_python) str

S3 key of an object containing the function's deployment package. Required if `s3Bucket` is set.

[s3\_object\_version](#state_s3_object_version_python) str

Object version containing the function's deployment package. Conflicts with `filename` and `imageUri`.

[signing\_job\_arn](#state_signing_job_arn_python) str

ARN of the signing job.

[signing\_profile\_version\_arn](#state_signing_profile_version_arn_python) str

ARN of the signing profile version.

[skip\_destroy](#state_skip_destroy_python) bool

Whether to retain the old version of a previously deployed Lambda Layer. Default is `false`.

[snap\_start](#state_snap_start_python) [FunctionSnapStartArgs](#functionsnapstart)

Configuration block for snap start settings. See below.

[source\_code\_hash](#state_source_code_hash_python) str

User-defined hash of the source code package file. Use this argument to trigger updates when the local function source code changes. This is a synthetic argument tracked only by the AWS provider and does not need to match the hashing algorithm used by Lambda to compute the `CodeSha256` response value. Out-of-band changes to the source code *will not* be captured by this argument. To include out-of-band source code changes as an update trigger, use the `codeSha256` argument instead.

[source\_code\_size](#state_source_code_size_python) int

Size in bytes of the function .zip file.

[source\_kms\_key\_arn](#state_source_kms_key_arn_python) str

ARN of the AWS Key Management Service key used to encrypt the function's `.zip` deployment package. Conflicts with `imageUri`.

[tags](#state_tags_python) Mapping\[str, str\]

Key-value map of tags for the Lambda function. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tags\_all](#state_tags_all_python) Mapping\[str, str\]

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[tenancy\_config](#state_tenancy_config_python) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. [FunctionTenancyConfigArgs](#functiontenancyconfig)

Configuration block for Tenancy. See below.

[timeout](#state_timeout_python) int

Amount of time your Lambda Function has to run in seconds. Defaults to 3. Valid between 1 and 900.

[tracing\_config](#state_tracing_config_python) [FunctionTracingConfigArgs](#functiontracingconfig)

Configuration block for X-Ray tracing. See below.

[version](#state_version_python) str

Latest published version of your Lambda Function.

[vpc\_config](#state_vpc_config_python) [FunctionVpcConfigArgs](#functionvpcconfig)

Configuration block for VPC. See below.

[architectures](#state_architectures_yaml) List<String>

Instruction set architecture for your Lambda function. Valid values are `["x8664"]` and `["arm64"]`. Default is `["x8664"]`. Removing this attribute, function's architecture stays the same.

[arn](#state_arn_yaml) String

ARN identifying your Lambda Function.

[capacityProviderConfig](#state_capacityproviderconfig_yaml) [Property Map](#functioncapacityproviderconfig)

Configuration block for Lambda Capacity Provider. See below.

[code](#state_code_yaml) Archive

Path to the function's deployment package within the local filesystem. Conflicts with `imageUri` and `s3Bucket`. One of `filename`, `imageUri`, or `s3Bucket` must be specified.

[codeSha256](#state_codesha256_yaml) String

Base64-encoded representation the source code package file. Use this argument to trigger updates when the function source code changes. For OCI, this value is relayed directly from the image digest. For zip files, this value is the Base64 encoded SHA-256 hash of the `.zip` file. Layers are not included in the calculation. To trigger updates using a non-standard hashing algorithm, use the `sourceCodeHash` argument instead.

[codeSigningConfigArn](#state_codesigningconfigarn_yaml) String

ARN of a code-signing configuration to enable code signing for this function.

[deadLetterConfig](#state_deadletterconfig_yaml) [Property Map](#functiondeadletterconfig)

Configuration block for dead letter queue. See below.

[description](#state_description_yaml) String

Description of what your Lambda Function does.

[durableConfig](#state_durableconfig_yaml) [Property Map](#functiondurableconfig)

Configuration block for durable function settings. See below. `durableConfig` may only be available in [limited regions](https://builder.aws.com/build/capabilities), including `us-east-2`.

[environment](#state_environment_yaml) [Property Map](#functionenvironment)

Configuration block for environment variables. See below.

[ephemeralStorage](#state_ephemeralstorage_yaml) [Property Map](#functionephemeralstorage)

Amount of ephemeral storage (`/tmp`) to allocate for the Lambda Function. See below.

[fileSystemConfig](#state_filesystemconfig_yaml) [Property Map](#functionfilesystemconfig)

Configuration block for EFS or S3 Files file system. See below.

[handler](#state_handler_yaml) String

Function entry point in your code. Required if `packageType` is `Zip`.

[imageConfig](#state_imageconfig_yaml) [Property Map](#functionimageconfig)

Container image configuration values. See below.

[imageUri](#state_imageuri_yaml) String

ECR image URI containing the function's deployment package. Conflicts with `filename` and `s3Bucket`. One of `filename`, `imageUri`, or `s3Bucket` must be specified.

[invokeArn](#state_invokearn_yaml) String

ARN to be used for invoking Lambda Function from API Gateway - to be used in `aws.apigateway.Integration`'s `uri`.

[kmsKeyArn](#state_kmskeyarn_yaml) String

ARN of the AWS Key Management Service key used to encrypt environment variables. If not provided when environment variables are in use, AWS Lambda uses a default service key. If provided when environment variables are not in use, the AWS Lambda API does not save this configuration.

[lastModified](#state_lastmodified_yaml) String

Date this resource was last modified.

[layers](#state_layers_yaml) List<String>

List of Lambda Layer Version ARNs (maximum of 5) to attach to your Lambda Function.

[loggingConfig](#state_loggingconfig_yaml) [Property Map](#functionloggingconfig)

Configuration block for advanced logging settings. See below.

[memorySize](#state_memorysize_yaml) Number

Amount of memory in MB your Lambda Function can use at runtime. Valid value between 128 MB to 32,768 MB (32 GB), in 1 MB increments. Defaults to 128.

[name](#state_name_yaml) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. String

Unique name for your Lambda Function.

[packageType](#state_packagetype_yaml) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. String

Lambda deployment package type. Valid values are `Zip` and `Image`. Defaults to `Zip`.

[publish](#state_publish_yaml) Boolean

Whether to publish creation/change as new Lambda Function Version. Defaults to `false`.

[publishTo](#state_publishto_yaml) String

Whether to publish to a alias or version number. Omit for regular version publishing. Option is `LATEST_PUBLISHED`.

[qualifiedArn](#state_qualifiedarn_yaml) String

ARN identifying your Lambda Function Version (if versioning is enabled via `publish = true`).

[qualifiedInvokeArn](#state_qualifiedinvokearn_yaml) String

Qualified ARN (ARN with lambda version number) to be used for invoking Lambda Function from API Gateway - to be used in `aws.apigateway.Integration`'s `uri`.

[region](#state_region_yaml) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[replaceSecurityGroupsOnDestroy](#state_replacesecuritygroupsondestroy_yaml) Boolean

Whether to replace the security groups on the function's VPC configuration prior to destruction. Default is `false`.

[replacementSecurityGroupIds](#state_replacementsecuritygroupids_yaml) List<String>

List of security group IDs to assign to the function's VPC configuration prior to destruction. Required if `replaceSecurityGroupsOnDestroy` is `true`.

[reservedConcurrentExecutions](#state_reservedconcurrentexecutions_yaml) Number

Amount of reserved concurrent executions for this lambda function. A value of `0` disables lambda from being triggered and `-1` removes any concurrency limitations. Defaults to Unreserved Concurrency Limits `-1`.

[responseStreamingInvokeArn](#state_responsestreaminginvokearn_yaml) String

ARN to be used for invoking Lambda Function from API Gateway with response streaming - to be used in `aws.apigateway.Integration`'s `uri`.

[role](#state_role_yaml) String

ARN of the function's execution role. The role provides the function's identity and access to AWS services and resources.

The following arguments are optional:

[runtime](#state_runtime_yaml) String | ["dotnet6" | "dotnet8" | "dotnet10" | "java11" | "java17" | "java21" | "java25" | "java8.al2" | "nodejs18.x" | "nodejs20.x" | "nodejs22.x" | "nodejs24.x" | "provided.al2" | "provided.al2023" | "python3.10" | "python3.11" | "python3.12" | "python3.13" | "python3.14" | "python3.9" | "ruby3.2" | "ruby3.3" | "ruby3.4" | "dotnet5.0" | "dotnet7" | "dotnetcore2.1" | "dotnetcore3.1" | "go1.x" | "java8" | "nodejs10.x" | "nodejs12.x" | "nodejs14.x" | "nodejs16.x" | "provided" | "python2.7" | "python3.6" | "python3.7" | "python3.8" | "ruby2.5" | "ruby2.7"](#runtime)

Identifier of the function's runtime. Required if `packageType` is `Zip`. See [Runtimes](https://docs.aws.amazon.com/lambda/latest/dg/API_CreateFunction.html#SSS-CreateFunction-request-Runtime) for valid values.

[s3Bucket](#state_s3bucket_yaml) String

S3 bucket location containing the function's deployment package. Conflicts with `filename` and `imageUri`. One of `filename`, `imageUri`, or `s3Bucket` must be specified.

[s3Key](#state_s3key_yaml) String

S3 key of an object containing the function's deployment package. Required if `s3Bucket` is set.

[s3ObjectVersion](#state_s3objectversion_yaml) String

Object version containing the function's deployment package. Conflicts with `filename` and `imageUri`.

[signingJobArn](#state_signingjobarn_yaml) String

ARN of the signing job.

[signingProfileVersionArn](#state_signingprofileversionarn_yaml) String

ARN of the signing profile version.

[skipDestroy](#state_skipdestroy_yaml) Boolean

Whether to retain the old version of a previously deployed Lambda Layer. Default is `false`.

[snapStart](#state_snapstart_yaml) [Property Map](#functionsnapstart)

Configuration block for snap start settings. See below.

[sourceCodeHash](#state_sourcecodehash_yaml) String

User-defined hash of the source code package file. Use this argument to trigger updates when the local function source code changes. This is a synthetic argument tracked only by the AWS provider and does not need to match the hashing algorithm used by Lambda to compute the `CodeSha256` response value. Out-of-band changes to the source code *will not* be captured by this argument. To include out-of-band source code changes as an update trigger, use the `codeSha256` argument instead.

[sourceCodeSize](#state_sourcecodesize_yaml) Number

Size in bytes of the function .zip file.

[sourceKmsKeyArn](#state_sourcekmskeyarn_yaml) String

ARN of the AWS Key Management Service key used to encrypt the function's `.zip` deployment package. Conflicts with `imageUri`.

[tags](#state_tags_yaml) Map<String>

Key-value map of tags for the Lambda function. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tagsAll](#state_tagsall_yaml) Map<String>

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[tenancyConfig](#state_tenancyconfig_yaml) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. [Property Map](#functiontenancyconfig)

Configuration block for Tenancy. See below.

[timeout](#state_timeout_yaml) Number

Amount of time your Lambda Function has to run in seconds. Defaults to 3. Valid between 1 and 900.

[tracingConfig](#state_tracingconfig_yaml) [Property Map](#functiontracingconfig)

Configuration block for X-Ray tracing. See below.

[version](#state_version_yaml) String

Latest published version of your Lambda Function.

[vpcConfig](#state_vpcconfig_yaml) [Property Map](#functionvpcconfig)

Configuration block for VPC. See below.

## Supporting Types[](#supporting-types)

#### FunctionCapacityProviderConfig, FunctionCapacityProviderConfigArgs[](#functioncapacityproviderconfig)

[LambdaManagedInstancesCapacityProviderConfig](#lambdamanagedinstancescapacityproviderconfig_csharp) This property is required. [FunctionCapacityProviderConfigLambdaManagedInstancesCapacityProviderConfig](#functioncapacityproviderconfiglambdamanagedinstancescapacityproviderconfig)

Configuration block for Lambda Managed Instances Capacity Provider. See below.

[LambdaManagedInstancesCapacityProviderConfig](#lambdamanagedinstancescapacityproviderconfig_go) This property is required. [FunctionCapacityProviderConfigLambdaManagedInstancesCapacityProviderConfig](#functioncapacityproviderconfiglambdamanagedinstancescapacityproviderconfig)

Configuration block for Lambda Managed Instances Capacity Provider. See below.

[lambda\_managed\_instances\_capacity\_provider\_config](#lambda_managed_instances_capacity_provider_config_hcl) This property is required. [object](#functioncapacityproviderconfiglambdamanagedinstancescapacityproviderconfig)

Configuration block for Lambda Managed Instances Capacity Provider. See below.

[lambdaManagedInstancesCapacityProviderConfig](#lambdamanagedinstancescapacityproviderconfig_java) This property is required. [FunctionCapacityProviderConfigLambdaManagedInstancesCapacityProviderConfig](#functioncapacityproviderconfiglambdamanagedinstancescapacityproviderconfig)

Configuration block for Lambda Managed Instances Capacity Provider. See below.

[lambdaManagedInstancesCapacityProviderConfig](#lambdamanagedinstancescapacityproviderconfig_nodejs) This property is required. [FunctionCapacityProviderConfigLambdaManagedInstancesCapacityProviderConfig](#functioncapacityproviderconfiglambdamanagedinstancescapacityproviderconfig)

Configuration block for Lambda Managed Instances Capacity Provider. See below.

[lambda\_managed\_instances\_capacity\_provider\_config](#lambda_managed_instances_capacity_provider_config_python) This property is required. [FunctionCapacityProviderConfigLambdaManagedInstancesCapacityProviderConfig](#functioncapacityproviderconfiglambdamanagedinstancescapacityproviderconfig)

Configuration block for Lambda Managed Instances Capacity Provider. See below.

[lambdaManagedInstancesCapacityProviderConfig](#lambdamanagedinstancescapacityproviderconfig_yaml) This property is required. [Property Map](#functioncapacityproviderconfiglambdamanagedinstancescapacityproviderconfig)

Configuration block for Lambda Managed Instances Capacity Provider. See below.

#### FunctionCapacityProviderConfigLambdaManagedInstancesCapacityProviderConfig, FunctionCapacityProviderConfigLambdaManagedInstancesCapacityProviderConfigArgs[](#functioncapacityproviderconfiglambdamanagedinstancescapacityproviderconfig)

[CapacityProviderArn](#capacityproviderarn_csharp) This property is required. string

ARN of the Capacity Provider.

[ExecutionEnvironmentMemoryGibPerVcpu](#executionenvironmentmemorygibpervcpu_csharp) double

Memory GiB per vCPU for the execution environment.

[PerExecutionEnvironmentMaxConcurrency](#perexecutionenvironmentmaxconcurrency_csharp) int

Maximum concurrency per execution environment.

[CapacityProviderArn](#capacityproviderarn_go) This property is required. string

ARN of the Capacity Provider.

[ExecutionEnvironmentMemoryGibPerVcpu](#executionenvironmentmemorygibpervcpu_go) float64

Memory GiB per vCPU for the execution environment.

[PerExecutionEnvironmentMaxConcurrency](#perexecutionenvironmentmaxconcurrency_go) int

Maximum concurrency per execution environment.

[capacity\_provider\_arn](#capacity_provider_arn_hcl) This property is required. string

ARN of the Capacity Provider.

[execution\_environment\_memory\_gib\_per\_vcpu](#execution_environment_memory_gib_per_vcpu_hcl) number

Memory GiB per vCPU for the execution environment.

[per\_execution\_environment\_max\_concurrency](#per_execution_environment_max_concurrency_hcl) number

Maximum concurrency per execution environment.

[capacityProviderArn](#capacityproviderarn_java) This property is required. String

ARN of the Capacity Provider.

[executionEnvironmentMemoryGibPerVcpu](#executionenvironmentmemorygibpervcpu_java) Double

Memory GiB per vCPU for the execution environment.

[perExecutionEnvironmentMaxConcurrency](#perexecutionenvironmentmaxconcurrency_java) Integer

Maximum concurrency per execution environment.

[capacityProviderArn](#capacityproviderarn_nodejs) This property is required. string

ARN of the Capacity Provider.

[executionEnvironmentMemoryGibPerVcpu](#executionenvironmentmemorygibpervcpu_nodejs) number

Memory GiB per vCPU for the execution environment.

[perExecutionEnvironmentMaxConcurrency](#perexecutionenvironmentmaxconcurrency_nodejs) number

Maximum concurrency per execution environment.

[capacity\_provider\_arn](#capacity_provider_arn_python) This property is required. str

ARN of the Capacity Provider.

[execution\_environment\_memory\_gib\_per\_vcpu](#execution_environment_memory_gib_per_vcpu_python) float

Memory GiB per vCPU for the execution environment.

[per\_execution\_environment\_max\_concurrency](#per_execution_environment_max_concurrency_python) int

Maximum concurrency per execution environment.

[capacityProviderArn](#capacityproviderarn_yaml) This property is required. String

ARN of the Capacity Provider.

[executionEnvironmentMemoryGibPerVcpu](#executionenvironmentmemorygibpervcpu_yaml) Number

Memory GiB per vCPU for the execution environment.

[perExecutionEnvironmentMaxConcurrency](#perexecutionenvironmentmaxconcurrency_yaml) Number

Maximum concurrency per execution environment.

#### FunctionDeadLetterConfig, FunctionDeadLetterConfigArgs[](#functiondeadletterconfig)

[TargetArn](#targetarn_csharp) This property is required. string

ARN of an SNS topic or SQS queue to notify when an invocation fails.

[TargetArn](#targetarn_go) This property is required. string

ARN of an SNS topic or SQS queue to notify when an invocation fails.

[target\_arn](#target_arn_hcl) This property is required. string

ARN of an SNS topic or SQS queue to notify when an invocation fails.

[targetArn](#targetarn_java) This property is required. String

ARN of an SNS topic or SQS queue to notify when an invocation fails.

[targetArn](#targetarn_nodejs) This property is required. string

ARN of an SNS topic or SQS queue to notify when an invocation fails.

[target\_arn](#target_arn_python) This property is required. str

ARN of an SNS topic or SQS queue to notify when an invocation fails.

[targetArn](#targetarn_yaml) This property is required. String

ARN of an SNS topic or SQS queue to notify when an invocation fails.

#### FunctionDurableConfig, FunctionDurableConfigArgs[](#functiondurableconfig)

[ExecutionTimeout](#executiontimeout_csharp) This property is required. int

Maximum execution time in seconds for the durable function. Valid value between 1 and 31622400 (366 days).

[RetentionPeriod](#retentionperiod_csharp) int

Number of days to retain the function's execution state. Valid value between 1 and 90. If not specified, the function's execution state is not retained. Defaults to 14.

[ExecutionTimeout](#executiontimeout_go) This property is required. int

Maximum execution time in seconds for the durable function. Valid value between 1 and 31622400 (366 days).

[RetentionPeriod](#retentionperiod_go) int

Number of days to retain the function's execution state. Valid value between 1 and 90. If not specified, the function's execution state is not retained. Defaults to 14.

[execution\_timeout](#execution_timeout_hcl) This property is required. number

Maximum execution time in seconds for the durable function. Valid value between 1 and 31622400 (366 days).

[retention\_period](#retention_period_hcl) number

Number of days to retain the function's execution state. Valid value between 1 and 90. If not specified, the function's execution state is not retained. Defaults to 14.

[executionTimeout](#executiontimeout_java) This property is required. Integer

Maximum execution time in seconds for the durable function. Valid value between 1 and 31622400 (366 days).

[retentionPeriod](#retentionperiod_java) Integer

Number of days to retain the function's execution state. Valid value between 1 and 90. If not specified, the function's execution state is not retained. Defaults to 14.

[executionTimeout](#executiontimeout_nodejs) This property is required. number

Maximum execution time in seconds for the durable function. Valid value between 1 and 31622400 (366 days).

[retentionPeriod](#retentionperiod_nodejs) number

Number of days to retain the function's execution state. Valid value between 1 and 90. If not specified, the function's execution state is not retained. Defaults to 14.

[execution\_timeout](#execution_timeout_python) This property is required. int

Maximum execution time in seconds for the durable function. Valid value between 1 and 31622400 (366 days).

[retention\_period](#retention_period_python) int

Number of days to retain the function's execution state. Valid value between 1 and 90. If not specified, the function's execution state is not retained. Defaults to 14.

[executionTimeout](#executiontimeout_yaml) This property is required. Number

Maximum execution time in seconds for the durable function. Valid value between 1 and 31622400 (366 days).

[retentionPeriod](#retentionperiod_yaml) Number

Number of days to retain the function's execution state. Valid value between 1 and 90. If not specified, the function's execution state is not retained. Defaults to 14.

#### FunctionEnvironment, FunctionEnvironmentArgs[](#functionenvironment)

[Variables](#variables_csharp) Dictionary<string, string>

Map of environment variables available to your Lambda function during execution.

[Variables](#variables_go) map\[string\]string

Map of environment variables available to your Lambda function during execution.

[variables](#variables_hcl) map(string)

Map of environment variables available to your Lambda function during execution.

[variables](#variables_java) Map<String,String>

Map of environment variables available to your Lambda function during execution.

[variables](#variables_nodejs) {\[key: string\]: string}

Map of environment variables available to your Lambda function during execution.

[variables](#variables_python) Mapping\[str, str\]

Map of environment variables available to your Lambda function during execution.

[variables](#variables_yaml) Map<String>

Map of environment variables available to your Lambda function during execution.

#### FunctionEphemeralStorage, FunctionEphemeralStorageArgs[](#functionephemeralstorage)

[Size](#size_csharp) int

Amount of ephemeral storage (`/tmp`) in MB. Valid between 512 MB and 10,240 MB (10 GB).

[Size](#size_go) int

Amount of ephemeral storage (`/tmp`) in MB. Valid between 512 MB and 10,240 MB (10 GB).

[size](#size_hcl) number

Amount of ephemeral storage (`/tmp`) in MB. Valid between 512 MB and 10,240 MB (10 GB).

[size](#size_java) Integer

Amount of ephemeral storage (`/tmp`) in MB. Valid between 512 MB and 10,240 MB (10 GB).

[size](#size_nodejs) number

Amount of ephemeral storage (`/tmp`) in MB. Valid between 512 MB and 10,240 MB (10 GB).

[size](#size_python) int

Amount of ephemeral storage (`/tmp`) in MB. Valid between 512 MB and 10,240 MB (10 GB).

[size](#size_yaml) Number

Amount of ephemeral storage (`/tmp`) in MB. Valid between 512 MB and 10,240 MB (10 GB).

#### FunctionFileSystemConfig, FunctionFileSystemConfigArgs[](#functionfilesystemconfig)

[Arn](#arn_csharp) This property is required. string

ARN of the Amazon EFS Access Point, or the Amazon S3 Files access point.

[LocalMountPath](#localmountpath_csharp) This property is required. string

Path where the function can access the file system. Must start with `/mnt/`.

[Arn](#arn_go) This property is required. string

ARN of the Amazon EFS Access Point, or the Amazon S3 Files access point.

[LocalMountPath](#localmountpath_go) This property is required. string

Path where the function can access the file system. Must start with `/mnt/`.

[arn](#arn_hcl) This property is required. string

ARN of the Amazon EFS Access Point, or the Amazon S3 Files access point.

[local\_mount\_path](#local_mount_path_hcl) This property is required. string

Path where the function can access the file system. Must start with `/mnt/`.

[arn](#arn_java) This property is required. String

ARN of the Amazon EFS Access Point, or the Amazon S3 Files access point.

[localMountPath](#localmountpath_java) This property is required. String

Path where the function can access the file system. Must start with `/mnt/`.

[arn](#arn_nodejs) This property is required. string

ARN of the Amazon EFS Access Point, or the Amazon S3 Files access point.

[localMountPath](#localmountpath_nodejs) This property is required. string

Path where the function can access the file system. Must start with `/mnt/`.

[arn](#arn_python) This property is required. str

ARN of the Amazon EFS Access Point, or the Amazon S3 Files access point.

[local\_mount\_path](#local_mount_path_python) This property is required. str

Path where the function can access the file system. Must start with `/mnt/`.

[arn](#arn_yaml) This property is required. String

ARN of the Amazon EFS Access Point, or the Amazon S3 Files access point.

[localMountPath](#localmountpath_yaml) This property is required. String

Path where the function can access the file system. Must start with `/mnt/`.

#### FunctionImageConfig, FunctionImageConfigArgs[](#functionimageconfig)

[Commands](#commands_csharp) List<string>

Parameters to pass to the container image.

[EntryPoints](#entrypoints_csharp) List<string>

Entry point to your application.

[WorkingDirectory](#workingdirectory_csharp) string

Working directory for the container image.

[Commands](#commands_go) \[\]string

Parameters to pass to the container image.

[EntryPoints](#entrypoints_go) \[\]string

Entry point to your application.

[WorkingDirectory](#workingdirectory_go) string

Working directory for the container image.

[commands](#commands_hcl) list(string)

Parameters to pass to the container image.

[entry\_points](#entry_points_hcl) list(string)

Entry point to your application.

[working\_directory](#working_directory_hcl) string

Working directory for the container image.

[commands](#commands_java) List<String>

Parameters to pass to the container image.

[entryPoints](#entrypoints_java) List<String>

Entry point to your application.

[workingDirectory](#workingdirectory_java) String

Working directory for the container image.

[commands](#commands_nodejs) string\[\]

Parameters to pass to the container image.

[entryPoints](#entrypoints_nodejs) string\[\]

Entry point to your application.

[workingDirectory](#workingdirectory_nodejs) string

Working directory for the container image.

[commands](#commands_python) Sequence\[str\]

Parameters to pass to the container image.

[entry\_points](#entry_points_python) Sequence\[str\]

Entry point to your application.

[working\_directory](#working_directory_python) str

Working directory for the container image.

[commands](#commands_yaml) List<String>

Parameters to pass to the container image.

[entryPoints](#entrypoints_yaml) List<String>

Entry point to your application.

[workingDirectory](#workingdirectory_yaml) String

Working directory for the container image.

#### FunctionLoggingConfig, FunctionLoggingConfigArgs[](#functionloggingconfig)

[LogFormat](#logformat_csharp) This property is required. string

Log format. Valid values: `Text`, `JSON`.

[ApplicationLogLevel](#applicationloglevel_csharp) string

Detail level of application logs. Valid values: `TRACE`, `DEBUG`, `INFO`, `WARN`, `ERROR`, `FATAL`.

[LogGroup](#loggroup_csharp) string

CloudWatch log group where logs are sent.

[SystemLogLevel](#systemloglevel_csharp) string

Detail level of Lambda platform logs. Valid values: `DEBUG`, `INFO`, `WARN`.

[LogFormat](#logformat_go) This property is required. string

Log format. Valid values: `Text`, `JSON`.

[ApplicationLogLevel](#applicationloglevel_go) string

Detail level of application logs. Valid values: `TRACE`, `DEBUG`, `INFO`, `WARN`, `ERROR`, `FATAL`.

[LogGroup](#loggroup_go) string

CloudWatch log group where logs are sent.

[SystemLogLevel](#systemloglevel_go) string

Detail level of Lambda platform logs. Valid values: `DEBUG`, `INFO`, `WARN`.

[log\_format](#log_format_hcl) This property is required. string

Log format. Valid values: `Text`, `JSON`.

[application\_log\_level](#application_log_level_hcl) string

Detail level of application logs. Valid values: `TRACE`, `DEBUG`, `INFO`, `WARN`, `ERROR`, `FATAL`.

[log\_group](#log_group_hcl) string

CloudWatch log group where logs are sent.

[system\_log\_level](#system_log_level_hcl) string

Detail level of Lambda platform logs. Valid values: `DEBUG`, `INFO`, `WARN`.

[logFormat](#logformat_java) This property is required. String

Log format. Valid values: `Text`, `JSON`.

[applicationLogLevel](#applicationloglevel_java) String

Detail level of application logs. Valid values: `TRACE`, `DEBUG`, `INFO`, `WARN`, `ERROR`, `FATAL`.

[logGroup](#loggroup_java) String

CloudWatch log group where logs are sent.

[systemLogLevel](#systemloglevel_java) String

Detail level of Lambda platform logs. Valid values: `DEBUG`, `INFO`, `WARN`.

[logFormat](#logformat_nodejs) This property is required. string

Log format. Valid values: `Text`, `JSON`.

[applicationLogLevel](#applicationloglevel_nodejs) string

Detail level of application logs. Valid values: `TRACE`, `DEBUG`, `INFO`, `WARN`, `ERROR`, `FATAL`.

[logGroup](#loggroup_nodejs) string

CloudWatch log group where logs are sent.

[systemLogLevel](#systemloglevel_nodejs) string

Detail level of Lambda platform logs. Valid values: `DEBUG`, `INFO`, `WARN`.

[log\_format](#log_format_python) This property is required. str

Log format. Valid values: `Text`, `JSON`.

[application\_log\_level](#application_log_level_python) str

Detail level of application logs. Valid values: `TRACE`, `DEBUG`, `INFO`, `WARN`, `ERROR`, `FATAL`.

[log\_group](#log_group_python) str

CloudWatch log group where logs are sent.

[system\_log\_level](#system_log_level_python) str

Detail level of Lambda platform logs. Valid values: `DEBUG`, `INFO`, `WARN`.

[logFormat](#logformat_yaml) This property is required. String

Log format. Valid values: `Text`, `JSON`.

[applicationLogLevel](#applicationloglevel_yaml) String

Detail level of application logs. Valid values: `TRACE`, `DEBUG`, `INFO`, `WARN`, `ERROR`, `FATAL`.

[logGroup](#loggroup_yaml) String

CloudWatch log group where logs are sent.

[systemLogLevel](#systemloglevel_yaml) String

Detail level of Lambda platform logs. Valid values: `DEBUG`, `INFO`, `WARN`.

#### FunctionSnapStart, FunctionSnapStartArgs[](#functionsnapstart)

[ApplyOn](#applyon_csharp) This property is required. string

When to apply snap start optimization. Valid value: `PublishedVersions`.

[OptimizationStatus](#optimizationstatus_csharp) string

Optimization status of the snap start configuration. Valid values are `On` and `Off`.

[ApplyOn](#applyon_go) This property is required. string

When to apply snap start optimization. Valid value: `PublishedVersions`.

[OptimizationStatus](#optimizationstatus_go) string

Optimization status of the snap start configuration. Valid values are `On` and `Off`.

[apply\_on](#apply_on_hcl) This property is required. string

When to apply snap start optimization. Valid value: `PublishedVersions`.

[optimization\_status](#optimization_status_hcl) string

Optimization status of the snap start configuration. Valid values are `On` and `Off`.

[applyOn](#applyon_java) This property is required. String

When to apply snap start optimization. Valid value: `PublishedVersions`.

[optimizationStatus](#optimizationstatus_java) String

Optimization status of the snap start configuration. Valid values are `On` and `Off`.

[applyOn](#applyon_nodejs) This property is required. string

When to apply snap start optimization. Valid value: `PublishedVersions`.

[optimizationStatus](#optimizationstatus_nodejs) string

Optimization status of the snap start configuration. Valid values are `On` and `Off`.

[apply\_on](#apply_on_python) This property is required. str

When to apply snap start optimization. Valid value: `PublishedVersions`.

[optimization\_status](#optimization_status_python) str

Optimization status of the snap start configuration. Valid values are `On` and `Off`.

[applyOn](#applyon_yaml) This property is required. String

When to apply snap start optimization. Valid value: `PublishedVersions`.

[optimizationStatus](#optimizationstatus_yaml) String

Optimization status of the snap start configuration. Valid values are `On` and `Off`.

#### FunctionTenancyConfig, FunctionTenancyConfigArgs[](#functiontenancyconfig)

[TenantIsolationMode](#tenantisolationmode_csharp) This property is required. string

Tenant Isolation Mode. Valid values: `PER_TENANT`.

[TenantIsolationMode](#tenantisolationmode_go) This property is required. string

Tenant Isolation Mode. Valid values: `PER_TENANT`.

[tenant\_isolation\_mode](#tenant_isolation_mode_hcl) This property is required. string

Tenant Isolation Mode. Valid values: `PER_TENANT`.

[tenantIsolationMode](#tenantisolationmode_java) This property is required. String

Tenant Isolation Mode. Valid values: `PER_TENANT`.

[tenantIsolationMode](#tenantisolationmode_nodejs) This property is required. string

Tenant Isolation Mode. Valid values: `PER_TENANT`.

[tenant\_isolation\_mode](#tenant_isolation_mode_python) This property is required. str

Tenant Isolation Mode. Valid values: `PER_TENANT`.

[tenantIsolationMode](#tenantisolationmode_yaml) This property is required. String

Tenant Isolation Mode. Valid values: `PER_TENANT`.

#### FunctionTracingConfig, FunctionTracingConfigArgs[](#functiontracingconfig)

[Mode](#mode_csharp) This property is required. string

X-Ray tracing mode. Valid values: `Active`, `PassThrough`.

[Mode](#mode_go) This property is required. string

X-Ray tracing mode. Valid values: `Active`, `PassThrough`.

[mode](#mode_hcl) This property is required. string

X-Ray tracing mode. Valid values: `Active`, `PassThrough`.

[mode](#mode_java) This property is required. String

X-Ray tracing mode. Valid values: `Active`, `PassThrough`.

[mode](#mode_nodejs) This property is required. string

X-Ray tracing mode. Valid values: `Active`, `PassThrough`.

[mode](#mode_python) This property is required. str

X-Ray tracing mode. Valid values: `Active`, `PassThrough`.

[mode](#mode_yaml) This property is required. String

X-Ray tracing mode. Valid values: `Active`, `PassThrough`.

#### FunctionVpcConfig, FunctionVpcConfigArgs[](#functionvpcconfig)

[SecurityGroupIds](#securitygroupids_csharp) This property is required. List<string>

List of security group IDs associated with the Lambda function.

[SubnetIds](#subnetids_csharp) This property is required. List<string>

List of subnet IDs associated with the Lambda function.

[Ipv6AllowedForDualStack](#ipv6allowedfordualstack_csharp) bool

Whether to allow outbound IPv6 traffic on VPC functions connected to dual-stack subnets. Default: `false`.

[VpcId](#vpcid_csharp) string

ID of the VPC.

[SecurityGroupIds](#securitygroupids_go) This property is required. \[\]string

List of security group IDs associated with the Lambda function.

[SubnetIds](#subnetids_go) This property is required. \[\]string

List of subnet IDs associated with the Lambda function.

[Ipv6AllowedForDualStack](#ipv6allowedfordualstack_go) bool

Whether to allow outbound IPv6 traffic on VPC functions connected to dual-stack subnets. Default: `false`.

[VpcId](#vpcid_go) string

ID of the VPC.

[security\_group\_ids](#security_group_ids_hcl) This property is required. list(string)

List of security group IDs associated with the Lambda function.

[subnet\_ids](#subnet_ids_hcl) This property is required. list(string)

List of subnet IDs associated with the Lambda function.

[ipv6\_allowed\_for\_dual\_stack](#ipv6_allowed_for_dual_stack_hcl) bool

Whether to allow outbound IPv6 traffic on VPC functions connected to dual-stack subnets. Default: `false`.

[vpc\_id](#vpc_id_hcl) string

ID of the VPC.

[securityGroupIds](#securitygroupids_java) This property is required. List<String>

List of security group IDs associated with the Lambda function.

[subnetIds](#subnetids_java) This property is required. List<String>

List of subnet IDs associated with the Lambda function.

[ipv6AllowedForDualStack](#ipv6allowedfordualstack_java) Boolean

Whether to allow outbound IPv6 traffic on VPC functions connected to dual-stack subnets. Default: `false`.

[vpcId](#vpcid_java) String

ID of the VPC.

[securityGroupIds](#securitygroupids_nodejs) This property is required. string\[\]

List of security group IDs associated with the Lambda function.

[subnetIds](#subnetids_nodejs) This property is required. string\[\]

List of subnet IDs associated with the Lambda function.

[ipv6AllowedForDualStack](#ipv6allowedfordualstack_nodejs) boolean

Whether to allow outbound IPv6 traffic on VPC functions connected to dual-stack subnets. Default: `false`.

[vpcId](#vpcid_nodejs) string

ID of the VPC.

[security\_group\_ids](#security_group_ids_python) This property is required. Sequence\[str\]

List of security group IDs associated with the Lambda function.

[subnet\_ids](#subnet_ids_python) This property is required. Sequence\[str\]

List of subnet IDs associated with the Lambda function.

[ipv6\_allowed\_for\_dual\_stack](#ipv6_allowed_for_dual_stack_python) bool

Whether to allow outbound IPv6 traffic on VPC functions connected to dual-stack subnets. Default: `false`.

[vpc\_id](#vpc_id_python) str

ID of the VPC.

[securityGroupIds](#securitygroupids_yaml) This property is required. List<String>

List of security group IDs associated with the Lambda function.

[subnetIds](#subnetids_yaml) This property is required. List<String>

List of subnet IDs associated with the Lambda function.

[ipv6AllowedForDualStack](#ipv6allowedfordualstack_yaml) Boolean

Whether to allow outbound IPv6 traffic on VPC functions connected to dual-stack subnets. Default: `false`.

[vpcId](#vpcid_yaml) String

ID of the VPC.

#### Runtime, RuntimeArgs[](#runtime)

Dotnet6

`dotnet6`

Dotnet8

`dotnet8`

Dotnet10

`dotnet10`

Java11

`java11`

Java17

`java17`

Java21

`java21`

Java25

`java25`

Java8AL2

`java8.al2`

NodeJS18dX

`nodejs18.x`

NodeJS20dX

`nodejs20.x`

NodeJS22dX

`nodejs22.x`

NodeJS24dX

`nodejs24.x`

CustomAL2

`provided.al2`

CustomAL2023

`provided.al2023`

Python3d10

`python3.10`

Python3d11

`python3.11`

Python3d12

`python3.12`

Python3d13

`python3.13`

Python3d14

`python3.14`

Python3d9

`python3.9`

Ruby3d2

`ruby3.2`

Ruby3d3

`ruby3.3`

Ruby3d4

`ruby3.4`

Dotnet5d0

`dotnet5.0`

Deprecated: This runtime is now deprecated

Dotnet7

`dotnet7`

Deprecated: This runtime is now deprecated

DotnetCore2d1

`dotnetcore2.1`

Deprecated: This runtime is now deprecated

DotnetCore3d1

`dotnetcore3.1`

Deprecated: This runtime is now deprecated

Go1dx

`go1.x`

Deprecated: This runtime is now deprecated

Java8

`java8`

Deprecated: This runtime is now deprecated

NodeJS10dX

`nodejs10.x`

Deprecated: This runtime is now deprecated

NodeJS12dX

`nodejs12.x`

Deprecated: This runtime is now deprecated

NodeJS14dX

`nodejs14.x`

Deprecated: This runtime is now deprecated

NodeJS16dX

`nodejs16.x`

Deprecated: This runtime is now deprecated

Custom

`provided`

Deprecated: This runtime is now deprecated

Python2d7

`python2.7`

Deprecated: This runtime is now deprecated

Python3d6

`python3.6`

Deprecated: This runtime is now deprecated

Python3d7

`python3.7`

Deprecated: This runtime is now deprecated

Python3d8

`python3.8`

Deprecated: This runtime is now deprecated

Ruby2d5

`ruby2.5`

Deprecated: This runtime is now deprecated

Ruby2d7

`ruby2.7`

Deprecated: This runtime is now deprecated

RuntimeDotnet6

`dotnet6`

RuntimeDotnet8

`dotnet8`

RuntimeDotnet10

`dotnet10`

RuntimeJava11

`java11`

RuntimeJava17

`java17`

RuntimeJava21

`java21`

RuntimeJava25

`java25`

RuntimeJava8AL2

`java8.al2`

RuntimeNodeJS18dX

`nodejs18.x`

RuntimeNodeJS20dX

`nodejs20.x`

RuntimeNodeJS22dX

`nodejs22.x`

RuntimeNodeJS24dX

`nodejs24.x`

RuntimeCustomAL2

`provided.al2`

RuntimeCustomAL2023

`provided.al2023`

RuntimePython3d10

`python3.10`

RuntimePython3d11

`python3.11`

RuntimePython3d12

`python3.12`

RuntimePython3d13

`python3.13`

RuntimePython3d14

`python3.14`

RuntimePython3d9

`python3.9`

RuntimeRuby3d2

`ruby3.2`

RuntimeRuby3d3

`ruby3.3`

RuntimeRuby3d4

`ruby3.4`

RuntimeDotnet5d0

`dotnet5.0`

Deprecated: This runtime is now deprecated

RuntimeDotnet7

`dotnet7`

Deprecated: This runtime is now deprecated

RuntimeDotnetCore2d1

`dotnetcore2.1`

Deprecated: This runtime is now deprecated

RuntimeDotnetCore3d1

`dotnetcore3.1`

Deprecated: This runtime is now deprecated

RuntimeGo1dx

`go1.x`

Deprecated: This runtime is now deprecated

RuntimeJava8

`java8`

Deprecated: This runtime is now deprecated

RuntimeNodeJS10dX

`nodejs10.x`

Deprecated: This runtime is now deprecated

RuntimeNodeJS12dX

`nodejs12.x`

Deprecated: This runtime is now deprecated

RuntimeNodeJS14dX

`nodejs14.x`

Deprecated: This runtime is now deprecated

RuntimeNodeJS16dX

`nodejs16.x`

Deprecated: This runtime is now deprecated

RuntimeCustom

`provided`

Deprecated: This runtime is now deprecated

RuntimePython2d7

`python2.7`

Deprecated: This runtime is now deprecated

RuntimePython3d6

`python3.6`

Deprecated: This runtime is now deprecated

RuntimePython3d7

`python3.7`

Deprecated: This runtime is now deprecated

RuntimePython3d8

`python3.8`

Deprecated: This runtime is now deprecated

RuntimeRuby2d5

`ruby2.5`

Deprecated: This runtime is now deprecated

RuntimeRuby2d7

`ruby2.7`

Deprecated: This runtime is now deprecated

"dotnet6"

`dotnet6`

"dotnet8"

`dotnet8`

"dotnet10"

`dotnet10`

"java11"

`java11`

"java17"

`java17`

"java21"

`java21`

"java25"

`java25`

"java8.al2"

`java8.al2`

"nodejs18.x"

`nodejs18.x`

"nodejs20.x"

`nodejs20.x`

"nodejs22.x"

`nodejs22.x`

"nodejs24.x"

`nodejs24.x`

"provided.al2"

`provided.al2`

"provided.al2023"

`provided.al2023`

"python3.10"

`python3.10`

"python3.11"

`python3.11`

"python3.12"

`python3.12`

"python3.13"

`python3.13`

"python3.14"

`python3.14`

"python3.9"

`python3.9`

"ruby3.2"

`ruby3.2`

"ruby3.3"

`ruby3.3`

"ruby3.4"

`ruby3.4`

"dotnet5.0"

`dotnet5.0`

Deprecated: This runtime is now deprecated

"dotnet7"

`dotnet7`

Deprecated: This runtime is now deprecated

"dotnetcore2.1"

`dotnetcore2.1`

Deprecated: This runtime is now deprecated

"dotnetcore3.1"

`dotnetcore3.1`

Deprecated: This runtime is now deprecated

"go1.x"

`go1.x`

Deprecated: This runtime is now deprecated

"java8"

`java8`

Deprecated: This runtime is now deprecated

"nodejs10.x"

`nodejs10.x`

Deprecated: This runtime is now deprecated

"nodejs12.x"

`nodejs12.x`

Deprecated: This runtime is now deprecated

"nodejs14.x"

`nodejs14.x`

Deprecated: This runtime is now deprecated

"nodejs16.x"

`nodejs16.x`

Deprecated: This runtime is now deprecated

"provided"

`provided`

Deprecated: This runtime is now deprecated

"python2.7"

`python2.7`

Deprecated: This runtime is now deprecated

"python3.6"

`python3.6`

Deprecated: This runtime is now deprecated

"python3.7"

`python3.7`

Deprecated: This runtime is now deprecated

"python3.8"

`python3.8`

Deprecated: This runtime is now deprecated

"ruby2.5"

`ruby2.5`

Deprecated: This runtime is now deprecated

"ruby2.7"

`ruby2.7`

Deprecated: This runtime is now deprecated

Dotnet6

`dotnet6`

Dotnet8

`dotnet8`

Dotnet10

`dotnet10`

Java11

`java11`

Java17

`java17`

Java21

`java21`

Java25

`java25`

Java8AL2

`java8.al2`

NodeJS18dX

`nodejs18.x`

NodeJS20dX

`nodejs20.x`

NodeJS22dX

`nodejs22.x`

NodeJS24dX

`nodejs24.x`

CustomAL2

`provided.al2`

CustomAL2023

`provided.al2023`

Python3d10

`python3.10`

Python3d11

`python3.11`

Python3d12

`python3.12`

Python3d13

`python3.13`

Python3d14

`python3.14`

Python3d9

`python3.9`

Ruby3d2

`ruby3.2`

Ruby3d3

`ruby3.3`

Ruby3d4

`ruby3.4`

Dotnet5d0

`dotnet5.0`

Deprecated: This runtime is now deprecated

Dotnet7

`dotnet7`

Deprecated: This runtime is now deprecated

DotnetCore2d1

`dotnetcore2.1`

Deprecated: This runtime is now deprecated

DotnetCore3d1

`dotnetcore3.1`

Deprecated: This runtime is now deprecated

Go1dx

`go1.x`

Deprecated: This runtime is now deprecated

Java8

`java8`

Deprecated: This runtime is now deprecated

NodeJS10dX

`nodejs10.x`

Deprecated: This runtime is now deprecated

NodeJS12dX

`nodejs12.x`

Deprecated: This runtime is now deprecated

NodeJS14dX

`nodejs14.x`

Deprecated: This runtime is now deprecated

NodeJS16dX

`nodejs16.x`

Deprecated: This runtime is now deprecated

Custom

`provided`

Deprecated: This runtime is now deprecated

Python2d7

`python2.7`

Deprecated: This runtime is now deprecated

Python3d6

`python3.6`

Deprecated: This runtime is now deprecated

Python3d7

`python3.7`

Deprecated: This runtime is now deprecated

Python3d8

`python3.8`

Deprecated: This runtime is now deprecated

Ruby2d5

`ruby2.5`

Deprecated: This runtime is now deprecated

Ruby2d7

`ruby2.7`

Deprecated: This runtime is now deprecated

Dotnet6

`dotnet6`

Dotnet8

`dotnet8`

Dotnet10

`dotnet10`

Java11

`java11`

Java17

`java17`

Java21

`java21`

Java25

`java25`

Java8AL2

`java8.al2`

NodeJS18dX

`nodejs18.x`

NodeJS20dX

`nodejs20.x`

NodeJS22dX

`nodejs22.x`

NodeJS24dX

`nodejs24.x`

CustomAL2

`provided.al2`

CustomAL2023

`provided.al2023`

Python3d10

`python3.10`

Python3d11

`python3.11`

Python3d12

`python3.12`

Python3d13

`python3.13`

Python3d14

`python3.14`

Python3d9

`python3.9`

Ruby3d2

`ruby3.2`

Ruby3d3

`ruby3.3`

Ruby3d4

`ruby3.4`

Dotnet5d0

`dotnet5.0`

Deprecated: This runtime is now deprecated

Dotnet7

`dotnet7`

Deprecated: This runtime is now deprecated

DotnetCore2d1

`dotnetcore2.1`

Deprecated: This runtime is now deprecated

DotnetCore3d1

`dotnetcore3.1`

Deprecated: This runtime is now deprecated

Go1dx

`go1.x`

Deprecated: This runtime is now deprecated

Java8

`java8`

Deprecated: This runtime is now deprecated

NodeJS10dX

`nodejs10.x`

Deprecated: This runtime is now deprecated

NodeJS12dX

`nodejs12.x`

Deprecated: This runtime is now deprecated

NodeJS14dX

`nodejs14.x`

Deprecated: This runtime is now deprecated

NodeJS16dX

`nodejs16.x`

Deprecated: This runtime is now deprecated

Custom

`provided`

Deprecated: This runtime is now deprecated

Python2d7

`python2.7`

Deprecated: This runtime is now deprecated

Python3d6

`python3.6`

Deprecated: This runtime is now deprecated

Python3d7

`python3.7`

Deprecated: This runtime is now deprecated

Python3d8

`python3.8`

Deprecated: This runtime is now deprecated

Ruby2d5

`ruby2.5`

Deprecated: This runtime is now deprecated

Ruby2d7

`ruby2.7`

Deprecated: This runtime is now deprecated

DOTNET6

`dotnet6`

DOTNET8

`dotnet8`

DOTNET10

`dotnet10`

JAVA11

`java11`

JAVA17

`java17`

JAVA21

`java21`

JAVA25

`java25`

JAVA8\_AL2

`java8.al2`

NODE\_JS18D\_X

`nodejs18.x`

NODE\_JS20D\_X

`nodejs20.x`

NODE\_JS22D\_X

`nodejs22.x`

NODE\_JS24D\_X

`nodejs24.x`

CUSTOM\_AL2

`provided.al2`

CUSTOM\_AL2023

`provided.al2023`

PYTHON3D10

`python3.10`

PYTHON3D11

`python3.11`

PYTHON3D12

`python3.12`

PYTHON3D13

`python3.13`

PYTHON3D14

`python3.14`

PYTHON3D9

`python3.9`

RUBY3D2

`ruby3.2`

RUBY3D3

`ruby3.3`

RUBY3D4

`ruby3.4`

DOTNET5D0

`dotnet5.0`

Deprecated: This runtime is now deprecated

DOTNET7

`dotnet7`

Deprecated: This runtime is now deprecated

DOTNET\_CORE2D1

`dotnetcore2.1`

Deprecated: This runtime is now deprecated

DOTNET\_CORE3D1

`dotnetcore3.1`

Deprecated: This runtime is now deprecated

GO1DX

`go1.x`

Deprecated: This runtime is now deprecated

JAVA8

`java8`

Deprecated: This runtime is now deprecated

NODE\_JS10D\_X

`nodejs10.x`

Deprecated: This runtime is now deprecated

NODE\_JS12D\_X

`nodejs12.x`

Deprecated: This runtime is now deprecated

NODE\_JS14D\_X

`nodejs14.x`

Deprecated: This runtime is now deprecated

NODE\_JS16D\_X

`nodejs16.x`

Deprecated: This runtime is now deprecated

CUSTOM

`provided`

Deprecated: This runtime is now deprecated

PYTHON2D7

`python2.7`

Deprecated: This runtime is now deprecated

PYTHON3D6

`python3.6`

Deprecated: This runtime is now deprecated

PYTHON3D7

`python3.7`

Deprecated: This runtime is now deprecated

PYTHON3D8

`python3.8`

Deprecated: This runtime is now deprecated

RUBY2D5

`ruby2.5`

Deprecated: This runtime is now deprecated

RUBY2D7

`ruby2.7`

Deprecated: This runtime is now deprecated

"dotnet6"

`dotnet6`

"dotnet8"

`dotnet8`

"dotnet10"

`dotnet10`

"java11"

`java11`

"java17"

`java17`

"java21"

`java21`

"java25"

`java25`

"java8.al2"

`java8.al2`

"nodejs18.x"

`nodejs18.x`

"nodejs20.x"

`nodejs20.x`

"nodejs22.x"

`nodejs22.x`

"nodejs24.x"

`nodejs24.x`

"provided.al2"

`provided.al2`

"provided.al2023"

`provided.al2023`

"python3.10"

`python3.10`

"python3.11"

`python3.11`

"python3.12"

`python3.12`

"python3.13"

`python3.13`

"python3.14"

`python3.14`

"python3.9"

`python3.9`

"ruby3.2"

`ruby3.2`

"ruby3.3"

`ruby3.3`

"ruby3.4"

`ruby3.4`

"dotnet5.0"

`dotnet5.0`

Deprecated: This runtime is now deprecated

"dotnet7"

`dotnet7`

Deprecated: This runtime is now deprecated

"dotnetcore2.1"

`dotnetcore2.1`

Deprecated: This runtime is now deprecated

"dotnetcore3.1"

`dotnetcore3.1`

Deprecated: This runtime is now deprecated

"go1.x"

`go1.x`

Deprecated: This runtime is now deprecated

"java8"

`java8`

Deprecated: This runtime is now deprecated

"nodejs10.x"

`nodejs10.x`

Deprecated: This runtime is now deprecated

"nodejs12.x"

`nodejs12.x`

Deprecated: This runtime is now deprecated

"nodejs14.x"

`nodejs14.x`

Deprecated: This runtime is now deprecated

"nodejs16.x"

`nodejs16.x`

Deprecated: This runtime is now deprecated

"provided"

`provided`

Deprecated: This runtime is now deprecated

"python2.7"

`python2.7`

Deprecated: This runtime is now deprecated

"python3.6"

`python3.6`

Deprecated: This runtime is now deprecated

"python3.7"

`python3.7`

Deprecated: This runtime is now deprecated

"python3.8"

`python3.8`

Deprecated: This runtime is now deprecated

"ruby2.5"

`ruby2.5`

Deprecated: This runtime is now deprecated

"ruby2.7"

`ruby2.7`

Deprecated: This runtime is now deprecated

## Import[](#import)

### Identity Schema[](#identity-schema)

#### Required[](#required)

-   `functionName` (String) Name of the Lambda function.

#### Optional[](#optional)

-   `accountId` (String) AWS Account where this resource is managed.
-   `region` (String) Region where this resource is managed.

Using `pulumi import`, import Lambda Functions using the `functionName`. For example:

```bash
$ pulumi import aws:lambda/function:Function example example
```

To learn more about importing existing cloud resources, see [Importing resources](/docs/using-pulumi/adopting-pulumi/import/).

## Package Details[](#package-details)

Repository

[AWS Classic pulumi/pulumi-aws](https://github.com/pulumi/pulumi-aws)

License

Apache-2.0

Notes

This Pulumi package is based on the [`aws` Terraform Provider](https://github.com/hashicorp/terraform-provider-aws).

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2flambda%2ffunction]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2flambda%2ffunction%2f\))

#### Try Pulumi Cloud free.
Your team will thank you.

[Start free trial](https://app.pulumi.com/signup?utm_source=registry&utm_medium=right-rail-banner&utm_campaign=try-pulumi-cloud&iaid=docs-try-pulumi-cloud-ad)
