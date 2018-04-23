import * as fs from 'fs';

export class FileHelper{
  public static get instance(){
    return new FileHelper();
  }

  writeToOneFile(targetFileUri:string,data:any){
    return new Promise<any>((resolve,reject)=>{
      fs.writeFile(targetFileUri,data,'utf-8',(err)=>{
        if(err){
        reject(err);          
        }
        else{
          resolve(true);
        }
      });
    });
  }
}