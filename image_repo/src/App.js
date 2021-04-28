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
  const [user] = useAuthState(auth);

  function fileChange(e) {
    setFiles(e.target.files);
  }

  function fileUpload(e) {
    e.preventDefault();
    console.log("hehe", files);
    let storage = firebase.storage().ref();
    let img_ref = storage.child(files[0].name);
    img_ref.put(files[0]).then((snapshot) => {
      console.log(snapshot);
      console.log('Uploaded a blob or file!');
    });
  }

  return (
    <div className="App">
      {user ?
      <div>
        <form encType="multipart/form-data" onSubmit={fileUpload}>
          <input onChange={fileChange} name="images" type="file" multiple />
          <button type="submit">Go!</button>
        </form>
        <img style={{width:'200px', height:'200px'}} src="https://storage.googleapis.com/shopify-image-repo-f092c.appspot.com/beach.jpg" />
        <SignOut />
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
