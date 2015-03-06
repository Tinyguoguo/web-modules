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
            // Global vars
            var $this = $(this);
            var _plugin = $this.data('insmListTree');

            if (!_plugin) {
                _plugin = {
                    data: {
                        selectedNodes: {},
                        identifierIterator: 0,
                        allNodes: {},
                        tree: {}
                    },
                    settings: $.extend({
                        data: {},
                        includePlayers:false,
                        clickable: true, // true|false
                        selectable: false, // true|false|recursive
                        recursive: false,
                        lazyLoad: false, // true|false,
                        singleMarkOnClick: false,
                        draggable: false,
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

                        },
                        childOrderFunction: function (node1, node2) {
                            if (node1.name.toLowerCase() < node2.name.toLowerCase()) {
                                return -1;
                            }
                            else if (node1.name.toLowerCase() > node2.name.toLowerCase()) {
                                return 1;
                            }
                            return 0;
                        }
                    }, options)
                };
                $this.data('insmListTree', _plugin);
            }


            // The items to be displayed are called nodes
            // Exists of name, [class] and any parameters wanted
            _plugin.data.tree = options.data;

            // Logics
            // HTML Element Target
            $this.addClass('insmListTree');
            
            $this.empty();

            if (!$.isEmptyObject(_plugin.data.tree)) {
                $this.insmListTree('generateNodeElement', _plugin.data.tree);
                $this.insmListTree('insertTreeToDOM', _plugin.data.tree);
            }

            return $this;
        },
        insertTreeToDOM: function() {
            var $this = $(this);
            var _plugin = $this.data('insmListTree');

            if (_plugin.data.tree._htmlElement) {
                if (!jQuery.contains(document.documentElement, _plugin.data.tree._htmlElement)) {
                    $this.html(_plugin.data.tree._htmlElement);
                }
            }

            return $this;
        },
        update: function(options) {
            var $this = $(this);
            var _plugin = $this.data('insmListTree');

            if (options.data) {
                // TODO: Compare options.data with _plugin.data.tree and update relevant nodes
                // Do not update already existing children

                //$this.insmListTree('updateNode', options.data);
                
                var newTreeData = options.data;
                $this.insmListTree('generateNodeElement', newTreeData);
                var nodeLookup = $this.insmListTree('getNodeLookup', newTreeData);

                // Remove the deleted nodes
                $.each(_plugin.data.allNodes, function (id, node) {
                    if (!nodeLookup[id]) {
                        _plugin.data.allNodes[id]._htmlElement.fadeOut(function () {
                            $(this).remove();
                        });
                        delete _plugin.data.allNodes[id];
                    }
                });

                // Compare all nodes
                $.each(nodeLookup, function (id, node) {
                    if (!_plugin.data.allNodes[id]) {
                        _plugin.data.allNodes[id] = node;
                        // Highlight element of new node
                    }
                    else {
                        var update = false;

                        // If name has been changed we need to update
                        if (_plugin.data.allNodes[id].name !== node.name) {
                            _plugin.data.allNodes[id].name = node.name;
                            update = true;
                        }

                        // If any children has been changed we need to update
                        var children = [];
                        var sortChildren = false;
                        $.each(node.children, function (index, child) {
                            children.push(child.id);
                        });
                        var removeChildIndexes = [];
                        $.each(_plugin.data.allNodes[id].children, function (index, child) {
                            if ($.inArray(child.id, children) === -1) {
                                // Remove
                                removeChildIndexes.push(index);
                            }
                            else {
                                children.splice(children.indexOf(child.id), 1);
                            }
                        });
                        removeChildIndexes.sort().reverse();
                        $.each(removeChildIndexes, function (index, childIndex) {
                            _plugin.data.allNodes[id].children[childIndex]._htmlElement.fadeOut(function () {
                                $(this).remove();
                            });
                            _plugin.data.allNodes[id].children.splice(childIndex, 1);
                            if (_plugin.data.allNodes[id].children.length == 0) {
                                $this.insmListTree('updateNode', {
                                    node: _plugin.data.allNodes[id]
                                });
                                _plugin.data.allNodes[id]._htmlElement.insmHighlight();
                            }
                        });
                        $.each(children, function (index, childId) {
                            // Add children
                            _plugin.data.allNodes[childId] = nodeLookup[childId];
                            var wasEmpty = false;
                            if (_plugin.data.allNodes[id].children.length === 0) {
                                wasEmpty = true;
                            }
                            if (!_plugin.data.allNodes[id]._htmlElement.hasClass('expanded')) {
                                _plugin.data.allNodes[childId]._htmlElement.hide();
                            }
                            _plugin.data.allNodes[id].children.push(_plugin.data.allNodes[childId]);
                            setTimeout(function () {
                                // Not in DOM yet so have to put last in call stack
                                _plugin.data.allNodes[childId]._htmlElement.insmHighlight();
                            }, 0);
                            
                            if (wasEmpty) {
                                var oldElement = _plugin.data.allNodes[id]._htmlElement;
                                oldElement.before($this.insmListTree('generateNodeElement', _plugin.data.allNodes[id]));
                                oldElement.remove();
                                _plugin.data.allNodes[id]._htmlElement.insmHighlight();
                            }
                            
                            sortChildren = true;
                        });
                        if (sortChildren) {
                            _plugin.data.allNodes[id].children.sort(_plugin.settings.childOrderFunction);

                            if (!_plugin.data.allNodes[id]._childContainer) {
                                _plugin.data.allNodes[id]._childContainer = $('<ul />').appendTo(_plugin.data.allNodes[id]._htmlElement);
                            }
                            $.each(_plugin.data.allNodes[id].children, function (index, child) {
                                _plugin.data.allNodes[id]._childContainer.append(child._htmlElement);
                            });
                        }
                        if (update) {
                            var expanded = false;
                            if(_plugin.data.allNodes[id]._htmlElement.hasClass('expanded')) {
                                expanded = true;
                            }
                            $this.insmListTree('updateNode', {
                                node: _plugin.data.allNodes[id]
                            });
                            if(expanded) {
                                $this.insmListTree('expandNode', {
                                    node: _plugin.data.allNodes[id]
                                });
                            }
                            _plugin.data.allNodes[id]._htmlElement.insmHighlight();
                        }
                    }
                });
                
                if ($.isEmptyObject(_plugin.data.tree)) {
                    _plugin.data.tree = newTreeData;
                    if (_plugin.data.tree) {
                        //_plugin.data.allNodes[node._listTreeId] = node;
                        _plugin.data.allNodes = $this.insmListTree('getNodeLookup', _plugin.data.tree);
                        $this.insmListTree('generateNodeElement', _plugin.data.tree);
                        $this.insmListTree('insertTreeToDOM', _plugin.data.tree);
                    }
                }

            }

            return $this;
        },
        getNodeLookup: function (node) {
            var $this = $(this);
            var _plugin = $this.data('insmListTree');

            var lookup = {};
            lookup[node.id] = node;
            $.each(node.children, function (index, child) {
                $.extend(lookup, $this.insmListTree('getNodeLookup', child));
            });
            
            return lookup;
        },
        updateNode: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmListTree');

            // TODO: Update the node element
            if (options.node) {
                var newElement = $this.insmListTree('generateNodeElement', $.extend({}, options.node));
                
                _plugin.data.allNodes[options.node.id]._htmlElement.before(newElement);
                _plugin.data.allNodes[options.node.id]._htmlElement.remove();
                _plugin.data.allNodes[options.node.id]._htmlElement = newElement;
                
                //options.node._htmlElement.find('span.item-text').text(_plugin.settings.nodeOutput(options.node));
            }

            return $this;
        },
        generateNodeElement: function(node) {
            var $this = $(this);
            var _plugin = $this.data('insmListTree');

            node._listTreeId = ++_plugin.data.identifierIterator;
            var root = $('<li/>');

            node._htmlElement = root;

            root.html(
                    $('<span />')
                        .addClass('item-wrapper')
                        .append($('<span/>').addClass('item-connector'))
                        .append($('<span/>').addClass('item-icon'))
                        .append($('<span/>').addClass('item-text').append(_plugin.settings.nodeOutput(node)))
                ).mouseover(
                    function (e) {
                        //e.stopPropagation();
                        _plugin.settings.onMouseEnterNode(node);
                        return true;
                    }
                ).mouseout(
                    function (e) {
                        e.stopPropagation();
                        _plugin.settings.onMouseLeaveNode(node);
                        return false;
                    }
                )
            node._selected = false;
            node._partiallySelected = false;
            node._permanentMark = false;

            if (typeof node._class == 'string') {
                root.addClass(node._class.toLowerCase());
            }
            if (node.root) {
                root.addClass('root');
            }
            if (typeof _plugin.settings.draggable == 'function') {
                
                _plugin.settings.draggable({
                    element: '',
                    node: node
                });
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
            if (_plugin.settings.clickable ) {
                root.find('span.item-text').click(function () {
                    if (_plugin.settings.singleMarkOnClick) {
                        $this.insmListTree('markNode', { node: node, unmarkOthers: true });
                    }
                    _plugin.settings.onClick(node);
                }).addClass('clickable');
            }
            if (typeof node.children == 'object' && node.children.length > 0) {
                node.children.sort(_plugin.settings.childOrderFunction);
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
                node._childContainer = subList;
                root.append(subList);
                $.each(node.children, function (index, child) {
                    child._parent = node;
                    $this.insmListTree('generateNodeElement', child);
                    subList.append(child._htmlElement);
                });
            }
            else {
                node.children = [];
                
                root.addClass('leaf');
                if (_plugin.settings.includePlayers && node.upid) {
                    root.addClass('player');
                    
                }
            }

            root.children('ul').hide();

            return node._htmlElement;
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

            if (!options.node) {
                throw new Error('Node with id "'+options.nodeId+'" does not exist');
            }

            if (options.unmarkOthers) {
                $this.insmListTree('unmarkNodes');
            }

            if (!options.node._permanentMark) {
                $(options.node._htmlElement).find('> .item-wrapper > .item-text').stop(true).css({
                    backgroundColor: '#ddf'
                }).animate({
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

            $.each(_plugin.data.allNodes, function (id, node) {
                $this.insmListTree('collapseNode', {
                    node: node
                });
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