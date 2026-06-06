---
Source: https://www.pulumi.com/registry/packages/aws/api-docs/sns/topic/
Generated: 2026-06-06
Updated: 2026-06-06
---

# aws.sns.Topic

1.  [Packages](/registry/)
2.  [Packages](/registry/packages/)
3.  [AWS](/registry/packages/aws/)
4.  [API Docs](/registry/packages/aws/api-docs/)
5.  [sns](/registry/packages/aws/api-docs/sns/)
6.  [Topic](/registry/packages/aws/api-docs/sns/topic/)

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

Viewing docs for AWS v7.32.0
published on Friday, May 29, 2026 by Pulumi

[Schema (JSON)](/registry/packages/aws/schema.json)

[pulumi/pulumi-aws](https://github.com/pulumi/pulumi-aws)

v7.32.0 (7.x, latest)v6.83.1 (6.x)v5.43.0 (5.x)

# aws.sns.Topic[](#aws-sns-topic)

Explore with Neo

-   Copy Page

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2fsns%2ftopic]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2fsns%2ftopic%2f\))

Provides an SNS topic resource

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

const userUpdates = new aws.sns.Topic("user_updates", {name: "user-updates-topic"});
```

```python
import pulumi
import pulumi_aws as aws

user_updates = aws.sns.Topic("user_updates", name="user-updates-topic")
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/sns"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		_, err := sns.NewTopic(ctx, "user_updates", &sns.TopicArgs{
			Name: pulumi.String("user-updates-topic"),
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
    var userUpdates = new Aws.Sns.Topic("user_updates", new()
    {
        Name = "user-updates-topic",
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.sns.Topic;
import com.pulumi.aws.sns.TopicArgs;
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
        var userUpdates = new Topic("userUpdates", TopicArgs.builder()
            .name("user-updates-topic")
            .build());

    }
}
```

```yaml
resources:
  userUpdates:
    type: aws:sns:Topic
    name: user_updates
    properties:
      name: user-updates-topic
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_sns_topic" "user_updates" {
  name = "user-updates-topic"
}
```

## Example with Delivery Policy[](#example-with-delivery-policy)

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

const userUpdates = new aws.sns.Topic("user_updates", {
    name: "user-updates-topic",
    deliveryPolicy: `{
  \\"http\\": {
    \\"defaultHealthyRetryPolicy\\": {
      \\"minDelayTarget\\": 20,
      \\"maxDelayTarget\\": 20,
      \\"numRetries\\": 3,
      \\"numMaxDelayRetries\\": 0,
      \\"numNoDelayRetries\\": 0,
      \\"numMinDelayRetries\\": 0,
      \\"backoffFunction\\": \\"linear\\"
    },
    \\"disableSubscriptionOverrides\\": false,
    \\"defaultThrottlePolicy\\": {
      \\"maxReceivesPerSecond\\": 1
    }
  }
}
`,
});
```

```python
import pulumi
import pulumi_aws as aws

user_updates = aws.sns.Topic("user_updates",
    name="user-updates-topic",
    delivery_policy="""{
  \"http\": {
    \"defaultHealthyRetryPolicy\": {
      \"minDelayTarget\": 20,
      \"maxDelayTarget\": 20,
      \"numRetries\": 3,
      \"numMaxDelayRetries\": 0,
      \"numNoDelayRetries\": 0,
      \"numMinDelayRetries\": 0,
      \"backoffFunction\": \"linear\"
    },
    \"disableSubscriptionOverrides\": false,
    \"defaultThrottlePolicy\": {
      \"maxReceivesPerSecond\": 1
    }
  }
}
""")
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/sns"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		_, err := sns.NewTopic(ctx, "user_updates", &sns.TopicArgs{
			Name: pulumi.String("user-updates-topic"),
			DeliveryPolicy: pulumi.String(`{
  \"http\": {
    \"defaultHealthyRetryPolicy\": {
      \"minDelayTarget\": 20,
      \"maxDelayTarget\": 20,
      \"numRetries\": 3,
      \"numMaxDelayRetries\": 0,
      \"numNoDelayRetries\": 0,
      \"numMinDelayRetries\": 0,
      \"backoffFunction\": \"linear\"
    },
    \"disableSubscriptionOverrides\": false,
    \"defaultThrottlePolicy\": {
      \"maxReceivesPerSecond\": 1
    }
  }
}
`),
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
    var userUpdates = new Aws.Sns.Topic("user_updates", new()
    {
        Name = "user-updates-topic",
        DeliveryPolicy = @"{
  \""http\"": {
    \""defaultHealthyRetryPolicy\"": {
      \""minDelayTarget\"": 20,
      \""maxDelayTarget\"": 20,
      \""numRetries\"": 3,
      \""numMaxDelayRetries\"": 0,
      \""numNoDelayRetries\"": 0,
      \""numMinDelayRetries\"": 0,
      \""backoffFunction\"": \""linear\""
    },
    \""disableSubscriptionOverrides\"": false,
    \""defaultThrottlePolicy\"": {
      \""maxReceivesPerSecond\"": 1
    }
  }
}
",
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.sns.Topic;
import com.pulumi.aws.sns.TopicArgs;
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
        var userUpdates = new Topic("userUpdates", TopicArgs.builder()
            .name("user-updates-topic")
            .deliveryPolicy("""
{
  \"http\": {
    \"defaultHealthyRetryPolicy\": {
      \"minDelayTarget\": 20,
      \"maxDelayTarget\": 20,
      \"numRetries\": 3,
      \"numMaxDelayRetries\": 0,
      \"numNoDelayRetries\": 0,
      \"numMinDelayRetries\": 0,
      \"backoffFunction\": \"linear\"
    },
    \"disableSubscriptionOverrides\": false,
    \"defaultThrottlePolicy\": {
      \"maxReceivesPerSecond\": 1
    }
  }
}
            """)
            .build());

    }
}
```

```yaml
resources:
  userUpdates:
    type: aws:sns:Topic
    name: user_updates
    properties:
      name: user-updates-topic
      deliveryPolicy: |
        {
          \"http\": {
            \"defaultHealthyRetryPolicy\": {
              \"minDelayTarget\": 20,
              \"maxDelayTarget\": 20,
              \"numRetries\": 3,
              \"numMaxDelayRetries\": 0,
              \"numNoDelayRetries\": 0,
              \"numMinDelayRetries\": 0,
              \"backoffFunction\": \"linear\"
            },
            \"disableSubscriptionOverrides\": false,
            \"defaultThrottlePolicy\": {
              \"maxReceivesPerSecond\": 1
            }
          }
        }
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_sns_topic" "user_updates" {
  name            = "user-updates-topic"
  delivery_policy = "{\n  \\\"http\\\": {\n    \\\"defaultHealthyRetryPolicy\\\": {\n      \\\"minDelayTarget\\\": 20,\n      \\\"maxDelayTarget\\\": 20,\n      \\\"numRetries\\\": 3,\n      \\\"numMaxDelayRetries\\\": 0,\n      \\\"numNoDelayRetries\\\": 0,\n      \\\"numMinDelayRetries\\\": 0,\n      \\\"backoffFunction\\\": \\\"linear\\\"\n    },\n    \\\"disableSubscriptionOverrides\\\": false,\n    \\\"defaultThrottlePolicy\\\": {\n      \\\"maxReceivesPerSecond\\\": 1\n    }\n  }\n}\n"
}
```

## Example with Server-side encryption (SSE)[](#example-with-server-side-encryption-sse)

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

const userUpdates = new aws.sns.Topic("user_updates", {
    name: "user-updates-topic",
    kmsMasterKeyId: "alias/aws/sns",
});
```

```python
import pulumi
import pulumi_aws as aws

user_updates = aws.sns.Topic("user_updates",
    name="user-updates-topic",
    kms_master_key_id="alias/aws/sns")
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/sns"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		_, err := sns.NewTopic(ctx, "user_updates", &sns.TopicArgs{
			Name:           pulumi.String("user-updates-topic"),
			KmsMasterKeyId: pulumi.String("alias/aws/sns"),
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
    var userUpdates = new Aws.Sns.Topic("user_updates", new()
    {
        Name = "user-updates-topic",
        KmsMasterKeyId = "alias/aws/sns",
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.sns.Topic;
import com.pulumi.aws.sns.TopicArgs;
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
        var userUpdates = new Topic("userUpdates", TopicArgs.builder()
            .name("user-updates-topic")
            .kmsMasterKeyId("alias/aws/sns")
            .build());

    }
}
```

```yaml
resources:
  userUpdates:
    type: aws:sns:Topic
    name: user_updates
    properties:
      name: user-updates-topic
      kmsMasterKeyId: alias/aws/sns
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_sns_topic" "user_updates" {
  name              = "user-updates-topic"
  kms_master_key_id = "alias/aws/sns"
}
```

## Example with First-In-First-Out (FIFO)[](#example-with-first-in-first-out-fifo)

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

const userUpdates = new aws.sns.Topic("user_updates", {
    name: "user-updates-topic.fifo",
    fifoTopic: true,
    contentBasedDeduplication: true,
});
```

```python
import pulumi
import pulumi_aws as aws

user_updates = aws.sns.Topic("user_updates",
    name="user-updates-topic.fifo",
    fifo_topic=True,
    content_based_deduplication=True)
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/sns"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		_, err := sns.NewTopic(ctx, "user_updates", &sns.TopicArgs{
			Name:                      pulumi.String("user-updates-topic.fifo"),
			FifoTopic:                 pulumi.Bool(true),
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
    var userUpdates = new Aws.Sns.Topic("user_updates", new()
    {
        Name = "user-updates-topic.fifo",
        FifoTopic = true,
        ContentBasedDeduplication = true,
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.sns.Topic;
import com.pulumi.aws.sns.TopicArgs;
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
        var userUpdates = new Topic("userUpdates", TopicArgs.builder()
            .name("user-updates-topic.fifo")
            .fifoTopic(true)
            .contentBasedDeduplication(true)
            .build());

    }
}
```

```yaml
resources:
  userUpdates:
    type: aws:sns:Topic
    name: user_updates
    properties:
      name: user-updates-topic.fifo
      fifoTopic: true
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

resource "aws_sns_topic" "user_updates" {
  name                        = "user-updates-topic.fifo"
  fifo_topic                  = true
  content_based_deduplication = true
}
```

## Message Delivery Status Arguments[](#message-delivery-status-arguments)

The `<endpoint>_success_feedback_role_arn` and `<endpoint>_failure_feedback_role_arn` arguments are used to give Amazon SNS write access to use CloudWatch Logs on your behalf. The `<endpoint>_success_feedback_sample_rate` argument is for specifying the sample rate percentage (0-100) of successfully delivered messages. After you configure the `<endpoint>_failure_feedback_role_arn` argument, then all failed message deliveries generate CloudWatch Logs.

## Create Topic Resource[](#create)

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
new Topic(name: string, args?: TopicArgs, opts?: CustomResourceOptions);
```

```python
@overload
def Topic(resource_name: str,
          args: Optional[TopicArgs] = None,
          opts: Optional[ResourceOptions] = None)

@overload
def Topic(resource_name: str,
          opts: Optional[ResourceOptions] = None,
          application_failure_feedback_role_arn: Optional[str] = None,
          application_success_feedback_role_arn: Optional[str] = None,
          application_success_feedback_sample_rate: Optional[int] = None,
          archive_policy: Optional[str] = None,
          content_based_deduplication: Optional[bool] = None,
          delivery_policy: Optional[str] = None,
          display_name: Optional[str] = None,
          fifo_throughput_scope: Optional[str] = None,
          fifo_topic: Optional[bool] = None,
          firehose_failure_feedback_role_arn: Optional[str] = None,
          firehose_success_feedback_role_arn: Optional[str] = None,
          firehose_success_feedback_sample_rate: Optional[int] = None,
          http_failure_feedback_role_arn: Optional[str] = None,
          http_success_feedback_role_arn: Optional[str] = None,
          http_success_feedback_sample_rate: Optional[int] = None,
          kms_master_key_id: Optional[str] = None,
          lambda_failure_feedback_role_arn: Optional[str] = None,
          lambda_success_feedback_role_arn: Optional[str] = None,
          lambda_success_feedback_sample_rate: Optional[int] = None,
          name: Optional[str] = None,
          name_prefix: Optional[str] = None,
          policy: Optional[str] = None,
          region: Optional[str] = None,
          signature_version: Optional[int] = None,
          sqs_failure_feedback_role_arn: Optional[str] = None,
          sqs_success_feedback_role_arn: Optional[str] = None,
          sqs_success_feedback_sample_rate: Optional[int] = None,
          tags: Optional[Mapping[str, str]] = None,
          tracing_config: Optional[str] = None)
```

```go
func NewTopic(ctx *Context, name string, args *TopicArgs, opts ...ResourceOption) (*Topic, error)
```

```csharp
public Topic(string name, TopicArgs? args = null, CustomResourceOptions? opts = null)
```

```java
public Topic(String name, TopicArgs args)
public Topic(String name, TopicArgs args, CustomResourceOptions options)
```

```yaml
type: aws:sns:Topic
properties: # The arguments to resource properties.
options: # Bag of options to control resource's behavior.
```

```hcl
resource "aws_sns_topic" "name" {
    # resource properties
}
```

#### Parameters[](#parameters)

name This property is required. string

The unique name of the resource.

args [TopicArgs](#inputs)

The arguments to resource properties.

opts [CustomResourceOptions](/docs/reference/pkg/nodejs/pulumi/pulumi/#CustomResourceOptions)

Bag of options to control resource's behavior.

resource\_name This property is required. str

The unique name of the resource.

args [TopicArgs](#inputs)

The arguments to resource properties.

opts [ResourceOptions](/docs/reference/pkg/python/pulumi/#pulumi.ResourceOptions)

Bag of options to control resource's behavior.

ctx [Context](https://pkg.go.dev/github.com/pulumi/pulumi/sdk/v3/go/pulumi?tab=doc#Context)

Context object for the current deployment.

name This property is required. string

The unique name of the resource.

args [TopicArgs](#inputs)

The arguments to resource properties.

opts [ResourceOption](https://pkg.go.dev/github.com/pulumi/pulumi/sdk/v3/go/pulumi?tab=doc#ResourceOption)

Bag of options to control resource's behavior.

name This property is required. string

The unique name of the resource.

args [TopicArgs](#inputs)

The arguments to resource properties.

opts [CustomResourceOptions](/docs/reference/pkg/dotnet/Pulumi/Pulumi.CustomResourceOptions.html)

Bag of options to control resource's behavior.

name This property is required. String

The unique name of the resource.

args This property is required. [TopicArgs](#inputs)

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
var awsTopicResource = new Aws.Sns.Topic("awsTopicResource", new()
{
    ApplicationFailureFeedbackRoleArn = "string",
    ApplicationSuccessFeedbackRoleArn = "string",
    ApplicationSuccessFeedbackSampleRate = 0,
    ArchivePolicy = "string",
    ContentBasedDeduplication = false,
    DeliveryPolicy = "string",
    DisplayName = "string",
    FifoThroughputScope = "string",
    FifoTopic = false,
    FirehoseFailureFeedbackRoleArn = "string",
    FirehoseSuccessFeedbackRoleArn = "string",
    FirehoseSuccessFeedbackSampleRate = 0,
    HttpFailureFeedbackRoleArn = "string",
    HttpSuccessFeedbackRoleArn = "string",
    HttpSuccessFeedbackSampleRate = 0,
    KmsMasterKeyId = "string",
    LambdaFailureFeedbackRoleArn = "string",
    LambdaSuccessFeedbackRoleArn = "string",
    LambdaSuccessFeedbackSampleRate = 0,
    Name = "string",
    NamePrefix = "string",
    Policy = "string",
    Region = "string",
    SignatureVersion = 0,
    SqsFailureFeedbackRoleArn = "string",
    SqsSuccessFeedbackRoleArn = "string",
    SqsSuccessFeedbackSampleRate = 0,
    Tags =
    {
        { "string", "string" },
    },
    TracingConfig = "string",
});
```

```go
example, err := sns.NewTopic(ctx, "awsTopicResource", &sns.TopicArgs{
	ApplicationFailureFeedbackRoleArn:    pulumi.String("string"),
	ApplicationSuccessFeedbackRoleArn:    pulumi.String("string"),
	ApplicationSuccessFeedbackSampleRate: pulumi.Int(0),
	ArchivePolicy:                        pulumi.String("string"),
	ContentBasedDeduplication:            pulumi.Bool(false),
	DeliveryPolicy:                       pulumi.String("string"),
	DisplayName:                          pulumi.String("string"),
	FifoThroughputScope:                  pulumi.String("string"),
	FifoTopic:                            pulumi.Bool(false),
	FirehoseFailureFeedbackRoleArn:       pulumi.String("string"),
	FirehoseSuccessFeedbackRoleArn:       pulumi.String("string"),
	FirehoseSuccessFeedbackSampleRate:    pulumi.Int(0),
	HttpFailureFeedbackRoleArn:           pulumi.String("string"),
	HttpSuccessFeedbackRoleArn:           pulumi.String("string"),
	HttpSuccessFeedbackSampleRate:        pulumi.Int(0),
	KmsMasterKeyId:                       pulumi.String("string"),
	LambdaFailureFeedbackRoleArn:         pulumi.String("string"),
	LambdaSuccessFeedbackRoleArn:         pulumi.String("string"),
	LambdaSuccessFeedbackSampleRate:      pulumi.Int(0),
	Name:                                 pulumi.String("string"),
	NamePrefix:                           pulumi.String("string"),
	Policy:                               pulumi.String("string"),
	Region:                               pulumi.String("string"),
	SignatureVersion:                     pulumi.Int(0),
	SqsFailureFeedbackRoleArn:            pulumi.String("string"),
	SqsSuccessFeedbackRoleArn:            pulumi.String("string"),
	SqsSuccessFeedbackSampleRate:         pulumi.Int(0),
	Tags: pulumi.StringMap{
		"string": pulumi.String("string"),
	},
	TracingConfig: pulumi.String("string"),
})
```

```hcl
resource "aws_sns_topic" "awsTopicResource" {
  application_failure_feedback_role_arn    = "string"
  application_success_feedback_role_arn    = "string"
  application_success_feedback_sample_rate = 0
  archive_policy                           = "string"
  content_based_deduplication              = false
  delivery_policy                          = "string"
  display_name                             = "string"
  fifo_throughput_scope                    = "string"
  fifo_topic                               = false
  firehose_failure_feedback_role_arn       = "string"
  firehose_success_feedback_role_arn       = "string"
  firehose_success_feedback_sample_rate    = 0
  http_failure_feedback_role_arn           = "string"
  http_success_feedback_role_arn           = "string"
  http_success_feedback_sample_rate        = 0
  kms_master_key_id                        = "string"
  lambda_failure_feedback_role_arn         = "string"
  lambda_success_feedback_role_arn         = "string"
  lambda_success_feedback_sample_rate      = 0
  name                                     = "string"
  name_prefix                              = "string"
  policy                                   = "string"
  region                                   = "string"
  signature_version                        = 0
  sqs_failure_feedback_role_arn            = "string"
  sqs_success_feedback_role_arn            = "string"
  sqs_success_feedback_sample_rate         = 0
  tags = {
    "string" = "string"
  }
  tracing_config = "string"
}
```

```java
var awsTopicResource = new com.pulumi.aws.sns.Topic("awsTopicResource", com.pulumi.aws.sns.TopicArgs.builder()
    .applicationFailureFeedbackRoleArn("string")
    .applicationSuccessFeedbackRoleArn("string")
    .applicationSuccessFeedbackSampleRate(0)
    .archivePolicy("string")
    .contentBasedDeduplication(false)
    .deliveryPolicy("string")
    .displayName("string")
    .fifoThroughputScope("string")
    .fifoTopic(false)
    .firehoseFailureFeedbackRoleArn("string")
    .firehoseSuccessFeedbackRoleArn("string")
    .firehoseSuccessFeedbackSampleRate(0)
    .httpFailureFeedbackRoleArn("string")
    .httpSuccessFeedbackRoleArn("string")
    .httpSuccessFeedbackSampleRate(0)
    .kmsMasterKeyId("string")
    .lambdaFailureFeedbackRoleArn("string")
    .lambdaSuccessFeedbackRoleArn("string")
    .lambdaSuccessFeedbackSampleRate(0)
    .name("string")
    .namePrefix("string")
    .policy("string")
    .region("string")
    .signatureVersion(0)
    .sqsFailureFeedbackRoleArn("string")
    .sqsSuccessFeedbackRoleArn("string")
    .sqsSuccessFeedbackSampleRate(0)
    .tags(Map.of("string", "string"))
    .tracingConfig("string")
    .build());
```

```python
aws_topic_resource = aws.sns.Topic("awsTopicResource",
    application_failure_feedback_role_arn="string",
    application_success_feedback_role_arn="string",
    application_success_feedback_sample_rate=0,
    archive_policy="string",
    content_based_deduplication=False,
    delivery_policy="string",
    display_name="string",
    fifo_throughput_scope="string",
    fifo_topic=False,
    firehose_failure_feedback_role_arn="string",
    firehose_success_feedback_role_arn="string",
    firehose_success_feedback_sample_rate=0,
    http_failure_feedback_role_arn="string",
    http_success_feedback_role_arn="string",
    http_success_feedback_sample_rate=0,
    kms_master_key_id="string",
    lambda_failure_feedback_role_arn="string",
    lambda_success_feedback_role_arn="string",
    lambda_success_feedback_sample_rate=0,
    name="string",
    name_prefix="string",
    policy="string",
    region="string",
    signature_version=0,
    sqs_failure_feedback_role_arn="string",
    sqs_success_feedback_role_arn="string",
    sqs_success_feedback_sample_rate=0,
    tags={
        "string": "string",
    },
    tracing_config="string")
```

```typescript
const awsTopicResource = new aws.sns.Topic("awsTopicResource", {
    applicationFailureFeedbackRoleArn: "string",
    applicationSuccessFeedbackRoleArn: "string",
    applicationSuccessFeedbackSampleRate: 0,
    archivePolicy: "string",
    contentBasedDeduplication: false,
    deliveryPolicy: "string",
    displayName: "string",
    fifoThroughputScope: "string",
    fifoTopic: false,
    firehoseFailureFeedbackRoleArn: "string",
    firehoseSuccessFeedbackRoleArn: "string",
    firehoseSuccessFeedbackSampleRate: 0,
    httpFailureFeedbackRoleArn: "string",
    httpSuccessFeedbackRoleArn: "string",
    httpSuccessFeedbackSampleRate: 0,
    kmsMasterKeyId: "string",
    lambdaFailureFeedbackRoleArn: "string",
    lambdaSuccessFeedbackRoleArn: "string",
    lambdaSuccessFeedbackSampleRate: 0,
    name: "string",
    namePrefix: "string",
    policy: "string",
    region: "string",
    signatureVersion: 0,
    sqsFailureFeedbackRoleArn: "string",
    sqsSuccessFeedbackRoleArn: "string",
    sqsSuccessFeedbackSampleRate: 0,
    tags: {
        string: "string",
    },
    tracingConfig: "string",
});
```

```yaml
type: aws:sns:Topic
properties:
    applicationFailureFeedbackRoleArn: string
    applicationSuccessFeedbackRoleArn: string
    applicationSuccessFeedbackSampleRate: 0
    archivePolicy: string
    contentBasedDeduplication: false
    deliveryPolicy: string
    displayName: string
    fifoThroughputScope: string
    fifoTopic: false
    firehoseFailureFeedbackRoleArn: string
    firehoseSuccessFeedbackRoleArn: string
    firehoseSuccessFeedbackSampleRate: 0
    httpFailureFeedbackRoleArn: string
    httpSuccessFeedbackRoleArn: string
    httpSuccessFeedbackSampleRate: 0
    kmsMasterKeyId: string
    lambdaFailureFeedbackRoleArn: string
    lambdaSuccessFeedbackRoleArn: string
    lambdaSuccessFeedbackSampleRate: 0
    name: string
    namePrefix: string
    policy: string
    region: string
    signatureVersion: 0
    sqsFailureFeedbackRoleArn: string
    sqsSuccessFeedbackRoleArn: string
    sqsSuccessFeedbackSampleRate: 0
    tags:
        string: string
    tracingConfig: string
```

## Topic Resource Properties[](#properties)

To learn more about resource properties and how to use them, see [Inputs and Outputs](/docs/intro/concepts/inputs-outputs) in the Architecture and Concepts docs.

### Inputs[](#inputs)

In Python, inputs that are objects can be passed either as [argument classes or as dictionary literals](/docs/languages-sdks/python/#inputs-and-outputs).

The Topic resource accepts the following [input](/docs/intro/concepts/inputs-outputs) properties:

[ApplicationFailureFeedbackRoleArn](#applicationfailurefeedbackrolearn_csharp) string

IAM role for failure feedback

[ApplicationSuccessFeedbackRoleArn](#applicationsuccessfeedbackrolearn_csharp) string

The IAM role permitted to receive success feedback for this topic

[ApplicationSuccessFeedbackSampleRate](#applicationsuccessfeedbacksamplerate_csharp) int

Percentage of success to sample

[ArchivePolicy](#archivepolicy_csharp) string

The message archive policy for FIFO topics. More details in the [AWS documentation](https://docs.aws.amazon.com/sns/latest/dg/message-archiving-and-replay-topic-owner.html).

[ContentBasedDeduplication](#contentbaseddeduplication_csharp) bool

Enables content-based deduplication for FIFO topics. For more information, see the [related documentation](https://docs.aws.amazon.com/sns/latest/dg/fifo-message-dedup.html)

[DeliveryPolicy](#deliverypolicy_csharp) string

The SNS delivery policy. More details in the [AWS documentation](https://docs.aws.amazon.com/sns/latest/dg/DeliveryPolicies.html).

[DisplayName](#displayname_csharp) string

The display name for the topic

[FifoThroughputScope](#fifothroughputscope_csharp) string

Enables higher throughput for FIFO topics by adjusting the scope of deduplication. This attribute has two possible values, `Topic` and `MessageGroup`. For more information, see the [related documentation](https://docs.aws.amazon.com/sns/latest/dg/fifo-high-throughput.html#enable-high-throughput-on-fifo-topic).

[FifoTopic](#fifotopic_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. bool

Boolean indicating whether or not to create a FIFO (first-in-first-out) topic. FIFO topics can't deliver messages to customer managed endpoints, such as email addresses, mobile apps, SMS, or HTTP(S) endpoints. These endpoint types aren't guaranteed to preserve strict message ordering. Default is `false`.

[FirehoseFailureFeedbackRoleArn](#firehosefailurefeedbackrolearn_csharp) string

IAM role for failure feedback

[FirehoseSuccessFeedbackRoleArn](#firehosesuccessfeedbackrolearn_csharp) string

The IAM role permitted to receive success feedback for this topic

[FirehoseSuccessFeedbackSampleRate](#firehosesuccessfeedbacksamplerate_csharp) int

Percentage of success to sample

[HttpFailureFeedbackRoleArn](#httpfailurefeedbackrolearn_csharp) string

IAM role for failure feedback

[HttpSuccessFeedbackRoleArn](#httpsuccessfeedbackrolearn_csharp) string

The IAM role permitted to receive success feedback for this topic

[HttpSuccessFeedbackSampleRate](#httpsuccessfeedbacksamplerate_csharp) int

Percentage of success to sample

[KmsMasterKeyId](#kmsmasterkeyid_csharp) string

The ID of an AWS-managed customer master key (CMK) for Amazon SNS or a custom CMK. For more information, see [Key Terms](https://docs.aws.amazon.com/sns/latest/dg/sns-server-side-encryption.html#sse-key-terms)

[LambdaFailureFeedbackRoleArn](#lambdafailurefeedbackrolearn_csharp) string

IAM role for failure feedback

[LambdaSuccessFeedbackRoleArn](#lambdasuccessfeedbackrolearn_csharp) string

The IAM role permitted to receive success feedback for this topic

[LambdaSuccessFeedbackSampleRate](#lambdasuccessfeedbacksamplerate_csharp) int

Percentage of success to sample

[Name](#name_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

The name of the topic. Topic names must be made up of only uppercase and lowercase ASCII letters, numbers, underscores, and hyphens, and must be between 1 and 256 characters long. For a FIFO (first-in-first-out) topic, the name must end with the `.fifo` suffix. If omitted, the provider will assign a random, unique name. Conflicts with `namePrefix`

[NamePrefix](#nameprefix_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Creates a unique name beginning with the specified prefix. Conflicts with `name`

[Policy](#policy_csharp) string

The fully-formed AWS policy as JSON.

[Region](#region_csharp) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[SignatureVersion](#signatureversion_csharp) int

If `SignatureVersion` should be [1 (SHA1) or 2 (SHA256)](https://docs.aws.amazon.com/sns/latest/dg/sns-verify-signature-of-message.html). The signature version corresponds to the hashing algorithm used while creating the signature of the notifications, subscription confirmations, or unsubscribe confirmation messages sent by Amazon SNS.

[SqsFailureFeedbackRoleArn](#sqsfailurefeedbackrolearn_csharp) string

IAM role for failure feedback

[SqsSuccessFeedbackRoleArn](#sqssuccessfeedbackrolearn_csharp) string

The IAM role permitted to receive success feedback for this topic

[SqsSuccessFeedbackSampleRate](#sqssuccessfeedbacksamplerate_csharp) int

Percentage of success to sample

[Tags](#tags_csharp) Dictionary<string, string>

Key-value map of resource tags. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[TracingConfig](#tracingconfig_csharp) string

Tracing mode of an Amazon SNS topic. Valid values: `"PassThrough"`, `"Active"`.

[ApplicationFailureFeedbackRoleArn](#applicationfailurefeedbackrolearn_go) string

IAM role for failure feedback

[ApplicationSuccessFeedbackRoleArn](#applicationsuccessfeedbackrolearn_go) string

The IAM role permitted to receive success feedback for this topic

[ApplicationSuccessFeedbackSampleRate](#applicationsuccessfeedbacksamplerate_go) int

Percentage of success to sample

[ArchivePolicy](#archivepolicy_go) string

The message archive policy for FIFO topics. More details in the [AWS documentation](https://docs.aws.amazon.com/sns/latest/dg/message-archiving-and-replay-topic-owner.html).

[ContentBasedDeduplication](#contentbaseddeduplication_go) bool

Enables content-based deduplication for FIFO topics. For more information, see the [related documentation](https://docs.aws.amazon.com/sns/latest/dg/fifo-message-dedup.html)

[DeliveryPolicy](#deliverypolicy_go) string

The SNS delivery policy. More details in the [AWS documentation](https://docs.aws.amazon.com/sns/latest/dg/DeliveryPolicies.html).

[DisplayName](#displayname_go) string

The display name for the topic

[FifoThroughputScope](#fifothroughputscope_go) string

Enables higher throughput for FIFO topics by adjusting the scope of deduplication. This attribute has two possible values, `Topic` and `MessageGroup`. For more information, see the [related documentation](https://docs.aws.amazon.com/sns/latest/dg/fifo-high-throughput.html#enable-high-throughput-on-fifo-topic).

[FifoTopic](#fifotopic_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. bool

Boolean indicating whether or not to create a FIFO (first-in-first-out) topic. FIFO topics can't deliver messages to customer managed endpoints, such as email addresses, mobile apps, SMS, or HTTP(S) endpoints. These endpoint types aren't guaranteed to preserve strict message ordering. Default is `false`.

[FirehoseFailureFeedbackRoleArn](#firehosefailurefeedbackrolearn_go) string

IAM role for failure feedback

[FirehoseSuccessFeedbackRoleArn](#firehosesuccessfeedbackrolearn_go) string

The IAM role permitted to receive success feedback for this topic

[FirehoseSuccessFeedbackSampleRate](#firehosesuccessfeedbacksamplerate_go) int

Percentage of success to sample

[HttpFailureFeedbackRoleArn](#httpfailurefeedbackrolearn_go) string

IAM role for failure feedback

[HttpSuccessFeedbackRoleArn](#httpsuccessfeedbackrolearn_go) string

The IAM role permitted to receive success feedback for this topic

[HttpSuccessFeedbackSampleRate](#httpsuccessfeedbacksamplerate_go) int

Percentage of success to sample

[KmsMasterKeyId](#kmsmasterkeyid_go) string

The ID of an AWS-managed customer master key (CMK) for Amazon SNS or a custom CMK. For more information, see [Key Terms](https://docs.aws.amazon.com/sns/latest/dg/sns-server-side-encryption.html#sse-key-terms)

[LambdaFailureFeedbackRoleArn](#lambdafailurefeedbackrolearn_go) string

IAM role for failure feedback

[LambdaSuccessFeedbackRoleArn](#lambdasuccessfeedbackrolearn_go) string

The IAM role permitted to receive success feedback for this topic

[LambdaSuccessFeedbackSampleRate](#lambdasuccessfeedbacksamplerate_go) int

Percentage of success to sample

[Name](#name_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

The name of the topic. Topic names must be made up of only uppercase and lowercase ASCII letters, numbers, underscores, and hyphens, and must be between 1 and 256 characters long. For a FIFO (first-in-first-out) topic, the name must end with the `.fifo` suffix. If omitted, the provider will assign a random, unique name. Conflicts with `namePrefix`

[NamePrefix](#nameprefix_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Creates a unique name beginning with the specified prefix. Conflicts with `name`

[Policy](#policy_go) string

The fully-formed AWS policy as JSON.

[Region](#region_go) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[SignatureVersion](#signatureversion_go) int

If `SignatureVersion` should be [1 (SHA1) or 2 (SHA256)](https://docs.aws.amazon.com/sns/latest/dg/sns-verify-signature-of-message.html). The signature version corresponds to the hashing algorithm used while creating the signature of the notifications, subscription confirmations, or unsubscribe confirmation messages sent by Amazon SNS.

[SqsFailureFeedbackRoleArn](#sqsfailurefeedbackrolearn_go) string

IAM role for failure feedback

[SqsSuccessFeedbackRoleArn](#sqssuccessfeedbackrolearn_go) string

The IAM role permitted to receive success feedback for this topic

[SqsSuccessFeedbackSampleRate](#sqssuccessfeedbacksamplerate_go) int

Percentage of success to sample

[Tags](#tags_go) map\[string\]string

Key-value map of resource tags. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[TracingConfig](#tracingconfig_go) string

Tracing mode of an Amazon SNS topic. Valid values: `"PassThrough"`, `"Active"`.

[application\_failure\_feedback\_role\_arn](#application_failure_feedback_role_arn_hcl) string

IAM role for failure feedback

[application\_success\_feedback\_role\_arn](#application_success_feedback_role_arn_hcl) string

The IAM role permitted to receive success feedback for this topic

[application\_success\_feedback\_sample\_rate](#application_success_feedback_sample_rate_hcl) number

Percentage of success to sample

[archive\_policy](#archive_policy_hcl) string

The message archive policy for FIFO topics. More details in the [AWS documentation](https://docs.aws.amazon.com/sns/latest/dg/message-archiving-and-replay-topic-owner.html).

[content\_based\_deduplication](#content_based_deduplication_hcl) bool

Enables content-based deduplication for FIFO topics. For more information, see the [related documentation](https://docs.aws.amazon.com/sns/latest/dg/fifo-message-dedup.html)

[delivery\_policy](#delivery_policy_hcl) string

The SNS delivery policy. More details in the [AWS documentation](https://docs.aws.amazon.com/sns/latest/dg/DeliveryPolicies.html).

[display\_name](#display_name_hcl) string

The display name for the topic

[fifo\_throughput\_scope](#fifo_throughput_scope_hcl) string

Enables higher throughput for FIFO topics by adjusting the scope of deduplication. This attribute has two possible values, `Topic` and `MessageGroup`. For more information, see the [related documentation](https://docs.aws.amazon.com/sns/latest/dg/fifo-high-throughput.html#enable-high-throughput-on-fifo-topic).

[fifo\_topic](#fifo_topic_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. bool

Boolean indicating whether or not to create a FIFO (first-in-first-out) topic. FIFO topics can't deliver messages to customer managed endpoints, such as email addresses, mobile apps, SMS, or HTTP(S) endpoints. These endpoint types aren't guaranteed to preserve strict message ordering. Default is `false`.

[firehose\_failure\_feedback\_role\_arn](#firehose_failure_feedback_role_arn_hcl) string

IAM role for failure feedback

[firehose\_success\_feedback\_role\_arn](#firehose_success_feedback_role_arn_hcl) string

The IAM role permitted to receive success feedback for this topic

[firehose\_success\_feedback\_sample\_rate](#firehose_success_feedback_sample_rate_hcl) number

Percentage of success to sample

[http\_failure\_feedback\_role\_arn](#http_failure_feedback_role_arn_hcl) string

IAM role for failure feedback

[http\_success\_feedback\_role\_arn](#http_success_feedback_role_arn_hcl) string

The IAM role permitted to receive success feedback for this topic

[http\_success\_feedback\_sample\_rate](#http_success_feedback_sample_rate_hcl) number

Percentage of success to sample

[kms\_master\_key\_id](#kms_master_key_id_hcl) string

The ID of an AWS-managed customer master key (CMK) for Amazon SNS or a custom CMK. For more information, see [Key Terms](https://docs.aws.amazon.com/sns/latest/dg/sns-server-side-encryption.html#sse-key-terms)

[lambda\_failure\_feedback\_role\_arn](#lambda_failure_feedback_role_arn_hcl) string

IAM role for failure feedback

[lambda\_success\_feedback\_role\_arn](#lambda_success_feedback_role_arn_hcl) string

The IAM role permitted to receive success feedback for this topic

[lambda\_success\_feedback\_sample\_rate](#lambda_success_feedback_sample_rate_hcl) number

Percentage of success to sample

[name](#name_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

The name of the topic. Topic names must be made up of only uppercase and lowercase ASCII letters, numbers, underscores, and hyphens, and must be between 1 and 256 characters long. For a FIFO (first-in-first-out) topic, the name must end with the `.fifo` suffix. If omitted, the provider will assign a random, unique name. Conflicts with `namePrefix`

[name\_prefix](#name_prefix_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Creates a unique name beginning with the specified prefix. Conflicts with `name`

[policy](#policy_hcl) string

The fully-formed AWS policy as JSON.

[region](#region_hcl) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[signature\_version](#signature_version_hcl) number

If `SignatureVersion` should be [1 (SHA1) or 2 (SHA256)](https://docs.aws.amazon.com/sns/latest/dg/sns-verify-signature-of-message.html). The signature version corresponds to the hashing algorithm used while creating the signature of the notifications, subscription confirmations, or unsubscribe confirmation messages sent by Amazon SNS.

[sqs\_failure\_feedback\_role\_arn](#sqs_failure_feedback_role_arn_hcl) string

IAM role for failure feedback

[sqs\_success\_feedback\_role\_arn](#sqs_success_feedback_role_arn_hcl) string

The IAM role permitted to receive success feedback for this topic

[sqs\_success\_feedback\_sample\_rate](#sqs_success_feedback_sample_rate_hcl) number

Percentage of success to sample

[tags](#tags_hcl) map(string)

Key-value map of resource tags. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tracing\_config](#tracing_config_hcl) string

Tracing mode of an Amazon SNS topic. Valid values: `"PassThrough"`, `"Active"`.

[applicationFailureFeedbackRoleArn](#applicationfailurefeedbackrolearn_java) String

IAM role for failure feedback

[applicationSuccessFeedbackRoleArn](#applicationsuccessfeedbackrolearn_java) String

The IAM role permitted to receive success feedback for this topic

[applicationSuccessFeedbackSampleRate](#applicationsuccessfeedbacksamplerate_java) Integer

Percentage of success to sample

[archivePolicy](#archivepolicy_java) String

The message archive policy for FIFO topics. More details in the [AWS documentation](https://docs.aws.amazon.com/sns/latest/dg/message-archiving-and-replay-topic-owner.html).

[contentBasedDeduplication](#contentbaseddeduplication_java) Boolean

Enables content-based deduplication for FIFO topics. For more information, see the [related documentation](https://docs.aws.amazon.com/sns/latest/dg/fifo-message-dedup.html)

[deliveryPolicy](#deliverypolicy_java) String

The SNS delivery policy. More details in the [AWS documentation](https://docs.aws.amazon.com/sns/latest/dg/DeliveryPolicies.html).

[displayName](#displayname_java) String

The display name for the topic

[fifoThroughputScope](#fifothroughputscope_java) String

Enables higher throughput for FIFO topics by adjusting the scope of deduplication. This attribute has two possible values, `Topic` and `MessageGroup`. For more information, see the [related documentation](https://docs.aws.amazon.com/sns/latest/dg/fifo-high-throughput.html#enable-high-throughput-on-fifo-topic).

[fifoTopic](#fifotopic_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. Boolean

Boolean indicating whether or not to create a FIFO (first-in-first-out) topic. FIFO topics can't deliver messages to customer managed endpoints, such as email addresses, mobile apps, SMS, or HTTP(S) endpoints. These endpoint types aren't guaranteed to preserve strict message ordering. Default is `false`.

[firehoseFailureFeedbackRoleArn](#firehosefailurefeedbackrolearn_java) String

IAM role for failure feedback

[firehoseSuccessFeedbackRoleArn](#firehosesuccessfeedbackrolearn_java) String

The IAM role permitted to receive success feedback for this topic

[firehoseSuccessFeedbackSampleRate](#firehosesuccessfeedbacksamplerate_java) Integer

Percentage of success to sample

[httpFailureFeedbackRoleArn](#httpfailurefeedbackrolearn_java) String

IAM role for failure feedback

[httpSuccessFeedbackRoleArn](#httpsuccessfeedbackrolearn_java) String

The IAM role permitted to receive success feedback for this topic

[httpSuccessFeedbackSampleRate](#httpsuccessfeedbacksamplerate_java) Integer

Percentage of success to sample

[kmsMasterKeyId](#kmsmasterkeyid_java) String

The ID of an AWS-managed customer master key (CMK) for Amazon SNS or a custom CMK. For more information, see [Key Terms](https://docs.aws.amazon.com/sns/latest/dg/sns-server-side-encryption.html#sse-key-terms)

[lambdaFailureFeedbackRoleArn](#lambdafailurefeedbackrolearn_java) String

IAM role for failure feedback

[lambdaSuccessFeedbackRoleArn](#lambdasuccessfeedbackrolearn_java) String

The IAM role permitted to receive success feedback for this topic

[lambdaSuccessFeedbackSampleRate](#lambdasuccessfeedbacksamplerate_java) Integer

Percentage of success to sample

[name](#name_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

The name of the topic. Topic names must be made up of only uppercase and lowercase ASCII letters, numbers, underscores, and hyphens, and must be between 1 and 256 characters long. For a FIFO (first-in-first-out) topic, the name must end with the `.fifo` suffix. If omitted, the provider will assign a random, unique name. Conflicts with `namePrefix`

[namePrefix](#nameprefix_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Creates a unique name beginning with the specified prefix. Conflicts with `name`

[policy](#policy_java) String

The fully-formed AWS policy as JSON.

[region](#region_java) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[signatureVersion](#signatureversion_java) Integer

If `SignatureVersion` should be [1 (SHA1) or 2 (SHA256)](https://docs.aws.amazon.com/sns/latest/dg/sns-verify-signature-of-message.html). The signature version corresponds to the hashing algorithm used while creating the signature of the notifications, subscription confirmations, or unsubscribe confirmation messages sent by Amazon SNS.

[sqsFailureFeedbackRoleArn](#sqsfailurefeedbackrolearn_java) String

IAM role for failure feedback

[sqsSuccessFeedbackRoleArn](#sqssuccessfeedbackrolearn_java) String

The IAM role permitted to receive success feedback for this topic

[sqsSuccessFeedbackSampleRate](#sqssuccessfeedbacksamplerate_java) Integer

Percentage of success to sample

[tags](#tags_java) Map<String,String>

Key-value map of resource tags. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tracingConfig](#tracingconfig_java) String

Tracing mode of an Amazon SNS topic. Valid values: `"PassThrough"`, `"Active"`.

[applicationFailureFeedbackRoleArn](#applicationfailurefeedbackrolearn_nodejs) string

IAM role for failure feedback

[applicationSuccessFeedbackRoleArn](#applicationsuccessfeedbackrolearn_nodejs) string

The IAM role permitted to receive success feedback for this topic

[applicationSuccessFeedbackSampleRate](#applicationsuccessfeedbacksamplerate_nodejs) number

Percentage of success to sample

[archivePolicy](#archivepolicy_nodejs) string

The message archive policy for FIFO topics. More details in the [AWS documentation](https://docs.aws.amazon.com/sns/latest/dg/message-archiving-and-replay-topic-owner.html).

[contentBasedDeduplication](#contentbaseddeduplication_nodejs) boolean

Enables content-based deduplication for FIFO topics. For more information, see the [related documentation](https://docs.aws.amazon.com/sns/latest/dg/fifo-message-dedup.html)

[deliveryPolicy](#deliverypolicy_nodejs) string

The SNS delivery policy. More details in the [AWS documentation](https://docs.aws.amazon.com/sns/latest/dg/DeliveryPolicies.html).

[displayName](#displayname_nodejs) string

The display name for the topic

[fifoThroughputScope](#fifothroughputscope_nodejs) string

Enables higher throughput for FIFO topics by adjusting the scope of deduplication. This attribute has two possible values, `Topic` and `MessageGroup`. For more information, see the [related documentation](https://docs.aws.amazon.com/sns/latest/dg/fifo-high-throughput.html#enable-high-throughput-on-fifo-topic).

[fifoTopic](#fifotopic_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. boolean

Boolean indicating whether or not to create a FIFO (first-in-first-out) topic. FIFO topics can't deliver messages to customer managed endpoints, such as email addresses, mobile apps, SMS, or HTTP(S) endpoints. These endpoint types aren't guaranteed to preserve strict message ordering. Default is `false`.

[firehoseFailureFeedbackRoleArn](#firehosefailurefeedbackrolearn_nodejs) string

IAM role for failure feedback

[firehoseSuccessFeedbackRoleArn](#firehosesuccessfeedbackrolearn_nodejs) string

The IAM role permitted to receive success feedback for this topic

[firehoseSuccessFeedbackSampleRate](#firehosesuccessfeedbacksamplerate_nodejs) number

Percentage of success to sample

[httpFailureFeedbackRoleArn](#httpfailurefeedbackrolearn_nodejs) string

IAM role for failure feedback

[httpSuccessFeedbackRoleArn](#httpsuccessfeedbackrolearn_nodejs) string

The IAM role permitted to receive success feedback for this topic

[httpSuccessFeedbackSampleRate](#httpsuccessfeedbacksamplerate_nodejs) number

Percentage of success to sample

[kmsMasterKeyId](#kmsmasterkeyid_nodejs) string

The ID of an AWS-managed customer master key (CMK) for Amazon SNS or a custom CMK. For more information, see [Key Terms](https://docs.aws.amazon.com/sns/latest/dg/sns-server-side-encryption.html#sse-key-terms)

[lambdaFailureFeedbackRoleArn](#lambdafailurefeedbackrolearn_nodejs) string

IAM role for failure feedback

[lambdaSuccessFeedbackRoleArn](#lambdasuccessfeedbackrolearn_nodejs) string

The IAM role permitted to receive success feedback for this topic

[lambdaSuccessFeedbackSampleRate](#lambdasuccessfeedbacksamplerate_nodejs) number

Percentage of success to sample

[name](#name_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

The name of the topic. Topic names must be made up of only uppercase and lowercase ASCII letters, numbers, underscores, and hyphens, and must be between 1 and 256 characters long. For a FIFO (first-in-first-out) topic, the name must end with the `.fifo` suffix. If omitted, the provider will assign a random, unique name. Conflicts with `namePrefix`

[namePrefix](#nameprefix_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Creates a unique name beginning with the specified prefix. Conflicts with `name`

[policy](#policy_nodejs) string

The fully-formed AWS policy as JSON.

[region](#region_nodejs) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[signatureVersion](#signatureversion_nodejs) number

If `SignatureVersion` should be [1 (SHA1) or 2 (SHA256)](https://docs.aws.amazon.com/sns/latest/dg/sns-verify-signature-of-message.html). The signature version corresponds to the hashing algorithm used while creating the signature of the notifications, subscription confirmations, or unsubscribe confirmation messages sent by Amazon SNS.

[sqsFailureFeedbackRoleArn](#sqsfailurefeedbackrolearn_nodejs) string

IAM role for failure feedback

[sqsSuccessFeedbackRoleArn](#sqssuccessfeedbackrolearn_nodejs) string

The IAM role permitted to receive success feedback for this topic

[sqsSuccessFeedbackSampleRate](#sqssuccessfeedbacksamplerate_nodejs) number

Percentage of success to sample

[tags](#tags_nodejs) {\[key: string\]: string}

Key-value map of resource tags. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tracingConfig](#tracingconfig_nodejs) string

Tracing mode of an Amazon SNS topic. Valid values: `"PassThrough"`, `"Active"`.

[application\_failure\_feedback\_role\_arn](#application_failure_feedback_role_arn_python) str

IAM role for failure feedback

[application\_success\_feedback\_role\_arn](#application_success_feedback_role_arn_python) str

The IAM role permitted to receive success feedback for this topic

[application\_success\_feedback\_sample\_rate](#application_success_feedback_sample_rate_python) int

Percentage of success to sample

[archive\_policy](#archive_policy_python) str

The message archive policy for FIFO topics. More details in the [AWS documentation](https://docs.aws.amazon.com/sns/latest/dg/message-archiving-and-replay-topic-owner.html).

[content\_based\_deduplication](#content_based_deduplication_python) bool

Enables content-based deduplication for FIFO topics. For more information, see the [related documentation](https://docs.aws.amazon.com/sns/latest/dg/fifo-message-dedup.html)

[delivery\_policy](#delivery_policy_python) str

The SNS delivery policy. More details in the [AWS documentation](https://docs.aws.amazon.com/sns/latest/dg/DeliveryPolicies.html).

[display\_name](#display_name_python) str

The display name for the topic

[fifo\_throughput\_scope](#fifo_throughput_scope_python) str

Enables higher throughput for FIFO topics by adjusting the scope of deduplication. This attribute has two possible values, `Topic` and `MessageGroup`. For more information, see the [related documentation](https://docs.aws.amazon.com/sns/latest/dg/fifo-high-throughput.html#enable-high-throughput-on-fifo-topic).

[fifo\_topic](#fifo_topic_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. bool

Boolean indicating whether or not to create a FIFO (first-in-first-out) topic. FIFO topics can't deliver messages to customer managed endpoints, such as email addresses, mobile apps, SMS, or HTTP(S) endpoints. These endpoint types aren't guaranteed to preserve strict message ordering. Default is `false`.

[firehose\_failure\_feedback\_role\_arn](#firehose_failure_feedback_role_arn_python) str

IAM role for failure feedback

[firehose\_success\_feedback\_role\_arn](#firehose_success_feedback_role_arn_python) str

The IAM role permitted to receive success feedback for this topic

[firehose\_success\_feedback\_sample\_rate](#firehose_success_feedback_sample_rate_python) int

Percentage of success to sample

[http\_failure\_feedback\_role\_arn](#http_failure_feedback_role_arn_python) str

IAM role for failure feedback

[http\_success\_feedback\_role\_arn](#http_success_feedback_role_arn_python) str

The IAM role permitted to receive success feedback for this topic

[http\_success\_feedback\_sample\_rate](#http_success_feedback_sample_rate_python) int

Percentage of success to sample

[kms\_master\_key\_id](#kms_master_key_id_python) str

The ID of an AWS-managed customer master key (CMK) for Amazon SNS or a custom CMK. For more information, see [Key Terms](https://docs.aws.amazon.com/sns/latest/dg/sns-server-side-encryption.html#sse-key-terms)

[lambda\_failure\_feedback\_role\_arn](#lambda_failure_feedback_role_arn_python) str

IAM role for failure feedback

[lambda\_success\_feedback\_role\_arn](#lambda_success_feedback_role_arn_python) str

The IAM role permitted to receive success feedback for this topic

[lambda\_success\_feedback\_sample\_rate](#lambda_success_feedback_sample_rate_python) int

Percentage of success to sample

[name](#name_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

The name of the topic. Topic names must be made up of only uppercase and lowercase ASCII letters, numbers, underscores, and hyphens, and must be between 1 and 256 characters long. For a FIFO (first-in-first-out) topic, the name must end with the `.fifo` suffix. If omitted, the provider will assign a random, unique name. Conflicts with `namePrefix`

[name\_prefix](#name_prefix_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Creates a unique name beginning with the specified prefix. Conflicts with `name`

[policy](#policy_python) str

The fully-formed AWS policy as JSON.

[region](#region_python) str

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[signature\_version](#signature_version_python) int

If `SignatureVersion` should be [1 (SHA1) or 2 (SHA256)](https://docs.aws.amazon.com/sns/latest/dg/sns-verify-signature-of-message.html). The signature version corresponds to the hashing algorithm used while creating the signature of the notifications, subscription confirmations, or unsubscribe confirmation messages sent by Amazon SNS.

[sqs\_failure\_feedback\_role\_arn](#sqs_failure_feedback_role_arn_python) str

IAM role for failure feedback

[sqs\_success\_feedback\_role\_arn](#sqs_success_feedback_role_arn_python) str

The IAM role permitted to receive success feedback for this topic

[sqs\_success\_feedback\_sample\_rate](#sqs_success_feedback_sample_rate_python) int

Percentage of success to sample

[tags](#tags_python) Mapping\[str, str\]

Key-value map of resource tags. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tracing\_config](#tracing_config_python) str

Tracing mode of an Amazon SNS topic. Valid values: `"PassThrough"`, `"Active"`.

[applicationFailureFeedbackRoleArn](#applicationfailurefeedbackrolearn_yaml) String

IAM role for failure feedback

[applicationSuccessFeedbackRoleArn](#applicationsuccessfeedbackrolearn_yaml) String

The IAM role permitted to receive success feedback for this topic

[applicationSuccessFeedbackSampleRate](#applicationsuccessfeedbacksamplerate_yaml) Number

Percentage of success to sample

[archivePolicy](#archivepolicy_yaml) String

The message archive policy for FIFO topics. More details in the [AWS documentation](https://docs.aws.amazon.com/sns/latest/dg/message-archiving-and-replay-topic-owner.html).

[contentBasedDeduplication](#contentbaseddeduplication_yaml) Boolean

Enables content-based deduplication for FIFO topics. For more information, see the [related documentation](https://docs.aws.amazon.com/sns/latest/dg/fifo-message-dedup.html)

[deliveryPolicy](#deliverypolicy_yaml) String

The SNS delivery policy. More details in the [AWS documentation](https://docs.aws.amazon.com/sns/latest/dg/DeliveryPolicies.html).

[displayName](#displayname_yaml) String

The display name for the topic

[fifoThroughputScope](#fifothroughputscope_yaml) String

Enables higher throughput for FIFO topics by adjusting the scope of deduplication. This attribute has two possible values, `Topic` and `MessageGroup`. For more information, see the [related documentation](https://docs.aws.amazon.com/sns/latest/dg/fifo-high-throughput.html#enable-high-throughput-on-fifo-topic).

[fifoTopic](#fifotopic_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. Boolean

Boolean indicating whether or not to create a FIFO (first-in-first-out) topic. FIFO topics can't deliver messages to customer managed endpoints, such as email addresses, mobile apps, SMS, or HTTP(S) endpoints. These endpoint types aren't guaranteed to preserve strict message ordering. Default is `false`.

[firehoseFailureFeedbackRoleArn](#firehosefailurefeedbackrolearn_yaml) String

IAM role for failure feedback

[firehoseSuccessFeedbackRoleArn](#firehosesuccessfeedbackrolearn_yaml) String

The IAM role permitted to receive success feedback for this topic

[firehoseSuccessFeedbackSampleRate](#firehosesuccessfeedbacksamplerate_yaml) Number

Percentage of success to sample

[httpFailureFeedbackRoleArn](#httpfailurefeedbackrolearn_yaml) String

IAM role for failure feedback

[httpSuccessFeedbackRoleArn](#httpsuccessfeedbackrolearn_yaml) String

The IAM role permitted to receive success feedback for this topic

[httpSuccessFeedbackSampleRate](#httpsuccessfeedbacksamplerate_yaml) Number

Percentage of success to sample

[kmsMasterKeyId](#kmsmasterkeyid_yaml) String

The ID of an AWS-managed customer master key (CMK) for Amazon SNS or a custom CMK. For more information, see [Key Terms](https://docs.aws.amazon.com/sns/latest/dg/sns-server-side-encryption.html#sse-key-terms)

[lambdaFailureFeedbackRoleArn](#lambdafailurefeedbackrolearn_yaml) String

IAM role for failure feedback

[lambdaSuccessFeedbackRoleArn](#lambdasuccessfeedbackrolearn_yaml) String

The IAM role permitted to receive success feedback for this topic

[lambdaSuccessFeedbackSampleRate](#lambdasuccessfeedbacksamplerate_yaml) Number

Percentage of success to sample

[name](#name_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

The name of the topic. Topic names must be made up of only uppercase and lowercase ASCII letters, numbers, underscores, and hyphens, and must be between 1 and 256 characters long. For a FIFO (first-in-first-out) topic, the name must end with the `.fifo` suffix. If omitted, the provider will assign a random, unique name. Conflicts with `namePrefix`

[namePrefix](#nameprefix_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Creates a unique name beginning with the specified prefix. Conflicts with `name`

[policy](#policy_yaml) String

The fully-formed AWS policy as JSON.

[region](#region_yaml) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[signatureVersion](#signatureversion_yaml) Number

If `SignatureVersion` should be [1 (SHA1) or 2 (SHA256)](https://docs.aws.amazon.com/sns/latest/dg/sns-verify-signature-of-message.html). The signature version corresponds to the hashing algorithm used while creating the signature of the notifications, subscription confirmations, or unsubscribe confirmation messages sent by Amazon SNS.

[sqsFailureFeedbackRoleArn](#sqsfailurefeedbackrolearn_yaml) String

IAM role for failure feedback

[sqsSuccessFeedbackRoleArn](#sqssuccessfeedbackrolearn_yaml) String

The IAM role permitted to receive success feedback for this topic

[sqsSuccessFeedbackSampleRate](#sqssuccessfeedbacksamplerate_yaml) Number

Percentage of success to sample

[tags](#tags_yaml) Map<String>

Key-value map of resource tags. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tracingConfig](#tracingconfig_yaml) String

Tracing mode of an Amazon SNS topic. Valid values: `"PassThrough"`, `"Active"`.

### Outputs[](#outputs)

All [input](#inputs) properties are implicitly available as output properties. Additionally, the Topic resource produces the following output properties:

[Arn](#arn_csharp) string

The ARN of the SNS topic, as a more obvious property (clone of id)

[BeginningArchiveTime](#beginningarchivetime_csharp) string

The oldest timestamp at which a FIFO topic subscriber can start a replay.

[Id](#id_csharp) string

The provider-assigned unique ID for this managed resource.

[Owner](#owner_csharp) string

The AWS Account ID of the SNS topic owner

[TagsAll](#tagsall_csharp) Dictionary<string, string>

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[Arn](#arn_go) string

The ARN of the SNS topic, as a more obvious property (clone of id)

[BeginningArchiveTime](#beginningarchivetime_go) string

The oldest timestamp at which a FIFO topic subscriber can start a replay.

[Id](#id_go) string

The provider-assigned unique ID for this managed resource.

[Owner](#owner_go) string

The AWS Account ID of the SNS topic owner

[TagsAll](#tagsall_go) map\[string\]string

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[arn](#arn_hcl) string

The ARN of the SNS topic, as a more obvious property (clone of id)

[beginning\_archive\_time](#beginning_archive_time_hcl) string

The oldest timestamp at which a FIFO topic subscriber can start a replay.

[id](#id_hcl) string

The provider-assigned unique ID for this managed resource.

[owner](#owner_hcl) string

The AWS Account ID of the SNS topic owner

[tags\_all](#tags_all_hcl) map(string)

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[arn](#arn_java) String

The ARN of the SNS topic, as a more obvious property (clone of id)

[beginningArchiveTime](#beginningarchivetime_java) String

The oldest timestamp at which a FIFO topic subscriber can start a replay.

[id](#id_java) String

The provider-assigned unique ID for this managed resource.

[owner](#owner_java) String

The AWS Account ID of the SNS topic owner

[tagsAll](#tagsall_java) Map<String,String>

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[arn](#arn_nodejs) string

The ARN of the SNS topic, as a more obvious property (clone of id)

[beginningArchiveTime](#beginningarchivetime_nodejs) string

The oldest timestamp at which a FIFO topic subscriber can start a replay.

[id](#id_nodejs) string

The provider-assigned unique ID for this managed resource.

[owner](#owner_nodejs) string

The AWS Account ID of the SNS topic owner

[tagsAll](#tagsall_nodejs) {\[key: string\]: string}

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[arn](#arn_python) str

The ARN of the SNS topic, as a more obvious property (clone of id)

[beginning\_archive\_time](#beginning_archive_time_python) str

The oldest timestamp at which a FIFO topic subscriber can start a replay.

[id](#id_python) str

The provider-assigned unique ID for this managed resource.

[owner](#owner_python) str

The AWS Account ID of the SNS topic owner

[tags\_all](#tags_all_python) Mapping\[str, str\]

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[arn](#arn_yaml) String

The ARN of the SNS topic, as a more obvious property (clone of id)

[beginningArchiveTime](#beginningarchivetime_yaml) String

The oldest timestamp at which a FIFO topic subscriber can start a replay.

[id](#id_yaml) String

The provider-assigned unique ID for this managed resource.

[owner](#owner_yaml) String

The AWS Account ID of the SNS topic owner

[tagsAll](#tagsall_yaml) Map<String>

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

## Look up Existing Topic Resource[](#look-up)

Get an existing Topic resource’s state with the given name, ID, and optional extra properties used to qualify the lookup.

-   TypeScript
-   Python
-   Go
-   C#
-   Java
-   YAML
-   HCL PREVIEW

```typescript
public static get(name: string, id: Input<ID>, state?: TopicState, opts?: CustomResourceOptions): Topic
```

```python
@staticmethod
def get(resource_name: str,
        id: str,
        opts: Optional[ResourceOptions] = None,
        application_failure_feedback_role_arn: Optional[str] = None,
        application_success_feedback_role_arn: Optional[str] = None,
        application_success_feedback_sample_rate: Optional[int] = None,
        archive_policy: Optional[str] = None,
        arn: Optional[str] = None,
        beginning_archive_time: Optional[str] = None,
        content_based_deduplication: Optional[bool] = None,
        delivery_policy: Optional[str] = None,
        display_name: Optional[str] = None,
        fifo_throughput_scope: Optional[str] = None,
        fifo_topic: Optional[bool] = None,
        firehose_failure_feedback_role_arn: Optional[str] = None,
        firehose_success_feedback_role_arn: Optional[str] = None,
        firehose_success_feedback_sample_rate: Optional[int] = None,
        http_failure_feedback_role_arn: Optional[str] = None,
        http_success_feedback_role_arn: Optional[str] = None,
        http_success_feedback_sample_rate: Optional[int] = None,
        kms_master_key_id: Optional[str] = None,
        lambda_failure_feedback_role_arn: Optional[str] = None,
        lambda_success_feedback_role_arn: Optional[str] = None,
        lambda_success_feedback_sample_rate: Optional[int] = None,
        name: Optional[str] = None,
        name_prefix: Optional[str] = None,
        owner: Optional[str] = None,
        policy: Optional[str] = None,
        region: Optional[str] = None,
        signature_version: Optional[int] = None,
        sqs_failure_feedback_role_arn: Optional[str] = None,
        sqs_success_feedback_role_arn: Optional[str] = None,
        sqs_success_feedback_sample_rate: Optional[int] = None,
        tags: Optional[Mapping[str, str]] = None,
        tags_all: Optional[Mapping[str, str]] = None,
        tracing_config: Optional[str] = None) -> Topic
```

```go
func GetTopic(ctx *Context, name string, id IDInput, state *TopicState, opts ...ResourceOption) (*Topic, error)
```

```csharp
public static Topic Get(string name, Input<string> id, TopicState? state, CustomResourceOptions? opts = null)
```

```java
public static Topic get(String name, Output<String> id, TopicState state, CustomResourceOptions options)
```

```yaml
resources:  _:    type: aws:sns:Topic    get:      id: ${id}
```

```hcl
import {
  to = aws_sns_topic.example
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

[ApplicationFailureFeedbackRoleArn](#state_applicationfailurefeedbackrolearn_csharp) string

IAM role for failure feedback

[ApplicationSuccessFeedbackRoleArn](#state_applicationsuccessfeedbackrolearn_csharp) string

The IAM role permitted to receive success feedback for this topic

[ApplicationSuccessFeedbackSampleRate](#state_applicationsuccessfeedbacksamplerate_csharp) int

Percentage of success to sample

[ArchivePolicy](#state_archivepolicy_csharp) string

The message archive policy for FIFO topics. More details in the [AWS documentation](https://docs.aws.amazon.com/sns/latest/dg/message-archiving-and-replay-topic-owner.html).

[Arn](#state_arn_csharp) string

The ARN of the SNS topic, as a more obvious property (clone of id)

[BeginningArchiveTime](#state_beginningarchivetime_csharp) string

The oldest timestamp at which a FIFO topic subscriber can start a replay.

[ContentBasedDeduplication](#state_contentbaseddeduplication_csharp) bool

Enables content-based deduplication for FIFO topics. For more information, see the [related documentation](https://docs.aws.amazon.com/sns/latest/dg/fifo-message-dedup.html)

[DeliveryPolicy](#state_deliverypolicy_csharp) string

The SNS delivery policy. More details in the [AWS documentation](https://docs.aws.amazon.com/sns/latest/dg/DeliveryPolicies.html).

[DisplayName](#state_displayname_csharp) string

The display name for the topic

[FifoThroughputScope](#state_fifothroughputscope_csharp) string

Enables higher throughput for FIFO topics by adjusting the scope of deduplication. This attribute has two possible values, `Topic` and `MessageGroup`. For more information, see the [related documentation](https://docs.aws.amazon.com/sns/latest/dg/fifo-high-throughput.html#enable-high-throughput-on-fifo-topic).

[FifoTopic](#state_fifotopic_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. bool

Boolean indicating whether or not to create a FIFO (first-in-first-out) topic. FIFO topics can't deliver messages to customer managed endpoints, such as email addresses, mobile apps, SMS, or HTTP(S) endpoints. These endpoint types aren't guaranteed to preserve strict message ordering. Default is `false`.

[FirehoseFailureFeedbackRoleArn](#state_firehosefailurefeedbackrolearn_csharp) string

IAM role for failure feedback

[FirehoseSuccessFeedbackRoleArn](#state_firehosesuccessfeedbackrolearn_csharp) string

The IAM role permitted to receive success feedback for this topic

[FirehoseSuccessFeedbackSampleRate](#state_firehosesuccessfeedbacksamplerate_csharp) int

Percentage of success to sample

[HttpFailureFeedbackRoleArn](#state_httpfailurefeedbackrolearn_csharp) string

IAM role for failure feedback

[HttpSuccessFeedbackRoleArn](#state_httpsuccessfeedbackrolearn_csharp) string

The IAM role permitted to receive success feedback for this topic

[HttpSuccessFeedbackSampleRate](#state_httpsuccessfeedbacksamplerate_csharp) int

Percentage of success to sample

[KmsMasterKeyId](#state_kmsmasterkeyid_csharp) string

The ID of an AWS-managed customer master key (CMK) for Amazon SNS or a custom CMK. For more information, see [Key Terms](https://docs.aws.amazon.com/sns/latest/dg/sns-server-side-encryption.html#sse-key-terms)

[LambdaFailureFeedbackRoleArn](#state_lambdafailurefeedbackrolearn_csharp) string

IAM role for failure feedback

[LambdaSuccessFeedbackRoleArn](#state_lambdasuccessfeedbackrolearn_csharp) string

The IAM role permitted to receive success feedback for this topic

[LambdaSuccessFeedbackSampleRate](#state_lambdasuccessfeedbacksamplerate_csharp) int

Percentage of success to sample

[Name](#state_name_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

The name of the topic. Topic names must be made up of only uppercase and lowercase ASCII letters, numbers, underscores, and hyphens, and must be between 1 and 256 characters long. For a FIFO (first-in-first-out) topic, the name must end with the `.fifo` suffix. If omitted, the provider will assign a random, unique name. Conflicts with `namePrefix`

[NamePrefix](#state_nameprefix_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Creates a unique name beginning with the specified prefix. Conflicts with `name`

[Owner](#state_owner_csharp) string

The AWS Account ID of the SNS topic owner

[Policy](#state_policy_csharp) string

The fully-formed AWS policy as JSON.

[Region](#state_region_csharp) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[SignatureVersion](#state_signatureversion_csharp) int

If `SignatureVersion` should be [1 (SHA1) or 2 (SHA256)](https://docs.aws.amazon.com/sns/latest/dg/sns-verify-signature-of-message.html). The signature version corresponds to the hashing algorithm used while creating the signature of the notifications, subscription confirmations, or unsubscribe confirmation messages sent by Amazon SNS.

[SqsFailureFeedbackRoleArn](#state_sqsfailurefeedbackrolearn_csharp) string

IAM role for failure feedback

[SqsSuccessFeedbackRoleArn](#state_sqssuccessfeedbackrolearn_csharp) string

The IAM role permitted to receive success feedback for this topic

[SqsSuccessFeedbackSampleRate](#state_sqssuccessfeedbacksamplerate_csharp) int

Percentage of success to sample

[Tags](#state_tags_csharp) Dictionary<string, string>

Key-value map of resource tags. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[TagsAll](#state_tagsall_csharp) Dictionary<string, string>

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[TracingConfig](#state_tracingconfig_csharp) string

Tracing mode of an Amazon SNS topic. Valid values: `"PassThrough"`, `"Active"`.

[ApplicationFailureFeedbackRoleArn](#state_applicationfailurefeedbackrolearn_go) string

IAM role for failure feedback

[ApplicationSuccessFeedbackRoleArn](#state_applicationsuccessfeedbackrolearn_go) string

The IAM role permitted to receive success feedback for this topic

[ApplicationSuccessFeedbackSampleRate](#state_applicationsuccessfeedbacksamplerate_go) int

Percentage of success to sample

[ArchivePolicy](#state_archivepolicy_go) string

The message archive policy for FIFO topics. More details in the [AWS documentation](https://docs.aws.amazon.com/sns/latest/dg/message-archiving-and-replay-topic-owner.html).

[Arn](#state_arn_go) string

The ARN of the SNS topic, as a more obvious property (clone of id)

[BeginningArchiveTime](#state_beginningarchivetime_go) string

The oldest timestamp at which a FIFO topic subscriber can start a replay.

[ContentBasedDeduplication](#state_contentbaseddeduplication_go) bool

Enables content-based deduplication for FIFO topics. For more information, see the [related documentation](https://docs.aws.amazon.com/sns/latest/dg/fifo-message-dedup.html)

[DeliveryPolicy](#state_deliverypolicy_go) string

The SNS delivery policy. More details in the [AWS documentation](https://docs.aws.amazon.com/sns/latest/dg/DeliveryPolicies.html).

[DisplayName](#state_displayname_go) string

The display name for the topic

[FifoThroughputScope](#state_fifothroughputscope_go) string

Enables higher throughput for FIFO topics by adjusting the scope of deduplication. This attribute has two possible values, `Topic` and `MessageGroup`. For more information, see the [related documentation](https://docs.aws.amazon.com/sns/latest/dg/fifo-high-throughput.html#enable-high-throughput-on-fifo-topic).

[FifoTopic](#state_fifotopic_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. bool

Boolean indicating whether or not to create a FIFO (first-in-first-out) topic. FIFO topics can't deliver messages to customer managed endpoints, such as email addresses, mobile apps, SMS, or HTTP(S) endpoints. These endpoint types aren't guaranteed to preserve strict message ordering. Default is `false`.

[FirehoseFailureFeedbackRoleArn](#state_firehosefailurefeedbackrolearn_go) string

IAM role for failure feedback

[FirehoseSuccessFeedbackRoleArn](#state_firehosesuccessfeedbackrolearn_go) string

The IAM role permitted to receive success feedback for this topic

[FirehoseSuccessFeedbackSampleRate](#state_firehosesuccessfeedbacksamplerate_go) int

Percentage of success to sample

[HttpFailureFeedbackRoleArn](#state_httpfailurefeedbackrolearn_go) string

IAM role for failure feedback

[HttpSuccessFeedbackRoleArn](#state_httpsuccessfeedbackrolearn_go) string

The IAM role permitted to receive success feedback for this topic

[HttpSuccessFeedbackSampleRate](#state_httpsuccessfeedbacksamplerate_go) int

Percentage of success to sample

[KmsMasterKeyId](#state_kmsmasterkeyid_go) string

The ID of an AWS-managed customer master key (CMK) for Amazon SNS or a custom CMK. For more information, see [Key Terms](https://docs.aws.amazon.com/sns/latest/dg/sns-server-side-encryption.html#sse-key-terms)

[LambdaFailureFeedbackRoleArn](#state_lambdafailurefeedbackrolearn_go) string

IAM role for failure feedback

[LambdaSuccessFeedbackRoleArn](#state_lambdasuccessfeedbackrolearn_go) string

The IAM role permitted to receive success feedback for this topic

[LambdaSuccessFeedbackSampleRate](#state_lambdasuccessfeedbacksamplerate_go) int

Percentage of success to sample

[Name](#state_name_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

The name of the topic. Topic names must be made up of only uppercase and lowercase ASCII letters, numbers, underscores, and hyphens, and must be between 1 and 256 characters long. For a FIFO (first-in-first-out) topic, the name must end with the `.fifo` suffix. If omitted, the provider will assign a random, unique name. Conflicts with `namePrefix`

[NamePrefix](#state_nameprefix_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Creates a unique name beginning with the specified prefix. Conflicts with `name`

[Owner](#state_owner_go) string

The AWS Account ID of the SNS topic owner

[Policy](#state_policy_go) string

The fully-formed AWS policy as JSON.

[Region](#state_region_go) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[SignatureVersion](#state_signatureversion_go) int

If `SignatureVersion` should be [1 (SHA1) or 2 (SHA256)](https://docs.aws.amazon.com/sns/latest/dg/sns-verify-signature-of-message.html). The signature version corresponds to the hashing algorithm used while creating the signature of the notifications, subscription confirmations, or unsubscribe confirmation messages sent by Amazon SNS.

[SqsFailureFeedbackRoleArn](#state_sqsfailurefeedbackrolearn_go) string

IAM role for failure feedback

[SqsSuccessFeedbackRoleArn](#state_sqssuccessfeedbackrolearn_go) string

The IAM role permitted to receive success feedback for this topic

[SqsSuccessFeedbackSampleRate](#state_sqssuccessfeedbacksamplerate_go) int

Percentage of success to sample

[Tags](#state_tags_go) map\[string\]string

Key-value map of resource tags. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[TagsAll](#state_tagsall_go) map\[string\]string

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[TracingConfig](#state_tracingconfig_go) string

Tracing mode of an Amazon SNS topic. Valid values: `"PassThrough"`, `"Active"`.

[application\_failure\_feedback\_role\_arn](#state_application_failure_feedback_role_arn_hcl) string

IAM role for failure feedback

[application\_success\_feedback\_role\_arn](#state_application_success_feedback_role_arn_hcl) string

The IAM role permitted to receive success feedback for this topic

[application\_success\_feedback\_sample\_rate](#state_application_success_feedback_sample_rate_hcl) number

Percentage of success to sample

[archive\_policy](#state_archive_policy_hcl) string

The message archive policy for FIFO topics. More details in the [AWS documentation](https://docs.aws.amazon.com/sns/latest/dg/message-archiving-and-replay-topic-owner.html).

[arn](#state_arn_hcl) string

The ARN of the SNS topic, as a more obvious property (clone of id)

[beginning\_archive\_time](#state_beginning_archive_time_hcl) string

The oldest timestamp at which a FIFO topic subscriber can start a replay.

[content\_based\_deduplication](#state_content_based_deduplication_hcl) bool

Enables content-based deduplication for FIFO topics. For more information, see the [related documentation](https://docs.aws.amazon.com/sns/latest/dg/fifo-message-dedup.html)

[delivery\_policy](#state_delivery_policy_hcl) string

The SNS delivery policy. More details in the [AWS documentation](https://docs.aws.amazon.com/sns/latest/dg/DeliveryPolicies.html).

[display\_name](#state_display_name_hcl) string

The display name for the topic

[fifo\_throughput\_scope](#state_fifo_throughput_scope_hcl) string

Enables higher throughput for FIFO topics by adjusting the scope of deduplication. This attribute has two possible values, `Topic` and `MessageGroup`. For more information, see the [related documentation](https://docs.aws.amazon.com/sns/latest/dg/fifo-high-throughput.html#enable-high-throughput-on-fifo-topic).

[fifo\_topic](#state_fifo_topic_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. bool

Boolean indicating whether or not to create a FIFO (first-in-first-out) topic. FIFO topics can't deliver messages to customer managed endpoints, such as email addresses, mobile apps, SMS, or HTTP(S) endpoints. These endpoint types aren't guaranteed to preserve strict message ordering. Default is `false`.

[firehose\_failure\_feedback\_role\_arn](#state_firehose_failure_feedback_role_arn_hcl) string

IAM role for failure feedback

[firehose\_success\_feedback\_role\_arn](#state_firehose_success_feedback_role_arn_hcl) string

The IAM role permitted to receive success feedback for this topic

[firehose\_success\_feedback\_sample\_rate](#state_firehose_success_feedback_sample_rate_hcl) number

Percentage of success to sample

[http\_failure\_feedback\_role\_arn](#state_http_failure_feedback_role_arn_hcl) string

IAM role for failure feedback

[http\_success\_feedback\_role\_arn](#state_http_success_feedback_role_arn_hcl) string

The IAM role permitted to receive success feedback for this topic

[http\_success\_feedback\_sample\_rate](#state_http_success_feedback_sample_rate_hcl) number

Percentage of success to sample

[kms\_master\_key\_id](#state_kms_master_key_id_hcl) string

The ID of an AWS-managed customer master key (CMK) for Amazon SNS or a custom CMK. For more information, see [Key Terms](https://docs.aws.amazon.com/sns/latest/dg/sns-server-side-encryption.html#sse-key-terms)

[lambda\_failure\_feedback\_role\_arn](#state_lambda_failure_feedback_role_arn_hcl) string

IAM role for failure feedback

[lambda\_success\_feedback\_role\_arn](#state_lambda_success_feedback_role_arn_hcl) string

The IAM role permitted to receive success feedback for this topic

[lambda\_success\_feedback\_sample\_rate](#state_lambda_success_feedback_sample_rate_hcl) number

Percentage of success to sample

[name](#state_name_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

The name of the topic. Topic names must be made up of only uppercase and lowercase ASCII letters, numbers, underscores, and hyphens, and must be between 1 and 256 characters long. For a FIFO (first-in-first-out) topic, the name must end with the `.fifo` suffix. If omitted, the provider will assign a random, unique name. Conflicts with `namePrefix`

[name\_prefix](#state_name_prefix_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Creates a unique name beginning with the specified prefix. Conflicts with `name`

[owner](#state_owner_hcl) string

The AWS Account ID of the SNS topic owner

[policy](#state_policy_hcl) string

The fully-formed AWS policy as JSON.

[region](#state_region_hcl) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[signature\_version](#state_signature_version_hcl) number

If `SignatureVersion` should be [1 (SHA1) or 2 (SHA256)](https://docs.aws.amazon.com/sns/latest/dg/sns-verify-signature-of-message.html). The signature version corresponds to the hashing algorithm used while creating the signature of the notifications, subscription confirmations, or unsubscribe confirmation messages sent by Amazon SNS.

[sqs\_failure\_feedback\_role\_arn](#state_sqs_failure_feedback_role_arn_hcl) string

IAM role for failure feedback

[sqs\_success\_feedback\_role\_arn](#state_sqs_success_feedback_role_arn_hcl) string

The IAM role permitted to receive success feedback for this topic

[sqs\_success\_feedback\_sample\_rate](#state_sqs_success_feedback_sample_rate_hcl) number

Percentage of success to sample

[tags](#state_tags_hcl) map(string)

Key-value map of resource tags. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tags\_all](#state_tags_all_hcl) map(string)

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[tracing\_config](#state_tracing_config_hcl) string

Tracing mode of an Amazon SNS topic. Valid values: `"PassThrough"`, `"Active"`.

[applicationFailureFeedbackRoleArn](#state_applicationfailurefeedbackrolearn_java) String

IAM role for failure feedback

[applicationSuccessFeedbackRoleArn](#state_applicationsuccessfeedbackrolearn_java) String

The IAM role permitted to receive success feedback for this topic

[applicationSuccessFeedbackSampleRate](#state_applicationsuccessfeedbacksamplerate_java) Integer

Percentage of success to sample

[archivePolicy](#state_archivepolicy_java) String

The message archive policy for FIFO topics. More details in the [AWS documentation](https://docs.aws.amazon.com/sns/latest/dg/message-archiving-and-replay-topic-owner.html).

[arn](#state_arn_java) String

The ARN of the SNS topic, as a more obvious property (clone of id)

[beginningArchiveTime](#state_beginningarchivetime_java) String

The oldest timestamp at which a FIFO topic subscriber can start a replay.

[contentBasedDeduplication](#state_contentbaseddeduplication_java) Boolean

Enables content-based deduplication for FIFO topics. For more information, see the [related documentation](https://docs.aws.amazon.com/sns/latest/dg/fifo-message-dedup.html)

[deliveryPolicy](#state_deliverypolicy_java) String

The SNS delivery policy. More details in the [AWS documentation](https://docs.aws.amazon.com/sns/latest/dg/DeliveryPolicies.html).

[displayName](#state_displayname_java) String

The display name for the topic

[fifoThroughputScope](#state_fifothroughputscope_java) String

Enables higher throughput for FIFO topics by adjusting the scope of deduplication. This attribute has two possible values, `Topic` and `MessageGroup`. For more information, see the [related documentation](https://docs.aws.amazon.com/sns/latest/dg/fifo-high-throughput.html#enable-high-throughput-on-fifo-topic).

[fifoTopic](#state_fifotopic_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. Boolean

Boolean indicating whether or not to create a FIFO (first-in-first-out) topic. FIFO topics can't deliver messages to customer managed endpoints, such as email addresses, mobile apps, SMS, or HTTP(S) endpoints. These endpoint types aren't guaranteed to preserve strict message ordering. Default is `false`.

[firehoseFailureFeedbackRoleArn](#state_firehosefailurefeedbackrolearn_java) String

IAM role for failure feedback

[firehoseSuccessFeedbackRoleArn](#state_firehosesuccessfeedbackrolearn_java) String

The IAM role permitted to receive success feedback for this topic

[firehoseSuccessFeedbackSampleRate](#state_firehosesuccessfeedbacksamplerate_java) Integer

Percentage of success to sample

[httpFailureFeedbackRoleArn](#state_httpfailurefeedbackrolearn_java) String

IAM role for failure feedback

[httpSuccessFeedbackRoleArn](#state_httpsuccessfeedbackrolearn_java) String

The IAM role permitted to receive success feedback for this topic

[httpSuccessFeedbackSampleRate](#state_httpsuccessfeedbacksamplerate_java) Integer

Percentage of success to sample

[kmsMasterKeyId](#state_kmsmasterkeyid_java) String

The ID of an AWS-managed customer master key (CMK) for Amazon SNS or a custom CMK. For more information, see [Key Terms](https://docs.aws.amazon.com/sns/latest/dg/sns-server-side-encryption.html#sse-key-terms)

[lambdaFailureFeedbackRoleArn](#state_lambdafailurefeedbackrolearn_java) String

IAM role for failure feedback

[lambdaSuccessFeedbackRoleArn](#state_lambdasuccessfeedbackrolearn_java) String

The IAM role permitted to receive success feedback for this topic

[lambdaSuccessFeedbackSampleRate](#state_lambdasuccessfeedbacksamplerate_java) Integer

Percentage of success to sample

[name](#state_name_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

The name of the topic. Topic names must be made up of only uppercase and lowercase ASCII letters, numbers, underscores, and hyphens, and must be between 1 and 256 characters long. For a FIFO (first-in-first-out) topic, the name must end with the `.fifo` suffix. If omitted, the provider will assign a random, unique name. Conflicts with `namePrefix`

[namePrefix](#state_nameprefix_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Creates a unique name beginning with the specified prefix. Conflicts with `name`

[owner](#state_owner_java) String

The AWS Account ID of the SNS topic owner

[policy](#state_policy_java) String

The fully-formed AWS policy as JSON.

[region](#state_region_java) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[signatureVersion](#state_signatureversion_java) Integer

If `SignatureVersion` should be [1 (SHA1) or 2 (SHA256)](https://docs.aws.amazon.com/sns/latest/dg/sns-verify-signature-of-message.html). The signature version corresponds to the hashing algorithm used while creating the signature of the notifications, subscription confirmations, or unsubscribe confirmation messages sent by Amazon SNS.

[sqsFailureFeedbackRoleArn](#state_sqsfailurefeedbackrolearn_java) String

IAM role for failure feedback

[sqsSuccessFeedbackRoleArn](#state_sqssuccessfeedbackrolearn_java) String

The IAM role permitted to receive success feedback for this topic

[sqsSuccessFeedbackSampleRate](#state_sqssuccessfeedbacksamplerate_java) Integer

Percentage of success to sample

[tags](#state_tags_java) Map<String,String>

Key-value map of resource tags. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tagsAll](#state_tagsall_java) Map<String,String>

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[tracingConfig](#state_tracingconfig_java) String

Tracing mode of an Amazon SNS topic. Valid values: `"PassThrough"`, `"Active"`.

[applicationFailureFeedbackRoleArn](#state_applicationfailurefeedbackrolearn_nodejs) string

IAM role for failure feedback

[applicationSuccessFeedbackRoleArn](#state_applicationsuccessfeedbackrolearn_nodejs) string

The IAM role permitted to receive success feedback for this topic

[applicationSuccessFeedbackSampleRate](#state_applicationsuccessfeedbacksamplerate_nodejs) number

Percentage of success to sample

[archivePolicy](#state_archivepolicy_nodejs) string

The message archive policy for FIFO topics. More details in the [AWS documentation](https://docs.aws.amazon.com/sns/latest/dg/message-archiving-and-replay-topic-owner.html).

[arn](#state_arn_nodejs) string

The ARN of the SNS topic, as a more obvious property (clone of id)

[beginningArchiveTime](#state_beginningarchivetime_nodejs) string

The oldest timestamp at which a FIFO topic subscriber can start a replay.

[contentBasedDeduplication](#state_contentbaseddeduplication_nodejs) boolean

Enables content-based deduplication for FIFO topics. For more information, see the [related documentation](https://docs.aws.amazon.com/sns/latest/dg/fifo-message-dedup.html)

[deliveryPolicy](#state_deliverypolicy_nodejs) string

The SNS delivery policy. More details in the [AWS documentation](https://docs.aws.amazon.com/sns/latest/dg/DeliveryPolicies.html).

[displayName](#state_displayname_nodejs) string

The display name for the topic

[fifoThroughputScope](#state_fifothroughputscope_nodejs) string

Enables higher throughput for FIFO topics by adjusting the scope of deduplication. This attribute has two possible values, `Topic` and `MessageGroup`. For more information, see the [related documentation](https://docs.aws.amazon.com/sns/latest/dg/fifo-high-throughput.html#enable-high-throughput-on-fifo-topic).

[fifoTopic](#state_fifotopic_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. boolean

Boolean indicating whether or not to create a FIFO (first-in-first-out) topic. FIFO topics can't deliver messages to customer managed endpoints, such as email addresses, mobile apps, SMS, or HTTP(S) endpoints. These endpoint types aren't guaranteed to preserve strict message ordering. Default is `false`.

[firehoseFailureFeedbackRoleArn](#state_firehosefailurefeedbackrolearn_nodejs) string

IAM role for failure feedback

[firehoseSuccessFeedbackRoleArn](#state_firehosesuccessfeedbackrolearn_nodejs) string

The IAM role permitted to receive success feedback for this topic

[firehoseSuccessFeedbackSampleRate](#state_firehosesuccessfeedbacksamplerate_nodejs) number

Percentage of success to sample

[httpFailureFeedbackRoleArn](#state_httpfailurefeedbackrolearn_nodejs) string

IAM role for failure feedback

[httpSuccessFeedbackRoleArn](#state_httpsuccessfeedbackrolearn_nodejs) string

The IAM role permitted to receive success feedback for this topic

[httpSuccessFeedbackSampleRate](#state_httpsuccessfeedbacksamplerate_nodejs) number

Percentage of success to sample

[kmsMasterKeyId](#state_kmsmasterkeyid_nodejs) string

The ID of an AWS-managed customer master key (CMK) for Amazon SNS or a custom CMK. For more information, see [Key Terms](https://docs.aws.amazon.com/sns/latest/dg/sns-server-side-encryption.html#sse-key-terms)

[lambdaFailureFeedbackRoleArn](#state_lambdafailurefeedbackrolearn_nodejs) string

IAM role for failure feedback

[lambdaSuccessFeedbackRoleArn](#state_lambdasuccessfeedbackrolearn_nodejs) string

The IAM role permitted to receive success feedback for this topic

[lambdaSuccessFeedbackSampleRate](#state_lambdasuccessfeedbacksamplerate_nodejs) number

Percentage of success to sample

[name](#state_name_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

The name of the topic. Topic names must be made up of only uppercase and lowercase ASCII letters, numbers, underscores, and hyphens, and must be between 1 and 256 characters long. For a FIFO (first-in-first-out) topic, the name must end with the `.fifo` suffix. If omitted, the provider will assign a random, unique name. Conflicts with `namePrefix`

[namePrefix](#state_nameprefix_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Creates a unique name beginning with the specified prefix. Conflicts with `name`

[owner](#state_owner_nodejs) string

The AWS Account ID of the SNS topic owner

[policy](#state_policy_nodejs) string

The fully-formed AWS policy as JSON.

[region](#state_region_nodejs) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[signatureVersion](#state_signatureversion_nodejs) number

If `SignatureVersion` should be [1 (SHA1) or 2 (SHA256)](https://docs.aws.amazon.com/sns/latest/dg/sns-verify-signature-of-message.html). The signature version corresponds to the hashing algorithm used while creating the signature of the notifications, subscription confirmations, or unsubscribe confirmation messages sent by Amazon SNS.

[sqsFailureFeedbackRoleArn](#state_sqsfailurefeedbackrolearn_nodejs) string

IAM role for failure feedback

[sqsSuccessFeedbackRoleArn](#state_sqssuccessfeedbackrolearn_nodejs) string

The IAM role permitted to receive success feedback for this topic

[sqsSuccessFeedbackSampleRate](#state_sqssuccessfeedbacksamplerate_nodejs) number

Percentage of success to sample

[tags](#state_tags_nodejs) {\[key: string\]: string}

Key-value map of resource tags. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tagsAll](#state_tagsall_nodejs) {\[key: string\]: string}

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[tracingConfig](#state_tracingconfig_nodejs) string

Tracing mode of an Amazon SNS topic. Valid values: `"PassThrough"`, `"Active"`.

[application\_failure\_feedback\_role\_arn](#state_application_failure_feedback_role_arn_python) str

IAM role for failure feedback

[application\_success\_feedback\_role\_arn](#state_application_success_feedback_role_arn_python) str

The IAM role permitted to receive success feedback for this topic

[application\_success\_feedback\_sample\_rate](#state_application_success_feedback_sample_rate_python) int

Percentage of success to sample

[archive\_policy](#state_archive_policy_python) str

The message archive policy for FIFO topics. More details in the [AWS documentation](https://docs.aws.amazon.com/sns/latest/dg/message-archiving-and-replay-topic-owner.html).

[arn](#state_arn_python) str

The ARN of the SNS topic, as a more obvious property (clone of id)

[beginning\_archive\_time](#state_beginning_archive_time_python) str

The oldest timestamp at which a FIFO topic subscriber can start a replay.

[content\_based\_deduplication](#state_content_based_deduplication_python) bool

Enables content-based deduplication for FIFO topics. For more information, see the [related documentation](https://docs.aws.amazon.com/sns/latest/dg/fifo-message-dedup.html)

[delivery\_policy](#state_delivery_policy_python) str

The SNS delivery policy. More details in the [AWS documentation](https://docs.aws.amazon.com/sns/latest/dg/DeliveryPolicies.html).

[display\_name](#state_display_name_python) str

The display name for the topic

[fifo\_throughput\_scope](#state_fifo_throughput_scope_python) str

Enables higher throughput for FIFO topics by adjusting the scope of deduplication. This attribute has two possible values, `Topic` and `MessageGroup`. For more information, see the [related documentation](https://docs.aws.amazon.com/sns/latest/dg/fifo-high-throughput.html#enable-high-throughput-on-fifo-topic).

[fifo\_topic](#state_fifo_topic_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. bool

Boolean indicating whether or not to create a FIFO (first-in-first-out) topic. FIFO topics can't deliver messages to customer managed endpoints, such as email addresses, mobile apps, SMS, or HTTP(S) endpoints. These endpoint types aren't guaranteed to preserve strict message ordering. Default is `false`.

[firehose\_failure\_feedback\_role\_arn](#state_firehose_failure_feedback_role_arn_python) str

IAM role for failure feedback

[firehose\_success\_feedback\_role\_arn](#state_firehose_success_feedback_role_arn_python) str

The IAM role permitted to receive success feedback for this topic

[firehose\_success\_feedback\_sample\_rate](#state_firehose_success_feedback_sample_rate_python) int

Percentage of success to sample

[http\_failure\_feedback\_role\_arn](#state_http_failure_feedback_role_arn_python) str

IAM role for failure feedback

[http\_success\_feedback\_role\_arn](#state_http_success_feedback_role_arn_python) str

The IAM role permitted to receive success feedback for this topic

[http\_success\_feedback\_sample\_rate](#state_http_success_feedback_sample_rate_python) int

Percentage of success to sample

[kms\_master\_key\_id](#state_kms_master_key_id_python) str

The ID of an AWS-managed customer master key (CMK) for Amazon SNS or a custom CMK. For more information, see [Key Terms](https://docs.aws.amazon.com/sns/latest/dg/sns-server-side-encryption.html#sse-key-terms)

[lambda\_failure\_feedback\_role\_arn](#state_lambda_failure_feedback_role_arn_python) str

IAM role for failure feedback

[lambda\_success\_feedback\_role\_arn](#state_lambda_success_feedback_role_arn_python) str

The IAM role permitted to receive success feedback for this topic

[lambda\_success\_feedback\_sample\_rate](#state_lambda_success_feedback_sample_rate_python) int

Percentage of success to sample

[name](#state_name_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

The name of the topic. Topic names must be made up of only uppercase and lowercase ASCII letters, numbers, underscores, and hyphens, and must be between 1 and 256 characters long. For a FIFO (first-in-first-out) topic, the name must end with the `.fifo` suffix. If omitted, the provider will assign a random, unique name. Conflicts with `namePrefix`

[name\_prefix](#state_name_prefix_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Creates a unique name beginning with the specified prefix. Conflicts with `name`

[owner](#state_owner_python) str

The AWS Account ID of the SNS topic owner

[policy](#state_policy_python) str

The fully-formed AWS policy as JSON.

[region](#state_region_python) str

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[signature\_version](#state_signature_version_python) int

If `SignatureVersion` should be [1 (SHA1) or 2 (SHA256)](https://docs.aws.amazon.com/sns/latest/dg/sns-verify-signature-of-message.html). The signature version corresponds to the hashing algorithm used while creating the signature of the notifications, subscription confirmations, or unsubscribe confirmation messages sent by Amazon SNS.

[sqs\_failure\_feedback\_role\_arn](#state_sqs_failure_feedback_role_arn_python) str

IAM role for failure feedback

[sqs\_success\_feedback\_role\_arn](#state_sqs_success_feedback_role_arn_python) str

The IAM role permitted to receive success feedback for this topic

[sqs\_success\_feedback\_sample\_rate](#state_sqs_success_feedback_sample_rate_python) int

Percentage of success to sample

[tags](#state_tags_python) Mapping\[str, str\]

Key-value map of resource tags. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tags\_all](#state_tags_all_python) Mapping\[str, str\]

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[tracing\_config](#state_tracing_config_python) str

Tracing mode of an Amazon SNS topic. Valid values: `"PassThrough"`, `"Active"`.

[applicationFailureFeedbackRoleArn](#state_applicationfailurefeedbackrolearn_yaml) String

IAM role for failure feedback

[applicationSuccessFeedbackRoleArn](#state_applicationsuccessfeedbackrolearn_yaml) String

The IAM role permitted to receive success feedback for this topic

[applicationSuccessFeedbackSampleRate](#state_applicationsuccessfeedbacksamplerate_yaml) Number

Percentage of success to sample

[archivePolicy](#state_archivepolicy_yaml) String

The message archive policy for FIFO topics. More details in the [AWS documentation](https://docs.aws.amazon.com/sns/latest/dg/message-archiving-and-replay-topic-owner.html).

[arn](#state_arn_yaml) String

The ARN of the SNS topic, as a more obvious property (clone of id)

[beginningArchiveTime](#state_beginningarchivetime_yaml) String

The oldest timestamp at which a FIFO topic subscriber can start a replay.

[contentBasedDeduplication](#state_contentbaseddeduplication_yaml) Boolean

Enables content-based deduplication for FIFO topics. For more information, see the [related documentation](https://docs.aws.amazon.com/sns/latest/dg/fifo-message-dedup.html)

[deliveryPolicy](#state_deliverypolicy_yaml) String

The SNS delivery policy. More details in the [AWS documentation](https://docs.aws.amazon.com/sns/latest/dg/DeliveryPolicies.html).

[displayName](#state_displayname_yaml) String

The display name for the topic

[fifoThroughputScope](#state_fifothroughputscope_yaml) String

Enables higher throughput for FIFO topics by adjusting the scope of deduplication. This attribute has two possible values, `Topic` and `MessageGroup`. For more information, see the [related documentation](https://docs.aws.amazon.com/sns/latest/dg/fifo-high-throughput.html#enable-high-throughput-on-fifo-topic).

[fifoTopic](#state_fifotopic_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. Boolean

Boolean indicating whether or not to create a FIFO (first-in-first-out) topic. FIFO topics can't deliver messages to customer managed endpoints, such as email addresses, mobile apps, SMS, or HTTP(S) endpoints. These endpoint types aren't guaranteed to preserve strict message ordering. Default is `false`.

[firehoseFailureFeedbackRoleArn](#state_firehosefailurefeedbackrolearn_yaml) String

IAM role for failure feedback

[firehoseSuccessFeedbackRoleArn](#state_firehosesuccessfeedbackrolearn_yaml) String

The IAM role permitted to receive success feedback for this topic

[firehoseSuccessFeedbackSampleRate](#state_firehosesuccessfeedbacksamplerate_yaml) Number

Percentage of success to sample

[httpFailureFeedbackRoleArn](#state_httpfailurefeedbackrolearn_yaml) String

IAM role for failure feedback

[httpSuccessFeedbackRoleArn](#state_httpsuccessfeedbackrolearn_yaml) String

The IAM role permitted to receive success feedback for this topic

[httpSuccessFeedbackSampleRate](#state_httpsuccessfeedbacksamplerate_yaml) Number

Percentage of success to sample

[kmsMasterKeyId](#state_kmsmasterkeyid_yaml) String

The ID of an AWS-managed customer master key (CMK) for Amazon SNS or a custom CMK. For more information, see [Key Terms](https://docs.aws.amazon.com/sns/latest/dg/sns-server-side-encryption.html#sse-key-terms)

[lambdaFailureFeedbackRoleArn](#state_lambdafailurefeedbackrolearn_yaml) String

IAM role for failure feedback

[lambdaSuccessFeedbackRoleArn](#state_lambdasuccessfeedbackrolearn_yaml) String

The IAM role permitted to receive success feedback for this topic

[lambdaSuccessFeedbackSampleRate](#state_lambdasuccessfeedbacksamplerate_yaml) Number

Percentage of success to sample

[name](#state_name_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

The name of the topic. Topic names must be made up of only uppercase and lowercase ASCII letters, numbers, underscores, and hyphens, and must be between 1 and 256 characters long. For a FIFO (first-in-first-out) topic, the name must end with the `.fifo` suffix. If omitted, the provider will assign a random, unique name. Conflicts with `namePrefix`

[namePrefix](#state_nameprefix_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Creates a unique name beginning with the specified prefix. Conflicts with `name`

[owner](#state_owner_yaml) String

The AWS Account ID of the SNS topic owner

[policy](#state_policy_yaml) String

The fully-formed AWS policy as JSON.

[region](#state_region_yaml) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[signatureVersion](#state_signatureversion_yaml) Number

If `SignatureVersion` should be [1 (SHA1) or 2 (SHA256)](https://docs.aws.amazon.com/sns/latest/dg/sns-verify-signature-of-message.html). The signature version corresponds to the hashing algorithm used while creating the signature of the notifications, subscription confirmations, or unsubscribe confirmation messages sent by Amazon SNS.

[sqsFailureFeedbackRoleArn](#state_sqsfailurefeedbackrolearn_yaml) String

IAM role for failure feedback

[sqsSuccessFeedbackRoleArn](#state_sqssuccessfeedbackrolearn_yaml) String

The IAM role permitted to receive success feedback for this topic

[sqsSuccessFeedbackSampleRate](#state_sqssuccessfeedbacksamplerate_yaml) Number

Percentage of success to sample

[tags](#state_tags_yaml) Map<String>

Key-value map of resource tags. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tagsAll](#state_tagsall_yaml) Map<String>

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[tracingConfig](#state_tracingconfig_yaml) String

Tracing mode of an Amazon SNS topic. Valid values: `"PassThrough"`, `"Active"`.

## Import[](#import)

### Identity Schema[](#identity-schema)

#### Required[](#required)

-   `arn` (String) Amazon Resource Name (ARN) of the SNS topic.

Using `pulumi import`, import SNS Topics using the topic `arn`. For example:

```bash
$ pulumi import aws:sns/topic:Topic user_updates arn:aws:sns:us-west-2:123456789012:my-topic
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

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2fsns%2ftopic]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2fsns%2ftopic%2f\))

#### Try Pulumi Cloud free.
Your team will thank you.

[Start free trial](https://app.pulumi.com/signup?utm_source=registry&utm_medium=right-rail-banner&utm_campaign=try-pulumi-cloud&iaid=docs-try-pulumi-cloud-ad)
