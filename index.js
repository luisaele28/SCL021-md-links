#!/usr/bin/env node
const fs = require("fs"); 
const path = require("path"); 
const parseMD = require("parse-md").default;
const fetch = require("node-fetch");
const emoji = require("node-emoji");

function MdLink(ruta) {
  //console.log("hello", ruta);

  //comprueba si la ruta existe
  //const routeExist = () => fs.existsSync(ruta);
  //console.log(routeExist());

  //se comprueba si es archivo
  const routeType = (source) => {
    if (source.isFile() === true) {
      return true;
    }
    return false;
  };
  //lee archivos de tu ruta principal
  const routeFiles = fs.statSync(ruta);
  console.log("es archivo? " + routeType(routeFiles));
  //console.log(routeIsAFile);


  //lee los archivos de la ruta relativa
  const dir = fs.readdirSync(ruta, { encoding: "utf8", flag: "r" });
  //console.log("estos son los archivos del directorios" + dir);
  //console.log(dir);

  //filtra archivos md
  let array = [];
  function rute(dir) {
    return (array = dir.filter((archivo) => {
      return path.extname(archivo) === ".md";
      //console.log(array);
    }));
  }
  //leer archivos md
  const arrayMd = rute(dir);
  function readMD(paths) {
    //console.log("ejecutando path");
    paths.forEach((element) => {
      const data = fs.readFileSync(element, { encoding: "utf8", flag: "r" });
      //console.log("leyendo", data);
    });
  }
  readMD(arrayMd);
  //console.log(rute(dir));

  //verifica si Existe los links ?
  const fileContents = fs.readFileSync(process.argv[2]
    , "utf8");
  const { metadata, content } = parseMD(fileContents);
  //console.log(metadata);
  //console.log(content);

  //lee los links
  const Url =
    /(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/gim;
  function FindLinks(content) {
    return content.match(Url);
  }
  const arrUrl = FindLinks(fileContents);

  const transformed = arrUrl.map((item) => {
    // return item.toUpperCase()
    //return fetch(item)
  });

  //console.log(transformed)
 //promesa y contador de links
 const exitos = [];
 const errores = [];
 let validos;
 let broken;
 console.log(arrUrl);
 const arrfetch = arrUrl.map((url) => {
   return fetch(url)
 });
 Promise.allSettled(arrfetch)
   .then((result)=>{
   result.forEach((res)=>{
     if(res.status === "fulfilled"){
      if(res.value.status === 200) {
        console.log("Exito ", res.value?.status, res.value?.url);
      }else {console.log("Error ", res.value?.status, res.value?.url);}
       exitos.push({status: res.value?.status, url : res.value?.url});
     } else {
       console.log("Error", res.reason);
       errores.push({error: res.reason})
      }
      validos = exitos.filter (url => url.status === 200)
      //console.log(validos.length);
      broken = exitos.filter (url => url.status !== 200)
      //console.log(broken);
   });
 }).finally(() => {
   console.log("-------------------------------------------")
   console.log("| total exito : ", validos.length, (emoji.get('innocent')), " | ","total errores: ", broken.length, (emoji.get('imp')), " | ")
   console.log("-------------------------------------------")
   console.log("|     Detalle Exito : ", validos.length, emoji.get('heart'))
   console.log("-------------------------------------------")
   exitos.forEach((exito) => console.log(`status : ${exito.status}  url : ${exito.url}`))
 });
}
MdLink("./");