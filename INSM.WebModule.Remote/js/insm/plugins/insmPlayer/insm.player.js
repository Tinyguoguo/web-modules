/*
* INSM Player
* This file contain the INSM Player plugin
* 
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $('identifier').insmPlayer(settings);
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
            var _plugin = $this.data('insmPlayer');

            // If the plugin hasn't been initialized yet
            if (!_plugin) {
                _plugin = {
                    htmlElements: {
                        information: {
                            container: $('<div />'),
                            computerName: $('<td />'),
                            id: $('<td />'),
                            ipAddress: $('<td />'),
                            message: $('<td />'),
                            operatingSystem: $('<td />'),
                            peer: $('<td />'),
                            state: $('<td />'),
                            upid: $('<td />'),
                            version: $('<td />')
                        },
                        input: {
                            name: $('<div />')
                        }
                    },
                    subscriptions: {
                        start: function () { },
                        stop: function () { }
                    },
                    settings: $.extend({
                        player: {
                            name: null,
                            upid: null,
                            state: null,
                            version: null
                        },
                        applicationName: 'insmPlayer'
                    }, options),
                    data: {
                        player: {}
                    }
                };
                $this.data('insmPlayer', _plugin);
            }
            
            _plugin.htmlElements.information.container.empty();

            _plugin.htmlElements.input.name.insmInput({
                type: 'string',
                value: _plugin.settings.player.name || '',
                required: true,
                maxChars: 40,
                validateFunction: function (value) {
                    var regex = /^[a-zA-Z0-9]+$/;
                    var val = value;
                    if (regex.test(val)) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
            });

            _plugin.htmlElements.information.container.append(
                $('<table />').addClass('vertical').append(
                    $('<tr />').append(
                        $('<th />').text('Name'),
                        $('<td />').append(_plugin.htmlElements.input.name)
                    ),
                    $('<tr />').append(
                        $('<th />').text('State'),
                        _plugin.htmlElements.information.state
                    ),
                    $('<tr />').append(
                        $('<th />').text('Message'),
                        _plugin.htmlElements.information.message
                    ),
                    $('<tr />').append(
                        $('<th />').text('UPID'),
                        _plugin.htmlElements.information.upid
                    ),
                    $('<tr />').append(
                        $('<th />').text('Version'),
                        _plugin.htmlElements.information.version
                    ),
                    $('<tr />').append(
                        $('<th />').text('IP Address'),
                        _plugin.htmlElements.information.ipAddress
                    ),
                    $('<tr />').append(
                        $('<th />').text('Computer Name'),
                        _plugin.htmlElements.information.computerName
                    ),
                    $('<tr />').append(
                        $('<th />').text('Peer'),
                        _plugin.htmlElements.information.peer
                    ),
                    $('<tr />').append(
                        $('<th />').text('Operating System'),
                        _plugin.htmlElements.information.operatingSystem
                    )
                )
            );

            $this.empty().append(
                _plugin.htmlElements.information.container
            );

            $this.insmPlayer('update', {
                player: options.player
            });

            _plugin.subscriptions.start = function () {
                $.insmService('register', {
                    subscriber: _plugin.settings.applicationName,
                    type: 'player',
                    upid: options.player.upid,
                    update: function (player) {
                        $this.insmPlayer('update', {
                            player: player
                        });
                    }
                });
            };

            _plugin.subscriptions.stop = function () {
                $.insmService('unregister', {
                    subscriber: _plugin.settings.applicationName,
                    type: 'player',
                    upid: _plugin.data.player.upid
                });
            };

            return $this;
        },
        update: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmPlayer');

            if (typeof options.player === 'object') {
                $.each(options.player, function (key, value) {
                    if (key == 'name') {
                        _plugin.htmlElements.input.name.insmInput('update', {
                            value: value
                        });
                        _plugin.data.player.name = value;
                    }
                    else if (_plugin.data.player[key] !== value) {
                        if (_plugin.htmlElements.information[key]) {
                            // If we want to print some fields in a certain way we can do that - otherwise just print it out
                            switch (key) {
                                default:
                                    if (_plugin.htmlElements.information[key].text() === '') {
                                        _plugin.htmlElements.information[key].text(value);
                                    }
                                    else {
                                        _plugin.htmlElements.information[key].text(value).switchClass("", "is-highlighted", function () {
                                            $(this).switchClass("is-highlighted", "", 2000);
                                        });
                                    }
                                    break;
                            }
                        }
                        _plugin.data.player[key] = value;
                    }
                });
            }

            return $this;
        },
        edit: function () {
            var $this = $(this);
            var _plugin = $this.data('insmPlayer');

            _plugin.htmlElements.input.name.insmInput('edit');

            return $this;
        },
        view: function () {
            var $this = $(this);
            var _plugin = $this.data('insmPlayer');

            _plugin.htmlElements.input.name.insmInput('view');

            return $this;
        },
        reset: function () {
            var $this = $(this);
            var _plugin = $this.data('insmPlayer');

            if (_plugin) {
                _plugin.htmlElements.input.name.insmInput('reset', _plugin.data.player.name);
            }

            return $this;
        },
        getValue: function () {
            var $this = $(this);
            var _plugin = $this.data('insmPlayer');

            var fileProperties = {};
            fileProperties.name = _plugin.htmlElements.input.name.insmInput('getValue');
            return fileProperties;

            return $this;
        },
        validate: function () {
            var $this = $(this);
            var _plugin = $this.data('insmPlayer');

            var valid_name = _plugin.htmlElements.input.name.insmInput('validate');

            if (valid_name) {
                return true;
            }
            else {
                return false;
            }

            return $this;
        },
        startSubscriptions: function () {
            var $this = $(this);
            var _plugin = $this.data('insmPlayer');

            _plugin.subscriptions.start();

            return $this;
        },
        stopSubscriptions: function () {
            var $this = $(this);
            var _plugin = $this.data('insmPlayer');

            if (_plugin) {
                _plugin.subscriptions.stop();
            }

            return $this;
        },
        destroy: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmPlayer');

            $this.insmPlayer('stopSubscriptions');
            
            $this.data('insmPlayer', null);

            $this.empty();

            return $this;
        }
    };

    $.fn.insmPlayer = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmPlayer');
            return null;
        }
    };
})(jQuery);
