import CanvasAiPlugin from "main";
import { PluginSettingTab, App, Setting } from "obsidian";

export interface CanvasAiPluginSettings {
  apiKey: string;
}

export const DEFAULT_SETTINGS: Partial<CanvasAiPluginSettings> = {
  apiKey: ''
}

export class CanvasAiSettingTab extends PluginSettingTab {
  settingsManager: SettingsManager

  constructor(plugin: CanvasAiPlugin, settingsManager: SettingsManager) {
    super(plugin.app, plugin)
    this.settingsManager = settingsManager
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName('API keys')
      .setDesc('It\'s a secret')
      .addText(text => text
        .setPlaceholder('Enter your API keys')
        .setValue(this.settingsManager.getSetting("apiKey"))
        .onChange(async (value) => {
          await this.settingsManager.setSetting({ apiKey: value });
        }));
  }
}

export default class SettingsManager {
  static SETTINGS_CHANGED_EVENT = 'canvas-ai:settings-changed'

  private plugin: CanvasAiPlugin
  private settings: CanvasAiPluginSettings
  private settingsTab: CanvasAiSettingTab

  constructor(plugin: CanvasAiPlugin) {
    this.plugin = plugin
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.plugin.loadData());
    this.plugin.app.workspace.trigger(SettingsManager.SETTINGS_CHANGED_EVENT)
  }

  async saveSettings() {
    await this.plugin.saveData(this.settings)
  }
  getSetting<T extends keyof CanvasAiPluginSettings>(key: T): CanvasAiPluginSettings[T] {
    return this.settings[key]
  }

  async setSetting(data: Partial<CanvasAiPluginSettings>) {
    this.settings = Object.assign(this.settings, data)
    await this.saveSettings()
    this.plugin.app.workspace.trigger(SettingsManager.SETTINGS_CHANGED_EVENT)
  }

	// This adds a settings tab so the user can configure various aspects of the plugin
  addSettingsTab() {
    this.settingsTab = new CanvasAiSettingTab(this.plugin, this)
    this.plugin.addSettingTab(this.settingsTab)
  }
}