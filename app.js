const $ = jQuery;

((global) => {
    global.App = {};

    let outerPoints = [];
    let innerPoints = [];

    function getRandomLatLng() {
        let point;

        do {
            point = [
                53.859066 + Math.random() / 500,
                27.581776 + Math.random() / 300
            ];
        } while (points.some(x => Math.abs(x[0] - point[0]) + Math.abs(x[1] - point[1]) < 0.000001));

        return point;
    }

    function middlePoint(p, q) {
        return [(p[0] + q[0])/2, (p[1] + q[1])/2];
    }

    $('#startNew').click(startNew);

    $('#startTest').click(startTest);

    function loadPointsFromFile(input, callback) {
        input.on('change', () => {
            if (!window.FileReader) {
                alert('Этот браузер не поддерживает загрузку из файла');
                return false;
            }

            const _input = input.get(0);

            const reader = new FileReader();
            if (_input.files.length) {
                const textFile = _input.files[0];

                $(reader).on('loadend', () => {
                    callback(
                        reader.result.split('\n').filter(Boolean)
                            .map(x => x.split(',').map(Number).slice(1))
                    );
                });

                reader.readAsText(textFile);
            }
        });
    }

    loadPointsFromFile($('#loadFileOuterPoints'), (points) => {
        outerPoints = points;
        redraw();
    });

    loadPointsFromFile($('#loadFileInnerPoints'), (points) => {
        innerPoints = points;
        redraw();
    });

    $('body').on('click', '.removePoint', (event) => {
        let { pos, type } = event.target.dataset;

        if (!type) {
            const dataset = $(event.target).closest('tr')[0].dataset;
            pos = dataset.pos;
            type = dataset.type;
        }

        const points = type === 'inner' ? innerPoints : outerPoints;
        points.splice(pos, 1);
        redraw();
    });

    $('body').on('click', '.addPoint', (event) => {
        const { pos, type } = $(event.target).closest('tr')[0].dataset;
        const points = type === 'inner' ? innerPoints : outerPoints;
        points.splice(pos, 0, []);
        redraw();
    });

    $('table').on('change', 'input', (event) => {
        const { index } = event.target.dataset;
        const tr = $(event.target).closest('tr');
        const { pos, type } = tr[0].dataset;
        const points = type === 'inner' ? innerPoints : outerPoints;
        if (pos >= points.length) {
            innerPoints.push([]);
            outerPoints.push([]);
        }

        points[pos][index] = +event.target.value;
        redrawMapAndData();
    });

    function redrawMapAndData() {
        const clearOuterPoints = outerPoints.filter(App.Coord.isFullPoint);
        const clearInnerPoints = innerPoints.filter(App.Coord.isFullPoint);

        let minPoint;
        let minValue = Number.MAX_VALUE;

        for (const point of clearOuterPoints.map(App.Coord.toProstr)) {
            const d = Math.distance(point);

            if (d < minValue) {
                minPoint = point;
                minValue = d;
            }
        }

        if (!minPoint) {
            App.PointsData.fillByData([], []);
            App.Map.redraw([], []);
            $('#minPoint').text('');
            $('#volume').text('');
            return;
        }

        const A = minPoint.x, B = minPoint.y, C = minPoint.z, D = -(minValue*minValue);
        const plane = [A, B, C, D];

        $('#minPoint').text(`Минимальная высота: ${JSON.stringify(minPoint)} - ${minValue} метров`);

        const prostrOuterPoints = outerPoints.map((point) => {
            if (!App.Coord.isFullPoint(point)) {
                return null;
            }

            point = App.Coord.toProstr(point);

            return {
                point,
                height: Math.distanceToPlane(point, plane),
            };
        });

        const prostrInnerPoints = innerPoints.map((point) => {
            if (!App.Coord.isFullPoint(point)) {
                return null;
            }

            point = App.Coord.toProstr(point);

            return {
                point,
                height: Math.distanceToPlane(point, plane),
            };
        });

        App.PointsData.fillByData(prostrOuterPoints, prostrInnerPoints);

        let fullV = 0;
        let delaunay = null;
        if (clearOuterPoints.length > 2) {
            const allPoints = [...clearOuterPoints, ...clearInnerPoints];
            delaunay = Delaunator.from(allPoints);

            for (let i = 0; i + 2 < delaunay.triangles.length; i += 3) {
                const [a, b, c] = [delaunay.triangles[i], delaunay.triangles[i+1], delaunay.triangles[i+2]];

                if (
                    !Math.inside(middlePoint(allPoints[a], allPoints[b]), clearOuterPoints) &&
                    !Math.inside(middlePoint(allPoints[a], allPoints[c]), clearOuterPoints) &&
                    !Math.inside(middlePoint(allPoints[b], allPoints[c]), clearOuterPoints)
                ) {
                    continue;
                }

                const a1 = App.Coord.toProstr(allPoints[a]);
                const b1 = App.Coord.toProstr(allPoints[b]);
                const c1 = App.Coord.toProstr(allPoints[c]);

                const a2 = Math.toPlane(a1, plane);
                const b2 = Math.toPlane(b1, plane);
                const c2 = Math.toPlane(c1, plane);

                const da = Math.distanceToPlane(a1, plane, minValue);
                const db = Math.distanceToPlane(b1, plane, minValue);
                const dc = Math.distanceToPlane(c1, plane, minValue);

                const maxD = Math.max(da, db, dc);
                const minD = Math.min(da, db, dc);

                const sA = Math.geron(
                    Math.distance(a2, b2),
                    Math.distance(a2, c2),
                    Math.distance(b2, c2),
                );

                const v = sA * (minD + (maxD-minD) / 3);

                console.log('Треугольник: ', a, b, c, 'Объём: ', v);

                fullV += v;
            }
        }

        $('#volume').text(`Объём: ${fullV}`);

        App.Map.redraw(clearOuterPoints, clearInnerPoints, delaunay, plane);
    }

    function redraw() {
        App.Input.fillByData(outerPoints, innerPoints);
        redrawMapAndData();
    }

    function startNew() {
        outerPoints = [];
        innerPoints = [];
        redraw();
    }

    function startTest() {
        outerPoints = [...TestOuterPoints];
        innerPoints = [...TestInnerPoints];
        redraw();
    }

    function startTestVolume() {
        outerPoints = [
            [
                58.49610664,
                32.74573186,
                0
              ],
              [
                58.49580333,
                32.74609977,
                0
              ],
              [
                58.49578815,
                32.74541407,
                0
              ],
        ];
        innerPoints = [
            [
                58.49589937,
                32.74574859,
                100
            ]
        ];
        redraw();
    }

    $(() => {
        startTestVolume();
    });

})(window);