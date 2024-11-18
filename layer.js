import { Vector } from 'ol/layer'
import { Vector as Source } from 'ol/source'
import BaseLayer from './baseLayer'

export default class extends BaseLayer {
    constructor() {
        super(...arguments)
        this.layers = {}
    }

    createLayer = ({ zIndex = 1, opacity = 1, visible = true, id }) => {
        let source = new Source()
        let layer = new Vector({
            zIndex,
            opacity,
            source,
        })
        id = id ? id : this.guid()
        this.layers[id] = layer
        this.basemap.addLayer(layer)
        return id
    }

    setLayerVisible = (layerId, visible) => {
        let layer = this.layers[layerId]
        if (!layer) {
            return { code: 400, msg: '图层不存在' }
        }
        layer.setVisible(visible)
        return { code: 200, msg: 'success' }
    }

    clearLayer = (layerId) => {
        let layer = this.layers[layerId]
        if (!layer) {
            return { code: 400, msg: '图层不存在' }
        }
        this.layers[layerId].getSource().clear()
        return { code: 200, msg: 'success' }
    }
}
