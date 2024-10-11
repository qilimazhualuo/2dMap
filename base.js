import BaseFunc from './baseFunc'
import { transform } from 'ol/proj'

export default class extends BaseFunc{
    constructor() {
        super()
        this.coordinate = 'geo'
        this.coordinateType = ['geo', 'pro']
    }
    guid = () => {
        var S4 = () => {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
        }
        return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4())
    }
    changeCoordinate = (type) => {
        if (this.coordinateType.indexOf(type) === -1) {
            return
        }
        this.coordinate = type
    }

    geoToPro = (geo) => {
        return transform([geo.lat, geo.long], 'EPSG:4326', 'EPSG:3857')
    }

    proToGeo = (pro) => {
        transform([pro.lat, pro.long], 'EPSG:3857', 'EPSG:4326')
    }
}