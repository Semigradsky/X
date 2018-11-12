((App, tableInnerPoints, tableOuterPoints) => {

    function getRow(pointData) {
        if (!pointData) {
            return '<tr></tr>';
        }

        return (
            `<tr class="${Math.round(pointData.height*100) === 0 ? 'zero' : ''}">
            <td>${Math.round(pointData.height*100)} см</td>
            <td>${pointData.point ? JSON.stringify(pointData.point) : ''}</td>
            </tr>`
        );
    }

    function fillTableByData(table, pointsData) {
        table.html('');
        let newContent = '';
        for (let i = 0; i < pointsData.length; i++) {
            newContent += getRow(pointsData[i]);
        }
        table.html(newContent);
    }

    function fillByData(outerPointsData, innerPointsData) {
        fillTableByData(tableOuterPoints, outerPointsData);
        fillTableByData(tableInnerPoints, innerPointsData);
    }

    App.PointsData = {
        fillByData,
    }
})(window.App, $('#tableInnerPointsData'), $('#tableOuterPointsData'));