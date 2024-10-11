import BaseFunc from './baseFunc'
import { transform } from 'ol/proj'

export default class extends BaseFunc {
  constructor({ id, zoom, center, callback, mapType }) {
    super(...arguments)
    this.map = new Map({
      target: id,
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
  }
}
