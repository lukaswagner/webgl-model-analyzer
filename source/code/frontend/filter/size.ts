import { HalfEdgeModel } from "../halfEdgeModel";
import { vec3 } from "gl-matrix";
import { Color } from "webgl-operate";

export const id = 'size';
export const name = 'Size';
export function func(model: HalfEdgeModel): vec3[] {
    const result = new Array<vec3>(model.faces.length);

    const areas = model.faces.map((face) => {
        const first = vec3.subtract(
            vec3.create(),
            face.halfEdges[0].vertex0.position,
            face.halfEdges[0].vertex1.position);
        const second = vec3.subtract(
            vec3.create(),
            face.halfEdges[1].vertex1.position,
            face.halfEdges[1].vertex0.position);
        const cross = vec3.cross(vec3.create(), first, second);
        return vec3.length(cross) / 2;
    });

    const min = Math.min(...areas);
    const max = Math.max(...areas);

    const minHue = 0;
    const maxHue = 240;

    function areaToColor(area: number): vec3 {
        const hue = map(area, min, max, minHue, maxHue);
        return vec3.fromValues(...Color.hsl2rgb([hue / 360, 1, 0.5]));
    }

    function map(
        x: number, x0: number, x1: number, y0: number, y1: number,
    ): number {
        const t = (x - x0) / (x1 - x0);
        return y0 + t * (y1 - y0);
    }

    model.faces.forEach((face, index) => {
        result[index] = areaToColor(areas[index]);
    });

    return result;
}
