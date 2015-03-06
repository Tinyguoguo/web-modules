/*
* INSM Asset
* This file contain the INSM DragDrop function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmPlayListGrid(settings);
*
* File dependencies:
* jQuery 1.6.1
* insmNotification
*
* Authors:
* Guo Yang
*/

(function ($) {
	var methods = {
		init: function (options) {
			var $this = $(this);
			var _plugin = $this.data('insmPlayListGrid');

			if (!_plugin) {
				_plugin = {
					settings: $.extend({
                        onPublish: function () {
				
						},
                        onRemove: function () {
				
						},
                        onInUse: function () {
				
						},
                        onEdit: function () {
				
						},
						items: []
					}, options),
					data: {
						headers: {
							Versions: {
								weight: 0.5,
								name: '',
								output: function (playlist) {
									var stateRow = $('<div />');
									var rowIcon = $('<div />');
									playlist._versionButton = rowIcon;
									var inUseArray = [];
									if (playlist.subItems && playlist.subItems.length != 0) {
										$.each(playlist.subItems, function (index, sub) {
											if (sub.inUse) {
												inUseArray.push(sub.id);
											}
										});
									}
									if (playlist.subItems && playlist.subItems.length != 0) {
										stateRow.text('' + playlist.subItems.length + ' versions').addClass('is-clickable').append(rowIcon);
										if (_plugin.data.expandedItems.indexOf(playlist.id) > -1) {
											rowIcon.addClass('version-collapse');
										} else {
											rowIcon.addClass('version-expand');
										}
										
										stateRow.click(function () {
											
											if (_plugin.data.expandedItems.indexOf(playlist.id) > -1) {
												
                                                _plugin.htmlElements.tableDiv.insmPlaylistManagerTable('collapse', { item: playlist });
												_plugin.data.expandedItems.splice(_plugin.data.expandedItems.indexOf(playlist.id), 1);
												rowIcon.removeClass('version-collapse').addClass('version-expand');
												if (playlist.inUse) {
													if (inUseArray.length > 0) {
														playlist._inUseElement.removeClass('inuse').addClass('inuse-subinuse is-clickable');
													} 
												} else if (inUseArray.length > 0) {
													playlist._inUseElement.addClass('subinuse is-clickable').removeClass('not-inuse');
												}
											} else {										
                                                _plugin.htmlElements.tableDiv.insmPlaylistManagerTable('expand', { item: playlist });
												_plugin.data.expandedItems.push(playlist.id);
												rowIcon.removeClass('version-expand').addClass('version-collapse');
												if (playlist.inUse) {
													if (inUseArray.length > 0) {
														playlist._inUseElement.removeClass('inuse-subinuse').addClass('inuse');
													}
												} else if (inUseArray.length > 0) {
													playlist._inUseElement.removeClass('subinuse is-clickable').addClass('not-inuse');
												}
											}
										});
									}
									return stateRow;

								},
								sort: false
							},
							InUse: {
								weight: 0.5,
								name: 'In Use',
								output: function (playlist) {
									var stateRow = $('<div />');
									playlist._inUseElement = stateRow;
									var inUseArray = [];
									if (playlist.inUse) {
										stateRow.addClass('is-clickable').click(function () {
											_plugin.settings.onInUse(playlist);
										})										
									}
									if (playlist.subItems && playlist.subItems.length != 0) {
										$.each(playlist.subItems, function (index, sub) {
											if (sub.inUse) {
												inUseArray.push(sub.id);
											}
										});
									}
									if (playlist.inUse) {
										
                                        if (inUseArray.length > 0) {
											stateRow.click(function () {
												if (_plugin.data.expandedItems.indexOf(playlist.id) < 0) {
													stateRow.removeClass('inuse-subinuse').addClass('inuse');
                                                    _plugin.htmlElements.tableDiv.insmPlaylistManagerTable('expand', { item: playlist });
													_plugin.data.expandedItems.push(playlist.id);
													playlist._versionButton.removeClass('version-expand').addClass('version-collapse');
												}
											});
											if (_plugin.data.expandedItems.indexOf(playlist.id) < 0) {
												stateRow.addClass('inuse-subinuse');
											} else {
												stateRow.addClass('inuse');
											}

										} else {
											stateRow.addClass('inuse');
										}
									} else if (inUseArray.length > 0) {
										
										stateRow.addClass('is-clickable').click(function () {
											if (_plugin.data.expandedItems.indexOf(playlist.id) < 0) {
												stateRow.removeClass('is-clickable subinuse').addClass('not-inuse');
                                                _plugin.htmlElements.tableDiv.insmPlaylistManagerTable('expand', { item: playlist });
												_plugin.data.expandedItems.push(playlist.id);
												playlist._versionButton.removeClass('version-expand').addClass('version-collapse');
											}
										});
										if (_plugin.data.expandedItems.indexOf(playlist.id) < 0) {
											stateRow.addClass('subinuse');
										} else {
											stateRow.addClass('not-inuse').removeClass('is-clickable');
										}											
									}
									return stateRow;
								},
								sort: false
							},
							Publish: {
								weight: 0.4,
								name: 'Publish',
								output: function (playlist) {
									var stateRow = $('<div />').addClass('publish is-clickable');
									stateRow.click(function () {									    
										_plugin.settings.onPublish(playlist);
									});
									return stateRow;

								},
								sort: false
							},
							Edit: {
								weight: 0.3,
								name: 'Edit',
								output: function (playlist) {

									var stateRow = $('<div />').addClass('edit is-clickable');
									stateRow.click(function () {
										_plugin.settings.onEdit(playlist);
									});
									return stateRow;

								},
								sort: false
							},
							Name: {
								weight: 1,
								name: 'Name',
								output: function (playlist) {

									var stateRow = $('<div />').text(playlist.name);

									return stateRow;

								},
								sort: function (a, b) {
									if (a.name.toLowerCase() < b.name.toLowerCase()) {
										return -1;
									}
									else if (a.name.toLowerCase() > b.name.toLowerCase()) {
										return 1;
									}
									return 0;
								}

							},
							ModifiedDate: {
								weight: 0.6,
								name: 'Modified Date',
								output: function (playlist) {
	
									var stateRow = $('<div />').text(playlist.modificationDate.substring(0, playlist.modificationDate.length - 3));

									return stateRow;

								},
								sort: function (a, b) {
									if (a.modificationDate.toLowerCase() < b.modificationDate.toLowerCase()) {
										return -1;
									}
									else if (a.modificationDate.toLowerCase() > b.modificationDate.toLowerCase()) {
										return 1;
									}
									return 0;
								}

							},
							ModifiedBy: {
								weight: 0.8,
								name: 'Modified by',
								output: function (playlist) {

									var stateRow = $('<div />').text(playlist.modifiedBy);
									return stateRow;

								},
								sort: function (a, b) {
									if (a.modifiedBy.toLowerCase() < b.modifiedBy.toLowerCase()) {
										return -1;
									}
									else if (a.modifiedBy.toLowerCase() > b.modifiedBy.toLowerCase()) {
										return 1;
									}
									return 0;
								}

							},

							Orientation: {
								weight: 0.5,
								name: 'Orientation',
								output: function (playlist) {
									var stateRow = $('<div />').text(playlist.orientation);

									return stateRow;
								},
								sort: function (a, b) {
									if (a.orientation.toLowerCase() < b.orientation.toLowerCase()) {
										return -1;
									}
									else if (a.orientation.toLowerCase() > b.orientation.toLowerCase()) {
										return 1;
									}
									return 0;
								}

							},
							Resolution: {
								weight: 0.5,
								name: 'Resolution',
								output: function (playlist) {

									var stateRow = $('<div />').text(playlist.resolution);
									return stateRow;

								},
								sort: function (a, b) {
									if (a.resolution.toLowerCase() < b.resolution.toLowerCase()) {
										return -1;
									}
									else if (a.resolution.toLowerCase() > b.resolution.toLowerCase()) {
										return 1;
									}
									return 0;
								}

							},
							Remove: {
								weight: 0.4,
								name: 'Remove',
								output: function (playlist) {

									var stateRow = $('<div />').addClass('remove is-clickable');
									stateRow.click(function () {
										_plugin.settings.onRemove(playlist);
									});
									return stateRow;

								},
								sort: false
							}
						},
						
						expandedItems: [],
                        InitSubItems: []
					},
					htmlElements: {
					    tableDiv: $('<div />').addClass('playlistgrid')
					}
				};

				$this.data('insmPlayListGrid', _plugin);
			}

            $this.append(_plugin.htmlElements.tableDiv.insmPlaylistManagerTable({
				
				headers: _plugin.data.headers,
				items: _plugin.settings.items
			}));
			return $this;
		},
		
		update: function (options) {
			var $this = $(this);
			var _plugin = $this.data('insmPlayListGrid');	
            _plugin.htmlElements.tableDiv.insmPlaylistManagerTable('update', { items: options.items });
        },
        highLight: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmPlayListGrid');
            _plugin.htmlElements.tableDiv.insmPlaylistManagerTable('select', { item: options.item });
		},
		destroy: function () {
			var $this = $(this);
			var _plugin = $this.data('insmPlayListGrid');

			return $this;
		}
	};
		

	$.fn.insmPlayListGrid = function (method) {
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error('Method ' + method + ' does not exist on $.insmPlayListGrid');
		}
	};
})(jQuery);
