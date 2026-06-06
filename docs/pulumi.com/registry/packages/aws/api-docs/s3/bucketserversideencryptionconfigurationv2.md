---
Source: https://www.pulumi.com/registry/packages/aws/api-docs/s3/bucketserversideencryptionconfigurationv2/
Generated: 2026-06-06
Updated: 2026-06-06
---

# aws.s3.BucketServerSideEncryptionConfigurationV2

1.  [Packages](/registry/)
2.  [Packages](/registry/packages/)
3.  [AWS](/registry/packages/aws/)
4.  [API Docs](/registry/packages/aws/api-docs/)
5.  [s3](/registry/packages/aws/api-docs/s3/)
6.  [BucketServerSideEncryptionConfigurationV2](/registry/packages/aws/api-docs/s3/bucketserversideencryptionconfigurationv2/)

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

Viewing docs for AWS v7.32.0
published on Friday, May 29, 2026 by Pulumi

[Schema (JSON)](/registry/packages/aws/schema.json)

[pulumi/pulumi-aws](https://github.com/pulumi/pulumi-aws)

v7.32.0 (7.x, latest)v6.83.1 (6.x)v5.43.0 (5.x)

# aws.s3.BucketServerSideEncryptionConfigurationV2[](#aws-s3-bucketserversideencryptionconfigurationv2)

Explore with Neo

-   Copy Page

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2fs3%2fbucketserversideencryptionconfigurationv2]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2fs3%2fbucketserversideencryptionconfigurationv2%2f\))

Deprecated: aws.s3/bucketserversideencryptionconfigurationv2.BucketServerSideEncryptionConfigurationV2 has been deprecated in favor of aws.s3/bucketserversideencryptionconfiguration.BucketServerSideEncryptionConfiguration

Provides a S3 bucket server-side encryption configuration resource.

> **NOTE:** Destroying an `aws.s3.BucketServerSideEncryptionConfiguration` resource resets the bucket to [Amazon S3 bucket default encryption](https://docs.aws.amazon.com/AmazonS3/latest/userguide/default-encryption-faq.html).

> **NOTE:** Starting in April 2026, Amazon S3 will automatically block server-side encryption with customer-provided keys (SSE-C) for all new buckets. Use the `blockedEncryptionTypes` argument to manage this behavior. For more information, see the [SSE-C changes FAQ](https://docs.aws.amazon.com/AmazonS3/latest/userguide/default-s3-c-encryption-setting-faq.html).

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

const mykey = new aws.kms.Key("mykey", {
    description: "This key is used to encrypt bucket objects",
    deletionWindowInDays: 10,
});
const mybucket = new aws.s3.Bucket("mybucket", {bucket: "mybucket"});
const example = new aws.s3.BucketServerSideEncryptionConfiguration("example", {
    bucket: mybucket.id,
    rules: [{
        applyServerSideEncryptionByDefault: {
            kmsMasterKeyId: mykey.arn,
            sseAlgorithm: "aws:kms",
        },
    }],
});
```

```python
import pulumi
import pulumi_aws as aws

mykey = aws.kms.Key("mykey",
    description="This key is used to encrypt bucket objects",
    deletion_window_in_days=10)
mybucket = aws.s3.Bucket("mybucket", bucket="mybucket")
example = aws.s3.BucketServerSideEncryptionConfiguration("example",
    bucket=mybucket.id,
    rules=[{
        "apply_server_side_encryption_by_default": {
            "kms_master_key_id": mykey.arn,
            "sse_algorithm": "aws:kms",
        },
    }])
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/kms"
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/s3"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		mykey, err := kms.NewKey(ctx, "mykey", &kms.KeyArgs{
			Description:          pulumi.String("This key is used to encrypt bucket objects"),
			DeletionWindowInDays: pulumi.Int(10),
		})
		if err != nil {
			return err
		}
		mybucket, err := s3.NewBucket(ctx, "mybucket", &s3.BucketArgs{
			Bucket: pulumi.String("mybucket"),
		})
		if err != nil {
			return err
		}
		_, err = s3.NewBucketServerSideEncryptionConfiguration(ctx, "example", &s3.BucketServerSideEncryptionConfigurationArgs{
			Bucket: mybucket.ID(),
			Rules: s3.BucketServerSideEncryptionConfigurationRuleArray{
				&s3.BucketServerSideEncryptionConfigurationRuleArgs{
					ApplyServerSideEncryptionByDefault: &s3.BucketServerSideEncryptionConfigurationRuleApplyServerSideEncryptionByDefaultArgs{
						KmsMasterKeyId: mykey.Arn,
						SseAlgorithm:   pulumi.String("aws:kms"),
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
    var mykey = new Aws.Kms.Key("mykey", new()
    {
        Description = "This key is used to encrypt bucket objects",
        DeletionWindowInDays = 10,
    });

    var mybucket = new Aws.S3.Bucket("mybucket", new()
    {
        BucketName = "mybucket",
    });

    var example = new Aws.S3.BucketServerSideEncryptionConfiguration("example", new()
    {
        Bucket = mybucket.Id,
        Rules = new[]
        {
            new Aws.S3.Inputs.BucketServerSideEncryptionConfigurationRuleArgs
            {
                ApplyServerSideEncryptionByDefault = new Aws.S3.Inputs.BucketServerSideEncryptionConfigurationRuleApplyServerSideEncryptionByDefaultArgs
                {
                    KmsMasterKeyId = mykey.Arn,
                    SseAlgorithm = "aws:kms",
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
import com.pulumi.aws.kms.Key;
import com.pulumi.aws.kms.KeyArgs;
import com.pulumi.aws.s3.Bucket;
import com.pulumi.aws.s3.BucketArgs;
import com.pulumi.aws.s3.BucketServerSideEncryptionConfiguration;
import com.pulumi.aws.s3.BucketServerSideEncryptionConfigurationArgs;
import com.pulumi.aws.s3.inputs.BucketServerSideEncryptionConfigurationRuleArgs;
import com.pulumi.aws.s3.inputs.BucketServerSideEncryptionConfigurationRuleApplyServerSideEncryptionByDefaultArgs;
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
        var mykey = new Key("mykey", KeyArgs.builder()
            .description("This key is used to encrypt bucket objects")
            .deletionWindowInDays(10)
            .build());

        var mybucket = new Bucket("mybucket", BucketArgs.builder()
            .bucket("mybucket")
            .build());

        var example = new BucketServerSideEncryptionConfiguration("example", BucketServerSideEncryptionConfigurationArgs.builder()
            .bucket(mybucket.id())
            .rules(BucketServerSideEncryptionConfigurationRuleArgs.builder()
                .applyServerSideEncryptionByDefault(BucketServerSideEncryptionConfigurationRuleApplyServerSideEncryptionByDefaultArgs.builder()
                    .kmsMasterKeyId(mykey.arn())
                    .sseAlgorithm("aws:kms")
                    .build())
                .build())
            .build());

    }
}
```

```yaml
resources:
  mykey:
    type: aws:kms:Key
    properties:
      description: This key is used to encrypt bucket objects
      deletionWindowInDays: 10
  mybucket:
    type: aws:s3:Bucket
    properties:
      bucket: mybucket
  example:
    type: aws:s3:BucketServerSideEncryptionConfiguration
    properties:
      bucket: ${mybucket.id}
      rules:
        - applyServerSideEncryptionByDefault:
            kmsMasterKeyId: ${mykey.arn}
            sseAlgorithm: aws:kms
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_kms_key" "mykey" {
  description             = "This key is used to encrypt bucket objects"
  deletion_window_in_days = 10
}
resource "aws_s3_bucket" "mybucket" {
  bucket = "mybucket"
}
resource "aws_s3_bucketserversideencryptionconfiguration" "example" {
  bucket = aws_s3_bucket.mybucket.id
  rules {
    apply_server_side_encryption_by_default = {
      kms_master_key_id = aws_kms_key.mykey.arn
      sse_algorithm     = "aws:kms"
    }
  }
}
```

### Blocking SSE-C Uploads[](#blocking-sse-c-uploads)

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

const mykey = new aws.kms.Key("mykey", {
    description: "This key is used to encrypt bucket objects",
    deletionWindowInDays: 10,
});
const mybucket = new aws.s3.Bucket("mybucket", {bucket: "mybucket"});
const example = new aws.s3.BucketServerSideEncryptionConfiguration("example", {
    bucket: mybucket.id,
    rules: [{
        applyServerSideEncryptionByDefault: {
            kmsMasterKeyId: mykey.arn,
            sseAlgorithm: "aws:kms",
        },
        bucketKeyEnabled: true,
        blockedEncryptionTypes: ["SSE-C"],
    }],
});
```

```python
import pulumi
import pulumi_aws as aws

mykey = aws.kms.Key("mykey",
    description="This key is used to encrypt bucket objects",
    deletion_window_in_days=10)
mybucket = aws.s3.Bucket("mybucket", bucket="mybucket")
example = aws.s3.BucketServerSideEncryptionConfiguration("example",
    bucket=mybucket.id,
    rules=[{
        "apply_server_side_encryption_by_default": {
            "kms_master_key_id": mykey.arn,
            "sse_algorithm": "aws:kms",
        },
        "bucket_key_enabled": True,
        "blocked_encryption_types": ["SSE-C"],
    }])
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/kms"
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/s3"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		mykey, err := kms.NewKey(ctx, "mykey", &kms.KeyArgs{
			Description:          pulumi.String("This key is used to encrypt bucket objects"),
			DeletionWindowInDays: pulumi.Int(10),
		})
		if err != nil {
			return err
		}
		mybucket, err := s3.NewBucket(ctx, "mybucket", &s3.BucketArgs{
			Bucket: pulumi.String("mybucket"),
		})
		if err != nil {
			return err
		}
		_, err = s3.NewBucketServerSideEncryptionConfiguration(ctx, "example", &s3.BucketServerSideEncryptionConfigurationArgs{
			Bucket: mybucket.ID(),
			Rules: s3.BucketServerSideEncryptionConfigurationRuleArray{
				&s3.BucketServerSideEncryptionConfigurationRuleArgs{
					ApplyServerSideEncryptionByDefault: &s3.BucketServerSideEncryptionConfigurationRuleApplyServerSideEncryptionByDefaultArgs{
						KmsMasterKeyId: mykey.Arn,
						SseAlgorithm:   pulumi.String("aws:kms"),
					},
					BucketKeyEnabled: pulumi.Bool(true),
					BlockedEncryptionTypes: pulumi.StringArray{
						pulumi.String("SSE-C"),
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
    var mykey = new Aws.Kms.Key("mykey", new()
    {
        Description = "This key is used to encrypt bucket objects",
        DeletionWindowInDays = 10,
    });

    var mybucket = new Aws.S3.Bucket("mybucket", new()
    {
        BucketName = "mybucket",
    });

    var example = new Aws.S3.BucketServerSideEncryptionConfiguration("example", new()
    {
        Bucket = mybucket.Id,
        Rules = new[]
        {
            new Aws.S3.Inputs.BucketServerSideEncryptionConfigurationRuleArgs
            {
                ApplyServerSideEncryptionByDefault = new Aws.S3.Inputs.BucketServerSideEncryptionConfigurationRuleApplyServerSideEncryptionByDefaultArgs
                {
                    KmsMasterKeyId = mykey.Arn,
                    SseAlgorithm = "aws:kms",
                },
                BucketKeyEnabled = true,
                BlockedEncryptionTypes = new[]
                {
                    "SSE-C",
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
import com.pulumi.aws.kms.Key;
import com.pulumi.aws.kms.KeyArgs;
import com.pulumi.aws.s3.Bucket;
import com.pulumi.aws.s3.BucketArgs;
import com.pulumi.aws.s3.BucketServerSideEncryptionConfiguration;
import com.pulumi.aws.s3.BucketServerSideEncryptionConfigurationArgs;
import com.pulumi.aws.s3.inputs.BucketServerSideEncryptionConfigurationRuleArgs;
import com.pulumi.aws.s3.inputs.BucketServerSideEncryptionConfigurationRuleApplyServerSideEncryptionByDefaultArgs;
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
        var mykey = new Key("mykey", KeyArgs.builder()
            .description("This key is used to encrypt bucket objects")
            .deletionWindowInDays(10)
            .build());

        var mybucket = new Bucket("mybucket", BucketArgs.builder()
            .bucket("mybucket")
            .build());

        var example = new BucketServerSideEncryptionConfiguration("example", BucketServerSideEncryptionConfigurationArgs.builder()
            .bucket(mybucket.id())
            .rules(BucketServerSideEncryptionConfigurationRuleArgs.builder()
                .applyServerSideEncryptionByDefault(BucketServerSideEncryptionConfigurationRuleApplyServerSideEncryptionByDefaultArgs.builder()
                    .kmsMasterKeyId(mykey.arn())
                    .sseAlgorithm("aws:kms")
                    .build())
                .bucketKeyEnabled(true)
                .blockedEncryptionTypes("SSE-C")
                .build())
            .build());

    }
}
```

```yaml
resources:
  mykey:
    type: aws:kms:Key
    properties:
      description: This key is used to encrypt bucket objects
      deletionWindowInDays: 10
  mybucket:
    type: aws:s3:Bucket
    properties:
      bucket: mybucket
  example:
    type: aws:s3:BucketServerSideEncryptionConfiguration
    properties:
      bucket: ${mybucket.id}
      rules:
        - applyServerSideEncryptionByDefault:
            kmsMasterKeyId: ${mykey.arn}
            sseAlgorithm: aws:kms
          bucketKeyEnabled: true
          blockedEncryptionTypes:
            - SSE-C
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_kms_key" "mykey" {
  description             = "This key is used to encrypt bucket objects"
  deletion_window_in_days = 10
}
resource "aws_s3_bucket" "mybucket" {
  bucket = "mybucket"
}
resource "aws_s3_bucketserversideencryptionconfiguration" "example" {
  bucket = aws_s3_bucket.mybucket.id
  rules {
    apply_server_side_encryption_by_default = {
      kms_master_key_id = aws_kms_key.mykey.arn
      sse_algorithm     = "aws:kms"
    }
    bucket_key_enabled       = true
    blocked_encryption_types = ["SSE-C"]
  }
}
```

## Create BucketServerSideEncryptionConfigurationV2 Resource[](#create)

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
new BucketServerSideEncryptionConfigurationV2(name: string, args: BucketServerSideEncryptionConfigurationV2Args, opts?: CustomResourceOptions);
```

```python
@overload
def BucketServerSideEncryptionConfigurationV2(resource_name: str,
                                              args: BucketServerSideEncryptionConfigurationV2Args,
                                              opts: Optional[ResourceOptions] = None)

@overload
def BucketServerSideEncryptionConfigurationV2(resource_name: str,
                                              opts: Optional[ResourceOptions] = None,
                                              bucket: Optional[str] = None,
                                              expected_bucket_owner: Optional[str] = None,
                                              region: Optional[str] = None,
                                              rules: Optional[Sequence[BucketServerSideEncryptionConfigurationV2RuleArgs]] = None)
```

```go
func NewBucketServerSideEncryptionConfigurationV2(ctx *Context, name string, args BucketServerSideEncryptionConfigurationV2Args, opts ...ResourceOption) (*BucketServerSideEncryptionConfigurationV2, error)
```

```csharp
public BucketServerSideEncryptionConfigurationV2(string name, BucketServerSideEncryptionConfigurationV2Args args, CustomResourceOptions? opts = null)
```

```java
public BucketServerSideEncryptionConfigurationV2(String name, BucketServerSideEncryptionConfigurationV2Args args)
public BucketServerSideEncryptionConfigurationV2(String name, BucketServerSideEncryptionConfigurationV2Args args, CustomResourceOptions options)
```

```yaml
type: aws:s3:BucketServerSideEncryptionConfigurationV2
properties: # The arguments to resource properties.
options: # Bag of options to control resource's behavior.
```

```hcl
resource "aws_s3_bucketserversideencryptionconfigurationv2" "name" {
    # resource properties
}
```

#### Parameters[](#parameters)

name This property is required. string

The unique name of the resource.

args This property is required. [BucketServerSideEncryptionConfigurationV2Args](#inputs)

The arguments to resource properties.

opts [CustomResourceOptions](/docs/reference/pkg/nodejs/pulumi/pulumi/#CustomResourceOptions)

Bag of options to control resource's behavior.

resource\_name This property is required. str

The unique name of the resource.

args This property is required. [BucketServerSideEncryptionConfigurationV2Args](#inputs)

The arguments to resource properties.

opts [ResourceOptions](/docs/reference/pkg/python/pulumi/#pulumi.ResourceOptions)

Bag of options to control resource's behavior.

ctx [Context](https://pkg.go.dev/github.com/pulumi/pulumi/sdk/v3/go/pulumi?tab=doc#Context)

Context object for the current deployment.

name This property is required. string

The unique name of the resource.

args This property is required. [BucketServerSideEncryptionConfigurationV2Args](#inputs)

The arguments to resource properties.

opts [ResourceOption](https://pkg.go.dev/github.com/pulumi/pulumi/sdk/v3/go/pulumi?tab=doc#ResourceOption)

Bag of options to control resource's behavior.

name This property is required. string

The unique name of the resource.

args This property is required. [BucketServerSideEncryptionConfigurationV2Args](#inputs)

The arguments to resource properties.

opts [CustomResourceOptions](/docs/reference/pkg/dotnet/Pulumi/Pulumi.CustomResourceOptions.html)

Bag of options to control resource's behavior.

name This property is required. String

The unique name of the resource.

args This property is required. [BucketServerSideEncryptionConfigurationV2Args](#inputs)

The arguments to resource properties.

options CustomResourceOptions

Bag of options to control resource's behavior.

## BucketServerSideEncryptionConfigurationV2 Resource Properties[](#properties)

To learn more about resource properties and how to use them, see [Inputs and Outputs](/docs/intro/concepts/inputs-outputs) in the Architecture and Concepts docs.

### Inputs[](#inputs)

In Python, inputs that are objects can be passed either as [argument classes or as dictionary literals](/docs/languages-sdks/python/#inputs-and-outputs).

The BucketServerSideEncryptionConfigurationV2 resource accepts the following [input](/docs/intro/concepts/inputs-outputs) properties:

[Bucket](#bucket_csharp)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

ID (name) of the bucket.

[Rules](#rules_csharp) This property is required. [List<BucketServerSideEncryptionConfigurationV2Rule>](#bucketserversideencryptionconfigurationv2rule)

Set of server-side encryption configuration rules. See below. Currently, only a single rule is supported.

[ExpectedBucketOwner](#expectedbucketowner_csharp) string

Account ID of the expected bucket owner.

Deprecated: expected\_bucket\_owner is deprecated. It will be removed in a future verion of the provider.

[Region](#region_csharp) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[Bucket](#bucket_go)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

ID (name) of the bucket.

[Rules](#rules_go) This property is required. [\[\]BucketServerSideEncryptionConfigurationV2RuleArgs](#bucketserversideencryptionconfigurationv2rule)

Set of server-side encryption configuration rules. See below. Currently, only a single rule is supported.

[ExpectedBucketOwner](#expectedbucketowner_go) string

Account ID of the expected bucket owner.

Deprecated: expected\_bucket\_owner is deprecated. It will be removed in a future verion of the provider.

[Region](#region_go) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[bucket](#bucket_hcl)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

ID (name) of the bucket.

[rules](#rules_hcl) This property is required. [list(object)](#bucketserversideencryptionconfigurationv2rule)

Set of server-side encryption configuration rules. See below. Currently, only a single rule is supported.

[expected\_bucket\_owner](#expected_bucket_owner_hcl) string

Account ID of the expected bucket owner.

Deprecated: expected\_bucket\_owner is deprecated. It will be removed in a future verion of the provider.

[region](#region_hcl) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[bucket](#bucket_java)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

String

ID (name) of the bucket.

[rules](#rules_java) This property is required. [List<BucketServerSideEncryptionConfigurationV2Rule>](#bucketserversideencryptionconfigurationv2rule)

Set of server-side encryption configuration rules. See below. Currently, only a single rule is supported.

[expectedBucketOwner](#expectedbucketowner_java) String

Account ID of the expected bucket owner.

Deprecated: expected\_bucket\_owner is deprecated. It will be removed in a future verion of the provider.

[region](#region_java) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[bucket](#bucket_nodejs)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

ID (name) of the bucket.

[rules](#rules_nodejs) This property is required. [BucketServerSideEncryptionConfigurationV2Rule\[\]](#bucketserversideencryptionconfigurationv2rule)

Set of server-side encryption configuration rules. See below. Currently, only a single rule is supported.

[expectedBucketOwner](#expectedbucketowner_nodejs) string

Account ID of the expected bucket owner.

Deprecated: expected\_bucket\_owner is deprecated. It will be removed in a future verion of the provider.

[region](#region_nodejs) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[bucket](#bucket_python)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

str

ID (name) of the bucket.

[rules](#rules_python) This property is required. [Sequence\[BucketServerSideEncryptionConfigurationV2RuleArgs\]](#bucketserversideencryptionconfigurationv2rule)

Set of server-side encryption configuration rules. See below. Currently, only a single rule is supported.

[expected\_bucket\_owner](#expected_bucket_owner_python) str

Account ID of the expected bucket owner.

Deprecated: expected\_bucket\_owner is deprecated. It will be removed in a future verion of the provider.

[region](#region_python) str

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[bucket](#bucket_yaml)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

String

ID (name) of the bucket.

[rules](#rules_yaml) This property is required. [List<Property Map>](#bucketserversideencryptionconfigurationv2rule)

Set of server-side encryption configuration rules. See below. Currently, only a single rule is supported.

[expectedBucketOwner](#expectedbucketowner_yaml) String

Account ID of the expected bucket owner.

Deprecated: expected\_bucket\_owner is deprecated. It will be removed in a future verion of the provider.

[region](#region_yaml) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

### Outputs[](#outputs)

All [input](#inputs) properties are implicitly available as output properties. Additionally, the BucketServerSideEncryptionConfigurationV2 resource produces the following output properties:

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

## Look up Existing BucketServerSideEncryptionConfigurationV2 Resource[](#look-up)

Get an existing BucketServerSideEncryptionConfigurationV2 resource’s state with the given name, ID, and optional extra properties used to qualify the lookup.

-   TypeScript
-   Python
-   Go
-   C#
-   Java
-   YAML
-   HCL PREVIEW

```typescript
public static get(name: string, id: Input<ID>, state?: BucketServerSideEncryptionConfigurationV2State, opts?: CustomResourceOptions): BucketServerSideEncryptionConfigurationV2
```

```python
@staticmethod
def get(resource_name: str,
        id: str,
        opts: Optional[ResourceOptions] = None,
        bucket: Optional[str] = None,
        expected_bucket_owner: Optional[str] = None,
        region: Optional[str] = None,
        rules: Optional[Sequence[BucketServerSideEncryptionConfigurationV2RuleArgs]] = None) -> BucketServerSideEncryptionConfigurationV2
```

```go
func GetBucketServerSideEncryptionConfigurationV2(ctx *Context, name string, id IDInput, state *BucketServerSideEncryptionConfigurationV2State, opts ...ResourceOption) (*BucketServerSideEncryptionConfigurationV2, error)
```

```csharp
public static BucketServerSideEncryptionConfigurationV2 Get(string name, Input<string> id, BucketServerSideEncryptionConfigurationV2State? state, CustomResourceOptions? opts = null)
```

```java
public static BucketServerSideEncryptionConfigurationV2 get(String name, Output<String> id, BucketServerSideEncryptionConfigurationV2State state, CustomResourceOptions options)
```

```yaml
resources:  _:    type: aws:s3:BucketServerSideEncryptionConfigurationV2    get:      id: ${id}
```

```hcl
import {
  to = aws_s3_bucketserversideencryptionconfigurationv2.example
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

[Bucket](#state_bucket_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

ID (name) of the bucket.

[ExpectedBucketOwner](#state_expectedbucketowner_csharp) string

Account ID of the expected bucket owner.

Deprecated: expected\_bucket\_owner is deprecated. It will be removed in a future verion of the provider.

[Region](#state_region_csharp) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[Rules](#state_rules_csharp) [List<BucketServerSideEncryptionConfigurationV2Rule>](#bucketserversideencryptionconfigurationv2rule)

Set of server-side encryption configuration rules. See below. Currently, only a single rule is supported.

[Bucket](#state_bucket_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

ID (name) of the bucket.

[ExpectedBucketOwner](#state_expectedbucketowner_go) string

Account ID of the expected bucket owner.

Deprecated: expected\_bucket\_owner is deprecated. It will be removed in a future verion of the provider.

[Region](#state_region_go) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[Rules](#state_rules_go) [\[\]BucketServerSideEncryptionConfigurationV2RuleArgs](#bucketserversideencryptionconfigurationv2rule)

Set of server-side encryption configuration rules. See below. Currently, only a single rule is supported.

[bucket](#state_bucket_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

ID (name) of the bucket.

[expected\_bucket\_owner](#state_expected_bucket_owner_hcl) string

Account ID of the expected bucket owner.

Deprecated: expected\_bucket\_owner is deprecated. It will be removed in a future verion of the provider.

[region](#state_region_hcl) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[rules](#state_rules_hcl) [list(object)](#bucketserversideencryptionconfigurationv2rule)

Set of server-side encryption configuration rules. See below. Currently, only a single rule is supported.

[bucket](#state_bucket_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

ID (name) of the bucket.

[expectedBucketOwner](#state_expectedbucketowner_java) String

Account ID of the expected bucket owner.

Deprecated: expected\_bucket\_owner is deprecated. It will be removed in a future verion of the provider.

[region](#state_region_java) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[rules](#state_rules_java) [List<BucketServerSideEncryptionConfigurationV2Rule>](#bucketserversideencryptionconfigurationv2rule)

Set of server-side encryption configuration rules. See below. Currently, only a single rule is supported.

[bucket](#state_bucket_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

ID (name) of the bucket.

[expectedBucketOwner](#state_expectedbucketowner_nodejs) string

Account ID of the expected bucket owner.

Deprecated: expected\_bucket\_owner is deprecated. It will be removed in a future verion of the provider.

[region](#state_region_nodejs) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[rules](#state_rules_nodejs) [BucketServerSideEncryptionConfigurationV2Rule\[\]](#bucketserversideencryptionconfigurationv2rule)

Set of server-side encryption configuration rules. See below. Currently, only a single rule is supported.

[bucket](#state_bucket_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

ID (name) of the bucket.

[expected\_bucket\_owner](#state_expected_bucket_owner_python) str

Account ID of the expected bucket owner.

Deprecated: expected\_bucket\_owner is deprecated. It will be removed in a future verion of the provider.

[region](#state_region_python) str

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[rules](#state_rules_python) [Sequence\[BucketServerSideEncryptionConfigurationV2RuleArgs\]](#bucketserversideencryptionconfigurationv2rule)

Set of server-side encryption configuration rules. See below. Currently, only a single rule is supported.

[bucket](#state_bucket_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

ID (name) of the bucket.

[expectedBucketOwner](#state_expectedbucketowner_yaml) String

Account ID of the expected bucket owner.

Deprecated: expected\_bucket\_owner is deprecated. It will be removed in a future verion of the provider.

[region](#state_region_yaml) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[rules](#state_rules_yaml) [List<Property Map>](#bucketserversideencryptionconfigurationv2rule)

Set of server-side encryption configuration rules. See below. Currently, only a single rule is supported.

## Supporting Types[](#supporting-types)

#### BucketServerSideEncryptionConfigurationV2Rule

, BucketServerSideEncryptionConfigurationV2RuleArgs

[](#bucketserversideencryptionconfigurationv2rule)

[ApplyServerSideEncryptionByDefault](#applyserversideencryptionbydefault_csharp) [BucketServerSideEncryptionConfigurationV2RuleApplyServerSideEncryptionByDefault](#bucketserversideencryptionconfigurationv2ruleapplyserversideencryptionbydefault)

Single object for setting server-side encryption by default. See below.

[BlockedEncryptionTypes](#blockedencryptiontypes_csharp) List<string>

List of server-side encryption types to block for object uploads. Valid values are `SSE-C` (blocks uploads using server-side encryption with customer-provided keys) and `NONE` (unblocks all encryption types). Starting in March 2026, Amazon S3 will automatically block SSE-C uploads for all new buckets.

[BucketKeyEnabled](#bucketkeyenabled_csharp) bool

Whether or not to use [Amazon S3 Bucket Keys](https://docs.aws.amazon.com/AmazonS3/latest/dev/bucket-key.html) for SSE-KMS.

[ApplyServerSideEncryptionByDefault](#applyserversideencryptionbydefault_go) [BucketServerSideEncryptionConfigurationV2RuleApplyServerSideEncryptionByDefault](#bucketserversideencryptionconfigurationv2ruleapplyserversideencryptionbydefault)

Single object for setting server-side encryption by default. See below.

[BlockedEncryptionTypes](#blockedencryptiontypes_go) \[\]string

List of server-side encryption types to block for object uploads. Valid values are `SSE-C` (blocks uploads using server-side encryption with customer-provided keys) and `NONE` (unblocks all encryption types). Starting in March 2026, Amazon S3 will automatically block SSE-C uploads for all new buckets.

[BucketKeyEnabled](#bucketkeyenabled_go) bool

Whether or not to use [Amazon S3 Bucket Keys](https://docs.aws.amazon.com/AmazonS3/latest/dev/bucket-key.html) for SSE-KMS.

[apply\_server\_side\_encryption\_by\_default](#apply_server_side_encryption_by_default_hcl) [object](#bucketserversideencryptionconfigurationv2ruleapplyserversideencryptionbydefault)

Single object for setting server-side encryption by default. See below.

[blocked\_encryption\_types](#blocked_encryption_types_hcl) list(string)

List of server-side encryption types to block for object uploads. Valid values are `SSE-C` (blocks uploads using server-side encryption with customer-provided keys) and `NONE` (unblocks all encryption types). Starting in March 2026, Amazon S3 will automatically block SSE-C uploads for all new buckets.

[bucket\_key\_enabled](#bucket_key_enabled_hcl) bool

Whether or not to use [Amazon S3 Bucket Keys](https://docs.aws.amazon.com/AmazonS3/latest/dev/bucket-key.html) for SSE-KMS.

[applyServerSideEncryptionByDefault](#applyserversideencryptionbydefault_java) [BucketServerSideEncryptionConfigurationV2RuleApplyServerSideEncryptionByDefault](#bucketserversideencryptionconfigurationv2ruleapplyserversideencryptionbydefault)

Single object for setting server-side encryption by default. See below.

[blockedEncryptionTypes](#blockedencryptiontypes_java) List<String>

List of server-side encryption types to block for object uploads. Valid values are `SSE-C` (blocks uploads using server-side encryption with customer-provided keys) and `NONE` (unblocks all encryption types). Starting in March 2026, Amazon S3 will automatically block SSE-C uploads for all new buckets.

[bucketKeyEnabled](#bucketkeyenabled_java) Boolean

Whether or not to use [Amazon S3 Bucket Keys](https://docs.aws.amazon.com/AmazonS3/latest/dev/bucket-key.html) for SSE-KMS.

[applyServerSideEncryptionByDefault](#applyserversideencryptionbydefault_nodejs) [BucketServerSideEncryptionConfigurationV2RuleApplyServerSideEncryptionByDefault](#bucketserversideencryptionconfigurationv2ruleapplyserversideencryptionbydefault)

Single object for setting server-side encryption by default. See below.

[blockedEncryptionTypes](#blockedencryptiontypes_nodejs) string\[\]

List of server-side encryption types to block for object uploads. Valid values are `SSE-C` (blocks uploads using server-side encryption with customer-provided keys) and `NONE` (unblocks all encryption types). Starting in March 2026, Amazon S3 will automatically block SSE-C uploads for all new buckets.

[bucketKeyEnabled](#bucketkeyenabled_nodejs) boolean

Whether or not to use [Amazon S3 Bucket Keys](https://docs.aws.amazon.com/AmazonS3/latest/dev/bucket-key.html) for SSE-KMS.

[apply\_server\_side\_encryption\_by\_default](#apply_server_side_encryption_by_default_python) [BucketServerSideEncryptionConfigurationV2RuleApplyServerSideEncryptionByDefault](#bucketserversideencryptionconfigurationv2ruleapplyserversideencryptionbydefault)

Single object for setting server-side encryption by default. See below.

[blocked\_encryption\_types](#blocked_encryption_types_python) Sequence\[str\]

List of server-side encryption types to block for object uploads. Valid values are `SSE-C` (blocks uploads using server-side encryption with customer-provided keys) and `NONE` (unblocks all encryption types). Starting in March 2026, Amazon S3 will automatically block SSE-C uploads for all new buckets.

[bucket\_key\_enabled](#bucket_key_enabled_python) bool

Whether or not to use [Amazon S3 Bucket Keys](https://docs.aws.amazon.com/AmazonS3/latest/dev/bucket-key.html) for SSE-KMS.

[applyServerSideEncryptionByDefault](#applyserversideencryptionbydefault_yaml) [Property Map](#bucketserversideencryptionconfigurationv2ruleapplyserversideencryptionbydefault)

Single object for setting server-side encryption by default. See below.

[blockedEncryptionTypes](#blockedencryptiontypes_yaml) List<String>

List of server-side encryption types to block for object uploads. Valid values are `SSE-C` (blocks uploads using server-side encryption with customer-provided keys) and `NONE` (unblocks all encryption types). Starting in March 2026, Amazon S3 will automatically block SSE-C uploads for all new buckets.

[bucketKeyEnabled](#bucketkeyenabled_yaml) Boolean

Whether or not to use [Amazon S3 Bucket Keys](https://docs.aws.amazon.com/AmazonS3/latest/dev/bucket-key.html) for SSE-KMS.

#### BucketServerSideEncryptionConfigurationV2RuleApplyServerSideEncryptionByDefault

, BucketServerSideEncryptionConfigurationV2RuleApplyServerSideEncryptionByDefaultArgs

[](#bucketserversideencryptionconfigurationv2ruleapplyserversideencryptionbydefault)

[SseAlgorithm](#ssealgorithm_csharp) This property is required. string

Server-side encryption algorithm to use. Valid values are `AES256`, `aws:kms`, and `aws:kms:dsse`

[KmsMasterKeyId](#kmsmasterkeyid_csharp) string

AWS KMS master key ID used for the SSE-KMS encryption. This can only be used when you set the value of `sseAlgorithm` as `aws:kms`. The default `aws/s3` AWS KMS master key is used if this element is absent while the `sseAlgorithm` is `aws:kms`.

[SseAlgorithm](#ssealgorithm_go) This property is required. string

Server-side encryption algorithm to use. Valid values are `AES256`, `aws:kms`, and `aws:kms:dsse`

[KmsMasterKeyId](#kmsmasterkeyid_go) string

AWS KMS master key ID used for the SSE-KMS encryption. This can only be used when you set the value of `sseAlgorithm` as `aws:kms`. The default `aws/s3` AWS KMS master key is used if this element is absent while the `sseAlgorithm` is `aws:kms`.

[sse\_algorithm](#sse_algorithm_hcl) This property is required. string

Server-side encryption algorithm to use. Valid values are `AES256`, `aws:kms`, and `aws:kms:dsse`

[kms\_master\_key\_id](#kms_master_key_id_hcl) string

AWS KMS master key ID used for the SSE-KMS encryption. This can only be used when you set the value of `sseAlgorithm` as `aws:kms`. The default `aws/s3` AWS KMS master key is used if this element is absent while the `sseAlgorithm` is `aws:kms`.

[sseAlgorithm](#ssealgorithm_java) This property is required. String

Server-side encryption algorithm to use. Valid values are `AES256`, `aws:kms`, and `aws:kms:dsse`

[kmsMasterKeyId](#kmsmasterkeyid_java) String

AWS KMS master key ID used for the SSE-KMS encryption. This can only be used when you set the value of `sseAlgorithm` as `aws:kms`. The default `aws/s3` AWS KMS master key is used if this element is absent while the `sseAlgorithm` is `aws:kms`.

[sseAlgorithm](#ssealgorithm_nodejs) This property is required. string

Server-side encryption algorithm to use. Valid values are `AES256`, `aws:kms`, and `aws:kms:dsse`

[kmsMasterKeyId](#kmsmasterkeyid_nodejs) string

AWS KMS master key ID used for the SSE-KMS encryption. This can only be used when you set the value of `sseAlgorithm` as `aws:kms`. The default `aws/s3` AWS KMS master key is used if this element is absent while the `sseAlgorithm` is `aws:kms`.

[sse\_algorithm](#sse_algorithm_python) This property is required. str

Server-side encryption algorithm to use. Valid values are `AES256`, `aws:kms`, and `aws:kms:dsse`

[kms\_master\_key\_id](#kms_master_key_id_python) str

AWS KMS master key ID used for the SSE-KMS encryption. This can only be used when you set the value of `sseAlgorithm` as `aws:kms`. The default `aws/s3` AWS KMS master key is used if this element is absent while the `sseAlgorithm` is `aws:kms`.

[sseAlgorithm](#ssealgorithm_yaml) This property is required. String

Server-side encryption algorithm to use. Valid values are `AES256`, `aws:kms`, and `aws:kms:dsse`

[kmsMasterKeyId](#kmsmasterkeyid_yaml) String

AWS KMS master key ID used for the SSE-KMS encryption. This can only be used when you set the value of `sseAlgorithm` as `aws:kms`. The default `aws/s3` AWS KMS master key is used if this element is absent while the `sseAlgorithm` is `aws:kms`.

## Import[](#import)

### Identity Schema[](#identity-schema)

#### Required[](#required)

-   `bucket` (String) S3 bucket name.

#### Optional[](#optional)

-   `accountId` (String) AWS Account where this resource is managed.
-   `region` (String) Region where this resource is managed.

If the owner (account ID) of the source bucket differs from the account used to configure the AWS Provider, import using the `bucket` and `expectedBucketOwner` separated by a comma (`,`):

**Using `pulumi import` to import** S3 bucket server-side encryption configuration using the `bucket` or using the `bucket` and `expectedBucketOwner` separated by a comma (`,`). For example:

If the owner (account ID) of the source bucket is the same account used to configure the AWS Provider, import using the `bucket`:

```bash
$ pulumi import aws:s3/bucketServerSideEncryptionConfigurationV2:BucketServerSideEncryptionConfigurationV2 example bucket-name
```

If the owner (account ID) of the source bucket differs from the account used to configure the AWS Provider, import using the `bucket` and `expectedBucketOwner` separated by a comma (`,`):

```bash
$ pulumi import aws:s3/bucketServerSideEncryptionConfigurationV2:BucketServerSideEncryptionConfigurationV2 example bucket-name,123456789012
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

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2fs3%2fbucketserversideencryptionconfigurationv2]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2fs3%2fbucketserversideencryptionconfigurationv2%2f\))

#### Try Pulumi Cloud free.
Your team will thank you.

[Start free trial](https://app.pulumi.com/signup?utm_source=registry&utm_medium=right-rail-banner&utm_campaign=try-pulumi-cloud&iaid=docs-try-pulumi-cloud-ad)
