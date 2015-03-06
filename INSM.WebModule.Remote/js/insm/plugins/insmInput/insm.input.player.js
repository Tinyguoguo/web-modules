/*
* INSM Asset
* This file contain the INSM Input Player Playlist function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmInputPlayer(settings);
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
            var _plugin = $this.data('insmInputPlayer');
            _plugin = {
                settings: $.extend({
                    type: 'player',
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
            
            $this.data('insmInputPlayer', _plugin).addClass('insm-input-player');


            return $this;
        },
        view: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmInputPlayer');

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
            var _plugin = $this.data('insmInputPlayer');

            $this.empty();
            _plugin.htmlElements.input = $('<div />').text('Select player');
            $this.append(_plugin.htmlElements.input);

            $.insmFramework('getPlayers', {
                success: function (players) {
                    // Get players
                    _plugin.data.players = players;

                    _plugin.htmlElements.input.addClass('insm-combobox-input').click(function () {
                        $.insmCombobox({
                            availableValues: _plugin.data.players,
                            onSelect: function (player) {
                                _plugin.htmlElements.input.text(player.name);
                                _plugin.settings.value = player;
                                _plugin.settings.onChange(player);
                            }
                        });
                    });
                }
            });



            _plugin.data.currentView = 'edit';

            return $this;
        },
        reset: function (value) {
            var $this = $(this);
            var _plugin = $this.data('insmInputPlayer');
            

            return $this;
        },
        getValue: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputPlayer');

            return _plugin.settings.value;
        },
        highlightInvalid: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputPlayer');


            _plugin.htmlElements.input.insmHighlight({
                type: 'error'
            });

            return $this;
        },
        setValue: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmInputPlayer');

            $.insmFramework('getPlayers', {
                success: function (players) {
                    // Get players
                    _plugin.data.players = players;

                    $.each(players, function (index, p) {
                        if (p.id == options.player.id) {
                            _plugin.htmlElements.input.text(_plugin.data.players[index].name);

                            _plugin.settings.value = _plugin.data.players[index];
                        }
                    });
                }
            });

            return $this;
        },
        validate: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputPlayer');
            if (_plugin.settings.value) {
                return true;
            }

            $this.insmInputPlayer('highlightInvalid');

            return false;
        },
        empty: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputPlayer');

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
            var _plugin = $this.data('insmInputPlayer');
            
            if (_plugin.settings.value !== options.value && options.value.length > 0) {
                _plugin.settings.value = options.value;
                switch (_plugin.data.currentView) {
                    case 'view':
                        $this.insmInputPlayer('view');
                        break;
                    case 'edit':
                        $this.insmInputPlayer('edit');
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
            $this.data('insmInputPlayer', null).empty();

            return $this;
        }
    };

    $.fn.insmInputPlayer = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmInputPlayer');
        }
    };
})(jQuery);