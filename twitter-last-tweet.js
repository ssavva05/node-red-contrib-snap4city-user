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

    function twitterlasttweet(config) {
        var s4cUtility = require("./snap4city-utility.js");
        RED.nodes.createNode(this, config);
        var node = this;
        node.on("input", function (msg) {
            var uri = "http://disit.org/rttv/query/select.php";
            var TwRtwChannel = (msg.payload.TwRtwChannel ? msg.payload.TwRtwChannel : config.TwRtwChannel);
            var username = (msg.payload.username ? msg.payload.username : config.username);
            var password = (msg.payload.password ? msg.payload.username : config.password);
            var inPayload = msg.payload;
            var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
            var btoa = require("btoa");
            var xmlHttp = new XMLHttpRequest();
            console.log(encodeURI(uri + "?TwRtwChannel=" + TwRtwChannel));
            xmlHttp.open("GET", encodeURI(uri + "?TwRtwChannel=" + TwRtwChannel), true);
            xmlHttp.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
            xmlHttp.onload = function (e) {
                if (xmlHttp.readyState === 4) {
                    if (xmlHttp.status === 200) {
                        if (xmlHttp.responseText != "") {
                            try {
                                msg.payload = JSON.parse(xmlHttp.responseText);
                            } catch (e) {
                                msg.payload = xmlHttp.responseText;
                            }
                        } else {
                            msg.payload = JSON.parse("{\"status\": \"There was some problem\"}");
                        }
                        s4cUtility.eventLog(RED, inPayload, msg, config, "Node-Red", "TwitterVigilance", uri, "RX");
                        node.send(msg);
                    } else {
                        console.error(xmlHttp.statusText);   node.error(xmlHttp.responseText);
                    }
                }
            };
            xmlHttp.onerror = function (e) {
                console.error(xmlHttp.statusText);   node.error(xmlHttp.responseText);
            };
            xmlHttp.send(null);
        });
    }
    RED.nodes.registerType("twitter-last-tweet", twitterlasttweet);
}