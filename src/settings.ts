/*
 * @Author: Creling
 * @Date: 2021-08-04 14:18:43
 * @LastEditors: Creling
 * @LastEditTime: 2021-08-04 14:22:11
 * @Description: file content
 */
import {
    App,
    PluginSettingTab,
    Setting,
} from 'obsidian';

import ActivityLogger from './main'

export default class ActivityLoggerSettingTab extends PluginSettingTab {
    plugin: ActivityLogger;
    constructor(app: App, plugin: ActivityLogger) {
        super(app, plugin);
        this.plugin = plugin;
    }
    display(): void {
        const { containerEl } = this;
        containerEl.empty();
        new Setting(containerEl)
            .setName("Start Line")
            .setDesc("")
            .addText((text) =>
                text
                    .setValue(this.plugin.settings.startLine)
                    .onChange(async (value) => {
                        this.plugin.settings.startLine = value;
                        await this.plugin.saveSettings();
                    })
            );
        new Setting(containerEl)
            .setName("End Line")
            .setDesc("")
            .addText((text) =>
                text
                    .setPlaceholder("")
                    .setValue(this.plugin.settings.endLine)
                    .onChange(async (value) => {
                        this.plugin.settings.endLine = value;
                        await this.plugin.saveSettings();
                    })
            );
        new Setting(containerEl)
            .setName("Template")
            .setDesc("")
            .addTextArea((text) => {
                text
                    .setValue(this.plugin.settings.template)
                    .onChange(async (value) => {
                        if (!value.endsWith("\n"))
                            value += "\n";
                        this.plugin.settings.template = value;
                        await this.plugin.saveSettings();
                    })
                text.inputEl.rows = 5
                text.inputEl.cols = 40
            }
            );
    }
}