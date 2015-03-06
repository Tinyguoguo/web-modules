/*
* INSM Localization
* This file contain the INSM Localization plugin.
* 
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $('identifier').insmLocalization(settings);
*
* File dependencies:
* jQuery 1.6.1
* 
* Author:
* Tobias Rahm
* Instoremedia AB
*/

(function ($) {
    $.insmLocalization = function (action, parameter) {
        var _plugin = this;
        switch (action) {
            case 'addLocale':
                if (typeof _plugin.localization != 'object') {
                    _plugin.localization = {};
                }
                $.each(parameter, function (key, localization) {
                    _plugin.localization[key] = localization;
                });
                break;
            case 'locale':
                // Set the locale
                _plugin.locale = parameter;
                break;
            case 'get':
                if (typeof _plugin.localization[_plugin.locale] != 'undefined') {
                    if (typeof _plugin.localization[_plugin.locale][parameter] != 'undefined') {
                        return _plugin.localization[_plugin.locale][parameter];
                    }
                    if (typeof _plugin.localization['default'][parameter] != 'undefined') {
                        return _plugin.localization['default'][parameter];
                    }
                }
                else if (typeof _plugin.localization['default'][parameter] != 'undefined') {
                    return _plugin.localization['default'][parameter];
                }
                $.insmNotification({
                    type: 'error',
                    text: '"' + parameter + '" not found in localization.'
                });
                return parameter;
                break;
            default:
                $.insmNotification({
                    type: 'error',
                    text: 'Action "' + action + '" no recognised in INSM Localization.'
                });
                break;
        }
    };
})(jQuery);
