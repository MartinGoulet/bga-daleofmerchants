const isDebug =
   window.location.host == "studio.boardgamearena.com" || window.location.hash.indexOf("debug") > -1;
const log = isDebug ? console.log.bind(window.console) : function () {};
const LOCAL_STORAGE_ZOOM_KEY = "dale-merchants-zoom";
const LOCAL_STORAGE_JUMP_TO_FOLDED_KEY = "dale-merchants-jump-to-folded";

interface DaleMerchants extends ebg.core.gamegui, BgaGame<DaleMerchantsPlayerData, DaleMerchantsGamedatas> {
   dontPreloadImage(image_file_name: string): void;
   ensureSpecificGameImageLoading(image_file_names_array: string[]);
   displayScoring(
      anchor_id: string,
      color: string,
      score: number,
      duration: number,
      offset_x?: number,
      offset_y?: number,
   ): void;
   fadeOutAndDestroy(id: string, duration?: number, delay?: number): void;
   showMessage(msg: string, type: "info" | "error" | "only_to_log"): void;
   updatePlayerOrdering(): void;
}

class DaleMerchants implements ebg.core.gamegui, BgaGame<DaleMerchantsPlayerData, DaleMerchantsGamedatas> {
   private TOOLTIP_DELAY = document.body.classList.contains("touch-device") ? 1500 : undefined;

   public readonly gamedatas: DaleMerchantsGamedatas;
   public notifManager: NotificationManager;
   public tableCenter: TableCenter;
   public stateManager: StateManager;
   public playersTables: PlayerTable[] = [];
   public zoomManager: ZoomManager;

   constructor() {}

   /*
        setup:
        
        This method must set up the game user interface according to current game situation specified
        in parameters.
        
        The method is called each time the game interface is displayed to a player, ie:
        _ when the game starts
        _ when a player refreshes the game page (F5)
        
        "gamedatas" argument contains all datas retrieved by your "getAllDatas" PHP method.
    */
   public setup(gamedatas: DaleMerchantsGamedatas) {
      log(gamedatas);

      this.notifManager = new NotificationManager(this);
      this.stateManager = new StateManager(this);
      this.tableCenter = new TableCenter(this);

      // Setting up player boards
      this.createPlayerTables(gamedatas);

      this.zoomManager = new ZoomManager({
         element: document.getElementById("table"),
         smooth: false,
         zoomControls: {
            color: "black",
         },
         localStorageZoomKey: LOCAL_STORAGE_ZOOM_KEY,
         zoomLevels: [0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1, 1.25, 1.5, 1.75, 2],
      });

      this.setupNotifications();
   }

   ///////////////////////////////////////////////////
   //// Game & client states

   // onEnteringState: this method is called each time we are entering into a new game state.
   //                  You can use this method to perform some user interface changes at this moment.
   //
   public onEnteringState(stateName: string, args: any) {
      this.stateManager.onEnteringState(stateName, args);
   }

   // onLeavingState: this method is called each time we are leaving a game state.
   //                 You can use this method to perform some user interface changes at this moment.
   //
   public onLeavingState(stateName: string) {
      this.stateManager.onLeavingState(stateName);
   }

   // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
   //                        action status bar (ie: the HTML links in the status bar).
   //
   public onUpdateActionButtons(stateName: string, args: any) {
      this.stateManager.onUpdateActionButtons(stateName, args);
   }

   ///////////////////////////////////////////////////
   //// Utilities

   public addActionButtonDisabled(id: string, label: string, action?: (evt: any) => void) {
      this.addActionButton(id, label, action);
      this.disableButton(id);
   }

   public addActionButtonClientCancel() {
      const handleCancel = (evt: any): void => {
         dojo.stopEvent(evt);
         this.restoreGameState();
      };
      this.addActionButtonGray("btnCancelAction", _("Cancel"), handleCancel);
   }

   public addActionButtonPass() {
      const handlePass = () => {
         this.takeAction("pass");
      };
      this.addActionButtonRed("btn_pass", _("Pass"), handlePass);
   }

   public addActionButtonGray(id: string, label: string, action: (evt: any) => void) {
      this.addActionButton(id, label, action, null, null, "gray");
   }

   public addActionButtonRed(id: string, label: string, action: () => void) {
      this.addActionButton(id, label, action, null, null, "red");
   }

   private createPlayerTables(gamedatas: DaleMerchantsGamedatas) {
      gamedatas.players_order.forEach((player_id) => {
         const player = gamedatas.players[Number(player_id)];
         const table = new PlayerTable(this, player);
         this.playersTables.push(table);
      });
   }

   public toggleButtonEnable(id: string, enabled: boolean, color: "blue" | "red" | "gray" = "blue"): void {
      if (enabled) {
         this.enableButton(id, color);
      } else {
         this.disableButton(id);
      }
   }

   public disableButton(id: string): void {
      const el = document.getElementById(id);
      if (el) {
         el.classList.remove("bgabutton_blue");
         el.classList.remove("bgabutton_red");
         el.classList.add("bgabutton_disabled");
      }
   }

   public enableButton(id: string, color: "blue" | "red" | "gray" = "blue"): void {
      const el = document.getElementById(id);
      if (el) {
         el.classList.add(`bgabutton_${color}`);
         el.classList.remove("bgabutton_disabled");
      }
   }

   public getPlayerId(): number {
      return Number(this.player_id);
   }

   public getPlayerTable(playerId: number): PlayerTable {
      return this.playersTables.find((playerTable) => playerTable.player_id === playerId);
   }

   restoreGameState() {
      log("restoreGameState");
      //   this.actionManager.reset();
      this.stateManager.restoreGameState();
      this.clearSelection();
      this.restoreServerGameState();
   }

   clearSelection() {
      log("clearSelection");
      document.querySelectorAll(".dm-selected").forEach((node) => {
         node.classList.remove("dm-selected");
      });
      document.querySelectorAll(".dm-selectable").forEach((node) => {
         node.classList.remove("dm-selectable");
      });
      document.querySelectorAll(".dm-deck-was-selected").forEach((node) => {
         node.classList.remove("dm-deck-was-selected");
      });
   }

   public setGamestateDescription(property: string = "") {
      const originalState = this.gamedatas.gamestates[this.gamedatas.gamestate.id];
      this.gamedatas.gamestate.description = `${originalState["description" + property]}`;
      this.gamedatas.gamestate.descriptionmyturn = `${originalState["descriptionmyturn" + property]}`;
      (this as any).updatePageTitle();
   }

   public setTooltip(id: string, html: string) {
      this.addTooltipHtml(id, html, this.TOOLTIP_DELAY);
   }

   public takeAction(
      action: string,
      data?: any,
      onSuccess?: (result: any) => void,
      onComplete?: (is_error: boolean) => void,
   ) {
      data = data || {};
      data.lock = true;
      onSuccess = onSuccess ?? function (result: any) {};
      onComplete = onComplete ?? function (is_error: boolean) {};
      (this as any).ajaxcall(
         `/dalemerchants/dalemerchants/${action}.html`,
         data,
         this,
         onSuccess,
         onComplete,
      );
   }

   ///////////////////////////////////////////////////
   //// Reaction to cometD notifications

   /*
        setupNotifications:
        
        In this method, you associate each of your game notifications with your local method to handle it.
        
        Note: game notification names correspond to "notifyAllPlayers" and "notifyPlayer" calls in
                your karmaka.game.php file.
     
    */
   setupNotifications() {
      log("notifications subscriptions setup");
      this.notifManager.setup();
   }

   ///////////////////////////////////////////////////
   //// Logs

   /* @Override */
   format_string_recursive(log: string, args: any) {
      try {
         if (log && args && !args.processed) {
            args.processed = true;

            if (args.card_name !== undefined) {
               args.card_name = "<b>" + _(args.card_name) + "</b>";
            }
         }
      } catch (e) {
         console.error(log, args, "Exception thrown", e.stack);
      }
      return this.inherited(arguments);
   }

   formatGametext(rawText: string) {
      if (!rawText) return "";
      let value = rawText.replace(",", ",<br />").replace(":", ":<br />");
      return "<p>" + value.split(".").join(".</p><p>") + "</p>";
   }
}
