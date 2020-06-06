/**
 * Truck file section definitions
 */

export interface SECTION {
    sbd_preset_id: number;
    snd_preset_id: number;
    //sbds_preset_id: number; //scale
    grp_id: number;
    comment_id: number;
}

/**
 * Truck file header
 */
export interface TruckFileAuthors {
    type: string;
    author_id: number;
    author_name: string;
    email?: string;
}

export interface TruckFileInfo {
    title: string;
    authors: TruckFileAuthors[];
}

/**
 * Globals
 */
export interface TruckFileGlobals {
    dryMass: number;
    cargoMass: number;
    material: string;
}

/**
 * group
 */
export interface TruckFileDetacherGroup {
    detacher_id: number;
}

/**
 * group
 */
export interface TruckFileGroup {
    grp_id: number;
    title: string;
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
 * flexbodies
 */
export interface TruckFileFlexbodies {
    refNode: string;
    xNode: string;
    yNode: string;
    offsetX: number;
    offsetY: number;
    offsetZ: number;
    rotX: number;
    rotY: number;
    rotZ: number;
    meshName: string;
    forset: string;
    disableFlexbodyShadow?: boolean;
    flexbodyCameraMode?: number;
}

/**
 * Animators
 */
export interface TruckFileAnimators {
    node1: string;
    node2: string;
    factor: number;
    option: string;
}

/**
 * Shocks
 */
export interface TruckFileShocks {
    node1: string;
    node2: string;
    springRate: number;
    damping: number;
    maxContraction: number;
    maxExtention: number;
    preCompression: number;
    options?: string;
}

/**
 * Hydros
 */
export interface TruckFileHydros {
    node1: string;
    node2: string;
    lengtheningFactor: number;
    options?: string;
    startDelay?: number;
    stopDelay?: number;
    startFunction?: string;
    stopFunction?: string;
}

/**
 * Commands
 */
export interface TruckFileCommands {
    node1: string;
    node2: string;
    rateFactor: number;
    maxContraction: number;
    maxExtention: number;

    contractionKey: number;
    extentionKey: number;

    option?: string;
    description?: string;
}

/**
 * Commands2
 */
export interface TruckFileCommands2 {
    node1: string;
    node2: string;
    contractionRateFactor: number;
    extentionRateFactor: number;

    maxContraction: number;
    maxExtention: number;

    contractionKey: number;
    extentionKey: number;

    option?: string;
    description?: string;

    startDelay?: number;
    stopDelay?: number;
    startFunction?: string;
    stropFunction?: string;

    affectEngine?: number;
    needEngine?: boolean;
}

/**
 * Slidenodes
 */
export interface TruckFileSlideNodes {
    node1: string;
    node2: string;
    node3: string;
}

/**
 * Wheels
 * rorEditor will use this as default wheels
 */
export interface TruckFileWheels {
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
    material: string;
}

/**
 * Wheels2
 *
 */
export interface TruckFileWheels2 {
    rimRadius: number;
    tyreRadius: number;
    width: number;
    numRays: number;
    node1: string;
    node2: string;
    rigNode: string;
    braking: number;
    drive: number;
    refArmNode: string;
    mass: number;
    rimSpringness: number;
    rimDamping: number;
    tyreSpringness: number;
    tyreDamping: number;
    material: string;
}

/**
 * Wings
 */

export interface TruckFileWings {
    /**
     * Nodes
     */
    nodeA: string;
    nodeB: string;
    nodeC: string;
    nodeD: string;
    nodeE: string;
    nodeF: string;
    nodeG: string;
    nodeH: string;

    /**
     * texture coordinates
     */
    frontLeftX: number;
    frontLeftY: number;
    frontRightX: number;
    frontRightY: number;
    backLeftX: number;
    backLeftY: number;
    backRightX: number;
    backRightY: number;

    /**
     * Wing specific stuff
     */
    controlType: string;
    chordControlStart: number;
    minDeflection: number;
    maxDeflection: number;
    airfoil: string;
    coeff?: number;
}

/**
 * Fusedrag
 */

export interface TruckFileFuseDrag {
    frontNode: string;
    backNode: string;
    fuselageWidth: number;
    airfoil: string;
}

/**
 * Pistonprop
 */

export interface TruckFilePistonProp {
    refNode: string;
    axisNode: string;
    nodeBlade1: string;
    nodeBlade2: string;
    nodeBlade3: string;
    nodeBlade4: string;
    coupleNode: string;
    enginePower: number;
    pitch: number;
    airfoil: string;
}

/**
 * Truboprop
 */

export interface TruckFileTurboProp {
    refNode: string;
    axisNode: string;
    nodeBlade1: string;
    nodeBlade2: string;
    nodeBlade3: string;
    nodeBlade4: string;
    turbinePower: number;
    airfoil: string;
}

/**
 * Trubojets
 */

export interface TruckFileTurboJets {
    frontNode: string;
    backNode: string;
    sideNode: string;
    isReversable: boolean;
    dryThrust: number;
    wetThrust: number;
    frontDiameter: number;
    backDiameter: number;
    nozzleLenght: number;
}

/**
 * cameras
 */

export interface TruckFileCameras {
    centerNode: string;
    backNode: string;
    leftNode: string;
}

/**
 * Cinecam
 */

export interface TruckFileCineCam {
    x: number;
    y: number;
    z: number;
    node1: string;
    node2: string;
    node3: string;
    node4: string;
    node5: string;
    node6: string;
    node7: string;
    node8: string;
    spring?: number;
    damping?: number;
    nodeWeight?: number;
}

/**
 * Nodes
 */

export interface TruckFileNodes extends SECTION {
    id: string; //we parse as string
    idEditor: number;
    x: number;
    y: number;
    z: number;
    options?: string;
    sdm_id?: number; //set_default_minimass
}

/**
 * Beams
 */
export interface TruckFileBeams extends SECTION {
    node1: string;
    node2: string;
    options?: string;
    /**
     * We use id here to keep stuff in order
     */
    id: number;
    detacher_group_id?: number;
}

/**
 * The whole truck file interface
 */
export interface TruckFileInterface {
    info: TruckFileInfo;
    globals: TruckFileGlobals;
    nodes: TruckFileNodes[];
    beams: TruckFileBeams[];

    setNodesDefaults?: TruckFileSetNodesDefaults[];
    setBeamDefaults?: TruckFileSetBeamDefaults[];
    groups?: TruckFileGroup[];
    comments?: TruckFileComment[];
    detacher_group?: TruckFileDetacherGroup[];

    /*cameras?: TruckFileCameras;
    cineCam?: TruckFileCineCam;

    fusedrag?: TruckFileFuseDrag;
    turboJet?: TruckFileTurboJets[];
    turboProp?: TruckFileTurboProp[];
    pistonProp?: TruckFilePistonProp[];
    wings?: TruckFileWings[];

    wheels2?: TruckFileWheels2[];
    wheels?: TruckFileWheels[];

    slidenodes?: TruckFileSlideNodes[];
    shocks?: TruckFileShocks[];
    commands?: TruckFileCommands[];
    commands2?: TruckFileCommands2[];
    hydros?: TruckFileHydros[];
    animators?: TruckFileAnimators[];*/
}
