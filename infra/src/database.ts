import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { config, prefix } from "./naming";

// ---------------------------------------------------------------------------
// Stage 1 (plan 19): RDS Postgres + PostGIS — the v2 catalog store. ADDITIVE to
// the existing stack; nothing here touches the URL-bearing v1 resources.
//
// Staging posture (D-S1-2, recorded risk): publicly accessible + forced TLS +
// strong generated secret + open 5432 SG. Lambdas reach it over the public
// internet because VPC-attaching them (for a private DB) would force a NAT
// gateway that costs more than the database. Production hardening (private
// subnets + VPC endpoints, SG restricted) is a pre-prod task, not staging.
// ---------------------------------------------------------------------------

export interface DatabaseResources {
  db: aws.rds.Instance;
  /** postgres://… with sslmode=require; password embedded — always a Pulumi secret. */
  connectionString: pulumi.Output<string>;
}

export function createDatabase(): DatabaseResources {
  const dbPassword = config.requireSecret("dbPassword");

  // rds.force_ssl=1 rejects non-TLS connections at the server, so the public
  // endpoint never accepts plaintext auth.
  const paramGroup = new aws.rds.ParameterGroup("pg-params", {
    name: `${prefix}-pg17`,
    family: "postgres17",
    parameters: [{ name: "rds.force_ssl", value: "1" }],
  });

  // The VPC id comes from config rather than aws.ec2.getVpc({default:true}): the lookup needs
  // ec2:DescribeVpcAttribute, which the scoped deploy identity deliberately lacks. The default VPC
  // never changes, so one config value beats an IAM grant.
  const vpcId = config.require("defaultVpcId");
  const dbSecurityGroup = new aws.ec2.SecurityGroup("pg-sg", {
    name: `${prefix}-pg`,
    description: "Staging Postgres: world-reachable 5432, TLS forced at the engine",
    vpcId,
    ingress: [{ protocol: "tcp", fromPort: 5432, toPort: 5432, cidrBlocks: ["0.0.0.0/0"] }],
    egress: [{ protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] }],
  });

  const db = new aws.rds.Instance("pg", {
    identifier: `${prefix}-pg`,
    engine: "postgres",
    engineVersion: "17.10",
    autoMinorVersionUpgrade: true,
    instanceClass: "db.t4g.micro",
    allocatedStorage: 20,
    storageType: "gp3",
    dbName: "linerobot",
    username: "linerobot",
    password: dbPassword,
    parameterGroupName: paramGroup.name,
    vpcSecurityGroupIds: [dbSecurityGroup.id],
    publiclyAccessible: true,
    multiAz: false,
    deletionProtection: true,
    backupRetentionPeriod: 7,
    // Deletion protection is the real guard; a final snapshot would only matter
    // if protection were deliberately lifted, at which point staging data is
    // reproducible from `npm run db:seed` anyway.
    skipFinalSnapshot: true,
    applyImmediately: true,
  });

  const connectionString = pulumi.secret(
    pulumi.interpolate`postgres://${db.username}:${dbPassword}@${db.address}:${db.port}/${db.dbName}?sslmode=require`,
  );

  return { db, connectionString };
}
