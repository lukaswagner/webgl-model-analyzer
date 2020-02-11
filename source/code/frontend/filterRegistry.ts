import { HalfEdgeModel } from "./halfEdgeModel";
import { vec3 } from "gl-matrix";

const filters: {
    id: string,
    name: string,
    func: (model: HalfEdgeModel) => vec3[]
}[] = [
    require('./filter/size'),
    require('./filter/height'),
    require('./filter/normal'),
    require('./filter/slow')
];
export = filters;
