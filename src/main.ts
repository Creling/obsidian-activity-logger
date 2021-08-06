/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/*
 * @Author: Creling
 * @Date: 2021-08-03 10:04:10
 * @LastEditors: Creling
 * @LastEditTime: 2021-08-05 18:20:32
 * @Description: file content
 */
import {
  Plugin,
  MarkdownView,
  EditorPosition,
  Editor,
} from "obsidian";

import ActivityLoggerSettingTab from "./settings";

interface ActivityLoggerSettings {
  template: string;
  startLine: string;
  endLine: string;
}

const DEFAULT_SETTINGS: ActivityLoggerSettings = {
  template: `CreatedFiles

- [[$createdFiles]]

DeletedFiles

- [[$deletedFiles]]

ModifiedFiles

- [[$modifiedFiles]]

`,
  startLine: "--start--",
  endLine: "--end--",
};

export default class ActivityLogger extends Plugin {
  settings: ActivityLoggerSettings;
  private data: { [index: string]: string[]; };
  private regexs: { [index: string]: RegExp; } = {
    "createdFiles": /(?<=\n)[\S ]*\$createdFiles[\S ]*\n/m,
    "deletedFiles": /(?<=\n)[\S ]*\$deletedFiles[\S ]*\n/m,
    "modifiedFiles": /(?<=\n)[\S ]*\$modifiedFiles[\S ]*\n/m,
  };

  private getEditor() {
    const mdView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (mdView) {
      return mdView.editor;
    } else {
      return null;
    }
  }

  async onload() {
    console.log("loading plugin");
    await this.loadSettings();

    this.data = JSON.parse(window.localStorage.getItem(`ActivityLogger-${this.app.vault.getName()}`))
    const temp = this.getDate()
    if (!this.data || this.data.date[0] != temp) {
      this.data = {
        "date": [temp],
        "createdFiles": [] as string[],
        "deletedFiles": [] as string[],
        "modifiedFiles": [] as string[]
      }
    }

    this.addSettingTab(new ActivityLoggerSettingTab(this.app, this));

    this.addCommand({
      id: "insert-logs",
      name: "Insert Logs",
      callback: () => null,
      checkCallback: (checking: boolean) => {
        const leaf = this.app.workspace.activeLeaf;
        if (leaf) {
          if (!checking) {
            this.insertLogs()
          }
          return true
        }
        return false
      }
    })

    this.app.workspace.onLayoutReady(() => {

      this.registerEvent(this.app.vault.on('modify', params => {
        this.saveLogs(params.path, "modifiedFiles")
      }));

      this.registerEvent(this.app.vault.on('delete', params => {
        this.saveLogs(params.path, "deletedFiles")
      }));

      this.registerEvent(this.app.vault.on('create', (params) => {
        console.log("create", params.path)
        this.saveLogs(params.path, "createdFiles")
      }));

    })
  }

  saveLogs(path: string, type: string) {
    const temp = this.getDate();
    
    if (temp == this.data.date[0]) {
      if (this.data[type].indexOf(path) == -1) {
        this.data[type].push(path)
      }
    }
    else {
      this.data.date[0] = temp;
      this.data.createdFiles = [];
      this.data.modifiedFiles = [];
      this.data.deletedFiles = [];
      this.data[type].push(path)
    }

    window.localStorage.setItem(`ActivityLogger-${this.app.vault.getName()}`, JSON.stringify(this.data))
  }

  /**
   * @return "YYYY-MM-DD"
   */
  getDate() {
    const temp = new Date();
    const data = "{0}-{1}-{2}".format(temp.getFullYear().toString(), (temp.getMonth() + 1).toString(), temp.getDate().toString())
    return data
  }

  getInsertLocation(editor: Editor): { [index: string]: EditorPosition } {

    const linCount = editor.lineCount();
    const loc: { [index: string]: EditorPosition } = { "begin": { line: -1, ch: -1 }, "end": { line: -1, ch: -1 } };

    let i = 0;
    for (i = 0; i < linCount; ++i) {
      if (editor.getLine(i) === this.settings.startLine) {
        loc["begin"]["line"] = i + 1;
        loc["begin"]["ch"] = 0;
        break;
      }
    }

    i++;

    for (i; i < linCount; ++i) {
      if (editor.getLine(i) === this.settings.endLine) {
        loc["end"]["line"] = i;
        loc["end"]["ch"] = 0;
        break;
      }
    }

    return loc;
  }

  insertLogs() {
    let template = this.settings.template
    template = this.dealWithTemplates(template, "createdFiles")
    template = this.dealWithTemplates(template, "deletedFiles")
    template = this.dealWithTemplates(template, "modifiedFiles")
    console.log(template)

    const editor = this.getEditor();
    const insertLoc = this.getInsertLocation(editor)
    console.log(insertLoc)
    if (insertLoc["begin"]["line"] == -1 || insertLoc["end"]["line"] == -1) {
      const curLoc = editor.getCursor()
      const text = "{0}\n{1}\n{2}".format(this.settings.startLine, template, this.settings.endLine)
      editor.replaceRange(text, curLoc, curLoc)
    }
    else {
      editor.replaceRange(template, insertLoc["begin"], insertLoc["end"])
    }
  }

  /**
   * @description: replace placeholders in template with filepaths
   * @param: type: "createdFiles" | "deletedFiles" | "modifiedFiles"
   * @returns: template with filepaths
   */
  dealWithTemplates(template: string, type: string): string {
    const filePaths = this.data[type]
    const filenamePlaceHolderRegex = this.regexs[type]
    const result = filenamePlaceHolderRegex.exec(template)
    if (result) {
      const filenamePlaceHolder = result[0]
      if (filePaths.length) {
        const fileCount = filePaths.length
        template = template.replace(filenamePlaceHolder, filenamePlaceHolder.repeat(fileCount))
        for (const filePath of filePaths) {
          template = template.replace(`$${type}`, filePath)
        }
      }
      else {
        template = template.replace(filenamePlaceHolder, "\n")
      }
    }
    return template
  }

  onunload() {
    console.log("unloading plugin");
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
