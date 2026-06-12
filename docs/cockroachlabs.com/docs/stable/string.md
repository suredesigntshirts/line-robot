---
Source: https://www.cockroachlabs.com/docs/stable/string
Generated: 2026-06-12
Updated: 2026-06-12
---

# STRING

On this page ![Carat arrow pointing down](/docs/images/carat-down-fill.svg)

-   [Aliases](#aliases)
-   [Related types](#related-types)
-   [Length](#length)
-   [Syntax](#syntax)
    -   [Collations](#collations)
-   [Size](#size)
-   [Examples](#examples)
-   [Supported casting and conversion](#supported-casting-and-conversion)
    -   [`STRING` vs. `BYTES`](#string-vs-bytes)
    -   [Cast hexadecimal digits to `BIT`](#cast-hexadecimal-digits-to-bit)
    -   [Concatenate `STRING` values with values of other types](#concatenate-string-values-with-values-of-other-types)
    -   [Convert `STRING` to `TIMESTAMP`](#convert-string-to-timestamp)
    -   [Convert `STRING` to `TSVECTOR`](#convert-string-to-tsvector)
    -   [Convert `STRING` to `TSQUERY`](#convert-string-to-tsquery)
-   [See also](#see-also)

The `STRING` [data type](/docs/v26.2/data-types) stores a string of Unicode characters.

Note:

`STRING` is not a data type supported by PostgreSQL. For PostgreSQL compatibility, CockroachDB supports additional [aliases](#aliases) and [`STRING`\-related types](#related-types).

## Aliases

CockroachDB supports the following alias for `STRING`:

-   `TEXT`

## Related types

For PostgreSQL compatibility, CockroachDB supports the following `STRING`\-related types and their aliases:

-   `VARCHAR` (and alias `CHARACTER VARYING`)
-   `CHAR` (and alias `CHARACTER`)
-   `NAME`

These types are functionally identical to `STRING`.

CockroachDB also supports the single-byte `"char"` special character type. As in PostgreSQL, this special type is intended for internal use in [system catalogs](/docs/v26.2/system-catalogs), and has a storage size of 1 byte. CockroachDB truncates all values of type `"char"` to a single character.

## Length

To limit the length of a string column, use `STRING(n)`, where `n` is the maximum number of Unicode code points (normally thought of as "characters") allowed. This applies to all related types as well (e.g., to limit the length of a `VARCHAR` type, use `VARCHAR(n)`). To reduce performance issues caused by storing very large string values in indexes, Cockroach Labs recommends setting length limits on string-typed columns.

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

When inserting a `STRING` value or a `STRING`\-related-type value:

-   If the value is cast with a length limit (e.g., `CAST('hello world' AS STRING(5))`), CockroachDB truncates to the limit. This applies to `STRING(n)` and all related types.
-   If the value exceeds the column's length limit, CockroachDB returns an error. This applies to `STRING(n)` and all related types.
-   For `STRING(n)` and `VARCHAR(n)`/`CHARACTER VARYING(n)` types, if the value is under the column's length limit, CockroachDB does **not** add space padding to the end of the value.
-   For `CHAR(n)`/`CHARACTER(n)` types, if the value is under the column's length limit, CockroachDB adds space padding from the end of the value to the length limit.

    | Type | Length |
    | --- | --- |
    | `CHARACTER`, `CHARACTER(n)`, `CHAR`, `CHAR(n)` | Fixed-length |
    | `CHARACTER VARYING(n)`, `VARCHAR(n)`, `STRING(n)` | Variable-length, with a limit |
    | `TEXT`, `VARCHAR`, `CHARACTER VARYING`, `STRING` | Variable-length, with no limit |
    | `"char"` (special type) | 1 byte |

## Syntax

A value of type `STRING` can be expressed using a variety of formats. See [string literals](/docs/v26.2/sql-constants#string-literals) for more details.

When printing out a `STRING` value in the [SQL shell](/docs/v26.2/cockroach-sql), the shell uses the simple SQL string literal format if the value doesn't contain special character, or the escaped format otherwise.

### Collations

`STRING` values accept [collations](/docs/v26.2/collate), which lets you sort strings according to language- and country-specific rules.

## Size

The size of a `STRING` value is variable, but it's recommended to keep values under 64 kilobytes to ensure performance. Above that threshold, [write amplification](/docs/v26.2/architecture/storage-layer#write-amplification) and other considerations may cause significant performance degradation.

## Examples

icon/buttons/copy

```sql
CREATE TABLE strings (a STRING PRIMARY KEY, b STRING(4), c TEXT);
```

icon/buttons/copy

```sql
SHOW COLUMNS FROM strings;
```

```
column_name | data_type | is_nullable | column_default | generation_expression |  indices  | is_hidden
--------------+-----------+-------------+----------------+-----------------------+-----------+------------
  a           | STRING    |    false    | NULL           |                       | {primary} |   false
  b           | STRING(4) |    true     | NULL           |                       | {primary} |   false
  c           | STRING    |    true     | NULL           |                       | {primary} |   false
(3 rows)
```

icon/buttons/copy

```sql
INSERT INTO strings VALUES ('a1b2c3d4', 'e5f6', 'g7h8i9');
```

icon/buttons/copy

```sql
SELECT * FROM strings;
```

```
a     |  b   |   c
+----------+------+--------+
  a1b2c3d4 | e5f6 | g7h8i9
(1 row)
```

icon/buttons/copy

```sql
CREATE TABLE aliases (a STRING PRIMARY KEY, b VARCHAR, c CHAR);
```

icon/buttons/copy

```sql
SHOW COLUMNS FROM aliases;
```

```
column_name | data_type | is_nullable | column_default | generation_expression |   indices   | is_hidden
+-------------+-----------+-------------+----------------+-----------------------+-------------+-----------+
  a           | STRING    |    false    | NULL           |                       | {primary}   |   false
  b           | VARCHAR   |    true     | NULL           |                       | {primary}   |   false
  c           | CHAR      |    true     | NULL           |                       | {primary}   |   false
(3 rows)
```

## Supported casting and conversion

`STRING` values can be [cast](/docs/v26.2/data-types#data-type-conversions-and-casts) to any of the following data types:

| Type | Details |
| --- | --- |
| `ARRAY` | Requires supported [ARRAY](/docs/v26.2/array) string format, e.g., `'{1,2,3}'`. , Note that string literals can be implicitly cast to any supported `ARRAY` data type except [BYTES](/docs/v26.2/bytes), [ENUM](/docs/v26.2/enum), [JSONB](/docs/v26.2/jsonb), [SERIAL](/docs/v26.2/serial), and the [spatial data types](/docs/v26.2/architecture/glossary#data-types) `Box2D`, `GEOGRAPHY`, and `GEOMETRY`. |
| `BIT` | Requires supported [BIT](/docs/v26.2/bit) string format, e.g., `'101001'` or `'xAB'`. |
| `BOOL` | Requires supported [BOOL](/docs/v26.2/bool) string format, e.g., `'true'`. |
| `BYTES` | For more details, [see here](/docs/v26.2/bytes#supported-conversions). |
| `CITEXT` | Preserves the original letter case, but value comparisons are treated case-insensitively. Refer to [CITEXT](/docs/v26.2/citext). |
| `DATE` | Requires supported [DATE](/docs/v26.2/date) string format, e.g., `'2016-01-25'`. |
| `DECIMAL` | Requires supported [DECIMAL](/docs/v26.2/decimal) string format, e.g., `'1.1'`. |
| `FLOAT` | Requires supported [FLOAT](/docs/v26.2/float) string format, e.g., `'1.1'`. |
| `INET` | Requires supported [INET](/docs/v26.2/inet) string format, e.g, `'192.168.0.1'`. |
| `INT` | Requires supported [INT](/docs/v26.2/int) string format, e.g., `'10'`. |
| `INTERVAL` | Requires supported [INTERVAL](/docs/v26.2/interval) string format, e.g., `'1h2m3s4ms5us6ns'`. |
| `JSONPATH` | Requires a valid [JSONPath](/docs/v26.2/jsonpath) expression string, e.g., `'$'` or `'$.players[*] ? (@.stats.ppg > 30)'`. |
| `LTREE` | Requires supported [LTREE](/docs/v26.2/ltree) string format, e.g., `'Animals.Mammals.Carnivora'`. |
| `TIME` | Requires supported [TIME](/docs/v26.2/time) string format, e.g., `'01:22:12'` (microsecond precision). |
| `TIMESTAMP` | Requires supported [TIMESTAMP](/docs/v26.2/timestamp) string format, e.g., `'2016-01-25 10:10:10.555555'`. |
| `TSQUERY` | Requires supported [TSQUERY](/docs/v26.2/tsquery) string format, e.g., `'Requires & supported & TSQUERY & string & format'`. , Note that casting a string to a `TSQUERY` will not normalize the tokens into lexemes. To do so, [use to_tsquery(), plainto_tsquery(), or phraseto_tsquery()](#convert-string-to-tsquery). |
| `TSVECTOR` | Requires supported [TSVECTOR](/docs/v26.2/tsvector) string format, e.g., `'Requires supported TSVECTOR string format.'`. , Note that casting a string to a `TSVECTOR` will not normalize the tokens into lexemes. To do so, [use to_tsvector()](#convert-string-to-tsvector). |
| `UUID` | Requires supported [UUID](/docs/v26.2/uuid) string format, e.g., `'63616665-6630-3064-6465-616462656562'`. |

### `STRING` vs. `BYTES`

While both `STRING` and `BYTES` can appear to have similar behavior in many situations, one should understand their nuance before casting one into the other.

`STRING` treats all of its data as characters, or more specifically, Unicode code points. `BYTES` treats all of its data as a byte string. This difference in implementation can lead to dramatically different behavior. For example, let's take a complex Unicode character such as ☃ ([the snowman emoji](https://emojipedia.org/snowman/)):

icon/buttons/copy

```sql
SELECT length('☃'::string);
```

```
length
+--------+
       1
```

```sql
SELECT length('☃'::bytes);
```

```
length
+--------+
       3
```

In this case, [`LENGTH(string)`](/docs/v26.2/functions-and-operators#string-and-byte-functions) measures the number of Unicode code points present in the string, whereas [`LENGTH(bytes)`](/docs/v26.2/functions-and-operators#string-and-byte-functions) measures the number of bytes required to store that value. Each character (or Unicode code point) can be encoded using multiple bytes, hence the difference in output between the two.

#### Translate literals to `STRING` vs. `BYTES`

A literal entered through a SQL client will be translated into a different value based on the type:

-   `BYTES` gives a special meaning to the pair `\x` at the beginning, and translates the rest by substituting pairs of hexadecimal digits to a single byte. For example, `\xff` is equivalent to a single byte with the value of 255. For more information, see [SQL Constants: String literals with character escapes](/docs/v26.2/sql-constants#string-literals-with-character-escapes).
-   `STRING` does not give a special meaning to `\x`, so all characters are treated as distinct Unicode code points. For example, `\xff` is treated as a `STRING` with length 4 (`\`, `x`, `f`, and `f`).

### Cast hexadecimal digits to `BIT`

You can cast a `STRING` value of hexadecimal digits prefixed by `x` or `X` to a `BIT` value.

For example:

icon/buttons/copy

```sql
SELECT 'XAB'::BIT(8)
```

```
bit
---
  10101011
(1 row)
```

### Concatenate `STRING` values with values of other types

`STRING` values can be concatenated with any non-`ARRAY`, non-`NULL` type, resulting in a `STRING` value.

For example:

icon/buttons/copy

```sql
SELECT 1 || 'item';
```

```
?column?
---
  1item
(1 row)
```

icon/buttons/copy

```sql
SELECT true || 'item';
```

```
?column?
---
  titem
(1 row)
```

Concatenating a `STRING` value with a [`NULL` value](/docs/v26.2/null-handling) results in a `NULL` value.

For example:

icon/buttons/copy

```sql
SELECT NULL || 'item';
```

```
?column?
---
  NULL
(1 row)
```

### Convert `STRING` to `TIMESTAMP`

You can use the [`parse_timestamp()` function](/docs/v26.2/functions-and-operators) to parse strings in `TIMESTAMP` format.

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

### Convert `STRING` to `TSVECTOR`

You can use the [`to_tsvector()` function](/docs/v26.2/functions-and-operators#full-text-search-functions) to parse strings in [`TSVECTOR`](/docs/v26.2/tsvector) format. This will normalize the tokens into lexemes, and will add an integer position to each lexeme.

icon/buttons/copy

```sql
SELECT to_tsvector('How do trees get on the internet?');
```

```
to_tsvector
---
  'get':4 'internet':7 'tree':3
```

For more information on usage, see [Full-Text Search](/docs/v26.2/full-text-search).

### Convert `STRING` to `TSQUERY`

You can use the [`to_tsquery()`, `plainto_tsquery()`, and `phraseto_tsquery()` functions](/docs/v26.2/functions-and-operators#full-text-search-functions) to parse strings in [`TSQUERY`](/docs/v26.2/tsquery) format. This will normalize the tokens into lexemes.

When using `to_tsquery()`, the string input must be formatted as a [`TSQUERY`](/docs/v26.2/tsquery#syntax), with operators separating tokens.

icon/buttons/copy

```sql
SELECT to_tsquery('How & do & trees & get & on & the & internet?');
```

```
to_tsquery
---
  'tree' & 'get' & 'internet'
```

For more information on usage, see [Full-Text Search](/docs/v26.2/full-text-search).

## See also

-   [Data Types](/docs/v26.2/data-types)
-   [String literal syntax](/docs/v26.2/sql-constants#string-literals)
