import BaseFunc from './baseFunc'
import Map from 'ol/Map'
import View from 'ol/View'
import { defaults, ScaleLine } from 'ol/control'

export default class extends BaseFunc {
    constructor({ target, center, zoom, callback, mapType }) {
        super(...arguments)
        this.basemap = new Map({
            target: target,
            view: new View({
                center: this.geoToPro(center),
                zoom: zoom,
                minZoom: 0, // 最小缩放级别
                constrainResolution: true, // 因为存在非整数的缩放级别，所以设置该参数为true来让每次缩放结束后自动缩放到距离最近的一个整数级别，这个必须要设置，当缩放在非整数级别时地图会糊
            }),
            controls: defaults().extend([
                new ScaleLine({
                    // 显示比例尺
                    Units: 'metric', // 单位有5种：degrees imperial us nautical metric
                }),
            ]),
        })
        this.coordinate = 'geo'
        this.coordinateType = ['geo', 'pro']
        callback instanceof Function && callback()
    }

    /**
     * 设置中心点
     * @param {Array} positions 中心点或者范围
     * @param {Object} fitOption 移动参数
     */
    setViewRange(positions, fitOption = { duration: 250, maxZoom: 17 }, isGeo = true) {
        let displayRange
        if (typeof positions[0] === 'number') {
            const [long, lat] = isGeo ? this.geoToPro(positions) : positions
            displayRange = [long, lat, long, lat]
        } else {
            displayRange = positions.reduce((prev, cur) => {
                const [long, lat] = cur
                if (!prev[0] || prev[0] > long) prev[0] = long
                if (!prev[1] || prev[1] > lat) prev[1] = lat
                if (!prev[2] || prev[2] < long) prev[2] = long
                if (!prev[3] || prev[3] < lat) prev[3] = lat
                return prev
            }, [])
        }
        this.basemap.getView().fit(displayRange, fitOption)
    }
}
