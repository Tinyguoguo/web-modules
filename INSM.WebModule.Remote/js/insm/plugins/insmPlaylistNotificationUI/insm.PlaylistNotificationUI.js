var PlaylistNotificationUI = {
    version: "0.0.1",

    options: {

    },

    _init: function () {
        _plugin = {};
        _plugin.htmlElements = {
            targetspan: $("<span />")
        };

        rootUI_PlaylistNotificationUI.append(_plugin.htmlElements.targetspan);
        _plugin.htmlElements.targetspan.addClass('insm-playlistmanager-playlistNotificationUI-textposition');
    },

    InvokeNotification: function (notificationText) {
        _plugin.htmlElements.targetspan.html(notificationText);
        rootUI_PlaylistNotificationUI.css("background-color", "rgb(253,224,174)");
        _plugin.htmlElements.targetspan.animate({ opacity: 1 }, 2000,
            function () {
                _plugin.htmlElements.targetspan.animate({ opacity: 0 }, 5000, function () {
                    rootUI_PlaylistNotificationUI.css("background-color", "");
                    contextObject_PlaylistNotificationUI._destroy();
                });
            }
        );
    },

    _create: function () {
        contextObject_PlaylistNotificationUI = this;
        rootUI_PlaylistNotificationUI = this.element;
    },

    _destroy: function () {
        rootUI_PlaylistNotificationUI.empty();
    },

    _log: function (msg) {
        console.log(msg);
    }
};

(function ($, undefined) {
    var contextObject_PlaylistNotificationUI, rootUI_PlaylistNotificationUI;
    var _plugin;
    $.widget("insm.PlaylistNotificationUI", PlaylistNotificationUI);
})(jQuery);