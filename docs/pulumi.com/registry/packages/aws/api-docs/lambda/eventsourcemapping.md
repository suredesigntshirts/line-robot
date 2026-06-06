---
Source: https://www.pulumi.com/registry/packages/aws/api-docs/lambda/eventsourcemapping/
Generated: 2026-06-06
Updated: 2026-06-06
---

# aws.lambda.EventSourceMapping

1.  [Packages](/registry/)
2.  [Packages](/registry/packages/)
3.  [AWS](/registry/packages/aws/)
4.  [API Docs](/registry/packages/aws/api-docs/)
5.  [lambda](/registry/packages/aws/api-docs/lambda/)
6.  [EventSourceMapping](/registry/packages/aws/api-docs/lambda/eventsourcemapping/)

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

Viewing docs for AWS v7.32.0
published on Friday, May 29, 2026 by Pulumi

[Schema (JSON)](/registry/packages/aws/schema.json)

[pulumi/pulumi-aws](https://github.com/pulumi/pulumi-aws)

v7.32.0 (7.x, latest)v6.83.1 (6.x)v5.43.0 (5.x)

# aws.lambda.EventSourceMapping[](#aws-lambda-eventsourcemapping)

Explore with Neo

-   Copy Page

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2flambda%2feventsourcemapping]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2flambda%2feventsourcemapping%2f\))

Manages an AWS Lambda Event Source Mapping. Use this resource to connect Lambda functions to event sources like Kinesis, DynamoDB, SQS, Amazon MQ, and Managed Streaming for Apache Kafka (MSK).

For information about Lambda and how to use it, see [What is AWS Lambda?](http://docs.aws.amazon.com/lambda/latest/dg/welcome.html). For information about event source mappings, see [CreateEventSourceMapping](http://docs.aws.amazon.com/lambda/latest/dg/API_CreateEventSourceMapping.html) in the API docs.

## Example Usage[](#example-usage)

### DynamoDB Stream[](#dynamodb-stream)

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

const example = new aws.lambda.EventSourceMapping("example", {
    eventSourceArn: exampleAwsDynamodbTable.streamArn,
    functionName: exampleAwsLambdaFunction.arn,
    startingPosition: "LATEST",
    tags: {
        Name: "dynamodb-stream-mapping",
    },
});
```

```python
import pulumi
import pulumi_aws as aws

example = aws.lambda_.EventSourceMapping("example",
    event_source_arn=example_aws_dynamodb_table["streamArn"],
    function_name=example_aws_lambda_function["arn"],
    starting_position="LATEST",
    tags={
        "Name": "dynamodb-stream-mapping",
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
		_, err := lambda.NewEventSourceMapping(ctx, "example", &lambda.EventSourceMappingArgs{
			EventSourceArn:   pulumi.Any(exampleAwsDynamodbTable.StreamArn),
			FunctionName:     pulumi.Any(exampleAwsLambdaFunction.Arn),
			StartingPosition: pulumi.String("LATEST"),
			Tags: pulumi.StringMap{
				"Name": pulumi.String("dynamodb-stream-mapping"),
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
    var example = new Aws.Lambda.EventSourceMapping("example", new()
    {
        EventSourceArn = exampleAwsDynamodbTable.StreamArn,
        FunctionName = exampleAwsLambdaFunction.Arn,
        StartingPosition = "LATEST",
        Tags =
        {
            { "Name", "dynamodb-stream-mapping" },
        },
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.lambda.EventSourceMapping;
import com.pulumi.aws.lambda.EventSourceMappingArgs;
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
        var example = new EventSourceMapping("example", EventSourceMappingArgs.builder()
            .eventSourceArn(exampleAwsDynamodbTable.streamArn())
            .functionName(exampleAwsLambdaFunction.arn())
            .startingPosition("LATEST")
            .tags(Map.of("Name", "dynamodb-stream-mapping"))
            .build());

    }
}
```

```yaml
resources:
  example:
    type: aws:lambda:EventSourceMapping
    properties:
      eventSourceArn: ${exampleAwsDynamodbTable.streamArn}
      functionName: ${exampleAwsLambdaFunction.arn}
      startingPosition: LATEST
      tags:
        Name: dynamodb-stream-mapping
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_lambda_eventsourcemapping" "example" {
  event_source_arn  = exampleAwsDynamodbTable.streamArn
  function_name     = exampleAwsLambdaFunction.arn
  starting_position = "LATEST"
  tags = {
    "Name" = "dynamodb-stream-mapping"
  }
}
```

### Kinesis Stream[](#kinesis-stream)

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

const example = new aws.lambda.EventSourceMapping("example", {
    eventSourceArn: exampleAwsKinesisStream.arn,
    functionName: exampleAwsLambdaFunction.arn,
    startingPosition: "LATEST",
    batchSize: 100,
    maximumBatchingWindowInSeconds: 5,
    parallelizationFactor: 2,
    destinationConfig: {
        onFailure: {
            destinationArn: dlq.arn,
        },
    },
});
```

```python
import pulumi
import pulumi_aws as aws

example = aws.lambda_.EventSourceMapping("example",
    event_source_arn=example_aws_kinesis_stream["arn"],
    function_name=example_aws_lambda_function["arn"],
    starting_position="LATEST",
    batch_size=100,
    maximum_batching_window_in_seconds=5,
    parallelization_factor=2,
    destination_config={
        "on_failure": {
            "destination_arn": dlq["arn"],
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
		_, err := lambda.NewEventSourceMapping(ctx, "example", &lambda.EventSourceMappingArgs{
			EventSourceArn:                 pulumi.Any(exampleAwsKinesisStream.Arn),
			FunctionName:                   pulumi.Any(exampleAwsLambdaFunction.Arn),
			StartingPosition:               pulumi.String("LATEST"),
			BatchSize:                      pulumi.Int(100),
			MaximumBatchingWindowInSeconds: pulumi.Int(5),
			ParallelizationFactor:          pulumi.Int(2),
			DestinationConfig: &lambda.EventSourceMappingDestinationConfigArgs{
				OnFailure: &lambda.EventSourceMappingDestinationConfigOnFailureArgs{
					DestinationArn: pulumi.Any(dlq.Arn),
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
    var example = new Aws.Lambda.EventSourceMapping("example", new()
    {
        EventSourceArn = exampleAwsKinesisStream.Arn,
        FunctionName = exampleAwsLambdaFunction.Arn,
        StartingPosition = "LATEST",
        BatchSize = 100,
        MaximumBatchingWindowInSeconds = 5,
        ParallelizationFactor = 2,
        DestinationConfig = new Aws.Lambda.Inputs.EventSourceMappingDestinationConfigArgs
        {
            OnFailure = new Aws.Lambda.Inputs.EventSourceMappingDestinationConfigOnFailureArgs
            {
                DestinationArn = dlq.Arn,
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
import com.pulumi.aws.lambda.EventSourceMapping;
import com.pulumi.aws.lambda.EventSourceMappingArgs;
import com.pulumi.aws.lambda.inputs.EventSourceMappingDestinationConfigArgs;
import com.pulumi.aws.lambda.inputs.EventSourceMappingDestinationConfigOnFailureArgs;
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
        var example = new EventSourceMapping("example", EventSourceMappingArgs.builder()
            .eventSourceArn(exampleAwsKinesisStream.arn())
            .functionName(exampleAwsLambdaFunction.arn())
            .startingPosition("LATEST")
            .batchSize(100)
            .maximumBatchingWindowInSeconds(5)
            .parallelizationFactor(2)
            .destinationConfig(EventSourceMappingDestinationConfigArgs.builder()
                .onFailure(EventSourceMappingDestinationConfigOnFailureArgs.builder()
                    .destinationArn(dlq.arn())
                    .build())
                .build())
            .build());

    }
}
```

```yaml
resources:
  example:
    type: aws:lambda:EventSourceMapping
    properties:
      eventSourceArn: ${exampleAwsKinesisStream.arn}
      functionName: ${exampleAwsLambdaFunction.arn}
      startingPosition: LATEST
      batchSize: 100
      maximumBatchingWindowInSeconds: 5
      parallelizationFactor: 2
      destinationConfig:
        onFailure:
          destinationArn: ${dlq.arn}
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_lambda_eventsourcemapping" "example" {
  event_source_arn                   = exampleAwsKinesisStream.arn
  function_name                      = exampleAwsLambdaFunction.arn
  starting_position                  = "LATEST"
  batch_size                         = 100
  maximum_batching_window_in_seconds = 5
  parallelization_factor             = 2
  destination_config = {
    on_failure = {
      destination_arn = dlq.arn
    }
  }
}
```

### SQS Queue[](#sqs-queue)

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

const example = new aws.lambda.EventSourceMapping("example", {
    eventSourceArn: exampleAwsSqsQueue.arn,
    functionName: exampleAwsLambdaFunction.arn,
    batchSize: 10,
    scalingConfig: {
        maximumConcurrency: 100,
    },
});
```

```python
import pulumi
import pulumi_aws as aws

example = aws.lambda_.EventSourceMapping("example",
    event_source_arn=example_aws_sqs_queue["arn"],
    function_name=example_aws_lambda_function["arn"],
    batch_size=10,
    scaling_config={
        "maximum_concurrency": 100,
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
		_, err := lambda.NewEventSourceMapping(ctx, "example", &lambda.EventSourceMappingArgs{
			EventSourceArn: pulumi.Any(exampleAwsSqsQueue.Arn),
			FunctionName:   pulumi.Any(exampleAwsLambdaFunction.Arn),
			BatchSize:      pulumi.Int(10),
			ScalingConfig: &lambda.EventSourceMappingScalingConfigArgs{
				MaximumConcurrency: pulumi.Int(100),
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
    var example = new Aws.Lambda.EventSourceMapping("example", new()
    {
        EventSourceArn = exampleAwsSqsQueue.Arn,
        FunctionName = exampleAwsLambdaFunction.Arn,
        BatchSize = 10,
        ScalingConfig = new Aws.Lambda.Inputs.EventSourceMappingScalingConfigArgs
        {
            MaximumConcurrency = 100,
        },
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.lambda.EventSourceMapping;
import com.pulumi.aws.lambda.EventSourceMappingArgs;
import com.pulumi.aws.lambda.inputs.EventSourceMappingScalingConfigArgs;
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
        var example = new EventSourceMapping("example", EventSourceMappingArgs.builder()
            .eventSourceArn(exampleAwsSqsQueue.arn())
            .functionName(exampleAwsLambdaFunction.arn())
            .batchSize(10)
            .scalingConfig(EventSourceMappingScalingConfigArgs.builder()
                .maximumConcurrency(100)
                .build())
            .build());

    }
}
```

```yaml
resources:
  example:
    type: aws:lambda:EventSourceMapping
    properties:
      eventSourceArn: ${exampleAwsSqsQueue.arn}
      functionName: ${exampleAwsLambdaFunction.arn}
      batchSize: 10
      scalingConfig:
        maximumConcurrency: 100
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_lambda_eventsourcemapping" "example" {
  event_source_arn = exampleAwsSqsQueue.arn
  function_name    = exampleAwsLambdaFunction.arn
  batch_size       = 10
  scaling_config = {
    maximum_concurrency = 100
  }
}
```

### SQS with Event Filtering[](#sqs-with-event-filtering)

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

const example = new aws.lambda.EventSourceMapping("example", {
    eventSourceArn: exampleAwsSqsQueue.arn,
    functionName: exampleAwsLambdaFunction.arn,
    filterCriteria: {
        filters: [{
            pattern: JSON.stringify({
                body: {
                    Temperature: [{
                        numeric: [
                            ">",
                            0,
                            "<=",
                            100,
                        ],
                    }],
                    Location: ["New York"],
                },
            }),
        }],
    },
});
```

```python
import pulumi
import json
import pulumi_aws as aws

example = aws.lambda_.EventSourceMapping("example",
    event_source_arn=example_aws_sqs_queue["arn"],
    function_name=example_aws_lambda_function["arn"],
    filter_criteria={
        "filters": [{
            "pattern": json.dumps({
                "body": {
                    "Temperature": [{
                        "numeric": [
                            ">",
                            0,
                            "<=",
                            100,
                        ],
                    }],
                    "Location": ["New York"],
                },
            }),
        }],
    })
```

```go
package main

import (
	"encoding/json"

	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/lambda"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		tmpJSON0, err := json.Marshal(map[string]interface{}{
			"body": map[string]interface{}{
				"Temperature": []map[string]interface{}{
					map[string]interface{}{
						"numeric": []interface{}{
							">",
							0,
							"<=",
							100,
						},
					},
				},
				"Location": []string{
					"New York",
				},
			},
		})
		if err != nil {
			return err
		}
		json0 := string(tmpJSON0)
		_, err = lambda.NewEventSourceMapping(ctx, "example", &lambda.EventSourceMappingArgs{
			EventSourceArn: pulumi.Any(exampleAwsSqsQueue.Arn),
			FunctionName:   pulumi.Any(exampleAwsLambdaFunction.Arn),
			FilterCriteria: &lambda.EventSourceMappingFilterCriteriaArgs{
				Filters: lambda.EventSourceMappingFilterCriteriaFilterArray{
					&lambda.EventSourceMappingFilterCriteriaFilterArgs{
						Pattern: pulumi.String(pulumi.String(json0)),
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
using System.Text.Json;
using Pulumi;
using Aws = Pulumi.Aws;

return await Deployment.RunAsync(() =>
{
    var example = new Aws.Lambda.EventSourceMapping("example", new()
    {
        EventSourceArn = exampleAwsSqsQueue.Arn,
        FunctionName = exampleAwsLambdaFunction.Arn,
        FilterCriteria = new Aws.Lambda.Inputs.EventSourceMappingFilterCriteriaArgs
        {
            Filters = new[]
            {
                new Aws.Lambda.Inputs.EventSourceMappingFilterCriteriaFilterArgs
                {
                    Pattern = JsonSerializer.Serialize(new Dictionary<string, object?>
                    {
                        ["body"] = new Dictionary<string, object?>
                        {
                            ["Temperature"] = new[]
                            {
                                new Dictionary<string, object?>
                                {
                                    ["numeric"] = new object?[]
                                    {
                                        ">",
                                        0,
                                        "<=",
                                        100,
                                    },
                                },
                            },
                            ["Location"] = new[]
                            {
                                "New York",
                            },
                        },
                    }),
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
import com.pulumi.aws.lambda.EventSourceMapping;
import com.pulumi.aws.lambda.EventSourceMappingArgs;
import com.pulumi.aws.lambda.inputs.EventSourceMappingFilterCriteriaArgs;
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
        var example = new EventSourceMapping("example", EventSourceMappingArgs.builder()
            .eventSourceArn(exampleAwsSqsQueue.arn())
            .functionName(exampleAwsLambdaFunction.arn())
            .filterCriteria(EventSourceMappingFilterCriteriaArgs.builder()
                .filters(EventSourceMappingFilterCriteriaFilterArgs.builder()
                    .pattern(serializeJson(
                        jsonObject(
                            jsonProperty("body", jsonObject(
                                jsonProperty("Temperature", jsonArray(jsonObject(
                                    jsonProperty("numeric", jsonArray(
                                        ">",
                                        0,
                                        "<=",
                                        100
                                    ))
                                ))),
                                jsonProperty("Location", jsonArray("New York"))
                            ))
                        )))
                    .build())
                .build())
            .build());

    }
}
```

```yaml
resources:
  example:
    type: aws:lambda:EventSourceMapping
    properties:
      eventSourceArn: ${exampleAwsSqsQueue.arn}
      functionName: ${exampleAwsLambdaFunction.arn}
      filterCriteria:
        filters:
          - pattern:
              fn::toJSON:
                body:
                  Temperature:
                    - numeric:
                        - '>'
                        - 0
                        - <=
                        - 100
                  Location:
                    - New York
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_lambda_eventsourcemapping" "example" {
  event_source_arn = exampleAwsSqsQueue.arn
  function_name    = exampleAwsLambdaFunction.arn
  filter_criteria = {
    filters = [{
      "pattern" = jsonencode({
        "body" = {
          "Temperature" = [{
            "numeric" = [">", 0, "<=", 100]
          }]
          "Location" = ["New York"]
        }
      })
    }]
  }
}
```

### Amazon MSK[](#amazon-msk)

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

const example = new aws.lambda.EventSourceMapping("example", {
    eventSourceArn: exampleAwsMskCluster.arn,
    functionName: exampleAwsLambdaFunction.arn,
    topics: [
        "orders",
        "inventory",
    ],
    startingPosition: "TRIM_HORIZON",
    batchSize: 100,
    amazonManagedKafkaEventSourceConfig: {
        consumerGroupId: "lambda-consumer-group",
    },
});
```

```python
import pulumi
import pulumi_aws as aws

example = aws.lambda_.EventSourceMapping("example",
    event_source_arn=example_aws_msk_cluster["arn"],
    function_name=example_aws_lambda_function["arn"],
    topics=[
        "orders",
        "inventory",
    ],
    starting_position="TRIM_HORIZON",
    batch_size=100,
    amazon_managed_kafka_event_source_config={
        "consumer_group_id": "lambda-consumer-group",
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
		_, err := lambda.NewEventSourceMapping(ctx, "example", &lambda.EventSourceMappingArgs{
			EventSourceArn: pulumi.Any(exampleAwsMskCluster.Arn),
			FunctionName:   pulumi.Any(exampleAwsLambdaFunction.Arn),
			Topics: pulumi.StringArray{
				pulumi.String("orders"),
				pulumi.String("inventory"),
			},
			StartingPosition: pulumi.String("TRIM_HORIZON"),
			BatchSize:        pulumi.Int(100),
			AmazonManagedKafkaEventSourceConfig: &lambda.EventSourceMappingAmazonManagedKafkaEventSourceConfigArgs{
				ConsumerGroupId: pulumi.String("lambda-consumer-group"),
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
    var example = new Aws.Lambda.EventSourceMapping("example", new()
    {
        EventSourceArn = exampleAwsMskCluster.Arn,
        FunctionName = exampleAwsLambdaFunction.Arn,
        Topics = new[]
        {
            "orders",
            "inventory",
        },
        StartingPosition = "TRIM_HORIZON",
        BatchSize = 100,
        AmazonManagedKafkaEventSourceConfig = new Aws.Lambda.Inputs.EventSourceMappingAmazonManagedKafkaEventSourceConfigArgs
        {
            ConsumerGroupId = "lambda-consumer-group",
        },
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.lambda.EventSourceMapping;
import com.pulumi.aws.lambda.EventSourceMappingArgs;
import com.pulumi.aws.lambda.inputs.EventSourceMappingAmazonManagedKafkaEventSourceConfigArgs;
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
        var example = new EventSourceMapping("example", EventSourceMappingArgs.builder()
            .eventSourceArn(exampleAwsMskCluster.arn())
            .functionName(exampleAwsLambdaFunction.arn())
            .topics(
                "orders",
                "inventory")
            .startingPosition("TRIM_HORIZON")
            .batchSize(100)
            .amazonManagedKafkaEventSourceConfig(EventSourceMappingAmazonManagedKafkaEventSourceConfigArgs.builder()
                .consumerGroupId("lambda-consumer-group")
                .build())
            .build());

    }
}
```

```yaml
resources:
  example:
    type: aws:lambda:EventSourceMapping
    properties:
      eventSourceArn: ${exampleAwsMskCluster.arn}
      functionName: ${exampleAwsLambdaFunction.arn}
      topics:
        - orders
        - inventory
      startingPosition: TRIM_HORIZON
      batchSize: 100
      amazonManagedKafkaEventSourceConfig:
        consumerGroupId: lambda-consumer-group
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_lambda_eventsourcemapping" "example" {
  event_source_arn  = exampleAwsMskCluster.arn
  function_name     = exampleAwsLambdaFunction.arn
  topics            = ["orders", "inventory"]
  starting_position = "TRIM_HORIZON"
  batch_size        = 100
  amazon_managed_kafka_event_source_config = {
    consumer_group_id = "lambda-consumer-group"
  }
}
```

### Self-Managed Apache Kafka[](#self-managed-apache-kafka)

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

const example = new aws.lambda.EventSourceMapping("example", {
    functionName: exampleAwsLambdaFunction.arn,
    topics: ["orders"],
    startingPosition: "TRIM_HORIZON",
    selfManagedEventSource: {
        endpoints: {
            KAFKA_BOOTSTRAP_SERVERS: "kafka1.example.com:9092,kafka2.example.com:9092",
        },
    },
    selfManagedKafkaEventSourceConfig: {
        consumerGroupId: "lambda-consumer-group",
    },
    sourceAccessConfigurations: [
        {
            type: "VPC_SUBNET",
            uri: `subnet:${example1.id}`,
        },
        {
            type: "VPC_SUBNET",
            uri: `subnet:${example2.id}`,
        },
        {
            type: "VPC_SECURITY_GROUP",
            uri: `security_group:${exampleAwsSecurityGroup.id}`,
        },
    ],
    provisionedPollerConfig: {
        maximumPollers: 100,
        minimumPollers: 10,
        pollerGroupName: "group-123",
    },
});
```

```python
import pulumi
import pulumi_aws as aws

example = aws.lambda_.EventSourceMapping("example",
    function_name=example_aws_lambda_function["arn"],
    topics=["orders"],
    starting_position="TRIM_HORIZON",
    self_managed_event_source={
        "endpoints": {
            "KAFKA_BOOTSTRAP_SERVERS": "kafka1.example.com:9092,kafka2.example.com:9092",
        },
    },
    self_managed_kafka_event_source_config={
        "consumer_group_id": "lambda-consumer-group",
    },
    source_access_configurations=[
        {
            "type": "VPC_SUBNET",
            "uri": f"subnet:{example1['id']}",
        },
        {
            "type": "VPC_SUBNET",
            "uri": f"subnet:{example2['id']}",
        },
        {
            "type": "VPC_SECURITY_GROUP",
            "uri": f"security_group:{example_aws_security_group['id']}",
        },
    ],
    provisioned_poller_config={
        "maximum_pollers": 100,
        "minimum_pollers": 10,
        "poller_group_name": "group-123",
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
		_, err := lambda.NewEventSourceMapping(ctx, "example", &lambda.EventSourceMappingArgs{
			FunctionName: pulumi.Any(exampleAwsLambdaFunction.Arn),
			Topics: pulumi.StringArray{
				pulumi.String("orders"),
			},
			StartingPosition: pulumi.String("TRIM_HORIZON"),
			SelfManagedEventSource: &lambda.EventSourceMappingSelfManagedEventSourceArgs{
				Endpoints: pulumi.StringMap{
					"KAFKA_BOOTSTRAP_SERVERS": pulumi.String("kafka1.example.com:9092,kafka2.example.com:9092"),
				},
			},
			SelfManagedKafkaEventSourceConfig: &lambda.EventSourceMappingSelfManagedKafkaEventSourceConfigArgs{
				ConsumerGroupId: pulumi.String("lambda-consumer-group"),
			},
			SourceAccessConfigurations: lambda.EventSourceMappingSourceAccessConfigurationArray{
				&lambda.EventSourceMappingSourceAccessConfigurationArgs{
					Type: pulumi.String("VPC_SUBNET"),
					Uri:  pulumi.Sprintf("subnet:%v", example1.Id),
				},
				&lambda.EventSourceMappingSourceAccessConfigurationArgs{
					Type: pulumi.String("VPC_SUBNET"),
					Uri:  pulumi.Sprintf("subnet:%v", example2.Id),
				},
				&lambda.EventSourceMappingSourceAccessConfigurationArgs{
					Type: pulumi.String("VPC_SECURITY_GROUP"),
					Uri:  pulumi.Sprintf("security_group:%v", exampleAwsSecurityGroup.Id),
				},
			},
			ProvisionedPollerConfig: &lambda.EventSourceMappingProvisionedPollerConfigArgs{
				MaximumPollers:  pulumi.Int(100),
				MinimumPollers:  pulumi.Int(10),
				PollerGroupName: pulumi.String("group-123"),
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
    var example = new Aws.Lambda.EventSourceMapping("example", new()
    {
        FunctionName = exampleAwsLambdaFunction.Arn,
        Topics = new[]
        {
            "orders",
        },
        StartingPosition = "TRIM_HORIZON",
        SelfManagedEventSource = new Aws.Lambda.Inputs.EventSourceMappingSelfManagedEventSourceArgs
        {
            Endpoints =
            {
                { "KAFKA_BOOTSTRAP_SERVERS", "kafka1.example.com:9092,kafka2.example.com:9092" },
            },
        },
        SelfManagedKafkaEventSourceConfig = new Aws.Lambda.Inputs.EventSourceMappingSelfManagedKafkaEventSourceConfigArgs
        {
            ConsumerGroupId = "lambda-consumer-group",
        },
        SourceAccessConfigurations = new[]
        {
            new Aws.Lambda.Inputs.EventSourceMappingSourceAccessConfigurationArgs
            {
                Type = "VPC_SUBNET",
                Uri = $"subnet:{example1.Id}",
            },
            new Aws.Lambda.Inputs.EventSourceMappingSourceAccessConfigurationArgs
            {
                Type = "VPC_SUBNET",
                Uri = $"subnet:{example2.Id}",
            },
            new Aws.Lambda.Inputs.EventSourceMappingSourceAccessConfigurationArgs
            {
                Type = "VPC_SECURITY_GROUP",
                Uri = $"security_group:{exampleAwsSecurityGroup.Id}",
            },
        },
        ProvisionedPollerConfig = new Aws.Lambda.Inputs.EventSourceMappingProvisionedPollerConfigArgs
        {
            MaximumPollers = 100,
            MinimumPollers = 10,
            PollerGroupName = "group-123",
        },
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.lambda.EventSourceMapping;
import com.pulumi.aws.lambda.EventSourceMappingArgs;
import com.pulumi.aws.lambda.inputs.EventSourceMappingSelfManagedEventSourceArgs;
import com.pulumi.aws.lambda.inputs.EventSourceMappingSelfManagedKafkaEventSourceConfigArgs;
import com.pulumi.aws.lambda.inputs.EventSourceMappingSourceAccessConfigurationArgs;
import com.pulumi.aws.lambda.inputs.EventSourceMappingProvisionedPollerConfigArgs;
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
        var example = new EventSourceMapping("example", EventSourceMappingArgs.builder()
            .functionName(exampleAwsLambdaFunction.arn())
            .topics("orders")
            .startingPosition("TRIM_HORIZON")
            .selfManagedEventSource(EventSourceMappingSelfManagedEventSourceArgs.builder()
                .endpoints(Map.of("KAFKA_BOOTSTRAP_SERVERS", "kafka1.example.com:9092,kafka2.example.com:9092"))
                .build())
            .selfManagedKafkaEventSourceConfig(EventSourceMappingSelfManagedKafkaEventSourceConfigArgs.builder()
                .consumerGroupId("lambda-consumer-group")
                .build())
            .sourceAccessConfigurations(
                EventSourceMappingSourceAccessConfigurationArgs.builder()
                    .type("VPC_SUBNET")
                    .uri(String.format("subnet:%s", example1.id()))
                    .build(),
                EventSourceMappingSourceAccessConfigurationArgs.builder()
                    .type("VPC_SUBNET")
                    .uri(String.format("subnet:%s", example2.id()))
                    .build(),
                EventSourceMappingSourceAccessConfigurationArgs.builder()
                    .type("VPC_SECURITY_GROUP")
                    .uri(String.format("security_group:%s", exampleAwsSecurityGroup.id()))
                    .build())
            .provisionedPollerConfig(EventSourceMappingProvisionedPollerConfigArgs.builder()
                .maximumPollers(100)
                .minimumPollers(10)
                .pollerGroupName("group-123")
                .build())
            .build());

    }
}
```

```yaml
resources:
  example:
    type: aws:lambda:EventSourceMapping
    properties:
      functionName: ${exampleAwsLambdaFunction.arn}
      topics:
        - orders
      startingPosition: TRIM_HORIZON
      selfManagedEventSource:
        endpoints:
          KAFKA_BOOTSTRAP_SERVERS: kafka1.example.com:9092,kafka2.example.com:9092
      selfManagedKafkaEventSourceConfig:
        consumerGroupId: lambda-consumer-group
      sourceAccessConfigurations:
        - type: VPC_SUBNET
          uri: subnet:${example1.id}
        - type: VPC_SUBNET
          uri: subnet:${example2.id}
        - type: VPC_SECURITY_GROUP
          uri: security_group:${exampleAwsSecurityGroup.id}
      provisionedPollerConfig:
        maximumPollers: 100
        minimumPollers: 10
        pollerGroupName: group-123
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_lambda_eventsourcemapping" "example" {
  function_name     = exampleAwsLambdaFunction.arn
  topics            = ["orders"]
  starting_position = "TRIM_HORIZON"
  self_managed_event_source = {
    endpoints = {
      "KAFKA_BOOTSTRAP_SERVERS" = "kafka1.example.com:9092,kafka2.example.com:9092"
    }
  }
  self_managed_kafka_event_source_config = {
    consumer_group_id = "lambda-consumer-group"
  }
  source_access_configurations {
    type = "VPC_SUBNET"
    uri  ="subnet:${example1.id}"
  }
  source_access_configurations {
    type = "VPC_SUBNET"
    uri  ="subnet:${example2.id}"
  }
  source_access_configurations {
    type = "VPC_SECURITY_GROUP"
    uri  ="security_group:${exampleAwsSecurityGroup.id}"
  }
  provisioned_poller_config = {
    maximum_pollers   = 100
    minimum_pollers   = 10
    poller_group_name = "group-123"
  }
}
```

### Amazon MQ (ActiveMQ)[](#amazon-mq-activemq)

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

const example = new aws.lambda.EventSourceMapping("example", {
    eventSourceArn: exampleAwsMqBroker.arn,
    functionName: exampleAwsLambdaFunction.arn,
    queues: "orders",
    batchSize: 10,
    sourceAccessConfigurations: [{
        type: "BASIC_AUTH",
        uri: exampleAwsSecretsmanagerSecretVersion.arn,
    }],
});
```

```python
import pulumi
import pulumi_aws as aws

example = aws.lambda_.EventSourceMapping("example",
    event_source_arn=example_aws_mq_broker["arn"],
    function_name=example_aws_lambda_function["arn"],
    queues="orders",
    batch_size=10,
    source_access_configurations=[{
        "type": "BASIC_AUTH",
        "uri": example_aws_secretsmanager_secret_version["arn"],
    }])
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/lambda"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		_, err := lambda.NewEventSourceMapping(ctx, "example", &lambda.EventSourceMappingArgs{
			EventSourceArn: pulumi.Any(exampleAwsMqBroker.Arn),
			FunctionName:   pulumi.Any(exampleAwsLambdaFunction.Arn),
			Queues:         pulumi.String("orders"),
			BatchSize:      pulumi.Int(10),
			SourceAccessConfigurations: lambda.EventSourceMappingSourceAccessConfigurationArray{
				&lambda.EventSourceMappingSourceAccessConfigurationArgs{
					Type: pulumi.String("BASIC_AUTH"),
					Uri:  pulumi.Any(exampleAwsSecretsmanagerSecretVersion.Arn),
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
    var example = new Aws.Lambda.EventSourceMapping("example", new()
    {
        EventSourceArn = exampleAwsMqBroker.Arn,
        FunctionName = exampleAwsLambdaFunction.Arn,
        Queues = "orders",
        BatchSize = 10,
        SourceAccessConfigurations = new[]
        {
            new Aws.Lambda.Inputs.EventSourceMappingSourceAccessConfigurationArgs
            {
                Type = "BASIC_AUTH",
                Uri = exampleAwsSecretsmanagerSecretVersion.Arn,
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
import com.pulumi.aws.lambda.EventSourceMapping;
import com.pulumi.aws.lambda.EventSourceMappingArgs;
import com.pulumi.aws.lambda.inputs.EventSourceMappingSourceAccessConfigurationArgs;
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
        var example = new EventSourceMapping("example", EventSourceMappingArgs.builder()
            .eventSourceArn(exampleAwsMqBroker.arn())
            .functionName(exampleAwsLambdaFunction.arn())
            .queues("orders")
            .batchSize(10)
            .sourceAccessConfigurations(EventSourceMappingSourceAccessConfigurationArgs.builder()
                .type("BASIC_AUTH")
                .uri(exampleAwsSecretsmanagerSecretVersion.arn())
                .build())
            .build());

    }
}
```

```yaml
resources:
  example:
    type: aws:lambda:EventSourceMapping
    properties:
      eventSourceArn: ${exampleAwsMqBroker.arn}
      functionName: ${exampleAwsLambdaFunction.arn}
      queues: orders
      batchSize: 10
      sourceAccessConfigurations:
        - type: BASIC_AUTH
          uri: ${exampleAwsSecretsmanagerSecretVersion.arn}
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_lambda_eventsourcemapping" "example" {
  event_source_arn = exampleAwsMqBroker.arn
  function_name    = exampleAwsLambdaFunction.arn
  queues           = "orders"
  batch_size       = 10
  source_access_configurations {
    type = "BASIC_AUTH"
    uri  = exampleAwsSecretsmanagerSecretVersion.arn
  }
}
```

### Amazon MQ (RabbitMQ)[](#amazon-mq-rabbitmq)

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

const example = new aws.lambda.EventSourceMapping("example", {
    eventSourceArn: exampleAwsMqBroker.arn,
    functionName: exampleAwsLambdaFunction.arn,
    queues: "orders",
    batchSize: 1,
    sourceAccessConfigurations: [
        {
            type: "VIRTUAL_HOST",
            uri: "/production",
        },
        {
            type: "BASIC_AUTH",
            uri: exampleAwsSecretsmanagerSecretVersion.arn,
        },
    ],
});
```

```python
import pulumi
import pulumi_aws as aws

example = aws.lambda_.EventSourceMapping("example",
    event_source_arn=example_aws_mq_broker["arn"],
    function_name=example_aws_lambda_function["arn"],
    queues="orders",
    batch_size=1,
    source_access_configurations=[
        {
            "type": "VIRTUAL_HOST",
            "uri": "/production",
        },
        {
            "type": "BASIC_AUTH",
            "uri": example_aws_secretsmanager_secret_version["arn"],
        },
    ])
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/lambda"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		_, err := lambda.NewEventSourceMapping(ctx, "example", &lambda.EventSourceMappingArgs{
			EventSourceArn: pulumi.Any(exampleAwsMqBroker.Arn),
			FunctionName:   pulumi.Any(exampleAwsLambdaFunction.Arn),
			Queues:         pulumi.String("orders"),
			BatchSize:      pulumi.Int(1),
			SourceAccessConfigurations: lambda.EventSourceMappingSourceAccessConfigurationArray{
				&lambda.EventSourceMappingSourceAccessConfigurationArgs{
					Type: pulumi.String("VIRTUAL_HOST"),
					Uri:  pulumi.String("/production"),
				},
				&lambda.EventSourceMappingSourceAccessConfigurationArgs{
					Type: pulumi.String("BASIC_AUTH"),
					Uri:  pulumi.Any(exampleAwsSecretsmanagerSecretVersion.Arn),
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
    var example = new Aws.Lambda.EventSourceMapping("example", new()
    {
        EventSourceArn = exampleAwsMqBroker.Arn,
        FunctionName = exampleAwsLambdaFunction.Arn,
        Queues = "orders",
        BatchSize = 1,
        SourceAccessConfigurations = new[]
        {
            new Aws.Lambda.Inputs.EventSourceMappingSourceAccessConfigurationArgs
            {
                Type = "VIRTUAL_HOST",
                Uri = "/production",
            },
            new Aws.Lambda.Inputs.EventSourceMappingSourceAccessConfigurationArgs
            {
                Type = "BASIC_AUTH",
                Uri = exampleAwsSecretsmanagerSecretVersion.Arn,
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
import com.pulumi.aws.lambda.EventSourceMapping;
import com.pulumi.aws.lambda.EventSourceMappingArgs;
import com.pulumi.aws.lambda.inputs.EventSourceMappingSourceAccessConfigurationArgs;
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
        var example = new EventSourceMapping("example", EventSourceMappingArgs.builder()
            .eventSourceArn(exampleAwsMqBroker.arn())
            .functionName(exampleAwsLambdaFunction.arn())
            .queues("orders")
            .batchSize(1)
            .sourceAccessConfigurations(
                EventSourceMappingSourceAccessConfigurationArgs.builder()
                    .type("VIRTUAL_HOST")
                    .uri("/production")
                    .build(),
                EventSourceMappingSourceAccessConfigurationArgs.builder()
                    .type("BASIC_AUTH")
                    .uri(exampleAwsSecretsmanagerSecretVersion.arn())
                    .build())
            .build());

    }
}
```

```yaml
resources:
  example:
    type: aws:lambda:EventSourceMapping
    properties:
      eventSourceArn: ${exampleAwsMqBroker.arn}
      functionName: ${exampleAwsLambdaFunction.arn}
      queues: orders
      batchSize: 1
      sourceAccessConfigurations:
        - type: VIRTUAL_HOST
          uri: /production
        - type: BASIC_AUTH
          uri: ${exampleAwsSecretsmanagerSecretVersion.arn}
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_lambda_eventsourcemapping" "example" {
  event_source_arn = exampleAwsMqBroker.arn
  function_name    = exampleAwsLambdaFunction.arn
  queues           = "orders"
  batch_size       = 1
  source_access_configurations {
    type = "VIRTUAL_HOST"
    uri  = "/production"
  }
  source_access_configurations {
    type = "BASIC_AUTH"
    uri  = exampleAwsSecretsmanagerSecretVersion.arn
  }
}
```

### DocumentDB Change Stream[](#documentdb-change-stream)

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

const example = new aws.lambda.EventSourceMapping("example", {
    eventSourceArn: exampleAwsDocdbCluster.arn,
    functionName: exampleAwsLambdaFunction.arn,
    startingPosition: "LATEST",
    documentDbEventSourceConfig: {
        databaseName: "orders",
        collectionName: "transactions",
        fullDocument: "UpdateLookup",
    },
    sourceAccessConfigurations: [{
        type: "BASIC_AUTH",
        uri: exampleAwsSecretsmanagerSecretVersion.arn,
    }],
});
```

```python
import pulumi
import pulumi_aws as aws

example = aws.lambda_.EventSourceMapping("example",
    event_source_arn=example_aws_docdb_cluster["arn"],
    function_name=example_aws_lambda_function["arn"],
    starting_position="LATEST",
    document_db_event_source_config={
        "database_name": "orders",
        "collection_name": "transactions",
        "full_document": "UpdateLookup",
    },
    source_access_configurations=[{
        "type": "BASIC_AUTH",
        "uri": example_aws_secretsmanager_secret_version["arn"],
    }])
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/lambda"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		_, err := lambda.NewEventSourceMapping(ctx, "example", &lambda.EventSourceMappingArgs{
			EventSourceArn:   pulumi.Any(exampleAwsDocdbCluster.Arn),
			FunctionName:     pulumi.Any(exampleAwsLambdaFunction.Arn),
			StartingPosition: pulumi.String("LATEST"),
			DocumentDbEventSourceConfig: &lambda.EventSourceMappingDocumentDbEventSourceConfigArgs{
				DatabaseName:   pulumi.String("orders"),
				CollectionName: pulumi.String("transactions"),
				FullDocument:   pulumi.String("UpdateLookup"),
			},
			SourceAccessConfigurations: lambda.EventSourceMappingSourceAccessConfigurationArray{
				&lambda.EventSourceMappingSourceAccessConfigurationArgs{
					Type: pulumi.String("BASIC_AUTH"),
					Uri:  pulumi.Any(exampleAwsSecretsmanagerSecretVersion.Arn),
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
    var example = new Aws.Lambda.EventSourceMapping("example", new()
    {
        EventSourceArn = exampleAwsDocdbCluster.Arn,
        FunctionName = exampleAwsLambdaFunction.Arn,
        StartingPosition = "LATEST",
        DocumentDbEventSourceConfig = new Aws.Lambda.Inputs.EventSourceMappingDocumentDbEventSourceConfigArgs
        {
            DatabaseName = "orders",
            CollectionName = "transactions",
            FullDocument = "UpdateLookup",
        },
        SourceAccessConfigurations = new[]
        {
            new Aws.Lambda.Inputs.EventSourceMappingSourceAccessConfigurationArgs
            {
                Type = "BASIC_AUTH",
                Uri = exampleAwsSecretsmanagerSecretVersion.Arn,
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
import com.pulumi.aws.lambda.EventSourceMapping;
import com.pulumi.aws.lambda.EventSourceMappingArgs;
import com.pulumi.aws.lambda.inputs.EventSourceMappingDocumentDbEventSourceConfigArgs;
import com.pulumi.aws.lambda.inputs.EventSourceMappingSourceAccessConfigurationArgs;
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
        var example = new EventSourceMapping("example", EventSourceMappingArgs.builder()
            .eventSourceArn(exampleAwsDocdbCluster.arn())
            .functionName(exampleAwsLambdaFunction.arn())
            .startingPosition("LATEST")
            .documentDbEventSourceConfig(EventSourceMappingDocumentDbEventSourceConfigArgs.builder()
                .databaseName("orders")
                .collectionName("transactions")
                .fullDocument("UpdateLookup")
                .build())
            .sourceAccessConfigurations(EventSourceMappingSourceAccessConfigurationArgs.builder()
                .type("BASIC_AUTH")
                .uri(exampleAwsSecretsmanagerSecretVersion.arn())
                .build())
            .build());

    }
}
```

```yaml
resources:
  example:
    type: aws:lambda:EventSourceMapping
    properties:
      eventSourceArn: ${exampleAwsDocdbCluster.arn}
      functionName: ${exampleAwsLambdaFunction.arn}
      startingPosition: LATEST
      documentDbEventSourceConfig:
        databaseName: orders
        collectionName: transactions
        fullDocument: UpdateLookup
      sourceAccessConfigurations:
        - type: BASIC_AUTH
          uri: ${exampleAwsSecretsmanagerSecretVersion.arn}
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_lambda_eventsourcemapping" "example" {
  event_source_arn  = exampleAwsDocdbCluster.arn
  function_name     = exampleAwsLambdaFunction.arn
  starting_position = "LATEST"
  document_db_event_source_config = {
    database_name   = "orders"
    collection_name = "transactions"
    full_document   = "UpdateLookup"
  }
  source_access_configurations {
    type = "BASIC_AUTH"
    uri  = exampleAwsSecretsmanagerSecretVersion.arn
  }
}
```

## Create EventSourceMapping Resource[](#create)

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
new EventSourceMapping(name: string, args: EventSourceMappingArgs, opts?: CustomResourceOptions);
```

```python
@overload
def EventSourceMapping(resource_name: str,
                       args: EventSourceMappingArgs,
                       opts: Optional[ResourceOptions] = None)

@overload
def EventSourceMapping(resource_name: str,
                       opts: Optional[ResourceOptions] = None,
                       function_name: Optional[str] = None,
                       metrics_config: Optional[EventSourceMappingMetricsConfigArgs] = None,
                       tags: Optional[Mapping[str, str]] = None,
                       destination_config: Optional[EventSourceMappingDestinationConfigArgs] = None,
                       document_db_event_source_config: Optional[EventSourceMappingDocumentDbEventSourceConfigArgs] = None,
                       enabled: Optional[bool] = None,
                       event_source_arn: Optional[str] = None,
                       filter_criteria: Optional[EventSourceMappingFilterCriteriaArgs] = None,
                       batch_size: Optional[int] = None,
                       function_response_types: Optional[Sequence[str]] = None,
                       kms_key_arn: Optional[str] = None,
                       maximum_batching_window_in_seconds: Optional[int] = None,
                       parallelization_factor: Optional[int] = None,
                       bisect_batch_on_function_error: Optional[bool] = None,
                       maximum_retry_attempts: Optional[int] = None,
                       maximum_record_age_in_seconds: Optional[int] = None,
                       provisioned_poller_config: Optional[EventSourceMappingProvisionedPollerConfigArgs] = None,
                       queues: Optional[str] = None,
                       region: Optional[str] = None,
                       scaling_config: Optional[EventSourceMappingScalingConfigArgs] = None,
                       self_managed_event_source: Optional[EventSourceMappingSelfManagedEventSourceArgs] = None,
                       self_managed_kafka_event_source_config: Optional[EventSourceMappingSelfManagedKafkaEventSourceConfigArgs] = None,
                       source_access_configurations: Optional[Sequence[EventSourceMappingSourceAccessConfigurationArgs]] = None,
                       starting_position: Optional[str] = None,
                       starting_position_timestamp: Optional[str] = None,
                       amazon_managed_kafka_event_source_config: Optional[EventSourceMappingAmazonManagedKafkaEventSourceConfigArgs] = None,
                       topics: Optional[Sequence[str]] = None,
                       tumbling_window_in_seconds: Optional[int] = None)
```

```go
func NewEventSourceMapping(ctx *Context, name string, args EventSourceMappingArgs, opts ...ResourceOption) (*EventSourceMapping, error)
```

```csharp
public EventSourceMapping(string name, EventSourceMappingArgs args, CustomResourceOptions? opts = null)
```

```java
public EventSourceMapping(String name, EventSourceMappingArgs args)
public EventSourceMapping(String name, EventSourceMappingArgs args, CustomResourceOptions options)
```

```yaml
type: aws:lambda:EventSourceMapping
properties: # The arguments to resource properties.
options: # Bag of options to control resource's behavior.
```

```hcl
resource "aws_lambda_eventsourcemapping" "name" {
    # resource properties
}
```

#### Parameters[](#parameters)

name This property is required. string

The unique name of the resource.

args This property is required. [EventSourceMappingArgs](#inputs)

The arguments to resource properties.

opts [CustomResourceOptions](/docs/reference/pkg/nodejs/pulumi/pulumi/#CustomResourceOptions)

Bag of options to control resource's behavior.

resource\_name This property is required. str

The unique name of the resource.

args This property is required. [EventSourceMappingArgs](#inputs)

The arguments to resource properties.

opts [ResourceOptions](/docs/reference/pkg/python/pulumi/#pulumi.ResourceOptions)

Bag of options to control resource's behavior.

ctx [Context](https://pkg.go.dev/github.com/pulumi/pulumi/sdk/v3/go/pulumi?tab=doc#Context)

Context object for the current deployment.

name This property is required. string

The unique name of the resource.

args This property is required. [EventSourceMappingArgs](#inputs)

The arguments to resource properties.

opts [ResourceOption](https://pkg.go.dev/github.com/pulumi/pulumi/sdk/v3/go/pulumi?tab=doc#ResourceOption)

Bag of options to control resource's behavior.

name This property is required. string

The unique name of the resource.

args This property is required. [EventSourceMappingArgs](#inputs)

The arguments to resource properties.

opts [CustomResourceOptions](/docs/reference/pkg/dotnet/Pulumi/Pulumi.CustomResourceOptions.html)

Bag of options to control resource's behavior.

name This property is required. String

The unique name of the resource.

args This property is required. [EventSourceMappingArgs](#inputs)

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
var eventSourceMappingResource = new Aws.Lambda.EventSourceMapping("eventSourceMappingResource", new()
{
    FunctionName = "string",
    MetricsConfig = new Aws.Lambda.Inputs.EventSourceMappingMetricsConfigArgs
    {
        Metrics = new[]
        {
            "string",
        },
    },
    Tags =
    {
        { "string", "string" },
    },
    DestinationConfig = new Aws.Lambda.Inputs.EventSourceMappingDestinationConfigArgs
    {
        OnFailure = new Aws.Lambda.Inputs.EventSourceMappingDestinationConfigOnFailureArgs
        {
            DestinationArn = "string",
        },
    },
    DocumentDbEventSourceConfig = new Aws.Lambda.Inputs.EventSourceMappingDocumentDbEventSourceConfigArgs
    {
        DatabaseName = "string",
        CollectionName = "string",
        FullDocument = "string",
    },
    Enabled = false,
    EventSourceArn = "string",
    FilterCriteria = new Aws.Lambda.Inputs.EventSourceMappingFilterCriteriaArgs
    {
        Filters = new[]
        {
            new Aws.Lambda.Inputs.EventSourceMappingFilterCriteriaFilterArgs
            {
                Pattern = "string",
            },
        },
    },
    BatchSize = 0,
    FunctionResponseTypes = new[]
    {
        "string",
    },
    KmsKeyArn = "string",
    MaximumBatchingWindowInSeconds = 0,
    ParallelizationFactor = 0,
    BisectBatchOnFunctionError = false,
    MaximumRetryAttempts = 0,
    MaximumRecordAgeInSeconds = 0,
    ProvisionedPollerConfig = new Aws.Lambda.Inputs.EventSourceMappingProvisionedPollerConfigArgs
    {
        MaximumPollers = 0,
        MinimumPollers = 0,
        PollerGroupName = "string",
    },
    Queues = "string",
    Region = "string",
    ScalingConfig = new Aws.Lambda.Inputs.EventSourceMappingScalingConfigArgs
    {
        MaximumConcurrency = 0,
    },
    SelfManagedEventSource = new Aws.Lambda.Inputs.EventSourceMappingSelfManagedEventSourceArgs
    {
        Endpoints =
        {
            { "string", "string" },
        },
    },
    SelfManagedKafkaEventSourceConfig = new Aws.Lambda.Inputs.EventSourceMappingSelfManagedKafkaEventSourceConfigArgs
    {
        ConsumerGroupId = "string",
        SchemaRegistryConfig = new Aws.Lambda.Inputs.EventSourceMappingSelfManagedKafkaEventSourceConfigSchemaRegistryConfigArgs
        {
            AccessConfigs = new[]
            {
                new Aws.Lambda.Inputs.EventSourceMappingSelfManagedKafkaEventSourceConfigSchemaRegistryConfigAccessConfigArgs
                {
                    Type = "string",
                    Uri = "string",
                },
            },
            EventRecordFormat = "string",
            SchemaRegistryUri = "string",
            SchemaValidationConfigs = new[]
            {
                new Aws.Lambda.Inputs.EventSourceMappingSelfManagedKafkaEventSourceConfigSchemaRegistryConfigSchemaValidationConfigArgs
                {
                    Attribute = "string",
                },
            },
        },
    },
    SourceAccessConfigurations = new[]
    {
        new Aws.Lambda.Inputs.EventSourceMappingSourceAccessConfigurationArgs
        {
            Type = "string",
            Uri = "string",
        },
    },
    StartingPosition = "string",
    StartingPositionTimestamp = "string",
    AmazonManagedKafkaEventSourceConfig = new Aws.Lambda.Inputs.EventSourceMappingAmazonManagedKafkaEventSourceConfigArgs
    {
        ConsumerGroupId = "string",
        SchemaRegistryConfig = new Aws.Lambda.Inputs.EventSourceMappingAmazonManagedKafkaEventSourceConfigSchemaRegistryConfigArgs
        {
            AccessConfigs = new[]
            {
                new Aws.Lambda.Inputs.EventSourceMappingAmazonManagedKafkaEventSourceConfigSchemaRegistryConfigAccessConfigArgs
                {
                    Type = "string",
                    Uri = "string",
                },
            },
            EventRecordFormat = "string",
            SchemaRegistryUri = "string",
            SchemaValidationConfigs = new[]
            {
                new Aws.Lambda.Inputs.EventSourceMappingAmazonManagedKafkaEventSourceConfigSchemaRegistryConfigSchemaValidationConfigArgs
                {
                    Attribute = "string",
                },
            },
        },
    },
    Topics = new[]
    {
        "string",
    },
    TumblingWindowInSeconds = 0,
});
```

```go
example, err := lambda.NewEventSourceMapping(ctx, "eventSourceMappingResource", &lambda.EventSourceMappingArgs{
	FunctionName: pulumi.String("string"),
	MetricsConfig: &lambda.EventSourceMappingMetricsConfigArgs{
		Metrics: pulumi.StringArray{
			pulumi.String("string"),
		},
	},
	Tags: pulumi.StringMap{
		"string": pulumi.String("string"),
	},
	DestinationConfig: &lambda.EventSourceMappingDestinationConfigArgs{
		OnFailure: &lambda.EventSourceMappingDestinationConfigOnFailureArgs{
			DestinationArn: pulumi.String("string"),
		},
	},
	DocumentDbEventSourceConfig: &lambda.EventSourceMappingDocumentDbEventSourceConfigArgs{
		DatabaseName:   pulumi.String("string"),
		CollectionName: pulumi.String("string"),
		FullDocument:   pulumi.String("string"),
	},
	Enabled:        pulumi.Bool(false),
	EventSourceArn: pulumi.String("string"),
	FilterCriteria: &lambda.EventSourceMappingFilterCriteriaArgs{
		Filters: lambda.EventSourceMappingFilterCriteriaFilterArray{
			&lambda.EventSourceMappingFilterCriteriaFilterArgs{
				Pattern: pulumi.String("string"),
			},
		},
	},
	BatchSize: pulumi.Int(0),
	FunctionResponseTypes: pulumi.StringArray{
		pulumi.String("string"),
	},
	KmsKeyArn:                      pulumi.String("string"),
	MaximumBatchingWindowInSeconds: pulumi.Int(0),
	ParallelizationFactor:          pulumi.Int(0),
	BisectBatchOnFunctionError:     pulumi.Bool(false),
	MaximumRetryAttempts:           pulumi.Int(0),
	MaximumRecordAgeInSeconds:      pulumi.Int(0),
	ProvisionedPollerConfig: &lambda.EventSourceMappingProvisionedPollerConfigArgs{
		MaximumPollers:  pulumi.Int(0),
		MinimumPollers:  pulumi.Int(0),
		PollerGroupName: pulumi.String("string"),
	},
	Queues: pulumi.String("string"),
	Region: pulumi.String("string"),
	ScalingConfig: &lambda.EventSourceMappingScalingConfigArgs{
		MaximumConcurrency: pulumi.Int(0),
	},
	SelfManagedEventSource: &lambda.EventSourceMappingSelfManagedEventSourceArgs{
		Endpoints: pulumi.StringMap{
			"string": pulumi.String("string"),
		},
	},
	SelfManagedKafkaEventSourceConfig: &lambda.EventSourceMappingSelfManagedKafkaEventSourceConfigArgs{
		ConsumerGroupId: pulumi.String("string"),
		SchemaRegistryConfig: &lambda.EventSourceMappingSelfManagedKafkaEventSourceConfigSchemaRegistryConfigArgs{
			AccessConfigs: lambda.EventSourceMappingSelfManagedKafkaEventSourceConfigSchemaRegistryConfigAccessConfigArray{
				&lambda.EventSourceMappingSelfManagedKafkaEventSourceConfigSchemaRegistryConfigAccessConfigArgs{
					Type: pulumi.String("string"),
					Uri:  pulumi.String("string"),
				},
			},
			EventRecordFormat: pulumi.String("string"),
			SchemaRegistryUri: pulumi.String("string"),
			SchemaValidationConfigs: lambda.EventSourceMappingSelfManagedKafkaEventSourceConfigSchemaRegistryConfigSchemaValidationConfigArray{
				&lambda.EventSourceMappingSelfManagedKafkaEventSourceConfigSchemaRegistryConfigSchemaValidationConfigArgs{
					Attribute: pulumi.String("string"),
				},
			},
		},
	},
	SourceAccessConfigurations: lambda.EventSourceMappingSourceAccessConfigurationArray{
		&lambda.EventSourceMappingSourceAccessConfigurationArgs{
			Type: pulumi.String("string"),
			Uri:  pulumi.String("string"),
		},
	},
	StartingPosition:          pulumi.String("string"),
	StartingPositionTimestamp: pulumi.String("string"),
	AmazonManagedKafkaEventSourceConfig: &lambda.EventSourceMappingAmazonManagedKafkaEventSourceConfigArgs{
		ConsumerGroupId: pulumi.String("string"),
		SchemaRegistryConfig: &lambda.EventSourceMappingAmazonManagedKafkaEventSourceConfigSchemaRegistryConfigArgs{
			AccessConfigs: lambda.EventSourceMappingAmazonManagedKafkaEventSourceConfigSchemaRegistryConfigAccessConfigArray{
				&lambda.EventSourceMappingAmazonManagedKafkaEventSourceConfigSchemaRegistryConfigAccessConfigArgs{
					Type: pulumi.String("string"),
					Uri:  pulumi.String("string"),
				},
			},
			EventRecordFormat: pulumi.String("string"),
			SchemaRegistryUri: pulumi.String("string"),
			SchemaValidationConfigs: lambda.EventSourceMappingAmazonManagedKafkaEventSourceConfigSchemaRegistryConfigSchemaValidationConfigArray{
				&lambda.EventSourceMappingAmazonManagedKafkaEventSourceConfigSchemaRegistryConfigSchemaValidationConfigArgs{
					Attribute: pulumi.String("string"),
				},
			},
		},
	},
	Topics: pulumi.StringArray{
		pulumi.String("string"),
	},
	TumblingWindowInSeconds: pulumi.Int(0),
})
```

```hcl
resource "aws_lambda_eventsourcemapping" "eventSourceMappingResource" {
  function_name = "string"
  metrics_config = {
    metrics = ["string"]
  }
  tags = {
    "string" = "string"
  }
  destination_config = {
    on_failure = {
      destination_arn = "string"
    }
  }
  document_db_event_source_config = {
    database_name   = "string"
    collection_name = "string"
    full_document   = "string"
  }
  enabled          = false
  event_source_arn = "string"
  filter_criteria = {
    filters = [{
      "pattern" = "string"
    }]
  }
  batch_size                         = 0
  function_response_types            = ["string"]
  kms_key_arn                        = "string"
  maximum_batching_window_in_seconds = 0
  parallelization_factor             = 0
  bisect_batch_on_function_error     = false
  maximum_retry_attempts             = 0
  maximum_record_age_in_seconds      = 0
  provisioned_poller_config = {
    maximum_pollers   = 0
    minimum_pollers   = 0
    poller_group_name = "string"
  }
  queues = "string"
  region = "string"
  scaling_config = {
    maximum_concurrency = 0
  }
  self_managed_event_source = {
    endpoints = {
      "string" = "string"
    }
  }
  self_managed_kafka_event_source_config = {
    consumer_group_id = "string"
    schema_registry_config = {
      access_configs = [{
        "type" = "string"
        "uri"  = "string"
      }]
      event_record_format = "string"
      schema_registry_uri = "string"
      schema_validation_configs = [{
        "attribute" = "string"
      }]
    }
  }
  source_access_configurations {
    type = "string"
    uri  = "string"
  }
  starting_position           = "string"
  starting_position_timestamp = "string"
  amazon_managed_kafka_event_source_config = {
    consumer_group_id = "string"
    schema_registry_config = {
      access_configs = [{
        "type" = "string"
        "uri"  = "string"
      }]
      event_record_format = "string"
      schema_registry_uri = "string"
      schema_validation_configs = [{
        "attribute" = "string"
      }]
    }
  }
  topics                     = ["string"]
  tumbling_window_in_seconds = 0
}
```

```java
var eventSourceMappingResource = new EventSourceMapping("eventSourceMappingResource", EventSourceMappingArgs.builder()
    .functionName("string")
    .metricsConfig(EventSourceMappingMetricsConfigArgs.builder()
        .metrics("string")
        .build())
    .tags(Map.of("string", "string"))
    .destinationConfig(EventSourceMappingDestinationConfigArgs.builder()
        .onFailure(EventSourceMappingDestinationConfigOnFailureArgs.builder()
            .destinationArn("string")
            .build())
        .build())
    .documentDbEventSourceConfig(EventSourceMappingDocumentDbEventSourceConfigArgs.builder()
        .databaseName("string")
        .collectionName("string")
        .fullDocument("string")
        .build())
    .enabled(false)
    .eventSourceArn("string")
    .filterCriteria(EventSourceMappingFilterCriteriaArgs.builder()
        .filters(EventSourceMappingFilterCriteriaFilterArgs.builder()
            .pattern("string")
            .build())
        .build())
    .batchSize(0)
    .functionResponseTypes("string")
    .kmsKeyArn("string")
    .maximumBatchingWindowInSeconds(0)
    .parallelizationFactor(0)
    .bisectBatchOnFunctionError(false)
    .maximumRetryAttempts(0)
    .maximumRecordAgeInSeconds(0)
    .provisionedPollerConfig(EventSourceMappingProvisionedPollerConfigArgs.builder()
        .maximumPollers(0)
        .minimumPollers(0)
        .pollerGroupName("string")
        .build())
    .queues("string")
    .region("string")
    .scalingConfig(EventSourceMappingScalingConfigArgs.builder()
        .maximumConcurrency(0)
        .build())
    .selfManagedEventSource(EventSourceMappingSelfManagedEventSourceArgs.builder()
        .endpoints(Map.of("string", "string"))
        .build())
    .selfManagedKafkaEventSourceConfig(EventSourceMappingSelfManagedKafkaEventSourceConfigArgs.builder()
        .consumerGroupId("string")
        .schemaRegistryConfig(EventSourceMappingSelfManagedKafkaEventSourceConfigSchemaRegistryConfigArgs.builder()
            .accessConfigs(EventSourceMappingSelfManagedKafkaEventSourceConfigSchemaRegistryConfigAccessConfigArgs.builder()
                .type("string")
                .uri("string")
                .build())
            .eventRecordFormat("string")
            .schemaRegistryUri("string")
            .schemaValidationConfigs(EventSourceMappingSelfManagedKafkaEventSourceConfigSchemaRegistryConfigSchemaValidationConfigArgs.builder()
                .attribute("string")
                .build())
            .build())
        .build())
    .sourceAccessConfigurations(EventSourceMappingSourceAccessConfigurationArgs.builder()
        .type("string")
        .uri("string")
        .build())
    .startingPosition("string")
    .startingPositionTimestamp("string")
    .amazonManagedKafkaEventSourceConfig(EventSourceMappingAmazonManagedKafkaEventSourceConfigArgs.builder()
        .consumerGroupId("string")
        .schemaRegistryConfig(EventSourceMappingAmazonManagedKafkaEventSourceConfigSchemaRegistryConfigArgs.builder()
            .accessConfigs(EventSourceMappingAmazonManagedKafkaEventSourceConfigSchemaRegistryConfigAccessConfigArgs.builder()
                .type("string")
                .uri("string")
                .build())
            .eventRecordFormat("string")
            .schemaRegistryUri("string")
            .schemaValidationConfigs(EventSourceMappingAmazonManagedKafkaEventSourceConfigSchemaRegistryConfigSchemaValidationConfigArgs.builder()
                .attribute("string")
                .build())
            .build())
        .build())
    .topics("string")
    .tumblingWindowInSeconds(0)
    .build());
```

```python
event_source_mapping_resource = aws.lambda_.EventSourceMapping("eventSourceMappingResource",
    function_name="string",
    metrics_config={
        "metrics": ["string"],
    },
    tags={
        "string": "string",
    },
    destination_config={
        "on_failure": {
            "destination_arn": "string",
        },
    },
    document_db_event_source_config={
        "database_name": "string",
        "collection_name": "string",
        "full_document": "string",
    },
    enabled=False,
    event_source_arn="string",
    filter_criteria={
        "filters": [{
            "pattern": "string",
        }],
    },
    batch_size=0,
    function_response_types=["string"],
    kms_key_arn="string",
    maximum_batching_window_in_seconds=0,
    parallelization_factor=0,
    bisect_batch_on_function_error=False,
    maximum_retry_attempts=0,
    maximum_record_age_in_seconds=0,
    provisioned_poller_config={
        "maximum_pollers": 0,
        "minimum_pollers": 0,
        "poller_group_name": "string",
    },
    queues="string",
    region="string",
    scaling_config={
        "maximum_concurrency": 0,
    },
    self_managed_event_source={
        "endpoints": {
            "string": "string",
        },
    },
    self_managed_kafka_event_source_config={
        "consumer_group_id": "string",
        "schema_registry_config": {
            "access_configs": [{
                "type": "string",
                "uri": "string",
            }],
            "event_record_format": "string",
            "schema_registry_uri": "string",
            "schema_validation_configs": [{
                "attribute": "string",
            }],
        },
    },
    source_access_configurations=[{
        "type": "string",
        "uri": "string",
    }],
    starting_position="string",
    starting_position_timestamp="string",
    amazon_managed_kafka_event_source_config={
        "consumer_group_id": "string",
        "schema_registry_config": {
            "access_configs": [{
                "type": "string",
                "uri": "string",
            }],
            "event_record_format": "string",
            "schema_registry_uri": "string",
            "schema_validation_configs": [{
                "attribute": "string",
            }],
        },
    },
    topics=["string"],
    tumbling_window_in_seconds=0)
```

```typescript
const eventSourceMappingResource = new aws.lambda.EventSourceMapping("eventSourceMappingResource", {
    functionName: "string",
    metricsConfig: {
        metrics: ["string"],
    },
    tags: {
        string: "string",
    },
    destinationConfig: {
        onFailure: {
            destinationArn: "string",
        },
    },
    documentDbEventSourceConfig: {
        databaseName: "string",
        collectionName: "string",
        fullDocument: "string",
    },
    enabled: false,
    eventSourceArn: "string",
    filterCriteria: {
        filters: [{
            pattern: "string",
        }],
    },
    batchSize: 0,
    functionResponseTypes: ["string"],
    kmsKeyArn: "string",
    maximumBatchingWindowInSeconds: 0,
    parallelizationFactor: 0,
    bisectBatchOnFunctionError: false,
    maximumRetryAttempts: 0,
    maximumRecordAgeInSeconds: 0,
    provisionedPollerConfig: {
        maximumPollers: 0,
        minimumPollers: 0,
        pollerGroupName: "string",
    },
    queues: "string",
    region: "string",
    scalingConfig: {
        maximumConcurrency: 0,
    },
    selfManagedEventSource: {
        endpoints: {
            string: "string",
        },
    },
    selfManagedKafkaEventSourceConfig: {
        consumerGroupId: "string",
        schemaRegistryConfig: {
            accessConfigs: [{
                type: "string",
                uri: "string",
            }],
            eventRecordFormat: "string",
            schemaRegistryUri: "string",
            schemaValidationConfigs: [{
                attribute: "string",
            }],
        },
    },
    sourceAccessConfigurations: [{
        type: "string",
        uri: "string",
    }],
    startingPosition: "string",
    startingPositionTimestamp: "string",
    amazonManagedKafkaEventSourceConfig: {
        consumerGroupId: "string",
        schemaRegistryConfig: {
            accessConfigs: [{
                type: "string",
                uri: "string",
            }],
            eventRecordFormat: "string",
            schemaRegistryUri: "string",
            schemaValidationConfigs: [{
                attribute: "string",
            }],
        },
    },
    topics: ["string"],
    tumblingWindowInSeconds: 0,
});
```

```yaml
type: aws:lambda:EventSourceMapping
properties:
    amazonManagedKafkaEventSourceConfig:
        consumerGroupId: string
        schemaRegistryConfig:
            accessConfigs:
                - type: string
                  uri: string
            eventRecordFormat: string
            schemaRegistryUri: string
            schemaValidationConfigs:
                - attribute: string
    batchSize: 0
    bisectBatchOnFunctionError: false
    destinationConfig:
        onFailure:
            destinationArn: string
    documentDbEventSourceConfig:
        collectionName: string
        databaseName: string
        fullDocument: string
    enabled: false
    eventSourceArn: string
    filterCriteria:
        filters:
            - pattern: string
    functionName: string
    functionResponseTypes:
        - string
    kmsKeyArn: string
    maximumBatchingWindowInSeconds: 0
    maximumRecordAgeInSeconds: 0
    maximumRetryAttempts: 0
    metricsConfig:
        metrics:
            - string
    parallelizationFactor: 0
    provisionedPollerConfig:
        maximumPollers: 0
        minimumPollers: 0
        pollerGroupName: string
    queues: string
    region: string
    scalingConfig:
        maximumConcurrency: 0
    selfManagedEventSource:
        endpoints:
            string: string
    selfManagedKafkaEventSourceConfig:
        consumerGroupId: string
        schemaRegistryConfig:
            accessConfigs:
                - type: string
                  uri: string
            eventRecordFormat: string
            schemaRegistryUri: string
            schemaValidationConfigs:
                - attribute: string
    sourceAccessConfigurations:
        - type: string
          uri: string
    startingPosition: string
    startingPositionTimestamp: string
    tags:
        string: string
    topics:
        - string
    tumblingWindowInSeconds: 0
```

## EventSourceMapping Resource Properties[](#properties)

To learn more about resource properties and how to use them, see [Inputs and Outputs](/docs/intro/concepts/inputs-outputs) in the Architecture and Concepts docs.

### Inputs[](#inputs)

In Python, inputs that are objects can be passed either as [argument classes or as dictionary literals](/docs/languages-sdks/python/#inputs-and-outputs).

The EventSourceMapping resource accepts the following [input](/docs/intro/concepts/inputs-outputs) properties:

[FunctionName](#functionname_csharp) This property is required. string

Name or ARN of the Lambda function that will be subscribing to events.

The following arguments are optional:

[AmazonManagedKafkaEventSourceConfig](#amazonmanagedkafkaeventsourceconfig_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [EventSourceMappingAmazonManagedKafkaEventSourceConfig](#eventsourcemappingamazonmanagedkafkaeventsourceconfig)

Additional configuration block for Amazon Managed Kafka sources. Incompatible with `selfManagedEventSource` and `selfManagedKafkaEventSourceConfig`. See below.

[BatchSize](#batchsize_csharp) int

Largest number of records that Lambda will retrieve from your event source at the time of invocation. Defaults to `100` for DynamoDB, Kinesis, MQ and MSK, `10` for SQS.

[BisectBatchOnFunctionError](#bisectbatchonfunctionerror_csharp) bool

Whether to split the batch in two and retry if the function returns an error. Only available for stream sources (DynamoDB and Kinesis). Defaults to `false`.

[DestinationConfig](#destinationconfig_csharp) [EventSourceMappingDestinationConfig](#eventsourcemappingdestinationconfig)

Amazon SQS queue, Amazon SNS topic or Amazon S3 bucket (only available for Kafka sources) destination for failed records. Only available for stream sources (DynamoDB and Kinesis) and Kafka sources (Amazon MSK and Self-managed Apache Kafka). See below.

[DocumentDbEventSourceConfig](#documentdbeventsourceconfig_csharp) [EventSourceMappingDocumentDbEventSourceConfig](#eventsourcemappingdocumentdbeventsourceconfig)

Configuration settings for a DocumentDB event source. See below.

[Enabled](#enabled_csharp) bool

Whether the mapping is enabled. Defaults to `true`.

[EventSourceArn](#eventsourcearn_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Event source ARN - required for Kinesis stream, DynamoDB stream, SQS queue, MQ broker, MSK cluster or DocumentDB change stream. Incompatible with Self Managed Kafka source.

[FilterCriteria](#filtercriteria_csharp) [EventSourceMappingFilterCriteria](#eventsourcemappingfiltercriteria)

Criteria to use for [event filtering](https://docs.aws.amazon.com/lambda/latest/dg/invocation-eventfiltering.html) Kinesis stream, DynamoDB stream, SQS queue event sources. See below.

[FunctionResponseTypes](#functionresponsetypes_csharp) List<string>

List of current response type enums applied to the event source mapping for [AWS Lambda checkpointing](https://docs.aws.amazon.com/lambda/latest/dg/with-ddb.html#services-ddb-batchfailurereporting). Only available for SQS and stream sources (DynamoDB and Kinesis). Valid values: `ReportBatchItemFailures`.

[KmsKeyArn](#kmskeyarn_csharp) string

ARN of the Key Management Service (KMS) customer managed key that Lambda uses to encrypt your function's filter criteria.

[MaximumBatchingWindowInSeconds](#maximumbatchingwindowinseconds_csharp) int

Maximum amount of time to gather records before invoking the function, in seconds (between 0 and 300). Records will continue to buffer until either `maximumBatchingWindowInSeconds` expires or `batchSize` has been met. For streaming event sources, defaults to as soon as records are available in the stream. Only available for stream sources (DynamoDB and Kinesis) and SQS standard queues.

[MaximumRecordAgeInSeconds](#maximumrecordageinseconds_csharp) int

Maximum age of a record that Lambda sends to a function for processing. Only available for stream sources (DynamoDB and Kinesis). Must be either -1 (forever, and the default value) or between 60 and 604800 (inclusive).

[MaximumRetryAttempts](#maximumretryattempts_csharp) int

Maximum number of times to retry when the function returns an error. Only available for stream sources (DynamoDB and Kinesis). Minimum and default of -1 (forever), maximum of 10000.

[MetricsConfig](#metricsconfig_csharp) [EventSourceMappingMetricsConfig](#eventsourcemappingmetricsconfig)

CloudWatch metrics configuration of the event source. Only available for stream sources (DynamoDB and Kinesis) and SQS queues. See below.

[ParallelizationFactor](#parallelizationfactor_csharp) int

Number of batches to process from each shard concurrently. Only available for stream sources (DynamoDB and Kinesis). Minimum and default of 1, maximum of 10.

[ProvisionedPollerConfig](#provisionedpollerconfig_csharp) [EventSourceMappingProvisionedPollerConfig](#eventsourcemappingprovisionedpollerconfig)

Event poller configuration for the event source. Only valid for Amazon MSK or self-managed Apache Kafka sources. See below.

[Queues](#queues_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Name of the Amazon MQ broker destination queue to consume. Only available for MQ sources. The list must contain exactly one queue name.

[Region](#region_csharp) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[ScalingConfig](#scalingconfig_csharp) [EventSourceMappingScalingConfig](#eventsourcemappingscalingconfig)

Scaling configuration of the event source. Only available for SQS queues. See below.

[SelfManagedEventSource](#selfmanagedeventsource_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [EventSourceMappingSelfManagedEventSource](#eventsourcemappingselfmanagedeventsource)

For Self Managed Kafka sources, the location of the self managed cluster. If set, configuration must also include `sourceAccessConfiguration`. See below.

[SelfManagedKafkaEventSourceConfig](#selfmanagedkafkaeventsourceconfig_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [EventSourceMappingSelfManagedKafkaEventSourceConfig](#eventsourcemappingselfmanagedkafkaeventsourceconfig)

Additional configuration block for Self Managed Kafka sources. Incompatible with `eventSourceArn` and `amazonManagedKafkaEventSourceConfig`. See below.

[SourceAccessConfigurations](#sourceaccessconfigurations_csharp) [List<EventSourceMappingSourceAccessConfiguration>](#eventsourcemappingsourceaccessconfiguration)

For Self Managed Kafka sources, the access configuration for the source. If set, configuration must also include `selfManagedEventSource`. See below.

[StartingPosition](#startingposition_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Position in the stream where AWS Lambda should start reading. Must be one of `AT_TIMESTAMP` (Kinesis only), `LATEST` or `TRIM_HORIZON` if getting events from Kinesis, DynamoDB, MSK or Self Managed Apache Kafka. Must not be provided if getting events from SQS. More information about these positions can be found in the [AWS DynamoDB Streams API Reference](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_streams_GetShardIterator.html) and [AWS Kinesis API Reference](https://docs.aws.amazon.com/kinesis/latest/APIReference/API_GetShardIterator.html#Kinesis-GetShardIterator-request-ShardIteratorType).

[StartingPositionTimestamp](#startingpositiontimestamp_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Timestamp in [RFC3339 format](https://tools.ietf.org/html/rfc3339#section-5.8) of the data record which to start reading when using `startingPosition` set to `AT_TIMESTAMP`. If a record with this exact timestamp does not exist, the next later record is chosen. If the timestamp is older than the current trim horizon, the oldest available record is chosen.

[Tags](#tags_csharp) Dictionary<string, string>

Map of tags to assign to the object. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[Topics](#topics_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. List<string>

Name of the Kafka topics. Only available for MSK sources. A single topic name must be specified.

[TumblingWindowInSeconds](#tumblingwindowinseconds_csharp) int

Duration in seconds of a processing window for [AWS Lambda streaming analytics](https://docs.aws.amazon.com/lambda/latest/dg/with-kinesis.html#services-kinesis-windows). The range is between 1 second up to 900 seconds. Only available for stream sources (DynamoDB and Kinesis).

[FunctionName](#functionname_go) This property is required. string

Name or ARN of the Lambda function that will be subscribing to events.

The following arguments are optional:

[AmazonManagedKafkaEventSourceConfig](#amazonmanagedkafkaeventsourceconfig_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [EventSourceMappingAmazonManagedKafkaEventSourceConfigArgs](#eventsourcemappingamazonmanagedkafkaeventsourceconfig)

Additional configuration block for Amazon Managed Kafka sources. Incompatible with `selfManagedEventSource` and `selfManagedKafkaEventSourceConfig`. See below.

[BatchSize](#batchsize_go) int

Largest number of records that Lambda will retrieve from your event source at the time of invocation. Defaults to `100` for DynamoDB, Kinesis, MQ and MSK, `10` for SQS.

[BisectBatchOnFunctionError](#bisectbatchonfunctionerror_go) bool

Whether to split the batch in two and retry if the function returns an error. Only available for stream sources (DynamoDB and Kinesis). Defaults to `false`.

[DestinationConfig](#destinationconfig_go) [EventSourceMappingDestinationConfigArgs](#eventsourcemappingdestinationconfig)

Amazon SQS queue, Amazon SNS topic or Amazon S3 bucket (only available for Kafka sources) destination for failed records. Only available for stream sources (DynamoDB and Kinesis) and Kafka sources (Amazon MSK and Self-managed Apache Kafka). See below.

[DocumentDbEventSourceConfig](#documentdbeventsourceconfig_go) [EventSourceMappingDocumentDbEventSourceConfigArgs](#eventsourcemappingdocumentdbeventsourceconfig)

Configuration settings for a DocumentDB event source. See below.

[Enabled](#enabled_go) bool

Whether the mapping is enabled. Defaults to `true`.

[EventSourceArn](#eventsourcearn_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Event source ARN - required for Kinesis stream, DynamoDB stream, SQS queue, MQ broker, MSK cluster or DocumentDB change stream. Incompatible with Self Managed Kafka source.

[FilterCriteria](#filtercriteria_go) [EventSourceMappingFilterCriteriaArgs](#eventsourcemappingfiltercriteria)

Criteria to use for [event filtering](https://docs.aws.amazon.com/lambda/latest/dg/invocation-eventfiltering.html) Kinesis stream, DynamoDB stream, SQS queue event sources. See below.

[FunctionResponseTypes](#functionresponsetypes_go) \[\]string

List of current response type enums applied to the event source mapping for [AWS Lambda checkpointing](https://docs.aws.amazon.com/lambda/latest/dg/with-ddb.html#services-ddb-batchfailurereporting). Only available for SQS and stream sources (DynamoDB and Kinesis). Valid values: `ReportBatchItemFailures`.

[KmsKeyArn](#kmskeyarn_go) string

ARN of the Key Management Service (KMS) customer managed key that Lambda uses to encrypt your function's filter criteria.

[MaximumBatchingWindowInSeconds](#maximumbatchingwindowinseconds_go) int

Maximum amount of time to gather records before invoking the function, in seconds (between 0 and 300). Records will continue to buffer until either `maximumBatchingWindowInSeconds` expires or `batchSize` has been met. For streaming event sources, defaults to as soon as records are available in the stream. Only available for stream sources (DynamoDB and Kinesis) and SQS standard queues.

[MaximumRecordAgeInSeconds](#maximumrecordageinseconds_go) int

Maximum age of a record that Lambda sends to a function for processing. Only available for stream sources (DynamoDB and Kinesis). Must be either -1 (forever, and the default value) or between 60 and 604800 (inclusive).

[MaximumRetryAttempts](#maximumretryattempts_go) int

Maximum number of times to retry when the function returns an error. Only available for stream sources (DynamoDB and Kinesis). Minimum and default of -1 (forever), maximum of 10000.

[MetricsConfig](#metricsconfig_go) [EventSourceMappingMetricsConfigArgs](#eventsourcemappingmetricsconfig)

CloudWatch metrics configuration of the event source. Only available for stream sources (DynamoDB and Kinesis) and SQS queues. See below.

[ParallelizationFactor](#parallelizationfactor_go) int

Number of batches to process from each shard concurrently. Only available for stream sources (DynamoDB and Kinesis). Minimum and default of 1, maximum of 10.

[ProvisionedPollerConfig](#provisionedpollerconfig_go) [EventSourceMappingProvisionedPollerConfigArgs](#eventsourcemappingprovisionedpollerconfig)

Event poller configuration for the event source. Only valid for Amazon MSK or self-managed Apache Kafka sources. See below.

[Queues](#queues_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Name of the Amazon MQ broker destination queue to consume. Only available for MQ sources. The list must contain exactly one queue name.

[Region](#region_go) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[ScalingConfig](#scalingconfig_go) [EventSourceMappingScalingConfigArgs](#eventsourcemappingscalingconfig)

Scaling configuration of the event source. Only available for SQS queues. See below.

[SelfManagedEventSource](#selfmanagedeventsource_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [EventSourceMappingSelfManagedEventSourceArgs](#eventsourcemappingselfmanagedeventsource)

For Self Managed Kafka sources, the location of the self managed cluster. If set, configuration must also include `sourceAccessConfiguration`. See below.

[SelfManagedKafkaEventSourceConfig](#selfmanagedkafkaeventsourceconfig_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [EventSourceMappingSelfManagedKafkaEventSourceConfigArgs](#eventsourcemappingselfmanagedkafkaeventsourceconfig)

Additional configuration block for Self Managed Kafka sources. Incompatible with `eventSourceArn` and `amazonManagedKafkaEventSourceConfig`. See below.

[SourceAccessConfigurations](#sourceaccessconfigurations_go) [\[\]EventSourceMappingSourceAccessConfigurationArgs](#eventsourcemappingsourceaccessconfiguration)

For Self Managed Kafka sources, the access configuration for the source. If set, configuration must also include `selfManagedEventSource`. See below.

[StartingPosition](#startingposition_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Position in the stream where AWS Lambda should start reading. Must be one of `AT_TIMESTAMP` (Kinesis only), `LATEST` or `TRIM_HORIZON` if getting events from Kinesis, DynamoDB, MSK or Self Managed Apache Kafka. Must not be provided if getting events from SQS. More information about these positions can be found in the [AWS DynamoDB Streams API Reference](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_streams_GetShardIterator.html) and [AWS Kinesis API Reference](https://docs.aws.amazon.com/kinesis/latest/APIReference/API_GetShardIterator.html#Kinesis-GetShardIterator-request-ShardIteratorType).

[StartingPositionTimestamp](#startingpositiontimestamp_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Timestamp in [RFC3339 format](https://tools.ietf.org/html/rfc3339#section-5.8) of the data record which to start reading when using `startingPosition` set to `AT_TIMESTAMP`. If a record with this exact timestamp does not exist, the next later record is chosen. If the timestamp is older than the current trim horizon, the oldest available record is chosen.

[Tags](#tags_go) map\[string\]string

Map of tags to assign to the object. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[Topics](#topics_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. \[\]string

Name of the Kafka topics. Only available for MSK sources. A single topic name must be specified.

[TumblingWindowInSeconds](#tumblingwindowinseconds_go) int

Duration in seconds of a processing window for [AWS Lambda streaming analytics](https://docs.aws.amazon.com/lambda/latest/dg/with-kinesis.html#services-kinesis-windows). The range is between 1 second up to 900 seconds. Only available for stream sources (DynamoDB and Kinesis).

[function\_name](#function_name_hcl) This property is required. string

Name or ARN of the Lambda function that will be subscribing to events.

The following arguments are optional:

[amazon\_managed\_kafka\_event\_source\_config](#amazon_managed_kafka_event_source_config_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [object](#eventsourcemappingamazonmanagedkafkaeventsourceconfig)

Additional configuration block for Amazon Managed Kafka sources. Incompatible with `selfManagedEventSource` and `selfManagedKafkaEventSourceConfig`. See below.

[batch\_size](#batch_size_hcl) number

Largest number of records that Lambda will retrieve from your event source at the time of invocation. Defaults to `100` for DynamoDB, Kinesis, MQ and MSK, `10` for SQS.

[bisect\_batch\_on\_function\_error](#bisect_batch_on_function_error_hcl) bool

Whether to split the batch in two and retry if the function returns an error. Only available for stream sources (DynamoDB and Kinesis). Defaults to `false`.

[destination\_config](#destination_config_hcl) [object](#eventsourcemappingdestinationconfig)

Amazon SQS queue, Amazon SNS topic or Amazon S3 bucket (only available for Kafka sources) destination for failed records. Only available for stream sources (DynamoDB and Kinesis) and Kafka sources (Amazon MSK and Self-managed Apache Kafka). See below.

[document\_db\_event\_source\_config](#document_db_event_source_config_hcl) [object](#eventsourcemappingdocumentdbeventsourceconfig)

Configuration settings for a DocumentDB event source. See below.

[enabled](#enabled_hcl) bool

Whether the mapping is enabled. Defaults to `true`.

[event\_source\_arn](#event_source_arn_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Event source ARN - required for Kinesis stream, DynamoDB stream, SQS queue, MQ broker, MSK cluster or DocumentDB change stream. Incompatible with Self Managed Kafka source.

[filter\_criteria](#filter_criteria_hcl) [object](#eventsourcemappingfiltercriteria)

Criteria to use for [event filtering](https://docs.aws.amazon.com/lambda/latest/dg/invocation-eventfiltering.html) Kinesis stream, DynamoDB stream, SQS queue event sources. See below.

[function\_response\_types](#function_response_types_hcl) list(string)

List of current response type enums applied to the event source mapping for [AWS Lambda checkpointing](https://docs.aws.amazon.com/lambda/latest/dg/with-ddb.html#services-ddb-batchfailurereporting). Only available for SQS and stream sources (DynamoDB and Kinesis). Valid values: `ReportBatchItemFailures`.

[kms\_key\_arn](#kms_key_arn_hcl) string

ARN of the Key Management Service (KMS) customer managed key that Lambda uses to encrypt your function's filter criteria.

[maximum\_batching\_window\_in\_seconds](#maximum_batching_window_in_seconds_hcl) number

Maximum amount of time to gather records before invoking the function, in seconds (between 0 and 300). Records will continue to buffer until either `maximumBatchingWindowInSeconds` expires or `batchSize` has been met. For streaming event sources, defaults to as soon as records are available in the stream. Only available for stream sources (DynamoDB and Kinesis) and SQS standard queues.

[maximum\_record\_age\_in\_seconds](#maximum_record_age_in_seconds_hcl) number

Maximum age of a record that Lambda sends to a function for processing. Only available for stream sources (DynamoDB and Kinesis). Must be either -1 (forever, and the default value) or between 60 and 604800 (inclusive).

[maximum\_retry\_attempts](#maximum_retry_attempts_hcl) number

Maximum number of times to retry when the function returns an error. Only available for stream sources (DynamoDB and Kinesis). Minimum and default of -1 (forever), maximum of 10000.

[metrics\_config](#metrics_config_hcl) [object](#eventsourcemappingmetricsconfig)

CloudWatch metrics configuration of the event source. Only available for stream sources (DynamoDB and Kinesis) and SQS queues. See below.

[parallelization\_factor](#parallelization_factor_hcl) number

Number of batches to process from each shard concurrently. Only available for stream sources (DynamoDB and Kinesis). Minimum and default of 1, maximum of 10.

[provisioned\_poller\_config](#provisioned_poller_config_hcl) [object](#eventsourcemappingprovisionedpollerconfig)

Event poller configuration for the event source. Only valid for Amazon MSK or self-managed Apache Kafka sources. See below.

[queues](#queues_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Name of the Amazon MQ broker destination queue to consume. Only available for MQ sources. The list must contain exactly one queue name.

[region](#region_hcl) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[scaling\_config](#scaling_config_hcl) [object](#eventsourcemappingscalingconfig)

Scaling configuration of the event source. Only available for SQS queues. See below.

[self\_managed\_event\_source](#self_managed_event_source_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [object](#eventsourcemappingselfmanagedeventsource)

For Self Managed Kafka sources, the location of the self managed cluster. If set, configuration must also include `sourceAccessConfiguration`. See below.

[self\_managed\_kafka\_event\_source\_config](#self_managed_kafka_event_source_config_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [object](#eventsourcemappingselfmanagedkafkaeventsourceconfig)

Additional configuration block for Self Managed Kafka sources. Incompatible with `eventSourceArn` and `amazonManagedKafkaEventSourceConfig`. See below.

[source\_access\_configurations](#source_access_configurations_hcl) [list(object)](#eventsourcemappingsourceaccessconfiguration)

For Self Managed Kafka sources, the access configuration for the source. If set, configuration must also include `selfManagedEventSource`. See below.

[starting\_position](#starting_position_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Position in the stream where AWS Lambda should start reading. Must be one of `AT_TIMESTAMP` (Kinesis only), `LATEST` or `TRIM_HORIZON` if getting events from Kinesis, DynamoDB, MSK or Self Managed Apache Kafka. Must not be provided if getting events from SQS. More information about these positions can be found in the [AWS DynamoDB Streams API Reference](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_streams_GetShardIterator.html) and [AWS Kinesis API Reference](https://docs.aws.amazon.com/kinesis/latest/APIReference/API_GetShardIterator.html#Kinesis-GetShardIterator-request-ShardIteratorType).

[starting\_position\_timestamp](#starting_position_timestamp_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Timestamp in [RFC3339 format](https://tools.ietf.org/html/rfc3339#section-5.8) of the data record which to start reading when using `startingPosition` set to `AT_TIMESTAMP`. If a record with this exact timestamp does not exist, the next later record is chosen. If the timestamp is older than the current trim horizon, the oldest available record is chosen.

[tags](#tags_hcl) map(string)

Map of tags to assign to the object. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[topics](#topics_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. list(string)

Name of the Kafka topics. Only available for MSK sources. A single topic name must be specified.

[tumbling\_window\_in\_seconds](#tumbling_window_in_seconds_hcl) number

Duration in seconds of a processing window for [AWS Lambda streaming analytics](https://docs.aws.amazon.com/lambda/latest/dg/with-kinesis.html#services-kinesis-windows). The range is between 1 second up to 900 seconds. Only available for stream sources (DynamoDB and Kinesis).

[functionName](#functionname_java) This property is required. String

Name or ARN of the Lambda function that will be subscribing to events.

The following arguments are optional:

[amazonManagedKafkaEventSourceConfig](#amazonmanagedkafkaeventsourceconfig_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [EventSourceMappingAmazonManagedKafkaEventSourceConfig](#eventsourcemappingamazonmanagedkafkaeventsourceconfig)

Additional configuration block for Amazon Managed Kafka sources. Incompatible with `selfManagedEventSource` and `selfManagedKafkaEventSourceConfig`. See below.

[batchSize](#batchsize_java) Integer

Largest number of records that Lambda will retrieve from your event source at the time of invocation. Defaults to `100` for DynamoDB, Kinesis, MQ and MSK, `10` for SQS.

[bisectBatchOnFunctionError](#bisectbatchonfunctionerror_java) Boolean

Whether to split the batch in two and retry if the function returns an error. Only available for stream sources (DynamoDB and Kinesis). Defaults to `false`.

[destinationConfig](#destinationconfig_java) [EventSourceMappingDestinationConfig](#eventsourcemappingdestinationconfig)

Amazon SQS queue, Amazon SNS topic or Amazon S3 bucket (only available for Kafka sources) destination for failed records. Only available for stream sources (DynamoDB and Kinesis) and Kafka sources (Amazon MSK and Self-managed Apache Kafka). See below.

[documentDbEventSourceConfig](#documentdbeventsourceconfig_java) [EventSourceMappingDocumentDbEventSourceConfig](#eventsourcemappingdocumentdbeventsourceconfig)

Configuration settings for a DocumentDB event source. See below.

[enabled](#enabled_java) Boolean

Whether the mapping is enabled. Defaults to `true`.

[eventSourceArn](#eventsourcearn_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Event source ARN - required for Kinesis stream, DynamoDB stream, SQS queue, MQ broker, MSK cluster or DocumentDB change stream. Incompatible with Self Managed Kafka source.

[filterCriteria](#filtercriteria_java) [EventSourceMappingFilterCriteria](#eventsourcemappingfiltercriteria)

Criteria to use for [event filtering](https://docs.aws.amazon.com/lambda/latest/dg/invocation-eventfiltering.html) Kinesis stream, DynamoDB stream, SQS queue event sources. See below.

[functionResponseTypes](#functionresponsetypes_java) List<String>

List of current response type enums applied to the event source mapping for [AWS Lambda checkpointing](https://docs.aws.amazon.com/lambda/latest/dg/with-ddb.html#services-ddb-batchfailurereporting). Only available for SQS and stream sources (DynamoDB and Kinesis). Valid values: `ReportBatchItemFailures`.

[kmsKeyArn](#kmskeyarn_java) String

ARN of the Key Management Service (KMS) customer managed key that Lambda uses to encrypt your function's filter criteria.

[maximumBatchingWindowInSeconds](#maximumbatchingwindowinseconds_java) Integer

Maximum amount of time to gather records before invoking the function, in seconds (between 0 and 300). Records will continue to buffer until either `maximumBatchingWindowInSeconds` expires or `batchSize` has been met. For streaming event sources, defaults to as soon as records are available in the stream. Only available for stream sources (DynamoDB and Kinesis) and SQS standard queues.

[maximumRecordAgeInSeconds](#maximumrecordageinseconds_java) Integer

Maximum age of a record that Lambda sends to a function for processing. Only available for stream sources (DynamoDB and Kinesis). Must be either -1 (forever, and the default value) or between 60 and 604800 (inclusive).

[maximumRetryAttempts](#maximumretryattempts_java) Integer

Maximum number of times to retry when the function returns an error. Only available for stream sources (DynamoDB and Kinesis). Minimum and default of -1 (forever), maximum of 10000.

[metricsConfig](#metricsconfig_java) [EventSourceMappingMetricsConfig](#eventsourcemappingmetricsconfig)

CloudWatch metrics configuration of the event source. Only available for stream sources (DynamoDB and Kinesis) and SQS queues. See below.

[parallelizationFactor](#parallelizationfactor_java) Integer

Number of batches to process from each shard concurrently. Only available for stream sources (DynamoDB and Kinesis). Minimum and default of 1, maximum of 10.

[provisionedPollerConfig](#provisionedpollerconfig_java) [EventSourceMappingProvisionedPollerConfig](#eventsourcemappingprovisionedpollerconfig)

Event poller configuration for the event source. Only valid for Amazon MSK or self-managed Apache Kafka sources. See below.

[queues](#queues_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Name of the Amazon MQ broker destination queue to consume. Only available for MQ sources. The list must contain exactly one queue name.

[region](#region_java) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[scalingConfig](#scalingconfig_java) [EventSourceMappingScalingConfig](#eventsourcemappingscalingconfig)

Scaling configuration of the event source. Only available for SQS queues. See below.

[selfManagedEventSource](#selfmanagedeventsource_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [EventSourceMappingSelfManagedEventSource](#eventsourcemappingselfmanagedeventsource)

For Self Managed Kafka sources, the location of the self managed cluster. If set, configuration must also include `sourceAccessConfiguration`. See below.

[selfManagedKafkaEventSourceConfig](#selfmanagedkafkaeventsourceconfig_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [EventSourceMappingSelfManagedKafkaEventSourceConfig](#eventsourcemappingselfmanagedkafkaeventsourceconfig)

Additional configuration block for Self Managed Kafka sources. Incompatible with `eventSourceArn` and `amazonManagedKafkaEventSourceConfig`. See below.

[sourceAccessConfigurations](#sourceaccessconfigurations_java) [List<EventSourceMappingSourceAccessConfiguration>](#eventsourcemappingsourceaccessconfiguration)

For Self Managed Kafka sources, the access configuration for the source. If set, configuration must also include `selfManagedEventSource`. See below.

[startingPosition](#startingposition_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Position in the stream where AWS Lambda should start reading. Must be one of `AT_TIMESTAMP` (Kinesis only), `LATEST` or `TRIM_HORIZON` if getting events from Kinesis, DynamoDB, MSK or Self Managed Apache Kafka. Must not be provided if getting events from SQS. More information about these positions can be found in the [AWS DynamoDB Streams API Reference](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_streams_GetShardIterator.html) and [AWS Kinesis API Reference](https://docs.aws.amazon.com/kinesis/latest/APIReference/API_GetShardIterator.html#Kinesis-GetShardIterator-request-ShardIteratorType).

[startingPositionTimestamp](#startingpositiontimestamp_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Timestamp in [RFC3339 format](https://tools.ietf.org/html/rfc3339#section-5.8) of the data record which to start reading when using `startingPosition` set to `AT_TIMESTAMP`. If a record with this exact timestamp does not exist, the next later record is chosen. If the timestamp is older than the current trim horizon, the oldest available record is chosen.

[tags](#tags_java) Map<String,String>

Map of tags to assign to the object. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[topics](#topics_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. List<String>

Name of the Kafka topics. Only available for MSK sources. A single topic name must be specified.

[tumblingWindowInSeconds](#tumblingwindowinseconds_java) Integer

Duration in seconds of a processing window for [AWS Lambda streaming analytics](https://docs.aws.amazon.com/lambda/latest/dg/with-kinesis.html#services-kinesis-windows). The range is between 1 second up to 900 seconds. Only available for stream sources (DynamoDB and Kinesis).

[functionName](#functionname_nodejs) This property is required. string

Name or ARN of the Lambda function that will be subscribing to events.

The following arguments are optional:

[amazonManagedKafkaEventSourceConfig](#amazonmanagedkafkaeventsourceconfig_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [EventSourceMappingAmazonManagedKafkaEventSourceConfig](#eventsourcemappingamazonmanagedkafkaeventsourceconfig)

Additional configuration block for Amazon Managed Kafka sources. Incompatible with `selfManagedEventSource` and `selfManagedKafkaEventSourceConfig`. See below.

[batchSize](#batchsize_nodejs) number

Largest number of records that Lambda will retrieve from your event source at the time of invocation. Defaults to `100` for DynamoDB, Kinesis, MQ and MSK, `10` for SQS.

[bisectBatchOnFunctionError](#bisectbatchonfunctionerror_nodejs) boolean

Whether to split the batch in two and retry if the function returns an error. Only available for stream sources (DynamoDB and Kinesis). Defaults to `false`.

[destinationConfig](#destinationconfig_nodejs) [EventSourceMappingDestinationConfig](#eventsourcemappingdestinationconfig)

Amazon SQS queue, Amazon SNS topic or Amazon S3 bucket (only available for Kafka sources) destination for failed records. Only available for stream sources (DynamoDB and Kinesis) and Kafka sources (Amazon MSK and Self-managed Apache Kafka). See below.

[documentDbEventSourceConfig](#documentdbeventsourceconfig_nodejs) [EventSourceMappingDocumentDbEventSourceConfig](#eventsourcemappingdocumentdbeventsourceconfig)

Configuration settings for a DocumentDB event source. See below.

[enabled](#enabled_nodejs) boolean

Whether the mapping is enabled. Defaults to `true`.

[eventSourceArn](#eventsourcearn_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Event source ARN - required for Kinesis stream, DynamoDB stream, SQS queue, MQ broker, MSK cluster or DocumentDB change stream. Incompatible with Self Managed Kafka source.

[filterCriteria](#filtercriteria_nodejs) [EventSourceMappingFilterCriteria](#eventsourcemappingfiltercriteria)

Criteria to use for [event filtering](https://docs.aws.amazon.com/lambda/latest/dg/invocation-eventfiltering.html) Kinesis stream, DynamoDB stream, SQS queue event sources. See below.

[functionResponseTypes](#functionresponsetypes_nodejs) string\[\]

List of current response type enums applied to the event source mapping for [AWS Lambda checkpointing](https://docs.aws.amazon.com/lambda/latest/dg/with-ddb.html#services-ddb-batchfailurereporting). Only available for SQS and stream sources (DynamoDB and Kinesis). Valid values: `ReportBatchItemFailures`.

[kmsKeyArn](#kmskeyarn_nodejs) string

ARN of the Key Management Service (KMS) customer managed key that Lambda uses to encrypt your function's filter criteria.

[maximumBatchingWindowInSeconds](#maximumbatchingwindowinseconds_nodejs) number

Maximum amount of time to gather records before invoking the function, in seconds (between 0 and 300). Records will continue to buffer until either `maximumBatchingWindowInSeconds` expires or `batchSize` has been met. For streaming event sources, defaults to as soon as records are available in the stream. Only available for stream sources (DynamoDB and Kinesis) and SQS standard queues.

[maximumRecordAgeInSeconds](#maximumrecordageinseconds_nodejs) number

Maximum age of a record that Lambda sends to a function for processing. Only available for stream sources (DynamoDB and Kinesis). Must be either -1 (forever, and the default value) or between 60 and 604800 (inclusive).

[maximumRetryAttempts](#maximumretryattempts_nodejs) number

Maximum number of times to retry when the function returns an error. Only available for stream sources (DynamoDB and Kinesis). Minimum and default of -1 (forever), maximum of 10000.

[metricsConfig](#metricsconfig_nodejs) [EventSourceMappingMetricsConfig](#eventsourcemappingmetricsconfig)

CloudWatch metrics configuration of the event source. Only available for stream sources (DynamoDB and Kinesis) and SQS queues. See below.

[parallelizationFactor](#parallelizationfactor_nodejs) number

Number of batches to process from each shard concurrently. Only available for stream sources (DynamoDB and Kinesis). Minimum and default of 1, maximum of 10.

[provisionedPollerConfig](#provisionedpollerconfig_nodejs) [EventSourceMappingProvisionedPollerConfig](#eventsourcemappingprovisionedpollerconfig)

Event poller configuration for the event source. Only valid for Amazon MSK or self-managed Apache Kafka sources. See below.

[queues](#queues_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Name of the Amazon MQ broker destination queue to consume. Only available for MQ sources. The list must contain exactly one queue name.

[region](#region_nodejs) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[scalingConfig](#scalingconfig_nodejs) [EventSourceMappingScalingConfig](#eventsourcemappingscalingconfig)

Scaling configuration of the event source. Only available for SQS queues. See below.

[selfManagedEventSource](#selfmanagedeventsource_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [EventSourceMappingSelfManagedEventSource](#eventsourcemappingselfmanagedeventsource)

For Self Managed Kafka sources, the location of the self managed cluster. If set, configuration must also include `sourceAccessConfiguration`. See below.

[selfManagedKafkaEventSourceConfig](#selfmanagedkafkaeventsourceconfig_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [EventSourceMappingSelfManagedKafkaEventSourceConfig](#eventsourcemappingselfmanagedkafkaeventsourceconfig)

Additional configuration block for Self Managed Kafka sources. Incompatible with `eventSourceArn` and `amazonManagedKafkaEventSourceConfig`. See below.

[sourceAccessConfigurations](#sourceaccessconfigurations_nodejs) [EventSourceMappingSourceAccessConfiguration\[\]](#eventsourcemappingsourceaccessconfiguration)

For Self Managed Kafka sources, the access configuration for the source. If set, configuration must also include `selfManagedEventSource`. See below.

[startingPosition](#startingposition_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Position in the stream where AWS Lambda should start reading. Must be one of `AT_TIMESTAMP` (Kinesis only), `LATEST` or `TRIM_HORIZON` if getting events from Kinesis, DynamoDB, MSK or Self Managed Apache Kafka. Must not be provided if getting events from SQS. More information about these positions can be found in the [AWS DynamoDB Streams API Reference](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_streams_GetShardIterator.html) and [AWS Kinesis API Reference](https://docs.aws.amazon.com/kinesis/latest/APIReference/API_GetShardIterator.html#Kinesis-GetShardIterator-request-ShardIteratorType).

[startingPositionTimestamp](#startingpositiontimestamp_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Timestamp in [RFC3339 format](https://tools.ietf.org/html/rfc3339#section-5.8) of the data record which to start reading when using `startingPosition` set to `AT_TIMESTAMP`. If a record with this exact timestamp does not exist, the next later record is chosen. If the timestamp is older than the current trim horizon, the oldest available record is chosen.

[tags](#tags_nodejs) {\[key: string\]: string}

Map of tags to assign to the object. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[topics](#topics_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string\[\]

Name of the Kafka topics. Only available for MSK sources. A single topic name must be specified.

[tumblingWindowInSeconds](#tumblingwindowinseconds_nodejs) number

Duration in seconds of a processing window for [AWS Lambda streaming analytics](https://docs.aws.amazon.com/lambda/latest/dg/with-kinesis.html#services-kinesis-windows). The range is between 1 second up to 900 seconds. Only available for stream sources (DynamoDB and Kinesis).

[function\_name](#function_name_python) This property is required. str

Name or ARN of the Lambda function that will be subscribing to events.

The following arguments are optional:

[amazon\_managed\_kafka\_event\_source\_config](#amazon_managed_kafka_event_source_config_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [EventSourceMappingAmazonManagedKafkaEventSourceConfigArgs](#eventsourcemappingamazonmanagedkafkaeventsourceconfig)

Additional configuration block for Amazon Managed Kafka sources. Incompatible with `selfManagedEventSource` and `selfManagedKafkaEventSourceConfig`. See below.

[batch\_size](#batch_size_python) int

Largest number of records that Lambda will retrieve from your event source at the time of invocation. Defaults to `100` for DynamoDB, Kinesis, MQ and MSK, `10` for SQS.

[bisect\_batch\_on\_function\_error](#bisect_batch_on_function_error_python) bool

Whether to split the batch in two and retry if the function returns an error. Only available for stream sources (DynamoDB and Kinesis). Defaults to `false`.

[destination\_config](#destination_config_python) [EventSourceMappingDestinationConfigArgs](#eventsourcemappingdestinationconfig)

Amazon SQS queue, Amazon SNS topic or Amazon S3 bucket (only available for Kafka sources) destination for failed records. Only available for stream sources (DynamoDB and Kinesis) and Kafka sources (Amazon MSK and Self-managed Apache Kafka). See below.

[document\_db\_event\_source\_config](#document_db_event_source_config_python) [EventSourceMappingDocumentDbEventSourceConfigArgs](#eventsourcemappingdocumentdbeventsourceconfig)

Configuration settings for a DocumentDB event source. See below.

[enabled](#enabled_python) bool

Whether the mapping is enabled. Defaults to `true`.

[event\_source\_arn](#event_source_arn_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Event source ARN - required for Kinesis stream, DynamoDB stream, SQS queue, MQ broker, MSK cluster or DocumentDB change stream. Incompatible with Self Managed Kafka source.

[filter\_criteria](#filter_criteria_python) [EventSourceMappingFilterCriteriaArgs](#eventsourcemappingfiltercriteria)

Criteria to use for [event filtering](https://docs.aws.amazon.com/lambda/latest/dg/invocation-eventfiltering.html) Kinesis stream, DynamoDB stream, SQS queue event sources. See below.

[function\_response\_types](#function_response_types_python) Sequence\[str\]

List of current response type enums applied to the event source mapping for [AWS Lambda checkpointing](https://docs.aws.amazon.com/lambda/latest/dg/with-ddb.html#services-ddb-batchfailurereporting). Only available for SQS and stream sources (DynamoDB and Kinesis). Valid values: `ReportBatchItemFailures`.

[kms\_key\_arn](#kms_key_arn_python) str

ARN of the Key Management Service (KMS) customer managed key that Lambda uses to encrypt your function's filter criteria.

[maximum\_batching\_window\_in\_seconds](#maximum_batching_window_in_seconds_python) int

Maximum amount of time to gather records before invoking the function, in seconds (between 0 and 300). Records will continue to buffer until either `maximumBatchingWindowInSeconds` expires or `batchSize` has been met. For streaming event sources, defaults to as soon as records are available in the stream. Only available for stream sources (DynamoDB and Kinesis) and SQS standard queues.

[maximum\_record\_age\_in\_seconds](#maximum_record_age_in_seconds_python) int

Maximum age of a record that Lambda sends to a function for processing. Only available for stream sources (DynamoDB and Kinesis). Must be either -1 (forever, and the default value) or between 60 and 604800 (inclusive).

[maximum\_retry\_attempts](#maximum_retry_attempts_python) int

Maximum number of times to retry when the function returns an error. Only available for stream sources (DynamoDB and Kinesis). Minimum and default of -1 (forever), maximum of 10000.

[metrics\_config](#metrics_config_python) [EventSourceMappingMetricsConfigArgs](#eventsourcemappingmetricsconfig)

CloudWatch metrics configuration of the event source. Only available for stream sources (DynamoDB and Kinesis) and SQS queues. See below.

[parallelization\_factor](#parallelization_factor_python) int

Number of batches to process from each shard concurrently. Only available for stream sources (DynamoDB and Kinesis). Minimum and default of 1, maximum of 10.

[provisioned\_poller\_config](#provisioned_poller_config_python) [EventSourceMappingProvisionedPollerConfigArgs](#eventsourcemappingprovisionedpollerconfig)

Event poller configuration for the event source. Only valid for Amazon MSK or self-managed Apache Kafka sources. See below.

[queues](#queues_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Name of the Amazon MQ broker destination queue to consume. Only available for MQ sources. The list must contain exactly one queue name.

[region](#region_python) str

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[scaling\_config](#scaling_config_python) [EventSourceMappingScalingConfigArgs](#eventsourcemappingscalingconfig)

Scaling configuration of the event source. Only available for SQS queues. See below.

[self\_managed\_event\_source](#self_managed_event_source_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [EventSourceMappingSelfManagedEventSourceArgs](#eventsourcemappingselfmanagedeventsource)

For Self Managed Kafka sources, the location of the self managed cluster. If set, configuration must also include `sourceAccessConfiguration`. See below.

[self\_managed\_kafka\_event\_source\_config](#self_managed_kafka_event_source_config_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [EventSourceMappingSelfManagedKafkaEventSourceConfigArgs](#eventsourcemappingselfmanagedkafkaeventsourceconfig)

Additional configuration block for Self Managed Kafka sources. Incompatible with `eventSourceArn` and `amazonManagedKafkaEventSourceConfig`. See below.

[source\_access\_configurations](#source_access_configurations_python) [Sequence\[EventSourceMappingSourceAccessConfigurationArgs\]](#eventsourcemappingsourceaccessconfiguration)

For Self Managed Kafka sources, the access configuration for the source. If set, configuration must also include `selfManagedEventSource`. See below.

[starting\_position](#starting_position_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Position in the stream where AWS Lambda should start reading. Must be one of `AT_TIMESTAMP` (Kinesis only), `LATEST` or `TRIM_HORIZON` if getting events from Kinesis, DynamoDB, MSK or Self Managed Apache Kafka. Must not be provided if getting events from SQS. More information about these positions can be found in the [AWS DynamoDB Streams API Reference](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_streams_GetShardIterator.html) and [AWS Kinesis API Reference](https://docs.aws.amazon.com/kinesis/latest/APIReference/API_GetShardIterator.html#Kinesis-GetShardIterator-request-ShardIteratorType).

[starting\_position\_timestamp](#starting_position_timestamp_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Timestamp in [RFC3339 format](https://tools.ietf.org/html/rfc3339#section-5.8) of the data record which to start reading when using `startingPosition` set to `AT_TIMESTAMP`. If a record with this exact timestamp does not exist, the next later record is chosen. If the timestamp is older than the current trim horizon, the oldest available record is chosen.

[tags](#tags_python) Mapping\[str, str\]

Map of tags to assign to the object. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[topics](#topics_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. Sequence\[str\]

Name of the Kafka topics. Only available for MSK sources. A single topic name must be specified.

[tumbling\_window\_in\_seconds](#tumbling_window_in_seconds_python) int

Duration in seconds of a processing window for [AWS Lambda streaming analytics](https://docs.aws.amazon.com/lambda/latest/dg/with-kinesis.html#services-kinesis-windows). The range is between 1 second up to 900 seconds. Only available for stream sources (DynamoDB and Kinesis).

[functionName](#functionname_yaml) This property is required. String

Name or ARN of the Lambda function that will be subscribing to events.

The following arguments are optional:

[amazonManagedKafkaEventSourceConfig](#amazonmanagedkafkaeventsourceconfig_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [Property Map](#eventsourcemappingamazonmanagedkafkaeventsourceconfig)

Additional configuration block for Amazon Managed Kafka sources. Incompatible with `selfManagedEventSource` and `selfManagedKafkaEventSourceConfig`. See below.

[batchSize](#batchsize_yaml) Number

Largest number of records that Lambda will retrieve from your event source at the time of invocation. Defaults to `100` for DynamoDB, Kinesis, MQ and MSK, `10` for SQS.

[bisectBatchOnFunctionError](#bisectbatchonfunctionerror_yaml) Boolean

Whether to split the batch in two and retry if the function returns an error. Only available for stream sources (DynamoDB and Kinesis). Defaults to `false`.

[destinationConfig](#destinationconfig_yaml) [Property Map](#eventsourcemappingdestinationconfig)

Amazon SQS queue, Amazon SNS topic or Amazon S3 bucket (only available for Kafka sources) destination for failed records. Only available for stream sources (DynamoDB and Kinesis) and Kafka sources (Amazon MSK and Self-managed Apache Kafka). See below.

[documentDbEventSourceConfig](#documentdbeventsourceconfig_yaml) [Property Map](#eventsourcemappingdocumentdbeventsourceconfig)

Configuration settings for a DocumentDB event source. See below.

[enabled](#enabled_yaml) Boolean

Whether the mapping is enabled. Defaults to `true`.

[eventSourceArn](#eventsourcearn_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Event source ARN - required for Kinesis stream, DynamoDB stream, SQS queue, MQ broker, MSK cluster or DocumentDB change stream. Incompatible with Self Managed Kafka source.

[filterCriteria](#filtercriteria_yaml) [Property Map](#eventsourcemappingfiltercriteria)

Criteria to use for [event filtering](https://docs.aws.amazon.com/lambda/latest/dg/invocation-eventfiltering.html) Kinesis stream, DynamoDB stream, SQS queue event sources. See below.

[functionResponseTypes](#functionresponsetypes_yaml) List<String>

List of current response type enums applied to the event source mapping for [AWS Lambda checkpointing](https://docs.aws.amazon.com/lambda/latest/dg/with-ddb.html#services-ddb-batchfailurereporting). Only available for SQS and stream sources (DynamoDB and Kinesis). Valid values: `ReportBatchItemFailures`.

[kmsKeyArn](#kmskeyarn_yaml) String

ARN of the Key Management Service (KMS) customer managed key that Lambda uses to encrypt your function's filter criteria.

[maximumBatchingWindowInSeconds](#maximumbatchingwindowinseconds_yaml) Number

Maximum amount of time to gather records before invoking the function, in seconds (between 0 and 300). Records will continue to buffer until either `maximumBatchingWindowInSeconds` expires or `batchSize` has been met. For streaming event sources, defaults to as soon as records are available in the stream. Only available for stream sources (DynamoDB and Kinesis) and SQS standard queues.

[maximumRecordAgeInSeconds](#maximumrecordageinseconds_yaml) Number

Maximum age of a record that Lambda sends to a function for processing. Only available for stream sources (DynamoDB and Kinesis). Must be either -1 (forever, and the default value) or between 60 and 604800 (inclusive).

[maximumRetryAttempts](#maximumretryattempts_yaml) Number

Maximum number of times to retry when the function returns an error. Only available for stream sources (DynamoDB and Kinesis). Minimum and default of -1 (forever), maximum of 10000.

[metricsConfig](#metricsconfig_yaml) [Property Map](#eventsourcemappingmetricsconfig)

CloudWatch metrics configuration of the event source. Only available for stream sources (DynamoDB and Kinesis) and SQS queues. See below.

[parallelizationFactor](#parallelizationfactor_yaml) Number

Number of batches to process from each shard concurrently. Only available for stream sources (DynamoDB and Kinesis). Minimum and default of 1, maximum of 10.

[provisionedPollerConfig](#provisionedpollerconfig_yaml) [Property Map](#eventsourcemappingprovisionedpollerconfig)

Event poller configuration for the event source. Only valid for Amazon MSK or self-managed Apache Kafka sources. See below.

[queues](#queues_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Name of the Amazon MQ broker destination queue to consume. Only available for MQ sources. The list must contain exactly one queue name.

[region](#region_yaml) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[scalingConfig](#scalingconfig_yaml) [Property Map](#eventsourcemappingscalingconfig)

Scaling configuration of the event source. Only available for SQS queues. See below.

[selfManagedEventSource](#selfmanagedeventsource_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [Property Map](#eventsourcemappingselfmanagedeventsource)

For Self Managed Kafka sources, the location of the self managed cluster. If set, configuration must also include `sourceAccessConfiguration`. See below.

[selfManagedKafkaEventSourceConfig](#selfmanagedkafkaeventsourceconfig_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [Property Map](#eventsourcemappingselfmanagedkafkaeventsourceconfig)

Additional configuration block for Self Managed Kafka sources. Incompatible with `eventSourceArn` and `amazonManagedKafkaEventSourceConfig`. See below.

[sourceAccessConfigurations](#sourceaccessconfigurations_yaml) [List<Property Map>](#eventsourcemappingsourceaccessconfiguration)

For Self Managed Kafka sources, the access configuration for the source. If set, configuration must also include `selfManagedEventSource`. See below.

[startingPosition](#startingposition_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Position in the stream where AWS Lambda should start reading. Must be one of `AT_TIMESTAMP` (Kinesis only), `LATEST` or `TRIM_HORIZON` if getting events from Kinesis, DynamoDB, MSK or Self Managed Apache Kafka. Must not be provided if getting events from SQS. More information about these positions can be found in the [AWS DynamoDB Streams API Reference](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_streams_GetShardIterator.html) and [AWS Kinesis API Reference](https://docs.aws.amazon.com/kinesis/latest/APIReference/API_GetShardIterator.html#Kinesis-GetShardIterator-request-ShardIteratorType).

[startingPositionTimestamp](#startingpositiontimestamp_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Timestamp in [RFC3339 format](https://tools.ietf.org/html/rfc3339#section-5.8) of the data record which to start reading when using `startingPosition` set to `AT_TIMESTAMP`. If a record with this exact timestamp does not exist, the next later record is chosen. If the timestamp is older than the current trim horizon, the oldest available record is chosen.

[tags](#tags_yaml) Map<String>

Map of tags to assign to the object. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[topics](#topics_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. List<String>

Name of the Kafka topics. Only available for MSK sources. A single topic name must be specified.

[tumblingWindowInSeconds](#tumblingwindowinseconds_yaml) Number

Duration in seconds of a processing window for [AWS Lambda streaming analytics](https://docs.aws.amazon.com/lambda/latest/dg/with-kinesis.html#services-kinesis-windows). The range is between 1 second up to 900 seconds. Only available for stream sources (DynamoDB and Kinesis).

### Outputs[](#outputs)

All [input](#inputs) properties are implicitly available as output properties. Additionally, the EventSourceMapping resource produces the following output properties:

[Arn](#arn_csharp) string

Event source mapping ARN.

[FunctionArn](#functionarn_csharp) string

ARN of the Lambda function the event source mapping is sending events to. (Note: this is a computed value that differs from `functionName` above.)

[Id](#id_csharp) string

The provider-assigned unique ID for this managed resource.

[LastModified](#lastmodified_csharp) string

Date this resource was last modified.

[LastProcessingResult](#lastprocessingresult_csharp) string

Result of the last AWS Lambda invocation of your Lambda function.

[State](#state_csharp) string

State of the event source mapping.

[StateTransitionReason](#statetransitionreason_csharp) string

Reason the event source mapping is in its current state.

[TagsAll](#tagsall_csharp) Dictionary<string, string>

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[Uuid](#uuid_csharp) string

UUID of the created event source mapping.

[Arn](#arn_go) string

Event source mapping ARN.

[FunctionArn](#functionarn_go) string

ARN of the Lambda function the event source mapping is sending events to. (Note: this is a computed value that differs from `functionName` above.)

[Id](#id_go) string

The provider-assigned unique ID for this managed resource.

[LastModified](#lastmodified_go) string

Date this resource was last modified.

[LastProcessingResult](#lastprocessingresult_go) string

Result of the last AWS Lambda invocation of your Lambda function.

[State](#state_go) string

State of the event source mapping.

[StateTransitionReason](#statetransitionreason_go) string

Reason the event source mapping is in its current state.

[TagsAll](#tagsall_go) map\[string\]string

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[Uuid](#uuid_go) string

UUID of the created event source mapping.

[arn](#arn_hcl) string

Event source mapping ARN.

[function\_arn](#function_arn_hcl) string

ARN of the Lambda function the event source mapping is sending events to. (Note: this is a computed value that differs from `functionName` above.)

[id](#id_hcl) string

The provider-assigned unique ID for this managed resource.

[last\_modified](#last_modified_hcl) string

Date this resource was last modified.

[last\_processing\_result](#last_processing_result_hcl) string

Result of the last AWS Lambda invocation of your Lambda function.

[state](#state_hcl) string

State of the event source mapping.

[state\_transition\_reason](#state_transition_reason_hcl) string

Reason the event source mapping is in its current state.

[tags\_all](#tags_all_hcl) map(string)

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[uuid](#uuid_hcl) string

UUID of the created event source mapping.

[arn](#arn_java) String

Event source mapping ARN.

[functionArn](#functionarn_java) String

ARN of the Lambda function the event source mapping is sending events to. (Note: this is a computed value that differs from `functionName` above.)

[id](#id_java) String

The provider-assigned unique ID for this managed resource.

[lastModified](#lastmodified_java) String

Date this resource was last modified.

[lastProcessingResult](#lastprocessingresult_java) String

Result of the last AWS Lambda invocation of your Lambda function.

[state](#state_java) String

State of the event source mapping.

[stateTransitionReason](#statetransitionreason_java) String

Reason the event source mapping is in its current state.

[tagsAll](#tagsall_java) Map<String,String>

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[uuid](#uuid_java) String

UUID of the created event source mapping.

[arn](#arn_nodejs) string

Event source mapping ARN.

[functionArn](#functionarn_nodejs) string

ARN of the Lambda function the event source mapping is sending events to. (Note: this is a computed value that differs from `functionName` above.)

[id](#id_nodejs) string

The provider-assigned unique ID for this managed resource.

[lastModified](#lastmodified_nodejs) string

Date this resource was last modified.

[lastProcessingResult](#lastprocessingresult_nodejs) string

Result of the last AWS Lambda invocation of your Lambda function.

[state](#state_nodejs) string

State of the event source mapping.

[stateTransitionReason](#statetransitionreason_nodejs) string

Reason the event source mapping is in its current state.

[tagsAll](#tagsall_nodejs) {\[key: string\]: string}

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[uuid](#uuid_nodejs) string

UUID of the created event source mapping.

[arn](#arn_python) str

Event source mapping ARN.

[function\_arn](#function_arn_python) str

ARN of the Lambda function the event source mapping is sending events to. (Note: this is a computed value that differs from `functionName` above.)

[id](#id_python) str

The provider-assigned unique ID for this managed resource.

[last\_modified](#last_modified_python) str

Date this resource was last modified.

[last\_processing\_result](#last_processing_result_python) str

Result of the last AWS Lambda invocation of your Lambda function.

[state](#state_python) str

State of the event source mapping.

[state\_transition\_reason](#state_transition_reason_python) str

Reason the event source mapping is in its current state.

[tags\_all](#tags_all_python) Mapping\[str, str\]

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[uuid](#uuid_python) str

UUID of the created event source mapping.

[arn](#arn_yaml) String

Event source mapping ARN.

[functionArn](#functionarn_yaml) String

ARN of the Lambda function the event source mapping is sending events to. (Note: this is a computed value that differs from `functionName` above.)

[id](#id_yaml) String

The provider-assigned unique ID for this managed resource.

[lastModified](#lastmodified_yaml) String

Date this resource was last modified.

[lastProcessingResult](#lastprocessingresult_yaml) String

Result of the last AWS Lambda invocation of your Lambda function.

[state](#state_yaml) String

State of the event source mapping.

[stateTransitionReason](#statetransitionreason_yaml) String

Reason the event source mapping is in its current state.

[tagsAll](#tagsall_yaml) Map<String>

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[uuid](#uuid_yaml) String

UUID of the created event source mapping.

## Look up Existing EventSourceMapping Resource[](#look-up)

Get an existing EventSourceMapping resource’s state with the given name, ID, and optional extra properties used to qualify the lookup.

-   TypeScript
-   Python
-   Go
-   C#
-   Java
-   YAML
-   HCL PREVIEW

```typescript
public static get(name: string, id: Input<ID>, state?: EventSourceMappingState, opts?: CustomResourceOptions): EventSourceMapping
```

```python
@staticmethod
def get(resource_name: str,
        id: str,
        opts: Optional[ResourceOptions] = None,
        amazon_managed_kafka_event_source_config: Optional[EventSourceMappingAmazonManagedKafkaEventSourceConfigArgs] = None,
        arn: Optional[str] = None,
        batch_size: Optional[int] = None,
        bisect_batch_on_function_error: Optional[bool] = None,
        destination_config: Optional[EventSourceMappingDestinationConfigArgs] = None,
        document_db_event_source_config: Optional[EventSourceMappingDocumentDbEventSourceConfigArgs] = None,
        enabled: Optional[bool] = None,
        event_source_arn: Optional[str] = None,
        filter_criteria: Optional[EventSourceMappingFilterCriteriaArgs] = None,
        function_arn: Optional[str] = None,
        function_name: Optional[str] = None,
        function_response_types: Optional[Sequence[str]] = None,
        kms_key_arn: Optional[str] = None,
        last_modified: Optional[str] = None,
        last_processing_result: Optional[str] = None,
        maximum_batching_window_in_seconds: Optional[int] = None,
        maximum_record_age_in_seconds: Optional[int] = None,
        maximum_retry_attempts: Optional[int] = None,
        metrics_config: Optional[EventSourceMappingMetricsConfigArgs] = None,
        parallelization_factor: Optional[int] = None,
        provisioned_poller_config: Optional[EventSourceMappingProvisionedPollerConfigArgs] = None,
        queues: Optional[str] = None,
        region: Optional[str] = None,
        scaling_config: Optional[EventSourceMappingScalingConfigArgs] = None,
        self_managed_event_source: Optional[EventSourceMappingSelfManagedEventSourceArgs] = None,
        self_managed_kafka_event_source_config: Optional[EventSourceMappingSelfManagedKafkaEventSourceConfigArgs] = None,
        source_access_configurations: Optional[Sequence[EventSourceMappingSourceAccessConfigurationArgs]] = None,
        starting_position: Optional[str] = None,
        starting_position_timestamp: Optional[str] = None,
        state: Optional[str] = None,
        state_transition_reason: Optional[str] = None,
        tags: Optional[Mapping[str, str]] = None,
        tags_all: Optional[Mapping[str, str]] = None,
        topics: Optional[Sequence[str]] = None,
        tumbling_window_in_seconds: Optional[int] = None,
        uuid: Optional[str] = None) -> EventSourceMapping
```

```go
func GetEventSourceMapping(ctx *Context, name string, id IDInput, state *EventSourceMappingState, opts ...ResourceOption) (*EventSourceMapping, error)
```

```csharp
public static EventSourceMapping Get(string name, Input<string> id, EventSourceMappingState? state, CustomResourceOptions? opts = null)
```

```java
public static EventSourceMapping get(String name, Output<String> id, EventSourceMappingState state, CustomResourceOptions options)
```

```yaml
resources:  _:    type: aws:lambda:EventSourceMapping    get:      id: ${id}
```

```hcl
import {
  to = aws_lambda_eventsourcemapping.example
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

[AmazonManagedKafkaEventSourceConfig](#state_amazonmanagedkafkaeventsourceconfig_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [EventSourceMappingAmazonManagedKafkaEventSourceConfig](#eventsourcemappingamazonmanagedkafkaeventsourceconfig)

Additional configuration block for Amazon Managed Kafka sources. Incompatible with `selfManagedEventSource` and `selfManagedKafkaEventSourceConfig`. See below.

[Arn](#state_arn_csharp) string

Event source mapping ARN.

[BatchSize](#state_batchsize_csharp) int

Largest number of records that Lambda will retrieve from your event source at the time of invocation. Defaults to `100` for DynamoDB, Kinesis, MQ and MSK, `10` for SQS.

[BisectBatchOnFunctionError](#state_bisectbatchonfunctionerror_csharp) bool

Whether to split the batch in two and retry if the function returns an error. Only available for stream sources (DynamoDB and Kinesis). Defaults to `false`.

[DestinationConfig](#state_destinationconfig_csharp) [EventSourceMappingDestinationConfig](#eventsourcemappingdestinationconfig)

Amazon SQS queue, Amazon SNS topic or Amazon S3 bucket (only available for Kafka sources) destination for failed records. Only available for stream sources (DynamoDB and Kinesis) and Kafka sources (Amazon MSK and Self-managed Apache Kafka). See below.

[DocumentDbEventSourceConfig](#state_documentdbeventsourceconfig_csharp) [EventSourceMappingDocumentDbEventSourceConfig](#eventsourcemappingdocumentdbeventsourceconfig)

Configuration settings for a DocumentDB event source. See below.

[Enabled](#state_enabled_csharp) bool

Whether the mapping is enabled. Defaults to `true`.

[EventSourceArn](#state_eventsourcearn_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Event source ARN - required for Kinesis stream, DynamoDB stream, SQS queue, MQ broker, MSK cluster or DocumentDB change stream. Incompatible with Self Managed Kafka source.

[FilterCriteria](#state_filtercriteria_csharp) [EventSourceMappingFilterCriteria](#eventsourcemappingfiltercriteria)

Criteria to use for [event filtering](https://docs.aws.amazon.com/lambda/latest/dg/invocation-eventfiltering.html) Kinesis stream, DynamoDB stream, SQS queue event sources. See below.

[FunctionArn](#state_functionarn_csharp) string

ARN of the Lambda function the event source mapping is sending events to. (Note: this is a computed value that differs from `functionName` above.)

[FunctionName](#state_functionname_csharp) string

Name or ARN of the Lambda function that will be subscribing to events.

The following arguments are optional:

[FunctionResponseTypes](#state_functionresponsetypes_csharp) List<string>

List of current response type enums applied to the event source mapping for [AWS Lambda checkpointing](https://docs.aws.amazon.com/lambda/latest/dg/with-ddb.html#services-ddb-batchfailurereporting). Only available for SQS and stream sources (DynamoDB and Kinesis). Valid values: `ReportBatchItemFailures`.

[KmsKeyArn](#state_kmskeyarn_csharp) string

ARN of the Key Management Service (KMS) customer managed key that Lambda uses to encrypt your function's filter criteria.

[LastModified](#state_lastmodified_csharp) string

Date this resource was last modified.

[LastProcessingResult](#state_lastprocessingresult_csharp) string

Result of the last AWS Lambda invocation of your Lambda function.

[MaximumBatchingWindowInSeconds](#state_maximumbatchingwindowinseconds_csharp) int

Maximum amount of time to gather records before invoking the function, in seconds (between 0 and 300). Records will continue to buffer until either `maximumBatchingWindowInSeconds` expires or `batchSize` has been met. For streaming event sources, defaults to as soon as records are available in the stream. Only available for stream sources (DynamoDB and Kinesis) and SQS standard queues.

[MaximumRecordAgeInSeconds](#state_maximumrecordageinseconds_csharp) int

Maximum age of a record that Lambda sends to a function for processing. Only available for stream sources (DynamoDB and Kinesis). Must be either -1 (forever, and the default value) or between 60 and 604800 (inclusive).

[MaximumRetryAttempts](#state_maximumretryattempts_csharp) int

Maximum number of times to retry when the function returns an error. Only available for stream sources (DynamoDB and Kinesis). Minimum and default of -1 (forever), maximum of 10000.

[MetricsConfig](#state_metricsconfig_csharp) [EventSourceMappingMetricsConfig](#eventsourcemappingmetricsconfig)

CloudWatch metrics configuration of the event source. Only available for stream sources (DynamoDB and Kinesis) and SQS queues. See below.

[ParallelizationFactor](#state_parallelizationfactor_csharp) int

Number of batches to process from each shard concurrently. Only available for stream sources (DynamoDB and Kinesis). Minimum and default of 1, maximum of 10.

[ProvisionedPollerConfig](#state_provisionedpollerconfig_csharp) [EventSourceMappingProvisionedPollerConfig](#eventsourcemappingprovisionedpollerconfig)

Event poller configuration for the event source. Only valid for Amazon MSK or self-managed Apache Kafka sources. See below.

[Queues](#state_queues_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Name of the Amazon MQ broker destination queue to consume. Only available for MQ sources. The list must contain exactly one queue name.

[Region](#state_region_csharp) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[ScalingConfig](#state_scalingconfig_csharp) [EventSourceMappingScalingConfig](#eventsourcemappingscalingconfig)

Scaling configuration of the event source. Only available for SQS queues. See below.

[SelfManagedEventSource](#state_selfmanagedeventsource_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [EventSourceMappingSelfManagedEventSource](#eventsourcemappingselfmanagedeventsource)

For Self Managed Kafka sources, the location of the self managed cluster. If set, configuration must also include `sourceAccessConfiguration`. See below.

[SelfManagedKafkaEventSourceConfig](#state_selfmanagedkafkaeventsourceconfig_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [EventSourceMappingSelfManagedKafkaEventSourceConfig](#eventsourcemappingselfmanagedkafkaeventsourceconfig)

Additional configuration block for Self Managed Kafka sources. Incompatible with `eventSourceArn` and `amazonManagedKafkaEventSourceConfig`. See below.

[SourceAccessConfigurations](#state_sourceaccessconfigurations_csharp) [List<EventSourceMappingSourceAccessConfiguration>](#eventsourcemappingsourceaccessconfiguration)

For Self Managed Kafka sources, the access configuration for the source. If set, configuration must also include `selfManagedEventSource`. See below.

[StartingPosition](#state_startingposition_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Position in the stream where AWS Lambda should start reading. Must be one of `AT_TIMESTAMP` (Kinesis only), `LATEST` or `TRIM_HORIZON` if getting events from Kinesis, DynamoDB, MSK or Self Managed Apache Kafka. Must not be provided if getting events from SQS. More information about these positions can be found in the [AWS DynamoDB Streams API Reference](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_streams_GetShardIterator.html) and [AWS Kinesis API Reference](https://docs.aws.amazon.com/kinesis/latest/APIReference/API_GetShardIterator.html#Kinesis-GetShardIterator-request-ShardIteratorType).

[StartingPositionTimestamp](#state_startingpositiontimestamp_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Timestamp in [RFC3339 format](https://tools.ietf.org/html/rfc3339#section-5.8) of the data record which to start reading when using `startingPosition` set to `AT_TIMESTAMP`. If a record with this exact timestamp does not exist, the next later record is chosen. If the timestamp is older than the current trim horizon, the oldest available record is chosen.

[State](#state_state_csharp) string

State of the event source mapping.

[StateTransitionReason](#state_statetransitionreason_csharp) string

Reason the event source mapping is in its current state.

[Tags](#state_tags_csharp) Dictionary<string, string>

Map of tags to assign to the object. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[TagsAll](#state_tagsall_csharp) Dictionary<string, string>

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[Topics](#state_topics_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. List<string>

Name of the Kafka topics. Only available for MSK sources. A single topic name must be specified.

[TumblingWindowInSeconds](#state_tumblingwindowinseconds_csharp) int

Duration in seconds of a processing window for [AWS Lambda streaming analytics](https://docs.aws.amazon.com/lambda/latest/dg/with-kinesis.html#services-kinesis-windows). The range is between 1 second up to 900 seconds. Only available for stream sources (DynamoDB and Kinesis).

[Uuid](#state_uuid_csharp) string

UUID of the created event source mapping.

[AmazonManagedKafkaEventSourceConfig](#state_amazonmanagedkafkaeventsourceconfig_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [EventSourceMappingAmazonManagedKafkaEventSourceConfigArgs](#eventsourcemappingamazonmanagedkafkaeventsourceconfig)

Additional configuration block for Amazon Managed Kafka sources. Incompatible with `selfManagedEventSource` and `selfManagedKafkaEventSourceConfig`. See below.

[Arn](#state_arn_go) string

Event source mapping ARN.

[BatchSize](#state_batchsize_go) int

Largest number of records that Lambda will retrieve from your event source at the time of invocation. Defaults to `100` for DynamoDB, Kinesis, MQ and MSK, `10` for SQS.

[BisectBatchOnFunctionError](#state_bisectbatchonfunctionerror_go) bool

Whether to split the batch in two and retry if the function returns an error. Only available for stream sources (DynamoDB and Kinesis). Defaults to `false`.

[DestinationConfig](#state_destinationconfig_go) [EventSourceMappingDestinationConfigArgs](#eventsourcemappingdestinationconfig)

Amazon SQS queue, Amazon SNS topic or Amazon S3 bucket (only available for Kafka sources) destination for failed records. Only available for stream sources (DynamoDB and Kinesis) and Kafka sources (Amazon MSK and Self-managed Apache Kafka). See below.

[DocumentDbEventSourceConfig](#state_documentdbeventsourceconfig_go) [EventSourceMappingDocumentDbEventSourceConfigArgs](#eventsourcemappingdocumentdbeventsourceconfig)

Configuration settings for a DocumentDB event source. See below.

[Enabled](#state_enabled_go) bool

Whether the mapping is enabled. Defaults to `true`.

[EventSourceArn](#state_eventsourcearn_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Event source ARN - required for Kinesis stream, DynamoDB stream, SQS queue, MQ broker, MSK cluster or DocumentDB change stream. Incompatible with Self Managed Kafka source.

[FilterCriteria](#state_filtercriteria_go) [EventSourceMappingFilterCriteriaArgs](#eventsourcemappingfiltercriteria)

Criteria to use for [event filtering](https://docs.aws.amazon.com/lambda/latest/dg/invocation-eventfiltering.html) Kinesis stream, DynamoDB stream, SQS queue event sources. See below.

[FunctionArn](#state_functionarn_go) string

ARN of the Lambda function the event source mapping is sending events to. (Note: this is a computed value that differs from `functionName` above.)

[FunctionName](#state_functionname_go) string

Name or ARN of the Lambda function that will be subscribing to events.

The following arguments are optional:

[FunctionResponseTypes](#state_functionresponsetypes_go) \[\]string

List of current response type enums applied to the event source mapping for [AWS Lambda checkpointing](https://docs.aws.amazon.com/lambda/latest/dg/with-ddb.html#services-ddb-batchfailurereporting). Only available for SQS and stream sources (DynamoDB and Kinesis). Valid values: `ReportBatchItemFailures`.

[KmsKeyArn](#state_kmskeyarn_go) string

ARN of the Key Management Service (KMS) customer managed key that Lambda uses to encrypt your function's filter criteria.

[LastModified](#state_lastmodified_go) string

Date this resource was last modified.

[LastProcessingResult](#state_lastprocessingresult_go) string

Result of the last AWS Lambda invocation of your Lambda function.

[MaximumBatchingWindowInSeconds](#state_maximumbatchingwindowinseconds_go) int

Maximum amount of time to gather records before invoking the function, in seconds (between 0 and 300). Records will continue to buffer until either `maximumBatchingWindowInSeconds` expires or `batchSize` has been met. For streaming event sources, defaults to as soon as records are available in the stream. Only available for stream sources (DynamoDB and Kinesis) and SQS standard queues.

[MaximumRecordAgeInSeconds](#state_maximumrecordageinseconds_go) int

Maximum age of a record that Lambda sends to a function for processing. Only available for stream sources (DynamoDB and Kinesis). Must be either -1 (forever, and the default value) or between 60 and 604800 (inclusive).

[MaximumRetryAttempts](#state_maximumretryattempts_go) int

Maximum number of times to retry when the function returns an error. Only available for stream sources (DynamoDB and Kinesis). Minimum and default of -1 (forever), maximum of 10000.

[MetricsConfig](#state_metricsconfig_go) [EventSourceMappingMetricsConfigArgs](#eventsourcemappingmetricsconfig)

CloudWatch metrics configuration of the event source. Only available for stream sources (DynamoDB and Kinesis) and SQS queues. See below.

[ParallelizationFactor](#state_parallelizationfactor_go) int

Number of batches to process from each shard concurrently. Only available for stream sources (DynamoDB and Kinesis). Minimum and default of 1, maximum of 10.

[ProvisionedPollerConfig](#state_provisionedpollerconfig_go) [EventSourceMappingProvisionedPollerConfigArgs](#eventsourcemappingprovisionedpollerconfig)

Event poller configuration for the event source. Only valid for Amazon MSK or self-managed Apache Kafka sources. See below.

[Queues](#state_queues_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Name of the Amazon MQ broker destination queue to consume. Only available for MQ sources. The list must contain exactly one queue name.

[Region](#state_region_go) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[ScalingConfig](#state_scalingconfig_go) [EventSourceMappingScalingConfigArgs](#eventsourcemappingscalingconfig)

Scaling configuration of the event source. Only available for SQS queues. See below.

[SelfManagedEventSource](#state_selfmanagedeventsource_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [EventSourceMappingSelfManagedEventSourceArgs](#eventsourcemappingselfmanagedeventsource)

For Self Managed Kafka sources, the location of the self managed cluster. If set, configuration must also include `sourceAccessConfiguration`. See below.

[SelfManagedKafkaEventSourceConfig](#state_selfmanagedkafkaeventsourceconfig_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [EventSourceMappingSelfManagedKafkaEventSourceConfigArgs](#eventsourcemappingselfmanagedkafkaeventsourceconfig)

Additional configuration block for Self Managed Kafka sources. Incompatible with `eventSourceArn` and `amazonManagedKafkaEventSourceConfig`. See below.

[SourceAccessConfigurations](#state_sourceaccessconfigurations_go) [\[\]EventSourceMappingSourceAccessConfigurationArgs](#eventsourcemappingsourceaccessconfiguration)

For Self Managed Kafka sources, the access configuration for the source. If set, configuration must also include `selfManagedEventSource`. See below.

[StartingPosition](#state_startingposition_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Position in the stream where AWS Lambda should start reading. Must be one of `AT_TIMESTAMP` (Kinesis only), `LATEST` or `TRIM_HORIZON` if getting events from Kinesis, DynamoDB, MSK or Self Managed Apache Kafka. Must not be provided if getting events from SQS. More information about these positions can be found in the [AWS DynamoDB Streams API Reference](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_streams_GetShardIterator.html) and [AWS Kinesis API Reference](https://docs.aws.amazon.com/kinesis/latest/APIReference/API_GetShardIterator.html#Kinesis-GetShardIterator-request-ShardIteratorType).

[StartingPositionTimestamp](#state_startingpositiontimestamp_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Timestamp in [RFC3339 format](https://tools.ietf.org/html/rfc3339#section-5.8) of the data record which to start reading when using `startingPosition` set to `AT_TIMESTAMP`. If a record with this exact timestamp does not exist, the next later record is chosen. If the timestamp is older than the current trim horizon, the oldest available record is chosen.

[State](#state_state_go) string

State of the event source mapping.

[StateTransitionReason](#state_statetransitionreason_go) string

Reason the event source mapping is in its current state.

[Tags](#state_tags_go) map\[string\]string

Map of tags to assign to the object. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[TagsAll](#state_tagsall_go) map\[string\]string

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[Topics](#state_topics_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. \[\]string

Name of the Kafka topics. Only available for MSK sources. A single topic name must be specified.

[TumblingWindowInSeconds](#state_tumblingwindowinseconds_go) int

Duration in seconds of a processing window for [AWS Lambda streaming analytics](https://docs.aws.amazon.com/lambda/latest/dg/with-kinesis.html#services-kinesis-windows). The range is between 1 second up to 900 seconds. Only available for stream sources (DynamoDB and Kinesis).

[Uuid](#state_uuid_go) string

UUID of the created event source mapping.

[amazon\_managed\_kafka\_event\_source\_config](#state_amazon_managed_kafka_event_source_config_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [object](#eventsourcemappingamazonmanagedkafkaeventsourceconfig)

Additional configuration block for Amazon Managed Kafka sources. Incompatible with `selfManagedEventSource` and `selfManagedKafkaEventSourceConfig`. See below.

[arn](#state_arn_hcl) string

Event source mapping ARN.

[batch\_size](#state_batch_size_hcl) number

Largest number of records that Lambda will retrieve from your event source at the time of invocation. Defaults to `100` for DynamoDB, Kinesis, MQ and MSK, `10` for SQS.

[bisect\_batch\_on\_function\_error](#state_bisect_batch_on_function_error_hcl) bool

Whether to split the batch in two and retry if the function returns an error. Only available for stream sources (DynamoDB and Kinesis). Defaults to `false`.

[destination\_config](#state_destination_config_hcl) [object](#eventsourcemappingdestinationconfig)

Amazon SQS queue, Amazon SNS topic or Amazon S3 bucket (only available for Kafka sources) destination for failed records. Only available for stream sources (DynamoDB and Kinesis) and Kafka sources (Amazon MSK and Self-managed Apache Kafka). See below.

[document\_db\_event\_source\_config](#state_document_db_event_source_config_hcl) [object](#eventsourcemappingdocumentdbeventsourceconfig)

Configuration settings for a DocumentDB event source. See below.

[enabled](#state_enabled_hcl) bool

Whether the mapping is enabled. Defaults to `true`.

[event\_source\_arn](#state_event_source_arn_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Event source ARN - required for Kinesis stream, DynamoDB stream, SQS queue, MQ broker, MSK cluster or DocumentDB change stream. Incompatible with Self Managed Kafka source.

[filter\_criteria](#state_filter_criteria_hcl) [object](#eventsourcemappingfiltercriteria)

Criteria to use for [event filtering](https://docs.aws.amazon.com/lambda/latest/dg/invocation-eventfiltering.html) Kinesis stream, DynamoDB stream, SQS queue event sources. See below.

[function\_arn](#state_function_arn_hcl) string

ARN of the Lambda function the event source mapping is sending events to. (Note: this is a computed value that differs from `functionName` above.)

[function\_name](#state_function_name_hcl) string

Name or ARN of the Lambda function that will be subscribing to events.

The following arguments are optional:

[function\_response\_types](#state_function_response_types_hcl) list(string)

List of current response type enums applied to the event source mapping for [AWS Lambda checkpointing](https://docs.aws.amazon.com/lambda/latest/dg/with-ddb.html#services-ddb-batchfailurereporting). Only available for SQS and stream sources (DynamoDB and Kinesis). Valid values: `ReportBatchItemFailures`.

[kms\_key\_arn](#state_kms_key_arn_hcl) string

ARN of the Key Management Service (KMS) customer managed key that Lambda uses to encrypt your function's filter criteria.

[last\_modified](#state_last_modified_hcl) string

Date this resource was last modified.

[last\_processing\_result](#state_last_processing_result_hcl) string

Result of the last AWS Lambda invocation of your Lambda function.

[maximum\_batching\_window\_in\_seconds](#state_maximum_batching_window_in_seconds_hcl) number

Maximum amount of time to gather records before invoking the function, in seconds (between 0 and 300). Records will continue to buffer until either `maximumBatchingWindowInSeconds` expires or `batchSize` has been met. For streaming event sources, defaults to as soon as records are available in the stream. Only available for stream sources (DynamoDB and Kinesis) and SQS standard queues.

[maximum\_record\_age\_in\_seconds](#state_maximum_record_age_in_seconds_hcl) number

Maximum age of a record that Lambda sends to a function for processing. Only available for stream sources (DynamoDB and Kinesis). Must be either -1 (forever, and the default value) or between 60 and 604800 (inclusive).

[maximum\_retry\_attempts](#state_maximum_retry_attempts_hcl) number

Maximum number of times to retry when the function returns an error. Only available for stream sources (DynamoDB and Kinesis). Minimum and default of -1 (forever), maximum of 10000.

[metrics\_config](#state_metrics_config_hcl) [object](#eventsourcemappingmetricsconfig)

CloudWatch metrics configuration of the event source. Only available for stream sources (DynamoDB and Kinesis) and SQS queues. See below.

[parallelization\_factor](#state_parallelization_factor_hcl) number

Number of batches to process from each shard concurrently. Only available for stream sources (DynamoDB and Kinesis). Minimum and default of 1, maximum of 10.

[provisioned\_poller\_config](#state_provisioned_poller_config_hcl) [object](#eventsourcemappingprovisionedpollerconfig)

Event poller configuration for the event source. Only valid for Amazon MSK or self-managed Apache Kafka sources. See below.

[queues](#state_queues_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Name of the Amazon MQ broker destination queue to consume. Only available for MQ sources. The list must contain exactly one queue name.

[region](#state_region_hcl) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[scaling\_config](#state_scaling_config_hcl) [object](#eventsourcemappingscalingconfig)

Scaling configuration of the event source. Only available for SQS queues. See below.

[self\_managed\_event\_source](#state_self_managed_event_source_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [object](#eventsourcemappingselfmanagedeventsource)

For Self Managed Kafka sources, the location of the self managed cluster. If set, configuration must also include `sourceAccessConfiguration`. See below.

[self\_managed\_kafka\_event\_source\_config](#state_self_managed_kafka_event_source_config_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [object](#eventsourcemappingselfmanagedkafkaeventsourceconfig)

Additional configuration block for Self Managed Kafka sources. Incompatible with `eventSourceArn` and `amazonManagedKafkaEventSourceConfig`. See below.

[source\_access\_configurations](#state_source_access_configurations_hcl) [list(object)](#eventsourcemappingsourceaccessconfiguration)

For Self Managed Kafka sources, the access configuration for the source. If set, configuration must also include `selfManagedEventSource`. See below.

[starting\_position](#state_starting_position_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Position in the stream where AWS Lambda should start reading. Must be one of `AT_TIMESTAMP` (Kinesis only), `LATEST` or `TRIM_HORIZON` if getting events from Kinesis, DynamoDB, MSK or Self Managed Apache Kafka. Must not be provided if getting events from SQS. More information about these positions can be found in the [AWS DynamoDB Streams API Reference](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_streams_GetShardIterator.html) and [AWS Kinesis API Reference](https://docs.aws.amazon.com/kinesis/latest/APIReference/API_GetShardIterator.html#Kinesis-GetShardIterator-request-ShardIteratorType).

[starting\_position\_timestamp](#state_starting_position_timestamp_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Timestamp in [RFC3339 format](https://tools.ietf.org/html/rfc3339#section-5.8) of the data record which to start reading when using `startingPosition` set to `AT_TIMESTAMP`. If a record with this exact timestamp does not exist, the next later record is chosen. If the timestamp is older than the current trim horizon, the oldest available record is chosen.

[state](#state_state_hcl) string

State of the event source mapping.

[state\_transition\_reason](#state_state_transition_reason_hcl) string

Reason the event source mapping is in its current state.

[tags](#state_tags_hcl) map(string)

Map of tags to assign to the object. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tags\_all](#state_tags_all_hcl) map(string)

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[topics](#state_topics_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. list(string)

Name of the Kafka topics. Only available for MSK sources. A single topic name must be specified.

[tumbling\_window\_in\_seconds](#state_tumbling_window_in_seconds_hcl) number

Duration in seconds of a processing window for [AWS Lambda streaming analytics](https://docs.aws.amazon.com/lambda/latest/dg/with-kinesis.html#services-kinesis-windows). The range is between 1 second up to 900 seconds. Only available for stream sources (DynamoDB and Kinesis).

[uuid](#state_uuid_hcl) string

UUID of the created event source mapping.

[amazonManagedKafkaEventSourceConfig](#state_amazonmanagedkafkaeventsourceconfig_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [EventSourceMappingAmazonManagedKafkaEventSourceConfig](#eventsourcemappingamazonmanagedkafkaeventsourceconfig)

Additional configuration block for Amazon Managed Kafka sources. Incompatible with `selfManagedEventSource` and `selfManagedKafkaEventSourceConfig`. See below.

[arn](#state_arn_java) String

Event source mapping ARN.

[batchSize](#state_batchsize_java) Integer

Largest number of records that Lambda will retrieve from your event source at the time of invocation. Defaults to `100` for DynamoDB, Kinesis, MQ and MSK, `10` for SQS.

[bisectBatchOnFunctionError](#state_bisectbatchonfunctionerror_java) Boolean

Whether to split the batch in two and retry if the function returns an error. Only available for stream sources (DynamoDB and Kinesis). Defaults to `false`.

[destinationConfig](#state_destinationconfig_java) [EventSourceMappingDestinationConfig](#eventsourcemappingdestinationconfig)

Amazon SQS queue, Amazon SNS topic or Amazon S3 bucket (only available for Kafka sources) destination for failed records. Only available for stream sources (DynamoDB and Kinesis) and Kafka sources (Amazon MSK and Self-managed Apache Kafka). See below.

[documentDbEventSourceConfig](#state_documentdbeventsourceconfig_java) [EventSourceMappingDocumentDbEventSourceConfig](#eventsourcemappingdocumentdbeventsourceconfig)

Configuration settings for a DocumentDB event source. See below.

[enabled](#state_enabled_java) Boolean

Whether the mapping is enabled. Defaults to `true`.

[eventSourceArn](#state_eventsourcearn_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Event source ARN - required for Kinesis stream, DynamoDB stream, SQS queue, MQ broker, MSK cluster or DocumentDB change stream. Incompatible with Self Managed Kafka source.

[filterCriteria](#state_filtercriteria_java) [EventSourceMappingFilterCriteria](#eventsourcemappingfiltercriteria)

Criteria to use for [event filtering](https://docs.aws.amazon.com/lambda/latest/dg/invocation-eventfiltering.html) Kinesis stream, DynamoDB stream, SQS queue event sources. See below.

[functionArn](#state_functionarn_java) String

ARN of the Lambda function the event source mapping is sending events to. (Note: this is a computed value that differs from `functionName` above.)

[functionName](#state_functionname_java) String

Name or ARN of the Lambda function that will be subscribing to events.

The following arguments are optional:

[functionResponseTypes](#state_functionresponsetypes_java) List<String>

List of current response type enums applied to the event source mapping for [AWS Lambda checkpointing](https://docs.aws.amazon.com/lambda/latest/dg/with-ddb.html#services-ddb-batchfailurereporting). Only available for SQS and stream sources (DynamoDB and Kinesis). Valid values: `ReportBatchItemFailures`.

[kmsKeyArn](#state_kmskeyarn_java) String

ARN of the Key Management Service (KMS) customer managed key that Lambda uses to encrypt your function's filter criteria.

[lastModified](#state_lastmodified_java) String

Date this resource was last modified.

[lastProcessingResult](#state_lastprocessingresult_java) String

Result of the last AWS Lambda invocation of your Lambda function.

[maximumBatchingWindowInSeconds](#state_maximumbatchingwindowinseconds_java) Integer

Maximum amount of time to gather records before invoking the function, in seconds (between 0 and 300). Records will continue to buffer until either `maximumBatchingWindowInSeconds` expires or `batchSize` has been met. For streaming event sources, defaults to as soon as records are available in the stream. Only available for stream sources (DynamoDB and Kinesis) and SQS standard queues.

[maximumRecordAgeInSeconds](#state_maximumrecordageinseconds_java) Integer

Maximum age of a record that Lambda sends to a function for processing. Only available for stream sources (DynamoDB and Kinesis). Must be either -1 (forever, and the default value) or between 60 and 604800 (inclusive).

[maximumRetryAttempts](#state_maximumretryattempts_java) Integer

Maximum number of times to retry when the function returns an error. Only available for stream sources (DynamoDB and Kinesis). Minimum and default of -1 (forever), maximum of 10000.

[metricsConfig](#state_metricsconfig_java) [EventSourceMappingMetricsConfig](#eventsourcemappingmetricsconfig)

CloudWatch metrics configuration of the event source. Only available for stream sources (DynamoDB and Kinesis) and SQS queues. See below.

[parallelizationFactor](#state_parallelizationfactor_java) Integer

Number of batches to process from each shard concurrently. Only available for stream sources (DynamoDB and Kinesis). Minimum and default of 1, maximum of 10.

[provisionedPollerConfig](#state_provisionedpollerconfig_java) [EventSourceMappingProvisionedPollerConfig](#eventsourcemappingprovisionedpollerconfig)

Event poller configuration for the event source. Only valid for Amazon MSK or self-managed Apache Kafka sources. See below.

[queues](#state_queues_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Name of the Amazon MQ broker destination queue to consume. Only available for MQ sources. The list must contain exactly one queue name.

[region](#state_region_java) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[scalingConfig](#state_scalingconfig_java) [EventSourceMappingScalingConfig](#eventsourcemappingscalingconfig)

Scaling configuration of the event source. Only available for SQS queues. See below.

[selfManagedEventSource](#state_selfmanagedeventsource_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [EventSourceMappingSelfManagedEventSource](#eventsourcemappingselfmanagedeventsource)

For Self Managed Kafka sources, the location of the self managed cluster. If set, configuration must also include `sourceAccessConfiguration`. See below.

[selfManagedKafkaEventSourceConfig](#state_selfmanagedkafkaeventsourceconfig_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [EventSourceMappingSelfManagedKafkaEventSourceConfig](#eventsourcemappingselfmanagedkafkaeventsourceconfig)

Additional configuration block for Self Managed Kafka sources. Incompatible with `eventSourceArn` and `amazonManagedKafkaEventSourceConfig`. See below.

[sourceAccessConfigurations](#state_sourceaccessconfigurations_java) [List<EventSourceMappingSourceAccessConfiguration>](#eventsourcemappingsourceaccessconfiguration)

For Self Managed Kafka sources, the access configuration for the source. If set, configuration must also include `selfManagedEventSource`. See below.

[startingPosition](#state_startingposition_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Position in the stream where AWS Lambda should start reading. Must be one of `AT_TIMESTAMP` (Kinesis only), `LATEST` or `TRIM_HORIZON` if getting events from Kinesis, DynamoDB, MSK or Self Managed Apache Kafka. Must not be provided if getting events from SQS. More information about these positions can be found in the [AWS DynamoDB Streams API Reference](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_streams_GetShardIterator.html) and [AWS Kinesis API Reference](https://docs.aws.amazon.com/kinesis/latest/APIReference/API_GetShardIterator.html#Kinesis-GetShardIterator-request-ShardIteratorType).

[startingPositionTimestamp](#state_startingpositiontimestamp_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Timestamp in [RFC3339 format](https://tools.ietf.org/html/rfc3339#section-5.8) of the data record which to start reading when using `startingPosition` set to `AT_TIMESTAMP`. If a record with this exact timestamp does not exist, the next later record is chosen. If the timestamp is older than the current trim horizon, the oldest available record is chosen.

[state](#state_state_java) String

State of the event source mapping.

[stateTransitionReason](#state_statetransitionreason_java) String

Reason the event source mapping is in its current state.

[tags](#state_tags_java) Map<String,String>

Map of tags to assign to the object. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tagsAll](#state_tagsall_java) Map<String,String>

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[topics](#state_topics_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. List<String>

Name of the Kafka topics. Only available for MSK sources. A single topic name must be specified.

[tumblingWindowInSeconds](#state_tumblingwindowinseconds_java) Integer

Duration in seconds of a processing window for [AWS Lambda streaming analytics](https://docs.aws.amazon.com/lambda/latest/dg/with-kinesis.html#services-kinesis-windows). The range is between 1 second up to 900 seconds. Only available for stream sources (DynamoDB and Kinesis).

[uuid](#state_uuid_java) String

UUID of the created event source mapping.

[amazonManagedKafkaEventSourceConfig](#state_amazonmanagedkafkaeventsourceconfig_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [EventSourceMappingAmazonManagedKafkaEventSourceConfig](#eventsourcemappingamazonmanagedkafkaeventsourceconfig)

Additional configuration block for Amazon Managed Kafka sources. Incompatible with `selfManagedEventSource` and `selfManagedKafkaEventSourceConfig`. See below.

[arn](#state_arn_nodejs) string

Event source mapping ARN.

[batchSize](#state_batchsize_nodejs) number

Largest number of records that Lambda will retrieve from your event source at the time of invocation. Defaults to `100` for DynamoDB, Kinesis, MQ and MSK, `10` for SQS.

[bisectBatchOnFunctionError](#state_bisectbatchonfunctionerror_nodejs) boolean

Whether to split the batch in two and retry if the function returns an error. Only available for stream sources (DynamoDB and Kinesis). Defaults to `false`.

[destinationConfig](#state_destinationconfig_nodejs) [EventSourceMappingDestinationConfig](#eventsourcemappingdestinationconfig)

Amazon SQS queue, Amazon SNS topic or Amazon S3 bucket (only available for Kafka sources) destination for failed records. Only available for stream sources (DynamoDB and Kinesis) and Kafka sources (Amazon MSK and Self-managed Apache Kafka). See below.

[documentDbEventSourceConfig](#state_documentdbeventsourceconfig_nodejs) [EventSourceMappingDocumentDbEventSourceConfig](#eventsourcemappingdocumentdbeventsourceconfig)

Configuration settings for a DocumentDB event source. See below.

[enabled](#state_enabled_nodejs) boolean

Whether the mapping is enabled. Defaults to `true`.

[eventSourceArn](#state_eventsourcearn_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Event source ARN - required for Kinesis stream, DynamoDB stream, SQS queue, MQ broker, MSK cluster or DocumentDB change stream. Incompatible with Self Managed Kafka source.

[filterCriteria](#state_filtercriteria_nodejs) [EventSourceMappingFilterCriteria](#eventsourcemappingfiltercriteria)

Criteria to use for [event filtering](https://docs.aws.amazon.com/lambda/latest/dg/invocation-eventfiltering.html) Kinesis stream, DynamoDB stream, SQS queue event sources. See below.

[functionArn](#state_functionarn_nodejs) string

ARN of the Lambda function the event source mapping is sending events to. (Note: this is a computed value that differs from `functionName` above.)

[functionName](#state_functionname_nodejs) string

Name or ARN of the Lambda function that will be subscribing to events.

The following arguments are optional:

[functionResponseTypes](#state_functionresponsetypes_nodejs) string\[\]

List of current response type enums applied to the event source mapping for [AWS Lambda checkpointing](https://docs.aws.amazon.com/lambda/latest/dg/with-ddb.html#services-ddb-batchfailurereporting). Only available for SQS and stream sources (DynamoDB and Kinesis). Valid values: `ReportBatchItemFailures`.

[kmsKeyArn](#state_kmskeyarn_nodejs) string

ARN of the Key Management Service (KMS) customer managed key that Lambda uses to encrypt your function's filter criteria.

[lastModified](#state_lastmodified_nodejs) string

Date this resource was last modified.

[lastProcessingResult](#state_lastprocessingresult_nodejs) string

Result of the last AWS Lambda invocation of your Lambda function.

[maximumBatchingWindowInSeconds](#state_maximumbatchingwindowinseconds_nodejs) number

Maximum amount of time to gather records before invoking the function, in seconds (between 0 and 300). Records will continue to buffer until either `maximumBatchingWindowInSeconds` expires or `batchSize` has been met. For streaming event sources, defaults to as soon as records are available in the stream. Only available for stream sources (DynamoDB and Kinesis) and SQS standard queues.

[maximumRecordAgeInSeconds](#state_maximumrecordageinseconds_nodejs) number

Maximum age of a record that Lambda sends to a function for processing. Only available for stream sources (DynamoDB and Kinesis). Must be either -1 (forever, and the default value) or between 60 and 604800 (inclusive).

[maximumRetryAttempts](#state_maximumretryattempts_nodejs) number

Maximum number of times to retry when the function returns an error. Only available for stream sources (DynamoDB and Kinesis). Minimum and default of -1 (forever), maximum of 10000.

[metricsConfig](#state_metricsconfig_nodejs) [EventSourceMappingMetricsConfig](#eventsourcemappingmetricsconfig)

CloudWatch metrics configuration of the event source. Only available for stream sources (DynamoDB and Kinesis) and SQS queues. See below.

[parallelizationFactor](#state_parallelizationfactor_nodejs) number

Number of batches to process from each shard concurrently. Only available for stream sources (DynamoDB and Kinesis). Minimum and default of 1, maximum of 10.

[provisionedPollerConfig](#state_provisionedpollerconfig_nodejs) [EventSourceMappingProvisionedPollerConfig](#eventsourcemappingprovisionedpollerconfig)

Event poller configuration for the event source. Only valid for Amazon MSK or self-managed Apache Kafka sources. See below.

[queues](#state_queues_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Name of the Amazon MQ broker destination queue to consume. Only available for MQ sources. The list must contain exactly one queue name.

[region](#state_region_nodejs) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[scalingConfig](#state_scalingconfig_nodejs) [EventSourceMappingScalingConfig](#eventsourcemappingscalingconfig)

Scaling configuration of the event source. Only available for SQS queues. See below.

[selfManagedEventSource](#state_selfmanagedeventsource_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [EventSourceMappingSelfManagedEventSource](#eventsourcemappingselfmanagedeventsource)

For Self Managed Kafka sources, the location of the self managed cluster. If set, configuration must also include `sourceAccessConfiguration`. See below.

[selfManagedKafkaEventSourceConfig](#state_selfmanagedkafkaeventsourceconfig_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [EventSourceMappingSelfManagedKafkaEventSourceConfig](#eventsourcemappingselfmanagedkafkaeventsourceconfig)

Additional configuration block for Self Managed Kafka sources. Incompatible with `eventSourceArn` and `amazonManagedKafkaEventSourceConfig`. See below.

[sourceAccessConfigurations](#state_sourceaccessconfigurations_nodejs) [EventSourceMappingSourceAccessConfiguration\[\]](#eventsourcemappingsourceaccessconfiguration)

For Self Managed Kafka sources, the access configuration for the source. If set, configuration must also include `selfManagedEventSource`. See below.

[startingPosition](#state_startingposition_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Position in the stream where AWS Lambda should start reading. Must be one of `AT_TIMESTAMP` (Kinesis only), `LATEST` or `TRIM_HORIZON` if getting events from Kinesis, DynamoDB, MSK or Self Managed Apache Kafka. Must not be provided if getting events from SQS. More information about these positions can be found in the [AWS DynamoDB Streams API Reference](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_streams_GetShardIterator.html) and [AWS Kinesis API Reference](https://docs.aws.amazon.com/kinesis/latest/APIReference/API_GetShardIterator.html#Kinesis-GetShardIterator-request-ShardIteratorType).

[startingPositionTimestamp](#state_startingpositiontimestamp_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Timestamp in [RFC3339 format](https://tools.ietf.org/html/rfc3339#section-5.8) of the data record which to start reading when using `startingPosition` set to `AT_TIMESTAMP`. If a record with this exact timestamp does not exist, the next later record is chosen. If the timestamp is older than the current trim horizon, the oldest available record is chosen.

[state](#state_state_nodejs) string

State of the event source mapping.

[stateTransitionReason](#state_statetransitionreason_nodejs) string

Reason the event source mapping is in its current state.

[tags](#state_tags_nodejs) {\[key: string\]: string}

Map of tags to assign to the object. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tagsAll](#state_tagsall_nodejs) {\[key: string\]: string}

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[topics](#state_topics_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string\[\]

Name of the Kafka topics. Only available for MSK sources. A single topic name must be specified.

[tumblingWindowInSeconds](#state_tumblingwindowinseconds_nodejs) number

Duration in seconds of a processing window for [AWS Lambda streaming analytics](https://docs.aws.amazon.com/lambda/latest/dg/with-kinesis.html#services-kinesis-windows). The range is between 1 second up to 900 seconds. Only available for stream sources (DynamoDB and Kinesis).

[uuid](#state_uuid_nodejs) string

UUID of the created event source mapping.

[amazon\_managed\_kafka\_event\_source\_config](#state_amazon_managed_kafka_event_source_config_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [EventSourceMappingAmazonManagedKafkaEventSourceConfigArgs](#eventsourcemappingamazonmanagedkafkaeventsourceconfig)

Additional configuration block for Amazon Managed Kafka sources. Incompatible with `selfManagedEventSource` and `selfManagedKafkaEventSourceConfig`. See below.

[arn](#state_arn_python) str

Event source mapping ARN.

[batch\_size](#state_batch_size_python) int

Largest number of records that Lambda will retrieve from your event source at the time of invocation. Defaults to `100` for DynamoDB, Kinesis, MQ and MSK, `10` for SQS.

[bisect\_batch\_on\_function\_error](#state_bisect_batch_on_function_error_python) bool

Whether to split the batch in two and retry if the function returns an error. Only available for stream sources (DynamoDB and Kinesis). Defaults to `false`.

[destination\_config](#state_destination_config_python) [EventSourceMappingDestinationConfigArgs](#eventsourcemappingdestinationconfig)

Amazon SQS queue, Amazon SNS topic or Amazon S3 bucket (only available for Kafka sources) destination for failed records. Only available for stream sources (DynamoDB and Kinesis) and Kafka sources (Amazon MSK and Self-managed Apache Kafka). See below.

[document\_db\_event\_source\_config](#state_document_db_event_source_config_python) [EventSourceMappingDocumentDbEventSourceConfigArgs](#eventsourcemappingdocumentdbeventsourceconfig)

Configuration settings for a DocumentDB event source. See below.

[enabled](#state_enabled_python) bool

Whether the mapping is enabled. Defaults to `true`.

[event\_source\_arn](#state_event_source_arn_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Event source ARN - required for Kinesis stream, DynamoDB stream, SQS queue, MQ broker, MSK cluster or DocumentDB change stream. Incompatible with Self Managed Kafka source.

[filter\_criteria](#state_filter_criteria_python) [EventSourceMappingFilterCriteriaArgs](#eventsourcemappingfiltercriteria)

Criteria to use for [event filtering](https://docs.aws.amazon.com/lambda/latest/dg/invocation-eventfiltering.html) Kinesis stream, DynamoDB stream, SQS queue event sources. See below.

[function\_arn](#state_function_arn_python) str

ARN of the Lambda function the event source mapping is sending events to. (Note: this is a computed value that differs from `functionName` above.)

[function\_name](#state_function_name_python) str

Name or ARN of the Lambda function that will be subscribing to events.

The following arguments are optional:

[function\_response\_types](#state_function_response_types_python) Sequence\[str\]

List of current response type enums applied to the event source mapping for [AWS Lambda checkpointing](https://docs.aws.amazon.com/lambda/latest/dg/with-ddb.html#services-ddb-batchfailurereporting). Only available for SQS and stream sources (DynamoDB and Kinesis). Valid values: `ReportBatchItemFailures`.

[kms\_key\_arn](#state_kms_key_arn_python) str

ARN of the Key Management Service (KMS) customer managed key that Lambda uses to encrypt your function's filter criteria.

[last\_modified](#state_last_modified_python) str

Date this resource was last modified.

[last\_processing\_result](#state_last_processing_result_python) str

Result of the last AWS Lambda invocation of your Lambda function.

[maximum\_batching\_window\_in\_seconds](#state_maximum_batching_window_in_seconds_python) int

Maximum amount of time to gather records before invoking the function, in seconds (between 0 and 300). Records will continue to buffer until either `maximumBatchingWindowInSeconds` expires or `batchSize` has been met. For streaming event sources, defaults to as soon as records are available in the stream. Only available for stream sources (DynamoDB and Kinesis) and SQS standard queues.

[maximum\_record\_age\_in\_seconds](#state_maximum_record_age_in_seconds_python) int

Maximum age of a record that Lambda sends to a function for processing. Only available for stream sources (DynamoDB and Kinesis). Must be either -1 (forever, and the default value) or between 60 and 604800 (inclusive).

[maximum\_retry\_attempts](#state_maximum_retry_attempts_python) int

Maximum number of times to retry when the function returns an error. Only available for stream sources (DynamoDB and Kinesis). Minimum and default of -1 (forever), maximum of 10000.

[metrics\_config](#state_metrics_config_python) [EventSourceMappingMetricsConfigArgs](#eventsourcemappingmetricsconfig)

CloudWatch metrics configuration of the event source. Only available for stream sources (DynamoDB and Kinesis) and SQS queues. See below.

[parallelization\_factor](#state_parallelization_factor_python) int

Number of batches to process from each shard concurrently. Only available for stream sources (DynamoDB and Kinesis). Minimum and default of 1, maximum of 10.

[provisioned\_poller\_config](#state_provisioned_poller_config_python) [EventSourceMappingProvisionedPollerConfigArgs](#eventsourcemappingprovisionedpollerconfig)

Event poller configuration for the event source. Only valid for Amazon MSK or self-managed Apache Kafka sources. See below.

[queues](#state_queues_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Name of the Amazon MQ broker destination queue to consume. Only available for MQ sources. The list must contain exactly one queue name.

[region](#state_region_python) str

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[scaling\_config](#state_scaling_config_python) [EventSourceMappingScalingConfigArgs](#eventsourcemappingscalingconfig)

Scaling configuration of the event source. Only available for SQS queues. See below.

[self\_managed\_event\_source](#state_self_managed_event_source_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [EventSourceMappingSelfManagedEventSourceArgs](#eventsourcemappingselfmanagedeventsource)

For Self Managed Kafka sources, the location of the self managed cluster. If set, configuration must also include `sourceAccessConfiguration`. See below.

[self\_managed\_kafka\_event\_source\_config](#state_self_managed_kafka_event_source_config_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [EventSourceMappingSelfManagedKafkaEventSourceConfigArgs](#eventsourcemappingselfmanagedkafkaeventsourceconfig)

Additional configuration block for Self Managed Kafka sources. Incompatible with `eventSourceArn` and `amazonManagedKafkaEventSourceConfig`. See below.

[source\_access\_configurations](#state_source_access_configurations_python) [Sequence\[EventSourceMappingSourceAccessConfigurationArgs\]](#eventsourcemappingsourceaccessconfiguration)

For Self Managed Kafka sources, the access configuration for the source. If set, configuration must also include `selfManagedEventSource`. See below.

[starting\_position](#state_starting_position_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Position in the stream where AWS Lambda should start reading. Must be one of `AT_TIMESTAMP` (Kinesis only), `LATEST` or `TRIM_HORIZON` if getting events from Kinesis, DynamoDB, MSK or Self Managed Apache Kafka. Must not be provided if getting events from SQS. More information about these positions can be found in the [AWS DynamoDB Streams API Reference](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_streams_GetShardIterator.html) and [AWS Kinesis API Reference](https://docs.aws.amazon.com/kinesis/latest/APIReference/API_GetShardIterator.html#Kinesis-GetShardIterator-request-ShardIteratorType).

[starting\_position\_timestamp](#state_starting_position_timestamp_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Timestamp in [RFC3339 format](https://tools.ietf.org/html/rfc3339#section-5.8) of the data record which to start reading when using `startingPosition` set to `AT_TIMESTAMP`. If a record with this exact timestamp does not exist, the next later record is chosen. If the timestamp is older than the current trim horizon, the oldest available record is chosen.

[state](#state_state_python) str

State of the event source mapping.

[state\_transition\_reason](#state_state_transition_reason_python) str

Reason the event source mapping is in its current state.

[tags](#state_tags_python) Mapping\[str, str\]

Map of tags to assign to the object. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tags\_all](#state_tags_all_python) Mapping\[str, str\]

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[topics](#state_topics_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. Sequence\[str\]

Name of the Kafka topics. Only available for MSK sources. A single topic name must be specified.

[tumbling\_window\_in\_seconds](#state_tumbling_window_in_seconds_python) int

Duration in seconds of a processing window for [AWS Lambda streaming analytics](https://docs.aws.amazon.com/lambda/latest/dg/with-kinesis.html#services-kinesis-windows). The range is between 1 second up to 900 seconds. Only available for stream sources (DynamoDB and Kinesis).

[uuid](#state_uuid_python) str

UUID of the created event source mapping.

[amazonManagedKafkaEventSourceConfig](#state_amazonmanagedkafkaeventsourceconfig_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [Property Map](#eventsourcemappingamazonmanagedkafkaeventsourceconfig)

Additional configuration block for Amazon Managed Kafka sources. Incompatible with `selfManagedEventSource` and `selfManagedKafkaEventSourceConfig`. See below.

[arn](#state_arn_yaml) String

Event source mapping ARN.

[batchSize](#state_batchsize_yaml) Number

Largest number of records that Lambda will retrieve from your event source at the time of invocation. Defaults to `100` for DynamoDB, Kinesis, MQ and MSK, `10` for SQS.

[bisectBatchOnFunctionError](#state_bisectbatchonfunctionerror_yaml) Boolean

Whether to split the batch in two and retry if the function returns an error. Only available for stream sources (DynamoDB and Kinesis). Defaults to `false`.

[destinationConfig](#state_destinationconfig_yaml) [Property Map](#eventsourcemappingdestinationconfig)

Amazon SQS queue, Amazon SNS topic or Amazon S3 bucket (only available for Kafka sources) destination for failed records. Only available for stream sources (DynamoDB and Kinesis) and Kafka sources (Amazon MSK and Self-managed Apache Kafka). See below.

[documentDbEventSourceConfig](#state_documentdbeventsourceconfig_yaml) [Property Map](#eventsourcemappingdocumentdbeventsourceconfig)

Configuration settings for a DocumentDB event source. See below.

[enabled](#state_enabled_yaml) Boolean

Whether the mapping is enabled. Defaults to `true`.

[eventSourceArn](#state_eventsourcearn_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Event source ARN - required for Kinesis stream, DynamoDB stream, SQS queue, MQ broker, MSK cluster or DocumentDB change stream. Incompatible with Self Managed Kafka source.

[filterCriteria](#state_filtercriteria_yaml) [Property Map](#eventsourcemappingfiltercriteria)

Criteria to use for [event filtering](https://docs.aws.amazon.com/lambda/latest/dg/invocation-eventfiltering.html) Kinesis stream, DynamoDB stream, SQS queue event sources. See below.

[functionArn](#state_functionarn_yaml) String

ARN of the Lambda function the event source mapping is sending events to. (Note: this is a computed value that differs from `functionName` above.)

[functionName](#state_functionname_yaml) String

Name or ARN of the Lambda function that will be subscribing to events.

The following arguments are optional:

[functionResponseTypes](#state_functionresponsetypes_yaml) List<String>

List of current response type enums applied to the event source mapping for [AWS Lambda checkpointing](https://docs.aws.amazon.com/lambda/latest/dg/with-ddb.html#services-ddb-batchfailurereporting). Only available for SQS and stream sources (DynamoDB and Kinesis). Valid values: `ReportBatchItemFailures`.

[kmsKeyArn](#state_kmskeyarn_yaml) String

ARN of the Key Management Service (KMS) customer managed key that Lambda uses to encrypt your function's filter criteria.

[lastModified](#state_lastmodified_yaml) String

Date this resource was last modified.

[lastProcessingResult](#state_lastprocessingresult_yaml) String

Result of the last AWS Lambda invocation of your Lambda function.

[maximumBatchingWindowInSeconds](#state_maximumbatchingwindowinseconds_yaml) Number

Maximum amount of time to gather records before invoking the function, in seconds (between 0 and 300). Records will continue to buffer until either `maximumBatchingWindowInSeconds` expires or `batchSize` has been met. For streaming event sources, defaults to as soon as records are available in the stream. Only available for stream sources (DynamoDB and Kinesis) and SQS standard queues.

[maximumRecordAgeInSeconds](#state_maximumrecordageinseconds_yaml) Number

Maximum age of a record that Lambda sends to a function for processing. Only available for stream sources (DynamoDB and Kinesis). Must be either -1 (forever, and the default value) or between 60 and 604800 (inclusive).

[maximumRetryAttempts](#state_maximumretryattempts_yaml) Number

Maximum number of times to retry when the function returns an error. Only available for stream sources (DynamoDB and Kinesis). Minimum and default of -1 (forever), maximum of 10000.

[metricsConfig](#state_metricsconfig_yaml) [Property Map](#eventsourcemappingmetricsconfig)

CloudWatch metrics configuration of the event source. Only available for stream sources (DynamoDB and Kinesis) and SQS queues. See below.

[parallelizationFactor](#state_parallelizationfactor_yaml) Number

Number of batches to process from each shard concurrently. Only available for stream sources (DynamoDB and Kinesis). Minimum and default of 1, maximum of 10.

[provisionedPollerConfig](#state_provisionedpollerconfig_yaml) [Property Map](#eventsourcemappingprovisionedpollerconfig)

Event poller configuration for the event source. Only valid for Amazon MSK or self-managed Apache Kafka sources. See below.

[queues](#state_queues_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Name of the Amazon MQ broker destination queue to consume. Only available for MQ sources. The list must contain exactly one queue name.

[region](#state_region_yaml) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[scalingConfig](#state_scalingconfig_yaml) [Property Map](#eventsourcemappingscalingconfig)

Scaling configuration of the event source. Only available for SQS queues. See below.

[selfManagedEventSource](#state_selfmanagedeventsource_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [Property Map](#eventsourcemappingselfmanagedeventsource)

For Self Managed Kafka sources, the location of the self managed cluster. If set, configuration must also include `sourceAccessConfiguration`. See below.

[selfManagedKafkaEventSourceConfig](#state_selfmanagedkafkaeventsourceconfig_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [Property Map](#eventsourcemappingselfmanagedkafkaeventsourceconfig)

Additional configuration block for Self Managed Kafka sources. Incompatible with `eventSourceArn` and `amazonManagedKafkaEventSourceConfig`. See below.

[sourceAccessConfigurations](#state_sourceaccessconfigurations_yaml) [List<Property Map>](#eventsourcemappingsourceaccessconfiguration)

For Self Managed Kafka sources, the access configuration for the source. If set, configuration must also include `selfManagedEventSource`. See below.

[startingPosition](#state_startingposition_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Position in the stream where AWS Lambda should start reading. Must be one of `AT_TIMESTAMP` (Kinesis only), `LATEST` or `TRIM_HORIZON` if getting events from Kinesis, DynamoDB, MSK or Self Managed Apache Kafka. Must not be provided if getting events from SQS. More information about these positions can be found in the [AWS DynamoDB Streams API Reference](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_streams_GetShardIterator.html) and [AWS Kinesis API Reference](https://docs.aws.amazon.com/kinesis/latest/APIReference/API_GetShardIterator.html#Kinesis-GetShardIterator-request-ShardIteratorType).

[startingPositionTimestamp](#state_startingpositiontimestamp_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Timestamp in [RFC3339 format](https://tools.ietf.org/html/rfc3339#section-5.8) of the data record which to start reading when using `startingPosition` set to `AT_TIMESTAMP`. If a record with this exact timestamp does not exist, the next later record is chosen. If the timestamp is older than the current trim horizon, the oldest available record is chosen.

[state](#state_state_yaml) String

State of the event source mapping.

[stateTransitionReason](#state_statetransitionreason_yaml) String

Reason the event source mapping is in its current state.

[tags](#state_tags_yaml) Map<String>

Map of tags to assign to the object. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tagsAll](#state_tagsall_yaml) Map<String>

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[topics](#state_topics_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. List<String>

Name of the Kafka topics. Only available for MSK sources. A single topic name must be specified.

[tumblingWindowInSeconds](#state_tumblingwindowinseconds_yaml) Number

Duration in seconds of a processing window for [AWS Lambda streaming analytics](https://docs.aws.amazon.com/lambda/latest/dg/with-kinesis.html#services-kinesis-windows). The range is between 1 second up to 900 seconds. Only available for stream sources (DynamoDB and Kinesis).

[uuid](#state_uuid_yaml) String

UUID of the created event source mapping.

## Supporting Types[](#supporting-types)

#### EventSourceMappingAmazonManagedKafkaEventSourceConfig

, EventSourceMappingAmazonManagedKafkaEventSourceConfigArgs

[](#eventsourcemappingamazonmanagedkafkaeventsourceconfig)

[ConsumerGroupId](#consumergroupid_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Kafka consumer group ID between 1 and 200 characters for use when creating this event source mapping. If one is not specified, this value will be automatically generated. See [AmazonManagedKafkaEventSourceConfig Syntax](https://docs.aws.amazon.com/lambda/latest/dg/API_AmazonManagedKafkaEventSourceConfig.html).

[SchemaRegistryConfig](#schemaregistryconfig_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [EventSourceMappingAmazonManagedKafkaEventSourceConfigSchemaRegistryConfig](#eventsourcemappingamazonmanagedkafkaeventsourceconfigschemaregistryconfig)

Block for a Kafka schema registry setting. See below.

[ConsumerGroupId](#consumergroupid_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Kafka consumer group ID between 1 and 200 characters for use when creating this event source mapping. If one is not specified, this value will be automatically generated. See [AmazonManagedKafkaEventSourceConfig Syntax](https://docs.aws.amazon.com/lambda/latest/dg/API_AmazonManagedKafkaEventSourceConfig.html).

[SchemaRegistryConfig](#schemaregistryconfig_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [EventSourceMappingAmazonManagedKafkaEventSourceConfigSchemaRegistryConfig](#eventsourcemappingamazonmanagedkafkaeventsourceconfigschemaregistryconfig)

Block for a Kafka schema registry setting. See below.

[consumer\_group\_id](#consumer_group_id_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Kafka consumer group ID between 1 and 200 characters for use when creating this event source mapping. If one is not specified, this value will be automatically generated. See [AmazonManagedKafkaEventSourceConfig Syntax](https://docs.aws.amazon.com/lambda/latest/dg/API_AmazonManagedKafkaEventSourceConfig.html).

[schema\_registry\_config](#schema_registry_config_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [object](#eventsourcemappingamazonmanagedkafkaeventsourceconfigschemaregistryconfig)

Block for a Kafka schema registry setting. See below.

[consumerGroupId](#consumergroupid_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Kafka consumer group ID between 1 and 200 characters for use when creating this event source mapping. If one is not specified, this value will be automatically generated. See [AmazonManagedKafkaEventSourceConfig Syntax](https://docs.aws.amazon.com/lambda/latest/dg/API_AmazonManagedKafkaEventSourceConfig.html).

[schemaRegistryConfig](#schemaregistryconfig_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [EventSourceMappingAmazonManagedKafkaEventSourceConfigSchemaRegistryConfig](#eventsourcemappingamazonmanagedkafkaeventsourceconfigschemaregistryconfig)

Block for a Kafka schema registry setting. See below.

[consumerGroupId](#consumergroupid_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Kafka consumer group ID between 1 and 200 characters for use when creating this event source mapping. If one is not specified, this value will be automatically generated. See [AmazonManagedKafkaEventSourceConfig Syntax](https://docs.aws.amazon.com/lambda/latest/dg/API_AmazonManagedKafkaEventSourceConfig.html).

[schemaRegistryConfig](#schemaregistryconfig_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [EventSourceMappingAmazonManagedKafkaEventSourceConfigSchemaRegistryConfig](#eventsourcemappingamazonmanagedkafkaeventsourceconfigschemaregistryconfig)

Block for a Kafka schema registry setting. See below.

[consumer\_group\_id](#consumer_group_id_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Kafka consumer group ID between 1 and 200 characters for use when creating this event source mapping. If one is not specified, this value will be automatically generated. See [AmazonManagedKafkaEventSourceConfig Syntax](https://docs.aws.amazon.com/lambda/latest/dg/API_AmazonManagedKafkaEventSourceConfig.html).

[schema\_registry\_config](#schema_registry_config_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [EventSourceMappingAmazonManagedKafkaEventSourceConfigSchemaRegistryConfig](#eventsourcemappingamazonmanagedkafkaeventsourceconfigschemaregistryconfig)

Block for a Kafka schema registry setting. See below.

[consumerGroupId](#consumergroupid_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Kafka consumer group ID between 1 and 200 characters for use when creating this event source mapping. If one is not specified, this value will be automatically generated. See [AmazonManagedKafkaEventSourceConfig Syntax](https://docs.aws.amazon.com/lambda/latest/dg/API_AmazonManagedKafkaEventSourceConfig.html).

[schemaRegistryConfig](#schemaregistryconfig_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [Property Map](#eventsourcemappingamazonmanagedkafkaeventsourceconfigschemaregistryconfig)

Block for a Kafka schema registry setting. See below.

#### EventSourceMappingAmazonManagedKafkaEventSourceConfigSchemaRegistryConfig

, EventSourceMappingAmazonManagedKafkaEventSourceConfigSchemaRegistryConfigArgs

[](#eventsourcemappingamazonmanagedkafkaeventsourceconfigschemaregistryconfig)

[AccessConfigs](#accessconfigs_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [List<EventSourceMappingAmazonManagedKafkaEventSourceConfigSchemaRegistryConfigAccessConfig>](#eventsourcemappingamazonmanagedkafkaeventsourceconfigschemaregistryconfigaccessconfig)

Configuration block for authentication Lambda uses to access the schema registry.

[EventRecordFormat](#eventrecordformat_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Record format that Lambda delivers to the function after schema validation. Valid values: `JSON`, `SOURCE`.

[SchemaRegistryUri](#schemaregistryuri_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

URI of the schema registry. For AWS Glue schema registries, use the ARN of the registry. For Confluent schema registries, use the registry URL.

[SchemaValidationConfigs](#schemavalidationconfigs_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [List<EventSourceMappingAmazonManagedKafkaEventSourceConfigSchemaRegistryConfigSchemaValidationConfig>](#eventsourcemappingamazonmanagedkafkaeventsourceconfigschemaregistryconfigschemavalidationconfig)

Repeatable block that defines schema validation settings. These specify the message attributes that Lambda should validate and filter using the schema registry.

[AccessConfigs](#accessconfigs_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [\[\]EventSourceMappingAmazonManagedKafkaEventSourceConfigSchemaRegistryConfigAccessConfig](#eventsourcemappingamazonmanagedkafkaeventsourceconfigschemaregistryconfigaccessconfig)

Configuration block for authentication Lambda uses to access the schema registry.

[EventRecordFormat](#eventrecordformat_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Record format that Lambda delivers to the function after schema validation. Valid values: `JSON`, `SOURCE`.

[SchemaRegistryUri](#schemaregistryuri_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

URI of the schema registry. For AWS Glue schema registries, use the ARN of the registry. For Confluent schema registries, use the registry URL.

[SchemaValidationConfigs](#schemavalidationconfigs_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [\[\]EventSourceMappingAmazonManagedKafkaEventSourceConfigSchemaRegistryConfigSchemaValidationConfig](#eventsourcemappingamazonmanagedkafkaeventsourceconfigschemaregistryconfigschemavalidationconfig)

Repeatable block that defines schema validation settings. These specify the message attributes that Lambda should validate and filter using the schema registry.

[access\_configs](#access_configs_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [list(object)](#eventsourcemappingamazonmanagedkafkaeventsourceconfigschemaregistryconfigaccessconfig)

Configuration block for authentication Lambda uses to access the schema registry.

[event\_record\_format](#event_record_format_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Record format that Lambda delivers to the function after schema validation. Valid values: `JSON`, `SOURCE`.

[schema\_registry\_uri](#schema_registry_uri_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

URI of the schema registry. For AWS Glue schema registries, use the ARN of the registry. For Confluent schema registries, use the registry URL.

[schema\_validation\_configs](#schema_validation_configs_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [list(object)](#eventsourcemappingamazonmanagedkafkaeventsourceconfigschemaregistryconfigschemavalidationconfig)

Repeatable block that defines schema validation settings. These specify the message attributes that Lambda should validate and filter using the schema registry.

[accessConfigs](#accessconfigs_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [List<EventSourceMappingAmazonManagedKafkaEventSourceConfigSchemaRegistryConfigAccessConfig>](#eventsourcemappingamazonmanagedkafkaeventsourceconfigschemaregistryconfigaccessconfig)

Configuration block for authentication Lambda uses to access the schema registry.

[eventRecordFormat](#eventrecordformat_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Record format that Lambda delivers to the function after schema validation. Valid values: `JSON`, `SOURCE`.

[schemaRegistryUri](#schemaregistryuri_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

URI of the schema registry. For AWS Glue schema registries, use the ARN of the registry. For Confluent schema registries, use the registry URL.

[schemaValidationConfigs](#schemavalidationconfigs_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [List<EventSourceMappingAmazonManagedKafkaEventSourceConfigSchemaRegistryConfigSchemaValidationConfig>](#eventsourcemappingamazonmanagedkafkaeventsourceconfigschemaregistryconfigschemavalidationconfig)

Repeatable block that defines schema validation settings. These specify the message attributes that Lambda should validate and filter using the schema registry.

[accessConfigs](#accessconfigs_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [EventSourceMappingAmazonManagedKafkaEventSourceConfigSchemaRegistryConfigAccessConfig\[\]](#eventsourcemappingamazonmanagedkafkaeventsourceconfigschemaregistryconfigaccessconfig)

Configuration block for authentication Lambda uses to access the schema registry.

[eventRecordFormat](#eventrecordformat_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Record format that Lambda delivers to the function after schema validation. Valid values: `JSON`, `SOURCE`.

[schemaRegistryUri](#schemaregistryuri_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

URI of the schema registry. For AWS Glue schema registries, use the ARN of the registry. For Confluent schema registries, use the registry URL.

[schemaValidationConfigs](#schemavalidationconfigs_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [EventSourceMappingAmazonManagedKafkaEventSourceConfigSchemaRegistryConfigSchemaValidationConfig\[\]](#eventsourcemappingamazonmanagedkafkaeventsourceconfigschemaregistryconfigschemavalidationconfig)

Repeatable block that defines schema validation settings. These specify the message attributes that Lambda should validate and filter using the schema registry.

[access\_configs](#access_configs_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [Sequence\[EventSourceMappingAmazonManagedKafkaEventSourceConfigSchemaRegistryConfigAccessConfig\]](#eventsourcemappingamazonmanagedkafkaeventsourceconfigschemaregistryconfigaccessconfig)

Configuration block for authentication Lambda uses to access the schema registry.

[event\_record\_format](#event_record_format_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Record format that Lambda delivers to the function after schema validation. Valid values: `JSON`, `SOURCE`.

[schema\_registry\_uri](#schema_registry_uri_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

URI of the schema registry. For AWS Glue schema registries, use the ARN of the registry. For Confluent schema registries, use the registry URL.

[schema\_validation\_configs](#schema_validation_configs_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [Sequence\[EventSourceMappingAmazonManagedKafkaEventSourceConfigSchemaRegistryConfigSchemaValidationConfig\]](#eventsourcemappingamazonmanagedkafkaeventsourceconfigschemaregistryconfigschemavalidationconfig)

Repeatable block that defines schema validation settings. These specify the message attributes that Lambda should validate and filter using the schema registry.

[accessConfigs](#accessconfigs_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [List<Property Map>](#eventsourcemappingamazonmanagedkafkaeventsourceconfigschemaregistryconfigaccessconfig)

Configuration block for authentication Lambda uses to access the schema registry.

[eventRecordFormat](#eventrecordformat_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Record format that Lambda delivers to the function after schema validation. Valid values: `JSON`, `SOURCE`.

[schemaRegistryUri](#schemaregistryuri_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

URI of the schema registry. For AWS Glue schema registries, use the ARN of the registry. For Confluent schema registries, use the registry URL.

[schemaValidationConfigs](#schemavalidationconfigs_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [List<Property Map>](#eventsourcemappingamazonmanagedkafkaeventsourceconfigschemaregistryconfigschemavalidationconfig)

Repeatable block that defines schema validation settings. These specify the message attributes that Lambda should validate and filter using the schema registry.

#### EventSourceMappingAmazonManagedKafkaEventSourceConfigSchemaRegistryConfigAccessConfig

, EventSourceMappingAmazonManagedKafkaEventSourceConfigSchemaRegistryConfigAccessConfigArgs

[](#eventsourcemappingamazonmanagedkafkaeventsourceconfigschemaregistryconfigaccessconfig)

[Type](#type_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Authentication type Lambda uses to access the schema registry.

[Uri](#uri_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

URI of the secret (Secrets Manager secret ARN) used to authenticate with the schema registry.

[Type](#type_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Authentication type Lambda uses to access the schema registry.

[Uri](#uri_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

URI of the secret (Secrets Manager secret ARN) used to authenticate with the schema registry.

[type](#type_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Authentication type Lambda uses to access the schema registry.

[uri](#uri_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

URI of the secret (Secrets Manager secret ARN) used to authenticate with the schema registry.

[type](#type_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Authentication type Lambda uses to access the schema registry.

[uri](#uri_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

URI of the secret (Secrets Manager secret ARN) used to authenticate with the schema registry.

[type](#type_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Authentication type Lambda uses to access the schema registry.

[uri](#uri_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

URI of the secret (Secrets Manager secret ARN) used to authenticate with the schema registry.

[type](#type_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Authentication type Lambda uses to access the schema registry.

[uri](#uri_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

URI of the secret (Secrets Manager secret ARN) used to authenticate with the schema registry.

[type](#type_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Authentication type Lambda uses to access the schema registry.

[uri](#uri_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

URI of the secret (Secrets Manager secret ARN) used to authenticate with the schema registry.

#### EventSourceMappingAmazonManagedKafkaEventSourceConfigSchemaRegistryConfigSchemaValidationConfig

, EventSourceMappingAmazonManagedKafkaEventSourceConfigSchemaRegistryConfigSchemaValidationConfigArgs

[](#eventsourcemappingamazonmanagedkafkaeventsourceconfigschemaregistryconfigschemavalidationconfig)

[Attribute](#attribute_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Message attribute to validate. Valid values: `KEY`, `VALUE`.

[Attribute](#attribute_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Message attribute to validate. Valid values: `KEY`, `VALUE`.

[attribute](#attribute_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Message attribute to validate. Valid values: `KEY`, `VALUE`.

[attribute](#attribute_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Message attribute to validate. Valid values: `KEY`, `VALUE`.

[attribute](#attribute_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Message attribute to validate. Valid values: `KEY`, `VALUE`.

[attribute](#attribute_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Message attribute to validate. Valid values: `KEY`, `VALUE`.

[attribute](#attribute_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Message attribute to validate. Valid values: `KEY`, `VALUE`.

#### EventSourceMappingDestinationConfig

, EventSourceMappingDestinationConfigArgs

[](#eventsourcemappingdestinationconfig)

[OnFailure](#onfailure_csharp) [EventSourceMappingDestinationConfigOnFailure](#eventsourcemappingdestinationconfigonfailure)

Destination configuration for failed invocations. See below.

[OnFailure](#onfailure_go) [EventSourceMappingDestinationConfigOnFailure](#eventsourcemappingdestinationconfigonfailure)

Destination configuration for failed invocations. See below.

[on\_failure](#on_failure_hcl) [object](#eventsourcemappingdestinationconfigonfailure)

Destination configuration for failed invocations. See below.

[onFailure](#onfailure_java) [EventSourceMappingDestinationConfigOnFailure](#eventsourcemappingdestinationconfigonfailure)

Destination configuration for failed invocations. See below.

[onFailure](#onfailure_nodejs) [EventSourceMappingDestinationConfigOnFailure](#eventsourcemappingdestinationconfigonfailure)

Destination configuration for failed invocations. See below.

[on\_failure](#on_failure_python) [EventSourceMappingDestinationConfigOnFailure](#eventsourcemappingdestinationconfigonfailure)

Destination configuration for failed invocations. See below.

[onFailure](#onfailure_yaml) [Property Map](#eventsourcemappingdestinationconfigonfailure)

Destination configuration for failed invocations. See below.

#### EventSourceMappingDestinationConfigOnFailure

, EventSourceMappingDestinationConfigOnFailureArgs

[](#eventsourcemappingdestinationconfigonfailure)

[DestinationArn](#destinationarn_csharp) This property is required. string

ARN of the destination resource, or `kafka://your-topic-name` for Amazon MSK and self-managed Apache Kafka destinations.

[DestinationArn](#destinationarn_go) This property is required. string

ARN of the destination resource, or `kafka://your-topic-name` for Amazon MSK and self-managed Apache Kafka destinations.

[destination\_arn](#destination_arn_hcl) This property is required. string

ARN of the destination resource, or `kafka://your-topic-name` for Amazon MSK and self-managed Apache Kafka destinations.

[destinationArn](#destinationarn_java) This property is required. String

ARN of the destination resource, or `kafka://your-topic-name` for Amazon MSK and self-managed Apache Kafka destinations.

[destinationArn](#destinationarn_nodejs) This property is required. string

ARN of the destination resource, or `kafka://your-topic-name` for Amazon MSK and self-managed Apache Kafka destinations.

[destination\_arn](#destination_arn_python) This property is required. str

ARN of the destination resource, or `kafka://your-topic-name` for Amazon MSK and self-managed Apache Kafka destinations.

[destinationArn](#destinationarn_yaml) This property is required. String

ARN of the destination resource, or `kafka://your-topic-name` for Amazon MSK and self-managed Apache Kafka destinations.

#### EventSourceMappingDocumentDbEventSourceConfig

, EventSourceMappingDocumentDbEventSourceConfigArgs

[](#eventsourcemappingdocumentdbeventsourceconfig)

[DatabaseName](#databasename_csharp) This property is required. string

Name of the database to consume within the DocumentDB cluster.

[CollectionName](#collectionname_csharp) string

Name of the collection to consume within the database. If you do not specify a collection, Lambda consumes all collections.

[FullDocument](#fulldocument_csharp) string

Determines what DocumentDB sends to your event stream during document update operations. If set to `UpdateLookup`, DocumentDB sends a delta describing the changes, along with a copy of the entire document. Otherwise, DocumentDB sends only a partial document that contains the changes. Valid values: `UpdateLookup`, `Default`.

[DatabaseName](#databasename_go) This property is required. string

Name of the database to consume within the DocumentDB cluster.

[CollectionName](#collectionname_go) string

Name of the collection to consume within the database. If you do not specify a collection, Lambda consumes all collections.

[FullDocument](#fulldocument_go) string

Determines what DocumentDB sends to your event stream during document update operations. If set to `UpdateLookup`, DocumentDB sends a delta describing the changes, along with a copy of the entire document. Otherwise, DocumentDB sends only a partial document that contains the changes. Valid values: `UpdateLookup`, `Default`.

[database\_name](#database_name_hcl) This property is required. string

Name of the database to consume within the DocumentDB cluster.

[collection\_name](#collection_name_hcl) string

Name of the collection to consume within the database. If you do not specify a collection, Lambda consumes all collections.

[full\_document](#full_document_hcl) string

Determines what DocumentDB sends to your event stream during document update operations. If set to `UpdateLookup`, DocumentDB sends a delta describing the changes, along with a copy of the entire document. Otherwise, DocumentDB sends only a partial document that contains the changes. Valid values: `UpdateLookup`, `Default`.

[databaseName](#databasename_java) This property is required. String

Name of the database to consume within the DocumentDB cluster.

[collectionName](#collectionname_java) String

Name of the collection to consume within the database. If you do not specify a collection, Lambda consumes all collections.

[fullDocument](#fulldocument_java) String

Determines what DocumentDB sends to your event stream during document update operations. If set to `UpdateLookup`, DocumentDB sends a delta describing the changes, along with a copy of the entire document. Otherwise, DocumentDB sends only a partial document that contains the changes. Valid values: `UpdateLookup`, `Default`.

[databaseName](#databasename_nodejs) This property is required. string

Name of the database to consume within the DocumentDB cluster.

[collectionName](#collectionname_nodejs) string

Name of the collection to consume within the database. If you do not specify a collection, Lambda consumes all collections.

[fullDocument](#fulldocument_nodejs) string

Determines what DocumentDB sends to your event stream during document update operations. If set to `UpdateLookup`, DocumentDB sends a delta describing the changes, along with a copy of the entire document. Otherwise, DocumentDB sends only a partial document that contains the changes. Valid values: `UpdateLookup`, `Default`.

[database\_name](#database_name_python) This property is required. str

Name of the database to consume within the DocumentDB cluster.

[collection\_name](#collection_name_python) str

Name of the collection to consume within the database. If you do not specify a collection, Lambda consumes all collections.

[full\_document](#full_document_python) str

Determines what DocumentDB sends to your event stream during document update operations. If set to `UpdateLookup`, DocumentDB sends a delta describing the changes, along with a copy of the entire document. Otherwise, DocumentDB sends only a partial document that contains the changes. Valid values: `UpdateLookup`, `Default`.

[databaseName](#databasename_yaml) This property is required. String

Name of the database to consume within the DocumentDB cluster.

[collectionName](#collectionname_yaml) String

Name of the collection to consume within the database. If you do not specify a collection, Lambda consumes all collections.

[fullDocument](#fulldocument_yaml) String

Determines what DocumentDB sends to your event stream during document update operations. If set to `UpdateLookup`, DocumentDB sends a delta describing the changes, along with a copy of the entire document. Otherwise, DocumentDB sends only a partial document that contains the changes. Valid values: `UpdateLookup`, `Default`.

#### EventSourceMappingFilterCriteria

, EventSourceMappingFilterCriteriaArgs

[](#eventsourcemappingfiltercriteria)

[Filters](#filters_csharp) [List<EventSourceMappingFilterCriteriaFilter>](#eventsourcemappingfiltercriteriafilter)

Set of up to 5 filter. If an event satisfies at least one, Lambda sends the event to the function or adds it to the next batch. See below.

[Filters](#filters_go) [\[\]EventSourceMappingFilterCriteriaFilter](#eventsourcemappingfiltercriteriafilter)

Set of up to 5 filter. If an event satisfies at least one, Lambda sends the event to the function or adds it to the next batch. See below.

[filters](#filters_hcl) [list(object)](#eventsourcemappingfiltercriteriafilter)

Set of up to 5 filter. If an event satisfies at least one, Lambda sends the event to the function or adds it to the next batch. See below.

[filters](#filters_java) [List<EventSourceMappingFilterCriteriaFilter>](#eventsourcemappingfiltercriteriafilter)

Set of up to 5 filter. If an event satisfies at least one, Lambda sends the event to the function or adds it to the next batch. See below.

[filters](#filters_nodejs) [EventSourceMappingFilterCriteriaFilter\[\]](#eventsourcemappingfiltercriteriafilter)

Set of up to 5 filter. If an event satisfies at least one, Lambda sends the event to the function or adds it to the next batch. See below.

[filters](#filters_python) [Sequence\[EventSourceMappingFilterCriteriaFilter\]](#eventsourcemappingfiltercriteriafilter)

Set of up to 5 filter. If an event satisfies at least one, Lambda sends the event to the function or adds it to the next batch. See below.

[filters](#filters_yaml) [List<Property Map>](#eventsourcemappingfiltercriteriafilter)

Set of up to 5 filter. If an event satisfies at least one, Lambda sends the event to the function or adds it to the next batch. See below.

#### EventSourceMappingFilterCriteriaFilter

, EventSourceMappingFilterCriteriaFilterArgs

[](#eventsourcemappingfiltercriteriafilter)

[Pattern](#pattern_csharp) string

Filter pattern up to 4096 characters. See [Filter Rule Syntax](https://docs.aws.amazon.com/lambda/latest/dg/invocation-eventfiltering.html#filtering-syntax).

[Pattern](#pattern_go) string

Filter pattern up to 4096 characters. See [Filter Rule Syntax](https://docs.aws.amazon.com/lambda/latest/dg/invocation-eventfiltering.html#filtering-syntax).

[pattern](#pattern_hcl) string

Filter pattern up to 4096 characters. See [Filter Rule Syntax](https://docs.aws.amazon.com/lambda/latest/dg/invocation-eventfiltering.html#filtering-syntax).

[pattern](#pattern_java) String

Filter pattern up to 4096 characters. See [Filter Rule Syntax](https://docs.aws.amazon.com/lambda/latest/dg/invocation-eventfiltering.html#filtering-syntax).

[pattern](#pattern_nodejs) string

Filter pattern up to 4096 characters. See [Filter Rule Syntax](https://docs.aws.amazon.com/lambda/latest/dg/invocation-eventfiltering.html#filtering-syntax).

[pattern](#pattern_python) str

Filter pattern up to 4096 characters. See [Filter Rule Syntax](https://docs.aws.amazon.com/lambda/latest/dg/invocation-eventfiltering.html#filtering-syntax).

[pattern](#pattern_yaml) String

Filter pattern up to 4096 characters. See [Filter Rule Syntax](https://docs.aws.amazon.com/lambda/latest/dg/invocation-eventfiltering.html#filtering-syntax).

#### EventSourceMappingMetricsConfig

, EventSourceMappingMetricsConfigArgs

[](#eventsourcemappingmetricsconfig)

[Metrics](#metrics_csharp) This property is required. List<string>

List containing the metrics to be produced by the event source mapping. Valid values: `EventCount`.

[Metrics](#metrics_go) This property is required. \[\]string

List containing the metrics to be produced by the event source mapping. Valid values: `EventCount`.

[metrics](#metrics_hcl) This property is required. list(string)

List containing the metrics to be produced by the event source mapping. Valid values: `EventCount`.

[metrics](#metrics_java) This property is required. List<String>

List containing the metrics to be produced by the event source mapping. Valid values: `EventCount`.

[metrics](#metrics_nodejs) This property is required. string\[\]

List containing the metrics to be produced by the event source mapping. Valid values: `EventCount`.

[metrics](#metrics_python) This property is required. Sequence\[str\]

List containing the metrics to be produced by the event source mapping. Valid values: `EventCount`.

[metrics](#metrics_yaml) This property is required. List<String>

List containing the metrics to be produced by the event source mapping. Valid values: `EventCount`.

#### EventSourceMappingProvisionedPollerConfig

, EventSourceMappingProvisionedPollerConfigArgs

[](#eventsourcemappingprovisionedpollerconfig)

[MaximumPollers](#maximumpollers_csharp) int

Maximum number of event pollers this event source can scale up to. The range is between 1 and 2000.

[MinimumPollers](#minimumpollers_csharp) int

Minimum number of event pollers this event source can scale down to. The range is between 1 and 200.

[PollerGroupName](#pollergroupname_csharp) string

The name of the provisioned poller group used to group multiple ESMs within the event source's VPC to share Event Poller Unit (EPU) capacity. You can use this option to optimize Provisioned mode costs for your ESMs. You can group up to 100 ESMs per poller group and aggregate maximum pollers across all ESMs in a group cannot exceed 2000.

[MaximumPollers](#maximumpollers_go) int

Maximum number of event pollers this event source can scale up to. The range is between 1 and 2000.

[MinimumPollers](#minimumpollers_go) int

Minimum number of event pollers this event source can scale down to. The range is between 1 and 200.

[PollerGroupName](#pollergroupname_go) string

The name of the provisioned poller group used to group multiple ESMs within the event source's VPC to share Event Poller Unit (EPU) capacity. You can use this option to optimize Provisioned mode costs for your ESMs. You can group up to 100 ESMs per poller group and aggregate maximum pollers across all ESMs in a group cannot exceed 2000.

[maximum\_pollers](#maximum_pollers_hcl) number

Maximum number of event pollers this event source can scale up to. The range is between 1 and 2000.

[minimum\_pollers](#minimum_pollers_hcl) number

Minimum number of event pollers this event source can scale down to. The range is between 1 and 200.

[poller\_group\_name](#poller_group_name_hcl) string

The name of the provisioned poller group used to group multiple ESMs within the event source's VPC to share Event Poller Unit (EPU) capacity. You can use this option to optimize Provisioned mode costs for your ESMs. You can group up to 100 ESMs per poller group and aggregate maximum pollers across all ESMs in a group cannot exceed 2000.

[maximumPollers](#maximumpollers_java) Integer

Maximum number of event pollers this event source can scale up to. The range is between 1 and 2000.

[minimumPollers](#minimumpollers_java) Integer

Minimum number of event pollers this event source can scale down to. The range is between 1 and 200.

[pollerGroupName](#pollergroupname_java) String

The name of the provisioned poller group used to group multiple ESMs within the event source's VPC to share Event Poller Unit (EPU) capacity. You can use this option to optimize Provisioned mode costs for your ESMs. You can group up to 100 ESMs per poller group and aggregate maximum pollers across all ESMs in a group cannot exceed 2000.

[maximumPollers](#maximumpollers_nodejs) number

Maximum number of event pollers this event source can scale up to. The range is between 1 and 2000.

[minimumPollers](#minimumpollers_nodejs) number

Minimum number of event pollers this event source can scale down to. The range is between 1 and 200.

[pollerGroupName](#pollergroupname_nodejs) string

The name of the provisioned poller group used to group multiple ESMs within the event source's VPC to share Event Poller Unit (EPU) capacity. You can use this option to optimize Provisioned mode costs for your ESMs. You can group up to 100 ESMs per poller group and aggregate maximum pollers across all ESMs in a group cannot exceed 2000.

[maximum\_pollers](#maximum_pollers_python) int

Maximum number of event pollers this event source can scale up to. The range is between 1 and 2000.

[minimum\_pollers](#minimum_pollers_python) int

Minimum number of event pollers this event source can scale down to. The range is between 1 and 200.

[poller\_group\_name](#poller_group_name_python) str

The name of the provisioned poller group used to group multiple ESMs within the event source's VPC to share Event Poller Unit (EPU) capacity. You can use this option to optimize Provisioned mode costs for your ESMs. You can group up to 100 ESMs per poller group and aggregate maximum pollers across all ESMs in a group cannot exceed 2000.

[maximumPollers](#maximumpollers_yaml) Number

Maximum number of event pollers this event source can scale up to. The range is between 1 and 2000.

[minimumPollers](#minimumpollers_yaml) Number

Minimum number of event pollers this event source can scale down to. The range is between 1 and 200.

[pollerGroupName](#pollergroupname_yaml) String

The name of the provisioned poller group used to group multiple ESMs within the event source's VPC to share Event Poller Unit (EPU) capacity. You can use this option to optimize Provisioned mode costs for your ESMs. You can group up to 100 ESMs per poller group and aggregate maximum pollers across all ESMs in a group cannot exceed 2000.

#### EventSourceMappingScalingConfig

, EventSourceMappingScalingConfigArgs

[](#eventsourcemappingscalingconfig)

[MaximumConcurrency](#maximumconcurrency_csharp) int

Limits the number of concurrent instances that the Amazon SQS event source can invoke. Must be greater than or equal to 2. See [Configuring maximum concurrency for Amazon SQS event sources](https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html#events-sqs-max-concurrency). You need to raise a [Service Quota Ticket](https://docs.aws.amazon.com/general/latest/gr/aws_service_limits.html) to increase the concurrency beyond 1000.

[MaximumConcurrency](#maximumconcurrency_go) int

Limits the number of concurrent instances that the Amazon SQS event source can invoke. Must be greater than or equal to 2. See [Configuring maximum concurrency for Amazon SQS event sources](https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html#events-sqs-max-concurrency). You need to raise a [Service Quota Ticket](https://docs.aws.amazon.com/general/latest/gr/aws_service_limits.html) to increase the concurrency beyond 1000.

[maximum\_concurrency](#maximum_concurrency_hcl) number

Limits the number of concurrent instances that the Amazon SQS event source can invoke. Must be greater than or equal to 2. See [Configuring maximum concurrency for Amazon SQS event sources](https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html#events-sqs-max-concurrency). You need to raise a [Service Quota Ticket](https://docs.aws.amazon.com/general/latest/gr/aws_service_limits.html) to increase the concurrency beyond 1000.

[maximumConcurrency](#maximumconcurrency_java) Integer

Limits the number of concurrent instances that the Amazon SQS event source can invoke. Must be greater than or equal to 2. See [Configuring maximum concurrency for Amazon SQS event sources](https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html#events-sqs-max-concurrency). You need to raise a [Service Quota Ticket](https://docs.aws.amazon.com/general/latest/gr/aws_service_limits.html) to increase the concurrency beyond 1000.

[maximumConcurrency](#maximumconcurrency_nodejs) number

Limits the number of concurrent instances that the Amazon SQS event source can invoke. Must be greater than or equal to 2. See [Configuring maximum concurrency for Amazon SQS event sources](https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html#events-sqs-max-concurrency). You need to raise a [Service Quota Ticket](https://docs.aws.amazon.com/general/latest/gr/aws_service_limits.html) to increase the concurrency beyond 1000.

[maximum\_concurrency](#maximum_concurrency_python) int

Limits the number of concurrent instances that the Amazon SQS event source can invoke. Must be greater than or equal to 2. See [Configuring maximum concurrency for Amazon SQS event sources](https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html#events-sqs-max-concurrency). You need to raise a [Service Quota Ticket](https://docs.aws.amazon.com/general/latest/gr/aws_service_limits.html) to increase the concurrency beyond 1000.

[maximumConcurrency](#maximumconcurrency_yaml) Number

Limits the number of concurrent instances that the Amazon SQS event source can invoke. Must be greater than or equal to 2. See [Configuring maximum concurrency for Amazon SQS event sources](https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html#events-sqs-max-concurrency). You need to raise a [Service Quota Ticket](https://docs.aws.amazon.com/general/latest/gr/aws_service_limits.html) to increase the concurrency beyond 1000.

#### EventSourceMappingSelfManagedEventSource

, EventSourceMappingSelfManagedEventSourceArgs

[](#eventsourcemappingselfmanagedeventsource)

[Endpoints](#endpoints_csharp)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

Dictionary<string, string>

Map of endpoints for the self managed source. For Kafka self-managed sources, the key should be `KAFKA_BOOTSTRAP_SERVERS` and the value should be a string with a comma separated list of broker endpoints.

[Endpoints](#endpoints_go)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

map\[string\]string

Map of endpoints for the self managed source. For Kafka self-managed sources, the key should be `KAFKA_BOOTSTRAP_SERVERS` and the value should be a string with a comma separated list of broker endpoints.

[endpoints](#endpoints_hcl)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

map(string)

Map of endpoints for the self managed source. For Kafka self-managed sources, the key should be `KAFKA_BOOTSTRAP_SERVERS` and the value should be a string with a comma separated list of broker endpoints.

[endpoints](#endpoints_java)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

Map<String,String>

Map of endpoints for the self managed source. For Kafka self-managed sources, the key should be `KAFKA_BOOTSTRAP_SERVERS` and the value should be a string with a comma separated list of broker endpoints.

[endpoints](#endpoints_nodejs)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

{\[key: string\]: string}

Map of endpoints for the self managed source. For Kafka self-managed sources, the key should be `KAFKA_BOOTSTRAP_SERVERS` and the value should be a string with a comma separated list of broker endpoints.

[endpoints](#endpoints_python)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

Mapping\[str, str\]

Map of endpoints for the self managed source. For Kafka self-managed sources, the key should be `KAFKA_BOOTSTRAP_SERVERS` and the value should be a string with a comma separated list of broker endpoints.

[endpoints](#endpoints_yaml)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

Map<String>

Map of endpoints for the self managed source. For Kafka self-managed sources, the key should be `KAFKA_BOOTSTRAP_SERVERS` and the value should be a string with a comma separated list of broker endpoints.

#### EventSourceMappingSelfManagedKafkaEventSourceConfig

, EventSourceMappingSelfManagedKafkaEventSourceConfigArgs

[](#eventsourcemappingselfmanagedkafkaeventsourceconfig)

[ConsumerGroupId](#consumergroupid_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Kafka consumer group ID between 1 and 200 characters for use when creating this event source mapping. If one is not specified, this value will be automatically generated. See [SelfManagedKafkaEventSourceConfig Syntax](https://docs.aws.amazon.com/lambda/latest/dg/API_SelfManagedKafkaEventSourceConfig.html).

[SchemaRegistryConfig](#schemaregistryconfig_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [EventSourceMappingSelfManagedKafkaEventSourceConfigSchemaRegistryConfig](#eventsourcemappingselfmanagedkafkaeventsourceconfigschemaregistryconfig)

Block for a Kafka schema registry setting. See below.

[ConsumerGroupId](#consumergroupid_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Kafka consumer group ID between 1 and 200 characters for use when creating this event source mapping. If one is not specified, this value will be automatically generated. See [SelfManagedKafkaEventSourceConfig Syntax](https://docs.aws.amazon.com/lambda/latest/dg/API_SelfManagedKafkaEventSourceConfig.html).

[SchemaRegistryConfig](#schemaregistryconfig_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [EventSourceMappingSelfManagedKafkaEventSourceConfigSchemaRegistryConfig](#eventsourcemappingselfmanagedkafkaeventsourceconfigschemaregistryconfig)

Block for a Kafka schema registry setting. See below.

[consumer\_group\_id](#consumer_group_id_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Kafka consumer group ID between 1 and 200 characters for use when creating this event source mapping. If one is not specified, this value will be automatically generated. See [SelfManagedKafkaEventSourceConfig Syntax](https://docs.aws.amazon.com/lambda/latest/dg/API_SelfManagedKafkaEventSourceConfig.html).

[schema\_registry\_config](#schema_registry_config_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [object](#eventsourcemappingselfmanagedkafkaeventsourceconfigschemaregistryconfig)

Block for a Kafka schema registry setting. See below.

[consumerGroupId](#consumergroupid_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Kafka consumer group ID between 1 and 200 characters for use when creating this event source mapping. If one is not specified, this value will be automatically generated. See [SelfManagedKafkaEventSourceConfig Syntax](https://docs.aws.amazon.com/lambda/latest/dg/API_SelfManagedKafkaEventSourceConfig.html).

[schemaRegistryConfig](#schemaregistryconfig_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [EventSourceMappingSelfManagedKafkaEventSourceConfigSchemaRegistryConfig](#eventsourcemappingselfmanagedkafkaeventsourceconfigschemaregistryconfig)

Block for a Kafka schema registry setting. See below.

[consumerGroupId](#consumergroupid_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Kafka consumer group ID between 1 and 200 characters for use when creating this event source mapping. If one is not specified, this value will be automatically generated. See [SelfManagedKafkaEventSourceConfig Syntax](https://docs.aws.amazon.com/lambda/latest/dg/API_SelfManagedKafkaEventSourceConfig.html).

[schemaRegistryConfig](#schemaregistryconfig_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [EventSourceMappingSelfManagedKafkaEventSourceConfigSchemaRegistryConfig](#eventsourcemappingselfmanagedkafkaeventsourceconfigschemaregistryconfig)

Block for a Kafka schema registry setting. See below.

[consumer\_group\_id](#consumer_group_id_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Kafka consumer group ID between 1 and 200 characters for use when creating this event source mapping. If one is not specified, this value will be automatically generated. See [SelfManagedKafkaEventSourceConfig Syntax](https://docs.aws.amazon.com/lambda/latest/dg/API_SelfManagedKafkaEventSourceConfig.html).

[schema\_registry\_config](#schema_registry_config_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [EventSourceMappingSelfManagedKafkaEventSourceConfigSchemaRegistryConfig](#eventsourcemappingselfmanagedkafkaeventsourceconfigschemaregistryconfig)

Block for a Kafka schema registry setting. See below.

[consumerGroupId](#consumergroupid_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Kafka consumer group ID between 1 and 200 characters for use when creating this event source mapping. If one is not specified, this value will be automatically generated. See [SelfManagedKafkaEventSourceConfig Syntax](https://docs.aws.amazon.com/lambda/latest/dg/API_SelfManagedKafkaEventSourceConfig.html).

[schemaRegistryConfig](#schemaregistryconfig_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [Property Map](#eventsourcemappingselfmanagedkafkaeventsourceconfigschemaregistryconfig)

Block for a Kafka schema registry setting. See below.

#### EventSourceMappingSelfManagedKafkaEventSourceConfigSchemaRegistryConfig

, EventSourceMappingSelfManagedKafkaEventSourceConfigSchemaRegistryConfigArgs

[](#eventsourcemappingselfmanagedkafkaeventsourceconfigschemaregistryconfig)

[AccessConfigs](#accessconfigs_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [List<EventSourceMappingSelfManagedKafkaEventSourceConfigSchemaRegistryConfigAccessConfig>](#eventsourcemappingselfmanagedkafkaeventsourceconfigschemaregistryconfigaccessconfig)

Configuration block for authentication Lambda uses to access the schema registry.

[EventRecordFormat](#eventrecordformat_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Record format that Lambda delivers to the function after schema validation. Valid values: `JSON`, `SOURCE`.

[SchemaRegistryUri](#schemaregistryuri_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

URI of the schema registry. For AWS Glue schema registries, use the ARN of the registry. For Confluent schema registries, use the registry URL.

[SchemaValidationConfigs](#schemavalidationconfigs_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [List<EventSourceMappingSelfManagedKafkaEventSourceConfigSchemaRegistryConfigSchemaValidationConfig>](#eventsourcemappingselfmanagedkafkaeventsourceconfigschemaregistryconfigschemavalidationconfig)

Repeatable block that defines schema validation settings. These specify the message attributes that Lambda should validate and filter using the schema registry.

[AccessConfigs](#accessconfigs_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [\[\]EventSourceMappingSelfManagedKafkaEventSourceConfigSchemaRegistryConfigAccessConfig](#eventsourcemappingselfmanagedkafkaeventsourceconfigschemaregistryconfigaccessconfig)

Configuration block for authentication Lambda uses to access the schema registry.

[EventRecordFormat](#eventrecordformat_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Record format that Lambda delivers to the function after schema validation. Valid values: `JSON`, `SOURCE`.

[SchemaRegistryUri](#schemaregistryuri_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

URI of the schema registry. For AWS Glue schema registries, use the ARN of the registry. For Confluent schema registries, use the registry URL.

[SchemaValidationConfigs](#schemavalidationconfigs_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [\[\]EventSourceMappingSelfManagedKafkaEventSourceConfigSchemaRegistryConfigSchemaValidationConfig](#eventsourcemappingselfmanagedkafkaeventsourceconfigschemaregistryconfigschemavalidationconfig)

Repeatable block that defines schema validation settings. These specify the message attributes that Lambda should validate and filter using the schema registry.

[access\_configs](#access_configs_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [list(object)](#eventsourcemappingselfmanagedkafkaeventsourceconfigschemaregistryconfigaccessconfig)

Configuration block for authentication Lambda uses to access the schema registry.

[event\_record\_format](#event_record_format_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Record format that Lambda delivers to the function after schema validation. Valid values: `JSON`, `SOURCE`.

[schema\_registry\_uri](#schema_registry_uri_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

URI of the schema registry. For AWS Glue schema registries, use the ARN of the registry. For Confluent schema registries, use the registry URL.

[schema\_validation\_configs](#schema_validation_configs_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [list(object)](#eventsourcemappingselfmanagedkafkaeventsourceconfigschemaregistryconfigschemavalidationconfig)

Repeatable block that defines schema validation settings. These specify the message attributes that Lambda should validate and filter using the schema registry.

[accessConfigs](#accessconfigs_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [List<EventSourceMappingSelfManagedKafkaEventSourceConfigSchemaRegistryConfigAccessConfig>](#eventsourcemappingselfmanagedkafkaeventsourceconfigschemaregistryconfigaccessconfig)

Configuration block for authentication Lambda uses to access the schema registry.

[eventRecordFormat](#eventrecordformat_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Record format that Lambda delivers to the function after schema validation. Valid values: `JSON`, `SOURCE`.

[schemaRegistryUri](#schemaregistryuri_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

URI of the schema registry. For AWS Glue schema registries, use the ARN of the registry. For Confluent schema registries, use the registry URL.

[schemaValidationConfigs](#schemavalidationconfigs_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [List<EventSourceMappingSelfManagedKafkaEventSourceConfigSchemaRegistryConfigSchemaValidationConfig>](#eventsourcemappingselfmanagedkafkaeventsourceconfigschemaregistryconfigschemavalidationconfig)

Repeatable block that defines schema validation settings. These specify the message attributes that Lambda should validate and filter using the schema registry.

[accessConfigs](#accessconfigs_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [EventSourceMappingSelfManagedKafkaEventSourceConfigSchemaRegistryConfigAccessConfig\[\]](#eventsourcemappingselfmanagedkafkaeventsourceconfigschemaregistryconfigaccessconfig)

Configuration block for authentication Lambda uses to access the schema registry.

[eventRecordFormat](#eventrecordformat_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Record format that Lambda delivers to the function after schema validation. Valid values: `JSON`, `SOURCE`.

[schemaRegistryUri](#schemaregistryuri_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

URI of the schema registry. For AWS Glue schema registries, use the ARN of the registry. For Confluent schema registries, use the registry URL.

[schemaValidationConfigs](#schemavalidationconfigs_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [EventSourceMappingSelfManagedKafkaEventSourceConfigSchemaRegistryConfigSchemaValidationConfig\[\]](#eventsourcemappingselfmanagedkafkaeventsourceconfigschemaregistryconfigschemavalidationconfig)

Repeatable block that defines schema validation settings. These specify the message attributes that Lambda should validate and filter using the schema registry.

[access\_configs](#access_configs_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [Sequence\[EventSourceMappingSelfManagedKafkaEventSourceConfigSchemaRegistryConfigAccessConfig\]](#eventsourcemappingselfmanagedkafkaeventsourceconfigschemaregistryconfigaccessconfig)

Configuration block for authentication Lambda uses to access the schema registry.

[event\_record\_format](#event_record_format_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Record format that Lambda delivers to the function after schema validation. Valid values: `JSON`, `SOURCE`.

[schema\_registry\_uri](#schema_registry_uri_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

URI of the schema registry. For AWS Glue schema registries, use the ARN of the registry. For Confluent schema registries, use the registry URL.

[schema\_validation\_configs](#schema_validation_configs_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [Sequence\[EventSourceMappingSelfManagedKafkaEventSourceConfigSchemaRegistryConfigSchemaValidationConfig\]](#eventsourcemappingselfmanagedkafkaeventsourceconfigschemaregistryconfigschemavalidationconfig)

Repeatable block that defines schema validation settings. These specify the message attributes that Lambda should validate and filter using the schema registry.

[accessConfigs](#accessconfigs_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [List<Property Map>](#eventsourcemappingselfmanagedkafkaeventsourceconfigschemaregistryconfigaccessconfig)

Configuration block for authentication Lambda uses to access the schema registry.

[eventRecordFormat](#eventrecordformat_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Record format that Lambda delivers to the function after schema validation. Valid values: `JSON`, `SOURCE`.

[schemaRegistryUri](#schemaregistryuri_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

URI of the schema registry. For AWS Glue schema registries, use the ARN of the registry. For Confluent schema registries, use the registry URL.

[schemaValidationConfigs](#schemavalidationconfigs_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [List<Property Map>](#eventsourcemappingselfmanagedkafkaeventsourceconfigschemaregistryconfigschemavalidationconfig)

Repeatable block that defines schema validation settings. These specify the message attributes that Lambda should validate and filter using the schema registry.

#### EventSourceMappingSelfManagedKafkaEventSourceConfigSchemaRegistryConfigAccessConfig

, EventSourceMappingSelfManagedKafkaEventSourceConfigSchemaRegistryConfigAccessConfigArgs

[](#eventsourcemappingselfmanagedkafkaeventsourceconfigschemaregistryconfigaccessconfig)

[Type](#type_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Authentication type Lambda uses to access the schema registry.

[Uri](#uri_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

URI of the secret (Secrets Manager secret ARN) used to authenticate with the schema registry.

[Type](#type_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Authentication type Lambda uses to access the schema registry.

[Uri](#uri_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

URI of the secret (Secrets Manager secret ARN) used to authenticate with the schema registry.

[type](#type_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Authentication type Lambda uses to access the schema registry.

[uri](#uri_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

URI of the secret (Secrets Manager secret ARN) used to authenticate with the schema registry.

[type](#type_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Authentication type Lambda uses to access the schema registry.

[uri](#uri_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

URI of the secret (Secrets Manager secret ARN) used to authenticate with the schema registry.

[type](#type_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Authentication type Lambda uses to access the schema registry.

[uri](#uri_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

URI of the secret (Secrets Manager secret ARN) used to authenticate with the schema registry.

[type](#type_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Authentication type Lambda uses to access the schema registry.

[uri](#uri_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

URI of the secret (Secrets Manager secret ARN) used to authenticate with the schema registry.

[type](#type_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Authentication type Lambda uses to access the schema registry.

[uri](#uri_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

URI of the secret (Secrets Manager secret ARN) used to authenticate with the schema registry.

#### EventSourceMappingSelfManagedKafkaEventSourceConfigSchemaRegistryConfigSchemaValidationConfig

, EventSourceMappingSelfManagedKafkaEventSourceConfigSchemaRegistryConfigSchemaValidationConfigArgs

[](#eventsourcemappingselfmanagedkafkaeventsourceconfigschemaregistryconfigschemavalidationconfig)

[Attribute](#attribute_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Message attribute to validate. Valid values: `KEY`, `VALUE`.

[Attribute](#attribute_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Message attribute to validate. Valid values: `KEY`, `VALUE`.

[attribute](#attribute_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Message attribute to validate. Valid values: `KEY`, `VALUE`.

[attribute](#attribute_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Message attribute to validate. Valid values: `KEY`, `VALUE`.

[attribute](#attribute_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Message attribute to validate. Valid values: `KEY`, `VALUE`.

[attribute](#attribute_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Message attribute to validate. Valid values: `KEY`, `VALUE`.

[attribute](#attribute_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Message attribute to validate. Valid values: `KEY`, `VALUE`.

#### EventSourceMappingSourceAccessConfiguration

, EventSourceMappingSourceAccessConfigurationArgs

[](#eventsourcemappingsourceaccessconfiguration)

[Type](#type_csharp) This property is required. string

Type of authentication protocol, VPC components, or virtual host for your event source. For valid values, refer to the [AWS documentation](https://docs.aws.amazon.com/lambda/latest/api/API_SourceAccessConfiguration.html).

[Uri](#uri_csharp) This property is required. string

URI for this configuration. For type `VPC_SUBNET` the value should be `subnet:subnet_id` where `subnetId` is the value you would find in an aws.ec2.Subnet resource's id attribute. For type `VPC_SECURITY_GROUP` the value should be `security_group:security_group_id` where `securityGroupId` is the value you would find in an aws.ec2.SecurityGroup resource's id attribute.

[Type](#type_go) This property is required. string

Type of authentication protocol, VPC components, or virtual host for your event source. For valid values, refer to the [AWS documentation](https://docs.aws.amazon.com/lambda/latest/api/API_SourceAccessConfiguration.html).

[Uri](#uri_go) This property is required. string

URI for this configuration. For type `VPC_SUBNET` the value should be `subnet:subnet_id` where `subnetId` is the value you would find in an aws.ec2.Subnet resource's id attribute. For type `VPC_SECURITY_GROUP` the value should be `security_group:security_group_id` where `securityGroupId` is the value you would find in an aws.ec2.SecurityGroup resource's id attribute.

[type](#type_hcl) This property is required. string

Type of authentication protocol, VPC components, or virtual host for your event source. For valid values, refer to the [AWS documentation](https://docs.aws.amazon.com/lambda/latest/api/API_SourceAccessConfiguration.html).

[uri](#uri_hcl) This property is required. string

URI for this configuration. For type `VPC_SUBNET` the value should be `subnet:subnet_id` where `subnetId` is the value you would find in an aws.ec2.Subnet resource's id attribute. For type `VPC_SECURITY_GROUP` the value should be `security_group:security_group_id` where `securityGroupId` is the value you would find in an aws.ec2.SecurityGroup resource's id attribute.

[type](#type_java) This property is required. String

Type of authentication protocol, VPC components, or virtual host for your event source. For valid values, refer to the [AWS documentation](https://docs.aws.amazon.com/lambda/latest/api/API_SourceAccessConfiguration.html).

[uri](#uri_java) This property is required. String

URI for this configuration. For type `VPC_SUBNET` the value should be `subnet:subnet_id` where `subnetId` is the value you would find in an aws.ec2.Subnet resource's id attribute. For type `VPC_SECURITY_GROUP` the value should be `security_group:security_group_id` where `securityGroupId` is the value you would find in an aws.ec2.SecurityGroup resource's id attribute.

[type](#type_nodejs) This property is required. string

Type of authentication protocol, VPC components, or virtual host for your event source. For valid values, refer to the [AWS documentation](https://docs.aws.amazon.com/lambda/latest/api/API_SourceAccessConfiguration.html).

[uri](#uri_nodejs) This property is required. string

URI for this configuration. For type `VPC_SUBNET` the value should be `subnet:subnet_id` where `subnetId` is the value you would find in an aws.ec2.Subnet resource's id attribute. For type `VPC_SECURITY_GROUP` the value should be `security_group:security_group_id` where `securityGroupId` is the value you would find in an aws.ec2.SecurityGroup resource's id attribute.

[type](#type_python) This property is required. str

Type of authentication protocol, VPC components, or virtual host for your event source. For valid values, refer to the [AWS documentation](https://docs.aws.amazon.com/lambda/latest/api/API_SourceAccessConfiguration.html).

[uri](#uri_python) This property is required. str

URI for this configuration. For type `VPC_SUBNET` the value should be `subnet:subnet_id` where `subnetId` is the value you would find in an aws.ec2.Subnet resource's id attribute. For type `VPC_SECURITY_GROUP` the value should be `security_group:security_group_id` where `securityGroupId` is the value you would find in an aws.ec2.SecurityGroup resource's id attribute.

[type](#type_yaml) This property is required. String

Type of authentication protocol, VPC components, or virtual host for your event source. For valid values, refer to the [AWS documentation](https://docs.aws.amazon.com/lambda/latest/api/API_SourceAccessConfiguration.html).

[uri](#uri_yaml) This property is required. String

URI for this configuration. For type `VPC_SUBNET` the value should be `subnet:subnet_id` where `subnetId` is the value you would find in an aws.ec2.Subnet resource's id attribute. For type `VPC_SECURITY_GROUP` the value should be `security_group:security_group_id` where `securityGroupId` is the value you would find in an aws.ec2.SecurityGroup resource's id attribute.

## Import[](#import)

### Identity Schema[](#identity-schema)

#### Required[](#required)

-   `uuid` (String) UUID of the event source mapping.

#### Optional[](#optional)

-   `accountId` (String) AWS Account where this resource is managed.
-   `region` (String) Region where this resource is managed.

Using `pulumi import`, import Lambda event source mappings using the `UUID` (event source mapping identifier). For example:

```bash
$ pulumi import aws:lambda/eventSourceMapping:EventSourceMapping example 12345kxodurf3443
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

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2flambda%2feventsourcemapping]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2flambda%2feventsourcemapping%2f\))

#### Try Pulumi Cloud free.
Your team will thank you.

[Start free trial](https://app.pulumi.com/signup?utm_source=registry&utm_medium=right-rail-banner&utm_campaign=try-pulumi-cloud&iaid=docs-try-pulumi-cloud-ad)
