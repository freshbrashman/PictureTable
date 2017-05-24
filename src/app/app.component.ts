import { Component } from '@angular/core';
import {FirebaseService} from './firebase.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  firebaseService: FirebaseService;

  constructor(firebaseService: FirebaseService) {
    firebaseService.saveMessage("abcde");
    this.firebaseService = firebaseService;
  }

  onSelectImageFile(event : any) {
    if (event.target && event.target.files && event.target.files.length) {
      const file = event.target.files[0] as File;
      console.log(file);
      if (file.type.match('image.*')) { // imageファイルを選択した。
        this.firebaseService.saveImage(file);
      } else { // imageファイルではないものを選択した。
        alert('not File!!!');
      }
    }
  }
}
