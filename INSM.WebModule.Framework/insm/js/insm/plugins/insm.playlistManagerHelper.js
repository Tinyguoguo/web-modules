var contextObject, rootUI;
var playListManagerHelper = {
    version: "0.0.1",

    options: {

    },
    _init: function () {
        contextObject = this;
        rootUI = this.element;
    },

    _create: function () {
        contextObject = this;
        rootUI = this.element;
    },

    fillDropDown: function () {
        $.insmFramework('getChannelList', {
            success: function (e) {
                $.each(e, function (index, item) {
                    $("#drpChannelList").append($("<option>").attr("value", item.Id).text(item.Name));
                });
                $("#drpFilter").append($("<option>").attr("value", 1).text("Show all"));
                $("#drpFilter").append($("<option>").attr("value", 2).text("Only published"));
                $("#drpFilter").append($("<option>").attr("value", 3).text("With old versions published"));
                $("#drpFilter").append($("<option>").attr("value", 4).text("Modified last 7 days"));
                $("#drpFilter").append($("<option>").attr("value", 5).text("Modified last 30 days"));
                $("#drpFilter").append($("<option>").attr("value", 6).text("Landscape"));
                $("#drpFilter").append($("<option>").attr("value", 7).text("Portrait"));
            }
        });
    },
    _destroy: function () {

    },

    _log: function (msg) {
    }
};

(function ($, undefined) {
    $.widget("insm.insmplayListManagerHelper", playListManagerHelper);
})(jQuery);