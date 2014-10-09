const HOSTNAME = 'coap.thethings.io'
    , API_VERSION = '0.1'
    , coap = require('coap')
    , events = require('events')
    , util = require('util')


var stringToBuffer = function (string) {
    return new Buffer(string, 'ascii');
}

var bufferToString = function (buffer) {
    return buffer.toString();
}

coap.registerOption('1215', stringToBuffer, bufferToString);


var Client = module.exports = function Client(config) {
    if (!(this instanceof Client)) {
        return new Client(config);
    }
    this.config = config;
}

function Req(request, object) {
    events.EventEmitter.call(this);
    this.request = request;
    var that = this;
    this.object = object;
    request.on('response', function (res) {
        that.emit('response', res);
    })
    this.end = function () {
        request.end(JSON.stringify(this.object));
    }
}

util.inherits(Req, events.EventEmitter);

Client.prototype.thingRead = function (key,parameters) {
    var params = "";
    for(param in parameters){
      params += param+"="+parameters[param]+'&';
    }
    var request = coap.request({
        hostname: HOSTNAME,
        pathname: API_VERSION + '/ThingRead/' + this.config.THING_TOKEN + '/' + key+'?'+params,
        options: {'1215': this.config.USER_TOKEN}});
    var req = new Req(request);
    return req;
}

Client.prototype.thingReadLatest = function (key,parameters) {
//Read the last item stored by the thing
    var req = coap.request({
        hostname: HOSTNAME,
        pathname: API_VERSION + '/ThingReadLatest/' + this.config.THING_TOKEN + '/' + key,
        options: {'1215': this.config.USER_TOKEN}
    });
    return new Req(req);
}

Client.prototype.thingWrite = function (object,parameters) {
    var request = coap.request({
        hostname: HOSTNAME,
        pathname: API_VERSION + '/ThingWrite',
        method: 'POST',
        options: {'1215': this.config.USER_TOKEN}});
    if (object === null || object === undefined) {
        throw 'Object to write not defined';
    }
    object.thing = {
        id: this.config.THING_TOKEN
    }
    var req = new Req(request,object);
    return req;
}
