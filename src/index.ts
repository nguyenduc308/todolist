import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { scan, pluck, distinctUntilChanged } from 'rxjs/operators';

class StoreManagement {
    private _store$: BehaviorSubject<any>;
    private _stateUpdate$: Subject<any>
    constructor(initialState: any) {
        this._store$ = new BehaviorSubject(
            initialState
        )
        this._stateUpdate$ = new Subject();
        
        this._stateUpdate$.pipe(
            scan((acc, curr) => ({...acc, ...curr}), initialState)
        )
        .subscribe(value => this._store$.next(value))
    }

    updateState(stateUpdate: any): void {
        this._stateUpdate$.next(stateUpdate);
    }

    selectState$(stateKey: string): Observable<any> {
        return this._store$.pipe(
            distinctUntilChanged(),
            pluck(stateKey)
        )
    }

    stateChanges$() {
        return this._store$.asObservable();
    }
}


const store: StoreManagement = new StoreManagement({
    user: 'Duc',
    isAuth: false
});

store.selectState$('user').subscribe(value => console.log(value));
store.updateState({
    user: 'phuong'
})