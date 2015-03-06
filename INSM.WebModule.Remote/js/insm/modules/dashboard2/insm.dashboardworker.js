/*
* INSM File
* This file contain the INSM File plugin
* 
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by worker = new Worker("insm.dashboardworkers.js");
*
* File dependencies:
* jQuery 1.9.1
* 
* Author:
* Guo Yang
* Instoremedia AB
*/
//self.postMessage("I'm working befor postMessage('ali').");
var players;
self.onmessage = function (event) {
    var receivedData = JSON.parse(event.data);
    players = filterPlayer(receivedData.regionTree);
    var playerNumber = players.length;
   
    var categoryLookup= {};
    for(var categoryName in receivedData.categories) {
        categoryLookup[categoryName] = {};
        categoryLookup[categoryName].affectedPlayerIds = [];
        categoryLookup[categoryName].numberInRegions = 0;
        categoryLookup[categoryName].compareWithAllPlayer = receivedData.categories[categoryName].compareWithAllPlayer
        for(var index in players) {
            var inCategory = false;
            var regionPathId = [];
            for (var j in players[index].regionPath) {
                regionPathId.push(players[index].regionPath[j].id);
            }
            if (receivedData.categories[categoryName].regionIds) {
                for (var i in receivedData.categories[categoryName].regionIds) {

                    if (regionPathId.indexOf(receivedData.categories[categoryName].regionIds[i].toString()) > -1) {
                        categoryLookup[categoryName].numberInRegions = categoryLookup[categoryName].numberInRegions + 1;
                        if (receivedData.categories[categoryName].states) {
                            if (receivedData.categories[categoryName].states.indexOf(players[index].status.state) > -1) {
                                inCategory = true;
                            }
                        }
                        if (receivedData.categories[categoryName].fulfilmentStates) {
                            if (receivedData.categories[categoryName].fulfilmentStates.indexOf(players[index].fulfilmentStatus.state) > -1) {
                                inCategory = true;
                            }
                        }
                        if (receivedData.categories[categoryName].eventIds) {
                            if (receivedData.categories[categoryName].eventIds.indexOf(players[index].status.eventId) > -1) {
                                inCategory = true;
                            }
                        }
                        if (!receivedData.categories[categoryName].eventIds && !receivedData.categories[categoryName].fulfilmentStates && !receivedData.categories[categoryName].states && categoryLookup[categoryName].numberInRegions) {
                            inCategory = true;
                        }
                    }
                };
            } else {
                if (receivedData.categories[categoryName].states) {
                    if (receivedData.categories[categoryName].states.indexOf(players[index].status.state) > -1) {
                        inCategory = true;

                    }
                    
                }
                if (receivedData.categories[categoryName].fulfilmentStates) {                   
                    if (receivedData.categories[categoryName].fulfilmentStates.indexOf(players[index].fulfilmentStatus.state) > -1) {
                        inCategory = true;
                    }                    
                }
                if (receivedData.categories[categoryName].eventIds) {                    
                    if (receivedData.categories[categoryName].eventIds.indexOf(players[index].status.eventId) > -1) {
                        inCategory = true;
                    }                    
                }
            }
            if (inCategory) {
                categoryLookup[categoryName].affectedPlayerIds.push(players[index]);
            }
        };
        if (categoryLookup[categoryName].numberInRegions == 0){ 
            if (!receivedData.categories[categoryName].regionIds) {
                categoryLookup[categoryName].numberInRegions = playerNumber;
            } else {
                categoryLookup[categoryName].numberInRegions = 'unavailable'
               
            }
        }
    };
    var formatedData = {
        categoryLookup: categoryLookup,
    }
    self.postMessage(JSON.stringify(formatedData));
};
function filterPlayer(region, players) {
    if (!players) {
        players = [];
    }
    for(var key in region.players){
        players.push(region.players[key]) 
    }
    for (var index in region.children) {
        filterPlayer(region.children[index], players);
    }
    return players;
}
//var players = filterPlayer(regionTree);

//$.each(_plugin.settings.categories, function (categoryName, category) {
//    _plugin.data.categoryLookup[categoryName] = {};
//    _plugin.data.categoryLookup[categoryName].affectedPlayerIds = [];

//    $.each(players, function (index, player) {
//        var inCategory = false;
//        if (category.states) {
//            if ($.inArray(player.state, category.states) > -1) {
//                inCategory = true;
//            }
//        }
//        if (category.fulfilmentStates) {
//            if ($.inArray(player.fulfilmentState, category.fulfilmentStates) > -1) {
//                inCategory = true;
//            }
//        }
//        if (category.eventIds) {
//            if ($.inArray(player.eventId, category.eventIds) > -1) {
//                inCategory = true;
//            }
//        }
//        if (category.regionIds) {
//            $.each(category.regionIds, function (index, regionId) {
//                if ($.inArray(regionId.toString(), player.regionPath) > -1 && $.inArray(player.state, category.states) > -1) {
//                    inCategory = true;
//                }
//            });
//        }
//        if (inCategory) {
//            _plugin.data.categoryLookup[categoryName].affectedPlayerIds.push(player);
//        }
//    });
//});