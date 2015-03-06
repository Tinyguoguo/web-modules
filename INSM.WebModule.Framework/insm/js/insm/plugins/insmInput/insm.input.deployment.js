/*
* INSM Asset
* This file contain the INSM Input Deployment function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmInputDeployment(settings);
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
            var _plugin = $this.data('insmInputDeployment');
            _plugin = {
                settings: $.extend({
                    type: 'deployment',
                    defaultValue: '',
                    required: false,
                    multiValue: false,
                    disabled: false,
                    value: '',
                    availableValues: null,
                    defaultValue: '',
                    maxChars: null,
                    validateFunction: function (value) {
                        if (value.length == 0)
                            return false;
                        else
                            return true;
                    },
                    targets: []
                }, options),
                data: {
                    type: null,
                    previousValue: null,
                    targetList: {},
                    availableTargetsList: []
                },
                htmlElements: {
                    input: null,
                    targetInputs: [],
                    addInputButton: $('<button />').text('Add Target')
                }
            };

            if (typeof _plugin.settings.value === "number") {
                _plugin.settings.value = _plugin.settings.value.toString();
            }

            $this.data('insmInputDeployment', _plugin);
            $this.addClass('insmInputDeployment');

            return $this;
        },
        view: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmInputDeployment');

            $this.text('View not implemented in insm input deployment');

            return $this;
        },
        updateTargetLists: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputDeployment');

            _plugin.data.availableTargetsList = _plugin.settings.targets.slice();

            _plugin.data.availableTargetsList = $.grep(_plugin.data.availableTargetsList, function (target) {
                if (_plugin.data.targetList[target.id]) {
                    return false;
                }
                return true;
            });

            $.each(_plugin.htmlElements.targetInputs, function (index, inputDiv) {
                inputDiv.insmInputDeploymentTarget('updateTargetList', _plugin.data.availableTargetsList);
            });

            return $this;
        },
        appendTargetInput: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputDeployment');

            _plugin.htmlElements.targetInputs.push(
                $('<div />').insmInputDeploymentTarget({
                    targets: _plugin.data.availableTargetsList,
                    onChange: function (previousTargetId, currentTargetId) {
                        if (_plugin.data.targetList[previousTargetId]) {
                            delete _plugin.data.targetList[previousTargetId];
                        }
                        _plugin.data.targetList[currentTargetId] = [];

                        $this.insmInputDeployment('updateTargetLists');
                    }
                }).insmInputDeploymentTarget('edit')
            )

            $.each(_plugin.htmlElements.targetInputs, function (index, inputDiv) {
                $this.append(inputDiv);
            });
            $this.append(_plugin.htmlElements.addInputButton);

            return $this;
        },
        edit: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputDeployment');

            _plugin.data.availableTargetsList = _plugin.settings.targets.slice();

            _plugin.htmlElements.addInputButton.click(function () {
                $this.insmInputDeployment('appendTargetInput');
            });
            $this.insmInputDeployment('appendTargetInput');

            return $this;
        },
        reset: function (value) {
            var $this = $(this);
            var _plugin = $this.data('insmInputDeployment');
            
            return $this;
        },
        getValue: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputDeployment');

            var value = [];

            $.each(_plugin.htmlElements.targetInputs, function (index, inputDiv) {
                value.push(inputDiv.insmInputDeploymentTarget('getValue'));
            });
            
            return value;
        },
        highlightInvalid: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputDeployment');

            

            return $this;
        },
        setValue: function (value) {
            var $this = $(this);
            var _plugin = $this.data('insmInputDeployment');

            _plugin.settings.value = value;

            return $this;
        },
        validate: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputDeployment');
            var isValid = true;

            var playerIds = [];

            $.each(_plugin.htmlElements.targetInputs, function (index, inputDiv) {
                if (!inputDiv.insmInputDeploymentTarget('validate')) {
                    isValid = false;
                }
                else {
                    var value = inputDiv.insmInputDeploymentTarget('getValue');
                    playerIds = playerIds.concat(value.playerIds);
                }
            });

            var uniquePlayerIds = [];
            $.each(playerIds, function (i, el) {
                if ($.inArray(el, uniquePlayerIds) === -1) uniquePlayerIds.push(el);
            });

            if (uniquePlayerIds.length != playerIds.length) {
                $.insmNotification({
                    type: 'error',
                    message: 'You cannot deploy the same player id multiple times.'
                });
                isValid = false;
            }

            return isValid;
        },
        empty: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputDeployment');


            return $this;

        },
        update: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmInputDeployment');
            
            return $this;
        },
        destroy: function () {
            var $this = $(this);
            $this.data('insmInputDeployment', null).empty();

            return $this;
        }
    };

    $.fn.insmInputDeployment = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmInputDeployment');
        }
    };
})(jQuery);