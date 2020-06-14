import KeyboardSignals from "../signals/KeyboardSignals";
import { World, System } from "ecsy";
import Commands from "../components/Commands";
import PlayerControlled from "../components/PlayerControlled";

type PlayerControllerAttributes = {
  keyboardSignals: KeyboardSignals;
  commandMap: Map<string, string>;
};

/* eslint-disable @typescript-eslint/unbound-method */
class PlayerControllsSystem extends System {
  private keyboardSignals: KeyboardSignals;
  private currentCommands: Set<string> = new Set();
  private commandMap: Map<string, string>;

  public static queries = {
    playerControlled: {
      components: [PlayerControlled, Commands],
    },
  };

  constructor(world: World, attributes: PlayerControllerAttributes) {
    super(world, attributes);
    this.keyboardSignals = attributes.keyboardSignals;
    this.commandMap = attributes.commandMap;
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.play();
  }

  execute(): void {
    this.queries.playerControlled.results.forEach(entities => {
      const commands = entities.getMutableComponent(Commands);
      commands.value = this.getActiveCommands();
    });
  }

  public play(): void {
    super.play();
    this.keyboardSignals.onKeyDown.add(this.onKeyDown);
    this.keyboardSignals.onKeyUp.add(this.onKeyUp);
  }

  public stop(): void {
    super.stop();
    this.keyboardSignals.onKeyDown.remove(this.onKeyDown);
    this.keyboardSignals.onKeyUp.remove(this.onKeyUp);
  }

  public updateCommandMap(commandMap: Map<string, string>): void {
    this.currentCommands.clear();
    this.commandMap = commandMap;
  }

  protected getActiveCommands(): string[] {
    return [...this.currentCommands];
  }

  private onKeyDown(key: string): void {
    const command = this.commandMap.get(key);
    if (command) this.currentCommands.add(command);
  }

  private onKeyUp(key: string): void {
    const command = this.commandMap.get(key);
    if (command) this.currentCommands.delete(command);
  }
}

export default PlayerControllsSystem;
