---
Source: https://www.pulumi.com/registry/packages/aws/api-docs/s3/bucketv2/
Generated: 2026-06-06
Updated: 2026-06-06
---

# aws.s3.BucketV2

1.  [Packages](/registry/)
2.  [Packages](/registry/packages/)
3.  [AWS](/registry/packages/aws/)
4.  [API Docs](/registry/packages/aws/api-docs/)
5.  [s3](/registry/packages/aws/api-docs/s3/)
6.  [BucketV2](/registry/packages/aws/api-docs/s3/bucketv2/)

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

Viewing docs for AWS v7.32.0
published on Friday, May 29, 2026 by Pulumi

[Schema (JSON)](/registry/packages/aws/schema.json)

[pulumi/pulumi-aws](https://github.com/pulumi/pulumi-aws)

v7.32.0 (7.x, latest)v6.83.1 (6.x)v5.43.0 (5.x)

# aws.s3.BucketV2[](#aws-s3-bucketv2)

Explore with Neo

-   Copy Page

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2fs3%2fbucketv2]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2fs3%2fbucketv2%2f\))

Deprecated: s3.BucketV2 has been deprecated in favor of s3.Bucket

Provides a S3 bucket resource.

> This resource provides functionality for managing S3 general purpose buckets in an AWS Partition. To manage Amazon S3 Express directory buckets, use the `awsDirectoryBucket` resource. To manage [S3 on Outposts](https://docs.aws.amazon.com/AmazonS3/latest/dev/S3onOutposts.html), use the `aws.s3control.Bucket` resource.

> Object Lock can be enabled by using the `objectLockEnable` attribute or by using the `aws.s3.BucketObjectLockConfiguration` resource. Please note, that by using the resource, Object Lock can be enabled/disabled without destroying and recreating the bucket.

> To support ABAC (Attribute Based Access Control) in general purpose buckets, this resource will now attempt to send tags in the create request and use the S3 Control tagging APIs [`TagResource`](https://docs.aws.amazon.com/AmazonS3/latest/API/API_control_TagResource.html), [`UntagResource`](https://docs.aws.amazon.com/AmazonS3/latest/API/API_control_UntagResource.html), and [`ListTagsForResource`](https://docs.aws.amazon.com/AmazonS3/latest/API/API_control_ListTagsForResource.html) for read and update operations. The calling principal must have the corresponding `s3:TagResource`, `s3:UntagResource`, and `s3:ListTagsForResource` [IAM permissions](https://docs.aws.amazon.com/service-authorization/latest/reference/list_amazons3.html#amazons3-actions-as-permissions). If the principal lacks the appropriate permissions, the provider will fall back to tagging after creation and using the S3 tagging APIs [`PutBucketTagging`](https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutBucketTagging.html), [`DeleteBucketTagging`](https://docs.aws.amazon.com/AmazonS3/latest/API/API_DeleteBucketTagging.html), and [`GetBucketTagging`](https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetBucketTagging.html) instead. With ABAC enabled, tag modifications may fail with the fall back behavior. See the [AWS documentation](https://docs.aws.amazon.com/AmazonS3/latest/userguide/buckets-tagging-enable-abac.html) for additional details on enabling ABAC in general purpose buckets.

## Example Usage[](#example-usage)

### Private Bucket With Tags[](#private-bucket-with-tags)

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

const example = new aws.s3.Bucket("example", {
    bucket: "my-tf-test-bucket",
    tags: {
        Name: "My bucket",
        Environment: "Dev",
    },
});
```

```python
import pulumi
import pulumi_aws as aws

example = aws.s3.Bucket("example",
    bucket="my-tf-test-bucket",
    tags={
        "Name": "My bucket",
        "Environment": "Dev",
    })
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/s3"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		_, err := s3.NewBucket(ctx, "example", &s3.BucketArgs{
			Bucket: pulumi.String("my-tf-test-bucket"),
			Tags: pulumi.StringMap{
				"Name":        pulumi.String("My bucket"),
				"Environment": pulumi.String("Dev"),
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
    var example = new Aws.S3.Bucket("example", new()
    {
        BucketName = "my-tf-test-bucket",
        Tags =
        {
            { "Name", "My bucket" },
            { "Environment", "Dev" },
        },
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
            .bucket("my-tf-test-bucket")
            .tags(Map.ofEntries(
                Map.entry("Name", "My bucket"),
                Map.entry("Environment", "Dev")
            ))
            .build());

    }
}
```

```yaml
resources:
  example:
    type: aws:s3:Bucket
    properties:
      bucket: my-tf-test-bucket
      tags:
        Name: My bucket
        Environment: Dev
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
  bucket = "my-tf-test-bucket"
  tags = {
    "Name"        = "My bucket"
    "Environment" = "Dev"
  }
}
```

### Bucket In Account-Regional Namespace[](#bucket-in-account-regional-namespace)

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

const current = aws.getCallerIdentity({});
const currentGetRegion = aws.getRegion({});
const example = new aws.s3.Bucket("example", {
    bucket: std.format({
        input: "my-tf-test-bucket-%s-%s-an",
        args: [
            current.then(current => current.accountId),
            currentGetRegion.then(currentGetRegion => currentGetRegion.region),
        ],
    }).then(invoke => invoke.result),
    bucketNamespace: "account-regional",
});
```

```python
import pulumi
import pulumi_aws as aws
import pulumi_std as std

current = aws.get_caller_identity()
current_get_region = aws.get_region()
example = aws.s3.Bucket("example",
    bucket=std.format(input="my-tf-test-bucket-%s-%s-an",
        args=[
            current.account_id,
            current_get_region.region,
        ]).result,
    bucket_namespace="account-regional")
```

```go
package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws"
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/s3"
	"github.com/pulumi/pulumi-std/sdk/go/std"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		current, err := aws.GetCallerIdentity(ctx, &aws.GetCallerIdentityArgs{}, nil)
		if err != nil {
			return err
		}
		currentGetRegion, err := aws.GetRegion(ctx, &aws.GetRegionArgs{}, nil)
		if err != nil {
			return err
		}
		invokeFormat, err := std.Format(ctx, &std.FormatArgs{
			Input: "my-tf-test-bucket-%s-%s-an",
			Args: []*string{
				current.AccountId,
				currentGetRegion.Region,
			},
		}, nil)
		if err != nil {
			return err
		}
		_, err = s3.NewBucket(ctx, "example", &s3.BucketArgs{
			Bucket:          pulumi.String(invokeFormat.Result),
			BucketNamespace: pulumi.String("account-regional"),
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
    var current = Aws.GetCallerIdentity.Invoke();

    var currentGetRegion = Aws.GetRegion.Invoke();

    var example = new Aws.S3.Bucket("example", new()
    {
        BucketName = Std.Format.Invoke(new()
        {
            Input = "my-tf-test-bucket-%s-%s-an",
            Args = new[]
            {
                current.Apply(getCallerIdentityResult => getCallerIdentityResult.AccountId),
                currentGetRegion.Apply(getRegionResult => getRegionResult.Region),
            },
        }).Apply(invoke => invoke.Result),
        BucketNamespace = "account-regional",
    });

});
```

```java
package generated_program;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.AwsFunctions;
import com.pulumi.aws.inputs.GetCallerIdentityArgs;
import com.pulumi.aws.inputs.GetRegionArgs;
import com.pulumi.aws.s3.Bucket;
import com.pulumi.aws.s3.BucketArgs;
import com.pulumi.std.StdFunctions;
import com.pulumi.std.inputs.FormatArgs;
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
        final var current = AwsFunctions.getCallerIdentity(GetCallerIdentityArgs.builder()
            .build());

        final var currentGetRegion = AwsFunctions.getRegion(GetRegionArgs.builder()
            .build());

        var example = new Bucket("example", BucketArgs.builder()
            .bucket(StdFunctions.format(FormatArgs.builder()
                .input("my-tf-test-bucket-%s-%s-an")
                .args(
                    current.accountId(),
                    currentGetRegion.region())
                .build()).result())
            .bucketNamespace("account-regional")
            .build());

    }
}
```

```yaml
resources:
  example:
    type: aws:s3:Bucket
    properties:
      bucket:
        fn::invoke:
          function: std:format
          arguments:
            input: my-tf-test-bucket-%s-%s-an
            args:
              - ${current.accountId}
              - ${currentGetRegion.region}
          return: result
      bucketNamespace: account-regional
variables:
  current:
    fn::invoke:
      function: aws:getCallerIdentity
      arguments: {}
  currentGetRegion:
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

data "std_format" "invoke_0" {
  input = "my-tf-test-bucket-%s-%s-an"
  args  = [data.aws_getcalleridentity.current.account_id, data.aws_getregion.currentGetRegion.region]
}
data "aws_getcalleridentity" "current" {
}
data "aws_getregion" "currentGetRegion" {
}

resource "aws_s3_bucket" "example" {
  bucket           = data.std_format.invoke_0.result
  bucket_namespace = "account-regional"
}
```

## Create BucketV2 Resource[](#create)

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
new BucketV2(name: string, args?: BucketV2Args, opts?: CustomResourceOptions);
```

```python
@overload
def BucketV2(resource_name: str,
             args: Optional[BucketV2Args] = None,
             opts: Optional[ResourceOptions] = None)

@overload
def BucketV2(resource_name: str,
             opts: Optional[ResourceOptions] = None,
             acceleration_status: Optional[str] = None,
             acl: Optional[str] = None,
             bucket: Optional[str] = None,
             bucket_namespace: Optional[str] = None,
             bucket_prefix: Optional[str] = None,
             cors_rules: Optional[Sequence[BucketV2CorsRuleArgs]] = None,
             force_destroy: Optional[bool] = None,
             grants: Optional[Sequence[BucketV2GrantArgs]] = None,
             lifecycle_rules: Optional[Sequence[BucketV2LifecycleRuleArgs]] = None,
             loggings: Optional[Sequence[BucketV2LoggingArgs]] = None,
             object_lock_configuration: Optional[BucketV2ObjectLockConfigurationArgs] = None,
             object_lock_enabled: Optional[bool] = None,
             policy: Optional[str] = None,
             region: Optional[str] = None,
             replication_configurations: Optional[Sequence[BucketV2ReplicationConfigurationArgs]] = None,
             request_payer: Optional[str] = None,
             server_side_encryption_configurations: Optional[Sequence[BucketV2ServerSideEncryptionConfigurationArgs]] = None,
             tags: Optional[Mapping[str, str]] = None,
             tags_all: Optional[Mapping[str, str]] = None,
             versionings: Optional[Sequence[BucketV2VersioningArgs]] = None,
             websites: Optional[Sequence[BucketV2WebsiteArgs]] = None)
```

```go
func NewBucketV2(ctx *Context, name string, args *BucketV2Args, opts ...ResourceOption) (*BucketV2, error)
```

```csharp
public BucketV2(string name, BucketV2Args? args = null, CustomResourceOptions? opts = null)
```

```java
public BucketV2(String name, BucketV2Args args)
public BucketV2(String name, BucketV2Args args, CustomResourceOptions options)
```

```yaml
type: aws:s3:BucketV2
properties: # The arguments to resource properties.
options: # Bag of options to control resource's behavior.
```

```hcl
resource "aws_s3_bucketv2" "name" {
    # resource properties
}
```

#### Parameters[](#parameters)

name This property is required. string

The unique name of the resource.

args [BucketV2Args](#inputs)

The arguments to resource properties.

opts [CustomResourceOptions](/docs/reference/pkg/nodejs/pulumi/pulumi/#CustomResourceOptions)

Bag of options to control resource's behavior.

resource\_name This property is required. str

The unique name of the resource.

args [BucketV2Args](#inputs)

The arguments to resource properties.

opts [ResourceOptions](/docs/reference/pkg/python/pulumi/#pulumi.ResourceOptions)

Bag of options to control resource's behavior.

ctx [Context](https://pkg.go.dev/github.com/pulumi/pulumi/sdk/v3/go/pulumi?tab=doc#Context)

Context object for the current deployment.

name This property is required. string

The unique name of the resource.

args [BucketV2Args](#inputs)

The arguments to resource properties.

opts [ResourceOption](https://pkg.go.dev/github.com/pulumi/pulumi/sdk/v3/go/pulumi?tab=doc#ResourceOption)

Bag of options to control resource's behavior.

name This property is required. string

The unique name of the resource.

args [BucketV2Args](#inputs)

The arguments to resource properties.

opts [CustomResourceOptions](/docs/reference/pkg/dotnet/Pulumi/Pulumi.CustomResourceOptions.html)

Bag of options to control resource's behavior.

name This property is required. String

The unique name of the resource.

args This property is required. [BucketV2Args](#inputs)

The arguments to resource properties.

options CustomResourceOptions

Bag of options to control resource's behavior.

## BucketV2 Resource Properties[](#properties)

To learn more about resource properties and how to use them, see [Inputs and Outputs](/docs/intro/concepts/inputs-outputs) in the Architecture and Concepts docs.

### Inputs[](#inputs)

In Python, inputs that are objects can be passed either as [argument classes or as dictionary literals](/docs/languages-sdks/python/#inputs-and-outputs).

The BucketV2 resource accepts the following [input](/docs/intro/concepts/inputs-outputs) properties:

[AccelerationStatus](#accelerationstatus_csharp) string

Sets the accelerate configuration of an existing bucket. Can be `Enabled` or `Suspended`. Cannot be used in `cn-north-1` or `us-gov-west-1`. This provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketAccelerateConfiguration` instead.

Deprecated: acceleration\_status is deprecated. Use the aws.s3.BucketAccelerateConfiguration resource instead.

[Acl](#acl_csharp) string

The [canned ACL](https://docs.aws.amazon.com/AmazonS3/latest/dev/acl-overview.html#canned-acl) to apply. Valid values are `private`, `public-read`, `public-read-write`, `aws-exec-read`, `authenticated-read`, and `log-delivery-write`. Defaults to `private`. Conflicts with `grant`. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketAcl` instead.

Deprecated: acl is deprecated. Use the aws.s3.BucketAcl resource instead.

[Bucket](#bucket_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Name of the bucket. If omitted, the provider will assign a random, unique name. Must be lowercase and less than or equal to 63 characters in length. A full list of bucket naming rules [may be found here](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html). The name must not be in the format `[bucketName]--[azid]--x-s3`. Use the `aws.s3.DirectoryBucket` resource to manage S3 Express buckets.

[BucketNamespace](#bucketnamespace_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Namespace for the bucket. Determines bucket naming scope. Valid values: `account-regional`, `global`. Defaults to `global` (AWS).

[BucketPrefix](#bucketprefix_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Creates a unique bucket name beginning with the specified prefix. Conflicts with `bucket`. Must be lowercase and less than or equal to 37 characters in length. A full list of bucket naming rules [may be found here](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html).

[CorsRules](#corsrules_csharp) [List<BucketV2CorsRule>](#bucketv2corsrule)

Rule of [Cross-Origin Resource Sharing](https://docs.aws.amazon.com/AmazonS3/latest/dev/cors.html). See CORS rule below for details. This provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketCorsConfiguration` instead.

Deprecated: cors\_rule is deprecated. Use the aws.s3.BucketCorsConfiguration resource instead.

[ForceDestroy](#forcedestroy_csharp) bool

Boolean that indicates all objects (including any [locked objects](https://docs.aws.amazon.com/AmazonS3/latest/dev/object-lock-overview.html)) should be deleted from the bucket *when the bucket is destroyed* so that the bucket can be destroyed without error. These objects are *not* recoverable. This only deletes objects when the bucket is destroyed, *not* when setting this parameter to `true`. Once this parameter is set to `true`, there must be a successful `pulumi up` run before a destroy is required to update this value in the resource state. Without a successful `pulumi up` after this parameter is set, this flag will have no effect. If setting this field in the same operation that would require replacing the bucket or destroying the bucket, this flag will not work. Additionally when importing a bucket, a successful `pulumi up` is required to set this value in state before it will take effect on a destroy operation.

[Grants](#grants_csharp) [List<BucketV2Grant>](#bucketv2grant)

An [ACL policy grant](https://docs.aws.amazon.com/AmazonS3/latest/dev/acl-overview.html#sample-acl). See Grant below for details. Conflicts with `acl`. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketAcl` instead.

Deprecated: grant is deprecated. Use the aws.s3.BucketAcl resource instead.

[LifecycleRules](#lifecyclerules_csharp) [List<BucketV2LifecycleRule>](#bucketv2lifecyclerule)

Configuration of [object lifecycle management](http://docs.aws.amazon.com/AmazonS3/latest/dev/object-lifecycle-mgmt.html). See Lifecycle Rule below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketLifecycleConfiguration` instead.

Deprecated: lifecycle\_rule is deprecated. Use the aws.s3.BucketLifecycleConfiguration resource instead.

[Loggings](#loggings_csharp) [List<BucketV2Logging>](#bucketv2logging)

Configuration of [S3 bucket logging](https://docs.aws.amazon.com/AmazonS3/latest/UG/ManagingBucketLogging.html) parameters. See Logging below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketLogging` instead.

Deprecated: logging is deprecated. Use the aws.s3.BucketLogging resource instead.

[ObjectLockConfiguration](#objectlockconfiguration_csharp) [BucketV2ObjectLockConfiguration](#bucketv2objectlockconfiguration)

Configuration of [S3 object locking](https://docs.aws.amazon.com/AmazonS3/latest/dev/object-lock.html). See Object Lock Configuration below for details. The provider wil only perform drift detection if a configuration value is provided. Use the `objectLockEnabled` parameter and the resource `aws.s3.BucketObjectLockConfiguration` instead.

Deprecated: object\_lock\_configuration is deprecated. Use the top-level parameter objectLockEnabled and the aws.s3.BucketObjectLockConfiguration resource instead.

[ObjectLockEnabled](#objectlockenabled_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. bool

Indicates whether this bucket has an Object Lock configuration enabled. Valid values are `true` or `false`. This argument is not supported in all regions or partitions.

[Policy](#policy_csharp) string

Valid [bucket policy](https://docs.aws.amazon.com/AmazonS3/latest/dev/example-bucket-policies.html) JSON document. Note that if the policy document is not specific enough (but still valid), this provider may view the policy as constantly changing. In this case, please make sure you use the verbose/specific version of the policy. For more information about building AWS IAM policy documents with this provider, see the AWS IAM Policy Document Guide. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketPolicy` instead.

Deprecated: policy is deprecated. Use the aws.s3.BucketPolicy resource instead.

[Region](#region_csharp) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[ReplicationConfigurations](#replicationconfigurations_csharp) [List<BucketV2ReplicationConfiguration>](#bucketv2replicationconfiguration)

Configuration of [replication configuration](http://docs.aws.amazon.com/AmazonS3/latest/dev/crr.html). See Replication Configuration below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketReplicationConfig` instead.

Deprecated: replication\_configuration is deprecated. Use the aws.s3.BucketReplicationConfig resource instead.

[RequestPayer](#requestpayer_csharp) string

Specifies who should bear the cost of Amazon S3 data transfer. Can be either `BucketOwner` or `Requester`. By default, the owner of the S3 bucket would incur the costs of any data transfer. See [Requester Pays Buckets](http://docs.aws.amazon.com/AmazonS3/latest/dev/RequesterPaysBuckets.html) developer guide for more information. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketRequestPaymentConfiguration` instead.

Deprecated: request\_payer is deprecated. Use the aws.s3.BucketRequestPaymentConfiguration resource instead.

[ServerSideEncryptionConfigurations](#serversideencryptionconfigurations_csharp) [List<BucketV2ServerSideEncryptionConfiguration>](#bucketv2serversideencryptionconfiguration)

Configuration of [server-side encryption configuration](http://docs.aws.amazon.com/AmazonS3/latest/dev/bucket-encryption.html). See Server Side Encryption Configuration below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketServerSideEncryptionConfiguration` instead.

Deprecated: server\_side\_encryption\_configuration is deprecated. Use the aws.s3.BucketServerSideEncryptionConfiguration resource instead.

[Tags](#tags_csharp) Dictionary<string, string>

Map of tags to assign to the bucket. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

The following arguments are deprecated, and will be removed in a future major version:

[TagsAll](#tagsall_csharp) Dictionary<string, string>

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[Versionings](#versionings_csharp) [List<BucketV2Versioning>](#bucketv2versioning)

Configuration of the [S3 bucket versioning state](https://docs.aws.amazon.com/AmazonS3/latest/dev/Versioning.html). See Versioning below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketVersioning` instead.

Deprecated: versioning is deprecated. Use the aws.s3.BucketVersioning resource instead.

[Websites](#websites_csharp) [List<BucketV2Website>](#bucketv2website)

Configuration of the [S3 bucket website](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html). See Website below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketWebsiteConfiguration` instead.

Deprecated: website is deprecated. Use the aws.s3.BucketWebsiteConfiguration resource instead.

[AccelerationStatus](#accelerationstatus_go) string

Sets the accelerate configuration of an existing bucket. Can be `Enabled` or `Suspended`. Cannot be used in `cn-north-1` or `us-gov-west-1`. This provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketAccelerateConfiguration` instead.

Deprecated: acceleration\_status is deprecated. Use the aws.s3.BucketAccelerateConfiguration resource instead.

[Acl](#acl_go) string

The [canned ACL](https://docs.aws.amazon.com/AmazonS3/latest/dev/acl-overview.html#canned-acl) to apply. Valid values are `private`, `public-read`, `public-read-write`, `aws-exec-read`, `authenticated-read`, and `log-delivery-write`. Defaults to `private`. Conflicts with `grant`. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketAcl` instead.

Deprecated: acl is deprecated. Use the aws.s3.BucketAcl resource instead.

[Bucket](#bucket_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Name of the bucket. If omitted, the provider will assign a random, unique name. Must be lowercase and less than or equal to 63 characters in length. A full list of bucket naming rules [may be found here](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html). The name must not be in the format `[bucketName]--[azid]--x-s3`. Use the `aws.s3.DirectoryBucket` resource to manage S3 Express buckets.

[BucketNamespace](#bucketnamespace_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Namespace for the bucket. Determines bucket naming scope. Valid values: `account-regional`, `global`. Defaults to `global` (AWS).

[BucketPrefix](#bucketprefix_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Creates a unique bucket name beginning with the specified prefix. Conflicts with `bucket`. Must be lowercase and less than or equal to 37 characters in length. A full list of bucket naming rules [may be found here](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html).

[CorsRules](#corsrules_go) [\[\]BucketV2CorsRuleArgs](#bucketv2corsrule)

Rule of [Cross-Origin Resource Sharing](https://docs.aws.amazon.com/AmazonS3/latest/dev/cors.html). See CORS rule below for details. This provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketCorsConfiguration` instead.

Deprecated: cors\_rule is deprecated. Use the aws.s3.BucketCorsConfiguration resource instead.

[ForceDestroy](#forcedestroy_go) bool

Boolean that indicates all objects (including any [locked objects](https://docs.aws.amazon.com/AmazonS3/latest/dev/object-lock-overview.html)) should be deleted from the bucket *when the bucket is destroyed* so that the bucket can be destroyed without error. These objects are *not* recoverable. This only deletes objects when the bucket is destroyed, *not* when setting this parameter to `true`. Once this parameter is set to `true`, there must be a successful `pulumi up` run before a destroy is required to update this value in the resource state. Without a successful `pulumi up` after this parameter is set, this flag will have no effect. If setting this field in the same operation that would require replacing the bucket or destroying the bucket, this flag will not work. Additionally when importing a bucket, a successful `pulumi up` is required to set this value in state before it will take effect on a destroy operation.

[Grants](#grants_go) [\[\]BucketV2GrantArgs](#bucketv2grant)

An [ACL policy grant](https://docs.aws.amazon.com/AmazonS3/latest/dev/acl-overview.html#sample-acl). See Grant below for details. Conflicts with `acl`. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketAcl` instead.

Deprecated: grant is deprecated. Use the aws.s3.BucketAcl resource instead.

[LifecycleRules](#lifecyclerules_go) [\[\]BucketV2LifecycleRuleArgs](#bucketv2lifecyclerule)

Configuration of [object lifecycle management](http://docs.aws.amazon.com/AmazonS3/latest/dev/object-lifecycle-mgmt.html). See Lifecycle Rule below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketLifecycleConfiguration` instead.

Deprecated: lifecycle\_rule is deprecated. Use the aws.s3.BucketLifecycleConfiguration resource instead.

[Loggings](#loggings_go) [\[\]BucketV2LoggingArgs](#bucketv2logging)

Configuration of [S3 bucket logging](https://docs.aws.amazon.com/AmazonS3/latest/UG/ManagingBucketLogging.html) parameters. See Logging below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketLogging` instead.

Deprecated: logging is deprecated. Use the aws.s3.BucketLogging resource instead.

[ObjectLockConfiguration](#objectlockconfiguration_go) [BucketV2ObjectLockConfigurationArgs](#bucketv2objectlockconfiguration)

Configuration of [S3 object locking](https://docs.aws.amazon.com/AmazonS3/latest/dev/object-lock.html). See Object Lock Configuration below for details. The provider wil only perform drift detection if a configuration value is provided. Use the `objectLockEnabled` parameter and the resource `aws.s3.BucketObjectLockConfiguration` instead.

Deprecated: object\_lock\_configuration is deprecated. Use the top-level parameter objectLockEnabled and the aws.s3.BucketObjectLockConfiguration resource instead.

[ObjectLockEnabled](#objectlockenabled_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. bool

Indicates whether this bucket has an Object Lock configuration enabled. Valid values are `true` or `false`. This argument is not supported in all regions or partitions.

[Policy](#policy_go) string

Valid [bucket policy](https://docs.aws.amazon.com/AmazonS3/latest/dev/example-bucket-policies.html) JSON document. Note that if the policy document is not specific enough (but still valid), this provider may view the policy as constantly changing. In this case, please make sure you use the verbose/specific version of the policy. For more information about building AWS IAM policy documents with this provider, see the AWS IAM Policy Document Guide. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketPolicy` instead.

Deprecated: policy is deprecated. Use the aws.s3.BucketPolicy resource instead.

[Region](#region_go) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[ReplicationConfigurations](#replicationconfigurations_go) [\[\]BucketV2ReplicationConfigurationArgs](#bucketv2replicationconfiguration)

Configuration of [replication configuration](http://docs.aws.amazon.com/AmazonS3/latest/dev/crr.html). See Replication Configuration below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketReplicationConfig` instead.

Deprecated: replication\_configuration is deprecated. Use the aws.s3.BucketReplicationConfig resource instead.

[RequestPayer](#requestpayer_go) string

Specifies who should bear the cost of Amazon S3 data transfer. Can be either `BucketOwner` or `Requester`. By default, the owner of the S3 bucket would incur the costs of any data transfer. See [Requester Pays Buckets](http://docs.aws.amazon.com/AmazonS3/latest/dev/RequesterPaysBuckets.html) developer guide for more information. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketRequestPaymentConfiguration` instead.

Deprecated: request\_payer is deprecated. Use the aws.s3.BucketRequestPaymentConfiguration resource instead.

[ServerSideEncryptionConfigurations](#serversideencryptionconfigurations_go) [\[\]BucketV2ServerSideEncryptionConfigurationArgs](#bucketv2serversideencryptionconfiguration)

Configuration of [server-side encryption configuration](http://docs.aws.amazon.com/AmazonS3/latest/dev/bucket-encryption.html). See Server Side Encryption Configuration below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketServerSideEncryptionConfiguration` instead.

Deprecated: server\_side\_encryption\_configuration is deprecated. Use the aws.s3.BucketServerSideEncryptionConfiguration resource instead.

[Tags](#tags_go) map\[string\]string

Map of tags to assign to the bucket. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

The following arguments are deprecated, and will be removed in a future major version:

[TagsAll](#tagsall_go) map\[string\]string

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[Versionings](#versionings_go) [\[\]BucketV2VersioningArgs](#bucketv2versioning)

Configuration of the [S3 bucket versioning state](https://docs.aws.amazon.com/AmazonS3/latest/dev/Versioning.html). See Versioning below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketVersioning` instead.

Deprecated: versioning is deprecated. Use the aws.s3.BucketVersioning resource instead.

[Websites](#websites_go) [\[\]BucketV2WebsiteArgs](#bucketv2website)

Configuration of the [S3 bucket website](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html). See Website below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketWebsiteConfiguration` instead.

Deprecated: website is deprecated. Use the aws.s3.BucketWebsiteConfiguration resource instead.

[acceleration\_status](#acceleration_status_hcl) string

Sets the accelerate configuration of an existing bucket. Can be `Enabled` or `Suspended`. Cannot be used in `cn-north-1` or `us-gov-west-1`. This provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketAccelerateConfiguration` instead.

Deprecated: acceleration\_status is deprecated. Use the aws.s3.BucketAccelerateConfiguration resource instead.

[acl](#acl_hcl) string

The [canned ACL](https://docs.aws.amazon.com/AmazonS3/latest/dev/acl-overview.html#canned-acl) to apply. Valid values are `private`, `public-read`, `public-read-write`, `aws-exec-read`, `authenticated-read`, and `log-delivery-write`. Defaults to `private`. Conflicts with `grant`. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketAcl` instead.

Deprecated: acl is deprecated. Use the aws.s3.BucketAcl resource instead.

[bucket](#bucket_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Name of the bucket. If omitted, the provider will assign a random, unique name. Must be lowercase and less than or equal to 63 characters in length. A full list of bucket naming rules [may be found here](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html). The name must not be in the format `[bucketName]--[azid]--x-s3`. Use the `aws.s3.DirectoryBucket` resource to manage S3 Express buckets.

[bucket\_namespace](#bucket_namespace_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Namespace for the bucket. Determines bucket naming scope. Valid values: `account-regional`, `global`. Defaults to `global` (AWS).

[bucket\_prefix](#bucket_prefix_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Creates a unique bucket name beginning with the specified prefix. Conflicts with `bucket`. Must be lowercase and less than or equal to 37 characters in length. A full list of bucket naming rules [may be found here](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html).

[cors\_rules](#cors_rules_hcl) [list(object)](#bucketv2corsrule)

Rule of [Cross-Origin Resource Sharing](https://docs.aws.amazon.com/AmazonS3/latest/dev/cors.html). See CORS rule below for details. This provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketCorsConfiguration` instead.

Deprecated: cors\_rule is deprecated. Use the aws.s3.BucketCorsConfiguration resource instead.

[force\_destroy](#force_destroy_hcl) bool

Boolean that indicates all objects (including any [locked objects](https://docs.aws.amazon.com/AmazonS3/latest/dev/object-lock-overview.html)) should be deleted from the bucket *when the bucket is destroyed* so that the bucket can be destroyed without error. These objects are *not* recoverable. This only deletes objects when the bucket is destroyed, *not* when setting this parameter to `true`. Once this parameter is set to `true`, there must be a successful `pulumi up` run before a destroy is required to update this value in the resource state. Without a successful `pulumi up` after this parameter is set, this flag will have no effect. If setting this field in the same operation that would require replacing the bucket or destroying the bucket, this flag will not work. Additionally when importing a bucket, a successful `pulumi up` is required to set this value in state before it will take effect on a destroy operation.

[grants](#grants_hcl) [list(object)](#bucketv2grant)

An [ACL policy grant](https://docs.aws.amazon.com/AmazonS3/latest/dev/acl-overview.html#sample-acl). See Grant below for details. Conflicts with `acl`. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketAcl` instead.

Deprecated: grant is deprecated. Use the aws.s3.BucketAcl resource instead.

[lifecycle\_rules](#lifecycle_rules_hcl) [list(object)](#bucketv2lifecyclerule)

Configuration of [object lifecycle management](http://docs.aws.amazon.com/AmazonS3/latest/dev/object-lifecycle-mgmt.html). See Lifecycle Rule below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketLifecycleConfiguration` instead.

Deprecated: lifecycle\_rule is deprecated. Use the aws.s3.BucketLifecycleConfiguration resource instead.

[loggings](#loggings_hcl) [list(object)](#bucketv2logging)

Configuration of [S3 bucket logging](https://docs.aws.amazon.com/AmazonS3/latest/UG/ManagingBucketLogging.html) parameters. See Logging below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketLogging` instead.

Deprecated: logging is deprecated. Use the aws.s3.BucketLogging resource instead.

[object\_lock\_configuration](#object_lock_configuration_hcl) [object](#bucketv2objectlockconfiguration)

Configuration of [S3 object locking](https://docs.aws.amazon.com/AmazonS3/latest/dev/object-lock.html). See Object Lock Configuration below for details. The provider wil only perform drift detection if a configuration value is provided. Use the `objectLockEnabled` parameter and the resource `aws.s3.BucketObjectLockConfiguration` instead.

Deprecated: object\_lock\_configuration is deprecated. Use the top-level parameter objectLockEnabled and the aws.s3.BucketObjectLockConfiguration resource instead.

[object\_lock\_enabled](#object_lock_enabled_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. bool

Indicates whether this bucket has an Object Lock configuration enabled. Valid values are `true` or `false`. This argument is not supported in all regions or partitions.

[policy](#policy_hcl) string

Valid [bucket policy](https://docs.aws.amazon.com/AmazonS3/latest/dev/example-bucket-policies.html) JSON document. Note that if the policy document is not specific enough (but still valid), this provider may view the policy as constantly changing. In this case, please make sure you use the verbose/specific version of the policy. For more information about building AWS IAM policy documents with this provider, see the AWS IAM Policy Document Guide. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketPolicy` instead.

Deprecated: policy is deprecated. Use the aws.s3.BucketPolicy resource instead.

[region](#region_hcl) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[replication\_configurations](#replication_configurations_hcl) [list(object)](#bucketv2replicationconfiguration)

Configuration of [replication configuration](http://docs.aws.amazon.com/AmazonS3/latest/dev/crr.html). See Replication Configuration below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketReplicationConfig` instead.

Deprecated: replication\_configuration is deprecated. Use the aws.s3.BucketReplicationConfig resource instead.

[request\_payer](#request_payer_hcl) string

Specifies who should bear the cost of Amazon S3 data transfer. Can be either `BucketOwner` or `Requester`. By default, the owner of the S3 bucket would incur the costs of any data transfer. See [Requester Pays Buckets](http://docs.aws.amazon.com/AmazonS3/latest/dev/RequesterPaysBuckets.html) developer guide for more information. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketRequestPaymentConfiguration` instead.

Deprecated: request\_payer is deprecated. Use the aws.s3.BucketRequestPaymentConfiguration resource instead.

[server\_side\_encryption\_configurations](#server_side_encryption_configurations_hcl) [list(object)](#bucketv2serversideencryptionconfiguration)

Configuration of [server-side encryption configuration](http://docs.aws.amazon.com/AmazonS3/latest/dev/bucket-encryption.html). See Server Side Encryption Configuration below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketServerSideEncryptionConfiguration` instead.

Deprecated: server\_side\_encryption\_configuration is deprecated. Use the aws.s3.BucketServerSideEncryptionConfiguration resource instead.

[tags](#tags_hcl) map(string)

Map of tags to assign to the bucket. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

The following arguments are deprecated, and will be removed in a future major version:

[tags\_all](#tags_all_hcl) map(string)

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[versionings](#versionings_hcl) [list(object)](#bucketv2versioning)

Configuration of the [S3 bucket versioning state](https://docs.aws.amazon.com/AmazonS3/latest/dev/Versioning.html). See Versioning below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketVersioning` instead.

Deprecated: versioning is deprecated. Use the aws.s3.BucketVersioning resource instead.

[websites](#websites_hcl) [list(object)](#bucketv2website)

Configuration of the [S3 bucket website](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html). See Website below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketWebsiteConfiguration` instead.

Deprecated: website is deprecated. Use the aws.s3.BucketWebsiteConfiguration resource instead.

[accelerationStatus](#accelerationstatus_java) String

Sets the accelerate configuration of an existing bucket. Can be `Enabled` or `Suspended`. Cannot be used in `cn-north-1` or `us-gov-west-1`. This provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketAccelerateConfiguration` instead.

Deprecated: acceleration\_status is deprecated. Use the aws.s3.BucketAccelerateConfiguration resource instead.

[acl](#acl_java) String

The [canned ACL](https://docs.aws.amazon.com/AmazonS3/latest/dev/acl-overview.html#canned-acl) to apply. Valid values are `private`, `public-read`, `public-read-write`, `aws-exec-read`, `authenticated-read`, and `log-delivery-write`. Defaults to `private`. Conflicts with `grant`. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketAcl` instead.

Deprecated: acl is deprecated. Use the aws.s3.BucketAcl resource instead.

[bucket](#bucket_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Name of the bucket. If omitted, the provider will assign a random, unique name. Must be lowercase and less than or equal to 63 characters in length. A full list of bucket naming rules [may be found here](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html). The name must not be in the format `[bucketName]--[azid]--x-s3`. Use the `aws.s3.DirectoryBucket` resource to manage S3 Express buckets.

[bucketNamespace](#bucketnamespace_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Namespace for the bucket. Determines bucket naming scope. Valid values: `account-regional`, `global`. Defaults to `global` (AWS).

[bucketPrefix](#bucketprefix_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Creates a unique bucket name beginning with the specified prefix. Conflicts with `bucket`. Must be lowercase and less than or equal to 37 characters in length. A full list of bucket naming rules [may be found here](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html).

[corsRules](#corsrules_java) [List<BucketV2CorsRule>](#bucketv2corsrule)

Rule of [Cross-Origin Resource Sharing](https://docs.aws.amazon.com/AmazonS3/latest/dev/cors.html). See CORS rule below for details. This provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketCorsConfiguration` instead.

Deprecated: cors\_rule is deprecated. Use the aws.s3.BucketCorsConfiguration resource instead.

[forceDestroy](#forcedestroy_java) Boolean

Boolean that indicates all objects (including any [locked objects](https://docs.aws.amazon.com/AmazonS3/latest/dev/object-lock-overview.html)) should be deleted from the bucket *when the bucket is destroyed* so that the bucket can be destroyed without error. These objects are *not* recoverable. This only deletes objects when the bucket is destroyed, *not* when setting this parameter to `true`. Once this parameter is set to `true`, there must be a successful `pulumi up` run before a destroy is required to update this value in the resource state. Without a successful `pulumi up` after this parameter is set, this flag will have no effect. If setting this field in the same operation that would require replacing the bucket or destroying the bucket, this flag will not work. Additionally when importing a bucket, a successful `pulumi up` is required to set this value in state before it will take effect on a destroy operation.

[grants](#grants_java) [List<BucketV2Grant>](#bucketv2grant)

An [ACL policy grant](https://docs.aws.amazon.com/AmazonS3/latest/dev/acl-overview.html#sample-acl). See Grant below for details. Conflicts with `acl`. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketAcl` instead.

Deprecated: grant is deprecated. Use the aws.s3.BucketAcl resource instead.

[lifecycleRules](#lifecyclerules_java) [List<BucketV2LifecycleRule>](#bucketv2lifecyclerule)

Configuration of [object lifecycle management](http://docs.aws.amazon.com/AmazonS3/latest/dev/object-lifecycle-mgmt.html). See Lifecycle Rule below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketLifecycleConfiguration` instead.

Deprecated: lifecycle\_rule is deprecated. Use the aws.s3.BucketLifecycleConfiguration resource instead.

[loggings](#loggings_java) [List<BucketV2Logging>](#bucketv2logging)

Configuration of [S3 bucket logging](https://docs.aws.amazon.com/AmazonS3/latest/UG/ManagingBucketLogging.html) parameters. See Logging below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketLogging` instead.

Deprecated: logging is deprecated. Use the aws.s3.BucketLogging resource instead.

[objectLockConfiguration](#objectlockconfiguration_java) [BucketV2ObjectLockConfiguration](#bucketv2objectlockconfiguration)

Configuration of [S3 object locking](https://docs.aws.amazon.com/AmazonS3/latest/dev/object-lock.html). See Object Lock Configuration below for details. The provider wil only perform drift detection if a configuration value is provided. Use the `objectLockEnabled` parameter and the resource `aws.s3.BucketObjectLockConfiguration` instead.

Deprecated: object\_lock\_configuration is deprecated. Use the top-level parameter objectLockEnabled and the aws.s3.BucketObjectLockConfiguration resource instead.

[objectLockEnabled](#objectlockenabled_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. Boolean

Indicates whether this bucket has an Object Lock configuration enabled. Valid values are `true` or `false`. This argument is not supported in all regions or partitions.

[policy](#policy_java) String

Valid [bucket policy](https://docs.aws.amazon.com/AmazonS3/latest/dev/example-bucket-policies.html) JSON document. Note that if the policy document is not specific enough (but still valid), this provider may view the policy as constantly changing. In this case, please make sure you use the verbose/specific version of the policy. For more information about building AWS IAM policy documents with this provider, see the AWS IAM Policy Document Guide. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketPolicy` instead.

Deprecated: policy is deprecated. Use the aws.s3.BucketPolicy resource instead.

[region](#region_java) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[replicationConfigurations](#replicationconfigurations_java) [List<BucketV2ReplicationConfiguration>](#bucketv2replicationconfiguration)

Configuration of [replication configuration](http://docs.aws.amazon.com/AmazonS3/latest/dev/crr.html). See Replication Configuration below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketReplicationConfig` instead.

Deprecated: replication\_configuration is deprecated. Use the aws.s3.BucketReplicationConfig resource instead.

[requestPayer](#requestpayer_java) String

Specifies who should bear the cost of Amazon S3 data transfer. Can be either `BucketOwner` or `Requester`. By default, the owner of the S3 bucket would incur the costs of any data transfer. See [Requester Pays Buckets](http://docs.aws.amazon.com/AmazonS3/latest/dev/RequesterPaysBuckets.html) developer guide for more information. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketRequestPaymentConfiguration` instead.

Deprecated: request\_payer is deprecated. Use the aws.s3.BucketRequestPaymentConfiguration resource instead.

[serverSideEncryptionConfigurations](#serversideencryptionconfigurations_java) [List<BucketV2ServerSideEncryptionConfiguration>](#bucketv2serversideencryptionconfiguration)

Configuration of [server-side encryption configuration](http://docs.aws.amazon.com/AmazonS3/latest/dev/bucket-encryption.html). See Server Side Encryption Configuration below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketServerSideEncryptionConfiguration` instead.

Deprecated: server\_side\_encryption\_configuration is deprecated. Use the aws.s3.BucketServerSideEncryptionConfiguration resource instead.

[tags](#tags_java) Map<String,String>

Map of tags to assign to the bucket. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

The following arguments are deprecated, and will be removed in a future major version:

[tagsAll](#tagsall_java) Map<String,String>

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[versionings](#versionings_java) [List<BucketV2Versioning>](#bucketv2versioning)

Configuration of the [S3 bucket versioning state](https://docs.aws.amazon.com/AmazonS3/latest/dev/Versioning.html). See Versioning below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketVersioning` instead.

Deprecated: versioning is deprecated. Use the aws.s3.BucketVersioning resource instead.

[websites](#websites_java) [List<BucketV2Website>](#bucketv2website)

Configuration of the [S3 bucket website](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html). See Website below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketWebsiteConfiguration` instead.

Deprecated: website is deprecated. Use the aws.s3.BucketWebsiteConfiguration resource instead.

[accelerationStatus](#accelerationstatus_nodejs) string

Sets the accelerate configuration of an existing bucket. Can be `Enabled` or `Suspended`. Cannot be used in `cn-north-1` or `us-gov-west-1`. This provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketAccelerateConfiguration` instead.

Deprecated: acceleration\_status is deprecated. Use the aws.s3.BucketAccelerateConfiguration resource instead.

[acl](#acl_nodejs) string

The [canned ACL](https://docs.aws.amazon.com/AmazonS3/latest/dev/acl-overview.html#canned-acl) to apply. Valid values are `private`, `public-read`, `public-read-write`, `aws-exec-read`, `authenticated-read`, and `log-delivery-write`. Defaults to `private`. Conflicts with `grant`. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketAcl` instead.

Deprecated: acl is deprecated. Use the aws.s3.BucketAcl resource instead.

[bucket](#bucket_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Name of the bucket. If omitted, the provider will assign a random, unique name. Must be lowercase and less than or equal to 63 characters in length. A full list of bucket naming rules [may be found here](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html). The name must not be in the format `[bucketName]--[azid]--x-s3`. Use the `aws.s3.DirectoryBucket` resource to manage S3 Express buckets.

[bucketNamespace](#bucketnamespace_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Namespace for the bucket. Determines bucket naming scope. Valid values: `account-regional`, `global`. Defaults to `global` (AWS).

[bucketPrefix](#bucketprefix_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Creates a unique bucket name beginning with the specified prefix. Conflicts with `bucket`. Must be lowercase and less than or equal to 37 characters in length. A full list of bucket naming rules [may be found here](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html).

[corsRules](#corsrules_nodejs) [BucketV2CorsRule\[\]](#bucketv2corsrule)

Rule of [Cross-Origin Resource Sharing](https://docs.aws.amazon.com/AmazonS3/latest/dev/cors.html). See CORS rule below for details. This provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketCorsConfiguration` instead.

Deprecated: cors\_rule is deprecated. Use the aws.s3.BucketCorsConfiguration resource instead.

[forceDestroy](#forcedestroy_nodejs) boolean

Boolean that indicates all objects (including any [locked objects](https://docs.aws.amazon.com/AmazonS3/latest/dev/object-lock-overview.html)) should be deleted from the bucket *when the bucket is destroyed* so that the bucket can be destroyed without error. These objects are *not* recoverable. This only deletes objects when the bucket is destroyed, *not* when setting this parameter to `true`. Once this parameter is set to `true`, there must be a successful `pulumi up` run before a destroy is required to update this value in the resource state. Without a successful `pulumi up` after this parameter is set, this flag will have no effect. If setting this field in the same operation that would require replacing the bucket or destroying the bucket, this flag will not work. Additionally when importing a bucket, a successful `pulumi up` is required to set this value in state before it will take effect on a destroy operation.

[grants](#grants_nodejs) [BucketV2Grant\[\]](#bucketv2grant)

An [ACL policy grant](https://docs.aws.amazon.com/AmazonS3/latest/dev/acl-overview.html#sample-acl). See Grant below for details. Conflicts with `acl`. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketAcl` instead.

Deprecated: grant is deprecated. Use the aws.s3.BucketAcl resource instead.

[lifecycleRules](#lifecyclerules_nodejs) [BucketV2LifecycleRule\[\]](#bucketv2lifecyclerule)

Configuration of [object lifecycle management](http://docs.aws.amazon.com/AmazonS3/latest/dev/object-lifecycle-mgmt.html). See Lifecycle Rule below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketLifecycleConfiguration` instead.

Deprecated: lifecycle\_rule is deprecated. Use the aws.s3.BucketLifecycleConfiguration resource instead.

[loggings](#loggings_nodejs) [BucketV2Logging\[\]](#bucketv2logging)

Configuration of [S3 bucket logging](https://docs.aws.amazon.com/AmazonS3/latest/UG/ManagingBucketLogging.html) parameters. See Logging below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketLogging` instead.

Deprecated: logging is deprecated. Use the aws.s3.BucketLogging resource instead.

[objectLockConfiguration](#objectlockconfiguration_nodejs) [BucketV2ObjectLockConfiguration](#bucketv2objectlockconfiguration)

Configuration of [S3 object locking](https://docs.aws.amazon.com/AmazonS3/latest/dev/object-lock.html). See Object Lock Configuration below for details. The provider wil only perform drift detection if a configuration value is provided. Use the `objectLockEnabled` parameter and the resource `aws.s3.BucketObjectLockConfiguration` instead.

Deprecated: object\_lock\_configuration is deprecated. Use the top-level parameter objectLockEnabled and the aws.s3.BucketObjectLockConfiguration resource instead.

[objectLockEnabled](#objectlockenabled_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. boolean

Indicates whether this bucket has an Object Lock configuration enabled. Valid values are `true` or `false`. This argument is not supported in all regions or partitions.

[policy](#policy_nodejs) string

Valid [bucket policy](https://docs.aws.amazon.com/AmazonS3/latest/dev/example-bucket-policies.html) JSON document. Note that if the policy document is not specific enough (but still valid), this provider may view the policy as constantly changing. In this case, please make sure you use the verbose/specific version of the policy. For more information about building AWS IAM policy documents with this provider, see the AWS IAM Policy Document Guide. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketPolicy` instead.

Deprecated: policy is deprecated. Use the aws.s3.BucketPolicy resource instead.

[region](#region_nodejs) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[replicationConfigurations](#replicationconfigurations_nodejs) [BucketV2ReplicationConfiguration\[\]](#bucketv2replicationconfiguration)

Configuration of [replication configuration](http://docs.aws.amazon.com/AmazonS3/latest/dev/crr.html). See Replication Configuration below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketReplicationConfig` instead.

Deprecated: replication\_configuration is deprecated. Use the aws.s3.BucketReplicationConfig resource instead.

[requestPayer](#requestpayer_nodejs) string

Specifies who should bear the cost of Amazon S3 data transfer. Can be either `BucketOwner` or `Requester`. By default, the owner of the S3 bucket would incur the costs of any data transfer. See [Requester Pays Buckets](http://docs.aws.amazon.com/AmazonS3/latest/dev/RequesterPaysBuckets.html) developer guide for more information. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketRequestPaymentConfiguration` instead.

Deprecated: request\_payer is deprecated. Use the aws.s3.BucketRequestPaymentConfiguration resource instead.

[serverSideEncryptionConfigurations](#serversideencryptionconfigurations_nodejs) [BucketV2ServerSideEncryptionConfiguration\[\]](#bucketv2serversideencryptionconfiguration)

Configuration of [server-side encryption configuration](http://docs.aws.amazon.com/AmazonS3/latest/dev/bucket-encryption.html). See Server Side Encryption Configuration below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketServerSideEncryptionConfiguration` instead.

Deprecated: server\_side\_encryption\_configuration is deprecated. Use the aws.s3.BucketServerSideEncryptionConfiguration resource instead.

[tags](#tags_nodejs) {\[key: string\]: string}

Map of tags to assign to the bucket. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

The following arguments are deprecated, and will be removed in a future major version:

[tagsAll](#tagsall_nodejs) {\[key: string\]: string}

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[versionings](#versionings_nodejs) [BucketV2Versioning\[\]](#bucketv2versioning)

Configuration of the [S3 bucket versioning state](https://docs.aws.amazon.com/AmazonS3/latest/dev/Versioning.html). See Versioning below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketVersioning` instead.

Deprecated: versioning is deprecated. Use the aws.s3.BucketVersioning resource instead.

[websites](#websites_nodejs) [BucketV2Website\[\]](#bucketv2website)

Configuration of the [S3 bucket website](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html). See Website below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketWebsiteConfiguration` instead.

Deprecated: website is deprecated. Use the aws.s3.BucketWebsiteConfiguration resource instead.

[acceleration\_status](#acceleration_status_python) str

Sets the accelerate configuration of an existing bucket. Can be `Enabled` or `Suspended`. Cannot be used in `cn-north-1` or `us-gov-west-1`. This provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketAccelerateConfiguration` instead.

Deprecated: acceleration\_status is deprecated. Use the aws.s3.BucketAccelerateConfiguration resource instead.

[acl](#acl_python) str

The [canned ACL](https://docs.aws.amazon.com/AmazonS3/latest/dev/acl-overview.html#canned-acl) to apply. Valid values are `private`, `public-read`, `public-read-write`, `aws-exec-read`, `authenticated-read`, and `log-delivery-write`. Defaults to `private`. Conflicts with `grant`. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketAcl` instead.

Deprecated: acl is deprecated. Use the aws.s3.BucketAcl resource instead.

[bucket](#bucket_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Name of the bucket. If omitted, the provider will assign a random, unique name. Must be lowercase and less than or equal to 63 characters in length. A full list of bucket naming rules [may be found here](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html). The name must not be in the format `[bucketName]--[azid]--x-s3`. Use the `aws.s3.DirectoryBucket` resource to manage S3 Express buckets.

[bucket\_namespace](#bucket_namespace_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Namespace for the bucket. Determines bucket naming scope. Valid values: `account-regional`, `global`. Defaults to `global` (AWS).

[bucket\_prefix](#bucket_prefix_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Creates a unique bucket name beginning with the specified prefix. Conflicts with `bucket`. Must be lowercase and less than or equal to 37 characters in length. A full list of bucket naming rules [may be found here](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html).

[cors\_rules](#cors_rules_python) [Sequence\[BucketV2CorsRuleArgs\]](#bucketv2corsrule)

Rule of [Cross-Origin Resource Sharing](https://docs.aws.amazon.com/AmazonS3/latest/dev/cors.html). See CORS rule below for details. This provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketCorsConfiguration` instead.

Deprecated: cors\_rule is deprecated. Use the aws.s3.BucketCorsConfiguration resource instead.

[force\_destroy](#force_destroy_python) bool

Boolean that indicates all objects (including any [locked objects](https://docs.aws.amazon.com/AmazonS3/latest/dev/object-lock-overview.html)) should be deleted from the bucket *when the bucket is destroyed* so that the bucket can be destroyed without error. These objects are *not* recoverable. This only deletes objects when the bucket is destroyed, *not* when setting this parameter to `true`. Once this parameter is set to `true`, there must be a successful `pulumi up` run before a destroy is required to update this value in the resource state. Without a successful `pulumi up` after this parameter is set, this flag will have no effect. If setting this field in the same operation that would require replacing the bucket or destroying the bucket, this flag will not work. Additionally when importing a bucket, a successful `pulumi up` is required to set this value in state before it will take effect on a destroy operation.

[grants](#grants_python) [Sequence\[BucketV2GrantArgs\]](#bucketv2grant)

An [ACL policy grant](https://docs.aws.amazon.com/AmazonS3/latest/dev/acl-overview.html#sample-acl). See Grant below for details. Conflicts with `acl`. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketAcl` instead.

Deprecated: grant is deprecated. Use the aws.s3.BucketAcl resource instead.

[lifecycle\_rules](#lifecycle_rules_python) [Sequence\[BucketV2LifecycleRuleArgs\]](#bucketv2lifecyclerule)

Configuration of [object lifecycle management](http://docs.aws.amazon.com/AmazonS3/latest/dev/object-lifecycle-mgmt.html). See Lifecycle Rule below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketLifecycleConfiguration` instead.

Deprecated: lifecycle\_rule is deprecated. Use the aws.s3.BucketLifecycleConfiguration resource instead.

[loggings](#loggings_python) [Sequence\[BucketV2LoggingArgs\]](#bucketv2logging)

Configuration of [S3 bucket logging](https://docs.aws.amazon.com/AmazonS3/latest/UG/ManagingBucketLogging.html) parameters. See Logging below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketLogging` instead.

Deprecated: logging is deprecated. Use the aws.s3.BucketLogging resource instead.

[object\_lock\_configuration](#object_lock_configuration_python) [BucketV2ObjectLockConfigurationArgs](#bucketv2objectlockconfiguration)

Configuration of [S3 object locking](https://docs.aws.amazon.com/AmazonS3/latest/dev/object-lock.html). See Object Lock Configuration below for details. The provider wil only perform drift detection if a configuration value is provided. Use the `objectLockEnabled` parameter and the resource `aws.s3.BucketObjectLockConfiguration` instead.

Deprecated: object\_lock\_configuration is deprecated. Use the top-level parameter objectLockEnabled and the aws.s3.BucketObjectLockConfiguration resource instead.

[object\_lock\_enabled](#object_lock_enabled_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. bool

Indicates whether this bucket has an Object Lock configuration enabled. Valid values are `true` or `false`. This argument is not supported in all regions or partitions.

[policy](#policy_python) str

Valid [bucket policy](https://docs.aws.amazon.com/AmazonS3/latest/dev/example-bucket-policies.html) JSON document. Note that if the policy document is not specific enough (but still valid), this provider may view the policy as constantly changing. In this case, please make sure you use the verbose/specific version of the policy. For more information about building AWS IAM policy documents with this provider, see the AWS IAM Policy Document Guide. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketPolicy` instead.

Deprecated: policy is deprecated. Use the aws.s3.BucketPolicy resource instead.

[region](#region_python) str

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[replication\_configurations](#replication_configurations_python) [Sequence\[BucketV2ReplicationConfigurationArgs\]](#bucketv2replicationconfiguration)

Configuration of [replication configuration](http://docs.aws.amazon.com/AmazonS3/latest/dev/crr.html). See Replication Configuration below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketReplicationConfig` instead.

Deprecated: replication\_configuration is deprecated. Use the aws.s3.BucketReplicationConfig resource instead.

[request\_payer](#request_payer_python) str

Specifies who should bear the cost of Amazon S3 data transfer. Can be either `BucketOwner` or `Requester`. By default, the owner of the S3 bucket would incur the costs of any data transfer. See [Requester Pays Buckets](http://docs.aws.amazon.com/AmazonS3/latest/dev/RequesterPaysBuckets.html) developer guide for more information. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketRequestPaymentConfiguration` instead.

Deprecated: request\_payer is deprecated. Use the aws.s3.BucketRequestPaymentConfiguration resource instead.

[server\_side\_encryption\_configurations](#server_side_encryption_configurations_python) [Sequence\[BucketV2ServerSideEncryptionConfigurationArgs\]](#bucketv2serversideencryptionconfiguration)

Configuration of [server-side encryption configuration](http://docs.aws.amazon.com/AmazonS3/latest/dev/bucket-encryption.html). See Server Side Encryption Configuration below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketServerSideEncryptionConfiguration` instead.

Deprecated: server\_side\_encryption\_configuration is deprecated. Use the aws.s3.BucketServerSideEncryptionConfiguration resource instead.

[tags](#tags_python) Mapping\[str, str\]

Map of tags to assign to the bucket. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

The following arguments are deprecated, and will be removed in a future major version:

[tags\_all](#tags_all_python) Mapping\[str, str\]

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[versionings](#versionings_python) [Sequence\[BucketV2VersioningArgs\]](#bucketv2versioning)

Configuration of the [S3 bucket versioning state](https://docs.aws.amazon.com/AmazonS3/latest/dev/Versioning.html). See Versioning below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketVersioning` instead.

Deprecated: versioning is deprecated. Use the aws.s3.BucketVersioning resource instead.

[websites](#websites_python) [Sequence\[BucketV2WebsiteArgs\]](#bucketv2website)

Configuration of the [S3 bucket website](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html). See Website below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketWebsiteConfiguration` instead.

Deprecated: website is deprecated. Use the aws.s3.BucketWebsiteConfiguration resource instead.

[accelerationStatus](#accelerationstatus_yaml) String

Sets the accelerate configuration of an existing bucket. Can be `Enabled` or `Suspended`. Cannot be used in `cn-north-1` or `us-gov-west-1`. This provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketAccelerateConfiguration` instead.

Deprecated: acceleration\_status is deprecated. Use the aws.s3.BucketAccelerateConfiguration resource instead.

[acl](#acl_yaml) String

The [canned ACL](https://docs.aws.amazon.com/AmazonS3/latest/dev/acl-overview.html#canned-acl) to apply. Valid values are `private`, `public-read`, `public-read-write`, `aws-exec-read`, `authenticated-read`, and `log-delivery-write`. Defaults to `private`. Conflicts with `grant`. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketAcl` instead.

Deprecated: acl is deprecated. Use the aws.s3.BucketAcl resource instead.

[bucket](#bucket_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Name of the bucket. If omitted, the provider will assign a random, unique name. Must be lowercase and less than or equal to 63 characters in length. A full list of bucket naming rules [may be found here](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html). The name must not be in the format `[bucketName]--[azid]--x-s3`. Use the `aws.s3.DirectoryBucket` resource to manage S3 Express buckets.

[bucketNamespace](#bucketnamespace_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Namespace for the bucket. Determines bucket naming scope. Valid values: `account-regional`, `global`. Defaults to `global` (AWS).

[bucketPrefix](#bucketprefix_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Creates a unique bucket name beginning with the specified prefix. Conflicts with `bucket`. Must be lowercase and less than or equal to 37 characters in length. A full list of bucket naming rules [may be found here](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html).

[corsRules](#corsrules_yaml) [List<Property Map>](#bucketv2corsrule)

Rule of [Cross-Origin Resource Sharing](https://docs.aws.amazon.com/AmazonS3/latest/dev/cors.html). See CORS rule below for details. This provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketCorsConfiguration` instead.

Deprecated: cors\_rule is deprecated. Use the aws.s3.BucketCorsConfiguration resource instead.

[forceDestroy](#forcedestroy_yaml) Boolean

Boolean that indicates all objects (including any [locked objects](https://docs.aws.amazon.com/AmazonS3/latest/dev/object-lock-overview.html)) should be deleted from the bucket *when the bucket is destroyed* so that the bucket can be destroyed without error. These objects are *not* recoverable. This only deletes objects when the bucket is destroyed, *not* when setting this parameter to `true`. Once this parameter is set to `true`, there must be a successful `pulumi up` run before a destroy is required to update this value in the resource state. Without a successful `pulumi up` after this parameter is set, this flag will have no effect. If setting this field in the same operation that would require replacing the bucket or destroying the bucket, this flag will not work. Additionally when importing a bucket, a successful `pulumi up` is required to set this value in state before it will take effect on a destroy operation.

[grants](#grants_yaml) [List<Property Map>](#bucketv2grant)

An [ACL policy grant](https://docs.aws.amazon.com/AmazonS3/latest/dev/acl-overview.html#sample-acl). See Grant below for details. Conflicts with `acl`. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketAcl` instead.

Deprecated: grant is deprecated. Use the aws.s3.BucketAcl resource instead.

[lifecycleRules](#lifecyclerules_yaml) [List<Property Map>](#bucketv2lifecyclerule)

Configuration of [object lifecycle management](http://docs.aws.amazon.com/AmazonS3/latest/dev/object-lifecycle-mgmt.html). See Lifecycle Rule below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketLifecycleConfiguration` instead.

Deprecated: lifecycle\_rule is deprecated. Use the aws.s3.BucketLifecycleConfiguration resource instead.

[loggings](#loggings_yaml) [List<Property Map>](#bucketv2logging)

Configuration of [S3 bucket logging](https://docs.aws.amazon.com/AmazonS3/latest/UG/ManagingBucketLogging.html) parameters. See Logging below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketLogging` instead.

Deprecated: logging is deprecated. Use the aws.s3.BucketLogging resource instead.

[objectLockConfiguration](#objectlockconfiguration_yaml) [Property Map](#bucketv2objectlockconfiguration)

Configuration of [S3 object locking](https://docs.aws.amazon.com/AmazonS3/latest/dev/object-lock.html). See Object Lock Configuration below for details. The provider wil only perform drift detection if a configuration value is provided. Use the `objectLockEnabled` parameter and the resource `aws.s3.BucketObjectLockConfiguration` instead.

Deprecated: object\_lock\_configuration is deprecated. Use the top-level parameter objectLockEnabled and the aws.s3.BucketObjectLockConfiguration resource instead.

[objectLockEnabled](#objectlockenabled_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. Boolean

Indicates whether this bucket has an Object Lock configuration enabled. Valid values are `true` or `false`. This argument is not supported in all regions or partitions.

[policy](#policy_yaml) String

Valid [bucket policy](https://docs.aws.amazon.com/AmazonS3/latest/dev/example-bucket-policies.html) JSON document. Note that if the policy document is not specific enough (but still valid), this provider may view the policy as constantly changing. In this case, please make sure you use the verbose/specific version of the policy. For more information about building AWS IAM policy documents with this provider, see the AWS IAM Policy Document Guide. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketPolicy` instead.

Deprecated: policy is deprecated. Use the aws.s3.BucketPolicy resource instead.

[region](#region_yaml) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[replicationConfigurations](#replicationconfigurations_yaml) [List<Property Map>](#bucketv2replicationconfiguration)

Configuration of [replication configuration](http://docs.aws.amazon.com/AmazonS3/latest/dev/crr.html). See Replication Configuration below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketReplicationConfig` instead.

Deprecated: replication\_configuration is deprecated. Use the aws.s3.BucketReplicationConfig resource instead.

[requestPayer](#requestpayer_yaml) String

Specifies who should bear the cost of Amazon S3 data transfer. Can be either `BucketOwner` or `Requester`. By default, the owner of the S3 bucket would incur the costs of any data transfer. See [Requester Pays Buckets](http://docs.aws.amazon.com/AmazonS3/latest/dev/RequesterPaysBuckets.html) developer guide for more information. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketRequestPaymentConfiguration` instead.

Deprecated: request\_payer is deprecated. Use the aws.s3.BucketRequestPaymentConfiguration resource instead.

[serverSideEncryptionConfigurations](#serversideencryptionconfigurations_yaml) [List<Property Map>](#bucketv2serversideencryptionconfiguration)

Configuration of [server-side encryption configuration](http://docs.aws.amazon.com/AmazonS3/latest/dev/bucket-encryption.html). See Server Side Encryption Configuration below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketServerSideEncryptionConfiguration` instead.

Deprecated: server\_side\_encryption\_configuration is deprecated. Use the aws.s3.BucketServerSideEncryptionConfiguration resource instead.

[tags](#tags_yaml) Map<String>

Map of tags to assign to the bucket. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

The following arguments are deprecated, and will be removed in a future major version:

[tagsAll](#tagsall_yaml) Map<String>

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[versionings](#versionings_yaml) [List<Property Map>](#bucketv2versioning)

Configuration of the [S3 bucket versioning state](https://docs.aws.amazon.com/AmazonS3/latest/dev/Versioning.html). See Versioning below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketVersioning` instead.

Deprecated: versioning is deprecated. Use the aws.s3.BucketVersioning resource instead.

[websites](#websites_yaml) [List<Property Map>](#bucketv2website)

Configuration of the [S3 bucket website](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html). See Website below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketWebsiteConfiguration` instead.

Deprecated: website is deprecated. Use the aws.s3.BucketWebsiteConfiguration resource instead.

### Outputs[](#outputs)

All [input](#inputs) properties are implicitly available as output properties. Additionally, the BucketV2 resource produces the following output properties:

[Arn](#arn_csharp) string

ARN of the bucket. Will be of format `arn:aws:s3:::bucketname`.

[BucketDomainName](#bucketdomainname_csharp) string

Bucket domain name. Will be of format `bucketname.s3.amazonaws.com`.

[BucketRegion](#bucketregion_csharp) string

AWS region this bucket resides in.

[BucketRegionalDomainName](#bucketregionaldomainname_csharp) string

The bucket region-specific domain name. The bucket domain name including the region name. Please refer to the [S3 endpoints reference](https://docs.aws.amazon.com/general/latest/gr/s3.html#s3_region) for format. Note: AWS CloudFront allows specifying an S3 region-specific endpoint when creating an S3 origin. This will prevent redirect issues from CloudFront to the S3 Origin URL. For more information, see the [Virtual Hosted-Style Requests for Other Regions](https://docs.aws.amazon.com/AmazonS3/latest/userguide/VirtualHosting.html#deprecated-global-endpoint) section in the AWS S3 User Guide.

[HostedZoneId](#hostedzoneid_csharp) string

[Route 53 Hosted Zone ID](https://docs.aws.amazon.com/general/latest/gr/rande.html#s3_website_region_endpoints) for this bucket's region.

[Id](#id_csharp) string

The provider-assigned unique ID for this managed resource.

[WebsiteDomain](#websitedomain_csharp) string

(**Deprecated**) Domain of the website endpoint, if the bucket is configured with a website. If not, this will be an empty string. This is used to create Route 53 alias records. Use the resource `aws.s3.BucketWebsiteConfiguration` instead.

Deprecated: website\_domain is deprecated. Use the aws.s3.BucketWebsiteConfiguration resource instead.

[WebsiteEndpoint](#websiteendpoint_csharp) string

(**Deprecated**) Website endpoint, if the bucket is configured with a website. If not, this will be an empty string. Use the resource `aws.s3.BucketWebsiteConfiguration` instead.

Deprecated: website\_endpoint is deprecated. Use the aws.s3.BucketWebsiteConfiguration resource instead.

[Arn](#arn_go) string

ARN of the bucket. Will be of format `arn:aws:s3:::bucketname`.

[BucketDomainName](#bucketdomainname_go) string

Bucket domain name. Will be of format `bucketname.s3.amazonaws.com`.

[BucketRegion](#bucketregion_go) string

AWS region this bucket resides in.

[BucketRegionalDomainName](#bucketregionaldomainname_go) string

The bucket region-specific domain name. The bucket domain name including the region name. Please refer to the [S3 endpoints reference](https://docs.aws.amazon.com/general/latest/gr/s3.html#s3_region) for format. Note: AWS CloudFront allows specifying an S3 region-specific endpoint when creating an S3 origin. This will prevent redirect issues from CloudFront to the S3 Origin URL. For more information, see the [Virtual Hosted-Style Requests for Other Regions](https://docs.aws.amazon.com/AmazonS3/latest/userguide/VirtualHosting.html#deprecated-global-endpoint) section in the AWS S3 User Guide.

[HostedZoneId](#hostedzoneid_go) string

[Route 53 Hosted Zone ID](https://docs.aws.amazon.com/general/latest/gr/rande.html#s3_website_region_endpoints) for this bucket's region.

[Id](#id_go) string

The provider-assigned unique ID for this managed resource.

[WebsiteDomain](#websitedomain_go) string

(**Deprecated**) Domain of the website endpoint, if the bucket is configured with a website. If not, this will be an empty string. This is used to create Route 53 alias records. Use the resource `aws.s3.BucketWebsiteConfiguration` instead.

Deprecated: website\_domain is deprecated. Use the aws.s3.BucketWebsiteConfiguration resource instead.

[WebsiteEndpoint](#websiteendpoint_go) string

(**Deprecated**) Website endpoint, if the bucket is configured with a website. If not, this will be an empty string. Use the resource `aws.s3.BucketWebsiteConfiguration` instead.

Deprecated: website\_endpoint is deprecated. Use the aws.s3.BucketWebsiteConfiguration resource instead.

[arn](#arn_hcl) string

ARN of the bucket. Will be of format `arn:aws:s3:::bucketname`.

[bucket\_domain\_name](#bucket_domain_name_hcl) string

Bucket domain name. Will be of format `bucketname.s3.amazonaws.com`.

[bucket\_region](#bucket_region_hcl) string

AWS region this bucket resides in.

[bucket\_regional\_domain\_name](#bucket_regional_domain_name_hcl) string

The bucket region-specific domain name. The bucket domain name including the region name. Please refer to the [S3 endpoints reference](https://docs.aws.amazon.com/general/latest/gr/s3.html#s3_region) for format. Note: AWS CloudFront allows specifying an S3 region-specific endpoint when creating an S3 origin. This will prevent redirect issues from CloudFront to the S3 Origin URL. For more information, see the [Virtual Hosted-Style Requests for Other Regions](https://docs.aws.amazon.com/AmazonS3/latest/userguide/VirtualHosting.html#deprecated-global-endpoint) section in the AWS S3 User Guide.

[hosted\_zone\_id](#hosted_zone_id_hcl) string

[Route 53 Hosted Zone ID](https://docs.aws.amazon.com/general/latest/gr/rande.html#s3_website_region_endpoints) for this bucket's region.

[id](#id_hcl) string

The provider-assigned unique ID for this managed resource.

[website\_domain](#website_domain_hcl) string

(**Deprecated**) Domain of the website endpoint, if the bucket is configured with a website. If not, this will be an empty string. This is used to create Route 53 alias records. Use the resource `aws.s3.BucketWebsiteConfiguration` instead.

Deprecated: website\_domain is deprecated. Use the aws.s3.BucketWebsiteConfiguration resource instead.

[website\_endpoint](#website_endpoint_hcl) string

(**Deprecated**) Website endpoint, if the bucket is configured with a website. If not, this will be an empty string. Use the resource `aws.s3.BucketWebsiteConfiguration` instead.

Deprecated: website\_endpoint is deprecated. Use the aws.s3.BucketWebsiteConfiguration resource instead.

[arn](#arn_java) String

ARN of the bucket. Will be of format `arn:aws:s3:::bucketname`.

[bucketDomainName](#bucketdomainname_java) String

Bucket domain name. Will be of format `bucketname.s3.amazonaws.com`.

[bucketRegion](#bucketregion_java) String

AWS region this bucket resides in.

[bucketRegionalDomainName](#bucketregionaldomainname_java) String

The bucket region-specific domain name. The bucket domain name including the region name. Please refer to the [S3 endpoints reference](https://docs.aws.amazon.com/general/latest/gr/s3.html#s3_region) for format. Note: AWS CloudFront allows specifying an S3 region-specific endpoint when creating an S3 origin. This will prevent redirect issues from CloudFront to the S3 Origin URL. For more information, see the [Virtual Hosted-Style Requests for Other Regions](https://docs.aws.amazon.com/AmazonS3/latest/userguide/VirtualHosting.html#deprecated-global-endpoint) section in the AWS S3 User Guide.

[hostedZoneId](#hostedzoneid_java) String

[Route 53 Hosted Zone ID](https://docs.aws.amazon.com/general/latest/gr/rande.html#s3_website_region_endpoints) for this bucket's region.

[id](#id_java) String

The provider-assigned unique ID for this managed resource.

[websiteDomain](#websitedomain_java) String

(**Deprecated**) Domain of the website endpoint, if the bucket is configured with a website. If not, this will be an empty string. This is used to create Route 53 alias records. Use the resource `aws.s3.BucketWebsiteConfiguration` instead.

Deprecated: website\_domain is deprecated. Use the aws.s3.BucketWebsiteConfiguration resource instead.

[websiteEndpoint](#websiteendpoint_java) String

(**Deprecated**) Website endpoint, if the bucket is configured with a website. If not, this will be an empty string. Use the resource `aws.s3.BucketWebsiteConfiguration` instead.

Deprecated: website\_endpoint is deprecated. Use the aws.s3.BucketWebsiteConfiguration resource instead.

[arn](#arn_nodejs) string

ARN of the bucket. Will be of format `arn:aws:s3:::bucketname`.

[bucketDomainName](#bucketdomainname_nodejs) string

Bucket domain name. Will be of format `bucketname.s3.amazonaws.com`.

[bucketRegion](#bucketregion_nodejs) string

AWS region this bucket resides in.

[bucketRegionalDomainName](#bucketregionaldomainname_nodejs) string

The bucket region-specific domain name. The bucket domain name including the region name. Please refer to the [S3 endpoints reference](https://docs.aws.amazon.com/general/latest/gr/s3.html#s3_region) for format. Note: AWS CloudFront allows specifying an S3 region-specific endpoint when creating an S3 origin. This will prevent redirect issues from CloudFront to the S3 Origin URL. For more information, see the [Virtual Hosted-Style Requests for Other Regions](https://docs.aws.amazon.com/AmazonS3/latest/userguide/VirtualHosting.html#deprecated-global-endpoint) section in the AWS S3 User Guide.

[hostedZoneId](#hostedzoneid_nodejs) string

[Route 53 Hosted Zone ID](https://docs.aws.amazon.com/general/latest/gr/rande.html#s3_website_region_endpoints) for this bucket's region.

[id](#id_nodejs) string

The provider-assigned unique ID for this managed resource.

[websiteDomain](#websitedomain_nodejs) string

(**Deprecated**) Domain of the website endpoint, if the bucket is configured with a website. If not, this will be an empty string. This is used to create Route 53 alias records. Use the resource `aws.s3.BucketWebsiteConfiguration` instead.

Deprecated: website\_domain is deprecated. Use the aws.s3.BucketWebsiteConfiguration resource instead.

[websiteEndpoint](#websiteendpoint_nodejs) string

(**Deprecated**) Website endpoint, if the bucket is configured with a website. If not, this will be an empty string. Use the resource `aws.s3.BucketWebsiteConfiguration` instead.

Deprecated: website\_endpoint is deprecated. Use the aws.s3.BucketWebsiteConfiguration resource instead.

[arn](#arn_python) str

ARN of the bucket. Will be of format `arn:aws:s3:::bucketname`.

[bucket\_domain\_name](#bucket_domain_name_python) str

Bucket domain name. Will be of format `bucketname.s3.amazonaws.com`.

[bucket\_region](#bucket_region_python) str

AWS region this bucket resides in.

[bucket\_regional\_domain\_name](#bucket_regional_domain_name_python) str

The bucket region-specific domain name. The bucket domain name including the region name. Please refer to the [S3 endpoints reference](https://docs.aws.amazon.com/general/latest/gr/s3.html#s3_region) for format. Note: AWS CloudFront allows specifying an S3 region-specific endpoint when creating an S3 origin. This will prevent redirect issues from CloudFront to the S3 Origin URL. For more information, see the [Virtual Hosted-Style Requests for Other Regions](https://docs.aws.amazon.com/AmazonS3/latest/userguide/VirtualHosting.html#deprecated-global-endpoint) section in the AWS S3 User Guide.

[hosted\_zone\_id](#hosted_zone_id_python) str

[Route 53 Hosted Zone ID](https://docs.aws.amazon.com/general/latest/gr/rande.html#s3_website_region_endpoints) for this bucket's region.

[id](#id_python) str

The provider-assigned unique ID for this managed resource.

[website\_domain](#website_domain_python) str

(**Deprecated**) Domain of the website endpoint, if the bucket is configured with a website. If not, this will be an empty string. This is used to create Route 53 alias records. Use the resource `aws.s3.BucketWebsiteConfiguration` instead.

Deprecated: website\_domain is deprecated. Use the aws.s3.BucketWebsiteConfiguration resource instead.

[website\_endpoint](#website_endpoint_python) str

(**Deprecated**) Website endpoint, if the bucket is configured with a website. If not, this will be an empty string. Use the resource `aws.s3.BucketWebsiteConfiguration` instead.

Deprecated: website\_endpoint is deprecated. Use the aws.s3.BucketWebsiteConfiguration resource instead.

[arn](#arn_yaml) String

ARN of the bucket. Will be of format `arn:aws:s3:::bucketname`.

[bucketDomainName](#bucketdomainname_yaml) String

Bucket domain name. Will be of format `bucketname.s3.amazonaws.com`.

[bucketRegion](#bucketregion_yaml) String

AWS region this bucket resides in.

[bucketRegionalDomainName](#bucketregionaldomainname_yaml) String

The bucket region-specific domain name. The bucket domain name including the region name. Please refer to the [S3 endpoints reference](https://docs.aws.amazon.com/general/latest/gr/s3.html#s3_region) for format. Note: AWS CloudFront allows specifying an S3 region-specific endpoint when creating an S3 origin. This will prevent redirect issues from CloudFront to the S3 Origin URL. For more information, see the [Virtual Hosted-Style Requests for Other Regions](https://docs.aws.amazon.com/AmazonS3/latest/userguide/VirtualHosting.html#deprecated-global-endpoint) section in the AWS S3 User Guide.

[hostedZoneId](#hostedzoneid_yaml) String

[Route 53 Hosted Zone ID](https://docs.aws.amazon.com/general/latest/gr/rande.html#s3_website_region_endpoints) for this bucket's region.

[id](#id_yaml) String

The provider-assigned unique ID for this managed resource.

[websiteDomain](#websitedomain_yaml) String

(**Deprecated**) Domain of the website endpoint, if the bucket is configured with a website. If not, this will be an empty string. This is used to create Route 53 alias records. Use the resource `aws.s3.BucketWebsiteConfiguration` instead.

Deprecated: website\_domain is deprecated. Use the aws.s3.BucketWebsiteConfiguration resource instead.

[websiteEndpoint](#websiteendpoint_yaml) String

(**Deprecated**) Website endpoint, if the bucket is configured with a website. If not, this will be an empty string. Use the resource `aws.s3.BucketWebsiteConfiguration` instead.

Deprecated: website\_endpoint is deprecated. Use the aws.s3.BucketWebsiteConfiguration resource instead.

## Look up Existing BucketV2 Resource[](#look-up)

Get an existing BucketV2 resource’s state with the given name, ID, and optional extra properties used to qualify the lookup.

-   TypeScript
-   Python
-   Go
-   C#
-   Java
-   YAML
-   HCL PREVIEW

```typescript
public static get(name: string, id: Input<ID>, state?: BucketV2State, opts?: CustomResourceOptions): BucketV2
```

```python
@staticmethod
def get(resource_name: str,
        id: str,
        opts: Optional[ResourceOptions] = None,
        acceleration_status: Optional[str] = None,
        acl: Optional[str] = None,
        arn: Optional[str] = None,
        bucket: Optional[str] = None,
        bucket_domain_name: Optional[str] = None,
        bucket_namespace: Optional[str] = None,
        bucket_prefix: Optional[str] = None,
        bucket_region: Optional[str] = None,
        bucket_regional_domain_name: Optional[str] = None,
        cors_rules: Optional[Sequence[BucketV2CorsRuleArgs]] = None,
        force_destroy: Optional[bool] = None,
        grants: Optional[Sequence[BucketV2GrantArgs]] = None,
        hosted_zone_id: Optional[str] = None,
        lifecycle_rules: Optional[Sequence[BucketV2LifecycleRuleArgs]] = None,
        loggings: Optional[Sequence[BucketV2LoggingArgs]] = None,
        object_lock_configuration: Optional[BucketV2ObjectLockConfigurationArgs] = None,
        object_lock_enabled: Optional[bool] = None,
        policy: Optional[str] = None,
        region: Optional[str] = None,
        replication_configurations: Optional[Sequence[BucketV2ReplicationConfigurationArgs]] = None,
        request_payer: Optional[str] = None,
        server_side_encryption_configurations: Optional[Sequence[BucketV2ServerSideEncryptionConfigurationArgs]] = None,
        tags: Optional[Mapping[str, str]] = None,
        tags_all: Optional[Mapping[str, str]] = None,
        versionings: Optional[Sequence[BucketV2VersioningArgs]] = None,
        website_domain: Optional[str] = None,
        website_endpoint: Optional[str] = None,
        websites: Optional[Sequence[BucketV2WebsiteArgs]] = None) -> BucketV2
```

```go
func GetBucketV2(ctx *Context, name string, id IDInput, state *BucketV2State, opts ...ResourceOption) (*BucketV2, error)
```

```csharp
public static BucketV2 Get(string name, Input<string> id, BucketV2State? state, CustomResourceOptions? opts = null)
```

```java
public static BucketV2 get(String name, Output<String> id, BucketV2State state, CustomResourceOptions options)
```

```yaml
resources:  _:    type: aws:s3:BucketV2    get:      id: ${id}
```

```hcl
import {
  to = aws_s3_bucketv2.example
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

[AccelerationStatus](#state_accelerationstatus_csharp) string

Sets the accelerate configuration of an existing bucket. Can be `Enabled` or `Suspended`. Cannot be used in `cn-north-1` or `us-gov-west-1`. This provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketAccelerateConfiguration` instead.

Deprecated: acceleration\_status is deprecated. Use the aws.s3.BucketAccelerateConfiguration resource instead.

[Acl](#state_acl_csharp) string

The [canned ACL](https://docs.aws.amazon.com/AmazonS3/latest/dev/acl-overview.html#canned-acl) to apply. Valid values are `private`, `public-read`, `public-read-write`, `aws-exec-read`, `authenticated-read`, and `log-delivery-write`. Defaults to `private`. Conflicts with `grant`. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketAcl` instead.

Deprecated: acl is deprecated. Use the aws.s3.BucketAcl resource instead.

[Arn](#state_arn_csharp) string

ARN of the bucket. Will be of format `arn:aws:s3:::bucketname`.

[Bucket](#state_bucket_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Name of the bucket. If omitted, the provider will assign a random, unique name. Must be lowercase and less than or equal to 63 characters in length. A full list of bucket naming rules [may be found here](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html). The name must not be in the format `[bucketName]--[azid]--x-s3`. Use the `aws.s3.DirectoryBucket` resource to manage S3 Express buckets.

[BucketDomainName](#state_bucketdomainname_csharp) string

Bucket domain name. Will be of format `bucketname.s3.amazonaws.com`.

[BucketNamespace](#state_bucketnamespace_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Namespace for the bucket. Determines bucket naming scope. Valid values: `account-regional`, `global`. Defaults to `global` (AWS).

[BucketPrefix](#state_bucketprefix_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Creates a unique bucket name beginning with the specified prefix. Conflicts with `bucket`. Must be lowercase and less than or equal to 37 characters in length. A full list of bucket naming rules [may be found here](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html).

[BucketRegion](#state_bucketregion_csharp) string

AWS region this bucket resides in.

[BucketRegionalDomainName](#state_bucketregionaldomainname_csharp) string

The bucket region-specific domain name. The bucket domain name including the region name. Please refer to the [S3 endpoints reference](https://docs.aws.amazon.com/general/latest/gr/s3.html#s3_region) for format. Note: AWS CloudFront allows specifying an S3 region-specific endpoint when creating an S3 origin. This will prevent redirect issues from CloudFront to the S3 Origin URL. For more information, see the [Virtual Hosted-Style Requests for Other Regions](https://docs.aws.amazon.com/AmazonS3/latest/userguide/VirtualHosting.html#deprecated-global-endpoint) section in the AWS S3 User Guide.

[CorsRules](#state_corsrules_csharp) [List<BucketV2CorsRule>](#bucketv2corsrule)

Rule of [Cross-Origin Resource Sharing](https://docs.aws.amazon.com/AmazonS3/latest/dev/cors.html). See CORS rule below for details. This provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketCorsConfiguration` instead.

Deprecated: cors\_rule is deprecated. Use the aws.s3.BucketCorsConfiguration resource instead.

[ForceDestroy](#state_forcedestroy_csharp) bool

Boolean that indicates all objects (including any [locked objects](https://docs.aws.amazon.com/AmazonS3/latest/dev/object-lock-overview.html)) should be deleted from the bucket *when the bucket is destroyed* so that the bucket can be destroyed without error. These objects are *not* recoverable. This only deletes objects when the bucket is destroyed, *not* when setting this parameter to `true`. Once this parameter is set to `true`, there must be a successful `pulumi up` run before a destroy is required to update this value in the resource state. Without a successful `pulumi up` after this parameter is set, this flag will have no effect. If setting this field in the same operation that would require replacing the bucket or destroying the bucket, this flag will not work. Additionally when importing a bucket, a successful `pulumi up` is required to set this value in state before it will take effect on a destroy operation.

[Grants](#state_grants_csharp) [List<BucketV2Grant>](#bucketv2grant)

An [ACL policy grant](https://docs.aws.amazon.com/AmazonS3/latest/dev/acl-overview.html#sample-acl). See Grant below for details. Conflicts with `acl`. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketAcl` instead.

Deprecated: grant is deprecated. Use the aws.s3.BucketAcl resource instead.

[HostedZoneId](#state_hostedzoneid_csharp) string

[Route 53 Hosted Zone ID](https://docs.aws.amazon.com/general/latest/gr/rande.html#s3_website_region_endpoints) for this bucket's region.

[LifecycleRules](#state_lifecyclerules_csharp) [List<BucketV2LifecycleRule>](#bucketv2lifecyclerule)

Configuration of [object lifecycle management](http://docs.aws.amazon.com/AmazonS3/latest/dev/object-lifecycle-mgmt.html). See Lifecycle Rule below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketLifecycleConfiguration` instead.

Deprecated: lifecycle\_rule is deprecated. Use the aws.s3.BucketLifecycleConfiguration resource instead.

[Loggings](#state_loggings_csharp) [List<BucketV2Logging>](#bucketv2logging)

Configuration of [S3 bucket logging](https://docs.aws.amazon.com/AmazonS3/latest/UG/ManagingBucketLogging.html) parameters. See Logging below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketLogging` instead.

Deprecated: logging is deprecated. Use the aws.s3.BucketLogging resource instead.

[ObjectLockConfiguration](#state_objectlockconfiguration_csharp) [BucketV2ObjectLockConfiguration](#bucketv2objectlockconfiguration)

Configuration of [S3 object locking](https://docs.aws.amazon.com/AmazonS3/latest/dev/object-lock.html). See Object Lock Configuration below for details. The provider wil only perform drift detection if a configuration value is provided. Use the `objectLockEnabled` parameter and the resource `aws.s3.BucketObjectLockConfiguration` instead.

Deprecated: object\_lock\_configuration is deprecated. Use the top-level parameter objectLockEnabled and the aws.s3.BucketObjectLockConfiguration resource instead.

[ObjectLockEnabled](#state_objectlockenabled_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. bool

Indicates whether this bucket has an Object Lock configuration enabled. Valid values are `true` or `false`. This argument is not supported in all regions or partitions.

[Policy](#state_policy_csharp) string

Valid [bucket policy](https://docs.aws.amazon.com/AmazonS3/latest/dev/example-bucket-policies.html) JSON document. Note that if the policy document is not specific enough (but still valid), this provider may view the policy as constantly changing. In this case, please make sure you use the verbose/specific version of the policy. For more information about building AWS IAM policy documents with this provider, see the AWS IAM Policy Document Guide. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketPolicy` instead.

Deprecated: policy is deprecated. Use the aws.s3.BucketPolicy resource instead.

[Region](#state_region_csharp) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[ReplicationConfigurations](#state_replicationconfigurations_csharp) [List<BucketV2ReplicationConfiguration>](#bucketv2replicationconfiguration)

Configuration of [replication configuration](http://docs.aws.amazon.com/AmazonS3/latest/dev/crr.html). See Replication Configuration below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketReplicationConfig` instead.

Deprecated: replication\_configuration is deprecated. Use the aws.s3.BucketReplicationConfig resource instead.

[RequestPayer](#state_requestpayer_csharp) string

Specifies who should bear the cost of Amazon S3 data transfer. Can be either `BucketOwner` or `Requester`. By default, the owner of the S3 bucket would incur the costs of any data transfer. See [Requester Pays Buckets](http://docs.aws.amazon.com/AmazonS3/latest/dev/RequesterPaysBuckets.html) developer guide for more information. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketRequestPaymentConfiguration` instead.

Deprecated: request\_payer is deprecated. Use the aws.s3.BucketRequestPaymentConfiguration resource instead.

[ServerSideEncryptionConfigurations](#state_serversideencryptionconfigurations_csharp) [List<BucketV2ServerSideEncryptionConfiguration>](#bucketv2serversideencryptionconfiguration)

Configuration of [server-side encryption configuration](http://docs.aws.amazon.com/AmazonS3/latest/dev/bucket-encryption.html). See Server Side Encryption Configuration below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketServerSideEncryptionConfiguration` instead.

Deprecated: server\_side\_encryption\_configuration is deprecated. Use the aws.s3.BucketServerSideEncryptionConfiguration resource instead.

[Tags](#state_tags_csharp) Dictionary<string, string>

Map of tags to assign to the bucket. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

The following arguments are deprecated, and will be removed in a future major version:

[TagsAll](#state_tagsall_csharp) Dictionary<string, string>

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[Versionings](#state_versionings_csharp) [List<BucketV2Versioning>](#bucketv2versioning)

Configuration of the [S3 bucket versioning state](https://docs.aws.amazon.com/AmazonS3/latest/dev/Versioning.html). See Versioning below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketVersioning` instead.

Deprecated: versioning is deprecated. Use the aws.s3.BucketVersioning resource instead.

[WebsiteDomain](#state_websitedomain_csharp) string

(**Deprecated**) Domain of the website endpoint, if the bucket is configured with a website. If not, this will be an empty string. This is used to create Route 53 alias records. Use the resource `aws.s3.BucketWebsiteConfiguration` instead.

Deprecated: website\_domain is deprecated. Use the aws.s3.BucketWebsiteConfiguration resource instead.

[WebsiteEndpoint](#state_websiteendpoint_csharp) string

(**Deprecated**) Website endpoint, if the bucket is configured with a website. If not, this will be an empty string. Use the resource `aws.s3.BucketWebsiteConfiguration` instead.

Deprecated: website\_endpoint is deprecated. Use the aws.s3.BucketWebsiteConfiguration resource instead.

[Websites](#state_websites_csharp) [List<BucketV2Website>](#bucketv2website)

Configuration of the [S3 bucket website](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html). See Website below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketWebsiteConfiguration` instead.

Deprecated: website is deprecated. Use the aws.s3.BucketWebsiteConfiguration resource instead.

[AccelerationStatus](#state_accelerationstatus_go) string

Sets the accelerate configuration of an existing bucket. Can be `Enabled` or `Suspended`. Cannot be used in `cn-north-1` or `us-gov-west-1`. This provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketAccelerateConfiguration` instead.

Deprecated: acceleration\_status is deprecated. Use the aws.s3.BucketAccelerateConfiguration resource instead.

[Acl](#state_acl_go) string

The [canned ACL](https://docs.aws.amazon.com/AmazonS3/latest/dev/acl-overview.html#canned-acl) to apply. Valid values are `private`, `public-read`, `public-read-write`, `aws-exec-read`, `authenticated-read`, and `log-delivery-write`. Defaults to `private`. Conflicts with `grant`. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketAcl` instead.

Deprecated: acl is deprecated. Use the aws.s3.BucketAcl resource instead.

[Arn](#state_arn_go) string

ARN of the bucket. Will be of format `arn:aws:s3:::bucketname`.

[Bucket](#state_bucket_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Name of the bucket. If omitted, the provider will assign a random, unique name. Must be lowercase and less than or equal to 63 characters in length. A full list of bucket naming rules [may be found here](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html). The name must not be in the format `[bucketName]--[azid]--x-s3`. Use the `aws.s3.DirectoryBucket` resource to manage S3 Express buckets.

[BucketDomainName](#state_bucketdomainname_go) string

Bucket domain name. Will be of format `bucketname.s3.amazonaws.com`.

[BucketNamespace](#state_bucketnamespace_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Namespace for the bucket. Determines bucket naming scope. Valid values: `account-regional`, `global`. Defaults to `global` (AWS).

[BucketPrefix](#state_bucketprefix_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Creates a unique bucket name beginning with the specified prefix. Conflicts with `bucket`. Must be lowercase and less than or equal to 37 characters in length. A full list of bucket naming rules [may be found here](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html).

[BucketRegion](#state_bucketregion_go) string

AWS region this bucket resides in.

[BucketRegionalDomainName](#state_bucketregionaldomainname_go) string

The bucket region-specific domain name. The bucket domain name including the region name. Please refer to the [S3 endpoints reference](https://docs.aws.amazon.com/general/latest/gr/s3.html#s3_region) for format. Note: AWS CloudFront allows specifying an S3 region-specific endpoint when creating an S3 origin. This will prevent redirect issues from CloudFront to the S3 Origin URL. For more information, see the [Virtual Hosted-Style Requests for Other Regions](https://docs.aws.amazon.com/AmazonS3/latest/userguide/VirtualHosting.html#deprecated-global-endpoint) section in the AWS S3 User Guide.

[CorsRules](#state_corsrules_go) [\[\]BucketV2CorsRuleArgs](#bucketv2corsrule)

Rule of [Cross-Origin Resource Sharing](https://docs.aws.amazon.com/AmazonS3/latest/dev/cors.html). See CORS rule below for details. This provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketCorsConfiguration` instead.

Deprecated: cors\_rule is deprecated. Use the aws.s3.BucketCorsConfiguration resource instead.

[ForceDestroy](#state_forcedestroy_go) bool

Boolean that indicates all objects (including any [locked objects](https://docs.aws.amazon.com/AmazonS3/latest/dev/object-lock-overview.html)) should be deleted from the bucket *when the bucket is destroyed* so that the bucket can be destroyed without error. These objects are *not* recoverable. This only deletes objects when the bucket is destroyed, *not* when setting this parameter to `true`. Once this parameter is set to `true`, there must be a successful `pulumi up` run before a destroy is required to update this value in the resource state. Without a successful `pulumi up` after this parameter is set, this flag will have no effect. If setting this field in the same operation that would require replacing the bucket or destroying the bucket, this flag will not work. Additionally when importing a bucket, a successful `pulumi up` is required to set this value in state before it will take effect on a destroy operation.

[Grants](#state_grants_go) [\[\]BucketV2GrantArgs](#bucketv2grant)

An [ACL policy grant](https://docs.aws.amazon.com/AmazonS3/latest/dev/acl-overview.html#sample-acl). See Grant below for details. Conflicts with `acl`. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketAcl` instead.

Deprecated: grant is deprecated. Use the aws.s3.BucketAcl resource instead.

[HostedZoneId](#state_hostedzoneid_go) string

[Route 53 Hosted Zone ID](https://docs.aws.amazon.com/general/latest/gr/rande.html#s3_website_region_endpoints) for this bucket's region.

[LifecycleRules](#state_lifecyclerules_go) [\[\]BucketV2LifecycleRuleArgs](#bucketv2lifecyclerule)

Configuration of [object lifecycle management](http://docs.aws.amazon.com/AmazonS3/latest/dev/object-lifecycle-mgmt.html). See Lifecycle Rule below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketLifecycleConfiguration` instead.

Deprecated: lifecycle\_rule is deprecated. Use the aws.s3.BucketLifecycleConfiguration resource instead.

[Loggings](#state_loggings_go) [\[\]BucketV2LoggingArgs](#bucketv2logging)

Configuration of [S3 bucket logging](https://docs.aws.amazon.com/AmazonS3/latest/UG/ManagingBucketLogging.html) parameters. See Logging below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketLogging` instead.

Deprecated: logging is deprecated. Use the aws.s3.BucketLogging resource instead.

[ObjectLockConfiguration](#state_objectlockconfiguration_go) [BucketV2ObjectLockConfigurationArgs](#bucketv2objectlockconfiguration)

Configuration of [S3 object locking](https://docs.aws.amazon.com/AmazonS3/latest/dev/object-lock.html). See Object Lock Configuration below for details. The provider wil only perform drift detection if a configuration value is provided. Use the `objectLockEnabled` parameter and the resource `aws.s3.BucketObjectLockConfiguration` instead.

Deprecated: object\_lock\_configuration is deprecated. Use the top-level parameter objectLockEnabled and the aws.s3.BucketObjectLockConfiguration resource instead.

[ObjectLockEnabled](#state_objectlockenabled_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. bool

Indicates whether this bucket has an Object Lock configuration enabled. Valid values are `true` or `false`. This argument is not supported in all regions or partitions.

[Policy](#state_policy_go) string

Valid [bucket policy](https://docs.aws.amazon.com/AmazonS3/latest/dev/example-bucket-policies.html) JSON document. Note that if the policy document is not specific enough (but still valid), this provider may view the policy as constantly changing. In this case, please make sure you use the verbose/specific version of the policy. For more information about building AWS IAM policy documents with this provider, see the AWS IAM Policy Document Guide. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketPolicy` instead.

Deprecated: policy is deprecated. Use the aws.s3.BucketPolicy resource instead.

[Region](#state_region_go) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[ReplicationConfigurations](#state_replicationconfigurations_go) [\[\]BucketV2ReplicationConfigurationArgs](#bucketv2replicationconfiguration)

Configuration of [replication configuration](http://docs.aws.amazon.com/AmazonS3/latest/dev/crr.html). See Replication Configuration below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketReplicationConfig` instead.

Deprecated: replication\_configuration is deprecated. Use the aws.s3.BucketReplicationConfig resource instead.

[RequestPayer](#state_requestpayer_go) string

Specifies who should bear the cost of Amazon S3 data transfer. Can be either `BucketOwner` or `Requester`. By default, the owner of the S3 bucket would incur the costs of any data transfer. See [Requester Pays Buckets](http://docs.aws.amazon.com/AmazonS3/latest/dev/RequesterPaysBuckets.html) developer guide for more information. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketRequestPaymentConfiguration` instead.

Deprecated: request\_payer is deprecated. Use the aws.s3.BucketRequestPaymentConfiguration resource instead.

[ServerSideEncryptionConfigurations](#state_serversideencryptionconfigurations_go) [\[\]BucketV2ServerSideEncryptionConfigurationArgs](#bucketv2serversideencryptionconfiguration)

Configuration of [server-side encryption configuration](http://docs.aws.amazon.com/AmazonS3/latest/dev/bucket-encryption.html). See Server Side Encryption Configuration below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketServerSideEncryptionConfiguration` instead.

Deprecated: server\_side\_encryption\_configuration is deprecated. Use the aws.s3.BucketServerSideEncryptionConfiguration resource instead.

[Tags](#state_tags_go) map\[string\]string

Map of tags to assign to the bucket. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

The following arguments are deprecated, and will be removed in a future major version:

[TagsAll](#state_tagsall_go) map\[string\]string

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[Versionings](#state_versionings_go) [\[\]BucketV2VersioningArgs](#bucketv2versioning)

Configuration of the [S3 bucket versioning state](https://docs.aws.amazon.com/AmazonS3/latest/dev/Versioning.html). See Versioning below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketVersioning` instead.

Deprecated: versioning is deprecated. Use the aws.s3.BucketVersioning resource instead.

[WebsiteDomain](#state_websitedomain_go) string

(**Deprecated**) Domain of the website endpoint, if the bucket is configured with a website. If not, this will be an empty string. This is used to create Route 53 alias records. Use the resource `aws.s3.BucketWebsiteConfiguration` instead.

Deprecated: website\_domain is deprecated. Use the aws.s3.BucketWebsiteConfiguration resource instead.

[WebsiteEndpoint](#state_websiteendpoint_go) string

(**Deprecated**) Website endpoint, if the bucket is configured with a website. If not, this will be an empty string. Use the resource `aws.s3.BucketWebsiteConfiguration` instead.

Deprecated: website\_endpoint is deprecated. Use the aws.s3.BucketWebsiteConfiguration resource instead.

[Websites](#state_websites_go) [\[\]BucketV2WebsiteArgs](#bucketv2website)

Configuration of the [S3 bucket website](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html). See Website below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketWebsiteConfiguration` instead.

Deprecated: website is deprecated. Use the aws.s3.BucketWebsiteConfiguration resource instead.

[acceleration\_status](#state_acceleration_status_hcl) string

Sets the accelerate configuration of an existing bucket. Can be `Enabled` or `Suspended`. Cannot be used in `cn-north-1` or `us-gov-west-1`. This provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketAccelerateConfiguration` instead.

Deprecated: acceleration\_status is deprecated. Use the aws.s3.BucketAccelerateConfiguration resource instead.

[acl](#state_acl_hcl) string

The [canned ACL](https://docs.aws.amazon.com/AmazonS3/latest/dev/acl-overview.html#canned-acl) to apply. Valid values are `private`, `public-read`, `public-read-write`, `aws-exec-read`, `authenticated-read`, and `log-delivery-write`. Defaults to `private`. Conflicts with `grant`. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketAcl` instead.

Deprecated: acl is deprecated. Use the aws.s3.BucketAcl resource instead.

[arn](#state_arn_hcl) string

ARN of the bucket. Will be of format `arn:aws:s3:::bucketname`.

[bucket](#state_bucket_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Name of the bucket. If omitted, the provider will assign a random, unique name. Must be lowercase and less than or equal to 63 characters in length. A full list of bucket naming rules [may be found here](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html). The name must not be in the format `[bucketName]--[azid]--x-s3`. Use the `aws.s3.DirectoryBucket` resource to manage S3 Express buckets.

[bucket\_domain\_name](#state_bucket_domain_name_hcl) string

Bucket domain name. Will be of format `bucketname.s3.amazonaws.com`.

[bucket\_namespace](#state_bucket_namespace_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Namespace for the bucket. Determines bucket naming scope. Valid values: `account-regional`, `global`. Defaults to `global` (AWS).

[bucket\_prefix](#state_bucket_prefix_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Creates a unique bucket name beginning with the specified prefix. Conflicts with `bucket`. Must be lowercase and less than or equal to 37 characters in length. A full list of bucket naming rules [may be found here](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html).

[bucket\_region](#state_bucket_region_hcl) string

AWS region this bucket resides in.

[bucket\_regional\_domain\_name](#state_bucket_regional_domain_name_hcl) string

The bucket region-specific domain name. The bucket domain name including the region name. Please refer to the [S3 endpoints reference](https://docs.aws.amazon.com/general/latest/gr/s3.html#s3_region) for format. Note: AWS CloudFront allows specifying an S3 region-specific endpoint when creating an S3 origin. This will prevent redirect issues from CloudFront to the S3 Origin URL. For more information, see the [Virtual Hosted-Style Requests for Other Regions](https://docs.aws.amazon.com/AmazonS3/latest/userguide/VirtualHosting.html#deprecated-global-endpoint) section in the AWS S3 User Guide.

[cors\_rules](#state_cors_rules_hcl) [list(object)](#bucketv2corsrule)

Rule of [Cross-Origin Resource Sharing](https://docs.aws.amazon.com/AmazonS3/latest/dev/cors.html). See CORS rule below for details. This provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketCorsConfiguration` instead.

Deprecated: cors\_rule is deprecated. Use the aws.s3.BucketCorsConfiguration resource instead.

[force\_destroy](#state_force_destroy_hcl) bool

Boolean that indicates all objects (including any [locked objects](https://docs.aws.amazon.com/AmazonS3/latest/dev/object-lock-overview.html)) should be deleted from the bucket *when the bucket is destroyed* so that the bucket can be destroyed without error. These objects are *not* recoverable. This only deletes objects when the bucket is destroyed, *not* when setting this parameter to `true`. Once this parameter is set to `true`, there must be a successful `pulumi up` run before a destroy is required to update this value in the resource state. Without a successful `pulumi up` after this parameter is set, this flag will have no effect. If setting this field in the same operation that would require replacing the bucket or destroying the bucket, this flag will not work. Additionally when importing a bucket, a successful `pulumi up` is required to set this value in state before it will take effect on a destroy operation.

[grants](#state_grants_hcl) [list(object)](#bucketv2grant)

An [ACL policy grant](https://docs.aws.amazon.com/AmazonS3/latest/dev/acl-overview.html#sample-acl). See Grant below for details. Conflicts with `acl`. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketAcl` instead.

Deprecated: grant is deprecated. Use the aws.s3.BucketAcl resource instead.

[hosted\_zone\_id](#state_hosted_zone_id_hcl) string

[Route 53 Hosted Zone ID](https://docs.aws.amazon.com/general/latest/gr/rande.html#s3_website_region_endpoints) for this bucket's region.

[lifecycle\_rules](#state_lifecycle_rules_hcl) [list(object)](#bucketv2lifecyclerule)

Configuration of [object lifecycle management](http://docs.aws.amazon.com/AmazonS3/latest/dev/object-lifecycle-mgmt.html). See Lifecycle Rule below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketLifecycleConfiguration` instead.

Deprecated: lifecycle\_rule is deprecated. Use the aws.s3.BucketLifecycleConfiguration resource instead.

[loggings](#state_loggings_hcl) [list(object)](#bucketv2logging)

Configuration of [S3 bucket logging](https://docs.aws.amazon.com/AmazonS3/latest/UG/ManagingBucketLogging.html) parameters. See Logging below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketLogging` instead.

Deprecated: logging is deprecated. Use the aws.s3.BucketLogging resource instead.

[object\_lock\_configuration](#state_object_lock_configuration_hcl) [object](#bucketv2objectlockconfiguration)

Configuration of [S3 object locking](https://docs.aws.amazon.com/AmazonS3/latest/dev/object-lock.html). See Object Lock Configuration below for details. The provider wil only perform drift detection if a configuration value is provided. Use the `objectLockEnabled` parameter and the resource `aws.s3.BucketObjectLockConfiguration` instead.

Deprecated: object\_lock\_configuration is deprecated. Use the top-level parameter objectLockEnabled and the aws.s3.BucketObjectLockConfiguration resource instead.

[object\_lock\_enabled](#state_object_lock_enabled_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. bool

Indicates whether this bucket has an Object Lock configuration enabled. Valid values are `true` or `false`. This argument is not supported in all regions or partitions.

[policy](#state_policy_hcl) string

Valid [bucket policy](https://docs.aws.amazon.com/AmazonS3/latest/dev/example-bucket-policies.html) JSON document. Note that if the policy document is not specific enough (but still valid), this provider may view the policy as constantly changing. In this case, please make sure you use the verbose/specific version of the policy. For more information about building AWS IAM policy documents with this provider, see the AWS IAM Policy Document Guide. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketPolicy` instead.

Deprecated: policy is deprecated. Use the aws.s3.BucketPolicy resource instead.

[region](#state_region_hcl) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[replication\_configurations](#state_replication_configurations_hcl) [list(object)](#bucketv2replicationconfiguration)

Configuration of [replication configuration](http://docs.aws.amazon.com/AmazonS3/latest/dev/crr.html). See Replication Configuration below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketReplicationConfig` instead.

Deprecated: replication\_configuration is deprecated. Use the aws.s3.BucketReplicationConfig resource instead.

[request\_payer](#state_request_payer_hcl) string

Specifies who should bear the cost of Amazon S3 data transfer. Can be either `BucketOwner` or `Requester`. By default, the owner of the S3 bucket would incur the costs of any data transfer. See [Requester Pays Buckets](http://docs.aws.amazon.com/AmazonS3/latest/dev/RequesterPaysBuckets.html) developer guide for more information. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketRequestPaymentConfiguration` instead.

Deprecated: request\_payer is deprecated. Use the aws.s3.BucketRequestPaymentConfiguration resource instead.

[server\_side\_encryption\_configurations](#state_server_side_encryption_configurations_hcl) [list(object)](#bucketv2serversideencryptionconfiguration)

Configuration of [server-side encryption configuration](http://docs.aws.amazon.com/AmazonS3/latest/dev/bucket-encryption.html). See Server Side Encryption Configuration below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketServerSideEncryptionConfiguration` instead.

Deprecated: server\_side\_encryption\_configuration is deprecated. Use the aws.s3.BucketServerSideEncryptionConfiguration resource instead.

[tags](#state_tags_hcl) map(string)

Map of tags to assign to the bucket. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

The following arguments are deprecated, and will be removed in a future major version:

[tags\_all](#state_tags_all_hcl) map(string)

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[versionings](#state_versionings_hcl) [list(object)](#bucketv2versioning)

Configuration of the [S3 bucket versioning state](https://docs.aws.amazon.com/AmazonS3/latest/dev/Versioning.html). See Versioning below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketVersioning` instead.

Deprecated: versioning is deprecated. Use the aws.s3.BucketVersioning resource instead.

[website\_domain](#state_website_domain_hcl) string

(**Deprecated**) Domain of the website endpoint, if the bucket is configured with a website. If not, this will be an empty string. This is used to create Route 53 alias records. Use the resource `aws.s3.BucketWebsiteConfiguration` instead.

Deprecated: website\_domain is deprecated. Use the aws.s3.BucketWebsiteConfiguration resource instead.

[website\_endpoint](#state_website_endpoint_hcl) string

(**Deprecated**) Website endpoint, if the bucket is configured with a website. If not, this will be an empty string. Use the resource `aws.s3.BucketWebsiteConfiguration` instead.

Deprecated: website\_endpoint is deprecated. Use the aws.s3.BucketWebsiteConfiguration resource instead.

[websites](#state_websites_hcl) [list(object)](#bucketv2website)

Configuration of the [S3 bucket website](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html). See Website below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketWebsiteConfiguration` instead.

Deprecated: website is deprecated. Use the aws.s3.BucketWebsiteConfiguration resource instead.

[accelerationStatus](#state_accelerationstatus_java) String

Sets the accelerate configuration of an existing bucket. Can be `Enabled` or `Suspended`. Cannot be used in `cn-north-1` or `us-gov-west-1`. This provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketAccelerateConfiguration` instead.

Deprecated: acceleration\_status is deprecated. Use the aws.s3.BucketAccelerateConfiguration resource instead.

[acl](#state_acl_java) String

The [canned ACL](https://docs.aws.amazon.com/AmazonS3/latest/dev/acl-overview.html#canned-acl) to apply. Valid values are `private`, `public-read`, `public-read-write`, `aws-exec-read`, `authenticated-read`, and `log-delivery-write`. Defaults to `private`. Conflicts with `grant`. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketAcl` instead.

Deprecated: acl is deprecated. Use the aws.s3.BucketAcl resource instead.

[arn](#state_arn_java) String

ARN of the bucket. Will be of format `arn:aws:s3:::bucketname`.

[bucket](#state_bucket_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Name of the bucket. If omitted, the provider will assign a random, unique name. Must be lowercase and less than or equal to 63 characters in length. A full list of bucket naming rules [may be found here](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html). The name must not be in the format `[bucketName]--[azid]--x-s3`. Use the `aws.s3.DirectoryBucket` resource to manage S3 Express buckets.

[bucketDomainName](#state_bucketdomainname_java) String

Bucket domain name. Will be of format `bucketname.s3.amazonaws.com`.

[bucketNamespace](#state_bucketnamespace_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Namespace for the bucket. Determines bucket naming scope. Valid values: `account-regional`, `global`. Defaults to `global` (AWS).

[bucketPrefix](#state_bucketprefix_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Creates a unique bucket name beginning with the specified prefix. Conflicts with `bucket`. Must be lowercase and less than or equal to 37 characters in length. A full list of bucket naming rules [may be found here](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html).

[bucketRegion](#state_bucketregion_java) String

AWS region this bucket resides in.

[bucketRegionalDomainName](#state_bucketregionaldomainname_java) String

The bucket region-specific domain name. The bucket domain name including the region name. Please refer to the [S3 endpoints reference](https://docs.aws.amazon.com/general/latest/gr/s3.html#s3_region) for format. Note: AWS CloudFront allows specifying an S3 region-specific endpoint when creating an S3 origin. This will prevent redirect issues from CloudFront to the S3 Origin URL. For more information, see the [Virtual Hosted-Style Requests for Other Regions](https://docs.aws.amazon.com/AmazonS3/latest/userguide/VirtualHosting.html#deprecated-global-endpoint) section in the AWS S3 User Guide.

[corsRules](#state_corsrules_java) [List<BucketV2CorsRule>](#bucketv2corsrule)

Rule of [Cross-Origin Resource Sharing](https://docs.aws.amazon.com/AmazonS3/latest/dev/cors.html). See CORS rule below for details. This provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketCorsConfiguration` instead.

Deprecated: cors\_rule is deprecated. Use the aws.s3.BucketCorsConfiguration resource instead.

[forceDestroy](#state_forcedestroy_java) Boolean

Boolean that indicates all objects (including any [locked objects](https://docs.aws.amazon.com/AmazonS3/latest/dev/object-lock-overview.html)) should be deleted from the bucket *when the bucket is destroyed* so that the bucket can be destroyed without error. These objects are *not* recoverable. This only deletes objects when the bucket is destroyed, *not* when setting this parameter to `true`. Once this parameter is set to `true`, there must be a successful `pulumi up` run before a destroy is required to update this value in the resource state. Without a successful `pulumi up` after this parameter is set, this flag will have no effect. If setting this field in the same operation that would require replacing the bucket or destroying the bucket, this flag will not work. Additionally when importing a bucket, a successful `pulumi up` is required to set this value in state before it will take effect on a destroy operation.

[grants](#state_grants_java) [List<BucketV2Grant>](#bucketv2grant)

An [ACL policy grant](https://docs.aws.amazon.com/AmazonS3/latest/dev/acl-overview.html#sample-acl). See Grant below for details. Conflicts with `acl`. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketAcl` instead.

Deprecated: grant is deprecated. Use the aws.s3.BucketAcl resource instead.

[hostedZoneId](#state_hostedzoneid_java) String

[Route 53 Hosted Zone ID](https://docs.aws.amazon.com/general/latest/gr/rande.html#s3_website_region_endpoints) for this bucket's region.

[lifecycleRules](#state_lifecyclerules_java) [List<BucketV2LifecycleRule>](#bucketv2lifecyclerule)

Configuration of [object lifecycle management](http://docs.aws.amazon.com/AmazonS3/latest/dev/object-lifecycle-mgmt.html). See Lifecycle Rule below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketLifecycleConfiguration` instead.

Deprecated: lifecycle\_rule is deprecated. Use the aws.s3.BucketLifecycleConfiguration resource instead.

[loggings](#state_loggings_java) [List<BucketV2Logging>](#bucketv2logging)

Configuration of [S3 bucket logging](https://docs.aws.amazon.com/AmazonS3/latest/UG/ManagingBucketLogging.html) parameters. See Logging below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketLogging` instead.

Deprecated: logging is deprecated. Use the aws.s3.BucketLogging resource instead.

[objectLockConfiguration](#state_objectlockconfiguration_java) [BucketV2ObjectLockConfiguration](#bucketv2objectlockconfiguration)

Configuration of [S3 object locking](https://docs.aws.amazon.com/AmazonS3/latest/dev/object-lock.html). See Object Lock Configuration below for details. The provider wil only perform drift detection if a configuration value is provided. Use the `objectLockEnabled` parameter and the resource `aws.s3.BucketObjectLockConfiguration` instead.

Deprecated: object\_lock\_configuration is deprecated. Use the top-level parameter objectLockEnabled and the aws.s3.BucketObjectLockConfiguration resource instead.

[objectLockEnabled](#state_objectlockenabled_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. Boolean

Indicates whether this bucket has an Object Lock configuration enabled. Valid values are `true` or `false`. This argument is not supported in all regions or partitions.

[policy](#state_policy_java) String

Valid [bucket policy](https://docs.aws.amazon.com/AmazonS3/latest/dev/example-bucket-policies.html) JSON document. Note that if the policy document is not specific enough (but still valid), this provider may view the policy as constantly changing. In this case, please make sure you use the verbose/specific version of the policy. For more information about building AWS IAM policy documents with this provider, see the AWS IAM Policy Document Guide. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketPolicy` instead.

Deprecated: policy is deprecated. Use the aws.s3.BucketPolicy resource instead.

[region](#state_region_java) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[replicationConfigurations](#state_replicationconfigurations_java) [List<BucketV2ReplicationConfiguration>](#bucketv2replicationconfiguration)

Configuration of [replication configuration](http://docs.aws.amazon.com/AmazonS3/latest/dev/crr.html). See Replication Configuration below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketReplicationConfig` instead.

Deprecated: replication\_configuration is deprecated. Use the aws.s3.BucketReplicationConfig resource instead.

[requestPayer](#state_requestpayer_java) String

Specifies who should bear the cost of Amazon S3 data transfer. Can be either `BucketOwner` or `Requester`. By default, the owner of the S3 bucket would incur the costs of any data transfer. See [Requester Pays Buckets](http://docs.aws.amazon.com/AmazonS3/latest/dev/RequesterPaysBuckets.html) developer guide for more information. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketRequestPaymentConfiguration` instead.

Deprecated: request\_payer is deprecated. Use the aws.s3.BucketRequestPaymentConfiguration resource instead.

[serverSideEncryptionConfigurations](#state_serversideencryptionconfigurations_java) [List<BucketV2ServerSideEncryptionConfiguration>](#bucketv2serversideencryptionconfiguration)

Configuration of [server-side encryption configuration](http://docs.aws.amazon.com/AmazonS3/latest/dev/bucket-encryption.html). See Server Side Encryption Configuration below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketServerSideEncryptionConfiguration` instead.

Deprecated: server\_side\_encryption\_configuration is deprecated. Use the aws.s3.BucketServerSideEncryptionConfiguration resource instead.

[tags](#state_tags_java) Map<String,String>

Map of tags to assign to the bucket. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

The following arguments are deprecated, and will be removed in a future major version:

[tagsAll](#state_tagsall_java) Map<String,String>

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[versionings](#state_versionings_java) [List<BucketV2Versioning>](#bucketv2versioning)

Configuration of the [S3 bucket versioning state](https://docs.aws.amazon.com/AmazonS3/latest/dev/Versioning.html). See Versioning below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketVersioning` instead.

Deprecated: versioning is deprecated. Use the aws.s3.BucketVersioning resource instead.

[websiteDomain](#state_websitedomain_java) String

(**Deprecated**) Domain of the website endpoint, if the bucket is configured with a website. If not, this will be an empty string. This is used to create Route 53 alias records. Use the resource `aws.s3.BucketWebsiteConfiguration` instead.

Deprecated: website\_domain is deprecated. Use the aws.s3.BucketWebsiteConfiguration resource instead.

[websiteEndpoint](#state_websiteendpoint_java) String

(**Deprecated**) Website endpoint, if the bucket is configured with a website. If not, this will be an empty string. Use the resource `aws.s3.BucketWebsiteConfiguration` instead.

Deprecated: website\_endpoint is deprecated. Use the aws.s3.BucketWebsiteConfiguration resource instead.

[websites](#state_websites_java) [List<BucketV2Website>](#bucketv2website)

Configuration of the [S3 bucket website](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html). See Website below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketWebsiteConfiguration` instead.

Deprecated: website is deprecated. Use the aws.s3.BucketWebsiteConfiguration resource instead.

[accelerationStatus](#state_accelerationstatus_nodejs) string

Sets the accelerate configuration of an existing bucket. Can be `Enabled` or `Suspended`. Cannot be used in `cn-north-1` or `us-gov-west-1`. This provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketAccelerateConfiguration` instead.

Deprecated: acceleration\_status is deprecated. Use the aws.s3.BucketAccelerateConfiguration resource instead.

[acl](#state_acl_nodejs) string

The [canned ACL](https://docs.aws.amazon.com/AmazonS3/latest/dev/acl-overview.html#canned-acl) to apply. Valid values are `private`, `public-read`, `public-read-write`, `aws-exec-read`, `authenticated-read`, and `log-delivery-write`. Defaults to `private`. Conflicts with `grant`. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketAcl` instead.

Deprecated: acl is deprecated. Use the aws.s3.BucketAcl resource instead.

[arn](#state_arn_nodejs) string

ARN of the bucket. Will be of format `arn:aws:s3:::bucketname`.

[bucket](#state_bucket_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Name of the bucket. If omitted, the provider will assign a random, unique name. Must be lowercase and less than or equal to 63 characters in length. A full list of bucket naming rules [may be found here](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html). The name must not be in the format `[bucketName]--[azid]--x-s3`. Use the `aws.s3.DirectoryBucket` resource to manage S3 Express buckets.

[bucketDomainName](#state_bucketdomainname_nodejs) string

Bucket domain name. Will be of format `bucketname.s3.amazonaws.com`.

[bucketNamespace](#state_bucketnamespace_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Namespace for the bucket. Determines bucket naming scope. Valid values: `account-regional`, `global`. Defaults to `global` (AWS).

[bucketPrefix](#state_bucketprefix_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Creates a unique bucket name beginning with the specified prefix. Conflicts with `bucket`. Must be lowercase and less than or equal to 37 characters in length. A full list of bucket naming rules [may be found here](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html).

[bucketRegion](#state_bucketregion_nodejs) string

AWS region this bucket resides in.

[bucketRegionalDomainName](#state_bucketregionaldomainname_nodejs) string

The bucket region-specific domain name. The bucket domain name including the region name. Please refer to the [S3 endpoints reference](https://docs.aws.amazon.com/general/latest/gr/s3.html#s3_region) for format. Note: AWS CloudFront allows specifying an S3 region-specific endpoint when creating an S3 origin. This will prevent redirect issues from CloudFront to the S3 Origin URL. For more information, see the [Virtual Hosted-Style Requests for Other Regions](https://docs.aws.amazon.com/AmazonS3/latest/userguide/VirtualHosting.html#deprecated-global-endpoint) section in the AWS S3 User Guide.

[corsRules](#state_corsrules_nodejs) [BucketV2CorsRule\[\]](#bucketv2corsrule)

Rule of [Cross-Origin Resource Sharing](https://docs.aws.amazon.com/AmazonS3/latest/dev/cors.html). See CORS rule below for details. This provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketCorsConfiguration` instead.

Deprecated: cors\_rule is deprecated. Use the aws.s3.BucketCorsConfiguration resource instead.

[forceDestroy](#state_forcedestroy_nodejs) boolean

Boolean that indicates all objects (including any [locked objects](https://docs.aws.amazon.com/AmazonS3/latest/dev/object-lock-overview.html)) should be deleted from the bucket *when the bucket is destroyed* so that the bucket can be destroyed without error. These objects are *not* recoverable. This only deletes objects when the bucket is destroyed, *not* when setting this parameter to `true`. Once this parameter is set to `true`, there must be a successful `pulumi up` run before a destroy is required to update this value in the resource state. Without a successful `pulumi up` after this parameter is set, this flag will have no effect. If setting this field in the same operation that would require replacing the bucket or destroying the bucket, this flag will not work. Additionally when importing a bucket, a successful `pulumi up` is required to set this value in state before it will take effect on a destroy operation.

[grants](#state_grants_nodejs) [BucketV2Grant\[\]](#bucketv2grant)

An [ACL policy grant](https://docs.aws.amazon.com/AmazonS3/latest/dev/acl-overview.html#sample-acl). See Grant below for details. Conflicts with `acl`. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketAcl` instead.

Deprecated: grant is deprecated. Use the aws.s3.BucketAcl resource instead.

[hostedZoneId](#state_hostedzoneid_nodejs) string

[Route 53 Hosted Zone ID](https://docs.aws.amazon.com/general/latest/gr/rande.html#s3_website_region_endpoints) for this bucket's region.

[lifecycleRules](#state_lifecyclerules_nodejs) [BucketV2LifecycleRule\[\]](#bucketv2lifecyclerule)

Configuration of [object lifecycle management](http://docs.aws.amazon.com/AmazonS3/latest/dev/object-lifecycle-mgmt.html). See Lifecycle Rule below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketLifecycleConfiguration` instead.

Deprecated: lifecycle\_rule is deprecated. Use the aws.s3.BucketLifecycleConfiguration resource instead.

[loggings](#state_loggings_nodejs) [BucketV2Logging\[\]](#bucketv2logging)

Configuration of [S3 bucket logging](https://docs.aws.amazon.com/AmazonS3/latest/UG/ManagingBucketLogging.html) parameters. See Logging below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketLogging` instead.

Deprecated: logging is deprecated. Use the aws.s3.BucketLogging resource instead.

[objectLockConfiguration](#state_objectlockconfiguration_nodejs) [BucketV2ObjectLockConfiguration](#bucketv2objectlockconfiguration)

Configuration of [S3 object locking](https://docs.aws.amazon.com/AmazonS3/latest/dev/object-lock.html). See Object Lock Configuration below for details. The provider wil only perform drift detection if a configuration value is provided. Use the `objectLockEnabled` parameter and the resource `aws.s3.BucketObjectLockConfiguration` instead.

Deprecated: object\_lock\_configuration is deprecated. Use the top-level parameter objectLockEnabled and the aws.s3.BucketObjectLockConfiguration resource instead.

[objectLockEnabled](#state_objectlockenabled_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. boolean

Indicates whether this bucket has an Object Lock configuration enabled. Valid values are `true` or `false`. This argument is not supported in all regions or partitions.

[policy](#state_policy_nodejs) string

Valid [bucket policy](https://docs.aws.amazon.com/AmazonS3/latest/dev/example-bucket-policies.html) JSON document. Note that if the policy document is not specific enough (but still valid), this provider may view the policy as constantly changing. In this case, please make sure you use the verbose/specific version of the policy. For more information about building AWS IAM policy documents with this provider, see the AWS IAM Policy Document Guide. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketPolicy` instead.

Deprecated: policy is deprecated. Use the aws.s3.BucketPolicy resource instead.

[region](#state_region_nodejs) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[replicationConfigurations](#state_replicationconfigurations_nodejs) [BucketV2ReplicationConfiguration\[\]](#bucketv2replicationconfiguration)

Configuration of [replication configuration](http://docs.aws.amazon.com/AmazonS3/latest/dev/crr.html). See Replication Configuration below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketReplicationConfig` instead.

Deprecated: replication\_configuration is deprecated. Use the aws.s3.BucketReplicationConfig resource instead.

[requestPayer](#state_requestpayer_nodejs) string

Specifies who should bear the cost of Amazon S3 data transfer. Can be either `BucketOwner` or `Requester`. By default, the owner of the S3 bucket would incur the costs of any data transfer. See [Requester Pays Buckets](http://docs.aws.amazon.com/AmazonS3/latest/dev/RequesterPaysBuckets.html) developer guide for more information. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketRequestPaymentConfiguration` instead.

Deprecated: request\_payer is deprecated. Use the aws.s3.BucketRequestPaymentConfiguration resource instead.

[serverSideEncryptionConfigurations](#state_serversideencryptionconfigurations_nodejs) [BucketV2ServerSideEncryptionConfiguration\[\]](#bucketv2serversideencryptionconfiguration)

Configuration of [server-side encryption configuration](http://docs.aws.amazon.com/AmazonS3/latest/dev/bucket-encryption.html). See Server Side Encryption Configuration below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketServerSideEncryptionConfiguration` instead.

Deprecated: server\_side\_encryption\_configuration is deprecated. Use the aws.s3.BucketServerSideEncryptionConfiguration resource instead.

[tags](#state_tags_nodejs) {\[key: string\]: string}

Map of tags to assign to the bucket. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

The following arguments are deprecated, and will be removed in a future major version:

[tagsAll](#state_tagsall_nodejs) {\[key: string\]: string}

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[versionings](#state_versionings_nodejs) [BucketV2Versioning\[\]](#bucketv2versioning)

Configuration of the [S3 bucket versioning state](https://docs.aws.amazon.com/AmazonS3/latest/dev/Versioning.html). See Versioning below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketVersioning` instead.

Deprecated: versioning is deprecated. Use the aws.s3.BucketVersioning resource instead.

[websiteDomain](#state_websitedomain_nodejs) string

(**Deprecated**) Domain of the website endpoint, if the bucket is configured with a website. If not, this will be an empty string. This is used to create Route 53 alias records. Use the resource `aws.s3.BucketWebsiteConfiguration` instead.

Deprecated: website\_domain is deprecated. Use the aws.s3.BucketWebsiteConfiguration resource instead.

[websiteEndpoint](#state_websiteendpoint_nodejs) string

(**Deprecated**) Website endpoint, if the bucket is configured with a website. If not, this will be an empty string. Use the resource `aws.s3.BucketWebsiteConfiguration` instead.

Deprecated: website\_endpoint is deprecated. Use the aws.s3.BucketWebsiteConfiguration resource instead.

[websites](#state_websites_nodejs) [BucketV2Website\[\]](#bucketv2website)

Configuration of the [S3 bucket website](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html). See Website below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketWebsiteConfiguration` instead.

Deprecated: website is deprecated. Use the aws.s3.BucketWebsiteConfiguration resource instead.

[acceleration\_status](#state_acceleration_status_python) str

Sets the accelerate configuration of an existing bucket. Can be `Enabled` or `Suspended`. Cannot be used in `cn-north-1` or `us-gov-west-1`. This provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketAccelerateConfiguration` instead.

Deprecated: acceleration\_status is deprecated. Use the aws.s3.BucketAccelerateConfiguration resource instead.

[acl](#state_acl_python) str

The [canned ACL](https://docs.aws.amazon.com/AmazonS3/latest/dev/acl-overview.html#canned-acl) to apply. Valid values are `private`, `public-read`, `public-read-write`, `aws-exec-read`, `authenticated-read`, and `log-delivery-write`. Defaults to `private`. Conflicts with `grant`. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketAcl` instead.

Deprecated: acl is deprecated. Use the aws.s3.BucketAcl resource instead.

[arn](#state_arn_python) str

ARN of the bucket. Will be of format `arn:aws:s3:::bucketname`.

[bucket](#state_bucket_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Name of the bucket. If omitted, the provider will assign a random, unique name. Must be lowercase and less than or equal to 63 characters in length. A full list of bucket naming rules [may be found here](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html). The name must not be in the format `[bucketName]--[azid]--x-s3`. Use the `aws.s3.DirectoryBucket` resource to manage S3 Express buckets.

[bucket\_domain\_name](#state_bucket_domain_name_python) str

Bucket domain name. Will be of format `bucketname.s3.amazonaws.com`.

[bucket\_namespace](#state_bucket_namespace_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Namespace for the bucket. Determines bucket naming scope. Valid values: `account-regional`, `global`. Defaults to `global` (AWS).

[bucket\_prefix](#state_bucket_prefix_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Creates a unique bucket name beginning with the specified prefix. Conflicts with `bucket`. Must be lowercase and less than or equal to 37 characters in length. A full list of bucket naming rules [may be found here](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html).

[bucket\_region](#state_bucket_region_python) str

AWS region this bucket resides in.

[bucket\_regional\_domain\_name](#state_bucket_regional_domain_name_python) str

The bucket region-specific domain name. The bucket domain name including the region name. Please refer to the [S3 endpoints reference](https://docs.aws.amazon.com/general/latest/gr/s3.html#s3_region) for format. Note: AWS CloudFront allows specifying an S3 region-specific endpoint when creating an S3 origin. This will prevent redirect issues from CloudFront to the S3 Origin URL. For more information, see the [Virtual Hosted-Style Requests for Other Regions](https://docs.aws.amazon.com/AmazonS3/latest/userguide/VirtualHosting.html#deprecated-global-endpoint) section in the AWS S3 User Guide.

[cors\_rules](#state_cors_rules_python) [Sequence\[BucketV2CorsRuleArgs\]](#bucketv2corsrule)

Rule of [Cross-Origin Resource Sharing](https://docs.aws.amazon.com/AmazonS3/latest/dev/cors.html). See CORS rule below for details. This provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketCorsConfiguration` instead.

Deprecated: cors\_rule is deprecated. Use the aws.s3.BucketCorsConfiguration resource instead.

[force\_destroy](#state_force_destroy_python) bool

Boolean that indicates all objects (including any [locked objects](https://docs.aws.amazon.com/AmazonS3/latest/dev/object-lock-overview.html)) should be deleted from the bucket *when the bucket is destroyed* so that the bucket can be destroyed without error. These objects are *not* recoverable. This only deletes objects when the bucket is destroyed, *not* when setting this parameter to `true`. Once this parameter is set to `true`, there must be a successful `pulumi up` run before a destroy is required to update this value in the resource state. Without a successful `pulumi up` after this parameter is set, this flag will have no effect. If setting this field in the same operation that would require replacing the bucket or destroying the bucket, this flag will not work. Additionally when importing a bucket, a successful `pulumi up` is required to set this value in state before it will take effect on a destroy operation.

[grants](#state_grants_python) [Sequence\[BucketV2GrantArgs\]](#bucketv2grant)

An [ACL policy grant](https://docs.aws.amazon.com/AmazonS3/latest/dev/acl-overview.html#sample-acl). See Grant below for details. Conflicts with `acl`. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketAcl` instead.

Deprecated: grant is deprecated. Use the aws.s3.BucketAcl resource instead.

[hosted\_zone\_id](#state_hosted_zone_id_python) str

[Route 53 Hosted Zone ID](https://docs.aws.amazon.com/general/latest/gr/rande.html#s3_website_region_endpoints) for this bucket's region.

[lifecycle\_rules](#state_lifecycle_rules_python) [Sequence\[BucketV2LifecycleRuleArgs\]](#bucketv2lifecyclerule)

Configuration of [object lifecycle management](http://docs.aws.amazon.com/AmazonS3/latest/dev/object-lifecycle-mgmt.html). See Lifecycle Rule below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketLifecycleConfiguration` instead.

Deprecated: lifecycle\_rule is deprecated. Use the aws.s3.BucketLifecycleConfiguration resource instead.

[loggings](#state_loggings_python) [Sequence\[BucketV2LoggingArgs\]](#bucketv2logging)

Configuration of [S3 bucket logging](https://docs.aws.amazon.com/AmazonS3/latest/UG/ManagingBucketLogging.html) parameters. See Logging below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketLogging` instead.

Deprecated: logging is deprecated. Use the aws.s3.BucketLogging resource instead.

[object\_lock\_configuration](#state_object_lock_configuration_python) [BucketV2ObjectLockConfigurationArgs](#bucketv2objectlockconfiguration)

Configuration of [S3 object locking](https://docs.aws.amazon.com/AmazonS3/latest/dev/object-lock.html). See Object Lock Configuration below for details. The provider wil only perform drift detection if a configuration value is provided. Use the `objectLockEnabled` parameter and the resource `aws.s3.BucketObjectLockConfiguration` instead.

Deprecated: object\_lock\_configuration is deprecated. Use the top-level parameter objectLockEnabled and the aws.s3.BucketObjectLockConfiguration resource instead.

[object\_lock\_enabled](#state_object_lock_enabled_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. bool

Indicates whether this bucket has an Object Lock configuration enabled. Valid values are `true` or `false`. This argument is not supported in all regions or partitions.

[policy](#state_policy_python) str

Valid [bucket policy](https://docs.aws.amazon.com/AmazonS3/latest/dev/example-bucket-policies.html) JSON document. Note that if the policy document is not specific enough (but still valid), this provider may view the policy as constantly changing. In this case, please make sure you use the verbose/specific version of the policy. For more information about building AWS IAM policy documents with this provider, see the AWS IAM Policy Document Guide. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketPolicy` instead.

Deprecated: policy is deprecated. Use the aws.s3.BucketPolicy resource instead.

[region](#state_region_python) str

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[replication\_configurations](#state_replication_configurations_python) [Sequence\[BucketV2ReplicationConfigurationArgs\]](#bucketv2replicationconfiguration)

Configuration of [replication configuration](http://docs.aws.amazon.com/AmazonS3/latest/dev/crr.html). See Replication Configuration below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketReplicationConfig` instead.

Deprecated: replication\_configuration is deprecated. Use the aws.s3.BucketReplicationConfig resource instead.

[request\_payer](#state_request_payer_python) str

Specifies who should bear the cost of Amazon S3 data transfer. Can be either `BucketOwner` or `Requester`. By default, the owner of the S3 bucket would incur the costs of any data transfer. See [Requester Pays Buckets](http://docs.aws.amazon.com/AmazonS3/latest/dev/RequesterPaysBuckets.html) developer guide for more information. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketRequestPaymentConfiguration` instead.

Deprecated: request\_payer is deprecated. Use the aws.s3.BucketRequestPaymentConfiguration resource instead.

[server\_side\_encryption\_configurations](#state_server_side_encryption_configurations_python) [Sequence\[BucketV2ServerSideEncryptionConfigurationArgs\]](#bucketv2serversideencryptionconfiguration)

Configuration of [server-side encryption configuration](http://docs.aws.amazon.com/AmazonS3/latest/dev/bucket-encryption.html). See Server Side Encryption Configuration below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketServerSideEncryptionConfiguration` instead.

Deprecated: server\_side\_encryption\_configuration is deprecated. Use the aws.s3.BucketServerSideEncryptionConfiguration resource instead.

[tags](#state_tags_python) Mapping\[str, str\]

Map of tags to assign to the bucket. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

The following arguments are deprecated, and will be removed in a future major version:

[tags\_all](#state_tags_all_python) Mapping\[str, str\]

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[versionings](#state_versionings_python) [Sequence\[BucketV2VersioningArgs\]](#bucketv2versioning)

Configuration of the [S3 bucket versioning state](https://docs.aws.amazon.com/AmazonS3/latest/dev/Versioning.html). See Versioning below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketVersioning` instead.

Deprecated: versioning is deprecated. Use the aws.s3.BucketVersioning resource instead.

[website\_domain](#state_website_domain_python) str

(**Deprecated**) Domain of the website endpoint, if the bucket is configured with a website. If not, this will be an empty string. This is used to create Route 53 alias records. Use the resource `aws.s3.BucketWebsiteConfiguration` instead.

Deprecated: website\_domain is deprecated. Use the aws.s3.BucketWebsiteConfiguration resource instead.

[website\_endpoint](#state_website_endpoint_python) str

(**Deprecated**) Website endpoint, if the bucket is configured with a website. If not, this will be an empty string. Use the resource `aws.s3.BucketWebsiteConfiguration` instead.

Deprecated: website\_endpoint is deprecated. Use the aws.s3.BucketWebsiteConfiguration resource instead.

[websites](#state_websites_python) [Sequence\[BucketV2WebsiteArgs\]](#bucketv2website)

Configuration of the [S3 bucket website](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html). See Website below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketWebsiteConfiguration` instead.

Deprecated: website is deprecated. Use the aws.s3.BucketWebsiteConfiguration resource instead.

[accelerationStatus](#state_accelerationstatus_yaml) String

Sets the accelerate configuration of an existing bucket. Can be `Enabled` or `Suspended`. Cannot be used in `cn-north-1` or `us-gov-west-1`. This provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketAccelerateConfiguration` instead.

Deprecated: acceleration\_status is deprecated. Use the aws.s3.BucketAccelerateConfiguration resource instead.

[acl](#state_acl_yaml) String

The [canned ACL](https://docs.aws.amazon.com/AmazonS3/latest/dev/acl-overview.html#canned-acl) to apply. Valid values are `private`, `public-read`, `public-read-write`, `aws-exec-read`, `authenticated-read`, and `log-delivery-write`. Defaults to `private`. Conflicts with `grant`. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketAcl` instead.

Deprecated: acl is deprecated. Use the aws.s3.BucketAcl resource instead.

[arn](#state_arn_yaml) String

ARN of the bucket. Will be of format `arn:aws:s3:::bucketname`.

[bucket](#state_bucket_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Name of the bucket. If omitted, the provider will assign a random, unique name. Must be lowercase and less than or equal to 63 characters in length. A full list of bucket naming rules [may be found here](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html). The name must not be in the format `[bucketName]--[azid]--x-s3`. Use the `aws.s3.DirectoryBucket` resource to manage S3 Express buckets.

[bucketDomainName](#state_bucketdomainname_yaml) String

Bucket domain name. Will be of format `bucketname.s3.amazonaws.com`.

[bucketNamespace](#state_bucketnamespace_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Namespace for the bucket. Determines bucket naming scope. Valid values: `account-regional`, `global`. Defaults to `global` (AWS).

[bucketPrefix](#state_bucketprefix_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Creates a unique bucket name beginning with the specified prefix. Conflicts with `bucket`. Must be lowercase and less than or equal to 37 characters in length. A full list of bucket naming rules [may be found here](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html).

[bucketRegion](#state_bucketregion_yaml) String

AWS region this bucket resides in.

[bucketRegionalDomainName](#state_bucketregionaldomainname_yaml) String

The bucket region-specific domain name. The bucket domain name including the region name. Please refer to the [S3 endpoints reference](https://docs.aws.amazon.com/general/latest/gr/s3.html#s3_region) for format. Note: AWS CloudFront allows specifying an S3 region-specific endpoint when creating an S3 origin. This will prevent redirect issues from CloudFront to the S3 Origin URL. For more information, see the [Virtual Hosted-Style Requests for Other Regions](https://docs.aws.amazon.com/AmazonS3/latest/userguide/VirtualHosting.html#deprecated-global-endpoint) section in the AWS S3 User Guide.

[corsRules](#state_corsrules_yaml) [List<Property Map>](#bucketv2corsrule)

Rule of [Cross-Origin Resource Sharing](https://docs.aws.amazon.com/AmazonS3/latest/dev/cors.html). See CORS rule below for details. This provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketCorsConfiguration` instead.

Deprecated: cors\_rule is deprecated. Use the aws.s3.BucketCorsConfiguration resource instead.

[forceDestroy](#state_forcedestroy_yaml) Boolean

Boolean that indicates all objects (including any [locked objects](https://docs.aws.amazon.com/AmazonS3/latest/dev/object-lock-overview.html)) should be deleted from the bucket *when the bucket is destroyed* so that the bucket can be destroyed without error. These objects are *not* recoverable. This only deletes objects when the bucket is destroyed, *not* when setting this parameter to `true`. Once this parameter is set to `true`, there must be a successful `pulumi up` run before a destroy is required to update this value in the resource state. Without a successful `pulumi up` after this parameter is set, this flag will have no effect. If setting this field in the same operation that would require replacing the bucket or destroying the bucket, this flag will not work. Additionally when importing a bucket, a successful `pulumi up` is required to set this value in state before it will take effect on a destroy operation.

[grants](#state_grants_yaml) [List<Property Map>](#bucketv2grant)

An [ACL policy grant](https://docs.aws.amazon.com/AmazonS3/latest/dev/acl-overview.html#sample-acl). See Grant below for details. Conflicts with `acl`. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketAcl` instead.

Deprecated: grant is deprecated. Use the aws.s3.BucketAcl resource instead.

[hostedZoneId](#state_hostedzoneid_yaml) String

[Route 53 Hosted Zone ID](https://docs.aws.amazon.com/general/latest/gr/rande.html#s3_website_region_endpoints) for this bucket's region.

[lifecycleRules](#state_lifecyclerules_yaml) [List<Property Map>](#bucketv2lifecyclerule)

Configuration of [object lifecycle management](http://docs.aws.amazon.com/AmazonS3/latest/dev/object-lifecycle-mgmt.html). See Lifecycle Rule below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketLifecycleConfiguration` instead.

Deprecated: lifecycle\_rule is deprecated. Use the aws.s3.BucketLifecycleConfiguration resource instead.

[loggings](#state_loggings_yaml) [List<Property Map>](#bucketv2logging)

Configuration of [S3 bucket logging](https://docs.aws.amazon.com/AmazonS3/latest/UG/ManagingBucketLogging.html) parameters. See Logging below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketLogging` instead.

Deprecated: logging is deprecated. Use the aws.s3.BucketLogging resource instead.

[objectLockConfiguration](#state_objectlockconfiguration_yaml) [Property Map](#bucketv2objectlockconfiguration)

Configuration of [S3 object locking](https://docs.aws.amazon.com/AmazonS3/latest/dev/object-lock.html). See Object Lock Configuration below for details. The provider wil only perform drift detection if a configuration value is provided. Use the `objectLockEnabled` parameter and the resource `aws.s3.BucketObjectLockConfiguration` instead.

Deprecated: object\_lock\_configuration is deprecated. Use the top-level parameter objectLockEnabled and the aws.s3.BucketObjectLockConfiguration resource instead.

[objectLockEnabled](#state_objectlockenabled_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. Boolean

Indicates whether this bucket has an Object Lock configuration enabled. Valid values are `true` or `false`. This argument is not supported in all regions or partitions.

[policy](#state_policy_yaml) String

Valid [bucket policy](https://docs.aws.amazon.com/AmazonS3/latest/dev/example-bucket-policies.html) JSON document. Note that if the policy document is not specific enough (but still valid), this provider may view the policy as constantly changing. In this case, please make sure you use the verbose/specific version of the policy. For more information about building AWS IAM policy documents with this provider, see the AWS IAM Policy Document Guide. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketPolicy` instead.

Deprecated: policy is deprecated. Use the aws.s3.BucketPolicy resource instead.

[region](#state_region_yaml) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[replicationConfigurations](#state_replicationconfigurations_yaml) [List<Property Map>](#bucketv2replicationconfiguration)

Configuration of [replication configuration](http://docs.aws.amazon.com/AmazonS3/latest/dev/crr.html). See Replication Configuration below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketReplicationConfig` instead.

Deprecated: replication\_configuration is deprecated. Use the aws.s3.BucketReplicationConfig resource instead.

[requestPayer](#state_requestpayer_yaml) String

Specifies who should bear the cost of Amazon S3 data transfer. Can be either `BucketOwner` or `Requester`. By default, the owner of the S3 bucket would incur the costs of any data transfer. See [Requester Pays Buckets](http://docs.aws.amazon.com/AmazonS3/latest/dev/RequesterPaysBuckets.html) developer guide for more information. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketRequestPaymentConfiguration` instead.

Deprecated: request\_payer is deprecated. Use the aws.s3.BucketRequestPaymentConfiguration resource instead.

[serverSideEncryptionConfigurations](#state_serversideencryptionconfigurations_yaml) [List<Property Map>](#bucketv2serversideencryptionconfiguration)

Configuration of [server-side encryption configuration](http://docs.aws.amazon.com/AmazonS3/latest/dev/bucket-encryption.html). See Server Side Encryption Configuration below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketServerSideEncryptionConfiguration` instead.

Deprecated: server\_side\_encryption\_configuration is deprecated. Use the aws.s3.BucketServerSideEncryptionConfiguration resource instead.

[tags](#state_tags_yaml) Map<String>

Map of tags to assign to the bucket. If configured with a provider `defaultTags` configuration block present, tags with matching keys will overwrite those defined at the provider-level.

The following arguments are deprecated, and will be removed in a future major version:

[tagsAll](#state_tagsall_yaml) Map<String>

Map of tags assigned to the resource, including those inherited from the provider `defaultTags` configuration block.

[versionings](#state_versionings_yaml) [List<Property Map>](#bucketv2versioning)

Configuration of the [S3 bucket versioning state](https://docs.aws.amazon.com/AmazonS3/latest/dev/Versioning.html). See Versioning below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketVersioning` instead.

Deprecated: versioning is deprecated. Use the aws.s3.BucketVersioning resource instead.

[websiteDomain](#state_websitedomain_yaml) String

(**Deprecated**) Domain of the website endpoint, if the bucket is configured with a website. If not, this will be an empty string. This is used to create Route 53 alias records. Use the resource `aws.s3.BucketWebsiteConfiguration` instead.

Deprecated: website\_domain is deprecated. Use the aws.s3.BucketWebsiteConfiguration resource instead.

[websiteEndpoint](#state_websiteendpoint_yaml) String

(**Deprecated**) Website endpoint, if the bucket is configured with a website. If not, this will be an empty string. Use the resource `aws.s3.BucketWebsiteConfiguration` instead.

Deprecated: website\_endpoint is deprecated. Use the aws.s3.BucketWebsiteConfiguration resource instead.

[websites](#state_websites_yaml) [List<Property Map>](#bucketv2website)

Configuration of the [S3 bucket website](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html). See Website below for details. The provider will only perform drift detection if a configuration value is provided. Use the resource `aws.s3.BucketWebsiteConfiguration` instead.

Deprecated: website is deprecated. Use the aws.s3.BucketWebsiteConfiguration resource instead.

## Supporting Types[](#supporting-types)

#### BucketV2CorsRule

, BucketV2CorsRuleArgs

[](#bucketv2corsrule)

[AllowedMethods](#allowedmethods_csharp) This property is required. List<string>

One or more HTTP methods that you allow the origin to execute. Can be `GET`, `PUT`, `POST`, `DELETE` or `HEAD`.

[AllowedOrigins](#allowedorigins_csharp) This property is required. List<string>

One or more origins you want customers to be able to access the bucket from.

[AllowedHeaders](#allowedheaders_csharp) List<string>

List of headers allowed.

[ExposeHeaders](#exposeheaders_csharp) List<string>

One or more headers in the response that you want customers to be able to access from their applications (for example, from a JavaScript `XMLHttpRequest` object).

[MaxAgeSeconds](#maxageseconds_csharp) int

Specifies time in seconds that browser can cache the response for a preflight request.

[AllowedMethods](#allowedmethods_go) This property is required. \[\]string

One or more HTTP methods that you allow the origin to execute. Can be `GET`, `PUT`, `POST`, `DELETE` or `HEAD`.

[AllowedOrigins](#allowedorigins_go) This property is required. \[\]string

One or more origins you want customers to be able to access the bucket from.

[AllowedHeaders](#allowedheaders_go) \[\]string

List of headers allowed.

[ExposeHeaders](#exposeheaders_go) \[\]string

One or more headers in the response that you want customers to be able to access from their applications (for example, from a JavaScript `XMLHttpRequest` object).

[MaxAgeSeconds](#maxageseconds_go) int

Specifies time in seconds that browser can cache the response for a preflight request.

[allowed\_methods](#allowed_methods_hcl) This property is required. list(string)

One or more HTTP methods that you allow the origin to execute. Can be `GET`, `PUT`, `POST`, `DELETE` or `HEAD`.

[allowed\_origins](#allowed_origins_hcl) This property is required. list(string)

One or more origins you want customers to be able to access the bucket from.

[allowed\_headers](#allowed_headers_hcl) list(string)

List of headers allowed.

[expose\_headers](#expose_headers_hcl) list(string)

One or more headers in the response that you want customers to be able to access from their applications (for example, from a JavaScript `XMLHttpRequest` object).

[max\_age\_seconds](#max_age_seconds_hcl) number

Specifies time in seconds that browser can cache the response for a preflight request.

[allowedMethods](#allowedmethods_java) This property is required. List<String>

One or more HTTP methods that you allow the origin to execute. Can be `GET`, `PUT`, `POST`, `DELETE` or `HEAD`.

[allowedOrigins](#allowedorigins_java) This property is required. List<String>

One or more origins you want customers to be able to access the bucket from.

[allowedHeaders](#allowedheaders_java) List<String>

List of headers allowed.

[exposeHeaders](#exposeheaders_java) List<String>

One or more headers in the response that you want customers to be able to access from their applications (for example, from a JavaScript `XMLHttpRequest` object).

[maxAgeSeconds](#maxageseconds_java) Integer

Specifies time in seconds that browser can cache the response for a preflight request.

[allowedMethods](#allowedmethods_nodejs) This property is required. string\[\]

One or more HTTP methods that you allow the origin to execute. Can be `GET`, `PUT`, `POST`, `DELETE` or `HEAD`.

[allowedOrigins](#allowedorigins_nodejs) This property is required. string\[\]

One or more origins you want customers to be able to access the bucket from.

[allowedHeaders](#allowedheaders_nodejs) string\[\]

List of headers allowed.

[exposeHeaders](#exposeheaders_nodejs) string\[\]

One or more headers in the response that you want customers to be able to access from their applications (for example, from a JavaScript `XMLHttpRequest` object).

[maxAgeSeconds](#maxageseconds_nodejs) number

Specifies time in seconds that browser can cache the response for a preflight request.

[allowed\_methods](#allowed_methods_python) This property is required. Sequence\[str\]

One or more HTTP methods that you allow the origin to execute. Can be `GET`, `PUT`, `POST`, `DELETE` or `HEAD`.

[allowed\_origins](#allowed_origins_python) This property is required. Sequence\[str\]

One or more origins you want customers to be able to access the bucket from.

[allowed\_headers](#allowed_headers_python) Sequence\[str\]

List of headers allowed.

[expose\_headers](#expose_headers_python) Sequence\[str\]

One or more headers in the response that you want customers to be able to access from their applications (for example, from a JavaScript `XMLHttpRequest` object).

[max\_age\_seconds](#max_age_seconds_python) int

Specifies time in seconds that browser can cache the response for a preflight request.

[allowedMethods](#allowedmethods_yaml) This property is required. List<String>

One or more HTTP methods that you allow the origin to execute. Can be `GET`, `PUT`, `POST`, `DELETE` or `HEAD`.

[allowedOrigins](#allowedorigins_yaml) This property is required. List<String>

One or more origins you want customers to be able to access the bucket from.

[allowedHeaders](#allowedheaders_yaml) List<String>

List of headers allowed.

[exposeHeaders](#exposeheaders_yaml) List<String>

One or more headers in the response that you want customers to be able to access from their applications (for example, from a JavaScript `XMLHttpRequest` object).

[maxAgeSeconds](#maxageseconds_yaml) Number

Specifies time in seconds that browser can cache the response for a preflight request.

#### BucketV2Grant

, BucketV2GrantArgs

[](#bucketv2grant)

[Permissions](#permissions_csharp) This property is required. List<string>

List of permissions to apply for grantee. Valid values are `READ`, `WRITE`, `READ_ACP`, `WRITE_ACP`, `FULL_CONTROL`.

[Type](#type_csharp) This property is required. string

Type of grantee to apply for. Valid values are `CanonicalUser` and `Group`. `AmazonCustomerByEmail` is not supported.

[Id](#id_csharp) string

Canonical user id to grant for. Used only when `type` is `CanonicalUser`.

[Uri](#uri_csharp) string

Uri address to grant for. Used only when `type` is `Group`.

[Permissions](#permissions_go) This property is required. \[\]string

List of permissions to apply for grantee. Valid values are `READ`, `WRITE`, `READ_ACP`, `WRITE_ACP`, `FULL_CONTROL`.

[Type](#type_go) This property is required. string

Type of grantee to apply for. Valid values are `CanonicalUser` and `Group`. `AmazonCustomerByEmail` is not supported.

[Id](#id_go) string

Canonical user id to grant for. Used only when `type` is `CanonicalUser`.

[Uri](#uri_go) string

Uri address to grant for. Used only when `type` is `Group`.

[permissions](#permissions_hcl) This property is required. list(string)

List of permissions to apply for grantee. Valid values are `READ`, `WRITE`, `READ_ACP`, `WRITE_ACP`, `FULL_CONTROL`.

[type](#type_hcl) This property is required. string

Type of grantee to apply for. Valid values are `CanonicalUser` and `Group`. `AmazonCustomerByEmail` is not supported.

[id](#id_hcl) string

Canonical user id to grant for. Used only when `type` is `CanonicalUser`.

[uri](#uri_hcl) string

Uri address to grant for. Used only when `type` is `Group`.

[permissions](#permissions_java) This property is required. List<String>

List of permissions to apply for grantee. Valid values are `READ`, `WRITE`, `READ_ACP`, `WRITE_ACP`, `FULL_CONTROL`.

[type](#type_java) This property is required. String

Type of grantee to apply for. Valid values are `CanonicalUser` and `Group`. `AmazonCustomerByEmail` is not supported.

[id](#id_java) String

Canonical user id to grant for. Used only when `type` is `CanonicalUser`.

[uri](#uri_java) String

Uri address to grant for. Used only when `type` is `Group`.

[permissions](#permissions_nodejs) This property is required. string\[\]

List of permissions to apply for grantee. Valid values are `READ`, `WRITE`, `READ_ACP`, `WRITE_ACP`, `FULL_CONTROL`.

[type](#type_nodejs) This property is required. string

Type of grantee to apply for. Valid values are `CanonicalUser` and `Group`. `AmazonCustomerByEmail` is not supported.

[id](#id_nodejs) string

Canonical user id to grant for. Used only when `type` is `CanonicalUser`.

[uri](#uri_nodejs) string

Uri address to grant for. Used only when `type` is `Group`.

[permissions](#permissions_python) This property is required. Sequence\[str\]

List of permissions to apply for grantee. Valid values are `READ`, `WRITE`, `READ_ACP`, `WRITE_ACP`, `FULL_CONTROL`.

[type](#type_python) This property is required. str

Type of grantee to apply for. Valid values are `CanonicalUser` and `Group`. `AmazonCustomerByEmail` is not supported.

[id](#id_python) str

Canonical user id to grant for. Used only when `type` is `CanonicalUser`.

[uri](#uri_python) str

Uri address to grant for. Used only when `type` is `Group`.

[permissions](#permissions_yaml) This property is required. List<String>

List of permissions to apply for grantee. Valid values are `READ`, `WRITE`, `READ_ACP`, `WRITE_ACP`, `FULL_CONTROL`.

[type](#type_yaml) This property is required. String

Type of grantee to apply for. Valid values are `CanonicalUser` and `Group`. `AmazonCustomerByEmail` is not supported.

[id](#id_yaml) String

Canonical user id to grant for. Used only when `type` is `CanonicalUser`.

[uri](#uri_yaml) String

Uri address to grant for. Used only when `type` is `Group`.

#### BucketV2LifecycleRule

, BucketV2LifecycleRuleArgs

[](#bucketv2lifecyclerule)

[Enabled](#enabled_csharp) This property is required. bool

Specifies lifecycle rule status.

[AbortIncompleteMultipartUploadDays](#abortincompletemultipartuploaddays_csharp) int

Specifies the number of days after initiating a multipart upload when the multipart upload must be completed.

[Expirations](#expirations_csharp) [List<BucketV2LifecycleRuleExpiration>](#bucketv2lifecycleruleexpiration)

Specifies a period in the object's expire. See Expiration below for details.

[Id](#id_csharp) string

Unique identifier for the rule. Must be less than or equal to 255 characters in length.

[NoncurrentVersionExpirations](#noncurrentversionexpirations_csharp) [List<BucketV2LifecycleRuleNoncurrentVersionExpiration>](#bucketv2lifecyclerulenoncurrentversionexpiration)

Specifies when noncurrent object versions expire. See Noncurrent Version Expiration below for details.

[NoncurrentVersionTransitions](#noncurrentversiontransitions_csharp) [List<BucketV2LifecycleRuleNoncurrentVersionTransition>](#bucketv2lifecyclerulenoncurrentversiontransition)

Specifies when noncurrent object versions transitions. See Noncurrent Version Transition below for details.

[Prefix](#prefix_csharp) string

Object key prefix identifying one or more objects to which the rule applies.

[Tags](#tags_csharp) Dictionary<string, string>

Specifies object tags key and value.

[Transitions](#transitions_csharp) [List<BucketV2LifecycleRuleTransition>](#bucketv2lifecycleruletransition)

Specifies a period in the object's transitions. See Transition below for details.

[Enabled](#enabled_go) This property is required. bool

Specifies lifecycle rule status.

[AbortIncompleteMultipartUploadDays](#abortincompletemultipartuploaddays_go) int

Specifies the number of days after initiating a multipart upload when the multipart upload must be completed.

[Expirations](#expirations_go) [\[\]BucketV2LifecycleRuleExpiration](#bucketv2lifecycleruleexpiration)

Specifies a period in the object's expire. See Expiration below for details.

[Id](#id_go) string

Unique identifier for the rule. Must be less than or equal to 255 characters in length.

[NoncurrentVersionExpirations](#noncurrentversionexpirations_go) [\[\]BucketV2LifecycleRuleNoncurrentVersionExpiration](#bucketv2lifecyclerulenoncurrentversionexpiration)

Specifies when noncurrent object versions expire. See Noncurrent Version Expiration below for details.

[NoncurrentVersionTransitions](#noncurrentversiontransitions_go) [\[\]BucketV2LifecycleRuleNoncurrentVersionTransition](#bucketv2lifecyclerulenoncurrentversiontransition)

Specifies when noncurrent object versions transitions. See Noncurrent Version Transition below for details.

[Prefix](#prefix_go) string

Object key prefix identifying one or more objects to which the rule applies.

[Tags](#tags_go) map\[string\]string

Specifies object tags key and value.

[Transitions](#transitions_go) [\[\]BucketV2LifecycleRuleTransition](#bucketv2lifecycleruletransition)

Specifies a period in the object's transitions. See Transition below for details.

[enabled](#enabled_hcl) This property is required. bool

Specifies lifecycle rule status.

[abort\_incomplete\_multipart\_upload\_days](#abort_incomplete_multipart_upload_days_hcl) number

Specifies the number of days after initiating a multipart upload when the multipart upload must be completed.

[expirations](#expirations_hcl) [list(object)](#bucketv2lifecycleruleexpiration)

Specifies a period in the object's expire. See Expiration below for details.

[id](#id_hcl) string

Unique identifier for the rule. Must be less than or equal to 255 characters in length.

[noncurrent\_version\_expirations](#noncurrent_version_expirations_hcl) [list(object)](#bucketv2lifecyclerulenoncurrentversionexpiration)

Specifies when noncurrent object versions expire. See Noncurrent Version Expiration below for details.

[noncurrent\_version\_transitions](#noncurrent_version_transitions_hcl) [list(object)](#bucketv2lifecyclerulenoncurrentversiontransition)

Specifies when noncurrent object versions transitions. See Noncurrent Version Transition below for details.

[prefix](#prefix_hcl) string

Object key prefix identifying one or more objects to which the rule applies.

[tags](#tags_hcl) map(string)

Specifies object tags key and value.

[transitions](#transitions_hcl) [list(object)](#bucketv2lifecycleruletransition)

Specifies a period in the object's transitions. See Transition below for details.

[enabled](#enabled_java) This property is required. Boolean

Specifies lifecycle rule status.

[abortIncompleteMultipartUploadDays](#abortincompletemultipartuploaddays_java) Integer

Specifies the number of days after initiating a multipart upload when the multipart upload must be completed.

[expirations](#expirations_java) [List<BucketV2LifecycleRuleExpiration>](#bucketv2lifecycleruleexpiration)

Specifies a period in the object's expire. See Expiration below for details.

[id](#id_java) String

Unique identifier for the rule. Must be less than or equal to 255 characters in length.

[noncurrentVersionExpirations](#noncurrentversionexpirations_java) [List<BucketV2LifecycleRuleNoncurrentVersionExpiration>](#bucketv2lifecyclerulenoncurrentversionexpiration)

Specifies when noncurrent object versions expire. See Noncurrent Version Expiration below for details.

[noncurrentVersionTransitions](#noncurrentversiontransitions_java) [List<BucketV2LifecycleRuleNoncurrentVersionTransition>](#bucketv2lifecyclerulenoncurrentversiontransition)

Specifies when noncurrent object versions transitions. See Noncurrent Version Transition below for details.

[prefix](#prefix_java) String

Object key prefix identifying one or more objects to which the rule applies.

[tags](#tags_java) Map<String,String>

Specifies object tags key and value.

[transitions](#transitions_java) [List<BucketV2LifecycleRuleTransition>](#bucketv2lifecycleruletransition)

Specifies a period in the object's transitions. See Transition below for details.

[enabled](#enabled_nodejs) This property is required. boolean

Specifies lifecycle rule status.

[abortIncompleteMultipartUploadDays](#abortincompletemultipartuploaddays_nodejs) number

Specifies the number of days after initiating a multipart upload when the multipart upload must be completed.

[expirations](#expirations_nodejs) [BucketV2LifecycleRuleExpiration\[\]](#bucketv2lifecycleruleexpiration)

Specifies a period in the object's expire. See Expiration below for details.

[id](#id_nodejs) string

Unique identifier for the rule. Must be less than or equal to 255 characters in length.

[noncurrentVersionExpirations](#noncurrentversionexpirations_nodejs) [BucketV2LifecycleRuleNoncurrentVersionExpiration\[\]](#bucketv2lifecyclerulenoncurrentversionexpiration)

Specifies when noncurrent object versions expire. See Noncurrent Version Expiration below for details.

[noncurrentVersionTransitions](#noncurrentversiontransitions_nodejs) [BucketV2LifecycleRuleNoncurrentVersionTransition\[\]](#bucketv2lifecyclerulenoncurrentversiontransition)

Specifies when noncurrent object versions transitions. See Noncurrent Version Transition below for details.

[prefix](#prefix_nodejs) string

Object key prefix identifying one or more objects to which the rule applies.

[tags](#tags_nodejs) {\[key: string\]: string}

Specifies object tags key and value.

[transitions](#transitions_nodejs) [BucketV2LifecycleRuleTransition\[\]](#bucketv2lifecycleruletransition)

Specifies a period in the object's transitions. See Transition below for details.

[enabled](#enabled_python) This property is required. bool

Specifies lifecycle rule status.

[abort\_incomplete\_multipart\_upload\_days](#abort_incomplete_multipart_upload_days_python) int

Specifies the number of days after initiating a multipart upload when the multipart upload must be completed.

[expirations](#expirations_python) [Sequence\[BucketV2LifecycleRuleExpiration\]](#bucketv2lifecycleruleexpiration)

Specifies a period in the object's expire. See Expiration below for details.

[id](#id_python) str

Unique identifier for the rule. Must be less than or equal to 255 characters in length.

[noncurrent\_version\_expirations](#noncurrent_version_expirations_python) [Sequence\[BucketV2LifecycleRuleNoncurrentVersionExpiration\]](#bucketv2lifecyclerulenoncurrentversionexpiration)

Specifies when noncurrent object versions expire. See Noncurrent Version Expiration below for details.

[noncurrent\_version\_transitions](#noncurrent_version_transitions_python) [Sequence\[BucketV2LifecycleRuleNoncurrentVersionTransition\]](#bucketv2lifecyclerulenoncurrentversiontransition)

Specifies when noncurrent object versions transitions. See Noncurrent Version Transition below for details.

[prefix](#prefix_python) str

Object key prefix identifying one or more objects to which the rule applies.

[tags](#tags_python) Mapping\[str, str\]

Specifies object tags key and value.

[transitions](#transitions_python) [Sequence\[BucketV2LifecycleRuleTransition\]](#bucketv2lifecycleruletransition)

Specifies a period in the object's transitions. See Transition below for details.

[enabled](#enabled_yaml) This property is required. Boolean

Specifies lifecycle rule status.

[abortIncompleteMultipartUploadDays](#abortincompletemultipartuploaddays_yaml) Number

Specifies the number of days after initiating a multipart upload when the multipart upload must be completed.

[expirations](#expirations_yaml) [List<Property Map>](#bucketv2lifecycleruleexpiration)

Specifies a period in the object's expire. See Expiration below for details.

[id](#id_yaml) String

Unique identifier for the rule. Must be less than or equal to 255 characters in length.

[noncurrentVersionExpirations](#noncurrentversionexpirations_yaml) [List<Property Map>](#bucketv2lifecyclerulenoncurrentversionexpiration)

Specifies when noncurrent object versions expire. See Noncurrent Version Expiration below for details.

[noncurrentVersionTransitions](#noncurrentversiontransitions_yaml) [List<Property Map>](#bucketv2lifecyclerulenoncurrentversiontransition)

Specifies when noncurrent object versions transitions. See Noncurrent Version Transition below for details.

[prefix](#prefix_yaml) String

Object key prefix identifying one or more objects to which the rule applies.

[tags](#tags_yaml) Map<String>

Specifies object tags key and value.

[transitions](#transitions_yaml) [List<Property Map>](#bucketv2lifecycleruletransition)

Specifies a period in the object's transitions. See Transition below for details.

#### BucketV2LifecycleRuleExpiration

, BucketV2LifecycleRuleExpirationArgs

[](#bucketv2lifecycleruleexpiration)

[Date](#date_csharp) string

Specifies the date after which you want the corresponding action to take effect.

[Days](#days_csharp) int

Specifies the number of days after object creation when the specific rule action takes effect.

[ExpiredObjectDeleteMarker](#expiredobjectdeletemarker_csharp) bool

On a versioned bucket (versioning-enabled or versioning-suspended bucket), you can add this element in the lifecycle configuration to direct Amazon S3 to delete expired object delete markers. This cannot be specified with Days or Date in a Lifecycle Expiration Policy.

[Date](#date_go) string

Specifies the date after which you want the corresponding action to take effect.

[Days](#days_go) int

Specifies the number of days after object creation when the specific rule action takes effect.

[ExpiredObjectDeleteMarker](#expiredobjectdeletemarker_go) bool

On a versioned bucket (versioning-enabled or versioning-suspended bucket), you can add this element in the lifecycle configuration to direct Amazon S3 to delete expired object delete markers. This cannot be specified with Days or Date in a Lifecycle Expiration Policy.

[date](#date_hcl) string

Specifies the date after which you want the corresponding action to take effect.

[days](#days_hcl) number

Specifies the number of days after object creation when the specific rule action takes effect.

[expired\_object\_delete\_marker](#expired_object_delete_marker_hcl) bool

On a versioned bucket (versioning-enabled or versioning-suspended bucket), you can add this element in the lifecycle configuration to direct Amazon S3 to delete expired object delete markers. This cannot be specified with Days or Date in a Lifecycle Expiration Policy.

[date](#date_java) String

Specifies the date after which you want the corresponding action to take effect.

[days](#days_java) Integer

Specifies the number of days after object creation when the specific rule action takes effect.

[expiredObjectDeleteMarker](#expiredobjectdeletemarker_java) Boolean

On a versioned bucket (versioning-enabled or versioning-suspended bucket), you can add this element in the lifecycle configuration to direct Amazon S3 to delete expired object delete markers. This cannot be specified with Days or Date in a Lifecycle Expiration Policy.

[date](#date_nodejs) string

Specifies the date after which you want the corresponding action to take effect.

[days](#days_nodejs) number

Specifies the number of days after object creation when the specific rule action takes effect.

[expiredObjectDeleteMarker](#expiredobjectdeletemarker_nodejs) boolean

On a versioned bucket (versioning-enabled or versioning-suspended bucket), you can add this element in the lifecycle configuration to direct Amazon S3 to delete expired object delete markers. This cannot be specified with Days or Date in a Lifecycle Expiration Policy.

[date](#date_python) str

Specifies the date after which you want the corresponding action to take effect.

[days](#days_python) int

Specifies the number of days after object creation when the specific rule action takes effect.

[expired\_object\_delete\_marker](#expired_object_delete_marker_python) bool

On a versioned bucket (versioning-enabled or versioning-suspended bucket), you can add this element in the lifecycle configuration to direct Amazon S3 to delete expired object delete markers. This cannot be specified with Days or Date in a Lifecycle Expiration Policy.

[date](#date_yaml) String

Specifies the date after which you want the corresponding action to take effect.

[days](#days_yaml) Number

Specifies the number of days after object creation when the specific rule action takes effect.

[expiredObjectDeleteMarker](#expiredobjectdeletemarker_yaml) Boolean

On a versioned bucket (versioning-enabled or versioning-suspended bucket), you can add this element in the lifecycle configuration to direct Amazon S3 to delete expired object delete markers. This cannot be specified with Days or Date in a Lifecycle Expiration Policy.

#### BucketV2LifecycleRuleNoncurrentVersionExpiration

, BucketV2LifecycleRuleNoncurrentVersionExpirationArgs

[](#bucketv2lifecyclerulenoncurrentversionexpiration)

[Days](#days_csharp) int

Specifies the number of days noncurrent object versions expire.

[Days](#days_go) int

Specifies the number of days noncurrent object versions expire.

[days](#days_hcl) number

Specifies the number of days noncurrent object versions expire.

[days](#days_java) Integer

Specifies the number of days noncurrent object versions expire.

[days](#days_nodejs) number

Specifies the number of days noncurrent object versions expire.

[days](#days_python) int

Specifies the number of days noncurrent object versions expire.

[days](#days_yaml) Number

Specifies the number of days noncurrent object versions expire.

#### BucketV2LifecycleRuleNoncurrentVersionTransition

, BucketV2LifecycleRuleNoncurrentVersionTransitionArgs

[](#bucketv2lifecyclerulenoncurrentversiontransition)

[StorageClass](#storageclass_csharp) This property is required. string

Specifies the Amazon S3 [storage class](https://docs.aws.amazon.com/AmazonS3/latest/API/API_Transition.html#AmazonS3-Type-Transition-StorageClass) to which you want the object to transition.

[Days](#days_csharp) int

Specifies the number of days noncurrent object versions transition.

[StorageClass](#storageclass_go) This property is required. string

Specifies the Amazon S3 [storage class](https://docs.aws.amazon.com/AmazonS3/latest/API/API_Transition.html#AmazonS3-Type-Transition-StorageClass) to which you want the object to transition.

[Days](#days_go) int

Specifies the number of days noncurrent object versions transition.

[storage\_class](#storage_class_hcl) This property is required. string

Specifies the Amazon S3 [storage class](https://docs.aws.amazon.com/AmazonS3/latest/API/API_Transition.html#AmazonS3-Type-Transition-StorageClass) to which you want the object to transition.

[days](#days_hcl) number

Specifies the number of days noncurrent object versions transition.

[storageClass](#storageclass_java) This property is required. String

Specifies the Amazon S3 [storage class](https://docs.aws.amazon.com/AmazonS3/latest/API/API_Transition.html#AmazonS3-Type-Transition-StorageClass) to which you want the object to transition.

[days](#days_java) Integer

Specifies the number of days noncurrent object versions transition.

[storageClass](#storageclass_nodejs) This property is required. string

Specifies the Amazon S3 [storage class](https://docs.aws.amazon.com/AmazonS3/latest/API/API_Transition.html#AmazonS3-Type-Transition-StorageClass) to which you want the object to transition.

[days](#days_nodejs) number

Specifies the number of days noncurrent object versions transition.

[storage\_class](#storage_class_python) This property is required. str

Specifies the Amazon S3 [storage class](https://docs.aws.amazon.com/AmazonS3/latest/API/API_Transition.html#AmazonS3-Type-Transition-StorageClass) to which you want the object to transition.

[days](#days_python) int

Specifies the number of days noncurrent object versions transition.

[storageClass](#storageclass_yaml) This property is required. String

Specifies the Amazon S3 [storage class](https://docs.aws.amazon.com/AmazonS3/latest/API/API_Transition.html#AmazonS3-Type-Transition-StorageClass) to which you want the object to transition.

[days](#days_yaml) Number

Specifies the number of days noncurrent object versions transition.

#### BucketV2LifecycleRuleTransition

, BucketV2LifecycleRuleTransitionArgs

[](#bucketv2lifecycleruletransition)

[StorageClass](#storageclass_csharp) This property is required. string

Specifies the Amazon S3 [storage class](https://docs.aws.amazon.com/AmazonS3/latest/API/API_Transition.html#AmazonS3-Type-Transition-StorageClass) to which you want the object to transition.

[Date](#date_csharp) string

Specifies the date after which you want the corresponding action to take effect.

[Days](#days_csharp) int

Specifies the number of days after object creation when the specific rule action takes effect.

[StorageClass](#storageclass_go) This property is required. string

Specifies the Amazon S3 [storage class](https://docs.aws.amazon.com/AmazonS3/latest/API/API_Transition.html#AmazonS3-Type-Transition-StorageClass) to which you want the object to transition.

[Date](#date_go) string

Specifies the date after which you want the corresponding action to take effect.

[Days](#days_go) int

Specifies the number of days after object creation when the specific rule action takes effect.

[storage\_class](#storage_class_hcl) This property is required. string

Specifies the Amazon S3 [storage class](https://docs.aws.amazon.com/AmazonS3/latest/API/API_Transition.html#AmazonS3-Type-Transition-StorageClass) to which you want the object to transition.

[date](#date_hcl) string

Specifies the date after which you want the corresponding action to take effect.

[days](#days_hcl) number

Specifies the number of days after object creation when the specific rule action takes effect.

[storageClass](#storageclass_java) This property is required. String

Specifies the Amazon S3 [storage class](https://docs.aws.amazon.com/AmazonS3/latest/API/API_Transition.html#AmazonS3-Type-Transition-StorageClass) to which you want the object to transition.

[date](#date_java) String

Specifies the date after which you want the corresponding action to take effect.

[days](#days_java) Integer

Specifies the number of days after object creation when the specific rule action takes effect.

[storageClass](#storageclass_nodejs) This property is required. string

Specifies the Amazon S3 [storage class](https://docs.aws.amazon.com/AmazonS3/latest/API/API_Transition.html#AmazonS3-Type-Transition-StorageClass) to which you want the object to transition.

[date](#date_nodejs) string

Specifies the date after which you want the corresponding action to take effect.

[days](#days_nodejs) number

Specifies the number of days after object creation when the specific rule action takes effect.

[storage\_class](#storage_class_python) This property is required. str

Specifies the Amazon S3 [storage class](https://docs.aws.amazon.com/AmazonS3/latest/API/API_Transition.html#AmazonS3-Type-Transition-StorageClass) to which you want the object to transition.

[date](#date_python) str

Specifies the date after which you want the corresponding action to take effect.

[days](#days_python) int

Specifies the number of days after object creation when the specific rule action takes effect.

[storageClass](#storageclass_yaml) This property is required. String

Specifies the Amazon S3 [storage class](https://docs.aws.amazon.com/AmazonS3/latest/API/API_Transition.html#AmazonS3-Type-Transition-StorageClass) to which you want the object to transition.

[date](#date_yaml) String

Specifies the date after which you want the corresponding action to take effect.

[days](#days_yaml) Number

Specifies the number of days after object creation when the specific rule action takes effect.

#### BucketV2Logging

, BucketV2LoggingArgs

[](#bucketv2logging)

[TargetBucket](#targetbucket_csharp) This property is required. string

Name of the bucket that will receive the log objects.

[TargetPrefix](#targetprefix_csharp) string

To specify a key prefix for log objects.

[TargetBucket](#targetbucket_go) This property is required. string

Name of the bucket that will receive the log objects.

[TargetPrefix](#targetprefix_go) string

To specify a key prefix for log objects.

[target\_bucket](#target_bucket_hcl) This property is required. string

Name of the bucket that will receive the log objects.

[target\_prefix](#target_prefix_hcl) string

To specify a key prefix for log objects.

[targetBucket](#targetbucket_java) This property is required. String

Name of the bucket that will receive the log objects.

[targetPrefix](#targetprefix_java) String

To specify a key prefix for log objects.

[targetBucket](#targetbucket_nodejs) This property is required. string

Name of the bucket that will receive the log objects.

[targetPrefix](#targetprefix_nodejs) string

To specify a key prefix for log objects.

[target\_bucket](#target_bucket_python) This property is required. str

Name of the bucket that will receive the log objects.

[target\_prefix](#target_prefix_python) str

To specify a key prefix for log objects.

[targetBucket](#targetbucket_yaml) This property is required. String

Name of the bucket that will receive the log objects.

[targetPrefix](#targetprefix_yaml) String

To specify a key prefix for log objects.

#### BucketV2ObjectLockConfiguration

, BucketV2ObjectLockConfigurationArgs

[](#bucketv2objectlockconfiguration)

[ObjectLockEnabled](#objectlockenabled_csharp)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Indicates whether this bucket has an Object Lock configuration enabled. Valid values are `true` or `false`. This argument is not supported in all regions or partitions.

Deprecated: object\_lock\_enabled is deprecated. Use the top-level parameter objectLockEnabled instead.

[Rules](#rules_csharp) [List<BucketV2ObjectLockConfigurationRule>](#bucketv2objectlockconfigurationrule)

Object Lock rule in place for this bucket (documented below).

Deprecated: rule is deprecated. Use the aws.s3.BucketObjectLockConfiguration resource instead.

[ObjectLockEnabled](#objectlockenabled_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Indicates whether this bucket has an Object Lock configuration enabled. Valid values are `true` or `false`. This argument is not supported in all regions or partitions.

Deprecated: object\_lock\_enabled is deprecated. Use the top-level parameter objectLockEnabled instead.

[Rules](#rules_go) [\[\]BucketV2ObjectLockConfigurationRule](#bucketv2objectlockconfigurationrule)

Object Lock rule in place for this bucket (documented below).

Deprecated: rule is deprecated. Use the aws.s3.BucketObjectLockConfiguration resource instead.

[object\_lock\_enabled](#object_lock_enabled_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Indicates whether this bucket has an Object Lock configuration enabled. Valid values are `true` or `false`. This argument is not supported in all regions or partitions.

Deprecated: object\_lock\_enabled is deprecated. Use the top-level parameter objectLockEnabled instead.

[rules](#rules_hcl) [list(object)](#bucketv2objectlockconfigurationrule)

Object Lock rule in place for this bucket (documented below).

Deprecated: rule is deprecated. Use the aws.s3.BucketObjectLockConfiguration resource instead.

[objectLockEnabled](#objectlockenabled_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Indicates whether this bucket has an Object Lock configuration enabled. Valid values are `true` or `false`. This argument is not supported in all regions or partitions.

Deprecated: object\_lock\_enabled is deprecated. Use the top-level parameter objectLockEnabled instead.

[rules](#rules_java) [List<BucketV2ObjectLockConfigurationRule>](#bucketv2objectlockconfigurationrule)

Object Lock rule in place for this bucket (documented below).

Deprecated: rule is deprecated. Use the aws.s3.BucketObjectLockConfiguration resource instead.

[objectLockEnabled](#objectlockenabled_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Indicates whether this bucket has an Object Lock configuration enabled. Valid values are `true` or `false`. This argument is not supported in all regions or partitions.

Deprecated: object\_lock\_enabled is deprecated. Use the top-level parameter objectLockEnabled instead.

[rules](#rules_nodejs) [BucketV2ObjectLockConfigurationRule\[\]](#bucketv2objectlockconfigurationrule)

Object Lock rule in place for this bucket (documented below).

Deprecated: rule is deprecated. Use the aws.s3.BucketObjectLockConfiguration resource instead.

[object\_lock\_enabled](#object_lock_enabled_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Indicates whether this bucket has an Object Lock configuration enabled. Valid values are `true` or `false`. This argument is not supported in all regions or partitions.

Deprecated: object\_lock\_enabled is deprecated. Use the top-level parameter objectLockEnabled instead.

[rules](#rules_python) [Sequence\[BucketV2ObjectLockConfigurationRule\]](#bucketv2objectlockconfigurationrule)

Object Lock rule in place for this bucket (documented below).

Deprecated: rule is deprecated. Use the aws.s3.BucketObjectLockConfiguration resource instead.

[objectLockEnabled](#objectlockenabled_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Indicates whether this bucket has an Object Lock configuration enabled. Valid values are `true` or `false`. This argument is not supported in all regions or partitions.

Deprecated: object\_lock\_enabled is deprecated. Use the top-level parameter objectLockEnabled instead.

[rules](#rules_yaml) [List<Property Map>](#bucketv2objectlockconfigurationrule)

Object Lock rule in place for this bucket (documented below).

Deprecated: rule is deprecated. Use the aws.s3.BucketObjectLockConfiguration resource instead.

#### BucketV2ObjectLockConfigurationRule

, BucketV2ObjectLockConfigurationRuleArgs

[](#bucketv2objectlockconfigurationrule)

[DefaultRetentions](#defaultretentions_csharp) This property is required. [List<BucketV2ObjectLockConfigurationRuleDefaultRetention>](#bucketv2objectlockconfigurationruledefaultretention)

Default retention period that you want to apply to new objects placed in this bucket (documented below).

[DefaultRetentions](#defaultretentions_go) This property is required. [\[\]BucketV2ObjectLockConfigurationRuleDefaultRetention](#bucketv2objectlockconfigurationruledefaultretention)

Default retention period that you want to apply to new objects placed in this bucket (documented below).

[default\_retentions](#default_retentions_hcl) This property is required. [list(object)](#bucketv2objectlockconfigurationruledefaultretention)

Default retention period that you want to apply to new objects placed in this bucket (documented below).

[defaultRetentions](#defaultretentions_java) This property is required. [List<BucketV2ObjectLockConfigurationRuleDefaultRetention>](#bucketv2objectlockconfigurationruledefaultretention)

Default retention period that you want to apply to new objects placed in this bucket (documented below).

[defaultRetentions](#defaultretentions_nodejs) This property is required. [BucketV2ObjectLockConfigurationRuleDefaultRetention\[\]](#bucketv2objectlockconfigurationruledefaultretention)

Default retention period that you want to apply to new objects placed in this bucket (documented below).

[default\_retentions](#default_retentions_python) This property is required. [Sequence\[BucketV2ObjectLockConfigurationRuleDefaultRetention\]](#bucketv2objectlockconfigurationruledefaultretention)

Default retention period that you want to apply to new objects placed in this bucket (documented below).

[defaultRetentions](#defaultretentions_yaml) This property is required. [List<Property Map>](#bucketv2objectlockconfigurationruledefaultretention)

Default retention period that you want to apply to new objects placed in this bucket (documented below).

#### BucketV2ObjectLockConfigurationRuleDefaultRetention

, BucketV2ObjectLockConfigurationRuleDefaultRetentionArgs

[](#bucketv2objectlockconfigurationruledefaultretention)

[Mode](#mode_csharp) This property is required. string

Default Object Lock retention mode you want to apply to new objects placed in this bucket. Valid values are `GOVERNANCE` and `COMPLIANCE`.

[Days](#days_csharp) int

Number of days that you want to specify for the default retention period.

[Years](#years_csharp) int

Number of years that you want to specify for the default retention period.

[Mode](#mode_go) This property is required. string

Default Object Lock retention mode you want to apply to new objects placed in this bucket. Valid values are `GOVERNANCE` and `COMPLIANCE`.

[Days](#days_go) int

Number of days that you want to specify for the default retention period.

[Years](#years_go) int

Number of years that you want to specify for the default retention period.

[mode](#mode_hcl) This property is required. string

Default Object Lock retention mode you want to apply to new objects placed in this bucket. Valid values are `GOVERNANCE` and `COMPLIANCE`.

[days](#days_hcl) number

Number of days that you want to specify for the default retention period.

[years](#years_hcl) number

Number of years that you want to specify for the default retention period.

[mode](#mode_java) This property is required. String

Default Object Lock retention mode you want to apply to new objects placed in this bucket. Valid values are `GOVERNANCE` and `COMPLIANCE`.

[days](#days_java) Integer

Number of days that you want to specify for the default retention period.

[years](#years_java) Integer

Number of years that you want to specify for the default retention period.

[mode](#mode_nodejs) This property is required. string

Default Object Lock retention mode you want to apply to new objects placed in this bucket. Valid values are `GOVERNANCE` and `COMPLIANCE`.

[days](#days_nodejs) number

Number of days that you want to specify for the default retention period.

[years](#years_nodejs) number

Number of years that you want to specify for the default retention period.

[mode](#mode_python) This property is required. str

Default Object Lock retention mode you want to apply to new objects placed in this bucket. Valid values are `GOVERNANCE` and `COMPLIANCE`.

[days](#days_python) int

Number of days that you want to specify for the default retention period.

[years](#years_python) int

Number of years that you want to specify for the default retention period.

[mode](#mode_yaml) This property is required. String

Default Object Lock retention mode you want to apply to new objects placed in this bucket. Valid values are `GOVERNANCE` and `COMPLIANCE`.

[days](#days_yaml) Number

Number of days that you want to specify for the default retention period.

[years](#years_yaml) Number

Number of years that you want to specify for the default retention period.

#### BucketV2ReplicationConfiguration

, BucketV2ReplicationConfigurationArgs

[](#bucketv2replicationconfiguration)

[Role](#role_csharp) This property is required. string

ARN of the IAM role for Amazon S3 to assume when replicating the objects.

[Rules](#rules_csharp) This property is required. [List<BucketV2ReplicationConfigurationRule>](#bucketv2replicationconfigurationrule)

Specifies the rules managing the replication (documented below).

[Role](#role_go) This property is required. string

ARN of the IAM role for Amazon S3 to assume when replicating the objects.

[Rules](#rules_go) This property is required. [\[\]BucketV2ReplicationConfigurationRule](#bucketv2replicationconfigurationrule)

Specifies the rules managing the replication (documented below).

[role](#role_hcl) This property is required. string

ARN of the IAM role for Amazon S3 to assume when replicating the objects.

[rules](#rules_hcl) This property is required. [list(object)](#bucketv2replicationconfigurationrule)

Specifies the rules managing the replication (documented below).

[role](#role_java) This property is required. String

ARN of the IAM role for Amazon S3 to assume when replicating the objects.

[rules](#rules_java) This property is required. [List<BucketV2ReplicationConfigurationRule>](#bucketv2replicationconfigurationrule)

Specifies the rules managing the replication (documented below).

[role](#role_nodejs) This property is required. string

ARN of the IAM role for Amazon S3 to assume when replicating the objects.

[rules](#rules_nodejs) This property is required. [BucketV2ReplicationConfigurationRule\[\]](#bucketv2replicationconfigurationrule)

Specifies the rules managing the replication (documented below).

[role](#role_python) This property is required. str

ARN of the IAM role for Amazon S3 to assume when replicating the objects.

[rules](#rules_python) This property is required. [Sequence\[BucketV2ReplicationConfigurationRule\]](#bucketv2replicationconfigurationrule)

Specifies the rules managing the replication (documented below).

[role](#role_yaml) This property is required. String

ARN of the IAM role for Amazon S3 to assume when replicating the objects.

[rules](#rules_yaml) This property is required. [List<Property Map>](#bucketv2replicationconfigurationrule)

Specifies the rules managing the replication (documented below).

#### BucketV2ReplicationConfigurationRule

, BucketV2ReplicationConfigurationRuleArgs

[](#bucketv2replicationconfigurationrule)

[Destinations](#destinations_csharp) This property is required. [List<BucketV2ReplicationConfigurationRuleDestination>](#bucketv2replicationconfigurationruledestination)

Specifies the destination for the rule (documented below).

[Status](#status_csharp) This property is required. string

Status of the rule. Either `Enabled` or `Disabled`. The rule is ignored if status is not Enabled.

[DeleteMarkerReplicationStatus](#deletemarkerreplicationstatus_csharp) string

Whether delete markers are replicated. The only valid value is `Enabled`. To disable, omit this argument. This argument is only valid with V2 replication configurations (i.e., when `filter` is used).

[Filters](#filters_csharp) [List<BucketV2ReplicationConfigurationRuleFilter>](#bucketv2replicationconfigurationrulefilter)

Filter that identifies subset of objects to which the replication rule applies (documented below).

[Id](#id_csharp) string

Unique identifier for the rule. Must be less than or equal to 255 characters in length.

[Prefix](#prefix_csharp) string

Object keyname prefix identifying one or more objects to which the rule applies. Must be less than or equal to 1024 characters in length.

[Priority](#priority_csharp) int

Priority associated with the rule. Priority should only be set if `filter` is configured. If not provided, defaults to `0`. Priority must be unique between multiple rules.

[SourceSelectionCriterias](#sourceselectioncriterias_csharp) [List<BucketV2ReplicationConfigurationRuleSourceSelectionCriteria>](#bucketv2replicationconfigurationrulesourceselectioncriteria)

Specifies special object selection criteria (documented below).

[Destinations](#destinations_go) This property is required. [\[\]BucketV2ReplicationConfigurationRuleDestination](#bucketv2replicationconfigurationruledestination)

Specifies the destination for the rule (documented below).

[Status](#status_go) This property is required. string

Status of the rule. Either `Enabled` or `Disabled`. The rule is ignored if status is not Enabled.

[DeleteMarkerReplicationStatus](#deletemarkerreplicationstatus_go) string

Whether delete markers are replicated. The only valid value is `Enabled`. To disable, omit this argument. This argument is only valid with V2 replication configurations (i.e., when `filter` is used).

[Filters](#filters_go) [\[\]BucketV2ReplicationConfigurationRuleFilter](#bucketv2replicationconfigurationrulefilter)

Filter that identifies subset of objects to which the replication rule applies (documented below).

[Id](#id_go) string

Unique identifier for the rule. Must be less than or equal to 255 characters in length.

[Prefix](#prefix_go) string

Object keyname prefix identifying one or more objects to which the rule applies. Must be less than or equal to 1024 characters in length.

[Priority](#priority_go) int

Priority associated with the rule. Priority should only be set if `filter` is configured. If not provided, defaults to `0`. Priority must be unique between multiple rules.

[SourceSelectionCriterias](#sourceselectioncriterias_go) [\[\]BucketV2ReplicationConfigurationRuleSourceSelectionCriteria](#bucketv2replicationconfigurationrulesourceselectioncriteria)

Specifies special object selection criteria (documented below).

[destinations](#destinations_hcl) This property is required. [list(object)](#bucketv2replicationconfigurationruledestination)

Specifies the destination for the rule (documented below).

[status](#status_hcl) This property is required. string

Status of the rule. Either `Enabled` or `Disabled`. The rule is ignored if status is not Enabled.

[delete\_marker\_replication\_status](#delete_marker_replication_status_hcl) string

Whether delete markers are replicated. The only valid value is `Enabled`. To disable, omit this argument. This argument is only valid with V2 replication configurations (i.e., when `filter` is used).

[filters](#filters_hcl) [list(object)](#bucketv2replicationconfigurationrulefilter)

Filter that identifies subset of objects to which the replication rule applies (documented below).

[id](#id_hcl) string

Unique identifier for the rule. Must be less than or equal to 255 characters in length.

[prefix](#prefix_hcl) string

Object keyname prefix identifying one or more objects to which the rule applies. Must be less than or equal to 1024 characters in length.

[priority](#priority_hcl) number

Priority associated with the rule. Priority should only be set if `filter` is configured. If not provided, defaults to `0`. Priority must be unique between multiple rules.

[source\_selection\_criterias](#source_selection_criterias_hcl) [list(object)](#bucketv2replicationconfigurationrulesourceselectioncriteria)

Specifies special object selection criteria (documented below).

[destinations](#destinations_java) This property is required. [List<BucketV2ReplicationConfigurationRuleDestination>](#bucketv2replicationconfigurationruledestination)

Specifies the destination for the rule (documented below).

[status](#status_java) This property is required. String

Status of the rule. Either `Enabled` or `Disabled`. The rule is ignored if status is not Enabled.

[deleteMarkerReplicationStatus](#deletemarkerreplicationstatus_java) String

Whether delete markers are replicated. The only valid value is `Enabled`. To disable, omit this argument. This argument is only valid with V2 replication configurations (i.e., when `filter` is used).

[filters](#filters_java) [List<BucketV2ReplicationConfigurationRuleFilter>](#bucketv2replicationconfigurationrulefilter)

Filter that identifies subset of objects to which the replication rule applies (documented below).

[id](#id_java) String

Unique identifier for the rule. Must be less than or equal to 255 characters in length.

[prefix](#prefix_java) String

Object keyname prefix identifying one or more objects to which the rule applies. Must be less than or equal to 1024 characters in length.

[priority](#priority_java) Integer

Priority associated with the rule. Priority should only be set if `filter` is configured. If not provided, defaults to `0`. Priority must be unique between multiple rules.

[sourceSelectionCriterias](#sourceselectioncriterias_java) [List<BucketV2ReplicationConfigurationRuleSourceSelectionCriteria>](#bucketv2replicationconfigurationrulesourceselectioncriteria)

Specifies special object selection criteria (documented below).

[destinations](#destinations_nodejs) This property is required. [BucketV2ReplicationConfigurationRuleDestination\[\]](#bucketv2replicationconfigurationruledestination)

Specifies the destination for the rule (documented below).

[status](#status_nodejs) This property is required. string

Status of the rule. Either `Enabled` or `Disabled`. The rule is ignored if status is not Enabled.

[deleteMarkerReplicationStatus](#deletemarkerreplicationstatus_nodejs) string

Whether delete markers are replicated. The only valid value is `Enabled`. To disable, omit this argument. This argument is only valid with V2 replication configurations (i.e., when `filter` is used).

[filters](#filters_nodejs) [BucketV2ReplicationConfigurationRuleFilter\[\]](#bucketv2replicationconfigurationrulefilter)

Filter that identifies subset of objects to which the replication rule applies (documented below).

[id](#id_nodejs) string

Unique identifier for the rule. Must be less than or equal to 255 characters in length.

[prefix](#prefix_nodejs) string

Object keyname prefix identifying one or more objects to which the rule applies. Must be less than or equal to 1024 characters in length.

[priority](#priority_nodejs) number

Priority associated with the rule. Priority should only be set if `filter` is configured. If not provided, defaults to `0`. Priority must be unique between multiple rules.

[sourceSelectionCriterias](#sourceselectioncriterias_nodejs) [BucketV2ReplicationConfigurationRuleSourceSelectionCriteria\[\]](#bucketv2replicationconfigurationrulesourceselectioncriteria)

Specifies special object selection criteria (documented below).

[destinations](#destinations_python) This property is required. [Sequence\[BucketV2ReplicationConfigurationRuleDestination\]](#bucketv2replicationconfigurationruledestination)

Specifies the destination for the rule (documented below).

[status](#status_python) This property is required. str

Status of the rule. Either `Enabled` or `Disabled`. The rule is ignored if status is not Enabled.

[delete\_marker\_replication\_status](#delete_marker_replication_status_python) str

Whether delete markers are replicated. The only valid value is `Enabled`. To disable, omit this argument. This argument is only valid with V2 replication configurations (i.e., when `filter` is used).

[filters](#filters_python) [Sequence\[BucketV2ReplicationConfigurationRuleFilter\]](#bucketv2replicationconfigurationrulefilter)

Filter that identifies subset of objects to which the replication rule applies (documented below).

[id](#id_python) str

Unique identifier for the rule. Must be less than or equal to 255 characters in length.

[prefix](#prefix_python) str

Object keyname prefix identifying one or more objects to which the rule applies. Must be less than or equal to 1024 characters in length.

[priority](#priority_python) int

Priority associated with the rule. Priority should only be set if `filter` is configured. If not provided, defaults to `0`. Priority must be unique between multiple rules.

[source\_selection\_criterias](#source_selection_criterias_python) [Sequence\[BucketV2ReplicationConfigurationRuleSourceSelectionCriteria\]](#bucketv2replicationconfigurationrulesourceselectioncriteria)

Specifies special object selection criteria (documented below).

[destinations](#destinations_yaml) This property is required. [List<Property Map>](#bucketv2replicationconfigurationruledestination)

Specifies the destination for the rule (documented below).

[status](#status_yaml) This property is required. String

Status of the rule. Either `Enabled` or `Disabled`. The rule is ignored if status is not Enabled.

[deleteMarkerReplicationStatus](#deletemarkerreplicationstatus_yaml) String

Whether delete markers are replicated. The only valid value is `Enabled`. To disable, omit this argument. This argument is only valid with V2 replication configurations (i.e., when `filter` is used).

[filters](#filters_yaml) [List<Property Map>](#bucketv2replicationconfigurationrulefilter)

Filter that identifies subset of objects to which the replication rule applies (documented below).

[id](#id_yaml) String

Unique identifier for the rule. Must be less than or equal to 255 characters in length.

[prefix](#prefix_yaml) String

Object keyname prefix identifying one or more objects to which the rule applies. Must be less than or equal to 1024 characters in length.

[priority](#priority_yaml) Number

Priority associated with the rule. Priority should only be set if `filter` is configured. If not provided, defaults to `0`. Priority must be unique between multiple rules.

[sourceSelectionCriterias](#sourceselectioncriterias_yaml) [List<Property Map>](#bucketv2replicationconfigurationrulesourceselectioncriteria)

Specifies special object selection criteria (documented below).

#### BucketV2ReplicationConfigurationRuleDestination

, BucketV2ReplicationConfigurationRuleDestinationArgs

[](#bucketv2replicationconfigurationruledestination)

[Bucket](#bucket_csharp) This property is required. string

ARN of the S3 bucket where you want Amazon S3 to store replicas of the object identified by the rule.

[AccessControlTranslations](#accesscontroltranslations_csharp) [List<BucketV2ReplicationConfigurationRuleDestinationAccessControlTranslation>](#bucketv2replicationconfigurationruledestinationaccesscontroltranslation)

Specifies the overrides to use for object owners on replication (documented below). Must be used in conjunction with `accountId` owner override configuration.

[AccountId](#accountid_csharp) string

Account ID to use for overriding the object owner on replication. Must be used in conjunction with `accessControlTranslation` override configuration.

[Metrics](#metrics_csharp) [List<BucketV2ReplicationConfigurationRuleDestinationMetric>](#bucketv2replicationconfigurationruledestinationmetric)

Enables replication metrics (required for S3 RTC) (documented below).

[ReplicaKmsKeyId](#replicakmskeyid_csharp) string

Destination KMS encryption key ARN for SSE-KMS replication. Must be used in conjunction with `sseKmsEncryptedObjects` source selection criteria.

[ReplicationTimes](#replicationtimes_csharp) [List<BucketV2ReplicationConfigurationRuleDestinationReplicationTime>](#bucketv2replicationconfigurationruledestinationreplicationtime)

Enables S3 Replication Time Control (S3 RTC) (documented below).

[StorageClass](#storageclass_csharp) string

The [storage class](https://docs.aws.amazon.com/AmazonS3/latest/API/API_Destination.html#AmazonS3-Type-Destination-StorageClass) used to store the object. By default, Amazon S3 uses the storage class of the source object to create the object replica.

[Bucket](#bucket_go) This property is required. string

ARN of the S3 bucket where you want Amazon S3 to store replicas of the object identified by the rule.

[AccessControlTranslations](#accesscontroltranslations_go) [\[\]BucketV2ReplicationConfigurationRuleDestinationAccessControlTranslation](#bucketv2replicationconfigurationruledestinationaccesscontroltranslation)

Specifies the overrides to use for object owners on replication (documented below). Must be used in conjunction with `accountId` owner override configuration.

[AccountId](#accountid_go) string

Account ID to use for overriding the object owner on replication. Must be used in conjunction with `accessControlTranslation` override configuration.

[Metrics](#metrics_go) [\[\]BucketV2ReplicationConfigurationRuleDestinationMetric](#bucketv2replicationconfigurationruledestinationmetric)

Enables replication metrics (required for S3 RTC) (documented below).

[ReplicaKmsKeyId](#replicakmskeyid_go) string

Destination KMS encryption key ARN for SSE-KMS replication. Must be used in conjunction with `sseKmsEncryptedObjects` source selection criteria.

[ReplicationTimes](#replicationtimes_go) [\[\]BucketV2ReplicationConfigurationRuleDestinationReplicationTime](#bucketv2replicationconfigurationruledestinationreplicationtime)

Enables S3 Replication Time Control (S3 RTC) (documented below).

[StorageClass](#storageclass_go) string

The [storage class](https://docs.aws.amazon.com/AmazonS3/latest/API/API_Destination.html#AmazonS3-Type-Destination-StorageClass) used to store the object. By default, Amazon S3 uses the storage class of the source object to create the object replica.

[bucket](#bucket_hcl) This property is required. string

ARN of the S3 bucket where you want Amazon S3 to store replicas of the object identified by the rule.

[access\_control\_translations](#access_control_translations_hcl) [list(object)](#bucketv2replicationconfigurationruledestinationaccesscontroltranslation)

Specifies the overrides to use for object owners on replication (documented below). Must be used in conjunction with `accountId` owner override configuration.

[account\_id](#account_id_hcl) string

Account ID to use for overriding the object owner on replication. Must be used in conjunction with `accessControlTranslation` override configuration.

[metrics](#metrics_hcl) [list(object)](#bucketv2replicationconfigurationruledestinationmetric)

Enables replication metrics (required for S3 RTC) (documented below).

[replica\_kms\_key\_id](#replica_kms_key_id_hcl) string

Destination KMS encryption key ARN for SSE-KMS replication. Must be used in conjunction with `sseKmsEncryptedObjects` source selection criteria.

[replication\_times](#replication_times_hcl) [list(object)](#bucketv2replicationconfigurationruledestinationreplicationtime)

Enables S3 Replication Time Control (S3 RTC) (documented below).

[storage\_class](#storage_class_hcl) string

The [storage class](https://docs.aws.amazon.com/AmazonS3/latest/API/API_Destination.html#AmazonS3-Type-Destination-StorageClass) used to store the object. By default, Amazon S3 uses the storage class of the source object to create the object replica.

[bucket](#bucket_java) This property is required. String

ARN of the S3 bucket where you want Amazon S3 to store replicas of the object identified by the rule.

[accessControlTranslations](#accesscontroltranslations_java) [List<BucketV2ReplicationConfigurationRuleDestinationAccessControlTranslation>](#bucketv2replicationconfigurationruledestinationaccesscontroltranslation)

Specifies the overrides to use for object owners on replication (documented below). Must be used in conjunction with `accountId` owner override configuration.

[accountId](#accountid_java) String

Account ID to use for overriding the object owner on replication. Must be used in conjunction with `accessControlTranslation` override configuration.

[metrics](#metrics_java) [List<BucketV2ReplicationConfigurationRuleDestinationMetric>](#bucketv2replicationconfigurationruledestinationmetric)

Enables replication metrics (required for S3 RTC) (documented below).

[replicaKmsKeyId](#replicakmskeyid_java) String

Destination KMS encryption key ARN for SSE-KMS replication. Must be used in conjunction with `sseKmsEncryptedObjects` source selection criteria.

[replicationTimes](#replicationtimes_java) [List<BucketV2ReplicationConfigurationRuleDestinationReplicationTime>](#bucketv2replicationconfigurationruledestinationreplicationtime)

Enables S3 Replication Time Control (S3 RTC) (documented below).

[storageClass](#storageclass_java) String

The [storage class](https://docs.aws.amazon.com/AmazonS3/latest/API/API_Destination.html#AmazonS3-Type-Destination-StorageClass) used to store the object. By default, Amazon S3 uses the storage class of the source object to create the object replica.

[bucket](#bucket_nodejs) This property is required. string

ARN of the S3 bucket where you want Amazon S3 to store replicas of the object identified by the rule.

[accessControlTranslations](#accesscontroltranslations_nodejs) [BucketV2ReplicationConfigurationRuleDestinationAccessControlTranslation\[\]](#bucketv2replicationconfigurationruledestinationaccesscontroltranslation)

Specifies the overrides to use for object owners on replication (documented below). Must be used in conjunction with `accountId` owner override configuration.

[accountId](#accountid_nodejs) string

Account ID to use for overriding the object owner on replication. Must be used in conjunction with `accessControlTranslation` override configuration.

[metrics](#metrics_nodejs) [BucketV2ReplicationConfigurationRuleDestinationMetric\[\]](#bucketv2replicationconfigurationruledestinationmetric)

Enables replication metrics (required for S3 RTC) (documented below).

[replicaKmsKeyId](#replicakmskeyid_nodejs) string

Destination KMS encryption key ARN for SSE-KMS replication. Must be used in conjunction with `sseKmsEncryptedObjects` source selection criteria.

[replicationTimes](#replicationtimes_nodejs) [BucketV2ReplicationConfigurationRuleDestinationReplicationTime\[\]](#bucketv2replicationconfigurationruledestinationreplicationtime)

Enables S3 Replication Time Control (S3 RTC) (documented below).

[storageClass](#storageclass_nodejs) string

The [storage class](https://docs.aws.amazon.com/AmazonS3/latest/API/API_Destination.html#AmazonS3-Type-Destination-StorageClass) used to store the object. By default, Amazon S3 uses the storage class of the source object to create the object replica.

[bucket](#bucket_python) This property is required. str

ARN of the S3 bucket where you want Amazon S3 to store replicas of the object identified by the rule.

[access\_control\_translations](#access_control_translations_python) [Sequence\[BucketV2ReplicationConfigurationRuleDestinationAccessControlTranslation\]](#bucketv2replicationconfigurationruledestinationaccesscontroltranslation)

Specifies the overrides to use for object owners on replication (documented below). Must be used in conjunction with `accountId` owner override configuration.

[account\_id](#account_id_python) str

Account ID to use for overriding the object owner on replication. Must be used in conjunction with `accessControlTranslation` override configuration.

[metrics](#metrics_python) [Sequence\[BucketV2ReplicationConfigurationRuleDestinationMetric\]](#bucketv2replicationconfigurationruledestinationmetric)

Enables replication metrics (required for S3 RTC) (documented below).

[replica\_kms\_key\_id](#replica_kms_key_id_python) str

Destination KMS encryption key ARN for SSE-KMS replication. Must be used in conjunction with `sseKmsEncryptedObjects` source selection criteria.

[replication\_times](#replication_times_python) [Sequence\[BucketV2ReplicationConfigurationRuleDestinationReplicationTime\]](#bucketv2replicationconfigurationruledestinationreplicationtime)

Enables S3 Replication Time Control (S3 RTC) (documented below).

[storage\_class](#storage_class_python) str

The [storage class](https://docs.aws.amazon.com/AmazonS3/latest/API/API_Destination.html#AmazonS3-Type-Destination-StorageClass) used to store the object. By default, Amazon S3 uses the storage class of the source object to create the object replica.

[bucket](#bucket_yaml) This property is required. String

ARN of the S3 bucket where you want Amazon S3 to store replicas of the object identified by the rule.

[accessControlTranslations](#accesscontroltranslations_yaml) [List<Property Map>](#bucketv2replicationconfigurationruledestinationaccesscontroltranslation)

Specifies the overrides to use for object owners on replication (documented below). Must be used in conjunction with `accountId` owner override configuration.

[accountId](#accountid_yaml) String

Account ID to use for overriding the object owner on replication. Must be used in conjunction with `accessControlTranslation` override configuration.

[metrics](#metrics_yaml) [List<Property Map>](#bucketv2replicationconfigurationruledestinationmetric)

Enables replication metrics (required for S3 RTC) (documented below).

[replicaKmsKeyId](#replicakmskeyid_yaml) String

Destination KMS encryption key ARN for SSE-KMS replication. Must be used in conjunction with `sseKmsEncryptedObjects` source selection criteria.

[replicationTimes](#replicationtimes_yaml) [List<Property Map>](#bucketv2replicationconfigurationruledestinationreplicationtime)

Enables S3 Replication Time Control (S3 RTC) (documented below).

[storageClass](#storageclass_yaml) String

The [storage class](https://docs.aws.amazon.com/AmazonS3/latest/API/API_Destination.html#AmazonS3-Type-Destination-StorageClass) used to store the object. By default, Amazon S3 uses the storage class of the source object to create the object replica.

#### BucketV2ReplicationConfigurationRuleDestinationAccessControlTranslation

, BucketV2ReplicationConfigurationRuleDestinationAccessControlTranslationArgs

[](#bucketv2replicationconfigurationruledestinationaccesscontroltranslation)

[Owner](#owner_csharp) This property is required. string

Specifies the replica ownership. For default and valid values, see [PUT bucket replication](https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutBucketReplication.html) in the Amazon S3 API Reference. The only valid value is `Destination`.

[Owner](#owner_go) This property is required. string

Specifies the replica ownership. For default and valid values, see [PUT bucket replication](https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutBucketReplication.html) in the Amazon S3 API Reference. The only valid value is `Destination`.

[owner](#owner_hcl) This property is required. string

Specifies the replica ownership. For default and valid values, see [PUT bucket replication](https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutBucketReplication.html) in the Amazon S3 API Reference. The only valid value is `Destination`.

[owner](#owner_java) This property is required. String

Specifies the replica ownership. For default and valid values, see [PUT bucket replication](https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutBucketReplication.html) in the Amazon S3 API Reference. The only valid value is `Destination`.

[owner](#owner_nodejs) This property is required. string

Specifies the replica ownership. For default and valid values, see [PUT bucket replication](https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutBucketReplication.html) in the Amazon S3 API Reference. The only valid value is `Destination`.

[owner](#owner_python) This property is required. str

Specifies the replica ownership. For default and valid values, see [PUT bucket replication](https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutBucketReplication.html) in the Amazon S3 API Reference. The only valid value is `Destination`.

[owner](#owner_yaml) This property is required. String

Specifies the replica ownership. For default and valid values, see [PUT bucket replication](https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutBucketReplication.html) in the Amazon S3 API Reference. The only valid value is `Destination`.

#### BucketV2ReplicationConfigurationRuleDestinationMetric

, BucketV2ReplicationConfigurationRuleDestinationMetricArgs

[](#bucketv2replicationconfigurationruledestinationmetric)

[Minutes](#minutes_csharp) int

Threshold within which objects are to be replicated. The only valid value is `15`.

[Status](#status_csharp) string

Status of replication metrics. Either `Enabled` or `Disabled`.

[Minutes](#minutes_go) int

Threshold within which objects are to be replicated. The only valid value is `15`.

[Status](#status_go) string

Status of replication metrics. Either `Enabled` or `Disabled`.

[minutes](#minutes_hcl) number

Threshold within which objects are to be replicated. The only valid value is `15`.

[status](#status_hcl) string

Status of replication metrics. Either `Enabled` or `Disabled`.

[minutes](#minutes_java) Integer

Threshold within which objects are to be replicated. The only valid value is `15`.

[status](#status_java) String

Status of replication metrics. Either `Enabled` or `Disabled`.

[minutes](#minutes_nodejs) number

Threshold within which objects are to be replicated. The only valid value is `15`.

[status](#status_nodejs) string

Status of replication metrics. Either `Enabled` or `Disabled`.

[minutes](#minutes_python) int

Threshold within which objects are to be replicated. The only valid value is `15`.

[status](#status_python) str

Status of replication metrics. Either `Enabled` or `Disabled`.

[minutes](#minutes_yaml) Number

Threshold within which objects are to be replicated. The only valid value is `15`.

[status](#status_yaml) String

Status of replication metrics. Either `Enabled` or `Disabled`.

#### BucketV2ReplicationConfigurationRuleDestinationReplicationTime

, BucketV2ReplicationConfigurationRuleDestinationReplicationTimeArgs

[](#bucketv2replicationconfigurationruledestinationreplicationtime)

[Minutes](#minutes_csharp) int

Threshold within which objects are to be replicated. The only valid value is `15`.

[Status](#status_csharp) string

Status of RTC. Either `Enabled` or `Disabled`.

[Minutes](#minutes_go) int

Threshold within which objects are to be replicated. The only valid value is `15`.

[Status](#status_go) string

Status of RTC. Either `Enabled` or `Disabled`.

[minutes](#minutes_hcl) number

Threshold within which objects are to be replicated. The only valid value is `15`.

[status](#status_hcl) string

Status of RTC. Either `Enabled` or `Disabled`.

[minutes](#minutes_java) Integer

Threshold within which objects are to be replicated. The only valid value is `15`.

[status](#status_java) String

Status of RTC. Either `Enabled` or `Disabled`.

[minutes](#minutes_nodejs) number

Threshold within which objects are to be replicated. The only valid value is `15`.

[status](#status_nodejs) string

Status of RTC. Either `Enabled` or `Disabled`.

[minutes](#minutes_python) int

Threshold within which objects are to be replicated. The only valid value is `15`.

[status](#status_python) str

Status of RTC. Either `Enabled` or `Disabled`.

[minutes](#minutes_yaml) Number

Threshold within which objects are to be replicated. The only valid value is `15`.

[status](#status_yaml) String

Status of RTC. Either `Enabled` or `Disabled`.

#### BucketV2ReplicationConfigurationRuleFilter

, BucketV2ReplicationConfigurationRuleFilterArgs

[](#bucketv2replicationconfigurationrulefilter)

[Prefix](#prefix_csharp) string

Object keyname prefix that identifies subset of objects to which the rule applies. Must be less than or equal to 1024 characters in length.

[Tags](#tags_csharp) Dictionary<string, string>

A map of tags that identifies subset of objects to which the rule applies. The rule applies only to objects having all the tags in its tagset.

[Prefix](#prefix_go) string

Object keyname prefix that identifies subset of objects to which the rule applies. Must be less than or equal to 1024 characters in length.

[Tags](#tags_go) map\[string\]string

A map of tags that identifies subset of objects to which the rule applies. The rule applies only to objects having all the tags in its tagset.

[prefix](#prefix_hcl) string

Object keyname prefix that identifies subset of objects to which the rule applies. Must be less than or equal to 1024 characters in length.

[tags](#tags_hcl) map(string)

A map of tags that identifies subset of objects to which the rule applies. The rule applies only to objects having all the tags in its tagset.

[prefix](#prefix_java) String

Object keyname prefix that identifies subset of objects to which the rule applies. Must be less than or equal to 1024 characters in length.

[tags](#tags_java) Map<String,String>

A map of tags that identifies subset of objects to which the rule applies. The rule applies only to objects having all the tags in its tagset.

[prefix](#prefix_nodejs) string

Object keyname prefix that identifies subset of objects to which the rule applies. Must be less than or equal to 1024 characters in length.

[tags](#tags_nodejs) {\[key: string\]: string}

A map of tags that identifies subset of objects to which the rule applies. The rule applies only to objects having all the tags in its tagset.

[prefix](#prefix_python) str

Object keyname prefix that identifies subset of objects to which the rule applies. Must be less than or equal to 1024 characters in length.

[tags](#tags_python) Mapping\[str, str\]

A map of tags that identifies subset of objects to which the rule applies. The rule applies only to objects having all the tags in its tagset.

[prefix](#prefix_yaml) String

Object keyname prefix that identifies subset of objects to which the rule applies. Must be less than or equal to 1024 characters in length.

[tags](#tags_yaml) Map<String>

A map of tags that identifies subset of objects to which the rule applies. The rule applies only to objects having all the tags in its tagset.

#### BucketV2ReplicationConfigurationRuleSourceSelectionCriteria

, BucketV2ReplicationConfigurationRuleSourceSelectionCriteriaArgs

[](#bucketv2replicationconfigurationrulesourceselectioncriteria)

[SseKmsEncryptedObjects](#ssekmsencryptedobjects_csharp) [List<BucketV2ReplicationConfigurationRuleSourceSelectionCriteriaSseKmsEncryptedObject>](#bucketv2replicationconfigurationrulesourceselectioncriteriassekmsencryptedobject)

Match SSE-KMS encrypted objects (documented below). If specified, `replicaKmsKeyId` in `destination` must be specified as well.

[SseKmsEncryptedObjects](#ssekmsencryptedobjects_go) [\[\]BucketV2ReplicationConfigurationRuleSourceSelectionCriteriaSseKmsEncryptedObject](#bucketv2replicationconfigurationrulesourceselectioncriteriassekmsencryptedobject)

Match SSE-KMS encrypted objects (documented below). If specified, `replicaKmsKeyId` in `destination` must be specified as well.

[sse\_kms\_encrypted\_objects](#sse_kms_encrypted_objects_hcl) [list(object)](#bucketv2replicationconfigurationrulesourceselectioncriteriassekmsencryptedobject)

Match SSE-KMS encrypted objects (documented below). If specified, `replicaKmsKeyId` in `destination` must be specified as well.

[sseKmsEncryptedObjects](#ssekmsencryptedobjects_java) [List<BucketV2ReplicationConfigurationRuleSourceSelectionCriteriaSseKmsEncryptedObject>](#bucketv2replicationconfigurationrulesourceselectioncriteriassekmsencryptedobject)

Match SSE-KMS encrypted objects (documented below). If specified, `replicaKmsKeyId` in `destination` must be specified as well.

[sseKmsEncryptedObjects](#ssekmsencryptedobjects_nodejs) [BucketV2ReplicationConfigurationRuleSourceSelectionCriteriaSseKmsEncryptedObject\[\]](#bucketv2replicationconfigurationrulesourceselectioncriteriassekmsencryptedobject)

Match SSE-KMS encrypted objects (documented below). If specified, `replicaKmsKeyId` in `destination` must be specified as well.

[sse\_kms\_encrypted\_objects](#sse_kms_encrypted_objects_python) [Sequence\[BucketV2ReplicationConfigurationRuleSourceSelectionCriteriaSseKmsEncryptedObject\]](#bucketv2replicationconfigurationrulesourceselectioncriteriassekmsencryptedobject)

Match SSE-KMS encrypted objects (documented below). If specified, `replicaKmsKeyId` in `destination` must be specified as well.

[sseKmsEncryptedObjects](#ssekmsencryptedobjects_yaml) [List<Property Map>](#bucketv2replicationconfigurationrulesourceselectioncriteriassekmsencryptedobject)

Match SSE-KMS encrypted objects (documented below). If specified, `replicaKmsKeyId` in `destination` must be specified as well.

#### BucketV2ReplicationConfigurationRuleSourceSelectionCriteriaSseKmsEncryptedObject

, BucketV2ReplicationConfigurationRuleSourceSelectionCriteriaSseKmsEncryptedObjectArgs

[](#bucketv2replicationconfigurationrulesourceselectioncriteriassekmsencryptedobject)

[Enabled](#enabled_csharp) This property is required. bool

Boolean which indicates if this criteria is enabled.

[Enabled](#enabled_go) This property is required. bool

Boolean which indicates if this criteria is enabled.

[enabled](#enabled_hcl) This property is required. bool

Boolean which indicates if this criteria is enabled.

[enabled](#enabled_java) This property is required. Boolean

Boolean which indicates if this criteria is enabled.

[enabled](#enabled_nodejs) This property is required. boolean

Boolean which indicates if this criteria is enabled.

[enabled](#enabled_python) This property is required. bool

Boolean which indicates if this criteria is enabled.

[enabled](#enabled_yaml) This property is required. Boolean

Boolean which indicates if this criteria is enabled.

#### BucketV2ServerSideEncryptionConfiguration

, BucketV2ServerSideEncryptionConfigurationArgs

[](#bucketv2serversideencryptionconfiguration)

[Rules](#rules_csharp) This property is required. [List<BucketV2ServerSideEncryptionConfigurationRule>](#bucketv2serversideencryptionconfigurationrule)

Single object for server-side encryption by default configuration. (documented below)

[Rules](#rules_go) This property is required. [\[\]BucketV2ServerSideEncryptionConfigurationRule](#bucketv2serversideencryptionconfigurationrule)

Single object for server-side encryption by default configuration. (documented below)

[rules](#rules_hcl) This property is required. [list(object)](#bucketv2serversideencryptionconfigurationrule)

Single object for server-side encryption by default configuration. (documented below)

[rules](#rules_java) This property is required. [List<BucketV2ServerSideEncryptionConfigurationRule>](#bucketv2serversideencryptionconfigurationrule)

Single object for server-side encryption by default configuration. (documented below)

[rules](#rules_nodejs) This property is required. [BucketV2ServerSideEncryptionConfigurationRule\[\]](#bucketv2serversideencryptionconfigurationrule)

Single object for server-side encryption by default configuration. (documented below)

[rules](#rules_python) This property is required. [Sequence\[BucketV2ServerSideEncryptionConfigurationRule\]](#bucketv2serversideencryptionconfigurationrule)

Single object for server-side encryption by default configuration. (documented below)

[rules](#rules_yaml) This property is required. [List<Property Map>](#bucketv2serversideencryptionconfigurationrule)

Single object for server-side encryption by default configuration. (documented below)

#### BucketV2ServerSideEncryptionConfigurationRule

, BucketV2ServerSideEncryptionConfigurationRuleArgs

[](#bucketv2serversideencryptionconfigurationrule)

[ApplyServerSideEncryptionByDefaults](#applyserversideencryptionbydefaults_csharp) This property is required. [List<BucketV2ServerSideEncryptionConfigurationRuleApplyServerSideEncryptionByDefault>](#bucketv2serversideencryptionconfigurationruleapplyserversideencryptionbydefault)

Single object for setting server-side encryption by default. (documented below)

[BucketKeyEnabled](#bucketkeyenabled_csharp) bool

Whether or not to use [Amazon S3 Bucket Keys](https://docs.aws.amazon.com/AmazonS3/latest/dev/bucket-key.html) for SSE-KMS.

[ApplyServerSideEncryptionByDefaults](#applyserversideencryptionbydefaults_go) This property is required. [\[\]BucketV2ServerSideEncryptionConfigurationRuleApplyServerSideEncryptionByDefault](#bucketv2serversideencryptionconfigurationruleapplyserversideencryptionbydefault)

Single object for setting server-side encryption by default. (documented below)

[BucketKeyEnabled](#bucketkeyenabled_go) bool

Whether or not to use [Amazon S3 Bucket Keys](https://docs.aws.amazon.com/AmazonS3/latest/dev/bucket-key.html) for SSE-KMS.

[apply\_server\_side\_encryption\_by\_defaults](#apply_server_side_encryption_by_defaults_hcl) This property is required. [list(object)](#bucketv2serversideencryptionconfigurationruleapplyserversideencryptionbydefault)

Single object for setting server-side encryption by default. (documented below)

[bucket\_key\_enabled](#bucket_key_enabled_hcl) bool

Whether or not to use [Amazon S3 Bucket Keys](https://docs.aws.amazon.com/AmazonS3/latest/dev/bucket-key.html) for SSE-KMS.

[applyServerSideEncryptionByDefaults](#applyserversideencryptionbydefaults_java) This property is required. [List<BucketV2ServerSideEncryptionConfigurationRuleApplyServerSideEncryptionByDefault>](#bucketv2serversideencryptionconfigurationruleapplyserversideencryptionbydefault)

Single object for setting server-side encryption by default. (documented below)

[bucketKeyEnabled](#bucketkeyenabled_java) Boolean

Whether or not to use [Amazon S3 Bucket Keys](https://docs.aws.amazon.com/AmazonS3/latest/dev/bucket-key.html) for SSE-KMS.

[applyServerSideEncryptionByDefaults](#applyserversideencryptionbydefaults_nodejs) This property is required. [BucketV2ServerSideEncryptionConfigurationRuleApplyServerSideEncryptionByDefault\[\]](#bucketv2serversideencryptionconfigurationruleapplyserversideencryptionbydefault)

Single object for setting server-side encryption by default. (documented below)

[bucketKeyEnabled](#bucketkeyenabled_nodejs) boolean

Whether or not to use [Amazon S3 Bucket Keys](https://docs.aws.amazon.com/AmazonS3/latest/dev/bucket-key.html) for SSE-KMS.

[apply\_server\_side\_encryption\_by\_defaults](#apply_server_side_encryption_by_defaults_python) This property is required. [Sequence\[BucketV2ServerSideEncryptionConfigurationRuleApplyServerSideEncryptionByDefault\]](#bucketv2serversideencryptionconfigurationruleapplyserversideencryptionbydefault)

Single object for setting server-side encryption by default. (documented below)

[bucket\_key\_enabled](#bucket_key_enabled_python) bool

Whether or not to use [Amazon S3 Bucket Keys](https://docs.aws.amazon.com/AmazonS3/latest/dev/bucket-key.html) for SSE-KMS.

[applyServerSideEncryptionByDefaults](#applyserversideencryptionbydefaults_yaml) This property is required. [List<Property Map>](#bucketv2serversideencryptionconfigurationruleapplyserversideencryptionbydefault)

Single object for setting server-side encryption by default. (documented below)

[bucketKeyEnabled](#bucketkeyenabled_yaml) Boolean

Whether or not to use [Amazon S3 Bucket Keys](https://docs.aws.amazon.com/AmazonS3/latest/dev/bucket-key.html) for SSE-KMS.

#### BucketV2ServerSideEncryptionConfigurationRuleApplyServerSideEncryptionByDefault

, BucketV2ServerSideEncryptionConfigurationRuleApplyServerSideEncryptionByDefaultArgs

[](#bucketv2serversideencryptionconfigurationruleapplyserversideencryptionbydefault)

[SseAlgorithm](#ssealgorithm_csharp) This property is required. string

Server-side encryption algorithm to use. Valid values are `AES256` and `aws:kms`

[KmsMasterKeyId](#kmsmasterkeyid_csharp) string

AWS KMS master key ID used for the SSE-KMS encryption. This can only be used when you set the value of `sseAlgorithm` as `aws:kms`. The default `aws/s3` AWS KMS master key is used if this element is absent while the `sseAlgorithm` is `aws:kms`.

[SseAlgorithm](#ssealgorithm_go) This property is required. string

Server-side encryption algorithm to use. Valid values are `AES256` and `aws:kms`

[KmsMasterKeyId](#kmsmasterkeyid_go) string

AWS KMS master key ID used for the SSE-KMS encryption. This can only be used when you set the value of `sseAlgorithm` as `aws:kms`. The default `aws/s3` AWS KMS master key is used if this element is absent while the `sseAlgorithm` is `aws:kms`.

[sse\_algorithm](#sse_algorithm_hcl) This property is required. string

Server-side encryption algorithm to use. Valid values are `AES256` and `aws:kms`

[kms\_master\_key\_id](#kms_master_key_id_hcl) string

AWS KMS master key ID used for the SSE-KMS encryption. This can only be used when you set the value of `sseAlgorithm` as `aws:kms`. The default `aws/s3` AWS KMS master key is used if this element is absent while the `sseAlgorithm` is `aws:kms`.

[sseAlgorithm](#ssealgorithm_java) This property is required. String

Server-side encryption algorithm to use. Valid values are `AES256` and `aws:kms`

[kmsMasterKeyId](#kmsmasterkeyid_java) String

AWS KMS master key ID used for the SSE-KMS encryption. This can only be used when you set the value of `sseAlgorithm` as `aws:kms`. The default `aws/s3` AWS KMS master key is used if this element is absent while the `sseAlgorithm` is `aws:kms`.

[sseAlgorithm](#ssealgorithm_nodejs) This property is required. string

Server-side encryption algorithm to use. Valid values are `AES256` and `aws:kms`

[kmsMasterKeyId](#kmsmasterkeyid_nodejs) string

AWS KMS master key ID used for the SSE-KMS encryption. This can only be used when you set the value of `sseAlgorithm` as `aws:kms`. The default `aws/s3` AWS KMS master key is used if this element is absent while the `sseAlgorithm` is `aws:kms`.

[sse\_algorithm](#sse_algorithm_python) This property is required. str

Server-side encryption algorithm to use. Valid values are `AES256` and `aws:kms`

[kms\_master\_key\_id](#kms_master_key_id_python) str

AWS KMS master key ID used for the SSE-KMS encryption. This can only be used when you set the value of `sseAlgorithm` as `aws:kms`. The default `aws/s3` AWS KMS master key is used if this element is absent while the `sseAlgorithm` is `aws:kms`.

[sseAlgorithm](#ssealgorithm_yaml) This property is required. String

Server-side encryption algorithm to use. Valid values are `AES256` and `aws:kms`

[kmsMasterKeyId](#kmsmasterkeyid_yaml) String

AWS KMS master key ID used for the SSE-KMS encryption. This can only be used when you set the value of `sseAlgorithm` as `aws:kms`. The default `aws/s3` AWS KMS master key is used if this element is absent while the `sseAlgorithm` is `aws:kms`.

#### BucketV2Versioning

, BucketV2VersioningArgs

[](#bucketv2versioning)

[Enabled](#enabled_csharp) bool

Enable versioning. Once you version-enable a bucket, it can never return to an unversioned state. You can, however, suspend versioning on that bucket.

[MfaDelete](#mfadelete_csharp) bool

Enable MFA delete for either `Change the versioning state of your bucket` or `Permanently delete an object version`. Default is `false`. This cannot be used to toggle this setting but is available to allow managed buckets to reflect the state in AWS

[Enabled](#enabled_go) bool

Enable versioning. Once you version-enable a bucket, it can never return to an unversioned state. You can, however, suspend versioning on that bucket.

[MfaDelete](#mfadelete_go) bool

Enable MFA delete for either `Change the versioning state of your bucket` or `Permanently delete an object version`. Default is `false`. This cannot be used to toggle this setting but is available to allow managed buckets to reflect the state in AWS

[enabled](#enabled_hcl) bool

Enable versioning. Once you version-enable a bucket, it can never return to an unversioned state. You can, however, suspend versioning on that bucket.

[mfa\_delete](#mfa_delete_hcl) bool

Enable MFA delete for either `Change the versioning state of your bucket` or `Permanently delete an object version`. Default is `false`. This cannot be used to toggle this setting but is available to allow managed buckets to reflect the state in AWS

[enabled](#enabled_java) Boolean

Enable versioning. Once you version-enable a bucket, it can never return to an unversioned state. You can, however, suspend versioning on that bucket.

[mfaDelete](#mfadelete_java) Boolean

Enable MFA delete for either `Change the versioning state of your bucket` or `Permanently delete an object version`. Default is `false`. This cannot be used to toggle this setting but is available to allow managed buckets to reflect the state in AWS

[enabled](#enabled_nodejs) boolean

Enable versioning. Once you version-enable a bucket, it can never return to an unversioned state. You can, however, suspend versioning on that bucket.

[mfaDelete](#mfadelete_nodejs) boolean

Enable MFA delete for either `Change the versioning state of your bucket` or `Permanently delete an object version`. Default is `false`. This cannot be used to toggle this setting but is available to allow managed buckets to reflect the state in AWS

[enabled](#enabled_python) bool

Enable versioning. Once you version-enable a bucket, it can never return to an unversioned state. You can, however, suspend versioning on that bucket.

[mfa\_delete](#mfa_delete_python) bool

Enable MFA delete for either `Change the versioning state of your bucket` or `Permanently delete an object version`. Default is `false`. This cannot be used to toggle this setting but is available to allow managed buckets to reflect the state in AWS

[enabled](#enabled_yaml) Boolean

Enable versioning. Once you version-enable a bucket, it can never return to an unversioned state. You can, however, suspend versioning on that bucket.

[mfaDelete](#mfadelete_yaml) Boolean

Enable MFA delete for either `Change the versioning state of your bucket` or `Permanently delete an object version`. Default is `false`. This cannot be used to toggle this setting but is available to allow managed buckets to reflect the state in AWS

#### BucketV2Website

, BucketV2WebsiteArgs

[](#bucketv2website)

[ErrorDocument](#errordocument_csharp) string

Absolute path to the document to return in case of a 4XX error.

[IndexDocument](#indexdocument_csharp) string

Amazon S3 returns this index document when requests are made to the root domain or any of the subfolders.

[RedirectAllRequestsTo](#redirectallrequeststo_csharp) string

Hostname to redirect all website requests for this bucket to. Hostname can optionally be prefixed with a protocol (`http://` or `https://`) to use when redirecting requests. The default is the protocol that is used in the original request.

[RoutingRules](#routingrules_csharp) string

JSON array containing [routing rules](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-websiteconfiguration-routingrules.html) describing redirect behavior and when redirects are applied.

[ErrorDocument](#errordocument_go) string

Absolute path to the document to return in case of a 4XX error.

[IndexDocument](#indexdocument_go) string

Amazon S3 returns this index document when requests are made to the root domain or any of the subfolders.

[RedirectAllRequestsTo](#redirectallrequeststo_go) string

Hostname to redirect all website requests for this bucket to. Hostname can optionally be prefixed with a protocol (`http://` or `https://`) to use when redirecting requests. The default is the protocol that is used in the original request.

[RoutingRules](#routingrules_go) string

JSON array containing [routing rules](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-websiteconfiguration-routingrules.html) describing redirect behavior and when redirects are applied.

[error\_document](#error_document_hcl) string

Absolute path to the document to return in case of a 4XX error.

[index\_document](#index_document_hcl) string

Amazon S3 returns this index document when requests are made to the root domain or any of the subfolders.

[redirect\_all\_requests\_to](#redirect_all_requests_to_hcl) string

Hostname to redirect all website requests for this bucket to. Hostname can optionally be prefixed with a protocol (`http://` or `https://`) to use when redirecting requests. The default is the protocol that is used in the original request.

[routing\_rules](#routing_rules_hcl) string

JSON array containing [routing rules](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-websiteconfiguration-routingrules.html) describing redirect behavior and when redirects are applied.

[errorDocument](#errordocument_java) String

Absolute path to the document to return in case of a 4XX error.

[indexDocument](#indexdocument_java) String

Amazon S3 returns this index document when requests are made to the root domain or any of the subfolders.

[redirectAllRequestsTo](#redirectallrequeststo_java) String

Hostname to redirect all website requests for this bucket to. Hostname can optionally be prefixed with a protocol (`http://` or `https://`) to use when redirecting requests. The default is the protocol that is used in the original request.

[routingRules](#routingrules_java) String

JSON array containing [routing rules](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-websiteconfiguration-routingrules.html) describing redirect behavior and when redirects are applied.

[errorDocument](#errordocument_nodejs) string

Absolute path to the document to return in case of a 4XX error.

[indexDocument](#indexdocument_nodejs) string

Amazon S3 returns this index document when requests are made to the root domain or any of the subfolders.

[redirectAllRequestsTo](#redirectallrequeststo_nodejs) string

Hostname to redirect all website requests for this bucket to. Hostname can optionally be prefixed with a protocol (`http://` or `https://`) to use when redirecting requests. The default is the protocol that is used in the original request.

[routingRules](#routingrules_nodejs) string

JSON array containing [routing rules](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-websiteconfiguration-routingrules.html) describing redirect behavior and when redirects are applied.

[error\_document](#error_document_python) str

Absolute path to the document to return in case of a 4XX error.

[index\_document](#index_document_python) str

Amazon S3 returns this index document when requests are made to the root domain or any of the subfolders.

[redirect\_all\_requests\_to](#redirect_all_requests_to_python) str

Hostname to redirect all website requests for this bucket to. Hostname can optionally be prefixed with a protocol (`http://` or `https://`) to use when redirecting requests. The default is the protocol that is used in the original request.

[routing\_rules](#routing_rules_python) str

JSON array containing [routing rules](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-websiteconfiguration-routingrules.html) describing redirect behavior and when redirects are applied.

[errorDocument](#errordocument_yaml) String

Absolute path to the document to return in case of a 4XX error.

[indexDocument](#indexdocument_yaml) String

Amazon S3 returns this index document when requests are made to the root domain or any of the subfolders.

[redirectAllRequestsTo](#redirectallrequeststo_yaml) String

Hostname to redirect all website requests for this bucket to. Hostname can optionally be prefixed with a protocol (`http://` or `https://`) to use when redirecting requests. The default is the protocol that is used in the original request.

[routingRules](#routingrules_yaml) String

JSON array containing [routing rules](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-websiteconfiguration-routingrules.html) describing redirect behavior and when redirects are applied.

## Import[](#import)

### Identity Schema[](#identity-schema)

#### Required[](#required)

-   `bucket` (String) Name of the S3 bucket.

#### Optional[](#optional)

-   `accountId` (String) AWS Account where this resource is managed.
-   `region` (String) Region where this resource is managed.

Using `pulumi import`, import S3 bucket using the `bucket`. For example:

```bash
$ pulumi import aws:s3/bucketV2:BucketV2 example bucket-name
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

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2fs3%2fbucketv2]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2fs3%2fbucketv2%2f\))

#### Try Pulumi Cloud free.
Your team will thank you.

[Start free trial](https://app.pulumi.com/signup?utm_source=registry&utm_medium=right-rail-banner&utm_campaign=try-pulumi-cloud&iaid=docs-try-pulumi-cloud-ad)
