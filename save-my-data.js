/* NODE-RED-CONTRIB-SNAP4CITY-USER
   Copyright (C) 2018 DISIT Lab http://www.disit.org - University of Florence

   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU Affero General Public License as
   published by the Free Software Foundation, either version 3 of the
   License, or (at your option) any later version.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU Affero General Public License for more details.

   You should have received a copy of the GNU Affero General Public License
   along with this program.  If not, see <http://www.gnu.org/licenses/>. */
module.exports = function (RED) {

    function SaveMyData(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.on('input', function (msg) {
            var s4cUtility = require("./snap4city-utility.js");
            var uid = s4cUtility.retrieveAppID(RED);
            var uri = (RED.settings.myPersonalDataUrl ? RED.settings.myPersonalDataUrl : "https://www.snap4city.org/mypersonaldata/") + "api/v1/apps/" + uid + "/data";
            var inPayload = msg.payload;
            var variableName = (msg.payload.variablename ? msg.payload.variablename : config.variablename);
            var variableValue = (msg.payload.variablevalue ? msg.payload.variablevalue : config.variablevalue);
            var variableUnit = (msg.payload.variableunit ? msg.payload.variableunit : config.variableunit);
            var motivation = (msg.payload.name ? msg.payload.name : config.name);
            var accessToken = "";
            accessToken = s4cUtility.retrieveAccessToken(RED, node, config.authentication, uid);
            if (accessToken != "" && typeof accessToken != "undefined") {
                var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
                var xmlHttp = new XMLHttpRequest();
                console.log(encodeURI(uri + "?accessToken=" + accessToken));
                xmlHttp.open("POST", encodeURI(uri + "?sourceRequest=iotapp"), true);
                xmlHttp.setRequestHeader("Content-Type", "application/json");
                xmlHttp.setRequestHeader("Authorization", "Bearer " + accessToken);
                console.log(JSON.stringify({
                    "dataTime": Date.now(),
                    "variableName": variableName,
                    "variableValue": variableValue,
                    "variableUnit": variableUnit,
                    "motivation": motivation,
                    "APPID": uid.toString('utf8')
                }));
                xmlHttp.onload = function (e) {
                    if (xmlHttp.readyState === 4) {
                        if (xmlHttp.status === 200) {
                            console.log(xmlHttp.status);
                            if (xmlHttp.responseText != "") {
                                try {
                                    msg.payload = JSON.parse(xmlHttp.responseText);
                                } catch (e) {
                                    msg.payload = xmlHttp.responseText;
                                }
                            } else {
                                msg.payload = JSON.parse("{\"status\": \"There was some problem\"}");
                            }
                            s4cUtility.eventLog(RED, inPayload, msg, config, "Node-Red", "MyData", uri, "TX");
                            node.send(msg);
                        } else {
                            console.error(xmlHttp.statusText);
                            node.error(xmlHttp.responseText);
                        }
                    }
                };
                xmlHttp.onerror = function (e) {
                    console.error(xmlHttp.statusText);
                    node.error(xmlHttp.responseText);
                };
                try {
                    xmlHttp.send(JSON.stringify({
                        "dataTime": Date.now(),
                        "variableName": variableName,
                        "variableValue": variableValue,
                        "variableUnit": variableUnit,
                        "motivation": motivation,
                        "APPID": uid.toString('utf8')
                    }));
                } catch (e) {
                    console.log(e);
                }
            }
        });
    }

    RED.nodes.registerType("save-my-data", SaveMyData);
}