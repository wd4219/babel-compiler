import * as vscode from 'vscode';

export class StatusBar {
  private static _statusBarItem: vscode.StatusBarItem;

  private static get statusBarItem() {
    if (!StatusBar._statusBarItem) {
      StatusBar._statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 200);
      this.statusBarItem.show();
    }
    return StatusBar._statusBarItem;
  }
  static init() {
    setTimeout(function () {
      StatusBar.notWatching();
    }, 1000);
  }

  static notWatching() {
    StatusBar.statusBarItem.text = `$(eye) Watch JS`;
    StatusBar.statusBarItem.command = 'babelCompiler.command.watchJS';
    StatusBar.statusBarItem.tooltip = 'live compilation of js';
  }
  static watching() {
    StatusBar.statusBarItem.text = `watching...`;
    StatusBar.statusBarItem.command = 'babelCompiler.command.stopWatchJS';
    StatusBar.statusBarItem.tooltip = 'stop live compilation of js';
  }
  static dispose() {
    StatusBar.statusBarItem.dispose();
  }
}