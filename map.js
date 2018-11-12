((App) => {
    function nextHalfedge(e) { return (e % 3 === 2) ? e - 2 : e + 1; }
    function prevHalfedge(e) { return (e % 3 === 0) ? e + 2 : e - 1; }

    function forEachTriangleEdge(points, delaunay, callback) {
        for (let e = 0; e < delaunay.triangles.length; e++) {
            if (e > delaunay.halfedges[e]) {
                const p = points[delaunay.triangles[e]];
                const q = points[delaunay.triangles[nextHalfedge(e)]];
                callback(e, p, q);
            }
        }
    }

    const map = L.map('map', {
        preferCanvas: true,
    });
    // L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png").addTo(map);

    const group = new L.featureGroup();

    function redraw(outerPoints, innerPoints, delaunay, plane) {
        group.clearLayers();

        map.eachLayer((layer) => {
            map.removeLayer(layer);
        });

        if (outerPoints.length < 2) {
            return;
        }

        const points = [...outerPoints, ...innerPoints];

        if (delaunay) {
            try {
                forEachTriangleEdge(points, delaunay, (e, p, q) => {
                    const middle = [(p[0] + q[0])/2, (p[1] + q[1])/2];
                    if (!Math.inside(middle, outerPoints)) {
                        return;
                    }

                    L.polyline([
                        p, q
                    ], {
                        color: 'green',
                        weight: 1,
                    }).addTo(map).bindPopup(() => {
                        return `d = ${Math.distance(App.Coord.toProstr(p), App.Coord.toProstr(q))}`;
                    });
                });
            } catch(err) {
                console.error(err);
            }
        }

        if (outerPoints.length > 1) {
            for (let i = 0; i < outerPoints.length; i++) {
                const point1 = outerPoints[i];
                const point2 = outerPoints[i+1] || outerPoints[0];

                L.polyline([
                    point1,
                    point2,
                ], {
                    color: 'blue',
                    weight: 2,
                }).addTo(map).bindPopup(() => {
                    return `d = ${Math.distance(App.Coord.toProstr(point1), App.Coord.toProstr(point2))}`;
                });
            }
        }

        for (let i = 0; i < outerPoints.length; i++) {
            const point = outerPoints[i];

            group.addLayer(
                L.circleMarker(point, {
                    stroke: false,
                    radius: 5,
                    fillOpacity: 1,
                }).addTo(map).bindPopup(() => {
                    const d = Math.distanceToPlane(App.Coord.toProstr(point), plane);

                    return `
                        <div>Точка ${i+1}</div>
                        <div>${point.join(', ')}</div>
                        <div>Расстояние до основания: ${d}</div>
                        <button data-type="outer" data-pos="${i}" class="removePoint">Удалить точку</button>
                    `;
                })
            );
        }

        for (let i = 0; i < innerPoints.length; i++) {
            const point = innerPoints[i];

            group.addLayer(
                L.circleMarker(point, {
                    stroke: false,
                    radius: 5,
                    fillOpacity: 1,
                }).addTo(map).bindPopup(() => {
                    const d = Math.distanceToPlane(App.Coord.toProstr(point), plane);

                    return `
                        <div>Точка ${i+1}</div>
                        <div>${point.join(', ')}</div>
                        <div>Расстояние до основания: ${d}</div>
                        <button data-type="inner" data-pos="${i}" class="removePoint">Удалить точку</button>
                    `;
                })
            );
        }

        const bounds = group.getBounds();
        bounds.isValid() && map.fitBounds(bounds);
    }

    App.Map = {
        redraw,
    };
})(window.App);
