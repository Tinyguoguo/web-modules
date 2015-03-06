/*
* INSM Popup
* This file contain the INSM Popup plugin
* 
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $('identifier').insmNotification(settings);
*
* File dependencies:
* jQuery 1.6.1
* Fancybox 1.3.4
* 
* Author:
* Tobias Rahm
* Instoremedia AB
* Markus Bergh
* Creuna AB
*/

(function ($) {
    var methods = {
        init: function (options) {
            var $this = $('html').eq(0);
            // Global vars
            var _plugin = $this.data('insmNotification');

            //
            if (!_plugin) {
                _plugin = {
                    data: {
                        notificationIterator: 0,
                        notifications: {},
                        currentClass: ''
                    },
                    htmlElements: {
                        body: $('body'),
                        container: $('#notificationContainer')
                    }
                };

                if (_plugin.htmlElements.container.length === 0) {
                    _plugin.htmlElements.container = $('<div id="notificationContainer" />');
                }
            }

            _plugin.settings = $.extend({
                type: null,
                message: '',
                duration: 5000
            }, options);

            if (!_plugin.settings.message) {
                throw new Error('No message provided');
            }

            $this.data('insmNotification', _plugin);

            switch (_plugin.settings.type) {
                case 'information':
                case 'info':
                    _plugin.data.currentClass = 'information';
                    break;
                case 'error':
                    _plugin.data.currentClass = 'error';
                    break;
                case 'success':
                case 'successful':
                    notification.element.switchClass(_plugin.data.currentClass, 'successful');
                    _plugin.data.currentClass = 'successful';
                    break;
                case 'warning':
                    _plugin.data.currentClass = 'warning';
                    break;
                case 'load':
                case 'loading':
                    options.type = 'load';
                    _plugin.data.currentClass = 'load';
                    break;
                default:
                    throw new Error('Notification type "'+_plugin.settings.type+'" not implemented');
            }
            

            var notificationElement = $('<div />').text(_plugin.settings.message).addClass('content '+_plugin.data.currentClass);
            var progressElement = $('<div />').addClass('progress');
            var notificationContainer = $('<div />').addClass('notification');

            notificationElement.hide().fadeIn();
            _plugin.data.notificationIterator++;
            _plugin.data.notifications[_plugin.data.notificationIterator] = {
                element: notificationElement,
                progress: progressElement,
                container: notificationContainer
            };
            _plugin.htmlElements.container.append(
                notificationContainer.append(progressElement, notificationElement)
            );
            if (options.type && options.type !== 'load') {
                progressElement.hide();
            }
            if (options.progress) {
                var percentage = parseInt(options.progress * 100);
                progressElement.animate({
                    width: percentage + '%'
                });
            }

            // Insert into DOM
            if (!$.contains(document.documentElement, _plugin.htmlElements.container)) {
                $this.append(_plugin.htmlElements.container);
            }
                        
            if (_plugin.settings.duration > 0) {
                setTimeout(function () {
                    notificationElement.fadeOut(function () {
                        notificationContainer.detach();
                        delete _plugin.data.notifications[_plugin.data.notificationIterator];

                        if ($.isEmptyObject(_plugin.data.notifications)) {
                            _plugin.htmlElements.container.detach();
                        }
                    });
                }, _plugin.settings.duration);
            };
            var notificationIndex = _plugin.data.notificationIterator;
            return {
                update: function (options) {
                    options = $.extend({
                        notificationIndex: notificationIndex,
                        duration: 0
                    }, options);

                    return $.insmNotification('update', options);
                },
                remove: function (options) {
                    _plugin.data.notifications[notificationIndex].container.detach();
                    delete _plugin.data.notifications[notificationIndex];

                    if ($.isEmptyObject(_plugin.data.notifications)) {
                        _plugin.htmlElements.container.detach();
                    }

                    return $this;
                }
            }
        },
        update: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmNotification');

            if (!options.notificationIndex) {
                throw new Error('Missing parameter notificationIndex');
            }

            var notification = _plugin.data.notifications[options.notificationIndex];

            if (options.message) {
                _plugin.settings.message = options.message;
                notification.element.text(options.message);
            }
            if (options.type) {
                switch (options.type) {
                    case 'information':
                    case 'info':
                        notification.element.switchClass(_plugin.data.currentClass, 'information');
                        _plugin.data.currentClass = 'information';
                        break;
                    case 'error':
                        notification.element.switchClass(_plugin.data.currentClass, 'error');
                        _plugin.data.currentClass = 'error';
                        break;
                    case 'success':
                    case 'successful':
                        notification.element.switchClass(_plugin.data.currentClass, 'successful');
                        _plugin.data.currentClass = 'successful';
                        break;
                    case 'warning':
                        notification.element.switchClass(_plugin.data.currentClass, 'warning');
                        _plugin.data.currentClass = 'warning';
                        break;
                    case 'load':
                    case 'loading':
                        options.type = 'load';
                        _plugin.data.currentClass = 'load';
                        break;
                    default:
                        throw new Error('Notification type "' + options.type + '" not implemented');
                }
            }
            if (options.duration > 0) {
                setTimeout(function () {
                    notification.element.fadeOut(function () {
                        notification.container.detach();
                        delete _plugin.data.notifications[options.notificationIndex];

                        if ($.isEmptyObject(_plugin.data.notifications)) {
                            _plugin.htmlElements.container.detach();
                        }
                    });
                }, options.duration);
            }
            if (options.type && options.type !== 'load') {
                notification.progress.hide();
            }
            if (options.progress) {
                var percentage = parseInt(options.progress * 100);
                notification.progress.animate({
                    width: percentage + '%'
                });
            }
            return $this;
        },
        destroy: function () {
            var $this = $('html').eq(0);
            $this.data('insmNotification', null);
            return $this;
        }
    };

    $.setPosition = function (elem, pos) {
        elem.addClass(pos);
    }

    $.setWidth = function (elem, width) {
        if (typeof width == 'number') {
            elem.css({
                width: width + 'px'
            });
        }
        else if (typeof width == 'string') {
            elem.css({
                width: width
            });
        }
    };

    $.insmNotification = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmNotification');
            return null;
        }
    };
})(jQuery);
