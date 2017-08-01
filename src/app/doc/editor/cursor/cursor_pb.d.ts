import * as $protobuf from "protobufjs";

/** Properties of a CursorMsg. */
export interface ICursorMsg {

    /** CursorMsg from */
    from?: IPositionMsg;

    /** CursorMsg to */
    to?: IPositionMsg;

    /** CursorMsg state */
    state?: State;
}

/** Represents a CursorMsg. */
export class CursorMsg {

    /**
     * Constructs a new CursorMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: ICursorMsg);

    /** CursorMsg from. */
    public from?: (IPositionMsg|null);

    /** CursorMsg to. */
    public to?: (IPositionMsg|null);

    /** CursorMsg state. */
    public state: State;

    /**
     * Creates a new CursorMsg instance using the specified properties.
     * @param [properties] Properties to set
     * @returns CursorMsg instance
     */
    public static create(properties?: ICursorMsg): CursorMsg;

    /**
     * Encodes the specified CursorMsg message. Does not implicitly {@link CursorMsg.verify|verify} messages.
     * @param message CursorMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: ICursorMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a CursorMsg message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns CursorMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): CursorMsg;
}

/** State enum. */
export enum State {
    HIDDEN = 0,
    FROM = 1,
    SELECTION_FROM = 2,
    SELECTION_TO = 3
}

/** Properties of a PositionMsg. */
export interface IPositionMsg {

    /** PositionMsg base */
    base?: number[];

    /** PositionMsg last */
    last?: number;

    /** PositionMsg index */
    index?: number;
}

/** Represents a PositionMsg. */
export class PositionMsg {

    /**
     * Constructs a new PositionMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: IPositionMsg);

    /** PositionMsg base. */
    public base: number[];

    /** PositionMsg last. */
    public last: number;

    /** PositionMsg index. */
    public index: number;

    /**
     * Creates a new PositionMsg instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PositionMsg instance
     */
    public static create(properties?: IPositionMsg): PositionMsg;

    /**
     * Encodes the specified PositionMsg message. Does not implicitly {@link PositionMsg.verify|verify} messages.
     * @param message PositionMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IPositionMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PositionMsg message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns PositionMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PositionMsg;
}
