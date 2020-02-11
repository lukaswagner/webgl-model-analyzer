import { vec3 } from 'gl-matrix';

// tslint:disable: max-classes-per-file

class Vertex {
    public position: vec3;
    public halfEdges: HalfEdge[];
    public normal: vec3;

    constructor(x: number, y: number, z: number) {
        this.position = vec3.fromValues(x, y, z);
        this.halfEdges = [];
    }
}

class HalfEdge {
    public vertex0: Vertex;
    public vertex1: Vertex;

    public face: Face;

    public _otherHalfEdge: HalfEdge;

    constructor(vertex0: Vertex, vertex1: Vertex) {
        this.vertex0 = vertex0;
        this.vertex1 = vertex1;
        vertex1.halfEdges.forEach((halfEdge: HalfEdge, halfEdgeIndex) => {
            if (halfEdge.vertex1 === vertex0
                && halfEdge.vertex0 === vertex1) {
                this._otherHalfEdge = halfEdge;
                halfEdge._otherHalfEdge = this;
            }
        });
        vertex0.halfEdges.push(this);
        vertex1.halfEdges.push(this);
    }
}

class Face {
    public halfEdges: HalfEdge[];
    public normal: vec3;
    public filterValues: { [id: string]: vec3; } = {};

    constructor(halfEdge0: HalfEdge, halfEdge1: HalfEdge, halfEdge2: HalfEdge) {
        this.halfEdges = [];
        this.halfEdges.push(halfEdge0);
        this.halfEdges.push(halfEdge1);
        this.halfEdges.push(halfEdge2);
        halfEdge0.face = this;
        halfEdge1.face = this;
        halfEdge2.face = this;
        this.calculateNormal();
    }

    protected calculateNormal(): void {
        const p0 = this.halfEdges[0].vertex0.position;
        const p1 = this.halfEdges[1].vertex0.position;
        const p2 = this.halfEdges[2].vertex0.position;

        const v0 = vec3.subtract(vec3.create(), p1, p0);
        const v1 = vec3.subtract(vec3.create(), p2, p0);

        this.normal = vec3.cross(vec3.create(), v0, v1);
        this.normal = vec3.normalize(vec3.create(), this.normal);
    }
}

export class HalfEdgeModel {
    public vertices: Vertex[];
    public halfEdges: HalfEdge[];
    public faces: Face[];

    protected mergeByDistance(mesh: any, threshold = 0.0000001): void {
        const threshold2 = threshold * threshold;
        const newVertexList: number[][] = [];
        const indexMap: number[] = [];
        mesh.positions.forEach((vertex: number[]) => {
            let found = false;
            newVertexList.forEach((newVertex: number[], newIndex) => {
                if (found) {
                    return;
                }
                const distX = vertex[0] - newVertex[0];
                const distY = vertex[1] - newVertex[1];
                const distZ = vertex[2] - newVertex[2];
                const dist2 = distX * distX + distY * distY + distZ * distZ;
                if (dist2 < threshold2) {
                    found = true;
                    indexMap.push(newIndex);
                }
            });
            if (!found) {
                indexMap.push(newVertexList.length);
                newVertexList.push(vertex);
            }
        });

        mesh.cells.forEach((face: number[]) => {
            face[0] = indexMap[face[0]];
            face[1] = indexMap[face[1]];
            face[2] = indexMap[face[2]];
        });
        mesh.positions = newVertexList;
    }

    protected calculateVertexNormals(): void {
        this.vertices.forEach((vertex: Vertex) => {
            const normal = vec3.fromValues(0, 0, 0);
            vertex.halfEdges.forEach((halfEdge) => {
                vec3.add(normal, normal, halfEdge.face.normal);
            });
            vec3.normalize(normal, normal);
            vertex.normal = normal;
        });
    }

    public load(mesh: any): void {
        this.mergeByDistance(mesh);
        const vertices = mesh.positions;
        const faces = mesh.cells;

        this.vertices = [];
        vertices.forEach((vertex: number[], vertexIndex: number) => {
            this.vertices.push(new Vertex(vertex[0], vertex[1], vertex[2]));
        });

        this.faces = [];
        this.halfEdges = [];
        faces.forEach((face: number[]) => {
            if (face[0] === face[1]
                || face[0] === face[2]
                || face[1] === face[2]) {
                return;
            }
            const halfEdge0 = new HalfEdge(
                    this.vertices[face[0]],
                    this.vertices[face[1]]);
            const halfEdge1 = new HalfEdge(
                    this.vertices[face[1]],
                    this.vertices[face[2]]);
            const halfEdge2 = new HalfEdge(
                    this.vertices[face[2]],
                    this.vertices[face[0]]);
            this.halfEdges.push(halfEdge0);
            this.halfEdges.push(halfEdge1);
            this.halfEdges.push(halfEdge2);
            this.faces.push(new Face(halfEdge0, halfEdge1, halfEdge2));
        });

        this.calculateVertexNormals();
    }

    getVertices(): Float32Array {
        const vertices = new Float32Array(this.faces.length * 3 * 3);
        this.faces.forEach((face: Face, faceIndex: number) => {
            face.halfEdges.forEach((halfEdge: HalfEdge, edgeIndex: number) => {
                const pos = halfEdge.vertex0.position;
                vertices[faceIndex * 9 + edgeIndex * 3 + 0] = pos[0];
                vertices[faceIndex * 9 + edgeIndex * 3 + 1] = pos[1];
                vertices[faceIndex * 9 + edgeIndex * 3 + 2] = pos[2];
            });
        });
        return vertices;
    }

    getIndices(): Uint32Array {
        const faces = new Uint32Array(this.faces.length * 3);
        this.faces.forEach((face: Face, index: number) => {
            face.halfEdges.forEach((halfEdge: HalfEdge, edgeIndex: number) => {
                faces[index * 3 + edgeIndex] = index * 3 + edgeIndex;
            });
        });
        return faces;
    }

    getNormals(): Float32Array {
        let normals = new Float32Array(this.faces.length * 3 * 3);

        normals = new Float32Array(this.faces.length * 3 * 3);
        this.faces.forEach((face: Face, faceIndex: number) => {
            face.halfEdges.forEach((halfEdge: HalfEdge, edgeIndex: number) => {
                normals[faceIndex * 9 + edgeIndex * 3 + 0] = face.normal[0];
                normals[faceIndex * 9 + edgeIndex * 3 + 1] = face.normal[1];
                normals[faceIndex * 9 + edgeIndex * 3 + 2] = face.normal[2];
            });
        });
        return normals;
    }

    getValues(id: string): Float32Array {
        let values = new Float32Array(this.faces.length * 3 * 3);

        values = new Float32Array(this.faces.length * 3 * 3);
        this.faces.forEach((face: Face, faceIndex: number) => {
            const value = face.filterValues[id];
            face.halfEdges.forEach((halfEdge: HalfEdge, edgeIndex: number) => {
                values[faceIndex * 9 + edgeIndex * 3 + 0] = value[0];
                values[faceIndex * 9 + edgeIndex * 3 + 1] = value[1];
                values[faceIndex * 9 + edgeIndex * 3 + 2] = value[2];
            });
        });
        return values;
    }
}
