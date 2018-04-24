import * as vscode from 'vscode';
import { StatusBar } from './statusBar';
import { BabelCompile } from './BabelCompile';
import { FileHelper } from './FileHelper';
import * as glob from 'glob';
import * as path from 'path';
import { Helper, IFormat } from './Helper';

export interface FilePath{
  filePaths:string
}

export class DealModel {

  isWatching: boolean;

  constructor() {
    StatusBar.init();
    this.isWatching = false;
  }

  static get basePath(): string {
    let activeTextEditor:any = '';
    if(vscode.window){
      activeTextEditor = vscode.window.activeTextEditor;
    }
    return vscode.workspace.rootPath || path.basename(activeTextEditor.document.fileName);
  }

  compileAllFiles(watchModel = true) {
    if (this.isWatching) {
      vscode.window.showInformationMessage('already watching...');
      return;
    }
    StatusBar.watching();
    this.transformAll().then(() => {
      if (!watchModel) {
        this.isWatching = true;
      }
      this.toggleStatusUI();
    }).catch(e => {
      if (e.fileUri) {
        vscode.window.showErrorMessage(e.fileUri + '文件有语法错误');
      }
      if (!watchModel) {
        this.isWatching = true;
      }
      this.toggleStatusUI();
    });
  }
  stopWatching() {
    if (this.isWatching) {
      this.toggleStatusUI();
    }
  }
  private generateBabelJsUri(filePath: string, savePath: string) {
    if (savePath) {
      try {
        let workspaceRoot:any = vscode.workspace.rootPath;
        let generatedUri = null;
        if (savePath.startsWith('~'))
          generatedUri = path.join(path.dirname(filePath), savePath.substring(1));
        else
          generatedUri = path.join(workspaceRoot, savePath);
        FileHelper.instance.MakeDirIfNotAvailable(generatedUri);
        filePath = path.join(generatedUri, path.basename(filePath));
      }
      catch (err) {
        console.log(err);
        throw Error('Something Went Wrong.');
      }
    }
    let BabelJsUri = filePath.substring(0, filePath.length);
    return BabelJsUri;
  }
  async compileOnSave() {
    if (!this.isWatching) {
      return;
    }
    const { activeTextEditor } = vscode.window;
    let fileUri = '';
    if (activeTextEditor) {
      fileUri = activeTextEditor.document.fileName;
    }
    if (fileUri.endsWith('.js')) {
      this.transformAll().catch(e => {
        if (e.fileUri) {
          vscode.window.showErrorMessage(e.fileUri + '文件有语法错误');
        }
      });
    }
  }
  private transformJs(fileUri: string) {
    return new Promise((resolve, reject) => {
      let options = Helper.getConfigSettings<IFormat>('options');
      BabelCompile.instance.compileOne(fileUri, JSON.parse(JSON.stringify(options.babel))).then((result) => {
        FileHelper.instance.writeToOneFile(this.generateBabelJsUri(fileUri,options.savePath), result).catch(err => {
          reject(err);
        }).then(() => {
          resolve(true);
        });
      }).catch(err => {
        reject({
          err: err,
          fileUri: fileUri
        });
      });
    })

  }
  getJsFiles(queryPattern = "**/*.js") {
    let ignore = Helper.getConfigSettings<string[]>('excludeList');
    let options = {
      ignore: ignore,
      mark: true,
      cwd: DealModel.basePath,
    }
    return new Promise((resolve) => {
      glob(queryPattern, options, function (err, files: string[]) {
        let filePaths: string[] = [];
        if (err) {
          console.log('出错了');
        }
        else {
          filePaths= files.map(file => path.join(DealModel.basePath, file));
        }
        resolve(filePaths||[]);
      });
    })
  }
  private findAllJs(callback:any){
    this.getJsFiles().then(files => callback(files));
  }
  transformAll() {
    return new Promise((resolve, reject) => {
      this.findAllJs((files:string[]) => {
        let promise:any = [];
        files.forEach((file:string) => {
          promise.push(this.transformJs(file));
        });
        Promise.all(promise).catch((e) => {
          reject(e);
        }).then(() => {
          resolve(true);
        });
      });
    });
  }
  private toggleStatusUI() {
    this.isWatching = !this.isWatching;
    if (!this.isWatching) {
      StatusBar.notWatching();
    }
    else {
      StatusBar.watching();
    }
  }
} 