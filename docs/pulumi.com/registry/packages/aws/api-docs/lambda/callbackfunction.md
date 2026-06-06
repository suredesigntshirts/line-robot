---
Source: https://www.pulumi.com/registry/packages/aws/api-docs/lambda/callbackfunction/
Generated: 2026-06-06
Updated: 2026-06-06
---

# aws.lambda.CallbackFunction

1.  [Packages](/registry/)
2.  [Packages](/registry/packages/)
3.  [AWS](/registry/packages/aws/)
4.  [API Docs](/registry/packages/aws/api-docs/)
5.  [lambda](/registry/packages/aws/api-docs/lambda/)
6.  [CallbackFunction](/registry/packages/aws/api-docs/lambda/callbackfunction/)

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

Viewing docs for AWS v7.32.0
published on Friday, May 29, 2026 by Pulumi

[Schema (JSON)](/registry/packages/aws/schema.json)

[pulumi/pulumi-aws](https://github.com/pulumi/pulumi-aws)

v7.32.0 (7.x, latest)v6.83.1 (6.x)v5.43.0 (5.x)

# aws.lambda.CallbackFunction[](#aws-lambda-callbackfunction)

Explore with Neo

-   Copy Page

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2flambda%2fcallbackfunction]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2flambda%2fcallbackfunction%2f\))

A CallbackFunction is a special type of `aws.lambda.Function` that can be created out of an actual JavaScript function instance. The Pulumi compiler and runtime work in tandem to extract your function, package it up along with its dependencies, upload the package to AWS Lambda, and configure the resulting AWS Lambda resources automatically.

The JavaScript function may capture references to other variables in the surrounding code, including other resources and even imported modules. The Pulumi compiler figures out how to serialize the resulting closure as it uploads and configures the AWS Lambda. This works even if you are composing multiple functions together.

See [Function Serialization](https://www.pulumi.com/docs/concepts/inputs-outputs/function-serialization/) for additional details on this process.

### Lambda Function Handler[](#lambda-function-handler)

You can provide the JavaScript function used for the Lambda Function’s Handler either directly by setting the `callback` input property or instead specify the `callbackFactory`, which is a Javascript function that will be called to produce the callback function that is the entrypoint for the AWS Lambda. Using `callbackFactory` is useful when there is expensive initialization work that should only be executed once. The factory-function will be invoked once when the final AWS Lambda module is loaded. It can run whatever code it needs, and will end by returning the actual function that Lambda will call into each time the Lambda is invoked.

It is recommended to use an async function, otherwise the Lambda execution will run until the `callback` parameter is called and the event loop is empty. See [Define Lambda function handler in Node.js](https://docs.aws.amazon.com/lambda/latest/dg/nodejs-handler.html) for additional details.

### Lambda Function Permissions[](#lambda-function-permissions)

If neither `role` nor `policies` is specified, `CallbackFunction` will create an IAM role and automatically use the following managed policies:

-   `AWSLambda_FullAccess`
-   `CloudWatchFullAccessV2`
-   `CloudWatchEventsFullAccess`
-   `AmazonS3FullAccess`
-   `AmazonDynamoDBFullAccess`
-   `AmazonSQSFullAccess`
-   `AmazonKinesisFullAccess`
-   `AWSCloudFormationReadOnlyAccess`
-   `AmazonCognitoPowerUser`
-   `AWSXrayWriteOnlyAccess`

### Customizing Lambda function attributes[](#customizing-lambda-function-attributes)

The Lambdas created by `aws.lambda.CallbackFunction` use reasonable defaults for CPU, memory, IAM, logging, and other configuration. Should you need to customize these settings, the `aws.lambda.CallbackFunction` resource offers all of the underlying AWS Lambda settings.

For example, to increase the RAM available to your function to 256MB:

```typescript
import * as aws from "@pulumi/aws";

// Create an AWS Lambda function with 256MB RAM
const lambda = new aws.lambda.CallbackFunction("docsHandlerFunc", {
    callback: async(event: aws.s3.BucketEvent) => {
        // ...
    },

    memorySize: 256 /* MB */,
});
```

### Adding/removing files from a function bundle[](#addingremoving-files-from-a-function-bundle)

Occasionally you may need to customize the contents of function bundle before uploading it to AWS Lambda — for example, to remove unneeded Node.js modules or add certain files or folders to the bundle explicitly. The `codePathOptions` property of `CallbackFunction` allows you to do this.

In this example, a local directory `./config` is added to the function bundle, while an unneeded Node.js module `mime` is removed:

```typescript
import * as aws from "@pulumi/aws";
import * as fs from "fs";

const lambda = new aws.lambda.CallbackFunction("docsHandlerFunc", {
    callback: async(event: aws.s3.BucketEvent) => {
        // ...
    },

    codePathOptions: {

        // Add local files or folders to the Lambda function bundle.
        extraIncludePaths: [
            "./config",
        ],

        // Remove unneeded Node.js packages from the bundle.
        extraExcludePackages: [
            "mime",
        ],
    },
});
```

### Using Lambda layers[](#lambda-layers)

[Lambda layers](https://docs.aws.amazon.com/lambda/latest/dg/chapter-layers.html) allow you to share code, configuration, and other assets across multiple Lambda functions. At runtime, AWS Lambda extracts these files into the function’s filesystem, where you can access their contents as though they belonged to the function bundle itself.

Layers are managed with the [`aws.lambda.LayerVersion`](/registry/packages/aws/api-docs/lambda/layerversion/) resource, and you can attach them to as many `lambda.Function` or `lambda.CallbackFunction` resources as you need using the function’s `layers` property. Here, the preceding program is updated to package the `./config` folder as a Lambda layer instead:

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as fs from "fs";

// Create a Lambda layer containing some shared configuration.
const configLayer = new aws.lambda.LayerVersion("config-layer", {
    layerName: "my-config-layer",

    // Use a Pulumi AssetArchive to zip up the contents of the folder.
    code: new pulumi.asset.AssetArchive({
        "config": new pulumi.asset.FileArchive("./config"),
    }),
});

const lambda = new aws.lambda.CallbackFunction("docsHandlerFunc", {
    callback: async(event: aws.s3.BucketEvent) => {
        // ...
    },

    // Attach the config layer to the function.
    layers: [
        configLayer.arn,
    ],
});
```

Notice the path to the file is now `/opt/config/config.json` — `/opt` being the path at which AWS Lambda extracts the contents of a layer. The configuration layer is now manageable and deployable independently of the Lambda itself, allowing changes to be applied immediately across all functions that use it.

#### Using layers for Node.js dependencies[](#using-layers-for-nodejs-dependencies)

This same approach can be used for sharing Node.js module dependencies. When you package your dependencies [at the proper path](https://docs.aws.amazon.com/lambda/latest/dg/packaging-layers.html) within the layer zip file, (e.g., `nodejs/node_modules`), AWS Lambda will unpack and expose them automatically to the functions that use them at runtime. This approach can be useful in monorepo scenarios such as the example below, which adds a locally built Node.js module as a layer, then references references the module from within the body of a `CallbackFunction`:

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

// Create a layer containing a locally built Node.js module.
const utilsLayer = new aws.lambda.LayerVersion("utils-layer", {
    layerName: "utils",
    code: new pulumi.asset.AssetArchive({

        // Store the module under nodejs/node_modules to make it available
        // on the Node.js module path.
        "nodejs/node_modules/@my-alias/utils": new pulumi.asset.FileArchive("./layers/utils/dist"),
    }),
});

const lambda =  new aws.lambda.CallbackFunction("docsHandlerFunc", {
    callback: async (event: aws.s3.BucketEvent) => {

        // Import the module from the layer at runtime.
        const { sayHello } = await import("@my-alias/utils");

        // Call a function from the utils module.
        console.log(sayHello());
    },

    // Attach the utils layer to the function.
    layers: [
        utilsLayer.arn,
    ],
});
```

Notice the example uses the module name `@my-alias/utils`. To make this work, you’ll need to add a few lines to your Pulumi project’s `tsconfig.json` file to map your chosen module name to the path of the module’s TypeScript source code:

```javascript
{
    "compilerOptions": {
        // ...
        "baseUrl": ".",
        "paths": {
            "@my-alias/utils": [
                "./layers/utils"
            ]
        }
    },
    // ...
}
```

## Example Usage[](#example-usage)

-   TypeScript

### Basic Lambda Function[](#basic-lambda-function)

Example coming soon!

Example coming soon!

Example coming soon!

Example coming soon!

```typescript
import * as aws from "@pulumi/aws";

// Create an AWS Lambda function that fetches the Pulumi website and returns the HTTP status
const lambda = new aws.lambda.CallbackFunction("fetcher", {
    callback: async(event) => {
        try {
            const res = await fetch("https://www.pulumi.com/robots.txt");
            console.info("status", res.status);
            return res.status;
        }
        catch (e) {
            console.error(e);
            return 500;
        }
    },
});
```

Example coming soon!

Example coming soon!

### Lambda Function with expensive initialization work[](#lambda-function-with-expensive-initialization-work)

Example coming soon!

Example coming soon!

Example coming soon!

Example coming soon!

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as express from "express";
import * as serverlessExpress from "aws-serverless-express";
import * as middleware from "aws-serverless-express/middleware";

const lambda = new aws.lambda.CallbackFunction<any, any>("mylambda", {
  callbackFactory: () => {
    const app = express();
    app.use(middleware.eventContext());
    let ctx;

    app.get("/", (req, res) => {
      console.log("Invoked url: " + req.url);

      fetch('https://www.pulumi.com/robots.txt').then(resp => {
        res.json({
          message: "Hello, world!\n\nSucceeded with " + ctx.getRemainingTimeInMillis() + "ms remaining.",
          fetchStatus: resp.status,
          fetched: resp.text(),
        });
      });
    });

    const server = serverlessExpress.createServer(app);
    return (event, context) => {
      console.log("Lambda invoked");
      console.log("Invoked function: " + context.invokedFunctionArn);
      console.log("Proxying to express");
      ctx = context;
      serverlessExpress.proxy(server, event, <any>context);
    }
  }
});
```

Example coming soon!

Example coming soon!

### API Gateway Handler Function[](#api-gateway-handler-function)

Example coming soon!

Example coming soon!

Example coming soon!

Example coming soon!

```typescript
import * as apigateway from "@pulumi/aws-apigateway";
import { APIGatewayProxyEvent, Context } from "aws-lambda";

const api = new apigateway.RestAPI("api", {
    routes: [
        {
            path: "/api",
            eventHandler: async (event: APIGatewayProxyEvent, context: Context) => {
                return {
                    statusCode: 200,
                    body: JSON.stringify({
                        eventPath: event.path,
                        functionName: context.functionName,
                    })
                };
            },
        },
    ],
});

export const url = api.url;
```

Example coming soon!

Example coming soon!

## Create CallbackFunction Resource[](#create)

Resources are created with functions called constructors. To learn more about declaring and configuring resources, see [Resources](/docs/concepts/resources/).

### Constructor syntax[](#constructor-syntax)

-   TypeScript

```typescript
new CallbackFunction(name: string, args?: CallbackFunctionArgs, opts?: CustomResourceOptions);
```

```python
@overload
def CallbackFunction(resource_name: str,
                     args: Optional[CallbackFunctionArgs] = None,
                     opts: Optional[ResourceOptions] = None)

@overload
def CallbackFunction(resource_name: str,
                     opts: Optional[ResourceOptions] = None,
                     architectures: Optional[Sequence[str]] = None,
                     callback: Optional[Any] = None,
                     callback_factory: Optional[Any] = None,
                     capacity_provider_config: Optional[FunctionCapacityProviderConfigArgs] = None,
                     code_path_options: Optional[CodePathOptionsArgs] = None,
                     code_sha256: Optional[str] = None,
                     code_signing_config_arn: Optional[str] = None,
                     dead_letter_config: Optional[FunctionDeadLetterConfigArgs] = None,
                     description: Optional[str] = None,
                     durable_config: Optional[FunctionDurableConfigArgs] = None,
                     environment: Optional[FunctionEnvironmentArgs] = None,
                     ephemeral_storage: Optional[FunctionEphemeralStorageArgs] = None,
                     file_system_config: Optional[FunctionFileSystemConfigArgs] = None,
                     image_config: Optional[FunctionImageConfigArgs] = None,
                     image_uri: Optional[str] = None,
                     kms_key_arn: Optional[str] = None,
                     layers: Optional[Sequence[str]] = None,
                     logging_config: Optional[FunctionLoggingConfigArgs] = None,
                     memory_size: Optional[int] = None,
                     name: Optional[str] = None,
                     package_type: Optional[str] = None,
                     policies: Optional[Union[Mapping[str, str], Sequence[str]]] = None,
                     publish: Optional[bool] = None,
                     publish_to: Optional[str] = None,
                     region: Optional[str] = None,
                     replace_security_groups_on_destroy: Optional[bool] = None,
                     replacement_security_group_ids: Optional[Sequence[str]] = None,
                     reserved_concurrent_executions: Optional[int] = None,
                     role: Optional[str] = None,
                     runtime: Optional[Runtime] = None,
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
func NewCallbackFunction(ctx *Context, name string, args *CallbackFunctionArgs, opts ...ResourceOption) (*CallbackFunction, error)
```

```csharp
public CallbackFunction(string name, CallbackFunctionArgs? args = null, CustomResourceOptions? opts = null)
```

```java
public CallbackFunction(String name, CallbackFunctionArgs args)
public CallbackFunction(String name, CallbackFunctionArgs args, CustomResourceOptions options)
```

```yaml
type: aws:lambda:CallbackFunction
properties: # The arguments to resource properties.
options: # Bag of options to control resource's behavior.
```

```hcl
resource "aws_lambda_callbackfunction" "name" {
    # resource properties
}
```

#### Parameters[](#parameters)

name This property is required. string

The unique name of the resource.

args [CallbackFunctionArgs](#inputs)

The arguments to resource properties.

opts [CustomResourceOptions](/docs/reference/pkg/nodejs/pulumi/pulumi/#CustomResourceOptions)

Bag of options to control resource's behavior.

resource\_name This property is required. str

The unique name of the resource.

args [CallbackFunctionArgs](#inputs)

The arguments to resource properties.

opts [ResourceOptions](/docs/reference/pkg/python/pulumi/#pulumi.ResourceOptions)

Bag of options to control resource's behavior.

ctx [Context](https://pkg.go.dev/github.com/pulumi/pulumi/sdk/v3/go/pulumi?tab=doc#Context)

Context object for the current deployment.

name This property is required. string

The unique name of the resource.

args [CallbackFunctionArgs](#inputs)

The arguments to resource properties.

opts [ResourceOption](https://pkg.go.dev/github.com/pulumi/pulumi/sdk/v3/go/pulumi?tab=doc#ResourceOption)

Bag of options to control resource's behavior.

name This property is required. string

The unique name of the resource.

args [CallbackFunctionArgs](#inputs)

The arguments to resource properties.

opts [CustomResourceOptions](/docs/reference/pkg/dotnet/Pulumi/Pulumi.CustomResourceOptions.html)

Bag of options to control resource's behavior.

name This property is required. String

The unique name of the resource.

args This property is required. [CallbackFunctionArgs](#inputs)

The arguments to resource properties.

options CustomResourceOptions

Bag of options to control resource's behavior.

### Constructor example[](#constructor-example)

The following reference example uses placeholder values for all [input properties](#inputs).

-   TypeScript

```csharp
var callbackFunctionResource = new Aws.Lambda.CallbackFunction("callbackFunctionResource", new()
{
    Architectures = new[]
    {
        "string",
    },
    Callback = "any",
    CallbackFactory = "any",
    CapacityProviderConfig = new Aws.Lambda.Inputs.FunctionCapacityProviderConfigArgs
    {
        LambdaManagedInstancesCapacityProviderConfig = new Aws.Lambda.Inputs.FunctionCapacityProviderConfigLambdaManagedInstancesCapacityProviderConfigArgs
        {
            CapacityProviderArn = "string",
            ExecutionEnvironmentMemoryGibPerVcpu = 0,
            PerExecutionEnvironmentMaxConcurrency = 0,
        },
    },
    CodePathOptions = new Aws.Lambda.Inputs.CodePathOptionsArgs
    {
        ExtraExcludePackages = new[]
        {
            "string",
        },
        ExtraIncludePackages = new[]
        {
            "string",
        },
        ExtraIncludePaths = new[]
        {
            "string",
        },
    },
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
    MemorySize = 0,
    Name = "string",
    PackageType = "string",
    Policies = null,
    Publish = false,
    PublishTo = "string",
    Region = "string",
    ReplaceSecurityGroupsOnDestroy = false,
    ReplacementSecurityGroupIds = new[]
    {
        "string",
    },
    ReservedConcurrentExecutions = 0,
    Role = "string",
    Runtime = Aws.Lambda.Runtime.Dotnet6,
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
example, err := lambda.NewCallbackFunction(ctx, "callbackFunctionResource", &lambda.CallbackFunctionArgs{
	Architectures: pulumi.StringArray{
		pulumi.String("string"),
	},
	Callback:        pulumi.Any("any"),
	CallbackFactory: pulumi.Any("any"),
	CapacityProviderConfig: &lambda.FunctionCapacityProviderConfigArgs{
		LambdaManagedInstancesCapacityProviderConfig: &lambda.FunctionCapacityProviderConfigLambdaManagedInstancesCapacityProviderConfigArgs{
			CapacityProviderArn:                   pulumi.String("string"),
			ExecutionEnvironmentMemoryGibPerVcpu:  pulumi.Float64(0),
			PerExecutionEnvironmentMaxConcurrency: pulumi.Int(0),
		},
	},
	CodePathOptions: &lambda.CodePathOptionsArgs{
		ExtraExcludePackages: pulumi.StringArray{
			pulumi.String("string"),
		},
		ExtraIncludePackages: pulumi.StringArray{
			pulumi.String("string"),
		},
		ExtraIncludePaths: pulumi.StringArray{
			pulumi.String("string"),
		},
	},
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
	MemorySize:                     pulumi.Int(0),
	Name:                           pulumi.String("string"),
	PackageType:                    pulumi.String("string"),
	Policies:                       nil,
	Publish:                        pulumi.Bool(false),
	PublishTo:                      pulumi.String("string"),
	Region:                         pulumi.String("string"),
	ReplaceSecurityGroupsOnDestroy: pulumi.Bool(false),
	ReplacementSecurityGroupIds: pulumi.StringArray{
		pulumi.String("string"),
	},
	ReservedConcurrentExecutions: pulumi.Int(0),
	Role:                         pulumi.String("string"),
	Runtime:                      lambda.RuntimeDotnet6,
	S3Bucket:                     pulumi.String("string"),
	S3Key:                        pulumi.String("string"),
	S3ObjectVersion:              pulumi.String("string"),
	SkipDestroy:                  pulumi.Bool(false),
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
resource "aws_lambda_callbackfunction" "callbackFunctionResource" {
  architectures    = ["string"]
  callback         = "any"
  callback_factory = "any"
  capacity_provider_config = {
    lambda_managed_instances_capacity_provider_config = {
      capacity_provider_arn                     = "string"
      execution_environment_memory_gib_per_vcpu = 0
      per_execution_environment_max_concurrency = 0
    }
  }
  code_path_options = {
    extra_exclude_packages = ["string"]
    extra_include_packages = ["string"]
    extra_include_paths    = ["string"]
  }
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
  memory_size                        = 0
  name                               = "string"
  package_type                       = "string"
  policies                           = null
  publish                            = false
  publish_to                         = "string"
  region                             = "string"
  replace_security_groups_on_destroy = false
  replacement_security_group_ids     = ["string"]
  reserved_concurrent_executions     = 0
  role                               = "string"
  runtime                            = "dotnet6"
  s3_bucket                          = "string"
  s3_key                             = "string"
  s3_object_version                  = "string"
  skip_destroy                       = false
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
var callbackFunctionResource = new CallbackFunction("callbackFunctionResource", CallbackFunctionArgs.builder()
    .architectures("string")
    .callback("any")
    .callbackFactory("any")
    .capacityProviderConfig(FunctionCapacityProviderConfigArgs.builder()
        .lambdaManagedInstancesCapacityProviderConfig(FunctionCapacityProviderConfigLambdaManagedInstancesCapacityProviderConfigArgs.builder()
            .capacityProviderArn("string")
            .executionEnvironmentMemoryGibPerVcpu(0.0)
            .perExecutionEnvironmentMaxConcurrency(0)
            .build())
        .build())
    .codePathOptions(CodePathOptionsArgs.builder()
        .extraExcludePackages("string")
        .extraIncludePackages("string")
        .extraIncludePaths("string")
        .build())
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
    .memorySize(0)
    .name("string")
    .packageType("string")
    .policies(null)
    .publish(false)
    .publishTo("string")
    .region("string")
    .replaceSecurityGroupsOnDestroy(false)
    .replacementSecurityGroupIds("string")
    .reservedConcurrentExecutions(0)
    .role("string")
    .runtime("dotnet6")
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
callback_function_resource = aws.lambda_.CallbackFunction("callbackFunctionResource",
    architectures=["string"],
    callback="any",
    callback_factory="any",
    capacity_provider_config={
        "lambda_managed_instances_capacity_provider_config": {
            "capacity_provider_arn": "string",
            "execution_environment_memory_gib_per_vcpu": float(0),
            "per_execution_environment_max_concurrency": 0,
        },
    },
    code_path_options={
        "extra_exclude_packages": ["string"],
        "extra_include_packages": ["string"],
        "extra_include_paths": ["string"],
    },
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
    memory_size=0,
    name="string",
    package_type="string",
    policies=None,
    publish=False,
    publish_to="string",
    region="string",
    replace_security_groups_on_destroy=False,
    replacement_security_group_ids=["string"],
    reserved_concurrent_executions=0,
    role="string",
    runtime=aws.lambda_.Runtime.DOTNET6,
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
const callbackFunctionResource = new aws.lambda.CallbackFunction("callbackFunctionResource", {
    architectures: ["string"],
    callback: "any",
    callbackFactory: "any",
    capacityProviderConfig: {
        lambdaManagedInstancesCapacityProviderConfig: {
            capacityProviderArn: "string",
            executionEnvironmentMemoryGibPerVcpu: 0,
            perExecutionEnvironmentMaxConcurrency: 0,
        },
    },
    codePathOptions: {
        extraExcludePackages: ["string"],
        extraIncludePackages: ["string"],
        extraIncludePaths: ["string"],
    },
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
    memorySize: 0,
    name: "string",
    packageType: "string",
    policies: null,
    publish: false,
    publishTo: "string",
    region: "string",
    replaceSecurityGroupsOnDestroy: false,
    replacementSecurityGroupIds: ["string"],
    reservedConcurrentExecutions: 0,
    role: "string",
    runtime: aws.lambda.Runtime.Dotnet6,
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
type: aws:lambda:CallbackFunction
properties:
    architectures:
        - string
    callback: any
    callbackFactory: any
    capacityProviderConfig:
        lambdaManagedInstancesCapacityProviderConfig:
            capacityProviderArn: string
            executionEnvironmentMemoryGibPerVcpu: 0
            perExecutionEnvironmentMaxConcurrency: 0
    codePathOptions:
        extraExcludePackages:
            - string
        extraIncludePackages:
            - string
        extraIncludePaths:
            - string
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
    policies: null
    publish: false
    publishTo: string
    region: string
    replaceSecurityGroupsOnDestroy: false
    replacementSecurityGroupIds:
        - string
    reservedConcurrentExecutions: 0
    role: string
    runtime: dotnet6
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

## CallbackFunction Resource Properties[](#properties)

To learn more about resource properties and how to use them, see [Inputs and Outputs](/docs/intro/concepts/inputs-outputs) in the Architecture and Concepts docs.

### Inputs[](#inputs)

In Python, inputs that are objects can be passed either as [argument classes or as dictionary literals](/docs/languages-sdks/python/#inputs-and-outputs).

The CallbackFunction resource accepts the following [input](/docs/intro/concepts/inputs-outputs) properties:

[Architectures](#architectures_csharp) List<string>

Instruction set architecture for your Lambda function. Valid values are `["x8664"]` and `["arm64"]`. Default is `["x8664"]`. Removing this attribute, function's architecture stays the same.

[Callback](#callback_csharp) object

The Javascript function to use as the entrypoint for the AWS Lambda out of. Either callback or callbackFactory must be provided.

[CallbackFactory](#callbackfactory_csharp) object

The Javascript function that will be called to produce the callback function that is the entrypoint for the AWS Lambda. Either callback or callbackFactory must be provided.

[CapacityProviderConfig](#capacityproviderconfig_csharp) [FunctionCapacityProviderConfig](#functioncapacityproviderconfig)

Configuration block for Lambda Capacity Provider. See below.

[CodePathOptions](#codepathoptions_csharp) [CodePathOptions](#codepathoptions)

Options to control which paths/packages should be included or excluded in the zip file containing the code for the AWS lambda.

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

[Name](#name_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Unique name for your Lambda Function.

[PackageType](#packagetype_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Lambda deployment package type. Valid values are `Zip` and `Image`. Defaults to `Zip`.

[Policies](#policies_csharp) Dictionary<string, string> | List<string>

A list of IAM policy ARNs to attach to the Function. Only one of `role` or `policies` can be provided. If neither is provided, the default policies will be used instead.

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

[Role](#role_csharp) string

The execution role for the Lambda Function. The role provides the function's identity and access to AWS services and resources. Only one of `role` or `policies` can be provided. If neither is provided, the default policies will be used instead.

[Runtime](#runtime_csharp) [Pulumi.Aws.Lambda.Runtime](#runtime)

The Lambda runtime to use. If not provided, will default to `NodeJS22dX`.

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

[TenancyConfig](#tenancyconfig_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [FunctionTenancyConfig](#functiontenancyconfig)

Configuration block for Tenancy. See below.

[Timeout](#timeout_csharp) int

Amount of time your Lambda Function has to run in seconds. Defaults to 3. Valid between 1 and 900.

[TracingConfig](#tracingconfig_csharp) [FunctionTracingConfig](#functiontracingconfig)

Configuration block for X-Ray tracing. See below.

[VpcConfig](#vpcconfig_csharp) [FunctionVpcConfig](#functionvpcconfig)

Configuration block for VPC. See below.

[Architectures](#architectures_go) \[\]string

Instruction set architecture for your Lambda function. Valid values are `["x8664"]` and `["arm64"]`. Default is `["x8664"]`. Removing this attribute, function's architecture stays the same.

[Callback](#callback_go) interface{}

The Javascript function to use as the entrypoint for the AWS Lambda out of. Either callback or callbackFactory must be provided.

[CallbackFactory](#callbackfactory_go) interface{}

The Javascript function that will be called to produce the callback function that is the entrypoint for the AWS Lambda. Either callback or callbackFactory must be provided.

[CapacityProviderConfig](#capacityproviderconfig_go) [FunctionCapacityProviderConfigArgs](#functioncapacityproviderconfig)

Configuration block for Lambda Capacity Provider. See below.

[CodePathOptions](#codepathoptions_go) [CodePathOptionsArgs](#codepathoptions)

Options to control which paths/packages should be included or excluded in the zip file containing the code for the AWS lambda.

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

[Name](#name_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Unique name for your Lambda Function.

[PackageType](#packagetype_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Lambda deployment package type. Valid values are `Zip` and `Image`. Defaults to `Zip`.

[Policies](#policies_go) map\[string\]string | \[\]string

A list of IAM policy ARNs to attach to the Function. Only one of `role` or `policies` can be provided. If neither is provided, the default policies will be used instead.

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

[Role](#role_go) string

The execution role for the Lambda Function. The role provides the function's identity and access to AWS services and resources. Only one of `role` or `policies` can be provided. If neither is provided, the default policies will be used instead.

[Runtime](#runtime_go) [Runtime](#runtime)

The Lambda runtime to use. If not provided, will default to `NodeJS22dX`.

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

[TenancyConfig](#tenancyconfig_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [FunctionTenancyConfigArgs](#functiontenancyconfig)

Configuration block for Tenancy. See below.

[Timeout](#timeout_go) int

Amount of time your Lambda Function has to run in seconds. Defaults to 3. Valid between 1 and 900.

[TracingConfig](#tracingconfig_go) [FunctionTracingConfigArgs](#functiontracingconfig)

Configuration block for X-Ray tracing. See below.

[VpcConfig](#vpcconfig_go) [FunctionVpcConfigArgs](#functionvpcconfig)

Configuration block for VPC. See below.

[architectures](#architectures_hcl) list(string)

Instruction set architecture for your Lambda function. Valid values are `["x8664"]` and `["arm64"]`. Default is `["x8664"]`. Removing this attribute, function's architecture stays the same.

[callback](#callback_hcl) any

The Javascript function to use as the entrypoint for the AWS Lambda out of. Either callback or callbackFactory must be provided.

[callback\_factory](#callback_factory_hcl) any

The Javascript function that will be called to produce the callback function that is the entrypoint for the AWS Lambda. Either callback or callbackFactory must be provided.

[capacity\_provider\_config](#capacity_provider_config_hcl) [object](#functioncapacityproviderconfig)

Configuration block for Lambda Capacity Provider. See below.

[code\_path\_options](#code_path_options_hcl) [object](#codepathoptions)

Options to control which paths/packages should be included or excluded in the zip file containing the code for the AWS lambda.

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

[name](#name_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Unique name for your Lambda Function.

[package\_type](#package_type_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Lambda deployment package type. Valid values are `Zip` and `Image`. Defaults to `Zip`.

[policies](#policies_hcl) map(string) | list(string)

A list of IAM policy ARNs to attach to the Function. Only one of `role` or `policies` can be provided. If neither is provided, the default policies will be used instead.

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

[role](#role_hcl) string

The execution role for the Lambda Function. The role provides the function's identity and access to AWS services and resources. Only one of `role` or `policies` can be provided. If neither is provided, the default policies will be used instead.

[runtime](#runtime_hcl) ["dotnet6" | "dotnet8" | "dotnet10" | "java11" | "java17" | "java21" | "java25" | "java8.al2" | "nodejs18.x" | "nodejs20.x" | "nodejs22.x" | "nodejs24.x" | "provided.al2" | "provided.al2023" | "python3.10" | "python3.11" | "python3.12" | "python3.13" | "python3.14" | "python3.9" | "ruby3.2" | "ruby3.3" | "ruby3.4" | "dotnet5.0" | "dotnet7" | "dotnetcore2.1" | "dotnetcore3.1" | "go1.x" | "java8" | "nodejs10.x" | "nodejs12.x" | "nodejs14.x" | "nodejs16.x" | "provided" | "python2.7" | "python3.6" | "python3.7" | "python3.8" | "ruby2.5" | "ruby2.7"](#runtime)

The Lambda runtime to use. If not provided, will default to `NodeJS22dX`.

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

[tenancy\_config](#tenancy_config_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [object](#functiontenancyconfig)

Configuration block for Tenancy. See below.

[timeout](#timeout_hcl) number

Amount of time your Lambda Function has to run in seconds. Defaults to 3. Valid between 1 and 900.

[tracing\_config](#tracing_config_hcl) [object](#functiontracingconfig)

Configuration block for X-Ray tracing. See below.

[vpc\_config](#vpc_config_hcl) [object](#functionvpcconfig)

Configuration block for VPC. See below.

[architectures](#architectures_java) List<String>

Instruction set architecture for your Lambda function. Valid values are `["x8664"]` and `["arm64"]`. Default is `["x8664"]`. Removing this attribute, function's architecture stays the same.

[callback](#callback_java) Object

The Javascript function to use as the entrypoint for the AWS Lambda out of. Either callback or callbackFactory must be provided.

[callbackFactory](#callbackfactory_java) Object

The Javascript function that will be called to produce the callback function that is the entrypoint for the AWS Lambda. Either callback or callbackFactory must be provided.

[capacityProviderConfig](#capacityproviderconfig_java) [FunctionCapacityProviderConfig](#functioncapacityproviderconfig)

Configuration block for Lambda Capacity Provider. See below.

[codePathOptions](#codepathoptions_java) [CodePathOptions](#codepathoptions)

Options to control which paths/packages should be included or excluded in the zip file containing the code for the AWS lambda.

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

[name](#name_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Unique name for your Lambda Function.

[packageType](#packagetype_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Lambda deployment package type. Valid values are `Zip` and `Image`. Defaults to `Zip`.

[policies](#policies_java) Map<String,String> | List<String>

A list of IAM policy ARNs to attach to the Function. Only one of `role` or `policies` can be provided. If neither is provided, the default policies will be used instead.

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

[role](#role_java) String

The execution role for the Lambda Function. The role provides the function's identity and access to AWS services and resources. Only one of `role` or `policies` can be provided. If neither is provided, the default policies will be used instead.

[runtime](#runtime_java) [Runtime](#runtime)

The Lambda runtime to use. If not provided, will default to `NodeJS22dX`.

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

[tenancyConfig](#tenancyconfig_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [FunctionTenancyConfig](#functiontenancyconfig)

Configuration block for Tenancy. See below.

[timeout](#timeout_java) Integer

Amount of time your Lambda Function has to run in seconds. Defaults to 3. Valid between 1 and 900.

[tracingConfig](#tracingconfig_java) [FunctionTracingConfig](#functiontracingconfig)

Configuration block for X-Ray tracing. See below.

[vpcConfig](#vpcconfig_java) [FunctionVpcConfig](#functionvpcconfig)

Configuration block for VPC. See below.

[architectures](#architectures_nodejs) string\[\]

Instruction set architecture for your Lambda function. Valid values are `["x8664"]` and `["arm64"]`. Default is `["x8664"]`. Removing this attribute, function's architecture stays the same.

[callback](#callback_nodejs) any

The Javascript function to use as the entrypoint for the AWS Lambda out of. Either callback or callbackFactory must be provided.

[callbackFactory](#callbackfactory_nodejs) any

The Javascript function that will be called to produce the callback function that is the entrypoint for the AWS Lambda. Either callback or callbackFactory must be provided.

[capacityProviderConfig](#capacityproviderconfig_nodejs) [FunctionCapacityProviderConfig](#functioncapacityproviderconfig)

Configuration block for Lambda Capacity Provider. See below.

[codePathOptions](#codepathoptions_nodejs) [CodePathOptions](#codepathoptions)

Options to control which paths/packages should be included or excluded in the zip file containing the code for the AWS lambda.

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

[name](#name_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Unique name for your Lambda Function.

[packageType](#packagetype_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Lambda deployment package type. Valid values are `Zip` and `Image`. Defaults to `Zip`.

[policies](#policies_nodejs) {\[key: string\]: string} | string\[\]

A list of IAM policy ARNs to attach to the Function. Only one of `role` or `policies` can be provided. If neither is provided, the default policies will be used instead.

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

[role](#role_nodejs) string

The execution role for the Lambda Function. The role provides the function's identity and access to AWS services and resources. Only one of `role` or `policies` can be provided. If neither is provided, the default policies will be used instead.

[runtime](#runtime_nodejs) [Runtime](#runtime)

The Lambda runtime to use. If not provided, will default to `NodeJS22dX`.

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

[tenancyConfig](#tenancyconfig_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [FunctionTenancyConfig](#functiontenancyconfig)

Configuration block for Tenancy. See below.

[timeout](#timeout_nodejs) number

Amount of time your Lambda Function has to run in seconds. Defaults to 3. Valid between 1 and 900.

[tracingConfig](#tracingconfig_nodejs) [FunctionTracingConfig](#functiontracingconfig)

Configuration block for X-Ray tracing. See below.

[vpcConfig](#vpcconfig_nodejs) [FunctionVpcConfig](#functionvpcconfig)

Configuration block for VPC. See below.

[architectures](#architectures_python) Sequence\[str\]

Instruction set architecture for your Lambda function. Valid values are `["x8664"]` and `["arm64"]`. Default is `["x8664"]`. Removing this attribute, function's architecture stays the same.

[callback](#callback_python) Any

The Javascript function to use as the entrypoint for the AWS Lambda out of. Either callback or callbackFactory must be provided.

[callback\_factory](#callback_factory_python) Any

The Javascript function that will be called to produce the callback function that is the entrypoint for the AWS Lambda. Either callback or callbackFactory must be provided.

[capacity\_provider\_config](#capacity_provider_config_python) [FunctionCapacityProviderConfigArgs](#functioncapacityproviderconfig)

Configuration block for Lambda Capacity Provider. See below.

[code\_path\_options](#code_path_options_python) [CodePathOptionsArgs](#codepathoptions)

Options to control which paths/packages should be included or excluded in the zip file containing the code for the AWS lambda.

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

[name](#name_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Unique name for your Lambda Function.

[package\_type](#package_type_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Lambda deployment package type. Valid values are `Zip` and `Image`. Defaults to `Zip`.

[policies](#policies_python) Mapping\[str, str\] | Sequence\[str\]

A list of IAM policy ARNs to attach to the Function. Only one of `role` or `policies` can be provided. If neither is provided, the default policies will be used instead.

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

[role](#role_python) str

The execution role for the Lambda Function. The role provides the function's identity and access to AWS services and resources. Only one of `role` or `policies` can be provided. If neither is provided, the default policies will be used instead.

[runtime](#runtime_python) [Runtime](#runtime)

The Lambda runtime to use. If not provided, will default to `NodeJS22dX`.

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

[tenancy\_config](#tenancy_config_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [FunctionTenancyConfigArgs](#functiontenancyconfig)

Configuration block for Tenancy. See below.

[timeout](#timeout_python) int

Amount of time your Lambda Function has to run in seconds. Defaults to 3. Valid between 1 and 900.

[tracing\_config](#tracing_config_python) [FunctionTracingConfigArgs](#functiontracingconfig)

Configuration block for X-Ray tracing. See below.

[vpc\_config](#vpc_config_python) [FunctionVpcConfigArgs](#functionvpcconfig)

Configuration block for VPC. See below.

[architectures](#architectures_yaml) List<String>

Instruction set architecture for your Lambda function. Valid values are `["x8664"]` and `["arm64"]`. Default is `["x8664"]`. Removing this attribute, function's architecture stays the same.

[callback](#callback_yaml) Any

The Javascript function to use as the entrypoint for the AWS Lambda out of. Either callback or callbackFactory must be provided.

[callbackFactory](#callbackfactory_yaml) Any

The Javascript function that will be called to produce the callback function that is the entrypoint for the AWS Lambda. Either callback or callbackFactory must be provided.

[capacityProviderConfig](#capacityproviderconfig_yaml) [Property Map](#functioncapacityproviderconfig)

Configuration block for Lambda Capacity Provider. See below.

[codePathOptions](#codepathoptions_yaml) [Property Map](#codepathoptions)

Options to control which paths/packages should be included or excluded in the zip file containing the code for the AWS lambda.

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

[name](#name_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Unique name for your Lambda Function.

[packageType](#packagetype_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Lambda deployment package type. Valid values are `Zip` and `Image`. Defaults to `Zip`.

[policies](#policies_yaml) Map<String> | List<String>

A list of IAM policy ARNs to attach to the Function. Only one of `role` or `policies` can be provided. If neither is provided, the default policies will be used instead.

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

[role](#role_yaml) String

The execution role for the Lambda Function. The role provides the function's identity and access to AWS services and resources. Only one of `role` or `policies` can be provided. If neither is provided, the default policies will be used instead.

[runtime](#runtime_yaml) ["dotnet6" | "dotnet8" | "dotnet10" | "java11" | "java17" | "java21" | "java25" | "java8.al2" | "nodejs18.x" | "nodejs20.x" | "nodejs22.x" | "nodejs24.x" | "provided.al2" | "provided.al2023" | "python3.10" | "python3.11" | "python3.12" | "python3.13" | "python3.14" | "python3.9" | "ruby3.2" | "ruby3.3" | "ruby3.4" | "dotnet5.0" | "dotnet7" | "dotnetcore2.1" | "dotnetcore3.1" | "go1.x" | "java8" | "nodejs10.x" | "nodejs12.x" | "nodejs14.x" | "nodejs16.x" | "provided" | "python2.7" | "python3.6" | "python3.7" | "python3.8" | "ruby2.5" | "ruby2.7"](#runtime)

The Lambda runtime to use. If not provided, will default to `NodeJS22dX`.

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

[tenancyConfig](#tenancyconfig_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [Property Map](#functiontenancyconfig)

Configuration block for Tenancy. See below.

[timeout](#timeout_yaml) Number

Amount of time your Lambda Function has to run in seconds. Defaults to 3. Valid between 1 and 900.

[tracingConfig](#tracingconfig_yaml) [Property Map](#functiontracingconfig)

Configuration block for X-Ray tracing. See below.

[vpcConfig](#vpcconfig_yaml) [Property Map](#functionvpcconfig)

Configuration block for VPC. See below.

### Outputs[](#outputs)

All [input](#inputs) properties are implicitly available as output properties. Additionally, the CallbackFunction resource produces the following output properties:

[Id](#id_csharp) string

The provider-assigned unique ID for this managed resource.

[Arn](#arn_csharp) string

ARN identifying your Lambda Function.

[Code](#code_csharp) Archive

Path to the function's deployment package within the local filesystem. Conflicts with `imageUri` and `s3Bucket`. One of `filename`, `imageUri`, or `s3Bucket` must be specified.

[Handler](#handler_csharp) string

Function entry point in your code. Required if `packageType` is `Zip`.

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

[RoleInstance](#roleinstance_csharp) string

The IAM role assigned to this Lambda function. Will be undefined if an ARN was provided for the role input property.

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

[Id](#id_go) string

The provider-assigned unique ID for this managed resource.

[Arn](#arn_go) string

ARN identifying your Lambda Function.

[Code](#code_go) pulumi.Archive

Path to the function's deployment package within the local filesystem. Conflicts with `imageUri` and `s3Bucket`. One of `filename`, `imageUri`, or `s3Bucket` must be specified.

[Handler](#handler_go) string

Function entry point in your code. Required if `packageType` is `Zip`.

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

[RoleInstance](#roleinstance_go) string

The IAM role assigned to this Lambda function. Will be undefined if an ARN was provided for the role input property.

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

[id](#id_hcl) string

The provider-assigned unique ID for this managed resource.

[arn](#arn_hcl) string

ARN identifying your Lambda Function.

[code](#code_hcl) archive

Path to the function's deployment package within the local filesystem. Conflicts with `imageUri` and `s3Bucket`. One of `filename`, `imageUri`, or `s3Bucket` must be specified.

[handler](#handler_hcl) string

Function entry point in your code. Required if `packageType` is `Zip`.

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

[role\_instance](#role_instance_hcl) string

The IAM role assigned to this Lambda function. Will be undefined if an ARN was provided for the role input property.

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

[id](#id_java) String

The provider-assigned unique ID for this managed resource.

[arn](#arn_java) String

ARN identifying your Lambda Function.

[code](#code_java) Archive

Path to the function's deployment package within the local filesystem. Conflicts with `imageUri` and `s3Bucket`. One of `filename`, `imageUri`, or `s3Bucket` must be specified.

[handler](#handler_java) String

Function entry point in your code. Required if `packageType` is `Zip`.

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

[roleInstance](#roleinstance_java) String

The IAM role assigned to this Lambda function. Will be undefined if an ARN was provided for the role input property.

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

[id](#id_nodejs) string

The provider-assigned unique ID for this managed resource.

[arn](#arn_nodejs) string

ARN identifying your Lambda Function.

[code](#code_nodejs) pulumi.asset.Archive

Path to the function's deployment package within the local filesystem. Conflicts with `imageUri` and `s3Bucket`. One of `filename`, `imageUri`, or `s3Bucket` must be specified.

[handler](#handler_nodejs) string

Function entry point in your code. Required if `packageType` is `Zip`.

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

[roleInstance](#roleinstance_nodejs) string

The IAM role assigned to this Lambda function. Will be undefined if an ARN was provided for the role input property.

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

[id](#id_python) str

The provider-assigned unique ID for this managed resource.

[arn](#arn_python) str

ARN identifying your Lambda Function.

[code](#code_python) pulumi.Archive

Path to the function's deployment package within the local filesystem. Conflicts with `imageUri` and `s3Bucket`. One of `filename`, `imageUri`, or `s3Bucket` must be specified.

[handler](#handler_python) str

Function entry point in your code. Required if `packageType` is `Zip`.

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

[role\_instance](#role_instance_python) str

The IAM role assigned to this Lambda function. Will be undefined if an ARN was provided for the role input property.

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

[id](#id_yaml) String

The provider-assigned unique ID for this managed resource.

[arn](#arn_yaml) String

ARN identifying your Lambda Function.

[code](#code_yaml) Archive

Path to the function's deployment package within the local filesystem. Conflicts with `imageUri` and `s3Bucket`. One of `filename`, `imageUri`, or `s3Bucket` must be specified.

[handler](#handler_yaml) String

Function entry point in your code. Required if `packageType` is `Zip`.

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

[roleInstance](#roleinstance_yaml) String

The IAM role assigned to this Lambda function. Will be undefined if an ARN was provided for the role input property.

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

## Supporting Types[](#supporting-types)

#### CodePathOptions

, CodePathOptionsArgs

[](#codepathoptions)

Options to control which paths/packages should be included or excluded in the zip file containing the code for the AWS lambda.

[ExtraExcludePackages](#extraexcludepackages_csharp) List<string>

Packages to explicitly exclude from the Assets for a serialized closure. This can be used when clients want to trim down the size of a closure, and they know that some package won't ever actually be needed at runtime, but is still a dependency of some package that is being used at runtime.

[ExtraIncludePackages](#extraincludepackages_csharp) List<string>

Extra packages to include when producing the Assets for a serialized closure. This can be useful if the packages are acquired in a way that the serialization code does not understand. For example, if there was some sort of module that was pulled in based off of a computed string.

[ExtraIncludePaths](#extraincludepaths_csharp) List<string>

Local file/directory paths that should be included when producing the Assets for a serialized closure.

[ExtraExcludePackages](#extraexcludepackages_go) \[\]string

Packages to explicitly exclude from the Assets for a serialized closure. This can be used when clients want to trim down the size of a closure, and they know that some package won't ever actually be needed at runtime, but is still a dependency of some package that is being used at runtime.

[ExtraIncludePackages](#extraincludepackages_go) \[\]string

Extra packages to include when producing the Assets for a serialized closure. This can be useful if the packages are acquired in a way that the serialization code does not understand. For example, if there was some sort of module that was pulled in based off of a computed string.

[ExtraIncludePaths](#extraincludepaths_go) \[\]string

Local file/directory paths that should be included when producing the Assets for a serialized closure.

[extra\_exclude\_packages](#extra_exclude_packages_hcl) list(string)

Packages to explicitly exclude from the Assets for a serialized closure. This can be used when clients want to trim down the size of a closure, and they know that some package won't ever actually be needed at runtime, but is still a dependency of some package that is being used at runtime.

[extra\_include\_packages](#extra_include_packages_hcl) list(string)

Extra packages to include when producing the Assets for a serialized closure. This can be useful if the packages are acquired in a way that the serialization code does not understand. For example, if there was some sort of module that was pulled in based off of a computed string.

[extra\_include\_paths](#extra_include_paths_hcl) list(string)

Local file/directory paths that should be included when producing the Assets for a serialized closure.

[extraExcludePackages](#extraexcludepackages_java) List<String>

Packages to explicitly exclude from the Assets for a serialized closure. This can be used when clients want to trim down the size of a closure, and they know that some package won't ever actually be needed at runtime, but is still a dependency of some package that is being used at runtime.

[extraIncludePackages](#extraincludepackages_java) List<String>

Extra packages to include when producing the Assets for a serialized closure. This can be useful if the packages are acquired in a way that the serialization code does not understand. For example, if there was some sort of module that was pulled in based off of a computed string.

[extraIncludePaths](#extraincludepaths_java) List<String>

Local file/directory paths that should be included when producing the Assets for a serialized closure.

[extraExcludePackages](#extraexcludepackages_nodejs) string\[\]

Packages to explicitly exclude from the Assets for a serialized closure. This can be used when clients want to trim down the size of a closure, and they know that some package won't ever actually be needed at runtime, but is still a dependency of some package that is being used at runtime.

[extraIncludePackages](#extraincludepackages_nodejs) string\[\]

Extra packages to include when producing the Assets for a serialized closure. This can be useful if the packages are acquired in a way that the serialization code does not understand. For example, if there was some sort of module that was pulled in based off of a computed string.

[extraIncludePaths](#extraincludepaths_nodejs) string\[\]

Local file/directory paths that should be included when producing the Assets for a serialized closure.

[extra\_exclude\_packages](#extra_exclude_packages_python) Sequence\[str\]

Packages to explicitly exclude from the Assets for a serialized closure. This can be used when clients want to trim down the size of a closure, and they know that some package won't ever actually be needed at runtime, but is still a dependency of some package that is being used at runtime.

[extra\_include\_packages](#extra_include_packages_python) Sequence\[str\]

Extra packages to include when producing the Assets for a serialized closure. This can be useful if the packages are acquired in a way that the serialization code does not understand. For example, if there was some sort of module that was pulled in based off of a computed string.

[extra\_include\_paths](#extra_include_paths_python) Sequence\[str\]

Local file/directory paths that should be included when producing the Assets for a serialized closure.

[extraExcludePackages](#extraexcludepackages_yaml) List<String>

Packages to explicitly exclude from the Assets for a serialized closure. This can be used when clients want to trim down the size of a closure, and they know that some package won't ever actually be needed at runtime, but is still a dependency of some package that is being used at runtime.

[extraIncludePackages](#extraincludepackages_yaml) List<String>

Extra packages to include when producing the Assets for a serialized closure. This can be useful if the packages are acquired in a way that the serialization code does not understand. For example, if there was some sort of module that was pulled in based off of a computed string.

[extraIncludePaths](#extraincludepaths_yaml) List<String>

Local file/directory paths that should be included when producing the Assets for a serialized closure.

#### FunctionCapacityProviderConfig

, FunctionCapacityProviderConfigArgs

[](#functioncapacityproviderconfig)

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

#### FunctionCapacityProviderConfigLambdaManagedInstancesCapacityProviderConfig

, FunctionCapacityProviderConfigLambdaManagedInstancesCapacityProviderConfigArgs

[](#functioncapacityproviderconfiglambdamanagedinstancescapacityproviderconfig)

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

#### FunctionDeadLetterConfig

, FunctionDeadLetterConfigArgs

[](#functiondeadletterconfig)

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

#### FunctionDurableConfig

, FunctionDurableConfigArgs

[](#functiondurableconfig)

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

#### FunctionEnvironment

, FunctionEnvironmentArgs

[](#functionenvironment)

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

#### FunctionEphemeralStorage

, FunctionEphemeralStorageArgs

[](#functionephemeralstorage)

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

#### FunctionFileSystemConfig

, FunctionFileSystemConfigArgs

[](#functionfilesystemconfig)

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

#### FunctionImageConfig

, FunctionImageConfigArgs

[](#functionimageconfig)

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

#### FunctionLoggingConfig

, FunctionLoggingConfigArgs

[](#functionloggingconfig)

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

#### FunctionSnapStart

, FunctionSnapStartArgs

[](#functionsnapstart)

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

#### FunctionTenancyConfig

, FunctionTenancyConfigArgs

[](#functiontenancyconfig)

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

#### FunctionTracingConfig

, FunctionTracingConfigArgs

[](#functiontracingconfig)

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

#### FunctionVpcConfig

, FunctionVpcConfigArgs

[](#functionvpcconfig)

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

#### Runtime

, RuntimeArgs

[](#runtime)

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

## Package Details[](#package-details)

Repository

[AWS Classic pulumi/pulumi-aws](https://github.com/pulumi/pulumi-aws)

License

Apache-2.0

Notes

This Pulumi package is based on the [`aws` Terraform Provider](https://github.com/hashicorp/terraform-provider-aws).

-   Copy Page

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2flambda%2fcallbackfunction]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2flambda%2fcallbackfunction%2f\))

#### Try Pulumi Cloud free.
Your team will thank you.

[Start free trial](https://app.pulumi.com/signup?utm_source=registry&utm_medium=right-rail-banner&utm_campaign=try-pulumi-cloud&iaid=docs-try-pulumi-cloud-ad)
