import React, { useState } from "react";
import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/storage';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  // your config
  apiKey: "AIzaSyDp7TOhkq1e3DWlVFIeuFWsAZoCeGxiris",
  authDomain: "shopify-image-repo-f092c.firebaseapp.com",
  projectId: "shopify-image-repo-f092c",
  storageBucket: "shopify-image-repo-f092c.appspot.com",
  messagingSenderId: "446892391803",
  appId: "1:446892391803:web:a607144cef9038163a91de",
  measurementId: "G-TE5H6F92C2"
})

const auth = firebase.auth();

function App() {
  const [files, setFiles] = useState({});
  const [privacy, setPrivacy] = useState("public")
  const [user] = useAuthState(auth);

  function addImage(img, pri) {
    let recordInsert = firebase.firestore().collection('images').add({
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid: auth.currentUser.uid,
      url: `https://storage.googleapis.com/shopify-image-repo-f092c.appspot.com/${img.name}`,
      pivacy: pri,
    });
    let fileUpload = firebase.storage().ref().child(img.name).put(img);
    Promise.all([recordInsert, fileUpload]).then(([firestoreRes, bucketRes]) => {
      console.log(firestoreRes);
      console.log(bucketRes);
      console.log('DONEDO');
    });
  }

  function fileChange(e) {
    setFiles(e.target.files);
  }

  function formSubmit(e) {
    e.preventDefault();
    for (let i = 0; i < files.length; i++) {
      addImage(files[i], privacy);
    }
  }

  return (
    <div className="App">
      {user ?
        <div>
          <SignOut />
          <form encType="multipart/form-data" onSubmit={formSubmit}>
            <input onChange={fileChange} name="images" type="file" multiple />
            
            <div onClick={e => {setPrivacy("public")}}>
              <input type="radio" name="privacy" value="public" checked={privacy === "public" ? "checked" : null} />
              <label for="public">Public</label>
            </div>
            
            <div onClick={e => setPrivacy("private")}>
              <input type="radio" name="privacy" value="private" checked={privacy === "private" ? "checked" : null} />
              <label for="private">Private</label>
            </div>
            <button type="submit">Go!</button>
          </form>
          <img style={{ width: '200px', height: '200px' }} src="https://storage.googleapis.com/shopify-image-repo-f092c.appspot.com/beach.jpg" />
          
        </div>
        : <SignIn />}
    </div>
  );
}

function SignIn() {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
      <p>Do not violate the community guidelines or you will be banned for life!</p>
    </>
  )

}

function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
  )
}


export default App;
