import * as fs from 'fs';
import * as path  from 'path';

export class FileHelper{
  public static get instance(){
    return new FileHelper();
  }

  writeToOneFile(targetFileUri:string,data:any){
    return new Promise((resolve,reject)=>{
      fs.writeFile(targetFileUri,data.code,'utf-8',(err)=>{
        if(err){
          reject(err);          
        }
        else{
          resolve(true);
        }
      });
    });
  }
  MakeDirIfNotAvailable(dir:string) {
    if (fs.existsSync(dir)) return;
    if (!fs.existsSync(path.dirname(dir))) {
        this.MakeDirIfNotAvailable(path.dirname(dir));
    }
    fs.mkdirSync(dir);
}
}