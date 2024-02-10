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
