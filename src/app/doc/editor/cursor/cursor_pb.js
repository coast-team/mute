/*eslint-disable block-scoped-var, no-redeclare, no-control-regex, no-prototype-builtins*/
import * as $protobuf from "protobufjs/minimal";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

export const CursorMsg = $root.CursorMsg = (() => {

    /**
     * Properties of a CursorMsg.
     * @exports ICursorMsg
     * @interface ICursorMsg
     * @property {IPositionMsg} [from] CursorMsg from
     * @property {IPositionMsg} [to] CursorMsg to
     * @property {State} [state] CursorMsg state
     */

    /**
     * Constructs a new CursorMsg.
     * @exports CursorMsg
     * @classdesc Represents a CursorMsg.
     * @constructor
     * @param {ICursorMsg=} [properties] Properties to set
     */
    function CursorMsg(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * CursorMsg from.
     * @member {(IPositionMsg|null|undefined)}from
     * @memberof CursorMsg
     * @instance
     */
    CursorMsg.prototype.from = null;

    /**
     * CursorMsg to.
     * @member {(IPositionMsg|null|undefined)}to
     * @memberof CursorMsg
     * @instance
     */
    CursorMsg.prototype.to = null;

    /**
     * CursorMsg state.
     * @member {State}state
     * @memberof CursorMsg
     * @instance
     */
    CursorMsg.prototype.state = 0;

    /**
     * Creates a new CursorMsg instance using the specified properties.
     * @function create
     * @memberof CursorMsg
     * @static
     * @param {ICursorMsg=} [properties] Properties to set
     * @returns {CursorMsg} CursorMsg instance
     */
    CursorMsg.create = function create(properties) {
        return new CursorMsg(properties);
    };

    /**
     * Encodes the specified CursorMsg message. Does not implicitly {@link CursorMsg.verify|verify} messages.
     * @function encode
     * @memberof CursorMsg
     * @static
     * @param {ICursorMsg} message CursorMsg message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    CursorMsg.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.from != null && message.hasOwnProperty("from"))
            $root.PositionMsg.encode(message.from, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
        if (message.to != null && message.hasOwnProperty("to"))
            $root.PositionMsg.encode(message.to, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
        if (message.state != null && message.hasOwnProperty("state"))
            writer.uint32(/* id 3, wireType 0 =*/24).int32(message.state);
        return writer;
    };

    /**
     * Encodes the specified CursorMsg message, length delimited. Does not implicitly {@link CursorMsg.verify|verify} messages.
     * @function encodeDelimited
     * @memberof CursorMsg
     * @static
     * @param {ICursorMsg} message CursorMsg message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    CursorMsg.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a CursorMsg message from the specified reader or buffer.
     * @function decode
     * @memberof CursorMsg
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {CursorMsg} CursorMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    CursorMsg.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.CursorMsg();
        while (reader.pos < end) {
            let tag = reader.uint32();
            switch (tag >>> 3) {
            case 1:
                message.from = $root.PositionMsg.decode(reader, reader.uint32());
                break;
            case 2:
                message.to = $root.PositionMsg.decode(reader, reader.uint32());
                break;
            case 3:
                message.state = reader.int32();
                break;
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a CursorMsg message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof CursorMsg
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {CursorMsg} CursorMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    CursorMsg.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a CursorMsg message.
     * @function verify
     * @memberof CursorMsg
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    CursorMsg.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.from != null && message.hasOwnProperty("from")) {
            let error = $root.PositionMsg.verify(message.from);
            if (error)
                return "from." + error;
        }
        if (message.to != null && message.hasOwnProperty("to")) {
            error = $root.PositionMsg.verify(message.to);
            if (error)
                return "to." + error;
        }
        if (message.state != null && message.hasOwnProperty("state"))
            switch (message.state) {
            default:
                return "state: enum value expected";
            case 0:
            case 1:
            case 2:
            case 3:
                break;
            }
        return null;
    };

    /**
     * Creates a CursorMsg message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof CursorMsg
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {CursorMsg} CursorMsg
     */
    CursorMsg.fromObject = function fromObject(object) {
        if (object instanceof $root.CursorMsg)
            return object;
        let message = new $root.CursorMsg();
        if (object.from != null) {
            if (typeof object.from !== "object")
                throw TypeError(".CursorMsg.from: object expected");
            message.from = $root.PositionMsg.fromObject(object.from);
        }
        if (object.to != null) {
            if (typeof object.to !== "object")
                throw TypeError(".CursorMsg.to: object expected");
            message.to = $root.PositionMsg.fromObject(object.to);
        }
        switch (object.state) {
        case "HIDDEN":
        case 0:
            message.state = 0;
            break;
        case "FROM":
        case 1:
            message.state = 1;
            break;
        case "SELECTION_FROM":
        case 2:
            message.state = 2;
            break;
        case "SELECTION_TO":
        case 3:
            message.state = 3;
            break;
        }
        return message;
    };

    /**
     * Creates a plain object from a CursorMsg message. Also converts values to other types if specified.
     * @function toObject
     * @memberof CursorMsg
     * @static
     * @param {CursorMsg} message CursorMsg
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    CursorMsg.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        let object = {};
        if (options.defaults) {
            object.from = null;
            object.to = null;
            object.state = options.enums === String ? "HIDDEN" : 0;
        }
        if (message.from != null && message.hasOwnProperty("from"))
            object.from = $root.PositionMsg.toObject(message.from, options);
        if (message.to != null && message.hasOwnProperty("to"))
            object.to = $root.PositionMsg.toObject(message.to, options);
        if (message.state != null && message.hasOwnProperty("state"))
            object.state = options.enums === String ? $root.State[message.state] : message.state;
        return object;
    };

    /**
     * Converts this CursorMsg to JSON.
     * @function toJSON
     * @memberof CursorMsg
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    CursorMsg.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    return CursorMsg;
})();

/**
 * State enum.
 * @exports State
 * @enum {string}
 * @property {number} HIDDEN=0 HIDDEN value
 * @property {number} FROM=1 FROM value
 * @property {number} SELECTION_FROM=2 SELECTION_FROM value
 * @property {number} SELECTION_TO=3 SELECTION_TO value
 */
$root.State = (function() {
    const valuesById = {}, values = Object.create(valuesById);
    values[valuesById[0] = "HIDDEN"] = 0;
    values[valuesById[1] = "FROM"] = 1;
    values[valuesById[2] = "SELECTION_FROM"] = 2;
    values[valuesById[3] = "SELECTION_TO"] = 3;
    return values;
})();

export const PositionMsg = $root.PositionMsg = (() => {

    /**
     * Properties of a PositionMsg.
     * @exports IPositionMsg
     * @interface IPositionMsg
     * @property {Array.<number>} [base] PositionMsg base
     * @property {number} [last] PositionMsg last
     * @property {number} [index] PositionMsg index
     */

    /**
     * Constructs a new PositionMsg.
     * @exports PositionMsg
     * @classdesc Represents a PositionMsg.
     * @constructor
     * @param {IPositionMsg=} [properties] Properties to set
     */
    function PositionMsg(properties) {
        this.base = [];
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * PositionMsg base.
     * @member {Array.<number>}base
     * @memberof PositionMsg
     * @instance
     */
    PositionMsg.prototype.base = $util.emptyArray;

    /**
     * PositionMsg last.
     * @member {number}last
     * @memberof PositionMsg
     * @instance
     */
    PositionMsg.prototype.last = 0;

    /**
     * PositionMsg index.
     * @member {number}index
     * @memberof PositionMsg
     * @instance
     */
    PositionMsg.prototype.index = 0;

    /**
     * Creates a new PositionMsg instance using the specified properties.
     * @function create
     * @memberof PositionMsg
     * @static
     * @param {IPositionMsg=} [properties] Properties to set
     * @returns {PositionMsg} PositionMsg instance
     */
    PositionMsg.create = function create(properties) {
        return new PositionMsg(properties);
    };

    /**
     * Encodes the specified PositionMsg message. Does not implicitly {@link PositionMsg.verify|verify} messages.
     * @function encode
     * @memberof PositionMsg
     * @static
     * @param {IPositionMsg} message PositionMsg message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PositionMsg.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.base != null && message.base.length) {
            writer.uint32(/* id 1, wireType 2 =*/10).fork();
            for (let i = 0; i < message.base.length; ++i)
                writer.double(message.base[i]);
            writer.ldelim();
        }
        if (message.last != null && message.hasOwnProperty("last"))
            writer.uint32(/* id 2, wireType 0 =*/16).int32(message.last);
        if (message.index != null && message.hasOwnProperty("index"))
            writer.uint32(/* id 3, wireType 0 =*/24).int32(message.index);
        return writer;
    };

    /**
     * Encodes the specified PositionMsg message, length delimited. Does not implicitly {@link PositionMsg.verify|verify} messages.
     * @function encodeDelimited
     * @memberof PositionMsg
     * @static
     * @param {IPositionMsg} message PositionMsg message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PositionMsg.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a PositionMsg message from the specified reader or buffer.
     * @function decode
     * @memberof PositionMsg
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {PositionMsg} PositionMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PositionMsg.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.PositionMsg();
        while (reader.pos < end) {
            let tag = reader.uint32();
            switch (tag >>> 3) {
            case 1:
                if (!(message.base && message.base.length))
                    message.base = [];
                if ((tag & 7) === 2) {
                    let end2 = reader.uint32() + reader.pos;
                    while (reader.pos < end2)
                        message.base.push(reader.double());
                } else
                    message.base.push(reader.double());
                break;
            case 2:
                message.last = reader.int32();
                break;
            case 3:
                message.index = reader.int32();
                break;
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a PositionMsg message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof PositionMsg
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {PositionMsg} PositionMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PositionMsg.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a PositionMsg message.
     * @function verify
     * @memberof PositionMsg
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    PositionMsg.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.base != null && message.hasOwnProperty("base")) {
            if (!Array.isArray(message.base))
                return "base: array expected";
            for (let i = 0; i < message.base.length; ++i)
                if (typeof message.base[i] !== "number")
                    return "base: number[] expected";
        }
        if (message.last != null && message.hasOwnProperty("last"))
            if (!$util.isInteger(message.last))
                return "last: integer expected";
        if (message.index != null && message.hasOwnProperty("index"))
            if (!$util.isInteger(message.index))
                return "index: integer expected";
        return null;
    };

    /**
     * Creates a PositionMsg message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof PositionMsg
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {PositionMsg} PositionMsg
     */
    PositionMsg.fromObject = function fromObject(object) {
        if (object instanceof $root.PositionMsg)
            return object;
        let message = new $root.PositionMsg();
        if (object.base) {
            if (!Array.isArray(object.base))
                throw TypeError(".PositionMsg.base: array expected");
            message.base = [];
            for (let i = 0; i < object.base.length; ++i)
                message.base[i] = Number(object.base[i]);
        }
        if (object.last != null)
            message.last = object.last | 0;
        if (object.index != null)
            message.index = object.index | 0;
        return message;
    };

    /**
     * Creates a plain object from a PositionMsg message. Also converts values to other types if specified.
     * @function toObject
     * @memberof PositionMsg
     * @static
     * @param {PositionMsg} message PositionMsg
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    PositionMsg.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        let object = {};
        if (options.arrays || options.defaults)
            object.base = [];
        if (options.defaults) {
            object.last = 0;
            object.index = 0;
        }
        if (message.base && message.base.length) {
            object.base = [];
            for (let j = 0; j < message.base.length; ++j)
                object.base[j] = options.json && !isFinite(message.base[j]) ? String(message.base[j]) : message.base[j];
        }
        if (message.last != null && message.hasOwnProperty("last"))
            object.last = message.last;
        if (message.index != null && message.hasOwnProperty("index"))
            object.index = message.index;
        return object;
    };

    /**
     * Converts this PositionMsg to JSON.
     * @function toJSON
     * @memberof PositionMsg
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    PositionMsg.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    return PositionMsg;
})();

export { $root as default };
