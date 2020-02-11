import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import { Initializable, Canvas, auxiliaries, Wizard, Renderer, mat4, viewer, vec3 } from "webgl-operate";
import { ModelRenderer } from "./renderer";
// @ts-ignore
import parseStl from 'parse-stl';
import { HalfEdgeModel } from './halfEdgeModel';
import FilterWorker from 'worker-loader!./filterWorker';
import filters from './filterRegistry';
import { Mesh } from './mesh';

export class App extends Initializable {

    private _canvas: Canvas;
    private _renderer: ModelRenderer;
    private _mesh: Mesh
    private _halfEdgeModel: HalfEdgeModel;

    private _progress: HTMLProgressElement;
    private _filterSelect: HTMLSelectElement;

    /**
     * Initializes the application.
     * @param element The element which should be used for the rendering canvas.
     */
    initialize(element: HTMLCanvasElement | string): boolean {
        this._canvas = new Canvas(element);

        this._renderer = new ModelRenderer();
        this._canvas.renderer = this._renderer;
        this._canvas.element.addEventListener('dblclick', () => {
            viewer.Fullscreen.toggle(this._canvas.element);
        });

        this.setupProgress();
        this.setupControls();

        return true;
    }

    /**
     * Initializes the progress bar.
     */
    setupProgress(): void {
        this._progress =
            document.getElementById('filter-progress') as HTMLProgressElement;
        this._progress.max = filters.length;
        this._progress.value = 0;
    }

    /**
     * Initializes the controls.
     */
    setupControls(): void {
        // filter selection
        // should already exist when loading the first file -> initialized first
        this._filterSelect =
            document.getElementById('filter-select') as HTMLSelectElement;
        filters.forEach((filter) => {
            const option = document.createElement('option');
            option.value = filter.id;
            option.text = filter.name;
            this._filterSelect.options.add(option);
        });
        this._filterSelect.addEventListener('change', () => {
            this._renderer.filter =
                this._halfEdgeModel.getValues(this._filterSelect.value);
        });

        // input model selection
        const dataSelect =
            document.getElementById('data-select') as HTMLSelectElement;
        dataSelect.addEventListener('change', () => {
            this.load(dataSelect.value);
        })

        // fetch models from server, add options and load first
        fetch('/ls').then((res) => {
            res.json().then((j) => {
                j.forEach((model: string) => {
                    const option = document.createElement('option');
                    option.value = model;
                    option.text = model;
                    dataSelect.options.add(option);
                });
                this.load(dataSelect.value);
            });
        });

        // helper func for setting scale
        const applyScale = (scaleString: string) => {
            const scale = Number(scaleString);
            this._renderer.scale = scale;
        };

        // scale input and slider
        const scaleInput =
            document.getElementById('scale-input') as HTMLInputElement;
        const scaleRange =
            document.getElementById('scale-range') as HTMLInputElement;
        scaleInput.addEventListener('input', () => {
            scaleRange.value = scaleInput.value;
            applyScale(scaleInput.value);
        });
        scaleRange.addEventListener('input', () => {
            scaleInput.value = scaleRange.value;
            applyScale(scaleRange.value);
        });

        // make sure both use the same settings
        const scaleDefault = '1.0';
        const scaleMin = '0.1';
        const scaleMax = '4.0';
        const scaleStep = '0.1';
        applyScale(scaleDefault);
        scaleInput.value = scaleDefault;
        scaleRange.value = scaleDefault;
        scaleRange.min = scaleMin;
        scaleRange.max = scaleMax;
        scaleRange.step = scaleStep;
    }

    /**
     * Loads an stl from the server and processes it.
     * @param path The file to load.
     */
    load(path: string): void {
        fetch('data/' + path).then((res) => {
            res.text().then((stl) => {
                this._mesh = parseStl(stl);
                if (this._halfEdgeModel === undefined) {
                    this._halfEdgeModel = new HalfEdgeModel();
                }
                this._halfEdgeModel.load(this._mesh);
                this._renderer.model = this._halfEdgeModel;
                this.calculateFilters();
            });
        });
    }

    /**
     * Run the filters using web workers.
     */
    calculateFilters() {
        this._progress.value = 0;
        const workers = new Array<FilterWorker>();

        filters.forEach((filter, index) => {
            const worker = new FilterWorker();
            workers.push(worker);
            worker.onmessage = (m: any) => {
                const result = m.data as vec3[];
                this._halfEdgeModel.filterValues[filter.id] = result;
                this._progress.value++;
                if (index == 0) {
                    this._renderer.filter =
                        this._halfEdgeModel.getValues(filter.id);
                }
                worker.terminate();
            };
            worker.postMessage([this._mesh, filter.id]);
        });
    }

    uninitialize(): void {
        this._canvas.dispose();
        (this._renderer as Renderer).uninitialize();
    }

    get canvas(): Canvas {
        return this._canvas;
    }

    get renderer(): ModelRenderer {
        return this._renderer;
    }
}