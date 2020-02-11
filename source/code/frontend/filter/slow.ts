import { HalfEdgeModel } from "../halfEdgeModel";
import { vec3 } from "gl-matrix";

export const id = 'slow';
export const name = 'Slow';
export function func(model: HalfEdgeModel): vec3[] {
    const result = new Array<vec3>(model.faces.length);

    console.debug('Printing some stuff to console...');
    for(let i = 0; i < 1e5; i++) {
        console.debug('SPAM');
    }

    model.faces.forEach((face, index) => {
        result[index] = vec3.create();
    });

    return result;
};
