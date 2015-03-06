var remoteFolderViewer = {
    version: "0.0.1",

    options: {
        data: [],
        onnodeSelection: null,
        title:""
    },

    //Start rendering for plugin
    _init: function () {
        nodecollection = [];
        contextObject_remoteFolderViewer = this;
        rootUI_remoteFolderViewer = this.element;
        rootUI_remoteFolderViewer.append("<div class='insm-playlist-manager-remoteviewerUI-title insm-lightbox-header' />");
        rootUI_remoteFolderViewer.append("<div class='insm-playlist-manager-remoteviewerUI' />");
        contextObject_remoteFolderViewer._convertToCompatibleArray(contextObject_remoteFolderViewer.options.data);
        var folderview = $('.insm-playlist-manager-remoteviewerUI').jstree({
            'core': {
                'data': nodecollection,
            }
        });
        $(".insm-playlist-manager-remoteviewerUI-title").text(contextObject_remoteFolderViewer.options.title)
        $('.insm-playlist-manager-remoteviewerUI').on("changed.jstree", function (e, data) {
            contextObject_remoteFolderViewer._trigger("onnodeSelection", e, data.selected);
        });
    },

    //convert Array to Compitible for jstree
    _convertToCompatibleArray: function (nodes) {
        $.each(nodes, function (index, item) {
            var convertednode = {
                "id": item.Id,
                "parent": item.ParentId==0?"#":item.ParentId,
                "text": item.Name,
                'state' : {
                    'opened' : true
                }
            };
            nodecollection.push(convertednode);
        });
        return nodecollection;
    },

    //Call this function when initialize plugin
    _create: function () {

    },

    //Call this function while remove plugin
    _destroy: function () {
        rootUI_remoteFolderViewer.empty();
    },

    //Trace on cosole window
    _log: function (msg) {
        console.log(msg);
    }
};

(function ($, undefined) {
    var contextObject_remoteFolderViewer, rootUI_remoteFolderViewer,nodecollection;
    $.widget("insm.insmRemoteFolderViewer", remoteFolderViewer);
})(jQuery);