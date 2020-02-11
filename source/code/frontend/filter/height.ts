import { HalfEdgeModel } from "../halfEdgeModel";
import { vec3 } from "gl-matrix";

export const id = 'height';
export const name = 'Height';
export function func(model: HalfEdgeModel): vec3[] {
    const result = new Array<vec3>(model.faces.length);

    let min = Number.MAX_VALUE;
    let max = Number.MIN_VALUE;

    for (const vertex of model.vertices) {
        const y = vertex.position[1];
        if (y < min) min = y;
        if (y > max) max = y;
    }

    const range = max - min;

    model.faces.forEach((face, index) => {
        const height = face.halfEdges
            .map((e) => e.vertex0.position[1])
            .reduce((a, b) => a + b) / 3;
        const value = (height - min) / range;
        result[index] = vec3.fromValues(value, value, value);
    });

    return result;
};
