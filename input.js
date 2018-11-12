((App, tableInnerPoints, tableOuterPoints) => {

    function getRow(point, pos, type, prostrPoint) {
        if (!point) {
            return (
                `<tr data-type="${type}" data-pos="${pos}">
                <td><input data-index="0" type="number"/></td>
                <td><input data-index="1" type="number"/></td>
                <td><input data-index="2" type="number"/></td>
                <td><button class="addPoint">+</button>  <span class="prostr"></span></td>
                </tr>`
            );
        }

        return (
            `<tr data-type="${type}" data-pos="${pos}">
            <td>${pos+1}<input data-index="0" type="number" value="${point[0]}"/></td>
            <td><input data-index="1" type="number" value="${point[1]}"/></td>
            <td><input data-index="2" type="number" value="${point[2]}"/></td>
            <td><button class="addPoint">+</button><button class="removePoint">-</button> <span class="prostr">${prostrPoint ? JSON.stringify(prostrPoint) : ''}</span></td>
            </tr>`
        );
    }

    function fillTableByData(table, points, type) {
        table.html('');
        let newContent = '';
        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            newContent += getRow(point, i, type);
        }
        newContent += getRow(null, points.length, type);
        table.html(newContent);
    }

    function fillByData(outerPoints, innerPoints) {
        fillTableByData(tableOuterPoints, outerPoints, 'outer');
        fillTableByData(tableInnerPoints, innerPoints, 'inner');
    }

    App.Input = {
        fillByData,
    }
})(window.App, $('#tableInnerPoints'), $('#tableOuterPoints'));