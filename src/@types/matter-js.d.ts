declare namespace Matter {
  export interface IRendererOptions {
    /**
     * The target width in pixels of the `render.canvas` to be created.
     *
     * @property options.width
     * @type number
     * @default 800
     */
    width?: number;

    /**
     * The target height in pixels of the `render.canvas` to be created.
     *
     * @property options.height
     * @type number
     * @default 600
     */
    height?: number;

    /**
     * @property options.pixelRatio
     * @type number
     * @default 1
     */
    pixelRatio?: number;

    /**
     * Sets scene background
     * @type string
     * default "#18181a"
     */
    background?: string;

    /**
     * Sets wireframe background if `render.options.wireframes` is enabled
     * @type string
     * default "#0f0f13"
     */
    wireframeBackground?: string;

    /**
     * A flag that specifies if `render.bounds` should be used when rendering.
     *
     * @property options.hasBounds
     * @type boolean
     * @default false
     */
    hasBounds?: boolean;

    /**
     * @property options.enabled
     * @type boolean
     * @default true
     */
    enabled?: boolean;

    /**
     * Render wireframes only
     * @type boolean
     * @default true
     */
    wireframes?: boolean;

    /**
     * @type boolean
     * @default true
     */
    showSleeping?: boolean;

    /**
     * @type boolean
     * @default false
     */
    showDebug?: boolean;

    /**
     * @type boolean
     * @default false
     */
    showBroadphase?: boolean;

    /**
     * @type boolean
     * @default false
     */
    showBounds?: boolean;

    /**
     * @type boolean
     * @default false
     */
    showVelocity?: boolean;

    /**
     * @type boolean
     * @default false
     */
    showCollisions?: boolean;

    /**
     * @type boolean
     * @default false
     */
    showSeparations?: boolean;

    /**
     * @type boolean
     * @default false
     */
    showAxes?: boolean;

    /**
     * @type boolean
     * @default false
     */
    showPositions?: boolean;

    /**
     * @type boolean
     * @default false
     */
    showAngleIndicator?: boolean;

    /**
     * @type boolean
     * @default false
     */
    showIds?: boolean;

    /**
     * @type boolean
     * @default false
     */
    showShadows?: boolean;

    /**
     * @type boolean
     * @default false
     */
    showVertexNumbers?: boolean;

    /**
     * @type boolean
     * @default false
     */
    showConvexHulls?: boolean;

    /**
     * @type boolean
     * @default false
     */
    showInternalEdges?: boolean;

    /**
     * @type boolean
     * @default false
     */
    showMousePosition?: boolean;
  }
}
