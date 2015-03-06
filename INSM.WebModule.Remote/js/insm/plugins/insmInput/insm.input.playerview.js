/*
* INSM Asset
* This file contain the INSM Input Player View function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmInputPlayerView(settings);
*
* File dependencies:
* jQuery 1.6.1
* insmNotification
*
* Authors:
* Tobias Rahm - Instoremedia AB
*/

; (function ($) {
    var methods = {
        init: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmInputPlayerView');
            _plugin = {
                settings: $.extend({
                    type: 'playerview',
                    required: false,
                    multiSelect: false,
                    disabled: false,
                    value: null,
                    onChange: function () {

                    }
                }, options),
                data: {
                    commands: [],
                    players: []
                },
                htmlElements: {
                    input: $('<div />')
                }
            };
            
            $this.data('insmInputPlayerView', _plugin).addClass('insm-input-playerview');

            return $this;
        },
        view: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmInputPlayerView');

            if ($.isArray(_plugin.settings.value)) {
                $this.text(_plugin.settings.value.join(", "));
            }
            else {
                $this.text(_plugin.settings.value);
            }

            _plugin.data.currentView = 'view';

            return $this;
        },
        edit: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputPlayerView');
                        
            $this.empty();
            _plugin.htmlElements.input = $('<select />').hide();
            $this.append(_plugin.htmlElements.input);

            _plugin.htmlElements.input.change(function () {
                _plugin.settings.value = _plugin.htmlElements.input.val();
                _plugin.settings.onChange(_plugin.settings.value);
            });
            
            _plugin.data.currentView = 'edit';

            return $this;
        },
        reset: function (value) {
            var $this = $(this);
            var _plugin = $this.data('insmInputPlayerView');
            

            return $this;
        },
        getValue: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputPlayerView');

            return _plugin.settings.value;
        },
        highlightInvalid: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputPlayerView');

            _plugin.htmlElements.input.insmHighlight({
                type: 'error'
            });

            return $this;
        },
        setValue: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmInputPlayerView');
            _plugin.settings.value = options.viewId;

            _plugin.htmlElements.input.empty();
            $.insmFramework('getPlayers', {
                success: function (players) {
                    // Get players
                    _plugin.data.players = players;

                    $.each(players, function (index, player) {
                        if (options.player.id == player.id) {
                            $.each(player.views, function (viewIndex, view) {
                                var option = $('<option value="'+viewIndex+'" />').text('View ' + viewIndex);
                                if (viewIndex == _plugin.settings.value) {
                                    option.attr('selected', 'selected');
                                    _plugin.settings.onChange(viewIndex);
                                }
                                _plugin.htmlElements.input.append(
                                    option
                                );
                            });
                            if (player.views.length == 0) {
                                _plugin.htmlElements.input.hide();
                            }
                            else {
                                _plugin.htmlElements.input.fadeIn();
                            }
                        }
                    });

                    if (!_plugin.settings.value) {
                        _plugin.htmlElements.input.selectedIndex = 0;
                        _plugin.settings.value = _plugin.htmlElements.input.val();
                        _plugin.settings.onChange(_plugin.settings.value);
                    }
                }
            });

            return $this;
        },
        validate: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputPlayerView');

            if (_plugin.settings.value) {
                return true;
            }

            $this.insmInputPlayerView('highlightInvalid');

            return false;
        },
        empty: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputPlayerView');

            switch (_plugin.settings.type) {
                case 'string':
                    _plugin.htmlElements.input.val("");
                    break;
                case 'dropdown':
                    _plugin.data.element.children().removeAttr("selected");
                    _plugin.data.element.children().eq(0).attr("selected", "selected");
                    break;
            }
            // clear current value
            _plugin.settings.value = [];
            $this.find(".selected").children().remove();
            return $this;

        },
        update: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmInputPlayerView');
            
            if (_plugin.settings.value !== options.value && options.value.length > 0) {
                _plugin.settings.value = options.value;
                switch (_plugin.data.currentView) {
                    case 'view':
                        $this.insmInputPlayerView('view');
                        break;
                    case 'edit':
                        $this.insmInputPlayerView('edit');
                        break;
                    default:
                        break;
                }

                if (_plugin.settings.value !== '') {
                    if (_plugin.data.type) {
                        switch (_plugin.data.currentView) {
                            case 'view':
                                $this.parent().insmHighlight();
                                break;
                            case 'edit':
                                _plugin.htmlElements.input.insmHighlight();
                                break;
                        }
                    }
                }
            }

            return $this;
        },
        destroy: function () {
            var $this = $(this);
            $this.data('insmInputPlayerView', null).empty();

            return $this;
        }
    };

    $.fn.insmInputPlayerView = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmInputPlayerView');
        }
    };
})(jQuery);