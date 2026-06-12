---
Source: https://postgis.net/docs/AddGeometryColumn.html
Generated: 2026-06-12
Updated: 2026-06-12
---

# AddGeometryColumn

## Name

AddGeometryColumn — Adds a geometry column to an existing table.

## Synopsis

`text **AddGeometryColumn**(`varchar table\_name, varchar column\_name, integer srid, varchar type, integer dimension, boolean use\_typmod=true`)`;

`text **AddGeometryColumn**(`varchar schema\_name, varchar table\_name, varchar column\_name, integer srid, varchar type, integer dimension, boolean use\_typmod=true`)`;

`text **AddGeometryColumn**(`varchar catalog\_name, varchar schema\_name, varchar table\_name, varchar column\_name, integer srid, varchar type, integer dimension, boolean use\_typmod=true`)`;

## Description

Adds a geometry column to an existing table of attributes. The `schema_name` is the name of the table schema. The `srid` must be an integer value reference to an entry in the SPATIAL\_REF\_SYS table. The `type` must be a string corresponding to the geometry type, eg, 'POLYGON' or 'MULTILINESTRING' . An error is thrown if the schemaname doesn't exist (or not visible in the current search\_path) or the specified SRID, geometry type, or dimension is invalid.

<table>
<tbody>
<tr><td rowspan="2"><img alt="[Note]" src="../images/note.png"></td><th></th></tr>
<tr><td><p>Changed: 2.0.0 This function no longer updates geometry_columns since geometry_columns is a view that reads from system catalogs. It by default also does not create constraints, but instead uses the built in type modifier behavior of PostgreSQL. So for example building a wgs84 POINT column with this function is now equivalent to: <code>ALTER TABLE some_table ADD COLUMN geom geometry(Point,4326);</code></p><p>Changed: 2.0.0 If you require the old behavior of constraints use the default <code>use_typmod</code>, but set it to false.</p></td></tr>
</tbody>
</table>

<table>
<tbody>
<tr><td rowspan="2"><img alt="[Note]" src="../images/note.png"></td><th></th></tr>
<tr><td><p>Changed: 2.0.0 Views can no longer be manually registered in geometry_columns, however views built against geometry typmod tables geometries and used without wrapper functions will register themselves correctly because they inherit the typmod behavior of their parent table column. Views that use geometry functions that output other geometries will need to be cast to typmod geometries for these view geometry columns to be registered correctly in geometry_columns. Refer to <a href="using_postgis_dbmanagement.html#Manual_Register_Spatial_Column" title="4.6.3.&nbsp;Manually Registering Geometry Columns">Section&nbsp;4.6.3, “Manually Registering Geometry Columns”</a>.</p></td></tr>
</tbody>
</table>

![](../images/check.png) This method implements the [OGC Simple Features Implementation Specification for SQL 1.1.](http://www.opengeospatial.org/standards/sfs)

![](../images/check.png) This function supports 3d and will not drop the z-index.

![](../images/check.png) This method supports Circular Strings and Curves.

Enhanced: 2.0.0 use\_typmod argument introduced. Defaults to creating typmod geometry column instead of constraint-based.

## Examples

\-- Create schema to hold data
CREATE SCHEMA my\_schema;
-- Create a new simple PostgreSQL table
CREATE TABLE my\_schema.my\_spatial\_table (id serial);

-- Describing the table shows a simple table with a single "id" column.
postgis=# \\d my\_schema.my\_spatial\_table
							 Table "my\_schema.my\_spatial\_table"
 Column |  Type   |                                Modifiers
--------+---------+-------------------------------------------------------------------------
 id     | integer | not null default nextval('my\_schema.my\_spatial\_table\_id\_seq'::regclass)

-- Add a spatial column to the table
SELECT AddGeometryColumn ('my\_schema','my\_spatial\_table','geom',4326,'POINT',2);

-- Add a point using the old constraint based behavior
SELECT AddGeometryColumn ('my\_schema','my\_spatial\_table','geom\_c',4326,'POINT',2, false);

--Add a curvepolygon using old constraint behavior
SELECT AddGeometryColumn ('my\_schema','my\_spatial\_table','geomcp\_c',4326,'CURVEPOLYGON',2, false);

-- Describe the table again reveals the addition of a new geometry columns.
\\d my\_schema.my\_spatial\_table
                            addgeometrycolumn
---
 my\_schema.my\_spatial\_table.geomcp\_c SRID:4326 TYPE:CURVEPOLYGON DIMS:2
(1 row)

                                    Table "my\_schema.my\_spatial\_table"
  Column  |         Type         |                                Modifiers
----------+----------------------+-------------------------------------------------------------------------
 id       | integer              | not null default nextval('my\_schema.my\_spatial\_table\_id\_seq'::regclass)
 geom     | geometry(Point,4326) |
 geom\_c   | geometry             |
 geomcp\_c | geometry             |
Check constraints:
    "enforce\_dims\_geom\_c" CHECK (st\_ndims(geom\_c) = 2)
    "enforce\_dims\_geomcp\_c" CHECK (st\_ndims(geomcp\_c) = 2)
    "enforce\_geotype\_geom\_c" CHECK (geometrytype(geom\_c) = 'POINT'::text OR geom\_c IS NULL)
    "enforce\_geotype\_geomcp\_c" CHECK (geometrytype(geomcp\_c) = 'CURVEPOLYGON'::text OR geomcp\_c IS NULL)
    "enforce\_srid\_geom\_c" CHECK (st\_srid(geom\_c) = 4326)
    "enforce\_srid\_geomcp\_c" CHECK (st\_srid(geomcp\_c) = 4326)

-- geometry\_columns view also registers the new columns --
SELECT f\_geometry\_column As col\_name, type, srid, coord\_dimension As ndims
    FROM geometry\_columns
    WHERE f\_table\_name = 'my\_spatial\_table' AND f\_table\_schema = 'my\_schema';

 col\_name |     type     | srid | ndims
----------+--------------+------+-------
 geom     | Point        | 4326 |     2
 geom\_c   | Point        | 4326 |     2
 geomcp\_c | CurvePolygon | 4326 |     2

## See Also

[DropGeometryColumn](DropGeometryColumn.html "DropGeometryColumn"), [DropGeometryTable](DropGeometryTable.html "DropGeometryTable"), [Section 4.6.2, “GEOMETRY\_COLUMNS View”](using_postgis_dbmanagement.html#geometry_columns "4.6.2. GEOMETRY_COLUMNS View"), [Section 4.6.3, “Manually Registering Geometry Columns”](using_postgis_dbmanagement.html#Manual_Register_Spatial_Column "4.6.3. Manually Registering Geometry Columns")
