---
Source: https://www.thenile.dev/docs/getting-started/schema_migrations/drizzle
Generated: 2026-06-12
Updated: 2026-06-12
---

> ## Documentation Index
> Fetch the complete documentation index at: https://thenile.dev/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Schema Migrations with Drizzle

Drizzle is a TypeScript ORM that supports Postgres, MySQL, and SQLite. It also has a CLI, `drizzle-kit`, for managing migrations and few other things.
This guide will show you how to use Drizzle Kit CLI to manage your schema migrations. We are going to assume that you already have a project set up with your
favorite Typescript framework.

<Steps>
  <Step title="Start from example project">
    Clone our example project and install dependencies:

    ```bash theme={null}
    git clone https://github.com/niledatabase/niledatabase.git
    cd examples/migrations/drizzle
    npm i
    ```

    This will install `drizzle-kit`, `drizzle-orm`, `dotenv`, and `pg-node` - all of which are needed for this guide. `pg-node` can be replaced with another postgres client like `postgres.js`.

    To run this example, you'll need a .env file with a DATABASE\_URL environment variable set to a postgres database.
    You can copy the connection string from your Nile database home page.
  </Step>

  <Step title="Configure Drizzle">
    Drizzle kit is configured via a `drizzle.config.ts` file, which you can find in the root of the example project.

    Here's an example `drizzle.config.ts` file. You'll need to set:

    * The `schema` field to the path to your schema file
    * The `out` field to the path where you want to store your migrations
    * The `dialect` field to `postgresql` for Nile databases
    * The `dbCredentials` field with your database credentials

    ```javascript theme={null}
    import { defineConfig } from 'drizzle-kit';
    import dotenv from 'dotenv';

    dotenv.config();

    export default defineConfig({
      schema: './src/db/schema.ts',
      out: './db/out',
      dialect: 'postgresql',
      dbCredentials: {
        url:
          process.env.DATABASE_URL ||
          'postgresql://username:password@db.thenile.dev:5432/db',
      },
    });
    ```
  </Step>

  <Step title="Define Your Schema">
    In code-first schema management, you define your schema as Typescript objects, and then use the Drizzle Kit CLI to generate migrations.

    Create your schema in `src/db/schema.ts`. Note that we include the built-in `tenants` table that Nile automatically provisions:

    ```javascript theme={null}
    import { sql } from 'drizzle-orm';
    import {
      pgTable,
      primaryKey,
      uuid,
      text,
      timestamp,
      varchar,
      boolean,
      vector,
    } from 'drizzle-orm/pg-core';

    export const tenants = pgTable('tenants', {
      id: uuid('id')
        .default(sql`gen_random_uuid()`)
        .primaryKey(),
      name: text('name'),
      created: timestamp('created'),
      updated: timestamp('updated'),
      deleted: timestamp('deleted'),
    });

    export const todos = pgTable(
      'todos',
      {
        id: uuid('id').default(sql`gen_random_uuid()`),
        tenantId: uuid('tenant_id'),
        title: varchar('title', { length: 256 }),
        estimate: varchar('estimate', { length: 256 }),
        embedding: vector('embedding', { dimensions: 768 }),
        complete: boolean('complete'),
      },
      (table) => {
        return {
          pk: primaryKey({ columns: [table.tenantId, table.id] }),
        };
      },
    );
    ```
  </Step>

  <Step title="Generate and Run Migrations">
    Generate your first migration using Drizzle Kit:

    ```bash theme={null}
    npx drizzle-kit generate
    ```

    You should see output like:

    ```bash theme={null}
    2 tables
    tenants 5 columns 0 indexes 0 fks
    todos 6 columns 0 indexes 0 fks

    [✓] Your SQL migration file ➜ db/out/0000_absurd_captain_britain.sql 🚀
    ```

    Then run the migration:

    ```bash theme={null}
    npx drizzle-kit migrate
    ```
  </Step>

  <Step title="Seed and Query Data">
    Now you can write code to insert and query data. Here's an example (`src/index.ts`):

    ```javascript theme={null}
    import 'dotenv/config';
    import { drizzle } from 'drizzle-orm/node-postgres';
    import { todos, tenants } from './db/schema';

    const db = drizzle(process.env.DATABASE_URL!);
    async function main() {
      const tenant: typeof tenants.$inferInsert = {
        name: 'My New Tenant',
      };

      const tenantId = await db.insert(tenants).values(tenant).returning({ id: tenants.id });
      console.log('New tenant created!')

      const todo: typeof todos.$inferInsert = {
        title: 'My New Todo',
        tenantId: tenantId[0].id,
      };

      await db.insert(todos).values(todo);
      console.log('New todo created!')

      const rows = await db.select().from(todos);
      console.log('Getting all todos from the database: ', rows)
    }

    main();
    ```

    Run the example:

    ```bash theme={null}
    npx tsx src/index.ts
    ```

    You should see output showing the created tenant and todo:

    ```bash theme={null}
    New tenant created!
    New todo created!
    Getting all todos from the database:  [
      {
        id: 'd8896674-a7eb-4405-a4de-4ad6fbd2f5fc',
        tenantId: '01929704-3250-70bf-9568-0a6858dfd4e9',
        title: 'My New Todo',
        estimate: null,
        embedding: null,
        complete: null
      }
    ]
    ```
  </Step>

  <Step title="Make Schema Changes">
    To add new columns, update your schema file. For example, to add a due date:

    ```javascript theme={null}
    // ...
        complete: boolean("complete"),
        dueDate: timestamp("due_date"), // new column!
    // ...
    ```

    Generate and run a new migration:

    ```bash theme={null}
    npx drizzle-kit generate
    npx drizzle-kit migrate
    ```

    This will generate a migration file like:

    ```sql theme={null}
    ALTER TABLE "todos" ADD COLUMN "due_date" timestamp;
    ```
  </Step>
</Steps>
