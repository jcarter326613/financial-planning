import { Secrets } from "../main/services/secrets"
import * as sinon from "sinon"

sinon.replace(Secrets.instance, "getAccessTokenSecret", (): any => "accessTokenSecret")
sinon.replace(Secrets.instance, "getRefreshTokenSecret", (): any => "refreshTokenSecret")
