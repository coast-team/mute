import * as $protobuf from "protobufjs";

/** Properties of a Message. */
export interface IMessage {

    /** Message service */
    service?: string;

    /** Message content */
    content?: Uint8Array;
}

/** Represents a Message. */
export class Message {

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
     * Encodes the specified Message message, length delimited. Does not implicitly {@link Message.verify|verify} messages.
     * @param message Message message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IMessage, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Message message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Message
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): Message;

    /**
     * Decodes a Message message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Message
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): Message;

    /**
     * Verifies a Message message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a Message message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Message
     */
    public static fromObject(object: { [k: string]: any }): Message;

    /**
     * Creates a plain object from a Message message. Also converts values to other types if specified.
     * @param message Message
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: Message, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this Message to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Properties of a BotProtocol. */
export interface IBotProtocol {

    /** BotProtocol key */
    key?: string;
}

/** Represents a BotProtocol. */
export class BotProtocol {

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
     * Encodes the specified BotProtocol message, length delimited. Does not implicitly {@link BotProtocol.verify|verify} messages.
     * @param message BotProtocol message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IBotProtocol, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a BotProtocol message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns BotProtocol
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): BotProtocol;

    /**
     * Decodes a BotProtocol message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns BotProtocol
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): BotProtocol;

    /**
     * Verifies a BotProtocol message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a BotProtocol message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns BotProtocol
     */
    public static fromObject(object: { [k: string]: any }): BotProtocol;

    /**
     * Creates a plain object from a BotProtocol message. Also converts values to other types if specified.
     * @param message BotProtocol
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: BotProtocol, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this BotProtocol to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Properties of a BotResponse. */
export interface IBotResponse {

    /** BotResponse url */
    url?: string;
}

/** Represents a BotResponse. */
export class BotResponse {

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
     * Encodes the specified BotResponse message, length delimited. Does not implicitly {@link BotResponse.verify|verify} messages.
     * @param message BotResponse message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IBotResponse, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a BotResponse message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns BotResponse
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): BotResponse;

    /**
     * Decodes a BotResponse message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns BotResponse
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): BotResponse;

    /**
     * Verifies a BotResponse message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a BotResponse message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns BotResponse
     */
    public static fromObject(object: { [k: string]: any }): BotResponse;

    /**
     * Creates a plain object from a BotResponse message. Also converts values to other types if specified.
     * @param message BotResponse
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: BotResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this BotResponse to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}
