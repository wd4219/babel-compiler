import {transformFile} from 'babel-core';


export class BabelCompile{
  static get instance() {
    return new BabelCompile();
  }
  compileOne(jsPath:string,options:Object){
    return new Promise((resolve,reject)=>{
      transformFile(jsPath,options,function(err,result){
        if(err){
          reject(err);
        }
        else{
          resolve(result);
        }
      });
    })
  }
}