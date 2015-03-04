var theThingsCoAP = require('../')

//create Client
var client = theThingsCoAP.createClient()

client.on('ready', function () {
    client.thingRead('voltage', {limit: 15}, function (error, data) {
        console.log(error ? error : data)
    })
})
