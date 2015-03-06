/*
* INSM Region Picker
* This file contain the INSM Region Picker plugin
* 
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $('identifier').insmRegionPicker(settings);
*
* File dependencies:
* jQuery 1.6.1
* Fancybox 1.3.4
* 
* Author:
* Tobias Rahm
* Instoremedia AB
*/

(function ($) {
    var methods = {
        init: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmRegionPicker');

            // If the plugin hasn't been initialized yet
            if (!_plugin) {
                _plugin = {
                    settings: $.extend({
                        selectedRegionId: 0,
                        clickable: true,
                        draggable:false,
                        includePlayers: false,
                        onlySearchPlayers:false,
                        applicationName: 'regionPicker',
                        onSelect: function () {
                            //throw new Error('On select not implemented');
                            // Return true to proceed with the select. 
                            // Return false to cancel
                        },
                        onMouseEnterNode: function (node) {
                            
                        },
                        onMouseLeaveNode: function (node) {
                            
                        },
                        nodeOutput: function (node) {
                            return node.name;
                        }
                    }, options),
                    subscriptions: {
                        start: function () { },
                        stop: function () { }
                    },
                    htmlElements: {
                        controls: {
                            container: $('<div />').addClass('controls'),
                            search: $('<div />')
                        },
                        content: {
                            container: $('<div />').addClass('content'),
                            regionTree: $('<ul />'),
                            firstTimeLoader: $('<div />'),
                            searchResults: $('<div />').addClass('searchResults'),
                            searchResultsList: $('<ul />'),
                            backToRegionTree: $('<a />').addClass('back').text('Back to Region Tree')
                        }
                    },
                    data: {
                        searchstring: '',
                        regions: {},
                        nodeDictionary: {}
                    }
                };
                $this.data('insmRegionPicker', _plugin);
            }

            // Init html
            $this.empty().append(
                _plugin.htmlElements.controls.container.append(
                    _plugin.htmlElements.controls.search.addClass('search')
                ),
                _plugin.htmlElements.content.container.append(
                    _plugin.htmlElements.content.regionTree,
                    _plugin.htmlElements.content.firstTimeLoader,
                    _plugin.htmlElements.content.searchResults.append(
                        _plugin.htmlElements.content.backToRegionTree,
                        $('<h3 />').text('Search result'),
                        _plugin.htmlElements.content.searchResultsList
                    )
                )
            ).addClass('regionPicker');

            _plugin.htmlElements.controls.search.insmSearchField({
                onSearch: function (searchstring) {
                    _plugin.data.searchstring = searchstring;

                    if (_plugin.data.searchstring !== '') {
                        $this.insmRegionPicker('renderSearchResults');
                    }
                    else {
                        $this.insmRegionPicker('renderRegionTree');
                    }
                }
            });

            _plugin.htmlElements.content.backToRegionTree.click(function () {
                _plugin.htmlElements.controls.search.insmSearchField('clearSearchField');
                $this.insmRegionPicker('renderRegionTree');
            });

            _plugin.htmlElements.content.regionTree.insmListTree({
                clickable: _plugin.settings.clickable,
                includePlayers: _plugin.settings.includePlayers,
                onMouseEnterNode: _plugin.settings.onMouseEnterNode,
                onMouseLeaveNode:_plugin.settings.onMouseLeaveNode,
                nodeOutput: _plugin.settings.nodeOutput,
                draggable: _plugin.settings.draggable,

                childOrderFunction: function (a, b) {
                                
                    if (a.version && !b.version) {
                        return 1;
                    }
                    if (b.version && !a.version) {
                        return -1;
                    }
                    
                    var nameA = a.name.toLowerCase(), nameB = b.name.toLowerCase();
                    if (nameA < nameB) {//sort string ascending
                        return -1;
                    }
                    if (nameA > nameB) {
                        return 1;
                    }
                    return 0; //default return value (no sorting)
                },

                onClick: function (region) {
                    if (_plugin.settings.selectedRegionId != region.id) {
                        if (_plugin.settings.onSelect(region) !== false) {
                            _plugin.htmlElements.content.regionTree.insmListTree('unmarkNodes').insmListTree('markNode', {
                                nodeId: region.id
                            });
                            _plugin.settings.selectedRegionId = region.id;
                        }
                    }
                }
            });

            var nodes = _plugin.htmlElements.content.regionTree.insmListTree('getAllNodes');
            if (nodes[_plugin.settings.selectedRegionId]) {
                _plugin.htmlElements.content.regionTree.insmListTree('expandNode', {
                    nodeId: _plugin.settings.selectedRegionId
                });
            }

            $this.insmRegionPicker('renderRegionTree');

            $this.insmRegionPicker('setSubscriptions');

            $(window).resize(function () {
                $this.insmRegionPicker('resize');
            });

            $this.insmRegionPicker('resize');

            return $this;
        },
        selectNode: function(options) {
            var $this = $(this);
            var _plugin = $this.data('insmRegionPicker');

            if (_plugin.settings.selectedRegionId != options.node.id) {
                _plugin.htmlElements.content.regionTree.insmListTree('unmarkNodes').insmListTree('markNode', {
                    nodeId: options.node.id
                });
                _plugin.settings.selectedRegionId = options.node.id;
            }

            return $this;
        },
        resize: function () {
            var $this = $(this);
            var _plugin = $this.data('insmRegionPicker');

            if (_plugin) {
                var target = $this.insmUtilities('size');
                var controlsHeight = _plugin.htmlElements.controls.container.outerHeight(true);
                var contentMargin = _plugin.htmlElements.content.container.outerHeight(true) - _plugin.htmlElements.content.container.height();

                _plugin.htmlElements.content.container.css({
                    height: parseInt(target.height - controlsHeight - contentMargin) + 'px'
                });
            }
            return $this;
        },
        renderSearchResults: function () {
            var $this = $(this);
            var _plugin = $this.data('insmRegionPicker');

            var nodeHits = {};

            $.each(_plugin.data.nodeDictionary, function (id, node) {
                if(node.name.toLowerCase().indexOf(_plugin.data.searchstring.toLowerCase()) !== -1) {
                    nodeHits[id] = node;
                }
            });
            
            _plugin.htmlElements.content.searchResultsList.empty();
            var selected;
            if (!$.isEmptyObject(nodeHits)) {
                var nodeHitLookup = {};
                var nameLookup = {};

                $.each(nodeHits, function (id, node) {
                 
                    var liElement = $('<li />').text(node.name);
                    if (_plugin.settings.clickable) {
                        liElement.addClass('is-clickable' + (id == _plugin.settings.selectedRegionId ? ' is-selected' : '')).click(function () {
                            var nodeId = id;
                            if (nodeId != _plugin.settings.selectedRegionId) {
                                _plugin.settings.selectedRegionId = node.id;
                                _plugin.htmlElements.content.searchResultsList.find('li').removeClass('is-selected');
                                liElement.addClass('is-selected');

                                _plugin.htmlElements.content.regionTree.insmListTree('unmarkNodes').insmListTree('expandNode', {
                                    nodeId: node.id
                                }).insmListTree('markNode', {
                                    nodeId: node.id
                                });

                                _plugin.settings.onSelect(node);
                            }
                        });
                    }
                    nodeHitLookup[id] = liElement;
                    if (!nameLookup[node.name]) {
                        nameLookup[node.name] = [];
                    }
                    nameLookup[node.name].push(node);

                    var tmpNode = $.extend({}, node);
                    var nodePath = tmpNode.name;
                    while (typeof tmpNode._parent !== 'undefined') {
                        tmpNode = tmpNode._parent;
                        nodePath = tmpNode.name + ' / ' + nodePath;
                    }
                    if (typeof _plugin.settings.draggable == 'function') {
                        _plugin.settings.draggable({
                            element: liElement,
                            node: node
                        });
                    }
                    if (_plugin.settings.onlySearchPlayers) {
                        if (node.upid) {
                            _plugin.htmlElements.content.searchResultsList.append(
                                liElement
                            );
                        }
                    }
                    else {
                        _plugin.htmlElements.content.searchResultsList.append(
                            liElement
                        );
                    }
                });
                
                $.each(nameLookup, function(name, nodeArray) {
                    if (nodeArray.length > 1) {
                        // TODO
                        // Print out as many parent nodes as needed
                        // This should be fixed with a new, working, algorithm
                        // Right now it's been limited to only one parent

                        // TODO 2
                        // Do not forget to order the search result in alphabetical order
                        var nameLookup2 = {};
                        var done = false;

                        while (!done) {

                            $.each(nodeArray, function (index, node) {
                                if (!nameLookup2[node.id]) {
                                    nameLookup2[node.id] = node.name;
                                }
                                nameLookup2[node.id] = node._parent.name + ' / ' + nameLookup2[node.id];
                                //definedNames.push(nameLookup2[node.id]);
                            });

                            done = true;
                        }

                        $.each(nodeArray, function (index, node) {
                            nodeHitLookup[node.id].text(nameLookup2[node.id]);
                        });
                    }
                });
            } else {
                _plugin.htmlElements.content.searchResultsList.text('No result found');
            }

            _plugin.htmlElements.content.regionTree.hide();
            _plugin.htmlElements.content.searchResults.fadeIn();

            return $this;
        },
        renderRegionTree: function () {
            var $this = $(this);
            var _plugin = $this.data('insmRegionPicker');

            _plugin.htmlElements.content.searchResults.hide();
            _plugin.htmlElements.content.regionTree.fadeIn();

            return $this;
        },
        isInitialized: function () {
            var $this = $(this);
            var _plugin = $this.data('insmRegionPicker');
            
            if (_plugin) {
                $this.insmRegionPicker('setSubscriptions');
                return true;
            }

            return false;
        },
        stopSubscriptions: function () {
            var $this = $(this);
            var _plugin = $this.data('insmRegionPicker');

            _plugin.subscriptions.stop();

            return $this;
        },
        startSubscriptions: function () {
            var $this = $(this);
            var _plugin = $this.data('insmRegionPicker');

            _plugin.subscriptions.start();

            return $this;
        },
        setSubscriptions: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmRegionPicker');

            _plugin.subscriptions.start = function () {
                if ($.isEmptyObject(_plugin.data.nodes)) {
                    //_plugin.htmlElements.content.firstTimeLoader.insmLoader();
                    _plugin.htmlElements.content.regionTree.insmLoader();
                }
                $.insmService('register', {
                    subscriber: _plugin.settings.applicationName,
                    type: 'regionTree',
                    includePlayers: _plugin.settings.includePlayers,
                    update: function (nodes) {
                        if ($.isEmptyObject(_plugin.data.nodes)) {
                            _plugin.htmlElements.content.regionTree.insmLoader('destroy');
                        }
                        _plugin.data.nodes = nodes;
                        
                        function parseNodes(node) {
                            _plugin.data.nodeDictionary[node.id] = node;

                            if (node && node.children) {
                                $.each(node.children, function (id, child) {
                                    parseNodes(child);
                                });
                            }
                            if (node && node.players) {
                                $.each(node.players, function (id, player) {
                                    _plugin.data.nodeDictionary[player.id] = player;
                                    node.children.push(player);
                                });
                            }

                           

                        }

                        parseNodes(_plugin.data.nodes);

                        _plugin.htmlElements.content.regionTree.insmListTree('update', {
                            data: _plugin.data.nodes
                        });
                        
                        if (_plugin.settings.selectedRegionId) {
                            _plugin.htmlElements.content.regionTree.insmListTree('unmarkNodes').insmListTree('markNode', {
                                nodeId: _plugin.settings.selectedRegionId
                            });
                        }
                    },
                    remove: function (node) {

                    }
                });
            }

            $this.insmRegionPicker('stopSubscriptions');
            $this.insmRegionPicker('startSubscriptions');

            _plugin.subscriptions.stop = function () {
                $.insmService('unregister', {
                    subscriber: _plugin.settings.applicationName,
                    type: 'regionTree'
                });
            }

            return $this;
        },
        destroy: function () {
            var $this = $(this);
            $this.insmRegionPicker('stopSubscriptions');
            $this.empty();
            $this.data('insmRegionPicker', '');
            return $this;
        }
    };

    $.fn.insmRegionPicker = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmRegionPicker');
        }
    };
})(jQuery);
