# backend_challenge
<!-- This is the shopify fall 2021 developer intern challende.<br> -->
Deployed here: https://projectstonks.me

<h2>App Overview</h2>
          <p>This is a JAM Stack app made with React as a front end using serverless firebase cloud functions for some processing tasks.
          <a href="https://github.com/razamu15/shopify_backend_challenge">Link to Github Repo</a><br />
          It uses Google OAuth through firestore and the images are uploaded to google cloud storage bucket, records of uploaded images
          are stored in cloud firestore.</p>
          <p><strong>Note:</strong> When an image is uploaded, the cloud function is automatically
          triggered in firebase and it uses google cloud vision api to get the entities in that image and updates the corresponding record
          in firestore to facilitate search</p>

<h2>Instructions</h2>
        <h3>PLEASE NOTE:</h3> the app can handle bulk upload of images but I am using a live billing account for firebase and google cloud 
            <strong>so do not upload more than a maximum of 50 images please.</strong>
            <br>
        <ol>
            <li> sign in with a google account. this is only used to differentiate between which users uploaded which images and nothing else. 
            If you dont wanna use your own use the following:
                <ul><li>email: fakernamemanz@gmail.com</li><li>password: pokemonindigo</li></ul>
            <li> you will see a form to upload images and 3 tabs to switch between public images, private images and a search tab.
            

