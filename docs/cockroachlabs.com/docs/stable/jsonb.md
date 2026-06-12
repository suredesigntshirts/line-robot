---
Source: https://www.cockroachlabs.com/docs/stable/jsonb
Generated: 2026-06-12
Updated: 2026-06-12
---

# JSONB

On this page ![Carat arrow pointing down](/docs/images/carat-down-fill.svg)

-   [Alias](#alias)
    -   [Syntax](#syntax)
-   [Size](#size)
-   [Operators](#operators)
-   [Functions](#functions)
-   [Index `JSONB` data](#index-jsonb-data)
-   [Known limitations](#known-limitations)
-   [Examples](#examples)
    -   [Create a table with a `JSONB` column](#create-a-table-with-a-jsonb-column)
    -   [Retrieve formatted `JSONB` data](#retrieve-formatted-jsonb-data)
    -   [Retrieve a specific field from `JSONB` data](#retrieve-a-specific-field-from-jsonb-data)
    -   [Retrieve the distinct keys from a `JSONB` field](#retrieve-the-distinct-keys-from-a-jsonb-field)
    -   [Retrieve key-value pairs from a `JSONB` field](#retrieve-key-value-pairs-from-a-jsonb-field)
    -   [Group and order `JSONB` values](#group-and-order-jsonb-values)
    -   [Map a `JSONB` array field into rows](#map-a-jsonb-array-field-into-rows)
    -   [Access nested `JSONB` fields](#access-nested-jsonb-fields)
    -   [Update an array element](#update-an-array-element)
    -   [Create a table with a `JSONB` column and a computed column](#create-a-table-with-a-jsonb-column-and-a-computed-column)
    -   [Create a table with a `JSONB` column and a virtual computed column](#create-a-table-with-a-jsonb-column-and-a-virtual-computed-column)
-   [Supported casting and conversion](#supported-casting-and-conversion)
-   [See also](#see-also)

The `JSONB` [data type](/docs/v26.2/data-types) stores JSON (JavaScript Object Notation) data as a binary representation of the `JSONB` value, which eliminates whitespace, duplicate keys, and key ordering. `JSONB` supports [GIN indexes](/docs/v26.2/inverted-indexes).

## Alias

In CockroachDB, `JSON` is an alias for `JSONB`.

Note:

In PostgreSQL, `JSONB` and `JSON` are two different data types. In CockroachDB, the `JSONB` / `JSON` data type is similar in behavior to the [`JSONB` data type in PostgreSQL](https://www.postgresql.org/docs/current/static/datatype-json.html).

### Syntax

The syntax for the `JSONB` data type follows the format specified in [RFC8259](https://tools.ietf.org/html/rfc8259). You can express a constant value of type `JSONB` using an [interpreted literal](/docs/v26.2/sql-constants#interpreted-literals) or a string literal [annotated with](/docs/v26.2/scalar-expressions#explicitly-typed-expressions) type `JSONB`.

There are six types of `JSONB` values:

-   `null`
-   Boolean
-   String
-   Number (i.e., [`decimal`](/docs/v26.2/decimal), **not** the standard `int64`)
-   Array (i.e., an ordered sequence of `JSONB` values)
-   Object (i.e., a mapping from strings to `JSONB` values)

Examples:

-   `'[{"foo":"bar"}]'`
-   `'{"type": "account creation", "username": "harvestboy93"}'`
-   `'{"first_name": "Ernie", "status": "Looking for treats", "location" : "Brooklyn"}'`
-   `'{"prices" : [ { "05/01/2022" : 100.5 } , { "06/01/2022" : 101.5 } ]}'`

Note:

If duplicate keys are included in the input, only the last value is kept.

## Size

The size of a `JSONB` value is variable, but we recommend that you keep values under 1 MB to ensure satisfactory performance. Above that threshold, [write amplification](/docs/v26.2/architecture/storage-layer#write-amplification) and other considerations may cause significant performance degradation.

Warning:

We **strongly recommend** adding size limits to all [indexed columns](/docs/v26.2/indexes), which includes columns in [primary keys](/docs/v26.2/primary-key).

Values exceeding 1 MiB can lead to [storage layer write amplification](/docs/v26.2/architecture/storage-layer#write-amplification) and cause significant performance degradation or even [crashes due to OOMs (out of memory errors)](/docs/v26.2/cluster-setup-troubleshooting#out-of-memory-oom-crash).

To add a size limit using [`CREATE TABLE`](/docs/v26.2/create-table):

icon/buttons/copy

```sql
CREATE TABLE name (first STRING(100), last STRING(100));
```

To add a size limit using [`ALTER TABLE ... ALTER COLUMN`](/docs/v26.2/alter-table#alter-column):

icon/buttons/copy

```sql
ALTER TABLE name ALTER first TYPE STRING(99);
```

## Operators

| Operator | Description | Example Query and Output |
| --- | --- | --- |
| `->` | Access a `JSONB` field, returning a `JSONB` value. | `SELECT '[{"foo":"bar"}]'::JSONB->0->'foo';` , `"bar"::JSONB` |
| `->>` | Access a `JSONB` field, returning a string. | `SELECT '{"foo":"bar"}'::JSONB->>'foo';` , `bar::STRING` |
| `@>` | Tests whether the left `JSONB` field contains the right `JSONB` field. | `SELECT ('{"foo": {"baz": 3}, "bar": 2}'::JSONB@>'{"foo": {"baz":3}}'::JSONB );` , `true` |
| `<@` | Tests whether the left `JSONB` field is contained by the right `JSONB` field. | `SELECT('{"bar":2}'::JSONB<@'{"foo":1, "bar":2}'::JSONB);` , `true` |
| `#>` | Access a `JSONB` field at the specified path, returning a `JSONB` value. | `SELECT '[{"foo":"bar"}]'::JSONB#>'{0,foo}';` , `"bar"::JSONB` |
| `#>>` | Access a `JSONB` field at the specified path, returning a string. | `SELECT '[{"foo":"bar"}]'::JSONB#>>'{0,foo}';` , `bar::STRING` |
| `?` | Does the key or element string exist within the JSONB value? | `SELECT('{"foo":1, "bar":2}'::JSONB?'bar');` , `true` |
| `?&` | Do all the key or element strings exist within the JSONB value? | `SELECT('{"foo":1, "bar":2}'::JSONB?&array['foo','bar']);` , `true` |
| `? , ` | Do any of the key or element strings exist within the JSONB value? | `SELECT('{"foo":1, "bar":2}'::JSONB? , array['bar']);` , `true` |
| `[` ... `]` | Access a `JSONB` key, returning a `JSONB` value or object. For details, see [Subscripted expressions](/docs/v26.2/scalar-expressions#subscripted-expressions). | `SELECT('{"foo": {"bar":1}}'::JSONB)['foo']['bar'];` , `1` |

For the full list of supported `JSONB` operators, see [Operators](/docs/v26.2/functions-and-operators#operators).

## Functions

| Function | Description |
| --- | --- |
| `jsonb_array_elements(<jsonb>)` | Expands a `JSONB` array to a set of `JSONB` values. See [Map a JSONB array field into rows](#map-a-jsonb-array-field-into-rows). |
| `jsonb_build_object(<any_element>...)` | Builds a `JSONB` object out of a variadic argument list that alternates between keys and values. |
| `jsonb_each(<jsonb>)` | Expands the outermost `JSONB` object into a set of key-value pairs. See [Retrieve key-value pairs from a JSONB field](#retrieve-key-value-pairs-from-a-jsonb-field). |
| `jsonb_object_keys(<jsonb>)` | Returns sorted set of keys in the outermost `JSONB` object. See [Retrieve the distinct keys from a JSONB field](#retrieve-the-distinct-keys-from-a-jsonb-field). |
| `jsonb_pretty(<jsonb>)` | Returns the given `JSONB` value as a `STRING` indented and with newlines. See [Retrieve formatted JSONB data](#retrieve-formatted-jsonb-data). |
| `jsonb_set(val: jsonb, path: string[], to: jsonb)` | Returns the JSON value pointed to by the variadic arguments. See [Update an array element](#update-an-array-element). |

For the full list of supported `JSONB` functions, see [JSONB functions](/docs/v26.2/functions-and-operators#jsonb-functions).

## Index `JSONB` data

To [index](/docs/v26.2/indexes) a `JSONB` column you can use a [GIN index](/docs/v26.2/inverted-indexes#examples) or [index an expression on the column](/docs/v26.2/expression-indexes#use-an-expression-to-index-a-field-in-a-jsonb-column).

## Known limitations

-   You cannot use [primary key](/docs/v26.2/primary-key), [foreign key](/docs/v26.2/foreign-key), and [unique](/docs/v26.2/unique) [constraints](/docs/v26.2/constraints) on `JSONB` values.

## Examples

This section shows how to create tables with `JSONB` columns and use operators and functions to access and update `JSONB` data. For the full list of operators and functions, see [Operators](/docs/v26.2/functions-and-operators#operators) and [JSONB functions](/docs/v26.2/functions-and-operators#jsonb-functions).

### Create a table with a `JSONB` column

icon/buttons/copy

```sql
CREATE TABLE users (
    profile_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    last_updated TIMESTAMP DEFAULT now(),
    user_profile JSONB
  );
```

icon/buttons/copy

```sql
SHOW COLUMNS FROM users;
```

```
column_name  | data_type | is_nullable |  column_default   | generation_expression |  indices     | is_hidden
---------------+-----------+-------------+-------------------+-----------------------+--------------+------------
  profile_id   | UUID      |    false    | gen_random_uuid() |                       | {users_pkey} |   false
  last_updated | TIMESTAMP |    true     | now():::TIMESTAMP |                       | {users_pkey} |   false
  user_profile | JSONB     |    true     | NULL              |                       | {users_pkey} |   false
(3 rows)
```

icon/buttons/copy

```sql
INSERT INTO users (user_profile) VALUES
    ('{"first_name": "Lola", "last_name": "Dog", "location": "NYC", "online" : true, "friends" : 547}'),
    ('{"first_name": "Ernie", "status": "Looking for treats", "location" : "Brooklyn"}');
```

icon/buttons/copy

```sql
SELECT * FROM users;
```

```
+--------------------------------------+----------------------------------+----------------------------------------------------------------------------------------------+
|              profile_id              |           last_updated           |                               user_profile                                                   |
+--------------------------------------+----------------------------------+----------------------------------------------------------------------------------------------+
| 33c0a5d8-b93a-4161-a294-6121ee1ade93 | 2022-02-27 16:39:28.155024+00:00 | {"first_name": "Lola", "friends": 547, "last_name": "Dog", "location":"NYC", "online": true} |
| 6a7c15c9-462e-4551-9e93-f389cf63918a | 2022-02-27 16:39:28.155024+00:00 | {"first_name": "Ernie", "location": "Brooklyn", "status": "Looking for treats}               |
+--------------------------------------+----------------------------------+----------------------------------------------------------------------------------------------+
```

### Retrieve formatted `JSONB` data

To retrieve `JSONB` data with easier-to-read formatting, use the `jsonb_pretty()` function. For example, retrieve data from the table you created in the [first example](#create-a-table-with-a-jsonb-column):

icon/buttons/copy

```sql
SELECT profile_id, last_updated, jsonb_pretty(user_profile) FROM users;
```

```
+--------------------------------------+----------------------------------+------------------------------------+
|              profile_id              |           last_updated           |            jsonb_pretty            |
+--------------------------------------+----------------------------------+------------------------------------+
| 33c0a5d8-b93a-4161-a294-6121ee1ade93 | 2022-02-27 16:39:28.155024+00:00 | {                                  |
|                                      |                                  |     "first_name": "Lola",          |
|                                      |                                  |     "friends": 547,                |
|                                      |                                  |     "last_name": "Dog",            |
|                                      |                                  |     "location": "NYC",             |
|                                      |                                  |     "online": true                 |
|                                      |                                  | }                                  |
| 6a7c15c9-462e-4551-9e93-f389cf63918a | 2022-02-27 16:39:28.155024+00:00 | {                                  |
|                                      |                                  |     "first_name": "Ernie",         |
|                                      |                                  |     "location": "Brooklyn",        |
|                                      |                                  |     "status": "Looking for treats" |
|                                      |                                  | }                                  |
+--------------------------------------+----------------------------------+------------------------------------+
```

### Retrieve a specific field from `JSONB` data

To retrieve a specific field from `JSONB` data, use the `->` operator. For example, to retrieve a field from the table you created in [Create a table with a `JSONB` column](#create-a-table-with-a-jsonb-column), run:

icon/buttons/copy

```sql
SELECT user_profile->'first_name',user_profile->'location' FROM users;
```

```
?column? |  ?column?
-----------+-------------
  "Ernie"  | "Brooklyn"
  "Lola"   | "NYC"
```

You can also use a [subscripted expression](/docs/v26.2/scalar-expressions#subscripted-expressions) for an equivalent result:

icon/buttons/copy

```sql
SELECT (user_profile)['first_name'],(user_profile)['location'] FROM users;
```

```
user_profile | user_profile
---------------+---------------
  "Ernie"      | "Brooklyn"
  "Lola"       | "NYC"
```

Use the `->>` operator to return `JSONB` fields as `STRING` values:

icon/buttons/copy

```sql
SELECT user_profile->>'first_name', user_profile->>'location' FROM users;
```

```
?column? | ?column?
-----------+-----------
  Ernie    | Brooklyn
  Lola     | NYC
```

Use the `@>` operator to filter the values in a field in a `JSONB` column:

icon/buttons/copy

```sql
SELECT user_profile->'first_name', user_profile->'location' FROM users WHERE user_profile @> '{"location":"NYC"}';
```

```
?column? | ?column?
-----------+-----------
  "Lola"   | "NYC"
```

Use the `#>>` operator with a path to return all first names:

icon/buttons/copy

```sql
SELECT user_profile#>>'{first_name}' as "first name" from users;
```

```
first name
---
  Ernie
  Lola
(2 rows)
```

### Retrieve the distinct keys from a `JSONB` field

icon/buttons/copy

```sql
SELECT DISTINCT jsonb_object_keys(user_profile) AS keys FROM users;
```

```
keys
---
  first_name
  friends
  last_name
  location
  online
  status
(6 rows)
```

### Retrieve key-value pairs from a `JSONB` field

icon/buttons/copy

```sql
SELECT jsonb_each(user_profile) AS pairs FROM users;
```

```
pairs
---
  (first_name,"""Lola""")
  (friends,547)
  (last_name,"""Dog""")
  (location,"""NYC""")
  (online,true)
  (first_name,"""Ernie""")
  (location,"""Brooklyn""")
  (status,"""Looking for treats""")
(8 rows)
```

### Group and order `JSONB` values

To organize your `JSONB` field values, use the `GROUP BY` and `ORDER BY` clauses with the `->>` operator. For example, organize the `first_name` values from the table you created in the [first example](#create-a-table-with-a-jsonb-column):

For this example, we will add a few more records to the existing table. This will help us see clearly how the data is grouped.

icon/buttons/copy

```sql
INSERT INTO users (user_profile) VALUES
    ('{"first_name": "Lola", "last_name": "Kim", "location": "Seoul", "online": false, "friends": 600}'),
    ('{"first_name": "Parvati", "last_name": "Patil", "location": "London", "online": false, "friends": 500}');
```

icon/buttons/copy

```sql
SELECT user_profile->>'first_name' AS first_name, user_profile->>'location' AS location FROM users;
```

```
first_name | location
-------------+-----------
  Ernie      | Brooklyn
  Lola       | NYC
  Parvati    | London
  Lola       | Seoul
```

Group and order the data.

icon/buttons/copy

```sql
SELECT user_profile->>'first_name' first_name, count(*) total FROM users group by user_profile->>'first_name' order by total;
```

```
first_name | total
-------------+-------
  Ernie      | 1
  Parvati    | 1
  Lola       | 2
```

The `->>` operator returns `STRING` and uses string comparison rules to order the data. If you want numeric ordering, [cast the resulting data](#supported-casting-and-conversion) to `FLOAT`.

### Map a `JSONB` array field into rows

To map a `JSONB` array field into rows, use the `jsonb_array_elements` function:

icon/buttons/copy

```sql
CREATE TABLE commodity (id varchar(10), data jsonb);
INSERT INTO commodity (id, data) values ('silver', '{"prices" : [ { "05/01/2022" : 100.5 } , { "06/01/2022" : 101.5 } ]}');
INSERT INTO commodity (id, data) values ('gold', '{"prices" : [ { "05/01/2022" : 200.5 } , { "06/01/2022" : 211.5 } ]}');
SELECT * FROM commodity;
```

```
id   |                            data
---------+-------------------------------------------------------------
  silver | {"prices": [{"05/01/2022": 100.5}, {"06/01/2022": 101.5}]}
  gold   | {"prices": [{"05/01/2022": 200.5}, {"06/01/2022": 211.5}]}
(2 rows)
```

icon/buttons/copy

```sql
SELECT id as commodity, jsonb_array_elements(commodity.data->'prices') AS "price" FROM commodity;
```

```
commodity |         price
------------+------------------------
  silver    | {"05/01/2022": 100.5}
  silver    | {"06/01/2022": 101.5}
  gold      | {"05/01/2022": 200.5}
  gold      | {"06/01/2022": 211.5}
(4 rows)
```

### Access nested `JSONB` fields

To display the commodity prices for May, run:

icon/buttons/copy

```sql
SELECT id AS commodity, data->'prices'->0->'05/01/2022' AS "May prices" from commodity;
```

```
commodity | May prices
------------+-------------
  silver    |      100.5
  gold      |      200.5
(2 rows)
```

### Update an array element

To update a field value, use the `jsonb_set` function. For example, to update the price of `silver` on `06/01/2022` to `90.5`, run:

icon/buttons/copy

```sql
UPDATE commodity SET data = jsonb_set(data, '{prices, 1, "06/01/2022"}', '90.5') where id = 'silver';
UPDATE 1
```

```sql
SELECT * FROM commodity;
```

```
id   |                            data
---------+-------------------------------------------------------------
  silver | {"prices": [{"05/01/2022": 100.5}, {"06/01/2022": 90.5}]}
  gold   | {"prices": [{"05/01/2022": 200.5}, {"06/01/2022": 211.5}]}
(2 rows)
```

### Create a table with a `JSONB` column and a computed column

In this example, create a table with a `JSONB` column and a stored computed column:

icon/buttons/copy

```sql
CREATE TABLE student_profiles (
    id STRING PRIMARY KEY AS (profile->>'id') STORED,
    profile JSONB
);
```

Create a compute column after you create a table:

icon/buttons/copy

```sql
ALTER TABLE student_profiles ADD COLUMN age INT AS ( (profile->>'age')::INT) STORED;
```

Then, insert a few rows of data:

icon/buttons/copy

```sql
INSERT INTO student_profiles (profile) VALUES
    ('{"id": "d78236", "name": "Arthur Read", "age": "16", "school": "PVPHS", "credits": 120, "sports": "none"}'),
    ('{"name": "Buster Bunny", "age": "15", "id": "f98112", "school": "THS", "credits": 67, "clubs": "MUN"}'),
    ('{"name": "Ernie Narayan", "school" : "Brooklyn Tech", "id": "t63512", "sports": "Track and Field", "clubs": "Chess"}');
```

icon/buttons/copy

```sql
SELECT * FROM student_profiles;
```

```
+--------+---------------------------------------------------------------------------------------------------------------------+------+
|   id   |                                                       profile                                                       | age  |
---------+---------------------------------------------------------------------------------------------------------------------+------+
| d78236 | {"age": "16", "credits": 120, "id": "d78236", "name": "Arthur Read", "school": "PVPHS", "sports": "none"}           |   16 |
| f98112 | {"age": "15", "clubs": "MUN", "credits": 67, "id": "f98112", "name": "Buster Bunny", "school": "THS"}               |   15 |
| t63512 | {"clubs": "Chess", "id": "t63512", "name": "Ernie Narayan", "school": "Brooklyn Tech", "sports": "Track and Field"} | NULL |
+--------+---------------------------------------------------------------------------------------------------------------------+------|
```

The primary key `id` is computed as a field from the `profile` column. Additionally the `age` column is computed from the profile column data as well.

This example shows how add a stored computed column with a [coerced type](/docs/v26.2/scalar-expressions#explicit-type-coercions):

icon/buttons/copy

```sql
CREATE TABLE json_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    json_info JSONB
);
INSERT INTO json_data (json_info) VALUES ('{"amount": "123.45"}');
```

icon/buttons/copy

```sql
ALTER TABLE json_data ADD COLUMN amount DECIMAL AS ((json_info->>'amount')::DECIMAL) STORED;
```

icon/buttons/copy

```sql
SELECT * FROM json_data;
```

```
id                  |      json_info       | amount
---------------------------------------+----------------------+---------
  e7c3d706-1367-4d77-bfb4-386dfdeb10f9 | {"amount": "123.45"} | 123.45
(1 row)
```

### Create a table with a `JSONB` column and a virtual computed column

In this example, create a table with a `JSONB` column and virtual computed columns:

icon/buttons/copy

```sql
CREATE TABLE student_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile JSONB,
    full_name STRING AS (concat_ws(' ',profile->>'firstName', profile->>'lastName')) VIRTUAL,
    birthday TIMESTAMP AS (parse_timestamp(profile->>'birthdate')) VIRTUAL
);
```

Then, insert a few rows of data:

icon/buttons/copy

```sql
INSERT INTO student_profiles (profile) VALUES
    ('{"id": "d78236", "firstName": "Arthur", "lastName": "Read", "birthdate": "2010-01-25", "school": "PVPHS", "credits": 120, "sports": "none"}'),
    ('{"firstName": "Buster", "lastName": "Bunny", "birthdate": "2011-11-07", "id": "f98112", "school": "THS", "credits": 67, "clubs": "MUN"}'),
    ('{"firstName": "Ernie", "lastName": "Narayan", "school" : "Brooklyn Tech", "id": "t63512", "sports": "Track and Field", "clubs": "Chess"}');
```

icon/buttons/copy

```sql
SELECT * FROM student_profiles;
```

```
id                  |                                                                   profile                                                                   |   full_name   |      birthday
---------------------------------------+---------------------------------------------------------------------------------------------------------------------------------------------+---------------+----------------------
  0e420282-105d-473b-83e2-3b082e7033e4 | {"birthdate": "2011-11-07", "clubs": "MUN", "credits": 67, "firstName": "Buster", "id": "f98112", "lastName": "Bunny", "school": "THS"}     | Buster Bunny  | 2011-11-07 00:00:00
  6e9b77cd-ec67-41ae-b346-7b3d89902c72 | {"birthdate": "2010-01-25", "credits": 120, "firstName": "Arthur", "id": "d78236", "lastName": "Read", "school": "PVPHS", "sports": "none"} | Arthur Read   | 2010-01-25 00:00:00
  f74b21e3-dc1e-49b7-a648-3c9b9024a70f | {"clubs": "Chess", "firstName": "Ernie", "id": "t63512", "lastName": "Narayan", "school": "Brooklyn Tech", "sports": "Track and Field"}     | Ernie Narayan | NULL
(3 rows)

Time: 2ms total (execution 2ms / network 0ms)
```

The virtual column `full_name` is computed as a field from the `profile` column's data. The first name and last name are concatenated and separated by a single whitespace character using the [`concat_ws` string function](/docs/v26.2/functions-and-operators#string-and-byte-functions).

The virtual column `birthday` is parsed as a `TIMESTAMP` value from the `profile` column's `birthdate` string value. The [`parse_timestamp` function](/docs/v26.2/functions-and-operators) is used to parse strings in `TIMESTAMP` format.

## Supported casting and conversion

This section describes how to cast and convert `JSONB` values.

You can [cast](/docs/v26.2/data-types#data-type-conversions-and-casts) all `JSONB` values to the following data type:

-   [`STRING`](/docs/v26.2/string)

You can cast numeric `JSONB` values to the following numeric data types:

-   [`DECIMAL`](/docs/v26.2/decimal)
-   [`FLOAT`](/docs/v26.2/float)
-   [`INT`](/docs/v26.2/int)

For example:

icon/buttons/copy

```sql
SELECT '100'::JSONB::INT;
```

```
int8
---
   100
(1 row)
```

icon/buttons/copy

```sql
SELECT '100000'::JSONB::FLOAT;
```

```
float8
---
  100000
(1 row)
```

icon/buttons/copy

```sql
SELECT '100.50'::JSONB::DECIMAL;
```

```
numeric
---
   100.50
(1 row)
```

You can use the [`parse_timestamp` function](/docs/v26.2/functions-and-operators) to parse strings in `TIMESTAMP` format.

icon/buttons/copy

```sql
SELECT parse_timestamp ('2022-05-28T10:53:25.160Z');
```

```
parse_timestamp
---
2022-05-28 10:53:25.16
(1 row)
```

You can use the `parse_timestamp` function to retrieve string representations of timestamp data within `JSONB` columns in `TIMESTAMP` format.

icon/buttons/copy

```sql
CREATE TABLE events (
  raw JSONB,
  event_created TIMESTAMP AS (parse_timestamp(raw->'event'->>'created')) VIRTUAL
);
INSERT INTO events (raw) VALUES ('{"event":{"created":"2022-05-28T10:53:25.160Z"}}');
SELECT event_created FROM events;
```

```sql
CREATE TABLE

INSERT 1

      event_created
---
  2022-05-28 10:53:25.16
(1 row)
```

## See also

-   [GIN Indexes](/docs/v26.2/inverted-indexes)
-   [Use an expression to index a field in a JSONB column](/docs/v26.2/expression-indexes#use-an-expression-to-index-a-field-in-a-jsonb-column)
-   [Computed Columns](/docs/v26.2/computed-columns)
-   [Data Types](/docs/v26.2/data-types)
-   [Functions and Operators](/docs/v26.2/functions-and-operators)
