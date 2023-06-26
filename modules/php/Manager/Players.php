<?php

namespace DaleMerchants\Manager;

use DaleMerchants\Core\Game;

/*
 * Players manager : allows to easily access players ...
 *  a player is an instance of Player class
 */

class Players extends \APP_DbObject {

    public static function getPlayersInOrder($player_id = null) {
        $result = [];

        $players = Game::get()->loadPlayersBasicInfos();
        $next_player = Game::get()->getNextPlayerTable();

        // Check for spectator
        if (!key_exists($player_id, $players)) {
            $player_id = $next_player[0];
        }

        // Build array starting with current player
        for ($i = 0; $i < count($players); $i++) {
            $result[$player_id] = $players[$player_id];
            $player_id = $next_player[$player_id];
        }

        return $result;
    }
}
