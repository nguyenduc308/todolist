import { BehaviorSubject, fromEvent, Observable, from } from 'rxjs';
import { map, distinctUntilChanged, switchMap } from 'rxjs/operators';
// Constants
const STORAGE_KEY = 'todo_items';
//Elements
const nameInput = document.querySelector("#name") as HTMLInputElement;
const keyup$ = fromEvent(document, 'keyup');
const focus$ = fromEvent(nameInput, 'focus');

enum ItemState {
    NEW = 'NEW',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED'
}
interface Item {
    id: string;
    name: string;
    status: ItemState;
    timestamp: Date;
}
class Storage {
    private _items: Item[] = [];

    private _currentItemSubject$: BehaviorSubject<Item|null> = new BehaviorSubject(null);
    
    currentItem$: Observable<Item|null> = this._currentItemSubject$.asObservable();

    constructor(
        private _KEY: string,
    ) {
        if(localStorage) {
            this._items = JSON.parse(localStorage.getItem(this._KEY) || "[]");
        }
    }

    get data() {
        return this._items;
    }
    addItems(item: Item): Item {
        this._items = [item, ...this._items];
        this.saved();
        return item;
    }
    get currentItem(): Observable<Item|null> {
        return this.currentItem$;
    }
    setCurrentItem(item: Item): void {
        this._currentItemSubject$.next(item);
    }
    private saved(): void {
        localStorage && localStorage.setItem(this._KEY, JSON.stringify(this._items))
    }
}

const storage = new Storage(STORAGE_KEY);

class TodoList {
    containerElement: HTMLElement;
    constructor(containerElementSelector: string) {
        this.containerElement = document.querySelector(containerElementSelector)
    }
    addItem(task: string) {
        const newItem: Item = {
            id: Date.now().toString(),
            name: task,
            status: ItemState.NEW,
            timestamp: new Date()
        }
        storage.addItems(newItem);
        nameInput.value="";
        this.render();
    }
    render() {
        this.containerElement.innerHTML = "";
        storage.data.forEach((item: Item) => {
                        const itemNode = document.createElement('li');
                        itemNode.innerText = item.name;
                        this.containerElement.appendChild(itemNode);
                    })
    }
}
const todoList = new TodoList("#list");
todoList.render();


//handles
focus$
    .pipe(
        switchMap((e: FocusEvent) => {
            return keyup$;
        })
    )
    .pipe(
        map((e: KeyboardEvent) => e.keyCode === 13),
        distinctUntilChanged()
    )
    .subscribe(
        (isEnter: boolean) => {
            if(isEnter) {
                todoList.addItem(nameInput.value)
            }
            console.log(isEnter)
        }
    )