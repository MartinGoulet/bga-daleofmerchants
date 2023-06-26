interface DaleMerchantsPlayerData extends BgaPlayer {
   // Add Player data
}

interface DaleMerchantsGamedatas extends BgaGamedatas<DaleMerchantsPlayerData> {
   card_types: { [card_type: number]: CardType };
   players_order: number[];
}

interface CardType {
   name: string;
   description: string;
   cost: number;
}

interface StateHandler {
   onEnteringState(args: any): void;
   onLeavingState(): void;
   onUpdateActionButtons(args: any): void;
   restoreGameState();
}
