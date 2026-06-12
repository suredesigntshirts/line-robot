---
Source: https://www.cockroachlabs.com/docs/stable/decimal
Generated: 2026-06-12
Updated: 2026-06-12
---

# DECIMAL

On this page ![Carat arrow pointing down](/docs/images/carat-down-fill.svg)

-   [Aliases](#aliases)
-   [Precision and scale](#precision-and-scale)
-   [Syntax](#syntax)
-   [Size](#size)
-   [Examples](#examples)
-   [Supported casting and conversion](#supported-casting-and-conversion)
-   [See also](#see-also)

The `DECIMAL` [data type](/docs/v26.2/data-types) stores exact, fixed-point numbers. This type is used when it is important to preserve exact precision, for example, with monetary data.

## Aliases

In CockroachDB, the following are aliases for `DECIMAL`:

-   `DEC`
-   `NUMERIC`

## Precision and scale

To limit a decimal column, use `DECIMAL(precision, scale)`, where `precision` is the **maximum** count of digits both to the left and right of the decimal point and `scale` is the **exact** count of digits to the right of the decimal point. The `precision` must not be smaller than the `scale`. Also note that using `DECIMAL(precision)` is equivalent to `DECIMAL(precision, 0)`.

When inserting a decimal value:

-   If digits to the right of the decimal point exceed the column's `scale`, CockroachDB rounds to the scale.
-   If digits to the right of the decimal point are fewer than the column's `scale`, CockroachDB pads to the scale with `0`s.
-   If digits to the left and right of the decimal point exceed the column's `precision`, CockroachDB gives an error.
-   If the column's `precision` and `scale` are identical, the inserted value must round to less than 1.

## Syntax

A constant value of type `DECIMAL` can be entered as a [numeric literal](/docs/v26.2/sql-constants#numeric-literals). For example: `1.414` or `-1234`.

The special IEEE754 values for positive infinity, negative infinity and [NaN (Not-a-Number)](https://wikipedia.org/wiki/NaN) cannot be entered using numeric literals directly and must be converted using an [interpreted literal](/docs/v26.2/sql-constants#interpreted-literals) or an [explicit conversion](/docs/v26.2/scalar-expressions#explicit-type-coercions) from a string literal instead.

The following values are recognized:

| Syntax | Value |
| --- | --- |
| `inf`, `infinity`, `+inf`, `+infinity` | +∞ |
| `-inf`, `-infinity` | -∞ |
| `nan` | [NaN (Not-a-Number)](https://wikipedia.org/wiki/NaN) |

For example:

-   `DECIMAL '+Inf'`
-   `'-Inf'::DECIMAL`
-   `CAST('NaN' AS DECIMAL)`

## Size

The size of a `DECIMAL` value is variable, starting at 9 bytes. It's recommended to keep values under 64 kilobytes to ensure performance. Above that threshold, [write amplification](/docs/v26.2/architecture/storage-layer#write-amplification) and other considerations may cause significant performance degradation.

## Examples

icon/buttons/copy

```sql
CREATE TABLE decimals (a DECIMAL PRIMARY KEY, b DECIMAL(10,5), c NUMERIC);
```

icon/buttons/copy

```sql
SHOW COLUMNS FROM decimals;
```

```
column_name |   data_type   | is_nullable | column_default | generation_expression |  indices  | is_hidden
--------------+---------------+-------------+----------------+-----------------------+-----------+------------
  a           | DECIMAL       |    false    | NULL           |                       | {primary} |   false
  b           | DECIMAL(10,5) |    true     | NULL           |                       | {primary} |   false
  c           | DECIMAL       |    true     | NULL           |                       | {primary} |   false
(3 rows)
```

icon/buttons/copy

```sql
INSERT INTO decimals VALUES (1.01234567890123456789, 1.01234567890123456789, 1.01234567890123456789);
```

icon/buttons/copy

```sql
SELECT * FROM decimals;
```

```
a            |    b    |           c
-------------------------+---------+-------------------------
  1.01234567890123456789 | 1.01235 | 1.01234567890123456789
(1 row)
```

The value in column `a` matches what was inserted exactly. The value in column `b` has been rounded to the column's scale. The value in column `c` is handled like the value in column `a` because `NUMERIC` is an alias for `DECIMAL`.

## Supported casting and conversion

`DECIMAL` values can be [cast](/docs/v26.2/data-types#data-type-conversions-and-casts) to any of the following data types:

| Type | Details |
| --- | --- |
| `INT` | Truncates decimal precision |
| `FLOAT` | Loses precision and may round up to +/- infinity if the value is too large in magnitude, or to +/-0 if the value is too small in magnitude |
| `BOOL` | 0 converts to `false`; all other values convert to `true` |
| `STRING` | –– |

## See also

[Data Types](/docs/v26.2/data-types)
