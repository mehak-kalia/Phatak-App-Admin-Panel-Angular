import { Component, OnInit } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { FormControl, FormGroup } from '@angular/forms';
import { collection, doc, getDocs, setDoc } from 'firebase/firestore';

@Component({
  selector: 'app-phatak',
  templateUrl: './phatak.component.html',
  styleUrls: ['./phatak.component.css']
})
export class PhatakComponent implements OnInit {

  showForm = true;

  phatakForm = new FormGroup(
    {
      phatakname: new FormControl(''),
      inchargename: new FormControl(''),
      inchargephone: new FormControl(''),
      latitude: new FormControl(''),
      longitude: new FormControl(''),
      phatakimage: new FormControl('')
    }
  ); 

  phataksList 

  constructor(
    private firestore: Firestore
  ) { 
   
  }

  ngOnInit(): void {
    let collectionRef = collection(this.firestore, "crossings")
    getDocs(collectionRef).then((value)=> {
      console.log(value.docs.map(e => ({id: e.id, ...e.data()})))
    })
  }

  addPhatakToFirebase(){
    console.log("Function Add Executed");
    console.log(this.phatakForm.value);
    //let value = this.phatakForm.value;
    let value = Object.assign({}, this.phatakForm.value)


    value['phatakId'] = doc(collection(this.firestore, "crossings")).id;
    let docRef = doc(this.firestore, "crossings/" + value['phatakId'])
    setDoc(docRef, value)
    .then(() => {
      console.log("Saved");
      this.phatakForm.reset()
    }, (error) => {
      console.error(error);
      
    })

    console.log(value);
    

    

  }

}
