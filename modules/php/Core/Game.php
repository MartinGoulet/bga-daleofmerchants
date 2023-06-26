<?php

namespace DaleMerchants\Core;

use APP_DbObject;
use DaleMerchants;

/*
 * Game: a wrapper over table object to allow more generic modules
 */

class Game {
    public static function get() {
        return DaleMerchants::get();
    }
}
