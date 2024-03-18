interface NestedObject {
  [key: string]: NestedObject | string;
}

interface ALLKeys {
  key: string ,
  type : string
}

export function transformArray(data: ALLKeys[]) {
  let result: NestedObject = {};

  if (Array.isArray(data)) {
    data.forEach((obj: ALLKeys) => {
      const keys = obj.key.split(":");
      let currentDict = result;
      for (let key of keys) {
        if (!currentDict[key]) {
          currentDict[key] = {};
        }
        currentDict = currentDict[key] as NestedObject;
      }
      currentDict[keys[keys.length - 1]] = keys[keys.length - 1];
    });
    return result;
  } else {
    return false;
  }
}
