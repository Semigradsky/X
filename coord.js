((App) => {
    function isFullPoint([lat, lon, alt]) {
        return typeof lat !== 'undefined' && typeof lon !== 'undefined' && typeof alt !== 'undefined' && !isNaN(lat) && !isNaN(lon) && !isNaN(alt);
    }

    function toProstr(point) {
        if (!isFullPoint(point)) {
            return null;
        }

        // old parameters
        const r = 6378136;
        const f = 0.006694366177;

        // const r = 6378137;
        // const f = 1 / 298.257223563;

        const lat = Math.PI * point[0] / 180;
        const lon = Math.PI * point[1] / 180;
        const d = point[2];

        const N = r / Math.pow(1 - f * Math.pow(Math.sin(lat), 2), .5);

        return {
            x: (N + d) * Math.cos(lat) * Math.cos(lon),
            y: (N + d) * Math.cos(lat) * Math.sin(lon),
            z: ((1 - f) * N + d) * Math.sin(lat),
        };
    }

    App.Coord = {
        toProstr,
        isFullPoint,
    };

})(window.App);