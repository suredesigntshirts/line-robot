---
Source: https://www.pulumi.com/registry/packages/aws/api-docs/cloudwatch/metricalarm/
Generated: 2026-06-06
Updated: 2026-06-06
---

# aws.cloudwatch.MetricAlarm

1.  [Packages](/registry/)
2.  [Packages](/registry/packages/)
3.  [AWS](/registry/packages/aws/)
4.  [API Docs](/registry/packages/aws/api-docs/)
5.  [cloudwatch](/registry/packages/aws/api-docs/cloudwatch/)
6.  [MetricAlarm](/registry/packages/aws/api-docs/cloudwatch/metricalarm/)

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

Viewing docs for AWS v7.32.0
published on Friday, May 29, 2026 by Pulumi

[Schema (JSON)](/registry/packages/aws/schema.json)

[pulumi/pulumi-aws](https://github.com/pulumi/pulumi-aws)

v7.32.0 (7.x, latest)v6.83.1 (6.x)v5.43.0 (5.x)

# aws.cloudwatch.MetricAlarm[](#aws-cloudwatch-metricalarm)

Explore with Neo

-   Copy Page

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2fcloudwatch%2fmetricalarm]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2fcloudwatch%2fmetricalarm%2f\))

Provides a CloudWatch Metric Alarm resource.

## Example Usage[](#example-usage)

### Basic Usage[](#basic-usage)

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

const foobar = new aws.cloudwatch.MetricAlarm("foobar", {
    name: "test-foobar5",
    comparisonOperator: "GreaterThanOrEqualToThreshold",
    evaluationPeriods: 2,
    metricName: "CPUUtilization",
    namespace: "AWS/EC2",
    period: 120,
    statistic: "Average",
    threshold: 80,
    alarmDescription: "This metric monitors ec2 cpu utilization",
    insufficientDataActions: [],
});
```

```python
import pulumi
import pulumi_aws as aws

foobar = aws.cloudwatch.MetricAlarm("foobar",
    name="test-foobar5",
    comparison_operator="GreaterThanOrEqualToThreshold",
    evaluation_periods=2,
    metric_name="CPUUtilization",
    namespace="AWS/EC2",
    period=120,
    statistic="Average",
    threshold=float(80),
    alarm_description="This metric monitors ec2 cpu utilization",
    insufficient_data_actions=[])
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/cloudwatch"
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/sns"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		_, err := cloudwatch.NewMetricAlarm(ctx, "foobar", &cloudwatch.MetricAlarmArgs{
			Name:                    pulumi.String("test-foobar5"),
			ComparisonOperator:      pulumi.String("GreaterThanOrEqualToThreshold"),
			EvaluationPeriods:       pulumi.Int(2),
			MetricName:              pulumi.String("CPUUtilization"),
			Namespace:               pulumi.String("AWS/EC2"),
			Period:                  pulumi.Int(120),
			Statistic:               pulumi.String("Average"),
			Threshold:               pulumi.Float64(80),
			AlarmDescription:        pulumi.String("This metric monitors ec2 cpu utilization"),
			InsufficientDataActions: pulumi.Array{},
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
    var foobar = new Aws.CloudWatch.MetricAlarm("foobar", new()
    {
        Name = "test-foobar5",
        ComparisonOperator = "GreaterThanOrEqualToThreshold",
        EvaluationPeriods = 2,
        MetricName = "CPUUtilization",
        Namespace = "AWS/EC2",
        Period = 120,
        Statistic = "Average",
        Threshold = 80,
        AlarmDescription = "This metric monitors ec2 cpu utilization",
        InsufficientDataActions = new[] {},
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.cloudwatch.MetricAlarm;
import com.pulumi.aws.cloudwatch.MetricAlarmArgs;
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
        var foobar = new MetricAlarm("foobar", MetricAlarmArgs.builder()
            .name("test-foobar5")
            .comparisonOperator("GreaterThanOrEqualToThreshold")
            .evaluationPeriods(2)
            .metricName("CPUUtilization")
            .namespace("AWS/EC2")
            .period(120)
            .statistic("Average")
            .threshold(80.0)
            .alarmDescription("This metric monitors ec2 cpu utilization")
            .insufficientDataActions()
            .build());

    }
}
```

```yaml
resources:
  foobar:
    type: aws:cloudwatch:MetricAlarm
    properties:
      name: test-foobar5
      comparisonOperator: GreaterThanOrEqualToThreshold
      evaluationPeriods: 2
      metricName: CPUUtilization
      namespace: AWS/EC2
      period: 120
      statistic: Average
      threshold: 80
      alarmDescription: This metric monitors ec2 cpu utilization
      insufficientDataActions: []
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_cloudwatch_metricalarm" "foobar" {
  name                      = "test-foobar5"
  comparison_operator       = "GreaterThanOrEqualToThreshold"
  evaluation_periods        = 2
  metric_name               = "CPUUtilization"
  namespace                 = "AWS/EC2"
  period                    = 120
  statistic                 = "Average"
  threshold                 = 80
  alarm_description         = "This metric monitors ec2 cpu utilization"
  insufficient_data_actions = []
}
```

### With Scaling Policies[](#with-scaling-policies)

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

const bat = new aws.autoscaling.Policy("bat", {
    name: "foobar3-test",
    scalingAdjustment: 4,
    adjustmentType: "ChangeInCapacity",
    cooldown: 300,
    autoscalingGroupName: bar.name,
});
const batMetricAlarm = new aws.cloudwatch.MetricAlarm("bat", {
    name: "test-foobar5",
    comparisonOperator: "GreaterThanOrEqualToThreshold",
    evaluationPeriods: 2,
    metricName: "CPUUtilization",
    namespace: "AWS/EC2",
    period: 120,
    statistic: "Average",
    threshold: 80,
    dimensions: {
        AutoScalingGroupName: bar.name,
    },
    alarmDescription: "This metric monitors ec2 cpu utilization",
    alarmActions: [bat.arn],
});
```

```python
import pulumi
import pulumi_aws as aws

bat = aws.autoscaling.Policy("bat",
    name="foobar3-test",
    scaling_adjustment=4,
    adjustment_type="ChangeInCapacity",
    cooldown=300,
    autoscaling_group_name=bar["name"])
bat_metric_alarm = aws.cloudwatch.MetricAlarm("bat",
    name="test-foobar5",
    comparison_operator="GreaterThanOrEqualToThreshold",
    evaluation_periods=2,
    metric_name="CPUUtilization",
    namespace="AWS/EC2",
    period=120,
    statistic="Average",
    threshold=float(80),
    dimensions={
        "AutoScalingGroupName": bar["name"],
    },
    alarm_description="This metric monitors ec2 cpu utilization",
    alarm_actions=[bat.arn])
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/autoscaling"
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/cloudwatch"
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/sns"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		bat, err := autoscaling.NewPolicy(ctx, "bat", &autoscaling.PolicyArgs{
			Name:                 pulumi.String("foobar3-test"),
			ScalingAdjustment:    pulumi.Int(4),
			AdjustmentType:       pulumi.String("ChangeInCapacity"),
			Cooldown:             pulumi.Int(300),
			AutoscalingGroupName: pulumi.Any(bar.Name),
		})
		if err != nil {
			return err
		}
		_, err = cloudwatch.NewMetricAlarm(ctx, "bat", &cloudwatch.MetricAlarmArgs{
			Name:               pulumi.String("test-foobar5"),
			ComparisonOperator: pulumi.String("GreaterThanOrEqualToThreshold"),
			EvaluationPeriods:  pulumi.Int(2),
			MetricName:         pulumi.String("CPUUtilization"),
			Namespace:          pulumi.String("AWS/EC2"),
			Period:             pulumi.Int(120),
			Statistic:          pulumi.String("Average"),
			Threshold:          pulumi.Float64(80),
			Dimensions: pulumi.StringMap{
				"AutoScalingGroupName": pulumi.Any(bar.Name),
			},
			AlarmDescription: pulumi.String("This metric monitors ec2 cpu utilization"),
			AlarmActions: pulumi.Array{
				bat.Arn,
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
    var bat = new Aws.AutoScaling.Policy("bat", new()
    {
        Name = "foobar3-test",
        ScalingAdjustment = 4,
        AdjustmentType = "ChangeInCapacity",
        Cooldown = 300,
        AutoscalingGroupName = bar.Name,
    });

    var batMetricAlarm = new Aws.CloudWatch.MetricAlarm("bat", new()
    {
        Name = "test-foobar5",
        ComparisonOperator = "GreaterThanOrEqualToThreshold",
        EvaluationPeriods = 2,
        MetricName = "CPUUtilization",
        Namespace = "AWS/EC2",
        Period = 120,
        Statistic = "Average",
        Threshold = 80,
        Dimensions =
        {
            { "AutoScalingGroupName", bar.Name },
        },
        AlarmDescription = "This metric monitors ec2 cpu utilization",
        AlarmActions = new[]
        {
            bat.Arn,
        },
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.autoscaling.Policy;
import com.pulumi.aws.autoscaling.PolicyArgs;
import com.pulumi.aws.cloudwatch.MetricAlarm;
import com.pulumi.aws.cloudwatch.MetricAlarmArgs;
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
        var bat = new Policy("bat", PolicyArgs.builder()
            .name("foobar3-test")
            .scalingAdjustment(4)
            .adjustmentType("ChangeInCapacity")
            .cooldown(300)
            .autoscalingGroupName(bar.name())
            .build());

        var batMetricAlarm = new MetricAlarm("batMetricAlarm", MetricAlarmArgs.builder()
            .name("test-foobar5")
            .comparisonOperator("GreaterThanOrEqualToThreshold")
            .evaluationPeriods(2)
            .metricName("CPUUtilization")
            .namespace("AWS/EC2")
            .period(120)
            .statistic("Average")
            .threshold(80.0)
            .dimensions(Map.of("AutoScalingGroupName", bar.name()))
            .alarmDescription("This metric monitors ec2 cpu utilization")
            .alarmActions(bat.arn())
            .build());

    }
}
```

```yaml
resources:
  bat:
    type: aws:autoscaling:Policy
    properties:
      name: foobar3-test
      scalingAdjustment: 4
      adjustmentType: ChangeInCapacity
      cooldown: 300
      autoscalingGroupName: ${bar.name}
  batMetricAlarm:
    type: aws:cloudwatch:MetricAlarm
    name: bat
    properties:
      name: test-foobar5
      comparisonOperator: GreaterThanOrEqualToThreshold
      evaluationPeriods: 2
      metricName: CPUUtilization
      namespace: AWS/EC2
      period: 120
      statistic: Average
      threshold: 80
      dimensions:
        AutoScalingGroupName: ${bar.name}
      alarmDescription: This metric monitors ec2 cpu utilization
      alarmActions:
        - ${bat.arn}
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_autoscaling_policy" "bat" {
  name                   = "foobar3-test"
  scaling_adjustment     = 4
  adjustment_type        = "ChangeInCapacity"
  cooldown               = 300
  autoscaling_group_name = bar.name
}
resource "aws_cloudwatch_metricalarm" "bat" {
  name                = "test-foobar5"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 120
  statistic           = "Average"
  threshold           = 80
  dimensions = {
    "AutoScalingGroupName" = bar.name
  }
  alarm_description = "This metric monitors ec2 cpu utilization"
  alarm_actions     = [aws_autoscaling_policy.bat.arn]
}
```

### With a Metrics Math Expression[](#with-a-metrics-math-expression)

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

const foobar = new aws.cloudwatch.MetricAlarm("foobar", {
    name: "test-foobar",
    comparisonOperator: "GreaterThanOrEqualToThreshold",
    evaluationPeriods: 2,
    threshold: 10,
    alarmDescription: "Request error rate has exceeded 10%",
    insufficientDataActions: [],
    metricQueries: [
        {
            id: "e1",
            expression: "m2/m1*100",
            label: "Error Rate",
            returnData: true,
        },
        {
            id: "m1",
            metric: {
                metricName: "RequestCount",
                namespace: "AWS/ApplicationELB",
                period: 120,
                stat: "Sum",
                unit: "Count",
                dimensions: {
                    LoadBalancer: "app/web",
                },
            },
        },
        {
            id: "m2",
            metric: {
                metricName: "HTTPCode_ELB_5XX_Count",
                namespace: "AWS/ApplicationELB",
                period: 120,
                stat: "Sum",
                unit: "Count",
                dimensions: {
                    LoadBalancer: "app/web",
                },
            },
        },
    ],
});
```

```python
import pulumi
import pulumi_aws as aws

foobar = aws.cloudwatch.MetricAlarm("foobar",
    name="test-foobar",
    comparison_operator="GreaterThanOrEqualToThreshold",
    evaluation_periods=2,
    threshold=float(10),
    alarm_description="Request error rate has exceeded 10%",
    insufficient_data_actions=[],
    metric_queries=[
        {
            "id": "e1",
            "expression": "m2/m1*100",
            "label": "Error Rate",
            "return_data": True,
        },
        {
            "id": "m1",
            "metric": {
                "metric_name": "RequestCount",
                "namespace": "AWS/ApplicationELB",
                "period": 120,
                "stat": "Sum",
                "unit": "Count",
                "dimensions": {
                    "LoadBalancer": "app/web",
                },
            },
        },
        {
            "id": "m2",
            "metric": {
                "metric_name": "HTTPCode_ELB_5XX_Count",
                "namespace": "AWS/ApplicationELB",
                "period": 120,
                "stat": "Sum",
                "unit": "Count",
                "dimensions": {
                    "LoadBalancer": "app/web",
                },
            },
        },
    ])
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/cloudwatch"
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/sns"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		_, err := cloudwatch.NewMetricAlarm(ctx, "foobar", &cloudwatch.MetricAlarmArgs{
			Name:                    pulumi.String("test-foobar"),
			ComparisonOperator:      pulumi.String("GreaterThanOrEqualToThreshold"),
			EvaluationPeriods:       pulumi.Int(2),
			Threshold:               pulumi.Float64(10),
			AlarmDescription:        pulumi.String("Request error rate has exceeded 10%"),
			InsufficientDataActions: pulumi.Array{},
			MetricQueries: cloudwatch.MetricAlarmMetricQueryArray{
				&cloudwatch.MetricAlarmMetricQueryArgs{
					Id:         pulumi.String("e1"),
					Expression: pulumi.String("m2/m1*100"),
					Label:      pulumi.String("Error Rate"),
					ReturnData: pulumi.Bool(true),
				},
				&cloudwatch.MetricAlarmMetricQueryArgs{
					Id: pulumi.String("m1"),
					Metric: &cloudwatch.MetricAlarmMetricQueryMetricArgs{
						MetricName: pulumi.String("RequestCount"),
						Namespace:  pulumi.String("AWS/ApplicationELB"),
						Period:     pulumi.Int(120),
						Stat:       pulumi.String("Sum"),
						Unit:       pulumi.String("Count"),
						Dimensions: pulumi.StringMap{
							"LoadBalancer": pulumi.String("app/web"),
						},
					},
				},
				&cloudwatch.MetricAlarmMetricQueryArgs{
					Id: pulumi.String("m2"),
					Metric: &cloudwatch.MetricAlarmMetricQueryMetricArgs{
						MetricName: pulumi.String("HTTPCode_ELB_5XX_Count"),
						Namespace:  pulumi.String("AWS/ApplicationELB"),
						Period:     pulumi.Int(120),
						Stat:       pulumi.String("Sum"),
						Unit:       pulumi.String("Count"),
						Dimensions: pulumi.StringMap{
							"LoadBalancer": pulumi.String("app/web"),
						},
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
    var foobar = new Aws.CloudWatch.MetricAlarm("foobar", new()
    {
        Name = "test-foobar",
        ComparisonOperator = "GreaterThanOrEqualToThreshold",
        EvaluationPeriods = 2,
        Threshold = 10,
        AlarmDescription = "Request error rate has exceeded 10%",
        InsufficientDataActions = new[] {},
        MetricQueries = new[]
        {
            new Aws.CloudWatch.Inputs.MetricAlarmMetricQueryArgs
            {
                Id = "e1",
                Expression = "m2/m1*100",
                Label = "Error Rate",
                ReturnData = true,
            },
            new Aws.CloudWatch.Inputs.MetricAlarmMetricQueryArgs
            {
                Id = "m1",
                Metric = new Aws.CloudWatch.Inputs.MetricAlarmMetricQueryMetricArgs
                {
                    MetricName = "RequestCount",
                    Namespace = "AWS/ApplicationELB",
                    Period = 120,
                    Stat = "Sum",
                    Unit = "Count",
                    Dimensions =
                    {
                        { "LoadBalancer", "app/web" },
                    },
                },
            },
            new Aws.CloudWatch.Inputs.MetricAlarmMetricQueryArgs
            {
                Id = "m2",
                Metric = new Aws.CloudWatch.Inputs.MetricAlarmMetricQueryMetricArgs
                {
                    MetricName = "HTTPCode_ELB_5XX_Count",
                    Namespace = "AWS/ApplicationELB",
                    Period = 120,
                    Stat = "Sum",
                    Unit = "Count",
                    Dimensions =
                    {
                        { "LoadBalancer", "app/web" },
                    },
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
import com.pulumi.aws.cloudwatch.MetricAlarm;
import com.pulumi.aws.cloudwatch.MetricAlarmArgs;
import com.pulumi.aws.cloudwatch.inputs.MetricAlarmMetricQueryArgs;
import com.pulumi.aws.cloudwatch.inputs.MetricAlarmMetricQueryMetricArgs;
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
        var foobar = new MetricAlarm("foobar", MetricAlarmArgs.builder()
            .name("test-foobar")
            .comparisonOperator("GreaterThanOrEqualToThreshold")
            .evaluationPeriods(2)
            .threshold(10.0)
            .alarmDescription("Request error rate has exceeded 10%")
            .insufficientDataActions()
            .metricQueries(
                MetricAlarmMetricQueryArgs.builder()
                    .id("e1")
                    .expression("m2/m1*100")
                    .label("Error Rate")
                    .returnData(true)
                    .build(),
                MetricAlarmMetricQueryArgs.builder()
                    .id("m1")
                    .metric(MetricAlarmMetricQueryMetricArgs.builder()
                        .metricName("RequestCount")
                        .namespace("AWS/ApplicationELB")
                        .period(120)
                        .stat("Sum")
                        .unit("Count")
                        .dimensions(Map.of("LoadBalancer", "app/web"))
                        .build())
                    .build(),
                MetricAlarmMetricQueryArgs.builder()
                    .id("m2")
                    .metric(MetricAlarmMetricQueryMetricArgs.builder()
                        .metricName("HTTPCode_ELB_5XX_Count")
                        .namespace("AWS/ApplicationELB")
                        .period(120)
                        .stat("Sum")
                        .unit("Count")
                        .dimensions(Map.of("LoadBalancer", "app/web"))
                        .build())
                    .build())
            .build());

    }
}
```

```yaml
resources:
  foobar:
    type: aws:cloudwatch:MetricAlarm
    properties:
      name: test-foobar
      comparisonOperator: GreaterThanOrEqualToThreshold
      evaluationPeriods: 2
      threshold: 10
      alarmDescription: Request error rate has exceeded 10%
      insufficientDataActions: []
      metricQueries:
        - id: e1
          expression: m2/m1*100
          label: Error Rate
          returnData: 'true'
        - id: m1
          metric:
            metricName: RequestCount
            namespace: AWS/ApplicationELB
            period: 120
            stat: Sum
            unit: Count
            dimensions:
              LoadBalancer: app/web
        - id: m2
          metric:
            metricName: HTTPCode_ELB_5XX_Count
            namespace: AWS/ApplicationELB
            period: 120
            stat: Sum
            unit: Count
            dimensions:
              LoadBalancer: app/web
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_cloudwatch_metricalarm" "foobar" {
  name                      = "test-foobar"
  comparison_operator       = "GreaterThanOrEqualToThreshold"
  evaluation_periods        = 2
  threshold                 = 10
  alarm_description         = "Request error rate has exceeded 10%"
  insufficient_data_actions = []
  metric_queries {
    id          = "e1"
    expression  = "m2/m1*100"
    label       = "Error Rate"
    return_data = "true"
  }
  metric_queries {
    id = "m1"
    metric = {
      metric_name = "RequestCount"
      namespace   = "AWS/ApplicationELB"
      period      = 120
      stat        = "Sum"
      unit        = "Count"
      dimensions = {
        "LoadBalancer" = "app/web"
      }
    }
  }
  metric_queries {
    id = "m2"
    metric = {
      metric_name = "HTTPCode_ELB_5XX_Count"
      namespace   = "AWS/ApplicationELB"
      period      = 120
      stat        = "Sum"
      unit        = "Count"
      dimensions = {
        "LoadBalancer" = "app/web"
      }
    }
  }
}
```

### With PromQL[](#with-promql)

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

const promqlAlarm = new aws.cloudwatch.MetricAlarm("promql_alarm", {
    name: "high-cpu-promql",
    alarmDescription: "Alarm when average CPU exceeds 80% using PromQL",
    evaluationCriteria: {
        promqlCriteria: {
            query: "avg(cpu_utilization_percent) > 80",
            pendingPeriod: 300,
            recoveryPeriod: 120,
        },
    },
    evaluationInterval: 30,
    alarmActions: [alerts.arn],
});
```

```python
import pulumi
import pulumi_aws as aws

promql_alarm = aws.cloudwatch.MetricAlarm("promql_alarm",
    name="high-cpu-promql",
    alarm_description="Alarm when average CPU exceeds 80% using PromQL",
    evaluation_criteria={
        "promql_criteria": {
            "query": "avg(cpu_utilization_percent) > 80",
            "pending_period": 300,
            "recovery_period": 120,
        },
    },
    evaluation_interval=30,
    alarm_actions=[alerts["arn"]])
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/cloudwatch"
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/sns"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		_, err := cloudwatch.NewMetricAlarm(ctx, "promql_alarm", &cloudwatch.MetricAlarmArgs{
			Name:             pulumi.String("high-cpu-promql"),
			AlarmDescription: pulumi.String("Alarm when average CPU exceeds 80% using PromQL"),
			EvaluationCriteria: &cloudwatch.MetricAlarmEvaluationCriteriaArgs{
				PromqlCriteria: &cloudwatch.MetricAlarmEvaluationCriteriaPromqlCriteriaArgs{
					Query:          pulumi.String("avg(cpu_utilization_percent) > 80"),
					PendingPeriod:  pulumi.Int(300),
					RecoveryPeriod: pulumi.Int(120),
				},
			},
			EvaluationInterval: pulumi.Int(30),
			AlarmActions: pulumi.Array{
				alerts.Arn,
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
    var promqlAlarm = new Aws.CloudWatch.MetricAlarm("promql_alarm", new()
    {
        Name = "high-cpu-promql",
        AlarmDescription = "Alarm when average CPU exceeds 80% using PromQL",
        EvaluationCriteria = new Aws.CloudWatch.Inputs.MetricAlarmEvaluationCriteriaArgs
        {
            PromqlCriteria = new Aws.CloudWatch.Inputs.MetricAlarmEvaluationCriteriaPromqlCriteriaArgs
            {
                Query = "avg(cpu_utilization_percent) > 80",
                PendingPeriod = 300,
                RecoveryPeriod = 120,
            },
        },
        EvaluationInterval = 30,
        AlarmActions = new[]
        {
            alerts.Arn,
        },
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.cloudwatch.MetricAlarm;
import com.pulumi.aws.cloudwatch.MetricAlarmArgs;
import com.pulumi.aws.cloudwatch.inputs.MetricAlarmEvaluationCriteriaArgs;
import com.pulumi.aws.cloudwatch.inputs.MetricAlarmEvaluationCriteriaPromqlCriteriaArgs;
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
        var promqlAlarm = new MetricAlarm("promqlAlarm", MetricAlarmArgs.builder()
            .name("high-cpu-promql")
            .alarmDescription("Alarm when average CPU exceeds 80% using PromQL")
            .evaluationCriteria(MetricAlarmEvaluationCriteriaArgs.builder()
                .promqlCriteria(MetricAlarmEvaluationCriteriaPromqlCriteriaArgs.builder()
                    .query("avg(cpu_utilization_percent) > 80")
                    .pendingPeriod(300)
                    .recoveryPeriod(120)
                    .build())
                .build())
            .evaluationInterval(30)
            .alarmActions(alerts.arn())
            .build());

    }
}
```

```yaml
resources:
  promqlAlarm:
    type: aws:cloudwatch:MetricAlarm
    name: promql_alarm
    properties:
      name: high-cpu-promql
      alarmDescription: Alarm when average CPU exceeds 80% using PromQL
      evaluationCriteria:
        promqlCriteria:
          query: avg(cpu_utilization_percent) > 80
          pendingPeriod: 300
          recoveryPeriod: 120
      evaluationInterval: 30 # seconds
      alarmActions:
        - ${alerts.arn}
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_cloudwatch_metricalarm" "promql_alarm" {
  name              = "high-cpu-promql"
  alarm_description = "Alarm when average CPU exceeds 80% using PromQL"
  evaluation_criteria = {
    promql_criteria = {
      query           = "avg(cpu_utilization_percent) > 80"
      pending_period  = 300
      recovery_period = 120
    }
  }
  # 5 minutes
  # 5 minutes
  # 2 minutes
  evaluation_interval = 30 # seconds
  alarm_actions       = [alerts.arn]
}
```

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

const xxAnomalyDetection = new aws.cloudwatch.MetricAlarm("xx_anomaly_detection", {
    name: "test-foobar",
    comparisonOperator: "GreaterThanUpperThreshold",
    evaluationPeriods: 2,
    thresholdMetricId: "e1",
    alarmDescription: "This metric monitors ec2 cpu utilization",
    insufficientDataActions: [],
    metricQueries: [
        {
            id: "e1",
            returnData: true,
            expression: "ANOMALY_DETECTION_BAND(m1)",
            label: "CPUUtilization (Expected)",
        },
        {
            id: "m1",
            returnData: true,
            metric: {
                metricName: "CPUUtilization",
                namespace: "AWS/EC2",
                period: 120,
                stat: "Average",
                unit: "Count",
                dimensions: {
                    InstanceId: "i-abc123",
                },
            },
        },
    ],
});
```

```python
import pulumi
import pulumi_aws as aws

xx_anomaly_detection = aws.cloudwatch.MetricAlarm("xx_anomaly_detection",
    name="test-foobar",
    comparison_operator="GreaterThanUpperThreshold",
    evaluation_periods=2,
    threshold_metric_id="e1",
    alarm_description="This metric monitors ec2 cpu utilization",
    insufficient_data_actions=[],
    metric_queries=[
        {
            "id": "e1",
            "return_data": True,
            "expression": "ANOMALY_DETECTION_BAND(m1)",
            "label": "CPUUtilization (Expected)",
        },
        {
            "id": "m1",
            "return_data": True,
            "metric": {
                "metric_name": "CPUUtilization",
                "namespace": "AWS/EC2",
                "period": 120,
                "stat": "Average",
                "unit": "Count",
                "dimensions": {
                    "InstanceId": "i-abc123",
                },
            },
        },
    ])
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/cloudwatch"
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/sns"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		_, err := cloudwatch.NewMetricAlarm(ctx, "xx_anomaly_detection", &cloudwatch.MetricAlarmArgs{
			Name:                    pulumi.String("test-foobar"),
			ComparisonOperator:      pulumi.String("GreaterThanUpperThreshold"),
			EvaluationPeriods:       pulumi.Int(2),
			ThresholdMetricId:       pulumi.String("e1"),
			AlarmDescription:        pulumi.String("This metric monitors ec2 cpu utilization"),
			InsufficientDataActions: pulumi.Array{},
			MetricQueries: cloudwatch.MetricAlarmMetricQueryArray{
				&cloudwatch.MetricAlarmMetricQueryArgs{
					Id:         pulumi.String("e1"),
					ReturnData: pulumi.Bool(true),
					Expression: pulumi.String("ANOMALY_DETECTION_BAND(m1)"),
					Label:      pulumi.String("CPUUtilization (Expected)"),
				},
				&cloudwatch.MetricAlarmMetricQueryArgs{
					Id:         pulumi.String("m1"),
					ReturnData: pulumi.Bool(true),
					Metric: &cloudwatch.MetricAlarmMetricQueryMetricArgs{
						MetricName: pulumi.String("CPUUtilization"),
						Namespace:  pulumi.String("AWS/EC2"),
						Period:     pulumi.Int(120),
						Stat:       pulumi.String("Average"),
						Unit:       pulumi.String("Count"),
						Dimensions: pulumi.StringMap{
							"InstanceId": pulumi.String("i-abc123"),
						},
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
    var xxAnomalyDetection = new Aws.CloudWatch.MetricAlarm("xx_anomaly_detection", new()
    {
        Name = "test-foobar",
        ComparisonOperator = "GreaterThanUpperThreshold",
        EvaluationPeriods = 2,
        ThresholdMetricId = "e1",
        AlarmDescription = "This metric monitors ec2 cpu utilization",
        InsufficientDataActions = new[] {},
        MetricQueries = new[]
        {
            new Aws.CloudWatch.Inputs.MetricAlarmMetricQueryArgs
            {
                Id = "e1",
                ReturnData = true,
                Expression = "ANOMALY_DETECTION_BAND(m1)",
                Label = "CPUUtilization (Expected)",
            },
            new Aws.CloudWatch.Inputs.MetricAlarmMetricQueryArgs
            {
                Id = "m1",
                ReturnData = true,
                Metric = new Aws.CloudWatch.Inputs.MetricAlarmMetricQueryMetricArgs
                {
                    MetricName = "CPUUtilization",
                    Namespace = "AWS/EC2",
                    Period = 120,
                    Stat = "Average",
                    Unit = "Count",
                    Dimensions =
                    {
                        { "InstanceId", "i-abc123" },
                    },
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
import com.pulumi.aws.cloudwatch.MetricAlarm;
import com.pulumi.aws.cloudwatch.MetricAlarmArgs;
import com.pulumi.aws.cloudwatch.inputs.MetricAlarmMetricQueryArgs;
import com.pulumi.aws.cloudwatch.inputs.MetricAlarmMetricQueryMetricArgs;
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
        var xxAnomalyDetection = new MetricAlarm("xxAnomalyDetection", MetricAlarmArgs.builder()
            .name("test-foobar")
            .comparisonOperator("GreaterThanUpperThreshold")
            .evaluationPeriods(2)
            .thresholdMetricId("e1")
            .alarmDescription("This metric monitors ec2 cpu utilization")
            .insufficientDataActions()
            .metricQueries(
                MetricAlarmMetricQueryArgs.builder()
                    .id("e1")
                    .returnData(true)
                    .expression("ANOMALY_DETECTION_BAND(m1)")
                    .label("CPUUtilization (Expected)")
                    .build(),
                MetricAlarmMetricQueryArgs.builder()
                    .id("m1")
                    .returnData(true)
                    .metric(MetricAlarmMetricQueryMetricArgs.builder()
                        .metricName("CPUUtilization")
                        .namespace("AWS/EC2")
                        .period(120)
                        .stat("Average")
                        .unit("Count")
                        .dimensions(Map.of("InstanceId", "i-abc123"))
                        .build())
                    .build())
            .build());

    }
}
```

```yaml
resources:
  xxAnomalyDetection:
    type: aws:cloudwatch:MetricAlarm
    name: xx_anomaly_detection
    properties:
      name: test-foobar
      comparisonOperator: GreaterThanUpperThreshold
      evaluationPeriods: 2
      thresholdMetricId: e1
      alarmDescription: This metric monitors ec2 cpu utilization
      insufficientDataActions: []
      metricQueries:
        - id: e1
          returnData: true
          expression: ANOMALY_DETECTION_BAND(m1)
          label: CPUUtilization (Expected)
        - id: m1
          returnData: true
          metric:
            metricName: CPUUtilization
            namespace: AWS/EC2
            period: 120
            stat: Average
            unit: Count
            dimensions:
              InstanceId: i-abc123
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_cloudwatch_metricalarm" "xx_anomaly_detection" {
  name                      = "test-foobar"
  comparison_operator       = "GreaterThanUpperThreshold"
  evaluation_periods        = 2
  threshold_metric_id       = "e1"
  alarm_description         = "This metric monitors ec2 cpu utilization"
  insufficient_data_actions = []
  metric_queries {
    id          = "e1"
    return_data = true
    expression  = "ANOMALY_DETECTION_BAND(m1)"
    label       = "CPUUtilization (Expected)"
  }
  metric_queries {
    id          = "m1"
    return_data = true
    metric = {
      metric_name = "CPUUtilization"
      namespace   = "AWS/EC2"
      period      = 120
      stat        = "Average"
      unit        = "Count"
      dimensions = {
        "InstanceId" = "i-abc123"
      }
    }
  }
}
```

### With a Metrics Insights Query[](#with-a-metrics-insights-query)

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

const example = new aws.cloudwatch.MetricAlarm("example", {
    name: "example-alarm",
    alarmDescription: "Triggers if the smallest per-instance maximum load during the evaluation period exceeds the threshold",
    comparisonOperator: "GreaterThanThreshold",
    evaluationPeriods: 1,
    threshold: 0.6,
    treatMissingData: "notBreaching",
    metricQueries: [{
        id: "q1",
        expression: `SELECT
  MAX(DBLoadRelativeToNumVCPUs)
FROM SCHEMA(\\"AWS/RDS\\", DBInstanceIdentifier)
WHERE DBInstanceIdentifier != 'example-rds-instance'
GROUP BY DBInstanceIdentifier
ORDER BY MIN() ASC
LIMIT 1
`,
        period: 60,
        returnData: true,
        label: "Max DB Load of the Least-Loaded RDS Instance",
    }],
});
```

```python
import pulumi
import pulumi_aws as aws

example = aws.cloudwatch.MetricAlarm("example",
    name="example-alarm",
    alarm_description="Triggers if the smallest per-instance maximum load during the evaluation period exceeds the threshold",
    comparison_operator="GreaterThanThreshold",
    evaluation_periods=1,
    threshold=0.6,
    treat_missing_data="notBreaching",
    metric_queries=[{
        "id": "q1",
        "expression": """SELECT
  MAX(DBLoadRelativeToNumVCPUs)
FROM SCHEMA(\"AWS/RDS\", DBInstanceIdentifier)
WHERE DBInstanceIdentifier != 'example-rds-instance'
GROUP BY DBInstanceIdentifier
ORDER BY MIN() ASC
LIMIT 1
""",
        "period": 60,
        "return_data": True,
        "label": "Max DB Load of the Least-Loaded RDS Instance",
    }])
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/cloudwatch"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		_, err := cloudwatch.NewMetricAlarm(ctx, "example", &cloudwatch.MetricAlarmArgs{
			Name:               pulumi.String("example-alarm"),
			AlarmDescription:   pulumi.String("Triggers if the smallest per-instance maximum load during the evaluation period exceeds the threshold"),
			ComparisonOperator: pulumi.String("GreaterThanThreshold"),
			EvaluationPeriods:  pulumi.Int(1),
			Threshold:          pulumi.Float64(0.6),
			TreatMissingData:   pulumi.String("notBreaching"),
			MetricQueries: cloudwatch.MetricAlarmMetricQueryArray{
				&cloudwatch.MetricAlarmMetricQueryArgs{
					Id: pulumi.String("q1"),
					Expression: pulumi.String(`SELECT
  MAX(DBLoadRelativeToNumVCPUs)
FROM SCHEMA(\"AWS/RDS\", DBInstanceIdentifier)
WHERE DBInstanceIdentifier != 'example-rds-instance'
GROUP BY DBInstanceIdentifier
ORDER BY MIN() ASC
LIMIT 1
`),
					Period:     pulumi.Int(60),
					ReturnData: pulumi.Bool(true),
					Label:      pulumi.String("Max DB Load of the Least-Loaded RDS Instance"),
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
    var example = new Aws.CloudWatch.MetricAlarm("example", new()
    {
        Name = "example-alarm",
        AlarmDescription = "Triggers if the smallest per-instance maximum load during the evaluation period exceeds the threshold",
        ComparisonOperator = "GreaterThanThreshold",
        EvaluationPeriods = 1,
        Threshold = 0.6,
        TreatMissingData = "notBreaching",
        MetricQueries = new[]
        {
            new Aws.CloudWatch.Inputs.MetricAlarmMetricQueryArgs
            {
                Id = "q1",
                Expression = @"SELECT
  MAX(DBLoadRelativeToNumVCPUs)
FROM SCHEMA(\""AWS/RDS\"", DBInstanceIdentifier)
WHERE DBInstanceIdentifier != 'example-rds-instance'
GROUP BY DBInstanceIdentifier
ORDER BY MIN() ASC
LIMIT 1
",
                Period = 60,
                ReturnData = true,
                Label = "Max DB Load of the Least-Loaded RDS Instance",
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
import com.pulumi.aws.cloudwatch.MetricAlarm;
import com.pulumi.aws.cloudwatch.MetricAlarmArgs;
import com.pulumi.aws.cloudwatch.inputs.MetricAlarmMetricQueryArgs;
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
        var example = new MetricAlarm("example", MetricAlarmArgs.builder()
            .name("example-alarm")
            .alarmDescription("Triggers if the smallest per-instance maximum load during the evaluation period exceeds the threshold")
            .comparisonOperator("GreaterThanThreshold")
            .evaluationPeriods(1)
            .threshold(0.6)
            .treatMissingData("notBreaching")
            .metricQueries(MetricAlarmMetricQueryArgs.builder()
                .id("q1")
                .expression("""
SELECT
  MAX(DBLoadRelativeToNumVCPUs)
FROM SCHEMA(\"AWS/RDS\", DBInstanceIdentifier)
WHERE DBInstanceIdentifier != 'example-rds-instance'
GROUP BY DBInstanceIdentifier
ORDER BY MIN() ASC
LIMIT 1
                """)
                .period(60)
                .returnData(true)
                .label("Max DB Load of the Least-Loaded RDS Instance")
                .build())
            .build());

    }
}
```

```yaml
resources:
  example:
    type: aws:cloudwatch:MetricAlarm
    properties:
      name: example-alarm
      alarmDescription: Triggers if the smallest per-instance maximum load during the evaluation period exceeds the threshold
      comparisonOperator: GreaterThanThreshold
      evaluationPeriods: 1
      threshold: 0.6
      treatMissingData: notBreaching
      metricQueries:
        - id: q1
          expression: |
            SELECT
              MAX(DBLoadRelativeToNumVCPUs)
            FROM SCHEMA(\"AWS/RDS\", DBInstanceIdentifier)
            WHERE DBInstanceIdentifier != 'example-rds-instance'
            GROUP BY DBInstanceIdentifier
            ORDER BY MIN() ASC
            LIMIT 1
          period: 60
          returnData: true
          label: Max DB Load of the Least-Loaded RDS Instance
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_cloudwatch_metricalarm" "example" {
  name                = "example-alarm"
  alarm_description   = "Triggers if the smallest per-instance maximum load during the evaluation period exceeds the threshold"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  threshold           = 0.6
  treat_missing_data  = "notBreaching"
  metric_queries {
    id          = "q1"
    expression  = "SELECT\n  MAX(DBLoadRelativeToNumVCPUs)\nFROM SCHEMA(\\\"AWS/RDS\\\", DBInstanceIdentifier)\nWHERE DBInstanceIdentifier != 'example-rds-instance'\nGROUP BY DBInstanceIdentifier\nORDER BY MIN() ASC\nLIMIT 1\n"
    period      = 60
    return_data = true
    label       = "Max DB Load of the Least-Loaded RDS Instance"
  }
}
```

### Monitoring Healthy NLB Hosts with Target Group and NLB[](#monitoring-healthy-nlb-hosts-with-target-group-and-nlb)

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

const nlbHealthyhosts = new aws.cloudwatch.MetricAlarm("nlb_healthyhosts", {
    name: "alarmname",
    comparisonOperator: "LessThanThreshold",
    evaluationPeriods: 1,
    metricName: "HealthyHostCount",
    namespace: "AWS/NetworkELB",
    period: 60,
    statistic: "Average",
    threshold: logstashServersCount,
    alarmDescription: "Number of healthy nodes in Target Group",
    actionsEnabled: true,
    alarmActions: [sns.arn],
    okActions: [sns.arn],
    dimensions: {
        TargetGroup: lb_tg.arnSuffix,
        LoadBalancer: lb.arnSuffix,
    },
});
```

```python
import pulumi
import pulumi_aws as aws

nlb_healthyhosts = aws.cloudwatch.MetricAlarm("nlb_healthyhosts",
    name="alarmname",
    comparison_operator="LessThanThreshold",
    evaluation_periods=1,
    metric_name="HealthyHostCount",
    namespace="AWS/NetworkELB",
    period=60,
    statistic="Average",
    threshold=logstash_servers_count,
    alarm_description="Number of healthy nodes in Target Group",
    actions_enabled=True,
    alarm_actions=[sns["arn"]],
    ok_actions=[sns["arn"]],
    dimensions={
        "TargetGroup": lb_tg["arnSuffix"],
        "LoadBalancer": lb["arnSuffix"],
    })
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/cloudwatch"
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/sns"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		_, err := cloudwatch.NewMetricAlarm(ctx, "nlb_healthyhosts", &cloudwatch.MetricAlarmArgs{
			Name:               pulumi.String("alarmname"),
			ComparisonOperator: pulumi.String("LessThanThreshold"),
			EvaluationPeriods:  pulumi.Int(1),
			MetricName:         pulumi.String("HealthyHostCount"),
			Namespace:          pulumi.String("AWS/NetworkELB"),
			Period:             pulumi.Int(60),
			Statistic:          pulumi.String("Average"),
			Threshold:          pulumi.Any(logstashServersCount),
			AlarmDescription:   pulumi.String("Number of healthy nodes in Target Group"),
			ActionsEnabled:     pulumi.Bool(true),
			AlarmActions: pulumi.Array{
				sns.Arn,
			},
			OkActions: pulumi.Array{
				sns.Arn,
			},
			Dimensions: pulumi.StringMap{
				"TargetGroup":  pulumi.Any(lb_tg.ArnSuffix),
				"LoadBalancer": pulumi.Any(lb.ArnSuffix),
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
    var nlbHealthyhosts = new Aws.CloudWatch.MetricAlarm("nlb_healthyhosts", new()
    {
        Name = "alarmname",
        ComparisonOperator = "LessThanThreshold",
        EvaluationPeriods = 1,
        MetricName = "HealthyHostCount",
        Namespace = "AWS/NetworkELB",
        Period = 60,
        Statistic = "Average",
        Threshold = logstashServersCount,
        AlarmDescription = "Number of healthy nodes in Target Group",
        ActionsEnabled = true,
        AlarmActions = new[]
        {
            sns.Arn,
        },
        OkActions = new[]
        {
            sns.Arn,
        },
        Dimensions =
        {
            { "TargetGroup", lb_tg.ArnSuffix },
            { "LoadBalancer", lb.ArnSuffix },
        },
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.cloudwatch.MetricAlarm;
import com.pulumi.aws.cloudwatch.MetricAlarmArgs;
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
        var nlbHealthyhosts = new MetricAlarm("nlbHealthyhosts", MetricAlarmArgs.builder()
            .name("alarmname")
            .comparisonOperator("LessThanThreshold")
            .evaluationPeriods(1)
            .metricName("HealthyHostCount")
            .namespace("AWS/NetworkELB")
            .period(60)
            .statistic("Average")
            .threshold(logstashServersCount)
            .alarmDescription("Number of healthy nodes in Target Group")
            .actionsEnabled(true)
            .alarmActions(sns.arn())
            .okActions(sns.arn())
            .dimensions(Map.ofEntries(
                Map.entry("TargetGroup", lb_tg.arnSuffix()),
                Map.entry("LoadBalancer", lb.arnSuffix())
            ))
            .build());

    }
}
```

```yaml
resources:
  nlbHealthyhosts:
    type: aws:cloudwatch:MetricAlarm
    name: nlb_healthyhosts
    properties:
      name: alarmname
      comparisonOperator: LessThanThreshold
      evaluationPeriods: 1
      metricName: HealthyHostCount
      namespace: AWS/NetworkELB
      period: 60
      statistic: Average
      threshold: ${logstashServersCount}
      alarmDescription: Number of healthy nodes in Target Group
      actionsEnabled: 'true'
      alarmActions:
        - ${sns.arn}
      okActions:
        - ${sns.arn}
      dimensions:
        TargetGroup: ${["lb-tg"].arnSuffix}
        LoadBalancer: ${lb.arnSuffix}
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_cloudwatch_metricalarm" "nlb_healthyhosts" {
  name                = "alarmname"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 1
  metric_name         = "HealthyHostCount"
  namespace           = "AWS/NetworkELB"
  period              = 60
  statistic           = "Average"
  threshold           = logstashServersCount
  alarm_description   = "Number of healthy nodes in Target Group"
  actions_enabled     = "true"
  alarm_actions       = [sns.arn]
  ok_actions          = [sns.arn]
  dimensions = {
    "TargetGroup"  = lb-tg.arnSuffix
    "LoadBalancer" = lb.arnSuffix
  }
}
```

> **NOTE:** You cannot create a metric alarm consisting of both `statistic` and `extendedStatistic` parameters. You must choose one or the other.

## Create MetricAlarm Resource[](#create)

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
new MetricAlarm(name: string, args?: MetricAlarmArgs, opts?: CustomResourceOptions);
```

```python
@overload
def MetricAlarm(resource_name: str,
                args: Optional[MetricAlarmArgs] = None,
                opts: Optional[ResourceOptions] = None)

@overload
def MetricAlarm(resource_name: str,
                opts: Optional[ResourceOptions] = None,
                actions_enabled: Optional[bool] = None,
                alarm_actions: Optional[Sequence[str]] = None,
                alarm_description: Optional[str] = None,
                comparison_operator: Optional[str] = None,
                datapoints_to_alarm: Optional[int] = None,
                dimensions: Optional[Mapping[str, str]] = None,
                evaluate_low_sample_count_percentiles: Optional[str] = None,
                evaluation_criteria: Optional[MetricAlarmEvaluationCriteriaArgs] = None,
                evaluation_interval: Optional[int] = None,
                evaluation_periods: Optional[int] = None,
                extended_statistic: Optional[str] = None,
                insufficient_data_actions: Optional[Sequence[str]] = None,
                metric_name: Optional[str] = None,
                metric_queries: Optional[Sequence[MetricAlarmMetricQueryArgs]] = None,
                name: Optional[str] = None,
                namespace: Optional[str] = None,
                ok_actions: Optional[Sequence[str]] = None,
                period: Optional[int] = None,
                region: Optional[str] = None,
                statistic: Optional[str] = None,
                tags: Optional[Mapping[str, str]] = None,
                threshold: Optional[float] = None,
                threshold_metric_id: Optional[str] = None,
                treat_missing_data: Optional[str] = None,
                unit: Optional[str] = None)
```

```go
func NewMetricAlarm(ctx *Context, name string, args *MetricAlarmArgs, opts ...ResourceOption) (*MetricAlarm, error)
```

```csharp
public MetricAlarm(string name, MetricAlarmArgs? args = null, CustomResourceOptions? opts = null)
```

```java
public MetricAlarm(String name, MetricAlarmArgs args)
public MetricAlarm(String name, MetricAlarmArgs args, CustomResourceOptions options)
```

```yaml
type: aws:cloudwatch:MetricAlarm
properties: # The arguments to resource properties.
options: # Bag of options to control resource's behavior.
```

```hcl
resource "aws_cloudwatch_metricalarm" "name" {
    # resource properties
}
```

#### Parameters[](#parameters)

name This property is required. string

The unique name of the resource.

args [MetricAlarmArgs](#inputs)

The arguments to resource properties.

opts [CustomResourceOptions](/docs/reference/pkg/nodejs/pulumi/pulumi/#CustomResourceOptions)

Bag of options to control resource's behavior.

resource\_name This property is required. str

The unique name of the resource.

args [MetricAlarmArgs](#inputs)

The arguments to resource properties.

opts [ResourceOptions](/docs/reference/pkg/python/pulumi/#pulumi.ResourceOptions)

Bag of options to control resource's behavior.

ctx [Context](https://pkg.go.dev/github.com/pulumi/pulumi/sdk/v3/go/pulumi?tab=doc#Context)

Context object for the current deployment.

name This property is required. string

The unique name of the resource.

args [MetricAlarmArgs](#inputs)

The arguments to resource properties.

opts [ResourceOption](https://pkg.go.dev/github.com/pulumi/pulumi/sdk/v3/go/pulumi?tab=doc#ResourceOption)

Bag of options to control resource's behavior.

name This property is required. string

The unique name of the resource.

args [MetricAlarmArgs](#inputs)

The arguments to resource properties.

opts [CustomResourceOptions](/docs/reference/pkg/dotnet/Pulumi/Pulumi.CustomResourceOptions.html)

Bag of options to control resource's behavior.

name This property is required. String

The unique name of the resource.

args This property is required. [MetricAlarmArgs](#inputs)

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
var metricAlarmResource = new Aws.CloudWatch.MetricAlarm("metricAlarmResource", new()
{
    ActionsEnabled = false,
    AlarmActions = new[]
    {
        "string",
    },
    AlarmDescription = "string",
    ComparisonOperator = "string",
    DatapointsToAlarm = 0,
    Dimensions =
    {
        { "string", "string" },
    },
    EvaluateLowSampleCountPercentiles = "string",
    EvaluationCriteria = new Aws.CloudWatch.Inputs.MetricAlarmEvaluationCriteriaArgs
    {
        PromqlCriteria = new Aws.CloudWatch.Inputs.MetricAlarmEvaluationCriteriaPromqlCriteriaArgs
        {
            Query = "string",
            PendingPeriod = 0,
            RecoveryPeriod = 0,
        },
    },
    EvaluationInterval = 0,
    EvaluationPeriods = 0,
    ExtendedStatistic = "string",
    InsufficientDataActions = new[]
    {
        "string",
    },
    MetricName = "string",
    MetricQueries = new[]
    {
        new Aws.CloudWatch.Inputs.MetricAlarmMetricQueryArgs
        {
            Id = "string",
            AccountId = "string",
            Expression = "string",
            Label = "string",
            Metric = new Aws.CloudWatch.Inputs.MetricAlarmMetricQueryMetricArgs
            {
                MetricName = "string",
                Period = 0,
                Stat = "string",
                Dimensions =
                {
                    { "string", "string" },
                },
                Namespace = "string",
                Unit = "string",
            },
            Period = 0,
            ReturnData = false,
        },
    },
    Name = "string",
    Namespace = "string",
    OkActions = new[]
    {
        "string",
    },
    Period = 0,
    Region = "string",
    Statistic = "string",
    Tags =
    {
        { "string", "string" },
    },
    Threshold = 0,
    ThresholdMetricId = "string",
    TreatMissingData = "string",
    Unit = "string",
});
```

```go
example, err := cloudwatch.NewMetricAlarm(ctx, "metricAlarmResource", &cloudwatch.MetricAlarmArgs{
	ActionsEnabled: pulumi.Bool(false),
	AlarmActions: pulumi.Array{
		pulumi.Any("string"),
	},
	AlarmDescription:   pulumi.String("string"),
	ComparisonOperator: pulumi.String("string"),
	DatapointsToAlarm:  pulumi.Int(0),
	Dimensions: pulumi.StringMap{
		"string": pulumi.String("string"),
	},
	EvaluateLowSampleCountPercentiles: pulumi.String("string"),
	EvaluationCriteria: &cloudwatch.MetricAlarmEvaluationCriteriaArgs{
		PromqlCriteria: &cloudwatch.MetricAlarmEvaluationCriteriaPromqlCriteriaArgs{
			Query:          pulumi.String("string"),
			PendingPeriod:  pulumi.Int(0),
			RecoveryPeriod: pulumi.Int(0),
		},
	},
	EvaluationInterval: pulumi.Int(0),
	EvaluationPeriods:  pulumi.Int(0),
	ExtendedStatistic:  pulumi.String("string"),
	InsufficientDataActions: pulumi.Array{
		pulumi.Any("string"),
	},
	MetricName: pulumi.String("string"),
	MetricQueries: cloudwatch.MetricAlarmMetricQueryArray{
		&cloudwatch.MetricAlarmMetricQueryArgs{
			Id:         pulumi.String("string"),
			AccountId:  pulumi.String("string"),
			Expression: pulumi.String("string"),
			Label:      pulumi.String("string"),
			Metric: &cloudwatch.MetricAlarmMetricQueryMetricArgs{
				MetricName: pulumi.String("string"),
				Period:     pulumi.Int(0),
				Stat:       pulumi.String("string"),
				Dimensions: pulumi.StringMap{
					"string": pulumi.String("string"),
				},
				Namespace: pulumi.String("string"),
				Unit:      pulumi.String("string"),
			},
			Period:     pulumi.Int(0),
			ReturnData: pulumi.Bool(false),
		},
	},
	Name:      pulumi.String("string"),
	Namespace: pulumi.String("string"),
	OkActions: pulumi.Array{
		pulumi.Any("string"),
	},
	Period:    pulumi.Int(0),
	Region:    pulumi.String("string"),
	Statistic: pulumi.String("string"),
	Tags: pulumi.StringMap{
		"string": pulumi.String("string"),
	},
	Threshold:         pulumi.Float64(0),
	ThresholdMetricId: pulumi.String("string"),
	TreatMissingData:  pulumi.String("string"),
	Unit:              pulumi.String("string"),
})
```

```hcl
resource "aws_cloudwatch_metricalarm" "metricAlarmResource" {
  actions_enabled     = false
  alarm_actions       = ["string"]
  alarm_description   = "string"
  comparison_operator = "string"
  datapoints_to_alarm = 0
  dimensions = {
    "string" = "string"
  }
  evaluate_low_sample_count_percentiles = "string"
  evaluation_criteria = {
    promql_criteria = {
      query           = "string"
      pending_period  = 0
      recovery_period = 0
    }
  }
  evaluation_interval       = 0
  evaluation_periods        = 0
  extended_statistic        = "string"
  insufficient_data_actions = ["string"]
  metric_name               = "string"
  metric_queries {
    id         = "string"
    account_id = "string"
    expression = "string"
    label      = "string"
    metric = {
      metric_name = "string"
      period      = 0
      stat        = "string"
      dimensions = {
        "string" = "string"
      }
      namespace = "string"
      unit      = "string"
    }
    period      = 0
    return_data = false
  }
  name       = "string"
  namespace  = "string"
  ok_actions = ["string"]
  period     = 0
  region     = "string"
  statistic  = "string"
  tags = {
    "string" = "string"
  }
  threshold           = 0
  threshold_metric_id = "string"
  treat_missing_data  = "string"
  unit                = "string"
}
```

```java
var metricAlarmResource = new MetricAlarm("metricAlarmResource", MetricAlarmArgs.builder()
    .actionsEnabled(false)
    .alarmActions("string")
    .alarmDescription("string")
    .comparisonOperator("string")
    .datapointsToAlarm(0)
    .dimensions(Map.of("string", "string"))
    .evaluateLowSampleCountPercentiles("string")
    .evaluationCriteria(MetricAlarmEvaluationCriteriaArgs.builder()
        .promqlCriteria(MetricAlarmEvaluationCriteriaPromqlCriteriaArgs.builder()
            .query("string")
            .pendingPeriod(0)
            .recoveryPeriod(0)
            .build())
        .build())
    .evaluationInterval(0)
    .evaluationPeriods(0)
    .extendedStatistic("string")
    .insufficientDataActions("string")
    .metricName("string")
    .metricQueries(MetricAlarmMetricQueryArgs.builder()
        .id("string")
        .accountId("string")
        .expression("string")
        .label("string")
        .metric(MetricAlarmMetricQueryMetricArgs.builder()
            .metricName("string")
            .period(0)
            .stat("string")
            .dimensions(Map.of("string", "string"))
            .namespace("string")
            .unit("string")
            .build())
        .period(0)
        .returnData(false)
        .build())
    .name("string")
    .namespace("string")
    .okActions("string")
    .period(0)
    .region("string")
    .statistic("string")
    .tags(Map.of("string", "string"))
    .threshold(0.0)
    .thresholdMetricId("string")
    .treatMissingData("string")
    .unit("string")
    .build());
```

```python
metric_alarm_resource = aws.cloudwatch.MetricAlarm("metricAlarmResource",
    actions_enabled=False,
    alarm_actions=["string"],
    alarm_description="string",
    comparison_operator="string",
    datapoints_to_alarm=0,
    dimensions={
        "string": "string",
    },
    evaluate_low_sample_count_percentiles="string",
    evaluation_criteria={
        "promql_criteria": {
            "query": "string",
            "pending_period": 0,
            "recovery_period": 0,
        },
    },
    evaluation_interval=0,
    evaluation_periods=0,
    extended_statistic="string",
    insufficient_data_actions=["string"],
    metric_name="string",
    metric_queries=[{
        "id": "string",
        "account_id": "string",
        "expression": "string",
        "label": "string",
        "metric": {
            "metric_name": "string",
            "period": 0,
            "stat": "string",
            "dimensions": {
                "string": "string",
            },
            "namespace": "string",
            "unit": "string",
        },
        "period": 0,
        "return_data": False,
    }],
    name="string",
    namespace="string",
    ok_actions=["string"],
    period=0,
    region="string",
    statistic="string",
    tags={
        "string": "string",
    },
    threshold=float(0),
    threshold_metric_id="string",
    treat_missing_data="string",
    unit="string")
```

```typescript
const metricAlarmResource = new aws.cloudwatch.MetricAlarm("metricAlarmResource", {
    actionsEnabled: false,
    alarmActions: ["string"],
    alarmDescription: "string",
    comparisonOperator: "string",
    datapointsToAlarm: 0,
    dimensions: {
        string: "string",
    },
    evaluateLowSampleCountPercentiles: "string",
    evaluationCriteria: {
        promqlCriteria: {
            query: "string",
            pendingPeriod: 0,
            recoveryPeriod: 0,
        },
    },
    evaluationInterval: 0,
    evaluationPeriods: 0,
    extendedStatistic: "string",
    insufficientDataActions: ["string"],
    metricName: "string",
    metricQueries: [{
        id: "string",
        accountId: "string",
        expression: "string",
        label: "string",
        metric: {
            metricName: "string",
            period: 0,
            stat: "string",
            dimensions: {
                string: "string",
            },
            namespace: "string",
            unit: "string",
        },
        period: 0,
        returnData: false,
    }],
    name: "string",
    namespace: "string",
    okActions: ["string"],
    period: 0,
    region: "string",
    statistic: "string",
    tags: {
        string: "string",
    },
    threshold: 0,
    thresholdMetricId: "string",
    treatMissingData: "string",
    unit: "string",
});
```

```yaml
type: aws:cloudwatch:MetricAlarm
properties:
    actionsEnabled: false
    alarmActions:
        - string
    alarmDescription: string
    comparisonOperator: string
    datapointsToAlarm: 0
    dimensions:
        string: string
    evaluateLowSampleCountPercentiles: string
    evaluationCriteria:
        promqlCriteria:
            pendingPeriod: 0
            query: string
            recoveryPeriod: 0
    evaluationInterval: 0
    evaluationPeriods: 0
    extendedStatistic: string
    insufficientDataActions:
        - string
    metricName: string
    metricQueries:
        - accountId: string
          expression: string
          id: string
          label: string
          metric:
            dimensions:
                string: string
            metricName: string
            namespace: string
            period: 0
            stat: string
            unit: string
          period: 0
          returnData: false
    name: string
    namespace: string
    okActions:
        - string
    period: 0
    region: string
    statistic: string
    tags:
        string: string
    threshold: 0
    thresholdMetricId: string
    treatMissingData: string
    unit: string
```

## MetricAlarm Resource Properties[](#properties)

To learn more about resource properties and how to use them, see [Inputs and Outputs](/docs/intro/concepts/inputs-outputs) in the Architecture and Concepts docs.

### Inputs[](#inputs)

In Python, inputs that are objects can be passed either as [argument classes or as dictionary literals](/docs/languages-sdks/python/#inputs-and-outputs).

The MetricAlarm resource accepts the following [input](/docs/intro/concepts/inputs-outputs) properties:

[ActionsEnabled](#actionsenabled_csharp) bool

Indicates whether or not actions should be executed during any changes to the alarm's state. Defaults to `true`.

[AlarmActions](#alarmactions_csharp) List<string>

The list of actions to execute when this alarm transitions into an ALARM state from any other state. Each action is specified as an Amazon Resource Name (ARN).

[AlarmDescription](#alarmdescription_csharp) string

The description for the alarm.

[ComparisonOperator](#comparisonoperator_csharp) string

The arithmetic operation to use when comparing the specified Statistic and Threshold. The specified Statistic value is used as the first operand. Either of the following is supported: `GreaterThanOrEqualToThreshold`, `GreaterThanThreshold`, `LessThanThreshold`, `LessThanOrEqualToThreshold`. Additionally, the values `LessThanLowerOrGreaterThanUpperThreshold`, `LessThanLowerThreshold`, and `GreaterThanUpperThreshold` are used only for alarms based on anomaly detection models.

[DatapointsToAlarm](#datapointstoalarm_csharp) int

The number of data points that must be breaching to trigger the alarm.

[Dimensions](#dimensions_csharp) Dictionary<string, string>

The dimensions for the alarm's associated metric. For the list of available dimensions see the AWS documentation [here](http://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/CW_Support_For_AWS.html).

[EvaluateLowSampleCountPercentiles](#evaluatelowsamplecountpercentiles_csharp) string

Used only for alarms based on percentiles. If you specify `ignore`, the alarm state will not change during periods with too few data points to be statistically significant. If you specify `evaluate` or omit this parameter, the alarm will always be evaluated and possibly change state no matter how many data points are available. The following values are supported: `ignore`, and `evaluate`.

[EvaluationCriteria](#evaluationcriteria_csharp) [MetricAlarmEvaluationCriteria](#metricalarmevaluationcriteria)

The evaluation criteria for PromQL alarms. Cannot be used with traditional metric alarm parameters.

[EvaluationInterval](#evaluationinterval_csharp) int

The frequency, in seconds, at which the alarm is evaluated. Valid values are `10`, `20`, `30`, and any multiple of `60`. Required when using `evaluationCriteria`.

[EvaluationPeriods](#evaluationperiods_csharp) int

The number of periods over which data is compared to the specified threshold. Required for traditional metric alarms.

[ExtendedStatistic](#extendedstatistic_csharp) string

The percentile statistic for the metric associated with the alarm. Specify a value between p0.0 and p100.

[InsufficientDataActions](#insufficientdataactions_csharp) List<string>

The list of actions to execute when this alarm transitions into an INSUFFICIENT\_DATA state from any other state. Each action is specified as an Amazon Resource Name (ARN).

[MetricName](#metricname_csharp) string

The name for the alarm's associated metric. See docs for [supported metrics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/CW_Support_For_AWS.html).

[MetricQueries](#metricqueries_csharp) [List<MetricAlarmMetricQuery>](#metricalarmmetricquery)

Enables you to create an alarm based on a metric math expression. You may specify at most 20.

[Name](#name_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

The descriptive name for the alarm. This name must be unique within the user's AWS account

[Namespace](#namespace_csharp) string

The namespace for the alarm's associated metric. See docs for the [list of namespaces](https://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/aws-namespaces.html). See docs for [supported metrics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/CW_Support_For_AWS.html).

[OkActions](#okactions_csharp) List<string>

The list of actions to execute when this alarm transitions into an OK state from any other state. Each action is specified as an Amazon Resource Name (ARN).

[Period](#period_csharp) int

The period in seconds over which the specified `statistic` is applied. Valid values are `10`, `20`, `30`, or any multiple of `60`.

[Region](#region_csharp) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[Statistic](#statistic_csharp) string

The statistic to apply to the alarm's associated metric. Either of the following is supported: `SampleCount`, `Average`, `Sum`, `Minimum`, `Maximum`

[Tags](#tags_csharp) Dictionary<string, string>

A map of tags to assign to the resource. .If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

See [related part of AWS Docs](https://docs.aws.amazon.com/AmazonCloudWatch/latest/APIReference/API_PutMetricAlarm.html) for details about valid values.

> **NOTE:** If you specify at least one `metricQuery`, you may not specify a `metricName`, `namespace`, `period` or `statistic`. If you do not specify a `metricQuery`, you must specify each of these (although you may use `extendedStatistic` instead of `statistic`).

[Threshold](#threshold_csharp) double

The value against which the specified statistic is compared. This parameter is required for alarms based on static thresholds, but should not be used for alarms based on anomaly detection models.

[ThresholdMetricId](#thresholdmetricid_csharp) string

If this is an alarm based on an anomaly detection model, make this value match the ID of the ANOMALY\_DETECTION\_BAND function.

[TreatMissingData](#treatmissingdata_csharp) string

Sets how this alarm is to handle missing data points. The following values are supported: `missing`, `ignore`, `breaching` and `notBreaching`. Defaults to `missing`.

[Unit](#unit_csharp) string

The unit for the alarm's associated metric.

[ActionsEnabled](#actionsenabled_go) bool

Indicates whether or not actions should be executed during any changes to the alarm's state. Defaults to `true`.

[AlarmActions](#alarmactions_go) \[\]interface{}

The list of actions to execute when this alarm transitions into an ALARM state from any other state. Each action is specified as an Amazon Resource Name (ARN).

[AlarmDescription](#alarmdescription_go) string

The description for the alarm.

[ComparisonOperator](#comparisonoperator_go) string

The arithmetic operation to use when comparing the specified Statistic and Threshold. The specified Statistic value is used as the first operand. Either of the following is supported: `GreaterThanOrEqualToThreshold`, `GreaterThanThreshold`, `LessThanThreshold`, `LessThanOrEqualToThreshold`. Additionally, the values `LessThanLowerOrGreaterThanUpperThreshold`, `LessThanLowerThreshold`, and `GreaterThanUpperThreshold` are used only for alarms based on anomaly detection models.

[DatapointsToAlarm](#datapointstoalarm_go) int

The number of data points that must be breaching to trigger the alarm.

[Dimensions](#dimensions_go) map\[string\]string

The dimensions for the alarm's associated metric. For the list of available dimensions see the AWS documentation [here](http://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/CW_Support_For_AWS.html).

[EvaluateLowSampleCountPercentiles](#evaluatelowsamplecountpercentiles_go) string

Used only for alarms based on percentiles. If you specify `ignore`, the alarm state will not change during periods with too few data points to be statistically significant. If you specify `evaluate` or omit this parameter, the alarm will always be evaluated and possibly change state no matter how many data points are available. The following values are supported: `ignore`, and `evaluate`.

[EvaluationCriteria](#evaluationcriteria_go) [MetricAlarmEvaluationCriteriaArgs](#metricalarmevaluationcriteria)

The evaluation criteria for PromQL alarms. Cannot be used with traditional metric alarm parameters.

[EvaluationInterval](#evaluationinterval_go) int

The frequency, in seconds, at which the alarm is evaluated. Valid values are `10`, `20`, `30`, and any multiple of `60`. Required when using `evaluationCriteria`.

[EvaluationPeriods](#evaluationperiods_go) int

The number of periods over which data is compared to the specified threshold. Required for traditional metric alarms.

[ExtendedStatistic](#extendedstatistic_go) string

The percentile statistic for the metric associated with the alarm. Specify a value between p0.0 and p100.

[InsufficientDataActions](#insufficientdataactions_go) \[\]interface{}

The list of actions to execute when this alarm transitions into an INSUFFICIENT\_DATA state from any other state. Each action is specified as an Amazon Resource Name (ARN).

[MetricName](#metricname_go) string

The name for the alarm's associated metric. See docs for [supported metrics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/CW_Support_For_AWS.html).

[MetricQueries](#metricqueries_go) [\[\]MetricAlarmMetricQueryArgs](#metricalarmmetricquery)

Enables you to create an alarm based on a metric math expression. You may specify at most 20.

[Name](#name_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

The descriptive name for the alarm. This name must be unique within the user's AWS account

[Namespace](#namespace_go) string

The namespace for the alarm's associated metric. See docs for the [list of namespaces](https://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/aws-namespaces.html). See docs for [supported metrics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/CW_Support_For_AWS.html).

[OkActions](#okactions_go) \[\]interface{}

The list of actions to execute when this alarm transitions into an OK state from any other state. Each action is specified as an Amazon Resource Name (ARN).

[Period](#period_go) int

The period in seconds over which the specified `statistic` is applied. Valid values are `10`, `20`, `30`, or any multiple of `60`.

[Region](#region_go) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[Statistic](#statistic_go) string

The statistic to apply to the alarm's associated metric. Either of the following is supported: `SampleCount`, `Average`, `Sum`, `Minimum`, `Maximum`

[Tags](#tags_go) map\[string\]string

A map of tags to assign to the resource. .If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

See [related part of AWS Docs](https://docs.aws.amazon.com/AmazonCloudWatch/latest/APIReference/API_PutMetricAlarm.html) for details about valid values.

> **NOTE:** If you specify at least one `metricQuery`, you may not specify a `metricName`, `namespace`, `period` or `statistic`. If you do not specify a `metricQuery`, you must specify each of these (although you may use `extendedStatistic` instead of `statistic`).

[Threshold](#threshold_go) float64

The value against which the specified statistic is compared. This parameter is required for alarms based on static thresholds, but should not be used for alarms based on anomaly detection models.

[ThresholdMetricId](#thresholdmetricid_go) string

If this is an alarm based on an anomaly detection model, make this value match the ID of the ANOMALY\_DETECTION\_BAND function.

[TreatMissingData](#treatmissingdata_go) string

Sets how this alarm is to handle missing data points. The following values are supported: `missing`, `ignore`, `breaching` and `notBreaching`. Defaults to `missing`.

[Unit](#unit_go) string

The unit for the alarm's associated metric.

[actions\_enabled](#actions_enabled_hcl) bool

Indicates whether or not actions should be executed during any changes to the alarm's state. Defaults to `true`.

[alarm\_actions](#alarm_actions_hcl) list(string | )

The list of actions to execute when this alarm transitions into an ALARM state from any other state. Each action is specified as an Amazon Resource Name (ARN).

[alarm\_description](#alarm_description_hcl) string

The description for the alarm.

[comparison\_operator](#comparison_operator_hcl) string

The arithmetic operation to use when comparing the specified Statistic and Threshold. The specified Statistic value is used as the first operand. Either of the following is supported: `GreaterThanOrEqualToThreshold`, `GreaterThanThreshold`, `LessThanThreshold`, `LessThanOrEqualToThreshold`. Additionally, the values `LessThanLowerOrGreaterThanUpperThreshold`, `LessThanLowerThreshold`, and `GreaterThanUpperThreshold` are used only for alarms based on anomaly detection models.

[datapoints\_to\_alarm](#datapoints_to_alarm_hcl) number

The number of data points that must be breaching to trigger the alarm.

[dimensions](#dimensions_hcl) map(string)

The dimensions for the alarm's associated metric. For the list of available dimensions see the AWS documentation [here](http://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/CW_Support_For_AWS.html).

[evaluate\_low\_sample\_count\_percentiles](#evaluate_low_sample_count_percentiles_hcl) string

Used only for alarms based on percentiles. If you specify `ignore`, the alarm state will not change during periods with too few data points to be statistically significant. If you specify `evaluate` or omit this parameter, the alarm will always be evaluated and possibly change state no matter how many data points are available. The following values are supported: `ignore`, and `evaluate`.

[evaluation\_criteria](#evaluation_criteria_hcl) [object](#metricalarmevaluationcriteria)

The evaluation criteria for PromQL alarms. Cannot be used with traditional metric alarm parameters.

[evaluation\_interval](#evaluation_interval_hcl) number

The frequency, in seconds, at which the alarm is evaluated. Valid values are `10`, `20`, `30`, and any multiple of `60`. Required when using `evaluationCriteria`.

[evaluation\_periods](#evaluation_periods_hcl) number

The number of periods over which data is compared to the specified threshold. Required for traditional metric alarms.

[extended\_statistic](#extended_statistic_hcl) string

The percentile statistic for the metric associated with the alarm. Specify a value between p0.0 and p100.

[insufficient\_data\_actions](#insufficient_data_actions_hcl) list(string | )

The list of actions to execute when this alarm transitions into an INSUFFICIENT\_DATA state from any other state. Each action is specified as an Amazon Resource Name (ARN).

[metric\_name](#metric_name_hcl) string

The name for the alarm's associated metric. See docs for [supported metrics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/CW_Support_For_AWS.html).

[metric\_queries](#metric_queries_hcl) [list(object)](#metricalarmmetricquery)

Enables you to create an alarm based on a metric math expression. You may specify at most 20.

[name](#name_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

The descriptive name for the alarm. This name must be unique within the user's AWS account

[namespace](#namespace_hcl) string

The namespace for the alarm's associated metric. See docs for the [list of namespaces](https://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/aws-namespaces.html). See docs for [supported metrics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/CW_Support_For_AWS.html).

[ok\_actions](#ok_actions_hcl) list(string | )

The list of actions to execute when this alarm transitions into an OK state from any other state. Each action is specified as an Amazon Resource Name (ARN).

[period](#period_hcl) number

The period in seconds over which the specified `statistic` is applied. Valid values are `10`, `20`, `30`, or any multiple of `60`.

[region](#region_hcl) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[statistic](#statistic_hcl) string

The statistic to apply to the alarm's associated metric. Either of the following is supported: `SampleCount`, `Average`, `Sum`, `Minimum`, `Maximum`

[tags](#tags_hcl) map(string)

A map of tags to assign to the resource. .If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

See [related part of AWS Docs](https://docs.aws.amazon.com/AmazonCloudWatch/latest/APIReference/API_PutMetricAlarm.html) for details about valid values.

> **NOTE:** If you specify at least one `metricQuery`, you may not specify a `metricName`, `namespace`, `period` or `statistic`. If you do not specify a `metricQuery`, you must specify each of these (although you may use `extendedStatistic` instead of `statistic`).

[threshold](#threshold_hcl) number

The value against which the specified statistic is compared. This parameter is required for alarms based on static thresholds, but should not be used for alarms based on anomaly detection models.

[threshold\_metric\_id](#threshold_metric_id_hcl) string

If this is an alarm based on an anomaly detection model, make this value match the ID of the ANOMALY\_DETECTION\_BAND function.

[treat\_missing\_data](#treat_missing_data_hcl) string

Sets how this alarm is to handle missing data points. The following values are supported: `missing`, `ignore`, `breaching` and `notBreaching`. Defaults to `missing`.

[unit](#unit_hcl) string

The unit for the alarm's associated metric.

[actionsEnabled](#actionsenabled_java) Boolean

Indicates whether or not actions should be executed during any changes to the alarm's state. Defaults to `true`.

[alarmActions](#alarmactions_java) List<String>

The list of actions to execute when this alarm transitions into an ALARM state from any other state. Each action is specified as an Amazon Resource Name (ARN).

[alarmDescription](#alarmdescription_java) String

The description for the alarm.

[comparisonOperator](#comparisonoperator_java) String

The arithmetic operation to use when comparing the specified Statistic and Threshold. The specified Statistic value is used as the first operand. Either of the following is supported: `GreaterThanOrEqualToThreshold`, `GreaterThanThreshold`, `LessThanThreshold`, `LessThanOrEqualToThreshold`. Additionally, the values `LessThanLowerOrGreaterThanUpperThreshold`, `LessThanLowerThreshold`, and `GreaterThanUpperThreshold` are used only for alarms based on anomaly detection models.

[datapointsToAlarm](#datapointstoalarm_java) Integer

The number of data points that must be breaching to trigger the alarm.

[dimensions](#dimensions_java) Map<String,String>

The dimensions for the alarm's associated metric. For the list of available dimensions see the AWS documentation [here](http://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/CW_Support_For_AWS.html).

[evaluateLowSampleCountPercentiles](#evaluatelowsamplecountpercentiles_java) String

Used only for alarms based on percentiles. If you specify `ignore`, the alarm state will not change during periods with too few data points to be statistically significant. If you specify `evaluate` or omit this parameter, the alarm will always be evaluated and possibly change state no matter how many data points are available. The following values are supported: `ignore`, and `evaluate`.

[evaluationCriteria](#evaluationcriteria_java) [MetricAlarmEvaluationCriteria](#metricalarmevaluationcriteria)

The evaluation criteria for PromQL alarms. Cannot be used with traditional metric alarm parameters.

[evaluationInterval](#evaluationinterval_java) Integer

The frequency, in seconds, at which the alarm is evaluated. Valid values are `10`, `20`, `30`, and any multiple of `60`. Required when using `evaluationCriteria`.

[evaluationPeriods](#evaluationperiods_java) Integer

The number of periods over which data is compared to the specified threshold. Required for traditional metric alarms.

[extendedStatistic](#extendedstatistic_java) String

The percentile statistic for the metric associated with the alarm. Specify a value between p0.0 and p100.

[insufficientDataActions](#insufficientdataactions_java) List<String>

The list of actions to execute when this alarm transitions into an INSUFFICIENT\_DATA state from any other state. Each action is specified as an Amazon Resource Name (ARN).

[metricName](#metricname_java) String

The name for the alarm's associated metric. See docs for [supported metrics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/CW_Support_For_AWS.html).

[metricQueries](#metricqueries_java) [List<MetricAlarmMetricQuery>](#metricalarmmetricquery)

Enables you to create an alarm based on a metric math expression. You may specify at most 20.

[name](#name_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

The descriptive name for the alarm. This name must be unique within the user's AWS account

[namespace](#namespace_java) String

The namespace for the alarm's associated metric. See docs for the [list of namespaces](https://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/aws-namespaces.html). See docs for [supported metrics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/CW_Support_For_AWS.html).

[okActions](#okactions_java) List<String>

The list of actions to execute when this alarm transitions into an OK state from any other state. Each action is specified as an Amazon Resource Name (ARN).

[period](#period_java) Integer

The period in seconds over which the specified `statistic` is applied. Valid values are `10`, `20`, `30`, or any multiple of `60`.

[region](#region_java) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[statistic](#statistic_java) String

The statistic to apply to the alarm's associated metric. Either of the following is supported: `SampleCount`, `Average`, `Sum`, `Minimum`, `Maximum`

[tags](#tags_java) Map<String,String>

A map of tags to assign to the resource. .If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

See [related part of AWS Docs](https://docs.aws.amazon.com/AmazonCloudWatch/latest/APIReference/API_PutMetricAlarm.html) for details about valid values.

> **NOTE:** If you specify at least one `metricQuery`, you may not specify a `metricName`, `namespace`, `period` or `statistic`. If you do not specify a `metricQuery`, you must specify each of these (although you may use `extendedStatistic` instead of `statistic`).

[threshold](#threshold_java) Double

The value against which the specified statistic is compared. This parameter is required for alarms based on static thresholds, but should not be used for alarms based on anomaly detection models.

[thresholdMetricId](#thresholdmetricid_java) String

If this is an alarm based on an anomaly detection model, make this value match the ID of the ANOMALY\_DETECTION\_BAND function.

[treatMissingData](#treatmissingdata_java) String

Sets how this alarm is to handle missing data points. The following values are supported: `missing`, `ignore`, `breaching` and `notBreaching`. Defaults to `missing`.

[unit](#unit_java) String

The unit for the alarm's associated metric.

[actionsEnabled](#actionsenabled_nodejs) boolean

Indicates whether or not actions should be executed during any changes to the alarm's state. Defaults to `true`.

[alarmActions](#alarmactions_nodejs) (string | Topic)\[\]

The list of actions to execute when this alarm transitions into an ALARM state from any other state. Each action is specified as an Amazon Resource Name (ARN).

[alarmDescription](#alarmdescription_nodejs) string

The description for the alarm.

[comparisonOperator](#comparisonoperator_nodejs) string

The arithmetic operation to use when comparing the specified Statistic and Threshold. The specified Statistic value is used as the first operand. Either of the following is supported: `GreaterThanOrEqualToThreshold`, `GreaterThanThreshold`, `LessThanThreshold`, `LessThanOrEqualToThreshold`. Additionally, the values `LessThanLowerOrGreaterThanUpperThreshold`, `LessThanLowerThreshold`, and `GreaterThanUpperThreshold` are used only for alarms based on anomaly detection models.

[datapointsToAlarm](#datapointstoalarm_nodejs) number

The number of data points that must be breaching to trigger the alarm.

[dimensions](#dimensions_nodejs) {\[key: string\]: string}

The dimensions for the alarm's associated metric. For the list of available dimensions see the AWS documentation [here](http://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/CW_Support_For_AWS.html).

[evaluateLowSampleCountPercentiles](#evaluatelowsamplecountpercentiles_nodejs) string

Used only for alarms based on percentiles. If you specify `ignore`, the alarm state will not change during periods with too few data points to be statistically significant. If you specify `evaluate` or omit this parameter, the alarm will always be evaluated and possibly change state no matter how many data points are available. The following values are supported: `ignore`, and `evaluate`.

[evaluationCriteria](#evaluationcriteria_nodejs) [MetricAlarmEvaluationCriteria](#metricalarmevaluationcriteria)

The evaluation criteria for PromQL alarms. Cannot be used with traditional metric alarm parameters.

[evaluationInterval](#evaluationinterval_nodejs) number

The frequency, in seconds, at which the alarm is evaluated. Valid values are `10`, `20`, `30`, and any multiple of `60`. Required when using `evaluationCriteria`.

[evaluationPeriods](#evaluationperiods_nodejs) number

The number of periods over which data is compared to the specified threshold. Required for traditional metric alarms.

[extendedStatistic](#extendedstatistic_nodejs) string

The percentile statistic for the metric associated with the alarm. Specify a value between p0.0 and p100.

[insufficientDataActions](#insufficientdataactions_nodejs) (string | Topic)\[\]

The list of actions to execute when this alarm transitions into an INSUFFICIENT\_DATA state from any other state. Each action is specified as an Amazon Resource Name (ARN).

[metricName](#metricname_nodejs) string

The name for the alarm's associated metric. See docs for [supported metrics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/CW_Support_For_AWS.html).

[metricQueries](#metricqueries_nodejs) [MetricAlarmMetricQuery\[\]](#metricalarmmetricquery)

Enables you to create an alarm based on a metric math expression. You may specify at most 20.

[name](#name_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

The descriptive name for the alarm. This name must be unique within the user's AWS account

[namespace](#namespace_nodejs) string

The namespace for the alarm's associated metric. See docs for the [list of namespaces](https://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/aws-namespaces.html). See docs for [supported metrics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/CW_Support_For_AWS.html).

[okActions](#okactions_nodejs) (string | Topic)\[\]

The list of actions to execute when this alarm transitions into an OK state from any other state. Each action is specified as an Amazon Resource Name (ARN).

[period](#period_nodejs) number

The period in seconds over which the specified `statistic` is applied. Valid values are `10`, `20`, `30`, or any multiple of `60`.

[region](#region_nodejs) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[statistic](#statistic_nodejs) string

The statistic to apply to the alarm's associated metric. Either of the following is supported: `SampleCount`, `Average`, `Sum`, `Minimum`, `Maximum`

[tags](#tags_nodejs) {\[key: string\]: string}

A map of tags to assign to the resource. .If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

See [related part of AWS Docs](https://docs.aws.amazon.com/AmazonCloudWatch/latest/APIReference/API_PutMetricAlarm.html) for details about valid values.

> **NOTE:** If you specify at least one `metricQuery`, you may not specify a `metricName`, `namespace`, `period` or `statistic`. If you do not specify a `metricQuery`, you must specify each of these (although you may use `extendedStatistic` instead of `statistic`).

[threshold](#threshold_nodejs) number

The value against which the specified statistic is compared. This parameter is required for alarms based on static thresholds, but should not be used for alarms based on anomaly detection models.

[thresholdMetricId](#thresholdmetricid_nodejs) string

If this is an alarm based on an anomaly detection model, make this value match the ID of the ANOMALY\_DETECTION\_BAND function.

[treatMissingData](#treatmissingdata_nodejs) string

Sets how this alarm is to handle missing data points. The following values are supported: `missing`, `ignore`, `breaching` and `notBreaching`. Defaults to `missing`.

[unit](#unit_nodejs) string

The unit for the alarm's associated metric.

[actions\_enabled](#actions_enabled_python) bool

Indicates whether or not actions should be executed during any changes to the alarm's state. Defaults to `true`.

[alarm\_actions](#alarm_actions_python) Sequence\[str\]

The list of actions to execute when this alarm transitions into an ALARM state from any other state. Each action is specified as an Amazon Resource Name (ARN).

[alarm\_description](#alarm_description_python) str

The description for the alarm.

[comparison\_operator](#comparison_operator_python) str

The arithmetic operation to use when comparing the specified Statistic and Threshold. The specified Statistic value is used as the first operand. Either of the following is supported: `GreaterThanOrEqualToThreshold`, `GreaterThanThreshold`, `LessThanThreshold`, `LessThanOrEqualToThreshold`. Additionally, the values `LessThanLowerOrGreaterThanUpperThreshold`, `LessThanLowerThreshold`, and `GreaterThanUpperThreshold` are used only for alarms based on anomaly detection models.

[datapoints\_to\_alarm](#datapoints_to_alarm_python) int

The number of data points that must be breaching to trigger the alarm.

[dimensions](#dimensions_python) Mapping\[str, str\]

The dimensions for the alarm's associated metric. For the list of available dimensions see the AWS documentation [here](http://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/CW_Support_For_AWS.html).

[evaluate\_low\_sample\_count\_percentiles](#evaluate_low_sample_count_percentiles_python) str

Used only for alarms based on percentiles. If you specify `ignore`, the alarm state will not change during periods with too few data points to be statistically significant. If you specify `evaluate` or omit this parameter, the alarm will always be evaluated and possibly change state no matter how many data points are available. The following values are supported: `ignore`, and `evaluate`.

[evaluation\_criteria](#evaluation_criteria_python) [MetricAlarmEvaluationCriteriaArgs](#metricalarmevaluationcriteria)

The evaluation criteria for PromQL alarms. Cannot be used with traditional metric alarm parameters.

[evaluation\_interval](#evaluation_interval_python) int

The frequency, in seconds, at which the alarm is evaluated. Valid values are `10`, `20`, `30`, and any multiple of `60`. Required when using `evaluationCriteria`.

[evaluation\_periods](#evaluation_periods_python) int

The number of periods over which data is compared to the specified threshold. Required for traditional metric alarms.

[extended\_statistic](#extended_statistic_python) str

The percentile statistic for the metric associated with the alarm. Specify a value between p0.0 and p100.

[insufficient\_data\_actions](#insufficient_data_actions_python) Sequence\[str\]

The list of actions to execute when this alarm transitions into an INSUFFICIENT\_DATA state from any other state. Each action is specified as an Amazon Resource Name (ARN).

[metric\_name](#metric_name_python) str

The name for the alarm's associated metric. See docs for [supported metrics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/CW_Support_For_AWS.html).

[metric\_queries](#metric_queries_python) [Sequence\[MetricAlarmMetricQueryArgs\]](#metricalarmmetricquery)

Enables you to create an alarm based on a metric math expression. You may specify at most 20.

[name](#name_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

The descriptive name for the alarm. This name must be unique within the user's AWS account

[namespace](#namespace_python) str

The namespace for the alarm's associated metric. See docs for the [list of namespaces](https://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/aws-namespaces.html). See docs for [supported metrics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/CW_Support_For_AWS.html).

[ok\_actions](#ok_actions_python) Sequence\[str\]

The list of actions to execute when this alarm transitions into an OK state from any other state. Each action is specified as an Amazon Resource Name (ARN).

[period](#period_python) int

The period in seconds over which the specified `statistic` is applied. Valid values are `10`, `20`, `30`, or any multiple of `60`.

[region](#region_python) str

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[statistic](#statistic_python) str

The statistic to apply to the alarm's associated metric. Either of the following is supported: `SampleCount`, `Average`, `Sum`, `Minimum`, `Maximum`

[tags](#tags_python) Mapping\[str, str\]

A map of tags to assign to the resource. .If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

See [related part of AWS Docs](https://docs.aws.amazon.com/AmazonCloudWatch/latest/APIReference/API_PutMetricAlarm.html) for details about valid values.

> **NOTE:** If you specify at least one `metricQuery`, you may not specify a `metricName`, `namespace`, `period` or `statistic`. If you do not specify a `metricQuery`, you must specify each of these (although you may use `extendedStatistic` instead of `statistic`).

[threshold](#threshold_python) float

The value against which the specified statistic is compared. This parameter is required for alarms based on static thresholds, but should not be used for alarms based on anomaly detection models.

[threshold\_metric\_id](#threshold_metric_id_python) str

If this is an alarm based on an anomaly detection model, make this value match the ID of the ANOMALY\_DETECTION\_BAND function.

[treat\_missing\_data](#treat_missing_data_python) str

Sets how this alarm is to handle missing data points. The following values are supported: `missing`, `ignore`, `breaching` and `notBreaching`. Defaults to `missing`.

[unit](#unit_python) str

The unit for the alarm's associated metric.

[actionsEnabled](#actionsenabled_yaml) Boolean

Indicates whether or not actions should be executed during any changes to the alarm's state. Defaults to `true`.

[alarmActions](#alarmactions_yaml) List<String | >

The list of actions to execute when this alarm transitions into an ALARM state from any other state. Each action is specified as an Amazon Resource Name (ARN).

[alarmDescription](#alarmdescription_yaml) String

The description for the alarm.

[comparisonOperator](#comparisonoperator_yaml) String

The arithmetic operation to use when comparing the specified Statistic and Threshold. The specified Statistic value is used as the first operand. Either of the following is supported: `GreaterThanOrEqualToThreshold`, `GreaterThanThreshold`, `LessThanThreshold`, `LessThanOrEqualToThreshold`. Additionally, the values `LessThanLowerOrGreaterThanUpperThreshold`, `LessThanLowerThreshold`, and `GreaterThanUpperThreshold` are used only for alarms based on anomaly detection models.

[datapointsToAlarm](#datapointstoalarm_yaml) Number

The number of data points that must be breaching to trigger the alarm.

[dimensions](#dimensions_yaml) Map<String>

The dimensions for the alarm's associated metric. For the list of available dimensions see the AWS documentation [here](http://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/CW_Support_For_AWS.html).

[evaluateLowSampleCountPercentiles](#evaluatelowsamplecountpercentiles_yaml) String

Used only for alarms based on percentiles. If you specify `ignore`, the alarm state will not change during periods with too few data points to be statistically significant. If you specify `evaluate` or omit this parameter, the alarm will always be evaluated and possibly change state no matter how many data points are available. The following values are supported: `ignore`, and `evaluate`.

[evaluationCriteria](#evaluationcriteria_yaml) [Property Map](#metricalarmevaluationcriteria)

The evaluation criteria for PromQL alarms. Cannot be used with traditional metric alarm parameters.

[evaluationInterval](#evaluationinterval_yaml) Number

The frequency, in seconds, at which the alarm is evaluated. Valid values are `10`, `20`, `30`, and any multiple of `60`. Required when using `evaluationCriteria`.

[evaluationPeriods](#evaluationperiods_yaml) Number

The number of periods over which data is compared to the specified threshold. Required for traditional metric alarms.

[extendedStatistic](#extendedstatistic_yaml) String

The percentile statistic for the metric associated with the alarm. Specify a value between p0.0 and p100.

[insufficientDataActions](#insufficientdataactions_yaml) List<String | >

The list of actions to execute when this alarm transitions into an INSUFFICIENT\_DATA state from any other state. Each action is specified as an Amazon Resource Name (ARN).

[metricName](#metricname_yaml) String

The name for the alarm's associated metric. See docs for [supported metrics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/CW_Support_For_AWS.html).

[metricQueries](#metricqueries_yaml) [List<Property Map>](#metricalarmmetricquery)

Enables you to create an alarm based on a metric math expression. You may specify at most 20.

[name](#name_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

The descriptive name for the alarm. This name must be unique within the user's AWS account

[namespace](#namespace_yaml) String

The namespace for the alarm's associated metric. See docs for the [list of namespaces](https://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/aws-namespaces.html). See docs for [supported metrics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/CW_Support_For_AWS.html).

[okActions](#okactions_yaml) List<String | >

The list of actions to execute when this alarm transitions into an OK state from any other state. Each action is specified as an Amazon Resource Name (ARN).

[period](#period_yaml) Number

The period in seconds over which the specified `statistic` is applied. Valid values are `10`, `20`, `30`, or any multiple of `60`.

[region](#region_yaml) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[statistic](#statistic_yaml) String

The statistic to apply to the alarm's associated metric. Either of the following is supported: `SampleCount`, `Average`, `Sum`, `Minimum`, `Maximum`

[tags](#tags_yaml) Map<String>

A map of tags to assign to the resource. .If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

See [related part of AWS Docs](https://docs.aws.amazon.com/AmazonCloudWatch/latest/APIReference/API_PutMetricAlarm.html) for details about valid values.

> **NOTE:** If you specify at least one `metricQuery`, you may not specify a `metricName`, `namespace`, `period` or `statistic`. If you do not specify a `metricQuery`, you must specify each of these (although you may use `extendedStatistic` instead of `statistic`).

[threshold](#threshold_yaml) Number

The value against which the specified statistic is compared. This parameter is required for alarms based on static thresholds, but should not be used for alarms based on anomaly detection models.

[thresholdMetricId](#thresholdmetricid_yaml) String

If this is an alarm based on an anomaly detection model, make this value match the ID of the ANOMALY\_DETECTION\_BAND function.

[treatMissingData](#treatmissingdata_yaml) String

Sets how this alarm is to handle missing data points. The following values are supported: `missing`, `ignore`, `breaching` and `notBreaching`. Defaults to `missing`.

[unit](#unit_yaml) String

The unit for the alarm's associated metric.

### Outputs[](#outputs)

All [input](#inputs) properties are implicitly available as output properties. Additionally, the MetricAlarm resource produces the following output properties:

[Arn](#arn_csharp) string

The ARN of the CloudWatch Metric Alarm.

[Id](#id_csharp) string

The provider-assigned unique ID for this managed resource.

[TagsAll](#tagsall_csharp) Dictionary<string, string>

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[Arn](#arn_go) string

The ARN of the CloudWatch Metric Alarm.

[Id](#id_go) string

The provider-assigned unique ID for this managed resource.

[TagsAll](#tagsall_go) map\[string\]string

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[arn](#arn_hcl) string

The ARN of the CloudWatch Metric Alarm.

[id](#id_hcl) string

The provider-assigned unique ID for this managed resource.

[tags\_all](#tags_all_hcl) map(string)

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[arn](#arn_java) String

The ARN of the CloudWatch Metric Alarm.

[id](#id_java) String

The provider-assigned unique ID for this managed resource.

[tagsAll](#tagsall_java) Map<String,String>

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[arn](#arn_nodejs) string

The ARN of the CloudWatch Metric Alarm.

[id](#id_nodejs) string

The provider-assigned unique ID for this managed resource.

[tagsAll](#tagsall_nodejs) {\[key: string\]: string}

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[arn](#arn_python) str

The ARN of the CloudWatch Metric Alarm.

[id](#id_python) str

The provider-assigned unique ID for this managed resource.

[tags\_all](#tags_all_python) Mapping\[str, str\]

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[arn](#arn_yaml) String

The ARN of the CloudWatch Metric Alarm.

[id](#id_yaml) String

The provider-assigned unique ID for this managed resource.

[tagsAll](#tagsall_yaml) Map<String>

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

## Look up Existing MetricAlarm Resource[](#look-up)

Get an existing MetricAlarm resource’s state with the given name, ID, and optional extra properties used to qualify the lookup.

-   TypeScript
-   Python
-   Go
-   C#
-   Java
-   YAML
-   HCL PREVIEW

```typescript
public static get(name: string, id: Input<ID>, state?: MetricAlarmState, opts?: CustomResourceOptions): MetricAlarm
```

```python
@staticmethod
def get(resource_name: str,
        id: str,
        opts: Optional[ResourceOptions] = None,
        actions_enabled: Optional[bool] = None,
        alarm_actions: Optional[Sequence[str]] = None,
        alarm_description: Optional[str] = None,
        arn: Optional[str] = None,
        comparison_operator: Optional[str] = None,
        datapoints_to_alarm: Optional[int] = None,
        dimensions: Optional[Mapping[str, str]] = None,
        evaluate_low_sample_count_percentiles: Optional[str] = None,
        evaluation_criteria: Optional[MetricAlarmEvaluationCriteriaArgs] = None,
        evaluation_interval: Optional[int] = None,
        evaluation_periods: Optional[int] = None,
        extended_statistic: Optional[str] = None,
        insufficient_data_actions: Optional[Sequence[str]] = None,
        metric_name: Optional[str] = None,
        metric_queries: Optional[Sequence[MetricAlarmMetricQueryArgs]] = None,
        name: Optional[str] = None,
        namespace: Optional[str] = None,
        ok_actions: Optional[Sequence[str]] = None,
        period: Optional[int] = None,
        region: Optional[str] = None,
        statistic: Optional[str] = None,
        tags: Optional[Mapping[str, str]] = None,
        tags_all: Optional[Mapping[str, str]] = None,
        threshold: Optional[float] = None,
        threshold_metric_id: Optional[str] = None,
        treat_missing_data: Optional[str] = None,
        unit: Optional[str] = None) -> MetricAlarm
```

```go
func GetMetricAlarm(ctx *Context, name string, id IDInput, state *MetricAlarmState, opts ...ResourceOption) (*MetricAlarm, error)
```

```csharp
public static MetricAlarm Get(string name, Input<string> id, MetricAlarmState? state, CustomResourceOptions? opts = null)
```

```java
public static MetricAlarm get(String name, Output<String> id, MetricAlarmState state, CustomResourceOptions options)
```

```yaml
resources:  _:    type: aws:cloudwatch:MetricAlarm    get:      id: ${id}
```

```hcl
import {
  to = aws_cloudwatch_metricalarm.example
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

[ActionsEnabled](#state_actionsenabled_csharp) bool

Indicates whether or not actions should be executed during any changes to the alarm's state. Defaults to `true`.

[AlarmActions](#state_alarmactions_csharp) List<string>

The list of actions to execute when this alarm transitions into an ALARM state from any other state. Each action is specified as an Amazon Resource Name (ARN).

[AlarmDescription](#state_alarmdescription_csharp) string

The description for the alarm.

[Arn](#state_arn_csharp) string

The ARN of the CloudWatch Metric Alarm.

[ComparisonOperator](#state_comparisonoperator_csharp) string

The arithmetic operation to use when comparing the specified Statistic and Threshold. The specified Statistic value is used as the first operand. Either of the following is supported: `GreaterThanOrEqualToThreshold`, `GreaterThanThreshold`, `LessThanThreshold`, `LessThanOrEqualToThreshold`. Additionally, the values `LessThanLowerOrGreaterThanUpperThreshold`, `LessThanLowerThreshold`, and `GreaterThanUpperThreshold` are used only for alarms based on anomaly detection models.

[DatapointsToAlarm](#state_datapointstoalarm_csharp) int

The number of data points that must be breaching to trigger the alarm.

[Dimensions](#state_dimensions_csharp) Dictionary<string, string>

The dimensions for the alarm's associated metric. For the list of available dimensions see the AWS documentation [here](http://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/CW_Support_For_AWS.html).

[EvaluateLowSampleCountPercentiles](#state_evaluatelowsamplecountpercentiles_csharp) string

Used only for alarms based on percentiles. If you specify `ignore`, the alarm state will not change during periods with too few data points to be statistically significant. If you specify `evaluate` or omit this parameter, the alarm will always be evaluated and possibly change state no matter how many data points are available. The following values are supported: `ignore`, and `evaluate`.

[EvaluationCriteria](#state_evaluationcriteria_csharp) [MetricAlarmEvaluationCriteria](#metricalarmevaluationcriteria)

The evaluation criteria for PromQL alarms. Cannot be used with traditional metric alarm parameters.

[EvaluationInterval](#state_evaluationinterval_csharp) int

The frequency, in seconds, at which the alarm is evaluated. Valid values are `10`, `20`, `30`, and any multiple of `60`. Required when using `evaluationCriteria`.

[EvaluationPeriods](#state_evaluationperiods_csharp) int

The number of periods over which data is compared to the specified threshold. Required for traditional metric alarms.

[ExtendedStatistic](#state_extendedstatistic_csharp) string

The percentile statistic for the metric associated with the alarm. Specify a value between p0.0 and p100.

[InsufficientDataActions](#state_insufficientdataactions_csharp) List<string>

The list of actions to execute when this alarm transitions into an INSUFFICIENT\_DATA state from any other state. Each action is specified as an Amazon Resource Name (ARN).

[MetricName](#state_metricname_csharp) string

The name for the alarm's associated metric. See docs for [supported metrics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/CW_Support_For_AWS.html).

[MetricQueries](#state_metricqueries_csharp) [List<MetricAlarmMetricQuery>](#metricalarmmetricquery)

Enables you to create an alarm based on a metric math expression. You may specify at most 20.

[Name](#state_name_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

The descriptive name for the alarm. This name must be unique within the user's AWS account

[Namespace](#state_namespace_csharp) string

The namespace for the alarm's associated metric. See docs for the [list of namespaces](https://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/aws-namespaces.html). See docs for [supported metrics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/CW_Support_For_AWS.html).

[OkActions](#state_okactions_csharp) List<string>

The list of actions to execute when this alarm transitions into an OK state from any other state. Each action is specified as an Amazon Resource Name (ARN).

[Period](#state_period_csharp) int

The period in seconds over which the specified `statistic` is applied. Valid values are `10`, `20`, `30`, or any multiple of `60`.

[Region](#state_region_csharp) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[Statistic](#state_statistic_csharp) string

The statistic to apply to the alarm's associated metric. Either of the following is supported: `SampleCount`, `Average`, `Sum`, `Minimum`, `Maximum`

[Tags](#state_tags_csharp) Dictionary<string, string>

A map of tags to assign to the resource. .If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

See [related part of AWS Docs](https://docs.aws.amazon.com/AmazonCloudWatch/latest/APIReference/API_PutMetricAlarm.html) for details about valid values.

> **NOTE:** If you specify at least one `metricQuery`, you may not specify a `metricName`, `namespace`, `period` or `statistic`. If you do not specify a `metricQuery`, you must specify each of these (although you may use `extendedStatistic` instead of `statistic`).

[TagsAll](#state_tagsall_csharp) Dictionary<string, string>

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[Threshold](#state_threshold_csharp) double

The value against which the specified statistic is compared. This parameter is required for alarms based on static thresholds, but should not be used for alarms based on anomaly detection models.

[ThresholdMetricId](#state_thresholdmetricid_csharp) string

If this is an alarm based on an anomaly detection model, make this value match the ID of the ANOMALY\_DETECTION\_BAND function.

[TreatMissingData](#state_treatmissingdata_csharp) string

Sets how this alarm is to handle missing data points. The following values are supported: `missing`, `ignore`, `breaching` and `notBreaching`. Defaults to `missing`.

[Unit](#state_unit_csharp) string

The unit for the alarm's associated metric.

[ActionsEnabled](#state_actionsenabled_go) bool

Indicates whether or not actions should be executed during any changes to the alarm's state. Defaults to `true`.

[AlarmActions](#state_alarmactions_go) \[\]interface{}

The list of actions to execute when this alarm transitions into an ALARM state from any other state. Each action is specified as an Amazon Resource Name (ARN).

[AlarmDescription](#state_alarmdescription_go) string

The description for the alarm.

[Arn](#state_arn_go) string

The ARN of the CloudWatch Metric Alarm.

[ComparisonOperator](#state_comparisonoperator_go) string

The arithmetic operation to use when comparing the specified Statistic and Threshold. The specified Statistic value is used as the first operand. Either of the following is supported: `GreaterThanOrEqualToThreshold`, `GreaterThanThreshold`, `LessThanThreshold`, `LessThanOrEqualToThreshold`. Additionally, the values `LessThanLowerOrGreaterThanUpperThreshold`, `LessThanLowerThreshold`, and `GreaterThanUpperThreshold` are used only for alarms based on anomaly detection models.

[DatapointsToAlarm](#state_datapointstoalarm_go) int

The number of data points that must be breaching to trigger the alarm.

[Dimensions](#state_dimensions_go) map\[string\]string

The dimensions for the alarm's associated metric. For the list of available dimensions see the AWS documentation [here](http://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/CW_Support_For_AWS.html).

[EvaluateLowSampleCountPercentiles](#state_evaluatelowsamplecountpercentiles_go) string

Used only for alarms based on percentiles. If you specify `ignore`, the alarm state will not change during periods with too few data points to be statistically significant. If you specify `evaluate` or omit this parameter, the alarm will always be evaluated and possibly change state no matter how many data points are available. The following values are supported: `ignore`, and `evaluate`.

[EvaluationCriteria](#state_evaluationcriteria_go) [MetricAlarmEvaluationCriteriaArgs](#metricalarmevaluationcriteria)

The evaluation criteria for PromQL alarms. Cannot be used with traditional metric alarm parameters.

[EvaluationInterval](#state_evaluationinterval_go) int

The frequency, in seconds, at which the alarm is evaluated. Valid values are `10`, `20`, `30`, and any multiple of `60`. Required when using `evaluationCriteria`.

[EvaluationPeriods](#state_evaluationperiods_go) int

The number of periods over which data is compared to the specified threshold. Required for traditional metric alarms.

[ExtendedStatistic](#state_extendedstatistic_go) string

The percentile statistic for the metric associated with the alarm. Specify a value between p0.0 and p100.

[InsufficientDataActions](#state_insufficientdataactions_go) \[\]interface{}

The list of actions to execute when this alarm transitions into an INSUFFICIENT\_DATA state from any other state. Each action is specified as an Amazon Resource Name (ARN).

[MetricName](#state_metricname_go) string

The name for the alarm's associated metric. See docs for [supported metrics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/CW_Support_For_AWS.html).

[MetricQueries](#state_metricqueries_go) [\[\]MetricAlarmMetricQueryArgs](#metricalarmmetricquery)

Enables you to create an alarm based on a metric math expression. You may specify at most 20.

[Name](#state_name_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

The descriptive name for the alarm. This name must be unique within the user's AWS account

[Namespace](#state_namespace_go) string

The namespace for the alarm's associated metric. See docs for the [list of namespaces](https://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/aws-namespaces.html). See docs for [supported metrics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/CW_Support_For_AWS.html).

[OkActions](#state_okactions_go) \[\]interface{}

The list of actions to execute when this alarm transitions into an OK state from any other state. Each action is specified as an Amazon Resource Name (ARN).

[Period](#state_period_go) int

The period in seconds over which the specified `statistic` is applied. Valid values are `10`, `20`, `30`, or any multiple of `60`.

[Region](#state_region_go) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[Statistic](#state_statistic_go) string

The statistic to apply to the alarm's associated metric. Either of the following is supported: `SampleCount`, `Average`, `Sum`, `Minimum`, `Maximum`

[Tags](#state_tags_go) map\[string\]string

A map of tags to assign to the resource. .If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

See [related part of AWS Docs](https://docs.aws.amazon.com/AmazonCloudWatch/latest/APIReference/API_PutMetricAlarm.html) for details about valid values.

> **NOTE:** If you specify at least one `metricQuery`, you may not specify a `metricName`, `namespace`, `period` or `statistic`. If you do not specify a `metricQuery`, you must specify each of these (although you may use `extendedStatistic` instead of `statistic`).

[TagsAll](#state_tagsall_go) map\[string\]string

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[Threshold](#state_threshold_go) float64

The value against which the specified statistic is compared. This parameter is required for alarms based on static thresholds, but should not be used for alarms based on anomaly detection models.

[ThresholdMetricId](#state_thresholdmetricid_go) string

If this is an alarm based on an anomaly detection model, make this value match the ID of the ANOMALY\_DETECTION\_BAND function.

[TreatMissingData](#state_treatmissingdata_go) string

Sets how this alarm is to handle missing data points. The following values are supported: `missing`, `ignore`, `breaching` and `notBreaching`. Defaults to `missing`.

[Unit](#state_unit_go) string

The unit for the alarm's associated metric.

[actions\_enabled](#state_actions_enabled_hcl) bool

Indicates whether or not actions should be executed during any changes to the alarm's state. Defaults to `true`.

[alarm\_actions](#state_alarm_actions_hcl) list(string | )

The list of actions to execute when this alarm transitions into an ALARM state from any other state. Each action is specified as an Amazon Resource Name (ARN).

[alarm\_description](#state_alarm_description_hcl) string

The description for the alarm.

[arn](#state_arn_hcl) string

The ARN of the CloudWatch Metric Alarm.

[comparison\_operator](#state_comparison_operator_hcl) string

The arithmetic operation to use when comparing the specified Statistic and Threshold. The specified Statistic value is used as the first operand. Either of the following is supported: `GreaterThanOrEqualToThreshold`, `GreaterThanThreshold`, `LessThanThreshold`, `LessThanOrEqualToThreshold`. Additionally, the values `LessThanLowerOrGreaterThanUpperThreshold`, `LessThanLowerThreshold`, and `GreaterThanUpperThreshold` are used only for alarms based on anomaly detection models.

[datapoints\_to\_alarm](#state_datapoints_to_alarm_hcl) number

The number of data points that must be breaching to trigger the alarm.

[dimensions](#state_dimensions_hcl) map(string)

The dimensions for the alarm's associated metric. For the list of available dimensions see the AWS documentation [here](http://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/CW_Support_For_AWS.html).

[evaluate\_low\_sample\_count\_percentiles](#state_evaluate_low_sample_count_percentiles_hcl) string

Used only for alarms based on percentiles. If you specify `ignore`, the alarm state will not change during periods with too few data points to be statistically significant. If you specify `evaluate` or omit this parameter, the alarm will always be evaluated and possibly change state no matter how many data points are available. The following values are supported: `ignore`, and `evaluate`.

[evaluation\_criteria](#state_evaluation_criteria_hcl) [object](#metricalarmevaluationcriteria)

The evaluation criteria for PromQL alarms. Cannot be used with traditional metric alarm parameters.

[evaluation\_interval](#state_evaluation_interval_hcl) number

The frequency, in seconds, at which the alarm is evaluated. Valid values are `10`, `20`, `30`, and any multiple of `60`. Required when using `evaluationCriteria`.

[evaluation\_periods](#state_evaluation_periods_hcl) number

The number of periods over which data is compared to the specified threshold. Required for traditional metric alarms.

[extended\_statistic](#state_extended_statistic_hcl) string

The percentile statistic for the metric associated with the alarm. Specify a value between p0.0 and p100.

[insufficient\_data\_actions](#state_insufficient_data_actions_hcl) list(string | )

The list of actions to execute when this alarm transitions into an INSUFFICIENT\_DATA state from any other state. Each action is specified as an Amazon Resource Name (ARN).

[metric\_name](#state_metric_name_hcl) string

The name for the alarm's associated metric. See docs for [supported metrics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/CW_Support_For_AWS.html).

[metric\_queries](#state_metric_queries_hcl) [list(object)](#metricalarmmetricquery)

Enables you to create an alarm based on a metric math expression. You may specify at most 20.

[name](#state_name_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

The descriptive name for the alarm. This name must be unique within the user's AWS account

[namespace](#state_namespace_hcl) string

The namespace for the alarm's associated metric. See docs for the [list of namespaces](https://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/aws-namespaces.html). See docs for [supported metrics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/CW_Support_For_AWS.html).

[ok\_actions](#state_ok_actions_hcl) list(string | )

The list of actions to execute when this alarm transitions into an OK state from any other state. Each action is specified as an Amazon Resource Name (ARN).

[period](#state_period_hcl) number

The period in seconds over which the specified `statistic` is applied. Valid values are `10`, `20`, `30`, or any multiple of `60`.

[region](#state_region_hcl) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[statistic](#state_statistic_hcl) string

The statistic to apply to the alarm's associated metric. Either of the following is supported: `SampleCount`, `Average`, `Sum`, `Minimum`, `Maximum`

[tags](#state_tags_hcl) map(string)

A map of tags to assign to the resource. .If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

See [related part of AWS Docs](https://docs.aws.amazon.com/AmazonCloudWatch/latest/APIReference/API_PutMetricAlarm.html) for details about valid values.

> **NOTE:** If you specify at least one `metricQuery`, you may not specify a `metricName`, `namespace`, `period` or `statistic`. If you do not specify a `metricQuery`, you must specify each of these (although you may use `extendedStatistic` instead of `statistic`).

[tags\_all](#state_tags_all_hcl) map(string)

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[threshold](#state_threshold_hcl) number

The value against which the specified statistic is compared. This parameter is required for alarms based on static thresholds, but should not be used for alarms based on anomaly detection models.

[threshold\_metric\_id](#state_threshold_metric_id_hcl) string

If this is an alarm based on an anomaly detection model, make this value match the ID of the ANOMALY\_DETECTION\_BAND function.

[treat\_missing\_data](#state_treat_missing_data_hcl) string

Sets how this alarm is to handle missing data points. The following values are supported: `missing`, `ignore`, `breaching` and `notBreaching`. Defaults to `missing`.

[unit](#state_unit_hcl) string

The unit for the alarm's associated metric.

[actionsEnabled](#state_actionsenabled_java) Boolean

Indicates whether or not actions should be executed during any changes to the alarm's state. Defaults to `true`.

[alarmActions](#state_alarmactions_java) List<String>

The list of actions to execute when this alarm transitions into an ALARM state from any other state. Each action is specified as an Amazon Resource Name (ARN).

[alarmDescription](#state_alarmdescription_java) String

The description for the alarm.

[arn](#state_arn_java) String

The ARN of the CloudWatch Metric Alarm.

[comparisonOperator](#state_comparisonoperator_java) String

The arithmetic operation to use when comparing the specified Statistic and Threshold. The specified Statistic value is used as the first operand. Either of the following is supported: `GreaterThanOrEqualToThreshold`, `GreaterThanThreshold`, `LessThanThreshold`, `LessThanOrEqualToThreshold`. Additionally, the values `LessThanLowerOrGreaterThanUpperThreshold`, `LessThanLowerThreshold`, and `GreaterThanUpperThreshold` are used only for alarms based on anomaly detection models.

[datapointsToAlarm](#state_datapointstoalarm_java) Integer

The number of data points that must be breaching to trigger the alarm.

[dimensions](#state_dimensions_java) Map<String,String>

The dimensions for the alarm's associated metric. For the list of available dimensions see the AWS documentation [here](http://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/CW_Support_For_AWS.html).

[evaluateLowSampleCountPercentiles](#state_evaluatelowsamplecountpercentiles_java) String

Used only for alarms based on percentiles. If you specify `ignore`, the alarm state will not change during periods with too few data points to be statistically significant. If you specify `evaluate` or omit this parameter, the alarm will always be evaluated and possibly change state no matter how many data points are available. The following values are supported: `ignore`, and `evaluate`.

[evaluationCriteria](#state_evaluationcriteria_java) [MetricAlarmEvaluationCriteria](#metricalarmevaluationcriteria)

The evaluation criteria for PromQL alarms. Cannot be used with traditional metric alarm parameters.

[evaluationInterval](#state_evaluationinterval_java) Integer

The frequency, in seconds, at which the alarm is evaluated. Valid values are `10`, `20`, `30`, and any multiple of `60`. Required when using `evaluationCriteria`.

[evaluationPeriods](#state_evaluationperiods_java) Integer

The number of periods over which data is compared to the specified threshold. Required for traditional metric alarms.

[extendedStatistic](#state_extendedstatistic_java) String

The percentile statistic for the metric associated with the alarm. Specify a value between p0.0 and p100.

[insufficientDataActions](#state_insufficientdataactions_java) List<String>

The list of actions to execute when this alarm transitions into an INSUFFICIENT\_DATA state from any other state. Each action is specified as an Amazon Resource Name (ARN).

[metricName](#state_metricname_java) String

The name for the alarm's associated metric. See docs for [supported metrics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/CW_Support_For_AWS.html).

[metricQueries](#state_metricqueries_java) [List<MetricAlarmMetricQuery>](#metricalarmmetricquery)

Enables you to create an alarm based on a metric math expression. You may specify at most 20.

[name](#state_name_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

The descriptive name for the alarm. This name must be unique within the user's AWS account

[namespace](#state_namespace_java) String

The namespace for the alarm's associated metric. See docs for the [list of namespaces](https://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/aws-namespaces.html). See docs for [supported metrics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/CW_Support_For_AWS.html).

[okActions](#state_okactions_java) List<String>

The list of actions to execute when this alarm transitions into an OK state from any other state. Each action is specified as an Amazon Resource Name (ARN).

[period](#state_period_java) Integer

The period in seconds over which the specified `statistic` is applied. Valid values are `10`, `20`, `30`, or any multiple of `60`.

[region](#state_region_java) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[statistic](#state_statistic_java) String

The statistic to apply to the alarm's associated metric. Either of the following is supported: `SampleCount`, `Average`, `Sum`, `Minimum`, `Maximum`

[tags](#state_tags_java) Map<String,String>

A map of tags to assign to the resource. .If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

See [related part of AWS Docs](https://docs.aws.amazon.com/AmazonCloudWatch/latest/APIReference/API_PutMetricAlarm.html) for details about valid values.

> **NOTE:** If you specify at least one `metricQuery`, you may not specify a `metricName`, `namespace`, `period` or `statistic`. If you do not specify a `metricQuery`, you must specify each of these (although you may use `extendedStatistic` instead of `statistic`).

[tagsAll](#state_tagsall_java) Map<String,String>

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[threshold](#state_threshold_java) Double

The value against which the specified statistic is compared. This parameter is required for alarms based on static thresholds, but should not be used for alarms based on anomaly detection models.

[thresholdMetricId](#state_thresholdmetricid_java) String

If this is an alarm based on an anomaly detection model, make this value match the ID of the ANOMALY\_DETECTION\_BAND function.

[treatMissingData](#state_treatmissingdata_java) String

Sets how this alarm is to handle missing data points. The following values are supported: `missing`, `ignore`, `breaching` and `notBreaching`. Defaults to `missing`.

[unit](#state_unit_java) String

The unit for the alarm's associated metric.

[actionsEnabled](#state_actionsenabled_nodejs) boolean

Indicates whether or not actions should be executed during any changes to the alarm's state. Defaults to `true`.

[alarmActions](#state_alarmactions_nodejs) (string | Topic)\[\]

The list of actions to execute when this alarm transitions into an ALARM state from any other state. Each action is specified as an Amazon Resource Name (ARN).

[alarmDescription](#state_alarmdescription_nodejs) string

The description for the alarm.

[arn](#state_arn_nodejs) string

The ARN of the CloudWatch Metric Alarm.

[comparisonOperator](#state_comparisonoperator_nodejs) string

The arithmetic operation to use when comparing the specified Statistic and Threshold. The specified Statistic value is used as the first operand. Either of the following is supported: `GreaterThanOrEqualToThreshold`, `GreaterThanThreshold`, `LessThanThreshold`, `LessThanOrEqualToThreshold`. Additionally, the values `LessThanLowerOrGreaterThanUpperThreshold`, `LessThanLowerThreshold`, and `GreaterThanUpperThreshold` are used only for alarms based on anomaly detection models.

[datapointsToAlarm](#state_datapointstoalarm_nodejs) number

The number of data points that must be breaching to trigger the alarm.

[dimensions](#state_dimensions_nodejs) {\[key: string\]: string}

The dimensions for the alarm's associated metric. For the list of available dimensions see the AWS documentation [here](http://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/CW_Support_For_AWS.html).

[evaluateLowSampleCountPercentiles](#state_evaluatelowsamplecountpercentiles_nodejs) string

Used only for alarms based on percentiles. If you specify `ignore`, the alarm state will not change during periods with too few data points to be statistically significant. If you specify `evaluate` or omit this parameter, the alarm will always be evaluated and possibly change state no matter how many data points are available. The following values are supported: `ignore`, and `evaluate`.

[evaluationCriteria](#state_evaluationcriteria_nodejs) [MetricAlarmEvaluationCriteria](#metricalarmevaluationcriteria)

The evaluation criteria for PromQL alarms. Cannot be used with traditional metric alarm parameters.

[evaluationInterval](#state_evaluationinterval_nodejs) number

The frequency, in seconds, at which the alarm is evaluated. Valid values are `10`, `20`, `30`, and any multiple of `60`. Required when using `evaluationCriteria`.

[evaluationPeriods](#state_evaluationperiods_nodejs) number

The number of periods over which data is compared to the specified threshold. Required for traditional metric alarms.

[extendedStatistic](#state_extendedstatistic_nodejs) string

The percentile statistic for the metric associated with the alarm. Specify a value between p0.0 and p100.

[insufficientDataActions](#state_insufficientdataactions_nodejs) (string | Topic)\[\]

The list of actions to execute when this alarm transitions into an INSUFFICIENT\_DATA state from any other state. Each action is specified as an Amazon Resource Name (ARN).

[metricName](#state_metricname_nodejs) string

The name for the alarm's associated metric. See docs for [supported metrics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/CW_Support_For_AWS.html).

[metricQueries](#state_metricqueries_nodejs) [MetricAlarmMetricQuery\[\]](#metricalarmmetricquery)

Enables you to create an alarm based on a metric math expression. You may specify at most 20.

[name](#state_name_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

The descriptive name for the alarm. This name must be unique within the user's AWS account

[namespace](#state_namespace_nodejs) string

The namespace for the alarm's associated metric. See docs for the [list of namespaces](https://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/aws-namespaces.html). See docs for [supported metrics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/CW_Support_For_AWS.html).

[okActions](#state_okactions_nodejs) (string | Topic)\[\]

The list of actions to execute when this alarm transitions into an OK state from any other state. Each action is specified as an Amazon Resource Name (ARN).

[period](#state_period_nodejs) number

The period in seconds over which the specified `statistic` is applied. Valid values are `10`, `20`, `30`, or any multiple of `60`.

[region](#state_region_nodejs) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[statistic](#state_statistic_nodejs) string

The statistic to apply to the alarm's associated metric. Either of the following is supported: `SampleCount`, `Average`, `Sum`, `Minimum`, `Maximum`

[tags](#state_tags_nodejs) {\[key: string\]: string}

A map of tags to assign to the resource. .If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

See [related part of AWS Docs](https://docs.aws.amazon.com/AmazonCloudWatch/latest/APIReference/API_PutMetricAlarm.html) for details about valid values.

> **NOTE:** If you specify at least one `metricQuery`, you may not specify a `metricName`, `namespace`, `period` or `statistic`. If you do not specify a `metricQuery`, you must specify each of these (although you may use `extendedStatistic` instead of `statistic`).

[tagsAll](#state_tagsall_nodejs) {\[key: string\]: string}

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[threshold](#state_threshold_nodejs) number

The value against which the specified statistic is compared. This parameter is required for alarms based on static thresholds, but should not be used for alarms based on anomaly detection models.

[thresholdMetricId](#state_thresholdmetricid_nodejs) string

If this is an alarm based on an anomaly detection model, make this value match the ID of the ANOMALY\_DETECTION\_BAND function.

[treatMissingData](#state_treatmissingdata_nodejs) string

Sets how this alarm is to handle missing data points. The following values are supported: `missing`, `ignore`, `breaching` and `notBreaching`. Defaults to `missing`.

[unit](#state_unit_nodejs) string

The unit for the alarm's associated metric.

[actions\_enabled](#state_actions_enabled_python) bool

Indicates whether or not actions should be executed during any changes to the alarm's state. Defaults to `true`.

[alarm\_actions](#state_alarm_actions_python) Sequence\[str\]

The list of actions to execute when this alarm transitions into an ALARM state from any other state. Each action is specified as an Amazon Resource Name (ARN).

[alarm\_description](#state_alarm_description_python) str

The description for the alarm.

[arn](#state_arn_python) str

The ARN of the CloudWatch Metric Alarm.

[comparison\_operator](#state_comparison_operator_python) str

The arithmetic operation to use when comparing the specified Statistic and Threshold. The specified Statistic value is used as the first operand. Either of the following is supported: `GreaterThanOrEqualToThreshold`, `GreaterThanThreshold`, `LessThanThreshold`, `LessThanOrEqualToThreshold`. Additionally, the values `LessThanLowerOrGreaterThanUpperThreshold`, `LessThanLowerThreshold`, and `GreaterThanUpperThreshold` are used only for alarms based on anomaly detection models.

[datapoints\_to\_alarm](#state_datapoints_to_alarm_python) int

The number of data points that must be breaching to trigger the alarm.

[dimensions](#state_dimensions_python) Mapping\[str, str\]

The dimensions for the alarm's associated metric. For the list of available dimensions see the AWS documentation [here](http://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/CW_Support_For_AWS.html).

[evaluate\_low\_sample\_count\_percentiles](#state_evaluate_low_sample_count_percentiles_python) str

Used only for alarms based on percentiles. If you specify `ignore`, the alarm state will not change during periods with too few data points to be statistically significant. If you specify `evaluate` or omit this parameter, the alarm will always be evaluated and possibly change state no matter how many data points are available. The following values are supported: `ignore`, and `evaluate`.

[evaluation\_criteria](#state_evaluation_criteria_python) [MetricAlarmEvaluationCriteriaArgs](#metricalarmevaluationcriteria)

The evaluation criteria for PromQL alarms. Cannot be used with traditional metric alarm parameters.

[evaluation\_interval](#state_evaluation_interval_python) int

The frequency, in seconds, at which the alarm is evaluated. Valid values are `10`, `20`, `30`, and any multiple of `60`. Required when using `evaluationCriteria`.

[evaluation\_periods](#state_evaluation_periods_python) int

The number of periods over which data is compared to the specified threshold. Required for traditional metric alarms.

[extended\_statistic](#state_extended_statistic_python) str

The percentile statistic for the metric associated with the alarm. Specify a value between p0.0 and p100.

[insufficient\_data\_actions](#state_insufficient_data_actions_python) Sequence\[str\]

The list of actions to execute when this alarm transitions into an INSUFFICIENT\_DATA state from any other state. Each action is specified as an Amazon Resource Name (ARN).

[metric\_name](#state_metric_name_python) str

The name for the alarm's associated metric. See docs for [supported metrics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/CW_Support_For_AWS.html).

[metric\_queries](#state_metric_queries_python) [Sequence\[MetricAlarmMetricQueryArgs\]](#metricalarmmetricquery)

Enables you to create an alarm based on a metric math expression. You may specify at most 20.

[name](#state_name_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

The descriptive name for the alarm. This name must be unique within the user's AWS account

[namespace](#state_namespace_python) str

The namespace for the alarm's associated metric. See docs for the [list of namespaces](https://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/aws-namespaces.html). See docs for [supported metrics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/CW_Support_For_AWS.html).

[ok\_actions](#state_ok_actions_python) Sequence\[str\]

The list of actions to execute when this alarm transitions into an OK state from any other state. Each action is specified as an Amazon Resource Name (ARN).

[period](#state_period_python) int

The period in seconds over which the specified `statistic` is applied. Valid values are `10`, `20`, `30`, or any multiple of `60`.

[region](#state_region_python) str

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[statistic](#state_statistic_python) str

The statistic to apply to the alarm's associated metric. Either of the following is supported: `SampleCount`, `Average`, `Sum`, `Minimum`, `Maximum`

[tags](#state_tags_python) Mapping\[str, str\]

A map of tags to assign to the resource. .If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

See [related part of AWS Docs](https://docs.aws.amazon.com/AmazonCloudWatch/latest/APIReference/API_PutMetricAlarm.html) for details about valid values.

> **NOTE:** If you specify at least one `metricQuery`, you may not specify a `metricName`, `namespace`, `period` or `statistic`. If you do not specify a `metricQuery`, you must specify each of these (although you may use `extendedStatistic` instead of `statistic`).

[tags\_all](#state_tags_all_python) Mapping\[str, str\]

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[threshold](#state_threshold_python) float

The value against which the specified statistic is compared. This parameter is required for alarms based on static thresholds, but should not be used for alarms based on anomaly detection models.

[threshold\_metric\_id](#state_threshold_metric_id_python) str

If this is an alarm based on an anomaly detection model, make this value match the ID of the ANOMALY\_DETECTION\_BAND function.

[treat\_missing\_data](#state_treat_missing_data_python) str

Sets how this alarm is to handle missing data points. The following values are supported: `missing`, `ignore`, `breaching` and `notBreaching`. Defaults to `missing`.

[unit](#state_unit_python) str

The unit for the alarm's associated metric.

[actionsEnabled](#state_actionsenabled_yaml) Boolean

Indicates whether or not actions should be executed during any changes to the alarm's state. Defaults to `true`.

[alarmActions](#state_alarmactions_yaml) List<String | >

The list of actions to execute when this alarm transitions into an ALARM state from any other state. Each action is specified as an Amazon Resource Name (ARN).

[alarmDescription](#state_alarmdescription_yaml) String

The description for the alarm.

[arn](#state_arn_yaml) String

The ARN of the CloudWatch Metric Alarm.

[comparisonOperator](#state_comparisonoperator_yaml) String

The arithmetic operation to use when comparing the specified Statistic and Threshold. The specified Statistic value is used as the first operand. Either of the following is supported: `GreaterThanOrEqualToThreshold`, `GreaterThanThreshold`, `LessThanThreshold`, `LessThanOrEqualToThreshold`. Additionally, the values `LessThanLowerOrGreaterThanUpperThreshold`, `LessThanLowerThreshold`, and `GreaterThanUpperThreshold` are used only for alarms based on anomaly detection models.

[datapointsToAlarm](#state_datapointstoalarm_yaml) Number

The number of data points that must be breaching to trigger the alarm.

[dimensions](#state_dimensions_yaml) Map<String>

The dimensions for the alarm's associated metric. For the list of available dimensions see the AWS documentation [here](http://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/CW_Support_For_AWS.html).

[evaluateLowSampleCountPercentiles](#state_evaluatelowsamplecountpercentiles_yaml) String

Used only for alarms based on percentiles. If you specify `ignore`, the alarm state will not change during periods with too few data points to be statistically significant. If you specify `evaluate` or omit this parameter, the alarm will always be evaluated and possibly change state no matter how many data points are available. The following values are supported: `ignore`, and `evaluate`.

[evaluationCriteria](#state_evaluationcriteria_yaml) [Property Map](#metricalarmevaluationcriteria)

The evaluation criteria for PromQL alarms. Cannot be used with traditional metric alarm parameters.

[evaluationInterval](#state_evaluationinterval_yaml) Number

The frequency, in seconds, at which the alarm is evaluated. Valid values are `10`, `20`, `30`, and any multiple of `60`. Required when using `evaluationCriteria`.

[evaluationPeriods](#state_evaluationperiods_yaml) Number

The number of periods over which data is compared to the specified threshold. Required for traditional metric alarms.

[extendedStatistic](#state_extendedstatistic_yaml) String

The percentile statistic for the metric associated with the alarm. Specify a value between p0.0 and p100.

[insufficientDataActions](#state_insufficientdataactions_yaml) List<String | >

The list of actions to execute when this alarm transitions into an INSUFFICIENT\_DATA state from any other state. Each action is specified as an Amazon Resource Name (ARN).

[metricName](#state_metricname_yaml) String

The name for the alarm's associated metric. See docs for [supported metrics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/CW_Support_For_AWS.html).

[metricQueries](#state_metricqueries_yaml) [List<Property Map>](#metricalarmmetricquery)

Enables you to create an alarm based on a metric math expression. You may specify at most 20.

[name](#state_name_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

The descriptive name for the alarm. This name must be unique within the user's AWS account

[namespace](#state_namespace_yaml) String

The namespace for the alarm's associated metric. See docs for the [list of namespaces](https://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/aws-namespaces.html). See docs for [supported metrics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/CW_Support_For_AWS.html).

[okActions](#state_okactions_yaml) List<String | >

The list of actions to execute when this alarm transitions into an OK state from any other state. Each action is specified as an Amazon Resource Name (ARN).

[period](#state_period_yaml) Number

The period in seconds over which the specified `statistic` is applied. Valid values are `10`, `20`, `30`, or any multiple of `60`.

[region](#state_region_yaml) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[statistic](#state_statistic_yaml) String

The statistic to apply to the alarm's associated metric. Either of the following is supported: `SampleCount`, `Average`, `Sum`, `Minimum`, `Maximum`

[tags](#state_tags_yaml) Map<String>

A map of tags to assign to the resource. .If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

See [related part of AWS Docs](https://docs.aws.amazon.com/AmazonCloudWatch/latest/APIReference/API_PutMetricAlarm.html) for details about valid values.

> **NOTE:** If you specify at least one `metricQuery`, you may not specify a `metricName`, `namespace`, `period` or `statistic`. If you do not specify a `metricQuery`, you must specify each of these (although you may use `extendedStatistic` instead of `statistic`).

[tagsAll](#state_tagsall_yaml) Map<String>

A map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[threshold](#state_threshold_yaml) Number

The value against which the specified statistic is compared. This parameter is required for alarms based on static thresholds, but should not be used for alarms based on anomaly detection models.

[thresholdMetricId](#state_thresholdmetricid_yaml) String

If this is an alarm based on an anomaly detection model, make this value match the ID of the ANOMALY\_DETECTION\_BAND function.

[treatMissingData](#state_treatmissingdata_yaml) String

Sets how this alarm is to handle missing data points. The following values are supported: `missing`, `ignore`, `breaching` and `notBreaching`. Defaults to `missing`.

[unit](#state_unit_yaml) String

The unit for the alarm's associated metric.

## Supporting Types[](#supporting-types)

#### MetricAlarmEvaluationCriteria

, MetricAlarmEvaluationCriteriaArgs

[](#metricalarmevaluationcriteria)

[PromqlCriteria](#promqlcriteria_csharp) This property is required. [MetricAlarmEvaluationCriteriaPromqlCriteria](#metricalarmevaluationcriteriapromqlcriteria)

The PromQL criteria for the alarm evaluation.

[PromqlCriteria](#promqlcriteria_go) This property is required. [MetricAlarmEvaluationCriteriaPromqlCriteria](#metricalarmevaluationcriteriapromqlcriteria)

The PromQL criteria for the alarm evaluation.

[promql\_criteria](#promql_criteria_hcl) This property is required. [object](#metricalarmevaluationcriteriapromqlcriteria)

The PromQL criteria for the alarm evaluation.

[promqlCriteria](#promqlcriteria_java) This property is required. [MetricAlarmEvaluationCriteriaPromqlCriteria](#metricalarmevaluationcriteriapromqlcriteria)

The PromQL criteria for the alarm evaluation.

[promqlCriteria](#promqlcriteria_nodejs) This property is required. [MetricAlarmEvaluationCriteriaPromqlCriteria](#metricalarmevaluationcriteriapromqlcriteria)

The PromQL criteria for the alarm evaluation.

[promql\_criteria](#promql_criteria_python) This property is required. [MetricAlarmEvaluationCriteriaPromqlCriteria](#metricalarmevaluationcriteriapromqlcriteria)

The PromQL criteria for the alarm evaluation.

[promqlCriteria](#promqlcriteria_yaml) This property is required. [Property Map](#metricalarmevaluationcriteriapromqlcriteria)

The PromQL criteria for the alarm evaluation.

#### MetricAlarmEvaluationCriteriaPromqlCriteria

, MetricAlarmEvaluationCriteriaPromqlCriteriaArgs

[](#metricalarmevaluationcriteriapromqlcriteria)

[Query](#query_csharp) This property is required. string

The PromQL query that the alarm evaluates. The query must return a result of vector type. Each entry in the vector result represents an alarm contributor.

[PendingPeriod](#pendingperiod_csharp) int

The duration, in seconds, that a contributor must be continuously breaching before it transitions to the ALARM state. Valid range: 0-86400.

[RecoveryPeriod](#recoveryperiod_csharp) int

The duration, in seconds, that a contributor must continuously not be breaching before it transitions back to the OK state. Valid range: 0-86400.

[Query](#query_go) This property is required. string

The PromQL query that the alarm evaluates. The query must return a result of vector type. Each entry in the vector result represents an alarm contributor.

[PendingPeriod](#pendingperiod_go) int

The duration, in seconds, that a contributor must be continuously breaching before it transitions to the ALARM state. Valid range: 0-86400.

[RecoveryPeriod](#recoveryperiod_go) int

The duration, in seconds, that a contributor must continuously not be breaching before it transitions back to the OK state. Valid range: 0-86400.

[query](#query_hcl) This property is required. string

The PromQL query that the alarm evaluates. The query must return a result of vector type. Each entry in the vector result represents an alarm contributor.

[pending\_period](#pending_period_hcl) number

The duration, in seconds, that a contributor must be continuously breaching before it transitions to the ALARM state. Valid range: 0-86400.

[recovery\_period](#recovery_period_hcl) number

The duration, in seconds, that a contributor must continuously not be breaching before it transitions back to the OK state. Valid range: 0-86400.

[query](#query_java) This property is required. String

The PromQL query that the alarm evaluates. The query must return a result of vector type. Each entry in the vector result represents an alarm contributor.

[pendingPeriod](#pendingperiod_java) Integer

The duration, in seconds, that a contributor must be continuously breaching before it transitions to the ALARM state. Valid range: 0-86400.

[recoveryPeriod](#recoveryperiod_java) Integer

The duration, in seconds, that a contributor must continuously not be breaching before it transitions back to the OK state. Valid range: 0-86400.

[query](#query_nodejs) This property is required. string

The PromQL query that the alarm evaluates. The query must return a result of vector type. Each entry in the vector result represents an alarm contributor.

[pendingPeriod](#pendingperiod_nodejs) number

The duration, in seconds, that a contributor must be continuously breaching before it transitions to the ALARM state. Valid range: 0-86400.

[recoveryPeriod](#recoveryperiod_nodejs) number

The duration, in seconds, that a contributor must continuously not be breaching before it transitions back to the OK state. Valid range: 0-86400.

[query](#query_python) This property is required. str

The PromQL query that the alarm evaluates. The query must return a result of vector type. Each entry in the vector result represents an alarm contributor.

[pending\_period](#pending_period_python) int

The duration, in seconds, that a contributor must be continuously breaching before it transitions to the ALARM state. Valid range: 0-86400.

[recovery\_period](#recovery_period_python) int

The duration, in seconds, that a contributor must continuously not be breaching before it transitions back to the OK state. Valid range: 0-86400.

[query](#query_yaml) This property is required. String

The PromQL query that the alarm evaluates. The query must return a result of vector type. Each entry in the vector result represents an alarm contributor.

[pendingPeriod](#pendingperiod_yaml) Number

The duration, in seconds, that a contributor must be continuously breaching before it transitions to the ALARM state. Valid range: 0-86400.

[recoveryPeriod](#recoveryperiod_yaml) Number

The duration, in seconds, that a contributor must continuously not be breaching before it transitions back to the OK state. Valid range: 0-86400.

#### MetricAlarmMetricQuery

, MetricAlarmMetricQueryArgs

[](#metricalarmmetricquery)

[Id](#id_csharp) This property is required. string

A short name used to tie this object to the results in the response. If you are performing math expressions on this set of data, this name represents that data and can serve as a variable in the mathematical expression. The valid characters are letters, numbers, and underscore. The first character must be a lowercase letter.

[AccountId](#accountid_csharp) string

The ID of the account where the metrics are located, if this is a cross-account alarm.

[Expression](#expression_csharp) string

A Metrics Insights query or a metric math expression to be evaluated on the returned data. For details about Metrics Insights queries, see [Metrics Insights query components and syntax](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch-metrics-insights-querylanguage) in the AWS documentation. For details about metric math expressions, see [Metric Math Syntax and Functions](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/using-metric-math.html#metric-math-syntax) in the AWS documentation.

[Label](#label_csharp) string

A human-readable label for this metric or expression. This is especially useful if this is an expression, so that you know what the value represents.

[Metric](#metric_csharp) [MetricAlarmMetricQueryMetric](#metricalarmmetricquerymetric)

The metric to be returned, along with statistics, period, and units. Use this parameter only if this object is retrieving a metric and not performing a math expression on returned data.

[Period](#period_csharp) int

Granularity in seconds of returned data points. For metrics with regular resolution, valid values are any multiple of `60`. For high-resolution metrics, valid values are `1`, `5`, `10`, `20`, `30`, or any multiple of `60`.

[ReturnData](#returndata_csharp) bool

Specify exactly one `metricQuery` to be `true` to use that `metricQuery` result as the alarm.

> **NOTE:** You must specify either `metric` or `expression`. Not both.

[Id](#id_go) This property is required. string

A short name used to tie this object to the results in the response. If you are performing math expressions on this set of data, this name represents that data and can serve as a variable in the mathematical expression. The valid characters are letters, numbers, and underscore. The first character must be a lowercase letter.

[AccountId](#accountid_go) string

The ID of the account where the metrics are located, if this is a cross-account alarm.

[Expression](#expression_go) string

A Metrics Insights query or a metric math expression to be evaluated on the returned data. For details about Metrics Insights queries, see [Metrics Insights query components and syntax](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch-metrics-insights-querylanguage) in the AWS documentation. For details about metric math expressions, see [Metric Math Syntax and Functions](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/using-metric-math.html#metric-math-syntax) in the AWS documentation.

[Label](#label_go) string

A human-readable label for this metric or expression. This is especially useful if this is an expression, so that you know what the value represents.

[Metric](#metric_go) [MetricAlarmMetricQueryMetric](#metricalarmmetricquerymetric)

The metric to be returned, along with statistics, period, and units. Use this parameter only if this object is retrieving a metric and not performing a math expression on returned data.

[Period](#period_go) int

Granularity in seconds of returned data points. For metrics with regular resolution, valid values are any multiple of `60`. For high-resolution metrics, valid values are `1`, `5`, `10`, `20`, `30`, or any multiple of `60`.

[ReturnData](#returndata_go) bool

Specify exactly one `metricQuery` to be `true` to use that `metricQuery` result as the alarm.

> **NOTE:** You must specify either `metric` or `expression`. Not both.

[id](#id_hcl) This property is required. string

A short name used to tie this object to the results in the response. If you are performing math expressions on this set of data, this name represents that data and can serve as a variable in the mathematical expression. The valid characters are letters, numbers, and underscore. The first character must be a lowercase letter.

[account\_id](#account_id_hcl) string

The ID of the account where the metrics are located, if this is a cross-account alarm.

[expression](#expression_hcl) string

A Metrics Insights query or a metric math expression to be evaluated on the returned data. For details about Metrics Insights queries, see [Metrics Insights query components and syntax](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch-metrics-insights-querylanguage) in the AWS documentation. For details about metric math expressions, see [Metric Math Syntax and Functions](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/using-metric-math.html#metric-math-syntax) in the AWS documentation.

[label](#label_hcl) string

A human-readable label for this metric or expression. This is especially useful if this is an expression, so that you know what the value represents.

[metric](#metric_hcl) [object](#metricalarmmetricquerymetric)

The metric to be returned, along with statistics, period, and units. Use this parameter only if this object is retrieving a metric and not performing a math expression on returned data.

[period](#period_hcl) number

Granularity in seconds of returned data points. For metrics with regular resolution, valid values are any multiple of `60`. For high-resolution metrics, valid values are `1`, `5`, `10`, `20`, `30`, or any multiple of `60`.

[return\_data](#return_data_hcl) bool

Specify exactly one `metricQuery` to be `true` to use that `metricQuery` result as the alarm.

> **NOTE:** You must specify either `metric` or `expression`. Not both.

[id](#id_java) This property is required. String

A short name used to tie this object to the results in the response. If you are performing math expressions on this set of data, this name represents that data and can serve as a variable in the mathematical expression. The valid characters are letters, numbers, and underscore. The first character must be a lowercase letter.

[accountId](#accountid_java) String

The ID of the account where the metrics are located, if this is a cross-account alarm.

[expression](#expression_java) String

A Metrics Insights query or a metric math expression to be evaluated on the returned data. For details about Metrics Insights queries, see [Metrics Insights query components and syntax](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch-metrics-insights-querylanguage) in the AWS documentation. For details about metric math expressions, see [Metric Math Syntax and Functions](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/using-metric-math.html#metric-math-syntax) in the AWS documentation.

[label](#label_java) String

A human-readable label for this metric or expression. This is especially useful if this is an expression, so that you know what the value represents.

[metric](#metric_java) [MetricAlarmMetricQueryMetric](#metricalarmmetricquerymetric)

The metric to be returned, along with statistics, period, and units. Use this parameter only if this object is retrieving a metric and not performing a math expression on returned data.

[period](#period_java) Integer

Granularity in seconds of returned data points. For metrics with regular resolution, valid values are any multiple of `60`. For high-resolution metrics, valid values are `1`, `5`, `10`, `20`, `30`, or any multiple of `60`.

[returnData](#returndata_java) Boolean

Specify exactly one `metricQuery` to be `true` to use that `metricQuery` result as the alarm.

> **NOTE:** You must specify either `metric` or `expression`. Not both.

[id](#id_nodejs) This property is required. string

A short name used to tie this object to the results in the response. If you are performing math expressions on this set of data, this name represents that data and can serve as a variable in the mathematical expression. The valid characters are letters, numbers, and underscore. The first character must be a lowercase letter.

[accountId](#accountid_nodejs) string

The ID of the account where the metrics are located, if this is a cross-account alarm.

[expression](#expression_nodejs) string

A Metrics Insights query or a metric math expression to be evaluated on the returned data. For details about Metrics Insights queries, see [Metrics Insights query components and syntax](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch-metrics-insights-querylanguage) in the AWS documentation. For details about metric math expressions, see [Metric Math Syntax and Functions](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/using-metric-math.html#metric-math-syntax) in the AWS documentation.

[label](#label_nodejs) string

A human-readable label for this metric or expression. This is especially useful if this is an expression, so that you know what the value represents.

[metric](#metric_nodejs) [MetricAlarmMetricQueryMetric](#metricalarmmetricquerymetric)

The metric to be returned, along with statistics, period, and units. Use this parameter only if this object is retrieving a metric and not performing a math expression on returned data.

[period](#period_nodejs) number

Granularity in seconds of returned data points. For metrics with regular resolution, valid values are any multiple of `60`. For high-resolution metrics, valid values are `1`, `5`, `10`, `20`, `30`, or any multiple of `60`.

[returnData](#returndata_nodejs) boolean

Specify exactly one `metricQuery` to be `true` to use that `metricQuery` result as the alarm.

> **NOTE:** You must specify either `metric` or `expression`. Not both.

[id](#id_python) This property is required. str

A short name used to tie this object to the results in the response. If you are performing math expressions on this set of data, this name represents that data and can serve as a variable in the mathematical expression. The valid characters are letters, numbers, and underscore. The first character must be a lowercase letter.

[account\_id](#account_id_python) str

The ID of the account where the metrics are located, if this is a cross-account alarm.

[expression](#expression_python) str

A Metrics Insights query or a metric math expression to be evaluated on the returned data. For details about Metrics Insights queries, see [Metrics Insights query components and syntax](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch-metrics-insights-querylanguage) in the AWS documentation. For details about metric math expressions, see [Metric Math Syntax and Functions](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/using-metric-math.html#metric-math-syntax) in the AWS documentation.

[label](#label_python) str

A human-readable label for this metric or expression. This is especially useful if this is an expression, so that you know what the value represents.

[metric](#metric_python) [MetricAlarmMetricQueryMetric](#metricalarmmetricquerymetric)

The metric to be returned, along with statistics, period, and units. Use this parameter only if this object is retrieving a metric and not performing a math expression on returned data.

[period](#period_python) int

Granularity in seconds of returned data points. For metrics with regular resolution, valid values are any multiple of `60`. For high-resolution metrics, valid values are `1`, `5`, `10`, `20`, `30`, or any multiple of `60`.

[return\_data](#return_data_python) bool

Specify exactly one `metricQuery` to be `true` to use that `metricQuery` result as the alarm.

> **NOTE:** You must specify either `metric` or `expression`. Not both.

[id](#id_yaml) This property is required. String

A short name used to tie this object to the results in the response. If you are performing math expressions on this set of data, this name represents that data and can serve as a variable in the mathematical expression. The valid characters are letters, numbers, and underscore. The first character must be a lowercase letter.

[accountId](#accountid_yaml) String

The ID of the account where the metrics are located, if this is a cross-account alarm.

[expression](#expression_yaml) String

A Metrics Insights query or a metric math expression to be evaluated on the returned data. For details about Metrics Insights queries, see [Metrics Insights query components and syntax](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch-metrics-insights-querylanguage) in the AWS documentation. For details about metric math expressions, see [Metric Math Syntax and Functions](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/using-metric-math.html#metric-math-syntax) in the AWS documentation.

[label](#label_yaml) String

A human-readable label for this metric or expression. This is especially useful if this is an expression, so that you know what the value represents.

[metric](#metric_yaml) [Property Map](#metricalarmmetricquerymetric)

The metric to be returned, along with statistics, period, and units. Use this parameter only if this object is retrieving a metric and not performing a math expression on returned data.

[period](#period_yaml) Number

Granularity in seconds of returned data points. For metrics with regular resolution, valid values are any multiple of `60`. For high-resolution metrics, valid values are `1`, `5`, `10`, `20`, `30`, or any multiple of `60`.

[returnData](#returndata_yaml) Boolean

Specify exactly one `metricQuery` to be `true` to use that `metricQuery` result as the alarm.

> **NOTE:** You must specify either `metric` or `expression`. Not both.

#### MetricAlarmMetricQueryMetric

, MetricAlarmMetricQueryMetricArgs

[](#metricalarmmetricquerymetric)

[MetricName](#metricname_csharp) This property is required. string

The name for this metric. See docs for [supported metrics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/CW_Support_For_AWS.html).

[Period](#period_csharp) This property is required. int

Granularity in seconds of returned data points. For metrics with regular resolution, valid values are any multiple of `60`. For high-resolution metrics, valid values are `1`, `5`, `10`, `20`, `30`, or any multiple of `60`.

[Stat](#stat_csharp) This property is required. string

The statistic to apply to this metric. See docs for [supported statistics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Statistics-definitions.html).

[Dimensions](#dimensions_csharp) Dictionary<string, string>

The dimensions for this metric. For the list of available dimensions see the AWS documentation [here](http://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/CW_Support_For_AWS.html).

[Namespace](#namespace_csharp) string

The namespace for this metric. See docs for the [list of namespaces](https://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/aws-namespaces.html). See docs for [supported metrics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/CW_Support_For_AWS.html).

[Unit](#unit_csharp) string

The unit for this metric.

[MetricName](#metricname_go) This property is required. string

The name for this metric. See docs for [supported metrics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/CW_Support_For_AWS.html).

[Period](#period_go) This property is required. int

Granularity in seconds of returned data points. For metrics with regular resolution, valid values are any multiple of `60`. For high-resolution metrics, valid values are `1`, `5`, `10`, `20`, `30`, or any multiple of `60`.

[Stat](#stat_go) This property is required. string

The statistic to apply to this metric. See docs for [supported statistics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Statistics-definitions.html).

[Dimensions](#dimensions_go) map\[string\]string

The dimensions for this metric. For the list of available dimensions see the AWS documentation [here](http://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/CW_Support_For_AWS.html).

[Namespace](#namespace_go) string

The namespace for this metric. See docs for the [list of namespaces](https://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/aws-namespaces.html). See docs for [supported metrics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/CW_Support_For_AWS.html).

[Unit](#unit_go) string

The unit for this metric.

[metric\_name](#metric_name_hcl) This property is required. string

The name for this metric. See docs for [supported metrics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/CW_Support_For_AWS.html).

[period](#period_hcl) This property is required. number

Granularity in seconds of returned data points. For metrics with regular resolution, valid values are any multiple of `60`. For high-resolution metrics, valid values are `1`, `5`, `10`, `20`, `30`, or any multiple of `60`.

[stat](#stat_hcl) This property is required. string

The statistic to apply to this metric. See docs for [supported statistics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Statistics-definitions.html).

[dimensions](#dimensions_hcl) map(string)

The dimensions for this metric. For the list of available dimensions see the AWS documentation [here](http://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/CW_Support_For_AWS.html).

[namespace](#namespace_hcl) string

The namespace for this metric. See docs for the [list of namespaces](https://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/aws-namespaces.html). See docs for [supported metrics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/CW_Support_For_AWS.html).

[unit](#unit_hcl) string

The unit for this metric.

[metricName](#metricname_java) This property is required. String

The name for this metric. See docs for [supported metrics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/CW_Support_For_AWS.html).

[period](#period_java) This property is required. Integer

Granularity in seconds of returned data points. For metrics with regular resolution, valid values are any multiple of `60`. For high-resolution metrics, valid values are `1`, `5`, `10`, `20`, `30`, or any multiple of `60`.

[stat](#stat_java) This property is required. String

The statistic to apply to this metric. See docs for [supported statistics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Statistics-definitions.html).

[dimensions](#dimensions_java) Map<String,String>

The dimensions for this metric. For the list of available dimensions see the AWS documentation [here](http://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/CW_Support_For_AWS.html).

[namespace](#namespace_java) String

The namespace for this metric. See docs for the [list of namespaces](https://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/aws-namespaces.html). See docs for [supported metrics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/CW_Support_For_AWS.html).

[unit](#unit_java) String

The unit for this metric.

[metricName](#metricname_nodejs) This property is required. string

The name for this metric. See docs for [supported metrics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/CW_Support_For_AWS.html).

[period](#period_nodejs) This property is required. number

Granularity in seconds of returned data points. For metrics with regular resolution, valid values are any multiple of `60`. For high-resolution metrics, valid values are `1`, `5`, `10`, `20`, `30`, or any multiple of `60`.

[stat](#stat_nodejs) This property is required. string

The statistic to apply to this metric. See docs for [supported statistics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Statistics-definitions.html).

[dimensions](#dimensions_nodejs) {\[key: string\]: string}

The dimensions for this metric. For the list of available dimensions see the AWS documentation [here](http://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/CW_Support_For_AWS.html).

[namespace](#namespace_nodejs) string

The namespace for this metric. See docs for the [list of namespaces](https://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/aws-namespaces.html). See docs for [supported metrics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/CW_Support_For_AWS.html).

[unit](#unit_nodejs) string

The unit for this metric.

[metric\_name](#metric_name_python) This property is required. str

The name for this metric. See docs for [supported metrics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/CW_Support_For_AWS.html).

[period](#period_python) This property is required. int

Granularity in seconds of returned data points. For metrics with regular resolution, valid values are any multiple of `60`. For high-resolution metrics, valid values are `1`, `5`, `10`, `20`, `30`, or any multiple of `60`.

[stat](#stat_python) This property is required. str

The statistic to apply to this metric. See docs for [supported statistics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Statistics-definitions.html).

[dimensions](#dimensions_python) Mapping\[str, str\]

The dimensions for this metric. For the list of available dimensions see the AWS documentation [here](http://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/CW_Support_For_AWS.html).

[namespace](#namespace_python) str

The namespace for this metric. See docs for the [list of namespaces](https://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/aws-namespaces.html). See docs for [supported metrics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/CW_Support_For_AWS.html).

[unit](#unit_python) str

The unit for this metric.

[metricName](#metricname_yaml) This property is required. String

The name for this metric. See docs for [supported metrics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/CW_Support_For_AWS.html).

[period](#period_yaml) This property is required. Number

Granularity in seconds of returned data points. For metrics with regular resolution, valid values are any multiple of `60`. For high-resolution metrics, valid values are `1`, `5`, `10`, `20`, `30`, or any multiple of `60`.

[stat](#stat_yaml) This property is required. String

The statistic to apply to this metric. See docs for [supported statistics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Statistics-definitions.html).

[dimensions](#dimensions_yaml) Map<String>

The dimensions for this metric. For the list of available dimensions see the AWS documentation [here](http://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/CW_Support_For_AWS.html).

[namespace](#namespace_yaml) String

The namespace for this metric. See docs for the [list of namespaces](https://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/aws-namespaces.html). See docs for [supported metrics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/CW_Support_For_AWS.html).

[unit](#unit_yaml) String

The unit for this metric.

## Import[](#import)

### Identity Schema[](#identity-schema)

#### Required[](#required)

-   `alarmName` (String) Name of the CloudWatch metric alarm.

#### Optional[](#optional)

-   `accountId` (String) AWS Account where this resource is managed.
-   `region` (String) Region where this resource is managed.

Using `pulumi import`, import CloudWatch Metric Alarm using the `alarmName`. For example:

```bash
$ pulumi import aws:cloudwatch/metricAlarm:MetricAlarm example alarm-12345
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

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2fcloudwatch%2fmetricalarm]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2fcloudwatch%2fmetricalarm%2f\))

#### Try Pulumi Cloud free.
Your team will thank you.

[Start free trial](https://app.pulumi.com/signup?utm_source=registry&utm_medium=right-rail-banner&utm_campaign=try-pulumi-cloud&iaid=docs-try-pulumi-cloud-ad)
