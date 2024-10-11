import { Vector } from 'ol/layer'
import { Vector as Source } from 'ol/source'
import BaseLayer from './baseLayer'

export default class extends BaseLayer {
    constructor() {
        super()
        this.layers = {}
    }

    createLayer = (zIndex, opacity, visible, id) => {
        let source = new Source()
        let layer = new Vector({
            zIndex,
            opacity,
            source
        })
        id = id ? id : this.guid()
        this.layers[id] = layer
        this.map.addLayer(layer)
        return id
    }

    setLayerVisible = (layerId, visible) => {
        let layer = this.layers[layerId]
        if (!layer) {
            return { code: 400, msg: '图层不存在'}
        }
        layer.setVisible(visible)
        return { code: 200, msg: 'success' }
    }
    
}