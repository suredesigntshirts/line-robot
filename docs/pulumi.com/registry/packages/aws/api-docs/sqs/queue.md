---
Source: https://www.pulumi.com/registry/packages/aws/api-docs/sqs/queue/
Generated: 2026-06-06
Updated: 2026-06-06
---

# aws.sqs.Queue

1.  [Packages](/registry/)
2.  [Packages](/registry/packages/)
3.  [AWS](/registry/packages/aws/)
4.  [API Docs](/registry/packages/aws/api-docs/)
5.  [sqs](/registry/packages/aws/api-docs/sqs/)
6.  [Queue](/registry/packages/aws/api-docs/sqs/queue/)

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

Viewing docs for AWS v7.32.0
published on Friday, May 29, 2026 by Pulumi

[Schema (JSON)](/registry/packages/aws/schema.json)

[pulumi/pulumi-aws](https://github.com/pulumi/pulumi-aws)

v7.32.0 (7.x, latest)v6.83.1 (6.x)v5.43.0 (5.x)

# aws.sqs.Queue[](#aws-sqs-queue)

Explore with Neo

-   Copy Page

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2fsqs%2fqueue]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2fsqs%2fqueue%2f\))

Amazon SQS (Simple Queue Service) is a fully managed message queuing service that enables decoupling and scaling of microservices, distributed systems, and serverless applications. This resource allows you to create, configure, and manage an SQS queue, which acts as a reliable message buffer between producers and consumers. With support for standard and FIFO queues, SQS ensures secure, scalable, and asynchronous message processing. Use this resource to define queue attributes, configure access policies, and integrate seamlessly with AWS services like Lambda, SNS, and EC2.

> AWS will hang indefinitely, leading to a `timeout while waiting` error, when creating or updating an `aws.sqs.Queue` with an associated `aws.sqs.QueuePolicy` if `Version = "2012-10-17"` is not explicitly set in the policy.

## Example Usage[](#example-usage)

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

const queue = new aws.sqs.Queue("queue", {
    name: "example-queue",
    delaySeconds: 90,
    maxMessageSize: 2048,
    messageRetentionSeconds: 86400,
    receiveWaitTimeSeconds: 10,
    redrivePolicy: JSON.stringify({
        deadLetterTargetArn: queueDeadletter.arn,
        maxReceiveCount: 4,
    }),
    tags: {
        Environment: "production",
    },
});
```

```python
import pulumi
import json
import pulumi_aws as aws

queue = aws.sqs.Queue("queue",
    name="example-queue",
    delay_seconds=90,
    max_message_size=2048,
    message_retention_seconds=86400,
    receive_wait_time_seconds=10,
    redrive_policy=json.dumps({
        "deadLetterTargetArn": queue_deadletter["arn"],
        "maxReceiveCount": 4,
    }),
    tags={
        "Environment": "production",
    })
```

```go
package main

import (
	"encoding/json"

	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/sqs"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		tmpJSON0, err := json.Marshal(map[string]interface{}{
			"deadLetterTargetArn": queueDeadletter.Arn,
			"maxReceiveCount":     4,
		})
		if err != nil {
			return err
		}
		json0 := string(tmpJSON0)
		_, err = sqs.NewQueue(ctx, "queue", &sqs.QueueArgs{
			Name:                    pulumi.String("example-queue"),
			DelaySeconds:            pulumi.Int(90),
			MaxMessageSize:          pulumi.Int(2048),
			MessageRetentionSeconds: pulumi.Int(86400),
			ReceiveWaitTimeSeconds:  pulumi.Int(10),
			RedrivePolicy:           pulumi.String(pulumi.String(json0)),
			Tags: pulumi.StringMap{
				"Environment": pulumi.String("production"),
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
    var queue = new Aws.Sqs.Queue("queue", new()
    {
        Name = "example-queue",
        DelaySeconds = 90,
        MaxMessageSize = 2048,
        MessageRetentionSeconds = 86400,
        ReceiveWaitTimeSeconds = 10,
        RedrivePolicy = JsonSerializer.Serialize(new Dictionary<string, object?>
        {
            ["deadLetterTargetArn"] = queueDeadletter.Arn,
            ["maxReceiveCount"] = 4,
        }),
        Tags =
        {
            { "Environment", "production" },
        },
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.sqs.Queue;
import com.pulumi.aws.sqs.QueueArgs;
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
        var queue = new Queue("queue", QueueArgs.builder()
            .name("example-queue")
            .delaySeconds(90)
            .maxMessageSize(2048)
            .messageRetentionSeconds(86400)
            .receiveWaitTimeSeconds(10)
            .redrivePolicy(serializeJson(
                jsonObject(
                    jsonProperty("deadLetterTargetArn", queueDeadletter.arn()),
                    jsonProperty("maxReceiveCount", 4)
                )))
            .tags(Map.of("Environment", "production"))
            .build());

    }
}
```

```yaml
resources:
  queue:
    type: aws:sqs:Queue
    properties:
      name: example-queue
      delaySeconds: 90
      maxMessageSize: 2048
      messageRetentionSeconds: 86400
      receiveWaitTimeSeconds: 10
      redrivePolicy:
        fn::toJSON:
          deadLetterTargetArn: ${queueDeadletter.arn}
          maxReceiveCount: 4
      tags:
        Environment: production
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_sqs_queue" "queue" {
  name                      = "example-queue"
  delay_seconds             = 90
  max_message_size          = 2048
  message_retention_seconds = 86400
  receive_wait_time_seconds = 10
  redrive_policy = jsonencode({
    "deadLetterTargetArn" = queueDeadletter.arn
    "maxReceiveCount"     = 4
  })
  tags = {
    "Environment" = "production"
  }
}
```

## FIFO queue[](#fifo-queue)

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

const queue = new aws.sqs.Queue("queue", {
    name: "example-queue.fifo",
    fifoQueue: true,
    contentBasedDeduplication: true,
});
```

```python
import pulumi
import pulumi_aws as aws

queue = aws.sqs.Queue("queue",
    name="example-queue.fifo",
    fifo_queue=True,
    content_based_deduplication=True)
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/sqs"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		_, err := sqs.NewQueue(ctx, "queue", &sqs.QueueArgs{
			Name:                      pulumi.String("example-queue.fifo"),
			FifoQueue:                 pulumi.Bool(true),
			ContentBasedDeduplication: pulumi.Bool(true),
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
    var queue = new Aws.Sqs.Queue("queue", new()
    {
        Name = "example-queue.fifo",
        FifoQueue = true,
        ContentBasedDeduplication = true,
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.sqs.Queue;
import com.pulumi.aws.sqs.QueueArgs;
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
        var queue = new Queue("queue", QueueArgs.builder()
            .name("example-queue.fifo")
            .fifoQueue(true)
            .contentBasedDeduplication(true)
            .build());

    }
}
```

```yaml
resources:
  queue:
    type: aws:sqs:Queue
    properties:
      name: example-queue.fifo
      fifoQueue: true
      contentBasedDeduplication: true
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_sqs_queue" "queue" {
  name                        = "example-queue.fifo"
  fifo_queue                  = true
  content_based_deduplication = true
}
```

## High-throughput FIFO queue[](#high-throughput-fifo-queue)

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

const queue = new aws.sqs.Queue("queue", {
    name: "pulumi-example-queue.fifo",
    fifoQueue: true,
    deduplicationScope: "messageGroup",
    fifoThroughputLimit: "perMessageGroupId",
});
```

```python
import pulumi
import pulumi_aws as aws

queue = aws.sqs.Queue("queue",
    name="pulumi-example-queue.fifo",
    fifo_queue=True,
    deduplication_scope="messageGroup",
    fifo_throughput_limit="perMessageGroupId")
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/sqs"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		_, err := sqs.NewQueue(ctx, "queue", &sqs.QueueArgs{
			Name:                pulumi.String("pulumi-example-queue.fifo"),
			FifoQueue:           pulumi.Bool(true),
			DeduplicationScope:  pulumi.String("messageGroup"),
			FifoThroughputLimit: pulumi.String("perMessageGroupId"),
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
    var queue = new Aws.Sqs.Queue("queue", new()
    {
        Name = "pulumi-example-queue.fifo",
        FifoQueue = true,
        DeduplicationScope = "messageGroup",
        FifoThroughputLimit = "perMessageGroupId",
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.sqs.Queue;
import com.pulumi.aws.sqs.QueueArgs;
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
        var queue = new Queue("queue", QueueArgs.builder()
            .name("pulumi-example-queue.fifo")
            .fifoQueue(true)
            .deduplicationScope("messageGroup")
            .fifoThroughputLimit("perMessageGroupId")
            .build());

    }
}
```

```yaml
resources:
  queue:
    type: aws:sqs:Queue
    properties:
      name: pulumi-example-queue.fifo
      fifoQueue: true
      deduplicationScope: messageGroup
      fifoThroughputLimit: perMessageGroupId
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_sqs_queue" "queue" {
  name                  = "pulumi-example-queue.fifo"
  fifo_queue            = true
  deduplication_scope   = "messageGroup"
  fifo_throughput_limit = "perMessageGroupId"
}
```

## Dead-letter queue[](#dead-letter-queue)

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

const queue = new aws.sqs.Queue("queue", {
    name: "pulumi-example-queue",
    redrivePolicy: JSON.stringify({
        deadLetterTargetArn: queueDeadletter.arn,
        maxReceiveCount: 4,
    }),
});
const exampleQueueDeadletter = new aws.sqs.Queue("example_queue_deadletter", {name: "pulumi-example-deadletter-queue"});
const exampleQueueRedriveAllowPolicy = new aws.sqs.RedriveAllowPolicy("example_queue_redrive_allow_policy", {
    queueUrl: exampleQueueDeadletter.id,
    redriveAllowPolicy: JSON.stringify({
        redrivePermission: "byQueue",
        sourceQueueArns: [exampleQueue.arn],
    }),
});
```

```python
import pulumi
import json
import pulumi_aws as aws

queue = aws.sqs.Queue("queue",
    name="pulumi-example-queue",
    redrive_policy=json.dumps({
        "deadLetterTargetArn": queue_deadletter["arn"],
        "maxReceiveCount": 4,
    }))
example_queue_deadletter = aws.sqs.Queue("example_queue_deadletter", name="pulumi-example-deadletter-queue")
example_queue_redrive_allow_policy = aws.sqs.RedriveAllowPolicy("example_queue_redrive_allow_policy",
    queue_url=example_queue_deadletter.id,
    redrive_allow_policy=json.dumps({
        "redrivePermission": "byQueue",
        "sourceQueueArns": [example_queue["arn"]],
    }))
```

```go
package main

import (
	"encoding/json"

	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/sqs"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		tmpJSON0, err := json.Marshal(map[string]interface{}{
			"deadLetterTargetArn": queueDeadletter.Arn,
			"maxReceiveCount":     4,
		})
		if err != nil {
			return err
		}
		json0 := string(tmpJSON0)
		_, err = sqs.NewQueue(ctx, "queue", &sqs.QueueArgs{
			Name:          pulumi.String("pulumi-example-queue"),
			RedrivePolicy: pulumi.String(pulumi.String(json0)),
		})
		if err != nil {
			return err
		}
		exampleQueueDeadletter, err := sqs.NewQueue(ctx, "example_queue_deadletter", &sqs.QueueArgs{
			Name: pulumi.String("pulumi-example-deadletter-queue"),
		})
		if err != nil {
			return err
		}
		tmpJSON1, err := json.Marshal(map[string]interface{}{
			"redrivePermission": "byQueue",
			"sourceQueueArns": []interface{}{
				exampleQueue.Arn,
			},
		})
		if err != nil {
			return err
		}
		json1 := string(tmpJSON1)
		_, err = sqs.NewRedriveAllowPolicy(ctx, "example_queue_redrive_allow_policy", &sqs.RedriveAllowPolicyArgs{
			QueueUrl:           exampleQueueDeadletter.ID(),
			RedriveAllowPolicy: pulumi.String(pulumi.String(json1)),
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
    var queue = new Aws.Sqs.Queue("queue", new()
    {
        Name = "pulumi-example-queue",
        RedrivePolicy = JsonSerializer.Serialize(new Dictionary<string, object?>
        {
            ["deadLetterTargetArn"] = queueDeadletter.Arn,
            ["maxReceiveCount"] = 4,
        }),
    });

    var exampleQueueDeadletter = new Aws.Sqs.Queue("example_queue_deadletter", new()
    {
        Name = "pulumi-example-deadletter-queue",
    });

    var exampleQueueRedriveAllowPolicy = new Aws.Sqs.RedriveAllowPolicy("example_queue_redrive_allow_policy", new()
    {
        QueueUrl = exampleQueueDeadletter.Id,
        RedriveAllowPolicyName = JsonSerializer.Serialize(new Dictionary<string, object?>
        {
            ["redrivePermission"] = "byQueue",
            ["sourceQueueArns"] = new[]
            {
                exampleQueue.Arn,
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
import com.pulumi.aws.sqs.Queue;
import com.pulumi.aws.sqs.QueueArgs;
import com.pulumi.aws.sqs.RedriveAllowPolicy;
import com.pulumi.aws.sqs.RedriveAllowPolicyArgs;
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
        var queue = new Queue("queue", QueueArgs.builder()
            .name("pulumi-example-queue")
            .redrivePolicy(serializeJson(
                jsonObject(
                    jsonProperty("deadLetterTargetArn", queueDeadletter.arn()),
                    jsonProperty("maxReceiveCount", 4)
                )))
            .build());

        var exampleQueueDeadletter = new Queue("exampleQueueDeadletter", QueueArgs.builder()
            .name("pulumi-example-deadletter-queue")
            .build());

        var exampleQueueRedriveAllowPolicy = new RedriveAllowPolicy("exampleQueueRedriveAllowPolicy", RedriveAllowPolicyArgs.builder()
            .queueUrl(exampleQueueDeadletter.id())
            .redriveAllowPolicy(serializeJson(
                jsonObject(
                    jsonProperty("redrivePermission", "byQueue"),
                    jsonProperty("sourceQueueArns", jsonArray(exampleQueue.arn()))
                )))
            .build());

    }
}
```

```yaml
resources:
  queue:
    type: aws:sqs:Queue
    properties:
      name: pulumi-example-queue
      redrivePolicy:
        fn::toJSON:
          deadLetterTargetArn: ${queueDeadletter.arn}
          maxReceiveCount: 4
  exampleQueueDeadletter:
    type: aws:sqs:Queue
    name: example_queue_deadletter
    properties:
      name: pulumi-example-deadletter-queue
  exampleQueueRedriveAllowPolicy:
    type: aws:sqs:RedriveAllowPolicy
    name: example_queue_redrive_allow_policy
    properties:
      queueUrl: ${exampleQueueDeadletter.id}
      redriveAllowPolicy:
        fn::toJSON:
          redrivePermission: byQueue
          sourceQueueArns:
            - ${exampleQueue.arn}
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_sqs_queue" "queue" {
  name = "pulumi-example-queue"
  redrive_policy = jsonencode({
    "deadLetterTargetArn" = queueDeadletter.arn
    "maxReceiveCount"     = 4
  })
}
resource "aws_sqs_queue" "example_queue_deadletter" {
  name = "pulumi-example-deadletter-queue"
}
resource "aws_sqs_redriveallowpolicy" "example_queue_redrive_allow_policy" {
  queue_url = aws_sqs_queue.example_queue_deadletter.id
  redrive_allow_policy = jsonencode({
    "redrivePermission" = "byQueue"
    "sourceQueueArns"   = [exampleQueue.arn]
  })
}
```

## Server-side encryption (SSE)[](#server-side-encryption-sse)

Using [SSE-SQS](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-configure-sqs-sse-queue.html):

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

const queue = new aws.sqs.Queue("queue", {
    name: "pulumi-example-queue",
    sqsManagedSseEnabled: true,
});
```

```python
import pulumi
import pulumi_aws as aws

queue = aws.sqs.Queue("queue",
    name="pulumi-example-queue",
    sqs_managed_sse_enabled=True)
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/sqs"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		_, err := sqs.NewQueue(ctx, "queue", &sqs.QueueArgs{
			Name:                 pulumi.String("pulumi-example-queue"),
			SqsManagedSseEnabled: pulumi.Bool(true),
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
    var queue = new Aws.Sqs.Queue("queue", new()
    {
        Name = "pulumi-example-queue",
        SqsManagedSseEnabled = true,
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.sqs.Queue;
import com.pulumi.aws.sqs.QueueArgs;
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
        var queue = new Queue("queue", QueueArgs.builder()
            .name("pulumi-example-queue")
            .sqsManagedSseEnabled(true)
            .build());

    }
}
```

```yaml
resources:
  queue:
    type: aws:sqs:Queue
    properties:
      name: pulumi-example-queue
      sqsManagedSseEnabled: true
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_sqs_queue" "queue" {
  name                    = "pulumi-example-queue"
  sqs_managed_sse_enabled = true
}
```

Using [SSE-KMS](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-configure-sse-existing-queue.html):

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

const queue = new aws.sqs.Queue("queue", {
    name: "example-queue",
    kmsMasterKeyId: "alias/aws/sqs",
    kmsDataKeyReusePeriodSeconds: 300,
});
```

```python
import pulumi
import pulumi_aws as aws

queue = aws.sqs.Queue("queue",
    name="example-queue",
    kms_master_key_id="alias/aws/sqs",
    kms_data_key_reuse_period_seconds=300)
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/sqs"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		_, err := sqs.NewQueue(ctx, "queue", &sqs.QueueArgs{
			Name:                         pulumi.String("example-queue"),
			KmsMasterKeyId:               pulumi.String("alias/aws/sqs"),
			KmsDataKeyReusePeriodSeconds: pulumi.Int(300),
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
    var queue = new Aws.Sqs.Queue("queue", new()
    {
        Name = "example-queue",
        KmsMasterKeyId = "alias/aws/sqs",
        KmsDataKeyReusePeriodSeconds = 300,
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.sqs.Queue;
import com.pulumi.aws.sqs.QueueArgs;
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
        var queue = new Queue("queue", QueueArgs.builder()
            .name("example-queue")
            .kmsMasterKeyId("alias/aws/sqs")
            .kmsDataKeyReusePeriodSeconds(300)
            .build());

    }
}
```

```yaml
resources:
  queue:
    type: aws:sqs:Queue
    properties:
      name: example-queue
      kmsMasterKeyId: alias/aws/sqs
      kmsDataKeyReusePeriodSeconds: 300
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_sqs_queue" "queue" {
  name                              = "example-queue"
  kms_master_key_id                 = "alias/aws/sqs"
  kms_data_key_reuse_period_seconds = 300
}
```

## Create Queue Resource[](#create)

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
new Queue(name: string, args?: QueueArgs, opts?: CustomResourceOptions);
```

```python
@overload
def Queue(resource_name: str,
          args: Optional[QueueArgs] = None,
          opts: Optional[ResourceOptions] = None)

@overload
def Queue(resource_name: str,
          opts: Optional[ResourceOptions] = None,
          content_based_deduplication: Optional[bool] = None,
          deduplication_scope: Optional[str] = None,
          delay_seconds: Optional[int] = None,
          fifo_queue: Optional[bool] = None,
          fifo_throughput_limit: Optional[str] = None,
          kms_data_key_reuse_period_seconds: Optional[int] = None,
          kms_master_key_id: Optional[str] = None,
          max_message_size: Optional[int] = None,
          message_retention_seconds: Optional[int] = None,
          name: Optional[str] = None,
          name_prefix: Optional[str] = None,
          policy: Optional[str] = None,
          receive_wait_time_seconds: Optional[int] = None,
          redrive_allow_policy: Optional[str] = None,
          redrive_policy: Optional[str] = None,
          region: Optional[str] = None,
          sqs_managed_sse_enabled: Optional[bool] = None,
          tags: Optional[Mapping[str, str]] = None,
          visibility_timeout_seconds: Optional[int] = None)
```

```go
func NewQueue(ctx *Context, name string, args *QueueArgs, opts ...ResourceOption) (*Queue, error)
```

```csharp
public Queue(string name, QueueArgs? args = null, CustomResourceOptions? opts = null)
```

```java
public Queue(String name, QueueArgs args)
public Queue(String name, QueueArgs args, CustomResourceOptions options)
```

```yaml
type: aws:sqs:Queue
properties: # The arguments to resource properties.
options: # Bag of options to control resource's behavior.
```

```hcl
resource "aws_sqs_queue" "name" {
    # resource properties
}
```

#### Parameters[](#parameters)

name This property is required. string

The unique name of the resource.

args [QueueArgs](#inputs)

The arguments to resource properties.

opts [CustomResourceOptions](/docs/reference/pkg/nodejs/pulumi/pulumi/#CustomResourceOptions)

Bag of options to control resource's behavior.

resource\_name This property is required. str

The unique name of the resource.

args [QueueArgs](#inputs)

The arguments to resource properties.

opts [ResourceOptions](/docs/reference/pkg/python/pulumi/#pulumi.ResourceOptions)

Bag of options to control resource's behavior.

ctx [Context](https://pkg.go.dev/github.com/pulumi/pulumi/sdk/v3/go/pulumi?tab=doc#Context)

Context object for the current deployment.

name This property is required. string

The unique name of the resource.

args [QueueArgs](#inputs)

The arguments to resource properties.

opts [ResourceOption](https://pkg.go.dev/github.com/pulumi/pulumi/sdk/v3/go/pulumi?tab=doc#ResourceOption)

Bag of options to control resource's behavior.

name This property is required. string

The unique name of the resource.

args [QueueArgs](#inputs)

The arguments to resource properties.

opts [CustomResourceOptions](/docs/reference/pkg/dotnet/Pulumi/Pulumi.CustomResourceOptions.html)

Bag of options to control resource's behavior.

name This property is required. String

The unique name of the resource.

args This property is required. [QueueArgs](#inputs)

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
var examplequeueResourceResourceFromSqsqueue = new Aws.Sqs.Queue("examplequeueResourceResourceFromSqsqueue", new()
{
    ContentBasedDeduplication = false,
    DeduplicationScope = "string",
    DelaySeconds = 0,
    FifoQueue = false,
    FifoThroughputLimit = "string",
    KmsDataKeyReusePeriodSeconds = 0,
    KmsMasterKeyId = "string",
    MaxMessageSize = 0,
    MessageRetentionSeconds = 0,
    Name = "string",
    NamePrefix = "string",
    Policy = "string",
    ReceiveWaitTimeSeconds = 0,
    RedriveAllowPolicy = "string",
    RedrivePolicy = "string",
    Region = "string",
    SqsManagedSseEnabled = false,
    Tags =
    {
        { "string", "string" },
    },
    VisibilityTimeoutSeconds = 0,
});
```

```go
example, err := sqs.NewQueue(ctx, "examplequeueResourceResourceFromSqsqueue", &sqs.QueueArgs{
	ContentBasedDeduplication:    pulumi.Bool(false),
	DeduplicationScope:           pulumi.String("string"),
	DelaySeconds:                 pulumi.Int(0),
	FifoQueue:                    pulumi.Bool(false),
	FifoThroughputLimit:          pulumi.String("string"),
	KmsDataKeyReusePeriodSeconds: pulumi.Int(0),
	KmsMasterKeyId:               pulumi.String("string"),
	MaxMessageSize:               pulumi.Int(0),
	MessageRetentionSeconds:      pulumi.Int(0),
	Name:                         pulumi.String("string"),
	NamePrefix:                   pulumi.String("string"),
	Policy:                       pulumi.String("string"),
	ReceiveWaitTimeSeconds:       pulumi.Int(0),
	RedriveAllowPolicy:           pulumi.String("string"),
	RedrivePolicy:                pulumi.String("string"),
	Region:                       pulumi.String("string"),
	SqsManagedSseEnabled:         pulumi.Bool(false),
	Tags: pulumi.StringMap{
		"string": pulumi.String("string"),
	},
	VisibilityTimeoutSeconds: pulumi.Int(0),
})
```

```hcl
resource "aws_sqs_queue" "examplequeueResourceResourceFromSqsqueue" {
  content_based_deduplication       = false
  deduplication_scope               = "string"
  delay_seconds                     = 0
  fifo_queue                        = false
  fifo_throughput_limit             = "string"
  kms_data_key_reuse_period_seconds = 0
  kms_master_key_id                 = "string"
  max_message_size                  = 0
  message_retention_seconds         = 0
  name                              = "string"
  name_prefix                       = "string"
  policy                            = "string"
  receive_wait_time_seconds         = 0
  redrive_allow_policy              = "string"
  redrive_policy                    = "string"
  region                            = "string"
  sqs_managed_sse_enabled           = false
  tags = {
    "string" = "string"
  }
  visibility_timeout_seconds = 0
}
```

```java
var examplequeueResourceResourceFromSqsqueue = new com.pulumi.aws.sqs.Queue("examplequeueResourceResourceFromSqsqueue", com.pulumi.aws.sqs.QueueArgs.builder()
    .contentBasedDeduplication(false)
    .deduplicationScope("string")
    .delaySeconds(0)
    .fifoQueue(false)
    .fifoThroughputLimit("string")
    .kmsDataKeyReusePeriodSeconds(0)
    .kmsMasterKeyId("string")
    .maxMessageSize(0)
    .messageRetentionSeconds(0)
    .name("string")
    .namePrefix("string")
    .policy("string")
    .receiveWaitTimeSeconds(0)
    .redriveAllowPolicy("string")
    .redrivePolicy("string")
    .region("string")
    .sqsManagedSseEnabled(false)
    .tags(Map.of("string", "string"))
    .visibilityTimeoutSeconds(0)
    .build());
```

```python
examplequeue_resource_resource_from_sqsqueue = aws.sqs.Queue("examplequeueResourceResourceFromSqsqueue",
    content_based_deduplication=False,
    deduplication_scope="string",
    delay_seconds=0,
    fifo_queue=False,
    fifo_throughput_limit="string",
    kms_data_key_reuse_period_seconds=0,
    kms_master_key_id="string",
    max_message_size=0,
    message_retention_seconds=0,
    name="string",
    name_prefix="string",
    policy="string",
    receive_wait_time_seconds=0,
    redrive_allow_policy="string",
    redrive_policy="string",
    region="string",
    sqs_managed_sse_enabled=False,
    tags={
        "string": "string",
    },
    visibility_timeout_seconds=0)
```

```typescript
const examplequeueResourceResourceFromSqsqueue = new aws.sqs.Queue("examplequeueResourceResourceFromSqsqueue", {
    contentBasedDeduplication: false,
    deduplicationScope: "string",
    delaySeconds: 0,
    fifoQueue: false,
    fifoThroughputLimit: "string",
    kmsDataKeyReusePeriodSeconds: 0,
    kmsMasterKeyId: "string",
    maxMessageSize: 0,
    messageRetentionSeconds: 0,
    name: "string",
    namePrefix: "string",
    policy: "string",
    receiveWaitTimeSeconds: 0,
    redriveAllowPolicy: "string",
    redrivePolicy: "string",
    region: "string",
    sqsManagedSseEnabled: false,
    tags: {
        string: "string",
    },
    visibilityTimeoutSeconds: 0,
});
```

```yaml
type: aws:sqs:Queue
properties:
    contentBasedDeduplication: false
    deduplicationScope: string
    delaySeconds: 0
    fifoQueue: false
    fifoThroughputLimit: string
    kmsDataKeyReusePeriodSeconds: 0
    kmsMasterKeyId: string
    maxMessageSize: 0
    messageRetentionSeconds: 0
    name: string
    namePrefix: string
    policy: string
    receiveWaitTimeSeconds: 0
    redriveAllowPolicy: string
    redrivePolicy: string
    region: string
    sqsManagedSseEnabled: false
    tags:
        string: string
    visibilityTimeoutSeconds: 0
```

## Queue Resource Properties[](#properties)

To learn more about resource properties and how to use them, see [Inputs and Outputs](/docs/intro/concepts/inputs-outputs) in the Architecture and Concepts docs.

### Inputs[](#inputs)

In Python, inputs that are objects can be passed either as [argument classes or as dictionary literals](/docs/languages-sdks/python/#inputs-and-outputs).

The Queue resource accepts the following [input](/docs/intro/concepts/inputs-outputs) properties:

[ContentBasedDeduplication](#contentbaseddeduplication_csharp) bool

Enables content-based deduplication for FIFO queues. For more information, see the [related documentation](http://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/FIFO-queues.html#FIFO-queues-exactly-once-processing).

[DeduplicationScope](#deduplicationscope_csharp) string

Specifies whether message deduplication occurs at the message group or queue level. Valid values are `messageGroup` and `queue` (default).

[DelaySeconds](#delayseconds_csharp) int

Time in seconds that the delivery of all messages in the queue will be delayed. An integer from 0 to 900 (15 minutes). The default for this attribute is 0 seconds.

[FifoQueue](#fifoqueue_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. bool

Boolean designating a FIFO queue. If not set, it defaults to `false` making it standard.

[FifoThroughputLimit](#fifothroughputlimit_csharp) string

Specifies whether the FIFO queue throughput quota applies to the entire queue or per message group. Valid values are `perQueue` (default) and `perMessageGroupId`.

[KmsDataKeyReusePeriodSeconds](#kmsdatakeyreuseperiodseconds_csharp) int

Length of time, in seconds, for which Amazon SQS can reuse a data key to encrypt or decrypt messages before calling AWS KMS again. An integer representing seconds, between 60 seconds (1 minute) and 86,400 seconds (24 hours). The default is 300 (5 minutes).

[KmsMasterKeyId](#kmsmasterkeyid_csharp) string

ID of an AWS-managed customer master key (CMK) for Amazon SQS or a custom CMK. For more information, see [Key Terms](http://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-server-side-encryption.html#sqs-sse-key-terms).

[MaxMessageSize](#maxmessagesize_csharp) int

Limit of how many bytes a message can contain before Amazon SQS rejects it. An integer from 1024 bytes (1 KiB) up to 1048576 bytes (1024 KiB). The default for this attribute is 262144 (256 KiB).

[MessageRetentionSeconds](#messageretentionseconds_csharp) int

Number of seconds Amazon SQS retains a message. Integer representing seconds, from 60 (1 minute) to 1209600 (14 days). The default for this attribute is 345600 (4 days).

[Name](#name_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Name of the queue. Queue names must be made up of only uppercase and lowercase ASCII letters, numbers, underscores, and hyphens, and must be between 1 and 80 characters long. For a FIFO (first-in-first-out) queue, the name must end with the `.fifo` suffix. If omitted, the provider will assign a random, unique name. Conflicts with `namePrefix`.

[NamePrefix](#nameprefix_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[Policy](#policy_csharp) string

JSON policy for the SQS queue. For more information about building AWS IAM policy documents see the AWS IAM Policy Document Guide. The provider will only perform drift detection of its value when present in a configuration. It is preferred to use the `aws.sqs.QueuePolicy` resource instead.

[ReceiveWaitTimeSeconds](#receivewaittimeseconds_csharp) int

Time for which a ReceiveMessage call will wait for a message to arrive (long polling) before returning. An integer from 0 to 20 (seconds). The default for this attribute is 0, meaning that the call will return immediately.

[RedriveAllowPolicy](#redriveallowpolicy_csharp) string

JSON policy to set up the Dead Letter Queue redrive permission, see [AWS docs](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/SQSDeadLetterQueue.html). The provider will only perform drift detection of its value when present in a configuration. It is preferred to use the `aws.sqs.RedriveAllowPolicy` resource instead.

[RedrivePolicy](#redrivepolicy_csharp) string

JSON policy to set up the Dead Letter Queue, see [AWS docs](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/SQSDeadLetterQueue.html). The provider will only perform drift detection of its value when present in a configuration. It is preferred to use the `aws.sqs.RedrivePolicy` resource instead. **Note:** when specifying `maxReceiveCount`, you must specify it as an integer (`5`), and not a string (`"5"`).

[Region](#region_csharp) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[SqsManagedSseEnabled](#sqsmanagedsseenabled_csharp) bool

Boolean to enable server-side encryption (SSE) of message content with SQS-owned encryption keys. See [Encryption at rest](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-server-side-encryption.html). The provider will only perform drift detection of its value when present in a configuration.

[Tags](#tags_csharp) Dictionary<string, string>

Map of tags to assign to the queue. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[VisibilityTimeoutSeconds](#visibilitytimeoutseconds_csharp) int

Visibility timeout for the queue. An integer from 0 to 43200 (12 hours). The default for this attribute is 30. For more information about visibility timeout, see [AWS docs](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/AboutVT.html).

[ContentBasedDeduplication](#contentbaseddeduplication_go) bool

Enables content-based deduplication for FIFO queues. For more information, see the [related documentation](http://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/FIFO-queues.html#FIFO-queues-exactly-once-processing).

[DeduplicationScope](#deduplicationscope_go) string

Specifies whether message deduplication occurs at the message group or queue level. Valid values are `messageGroup` and `queue` (default).

[DelaySeconds](#delayseconds_go) int

Time in seconds that the delivery of all messages in the queue will be delayed. An integer from 0 to 900 (15 minutes). The default for this attribute is 0 seconds.

[FifoQueue](#fifoqueue_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. bool

Boolean designating a FIFO queue. If not set, it defaults to `false` making it standard.

[FifoThroughputLimit](#fifothroughputlimit_go) string

Specifies whether the FIFO queue throughput quota applies to the entire queue or per message group. Valid values are `perQueue` (default) and `perMessageGroupId`.

[KmsDataKeyReusePeriodSeconds](#kmsdatakeyreuseperiodseconds_go) int

Length of time, in seconds, for which Amazon SQS can reuse a data key to encrypt or decrypt messages before calling AWS KMS again. An integer representing seconds, between 60 seconds (1 minute) and 86,400 seconds (24 hours). The default is 300 (5 minutes).

[KmsMasterKeyId](#kmsmasterkeyid_go) string

ID of an AWS-managed customer master key (CMK) for Amazon SQS or a custom CMK. For more information, see [Key Terms](http://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-server-side-encryption.html#sqs-sse-key-terms).

[MaxMessageSize](#maxmessagesize_go) int

Limit of how many bytes a message can contain before Amazon SQS rejects it. An integer from 1024 bytes (1 KiB) up to 1048576 bytes (1024 KiB). The default for this attribute is 262144 (256 KiB).

[MessageRetentionSeconds](#messageretentionseconds_go) int

Number of seconds Amazon SQS retains a message. Integer representing seconds, from 60 (1 minute) to 1209600 (14 days). The default for this attribute is 345600 (4 days).

[Name](#name_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Name of the queue. Queue names must be made up of only uppercase and lowercase ASCII letters, numbers, underscores, and hyphens, and must be between 1 and 80 characters long. For a FIFO (first-in-first-out) queue, the name must end with the `.fifo` suffix. If omitted, the provider will assign a random, unique name. Conflicts with `namePrefix`.

[NamePrefix](#nameprefix_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[Policy](#policy_go) string

JSON policy for the SQS queue. For more information about building AWS IAM policy documents see the AWS IAM Policy Document Guide. The provider will only perform drift detection of its value when present in a configuration. It is preferred to use the `aws.sqs.QueuePolicy` resource instead.

[ReceiveWaitTimeSeconds](#receivewaittimeseconds_go) int

Time for which a ReceiveMessage call will wait for a message to arrive (long polling) before returning. An integer from 0 to 20 (seconds). The default for this attribute is 0, meaning that the call will return immediately.

[RedriveAllowPolicy](#redriveallowpolicy_go) string

JSON policy to set up the Dead Letter Queue redrive permission, see [AWS docs](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/SQSDeadLetterQueue.html). The provider will only perform drift detection of its value when present in a configuration. It is preferred to use the `aws.sqs.RedriveAllowPolicy` resource instead.

[RedrivePolicy](#redrivepolicy_go) string

JSON policy to set up the Dead Letter Queue, see [AWS docs](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/SQSDeadLetterQueue.html). The provider will only perform drift detection of its value when present in a configuration. It is preferred to use the `aws.sqs.RedrivePolicy` resource instead. **Note:** when specifying `maxReceiveCount`, you must specify it as an integer (`5`), and not a string (`"5"`).

[Region](#region_go) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[SqsManagedSseEnabled](#sqsmanagedsseenabled_go) bool

Boolean to enable server-side encryption (SSE) of message content with SQS-owned encryption keys. See [Encryption at rest](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-server-side-encryption.html). The provider will only perform drift detection of its value when present in a configuration.

[Tags](#tags_go) map\[string\]string

Map of tags to assign to the queue. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[VisibilityTimeoutSeconds](#visibilitytimeoutseconds_go) int

Visibility timeout for the queue. An integer from 0 to 43200 (12 hours). The default for this attribute is 30. For more information about visibility timeout, see [AWS docs](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/AboutVT.html).

[content\_based\_deduplication](#content_based_deduplication_hcl) bool

Enables content-based deduplication for FIFO queues. For more information, see the [related documentation](http://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/FIFO-queues.html#FIFO-queues-exactly-once-processing).

[deduplication\_scope](#deduplication_scope_hcl) string

Specifies whether message deduplication occurs at the message group or queue level. Valid values are `messageGroup` and `queue` (default).

[delay\_seconds](#delay_seconds_hcl) number

Time in seconds that the delivery of all messages in the queue will be delayed. An integer from 0 to 900 (15 minutes). The default for this attribute is 0 seconds.

[fifo\_queue](#fifo_queue_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. bool

Boolean designating a FIFO queue. If not set, it defaults to `false` making it standard.

[fifo\_throughput\_limit](#fifo_throughput_limit_hcl) string

Specifies whether the FIFO queue throughput quota applies to the entire queue or per message group. Valid values are `perQueue` (default) and `perMessageGroupId`.

[kms\_data\_key\_reuse\_period\_seconds](#kms_data_key_reuse_period_seconds_hcl) number

Length of time, in seconds, for which Amazon SQS can reuse a data key to encrypt or decrypt messages before calling AWS KMS again. An integer representing seconds, between 60 seconds (1 minute) and 86,400 seconds (24 hours). The default is 300 (5 minutes).

[kms\_master\_key\_id](#kms_master_key_id_hcl) string

ID of an AWS-managed customer master key (CMK) for Amazon SQS or a custom CMK. For more information, see [Key Terms](http://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-server-side-encryption.html#sqs-sse-key-terms).

[max\_message\_size](#max_message_size_hcl) number

Limit of how many bytes a message can contain before Amazon SQS rejects it. An integer from 1024 bytes (1 KiB) up to 1048576 bytes (1024 KiB). The default for this attribute is 262144 (256 KiB).

[message\_retention\_seconds](#message_retention_seconds_hcl) number

Number of seconds Amazon SQS retains a message. Integer representing seconds, from 60 (1 minute) to 1209600 (14 days). The default for this attribute is 345600 (4 days).

[name](#name_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Name of the queue. Queue names must be made up of only uppercase and lowercase ASCII letters, numbers, underscores, and hyphens, and must be between 1 and 80 characters long. For a FIFO (first-in-first-out) queue, the name must end with the `.fifo` suffix. If omitted, the provider will assign a random, unique name. Conflicts with `namePrefix`.

[name\_prefix](#name_prefix_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[policy](#policy_hcl) string

JSON policy for the SQS queue. For more information about building AWS IAM policy documents see the AWS IAM Policy Document Guide. The provider will only perform drift detection of its value when present in a configuration. It is preferred to use the `aws.sqs.QueuePolicy` resource instead.

[receive\_wait\_time\_seconds](#receive_wait_time_seconds_hcl) number

Time for which a ReceiveMessage call will wait for a message to arrive (long polling) before returning. An integer from 0 to 20 (seconds). The default for this attribute is 0, meaning that the call will return immediately.

[redrive\_allow\_policy](#redrive_allow_policy_hcl) string

JSON policy to set up the Dead Letter Queue redrive permission, see [AWS docs](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/SQSDeadLetterQueue.html). The provider will only perform drift detection of its value when present in a configuration. It is preferred to use the `aws.sqs.RedriveAllowPolicy` resource instead.

[redrive\_policy](#redrive_policy_hcl) string

JSON policy to set up the Dead Letter Queue, see [AWS docs](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/SQSDeadLetterQueue.html). The provider will only perform drift detection of its value when present in a configuration. It is preferred to use the `aws.sqs.RedrivePolicy` resource instead. **Note:** when specifying `maxReceiveCount`, you must specify it as an integer (`5`), and not a string (`"5"`).

[region](#region_hcl) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[sqs\_managed\_sse\_enabled](#sqs_managed_sse_enabled_hcl) bool

Boolean to enable server-side encryption (SSE) of message content with SQS-owned encryption keys. See [Encryption at rest](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-server-side-encryption.html). The provider will only perform drift detection of its value when present in a configuration.

[tags](#tags_hcl) map(string)

Map of tags to assign to the queue. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[visibility\_timeout\_seconds](#visibility_timeout_seconds_hcl) number

Visibility timeout for the queue. An integer from 0 to 43200 (12 hours). The default for this attribute is 30. For more information about visibility timeout, see [AWS docs](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/AboutVT.html).

[contentBasedDeduplication](#contentbaseddeduplication_java) Boolean

Enables content-based deduplication for FIFO queues. For more information, see the [related documentation](http://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/FIFO-queues.html#FIFO-queues-exactly-once-processing).

[deduplicationScope](#deduplicationscope_java) String

Specifies whether message deduplication occurs at the message group or queue level. Valid values are `messageGroup` and `queue` (default).

[delaySeconds](#delayseconds_java) Integer

Time in seconds that the delivery of all messages in the queue will be delayed. An integer from 0 to 900 (15 minutes). The default for this attribute is 0 seconds.

[fifoQueue](#fifoqueue_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. Boolean

Boolean designating a FIFO queue. If not set, it defaults to `false` making it standard.

[fifoThroughputLimit](#fifothroughputlimit_java) String

Specifies whether the FIFO queue throughput quota applies to the entire queue or per message group. Valid values are `perQueue` (default) and `perMessageGroupId`.

[kmsDataKeyReusePeriodSeconds](#kmsdatakeyreuseperiodseconds_java) Integer

Length of time, in seconds, for which Amazon SQS can reuse a data key to encrypt or decrypt messages before calling AWS KMS again. An integer representing seconds, between 60 seconds (1 minute) and 86,400 seconds (24 hours). The default is 300 (5 minutes).

[kmsMasterKeyId](#kmsmasterkeyid_java) String

ID of an AWS-managed customer master key (CMK) for Amazon SQS or a custom CMK. For more information, see [Key Terms](http://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-server-side-encryption.html#sqs-sse-key-terms).

[maxMessageSize](#maxmessagesize_java) Integer

Limit of how many bytes a message can contain before Amazon SQS rejects it. An integer from 1024 bytes (1 KiB) up to 1048576 bytes (1024 KiB). The default for this attribute is 262144 (256 KiB).

[messageRetentionSeconds](#messageretentionseconds_java) Integer

Number of seconds Amazon SQS retains a message. Integer representing seconds, from 60 (1 minute) to 1209600 (14 days). The default for this attribute is 345600 (4 days).

[name](#name_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Name of the queue. Queue names must be made up of only uppercase and lowercase ASCII letters, numbers, underscores, and hyphens, and must be between 1 and 80 characters long. For a FIFO (first-in-first-out) queue, the name must end with the `.fifo` suffix. If omitted, the provider will assign a random, unique name. Conflicts with `namePrefix`.

[namePrefix](#nameprefix_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[policy](#policy_java) String

JSON policy for the SQS queue. For more information about building AWS IAM policy documents see the AWS IAM Policy Document Guide. The provider will only perform drift detection of its value when present in a configuration. It is preferred to use the `aws.sqs.QueuePolicy` resource instead.

[receiveWaitTimeSeconds](#receivewaittimeseconds_java) Integer

Time for which a ReceiveMessage call will wait for a message to arrive (long polling) before returning. An integer from 0 to 20 (seconds). The default for this attribute is 0, meaning that the call will return immediately.

[redriveAllowPolicy](#redriveallowpolicy_java) String

JSON policy to set up the Dead Letter Queue redrive permission, see [AWS docs](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/SQSDeadLetterQueue.html). The provider will only perform drift detection of its value when present in a configuration. It is preferred to use the `aws.sqs.RedriveAllowPolicy` resource instead.

[redrivePolicy](#redrivepolicy_java) String

JSON policy to set up the Dead Letter Queue, see [AWS docs](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/SQSDeadLetterQueue.html). The provider will only perform drift detection of its value when present in a configuration. It is preferred to use the `aws.sqs.RedrivePolicy` resource instead. **Note:** when specifying `maxReceiveCount`, you must specify it as an integer (`5`), and not a string (`"5"`).

[region](#region_java) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[sqsManagedSseEnabled](#sqsmanagedsseenabled_java) Boolean

Boolean to enable server-side encryption (SSE) of message content with SQS-owned encryption keys. See [Encryption at rest](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-server-side-encryption.html). The provider will only perform drift detection of its value when present in a configuration.

[tags](#tags_java) Map<String,String>

Map of tags to assign to the queue. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[visibilityTimeoutSeconds](#visibilitytimeoutseconds_java) Integer

Visibility timeout for the queue. An integer from 0 to 43200 (12 hours). The default for this attribute is 30. For more information about visibility timeout, see [AWS docs](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/AboutVT.html).

[contentBasedDeduplication](#contentbaseddeduplication_nodejs) boolean

Enables content-based deduplication for FIFO queues. For more information, see the [related documentation](http://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/FIFO-queues.html#FIFO-queues-exactly-once-processing).

[deduplicationScope](#deduplicationscope_nodejs) string

Specifies whether message deduplication occurs at the message group or queue level. Valid values are `messageGroup` and `queue` (default).

[delaySeconds](#delayseconds_nodejs) number

Time in seconds that the delivery of all messages in the queue will be delayed. An integer from 0 to 900 (15 minutes). The default for this attribute is 0 seconds.

[fifoQueue](#fifoqueue_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. boolean

Boolean designating a FIFO queue. If not set, it defaults to `false` making it standard.

[fifoThroughputLimit](#fifothroughputlimit_nodejs) string

Specifies whether the FIFO queue throughput quota applies to the entire queue or per message group. Valid values are `perQueue` (default) and `perMessageGroupId`.

[kmsDataKeyReusePeriodSeconds](#kmsdatakeyreuseperiodseconds_nodejs) number

Length of time, in seconds, for which Amazon SQS can reuse a data key to encrypt or decrypt messages before calling AWS KMS again. An integer representing seconds, between 60 seconds (1 minute) and 86,400 seconds (24 hours). The default is 300 (5 minutes).

[kmsMasterKeyId](#kmsmasterkeyid_nodejs) string

ID of an AWS-managed customer master key (CMK) for Amazon SQS or a custom CMK. For more information, see [Key Terms](http://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-server-side-encryption.html#sqs-sse-key-terms).

[maxMessageSize](#maxmessagesize_nodejs) number

Limit of how many bytes a message can contain before Amazon SQS rejects it. An integer from 1024 bytes (1 KiB) up to 1048576 bytes (1024 KiB). The default for this attribute is 262144 (256 KiB).

[messageRetentionSeconds](#messageretentionseconds_nodejs) number

Number of seconds Amazon SQS retains a message. Integer representing seconds, from 60 (1 minute) to 1209600 (14 days). The default for this attribute is 345600 (4 days).

[name](#name_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Name of the queue. Queue names must be made up of only uppercase and lowercase ASCII letters, numbers, underscores, and hyphens, and must be between 1 and 80 characters long. For a FIFO (first-in-first-out) queue, the name must end with the `.fifo` suffix. If omitted, the provider will assign a random, unique name. Conflicts with `namePrefix`.

[namePrefix](#nameprefix_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[policy](#policy_nodejs) string

JSON policy for the SQS queue. For more information about building AWS IAM policy documents see the AWS IAM Policy Document Guide. The provider will only perform drift detection of its value when present in a configuration. It is preferred to use the `aws.sqs.QueuePolicy` resource instead.

[receiveWaitTimeSeconds](#receivewaittimeseconds_nodejs) number

Time for which a ReceiveMessage call will wait for a message to arrive (long polling) before returning. An integer from 0 to 20 (seconds). The default for this attribute is 0, meaning that the call will return immediately.

[redriveAllowPolicy](#redriveallowpolicy_nodejs) string

JSON policy to set up the Dead Letter Queue redrive permission, see [AWS docs](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/SQSDeadLetterQueue.html). The provider will only perform drift detection of its value when present in a configuration. It is preferred to use the `aws.sqs.RedriveAllowPolicy` resource instead.

[redrivePolicy](#redrivepolicy_nodejs) string

JSON policy to set up the Dead Letter Queue, see [AWS docs](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/SQSDeadLetterQueue.html). The provider will only perform drift detection of its value when present in a configuration. It is preferred to use the `aws.sqs.RedrivePolicy` resource instead. **Note:** when specifying `maxReceiveCount`, you must specify it as an integer (`5`), and not a string (`"5"`).

[region](#region_nodejs) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[sqsManagedSseEnabled](#sqsmanagedsseenabled_nodejs) boolean

Boolean to enable server-side encryption (SSE) of message content with SQS-owned encryption keys. See [Encryption at rest](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-server-side-encryption.html). The provider will only perform drift detection of its value when present in a configuration.

[tags](#tags_nodejs) {\[key: string\]: string}

Map of tags to assign to the queue. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[visibilityTimeoutSeconds](#visibilitytimeoutseconds_nodejs) number

Visibility timeout for the queue. An integer from 0 to 43200 (12 hours). The default for this attribute is 30. For more information about visibility timeout, see [AWS docs](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/AboutVT.html).

[content\_based\_deduplication](#content_based_deduplication_python) bool

Enables content-based deduplication for FIFO queues. For more information, see the [related documentation](http://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/FIFO-queues.html#FIFO-queues-exactly-once-processing).

[deduplication\_scope](#deduplication_scope_python) str

Specifies whether message deduplication occurs at the message group or queue level. Valid values are `messageGroup` and `queue` (default).

[delay\_seconds](#delay_seconds_python) int

Time in seconds that the delivery of all messages in the queue will be delayed. An integer from 0 to 900 (15 minutes). The default for this attribute is 0 seconds.

[fifo\_queue](#fifo_queue_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. bool

Boolean designating a FIFO queue. If not set, it defaults to `false` making it standard.

[fifo\_throughput\_limit](#fifo_throughput_limit_python) str

Specifies whether the FIFO queue throughput quota applies to the entire queue or per message group. Valid values are `perQueue` (default) and `perMessageGroupId`.

[kms\_data\_key\_reuse\_period\_seconds](#kms_data_key_reuse_period_seconds_python) int

Length of time, in seconds, for which Amazon SQS can reuse a data key to encrypt or decrypt messages before calling AWS KMS again. An integer representing seconds, between 60 seconds (1 minute) and 86,400 seconds (24 hours). The default is 300 (5 minutes).

[kms\_master\_key\_id](#kms_master_key_id_python) str

ID of an AWS-managed customer master key (CMK) for Amazon SQS or a custom CMK. For more information, see [Key Terms](http://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-server-side-encryption.html#sqs-sse-key-terms).

[max\_message\_size](#max_message_size_python) int

Limit of how many bytes a message can contain before Amazon SQS rejects it. An integer from 1024 bytes (1 KiB) up to 1048576 bytes (1024 KiB). The default for this attribute is 262144 (256 KiB).

[message\_retention\_seconds](#message_retention_seconds_python) int

Number of seconds Amazon SQS retains a message. Integer representing seconds, from 60 (1 minute) to 1209600 (14 days). The default for this attribute is 345600 (4 days).

[name](#name_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Name of the queue. Queue names must be made up of only uppercase and lowercase ASCII letters, numbers, underscores, and hyphens, and must be between 1 and 80 characters long. For a FIFO (first-in-first-out) queue, the name must end with the `.fifo` suffix. If omitted, the provider will assign a random, unique name. Conflicts with `namePrefix`.

[name\_prefix](#name_prefix_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[policy](#policy_python) str

JSON policy for the SQS queue. For more information about building AWS IAM policy documents see the AWS IAM Policy Document Guide. The provider will only perform drift detection of its value when present in a configuration. It is preferred to use the `aws.sqs.QueuePolicy` resource instead.

[receive\_wait\_time\_seconds](#receive_wait_time_seconds_python) int

Time for which a ReceiveMessage call will wait for a message to arrive (long polling) before returning. An integer from 0 to 20 (seconds). The default for this attribute is 0, meaning that the call will return immediately.

[redrive\_allow\_policy](#redrive_allow_policy_python) str

JSON policy to set up the Dead Letter Queue redrive permission, see [AWS docs](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/SQSDeadLetterQueue.html). The provider will only perform drift detection of its value when present in a configuration. It is preferred to use the `aws.sqs.RedriveAllowPolicy` resource instead.

[redrive\_policy](#redrive_policy_python) str

JSON policy to set up the Dead Letter Queue, see [AWS docs](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/SQSDeadLetterQueue.html). The provider will only perform drift detection of its value when present in a configuration. It is preferred to use the `aws.sqs.RedrivePolicy` resource instead. **Note:** when specifying `maxReceiveCount`, you must specify it as an integer (`5`), and not a string (`"5"`).

[region](#region_python) str

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[sqs\_managed\_sse\_enabled](#sqs_managed_sse_enabled_python) bool

Boolean to enable server-side encryption (SSE) of message content with SQS-owned encryption keys. See [Encryption at rest](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-server-side-encryption.html). The provider will only perform drift detection of its value when present in a configuration.

[tags](#tags_python) Mapping\[str, str\]

Map of tags to assign to the queue. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[visibility\_timeout\_seconds](#visibility_timeout_seconds_python) int

Visibility timeout for the queue. An integer from 0 to 43200 (12 hours). The default for this attribute is 30. For more information about visibility timeout, see [AWS docs](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/AboutVT.html).

[contentBasedDeduplication](#contentbaseddeduplication_yaml) Boolean

Enables content-based deduplication for FIFO queues. For more information, see the [related documentation](http://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/FIFO-queues.html#FIFO-queues-exactly-once-processing).

[deduplicationScope](#deduplicationscope_yaml) String

Specifies whether message deduplication occurs at the message group or queue level. Valid values are `messageGroup` and `queue` (default).

[delaySeconds](#delayseconds_yaml) Number

Time in seconds that the delivery of all messages in the queue will be delayed. An integer from 0 to 900 (15 minutes). The default for this attribute is 0 seconds.

[fifoQueue](#fifoqueue_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. Boolean

Boolean designating a FIFO queue. If not set, it defaults to `false` making it standard.

[fifoThroughputLimit](#fifothroughputlimit_yaml) String

Specifies whether the FIFO queue throughput quota applies to the entire queue or per message group. Valid values are `perQueue` (default) and `perMessageGroupId`.

[kmsDataKeyReusePeriodSeconds](#kmsdatakeyreuseperiodseconds_yaml) Number

Length of time, in seconds, for which Amazon SQS can reuse a data key to encrypt or decrypt messages before calling AWS KMS again. An integer representing seconds, between 60 seconds (1 minute) and 86,400 seconds (24 hours). The default is 300 (5 minutes).

[kmsMasterKeyId](#kmsmasterkeyid_yaml) String

ID of an AWS-managed customer master key (CMK) for Amazon SQS or a custom CMK. For more information, see [Key Terms](http://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-server-side-encryption.html#sqs-sse-key-terms).

[maxMessageSize](#maxmessagesize_yaml) Number

Limit of how many bytes a message can contain before Amazon SQS rejects it. An integer from 1024 bytes (1 KiB) up to 1048576 bytes (1024 KiB). The default for this attribute is 262144 (256 KiB).

[messageRetentionSeconds](#messageretentionseconds_yaml) Number

Number of seconds Amazon SQS retains a message. Integer representing seconds, from 60 (1 minute) to 1209600 (14 days). The default for this attribute is 345600 (4 days).

[name](#name_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Name of the queue. Queue names must be made up of only uppercase and lowercase ASCII letters, numbers, underscores, and hyphens, and must be between 1 and 80 characters long. For a FIFO (first-in-first-out) queue, the name must end with the `.fifo` suffix. If omitted, the provider will assign a random, unique name. Conflicts with `namePrefix`.

[namePrefix](#nameprefix_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[policy](#policy_yaml) String

JSON policy for the SQS queue. For more information about building AWS IAM policy documents see the AWS IAM Policy Document Guide. The provider will only perform drift detection of its value when present in a configuration. It is preferred to use the `aws.sqs.QueuePolicy` resource instead.

[receiveWaitTimeSeconds](#receivewaittimeseconds_yaml) Number

Time for which a ReceiveMessage call will wait for a message to arrive (long polling) before returning. An integer from 0 to 20 (seconds). The default for this attribute is 0, meaning that the call will return immediately.

[redriveAllowPolicy](#redriveallowpolicy_yaml) String

JSON policy to set up the Dead Letter Queue redrive permission, see [AWS docs](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/SQSDeadLetterQueue.html). The provider will only perform drift detection of its value when present in a configuration. It is preferred to use the `aws.sqs.RedriveAllowPolicy` resource instead.

[redrivePolicy](#redrivepolicy_yaml) String

JSON policy to set up the Dead Letter Queue, see [AWS docs](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/SQSDeadLetterQueue.html). The provider will only perform drift detection of its value when present in a configuration. It is preferred to use the `aws.sqs.RedrivePolicy` resource instead. **Note:** when specifying `maxReceiveCount`, you must specify it as an integer (`5`), and not a string (`"5"`).

[region](#region_yaml) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[sqsManagedSseEnabled](#sqsmanagedsseenabled_yaml) Boolean

Boolean to enable server-side encryption (SSE) of message content with SQS-owned encryption keys. See [Encryption at rest](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-server-side-encryption.html). The provider will only perform drift detection of its value when present in a configuration.

[tags](#tags_yaml) Map<String>

Map of tags to assign to the queue. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[visibilityTimeoutSeconds](#visibilitytimeoutseconds_yaml) Number

Visibility timeout for the queue. An integer from 0 to 43200 (12 hours). The default for this attribute is 30. For more information about visibility timeout, see [AWS docs](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/AboutVT.html).

### Outputs[](#outputs)

All [input](#inputs) properties are implicitly available as output properties. Additionally, the Queue resource produces the following output properties:

[Arn](#arn_csharp) string

ARN of the SQS queue.

[Id](#id_csharp) string

The provider-assigned unique ID for this managed resource.

[TagsAll](#tagsall_csharp) Dictionary<string, string>

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[Url](#url_csharp) string

Same as `id`: The URL for the created Amazon SQS queue.

[Arn](#arn_go) string

ARN of the SQS queue.

[Id](#id_go) string

The provider-assigned unique ID for this managed resource.

[TagsAll](#tagsall_go) map\[string\]string

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[Url](#url_go) string

Same as `id`: The URL for the created Amazon SQS queue.

[arn](#arn_hcl) string

ARN of the SQS queue.

[id](#id_hcl) string

The provider-assigned unique ID for this managed resource.

[tags\_all](#tags_all_hcl) map(string)

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[url](#url_hcl) string

Same as `id`: The URL for the created Amazon SQS queue.

[arn](#arn_java) String

ARN of the SQS queue.

[id](#id_java) String

The provider-assigned unique ID for this managed resource.

[tagsAll](#tagsall_java) Map<String,String>

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[url](#url_java) String

Same as `id`: The URL for the created Amazon SQS queue.

[arn](#arn_nodejs) string

ARN of the SQS queue.

[id](#id_nodejs) string

The provider-assigned unique ID for this managed resource.

[tagsAll](#tagsall_nodejs) {\[key: string\]: string}

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[url](#url_nodejs) string

Same as `id`: The URL for the created Amazon SQS queue.

[arn](#arn_python) str

ARN of the SQS queue.

[id](#id_python) str

The provider-assigned unique ID for this managed resource.

[tags\_all](#tags_all_python) Mapping\[str, str\]

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[url](#url_python) str

Same as `id`: The URL for the created Amazon SQS queue.

[arn](#arn_yaml) String

ARN of the SQS queue.

[id](#id_yaml) String

The provider-assigned unique ID for this managed resource.

[tagsAll](#tagsall_yaml) Map<String>

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[url](#url_yaml) String

Same as `id`: The URL for the created Amazon SQS queue.

## Look up Existing Queue Resource[](#look-up)

Get an existing Queue resource’s state with the given name, ID, and optional extra properties used to qualify the lookup.

-   TypeScript
-   Python
-   Go
-   C#
-   Java
-   YAML
-   HCL PREVIEW

```typescript
public static get(name: string, id: Input<ID>, state?: QueueState, opts?: CustomResourceOptions): Queue
```

```python
@staticmethod
def get(resource_name: str,
        id: str,
        opts: Optional[ResourceOptions] = None,
        arn: Optional[str] = None,
        content_based_deduplication: Optional[bool] = None,
        deduplication_scope: Optional[str] = None,
        delay_seconds: Optional[int] = None,
        fifo_queue: Optional[bool] = None,
        fifo_throughput_limit: Optional[str] = None,
        kms_data_key_reuse_period_seconds: Optional[int] = None,
        kms_master_key_id: Optional[str] = None,
        max_message_size: Optional[int] = None,
        message_retention_seconds: Optional[int] = None,
        name: Optional[str] = None,
        name_prefix: Optional[str] = None,
        policy: Optional[str] = None,
        receive_wait_time_seconds: Optional[int] = None,
        redrive_allow_policy: Optional[str] = None,
        redrive_policy: Optional[str] = None,
        region: Optional[str] = None,
        sqs_managed_sse_enabled: Optional[bool] = None,
        tags: Optional[Mapping[str, str]] = None,
        tags_all: Optional[Mapping[str, str]] = None,
        url: Optional[str] = None,
        visibility_timeout_seconds: Optional[int] = None) -> Queue
```

```go
func GetQueue(ctx *Context, name string, id IDInput, state *QueueState, opts ...ResourceOption) (*Queue, error)
```

```csharp
public static Queue Get(string name, Input<string> id, QueueState? state, CustomResourceOptions? opts = null)
```

```java
public static Queue get(String name, Output<String> id, QueueState state, CustomResourceOptions options)
```

```yaml
resources:  _:    type: aws:sqs:Queue    get:      id: ${id}
```

```hcl
import {
  to = aws_sqs_queue.example
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

[Arn](#state_arn_csharp) string

ARN of the SQS queue.

[ContentBasedDeduplication](#state_contentbaseddeduplication_csharp) bool

Enables content-based deduplication for FIFO queues. For more information, see the [related documentation](http://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/FIFO-queues.html#FIFO-queues-exactly-once-processing).

[DeduplicationScope](#state_deduplicationscope_csharp) string

Specifies whether message deduplication occurs at the message group or queue level. Valid values are `messageGroup` and `queue` (default).

[DelaySeconds](#state_delayseconds_csharp) int

Time in seconds that the delivery of all messages in the queue will be delayed. An integer from 0 to 900 (15 minutes). The default for this attribute is 0 seconds.

[FifoQueue](#state_fifoqueue_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. bool

Boolean designating a FIFO queue. If not set, it defaults to `false` making it standard.

[FifoThroughputLimit](#state_fifothroughputlimit_csharp) string

Specifies whether the FIFO queue throughput quota applies to the entire queue or per message group. Valid values are `perQueue` (default) and `perMessageGroupId`.

[KmsDataKeyReusePeriodSeconds](#state_kmsdatakeyreuseperiodseconds_csharp) int

Length of time, in seconds, for which Amazon SQS can reuse a data key to encrypt or decrypt messages before calling AWS KMS again. An integer representing seconds, between 60 seconds (1 minute) and 86,400 seconds (24 hours). The default is 300 (5 minutes).

[KmsMasterKeyId](#state_kmsmasterkeyid_csharp) string

ID of an AWS-managed customer master key (CMK) for Amazon SQS or a custom CMK. For more information, see [Key Terms](http://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-server-side-encryption.html#sqs-sse-key-terms).

[MaxMessageSize](#state_maxmessagesize_csharp) int

Limit of how many bytes a message can contain before Amazon SQS rejects it. An integer from 1024 bytes (1 KiB) up to 1048576 bytes (1024 KiB). The default for this attribute is 262144 (256 KiB).

[MessageRetentionSeconds](#state_messageretentionseconds_csharp) int

Number of seconds Amazon SQS retains a message. Integer representing seconds, from 60 (1 minute) to 1209600 (14 days). The default for this attribute is 345600 (4 days).

[Name](#state_name_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Name of the queue. Queue names must be made up of only uppercase and lowercase ASCII letters, numbers, underscores, and hyphens, and must be between 1 and 80 characters long. For a FIFO (first-in-first-out) queue, the name must end with the `.fifo` suffix. If omitted, the provider will assign a random, unique name. Conflicts with `namePrefix`.

[NamePrefix](#state_nameprefix_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[Policy](#state_policy_csharp) string

JSON policy for the SQS queue. For more information about building AWS IAM policy documents see the AWS IAM Policy Document Guide. The provider will only perform drift detection of its value when present in a configuration. It is preferred to use the `aws.sqs.QueuePolicy` resource instead.

[ReceiveWaitTimeSeconds](#state_receivewaittimeseconds_csharp) int

Time for which a ReceiveMessage call will wait for a message to arrive (long polling) before returning. An integer from 0 to 20 (seconds). The default for this attribute is 0, meaning that the call will return immediately.

[RedriveAllowPolicy](#state_redriveallowpolicy_csharp) string

JSON policy to set up the Dead Letter Queue redrive permission, see [AWS docs](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/SQSDeadLetterQueue.html). The provider will only perform drift detection of its value when present in a configuration. It is preferred to use the `aws.sqs.RedriveAllowPolicy` resource instead.

[RedrivePolicy](#state_redrivepolicy_csharp) string

JSON policy to set up the Dead Letter Queue, see [AWS docs](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/SQSDeadLetterQueue.html). The provider will only perform drift detection of its value when present in a configuration. It is preferred to use the `aws.sqs.RedrivePolicy` resource instead. **Note:** when specifying `maxReceiveCount`, you must specify it as an integer (`5`), and not a string (`"5"`).

[Region](#state_region_csharp) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[SqsManagedSseEnabled](#state_sqsmanagedsseenabled_csharp) bool

Boolean to enable server-side encryption (SSE) of message content with SQS-owned encryption keys. See [Encryption at rest](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-server-side-encryption.html). The provider will only perform drift detection of its value when present in a configuration.

[Tags](#state_tags_csharp) Dictionary<string, string>

Map of tags to assign to the queue. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[TagsAll](#state_tagsall_csharp) Dictionary<string, string>

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[Url](#state_url_csharp) string

Same as `id`: The URL for the created Amazon SQS queue.

[VisibilityTimeoutSeconds](#state_visibilitytimeoutseconds_csharp) int

Visibility timeout for the queue. An integer from 0 to 43200 (12 hours). The default for this attribute is 30. For more information about visibility timeout, see [AWS docs](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/AboutVT.html).

[Arn](#state_arn_go) string

ARN of the SQS queue.

[ContentBasedDeduplication](#state_contentbaseddeduplication_go) bool

Enables content-based deduplication for FIFO queues. For more information, see the [related documentation](http://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/FIFO-queues.html#FIFO-queues-exactly-once-processing).

[DeduplicationScope](#state_deduplicationscope_go) string

Specifies whether message deduplication occurs at the message group or queue level. Valid values are `messageGroup` and `queue` (default).

[DelaySeconds](#state_delayseconds_go) int

Time in seconds that the delivery of all messages in the queue will be delayed. An integer from 0 to 900 (15 minutes). The default for this attribute is 0 seconds.

[FifoQueue](#state_fifoqueue_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. bool

Boolean designating a FIFO queue. If not set, it defaults to `false` making it standard.

[FifoThroughputLimit](#state_fifothroughputlimit_go) string

Specifies whether the FIFO queue throughput quota applies to the entire queue or per message group. Valid values are `perQueue` (default) and `perMessageGroupId`.

[KmsDataKeyReusePeriodSeconds](#state_kmsdatakeyreuseperiodseconds_go) int

Length of time, in seconds, for which Amazon SQS can reuse a data key to encrypt or decrypt messages before calling AWS KMS again. An integer representing seconds, between 60 seconds (1 minute) and 86,400 seconds (24 hours). The default is 300 (5 minutes).

[KmsMasterKeyId](#state_kmsmasterkeyid_go) string

ID of an AWS-managed customer master key (CMK) for Amazon SQS or a custom CMK. For more information, see [Key Terms](http://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-server-side-encryption.html#sqs-sse-key-terms).

[MaxMessageSize](#state_maxmessagesize_go) int

Limit of how many bytes a message can contain before Amazon SQS rejects it. An integer from 1024 bytes (1 KiB) up to 1048576 bytes (1024 KiB). The default for this attribute is 262144 (256 KiB).

[MessageRetentionSeconds](#state_messageretentionseconds_go) int

Number of seconds Amazon SQS retains a message. Integer representing seconds, from 60 (1 minute) to 1209600 (14 days). The default for this attribute is 345600 (4 days).

[Name](#state_name_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Name of the queue. Queue names must be made up of only uppercase and lowercase ASCII letters, numbers, underscores, and hyphens, and must be between 1 and 80 characters long. For a FIFO (first-in-first-out) queue, the name must end with the `.fifo` suffix. If omitted, the provider will assign a random, unique name. Conflicts with `namePrefix`.

[NamePrefix](#state_nameprefix_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[Policy](#state_policy_go) string

JSON policy for the SQS queue. For more information about building AWS IAM policy documents see the AWS IAM Policy Document Guide. The provider will only perform drift detection of its value when present in a configuration. It is preferred to use the `aws.sqs.QueuePolicy` resource instead.

[ReceiveWaitTimeSeconds](#state_receivewaittimeseconds_go) int

Time for which a ReceiveMessage call will wait for a message to arrive (long polling) before returning. An integer from 0 to 20 (seconds). The default for this attribute is 0, meaning that the call will return immediately.

[RedriveAllowPolicy](#state_redriveallowpolicy_go) string

JSON policy to set up the Dead Letter Queue redrive permission, see [AWS docs](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/SQSDeadLetterQueue.html). The provider will only perform drift detection of its value when present in a configuration. It is preferred to use the `aws.sqs.RedriveAllowPolicy` resource instead.

[RedrivePolicy](#state_redrivepolicy_go) string

JSON policy to set up the Dead Letter Queue, see [AWS docs](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/SQSDeadLetterQueue.html). The provider will only perform drift detection of its value when present in a configuration. It is preferred to use the `aws.sqs.RedrivePolicy` resource instead. **Note:** when specifying `maxReceiveCount`, you must specify it as an integer (`5`), and not a string (`"5"`).

[Region](#state_region_go) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[SqsManagedSseEnabled](#state_sqsmanagedsseenabled_go) bool

Boolean to enable server-side encryption (SSE) of message content with SQS-owned encryption keys. See [Encryption at rest](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-server-side-encryption.html). The provider will only perform drift detection of its value when present in a configuration.

[Tags](#state_tags_go) map\[string\]string

Map of tags to assign to the queue. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[TagsAll](#state_tagsall_go) map\[string\]string

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[Url](#state_url_go) string

Same as `id`: The URL for the created Amazon SQS queue.

[VisibilityTimeoutSeconds](#state_visibilitytimeoutseconds_go) int

Visibility timeout for the queue. An integer from 0 to 43200 (12 hours). The default for this attribute is 30. For more information about visibility timeout, see [AWS docs](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/AboutVT.html).

[arn](#state_arn_hcl) string

ARN of the SQS queue.

[content\_based\_deduplication](#state_content_based_deduplication_hcl) bool

Enables content-based deduplication for FIFO queues. For more information, see the [related documentation](http://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/FIFO-queues.html#FIFO-queues-exactly-once-processing).

[deduplication\_scope](#state_deduplication_scope_hcl) string

Specifies whether message deduplication occurs at the message group or queue level. Valid values are `messageGroup` and `queue` (default).

[delay\_seconds](#state_delay_seconds_hcl) number

Time in seconds that the delivery of all messages in the queue will be delayed. An integer from 0 to 900 (15 minutes). The default for this attribute is 0 seconds.

[fifo\_queue](#state_fifo_queue_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. bool

Boolean designating a FIFO queue. If not set, it defaults to `false` making it standard.

[fifo\_throughput\_limit](#state_fifo_throughput_limit_hcl) string

Specifies whether the FIFO queue throughput quota applies to the entire queue or per message group. Valid values are `perQueue` (default) and `perMessageGroupId`.

[kms\_data\_key\_reuse\_period\_seconds](#state_kms_data_key_reuse_period_seconds_hcl) number

Length of time, in seconds, for which Amazon SQS can reuse a data key to encrypt or decrypt messages before calling AWS KMS again. An integer representing seconds, between 60 seconds (1 minute) and 86,400 seconds (24 hours). The default is 300 (5 minutes).

[kms\_master\_key\_id](#state_kms_master_key_id_hcl) string

ID of an AWS-managed customer master key (CMK) for Amazon SQS or a custom CMK. For more information, see [Key Terms](http://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-server-side-encryption.html#sqs-sse-key-terms).

[max\_message\_size](#state_max_message_size_hcl) number

Limit of how many bytes a message can contain before Amazon SQS rejects it. An integer from 1024 bytes (1 KiB) up to 1048576 bytes (1024 KiB). The default for this attribute is 262144 (256 KiB).

[message\_retention\_seconds](#state_message_retention_seconds_hcl) number

Number of seconds Amazon SQS retains a message. Integer representing seconds, from 60 (1 minute) to 1209600 (14 days). The default for this attribute is 345600 (4 days).

[name](#state_name_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Name of the queue. Queue names must be made up of only uppercase and lowercase ASCII letters, numbers, underscores, and hyphens, and must be between 1 and 80 characters long. For a FIFO (first-in-first-out) queue, the name must end with the `.fifo` suffix. If omitted, the provider will assign a random, unique name. Conflicts with `namePrefix`.

[name\_prefix](#state_name_prefix_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[policy](#state_policy_hcl) string

JSON policy for the SQS queue. For more information about building AWS IAM policy documents see the AWS IAM Policy Document Guide. The provider will only perform drift detection of its value when present in a configuration. It is preferred to use the `aws.sqs.QueuePolicy` resource instead.

[receive\_wait\_time\_seconds](#state_receive_wait_time_seconds_hcl) number

Time for which a ReceiveMessage call will wait for a message to arrive (long polling) before returning. An integer from 0 to 20 (seconds). The default for this attribute is 0, meaning that the call will return immediately.

[redrive\_allow\_policy](#state_redrive_allow_policy_hcl) string

JSON policy to set up the Dead Letter Queue redrive permission, see [AWS docs](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/SQSDeadLetterQueue.html). The provider will only perform drift detection of its value when present in a configuration. It is preferred to use the `aws.sqs.RedriveAllowPolicy` resource instead.

[redrive\_policy](#state_redrive_policy_hcl) string

JSON policy to set up the Dead Letter Queue, see [AWS docs](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/SQSDeadLetterQueue.html). The provider will only perform drift detection of its value when present in a configuration. It is preferred to use the `aws.sqs.RedrivePolicy` resource instead. **Note:** when specifying `maxReceiveCount`, you must specify it as an integer (`5`), and not a string (`"5"`).

[region](#state_region_hcl) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[sqs\_managed\_sse\_enabled](#state_sqs_managed_sse_enabled_hcl) bool

Boolean to enable server-side encryption (SSE) of message content with SQS-owned encryption keys. See [Encryption at rest](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-server-side-encryption.html). The provider will only perform drift detection of its value when present in a configuration.

[tags](#state_tags_hcl) map(string)

Map of tags to assign to the queue. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tags\_all](#state_tags_all_hcl) map(string)

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[url](#state_url_hcl) string

Same as `id`: The URL for the created Amazon SQS queue.

[visibility\_timeout\_seconds](#state_visibility_timeout_seconds_hcl) number

Visibility timeout for the queue. An integer from 0 to 43200 (12 hours). The default for this attribute is 30. For more information about visibility timeout, see [AWS docs](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/AboutVT.html).

[arn](#state_arn_java) String

ARN of the SQS queue.

[contentBasedDeduplication](#state_contentbaseddeduplication_java) Boolean

Enables content-based deduplication for FIFO queues. For more information, see the [related documentation](http://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/FIFO-queues.html#FIFO-queues-exactly-once-processing).

[deduplicationScope](#state_deduplicationscope_java) String

Specifies whether message deduplication occurs at the message group or queue level. Valid values are `messageGroup` and `queue` (default).

[delaySeconds](#state_delayseconds_java) Integer

Time in seconds that the delivery of all messages in the queue will be delayed. An integer from 0 to 900 (15 minutes). The default for this attribute is 0 seconds.

[fifoQueue](#state_fifoqueue_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. Boolean

Boolean designating a FIFO queue. If not set, it defaults to `false` making it standard.

[fifoThroughputLimit](#state_fifothroughputlimit_java) String

Specifies whether the FIFO queue throughput quota applies to the entire queue or per message group. Valid values are `perQueue` (default) and `perMessageGroupId`.

[kmsDataKeyReusePeriodSeconds](#state_kmsdatakeyreuseperiodseconds_java) Integer

Length of time, in seconds, for which Amazon SQS can reuse a data key to encrypt or decrypt messages before calling AWS KMS again. An integer representing seconds, between 60 seconds (1 minute) and 86,400 seconds (24 hours). The default is 300 (5 minutes).

[kmsMasterKeyId](#state_kmsmasterkeyid_java) String

ID of an AWS-managed customer master key (CMK) for Amazon SQS or a custom CMK. For more information, see [Key Terms](http://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-server-side-encryption.html#sqs-sse-key-terms).

[maxMessageSize](#state_maxmessagesize_java) Integer

Limit of how many bytes a message can contain before Amazon SQS rejects it. An integer from 1024 bytes (1 KiB) up to 1048576 bytes (1024 KiB). The default for this attribute is 262144 (256 KiB).

[messageRetentionSeconds](#state_messageretentionseconds_java) Integer

Number of seconds Amazon SQS retains a message. Integer representing seconds, from 60 (1 minute) to 1209600 (14 days). The default for this attribute is 345600 (4 days).

[name](#state_name_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Name of the queue. Queue names must be made up of only uppercase and lowercase ASCII letters, numbers, underscores, and hyphens, and must be between 1 and 80 characters long. For a FIFO (first-in-first-out) queue, the name must end with the `.fifo` suffix. If omitted, the provider will assign a random, unique name. Conflicts with `namePrefix`.

[namePrefix](#state_nameprefix_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[policy](#state_policy_java) String

JSON policy for the SQS queue. For more information about building AWS IAM policy documents see the AWS IAM Policy Document Guide. The provider will only perform drift detection of its value when present in a configuration. It is preferred to use the `aws.sqs.QueuePolicy` resource instead.

[receiveWaitTimeSeconds](#state_receivewaittimeseconds_java) Integer

Time for which a ReceiveMessage call will wait for a message to arrive (long polling) before returning. An integer from 0 to 20 (seconds). The default for this attribute is 0, meaning that the call will return immediately.

[redriveAllowPolicy](#state_redriveallowpolicy_java) String

JSON policy to set up the Dead Letter Queue redrive permission, see [AWS docs](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/SQSDeadLetterQueue.html). The provider will only perform drift detection of its value when present in a configuration. It is preferred to use the `aws.sqs.RedriveAllowPolicy` resource instead.

[redrivePolicy](#state_redrivepolicy_java) String

JSON policy to set up the Dead Letter Queue, see [AWS docs](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/SQSDeadLetterQueue.html). The provider will only perform drift detection of its value when present in a configuration. It is preferred to use the `aws.sqs.RedrivePolicy` resource instead. **Note:** when specifying `maxReceiveCount`, you must specify it as an integer (`5`), and not a string (`"5"`).

[region](#state_region_java) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[sqsManagedSseEnabled](#state_sqsmanagedsseenabled_java) Boolean

Boolean to enable server-side encryption (SSE) of message content with SQS-owned encryption keys. See [Encryption at rest](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-server-side-encryption.html). The provider will only perform drift detection of its value when present in a configuration.

[tags](#state_tags_java) Map<String,String>

Map of tags to assign to the queue. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tagsAll](#state_tagsall_java) Map<String,String>

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[url](#state_url_java) String

Same as `id`: The URL for the created Amazon SQS queue.

[visibilityTimeoutSeconds](#state_visibilitytimeoutseconds_java) Integer

Visibility timeout for the queue. An integer from 0 to 43200 (12 hours). The default for this attribute is 30. For more information about visibility timeout, see [AWS docs](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/AboutVT.html).

[arn](#state_arn_nodejs) string

ARN of the SQS queue.

[contentBasedDeduplication](#state_contentbaseddeduplication_nodejs) boolean

Enables content-based deduplication for FIFO queues. For more information, see the [related documentation](http://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/FIFO-queues.html#FIFO-queues-exactly-once-processing).

[deduplicationScope](#state_deduplicationscope_nodejs) string

Specifies whether message deduplication occurs at the message group or queue level. Valid values are `messageGroup` and `queue` (default).

[delaySeconds](#state_delayseconds_nodejs) number

Time in seconds that the delivery of all messages in the queue will be delayed. An integer from 0 to 900 (15 minutes). The default for this attribute is 0 seconds.

[fifoQueue](#state_fifoqueue_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. boolean

Boolean designating a FIFO queue. If not set, it defaults to `false` making it standard.

[fifoThroughputLimit](#state_fifothroughputlimit_nodejs) string

Specifies whether the FIFO queue throughput quota applies to the entire queue or per message group. Valid values are `perQueue` (default) and `perMessageGroupId`.

[kmsDataKeyReusePeriodSeconds](#state_kmsdatakeyreuseperiodseconds_nodejs) number

Length of time, in seconds, for which Amazon SQS can reuse a data key to encrypt or decrypt messages before calling AWS KMS again. An integer representing seconds, between 60 seconds (1 minute) and 86,400 seconds (24 hours). The default is 300 (5 minutes).

[kmsMasterKeyId](#state_kmsmasterkeyid_nodejs) string

ID of an AWS-managed customer master key (CMK) for Amazon SQS or a custom CMK. For more information, see [Key Terms](http://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-server-side-encryption.html#sqs-sse-key-terms).

[maxMessageSize](#state_maxmessagesize_nodejs) number

Limit of how many bytes a message can contain before Amazon SQS rejects it. An integer from 1024 bytes (1 KiB) up to 1048576 bytes (1024 KiB). The default for this attribute is 262144 (256 KiB).

[messageRetentionSeconds](#state_messageretentionseconds_nodejs) number

Number of seconds Amazon SQS retains a message. Integer representing seconds, from 60 (1 minute) to 1209600 (14 days). The default for this attribute is 345600 (4 days).

[name](#state_name_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Name of the queue. Queue names must be made up of only uppercase and lowercase ASCII letters, numbers, underscores, and hyphens, and must be between 1 and 80 characters long. For a FIFO (first-in-first-out) queue, the name must end with the `.fifo` suffix. If omitted, the provider will assign a random, unique name. Conflicts with `namePrefix`.

[namePrefix](#state_nameprefix_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[policy](#state_policy_nodejs) string

JSON policy for the SQS queue. For more information about building AWS IAM policy documents see the AWS IAM Policy Document Guide. The provider will only perform drift detection of its value when present in a configuration. It is preferred to use the `aws.sqs.QueuePolicy` resource instead.

[receiveWaitTimeSeconds](#state_receivewaittimeseconds_nodejs) number

Time for which a ReceiveMessage call will wait for a message to arrive (long polling) before returning. An integer from 0 to 20 (seconds). The default for this attribute is 0, meaning that the call will return immediately.

[redriveAllowPolicy](#state_redriveallowpolicy_nodejs) string

JSON policy to set up the Dead Letter Queue redrive permission, see [AWS docs](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/SQSDeadLetterQueue.html). The provider will only perform drift detection of its value when present in a configuration. It is preferred to use the `aws.sqs.RedriveAllowPolicy` resource instead.

[redrivePolicy](#state_redrivepolicy_nodejs) string

JSON policy to set up the Dead Letter Queue, see [AWS docs](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/SQSDeadLetterQueue.html). The provider will only perform drift detection of its value when present in a configuration. It is preferred to use the `aws.sqs.RedrivePolicy` resource instead. **Note:** when specifying `maxReceiveCount`, you must specify it as an integer (`5`), and not a string (`"5"`).

[region](#state_region_nodejs) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[sqsManagedSseEnabled](#state_sqsmanagedsseenabled_nodejs) boolean

Boolean to enable server-side encryption (SSE) of message content with SQS-owned encryption keys. See [Encryption at rest](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-server-side-encryption.html). The provider will only perform drift detection of its value when present in a configuration.

[tags](#state_tags_nodejs) {\[key: string\]: string}

Map of tags to assign to the queue. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tagsAll](#state_tagsall_nodejs) {\[key: string\]: string}

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[url](#state_url_nodejs) string

Same as `id`: The URL for the created Amazon SQS queue.

[visibilityTimeoutSeconds](#state_visibilitytimeoutseconds_nodejs) number

Visibility timeout for the queue. An integer from 0 to 43200 (12 hours). The default for this attribute is 30. For more information about visibility timeout, see [AWS docs](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/AboutVT.html).

[arn](#state_arn_python) str

ARN of the SQS queue.

[content\_based\_deduplication](#state_content_based_deduplication_python) bool

Enables content-based deduplication for FIFO queues. For more information, see the [related documentation](http://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/FIFO-queues.html#FIFO-queues-exactly-once-processing).

[deduplication\_scope](#state_deduplication_scope_python) str

Specifies whether message deduplication occurs at the message group or queue level. Valid values are `messageGroup` and `queue` (default).

[delay\_seconds](#state_delay_seconds_python) int

Time in seconds that the delivery of all messages in the queue will be delayed. An integer from 0 to 900 (15 minutes). The default for this attribute is 0 seconds.

[fifo\_queue](#state_fifo_queue_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. bool

Boolean designating a FIFO queue. If not set, it defaults to `false` making it standard.

[fifo\_throughput\_limit](#state_fifo_throughput_limit_python) str

Specifies whether the FIFO queue throughput quota applies to the entire queue or per message group. Valid values are `perQueue` (default) and `perMessageGroupId`.

[kms\_data\_key\_reuse\_period\_seconds](#state_kms_data_key_reuse_period_seconds_python) int

Length of time, in seconds, for which Amazon SQS can reuse a data key to encrypt or decrypt messages before calling AWS KMS again. An integer representing seconds, between 60 seconds (1 minute) and 86,400 seconds (24 hours). The default is 300 (5 minutes).

[kms\_master\_key\_id](#state_kms_master_key_id_python) str

ID of an AWS-managed customer master key (CMK) for Amazon SQS or a custom CMK. For more information, see [Key Terms](http://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-server-side-encryption.html#sqs-sse-key-terms).

[max\_message\_size](#state_max_message_size_python) int

Limit of how many bytes a message can contain before Amazon SQS rejects it. An integer from 1024 bytes (1 KiB) up to 1048576 bytes (1024 KiB). The default for this attribute is 262144 (256 KiB).

[message\_retention\_seconds](#state_message_retention_seconds_python) int

Number of seconds Amazon SQS retains a message. Integer representing seconds, from 60 (1 minute) to 1209600 (14 days). The default for this attribute is 345600 (4 days).

[name](#state_name_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Name of the queue. Queue names must be made up of only uppercase and lowercase ASCII letters, numbers, underscores, and hyphens, and must be between 1 and 80 characters long. For a FIFO (first-in-first-out) queue, the name must end with the `.fifo` suffix. If omitted, the provider will assign a random, unique name. Conflicts with `namePrefix`.

[name\_prefix](#state_name_prefix_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[policy](#state_policy_python) str

JSON policy for the SQS queue. For more information about building AWS IAM policy documents see the AWS IAM Policy Document Guide. The provider will only perform drift detection of its value when present in a configuration. It is preferred to use the `aws.sqs.QueuePolicy` resource instead.

[receive\_wait\_time\_seconds](#state_receive_wait_time_seconds_python) int

Time for which a ReceiveMessage call will wait for a message to arrive (long polling) before returning. An integer from 0 to 20 (seconds). The default for this attribute is 0, meaning that the call will return immediately.

[redrive\_allow\_policy](#state_redrive_allow_policy_python) str

JSON policy to set up the Dead Letter Queue redrive permission, see [AWS docs](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/SQSDeadLetterQueue.html). The provider will only perform drift detection of its value when present in a configuration. It is preferred to use the `aws.sqs.RedriveAllowPolicy` resource instead.

[redrive\_policy](#state_redrive_policy_python) str

JSON policy to set up the Dead Letter Queue, see [AWS docs](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/SQSDeadLetterQueue.html). The provider will only perform drift detection of its value when present in a configuration. It is preferred to use the `aws.sqs.RedrivePolicy` resource instead. **Note:** when specifying `maxReceiveCount`, you must specify it as an integer (`5`), and not a string (`"5"`).

[region](#state_region_python) str

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[sqs\_managed\_sse\_enabled](#state_sqs_managed_sse_enabled_python) bool

Boolean to enable server-side encryption (SSE) of message content with SQS-owned encryption keys. See [Encryption at rest](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-server-side-encryption.html). The provider will only perform drift detection of its value when present in a configuration.

[tags](#state_tags_python) Mapping\[str, str\]

Map of tags to assign to the queue. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tags\_all](#state_tags_all_python) Mapping\[str, str\]

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[url](#state_url_python) str

Same as `id`: The URL for the created Amazon SQS queue.

[visibility\_timeout\_seconds](#state_visibility_timeout_seconds_python) int

Visibility timeout for the queue. An integer from 0 to 43200 (12 hours). The default for this attribute is 30. For more information about visibility timeout, see [AWS docs](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/AboutVT.html).

[arn](#state_arn_yaml) String

ARN of the SQS queue.

[contentBasedDeduplication](#state_contentbaseddeduplication_yaml) Boolean

Enables content-based deduplication for FIFO queues. For more information, see the [related documentation](http://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/FIFO-queues.html#FIFO-queues-exactly-once-processing).

[deduplicationScope](#state_deduplicationscope_yaml) String

Specifies whether message deduplication occurs at the message group or queue level. Valid values are `messageGroup` and `queue` (default).

[delaySeconds](#state_delayseconds_yaml) Number

Time in seconds that the delivery of all messages in the queue will be delayed. An integer from 0 to 900 (15 minutes). The default for this attribute is 0 seconds.

[fifoQueue](#state_fifoqueue_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. Boolean

Boolean designating a FIFO queue. If not set, it defaults to `false` making it standard.

[fifoThroughputLimit](#state_fifothroughputlimit_yaml) String

Specifies whether the FIFO queue throughput quota applies to the entire queue or per message group. Valid values are `perQueue` (default) and `perMessageGroupId`.

[kmsDataKeyReusePeriodSeconds](#state_kmsdatakeyreuseperiodseconds_yaml) Number

Length of time, in seconds, for which Amazon SQS can reuse a data key to encrypt or decrypt messages before calling AWS KMS again. An integer representing seconds, between 60 seconds (1 minute) and 86,400 seconds (24 hours). The default is 300 (5 minutes).

[kmsMasterKeyId](#state_kmsmasterkeyid_yaml) String

ID of an AWS-managed customer master key (CMK) for Amazon SQS or a custom CMK. For more information, see [Key Terms](http://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-server-side-encryption.html#sqs-sse-key-terms).

[maxMessageSize](#state_maxmessagesize_yaml) Number

Limit of how many bytes a message can contain before Amazon SQS rejects it. An integer from 1024 bytes (1 KiB) up to 1048576 bytes (1024 KiB). The default for this attribute is 262144 (256 KiB).

[messageRetentionSeconds](#state_messageretentionseconds_yaml) Number

Number of seconds Amazon SQS retains a message. Integer representing seconds, from 60 (1 minute) to 1209600 (14 days). The default for this attribute is 345600 (4 days).

[name](#state_name_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Name of the queue. Queue names must be made up of only uppercase and lowercase ASCII letters, numbers, underscores, and hyphens, and must be between 1 and 80 characters long. For a FIFO (first-in-first-out) queue, the name must end with the `.fifo` suffix. If omitted, the provider will assign a random, unique name. Conflicts with `namePrefix`.

[namePrefix](#state_nameprefix_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Creates a unique name beginning with the specified prefix. Conflicts with `name`.

[policy](#state_policy_yaml) String

JSON policy for the SQS queue. For more information about building AWS IAM policy documents see the AWS IAM Policy Document Guide. The provider will only perform drift detection of its value when present in a configuration. It is preferred to use the `aws.sqs.QueuePolicy` resource instead.

[receiveWaitTimeSeconds](#state_receivewaittimeseconds_yaml) Number

Time for which a ReceiveMessage call will wait for a message to arrive (long polling) before returning. An integer from 0 to 20 (seconds). The default for this attribute is 0, meaning that the call will return immediately.

[redriveAllowPolicy](#state_redriveallowpolicy_yaml) String

JSON policy to set up the Dead Letter Queue redrive permission, see [AWS docs](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/SQSDeadLetterQueue.html). The provider will only perform drift detection of its value when present in a configuration. It is preferred to use the `aws.sqs.RedriveAllowPolicy` resource instead.

[redrivePolicy](#state_redrivepolicy_yaml) String

JSON policy to set up the Dead Letter Queue, see [AWS docs](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/SQSDeadLetterQueue.html). The provider will only perform drift detection of its value when present in a configuration. It is preferred to use the `aws.sqs.RedrivePolicy` resource instead. **Note:** when specifying `maxReceiveCount`, you must specify it as an integer (`5`), and not a string (`"5"`).

[region](#state_region_yaml) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[sqsManagedSseEnabled](#state_sqsmanagedsseenabled_yaml) Boolean

Boolean to enable server-side encryption (SSE) of message content with SQS-owned encryption keys. See [Encryption at rest](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-server-side-encryption.html). The provider will only perform drift detection of its value when present in a configuration.

[tags](#state_tags_yaml) Map<String>

Map of tags to assign to the queue. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tagsAll](#state_tagsall_yaml) Map<String>

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[url](#state_url_yaml) String

Same as `id`: The URL for the created Amazon SQS queue.

[visibilityTimeoutSeconds](#state_visibilitytimeoutseconds_yaml) Number

Visibility timeout for the queue. An integer from 0 to 43200 (12 hours). The default for this attribute is 30. For more information about visibility timeout, see [AWS docs](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/AboutVT.html).

## Import[](#import)

### Identity Schema[](#identity-schema)

#### Required[](#required)

-   `url` (String) URL of the SQS queue.

Using `pulumi import`, import SQS Queues using the queue `url`. For example:

```bash
$ pulumi import aws:sqs/queue:Queue example https://queue.amazonaws.com/80398EXAMPLE/MyQueue
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

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2fsqs%2fqueue]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2fsqs%2fqueue%2f\))

#### Try Pulumi Cloud free.
Your team will thank you.

[Start free trial](https://app.pulumi.com/signup?utm_source=registry&utm_medium=right-rail-banner&utm_campaign=try-pulumi-cloud&iaid=docs-try-pulumi-cloud-ad)
