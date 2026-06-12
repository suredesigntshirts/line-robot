---
Source: https://www.cockroachlabs.com/docs/stable/date
Generated: 2026-06-12
Updated: 2026-06-12
---

# DATE

On this page ![Carat arrow pointing down](/docs/images/carat-down-fill.svg)

-   [Syntax](#syntax)
-   [PostgreSQL compatibility](#postgresql-compatibility)
-   [Size](#size)
-   [Examples](#examples)
-   [Supported casting and conversion](#supported-casting-and-conversion)
-   [See also](#see-also)

The `DATE` [data type](/docs/v26.2/data-types) stores a year, month, and day.

## Syntax

You can express a constant value of type `DATE` using an [interpreted literal](/docs/v26.2/sql-constants#interpreted-literals), or a string literal [annotated with](/docs/v26.2/scalar-expressions#explicitly-typed-expressions) type `DATE` or [coerced to](/docs/v26.2/scalar-expressions#explicit-type-coercions) type `DATE`.

CockroachDB also supports using uninterpreted [string literals](/docs/v26.2/sql-constants#string-literals) in contexts where a `DATE` value is otherwise expected. By default, CockroachDB parses the following string formats for dates:

-   `YYYY-MM-DD`
-   `MM-DD-YYYY`
-   `MM-DD-YY` (default)/`YY-MM-DD`/`DD-MM-YY`

To change the input format of truncated dates (e.g., `12-16-06`) from `MM-DD-YY` to `YY-MM-DD` or `DD-MM-YY`, set the `datestyle` [session variable](/docs/v26.2/set-vars) or the `sql.defaults.datestyle` [cluster setting](/docs/v26.2/cluster-settings).

Note:

Use [`ALTER ROLE ALL SET {sessionvar} = {val}`](/docs/v26.2/alter-role#set-default-session-variable-values-for-all-users) instead of the `sql.defaults.*` [cluster settings](/docs/v26.2/cluster-settings). This allows you to set a default value for all users for any [session variable](/docs/v26.2/set-vars) that applies during login, making the `sql.defaults.*` cluster settings redundant.

## PostgreSQL compatibility

`DATE` values in CockroachDB are fully [PostgreSQL-compatible](https://www.postgresql.org/docs/current/datatype-datetime.html), including support for special values (e.g., `+/- infinity`). Existing dates outside of the PostgreSQL date range (`4714-11-24 BC` to `5874897-12-31`) are converted to `+/- infinity` dates.

## Size

A `DATE` column supports values up to 16 bytes in width, but the total storage size is likely to be larger due to CockroachDB metadata.

## Examples

icon/buttons/copy

```sql
CREATE TABLE dates (a DATE PRIMARY KEY, b INT);
```

icon/buttons/copy

```sql
SHOW COLUMNS FROM dates;
```

```
column_name | data_type | is_nullable | column_default | generation_expression |  indices  | is_hidden
--------------+-----------+-------------+----------------+-----------------------+-----------+------------
  a           | DATE      |    false    | NULL           |                       | {primary} |   false
  b           | INT8      |    true     | NULL           |                       | {primary} |   false
(2 rows)
```

Explicitly typed `DATE` literal:

icon/buttons/copy

```sql
INSERT INTO dates VALUES (DATE '2016-03-26', 12345);
```

String literal implicitly typed as `DATE`:

icon/buttons/copy

```sql
INSERT INTO dates VALUES ('03-27-16', 12345);
```

icon/buttons/copy

```sql
SELECT * FROM dates;
```

```
a      |   b
-------------+--------
  2016-03-26 | 12345
  2016-03-27 | 12345
(2 rows)
```

## Supported casting and conversion

`DATE` values can be [cast](/docs/v26.2/data-types#data-type-conversions-and-casts) to any of the following data types:

| Type | Details |
| --- | --- |
| `DECIMAL` | Converts to number of days since the Unix epoch (Jan. 1, 1970). |
| `FLOAT` | Converts to number of days since the Unix epoch (Jan. 1, 1970). |
| `TIMESTAMP` | Sets the time to 00:00 (midnight) in the resulting timestamp. |
| `INT` | Converts to number of days since the Unix epoch (Jan. 1, 1970). |
| `STRING` | –– |

## See also

[Data Types](/docs/v26.2/data-types)
