import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { addDoc, collection, deleteDoc, doc, Firestore, getDocs, onSnapshot, setDoc, Timestamp } from '@angular/fire/firestore';
import { FormGroup, FormControl, FormArray } from '@angular/forms';
import { values } from 'cypress/types/lodash';

@Component({
  selector: 'app-phatak',
  templateUrl: './phatak.component.html',
  styleUrls: ['./phatak.component.css']
})
export class PhatakComponent implements OnInit {

  showForm: boolean = false;
  phatakForm = new FormGroup(
    {
      phatakname: new FormControl(''),
      personInChargeName: new FormControl(''),
      inchargephone: new FormControl(''),
      latitude: new FormControl(''),
      longitude: new FormControl(''),
      imageUrl: new FormControl(''),
      phatakId: new FormControl(''),
      status: new FormControl(1),
      timings: new FormArray([])
    }
  ); 

  phataksList: any[] = [];

  constructor(
    private firestore: Firestore
  ) { }

  ngOnInit(): void {
    //Read Operation
    let collectionRef = collection(this.firestore, "crossings");
    onSnapshot(collectionRef, (value) => {
      this.phataksList = value.docs.map(e => ({ id: e.id, ...e.data() }));
    }, (error) => {
      console.log(error);
      
    })
    // getDocs(collectionRef).then((value) => {
    //   // console.log();
    //   this.phataksList = value.docs.map(e => ({ id: e.id, ...e.data() }));
    // })
  }

  getTimingsArrayFromPhatakForm() {
    return this.phatakForm.get('timings') as FormArray;
  }

  addTimingDetailsToArray() {
    this.getTimingsArrayFromPhatakForm().push(new FormGroup({
      time: new FormControl(null),
      trafficStatus: new FormControl(''),
      train: new FormControl('')
    }))
  }

  removeTimingDetailsToArray(idx: number) {
    this.getTimingsArrayFromPhatakForm().removeAt(idx);
  }

  // Create Operation
  addPhatakToFirebase(){
    console.log("Function Add Executed");
    let value: any = {...this.phatakForm.value};
    
    // addDoc(collection(this.firestore, "phataks"), value)
    let phatakInfo = {
      phatakId: value?.phatakId.length === 0 ? doc(collection(this.firestore, "crossings")).id : value.phatakId,
      location: [value.latitude, value.longitude],
      phatakName: value.phatakname,
      inchargeName: value.inchargename,
      inchargePhone: value.inchargephone,
      status: value.status,
      timings: value.timings.map(e => ({
        trafficStatus: e.trafficStatus,
        train: e.train,
        time: Timestamp.fromDate(new Date(e.time))
      })),
      phatakImage: value.phatakimage
    }
    let docRef = doc(this.firestore, "crossings/" + phatakInfo.phatakId)
    setDoc(docRef, phatakInfo)
    .then(() => {
      console.log("Saved");
      this.phatakForm.reset({});
      this.showForm = !this.showForm;
    }, (error) => {
      console.error(error);
      
    })
  }

  updatePhatak(phatak: any) {
    this.showForm = true;
    let datepipe = new DatePipe('en-US');
    this.phatakForm = new FormGroup({
      phatakname: new FormControl(phatak.phatakName),
      personInChargeName: new FormControl(phatak.inchargeName),
      inchargephone: new FormControl(phatak.inchargePhone),
      latitude: new FormControl(phatak.location[0]),
      longitude: new FormControl(phatak.location[1]),
      imageUrl: new FormControl(phatak.imageUrl),
      phatakId: new FormControl(phatak.phatakId),
      status: new FormControl(phatak.status),
      timings: new FormArray(phatak.timings.length === 0 ? [] : phatak.timings.map(element => new FormGroup({
        time: new FormControl(datepipe.transform(element.time.toDate(), 'yyyy-MM-dd HH:mm')),
        trafficStatus: new FormControl(element.trafficStatus),
        train: new FormControl(element.train)
      })))
    });


    // this.phatakForm.patchValue({
    //   phatakname: phatak.phatakName,
    //   inchargename: phatak.inchargeName,
    //   inchargephone: phatak.inchargePhone,
    //   latitude: phatak.location[0],
    //   longitude: phatak.location[1],
    //   phatakimage: phatak.phatakImage,
    //   phatakId: phatak.phatakId,
    //   status: phatak.status,
    // });

    // phatak.timings.forEach(element => {
    //   // console.log(element);
    //   this.getTimingsArrayFromPhatakForm().push(new FormGroup({
    //     time: new FormControl(datepipe.transform(element.time.toDate(), 'yyyy-MM-dd HH:mm')),
    //     trafficStatus: new FormControl(element.trafficStatus),
    //     train: new FormControl(element.train)
    //   }))
    // });
  }

  deletePhatak(phatakId: string) {
    let docRef = doc(this.firestore, "crossings/" + phatakId);
    deleteDoc(docRef).then(() => {
      console.log("Delete Successfully");
    })
    .catch((error) => {
      console.log(error);
    })
  }

}
