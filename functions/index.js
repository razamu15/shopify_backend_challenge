const functions = require("firebase-functions");
const admin = require("firebase-admin");
const vision = require('@google-cloud/vision');
const { Storage } = require('@google-cloud/storage');

admin.initializeApp();

const db = admin.firestore();
const storage = new Storage();
const client = new vision.ImageAnnotatorClient();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
exports.annotateImage = functions.storage.object().onFinalize(async event => {
    const object = event;
    const fileBucket = object.bucket;
    const filePath = object.name;
    const gcsPath = `gs://${fileBucket}/${filePath}`;

    let request = {
        image: {
            source: { imageUri: gcsPath }
        },
        features: [
            {
                type: "LABEL_DETECTION"
            }
        ]
    };
    let result = await client.annotateImage(request);

    // this is available becasuse firestore insert happens before bucket upload
    let fileRecord = await db.doc(`images/${filePath}`).update({keywords: result[0].labelAnnotations.map(ann => ann.description.toLowerCase())});
});

exports.deleteUploadedFile = functions.firestore
    .document('images/{imageID}')
    .onDelete((snap, context) => {
        // delete this
        let filePath = `gs://shopify-image-repo-f092c.appspot.com/${context.params.imageID}`
        // Create a reference to the file to delete
        let delFle = storage.bucket('shopify-image-repo-f092c.appspot.com')
            .file(`${context.params.imageID}`)
            .delete().then(() => {
                // File deleted successfully
                console.log("DELETED ", filePath);
            }).catch((error) => {
                // Uh-oh, an error occurred!
                console.log("paramteters ", context.params);
                console.log(error);
            });
    });