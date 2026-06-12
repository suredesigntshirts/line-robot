---
Source: https://postgis.net/docs/ST_MakePoint.html
Generated: 2026-06-12
Updated: 2026-06-12
---

# ST_MakePoint

## Name

ST\_MakePoint — Creates a 2D, 3DZ or 4D Point.

## Synopsis

`geometry **ST_MakePoint**(`float x, float y`)`;

`geometry **ST_MakePoint**(`float x, float y, float z`)`;

`geometry **ST_MakePoint**(`float x, float y, float z, float m`)`;

## Description

Creates a 2D XY, 3D XYZ or 4D XYZM Point geometry. Use [ST\_MakePointM](ST_MakePointM.html "ST_MakePointM") to make points with XYM coordinates.

Use [ST\_SetSRID](ST_SetSRID.html "ST_SetSRID") to specify a SRID for the created point.

While not OGC-compliant, `ST_MakePoint` is faster than [ST\_GeomFromText](ST_GeomFromText.html "ST_GeomFromText") and [ST\_PointFromText](ST_PointFromText.html "ST_PointFromText"). It is also easier to use for numeric coordinate values.

<table>
<tbody>
<tr><td rowspan="2"><img alt="[Note]" src="../images/note.png"></td><th></th></tr>
<tr><td><p>For geodetic coordinates, <code>X</code> is longitude and <code>Y</code> is latitude</p></td></tr>
</tbody>
</table>

<table>
<tbody>
<tr><td rowspan="2"><img alt="[Note]" src="../images/note.png"></td><th></th></tr>
<tr><td><p>The functions <a href="ST_Point.html" title="ST_Point">ST_Point</a>, <a href="ST_PointZ.html" title="ST_PointZ">ST_PointZ</a>, <a href="ST_PointM.html" title="ST_PointM">ST_PointM</a>, and <a href="ST_PointZM.html" title="ST_PointZM">ST_PointZM</a> can be used to create points with a given SRID.</p></td></tr>
</tbody>
</table>

![](../images/check.png) This function supports 3d and will not drop the z-index.

## Examples

\-- Create a point with unknown SRID
SELECT ST\_MakePoint(-71.1043443253471, 42.3150676015829);

-- Create a point in the WGS 84 geodetic CRS
SELECT ST\_SetSRID(ST\_MakePoint(-71.1043443253471, 42.3150676015829),4326);

-- Create a 3D point (e.g. has altitude)
SELECT ST\_MakePoint(1, 2,1.5);

-- Get z of point
SELECT ST\_Z(ST\_MakePoint(1, 2,1.5));
result
---
1.5

## See Also

[ST\_GeomFromText](ST_GeomFromText.html "ST_GeomFromText"), [ST\_PointFromText](ST_PointFromText.html "ST_PointFromText"), [ST\_SetSRID](ST_SetSRID.html "ST_SetSRID"), [ST\_MakePointM](ST_MakePointM.html "ST_MakePointM"), [ST\_Point](ST_Point.html "ST_Point"), [ST\_PointZ](ST_PointZ.html "ST_PointZ"), [ST\_PointM](ST_PointM.html "ST_PointM"), [ST\_PointZM](ST_PointZM.html "ST_PointZM")
