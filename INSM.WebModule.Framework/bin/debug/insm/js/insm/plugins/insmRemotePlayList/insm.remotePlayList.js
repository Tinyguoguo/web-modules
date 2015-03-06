var remotePlayListObject = {

    options: {
        targetLocation: {},
        onSelectRemotePlayList:null
    },

    /*
    Description:Startup function for plugin
    Parameters:none
    Return:none
    */
	_init: function () {
		rootUI_remotePlayList = this.element;
		ContextObject_remotePlayList = this;
		_remoteplayList = {};
		_remoteplayList.htmlElements = {
		    content: {
		        backDrop: {
		            container: $("<div />").addClass('insm-playlist-manager-remotePlaylist-backdrop')
		        },
		        dialog: {
		            container: $("<div />").addClass('insm-playlist-manager-remotePlaylist-box'),
		            //closeButton: $("<div />").addClass('insm-playlist-manager-remotePlaylist-close').text('X'),
		            header: {
		                container: $("<div />").addClass("insm-servercall-header-box").attr("id", "divboxforclear").text("Import Playlist from..."),
		                closeButton: $("<div />").addClass("insm-servercall-close").attr("id", "closeForClear")
		            },

		            content: {
		                container: $("<div />").addClass('insm-playlist-manager-remotePlaylist-content'),
		                tablePart: $("<div />").addClass('insm-playlist-manager-remotePlaylist-upperPart'),
		                buttonPart: {
		                    container: $("<div />").addClass('insm-playlist-manager-remotePlaylist-lowerPart'),
		                    buttonOK: $('<button>').text("OK").addClass('insm-playlist-manager-remotePlaylist-button'),
		                    buttonCancel: $('<button>').text("Cancel").addClass('insm-playlist-manager-remotePlaylist-button'),
		                }
		            }

		        }
		    }
		};

	    rootUI_remotePlayList.append(_remoteplayList.htmlElements.content.backDrop.container)
            .append(_remoteplayList.htmlElements.content.dialog.container
            //.append(_remoteplayList.htmlElements.content.dialog.closeButton)
            .append(_remoteplayList.htmlElements.content.dialog.header.container
            .append(_remoteplayList.htmlElements.content.dialog.header.closeButton))
            .append(_remoteplayList.htmlElements.content.dialog.content.container
            .append(_remoteplayList.htmlElements.content.dialog.content.tablePart)
            .append(_remoteplayList.htmlElements.content.dialog.content.buttonPart.container
            .append(_remoteplayList.htmlElements.content.dialog.content.buttonPart.buttonCancel)
            .append(_remoteplayList.htmlElements.content.dialog.content.buttonPart.buttonOK))));

	    _remoteplayList.htmlElements.content.dialog.header.closeButton.on("click", remotePlayListObject.closeBox)

	    _remoteplayList.htmlElements.content.dialog.content.buttonPart.buttonOK.prop('disabled', 'true');

	    _remoteplayList.htmlElements.content.dialog.content.buttonPart.buttonOK.on("click", function () {

	        $.insmFramework('getSchedule', {
	            fileId: selectedID,
	            success: function (e) {
	                var rowxmldata = e;
	                var arrayProccesor = new ArrayUtility();
	                var obj = arrayProccesor.convertXmltoPlayList(rowxmldata, rowFileInformation);
	                var EditedData = { data: obj };
	                ContextObject_remotePlayList._trigger('onSelectRemotePlayList', null, EditedData);
	                ContextObject_remotePlayList.closeBox();
	            }
	        });

	    });

	    _remoteplayList.htmlElements.content.dialog.content.buttonPart.buttonCancel.on("click", function () {
	        ContextObject_remotePlayList.closeBox();
	    });


	    tableUI = $('<Table/>').append("<thead><tr><th>Name</th><th>Modified date</th><th>Modified by</th><th>Orientation</th><th>Resolution</th></tr></thead>");
	    tableUI.addClass("insm-playlist-manager-remotePlaylist-table");
	    _remoteplayList.htmlElements.content.dialog.content.tablePart.append(tableUI);

	},

    /*
    Description:invoke dialog
    Parameters:List of playlist
    Return:none
    */
	invokeDialog: function (dataSource) {
	    ardb = dataSource;
	    $('.insm-playlist-manager-remotePlaylist-backdrop, .insm-playlist-manager-remotePlaylist-box').animate({ 'opacity': '.50' }, 300, 'linear');
	    $('.insm-playlist-manager-remotePlaylist-box').animate({ 'opacity': '1.00' }, 300, 'linear');
	    $('.insm-playlist-manager-remotePlaylist-backdrop, .insm-playlist-manager-remotePlaylist-box').css('display', 'block');
	    $.each(ardb, function (index, item) {
	        var row = $('<tr />').attr("data-remotePlaylist","y").attr("data-id",item.id);
	        row.append($('<td />').text(item.name));
	        row.append($('<td />').text(item.modificationDate));
	        row.append($('<td />').text(item.modifiedBy));
	        row.append($('<td />').text(item.orientation));
	        row.append($('<td />').text(item.resolution));
	        tableUI.append(row);
	    });

	    $("tr[data-remotePlaylist='y']").on('click', function (e) {
	        selectedID = Number($(e.currentTarget).attr('data-id'));
	        _remoteplayList.htmlElements.content.dialog.content.buttonPart.buttonOK.removeAttr('disabled')
	    });
	},
    /*
    Description:Close Dialog
    Parameters:Jquery Event
    Return:none
    */
	closeBox:function (e) {
        $('.insm-playlist-manager-remotePlaylist-backdrop, .insm-playlist-manager-remotePlaylist-box').animate({ 'opacity': '0' }, 300, 'linear', function () {
                $('.insm-playlist-manager-remotePlaylist-backdrop, .insm-playlist-manager-remotePlaylist-box').css('display', 'none');
        });
        rootUI_remotePlayList.empty();
    },

    /*
    Description:Rendering function for plugin
    Parameters:
    Return:
    */
	_create: function () {
		//console.log('Here');
	},

    /*
    Description:Destructor for plugin
    Parameters:
    Return:
    */
	_destroy: function () {

	}
};

(function ($, undefiend) {
    var rootUI_remotePlayList, ContextObject_remotePlayList;
    var _remoteplayList, ardb, tableUI,selectedID;
	$.widget("insm.remotePlayList", remotePlayListObject);
})(jQuery);