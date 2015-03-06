/*
* INSM File
* This file contain the INSM File plugin
* 
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $('identifier').insmAddReference(settings);
*
* File dependencies:
* jQuery 1.9.1
* 
* Author:
* Guo Yang
* Instoremedia AB
*/

(function ($) {
    var methods = {
        init: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmAddReference');

            // If the plugin hasn't been initialized yet
            if (!_plugin) {
                _plugin = {
                    htmlElements: {
                        properties: $('<div />'),
                        staticProperties: $('<div />'),
                        loading: $('<div />'),
                        preview: $('<div />'),
                        browse: $('<div />')
                    },
                    settings: $.extend({
                        id: null,
                    }, options),
                    data: {
                        jsList: [],
                        cssList: []
                    }
                };
                // jQuery & plugins
                _plugin.data.jsList.push("js/jquery/ui/jquery-ui-1.10.3.custom.min.js");
                _plugin.data.jsList.push("js/jquery/ui/touch-punch/jquery-ui.touch-punch-0.2.2.js");
                _plugin.data.cssList.push("css/jquery/ui/jquery-ui-1.10.3.custom.min.css");
                _plugin.data.jsList.push("js/jquery/chart/Chart.js");
                _plugin.data.jsList.push("js/jquery/json/jquery.json.json2.js");
                _plugin.data.jsList.push("js/jquery/urlencode/jquery.urlencode.js");
                _plugin.data.jsList.push("js/jquery/getUrlParam/jquery.getUrlParam-2.1.js");
                _plugin.data.jsList.push("js/jquery/lodash/lodash.js");
                _plugin.data.jsList.push("js/jquery/center/center.js");
                
                
                // Modules
                
                _plugin.data.jsList.push("js/insm/modules/insm.menu.js");
                _plugin.data.jsList.push("js/insm/modules/insm.systemdetails.js");
                _plugin.data.jsList.push("js/insm/modules/insm.assetmanager.js");
                _plugin.data.jsList.push("js/insm/modules/insm.filemanager.js");   
                _plugin.data.jsList.push("js/insm/modules/insm.playlisteditor.js");
                _plugin.data.jsList.push("js/insm/modules/insm.statistics.js");  
                _plugin.data.jsList.push("js/insm/modules/insm.weblink.js");
                _plugin.data.jsList.push("js/insm/modules/insm.pricemanager.js");
                _plugin.data.jsList.push("js/insm/modules/insm.remote.js");
                _plugin.data.jsList.push("js/insm/modules/insm.remote2.js");
                _plugin.data.jsList.push("js/insm/modules/insm.playerpreviewmodule.js");
                _plugin.data.jsList.push("js/insm/modules/insm.setup.js");
                _plugin.data.jsList.push("js/insm/modules/dashboard2/insm.dashboard2.js");
                _plugin.data.jsList.push("js/insm/modules/insm.flipdemo.js");
                _plugin.data.jsList.push("js/insm/modules/playlistManager/insm.playlistManager.js");
                _plugin.data.jsList.push("js/insm/modules/admin/insm.admin.moduleselector.js");
                _plugin.data.jsList.push("js/insm/modules/admin/insm.admin.usermanagement.js");
                _plugin.data.jsList.push("js/insm/modules/admin/insm.admin.rolemanagement.js");
                
                // JS files created by india for Playlist Manager project
                _plugin.data.jsList.push("js/insm/plugins/insm.playlistManagerHelper.js");
                _plugin.data.jsList.push("js/insm/modules/playlistManager/insm.PlayList.js");
                _plugin.data.jsList.push("js/insm/modules/playlistManager/insm.PlayListGridUI.js");
                _plugin.data.jsList.push("js/insm/modules/playlistManager/insm.RegionTreeUI.js");
                _plugin.data.jsList.push("js/insm/plugins/insmLightBox/FileBrowser/insm.FileBrowserList.js");
                _plugin.data.jsList.push("js/insm/plugins/insmLightBox/FileBrowser/insm.FolderBrowserList.js");
                _plugin.data.jsList.push("js/insm/plugins/insmLightBox/FileBrowser/insm.preview.js");
                _plugin.data.jsList.push("js/insm/plugins/insmLightBox/FileBrowser/insm.previewUIPlayercontrolbar.js");
                _plugin.data.jsList.push("js/insm/plugins/insmLightBox/FileBrowser/insm.remoteFolderViewer.js");
                _plugin.data.jsList.push("js/insm/plugins/insmLightBox/insm.importPopup.js");
                _plugin.data.jsList.push("js/insm/plugins/insmLightBox/insm.Lightbox.AddNewPlaylist.js");
                _plugin.data.jsList.push("js/insm/plugins/insmLightBox/insm.Lightbox.FileBrowser.js");
                _plugin.data.jsList.push("js/insm/plugins/insmLightBox/insmAddonManager.js");
                _plugin.data.jsList.push("js/insm/plugins/insmLightBox/insmClear.js");
                _plugin.data.jsList.push("js/insm/plugins/insmLightBox/insmPublish.js");
                _plugin.data.jsList.push("js/insm/plugins/insmLightBox/insmRemovePlayList.js");
                _plugin.data.jsList.push("js/insm/plugins/insmLightBox/insmServerProcessingLoader.js");
                _plugin.data.jsList.push("js/insm/plugins/insmLightBox/insmWarning.js");
                _plugin.data.jsList.push("js/insm/framework/utility/insm.xmlProcessor.js");
                _plugin.data.jsList.push("js/insm/framework/utility/insmArrayUtility.js");
                _plugin.data.jsList.push("js/insm/framework/utility/insmEnums.js");
                _plugin.data.jsList.push("js/insm/framework/utility/insmObjectExtensions.js");
                _plugin.data.jsList.push("js/jquery/jstree/jstree.min.js");
                _plugin.data.jsList.push("js/jquery/jqgrid/grid.locale-en.js");
                _plugin.data.jsList.push("js/jquery/jqgrid/jquery.jqGrid.js");
                _plugin.data.jsList.push("js/jquery/jquery.mousewheel/jquery.mousewheel.js");
                //_plugin.data.jsList.push("js/jquery/jquery.mousewheel/jquery.mousewheel.min.js");
                _plugin.data.jsList.push("js/insm/plugins/insm.insmSlider/insm.insmSlider.js");
                _plugin.data.jsList.push("js/insm/plugins/insmPlaylistMenu/insm.playlist.menu.js");
                _plugin.data.jsList.push("js/insm/plugins/insmSetResolution/insm.SetResolution.js");
                _plugin.data.jsList.push("js/insm/plugins/insmPlaylistNotificationUI/insm.PlaylistNotificationUI.js");
                _plugin.data.jsList.push("js/insm/plugins/insmThumbnail/insm.Thumbnail.js");
                _plugin.data.jsList.push("js/insm/plugins/insmpreviewPopup/insm.PopupForPreview.js");
                _plugin.data.jsList.push("js/insm/plugins/insmPreviewContainer/insm.PreviewContainer.js");
                _plugin.data.jsList.push("js/insm/plugins/insmSpinner/insm.spinnerResolution.js");
                _plugin.data.jsList.push("js/insm/plugins/insmVolumeBar/insm.VolumeBar.js");
                _plugin.data.jsList.push("js/insm/plugins/insmContentUI/insm.contentUI.js");
                _plugin.data.jsList.push("js/insm/plugins/insmFontStyleTool/insmFontStyleTool.js");
                //_plugin.data.jsList.push("js/insm/plugins/insmColorPicker/colorpicker.js");
                _plugin.data.jsList.push("js/insm/plugins/insmColorPicker/colpick.js");
                //_plugin.data.jsList.push("js/insm/plugins/insmColorPicker/eye.js");
                _plugin.data.jsList.push("js/insm/plugins/insmColorPicker/insm.colorPicker.js");
                //_plugin.data.jsList.push("js/insm/plugins/insmColorPicker/jquery.js");
                //_plugin.data.jsList.push("js/insm/plugins/insmColorPicker/layout.js");
                //_plugin.data.jsList.push("js/insm/plugins/insmColorPicker/utils.js");
                _plugin.data.jsList.push("js/insm/plugins/TableGrid/insm.tableGridUI.js");
                _plugin.data.jsList.push("js/insm/plugins/insmTimeSpinner/jquery.plugin.js");
                _plugin.data.jsList.push("js/insm/plugins/insmTimeSpinner/jquery.timeentry.js");
                _plugin.data.jsList.push("js/insm/plugins/insmTemplatePropertyUI/insm.TemplatePropertyElementUI.js");
                _plugin.data.jsList.push("js/insm/plugins/insmTemplatePropertyUI/insmBrowserTool.js");
                _plugin.data.jsList.push("js/insm/plugins/insmDateSpinner/jquery.dateentry.js");
                _plugin.data.jsList.push("js/insm/plugins/insmAddOnTemplates/insm.AddOnsRightPanelInformation.js");
                _plugin.data.jsList.push("js/insm/plugins/insmAddOnTemplates/insm.AddOnsSelectTemplate.js");
                _plugin.data.jsList.push("js/insm/plugins/insmAddOnTemplates/insm.AddOnsTemplate.js");
                _plugin.data.jsList.push("js/insm/plugins/insmAddOnTemplates/insm.AddOnsTemplateInformation.js");
                _plugin.data.jsList.push("js/insm/plugins/insmWeekDays/insm.weekDays.js");
                _plugin.data.jsList.push("js/insm/plugins/insmRemotePlayList/insm.remotePlayList.js");
                _plugin.data.jsList.push("js/insm/plugins/insmClock/insmClock.js");
                _plugin.data.jsList.push("js/insm/plugins/insmInteractiveVolumebar/instm.interactiveVolumeBar.js");
                _plugin.data.jsList.push("js/insm/plugins/insmThumbnailContainer/insm.ThumbnailContainer.js");
                _plugin.data.jsList.push("js/insm/plugins/insmResolution/insm.Resolution.js");
                _plugin.data.jsList.push("js/insm/plugins/insmAdvancedUI/insm.advancedUI.js");
                _plugin.data.jsList.push("js/insm/plugins/insmTimeOptionsUI/insm.timeOptionsUI.js");
                _plugin.data.jsList.push("js/insm/plugins/insmPlaylistMediaSettings/insm.playlist.MediaSettings.js");
                _plugin.data.jsList.push("js/misc/Math.uuid.js");

                // CSS files created by india for Playlist Manager project
                _plugin.data.cssList.push("css/insm/modules/playlistManager/insm.playlistManager.css");
                _plugin.data.cssList.push("css/insm/plugins/insmLightBox/insm.AddonManager.css");
                _plugin.data.cssList.push("css/insm/plugins/insmLightBox/insm.FileBrowserList.css");
                _plugin.data.cssList.push("css/insm/plugins/insmLightBox/insm.insmFolderBrowserList.css");
                _plugin.data.cssList.push("css/insm/plugins/insmLightBox/insm.insmRemoteFolderViewer.css");
                _plugin.data.cssList.push("css/insm/plugins/insmLightBox/insm.LightBox.css");
                _plugin.data.cssList.push("css/insm/plugins/insmLightBox/insm.Lightbox.FileBrowser.css");
                _plugin.data.cssList.push("css/insm/plugins/insmLightBox/insm.Lightbox.ServerCall.css");
                _plugin.data.cssList.push("css/insm/plugins/insmLightBox/insm.previewUI.css");
                _plugin.data.cssList.push("css/insm/plugins/insmLightBox/insm.previewUIPlayercontrolbar.css");
                _plugin.data.cssList.push("css/insm/plugins/insmContentUI/insm.contentUI.css");
                _plugin.data.cssList.push("css/insm/plugins/insmPlaylistMenu/insm.playlist.menu.css");
                _plugin.data.cssList.push("css/insm/plugins/insmSpinner/insm.Spinner.css");
                _plugin.data.cssList.push("css/insm/plugins/insmThumbnailContainer/insm.ThumbnailContainer.css");
                _plugin.data.cssList.push("css/insm/plugins/insmPlaylistMediaSettings/insm.playlist.MediaSettings.css");
                _plugin.data.cssList.push("css/insm/plugins/insmPreviewContainer/insm.PreviewContainer.css");
                _plugin.data.cssList.push("css/insm/plugins/insm.insmSlider/insm.insmSlider.css");
                _plugin.data.cssList.push("css/insm/plugins/insmAddOnTemplates/insm.AddOnTemplates.css");
                _plugin.data.cssList.push("css/insm/plugins/insmPlaylistNotificationUI/insm.PlaylistNotificationUI.css");
                _plugin.data.cssList.push("css/insm/plugins/insmpreviewPopup/insm.PopupForPreview.css");
                _plugin.data.cssList.push("css/insm/plugins/TableGrid/insm.tableGridUI.css");
                _plugin.data.cssList.push("css/insm/plugins/insmRemotePlayList/insm.remotePlayList.css");
                _plugin.data.cssList.push("css/insm/plugins/insmFontStyleTool/insmFontStyleTool.css");
                _plugin.data.cssList.push("css/insm/plugins/insmColorPicker/colpick.css");
                _plugin.data.cssList.push("css/insm/plugins/insmColorPicker/insm.colorPicker.css");
                _plugin.data.cssList.push("css/insm/plugins/insmTimeOptionsUI/insm.timeOptionsUI.css");
                _plugin.data.cssList.push("css/insm/plugins/insmWeekDays/insm.weekDays.css");
                _plugin.data.cssList.push("css/insm/plugins/insmTimeSpinner/insm.timeSpinner.css");
                _plugin.data.cssList.push("css/insm/plugins/insmClock/insmClock.css");
                _plugin.data.cssList.push("css/insm/plugins/insmInteractiveVolumeBar/instm.interactiveVolumeBar.css");
                _plugin.data.cssList.push("css/insm/plugins/insmVolumeBar/insm.VolumeBar.css");

                _plugin.data.cssList.push("css/insm/insm.playlistgrid.css");
                _plugin.data.cssList.push("css/jquery/jqgrid/ui.jqgrid.css");
                _plugin.data.cssList.push("css/jquery/jstree/style.css");

                // Plugins
                _plugin.data.jsList.push("js/insm/plugins/insm.notification2.js"); 
                _plugin.data.jsList.push("js/insm/plugins/insm.notification.js");
                _plugin.data.jsList.push("js/insm/plugins/insm.dialog.js");
                _plugin.data.jsList.push("js/insm/plugins/insm.tooltip.js");
                _plugin.data.jsList.push("js/insm/plugins/insm.flip.js");
                _plugin.data.jsList.push("js/insm/plugins/insm.fullscreenloading.js");
                _plugin.data.jsList.push("js/insm/plugins/insm.dragdrop.js");
                _plugin.data.jsList.push("js/insm/plugins/insm.searchfield.js");
                _plugin.data.jsList.push("js/insm/plugins/insm.pagination.js");
                _plugin.data.jsList.push("js/insm/plugins/insm.asset.js");
                _plugin.data.jsList.push("js/insm/plugins/insm.login.js");
                _plugin.data.jsList.push("js/insm/plugins/insm.assetgrid.js");
                _plugin.data.jsList.push("js/insm/plugins/insm.highlight.js");
                _plugin.data.jsList.push("js/insm/plugins/insm.playerpreview.js");
                _plugin.data.jsList.push("js/insm/plugins/insm.playlistgrid.js");
                _plugin.data.jsList.push("js/insm/plugins/insm.utilities.js");
                _plugin.data.jsList.push("js/insm/plugins/insmPopup/insm.popup.js");
                _plugin.data.jsList.push("js/insm/plugins/insmPlaylistManagerTable/insm.playlistManagerTable.js");
                _plugin.data.jsList.push("js/insm/plugins/insm.table.js");
                _plugin.data.jsList.push("js/insm/insm.tabs.js");
                _plugin.data.jsList.push("js/insm/plugins/insmHashChange/insm.hashchange.js");
                _plugin.data.jsList.push("js/insm/plugins/insmPlayerDetails/insm.playerdetails2.js");
                _plugin.data.jsList.push("js/insm/plugins/insmModuleStyle/insm.modulestyle.js");
                _plugin.data.jsList.push("js/insm/plugins/insmSortableList/insm.sortablelist.js");
                _plugin.data.jsList.push("js/insm/plugins/insmGroupStyle/insm.groupstyle.js");
                _plugin.data.jsList.push("js/insm/plugins/insmUserStyle/insm.userstyle.js");
                _plugin.data.jsList.push("js/insm/plugins/insmItemGrid/insm.itemgrid.js");
                _plugin.data.jsList.push("js/insm/plugins/insmAsset/insm.asset.js"); 
                _plugin.data.jsList.push("js/insm/plugins/insmPlayer/insm.player.js"); 
                _plugin.data.jsList.push("js/insm/plugins/insmFile/insm.file.js");
                _plugin.data.jsList.push("js/insm/plugins/insmRegionPicker/insm.regionpicker.js");
                _plugin.data.jsList.push("js/insm/plugins/insmListTree/insm.listtree.js");
                _plugin.data.jsList.push("js/insm/plugins/insmProgressHandler/insm.progresshandler.js");
                _plugin.data.jsList.push("js/insm/plugins/insmFeedbackOverlay/insm.feedbackoverlay.js");
                _plugin.data.jsList.push("js/insm/plugins/insmInput/insm.input.js");
                _plugin.data.jsList.push("js/insm/plugins/insmInput/insm.input.date.js");
                _plugin.data.jsList.push("js/insm/plugins/insmInput/insm.input.dateinterval.js");
                _plugin.data.jsList.push("js/insm/plugins/insmInput/insm.input.dateintervalmonth.js");
                _plugin.data.jsList.push("js/insm/plugins/insmInput/insm.input.dateintervalyear.js");
                _plugin.data.jsList.push("js/insm/plugins/insmInput/insm.input.string.js");
                _plugin.data.jsList.push("js/insm/plugins/insmInput/insm.input.radio.js");
                _plugin.data.jsList.push("js/insm/plugins/insmInput/insm.input.integer.js");
                _plugin.data.jsList.push("js/insm/plugins/insmInput/insm.input.boolean.js");
                _plugin.data.jsList.push("js/insm/plugins/insmInput/insm.input.slider.js");
                _plugin.data.jsList.push("js/insm/plugins/insmInput/insm.input.file.js");
                _plugin.data.jsList.push("js/insm/plugins/insmInput/insm.input.assetproperties.js");
                _plugin.data.jsList.push("js/insm/plugins/insmInput/insm.input.fileproperties.js");
                _plugin.data.jsList.push("js/insm/plugins/insmInput/insm.input.table.js");
                _plugin.data.jsList.push("js/insm/plugins/insmInput/insm.input.resolution.js");
                _plugin.data.jsList.push("js/insm/plugins/insmInput/insm.input.upload.js");
                _plugin.data.jsList.push("js/insm/plugins/insmInput/insm.input.templatedata.js");
                _plugin.data.jsList.push("js/insm/plugins/insmInput/insm.input.tags.js");
                _plugin.data.jsList.push("js/insm/plugins/insmInput/insm.input.tag.js");
                _plugin.data.jsList.push("js/insm/plugins/insmInput/insm.input.playerplaylistcommand.js");
                _plugin.data.jsList.push("js/insm/plugins/insmInput/insm.input.playerplaylist.js");
                _plugin.data.jsList.push("js/insm/plugins/insmInput/insm.input.player.js");
                _plugin.data.jsList.push("js/insm/plugins/insmInput/insm.input.playerview.js");
                _plugin.data.jsList.push("js/insm/plugins/insmInputPlaceholder/insm.inputplaceholder.js");
                _plugin.data.jsList.push("js/insm/plugins/insmLoader/insm.loader.js");
                _plugin.data.jsList.push("js/insm/plugins/insmErrorHandler/insm.errorhandler.js");
                _plugin.data.jsList.push("js/insm/plugins/insmCombobox/insm.combobox.js");
                _plugin.data.jsList.push("js/insm/insm.tabs.js");
                _plugin.data.jsList.push("js/insm/insm.bar.js");
                _plugin.data.jsList.push("js/insm/insm.progressbar.js");
                _plugin.data.jsList.push("js/insm/insm.statusbox.js");
                _plugin.data.jsList.push("js/insm/insm.bigstatusbox.js");

                //framework
                
                _plugin.data.jsList.push("js/insm/framework/insm.service.js");
                _plugin.data.jsList.push("js/insm/framework/insm.service.regiontree.js");
                _plugin.data.jsList.push("js/insm/framework/insm.service.asset.js");
                _plugin.data.jsList.push("js/insm/framework/insm.service.player.js");
                _plugin.data.jsList.push("js/insm/framework/insm.service.playoutstate.js");
                _plugin.data.jsList.push("js/insm/framework/insm.service.file.js");
                _plugin.data.jsList.push("js/insm/framework/insm.service.unconfiguredplayers.js");
                _plugin.data.jsList.push("js/insm/framework/insm.framework.js");
                _plugin.data.jsList.push("js/insm/insm.manifest.js");

                //plugin css
                _plugin.data.cssList.push("css/insm/insm.bigstatusbox.css");
                _plugin.data.cssList.push("css/insm/insm.statusbox.css");
                _plugin.data.cssList.push("css/insm/insm.bar.css");
                _plugin.data.cssList.push("css/insm/insm.progressbar.css");
                _plugin.data.cssList.push("css/insm/insm.default.css");
                _plugin.data.cssList.push("css/insm/insm.tabs.css");
                _plugin.data.cssList.push("css/insm/plugins/insm.dialog.css");
                _plugin.data.cssList.push("css/insm/plugins/insm.tooltip.css");
                _plugin.data.cssList.push("css/insm/plugins/insm.flip.css");
                _plugin.data.cssList.push("css/insm/plugins/insm.notification.css");
                _plugin.data.cssList.push("css/insm/plugins/insm.playerpreview.css");
                _plugin.data.cssList.push("css/insm/plugins/insmPagination/insm.pagination.css");
                _plugin.data.cssList.push("css/insm/plugins/insmPopup/insm.popup.css");
                _plugin.data.cssList.push("css/insm/plugins/insmLogin/insm.login.css");
                _plugin.data.cssList.push("css/insm/plugins/insmSearchfield/insm.searchfield.css");
                _plugin.data.cssList.push("css/insm/plugins/insmTable/insm.table.css");
                _plugin.data.cssList.push("css/insm/plugins/asset/insm.asset.css");
                _plugin.data.cssList.push("css/insm/plugins/itemGrid/insm.itemgrid.css");
                _plugin.data.cssList.push("css/insm/plugins/assetGrid/insm.assetgrid.css");
                _plugin.data.cssList.push("css/insm/plugins/playListGrid/insm.playlistgrid.css");
                _plugin.data.cssList.push("css/insm/plugins/insmLoader/insm.loader.css");
                _plugin.data.cssList.push("css/insm/plugins/insmModuleStyle/insm.modulestyle.css");
                _plugin.data.cssList.push("css/insm/plugins/insmGroupStyle/insm.groupstyle.css");
                _plugin.data.cssList.push("css/insm/plugins/insmUserStyle/insm.userstyle.css");
                _plugin.data.cssList.push("css/insm/plugins/insmListTree/insm.listtree.css");
                _plugin.data.cssList.push("css/insm/plugins/insmPlayerDetails2/insm.playerdetails2.css");
                _plugin.data.cssList.push("css/insm/plugins/insmRegionPicker/insm.regionpicker.css");
                _plugin.data.cssList.push("css/insm/plugins/insmFeedbackOverlay/insm.feedbackoverlay.css");
                _plugin.data.cssList.push("css/insm/plugins/insmInput/insm.input.css");
                _plugin.data.cssList.push("css/insm/plugins/insmInputRadio/insm.input.radio.css");
                _plugin.data.cssList.push("css/insm/plugins/insmInputTags/insm.input.tags.css");
                _plugin.data.cssList.push("css/insm/plugins/insmInputPlayerPlaylist/insm.input.playerplaylist.css");
                _plugin.data.cssList.push("css/insm/plugins/insmInputPlayer/insm.input.player.css");
                _plugin.data.cssList.push("css/insm/plugins/insmInputPlayerView/insm.input.playerview.css");
                _plugin.data.cssList.push("css/insm/plugins/insmInputDate/insm.input.date.css");
                _plugin.data.cssList.push("css/insm/plugins/insmInputDateInterval/insm.input.dateinterval.css");
                _plugin.data.cssList.push("css/insm/plugins/insmInputTemplateData/insm.input.templatedata.css");
                _plugin.data.cssList.push("css/insm/plugins/file/insm.file.css");
                _plugin.data.cssList.push("css/insm/insm.tabs.css");
                _plugin.data.cssList.push("css/insm/plugins/insmInputPlaceholder/insm.inputplaceholder.css");
                _plugin.data.cssList.push("css/insm/plugins/insmCombobox/insm.combobox.css");

                //Module css

                _plugin.data.cssList.push("css/insm/modules/menu/insm.menu.css");
                _plugin.data.cssList.push("css/insm/modules/systemdetails/insm.systemdetails.css");
                _plugin.data.cssList.push("css/insm/modules/assetmanager/insm.assetmanager.css");
                _plugin.data.cssList.push("css/insm/modules/playlisteditor/insm.playlisteditor.css");
                _plugin.data.cssList.push("css/insm/modules/filemanager/insm.filemanager.css");
                _plugin.data.cssList.push("css/insm/modules/statistics/insm.statistics.css");
                _plugin.data.cssList.push("css/insm/modules/remote/insm.remote.css");
                _plugin.data.cssList.push("css/insm/modules/setup/insm.setup.css");
                _plugin.data.cssList.push("css/insm/modules/dashboard2/insm.dashboard2.css");
                _plugin.data.cssList.push("css/insm/modules/flipdemo/insm.flipdemo.css");
                _plugin.data.cssList.push("css/insm/modules/playerpreviewmodule/insm.playerpreviewmodule.css");
                _plugin.data.cssList.push("css/insm/modules/pricemanager/insm.pricemanager.css");
                _plugin.data.cssList.push("css/insm/modules/admin/moduleselector/insm.admin.moduleselector.css");
                _plugin.data.cssList.push("css/insm/modules/admin/rolemanagement/insm.admin.rolemanagement.css");
                _plugin.data.cssList.push("css/insm/modules/admin/usermanagement/insm.admin.usermanagement.css");
                _plugin.data.cssList.push("css/modules/insm.loginform.css");
                _plugin.data.cssList.push("css/modules/errorPopup.css");
                _plugin.data.cssList.push("css/modules/button.css");
                _plugin.data.cssList.push("css/modules/input.css");

                //config

                _plugin.data.jsList.push("config/config.js");
                _plugin.data.cssList.push("config/config.css"); 

                $.each(_plugin.data.jsList, function (index, js) {
                    try{
                        $this.append('<script  type="text/javascript" src=' + js + '/>');
                    } catch (err) {
                        throw new Error(js);
                    }
                });
                $.each(_plugin.data.cssList, function (index, css) {
                    $this.append('<link href=' + css + ' rel="stylesheet" type="text/css" />');
                });
                $this.data('insmAddReference', _plugin);
            }            
            return $this;
        },
       
        destroy: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmAddReference');
            if (_plugin) {
                _plugin.htmlElements.properties.insmInput('destroy');
                _plugin.htmlElements.staticProperties.insmInput('destroy');
                $this.data('insmAddReference', null);
            }
            $this.empty();
            return $this;
        }
    };

    $.fn.insmAddReference = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmAddReference');
            return null;
        }
    };

    $.insmAddReference = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmAddReference');
            return null;
        }
    };
})(jQuery);
