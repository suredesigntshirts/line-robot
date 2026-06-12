---
Source: https://orm.drizzle.team/docs/get-started-postgresql
Generated: 2026-06-12
Updated: 2026-06-12
---

# Drizzle <> PostgreSQL

This guide assumes familiarity with:

-   Database [connection basics](/docs/connect-overview) with Drizzle
-   node-postgres [basics](https://node-postgres.com/)
-   postgres.js [basics](https://github.com/porsager/postgres?tab=readme-ov-file#usage)

Drizzle has native support for PostgreSQL connections with the `node-postgres` and `postgres.js` drivers.

There are a few differences between the `node-postgres` and `postgres.js` drivers that we discovered while using both and integrating them with the Drizzle ORM. For example:

-   With `node-postgres`, you can install `pg-native` to boost the speed of both `node-postgres` and Drizzle by approximately 10%.
-   `node-postgres` supports providing type parsers on a per-query basis without globally patching things. For more details, see [Types Docs](https://node-postgres.com/features/queries#types).
-   `postgres.js` uses prepared statements by default, which you may need to opt out of. This could be a potential issue in AWS environments, among others, so please keep that in mind.
-   If there’s anything else you’d like to contribute, we’d be happy to receive your PRs [here](https://github.com/drizzle-team/drizzle-orm-docs/pulls)

## node-postgres[](#node-postgres)

#### Step 1 - Install packages[](#step-1---install-packages)

npm

yarn

pnpm

bun

```astro
npm i drizzle-orm pg
npm i -D drizzle-kit @types/pg
```

#### Step 2 - Initialize the driver and make a query[](#step-2---initialize-the-driver-and-make-a-query)

node-postgres

node-postgres with config

```astro
// Make sure to install the 'pg' package
import { drizzle } from 'drizzle-orm/node-postgres';

const db = drizzle(process.env.DATABASE_URL);

const result = await db.execute('select 1');
```

If you need to provide your existing driver:

```astro
// Make sure to install the 'pg' package
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const db = drizzle({ client: pool });

const result = await db.execute('select 1');
```

## postgres.js[](#postgresjs)

#### Step 1 - Install packages[](#step-1---install-packages-1)

npm

yarn

pnpm

bun

```astro
npm i drizzle-orm postgres
npm i -D drizzle-kit
```

#### Step 2 - Initialize the driver and make a query[](#step-2---initialize-the-driver-and-make-a-query-1)

postgres.js

postgres.js with config

```astro
import { drizzle } from 'drizzle-orm/postgres-js';

const db = drizzle(process.env.DATABASE_URL);

const result = await db.execute('select 1');
```

If you need to provide your existing driver:

```astro
// Make sure to install the 'postgres' package
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const queryClient = postgres(process.env.DATABASE_URL);
const db = drizzle({ client: queryClient });

const result = await db.execute('select 1');
```

#### What’s next?[](#whats-next)

**Manage schema**

[Drizzle Schema](/docs/sql-schema-declaration) [PostgreSQL data types](/docs/column-types/pg) [Indexes and Constraints](/docs/indexes-constraints) [Database Views](/docs/views) [Database Schemas](/docs/schemas) [Sequences](/docs/sequences) [Extensions](/docs/extensions/pg)

**Query data**

[Relational Queries](/docs/rqb) [Select](/docs/select) [Insert](/docs/insert) [Update](/docs/update) [Delete](/docs/delete) [Filters](/docs/operators) [Joins](/docs/joins) [sql\`\` operator](/docs/sql)
