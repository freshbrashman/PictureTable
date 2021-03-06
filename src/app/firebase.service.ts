//ｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰ
// 通信処理
//ｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰ
import {Injectable} from "@angular/core";
import "rxjs/add/operator/map";
import { Observable, Subject, BehaviorSubject, ReplaySubject } from 'rxjs/Rx';
import {initializeApp, auth, database, storage, User } from 'firebase';
import { UUID } from 'angular2-uuid';

const config = {
    apiKey: "AIzaSyCf6FraRT1wqxHu4mh3bwS-ba0fK497MPk",
    authDomain: "teru-kensho.firebaseapp.com",
    databaseURL: "https://teru-kensho.firebaseio.com",
    projectId: "teru-kensho",
    storageBucket: "teru-kensho.appspot.com",
    messagingSenderId: "604840872764"
};

export interface PictureRecord {
    id: string;
    name: string;
    size: string;
    lastModifiedDate: any;
    summary: string;
    description: string;
};

@Injectable()
export class FirebaseService {
    private auth: auth.Auth;
    private database: database.Database;
    private storage: storage.Storage;
    private messagesRef: database.Reference;
    private picturesRef: database.Reference;
    private informStableSubject$: Subject<boolean>;
    private authSubject$: Subject<firebase.User | null>;
    private currentUser: User;
    private pictureRecords: PictureRecord[];

    getPictureRecords(): PictureRecord[] {
      return this.pictureRecords;
    }

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
            this.initData();
        } else { // User is signed out!
            this.authSubject$.next(null);
        }
        });

        this.messagesRef = this.database.ref('messages');
        this.picturesRef = this.database.ref('pictures');
        
        // auth
        const provider = new auth.GoogleAuthProvider();
        this.auth.signInWithPopup(provider);
    }

  saveImage(file:File) {
    let uuid = UUID.UUID();
    var storageRef = this.storage.ref().child(uuid);
    var picturesRef = this.picturesRef;
    storageRef.put(file).then(function(snapshot){
      console.log('Uploaded a blob or file!');
      picturesRef.push({
        id: uuid,
        name: file.name,
        size: file.size,
        lastModifiedDate: file.lastModifiedDate,
        summary: 'サマリ',
        description: '詳細',
      }).then((snapshot:database.DataSnapshot) => {
        console.info("success writing to database");
      }).catch((error) => {
        console.error('Error writing new file data to Firebase Database', error);
      });
    });
  }

  initData() {
    this.pictureRecords = [];
    let picturesRef = this.picturesRef;
    let pictureRecords = this.pictureRecords;
    picturesRef.once('value').then(function(snapshot) {
      for(let a in snapshot.val()) {
        console.info(a);
        pictureRecords.push(snapshot.val()[a]);
      }
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
