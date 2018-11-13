import Component from '@ember/component';
import $ from 'jquery';
import {computed} from '@ember/object';

export default Component.extend({
    tagName:"span",
    icon: "glyphicon glyphicon-file",
    multiple: false,
    titleResourceKey:'selectFile',
    title: computed('resource.language','titleResourceKey',function(){
        return this.resource.getResource(this.get('titleResourceKey'));
    }),
    classNames:"fileinput-button btn btn-sm btn-default",    
    classNameBindings:"class",
    humanReadableFileSize (size) {
        let  label = "";
        if (size === 0) {
            label = "0 KB";
        } else if (size && !isNaN(size)) {
            let  fileSizeInBytes = size;
            let  i = -1;
            do {
                fileSizeInBytes = fileSizeInBytes / 1024;
                i++;
            } while (fileSizeInBytes > 1024);

            let byteUnits = [' KB', ' MB', ' GB', ' TB', ' PB', ' EB', ' ZB', ' YB'];
            label += Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i];
        }
        return label;
    },
    readFile (fileToUpload,dataType, callback) {
        let fileObject = {                
            "name":  fileToUpload.name,
            "rawSize": fileToUpload.size,
            "type": fileToUpload.type,
            "size":this.humanReadableFileSize(fileToUpload.size)
        };
        if (fileToUpload.size < 30 * 1024 * 1024) {
            let reader = new FileReader();
            reader.onload = function (e) {
                var fileData = e.target.result;
                if(dataType == "base64String")
                    fileObject.data = fileData.substr(fileData.indexOf("base64,") + 7);
                else if(dataType == "text")
                    fileObject.data = fileData;
                callback(fileObject);
            };
            if(dataType=="text")
                reader.readAsText(fileToUpload);
            else if(dataType=="base64String")
                reader.readAsDataURL(fileToUpload);
        }
    },
    change(e) {
        let inputFiles = e.target.files;
        if (inputFiles.length < 1) {
            return;
        }
        var result = { element: e.target, files: [] };
        $.each(inputFiles,(index, inputFile)=>{
                var file = {
                    name: inputFile.name,
                    mimeType: inputFile.type,
                    size: inputFile.size,
                    lastModified: inputFile.lastModified,
                    lastModifiedDate: inputFile.lastModifiedDate,
                    readAsText: (resolve)=> {
                        this.readFile(inputFile,"text", fileObject=> {
                            resolve(fileObject.data);
                        });
                    },
                    readAsBase64String: (resolve)=> {
                        this.readFile(inputFile,"base64String", fileObject=> {
                            resolve(fileObject.data);
                        });
                    }
                };
                result.files.push(file);
            });
            if(result.files.length>0)
                this.set('title',result.files[0].name);
        this.sendAction('fileChanged', result);
        e.target.value = null;
    }
});