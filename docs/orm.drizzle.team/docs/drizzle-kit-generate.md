---
Source: https://orm.drizzle.team/docs/drizzle-kit-generate
Generated: 2026-06-12
Updated: 2026-06-12
---

# `drizzle-kit generate`

This guide assumes familiarity with:

-   Get started with Drizzle and `drizzle-kit` - [read here](/docs/get-started)
-   Drizzle schema fundamentals - [read here](/docs/sql-schema-declaration)
-   Database connection basics - [read here](/docs/connect-overview)
-   Drizzle migrations fundamentals - [read here](/docs/migrations)
-   Drizzle Kit [overview](/docs/kit-overview) and [config file](/docs/drizzle-config-file)

`drizzle-kit generate` lets you generate SQL migrations based on your Drizzle schema upon declaration or on subsequent schema changes.

How it works under the hood?

Drizzle Kit `generate` command triggers a sequence of events:

1.  It will read through your Drizzle schema file(s) and compose a json snapshot of your schema
2.  It will read through your previous migrations folders and compare current json snapshot to the most recent one
3.  Based on json differences it will generate SQL migrations
4.  Save `migration.sql` and `snapshot.json` in migration folder under current timestamp

src/schema.ts

```astro
import * as p from "./drizzle-orm/pg-core";

export const users = p.pgTable("users", {
  id: p.serial().primaryKey(),
  name: p.text(),
  email: p.text().unique(),
};
```

```astro
┌────────────────────────┐
│ $ drizzle-kit generate │
└─┬──────────────────────┘
  │
  └ 1. read previous migration folders
    2. find diff between current and previous schema
    3. prompt developer for renames if necessary
  ┌ 4. generate SQL migration and persist to file
  │    ┌─┴───────────────────────────────────────┐
  │      📂 drizzle
  │      └ 📂 20242409125510_premium_mister_fear
  │        ├ 📜 migration.sql
  │        └ 📜 snapshot.json
  v
```

```astro
-- drizzle/20242409125510_premium_mister_fear/migration.sql

CREATE TABLE "users" (
 "id" SERIAL PRIMARY KEY,
 "name" TEXT,
 "email" TEXT UNIQUE
);
```

It’s designed to cover [code first](/docs/migrations) approach of managing Drizzle migrations. You can apply generated migrations using [`drizzle-kit migrate`](/docs/drizzle-kit-migrate), using drizzle-orm’s `migrate()`, using external migration tools like [bytebase](https://www.bytebase.com/) or running migrations yourself directly on the database.

`drizzle-kit generate` command requires you to provide both `dialect` and `schema` path options, you can set them either via [drizzle.config.ts](/docs/drizzle-config-file) config file or via CLI options

With config file

As CLI options

```astro
// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema.ts",
});
```

```astro
npx drizzle-kit generate
```

### Schema files path[](#schema-files-path)

You can have a single `schema.ts` file or as many schema files as you want spread out across the project. Drizzle Kit requires you to specify path(s) to them as a [glob](https://www.digitalocean.com/community/tools/glob?comments=true&glob=/**/*.js&matches=false&tests=//%20This%20will%20match%20as%20it%20ends%20with%20'.js'&tests=/hello/world.js&tests=//%20This%20won't%20match!&tests=/test/some/globs) via `schema` configuration option.

Example 1

Example 2

Example 3

Example 4

```astro
📦 <project root>
 ├ ...
 ├ 📂 drizzle
 ├ 📂 src
 │ ├ ...
 │ ├ 📜 index.ts
 │ └ 📜 schema.ts
 ├ 📜 drizzle.config.ts
 └ 📜 package.json
```

```astro
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/schema.ts",
});
```

### Custom migration file name[](#custom-migration-file-name)

You can set custom migration file names by providing `--name` CLI option

```astro
npx drizzle-kit generate --name=init
```

```astro
📦 <project root>
 ├ 📂 drizzle
 │ └ 📂 20242409125510_init
 │   ├ 📜 snapshot.json
 │   └ 📜 migration.sql
 ├ 📂 src
 └ …
```

### Multiple configuration files in one project[](#multiple-configuration-files-in-one-project)

You can have multiple config files in the project, it’s very useful when you have multiple database stages or multiple databases or different databases on the same project:

npm

yarn

pnpm

bun

```astro
npx drizzle-kit generate --config=drizzle-dev.config.ts
npx drizzle-kit generate --config=drizzle-prod.config.ts
```

```astro
📦 <project root>
 ├ 📂 drizzle
 ├ 📂 src
 ├ 📜 .env
 ├ 📜 drizzle-dev.config.ts
 ├ 📜 drizzle-prod.config.ts
 ├ 📜 package.json
 └ 📜 tsconfig.json
```

### Custom migrations[](#custom-migrations)

You can generate empty migration files to write your own custom SQL migrations for DDL alternations currently not supported by Drizzle Kit or data seeding. Extended docs on custom migrations - [see here](/docs/kit-custom-migrations)

```astro
drizzle-kit generate --custom --name=seed-users
```

```astro
📦 <project root>
 ├ 📂 drizzle
 │ ├ 📂 20242409125510_init
 │ └ 📂 20242409125510_seed-users
 ├ 📂 src
 └ …
```

```astro
-- ./drizzle/20242409125510_seed/migration.sql

INSERT INTO "users" ("name") VALUES('Dan');
INSERT INTO "users" ("name") VALUES('Andrew');
INSERT INTO "users" ("name") VALUES('Dandrew');
```

### Ignore conflicts[](#ignore-conflicts)

IMPORTANT

`--ignore-conflicts` available starting from `drizzle-orm@1.0.0-beta.16`

In case you need `generate` command to skip commutativity checks and bypass it, you can use `--ignore-conflicts`. If there is a situation you want to use it, then there is a big chance that `drizzle-kit` didn’t check migrations right and it’s a bug. Please report us your case, so we can fix it

```astro
drizzle-kit generate --ignore-conflicts
```

### Extended list of available configurations[](#extended-list-of-available-configurations)

`drizzle-kit generate` has a list of cli-only options

|  |  |
| --- | --- |
| `custom` | generate empty SQL for custom migration |
| `name` | generate migration with custom name |

npm

yarn

pnpm

bun

```astro
npx drizzle-kit generate --name=init
npx drizzle-kit generate --name=seed_users --custom
```

* * *

We recommend configuring `drizzle-kit` through [drizzle.config.ts](/docs/drizzle-config-file) file, yet you can provide all configuration options through CLI if necessary, e.g. in CI/CD pipelines, etc.

|  |  |  |
| --- | --- | --- |
| `dialect` | `required` | Database dialect, one of `postgresql` `mysql` `sqlite` `turso` `singlestore` `mssql` `cockroachdb` |
| `schema` | `required` | Path to typescript schema file(s) or folder(s) with multiple schema files |
| `out` |  | Migrations output folder, default is `./drizzle` |
| `config` |  | Configuration file path, default is `drizzle.config.ts` |
| `breakpoints` |  | SQL statements breakpoints, default is `true` |

### Extended example[](#extended-example)

Example of how to create a custom postgresql migration file named `0001_seed-users.sql` with Drizzle schema located in `./src/schema.ts` and migrations folder named `./migrations` instead of default `./drizzle`.

We will also place drizzle config file in the `configs` folder.

Let’s create config file:

```astro
📦 <project root>
 ├ 📂 migrations
 ├ 📂 configs
 │ └ 📜 drizzle.config.ts
 ├ 📂 src
 └ …
```

drizzle.config.ts

```astro
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema.ts",
  out: "./migrations",
});
```

Now let’s run

```astro
npx drizzle-kit generate --config=./configs/drizzle.config.ts --name=seed-users --custom
```

And it will successfully generate

```astro
📦 <project root>
 ├ …
 ├ 📂 migrations
 │ ├ 📂 20242409125510_init
 │ └ 📂 20242409125510_seed-users
 └ …
```

```astro
-- ./drizzle/20242409125510_seed-users/migration.sql

INSERT INTO "users" ("name") VALUES('Dan');
INSERT INTO "users" ("name") VALUES('Andrew');
INSERT INTO "users" ("name") VALUES('Dandrew');
```
