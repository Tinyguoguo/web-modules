/*
* INSM Utilities
* This file contain the INSM Utilities function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $.insmUtilities(settings);
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
            var _plugin = $this.data('insmUtilities');

            // If the plugin hasn't been initialized yet
            if (!_plugin) {
                _plugin = {
                    settings: $.extend({

                    }, options)
                };
                $this.data('insmUtilities', _plugin);
            }

            return $this;
        },
        size: function (options) {
            // find the closest visible parent and get it's hidden children
            var visibleParent = this.closest(':visible').children();
            var thisHeight;
            var thisWidth;

            // set a temporary class on the hidden parent of the element
            visibleParent.addClass('insmUtilitiesShow');

            // get the height
            thisHeight = this.height();
            thisWidth = this.width();

            // remove the temporary class
            visibleParent.removeClass('insmUtilitiesShow');

            return {
                width: thisWidth,
                height: thisHeight
            };
        },
        addPrefix: function (options) {
            options = $.extend({
                precision: 2
            }, options);

            var kilo = 1000;
            var mega = kilo * 1000;
            var giga = mega * 1000;
            var tera = giga * 1000;

            if ((options.number >= 0) && (options.number < kilo)) {
                return options.number + ' ';

            } else if ((options.number >= kilo) && (options.number < mega)) {
                return (options.number / kilo).toFixed(options.precision) + ' K';

            } else if ((options.number >= mega) && (options.number < giga)) {
                return (options.number / mega).toFixed(options.precision) + ' M';

            } else if ((options.number >= giga) && (options.number < tera)) {
                return (options.number / giga).toFixed(options.precision) + ' G';

            } else if (options.number >= tera) {
                return (options.number / tera).toFixed(options.precision) + ' T';

            } else {
                return options.number + ' ';
            }
        }
    };

    $.insmUtilities = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmUtilities');
        }
    };

    $.fn.insmUtilities = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmUtilities');
        }
    };
})(jQuery);

// IE8 doesn't have indexOf natively
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (searchElement /*, fromIndex */) {
        'use strict';
        if (this == null) {
            throw new TypeError();
        }
        var n, k, t = Object(this),
            len = t.length >>> 0;

        if (len === 0) {
            return -1;
        }
        n = 0;
        if (arguments.length > 1) {
            n = Number(arguments[1]);
            if (n != n) { // shortcut for verifying if it's NaN
                n = 0;
            } else if (n != 0 && n != Infinity && n != -Infinity) {
                n = (n > 0 || -1) * Math.floor(Math.abs(n));
            }
        }
        if (n >= len) {
            return -1;
        }
        for (k = n >= 0 ? n : Math.max(len - Math.abs(n), 0) ; k < len; k++) {
            if (k in t && t[k] === searchElement) {
                return k;
            }
        }
        return -1;
    };
}



var urlDecode = function (str) {
    if (str) {
        //str = $.URLDecode(str);
        //str = str.replace(/\+/g, '%2B');
        str = decodeURIComponent(str + '');
    }
    return str;
};

var urlEncode = function (str) {
    if (str) {
        //str = $.URLEncode(str);
        str = encodeURIComponent(str + '');
    }
    return str;
};

var htmlQuotes = function (str) {
    str = str.replace(/\'/g, '&apos;');
    str = str.replace(/\"/g, '&quot;');
    return str;
};

var sortObject = function (o) {
    var sorted = {},
        key, a = [];

    for (key in o) {
        if (o.hasOwnProperty(key)) {
            a.push(key);
        }
    }

    a.sort();

    for (key = 0; key < a.length; key++) {
        sorted[a[key]] = o[a[key]];
    }
    return sorted;
};


var nl2br = function (str, is_xhtml) {
    var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
    return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
};

var printDateTimestamp = function (dateObject) {
    var months = [
        'January',
        'February',
        'Mars',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
    ];
    var date = dateObject.getDate();
    var month = months[dateObject.getMonth()];
    var hours = (dateObject.getHours() > 9 ? dateObject.getHours() : '0' + dateObject.getHours());
    var minutes = (dateObject.getMinutes() > 9 ? dateObject.getMinutes() : '0' + dateObject.getMinutes());

    return month + ' ' + date + '  ' + hours + ':' + minutes;
};

var printTime = function (dateObject) {
    var hours = (dateObject.getHours() > 9 ? dateObject.getHours() : '0' + dateObject.getHours());
    var minutes = (dateObject.getMinutes() > 9 ? dateObject.getMinutes() : '0' + dateObject.getMinutes());
    var seconds = (dateObject.getSeconds() > 9 ? dateObject.getSeconds() : '0' + dateObject.getSeconds());

    return hours + ':' + minutes + ':' + seconds;
};

var printDate = function (dateObject, format) {
    if (typeof dateObject == 'object' && !isNaN(dateObject.getTime())) {

        var d = dateObject.getDate();
        var m = dateObject.getMonth() + 1;
        var year = dateObject.getFullYear();
        var date = (d > 9 ? d : '0' + d);
        var month = (m > 9 ? m : '0' + m);
        var hours = (dateObject.getHours() > 9 ? dateObject.getHours() : '0' + dateObject.getHours());
        var minutes = (dateObject.getMinutes() > 9 ? dateObject.getMinutes() : '0' + dateObject.getMinutes());
        var seconds = (dateObject.getSeconds() > 9 ? dateObject.getSeconds() : '0' + dateObject.getSeconds());

        switch (format) {
            case 'Y-m-d H:i':
                return year + '-' + month + '-' + date + ' ' + hours + ':' + minutes;
            case 'Y-m-d':
                return year + '-' + month + '-' + date;
            case 'Y-m-d H:i:s':
                return year + '-' + month + '-' + date + ' ' + hours + ':' + minutes + ':' + seconds;
            default:
                return year + '-' + month + '-' + date + ' ' + hours + ':' + minutes + ':' + seconds;
        }
    } else if (typeof dateObject == 'string') {
        return printDate(new Date(dateObject), format);
    } else {
        return '';
    }
};

var getTZString = function (dateObject) {
    var result;
    if (dateObject) {
        result = dateObject.getUTCFullYear() + '-' +
                (dateObject.getUTCMonth() < 9 ? '0' : '') + parseInt(dateObject.getUTCMonth() + 1, 10) + '-' +
                (dateObject.getUTCDate() < 10 ? '0' : '') + dateObject.getUTCDate() + 'T' +
                (dateObject.getUTCHours() < 10 ? '0' : '') + dateObject.getUTCHours() + ':' +
                (dateObject.getUTCMinutes() < 10 ? '0' : '') + dateObject.getUTCMinutes() + ':' +
                (dateObject.getUTCSeconds() < 10 ? '0' : '') + dateObject.getUTCSeconds() + 'Z';
    } else if (typeof dateObject == 'string') {
        result = dateObject;
    } else {
        return '';
    }
    return result;
};

var getTString = function (dateObject) {
    var result;
    if (dateObject) {
        result = dateObject.getUTCFullYear() + '-' +
                (dateObject.getUTCMonth() < 9 ? '0' : '') + parseInt(dateObject.getUTCMonth() + 1, 10) + '-' +
                (dateObject.getUTCDate() < 10 ? '0' : '') + dateObject.getUTCDate() + 'T' +
                (dateObject.getUTCHours() < 10 ? '0' : '') + dateObject.getUTCHours() + ':' +
                (dateObject.getUTCMinutes() < 10 ? '0' : '') + dateObject.getUTCMinutes() + ':' +
                (dateObject.getUTCSeconds() < 10 ? '0' : '') + dateObject.getUTCSeconds();
    } else if (typeof dateObject == 'string') {
        result = dateObject;
    } else {
        return '';
    }
    return result;
};

var getWindowSize = function () {
    var myWidth = 0, myHeight = 0;
    if (typeof (window.innerWidth) == 'number') {
        //Non-IE
        myWidth = window.innerWidth;
        myHeight = window.innerHeight;
    } else if (document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)) {
        //IE 6+ in 'standards compliant mode'
        myWidth = document.documentElement.clientWidth;
        myHeight = document.documentElement.clientHeight;
    } else if (document.body && (document.body.clientWidth || document.body.clientHeight)) {
        //IE 4 compatible
        myWidth = document.body.clientWidth;
        myHeight = document.body.clientHeight;
    }
    return {
        'width': myWidth,
        'height': myHeight
    };
};

var clearEmptyValues = function (object) {
    if (typeof object == 'object') {
        for (key in object) {
            if (object[key] === null || object[key] === undefined || object[key] == "null") {
                delete object[key];
            }
        }
        return object;
    }
    return object;
};

var getObjectKeyCount = function (object) {
    var length;
    try {
        length = Object.keys(object).length;
    } catch (err) {
        length = 0;
        for (var i in object) {
            length++;
        }
    }
    return length;
};

// adds a case insentive version of Contains.
$.expr[':'].Contains = function (a, i, m) {
    return (a.textContent || a.innerText || "").toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
};

var displayFileSize = function (bytes) {
    var labels = new Array('TB', 'GB', 'MB', 'KB', 'bytes');
    var measurements = new Array(1099511627776, 1073741824, 1048576, 1024, 1);
    for (var i = 0; i < measurements.length; i++) {
        var conv = bytes / measurements[i];
        if (conv > 1) {
            return Math.round(conv * 10) / 10 + ' ' + labels[i];
        }
    }
    return 0;
};

var secondsToTime = function (secs) {
    var negative = false;
    if (secs < 0) {
        secs *= -1;
        negative = true;
    }
    var time = negative ? '-' : '';
    var hours = Math.floor(secs / 3600);
    var minutes = Math.floor((secs - (hours * 3600)) / 60);
    var seconds = parseInt(secs - (hours * 3600) - (minutes * 60));

    if (hours < 48) {
        return time + hours + 'h ' + minutes + 'm ' + seconds + 's';
    }
    var days = Math.floor(hours / 24);
    hours = hours % 24;
    return time + days + 'd ' + hours + 'h ' + minutes + 'm ' + seconds + 's';
};

var secondsToTimeColonSeparation = function (secs) {
    var negative = false;
    if (secs < 0) {
        secs *= -1;
        negative = true;
    }
    var time = negative ? '-' : '';
    var hours = Math.floor(secs / 3600);
    var minutes = Math.floor((secs - (hours * 3600)) / 60);
    var seconds = parseInt(secs - (hours * 3600) - (minutes * 60));

    return (hours < 10 ? '0' + hours : hours) + ':' + (minutes < 10 ? '0' + minutes : minutes) + ':' + (seconds < 10 ? '0' + seconds : seconds);
};

var localDateOffset = function() {
    //used for appending the local timezone. 
    // IE9 is buggy and needs the local timezone to not think it is Z-time: http://msdn.microsoft.com/en-us/library/ie/jj863688%28v=vs.85%29.aspx
    var pad = function (value) {
        return value < 10 ? '0' + value : value;
    };
    var date = new Date();
    var sign = (date.getTimezoneOffset() > 0) ? "-" : "+";
    var offset = Math.abs(date.getTimezoneOffset());
    var hours = pad(Math.floor(offset / 60));
    var minutes = pad(offset % 60);
    return sign + hours + ":" + minutes;
}

/*
* takes a file in server format and formats it to a better format.
*/
function fileFormat(file) {
    if (!file) {
        return;
    }
    file.filename = file.Name || '';
    file.active = (file.Attributes && file.Attributes.Active) || "True";
    file.startDate = (file.Attributes && file.Attributes.StartDate) || '';
    file.endDate = (file.Attributes && file.Attributes.EndDate) || '';
    file.orientation = (file.Attributes && file.Attributes.Orientation) || '';

    if (file.active == "True" || file.active === true) {
        if (!file.endDate && !file.startDate) {
            file.status = 'ok';
            return file;
        }
        if (file.endDate && Date.parse(file.endDate) < Date.now()) {
            file.status = 'expired';
            return file;
        }
        if (file.startDate && Date.parse(file.startDate) < Date.now()) {
            file.status = 'ok';
            return file;
        }
        if (file.startDate) {
            file.status = 'in future'; //File start date in future
            return file;
        }
        file.status = 'ok';
        return file;
    }
    else {
        file.status = 'not active'; //file not active
        return file;
    }
    return file;
}

function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}


(function ($, sr) {

    // debouncing function from John Hann
    // http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
    var debounce = function (func, threshold, execAsap) {
        var timeout;

        return function debounced() {
            var obj = this, args = arguments;
            function delayed() {
                if (!execAsap)
                    func.apply(obj, args);
                timeout = null;
            };

            if (timeout)
                clearTimeout(timeout);
            else if (execAsap)
                func.apply(obj, args);

            timeout = setTimeout(delayed, threshold || 100);
        };
    }
    // smartresize 
    jQuery.fn[sr] = function (fn) { return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr); };

})(jQuery, 'smartresize');

(function ($) {
    $.fn.center = function (options) {
        var margin = {
            height: this.outerHeight(true) - this.height(),
            width: this.outerWidth(true) - this.width()
        };

        options = $.extend({
            height: 0,
            width: 0
        }, options);
        

        var height = options.height;
        var width = options.width;

        this.css("height", "");
        this.css("width", "");

        if (!height) {
            height = this.height();
        }
        if (!width) {
            width = this.height();
        }
        
        var resizeFactor = 1;

        var fixWidth = false;
        var fixHeight = false;

        if (height + margin.height > $(window).height()) {
            // Resize factor
            fixHeight = true;

            resizeFactor = ($(window).height() - margin.height) / (height);
        }
        if (width + margin.width > $(window).width()) {
            // Resize factor
            fixWidth = true;

            if (resizeFactor > ($(window).width() - margin.width) / (width)) {
                resizeFactor = ($(window).width() - margin.width) / (width);
            }
        }



        if (resizeFactor !== 1) {
            this.css("height", parseInt(height * resizeFactor) + 'px');
            this.css("width", parseInt(width * resizeFactor) + 'px');
        }
        else {
            if (options.height) {
                this.css("height", options.height + 'px');
            }
            if (options.width) {
                this.css("width", options.width + 'px');
            }
        }
        



        this.css("position", "fixed");
        this.css("top", Math.floor(($(window).height() - this.outerHeight(true)) / 2));
        this.css("left", Math.floor(($(window).width() - this.outerWidth(true)) / 2));
        
        return this;
    };
})(jQuery);

(function ($) {
    $.fn.dblClick = function (options) {
        var DELAY = 300, clicks = 0, timer = null;

        this.on('click', function (e) {
            if (clicks === 0) {
                options.instant();
            }

            clicks++;  //count clicks

            if (clicks === 1) {
                timer = setTimeout(function () {
                    options.click();
                    clicks = 0;             //after action performed, reset counter

                }, DELAY);

            } else {
                clearTimeout(timer);    //prevent single-click action
                options.dblClick(); //perform double-click action
                clicks = 0;             //after action performed, reset counter
            }

        })
        .on("dblclick", function (e) {
            e.preventDefault();  //cancel system double-click event
        });
        return this;
    };
})(jQuery);

