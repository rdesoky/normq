#!/usr/bin/env node

/**
 * Created by Ramy Eldesoky 4/7/2018
 */

var fs = require("fs");
var readline = require('readline');
var path = require('path');
var args = process.argv;

if( args.length < 3 ){
    console.log("Usage:\nnorq {csv_file_name} {out_field[text|plain|norm]} {from_line} {total_lines}")
    return;
}

var out = args.length > 3 ? args[3] : 'text';
var from = args.length > 4 ? parseInt(args[4]) : 0;
var lines = args.length > 5 ? parseInt(args[5]) : 0;


var fileName = path.resolve(process.argv[2]);

if(!fs.existsSync(fileName)){
    console.log(`Couldn't find the file: ${fileName}`);
    return;
}

var lineReader = readline.createInterface({
    input: fs.createReadStream(fileName)
});

var colNames = null;
var lineCounter = 0;

lineReader.on('line', function(line){
    if(!colNames){
        colNames = line.split(",");
    }
    else{
        var record = {};
        line.split(",").forEach((val,i) => {
            record[colNames[i]]=val;
        });

        // https://en.wikipedia.org/wiki/Arabic_script_in_Unicode
        //Remove Tashkeel
        record.plain=record.text.replace(
            /[\u0600-\u061f]|[\u064b-\u065e]|[\u0670]|[\u06d6-\u06ed]/g,
            ''
        );
        
        //Normalize similar characters
        record.norm = record.plain
            //Alef and Hamza
            .replace(/[\u0622\u0623\u0625]|[\ufe81\ufe82\ufe8d\ufe8e]/g ,"\u0627")
            //Lam-alef
            .replace(/[\ufef5-\ufefc]/g ,"\u0644\u0627")
            //Waw
            .replace(/[\u0676\u0624]/g ,"\u0648")
            //Haa
            .replace(/[\u0629\ufe93\ufe94]/g,"\u0647")
            //Yaa
            .replace(/[\u0626\u064a]|[\ufef1-\ufef4]/g ,"\u0649");
            //.replace(/ +/," ")//replace double space with one

        lineCounter++;
        
        if( lineCounter>from
            && ((lines==0)||(lineCounter<(from+lines))) ){
            console.log(record[out]);
        }
    }
});

