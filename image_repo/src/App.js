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
    setFiles({});
  }

  function changeView(e) {
    setView(e.currentTarget.id);
    document.querySelectorAll('.tab').forEach(el => el.classList.remove("is-active"));
    e.currentTarget.classList.add("is-active");
  }

  return (
    <div className="App">
      <Navbar />
      {user ?
        <div>

          <form id="file-upload" encType="multipart/form-data" onSubmit={formSubmit}>
            <div className="file has-name is-boxed">
              <label className="file-label">
                <input className="file-input" onChange={fileChange} name="images" type="file" multiple />
                <span className="file-cta">
                  <span className="file-icon">
                    <i className="fas fa-upload"></i>
                  </span>
                  <span className="file-label">Select File(s)…</span>
                </span>
                <span className="file-name">{files.length || 0} files selected</span>
              </label>
            </div>

            <div className="control">
              <label className="radio" onClick={e => { setPrivacy("public") }}>
                <input type="radio" name="privacy" value="public" checked={privacy === "public" ? "checked" : null} />Public</label>
              <label className="radio" onClick={e => { setPrivacy("private") }}>
                <input type="radio" name="privacy" value="private" checked={privacy === "private" ? "checked" : null} />Private</label>
            </div>

            <div className="control">
              <button className="button is-primary">Upload Images</button>
            </div>
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
              <li id="search" className="tab" onClick={changeView}>
                <a>
                  <span className="icon is-small"><i className="fas fa-user-edit" aria-hidden="true"></i></span>
                  <span>Search</span>
                </a>
              </li>
            </ul>
          </div>
          <div id="img-cont">
            {view === "public" ? <PublicGallery /> : (view === "private" ? <PrivateGallery /> : <SearchGallery />)}
          </div>

        </div>
        :
        <div class="content" style={{margin: '20px'}}>
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
        </div>
      }
    </div>
  );
}


function Navbar() {
  const [user] = useAuthState(auth);

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <nav className="navbar is-transparent" role="navigation" aria-label="main navigation">
      <div className="navbar-brand">
        <p className="navbar-item">
          <strong>Shopify&nbsp;</strong> Image Repository
        </p>
      </div>

      <div id="navbarBasicExample" className="navbar-menu">
        <div className="navbar-end">
          <div className="navbar-item">
            {user ? (
              <div className="buttons">
                <a className="button is-primary" onClick={() => auth.signOut()}><strong>Sign Out</strong></a>
              </div>
            ) : (
              <div className="buttons">
                <button className="button is-primary" onClick={signInWithGoogle}><strong>Sign In</strong></button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function PublicGallery() {
  let [imageDocs, loading, error] = useCollectionData(firebase.firestore().collection("images").where("privacy", "==", "public").orderBy('createdAt'));

  if (error) return <p>Error</p>;
  return (
    loading ? <p>Loading...</p> :
      <Gallery images={imageDocs} />
  )
}

function PrivateGallery() {
  let [imageDocs, loading, error] = useCollectionData(firebase.firestore().collection("images").where("uid", "==", auth.currentUser.uid));

  function delImage(e) {
    firebase.firestore().collection("images").doc(e.currentTarget.getAttribute("data-imgid")).delete();
  }

  if (error) return <p>Error</p>;
  return (
    loading ? <p>Loading...</p> :
      <Gallery images={imageDocs} delete={delImage} />
  )
}

function SearchGallery() {
  const [search, setSearch] = useState("");

  return (
    <>
      <form id="search-bar">
        <div className="field">
          <label className="label">Image Search</label>
          <div className="control">
            <input className="input" type="text" name="search-key" value={search} onChange={e => setSearch(e.target.value)} placeholder="eg. lake, sky" />
          </div>
          <p class="help">enter keywords</p>
        </div>

      </form>
      <SearchGalleryWrapper keywords={search.toLowerCase().split(" ")} />
    </>
  )
}

function SearchGalleryWrapper(props) {
  let [imageDocs, loading, error] = useCollectionData(firebase.firestore().collection("images").where('keywords', 'array-contains-any', props.keywords));
  if (error) return <p>Error</p>;
  return (
    loading ? <p>Loading...</p> :
      <Gallery images={imageDocs} />
  )
}

function Gallery(props) {
  return (
    props.images.map(img => {
      return (
        <div key={img.id} className="item-cont">
          <img src={img.url} />
          {props.delete ? <button className="del-btn" data-imgid={img.id} onClick={props.delete}><span className="icon is-small"><i className="fas fa-trash-alt" aria-hidden="true"></i></span></button> :
            <></>}
        </div>
      )
    })
  )
}

export default App;
