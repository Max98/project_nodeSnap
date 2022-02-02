import { Vector3 } from "three";

export interface EditorNode {
  info: {
    id: number;
    grpId: number;
    name: string;
  };

  slotId?: number;

  position: Vector3;
  isVisible: boolean;
}

export interface EditorBeam {
  info: {
    id: number;
    grpId: number;
  };

  slotId?: number;

  node1: number;
  node2: number;
}

export interface EditorGrp {
  id: number;
  title: string;
  type: string;
  isVisible: boolean;
}

export enum rendererViewType {
  /**editor specific */
  VIEW_TOP,
  VIEW_SIDE,
  VIEW_FRONT,
  VIEW_MAIN,

  /** default */
  VIEW_DEFAULT,
}

export enum viewCameraType {
  PERSPECTIVE,
  ORTHOGRAPHIC,
}

export interface RendererViewData {
  canvas: HTMLCanvasElement;
  type: rendererViewType;
  cameraType: viewCameraType;
}

export interface EditorSlot {
  id: number;
  title: string;
  isVisible: boolean;
  nodes: EditorNode[];
  beams: EditorBeam[];
  grps: EditorGrp[];
}

export default interface EditorData {
  title: string;
  slots: EditorSlot[];
}
