//ｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰ
// 通信処理
//ｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰ
import {Injectable} from "@angular/core";
import "rxjs/add/operator/map";
import { Observable, Subject, BehaviorSubject, ReplaySubject } from 'rxjs/Rx';
import {initializeApp, auth, database, storage, User } from 'firebase';

const config = {
    apiKey: "AIzaSyCf6FraRT1wqxHu4mh3bwS-ba0fK497MPk",
    authDomain: "teru-kensho.firebaseapp.com",
    databaseURL: "https://teru-kensho.firebaseio.com",
    projectId: "teru-kensho",
    storageBucket: "teru-kensho.appspot.com",
    messagingSenderId: "604840872764"
};

@Injectable()
export class FirebaseService {
    private auth: auth.Auth;
    private database: database.Database;
    private storage: storage.Storage;
    private messagesRef: database.Reference;
    private informStableSubject$: Subject<boolean>;
    private authSubject$: Subject<firebase.User | null>;
    private currentUser: User;

    constructor() {
        initializeApp(config);

        this.authSubject$ = new BehaviorSubject<firebase.User | null>(null);
        this.informStableSubject$ = new ReplaySubject<boolean>();

        this.auth = auth();
        this.database = database();
        this.storage = storage();

        // サインインかサインアウトをするとその都度この処理が走る。
        this.auth.onAuthStateChanged((user: firebase.User) => {
        if (user) { // User is signed in!
            this.authSubject$.next(user);
            this.saveMessage('xxxxxxxxxxx');
        } else { // User is signed out!
            this.authSubject$.next(null);
        }
        });

        this.messagesRef = this.database.ref('messages');
        
        // auth
        const provider = new auth.GoogleAuthProvider();
        this.auth.signInWithPopup(provider);
    }

  saveImage(file:File) {
    var storageRef = this.storage.ref().child(file.name);
    storageRef.put(file).then(function(snapshot){
      console.log('Uploaded a blob or file!');
    });
  }

  saveMessage(message: string) {
    if (message) {
      const currentUser = this.auth.currentUser;
      if (currentUser) {
        // Add a new message entry to the Firebase Database.
        this.messagesRef.push({
          name: currentUser.displayName,
          text: message,
          photoUrl: currentUser.photoURL || '/images/profile_placeholder.png'
        }).then((snapshot:database.DataSnapshot) => {
          this.informStableSubject$.next(true);
        }).catch((error) => {
          console.error('Error writing new message to Firebase Database', error);
        });
      }
    }
  }    
}
