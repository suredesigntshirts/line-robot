---
Source: https://www.pulumi.com/registry/packages/aws/api-docs/s3/bucketversioningv2/
Generated: 2026-06-06
Updated: 2026-06-06
---

# aws.s3.BucketVersioningV2

1.  [Packages](/registry/)
2.  [Packages](/registry/packages/)
3.  [AWS](/registry/packages/aws/)
4.  [API Docs](/registry/packages/aws/api-docs/)
5.  [s3](/registry/packages/aws/api-docs/s3/)
6.  [BucketVersioningV2](/registry/packages/aws/api-docs/s3/bucketversioningv2/)

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

![aws logo](/fingerprinted/logos/pkg/aws.fce8c215ba19dc236e028b12d76cf9166615faf0f8a35292da577d32a277d7e5.svg)

AWS v7.32.0, May 29 26

Viewing docs for AWS v7.32.0
published on Friday, May 29, 2026 by Pulumi

[Schema (JSON)](/registry/packages/aws/schema.json)

[pulumi/pulumi-aws](https://github.com/pulumi/pulumi-aws)

v7.32.0 (7.x, latest)v6.83.1 (6.x)v5.43.0 (5.x)

# aws.s3.BucketVersioningV2[](#aws-s3-bucketversioningv2)

Explore with Neo

-   Copy Page

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2fs3%2fbucketversioningv2]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2fs3%2fbucketversioningv2%2f\))

Deprecated: aws.s3/bucketversioningv2.BucketVersioningV2 has been deprecated in favor of aws.s3/bucketversioning.BucketVersioning

Provides a resource for controlling versioning on an S3 bucket. Deleting this resource will either suspend versioning on the associated S3 bucket or simply remove the resource from state if the associated S3 bucket is unversioned.

For more information, see [How S3 versioning works](https://docs.aws.amazon.com/AmazonS3/latest/userguide/manage-versioning-examples.html).

> **NOTE:** If you are enabling versioning on the bucket for the first time, AWS recommends that you wait for 15 minutes after enabling versioning before issuing write operations (PUT or DELETE) on objects in the bucket.

> This resource cannot be used with S3 directory buckets.

## Example Usage[](#example-usage)

### With Versioning Enabled[](#with-versioning-enabled)

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

const example = new aws.s3.Bucket("example", {bucket: "example-bucket"});
const exampleBucketAcl = new aws.s3.BucketAcl("example", {
    bucket: example.id,
    acl: "private",
});
const versioningExample = new aws.s3.BucketVersioning("versioning_example", {
    bucket: example.id,
    versioningConfiguration: {
        status: "Enabled",
    },
});
```

```python
import pulumi
import pulumi_aws as aws

example = aws.s3.Bucket("example", bucket="example-bucket")
example_bucket_acl = aws.s3.BucketAcl("example",
    bucket=example.id,
    acl="private")
versioning_example = aws.s3.BucketVersioning("versioning_example",
    bucket=example.id,
    versioning_configuration={
        "status": "Enabled",
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
		example, err := s3.NewBucket(ctx, "example", &s3.BucketArgs{
			Bucket: pulumi.String("example-bucket"),
		})
		if err != nil {
			return err
		}
		_, err = s3.NewBucketAcl(ctx, "example", &s3.BucketAclArgs{
			Bucket: example.ID(),
			Acl:    pulumi.String("private"),
		})
		if err != nil {
			return err
		}
		_, err = s3.NewBucketVersioning(ctx, "versioning_example", &s3.BucketVersioningArgs{
			Bucket: example.ID(),
			VersioningConfiguration: &s3.BucketVersioningVersioningConfigurationArgs{
				Status: pulumi.String("Enabled"),
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
        BucketName = "example-bucket",
    });

    var exampleBucketAcl = new Aws.S3.BucketAcl("example", new()
    {
        Bucket = example.Id,
        Acl = "private",
    });

    var versioningExample = new Aws.S3.BucketVersioning("versioning_example", new()
    {
        Bucket = example.Id,
        VersioningConfiguration = new Aws.S3.Inputs.BucketVersioningVersioningConfigurationArgs
        {
            Status = "Enabled",
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
import com.pulumi.aws.s3.BucketAcl;
import com.pulumi.aws.s3.BucketAclArgs;
import com.pulumi.aws.s3.BucketVersioning;
import com.pulumi.aws.s3.BucketVersioningArgs;
import com.pulumi.aws.s3.inputs.BucketVersioningVersioningConfigurationArgs;
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
            .bucket("example-bucket")
            .build());

        var exampleBucketAcl = new BucketAcl("exampleBucketAcl", BucketAclArgs.builder()
            .bucket(example.id())
            .acl("private")
            .build());

        var versioningExample = new BucketVersioning("versioningExample", BucketVersioningArgs.builder()
            .bucket(example.id())
            .versioningConfiguration(BucketVersioningVersioningConfigurationArgs.builder()
                .status("Enabled")
                .build())
            .build());

    }
}
```

```yaml
resources:
  example:
    type: aws:s3:Bucket
    properties:
      bucket: example-bucket
  exampleBucketAcl:
    type: aws:s3:BucketAcl
    name: example
    properties:
      bucket: ${example.id}
      acl: private
  versioningExample:
    type: aws:s3:BucketVersioning
    name: versioning_example
    properties:
      bucket: ${example.id}
      versioningConfiguration:
        status: Enabled
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
  bucket = "example-bucket"
}
resource "aws_s3_bucketacl" "example" {
  bucket = aws_s3_bucket.example.id
  acl    = "private"
}
resource "aws_s3_bucketversioning" "versioning_example" {
  bucket = aws_s3_bucket.example.id
  versioning_configuration = {
    status = "Enabled"
  }
}
```

### With Versioning Disabled[](#with-versioning-disabled)

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

const example = new aws.s3.Bucket("example", {bucket: "example-bucket"});
const exampleBucketAcl = new aws.s3.BucketAcl("example", {
    bucket: example.id,
    acl: "private",
});
const versioningExample = new aws.s3.BucketVersioning("versioning_example", {
    bucket: example.id,
    versioningConfiguration: {
        status: "Disabled",
    },
});
```

```python
import pulumi
import pulumi_aws as aws

example = aws.s3.Bucket("example", bucket="example-bucket")
example_bucket_acl = aws.s3.BucketAcl("example",
    bucket=example.id,
    acl="private")
versioning_example = aws.s3.BucketVersioning("versioning_example",
    bucket=example.id,
    versioning_configuration={
        "status": "Disabled",
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
		example, err := s3.NewBucket(ctx, "example", &s3.BucketArgs{
			Bucket: pulumi.String("example-bucket"),
		})
		if err != nil {
			return err
		}
		_, err = s3.NewBucketAcl(ctx, "example", &s3.BucketAclArgs{
			Bucket: example.ID(),
			Acl:    pulumi.String("private"),
		})
		if err != nil {
			return err
		}
		_, err = s3.NewBucketVersioning(ctx, "versioning_example", &s3.BucketVersioningArgs{
			Bucket: example.ID(),
			VersioningConfiguration: &s3.BucketVersioningVersioningConfigurationArgs{
				Status: pulumi.String("Disabled"),
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
        BucketName = "example-bucket",
    });

    var exampleBucketAcl = new Aws.S3.BucketAcl("example", new()
    {
        Bucket = example.Id,
        Acl = "private",
    });

    var versioningExample = new Aws.S3.BucketVersioning("versioning_example", new()
    {
        Bucket = example.Id,
        VersioningConfiguration = new Aws.S3.Inputs.BucketVersioningVersioningConfigurationArgs
        {
            Status = "Disabled",
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
import com.pulumi.aws.s3.BucketAcl;
import com.pulumi.aws.s3.BucketAclArgs;
import com.pulumi.aws.s3.BucketVersioning;
import com.pulumi.aws.s3.BucketVersioningArgs;
import com.pulumi.aws.s3.inputs.BucketVersioningVersioningConfigurationArgs;
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
            .bucket("example-bucket")
            .build());

        var exampleBucketAcl = new BucketAcl("exampleBucketAcl", BucketAclArgs.builder()
            .bucket(example.id())
            .acl("private")
            .build());

        var versioningExample = new BucketVersioning("versioningExample", BucketVersioningArgs.builder()
            .bucket(example.id())
            .versioningConfiguration(BucketVersioningVersioningConfigurationArgs.builder()
                .status("Disabled")
                .build())
            .build());

    }
}
```

```yaml
resources:
  example:
    type: aws:s3:Bucket
    properties:
      bucket: example-bucket
  exampleBucketAcl:
    type: aws:s3:BucketAcl
    name: example
    properties:
      bucket: ${example.id}
      acl: private
  versioningExample:
    type: aws:s3:BucketVersioning
    name: versioning_example
    properties:
      bucket: ${example.id}
      versioningConfiguration:
        status: Disabled
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
  bucket = "example-bucket"
}
resource "aws_s3_bucketacl" "example" {
  bucket = aws_s3_bucket.example.id
  acl    = "private"
}
resource "aws_s3_bucketversioning" "versioning_example" {
  bucket = aws_s3_bucket.example.id
  versioning_configuration = {
    status = "Disabled"
  }
}
```

### Object Dependency On Versioning[](#object-dependency-on-versioning)

When you create an object whose `versionId` you need and an `aws.s3.BucketVersioning` resource in the same configuration, you are more likely to have success by ensuring the `s3Object` depends either implicitly (see below) or explicitly (i.e., using `dependsOn = [aws_s3_bucket_versioning.example]`) on the `aws.s3.BucketVersioning` resource.

> **NOTE:** For critical and/or production S3 objects, do not create a bucket, enable versioning, and create an object in the bucket within the same configuration. Doing so will not allow the AWS-recommended 15 minutes between enabling versioning and writing to the bucket.

This example shows the `aws_s3_object.example` depending implicitly on the versioning resource through the reference to `aws_s3_bucket_versioning.example.bucket` to define `bucket`:

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

const example = new aws.s3.Bucket("example", {bucket: "yotto"});
const exampleBucketVersioning = new aws.s3.BucketVersioning("example", {
    bucket: example.id,
    versioningConfiguration: {
        status: "Enabled",
    },
});
const exampleBucketObjectv2 = new aws.s3.BucketObjectv2("example", {
    bucket: exampleBucketVersioning.id,
    key: "droeloe",
    source: new pulumi.asset.FileAsset("example.txt"),
});
```

```python
import pulumi
import pulumi_aws as aws

example = aws.s3.Bucket("example", bucket="yotto")
example_bucket_versioning = aws.s3.BucketVersioning("example",
    bucket=example.id,
    versioning_configuration={
        "status": "Enabled",
    })
example_bucket_objectv2 = aws.s3.BucketObjectv2("example",
    bucket=example_bucket_versioning.id,
    key="droeloe",
    source=pulumi.FileAsset("example.txt"))
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
			Bucket: pulumi.String("yotto"),
		})
		if err != nil {
			return err
		}
		exampleBucketVersioning, err := s3.NewBucketVersioning(ctx, "example", &s3.BucketVersioningArgs{
			Bucket: example.ID(),
			VersioningConfiguration: &s3.BucketVersioningVersioningConfigurationArgs{
				Status: pulumi.String("Enabled"),
			},
		})
		if err != nil {
			return err
		}
		_, err = s3.NewBucketObjectv2(ctx, "example", &s3.BucketObjectv2Args{
			Bucket: exampleBucketVersioning.ID(),
			Key:    pulumi.String("droeloe"),
			Source: pulumi.NewFileAsset("example.txt"),
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
        BucketName = "yotto",
    });

    var exampleBucketVersioning = new Aws.S3.BucketVersioning("example", new()
    {
        Bucket = example.Id,
        VersioningConfiguration = new Aws.S3.Inputs.BucketVersioningVersioningConfigurationArgs
        {
            Status = "Enabled",
        },
    });

    var exampleBucketObjectv2 = new Aws.S3.BucketObjectv2("example", new()
    {
        Bucket = exampleBucketVersioning.Id,
        Key = "droeloe",
        Source = new FileAsset("example.txt"),
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
import com.pulumi.aws.s3.BucketVersioning;
import com.pulumi.aws.s3.BucketVersioningArgs;
import com.pulumi.aws.s3.inputs.BucketVersioningVersioningConfigurationArgs;
import com.pulumi.aws.s3.BucketObjectv2;
import com.pulumi.aws.s3.BucketObjectv2Args;
import com.pulumi.asset.FileAsset;
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
            .bucket("yotto")
            .build());

        var exampleBucketVersioning = new BucketVersioning("exampleBucketVersioning", BucketVersioningArgs.builder()
            .bucket(example.id())
            .versioningConfiguration(BucketVersioningVersioningConfigurationArgs.builder()
                .status("Enabled")
                .build())
            .build());

        var exampleBucketObjectv2 = new BucketObjectv2("exampleBucketObjectv2", BucketObjectv2Args.builder()
            .bucket(exampleBucketVersioning.id())
            .key("droeloe")
            .source(new FileAsset("example.txt"))
            .build());

    }
}
```

```yaml
resources:
  example:
    type: aws:s3:Bucket
    properties:
      bucket: yotto
  exampleBucketVersioning:
    type: aws:s3:BucketVersioning
    name: example
    properties:
      bucket: ${example.id}
      versioningConfiguration:
        status: Enabled
  exampleBucketObjectv2:
    type: aws:s3:BucketObjectv2
    name: example
    properties:
      bucket: ${exampleBucketVersioning.id}
      key: droeloe
      source:
        fn::fileAsset: example.txt
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
  bucket = "yotto"
}
resource "aws_s3_bucketversioning" "example" {
  bucket = aws_s3_bucket.example.id
  versioning_configuration = {
    status = "Enabled"
  }
}
resource "aws_s3_bucketobjectv2" "example" {
  bucket = aws_s3_bucketversioning.example.id
  key    = "droeloe"
  source = fileAsset("example.txt")
}
```

## Create BucketVersioningV2 Resource[](#create)

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
new BucketVersioningV2(name: string, args: BucketVersioningV2Args, opts?: CustomResourceOptions);
```

```python
@overload
def BucketVersioningV2(resource_name: str,
                       args: BucketVersioningV2Args,
                       opts: Optional[ResourceOptions] = None)

@overload
def BucketVersioningV2(resource_name: str,
                       opts: Optional[ResourceOptions] = None,
                       bucket: Optional[str] = None,
                       expected_bucket_owner: Optional[str] = None,
                       mfa: Optional[str] = None,
                       region: Optional[str] = None,
                       versioning_configuration: Optional[BucketVersioningV2VersioningConfigurationArgs] = None)
```

```go
func NewBucketVersioningV2(ctx *Context, name string, args BucketVersioningV2Args, opts ...ResourceOption) (*BucketVersioningV2, error)
```

```csharp
public BucketVersioningV2(string name, BucketVersioningV2Args args, CustomResourceOptions? opts = null)
```

```java
public BucketVersioningV2(String name, BucketVersioningV2Args args)
public BucketVersioningV2(String name, BucketVersioningV2Args args, CustomResourceOptions options)
```

```yaml
type: aws:s3:BucketVersioningV2
properties: # The arguments to resource properties.
options: # Bag of options to control resource's behavior.
```

```hcl
resource "aws_s3_bucketversioningv2" "name" {
    # resource properties
}
```

#### Parameters[](#parameters)

name This property is required. string

The unique name of the resource.

args This property is required. [BucketVersioningV2Args](#inputs)

The arguments to resource properties.

opts [CustomResourceOptions](/docs/reference/pkg/nodejs/pulumi/pulumi/#CustomResourceOptions)

Bag of options to control resource's behavior.

resource\_name This property is required. str

The unique name of the resource.

args This property is required. [BucketVersioningV2Args](#inputs)

The arguments to resource properties.

opts [ResourceOptions](/docs/reference/pkg/python/pulumi/#pulumi.ResourceOptions)

Bag of options to control resource's behavior.

ctx [Context](https://pkg.go.dev/github.com/pulumi/pulumi/sdk/v3/go/pulumi?tab=doc#Context)

Context object for the current deployment.

name This property is required. string

The unique name of the resource.

args This property is required. [BucketVersioningV2Args](#inputs)

The arguments to resource properties.

opts [ResourceOption](https://pkg.go.dev/github.com/pulumi/pulumi/sdk/v3/go/pulumi?tab=doc#ResourceOption)

Bag of options to control resource's behavior.

name This property is required. string

The unique name of the resource.

args This property is required. [BucketVersioningV2Args](#inputs)

The arguments to resource properties.

opts [CustomResourceOptions](/docs/reference/pkg/dotnet/Pulumi/Pulumi.CustomResourceOptions.html)

Bag of options to control resource's behavior.

name This property is required. String

The unique name of the resource.

args This property is required. [BucketVersioningV2Args](#inputs)

The arguments to resource properties.

options CustomResourceOptions

Bag of options to control resource's behavior.

## BucketVersioningV2 Resource Properties[](#properties)

To learn more about resource properties and how to use them, see [Inputs and Outputs](/docs/intro/concepts/inputs-outputs) in the Architecture and Concepts docs.

### Inputs[](#inputs)

In Python, inputs that are objects can be passed either as [argument classes or as dictionary literals](/docs/languages-sdks/python/#inputs-and-outputs).

The BucketVersioningV2 resource accepts the following [input](/docs/intro/concepts/inputs-outputs) properties:

[Bucket](#bucket_csharp)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

Name of the S3 bucket.

[VersioningConfiguration](#versioningconfiguration_csharp) This property is required. [BucketVersioningV2VersioningConfiguration](#bucketversioningv2versioningconfiguration)

Configuration block for the versioning parameters. See below.

[ExpectedBucketOwner](#expectedbucketowner_csharp) string

Account ID of the expected bucket owner.

Deprecated: expected\_bucket\_owner is deprecated. It will be removed in a future verion of the provider.

[Mfa](#mfa_csharp) string

Concatenation of the authentication device's serial number, a space, and the value that is displayed on your authentication device.

[Region](#region_csharp) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[Bucket](#bucket_go)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

Name of the S3 bucket.

[VersioningConfiguration](#versioningconfiguration_go) This property is required. [BucketVersioningV2VersioningConfigurationArgs](#bucketversioningv2versioningconfiguration)

Configuration block for the versioning parameters. See below.

[ExpectedBucketOwner](#expectedbucketowner_go) string

Account ID of the expected bucket owner.

Deprecated: expected\_bucket\_owner is deprecated. It will be removed in a future verion of the provider.

[Mfa](#mfa_go) string

Concatenation of the authentication device's serial number, a space, and the value that is displayed on your authentication device.

[Region](#region_go) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[bucket](#bucket_hcl)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

Name of the S3 bucket.

[versioning\_configuration](#versioning_configuration_hcl) This property is required. [object](#bucketversioningv2versioningconfiguration)

Configuration block for the versioning parameters. See below.

[expected\_bucket\_owner](#expected_bucket_owner_hcl) string

Account ID of the expected bucket owner.

Deprecated: expected\_bucket\_owner is deprecated. It will be removed in a future verion of the provider.

[mfa](#mfa_hcl) string

Concatenation of the authentication device's serial number, a space, and the value that is displayed on your authentication device.

[region](#region_hcl) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[bucket](#bucket_java)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

String

Name of the S3 bucket.

[versioningConfiguration](#versioningconfiguration_java) This property is required. [BucketVersioningV2VersioningConfiguration](#bucketversioningv2versioningconfiguration)

Configuration block for the versioning parameters. See below.

[expectedBucketOwner](#expectedbucketowner_java) String

Account ID of the expected bucket owner.

Deprecated: expected\_bucket\_owner is deprecated. It will be removed in a future verion of the provider.

[mfa](#mfa_java) String

Concatenation of the authentication device's serial number, a space, and the value that is displayed on your authentication device.

[region](#region_java) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[bucket](#bucket_nodejs)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

string

Name of the S3 bucket.

[versioningConfiguration](#versioningconfiguration_nodejs) This property is required. [BucketVersioningV2VersioningConfiguration](#bucketversioningv2versioningconfiguration)

Configuration block for the versioning parameters. See below.

[expectedBucketOwner](#expectedbucketowner_nodejs) string

Account ID of the expected bucket owner.

Deprecated: expected\_bucket\_owner is deprecated. It will be removed in a future verion of the provider.

[mfa](#mfa_nodejs) string

Concatenation of the authentication device's serial number, a space, and the value that is displayed on your authentication device.

[region](#region_nodejs) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[bucket](#bucket_python)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

str

Name of the S3 bucket.

[versioning\_configuration](#versioning_configuration_python) This property is required. [BucketVersioningV2VersioningConfigurationArgs](#bucketversioningv2versioningconfiguration)

Configuration block for the versioning parameters. See below.

[expected\_bucket\_owner](#expected_bucket_owner_python) str

Account ID of the expected bucket owner.

Deprecated: expected\_bucket\_owner is deprecated. It will be removed in a future verion of the provider.

[mfa](#mfa_python) str

Concatenation of the authentication device's serial number, a space, and the value that is displayed on your authentication device.

[region](#region_python) str

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[bucket](#bucket_yaml)

This property is required.

 ![](/icons/replacement-property.svg)Changes to this property will trigger replacement.

String

Name of the S3 bucket.

[versioningConfiguration](#versioningconfiguration_yaml) This property is required. [Property Map](#bucketversioningv2versioningconfiguration)

Configuration block for the versioning parameters. See below.

[expectedBucketOwner](#expectedbucketowner_yaml) String

Account ID of the expected bucket owner.

Deprecated: expected\_bucket\_owner is deprecated. It will be removed in a future verion of the provider.

[mfa](#mfa_yaml) String

Concatenation of the authentication device's serial number, a space, and the value that is displayed on your authentication device.

[region](#region_yaml) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

### Outputs[](#outputs)

All [input](#inputs) properties are implicitly available as output properties. Additionally, the BucketVersioningV2 resource produces the following output properties:

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

## Look up Existing BucketVersioningV2 Resource[](#look-up)

Get an existing BucketVersioningV2 resource’s state with the given name, ID, and optional extra properties used to qualify the lookup.

-   TypeScript
-   Python
-   Go
-   C#
-   Java
-   YAML
-   HCL PREVIEW

```typescript
public static get(name: string, id: Input<ID>, state?: BucketVersioningV2State, opts?: CustomResourceOptions): BucketVersioningV2
```

```python
@staticmethod
def get(resource_name: str,
        id: str,
        opts: Optional[ResourceOptions] = None,
        bucket: Optional[str] = None,
        expected_bucket_owner: Optional[str] = None,
        mfa: Optional[str] = None,
        region: Optional[str] = None,
        versioning_configuration: Optional[BucketVersioningV2VersioningConfigurationArgs] = None) -> BucketVersioningV2
```

```go
func GetBucketVersioningV2(ctx *Context, name string, id IDInput, state *BucketVersioningV2State, opts ...ResourceOption) (*BucketVersioningV2, error)
```

```csharp
public static BucketVersioningV2 Get(string name, Input<string> id, BucketVersioningV2State? state, CustomResourceOptions? opts = null)
```

```java
public static BucketVersioningV2 get(String name, Output<String> id, BucketVersioningV2State state, CustomResourceOptions options)
```

```yaml
resources:  _:    type: aws:s3:BucketVersioningV2    get:      id: ${id}
```

```hcl
import {
  to = aws_s3_bucketversioningv2.example
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

Name of the S3 bucket.

[ExpectedBucketOwner](#state_expectedbucketowner_csharp) string

Account ID of the expected bucket owner.

Deprecated: expected\_bucket\_owner is deprecated. It will be removed in a future verion of the provider.

[Mfa](#state_mfa_csharp) string

Concatenation of the authentication device's serial number, a space, and the value that is displayed on your authentication device.

[Region](#state_region_csharp) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[VersioningConfiguration](#state_versioningconfiguration_csharp) [BucketVersioningV2VersioningConfiguration](#bucketversioningv2versioningconfiguration)

Configuration block for the versioning parameters. See below.

[Bucket](#state_bucket_go)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Name of the S3 bucket.

[ExpectedBucketOwner](#state_expectedbucketowner_go) string

Account ID of the expected bucket owner.

Deprecated: expected\_bucket\_owner is deprecated. It will be removed in a future verion of the provider.

[Mfa](#state_mfa_go) string

Concatenation of the authentication device's serial number, a space, and the value that is displayed on your authentication device.

[Region](#state_region_go) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[VersioningConfiguration](#state_versioningconfiguration_go) [BucketVersioningV2VersioningConfigurationArgs](#bucketversioningv2versioningconfiguration)

Configuration block for the versioning parameters. See below.

[bucket](#state_bucket_hcl)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Name of the S3 bucket.

[expected\_bucket\_owner](#state_expected_bucket_owner_hcl) string

Account ID of the expected bucket owner.

Deprecated: expected\_bucket\_owner is deprecated. It will be removed in a future verion of the provider.

[mfa](#state_mfa_hcl) string

Concatenation of the authentication device's serial number, a space, and the value that is displayed on your authentication device.

[region](#state_region_hcl) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[versioning\_configuration](#state_versioning_configuration_hcl) [object](#bucketversioningv2versioningconfiguration)

Configuration block for the versioning parameters. See below.

[bucket](#state_bucket_java)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Name of the S3 bucket.

[expectedBucketOwner](#state_expectedbucketowner_java) String

Account ID of the expected bucket owner.

Deprecated: expected\_bucket\_owner is deprecated. It will be removed in a future verion of the provider.

[mfa](#state_mfa_java) String

Concatenation of the authentication device's serial number, a space, and the value that is displayed on your authentication device.

[region](#state_region_java) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[versioningConfiguration](#state_versioningconfiguration_java) [BucketVersioningV2VersioningConfiguration](#bucketversioningv2versioningconfiguration)

Configuration block for the versioning parameters. See below.

[bucket](#state_bucket_nodejs)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. string

Name of the S3 bucket.

[expectedBucketOwner](#state_expectedbucketowner_nodejs) string

Account ID of the expected bucket owner.

Deprecated: expected\_bucket\_owner is deprecated. It will be removed in a future verion of the provider.

[mfa](#state_mfa_nodejs) string

Concatenation of the authentication device's serial number, a space, and the value that is displayed on your authentication device.

[region](#state_region_nodejs) string

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[versioningConfiguration](#state_versioningconfiguration_nodejs) [BucketVersioningV2VersioningConfiguration](#bucketversioningv2versioningconfiguration)

Configuration block for the versioning parameters. See below.

[bucket](#state_bucket_python)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. str

Name of the S3 bucket.

[expected\_bucket\_owner](#state_expected_bucket_owner_python) str

Account ID of the expected bucket owner.

Deprecated: expected\_bucket\_owner is deprecated. It will be removed in a future verion of the provider.

[mfa](#state_mfa_python) str

Concatenation of the authentication device's serial number, a space, and the value that is displayed on your authentication device.

[region](#state_region_python) str

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[versioning\_configuration](#state_versioning_configuration_python) [BucketVersioningV2VersioningConfigurationArgs](#bucketversioningv2versioningconfiguration)

Configuration block for the versioning parameters. See below.

[bucket](#state_bucket_yaml)  ![](/icons/replacement-property.svg)Changes to this property will trigger replacement. String

Name of the S3 bucket.

[expectedBucketOwner](#state_expectedbucketowner_yaml) String

Account ID of the expected bucket owner.

Deprecated: expected\_bucket\_owner is deprecated. It will be removed in a future verion of the provider.

[mfa](#state_mfa_yaml) String

Concatenation of the authentication device's serial number, a space, and the value that is displayed on your authentication device.

[region](#state_region_yaml) String

Region where this resource will be [managed](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). Defaults to the Region set in the provider configuration.

[versioningConfiguration](#state_versioningconfiguration_yaml) [Property Map](#bucketversioningv2versioningconfiguration)

Configuration block for the versioning parameters. See below.

## Supporting Types[](#supporting-types)

#### BucketVersioningV2VersioningConfiguration

, BucketVersioningV2VersioningConfigurationArgs

[](#bucketversioningv2versioningconfiguration)

[Status](#status_csharp) This property is required. string

Versioning state of the bucket. Valid values: `Enabled`, `Suspended`, or `Disabled`. `Disabled` should only be used when creating or importing resources that correspond to unversioned S3 buckets.

[MfaDelete](#mfadelete_csharp) string

Specifies whether MFA delete is enabled in the bucket versioning configuration. Valid values: `Enabled` or `Disabled`.

[Status](#status_go) This property is required. string

Versioning state of the bucket. Valid values: `Enabled`, `Suspended`, or `Disabled`. `Disabled` should only be used when creating or importing resources that correspond to unversioned S3 buckets.

[MfaDelete](#mfadelete_go) string

Specifies whether MFA delete is enabled in the bucket versioning configuration. Valid values: `Enabled` or `Disabled`.

[status](#status_hcl) This property is required. string

Versioning state of the bucket. Valid values: `Enabled`, `Suspended`, or `Disabled`. `Disabled` should only be used when creating or importing resources that correspond to unversioned S3 buckets.

[mfa\_delete](#mfa_delete_hcl) string

Specifies whether MFA delete is enabled in the bucket versioning configuration. Valid values: `Enabled` or `Disabled`.

[status](#status_java) This property is required. String

Versioning state of the bucket. Valid values: `Enabled`, `Suspended`, or `Disabled`. `Disabled` should only be used when creating or importing resources that correspond to unversioned S3 buckets.

[mfaDelete](#mfadelete_java) String

Specifies whether MFA delete is enabled in the bucket versioning configuration. Valid values: `Enabled` or `Disabled`.

[status](#status_nodejs) This property is required. string

Versioning state of the bucket. Valid values: `Enabled`, `Suspended`, or `Disabled`. `Disabled` should only be used when creating or importing resources that correspond to unversioned S3 buckets.

[mfaDelete](#mfadelete_nodejs) string

Specifies whether MFA delete is enabled in the bucket versioning configuration. Valid values: `Enabled` or `Disabled`.

[status](#status_python) This property is required. str

Versioning state of the bucket. Valid values: `Enabled`, `Suspended`, or `Disabled`. `Disabled` should only be used when creating or importing resources that correspond to unversioned S3 buckets.

[mfa\_delete](#mfa_delete_python) str

Specifies whether MFA delete is enabled in the bucket versioning configuration. Valid values: `Enabled` or `Disabled`.

[status](#status_yaml) This property is required. String

Versioning state of the bucket. Valid values: `Enabled`, `Suspended`, or `Disabled`. `Disabled` should only be used when creating or importing resources that correspond to unversioned S3 buckets.

[mfaDelete](#mfadelete_yaml) String

Specifies whether MFA delete is enabled in the bucket versioning configuration. Valid values: `Enabled` or `Disabled`.

## Import[](#import)

### Identity Schema[](#identity-schema)

#### Required[](#required)

-   `bucket` (String) S3 bucket name.

#### Optional[](#optional)

-   `accountId` (String) AWS Account where this resource is managed.
-   `region` (String) Region where this resource is managed.

If the owner (account ID) of the source bucket differs from the account used to configure the AWS Provider, import using the `bucket` and `expectedBucketOwner` separated by a comma (`,`):

**Using `pulumi import` to import** S3 bucket versioning using the `bucket` or using the `bucket` and `expectedBucketOwner` separated by a comma (`,`). For example:

If the owner (account ID) of the source bucket is the same account used to configure the AWS Provider, import using the `bucket`:

```bash
$ pulumi import aws:s3/bucketVersioningV2:BucketVersioningV2 example bucket-name
```

If the owner (account ID) of the source bucket differs from the account used to configure the AWS Provider, import using the `bucket` and `expectedBucketOwner` separated by a comma (`,`):

```bash
$ pulumi import aws:s3/bucketVersioningV2:BucketVersioningV2 example bucket-name,123456789012
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

-   [Request a Change](https://github.com/pulumi/registry/issues/new?body=File: [themes%2fdefault%2fcontent/%2fregistry%2fpackages%2faws%2fapi-docs%2fs3%2fbucketversioningv2]\(https%3a%2f%2fwww.pulumi.com%2fregistry%2fpackages%2faws%2fapi-docs%2fs3%2fbucketversioningv2%2f\))

#### Try Pulumi Cloud free.
Your team will thank you.

[Start free trial](https://app.pulumi.com/signup?utm_source=registry&utm_medium=right-rail-banner&utm_campaign=try-pulumi-cloud&iaid=docs-try-pulumi-cloud-ad)
