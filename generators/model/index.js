'use strict';
var yeoman = require('yeoman-generator');
var fileHelper = require('../filehelper');
var helper = require('../helper');

var cwd = process.cwd();

module.exports = yeoman.Base.extend({
    constructor: function () {
        yeoman.Base.apply(this, arguments);

        fileHelper.registerPackageOption(this);
    },
    initializing: function () {
        this.destinationRoot(cwd);
    },
    prompting: function () {
        var prompts = [{
            type: 'input',
            name: 'modelNames',
            validate: fileHelper.validateCommaTypeList,
            message: 'List model names (separated by commas):\n'
        }];
        fileHelper.addCurrentPackagePrompt(this, prompts);

        return this.prompt(prompts).then(function (values) {
            this.props = values;
            this.files = [];

            helper.iterateCommaList(values.modelNames, function (modelName) {
                if (modelName === '')
                    return;

                var parts = modelName.split('.');
                var name = parts.pop();
                var pack = parts.join('.');

                if (!name.endsWith('Model'))
                    name += 'Model';

                if (!this.options.currentPackage.endsWith('model') && !pack.startsWith('model'))
                    pack = helper.joinIfNotEmpty(['model', pack], '.');

                var fullPack = helper.joinIfNotEmpty([this.options.currentPackage, pack], '.');

                var file = {
                    name: name,
                    package: pack,
                    fullPackage: fullPack,
                    Model: name,
                    IModel: 'I' + name,
                    IModelListener: 'I' + name + 'Listener',
                    IModelRO: 'I' + name + 'RO',
                    ModelDispatcher: name + 'Dispatcher'
                };

                this.files.push(file);
            }.bind(this));
        }.bind(this));
    },
    writing: function () {
        for (var file of this.files) {
            var scope = {
                author: this.user.git.name(),
                package: file.fullPackage,
                model: file
            };

            var files = new Map([
                ['Model.hx', file.Model],
                ['IModel.hx', file.IModel],
                ['IModelListener.hx', file.IModelListener],
                ['IModelRO.hx', file.IModelRO]
            ]);

            fileHelper.writeFilesToPackage(this, files, file.package, scope);
        }
    }
});
