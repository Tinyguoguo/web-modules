/*
* INSM Required
* This file contain the INSM Status Box function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $('identifier').insmRequired(settings);
*
* File dependencies:
* jQuery 1.6.1
* insmNotification
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

            var errors = [];

            $.each(options.check, function (key, value) {
                if (typeof value == 'undefined' || value === "" || value === null) {
                    errors.push(key);
                }
            })

            if (errors.length != 0) {

                var errorString = "<h2>Configuration error</h2><p>You see this text because the web module is not properly installed. Please contact your system administrator.<br> Details: Missing configuration settings for ";
                $.each(errors, function (index, key) {
                    errorString += key + ", ";
                });
                errorString = errorString.replace(/, $/, ".</p>");

                $.insmPopup({
                    content: errorString,
                    autoOpen: true,
                    backdropClickClose: false,
                    showCloseButton: false,
                    backdropTransparency: false
                });

                $this.empty();
            }

            return $this;
        },
        missingSettingsFile: function(options) {
            var content = "<h2>Missing Settings</h2><p>No settings file found. Please contact the system administrator.</p>";
            $.insmPopup({
                content: content,
                autoOpen: true,
                backdropClickClose: false,
                showCloseButton: false,
                backdropTransparency: false
            });
         }
    };

    $.fn.insmRequired = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmRequired');
        }
    };
})(jQuery);