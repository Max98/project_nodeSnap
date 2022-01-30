/**
 * Truck file section definitions
 */

export interface SECTION {
  sbd_preset_id: number;
  snd_preset_id: number;
  //sbds_preset_id: number; //scale
  grpId: number;
  comment_id: number;
}

/**
 * Globals
 */
export interface TruckFileGlobals extends SECTION {
  dryMass: number;
  cargoMass: number;
  material: string;
}

/**
 * Detacher group
 */
export interface TruckFileDetacherGroup {
  detacher_id: number;
}

/**
 * group
 */
export interface TruckFileGroup {
  grpId: number;
  title: string;
  type: string;
}

/**
 * comments
 */
export interface TruckFileComment {
  comment_id: number;
  text: string;
}

/**
 * set_nodes_defaults
 */

export interface TruckFileSetNodesDefaults {
  preset_id: number;

  loadWeight?: number;
  friction?: number;
  volume?: number;
  surface?: number;
  options?: string;
}

/**
 * set_beam_defaults
 */

export interface TruckFileSetBeamDefaults {
  preset_id: number;

  springiness: number;
  dampingConstant?: number;
  deformationThresholdConstant?: number;
  breakingThresholdConstant?: number;
  beamDiameter?: number;
  beamMaterial?: string;
  plasticDeformationCoef?: number;
}

/**
 * Wheels
 * rorEditor will use this as default wheels
 */
export interface TruckFileWheels extends SECTION {
  radius: number;
  width: number;
  numRays: number;
  node1: string;
  node2: string;
  rigNode: string;
  braking: number;
  drive: number;
  refArmNode: string;
  mass: number;
  springness: number;
  damping: number;
  face_material_name: string;
  band_material_name: string;
}

/**
 * Nodes
 */
export enum nodeType {
  DEFAULT,
  NAMED,
}

export interface TruckFileNode extends SECTION {
  id: number; //we parse as string
  name: string;
  type: nodeType;
  x: number;
  y: number;
  z: number;
  options?: string;
  sdm_id?: number; //set_default_minimass
}

/**
 * Beams
 */
export interface TruckFileBeam extends SECTION {
  node1: number;
  node2: number;
  options?: string;
  /**
   * We use id here to keep stuff in order
   */
  id: number;
  detacher_group_id?: number;
}

/**
 * fileformat
 */
export interface TruckFileFormat {
  version: number;
}

/**
 * fileinfo
 */
export interface TruckFileInfo {
  uniqueId: number;
  categoryId?: number;
  fileVersion?: number;
}

/**
 * Last: unknown sections
 */

export interface TruckFileUnknown extends SECTION {
  after_section: any;
  data: string;
}

/**
 * The whole truck file interface
 */
export interface TruckFileInterface {
  title: string;
  fileformat?: TruckFileFormat;
  fileinfo?: TruckFileInfo;
  globals: TruckFileGlobals;
  nodes: TruckFileNode[];
  beams: TruckFileBeam[];

  setNodesDefaults?: TruckFileSetNodesDefaults[];
  setBeamDefaults?: TruckFileSetBeamDefaults[];
  groups?: TruckFileGroup[];
  comments?: TruckFileComment[];
  detacher_group?: TruckFileDetacherGroup[];

  unknown?: TruckFileUnknown[];

  /*cameras?: TruckFileCameras;
    cineCam?: TruckFileCineCam;

    fusedrag?: TruckFileFuseDrag;
    turboJet?: TruckFileTurboJets[];
    turboProp?: TruckFileTurboProp[];
    pistonProp?: TruckFilePistonProp[];
    wings?: TruckFileWings[];

    wheels2?: TruckFileWheels2[];*/
  wheels?: TruckFileWheels[];
  /*
    slidenodes?: TruckFileSlideNodes[];
    shocks?: TruckFileShocks[];
    commands?: TruckFileCommands[];
    commands2?: TruckFileCommands2[];
    hydros?: TruckFileHydros[];
    animators?: TruckFileAnimators[];*/
}
