export class Player{
    constructor(name=''){
        this.name = name;
        this.str = 10;
        this.const = 10;
        this.dex = 10;
        this.cha = 10;
        this.ac = 10;
        this.hpMax = 20
        this.hp = 20;
        //will later hold items
        this.slots = {leftHand: 0, rightHand: 0, head: 0, body: 0, ring: 0}
}}

class inventory{
    constructor(items=[]){
        this.thing = items
    }
    
}