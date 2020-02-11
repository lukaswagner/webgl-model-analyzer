# webgl-model-analyzer

Analyze STLs using filters. WebGL to make it fancy. Web workers to make it fast. Add your models in `/data`.

## Available npm scripts

- `build` - Builds the project once.
- `watch` - Watches the source files for changes and automatically recompiles them.
- `start` - Starts the server (on port 3000) which hosts both the built webpage and the models.

All scripts are also available as VS Code tasks.

## How to add filters

Add the files in `source/code/frontend/filters`. Make sure to also add them to `source/code/frontend/filterRegistry.ts`.

Filter structure:
- `id` - An unique id. Needed to tell the web workers which filter to run.
- `name` - What you see in the dropdown list.
- `func` - The function that does your calculations.
  - Input is a model stored as half-edge structure.
  - Output is an array of colors as vec3, one for each face of the model.

## Project structure

- `code` - Everything that runs.
  - `frontend` - The webpage stuff.
    - `filter` - Add your filters here (and in the registry).
    - `shader` - GLSL shaders.
    - `app.ts` - Entry point for the application. Loads the models and manages the inputs.
    - `filterRegistry.ts` - List of available filters.
    - `filterWorker.ts` - Web worker for running the filters.
    - `halfEdgeGeometry.ts` - Helper class for drawing the models.
    - `halfEdgeModel.ts` - The data structure used by the filters.
    - `mesh.ts` - Helper class for passing meshes to the workers.
    - `renderer.ts` - Puts the image on the screen.
  - `server` - Small express.js server for hosting the page and models.
- `css` - Custom CSS to make the UI blocky.
- `pages` - Pug files for building the website structure.
