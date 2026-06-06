---
Source: https://www.pulumi.com/registry/packages/aws/api-docs/sns/topicsubscription/
Generated: 2026-06-06
Updated: 2026-06-06
---

# aws.sns.TopicSubscription

1.  [Packages](/registry/)
2.  [Packages](/registry/packages/)
3.  [AWS](/registry/packages/aws/)
4.  [API Docs](/registry/packages/aws/api-docs/)
5.  [sns](/registry/packages/aws/api-docs/sns/)
6.  [TopicSubscription](/registry/packages/aws/api-docs/sns/topicsubscription/)

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

Viewing docs for AWS v7.32.0
published on Friday, May 29, 2026 by Pulumi

[Schema (JSON)](/registry/packages/aws/schema.json)

[pulumi/pulumi-aws](https://github.com/pulumi/pulumi-aws)

v7.32.0 (7.x, latest)v6.83.1 (6.x)v5.43.0 (5.x)

# aws.sns.TopicSubscription[](#aws-sns-topicsubscription)

Explore with Neo

-   Copy Page

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2fsns%2ftopicsubscription]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2fsns%2ftopicsubscription%2f\))

Provides a resource for subscribing to SNS topics. Requires that an SNS topic exist for the subscription to attach to. This resource allows you to automatically place messages sent to SNS topics in SQS queues, send them as HTTP(S) POST requests to a given endpoint, send SMS messages, or notify devices / applications. The most likely use case for provider users will probably be SQS queues.

> **NOTE:** If the SNS topic and SQS queue are in different AWS regions, the `aws.sns.TopicSubscription` must use an AWS provider that is in the same region as the SNS topic. If the `aws.sns.TopicSubscription` uses a provider with a different region than the SNS topic, this provider will fail to create the subscription.

> **NOTE:** Setup of cross-account subscriptions from SNS topics to SQS queues requires the provider to have access to BOTH accounts.

> **NOTE:** If an SNS topic and SQS queue are in different AWS accounts but the same region, the `aws.sns.TopicSubscription` must use the AWS provider for the account with the SQS queue. If `aws.sns.TopicSubscription` uses a Provider with a different account than the SQS queue, this provider creates the subscription but does not keep state and tries to re-create the subscription at every `apply`.

> **NOTE:** If an SNS topic and SQS queue are in different AWS accounts and different AWS regions, the subscription needs to be initiated from the account with the SQS queue but in the region of the SNS topic.

> **NOTE:** You cannot unsubscribe to a subscription that is pending confirmation. If you use `email`, `email-json`, or `http`/`https` (without auto-confirmation enabled), until the subscription is confirmed (e.g., outside of this provider), AWS does not allow this provider to delete / unsubscribe the subscription. If you `destroy` an unconfirmed subscription, this provider will remove the subscription from its state but the subscription will still exist in AWS. However, if you delete an SNS topic, SNS [deletes all the subscriptions](https://docs.aws.amazon.com/sns/latest/dg/sns-delete-subscription-topic.html) associated with the topic. Also, you can import a subscription after confirmation and then have the capability to delete it.

## Example Usage[](#example-usage)

### Basic usage[](#basic-usage)

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
const sqsQueuePolicy = aws.iam.getPolicyDocumentOutput({
    policyId: "arn:aws:sqs:us-west-2:123456789012:user_updates_queue/SQSDefaultPolicy",
    statements: [{
        sid: "user_updates_sqs_target",
        effect: "Allow",
        principals: [{
            type: "Service",
            identifiers: ["sns.amazonaws.com"],
        }],
        actions: ["SQS:SendMessage"],
        resources: ["arn:aws:sqs:us-west-2:123456789012:user-updates-queue"],
        conditions: [{
            test: "ArnEquals",
            variable: "aws:SourceArn",
            values: [userUpdates.arn],
        }],
    }],
});
const userUpdatesQueue = new aws.sqs.Queue("user_updates_queue", {
    name: "user-updates-queue",
    policy: sqsQueuePolicy.apply(sqsQueuePolicy => sqsQueuePolicy.json),
});
const userUpdatesSqsTarget = new aws.sns.TopicSubscription("user_updates_sqs_target", {
    topic: userUpdates.arn,
    protocol: "sqs",
    endpoint: userUpdatesQueue.arn,
});
```

```python
import pulumi
import pulumi_aws as aws

user_updates = aws.sns.Topic("user_updates", name="user-updates-topic")
sqs_queue_policy = aws.iam.get_policy_document_output(policy_id="arn:aws:sqs:us-west-2:123456789012:user_updates_queue/SQSDefaultPolicy",
    statements=[{
        "sid": "user_updates_sqs_target",
        "effect": "Allow",
        "principals": [{
            "type": "Service",
            "identifiers": ["sns.amazonaws.com"],
        }],
        "actions": ["SQS:SendMessage"],
        "resources": ["arn:aws:sqs:us-west-2:123456789012:user-updates-queue"],
        "conditions": [{
            "test": "ArnEquals",
            "variable": "aws:SourceArn",
            "values": [user_updates.arn],
        }],
    }])
user_updates_queue = aws.sqs.Queue("user_updates_queue",
    name="user-updates-queue",
    policy=sqs_queue_policy.json)
user_updates_sqs_target = aws.sns.TopicSubscription("user_updates_sqs_target",
    topic=user_updates.arn,
    protocol="sqs",
    endpoint=user_updates_queue.arn)
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/iam"
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/sns"
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/sqs"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		userUpdates, err := sns.NewTopic(ctx, "user_updates", &sns.TopicArgs{
			Name: pulumi.String("user-updates-topic"),
		})
		if err != nil {
			return err
		}
		sqsQueuePolicy := iam.GetPolicyDocumentOutput(ctx, iam.GetPolicyDocumentOutputArgs{
			PolicyId: pulumi.String("arn:aws:sqs:us-west-2:123456789012:user_updates_queue/SQSDefaultPolicy"),
			Statements: iam.GetPolicyDocumentStatementArray{
				&iam.GetPolicyDocumentStatementArgs{
					Sid:    pulumi.String("user_updates_sqs_target"),
					Effect: pulumi.String("Allow"),
					Principals: iam.GetPolicyDocumentStatementPrincipalArray{
						&iam.GetPolicyDocumentStatementPrincipalArgs{
							Type: pulumi.String("Service"),
							Identifiers: pulumi.StringArray{
								pulumi.String("sns.amazonaws.com"),
							},
						},
					},
					Actions: pulumi.StringArray{
						pulumi.String("SQS:SendMessage"),
					},
					Resources: pulumi.StringArray{
						pulumi.String("arn:aws:sqs:us-west-2:123456789012:user-updates-queue"),
					},
					Conditions: iam.GetPolicyDocumentStatementConditionArray{
						&iam.GetPolicyDocumentStatementConditionArgs{
							Test:     pulumi.String("ArnEquals"),
							Variable: pulumi.String("aws:SourceArn"),
							Values: pulumi.StringArray{
								userUpdates.Arn,
							},
						},
					},
				},
			},
		}, nil)
		userUpdatesQueue, err := sqs.NewQueue(ctx, "user_updates_queue", &sqs.QueueArgs{
			Name: pulumi.String("user-updates-queue"),
			Policy: pulumi.String(sqsQueuePolicy.ApplyT(func(sqsQueuePolicy iam.GetPolicyDocumentResult) (*string, error) {
				return &sqsQueuePolicy.Json, nil
			}).(pulumi.StringPtrOutput)),
		})
		if err != nil {
			return err
		}
		_, err = sns.NewTopicSubscription(ctx, "user_updates_sqs_target", &sns.TopicSubscriptionArgs{
			Topic:    userUpdates.Arn,
			Protocol: pulumi.String("sqs"),
			Endpoint: userUpdatesQueue.Arn,
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

    var sqsQueuePolicy = Aws.Iam.GetPolicyDocument.Invoke(new()
    {
        PolicyId = "arn:aws:sqs:us-west-2:123456789012:user_updates_queue/SQSDefaultPolicy",
        Statements = new[]
        {
            new Aws.Iam.Inputs.GetPolicyDocumentStatementInputArgs
            {
                Sid = "user_updates_sqs_target",
                Effect = "Allow",
                Principals = new[]
                {
                    new Aws.Iam.Inputs.GetPolicyDocumentStatementPrincipalInputArgs
                    {
                        Type = "Service",
                        Identifiers = new[]
                        {
                            "sns.amazonaws.com",
                        },
                    },
                },
                Actions = new[]
                {
                    "SQS:SendMessage",
                },
                Resources = new[]
                {
                    "arn:aws:sqs:us-west-2:123456789012:user-updates-queue",
                },
                Conditions = new[]
                {
                    new Aws.Iam.Inputs.GetPolicyDocumentStatementConditionInputArgs
                    {
                        Test = "ArnEquals",
                        Variable = "aws:SourceArn",
                        Values = new[]
                        {
                            userUpdates.Arn,
                        },
                    },
                },
            },
        },
    });

    var userUpdatesQueue = new Aws.Sqs.Queue("user_updates_queue", new()
    {
        Name = "user-updates-queue",
        Policy = sqsQueuePolicy.Apply(getPolicyDocumentResult => getPolicyDocumentResult.Json),
    });

    var userUpdatesSqsTarget = new Aws.Sns.TopicSubscription("user_updates_sqs_target", new()
    {
        Topic = userUpdates.Arn,
        Protocol = "sqs",
        Endpoint = userUpdatesQueue.Arn,
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
import com.pulumi.aws.iam.IamFunctions;
import com.pulumi.aws.iam.inputs.GetPolicyDocumentArgs;
import com.pulumi.aws.sqs.Queue;
import com.pulumi.aws.sqs.QueueArgs;
import com.pulumi.aws.sns.TopicSubscription;
import com.pulumi.aws.sns.TopicSubscriptionArgs;
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

        final var sqsQueuePolicy = IamFunctions.getPolicyDocument(GetPolicyDocumentArgs.builder()
            .policyId("arn:aws:sqs:us-west-2:123456789012:user_updates_queue/SQSDefaultPolicy")
            .statements(GetPolicyDocumentStatementArgs.builder()
                .sid("user_updates_sqs_target")
                .effect("Allow")
                .principals(GetPolicyDocumentStatementPrincipalArgs.builder()
                    .type("Service")
                    .identifiers("sns.amazonaws.com")
                    .build())
                .actions("SQS:SendMessage")
                .resources("arn:aws:sqs:us-west-2:123456789012:user-updates-queue")
                .conditions(GetPolicyDocumentStatementConditionArgs.builder()
                    .test("ArnEquals")
                    .variable("aws:SourceArn")
                    .values(userUpdates.arn())
                    .build())
                .build())
            .build());

        var userUpdatesQueue = new Queue("userUpdatesQueue", QueueArgs.builder()
            .name("user-updates-queue")
            .policy(sqsQueuePolicy.applyValue(_sqsQueuePolicy -> _sqsQueuePolicy.json()))
            .build());

        var userUpdatesSqsTarget = new TopicSubscription("userUpdatesSqsTarget", TopicSubscriptionArgs.builder()
            .topic(userUpdates.arn())
            .protocol("sqs")
            .endpoint(userUpdatesQueue.arn())
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
  userUpdatesQueue:
    type: aws:sqs:Queue
    name: user_updates_queue
    properties:
      name: user-updates-queue
      policy: ${sqsQueuePolicy.json}
  userUpdatesSqsTarget:
    type: aws:sns:TopicSubscription
    name: user_updates_sqs_target
    properties:
      topic: ${userUpdates.arn}
      protocol: sqs
      endpoint: ${userUpdatesQueue.arn}
variables:
  sqsQueuePolicy:
    fn::invoke:
      function: aws:iam:getPolicyDocument
      arguments:
        policyId: arn:aws:sqs:us-west-2:123456789012:user_updates_queue/SQSDefaultPolicy
        statements:
          - sid: user_updates_sqs_target
            effect: Allow
            principals:
              - type: Service
                identifiers:
                  - sns.amazonaws.com
            actions:
              - SQS:SendMessage
            resources:
              - arn:aws:sqs:us-west-2:123456789012:user-updates-queue
            conditions:
              - test: ArnEquals
                variable: aws:SourceArn
                values:
                  - ${userUpdates.arn}
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

data "aws_iam_getpolicydocument" "sqsQueuePolicy" {
  policy_id = "arn:aws:sqs:us-west-2:123456789012:user_updates_queue/SQSDefaultPolicy"
  statements {
    sid    = "user_updates_sqs_target"
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["sns.amazonaws.com"]
    }
    actions   = ["SQS:SendMessage"]
    resources = ["arn:aws:sqs:us-west-2:123456789012:user-updates-queue"]
    conditions {
      test     = "ArnEquals"
      variable = "aws:SourceArn"
      values   = [aws_sns_topic.user_updates.arn]
    }
  }
}

resource "aws_sns_topic" "user_updates" {
  name = "user-updates-topic"
}
resource "aws_sqs_queue" "user_updates_queue" {
  name   = "user-updates-queue"
  policy = data.aws_iam_getpolicydocument.sqsQueuePolicy.json
}
resource "aws_sns_topicsubscription" "user_updates_sqs_target" {
  topic    = aws_sns_topic.user_updates.arn
  protocol = "sqs"
  endpoint = aws_sqs_queue.user_updates_queue.arn
}
```

### Example Cross-account Subscription[](#example-cross-account-subscription)

You can subscribe SNS topics to SQS queues in different Amazon accounts and regions:

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

const config = new pulumi.Config();
const sns = config.getObject<any>("sns") || {
    "account-id": "111111111111",
    displayName: "example",
    name: "example-sns-topic",
    region: "us-west-1",
    "role-name": "service/service",
};
const sqs = config.getObject<any>("sqs") || {
    "account-id": "222222222222",
    name: "example-sqs-queue",
    region: "us-east-1",
    "role-name": "service/service",
};
const snsTopicPolicy = aws.iam.getPolicyDocument({
    policyId: "__default_policy_ID",
    statements: [
        {
            actions: [
                "SNS:Subscribe",
                "SNS:SetTopicAttributes",
                "SNS:RemovePermission",
                "SNS:Publish",
                "SNS:ListSubscriptionsByTopic",
                "SNS:GetTopicAttributes",
                "SNS:DeleteTopic",
                "SNS:AddPermission",
            ],
            conditions: [{
                test: "StringEquals",
                variable: "AWS:SourceOwner",
                values: [sns["account-id"]],
            }],
            effect: "Allow",
            principals: [{
                type: "AWS",
                identifiers: ["*"],
            }],
            resources: [`arn:aws:sns:${sns.region}:${sns["account-id"]}:${sns.name}`],
            sid: "__default_statement_ID",
        },
        {
            actions: [
                "SNS:Subscribe",
                "SNS:Receive",
            ],
            conditions: [{
                test: "StringLike",
                variable: "SNS:Endpoint",
                values: [`arn:aws:sqs:${sqs.region}:${sqs["account-id"]}:${sqs.name}`],
            }],
            effect: "Allow",
            principals: [{
                type: "AWS",
                identifiers: ["*"],
            }],
            resources: [`arn:aws:sns:${sns.region}:${sns["account-id"]}:${sns.name}`],
            sid: "__console_sub_0",
        },
    ],
});
const sqsQueuePolicy = aws.iam.getPolicyDocument({
    policyId: `arn:aws:sqs:${sqs.region}:${sqs["account-id"]}:${sqs.name}/SQSDefaultPolicy`,
    statements: [{
        sid: "example-sns-topic",
        effect: "Allow",
        principals: [{
            type: "AWS",
            identifiers: ["*"],
        }],
        actions: ["SQS:SendMessage"],
        resources: [`arn:aws:sqs:${sqs.region}:${sqs["account-id"]}:${sqs.name}`],
        conditions: [{
            test: "ArnEquals",
            variable: "aws:SourceArn",
            values: [`arn:aws:sns:${sns.region}:${sns["account-id"]}:${sns.name}`],
        }],
    }],
});
const snsTopic = new aws.sns.Topic("sns_topic", {
    name: sns.name,
    displayName: sns.display_name,
    policy: snsTopicPolicy.then(snsTopicPolicy => snsTopicPolicy.json),
});
const sqsQueue = new aws.sqs.Queue("sqs_queue", {
    name: sqs.name,
    policy: sqsQueuePolicy.then(sqsQueuePolicy => sqsQueuePolicy.json),
});
const snsTopicTopicSubscription = new aws.sns.TopicSubscription("sns_topic", {
    topic: snsTopic.arn,
    protocol: "sqs",
    endpoint: sqsQueue.arn,
});
```

```python
import pulumi
import pulumi_aws as aws

config = pulumi.Config()
sns = config.get_object("sns")
if sns is None:
    sns = {
        "account-id": "111111111111",
        "displayName": "example",
        "name": "example-sns-topic",
        "region": "us-west-1",
        "role-name": "service/service",
    }
sqs = config.get_object("sqs")
if sqs is None:
    sqs = {
        "account-id": "222222222222",
        "name": "example-sqs-queue",
        "region": "us-east-1",
        "role-name": "service/service",
    }
sns_topic_policy = aws.iam.get_policy_document(policy_id="__default_policy_ID",
    statements=[
        {
            "actions": [
                "SNS:Subscribe",
                "SNS:SetTopicAttributes",
                "SNS:RemovePermission",
                "SNS:Publish",
                "SNS:ListSubscriptionsByTopic",
                "SNS:GetTopicAttributes",
                "SNS:DeleteTopic",
                "SNS:AddPermission",
            ],
            "conditions": [{
                "test": "StringEquals",
                "variable": "AWS:SourceOwner",
                "values": [sns["account-id"]],
            }],
            "effect": "Allow",
            "principals": [{
                "type": "AWS",
                "identifiers": ["*"],
            }],
            "resources": [f"arn:aws:sns:{sns['region']}:{sns['account-id']}:{sns['name']}"],
            "sid": "__default_statement_ID",
        },
        {
            "actions": [
                "SNS:Subscribe",
                "SNS:Receive",
            ],
            "conditions": [{
                "test": "StringLike",
                "variable": "SNS:Endpoint",
                "values": [f"arn:aws:sqs:{sqs['region']}:{sqs['account-id']}:{sqs['name']}"],
            }],
            "effect": "Allow",
            "principals": [{
                "type": "AWS",
                "identifiers": ["*"],
            }],
            "resources": [f"arn:aws:sns:{sns['region']}:{sns['account-id']}:{sns['name']}"],
            "sid": "__console_sub_0",
        },
    ])
sqs_queue_policy = aws.iam.get_policy_document(policy_id=f"arn:aws:sqs:{sqs['region']}:{sqs['account-id']}:{sqs['name']}/SQSDefaultPolicy",
    statements=[{
        "sid": "example-sns-topic",
        "effect": "Allow",
        "principals": [{
            "type": "AWS",
            "identifiers": ["*"],
        }],
        "actions": ["SQS:SendMessage"],
        "resources": [f"arn:aws:sqs:{sqs['region']}:{sqs['account-id']}:{sqs['name']}"],
        "conditions": [{
            "test": "ArnEquals",
            "variable": "aws:SourceArn",
            "values": [f"arn:aws:sns:{sns['region']}:{sns['account-id']}:{sns['name']}"],
        }],
    }])
sns_topic = aws.sns.Topic("sns_topic",
    name=sns["name"],
    display_name=sns["display_name"],
    policy=sns_topic_policy.json)
sqs_queue = aws.sqs.Queue("sqs_queue",
    name=sqs["name"],
    policy=sqs_queue_policy.json)
sns_topic_topic_subscription = aws.sns.TopicSubscription("sns_topic",
    topic=sns_topic.arn,
    protocol="sqs",
    endpoint=sqs_queue.arn)
```

```go
package main

import (
	"fmt"

	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/iam"
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/sns"
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/sqs"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi/config"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		cfg := config.New(ctx, "")
		sns2 := map[string]interface{}{
			"account-id":  "111111111111",
			"displayName": "example",
			"name":        "example-sns-topic",
			"region":      "us-west-1",
			"role-name":   "service/service",
		}
		if param := cfg.GetObject("sns"); param != nil {
			sns2 = param
		}
		sqs2 := map[string]interface{}{
			"account-id": "222222222222",
			"name":       "example-sqs-queue",
			"region":     "us-east-1",
			"role-name":  "service/service",
		}
		if param := cfg.GetObject("sqs"); param != nil {
			sqs2 = param
		}
		snsTopicPolicy, err := iam.GetPolicyDocument(ctx, &iam.GetPolicyDocumentArgs{
			PolicyId: pulumi.StringRef("__default_policy_ID"),
			Statements: []iam.GetPolicyDocumentStatement{
				{
					Actions: []string{
						"SNS:Subscribe",
						"SNS:SetTopicAttributes",
						"SNS:RemovePermission",
						"SNS:Publish",
						"SNS:ListSubscriptionsByTopic",
						"SNS:GetTopicAttributes",
						"SNS:DeleteTopic",
						"SNS:AddPermission",
					},
					Conditions: []iam.GetPolicyDocumentStatementCondition{
						{
							Test:     "StringEquals",
							Variable: "AWS:SourceOwner",
							Values: pulumi.StringArray{
								sns2.AccountId,
							},
						},
					},
					Effect: pulumi.StringRef("Allow"),
					Principals: []iam.GetPolicyDocumentStatementPrincipal{
						{
							Type: "AWS",
							Identifiers: []string{
								"*",
							},
						},
					},
					Resources: []string{
						fmt.Sprintf("arn:aws:sns:%v:%v:%v", sns2.Region, sns2.AccountId, sns2.Name),
					},
					Sid: pulumi.StringRef("__default_statement_ID"),
				},
				{
					Actions: []string{
						"SNS:Subscribe",
						"SNS:Receive",
					},
					Conditions: []iam.GetPolicyDocumentStatementCondition{
						{
							Test:     "StringLike",
							Variable: "SNS:Endpoint",
							Values: []string{
								fmt.Sprintf("arn:aws:sqs:%v:%v:%v", sqs2.Region, sqs2.AccountId, sqs2.Name),
							},
						},
					},
					Effect: pulumi.StringRef("Allow"),
					Principals: []iam.GetPolicyDocumentStatementPrincipal{
						{
							Type: "AWS",
							Identifiers: []string{
								"*",
							},
						},
					},
					Resources: []string{
						fmt.Sprintf("arn:aws:sns:%v:%v:%v", sns2.Region, sns2.AccountId, sns2.Name),
					},
					Sid: pulumi.StringRef("__console_sub_0"),
				},
			},
		}, nil)
		if err != nil {
			return err
		}
		sqsQueuePolicy, err := iam.GetPolicyDocument(ctx, &iam.GetPolicyDocumentArgs{
			PolicyId: pulumi.StringRef(fmt.Sprintf("arn:aws:sqs:%v:%v:%v/SQSDefaultPolicy", sqs2.Region, sqs2.AccountId, sqs2.Name)),
			Statements: []iam.GetPolicyDocumentStatement{
				{
					Sid:    pulumi.StringRef("example-sns-topic"),
					Effect: pulumi.StringRef("Allow"),
					Principals: []iam.GetPolicyDocumentStatementPrincipal{
						{
							Type: "AWS",
							Identifiers: []string{
								"*",
							},
						},
					},
					Actions: []string{
						"SQS:SendMessage",
					},
					Resources: []string{
						fmt.Sprintf("arn:aws:sqs:%v:%v:%v", sqs2.Region, sqs2.AccountId, sqs2.Name),
					},
					Conditions: []iam.GetPolicyDocumentStatementCondition{
						{
							Test:     "ArnEquals",
							Variable: "aws:SourceArn",
							Values: []string{
								fmt.Sprintf("arn:aws:sns:%v:%v:%v", sns2.Region, sns2.AccountId, sns2.Name),
							},
						},
					},
				},
			},
		}, nil)
		if err != nil {
			return err
		}
		snsTopic, err := sns.NewTopic(ctx, "sns_topic", &sns.TopicArgs{
			Name:        pulumi.Any(sns2.Name),
			DisplayName: pulumi.Any(sns2.Display_name),
			Policy:      pulumi.String(pulumi.String(snsTopicPolicy.Json)),
		})
		if err != nil {
			return err
		}
		sqsQueue, err := sqs.NewQueue(ctx, "sqs_queue", &sqs.QueueArgs{
			Name:   pulumi.Any(sqs2.Name),
			Policy: pulumi.String(pulumi.String(sqsQueuePolicy.Json)),
		})
		if err != nil {
			return err
		}
		_, err = sns.NewTopicSubscription(ctx, "sns_topic", &sns.TopicSubscriptionArgs{
			Topic:    snsTopic.Arn,
			Protocol: pulumi.String("sqs"),
			Endpoint: sqsQueue.Arn,
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
    var config = new Config();
    var sns = config.GetObject<dynamic>("sns") ??
    {
        { "account-id", "111111111111" },
        { "displayName", "example" },
        { "name", "example-sns-topic" },
        { "region", "us-west-1" },
        { "role-name", "service/service" },
    };
    var sqs = config.GetObject<dynamic>("sqs") ??
    {
        { "account-id", "222222222222" },
        { "name", "example-sqs-queue" },
        { "region", "us-east-1" },
        { "role-name", "service/service" },
    };
    var snsTopicPolicy = Aws.Iam.GetPolicyDocument.Invoke(new()
    {
        PolicyId = "__default_policy_ID",
        Statements = new[]
        {
            new Aws.Iam.Inputs.GetPolicyDocumentStatementInputArgs
            {
                Actions = new[]
                {
                    "SNS:Subscribe",
                    "SNS:SetTopicAttributes",
                    "SNS:RemovePermission",
                    "SNS:Publish",
                    "SNS:ListSubscriptionsByTopic",
                    "SNS:GetTopicAttributes",
                    "SNS:DeleteTopic",
                    "SNS:AddPermission",
                },
                Conditions = new[]
                {
                    new Aws.Iam.Inputs.GetPolicyDocumentStatementConditionInputArgs
                    {
                        Test = "StringEquals",
                        Variable = "AWS:SourceOwner",
                        Values = new[]
                        {
                            sns.Account_id,
                        },
                    },
                },
                Effect = "Allow",
                Principals = new[]
                {
                    new Aws.Iam.Inputs.GetPolicyDocumentStatementPrincipalInputArgs
                    {
                        Type = "AWS",
                        Identifiers = new[]
                        {
                            "*",
                        },
                    },
                },
                Resources = new[]
                {
                    $"arn:aws:sns:{sns.Region}:{sns.Account_id}:{sns.Name}",
                },
                Sid = "__default_statement_ID",
            },
            new Aws.Iam.Inputs.GetPolicyDocumentStatementInputArgs
            {
                Actions = new[]
                {
                    "SNS:Subscribe",
                    "SNS:Receive",
                },
                Conditions = new[]
                {
                    new Aws.Iam.Inputs.GetPolicyDocumentStatementConditionInputArgs
                    {
                        Test = "StringLike",
                        Variable = "SNS:Endpoint",
                        Values = new[]
                        {
                            $"arn:aws:sqs:{sqs.Region}:{sqs.Account_id}:{sqs.Name}",
                        },
                    },
                },
                Effect = "Allow",
                Principals = new[]
                {
                    new Aws.Iam.Inputs.GetPolicyDocumentStatementPrincipalInputArgs
                    {
                        Type = "AWS",
                        Identifiers = new[]
                        {
                            "*",
                        },
                    },
                },
                Resources = new[]
                {
                    $"arn:aws:sns:{sns.Region}:{sns.Account_id}:{sns.Name}",
                },
                Sid = "__console_sub_0",
            },
        },
    });

    var sqsQueuePolicy = Aws.Iam.GetPolicyDocument.Invoke(new()
    {
        PolicyId = $"arn:aws:sqs:{sqs.Region}:{sqs.Account_id}:{sqs.Name}/SQSDefaultPolicy",
        Statements = new[]
        {
            new Aws.Iam.Inputs.GetPolicyDocumentStatementInputArgs
            {
                Sid = "example-sns-topic",
                Effect = "Allow",
                Principals = new[]
                {
                    new Aws.Iam.Inputs.GetPolicyDocumentStatementPrincipalInputArgs
                    {
                        Type = "AWS",
                        Identifiers = new[]
                        {
                            "*",
                        },
                    },
                },
                Actions = new[]
                {
                    "SQS:SendMessage",
                },
                Resources = new[]
                {
                    $"arn:aws:sqs:{sqs.Region}:{sqs.Account_id}:{sqs.Name}",
                },
                Conditions = new[]
                {
                    new Aws.Iam.Inputs.GetPolicyDocumentStatementConditionInputArgs
                    {
                        Test = "ArnEquals",
                        Variable = "aws:SourceArn",
                        Values = new[]
                        {
                            $"arn:aws:sns:{sns.Region}:{sns.Account_id}:{sns.Name}",
                        },
                    },
                },
            },
        },
    });

    var snsTopic = new Aws.Sns.Topic("sns_topic", new()
    {
        Name = sns.Name,
        DisplayName = sns.Display_name,
        Policy = snsTopicPolicy.Apply(getPolicyDocumentResult => getPolicyDocumentResult.Json),
    });

    var sqsQueue = new Aws.Sqs.Queue("sqs_queue", new()
    {
        Name = sqs.Name,
        Policy = sqsQueuePolicy.Apply(getPolicyDocumentResult => getPolicyDocumentResult.Json),
    });

    var snsTopicTopicSubscription = new Aws.Sns.TopicSubscription("sns_topic", new()
    {
        Topic = snsTopic.Arn,
        Protocol = "sqs",
        Endpoint = sqsQueue.Arn,
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.iam.IamFunctions;
import com.pulumi.aws.iam.inputs.GetPolicyDocumentArgs;
import com.pulumi.aws.sns.Topic;
import com.pulumi.aws.sns.TopicArgs;
import com.pulumi.aws.sqs.Queue;
import com.pulumi.aws.sqs.QueueArgs;
import com.pulumi.aws.sns.TopicSubscription;
import com.pulumi.aws.sns.TopicSubscriptionArgs;
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
        final var sns = config.get("sns").orElse(Map.ofEntries(
            Map.entry("account-id", "111111111111"),
            Map.entry("displayName", "example"),
            Map.entry("name", "example-sns-topic"),
            Map.entry("region", "us-west-1"),
            Map.entry("role-name", "service/service")
        ));
        final var sqs = config.get("sqs").orElse(Map.ofEntries(
            Map.entry("account-id", "222222222222"),
            Map.entry("name", "example-sqs-queue"),
            Map.entry("region", "us-east-1"),
            Map.entry("role-name", "service/service")
        ));
        final var snsTopicPolicy = IamFunctions.getPolicyDocument(GetPolicyDocumentArgs.builder()
            .policyId("__default_policy_ID")
            .statements(
                GetPolicyDocumentStatementArgs.builder()
                    .actions(
                        "SNS:Subscribe",
                        "SNS:SetTopicAttributes",
                        "SNS:RemovePermission",
                        "SNS:Publish",
                        "SNS:ListSubscriptionsByTopic",
                        "SNS:GetTopicAttributes",
                        "SNS:DeleteTopic",
                        "SNS:AddPermission")
                    .conditions(GetPolicyDocumentStatementConditionArgs.builder()
                        .test("StringEquals")
                        .variable("AWS:SourceOwner")
                        .values(sns.account-id())
                        .build())
                    .effect("Allow")
                    .principals(GetPolicyDocumentStatementPrincipalArgs.builder()
                        .type("AWS")
                        .identifiers("*")
                        .build())
                    .resources(String.format("arn:aws:sns:%s:%s:%s", sns.region(),sns.account-id(),sns.name()))
                    .sid("__default_statement_ID")
                    .build(),
                GetPolicyDocumentStatementArgs.builder()
                    .actions(
                        "SNS:Subscribe",
                        "SNS:Receive")
                    .conditions(GetPolicyDocumentStatementConditionArgs.builder()
                        .test("StringLike")
                        .variable("SNS:Endpoint")
                        .values(String.format("arn:aws:sqs:%s:%s:%s", sqs.region(),sqs.account-id(),sqs.name()))
                        .build())
                    .effect("Allow")
                    .principals(GetPolicyDocumentStatementPrincipalArgs.builder()
                        .type("AWS")
                        .identifiers("*")
                        .build())
                    .resources(String.format("arn:aws:sns:%s:%s:%s", sns.region(),sns.account-id(),sns.name()))
                    .sid("__console_sub_0")
                    .build())
            .build());

        final var sqsQueuePolicy = IamFunctions.getPolicyDocument(GetPolicyDocumentArgs.builder()
            .policyId(String.format("arn:aws:sqs:%s:%s:%s/SQSDefaultPolicy", sqs.region(),sqs.account-id(),sqs.name()))
            .statements(GetPolicyDocumentStatementArgs.builder()
                .sid("example-sns-topic")
                .effect("Allow")
                .principals(GetPolicyDocumentStatementPrincipalArgs.builder()
                    .type("AWS")
                    .identifiers("*")
                    .build())
                .actions("SQS:SendMessage")
                .resources(String.format("arn:aws:sqs:%s:%s:%s", sqs.region(),sqs.account-id(),sqs.name()))
                .conditions(GetPolicyDocumentStatementConditionArgs.builder()
                    .test("ArnEquals")
                    .variable("aws:SourceArn")
                    .values(String.format("arn:aws:sns:%s:%s:%s", sns.region(),sns.account-id(),sns.name()))
                    .build())
                .build())
            .build());

        var snsTopic = new Topic("snsTopic", TopicArgs.builder()
            .name(sns.name())
            .displayName(sns.display_name())
            .policy(snsTopicPolicy.json())
            .build());

        var sqsQueue = new Queue("sqsQueue", QueueArgs.builder()
            .name(sqs.name())
            .policy(sqsQueuePolicy.json())
            .build());

        var snsTopicTopicSubscription = new TopicSubscription("snsTopicTopicSubscription", TopicSubscriptionArgs.builder()
            .topic(snsTopic.arn())
            .protocol("sqs")
            .endpoint(sqsQueue.arn())
            .build());

    }
}
```

```yaml
configuration:
  sns:
    type: object
    default:
      account-id: '111111111111'
      displayName: example
      name: example-sns-topic
      region: us-west-1
      role-name: service/service
  sqs:
    type: object
    default:
      account-id: '222222222222'
      name: example-sqs-queue
      region: us-east-1
      role-name: service/service
resources:
  snsTopic:
    type: aws:sns:Topic
    name: sns_topic
    properties:
      name: ${sns["name"]}
      displayName: ${sns["display_name"]}
      policy: ${snsTopicPolicy.json}
  sqsQueue:
    type: aws:sqs:Queue
    name: sqs_queue
    properties:
      name: ${sqs["name"]}
      policy: ${sqsQueuePolicy.json}
  snsTopicTopicSubscription:
    type: aws:sns:TopicSubscription
    name: sns_topic
    properties:
      topic: ${snsTopic.arn}
      protocol: sqs
      endpoint: ${sqsQueue.arn}
variables:
  snsTopicPolicy:
    fn::invoke:
      function: aws:iam:getPolicyDocument
      arguments:
        policyId: __default_policy_ID
        statements:
          - actions:
              - SNS:Subscribe
              - SNS:SetTopicAttributes
              - SNS:RemovePermission
              - SNS:Publish
              - SNS:ListSubscriptionsByTopic
              - SNS:GetTopicAttributes
              - SNS:DeleteTopic
              - SNS:AddPermission
            conditions:
              - test: StringEquals
                variable: AWS:SourceOwner
                values:
                  - ${sns["account-id"]}
            effect: Allow
            principals:
              - type: AWS
                identifiers:
                  - '*'
            resources:
              - arn:aws:sns:${sns["region"]}:${sns["account-id"]}:${sns["name"]}
            sid: __default_statement_ID
          - actions:
              - SNS:Subscribe
              - SNS:Receive
            conditions:
              - test: StringLike
                variable: SNS:Endpoint
                values:
                  - arn:aws:sqs:${sqs["region"]}:${sqs["account-id"]}:${sqs["name"]}
            effect: Allow
            principals:
              - type: AWS
                identifiers:
                  - '*'
            resources:
              - arn:aws:sns:${sns["region"]}:${sns["account-id"]}:${sns["name"]}
            sid: __console_sub_0
  sqsQueuePolicy:
    fn::invoke:
      function: aws:iam:getPolicyDocument
      arguments:
        policyId: arn:aws:sqs:${sqs["region"]}:${sqs["account-id"]}:${sqs["name"]}/SQSDefaultPolicy
        statements:
          - sid: example-sns-topic
            effect: Allow
            principals:
              - type: AWS
                identifiers:
                  - '*'
            actions:
              - SQS:SendMessage
            resources:
              - arn:aws:sqs:${sqs["region"]}:${sqs["account-id"]}:${sqs["name"]}
            conditions:
              - test: ArnEquals
                variable: aws:SourceArn
                values:
                  - arn:aws:sns:${sns["region"]}:${sns["account-id"]}:${sns["name"]}
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

data "aws_iam_getpolicydocument" "snsTopicPolicy" {
  policy_id = "__default_policy_ID"
  statements {
    actions = ["SNS:Subscribe", "SNS:SetTopicAttributes", "SNS:RemovePermission", "SNS:Publish", "SNS:ListSubscriptionsByTopic", "SNS:GetTopicAttributes", "SNS:DeleteTopic", "SNS:AddPermission"]
    conditions {
      test     = "StringEquals"
      variable = "AWS:SourceOwner"
      values   = [var.sns["account-id"]]
    }
    effect = "Allow"
    principals {
      type        = "AWS"
      identifiers = ["*"]
    }
    resources = ["arn:aws:sns:${var.sns["region"]}:${var.sns["account-id"]}:${var.sns["name"]}"]
    sid       = "__default_statement_ID"
  }
  statements {
    actions = ["SNS:Subscribe", "SNS:Receive"]
    conditions {
      test     = "StringLike"
      variable = "SNS:Endpoint"
      values   = ["arn:aws:sqs:${var.sqs["region"]}:${var.sqs["account-id"]}:${var.sqs["name"]}"]
    }
    effect = "Allow"
    principals {
      type        = "AWS"
      identifiers = ["*"]
    }
    resources = ["arn:aws:sns:${var.sns["region"]}:${var.sns["account-id"]}:${var.sns["name"]}"]
    sid       = "__console_sub_0"
  }
}
data "aws_iam_getpolicydocument" "sqsQueuePolicy" {
  policy_id ="arn:aws:sqs:${var.sqs["region"]}:${var.sqs["account-id"]}:${var.sqs["name"]}/SQSDefaultPolicy"
  statements {
    sid    = "example-sns-topic"
    effect = "Allow"
    principals {
      type        = "AWS"
      identifiers = ["*"]
    }
    actions   = ["SQS:SendMessage"]
    resources = ["arn:aws:sqs:${var.sqs["region"]}:${var.sqs["account-id"]}:${var.sqs["name"]}"]
    conditions {
      test     = "ArnEquals"
      variable = "aws:SourceArn"
      values   = ["arn:aws:sns:${var.sns["region"]}:${var.sns["account-id"]}:${var.sns["name"]}"]
    }
  }
}

resource "aws_sns_topic" "sns_topic" {
  name         = var.sns["name"]
  display_name = var.sns["display_name"]
  policy       = data.aws_iam_getpolicydocument.snsTopicPolicy.json
}
resource "aws_sqs_queue" "sqs_queue" {
  name   = var.sqs["name"]
  policy = data.aws_iam_getpolicydocument.sqsQueuePolicy.json
}
resource "aws_sns_topicsubscription" "sns_topic" {
  topic    = aws_sns_topic.sns_topic.arn
  protocol = "sqs"
  endpoint = aws_sqs_queue.sqs_queue.arn
}
variable "sns" {
  default = {
    "account-id"  = "111111111111"
    "displayName" = "example"
    "name"        = "example-sns-topic"
    "region"      = "us-west-1"
    "role-name"   = "service/service"
  }
}
variable "sqs" {
  default = {
    "account-id" = "222222222222"
    "name"       = "example-sqs-queue"
    "region"     = "us-east-1"
    "role-name"  = "service/service"
  }
}
```

### Example with Delivery Policy[](#example-with-delivery-policy)

This example demonstrates how to define a `deliveryPolicy` for an HTTPS subscription. Unlike the `aws.sns.Topic` resource, the `deliveryPolicy` for `aws.sns.TopicSubscription` should not be wrapped in an `"http"` object.

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

const exampleWithDeliveryPolicy = new aws.sns.TopicSubscription("example_with_delivery_policy", {
    topic: "arn:aws:sns:us-west-2:123456789012:my-topic",
    protocol: "https",
    endpoint: "https://example.com/endpoint",
    rawMessageDelivery: true,
    deliveryPolicy: `{
  \\"healthyRetryPolicy\\": {
    \\"minDelayTarget\\": 20,
    \\"maxDelayTarget\\": 20,
    \\"numRetries\\": 3,
    \\"numMaxDelayRetries\\": 0,
    \\"numNoDelayRetries\\": 0,
    \\"numMinDelayRetries\\": 0,
    \\"backoffFunction\\": \\"linear\\"
  },
  \\"sicklyRetryPolicy\\": null,
  \\"throttlePolicy\\": null,
  \\"requestPolicy\\": {
    \\"headerContentType\\": \\"text/plain; application/json\\"
  },
  \\"guaranteed\\": false
}
`,
});
```

```python
import pulumi
import pulumi_aws as aws

example_with_delivery_policy = aws.sns.TopicSubscription("example_with_delivery_policy",
    topic="arn:aws:sns:us-west-2:123456789012:my-topic",
    protocol="https",
    endpoint="https://example.com/endpoint",
    raw_message_delivery=True,
    delivery_policy="""{
  \"healthyRetryPolicy\": {
    \"minDelayTarget\": 20,
    \"maxDelayTarget\": 20,
    \"numRetries\": 3,
    \"numMaxDelayRetries\": 0,
    \"numNoDelayRetries\": 0,
    \"numMinDelayRetries\": 0,
    \"backoffFunction\": \"linear\"
  },
  \"sicklyRetryPolicy\": null,
  \"throttlePolicy\": null,
  \"requestPolicy\": {
    \"headerContentType\": \"text/plain; application/json\"
  },
  \"guaranteed\": false
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
		_, err := sns.NewTopicSubscription(ctx, "example_with_delivery_policy", &sns.TopicSubscriptionArgs{
			Topic:              pulumi.Any("arn:aws:sns:us-west-2:123456789012:my-topic"),
			Protocol:           pulumi.String("https"),
			Endpoint:           pulumi.String("https://example.com/endpoint"),
			RawMessageDelivery: pulumi.Bool(true),
			DeliveryPolicy: pulumi.String(`{
  \"healthyRetryPolicy\": {
    \"minDelayTarget\": 20,
    \"maxDelayTarget\": 20,
    \"numRetries\": 3,
    \"numMaxDelayRetries\": 0,
    \"numNoDelayRetries\": 0,
    \"numMinDelayRetries\": 0,
    \"backoffFunction\": \"linear\"
  },
  \"sicklyRetryPolicy\": null,
  \"throttlePolicy\": null,
  \"requestPolicy\": {
    \"headerContentType\": \"text/plain; application/json\"
  },
  \"guaranteed\": false
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
    var exampleWithDeliveryPolicy = new Aws.Sns.TopicSubscription("example_with_delivery_policy", new()
    {
        Topic = "arn:aws:sns:us-west-2:123456789012:my-topic",
        Protocol = "https",
        Endpoint = "https://example.com/endpoint",
        RawMessageDelivery = true,
        DeliveryPolicy = @"{
  \""healthyRetryPolicy\"": {
    \""minDelayTarget\"": 20,
    \""maxDelayTarget\"": 20,
    \""numRetries\"": 3,
    \""numMaxDelayRetries\"": 0,
    \""numNoDelayRetries\"": 0,
    \""numMinDelayRetries\"": 0,
    \""backoffFunction\"": \""linear\""
  },
  \""sicklyRetryPolicy\"": null,
  \""throttlePolicy\"": null,
  \""requestPolicy\"": {
    \""headerContentType\"": \""text/plain; application/json\""
  },
  \""guaranteed\"": false
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
import com.pulumi.aws.sns.TopicSubscription;
import com.pulumi.aws.sns.TopicSubscriptionArgs;
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
        var exampleWithDeliveryPolicy = new TopicSubscription("exampleWithDeliveryPolicy", TopicSubscriptionArgs.builder()
            .topic("arn:aws:sns:us-west-2:123456789012:my-topic")
            .protocol("https")
            .endpoint("https://example.com/endpoint")
            .rawMessageDelivery(true)
            .deliveryPolicy("""
{
  \"healthyRetryPolicy\": {
    \"minDelayTarget\": 20,
    \"maxDelayTarget\": 20,
    \"numRetries\": 3,
    \"numMaxDelayRetries\": 0,
    \"numNoDelayRetries\": 0,
    \"numMinDelayRetries\": 0,
    \"backoffFunction\": \"linear\"
  },
  \"sicklyRetryPolicy\": null,
  \"throttlePolicy\": null,
  \"requestPolicy\": {
    \"headerContentType\": \"text/plain; application/json\"
  },
  \"guaranteed\": false
}
            """)
            .build());

    }
}
```

```yaml
resources:
  exampleWithDeliveryPolicy:
    type: aws:sns:TopicSubscription
    name: example_with_delivery_policy
    properties:
      topic: arn:aws:sns:us-west-2:123456789012:my-topic
      protocol: https
      endpoint: https://example.com/endpoint
      rawMessageDelivery: true
      deliveryPolicy: |
        {
          \"healthyRetryPolicy\": {
            \"minDelayTarget\": 20,
            \"maxDelayTarget\": 20,
            \"numRetries\": 3,
            \"numMaxDelayRetries\": 0,
            \"numNoDelayRetries\": 0,
            \"numMinDelayRetries\": 0,
            \"backoffFunction\": \"linear\"
          },
          \"sicklyRetryPolicy\": null,
          \"throttlePolicy\": null,
          \"requestPolicy\": {
            \"headerContentType\": \"text/plain; application/json\"
          },
          \"guaranteed\": false
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

resource "aws_sns_topicsubscription" "example_with_delivery_policy" {
  topic                = "arn:aws:sns:us-west-2:123456789012:my-topic"
  protocol             = "https"
  endpoint             = "https://example.com/endpoint"
  raw_message_delivery = true
  delivery_policy      = "{\n  \\\"healthyRetryPolicy\\\": {\n    \\\"minDelayTarget\\\": 20,\n    \\\"maxDelayTarget\\\": 20,\n    \\\"numRetries\\\": 3,\n    \\\"numMaxDelayRetries\\\": 0,\n    \\\"numNoDelayRetries\\\": 0,\n    \\\"numMinDelayRetries\\\": 0,\n    \\\"backoffFunction\\\": \\\"linear\\\"\n  },\n  \\\"sicklyRetryPolicy\\\": null,\n  \\\"throttlePolicy\\\": null,\n  \\\"requestPolicy\\\": {\n    \\\"headerContentType\\\": \\\"text/plain; application/json\\\"\n  },\n  \\\"guaranteed\\\": false\n}\n"
}
```

## Create TopicSubscription Resource[](#create)

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
new TopicSubscription(name: string, args: TopicSubscriptionArgs, opts?: CustomResourceOptions);
```

```python
@overload
def TopicSubscription(resource_name: str,
                      args: TopicSubscriptionArgs,
                      opts: Optional[ResourceOptions] = None)

@overload
def TopicSubscription(resource_name: str,
                      opts: Optional[ResourceOptions] = None,
                      protocol: Optional[str] = None,
                      topic: Optional[str] = None,
                      endpoint: Optional[str] = None,
                      endpoint_auto_confirms: Optional[bool] = None,
                      filter_policy: Optional[str] = None,
                      filter_policy_scope: Optional[str] = None,
                      confirmation_timeout_in_minutes: Optional[int] = None,
                      raw_message_delivery: Optional[bool] = None,
                      redrive_policy: Optional[str] = None,
                      region: Optional[str] = None,
                      replay_policy: Optional[str] = None,
                      subscription_role_arn: Optional[str] = None,
                      delivery_policy: Optional[str] = None)
```

```go
func NewTopicSubscription(ctx *Context, name string, args TopicSubscriptionArgs, opts ...ResourceOption) (*TopicSubscription, error)
```

```csharp
public TopicSubscription(string name, TopicSubscriptionArgs args, CustomResourceOptions? opts = null)
```

```java
public TopicSubscription(String name, TopicSubscriptionArgs args)
public TopicSubscription(String name, TopicSubscriptionArgs args, CustomResourceOptions options)
```

```yaml
type: aws:sns:TopicSubscription
properties: # The arguments to resource properties.
options: # Bag of options to control resource's behavior.
```

```hcl
resource "aws_sns_topicsubscription" "name" {
    # resource properties
}
```

#### Parameters[](#parameters)

name This property is required. string

The unique name of the resource.

args This property is required. [TopicSubscriptionArgs](#inputs)

The arguments to resource properties.

opts [CustomResourceOptions](/docs/reference/pkg/nodejs/pulumi/pulumi/#CustomResourceOptions)

Bag of options to control resource's behavior.

resource\_name This property is required. str

The unique name of the resource.

args This property is required. [TopicSubscriptionArgs](#inputs)

The arguments to resource properties.

opts [ResourceOptions](/docs/reference/pkg/python/pulumi/#pulumi.ResourceOptions)

Bag of options to control resource's behavior.

ctx [Context](https://pkg.go.dev/github.com/pulumi/pulumi/sdk/v3/go/pulumi?tab=doc#Context)

Context object for the current deployment.

name This property is required. string

The unique name of the resource.

args This property is required. [TopicSubscriptionArgs](#inputs)

The arguments to resource properties.

opts [ResourceOption](https://pkg.go.dev/github.com/pulumi/pulumi/sdk/v3/go/pulumi?tab=doc#ResourceOption)

Bag of options to control resource's behavior.

name This property is required. string

The unique name of the resource.

args This property is required. [TopicSubscriptionArgs](#inputs)

The arguments to resource properties.

opts [CustomResourceOptions](/docs/reference/pkg/dotnet/Pulumi/Pulumi.CustomResourceOptions.html)

Bag of options to control resource's behavior.

name This property is required. String

The unique name of the resource.

args This property is required. [TopicSubscriptionArgs](#inputs)

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
var topicSubscriptionResource = new Aws.Sns.TopicSubscription("topicSubscriptionResource", new()
{
    Protocol = "string",
    Topic = "string",
    Endpoint = "string",
    EndpointAutoConfirms = false,
    FilterPolicy = "string",
    FilterPolicyScope = "string",
    ConfirmationTimeoutInMinutes = 0,
    RawMessageDelivery = false,
    RedrivePolicy = "string",
    Region = "string",
    ReplayPolicy = "string",
    SubscriptionRoleArn = "string",
    DeliveryPolicy = "string",
});
```

```go
example, err := sns.NewTopicSubscription(ctx, "topicSubscriptionResource", &sns.TopicSubscriptionArgs{
	Protocol:                     pulumi.String("string"),
	Topic:                        pulumi.Any("string"),
	Endpoint:                     pulumi.String("string"),
	EndpointAutoConfirms:         pulumi.Bool(false),
	FilterPolicy:                 pulumi.String("string"),
	FilterPolicyScope:            pulumi.String("string"),
	ConfirmationTimeoutInMinutes: pulumi.Int(0),
	RawMessageDelivery:           pulumi.Bool(false),
	RedrivePolicy:                pulumi.String("string"),
	Region:                       pulumi.String("string"),
	ReplayPolicy:                 pulumi.String("string"),
	SubscriptionRoleArn:          pulumi.String("string"),
	DeliveryPolicy:               pulumi.String("string"),
})
```

```hcl
resource "aws_sns_topicsubscription" "topicSubscriptionResource" {
  protocol                        = "string"
  topic                           = "string"
  endpoint                        = "string"
  endpoint_auto_confirms          = false
  filter_policy                   = "string"
  filter_policy_scope             = "string"
  confirmation_timeout_in_minutes = 0
  raw_message_delivery            = false
  redrive_policy                  = "string"
  region                          = "string"
  replay_policy                   = "string"
  subscription_role_arn           = "string"
  delivery_policy                 = "string"
}
```

```java
var topicSubscriptionResource = new TopicSubscription("topicSubscriptionResource", TopicSubscriptionArgs.builder()
    .protocol("string")
    .topic("string")
    .endpoint("string")
    .endpointAutoConfirms(false)
    .filterPolicy("string")
    .filterPolicyScope("string")
    .confirmationTimeoutInMinutes(0)
    .rawMessageDelivery(false)
    .redrivePolicy("string")
    .region("string")
    .replayPolicy("string")
    .subscriptionRoleArn("string")
    .deliveryPolicy("string")
    .build());
```

```python
topic_subscription_resource = aws.sns.TopicSubscription("topicSubscriptionResource",
    protocol="string",
    topic="string",
    endpoint="string",
    endpoint_auto_confirms=False,
    filter_policy="string",
    filter_policy_scope="string",
    confirmation_timeout_in_minutes=0,
    raw_message_delivery=False,
    redrive_policy="string",
    region="string",
    replay_policy="string",
    subscription_role_arn="string",
    delivery_policy="string")
```

```typescript
const topicSubscriptionResource = new aws.sns.TopicSubscription("topicSubscriptionResource", {
    protocol: "string",
    topic: "string",
    endpoint: "string",
    endpointAutoConfirms: false,
    filterPolicy: "string",
    filterPolicyScope: "string",
    confirmationTimeoutInMinutes: 0,
    rawMessageDelivery: false,
    redrivePolicy: "string",
    region: "string",
    replayPolicy: "string",
    subscriptionRoleArn: "string",
    deliveryPolicy: "string",
});
```

```yaml
type: aws:sns:TopicSubscription
properties:
    confirmationTimeoutInMinutes: 0
    deliveryPolicy: string
    endpoint: string
    endpointAutoConfirms: false
    filterPolicy: string
    filterPolicyScope: string
    protocol: string
    rawMessageDelivery: false
    redrivePolicy: string
    region: string
    replayPolicy: string
    subscriptionRoleArn: string
    topic: string
```

## TopicSubscription Resource Properties[](#properties)

To learn more about resource properties and how to use them, see [Inputs and Outputs](/docs/intro/concepts/inputs-outputs) in the Architecture and Concepts docs.

### Inputs[](#inputs)

In Python, inputs that are objects can be passed either as [argument classes or as dictionary literals](/docs/languages-sdks/python/#inputs-and-outputs).

The TopicSubscription resource accepts the following [input](/docs/intro/concepts/inputs-outputs) properties:

[Endpoint](#endpoint_csharp)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

Endpoint to send data to. The contents vary with the protocol. See details below.

[Protocol](#protocol_csharp)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

Protocol to use. Valid values are: `sqs`, `sms`, `lambda`, `firehose`, and `application`. Protocols `email`, `email-json`, `http` and `https` are also valid but partially supported. See details below.

[Topic](#topic_csharp)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string | string

ARN of the SNS topic to subscribe to.

The following arguments are optional:

[ConfirmationTimeoutInMinutes](#confirmationtimeoutinminutes_csharp) int

Integer indicating number of minutes to wait in retrying mode for fetching subscription arn before marking it as failure. Only applicable for http and https protocols. Default is `1`.

[DeliveryPolicy](#deliverypolicy_csharp) string

JSON String with the delivery policy (retries, backoff, etc.) that will be used in the subscription - this only applies to HTTP/S subscriptions. Refer to the [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/DeliveryPolicies.html) for more details.

[EndpointAutoConfirms](#endpointautoconfirms_csharp) bool

Whether the endpoint is capable of [auto confirming subscription](http://docs.aws.amazon.com/sns/latest/dg/SendMessageToHttp.html#SendMessageToHttp.prepare) (e.g., PagerDuty). Default is `false`.

[FilterPolicy](#filterpolicy_csharp) string

JSON String with the filter policy that will be used in the subscription to filter messages seen by the target resource. Refer to the [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/message-filtering.html) for more details.

[FilterPolicyScope](#filterpolicyscope_csharp) string

Whether the `filterPolicy` applies to `MessageAttributes` (default) or `MessageBody`.

[RawMessageDelivery](#rawmessagedelivery_csharp) bool

Whether to enable raw message delivery (the original message is directly passed, not wrapped in JSON with the original message in the message property). Default is `false`.

[RedrivePolicy](#redrivepolicy_csharp) string

JSON String with the redrive policy that will be used in the subscription. Refer to the [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/sns-dead-letter-queues.html#how-messages-moved-into-dead-letter-queue) for more details.

[Region](#region_csharp) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[ReplayPolicy](#replaypolicy_csharp) string

JSON String with the archived message replay policy that will be used in the subscription. Refer to the [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/message-archiving-and-replay-subscriber.html) for more details.

[SubscriptionRoleArn](#subscriptionrolearn_csharp) string

ARN of the IAM role to publish to Kinesis Data Firehose delivery stream. Refer to [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/sns-firehose-as-subscriber.html).

[Endpoint](#endpoint_go)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

Endpoint to send data to. The contents vary with the protocol. See details below.

[Protocol](#protocol_go)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

Protocol to use. Valid values are: `sqs`, `sms`, `lambda`, `firehose`, and `application`. Protocols `email`, `email-json`, `http` and `https` are also valid but partially supported. See details below.

[Topic](#topic_go)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string | string

ARN of the SNS topic to subscribe to.

The following arguments are optional:

[ConfirmationTimeoutInMinutes](#confirmationtimeoutinminutes_go) int

Integer indicating number of minutes to wait in retrying mode for fetching subscription arn before marking it as failure. Only applicable for http and https protocols. Default is `1`.

[DeliveryPolicy](#deliverypolicy_go) string

JSON String with the delivery policy (retries, backoff, etc.) that will be used in the subscription - this only applies to HTTP/S subscriptions. Refer to the [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/DeliveryPolicies.html) for more details.

[EndpointAutoConfirms](#endpointautoconfirms_go) bool

Whether the endpoint is capable of [auto confirming subscription](http://docs.aws.amazon.com/sns/latest/dg/SendMessageToHttp.html#SendMessageToHttp.prepare) (e.g., PagerDuty). Default is `false`.

[FilterPolicy](#filterpolicy_go) string

JSON String with the filter policy that will be used in the subscription to filter messages seen by the target resource. Refer to the [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/message-filtering.html) for more details.

[FilterPolicyScope](#filterpolicyscope_go) string

Whether the `filterPolicy` applies to `MessageAttributes` (default) or `MessageBody`.

[RawMessageDelivery](#rawmessagedelivery_go) bool

Whether to enable raw message delivery (the original message is directly passed, not wrapped in JSON with the original message in the message property). Default is `false`.

[RedrivePolicy](#redrivepolicy_go) string

JSON String with the redrive policy that will be used in the subscription. Refer to the [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/sns-dead-letter-queues.html#how-messages-moved-into-dead-letter-queue) for more details.

[Region](#region_go) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[ReplayPolicy](#replaypolicy_go) string

JSON String with the archived message replay policy that will be used in the subscription. Refer to the [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/message-archiving-and-replay-subscriber.html) for more details.

[SubscriptionRoleArn](#subscriptionrolearn_go) string

ARN of the IAM role to publish to Kinesis Data Firehose delivery stream. Refer to [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/sns-firehose-as-subscriber.html).

[endpoint](#endpoint_hcl)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

Endpoint to send data to. The contents vary with the protocol. See details below.

[protocol](#protocol_hcl)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

Protocol to use. Valid values are: `sqs`, `sms`, `lambda`, `firehose`, and `application`. Protocols `email`, `email-json`, `http` and `https` are also valid but partially supported. See details below.

[topic](#topic_hcl)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string |

ARN of the SNS topic to subscribe to.

The following arguments are optional:

[confirmation\_timeout\_in\_minutes](#confirmation_timeout_in_minutes_hcl) number

Integer indicating number of minutes to wait in retrying mode for fetching subscription arn before marking it as failure. Only applicable for http and https protocols. Default is `1`.

[delivery\_policy](#delivery_policy_hcl) string

JSON String with the delivery policy (retries, backoff, etc.) that will be used in the subscription - this only applies to HTTP/S subscriptions. Refer to the [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/DeliveryPolicies.html) for more details.

[endpoint\_auto\_confirms](#endpoint_auto_confirms_hcl) bool

Whether the endpoint is capable of [auto confirming subscription](http://docs.aws.amazon.com/sns/latest/dg/SendMessageToHttp.html#SendMessageToHttp.prepare) (e.g., PagerDuty). Default is `false`.

[filter\_policy](#filter_policy_hcl) string

JSON String with the filter policy that will be used in the subscription to filter messages seen by the target resource. Refer to the [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/message-filtering.html) for more details.

[filter\_policy\_scope](#filter_policy_scope_hcl) string

Whether the `filterPolicy` applies to `MessageAttributes` (default) or `MessageBody`.

[raw\_message\_delivery](#raw_message_delivery_hcl) bool

Whether to enable raw message delivery (the original message is directly passed, not wrapped in JSON with the original message in the message property). Default is `false`.

[redrive\_policy](#redrive_policy_hcl) string

JSON String with the redrive policy that will be used in the subscription. Refer to the [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/sns-dead-letter-queues.html#how-messages-moved-into-dead-letter-queue) for more details.

[region](#region_hcl) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[replay\_policy](#replay_policy_hcl) string

JSON String with the archived message replay policy that will be used in the subscription. Refer to the [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/message-archiving-and-replay-subscriber.html) for more details.

[subscription\_role\_arn](#subscription_role_arn_hcl) string

ARN of the IAM role to publish to Kinesis Data Firehose delivery stream. Refer to [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/sns-firehose-as-subscriber.html).

[endpoint](#endpoint_java)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

String

Endpoint to send data to. The contents vary with the protocol. See details below.

[protocol](#protocol_java)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

String

Protocol to use. Valid values are: `sqs`, `sms`, `lambda`, `firehose`, and `application`. Protocols `email`, `email-json`, `http` and `https` are also valid but partially supported. See details below.

[topic](#topic_java)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

String | String

ARN of the SNS topic to subscribe to.

The following arguments are optional:

[confirmationTimeoutInMinutes](#confirmationtimeoutinminutes_java) Integer

Integer indicating number of minutes to wait in retrying mode for fetching subscription arn before marking it as failure. Only applicable for http and https protocols. Default is `1`.

[deliveryPolicy](#deliverypolicy_java) String

JSON String with the delivery policy (retries, backoff, etc.) that will be used in the subscription - this only applies to HTTP/S subscriptions. Refer to the [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/DeliveryPolicies.html) for more details.

[endpointAutoConfirms](#endpointautoconfirms_java) Boolean

Whether the endpoint is capable of [auto confirming subscription](http://docs.aws.amazon.com/sns/latest/dg/SendMessageToHttp.html#SendMessageToHttp.prepare) (e.g., PagerDuty). Default is `false`.

[filterPolicy](#filterpolicy_java) String

JSON String with the filter policy that will be used in the subscription to filter messages seen by the target resource. Refer to the [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/message-filtering.html) for more details.

[filterPolicyScope](#filterpolicyscope_java) String

Whether the `filterPolicy` applies to `MessageAttributes` (default) or `MessageBody`.

[rawMessageDelivery](#rawmessagedelivery_java) Boolean

Whether to enable raw message delivery (the original message is directly passed, not wrapped in JSON with the original message in the message property). Default is `false`.

[redrivePolicy](#redrivepolicy_java) String

JSON String with the redrive policy that will be used in the subscription. Refer to the [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/sns-dead-letter-queues.html#how-messages-moved-into-dead-letter-queue) for more details.

[region](#region_java) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[replayPolicy](#replaypolicy_java) String

JSON String with the archived message replay policy that will be used in the subscription. Refer to the [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/message-archiving-and-replay-subscriber.html) for more details.

[subscriptionRoleArn](#subscriptionrolearn_java) String

ARN of the IAM role to publish to Kinesis Data Firehose delivery stream. Refer to [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/sns-firehose-as-subscriber.html).

[endpoint](#endpoint_nodejs)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

Endpoint to send data to. The contents vary with the protocol. See details below.

[protocol](#protocol_nodejs)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

Protocol to use. Valid values are: `sqs`, `sms`, `lambda`, `firehose`, and `application`. Protocols `email`, `email-json`, `http` and `https` are also valid but partially supported. See details below.

[topic](#topic_nodejs)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string | Topic

ARN of the SNS topic to subscribe to.

The following arguments are optional:

[confirmationTimeoutInMinutes](#confirmationtimeoutinminutes_nodejs) number

Integer indicating number of minutes to wait in retrying mode for fetching subscription arn before marking it as failure. Only applicable for http and https protocols. Default is `1`.

[deliveryPolicy](#deliverypolicy_nodejs) string

JSON String with the delivery policy (retries, backoff, etc.) that will be used in the subscription - this only applies to HTTP/S subscriptions. Refer to the [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/DeliveryPolicies.html) for more details.

[endpointAutoConfirms](#endpointautoconfirms_nodejs) boolean

Whether the endpoint is capable of [auto confirming subscription](http://docs.aws.amazon.com/sns/latest/dg/SendMessageToHttp.html#SendMessageToHttp.prepare) (e.g., PagerDuty). Default is `false`.

[filterPolicy](#filterpolicy_nodejs) string

JSON String with the filter policy that will be used in the subscription to filter messages seen by the target resource. Refer to the [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/message-filtering.html) for more details.

[filterPolicyScope](#filterpolicyscope_nodejs) string

Whether the `filterPolicy` applies to `MessageAttributes` (default) or `MessageBody`.

[rawMessageDelivery](#rawmessagedelivery_nodejs) boolean

Whether to enable raw message delivery (the original message is directly passed, not wrapped in JSON with the original message in the message property). Default is `false`.

[redrivePolicy](#redrivepolicy_nodejs) string

JSON String with the redrive policy that will be used in the subscription. Refer to the [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/sns-dead-letter-queues.html#how-messages-moved-into-dead-letter-queue) for more details.

[region](#region_nodejs) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[replayPolicy](#replaypolicy_nodejs) string

JSON String with the archived message replay policy that will be used in the subscription. Refer to the [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/message-archiving-and-replay-subscriber.html) for more details.

[subscriptionRoleArn](#subscriptionrolearn_nodejs) string

ARN of the IAM role to publish to Kinesis Data Firehose delivery stream. Refer to [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/sns-firehose-as-subscriber.html).

[endpoint](#endpoint_python)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

str

Endpoint to send data to. The contents vary with the protocol. See details below.

[protocol](#protocol_python)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

str

Protocol to use. Valid values are: `sqs`, `sms`, `lambda`, `firehose`, and `application`. Protocols `email`, `email-json`, `http` and `https` are also valid but partially supported. See details below.

[topic](#topic_python)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

str | str

ARN of the SNS topic to subscribe to.

The following arguments are optional:

[confirmation\_timeout\_in\_minutes](#confirmation_timeout_in_minutes_python) int

Integer indicating number of minutes to wait in retrying mode for fetching subscription arn before marking it as failure. Only applicable for http and https protocols. Default is `1`.

[delivery\_policy](#delivery_policy_python) str

JSON String with the delivery policy (retries, backoff, etc.) that will be used in the subscription - this only applies to HTTP/S subscriptions. Refer to the [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/DeliveryPolicies.html) for more details.

[endpoint\_auto\_confirms](#endpoint_auto_confirms_python) bool

Whether the endpoint is capable of [auto confirming subscription](http://docs.aws.amazon.com/sns/latest/dg/SendMessageToHttp.html#SendMessageToHttp.prepare) (e.g., PagerDuty). Default is `false`.

[filter\_policy](#filter_policy_python) str

JSON String with the filter policy that will be used in the subscription to filter messages seen by the target resource. Refer to the [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/message-filtering.html) for more details.

[filter\_policy\_scope](#filter_policy_scope_python) str

Whether the `filterPolicy` applies to `MessageAttributes` (default) or `MessageBody`.

[raw\_message\_delivery](#raw_message_delivery_python) bool

Whether to enable raw message delivery (the original message is directly passed, not wrapped in JSON with the original message in the message property). Default is `false`.

[redrive\_policy](#redrive_policy_python) str

JSON String with the redrive policy that will be used in the subscription. Refer to the [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/sns-dead-letter-queues.html#how-messages-moved-into-dead-letter-queue) for more details.

[region](#region_python) str

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[replay\_policy](#replay_policy_python) str

JSON String with the archived message replay policy that will be used in the subscription. Refer to the [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/message-archiving-and-replay-subscriber.html) for more details.

[subscription\_role\_arn](#subscription_role_arn_python) str

ARN of the IAM role to publish to Kinesis Data Firehose delivery stream. Refer to [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/sns-firehose-as-subscriber.html).

[endpoint](#endpoint_yaml)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

String

Endpoint to send data to. The contents vary with the protocol. See details below.

[protocol](#protocol_yaml)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

String

Protocol to use. Valid values are: `sqs`, `sms`, `lambda`, `firehose`, and `application`. Protocols `email`, `email-json`, `http` and `https` are also valid but partially supported. See details below.

[topic](#topic_yaml)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

String |

ARN of the SNS topic to subscribe to.

The following arguments are optional:

[confirmationTimeoutInMinutes](#confirmationtimeoutinminutes_yaml) Number

Integer indicating number of minutes to wait in retrying mode for fetching subscription arn before marking it as failure. Only applicable for http and https protocols. Default is `1`.

[deliveryPolicy](#deliverypolicy_yaml) String

JSON String with the delivery policy (retries, backoff, etc.) that will be used in the subscription - this only applies to HTTP/S subscriptions. Refer to the [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/DeliveryPolicies.html) for more details.

[endpointAutoConfirms](#endpointautoconfirms_yaml) Boolean

Whether the endpoint is capable of [auto confirming subscription](http://docs.aws.amazon.com/sns/latest/dg/SendMessageToHttp.html#SendMessageToHttp.prepare) (e.g., PagerDuty). Default is `false`.

[filterPolicy](#filterpolicy_yaml) String

JSON String with the filter policy that will be used in the subscription to filter messages seen by the target resource. Refer to the [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/message-filtering.html) for more details.

[filterPolicyScope](#filterpolicyscope_yaml) String

Whether the `filterPolicy` applies to `MessageAttributes` (default) or `MessageBody`.

[rawMessageDelivery](#rawmessagedelivery_yaml) Boolean

Whether to enable raw message delivery (the original message is directly passed, not wrapped in JSON with the original message in the message property). Default is `false`.

[redrivePolicy](#redrivepolicy_yaml) String

JSON String with the redrive policy that will be used in the subscription. Refer to the [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/sns-dead-letter-queues.html#how-messages-moved-into-dead-letter-queue) for more details.

[region](#region_yaml) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[replayPolicy](#replaypolicy_yaml) String

JSON String with the archived message replay policy that will be used in the subscription. Refer to the [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/message-archiving-and-replay-subscriber.html) for more details.

[subscriptionRoleArn](#subscriptionrolearn_yaml) String

ARN of the IAM role to publish to Kinesis Data Firehose delivery stream. Refer to [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/sns-firehose-as-subscriber.html).

### Outputs[](#outputs)

All [input](#inputs) properties are implicitly available as output properties. Additionally, the TopicSubscription resource produces the following output properties:

[Arn](#arn_csharp) string

ARN of the subscription.

[ConfirmationWasAuthenticated](#confirmationwasauthenticated_csharp) bool

Whether the subscription confirmation request was authenticated.

[Id](#id_csharp) string

The provider-assigned unique ID for this managed resource.

[OwnerId](#ownerid_csharp) string

AWS account ID of the subscription's owner.

[PendingConfirmation](#pendingconfirmation_csharp) bool

Whether the subscription has not been confirmed.

[Arn](#arn_go) string

ARN of the subscription.

[ConfirmationWasAuthenticated](#confirmationwasauthenticated_go) bool

Whether the subscription confirmation request was authenticated.

[Id](#id_go) string

The provider-assigned unique ID for this managed resource.

[OwnerId](#ownerid_go) string

AWS account ID of the subscription's owner.

[PendingConfirmation](#pendingconfirmation_go) bool

Whether the subscription has not been confirmed.

[arn](#arn_hcl) string

ARN of the subscription.

[confirmation\_was\_authenticated](#confirmation_was_authenticated_hcl) bool

Whether the subscription confirmation request was authenticated.

[id](#id_hcl) string

The provider-assigned unique ID for this managed resource.

[owner\_id](#owner_id_hcl) string

AWS account ID of the subscription's owner.

[pending\_confirmation](#pending_confirmation_hcl) bool

Whether the subscription has not been confirmed.

[arn](#arn_java) String

ARN of the subscription.

[confirmationWasAuthenticated](#confirmationwasauthenticated_java) Boolean

Whether the subscription confirmation request was authenticated.

[id](#id_java) String

The provider-assigned unique ID for this managed resource.

[ownerId](#ownerid_java) String

AWS account ID of the subscription's owner.

[pendingConfirmation](#pendingconfirmation_java) Boolean

Whether the subscription has not been confirmed.

[arn](#arn_nodejs) string

ARN of the subscription.

[confirmationWasAuthenticated](#confirmationwasauthenticated_nodejs) boolean

Whether the subscription confirmation request was authenticated.

[id](#id_nodejs) string

The provider-assigned unique ID for this managed resource.

[ownerId](#ownerid_nodejs) string

AWS account ID of the subscription's owner.

[pendingConfirmation](#pendingconfirmation_nodejs) boolean

Whether the subscription has not been confirmed.

[arn](#arn_python) str

ARN of the subscription.

[confirmation\_was\_authenticated](#confirmation_was_authenticated_python) bool

Whether the subscription confirmation request was authenticated.

[id](#id_python) str

The provider-assigned unique ID for this managed resource.

[owner\_id](#owner_id_python) str

AWS account ID of the subscription's owner.

[pending\_confirmation](#pending_confirmation_python) bool

Whether the subscription has not been confirmed.

[arn](#arn_yaml) String

ARN of the subscription.

[confirmationWasAuthenticated](#confirmationwasauthenticated_yaml) Boolean

Whether the subscription confirmation request was authenticated.

[id](#id_yaml) String

The provider-assigned unique ID for this managed resource.

[ownerId](#ownerid_yaml) String

AWS account ID of the subscription's owner.

[pendingConfirmation](#pendingconfirmation_yaml) Boolean

Whether the subscription has not been confirmed.

## Look up Existing TopicSubscription Resource[](#look-up)

Get an existing TopicSubscription resource’s state with the given name, ID, and optional extra properties used to qualify the lookup.

-   TypeScript
-   Python
-   Go
-   C#
-   Java
-   YAML
-   HCL PREVIEW

```typescript
public static get(name: string, id: Input<ID>, state?: TopicSubscriptionState, opts?: CustomResourceOptions): TopicSubscription
```

```python
@staticmethod
def get(resource_name: str,
        id: str,
        opts: Optional[ResourceOptions] = None,
        arn: Optional[str] = None,
        confirmation_timeout_in_minutes: Optional[int] = None,
        confirmation_was_authenticated: Optional[bool] = None,
        delivery_policy: Optional[str] = None,
        endpoint: Optional[str] = None,
        endpoint_auto_confirms: Optional[bool] = None,
        filter_policy: Optional[str] = None,
        filter_policy_scope: Optional[str] = None,
        owner_id: Optional[str] = None,
        pending_confirmation: Optional[bool] = None,
        protocol: Optional[str] = None,
        raw_message_delivery: Optional[bool] = None,
        redrive_policy: Optional[str] = None,
        region: Optional[str] = None,
        replay_policy: Optional[str] = None,
        subscription_role_arn: Optional[str] = None,
        topic: Optional[str] = None) -> TopicSubscription
```

```go
func GetTopicSubscription(ctx *Context, name string, id IDInput, state *TopicSubscriptionState, opts ...ResourceOption) (*TopicSubscription, error)
```

```csharp
public static TopicSubscription Get(string name, Input<string> id, TopicSubscriptionState? state, CustomResourceOptions? opts = null)
```

```java
public static TopicSubscription get(String name, Output<String> id, TopicSubscriptionState state, CustomResourceOptions options)
```

```yaml
resources:  _:    type: aws:sns:TopicSubscription    get:      id: ${id}
```

```hcl
import {
  to = aws_sns_topicsubscription.example
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

ARN of the subscription.

[ConfirmationTimeoutInMinutes](#state_confirmationtimeoutinminutes_csharp) int

Integer indicating number of minutes to wait in retrying mode for fetching subscription arn before marking it as failure. Only applicable for http and https protocols. Default is `1`.

[ConfirmationWasAuthenticated](#state_confirmationwasauthenticated_csharp) bool

Whether the subscription confirmation request was authenticated.

[DeliveryPolicy](#state_deliverypolicy_csharp) string

JSON String with the delivery policy (retries, backoff, etc.) that will be used in the subscription - this only applies to HTTP/S subscriptions. Refer to the [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/DeliveryPolicies.html) for more details.

[Endpoint](#state_endpoint_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Endpoint to send data to. The contents vary with the protocol. See details below.

[EndpointAutoConfirms](#state_endpointautoconfirms_csharp) bool

Whether the endpoint is capable of [auto confirming subscription](http://docs.aws.amazon.com/sns/latest/dg/SendMessageToHttp.html#SendMessageToHttp.prepare) (e.g., PagerDuty). Default is `false`.

[FilterPolicy](#state_filterpolicy_csharp) string

JSON String with the filter policy that will be used in the subscription to filter messages seen by the target resource. Refer to the [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/message-filtering.html) for more details.

[FilterPolicyScope](#state_filterpolicyscope_csharp) string

Whether the `filterPolicy` applies to `MessageAttributes` (default) or `MessageBody`.

[OwnerId](#state_ownerid_csharp) string

AWS account ID of the subscription's owner.

[PendingConfirmation](#state_pendingconfirmation_csharp) bool

Whether the subscription has not been confirmed.

[Protocol](#state_protocol_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Protocol to use. Valid values are: `sqs`, `sms`, `lambda`, `firehose`, and `application`. Protocols `email`, `email-json`, `http` and `https` are also valid but partially supported. See details below.

[RawMessageDelivery](#state_rawmessagedelivery_csharp) bool

Whether to enable raw message delivery (the original message is directly passed, not wrapped in JSON with the original message in the message property). Default is `false`.

[RedrivePolicy](#state_redrivepolicy_csharp) string

JSON String with the redrive policy that will be used in the subscription. Refer to the [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/sns-dead-letter-queues.html#how-messages-moved-into-dead-letter-queue) for more details.

[Region](#state_region_csharp) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[ReplayPolicy](#state_replaypolicy_csharp) string

JSON String with the archived message replay policy that will be used in the subscription. Refer to the [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/message-archiving-and-replay-subscriber.html) for more details.

[SubscriptionRoleArn](#state_subscriptionrolearn_csharp) string

ARN of the IAM role to publish to Kinesis Data Firehose delivery stream. Refer to [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/sns-firehose-as-subscriber.html).

[Topic](#state_topic_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string | string

ARN of the SNS topic to subscribe to.

The following arguments are optional:

[Arn](#state_arn_go) string

ARN of the subscription.

[ConfirmationTimeoutInMinutes](#state_confirmationtimeoutinminutes_go) int

Integer indicating number of minutes to wait in retrying mode for fetching subscription arn before marking it as failure. Only applicable for http and https protocols. Default is `1`.

[ConfirmationWasAuthenticated](#state_confirmationwasauthenticated_go) bool

Whether the subscription confirmation request was authenticated.

[DeliveryPolicy](#state_deliverypolicy_go) string

JSON String with the delivery policy (retries, backoff, etc.) that will be used in the subscription - this only applies to HTTP/S subscriptions. Refer to the [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/DeliveryPolicies.html) for more details.

[Endpoint](#state_endpoint_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Endpoint to send data to. The contents vary with the protocol. See details below.

[EndpointAutoConfirms](#state_endpointautoconfirms_go) bool

Whether the endpoint is capable of [auto confirming subscription](http://docs.aws.amazon.com/sns/latest/dg/SendMessageToHttp.html#SendMessageToHttp.prepare) (e.g., PagerDuty). Default is `false`.

[FilterPolicy](#state_filterpolicy_go) string

JSON String with the filter policy that will be used in the subscription to filter messages seen by the target resource. Refer to the [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/message-filtering.html) for more details.

[FilterPolicyScope](#state_filterpolicyscope_go) string

Whether the `filterPolicy` applies to `MessageAttributes` (default) or `MessageBody`.

[OwnerId](#state_ownerid_go) string

AWS account ID of the subscription's owner.

[PendingConfirmation](#state_pendingconfirmation_go) bool

Whether the subscription has not been confirmed.

[Protocol](#state_protocol_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Protocol to use. Valid values are: `sqs`, `sms`, `lambda`, `firehose`, and `application`. Protocols `email`, `email-json`, `http` and `https` are also valid but partially supported. See details below.

[RawMessageDelivery](#state_rawmessagedelivery_go) bool

Whether to enable raw message delivery (the original message is directly passed, not wrapped in JSON with the original message in the message property). Default is `false`.

[RedrivePolicy](#state_redrivepolicy_go) string

JSON String with the redrive policy that will be used in the subscription. Refer to the [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/sns-dead-letter-queues.html#how-messages-moved-into-dead-letter-queue) for more details.

[Region](#state_region_go) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[ReplayPolicy](#state_replaypolicy_go) string

JSON String with the archived message replay policy that will be used in the subscription. Refer to the [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/message-archiving-and-replay-subscriber.html) for more details.

[SubscriptionRoleArn](#state_subscriptionrolearn_go) string

ARN of the IAM role to publish to Kinesis Data Firehose delivery stream. Refer to [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/sns-firehose-as-subscriber.html).

[Topic](#state_topic_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string | string

ARN of the SNS topic to subscribe to.

The following arguments are optional:

[arn](#state_arn_hcl) string

ARN of the subscription.

[confirmation\_timeout\_in\_minutes](#state_confirmation_timeout_in_minutes_hcl) number

Integer indicating number of minutes to wait in retrying mode for fetching subscription arn before marking it as failure. Only applicable for http and https protocols. Default is `1`.

[confirmation\_was\_authenticated](#state_confirmation_was_authenticated_hcl) bool

Whether the subscription confirmation request was authenticated.

[delivery\_policy](#state_delivery_policy_hcl) string

JSON String with the delivery policy (retries, backoff, etc.) that will be used in the subscription - this only applies to HTTP/S subscriptions. Refer to the [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/DeliveryPolicies.html) for more details.

[endpoint](#state_endpoint_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Endpoint to send data to. The contents vary with the protocol. See details below.

[endpoint\_auto\_confirms](#state_endpoint_auto_confirms_hcl) bool

Whether the endpoint is capable of [auto confirming subscription](http://docs.aws.amazon.com/sns/latest/dg/SendMessageToHttp.html#SendMessageToHttp.prepare) (e.g., PagerDuty). Default is `false`.

[filter\_policy](#state_filter_policy_hcl) string

JSON String with the filter policy that will be used in the subscription to filter messages seen by the target resource. Refer to the [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/message-filtering.html) for more details.

[filter\_policy\_scope](#state_filter_policy_scope_hcl) string

Whether the `filterPolicy` applies to `MessageAttributes` (default) or `MessageBody`.

[owner\_id](#state_owner_id_hcl) string

AWS account ID of the subscription's owner.

[pending\_confirmation](#state_pending_confirmation_hcl) bool

Whether the subscription has not been confirmed.

[protocol](#state_protocol_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Protocol to use. Valid values are: `sqs`, `sms`, `lambda`, `firehose`, and `application`. Protocols `email`, `email-json`, `http` and `https` are also valid but partially supported. See details below.

[raw\_message\_delivery](#state_raw_message_delivery_hcl) bool

Whether to enable raw message delivery (the original message is directly passed, not wrapped in JSON with the original message in the message property). Default is `false`.

[redrive\_policy](#state_redrive_policy_hcl) string

JSON String with the redrive policy that will be used in the subscription. Refer to the [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/sns-dead-letter-queues.html#how-messages-moved-into-dead-letter-queue) for more details.

[region](#state_region_hcl) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[replay\_policy](#state_replay_policy_hcl) string

JSON String with the archived message replay policy that will be used in the subscription. Refer to the [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/message-archiving-and-replay-subscriber.html) for more details.

[subscription\_role\_arn](#state_subscription_role_arn_hcl) string

ARN of the IAM role to publish to Kinesis Data Firehose delivery stream. Refer to [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/sns-firehose-as-subscriber.html).

[topic](#state_topic_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string |

ARN of the SNS topic to subscribe to.

The following arguments are optional:

[arn](#state_arn_java) String

ARN of the subscription.

[confirmationTimeoutInMinutes](#state_confirmationtimeoutinminutes_java) Integer

Integer indicating number of minutes to wait in retrying mode for fetching subscription arn before marking it as failure. Only applicable for http and https protocols. Default is `1`.

[confirmationWasAuthenticated](#state_confirmationwasauthenticated_java) Boolean

Whether the subscription confirmation request was authenticated.

[deliveryPolicy](#state_deliverypolicy_java) String

JSON String with the delivery policy (retries, backoff, etc.) that will be used in the subscription - this only applies to HTTP/S subscriptions. Refer to the [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/DeliveryPolicies.html) for more details.

[endpoint](#state_endpoint_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Endpoint to send data to. The contents vary with the protocol. See details below.

[endpointAutoConfirms](#state_endpointautoconfirms_java) Boolean

Whether the endpoint is capable of [auto confirming subscription](http://docs.aws.amazon.com/sns/latest/dg/SendMessageToHttp.html#SendMessageToHttp.prepare) (e.g., PagerDuty). Default is `false`.

[filterPolicy](#state_filterpolicy_java) String

JSON String with the filter policy that will be used in the subscription to filter messages seen by the target resource. Refer to the [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/message-filtering.html) for more details.

[filterPolicyScope](#state_filterpolicyscope_java) String

Whether the `filterPolicy` applies to `MessageAttributes` (default) or `MessageBody`.

[ownerId](#state_ownerid_java) String

AWS account ID of the subscription's owner.

[pendingConfirmation](#state_pendingconfirmation_java) Boolean

Whether the subscription has not been confirmed.

[protocol](#state_protocol_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Protocol to use. Valid values are: `sqs`, `sms`, `lambda`, `firehose`, and `application`. Protocols `email`, `email-json`, `http` and `https` are also valid but partially supported. See details below.

[rawMessageDelivery](#state_rawmessagedelivery_java) Boolean

Whether to enable raw message delivery (the original message is directly passed, not wrapped in JSON with the original message in the message property). Default is `false`.

[redrivePolicy](#state_redrivepolicy_java) String

JSON String with the redrive policy that will be used in the subscription. Refer to the [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/sns-dead-letter-queues.html#how-messages-moved-into-dead-letter-queue) for more details.

[region](#state_region_java) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[replayPolicy](#state_replaypolicy_java) String

JSON String with the archived message replay policy that will be used in the subscription. Refer to the [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/message-archiving-and-replay-subscriber.html) for more details.

[subscriptionRoleArn](#state_subscriptionrolearn_java) String

ARN of the IAM role to publish to Kinesis Data Firehose delivery stream. Refer to [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/sns-firehose-as-subscriber.html).

[topic](#state_topic_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String | String

ARN of the SNS topic to subscribe to.

The following arguments are optional:

[arn](#state_arn_nodejs) string

ARN of the subscription.

[confirmationTimeoutInMinutes](#state_confirmationtimeoutinminutes_nodejs) number

Integer indicating number of minutes to wait in retrying mode for fetching subscription arn before marking it as failure. Only applicable for http and https protocols. Default is `1`.

[confirmationWasAuthenticated](#state_confirmationwasauthenticated_nodejs) boolean

Whether the subscription confirmation request was authenticated.

[deliveryPolicy](#state_deliverypolicy_nodejs) string

JSON String with the delivery policy (retries, backoff, etc.) that will be used in the subscription - this only applies to HTTP/S subscriptions. Refer to the [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/DeliveryPolicies.html) for more details.

[endpoint](#state_endpoint_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Endpoint to send data to. The contents vary with the protocol. See details below.

[endpointAutoConfirms](#state_endpointautoconfirms_nodejs) boolean

Whether the endpoint is capable of [auto confirming subscription](http://docs.aws.amazon.com/sns/latest/dg/SendMessageToHttp.html#SendMessageToHttp.prepare) (e.g., PagerDuty). Default is `false`.

[filterPolicy](#state_filterpolicy_nodejs) string

JSON String with the filter policy that will be used in the subscription to filter messages seen by the target resource. Refer to the [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/message-filtering.html) for more details.

[filterPolicyScope](#state_filterpolicyscope_nodejs) string

Whether the `filterPolicy` applies to `MessageAttributes` (default) or `MessageBody`.

[ownerId](#state_ownerid_nodejs) string

AWS account ID of the subscription's owner.

[pendingConfirmation](#state_pendingconfirmation_nodejs) boolean

Whether the subscription has not been confirmed.

[protocol](#state_protocol_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Protocol to use. Valid values are: `sqs`, `sms`, `lambda`, `firehose`, and `application`. Protocols `email`, `email-json`, `http` and `https` are also valid but partially supported. See details below.

[rawMessageDelivery](#state_rawmessagedelivery_nodejs) boolean

Whether to enable raw message delivery (the original message is directly passed, not wrapped in JSON with the original message in the message property). Default is `false`.

[redrivePolicy](#state_redrivepolicy_nodejs) string

JSON String with the redrive policy that will be used in the subscription. Refer to the [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/sns-dead-letter-queues.html#how-messages-moved-into-dead-letter-queue) for more details.

[region](#state_region_nodejs) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[replayPolicy](#state_replaypolicy_nodejs) string

JSON String with the archived message replay policy that will be used in the subscription. Refer to the [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/message-archiving-and-replay-subscriber.html) for more details.

[subscriptionRoleArn](#state_subscriptionrolearn_nodejs) string

ARN of the IAM role to publish to Kinesis Data Firehose delivery stream. Refer to [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/sns-firehose-as-subscriber.html).

[topic](#state_topic_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string | Topic

ARN of the SNS topic to subscribe to.

The following arguments are optional:

[arn](#state_arn_python) str

ARN of the subscription.

[confirmation\_timeout\_in\_minutes](#state_confirmation_timeout_in_minutes_python) int

Integer indicating number of minutes to wait in retrying mode for fetching subscription arn before marking it as failure. Only applicable for http and https protocols. Default is `1`.

[confirmation\_was\_authenticated](#state_confirmation_was_authenticated_python) bool

Whether the subscription confirmation request was authenticated.

[delivery\_policy](#state_delivery_policy_python) str

JSON String with the delivery policy (retries, backoff, etc.) that will be used in the subscription - this only applies to HTTP/S subscriptions. Refer to the [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/DeliveryPolicies.html) for more details.

[endpoint](#state_endpoint_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Endpoint to send data to. The contents vary with the protocol. See details below.

[endpoint\_auto\_confirms](#state_endpoint_auto_confirms_python) bool

Whether the endpoint is capable of [auto confirming subscription](http://docs.aws.amazon.com/sns/latest/dg/SendMessageToHttp.html#SendMessageToHttp.prepare) (e.g., PagerDuty). Default is `false`.

[filter\_policy](#state_filter_policy_python) str

JSON String with the filter policy that will be used in the subscription to filter messages seen by the target resource. Refer to the [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/message-filtering.html) for more details.

[filter\_policy\_scope](#state_filter_policy_scope_python) str

Whether the `filterPolicy` applies to `MessageAttributes` (default) or `MessageBody`.

[owner\_id](#state_owner_id_python) str

AWS account ID of the subscription's owner.

[pending\_confirmation](#state_pending_confirmation_python) bool

Whether the subscription has not been confirmed.

[protocol](#state_protocol_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Protocol to use. Valid values are: `sqs`, `sms`, `lambda`, `firehose`, and `application`. Protocols `email`, `email-json`, `http` and `https` are also valid but partially supported. See details below.

[raw\_message\_delivery](#state_raw_message_delivery_python) bool

Whether to enable raw message delivery (the original message is directly passed, not wrapped in JSON with the original message in the message property). Default is `false`.

[redrive\_policy](#state_redrive_policy_python) str

JSON String with the redrive policy that will be used in the subscription. Refer to the [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/sns-dead-letter-queues.html#how-messages-moved-into-dead-letter-queue) for more details.

[region](#state_region_python) str

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[replay\_policy](#state_replay_policy_python) str

JSON String with the archived message replay policy that will be used in the subscription. Refer to the [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/message-archiving-and-replay-subscriber.html) for more details.

[subscription\_role\_arn](#state_subscription_role_arn_python) str

ARN of the IAM role to publish to Kinesis Data Firehose delivery stream. Refer to [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/sns-firehose-as-subscriber.html).

[topic](#state_topic_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str | str

ARN of the SNS topic to subscribe to.

The following arguments are optional:

[arn](#state_arn_yaml) String

ARN of the subscription.

[confirmationTimeoutInMinutes](#state_confirmationtimeoutinminutes_yaml) Number

Integer indicating number of minutes to wait in retrying mode for fetching subscription arn before marking it as failure. Only applicable for http and https protocols. Default is `1`.

[confirmationWasAuthenticated](#state_confirmationwasauthenticated_yaml) Boolean

Whether the subscription confirmation request was authenticated.

[deliveryPolicy](#state_deliverypolicy_yaml) String

JSON String with the delivery policy (retries, backoff, etc.) that will be used in the subscription - this only applies to HTTP/S subscriptions. Refer to the [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/DeliveryPolicies.html) for more details.

[endpoint](#state_endpoint_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Endpoint to send data to. The contents vary with the protocol. See details below.

[endpointAutoConfirms](#state_endpointautoconfirms_yaml) Boolean

Whether the endpoint is capable of [auto confirming subscription](http://docs.aws.amazon.com/sns/latest/dg/SendMessageToHttp.html#SendMessageToHttp.prepare) (e.g., PagerDuty). Default is `false`.

[filterPolicy](#state_filterpolicy_yaml) String

JSON String with the filter policy that will be used in the subscription to filter messages seen by the target resource. Refer to the [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/message-filtering.html) for more details.

[filterPolicyScope](#state_filterpolicyscope_yaml) String

Whether the `filterPolicy` applies to `MessageAttributes` (default) or `MessageBody`.

[ownerId](#state_ownerid_yaml) String

AWS account ID of the subscription's owner.

[pendingConfirmation](#state_pendingconfirmation_yaml) Boolean

Whether the subscription has not been confirmed.

[protocol](#state_protocol_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Protocol to use. Valid values are: `sqs`, `sms`, `lambda`, `firehose`, and `application`. Protocols `email`, `email-json`, `http` and `https` are also valid but partially supported. See details below.

[rawMessageDelivery](#state_rawmessagedelivery_yaml) Boolean

Whether to enable raw message delivery (the original message is directly passed, not wrapped in JSON with the original message in the message property). Default is `false`.

[redrivePolicy](#state_redrivepolicy_yaml) String

JSON String with the redrive policy that will be used in the subscription. Refer to the [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/sns-dead-letter-queues.html#how-messages-moved-into-dead-letter-queue) for more details.

[region](#state_region_yaml) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[replayPolicy](#state_replaypolicy_yaml) String

JSON String with the archived message replay policy that will be used in the subscription. Refer to the [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/message-archiving-and-replay-subscriber.html) for more details.

[subscriptionRoleArn](#state_subscriptionrolearn_yaml) String

ARN of the IAM role to publish to Kinesis Data Firehose delivery stream. Refer to [SNS docs](https://docs.aws.amazon.com/sns/latest/dg/sns-firehose-as-subscriber.html).

[topic](#state_topic_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String |

ARN of the SNS topic to subscribe to.

The following arguments are optional:

## Import[](#import)

### Identity Schema[](#identity-schema)

#### Required[](#required)

-   `arn` (String) Amazon Resource Name (ARN) of the SNS topic subscription.

Using `pulumi import`, import SNS Topic Subscriptions using the subscription `arn`. For example:

```bash
$ pulumi import aws:sns/topicSubscription:TopicSubscription user_updates_sqs_target arn:aws:sns:us-west-2:123456789012:my-topic:8a21d249-4329-4871-acc6-7be709c6ea7f
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

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2fsns%2ftopicsubscription]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2fsns%2ftopicsubscription%2f\))

#### Try Pulumi Cloud free.
Your team will thank you.

[Start free trial](https://app.pulumi.com/signup?utm_source=registry&utm_medium=right-rail-banner&utm_campaign=try-pulumi-cloud&iaid=docs-try-pulumi-cloud-ad)
