---
Source: https://postgis.net/docs/ST_DWithin.html
Generated: 2026-06-12
Updated: 2026-06-12
---

# ST_DWithin

## Name

ST\_DWithin — Tests if two geometries are within a given distance

## Synopsis

`boolean **ST_DWithin**(`geometry g1, geometry g2, double precision distance\_of\_srid`)`;

`boolean **ST_DWithin**(`geography gg1, geography gg2, double precision distance\_meters, boolean use\_spheroid = true`)`;

## Description

Returns true if the geometries are within a given distance

For geometry: The distance is specified in units defined by the spatial reference system of the geometries. For this function to make sense, the source geometries must be in the same coordinate system (have the same SRID).

For geography: units are in meters and distance measurement defaults to `use_spheroid = true`. For faster evaluation use `use_spheroid = false` to measure on the sphere.

<table>
<tbody>
<tr><td rowspan="2"><img alt="[Note]" src="../images/note.png"></td><th></th></tr>
<tr><td><p>Use <a href="ST_3DDWithin.html" title="ST_3DDWithin">ST_3DDWithin</a> for 3D geometries.</p></td></tr>
</tbody>
</table>

<table>
<tbody>
<tr><td rowspan="2"><img alt="[Note]" src="../images/note.png"></td><th></th></tr>
<tr><td><p>This function call includes a bounding box comparison that makes use of any indexes that are available on the geometries.</p></td></tr>
</tbody>
</table>

![](../images/check.png) This method implements the [OGC Simple Features Implementation Specification for SQL 1.1.](http://www.opengeospatial.org/standards/sfs)

Availability: 1.5.0 support for geography was introduced

Enhanced: 2.1.0 improved speed for geography. See [Making Geography faster](https://web.archive.org/web/20160827203903/http://boundlessgeo.com/2012/07/making-geography-faster/) for details.

Enhanced: 2.1.0 support for curved geometries was introduced.

Prior to 1.3, [ST\_Expand](ST_Expand.html "ST_Expand") was commonly used in conjunction with && and ST\_Distance to test for distance, and in pre-1.3.4 this function used that logic. From 1.3.4, ST\_DWithin uses a faster short-circuit distance function.

## Examples

\-- Find the nearest hospital to each school
-- that is within 3000 units of the school.
--  We do an ST\_DWithin search to utilize indexes to limit our search list
--  that the non-indexable ST\_Distance needs to process
-- If the units of the spatial reference is meters then units would be meters
SELECT DISTINCT ON (s.gid) s.gid, s.school\_name, s.geom, h.hospital\_name
  FROM schools s
    LEFT JOIN hospitals h ON ST\_DWithin(s.geom, h.geom, 3000)
  ORDER BY s.gid, ST\_Distance(s.geom, h.geom);

-- The schools with no close hospitals
-- Find all schools with no hospital within 3000 units
-- away from the school.  Units is in units of spatial ref (e.g. meters, feet, degrees)
SELECT s.gid, s.school\_name
  FROM schools s
    LEFT JOIN hospitals h ON ST\_DWithin(s.geom, h.geom, 3000)
  WHERE h.gid IS NULL;

-- Find broadcasting towers that receiver with limited range can receive.
-- Data is geometry in Spherical Mercator (SRID=3857), ranges are approximate.

-- Create geometry index that will check proximity limit of user to tower
CREATE INDEX ON broadcasting\_towers using gist (geom);

-- Create geometry index that will check proximity limit of tower to user
CREATE INDEX ON broadcasting\_towers using gist (ST\_Expand(geom, sending\_range));

-- Query towers that 4-kilometer receiver in Minsk Hackerspace can get
-- Note: two conditions, because shorter LEAST(b.sending\_range, 4000) will not use index.
SELECT b.tower\_id, b.geom
  FROM broadcasting\_towers b
  WHERE ST\_DWithin(b.geom, 'SRID=3857;POINT(3072163.4 7159374.1)', 4000)
    AND ST\_DWithin(b.geom, 'SRID=3857;POINT(3072163.4 7159374.1)', b.sending\_range);

## See Also

[ST\_Distance](ST_Distance.html "ST_Distance"), [ST\_3DDWithin](ST_3DDWithin.html "ST_3DDWithin")
