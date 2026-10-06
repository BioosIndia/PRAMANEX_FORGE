declare const bcrypt:{hash(password:string,rounds:number):Promise<string>;compare(password:string,hash:string):Promise<boolean>};export = bcrypt;
