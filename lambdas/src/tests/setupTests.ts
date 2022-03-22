import { Database } from "../main/services/database"
import * as sinon from "sinon"

before(() => {
    sinon.replace(Database.instance, "initialize", sinon.fake())
})