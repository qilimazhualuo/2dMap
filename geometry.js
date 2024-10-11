import { Feature } from 'ol'
import { Point } from 'ol/geom'
import { Style, Icon, Stroke } from 'ol/style'

import Base from './base'

export default class extends Base {
  constructor() {
    super(...arguments)
  }

  createPoint = (options, layerId) => {
    // 拿到source
    let { lat, long, src } = options
    let layer = this.layers[layerId]
    if (layer) {
      let id = this.guid()
      let source = layer.getSource()
      let feature = new Feature({
        id,
        geometry: new Point(this.geoToPro({ lat, long })),
      })
      let featureStyle = new Style({
        image: new Icon({
          src: src,
        }),
      })
      feature.setStyle(featureStyle)
      source.addFeature(feature)
      return { code: 0, data: id }
    }
    return { code: 1, msg: '图层不存在，请先创建图层' }
  }

  createLine = (options, layerId) => {
    let { points, style } = options
    let layer = this.layers[layerId]
    if (!layer) {
      return { code: 1, msg: '图层不存在，请先创建图层' }
    }
    let id = this.guid()
    let source = layer.getSource()
    let feature = new Feature({
      id,
      geometry: new LineStringGeom(points),
    })
    let { width, color } = style
    feature.setStyle(
      new Style({
        stroke: new Stroke({
          width: width || 1,
          color: color || '#00fa00',
        }),
      })
    )
    source.addFeature(feature)
  }
}
