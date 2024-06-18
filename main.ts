import { createRequest } from 'chat';
import { App, CanvasNode, Editor, MarkdownView, Menu, MenuItem, Modal, Notice, Plugin } from 'obsidian';
import SettingsManager from 'settings';

export default class CanvasAiPlugin extends Plugin {
	settings: SettingsManager;

	async onload() {
		this.settings = new SettingsManager(this);
		await this.settings.loadSettings();
		this.settings.addSettingsTab();
		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('This is a notice!');
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new CanvasAiModal(this.app).open();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new CanvasAiModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		const workspace = this.app.workspace

		// 注册一个事件监听器，当用户在canvas上点击右键菜单时，多加一个菜单项
		this.registerEvent(
			workspace.on('canvas:node-menu', (menu: Menu, node: CanvasNode) => {
				console.log('触发事件 - canvas:node-menu');
				menu.addItem((item: MenuItem) => {
					item.setTitle('提交到Ai');
					item.onClick(async () => {
						// 提交prompt到ai服务，获取返回json数据
						createRequest(this.settings.getSetting('apiKey'),node.text)
							.then(resData => {
								// 初始的高度
								let height = node.height;
								let y = node.y + height + 10;
								console.log("node",node);
								console.log("choices", resData.choices);
								resData.choices.forEach((choice: unknown) => {
									node.canvas.createTextNode({
										pos: { x: node.x, y },
										text: choice.message.content,
										size: { width: node.width, height },
										focus: false,
									})
								})
							})
							.catch(error => {
								// 处理错误
								console.error(error);
							})
					});
				})
			})
		);

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}
}

class CanvasAiModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
