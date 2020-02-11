import { HalfEdgeModel } from "./halfEdgeModel";
import filters from './filterRegistry';
import { Mesh } from "./mesh";

self.addEventListener('message', (m) => {
    const mesh = m.data[0] as Mesh;
    const filter = m.data[1] as string;

    const halfEdgeModel = new HalfEdgeModel();
    halfEdgeModel.load(mesh);
    const filterFunc = filters.find((f) => f.id === filter).func;

    const result = filterFunc(halfEdgeModel);
    postMessage(result);
});
