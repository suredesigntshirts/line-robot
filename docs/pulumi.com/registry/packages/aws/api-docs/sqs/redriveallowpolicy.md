---
Source: https://www.pulumi.com/registry/packages/aws/api-docs/sqs/redriveallowpolicy/
Generated: 2026-06-06
Updated: 2026-06-06
---

# aws.sqs.RedriveAllowPolicy

1.  [Packages](/registry/)
2.  [Packages](/registry/packages/)
3.  [AWS](/registry/packages/aws/)
4.  [API Docs](/registry/packages/aws/api-docs/)
5.  [sqs](/registry/packages/aws/api-docs/sqs/)
6.  [RedriveAllowPolicy](/registry/packages/aws/api-docs/sqs/redriveallowpolicy/)

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

Viewing docs for AWS v7.32.0
published on Friday, May 29, 2026 by Pulumi

[Schema (JSON)](/registry/packages/aws/schema.json)

[pulumi/pulumi-aws](https://github.com/pulumi/pulumi-aws)

v7.32.0 (7.x, latest)v6.83.1 (6.x)v5.43.0 (5.x)

# aws.sqs.RedriveAllowPolicy[](#aws-sqs-redriveallowpolicy)

Explore with Neo

-   Copy Page

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2fsqs%2fredriveallowpolicy]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2fsqs%2fredriveallowpolicy%2f\))

Provides a SQS Queue Redrive Allow Policy resource.

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

const example = new aws.sqs.Queue("example", {name: "examplequeue"});
const src = new aws.sqs.Queue("src", {
    name: "srcqueue",
    redrivePolicy: pulumi.jsonStringify({
        deadLetterTargetArn: example.arn,
        maxReceiveCount: 4,
    }),
});
const exampleRedriveAllowPolicy = new aws.sqs.RedriveAllowPolicy("example", {
    queueUrl: example.id,
    redriveAllowPolicy: pulumi.jsonStringify({
        redrivePermission: "byQueue",
        sourceQueueArns: [src.arn],
    }),
});
```

```python
import pulumi
import json
import pulumi_aws as aws

example = aws.sqs.Queue("example", name="examplequeue")
src = aws.sqs.Queue("src",
    name="srcqueue",
    redrive_policy=pulumi.Output.json_dumps({
        "deadLetterTargetArn": example.arn,
        "maxReceiveCount": 4,
    }))
example_redrive_allow_policy = aws.sqs.RedriveAllowPolicy("example",
    queue_url=example.id,
    redrive_allow_policy=pulumi.Output.json_dumps({
        "redrivePermission": "byQueue",
        "sourceQueueArns": [src.arn],
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
		example, err := sqs.NewQueue(ctx, "example", &sqs.QueueArgs{
			Name: pulumi.String("examplequeue"),
		})
		if err != nil {
			return err
		}
		src, err := sqs.NewQueue(ctx, "src", &sqs.QueueArgs{
			Name: pulumi.String("srcqueue"),
			RedrivePolicy: example.Arn.ApplyT(func(arn string) (pulumi.String, error) {
				var _zero pulumi.String
				tmpJSON0, err := json.Marshal(map[string]interface{}{
					"deadLetterTargetArn": arn,
					"maxReceiveCount":     4,
				})
				if err != nil {
					return _zero, err
				}
				json0 := string(tmpJSON0)
				return pulumi.String(json0), nil
			}).(pulumi.StringOutput),
		})
		if err != nil {
			return err
		}
		_, err = sqs.NewRedriveAllowPolicy(ctx, "example", &sqs.RedriveAllowPolicyArgs{
			QueueUrl: example.ID(),
			RedriveAllowPolicy: src.Arn.ApplyT(func(arn string) (pulumi.String, error) {
				var _zero pulumi.String
				tmpJSON1, err := json.Marshal(map[string]interface{}{
					"redrivePermission": "byQueue",
					"sourceQueueArns": []string{
						arn,
					},
				})
				if err != nil {
					return _zero, err
				}
				json1 := string(tmpJSON1)
				return pulumi.String(json1), nil
			}).(pulumi.StringOutput),
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
    var example = new Aws.Sqs.Queue("example", new()
    {
        Name = "examplequeue",
    });

    var src = new Aws.Sqs.Queue("src", new()
    {
        Name = "srcqueue",
        RedrivePolicy = Output.JsonSerialize(Output.Create(new Dictionary<string, object?>
        {
            ["deadLetterTargetArn"] = example.Arn,
            ["maxReceiveCount"] = 4,
        })),
    });

    var exampleRedriveAllowPolicy = new Aws.Sqs.RedriveAllowPolicy("example", new()
    {
        QueueUrl = example.Id,
        RedriveAllowPolicyName = Output.JsonSerialize(Output.Create(new Dictionary<string, object?>
        {
            ["redrivePermission"] = "byQueue",
            ["sourceQueueArns"] = new[]
            {
                src.Arn,
            },
        })),
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
        var example = new Queue("example", QueueArgs.builder()
            .name("examplequeue")
            .build());

        var src = new Queue("src", QueueArgs.builder()
            .name("srcqueue")
            .redrivePolicy(example.arn().applyValue(_arn -> serializeJson(
                jsonObject(
                    jsonProperty("deadLetterTargetArn", _arn),
                    jsonProperty("maxReceiveCount", 4)
                ))))
            .build());

        var exampleRedriveAllowPolicy = new RedriveAllowPolicy("exampleRedriveAllowPolicy", RedriveAllowPolicyArgs.builder()
            .queueUrl(example.id())
            .redriveAllowPolicy(src.arn().applyValue(_arn -> serializeJson(
                jsonObject(
                    jsonProperty("redrivePermission", "byQueue"),
                    jsonProperty("sourceQueueArns", jsonArray(_arn))
                ))))
            .build());

    }
}
```

```yaml
resources:
  src:
    type: aws:sqs:Queue
    properties:
      name: srcqueue
      redrivePolicy:
        fn::toJSON:
          deadLetterTargetArn: ${example.arn}
          maxReceiveCount: 4
  example:
    type: aws:sqs:Queue
    properties:
      name: examplequeue
  exampleRedriveAllowPolicy:
    type: aws:sqs:RedriveAllowPolicy
    name: example
    properties:
      queueUrl: ${example.id}
      redriveAllowPolicy:
        fn::toJSON:
          redrivePermission: byQueue
          sourceQueueArns:
            - ${src.arn}
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_sqs_queue" "src" {
  name = "srcqueue"
  redrive_policy = jsonencode({
    "deadLetterTargetArn" = aws_sqs_queue.example.arn
    "maxReceiveCount"     = 4
  })
}
resource "aws_sqs_queue" "example" {
  name = "examplequeue"
}
resource "aws_sqs_redriveallowpolicy" "example" {
  queue_url = aws_sqs_queue.example.id
  redrive_allow_policy = jsonencode({
    "redrivePermission" = "byQueue"
    "sourceQueueArns"   = [aws_sqs_queue.src.arn]
  })
}
```

## Create RedriveAllowPolicy Resource[](#create)

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
new RedriveAllowPolicy(name: string, args: RedriveAllowPolicyArgs, opts?: CustomResourceOptions);
```

```python
@overload
def RedriveAllowPolicy(resource_name: str,
                       args: RedriveAllowPolicyArgs,
                       opts: Optional[ResourceOptions] = None)

@overload
def RedriveAllowPolicy(resource_name: str,
                       opts: Optional[ResourceOptions] = None,
                       queue_url: Optional[str] = None,
                       redrive_allow_policy: Optional[str] = None,
                       region: Optional[str] = None)
```

```go
func NewRedriveAllowPolicy(ctx *Context, name string, args RedriveAllowPolicyArgs, opts ...ResourceOption) (*RedriveAllowPolicy, error)
```

```csharp
public RedriveAllowPolicy(string name, RedriveAllowPolicyArgs args, CustomResourceOptions? opts = null)
```

```java
public RedriveAllowPolicy(String name, RedriveAllowPolicyArgs args)
public RedriveAllowPolicy(String name, RedriveAllowPolicyArgs args, CustomResourceOptions options)
```

```yaml
type: aws:sqs:RedriveAllowPolicy
properties: # The arguments to resource properties.
options: # Bag of options to control resource's behavior.
```

```hcl
resource "aws_sqs_redriveallowpolicy" "name" {
    # resource properties
}
```

#### Parameters[](#parameters)

name This property is required. string

The unique name of the resource.

args This property is required. [RedriveAllowPolicyArgs](#inputs)

The arguments to resource properties.

opts [CustomResourceOptions](/docs/reference/pkg/nodejs/pulumi/pulumi/#CustomResourceOptions)

Bag of options to control resource's behavior.

resource\_name This property is required. str

The unique name of the resource.

args This property is required. [RedriveAllowPolicyArgs](#inputs)

The arguments to resource properties.

opts [ResourceOptions](/docs/reference/pkg/python/pulumi/#pulumi.ResourceOptions)

Bag of options to control resource's behavior.

ctx [Context](https://pkg.go.dev/github.com/pulumi/pulumi/sdk/v3/go/pulumi?tab=doc#Context)

Context object for the current deployment.

name This property is required. string

The unique name of the resource.

args This property is required. [RedriveAllowPolicyArgs](#inputs)

The arguments to resource properties.

opts [ResourceOption](https://pkg.go.dev/github.com/pulumi/pulumi/sdk/v3/go/pulumi?tab=doc#ResourceOption)

Bag of options to control resource's behavior.

name This property is required. string

The unique name of the resource.

args This property is required. [RedriveAllowPolicyArgs](#inputs)

The arguments to resource properties.

opts [CustomResourceOptions](/docs/reference/pkg/dotnet/Pulumi/Pulumi.CustomResourceOptions.html)

Bag of options to control resource's behavior.

name This property is required. String

The unique name of the resource.

args This property is required. [RedriveAllowPolicyArgs](#inputs)

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
var redriveAllowPolicyResource = new Aws.Sqs.RedriveAllowPolicy("redriveAllowPolicyResource", new()
{
    QueueUrl = "string",
    RedriveAllowPolicyName = "string",
    Region = "string",
});
```

```go
example, err := sqs.NewRedriveAllowPolicy(ctx, "redriveAllowPolicyResource", &sqs.RedriveAllowPolicyArgs{
	QueueUrl:           pulumi.String("string"),
	RedriveAllowPolicy: pulumi.String("string"),
	Region:             pulumi.String("string"),
})
```

```hcl
resource "aws_sqs_redriveallowpolicy" "redriveAllowPolicyResource" {
  queue_url            = "string"
  redrive_allow_policy = "string"
  region               = "string"
}
```

```java
var redriveAllowPolicyResource = new RedriveAllowPolicy("redriveAllowPolicyResource", RedriveAllowPolicyArgs.builder()
    .queueUrl("string")
    .redriveAllowPolicy("string")
    .region("string")
    .build());
```

```python
redrive_allow_policy_resource = aws.sqs.RedriveAllowPolicy("redriveAllowPolicyResource",
    queue_url="string",
    redrive_allow_policy="string",
    region="string")
```

```typescript
const redriveAllowPolicyResource = new aws.sqs.RedriveAllowPolicy("redriveAllowPolicyResource", {
    queueUrl: "string",
    redriveAllowPolicy: "string",
    region: "string",
});
```

```yaml
type: aws:sqs:RedriveAllowPolicy
properties:
    queueUrl: string
    redriveAllowPolicy: string
    region: string
```

## RedriveAllowPolicy Resource Properties[](#properties)

To learn more about resource properties and how to use them, see [Inputs and Outputs](/docs/intro/concepts/inputs-outputs) in the Architecture and Concepts docs.

### Inputs[](#inputs)

In Python, inputs that are objects can be passed either as [argument classes or as dictionary literals](/docs/languages-sdks/python/#inputs-and-outputs).

The RedriveAllowPolicy resource accepts the following [input](/docs/intro/concepts/inputs-outputs) properties:

[QueueUrl](#queueurl_csharp)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

The URL of the SQS Queue to which to attach the policy

[RedriveAllowPolicyName](#redriveallowpolicyname_csharp) This property is required. string

The JSON redrive allow policy for the SQS queue. Learn more in the [Amazon SQS dead-letter queues documentation](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html).

[Region](#region_csharp) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[QueueUrl](#queueurl_go)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

The URL of the SQS Queue to which to attach the policy

[RedriveAllowPolicy](#redriveallowpolicy_go) This property is required. string

The JSON redrive allow policy for the SQS queue. Learn more in the [Amazon SQS dead-letter queues documentation](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html).

[Region](#region_go) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[queue\_url](#queue_url_hcl)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

The URL of the SQS Queue to which to attach the policy

[redrive\_allow\_policy](#redrive_allow_policy_hcl) This property is required. string

The JSON redrive allow policy for the SQS queue. Learn more in the [Amazon SQS dead-letter queues documentation](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html).

[region](#region_hcl) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[queueUrl](#queueurl_java)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

String

The URL of the SQS Queue to which to attach the policy

[redriveAllowPolicy](#redriveallowpolicy_java) This property is required. String

The JSON redrive allow policy for the SQS queue. Learn more in the [Amazon SQS dead-letter queues documentation](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html).

[region](#region_java) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[queueUrl](#queueurl_nodejs)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

The URL of the SQS Queue to which to attach the policy

[redriveAllowPolicy](#redriveallowpolicy_nodejs) This property is required. string

The JSON redrive allow policy for the SQS queue. Learn more in the [Amazon SQS dead-letter queues documentation](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html).

[region](#region_nodejs) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[queue\_url](#queue_url_python)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

str

The URL of the SQS Queue to which to attach the policy

[redrive\_allow\_policy](#redrive_allow_policy_python) This property is required. str

The JSON redrive allow policy for the SQS queue. Learn more in the [Amazon SQS dead-letter queues documentation](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html).

[region](#region_python) str

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[queueUrl](#queueurl_yaml)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

String

The URL of the SQS Queue to which to attach the policy

[redriveAllowPolicy](#redriveallowpolicy_yaml) This property is required. String

The JSON redrive allow policy for the SQS queue. Learn more in the [Amazon SQS dead-letter queues documentation](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html).

[region](#region_yaml) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

### Outputs[](#outputs)

All [input](#inputs) properties are implicitly available as output properties. Additionally, the RedriveAllowPolicy resource produces the following output properties:

[Id](#id_csharp) string

The provider-assigned unique ID for this managed resource.

[Id](#id_go) string

The provider-assigned unique ID for this managed resource.

[id](#id_hcl) string

The provider-assigned unique ID for this managed resource.

[id](#id_java) String

The provider-assigned unique ID for this managed resource.

[id](#id_nodejs) string

The provider-assigned unique ID for this managed resource.

[id](#id_python) str

The provider-assigned unique ID for this managed resource.

[id](#id_yaml) String

The provider-assigned unique ID for this managed resource.

## Look up Existing RedriveAllowPolicy Resource[](#look-up)

Get an existing RedriveAllowPolicy resource’s state with the given name, ID, and optional extra properties used to qualify the lookup.

-   TypeScript
-   Python
-   Go
-   C#
-   Java
-   YAML
-   HCL PREVIEW

```typescript
public static get(name: string, id: Input<ID>, state?: RedriveAllowPolicyState, opts?: CustomResourceOptions): RedriveAllowPolicy
```

```python
@staticmethod
def get(resource_name: str,
        id: str,
        opts: Optional[ResourceOptions] = None,
        queue_url: Optional[str] = None,
        redrive_allow_policy: Optional[str] = None,
        region: Optional[str] = None) -> RedriveAllowPolicy
```

```go
func GetRedriveAllowPolicy(ctx *Context, name string, id IDInput, state *RedriveAllowPolicyState, opts ...ResourceOption) (*RedriveAllowPolicy, error)
```

```csharp
public static RedriveAllowPolicy Get(string name, Input<string> id, RedriveAllowPolicyState? state, CustomResourceOptions? opts = null)
```

```java
public static RedriveAllowPolicy get(String name, Output<String> id, RedriveAllowPolicyState state, CustomResourceOptions options)
```

```yaml
resources:  _:    type: aws:sqs:RedriveAllowPolicy    get:      id: ${id}
```

```hcl
import {
  to = aws_sqs_redriveallowpolicy.example
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

[QueueUrl](#state_queueurl_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

The URL of the SQS Queue to which to attach the policy

[RedriveAllowPolicyName](#state_redriveallowpolicyname_csharp) string

The JSON redrive allow policy for the SQS queue. Learn more in the [Amazon SQS dead-letter queues documentation](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html).

[Region](#state_region_csharp) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[QueueUrl](#state_queueurl_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

The URL of the SQS Queue to which to attach the policy

[RedriveAllowPolicy](#state_redriveallowpolicy_go) string

The JSON redrive allow policy for the SQS queue. Learn more in the [Amazon SQS dead-letter queues documentation](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html).

[Region](#state_region_go) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[queue\_url](#state_queue_url_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

The URL of the SQS Queue to which to attach the policy

[redrive\_allow\_policy](#state_redrive_allow_policy_hcl) string

The JSON redrive allow policy for the SQS queue. Learn more in the [Amazon SQS dead-letter queues documentation](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html).

[region](#state_region_hcl) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[queueUrl](#state_queueurl_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

The URL of the SQS Queue to which to attach the policy

[redriveAllowPolicy](#state_redriveallowpolicy_java) String

The JSON redrive allow policy for the SQS queue. Learn more in the [Amazon SQS dead-letter queues documentation](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html).

[region](#state_region_java) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[queueUrl](#state_queueurl_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

The URL of the SQS Queue to which to attach the policy

[redriveAllowPolicy](#state_redriveallowpolicy_nodejs) string

The JSON redrive allow policy for the SQS queue. Learn more in the [Amazon SQS dead-letter queues documentation](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html).

[region](#state_region_nodejs) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[queue\_url](#state_queue_url_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

The URL of the SQS Queue to which to attach the policy

[redrive\_allow\_policy](#state_redrive_allow_policy_python) str

The JSON redrive allow policy for the SQS queue. Learn more in the [Amazon SQS dead-letter queues documentation](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html).

[region](#state_region_python) str

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[queueUrl](#state_queueurl_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

The URL of the SQS Queue to which to attach the policy

[redriveAllowPolicy](#state_redriveallowpolicy_yaml) String

The JSON redrive allow policy for the SQS queue. Learn more in the [Amazon SQS dead-letter queues documentation](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html).

[region](#state_region_yaml) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

## Import[](#import)

Using `pulumi import`, import SQS Queue Redrive Allow Policies using the queue URL. For example:

```bash
$ pulumi import aws:sqs/redriveAllowPolicy:RedriveAllowPolicy test https://queue.amazonaws.com/123456789012/myqueue
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

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2fsqs%2fredriveallowpolicy]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2fsqs%2fredriveallowpolicy%2f\))

#### Try Pulumi Cloud free.
Your team will thank you.

[Start free trial](https://app.pulumi.com/signup?utm_source=registry&utm_medium=right-rail-banner&utm_campaign=try-pulumi-cloud&iaid=docs-try-pulumi-cloud-ad)
