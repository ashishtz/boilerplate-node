import { Model } from "objection";
import Knex from "knex";
import { db } from "../config";

const knex = Knex({ ...db.connection });

Model.knex(knex);

export { knex };
export default Model;
