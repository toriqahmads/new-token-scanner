const path = require('path');
const { readdirSync } = require('fs');
const basename = path.basename(__filename);

const getFiles = (source, extension) => {
  return readdirSync(source, { withFileTypes: true })
    .filter((file) => {
      if (file.isDirectory()) return file.name;
      return (
        file.isFile()
        && file.name !== basename
        && file.name.indexOf('.') !== 0
        && file.name.split('.').pop() == extension
      )
    })
    .map(file => {
      const directory = path.dirname(`${source}${path.sep}${file.name}`).split(path.sep).pop();
      const parent_directory = directory !== 'routes' ? directory : null;
      if (file.isDirectory()) {
        return {
          is_directory: true,
          name: file.name,
          parent_directory
        };
      }

      const split = file.name.split('.');
      split.pop();
      return {
        is_directory: false,
        name: split.join('.'),
        parent_directory
      };
    });
}

const registerRouter = (app, directory, parent_directory) => {
  getFiles(directory, 'js').forEach((file) => {
    if (file.is_directory) {
      if (parent_directory) {
        parent_directory += file.parent_directory ? `/${file.parent_directory}` : '';
      } else {
        parent_directory = file.parent_directory;
      }

      registerRouter(app, `${directory}${path.sep}${file.name}`, parent_directory);
    } else {
      let router_path = parent_directory ? `/${parent_directory}` : '';
      const router = require(`${directory}/${file.name}`);
      if (file.parent_directory && file.parent_directory !== parent_directory) {
        router_path += `/${file.parent_directory}/${file.name}`;
      } else {
        router_path += `/${file.name}`;
      }

      app.use(router_path, router);
    }
  });
}

module.exports = (app) => {
  registerRouter(app, __dirname);
}
