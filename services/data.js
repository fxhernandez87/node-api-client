// Dependencies
const fs = require('fs');
const path = require('path');
const {promisify} = require('util');

// Lets make functions with callback, to return a promise instead
const openFile = promisify(fs.open);
const closeFile = promisify(fs.close);
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const readDir = promisify(fs.readdir);
const deleteFile = promisify(fs.unlink);

// create the service wrapper to manipulate different entities
const dataService = entity => {
  // if the entity is not a string or length == 0 will throw an error
  if (typeof entity !== 'string' || !entity.length)
    throw new Error('Invalid Entity');

  const baseDir = path.join(__dirname, '../.data');

  const validateFileName = func => async (fileName, ...data) => {
    if (typeof fileName !== 'string' || !fileName.length)
      throw {code: 'CUSTOM', message: 'Invalid fileName'};

    return func(fileName, ...data);
  };

  /**
   * Possible Errors: [EEXIST, EACCES, EISDIR]
   */
  const create = async (fileName, data) => {
    // create the file with the name informed
    const fileDescriptor = await openFile(`${baseDir}/${entity}/${fileName}.json`, 'wx');
    // write the data in JSON format
    await writeFile(fileDescriptor, JSON.stringify(data));
    // close the file
    return closeFile(fileDescriptor);
  };

  /**
   * Possible Errors: [EACCES, EISDIR, ENOENT]
   */
  const update = async (fileName, data) => {
    // open the file with the name informed, if it does not exist we will create it, else we will truncate it
    const fileDescriptor = await openFile(`${baseDir}/${entity}/${fileName}.json`, 'w');
    // write the data in JSON format
    await writeFile(fileDescriptor, JSON.stringify(data));
    // close the file
    return closeFile(fileDescriptor);
  };

  /**
   * Possible Errors: [EACCES, EISDIR, ENOENT]
   */
  const read = async fileName => {
    // open the file in read mode, it ll fail if it does not exist
    const fileDescriptor = await openFile(`${baseDir}/${entity}/${fileName}.json`, 'r');
    // read the data and save it to a variable
    const fileData = await readFile(fileDescriptor, 'utf8');
    // close the file
    await closeFile(fileDescriptor);
    // return the promise with the file data
    return JSON.parse(fileData);
  };

  /**
   * Possible Errors: [EACCES, EISDIR, ENOENT]
   */
  const remove = async fileName => deleteFile(`${baseDir}/${entity}/${fileName}.json`);

  /**
   * Possible Errors: [EACCES, ENOENT, ENOTDIR]
   */
  const list = async () => {
    // read the directory 'Entity'
    const fileList = await readDir(`${baseDir}/${entity}`);
    // remove the extension
    return fileList.map(file => file.trim().replace(/(\..*)$/, ''));
  };


  return {
    create: validateFileName(create),
    update: validateFileName(update),
    read: validateFileName(read),
    remove: validateFileName(remove),
    list,
  }
};

module.exports = dataService;
