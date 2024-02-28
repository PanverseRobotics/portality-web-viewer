export function renderMain(canvas: any, data: any, cameraParams: any, pipelineType: any, interactMod?: any): (now: any) => void;
export function readParams(params: any, canvas: any, interactMod?: any): void;
export namespace cameraParams {
    let position: number[];
    let lookAt: number[];
    let up: number[];
}
export let pipelineType: string;
export function loadSplatData(data: any): ({ positions: Float32Array, scales: Float32Array, colors: Float32Array, rotors: Float32Array });
export function mat4multiply(out: Float32Array, a: Float32Array, b: Float32Array): void;
export function viewMatGetPoseParams(viewMat: Float32Array, radius: number): ({ camera: Float32Array, lookAt: Float32Array, up: Float32Array });
