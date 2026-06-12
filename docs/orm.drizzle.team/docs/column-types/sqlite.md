---
Source: https://orm.drizzle.team/docs/column-types/sqlite
Generated: 2026-06-12
Updated: 2026-06-12
---

# SQLite column types

Based on the official **[SQLite docs](https://www.sqlite.org/datatype3.html)**, each value stored in an SQLite database (or manipulated by the database engine) has one of the following storage classes `NULL`, `INTEGER`, `REAL`, `TEXT` and `BLOB`.

We have native support for all of them, yet if that’s not enough for you, feel free to create **[custom types](/docs/custom-types)**.

important

All examples in this part of the documentation do not use database column name aliases, and column names are generated from TypeScript keys.

You can use database aliases in column names if you want, and you can also use the `casing` parameter to define a mapping strategy for Drizzle.

You can read more about it [here](/docs/sql-schema-declaration#shape-your-data-schema)

### Integer[](#integer)

A signed integer, stored in `0`, `1`, `2`, `3`, `4`, `6`, or `8` bytes depending on the magnitude of the value.

```astro
import { integer, sqliteTable } from "drizzle-orm/sqlite-core";

const table = sqliteTable('table', {
	id: integer()
});

// you can customize integer mode to be number, boolean, timestamp, timestamp_ms
integer({ mode: 'number' })
integer({ mode: 'boolean' })
integer({ mode: 'timestamp_ms' })
integer({ mode: 'timestamp' }) // Date
```

```astro
CREATE TABLE `table` (
	`id` integer
);
```

```astro
// to make integer primary key auto increment
integer({ mode: 'number' }).primaryKey({ autoIncrement: true })
```

```astro
CREATE TABLE `table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL
);
```

### Real[](#real)

A floating point value, stored as an `8-byte IEEE` floating point number.

```astro
import { real, sqliteTable } from "drizzle-orm/sqlite-core";

const table = sqliteTable('table', {
	real: real()
});
```

```astro
CREATE TABLE `table` (
	`real` real
);
```

### Text[](#text)

A text string, stored using the database encoding (`UTF-8`, `UTF-16BE` or `UTF-16LE`).

You can define `{ enum: ["value1", "value2"] }` config to infer `insert` and `select` types, it **won’t** check runtime values.

```astro
import { text, sqliteTable } from "drizzle-orm/sqlite-core";

const table = sqliteTable('table', {
	text: text()
});

// will be inferred as text: "value1" | "value2" | null
text({ enum: ["value1", "value2"] })
text({ mode: 'json' })
text({ mode: 'json' }).$type<{ foo: string }>()
```

```astro
CREATE TABLE `table` (
	`text` text
);
```

### Blob[](#blob)

A blob of data, stored exactly as it was input.

It’s recommended to use `text('', { mode: 'json' })` instead of `blob('', { mode: 'json' })`, because it supports JSON functions:

All JSON functions currently throw an error if any of their arguments are BLOBs because BLOBs are reserved for a future enhancement in which BLOBs will store the binary encoding for JSON.

See **[https://www.sqlite.org/json1.html](https://www.sqlite.org/json1.html)**.

```astro
import { blob, sqliteTable } from "drizzle-orm/sqlite-core";

const table = sqliteTable('table', {
	blob: blob()
});

blob()
blob({ mode: 'buffer' })
blob({ mode: 'bigint' })

blob({ mode: 'json' })
blob({ mode: 'json' }).$type<{ foo: string }>()
```

```astro
CREATE TABLE `table` (
	`blob` blob
);
```

You can specify `.$type<..>()` for blob inference, it **won’t** check runtime values. It provides compile time protection for default values, insert and select schemas.

```astro
// will be inferred as { foo: string }
json: blob({ mode: 'json' }).$type<{ foo: string }>();

// will be inferred as string[]
json: blob({ mode: 'json' }).$type<string[]>();

// won't compile
json: blob({ mode: 'json' }).$type<string[]>().default({});
```

### Boolean[](#boolean)

SQLite does not have native `boolean` data type, yet you can specify `integer` column to be in a `boolean` mode. This allows you to operate boolean values in your code and Drizzle stores them as 0 and 1 integer values in the database.

```astro
import { integer, sqliteTable } from "drizzle-orm/sqlite-core";

const table = sqliteTable('table', {
	id: integer({ mode: 'boolean' })
});
```

```astro
CREATE TABLE `table` (
	`id` integer
);
```

### Bigint[](#bigint)

Since there is no `bigint` data type in SQLite, Drizzle offers a special `bigint` mode for `blob` columns. This mode allows you to work with BigInt instances in your code, and Drizzle stores them as blob values in the database.

```astro
import { blob, sqliteTable } from "drizzle-orm/sqlite-core";

const table = sqliteTable('table', {
	id: blob({ mode: 'bigint' })
});
```

```astro
CREATE TABLE `table` (
	`id` blob
);
```

### Numeric[](#numeric)

```astro
import { blob, sqliteTable } from "drizzle-orm/sqlite-core";

const table = sqliteTable('table', {
	numeric: numeric(),
	numericNum: numeric({ mode: 'number' }),
	numericBig: numeric({ mode: 'bigint' }),
});
```

```astro
CREATE TABLE `table` (
	`numeric` numeric,
	`numericNum` numeric,
	`numericBig` numeric
);
```

## \---[](#---)

### Customizing data type[](#customizing-data-type)

Every column builder has a `.$type()` method, which allows you to customize the data type of the column. This is useful, for example, with unknown or branded types.

```astro
type UserId = number & { __brand: 'user_id' };
type Data = {
	foo: string;
	bar: number;
};

const users = sqliteTable('users', {
  id: integer().$type<UserId>().primaryKey(),
  jsonField: blob().$type<Data>(),
});
```

### Not null[](#not-null)

`NOT NULL` constraint dictates that the associated column may not contain a `NULL` value.

```astro
const table = sqliteTable('table', {
	numInt: integer().notNull()
});
```

```astro
CREATE TABLE table (
	`numInt` integer NOT NULL
);
```

### Default value[](#default-value)

The `DEFAULT` clause specifies a default value to use for the column if no value is explicitly provided by the user when doing an `INSERT`. If there is no explicit `DEFAULT` clause attached to a column definition, then the default value of the column is `NULL`.

An explicit `DEFAULT` clause may specify that the default value is `NULL`, a string constant, a blob constant, a signed-number, or any constant expression enclosed in parentheses.

```astro
import { sql } from "drizzle-orm";
import { integer, sqliteTable } from "drizzle-orm/sqlite-core";

const table = sqliteTable('table', {
	int1: integer().default(42),
	int2: integer().default(sql`(abs(42))`)
});
```

```astro
CREATE TABLE `table` (
	`int1` integer DEFAULT 42,
	`int2` integer DEFAULT (abs(42))
);
```

A default value may also be one of the special case-independent keywords `CURRENT_TIME`, `CURRENT_DATE` or `CURRENT_TIMESTAMP`.

```astro
import { sql } from "drizzle-orm";
import { text, sqliteTable } from "drizzle-orm/sqlite-core";

const table = sqliteTable("table", {
  time: text().default(sql`(CURRENT_TIME)`),
  date: text().default(sql`(CURRENT_DATE)`),
  timestamp: text().default(sql`(CURRENT_TIMESTAMP)`),
});
```

```astro
CREATE TABLE `table` (
	`time` text DEFAULT (CURRENT_TIME),
	`date` text DEFAULT (CURRENT_DATE),
	`timestamp` text DEFAULT (CURRENT_TIMESTAMP)
);
```

When using `$default()` or `$defaultFn()`, which are simply different aliases for the same function, you can generate defaults at runtime and use these values in all insert queries. These functions can assist you in utilizing various implementations such as `uuid`, `cuid`, `cuid2`, and many more.

Note: This value does not affect the `drizzle-kit` behavior, it is only used at runtime in `drizzle-orm`

```astro
import { text, sqliteTable } from "drizzle-orm/sqlite-core";
import { createId } from '@paralleldrive/cuid2';

const table = sqliteTable('table', {
	id: text().$defaultFn(() => createId()),
});
```

When using `$onUpdate()` or `$onUpdateFn()`, which are simply different aliases for the same function, you can generate defaults at runtime and use these values in all update queries.

Adds a dynamic update value to the column. The function will be called when the row is updated, and the returned value will be used as the column value if none is provided. If no default (or $defaultFn) value is provided, the function will be called when the row is inserted as well, and the returned value will be used as the column value.

Note: This value does not affect the `drizzle-kit` behavior, it is only used at runtime in `drizzle-orm`

```astro
import { text, sqliteTable } from "drizzle-orm/sqlite-core";

const table = sqliteTable('table', {
    alwaysNull: text().$type<string | null>().$onUpdate(() => null),
});
```
