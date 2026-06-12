---
Source: https://www.postgresql.org/docs/current/datatype-geometric.html#DATATYPE-LINE
Generated: 2026-06-12
Updated: 2026-06-12
---

# 8.8. Geometric Types #

June 4, 2026: [PostgreSQL 19 Beta 1 Released!](/about/news/postgresql-19-beta-1-released-3313/)

[Documentation](/docs/ "Documentation") → [PostgreSQL 18](/docs/18/index.html)

Supported Versions: [Current](/docs/current/datatype-geometric.html "PostgreSQL 18 - 8.8. Geometric Types") ([18](/docs/18/datatype-geometric.html "PostgreSQL 18 - 8.8. Geometric Types")) / [17](/docs/17/datatype-geometric.html "PostgreSQL 17 - 8.8. Geometric Types") / [16](/docs/16/datatype-geometric.html "PostgreSQL 16 - 8.8. Geometric Types") / [15](/docs/15/datatype-geometric.html "PostgreSQL 15 - 8.8. Geometric Types") / [14](/docs/14/datatype-geometric.html "PostgreSQL 14 - 8.8. Geometric Types")

Development Versions: [19](/docs/19/datatype-geometric.html "PostgreSQL 19 - 8.8. Geometric Types") / [devel](/docs/devel/datatype-geometric.html "PostgreSQL devel - 8.8. Geometric Types")

Unsupported versions: [13](/docs/13/datatype-geometric.html "PostgreSQL 13 - 8.8. Geometric Types") / [12](/docs/12/datatype-geometric.html "PostgreSQL 12 - 8.8. Geometric Types") / [11](/docs/11/datatype-geometric.html "PostgreSQL 11 - 8.8. Geometric Types") / [10](/docs/10/datatype-geometric.html "PostgreSQL 10 - 8.8. Geometric Types") / [9.6](/docs/9.6/datatype-geometric.html "PostgreSQL 9.6 - 8.8. Geometric Types") / [9.5](/docs/9.5/datatype-geometric.html "PostgreSQL 9.5 - 8.8. Geometric Types") / [9.4](/docs/9.4/datatype-geometric.html "PostgreSQL 9.4 - 8.8. Geometric Types") / [9.3](/docs/9.3/datatype-geometric.html "PostgreSQL 9.3 - 8.8. Geometric Types") / [9.2](/docs/9.2/datatype-geometric.html "PostgreSQL 9.2 - 8.8. Geometric Types") / [9.1](/docs/9.1/datatype-geometric.html "PostgreSQL 9.1 - 8.8. Geometric Types") / [9.0](/docs/9.0/datatype-geometric.html "PostgreSQL 9.0 - 8.8. Geometric Types") / [8.4](/docs/8.4/datatype-geometric.html "PostgreSQL 8.4 - 8.8. Geometric Types") / [8.3](/docs/8.3/datatype-geometric.html "PostgreSQL 8.3 - 8.8. Geometric Types") / [8.2](/docs/8.2/datatype-geometric.html "PostgreSQL 8.2 - 8.8. Geometric Types") / [8.1](/docs/8.1/datatype-geometric.html "PostgreSQL 8.1 - 8.8. Geometric Types") / [8.0](/docs/8.0/datatype-geometric.html "PostgreSQL 8.0 - 8.8. Geometric Types") / [7.4](/docs/7.4/datatype-geometric.html "PostgreSQL 7.4 - 8.8. Geometric Types") / [7.3](/docs/7.3/datatype-geometric.html "PostgreSQL 7.3 - 8.8. Geometric Types") / [7.2](/docs/7.2/datatype-geometric.html "PostgreSQL 7.2 - 8.8. Geometric Types") / [7.1](/docs/7.1/datatype-geometric.html "PostgreSQL 7.1 - 8.8. Geometric Types")

<table width="100%" summary="Navigation header">
<tbody>
<tr><th colspan="5" align="center">8.8.&nbsp;Geometric Types</th></tr>
<tr><td width="10%" align="left"><a accesskey="p" href="datatype-enum.html" title="8.7.&nbsp;Enumerated Types">Prev</a>&nbsp;</td><td width="10%" align="left"><a accesskey="u" href="datatype.html" title="Chapter&nbsp;8.&nbsp;Data Types">Up</a></td><th width="60%" align="center">Chapter&nbsp;8.&nbsp;Data Types</th><td width="10%" align="right"><a accesskey="h" href="index.html" title="PostgreSQL 18.4 Documentation">Home</a></td><td width="10%" align="right">&nbsp;<a accesskey="n" href="datatype-net-types.html" title="8.9.&nbsp;Network Address Types">Next</a></td></tr>
</tbody>
</table>

* * *

## 8.8. Geometric Types [#](#DATATYPE-GEOMETRIC)

Geometric data types represent two-dimensional spatial objects. [Table 8.20](datatype-geometric.html#DATATYPE-GEO-TABLE "Table 8.20. Geometric Types") shows the geometric types available in PostgreSQL.

**Table 8.20. Geometric Types**

| Name | Storage Size | Description | Representation |
| --- | --- | --- | --- |
| `point` | 16 bytes | Point on a plane | (x,y) |
| `line` | 24 bytes | Infinite line | {A,B,C} |
| `lseg` | 32 bytes | Finite line segment | [(x1,y1),(x2,y2)] |
| `box` | 32 bytes | Rectangular box | (x1,y1),(x2,y2) |
| `path` | 16+16n bytes | Closed path (similar to polygon) | ((x1,y1),...) |
| `path` | 16+16n bytes | Open path | [(x1,y1),...] |
| `polygon` | 40+16n bytes | Polygon (similar to closed path) | ((x1,y1),...) |
| `circle` | 24 bytes | Circle | <(x,y),r> (center point and radius) |

In all these types, the individual coordinates are stored as `double precision` (`float8`) numbers.

A rich set of functions and operators is available to perform various geometric operations such as scaling, translation, rotation, and determining intersections. They are explained in [Section 9.11](functions-geometry.html "9.11. Geometric Functions and Operators").

### 8.8.1. Points [#](#DATATYPE-GEOMETRIC-POINTS)

Points are the fundamental two-dimensional building block for geometric types. Values of type `point` are specified using either of the following syntaxes:

```
x
```

where *`x`* and *`y`* are the respective coordinates, as floating-point numbers.

Points are output using the first syntax.

### 8.8.2. Lines [#](#DATATYPE-LINE)

Lines are represented by the linear equation *`A`*x + *`B`*y + *`C`* = 0, where *`A`* and *`B`* are not both zero. Values of type `line` are input and output in the following form:

```
A
```

Alternatively, any of the following forms can be used for input:

```
x1
```

where `(*'x1'*,*'y1'*)` and `(*'x2'*,*'y2'*)` are two different points on the line.

### 8.8.3. Line Segments [#](#DATATYPE-LSEG)

Line segments are represented by pairs of points that are the endpoints of the segment. Values of type `lseg` are specified using any of the following syntaxes:

```
x1
```

where `(*'x1'*,*'y1'*)` and `(*'x2'*,*'y2'*)` are the end points of the line segment.

Line segments are output using the first syntax.

### 8.8.4. Boxes [#](#DATATYPE-GEOMETRIC-BOXES)

Boxes are represented by pairs of points that are opposite corners of the box. Values of type `box` are specified using any of the following syntaxes:

```
x1
```

where `(*'x1'*,*'y1'*)` and `(*'x2'*,*'y2'*)` are any two opposite corners of the box.

Boxes are output using the second syntax.

Any two opposite corners can be supplied on input, but the values will be reordered as needed to store the upper right and lower left corners, in that order.

### 8.8.5. Paths [#](#DATATYPE-GEOMETRIC-PATHS)

Paths are represented by lists of connected points. Paths can be *open*, where the first and last points in the list are considered not connected, or *closed*, where the first and last points are considered connected.

Values of type `path` are specified using any of the following syntaxes:

```
x1
```

where the points are the end points of the line segments comprising the path. Square brackets (`[]`) indicate an open path, while parentheses (`()`) indicate a closed path. When the outermost parentheses are omitted, as in the third through fifth syntaxes, a closed path is assumed.

Paths are output using the first or second syntax, as appropriate.

### 8.8.6. Polygons [#](#DATATYPE-POLYGON)

Polygons are represented by lists of points (the vertices of the polygon). Polygons are very similar to closed paths; the essential semantic difference is that a polygon is considered to include the area within it, while a path is not.

An important implementation difference between polygons and paths is that the stored representation of a polygon includes its smallest bounding box. This speeds up certain search operations, although computing the bounding box adds overhead while constructing new polygons.

Values of type `polygon` are specified using any of the following syntaxes:

```
x1
```

where the points are the end points of the line segments comprising the boundary of the polygon.

Polygons are output using the first syntax.

### 8.8.7. Circles [#](#DATATYPE-CIRCLE)

Circles are represented by a center point and radius. Values of type `circle` are specified using any of the following syntaxes:

```
x
```

where `(*'x'*,*'y'*)` is the center point and *`r`* is the radius of the circle.

Circles are output using the first syntax.

* * *

| [Prev](datatype-enum.html) | [Up](datatype.html) | [Next](datatype-net-types.html) |
| --- | --- | --- |
| 8.7. Enumerated Types | [Home](index.html) | 8.9. Network Address Types |

## Submit correction

If you see anything in the documentation that is not correct, does not match your experience with the particular feature or requires further clarification, please use [this form](/account/comments/new/18/datatype-geometric.html/) to report a documentation issue.
