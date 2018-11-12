((Math) => {

    function inside(point, vs) {
        // ray-casting algorithm based on
        // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

        var x = point[0], y = point[1];

        var inside = false;
        for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
            var xi = vs[i][0], yi = vs[i][1];
            var xj = vs[j][0], yj = vs[j][1];

            var intersect = ((yi > y) != (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }

        return inside;
    }
    Math.inside = inside;

    // Подсчитывает координаты точки пересечения перпендикуляра из точки и плоскости
    function toPlane({ x, y, z }, [A, B, C, D]) {
        const t = -1 * (A*x+B*y+C*z+D) / (A*A+B*B+C*C);
        return {
            x: x + t*A,
            y: y + t*B,
            z: z + t*C,
        };
    }
    Math.toPlane = toPlane;

    // Подсчитывает площадь треугольника
    function geron(a, b, c) {
        const p = (a+b+c)/2;
        return Math.sqrt(p*(p-a)*(p-b)*(p-c));
    }
    Math.geron = geron;

    // Расстояние между двумя точками
    function distance(a, b) {
        if (!b) {
            return Math.sqrt(a.x*a.x+a.y*a.y+a.z*a.z);
        }

        return Math.sqrt(Math.pow(a.x-b.x, 2) + Math.pow(a.y-b.y, 2) + Math.pow(a.z-b.z, 2));
    }
    Math.distance = distance;

    function distanceToPlane(point, [A, B, C, D], minValue = Math.sqrt(A*A + B*B + C*C)) {
        return Math.abs(A*point.x + B*point.y + C*point.z + D) / minValue
    }
    Math.distanceToPlane = distanceToPlane;

})(window.Math);
