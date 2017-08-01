/*eslint-disable block-scoped-var, no-redeclare, no-control-regex, no-prototype-builtins*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.CursorMsg = (function() {

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
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
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
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.CursorMsg();
        while (reader.pos < end) {
            var tag = reader.uint32();
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
    var valuesById = {}, values = Object.create(valuesById);
    values[valuesById[0] = "HIDDEN"] = 0;
    values[valuesById[1] = "FROM"] = 1;
    values[valuesById[2] = "SELECTION_FROM"] = 2;
    values[valuesById[3] = "SELECTION_TO"] = 3;
    return values;
})();

$root.PositionMsg = (function() {

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
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
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
            for (var i = 0; i < message.base.length; ++i)
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
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.PositionMsg();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1:
                if (!(message.base && message.base.length))
                    message.base = [];
                if ((tag & 7) === 2) {
                    var end2 = reader.uint32() + reader.pos;
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

    return PositionMsg;
})();

module.exports = $root;
