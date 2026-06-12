---
Source: https://www.postgresql.org/docs/current/datatype-enum.html
Generated: 2026-06-12
Updated: 2026-06-12
---

# 8.7. Enumerated Types #

June 4, 2026: [PostgreSQL 19 Beta 1 Released!](/about/news/postgresql-19-beta-1-released-3313/)

[Documentation](/docs/ "Documentation") → [PostgreSQL 18](/docs/18/index.html)

Supported Versions: [Current](/docs/current/datatype-enum.html "PostgreSQL 18 - 8.7. Enumerated Types") ([18](/docs/18/datatype-enum.html "PostgreSQL 18 - 8.7. Enumerated Types")) / [17](/docs/17/datatype-enum.html "PostgreSQL 17 - 8.7. Enumerated Types") / [16](/docs/16/datatype-enum.html "PostgreSQL 16 - 8.7. Enumerated Types") / [15](/docs/15/datatype-enum.html "PostgreSQL 15 - 8.7. Enumerated Types") / [14](/docs/14/datatype-enum.html "PostgreSQL 14 - 8.7. Enumerated Types")

Development Versions: [19](/docs/19/datatype-enum.html "PostgreSQL 19 - 8.7. Enumerated Types") / [devel](/docs/devel/datatype-enum.html "PostgreSQL devel - 8.7. Enumerated Types")

Unsupported versions: [13](/docs/13/datatype-enum.html "PostgreSQL 13 - 8.7. Enumerated Types") / [12](/docs/12/datatype-enum.html "PostgreSQL 12 - 8.7. Enumerated Types") / [11](/docs/11/datatype-enum.html "PostgreSQL 11 - 8.7. Enumerated Types") / [10](/docs/10/datatype-enum.html "PostgreSQL 10 - 8.7. Enumerated Types") / [9.6](/docs/9.6/datatype-enum.html "PostgreSQL 9.6 - 8.7. Enumerated Types") / [9.5](/docs/9.5/datatype-enum.html "PostgreSQL 9.5 - 8.7. Enumerated Types") / [9.4](/docs/9.4/datatype-enum.html "PostgreSQL 9.4 - 8.7. Enumerated Types") / [9.3](/docs/9.3/datatype-enum.html "PostgreSQL 9.3 - 8.7. Enumerated Types") / [9.2](/docs/9.2/datatype-enum.html "PostgreSQL 9.2 - 8.7. Enumerated Types") / [9.1](/docs/9.1/datatype-enum.html "PostgreSQL 9.1 - 8.7. Enumerated Types") / [9.0](/docs/9.0/datatype-enum.html "PostgreSQL 9.0 - 8.7. Enumerated Types") / [8.4](/docs/8.4/datatype-enum.html "PostgreSQL 8.4 - 8.7. Enumerated Types") / [8.3](/docs/8.3/datatype-enum.html "PostgreSQL 8.3 - 8.7. Enumerated Types")

<table width="100%" summary="Navigation header">
<tbody>
<tr><th colspan="5" align="center">8.7.&nbsp;Enumerated Types</th></tr>
<tr><td width="10%" align="left"><a accesskey="p" href="datatype-boolean.html" title="8.6.&nbsp;Boolean Type">Prev</a>&nbsp;</td><td width="10%" align="left"><a accesskey="u" href="datatype.html" title="Chapter&nbsp;8.&nbsp;Data Types">Up</a></td><th width="60%" align="center">Chapter&nbsp;8.&nbsp;Data Types</th><td width="10%" align="right"><a accesskey="h" href="index.html" title="PostgreSQL 18.4 Documentation">Home</a></td><td width="10%" align="right">&nbsp;<a accesskey="n" href="datatype-geometric.html" title="8.8.&nbsp;Geometric Types">Next</a></td></tr>
</tbody>
</table>

* * *

## 8.7. Enumerated Types [#](#DATATYPE-ENUM)

Enumerated (enum) types are data types that comprise a static, ordered set of values. They are equivalent to the `enum` types supported in a number of programming languages. An example of an enum type might be the days of the week, or a set of status values for a piece of data.

### 8.7.1. Declaration of Enumerated Types [#](#DATATYPE-ENUM-DECLARATION)

Enum types are created using the [CREATE TYPE](sql-createtype.html "CREATE TYPE") command, for example:

CREATE TYPE mood AS ENUM ('sad', 'ok', 'happy');

Once created, the enum type can be used in table and function definitions much like any other type:

CREATE TYPE mood AS ENUM ('sad', 'ok', 'happy');
CREATE TABLE person (
    name text,
    current\_mood mood
);
INSERT INTO person VALUES ('Moe', 'happy');
SELECT \* FROM person WHERE current\_mood = 'happy';
 name | current\_mood
------+--------------
 Moe  | happy
(1 row)

### 8.7.2. Ordering [#](#DATATYPE-ENUM-ORDERING)

The ordering of the values in an enum type is the order in which the values were listed when the type was created. All standard comparison operators and related aggregate functions are supported for enums. For example:

INSERT INTO person VALUES ('Larry', 'sad');
INSERT INTO person VALUES ('Curly', 'ok');
SELECT \* FROM person WHERE current\_mood > 'sad';
 name  | current\_mood
-------+--------------
 Moe   | happy
 Curly | ok
(2 rows)

SELECT \* FROM person WHERE current\_mood > 'sad' ORDER BY current\_mood;
 name  | current\_mood
-------+--------------
 Curly | ok
 Moe   | happy
(2 rows)

SELECT name
FROM person
WHERE current\_mood = (SELECT MIN(current\_mood) FROM person);
 name
---
 Larry
(1 row)

### 8.7.3. Type Safety [#](#DATATYPE-ENUM-TYPE-SAFETY)

Each enumerated data type is separate and cannot be compared with other enumerated types. See this example:

CREATE TYPE happiness AS ENUM ('happy', 'very happy', 'ecstatic');
CREATE TABLE holidays (
    num\_weeks integer,
    happiness happiness
);
INSERT INTO holidays(num\_weeks,happiness) VALUES (4, 'happy');
INSERT INTO holidays(num\_weeks,happiness) VALUES (6, 'very happy');
INSERT INTO holidays(num\_weeks,happiness) VALUES (8, 'ecstatic');
INSERT INTO holidays(num\_weeks,happiness) VALUES (2, 'sad');
ERROR:  invalid input value for enum happiness: "sad"
SELECT person.name, holidays.num\_weeks FROM person, holidays
  WHERE person.current\_mood = holidays.happiness;
ERROR:  operator does not exist: mood = happiness

If you really need to do something like that, you can either write a custom operator or add explicit casts to your query:

SELECT person.name, holidays.num\_weeks FROM person, holidays
  WHERE person.current\_mood::text = holidays.happiness::text;
 name | num\_weeks
------+-----------
 Moe  |         4
(1 row)

### 8.7.4. Implementation Details [#](#DATATYPE-ENUM-IMPLEMENTATION-DETAILS)

Enum labels are case sensitive, so `'happy'` is not the same as `'HAPPY'`. White space in the labels is significant too.

Although enum types are primarily intended for static sets of values, there is support for adding new values to an existing enum type, and for renaming values (see [ALTER TYPE](sql-altertype.html "ALTER TYPE")). Existing values cannot be removed from an enum type, nor can the sort ordering of such values be changed, short of dropping and re-creating the enum type.

An enum value occupies four bytes on disk. The length of an enum value's textual label is limited by the `NAMEDATALEN` setting compiled into PostgreSQL; in standard builds this means at most 63 bytes.

The translations from internal enum values to textual labels are kept in the system catalog [`pg_enum`](catalog-pg-enum.html "52.20. pg_enum"). Querying this catalog directly can be useful.

* * *

| [Prev](datatype-boolean.html) | [Up](datatype.html) | [Next](datatype-geometric.html) |
| --- | --- | --- |
| 8.6. Boolean Type | [Home](index.html) | 8.8. Geometric Types |

## Submit correction

If you see anything in the documentation that is not correct, does not match your experience with the particular feature or requires further clarification, please use [this form](/account/comments/new/18/datatype-enum.html/) to report a documentation issue.
