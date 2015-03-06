/*
* INSM Task Execution
* This file contain the INSM Task Execution function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmTaskExecution(settings);
*
* File dependencies:
* jQuery 1.8.2
* jQuery UI 1.8.23
* insmNotification
*
* Authors:
* Tobias Rahm - Instoremedia AB
* Koji Wakayama - Creuna AB
*/

(function ($) {
    function parseNodes(node, players) {
        if (node) {
            var children = [];
            $.each(node.Regions, function (index, child) {
                children.push(parseNodes(child, players));
            });
            $.each(node.Players, function (index, child) {
                var player = {
                    _class: 'player ' + child.State,
                    name: child.Name,
                    id: child.UPId,
                    description: child.Description,
                    datasetId: child.DatasetId,
                    state: child.State,
                    type: 'player',
                    version: child.Version
                };
                children.push(player);
                players[player.id] = player
            });

            children.sort(function (a, b) {
                var nameA = a.name.toLowerCase(), nameB = b.name.toLowerCase();
                if (nameA < nameB)
                    return -1;
                if (nameA > nameB)
                    return 1;
                return 0;
            });

            return {
                _class: 'region ' + node.State,
                name: node.Name,
                id: node.Id,
                description: node.Description,
                datasetId: node.DatasetId,
                state: node.State,
                children: children,
                type: 'region'
            };
        }
        return null;
    }

    var methods = {
        init: function (options) {
            // Global vars
            var $this = $(this);
            var _plugin = $this.data('insmTaskExecution');
            // If the plugin hasn't been initialized yet

            _plugin = {
                htmlElements: {
                    taskExecution: $('<div />').addClass('taskExecution'),
                    searchField: $('<div />').addClass('searchField'),
                    regionTree: $('<ul />').addClass('regionTree'),
                    breadcrumbs: $('<div/>').addClass('breadcrumbs'),
                    inheritInfo: $('<div />').addClass('inheritInfo'),
                    taskDetails: null,
                    column: {
                        left: $('<div />').addClass('column'),
                        center: $('<div />').addClass('column column-regiontree'),
                        right: $('<div />').addClass('column column-players')
                    }
                },
                data: {
                    tabs: options.tabs,
                    currentTask: null,
                    selectedPlayerNodes: [],
                    players: {}
                },
                settings: $.extend({
                    regionId: 1,
                    contentDirectoryName: 'Tasks',
                    applicationName: 'Task Execution',
                    enableAccessCheck: false,
                    ssl: false,
                    ams: '',
                    version: manifest.version
                }, options)
            };
            $this.data('insmTaskExecution', _plugin);

            var frameworkNotificationHandle = $.insmNotification({
                type: 'load',
                text: 'Initializing Instoremedia',
                duration: 0
            });


            if (!$.insmFramework('isInitialized')) {
                $.insmFramework({
                    ams: _plugin.settings.ams,
                    app: _plugin.settings.applicationName,
                    version: _plugin.settings.version,
                    protocol: (_plugin.settings.ssl ? 'https' : 'http'),
                    session: (urlDecode($(document).getUrlParam('session')) || '')
                });
            }


            $.when($.insmFramework('initialized')).done(function () {
                $this.insmTaskExecution('initUserAccessLevel').done(function (level) {
                    _plugin.data.accessLevel = level;
                    if (_plugin.data.accessLevel == "Deny") {
                        $.insmPopup({
                            backdropTransparency: false,
                            content: $('<div />').text('Permission denied'),
                            autoOpen: true,
                            showCloseButton: false,
                            backdropClickClose: false
                        });
                        return;
                    }
                    frameworkNotificationHandle.update({
                        type: 'successful',
                        text: 'Initializing Instoremedia successful'
                    });

                    // Init HTML
                    $this.append(
                        _plugin.htmlElements.taskExecution.append(
                            _plugin.htmlElements.column.left,
                            _plugin.htmlElements.column.center.append(
                                _plugin.htmlElements.column.center.append($('<h2/>', { text: "Select Region" })),
                                _plugin.htmlElements.searchField,
                                _plugin.htmlElements.regionTree
                            ),
                            _plugin.htmlElements.column.right
                        ).addClass('nowrap')
                    );
                    $this.insmTaskExecution('displayTaskList').done(function () {
                        $this.insmTaskExecution('displayRegionTree');
                    })

                });
            });
            return $this;
        },
        initUserAccessLevel: function () {
            var $this = $(this);
            var _plugin = $this.data('insmTaskExecution');
            var def = $.Deferred();

            $.insmAccess({
                enableModuleAccessRestriction: _plugin.settings.enableAccessCheck
            });

            $.insmAccess('getModuleAccess', {
                module: _plugin.settings.applicationName.toLowerCase(),
                success: function (data) {
                    var user = $.insmFramework('user');
                    if (user.Admin) {
                        _plugin.settings.accesslevel = "Write";
                        def.resolveWith(this, ['Write']);
                    } else {
                        _plugin.settings.accesslevel = data.AccessLevel;
                        def.resolveWith(this, [data.AccessLevel]);
                    }
                },
                error: function (message) {
                    throw new Error(message);
                },
                denied: function () {
                    alert("denied!");
                    $.insmFramework('login', {
                        success: function () {
                            $this.insmTaskExecution('initUserAccessLevel').done(function (data) {
                                def.resolveWith(this, [data]);
                            });
                        }
                    });
                }
            });
            return def;
        },
        displayTaskList: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmTaskExecution');

            _plugin.htmlElements.column.left.empty();

            var headContainer = $('<div/>').css({ "display": "table", "width": "100%" });
            if (_plugin.data.accessLevel == "Write") {
                $('<a />').addClass('button pull-right').text('New Task').click(function () {
                    _plugin.htmlElements.taskDetails = null;
                    $this.insmTaskExecution('displayTaskDetails', {
                        task: {
                            Name: '',
                            Description: '',
                            IntervalStart: '',
                            IntervalEnd: '',
                            DailyIntervalStart: '00:00',
                            DailyIntervalEnd: '24:00',
                            MaxRetries: 3,
                            File: {
                                Name: ''
                            }
                        }
                    });
                }).appendTo(headContainer);
            }
            headContainer.append($('<h2/>', { text: "Select Task", class: 'pull-left' }));

            var def = $.Deferred();

            // Filter players
            $.insmFramework('getMaintenanceTasks', {
                success: function (tasks) {
                    def.resolve();
                    _plugin.htmlElements.column.left.append(headContainer);
                    $.each(tasks, function (taskId, task) {
                        var taskContainer = $('<a/>', {
                            class: "taskContainer"
                        });
                        if (_plugin.data.accessLevel == "Write") {
                            taskContainer.append($this.insmTaskExecution('getTaskRemoveButton', { id: task.Id }));
                        }
                        taskContainer.append(task.Name);
                        _plugin.htmlElements.column.left.append(taskContainer.click(function (event) {
                            $this.insmTaskExecution('displayTaskDetails', { task: task });
                            return false;
                        }));
                    });
                },
                denied: function (data) {
                    $.insmFramework('login', {
                        success: function () {
                            def.resolve();
                            $this.insmTaskExecution('displayTaskList');
                        }
                    });
                },
                error: function (message) {
                    def.reject();
                    $.insmNotification({
                        type: 'error',
                        text: message
                    });
                }
            });
            return def;
        },
        getTaskRemoveButton: function (options) {
            $this = $(this);
            var _plugin = $this.data('insmTaskExecution');
            var task = $('<a />', {
                class: "button pull-right disabled",
                text: "Remove"
            })
            if (_plugin.data.accessLevel == "Write") {
                task.removeClass("disabled");
                task.click(function () {
                    if (!confirm("Are you sure you want to remove this task?")) {
                        return false;
                    }
                    var not = $.insmNotification({
                        text: 'Removing task',
                        type: 'load',
                        duration: 0
                    });
                    $.insmFramework('removeMaintenanceTask', {
                        id: options.id,
                        success: function () {
                            $this.insmTaskExecution('displayTaskList');
                            not.update({
                                text: 'Task removed',
                                type: 'successful'
                            });
                        },
                        error: function (message) {
                            not.update({
                                text: message,
                                type: 'error'
                            });
                        },
                        denied: function (data) {
                            not.update({
                                text: 'Denied',
                                type: 'error'
                            });
                            $.insmFramework('login', {
                                success: function () {
                                    def.resolve();
                                    $this.insmTaskExecution('displayTaskList');
                                }
                            });
                        }
                    });
                    return false;
                });
            }
            return task;
        },
        displayTaskDetails: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmTaskExecution');
            _plugin.htmlElements.column.left.empty();

            _plugin.data.currentTask = options.task;

            $('<a />').addClass('button pull-right').text('Back').click(function () {
                _plugin.htmlElements.taskDetails = null;
                $this.insmTaskExecution('displayTaskList');
            }).appendTo(_plugin.htmlElements.column.left);
            if (options.task.Id) {
                $('<a />').addClass('button pull-right').text('Refresh').click(function () {
                    $.insmFramework('getMaintenanceTasks', {
                        success: function (tasks) {
                            $this.insmTaskExecution('displayTaskDetails', { task: options.task });
                        },
                        denied: function (data) {
                            $.insmFramework('login', {
                                success: function () {
                                    $this.insmTaskExecution('displayTaskList');
                                }
                            });
                        },
                        error: function (message) {
                            def.reject();
                            $.insmNotification({
                                type: 'error',
                                text: message
                            });
                        }
                    });
                }).appendTo(_plugin.htmlElements.column.left);
            }
            if (_plugin.data.accessLevel == "Write" && options.task.Id) {
                _plugin.htmlElements.column.left.append($this.insmTaskExecution('getTaskRemoveButton', { id: options.task.Id }));
            }
            var state = typeof options.task.Id === 'undefined' && typeof options.task.Id !== 'number' ? 'edit' : 'view';

            if (state === 'edit') {
                if (_plugin.data.accessLevel == "Write") {
                    // Add Save Button
                    $('<a />').addClass('button pull-right').text('Save').click(function () {
                        if (_plugin.htmlElements.taskDetails.insmInput('validate') === false) {
                            $.insmNotification({
                                type: 'error',
                                text: 'Validation failed'
                            });
                        } else {
                            var taskExecutionHandle = $.insmNotification({
                                type: 'load',
                                text: 'Saving Task'
                            });

                            var selectedTaskDetails = _plugin.htmlElements.taskDetails.insmInput('getValue');
                            var notUpdate = $.insmNotification({
                                text: 'Updating maintenance task',
                                type: 'load',
                                duration: 0
                            });

                            $.insmFramework('updateMaintenanceTask', {
                                name: selectedTaskDetails.name,
                                fileId: selectedTaskDetails.file,
                                description: selectedTaskDetails.description,
                                rebootWhenFinished: selectedTaskDetails['reboot when finished'],
                                intervalStart: selectedTaskDetails.dateinterval.start,
                                intervalEnd: selectedTaskDetails.dateinterval.end,
                                dailyIntervalStart: selectedTaskDetails.timeinterval.start,
                                dailyIntervalEnd: selectedTaskDetails.timeinterval.end == "24:00" ? "23:59" : selectedTaskDetails.timeinterval.end,
                                maxRetries: selectedTaskDetails['max retries'],
                                success: function (data) {
                                    notUpdate.update({
                                        text: 'Success',
                                        type: 'successful'
                                    });
                                    $this.insmTaskExecution('displayTaskList');
                                },
                                denied: function (data) {
                                    notUpdate.update({
                                        text: 'Denied',
                                        type: 'error'
                                    });
                                    $.insmFramework('login', {
                                        success: function () {
                                            $this.insmTaskExecution(_plugin.settings);
                                        }
                                    });
                                },
                                error: function (message) {
                                    notUpdate.update({
                                        text: message,
                                        type: 'error'
                                    });
                                }
                            });
                        }
                    }).appendTo(_plugin.htmlElements.column.left);
                }
            }

            _plugin.htmlElements.column.left.append($('<h2/>', { text: 'Task Details', class: 'pull-left' }));

            _plugin.htmlElements.taskDetails = $('<div/>', { class: 'taskDetails' }).insmInput({
                type: "table",
                multiSelect: false,
                required: false,
                currentValue: {
                    "name": options.task.Name,
                    "description": options.task.Description,
                    "file": options.task.File.Name,
                    "dateinterval": {start: options.task.IntervalStart, end: options.task.IntervalEnd},
                    "timeinterval": { start: options.task.DailyIntervalStart, end: options.task.DailyIntervalEnd == "23:59" ? "24:00" : options.task.DailyIntervalEnd},
                    "reboot when finished": options.task.RebootWhenFinished,
                    "max retries": options.task.MaxRetries
                },
                initObject: {
                    "name": {
                        type: "String",
                        currentValue: '',
                        pretty: "Name"
                    },
                    "description": {
                        type: "String",
                        currentValue: '',
                        pretty: "Description",
                        required: false
                    },
                    "file": {
                        type: "File",
                        currentValue: '',
                        framework: _plugin.settings.framework,
                        regionId: _plugin.settings.regionId,
                        mediaContentDirectoryName: _plugin.settings.contentDirectoryName,
                        pretty: "File"
                    },
                    "dateinterval": {
                        css: 'interval',
                        type: "dateinterval",
                        currentValue: '',
                        pretty: "Execution interval"
                    },
                    "timeinterval": {
                        css: 'interval',
                        type: "timeinterval",
                        currentValue: '',
                        pretty: "Daily interval"
                    },
                    "reboot when finished": {
                        type: "boolean",
                        currentValue: true,
                        pretty: "Reboot when finished"
                    },
                    'max retries': {
                        type: "Integer",
                        currentValue: 1,
                        range: { min: 1, max: 10 },
                        pretty: "Maximum retries"
                    }
                }
            }).insmInput(state);

            _plugin.htmlElements.column.left.append(_plugin.htmlElements.taskDetails);

            if (state === 'view') {
                $('<a />').addClass('button').text('Assign to selected players').addClass("pull-right").click(function (event) {
                    if ($.type(_plugin.htmlElements.taskDetails) === "null") {
                        $.insmNotification({
                            type: 'error',
                            text: 'Select Task before executing'
                        });
                    } else if (_plugin.data.selectedPlayerNodes.length == 0) {
                        $.insmNotification({
                            type: 'error',
                            text: 'Player needs to be selected for assignment.'
                        });
                    } else {

                        if ("Id" in _plugin.data.currentTask === false && _plugin.htmlElements.taskDetails.insmInput('validate') === false) {
                            $.insmNotification({
                                type: 'error',
                                text: 'Validation failed'
                            });
                        } else {
                            function sendTaskExecutions(id) {

                                var taskId = id;

                                // Parse players and collect ids
                                var playerIds = [];
                                $.each(_plugin.data.selectedPlayerNodes, function (key, value) {
                                    playerIds.push(value.id);
                                });

                                var not = $.insmNotification({
                                    text: 'Assigning players to maintenance task',
                                    type: 'load',
                                    duration: 0
                                });

                                $.insmFramework('assignPlayersToMaintenanceTask', {
                                    id: taskId,
                                    playerIds: playerIds,
                                    success: function (data) {
                                        not.update({
                                            type: 'successful',
                                            text: 'Sending task executions successful'
                                        });
                                        // Refresh
                                        $this.insmTaskExecution('displayTaskDetails', {
                                            task: _plugin.data.currentTask
                                        });
                                    },
                                    denied: function (data) {
                                        not.update({
                                            text: 'Denied',
                                            type: 'error'
                                        });
                                        $.insmFramework('login', {
                                            success: function () {
                                                $this.insmTaskExecution(_plugin.settings);
                                            }
                                        });
                                    },
                                    error: function (message) {
                                        not.update({
                                            text: message,
                                            type: 'error'
                                        });
                                    }
                                });

                            }

                            if ("Id" in _plugin.data.currentTask === false) {
                                saveTask();
                            } else {
                                sendTaskExecutions(_plugin.data.currentTask.Id);
                            }

                            function saveTask() {
                                if (_plugin.htmlElements.taskDetails.insmInput('validate') === false) {

                                    $.insmNotification({
                                        type: 'error',
                                        text: 'Validation failed'
                                    });

                                } else {

                                    var not = $.insmNotification({
                                        type: 'load',
                                        text: 'Saving maintenance task',
                                        duration: 0
                                    });

                                    var selectedTaskDetails = _plugin.htmlElements.taskDetails.insmInput('getValue');

                                    $.insmFramework('updateMaintenanceTask', {
                                        name: selectedTaskDetails.name,
                                        fileId: selectedTaskDetails.file,
                                        description: selectedTaskDetails.description,
                                        rebootWhenFinished: selectedTaskDetails.rebootWhenFinished,
                                        intervalStart: selectedTaskDetails.dateinterval.start,
                                        intervalEnd: selectedTaskDetails.dateinterval.end,
                                        dailyIntervalStart: selectedTaskDetails.timeinterval.start,
                                        dailyIntervalEnd: selectedTaskDetails.timeinterval.end == "24:00" ? "23:59" : selectedTaskDetails.timeinterval.end,
                                        maxRetries: selectedTaskDetails['max retries'],
                                        success: function (data) {
                                            not.update({
                                                text: "Updated maintenance task",
                                                type: 'successful'
                                            });
                                            sendTaskExecutions(data.Id);
                                        },
                                        denied: function (data) {
                                            not.update({
                                                text: "Denied",
                                                type: 'error'
                                            });
                                            $.insmFramework('login', {
                                                success: function () {
                                                    $this.insmTaskExecution(_plugin.settings);
                                                }
                                            });
                                        },
                                        error: function (message) {
                                            not.update({
                                                text: message,
                                                type: 'error'
                                            });
                                        }
                                    });
                                }
                            }
                        }
                    }
                }).appendTo(_plugin.htmlElements.column.left);

                var not = $.insmNotification({
                    type: 'load',
                    text: 'Getting maintenance task',
                    duration: 0
                });

                //Show Task Execution Details
                $.insmFramework('getMaintenanceTaskExecutions', {
                    id: _plugin.data.currentTask.Id,
                    success: function (data) {
                        not.update({
                            type: 'successful',
                            text: 'Maintenance task loaded'
                        });
                        _plugin.htmlElements.column.left.append($("<h2/>", { text: 'Assigned Players' }));

                        var assignedPlayersContainer = $("<div/>");

                        _plugin.htmlElements.column.left.append(assignedPlayersContainer);
                        _plugin.data.taskExecList = [];
                        $.each(data, function (taskid, task) {
                            tableTask = task
                            tableTask.name = _plugin.data.players[task.UPId].name;
                            tableTask.status = task.Status;
                            _plugin.data.taskExecList.push(tableTask);
                        });

                        assignedPlayersContainer.html($('<div style="width: 650px" />').insmTablesorter({
                            data: _plugin.data.taskExecList,
                            offset: 0,
                            limit: 10,
                            paginationPosition: 'top',
                            searchPosition: 'top',
                            limitControlPosition: 'top',
                            headers: {
                                'Player': {
                                    weight: 3,
                                    type: 'string',
                                    search: function (searchObject) {
                                        return searchObject.item.name.toLowerCase().indexOf(searchObject.searchString.toLowerCase()) !== -1;
                                    },
                                    sort: function (a, b) {
                                        return a.name.localeCompare(b.name);
                                    },
                                    output: function (task) {
                                        return $('<a class="button" >' + task.name + '</a>').click(function () {
                                            // Show player detail
                                            $this.insmTaskExecution('displayPlayerDetails', {
                                                player: {
                                                    UPId: task.UPId
                                                }
                                            });
                                        });

                                    }
                                },
                             
                                'Task details': {
                                    type: 'string',
                                    output: function (task) {
                                        var taskDetailsButton = $('<a class="button" > Details </a>');
                                        var taskDetail = $('<div style="background-color: white" key ="' + task.UPId + '" />').insmInput({
                                            type: 'table',
                                            multiSelect: false,
                                            required: false,
                                            currentValue: {
                                                "UPId": task.UPId,
                                                "Status": task.Status,
                                                "Type": task.Type,
                                                "UsedRetries": task.UsedRetries,
                                                "TaskId": task.TaskId
                                            },
                                            initObject: {
                                                "UPId": {
                                                    type: "String",
                                                    currentValue: '',
                                                    pretty: "Unique player ID"
                                                },
                                                "Status": {
                                                    type: "String",
                                                    currentValue: ''
                                                },
                                                "Type": {
                                                    type: "String",
                                                    currentValue: ''
                                                },
                                                "UsedRetries": {
                                                    type: "String",
                                                    currentValue: '',
                                                    pretty: "Used retries"
                                                },
                                                "TaskId": {
                                                    type: "String",
                                                    currentValue: '',
                                                    pretty: "Task ID"
                                                },
                                            }
                                        }).insmInput('view');
                                        taskDetailsButton.click(function () {
                                            $.insmPopup({
                                                content: taskDetail,
                                                autoOpen: true
                                            });
                                        });
                                        return taskDetailsButton
                                    }
                                },
                                'Execution events': {
                                    type: 'string',
                                    output: function (task) {
                                        var execEventButton = $('<a class="button" > Events </a>');

                                        var execEvents = $('<div style="background-color: white; padding: 10px;"><h2> Execution Events </h2></div>');
                                        var execEventsContainer = $('<div> Loading </div>').appendTo(execEvents);

                                        execEventButton.click(function () {
                                            var not = $.insmNotification({
                                                text: 'Getting maintenance task events',
                                                type: 'load',
                                                duration: 0
                                            });
                                            $.insmFramework('getMaintenanceTasks', {
                                                Method: 'GetExecutionEvents',
                                                Id: task.Id,
                                                success: function (events) {
                                                    not.update({
                                                        text: 'Got events',
                                                        type: 'successful',
                                                        duration: -1
                                                    });

                                                    var tableData = [];
                                                    $.each(events, function(id, event) {
                                                        tableData.push({
                                                            event: event.Name,
                                                            executed: printDate(event.EventDate, 'Y-m-d H:i:s'),
                                                            reported: printDate(event.ReportDate, 'Y-m-d H:i:s'),
                                                            details: event.Description,
                                                            status: event.Status,
                                                            resultCode: event.ResultCode,
                                                            log: event.TextLog,
                                                            stdOut: event.StdOutLog,
                                                            stdErr: event.StdErrLog
                                                        });
                                                    });

                                                    var $table = $('<div>').insmTablesorter({
                                                        headers: {
                                                            Event: {
                                                                attr: 'event'
                                                            },
                                                            Status: {
                                                                attr: 'status'
                                                            },
                                                            Executed: {
                                                                attr: 'executed'
                                                            },
                                                            Reported: {
                                                                attr: 'reported'
                                                            },
                                                            Details: {
                                                                attr: 'details'
                                                            },
                                                            Code: {
                                                                attr: 'code'
                                                            },
                                                            'Result Code': {
                                                                attr: 'resultCode'
                                                            },
                                                            Log: {
                                                                attr: 'log'
                                                            },
                                                            StdOut: {
                                                                attr: 'stdOut'
                                                            },
                                                            stdErr: {
                                                                attr: 'stdErr'
                                                            }
                                                        },
                                                        data: tableData
                                                    });

                                                    var headings = false;
                                                    execEventsContainer.empty().append();

                                                    if ($.isEmptyObject(data)) {
                                                        execEventsContainer.text("No execution events found.");
                                                        return false;
                                                    }
                                                    else {
                                                        execEventsContainer.html($table);
                                                    }

                                                    setTimeout(function () {
                                                        $.insmPopup('resize');
                                                    }, 100);
                                                    setTimeout(function () {
                                                        $.insmPopup('resize');
                                                    }, 200);
                                                    setTimeout(function () {
                                                        $.insmPopup('resize');
                                                    }, 300);
                                                    setTimeout(function () {
                                                        $.insmPopup('resize');
                                                    }, 400);
                                                    setTimeout(function () {
                                                        $.insmPopup('resize');
                                                    }, 500);
                                                    setTimeout(function () {
                                                        $.insmPopup('resize');
                                                    }, 700);
                                                    setTimeout(function () {
                                                        $.insmPopup('resize');
                                                    }, 1000);
                                                    setTimeout(function () {
                                                        $.insmPopup('resize');
                                                    }, 2000);

                                                    return false;
                                                },
                                                error: function (message) {
                                                    not.update({
                                                        text: message,
                                                        type: 'error'
                                                    });
                                                },
                                                denied: function () {
                                                    not.update({
                                                        text: 'Denied',
                                                        type: 'error'
                                                    });
                                                    $.insmFramework('login', {
                                                        success: function () {
                                                            $this.insmTaskExecution(_plugin.settings);
                                                        }
                                                    });
                                                },
                                            });
                                            $.insmPopup({
                                                content: execEvents,
                                                autoOpen: true
                                            });
                                            $.insmPopup('resize');
                                        });
                                        return execEventButton
                                    }
                                },
                                Status: {
                                    type: 'string',
                                    attr: 'status'
                                },
                                'Unassign player': {
                                    type: 'string',
                                    output: function (task) {
                                        var unassignButton = $('<a/>', {
                                            text: 'Unassign Player',
                                            class: 'button disabled'
                                        })
                                        if(_plugin.data.accessLevel == "Write"){
                                            unassignButton.removeClass('disabled').click(function () {
                                                $(this).addClass('disabled').text('please wait');
                                                $.insmFramework('unassignPlayersFromMaintenanceTask', {
                                                    id: _plugin.data.currentTask.Id,
                                                    playerIds: task.UPId,
                                                    success: function (data) {
                                                        // Refresh
                                                        $this.insmTaskExecution('displayTaskDetails', {
                                                            task: _plugin.data.currentTask
                                                        });
                                                    },
                                                    denied: function (data) {
                                                        $.insmFramework('login', {
                                                            success: function () {
                                                                $this.insmTaskExecution('displayTaskDetails', {
                                                                    task: _plugin.data.currentTask
                                                                });
                                                            }
                                                        });
                                                    },
                                                    error: function (message) {
                                                        $.insmNotification({
                                                            text: message,
                                                            type: 'error'
                                                        });
                                                    }
                                                });
                                            });
                                        }
                                        return unassignButton;
                                    }
                                }
                            }
                        }));
                    },
                    denied: function (data) {
                        not.update({
                            text: "Denied",
                            type: 'error'
                        });
                        $.insmFramework('login', {
                            success: function () {
                                $this.insmTaskExecution(_plugin.settings);
                            }
                        });
                    },
                    error: function (message) {
                        not.update({
                            text: message,
                            type: 'error'
                        });
                    }
                });
            }


        },
        displayRegionTree: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmTaskExecution');

            _plugin.htmlElements.searchField.insmSearchField({
                onSearch: function (searchstring) {
                    if (searchstring) {
                        _plugin.htmlElements.regionTree.insmListTree('deselectAllNodes');
                        var selectedNodeId;
                        $.each(_plugin.htmlElements.regionTree.insmListTree('getAllNodes'), function (index, node) {
                            if (node.name.toLowerCase().indexOf(searchstring.toLowerCase()) >= 0) {
                                selectedNodeId = index;
                                _plugin.htmlElements.regionTree
                                    .insmListTree('expandNode', {
                                        nodeId: index
                                    })
                                    .insmListTree('selectNode', {
                                        nodeId: index
                                    });
                            }
                        });

                        var selectedNodes = _plugin.htmlElements.regionTree.insmListTree('getSelected');
                        $this.insmTaskExecution('displayPlayerList', {
                            selectedNodes: selectedNodes
                        });
                        //$this.insmTaskExecution('displayTaskList');
                    }
                },
                onClear: function () {
                    _plugin.htmlElements.searchField.insmSearchField('clearSearchField');
                    _plugin.htmlElements.regionTree.insmListTree('unmarkNodes');
                }
            }).addClass('searchfield');
            var not = $.insmNotification({
                text: 'Getting region tree',
                type: 'load',
                duration: 0
            });
            $.insmFramework('regionTree', {
                regionId: _plugin.settings.regionId,
                includePlayers: true,
                success: function (regionTree) {
                    not.update({
                        text: 'Region tree downloaded',
                        type: 'successful'
                    });
                    var tree = parseNodes(regionTree, _plugin.data.players);
                    tree.root = true;
                    _plugin.htmlElements.regionTree.insmListTree({
                        tree: tree,
                        clickable: true,
                        selectable: true,
                        recursive: true,
                        lazyload: false,
                        onSelectedNodesChange: function () {
                            var selectedNodes = _plugin.htmlElements.regionTree.insmListTree('getSelected');
                            $this.insmTaskExecution('displayPlayerList', {
                                selectedNodes: selectedNodes
                            });
                            //$this.insmTaskExecution('displayTaskList');
                        },
                        onClick: function (event) {
                            if (event.type === "player") {
                                // Show player detail
                                $this.insmTaskExecution('displayPlayerDetails', {
                                    player: {
                                        UPId: event.id,
                                        name: event.name,
                                        state: event.state,
                                        version: event.version
                                    }
                                });
                            }
                        }
                    });
                },
                denied: function (data) {
                    not.update({
                        text: 'Denied',
                        type: 'error'
                    });
                    $.insmFramework('login', {
                        success: function () {
                            $this.insmTaskExecution('displayRegionTree');
                        }
                    });
                },
                error: function (message) {
                    not.update({
                        text: message,
                        type: 'error'
                    });
                }
            });

            return $this;
        },
        displayPlayerList: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmTaskExecution');
            _plugin.htmlElements.column.right.empty();

            // Filter players
            var selectedNodes = _plugin.htmlElements.regionTree.insmListTree('getSelected');
            _plugin.data.selectedPlayerNodes = [];
            $.each(selectedNodes, function (id, node) {
                if (node.type === "player") {
                    _plugin.data.selectedPlayerNodes.push(node);
                }
            });
            var selectedPlayerNodesCount = _plugin.data.selectedPlayerNodes.length;

            var allNodes = _plugin.htmlElements.regionTree.insmListTree('getAllNodes');
            var allPlayerNodes = [];
            $.each(allNodes, function (id, node) {
                if (node.type === "player") {
                    allPlayerNodes.push(node);
                }
            });
            var allPlayerNodesCount = allPlayerNodes.length;

            // Display
            _plugin.htmlElements.column.right.append($('<h2/>', { text: "Players" }));

            var myTable = $('<table/>', {
                class: 'versionSummary horizontal'
            });

            myTable.append(
                $("<tr/>").append(
                    $("<th/>").text('Total Players'),
                    $("<th/>").text('Selected Players')
                ),
                $("<tr/>").append(
                    $("<td/>").text(allPlayerNodesCount),
                    $("<td/>").text(selectedPlayerNodesCount)
                )
            );
            _plugin.htmlElements.column.right.append(myTable);

            var playerVersions = {};
            $.each(_plugin.data.selectedPlayerNodes, function (index, value) {
                var version = value.version;
                if (playerVersions.hasOwnProperty(version)) {
                    playerVersions[version] = playerVersions[version] + 1;
                } else {
                    playerVersions[version] = 1;
                }
            });

            _plugin.htmlElements.column.right.append($('<h3/>', { text: 'Version Summary' }));

            var myTable2 = $('<table/>', {
                class: 'versionSummary horizontal'
            });

            myTable2.append(
                $("<tr/>").append(
                    $("<th/>").text('Version'),
                    $("<th/>").text('Count')
                )
            );

            $.each(playerVersions, function (key, value) {
                myTable2.append(
                    $("<tr/>").append(
                        $("<td/>").text(key),
                        $("<td/>").text(value)
                    )
                );
            });
            _plugin.htmlElements.column.right.append(myTable2);
        },
        displayPlayerDetails: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmTaskExecution');
            _plugin.htmlElements.column.right.empty();

            var playerDetails = $('<div/>').insmPlayerDetails({
                framework: $.insmFramework('getDeprecatedFramework'),
                upid: options.player.UPId
            }).css('clear', 'both');

            var playerData = $('<div />').text('feaf');

            _plugin.htmlElements.column.right.append($('<h2/>', { text: 'Player Details', class: 'pull-left' }));

            $('<a />').addClass('button pull-right').text('Back').click(function () {
                $this.insmTaskExecution('displayPlayerList');
            }).appendTo(_plugin.htmlElements.column.right);

            _plugin.htmlElements.column.right.append(playerDetails);
        }
    };

    $.fn.insmTaskExecution = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmTaskExecution');
        }
    };
})(jQuery);