import { Model } from "objection";
// Importing the database module binds the knex instance to Objection
// before any model is used, so models stay import-order independent.
import "../database";

/**
 * Common ancestor for every model. Put behaviour shared by all tables
 * here (soft deletes, timestamp hooks, custom query builders, ...).
 */
class BaseModel extends Model {}

export default BaseModel;
