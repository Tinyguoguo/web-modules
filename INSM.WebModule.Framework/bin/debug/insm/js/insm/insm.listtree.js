/*
* INSM List Tree
* This file contain the INSM List Tree function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmListTree(settings);
*
* File dependencies:
* jQuery 1.6.1
* insm.notification
*
* Author:
* Tobias Rahm
* Instoremedia AB
*/

(function ($) {
    var methods = {
        init: function (options) {
            return this.each(function () {
                // Global vars
                var $this = $(this);
                var _plugin = $this.data('insmListTree');

                // If the plugin hasn't been initialized yet

                // TODO: Consider...
                // Removed this because it didn't work as expected... why did I want to do this?
                //                if (!_plugin) {
                // Global variables
                _plugin = {
                    data: {
                        selectedNodes: {},
                        identifierIterator: 0,
                        allNodes: {}
                    },
                    settings: {}
                };
                $this.data('insmListTree', _plugin);
                //                }
                _plugin.settings = $.extend({
                    clickable: true, // true|false
                    selectable: false, // true|false|recursive
                    recursive: false,
                    lazyLoad: false, // true|false,
                    singleMarkOnClick: false,
                    nodeOutput: function (node) {
                        if (typeof node.entityversion != 'undefined') {
                            return '(' + node.entityversion + ') ' + node.name;
                        }
                        return node.name;
                    },
                    onSelect: function () {

                    },
                    onClick: function () {

                    },
                    onSelectedNodesChange: function () {

                    },
                    onExpand: function () {

                    },
                    onExpandNode: function (node) {

                    },
                    onCollapseNode: function (node) {

                    },
                    onMouseEnterNode: function (node) {

                    },
                    onMouseLeaveNode: function (node) {

                    }
                }, options);

                // The items to be displayed are called nodes
                // Exists of name, [class] and any parameters wanted
                var _tree = options.tree;

                // Logics
                // HTML Element Target
                $this.addClass('insmListTree');
                

                function getItem(node) {
                    node._listTreeId = ++_plugin.data.identifierIterator;
                    var root = $('<li/>')
                        .html(
                            $('<span />')
                                .addClass('item-wrapper')
                                .append($('<span/>').addClass('item-connector'))
                                .append($('<span/>').addClass('item-icon'))
                                .append($('<span/>').addClass('item-text').text(_plugin.settings.nodeOutput(node)))
                        ).mouseover(
                            function (e) {
                                _plugin.settings.onMouseEnterNode(node);
                                return true;
                            }
                        ).mouseout(
                            function (e) {
                                
                                _plugin.settings.onMouseLeaveNode(node);
                                return true;
                            }
                        );
                    node._htmlElement = root;
                    node._selected = false;
                    node._partiallySelected = false;
                    node._permanentMark = false;
                    _plugin.data.allNodes[node._listTreeId] = node;

                    if (typeof node._class == 'string') {
                        root.addClass(node._class.toLowerCase());
                    }
                    if (node.root) {
                        root.addClass('root');
                    }
                    if (_plugin.settings.selectable) {
                        root.find('.item-wrapper .item-icon').before(
                            $('<span />').addClass('item-checkbox').click(function (e) {

                                if ($(this).hasClass('selected')) {
                                    $this.insmListTree('deselectNode', { node: node });
                                }
                                else {
                                    $this.insmListTree('selectNode', { node: node });
                                }
                                // Check parents recursively if it should be partial or not
                                $this.insmListTree('updateParentPathState', node);

                                _plugin.settings.onSelectedNodesChange();
                            }));
                    }
                    if (_plugin.settings.clickable || node._clickable) {
                        root.find('span.item-text').click(function () {
                            if (_plugin.settings.singleMarkOnClick) {
                                $this.insmListTree('markNode', { node: node, unmarkOthers: true });
                            }
                            _plugin.settings.onClick(node);
                        }).addClass('clickable');
                    }

                    if (typeof node.children == 'object' && node.children.length > 0) {
                        root.find('.item-wrapper .item-connector').click(function () {
                            if (root.hasClass('expanded')) {
                                $this.insmListTree('collapseNode', {
                                    node: node
                                });
                                //$.each(root.children('ul'), function () {
                                //    $(this).hide();
                                //});
                                //root.removeClass('expanded');
                            }
                            else {
                                $this.insmListTree('expandNode', {
                                    node: node
                                });
                                //$.each(root.children('ul'), function () {
                                //    $(this).show();
                                //});
                                //root.addClass('expanded');
                            }
                        });
                        var subList = $('<ul/>');
                        root.append(subList);
                        $.each(node.children, function (index, child) {
                            child._parent = node;
                            var c = getItem(child);
                            subList.append(c);
                        });
                    }
                    else {
                        node.children = [];
                        root.addClass('leaf');
                    }

                    root.children('ul').hide();

                    return root;
                }
                
                $this.empty();
                if (_tree) {
                    $this.html(getItem(_tree));
                }
                else {
                    $.insmNotification({
                        type: 'error',
                        text: 'Missing tree data in INSM List Tree'
                    });
                }

                return $this;
            });
        },
        updateParentPathState: function (node) {
            // Global vars
            var $this = $(this);
            var _plugin = $this.data('insmListTree');

            // Logics
            if (typeof node._parent == 'undefined') {
                return;
            }
            var selected = 0;
            var partiallySelected = 0;
            var total = 0;
            $.each(node._parent.children, function (index, child) {
                if (child._selected) {
                    selected++;
                }
                else if (child._partiallySelected) {
                    partiallySelected++;
                }
                total++;
            });

            if (selected == 0 && partiallySelected == 0) {
                $this.insmListTree('deselectNode', { node: node._parent });
            }
            else if (selected == total) {
                $this.insmListTree('selectNode', { node: node._parent });
            }
            else {
                $this.insmListTree('partialSelectNode', node._parent);
            }

            $this.insmListTree('updateParentPathState', node._parent);

            return $this;
        },
        getSelected: function (options) {
            // Global vars
            var $this = $(this);
            var _plugin = $this.data('insmListTree');
            return _plugin.data.selectedNodes;
        },
        getNode: function (options) {
            // Global vars
            var $this = $(this);
            var _plugin = $this.data('insmListTree');
            return _plugin.data.allNodes[options.id];
        },
        getNodesBySearch: function (option) {
            var $this = $(this);
            var _plugin = $this.data('insmListTree');
            var result = [];

            $.each(_plugin.data.allNodes, function (index, node) {
                if (option.func(node)) {
                    result.push(node);
                }
            });
            return result;
        },
        getNodeByParameter: function (options) {
            // Global vars
            var $this = $(this);
            var _plugin = $this.data('insmListTree');
            var result = null;
            $.each(_plugin.data.allNodes, function (index, node) {
                if (node[options.parameter] == options.identifier) {
                    result = _plugin.data.allNodes[node._listTreeId];
                    return false;
                }
            });
            return result;
        },
        markNode: function (options) {
            // Global vars
            var $this = $(this);
            var _plugin = $this.data('insmListTree');

            // TODO
            // Decide if the colors should be in a setting

            if (options.nodeId) {
                options.node = _plugin.data.allNodes[options.nodeId];
            }

            if (options.unmarkOthers) {
                $this.insmListTree('unmarkNodes');
            }

            if (!options.node._permanentMark) {
                $(options.node._htmlElement).find('> .item-wrapper > .item-text').css({
                    backgroundColor: '#cce'
                });
            }
            return $this;
        },
        permanentMarkNode: function (options) {
            // Global vars
            var $this = $(this);
            var _plugin = $this.data('insmListTree');

            if (options.nodeId) {
                options.node = _plugin.data.allNodes[options.nodeId];
            }

            // TODO
            // Decide if the colors should be in a setting
            options.node._permanentMark = true;

            $(options.node._htmlElement).find('> .item-wrapper > .item-text').stop(true).css({
                backgroundColor: '#fdd'
            }).animate({
                backgroundColor: '#ecc'
            });
            return $this;
        },
        unmarkNodes: function (options) {
            // Global vars
            var $this = $(this);
            var _plugin = $this.data('insmListTree');

            $.each(_plugin.data.allNodes, function (id, node) {
                if (!node._permanentMark) {
                    $(node._htmlElement).find('> .item-wrapper > .item-text').stop(true).css({
                        backgroundColor: 'transparent'
                    });
                }
            });
            return $this;
        },
        getAllNodes: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmListTree');

            return _plugin.data.allNodes;
        },
        collapseNode: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmListTree');

            if (options.nodeId) {
                options.node = _plugin.data.allNodes[nodeId];
            }

            $(options.node._htmlElement.children('ul')).hide();
            $(options.node._htmlElement).removeClass('expanded');

            _plugin.settings.onCollapseNode(options.node);

            $.each(options.node.children, function (index, child) {
                $this.insmListTree('collapseNode', {
                    node: child
                });
            });
        },
        expandNode: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmListTree');

            if (options.nodeId) {
                options.node = _plugin.data.allNodes[options.nodeId];
            }

            if (options.node.children.length > 0) {
                $(options.node._htmlElement.children('ul')).show();
                $(options.node._htmlElement).addClass('expanded');
            }

            _plugin.settings.onExpandNode(options.node);

            if (typeof options.node._parent == 'object') {
                $this.insmListTree('expandNode', {
                    node: options.node._parent
                });
            }

            return $this;
        },
        collapseAll: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmListTree');

            $this.insmListTree('collapseNode', {
                node: _plugin.data.allNodes[1]
            });

            return $this;
        },
        selectNode: function (options) {
            // Global vars
            var $this = $(this);
            var _plugin = $this.data('insmListTree');

            var node;
            if (options.nodeId) {
                node = _plugin.data.allNodes[options.nodeId];
            }
            else {
                node = options.node;
            }

            // Logics
            _plugin.data.selectedNodes[node._listTreeId] = node;
            node._htmlElement.find('> .item-wrapper > .item-checkbox').addClass('selected');
            node._htmlElement.find('> .item-wrapper > .item-checkbox').removeClass('partial');

            if (node._selected != true) {
                node._selected = true;
                _plugin.settings.onSelect(true, node);
            }

            if (_plugin.settings.recursive) {
                if ($.isArray(node.children) && node.children.length > 0) {
                    $.each(node.children, function (index, child) {
                        $this.insmListTree('selectNode', { node: child });
                    });
                }
            }
            return $this;
        },
        deselectNode: function (options) {

            // Global vars
            var $this = $(this);
            var _plugin = $this.data('insmListTree');

            var node;
            if (typeof options.nodeId === "number") {
                node = _plugin.data.allNodes[options.nodeId];
            }
            else {
                node = options.node;
            }

            // Logics
            delete _plugin.data.selectedNodes[node._listTreeId];
            node._htmlElement.find('> .item-wrapper > .item-checkbox').removeClass('selected');
            node._htmlElement.find('> .item-wrapper > .item-checkbox').removeClass('partial');

            if (node._partiallySelected) {
                node._partiallySelected = false;
            }
            if (node._selected) {
                node._selected = false;
                _plugin.settings.onSelect(false, node);
            }

            if (_plugin.settings.recursive) {
                if ($.isArray(node.children) && node.children.length > 0) {
                    $.each(node.children, function (index, child) {
                        $this.insmListTree('deselectNode', { node: child });
                    });
                }
            }

            return $this;
        },
        deselectAllNodes: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmListTree');

            if (_plugin.settings.recursive) {
                $this.insmListTree('deselectNode', {
                    nodeId: 1
                });
            }
            else {
                $.each(_plugin.data.allNodes, function (id, node) {
                    $this.insmListTree('deselectNode', {
                        node: node
                    });
                });
            }
            _plugin.settings.onSelectedNodesChange();
            return $this;
        },
        partialSelectNode: function (node) {
            // Global vars
            var $this = $(this);
            var _plugin = $this.data('insmListTree');

            // Logics
            delete _plugin.data.selectedNodes[node._listTreeId];
            node._htmlElement.find('> .item-wrapper > .item-checkbox').addClass('partial');
            node._htmlElement.find('> .item-wrapper > .item-checkbox').removeClass('selected');

            if (node._selected != false) {
                node._selected = false;
                _plugin.settings.onSelect(false, node);
            }
            node._partiallySelected = true;

            return $this;
        }
    };

    $.fn.insmListTree = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmListTree');
        }
    }
















    $.fn.insmListTreeOld = function (_settings, args) {
        return;

        // Internal Functions
        function getSelected() {
            return _data.selectedNodes;
        }
        function getNode(id) {
            return _data.allNodes[id];
        }
        function showNode(node_id) {
            var node = _data.allNodes[node_id];
            while (typeof node._parent == 'object') {
                $(node._parent._htmlElement.children('ul')).show();
                $(node._parent._htmlElement).addClass('expanded');
                node = node._parent;
            }
        }
        function collapseAll() {
            $.each(_data.allNodes, function (id, node) {
                $(node._htmlElement.children('ul')).hide();
                $(node._htmlElement).removeClass('expanded');
            });
        }
        function markNode(node_id) {
            // TODO
            // Decide if the colors should be in a setting
            var node = _data.allNodes[node_id];

            if (!node._permanentMark) {
                $(node._htmlElement).find('> .item-wrapper > .item-text').stop(true).css({
                    backgroundColor: '#ddf'
                }).animate({
                    backgroundColor: '#cce'
                });
            }
        }

        function permanentMarkNode(node_id) {
            // TODO
            // Decide if the colors should be in a setting
            var node = _data.allNodes[node_id];
            node._permanentMark = true;

            $(node._htmlElement).find('> .item-wrapper > .item-text').stop(true).css({
                backgroundColor: '#fdd'
            }).animate({
                backgroundColor: '#ecc'
            });
        }

        function unmarkNodes() {
            $.each(_data.allNodes, function (id, node) {
                if (!node._permanentMark) {
                    $(node._htmlElement).find('> .item-wrapper > .item-text').stop(true).css({
                        backgroundColor: 'transparent'
                    });
                }
            });
            return;
        }

        function getAllNodes() {
            return _data.allNodes;
        }

        function expandNode(node_id) {
            var node = _data.allNodes[node_id];
            if (node.children.length > 0) {
                $(node._htmlElement.children('ul')).show();
                $(node._htmlElement).addClass('expanded');
            }
        }



        function selectNode(node) {
            _data.selectedNodes[node._listTreeId] = node;
            node._htmlElement.find('> .item-wrapper > .item-checkbox').addClass('selected');
            node._htmlElement.find('> .item-wrapper > .item-checkbox').removeClass('partial');

            if (node._selected != true) {
                node._selected = true;
                _callbacks.onSelect(true, node);
            }
        }

        //        function deselectNode(node) {
        //            delete _data.selectedNodes[node._listTreeId];
        //            node._htmlElement.find('> .item-wrapper > .item-checkbox').removeClass('selected');
        //            node._htmlElement.find('> .item-wrapper > .item-checkbox').removeClass('partial');

        //            if (node._selected != false) {
        //                node._selected = false;
        //                _callbacks.onSelect(false, node);
        //            }
        //        }

        function partialSelectNode(node) {
            delete _data.selectedNodes[node._listTreeId];
            node._htmlElement.find('> .item-wrapper > .item-checkbox').addClass('partial');
            node._htmlElement.find('> .item-wrapper > .item-checkbox').removeClass('selected');

            if (node._selected != false) {
                node._selected = false;
                _callbacks.onSelect(false, node);
            }
        }

        function updateParentPathState(node) {
            if (typeof node._parent == 'undefined') {
                return;
            }
            var selected = 0;
            var total = 0;
            $.each(node._parent.children, function (index, child) {
                if (child._selected) {
                    selected++;
                }
                total++;
            });

            if (selected == 0) {
                $this.insmListTree('deselectNode', node._parent);
            }
            else if (selected == total) {
                $this.insmListTree('selectNode', node._parent);
            }
            else {
                $this.insmListTree('partialSelectNode', node._parent);
            }

            updateParentPathState(node._parent);
        }

        // Reset values
        _data = {
            selectedNodes: {},
            identifierIterator: 0,
            allNodes: {}
        };
        _target.data('insmListTree', _data);

        // HTML Element Target
        _target = $(this);
        _target.addClass('insmListTree');

        // The items to be displayed are called nodes
        // Exists of name, [class] and any parameters wanted
        _tree = _settings.tree;

        // Default options
        _options = {
            clickable: true, // true|false
            selectable: false, // true|false|recursive
            recursive: false,
            lazyLoad: false // true|false
        };

        _output = function (node) {
            if (typeof node.entityversion != 'undefined') {
                return '(' + node.entityversion + ') ' + node.name;
            }
            return node.name;
        }

        _target.empty();
        _target.html(getItem(_tree));
        return _target;



        return this;
    };

    $.fn.insmListTree.onNodeSelect = function (node, recursive) {
        if (typeof recursive != 'boolean') {
            recursive = false;
        }

        $(this).insmListTree('selectNode', node);

        if (recursive) {
            if (typeof node.children == 'object' && node.children.length > 0) {
                $.each(node.children, function (index, child) {
                    $(this).insmListTree['onNodeSelect'](child, recursive);
                });
            }
        }
    };

    $.fn.insmListTree.onNodeDeselect = function (node, recursive) {
        if (typeof recursive != 'boolean') {
            recursive = false;
        }

        $this.insmListTree('deselectNode', node);

        if (recursive) {
            if (typeof node.children == 'object' && node.children.length > 0) {
                $.each(node.children, function (index, child) {
                    $.fn.insmListTree['onNodeDeselect'](child, recursive);
                });
            }
        }
    };
})(jQuery);