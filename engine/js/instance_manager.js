/**
 * Collision checking and general interactions with other instances.
 * All collision functions take in one of 4 possible values for ...targets:
 * (EngineInstance, instance of EngineInstance, instance.id, instance.oid).
 * It is recommended to only use the first two options.
 */
class IM {
	constructor() {
		throw "Cannot instantiate static class.";
	}

	static __initializeVariables() {
		IM.__objects = [];
		for (var i = 0; i < IM.__numRegisteredClasses; i++) {
			IM.__accessMap[i + 1] = []; // +1 because Instance is given an entry, but isn't counted in the class count.
		}
		IM.__alteredLists[i] = false;
		IM.ind = 100000;
		IM.__spatialLookup = new Map();
		for (const instance of IM.__persistentObjects) {
			IM.__add(instance);
			instance.__updateHitbox();
		}
	}

	static __init(instances) {
		// assumed instances is a list of classes.
		IM.__numRegisteredClasses = instances.length; // DOES NOT INCLUDE ENGINEINSTANCE!
		IM.__accessMap = [[]];
		IM.__oidToClass = [null, EngineInstance];
		IM.__accessMap.push([]);
		EngineInstance.__oid = 1;
		IM.__childMap = [undefined];
		IM.__childMap[1] = IM.__childTree;
		var id = 2;
		for (const x of instances) {
			IM.__accessMap.push([]);
			IM.__oidToClass.push(x);
			x.__oid = id++;
		}

		// find the deepest instance in the tree that is a parent of target
		var returnDeepest = function (target, result) {
			if (result.__children === undefined) {
				return result;
			}
			for (const tree of result.__children) {
				if (target.prototype instanceof tree.__oid) {
					return returnDeepest(target, tree);
				}
			}

			return result;
		};

		// check if any child in children is a subclass of newParent, if it is, bind it to the
		// newParent instead of it's previous parent (ensure only direct subclasses are in __children)
		var rebind = function (newParent, children) {
			for (let i = 0; i < children.length; i++) {
				if (children[i].__oid.prototype instanceof newParent.__oid) {
					let t = children[i];
					children.splice(i--, 1);
					if (newParent.__children === undefined) {
						newParent.__children = [];
					}
					newParent.__children.push(t);
				}
			}
		};

		instances.forEach((x) => {
			// manage children
			if (x.prototype instanceof EngineInstance) {
				var result = returnDeepest(x, IM.__childTree); // result is the lowest superclass of x

				var r = {
					__oid: x,
					__children: undefined,
				};

				if (result.__children === undefined) {
					result.__children = [];
				} else {
					// check if any children on this level are children of us.
					rebind(r, result.__children);
				}
				result.__children.push(r);
				IM.__childMap[IM.__oidFrom(x)] = r;
			} else {
				throw new Error("Attemping to add non EngineInstance subclass(" + String(x) + ") to IM");
			}
		});

		var rangeLookupId = -1;
		// final step, replace classes with their OID for faster lookup
		var recurseLoop = function (input) {
			if (input === undefined) {
				return;
			}
			for (const x of input) {
				const cls = x.__oid;
				x.__oid = IM.__oidFrom(x.__oid);
				cls.__childHigh = rangeLookupId--;
				recurseLoop(x.__children);
				cls.__childLow = rangeLookupId--;
			}
		};
		EngineInstance.__childHigh = rangeLookupId--;
		recurseLoop(IM.__childTree.__children);
		EngineInstance.__childLow = rangeLookupId--;
		IM.__childTree.__oid = 1;
	}

	static __doSimTick(lastFrame) {
		var mode = $engine.__getPauseMode();
		if (lastFrame) {
			if (mode === 0) {
				// normal mode
				IM.__deleteFromObjects();
				IM.__cleanup();
				IM.__implicit();
				IM.__step();
				IM.__postStep();
				IM.__preDraw();
				IM.__interpolate();
				IM.__draw();
			} else if (mode === 1) {
				// pause
				IM.__pause();
				IM.__draw();
			} else {
				// special pause (mode===2)
				IM.__pause();
				$engine.__pauseSpecialInstance.step(); // run the special instance's step.
				IM.__draw();
			}
		} else {
			if (mode === 0) {
				IM.__deleteFromObjects();
				IM.__cleanup();
				IM.__step();
			}
		}
	}

	static __fullClean(obj) {
		obj.cleanup();
		IM.__freeBuckets(obj);
		$engine.__disposeHandles(obj);
	}

	static __cleanup() {
		for (var i = 0; i < IM.__cleanupList.length; i++) {
			IM.__fullClean(IM.__cleanupList[i]);
		}
		IM.__cleanupList = [];
	}

	static __deleteFromObjects() {
		if (IM.__cleanupList.length !== 0) {
			// don't waste CPU if there's nothing to update...
			IM.__objects = IM.__objects.filter((x) => x.__alive);
			for (var i = 1; i <= IM.__numRegisteredClasses + 1; i++) {
				// only filter lists that were changed
				if (IM.__alteredLists[i]) {
					IM.__accessMap[i] = IM.__accessMap[i].filter((x) => x.__alive);
				}
				IM.__alteredLists[i] = false;
			}
		}
	}

	static __implicit() {
		for (var i = 0; i < IM.__objects.length; i++) {
			IM.__objects[i].__implicit();
		}
	}

	static __step() {
		for (var i = 0; i < IM.__objects.length; i++) {
			IM.__objects[i].step();
		}
	}

	static __postStep() {
		for (var i = 0; i < IM.__objects.length; i++) {
			IM.__objects[i].__postStep();
		}
	}

	static __preDraw() {
		for (var i = 0; i < IM.__objects.length; i++) {
			// this is where you can prepare for draw by checking collisions and such -- draw should only draw
			IM.__objects[i].preDraw();
		}
	}

	static __pause() {
		for (var i = 0; i < IM.__objects.length; i++) {
			IM.__objects[i].pause();
		}
	}

	static __draw() {
		var gui = $engine.__GUIgraphics;
		var camera = $engine.getCamera().getCameraGraphics();
		gui.clear();
		camera.clear();
		// does not actually render anything to the canvas
		for (var i = 0; i < IM.__objects.length; i++) {
			IM.__objects[i].draw(gui, camera);
		}
	}

	static __timescaleImplicit() {
		// called once per step.
		if ($engine.isTimeScaled()) {
			for (var i = 0; i < IM.__objects.length; i++) {
				IM.__objects[i].__timescaleImplicit();
			}
		}
	}

	static __timescaleImmuneStep() {
		for (var i = 0; i < IM.__objects.length; i++) {
			IM.__objects[i].timescaleImmuneStep();
		}
	}

	static __interpolate() {
		// called once per frame, no matter what
		var frac = $engine.getTimescaleFraction();

		if ($engine.isTimeScaled()) {
			for (var i = 0; i < IM.__objects.length; i++) {
				IM.__objects[i].__applyInterpolations(frac);
			}
		} else {
			for (var i = 0; i < IM.__objects.length; i++) {
				IM.__objects[i].__applyInterpolationsNoFraction();
			}
		}
	}

	static __findAll(oid) {
		if (IM.__childMap[oid].__children === undefined) {
			return IM.__accessMap[oid];
		}
		var result = [];
		result.push(...IM.__accessMap[oid]);
		for (const child of IM.__childMap[oid].__children) {
			result.push(...IM.__findAll(child.__oid));
		}
		return result;
	}

	static __findById(id) {
		for (const inst of IM.__objects) {
			if (inst.id === id) {
				return inst;
			}
		}
		return null;
	}

	static __oidFrom(cl) {
		return cl.__oid;
	}

	static __addToWorld(inst) {
		IM.__register(inst);
		IM.__add(inst);
		return inst;
	}

	static __register(inst) {
		var oid = IM.__oidFrom(inst.constructor);
		var low = inst.constructor.__childLow;
		var high = inst.constructor.__childHigh;
		inst.__childLow = low;
		inst.__childHigh = high;
		// readonly
		Object.defineProperty(inst, "oid", { value: oid });
		Object.defineProperty(inst, "id", { value: IM.ind });
		IM.ind++;
	}

	static __add(inst) {
		if (inst.constructor.__ENGINE_ORDER_FIRST) {
			IM.__objects.unshift(inst);
		} else {
			IM.__objects.push(inst);
		}
		//IM.__objectsSorted.push(inst);
		IM.__accessMap[inst.oid].push(inst);
	}

	static __newRuntimeId() {
		return IM.__runtimeId++;
	}

	static __runtimeIdExists(id) {
		return IM.__persistentStore.has(id);
	}

	static __newCollisionIdFor(inst) {
		const cid = IM.__collisionId++;
		if (inst) {
			inst.__collisionId = cid;
		}

		return cid;
	}

	static __endGame() {
		for (const obj of IM.__objects) {
			obj.onRoomEnd();
		}
		for (const obj of IM.__objects) {
			obj.onGameEnd();
		}
		for (const obj of IM.__objects) {
			obj.onDestroy();
		}
		for (const obj of IM.__objects) {
			IM.__fullClean(obj);
		}
	}

	static __startRoom() {
		for (const obj of IM.__objects) {
			obj.__updateHitbox();
		}
		for (const obj of IM.__objects) {
			obj.onRoomStart();
		}
	}

	static __endRoom() {
		for (const obj of IM.__objects) {
			obj.onRoomEnd();
		}
		for (const obj of IM.__objects) {
			if (!obj.__persistent) {
				obj.onDestroy();
			}
		}
		for (const obj of IM.__objects) {
			if (!obj.__persistent) {
				IM.__fullClean(obj);
			}
		}
		IM.__initializeVariables(); // clear IM
	}

	static __queryObjects(val) {
		// returns an array containing the object requested, if the request is invalid the return is an empty array.
		var type = typeof val;
		if (type === "function") {
			return IM.__findAll(IM.__oidFrom(val));
		} else if (type === "object") {
			return [val];
		} else {
			if (val < 100000) {
				return IM.__findAll(val); // oid
			}
			var v = IM.__findById(val); // id
			if (v) return [v];
			return [];
		}
	}

	static __queryOid(val) {
		var type = typeof val;
		if (type === "function") {
			// an object
			return IM.__oidFrom(val);
		} else if (type === "object") {
			return val.oid;
		} else {
			// we have an OID
			if (val < 100000) {
				return val;
			}
			//otherwise, it's an id.
			var v = IM.__findById(val);
			if (v) {
				return v.oid;
			}
			return null;
		}
	}

	static __queryCollisionValue(val) {
		var type = typeof val;
		if (type === "function") {
			return { checkLow: val.__childLow, checkHigh: val.__childHigh, checkId: 0 };
		}
		if (type === "object") {
			return { checkLow: 0, checkHigh: 0, checkId: val.id };
		} else {
			// we have an OID
			if (val < 100000) {
				const cls = IM.__oidToClass[val];
				return { checkLow: cls.__childLow, checkHigh: cls.__childHigh, checkId: 0 };
			} else {
				return { checkLow: 0, checkHigh: 0, checkId: val };
			}
		}
	}

	static __getOrMakeBucket(x, y) {
		const loc = String(x) + " " + String(y);
		var bucket = IM.__spatialLookup.get(loc);
		if (bucket === undefined) {
			bucket = new Set();
			IM.__spatialLookup.set(loc, bucket);
		}
		return bucket;
	}

	static __freeBuckets(obj) {
		for (const entry of obj.__hashbuckets) {
			entry.delete(obj);
		}
	}

	static __hashObjectLocation(obj, bounds, oldBuckets) {
		for (const entry of oldBuckets) {
			entry.delete(obj);
		}
		const buckets = IM.__getBucketsForBounds(bounds);
		for (const b of buckets) {
			b.add(obj);
		}
		return buckets;
	}

	static __getBucketsForObject(obj, x, y) {
		const dx = x - obj.x;
		const dy = y - obj.y;
		const bounds = obj.hitbox.getBoundingBox();
		bounds.x1 += dx;
		bounds.x2 += dx;
		bounds.y1 += dy;
		bounds.y2 += dy;
		return IM.__getBucketsForBounds(bounds);
	}

	static __getBucketsForBounds(bounds) {
		const x1 = Math.floor(bounds.x1 / 128);
		const y1 = Math.floor(bounds.y1 / 128);
		const x2 = Math.floor(bounds.x2 / 128);
		const y2 = Math.floor(bounds.y2 / 128);
		const newBuckets = [];
		for (var xx = x1; xx <= x2; xx++) {
			for (var yy = y1; yy <= y2; yy++) {
				const bucket = IM.__getOrMakeBucket(xx, yy);
				newBuckets.push(bucket);
			}
		}
		return newBuckets;
	}

	/**
	 * Makes the specified instance persistent, meaning it will not be destroyed on room change
	 * and will only spawn once during the entire runtime of the engine if it was created by a room
	 *
	 * @param  {EngineInstance} inst The instance to make persistent
	 */
	static makePersistent(inst) {
		if (inst.__persistent) {
			return;
		}
		inst.__persistent = true;
		IM.__persistentObjects.push(inst);
		if (inst.__runtimeId) {
			IM.__persistentStore.set(inst.__runtimeId, true);
		}
	}

	/**
	 * Queries all targets instanes and then marks them for deletion. Also calls the onDestroy() method immediately.
	 * @param  {...EngineInstance} targets N instances of EngineInstance or classes
	 */
	static destroy(...targets) {
		for (const input of targets)
			for (const inst of IM.__queryObjects(input)) {
				if (inst.__alive) {
					inst.__alive = false;
					inst.onDestroy();

					IM.__cleanupList.push(inst);
					IM.__alteredLists[inst.oid] = true;

					if (inst.__persistent) {
						const idx = IM.__persistentObjects.indexOf(inst);
						IM.__persistentObjects.splice(idx, 1);
					}
				}
			}
	}

	// returns the first target instance that was collided with, or undefined if there were none.
	static __performCollision(source, x, y, targets) {
		var hitbox = source.hitbox;
		const cid = IM.__newCollisionIdFor(source);
		const lst = IM.__getBucketsForObject(source, x, y);
		for (var i = 0; i < targets.length; i++) {
			const { checkLow, checkHigh, checkId } = IM.__queryCollisionValue(targets[i]);
			for (const b of lst) {
				for (var target of b) {
					if (
						target.__collisionId !== cid &&
						((target.__childLow >= checkLow && target.__childHigh <= checkHigh) || target.id === checkId) &&
						hitbox.checkBoundingBox(target.hitbox, x, y) &&
						hitbox.doCollision(target.hitbox, x, y)
					) {
						return target;
					}
					target.__collisionId = cid;
				}
			}
		}
		return undefined;
	}

	/**
	 * Performs a collision with source against the specified targets.
	 * When you call this function, you are asking the engine to move source to x,y and then check if it's colliding with any objects, then move it back
	 * @param {EngineInstance} source The source instance to collide with
	 * @param {Number} x The x position to collide at
	 * @param {Number} y the y position to collide at
	 * @param  {...EngineInstance} targets N instances of EngineInstance or classes
	 * @returns {Boolean} True if there is a collision, false otherwise
	 */
	static instanceCollision(source, x, y, ...targets) {
		return IM.__performCollision(source, x, y, targets) !== undefined;
	}

	/**
	 * Performs a collision with source against the specified targets.
	 * When you call this function, you are asking the engine to move source to x,y and then check if it's colliding with any objects, then move it back
	 * @param {EngineInstance} source The source instance to collide with
	 * @param {Number} x The x position to collide at
	 * @param {Number} y the y position to collide at
	 * @param  {...EngineInstance} targets N instances of EngineInstance or classes
	 * @returns {EngineInstance} The first EngineInstance that is collided with, or undefined if there are none.
	 */
	static instancePlace(source, x, y, ...targets) {
		return IM.__performCollision(source, x, y, targets);
	}

	/**
	 * Performs a collision with source against the specified targets and returns a list of all instances which are colliding with source.
	 * This function is slow because the engine is forced to check all instances. consider other options if you don't need a list.
	 * When you call this function, you are asking the engine to move source to x, y, then check if it's colliding with any objects, then move it back
	 * @param {EngineInstance} source The source instance to collide with
	 * @param {Number} x The x position to collide at
	 * @param {Number} y the y position to collide at
	 * @param  {...EngineInstance} targets N instances of EngineInstance or classes
	 * @returns {EngineInstance} A non null list of all instances that collide with source
	 */
	static instanceCollisionList(source, x, y, ...targets) {
		var results = [];
		var hitbox = source.hitbox;
		const cid = IM.__newCollisionIdFor(source);
		const lst = IM.__getBucketsForObject(source, x, y);
		for (var i = 0; i < targets.length; i++) {
			const { checkLow, checkHigh, checkId } = IM.__queryCollisionValue(targets[i]);
			for (const b of lst) {
				for (var target of b) {
					if (
						target.__collisionId !== cid &&
						((target.__childLow >= checkLow && target.__childHigh <= checkHigh) || target.id === checkId) &&
						hitbox.checkBoundingBox(target.hitbox, x, y) &&
						hitbox.doCollision(target.hitbox, x, y)
					) {
						results.push(target);
					}
					target.__collisionId = cid;
				}
			}
		}
		return results;
	}

	/**
	 * Performs a collision at the specified location using exact hitboxes and finds the first instance of targets which contains that point.
	 * @param {Number} x The x position to collide at
	 * @param {Number} y the y position to collide at
	 * @param  {...EngineInstance} targets N instances of EngineInstance or classes
	 * @returns {EngineInstance} The first EngineInstance that is collided with, or undefined if there is none.
	 */
	static instancePosition(x, y, ...targets) {
		const lst = IM.__getBucketsForBounds({ x1: x, y1: y, x2: x, y2: y });
		const cid = IM.__newCollisionIdFor(null);
		for (var i = 0; i < targets.length; i++) {
			const { checkLow, checkHigh, checkId } = IM.__queryCollisionValue(targets[i]);
			for (var target of lst[0]) {
				if (
					((target.__childLow >= checkLow && target.__childHigh <= checkHigh) || target.id === checkId) &&
					target.hitbox.containsPoint(x, y)
				) {
					return target;
				}
				target.__collisionId = cid;
			}
		}
		return undefined;
	}

	/**
	 * Performs a collision at the specified location using exact hitboxes and determines if any instance of targets contains that point
	 * @param {Number} x The x position to collide at
	 * @param {Number} y the y position to collide at
	 * @param  {...EngineInstance} targets N instances of EngineInstance or classes
	 * @returns {Boolean} True if any instance collides with the point, false otherwise
	 */
	static instanceCollisionPoint(x, y, ...targets) {
		return IM.instancePosition(x, y, ...targets) !== undefined;
	}
	/**
	 * Performs a collision at the specified location using exact hitboxes and returns a list of all instances which are contain x, y.
	 * This function is slow because the engine is forced to check all instances. consider other options if you don't need a list.
	 * @param {Number} x The x position to collide at
	 * @param {Number} y the y position to collide at
	 * @param  {...EngineInstance} targets N instances of EngineInstance or classes
	 * @returns {...EngineInstance} A non null list of all instances that collide with source
	 */
	static instanceCollisionPointList(x, y, ...targets) {
		var result = [];
		const lst = IM.__getBucketsForBounds({ x1: x, y1: y, x2: x, y2: y });
		for (var i = 0; i < targets.length; i++) {
			const { checkLow, checkHigh, checkId } = IM.__queryCollisionValue(targets[i]);
			for (var target of lst[0]) {
				if (
					((target.__childLow >= checkLow && target.__childHigh <= checkHigh) || target.id === checkId) &&
					target.hitbox.containsPoint(x, y)
				) {
					result.push(target);
				}
			}
		}
		return result;
	}

	/**
	 * Queries targets and finds the nearest instance to source. The distance determined is exact and uses hitboxes to find the nearest position on two instances.
	 * As a result, this function is slow. If you don't need exact distance, use instanceNearestPoint.
	 * When you call this function, you are asking the engine to move source to x, y, then find the nearest instance, then move it back
	 * @param {EngineInstance} source The source instance to collide with
	 * @param {Number} x The x position to collide at
	 * @param {Number} y the y position to collide at
	 * @param  {...EngineInstance} targets N instances of EngineInstance or classes
	 * @returns {EngineInstance} The nearest instance of targets, or undefined if no targets exist.
	 */
	static instanceNearest(source, x, y, ...targets) {
		var ox = source.x;
		var oy = source.y;
		source.x = x;
		source.y = y;

		var nearest = undefined;
		var dst = 99999999;
		for (const i of targets) {
			var lst = IM.__queryObjects(i);
			for (const inst of lst) {
				var nDst = source.hitbox.distanceToHitboxSq(inst.hitbox);
				if (nDst < dst) {
					dst = nDst;
					nearest = inst;
					if (nDst === 0) {
						source.x = ox;
						source.y = oy;
						return nearest;
					}
				}
			}
		}
		source.x = ox;
		source.y = oy;
		return nearest;
	}

	/**
	 * Queries targets and finds the nearest instance the point x,y.
	 * Distance is calculated using exact distance to hitboxes.
	 * @param {EngineInstance} source The source instance to collide with
	 * @param {Number} x The x position to collide at
	 * @param {Number} y the y position to collide at
	 * @param  {...EngineInstance} targets N instances of EngineInstance or classes
	 * @returns {EngineInstance} The nearest instance of targets, or undefined if no targets exist.
	 */
	static instanceNearestPoint(x, y, ...targets) {
		var nearest = null;
		var dst = 99999999;
		for (const i of targets) {
			var lst = IM.__queryObjects(i);
			for (const inst of lst) {
				var nDst = inst.hitbox.distanceToPointSq(x, y);
				if (nDst < dst) {
					dst = nDst;
					nearest = inst;
					if (nDst === 0) {
						return nearest;
					}
				}
			}
		}
		return nearest;
	}

	/**
	 * Performs a collision along the line defined by x1,y1,x2,y2. If the line intersects any instance of targets, then the function returns true.
	 * @param {Number} x1 The x coord of the first point
	 * @param {Number} y1 the y coord of the first point
	 * @param {Number} x2 the x coord of the second point
	 * @param {Number} y2 the y coord of the second point
	 * @param  {...EngineInstance} targets N instances of EngineInstance or classes
	 * @returns {EngineInstance} The first EngineInstance that was collided with, or undefined if no targets exist.
	 */
	static instanceCollisionLine(x1, y1, x2, y2, ...targets) {
		var p1 = new EngineLightweightPoint(x1, y1);
		var p2 = new EngineLightweightPoint(x2, y2);
		const cid = IM.__newCollisionIdFor(null);
		for (var i = 0; i < targets.length; i++) {
			const { checkLow, checkHigh, checkId } = IM.__queryCollisionValue(targets[i]);
			const lst = IM.__getBucketsForBounds({ x1: x1, y1: y1, x2: x2, y2: y2 });
			for (const b of lst) {
				for (var target of b) {
					if (
						target.__collisionId !== cid &&
						((target.__childLow >= checkLow && target.__childHigh <= checkHigh) || target.id === checkId) &&
						target.hitbox.checkLineCollision(p1, p2)
					) {
						return target;
					}
					target.__collisionId = cid;
				}
			}
		}
		return undefined;
	}

	/**
	 * Performs a collision along the line defined by x1,y1,x2,y2. Returns a non null list
	 * of all the instances that collided with the line.
	 *
	 * @param {Number} x1 The x coord of the first point
	 * @param {Number} y1 the y coord of the first point
	 * @param {Number} x2 the x coord of the second point
	 * @param {Number} y2 the y coord of the second point
	 * @param  {...EngineInstance} targets N instances of EngineInstance or classes
	 * @returns {...EngineInstance} A non null list of all instances that collide with source
	 */
	static instanceCollisionLineList(x1, y1, x2, y2, ...targets) {
		var result = [];
		var p1 = new EngineLightweightPoint(x1, y1);
		var p2 = new EngineLightweightPoint(x2, y2);
		const cid = IM.__newCollisionIdFor(null);
		for (var i = 0; i < targets.length; i++) {
			const { checkLow, checkHigh, checkId } = IM.__queryCollisionValue(targets[i]);
			const lst = IM.__getBucketsForBounds({ x1: x1, y1: y1, x2: x2, y2: y2 });
			for (const b of lst) {
				for (var target of b) {
					if (
						target.__collisionId !== cid &&
						((target.__childLow >= checkLow && target.__childHigh <= checkHigh) || target.id === checkId) &&
						target.hitbox.checkLineCollision(p1, p2)
					) {
						result.push(target);
					}
					target.__collisionId = cid;
				}
			}
		}
		return result;
	}

	/**
	 * Queries the InstanceManager's internal list of objects and returns the nth instance of type obj, not including subclasses
	 *
	 * This is a constant time operation.
	 * @param {EngineInstance} obj  the class to query
	 * @param {Number} [ind=0] the nth instance to find.
	 * @returns {EngineInstance} The requested instance, or null if unvailable.
	 */
	static findExact(obj, ind = 0) {
		var oid = IM.__oidFrom(obj);
		return IM.__accessMap[oid][ind] || null;
	}

	/**
	 * Finds the nth instance of type obj or a sublcass, ordered by creation time.
	 *
	 * This is a linear time operation
	 *
	 * @param {EngineInstance} obj  the class to query
	 * @param {Number} [ind=0] the nth instance to find.
	 * @returns {EngineInstance} The requested instance, or undefined if unvailable.
	 */
	static find(obj, ind = 0) {
		const { checkLow, checkHigh, checkId } = IM.__queryCollisionValue(obj);
		var current = 0;
		var len = IM.__objects.length;
		for (var i = 0; i < len; i++) {
			const obj = IM.__objects[i];
			if ((obj.__childLow >= checkLow && obj.__childHigh <= checkHigh) || obj.id === checkId) {
				if (current === ind) {
					return obj;
				}
				current++;
			}
		}
		return null;
	}

	/**
	 * Runs the specified function as func(target,other) on all instances that match target.
	 *
	 * Note that 'this' will be undefined in the script. This is done for clarity purposes.
	 * You can still supply the calling instance using other.
	 *
	 * @param {EngineInstance} target The target instance, or class.
	 * @param {Function} script The script to execute
	 * @param {EngineInstance} [other] the calling instance (usually this)
	 */
	static with(target, script, other = undefined) {
		var instances = IM.__queryObjects(target);
		for (const inst of instances) {
			script(inst, other);
		}
	}

	/**
	 * Queries the InstanceManager's internal list of objects and returns all instances that are
	 * of type target or a child or target. The order of the returned instances is that of their creation order.
	 *
	 * This means that the 0th instance will be the oldest instance in the room of type target, and the
	 * n-1th instance is the newest instance.
	 *
	 * @param {...EngineInstance} targets The target instance or class.
	 * @returns A non null array of all the instances that match the specified query.
	 */
	static findAll(...targets) {
		var list = [];
		for (var target of targets) {
			list.push(...IM.__queryObjects(target));
		}
		list.sort((x, y) => x.id - y.id);
		return list;
	}
}

IM.__accessMap = []; // indexes every single instance with oid being the key and an array of all those instances being the value
IM.__alteredLists = []; // whether or not this specific OID has had instances removed (lets us skip filtering objects which haven't been touched)
IM.__childMap = []; // maps each oid to a tree containting all children oid
IM.__childTree = {
	__oid: EngineInstance,
	__children: undefined,
};
IM.__numRegisteredClasses = -1;
IM.__oidToClass = undefined;
IM.__cleanupList = [];
IM.__persistentObjects = [];
IM.__persistentStore = new Map();
IM.__collisionId = 0;
IM.__runtimeId = 1;
IM.__initializeVariables();

/*
class Instance {

}

class t extends Instance{

}

class f extends t {
}

class z extends f {

}

class h extends z {
}

IM.__init([t,h,z,f]);

console.log(IM.__children(IM.__oidFrom(Instance)));
*/
