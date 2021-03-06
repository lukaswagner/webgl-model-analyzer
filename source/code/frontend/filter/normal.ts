import { HalfEdgeModel } from "../halfEdgeModel";
import { vec3 } from "gl-matrix";

export const id = 'normal';
export const name = 'Normal';
export function func(model: HalfEdgeModel): vec3[] {
    const result = new Array<vec3>(model.faces.length);

    model.faces.forEach((face, index) => {
        result[index] = vec3.scaleAndAdd(
            vec3.create(), vec3.fromValues(0.5, 0.5, 0.5), face.normal, 0.5);
    });

    return result;
};
