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

    /** PositionMsg id */
    id?: sync.IIdentifierMsg;

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

    /** PositionMsg id. */
    public id?: (sync.IIdentifierMsg|null);

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

/** Namespace sync. */
export namespace sync {

    /** Properties of a SyncMsg. */
    interface ISyncMsg {

        /** SyncMsg richLogootSOpMsg */
        richLogootSOpMsg?: sync.IRichLogootSOperationMsg;

        /** SyncMsg querySync */
        querySync?: sync.IQuerySyncMsg;

        /** SyncMsg replySync */
        replySync?: sync.IReplySyncMsg;
    }

    /** Represents a SyncMsg. */
    class SyncMsg {

        /**
         * Constructs a new SyncMsg.
         * @param [properties] Properties to set
         */
        constructor(properties?: sync.ISyncMsg);

        /** SyncMsg richLogootSOpMsg. */
        public richLogootSOpMsg?: (sync.IRichLogootSOperationMsg|null);

        /** SyncMsg querySync. */
        public querySync?: (sync.IQuerySyncMsg|null);

        /** SyncMsg replySync. */
        public replySync?: (sync.IReplySyncMsg|null);

        /** SyncMsg type. */
        public type?: string;

        /**
         * Creates a new SyncMsg instance using the specified properties.
         * @param [properties] Properties to set
         * @returns SyncMsg instance
         */
        public static create(properties?: sync.ISyncMsg): sync.SyncMsg;

        /**
         * Encodes the specified SyncMsg message. Does not implicitly {@link sync.SyncMsg.verify|verify} messages.
         * @param message SyncMsg message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: sync.ISyncMsg, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a SyncMsg message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns SyncMsg
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): sync.SyncMsg;
    }

    /** Properties of a RichLogootSOperationMsg. */
    interface IRichLogootSOperationMsg {

        /** RichLogootSOperationMsg id */
        id?: number;

        /** RichLogootSOperationMsg clock */
        clock?: number;

        /** RichLogootSOperationMsg logootSAddMsg */
        logootSAddMsg?: sync.ILogootSAddMsg;

        /** RichLogootSOperationMsg logootSDelMsg */
        logootSDelMsg?: sync.ILogootSDelMsg;
    }

    /** Represents a RichLogootSOperationMsg. */
    class RichLogootSOperationMsg {

        /**
         * Constructs a new RichLogootSOperationMsg.
         * @param [properties] Properties to set
         */
        constructor(properties?: sync.IRichLogootSOperationMsg);

        /** RichLogootSOperationMsg id. */
        public id: number;

        /** RichLogootSOperationMsg clock. */
        public clock: number;

        /** RichLogootSOperationMsg logootSAddMsg. */
        public logootSAddMsg?: (sync.ILogootSAddMsg|null);

        /** RichLogootSOperationMsg logootSDelMsg. */
        public logootSDelMsg?: (sync.ILogootSDelMsg|null);

        /** RichLogootSOperationMsg type. */
        public type?: string;

        /**
         * Creates a new RichLogootSOperationMsg instance using the specified properties.
         * @param [properties] Properties to set
         * @returns RichLogootSOperationMsg instance
         */
        public static create(properties?: sync.IRichLogootSOperationMsg): sync.RichLogootSOperationMsg;

        /**
         * Encodes the specified RichLogootSOperationMsg message. Does not implicitly {@link sync.RichLogootSOperationMsg.verify|verify} messages.
         * @param message RichLogootSOperationMsg message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: sync.IRichLogootSOperationMsg, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a RichLogootSOperationMsg message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns RichLogootSOperationMsg
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): sync.RichLogootSOperationMsg;
    }

    /** Properties of a LogootSAddMsg. */
    interface ILogootSAddMsg {

        /** LogootSAddMsg id */
        id?: sync.IIdentifierMsg;

        /** LogootSAddMsg content */
        content?: string;
    }

    /** Represents a LogootSAddMsg. */
    class LogootSAddMsg {

        /**
         * Constructs a new LogootSAddMsg.
         * @param [properties] Properties to set
         */
        constructor(properties?: sync.ILogootSAddMsg);

        /** LogootSAddMsg id. */
        public id?: (sync.IIdentifierMsg|null);

        /** LogootSAddMsg content. */
        public content: string;

        /**
         * Creates a new LogootSAddMsg instance using the specified properties.
         * @param [properties] Properties to set
         * @returns LogootSAddMsg instance
         */
        public static create(properties?: sync.ILogootSAddMsg): sync.LogootSAddMsg;

        /**
         * Encodes the specified LogootSAddMsg message. Does not implicitly {@link sync.LogootSAddMsg.verify|verify} messages.
         * @param message LogootSAddMsg message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: sync.ILogootSAddMsg, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a LogootSAddMsg message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns LogootSAddMsg
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): sync.LogootSAddMsg;
    }

    /** Properties of an IdentifierMsg. */
    interface IIdentifierMsg {

        /** IdentifierMsg tuples */
        tuples?: sync.IIdentifierTupleMsg[];
    }

    /** Represents an IdentifierMsg. */
    class IdentifierMsg {

        /**
         * Constructs a new IdentifierMsg.
         * @param [properties] Properties to set
         */
        constructor(properties?: sync.IIdentifierMsg);

        /** IdentifierMsg tuples. */
        public tuples: sync.IIdentifierTupleMsg[];

        /**
         * Creates a new IdentifierMsg instance using the specified properties.
         * @param [properties] Properties to set
         * @returns IdentifierMsg instance
         */
        public static create(properties?: sync.IIdentifierMsg): sync.IdentifierMsg;

        /**
         * Encodes the specified IdentifierMsg message. Does not implicitly {@link sync.IdentifierMsg.verify|verify} messages.
         * @param message IdentifierMsg message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: sync.IIdentifierMsg, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an IdentifierMsg message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns IdentifierMsg
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): sync.IdentifierMsg;
    }

    /** Properties of an IdentifierTupleMsg. */
    interface IIdentifierTupleMsg {

        /** IdentifierTupleMsg random */
        random?: number;

        /** IdentifierTupleMsg replicaNumber */
        replicaNumber?: number;

        /** IdentifierTupleMsg clock */
        clock?: number;

        /** IdentifierTupleMsg offset */
        offset?: number;
    }

    /** Represents an IdentifierTupleMsg. */
    class IdentifierTupleMsg {

        /**
         * Constructs a new IdentifierTupleMsg.
         * @param [properties] Properties to set
         */
        constructor(properties?: sync.IIdentifierTupleMsg);

        /** IdentifierTupleMsg random. */
        public random: number;

        /** IdentifierTupleMsg replicaNumber. */
        public replicaNumber: number;

        /** IdentifierTupleMsg clock. */
        public clock: number;

        /** IdentifierTupleMsg offset. */
        public offset: number;

        /**
         * Creates a new IdentifierTupleMsg instance using the specified properties.
         * @param [properties] Properties to set
         * @returns IdentifierTupleMsg instance
         */
        public static create(properties?: sync.IIdentifierTupleMsg): sync.IdentifierTupleMsg;

        /**
         * Encodes the specified IdentifierTupleMsg message. Does not implicitly {@link sync.IdentifierTupleMsg.verify|verify} messages.
         * @param message IdentifierTupleMsg message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: sync.IIdentifierTupleMsg, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an IdentifierTupleMsg message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns IdentifierTupleMsg
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): sync.IdentifierTupleMsg;
    }

    /** Properties of a LogootSDelMsg. */
    interface ILogootSDelMsg {

        /** LogootSDelMsg lid */
        lid?: sync.IIdentifierIntervalMsg[];
    }

    /** Represents a LogootSDelMsg. */
    class LogootSDelMsg {

        /**
         * Constructs a new LogootSDelMsg.
         * @param [properties] Properties to set
         */
        constructor(properties?: sync.ILogootSDelMsg);

        /** LogootSDelMsg lid. */
        public lid: sync.IIdentifierIntervalMsg[];

        /**
         * Creates a new LogootSDelMsg instance using the specified properties.
         * @param [properties] Properties to set
         * @returns LogootSDelMsg instance
         */
        public static create(properties?: sync.ILogootSDelMsg): sync.LogootSDelMsg;

        /**
         * Encodes the specified LogootSDelMsg message. Does not implicitly {@link sync.LogootSDelMsg.verify|verify} messages.
         * @param message LogootSDelMsg message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: sync.ILogootSDelMsg, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a LogootSDelMsg message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns LogootSDelMsg
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): sync.LogootSDelMsg;
    }

    /** Properties of an IdentifierIntervalMsg. */
    interface IIdentifierIntervalMsg {

        /** IdentifierIntervalMsg idBegin */
        idBegin?: sync.IIdentifierMsg;

        /** IdentifierIntervalMsg end */
        end?: number;
    }

    /** Represents an IdentifierIntervalMsg. */
    class IdentifierIntervalMsg {

        /**
         * Constructs a new IdentifierIntervalMsg.
         * @param [properties] Properties to set
         */
        constructor(properties?: sync.IIdentifierIntervalMsg);

        /** IdentifierIntervalMsg idBegin. */
        public idBegin?: (sync.IIdentifierMsg|null);

        /** IdentifierIntervalMsg end. */
        public end: number;

        /**
         * Creates a new IdentifierIntervalMsg instance using the specified properties.
         * @param [properties] Properties to set
         * @returns IdentifierIntervalMsg instance
         */
        public static create(properties?: sync.IIdentifierIntervalMsg): sync.IdentifierIntervalMsg;

        /**
         * Encodes the specified IdentifierIntervalMsg message. Does not implicitly {@link sync.IdentifierIntervalMsg.verify|verify} messages.
         * @param message IdentifierIntervalMsg message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: sync.IIdentifierIntervalMsg, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an IdentifierIntervalMsg message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns IdentifierIntervalMsg
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): sync.IdentifierIntervalMsg;
    }

    /** Properties of a QuerySyncMsg. */
    interface IQuerySyncMsg {

        /** QuerySyncMsg vector */
        vector?: { [k: string]: number };
    }

    /** Represents a QuerySyncMsg. */
    class QuerySyncMsg {

        /**
         * Constructs a new QuerySyncMsg.
         * @param [properties] Properties to set
         */
        constructor(properties?: sync.IQuerySyncMsg);

        /** QuerySyncMsg vector. */
        public vector: { [k: string]: number };

        /**
         * Creates a new QuerySyncMsg instance using the specified properties.
         * @param [properties] Properties to set
         * @returns QuerySyncMsg instance
         */
        public static create(properties?: sync.IQuerySyncMsg): sync.QuerySyncMsg;

        /**
         * Encodes the specified QuerySyncMsg message. Does not implicitly {@link sync.QuerySyncMsg.verify|verify} messages.
         * @param message QuerySyncMsg message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: sync.IQuerySyncMsg, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a QuerySyncMsg message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns QuerySyncMsg
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): sync.QuerySyncMsg;
    }

    /** Properties of a ReplySyncMsg. */
    interface IReplySyncMsg {

        /** ReplySyncMsg richLogootSOpsMsg */
        richLogootSOpsMsg?: sync.IRichLogootSOperationMsg[];

        /** ReplySyncMsg intervals */
        intervals?: sync.IIntervalMsg[];
    }

    /** Represents a ReplySyncMsg. */
    class ReplySyncMsg {

        /**
         * Constructs a new ReplySyncMsg.
         * @param [properties] Properties to set
         */
        constructor(properties?: sync.IReplySyncMsg);

        /** ReplySyncMsg richLogootSOpsMsg. */
        public richLogootSOpsMsg: sync.IRichLogootSOperationMsg[];

        /** ReplySyncMsg intervals. */
        public intervals: sync.IIntervalMsg[];

        /**
         * Creates a new ReplySyncMsg instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ReplySyncMsg instance
         */
        public static create(properties?: sync.IReplySyncMsg): sync.ReplySyncMsg;

        /**
         * Encodes the specified ReplySyncMsg message. Does not implicitly {@link sync.ReplySyncMsg.verify|verify} messages.
         * @param message ReplySyncMsg message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: sync.IReplySyncMsg, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ReplySyncMsg message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns ReplySyncMsg
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): sync.ReplySyncMsg;
    }

    /** Properties of an IntervalMsg. */
    interface IIntervalMsg {

        /** IntervalMsg id */
        id?: number;

        /** IntervalMsg begin */
        begin?: number;

        /** IntervalMsg end */
        end?: number;
    }

    /** Represents an IntervalMsg. */
    class IntervalMsg {

        /**
         * Constructs a new IntervalMsg.
         * @param [properties] Properties to set
         */
        constructor(properties?: sync.IIntervalMsg);

        /** IntervalMsg id. */
        public id: number;

        /** IntervalMsg begin. */
        public begin: number;

        /** IntervalMsg end. */
        public end: number;

        /**
         * Creates a new IntervalMsg instance using the specified properties.
         * @param [properties] Properties to set
         * @returns IntervalMsg instance
         */
        public static create(properties?: sync.IIntervalMsg): sync.IntervalMsg;

        /**
         * Encodes the specified IntervalMsg message. Does not implicitly {@link sync.IntervalMsg.verify|verify} messages.
         * @param message IntervalMsg message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: sync.IIntervalMsg, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an IntervalMsg message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns IntervalMsg
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): sync.IntervalMsg;
    }
}
