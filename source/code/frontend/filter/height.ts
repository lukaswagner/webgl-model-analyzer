import { HalfEdgeModel } from "../halfEdgeModel";
import { vec3 } from "gl-matrix";

export const id = 'height';
export const name = 'Height';
export function func(model: HalfEdgeModel): void {
    let min = Number.MAX_VALUE;
    let max = Number.MIN_VALUE;

    for (const vertex of model.vertices) {
        const y = vertex.position[1];
        if (y < min) min = y;
        if (y > max) max = y;
    }

    const range = max - min;

    for (const face of model.faces) {
        const height = face.halfEdges
            .map((e) => e.vertex0.position[1])
            .reduce((a, b) => a + b) / 3;
        const value = (height - min) / range;
        face.filterValues[this.id] = vec3.fromValues(value, value, value);
    }
};
