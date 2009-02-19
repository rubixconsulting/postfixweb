Ext.namespace('RubixConsulting');

RubixConsulting.user = function() {
	// private variables
	var loginWindow, user, viewport, west, center, infoPanel;
	var domainGrid, domainMask, addUserWindow, resetPasswordWindow;
	var removeDomainBtn;
	var addUserBtn, removeUserBtn, saveUserBtn, revertUserBtn, resetPassBtn;
	var addUserUsername, addUserDomain, addDomainBtn, addDomainDomain;
	var resetPassPassword, userMask, addDomainWindow;

	var domainSm       = new Ext.grid.CheckboxSelectionModel();
	var userSm         = new Ext.grid.CheckboxSelectionModel();
	var domainsLoaded  = false;
	var usersLoaded    = false;
	var removedUsers   = new Array();

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

	var domainStore = new Ext.data.JsonStore({
		url: 'data/domains.php',
		root: 'domains',
		fields: domainRecord
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
					width: 185,
					minSize: 75,
					maxSize: 300,
					collapsible: true,
					id: 'west-panel',
					lines: false,
					buttonAlign: 'center',
					root: new Ext.tree.AsyncTreeNode({}),
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
							autoExpandColumn: 'domain',
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
							store: domainStore,
							sm: domainSm,
							cm: new Ext.grid.ColumnModel([
								domainSm, {
									header: 'Domain',
									sortable: true,
									dataIndex: 'domain',
									id: 'domain',
									editor: new Ext.form.TextField({
										allowBlank: false
									})
								}
							]),
							iconCls: 'icon-grid'
						}),
						userGrid = new Ext.grid.EditorGridPanel({
							width: 570,
							border: true,
							id: 'manage-users-panel',
							autoScroll: true,
							loadMask: true,
							autoExpandColumn: 'email',
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
									id: 'email',
									editor: false
								},{
									header: 'Name',
									sortable: true,
									dataIndex: 'name',
									id: 'name',
									editor: new Ext.form.TextField({
										allowBlank: false
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
		west.on('load', function(treeloader, node) {
			new Ext.util.DelayedTask(function() {
				west.getNodeById('user-info').select();
			}, this).delay(0);
		}, this);
		west.getSelectionModel().on('selectionchange', clickTree, this);
		userStore.on('update', function(store, record, operation) {
			saveUserBtn.enable();
			revertUserBtn.enable();
		}, this);
		domainStore.on('loadexception', loadException, this);
		userStore.on('loadexception', loadException, this);
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
		userGrid.on('beforeedit', function(e) {
			if(e.record.get('email') == user.email) {
				return false;
			}
			return true;
		}, this);
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
		disablePage('Adding new domain...', 'Please wait');
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
		disablePage('Resetting password...', 'Please wait');
		Ext.getCmp('reset-password-form').getForm().submit({
			success: resetPasswordSuccess,
			failure: formFailure,
			params: {
				user: userSm.getSelections()[0].get('email')
			}
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
		loadDomains();
		getUserInfo();
	}

	var addDomainSuccess = function(form, action) {
		hideAddDomainWindow();
		loadDomains();
		getUserInfo();
	}

	var resetPasswordSuccess = function(form, action) {
		hideResetPasswordWindow();
		showInfo('Password reset', 'Password was reset successfully');
	}

	var addUserSuccess = function(form, action) {
		hideAddUserWindow();
		revertUsers();
		enablePage();
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

	var removeSelectedUsers = function() {
		Ext.MessageBox.show({
			closable: false,
			buttons: Ext.MessageBox.YESNO,
			icon: Ext.MessageBox.QUESTION,
			title: 'Remove Users?',
			width: 450,
			msg: '<table><tr><td>Do you really want to remove these users?</td></tr>'+
			     '<tr><td>All associated aliases and forwarders will also be deleted.</td></tr>'+
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
		}
		if(removeDomains.length == 0) {
			return;
		}
		disablePage('Removing...', 'Please wait');
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

	var completeSaveUsers = function() {
		userMask.hide();
		userStore.commitChanges();
		removedUsers = new Array();
		revertUsers();
	}

	var revertUsers = function() {
		saveUserBtn.disable();
		revertUserBtn.disable();
		loadUsers();
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
		center.getLayout().setActiveItem(node.id+'-panel');
		center.doLayout();
		if((node.id == 'manage-domains') && (!domainsLoaded)) {
			loadDomains();
		} else if((node.id == 'manage-users') && (!usersLoaded)) {
			loadUsers();
		}
	}

	var loadDomains = function() {
		domainStore.removeAll();
		domainsLoaded = false;
		domainStore.load({
			params: {
				mode: 'load'
			},
			callback: function(r, options, success) {
				if(success) {
					enablePage();
					domainsLoaded = true;
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
					labelWidth: 125,
					defaultType: 'textfield',
					defaults: {
						width: 150,
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
		// TODO clear all necessary variables here
		domainStore.removeAll();
		domainsLoaded = false;
		userStore.removeAll();
		usersLoaded = false;
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
