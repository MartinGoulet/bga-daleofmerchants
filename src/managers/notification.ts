const ANIMATION_MS = 1500;

class NotificationManager {
   constructor(private game: DaleMerchants) {}

   setup() {
      this.game.notifqueue.setIgnoreNotificationCheck(
         "message",
         (notif) => notif.args.excluded_player_id && notif.args.excluded_player_id == this.game.player_id,
      );
   }

   private subscribeEvent(eventName: string, time: number, setIgnore: boolean = false) {
      try {
         dojo.subscribe(eventName, this, "notif_" + eventName);
         if (time) {
            this.game.notifqueue.setSynchronous(eventName, time);
         }
         if (setIgnore) {
            this.game.notifqueue.setIgnoreNotificationCheck(
               eventName,
               (notif) =>
                  notif.args.excluded_player_id && notif.args.excluded_player_id == this.game.player_id,
            );
         }
      } catch {
         console.error("NotificationManager::subscribeEvent", eventName);
      }
   }
}
