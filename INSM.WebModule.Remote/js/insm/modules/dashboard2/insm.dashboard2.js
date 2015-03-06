/*
* INSM Dashboard
* This file contains the INSM Dashboard plugin.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmDashboard2(settings);
*
* File dependencies:
* jQuery 1.8.2
* jQuery UI 1.8.23
* insmNotification
*
* Author:
* Guo Yang
* Instoremedia AB
*/
//test

(function ($) {
	var methods = {
		init: function(options) {
			var $this = $(this);
			var _plugin = $this.data('insmDashboard2');
						
			if (!_plugin) {
				_plugin = {

					settings: $.extend({
						apiUrl: '',
						applicationName: 'Dashboard',
						version: manifest.version,
						header: true
					}, options),
					htmlElements: {
						header: $('<div />'),
						content: {
							container: $('<div />').addClass('module-wrapper'),
							header: {
								container: $('<div />').addClass('sub-header'),
								title: $('<h2 />'),
								backButton: $('<a />').text('Back').addClass('back')
							},
							views: {
								container: $('<div />').addClass('content'),
								categoryContainer: $('<div />'),
								playerlistContainer: $('<div />'),
								playerTabContainer: $('<div />'),
								playerTitle: $('<h2 />'),
								categoryList: $('<ul />').css('style', ''),
								playerListDiv: $('<div />'),
								pieChartMaterial: $('<canvas />').width(400).height(400),
								playerTabDiv: $('<div />').addClass('playertabs'),
								pieChart: true,
								pieChartDescription:$('<div />'),
								unavailableMessage: $('<h3 />').text('No player exist'),
								searchField:$('<div />'),

							}						 
						},
						popupLoading:$('<div />')
					},
					data: {
						categoryLookup: {},
						onSearch: function () { }
					},              
				};
				$this.data('insmDashboard2', _plugin);
			}
			return $this;
		},
		getCategories: function (options) {
			var $this = $(this);
			var _plugin = $this.data('insmDashboard2');
			_plugin.htmlElements.popupLoading.insmFullScreenLoading('popUp');
			$.insmFramework('regionTree', {
				includePlayers: true,
				success: function (regionTree) {
					var worker;
					if (typeof (worker) == "undefined") {
						worker = new Worker("js/insm/modules/dashboard2/insm.dashboardworker.js");
					}
					var sendData = {
						regionTree: regionTree,
						categories: _plugin.settings.categories
					}					
					worker.postMessage(JSON.stringify(sendData));
					worker.onmessage = function (event) {
						var receivedData = JSON.parse(event.data);

						_plugin.data.categoryLookup = receivedData.categoryLookup;
						$.each(_plugin.data.categoryLookup, function (categoryname, idArray) {
							$this.insmDashboard2('generateCategories', {
								categoryName: categoryname,
								categoryValue: idArray.affectedPlayerIds.length,
								categoryTotal: idArray.numberInRegions
							});
						});
						_plugin.htmlElements.popupLoading.insmFullScreenLoading('close');
						worker.terminate();
						worker = undefined;
					};
				}
			});

		},
		getTarget: function () {
			var $this = $(this);
			var _plugin = $this.data('insmDashboard2');
			
			if (_plugin.settings.target) {
				return _plugin.settings.target;
			} else {
				_plugin.settings.target = $('<div />');
			}
			return _plugin.settings.target;
		},
		preview: function (options) {
			var $this = $(this);
			var _plugin = $this.data('insmDashboard2');

			if (_plugin.settings.previewTarget) {
				return _plugin.settings.previewTarget;
			} else {
				_plugin.settings.previewTarget = $('<div />');
			}

			_plugin.settings.previewTarget.addClass('module module-preview dashboard2');
			_plugin.settings.previewTarget.click(function () {
				_plugin.settings.show();
			});
			_plugin.settings.previewTarget.html(
				$('<h2 />').text('Dashboard')
			);
			return _plugin.settings.previewTarget;
		},
		generateCategories: function (options) {
			var $this = $(this);
			var _plugin = $this.data('insmDashboard2');            
			$('<li />').addClass('categorycontent is-clickable').text(options.categoryName + ' (' + options.categoryValue + ')').appendTo(_plugin.htmlElements.content.views.categoryList).click(function () {
				_plugin.htmlElements.content.views.playerTitle.text(options.categoryName);
				_plugin.htmlElements.content.views.playerlistContainer.show(),
				_plugin.htmlElements.content.views.pieChartMaterial.show();
				_plugin.htmlElements.content.views.playerTabDiv.hide();
				_plugin.htmlElements.content.views.pieChartDescription.empty();

				try {
					_plugin.htmlElements.content.views.pieChart.destroy();
				}catch(err) {
				}
				if (options.categoryTotal == 'unavailable') {
					_plugin.htmlElements.content.views.unavailableMessage.show();
				} else {
					_plugin.htmlElements.content.views.pieChart = new Chart(_plugin.htmlElements.content.views.pieChartMaterial.get(0).getContext("2d")).Pie([
						{
							value: options.categoryValue,
							color: "#F7464A",
							highlight: "#FF5A5E",
							label: 'Affected by ' + options.categoryName
						}, {
							value: options.categoryTotal - options.categoryValue,
							color: "#46BFBD",
							highlight: "#5AD3D1",
							label: 'Not affected'
						}
					], {
						responsive: false,
						animation: false
					});
					var percentageAffected = (options.categoryValue / options.categoryTotal)*100;
					percentageAffected = percentageAffected.toFixed(2);
					_plugin.htmlElements.content.views.unavailableMessage.hide();
					_plugin.htmlElements.content.views.pieChartDescription.append(
						$('<ul />').append(
						   $('<li />').append($('<h3 />').text('Total players: '+options.categoryTotal)
						   ),
						   $('<li />').append($('<div />').insmStatusBox({
							   title: (100 - percentageAffected).toFixed(2) + "% ("+(options.categoryTotal-options.categoryValue) + "/" + options.categoryTotal+") of players not affected by " + options.categoryName,
							   status: "okpiechart",
							   tooltips:false
						   })),
						   $('<li />').append($('<div />').insmStatusBox({
							   title: percentageAffected + "% ("+ options.categoryValue + "/" + options.categoryTotal + ") of players affected by " + options.categoryName,
							   status: "errorpiechart",
							   tooltips:false
						   }))
						)						
					);
				}
				$this.insmDashboard2('generatePlayerList', {
					items: _plugin.data.categoryLookup[options.categoryName].affectedPlayerIds
				});
				$this.insmDashboard2('resize');
			});

		},
		generatePlayerList: function (options) {
			var $this = $(this);
			var _plugin = $this.data('insmDashboard2');
			var header = {
				Name: {
					weight: 1,
					name: 'Name',
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
				Region: {
					weight: 1,
					name: 'Region',
					sort: function (a, b) {
						var fullPatha = '';
						$.each(a.regionPath, function (index, path) {
							fullPatha += '/' + path.name
						});
						var fullPathb = '';
						$.each(b.regionPath, function (index, path) {
							fullPathb += '/' + path.name
						});
						if (fullPatha.toLowerCase() < fullPathb.toLowerCase()) {
							return -1;
						}
						else if (fullPatha.toLowerCase() > fullPathb.toLowerCase()) {
							return 1;
						}
						return 0;
					}

				},
				//TimeOffline: {
				//	weight: 1,
				//	name: 'Time offline',
				//	sort: function (a, b) {
				//		//if (a.modifiedBy.toLowerCase() < b.modifiedBy.toLowerCase()) {
				//		//	return -1;
				//		//}
				//		//else if (a.modifiedBy.toLowerCase() > b.modifiedBy.toLowerCase()) {
				//		//	return 1;
				//		//}
				//		//return 0;
				//	}
				//},
				States: {
					weight: 1,
					name: 'States',
					sort: function (a, b) {
						if (a.state.toLowerCase() < b.state.toLowerCase()) {
							return -1;
						}
						else if (a.state.toLowerCase() > b.state.toLowerCase()) {
							return 1;
						}
						return 0;
					}
				}				
			}
			var content = {			   
				output: function (item) {
					var fullPath='';
					$.each(item.regionPath, function (index, path) {
						fullPath+='/'+path.name
					});
					var stateRow = $('<div />').addClass('playerlistitem').append(
						$('<ul />').append(
						   $('<li />').text(item.name),
						   $('<li />').text(fullPath)
						),                                              
						$('<div />').addClass('screenshot').append(
							$.insmFramework('getScreenshot', {
								upid: item.upid
							})
						)						
					);
					stateRow.click(function () {
						
						_plugin.htmlElements.content.views.playerTabDiv.empty();
						_plugin.htmlElements.content.views.pieChartMaterial.hide();
						_plugin.htmlElements.content.views.playerTitle.text(item.name);
						_plugin.htmlElements.content.views.playerTabDiv.insmPlayerDetails2('destroy').insmPlayerDetails2({
							upid: item.upid,
							playerFullPath:fullPath
						}).show();
						$this.insmDashboard2('resize');
					});
					return stateRow;
				}			    		
			}
			_plugin.htmlElements.content.views.playerListDiv.insmSortableList('destroy').insmSortableList({
				headers: header,
				items: options.items,
				content:content,
				selectable: false,
				search: true,
				searchIndex: function (item) {                   
					var str = item.name;
					if (str) {
						return str.split(" ");
					} else {
						return [];
					}
				},			    
			});			
		},
		fullscreen: function(options) {
			var $this = $(this);
			var _plugin = $this.data('insmDashboard2');

			if (_plugin.data.fullscreenInitialized) {
				setTimeout(function() {
					$this.insmDashboard2('resize');
				}, 1);
				return $this;
			}
			_plugin.data.fullscreenInitialized = true;
			// Init HTML
			
			_plugin.settings.target.addClass('dashboard2').fadeIn();
			_plugin.settings.target.empty();

			if (_plugin.settings.header) {
				_plugin.settings.target.append(
					_plugin.htmlElements.header.addClass('header').append(
						$('<div />').addClass('company-logo'),
						$('<div />').addClass('module-logo')
					)
				);
			}
			_plugin.htmlElements.popupLoading.insmFullScreenLoading();
			$this.insmDashboard2('getCategories');
			_plugin.settings.target.append(
				_plugin.htmlElements.content.container.append(
					_plugin.htmlElements.content.views.container.append(                         
						_plugin.htmlElements.content.views.categoryContainer.addClass('categorycontainer').append(
							//_plugin.htmlElements.content.views.searchBar.insmSearchField({
							//	placeholderText: "search with all player",
							//	onSearch: function (searchstring) {
							//		_plugin.data.onSearch(searchstring);
							//	}
							//}),
							$('<h2 />').text('Category'),
							_plugin.htmlElements.content.views.categoryList.addClass('categorylist')
						),
						_plugin.htmlElements.content.views.playerlistContainer.addClass('playerlistcontainer').append(
							$('<h2 />').text('Players'),		
							_plugin.htmlElements.content.views.playerListDiv.addClass('playerlist')							
						).hide(),
						_plugin.htmlElements.content.views.playerTabContainer.addClass('playertabcontainer').append(
							_plugin.htmlElements.content.views.playerTitle,
							_plugin.htmlElements.content.views.playerTabDiv,
							_plugin.htmlElements.content.views.unavailableMessage.hide(),
							_plugin.htmlElements.content.views.pieChartDescription.addClass('description'),
							_plugin.htmlElements.content.views.pieChartMaterial.addClass('pie')							
						)																				   
					)
				)
			);            
		},
		
		resize: function() {
			var $this = $(this);
			var _plugin = $this.data('insmDashboard2');
			if (_plugin) {
				var totalHeight = _plugin.settings.target.height();
				var headerHeight = _plugin.htmlElements.header.outerHeight(true);

				var contentContainerHeight = parseInt(totalHeight - headerHeight);
				_plugin.htmlElements.content.container.css({
					height: contentContainerHeight + 'px'
				});

				var viewsContainerMargin = _plugin.htmlElements.content.views.container.outerHeight(true) - _plugin.htmlElements.content.views.container.height();

				_plugin.htmlElements.content.views.container.css({
					height: parseInt(contentContainerHeight - viewsContainerMargin) + 'px'
				});

				if (_plugin.htmlElements.content.views.container.width() == 1358) {
					_plugin.htmlElements.content.views.container.css({
						height: parseInt(_plugin.htmlElements.content.views.container.height() - 18) + 'px'
					});
				}
				_plugin.htmlElements.content.views.categoryList.css({
					height: parseInt(_plugin.htmlElements.content.views.container.height() - 16 - 8 - 32) + 'px'
				});
				_plugin.htmlElements.content.views.playerListDiv.children('ul').css({
					height: parseInt(_plugin.htmlElements.content.views.container.height() - 16 - 8 - 32 - 62 - 61) + 'px'
				});
				_plugin.htmlElements.content.views.playerTabDiv.find('.insm-tabs-content').css({
					height: parseInt(_plugin.htmlElements.content.views.container.height() - 16 - 8 - 32 - 32 - 16 - 5) + 'px'
				});
				
				//var height = parseInt(contentContainerHeight - viewsContainerMargin - textHeight - inputContainerMargin - _plugin.htmlElements.content.views.playerId.input.id.outerHeight(true) - _plugin.htmlElements.content.views.playerId.input.unconfiguredListTitle.outerHeight(true));

				//if (height < 50) {
				//    height = 50
				//}
			}

			return $this;
		},
		hasSettings: function () {
			return false;
		},

		onClose: function (options) {
			options.success();
		},
		destroy: function () {
			var $this = $(this);
			var _plugin = $this.data('insmDashboard2');
			//$this.insmDashboard2('stopSubscriptions');
			$this.data('insmDashboard2', null).empty();

			return $this;
		},
	   
	   
	};

	$.fn.insmDashboard2 = function (method) {
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error('Method ' + method + ' does not exist on $.insmDashboard2');
		}
	};

})(jQuery);