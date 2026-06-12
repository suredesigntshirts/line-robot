---
Source: https://orm.drizzle.team/docs/connect-overview
Generated: 2026-06-12
Updated: 2026-06-12
---

# Database connection with Drizzle

Drizzle ORM runs SQL queries on your database via **database drivers**.

index.ts

schema.ts

```astro
import { drizzle } from "drizzle-orm/node-postgres"
import { users } from "./schema"

const db = drizzle(process.env.DATABASE_URL);
const usersCount = await db.$count(users);
```

```astro
┌──────────────────────┐
                        │   db.$count(users)   │ <--- drizzle query
                        └──────────────────────┘
                            │               ʌ
select count(*) from users -│               │
                            │               │- [{ count: 0 }]
                            v               │
                         ┌─────────────────────┐
                         │    node-postgres    │ <--- database driver
                         └─────────────────────┘
                            │               ʌ
01101000 01100101 01111001 -│               │
                            │               │- 01110011 01110101 01110000
                            v               │
                         ┌────────────────────┐
                         │      Database      │
                         └────────────────────┘
```

Under the hood Drizzle will create a **node-postgres** driver instance which you can access via `db.$client` if necessary

```astro
import { drizzle } from "drizzle-orm/node-postgres"

const db = drizzle(process.env.DATABASE_URL);
const pool = db.$client;
```

```astro
// above is equivalent to
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const db = drizzle({ client: pool });
```

Drizzle is by design natively compatible with every **edge** or **serverless** runtime, whenever you’d need access to a serverless database - we’ve got you covered

Neon HTTP

Neon with websockets

Vercel Postgres

PlanetScale HTTP

Cloudflare d1

```astro
import { drizzle } from "drizzle-orm/neon-http";

const db = drizzle(process.env.DATABASE_URL);
```

And yes, we do support runtime specific drivers like [Bun SQLite](/docs/connect-bun-sqlite) or [Expo SQLite](/docs/connect-expo-sqlite):

```astro
import { drizzle } from "drizzle-orm/bun-sqlite"

const db = drizzle(); // <--- will create an in-memory db
const db = drizzle("./sqlite.db");
```

```astro
import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";

const expo = openDatabaseSync("db.db");
const db = drizzle(expo);
```

#### Database connection URL[](#database-connection-url)

Just in case if you’re not familiar with database connection URL concept

```astro
postgresql://alex:AbC123dEf@ep-cool-darkness-123456.us-east-2.aws.neon.tech/dbname
             └──┘ └───────┘ └─────────────────────────────────────────────┘ └────┘
              ʌ    ʌ          ʌ                                              ʌ
        role -│    │          │- hostname                                    │- database
                   │
                   │- password
```

#### Next steps[](#next-steps)

Feel free to check out per-driver documentations

**PostgreSQL drivers**

[PostgreSQL](/docs/get-started-postgresql) [Neon](/docs/connect-neon) [Vercel Postgres](/docs/connect-vercel-postgres) [Supabase](/docs/connect-supabase) [Xata](/docs/connect-xata) [PGLite](/docs/connect-pglite)

**MySQL drivers**

[MySQL](/docs/get-started-mysql) [PlanetsScale](/docs/connect-planetscale) [TiDB](/docs/connect-tidb)

**SQLite drivers**

[SQLite](/docs/get-started-sqlite) [Turso Cloud](/docs/connect-turso) [Turso Database](/docs/connect-turso-database) [Cloudflare D1](/docs/connect-cloudflare-d1) [Bun SQLite](/docs/connect-bun-sqlite) [SQLite Cloud](/docs/connect-sqlite-cloud)

**Native SQLite**

[Expo SQLite](/docs/get-started/expo-new) [OP SQLite](/docs/connect-op-sqlite) [React Native SQLite](/docs/connect-react-native-sqlite)

**Others**

[Drizzle Proxy](/docs/connect-drizzle-proxy)
