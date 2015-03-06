/*
* INSM Status Box
* This file contain the INSM Status Box function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $('identifier').insmPlayerDetails(settings);
*
* File dependencies:
* jQuery 1.6.1
* insmNotification
* 
* Author:
* Tobias Rahm
* Instoremedia AB
*/
"use strict";
(function ($) {
    var methods = {
        init: function (options) {
            // Global vars
            var $this = $(this);
            var _plugin = $this.data('insmTimeline');

            // If the plugin hasn't been initialized yet
            if (!_plugin) {
                _plugin = {
                    constants: {
                        dayInSec: 86400
                    },
                    settings: $.extend({
                        start: null,
                        end: null,
                        data: []
                    }, options)
                };
                $this.data('insmTimeline', _plugin);
            }

            if (!_plugin.settings.start) {
                throw new Error("timeline missing start parameter");
            }
            if (!_plugin.settings.end) {
                throw new Error("timeline missing end parameter");
            }
            if (!_plugin.settings.data) {
                throw new Error("timeline missing data parameter");
            }

            //wrap start and end date in moment object. Arguments to moment can be ISO-date OR Date Object.
            _plugin.settings.start = moment(_plugin.settings.start);
            _plugin.settings.end = moment(_plugin.settings.end);

            $this.addClass('insm-timeline');
            
            return $this;
        }
    };

    function secBetweenDates(startMomentObject, endMomentObject) {
        return endMomentObject.unix() - startMomentObject.unix();
    }

    function getDatePosition(startMomentObject, endMomentObject, positionMomentObject, offsetInSec) {
        var position = positionMomentObject.unix() + (offsetInSec || 0);
        return position / secBetweenDates(startMomentObject, endMomentObejct);
    }


    $.fn.insmTimeline = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmTimeline');
        }
    };
})(jQuery);