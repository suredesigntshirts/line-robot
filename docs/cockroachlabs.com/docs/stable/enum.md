---
Source: https://www.cockroachlabs.com/docs/stable/enum
Generated: 2026-06-12
Updated: 2026-06-12
---

# ENUM

On this page ![Carat arrow pointing down](/docs/images/carat-down-fill.svg)

-   [Syntax](#syntax)
-   [Required privileges](#required-privileges)
-   [Example](#example)
-   [Supported casting and conversion](#supported-casting-and-conversion)
    -   [Comparing enumerated types](#comparing-enumerated-types)
-   [See also](#see-also)

A [user-defined `ENUM` data type](/docs/v26.2/create-type#create-an-enumerated-data-type) consists of a set of enumerated, static values.

## Syntax

To declare a new enumerated data type, use [`CREATE TYPE`](/docs/v26.2/create-type#create-an-enumerated-data-type):

```sql
CREATE TYPE <name> AS ENUM ('<value1>', '<value2>', ...);
```

where `<name>` is the name of the new type, and `<value1>, <value2>, ...` are string literals that make up the type's set of static values.

Note:

You can qualify the `<name>` of an enumerated type with a [database and schema name](/docs/v26.2/sql-name-resolution) (e.g., `db.typename`). After the type is created, it can only be referenced from the database that contains the type.

To show all `ENUM` types in the database, including all `ENUMS` created implicitly for [multi-region databases](/docs/v26.2/multiregion-overview), use [`SHOW ENUMS`](/docs/v26.2/show-enums):

icon/buttons/copy

```sql
SHOW ENUMS;
```

To modify an `ENUM` type, use [`ALTER TYPE`](/docs/v26.2/alter-type):

icon/buttons/copy

```sql
ALTER TYPE <name> ADD VALUE '<value>';
```

where `<value>` is a string literal to add to the existing list of type values. You can also use `ALTER TYPE` to rename types, rename type values, set a type's schema, or change the type owner's [role specification](/docs/v26.2/grant).

To drop the type, use [`DROP TYPE`](/docs/v26.2/drop-type):

icon/buttons/copy

```sql
DROP TYPE <name>;
```

## Required privileges

-   To [create a type](/docs/v26.2/create-type) in a database, a user must have the `CREATE` [privilege](/docs/v26.2/security-reference/authorization#managing-privileges) on the database.
-   To [drop a type](/docs/v26.2/drop-type), a user must be the owner of the type.
-   To [alter a type](/docs/v26.2/alter-type), a user must be the owner of the type.
-   To [grant privileges](/docs/v26.2/grant) on a type, a user must have the `GRANT` privilege and the privilege that they want to grant.
-   To create an object that depends on a type, a user must have the `USAGE` privilege on the type.

## Example

icon/buttons/copy

```sql
CREATE TYPE status AS ENUM ('open', 'closed', 'inactive');
```

icon/buttons/copy

```sql
SHOW ENUMS;
```

```
schema |  name  |        value
---------+--------+-----------------------
  public | status | open|closed|inactive
(1 row)
```

icon/buttons/copy

```sql
CREATE TABLE accounts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        balance DECIMAL,
        status status
);
```

icon/buttons/copy

```sql
INSERT INTO accounts(balance,status) VALUES (500.50,'open'), (0.00,'closed'), (1.25,'inactive');
```

icon/buttons/copy

```sql
SELECT * FROM accounts;
```

```
id                  | balance |  status
---------------------------------------+---------+-----------
  3848e36d-ebd4-44c6-8925-8bf24bba957e |  500.50 | open
  60928059-ef75-47b1-81e3-25ec1fb6ff10 |    0.00 | closed
  71ae151d-99c3-4505-8e33-9cda15fce302 |    1.25 | inactive
(3 rows)
```

icon/buttons/copy

```sql
SHOW CREATE TABLE accounts;
```

```
table_name |                create_statement
-------------+--------------------------------------------------
  accounts   | CREATE TABLE public.accounts (
             |     id UUID NOT NULL DEFAULT gen_random_uuid(),
             |     balance DECIMAL NULL,
             |     status public.status NULL,
             |     CONSTRAINT accounts_pkey PRIMARY KEY (id ASC)
             | )
(1 row)
```

## Supported casting and conversion

`ENUM` data type values can be [cast](/docs/v26.2/data-types#data-type-conversions-and-casts) to [`STRING`s](/docs/v26.2/string).

Values can be cast explicitly or implicitly. For example, the following [`SELECT`](/docs/v26.2/select-clause) statements are equivalent:

icon/buttons/copy

```sql
SELECT * FROM accounts WHERE status::STRING='open';
```

```
id                  | balance | status
---------------------------------------+---------+---------
  3848e36d-ebd4-44c6-8925-8bf24bba957e |  500.50 | open
(1 row)
```

icon/buttons/copy

```sql
SELECT * FROM accounts WHERE status='open';
```

```
id                  | balance | status
---------------------------------------+---------+---------
  3848e36d-ebd4-44c6-8925-8bf24bba957e |  500.50 | open
(1 row)
```

### Comparing enumerated types

To compare two enumerated types, you must explicitly cast both types as `STRING`s. For example:

icon/buttons/copy

```sql
CREATE TYPE inaccessible AS ENUM ('closed', 'inactive');
```

icon/buttons/copy

```sql
CREATE TABLE notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        status inaccessible,
        message STRING
);
```

icon/buttons/copy

```sql
INSERT INTO notifications(status, message) VALUES ('closed', 'This account has been closed.'),('inactive', 'This account is on hold.');
```

icon/buttons/copy

```sql
SELECT
    accounts.id, notifications.message
    FROM accounts JOIN notifications ON accounts.status = notifications.status;
```

```
ERROR: unsupported comparison operator: <status> = <inaccessible>
SQLSTATE: 22023
```

icon/buttons/copy

```sql
SELECT
    accounts.id, notifications.message
    FROM accounts JOIN notifications ON accounts.status::STRING = notifications.status;
```

```
ERROR: unsupported comparison operator: <string> = <inaccessible>
SQLSTATE: 22023
```

icon/buttons/copy

```sql
SELECT
    accounts.id, notifications.message
    FROM accounts JOIN notifications ON accounts.status::STRING = notifications.status::STRING;
```

```
id                  |            message
---------------------------------------+--------------------------------
  285336c4-ca1f-490d-b0df-146aae94f5aa | This account is on hold.
  583157d5-4f34-43e5-a4d4-51db77feb391 | This account has been closed.
(2 rows)
```

## See also

-   [Data Types](/docs/v26.2/data-types)
-   [`CREATE TYPE`](/docs/v26.2/create-type)
-   [`ALTER TYPE`](/docs/v26.2/alter-type)
-   [`SHOW ENUMS`](/docs/v26.2/show-enums)
-   [`DROP TYPE`](/docs/v26.2/drop-type)
