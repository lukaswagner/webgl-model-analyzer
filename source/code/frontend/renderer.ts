import { mat4, vec3 } from 'gl-matrix';

import {
    Camera,
    Color,
    Context,
    DefaultFramebuffer,
    Geometry,
    Invalidate,
    MouseEventProvider,
    Navigation,
    Program,
    Renderer,
    Shader,
} from 'webgl-operate';

import { HalfEdgeGeometry } from './halfEdgeGeometry';
import { HalfEdgeModel } from './halfEdgeModel';

export class ModelRenderer extends Renderer {
    protected _camera: Camera;
    protected _navigation: Navigation;

    protected _program: Program;
    protected _uViewProjection: WebGLUniformLocation;

    protected _defaultFBO: DefaultFramebuffer;

    protected _geometry: HalfEdgeGeometry;

    set model(model: HalfEdgeModel) {
        this._geometry.model = model;
        this.invalidate(true);
    }

    /**
     * Initializes and sets up buffer, cube geometry, camera and links shaders
     * with program.
     * @param context - valid context to create the object for.
     * @param identifier - meaningful name for identification of this instance.
     * @param mouseEventProvider - required for mouse interaction
     * @returns - whether initialization was successful
     */
    protected onInitialize(
        context: Context,
        callback: Invalidate,
        mouseEventProvider: MouseEventProvider): boolean {

        this._defaultFBO = new DefaultFramebuffer(context, 'DefaultFBO');
        this._defaultFBO.initialize();
        this._defaultFBO.bind();

        const gl = context.gl;

        const geometry = new HalfEdgeGeometry(context);
        geometry.initialize();
        this._geometry = geometry;

        const vert = new Shader(context, gl.VERTEX_SHADER);
        vert.initialize(require('./basic.vert'));
        const frag = new Shader(context, gl.FRAGMENT_SHADER);
        frag.initialize(require('./colorFromAttr.frag'));

        this._program = new Program(context);
        this._program.initialize([vert, frag], false);

        this._program.attribute('a_vertex', geometry.vertexLocation);
        this._program.attribute('a_normal', geometry.normalLocation);
        this._program.link();
        this._program.bind();

        this._uViewProjection = this._program.uniform('u_viewProjection');
        const identity = mat4.identity(mat4.create());
        gl.uniformMatrix4fv(
            this._program.uniform('u_model'), gl.FALSE, identity);

        this._camera = new Camera();
        this._camera.center = vec3.fromValues(0.0, 0.0, 0.0);
        this._camera.up = vec3.fromValues(0.0, 1.0, 0.0);
        this._camera.eye = vec3.fromValues(-0.0, 0.0, 2.0);
        this._camera.near = 1.0;
        this._camera.far = 8.0;

        this._navigation = new Navigation(callback, mouseEventProvider);
        this._navigation.camera = this._camera;

        gl.enable(gl.DEPTH_TEST);

        return true;
    }

    /**
     * Uninitializes buffers, geometry and program.
     */
    protected onUninitialize(): void {
        super.uninitialize();

        this._geometry.uninitialize();
        this._program.uninitialize();

        this._defaultFBO.uninitialize();
    }

    /**
     * This is invoked in order to check if rendering of a frame is required by
     * means of implementation specific evaluation (e.g., lazy non continuous
     * rendering). Regardless of the return value a new frame (preparation,
     * frame, swap) might be invoked anyway, e.g., when update is forced or
     * canvas or context properties have changed or the renderer was
     * invalidated @see{@link invalidate}.
     * @returns whether to redraw
     */
    protected onUpdate(): boolean {
        this._navigation.update();

        return this._altered.any || this._camera.altered;
    }

    /**
     * This is invoked in order to prepare rendering of one or more frames,
     * regarding multi-frame rendering and camera-updates.
     */
    protected onPrepare(): void {
        if (this._altered.canvasSize) {
            this._camera.aspect = this._canvasSize[0] / this._canvasSize[1];
            this._camera.viewport = [this._canvasSize[0], this._canvasSize[1]];
        }

        if (this._altered.clearColor) {
            this._defaultFBO.clearColor(this._clearColor);
        }

        this._altered.reset();
        this._camera.altered = false;
    }

    protected onFrame(): void {
        const gl = this._context.gl;

        this._defaultFBO.bind();
        this._defaultFBO.clear(
            gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT, true, false);

        gl.viewport(0, 0, this._frameSize[0], this._frameSize[1]);

        this._program.bind();
        gl.uniformMatrix4fv(
            this._uViewProjection, gl.GL_FALSE, this._camera.viewProjection);

        this._geometry.bind();
        this._geometry.draw();
        this._geometry.unbind();

        this._program.unbind();
    }

    protected onSwap(): void { }
}
