import { Vector as SourceVector } from 'ol/source'
import { Vector as LayerVector } from 'ol/layer'
import { Modify, Draw } from 'ol/interaction'
import { LineString, Point, Circle } from 'ol/geom'
import { GeoJSON } from 'ol/format'
import Geometry from './geometry'

export default class Measure extends Geometry {
  constructor() {
    super(...arguments)
    this._meatureLineCountLimit = undefined
    this._meatureDrawedCallBack = undefined
    this._meatureDraw = undefined
    this._meatureStyle = {
      strokeColor: 'rgba(24, 144, 255, 1)',
      img: undefined,
      width: 3,
      backgroundColor: 'rgba(24, 144, 255, 0.3)',
    }
    this._meatureSource = new SourceVector()
    this._meatureLayer = new LayerVector({ id: '_measure-layer', zIndex: 9, source: this._meatureSource })
    this._meatureModify = new Modify({
      source: this._meatureSource,
      insertVertexCondition: () => {
        if (drawTypeStore === 'LineString') {
          const feature = this._meatureSource.getFeatures()[0]
          const length = feature.getGeometry().getCoordinates().length
          if (length >= lineCountLimit) {
            return false
          }
        }
        return true
      },
    })
    this.map.addInteraction(this._meatureModify)
    this._meatureModify.on('modifyend', () => {
      if (this._meatureDrawedCallBack instanceof Function) {
        this._meatureDrawedCallBack(getBufferFeature())
      }
    })
  }

  #styleFunction() {
    const geometry = feature.getGeometry()
    const type = geometry.getType()
    const styles = [ds.defaultStyle(styleTemp, this._meatureStyle, props.map)]
    const { showLine = true, showArea = true } = this._meatureStyle
    let point, label, line
    if (type === 'Polygon') {
      label = props.map.formatArea(geometry)
      point = geometry.getInteriorPoint()
      line = new ol.geom.LineString(geometry.getCoordinates()[0])
    }
    if (type === 'MultiPolygon') {
      label = props.map.formatArea(geometry)
      point = geometry.getInteriorPoint()
      line = new ol.geom.LineString(geometry.getCoordinates()[0])
    }
    if (type === 'Circle') {
      label = props.map.formatArea(geometry.getRadius())
      const coor = geometry.getCenter()
      point = new ol.geom.Point(coor)
    }
    if (type === 'LineString') {
      line = new ol.geom.LineString(geometry.getCoordinates())
    }
    // 绘制多边形边长度
    if (line && showLine) {
      let count = 0
      line.forEachSegment(function (a, b) {
        const segment = new ol.geom.LineString([a, b])
        const label = props.map.formatLength(segment)
        if (segmentStyles.length - 1 < count) {
          segmentStyles.push(segmentStyle.clone())
        }
        const segmentPoint = new ol.geom.Point(segment.getCoordinateAt(0.5))
        segmentStyles[count].setGeometry(segmentPoint)
        segmentStyles[count].getText().setText(label)
        styles.push(segmentStyles[count])
        count++
      })
    }
    // 绘制面积
    if (label && showArea) {
      let labelStyle = ds.labelStyle()
      labelStyle.setGeometry(point)
      labelStyle.getText().setText(label)
      styles.push(labelStyle)
    }
    if (type === 'Point') {
      let tipStyle = ds.tipStyle()
      tipStyle.getText().setText(tip)
      styles.push(tipStyle)
    }
    if (type === 'Point' && !modify.getOverlay().getSource().getFeatures().length) {
      tipPoint = geometry
    }
    return styles
  }

  draw(drawType, style = {}, clearBefore) {
    if (clearBefore) {
      this.clearMeature()
    }
    this.stopMeature()
    const tempStyle = (feature) => {
      return this.#styleFunction({ feature, style })
    }
    this._meatureLayer.setStyle((feature) => {
      return this.#styleFunction({ feature, style })
    })
    if (drawType === 'Rect') {
      this._meatureDraw = new Draw({
        source: this._meatureSource,
        type: 'Circle',
        style: tempStyle,
        freehand: false,
        geometryFunction: Draw.createBox(),
      })
    } else if (drawType === 'fixedCircle') {
      this._meatureDraw = new ol.interaction.Draw({
        source: this._meatureSource,
        type: 'Point',
        style: tempStyle,
        geometryFunction: (coors, geometry) => {
          if (!geometry) {
            geometry = Circle(coors, 50)
          }
          geometry.setCoordinates(coors)
          geometry.setRadius(50)
          return geometry
        },
      })
    } else {
      this._meatureLineCountLimit = style.lineCountLimit
      this._meatureDraw = new ol.interaction.Draw({
        source: this._meatureSource,
        type: drawType || 'Circle',
        style: tempStyle,
        maxPoints: style.lineCountLimit,
      })
    }
    this._meatureDraw.on('drawstart', () => {
      this._meatureModify.setActive(false)
    })
    this._meatureDraw.on('drawend', () => {
      this._meatureModify.setActive(true)
      this.map.once('pointermove', () => {
        modifyStyle.setGeometry()
        if (this._meatureDrawedCallBack instanceof Function) {
          this._meatureDrawedCallBack(getBufferFeature())
        }
      })
      this.stopDrawShape()
    })
  }

  setMeatureGeojson(geojson, fitOption = { duration: 250 }, style = {}) {
    const features = new GeoJSON().readFeatures(geojson, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857',
    })
    this._meatureSource.addFeatures(features)
    this._meatureLayer.setStyle((feature) => {
      return styleFunction({ feature, style })
    })
    let displayRange = []
    features.forEach((feature, idx) => {
      const displayRangeTemp = feature.getGeometry().getExtent()
      if (idx === 0) {
        displayRange = displayRangeTemp
        return
      }
      displayRangeTemp[0] < displayRange[0] && (displayRange[0] = displayRangeTemp[0])
      displayRangeTemp[1] < displayRange[1] && (displayRange[1] = displayRangeTemp[1])
      displayRangeTemp[2] > displayRange[2] && (displayRange[2] = displayRangeTemp[2])
      displayRangeTemp[3] > displayRange[3] && (displayRange[3] = displayRangeTemp[3])
    })
    this.map.getView().fit(displayRange, fitOption)
    this.setStyle(style)
  }

  getMeatureGeojson() {
    return new GeoJSON().writeFeatures(this._meatureSource.getFeatures(), {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857',
    })
  }

  setStyle(style) {
    this._meatureStyle = Object.assign({}, this._meatureStyle, style)
  }

  clearMeature() {
    this._meatureSource.clear()
  }

  stopMeature() {
    this._meatureDraw && this.map.removeInteraction(this._meatureDraw)
  }
}
