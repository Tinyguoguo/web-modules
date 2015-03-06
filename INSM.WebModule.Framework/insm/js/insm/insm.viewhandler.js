/*
* INSM Tablesorter
* This file contain the INSM Tablesorter function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $('identifier').insmTablesorter(settings);
*
* File dependencies:
* jQuery 1.6.1
* GetUrlParam 2.1
* insm.framework
* insm.utilities
* insm.tooltip
* 
* Author:
* Tobias Rahm
* Instoremedia AB
*/

(function ($) {
    var _views = {};
    var _namespaceLookup = {};

    var _errorView = {
        show: function () {

        },
        hide: function () {

        }
    };
    var _viewElementLookup = {

    };
    var methods = {
        init: function (options) {
            // Global vars
            var $this = $(this);
            var _plugin = $this.data('insmViewHandler');

            // If the plugin hasn't been initialized yet
            if (!_plugin) {
                _plugin = {
                    data: {
                        views: {

                        }
                    }
                };
                $this.data('insmViewHandler', _plugin);
            }

            _plugin.data.views[options.viewName] = options.method;
            _viewElementLookup[options.viewName] = $this;

            return $this;
        },
        remove: function (options) {
            // Global vars
            var $this = $(this);
            var _plugin = $this.data('insmViewHandler');

            delete _plugin.data.views[options.viewName];

            return $this;
        },
        show: function (options) {
            // Global vars
            var $this = $(this);
            var _plugin = $this.data('insmViewHandler');

            _plugin.data.views[options.viewName](options.data);

            return $this;
        }
    };

    $.fn.insmViewHandler = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmViewHandler');
        }
    };

    $.insmViewHandler = function (method) {
        if (methods[method]) {
            var context = _viewElementLookup[Array.prototype.slice.call(arguments, 1)[0].viewName];
            return context.insmViewHandler.apply(context, arguments);

            //return _viewElementLookup[Array.prototype.slice.call(arguments, 1)[0].viewName].insmViewHandler(method, {
            //    viewName: Array.prototype.slice.call(arguments, 1)[0].viewName
            //});
        }
        else {
            $.error('Method ' + method + ' does not exist on $.insmViewHandler');
        }
    };

    $.insmViewHandlerOld = function(_action, _viewName, _functions, _namespace) {
        switch (_action) {
        case 'add':
            if (typeof _viewName == 'undefined') {
                $.insmNotification({
                    type: 'error',
                    text: 'View name not defined in INSM View Handler Old'
                });
            }
            if (typeof _functions.show != 'function') {
                $.insmNotification({
                    type: 'warning',
                    text: 'View \'' + _viewName + '\' has no show function'
                });
            }
            if (typeof _functions.hide != 'function') {
                $.insmNotification({
                    type: 'warning',
                    text: 'View \'' + _viewName + '\' has no hide function'
                });
            }
            if (typeof _namespace != 'string') {
                _namespace = 'default';
            }

            _namespaceLookup[_viewName] = _namespace;

            if (typeof _views[_namespace] == 'undefined') {
                _views[_namespace] = {};
            }
            _views[_namespace][_viewName] = _functions;
            break;
        case 'remove':
            delete _views[_viewName];
            break;
        case 'update':
            $.insmNotification({
                type: 'error',
                text: 'Update method not implemented in INSM View Handler Old'
            });
            break;
        case 'hideOther':
            $.each(_views[_namespaceLookup[_viewName]], function() {
                this.hide();
            });
            break;
        default:
            // _action might be a view
            if (typeof _namespaceLookup[_action] != 'undefined') {
                if (typeof _views[_namespaceLookup[_action]][_action] != 'undefined') {
                    return _views[_namespaceLookup[_action]][_action];
                } else {
                    $.insmNotification({
                        type: 'error',
                        text: 'View \'' + _action + '\' is undefined in INSM View Handler Old'
                    });
                }
            } else {
                $.insmNotification({
                    type: 'error',
                    text: 'View \'' + _action + '\' not recognised in INSM View Handler Old'
                });
            }
            return _errorView;
        }
        return _errorView;
    };
})(jQuery);