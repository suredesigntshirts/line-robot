---
Source: https://www.pulumi.com/registry/packages/aws/api-docs/lambda/permission/
Generated: 2026-06-06
Updated: 2026-06-06
---

# aws.lambda.Permission

1.  [Packages](/registry/)
2.  [Packages](/registry/packages/)
3.  [AWS](/registry/packages/aws/)
4.  [API Docs](/registry/packages/aws/api-docs/)
5.  [lambda](/registry/packages/aws/api-docs/lambda/)
6.  [Permission](/registry/packages/aws/api-docs/lambda/permission/)

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

Viewing docs for AWS v7.32.0
published on Friday, May 29, 2026 by Pulumi

[Schema (JSON)](/registry/packages/aws/schema.json)

[pulumi/pulumi-aws](https://github.com/pulumi/pulumi-aws)

v7.32.0 (7.x, latest)v6.83.1 (6.x)v5.43.0 (5.x)

# aws.lambda.Permission[](#aws-lambda-permission)

Explore with Neo

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2flambda%2fpermission]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2flambda%2fpermission%2f\))

Manages an AWS Lambda permission. Use this resource to grant external sources (e.g., EventBridge Rules, SNS, or S3) permission to invoke Lambda functions.

## Example Usage[](#example-usage)

### Basic Usage with EventBridge[](#basic-usage-with-eventbridge)

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const iamForLambda = new aws.iam.Role("iam_for_lambda", {
    name: "iam_for_lambda",
    assumeRolePolicy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [{
            Action: "sts:AssumeRole",
            Effect: "Allow",
            Sid: "",
            Principal: {
                Service: "lambda.amazonaws.com",
            },
        }],
    }),
});
const testLambda = new aws.lambda.Function("test_lambda", {
    code: new pulumi.asset.FileArchive("lambdatest.zip"),
    name: "lambda_function_name",
    role: iamForLambda.arn,
    handler: "exports.handler",
    runtime: aws.lambda.Runtime.NodeJS24dX,
});
const testAlias = new aws.lambda.Alias("test_alias", {
    name: "testalias",
    description: "a sample description",
    functionName: testLambda.name,
    functionVersion: "$LATEST",
});
const allowCloudwatch = new aws.lambda.Permission("allow_cloudwatch", {
    statementId: "AllowExecutionFromCloudWatch",
    action: "lambda:InvokeFunction",
    "function": testLambda.name,
    principal: "events.amazonaws.com",
    sourceArn: "arn:aws:events:eu-west-1:111122223333:rule/RunDaily",
    qualifier: testAlias.name,
});
```

```python
import pulumi
import json
import pulumi_aws as aws

iam_for_lambda = aws.iam.Role("iam_for_lambda",
    name="iam_for_lambda",
    assume_role_policy=json.dumps({
        "Version": "2012-10-17",
        "Statement": [{
            "Action": "sts:AssumeRole",
            "Effect": "Allow",
            "Sid": "",
            "Principal": {
                "Service": "lambda.amazonaws.com",
            },
        }],
    }))
test_lambda = aws.lambda_.Function("test_lambda",
    code=pulumi.FileArchive("lambdatest.zip"),
    name="lambda_function_name",
    role=iam_for_lambda.arn,
    handler="exports.handler",
    runtime=aws.lambda_.Runtime.NODE_JS24D_X)
test_alias = aws.lambda_.Alias("test_alias",
    name="testalias",
    description="a sample description",
    function_name=test_lambda.name,
    function_version="$LATEST")
allow_cloudwatch = aws.lambda_.Permission("allow_cloudwatch",
    statement_id="AllowExecutionFromCloudWatch",
    action="lambda:InvokeFunction",
    function=test_lambda.name,
    principal="events.amazonaws.com",
    source_arn="arn:aws:events:eu-west-1:111122223333:rule/RunDaily",
    qualifier=test_alias.name)
```

```go
package main

import (
	"encoding/json"

	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/iam"
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/lambda"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		tmpJSON0, err := json.Marshal(map[string]interface{}{
			"Version": "2012-10-17",
			"Statement": []map[string]interface{}{
				map[string]interface{}{
					"Action": "sts:AssumeRole",
					"Effect": "Allow",
					"Sid":    "",
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
		iamForLambda, err := iam.NewRole(ctx, "iam_for_lambda", &iam.RoleArgs{
			Name:             pulumi.String("iam_for_lambda"),
			AssumeRolePolicy: pulumi.String(pulumi.String(json0)),
		})
		if err != nil {
			return err
		}
		testLambda, err := lambda.NewFunction(ctx, "test_lambda", &lambda.FunctionArgs{
			Code:    pulumi.NewFileArchive("lambdatest.zip"),
			Name:    pulumi.String("lambda_function_name"),
			Role:    iamForLambda.Arn,
			Handler: pulumi.String("exports.handler"),
			Runtime: pulumi.String(lambda.RuntimeNodeJS24dX),
		})
		if err != nil {
			return err
		}
		testAlias, err := lambda.NewAlias(ctx, "test_alias", &lambda.AliasArgs{
			Name:            pulumi.String("testalias"),
			Description:     pulumi.String("a sample description"),
			FunctionName:    testLambda.Name,
			FunctionVersion: pulumi.String("$LATEST"),
		})
		if err != nil {
			return err
		}
		_, err = lambda.NewPermission(ctx, "allow_cloudwatch", &lambda.PermissionArgs{
			StatementId: pulumi.String("AllowExecutionFromCloudWatch"),
			Action:      pulumi.String("lambda:InvokeFunction"),
			Function:    testLambda.Name,
			Principal:   pulumi.String("events.amazonaws.com"),
			SourceArn:   pulumi.String("arn:aws:events:eu-west-1:111122223333:rule/RunDaily"),
			Qualifier:   testAlias.Name,
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
    var iamForLambda = new Aws.Iam.Role("iam_for_lambda", new()
    {
        Name = "iam_for_lambda",
        AssumeRolePolicy = JsonSerializer.Serialize(new Dictionary<string, object?>
        {
            ["Version"] = "2012-10-17",
            ["Statement"] = new[]
            {
                new Dictionary<string, object?>
                {
                    ["Action"] = "sts:AssumeRole",
                    ["Effect"] = "Allow",
                    ["Sid"] = "",
                    ["Principal"] = new Dictionary<string, object?>
                    {
                        ["Service"] = "lambda.amazonaws.com",
                    },
                },
            },
        }),
    });

    var testLambda = new Aws.Lambda.Function("test_lambda", new()
    {
        Code = new FileArchive("lambdatest.zip"),
        Name = "lambda_function_name",
        Role = iamForLambda.Arn,
        Handler = "exports.handler",
        Runtime = Aws.Lambda.Runtime.NodeJS24dX,
    });

    var testAlias = new Aws.Lambda.Alias("test_alias", new()
    {
        Name = "testalias",
        Description = "a sample description",
        FunctionName = testLambda.Name,
        FunctionVersion = "$LATEST",
    });

    var allowCloudwatch = new Aws.Lambda.Permission("allow_cloudwatch", new()
    {
        StatementId = "AllowExecutionFromCloudWatch",
        Action = "lambda:InvokeFunction",
        Function = testLambda.Name,
        Principal = "events.amazonaws.com",
        SourceArn = "arn:aws:events:eu-west-1:111122223333:rule/RunDaily",
        Qualifier = testAlias.Name,
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.iam.Role;
import com.pulumi.aws.iam.RoleArgs;
import com.pulumi.aws.lambda.Function;
import com.pulumi.aws.lambda.FunctionArgs;
import com.pulumi.aws.lambda.Alias;
import com.pulumi.aws.lambda.AliasArgs;
import com.pulumi.aws.lambda.Permission;
import com.pulumi.aws.lambda.PermissionArgs;
import com.pulumi.asset.FileArchive;
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
        var iamForLambda = new Role("iamForLambda", RoleArgs.builder()
            .name("iam_for_lambda")
            .assumeRolePolicy(serializeJson(
                jsonObject(
                    jsonProperty("Version", "2012-10-17"),
                    jsonProperty("Statement", jsonArray(jsonObject(
                        jsonProperty("Action", "sts:AssumeRole"),
                        jsonProperty("Effect", "Allow"),
                        jsonProperty("Sid", ""),
                        jsonProperty("Principal", jsonObject(
                            jsonProperty("Service", "lambda.amazonaws.com")
                        ))
                    )))
                )))
            .build());

        var testLambda = new Function("testLambda", FunctionArgs.builder()
            .code(new FileArchive("lambdatest.zip"))
            .name("lambda_function_name")
            .role(iamForLambda.arn())
            .handler("exports.handler")
            .runtime("nodejs24.x")
            .build());

        var testAlias = new Alias("testAlias", AliasArgs.builder()
            .name("testalias")
            .description("a sample description")
            .functionName(testLambda.name())
            .functionVersion("$LATEST")
            .build());

        var allowCloudwatch = new Permission("allowCloudwatch", PermissionArgs.builder()
            .statementId("AllowExecutionFromCloudWatch")
            .action("lambda:InvokeFunction")
            .function(testLambda.name())
            .principal("events.amazonaws.com")
            .sourceArn("arn:aws:events:eu-west-1:111122223333:rule/RunDaily")
            .qualifier(testAlias.name())
            .build());

    }
}
```

```yaml
resources:
  allowCloudwatch:
    type: aws:lambda:Permission
    name: allow_cloudwatch
    properties:
      statementId: AllowExecutionFromCloudWatch
      action: lambda:InvokeFunction
      function: ${testLambda.name}
      principal: events.amazonaws.com
      sourceArn: arn:aws:events:eu-west-1:111122223333:rule/RunDaily
      qualifier: ${testAlias.name}
  testAlias:
    type: aws:lambda:Alias
    name: test_alias
    properties:
      name: testalias
      description: a sample description
      functionName: ${testLambda.name}
      functionVersion: $LATEST
  testLambda:
    type: aws:lambda:Function
    name: test_lambda
    properties:
      code:
        fn::fileArchive: lambdatest.zip
      name: lambda_function_name
      role: ${iamForLambda.arn}
      handler: exports.handler
      runtime: nodejs24.x
  iamForLambda:
    type: aws:iam:Role
    name: iam_for_lambda
    properties:
      name: iam_for_lambda
      assumeRolePolicy:
        fn::toJSON:
          Version: 2012-10-17
          Statement:
            - Action: sts:AssumeRole
              Effect: Allow
              Sid: ""
              Principal:
                Service: lambda.amazonaws.com
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_lambda_permission" "allow_cloudwatch" {
  statement_id = "AllowExecutionFromCloudWatch"
  action       = "lambda:InvokeFunction"
  function     = aws_lambda_function.test_lambda.name
  principal    = "events.amazonaws.com"
  source_arn   = "arn:aws:events:eu-west-1:111122223333:rule/RunDaily"
  qualifier    = aws_lambda_alias.test_alias.name
}
resource "aws_lambda_alias" "test_alias" {
  name             = "testalias"
  description      = "a sample description"
  function_name    = aws_lambda_function.test_lambda.name
  function_version = "$LATEST"
}
resource "aws_lambda_function" "test_lambda" {
  code    = fileArchive("lambdatest.zip")
  name    = "lambda_function_name"
  role    = aws_iam_role.iam_for_lambda.arn
  handler = "exports.handler"
  runtime = "nodejs24.x"
}
resource "aws_iam_role" "iam_for_lambda" {
  name = "iam_for_lambda"
  assume_role_policy = jsonencode({
    "Version" = "2012-10-17"
    "Statement" = [{
      "Action" = "sts:AssumeRole"
      "Effect" = "Allow"
      "Sid"    = ""
      "Principal" = {
        "Service" = "lambda.amazonaws.com"
      }
    }]
  })
}
```

### SNS Integration[](#sns-integration)

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const _default = new aws.sns.Topic("default", {name: "call-lambda-maybe"});
const defaultRole = new aws.iam.Role("default", {
    name: "iam_for_lambda_with_sns",
    assumeRolePolicy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [{
            Action: "sts:AssumeRole",
            Effect: "Allow",
            Sid: "",
            Principal: {
                Service: "lambda.amazonaws.com",
            },
        }],
    }),
});
const func = new aws.lambda.Function("func", {
    code: new pulumi.asset.FileArchive("lambdatest.zip"),
    name: "lambda_called_from_sns",
    role: defaultRole.arn,
    handler: "exports.handler",
    runtime: aws.lambda.Runtime.Python3d12,
});
const withSns = new aws.lambda.Permission("with_sns", {
    statementId: "AllowExecutionFromSNS",
    action: "lambda:InvokeFunction",
    "function": func.name,
    principal: "sns.amazonaws.com",
    sourceArn: _default.arn,
});
const lambda = new aws.sns.TopicSubscription("lambda", {
    topic: _default.arn,
    protocol: "lambda",
    endpoint: func.arn,
});
```

```python
import pulumi
import json
import pulumi_aws as aws

default = aws.sns.Topic("default", name="call-lambda-maybe")
default_role = aws.iam.Role("default",
    name="iam_for_lambda_with_sns",
    assume_role_policy=json.dumps({
        "Version": "2012-10-17",
        "Statement": [{
            "Action": "sts:AssumeRole",
            "Effect": "Allow",
            "Sid": "",
            "Principal": {
                "Service": "lambda.amazonaws.com",
            },
        }],
    }))
func = aws.lambda_.Function("func",
    code=pulumi.FileArchive("lambdatest.zip"),
    name="lambda_called_from_sns",
    role=default_role.arn,
    handler="exports.handler",
    runtime=aws.lambda_.Runtime.PYTHON3D12)
with_sns = aws.lambda_.Permission("with_sns",
    statement_id="AllowExecutionFromSNS",
    action="lambda:InvokeFunction",
    function=func.name,
    principal="sns.amazonaws.com",
    source_arn=default.arn)
lambda_ = aws.sns.TopicSubscription("lambda",
    topic=default.arn,
    protocol="lambda",
    endpoint=func.arn)
```

```go
package main

import (
	"encoding/json"

	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/iam"
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/lambda"
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/sns"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		_default, err := sns.NewTopic(ctx, "default", &sns.TopicArgs{
			Name: pulumi.String("call-lambda-maybe"),
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
					"Sid":    "",
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
		defaultRole, err := iam.NewRole(ctx, "default", &iam.RoleArgs{
			Name:             pulumi.String("iam_for_lambda_with_sns"),
			AssumeRolePolicy: pulumi.String(pulumi.String(json0)),
		})
		if err != nil {
			return err
		}
		_func, err := lambda.NewFunction(ctx, "func", &lambda.FunctionArgs{
			Code:    pulumi.NewFileArchive("lambdatest.zip"),
			Name:    pulumi.String("lambda_called_from_sns"),
			Role:    defaultRole.Arn,
			Handler: pulumi.String("exports.handler"),
			Runtime: pulumi.String(lambda.RuntimePython3d12),
		})
		if err != nil {
			return err
		}
		_, err = lambda.NewPermission(ctx, "with_sns", &lambda.PermissionArgs{
			StatementId: pulumi.String("AllowExecutionFromSNS"),
			Action:      pulumi.String("lambda:InvokeFunction"),
			Function:    _func.Name,
			Principal:   pulumi.String("sns.amazonaws.com"),
			SourceArn:   _default.Arn,
		})
		if err != nil {
			return err
		}
		_, err = sns.NewTopicSubscription(ctx, "lambda", &sns.TopicSubscriptionArgs{
			Topic:    _default.Arn,
			Protocol: pulumi.String("lambda"),
			Endpoint: _func.Arn,
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
    var @default = new Aws.Sns.Topic("default", new()
    {
        Name = "call-lambda-maybe",
    });

    var defaultRole = new Aws.Iam.Role("default", new()
    {
        Name = "iam_for_lambda_with_sns",
        AssumeRolePolicy = JsonSerializer.Serialize(new Dictionary<string, object?>
        {
            ["Version"] = "2012-10-17",
            ["Statement"] = new[]
            {
                new Dictionary<string, object?>
                {
                    ["Action"] = "sts:AssumeRole",
                    ["Effect"] = "Allow",
                    ["Sid"] = "",
                    ["Principal"] = new Dictionary<string, object?>
                    {
                        ["Service"] = "lambda.amazonaws.com",
                    },
                },
            },
        }),
    });

    var func = new Aws.Lambda.Function("func", new()
    {
        Code = new FileArchive("lambdatest.zip"),
        Name = "lambda_called_from_sns",
        Role = defaultRole.Arn,
        Handler = "exports.handler",
        Runtime = Aws.Lambda.Runtime.Python3d12,
    });

    var withSns = new Aws.Lambda.Permission("with_sns", new()
    {
        StatementId = "AllowExecutionFromSNS",
        Action = "lambda:InvokeFunction",
        Function = func.Name,
        Principal = "sns.amazonaws.com",
        SourceArn = @default.Arn,
    });

    var lambda = new Aws.Sns.TopicSubscription("lambda", new()
    {
        Topic = @default.Arn,
        Protocol = "lambda",
        Endpoint = func.Arn,
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
import com.pulumi.aws.iam.Role;
import com.pulumi.aws.iam.RoleArgs;
import com.pulumi.aws.lambda.Function;
import com.pulumi.aws.lambda.FunctionArgs;
import com.pulumi.aws.lambda.Permission;
import com.pulumi.aws.lambda.PermissionArgs;
import com.pulumi.aws.sns.TopicSubscription;
import com.pulumi.aws.sns.TopicSubscriptionArgs;
import com.pulumi.asset.FileArchive;
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
        var default_ = new Topic("default", TopicArgs.builder()
            .name("call-lambda-maybe")
            .build());

        var defaultRole = new Role("defaultRole", RoleArgs.builder()
            .name("iam_for_lambda_with_sns")
            .assumeRolePolicy(serializeJson(
                jsonObject(
                    jsonProperty("Version", "2012-10-17"),
                    jsonProperty("Statement", jsonArray(jsonObject(
                        jsonProperty("Action", "sts:AssumeRole"),
                        jsonProperty("Effect", "Allow"),
                        jsonProperty("Sid", ""),
                        jsonProperty("Principal", jsonObject(
                            jsonProperty("Service", "lambda.amazonaws.com")
                        ))
                    )))
                )))
            .build());

        var func = new Function("func", FunctionArgs.builder()
            .code(new FileArchive("lambdatest.zip"))
            .name("lambda_called_from_sns")
            .role(defaultRole.arn())
            .handler("exports.handler")
            .runtime("python3.12")
            .build());

        var withSns = new Permission("withSns", PermissionArgs.builder()
            .statementId("AllowExecutionFromSNS")
            .action("lambda:InvokeFunction")
            .function(func.name())
            .principal("sns.amazonaws.com")
            .sourceArn(default_.arn())
            .build());

        var lambda = new TopicSubscription("lambda", TopicSubscriptionArgs.builder()
            .topic(default_.arn())
            .protocol("lambda")
            .endpoint(func.arn())
            .build());

    }
}
```

```yaml
resources:
  withSns:
    type: aws:lambda:Permission
    name: with_sns
    properties:
      statementId: AllowExecutionFromSNS
      action: lambda:InvokeFunction
      function: ${func.name}
      principal: sns.amazonaws.com
      sourceArn: ${default.arn}
  default:
    type: aws:sns:Topic
    properties:
      name: call-lambda-maybe
  lambda:
    type: aws:sns:TopicSubscription
    properties:
      topic: ${default.arn}
      protocol: lambda
      endpoint: ${func.arn}
  func:
    type: aws:lambda:Function
    properties:
      code:
        fn::fileArchive: lambdatest.zip
      name: lambda_called_from_sns
      role: ${defaultRole.arn}
      handler: exports.handler
      runtime: python3.12
  defaultRole:
    type: aws:iam:Role
    name: default
    properties:
      name: iam_for_lambda_with_sns
      assumeRolePolicy:
        fn::toJSON:
          Version: 2012-10-17
          Statement:
            - Action: sts:AssumeRole
              Effect: Allow
              Sid: ""
              Principal:
                Service: lambda.amazonaws.com
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_lambda_permission" "with_sns" {
  statement_id = "AllowExecutionFromSNS"
  action       = "lambda:InvokeFunction"
  function     = aws_lambda_function.func.name
  principal    = "sns.amazonaws.com"
  source_arn   = aws_sns_topic.default.arn
}
resource "aws_sns_topic" "default" {
  name = "call-lambda-maybe"
}
resource "aws_sns_topicsubscription" "lambda" {
  topic    = aws_sns_topic.default.arn
  protocol = "lambda"
  endpoint = aws_lambda_function.func.arn
}
resource "aws_lambda_function" "func" {
  code    = fileArchive("lambdatest.zip")
  name    = "lambda_called_from_sns"
  role    = aws_iam_role.default.arn
  handler = "exports.handler"
  runtime = "python3.12"
}
resource "aws_iam_role" "default" {
  name = "iam_for_lambda_with_sns"
  assume_role_policy = jsonencode({
    "Version" = "2012-10-17"
    "Statement" = [{
      "Action" = "sts:AssumeRole"
      "Effect" = "Allow"
      "Sid"    = ""
      "Principal" = {
        "Service" = "lambda.amazonaws.com"
      }
    }]
  })
}
```

### API Gateway REST API Integration[](#api-gateway-rest-api-integration)

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const myDemoAPI = new aws.apigateway.RestApi("MyDemoAPI", {
    name: "MyDemoAPI",
    description: "This is my API for demonstration purposes",
});
const lambdaPermission = new aws.lambda.Permission("lambda_permission", {
    statementId: "AllowMyDemoAPIInvoke",
    action: "lambda:InvokeFunction",
    "function": "MyDemoFunction",
    principal: "apigateway.amazonaws.com",
    sourceArn: pulumi.interpolate`${myDemoAPI.executionArn}/*`,
});
```

```python
import pulumi
import pulumi_aws as aws

my_demo_api = aws.apigateway.RestApi("MyDemoAPI",
    name="MyDemoAPI",
    description="This is my API for demonstration purposes")
lambda_permission = aws.lambda_.Permission("lambda_permission",
    statement_id="AllowMyDemoAPIInvoke",
    action="lambda:InvokeFunction",
    function="MyDemoFunction",
    principal="apigateway.amazonaws.com",
    source_arn=my_demo_api.execution_arn.apply(lambda execution_arn: f"{execution_arn}/*"))
```

```go
package main

import (
	"fmt"

	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/apigateway"
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/lambda"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		myDemoAPI, err := apigateway.NewRestApi(ctx, "MyDemoAPI", &apigateway.RestApiArgs{
			Name:        pulumi.String("MyDemoAPI"),
			Description: pulumi.String("This is my API for demonstration purposes"),
		})
		if err != nil {
			return err
		}
		_, err = lambda.NewPermission(ctx, "lambda_permission", &lambda.PermissionArgs{
			StatementId: pulumi.String("AllowMyDemoAPIInvoke"),
			Action:      pulumi.String("lambda:InvokeFunction"),
			Function:    pulumi.Any("MyDemoFunction"),
			Principal:   pulumi.String("apigateway.amazonaws.com"),
			SourceArn: myDemoAPI.ExecutionArn.ApplyT(func(executionArn string) (string, error) {
				return fmt.Sprintf("%v/*", executionArn), nil
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
using Pulumi;
using Aws = Pulumi.Aws;

return await Deployment.RunAsync(() =>
{
    var myDemoAPI = new Aws.ApiGateway.RestApi("MyDemoAPI", new()
    {
        Name = "MyDemoAPI",
        Description = "This is my API for demonstration purposes",
    });

    var lambdaPermission = new Aws.Lambda.Permission("lambda_permission", new()
    {
        StatementId = "AllowMyDemoAPIInvoke",
        Action = "lambda:InvokeFunction",
        Function = "MyDemoFunction",
        Principal = "apigateway.amazonaws.com",
        SourceArn = myDemoAPI.ExecutionArn.Apply(executionArn => $"{executionArn}/*"),
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.apigateway.RestApi;
import com.pulumi.aws.apigateway.RestApiArgs;
import com.pulumi.aws.lambda.Permission;
import com.pulumi.aws.lambda.PermissionArgs;
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
        var myDemoAPI = new RestApi("myDemoAPI", RestApiArgs.builder()
            .name("MyDemoAPI")
            .description("This is my API for demonstration purposes")
            .build());

        var lambdaPermission = new Permission("lambdaPermission", PermissionArgs.builder()
            .statementId("AllowMyDemoAPIInvoke")
            .action("lambda:InvokeFunction")
            .function("MyDemoFunction")
            .principal("apigateway.amazonaws.com")
            .sourceArn(myDemoAPI.executionArn().applyValue(_executionArn -> String.format("%s/*", _executionArn)))
            .build());

    }
}
```

```yaml
resources:
  myDemoAPI:
    type: aws:apigateway:RestApi
    name: MyDemoAPI
    properties:
      name: MyDemoAPI
      description: This is my API for demonstration purposes
  lambdaPermission:
    type: aws:lambda:Permission
    name: lambda_permission
    properties:
      statementId: AllowMyDemoAPIInvoke
      action: lambda:InvokeFunction
      function: MyDemoFunction
      principal: apigateway.amazonaws.com
      sourceArn: ${myDemoAPI.executionArn}/*
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_apigateway_restapi" "MyDemoAPI" {
  name        = "MyDemoAPI"
  description = "This is my API for demonstration purposes"
}
resource "aws_lambda_permission" "lambda_permission" {
  statement_id = "AllowMyDemoAPIInvoke"
  action       = "lambda:InvokeFunction"
  function     = "MyDemoFunction"
  principal    = "apigateway.amazonaws.com"
  source_arn   ="${aws_apigateway_restapi.MyDemoAPI.execution_arn}/*"
}
```

### CloudWatch Log Group Integration[](#cloudwatch-log-group-integration)

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const _default = new aws.cloudwatch.LogGroup("default", {name: "/default"});
const assumeRole = aws.iam.getPolicyDocument({
    statements: [{
        effect: "Allow",
        principals: [{
            type: "Service",
            identifiers: ["lambda.amazonaws.com"],
        }],
        actions: ["sts:AssumeRole"],
    }],
});
const defaultRole = new aws.iam.Role("default", {
    name: "iam_for_lambda_called_from_cloudwatch_logs",
    assumeRolePolicy: assumeRole.then(assumeRole => assumeRole.json),
});
const loggingFunction = new aws.lambda.Function("logging", {
    code: new pulumi.asset.FileArchive("lamba_logging.zip"),
    name: "lambda_called_from_cloudwatch_logs",
    handler: "exports.handler",
    role: defaultRole.arn,
    runtime: aws.lambda.Runtime.Python3d12,
});
const logging = new aws.lambda.Permission("logging", {
    action: "lambda:InvokeFunction",
    "function": loggingFunction.name,
    principal: "logs.eu-west-1.amazonaws.com",
    sourceArn: pulumi.interpolate`${_default.arn}:*`,
});
const loggingLogSubscriptionFilter = new aws.cloudwatch.LogSubscriptionFilter("logging", {
    destinationArn: loggingFunction.arn,
    filterPattern: "",
    logGroup: _default.name,
    name: "logging_default",
}, {
    dependsOn: [logging],
});
```

```python
import pulumi
import pulumi_aws as aws

default = aws.cloudwatch.LogGroup("default", name="/default")
assume_role = aws.iam.get_policy_document(statements=[{
    "effect": "Allow",
    "principals": [{
        "type": "Service",
        "identifiers": ["lambda.amazonaws.com"],
    }],
    "actions": ["sts:AssumeRole"],
}])
default_role = aws.iam.Role("default",
    name="iam_for_lambda_called_from_cloudwatch_logs",
    assume_role_policy=assume_role.json)
logging_function = aws.lambda_.Function("logging",
    code=pulumi.FileArchive("lamba_logging.zip"),
    name="lambda_called_from_cloudwatch_logs",
    handler="exports.handler",
    role=default_role.arn,
    runtime=aws.lambda_.Runtime.PYTHON3D12)
logging = aws.lambda_.Permission("logging",
    action="lambda:InvokeFunction",
    function=logging_function.name,
    principal="logs.eu-west-1.amazonaws.com",
    source_arn=default.arn.apply(lambda arn: f"{arn}:*"))
logging_log_subscription_filter = aws.cloudwatch.LogSubscriptionFilter("logging",
    destination_arn=logging_function.arn,
    filter_pattern="",
    log_group=default.name,
    name="logging_default",
    opts = pulumi.ResourceOptions(depends_on=[logging]))
```

```go
package main

import (
	"fmt"

	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/cloudwatch"
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/iam"
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/lambda"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		_default, err := cloudwatch.NewLogGroup(ctx, "default", &cloudwatch.LogGroupArgs{
			Name: pulumi.String("/default"),
		})
		if err != nil {
			return err
		}
		assumeRole, err := iam.GetPolicyDocument(ctx, &iam.GetPolicyDocumentArgs{
			Statements: []iam.GetPolicyDocumentStatement{
				{
					Effect: pulumi.StringRef("Allow"),
					Principals: []iam.GetPolicyDocumentStatementPrincipal{
						{
							Type: "Service",
							Identifiers: []string{
								"lambda.amazonaws.com",
							},
						},
					},
					Actions: []string{
						"sts:AssumeRole",
					},
				},
			},
		}, nil)
		if err != nil {
			return err
		}
		defaultRole, err := iam.NewRole(ctx, "default", &iam.RoleArgs{
			Name:             pulumi.String("iam_for_lambda_called_from_cloudwatch_logs"),
			AssumeRolePolicy: pulumi.String(pulumi.String(assumeRole.Json)),
		})
		if err != nil {
			return err
		}
		loggingFunction, err := lambda.NewFunction(ctx, "logging", &lambda.FunctionArgs{
			Code:    pulumi.NewFileArchive("lamba_logging.zip"),
			Name:    pulumi.String("lambda_called_from_cloudwatch_logs"),
			Handler: pulumi.String("exports.handler"),
			Role:    defaultRole.Arn,
			Runtime: pulumi.String(lambda.RuntimePython3d12),
		})
		if err != nil {
			return err
		}
		logging, err := lambda.NewPermission(ctx, "logging", &lambda.PermissionArgs{
			Action:    pulumi.String("lambda:InvokeFunction"),
			Function:  loggingFunction.Name,
			Principal: pulumi.String("logs.eu-west-1.amazonaws.com"),
			SourceArn: _default.Arn.ApplyT(func(arn string) (string, error) {
				return fmt.Sprintf("%v:*", arn), nil
			}).(pulumi.StringOutput),
		})
		if err != nil {
			return err
		}
		_, err = cloudwatch.NewLogSubscriptionFilter(ctx, "logging", &cloudwatch.LogSubscriptionFilterArgs{
			DestinationArn: loggingFunction.Arn,
			FilterPattern:  pulumi.String(""),
			LogGroup:       _default.Name,
			Name:           pulumi.String("logging_default"),
		}, pulumi.DependsOn([]pulumi.Resource{
			logging,
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
    var @default = new Aws.CloudWatch.LogGroup("default", new()
    {
        Name = "/default",
    });

    var assumeRole = Aws.Iam.GetPolicyDocument.Invoke(new()
    {
        Statements = new[]
        {
            new Aws.Iam.Inputs.GetPolicyDocumentStatementInputArgs
            {
                Effect = "Allow",
                Principals = new[]
                {
                    new Aws.Iam.Inputs.GetPolicyDocumentStatementPrincipalInputArgs
                    {
                        Type = "Service",
                        Identifiers = new[]
                        {
                            "lambda.amazonaws.com",
                        },
                    },
                },
                Actions = new[]
                {
                    "sts:AssumeRole",
                },
            },
        },
    });

    var defaultRole = new Aws.Iam.Role("default", new()
    {
        Name = "iam_for_lambda_called_from_cloudwatch_logs",
        AssumeRolePolicy = assumeRole.Apply(getPolicyDocumentResult => getPolicyDocumentResult.Json),
    });

    var loggingFunction = new Aws.Lambda.Function("logging", new()
    {
        Code = new FileArchive("lamba_logging.zip"),
        Name = "lambda_called_from_cloudwatch_logs",
        Handler = "exports.handler",
        Role = defaultRole.Arn,
        Runtime = Aws.Lambda.Runtime.Python3d12,
    });

    var logging = new Aws.Lambda.Permission("logging", new()
    {
        Action = "lambda:InvokeFunction",
        Function = loggingFunction.Name,
        Principal = "logs.eu-west-1.amazonaws.com",
        SourceArn = @default.Arn.Apply(arn => $"{arn}:*"),
    });

    var loggingLogSubscriptionFilter = new Aws.CloudWatch.LogSubscriptionFilter("logging", new()
    {
        DestinationArn = loggingFunction.Arn,
        FilterPattern = "",
        LogGroup = @default.Name,
        Name = "logging_default",
    }, new CustomResourceOptions
    {
        DependsOn =
        {
            logging,
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
import com.pulumi.aws.iam.IamFunctions;
import com.pulumi.aws.iam.inputs.GetPolicyDocumentArgs;
import com.pulumi.aws.iam.Role;
import com.pulumi.aws.iam.RoleArgs;
import com.pulumi.aws.lambda.Function;
import com.pulumi.aws.lambda.FunctionArgs;
import com.pulumi.aws.lambda.Permission;
import com.pulumi.aws.lambda.PermissionArgs;
import com.pulumi.aws.cloudwatch.LogSubscriptionFilter;
import com.pulumi.aws.cloudwatch.LogSubscriptionFilterArgs;
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
        var default_ = new LogGroup("default", LogGroupArgs.builder()
            .name("/default")
            .build());

        final var assumeRole = IamFunctions.getPolicyDocument(GetPolicyDocumentArgs.builder()
            .statements(GetPolicyDocumentStatementArgs.builder()
                .effect("Allow")
                .principals(GetPolicyDocumentStatementPrincipalArgs.builder()
                    .type("Service")
                    .identifiers("lambda.amazonaws.com")
                    .build())
                .actions("sts:AssumeRole")
                .build())
            .build());

        var defaultRole = new Role("defaultRole", RoleArgs.builder()
            .name("iam_for_lambda_called_from_cloudwatch_logs")
            .assumeRolePolicy(assumeRole.json())
            .build());

        var loggingFunction = new Function("loggingFunction", FunctionArgs.builder()
            .code(new FileArchive("lamba_logging.zip"))
            .name("lambda_called_from_cloudwatch_logs")
            .handler("exports.handler")
            .role(defaultRole.arn())
            .runtime("python3.12")
            .build());

        var logging = new Permission("logging", PermissionArgs.builder()
            .action("lambda:InvokeFunction")
            .function(loggingFunction.name())
            .principal("logs.eu-west-1.amazonaws.com")
            .sourceArn(default_.arn().applyValue(_arn -> String.format("%s:*", _arn)))
            .build());

        var loggingLogSubscriptionFilter = new LogSubscriptionFilter("loggingLogSubscriptionFilter", LogSubscriptionFilterArgs.builder()
            .destinationArn(loggingFunction.arn())
            .filterPattern("")
            .logGroup(default_.name())
            .name("logging_default")
            .build(), CustomResourceOptions.builder()
                .dependsOn(logging)
                .build());

    }
}
```

```yaml
resources:
  logging:
    type: aws:lambda:Permission
    properties:
      action: lambda:InvokeFunction
      function: ${loggingFunction.name}
      principal: logs.eu-west-1.amazonaws.com
      sourceArn: ${default.arn}:*
  default:
    type: aws:cloudwatch:LogGroup
    properties:
      name: /default
  loggingLogSubscriptionFilter:
    type: aws:cloudwatch:LogSubscriptionFilter
    name: logging
    properties:
      destinationArn: ${loggingFunction.arn}
      filterPattern: ""
      logGroup: ${default.name}
      name: logging_default
    options:
      dependsOn:
        - ${logging}
  loggingFunction:
    type: aws:lambda:Function
    name: logging
    properties:
      code:
        fn::fileArchive: lamba_logging.zip
      name: lambda_called_from_cloudwatch_logs
      handler: exports.handler
      role: ${defaultRole.arn}
      runtime: python3.12
  defaultRole:
    type: aws:iam:Role
    name: default
    properties:
      name: iam_for_lambda_called_from_cloudwatch_logs
      assumeRolePolicy: ${assumeRole.json}
variables:
  assumeRole:
    fn::invoke:
      function: aws:iam:getPolicyDocument
      arguments:
        statements:
          - effect: Allow
            principals:
              - type: Service
                identifiers:
                  - lambda.amazonaws.com
            actions:
              - sts:AssumeRole
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

data "aws_iam_getpolicydocument" "assumeRole" {
  statements {
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
    actions = ["sts:AssumeRole"]
  }
}

resource "aws_lambda_permission" "logging" {
  action     = "lambda:InvokeFunction"
  function   = aws_lambda_function.logging.name
  principal  = "logs.eu-west-1.amazonaws.com"
  source_arn ="${aws_cloudwatch_loggroup.default.arn}:*"
}
resource "aws_cloudwatch_loggroup" "default" {
  name = "/default"
}
resource "aws_cloudwatch_logsubscriptionfilter" "logging" {
  depends_on      = [aws_lambda_permission.logging]
  destination_arn = aws_lambda_function.logging.arn
  filter_pattern  = ""
  log_group       = aws_cloudwatch_loggroup.default.name
  name            = "logging_default"
}
resource "aws_lambda_function" "logging" {
  code    = fileArchive("lamba_logging.zip")
  name    = "lambda_called_from_cloudwatch_logs"
  handler = "exports.handler"
  role    = aws_iam_role.default.arn
  runtime = "python3.12"
}
resource "aws_iam_role" "default" {
  name               = "iam_for_lambda_called_from_cloudwatch_logs"
  assume_role_policy = data.aws_iam_getpolicydocument.assumeRole.json
}
```

### Cross-Account Function URL Access[](#cross-account-function-url-access)

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const url = new aws.lambda.FunctionUrl("url", {
    functionName: example.functionName,
    authorizationType: "AWS_IAM",
});
const urlPermission = new aws.lambda.Permission("url", {
    action: "lambda:InvokeFunctionUrl",
    "function": example.functionName,
    principal: "arn:aws:iam::444455556666:role/example",
    sourceAccount: "444455556666",
    functionUrlAuthType: "AWS_IAM",
});
```

```python
import pulumi
import pulumi_aws as aws

url = aws.lambda_.FunctionUrl("url",
    function_name=example["functionName"],
    authorization_type="AWS_IAM")
url_permission = aws.lambda_.Permission("url",
    action="lambda:InvokeFunctionUrl",
    function=example["functionName"],
    principal="arn:aws:iam::444455556666:role/example",
    source_account="444455556666",
    function_url_auth_type="AWS_IAM")
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/lambda"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		_, err := lambda.NewFunctionUrl(ctx, "url", &lambda.FunctionUrlArgs{
			FunctionName:      pulumi.Any(example.FunctionName),
			AuthorizationType: pulumi.String("AWS_IAM"),
		})
		if err != nil {
			return err
		}
		_, err = lambda.NewPermission(ctx, "url", &lambda.PermissionArgs{
			Action:              pulumi.String("lambda:InvokeFunctionUrl"),
			Function:            pulumi.Any(example.FunctionName),
			Principal:           pulumi.String("arn:aws:iam::444455556666:role/example"),
			SourceAccount:       pulumi.String("444455556666"),
			FunctionUrlAuthType: pulumi.String("AWS_IAM"),
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
    var url = new Aws.Lambda.FunctionUrl("url", new()
    {
        FunctionName = example.FunctionName,
        AuthorizationType = "AWS_IAM",
    });

    var urlPermission = new Aws.Lambda.Permission("url", new()
    {
        Action = "lambda:InvokeFunctionUrl",
        Function = example.FunctionName,
        Principal = "arn:aws:iam::444455556666:role/example",
        SourceAccount = "444455556666",
        FunctionUrlAuthType = "AWS_IAM",
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.lambda.FunctionUrl;
import com.pulumi.aws.lambda.FunctionUrlArgs;
import com.pulumi.aws.lambda.Permission;
import com.pulumi.aws.lambda.PermissionArgs;
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
        var url = new FunctionUrl("url", FunctionUrlArgs.builder()
            .functionName(example.functionName())
            .authorizationType("AWS_IAM")
            .build());

        var urlPermission = new Permission("urlPermission", PermissionArgs.builder()
            .action("lambda:InvokeFunctionUrl")
            .function(example.functionName())
            .principal("arn:aws:iam::444455556666:role/example")
            .sourceAccount("444455556666")
            .functionUrlAuthType("AWS_IAM")
            .build());

    }
}
```

```yaml
resources:
  url:
    type: aws:lambda:FunctionUrl
    properties:
      functionName: ${example.functionName}
      authorizationType: AWS_IAM
  urlPermission:
    type: aws:lambda:Permission
    name: url
    properties:
      action: lambda:InvokeFunctionUrl
      function: ${example.functionName}
      principal: arn:aws:iam::444455556666:role/example
      sourceAccount: '444455556666'
      functionUrlAuthType: AWS_IAM
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_lambda_functionurl" "url" {
  function_name      = example.functionName
  authorization_type = "AWS_IAM"
}
resource "aws_lambda_permission" "url" {
  action                 = "lambda:InvokeFunctionUrl"
  function               = example.functionName
  principal              = "arn:aws:iam::444455556666:role/example"
  source_account         = "444455556666"
  function_url_auth_type = "AWS_IAM"
}
```

#### Optional[](#optional)

-   `accountId` (String) AWS Account where this resource is managed.
-   `qualifier` (String) Qualifier for the function version or alias.
-   `region` (String) Region where this resource is managed.

Using `qualifier`:

For backwards compatibility, the following legacy `pulumi import` commands are also supported:

```bash
$ pulumi import aws:lambda/permission:Permission example my_test_lambda_function/AllowExecutionFromCloudWatch
$ pulumi import aws:lambda/permission:Permission example my_test_lambda_function:qualifier_name/AllowExecutionFromCloudWatch
```

## Create Permission Resource[](#create)

Resources are created with functions called constructors. To learn more about declaring and configuring resources, see [Resources](/docs/concepts/resources/).

### Constructor syntax[](#constructor-syntax)

```typescript
new Permission(name: string, args: PermissionArgs, opts?: CustomResourceOptions);
```

```python
@overload
def Permission(resource_name: str,
               args: PermissionArgs,
               opts: Optional[ResourceOptions] = None)

@overload
def Permission(resource_name: str,
               opts: Optional[ResourceOptions] = None,
               principal: Optional[str] = None,
               action: Optional[str] = None,
               function: Optional[str] = None,
               principal_org_id: Optional[str] = None,
               invoked_via_function_url: Optional[bool] = None,
               function_url_auth_type: Optional[str] = None,
               event_source_token: Optional[str] = None,
               qualifier: Optional[str] = None,
               region: Optional[str] = None,
               source_account: Optional[str] = None,
               source_arn: Optional[str] = None,
               statement_id: Optional[str] = None,
               statement_id_prefix: Optional[str] = None)
```

```go
func NewPermission(ctx *Context, name string, args PermissionArgs, opts ...ResourceOption) (*Permission, error)
```

```csharp
public Permission(string name, PermissionArgs args, CustomResourceOptions? opts = null)
```

```java
public Permission(String name, PermissionArgs args)
public Permission(String name, PermissionArgs args, CustomResourceOptions options)
```

```yaml
type: aws:lambda:Permission
properties: # The arguments to resource properties.
options: # Bag of options to control resource's behavior.
```

```hcl
resource "aws_lambda_permission" "name" {
    # resource properties
}
```

#### Parameters[](#parameters)

name This property is required. string

The unique name of the resource.

args This property is required. [PermissionArgs](#inputs)

The arguments to resource properties.

opts [CustomResourceOptions](/docs/reference/pkg/nodejs/pulumi/pulumi/#CustomResourceOptions)

Bag of options to control resource's behavior.

resource\_name This property is required. str

The unique name of the resource.

args This property is required. [PermissionArgs](#inputs)

The arguments to resource properties.

opts [ResourceOptions](/docs/reference/pkg/python/pulumi/#pulumi.ResourceOptions)

Bag of options to control resource's behavior.

ctx [Context](https://pkg.go.dev/github.com/pulumi/pulumi/sdk/v3/go/pulumi?tab=doc#Context)

Context object for the current deployment.

name This property is required. string

The unique name of the resource.

args This property is required. [PermissionArgs](#inputs)

The arguments to resource properties.

opts [ResourceOption](https://pkg.go.dev/github.com/pulumi/pulumi/sdk/v3/go/pulumi?tab=doc#ResourceOption)

Bag of options to control resource's behavior.

name This property is required. string

The unique name of the resource.

args This property is required. [PermissionArgs](#inputs)

The arguments to resource properties.

opts [CustomResourceOptions](/docs/reference/pkg/dotnet/Pulumi/Pulumi.CustomResourceOptions.html)

Bag of options to control resource's behavior.

name This property is required. String

The unique name of the resource.

args This property is required. [PermissionArgs](#inputs)

The arguments to resource properties.

options CustomResourceOptions

Bag of options to control resource's behavior.

### Constructor example[](#constructor-example)

The following reference example uses placeholder values for all [input properties](#inputs).

```csharp
var awsPermissionResource = new Aws.Lambda.Permission("awsPermissionResource", new()
{
    Principal = "string",
    Action = "string",
    Function = "string",
    PrincipalOrgId = "string",
    InvokedViaFunctionUrl = false,
    FunctionUrlAuthType = "string",
    EventSourceToken = "string",
    Qualifier = "string",
    Region = "string",
    SourceAccount = "string",
    SourceArn = "string",
    StatementId = "string",
    StatementIdPrefix = "string",
});
```

```go
example, err := lambda.NewPermission(ctx, "awsPermissionResource", &lambda.PermissionArgs{
	Principal:             pulumi.String("string"),
	Action:                pulumi.String("string"),
	Function:              pulumi.Any("string"),
	PrincipalOrgId:        pulumi.String("string"),
	InvokedViaFunctionUrl: pulumi.Bool(false),
	FunctionUrlAuthType:   pulumi.String("string"),
	EventSourceToken:      pulumi.String("string"),
	Qualifier:             pulumi.String("string"),
	Region:                pulumi.String("string"),
	SourceAccount:         pulumi.String("string"),
	SourceArn:             pulumi.String("string"),
	StatementId:           pulumi.String("string"),
	StatementIdPrefix:     pulumi.String("string"),
})
```

```hcl
resource "aws_lambda_permission" "awsPermissionResource" {
  principal                = "string"
  action                   = "string"
  function                 = "string"
  principal_org_id         = "string"
  invoked_via_function_url = false
  function_url_auth_type   = "string"
  event_source_token       = "string"
  qualifier                = "string"
  region                   = "string"
  source_account           = "string"
  source_arn               = "string"
  statement_id             = "string"
  statement_id_prefix      = "string"
}
```

```java
var awsPermissionResource = new com.pulumi.aws.lambda.Permission("awsPermissionResource", com.pulumi.aws.lambda.PermissionArgs.builder()
    .principal("string")
    .action("string")
    .function("string")
    .principalOrgId("string")
    .invokedViaFunctionUrl(false)
    .functionUrlAuthType("string")
    .eventSourceToken("string")
    .qualifier("string")
    .region("string")
    .sourceAccount("string")
    .sourceArn("string")
    .statementId("string")
    .statementIdPrefix("string")
    .build());
```

```python
aws_permission_resource = aws.lambda_.Permission("awsPermissionResource",
    principal="string",
    action="string",
    function="string",
    principal_org_id="string",
    invoked_via_function_url=False,
    function_url_auth_type="string",
    event_source_token="string",
    qualifier="string",
    region="string",
    source_account="string",
    source_arn="string",
    statement_id="string",
    statement_id_prefix="string")
```

```typescript
const awsPermissionResource = new aws.lambda.Permission("awsPermissionResource", {
    principal: "string",
    action: "string",
    "function": "string",
    principalOrgId: "string",
    invokedViaFunctionUrl: false,
    functionUrlAuthType: "string",
    eventSourceToken: "string",
    qualifier: "string",
    region: "string",
    sourceAccount: "string",
    sourceArn: "string",
    statementId: "string",
    statementIdPrefix: "string",
});
```

```yaml
type: aws:lambda:Permission
properties:
    action: string
    eventSourceToken: string
    function: string
    functionUrlAuthType: string
    invokedViaFunctionUrl: false
    principal: string
    principalOrgId: string
    qualifier: string
    region: string
    sourceAccount: string
    sourceArn: string
    statementId: string
    statementIdPrefix: string
```

## Permission Resource Properties[](#properties)

To learn more about resource properties and how to use them, see [Inputs and Outputs](/docs/intro/concepts/inputs-outputs) in the Architecture and Concepts docs.

### Inputs[](#inputs)

In Python, inputs that are objects can be passed either as [argument classes or as dictionary literals](/docs/languages-sdks/python/#inputs-and-outputs).

The Permission resource accepts the following [input](/docs/intro/concepts/inputs-outputs) properties:

[Action](#action_csharp)

This property is required.

 ![](/icons/replacement-property.svg) Changes to this property will trigger replacement.

string

Lambda action to allow in this statement (e.g., `lambda:InvokeFunction`)

[Function](#function_csharp)

This property is required.

 ![](/icons/replacement-property.svg) Changes to this property will trigger replacement.

string | string

Name or ARN of the Lambda function

[Principal](#principal_csharp)

This property is required.

 ![](/icons/replacement-property.svg) Changes to this property will trigger replacement.

string

AWS service or account that invokes the function (e.g., `s3.amazonaws.com`, `sns.amazonaws.com`, AWS account ID, or AWS IAM principal)

The following arguments are optional:

[EventSourceToken](#eventsourcetoken_csharp) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

Event Source Token for Alexa Skills

[FunctionUrlAuthType](#functionurlauthtype_csharp) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

Lambda Function URL authentication type. Valid values: `AWS_IAM` or `NONE`. Only valid with `lambda:InvokeFunctionUrl` action

[InvokedViaFunctionUrl](#invokedviafunctionurl_csharp) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. bool

Lambda Function URL invoke permission. Only valid with `lambda:InvokeFunction` action

[PrincipalOrgId](#principalorgid_csharp) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

AWS Organizations ID to grant permission to all accounts under this organization

[Qualifier](#qualifier_csharp) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

Lambda function version or alias name

[Region](#region_csharp) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration

[SourceAccount](#sourceaccount_csharp) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

AWS account ID of the source owner for cross-account access, S3, or SES

[SourceArn](#sourcearn_csharp) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

ARN of the source resource granting permission to invoke the Lambda function

[StatementId](#statementid_csharp) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

Statement identifier. Generated by Pulumi if not provided

[StatementIdPrefix](#statementidprefix_csharp) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

Statement identifier prefix. Conflicts with `statementId`

[Action](#action_go)

This property is required.

 ![](/icons/replacement-property.svg) Changes to this property will trigger replacement.

string

Lambda action to allow in this statement (e.g., `lambda:InvokeFunction`)

[Function](#function_go)

This property is required.

 ![](/icons/replacement-property.svg) Changes to this property will trigger replacement.

string | string

Name or ARN of the Lambda function

[Principal](#principal_go)

This property is required.

 ![](/icons/replacement-property.svg) Changes to this property will trigger replacement.

string

AWS service or account that invokes the function (e.g., `s3.amazonaws.com`, `sns.amazonaws.com`, AWS account ID, or AWS IAM principal)

The following arguments are optional:

[EventSourceToken](#eventsourcetoken_go) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

Event Source Token for Alexa Skills

[FunctionUrlAuthType](#functionurlauthtype_go) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

Lambda Function URL authentication type. Valid values: `AWS_IAM` or `NONE`. Only valid with `lambda:InvokeFunctionUrl` action

[InvokedViaFunctionUrl](#invokedviafunctionurl_go) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. bool

Lambda Function URL invoke permission. Only valid with `lambda:InvokeFunction` action

[PrincipalOrgId](#principalorgid_go) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

AWS Organizations ID to grant permission to all accounts under this organization

[Qualifier](#qualifier_go) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

Lambda function version or alias name

[Region](#region_go) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration

[SourceAccount](#sourceaccount_go) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

AWS account ID of the source owner for cross-account access, S3, or SES

[SourceArn](#sourcearn_go) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

ARN of the source resource granting permission to invoke the Lambda function

[StatementId](#statementid_go) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

Statement identifier. Generated by Pulumi if not provided

[StatementIdPrefix](#statementidprefix_go) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

Statement identifier prefix. Conflicts with `statementId`

[action](#action_hcl)

This property is required.

 ![](/icons/replacement-property.svg) Changes to this property will trigger replacement.

string

Lambda action to allow in this statement (e.g., `lambda:InvokeFunction`)

[function](#function_hcl)

This property is required.

 ![](/icons/replacement-property.svg) Changes to this property will trigger replacement.

string |

Name or ARN of the Lambda function

[principal](#principal_hcl)

This property is required.

 ![](/icons/replacement-property.svg) Changes to this property will trigger replacement.

string

AWS service or account that invokes the function (e.g., `s3.amazonaws.com`, `sns.amazonaws.com`, AWS account ID, or AWS IAM principal)

The following arguments are optional:

[event\_source\_token](#event_source_token_hcl) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

Event Source Token for Alexa Skills

[function\_url\_auth\_type](#function_url_auth_type_hcl) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

Lambda Function URL authentication type. Valid values: `AWS_IAM` or `NONE`. Only valid with `lambda:InvokeFunctionUrl` action

[invoked\_via\_function\_url](#invoked_via_function_url_hcl) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. bool

Lambda Function URL invoke permission. Only valid with `lambda:InvokeFunction` action

[principal\_org\_id](#principal_org_id_hcl) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

AWS Organizations ID to grant permission to all accounts under this organization

[qualifier](#qualifier_hcl) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

Lambda function version or alias name

[region](#region_hcl) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration

[source\_account](#source_account_hcl) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

AWS account ID of the source owner for cross-account access, S3, or SES

[source\_arn](#source_arn_hcl) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

ARN of the source resource granting permission to invoke the Lambda function

[statement\_id](#statement_id_hcl) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

Statement identifier. Generated by Pulumi if not provided

[statement\_id\_prefix](#statement_id_prefix_hcl) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

Statement identifier prefix. Conflicts with `statementId`

[action](#action_java)

This property is required.

 ![](/icons/replacement-property.svg) Changes to this property will trigger replacement.

String

Lambda action to allow in this statement (e.g., `lambda:InvokeFunction`)

[function](#function_java)

This property is required.

 ![](/icons/replacement-property.svg) Changes to this property will trigger replacement.

String | String

Name or ARN of the Lambda function

[principal](#principal_java)

This property is required.

 ![](/icons/replacement-property.svg) Changes to this property will trigger replacement.

String

AWS service or account that invokes the function (e.g., `s3.amazonaws.com`, `sns.amazonaws.com`, AWS account ID, or AWS IAM principal)

The following arguments are optional:

[eventSourceToken](#eventsourcetoken_java) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. String

Event Source Token for Alexa Skills

[functionUrlAuthType](#functionurlauthtype_java) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. String

Lambda Function URL authentication type. Valid values: `AWS_IAM` or `NONE`. Only valid with `lambda:InvokeFunctionUrl` action

[invokedViaFunctionUrl](#invokedviafunctionurl_java) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. Boolean

Lambda Function URL invoke permission. Only valid with `lambda:InvokeFunction` action

[principalOrgId](#principalorgid_java) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. String

AWS Organizations ID to grant permission to all accounts under this organization

[qualifier](#qualifier_java) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. String

Lambda function version or alias name

[region](#region_java) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration

[sourceAccount](#sourceaccount_java) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. String

AWS account ID of the source owner for cross-account access, S3, or SES

[sourceArn](#sourcearn_java) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. String

ARN of the source resource granting permission to invoke the Lambda function

[statementId](#statementid_java) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. String

Statement identifier. Generated by Pulumi if not provided

[statementIdPrefix](#statementidprefix_java) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. String

Statement identifier prefix. Conflicts with `statementId`

[action](#action_nodejs)

This property is required.

 ![](/icons/replacement-property.svg) Changes to this property will trigger replacement.

string

Lambda action to allow in this statement (e.g., `lambda:InvokeFunction`)

[function](#function_nodejs)

This property is required.

 ![](/icons/replacement-property.svg) Changes to this property will trigger replacement.

string | Function

Name or ARN of the Lambda function

[principal](#principal_nodejs)

This property is required.

 ![](/icons/replacement-property.svg) Changes to this property will trigger replacement.

string

AWS service or account that invokes the function (e.g., `s3.amazonaws.com`, `sns.amazonaws.com`, AWS account ID, or AWS IAM principal)

The following arguments are optional:

[eventSourceToken](#eventsourcetoken_nodejs) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

Event Source Token for Alexa Skills

[functionUrlAuthType](#functionurlauthtype_nodejs) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

Lambda Function URL authentication type. Valid values: `AWS_IAM` or `NONE`. Only valid with `lambda:InvokeFunctionUrl` action

[invokedViaFunctionUrl](#invokedviafunctionurl_nodejs) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. boolean

Lambda Function URL invoke permission. Only valid with `lambda:InvokeFunction` action

[principalOrgId](#principalorgid_nodejs) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

AWS Organizations ID to grant permission to all accounts under this organization

[qualifier](#qualifier_nodejs) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

Lambda function version or alias name

[region](#region_nodejs) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration

[sourceAccount](#sourceaccount_nodejs) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

AWS account ID of the source owner for cross-account access, S3, or SES

[sourceArn](#sourcearn_nodejs) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

ARN of the source resource granting permission to invoke the Lambda function

[statementId](#statementid_nodejs) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

Statement identifier. Generated by Pulumi if not provided

[statementIdPrefix](#statementidprefix_nodejs) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

Statement identifier prefix. Conflicts with `statementId`

[action](#action_python)

This property is required.

 ![](/icons/replacement-property.svg) Changes to this property will trigger replacement.

str

Lambda action to allow in this statement (e.g., `lambda:InvokeFunction`)

[function](#function_python)

This property is required.

 ![](/icons/replacement-property.svg) Changes to this property will trigger replacement.

str | str

Name or ARN of the Lambda function

[principal](#principal_python)

This property is required.

 ![](/icons/replacement-property.svg) Changes to this property will trigger replacement.

str

AWS service or account that invokes the function (e.g., `s3.amazonaws.com`, `sns.amazonaws.com`, AWS account ID, or AWS IAM principal)

The following arguments are optional:

[event\_source\_token](#event_source_token_python) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. str

Event Source Token for Alexa Skills

[function\_url\_auth\_type](#function_url_auth_type_python) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. str

Lambda Function URL authentication type. Valid values: `AWS_IAM` or `NONE`. Only valid with `lambda:InvokeFunctionUrl` action

[invoked\_via\_function\_url](#invoked_via_function_url_python) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. bool

Lambda Function URL invoke permission. Only valid with `lambda:InvokeFunction` action

[principal\_org\_id](#principal_org_id_python) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. str

AWS Organizations ID to grant permission to all accounts under this organization

[qualifier](#qualifier_python) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. str

Lambda function version or alias name

[region](#region_python) str

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration

[source\_account](#source_account_python) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. str

AWS account ID of the source owner for cross-account access, S3, or SES

[source\_arn](#source_arn_python) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. str

ARN of the source resource granting permission to invoke the Lambda function

[statement\_id](#statement_id_python) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. str

Statement identifier. Generated by Pulumi if not provided

[statement\_id\_prefix](#statement_id_prefix_python) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. str

Statement identifier prefix. Conflicts with `statementId`

[action](#action_yaml)

This property is required.

 ![](/icons/replacement-property.svg) Changes to this property will trigger replacement.

String

Lambda action to allow in this statement (e.g., `lambda:InvokeFunction`)

[function](#function_yaml)

This property is required.

 ![](/icons/replacement-property.svg) Changes to this property will trigger replacement.

String |

Name or ARN of the Lambda function

[principal](#principal_yaml)

This property is required.

 ![](/icons/replacement-property.svg) Changes to this property will trigger replacement.

String

AWS service or account that invokes the function (e.g., `s3.amazonaws.com`, `sns.amazonaws.com`, AWS account ID, or AWS IAM principal)

The following arguments are optional:

[eventSourceToken](#eventsourcetoken_yaml) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. String

Event Source Token for Alexa Skills

[functionUrlAuthType](#functionurlauthtype_yaml) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. String

Lambda Function URL authentication type. Valid values: `AWS_IAM` or `NONE`. Only valid with `lambda:InvokeFunctionUrl` action

[invokedViaFunctionUrl](#invokedviafunctionurl_yaml) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. Boolean

Lambda Function URL invoke permission. Only valid with `lambda:InvokeFunction` action

[principalOrgId](#principalorgid_yaml) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. String

AWS Organizations ID to grant permission to all accounts under this organization

[qualifier](#qualifier_yaml) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. String

Lambda function version or alias name

[region](#region_yaml) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration

[sourceAccount](#sourceaccount_yaml) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. String

AWS account ID of the source owner for cross-account access, S3, or SES

[sourceArn](#sourcearn_yaml) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. String

ARN of the source resource granting permission to invoke the Lambda function

[statementId](#statementid_yaml) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. String

Statement identifier. Generated by Pulumi if not provided

[statementIdPrefix](#statementidprefix_yaml) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. String

Statement identifier prefix. Conflicts with `statementId`

### Outputs[](#outputs)

All [input](#inputs) properties are implicitly available as output properties. Additionally, the Permission resource produces the following output properties:

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

## Look up Existing Permission Resource[](#look-up)

Get an existing Permission resource’s state with the given name, ID, and optional extra properties used to qualify the lookup.

```typescript
public static get(name: string, id: Input<ID>, state?: PermissionState, opts?: CustomResourceOptions): Permission
```

```python
@staticmethod
def get(resource_name: str,
        id: str,
        opts: Optional[ResourceOptions] = None,
        action: Optional[str] = None,
        event_source_token: Optional[str] = None,
        function: Optional[str] = None,
        function_url_auth_type: Optional[str] = None,
        invoked_via_function_url: Optional[bool] = None,
        principal: Optional[str] = None,
        principal_org_id: Optional[str] = None,
        qualifier: Optional[str] = None,
        region: Optional[str] = None,
        source_account: Optional[str] = None,
        source_arn: Optional[str] = None,
        statement_id: Optional[str] = None,
        statement_id_prefix: Optional[str] = None) -> Permission
```

```go
func GetPermission(ctx *Context, name string, id IDInput, state *PermissionState, opts ...ResourceOption) (*Permission, error)
```

```csharp
public static Permission Get(string name, Input<string> id, PermissionState? state, CustomResourceOptions? opts = null)
```

```java
public static Permission get(String name, Output<String> id, PermissionState state, CustomResourceOptions options)
```

```yaml
resources:  _:    type: aws:lambda:Permission    get:      id: ${id}
```

```hcl
import {
  to = aws_lambda_permission.example
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

[Action](#state_action_csharp) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

Lambda action to allow in this statement (e.g., `lambda:InvokeFunction`)

[EventSourceToken](#state_eventsourcetoken_csharp) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

Event Source Token for Alexa Skills

[Function](#state_function_csharp) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string | string

Name or ARN of the Lambda function

[FunctionUrlAuthType](#state_functionurlauthtype_csharp) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

Lambda Function URL authentication type. Valid values: `AWS_IAM` or `NONE`. Only valid with `lambda:InvokeFunctionUrl` action

[InvokedViaFunctionUrl](#state_invokedviafunctionurl_csharp) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. bool

Lambda Function URL invoke permission. Only valid with `lambda:InvokeFunction` action

[Principal](#state_principal_csharp) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

AWS service or account that invokes the function (e.g., `s3.amazonaws.com`, `sns.amazonaws.com`, AWS account ID, or AWS IAM principal)

The following arguments are optional:

[PrincipalOrgId](#state_principalorgid_csharp) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

AWS Organizations ID to grant permission to all accounts under this organization

[Qualifier](#state_qualifier_csharp) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

Lambda function version or alias name

[Region](#state_region_csharp) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration

[SourceAccount](#state_sourceaccount_csharp) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

AWS account ID of the source owner for cross-account access, S3, or SES

[SourceArn](#state_sourcearn_csharp) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

ARN of the source resource granting permission to invoke the Lambda function

[StatementId](#state_statementid_csharp) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

Statement identifier. Generated by Pulumi if not provided

[StatementIdPrefix](#state_statementidprefix_csharp) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

Statement identifier prefix. Conflicts with `statementId`

[Action](#state_action_go) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

Lambda action to allow in this statement (e.g., `lambda:InvokeFunction`)

[EventSourceToken](#state_eventsourcetoken_go) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

Event Source Token for Alexa Skills

[Function](#state_function_go) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string | string

Name or ARN of the Lambda function

[FunctionUrlAuthType](#state_functionurlauthtype_go) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

Lambda Function URL authentication type. Valid values: `AWS_IAM` or `NONE`. Only valid with `lambda:InvokeFunctionUrl` action

[InvokedViaFunctionUrl](#state_invokedviafunctionurl_go) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. bool

Lambda Function URL invoke permission. Only valid with `lambda:InvokeFunction` action

[Principal](#state_principal_go) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

AWS service or account that invokes the function (e.g., `s3.amazonaws.com`, `sns.amazonaws.com`, AWS account ID, or AWS IAM principal)

The following arguments are optional:

[PrincipalOrgId](#state_principalorgid_go) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

AWS Organizations ID to grant permission to all accounts under this organization

[Qualifier](#state_qualifier_go) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

Lambda function version or alias name

[Region](#state_region_go) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration

[SourceAccount](#state_sourceaccount_go) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

AWS account ID of the source owner for cross-account access, S3, or SES

[SourceArn](#state_sourcearn_go) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

ARN of the source resource granting permission to invoke the Lambda function

[StatementId](#state_statementid_go) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

Statement identifier. Generated by Pulumi if not provided

[StatementIdPrefix](#state_statementidprefix_go) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

Statement identifier prefix. Conflicts with `statementId`

[action](#state_action_hcl) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

Lambda action to allow in this statement (e.g., `lambda:InvokeFunction`)

[event\_source\_token](#state_event_source_token_hcl) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

Event Source Token for Alexa Skills

[function](#state_function_hcl) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string |

Name or ARN of the Lambda function

[function\_url\_auth\_type](#state_function_url_auth_type_hcl) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

Lambda Function URL authentication type. Valid values: `AWS_IAM` or `NONE`. Only valid with `lambda:InvokeFunctionUrl` action

[invoked\_via\_function\_url](#state_invoked_via_function_url_hcl) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. bool

Lambda Function URL invoke permission. Only valid with `lambda:InvokeFunction` action

[principal](#state_principal_hcl) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

AWS service or account that invokes the function (e.g., `s3.amazonaws.com`, `sns.amazonaws.com`, AWS account ID, or AWS IAM principal)

The following arguments are optional:

[principal\_org\_id](#state_principal_org_id_hcl) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

AWS Organizations ID to grant permission to all accounts under this organization

[qualifier](#state_qualifier_hcl) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

Lambda function version or alias name

[region](#state_region_hcl) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration

[source\_account](#state_source_account_hcl) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

AWS account ID of the source owner for cross-account access, S3, or SES

[source\_arn](#state_source_arn_hcl) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

ARN of the source resource granting permission to invoke the Lambda function

[statement\_id](#state_statement_id_hcl) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

Statement identifier. Generated by Pulumi if not provided

[statement\_id\_prefix](#state_statement_id_prefix_hcl) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

Statement identifier prefix. Conflicts with `statementId`

[action](#state_action_java) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. String

Lambda action to allow in this statement (e.g., `lambda:InvokeFunction`)

[eventSourceToken](#state_eventsourcetoken_java) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. String

Event Source Token for Alexa Skills

[function](#state_function_java) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. String | String

Name or ARN of the Lambda function

[functionUrlAuthType](#state_functionurlauthtype_java) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. String

Lambda Function URL authentication type. Valid values: `AWS_IAM` or `NONE`. Only valid with `lambda:InvokeFunctionUrl` action

[invokedViaFunctionUrl](#state_invokedviafunctionurl_java) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. Boolean

Lambda Function URL invoke permission. Only valid with `lambda:InvokeFunction` action

[principal](#state_principal_java) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. String

AWS service or account that invokes the function (e.g., `s3.amazonaws.com`, `sns.amazonaws.com`, AWS account ID, or AWS IAM principal)

The following arguments are optional:

[principalOrgId](#state_principalorgid_java) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. String

AWS Organizations ID to grant permission to all accounts under this organization

[qualifier](#state_qualifier_java) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. String

Lambda function version or alias name

[region](#state_region_java) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration

[sourceAccount](#state_sourceaccount_java) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. String

AWS account ID of the source owner for cross-account access, S3, or SES

[sourceArn](#state_sourcearn_java) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. String

ARN of the source resource granting permission to invoke the Lambda function

[statementId](#state_statementid_java) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. String

Statement identifier. Generated by Pulumi if not provided

[statementIdPrefix](#state_statementidprefix_java) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. String

Statement identifier prefix. Conflicts with `statementId`

[action](#state_action_nodejs) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

Lambda action to allow in this statement (e.g., `lambda:InvokeFunction`)

[eventSourceToken](#state_eventsourcetoken_nodejs) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

Event Source Token for Alexa Skills

[function](#state_function_nodejs) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string | Function

Name or ARN of the Lambda function

[functionUrlAuthType](#state_functionurlauthtype_nodejs) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

Lambda Function URL authentication type. Valid values: `AWS_IAM` or `NONE`. Only valid with `lambda:InvokeFunctionUrl` action

[invokedViaFunctionUrl](#state_invokedviafunctionurl_nodejs) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. boolean

Lambda Function URL invoke permission. Only valid with `lambda:InvokeFunction` action

[principal](#state_principal_nodejs) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

AWS service or account that invokes the function (e.g., `s3.amazonaws.com`, `sns.amazonaws.com`, AWS account ID, or AWS IAM principal)

The following arguments are optional:

[principalOrgId](#state_principalorgid_nodejs) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

AWS Organizations ID to grant permission to all accounts under this organization

[qualifier](#state_qualifier_nodejs) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

Lambda function version or alias name

[region](#state_region_nodejs) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration

[sourceAccount](#state_sourceaccount_nodejs) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

AWS account ID of the source owner for cross-account access, S3, or SES

[sourceArn](#state_sourcearn_nodejs) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

ARN of the source resource granting permission to invoke the Lambda function

[statementId](#state_statementid_nodejs) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

Statement identifier. Generated by Pulumi if not provided

[statementIdPrefix](#state_statementidprefix_nodejs) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. string

Statement identifier prefix. Conflicts with `statementId`

[action](#state_action_python) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. str

Lambda action to allow in this statement (e.g., `lambda:InvokeFunction`)

[event\_source\_token](#state_event_source_token_python) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. str

Event Source Token for Alexa Skills

[function](#state_function_python) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. str | str

Name or ARN of the Lambda function

[function\_url\_auth\_type](#state_function_url_auth_type_python) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. str

Lambda Function URL authentication type. Valid values: `AWS_IAM` or `NONE`. Only valid with `lambda:InvokeFunctionUrl` action

[invoked\_via\_function\_url](#state_invoked_via_function_url_python) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. bool

Lambda Function URL invoke permission. Only valid with `lambda:InvokeFunction` action

[principal](#state_principal_python) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. str

AWS service or account that invokes the function (e.g., `s3.amazonaws.com`, `sns.amazonaws.com`, AWS account ID, or AWS IAM principal)

The following arguments are optional:

[principal\_org\_id](#state_principal_org_id_python) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. str

AWS Organizations ID to grant permission to all accounts under this organization

[qualifier](#state_qualifier_python) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. str

Lambda function version or alias name

[region](#state_region_python) str

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration

[source\_account](#state_source_account_python) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. str

AWS account ID of the source owner for cross-account access, S3, or SES

[source\_arn](#state_source_arn_python) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. str

ARN of the source resource granting permission to invoke the Lambda function

[statement\_id](#state_statement_id_python) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. str

Statement identifier. Generated by Pulumi if not provided

[statement\_id\_prefix](#state_statement_id_prefix_python) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. str

Statement identifier prefix. Conflicts with `statementId`

[action](#state_action_yaml) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. String

Lambda action to allow in this statement (e.g., `lambda:InvokeFunction`)

[eventSourceToken](#state_eventsourcetoken_yaml) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. String

Event Source Token for Alexa Skills

[function](#state_function_yaml) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. String |

Name or ARN of the Lambda function

[functionUrlAuthType](#state_functionurlauthtype_yaml) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. String

Lambda Function URL authentication type. Valid values: `AWS_IAM` or `NONE`. Only valid with `lambda:InvokeFunctionUrl` action

[invokedViaFunctionUrl](#state_invokedviafunctionurl_yaml) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. Boolean

Lambda Function URL invoke permission. Only valid with `lambda:InvokeFunction` action

[principal](#state_principal_yaml) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. String

AWS service or account that invokes the function (e.g., `s3.amazonaws.com`, `sns.amazonaws.com`, AWS account ID, or AWS IAM principal)

The following arguments are optional:

[principalOrgId](#state_principalorgid_yaml) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. String

AWS Organizations ID to grant permission to all accounts under this organization

[qualifier](#state_qualifier_yaml) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. String

Lambda function version or alias name

[region](#state_region_yaml) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration

[sourceAccount](#state_sourceaccount_yaml) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. String

AWS account ID of the source owner for cross-account access, S3, or SES

[sourceArn](#state_sourcearn_yaml) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. String

ARN of the source resource granting permission to invoke the Lambda function

[statementId](#state_statementid_yaml) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. String

Statement identifier. Generated by Pulumi if not provided

[statementIdPrefix](#state_statementidprefix_yaml) ![](/icons/replacement-property.svg) Changes to this property will trigger replacement. String

Statement identifier prefix. Conflicts with `statementId`

## Package Details[](#package-details)

Repository

[AWS Classic pulumi/pulumi-aws](https://github.com/pulumi/pulumi-aws)

License

Apache-2.0

Notes

This Pulumi package is based on the [`aws` Terraform Provider](https://github.com/hashicorp/terraform-provider-aws).

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2flambda%2fpermission]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2flambda%2fpermission%2f\))

#### Try Pulumi Cloud free.
Your team will thank you.

[Start free trial](https://app.pulumi.com/signup?utm_source=registry&utm_medium=right-rail-banner&utm_campaign=try-pulumi-cloud&iaid=docs-try-pulumi-cloud-ad)
