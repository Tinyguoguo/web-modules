/*
* INSM Module Template
* This file contains the INSM Module Template plugin. 
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmModuleTemplate(options);
*
* Author:
* Tobias Rahm
* Instoremedia AB
*/

(function ($) {
    var methods = {
        init: function(options) {
            var $this = $(this);
            var _plugin = $this.data('insmModuleTemplate');

            // This method is for initialization only. Defined variables in the _plugin object can be reached in
            // other methods using "$this.data('insmModuleTemplate')".

            if (!_plugin) {
                _plugin = {
                    settings: $.extend({
                        show: function () { }
                    }, options)
                };
                $this.data('insmModuleTemplate', _plugin);
            }

            return $this;
        },
        getTarget: function () {
            var $this = $(this);
            var _plugin = $this.data('insmModuleTemplate');

            // This method should be a "singleton" and return the same div element every time.
            // The purpose is for the menu to know where the visuals will be. The div should be used in the method
            // "fullscreen" below.
            
            // The code below stores the div in _plugin.settings.target and creates a new div if it's the first time
            if (_plugin.settings.target) {
                return _plugin.settings.target;
            } else {
                _plugin.settings.target = $('<div />');
            }

            return _plugin.settings.target;
        },
        preview: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmModuleTemplate');

            // This method should be a "singleton" and return the same div all times that will be used as a menu button.
            // The CSS uses the class names module and module-preview

            // The below code returns the div if it already existed and creates a new div with a h2 header in it.
            // It adds the CSS class names mentioned above as well as a certain class for this module ("module-template")
            // to be used for design

            // _plugin.settings.show() should be called when the users wants to view the full module. After this callback
            // method is executed the menu will call the method "fullscreen".

            if (_plugin.settings.previewTarget) {
                return _plugin.settings.previewTarget;
            } else {
                _plugin.settings.previewTarget = $('<div />');
            }

            _plugin.settings.previewTarget.addClass('module module-preview module-template');


            _plugin.settings.previewTarget.click(function () {
                _plugin.settings.show();
            });

            _plugin.settings.previewTarget.html(
                $('<h2 />').text('INSM Module Template')
            );

            return _plugin.settings.previewTarget;
        },
        fullscreen: function(options) {
            var $this = $(this);
            var _plugin = $this.data('insmModuleTemplate');

            // This method is executed when the full module should be shown.
            // The div in _plugin.settings.target will be added to the DOM tree and take up all space available.
            

            // The code below fades in the target div. The rest is up to you.
            _plugin.settings.target.fadeIn();

            // Custom methods can be called using $this.insmModuleTemplate('customMethod');
            // Example:
            $this.insmModuleTemplate('customMethod', {
                example: true
            });

            return _plugin.settings.target;
        },
        customMethod: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmModuleTemplate');

            if (options.example) {
                _plugin.settings.target.html('This is just an example.');
            }
            else {
                _plugin.settings.target.html('And this would just happen if example is false or not set.');
            }

            return $this;
        },
        resize: function() {
            var $this = $(this);
            var _plugin = $this.data('insmModuleTemplate');

            if (_plugin) {
                // This method is used when the module is initialized and when the windows is resized. This is optional but is nice to have at times.
            }

            return $this;
        },
        onClose: function (options) {
            options.success();
        },
        destroy: function () {
            var $this = $(this);
            var _plugin = $this.data('insmModuleTemplate');

            // This method is for clean up. Make sure intervals and timeouts are cleared and anything else that might still be used in the background.

            $this.data('insmModuleTemplate', null).empty();

            return $this;
        }
    };

    $.fn.insmModuleTemplate = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmModuleTemplate');
        }
    };

})(jQuery);