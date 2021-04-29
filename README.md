# shopify_backend_challenge

<h1>Hi!</h1>
          <p>This is the shopify fall 2021 developer intern challende.</p>
          <h2>App Overview</h2>
          <p>This is a JAM Stack app made with React as a front end using serverless firebase cloud functions for some processing tasks.
          <a href="https://github.com/razamu15/shopify_backend_challenge">Link to Github Repo</a><br />
          It uses Google OAuth through firestore and the images are uploaded to google cloud storage bucket, records of uploaded images
          are stored in cloud firestore.</p>
          <p><strong>Note:</strong> When an image is uploaded, the cloud function is automatically
          triggered in firebase and it uses google cloud vision api to get the entities in that image and updates the corresponding record
          in firestore to facilitate search</p>




functions refs:
https://github.com/firebase/functions-samples/blob/master/vision-annotate-images/functions/src/index.ts
https://gist.github.com/joaobiriba/aa1b0d20ce1d3cfa614fb8f2e9275067
https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/master/functions/imagemagick/index.js
https://cloud.google.com/functions/docs/tutorials/imagemagick