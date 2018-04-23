import * as vscode from 'vscode';
import { StatusBar } from './statusBar';
import { BabelCompile } from './BabelCompile';
import { FileHelper } from './FileHelper';
import * as glob from 'glob';
import * as path from 'path';
import { resolve } from 'url';
import { REFUSED } from 'dns';

export class DealModel {

  isWatching:boolean;

  constructor() {
    StatusBar.init();
    this.isWatching = false;
  }

  static get basePath():string{
    return vscode.workspace.rootPath || path.basename(vscode.window.activeTextEditor.document.fileName);
  }

  compileAllFiles(watchModel = true) {
    if(this.isWatching){
      vscode.window.showInformationMessage('already watching...');
      return;
    }
    StatusBar.watching();
    this.transformAll().then(()=>{
      if(!watchModel){
        this.isWatching = true;
      }
      this.toggleStatusUI();
    });
  }
  stopWatching() {
    if(this.isWatching){
      this.toggleStatusUI();
    } 
  }

  async compileOnSave() {
    if(!this.isWatching){
      return;
    }
    const { activeTextEditor } = vscode.window;
    let fileUri = '';
    if (activeTextEditor) {
      fileUri = activeTextEditor.document.fileName;
    }
    if (fileUri.endsWith('.js')) {
      this.transformAll();
    }
  }
  private transformJs(fileUri:string){
    return new Promise((resolve,reject)=>{
      BabelCompile.instance.compileOne(fileUri, { "presets": ["env"] }).then((result) => {
        FileHelper.instance.writeToOneFile(fileUri.replace('.js', '-babel.js'), result.code).then(()=>{
          resolve(true);
        }).catch(err => {
          reject(err);
          console.log(err);
        });
      });
    })
    
  }
  getJsFiles(queryPattern = "**/*.js") {
    let options = {
      ignore: [
        "**/node_modules/**",
        ".vscode/**"
      ],
      mark: true,
      cwd: DealModel.basePath,
    }
    return new Promise((resolve)=>{
      glob(queryPattern, options, function (err, files:string[]) {
        if(err){
          console.log('出错了');
        }
        else{
          let filePaths: string[] = files.map(file => path.join(DealModel.basePath, file));
          resolve(filePaths || []);
        }
      });
    })
  }

  transformAll(){
    return new Promise((resolve)=>{
      this.getJsFiles().then((files:string[])=>{
        let promise = [];
        files.forEach((file)=>{
          promise.push(this.transformJs(file));
        });
        Promise.all(promise).then((e)=>{
          resolve(e)});
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