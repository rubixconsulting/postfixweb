Ext.namespace('RubixConsulting');

// TODO get rid of disable/enable pages for grid operations
RubixConsulting.user = function() {
	// private variables
	var loginWindow, user, viewport, west, center, infoPanel;
	var domainGrid, addUserWindow, resetPasswordWindow;
	var removeDomainBtn, domainPermMask, userGrid, siteAdminGrid;
	var addUserBtn, removeUserBtn, saveUserBtn, revertUserBtn, resetPassBtn;
	var addUserUsername, addUserDomain, addDomainBtn, addDomainDomain;
	var resetPassPassword, userMask, addDomainWindow, saveSiteAdminBtn;
	var domainPermCombo, saveDomainPermBtn, domainPermGrid;
	var localAliasGrid, addLocalAliasBtn, removeLocalAliasBtn;
	var revertLocalAliasesBtn, saveLocalAliasesBtn, addLocalAliasWindow;
	var addLocalAliasName, addLocalAliasDestination, bulkAddLocalAliasBtn;
	var bulkAddLocalAliasWindow, localAliasMask, revertSiteAdminBtn;
	var domainListMask;

	var domainSm     = new Ext.grid.CheckboxSelectionModel();
	var userSm       = new Ext.grid.CheckboxSelectionModel();
	var siteAdminSm  = new Ext.grid.CheckboxSelectionModel();
	var localAliasSm = new Ext.grid.CheckboxSelectionModel();

	var domainsLoaded      = false;
	var usersLoaded        = false;
	var domainPermsLoaded  = false;
	var siteAdminLoaded    = false;
	var localAliasesLoaded = false;

	var removedUsers        = new Array();
	var removedLocalAliases = new Array();

	var domainRecord = Ext.data.Record.create([
		{name: 'domain_id', type: 'int'},
		{name: 'domain',    type: 'string'}
	]);

	var userRecord = Ext.data.Record.create([
		{name: 'user_id',  type: 'int'},
		{name: 'username', type: 'string'},
		{name: 'domain',   type: 'string'},
		{name: 'email',    type: 'string'},
		{name: 'name',     type: 'string'},
		{name: 'role_id',  type: 'int'},
		{name: 'name',     type: 'string'},
		{name: 'active',   type: 'boolean'}
	]);

	var domainPermRecord = Ext.data.Record.create([
		{name: 'user_id', type: 'int'},
		{name: 'email',   type: 'string'},
		{name: 'admin',   type: 'boolean'}
	]);

	var siteAdminRecord = Ext.data.Record.create([
		{name: 'user_id',    type: 'int'},
		{name: 'email',      type: 'string'},
		{name: 'site_admin', type: 'boolean'}
	]);

	var localAliasRecord = Ext.data.Record.create([
		{name: 'alias_id',    type: 'int'},
		{name: 'name',        type: 'string'},
		{name: 'destination', type: 'string'},
		{name: 'active',      type: 'boolean'}
	]);

	var siteAdminStore = new Ext.data.JsonStore({
		url: 'data/siteAdmins.php',
		root: 'admins',
		fields: siteAdminRecord
	});

	var domainPermStore = new Ext.data.JsonStore({
		url: 'data/domainPerms.php',
		root: 'domains',
		fields: domainPermRecord
	});

	var domainListStore = new Ext.data.JsonStore({
		url: 'data/domains.php',
		root: 'domains',
		fields: domainRecord
	});

	var userStore = new Ext.data.JsonStore({
		url: 'data/users.php',
		root: 'users',
		fields: userRecord
	});

	var localAliasStore = new Ext.data.JsonStore({
		url: 'data/localAliases.php',
		root: 'aliases',
		fields: localAliasRecord
	});

	// private functions
	function boolEditor(label, name, width) {
		return new Ext.form.ComboBox({
			store: new Ext.data.SimpleStore({
				fields: ['value', 'display'],
				data: [
					[false, 'No'],
					[true, 'Yes']
				]
			}),
			fieldLabel: label,
			hiddenName: name,
			width: width,
			displayField: 'display',
			valueField: 'value',
			mode: 'local',
			forceSelection: true,
			typeAhead: true,
			triggerAction: 'all',
			allowBlank: false,
			selectOnFocus: true,
			lazyRender: true,
			value: false
		});
	}

	var boolRenderer = function(value, meta, record, row, col, store) {
		if(value) {
			return 'Yes';
		}
		return 'No';
	}

	var getUserInfo = function() {
		Ext.Ajax.request({
			url: 'data/userInfo.php',
			success: parseUserInfo,
			failure: ajaxFailure
		});
	}

	var formFailure = function(form, action) {
		if(action && action.response && action.response.statusText && (action.response.statusText != 'OK')) {
			showError(action.response.statusText);
		} else {
			showError('Please correct the underlined items');
		}
	}

	var ajaxFailure = function(response, options) {
		if(options && options.url == 'data/userInfo.php') {
			showLogin();
			enablePage();
		} else {
			var msg = 'Unknown Error';
			if(response && response.statusText) {
				msg = response.statusText;
			}
			showError(msg);
		}
	}

	var showPortal = function() {
		viewport = new Ext.Viewport({
			layout: 'border',
			items: [
				west = new Ext.tree.TreePanel({
					title: 'Tools',
					autoScroll: true,
					region: 'west',
					rootVisible: false,
					split: true,
					width: 200,
					minSize: 75,
					maxSize: 300,
					collapsible: true,
					id: 'west-panel',
					lines: false,
					buttonAlign: 'center',
					root: new Ext.tree.AsyncTreeNode({
						id: 'tools-root'
					}),
					loader: new Ext.tree.TreeLoader({
						url: 'data/tree.php'
					}),
					buttons: [{
						text: 'Logout',
						handler: logoutDialog
					}]
				}), center = new Ext.Panel({
					title: document.title,
					region: 'center',
					layout: 'card',
					margins: '5 0 0 0',
					id: 'center-panel',
					items: [
						infoPanel = new Ext.Panel({
							id: 'user-info-panel',
							layout: 'table',
							defaults: {
								bodyStyle: 'padding-bottom:5px;padding-right:10px'
							},
								bodyStyle: 'padding:15px',
							layoutConfig: {
								columns: 4
							},
							autoScroll: true,
							border: false,
							items: [
								{
									html: '<div style="text-align: center;"><img src="/images/rubix_consulting_medium.png" /></div>',
									cellCls: 'alignTop',
									border: false,
									colspan: 4
								},{
									html: '<b>Name</b>',
									cellCls: 'alignTop',
									border: false
								},{
									html: user.name,
									cellCls: 'alignTop',
									border: false
								},{
									html: '<b>Email Address</b>',
									cellCls: 'alignTop',
									border: false,
									width: 120
								},{
									html: user.email,
									cellCls: 'alignTop',
									border: false
								},{
									html: '<b>Role</b>',
									cellCls: 'alignTop',
									border: false
								},{
									html: user.longrole,
									cellCls: 'alignTop',
									border: false
								},{
									html: '<b>Forwards</b>',
									cellCls: 'alignTop',
									border: false
								},{
									cellCls: 'alignTop',
									id: 'forwards',
									border: false
								},{
									html: '<b>Aliases</b>',
									cellCls: 'alignTop',
									border: false
								},{
									cellCls: 'alignTop',
									id: 'aliases',
									border: false
								}
							]
						}),
						new Ext.form.FormPanel({
							url: 'data/changePass.php',
							monitorValid: true,
							autoScroll: true,
							labelWidth: 125,
							width: 318,
							id: 'change-password-panel',
							layoutConfig: {
								labelSeparator: ''
							},
							defaultType: 'textfield',
							bodyStyle: 'padding:15px',
							defaults: {
								width: 150,
								msgTarget: 'side'
							},
							items: [{
								fieldLabel: 'Old Password',
								name: 'oldpass',
								id: 'oldpass',
								allowBlank: false,
								inputType: 'password'
							}, new Ext.ux.PasswordMeter({
								fieldLabel: 'New Password',
								name: 'newpass',
								id: 'newpass',
								allowBlank: false,
								inputType: 'password',
								validator: validPass,
								invalidText: 'Password does not meet requirements',
								minLength: 8
							}),{
								fieldLabel: 'Repeat New Password',
								name: 'repnewpass',
								id: 'repnewpass',
								allowBlank: false,
								inputType: 'password',
								validator: validRepPass,
								invalidText: 'Passwords do not match'
							}],
							buttons: [
								{
									text: 'Reset Form',
									handler: resetChangePassword
								},{
									text: 'Change Password',
									formBind: true,
									handler: changePassword
								}
							]
						}),
						domainGrid = new Ext.grid.GridPanel({
							border: true,
							id: 'manage-domains-panel',
							autoScroll: true,
							loadMask: true,
							clicksToEdit: 1,
							tbar: [
								addDomainBtn = new Ext.Toolbar.Button({
									text: 'Add New',
									handler: addDomain
								}),
								removeDomainBtn = new Ext.Toolbar.Button({
									text: 'Remove Selected',
									handler: removeSelectedDomains,
									disabled: true
								})
							],
							store: domainListStore,
							sm: domainSm,
							cm: new Ext.grid.ColumnModel([
								domainSm, {
									header: 'Domain',
									sortable: true,
									dataIndex: 'domain',
									id: 'domain',
									width: 150,
									editor: new Ext.form.TextField({
										allowBlank: false
									})
								}
							]),
							iconCls: 'icon-grid'
						}),
						userGrid = new Ext.grid.EditorGridPanel({
							border: true,
							id: 'manage-users-panel',
							autoScroll: true,
							loadMask: true,
							clicksToEdit: 1,
							tbar: [
								addUserBtn = new Ext.Toolbar.Button({
									text: 'Add New',
									handler: showAddUserWindow
								}),
								resetPassBtn = new Ext.Toolbar.Button({
									text: 'Reset Password',
									handler: resetPassword,
									disabled: true
								}),
								removeUserBtn = new Ext.Toolbar.Button({
									text: 'Remove Selected',
									handler: removeSelectedUsers,
									disabled: true
								}),
								revertUserBtn = new Ext.Toolbar.Button({
									text: 'Revert Changes',
									handler: revertUsers,
									disabled: true
								}),
								saveUserBtn = new Ext.Toolbar.Button({
									text: 'Save Changes',
									handler: saveUsers,
									disabled: true
								})
							],
							store: userStore,
							sm: userSm,
							cm: new Ext.grid.ColumnModel([
								userSm, {
									header: 'Email',
									sortable: true,
									dataIndex: 'email',
									width: 200,
									id: 'email',
									editor: false
								},{
									header: 'Name',
									sortable: true,
									dataIndex: 'name',
									id: 'name',
									editor: new Ext.form.TextField({
										allowBlank: true
									})
								},{
									header: 'Active',
									sortable: true,
									dataIndex: 'active',
									id: 'active',
									width: 50,
									editor: boolEditor(),
									renderer: boolRenderer
								}
							]),
							iconCls: 'icon-grid'
						}),
						domainPermGrid = new Ext.grid.EditorGridPanel({
							border: true,
							id: 'manage-domain-permissions-panel',
							autoScroll: true,
							loadMask: true,
							clicksToEdit: 1,
							tbar: [
								{xtype: 'tbtext', text: 'Domain'},
								domainPermCombo = new Ext.form.ComboBox({
									store: domainListStore,
									displayField: 'domain',
									valueField: 'domain_id',
									forceSelection: true,
									typeAhead: true,
									minChars: 1,
									editable: true,
									width: 175,
									hiddenName: 'user_id',
									triggerAction: 'all',
									queryParam: 'query',
									allQuery: 'all',
									emptyText: 'Choose a domain'
								}),
								saveDomainPermBtn = new Ext.Toolbar.Button({
									text: 'Save Changes',
									handler: saveDomainPerms,
									disabled: true
								})
							],
							store: domainPermStore,
							cm: new Ext.grid.ColumnModel([
								{
									header: 'Email',
									sortable: true,
									dataIndex: 'email',
									id: 'email',
									width: 150,
									editor: false
								},{
									header: 'Administrator',
									sortable: true,
									dataIndex: 'admin',
									id: 'admin',
									width: 80,
									editor: boolEditor(),
									renderer: boolRenderer
								}
							]),
							iconCls: 'icon-grid'
						}),
						siteAdminGrid = new Ext.grid.EditorGridPanel({
							border: true,
							id: 'manage-site-administrators-panel',
							autoScroll: true,
							loadMask: true,
							clicksToEdit: 1,
							tbar: [
								revertSiteAdminBtn = new Ext.Toolbar.Button({
									text: 'Revert Changes',
									handler: revertSiteAdmins,
									disabled: true
								}),
								saveSiteAdminBtn = new Ext.Toolbar.Button({
									text: 'Save Changes',
									handler: saveSiteAdmins,
									disabled: true
								})
							],
							store: siteAdminStore,
							sm: siteAdminSm,
							cm: new Ext.grid.ColumnModel([
								siteAdminSm, {
									header: 'Email',
									sortable: true,
									dataIndex: 'email',
									width: 200,
									id: 'email',
									editor: false
								},{
									header: 'Site Administrator',
									sortable: true,
									dataIndex: 'site_admin',
									id: 'site_admin',
									width: 100,
									editor: boolEditor(),
									renderer: boolRenderer
								}
							]),
							iconCls: 'icon-grid'
						}),
						localAliasGrid = new Ext.grid.EditorGridPanel({
							border: true,
							id: 'manage-local-aliases-panel',
							autoScroll: true,
							autoExpandColumn: 'destination',
							loadMask: true,
							clicksToEdit: 1,
							tbar: [
								addLocalAliasBtn = new Ext.Toolbar.Button({
									text: 'Add New',
									handler: showAddLocalAliasWindow
								}),
								bulkAddLocalAliasBtn = new Ext.Toolbar.Button({
									text: 'Bulk Add',
									handler: showBulkAddLocalAliasWindow
								}),
								removeLocalAliasBtn = new Ext.Toolbar.Button({
									text: 'Remove Selected',
									handler: removeSelectedLocalAliases,
									disabled: true
								}),
								revertLocalAliasesBtn = new Ext.Toolbar.Button({
									text: 'Revert Changes',
									handler: revertLocalAliases,
									disabled: true
								}),
								saveLocalAliasesBtn = new Ext.Toolbar.Button({
									text: 'Save Changes',
									handler: saveLocalAliases,
									disabled: true
								})
							],
							store: localAliasStore,
							sm: localAliasSm,
							cm: new Ext.grid.ColumnModel([
								localAliasSm, {
									header: 'Name',
									sortable: true,
									dataIndex: 'name',
									width: 150,
									id: 'name',
									editor: new Ext.form.TextField({
										allowBlank: true
									})
								},{
									header: 'Destination',
									sortable: true,
									dataIndex: 'destination',
									id: 'destination',
									editor: new Ext.form.TextField({
										allowBlank: true
									})
								},{
									header: 'Active',
									sortable: true,
									dataIndex: 'active',
									id: 'active',
									width: 50,
									editor: boolEditor(),
									renderer: boolRenderer
								}
							]),
							iconCls: 'icon-grid'
						})
					]
				})
			]
		});
		if(user.domain_admin) {
			infoPanel.add({
				html: '<b>You Administer</b>',
				cellCls: 'alignTop',
				border: false
			});
			infoPanel.add({
				id: 'you-administer',
				cellCls: 'alignTop',
				border: false
			});
		}
		infoPanel.doLayout();
		updateUserInfoPage();
		west.on('load', function(node) {
			if(node.id != 'tools-root') {
				return;
			}
			new Ext.util.DelayedTask(function() {
				west.getNodeById('user-info').select();
			}, this).delay(0);
		}, this);
		west.getSelectionModel().on('selectionchange', clickTree, this);
		localAliasStore.on('update', function(store, record, operation) {
			saveLocalAliasesBtn.enable();
			revertLocalAliasesBtn.enable();
		}, this);
		userStore.on('update', function(store, record, operation) {
			saveUserBtn.enable();
			revertUserBtn.enable();
		}, this);
		domainPermStore.on('update', function(store, record, operation) {
			saveDomainPermBtn.enable();
		}, this);
		siteAdminStore.on('update', function(store, record, operation) {
			saveSiteAdminBtn.enable();
			revertSiteAdminBtn.enable();
		}, this);
		domainListStore.on('loadexception', loadException, this);
		userStore.on(      'loadexception', loadException, this);
		domainPermStore.on('loadexception', loadException, this);
		siteAdminStore.on( 'loadexception', loadException, this);
		localAliasStore.on('loadexception', loadException, this);
		siteAdminSm.on('beforerowselect', function(selectionmodel, row, keep, record) {
			if(record.get('email') == user.email) {
				return false;
			}
			return true;
		}, this);
		domainSm.on('beforerowselect', function(selectionmodel, row, keep, record) {
			if(record.get('domain') == user.domain) {
				return false;
			}
			return true;
		}, this);
		userSm.on('beforerowselect', function(selectionmodel, row, keep, record) {
			if(record.get('email') == user.email) {
				return false;
			}
			return true;
		}, this);
		localAliasSm.on('selectionchange', function(selectionmodel) {
			if(localAliasSm.getCount() > 0) {
				removeLocalAliasBtn.enable();
			} else {
				removeLocalAliasBtn.disable();
			}
		}, this);
		domainSm.on('selectionchange', function(selectionmodel) {
			if(domainSm.getCount() > 0) {
				removeDomainBtn.enable();
			} else {
				removeDomainBtn.disable();
			}
		}, this);
		userSm.on('selectionchange', function(selectionmodel) {
			if(userSm.getCount() > 0) {
				removeUserBtn.enable();
			} else {
				removeUserBtn.disable();
			}
			if(userSm.getCount() == 1) {
				resetPassBtn.enable();
			} else {
				resetPassBtn.disable();
			}
		}, this);
		domainGrid.on('beforeedit', function(e) {
			if(e.record.get('domain') == user.domain) {
				return false;
			}
			return true;
		}, this);
		domainPermGrid.on('beforeedit', function(e) {
			if(e.record.get('email') == user.email) {
				return false;
			}
			return true;
		}, this);
		userGrid.on('beforeedit', function(e) {
			if(e.record.get('email') == user.email) {
				return false;
			}
			return true;
		}, this);
		siteAdminGrid.on('beforeedit', function(e) {
			if(e.record.get('email') == user.email) {
				return false;
			}
			return true;
		}, this);
		domainPermCombo.on('select', loadDomainPerms, this);
		enablePage();
	}

	var loadException = function(item, options, response, error) {
		var msg = 'Unknown Error';
		if(response && response.statusText) {
			msg = response.statusText;
		}
		showError(msg);
	}

	var addDomain = function() {
		if(!addDomainWindow) {
			addDomainWindow = new Ext.Window({
				resizable: false,
				layout: 'fit',
				width: 355,
				height: 120,
				constrain: true,
				constrainHeader: true,
				minimizable: false,
				closable: false,
				plain: false,
				title: 'Add a new domain...',
				modal: true,
				items: [{
					id: 'add-domain-form',
					layout: 'form',
					url: 'data/domains.php',
					frame: true,
					monitorValid: true,
					xtype: 'form',
					bodyStyle: 'padding: 15px',
					defaults: {
						msgTarget: 'side'
					},
					baseParams: {
						mode: 'add'
					},
					buttons: [{
						text: 'Cancel',
						handler: hideAddDomainWindow
					},{
						text: 'Add Domain',
						formBind: true,
						handler: doAddDomain
					}],
					layoutConfig: {
						labelSeparator: ''
					},
					items: [
						addDomainDomain = new Ext.form.TextField({
							fieldLabel: 'Domain Name',
							name: 'domain',
							allowBlank: false,
							width: 175
						})
					]
				}]
			});
		}
		addDomainWindow.show(addDomainBtn.getEl());
		new Ext.util.DelayedTask(function() {
			addDomainDomain.focus();
		}, this).delay(700);
	}

	var doAddDomain = function(domain) {
		domainListMask = new Ext.LoadMask(domainGrid.getEl(), {msg: 'Adding new domain...'});
		domainListMask.show();
		Ext.getCmp('add-domain-form').getForm().submit({
			success: addDomainSuccess,
			failure: formFailure
		});
	}

	var showResetPasswordWindow = function() {
		if(!resetPasswordWindow) {
			resetPasswordWindow = new Ext.Window({
				resizable: false,
				layout: 'fit',
				width: 355,
				height: 200,
				constrain: true,
				constrainHeader: true,
				minimizable: false,
				closable: false,
				plain: false,
				title: 'Reset password...',
				modal: true,
				items: [{
					id: 'reset-password-form',
					layout: 'form',
					url: 'data/users.php',
					frame: true,
					monitorValid: true,
					xtype: 'form',
					bodyStyle: 'padding: 15px',
					defaults: {
						msgTarget: 'side'
					},
					baseParams: {
						mode: 'resetPassword'
					},
					buttons: [{
						text: 'Cancel',
						handler: hideResetPasswordWindow
					},{
						text: 'Reset Password',
						formBind: true,
						handler: doResetPassword
					}],
					layoutConfig: {
						labelSeparator: ''
					},
					items: [
						{
							html: '<label class="x-form-item-label" style="width: 103px">Email Address</label><div style="padding-top: 4px;" id="reset-password-email-address">username@domain</div>',
							cls: 'x-form-item'
						},
						resetPassPassword = new Ext.ux.PasswordMeter({
							fieldLabel: 'New Password',
							name: 'password',
							id: 'reset-password-password',
							allowBlank: false,
							width: 175,
							inputType: 'password',
							validator: validResetPass,
							invalidText: 'Password does not meet requirements',
							minLength: 8
						}),
						new Ext.form.TextField({
							fieldLabel: 'Repeat Password',
							name: 'reppassword',
							allowBlank: false,
							width: 175,
							inputType: 'password',
							validator: validResetRepPass,
							invalidText: 'Passwords do not match'
						})
					]
				}]
			});
		}
		resetPasswordWindow.show(resetPassBtn.getEl());
		new Ext.util.DelayedTask(function() {
			resetPassPassword.focus();
		}, this).delay(700);
		Ext.get('reset-password-email-address').update(userSm.getSelections()[0].get('email'));
	}

	var showBulkAddLocalAliasWindow = function() {
		if(!bulkAddLocalAliasWindow) {
			bulkAddLocalAliasWindow = new Ext.Window({
				resizable: false,
				layout: 'fit',
				width: 620,
				height: 300,
				constrain: true,
				constrainHeader: true,
				minimizable: false,
				closable: false,
				plain: false,
				title: 'Bulk add new local aliases...',
				modal: true,
				items: [{
					id: 'bulk-add-local-alias-form',
					layout: 'form',
					url: 'data/localAliases.php',
					frame: true,
					monitorValid: true,
					xtype: 'form',
					bodyStyle: 'padding: 15px',
					defaults: {
						msgTarget: 'side'
					},
					baseParams: {
						mode: 'bulk-add'
					},
					buttons: [{
						text: 'Cancel',
						handler: hideBulkAddLocalAliasWindow
					},{
						text: 'Add',
						formBind: true,
						handler: bulkAddLocalAlias
					}],
					layoutConfig: {
						labelSeparator: ''
					},
					items: [
						{
							html: '<label class="x-form-item-label" style="width: 103px">Instructions</label><div style="padding-top: 4px;" id="add-email-address">Use standard /etc/aliases format.<br />All bulk added local aliases will be active by default.</div>',
							cls: 'x-form-item'
						},
						bulkAddLocalAliasArea = new Ext.form.TextArea({
							fieldLabel: 'Local Aliases',
							allowBlank: false,
							width: 450,
							height: 150,
							name: 'local-aliases'
						})
					]
				}]
			});
		}
		bulkAddLocalAliasWindow.show(bulkAddLocalAliasBtn.getEl());
		new Ext.util.DelayedTask(function() {
			bulkAddLocalAliasArea.focus();
		}, this).delay(700);
	}

	var showAddLocalAliasWindow = function() {
		if(!addLocalAliasWindow) {
			addLocalAliasWindow = new Ext.Window({
				resizable: false,
				layout: 'fit',
				width: 355,
				height: 170,
				constrain: true,
				constrainHeader: true,
				minimizable: false,
				closable: false,
				plain: false,
				title: 'Add a new local alias...',
				modal: true,
				items: [{
					id: 'add-local-alias-form',
					layout: 'form',
					url: 'data/localAliases.php',
					frame: true,
					monitorValid: true,
					xtype: 'form',
					bodyStyle: 'padding: 15px',
					defaults: {
						msgTarget: 'side'
					},
					baseParams: {
						mode: 'add'
					},
					buttons: [{
						text: 'Cancel',
						handler: hideAddLocalAliasWindow
					},{
						text: 'Add',
						formBind: true,
						handler: addLocalAlias
					}],
					layoutConfig: {
						labelSeparator: ''
					},
					items: [
						addLocalAliasName = new Ext.form.TextField({
							fieldLabel: 'Name',
							allowBlank: false,
							width: 175,
							name: 'name'
						}),
						addLocalAliasDestination = new Ext.form.TextField({
							fieldLabel: 'Destination',
							allowBlank: false,
							width: 175,
							name: 'destination'
						}),
						boolEditor('Active', 'active', 175)
					]
				}]
			});
		}
		addLocalAliasWindow.show(addLocalAliasBtn.getEl());
		new Ext.util.DelayedTask(function() {
			addLocalAliasName.focus();
		}, this).delay(700);
	}

	var showAddUserWindow = function() {
		if(!addUserWindow) {
			addUserWindow = new Ext.Window({
				resizable: false,
				layout: 'fit',
				width: 355,
				height: 295,
				constrain: true,
				constrainHeader: true,
				minimizable: false,
				closable: false,
				plain: false,
				title: 'Add a new user...',
				modal: true,
				items: [{
					id: 'add-user-form',
					layout: 'form',
					url: 'data/users.php',
					frame: true,
					monitorValid: true,
					xtype: 'form',
					bodyStyle: 'padding: 15px',
					defaults: {
						msgTarget: 'side'
					},
					baseParams: {
						mode: 'add'
					},
					buttons: [{
						text: 'Cancel',
						handler: hideAddUserWindow
					},{
						text: 'Add',
						formBind: true,
						handler: addNewUser
					}],
					layoutConfig: {
						labelSeparator: ''
					},
					items: [
						addUserUsername = new Ext.form.TextField({
							fieldLabel: 'Username',
							allowBlank: false,
							width: 175,
							name: 'username'
						}),
						addUserDomain = new Ext.form.ComboBox({
							store: domainListStore,
							fieldLabel: 'Domain',
							displayField: 'domain',
							valueField: 'domain_id',
							forceSelection: true,
							typeAhead: true,
							minChars: 1,
							editable: true,
							allowBlank: false,
							width: 175,
							hiddenName: 'domain',
							triggerAction: 'all',
							queryParam: 'query',
							allQuery: 'all'
						}),
						{
							html: '<label class="x-form-item-label" style="width: 103px">Email Address</label><div style="padding-top: 4px;" id="add-email-address">username@domain</div>',
							cls: 'x-form-item'
						},
						new Ext.ux.PasswordMeter({
							fieldLabel: 'Password',
							name: 'password',
							id: 'add-user-password',
							allowBlank: false,
							width: 175,
							inputType: 'password',
							validator: validAddPass,
							invalidText: 'Password does not meet requirements',
							minLength: 8
						}),
						new Ext.form.TextField({
							fieldLabel: 'Repeat Password',
							name: 'reppassword',
							allowBlank: false,
							width: 175,
							inputType: 'password',
							validator: validAddRepPass,
							invalidText: 'Passwords do not match'
						}),
						new Ext.form.TextField({
							fieldLabel: 'Full Name',
							name: 'name',
							width: 175
						}),
						boolEditor('Active', 'active', 175)
					]
				}]
			});
			addUserUsername.on('change', updateAddUserEmail, this);
			addUserDomain.on('change', updateAddUserEmail, this);
		}
		addUserWindow.show(addUserBtn.getEl());
		new Ext.util.DelayedTask(function() {
			addUserUsername.focus();
		}, this).delay(700);
	}

	var updateAddUserEmail = function(field, newval, oldval) {
		Ext.get('add-email-address').update(addUserUsername.getValue()+'@'+addUserDomain.getEl().getValue());
	}

	var hideBulkAddLocalAliasWindow = function() {
		if(bulkAddLocalAliasWindow) {
			Ext.getCmp('bulk-add-local-alias-form').getForm().reset();
			bulkAddLocalAliasWindow.hide(addLocalAliasBtn.getEl());
		}
	}

	var hideAddLocalAliasWindow = function() {
		if(addLocalAliasWindow) {
			Ext.getCmp('add-local-alias-form').getForm().reset();
			addLocalAliasWindow.hide(addLocalAliasBtn.getEl());
		}
	}

	var hideAddDomainWindow = function() {
		Ext.getCmp('add-domain-form').getForm().reset();
		addDomainWindow.hide(addDomainBtn.getEl());
	}

	var hideResetPasswordWindow = function() {
		Ext.getCmp('reset-password-form').getForm().reset();
		Ext.get('reset-password-email-address').update('username@domain');
		resetPasswordWindow.hide(resetPassBtn.getEl());
	}

	var hideAddUserWindow = function() {
		Ext.getCmp('add-user-form').getForm().reset();
		Ext.get('add-email-address').update('username@domain');
		addUserWindow.hide(addUserBtn.getEl());
	}

	var doResetPassword = function() {
		userMask = new Ext.LoadMask(userGrid.getEl(), {msg: 'Resetting password...'});
		userMask.show();
		Ext.getCmp('reset-password-form').getForm().submit({
			success: resetPasswordSuccess,
			failure: formFailure,
			params: {
				user: userSm.getSelections()[0].get('email')
			}
		});
	}

	var bulkAddLocalAlias = function() {
		disablePage('Bulk adding local aliases...', 'Please wait');
		Ext.getCmp('bulk-add-local-alias-form').getForm().submit({
			success: addLocalAliasSuccess,
			failure: formFailure
		});
	}

	var addLocalAlias = function() {
		disablePage('Adding local alias...', 'Please wait');
		Ext.getCmp('add-local-alias-form').getForm().submit({
			success: addLocalAliasSuccess,
			failure: formFailure
		});
	}

	var addNewUser = function() {
		disablePage('Adding user...', 'Please wait');
		Ext.getCmp('add-user-form').getForm().submit({
			success: addUserSuccess,
			failure: formFailure
		});
	}

	var removeDomainsSuccess = function(form, action) {
		domainListStore.commitChanges();
		getUserInfo();
		domainListMask.hide();
	}

	var addDomainSuccess = function(form, action) {
		hideAddDomainWindow();
		domainListMask.hide();
		loadDomains();
		getUserInfo();
	}

	var resetPasswordSuccess = function(form, action) {
		hideResetPasswordWindow();
		userMask.hide();
		showInfo('Password reset', 'Password was reset successfully');
	}

	var addLocalAliasSuccess = function(form, action) {
		hideAddLocalAliasWindow();
		hideBulkAddLocalAliasWindow();
		loadLocalAliases();
		saveLocalAliasesBtn.disable();
		revertLocalAliasesBtn.disable();
		enablePage();
	}

	var addUserSuccess = function(form, action) {
		hideAddUserWindow();
		saveUserBtn.disable();
		revertUserBtn.disable();
		enablePage();
		loadUsers();
	}

	var removeSelectedDomains = function() {
		Ext.MessageBox.show({
			closable: false,
			buttons: Ext.MessageBox.YESNO,
			icon: Ext.MessageBox.QUESTION,
			title: 'Remove Domains?',
			width: 450,
			msg: '<table><tr><td>Do you really want to remove these domains?</td></tr>'+
			     '<tr><td>All associated email address, aliases and forwarders will also be deleted.</td></tr>'+
			     '<tr><td>All other domain changes will be saved as well.</td></tr></table>',
			fn: function(btn) {
				if(btn == 'yes') {
					doRemoveSelectedDomains();
				}
			}
		});
	}

	var removeSelectedLocalAliases = function() {
		Ext.MessageBox.show({
			closable: false,
			buttons: Ext.MessageBox.YESNO,
			icon: Ext.MessageBox.QUESTION,
			title: 'Remove Local Aliases?',
			width: 450,
			msg: '<table><tr><td>Do you really want to remove these local aliases?</td></tr></table>',
			fn: function(btn) {
				if(btn == 'yes') {
					doRemoveSelectedLocalAliases();
				}
			}
		});
	}

	var removeSelectedUsers = function() {
		Ext.MessageBox.show({
			closable: false,
			buttons: Ext.MessageBox.YESNO,
			icon: Ext.MessageBox.QUESTION,
			title: 'Remove Users?',
			width: 450,
			msg: '<table><tr><td>Do you really want to remove these users?</td></tr>'+
			     '<tr><td>All associated aliases and forwarders will also be deleted.</td></tr>'+
			     '<tr><td>All stored email will also be deleted.</td></tr>'+
			     '<tr><td>All other user changes will be saved as well.</td></tr></table>',
			fn: function(btn) {
				if(btn == 'yes') {
					doRemoveSelectedUsers();
				}
			}
		});
	}

	var resetPassword = function() {
		var selected = userSm.getSelections();
		if(selected.length == 0) {
			showError('No user selected');
		} else if(selected.length > 1) {
			showError('Please select only one user before attempting to reset password');
		} else if(selected.length == 1) {
			showResetPasswordWindow();
		}
	}

	var doRemoveSelectedLocalAliases = function() {
		var selected = localAliasSm.getSelections();
		for(var i = 0; i < selected.length; i++) {
			removedLocalAliases.push(selected[i].get('alias_id'));
			selected[i].commit();
			localAliasStore.remove(selected[i]);
		}
		saveLocalAliases();
	}

	var doRemoveSelectedUsers = function() {
		var selected = userSm.getSelections();
		var removed = 0;
		for(var i = 0; i < selected.length; i++) {
			if(user.email == selected[i].get('email')) {
				showError('Can not delete email:<br />'+user.email+'<br />It will delete your account');
				continue;
			}
			removed++;
			removedUsers.push(selected[i].get('user_id'));
			selected[i].commit();
			userStore.remove(selected[i]);
		}
		if(removed > 0) {
			saveUsers();
		}
	}

	var doRemoveSelectedDomains = function() {
		var selected = domainSm.getSelections();
		var removeDomains = new Array();
		for(var i = 0; i < selected.length; i++) {
			removeDomains.push(selected[i].get('domain_id'));
			selected[i].commit();
			domainListStore.remove(selected[i]);
		}
		if(removeDomains.length == 0) {
			return;
		}
		domainListMask = new Ext.LoadMask(domainGrid.getEl(), {msg: 'Saving...'});
		domainListMask.show();
		Ext.Ajax.request({
			url: 'data/domains.php',
			success: removeDomainsSuccess,
			failure: ajaxFailure,
			params: {
				mode: 'remove',
				domains: removeDomains.join(',')
			}
		});
	}

	var saveDomainPerms = function() {
		var modifiedDomains = new Array();
		var modified = domainPermStore.getModifiedRecords();
		for(var i = 0; i < modified.length; i++) {
			var tmpDomain = new Object();
			tmpDomain.user_id   = modified[i].get('user_id');
			tmpDomain.admin     = modified[i].get('admin');
			modifiedDomains.push(tmpDomain);
		}
		domainPermMask = new Ext.LoadMask(domainPermGrid.getEl(), {msg: 'Saving...'});
		domainPermMask.show();
		Ext.Ajax.request({
			url: 'data/domainPerms.php',
			success: completeSaveDomainPerms,
			failure: ajaxFailure,
			params: {
				mode: 'save',
				update: Ext.util.JSON.encode(modifiedDomains),
				domain: domainPermCombo.getValue()
			}
		});
	}

	var saveSiteAdmins = function() {
		var modifiedUsers = new Array();
		var modified = siteAdminStore.getModifiedRecords();
		for(var i = 0; i < modified.length; i++) {
			var tmpUser = new Object();
			tmpUser.user_id = modified[i].get('user_id');
			tmpUser.site_admin = modified[i].get('site_admin');
			modifiedUsers.push(tmpUser);
		}
		siteAdminMask = new Ext.LoadMask(siteAdminGrid.getEl(), {msg: 'Saving...'});
		siteAdminMask.show();
		Ext.Ajax.request({
			url: 'data/siteAdmins.php',
			success: completeSaveSiteAdmins,
			failure: ajaxFailure,
			params: {
				mode: 'save',
				update: Ext.util.JSON.encode(modifiedUsers)
			}
		});
	}

	var saveLocalAliases = function() {
		var modifiedLocalAliases = new Array();
		var modified = localAliasStore.getModifiedRecords();
		for(var i = 0; i < modified.length; i++) {
			var tmpLocalAlias = new Object();
			tmpLocalAlias.alias_id    = modified[i].get('alias_id');
			tmpLocalAlias.name        = modified[i].get('name');
			tmpLocalAlias.destination = modified[i].get('destination');
			tmpLocalAlias.active      = modified[i].get('active');
			modifiedLocalAliases.push(tmpLocalAlias);
		}
		localAliasMask = new Ext.LoadMask(localAliasGrid.getEl(), {msg: 'Saving...'});
		localAliasMask.show();
		Ext.Ajax.request({
			url: 'data/localAliases.php',
			success: completeSaveLocalAliases,
			failure: ajaxFailure,
			params: {
				mode: 'save',
				update: Ext.util.JSON.encode(modifiedLocalAliases),
				remove: removedLocalAliases.join(',')
			}
		});
	}

	var saveUsers = function() {
		var modifiedUsers = new Array();
		var modified = userStore.getModifiedRecords();
		for(var i = 0; i < modified.length; i++) {
			var tmpUser = new Object();
			tmpUser.user_id = modified[i].get('user_id');
			tmpUser.name    = modified[i].get('name');
			tmpUser.active  = modified[i].get('active');
			modifiedUsers.push(tmpUser);
		}
		userMask = new Ext.LoadMask(userGrid.getEl(), {msg: 'Saving...'});
		userMask.show();
		Ext.Ajax.request({
			url: 'data/users.php',
			success: completeSaveUsers,
			failure: ajaxFailure,
			params: {
				mode: 'save',
				update: Ext.util.JSON.encode(modifiedUsers),
				remove: removedUsers.join(',')
			}
		});
	}

	var completeSaveDomainPerms = function() {
		domainPermMask.hide();
		domainPermStore.commitChanges();
		saveDomainPermBtn.disable();
	}

	var completeSaveSiteAdmins = function() {
		siteAdminMask.hide();
		siteAdminStore.commitChanges();
		saveSiteAdminBtn.disable();
		revertSiteAdminBtn.disable();
	}

	var completeSaveLocalAliases = function() {
		localAliasMask.hide();
		localAliasStore.commitChanges();
		removedLocalAliases = new Array();
		saveLocalAliasesBtn.disable();
		revertLocalAliasesBtn.disable();
	}

	var completeSaveUsers = function() {
		userMask.hide();
		userStore.commitChanges();
		removedUsers = new Array();
	}

	var revertLocalAliases = function() {
		saveLocalAliasesBtn.disable();
		revertLocalAliasesBtn.disable();
		localAliasStore.rejectChanges();
	}

	var revertSiteAdmins = function() {
		saveSiteAdminBtn.disable();
		revertSiteAdminBtn.disable();
		siteAdminStore.rejectChanges();
	}

	var revertUsers = function() {
		saveUserBtn.disable();
		revertUserBtn.disable();
		userStore.rejectChanges();
	}

	var validPass = function(pass) {
		// TODO: do some better validation here
		var oldpass = Ext.get('oldpass');
		if(oldpass) {
			oldval = oldpass.getValue();
			if(oldval == pass) {
				return false;
			}
		}
		return true;
	}

	var validAddPass = function(pass) {
		// TODO: do some better validation here
		return true;
	}

	var validResetPass = function(pass) {
		// TODO: do some better validation here
		return true;
	}

	var validRepPass = function(reppass) {
		var newpass = Ext.get('newpass');
		if(newpass) {
			newval = newpass.getValue();
			if(newval == reppass) {
				return true;
			}
		}
		return false;
	}

	var validResetRepPass = function(reppass) {
		var newpass = Ext.get('reset-password-password');
		if(newpass) {
			newval = newpass.getValue();
			if(newval == reppass) {
				return true;
			}
		}
		return false;
	}

	var validAddRepPass = function(reppass) {
		var newpass = Ext.get('add-user-password');
		if(newpass) {
			newval = newpass.getValue();
			if(newval == reppass) {
				return true;
			}
		}
		return false;
	}

	var clickTree = function(selectionmodel, node) {
		nodeId = node.id+'-panel';
		if(
			(node.id == 'your-settings')		||
			(node.id == 'domain-administration')	||
			(node.id == 'site-administration')
		) {
			return;
		}
		center.getLayout().setActiveItem(nodeId);
		center.doLayout();
		if((nodeId == 'manage-domains-panel') && (!domainsLoaded)) {
			loadDomains();
		} else if((nodeId == 'manage-users-panel') && (!usersLoaded)) {
			loadUsers();
		} else if((nodeId == 'manage-site-administrators-panel') && (!siteAdminLoaded)) {
			loadSiteAdmins();
		} else if((nodeId == 'manage-local-aliases-panel') && (!localAliasesLoaded)) {
			loadLocalAliases();
		}
	}

	var loadDomains = function() {
		domainListStore.removeAll();
		domainsLoaded = false;
		domainListStore.load({
			params: {
				mode: 'load'
			},
			callback: function(r, options, success) {
				if(success) {
					domainsLoaded = true;
				}
			},
			scope: this
		});
	}

	var loadLocalAliases = function() {
		localAliasStore.removeAll();
		localAliasesLoaded = false;
		localAliasStore.load({
			params: {
				mode: 'load'
			},
			callback: function(r, options, success) {
				if(success) {
					localAliasesLoaded = true;
				}
			},
			scope: this
		});
	}

	var loadUsers = function() {
		userStore.removeAll();
		usersLoaded = false;
		userStore.load({
			params: {
				mode: 'load'
			},
			callback: function(r, options, success) {
				if(success) {
					usersLoaded = true;
				}
			},
			scope: this
		});
	}

	var loadSiteAdmins = function() {
		siteAdminStore.removeAll();
		siteAdminLoaded = false;
		siteAdminStore.load({
			params: {
				mode: 'load'
			},
			callback: function(r, options, success) {
				if(success) {
					siteAdminLoaded = true;
				}
			},
			scope: this
		});
	}

	var loadDomainPerms = function() {
		domainPermStore.removeAll();
		domainPermsLoaded = false;
		domainPermStore.load({
			params: {
				mode: 'load',
				domain: domainPermCombo.getValue()
			},
			callback: function(r, options, success) {
				if(success) {
					domainPermsLoaded = true;
					saveDomainPermBtn.disable();
				}
			},
			scope: this
		});
	}

	var parseUserInfo = function(response, options) {
		var data = Ext.util.JSON.decode(response.responseText);
		if(!data.success) {
			showLogin();
			enablePage();
		} else {
			user = data.user;
			if(loginWindow) {
				loginWindow.hide();
				Ext.getCmp('loginForm').getForm().reset()
			}
			if(!viewport) {
				showPortal();
			} else {
				updateUserInfoPage();
			}
		}
	}

	var updateUserInfoPage = function() {
		if(user.domain_admin) {
			var youAdminDiv = Ext.get('you-administer');
			if(youAdminDiv) {
				youAdminDiv.update(user.admin_domains.join('<br />'));
			}
		}
		var forwards = 'None';
		if(user.forwards.length > 0) {
			forwards = user.forwards.join('<br />');
		}
		var aliases = 'None';
		if(user.aliases.length > 0) {
			aliases = user.aliases.join('<br />');
		}
		forwardsDiv = Ext.get('forwards');
		if(forwardsDiv) {
			forwardsDiv.update(forwards);
		}
		aliasesDiv = Ext.get('aliases');
		if(aliasesDiv) {
			aliasesDiv.update(aliases);
		}
	}

	var showLogin = function() {
		if(loginWindow) {
			loginWindow.show();
			new Ext.util.DelayedTask(function() {
				Ext.getCmp('loginUser').focus();
			}, this).delay(0);
			return;
		}
		loginWindow = new Ext.Window({
			applyTo: 'login',
			layout: 'fit',
			width: 350,
			height: 300,
			closable: false,
			plain: false,
			resizable: false,
			title: 'Log In',
			items: [{
				layout: 'form',
				xtype: 'form',
				url: 'data/login.php',
				frame: true,
				monitorValid: true,
				id: 'loginForm',
				// TODO prevent enter on the submit button from double submitting
				//keys: [{
				//	key: Ext.EventObject.ENTER,
				//	fn: doLogin
				//}],
				items: [{
					html: '<div style="text-align: center;"><img src="/images/rubix_consulting_medium.png" /></div>'
				},{
					xtype: 'fieldset',
					autoHeight: true,
					title: 'User Information',
					labelWidth: 70,
					defaultType: 'textfield',
					defaults: {
						width: 205,
						msgTarget: 'side'
					},
					layoutConfig: {
						labelSeparator: ''
					},
					items: [{
						fieldLabel: 'User Name',
						name: 'user',
						id: 'loginUser',
						allowBlank: false
					},{
						fieldLabel: 'Password',
						name: 'pass',
						id: 'loginPass',
						allowBlank: false,
						inputType: 'password'
					}]
				}],
				buttons: [{
					text: 'Log In',
					formBind: true,
					handler: doLogin
				}]
			}]
		});
		loginWindow.show();
		new Ext.util.DelayedTask(function() {
			Ext.getCmp('loginUser').focus();
		}, this).delay(0);
	}

	var disablePage = function(msg, title) {
		Ext.Msg.wait(msg, title);
	}

	var enablePage = function() {
		Ext.Msg.hide();
	}

	var changePassword = function() {
		disablePage('Changing password...', 'Please wait');
		Ext.getCmp('change-password-panel').getForm().submit({
			success: changePasswordSuccess,
			failure: formFailure
		});
	}

	var resetChangePassword = function() {
		Ext.getCmp('change-password-panel').getForm().reset();
	}

	var changePasswordSuccess = function(form, action) {
		Ext.getCmp('change-password-panel').getForm().reset();
		showInfo('Password changed', 'Password changed successfully');
	}

	var showInfo = function(title, msg) {
		Ext.MessageBox.show({
			closable: false,
			buttons: Ext.MessageBox.OK,
			icon: Ext.MessageBox.INFO,
			title: title,
			msg: msg
		});
	}

	var showError = function(msg) {
		Ext.MessageBox.show({
			closable: false,
			buttons: Ext.MessageBox.OK,
			icon: Ext.MessageBox.ERROR,
			title: 'Error',
			msg: msg
		});
	}

	var doLogin = function() {
		disablePage('Logging in...', 'Please wait');
		Ext.getCmp('loginForm').getForm().submit({
			success: completeLogin,
			failure: loginFailure
		});
	}

	var loginFailure = function() {
		showError('Invalid User Name and/or Password');
	}

	var logoutDialog = function() {
		Ext.MessageBox.show({
			closable: false,
			buttons: Ext.MessageBox.YESNO,
			icon: Ext.MessageBox.QUESTION,
			title: 'Really logout?',
			msg: 'Do you really want to logout?',
			fn: function(btn) {
				if(btn == 'yes') {
					doLogout();
				}
			}
		});
	}

	var doLogout = function() {
		disablePage('Logging out...');
		Ext.Ajax.request({
			url: 'data/logout.php',
			success: completeLogout,
			failure: ajaxFailure
		});
	}

	var completeLogout = function() {
		viewport.destroy();
		viewport = null;
		user = null;
		// TODO LOGOUT clear all necessary variables here
		domainPermStore.removeAll();
		domainPermsLoaded = false;
		domainListStore.removeAll();
		domainsLoaded = false;
		userStore.removeAll();
		usersLoaded = false;
		siteAdminStore.removeAll();
		siteAdminLoaded = false;
		domainPermStore.removeAll();
		domainPermsLoaded = false;
		localAliasStore.removeAll();
		localAliasesLoaded = false;
		getUserInfo();
	}

	var completeLogin = function(form, action) {
		getUserInfo();
	}

	// public space
	return {
		// public properties

		// public methods
		init: function() {
			Ext.BLANK_IMAGE_URL = '/js/ext/resources/images/default/s.gif';
			Ext.QuickTips.init();
			Ext.override(Ext.layout.TableLayout, {
				onLayout: function(ct, target) {
					var cs = ct.items.items, len = cs.length, c, i;
					if(!this.table) {
						target.addClass('x-table-layout-ct');
						this.table = target.createChild({
								tag: 'table',
								cls: 'x-table-layout',
								cellspacing: 0,
								cn: {
									tag: 'tbody'
								}
							},
							null,
							true
						);
					}
					this.renderAll(ct, target);
				}
			});
			getUserInfo();
		}
	};
}();

Ext.onReady(RubixConsulting.user.init, RubixConsulting.user);
