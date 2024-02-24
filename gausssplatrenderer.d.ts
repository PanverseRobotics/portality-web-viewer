export function renderMain(data: any, cameraParams: any, pipelineType: any): (now: any) => void;
export function readParams(): void;
export namespace cameraParams {
    let position: number[];
    let lookAt: number[];
    let up: number[];
    let azimuth: number;
    let elevation: number;
}
export let pipelineType: string;
export function loadSplatData(data: any): ({ positions: Float32Array, scales: Float32Array, colors: Float32Array, rotors: Float32Array });
export function mat4multiply(a: Float32Array, b: Float32Array): Float32Array;
