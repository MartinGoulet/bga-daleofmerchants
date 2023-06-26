const states = {
   client: {},
   server: {},
};

class StateManager {
   private readonly states: { [statename: string]: StateHandler };
   private readonly client_states: StateHandler[] = [];

   constructor(private game: DaleMerchants) {
      this.states = {};
   }

   onEnteringState(stateName: string, args: any): void {
      log("Entering state: " + stateName);

      if (this.states[stateName] !== undefined) {
         this.states[stateName].onEnteringState(args.args);
         if (stateName.startsWith("client_")) {
            this.client_states.push(this.states[stateName]);
         } else {
            this.client_states.splice(0);
         }
      } else {
         this.client_states.splice(0);
         console.warn("State not handled", stateName);
      }
      console.log("client states", this.client_states);
   }

   onLeavingState(stateName: string): void {
      log("Leaving state: " + stateName);

      if (this.states[stateName] !== undefined) {
         this.states[stateName].onLeavingState();
      }
   }

   onUpdateActionButtons(stateName: string, args: any): void {
      log("onUpdateActionButtons: " + stateName);
      if (this.states[stateName] !== undefined) {
         if (this.game.isCurrentPlayerActive()) {
            this.states[stateName].onUpdateActionButtons(args);
         }
      }
   }

   restoreGameState() {
      while (this.client_states.length > 0) {
         const state = this.client_states.pop();
         state.restoreGameState();
      }
   }
}
