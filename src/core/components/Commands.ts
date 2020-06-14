import { Component } from "ecsy";

const EMPTY_COMMANDS: string[] = [];

export default class Commands extends Component {
  public value: string[] = EMPTY_COMMANDS;

  copy(source: Commands): void {
    this.value = source.value;
  }

  reset(): void {
    this.value = EMPTY_COMMANDS;
  }
}
