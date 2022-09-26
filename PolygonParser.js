var GEO = G.geometry[character.map]

/*
y line
{
	y
	x left
	x right
}
*/

/*
x line
{
	x
	y top
	y bot
}
*/

var x_min = GEO.min_x;
var y_min = GEO.min_y;
var x_max = GEO.max_x;
var y_max = GEO.max_y;

var lines = [];

for (var i = 0; i < GEO.x_lines.length; i++) {
	var line = GEO.x_lines[i];

	if (line[0] < x_min || line[0] > x_max || line[1] < y_min || line[1] > y_max || line[2] < y_min || line[2] > y_max) {
		continue;
	}

	// draw_line(line[0], line[1], line[0], line[2], 2, 0xff0000);
	lines[lines.length] = { "x1": line[0], "y1": line[1], "x2": line[0], "y2": line[2] };

}

for (var i = 0; i < GEO.y_lines.length; i++) {
	var line = GEO.y_lines[i];

	if (line[0] < y_min || line[0] > y_max || line[1] < x_min || line[1] > x_max || line[2] < x_min || line[2] > x_max) {
		continue;
	}

	// draw_line(line[1], line[0], line[2], line[0], 2, 0xff0000);
	lines[lines.length] = { "x1": line[1], "y1": line[0], "x2": line[2], "y2": line[0] };

}

function removeFromLines(line) {
	const index = lines.indexOf(line);
	if (index > -1) { // only splice array when item is found
		// array.splice(index, 1); // 2nd parameter means remove one item only
		lines[index] = 0;
	}
}

function clearEmptyLines() {
	for (var lineIndex = 0; lineIndex < lines.length; lineIndex++) {
		var line = lines[lineIndex];
		if (line == 0) {
			lines.splice(lineIndex--, 1);
		}
	}
}

// takes line "struct" {x1, y1, x2, y2}
function drawLine(line, color) {
	// comment out if don't want to draw lines along polygons
	draw_line(line.x1, line.y1, line.x2, line.y2, 2, color);
}

var polygons = [];

// check if line has already been check, if line is in polygons array return true
function isLineInPolygons(line) {
	for (var polygonIndex = 0; polygonIndex < polygons.length; polygonIndex++) {
		for (var lineIndex = 0; lineIndex < polygons[polygonIndex].length; lineIndex++) {
			if (line == polygons[polygonIndex][lineIndex]) {
				return true;
			}
		}
	}
	return false;
}

function doLinesCollide(line, line2) {
	if (line.x1 == line.x2) // line is vertical
	{
		if (line2.x1 == line2.x2) //line2 is veritcal
		{
			if ((line.y1 >= line2.y1 && line.y1 <= line2.y2) || (line2.y1 >= line.y1 && line2.y1 <= line.y2)) {
				if (line.x1 == line2.x1) {
					return true;
				}
			}
		}
		else //line2 horizontal
		{
			if ((line.x1 >= line2.x1 && line.x1 <= line2.x2)) {
				if ((line.y1 <= line2.y1 && line.y2 >= line2.y2)) {
					return true;
				}
			}
		}
	}
	else // line is horizontal
	{
		if (line2.x1 == line2.x2) //line2 is veritcal
		{
			if ((line.x1 <= line2.x1 && line.x2 >= line2.x2)) {
				if ((line.y1 >= line2.y1 && line.y2 <= line2.y2)) {
					return true;
				}
			}
		}
		else //line2 horizontal
		{
			if ((line.x1 >= line2.x1 && line.x1 <= line2.x2) || (line2.x1 >= line.x1 && line2.x1 <= line.x2)) {
				if (line.y1 == line2.y1) {
					return true;
				}
			}
		}
	}
	return false;
}

var color = 1;
var color_incr = Math.ceil(16777216 / (lines.length - 1));

function findNextLineRec(prevLine, line, originLine) {
	for (var lineIndex = 0; lineIndex < lines.length; lineIndex++) {
		var nextLine = lines[lineIndex]
		if (line == nextLine) {
			continue;
		}
		if (prevLine == nextLine) {
			continue;
		}
		if (nextLine == originLine) {
			continue;
		}
		if (line == 0) {
			continue;
		}

		if (doLinesCollide(line, nextLine)) {
			polygons[polygons.length - 1].push(nextLine);
			removeFromLines(nextLine);
			drawLine(nextLine, color);
			findNextLineRec(line, nextLine, originLine);
		}

	}
}

function findNextLine(line) {
	polygons.push([line]);
	drawLine(line, color);
	removeFromLines(line);

	for (var lineIndex = 0; lineIndex < lines.length; lineIndex++) {
		var nextLine = lines[lineIndex]
		if (line == nextLine) {
			continue;
		}
		if (line == 0) {
			continue;
		}

		if (doLinesCollide(line, nextLine)) {
			polygons[polygons.length - 1].push(nextLine);
			drawLine(nextLine, color)
			removeFromLines(nextLine);
			findNextLineRec(line, nextLine, line);
			color += color_incr;

			clearEmptyLines();

			return;
		}

	}
}

for (var lineIndex = 0; lineIndex < lines.length; lineIndex++) {
	var line = lines[lineIndex];

	findNextLine(line);
}

for (var polygonIndex = 0; polygonIndex < polygons.length; polygonIndex++) {

	var sidesCopy = polygons[polygonIndex]
	polygons[polygonIndex] = { "sides": sidesCopy, "highest": 0, "lowest": 0, "leftist": 0, "rightest": 0 };

	var polygon = polygons[polygonIndex];
	for (var sideIndex = 0; sideIndex < polygon.sides.length; sideIndex++) {
		var side = polygon.sides[sideIndex];
		if (side.x1 < polygon.leftist) {
			polygon.leftist = side.x1
		}
		if (side.x1 > polygon.rightest) {
			polygon.rightest = side.x1
		}
		if (side.y1 < polygon.highest) {
			polygon.highest = side.y1;
		}
		if (side.y1 > polygon.lowest) {
			polygon.lowest = side.y1;
		}
		if (side.x2 < polygon.leftist) {
			polygon.leftist = side.x2
		}
		if (side.x2 > polygon.rightest) {
			polygon.rightest = side.x2
		}
		if (side.y2 < polygon.highest) {
			polygon.highest = side.y2;
		}
		if (side.y2 > polygon.lowest) {
			polygon.lowest = side.y2;
		}
	}
}

var map_border_polygonIndex = -1;

function isPointInPolygon(x, y) {
	var pointRay = { "x1": x, "y1": y, "x2": GEO.max_x, "y2": y };

	for (var polygonIndex = 0; polygonIndex < polygons.length; polygonIndex++) {
		var polygon = polygons[polygonIndex];

		if (x < polygon.leftist || x > polygon.rightest || y > polygon.lowest || y < polygon.highest) {
			continue;
		}

		var collideCount = 0;

		var sidesCollidedWith = []

		for (var sideIndex = 0; sideIndex < polygon.sides.length; sideIndex++) {
			var side = polygon.sides[sideIndex];
			if (doLinesCollide(pointRay, side)) {
				collideCount++;
				sidesCollidedWith.push(sideIndex)
			}
		}
		if (collideCount % 2 == 1 && polygonIndex != map_border_polygonIndex) {
			return polygonIndex;
		}
		// comment out this else if for better performance, any point outside of the main border will return pathable/walkable
		else if (polygonIndex == map_border_polygonIndex && collideCount % 2 == 0) {
			for (var sidesCollidedWithIndex = 0; sidesCollidedWithIndex < sidesCollidedWith.length - 2; sidesCollidedWithIndex++) {
				if (sidesCollidedWith[sidesCollidedWithIndex] + 1 == sidesCollidedWith[sidesCollidedWithIndex + 1] && sidesCollidedWith[sidesCollidedWithIndex] + 2 == sidesCollidedWith[sidesCollidedWithIndex + 2]) {
					collideCount--;
					break;
				}
			}
			if (polygonIndex == map_border_polygonIndex && collideCount % 2 == 0) {
				return polygonIndex;
			}
		}
	}
	return -1
}

// used to determin main polygon border, the maps outer boundaries
map_border_polygonIndex = isPointInPolygon(Math.ceil(character.x) + 0.5, Math.ceil(character.y) + 0.5);


// examples
// will (hopefully) return false
isPointInPolygon(character.x, character.y);

// will return false because ray cast doesn't collide with any polygons
// even though point is (probably) way outside the map
// could become a todo
isPointInPolygon(10000, 10000);

// will return true if point is inside a tree, building, or on a cliff
