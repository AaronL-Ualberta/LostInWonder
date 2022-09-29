// by convention, 'get' methods are required to check if the hitbox is valid first.
class Hitbox {
	// container for actual hitboxes
	//static TYPE_CIRCLE = 2;
	constructor(parent, hitbox) {
		this.__parent = parent;
		this.hitbox = null;
		this.type = null;
		this.polygon = null;
		this.forcePolygon = false;
		this.setHitbox(hitbox);
		this.x = 0;
		this.y = 0;
		this.rotation = 0;
		this.sx = 1;
		this.sy = 1;
		this.update();
	}

	setHitbox(hitbox) {
		this.hitbox = hitbox;
		this.hitbox.__setParentHitbox(this);
		this.hitbox.hitboxParent = this;
		this.type = hitbox.type;
		this.polygon = null;
		this.forcePolygon = false;
		if (this.type === Hitbox.TYPE_POLYGON) {
			this.polygon = this.hitbox;
		} else if (this.type === Hitbox.TYPE_RECTANGLE) {
			this.polygon = this.__generatePolygon();
			this.polygon.__setParentHitbox(this);
		}
	}

	__invalidate(invalidator) {
		if (invalidator !== Hitbox.TYPE_POLYGON) {
			this.polygon = this.__generatePolygon();
			this.polygon.__setParentHitbox(this);
		}
		this.update();
	}

	__generatePolygon() {
		var tl = this.hitbox.getTopLeft();
		var br = this.hitbox.getBottomRight();
		return new PolygonHitbox(
			new Vertex(tl.x, tl.y),
			new Vertex(br.x, tl.y),
			new Vertex(br.x, br.y),
			new Vertex(tl.x, br.y)
		);
	}

	getOriginalType() {
		return this.type;
	}

	getType() {
		return this.getHitbox().getType();
	}

	getHitbox() {
		return this.rotation !== 0 ? this.polygon : this.hitbox;
	}

	getPolygonHitbox() {
		if (this.getOriginalType() === Hitbox.TYPE_POLYGON) {
			return this.hitbox;
		}

		if (this.rotation === 0) {
			this.polygon.__validate(this);
		}
		return this.polygon;
	}

	setLocation(x, y) {
		this.x = x;
		this.y = y;
	}

	setScaleX(sx) {
		this.sx = sx;
	}

	setScaleY(sy) {
		this.sy = sy;
	}

	setRotation(theta) {
		this.rotation = theta;
	}

	distanceToHitboxSq(hitbox) {
		var hb = hitbox.getPolygonHitbox();
		return this.getPolygonHitbox().distanceToHitboxSq(hb);
	}

	distanceToPointSq(x, y) {
		return this.getPolygonHitbox().distanceToPointSq(new EngineLightweightPoint(x, y));
	}

	doCollision(hitbox, x, y) {
		// does collision directly, ignores bounding box
		var test = this.__getApplicableTest(hitbox);
		if (test === Hitbox.TYPE_POLYGON) {
			return this.__testPolygon(hitbox, x, y);
		}
		return this.__testRectangle(hitbox, x, y);
	}

	boundingBoxContainsPoint(x, y) {
		var bb = this.__getBoundingBox();
		return bb.x1 <= x - this.x && bb.y1 <= y - this.y && x - this.x <= bb.x2 && y - this.y <= bb.y2;
	}

	containsPoint(x, y) {
		return this.getPolygonHitbox().containsPoint(x, y);
	}

	update() {
		this.__match();
		this.getHitbox().__validate(this);
		this.__calculateBoundingBox();
	}

	__match() {
		if (!this.__parent) {
			return;
		}
		this.x = this.__parent.x;
		this.y = this.__parent.y;
		this.sx = this.__parent.xScale;
		this.sy = this.__parent.yScale;
		this.rotation = this.__parent.angle;
	}

	// https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
	checkBoundingBox(hitbox, x, y) {
		var bb = this.__getBoundingBox();
		var other = hitbox.__getBoundingBox();
		return (
			bb.x1 + x < other.x2 + hitbox.x &&
			bb.x2 + x > other.x1 + hitbox.x &&
			bb.y1 + y < other.y2 + hitbox.y &&
			bb.y2 + y > other.y1 + hitbox.y
		);
	}

	checkLineCollision(v1, v2) {
		return this.getPolygonHitbox().collisionLine(v1, v2);
	}

	__getBoundingBox() {
		return this.__boundingBox;
	}

	getBoundingBox() {
		return BaseHitbox.__makeBoundingBox(
			this.__boundingBox.x1 + this.x,
			this.__boundingBox.y1 + this.y,
			this.__boundingBox.x2 + this.x,
			this.__boundingBox.y2 + this.y
		);
	}

	getBoundingBoxLeft() {
		return this.x + this.__boundingBox.x1;
	}

	getBoundingBoxRight() {
		return this.x + this.__boundingBox.x2;
	}

	getBoundingBoxTop() {
		return this.y + this.__boundingBox.y1;
	}

	getBoundingBoxBottom() {
		return this.y + this.__boundingBox.y2;
	}

	__calculateBoundingBox() {
		this.__boundingBox = this.getHitbox().__getBoundingBox();
	}

	__getApplicableTest(hitbox) {
		var c = (this.getHitbox().getType() << 1) | hitbox.getHitbox().getType();
		if (c <= 2) {
			return Hitbox.TYPE_POLYGON;
		}
		return Hitbox.TYPE_RECTANGLE;
	}

	__testPolygon(otherHitbox, x, y) {
		// at least one is polygon and the other is not circle
		var hitbox = this.getPolygonHitbox();
		var hitbox2 = otherHitbox.getPolygonHitbox();
		return hitbox.doCollision(hitbox2, x, y);
	}

	__testRectangle(otherHitbox, x, y) {
		return this.checkBoundingBox(otherHitbox, x, y);
	}
}
Hitbox.TYPE_POLYGON = 0;
Hitbox.TYPE_RECTANGLE = 1;

class BaseHitbox {
	constructor() {
		this.__parentHitbox = null;
	}

	static __makeBoundingBox(X1, Y1, X2, Y2) {
		// utility
		var r = { x1: X1, y1: Y1, x2: X2, y2: Y2 };
		return r;
	}

	__setParentHitbox(parentHitbox) {
		this.__parentHitbox = parentHitbox;
	}

	__getBoundingBox() {
		throw new Error("Get bounding box Not implemented");
	}

	__validate(hitboxContainer) {
		throw new Error("Validate Not implemented");
	}

	distanceToHitboxSq(hitbox) {
		throw new Error("Distance to hitbox squared Not implemented");
	}

	distanceToPointSq(x, y) {
		throw new Error("Distance to point squared Not implemented");
	}

	getType() {
		return this.type;
	}

	boundingBoxContainsPoint(v1) {
		var bb = this.__getBoundingBox();
		return bb.x1 <= v1.x && bb.x2 >= v1.x && bb.y1 <= v1.y && bb.y2 >= v1.y;
	}
}

class PolygonHitbox extends BaseHitbox {
	constructor(...vertices) {
		super();
		this.type = Hitbox.TYPE_POLYGON;
		this.__srcPolygon = new PIXI.Polygon();
		this.__polygon = null;
		this.__bbox = null;
		this.__topLeft = null;
		this.__bottomRight = null;
		for (const v of vertices) {
			this.__srcPolygon.points.push(v.x);
			this.__srcPolygon.points.push(v.y);
		}
		this.__copyFromSrc();
	}

	__copyFromSrc() {
		this.__polygon = this.__srcPolygon.clone();
	}

	getTopLeft() {
		return this.__topLeft;
	}

	getBottomRight() {
		return this.__bottomRight;
	}

	__getBoundingBox() {
		return this.__boundingBox;
	}

	getPoints() {
		var points = [];
		for (var i = 0; i < this.__polygon.points.length; i += 2) {
			const p = this.__polygon.points;
			points.push(new Vertex(p[i], p[i + 1]));
		}
		return points;
	}

	getPolygon() {
		return this.__polygon.clone();
	}

	__validate(hitboxParent) {
		var xMin = 99999,
			xMax = -99999,
			yMin = 99999,
			yMax = -99999;
		var sx = hitboxParent.sx;
		var sy = hitboxParent.sy;
		var rot = hitboxParent.rotation;
		//this.__copyFromSrc(); // rebuild hitbox from ground up.
		var c = Math.cos(rot);
		var s = Math.sin(rot);
		var x;
		var y;
		var srcX;
		var srcY;
		for (var i = 0; i < this.__srcPolygon.points.length; i += 2) {
			srcX = this.__srcPolygon.points[i] * sx;
			srcY = this.__srcPolygon.points[i + 1] * sy;
			x = srcX * c - srcY * s;
			y = srcX * s + srcY * c;

			xMin = Math.min(xMin, x);
			yMin = Math.min(yMin, y);
			xMax = Math.max(xMax, x);
			yMax = Math.max(yMax, y);
			this.__polygon.points[i] = x;
			this.__polygon.points[i + 1] = y;
		}
		this.__topLeft = new EngineLightweightPoint(xMin, yMin);
		this.__bottomRight = new EngineLightweightPoint(xMax, yMax);
		this.__boundingBox = BaseHitbox.__makeBoundingBox(xMin, yMin, xMax, yMax);
	}

	doCollision(otherPoly, x, y) {
		var dx = x - otherPoly.__parentHitbox.x; // dx = x to get from us to them
		var dy = y - otherPoly.__parentHitbox.y;
		var p1 = new EngineLightweightPoint(otherPoly.__polygon.points[0] - dx, otherPoly.__polygon.points[1] - dy); // translate one of their points into our coord. space
		var p2 = new EngineLightweightPoint(this.__polygon.points[0] + dx, this.__polygon.points[1] + dy);
		if (this.__polygon.contains(p1.x, p1.y) || otherPoly.__polygon.contains(p2.x, p2.y)) {
			return true;
		} // one hitbox is in the other
		var ourLen = this.__getNumPoints();
		var otherLen = otherPoly.__getNumPoints();
		// check all of their lines against our lines
		for (var i = 0; i < ourLen; i++) {
			var v1 = this.__getAbsolutePointRel(i, x, y);
			var v2 = this.__getAbsolutePointRel((i + 1) % ourLen, x, y);
			for (var k = 0; k < otherLen; k++) {
				var v3 = otherPoly.__getAbsolutePoint(k);
				var v4 = otherPoly.__getAbsolutePoint((k + 1) % otherLen);
				if (EngineUtils.linesCollide(v1, v2, v3, v4)) return true;
			}
		}
		return false;
	}

	collisionLine(v1, v2) {
		if (this.containsPoint(v1.x, v1.y) || this.containsPoint(v2.x, v2.y)) return true;
		var len = this.__getNumPoints();
		for (var i = 0; i < len; i++) {
			if (EngineUtils.linesCollide(v1, v2, this.__getAbsolutePoint(i), this.__getAbsolutePoint((i + 1) % len))) {
				return true;
			}
		}
		return false;
	}

	distanceToHitboxSq(otherPoly) {
		if (this.doCollision(otherPoly)) {
			return 0;
		}
		var min = 999999999;
		var ourLen = this.__getNumPoints();
		var otherLen = otherPoly.__getNumPoints();
		// check all of their vertices against our hitbox's lines
		for (var i = 0; i < ourLen; i++)
			for (var k = 0; k < otherLen; k++)
				min = Math.min(
					min,
					EngineUtils.distanceToLineSq(
						otherPoly.__getAbsolutePoint(k),
						this.__getAbsolutePoint(i),
						this.__getAbsolutePoint((i + 1) % ourLen)
					)
				);
		// check all of our vertices against their hitbox's lines
		for (var i = 0; i < otherLen; i++)
			for (var k = 0; k < ourLen; k++)
				min = Math.min(
					min,
					EngineUtils.distanceToLineSq(
						this.__getAbsolutePoint(k),
						otherPoly.__getAbsolutePoint(i),
						otherPoly.__getAbsolutePoint((i + 1) % otherLen)
					)
				);
		return min;
	}

	distanceToPointSq(v1) {
		if (this.containsPoint(v1.x, v1.y)) return 0;
		var len = this.__getNumPoints();
		var min = 999999999;
		for (var i = 0; i < len; i++) {
			min = Math.min(
				min,
				EngineUtils.distanceToLineSq(v1, this.__getAbsolutePoint(i), this.__getAbsolutePoint((i + 1) % len))
			);
		}
		return min;
	}

	containsPoint(x, y) {
		var dx = x - this.__parentHitbox.x; // point to us
		var dy = y - this.__parentHitbox.y;
		return this.__polygon.contains(dx, dy);
	}

	__getAbsolutePoint(index) {
		var l = index << 1;
		return new EngineLightweightPoint(
			this.__polygon.points[l] + this.__parentHitbox.x,
			this.__polygon.points[l + 1] + this.__parentHitbox.y
		);
	}

	__getAbsolutePointRel(index, x, y) {
		var l = index << 1;
		return new EngineLightweightPoint(this.__polygon.points[l] + x, this.__polygon.points[l + 1] + y);
	}

	__getNumPoints() {
		return this.__polygon.points.length >> 1;
	}
}

class RectangleHitbox extends BaseHitbox {
	constructor(x1, y1, x2, y2) {
		super();
		this.type = Hitbox.TYPE_RECTANGLE;
		this.type = 1;
		this.sx1 = x1;
		this.sy1 = y1;
		this.sx2 = x2;
		this.sy2 = y2;
		this.x1 = x1;
		this.y1 = y1;
		this.x2 = x2;
		this.y2 = y2;
	}

	getTopLeft() {
		return new EngineLightweightPoint(Math.min(this.x1, this.x2), Math.min(this.y1, this.y2));
	}

	getBottomRight() {
		return new EngineLightweightPoint(Math.max(this.x1, this.x2), Math.max(this.y1, this.y2));
	}

	setBottomRight(x, y) {
		this.sx2 = x;
		this.sy2 = y;
		this.hitboxParent.__invalidate(Hitbox.TYPE_RECTANGLE);
	}

	setTopLeft(x, y) {
		this.sx1 = x;
		this.sy1 = y;
		this.hitboxParent.__invalidate(Hitbox.TYPE_RECTANGLE);
	}

	__getBoundingBox() {
		var tl = this.getTopLeft();
		var br = this.getBottomRight();
		return BaseHitbox.__makeBoundingBox(tl.x, tl.y, br.x, br.y);
	}

	__validate(parentHitbox) {
		var sx = parentHitbox.sx;
		var sy = parentHitbox.sy;
		// rectangles are not allowed rotation...
		this.x1 = this.sx1 * sx;
		this.x2 = this.sx2 * sx;
		this.y1 = this.sy1 * sy;
		this.y2 = this.sy2 * sy;
	}
}

/*
class EllipseHitbox extends BaseHitbox {
    constructor(parent, x, y, radius) {
        super(parent);
        this.type = 2;
        this.x = x;
        this.y = y;
        this.radius = radius;
    }
}
*/
