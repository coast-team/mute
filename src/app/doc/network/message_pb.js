/*eslint-disable block-scoped-var, no-redeclare, no-control-regex, no-prototype-builtins*/
import * as $protobuf from "protobufjs/minimal";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

export const Message = $root.Message = (() => {

    /**
     * Properties of a Message.
     * @exports IMessage
     * @interface IMessage
     * @property {string} [service] Message service
     * @property {Uint8Array} [content] Message content
     */

    /**
     * Constructs a new Message.
     * @exports Message
     * @classdesc Represents a Message.
     * @constructor
     * @param {IMessage=} [properties] Properties to set
     */
    function Message(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Message service.
     * @member {string}service
     * @memberof Message
     * @instance
     */
    Message.prototype.service = "";

    /**
     * Message content.
     * @member {Uint8Array}content
     * @memberof Message
     * @instance
     */
    Message.prototype.content = $util.newBuffer([]);

    /**
     * Creates a new Message instance using the specified properties.
     * @function create
     * @memberof Message
     * @static
     * @param {IMessage=} [properties] Properties to set
     * @returns {Message} Message instance
     */
    Message.create = function create(properties) {
        return new Message(properties);
    };

    /**
     * Encodes the specified Message message. Does not implicitly {@link Message.verify|verify} messages.
     * @function encode
     * @memberof Message
     * @static
     * @param {IMessage} message Message message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Message.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.service != null && message.hasOwnProperty("service"))
            writer.uint32(/* id 1, wireType 2 =*/10).string(message.service);
        if (message.content != null && message.hasOwnProperty("content"))
            writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.content);
        return writer;
    };

    /**
     * Encodes the specified Message message, length delimited. Does not implicitly {@link Message.verify|verify} messages.
     * @function encodeDelimited
     * @memberof Message
     * @static
     * @param {IMessage} message Message message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Message.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a Message message from the specified reader or buffer.
     * @function decode
     * @memberof Message
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {Message} Message
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Message.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.Message();
        while (reader.pos < end) {
            let tag = reader.uint32();
            switch (tag >>> 3) {
            case 1:
                message.service = reader.string();
                break;
            case 2:
                message.content = reader.bytes();
                break;
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a Message message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof Message
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {Message} Message
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Message.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a Message message.
     * @function verify
     * @memberof Message
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    Message.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.service != null && message.hasOwnProperty("service"))
            if (!$util.isString(message.service))
                return "service: string expected";
        if (message.content != null && message.hasOwnProperty("content"))
            if (!(message.content && typeof message.content.length === "number" || $util.isString(message.content)))
                return "content: buffer expected";
        return null;
    };

    return Message;
})();

export const BotProtocol = $root.BotProtocol = (() => {

    /**
     * Properties of a BotProtocol.
     * @exports IBotProtocol
     * @interface IBotProtocol
     * @property {string} [key] BotProtocol key
     */

    /**
     * Constructs a new BotProtocol.
     * @exports BotProtocol
     * @classdesc Represents a BotProtocol.
     * @constructor
     * @param {IBotProtocol=} [properties] Properties to set
     */
    function BotProtocol(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * BotProtocol key.
     * @member {string}key
     * @memberof BotProtocol
     * @instance
     */
    BotProtocol.prototype.key = "";

    /**
     * Creates a new BotProtocol instance using the specified properties.
     * @function create
     * @memberof BotProtocol
     * @static
     * @param {IBotProtocol=} [properties] Properties to set
     * @returns {BotProtocol} BotProtocol instance
     */
    BotProtocol.create = function create(properties) {
        return new BotProtocol(properties);
    };

    /**
     * Encodes the specified BotProtocol message. Does not implicitly {@link BotProtocol.verify|verify} messages.
     * @function encode
     * @memberof BotProtocol
     * @static
     * @param {IBotProtocol} message BotProtocol message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    BotProtocol.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.key != null && message.hasOwnProperty("key"))
            writer.uint32(/* id 1, wireType 2 =*/10).string(message.key);
        return writer;
    };

    /**
     * Encodes the specified BotProtocol message, length delimited. Does not implicitly {@link BotProtocol.verify|verify} messages.
     * @function encodeDelimited
     * @memberof BotProtocol
     * @static
     * @param {IBotProtocol} message BotProtocol message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    BotProtocol.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a BotProtocol message from the specified reader or buffer.
     * @function decode
     * @memberof BotProtocol
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {BotProtocol} BotProtocol
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    BotProtocol.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.BotProtocol();
        while (reader.pos < end) {
            let tag = reader.uint32();
            switch (tag >>> 3) {
            case 1:
                message.key = reader.string();
                break;
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a BotProtocol message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof BotProtocol
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {BotProtocol} BotProtocol
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    BotProtocol.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a BotProtocol message.
     * @function verify
     * @memberof BotProtocol
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    BotProtocol.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.key != null && message.hasOwnProperty("key"))
            if (!$util.isString(message.key))
                return "key: string expected";
        return null;
    };

    return BotProtocol;
})();

export const BotResponse = $root.BotResponse = (() => {

    /**
     * Properties of a BotResponse.
     * @exports IBotResponse
     * @interface IBotResponse
     * @property {string} [url] BotResponse url
     */

    /**
     * Constructs a new BotResponse.
     * @exports BotResponse
     * @classdesc Represents a BotResponse.
     * @constructor
     * @param {IBotResponse=} [properties] Properties to set
     */
    function BotResponse(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * BotResponse url.
     * @member {string}url
     * @memberof BotResponse
     * @instance
     */
    BotResponse.prototype.url = "";

    /**
     * Creates a new BotResponse instance using the specified properties.
     * @function create
     * @memberof BotResponse
     * @static
     * @param {IBotResponse=} [properties] Properties to set
     * @returns {BotResponse} BotResponse instance
     */
    BotResponse.create = function create(properties) {
        return new BotResponse(properties);
    };

    /**
     * Encodes the specified BotResponse message. Does not implicitly {@link BotResponse.verify|verify} messages.
     * @function encode
     * @memberof BotResponse
     * @static
     * @param {IBotResponse} message BotResponse message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    BotResponse.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.url != null && message.hasOwnProperty("url"))
            writer.uint32(/* id 1, wireType 2 =*/10).string(message.url);
        return writer;
    };

    /**
     * Encodes the specified BotResponse message, length delimited. Does not implicitly {@link BotResponse.verify|verify} messages.
     * @function encodeDelimited
     * @memberof BotResponse
     * @static
     * @param {IBotResponse} message BotResponse message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    BotResponse.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a BotResponse message from the specified reader or buffer.
     * @function decode
     * @memberof BotResponse
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {BotResponse} BotResponse
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    BotResponse.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.BotResponse();
        while (reader.pos < end) {
            let tag = reader.uint32();
            switch (tag >>> 3) {
            case 1:
                message.url = reader.string();
                break;
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a BotResponse message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof BotResponse
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {BotResponse} BotResponse
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    BotResponse.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a BotResponse message.
     * @function verify
     * @memberof BotResponse
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    BotResponse.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.url != null && message.hasOwnProperty("url"))
            if (!$util.isString(message.url))
                return "url: string expected";
        return null;
    };

    return BotResponse;
})();

export { $root as default };
