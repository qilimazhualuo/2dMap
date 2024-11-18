import { Vector as SourceVector } from 'ol/source'
import { Vector as LayerVector } from 'ol/layer'
import { Modify, Draw } from 'ol/interaction'
import { LineString, Point, Circle } from 'ol/geom'
import { GeoJSON } from 'ol/format'
import { Icon, Circle as StyleCircle, Stroke, Fill, Style } from 'ol/style'
import Geometry from './geometry'

export default class Measure extends Geometry {
    constructor() {
        super(...arguments)
        this._meatureLineCountLimit = undefined
        this._meatureDrawedCallBack = undefined
        this._meatureDraw = undefined
        this._meatureDrawType = undefined
        this._meatureStyle = {
            strokeColor: 'rgba(24, 144, 255, 1)',
            img: undefined,
            width: 3,
            backgroundColor: 'rgba(24, 144, 255, 0.3)',
        }
        this._meatureSource = new SourceVector()
        this._meatureLayer = new LayerVector({ id: '_measure-layer', zIndex: 9, source: this._meatureSource })
        this.basemap.addLayer(this._meatureLayer)
        this._meatureModify = new Modify({
            source: this._meatureSource,
            insertVertexCondition: () => {
                if (this._meatureDrawType === 'LineString') {
                    const feature = this._meatureSource.getFeatures()[0]
                    const length = feature.getGeometry().getCoordinates().length
                    if (length >= lineCountLimit) {
                        return false
                    }
                }
                return true
            },
        })
        this.basemap.addInteraction(this._meatureModify)
        this._meatureModify.on('modifyend', () => {
            if (this._meatureDrawedCallBack instanceof Function) {
                this._meatureDrawedCallBack(this.getMeatureGeojson())
            }
        })
    }

    #defaultStyle(styleTemp, style) {
        styleTemp = Object.assign(styleTemp, style)
        const { strokeColor, img, width, backgroundColor } = styleTemp
        const image = img
            ? new Icon({
                src: img,
                offsetOrigin: 'bottom-right',
                scale: 0.5,
                size: [48, 144],
                offset: [0, -72],
            })
            : new StyleCircle({
                stroke: new Stroke({
                    color: 'rgba(24, 144, 255, 1)',
                }),
                fill: new Fill({
                    color: '#f6ffed',
                }),
            })
        return new Style({
            fill: new Fill({
                color: backgroundColor || 'rgba(24, 144, 255, 0.2)',
            }),
            stroke: new Stroke({
                color: strokeColor || 'rgba(24, 144, 255, 0.9)',
                width: width || 3,
            }),
            image,
        })
    }

    #styleFunction({ feature, style }) {
        const geometry = feature.getGeometry()
        const type = geometry.getType()
        const styles = [this.#defaultStyle({}, this._meatureStyle, style)]
        const { showLine = true, showArea = true } = this._meatureStyle
        let point, label, line
        if (type === 'Polygon') {
            label = this.basemap.formatArea(geometry)
            point = geometry.getInteriorPoint()
            line = new LineString(geometry.getCoordinates()[0])
        }
        if (type === 'MultiPolygon') {
            label = this.basemap.formatArea(geometry)
            point = geometry.getInteriorPoint()
            line = new LineString(geometry.getCoordinates()[0])
        }
        if (type === 'Circle') {
            label = this.basemap.formatArea(geometry.getRadius())
            const coor = geometry.getCenter()
            point = new Point(coor)
        }
        if (type === 'LineString') {
            line = new LineString(geometry.getCoordinates())
        }
        // 绘制多边形边长度
        // if (line && showLine) {
        //   let count = 0
        //   line.forEachSegment((a, b) => {
        //     const segment = new LineString([a, b])
        //     const label = this.basemap.formatLength(segment)
        //     if (segmentStyles.length - 1 < count) {
        //       segmentStyles.push(segmentStyle.clone())
        //     }
        //     const segmentPoint = new Point(segment.getCoordinateAt(0.5))
        //     segmentStyles[count].setGeometry(segmentPoint)
        //     segmentStyles[count].getText().setText(label)
        //     styles.push(segmentStyles[count])
        //     count++
        //   })
        // }
        // 绘制面积
        // if (label && showArea) {
        //   let labelStyle = ds.labelStyle()
        //   labelStyle.setGeometry(point)
        //   labelStyle.getText().setText(label)
        //   styles.push(labelStyle)
        // }
        // if (type === 'Point') {
        //   let tipStyle = ds.tipStyle()
        //   tipStyle.getText().setText(tip)
        //   styles.push(tipStyle)
        // }
        if (type === 'Point' && !modify.getOverlay().getSource().getFeatures().length) {
            tipPoint = geometry
        }
        return styles
    }

    draw(drawType, style = {}, clearBefore) {
        this._meatureDrawType = drawType
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
            this.basemap.once('pointermove', () => {
                modifyStyle.setGeometry()
                if (this._meatureDrawedCallBack instanceof Function) {
                    this._meatureDrawedCallBack(this.getMeatureGeojson())
                }
            })
            this.stopDrawShape()
        })
    }

    setMeatureGeojson(geojson, fitOption, style = {}) {
        const features = new GeoJSON().readFeatures(geojson, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857',
        })
        this._meatureSource.addFeatures(features)
        this._meatureLayer.setStyle((feature) => {
            return this.#styleFunction({ feature, style })
        })
        let displayRange = []
        features.forEach((feature, idx) => {
            const displayRangeTemp = feature.getGeometry().getExtent()
            const [xmin, ymin, xmax, ymax] = displayRangeTemp
            displayRange = displayRange.concat([[xmin, ymin],[xmax, ymax]])
        })
        this.setViewRange(displayRange, fitOption, false)
        this.setStyle(style)
    }

    getMeatureGeojson() {
        return JSON.parse(
            new GeoJSON().writeFeatures(this._meatureSource.getFeatures(), {
                dataProjection: 'EPSG:4326',
                featureProjection: 'EPSG:3857',
            })
        )
    }

    setMeatureCallBack(callback) {
        this._meatureDrawedCallBack = callback
    }

    setStyle(style) {
        this._meatureStyle = Object.assign({}, this._meatureStyle, style)
    }

    clearMeature() {
        this._meatureSource.clear()
    }

    stopMeature() {
        this._meatureDraw && this.basemap.removeInteraction(this._meatureDraw)
    }
}
