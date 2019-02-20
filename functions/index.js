const functions = require('firebase-functions');
const {Storage} = require('@google-cloud/storage');
const admin = require("firebase-admin");
const path = require('path');
const os = require('os');
const fs = require('fs');
const gs = require('gs');

admin.initializeApp();

exports.createPDFThumbnail = functions.https.onCall((data, context) => {

    const {file, folder, projectId, bucketName} = data;
    const fileName = path.basename(file);
    const filePath = folder+"/"+file;
    const newName = path.basename(file, '.pdf') + '.png';

    const tempFilePath = path.join(os.tmpdir(), fileName);
    const tempNewPath = path.join(os.tmpdir(), newName);    
    const destinationPath = folder+"/"+newName;

    const tempNewPathThumbnail = path.join(os.tmpdir(), "thumb_"+newName);
    const destinationThumbnailPath = folder+"/thumb_"+newName;

    if (fileName.endsWith('.png')) return false;
    if (!fileName.endsWith('.pdf')) return false;

    const storage = new Storage({
      projectId: projectId,
    });

    const bucket = storage.bucket(bucketName)
    const bucketFile = bucket.file(filePath)

    return bucketFile.download({
      destination: tempFilePath
    }).then(() => {
      console.log('Image downloaded locally to', tempFilePath);
      return convert(tempNewPath, tempFilePath, "high").then(() => {
        // Uploading the thumbnail.
        return bucket.upload(tempNewPath, {destination: destinationPath});
      })
    }).then(() => {
      console.log('HD created!');
      return convert(tempNewPathThumbnail, tempFilePath, "low").then(() => {
        // Uploading the thumbnail.
        return bucket.upload(tempNewPathThumbnail, {destination: destinationThumbnailPath});
      }).then(() => {
        // Once the thumbnail has been uploaded delete the local file to free up disk space.
        fs.unlinkSync(tempNewPath);
        fs.unlinkSync(tempFilePath);
        fs.unlinkSync(tempNewPathThumbnail);
        return {preview: destinationPath, thumbnail: destinationThumbnailPath}
      }).catch((err) => {
        return err;
      });
    }).catch((error) => {
      console.log(error)
    });

})

function convert(output, input, quality) {

  let _quality = quality || "high";
  let optionDef = (_quality === "high") ? '-r300' : '-r72';
  let device = (_quality === "high") ? 'png16m' : 'png16m';

  return new Promise( (resolve, reject) => {
    gs()
      .batch()
      .nopause()
      .option(optionDef)
      .option('-dDownScaleFactor=2')
      .executablePath('lambda-ghostscript/bin/./gs')
      .device(device)
      .output(output)
      .input(input)
      .exec((err, stdout, stderr) => {
          if (!err) {
            console.log('gs executed w/o error');            
            console.log('stdout',stdout);            
            console.log('stderr',stderr);            
            resolve();
          } else {
            console.log('gs error:', err);
            reject(err);
          }
      });
  })
}