---
Source: https://www.pulumi.com/registry/packages/aws/api-docs/s3/bucketpublicaccessblock/
Generated: 2026-06-06
Updated: 2026-06-06
---

# aws.s3.BucketPublicAccessBlock

1.  [Packages](/registry/)
2.  [Packages](/registry/packages/)
3.  [AWS](/registry/packages/aws/)
4.  [API Docs](/registry/packages/aws/api-docs/)
5.  [s3](/registry/packages/aws/api-docs/s3/)
6.  [BucketPublicAccessBlock](/registry/packages/aws/api-docs/s3/bucketpublicaccessblock/)

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

Viewing docs for AWS v7.32.0
published on Friday, May 29, 2026 by Pulumi

[Schema (JSON)](/registry/packages/aws/schema.json)

[pulumi/pulumi-aws](https://github.com/pulumi/pulumi-aws)

v7.32.0 (7.x, latest)v6.83.1 (6.x)v5.43.0 (5.x)

# aws.s3.BucketPublicAccessBlock[](#aws-s3-bucketpublicaccessblock)

Explore with Neo

-   Copy Page

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2fs3%2fbucketpublicaccessblock]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2fs3%2fbucketpublicaccessblock%2f\))

Manages S3 bucket-level Public Access Block configuration. For more information about these settings, see the [AWS S3 Block Public Access documentation](https://docs.aws.amazon.com/AmazonS3/latest/dev/access-control-block-public-access.html).

> This resource cannot be used with S3 directory buckets.

> Setting `skipDestroy` to `true` means that the AWS Provider will not destroy a public access block, even when running `terraform destroy`. The configuration is thus an intentional dangling resource that is not managed by Terraform and will remain in-place in your AWS account.

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

const example = new aws.s3.Bucket("example", {bucket: "example"});
const exampleBucketPublicAccessBlock = new aws.s3.BucketPublicAccessBlock("example", {
    bucket: example.id,
    blockPublicAcls: true,
    blockPublicPolicy: true,
    ignorePublicAcls: true,
    restrictPublicBuckets: true,
});
```

```python
import pulumi
import pulumi_aws as aws

example = aws.s3.Bucket("example", bucket="example")
example_bucket_public_access_block = aws.s3.BucketPublicAccessBlock("example",
    bucket=example.id,
    block_public_acls=True,
    block_public_policy=True,
    ignore_public_acls=True,
    restrict_public_buckets=True)
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/s3"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		example, err := s3.NewBucket(ctx, "example", &s3.BucketArgs{
			Bucket: pulumi.String("example"),
		})
		if err != nil {
			return err
		}
		_, err = s3.NewBucketPublicAccessBlock(ctx, "example", &s3.BucketPublicAccessBlockArgs{
			Bucket:                example.ID(),
			BlockPublicAcls:       pulumi.Bool(true),
			BlockPublicPolicy:     pulumi.Bool(true),
			IgnorePublicAcls:      pulumi.Bool(true),
			RestrictPublicBuckets: pulumi.Bool(true),
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
    var example = new Aws.S3.Bucket("example", new()
    {
        BucketName = "example",
    });

    var exampleBucketPublicAccessBlock = new Aws.S3.BucketPublicAccessBlock("example", new()
    {
        Bucket = example.Id,
        BlockPublicAcls = true,
        BlockPublicPolicy = true,
        IgnorePublicAcls = true,
        RestrictPublicBuckets = true,
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.s3.Bucket;
import com.pulumi.aws.s3.BucketArgs;
import com.pulumi.aws.s3.BucketPublicAccessBlock;
import com.pulumi.aws.s3.BucketPublicAccessBlockArgs;
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
        var example = new Bucket("example", BucketArgs.builder()
            .bucket("example")
            .build());

        var exampleBucketPublicAccessBlock = new BucketPublicAccessBlock("exampleBucketPublicAccessBlock", BucketPublicAccessBlockArgs.builder()
            .bucket(example.id())
            .blockPublicAcls(true)
            .blockPublicPolicy(true)
            .ignorePublicAcls(true)
            .restrictPublicBuckets(true)
            .build());

    }
}
```

```yaml
resources:
  example:
    type: aws:s3:Bucket
    properties:
      bucket: example
  exampleBucketPublicAccessBlock:
    type: aws:s3:BucketPublicAccessBlock
    name: example
    properties:
      bucket: ${example.id}
      blockPublicAcls: true
      blockPublicPolicy: true
      ignorePublicAcls: true
      restrictPublicBuckets: true
```

```hcl
pulumi {
  required_providers {
    aws = {
      source = "pulumi/aws"
    }
  }
}

resource "aws_s3_bucket" "example" {
  bucket = "example"
}
resource "aws_s3_bucketpublicaccessblock" "example" {
  bucket                  = aws_s3_bucket.example.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
```

## Create BucketPublicAccessBlock Resource[](#create)

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
new BucketPublicAccessBlock(name: string, args: BucketPublicAccessBlockArgs, opts?: CustomResourceOptions);
```

```python
@overload
def BucketPublicAccessBlock(resource_name: str,
                            args: BucketPublicAccessBlockArgs,
                            opts: Optional[ResourceOptions] = None)

@overload
def BucketPublicAccessBlock(resource_name: str,
                            opts: Optional[ResourceOptions] = None,
                            bucket: Optional[str] = None,
                            block_public_acls: Optional[bool] = None,
                            block_public_policy: Optional[bool] = None,
                            ignore_public_acls: Optional[bool] = None,
                            region: Optional[str] = None,
                            restrict_public_buckets: Optional[bool] = None,
                            skip_destroy: Optional[bool] = None)
```

```go
func NewBucketPublicAccessBlock(ctx *Context, name string, args BucketPublicAccessBlockArgs, opts ...ResourceOption) (*BucketPublicAccessBlock, error)
```

```csharp
public BucketPublicAccessBlock(string name, BucketPublicAccessBlockArgs args, CustomResourceOptions? opts = null)
```

```java
public BucketPublicAccessBlock(String name, BucketPublicAccessBlockArgs args)
public BucketPublicAccessBlock(String name, BucketPublicAccessBlockArgs args, CustomResourceOptions options)
```

```yaml
type: aws:s3:BucketPublicAccessBlock
properties: # The arguments to resource properties.
options: # Bag of options to control resource's behavior.
```

```hcl
resource "aws_s3_bucketpublicaccessblock" "name" {
    # resource properties
}
```

#### Parameters[](#parameters)

name This property is required. string

The unique name of the resource.

args This property is required. [BucketPublicAccessBlockArgs](#inputs)

The arguments to resource properties.

opts [CustomResourceOptions](/docs/reference/pkg/nodejs/pulumi/pulumi/#CustomResourceOptions)

Bag of options to control resource's behavior.

resource\_name This property is required. str

The unique name of the resource.

args This property is required. [BucketPublicAccessBlockArgs](#inputs)

The arguments to resource properties.

opts [ResourceOptions](/docs/reference/pkg/python/pulumi/#pulumi.ResourceOptions)

Bag of options to control resource's behavior.

ctx [Context](https://pkg.go.dev/github.com/pulumi/pulumi/sdk/v3/go/pulumi?tab=doc#Context)

Context object for the current deployment.

name This property is required. string

The unique name of the resource.

args This property is required. [BucketPublicAccessBlockArgs](#inputs)

The arguments to resource properties.

opts [ResourceOption](https://pkg.go.dev/github.com/pulumi/pulumi/sdk/v3/go/pulumi?tab=doc#ResourceOption)

Bag of options to control resource's behavior.

name This property is required. string

The unique name of the resource.

args This property is required. [BucketPublicAccessBlockArgs](#inputs)

The arguments to resource properties.

opts [CustomResourceOptions](/docs/reference/pkg/dotnet/Pulumi/Pulumi.CustomResourceOptions.html)

Bag of options to control resource's behavior.

name This property is required. String

The unique name of the resource.

args This property is required. [BucketPublicAccessBlockArgs](#inputs)

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
var bucketPublicAccessBlockResource = new Aws.S3.BucketPublicAccessBlock("bucketPublicAccessBlockResource", new()
{
    Bucket = "string",
    BlockPublicAcls = false,
    BlockPublicPolicy = false,
    IgnorePublicAcls = false,
    Region = "string",
    RestrictPublicBuckets = false,
    SkipDestroy = false,
});
```

```go
example, err := s3.NewBucketPublicAccessBlock(ctx, "bucketPublicAccessBlockResource", &s3.BucketPublicAccessBlockArgs{
	Bucket:                pulumi.String("string"),
	BlockPublicAcls:       pulumi.Bool(false),
	BlockPublicPolicy:     pulumi.Bool(false),
	IgnorePublicAcls:      pulumi.Bool(false),
	Region:                pulumi.String("string"),
	RestrictPublicBuckets: pulumi.Bool(false),
	SkipDestroy:           pulumi.Bool(false),
})
```

```hcl
resource "aws_s3_bucketpublicaccessblock" "bucketPublicAccessBlockResource" {
  bucket                  = "string"
  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  region                  = "string"
  restrict_public_buckets = false
  skip_destroy            = false
}
```

```java
var bucketPublicAccessBlockResource = new BucketPublicAccessBlock("bucketPublicAccessBlockResource", BucketPublicAccessBlockArgs.builder()
    .bucket("string")
    .blockPublicAcls(false)
    .blockPublicPolicy(false)
    .ignorePublicAcls(false)
    .region("string")
    .restrictPublicBuckets(false)
    .skipDestroy(false)
    .build());
```

```python
bucket_public_access_block_resource = aws.s3.BucketPublicAccessBlock("bucketPublicAccessBlockResource",
    bucket="string",
    block_public_acls=False,
    block_public_policy=False,
    ignore_public_acls=False,
    region="string",
    restrict_public_buckets=False,
    skip_destroy=False)
```

```typescript
const bucketPublicAccessBlockResource = new aws.s3.BucketPublicAccessBlock("bucketPublicAccessBlockResource", {
    bucket: "string",
    blockPublicAcls: false,
    blockPublicPolicy: false,
    ignorePublicAcls: false,
    region: "string",
    restrictPublicBuckets: false,
    skipDestroy: false,
});
```

```yaml
type: aws:s3:BucketPublicAccessBlock
properties:
    blockPublicAcls: false
    blockPublicPolicy: false
    bucket: string
    ignorePublicAcls: false
    region: string
    restrictPublicBuckets: false
    skipDestroy: false
```

## BucketPublicAccessBlock Resource Properties[](#properties)

To learn more about resource properties and how to use them, see [Inputs and Outputs](/docs/intro/concepts/inputs-outputs) in the Architecture and Concepts docs.

### Inputs[](#inputs)

In Python, inputs that are objects can be passed either as [argument classes or as dictionary literals](/docs/languages-sdks/python/#inputs-and-outputs).

The BucketPublicAccessBlock resource accepts the following [input](/docs/intro/concepts/inputs-outputs) properties:

[Bucket](#bucket_csharp)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

S3 Bucket to which this Public Access Block configuration should be applied.

[BlockPublicAcls](#blockpublicacls_csharp) bool

Whether Amazon S3 should block public ACLs for this bucket. Defaults to `false`. Enabling this setting does not affect existing policies or ACLs. When set to `true` causes the following behavior:

-   PUT Bucket ACL and PUT Object ACL calls will fail if the specified ACL allows public access.
-   PUT Object calls will fail if the request includes an object ACL.

[BlockPublicPolicy](#blockpublicpolicy_csharp) bool

Whether Amazon S3 should block public bucket policies for this bucket. Defaults to `false`. Enabling this setting does not affect the existing bucket policy. When set to `true` causes Amazon S3 to:

-   Reject calls to PUT Bucket policy if the specified bucket policy allows public access.

[IgnorePublicAcls](#ignorepublicacls_csharp) bool

Whether Amazon S3 should ignore public ACLs for this bucket. Defaults to `false`. Enabling this setting does not affect the persistence of any existing ACLs and doesn't prevent new public ACLs from being set. When set to `true` causes Amazon S3 to:

-   Ignore public ACLs on this bucket and any objects that it contains.

[Region](#region_csharp) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[RestrictPublicBuckets](#restrictpublicbuckets_csharp) bool

Whether Amazon S3 should restrict public bucket policies for this bucket. Defaults to `false`. Enabling this setting does not affect the previously stored bucket policy, except that public and cross-account access within the public bucket policy, including non-public delegation to specific accounts, is blocked. When set to `true`:

-   Only the bucket owner and AWS Services can access this buckets if it has a public policy.

[SkipDestroy](#skipdestroy_csharp) bool

Whether to retain the public access block upon destruction. If set to `true`, the resource is simply removed from state instead. This may be desirable in certain scenarios to prevent the removal of a public access block before deletion of the associated bucket.

[Bucket](#bucket_go)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

S3 Bucket to which this Public Access Block configuration should be applied.

[BlockPublicAcls](#blockpublicacls_go) bool

Whether Amazon S3 should block public ACLs for this bucket. Defaults to `false`. Enabling this setting does not affect existing policies or ACLs. When set to `true` causes the following behavior:

-   PUT Bucket ACL and PUT Object ACL calls will fail if the specified ACL allows public access.
-   PUT Object calls will fail if the request includes an object ACL.

[BlockPublicPolicy](#blockpublicpolicy_go) bool

Whether Amazon S3 should block public bucket policies for this bucket. Defaults to `false`. Enabling this setting does not affect the existing bucket policy. When set to `true` causes Amazon S3 to:

-   Reject calls to PUT Bucket policy if the specified bucket policy allows public access.

[IgnorePublicAcls](#ignorepublicacls_go) bool

Whether Amazon S3 should ignore public ACLs for this bucket. Defaults to `false`. Enabling this setting does not affect the persistence of any existing ACLs and doesn't prevent new public ACLs from being set. When set to `true` causes Amazon S3 to:

-   Ignore public ACLs on this bucket and any objects that it contains.

[Region](#region_go) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[RestrictPublicBuckets](#restrictpublicbuckets_go) bool

Whether Amazon S3 should restrict public bucket policies for this bucket. Defaults to `false`. Enabling this setting does not affect the previously stored bucket policy, except that public and cross-account access within the public bucket policy, including non-public delegation to specific accounts, is blocked. When set to `true`:

-   Only the bucket owner and AWS Services can access this buckets if it has a public policy.

[SkipDestroy](#skipdestroy_go) bool

Whether to retain the public access block upon destruction. If set to `true`, the resource is simply removed from state instead. This may be desirable in certain scenarios to prevent the removal of a public access block before deletion of the associated bucket.

[bucket](#bucket_hcl)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

S3 Bucket to which this Public Access Block configuration should be applied.

[block\_public\_acls](#block_public_acls_hcl) bool

Whether Amazon S3 should block public ACLs for this bucket. Defaults to `false`. Enabling this setting does not affect existing policies or ACLs. When set to `true` causes the following behavior:

-   PUT Bucket ACL and PUT Object ACL calls will fail if the specified ACL allows public access.
-   PUT Object calls will fail if the request includes an object ACL.

[block\_public\_policy](#block_public_policy_hcl) bool

Whether Amazon S3 should block public bucket policies for this bucket. Defaults to `false`. Enabling this setting does not affect the existing bucket policy. When set to `true` causes Amazon S3 to:

-   Reject calls to PUT Bucket policy if the specified bucket policy allows public access.

[ignore\_public\_acls](#ignore_public_acls_hcl) bool

Whether Amazon S3 should ignore public ACLs for this bucket. Defaults to `false`. Enabling this setting does not affect the persistence of any existing ACLs and doesn't prevent new public ACLs from being set. When set to `true` causes Amazon S3 to:

-   Ignore public ACLs on this bucket and any objects that it contains.

[region](#region_hcl) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[restrict\_public\_buckets](#restrict_public_buckets_hcl) bool

Whether Amazon S3 should restrict public bucket policies for this bucket. Defaults to `false`. Enabling this setting does not affect the previously stored bucket policy, except that public and cross-account access within the public bucket policy, including non-public delegation to specific accounts, is blocked. When set to `true`:

-   Only the bucket owner and AWS Services can access this buckets if it has a public policy.

[skip\_destroy](#skip_destroy_hcl) bool

Whether to retain the public access block upon destruction. If set to `true`, the resource is simply removed from state instead. This may be desirable in certain scenarios to prevent the removal of a public access block before deletion of the associated bucket.

[bucket](#bucket_java)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

String

S3 Bucket to which this Public Access Block configuration should be applied.

[blockPublicAcls](#blockpublicacls_java) Boolean

Whether Amazon S3 should block public ACLs for this bucket. Defaults to `false`. Enabling this setting does not affect existing policies or ACLs. When set to `true` causes the following behavior:

-   PUT Bucket ACL and PUT Object ACL calls will fail if the specified ACL allows public access.
-   PUT Object calls will fail if the request includes an object ACL.

[blockPublicPolicy](#blockpublicpolicy_java) Boolean

Whether Amazon S3 should block public bucket policies for this bucket. Defaults to `false`. Enabling this setting does not affect the existing bucket policy. When set to `true` causes Amazon S3 to:

-   Reject calls to PUT Bucket policy if the specified bucket policy allows public access.

[ignorePublicAcls](#ignorepublicacls_java) Boolean

Whether Amazon S3 should ignore public ACLs for this bucket. Defaults to `false`. Enabling this setting does not affect the persistence of any existing ACLs and doesn't prevent new public ACLs from being set. When set to `true` causes Amazon S3 to:

-   Ignore public ACLs on this bucket and any objects that it contains.

[region](#region_java) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[restrictPublicBuckets](#restrictpublicbuckets_java) Boolean

Whether Amazon S3 should restrict public bucket policies for this bucket. Defaults to `false`. Enabling this setting does not affect the previously stored bucket policy, except that public and cross-account access within the public bucket policy, including non-public delegation to specific accounts, is blocked. When set to `true`:

-   Only the bucket owner and AWS Services can access this buckets if it has a public policy.

[skipDestroy](#skipdestroy_java) Boolean

Whether to retain the public access block upon destruction. If set to `true`, the resource is simply removed from state instead. This may be desirable in certain scenarios to prevent the removal of a public access block before deletion of the associated bucket.

[bucket](#bucket_nodejs)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

S3 Bucket to which this Public Access Block configuration should be applied.

[blockPublicAcls](#blockpublicacls_nodejs) boolean

Whether Amazon S3 should block public ACLs for this bucket. Defaults to `false`. Enabling this setting does not affect existing policies or ACLs. When set to `true` causes the following behavior:

-   PUT Bucket ACL and PUT Object ACL calls will fail if the specified ACL allows public access.
-   PUT Object calls will fail if the request includes an object ACL.

[blockPublicPolicy](#blockpublicpolicy_nodejs) boolean

Whether Amazon S3 should block public bucket policies for this bucket. Defaults to `false`. Enabling this setting does not affect the existing bucket policy. When set to `true` causes Amazon S3 to:

-   Reject calls to PUT Bucket policy if the specified bucket policy allows public access.

[ignorePublicAcls](#ignorepublicacls_nodejs) boolean

Whether Amazon S3 should ignore public ACLs for this bucket. Defaults to `false`. Enabling this setting does not affect the persistence of any existing ACLs and doesn't prevent new public ACLs from being set. When set to `true` causes Amazon S3 to:

-   Ignore public ACLs on this bucket and any objects that it contains.

[region](#region_nodejs) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[restrictPublicBuckets](#restrictpublicbuckets_nodejs) boolean

Whether Amazon S3 should restrict public bucket policies for this bucket. Defaults to `false`. Enabling this setting does not affect the previously stored bucket policy, except that public and cross-account access within the public bucket policy, including non-public delegation to specific accounts, is blocked. When set to `true`:

-   Only the bucket owner and AWS Services can access this buckets if it has a public policy.

[skipDestroy](#skipdestroy_nodejs) boolean

Whether to retain the public access block upon destruction. If set to `true`, the resource is simply removed from state instead. This may be desirable in certain scenarios to prevent the removal of a public access block before deletion of the associated bucket.

[bucket](#bucket_python)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

str

S3 Bucket to which this Public Access Block configuration should be applied.

[block\_public\_acls](#block_public_acls_python) bool

Whether Amazon S3 should block public ACLs for this bucket. Defaults to `false`. Enabling this setting does not affect existing policies or ACLs. When set to `true` causes the following behavior:

-   PUT Bucket ACL and PUT Object ACL calls will fail if the specified ACL allows public access.
-   PUT Object calls will fail if the request includes an object ACL.

[block\_public\_policy](#block_public_policy_python) bool

Whether Amazon S3 should block public bucket policies for this bucket. Defaults to `false`. Enabling this setting does not affect the existing bucket policy. When set to `true` causes Amazon S3 to:

-   Reject calls to PUT Bucket policy if the specified bucket policy allows public access.

[ignore\_public\_acls](#ignore_public_acls_python) bool

Whether Amazon S3 should ignore public ACLs for this bucket. Defaults to `false`. Enabling this setting does not affect the persistence of any existing ACLs and doesn't prevent new public ACLs from being set. When set to `true` causes Amazon S3 to:

-   Ignore public ACLs on this bucket and any objects that it contains.

[region](#region_python) str

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[restrict\_public\_buckets](#restrict_public_buckets_python) bool

Whether Amazon S3 should restrict public bucket policies for this bucket. Defaults to `false`. Enabling this setting does not affect the previously stored bucket policy, except that public and cross-account access within the public bucket policy, including non-public delegation to specific accounts, is blocked. When set to `true`:

-   Only the bucket owner and AWS Services can access this buckets if it has a public policy.

[skip\_destroy](#skip_destroy_python) bool

Whether to retain the public access block upon destruction. If set to `true`, the resource is simply removed from state instead. This may be desirable in certain scenarios to prevent the removal of a public access block before deletion of the associated bucket.

[bucket](#bucket_yaml)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

String

S3 Bucket to which this Public Access Block configuration should be applied.

[blockPublicAcls](#blockpublicacls_yaml) Boolean

Whether Amazon S3 should block public ACLs for this bucket. Defaults to `false`. Enabling this setting does not affect existing policies or ACLs. When set to `true` causes the following behavior:

-   PUT Bucket ACL and PUT Object ACL calls will fail if the specified ACL allows public access.
-   PUT Object calls will fail if the request includes an object ACL.

[blockPublicPolicy](#blockpublicpolicy_yaml) Boolean

Whether Amazon S3 should block public bucket policies for this bucket. Defaults to `false`. Enabling this setting does not affect the existing bucket policy. When set to `true` causes Amazon S3 to:

-   Reject calls to PUT Bucket policy if the specified bucket policy allows public access.

[ignorePublicAcls](#ignorepublicacls_yaml) Boolean

Whether Amazon S3 should ignore public ACLs for this bucket. Defaults to `false`. Enabling this setting does not affect the persistence of any existing ACLs and doesn't prevent new public ACLs from being set. When set to `true` causes Amazon S3 to:

-   Ignore public ACLs on this bucket and any objects that it contains.

[region](#region_yaml) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[restrictPublicBuckets](#restrictpublicbuckets_yaml) Boolean

Whether Amazon S3 should restrict public bucket policies for this bucket. Defaults to `false`. Enabling this setting does not affect the previously stored bucket policy, except that public and cross-account access within the public bucket policy, including non-public delegation to specific accounts, is blocked. When set to `true`:

-   Only the bucket owner and AWS Services can access this buckets if it has a public policy.

[skipDestroy](#skipdestroy_yaml) Boolean

Whether to retain the public access block upon destruction. If set to `true`, the resource is simply removed from state instead. This may be desirable in certain scenarios to prevent the removal of a public access block before deletion of the associated bucket.

### Outputs[](#outputs)

All [input](#inputs) properties are implicitly available as output properties. Additionally, the BucketPublicAccessBlock resource produces the following output properties:

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

## Look up Existing BucketPublicAccessBlock Resource[](#look-up)

Get an existing BucketPublicAccessBlock resource’s state with the given name, ID, and optional extra properties used to qualify the lookup.

-   TypeScript
-   Python
-   Go
-   C#
-   Java
-   YAML
-   HCL PREVIEW

```typescript
public static get(name: string, id: Input<ID>, state?: BucketPublicAccessBlockState, opts?: CustomResourceOptions): BucketPublicAccessBlock
```

```python
@staticmethod
def get(resource_name: str,
        id: str,
        opts: Optional[ResourceOptions] = None,
        block_public_acls: Optional[bool] = None,
        block_public_policy: Optional[bool] = None,
        bucket: Optional[str] = None,
        ignore_public_acls: Optional[bool] = None,
        region: Optional[str] = None,
        restrict_public_buckets: Optional[bool] = None,
        skip_destroy: Optional[bool] = None) -> BucketPublicAccessBlock
```

```go
func GetBucketPublicAccessBlock(ctx *Context, name string, id IDInput, state *BucketPublicAccessBlockState, opts ...ResourceOption) (*BucketPublicAccessBlock, error)
```

```csharp
public static BucketPublicAccessBlock Get(string name, Input<string> id, BucketPublicAccessBlockState? state, CustomResourceOptions? opts = null)
```

```java
public static BucketPublicAccessBlock get(String name, Output<String> id, BucketPublicAccessBlockState state, CustomResourceOptions options)
```

```yaml
resources:  _:    type: aws:s3:BucketPublicAccessBlock    get:      id: ${id}
```

```hcl
import {
  to = aws_s3_bucketpublicaccessblock.example
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

[BlockPublicAcls](#state_blockpublicacls_csharp) bool

Whether Amazon S3 should block public ACLs for this bucket. Defaults to `false`. Enabling this setting does not affect existing policies or ACLs. When set to `true` causes the following behavior:

-   PUT Bucket ACL and PUT Object ACL calls will fail if the specified ACL allows public access.
-   PUT Object calls will fail if the request includes an object ACL.

[BlockPublicPolicy](#state_blockpublicpolicy_csharp) bool

Whether Amazon S3 should block public bucket policies for this bucket. Defaults to `false`. Enabling this setting does not affect the existing bucket policy. When set to `true` causes Amazon S3 to:

-   Reject calls to PUT Bucket policy if the specified bucket policy allows public access.

[Bucket](#state_bucket_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

S3 Bucket to which this Public Access Block configuration should be applied.

[IgnorePublicAcls](#state_ignorepublicacls_csharp) bool

Whether Amazon S3 should ignore public ACLs for this bucket. Defaults to `false`. Enabling this setting does not affect the persistence of any existing ACLs and doesn't prevent new public ACLs from being set. When set to `true` causes Amazon S3 to:

-   Ignore public ACLs on this bucket and any objects that it contains.

[Region](#state_region_csharp) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[RestrictPublicBuckets](#state_restrictpublicbuckets_csharp) bool

Whether Amazon S3 should restrict public bucket policies for this bucket. Defaults to `false`. Enabling this setting does not affect the previously stored bucket policy, except that public and cross-account access within the public bucket policy, including non-public delegation to specific accounts, is blocked. When set to `true`:

-   Only the bucket owner and AWS Services can access this buckets if it has a public policy.

[SkipDestroy](#state_skipdestroy_csharp) bool

Whether to retain the public access block upon destruction. If set to `true`, the resource is simply removed from state instead. This may be desirable in certain scenarios to prevent the removal of a public access block before deletion of the associated bucket.

[BlockPublicAcls](#state_blockpublicacls_go) bool

Whether Amazon S3 should block public ACLs for this bucket. Defaults to `false`. Enabling this setting does not affect existing policies or ACLs. When set to `true` causes the following behavior:

-   PUT Bucket ACL and PUT Object ACL calls will fail if the specified ACL allows public access.
-   PUT Object calls will fail if the request includes an object ACL.

[BlockPublicPolicy](#state_blockpublicpolicy_go) bool

Whether Amazon S3 should block public bucket policies for this bucket. Defaults to `false`. Enabling this setting does not affect the existing bucket policy. When set to `true` causes Amazon S3 to:

-   Reject calls to PUT Bucket policy if the specified bucket policy allows public access.

[Bucket](#state_bucket_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

S3 Bucket to which this Public Access Block configuration should be applied.

[IgnorePublicAcls](#state_ignorepublicacls_go) bool

Whether Amazon S3 should ignore public ACLs for this bucket. Defaults to `false`. Enabling this setting does not affect the persistence of any existing ACLs and doesn't prevent new public ACLs from being set. When set to `true` causes Amazon S3 to:

-   Ignore public ACLs on this bucket and any objects that it contains.

[Region](#state_region_go) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[RestrictPublicBuckets](#state_restrictpublicbuckets_go) bool

Whether Amazon S3 should restrict public bucket policies for this bucket. Defaults to `false`. Enabling this setting does not affect the previously stored bucket policy, except that public and cross-account access within the public bucket policy, including non-public delegation to specific accounts, is blocked. When set to `true`:

-   Only the bucket owner and AWS Services can access this buckets if it has a public policy.

[SkipDestroy](#state_skipdestroy_go) bool

Whether to retain the public access block upon destruction. If set to `true`, the resource is simply removed from state instead. This may be desirable in certain scenarios to prevent the removal of a public access block before deletion of the associated bucket.

[block\_public\_acls](#state_block_public_acls_hcl) bool

Whether Amazon S3 should block public ACLs for this bucket. Defaults to `false`. Enabling this setting does not affect existing policies or ACLs. When set to `true` causes the following behavior:

-   PUT Bucket ACL and PUT Object ACL calls will fail if the specified ACL allows public access.
-   PUT Object calls will fail if the request includes an object ACL.

[block\_public\_policy](#state_block_public_policy_hcl) bool

Whether Amazon S3 should block public bucket policies for this bucket. Defaults to `false`. Enabling this setting does not affect the existing bucket policy. When set to `true` causes Amazon S3 to:

-   Reject calls to PUT Bucket policy if the specified bucket policy allows public access.

[bucket](#state_bucket_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

S3 Bucket to which this Public Access Block configuration should be applied.

[ignore\_public\_acls](#state_ignore_public_acls_hcl) bool

Whether Amazon S3 should ignore public ACLs for this bucket. Defaults to `false`. Enabling this setting does not affect the persistence of any existing ACLs and doesn't prevent new public ACLs from being set. When set to `true` causes Amazon S3 to:

-   Ignore public ACLs on this bucket and any objects that it contains.

[region](#state_region_hcl) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[restrict\_public\_buckets](#state_restrict_public_buckets_hcl) bool

Whether Amazon S3 should restrict public bucket policies for this bucket. Defaults to `false`. Enabling this setting does not affect the previously stored bucket policy, except that public and cross-account access within the public bucket policy, including non-public delegation to specific accounts, is blocked. When set to `true`:

-   Only the bucket owner and AWS Services can access this buckets if it has a public policy.

[skip\_destroy](#state_skip_destroy_hcl) bool

Whether to retain the public access block upon destruction. If set to `true`, the resource is simply removed from state instead. This may be desirable in certain scenarios to prevent the removal of a public access block before deletion of the associated bucket.

[blockPublicAcls](#state_blockpublicacls_java) Boolean

Whether Amazon S3 should block public ACLs for this bucket. Defaults to `false`. Enabling this setting does not affect existing policies or ACLs. When set to `true` causes the following behavior:

-   PUT Bucket ACL and PUT Object ACL calls will fail if the specified ACL allows public access.
-   PUT Object calls will fail if the request includes an object ACL.

[blockPublicPolicy](#state_blockpublicpolicy_java) Boolean

Whether Amazon S3 should block public bucket policies for this bucket. Defaults to `false`. Enabling this setting does not affect the existing bucket policy. When set to `true` causes Amazon S3 to:

-   Reject calls to PUT Bucket policy if the specified bucket policy allows public access.

[bucket](#state_bucket_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

S3 Bucket to which this Public Access Block configuration should be applied.

[ignorePublicAcls](#state_ignorepublicacls_java) Boolean

Whether Amazon S3 should ignore public ACLs for this bucket. Defaults to `false`. Enabling this setting does not affect the persistence of any existing ACLs and doesn't prevent new public ACLs from being set. When set to `true` causes Amazon S3 to:

-   Ignore public ACLs on this bucket and any objects that it contains.

[region](#state_region_java) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[restrictPublicBuckets](#state_restrictpublicbuckets_java) Boolean

Whether Amazon S3 should restrict public bucket policies for this bucket. Defaults to `false`. Enabling this setting does not affect the previously stored bucket policy, except that public and cross-account access within the public bucket policy, including non-public delegation to specific accounts, is blocked. When set to `true`:

-   Only the bucket owner and AWS Services can access this buckets if it has a public policy.

[skipDestroy](#state_skipdestroy_java) Boolean

Whether to retain the public access block upon destruction. If set to `true`, the resource is simply removed from state instead. This may be desirable in certain scenarios to prevent the removal of a public access block before deletion of the associated bucket.

[blockPublicAcls](#state_blockpublicacls_nodejs) boolean

Whether Amazon S3 should block public ACLs for this bucket. Defaults to `false`. Enabling this setting does not affect existing policies or ACLs. When set to `true` causes the following behavior:

-   PUT Bucket ACL and PUT Object ACL calls will fail if the specified ACL allows public access.
-   PUT Object calls will fail if the request includes an object ACL.

[blockPublicPolicy](#state_blockpublicpolicy_nodejs) boolean

Whether Amazon S3 should block public bucket policies for this bucket. Defaults to `false`. Enabling this setting does not affect the existing bucket policy. When set to `true` causes Amazon S3 to:

-   Reject calls to PUT Bucket policy if the specified bucket policy allows public access.

[bucket](#state_bucket_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

S3 Bucket to which this Public Access Block configuration should be applied.

[ignorePublicAcls](#state_ignorepublicacls_nodejs) boolean

Whether Amazon S3 should ignore public ACLs for this bucket. Defaults to `false`. Enabling this setting does not affect the persistence of any existing ACLs and doesn't prevent new public ACLs from being set. When set to `true` causes Amazon S3 to:

-   Ignore public ACLs on this bucket and any objects that it contains.

[region](#state_region_nodejs) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[restrictPublicBuckets](#state_restrictpublicbuckets_nodejs) boolean

Whether Amazon S3 should restrict public bucket policies for this bucket. Defaults to `false`. Enabling this setting does not affect the previously stored bucket policy, except that public and cross-account access within the public bucket policy, including non-public delegation to specific accounts, is blocked. When set to `true`:

-   Only the bucket owner and AWS Services can access this buckets if it has a public policy.

[skipDestroy](#state_skipdestroy_nodejs) boolean

Whether to retain the public access block upon destruction. If set to `true`, the resource is simply removed from state instead. This may be desirable in certain scenarios to prevent the removal of a public access block before deletion of the associated bucket.

[block\_public\_acls](#state_block_public_acls_python) bool

Whether Amazon S3 should block public ACLs for this bucket. Defaults to `false`. Enabling this setting does not affect existing policies or ACLs. When set to `true` causes the following behavior:

-   PUT Bucket ACL and PUT Object ACL calls will fail if the specified ACL allows public access.
-   PUT Object calls will fail if the request includes an object ACL.

[block\_public\_policy](#state_block_public_policy_python) bool

Whether Amazon S3 should block public bucket policies for this bucket. Defaults to `false`. Enabling this setting does not affect the existing bucket policy. When set to `true` causes Amazon S3 to:

-   Reject calls to PUT Bucket policy if the specified bucket policy allows public access.

[bucket](#state_bucket_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

S3 Bucket to which this Public Access Block configuration should be applied.

[ignore\_public\_acls](#state_ignore_public_acls_python) bool

Whether Amazon S3 should ignore public ACLs for this bucket. Defaults to `false`. Enabling this setting does not affect the persistence of any existing ACLs and doesn't prevent new public ACLs from being set. When set to `true` causes Amazon S3 to:

-   Ignore public ACLs on this bucket and any objects that it contains.

[region](#state_region_python) str

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[restrict\_public\_buckets](#state_restrict_public_buckets_python) bool

Whether Amazon S3 should restrict public bucket policies for this bucket. Defaults to `false`. Enabling this setting does not affect the previously stored bucket policy, except that public and cross-account access within the public bucket policy, including non-public delegation to specific accounts, is blocked. When set to `true`:

-   Only the bucket owner and AWS Services can access this buckets if it has a public policy.

[skip\_destroy](#state_skip_destroy_python) bool

Whether to retain the public access block upon destruction. If set to `true`, the resource is simply removed from state instead. This may be desirable in certain scenarios to prevent the removal of a public access block before deletion of the associated bucket.

[blockPublicAcls](#state_blockpublicacls_yaml) Boolean

Whether Amazon S3 should block public ACLs for this bucket. Defaults to `false`. Enabling this setting does not affect existing policies or ACLs. When set to `true` causes the following behavior:

-   PUT Bucket ACL and PUT Object ACL calls will fail if the specified ACL allows public access.
-   PUT Object calls will fail if the request includes an object ACL.

[blockPublicPolicy](#state_blockpublicpolicy_yaml) Boolean

Whether Amazon S3 should block public bucket policies for this bucket. Defaults to `false`. Enabling this setting does not affect the existing bucket policy. When set to `true` causes Amazon S3 to:

-   Reject calls to PUT Bucket policy if the specified bucket policy allows public access.

[bucket](#state_bucket_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

S3 Bucket to which this Public Access Block configuration should be applied.

[ignorePublicAcls](#state_ignorepublicacls_yaml) Boolean

Whether Amazon S3 should ignore public ACLs for this bucket. Defaults to `false`. Enabling this setting does not affect the persistence of any existing ACLs and doesn't prevent new public ACLs from being set. When set to `true` causes Amazon S3 to:

-   Ignore public ACLs on this bucket and any objects that it contains.

[region](#state_region_yaml) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[restrictPublicBuckets](#state_restrictpublicbuckets_yaml) Boolean

Whether Amazon S3 should restrict public bucket policies for this bucket. Defaults to `false`. Enabling this setting does not affect the previously stored bucket policy, except that public and cross-account access within the public bucket policy, including non-public delegation to specific accounts, is blocked. When set to `true`:

-   Only the bucket owner and AWS Services can access this buckets if it has a public policy.

[skipDestroy](#state_skipdestroy_yaml) Boolean

Whether to retain the public access block upon destruction. If set to `true`, the resource is simply removed from state instead. This may be desirable in certain scenarios to prevent the removal of a public access block before deletion of the associated bucket.

## Import[](#import)

Using `pulumi import`, import `aws.s3.BucketPublicAccessBlock` using the bucket name. For example:

```bash
$ pulumi import aws:s3/bucketPublicAccessBlock:BucketPublicAccessBlock example my-bucket
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

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2fs3%2fbucketpublicaccessblock]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2fs3%2fbucketpublicaccessblock%2f\))

#### Try Pulumi Cloud free.
Your team will thank you.

[Start free trial](https://app.pulumi.com/signup?utm_source=registry&utm_medium=right-rail-banner&utm_campaign=try-pulumi-cloud&iaid=docs-try-pulumi-cloud-ad)
