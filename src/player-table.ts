class PlayerTable {
   public player_id: number;
   private current_player: boolean;

   constructor(private game: DaleMerchants, player: DaleMerchantsPlayerData) {
      this.player_id = Number(player.id);
      this.current_player = this.player_id == this.game.getPlayerId();

      const { id: pId, name: pName, color: pColor } = player;
      const pCurrent = this.current_player.toString();

      const html = `
            <div style="--color: #${pColor}" data-color="${pColor}" data-current-player="${pCurrent}">
               <div class="dm-background"></div>
               <div id="player-table-${pId}" class="player-table whiteblock" data-discount-next-spell="0" data-discount-next-attack="0">
                  <span class="dm-title">${pName}</span>
               </div>
            </div>`;

      dojo.place(html, "tables");
   }
}
