---
Source: https://www.cockroachlabs.com/docs/stable/float
Generated: 2026-06-12
Updated: 2026-06-12
---

# FLOAT

On this page ![Carat arrow pointing down](/docs/images/carat-down-fill.svg)

-   [Names and Aliases](#names-and-aliases)
-   [Syntax](#syntax)
-   [Size](#size)
-   [Examples](#examples)
-   [Supported casting and conversion](#supported-casting-and-conversion)
    -   [Cast `FLOAT` to `INT`](#cast-float-to-int)
-   [See also](#see-also)

CockroachDB supports various inexact, floating-point number [data types](/docs/v26.2/data-types) with up to 17 digits of decimal precision.

They are handled internally using the [standard double-precision (64-bit binary-encoded) IEEE754 format](https://wikipedia.org/wiki/IEEE_floating_point).

## Names and Aliases

| Name | Aliases |
| --- | --- |
| `FLOAT` | None |
| `REAL` | `FLOAT4` |
| `DOUBLE PRECISION` | `FLOAT8` |

## Syntax

A constant value of type `FLOAT` can be entered as a [numeric literal](/docs/v26.2/sql-constants#numeric-literals). For example: `1.414` or `-1234`.

The special IEEE754 values for positive infinity, negative infinity and [NaN (Not-a-Number)](https://wikipedia.org/wiki/NaN) cannot be entered using numeric literals directly and must be converted using an [interpreted literal](/docs/v26.2/sql-constants#interpreted-literals) or an [explicit conversion](/docs/v26.2/scalar-expressions#explicit-type-coercions) from a string literal instead.

The following values are recognized:

| Syntax | Value |
| --- | --- |
| `inf`, `infinity`, `+inf`, `+infinity` | +∞ |
| `-inf`, `-infinity` | -∞ |
| `nan` | [NaN (Not-a-Number)](https://wikipedia.org/wiki/NaN) |

For example:

-   `FLOAT '+Inf'`
-   `'-Inf'::FLOAT`
-   `CAST('NaN' AS FLOAT)`

## Size

A `FLOAT` column supports values up to 8 bytes in width, but the total storage size is likely to be larger due to CockroachDB metadata.

## Examples

icon/buttons/copy

```sql
CREATE TABLE floats (a FLOAT PRIMARY KEY, b REAL, c DOUBLE PRECISION);
```

icon/buttons/copy

```sql
SHOW COLUMNS FROM floats;
```

```
column_name | data_type | is_nullable | column_default | generation_expression |  indices  | is_hidden
--------------+-----------+-------------+----------------+-----------------------+-----------+------------
  a           | FLOAT8    |    false    | NULL           |                       | {primary} |   false
  b           | FLOAT4    |    true     | NULL           |                       | {primary} |   false
  c           | FLOAT8    |    true     | NULL           |                       | {primary} |   false
(3 rows)
```

icon/buttons/copy

```sql
INSERT INTO floats VALUES (1.012345678901, 2.01234567890123456789, CAST('+Inf' AS FLOAT));
```

icon/buttons/copy

```sql
SELECT * FROM floats;
```

```
+----------------+--------------------+------+
|       a        |         b          |  c   |
+----------------+--------------------+------+
| 1.012345678901 | 2.0123456789012346 | +Inf |
+----------------+--------------------+------+
(1 row)

# Note that the value in "b" has been limited to 17 digits.
```

## Supported casting and conversion

`FLOAT` values can be [cast](/docs/v26.2/data-types#data-type-conversions-and-casts) to any of the following data types:

| Type | Details |
| --- | --- |
| `INT` | Rounds the float to the nearest integer. If equidistant to two integers, rounds to the even integer. See [Cast FLOAT to INT](#cast-float-to-int). |
| `DECIMAL` | Causes an error to be reported if the value is NaN or +/- Inf. |
| `BOOL` | 0 converts to `false`; any other value converts to `true`. |
| `STRING` | -- |

### Cast `FLOAT` to `INT`

If you cast a float to an integer, it is rounded to the nearest integer. If it is equidistant to two integers, it is rounded to the even integer.

For example:

icon/buttons/copy

```sql
SELECT f::INT FROM (VALUES (-1.5::FLOAT), (-0.5::FLOAT), (0.5::FLOAT), (1.5::FLOAT)) v(f);
```

```
f
---
  -2
   0
   0
   2
```

## See also

[Data Types](/docs/v26.2/data-types)
