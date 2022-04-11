import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Tier } from '../classes/tier';
import defaultCharacters from '../../assets/characters.json';
import {DialogColorComponent} from './dialog/dialog-color/dialog-color.component'
import {DialogTiernameComponent} from './dialog/dialog-tiername/dialog-tiername.component'
import html2canvas from 'html2canvas';
import { TierCharacter } from '../classes/tier-character';
import { DialogAddCharacterComponent } from './dialog/dialog-add-character/dialog-add-character.component';

@Component({
  selector: 'app-list-container',
  templateUrl: './list-container.component.html',
  styleUrls: ['./list-container.component.css']
})
export class ListContainerComponent implements OnInit {

  @ViewChild('tierlist') screen: ElementRef;
  @ViewChild('canvas') canvas: ElementRef;
  @ViewChild('downloadLink') downloadLink: ElementRef;
  gridBreakpoint = 1
  tiers: Tier[];
  unsortedCharacters: TierCharacter[];

  constructor(public dialog: MatDialog) { }

  ngOnInit() {
    this.setGridBreakPoint(window.innerWidth);
    this.initializeData();
  }

  onResize(event) {
    this.setGridBreakPoint(event.target.innerWidth);
  }

  initializeData(){
    this.tiers = [
      new Tier("S-Tier", "#7fffff"),
      new Tier("A-Tier", "#7fff7f"),
      new Tier("B-Tier", "#bfff7f"),
      new Tier("C-Tier", "#ffff7f"),
      new Tier("D-Tier", "#ffbf7f"),
      new Tier("F-Tier", "#ff7f7f"),
    ]
    this.unsortedCharacters = [];
    for(let characterName of defaultCharacters){
      this.unsortedCharacters.push(new TierCharacter(characterName,"assets/avatars/"+characterName+".png"))
    }
  }

  setGridBreakPoint(windowSize){
    //This is ugly as fuck, but apparently gives us the fastest performance in every browser except Internet Explorer, but they can go fuck themselves. You're on 4chan, you don't use that
    //TODO give the unsorted bin a different breakpoint
    if(windowSize <= 1000) this.gridBreakpoint = 3; else
    if(windowSize <= 1500) this.gridBreakpoint = 9;
    else this.gridBreakpoint = 6;

  }

  drop(event: CdkDragDrop<TierCharacter[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      event.container.data.sort((a, b) => (a.name > b.name) ? 1 : -1);
    } else {
      transferArrayItem(event.previousContainer.data,
                        event.container.data,
                        event.previousIndex,
                        event.currentIndex);
      event.container.data.sort((a, b) => (a.name > b.name) ? 1 : -1);
    }
  }

  clickResetButton(){
    this.initializeData();
  }

  downloadImage(){
    html2canvas(this.screen.nativeElement,{logging: true, useCORS: true, allowTaint: false}).then(canvas => {
      this.canvas.nativeElement.src = canvas.toDataURL();
      this.downloadLink.nativeElement.href = canvas.toDataURL('image/png');
      this.downloadLink.nativeElement.download = 'flg-tierlist-'+Date.now()+".png";
      this.downloadLink.nativeElement.click();
    });
  }

  clickAddTier(){
    const dialogRef = this.dialog.open(DialogTiernameComponent, {
      width: '250px',
      data: {name: "X Tier",
            color: "#ffff7f"}
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result != undefined){
        this.tiers[this.tiers.length] = new Tier(result.name, result.color)
      }
    });   
  }

  clickAddCharacter(){
    const dialogRef = this.dialog.open(DialogAddCharacterComponent, {
      width: '650px',
      //data: {name: "X Tier",
      //      color: "#ffff7f"}
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result != undefined){
        console.debug(result)
        this.unsortedCharacters[this.unsortedCharacters.length] = new TierCharacter(result.name,result.profilePicURL);
        //this.tiers[this.tiers.length] = new Tier(result.name, result.color)
      }
      else{
        console.debug("Dialog yielded no result.")
      }
    });   
    /*
    var characterName = prompt("Character name?", '')
    if (characterName != null || characterName.length > 2){
      this.addCharacter(characterName);
    }
    else{
      alert("Invalid character name.");
    }
    */
  }

  clickMoveTierUpButton(tier: Tier){
    this.moveTier(tier,true);
  }

  clickMoveTierDownButton(tier: Tier){
    this.moveTier(tier,false);
  }


  clickChangeTierButton(tier: Tier){
    const dialogRef = this.dialog.open(DialogTiernameComponent, {
      width: '250px',
      data: {name: tier.name,
            color: tier.colorHex}
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result != undefined){
        tier.name = result.name;
        tier.colorHex = result.color;
      }
    });   
  }

  clickDeleteTierButton(tier: Tier){
    this.tiers.splice(this.tiers.indexOf(tier),1);
    for(let character of tier.characters){
      this.unsortedCharacters.push(character);
    }
    this.unsortedCharacters.sort((a, b) => (a.name > b.name) ? 1 : -1);
  }

  moveTier(tier: Tier, upwards: boolean){
    //by "upwards" we mean the position, not the number
    let index: number = this.tiers.indexOf(tier);
    //this *should* not happen, but since indexOf does have a return for bad data, we'll catch it anyway
    if(index < 0) {
      console.error("Tier: "+tier+" isn't actually in the list!");
      return;
    }
    //check to see if we're not trying to move to an invalid position
    if((upwards&&index < 1)||(!upwards&&index == this.tiers.length-1)) return;
    //but we're all clear now, let's move our thing
    let newIndex = upwards ? index - 1 : index + 1
    let oldTier = this.tiers[newIndex];
    this.tiers[newIndex] = tier;
    this.tiers[index] = oldTier;
  }

}
