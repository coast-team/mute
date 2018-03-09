import * as $protobuf from "protobufjs";

/** Properties of a Message. */
export interface IMessage {

    /** Message service */
    service?: (string|null);

    /** Message content */
    content?: (Uint8Array|null);
}

/** Represents a Message. */
export class Message implements IMessage {

    /**
     * Constructs a new Message.
     * @param [properties] Properties to set
     */
    constructor(properties?: IMessage);

    /** Message service. */
    public service: string;

    /** Message content. */
    public content: Uint8Array;

    /**
     * Creates a new Message instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Message instance
     */
    public static create(properties?: IMessage): Message;

    /**
     * Encodes the specified Message message. Does not implicitly {@link Message.verify|verify} messages.
     * @param message Message message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IMessage, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Message message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Message
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): Message;
}

/** Properties of a BotProtocol. */
export interface IBotProtocol {

    /** BotProtocol key */
    key?: (string|null);
}

/** Represents a BotProtocol. */
export class BotProtocol implements IBotProtocol {

    /**
     * Constructs a new BotProtocol.
     * @param [properties] Properties to set
     */
    constructor(properties?: IBotProtocol);

    /** BotProtocol key. */
    public key: string;

    /**
     * Creates a new BotProtocol instance using the specified properties.
     * @param [properties] Properties to set
     * @returns BotProtocol instance
     */
    public static create(properties?: IBotProtocol): BotProtocol;

    /**
     * Encodes the specified BotProtocol message. Does not implicitly {@link BotProtocol.verify|verify} messages.
     * @param message BotProtocol message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IBotProtocol, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a BotProtocol message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns BotProtocol
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): BotProtocol;
}

/** Properties of a BotResponse. */
export interface IBotResponse {

    /** BotResponse url */
    url?: (string|null);
}

/** Represents a BotResponse. */
export class BotResponse implements IBotResponse {

    /**
     * Constructs a new BotResponse.
     * @param [properties] Properties to set
     */
    constructor(properties?: IBotResponse);

    /** BotResponse url. */
    public url: string;

    /**
     * Creates a new BotResponse instance using the specified properties.
     * @param [properties] Properties to set
     * @returns BotResponse instance
     */
    public static create(properties?: IBotResponse): BotResponse;

    /**
     * Encodes the specified BotResponse message. Does not implicitly {@link BotResponse.verify|verify} messages.
     * @param message BotResponse message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IBotResponse, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a BotResponse message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns BotResponse
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): BotResponse;
}
