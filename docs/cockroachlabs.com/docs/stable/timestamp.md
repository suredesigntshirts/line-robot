---
Source: https://www.cockroachlabs.com/docs/stable/timestamp
Generated: 2026-06-12
Updated: 2026-06-12
---

# TIMESTAMP / TIMESTAMPTZ

On this page ![Carat arrow pointing down](/docs/images/carat-down-fill.svg)

-   [Variants](#variants)
-   [Best practices](#best-practices)
-   [Aliases](#aliases)
-   [Syntax](#syntax)
-   [Size](#size)
-   [Precision](#precision)
-   [Supported casting and conversion](#supported-casting-and-conversion)
    -   [Infinity `TIMESTAMP` casts](#infinity-timestamp-casts)
-   [Examples](#examples)
    -   [Create a table with a `TIMESTAMPTZ`\-typed column](#create-a-table-with-a-timestamptz-typed-column)
    -   [Create a table with a `TIMESTAMP`\-typed column, with precision](#create-a-table-with-a-timestamp-typed-column-with-precision)
    -   [Convert a `TIMESTAMP` to seconds since epoch](#convert-a-timestamp-to-seconds-since-epoch)
    -   [Convert a `TIMESTAMP` to milliseconds since epoch](#convert-a-timestamp-to-milliseconds-since-epoch)
    -   [Convert a `TIMESTAMP` to microseconds since epoch](#convert-a-timestamp-to-microseconds-since-epoch)
    -   [Convert an `INT` (seconds since epoch) to timestamp](#convert-an-int-seconds-since-epoch-to-timestamp)
    -   [Convert a `STRING` (seconds since epoch) to timestamp](#convert-a-string-seconds-since-epoch-to-timestamp)
    -   [Convert an `INT` (milliseconds since epoch) to timestamp](#convert-an-int-milliseconds-since-epoch-to-timestamp)
    -   [Convert a `STRING` (milliseconds since epoch) to timestamp](#convert-a-string-milliseconds-since-epoch-to-timestamp)
    -   [Convert an `INT` (microseconds since epoch) to timestamp](#convert-an-int-microseconds-since-epoch-to-timestamp)
    -   [Convert a `STRING` (microseconds since epoch) to timestamp](#convert-a-string-microseconds-since-epoch-to-timestamp)
-   [See also](#see-also)

The `TIMESTAMP` and `TIMESTAMPTZ` [data types](/docs/v26.2/data-types) store a date and time pair in UTC.

## Variants

`TIMESTAMP` has two variants:

-   `TIMESTAMP` presents all `TIMESTAMP` values in UTC.

-   `TIMESTAMPTZ` converts `TIMESTAMP` values from UTC to the client's session time zone (unless another time zone is specified for the value). However, it is conceptually important to note that `TIMESTAMPTZ` **does not** store any time zone data.

    Note:

    The default session time zone is UTC, which means that by default `TIMESTAMPTZ` values display in UTC.

The difference between these two variants is that `TIMESTAMPTZ` uses the client's session [time zone](/docs/v26.2/set-vars#set-time-zone), while the other simply does not. This behavior extends to functions like `now()` and `extract()` on `TIMESTAMPTZ` values.

Note:

A time zone offset of `+00:00` is displayed for all [`TIME`](/docs/v26.2/time) and `TIMESTAMP` values, but is not stored in the database.

You can use the [`timezone()`](/docs/v26.2/functions-and-operators#date-and-time-functions) and [`AT TIME ZONE`](/docs/v26.2/functions-and-operators#special-syntax-forms) functions to convert a `TIMESTAMPTZ` into a `TIMESTAMP` at a specified timezone, or to convert a `TIMESTAMP` into a `TIMESTAMPTZ` at a specified timezone.

Explore the differences of `TIMESTAMP` and `TIMESTAMPTZ` in the following video:

## Best practices

We recommend always using the `TIMESTAMPTZ` variant because the `TIMESTAMP` variant can sometimes lead to unexpected behaviors when it ignores a session offset. However, we also recommend you avoid [setting a session time zone offset](/docs/v26.2/set-vars#set-time-zone) for your database.

## Aliases

In CockroachDB, the following are aliases:

-   `TIMESTAMP`, `TIMESTAMP WITHOUT TIME ZONE`
-   `TIMESTAMPTZ`, `TIMESTAMP WITH TIME ZONE`

## Syntax

You can express a constant value of type `TIMESTAMP`/`TIMESTAMPTZ` using an [interpreted literal](/docs/v26.2/sql-constants#interpreted-literals), or a string literal [annotated with](/docs/v26.2/scalar-expressions#explicitly-typed-expressions) type `TIMESTAMP`/`TIMESTAMPTZ` or [coerced to](/docs/v26.2/scalar-expressions#explicit-type-coercions) type `TIMESTAMP`/`TIMESTAMPTZ`. When it is unambiguous, a simple unannotated [string literal](/docs/v26.2/sql-constants#string-literals) is automatically interpreted as type `TIMESTAMP` or `TIMESTAMPTZ`.

You can express `TIMESTAMP` constants using the following string literal formats:

| Format | Example |
| --- | --- |
| Date only | `TIMESTAMP '2016-01-25'` |
| Date and Time | `TIMESTAMP '2016-01-25 10:10:10.555555'` |
| ISO 8601 | `TIMESTAMP '2016-01-25T10:10:10.555555'` |

To express a `TIMESTAMPTZ` value with time zone offset from UTC, use the following format: `TIMESTAMPTZ '2016-01-25 10:10:10.555555-05:00'`. The fractional portion is optional and is rounded to microseconds (6 digits after decimal) for compatibility with the PostgreSQL wire protocol.

By default, CockroachDB interprets truncated dates (e.g., `12-16-06`) as `MM-DD-YY`. To change the input string format of truncated dates, set the `datestyle` [session variable](/docs/v26.2/set-vars) or the `sql.defaults.datestyle` [cluster setting](/docs/v26.2/cluster-settings).

Note:

Use [`ALTER ROLE ALL SET {sessionvar} = {val}`](/docs/v26.2/alter-role#set-default-session-variable-values-for-all-users) instead of the `sql.defaults.*` [cluster settings](/docs/v26.2/cluster-settings). This allows you to set a default value for all users for any [session variable](/docs/v26.2/set-vars) that applies during login, making the `sql.defaults.*` cluster settings redundant.

## Size

A `TIMESTAMP`/`TIMESTAMPTZ` column supports values up to 12 bytes in width, but the total storage size is likely to be larger due to CockroachDB metadata.

## Precision

CockroachDB supports precision levels from 0 (seconds) to 6 (microseconds) for `TIMESTAMP`/`TIMESTAMPTZ` values. Precision in time values specifies the number of fractional digits retained in the seconds field. For example, specifying a `TIMESTAMPTZ` value as `TIMESTAMPTZ(3)` truncates the time component to milliseconds. By default, `TIMESTAMP`/`TIMESTAMPTZ` values have a precision of 6 (microseconds).

You can use an [`ALTER COLUMN ... SET DATA TYPE`](/docs/v26.2/alter-table#alter-column) statement to change the precision level of a `TIMESTAMP`/`TIMESTAMPTZ`\-typed column. If there is already a non-default precision level specified for the column, the precision level can only be changed to an equal or greater precision level. For an example, see [Create a table with a `TIMESTAMP`\-typed column, with precision](#create-a-table-with-a-timestamp-typed-column-with-precision).

## Supported casting and conversion

`TIMESTAMP` values can be [cast](/docs/v26.2/data-types#data-type-conversions-and-casts) to any of the following data types:

| Type | Details |
| --- | --- |
| `DECIMAL` | Converts to number of seconds since the Unix epoch (Jan. 1, 1970). |
| `FLOAT` | Converts to number of seconds since the Unix epoch (Jan. 1, 1970). |
| `TIME` | Converts to the time portion (`HH:MM:SS`) of the timestamp. |
| `INT` | Converts to number of seconds since the Unix epoch (Jan. 1, 1970). |
| `DATE` | Converts to the date (`YYYY-MM-DD`) of the timestamp and omits the other information. |
| `STRING` | Converts to the date and time portion (`YYYY-MM-DD HH:MM:SS`) of the timestamp and omits the time zone offset. |

### Infinity `TIMESTAMP` casts

CockroachDB does not support an `infinity`/`-infinity` representation for `TIMESTAMP` casts. Instead, `infinity::TIMESTAMP` evaluates to `294276-12-31 23:59:59.999999+00:00`, the maximum `TIMESTAMP` value supported, and `-infinity::TIMESTAMP` evaluates to `-4714-11-24 00:00:00+00:00`, the minimum `TIMESTAMP` value supported.

Note that this behavior differs from PostgreSQL, for which `infinity` is higher than any allowable `TIMESTAMP` value (including `294276-12-31 23:59:59.999999+00:00`), and `-infinity` is lower than any allowable `TIMESTAMP` value (including `-4714-11-24 00:00:00+00:00`).

## Examples

### Create a table with a `TIMESTAMPTZ`\-typed column

icon/buttons/copy

```sql
CREATE TABLE timestamps (a INT PRIMARY KEY, b TIMESTAMPTZ);
```

icon/buttons/copy

```sql
SHOW COLUMNS FROM timestamps;
```

```
column_name |  data_type  | is_nullable | column_default | generation_expression |  indices  | is_hidden
+-------------+-------------+-------------+----------------+-----------------------+-----------+-----------+
  a           | INT8        |    false    | NULL           |                       | {primary} |   false
  b           | TIMESTAMPTZ |    true     | NULL           |                       | {primary} |   false
(2 rows)
```

icon/buttons/copy

```sql
INSERT INTO timestamps VALUES (1, TIMESTAMPTZ '2016-03-26 10:10:10-05:00'), (2, TIMESTAMPTZ '2016-03-26');
```

icon/buttons/copy

```sql
SELECT * FROM timestamps;
```

```
a |             b
+---+---------------------------+
  1 | 2016-03-26 15:10:10+00:00
  2 | 2016-03-26 00:00:00+00:00
(2 rows)
```

### Create a table with a `TIMESTAMP`\-typed column, with precision

icon/buttons/copy

```sql
CREATE TABLE timestamps (a INT PRIMARY KEY, b TIMESTAMP(3));
```

icon/buttons/copy

```sql
SHOW COLUMNS FROM timestamps;
```

```
column_name |  data_type   | is_nullable | column_default | generation_expression |  indices  | is_hidden
--------------+--------------+-------------+----------------+-----------------------+-----------+------------
  a           | INT8         |    false    | NULL           |                       | {primary} |   false
  b           | TIMESTAMP(3) |    true     | NULL           |                       | {primary} |   false
(2 rows)
```

icon/buttons/copy

```sql
INSERT INTO timestamps VALUES (1, TIMESTAMP '2020-03-25 12:00:00.123456'), (2, TIMESTAMP '2020-03-26 4:00:00.123456');
```

icon/buttons/copy

```sql
SELECT * FROM timestamps;
```

```
a |               b
----+--------------------------------
  1 | 2020-03-25 12:00:00.123+00:00
  2 | 2020-03-26 04:00:00.123+00:00
(2 rows)
```

To change the precision level of a column, you can use an [`ALTER COLUMN ... SET DATA TYPE`](/docs/v26.2/alter-table#alter-column) statement:

icon/buttons/copy

```sql
ALTER TABLE timestamps ALTER COLUMN b SET DATA TYPE TIMESTAMP(4);
```

```
ALTER TABLE
```

icon/buttons/copy

```sql
SHOW COLUMNS FROM timestamps;
```

```
column_name |  data_type   | is_nullable | column_default | generation_expression |  indices  | is_hidden
--------------+--------------+-------------+----------------+-----------------------+-----------+------------
  a           | INT8         |    false    | NULL           |                       | {primary} |   false
  b           | TIMESTAMP(4) |    true     | NULL           |                       | {primary} |   false
(2 rows)
```

When changing precision level, `TIMESTAMP` can be changed to `TIMESTAMPTZ`, and `TIMESTAMPTZ` can be changed to `TIMESTAMP`:

icon/buttons/copy

```sql
ALTER TABLE timestamps ALTER COLUMN b SET DATA TYPE TIMESTAMPTZ(5);
```

```
ALTER TABLE
```

icon/buttons/copy

```sql
SHOW COLUMNS FROM timestamps;
```

```
column_name |   data_type    | is_nullable | column_default | generation_expression |  indices  | is_hidden
--------------+----------------+-------------+----------------+-----------------------+-----------+------------
  a           | INT8           |    false    | NULL           |                       | {primary} |   false
  b           | TIMESTAMPTZ(5) |    true     | NULL           |                       | {primary} |   false
(2 rows)
```

Note:

If a non-default precision level has already been specified, you cannot change the precision to a lower level.

In this case, the `b` column, which is of type `TIMESTAMPTZ(5)`, cannot be changed to a precision level below `5`:

icon/buttons/copy

```sql
ALTER TABLE timestamps ALTER COLUMN b SET DATA TYPE TIMESTAMPTZ(3);
```

```
ERROR: unimplemented: type conversion from TIMESTAMPTZ(5) to TIMESTAMPTZ(3) requires overwriting existing values which is not yet implemented
SQLSTATE: 0A000
```

### Convert a `TIMESTAMP` to seconds since epoch

icon/buttons/copy

```sql
SELECT now()::int;
```

### Convert a `TIMESTAMP` to milliseconds since epoch

icon/buttons/copy

```sql
SELECT (now()::float*1000)::int;
```

### Convert a `TIMESTAMP` to microseconds since epoch

icon/buttons/copy

```sql
SELECT (now()::float*1000000)::int;
```

### Convert an `INT` (seconds since epoch) to timestamp

icon/buttons/copy

```sql
SELECT 1597868006::timestamp;
```

### Convert a `STRING` (seconds since epoch) to timestamp

icon/buttons/copy

```sql
SELECT '1597868006'::int::timestamp;
```

### Convert an `INT` (milliseconds since epoch) to timestamp

Note that `TIMESTAMP epoch'` is the equivalent of `0::timestamp`.

icon/buttons/copy

```sql
SELECT TIMESTAMP 'epoch' + (1597868048960::float/1000)::interval;
```

### Convert a `STRING` (milliseconds since epoch) to timestamp

icon/buttons/copy

```sql
SELECT TIMESTAMP 'epoch' + ('1597868048960'::float/1000)::interval;
SELECT TIMESTAMP 'epoch' + ('1597868048960'::INT8) * '1 ms'::interval;
SELECT TIMESTAMP 'epoch' + ('1597868048960'::INT8) * '1 millisecond'::interval;
SELECT TIMESTAMP 'epoch' + ('1597868048960' || 'ms')::interval;
SELECT TIMESTAMP 'epoch' + ('1597868048960' || 'milliseconds')::interval;
```

### Convert an `INT` (microseconds since epoch) to timestamp

icon/buttons/copy

```sql
SELECT TIMESTAMP 'epoch' + (1597868402212060::float/1000000)::interval;
```

### Convert a `STRING` (microseconds since epoch) to timestamp

icon/buttons/copy

```sql
SELECT TIMESTAMP 'epoch' + ('1597868402212060'::INT8) * '1 μs'::interval;
SELECT TIMESTAMP 'epoch' + ('1597868402212060'::INT8) * '1 microsecond'::interval;
SELECT TIMESTAMP 'epoch' + ('1597868402212060' || ' μs')::interval;
SELECT TIMESTAMP 'epoch' + ('1597868402212060' || ' microseconds')::interval;
SELECT TIMESTAMP 'epoch' + ('1597868402212060'::float/1000000)::interval;
```

## See also

-   [Data Types](/docs/v26.2/data-types)
-   [`DECIMAL`](/docs/v26.2/decimal)
-   [`FLOAT`](/docs/v26.2/float)
-   [`TIME`](/docs/v26.2/time)
-   [`INT`](/docs/v26.2/int)
-   [`DATE`](/docs/v26.2/date)
-   [`STRING`](/docs/v26.2/string)
