---
Source: https://www.pulumi.com/registry/packages/aws/api-docs/dynamodb/table/
Generated: 2026-06-06
Updated: 2026-06-06
---

# aws.dynamodb.Table

1.  [Packages](/registry/)
2.  [Packages](/registry/packages/)
3.  [AWS](/registry/packages/aws/)
4.  [API Docs](/registry/packages/aws/api-docs/)
5.  [dynamodb](/registry/packages/aws/api-docs/dynamodb/)
6.  [Table](/registry/packages/aws/api-docs/dynamodb/table/)

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

Viewing docs for AWS v7.32.0
published on Friday, May 29, 2026 by Pulumi

[Schema (JSON)](/registry/packages/aws/schema.json)

[pulumi/pulumi-aws](https://github.com/pulumi/pulumi-aws)

v7.32.0 (7.x, latest)v6.83.1 (6.x)v5.43.0 (5.x)

# aws.dynamodb.Table[](#aws-dynamodb-table)

Explore with Neo

-   Copy Page

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2fdynamodb%2ftable]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2fdynamodb%2ftable%2f\))

Provides a DynamoDB table resource.

> **Note:** It is recommended to use [`ignoreChanges`](https://www.pulumi.com/docs/intro/concepts/programming-model/#ignorechanges) for `readCapacity` and/or `writeCapacity` if there’s `autoscaling policy` attached to the table.

> **Note:** When using aws.dynamodb.TableReplica with this resource, use `lifecycle` `ignoreChanges` for `replica`, *e.g.*, `lifecycle { ignoreChanges = [replica] }`.

> **Note:** If autoscaling creates drift for your `globalSecondaryIndex` blocks and/or more granular `lifecycle` management for GSIs, we recommend using the new **experimental** resource `aws.dynamodb.GlobalSecondaryIndex`.

## DynamoDB Table attributes[](#dynamodb-table-attributes)

Only define attributes on the table object that are going to be used as:

-   Table hash key or range key
-   LSI or GSI hash key or range key

The DynamoDB API expects attribute structure (name and type) to be passed along when creating or updating GSI/LSIs or creating the initial table. In these cases it expects the Hash / Range keys to be provided. Because these get re-used in numerous places (i.e the table’s range key could be a part of one or more GSIs), they are stored on the table object to prevent duplication and increase consistency. If you add attributes here that are not used in these scenarios it can cause an infinite loop in planning.

> **Note:** When using the `aws.dynamodb.GlobalSecondaryIndex` resource, you do not need to define the attributes for externally managed GSIs in the `aws.dynamodb.Table` resource.

## Example Usage[](#example-usage)

### Basic Example[](#basic-example)

The following dynamodb table description models the table and GSI shown in the [AWS SDK example documentation](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GSI.html)

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

const basic_dynamodb_table = new aws.dynamodb.Table("basic-dynamodb-table", {
    name: "GameScores",
    billingMode: "PROVISIONED",
    readCapacity: 20,
    writeCapacity: 20,
    hashKey: "UserId",
    rangeKey: "GameTitle",
    attributes: [
        {
            name: "UserId",
            type: "S",
        },
        {
            name: "GameTitle",
            type: "S",
        },
        {
            name: "TopScore",
            type: "N",
        },
    ],
    ttl: {
        attributeName: "TimeToExist",
        enabled: true,
    },
    globalSecondaryIndexes: [{
        name: "GameTitleIndex",
        hashKey: "GameTitle",
        rangeKey: "TopScore",
        writeCapacity: 10,
        readCapacity: 10,
        projectionType: "INCLUDE",
        nonKeyAttributes: ["UserId"],
    }],
    tags: {
        Name: "dynamodb-table-1",
        Environment: "production",
    },
});
```

```python
import pulumi
import pulumi_aws as aws

basic_dynamodb_table = aws.dynamodb.Table("basic-dynamodb-table",
    name="GameScores",
    billing_mode="PROVISIONED",
    read_capacity=20,
    write_capacity=20,
    hash_key="UserId",
    range_key="GameTitle",
    attributes=[
        {
            "name": "UserId",
            "type": "S",
        },
        {
            "name": "GameTitle",
            "type": "S",
        },
        {
            "name": "TopScore",
            "type": "N",
        },
    ],
    ttl={
        "attribute_name": "TimeToExist",
        "enabled": True,
    },
    global_secondary_indexes=[{
        "name": "GameTitleIndex",
        "hash_key": "GameTitle",
        "range_key": "TopScore",
        "write_capacity": 10,
        "read_capacity": 10,
        "projection_type": "INCLUDE",
        "non_key_attributes": ["UserId"],
    }],
    tags={
        "Name": "dynamodb-table-1",
        "Environment": "production",
    })
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/dynamodb"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		_, err := dynamodb.NewTable(ctx, "basic-dynamodb-table", &dynamodb.TableArgs{
			Name:          pulumi.String("GameScores"),
			BillingMode:   pulumi.String("PROVISIONED"),
			ReadCapacity:  pulumi.Int(20),
			WriteCapacity: pulumi.Int(20),
			HashKey:       pulumi.String("UserId"),
			RangeKey:      pulumi.String("GameTitle"),
			Attributes: dynamodb.TableAttributeArray{
				&dynamodb.TableAttributeArgs{
					Name: pulumi.String("UserId"),
					Type: pulumi.String("S"),
				},
				&dynamodb.TableAttributeArgs{
					Name: pulumi.String("GameTitle"),
					Type: pulumi.String("S"),
				},
				&dynamodb.TableAttributeArgs{
					Name: pulumi.String("TopScore"),
					Type: pulumi.String("N"),
				},
			},
			Ttl: &dynamodb.TableTtlArgs{
				AttributeName: pulumi.String("TimeToExist"),
				Enabled:       pulumi.Bool(true),
			},
			GlobalSecondaryIndexes: dynamodb.TableGlobalSecondaryIndexArray{
				&dynamodb.TableGlobalSecondaryIndexArgs{
					Name:           pulumi.String("GameTitleIndex"),
					HashKey:        pulumi.String("GameTitle"),
					RangeKey:       pulumi.String("TopScore"),
					WriteCapacity:  pulumi.Int(10),
					ReadCapacity:   pulumi.Int(10),
					ProjectionType: pulumi.String("INCLUDE"),
					NonKeyAttributes: pulumi.StringArray{
						pulumi.String("UserId"),
					},
				},
			},
			Tags: pulumi.StringMap{
				"Name":        pulumi.String("dynamodb-table-1"),
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
using Pulumi;
using Aws = Pulumi.Aws;

return await Deployment.RunAsync(() =>
{
    var basic_dynamodb_table = new Aws.DynamoDB.Table("basic-dynamodb-table", new()
    {
        Name = "GameScores",
        BillingMode = "PROVISIONED",
        ReadCapacity = 20,
        WriteCapacity = 20,
        HashKey = "UserId",
        RangeKey = "GameTitle",
        Attributes = new[]
        {
            new Aws.DynamoDB.Inputs.TableAttributeArgs
            {
                Name = "UserId",
                Type = "S",
            },
            new Aws.DynamoDB.Inputs.TableAttributeArgs
            {
                Name = "GameTitle",
                Type = "S",
            },
            new Aws.DynamoDB.Inputs.TableAttributeArgs
            {
                Name = "TopScore",
                Type = "N",
            },
        },
        Ttl = new Aws.DynamoDB.Inputs.TableTtlArgs
        {
            AttributeName = "TimeToExist",
            Enabled = true,
        },
        GlobalSecondaryIndexes = new[]
        {
            new Aws.DynamoDB.Inputs.TableGlobalSecondaryIndexArgs
            {
                Name = "GameTitleIndex",
                HashKey = "GameTitle",
                RangeKey = "TopScore",
                WriteCapacity = 10,
                ReadCapacity = 10,
                ProjectionType = "INCLUDE",
                NonKeyAttributes = new[]
                {
                    "UserId",
                },
            },
        },
        Tags =
        {
            { "Name", "dynamodb-table-1" },
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
import com.pulumi.aws.dynamodb.Table;
import com.pulumi.aws.dynamodb.TableArgs;
import com.pulumi.aws.dynamodb.inputs.TableAttributeArgs;
import com.pulumi.aws.dynamodb.inputs.TableTtlArgs;
import com.pulumi.aws.dynamodb.inputs.TableGlobalSecondaryIndexArgs;
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
        var basic_dynamodb_table = new Table("basic-dynamodb-table", TableArgs.builder()
            .name("GameScores")
            .billingMode("PROVISIONED")
            .readCapacity(20)
            .writeCapacity(20)
            .hashKey("UserId")
            .rangeKey("GameTitle")
            .attributes(
                TableAttributeArgs.builder()
                    .name("UserId")
                    .type("S")
                    .build(),
                TableAttributeArgs.builder()
                    .name("GameTitle")
                    .type("S")
                    .build(),
                TableAttributeArgs.builder()
                    .name("TopScore")
                    .type("N")
                    .build())
            .ttl(TableTtlArgs.builder()
                .attributeName("TimeToExist")
                .enabled(true)
                .build())
            .globalSecondaryIndexes(TableGlobalSecondaryIndexArgs.builder()
                .name("GameTitleIndex")
                .hashKey("GameTitle")
                .rangeKey("TopScore")
                .writeCapacity(10)
                .readCapacity(10)
                .projectionType("INCLUDE")
                .nonKeyAttributes("UserId")
                .build())
            .tags(Map.ofEntries(
                Map.entry("Name", "dynamodb-table-1"),
                Map.entry("Environment", "production")
            ))
            .build());

    }
}
```

```yaml
resources:
  basic-dynamodb-table:
    type: aws:dynamodb:Table
    properties:
      name: GameScores
      billingMode: PROVISIONED
      readCapacity: 20
      writeCapacity: 20
      hashKey: UserId
      rangeKey: GameTitle
      attributes:
        - name: UserId
          type: S
        - name: GameTitle
          type: S
        - name: TopScore
          type: N
      ttl:
        attributeName: TimeToExist
        enabled: true
      globalSecondaryIndexes:
        - name: GameTitleIndex
          hashKey: GameTitle
          rangeKey: TopScore
          writeCapacity: 10
          readCapacity: 10
          projectionType: INCLUDE
          nonKeyAttributes:
            - UserId
      tags:
        Name: dynamodb-table-1
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

resource "aws_dynamodb_table" "basic-dynamodb-table" {
  name           = "GameScores"
  billing_mode   = "PROVISIONED"
  read_capacity  = 20
  write_capacity = 20
  hash_key       = "UserId"
  range_key      = "GameTitle"
  attributes {
    name = "UserId"
    type = "S"
  }
  attributes {
    name = "GameTitle"
    type = "S"
  }
  attributes {
    name = "TopScore"
    type = "N"
  }
  ttl = {
    attribute_name = "TimeToExist"
    enabled        = true
  }
  global_secondary_indexes {
    name               = "GameTitleIndex"
    hash_key           = "GameTitle"
    range_key          = "TopScore"
    write_capacity     = 10
    read_capacity      = 10
    projection_type    = "INCLUDE"
    non_key_attributes = ["UserId"]
  }
  tags = {
    "Name"        = "dynamodb-table-1"
    "Environment" = "production"
  }
}
```

### Basic Example containing Global Secondary Indexes using Multi-attribute keys pattern[](#basic-example-containing-global-secondary-indexes-using-multi-attribute-keys-pattern)

The following dynamodb table description models the table and GSIs shown in the [AWS SDK example documentation](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GSI.DesignPattern.MultiAttributeKeys.html)

> **Note:** Multi-attribute keys for GSIs use the `keySchema` block instead of `hashKey`/`rangeKey`. The `hashKey` and `rangeKey` arguments are deprecated in favor of `keySchema`.

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

const basic_dynamodb_table = new aws.dynamodb.Table("basic-dynamodb-table", {
    name: "TournamentMatches",
    billingMode: "PROVISIONED",
    readCapacity: 20,
    writeCapacity: 20,
    hashKey: "matchId",
    attributes: [
        {
            name: "matchId",
            type: "S",
        },
        {
            name: "tournamentId",
            type: "S",
        },
        {
            name: "region",
            type: "S",
        },
        {
            name: "round",
            type: "S",
        },
        {
            name: "bracket",
            type: "S",
        },
        {
            name: "playerId",
            type: "N",
        },
        {
            name: "matchDate",
            type: "S",
        },
    ],
    ttl: {
        attributeName: "TimeToExist",
        enabled: true,
    },
    globalSecondaryIndexes: [
        {
            name: "TournamentRegionIndex",
            keySchemas: [
                {
                    attributeName: "tournamentId",
                    keyType: "HASH",
                },
                {
                    attributeName: "region",
                    keyType: "HASH",
                },
                {
                    attributeName: "round",
                    keyType: "RANGE",
                },
                {
                    attributeName: "bracket",
                    keyType: "RANGE",
                },
                {
                    attributeName: "matchId",
                    keyType: "RANGE",
                },
            ],
            writeCapacity: 10,
            readCapacity: 10,
            projectionType: "ALL",
        },
        {
            name: "PlayerMatchHistoryIndex",
            keySchemas: [
                {
                    attributeName: "playerId",
                    keyType: "HASH",
                },
                {
                    attributeName: "matchDate",
                    keyType: "RANGE",
                },
                {
                    attributeName: "round",
                    keyType: "RANGE",
                },
            ],
            writeCapacity: 10,
            readCapacity: 10,
            projectionType: "ALL",
        },
    ],
    tags: {
        Name: "dynamodb-table-1",
        Environment: "production",
    },
});
```

```python
import pulumi
import pulumi_aws as aws

basic_dynamodb_table = aws.dynamodb.Table("basic-dynamodb-table",
    name="TournamentMatches",
    billing_mode="PROVISIONED",
    read_capacity=20,
    write_capacity=20,
    hash_key="matchId",
    attributes=[
        {
            "name": "matchId",
            "type": "S",
        },
        {
            "name": "tournamentId",
            "type": "S",
        },
        {
            "name": "region",
            "type": "S",
        },
        {
            "name": "round",
            "type": "S",
        },
        {
            "name": "bracket",
            "type": "S",
        },
        {
            "name": "playerId",
            "type": "N",
        },
        {
            "name": "matchDate",
            "type": "S",
        },
    ],
    ttl={
        "attribute_name": "TimeToExist",
        "enabled": True,
    },
    global_secondary_indexes=[
        {
            "name": "TournamentRegionIndex",
            "key_schemas": [
                {
                    "attribute_name": "tournamentId",
                    "key_type": "HASH",
                },
                {
                    "attribute_name": "region",
                    "key_type": "HASH",
                },
                {
                    "attribute_name": "round",
                    "key_type": "RANGE",
                },
                {
                    "attribute_name": "bracket",
                    "key_type": "RANGE",
                },
                {
                    "attribute_name": "matchId",
                    "key_type": "RANGE",
                },
            ],
            "write_capacity": 10,
            "read_capacity": 10,
            "projection_type": "ALL",
        },
        {
            "name": "PlayerMatchHistoryIndex",
            "key_schemas": [
                {
                    "attribute_name": "playerId",
                    "key_type": "HASH",
                },
                {
                    "attribute_name": "matchDate",
                    "key_type": "RANGE",
                },
                {
                    "attribute_name": "round",
                    "key_type": "RANGE",
                },
            ],
            "write_capacity": 10,
            "read_capacity": 10,
            "projection_type": "ALL",
        },
    ],
    tags={
        "Name": "dynamodb-table-1",
        "Environment": "production",
    })
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/dynamodb"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		_, err := dynamodb.NewTable(ctx, "basic-dynamodb-table", &dynamodb.TableArgs{
			Name:          pulumi.String("TournamentMatches"),
			BillingMode:   pulumi.String("PROVISIONED"),
			ReadCapacity:  pulumi.Int(20),
			WriteCapacity: pulumi.Int(20),
			HashKey:       pulumi.String("matchId"),
			Attributes: dynamodb.TableAttributeArray{
				&dynamodb.TableAttributeArgs{
					Name: pulumi.String("matchId"),
					Type: pulumi.String("S"),
				},
				&dynamodb.TableAttributeArgs{
					Name: pulumi.String("tournamentId"),
					Type: pulumi.String("S"),
				},
				&dynamodb.TableAttributeArgs{
					Name: pulumi.String("region"),
					Type: pulumi.String("S"),
				},
				&dynamodb.TableAttributeArgs{
					Name: pulumi.String("round"),
					Type: pulumi.String("S"),
				},
				&dynamodb.TableAttributeArgs{
					Name: pulumi.String("bracket"),
					Type: pulumi.String("S"),
				},
				&dynamodb.TableAttributeArgs{
					Name: pulumi.String("playerId"),
					Type: pulumi.String("N"),
				},
				&dynamodb.TableAttributeArgs{
					Name: pulumi.String("matchDate"),
					Type: pulumi.String("S"),
				},
			},
			Ttl: &dynamodb.TableTtlArgs{
				AttributeName: pulumi.String("TimeToExist"),
				Enabled:       pulumi.Bool(true),
			},
			GlobalSecondaryIndexes: dynamodb.TableGlobalSecondaryIndexArray{
				&dynamodb.TableGlobalSecondaryIndexArgs{
					Name: pulumi.String("TournamentRegionIndex"),
					KeySchemas: dynamodb.TableGlobalSecondaryIndexKeySchemaArray{
						&dynamodb.TableGlobalSecondaryIndexKeySchemaArgs{
							AttributeName: pulumi.String("tournamentId"),
							KeyType:       pulumi.String("HASH"),
						},
						&dynamodb.TableGlobalSecondaryIndexKeySchemaArgs{
							AttributeName: pulumi.String("region"),
							KeyType:       pulumi.String("HASH"),
						},
						&dynamodb.TableGlobalSecondaryIndexKeySchemaArgs{
							AttributeName: pulumi.String("round"),
							KeyType:       pulumi.String("RANGE"),
						},
						&dynamodb.TableGlobalSecondaryIndexKeySchemaArgs{
							AttributeName: pulumi.String("bracket"),
							KeyType:       pulumi.String("RANGE"),
						},
						&dynamodb.TableGlobalSecondaryIndexKeySchemaArgs{
							AttributeName: pulumi.String("matchId"),
							KeyType:       pulumi.String("RANGE"),
						},
					},
					WriteCapacity:  pulumi.Int(10),
					ReadCapacity:   pulumi.Int(10),
					ProjectionType: pulumi.String("ALL"),
				},
				&dynamodb.TableGlobalSecondaryIndexArgs{
					Name: pulumi.String("PlayerMatchHistoryIndex"),
					KeySchemas: dynamodb.TableGlobalSecondaryIndexKeySchemaArray{
						&dynamodb.TableGlobalSecondaryIndexKeySchemaArgs{
							AttributeName: pulumi.String("playerId"),
							KeyType:       pulumi.String("HASH"),
						},
						&dynamodb.TableGlobalSecondaryIndexKeySchemaArgs{
							AttributeName: pulumi.String("matchDate"),
							KeyType:       pulumi.String("RANGE"),
						},
						&dynamodb.TableGlobalSecondaryIndexKeySchemaArgs{
							AttributeName: pulumi.String("round"),
							KeyType:       pulumi.String("RANGE"),
						},
					},
					WriteCapacity:  pulumi.Int(10),
					ReadCapacity:   pulumi.Int(10),
					ProjectionType: pulumi.String("ALL"),
				},
			},
			Tags: pulumi.StringMap{
				"Name":        pulumi.String("dynamodb-table-1"),
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
using Pulumi;
using Aws = Pulumi.Aws;

return await Deployment.RunAsync(() =>
{
    var basic_dynamodb_table = new Aws.DynamoDB.Table("basic-dynamodb-table", new()
    {
        Name = "TournamentMatches",
        BillingMode = "PROVISIONED",
        ReadCapacity = 20,
        WriteCapacity = 20,
        HashKey = "matchId",
        Attributes = new[]
        {
            new Aws.DynamoDB.Inputs.TableAttributeArgs
            {
                Name = "matchId",
                Type = "S",
            },
            new Aws.DynamoDB.Inputs.TableAttributeArgs
            {
                Name = "tournamentId",
                Type = "S",
            },
            new Aws.DynamoDB.Inputs.TableAttributeArgs
            {
                Name = "region",
                Type = "S",
            },
            new Aws.DynamoDB.Inputs.TableAttributeArgs
            {
                Name = "round",
                Type = "S",
            },
            new Aws.DynamoDB.Inputs.TableAttributeArgs
            {
                Name = "bracket",
                Type = "S",
            },
            new Aws.DynamoDB.Inputs.TableAttributeArgs
            {
                Name = "playerId",
                Type = "N",
            },
            new Aws.DynamoDB.Inputs.TableAttributeArgs
            {
                Name = "matchDate",
                Type = "S",
            },
        },
        Ttl = new Aws.DynamoDB.Inputs.TableTtlArgs
        {
            AttributeName = "TimeToExist",
            Enabled = true,
        },
        GlobalSecondaryIndexes = new[]
        {
            new Aws.DynamoDB.Inputs.TableGlobalSecondaryIndexArgs
            {
                Name = "TournamentRegionIndex",
                KeySchemas = new[]
                {
                    new Aws.DynamoDB.Inputs.TableGlobalSecondaryIndexKeySchemaArgs
                    {
                        AttributeName = "tournamentId",
                        KeyType = "HASH",
                    },
                    new Aws.DynamoDB.Inputs.TableGlobalSecondaryIndexKeySchemaArgs
                    {
                        AttributeName = "region",
                        KeyType = "HASH",
                    },
                    new Aws.DynamoDB.Inputs.TableGlobalSecondaryIndexKeySchemaArgs
                    {
                        AttributeName = "round",
                        KeyType = "RANGE",
                    },
                    new Aws.DynamoDB.Inputs.TableGlobalSecondaryIndexKeySchemaArgs
                    {
                        AttributeName = "bracket",
                        KeyType = "RANGE",
                    },
                    new Aws.DynamoDB.Inputs.TableGlobalSecondaryIndexKeySchemaArgs
                    {
                        AttributeName = "matchId",
                        KeyType = "RANGE",
                    },
                },
                WriteCapacity = 10,
                ReadCapacity = 10,
                ProjectionType = "ALL",
            },
            new Aws.DynamoDB.Inputs.TableGlobalSecondaryIndexArgs
            {
                Name = "PlayerMatchHistoryIndex",
                KeySchemas = new[]
                {
                    new Aws.DynamoDB.Inputs.TableGlobalSecondaryIndexKeySchemaArgs
                    {
                        AttributeName = "playerId",
                        KeyType = "HASH",
                    },
                    new Aws.DynamoDB.Inputs.TableGlobalSecondaryIndexKeySchemaArgs
                    {
                        AttributeName = "matchDate",
                        KeyType = "RANGE",
                    },
                    new Aws.DynamoDB.Inputs.TableGlobalSecondaryIndexKeySchemaArgs
                    {
                        AttributeName = "round",
                        KeyType = "RANGE",
                    },
                },
                WriteCapacity = 10,
                ReadCapacity = 10,
                ProjectionType = "ALL",
            },
        },
        Tags =
        {
            { "Name", "dynamodb-table-1" },
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
import com.pulumi.aws.dynamodb.Table;
import com.pulumi.aws.dynamodb.TableArgs;
import com.pulumi.aws.dynamodb.inputs.TableAttributeArgs;
import com.pulumi.aws.dynamodb.inputs.TableTtlArgs;
import com.pulumi.aws.dynamodb.inputs.TableGlobalSecondaryIndexArgs;
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
        var basic_dynamodb_table = new Table("basic-dynamodb-table", TableArgs.builder()
            .name("TournamentMatches")
            .billingMode("PROVISIONED")
            .readCapacity(20)
            .writeCapacity(20)
            .hashKey("matchId")
            .attributes(
                TableAttributeArgs.builder()
                    .name("matchId")
                    .type("S")
                    .build(),
                TableAttributeArgs.builder()
                    .name("tournamentId")
                    .type("S")
                    .build(),
                TableAttributeArgs.builder()
                    .name("region")
                    .type("S")
                    .build(),
                TableAttributeArgs.builder()
                    .name("round")
                    .type("S")
                    .build(),
                TableAttributeArgs.builder()
                    .name("bracket")
                    .type("S")
                    .build(),
                TableAttributeArgs.builder()
                    .name("playerId")
                    .type("N")
                    .build(),
                TableAttributeArgs.builder()
                    .name("matchDate")
                    .type("S")
                    .build())
            .ttl(TableTtlArgs.builder()
                .attributeName("TimeToExist")
                .enabled(true)
                .build())
            .globalSecondaryIndexes(
                TableGlobalSecondaryIndexArgs.builder()
                    .name("TournamentRegionIndex")
                    .keySchemas(
                        TableGlobalSecondaryIndexKeySchemaArgs.builder()
                            .attributeName("tournamentId")
                            .keyType("HASH")
                            .build(),
                        TableGlobalSecondaryIndexKeySchemaArgs.builder()
                            .attributeName("region")
                            .keyType("HASH")
                            .build(),
                        TableGlobalSecondaryIndexKeySchemaArgs.builder()
                            .attributeName("round")
                            .keyType("RANGE")
                            .build(),
                        TableGlobalSecondaryIndexKeySchemaArgs.builder()
                            .attributeName("bracket")
                            .keyType("RANGE")
                            .build(),
                        TableGlobalSecondaryIndexKeySchemaArgs.builder()
                            .attributeName("matchId")
                            .keyType("RANGE")
                            .build())
                    .writeCapacity(10)
                    .readCapacity(10)
                    .projectionType("ALL")
                    .build(),
                TableGlobalSecondaryIndexArgs.builder()
                    .name("PlayerMatchHistoryIndex")
                    .keySchemas(
                        TableGlobalSecondaryIndexKeySchemaArgs.builder()
                            .attributeName("playerId")
                            .keyType("HASH")
                            .build(),
                        TableGlobalSecondaryIndexKeySchemaArgs.builder()
                            .attributeName("matchDate")
                            .keyType("RANGE")
                            .build(),
                        TableGlobalSecondaryIndexKeySchemaArgs.builder()
                            .attributeName("round")
                            .keyType("RANGE")
                            .build())
                    .writeCapacity(10)
                    .readCapacity(10)
                    .projectionType("ALL")
                    .build())
            .tags(Map.ofEntries(
                Map.entry("Name", "dynamodb-table-1"),
                Map.entry("Environment", "production")
            ))
            .build());

    }
}
```

```yaml
resources:
  basic-dynamodb-table:
    type: aws:dynamodb:Table
    properties:
      name: TournamentMatches
      billingMode: PROVISIONED
      readCapacity: 20
      writeCapacity: 20
      hashKey: matchId
      attributes:
        - name: matchId
          type: S
        - name: tournamentId
          type: S
        - name: region
          type: S
        - name: round
          type: S
        - name: bracket
          type: S
        - name: playerId
          type: N
        - name: matchDate
          type: S
      ttl:
        attributeName: TimeToExist
        enabled: true
      globalSecondaryIndexes:
        - name: TournamentRegionIndex
          keySchemas:
            - attributeName: tournamentId
              keyType: HASH
            - attributeName: region
              keyType: HASH
            - attributeName: round
              keyType: RANGE
            - attributeName: bracket
              keyType: RANGE
            - attributeName: matchId
              keyType: RANGE
          writeCapacity: 10
          readCapacity: 10
          projectionType: ALL
        - name: PlayerMatchHistoryIndex
          keySchemas:
            - attributeName: playerId
              keyType: HASH
            - attributeName: matchDate
              keyType: RANGE
            - attributeName: round
              keyType: RANGE
          writeCapacity: 10
          readCapacity: 10
          projectionType: ALL
      tags:
        Name: dynamodb-table-1
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

resource "aws_dynamodb_table" "basic-dynamodb-table" {
  name           = "TournamentMatches"
  billing_mode   = "PROVISIONED"
  read_capacity  = 20
  write_capacity = 20
  hash_key       = "matchId"
  attributes {
    name = "matchId"
    type = "S"
  }
  attributes {
    name = "tournamentId"
    type = "S"
  }
  attributes {
    name = "region"
    type = "S"
  }
  attributes {
    name = "round"
    type = "S"
  }
  attributes {
    name = "bracket"
    type = "S"
  }
  attributes {
    name = "playerId"
    type = "N"
  }
  attributes {
    name = "matchDate"
    type = "S"
  }
  ttl = {
    attribute_name = "TimeToExist"
    enabled        = true
  }
  global_secondary_indexes {
    name = "TournamentRegionIndex"
    key_schemas {
      attribute_name = "tournamentId"
      key_type       = "HASH"
    }
    key_schemas {
      attribute_name = "region"
      key_type       = "HASH"
    }
    key_schemas {
      attribute_name = "round"
      key_type       = "RANGE"
    }
    key_schemas {
      attribute_name = "bracket"
      key_type       = "RANGE"
    }
    key_schemas {
      attribute_name = "matchId"
      key_type       = "RANGE"
    }
    write_capacity  = 10
    read_capacity   = 10
    projection_type = "ALL"
  }
  global_secondary_indexes {
    name = "PlayerMatchHistoryIndex"
    key_schemas {
      attribute_name = "playerId"
      key_type       = "HASH"
    }
    key_schemas {
      attribute_name = "matchDate"
      key_type       = "RANGE"
    }
    key_schemas {
      attribute_name = "round"
      key_type       = "RANGE"
    }
    write_capacity  = 10
    read_capacity   = 10
    projection_type = "ALL"
  }
  tags = {
    "Name"        = "dynamodb-table-1"
    "Environment" = "production"
  }
}
```

### Global Tables[](#global-tables)

This resource implements support for [DynamoDB Global Tables V2 (version 2019.11.21)](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/globaltables.V2.html) via `replica` configuration blocks. For working with [DynamoDB Global Tables V1 (version 2017.11.29)](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/globaltables.V1.html), see the `aws.dynamodb.GlobalTable` resource.

> **Note:** aws.dynamodb.TableReplica is an alternate way of configuring Global Tables. Do not use `replica` configuration blocks of `aws.dynamodb.Table` together with aws\_dynamodb\_table\_replica.

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

const example = new aws.dynamodb.Table("example", {
    name: "example",
    hashKey: "TestTableHashKey",
    billingMode: "PAY_PER_REQUEST",
    streamEnabled: true,
    streamViewType: "NEW_AND_OLD_IMAGES",
    attributes: [{
        name: "TestTableHashKey",
        type: "S",
    }],
    replicas: [
        {
            regionName: "us-east-2",
        },
        {
            regionName: "us-west-2",
        },
    ],
});
```

```python
import pulumi
import pulumi_aws as aws

example = aws.dynamodb.Table("example",
    name="example",
    hash_key="TestTableHashKey",
    billing_mode="PAY_PER_REQUEST",
    stream_enabled=True,
    stream_view_type="NEW_AND_OLD_IMAGES",
    attributes=[{
        "name": "TestTableHashKey",
        "type": "S",
    }],
    replicas=[
        {
            "region_name": "us-east-2",
        },
        {
            "region_name": "us-west-2",
        },
    ])
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/dynamodb"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		_, err := dynamodb.NewTable(ctx, "example", &dynamodb.TableArgs{
			Name:           pulumi.String("example"),
			HashKey:        pulumi.String("TestTableHashKey"),
			BillingMode:    pulumi.String("PAY_PER_REQUEST"),
			StreamEnabled:  pulumi.Bool(true),
			StreamViewType: pulumi.String("NEW_AND_OLD_IMAGES"),
			Attributes: dynamodb.TableAttributeArray{
				&dynamodb.TableAttributeArgs{
					Name: pulumi.String("TestTableHashKey"),
					Type: pulumi.String("S"),
				},
			},
			Replicas: dynamodb.TableReplicaTypeArray{
				&dynamodb.TableReplicaTypeArgs{
					RegionName: pulumi.String("us-east-2"),
				},
				&dynamodb.TableReplicaTypeArgs{
					RegionName: pulumi.String("us-west-2"),
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
    var example = new Aws.DynamoDB.Table("example", new()
    {
        Name = "example",
        HashKey = "TestTableHashKey",
        BillingMode = "PAY_PER_REQUEST",
        StreamEnabled = true,
        StreamViewType = "NEW_AND_OLD_IMAGES",
        Attributes = new[]
        {
            new Aws.DynamoDB.Inputs.TableAttributeArgs
            {
                Name = "TestTableHashKey",
                Type = "S",
            },
        },
        Replicas = new[]
        {
            new Aws.DynamoDB.Inputs.TableReplicaArgs
            {
                RegionName = "us-east-2",
            },
            new Aws.DynamoDB.Inputs.TableReplicaArgs
            {
                RegionName = "us-west-2",
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
import com.pulumi.aws.dynamodb.Table;
import com.pulumi.aws.dynamodb.TableArgs;
import com.pulumi.aws.dynamodb.inputs.TableAttributeArgs;
import com.pulumi.aws.dynamodb.inputs.TableReplicaArgs;
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
        var example = new Table("example", TableArgs.builder()
            .name("example")
            .hashKey("TestTableHashKey")
            .billingMode("PAY_PER_REQUEST")
            .streamEnabled(true)
            .streamViewType("NEW_AND_OLD_IMAGES")
            .attributes(TableAttributeArgs.builder()
                .name("TestTableHashKey")
                .type("S")
                .build())
            .replicas(
                TableReplicaArgs.builder()
                    .regionName("us-east-2")
                    .build(),
                TableReplicaArgs.builder()
                    .regionName("us-west-2")
                    .build())
            .build());

    }
}
```

```yaml
resources:
  example:
    type: aws:dynamodb:Table
    properties:
      name: example
      hashKey: TestTableHashKey
      billingMode: PAY_PER_REQUEST
      streamEnabled: true
      streamViewType: NEW_AND_OLD_IMAGES
      attributes:
        - name: TestTableHashKey
          type: S
      replicas:
        - regionName: us-east-2
        - regionName: us-west-2
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_dynamodb_table" "example" {
  name             = "example"
  hash_key         = "TestTableHashKey"
  billing_mode     = "PAY_PER_REQUEST"
  stream_enabled   = true
  stream_view_type = "NEW_AND_OLD_IMAGES"
  attributes {
    name = "TestTableHashKey"
    type = "S"
  }
  replicas {
    region_name = "us-east-2"
  }
  replicas {
    region_name = "us-west-2"
  }
}
```

### Global Tables with Multi-Region Strong Consistency[](#global-tables-with-multi-region-strong-consistency)

A global table configured for Multi-Region strong consistency (MRSC) provides the ability to perform a strongly consistent read with multi-Region scope. Performing a strongly consistent read on an MRSC table ensures you’re always reading the latest version of an item, irrespective of the Region in which you’re performing the read.

You can configure a MRSC global table with three replicas, or with two replicas and one witness. A witness is a component of a MRSC global table that contains data written to global table replicas, and provides an optional alternative to a full replica while supporting MRSC’s availability architecture. You cannot perform read or write operations on a witness. A witness is located in a different Region than the two replicas.

**Note** Please see detailed information, restrictions, caveats etc on the [AWS Support Page](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/multi-region-strong-consistency-gt.html).

Consistency Mode (`consistencyMode`) on the embedded `replica` allows you to configure consistency mode for Global Tables.

##### Consistency mode with 3 Replicas[](#consistency-mode-with-3-replicas)

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

const example = new aws.dynamodb.Table("example", {
    name: "example",
    hashKey: "TestTableHashKey",
    billingMode: "PAY_PER_REQUEST",
    streamEnabled: true,
    streamViewType: "NEW_AND_OLD_IMAGES",
    attributes: [{
        name: "TestTableHashKey",
        type: "S",
    }],
    replicas: [
        {
            regionName: "us-east-2",
            consistencyMode: "STRONG",
        },
        {
            regionName: "us-west-2",
            consistencyMode: "STRONG",
        },
    ],
});
```

```python
import pulumi
import pulumi_aws as aws

example = aws.dynamodb.Table("example",
    name="example",
    hash_key="TestTableHashKey",
    billing_mode="PAY_PER_REQUEST",
    stream_enabled=True,
    stream_view_type="NEW_AND_OLD_IMAGES",
    attributes=[{
        "name": "TestTableHashKey",
        "type": "S",
    }],
    replicas=[
        {
            "region_name": "us-east-2",
            "consistency_mode": "STRONG",
        },
        {
            "region_name": "us-west-2",
            "consistency_mode": "STRONG",
        },
    ])
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/dynamodb"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		_, err := dynamodb.NewTable(ctx, "example", &dynamodb.TableArgs{
			Name:           pulumi.String("example"),
			HashKey:        pulumi.String("TestTableHashKey"),
			BillingMode:    pulumi.String("PAY_PER_REQUEST"),
			StreamEnabled:  pulumi.Bool(true),
			StreamViewType: pulumi.String("NEW_AND_OLD_IMAGES"),
			Attributes: dynamodb.TableAttributeArray{
				&dynamodb.TableAttributeArgs{
					Name: pulumi.String("TestTableHashKey"),
					Type: pulumi.String("S"),
				},
			},
			Replicas: dynamodb.TableReplicaTypeArray{
				&dynamodb.TableReplicaTypeArgs{
					RegionName:      pulumi.String("us-east-2"),
					ConsistencyMode: pulumi.String("STRONG"),
				},
				&dynamodb.TableReplicaTypeArgs{
					RegionName:      pulumi.String("us-west-2"),
					ConsistencyMode: pulumi.String("STRONG"),
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
    var example = new Aws.DynamoDB.Table("example", new()
    {
        Name = "example",
        HashKey = "TestTableHashKey",
        BillingMode = "PAY_PER_REQUEST",
        StreamEnabled = true,
        StreamViewType = "NEW_AND_OLD_IMAGES",
        Attributes = new[]
        {
            new Aws.DynamoDB.Inputs.TableAttributeArgs
            {
                Name = "TestTableHashKey",
                Type = "S",
            },
        },
        Replicas = new[]
        {
            new Aws.DynamoDB.Inputs.TableReplicaArgs
            {
                RegionName = "us-east-2",
                ConsistencyMode = "STRONG",
            },
            new Aws.DynamoDB.Inputs.TableReplicaArgs
            {
                RegionName = "us-west-2",
                ConsistencyMode = "STRONG",
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
import com.pulumi.aws.dynamodb.Table;
import com.pulumi.aws.dynamodb.TableArgs;
import com.pulumi.aws.dynamodb.inputs.TableAttributeArgs;
import com.pulumi.aws.dynamodb.inputs.TableReplicaArgs;
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
        var example = new Table("example", TableArgs.builder()
            .name("example")
            .hashKey("TestTableHashKey")
            .billingMode("PAY_PER_REQUEST")
            .streamEnabled(true)
            .streamViewType("NEW_AND_OLD_IMAGES")
            .attributes(TableAttributeArgs.builder()
                .name("TestTableHashKey")
                .type("S")
                .build())
            .replicas(
                TableReplicaArgs.builder()
                    .regionName("us-east-2")
                    .consistencyMode("STRONG")
                    .build(),
                TableReplicaArgs.builder()
                    .regionName("us-west-2")
                    .consistencyMode("STRONG")
                    .build())
            .build());

    }
}
```

```yaml
resources:
  example:
    type: aws:dynamodb:Table
    properties:
      name: example
      hashKey: TestTableHashKey
      billingMode: PAY_PER_REQUEST
      streamEnabled: true
      streamViewType: NEW_AND_OLD_IMAGES
      attributes:
        - name: TestTableHashKey
          type: S
      replicas:
        - regionName: us-east-2
          consistencyMode: STRONG
        - regionName: us-west-2
          consistencyMode: STRONG
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_dynamodb_table" "example" {
  name             = "example"
  hash_key         = "TestTableHashKey"
  billing_mode     = "PAY_PER_REQUEST"
  stream_enabled   = true
  stream_view_type = "NEW_AND_OLD_IMAGES"
  attributes {
    name = "TestTableHashKey"
    type = "S"
  }
  replicas {
    region_name      = "us-east-2"
    consistency_mode = "STRONG"
  }
  replicas {
    region_name      = "us-west-2"
    consistency_mode = "STRONG"
  }
}
```

##### Consistency Mode with 2 Replicas and Witness Region[](#consistency-mode-with-2-replicas-and-witness-region)

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

const example = new aws.dynamodb.Table("example", {
    name: "example",
    hashKey: "TestTableHashKey",
    billingMode: "PAY_PER_REQUEST",
    streamEnabled: true,
    streamViewType: "NEW_AND_OLD_IMAGES",
    attributes: [{
        name: "TestTableHashKey",
        type: "S",
    }],
    replicas: [{
        regionName: "us-east-2",
        consistencyMode: "STRONG",
    }],
    globalTableWitness: {
        regionName: "us-west-2",
    },
});
```

```python
import pulumi
import pulumi_aws as aws

example = aws.dynamodb.Table("example",
    name="example",
    hash_key="TestTableHashKey",
    billing_mode="PAY_PER_REQUEST",
    stream_enabled=True,
    stream_view_type="NEW_AND_OLD_IMAGES",
    attributes=[{
        "name": "TestTableHashKey",
        "type": "S",
    }],
    replicas=[{
        "region_name": "us-east-2",
        "consistency_mode": "STRONG",
    }],
    global_table_witness={
        "region_name": "us-west-2",
    })
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/dynamodb"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		_, err := dynamodb.NewTable(ctx, "example", &dynamodb.TableArgs{
			Name:           pulumi.String("example"),
			HashKey:        pulumi.String("TestTableHashKey"),
			BillingMode:    pulumi.String("PAY_PER_REQUEST"),
			StreamEnabled:  pulumi.Bool(true),
			StreamViewType: pulumi.String("NEW_AND_OLD_IMAGES"),
			Attributes: dynamodb.TableAttributeArray{
				&dynamodb.TableAttributeArgs{
					Name: pulumi.String("TestTableHashKey"),
					Type: pulumi.String("S"),
				},
			},
			Replicas: dynamodb.TableReplicaTypeArray{
				&dynamodb.TableReplicaTypeArgs{
					RegionName:      pulumi.String("us-east-2"),
					ConsistencyMode: pulumi.String("STRONG"),
				},
			},
			GlobalTableWitness: &dynamodb.TableGlobalTableWitnessArgs{
				RegionName: pulumi.String("us-west-2"),
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
    var example = new Aws.DynamoDB.Table("example", new()
    {
        Name = "example",
        HashKey = "TestTableHashKey",
        BillingMode = "PAY_PER_REQUEST",
        StreamEnabled = true,
        StreamViewType = "NEW_AND_OLD_IMAGES",
        Attributes = new[]
        {
            new Aws.DynamoDB.Inputs.TableAttributeArgs
            {
                Name = "TestTableHashKey",
                Type = "S",
            },
        },
        Replicas = new[]
        {
            new Aws.DynamoDB.Inputs.TableReplicaArgs
            {
                RegionName = "us-east-2",
                ConsistencyMode = "STRONG",
            },
        },
        GlobalTableWitness = new Aws.DynamoDB.Inputs.TableGlobalTableWitnessArgs
        {
            RegionName = "us-west-2",
        },
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.dynamodb.Table;
import com.pulumi.aws.dynamodb.TableArgs;
import com.pulumi.aws.dynamodb.inputs.TableAttributeArgs;
import com.pulumi.aws.dynamodb.inputs.TableReplicaArgs;
import com.pulumi.aws.dynamodb.inputs.TableGlobalTableWitnessArgs;
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
        var example = new Table("example", TableArgs.builder()
            .name("example")
            .hashKey("TestTableHashKey")
            .billingMode("PAY_PER_REQUEST")
            .streamEnabled(true)
            .streamViewType("NEW_AND_OLD_IMAGES")
            .attributes(TableAttributeArgs.builder()
                .name("TestTableHashKey")
                .type("S")
                .build())
            .replicas(TableReplicaArgs.builder()
                .regionName("us-east-2")
                .consistencyMode("STRONG")
                .build())
            .globalTableWitness(TableGlobalTableWitnessArgs.builder()
                .regionName("us-west-2")
                .build())
            .build());

    }
}
```

```yaml
resources:
  example:
    type: aws:dynamodb:Table
    properties:
      name: example
      hashKey: TestTableHashKey
      billingMode: PAY_PER_REQUEST
      streamEnabled: true
      streamViewType: NEW_AND_OLD_IMAGES
      attributes:
        - name: TestTableHashKey
          type: S
      replicas:
        - regionName: us-east-2
          consistencyMode: STRONG
      globalTableWitness:
        regionName: us-west-2
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_dynamodb_table" "example" {
  name             = "example"
  hash_key         = "TestTableHashKey"
  billing_mode     = "PAY_PER_REQUEST"
  stream_enabled   = true
  stream_view_type = "NEW_AND_OLD_IMAGES"
  attributes {
    name = "TestTableHashKey"
    type = "S"
  }
  replicas {
    region_name      = "us-east-2"
    consistency_mode = "STRONG"
  }
  global_table_witness = {
    region_name = "us-west-2"
  }
}
```

### Replica Tagging[](#replica-tagging)

You can manage global table replicas’ tags in various ways. This example shows using `replica.*.propagate_tags` for the first replica and the `aws.dynamodb.Tag` resource for the other.

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
import * as std from "@pulumi/std";

const current = aws.getRegion({});
const alternate = aws.getRegion({});
const third = aws.getRegion({});
const example = new aws.dynamodb.Table("example", {
    billingMode: "PAY_PER_REQUEST",
    hashKey: "TestTableHashKey",
    name: "example-13281",
    streamEnabled: true,
    streamViewType: "NEW_AND_OLD_IMAGES",
    attributes: [{
        name: "TestTableHashKey",
        type: "S",
    }],
    replicas: [
        {
            regionName: alternate.then(alternate => alternate.region),
        },
        {
            regionName: third.then(third => third.region),
            propagateTags: true,
        },
    ],
    tags: {
        Architect: "Eleanor",
        Zone: "SW",
    },
});
const exampleTag = new aws.dynamodb.Tag("example", {
    resourceArn: std.replaceOutput({
        text: example.arn,
        search: current.then(current => current.region),
        replace: alternate.then(alternate => alternate.region),
    }).apply(invoke => invoke.result),
    key: "Architect",
    value: "Gigi",
});
```

```python
import pulumi
import pulumi_aws as aws
import pulumi_std as std

current = aws.get_region()
alternate = aws.get_region()
third = aws.get_region()
example = aws.dynamodb.Table("example",
    billing_mode="PAY_PER_REQUEST",
    hash_key="TestTableHashKey",
    name="example-13281",
    stream_enabled=True,
    stream_view_type="NEW_AND_OLD_IMAGES",
    attributes=[{
        "name": "TestTableHashKey",
        "type": "S",
    }],
    replicas=[
        {
            "region_name": alternate.region,
        },
        {
            "region_name": third.region,
            "propagate_tags": True,
        },
    ],
    tags={
        "Architect": "Eleanor",
        "Zone": "SW",
    })
example_tag = aws.dynamodb.Tag("example",
    resource_arn=std.replace_output(text=example.arn,
        search=current.region,
        replace=alternate.region).apply(lambda invoke: invoke.result),
    key="Architect",
    value="Gigi")
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws"
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/dynamodb"
	"github.com/pulumi/pulumi-std/sdk/go/std"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		current, err := aws.GetRegion(ctx, &aws.GetRegionArgs{}, nil)
		if err != nil {
			return err
		}
		alternate, err := aws.GetRegion(ctx, &aws.GetRegionArgs{}, nil)
		if err != nil {
			return err
		}
		third, err := aws.GetRegion(ctx, &aws.GetRegionArgs{}, nil)
		if err != nil {
			return err
		}
		example, err := dynamodb.NewTable(ctx, "example", &dynamodb.TableArgs{
			BillingMode:    pulumi.String("PAY_PER_REQUEST"),
			HashKey:        pulumi.String("TestTableHashKey"),
			Name:           pulumi.String("example-13281"),
			StreamEnabled:  pulumi.Bool(true),
			StreamViewType: pulumi.String("NEW_AND_OLD_IMAGES"),
			Attributes: dynamodb.TableAttributeArray{
				&dynamodb.TableAttributeArgs{
					Name: pulumi.String("TestTableHashKey"),
					Type: pulumi.String("S"),
				},
			},
			Replicas: dynamodb.TableReplicaTypeArray{
				&dynamodb.TableReplicaTypeArgs{
					RegionName: pulumi.String(alternate.Region),
				},
				&dynamodb.TableReplicaTypeArgs{
					RegionName:    pulumi.String(third.Region),
					PropagateTags: pulumi.Bool(true),
				},
			},
			Tags: pulumi.StringMap{
				"Architect": pulumi.String("Eleanor"),
				"Zone":      pulumi.String("SW"),
			},
		})
		if err != nil {
			return err
		}
		_, err = dynamodb.NewTag(ctx, "example", &dynamodb.TagArgs{
			ResourceArn: pulumi.String(std.ReplaceOutput(ctx, std.ReplaceOutputArgs{
				Text:    example.Arn,
				Search:  pulumi.String(current.Region),
				Replace: pulumi.String(alternate.Region),
			}, nil).ApplyT(func(invoke std.ReplaceResult) (*string, error) {
				val := invoke.Result
				return &val, nil
			}).(pulumi.StringPtrOutput)),
			Key:   pulumi.String("Architect"),
			Value: pulumi.String("Gigi"),
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
using Std = Pulumi.Std;

return await Deployment.RunAsync(() =>
{
    var current = Aws.GetRegion.Invoke();

    var alternate = Aws.GetRegion.Invoke();

    var third = Aws.GetRegion.Invoke();

    var example = new Aws.DynamoDB.Table("example", new()
    {
        BillingMode = "PAY_PER_REQUEST",
        HashKey = "TestTableHashKey",
        Name = "example-13281",
        StreamEnabled = true,
        StreamViewType = "NEW_AND_OLD_IMAGES",
        Attributes = new[]
        {
            new Aws.DynamoDB.Inputs.TableAttributeArgs
            {
                Name = "TestTableHashKey",
                Type = "S",
            },
        },
        Replicas = new[]
        {
            new Aws.DynamoDB.Inputs.TableReplicaArgs
            {
                RegionName = alternate.Apply(getRegionResult => getRegionResult.Region),
            },
            new Aws.DynamoDB.Inputs.TableReplicaArgs
            {
                RegionName = third.Apply(getRegionResult => getRegionResult.Region),
                PropagateTags = true,
            },
        },
        Tags =
        {
            { "Architect", "Eleanor" },
            { "Zone", "SW" },
        },
    });

    var exampleTag = new Aws.DynamoDB.Tag("example", new()
    {
        ResourceArn = Std.Replace.Invoke(new()
        {
            Text = example.Arn,
            Search = current.Apply(getRegionResult => getRegionResult.Region),
            Replace = alternate.Apply(getRegionResult => getRegionResult.Region),
        }).Apply(invoke => invoke.Result),
        Key = "Architect",
        Value = "Gigi",
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.AwsFunctions;
import com.pulumi.aws.inputs.GetRegionArgs;
import com.pulumi.aws.dynamodb.Table;
import com.pulumi.aws.dynamodb.TableArgs;
import com.pulumi.aws.dynamodb.inputs.TableAttributeArgs;
import com.pulumi.aws.dynamodb.inputs.TableReplicaArgs;
import com.pulumi.aws.dynamodb.Tag;
import com.pulumi.aws.dynamodb.TagArgs;
import com.pulumi.std.StdFunctions;
import com.pulumi.std.inputs.ReplaceArgs;
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
        final var current = AwsFunctions.getRegion(GetRegionArgs.builder()
            .build());

        final var alternate = AwsFunctions.getRegion(GetRegionArgs.builder()
            .build());

        final var third = AwsFunctions.getRegion(GetRegionArgs.builder()
            .build());

        var example = new Table("example", TableArgs.builder()
            .billingMode("PAY_PER_REQUEST")
            .hashKey("TestTableHashKey")
            .name("example-13281")
            .streamEnabled(true)
            .streamViewType("NEW_AND_OLD_IMAGES")
            .attributes(TableAttributeArgs.builder()
                .name("TestTableHashKey")
                .type("S")
                .build())
            .replicas(
                TableReplicaArgs.builder()
                    .regionName(alternate.region())
                    .build(),
                TableReplicaArgs.builder()
                    .regionName(third.region())
                    .propagateTags(true)
                    .build())
            .tags(Map.ofEntries(
                Map.entry("Architect", "Eleanor"),
                Map.entry("Zone", "SW")
            ))
            .build());

        var exampleTag = new Tag("exampleTag", TagArgs.builder()
            .resourceArn(StdFunctions.replace(ReplaceArgs.builder()
                .text(example.arn())
                .search(current.region())
                .replace(alternate.region())
                .build()).applyValue(_invoke -> _invoke.result()))
            .key("Architect")
            .value("Gigi")
            .build());

    }
}
```

```yaml
resources:
  example:
    type: aws:dynamodb:Table
    properties:
      billingMode: PAY_PER_REQUEST
      hashKey: TestTableHashKey
      name: example-13281
      streamEnabled: true
      streamViewType: NEW_AND_OLD_IMAGES
      attributes:
        - name: TestTableHashKey
          type: S
      replicas:
        - regionName: ${alternate.region}
        - regionName: ${third.region}
          propagateTags: true
      tags:
        Architect: Eleanor
        Zone: SW
  exampleTag:
    type: aws:dynamodb:Tag
    name: example
    properties:
      resourceArn:
        fn::invoke:
          function: std:replace
          arguments:
            text: ${example.arn}
            search: ${current.region}
            replace: ${alternate.region}
          return: result
      key: Architect
      value: Gigi
variables:
  current:
    fn::invoke:
      function: aws:getRegion
      arguments: {}
  alternate:
    fn::invoke:
      function: aws:getRegion
      arguments: {}
  third:
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
    std = {
      source = "pulumi/std"
    }
  }
}

data "aws_getregion" "current" {
}
data "aws_getregion" "alternate" {
}
data "aws_getregion" "third" {
}

resource "aws_dynamodb_table" "example" {
  billing_mode     = "PAY_PER_REQUEST"
  hash_key         = "TestTableHashKey"
  name             = "example-13281"
  stream_enabled   = true
  stream_view_type = "NEW_AND_OLD_IMAGES"
  attributes {
    name = "TestTableHashKey"
    type = "S"
  }
  replicas {
    region_name = data.aws_getregion.alternate.region
  }
  replicas {
    region_name    = data.aws_getregion.third.region
    propagate_tags = true
  }
  tags = {
    "Architect" = "Eleanor"
    "Zone"      = "SW"
  }
}
resource "aws_dynamodb_tag" "example" {
  resource_arn = replace(aws_dynamodb_table.example.arn, data.aws_getregion.current.region, data.aws_getregion.alternate.region)
  key          = "Architect"
  value        = "Gigi"
}
```

## Create Table Resource[](#create)

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
new Table(name: string, args?: TableArgs, opts?: CustomResourceOptions);
```

```python
@overload
def Table(resource_name: str,
          args: Optional[TableArgs] = None,
          opts: Optional[ResourceOptions] = None)

@overload
def Table(resource_name: str,
          opts: Optional[ResourceOptions] = None,
          attributes: Optional[Sequence[TableAttributeArgs]] = None,
          billing_mode: Optional[str] = None,
          deletion_protection_enabled: Optional[bool] = None,
          global_secondary_indexes: Optional[Sequence[TableGlobalSecondaryIndexArgs]] = None,
          global_table_witness: Optional[TableGlobalTableWitnessArgs] = None,
          hash_key: Optional[str] = None,
          import_table: Optional[TableImportTableArgs] = None,
          local_secondary_indexes: Optional[Sequence[TableLocalSecondaryIndexArgs]] = None,
          name: Optional[str] = None,
          on_demand_throughput: Optional[TableOnDemandThroughputArgs] = None,
          point_in_time_recovery: Optional[TablePointInTimeRecoveryArgs] = None,
          range_key: Optional[str] = None,
          read_capacity: Optional[int] = None,
          region: Optional[str] = None,
          replicas: Optional[Sequence[TableReplicaArgs]] = None,
          restore_backup_arn: Optional[str] = None,
          restore_date_time: Optional[str] = None,
          restore_source_name: Optional[str] = None,
          restore_source_table_arn: Optional[str] = None,
          restore_to_latest_time: Optional[bool] = None,
          server_side_encryption: Optional[TableServerSideEncryptionArgs] = None,
          stream_enabled: Optional[bool] = None,
          stream_view_type: Optional[str] = None,
          table_class: Optional[str] = None,
          tags: Optional[Mapping[str, str]] = None,
          ttl: Optional[TableTtlArgs] = None,
          warm_throughput: Optional[TableWarmThroughputArgs] = None,
          write_capacity: Optional[int] = None)
```

```go
func NewTable(ctx *Context, name string, args *TableArgs, opts ...ResourceOption) (*Table, error)
```

```csharp
public Table(string name, TableArgs? args = null, CustomResourceOptions? opts = null)
```

```java
public Table(String name, TableArgs args)
public Table(String name, TableArgs args, CustomResourceOptions options)
```

```yaml
type: aws:dynamodb:Table
properties: # The arguments to resource properties.
options: # Bag of options to control resource's behavior.
```

```hcl
resource "aws_dynamodb_table" "name" {
    # resource properties
}
```

#### Parameters[](#parameters)

name This property is required. string

The unique name of the resource.

args [TableArgs](#inputs)

The arguments to resource properties.

opts [CustomResourceOptions](/docs/reference/pkg/nodejs/pulumi/pulumi/#CustomResourceOptions)

Bag of options to control resource's behavior.

resource\_name This property is required. str

The unique name of the resource.

args [TableArgs](#inputs)

The arguments to resource properties.

opts [ResourceOptions](/docs/reference/pkg/python/pulumi/#pulumi.ResourceOptions)

Bag of options to control resource's behavior.

ctx [Context](https://pkg.go.dev/github.com/pulumi/pulumi/sdk/v3/go/pulumi?tab=doc#Context)

Context object for the current deployment.

name This property is required. string

The unique name of the resource.

args [TableArgs](#inputs)

The arguments to resource properties.

opts [ResourceOption](https://pkg.go.dev/github.com/pulumi/pulumi/sdk/v3/go/pulumi?tab=doc#ResourceOption)

Bag of options to control resource's behavior.

name This property is required. string

The unique name of the resource.

args [TableArgs](#inputs)

The arguments to resource properties.

opts [CustomResourceOptions](/docs/reference/pkg/dotnet/Pulumi/Pulumi.CustomResourceOptions.html)

Bag of options to control resource's behavior.

name This property is required. String

The unique name of the resource.

args This property is required. [TableArgs](#inputs)

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
var tableResource = new Aws.DynamoDB.Table("tableResource", new()
{
    Attributes = new[]
    {
        new Aws.DynamoDB.Inputs.TableAttributeArgs
        {
            Name = "string",
            Type = "string",
        },
    },
    BillingMode = "string",
    DeletionProtectionEnabled = false,
    GlobalSecondaryIndexes = new[]
    {
        new Aws.DynamoDB.Inputs.TableGlobalSecondaryIndexArgs
        {
            Name = "string",
            ProjectionType = "string",
            KeySchemas = new[]
            {
                new Aws.DynamoDB.Inputs.TableGlobalSecondaryIndexKeySchemaArgs
                {
                    AttributeName = "string",
                    KeyType = "string",
                },
            },
            NonKeyAttributes = new[]
            {
                "string",
            },
            OnDemandThroughput = new Aws.DynamoDB.Inputs.TableGlobalSecondaryIndexOnDemandThroughputArgs
            {
                MaxReadRequestUnits = 0,
                MaxWriteRequestUnits = 0,
            },
            ReadCapacity = 0,
            WarmThroughput = new Aws.DynamoDB.Inputs.TableGlobalSecondaryIndexWarmThroughputArgs
            {
                ReadUnitsPerSecond = 0,
                WriteUnitsPerSecond = 0,
            },
            WriteCapacity = 0,
        },
    },
    GlobalTableWitness = new Aws.DynamoDB.Inputs.TableGlobalTableWitnessArgs
    {
        RegionName = "string",
    },
    HashKey = "string",
    ImportTable = new Aws.DynamoDB.Inputs.TableImportTableArgs
    {
        InputFormat = "string",
        S3BucketSource = new Aws.DynamoDB.Inputs.TableImportTableS3BucketSourceArgs
        {
            Bucket = "string",
            BucketOwner = "string",
            KeyPrefix = "string",
        },
        InputCompressionType = "string",
        InputFormatOptions = new Aws.DynamoDB.Inputs.TableImportTableInputFormatOptionsArgs
        {
            Csv = new Aws.DynamoDB.Inputs.TableImportTableInputFormatOptionsCsvArgs
            {
                Delimiter = "string",
                HeaderLists = new[]
                {
                    "string",
                },
            },
        },
    },
    LocalSecondaryIndexes = new[]
    {
        new Aws.DynamoDB.Inputs.TableLocalSecondaryIndexArgs
        {
            Name = "string",
            ProjectionType = "string",
            RangeKey = "string",
            NonKeyAttributes = new[]
            {
                "string",
            },
        },
    },
    Name = "string",
    OnDemandThroughput = new Aws.DynamoDB.Inputs.TableOnDemandThroughputArgs
    {
        MaxReadRequestUnits = 0,
        MaxWriteRequestUnits = 0,
    },
    PointInTimeRecovery = new Aws.DynamoDB.Inputs.TablePointInTimeRecoveryArgs
    {
        Enabled = false,
        RecoveryPeriodInDays = 0,
    },
    RangeKey = "string",
    ReadCapacity = 0,
    Region = "string",
    Replicas = new[]
    {
        new Aws.DynamoDB.Inputs.TableReplicaArgs
        {
            RegionName = "string",
            Arn = "string",
            ConsistencyMode = "string",
            DeletionProtectionEnabled = false,
            KmsKeyArn = "string",
            PointInTimeRecovery = false,
            PropagateTags = false,
            StreamArn = "string",
            StreamLabel = "string",
        },
    },
    RestoreBackupArn = "string",
    RestoreDateTime = "string",
    RestoreSourceName = "string",
    RestoreSourceTableArn = "string",
    RestoreToLatestTime = false,
    ServerSideEncryption = new Aws.DynamoDB.Inputs.TableServerSideEncryptionArgs
    {
        Enabled = false,
        KmsKeyArn = "string",
    },
    StreamEnabled = false,
    StreamViewType = "string",
    TableClass = "string",
    Tags =
    {
        { "string", "string" },
    },
    Ttl = new Aws.DynamoDB.Inputs.TableTtlArgs
    {
        AttributeName = "string",
        Enabled = false,
    },
    WarmThroughput = new Aws.DynamoDB.Inputs.TableWarmThroughputArgs
    {
        ReadUnitsPerSecond = 0,
        WriteUnitsPerSecond = 0,
    },
    WriteCapacity = 0,
});
```

```go
example, err := dynamodb.NewTable(ctx, "tableResource", &dynamodb.TableArgs{
	Attributes: dynamodb.TableAttributeArray{
		&dynamodb.TableAttributeArgs{
			Name: pulumi.String("string"),
			Type: pulumi.String("string"),
		},
	},
	BillingMode:               pulumi.String("string"),
	DeletionProtectionEnabled: pulumi.Bool(false),
	GlobalSecondaryIndexes: dynamodb.TableGlobalSecondaryIndexArray{
		&dynamodb.TableGlobalSecondaryIndexArgs{
			Name:           pulumi.String("string"),
			ProjectionType: pulumi.String("string"),
			KeySchemas: dynamodb.TableGlobalSecondaryIndexKeySchemaArray{
				&dynamodb.TableGlobalSecondaryIndexKeySchemaArgs{
					AttributeName: pulumi.String("string"),
					KeyType:       pulumi.String("string"),
				},
			},
			NonKeyAttributes: pulumi.StringArray{
				pulumi.String("string"),
			},
			OnDemandThroughput: &dynamodb.TableGlobalSecondaryIndexOnDemandThroughputArgs{
				MaxReadRequestUnits:  pulumi.Int(0),
				MaxWriteRequestUnits: pulumi.Int(0),
			},
			ReadCapacity: pulumi.Int(0),
			WarmThroughput: &dynamodb.TableGlobalSecondaryIndexWarmThroughputArgs{
				ReadUnitsPerSecond:  pulumi.Int(0),
				WriteUnitsPerSecond: pulumi.Int(0),
			},
			WriteCapacity: pulumi.Int(0),
		},
	},
	GlobalTableWitness: &dynamodb.TableGlobalTableWitnessArgs{
		RegionName: pulumi.String("string"),
	},
	HashKey: pulumi.String("string"),
	ImportTable: &dynamodb.TableImportTableArgs{
		InputFormat: pulumi.String("string"),
		S3BucketSource: &dynamodb.TableImportTableS3BucketSourceArgs{
			Bucket:      pulumi.String("string"),
			BucketOwner: pulumi.String("string"),
			KeyPrefix:   pulumi.String("string"),
		},
		InputCompressionType: pulumi.String("string"),
		InputFormatOptions: &dynamodb.TableImportTableInputFormatOptionsArgs{
			Csv: &dynamodb.TableImportTableInputFormatOptionsCsvArgs{
				Delimiter: pulumi.String("string"),
				HeaderLists: pulumi.StringArray{
					pulumi.String("string"),
				},
			},
		},
	},
	LocalSecondaryIndexes: dynamodb.TableLocalSecondaryIndexArray{
		&dynamodb.TableLocalSecondaryIndexArgs{
			Name:           pulumi.String("string"),
			ProjectionType: pulumi.String("string"),
			RangeKey:       pulumi.String("string"),
			NonKeyAttributes: pulumi.StringArray{
				pulumi.String("string"),
			},
		},
	},
	Name: pulumi.String("string"),
	OnDemandThroughput: &dynamodb.TableOnDemandThroughputArgs{
		MaxReadRequestUnits:  pulumi.Int(0),
		MaxWriteRequestUnits: pulumi.Int(0),
	},
	PointInTimeRecovery: &dynamodb.TablePointInTimeRecoveryArgs{
		Enabled:              pulumi.Bool(false),
		RecoveryPeriodInDays: pulumi.Int(0),
	},
	RangeKey:     pulumi.String("string"),
	ReadCapacity: pulumi.Int(0),
	Region:       pulumi.String("string"),
	Replicas: dynamodb.TableReplicaTypeArray{
		&dynamodb.TableReplicaTypeArgs{
			RegionName:                pulumi.String("string"),
			Arn:                       pulumi.String("string"),
			ConsistencyMode:           pulumi.String("string"),
			DeletionProtectionEnabled: pulumi.Bool(false),
			KmsKeyArn:                 pulumi.String("string"),
			PointInTimeRecovery:       pulumi.Bool(false),
			PropagateTags:             pulumi.Bool(false),
			StreamArn:                 pulumi.String("string"),
			StreamLabel:               pulumi.String("string"),
		},
	},
	RestoreBackupArn:      pulumi.String("string"),
	RestoreDateTime:       pulumi.String("string"),
	RestoreSourceName:     pulumi.String("string"),
	RestoreSourceTableArn: pulumi.String("string"),
	RestoreToLatestTime:   pulumi.Bool(false),
	ServerSideEncryption: &dynamodb.TableServerSideEncryptionArgs{
		Enabled:   pulumi.Bool(false),
		KmsKeyArn: pulumi.String("string"),
	},
	StreamEnabled:  pulumi.Bool(false),
	StreamViewType: pulumi.String("string"),
	TableClass:     pulumi.String("string"),
	Tags: pulumi.StringMap{
		"string": pulumi.String("string"),
	},
	Ttl: &dynamodb.TableTtlArgs{
		AttributeName: pulumi.String("string"),
		Enabled:       pulumi.Bool(false),
	},
	WarmThroughput: &dynamodb.TableWarmThroughputArgs{
		ReadUnitsPerSecond:  pulumi.Int(0),
		WriteUnitsPerSecond: pulumi.Int(0),
	},
	WriteCapacity: pulumi.Int(0),
})
```

```hcl
resource "aws_dynamodb_table" "tableResource" {
  attributes {
    name = "string"
    type = "string"
  }
  billing_mode                = "string"
  deletion_protection_enabled = false
  global_secondary_indexes {
    name            = "string"
    projection_type = "string"
    key_schemas {
      attribute_name = "string"
      key_type       = "string"
    }
    non_key_attributes = ["string"]
    on_demand_throughput = {
      max_read_request_units  = 0
      max_write_request_units = 0
    }
    read_capacity = 0
    warm_throughput = {
      read_units_per_second  = 0
      write_units_per_second = 0
    }
    write_capacity = 0
  }
  global_table_witness = {
    region_name = "string"
  }
  hash_key = "string"
  import_table = {
    input_format = "string"
    s3_bucket_source = {
      bucket       = "string"
      bucket_owner = "string"
      key_prefix   = "string"
    }
    input_compression_type = "string"
    input_format_options = {
      csv = {
        delimiter    = "string"
        header_lists = ["string"]
      }
    }
  }
  local_secondary_indexes {
    name               = "string"
    projection_type    = "string"
    range_key          = "string"
    non_key_attributes = ["string"]
  }
  name = "string"
  on_demand_throughput = {
    max_read_request_units  = 0
    max_write_request_units = 0
  }
  point_in_time_recovery = {
    enabled                 = false
    recovery_period_in_days = 0
  }
  range_key     = "string"
  read_capacity = 0
  region        = "string"
  replicas {
    region_name                 = "string"
    arn                         = "string"
    consistency_mode            = "string"
    deletion_protection_enabled = false
    kms_key_arn                 = "string"
    point_in_time_recovery      = false
    propagate_tags              = false
    stream_arn                  = "string"
    stream_label                = "string"
  }
  restore_backup_arn       = "string"
  restore_date_time        = "string"
  restore_source_name      = "string"
  restore_source_table_arn = "string"
  restore_to_latest_time   = false
  server_side_encryption = {
    enabled     = false
    kms_key_arn = "string"
  }
  stream_enabled   = false
  stream_view_type = "string"
  table_class      = "string"
  tags = {
    "string" = "string"
  }
  ttl = {
    attribute_name = "string"
    enabled        = false
  }
  warm_throughput = {
    read_units_per_second  = 0
    write_units_per_second = 0
  }
  write_capacity = 0
}
```

```java
var tableResource = new com.pulumi.aws.dynamodb.Table("tableResource", com.pulumi.aws.dynamodb.TableArgs.builder()
    .attributes(TableAttributeArgs.builder()
        .name("string")
        .type("string")
        .build())
    .billingMode("string")
    .deletionProtectionEnabled(false)
    .globalSecondaryIndexes(TableGlobalSecondaryIndexArgs.builder()
        .name("string")
        .projectionType("string")
        .keySchemas(TableGlobalSecondaryIndexKeySchemaArgs.builder()
            .attributeName("string")
            .keyType("string")
            .build())
        .nonKeyAttributes("string")
        .onDemandThroughput(TableGlobalSecondaryIndexOnDemandThroughputArgs.builder()
            .maxReadRequestUnits(0)
            .maxWriteRequestUnits(0)
            .build())
        .readCapacity(0)
        .warmThroughput(TableGlobalSecondaryIndexWarmThroughputArgs.builder()
            .readUnitsPerSecond(0)
            .writeUnitsPerSecond(0)
            .build())
        .writeCapacity(0)
        .build())
    .globalTableWitness(TableGlobalTableWitnessArgs.builder()
        .regionName("string")
        .build())
    .hashKey("string")
    .importTable(TableImportTableArgs.builder()
        .inputFormat("string")
        .s3BucketSource(TableImportTableS3BucketSourceArgs.builder()
            .bucket("string")
            .bucketOwner("string")
            .keyPrefix("string")
            .build())
        .inputCompressionType("string")
        .inputFormatOptions(TableImportTableInputFormatOptionsArgs.builder()
            .csv(TableImportTableInputFormatOptionsCsvArgs.builder()
                .delimiter("string")
                .headerLists("string")
                .build())
            .build())
        .build())
    .localSecondaryIndexes(TableLocalSecondaryIndexArgs.builder()
        .name("string")
        .projectionType("string")
        .rangeKey("string")
        .nonKeyAttributes("string")
        .build())
    .name("string")
    .onDemandThroughput(TableOnDemandThroughputArgs.builder()
        .maxReadRequestUnits(0)
        .maxWriteRequestUnits(0)
        .build())
    .pointInTimeRecovery(TablePointInTimeRecoveryArgs.builder()
        .enabled(false)
        .recoveryPeriodInDays(0)
        .build())
    .rangeKey("string")
    .readCapacity(0)
    .region("string")
    .replicas(TableReplicaArgs.builder()
        .regionName("string")
        .arn("string")
        .consistencyMode("string")
        .deletionProtectionEnabled(false)
        .kmsKeyArn("string")
        .pointInTimeRecovery(false)
        .propagateTags(false)
        .streamArn("string")
        .streamLabel("string")
        .build())
    .restoreBackupArn("string")
    .restoreDateTime("string")
    .restoreSourceName("string")
    .restoreSourceTableArn("string")
    .restoreToLatestTime(false)
    .serverSideEncryption(TableServerSideEncryptionArgs.builder()
        .enabled(false)
        .kmsKeyArn("string")
        .build())
    .streamEnabled(false)
    .streamViewType("string")
    .tableClass("string")
    .tags(Map.of("string", "string"))
    .ttl(TableTtlArgs.builder()
        .attributeName("string")
        .enabled(false)
        .build())
    .warmThroughput(TableWarmThroughputArgs.builder()
        .readUnitsPerSecond(0)
        .writeUnitsPerSecond(0)
        .build())
    .writeCapacity(0)
    .build());
```

```python
table_resource = aws.dynamodb.Table("tableResource",
    attributes=[{
        "name": "string",
        "type": "string",
    }],
    billing_mode="string",
    deletion_protection_enabled=False,
    global_secondary_indexes=[{
        "name": "string",
        "projection_type": "string",
        "key_schemas": [{
            "attribute_name": "string",
            "key_type": "string",
        }],
        "non_key_attributes": ["string"],
        "on_demand_throughput": {
            "max_read_request_units": 0,
            "max_write_request_units": 0,
        },
        "read_capacity": 0,
        "warm_throughput": {
            "read_units_per_second": 0,
            "write_units_per_second": 0,
        },
        "write_capacity": 0,
    }],
    global_table_witness={
        "region_name": "string",
    },
    hash_key="string",
    import_table={
        "input_format": "string",
        "s3_bucket_source": {
            "bucket": "string",
            "bucket_owner": "string",
            "key_prefix": "string",
        },
        "input_compression_type": "string",
        "input_format_options": {
            "csv": {
                "delimiter": "string",
                "header_lists": ["string"],
            },
        },
    },
    local_secondary_indexes=[{
        "name": "string",
        "projection_type": "string",
        "range_key": "string",
        "non_key_attributes": ["string"],
    }],
    name="string",
    on_demand_throughput={
        "max_read_request_units": 0,
        "max_write_request_units": 0,
    },
    point_in_time_recovery={
        "enabled": False,
        "recovery_period_in_days": 0,
    },
    range_key="string",
    read_capacity=0,
    region="string",
    replicas=[{
        "region_name": "string",
        "arn": "string",
        "consistency_mode": "string",
        "deletion_protection_enabled": False,
        "kms_key_arn": "string",
        "point_in_time_recovery": False,
        "propagate_tags": False,
        "stream_arn": "string",
        "stream_label": "string",
    }],
    restore_backup_arn="string",
    restore_date_time="string",
    restore_source_name="string",
    restore_source_table_arn="string",
    restore_to_latest_time=False,
    server_side_encryption={
        "enabled": False,
        "kms_key_arn": "string",
    },
    stream_enabled=False,
    stream_view_type="string",
    table_class="string",
    tags={
        "string": "string",
    },
    ttl={
        "attribute_name": "string",
        "enabled": False,
    },
    warm_throughput={
        "read_units_per_second": 0,
        "write_units_per_second": 0,
    },
    write_capacity=0)
```

```typescript
const tableResource = new aws.dynamodb.Table("tableResource", {
    attributes: [{
        name: "string",
        type: "string",
    }],
    billingMode: "string",
    deletionProtectionEnabled: false,
    globalSecondaryIndexes: [{
        name: "string",
        projectionType: "string",
        keySchemas: [{
            attributeName: "string",
            keyType: "string",
        }],
        nonKeyAttributes: ["string"],
        onDemandThroughput: {
            maxReadRequestUnits: 0,
            maxWriteRequestUnits: 0,
        },
        readCapacity: 0,
        warmThroughput: {
            readUnitsPerSecond: 0,
            writeUnitsPerSecond: 0,
        },
        writeCapacity: 0,
    }],
    globalTableWitness: {
        regionName: "string",
    },
    hashKey: "string",
    importTable: {
        inputFormat: "string",
        s3BucketSource: {
            bucket: "string",
            bucketOwner: "string",
            keyPrefix: "string",
        },
        inputCompressionType: "string",
        inputFormatOptions: {
            csv: {
                delimiter: "string",
                headerLists: ["string"],
            },
        },
    },
    localSecondaryIndexes: [{
        name: "string",
        projectionType: "string",
        rangeKey: "string",
        nonKeyAttributes: ["string"],
    }],
    name: "string",
    onDemandThroughput: {
        maxReadRequestUnits: 0,
        maxWriteRequestUnits: 0,
    },
    pointInTimeRecovery: {
        enabled: false,
        recoveryPeriodInDays: 0,
    },
    rangeKey: "string",
    readCapacity: 0,
    region: "string",
    replicas: [{
        regionName: "string",
        arn: "string",
        consistencyMode: "string",
        deletionProtectionEnabled: false,
        kmsKeyArn: "string",
        pointInTimeRecovery: false,
        propagateTags: false,
        streamArn: "string",
        streamLabel: "string",
    }],
    restoreBackupArn: "string",
    restoreDateTime: "string",
    restoreSourceName: "string",
    restoreSourceTableArn: "string",
    restoreToLatestTime: false,
    serverSideEncryption: {
        enabled: false,
        kmsKeyArn: "string",
    },
    streamEnabled: false,
    streamViewType: "string",
    tableClass: "string",
    tags: {
        string: "string",
    },
    ttl: {
        attributeName: "string",
        enabled: false,
    },
    warmThroughput: {
        readUnitsPerSecond: 0,
        writeUnitsPerSecond: 0,
    },
    writeCapacity: 0,
});
```

```yaml
type: aws:dynamodb:Table
properties:
    attributes:
        - name: string
          type: string
    billingMode: string
    deletionProtectionEnabled: false
    globalSecondaryIndexes:
        - keySchemas:
            - attributeName: string
              keyType: string
          name: string
          nonKeyAttributes:
            - string
          onDemandThroughput:
            maxReadRequestUnits: 0
            maxWriteRequestUnits: 0
          projectionType: string
          readCapacity: 0
          warmThroughput:
            readUnitsPerSecond: 0
            writeUnitsPerSecond: 0
          writeCapacity: 0
    globalTableWitness:
        regionName: string
    hashKey: string
    importTable:
        inputCompressionType: string
        inputFormat: string
        inputFormatOptions:
            csv:
                delimiter: string
                headerLists:
                    - string
        s3BucketSource:
            bucket: string
            bucketOwner: string
            keyPrefix: string
    localSecondaryIndexes:
        - name: string
          nonKeyAttributes:
            - string
          projectionType: string
          rangeKey: string
    name: string
    onDemandThroughput:
        maxReadRequestUnits: 0
        maxWriteRequestUnits: 0
    pointInTimeRecovery:
        enabled: false
        recoveryPeriodInDays: 0
    rangeKey: string
    readCapacity: 0
    region: string
    replicas:
        - arn: string
          consistencyMode: string
          deletionProtectionEnabled: false
          kmsKeyArn: string
          pointInTimeRecovery: false
          propagateTags: false
          regionName: string
          streamArn: string
          streamLabel: string
    restoreBackupArn: string
    restoreDateTime: string
    restoreSourceName: string
    restoreSourceTableArn: string
    restoreToLatestTime: false
    serverSideEncryption:
        enabled: false
        kmsKeyArn: string
    streamEnabled: false
    streamViewType: string
    tableClass: string
    tags:
        string: string
    ttl:
        attributeName: string
        enabled: false
    warmThroughput:
        readUnitsPerSecond: 0
        writeUnitsPerSecond: 0
    writeCapacity: 0
```

## Table Resource Properties[](#properties)

To learn more about resource properties and how to use them, see [Inputs and Outputs](/docs/intro/concepts/inputs-outputs) in the Architecture and Concepts docs.

### Inputs[](#inputs)

In Python, inputs that are objects can be passed either as [argument classes or as dictionary literals](/docs/languages-sdks/python/#inputs-and-outputs).

The Table resource accepts the following [input](/docs/intro/concepts/inputs-outputs) properties:

[Attributes](#attributes_csharp) [List<TableAttribute>](#tableattribute)

Set of nested attribute definitions. Only required for `hashKey` and `rangeKey` attributes. See below.

[BillingMode](#billingmode_csharp) string

Controls how you are charged for read and write throughput and how you manage capacity. The valid values are `PROVISIONED` and `PAY_PER_REQUEST`. Defaults to `PROVISIONED`.

[DeletionProtectionEnabled](#deletionprotectionenabled_csharp) bool

Enables deletion protection for table. Defaults to `false`.

[GlobalSecondaryIndexes](#globalsecondaryindexes_csharp) [List<TableGlobalSecondaryIndex>](#tableglobalsecondaryindex)

Describe a GSI for the table; subject to the normal limits on the number of GSIs, projected attributes, etc. See below.

[GlobalTableWitness](#globaltablewitness_csharp) [TableGlobalTableWitness](#tableglobaltablewitness)

Witness Region in a Multi-Region Strong Consistency deployment. **Note** This must be used alongside a single `replica` with `consistencyMode` set to `STRONG`. Other combinations will fail to provision. See below.

[HashKey](#hashkey_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Attribute to use as the hash (partition) key. Must also be defined as an `attribute`. See below.

[ImportTable](#importtable_csharp) [TableImportTable](#tableimporttable)

Import Amazon S3 data into a new table. See below.

[LocalSecondaryIndexes](#localsecondaryindexes_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [List<TableLocalSecondaryIndex>](#tablelocalsecondaryindex)

Describe an LSI on the table; these can only be allocated *at creation* so you cannot change this definition after you have created the resource. See below.

[Name](#name_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Unique within a region name of the table.

The following arguments are optional:

[OnDemandThroughput](#ondemandthroughput_csharp) [TableOnDemandThroughput](#tableondemandthroughput)

Sets the maximum number of read and write units for the specified on-demand table. See below.

[PointInTimeRecovery](#pointintimerecovery_csharp) [TablePointInTimeRecovery](#tablepointintimerecovery)

Enable point-in-time recovery options. See below.

[RangeKey](#rangekey_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Attribute to use as the range (sort) key. Must also be defined as an `attribute`, see below.

[ReadCapacity](#readcapacity_csharp) int

Number of read units for this table. If the `billingMode` is `PROVISIONED`, this field is required.

[Region](#region_csharp) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[Replicas](#replicas_csharp) [List<TableReplica>](#tablereplica)

Configuration block(s) with [DynamoDB Global Tables V2 (version 2019.11.21)](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/globaltables.V2.html) replication configurations. See below.

[RestoreBackupArn](#restorebackuparn_csharp) string

ARN of backup to restore.

[RestoreDateTime](#restoredatetime_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Time of the point-in-time recovery point to restore.

[RestoreSourceName](#restoresourcename_csharp) string

Name of the table to restore. Must match the name of an existing table.

[RestoreSourceTableArn](#restoresourcetablearn_csharp) string

ARN of the source table to restore. Must be supplied for cross-region restores.

[RestoreToLatestTime](#restoretolatesttime_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. bool

If set, restores table to the most recent point-in-time recovery point.

[ServerSideEncryption](#serversideencryption_csharp) [TableServerSideEncryption](#tableserversideencryption)

Encryption at rest options. AWS DynamoDB tables are automatically encrypted at rest with an AWS-owned Customer Master Key if this argument isn't specified. Must be supplied for cross-region restores. See below.

[StreamEnabled](#streamenabled_csharp) bool

Whether Streams are enabled.

[StreamViewType](#streamviewtype_csharp) string

When an item in the table is modified, StreamViewType determines what information is written to the table's stream. Valid values are `KEYS_ONLY`, `NEW_IMAGE`, `OLD_IMAGE`, `NEW_AND_OLD_IMAGES`. Only valid when `streamEnabled` is true.

[TableClass](#tableclass_csharp) string

Storage class of the table. Valid values are `STANDARD` and `STANDARD_INFREQUENT_ACCESS`. Default value is `STANDARD`.

[Tags](#tags_csharp) Dictionary<string, string>

A map of tags to populate on the created table. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[Ttl](#ttl_csharp) [TableTtl](#tablettl)

Configuration block for TTL. See below.

[WarmThroughput](#warmthroughput_csharp) [TableWarmThroughput](#tablewarmthroughput)

Sets the number of warm read and write units for the specified table. See below.

[WriteCapacity](#writecapacity_csharp) int

Number of write units for this table. If the `billingMode` is `PROVISIONED`, this field is required.

[Attributes](#attributes_go) [\[\]TableAttributeArgs](#tableattribute)

Set of nested attribute definitions. Only required for `hashKey` and `rangeKey` attributes. See below.

[BillingMode](#billingmode_go) string

Controls how you are charged for read and write throughput and how you manage capacity. The valid values are `PROVISIONED` and `PAY_PER_REQUEST`. Defaults to `PROVISIONED`.

[DeletionProtectionEnabled](#deletionprotectionenabled_go) bool

Enables deletion protection for table. Defaults to `false`.

[GlobalSecondaryIndexes](#globalsecondaryindexes_go) [\[\]TableGlobalSecondaryIndexArgs](#tableglobalsecondaryindex)

Describe a GSI for the table; subject to the normal limits on the number of GSIs, projected attributes, etc. See below.

[GlobalTableWitness](#globaltablewitness_go) [TableGlobalTableWitnessArgs](#tableglobaltablewitness)

Witness Region in a Multi-Region Strong Consistency deployment. **Note** This must be used alongside a single `replica` with `consistencyMode` set to `STRONG`. Other combinations will fail to provision. See below.

[HashKey](#hashkey_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Attribute to use as the hash (partition) key. Must also be defined as an `attribute`. See below.

[ImportTable](#importtable_go) [TableImportTableArgs](#tableimporttable)

Import Amazon S3 data into a new table. See below.

[LocalSecondaryIndexes](#localsecondaryindexes_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [\[\]TableLocalSecondaryIndexArgs](#tablelocalsecondaryindex)

Describe an LSI on the table; these can only be allocated *at creation* so you cannot change this definition after you have created the resource. See below.

[Name](#name_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Unique within a region name of the table.

The following arguments are optional:

[OnDemandThroughput](#ondemandthroughput_go) [TableOnDemandThroughputArgs](#tableondemandthroughput)

Sets the maximum number of read and write units for the specified on-demand table. See below.

[PointInTimeRecovery](#pointintimerecovery_go) [TablePointInTimeRecoveryArgs](#tablepointintimerecovery)

Enable point-in-time recovery options. See below.

[RangeKey](#rangekey_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Attribute to use as the range (sort) key. Must also be defined as an `attribute`, see below.

[ReadCapacity](#readcapacity_go) int

Number of read units for this table. If the `billingMode` is `PROVISIONED`, this field is required.

[Region](#region_go) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[Replicas](#replicas_go) [\[\]TableReplicaTypeArgs](#tablereplica)

Configuration block(s) with [DynamoDB Global Tables V2 (version 2019.11.21)](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/globaltables.V2.html) replication configurations. See below.

[RestoreBackupArn](#restorebackuparn_go) string

ARN of backup to restore.

[RestoreDateTime](#restoredatetime_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Time of the point-in-time recovery point to restore.

[RestoreSourceName](#restoresourcename_go) string

Name of the table to restore. Must match the name of an existing table.

[RestoreSourceTableArn](#restoresourcetablearn_go) string

ARN of the source table to restore. Must be supplied for cross-region restores.

[RestoreToLatestTime](#restoretolatesttime_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. bool

If set, restores table to the most recent point-in-time recovery point.

[ServerSideEncryption](#serversideencryption_go) [TableServerSideEncryptionArgs](#tableserversideencryption)

Encryption at rest options. AWS DynamoDB tables are automatically encrypted at rest with an AWS-owned Customer Master Key if this argument isn't specified. Must be supplied for cross-region restores. See below.

[StreamEnabled](#streamenabled_go) bool

Whether Streams are enabled.

[StreamViewType](#streamviewtype_go) string

When an item in the table is modified, StreamViewType determines what information is written to the table's stream. Valid values are `KEYS_ONLY`, `NEW_IMAGE`, `OLD_IMAGE`, `NEW_AND_OLD_IMAGES`. Only valid when `streamEnabled` is true.

[TableClass](#tableclass_go) string

Storage class of the table. Valid values are `STANDARD` and `STANDARD_INFREQUENT_ACCESS`. Default value is `STANDARD`.

[Tags](#tags_go) map\[string\]string

A map of tags to populate on the created table. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[Ttl](#ttl_go) [TableTtlArgs](#tablettl)

Configuration block for TTL. See below.

[WarmThroughput](#warmthroughput_go) [TableWarmThroughputArgs](#tablewarmthroughput)

Sets the number of warm read and write units for the specified table. See below.

[WriteCapacity](#writecapacity_go) int

Number of write units for this table. If the `billingMode` is `PROVISIONED`, this field is required.

[attributes](#attributes_hcl) [list(object)](#tableattribute)

Set of nested attribute definitions. Only required for `hashKey` and `rangeKey` attributes. See below.

[billing\_mode](#billing_mode_hcl) string

Controls how you are charged for read and write throughput and how you manage capacity. The valid values are `PROVISIONED` and `PAY_PER_REQUEST`. Defaults to `PROVISIONED`.

[deletion\_protection\_enabled](#deletion_protection_enabled_hcl) bool

Enables deletion protection for table. Defaults to `false`.

[global\_secondary\_indexes](#global_secondary_indexes_hcl) [list(object)](#tableglobalsecondaryindex)

Describe a GSI for the table; subject to the normal limits on the number of GSIs, projected attributes, etc. See below.

[global\_table\_witness](#global_table_witness_hcl) [object](#tableglobaltablewitness)

Witness Region in a Multi-Region Strong Consistency deployment. **Note** This must be used alongside a single `replica` with `consistencyMode` set to `STRONG`. Other combinations will fail to provision. See below.

[hash\_key](#hash_key_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Attribute to use as the hash (partition) key. Must also be defined as an `attribute`. See below.

[import\_table](#import_table_hcl) [object](#tableimporttable)

Import Amazon S3 data into a new table. See below.

[local\_secondary\_indexes](#local_secondary_indexes_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [list(object)](#tablelocalsecondaryindex)

Describe an LSI on the table; these can only be allocated *at creation* so you cannot change this definition after you have created the resource. See below.

[name](#name_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Unique within a region name of the table.

The following arguments are optional:

[on\_demand\_throughput](#on_demand_throughput_hcl) [object](#tableondemandthroughput)

Sets the maximum number of read and write units for the specified on-demand table. See below.

[point\_in\_time\_recovery](#point_in_time_recovery_hcl) [object](#tablepointintimerecovery)

Enable point-in-time recovery options. See below.

[range\_key](#range_key_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Attribute to use as the range (sort) key. Must also be defined as an `attribute`, see below.

[read\_capacity](#read_capacity_hcl) number

Number of read units for this table. If the `billingMode` is `PROVISIONED`, this field is required.

[region](#region_hcl) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[replicas](#replicas_hcl) [list(object)](#tablereplica)

Configuration block(s) with [DynamoDB Global Tables V2 (version 2019.11.21)](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/globaltables.V2.html) replication configurations. See below.

[restore\_backup\_arn](#restore_backup_arn_hcl) string

ARN of backup to restore.

[restore\_date\_time](#restore_date_time_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Time of the point-in-time recovery point to restore.

[restore\_source\_name](#restore_source_name_hcl) string

Name of the table to restore. Must match the name of an existing table.

[restore\_source\_table\_arn](#restore_source_table_arn_hcl) string

ARN of the source table to restore. Must be supplied for cross-region restores.

[restore\_to\_latest\_time](#restore_to_latest_time_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. bool

If set, restores table to the most recent point-in-time recovery point.

[server\_side\_encryption](#server_side_encryption_hcl) [object](#tableserversideencryption)

Encryption at rest options. AWS DynamoDB tables are automatically encrypted at rest with an AWS-owned Customer Master Key if this argument isn't specified. Must be supplied for cross-region restores. See below.

[stream\_enabled](#stream_enabled_hcl) bool

Whether Streams are enabled.

[stream\_view\_type](#stream_view_type_hcl) string

When an item in the table is modified, StreamViewType determines what information is written to the table's stream. Valid values are `KEYS_ONLY`, `NEW_IMAGE`, `OLD_IMAGE`, `NEW_AND_OLD_IMAGES`. Only valid when `streamEnabled` is true.

[table\_class](#table_class_hcl) string

Storage class of the table. Valid values are `STANDARD` and `STANDARD_INFREQUENT_ACCESS`. Default value is `STANDARD`.

[tags](#tags_hcl) map(string)

A map of tags to populate on the created table. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[ttl](#ttl_hcl) [object](#tablettl)

Configuration block for TTL. See below.

[warm\_throughput](#warm_throughput_hcl) [object](#tablewarmthroughput)

Sets the number of warm read and write units for the specified table. See below.

[write\_capacity](#write_capacity_hcl) number

Number of write units for this table. If the `billingMode` is `PROVISIONED`, this field is required.

[attributes](#attributes_java) [List<TableAttribute>](#tableattribute)

Set of nested attribute definitions. Only required for `hashKey` and `rangeKey` attributes. See below.

[billingMode](#billingmode_java) String

Controls how you are charged for read and write throughput and how you manage capacity. The valid values are `PROVISIONED` and `PAY_PER_REQUEST`. Defaults to `PROVISIONED`.

[deletionProtectionEnabled](#deletionprotectionenabled_java) Boolean

Enables deletion protection for table. Defaults to `false`.

[globalSecondaryIndexes](#globalsecondaryindexes_java) [List<TableGlobalSecondaryIndex>](#tableglobalsecondaryindex)

Describe a GSI for the table; subject to the normal limits on the number of GSIs, projected attributes, etc. See below.

[globalTableWitness](#globaltablewitness_java) [TableGlobalTableWitness](#tableglobaltablewitness)

Witness Region in a Multi-Region Strong Consistency deployment. **Note** This must be used alongside a single `replica` with `consistencyMode` set to `STRONG`. Other combinations will fail to provision. See below.

[hashKey](#hashkey_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Attribute to use as the hash (partition) key. Must also be defined as an `attribute`. See below.

[importTable](#importtable_java) [TableImportTable](#tableimporttable)

Import Amazon S3 data into a new table. See below.

[localSecondaryIndexes](#localsecondaryindexes_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [List<TableLocalSecondaryIndex>](#tablelocalsecondaryindex)

Describe an LSI on the table; these can only be allocated *at creation* so you cannot change this definition after you have created the resource. See below.

[name](#name_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Unique within a region name of the table.

The following arguments are optional:

[onDemandThroughput](#ondemandthroughput_java) [TableOnDemandThroughput](#tableondemandthroughput)

Sets the maximum number of read and write units for the specified on-demand table. See below.

[pointInTimeRecovery](#pointintimerecovery_java) [TablePointInTimeRecovery](#tablepointintimerecovery)

Enable point-in-time recovery options. See below.

[rangeKey](#rangekey_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Attribute to use as the range (sort) key. Must also be defined as an `attribute`, see below.

[readCapacity](#readcapacity_java) Integer

Number of read units for this table. If the `billingMode` is `PROVISIONED`, this field is required.

[region](#region_java) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[replicas](#replicas_java) [List<TableReplica>](#tablereplica)

Configuration block(s) with [DynamoDB Global Tables V2 (version 2019.11.21)](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/globaltables.V2.html) replication configurations. See below.

[restoreBackupArn](#restorebackuparn_java) String

ARN of backup to restore.

[restoreDateTime](#restoredatetime_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Time of the point-in-time recovery point to restore.

[restoreSourceName](#restoresourcename_java) String

Name of the table to restore. Must match the name of an existing table.

[restoreSourceTableArn](#restoresourcetablearn_java) String

ARN of the source table to restore. Must be supplied for cross-region restores.

[restoreToLatestTime](#restoretolatesttime_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. Boolean

If set, restores table to the most recent point-in-time recovery point.

[serverSideEncryption](#serversideencryption_java) [TableServerSideEncryption](#tableserversideencryption)

Encryption at rest options. AWS DynamoDB tables are automatically encrypted at rest with an AWS-owned Customer Master Key if this argument isn't specified. Must be supplied for cross-region restores. See below.

[streamEnabled](#streamenabled_java) Boolean

Whether Streams are enabled.

[streamViewType](#streamviewtype_java) String

When an item in the table is modified, StreamViewType determines what information is written to the table's stream. Valid values are `KEYS_ONLY`, `NEW_IMAGE`, `OLD_IMAGE`, `NEW_AND_OLD_IMAGES`. Only valid when `streamEnabled` is true.

[tableClass](#tableclass_java) String

Storage class of the table. Valid values are `STANDARD` and `STANDARD_INFREQUENT_ACCESS`. Default value is `STANDARD`.

[tags](#tags_java) Map<String,String>

A map of tags to populate on the created table. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[ttl](#ttl_java) [TableTtl](#tablettl)

Configuration block for TTL. See below.

[warmThroughput](#warmthroughput_java) [TableWarmThroughput](#tablewarmthroughput)

Sets the number of warm read and write units for the specified table. See below.

[writeCapacity](#writecapacity_java) Integer

Number of write units for this table. If the `billingMode` is `PROVISIONED`, this field is required.

[attributes](#attributes_nodejs) [TableAttribute\[\]](#tableattribute)

Set of nested attribute definitions. Only required for `hashKey` and `rangeKey` attributes. See below.

[billingMode](#billingmode_nodejs) string

Controls how you are charged for read and write throughput and how you manage capacity. The valid values are `PROVISIONED` and `PAY_PER_REQUEST`. Defaults to `PROVISIONED`.

[deletionProtectionEnabled](#deletionprotectionenabled_nodejs) boolean

Enables deletion protection for table. Defaults to `false`.

[globalSecondaryIndexes](#globalsecondaryindexes_nodejs) [TableGlobalSecondaryIndex\[\]](#tableglobalsecondaryindex)

Describe a GSI for the table; subject to the normal limits on the number of GSIs, projected attributes, etc. See below.

[globalTableWitness](#globaltablewitness_nodejs) [TableGlobalTableWitness](#tableglobaltablewitness)

Witness Region in a Multi-Region Strong Consistency deployment. **Note** This must be used alongside a single `replica` with `consistencyMode` set to `STRONG`. Other combinations will fail to provision. See below.

[hashKey](#hashkey_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Attribute to use as the hash (partition) key. Must also be defined as an `attribute`. See below.

[importTable](#importtable_nodejs) [TableImportTable](#tableimporttable)

Import Amazon S3 data into a new table. See below.

[localSecondaryIndexes](#localsecondaryindexes_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [TableLocalSecondaryIndex\[\]](#tablelocalsecondaryindex)

Describe an LSI on the table; these can only be allocated *at creation* so you cannot change this definition after you have created the resource. See below.

[name](#name_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Unique within a region name of the table.

The following arguments are optional:

[onDemandThroughput](#ondemandthroughput_nodejs) [TableOnDemandThroughput](#tableondemandthroughput)

Sets the maximum number of read and write units for the specified on-demand table. See below.

[pointInTimeRecovery](#pointintimerecovery_nodejs) [TablePointInTimeRecovery](#tablepointintimerecovery)

Enable point-in-time recovery options. See below.

[rangeKey](#rangekey_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Attribute to use as the range (sort) key. Must also be defined as an `attribute`, see below.

[readCapacity](#readcapacity_nodejs) number

Number of read units for this table. If the `billingMode` is `PROVISIONED`, this field is required.

[region](#region_nodejs) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[replicas](#replicas_nodejs) [TableReplica\[\]](#tablereplica)

Configuration block(s) with [DynamoDB Global Tables V2 (version 2019.11.21)](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/globaltables.V2.html) replication configurations. See below.

[restoreBackupArn](#restorebackuparn_nodejs) string

ARN of backup to restore.

[restoreDateTime](#restoredatetime_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Time of the point-in-time recovery point to restore.

[restoreSourceName](#restoresourcename_nodejs) string

Name of the table to restore. Must match the name of an existing table.

[restoreSourceTableArn](#restoresourcetablearn_nodejs) string

ARN of the source table to restore. Must be supplied for cross-region restores.

[restoreToLatestTime](#restoretolatesttime_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. boolean

If set, restores table to the most recent point-in-time recovery point.

[serverSideEncryption](#serversideencryption_nodejs) [TableServerSideEncryption](#tableserversideencryption)

Encryption at rest options. AWS DynamoDB tables are automatically encrypted at rest with an AWS-owned Customer Master Key if this argument isn't specified. Must be supplied for cross-region restores. See below.

[streamEnabled](#streamenabled_nodejs) boolean

Whether Streams are enabled.

[streamViewType](#streamviewtype_nodejs) string

When an item in the table is modified, StreamViewType determines what information is written to the table's stream. Valid values are `KEYS_ONLY`, `NEW_IMAGE`, `OLD_IMAGE`, `NEW_AND_OLD_IMAGES`. Only valid when `streamEnabled` is true.

[tableClass](#tableclass_nodejs) string

Storage class of the table. Valid values are `STANDARD` and `STANDARD_INFREQUENT_ACCESS`. Default value is `STANDARD`.

[tags](#tags_nodejs) {\[key: string\]: string}

A map of tags to populate on the created table. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[ttl](#ttl_nodejs) [TableTtl](#tablettl)

Configuration block for TTL. See below.

[warmThroughput](#warmthroughput_nodejs) [TableWarmThroughput](#tablewarmthroughput)

Sets the number of warm read and write units for the specified table. See below.

[writeCapacity](#writecapacity_nodejs) number

Number of write units for this table. If the `billingMode` is `PROVISIONED`, this field is required.

[attributes](#attributes_python) [Sequence\[TableAttributeArgs\]](#tableattribute)

Set of nested attribute definitions. Only required for `hashKey` and `rangeKey` attributes. See below.

[billing\_mode](#billing_mode_python) str

Controls how you are charged for read and write throughput and how you manage capacity. The valid values are `PROVISIONED` and `PAY_PER_REQUEST`. Defaults to `PROVISIONED`.

[deletion\_protection\_enabled](#deletion_protection_enabled_python) bool

Enables deletion protection for table. Defaults to `false`.

[global\_secondary\_indexes](#global_secondary_indexes_python) [Sequence\[TableGlobalSecondaryIndexArgs\]](#tableglobalsecondaryindex)

Describe a GSI for the table; subject to the normal limits on the number of GSIs, projected attributes, etc. See below.

[global\_table\_witness](#global_table_witness_python) [TableGlobalTableWitnessArgs](#tableglobaltablewitness)

Witness Region in a Multi-Region Strong Consistency deployment. **Note** This must be used alongside a single `replica` with `consistencyMode` set to `STRONG`. Other combinations will fail to provision. See below.

[hash\_key](#hash_key_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Attribute to use as the hash (partition) key. Must also be defined as an `attribute`. See below.

[import\_table](#import_table_python) [TableImportTableArgs](#tableimporttable)

Import Amazon S3 data into a new table. See below.

[local\_secondary\_indexes](#local_secondary_indexes_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [Sequence\[TableLocalSecondaryIndexArgs\]](#tablelocalsecondaryindex)

Describe an LSI on the table; these can only be allocated *at creation* so you cannot change this definition after you have created the resource. See below.

[name](#name_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Unique within a region name of the table.

The following arguments are optional:

[on\_demand\_throughput](#on_demand_throughput_python) [TableOnDemandThroughputArgs](#tableondemandthroughput)

Sets the maximum number of read and write units for the specified on-demand table. See below.

[point\_in\_time\_recovery](#point_in_time_recovery_python) [TablePointInTimeRecoveryArgs](#tablepointintimerecovery)

Enable point-in-time recovery options. See below.

[range\_key](#range_key_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Attribute to use as the range (sort) key. Must also be defined as an `attribute`, see below.

[read\_capacity](#read_capacity_python) int

Number of read units for this table. If the `billingMode` is `PROVISIONED`, this field is required.

[region](#region_python) str

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[replicas](#replicas_python) [Sequence\[TableReplicaArgs\]](#tablereplica)

Configuration block(s) with [DynamoDB Global Tables V2 (version 2019.11.21)](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/globaltables.V2.html) replication configurations. See below.

[restore\_backup\_arn](#restore_backup_arn_python) str

ARN of backup to restore.

[restore\_date\_time](#restore_date_time_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Time of the point-in-time recovery point to restore.

[restore\_source\_name](#restore_source_name_python) str

Name of the table to restore. Must match the name of an existing table.

[restore\_source\_table\_arn](#restore_source_table_arn_python) str

ARN of the source table to restore. Must be supplied for cross-region restores.

[restore\_to\_latest\_time](#restore_to_latest_time_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. bool

If set, restores table to the most recent point-in-time recovery point.

[server\_side\_encryption](#server_side_encryption_python) [TableServerSideEncryptionArgs](#tableserversideencryption)

Encryption at rest options. AWS DynamoDB tables are automatically encrypted at rest with an AWS-owned Customer Master Key if this argument isn't specified. Must be supplied for cross-region restores. See below.

[stream\_enabled](#stream_enabled_python) bool

Whether Streams are enabled.

[stream\_view\_type](#stream_view_type_python) str

When an item in the table is modified, StreamViewType determines what information is written to the table's stream. Valid values are `KEYS_ONLY`, `NEW_IMAGE`, `OLD_IMAGE`, `NEW_AND_OLD_IMAGES`. Only valid when `streamEnabled` is true.

[table\_class](#table_class_python) str

Storage class of the table. Valid values are `STANDARD` and `STANDARD_INFREQUENT_ACCESS`. Default value is `STANDARD`.

[tags](#tags_python) Mapping\[str, str\]

A map of tags to populate on the created table. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[ttl](#ttl_python) [TableTtlArgs](#tablettl)

Configuration block for TTL. See below.

[warm\_throughput](#warm_throughput_python) [TableWarmThroughputArgs](#tablewarmthroughput)

Sets the number of warm read and write units for the specified table. See below.

[write\_capacity](#write_capacity_python) int

Number of write units for this table. If the `billingMode` is `PROVISIONED`, this field is required.

[attributes](#attributes_yaml) [List<Property Map>](#tableattribute)

Set of nested attribute definitions. Only required for `hashKey` and `rangeKey` attributes. See below.

[billingMode](#billingmode_yaml) String

Controls how you are charged for read and write throughput and how you manage capacity. The valid values are `PROVISIONED` and `PAY_PER_REQUEST`. Defaults to `PROVISIONED`.

[deletionProtectionEnabled](#deletionprotectionenabled_yaml) Boolean

Enables deletion protection for table. Defaults to `false`.

[globalSecondaryIndexes](#globalsecondaryindexes_yaml) [List<Property Map>](#tableglobalsecondaryindex)

Describe a GSI for the table; subject to the normal limits on the number of GSIs, projected attributes, etc. See below.

[globalTableWitness](#globaltablewitness_yaml) [Property Map](#tableglobaltablewitness)

Witness Region in a Multi-Region Strong Consistency deployment. **Note** This must be used alongside a single `replica` with `consistencyMode` set to `STRONG`. Other combinations will fail to provision. See below.

[hashKey](#hashkey_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Attribute to use as the hash (partition) key. Must also be defined as an `attribute`. See below.

[importTable](#importtable_yaml) [Property Map](#tableimporttable)

Import Amazon S3 data into a new table. See below.

[localSecondaryIndexes](#localsecondaryindexes_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [List<Property Map>](#tablelocalsecondaryindex)

Describe an LSI on the table; these can only be allocated *at creation* so you cannot change this definition after you have created the resource. See below.

[name](#name_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Unique within a region name of the table.

The following arguments are optional:

[onDemandThroughput](#ondemandthroughput_yaml) [Property Map](#tableondemandthroughput)

Sets the maximum number of read and write units for the specified on-demand table. See below.

[pointInTimeRecovery](#pointintimerecovery_yaml) [Property Map](#tablepointintimerecovery)

Enable point-in-time recovery options. See below.

[rangeKey](#rangekey_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Attribute to use as the range (sort) key. Must also be defined as an `attribute`, see below.

[readCapacity](#readcapacity_yaml) Number

Number of read units for this table. If the `billingMode` is `PROVISIONED`, this field is required.

[region](#region_yaml) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[replicas](#replicas_yaml) [List<Property Map>](#tablereplica)

Configuration block(s) with [DynamoDB Global Tables V2 (version 2019.11.21)](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/globaltables.V2.html) replication configurations. See below.

[restoreBackupArn](#restorebackuparn_yaml) String

ARN of backup to restore.

[restoreDateTime](#restoredatetime_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Time of the point-in-time recovery point to restore.

[restoreSourceName](#restoresourcename_yaml) String

Name of the table to restore. Must match the name of an existing table.

[restoreSourceTableArn](#restoresourcetablearn_yaml) String

ARN of the source table to restore. Must be supplied for cross-region restores.

[restoreToLatestTime](#restoretolatesttime_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. Boolean

If set, restores table to the most recent point-in-time recovery point.

[serverSideEncryption](#serversideencryption_yaml) [Property Map](#tableserversideencryption)

Encryption at rest options. AWS DynamoDB tables are automatically encrypted at rest with an AWS-owned Customer Master Key if this argument isn't specified. Must be supplied for cross-region restores. See below.

[streamEnabled](#streamenabled_yaml) Boolean

Whether Streams are enabled.

[streamViewType](#streamviewtype_yaml) String

When an item in the table is modified, StreamViewType determines what information is written to the table's stream. Valid values are `KEYS_ONLY`, `NEW_IMAGE`, `OLD_IMAGE`, `NEW_AND_OLD_IMAGES`. Only valid when `streamEnabled` is true.

[tableClass](#tableclass_yaml) String

Storage class of the table. Valid values are `STANDARD` and `STANDARD_INFREQUENT_ACCESS`. Default value is `STANDARD`.

[tags](#tags_yaml) Map<String>

A map of tags to populate on the created table. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[ttl](#ttl_yaml) [Property Map](#tablettl)

Configuration block for TTL. See below.

[warmThroughput](#warmthroughput_yaml) [Property Map](#tablewarmthroughput)

Sets the number of warm read and write units for the specified table. See below.

[writeCapacity](#writecapacity_yaml) Number

Number of write units for this table. If the `billingMode` is `PROVISIONED`, this field is required.

### Outputs[](#outputs)

All [input](#inputs) properties are implicitly available as output properties. Additionally, the Table resource produces the following output properties:

[Arn](#arn_csharp) string

ARN of the table

[Id](#id_csharp) string

The provider-assigned unique ID for this managed resource.

[StreamArn](#streamarn_csharp) string

ARN of the Table Stream. Only available when `streamEnabled = true`

[StreamLabel](#streamlabel_csharp) string

Timestamp, in ISO 8601 format, for this stream. Note that this timestamp is not a unique identifier for the stream on its own. However, the combination of AWS customer ID, table name and this field is guaranteed to be unique. It can be used for creating CloudWatch Alarms. Only available when `streamEnabled = true`.

[TagsAll](#tagsall_csharp) Dictionary<string, string>

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[Arn](#arn_go) string

ARN of the table

[Id](#id_go) string

The provider-assigned unique ID for this managed resource.

[StreamArn](#streamarn_go) string

ARN of the Table Stream. Only available when `streamEnabled = true`

[StreamLabel](#streamlabel_go) string

Timestamp, in ISO 8601 format, for this stream. Note that this timestamp is not a unique identifier for the stream on its own. However, the combination of AWS customer ID, table name and this field is guaranteed to be unique. It can be used for creating CloudWatch Alarms. Only available when `streamEnabled = true`.

[TagsAll](#tagsall_go) map\[string\]string

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[arn](#arn_hcl) string

ARN of the table

[id](#id_hcl) string

The provider-assigned unique ID for this managed resource.

[stream\_arn](#stream_arn_hcl) string

ARN of the Table Stream. Only available when `streamEnabled = true`

[stream\_label](#stream_label_hcl) string

Timestamp, in ISO 8601 format, for this stream. Note that this timestamp is not a unique identifier for the stream on its own. However, the combination of AWS customer ID, table name and this field is guaranteed to be unique. It can be used for creating CloudWatch Alarms. Only available when `streamEnabled = true`.

[tags\_all](#tags_all_hcl) map(string)

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[arn](#arn_java) String

ARN of the table

[id](#id_java) String

The provider-assigned unique ID for this managed resource.

[streamArn](#streamarn_java) String

ARN of the Table Stream. Only available when `streamEnabled = true`

[streamLabel](#streamlabel_java) String

Timestamp, in ISO 8601 format, for this stream. Note that this timestamp is not a unique identifier for the stream on its own. However, the combination of AWS customer ID, table name and this field is guaranteed to be unique. It can be used for creating CloudWatch Alarms. Only available when `streamEnabled = true`.

[tagsAll](#tagsall_java) Map<String,String>

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[arn](#arn_nodejs) string

ARN of the table

[id](#id_nodejs) string

The provider-assigned unique ID for this managed resource.

[streamArn](#streamarn_nodejs) string

ARN of the Table Stream. Only available when `streamEnabled = true`

[streamLabel](#streamlabel_nodejs) string

Timestamp, in ISO 8601 format, for this stream. Note that this timestamp is not a unique identifier for the stream on its own. However, the combination of AWS customer ID, table name and this field is guaranteed to be unique. It can be used for creating CloudWatch Alarms. Only available when `streamEnabled = true`.

[tagsAll](#tagsall_nodejs) {\[key: string\]: string}

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[arn](#arn_python) str

ARN of the table

[id](#id_python) str

The provider-assigned unique ID for this managed resource.

[stream\_arn](#stream_arn_python) str

ARN of the Table Stream. Only available when `streamEnabled = true`

[stream\_label](#stream_label_python) str

Timestamp, in ISO 8601 format, for this stream. Note that this timestamp is not a unique identifier for the stream on its own. However, the combination of AWS customer ID, table name and this field is guaranteed to be unique. It can be used for creating CloudWatch Alarms. Only available when `streamEnabled = true`.

[tags\_all](#tags_all_python) Mapping\[str, str\]

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[arn](#arn_yaml) String

ARN of the table

[id](#id_yaml) String

The provider-assigned unique ID for this managed resource.

[streamArn](#streamarn_yaml) String

ARN of the Table Stream. Only available when `streamEnabled = true`

[streamLabel](#streamlabel_yaml) String

Timestamp, in ISO 8601 format, for this stream. Note that this timestamp is not a unique identifier for the stream on its own. However, the combination of AWS customer ID, table name and this field is guaranteed to be unique. It can be used for creating CloudWatch Alarms. Only available when `streamEnabled = true`.

[tagsAll](#tagsall_yaml) Map<String>

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

## Look up Existing Table Resource[](#look-up)

Get an existing Table resource’s state with the given name, ID, and optional extra properties used to qualify the lookup.

-   TypeScript
-   Python
-   Go
-   C#
-   Java
-   YAML
-   HCL PREVIEW

```typescript
public static get(name: string, id: Input<ID>, state?: TableState, opts?: CustomResourceOptions): Table
```

```python
@staticmethod
def get(resource_name: str,
        id: str,
        opts: Optional[ResourceOptions] = None,
        arn: Optional[str] = None,
        attributes: Optional[Sequence[TableAttributeArgs]] = None,
        billing_mode: Optional[str] = None,
        deletion_protection_enabled: Optional[bool] = None,
        global_secondary_indexes: Optional[Sequence[TableGlobalSecondaryIndexArgs]] = None,
        global_table_witness: Optional[TableGlobalTableWitnessArgs] = None,
        hash_key: Optional[str] = None,
        import_table: Optional[TableImportTableArgs] = None,
        local_secondary_indexes: Optional[Sequence[TableLocalSecondaryIndexArgs]] = None,
        name: Optional[str] = None,
        on_demand_throughput: Optional[TableOnDemandThroughputArgs] = None,
        point_in_time_recovery: Optional[TablePointInTimeRecoveryArgs] = None,
        range_key: Optional[str] = None,
        read_capacity: Optional[int] = None,
        region: Optional[str] = None,
        replicas: Optional[Sequence[TableReplicaArgs]] = None,
        restore_backup_arn: Optional[str] = None,
        restore_date_time: Optional[str] = None,
        restore_source_name: Optional[str] = None,
        restore_source_table_arn: Optional[str] = None,
        restore_to_latest_time: Optional[bool] = None,
        server_side_encryption: Optional[TableServerSideEncryptionArgs] = None,
        stream_arn: Optional[str] = None,
        stream_enabled: Optional[bool] = None,
        stream_label: Optional[str] = None,
        stream_view_type: Optional[str] = None,
        table_class: Optional[str] = None,
        tags: Optional[Mapping[str, str]] = None,
        tags_all: Optional[Mapping[str, str]] = None,
        ttl: Optional[TableTtlArgs] = None,
        warm_throughput: Optional[TableWarmThroughputArgs] = None,
        write_capacity: Optional[int] = None) -> Table
```

```go
func GetTable(ctx *Context, name string, id IDInput, state *TableState, opts ...ResourceOption) (*Table, error)
```

```csharp
public static Table Get(string name, Input<string> id, TableState? state, CustomResourceOptions? opts = null)
```

```java
public static Table get(String name, Output<String> id, TableState state, CustomResourceOptions options)
```

```yaml
resources:  _:    type: aws:dynamodb:Table    get:      id: ${id}
```

```hcl
import {
  to = aws_dynamodb_table.example
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

ARN of the table

[Attributes](#state_attributes_csharp) [List<TableAttribute>](#tableattribute)

Set of nested attribute definitions. Only required for `hashKey` and `rangeKey` attributes. See below.

[BillingMode](#state_billingmode_csharp) string

Controls how you are charged for read and write throughput and how you manage capacity. The valid values are `PROVISIONED` and `PAY_PER_REQUEST`. Defaults to `PROVISIONED`.

[DeletionProtectionEnabled](#state_deletionprotectionenabled_csharp) bool

Enables deletion protection for table. Defaults to `false`.

[GlobalSecondaryIndexes](#state_globalsecondaryindexes_csharp) [List<TableGlobalSecondaryIndex>](#tableglobalsecondaryindex)

Describe a GSI for the table; subject to the normal limits on the number of GSIs, projected attributes, etc. See below.

[GlobalTableWitness](#state_globaltablewitness_csharp) [TableGlobalTableWitness](#tableglobaltablewitness)

Witness Region in a Multi-Region Strong Consistency deployment. **Note** This must be used alongside a single `replica` with `consistencyMode` set to `STRONG`. Other combinations will fail to provision. See below.

[HashKey](#state_hashkey_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Attribute to use as the hash (partition) key. Must also be defined as an `attribute`. See below.

[ImportTable](#state_importtable_csharp) [TableImportTable](#tableimporttable)

Import Amazon S3 data into a new table. See below.

[LocalSecondaryIndexes](#state_localsecondaryindexes_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [List<TableLocalSecondaryIndex>](#tablelocalsecondaryindex)

Describe an LSI on the table; these can only be allocated *at creation* so you cannot change this definition after you have created the resource. See below.

[Name](#state_name_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Unique within a region name of the table.

The following arguments are optional:

[OnDemandThroughput](#state_ondemandthroughput_csharp) [TableOnDemandThroughput](#tableondemandthroughput)

Sets the maximum number of read and write units for the specified on-demand table. See below.

[PointInTimeRecovery](#state_pointintimerecovery_csharp) [TablePointInTimeRecovery](#tablepointintimerecovery)

Enable point-in-time recovery options. See below.

[RangeKey](#state_rangekey_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Attribute to use as the range (sort) key. Must also be defined as an `attribute`, see below.

[ReadCapacity](#state_readcapacity_csharp) int

Number of read units for this table. If the `billingMode` is `PROVISIONED`, this field is required.

[Region](#state_region_csharp) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[Replicas](#state_replicas_csharp) [List<TableReplica>](#tablereplica)

Configuration block(s) with [DynamoDB Global Tables V2 (version 2019.11.21)](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/globaltables.V2.html) replication configurations. See below.

[RestoreBackupArn](#state_restorebackuparn_csharp) string

ARN of backup to restore.

[RestoreDateTime](#state_restoredatetime_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Time of the point-in-time recovery point to restore.

[RestoreSourceName](#state_restoresourcename_csharp) string

Name of the table to restore. Must match the name of an existing table.

[RestoreSourceTableArn](#state_restoresourcetablearn_csharp) string

ARN of the source table to restore. Must be supplied for cross-region restores.

[RestoreToLatestTime](#state_restoretolatesttime_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. bool

If set, restores table to the most recent point-in-time recovery point.

[ServerSideEncryption](#state_serversideencryption_csharp) [TableServerSideEncryption](#tableserversideencryption)

Encryption at rest options. AWS DynamoDB tables are automatically encrypted at rest with an AWS-owned Customer Master Key if this argument isn't specified. Must be supplied for cross-region restores. See below.

[StreamArn](#state_streamarn_csharp) string

ARN of the Table Stream. Only available when `streamEnabled = true`

[StreamEnabled](#state_streamenabled_csharp) bool

Whether Streams are enabled.

[StreamLabel](#state_streamlabel_csharp) string

Timestamp, in ISO 8601 format, for this stream. Note that this timestamp is not a unique identifier for the stream on its own. However, the combination of AWS customer ID, table name and this field is guaranteed to be unique. It can be used for creating CloudWatch Alarms. Only available when `streamEnabled = true`.

[StreamViewType](#state_streamviewtype_csharp) string

When an item in the table is modified, StreamViewType determines what information is written to the table's stream. Valid values are `KEYS_ONLY`, `NEW_IMAGE`, `OLD_IMAGE`, `NEW_AND_OLD_IMAGES`. Only valid when `streamEnabled` is true.

[TableClass](#state_tableclass_csharp) string

Storage class of the table. Valid values are `STANDARD` and `STANDARD_INFREQUENT_ACCESS`. Default value is `STANDARD`.

[Tags](#state_tags_csharp) Dictionary<string, string>

A map of tags to populate on the created table. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[TagsAll](#state_tagsall_csharp) Dictionary<string, string>

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[Ttl](#state_ttl_csharp) [TableTtl](#tablettl)

Configuration block for TTL. See below.

[WarmThroughput](#state_warmthroughput_csharp) [TableWarmThroughput](#tablewarmthroughput)

Sets the number of warm read and write units for the specified table. See below.

[WriteCapacity](#state_writecapacity_csharp) int

Number of write units for this table. If the `billingMode` is `PROVISIONED`, this field is required.

[Arn](#state_arn_go) string

ARN of the table

[Attributes](#state_attributes_go) [\[\]TableAttributeArgs](#tableattribute)

Set of nested attribute definitions. Only required for `hashKey` and `rangeKey` attributes. See below.

[BillingMode](#state_billingmode_go) string

Controls how you are charged for read and write throughput and how you manage capacity. The valid values are `PROVISIONED` and `PAY_PER_REQUEST`. Defaults to `PROVISIONED`.

[DeletionProtectionEnabled](#state_deletionprotectionenabled_go) bool

Enables deletion protection for table. Defaults to `false`.

[GlobalSecondaryIndexes](#state_globalsecondaryindexes_go) [\[\]TableGlobalSecondaryIndexArgs](#tableglobalsecondaryindex)

Describe a GSI for the table; subject to the normal limits on the number of GSIs, projected attributes, etc. See below.

[GlobalTableWitness](#state_globaltablewitness_go) [TableGlobalTableWitnessArgs](#tableglobaltablewitness)

Witness Region in a Multi-Region Strong Consistency deployment. **Note** This must be used alongside a single `replica` with `consistencyMode` set to `STRONG`. Other combinations will fail to provision. See below.

[HashKey](#state_hashkey_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Attribute to use as the hash (partition) key. Must also be defined as an `attribute`. See below.

[ImportTable](#state_importtable_go) [TableImportTableArgs](#tableimporttable)

Import Amazon S3 data into a new table. See below.

[LocalSecondaryIndexes](#state_localsecondaryindexes_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [\[\]TableLocalSecondaryIndexArgs](#tablelocalsecondaryindex)

Describe an LSI on the table; these can only be allocated *at creation* so you cannot change this definition after you have created the resource. See below.

[Name](#state_name_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Unique within a region name of the table.

The following arguments are optional:

[OnDemandThroughput](#state_ondemandthroughput_go) [TableOnDemandThroughputArgs](#tableondemandthroughput)

Sets the maximum number of read and write units for the specified on-demand table. See below.

[PointInTimeRecovery](#state_pointintimerecovery_go) [TablePointInTimeRecoveryArgs](#tablepointintimerecovery)

Enable point-in-time recovery options. See below.

[RangeKey](#state_rangekey_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Attribute to use as the range (sort) key. Must also be defined as an `attribute`, see below.

[ReadCapacity](#state_readcapacity_go) int

Number of read units for this table. If the `billingMode` is `PROVISIONED`, this field is required.

[Region](#state_region_go) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[Replicas](#state_replicas_go) [\[\]TableReplicaTypeArgs](#tablereplica)

Configuration block(s) with [DynamoDB Global Tables V2 (version 2019.11.21)](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/globaltables.V2.html) replication configurations. See below.

[RestoreBackupArn](#state_restorebackuparn_go) string

ARN of backup to restore.

[RestoreDateTime](#state_restoredatetime_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Time of the point-in-time recovery point to restore.

[RestoreSourceName](#state_restoresourcename_go) string

Name of the table to restore. Must match the name of an existing table.

[RestoreSourceTableArn](#state_restoresourcetablearn_go) string

ARN of the source table to restore. Must be supplied for cross-region restores.

[RestoreToLatestTime](#state_restoretolatesttime_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. bool

If set, restores table to the most recent point-in-time recovery point.

[ServerSideEncryption](#state_serversideencryption_go) [TableServerSideEncryptionArgs](#tableserversideencryption)

Encryption at rest options. AWS DynamoDB tables are automatically encrypted at rest with an AWS-owned Customer Master Key if this argument isn't specified. Must be supplied for cross-region restores. See below.

[StreamArn](#state_streamarn_go) string

ARN of the Table Stream. Only available when `streamEnabled = true`

[StreamEnabled](#state_streamenabled_go) bool

Whether Streams are enabled.

[StreamLabel](#state_streamlabel_go) string

Timestamp, in ISO 8601 format, for this stream. Note that this timestamp is not a unique identifier for the stream on its own. However, the combination of AWS customer ID, table name and this field is guaranteed to be unique. It can be used for creating CloudWatch Alarms. Only available when `streamEnabled = true`.

[StreamViewType](#state_streamviewtype_go) string

When an item in the table is modified, StreamViewType determines what information is written to the table's stream. Valid values are `KEYS_ONLY`, `NEW_IMAGE`, `OLD_IMAGE`, `NEW_AND_OLD_IMAGES`. Only valid when `streamEnabled` is true.

[TableClass](#state_tableclass_go) string

Storage class of the table. Valid values are `STANDARD` and `STANDARD_INFREQUENT_ACCESS`. Default value is `STANDARD`.

[Tags](#state_tags_go) map\[string\]string

A map of tags to populate on the created table. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[TagsAll](#state_tagsall_go) map\[string\]string

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[Ttl](#state_ttl_go) [TableTtlArgs](#tablettl)

Configuration block for TTL. See below.

[WarmThroughput](#state_warmthroughput_go) [TableWarmThroughputArgs](#tablewarmthroughput)

Sets the number of warm read and write units for the specified table. See below.

[WriteCapacity](#state_writecapacity_go) int

Number of write units for this table. If the `billingMode` is `PROVISIONED`, this field is required.

[arn](#state_arn_hcl) string

ARN of the table

[attributes](#state_attributes_hcl) [list(object)](#tableattribute)

Set of nested attribute definitions. Only required for `hashKey` and `rangeKey` attributes. See below.

[billing\_mode](#state_billing_mode_hcl) string

Controls how you are charged for read and write throughput and how you manage capacity. The valid values are `PROVISIONED` and `PAY_PER_REQUEST`. Defaults to `PROVISIONED`.

[deletion\_protection\_enabled](#state_deletion_protection_enabled_hcl) bool

Enables deletion protection for table. Defaults to `false`.

[global\_secondary\_indexes](#state_global_secondary_indexes_hcl) [list(object)](#tableglobalsecondaryindex)

Describe a GSI for the table; subject to the normal limits on the number of GSIs, projected attributes, etc. See below.

[global\_table\_witness](#state_global_table_witness_hcl) [object](#tableglobaltablewitness)

Witness Region in a Multi-Region Strong Consistency deployment. **Note** This must be used alongside a single `replica` with `consistencyMode` set to `STRONG`. Other combinations will fail to provision. See below.

[hash\_key](#state_hash_key_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Attribute to use as the hash (partition) key. Must also be defined as an `attribute`. See below.

[import\_table](#state_import_table_hcl) [object](#tableimporttable)

Import Amazon S3 data into a new table. See below.

[local\_secondary\_indexes](#state_local_secondary_indexes_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [list(object)](#tablelocalsecondaryindex)

Describe an LSI on the table; these can only be allocated *at creation* so you cannot change this definition after you have created the resource. See below.

[name](#state_name_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Unique within a region name of the table.

The following arguments are optional:

[on\_demand\_throughput](#state_on_demand_throughput_hcl) [object](#tableondemandthroughput)

Sets the maximum number of read and write units for the specified on-demand table. See below.

[point\_in\_time\_recovery](#state_point_in_time_recovery_hcl) [object](#tablepointintimerecovery)

Enable point-in-time recovery options. See below.

[range\_key](#state_range_key_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Attribute to use as the range (sort) key. Must also be defined as an `attribute`, see below.

[read\_capacity](#state_read_capacity_hcl) number

Number of read units for this table. If the `billingMode` is `PROVISIONED`, this field is required.

[region](#state_region_hcl) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[replicas](#state_replicas_hcl) [list(object)](#tablereplica)

Configuration block(s) with [DynamoDB Global Tables V2 (version 2019.11.21)](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/globaltables.V2.html) replication configurations. See below.

[restore\_backup\_arn](#state_restore_backup_arn_hcl) string

ARN of backup to restore.

[restore\_date\_time](#state_restore_date_time_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Time of the point-in-time recovery point to restore.

[restore\_source\_name](#state_restore_source_name_hcl) string

Name of the table to restore. Must match the name of an existing table.

[restore\_source\_table\_arn](#state_restore_source_table_arn_hcl) string

ARN of the source table to restore. Must be supplied for cross-region restores.

[restore\_to\_latest\_time](#state_restore_to_latest_time_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. bool

If set, restores table to the most recent point-in-time recovery point.

[server\_side\_encryption](#state_server_side_encryption_hcl) [object](#tableserversideencryption)

Encryption at rest options. AWS DynamoDB tables are automatically encrypted at rest with an AWS-owned Customer Master Key if this argument isn't specified. Must be supplied for cross-region restores. See below.

[stream\_arn](#state_stream_arn_hcl) string

ARN of the Table Stream. Only available when `streamEnabled = true`

[stream\_enabled](#state_stream_enabled_hcl) bool

Whether Streams are enabled.

[stream\_label](#state_stream_label_hcl) string

Timestamp, in ISO 8601 format, for this stream. Note that this timestamp is not a unique identifier for the stream on its own. However, the combination of AWS customer ID, table name and this field is guaranteed to be unique. It can be used for creating CloudWatch Alarms. Only available when `streamEnabled = true`.

[stream\_view\_type](#state_stream_view_type_hcl) string

When an item in the table is modified, StreamViewType determines what information is written to the table's stream. Valid values are `KEYS_ONLY`, `NEW_IMAGE`, `OLD_IMAGE`, `NEW_AND_OLD_IMAGES`. Only valid when `streamEnabled` is true.

[table\_class](#state_table_class_hcl) string

Storage class of the table. Valid values are `STANDARD` and `STANDARD_INFREQUENT_ACCESS`. Default value is `STANDARD`.

[tags](#state_tags_hcl) map(string)

A map of tags to populate on the created table. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tags\_all](#state_tags_all_hcl) map(string)

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[ttl](#state_ttl_hcl) [object](#tablettl)

Configuration block for TTL. See below.

[warm\_throughput](#state_warm_throughput_hcl) [object](#tablewarmthroughput)

Sets the number of warm read and write units for the specified table. See below.

[write\_capacity](#state_write_capacity_hcl) number

Number of write units for this table. If the `billingMode` is `PROVISIONED`, this field is required.

[arn](#state_arn_java) String

ARN of the table

[attributes](#state_attributes_java) [List<TableAttribute>](#tableattribute)

Set of nested attribute definitions. Only required for `hashKey` and `rangeKey` attributes. See below.

[billingMode](#state_billingmode_java) String

Controls how you are charged for read and write throughput and how you manage capacity. The valid values are `PROVISIONED` and `PAY_PER_REQUEST`. Defaults to `PROVISIONED`.

[deletionProtectionEnabled](#state_deletionprotectionenabled_java) Boolean

Enables deletion protection for table. Defaults to `false`.

[globalSecondaryIndexes](#state_globalsecondaryindexes_java) [List<TableGlobalSecondaryIndex>](#tableglobalsecondaryindex)

Describe a GSI for the table; subject to the normal limits on the number of GSIs, projected attributes, etc. See below.

[globalTableWitness](#state_globaltablewitness_java) [TableGlobalTableWitness](#tableglobaltablewitness)

Witness Region in a Multi-Region Strong Consistency deployment. **Note** This must be used alongside a single `replica` with `consistencyMode` set to `STRONG`. Other combinations will fail to provision. See below.

[hashKey](#state_hashkey_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Attribute to use as the hash (partition) key. Must also be defined as an `attribute`. See below.

[importTable](#state_importtable_java) [TableImportTable](#tableimporttable)

Import Amazon S3 data into a new table. See below.

[localSecondaryIndexes](#state_localsecondaryindexes_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [List<TableLocalSecondaryIndex>](#tablelocalsecondaryindex)

Describe an LSI on the table; these can only be allocated *at creation* so you cannot change this definition after you have created the resource. See below.

[name](#state_name_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Unique within a region name of the table.

The following arguments are optional:

[onDemandThroughput](#state_ondemandthroughput_java) [TableOnDemandThroughput](#tableondemandthroughput)

Sets the maximum number of read and write units for the specified on-demand table. See below.

[pointInTimeRecovery](#state_pointintimerecovery_java) [TablePointInTimeRecovery](#tablepointintimerecovery)

Enable point-in-time recovery options. See below.

[rangeKey](#state_rangekey_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Attribute to use as the range (sort) key. Must also be defined as an `attribute`, see below.

[readCapacity](#state_readcapacity_java) Integer

Number of read units for this table. If the `billingMode` is `PROVISIONED`, this field is required.

[region](#state_region_java) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[replicas](#state_replicas_java) [List<TableReplica>](#tablereplica)

Configuration block(s) with [DynamoDB Global Tables V2 (version 2019.11.21)](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/globaltables.V2.html) replication configurations. See below.

[restoreBackupArn](#state_restorebackuparn_java) String

ARN of backup to restore.

[restoreDateTime](#state_restoredatetime_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Time of the point-in-time recovery point to restore.

[restoreSourceName](#state_restoresourcename_java) String

Name of the table to restore. Must match the name of an existing table.

[restoreSourceTableArn](#state_restoresourcetablearn_java) String

ARN of the source table to restore. Must be supplied for cross-region restores.

[restoreToLatestTime](#state_restoretolatesttime_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. Boolean

If set, restores table to the most recent point-in-time recovery point.

[serverSideEncryption](#state_serversideencryption_java) [TableServerSideEncryption](#tableserversideencryption)

Encryption at rest options. AWS DynamoDB tables are automatically encrypted at rest with an AWS-owned Customer Master Key if this argument isn't specified. Must be supplied for cross-region restores. See below.

[streamArn](#state_streamarn_java) String

ARN of the Table Stream. Only available when `streamEnabled = true`

[streamEnabled](#state_streamenabled_java) Boolean

Whether Streams are enabled.

[streamLabel](#state_streamlabel_java) String

Timestamp, in ISO 8601 format, for this stream. Note that this timestamp is not a unique identifier for the stream on its own. However, the combination of AWS customer ID, table name and this field is guaranteed to be unique. It can be used for creating CloudWatch Alarms. Only available when `streamEnabled = true`.

[streamViewType](#state_streamviewtype_java) String

When an item in the table is modified, StreamViewType determines what information is written to the table's stream. Valid values are `KEYS_ONLY`, `NEW_IMAGE`, `OLD_IMAGE`, `NEW_AND_OLD_IMAGES`. Only valid when `streamEnabled` is true.

[tableClass](#state_tableclass_java) String

Storage class of the table. Valid values are `STANDARD` and `STANDARD_INFREQUENT_ACCESS`. Default value is `STANDARD`.

[tags](#state_tags_java) Map<String,String>

A map of tags to populate on the created table. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tagsAll](#state_tagsall_java) Map<String,String>

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[ttl](#state_ttl_java) [TableTtl](#tablettl)

Configuration block for TTL. See below.

[warmThroughput](#state_warmthroughput_java) [TableWarmThroughput](#tablewarmthroughput)

Sets the number of warm read and write units for the specified table. See below.

[writeCapacity](#state_writecapacity_java) Integer

Number of write units for this table. If the `billingMode` is `PROVISIONED`, this field is required.

[arn](#state_arn_nodejs) string

ARN of the table

[attributes](#state_attributes_nodejs) [TableAttribute\[\]](#tableattribute)

Set of nested attribute definitions. Only required for `hashKey` and `rangeKey` attributes. See below.

[billingMode](#state_billingmode_nodejs) string

Controls how you are charged for read and write throughput and how you manage capacity. The valid values are `PROVISIONED` and `PAY_PER_REQUEST`. Defaults to `PROVISIONED`.

[deletionProtectionEnabled](#state_deletionprotectionenabled_nodejs) boolean

Enables deletion protection for table. Defaults to `false`.

[globalSecondaryIndexes](#state_globalsecondaryindexes_nodejs) [TableGlobalSecondaryIndex\[\]](#tableglobalsecondaryindex)

Describe a GSI for the table; subject to the normal limits on the number of GSIs, projected attributes, etc. See below.

[globalTableWitness](#state_globaltablewitness_nodejs) [TableGlobalTableWitness](#tableglobaltablewitness)

Witness Region in a Multi-Region Strong Consistency deployment. **Note** This must be used alongside a single `replica` with `consistencyMode` set to `STRONG`. Other combinations will fail to provision. See below.

[hashKey](#state_hashkey_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Attribute to use as the hash (partition) key. Must also be defined as an `attribute`. See below.

[importTable](#state_importtable_nodejs) [TableImportTable](#tableimporttable)

Import Amazon S3 data into a new table. See below.

[localSecondaryIndexes](#state_localsecondaryindexes_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [TableLocalSecondaryIndex\[\]](#tablelocalsecondaryindex)

Describe an LSI on the table; these can only be allocated *at creation* so you cannot change this definition after you have created the resource. See below.

[name](#state_name_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Unique within a region name of the table.

The following arguments are optional:

[onDemandThroughput](#state_ondemandthroughput_nodejs) [TableOnDemandThroughput](#tableondemandthroughput)

Sets the maximum number of read and write units for the specified on-demand table. See below.

[pointInTimeRecovery](#state_pointintimerecovery_nodejs) [TablePointInTimeRecovery](#tablepointintimerecovery)

Enable point-in-time recovery options. See below.

[rangeKey](#state_rangekey_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Attribute to use as the range (sort) key. Must also be defined as an `attribute`, see below.

[readCapacity](#state_readcapacity_nodejs) number

Number of read units for this table. If the `billingMode` is `PROVISIONED`, this field is required.

[region](#state_region_nodejs) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[replicas](#state_replicas_nodejs) [TableReplica\[\]](#tablereplica)

Configuration block(s) with [DynamoDB Global Tables V2 (version 2019.11.21)](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/globaltables.V2.html) replication configurations. See below.

[restoreBackupArn](#state_restorebackuparn_nodejs) string

ARN of backup to restore.

[restoreDateTime](#state_restoredatetime_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Time of the point-in-time recovery point to restore.

[restoreSourceName](#state_restoresourcename_nodejs) string

Name of the table to restore. Must match the name of an existing table.

[restoreSourceTableArn](#state_restoresourcetablearn_nodejs) string

ARN of the source table to restore. Must be supplied for cross-region restores.

[restoreToLatestTime](#state_restoretolatesttime_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. boolean

If set, restores table to the most recent point-in-time recovery point.

[serverSideEncryption](#state_serversideencryption_nodejs) [TableServerSideEncryption](#tableserversideencryption)

Encryption at rest options. AWS DynamoDB tables are automatically encrypted at rest with an AWS-owned Customer Master Key if this argument isn't specified. Must be supplied for cross-region restores. See below.

[streamArn](#state_streamarn_nodejs) string

ARN of the Table Stream. Only available when `streamEnabled = true`

[streamEnabled](#state_streamenabled_nodejs) boolean

Whether Streams are enabled.

[streamLabel](#state_streamlabel_nodejs) string

Timestamp, in ISO 8601 format, for this stream. Note that this timestamp is not a unique identifier for the stream on its own. However, the combination of AWS customer ID, table name and this field is guaranteed to be unique. It can be used for creating CloudWatch Alarms. Only available when `streamEnabled = true`.

[streamViewType](#state_streamviewtype_nodejs) string

When an item in the table is modified, StreamViewType determines what information is written to the table's stream. Valid values are `KEYS_ONLY`, `NEW_IMAGE`, `OLD_IMAGE`, `NEW_AND_OLD_IMAGES`. Only valid when `streamEnabled` is true.

[tableClass](#state_tableclass_nodejs) string

Storage class of the table. Valid values are `STANDARD` and `STANDARD_INFREQUENT_ACCESS`. Default value is `STANDARD`.

[tags](#state_tags_nodejs) {\[key: string\]: string}

A map of tags to populate on the created table. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tagsAll](#state_tagsall_nodejs) {\[key: string\]: string}

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[ttl](#state_ttl_nodejs) [TableTtl](#tablettl)

Configuration block for TTL. See below.

[warmThroughput](#state_warmthroughput_nodejs) [TableWarmThroughput](#tablewarmthroughput)

Sets the number of warm read and write units for the specified table. See below.

[writeCapacity](#state_writecapacity_nodejs) number

Number of write units for this table. If the `billingMode` is `PROVISIONED`, this field is required.

[arn](#state_arn_python) str

ARN of the table

[attributes](#state_attributes_python) [Sequence\[TableAttributeArgs\]](#tableattribute)

Set of nested attribute definitions. Only required for `hashKey` and `rangeKey` attributes. See below.

[billing\_mode](#state_billing_mode_python) str

Controls how you are charged for read and write throughput and how you manage capacity. The valid values are `PROVISIONED` and `PAY_PER_REQUEST`. Defaults to `PROVISIONED`.

[deletion\_protection\_enabled](#state_deletion_protection_enabled_python) bool

Enables deletion protection for table. Defaults to `false`.

[global\_secondary\_indexes](#state_global_secondary_indexes_python) [Sequence\[TableGlobalSecondaryIndexArgs\]](#tableglobalsecondaryindex)

Describe a GSI for the table; subject to the normal limits on the number of GSIs, projected attributes, etc. See below.

[global\_table\_witness](#state_global_table_witness_python) [TableGlobalTableWitnessArgs](#tableglobaltablewitness)

Witness Region in a Multi-Region Strong Consistency deployment. **Note** This must be used alongside a single `replica` with `consistencyMode` set to `STRONG`. Other combinations will fail to provision. See below.

[hash\_key](#state_hash_key_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Attribute to use as the hash (partition) key. Must also be defined as an `attribute`. See below.

[import\_table](#state_import_table_python) [TableImportTableArgs](#tableimporttable)

Import Amazon S3 data into a new table. See below.

[local\_secondary\_indexes](#state_local_secondary_indexes_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [Sequence\[TableLocalSecondaryIndexArgs\]](#tablelocalsecondaryindex)

Describe an LSI on the table; these can only be allocated *at creation* so you cannot change this definition after you have created the resource. See below.

[name](#state_name_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Unique within a region name of the table.

The following arguments are optional:

[on\_demand\_throughput](#state_on_demand_throughput_python) [TableOnDemandThroughputArgs](#tableondemandthroughput)

Sets the maximum number of read and write units for the specified on-demand table. See below.

[point\_in\_time\_recovery](#state_point_in_time_recovery_python) [TablePointInTimeRecoveryArgs](#tablepointintimerecovery)

Enable point-in-time recovery options. See below.

[range\_key](#state_range_key_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Attribute to use as the range (sort) key. Must also be defined as an `attribute`, see below.

[read\_capacity](#state_read_capacity_python) int

Number of read units for this table. If the `billingMode` is `PROVISIONED`, this field is required.

[region](#state_region_python) str

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[replicas](#state_replicas_python) [Sequence\[TableReplicaArgs\]](#tablereplica)

Configuration block(s) with [DynamoDB Global Tables V2 (version 2019.11.21)](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/globaltables.V2.html) replication configurations. See below.

[restore\_backup\_arn](#state_restore_backup_arn_python) str

ARN of backup to restore.

[restore\_date\_time](#state_restore_date_time_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Time of the point-in-time recovery point to restore.

[restore\_source\_name](#state_restore_source_name_python) str

Name of the table to restore. Must match the name of an existing table.

[restore\_source\_table\_arn](#state_restore_source_table_arn_python) str

ARN of the source table to restore. Must be supplied for cross-region restores.

[restore\_to\_latest\_time](#state_restore_to_latest_time_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. bool

If set, restores table to the most recent point-in-time recovery point.

[server\_side\_encryption](#state_server_side_encryption_python) [TableServerSideEncryptionArgs](#tableserversideencryption)

Encryption at rest options. AWS DynamoDB tables are automatically encrypted at rest with an AWS-owned Customer Master Key if this argument isn't specified. Must be supplied for cross-region restores. See below.

[stream\_arn](#state_stream_arn_python) str

ARN of the Table Stream. Only available when `streamEnabled = true`

[stream\_enabled](#state_stream_enabled_python) bool

Whether Streams are enabled.

[stream\_label](#state_stream_label_python) str

Timestamp, in ISO 8601 format, for this stream. Note that this timestamp is not a unique identifier for the stream on its own. However, the combination of AWS customer ID, table name and this field is guaranteed to be unique. It can be used for creating CloudWatch Alarms. Only available when `streamEnabled = true`.

[stream\_view\_type](#state_stream_view_type_python) str

When an item in the table is modified, StreamViewType determines what information is written to the table's stream. Valid values are `KEYS_ONLY`, `NEW_IMAGE`, `OLD_IMAGE`, `NEW_AND_OLD_IMAGES`. Only valid when `streamEnabled` is true.

[table\_class](#state_table_class_python) str

Storage class of the table. Valid values are `STANDARD` and `STANDARD_INFREQUENT_ACCESS`. Default value is `STANDARD`.

[tags](#state_tags_python) Mapping\[str, str\]

A map of tags to populate on the created table. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tags\_all](#state_tags_all_python) Mapping\[str, str\]

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[ttl](#state_ttl_python) [TableTtlArgs](#tablettl)

Configuration block for TTL. See below.

[warm\_throughput](#state_warm_throughput_python) [TableWarmThroughputArgs](#tablewarmthroughput)

Sets the number of warm read and write units for the specified table. See below.

[write\_capacity](#state_write_capacity_python) int

Number of write units for this table. If the `billingMode` is `PROVISIONED`, this field is required.

[arn](#state_arn_yaml) String

ARN of the table

[attributes](#state_attributes_yaml) [List<Property Map>](#tableattribute)

Set of nested attribute definitions. Only required for `hashKey` and `rangeKey` attributes. See below.

[billingMode](#state_billingmode_yaml) String

Controls how you are charged for read and write throughput and how you manage capacity. The valid values are `PROVISIONED` and `PAY_PER_REQUEST`. Defaults to `PROVISIONED`.

[deletionProtectionEnabled](#state_deletionprotectionenabled_yaml) Boolean

Enables deletion protection for table. Defaults to `false`.

[globalSecondaryIndexes](#state_globalsecondaryindexes_yaml) [List<Property Map>](#tableglobalsecondaryindex)

Describe a GSI for the table; subject to the normal limits on the number of GSIs, projected attributes, etc. See below.

[globalTableWitness](#state_globaltablewitness_yaml) [Property Map](#tableglobaltablewitness)

Witness Region in a Multi-Region Strong Consistency deployment. **Note** This must be used alongside a single `replica` with `consistencyMode` set to `STRONG`. Other combinations will fail to provision. See below.

[hashKey](#state_hashkey_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Attribute to use as the hash (partition) key. Must also be defined as an `attribute`. See below.

[importTable](#state_importtable_yaml) [Property Map](#tableimporttable)

Import Amazon S3 data into a new table. See below.

[localSecondaryIndexes](#state_localsecondaryindexes_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. [List<Property Map>](#tablelocalsecondaryindex)

Describe an LSI on the table; these can only be allocated *at creation* so you cannot change this definition after you have created the resource. See below.

[name](#state_name_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Unique within a region name of the table.

The following arguments are optional:

[onDemandThroughput](#state_ondemandthroughput_yaml) [Property Map](#tableondemandthroughput)

Sets the maximum number of read and write units for the specified on-demand table. See below.

[pointInTimeRecovery](#state_pointintimerecovery_yaml) [Property Map](#tablepointintimerecovery)

Enable point-in-time recovery options. See below.

[rangeKey](#state_rangekey_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Attribute to use as the range (sort) key. Must also be defined as an `attribute`, see below.

[readCapacity](#state_readcapacity_yaml) Number

Number of read units for this table. If the `billingMode` is `PROVISIONED`, this field is required.

[region](#state_region_yaml) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[replicas](#state_replicas_yaml) [List<Property Map>](#tablereplica)

Configuration block(s) with [DynamoDB Global Tables V2 (version 2019.11.21)](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/globaltables.V2.html) replication configurations. See below.

[restoreBackupArn](#state_restorebackuparn_yaml) String

ARN of backup to restore.

[restoreDateTime](#state_restoredatetime_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Time of the point-in-time recovery point to restore.

[restoreSourceName](#state_restoresourcename_yaml) String

Name of the table to restore. Must match the name of an existing table.

[restoreSourceTableArn](#state_restoresourcetablearn_yaml) String

ARN of the source table to restore. Must be supplied for cross-region restores.

[restoreToLatestTime](#state_restoretolatesttime_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. Boolean

If set, restores table to the most recent point-in-time recovery point.

[serverSideEncryption](#state_serversideencryption_yaml) [Property Map](#tableserversideencryption)

Encryption at rest options. AWS DynamoDB tables are automatically encrypted at rest with an AWS-owned Customer Master Key if this argument isn't specified. Must be supplied for cross-region restores. See below.

[streamArn](#state_streamarn_yaml) String

ARN of the Table Stream. Only available when `streamEnabled = true`

[streamEnabled](#state_streamenabled_yaml) Boolean

Whether Streams are enabled.

[streamLabel](#state_streamlabel_yaml) String

Timestamp, in ISO 8601 format, for this stream. Note that this timestamp is not a unique identifier for the stream on its own. However, the combination of AWS customer ID, table name and this field is guaranteed to be unique. It can be used for creating CloudWatch Alarms. Only available when `streamEnabled = true`.

[streamViewType](#state_streamviewtype_yaml) String

When an item in the table is modified, StreamViewType determines what information is written to the table's stream. Valid values are `KEYS_ONLY`, `NEW_IMAGE`, `OLD_IMAGE`, `NEW_AND_OLD_IMAGES`. Only valid when `streamEnabled` is true.

[tableClass](#state_tableclass_yaml) String

Storage class of the table. Valid values are `STANDARD` and `STANDARD_INFREQUENT_ACCESS`. Default value is `STANDARD`.

[tags](#state_tags_yaml) Map<String>

A map of tags to populate on the created table. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

[tagsAll](#state_tagsall_yaml) Map<String>

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[ttl](#state_ttl_yaml) [Property Map](#tablettl)

Configuration block for TTL. See below.

[warmThroughput](#state_warmthroughput_yaml) [Property Map](#tablewarmthroughput)

Sets the number of warm read and write units for the specified table. See below.

[writeCapacity](#state_writecapacity_yaml) Number

Number of write units for this table. If the `billingMode` is `PROVISIONED`, this field is required.

## Supporting Types[](#supporting-types)

#### TableAttribute

, TableAttributeArgs

[](#tableattribute)

[Name](#name_csharp) This property is required. string

Name of the attribute

[Type](#type_csharp) This property is required. string

Attribute type. Valid values are `S` (string), `N` (number), `B` (binary).

[Name](#name_go) This property is required. string

Name of the attribute

[Type](#type_go) This property is required. string

Attribute type. Valid values are `S` (string), `N` (number), `B` (binary).

[name](#name_hcl) This property is required. string

Name of the attribute

[type](#type_hcl) This property is required. string

Attribute type. Valid values are `S` (string), `N` (number), `B` (binary).

[name](#name_java) This property is required. String

Name of the attribute

[type](#type_java) This property is required. String

Attribute type. Valid values are `S` (string), `N` (number), `B` (binary).

[name](#name_nodejs) This property is required. string

Name of the attribute

[type](#type_nodejs) This property is required. string

Attribute type. Valid values are `S` (string), `N` (number), `B` (binary).

[name](#name_python) This property is required. str

Name of the attribute

[type](#type_python) This property is required. str

Attribute type. Valid values are `S` (string), `N` (number), `B` (binary).

[name](#name_yaml) This property is required. String

Name of the attribute

[type](#type_yaml) This property is required. String

Attribute type. Valid values are `S` (string), `N` (number), `B` (binary).

#### TableGlobalSecondaryIndex

, TableGlobalSecondaryIndexArgs

[](#tableglobalsecondaryindex)

[Name](#name_csharp) This property is required. string

Name of the index.

[ProjectionType](#projectiontype_csharp) This property is required. string

One of `ALL`, `INCLUDE` or `KEYS_ONLY` where `ALL` projects every attribute into the index, `KEYS_ONLY` projects into the index only the table and index hashKey and sortKey attributes, `INCLUDE` projects into the index all of the attributes that are defined in `nonKeyAttributes` in addition to the attributes that `KEYS_ONLY` project.

[HashKey](#hashkey_csharp) string

Name of the hash key in the index; must be defined as an attribute in the resource. Mutually exclusive with `keySchema`. Use `keySchema` instead.

Deprecated: hash\_key is deprecated. Use keySchema instead.

[KeySchemas](#keyschemas_csharp) [List<TableGlobalSecondaryIndexKeySchema>](#tableglobalsecondaryindexkeyschema)

Configuration block(s) for the key schema. Mutually exclusive with `hashKey` and `rangeKey`. Required if `hashKey` is not specified. Supports multi-attribute keys for the [Multi-Attribute Keys design pattern](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GSI.DesignPattern.MultiAttributeKeys.html). See below.

[NonKeyAttributes](#nonkeyattributes_csharp) List<string>

Only required with `INCLUDE` as a projection type; a list of attributes to project into the index. These do not need to be defined as attributes on the table.

[OnDemandThroughput](#ondemandthroughput_csharp) [TableGlobalSecondaryIndexOnDemandThroughput](#tableglobalsecondaryindexondemandthroughput)

Sets the maximum number of read and write units for the specified on-demand index. See below.

[RangeKey](#rangekey_csharp) string

Name of the range key; must be defined as an attribute in the resource. Mutually exclusive with `keySchema`. Use `keySchema` instead.

Deprecated: range\_key is deprecated. Use keySchema instead.

[ReadCapacity](#readcapacity_csharp) int

Number of read units for this index. Must be set if billingMode is set to PROVISIONED.

[WarmThroughput](#warmthroughput_csharp) [TableGlobalSecondaryIndexWarmThroughput](#tableglobalsecondaryindexwarmthroughput)

Sets the number of warm read and write units for this index. See below.

[WriteCapacity](#writecapacity_csharp) int

Number of write units for this index. Must be set if billingMode is set to PROVISIONED.

[Name](#name_go) This property is required. string

Name of the index.

[ProjectionType](#projectiontype_go) This property is required. string

One of `ALL`, `INCLUDE` or `KEYS_ONLY` where `ALL` projects every attribute into the index, `KEYS_ONLY` projects into the index only the table and index hashKey and sortKey attributes, `INCLUDE` projects into the index all of the attributes that are defined in `nonKeyAttributes` in addition to the attributes that `KEYS_ONLY` project.

[HashKey](#hashkey_go) string

Name of the hash key in the index; must be defined as an attribute in the resource. Mutually exclusive with `keySchema`. Use `keySchema` instead.

Deprecated: hash\_key is deprecated. Use keySchema instead.

[KeySchemas](#keyschemas_go) [\[\]TableGlobalSecondaryIndexKeySchema](#tableglobalsecondaryindexkeyschema)

Configuration block(s) for the key schema. Mutually exclusive with `hashKey` and `rangeKey`. Required if `hashKey` is not specified. Supports multi-attribute keys for the [Multi-Attribute Keys design pattern](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GSI.DesignPattern.MultiAttributeKeys.html). See below.

[NonKeyAttributes](#nonkeyattributes_go) \[\]string

Only required with `INCLUDE` as a projection type; a list of attributes to project into the index. These do not need to be defined as attributes on the table.

[OnDemandThroughput](#ondemandthroughput_go) [TableGlobalSecondaryIndexOnDemandThroughput](#tableglobalsecondaryindexondemandthroughput)

Sets the maximum number of read and write units for the specified on-demand index. See below.

[RangeKey](#rangekey_go) string

Name of the range key; must be defined as an attribute in the resource. Mutually exclusive with `keySchema`. Use `keySchema` instead.

Deprecated: range\_key is deprecated. Use keySchema instead.

[ReadCapacity](#readcapacity_go) int

Number of read units for this index. Must be set if billingMode is set to PROVISIONED.

[WarmThroughput](#warmthroughput_go) [TableGlobalSecondaryIndexWarmThroughput](#tableglobalsecondaryindexwarmthroughput)

Sets the number of warm read and write units for this index. See below.

[WriteCapacity](#writecapacity_go) int

Number of write units for this index. Must be set if billingMode is set to PROVISIONED.

[name](#name_hcl) This property is required. string

Name of the index.

[projection\_type](#projection_type_hcl) This property is required. string

One of `ALL`, `INCLUDE` or `KEYS_ONLY` where `ALL` projects every attribute into the index, `KEYS_ONLY` projects into the index only the table and index hashKey and sortKey attributes, `INCLUDE` projects into the index all of the attributes that are defined in `nonKeyAttributes` in addition to the attributes that `KEYS_ONLY` project.

[hash\_key](#hash_key_hcl) string

Name of the hash key in the index; must be defined as an attribute in the resource. Mutually exclusive with `keySchema`. Use `keySchema` instead.

Deprecated: hash\_key is deprecated. Use keySchema instead.

[key\_schemas](#key_schemas_hcl) [list(object)](#tableglobalsecondaryindexkeyschema)

Configuration block(s) for the key schema. Mutually exclusive with `hashKey` and `rangeKey`. Required if `hashKey` is not specified. Supports multi-attribute keys for the [Multi-Attribute Keys design pattern](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GSI.DesignPattern.MultiAttributeKeys.html). See below.

[non\_key\_attributes](#non_key_attributes_hcl) list(string)

Only required with `INCLUDE` as a projection type; a list of attributes to project into the index. These do not need to be defined as attributes on the table.

[on\_demand\_throughput](#on_demand_throughput_hcl) [object](#tableglobalsecondaryindexondemandthroughput)

Sets the maximum number of read and write units for the specified on-demand index. See below.

[range\_key](#range_key_hcl) string

Name of the range key; must be defined as an attribute in the resource. Mutually exclusive with `keySchema`. Use `keySchema` instead.

Deprecated: range\_key is deprecated. Use keySchema instead.

[read\_capacity](#read_capacity_hcl) number

Number of read units for this index. Must be set if billingMode is set to PROVISIONED.

[warm\_throughput](#warm_throughput_hcl) [object](#tableglobalsecondaryindexwarmthroughput)

Sets the number of warm read and write units for this index. See below.

[write\_capacity](#write_capacity_hcl) number

Number of write units for this index. Must be set if billingMode is set to PROVISIONED.

[name](#name_java) This property is required. String

Name of the index.

[projectionType](#projectiontype_java) This property is required. String

One of `ALL`, `INCLUDE` or `KEYS_ONLY` where `ALL` projects every attribute into the index, `KEYS_ONLY` projects into the index only the table and index hashKey and sortKey attributes, `INCLUDE` projects into the index all of the attributes that are defined in `nonKeyAttributes` in addition to the attributes that `KEYS_ONLY` project.

[hashKey](#hashkey_java) String

Name of the hash key in the index; must be defined as an attribute in the resource. Mutually exclusive with `keySchema`. Use `keySchema` instead.

Deprecated: hash\_key is deprecated. Use keySchema instead.

[keySchemas](#keyschemas_java) [List<TableGlobalSecondaryIndexKeySchema>](#tableglobalsecondaryindexkeyschema)

Configuration block(s) for the key schema. Mutually exclusive with `hashKey` and `rangeKey`. Required if `hashKey` is not specified. Supports multi-attribute keys for the [Multi-Attribute Keys design pattern](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GSI.DesignPattern.MultiAttributeKeys.html). See below.

[nonKeyAttributes](#nonkeyattributes_java) List<String>

Only required with `INCLUDE` as a projection type; a list of attributes to project into the index. These do not need to be defined as attributes on the table.

[onDemandThroughput](#ondemandthroughput_java) [TableGlobalSecondaryIndexOnDemandThroughput](#tableglobalsecondaryindexondemandthroughput)

Sets the maximum number of read and write units for the specified on-demand index. See below.

[rangeKey](#rangekey_java) String

Name of the range key; must be defined as an attribute in the resource. Mutually exclusive with `keySchema`. Use `keySchema` instead.

Deprecated: range\_key is deprecated. Use keySchema instead.

[readCapacity](#readcapacity_java) Integer

Number of read units for this index. Must be set if billingMode is set to PROVISIONED.

[warmThroughput](#warmthroughput_java) [TableGlobalSecondaryIndexWarmThroughput](#tableglobalsecondaryindexwarmthroughput)

Sets the number of warm read and write units for this index. See below.

[writeCapacity](#writecapacity_java) Integer

Number of write units for this index. Must be set if billingMode is set to PROVISIONED.

[name](#name_nodejs) This property is required. string

Name of the index.

[projectionType](#projectiontype_nodejs) This property is required. string

One of `ALL`, `INCLUDE` or `KEYS_ONLY` where `ALL` projects every attribute into the index, `KEYS_ONLY` projects into the index only the table and index hashKey and sortKey attributes, `INCLUDE` projects into the index all of the attributes that are defined in `nonKeyAttributes` in addition to the attributes that `KEYS_ONLY` project.

[hashKey](#hashkey_nodejs) string

Name of the hash key in the index; must be defined as an attribute in the resource. Mutually exclusive with `keySchema`. Use `keySchema` instead.

Deprecated: hash\_key is deprecated. Use keySchema instead.

[keySchemas](#keyschemas_nodejs) [TableGlobalSecondaryIndexKeySchema\[\]](#tableglobalsecondaryindexkeyschema)

Configuration block(s) for the key schema. Mutually exclusive with `hashKey` and `rangeKey`. Required if `hashKey` is not specified. Supports multi-attribute keys for the [Multi-Attribute Keys design pattern](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GSI.DesignPattern.MultiAttributeKeys.html). See below.

[nonKeyAttributes](#nonkeyattributes_nodejs) string\[\]

Only required with `INCLUDE` as a projection type; a list of attributes to project into the index. These do not need to be defined as attributes on the table.

[onDemandThroughput](#ondemandthroughput_nodejs) [TableGlobalSecondaryIndexOnDemandThroughput](#tableglobalsecondaryindexondemandthroughput)

Sets the maximum number of read and write units for the specified on-demand index. See below.

[rangeKey](#rangekey_nodejs) string

Name of the range key; must be defined as an attribute in the resource. Mutually exclusive with `keySchema`. Use `keySchema` instead.

Deprecated: range\_key is deprecated. Use keySchema instead.

[readCapacity](#readcapacity_nodejs) number

Number of read units for this index. Must be set if billingMode is set to PROVISIONED.

[warmThroughput](#warmthroughput_nodejs) [TableGlobalSecondaryIndexWarmThroughput](#tableglobalsecondaryindexwarmthroughput)

Sets the number of warm read and write units for this index. See below.

[writeCapacity](#writecapacity_nodejs) number

Number of write units for this index. Must be set if billingMode is set to PROVISIONED.

[name](#name_python) This property is required. str

Name of the index.

[projection\_type](#projection_type_python) This property is required. str

One of `ALL`, `INCLUDE` or `KEYS_ONLY` where `ALL` projects every attribute into the index, `KEYS_ONLY` projects into the index only the table and index hashKey and sortKey attributes, `INCLUDE` projects into the index all of the attributes that are defined in `nonKeyAttributes` in addition to the attributes that `KEYS_ONLY` project.

[hash\_key](#hash_key_python) str

Name of the hash key in the index; must be defined as an attribute in the resource. Mutually exclusive with `keySchema`. Use `keySchema` instead.

Deprecated: hash\_key is deprecated. Use keySchema instead.

[key\_schemas](#key_schemas_python) [Sequence\[TableGlobalSecondaryIndexKeySchema\]](#tableglobalsecondaryindexkeyschema)

Configuration block(s) for the key schema. Mutually exclusive with `hashKey` and `rangeKey`. Required if `hashKey` is not specified. Supports multi-attribute keys for the [Multi-Attribute Keys design pattern](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GSI.DesignPattern.MultiAttributeKeys.html). See below.

[non\_key\_attributes](#non_key_attributes_python) Sequence\[str\]

Only required with `INCLUDE` as a projection type; a list of attributes to project into the index. These do not need to be defined as attributes on the table.

[on\_demand\_throughput](#on_demand_throughput_python) [TableGlobalSecondaryIndexOnDemandThroughput](#tableglobalsecondaryindexondemandthroughput)

Sets the maximum number of read and write units for the specified on-demand index. See below.

[range\_key](#range_key_python) str

Name of the range key; must be defined as an attribute in the resource. Mutually exclusive with `keySchema`. Use `keySchema` instead.

Deprecated: range\_key is deprecated. Use keySchema instead.

[read\_capacity](#read_capacity_python) int

Number of read units for this index. Must be set if billingMode is set to PROVISIONED.

[warm\_throughput](#warm_throughput_python) [TableGlobalSecondaryIndexWarmThroughput](#tableglobalsecondaryindexwarmthroughput)

Sets the number of warm read and write units for this index. See below.

[write\_capacity](#write_capacity_python) int

Number of write units for this index. Must be set if billingMode is set to PROVISIONED.

[name](#name_yaml) This property is required. String

Name of the index.

[projectionType](#projectiontype_yaml) This property is required. String

One of `ALL`, `INCLUDE` or `KEYS_ONLY` where `ALL` projects every attribute into the index, `KEYS_ONLY` projects into the index only the table and index hashKey and sortKey attributes, `INCLUDE` projects into the index all of the attributes that are defined in `nonKeyAttributes` in addition to the attributes that `KEYS_ONLY` project.

[hashKey](#hashkey_yaml) String

Name of the hash key in the index; must be defined as an attribute in the resource. Mutually exclusive with `keySchema`. Use `keySchema` instead.

Deprecated: hash\_key is deprecated. Use keySchema instead.

[keySchemas](#keyschemas_yaml) [List<Property Map>](#tableglobalsecondaryindexkeyschema)

Configuration block(s) for the key schema. Mutually exclusive with `hashKey` and `rangeKey`. Required if `hashKey` is not specified. Supports multi-attribute keys for the [Multi-Attribute Keys design pattern](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GSI.DesignPattern.MultiAttributeKeys.html). See below.

[nonKeyAttributes](#nonkeyattributes_yaml) List<String>

Only required with `INCLUDE` as a projection type; a list of attributes to project into the index. These do not need to be defined as attributes on the table.

[onDemandThroughput](#ondemandthroughput_yaml) [Property Map](#tableglobalsecondaryindexondemandthroughput)

Sets the maximum number of read and write units for the specified on-demand index. See below.

[rangeKey](#rangekey_yaml) String

Name of the range key; must be defined as an attribute in the resource. Mutually exclusive with `keySchema`. Use `keySchema` instead.

Deprecated: range\_key is deprecated. Use keySchema instead.

[readCapacity](#readcapacity_yaml) Number

Number of read units for this index. Must be set if billingMode is set to PROVISIONED.

[warmThroughput](#warmthroughput_yaml) [Property Map](#tableglobalsecondaryindexwarmthroughput)

Sets the number of warm read and write units for this index. See below.

[writeCapacity](#writecapacity_yaml) Number

Number of write units for this index. Must be set if billingMode is set to PROVISIONED.

#### TableGlobalSecondaryIndexKeySchema

, TableGlobalSecondaryIndexKeySchemaArgs

[](#tableglobalsecondaryindexkeyschema)

[AttributeName](#attributename_csharp) This property is required. string

Name of the attribute; must be defined as an attribute in the resource.

[KeyType](#keytype_csharp) This property is required. string

The type of key. Valid values are `HASH` (partition key) or `RANGE` (sort key). You can specify up to 4 attributes with `keyType = "HASH"` and up to 4 attributes with `keyType = "RANGE"`.

[AttributeName](#attributename_go) This property is required. string

Name of the attribute; must be defined as an attribute in the resource.

[KeyType](#keytype_go) This property is required. string

The type of key. Valid values are `HASH` (partition key) or `RANGE` (sort key). You can specify up to 4 attributes with `keyType = "HASH"` and up to 4 attributes with `keyType = "RANGE"`.

[attribute\_name](#attribute_name_hcl) This property is required. string

Name of the attribute; must be defined as an attribute in the resource.

[key\_type](#key_type_hcl) This property is required. string

The type of key. Valid values are `HASH` (partition key) or `RANGE` (sort key). You can specify up to 4 attributes with `keyType = "HASH"` and up to 4 attributes with `keyType = "RANGE"`.

[attributeName](#attributename_java) This property is required. String

Name of the attribute; must be defined as an attribute in the resource.

[keyType](#keytype_java) This property is required. String

The type of key. Valid values are `HASH` (partition key) or `RANGE` (sort key). You can specify up to 4 attributes with `keyType = "HASH"` and up to 4 attributes with `keyType = "RANGE"`.

[attributeName](#attributename_nodejs) This property is required. string

Name of the attribute; must be defined as an attribute in the resource.

[keyType](#keytype_nodejs) This property is required. string

The type of key. Valid values are `HASH` (partition key) or `RANGE` (sort key). You can specify up to 4 attributes with `keyType = "HASH"` and up to 4 attributes with `keyType = "RANGE"`.

[attribute\_name](#attribute_name_python) This property is required. str

Name of the attribute; must be defined as an attribute in the resource.

[key\_type](#key_type_python) This property is required. str

The type of key. Valid values are `HASH` (partition key) or `RANGE` (sort key). You can specify up to 4 attributes with `keyType = "HASH"` and up to 4 attributes with `keyType = "RANGE"`.

[attributeName](#attributename_yaml) This property is required. String

Name of the attribute; must be defined as an attribute in the resource.

[keyType](#keytype_yaml) This property is required. String

The type of key. Valid values are `HASH` (partition key) or `RANGE` (sort key). You can specify up to 4 attributes with `keyType = "HASH"` and up to 4 attributes with `keyType = "RANGE"`.

#### TableGlobalSecondaryIndexOnDemandThroughput

, TableGlobalSecondaryIndexOnDemandThroughputArgs

[](#tableglobalsecondaryindexondemandthroughput)

[MaxReadRequestUnits](#maxreadrequestunits_csharp) int

Maximum number of read request units for the specified table. To specify set the value greater than or equal to 1. To remove set the value to -1.

[MaxWriteRequestUnits](#maxwriterequestunits_csharp) int

Maximum number of write request units for the specified table. To specify set the value greater than or equal to 1. To remove set the value to -1.

[MaxReadRequestUnits](#maxreadrequestunits_go) int

Maximum number of read request units for the specified table. To specify set the value greater than or equal to 1. To remove set the value to -1.

[MaxWriteRequestUnits](#maxwriterequestunits_go) int

Maximum number of write request units for the specified table. To specify set the value greater than or equal to 1. To remove set the value to -1.

[max\_read\_request\_units](#max_read_request_units_hcl) number

Maximum number of read request units for the specified table. To specify set the value greater than or equal to 1. To remove set the value to -1.

[max\_write\_request\_units](#max_write_request_units_hcl) number

Maximum number of write request units for the specified table. To specify set the value greater than or equal to 1. To remove set the value to -1.

[maxReadRequestUnits](#maxreadrequestunits_java) Integer

Maximum number of read request units for the specified table. To specify set the value greater than or equal to 1. To remove set the value to -1.

[maxWriteRequestUnits](#maxwriterequestunits_java) Integer

Maximum number of write request units for the specified table. To specify set the value greater than or equal to 1. To remove set the value to -1.

[maxReadRequestUnits](#maxreadrequestunits_nodejs) number

Maximum number of read request units for the specified table. To specify set the value greater than or equal to 1. To remove set the value to -1.

[maxWriteRequestUnits](#maxwriterequestunits_nodejs) number

Maximum number of write request units for the specified table. To specify set the value greater than or equal to 1. To remove set the value to -1.

[max\_read\_request\_units](#max_read_request_units_python) int

Maximum number of read request units for the specified table. To specify set the value greater than or equal to 1. To remove set the value to -1.

[max\_write\_request\_units](#max_write_request_units_python) int

Maximum number of write request units for the specified table. To specify set the value greater than or equal to 1. To remove set the value to -1.

[maxReadRequestUnits](#maxreadrequestunits_yaml) Number

Maximum number of read request units for the specified table. To specify set the value greater than or equal to 1. To remove set the value to -1.

[maxWriteRequestUnits](#maxwriterequestunits_yaml) Number

Maximum number of write request units for the specified table. To specify set the value greater than or equal to 1. To remove set the value to -1.

#### TableGlobalSecondaryIndexWarmThroughput

, TableGlobalSecondaryIndexWarmThroughputArgs

[](#tableglobalsecondaryindexwarmthroughput)

[ReadUnitsPerSecond](#readunitspersecond_csharp) int

Number of read operations a table or index can instantaneously support. For the base table, decreasing this value will force a new resource. For a global secondary index, this value can be increased or decreased without recreation. Minimum value of `12000` (default).

[WriteUnitsPerSecond](#writeunitspersecond_csharp) int

Number of write operations a table or index can instantaneously support. For the base table, decreasing this value will force a new resource. For a global secondary index, this value can be increased or decreased without recreation. Minimum value of `4000` (default).

[ReadUnitsPerSecond](#readunitspersecond_go) int

Number of read operations a table or index can instantaneously support. For the base table, decreasing this value will force a new resource. For a global secondary index, this value can be increased or decreased without recreation. Minimum value of `12000` (default).

[WriteUnitsPerSecond](#writeunitspersecond_go) int

Number of write operations a table or index can instantaneously support. For the base table, decreasing this value will force a new resource. For a global secondary index, this value can be increased or decreased without recreation. Minimum value of `4000` (default).

[read\_units\_per\_second](#read_units_per_second_hcl) number

Number of read operations a table or index can instantaneously support. For the base table, decreasing this value will force a new resource. For a global secondary index, this value can be increased or decreased without recreation. Minimum value of `12000` (default).

[write\_units\_per\_second](#write_units_per_second_hcl) number

Number of write operations a table or index can instantaneously support. For the base table, decreasing this value will force a new resource. For a global secondary index, this value can be increased or decreased without recreation. Minimum value of `4000` (default).

[readUnitsPerSecond](#readunitspersecond_java) Integer

Number of read operations a table or index can instantaneously support. For the base table, decreasing this value will force a new resource. For a global secondary index, this value can be increased or decreased without recreation. Minimum value of `12000` (default).

[writeUnitsPerSecond](#writeunitspersecond_java) Integer

Number of write operations a table or index can instantaneously support. For the base table, decreasing this value will force a new resource. For a global secondary index, this value can be increased or decreased without recreation. Minimum value of `4000` (default).

[readUnitsPerSecond](#readunitspersecond_nodejs) number

Number of read operations a table or index can instantaneously support. For the base table, decreasing this value will force a new resource. For a global secondary index, this value can be increased or decreased without recreation. Minimum value of `12000` (default).

[writeUnitsPerSecond](#writeunitspersecond_nodejs) number

Number of write operations a table or index can instantaneously support. For the base table, decreasing this value will force a new resource. For a global secondary index, this value can be increased or decreased without recreation. Minimum value of `4000` (default).

[read\_units\_per\_second](#read_units_per_second_python) int

Number of read operations a table or index can instantaneously support. For the base table, decreasing this value will force a new resource. For a global secondary index, this value can be increased or decreased without recreation. Minimum value of `12000` (default).

[write\_units\_per\_second](#write_units_per_second_python) int

Number of write operations a table or index can instantaneously support. For the base table, decreasing this value will force a new resource. For a global secondary index, this value can be increased or decreased without recreation. Minimum value of `4000` (default).

[readUnitsPerSecond](#readunitspersecond_yaml) Number

Number of read operations a table or index can instantaneously support. For the base table, decreasing this value will force a new resource. For a global secondary index, this value can be increased or decreased without recreation. Minimum value of `12000` (default).

[writeUnitsPerSecond](#writeunitspersecond_yaml) Number

Number of write operations a table or index can instantaneously support. For the base table, decreasing this value will force a new resource. For a global secondary index, this value can be increased or decreased without recreation. Minimum value of `4000` (default).

#### TableGlobalTableWitness

, TableGlobalTableWitnessArgs

[](#tableglobaltablewitness)

[RegionName](#regionname_csharp) string

Name of the AWS Region that serves as a witness for the MRSC global table.

[RegionName](#regionname_go) string

Name of the AWS Region that serves as a witness for the MRSC global table.

[region\_name](#region_name_hcl) string

Name of the AWS Region that serves as a witness for the MRSC global table.

[regionName](#regionname_java) String

Name of the AWS Region that serves as a witness for the MRSC global table.

[regionName](#regionname_nodejs) string

Name of the AWS Region that serves as a witness for the MRSC global table.

[region\_name](#region_name_python) str

Name of the AWS Region that serves as a witness for the MRSC global table.

[regionName](#regionname_yaml) String

Name of the AWS Region that serves as a witness for the MRSC global table.

#### TableImportTable

, TableImportTableArgs

[](#tableimporttable)

[InputFormat](#inputformat_csharp) This property is required. string

The format of the source data. Valid values are `CSV`, `DYNAMODB_JSON`, and `ION`.

[S3BucketSource](#s3bucketsource_csharp)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

[TableImportTableS3BucketSource](#tableimporttables3bucketsource)

Values for the S3 bucket the source file is imported from. See below.

[InputCompressionType](#inputcompressiontype_csharp) string

Type of compression to be used on the input coming from the imported table. Valid values are `GZIP`, `ZSTD` and `NONE`.

[InputFormatOptions](#inputformatoptions_csharp) [TableImportTableInputFormatOptions](#tableimporttableinputformatoptions)

Describe the format options for the data that was imported into the target table. There is one value, `csv`. See below.

[InputFormat](#inputformat_go) This property is required. string

The format of the source data. Valid values are `CSV`, `DYNAMODB_JSON`, and `ION`.

[S3BucketSource](#s3bucketsource_go)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

[TableImportTableS3BucketSource](#tableimporttables3bucketsource)

Values for the S3 bucket the source file is imported from. See below.

[InputCompressionType](#inputcompressiontype_go) string

Type of compression to be used on the input coming from the imported table. Valid values are `GZIP`, `ZSTD` and `NONE`.

[InputFormatOptions](#inputformatoptions_go) [TableImportTableInputFormatOptions](#tableimporttableinputformatoptions)

Describe the format options for the data that was imported into the target table. There is one value, `csv`. See below.

[input\_format](#input_format_hcl) This property is required. string

The format of the source data. Valid values are `CSV`, `DYNAMODB_JSON`, and `ION`.

[s3\_bucket\_source](#s3_bucket_source_hcl)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

[object](#tableimporttables3bucketsource)

Values for the S3 bucket the source file is imported from. See below.

[input\_compression\_type](#input_compression_type_hcl) string

Type of compression to be used on the input coming from the imported table. Valid values are `GZIP`, `ZSTD` and `NONE`.

[input\_format\_options](#input_format_options_hcl) [object](#tableimporttableinputformatoptions)

Describe the format options for the data that was imported into the target table. There is one value, `csv`. See below.

[inputFormat](#inputformat_java) This property is required. String

The format of the source data. Valid values are `CSV`, `DYNAMODB_JSON`, and `ION`.

[s3BucketSource](#s3bucketsource_java)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

[TableImportTableS3BucketSource](#tableimporttables3bucketsource)

Values for the S3 bucket the source file is imported from. See below.

[inputCompressionType](#inputcompressiontype_java) String

Type of compression to be used on the input coming from the imported table. Valid values are `GZIP`, `ZSTD` and `NONE`.

[inputFormatOptions](#inputformatoptions_java) [TableImportTableInputFormatOptions](#tableimporttableinputformatoptions)

Describe the format options for the data that was imported into the target table. There is one value, `csv`. See below.

[inputFormat](#inputformat_nodejs) This property is required. string

The format of the source data. Valid values are `CSV`, `DYNAMODB_JSON`, and `ION`.

[s3BucketSource](#s3bucketsource_nodejs)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

[TableImportTableS3BucketSource](#tableimporttables3bucketsource)

Values for the S3 bucket the source file is imported from. See below.

[inputCompressionType](#inputcompressiontype_nodejs) string

Type of compression to be used on the input coming from the imported table. Valid values are `GZIP`, `ZSTD` and `NONE`.

[inputFormatOptions](#inputformatoptions_nodejs) [TableImportTableInputFormatOptions](#tableimporttableinputformatoptions)

Describe the format options for the data that was imported into the target table. There is one value, `csv`. See below.

[input\_format](#input_format_python) This property is required. str

The format of the source data. Valid values are `CSV`, `DYNAMODB_JSON`, and `ION`.

[s3\_bucket\_source](#s3_bucket_source_python)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

[TableImportTableS3BucketSource](#tableimporttables3bucketsource)

Values for the S3 bucket the source file is imported from. See below.

[input\_compression\_type](#input_compression_type_python) str

Type of compression to be used on the input coming from the imported table. Valid values are `GZIP`, `ZSTD` and `NONE`.

[input\_format\_options](#input_format_options_python) [TableImportTableInputFormatOptions](#tableimporttableinputformatoptions)

Describe the format options for the data that was imported into the target table. There is one value, `csv`. See below.

[inputFormat](#inputformat_yaml) This property is required. String

The format of the source data. Valid values are `CSV`, `DYNAMODB_JSON`, and `ION`.

[s3BucketSource](#s3bucketsource_yaml)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

[Property Map](#tableimporttables3bucketsource)

Values for the S3 bucket the source file is imported from. See below.

[inputCompressionType](#inputcompressiontype_yaml) String

Type of compression to be used on the input coming from the imported table. Valid values are `GZIP`, `ZSTD` and `NONE`.

[inputFormatOptions](#inputformatoptions_yaml) [Property Map](#tableimporttableinputformatoptions)

Describe the format options for the data that was imported into the target table. There is one value, `csv`. See below.

#### TableImportTableInputFormatOptions

, TableImportTableInputFormatOptionsArgs

[](#tableimporttableinputformatoptions)

[Csv](#csv_csharp) [TableImportTableInputFormatOptionsCsv](#tableimporttableinputformatoptionscsv)

This block contains the processing options for the CSV file being imported:

[Csv](#csv_go) [TableImportTableInputFormatOptionsCsv](#tableimporttableinputformatoptionscsv)

This block contains the processing options for the CSV file being imported:

[csv](#csv_hcl) [object](#tableimporttableinputformatoptionscsv)

This block contains the processing options for the CSV file being imported:

[csv](#csv_java) [TableImportTableInputFormatOptionsCsv](#tableimporttableinputformatoptionscsv)

This block contains the processing options for the CSV file being imported:

[csv](#csv_nodejs) [TableImportTableInputFormatOptionsCsv](#tableimporttableinputformatoptionscsv)

This block contains the processing options for the CSV file being imported:

[csv](#csv_python) [TableImportTableInputFormatOptionsCsv](#tableimporttableinputformatoptionscsv)

This block contains the processing options for the CSV file being imported:

[csv](#csv_yaml) [Property Map](#tableimporttableinputformatoptionscsv)

This block contains the processing options for the CSV file being imported:

#### TableImportTableInputFormatOptionsCsv

, TableImportTableInputFormatOptionsCsvArgs

[](#tableimporttableinputformatoptionscsv)

[Delimiter](#delimiter_csharp) string

The delimiter used for separating items in the CSV file being imported.

[HeaderLists](#headerlists_csharp) List<string>

List of the headers used to specify a common header for all source CSV files being imported.

[Delimiter](#delimiter_go) string

The delimiter used for separating items in the CSV file being imported.

[HeaderLists](#headerlists_go) \[\]string

List of the headers used to specify a common header for all source CSV files being imported.

[delimiter](#delimiter_hcl) string

The delimiter used for separating items in the CSV file being imported.

[header\_lists](#header_lists_hcl) list(string)

List of the headers used to specify a common header for all source CSV files being imported.

[delimiter](#delimiter_java) String

The delimiter used for separating items in the CSV file being imported.

[headerLists](#headerlists_java) List<String>

List of the headers used to specify a common header for all source CSV files being imported.

[delimiter](#delimiter_nodejs) string

The delimiter used for separating items in the CSV file being imported.

[headerLists](#headerlists_nodejs) string\[\]

List of the headers used to specify a common header for all source CSV files being imported.

[delimiter](#delimiter_python) str

The delimiter used for separating items in the CSV file being imported.

[header\_lists](#header_lists_python) Sequence\[str\]

List of the headers used to specify a common header for all source CSV files being imported.

[delimiter](#delimiter_yaml) String

The delimiter used for separating items in the CSV file being imported.

[headerLists](#headerlists_yaml) List<String>

List of the headers used to specify a common header for all source CSV files being imported.

#### TableImportTableS3BucketSource

, TableImportTableS3BucketSourceArgs

[](#tableimporttables3bucketsource)

[Bucket](#bucket_csharp) This property is required. string

The S3 bucket that is being imported from.

[BucketOwner](#bucketowner_csharp) string

The account number of the S3 bucket that is being imported from.

[KeyPrefix](#keyprefix_csharp) string

The key prefix shared by all S3 Objects that are being imported.

[Bucket](#bucket_go) This property is required. string

The S3 bucket that is being imported from.

[BucketOwner](#bucketowner_go) string

The account number of the S3 bucket that is being imported from.

[KeyPrefix](#keyprefix_go) string

The key prefix shared by all S3 Objects that are being imported.

[bucket](#bucket_hcl) This property is required. string

The S3 bucket that is being imported from.

[bucket\_owner](#bucket_owner_hcl) string

The account number of the S3 bucket that is being imported from.

[key\_prefix](#key_prefix_hcl) string

The key prefix shared by all S3 Objects that are being imported.

[bucket](#bucket_java) This property is required. String

The S3 bucket that is being imported from.

[bucketOwner](#bucketowner_java) String

The account number of the S3 bucket that is being imported from.

[keyPrefix](#keyprefix_java) String

The key prefix shared by all S3 Objects that are being imported.

[bucket](#bucket_nodejs) This property is required. string

The S3 bucket that is being imported from.

[bucketOwner](#bucketowner_nodejs) string

The account number of the S3 bucket that is being imported from.

[keyPrefix](#keyprefix_nodejs) string

The key prefix shared by all S3 Objects that are being imported.

[bucket](#bucket_python) This property is required. str

The S3 bucket that is being imported from.

[bucket\_owner](#bucket_owner_python) str

The account number of the S3 bucket that is being imported from.

[key\_prefix](#key_prefix_python) str

The key prefix shared by all S3 Objects that are being imported.

[bucket](#bucket_yaml) This property is required. String

The S3 bucket that is being imported from.

[bucketOwner](#bucketowner_yaml) String

The account number of the S3 bucket that is being imported from.

[keyPrefix](#keyprefix_yaml) String

The key prefix shared by all S3 Objects that are being imported.

#### TableLocalSecondaryIndex

, TableLocalSecondaryIndexArgs

[](#tablelocalsecondaryindex)

[Name](#name_csharp)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

Name of the index

[ProjectionType](#projectiontype_csharp)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

One of `ALL`, `INCLUDE` or `KEYS_ONLY` where `ALL` projects every attribute into the index, `KEYS_ONLY` projects into the index only the table and index hashKey and sortKey attributes , `INCLUDE` projects into the index all of the attributes that are defined in `nonKeyAttributes` in addition to the attributes that that`KEYS_ONLY` project.

[RangeKey](#rangekey_csharp)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

Name of the range key.

[NonKeyAttributes](#nonkeyattributes_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. List<string>

Only required with `INCLUDE` as a projection type; a list of attributes to project into the index. These do not need to be defined as attributes on the table.

[Name](#name_go)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

Name of the index

[ProjectionType](#projectiontype_go)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

One of `ALL`, `INCLUDE` or `KEYS_ONLY` where `ALL` projects every attribute into the index, `KEYS_ONLY` projects into the index only the table and index hashKey and sortKey attributes , `INCLUDE` projects into the index all of the attributes that are defined in `nonKeyAttributes` in addition to the attributes that that`KEYS_ONLY` project.

[RangeKey](#rangekey_go)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

Name of the range key.

[NonKeyAttributes](#nonkeyattributes_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. \[\]string

Only required with `INCLUDE` as a projection type; a list of attributes to project into the index. These do not need to be defined as attributes on the table.

[name](#name_hcl)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

Name of the index

[projection\_type](#projection_type_hcl)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

One of `ALL`, `INCLUDE` or `KEYS_ONLY` where `ALL` projects every attribute into the index, `KEYS_ONLY` projects into the index only the table and index hashKey and sortKey attributes , `INCLUDE` projects into the index all of the attributes that are defined in `nonKeyAttributes` in addition to the attributes that that`KEYS_ONLY` project.

[range\_key](#range_key_hcl)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

Name of the range key.

[non\_key\_attributes](#non_key_attributes_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. list(string)

Only required with `INCLUDE` as a projection type; a list of attributes to project into the index. These do not need to be defined as attributes on the table.

[name](#name_java)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

String

Name of the index

[projectionType](#projectiontype_java)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

String

One of `ALL`, `INCLUDE` or `KEYS_ONLY` where `ALL` projects every attribute into the index, `KEYS_ONLY` projects into the index only the table and index hashKey and sortKey attributes , `INCLUDE` projects into the index all of the attributes that are defined in `nonKeyAttributes` in addition to the attributes that that`KEYS_ONLY` project.

[rangeKey](#rangekey_java)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

String

Name of the range key.

[nonKeyAttributes](#nonkeyattributes_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. List<String>

Only required with `INCLUDE` as a projection type; a list of attributes to project into the index. These do not need to be defined as attributes on the table.

[name](#name_nodejs)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

Name of the index

[projectionType](#projectiontype_nodejs)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

One of `ALL`, `INCLUDE` or `KEYS_ONLY` where `ALL` projects every attribute into the index, `KEYS_ONLY` projects into the index only the table and index hashKey and sortKey attributes , `INCLUDE` projects into the index all of the attributes that are defined in `nonKeyAttributes` in addition to the attributes that that`KEYS_ONLY` project.

[rangeKey](#rangekey_nodejs)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

Name of the range key.

[nonKeyAttributes](#nonkeyattributes_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string\[\]

Only required with `INCLUDE` as a projection type; a list of attributes to project into the index. These do not need to be defined as attributes on the table.

[name](#name_python)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

str

Name of the index

[projection\_type](#projection_type_python)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

str

One of `ALL`, `INCLUDE` or `KEYS_ONLY` where `ALL` projects every attribute into the index, `KEYS_ONLY` projects into the index only the table and index hashKey and sortKey attributes , `INCLUDE` projects into the index all of the attributes that are defined in `nonKeyAttributes` in addition to the attributes that that`KEYS_ONLY` project.

[range\_key](#range_key_python)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

str

Name of the range key.

[non\_key\_attributes](#non_key_attributes_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. Sequence\[str\]

Only required with `INCLUDE` as a projection type; a list of attributes to project into the index. These do not need to be defined as attributes on the table.

[name](#name_yaml)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

String

Name of the index

[projectionType](#projectiontype_yaml)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

String

One of `ALL`, `INCLUDE` or `KEYS_ONLY` where `ALL` projects every attribute into the index, `KEYS_ONLY` projects into the index only the table and index hashKey and sortKey attributes , `INCLUDE` projects into the index all of the attributes that are defined in `nonKeyAttributes` in addition to the attributes that that`KEYS_ONLY` project.

[rangeKey](#rangekey_yaml)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

String

Name of the range key.

[nonKeyAttributes](#nonkeyattributes_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. List<String>

Only required with `INCLUDE` as a projection type; a list of attributes to project into the index. These do not need to be defined as attributes on the table.

#### TableOnDemandThroughput

, TableOnDemandThroughputArgs

[](#tableondemandthroughput)

[MaxReadRequestUnits](#maxreadrequestunits_csharp) int

Maximum number of read request units for the specified table. To specify set the value greater than or equal to 1. To remove set the value to -1.

[MaxWriteRequestUnits](#maxwriterequestunits_csharp) int

Maximum number of write request units for the specified table. To specify set the value greater than or equal to 1. To remove set the value to -1.

[MaxReadRequestUnits](#maxreadrequestunits_go) int

Maximum number of read request units for the specified table. To specify set the value greater than or equal to 1. To remove set the value to -1.

[MaxWriteRequestUnits](#maxwriterequestunits_go) int

Maximum number of write request units for the specified table. To specify set the value greater than or equal to 1. To remove set the value to -1.

[max\_read\_request\_units](#max_read_request_units_hcl) number

Maximum number of read request units for the specified table. To specify set the value greater than or equal to 1. To remove set the value to -1.

[max\_write\_request\_units](#max_write_request_units_hcl) number

Maximum number of write request units for the specified table. To specify set the value greater than or equal to 1. To remove set the value to -1.

[maxReadRequestUnits](#maxreadrequestunits_java) Integer

Maximum number of read request units for the specified table. To specify set the value greater than or equal to 1. To remove set the value to -1.

[maxWriteRequestUnits](#maxwriterequestunits_java) Integer

Maximum number of write request units for the specified table. To specify set the value greater than or equal to 1. To remove set the value to -1.

[maxReadRequestUnits](#maxreadrequestunits_nodejs) number

Maximum number of read request units for the specified table. To specify set the value greater than or equal to 1. To remove set the value to -1.

[maxWriteRequestUnits](#maxwriterequestunits_nodejs) number

Maximum number of write request units for the specified table. To specify set the value greater than or equal to 1. To remove set the value to -1.

[max\_read\_request\_units](#max_read_request_units_python) int

Maximum number of read request units for the specified table. To specify set the value greater than or equal to 1. To remove set the value to -1.

[max\_write\_request\_units](#max_write_request_units_python) int

Maximum number of write request units for the specified table. To specify set the value greater than or equal to 1. To remove set the value to -1.

[maxReadRequestUnits](#maxreadrequestunits_yaml) Number

Maximum number of read request units for the specified table. To specify set the value greater than or equal to 1. To remove set the value to -1.

[maxWriteRequestUnits](#maxwriterequestunits_yaml) Number

Maximum number of write request units for the specified table. To specify set the value greater than or equal to 1. To remove set the value to -1.

#### TablePointInTimeRecovery

, TablePointInTimeRecoveryArgs

[](#tablepointintimerecovery)

[Enabled](#enabled_csharp) This property is required. bool

Whether to enable point-in-time recovery. It can take 10 minutes to enable for new tables. If the `pointInTimeRecovery` block is not provided, this defaults to `false`.

[RecoveryPeriodInDays](#recoveryperiodindays_csharp) int

Number of preceding days for which continuous backups are taken and maintained. Default is 35.

[Enabled](#enabled_go) This property is required. bool

Whether to enable point-in-time recovery. It can take 10 minutes to enable for new tables. If the `pointInTimeRecovery` block is not provided, this defaults to `false`.

[RecoveryPeriodInDays](#recoveryperiodindays_go) int

Number of preceding days for which continuous backups are taken and maintained. Default is 35.

[enabled](#enabled_hcl) This property is required. bool

Whether to enable point-in-time recovery. It can take 10 minutes to enable for new tables. If the `pointInTimeRecovery` block is not provided, this defaults to `false`.

[recovery\_period\_in\_days](#recovery_period_in_days_hcl) number

Number of preceding days for which continuous backups are taken and maintained. Default is 35.

[enabled](#enabled_java) This property is required. Boolean

Whether to enable point-in-time recovery. It can take 10 minutes to enable for new tables. If the `pointInTimeRecovery` block is not provided, this defaults to `false`.

[recoveryPeriodInDays](#recoveryperiodindays_java) Integer

Number of preceding days for which continuous backups are taken and maintained. Default is 35.

[enabled](#enabled_nodejs) This property is required. boolean

Whether to enable point-in-time recovery. It can take 10 minutes to enable for new tables. If the `pointInTimeRecovery` block is not provided, this defaults to `false`.

[recoveryPeriodInDays](#recoveryperiodindays_nodejs) number

Number of preceding days for which continuous backups are taken and maintained. Default is 35.

[enabled](#enabled_python) This property is required. bool

Whether to enable point-in-time recovery. It can take 10 minutes to enable for new tables. If the `pointInTimeRecovery` block is not provided, this defaults to `false`.

[recovery\_period\_in\_days](#recovery_period_in_days_python) int

Number of preceding days for which continuous backups are taken and maintained. Default is 35.

[enabled](#enabled_yaml) This property is required. Boolean

Whether to enable point-in-time recovery. It can take 10 minutes to enable for new tables. If the `pointInTimeRecovery` block is not provided, this defaults to `false`.

[recoveryPeriodInDays](#recoveryperiodindays_yaml) Number

Number of preceding days for which continuous backups are taken and maintained. Default is 35.

#### TableReplica

, TableReplicaArgs

[](#tablereplica)

[RegionName](#regionname_csharp) This property is required. string

Region name of the replica.

[Arn](#arn_csharp) string

ARN of the table

[ConsistencyMode](#consistencymode_csharp) string

Whether this global table will be using `STRONG` consistency mode or `EVENTUAL` consistency mode. Default value is `EVENTUAL`.

[DeletionProtectionEnabled](#deletionprotectionenabled_csharp) bool

Whether deletion protection is enabled (true) or disabled (false) on the replica. Default is `false`.

[KmsKeyArn](#kmskeyarn_csharp) string

ARN of the CMK that should be used for the AWS KMS encryption. This argument should only be used if the key is different from the default KMS-managed DynamoDB key, `alias/aws/dynamodb`. **Note:** This attribute will *not* be populated with the ARN of *default* keys. **Note:** Changing this value will recreate the replica.

[PointInTimeRecovery](#pointintimerecovery_csharp) bool

Whether to enable Point In Time Recovery for the replica. Default is `false`.

[PropagateTags](#propagatetags_csharp) bool

Whether to propagate the global table's tags to a replica. Default is `false`. Changes to tags only move in one direction: from global (source) to replica. Tag drift on a replica will not trigger an update. Tag changes on the global table are propagated to replicas. Changing from `true` to `false` on a subsequent `apply` leaves replica tags as-is and no longer manages them.

[StreamArn](#streamarn_csharp) string

ARN of the Table Stream. Only available when `streamEnabled = true`

[StreamLabel](#streamlabel_csharp) string

Timestamp, in ISO 8601 format, for this stream. Note that this timestamp is not a unique identifier for the stream on its own. However, the combination of AWS customer ID, table name and this field is guaranteed to be unique. It can be used for creating CloudWatch Alarms. Only available when `streamEnabled = true`.

[RegionName](#regionname_go) This property is required. string

Region name of the replica.

[Arn](#arn_go) string

ARN of the table

[ConsistencyMode](#consistencymode_go) string

Whether this global table will be using `STRONG` consistency mode or `EVENTUAL` consistency mode. Default value is `EVENTUAL`.

[DeletionProtectionEnabled](#deletionprotectionenabled_go) bool

Whether deletion protection is enabled (true) or disabled (false) on the replica. Default is `false`.

[KmsKeyArn](#kmskeyarn_go) string

ARN of the CMK that should be used for the AWS KMS encryption. This argument should only be used if the key is different from the default KMS-managed DynamoDB key, `alias/aws/dynamodb`. **Note:** This attribute will *not* be populated with the ARN of *default* keys. **Note:** Changing this value will recreate the replica.

[PointInTimeRecovery](#pointintimerecovery_go) bool

Whether to enable Point In Time Recovery for the replica. Default is `false`.

[PropagateTags](#propagatetags_go) bool

Whether to propagate the global table's tags to a replica. Default is `false`. Changes to tags only move in one direction: from global (source) to replica. Tag drift on a replica will not trigger an update. Tag changes on the global table are propagated to replicas. Changing from `true` to `false` on a subsequent `apply` leaves replica tags as-is and no longer manages them.

[StreamArn](#streamarn_go) string

ARN of the Table Stream. Only available when `streamEnabled = true`

[StreamLabel](#streamlabel_go) string

Timestamp, in ISO 8601 format, for this stream. Note that this timestamp is not a unique identifier for the stream on its own. However, the combination of AWS customer ID, table name and this field is guaranteed to be unique. It can be used for creating CloudWatch Alarms. Only available when `streamEnabled = true`.

[region\_name](#region_name_hcl) This property is required. string

Region name of the replica.

[arn](#arn_hcl) string

ARN of the table

[consistency\_mode](#consistency_mode_hcl) string

Whether this global table will be using `STRONG` consistency mode or `EVENTUAL` consistency mode. Default value is `EVENTUAL`.

[deletion\_protection\_enabled](#deletion_protection_enabled_hcl) bool

Whether deletion protection is enabled (true) or disabled (false) on the replica. Default is `false`.

[kms\_key\_arn](#kms_key_arn_hcl) string

ARN of the CMK that should be used for the AWS KMS encryption. This argument should only be used if the key is different from the default KMS-managed DynamoDB key, `alias/aws/dynamodb`. **Note:** This attribute will *not* be populated with the ARN of *default* keys. **Note:** Changing this value will recreate the replica.

[point\_in\_time\_recovery](#point_in_time_recovery_hcl) bool

Whether to enable Point In Time Recovery for the replica. Default is `false`.

[propagate\_tags](#propagate_tags_hcl) bool

Whether to propagate the global table's tags to a replica. Default is `false`. Changes to tags only move in one direction: from global (source) to replica. Tag drift on a replica will not trigger an update. Tag changes on the global table are propagated to replicas. Changing from `true` to `false` on a subsequent `apply` leaves replica tags as-is and no longer manages them.

[stream\_arn](#stream_arn_hcl) string

ARN of the Table Stream. Only available when `streamEnabled = true`

[stream\_label](#stream_label_hcl) string

Timestamp, in ISO 8601 format, for this stream. Note that this timestamp is not a unique identifier for the stream on its own. However, the combination of AWS customer ID, table name and this field is guaranteed to be unique. It can be used for creating CloudWatch Alarms. Only available when `streamEnabled = true`.

[regionName](#regionname_java) This property is required. String

Region name of the replica.

[arn](#arn_java) String

ARN of the table

[consistencyMode](#consistencymode_java) String

Whether this global table will be using `STRONG` consistency mode or `EVENTUAL` consistency mode. Default value is `EVENTUAL`.

[deletionProtectionEnabled](#deletionprotectionenabled_java) Boolean

Whether deletion protection is enabled (true) or disabled (false) on the replica. Default is `false`.

[kmsKeyArn](#kmskeyarn_java) String

ARN of the CMK that should be used for the AWS KMS encryption. This argument should only be used if the key is different from the default KMS-managed DynamoDB key, `alias/aws/dynamodb`. **Note:** This attribute will *not* be populated with the ARN of *default* keys. **Note:** Changing this value will recreate the replica.

[pointInTimeRecovery](#pointintimerecovery_java) Boolean

Whether to enable Point In Time Recovery for the replica. Default is `false`.

[propagateTags](#propagatetags_java) Boolean

Whether to propagate the global table's tags to a replica. Default is `false`. Changes to tags only move in one direction: from global (source) to replica. Tag drift on a replica will not trigger an update. Tag changes on the global table are propagated to replicas. Changing from `true` to `false` on a subsequent `apply` leaves replica tags as-is and no longer manages them.

[streamArn](#streamarn_java) String

ARN of the Table Stream. Only available when `streamEnabled = true`

[streamLabel](#streamlabel_java) String

Timestamp, in ISO 8601 format, for this stream. Note that this timestamp is not a unique identifier for the stream on its own. However, the combination of AWS customer ID, table name and this field is guaranteed to be unique. It can be used for creating CloudWatch Alarms. Only available when `streamEnabled = true`.

[regionName](#regionname_nodejs) This property is required. string

Region name of the replica.

[arn](#arn_nodejs) string

ARN of the table

[consistencyMode](#consistencymode_nodejs) string

Whether this global table will be using `STRONG` consistency mode or `EVENTUAL` consistency mode. Default value is `EVENTUAL`.

[deletionProtectionEnabled](#deletionprotectionenabled_nodejs) boolean

Whether deletion protection is enabled (true) or disabled (false) on the replica. Default is `false`.

[kmsKeyArn](#kmskeyarn_nodejs) string

ARN of the CMK that should be used for the AWS KMS encryption. This argument should only be used if the key is different from the default KMS-managed DynamoDB key, `alias/aws/dynamodb`. **Note:** This attribute will *not* be populated with the ARN of *default* keys. **Note:** Changing this value will recreate the replica.

[pointInTimeRecovery](#pointintimerecovery_nodejs) boolean

Whether to enable Point In Time Recovery for the replica. Default is `false`.

[propagateTags](#propagatetags_nodejs) boolean

Whether to propagate the global table's tags to a replica. Default is `false`. Changes to tags only move in one direction: from global (source) to replica. Tag drift on a replica will not trigger an update. Tag changes on the global table are propagated to replicas. Changing from `true` to `false` on a subsequent `apply` leaves replica tags as-is and no longer manages them.

[streamArn](#streamarn_nodejs) string

ARN of the Table Stream. Only available when `streamEnabled = true`

[streamLabel](#streamlabel_nodejs) string

Timestamp, in ISO 8601 format, for this stream. Note that this timestamp is not a unique identifier for the stream on its own. However, the combination of AWS customer ID, table name and this field is guaranteed to be unique. It can be used for creating CloudWatch Alarms. Only available when `streamEnabled = true`.

[region\_name](#region_name_python) This property is required. str

Region name of the replica.

[arn](#arn_python) str

ARN of the table

[consistency\_mode](#consistency_mode_python) str

Whether this global table will be using `STRONG` consistency mode or `EVENTUAL` consistency mode. Default value is `EVENTUAL`.

[deletion\_protection\_enabled](#deletion_protection_enabled_python) bool

Whether deletion protection is enabled (true) or disabled (false) on the replica. Default is `false`.

[kms\_key\_arn](#kms_key_arn_python) str

ARN of the CMK that should be used for the AWS KMS encryption. This argument should only be used if the key is different from the default KMS-managed DynamoDB key, `alias/aws/dynamodb`. **Note:** This attribute will *not* be populated with the ARN of *default* keys. **Note:** Changing this value will recreate the replica.

[point\_in\_time\_recovery](#point_in_time_recovery_python) bool

Whether to enable Point In Time Recovery for the replica. Default is `false`.

[propagate\_tags](#propagate_tags_python) bool

Whether to propagate the global table's tags to a replica. Default is `false`. Changes to tags only move in one direction: from global (source) to replica. Tag drift on a replica will not trigger an update. Tag changes on the global table are propagated to replicas. Changing from `true` to `false` on a subsequent `apply` leaves replica tags as-is and no longer manages them.

[stream\_arn](#stream_arn_python) str

ARN of the Table Stream. Only available when `streamEnabled = true`

[stream\_label](#stream_label_python) str

Timestamp, in ISO 8601 format, for this stream. Note that this timestamp is not a unique identifier for the stream on its own. However, the combination of AWS customer ID, table name and this field is guaranteed to be unique. It can be used for creating CloudWatch Alarms. Only available when `streamEnabled = true`.

[regionName](#regionname_yaml) This property is required. String

Region name of the replica.

[arn](#arn_yaml) String

ARN of the table

[consistencyMode](#consistencymode_yaml) String

Whether this global table will be using `STRONG` consistency mode or `EVENTUAL` consistency mode. Default value is `EVENTUAL`.

[deletionProtectionEnabled](#deletionprotectionenabled_yaml) Boolean

Whether deletion protection is enabled (true) or disabled (false) on the replica. Default is `false`.

[kmsKeyArn](#kmskeyarn_yaml) String

ARN of the CMK that should be used for the AWS KMS encryption. This argument should only be used if the key is different from the default KMS-managed DynamoDB key, `alias/aws/dynamodb`. **Note:** This attribute will *not* be populated with the ARN of *default* keys. **Note:** Changing this value will recreate the replica.

[pointInTimeRecovery](#pointintimerecovery_yaml) Boolean

Whether to enable Point In Time Recovery for the replica. Default is `false`.

[propagateTags](#propagatetags_yaml) Boolean

Whether to propagate the global table's tags to a replica. Default is `false`. Changes to tags only move in one direction: from global (source) to replica. Tag drift on a replica will not trigger an update. Tag changes on the global table are propagated to replicas. Changing from `true` to `false` on a subsequent `apply` leaves replica tags as-is and no longer manages them.

[streamArn](#streamarn_yaml) String

ARN of the Table Stream. Only available when `streamEnabled = true`

[streamLabel](#streamlabel_yaml) String

Timestamp, in ISO 8601 format, for this stream. Note that this timestamp is not a unique identifier for the stream on its own. However, the combination of AWS customer ID, table name and this field is guaranteed to be unique. It can be used for creating CloudWatch Alarms. Only available when `streamEnabled = true`.

#### TableServerSideEncryption

, TableServerSideEncryptionArgs

[](#tableserversideencryption)

[Enabled](#enabled_csharp) This property is required. bool

Whether or not to enable encryption at rest using an AWS managed KMS customer master key (CMK). If `enabled` is `false` then server-side encryption is set to AWS-*owned* key (shown as `DEFAULT` in the AWS console). Potentially confusingly, if `enabled` is `true` and no `kmsKeyArn` is specified then server-side encryption is set to the *default* KMS-*managed* key (shown as `KMS` in the AWS console). The [AWS KMS documentation](https://docs.aws.amazon.com/kms/latest/developerguide/concepts.html) explains the difference between AWS-*owned* and KMS-*managed* keys.

[KmsKeyArn](#kmskeyarn_csharp) string

ARN of the CMK that should be used for the AWS KMS encryption. This argument should only be used if the key is different from the default KMS-managed DynamoDB key, `alias/aws/dynamodb`. **Note:** This attribute will *not* be populated with the ARN of *default* keys.

[Enabled](#enabled_go) This property is required. bool

Whether or not to enable encryption at rest using an AWS managed KMS customer master key (CMK). If `enabled` is `false` then server-side encryption is set to AWS-*owned* key (shown as `DEFAULT` in the AWS console). Potentially confusingly, if `enabled` is `true` and no `kmsKeyArn` is specified then server-side encryption is set to the *default* KMS-*managed* key (shown as `KMS` in the AWS console). The [AWS KMS documentation](https://docs.aws.amazon.com/kms/latest/developerguide/concepts.html) explains the difference between AWS-*owned* and KMS-*managed* keys.

[KmsKeyArn](#kmskeyarn_go) string

ARN of the CMK that should be used for the AWS KMS encryption. This argument should only be used if the key is different from the default KMS-managed DynamoDB key, `alias/aws/dynamodb`. **Note:** This attribute will *not* be populated with the ARN of *default* keys.

[enabled](#enabled_hcl) This property is required. bool

Whether or not to enable encryption at rest using an AWS managed KMS customer master key (CMK). If `enabled` is `false` then server-side encryption is set to AWS-*owned* key (shown as `DEFAULT` in the AWS console). Potentially confusingly, if `enabled` is `true` and no `kmsKeyArn` is specified then server-side encryption is set to the *default* KMS-*managed* key (shown as `KMS` in the AWS console). The [AWS KMS documentation](https://docs.aws.amazon.com/kms/latest/developerguide/concepts.html) explains the difference between AWS-*owned* and KMS-*managed* keys.

[kms\_key\_arn](#kms_key_arn_hcl) string

ARN of the CMK that should be used for the AWS KMS encryption. This argument should only be used if the key is different from the default KMS-managed DynamoDB key, `alias/aws/dynamodb`. **Note:** This attribute will *not* be populated with the ARN of *default* keys.

[enabled](#enabled_java) This property is required. Boolean

Whether or not to enable encryption at rest using an AWS managed KMS customer master key (CMK). If `enabled` is `false` then server-side encryption is set to AWS-*owned* key (shown as `DEFAULT` in the AWS console). Potentially confusingly, if `enabled` is `true` and no `kmsKeyArn` is specified then server-side encryption is set to the *default* KMS-*managed* key (shown as `KMS` in the AWS console). The [AWS KMS documentation](https://docs.aws.amazon.com/kms/latest/developerguide/concepts.html) explains the difference between AWS-*owned* and KMS-*managed* keys.

[kmsKeyArn](#kmskeyarn_java) String

ARN of the CMK that should be used for the AWS KMS encryption. This argument should only be used if the key is different from the default KMS-managed DynamoDB key, `alias/aws/dynamodb`. **Note:** This attribute will *not* be populated with the ARN of *default* keys.

[enabled](#enabled_nodejs) This property is required. boolean

Whether or not to enable encryption at rest using an AWS managed KMS customer master key (CMK). If `enabled` is `false` then server-side encryption is set to AWS-*owned* key (shown as `DEFAULT` in the AWS console). Potentially confusingly, if `enabled` is `true` and no `kmsKeyArn` is specified then server-side encryption is set to the *default* KMS-*managed* key (shown as `KMS` in the AWS console). The [AWS KMS documentation](https://docs.aws.amazon.com/kms/latest/developerguide/concepts.html) explains the difference between AWS-*owned* and KMS-*managed* keys.

[kmsKeyArn](#kmskeyarn_nodejs) string

ARN of the CMK that should be used for the AWS KMS encryption. This argument should only be used if the key is different from the default KMS-managed DynamoDB key, `alias/aws/dynamodb`. **Note:** This attribute will *not* be populated with the ARN of *default* keys.

[enabled](#enabled_python) This property is required. bool

Whether or not to enable encryption at rest using an AWS managed KMS customer master key (CMK). If `enabled` is `false` then server-side encryption is set to AWS-*owned* key (shown as `DEFAULT` in the AWS console). Potentially confusingly, if `enabled` is `true` and no `kmsKeyArn` is specified then server-side encryption is set to the *default* KMS-*managed* key (shown as `KMS` in the AWS console). The [AWS KMS documentation](https://docs.aws.amazon.com/kms/latest/developerguide/concepts.html) explains the difference between AWS-*owned* and KMS-*managed* keys.

[kms\_key\_arn](#kms_key_arn_python) str

ARN of the CMK that should be used for the AWS KMS encryption. This argument should only be used if the key is different from the default KMS-managed DynamoDB key, `alias/aws/dynamodb`. **Note:** This attribute will *not* be populated with the ARN of *default* keys.

[enabled](#enabled_yaml) This property is required. Boolean

Whether or not to enable encryption at rest using an AWS managed KMS customer master key (CMK). If `enabled` is `false` then server-side encryption is set to AWS-*owned* key (shown as `DEFAULT` in the AWS console). Potentially confusingly, if `enabled` is `true` and no `kmsKeyArn` is specified then server-side encryption is set to the *default* KMS-*managed* key (shown as `KMS` in the AWS console). The [AWS KMS documentation](https://docs.aws.amazon.com/kms/latest/developerguide/concepts.html) explains the difference between AWS-*owned* and KMS-*managed* keys.

[kmsKeyArn](#kmskeyarn_yaml) String

ARN of the CMK that should be used for the AWS KMS encryption. This argument should only be used if the key is different from the default KMS-managed DynamoDB key, `alias/aws/dynamodb`. **Note:** This attribute will *not* be populated with the ARN of *default* keys.

#### TableTtl

, TableTtlArgs

[](#tablettl)

[AttributeName](#attributename_csharp) string

Name of the table attribute to store the TTL timestamp in. Required if `enabled` is `true`, must not be set otherwise.

[Enabled](#enabled_csharp) bool

Whether TTL is enabled. Default value is `false`.

[AttributeName](#attributename_go) string

Name of the table attribute to store the TTL timestamp in. Required if `enabled` is `true`, must not be set otherwise.

[Enabled](#enabled_go) bool

Whether TTL is enabled. Default value is `false`.

[attribute\_name](#attribute_name_hcl) string

Name of the table attribute to store the TTL timestamp in. Required if `enabled` is `true`, must not be set otherwise.

[enabled](#enabled_hcl) bool

Whether TTL is enabled. Default value is `false`.

[attributeName](#attributename_java) String

Name of the table attribute to store the TTL timestamp in. Required if `enabled` is `true`, must not be set otherwise.

[enabled](#enabled_java) Boolean

Whether TTL is enabled. Default value is `false`.

[attributeName](#attributename_nodejs) string

Name of the table attribute to store the TTL timestamp in. Required if `enabled` is `true`, must not be set otherwise.

[enabled](#enabled_nodejs) boolean

Whether TTL is enabled. Default value is `false`.

[attribute\_name](#attribute_name_python) str

Name of the table attribute to store the TTL timestamp in. Required if `enabled` is `true`, must not be set otherwise.

[enabled](#enabled_python) bool

Whether TTL is enabled. Default value is `false`.

[attributeName](#attributename_yaml) String

Name of the table attribute to store the TTL timestamp in. Required if `enabled` is `true`, must not be set otherwise.

[enabled](#enabled_yaml) Boolean

Whether TTL is enabled. Default value is `false`.

#### TableWarmThroughput

, TableWarmThroughputArgs

[](#tablewarmthroughput)

[ReadUnitsPerSecond](#readunitspersecond_csharp) int

Number of read operations a table or index can instantaneously support. For the base table, decreasing this value will force a new resource. For a global secondary index, this value can be increased or decreased without recreation. Minimum value of `12000` (default).

[WriteUnitsPerSecond](#writeunitspersecond_csharp) int

Number of write operations a table or index can instantaneously support. For the base table, decreasing this value will force a new resource. For a global secondary index, this value can be increased or decreased without recreation. Minimum value of `4000` (default).

[ReadUnitsPerSecond](#readunitspersecond_go) int

Number of read operations a table or index can instantaneously support. For the base table, decreasing this value will force a new resource. For a global secondary index, this value can be increased or decreased without recreation. Minimum value of `12000` (default).

[WriteUnitsPerSecond](#writeunitspersecond_go) int

Number of write operations a table or index can instantaneously support. For the base table, decreasing this value will force a new resource. For a global secondary index, this value can be increased or decreased without recreation. Minimum value of `4000` (default).

[read\_units\_per\_second](#read_units_per_second_hcl) number

Number of read operations a table or index can instantaneously support. For the base table, decreasing this value will force a new resource. For a global secondary index, this value can be increased or decreased without recreation. Minimum value of `12000` (default).

[write\_units\_per\_second](#write_units_per_second_hcl) number

Number of write operations a table or index can instantaneously support. For the base table, decreasing this value will force a new resource. For a global secondary index, this value can be increased or decreased without recreation. Minimum value of `4000` (default).

[readUnitsPerSecond](#readunitspersecond_java) Integer

Number of read operations a table or index can instantaneously support. For the base table, decreasing this value will force a new resource. For a global secondary index, this value can be increased or decreased without recreation. Minimum value of `12000` (default).

[writeUnitsPerSecond](#writeunitspersecond_java) Integer

Number of write operations a table or index can instantaneously support. For the base table, decreasing this value will force a new resource. For a global secondary index, this value can be increased or decreased without recreation. Minimum value of `4000` (default).

[readUnitsPerSecond](#readunitspersecond_nodejs) number

Number of read operations a table or index can instantaneously support. For the base table, decreasing this value will force a new resource. For a global secondary index, this value can be increased or decreased without recreation. Minimum value of `12000` (default).

[writeUnitsPerSecond](#writeunitspersecond_nodejs) number

Number of write operations a table or index can instantaneously support. For the base table, decreasing this value will force a new resource. For a global secondary index, this value can be increased or decreased without recreation. Minimum value of `4000` (default).

[read\_units\_per\_second](#read_units_per_second_python) int

Number of read operations a table or index can instantaneously support. For the base table, decreasing this value will force a new resource. For a global secondary index, this value can be increased or decreased without recreation. Minimum value of `12000` (default).

[write\_units\_per\_second](#write_units_per_second_python) int

Number of write operations a table or index can instantaneously support. For the base table, decreasing this value will force a new resource. For a global secondary index, this value can be increased or decreased without recreation. Minimum value of `4000` (default).

[readUnitsPerSecond](#readunitspersecond_yaml) Number

Number of read operations a table or index can instantaneously support. For the base table, decreasing this value will force a new resource. For a global secondary index, this value can be increased or decreased without recreation. Minimum value of `12000` (default).

[writeUnitsPerSecond](#writeunitspersecond_yaml) Number

Number of write operations a table or index can instantaneously support. For the base table, decreasing this value will force a new resource. For a global secondary index, this value can be increased or decreased without recreation. Minimum value of `4000` (default).

## Import[](#import)

### Identity Schema[](#identity-schema)

#### Required[](#required)

-   `name` (String) Name of the DynamoDB Table.

#### Optional[](#optional)

-   `accountId` (String) AWS Account where this resource is managed.
-   `region` (String) Region where this resource is managed.

Using `pulumi import`, import DynamoDB tables using the `name`. For example:

```bash
$ pulumi import aws:dynamodb/table:Table basic-dynamodb-table GameScores
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

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2fdynamodb%2ftable]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2fdynamodb%2ftable%2f\))

#### Try Pulumi Cloud free.
Your team will thank you.

[Start free trial](https://app.pulumi.com/signup?utm_source=registry&utm_medium=right-rail-banner&utm_campaign=try-pulumi-cloud&iaid=docs-try-pulumi-cloud-ad)
