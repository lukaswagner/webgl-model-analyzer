import {
    Buffer,
    Context,
    Geometry,
} from 'webgl-operate';

import { HalfEdgeModel } from './halfEdgeModel';

/**
 * Geometry of a half edge model with vertex normals.
 */
export class HalfEdgeGeometry extends Geometry {
    protected INDICES = new Uint32Array([]);
    protected NORMALS = new Float32Array([]);
    protected VERTICES = new Float32Array([]);

    /** @see {@link vertexLocation} */
    protected _vertexLocation: GLuint = 0;

    /** @see {@link normalLocation} */
    protected _normalLocation: GLuint;

    /**
     * Object constructor, requires a context and an identifier.
     * @param context - Valid context to create the object for.
     * @param identifier - Meaningful name for identification of this instance.
     * vertices).
     */
    constructor(context: Context, identifier?: string) {
        super(context, identifier);

        /* Generate identifier from constructor name if none given. */
        identifier = identifier !== undefined && identifier !== ``
                ? identifier : this.constructor.name;

        /* Generate vertex buffers. */
        const vertexVBO = new Buffer(context);
        this._buffers.push(vertexVBO);

        /* Generate normal buffers. */
        const normalBuffer = new Buffer(context);
        this._buffers.push(normalBuffer);

        /* Generate index buffers. */
        const indexBuffer = new Buffer(context);
        this._buffers.push(indexBuffer);
    }


    /**
     * Binds the vertex buffer object (VBO) to an attribute binding point of a
     * given, pre-defined index.
     */
    protected bindBuffers(/*indices: Array<GLuint>*/): void {
        this._buffers[0].attribEnable(
            this._vertexLocation, 3, this.context.gl.FLOAT,
            false, 0, 0, true, false);
        this._buffers[1].attribEnable(
                this._normalLocation, 3, this.context.gl.FLOAT,
                false, 0, 0, true, false);
        this._buffers[2].bind();
    }

    /**
     * Unbinds the vertex buffer object (VBO) and disables the binding point.
     */
    protected unbindBuffers(): void {
        this._buffers[0].attribDisable(this._vertexLocation, true, true);
        this._buffers[1].attribDisable(this._normalLocation, true, true);
        this._buffers[2].unbind();
    }

    /**
     * Creates the vertex buffer object (VBO) and creates and initializes the
     * buffer's data store.
     * @param vertexLocation - Attribute binding point for vertices.
     * @param normalLocation - Attribute binding point for vertex normal.
     */
    initialize(vertexLocation: GLuint = 0, normalLocation: GLuint = 1)
            : boolean {

        this._vertexLocation = vertexLocation;
        this._normalLocation = normalLocation;

        const gl = this.context.gl as WebGLRenderingContext;
        const valid = super.initialize(
                [gl.ARRAY_BUFFER, gl.ARRAY_BUFFER, gl.ELEMENT_ARRAY_BUFFER],
                [vertexLocation, normalLocation]);

        this._buffers[0].data(this.VERTICES, gl.STATIC_DRAW);
        this._buffers[1].data(this.NORMALS, gl.STATIC_DRAW);
        this._buffers[2].data(this.INDICES, gl.STATIC_DRAW);

        return valid;
    }

    /**
     * Draws the geometry.
     */
    draw(): void {
        const gl = this.context.gl;
        gl.drawElements(gl.TRIANGLES, this.INDICES.length, gl.UNSIGNED_INT, 0);
    }

    /**
     * Attribute location to which this geometry's vertices are bound to.
     */
    get vertexLocation(): GLuint {
        return this._vertexLocation;
    }

    /**
     * Attribute location to which this geometry's vertex normals are bound to.
     */
    get normalLocation(): GLuint {
        return this._normalLocation;
    }

    set model(model: HalfEdgeModel) {
        this.VERTICES = model.getVertices();
        this.INDICES = model.getIndices();
        this.NORMALS = model.getNormals();

        const gl = this.context.gl;
        this._buffers[0].data(this.VERTICES, gl.DYNAMIC_DRAW);
        this._buffers[1].data(this.NORMALS, gl.DYNAMIC_DRAW);
        this._buffers[2].data(this.INDICES, gl.DYNAMIC_DRAW);
    }
}
