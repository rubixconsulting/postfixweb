Ext.namespace('RubixConsulting');

RubixConsulting.user = function() {
	// private variables
	var loginWindow, user, viewport, west, center;
	var domainGrid, removeDomainBtn, saveDomainBtn, revertDomainBtn, domainMask;

	var domainSm = new Ext.grid.CheckboxSelectionModel();
	var domainsLoaded = false;
	var removedDomains = new Array();

	var domainRecord = Ext.data.Record.create([
		{name: 'domain_id', type: 'int'},
		{name: 'domain',    type: 'string'}
	]);

	var domainStore = new Ext.data.JsonStore({
		url: 'data/domains.php',
		root: 'domains',
		fields: domainRecord
	});

	// private functions
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
					width: 150,
					minSize: 75,
					maxSize: 300,
					collapsible: true,
					id: 'west-panel',
					lines: false,
					buttonAlign: 'center',
					root: new Ext.tree.AsyncTreeNode({}),
					loader: new Ext.tree.TreeLoader({
						url: 'data/tree.php',
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
					autoScroll: true,
					id: 'center-panel',
					defaults: {
						bodyStyle: 'padding:15px',
					},
					//bbar: new Ext.StatusBar({
					//	id: 'statusbar'
					//}),
					items: [
						new Ext.Panel({
							id: 'user-info-panel',
							layout: 'table',
							defaults: {
								bodyStyle: 'padding-bottom:5px;padding-right:10px'
							},
							layoutConfig: {
								columns: 2
							},
							autoScroll: true,
							border: false,
							items: [
								{
									html: '<div style="text-align: center;"><img src="/images/rubix_consulting_medium.png" /></div>',
									border: false,
									colspan: 2
								},{
									html: '<b>Email Address</b>',
									border: false
								},{
									html: user.email,
									border: false
								},{
									html: '<b>Name</b>',
									border: false
								},{
									html: user.name,
									border: false
								},{
									html: '<b>Role</b>',
									style: 'padding-bottom:15px',
									border: false
								},{
									html: user.longrole,
									style: 'padding-bottom:15px',
									border: false
								}
							]
						}),
						new Ext.Panel({
							frame: false,
							id: 'change-password-panel',
							layout: 'anchor',
							autoScroll: true,
							items: [
								new Ext.form.FormPanel({
									title: 'Change Your Password',
									url: 'data/changePass.php',
									monitorValid: true,
									autoHeight: true,
									labelWidth: 125,
									width: 318,
									id: 'change-password-form',
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
									buttons: [{
										text: 'Change Password',
										formBind: true,
										handler: changePassword
									}]
								})
							]
						}),
						new Ext.Panel({
							id: 'manage-domains-panel',
							layout: 'anchor',
							autoScroll: true,
							items: [
								domainGrid = new Ext.grid.EditorGridPanel({
									width: 325,
									title: 'Email Domains',
									border: true,
									id: 'domain-grid',
									autoHeight: true,
									loadMask: true,
									autoExpandColumn: 'domain',
									clicksToEdit: 1,
									style: 'padding-bottom:15px',
									tbar: [
										new Ext.Toolbar.Button({
											text: 'Add New',
											handler: addDomain
										}),
										removeDomainBtn = new Ext.Toolbar.Button({
											text: 'Remove Selected',
											handler: removeSelectedDomains,
											disabled: true
										}),
										revertDomainBtn = new Ext.Toolbar.Button({
											text: 'Revert Changes',
											handler: revertDomains,
											disabled: true
										}),
										saveDomainBtn = new Ext.Toolbar.Button({
											text: 'Save Changes',
											handler: saveDomains,
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
								}), {
									html: '<small><b>Note:</b> you will not be able to select, edit or delete your own domain, '+user.domain+'</small>',
									border: false
								}
							]
						})
					]
				})
			]
		});
		west.on('load', function(treeloader, node) {
			new Ext.util.DelayedTask(function() {
				west.getNodeById('user-info').select();
			}, this).delay(0);
		}, this);
		west.getSelectionModel().on('selectionchange', clickTree, this);
		domainStore.on('update', function(store, record, operation) {
			saveDomainBtn.enable();
			revertDomainBtn.enable();
		}, this);
		domainStore.on('loadexception', loadException, this);
		domainSm.on('beforerowselect', function(selectionmodel, row, keep, record) {
			if(record.get('domain') == user.domain) {
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
		domainGrid.on('beforeedit', function(e) {
			if(e.record.get('domain') == user.domain) {
				return false;
			}
			return true;
		}, this);
	}

	var loadException = function(item, options, response, error) {
		var msg = 'Unknown Error';
		if(response && response.statusText) {
			msg = response.statusText;
		}
		showError(msg);
	}

	var addDomain = function() {
		domainGrid.stopEditing();
		domainStore.insert(0, new domainRecord({
			domain_id: 0,
			domain: ''
		}));
		domainGrid.startEditing(0, 1);
	}

	var removeSelectedDomains = function() {
		Ext.MessageBox.show({
			closable: false,
			buttons: Ext.MessageBox.YESNO,
			icon: Ext.MessageBox.QUESTION,
			title: 'Removing Domains',
			width: 450,
			msg: '<table><tr><td>Do you really want to remove these domains?</td></tr>'+
			     '<tr><td>All associated email address, aliases and forwarders will be deleted.</td></tr>'+
			     '<tr><td>All other domain changes will be saved as well.</td></tr></table>',
			fn: function(btn) {
				if(btn == 'yes') {
					doRemoveSelectedDomains();
				}
			}
		});
	}

	var doRemoveSelectedDomains = function() {
		selected = domainSm.getSelections();
		var removed = 0;
		for(var i = 0; i < selected.length; i++) {
			if(user.domain == selected[i].get('domain')) {
				showError('Can not delete domain:<br />'+user.domain+'<br />It will delete your account');
				continue;
			}
			removed++;
			if(selected[i].get('domain_id') != 0) {
				removedDomains.push(selected[i].get('domain_id'));
			}
			selected[i].commit();
			domainStore.remove(selected[i]);
		}
		if(removed > 0) {
			saveDomains();
		}
	}

	var saveDomains = function() {
		var addedDomains = new Array();
		var modifiedDomains = new Array();
		var modified = domainStore.getModifiedRecords();
		for(var i = 0; i < modified.length; i++) {
			if(modified[i].get('domain_id') == 0) {
				addedDomains.push(modified[i].getChanges().domain);
			} else {
				modifiedDomains.push(modified[i].get('domain_id') + ':' + modified[i].getChanges().domain);
			}
		}
		domainMask = new Ext.LoadMask(domainGrid.getEl(), {msg: 'Saving...'});
		domainMask.show();
		Ext.Ajax.request({
			url: 'data/domains.php',
			success: completeSaveDomains,
			failure: ajaxFailure,
			params: {
				mode: 'save',
				add: addedDomains.join(','),
				update: modifiedDomains.join(','),
				remove: removedDomains.join(',')
			}
		});
	}

	var completeSaveDomains = function() {
		domainMask.hide();
		domainStore.commitChanges();
		removedDomains = new Array();
		revertDomains();
	}

	var revertDomains = function() {
		saveDomainBtn.disable();
		revertDomainBtn.disable();
		loadDomains();
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

	var clickTree = function(selectionmodel, node) {
		center.getLayout().setActiveItem(node.id+'-panel');
		center.doLayout();
		if((node.id == 'manage-domains') && (!domainsLoaded)) {
			loadDomains();
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
					domainsLoaded = true;
				}
			},
			scope: this
		});
	}

	var parseUserInfo = function(response, options) {
		var data = Ext.util.JSON.decode(response.responseText);
		if(!data.success) {
			showLogin();
			return;
		} else {
			user = data.user;
			if(loginWindow) {
				loginWindow.hide();
				Ext.getCmp('loginUser').reset();
				Ext.getCmp('loginPass').reset();
				enablePage();
			}
			showPortal();
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
		Ext.getCmp('change-password-form').getForm().submit({
			success: changePasswordSuccess,
			failure: formFailure
		});
	}

	var changePasswordSuccess = function(form, action) {
		Ext.getCmp('oldpass').reset();
		Ext.getCmp('newpass').reset();
		Ext.getCmp('repnewpass').reset();
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
		Ext.Ajax.request({
			url: 'data/logout.php',
			success: completeLogout,
			failure: ajaxFailure
		});
	}

	var completeLogout = function() {
		viewport.destroy();
		user = null;
		domainStore.removeAll();
		domainsLoaded = false;
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
			Ext.QuickTips.init();
			getUserInfo();
		}
	};
}();

Ext.onReady(RubixConsulting.user.init, RubixConsulting.user);
