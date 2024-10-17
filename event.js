import Layer from './layer'

const mouseTypes = ['click', 'doubleclick', 'rightclick', 'mousemove', 'leftup']

export default class Event extends Layer {
  constructor() {
    super(...arguments)
    this._events = []
  }

  /**
   * 注册事件
   * @param {String} type 事件类型
   * @param {Function} fun 回调函数
   * @param {String} layerId 图层id 传入此参数时图层被删除后事件也会一并被删除
   */
  addEvent(type, fun, layerId) {
    if (!mouseTypes.find(i => i === type) || typeof fun !== 'function') {
      return
    }
    const func = (e) => {
      let index = 0
      let feature
      // feature只返回最上层的也就是第一个
      this.map.forEachFeatureAtPixel(e.pixel, (featureTemp) => {
        index === 0 && (feature = featureTemp)
        index += 1
      }, layerId ? {
        layerFilter: (layer) => {
          return layer.get('id') === layerId
        }
      } : undefined)
      if (layerId) {
        if (feature) {
          const position = feature.getGeometry().getFirstCoordinate()
          const properties = feature.getProperties()
          fun({ coordinate: this.proToGeo(e.coordinate), pickedFeature: feature, position: this.geoToPro(position), properties: properties?.properties })
        }
      } else {
        fun({ coordinate: this.proToGeo(e.coordinate), pickedFeature: feature })
      }
    }
    this._events.push({ func, fun, type, layerId })
    this.map.on(type, func)
  }

  /**
   * 移除鼠标点击事件
   * @param {String} type 事件类型
   * @param {Function} fun 回调函数
   * @param {String} layerId 图层id
   */
  removeEvent(type, fun, layerId) {
    // 删除时必须有其中一个
    if (!type && !fun && !layerId) {
      return
    }
    const index = this._events.findIndex((i) => {
      let funMatch = true, typeMatch = true, layerIdMatch = true
      if (fun) {
        funMatch = i.fun === fun
      }
      if (type) {
        typeMatch = i.type === type
      }
      if (layerIdMatch) {
        layerIdMatch = i.layerId === layerId
      }
      return funMatch && typeMatch && layerIdMatch
    })
    if (index !== -1) {
      const { type, func } = this._events[index]
      this.map.un(type, func)
      this._events.splice(index, 1)
    }
  }

  // 注册鼠标事件
}