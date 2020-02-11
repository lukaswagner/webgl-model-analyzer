import { HalfEdgeModel } from "../halfEdgeModel";
import { vec3 } from "gl-matrix";

export const id = 'normal';
export const name = 'Normal';
export function func(model: HalfEdgeModel): void {
    for (const face of model.faces) {
        face.filterValues[this.id] = vec3.scaleAndAdd(vec3.create(), vec3.fromValues(0.5, 0.5, 0.5), face.normal, 0.5);
    }
};
