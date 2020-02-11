import { vec3 } from 'gl-matrix';

// tslint:disable: max-classes-per-file

class Vertex {
    public _position: vec3;
    public _halfEdges: HalfEdge[];
    public _normal: vec3;

    constructor(x: number, y: number, z: number) {
        this._position = vec3.fromValues(x, y, z);
        this._halfEdges = [];
    }
}

class HalfEdge {
    public _vertex0: Vertex;
    public _vertex1: Vertex;

    public face: Face;

    public _otherHalfEdge: HalfEdge;

    constructor(vertex0: Vertex, vertex1: Vertex) {
        this._vertex0 = vertex0;
        this._vertex1 = vertex1;
        vertex1._halfEdges.forEach((halfEdge: HalfEdge, halfEdgeIndex) => {
            if (halfEdge._vertex1 === vertex0
                && halfEdge._vertex0 === vertex1) {
                this._otherHalfEdge = halfEdge;
                halfEdge._otherHalfEdge = this;
            }
        });
        vertex0._halfEdges.push(this);
        vertex1._halfEdges.push(this);
    }
}

class Face {
    public _halfEdges: HalfEdge[];
    public _normal: vec3;

    constructor(halfEdge0: HalfEdge, halfEdge1: HalfEdge, halfEdge2: HalfEdge) {
        this._halfEdges = [];
        this._halfEdges.push(halfEdge0);
        this._halfEdges.push(halfEdge1);
        this._halfEdges.push(halfEdge2);
        halfEdge0.face = this;
        halfEdge1.face = this;
        halfEdge2.face = this;
        this.calculateNormal();
    }

    protected calculateNormal(): void {
        const p0 = this._halfEdges[0]._vertex0._position;
        const p1 = this._halfEdges[1]._vertex0._position;
        const p2 = this._halfEdges[2]._vertex0._position;

        const v0 = vec3.subtract(vec3.create(), p1, p0);
        const v1 = vec3.subtract(vec3.create(), p2, p0);

        this._normal = vec3.cross(vec3.create(), v0, v1);
        this._normal = vec3.normalize(vec3.create(), this._normal);
    }
}

export class HalfEdgeModel {
    protected _vertices: Vertex[];
    protected _halfEdges: HalfEdge[];
    protected _faces: Face[];

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
        this._vertices.forEach((vertex: Vertex) => {
            const normal = vec3.fromValues(0, 0, 0);
            vertex._halfEdges.forEach((halfEdge) => {
                vec3.add(normal, normal, halfEdge.face._normal);
            });
            vec3.normalize(normal, normal);
            vertex._normal = normal;
        });
    }

    public load(mesh: any): void {
        this.mergeByDistance(mesh);
        const vertices = mesh.positions;
        const faces = mesh.cells;

        this._vertices = [];
        vertices.forEach((vertex: number[], vertexIndex: number) => {
            this._vertices.push(new Vertex(vertex[0], vertex[1], vertex[2]));
        });

        this._faces = [];
        this._halfEdges = [];
        faces.forEach((face: number[]) => {
            if (face[0] === face[1]
                || face[0] === face[2]
                || face[1] === face[2]) {
                return;
            }
            const halfEdge0 = new HalfEdge(
                    this._vertices[face[0]],
                    this._vertices[face[1]]);
            const halfEdge1 = new HalfEdge(
                    this._vertices[face[1]],
                    this._vertices[face[2]]);
            const halfEdge2 = new HalfEdge(
                    this._vertices[face[2]],
                    this._vertices[face[0]]);
            this._halfEdges.push(halfEdge0);
            this._halfEdges.push(halfEdge1);
            this._halfEdges.push(halfEdge2);
            this._faces.push(new Face(halfEdge0, halfEdge1, halfEdge2));
        });

        this.calculateVertexNormals();
    }

    getVertices(): Float32Array {
        const vertices = new Float32Array(this._faces.length * 3 * 3);
        this._faces.forEach((face: Face, faceIndex: number) => {
            face._halfEdges.forEach((halfEdge: HalfEdge, edgeIndex: number) => {
                const pos = halfEdge._vertex0._position;
                vertices[faceIndex * 9 + edgeIndex * 3 + 0] = pos[0];
                vertices[faceIndex * 9 + edgeIndex * 3 + 1] = pos[1];
                vertices[faceIndex * 9 + edgeIndex * 3 + 2] = pos[2];
            });
        });
        return vertices;
    }

    getIndices(): Uint32Array {
        const faces = new Uint32Array(this._faces.length * 3);
        this._faces.forEach((face: Face, index: number) => {
            face._halfEdges.forEach((halfEdge: HalfEdge, edgeIndex: number) => {
                faces[index * 3 + edgeIndex] = index * 3 + edgeIndex;
            });
        });
        return faces;
    }

    getNormals(): Float32Array {
        let normals = new Float32Array(this._faces.length * 3 * 3);

        normals = new Float32Array(this._faces.length * 3 * 3);
        this._faces.forEach((face: Face, faceIndex: number) => {
            face._halfEdges.forEach((halfEdge: HalfEdge, edgeIndex: number) => {
                normals[faceIndex * 9 + edgeIndex * 3 + 0] = face._normal[0];
                normals[faceIndex * 9 + edgeIndex * 3 + 1] = face._normal[1];
                normals[faceIndex * 9 + edgeIndex * 3 + 2] = face._normal[2];
            });
        });
        return normals;
    }
}
