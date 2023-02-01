import { observable, makeObservable, action } from 'mobx';

export default class HomeViewModel {
  @observable hello = '';

  constructor () {
    makeObservable(this);
  }

  @action setHello (value) {
    this.hello = value;
  }
}