const moduleAlias = require('module-alias');
moduleAlias.addAliases({
    '@src': `${__dirname}/src`,
    '@test': `${__dirname}/test`
});
moduleAlias();