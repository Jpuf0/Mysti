/* eslint-disable deprecation/deprecation */
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./@types/Eris.d.ts" />
/* eslint-disable import/order */import path from "path";

import moduleAlias from "module-alias";
const d = path.resolve(`${__dirname}/../../`);
moduleAlias.addAliases({
	"@root": d,
	"@config": `${d}/src/config`,
	"@util": `${d}/src/util`,
	"@handlers": `${d}/src/util/handlers`,
	"@db": `${d}/src/db`,
	"@events": `${d}/src/events`,
	"@Mysti": `${d}/src/main`
});
import sauce from "source-map-support";
sauce.install({ hookRequire: true });
