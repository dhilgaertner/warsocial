/*
 * Land Class
 */

function Land(a_id) {

    var id = 0;
    // a_id TYPE should be checked
    if (a_id != undefined) {
        id = a_id;
    }

    var owner = null; // Owner of the land
    var nb_troops = 0;  // Number of troops on the lands
    var new_troops = 0; // Number of troops recently added
    var adjacent_land_ids = []; // Id of the lands bordering this one

    this.getId = function() { return id; };
    this.getOwner = function() { return owner; };
    this.setOwner = function(p) {
         if (p == null || p instanceof Player ) {  owner = p; }
    };
    this.getTroops = function() { return nb_troops; };
    this.setTroops = function(nb) {
        if (nb != undefined && nb.constructor === Number) {
            new_troops = nb - nb_troops;
            nb_troops = nb; }
    };
    this.getNewTroops = function() {
        var t = (new_troops < 0)? 0 : new_troops;
        new_troops = 0;
        return t;
    };
    this.getAdjacentLandIds = function() { return adjacent_land_ids; };

    this.addAdjacentLandId = function( land_id ) {
        if (land_id != undefined && land_id.constructor === Number && adjacent_land_ids.indexOf(land_id) == -1) {
           adjacent_land_ids.push(land_id);
        }
    };
}

/**
 * Compare a land id and adjacent land ids of this land. Return TRUE if this land is adjacent to land id.
 * @param land_id Id of the land to be checked
 */
Land.prototype.isAdjacentTo = function( land_id ) {
    if (land_id.constructor === Number) {
        if (this.getAdjacentLandIds().indexOf( land_id ) != -1) return true;
    }
    return false;
};

Land.prototype.toString = function() {
    return ("[Land]");
};
