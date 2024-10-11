import { Feature } from 'ol'
import { Point, LineString } from 'ol/geom'
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

  createLine = ({ data, style = {}, layerId, goView }) => {
    const layer = this.layers[layerId]
    if (!layer) {
      return { code: 1, msg: '图层不存在，请先创建图层' }
    }
    const id = this.guid()
    const source = layer.getSource()
    const geometry = new LineString(data.map(i => this.geoToPro(i)))
    const feature = new Feature({
      id,
      geometry,
    })
    const { width = 4, color = '#00ff00' } = style
    feature.setStyle(
      new Style({
        stroke: new Stroke({
          width: width,
          color: color,
        }),
      })
    )
    source.addFeature(feature)
    goView && this.map.getView().fit(geometry.getExtent())
  }
}
