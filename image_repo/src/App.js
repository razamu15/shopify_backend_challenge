import React, { useState } from "react";
import { nanoid } from 'nanoid'
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

  const [view, setView] = useState("public");

  async function addImage(img, pri) {
    // first upload to bucket then wait to insert into db bcz ow db insert
    // happens faster and the firestore data subscription updates page with
    // a non existant cloud bucket object url
    let docID = nanoid();
    await firebase.storage().ref().child(docID).put(img);
    await firebase.firestore().collection('images').doc(docID).set({
      id: docID,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid: user.uid,
      url: `https://storage.googleapis.com/shopify-image-repo-f092c.appspot.com/${docID}`,
      privacy: pri,
    });
  }

  function fileChange(e) {
    setFiles(e.target.files);
  }

  function formSubmit(e) {
    e.preventDefault();
    Array.from(files).map(file => addImage(file, privacy));
  }

  function changeView(e) {
    setView(e.currentTarget.id);
    document.querySelectorAll('.tab').forEach(el => el.classList.remove("is-active"));
    e.currentTarget.classList.add("is-active");
  }

  return (
    <div className="App">
      {user ?
        <div>
          <SignOut />
          <form encType="multipart/form-data" onSubmit={formSubmit}>
            <input onChange={fileChange} name="images" type="file" multiple />

            <div onClick={e => { setPrivacy("public") }}>
              <input type="radio" name="privacy" value="public" checked={privacy === "public" ? "checked" : null} />
              <label for="public">Public</label>
            </div>

            <div onClick={e => setPrivacy("private")}>
              <input type="radio" name="privacy" value="private" checked={privacy === "private" ? "checked" : null} />
              <label for="private">Private</label>
            </div>
            <button type="submit">Go!</button>
          </form>
          <div className="tabs is-toggle is-fullwidth">
            <ul>
              <li id="public" className="tab is-active" onClick={changeView}>
                <a>
                  <span className="icon is-small"><i className="fas fa-images" aria-hidden="true"></i></span>
                  <span>Public Pictures</span>
                </a>
              </li>
              <li id="private" className="tab" onClick={changeView}>
                <a>
                  <span className="icon is-small"><i className="fas fa-user-edit" aria-hidden="true"></i></span>
                  <span>My Pictures</span>
                </a>
              </li>
            </ul>
          </div>
          <div id="img-cont">
            {view === "public" ? <PublicGallery /> : <PrivateGallery />}
          </div>

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

function PublicGallery() {
  let [imageDocs, loading, error] = useCollectionData(firebase.firestore().collection("images").where("privacy", "==", "public").orderBy('createdAt'));

  if (error) return <p>Error</p>;

  return (
    loading ? <p>Loading...</p> :
      imageDocs.map(img => {
        return (
          <div key={img.id}>
            <img src={img.url} />
          </div>
        )
      })
  )
}

function PrivateGallery() {
  let [imageDocs, loading, error] = useCollectionData(firebase.firestore().collection("images").where("uid", "==", auth.currentUser.uid));

  function delImage(e) {
    firebase.firestore().collection("images").doc(e.currentTarget.getAttribute("data-imgid")).delete();
  }

  if (error) {
    console.log(error);
    return <p>Error</p>;
  }

  return (
    loading ? <p>Loading...</p> :
      imageDocs.map(img => {
        return (
          <div key={img.id} className="item-cont">
            <img src={img.url} />
            <button className="del-btn" data-imgid={img.id} onClick={delImage}><span className="icon is-small"><i className="fas fa-trash-alt" aria-hidden="true"></i></span></button>
          </div>
        )
      })
  )
}
export default App;
