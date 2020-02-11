import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import { Initializable, Canvas, auxiliaries, Wizard, Renderer, mat4, viewer } from "webgl-operate";
import { ModelRenderer } from "./renderer";
// @ts-ignore
import parseStl from 'parse-stl';
import { HalfEdgeModel } from './halfEdgeModel';

export class App extends Initializable {

    private _canvas: Canvas;
    private _renderer: ModelRenderer;
    private _halfEdgeModel: HalfEdgeModel;
    private _filters: {
        id: string,
        name: string,
        func: (model: HalfEdgeModel) => void
    }[] = [
        require('./filter/height'),
        require('./filter/normal')
    ]

    private _filterSelect: HTMLSelectElement;

    initialize(element: HTMLCanvasElement | string): boolean {
        this._canvas = new Canvas(element);

        this._renderer = new ModelRenderer();
        this._canvas.renderer = this._renderer;
        this._canvas.element.addEventListener('dblclick', () => {
            viewer.Fullscreen.toggle(this._canvas.element);
        });

        this._filterSelect =
            document.getElementById('filter-select') as HTMLSelectElement;
        this._filters.forEach((filter) => {
            const option = document.createElement('option');
            option.value = filter.id;
            option.text = filter.name;
            this._filterSelect.options.add(option);
        });
        this._filterSelect.addEventListener('change', () => {
            this._renderer.filter =
                this._halfEdgeModel.getValues(this._filterSelect.value);
        });

        const dataSelect =
            document.getElementById('data-select') as HTMLSelectElement;
        dataSelect.addEventListener('change', () => {
            this.load(dataSelect.value);
        })

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

        const applyScale = (scaleString: string) => {
            const scale = Number(scaleString);
            this._renderer.scale = scale;
        };

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

        return true;
    }

    load(path: string): void {
        console.log(path);
        fetch('data/' + path).then((res) => {
            res.text().then((stl) => {
                const mesh = parseStl(stl);
                if (this._halfEdgeModel === undefined) {
                    this._halfEdgeModel = new HalfEdgeModel();
                }
                this._halfEdgeModel.load(mesh);
                this._renderer.model = this._halfEdgeModel;
                this._filters.forEach((filter) => {
                    filter.func(this._halfEdgeModel);
                });
                this._renderer.filter =
                    this._halfEdgeModel.getValues(this._filterSelect.value);
            });
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