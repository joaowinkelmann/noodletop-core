
import { ObjectManager, rObject } from "./object";

export class Table {

    // let's create a table that will place our objects in a defined (or perhaps expandable) grid, that can be used to place objects in physically in a 2d plane. we can then get this table, and return it to our front end clients, so that we can have a  visual representation of the room they're currently at

    private grid_max_x: number;
    private grid_max_y: number;
    private objects: ObjectManager = new ObjectManager();


    // the room will call the constructor as it sees fit that a table is necessary for the room
    constructor(grid_max_x: number, grid_max_y: number) {
        this.grid_max_x = grid_max_x;
        this.grid_max_y = grid_max_y;
    }

    public getTable() {
        return this.objects; // change this in the future to treat the objects being returned here so that we don't export only the objects inside.
    }



    public setOnTable(x: number, y: number, object: rObject) {
        // we will place the object on the table at the given x and y coordinates
    }


    public moveObject(x: number, y: number, object: rObject['id']) {
        
    }

}