"use server";
import redis from "../lib/redis";
const fs = require("fs");

export async function readReddis(tenant) {
  return await redis.call("JSON.GET", tenant);
}

export async function writeReddis(key, json) {
  return await redis.call("JSON.SET", key, "$", JSON.stringify(json));
}

export async function createRedisFiles(obj, currentPath = "", interator) {
  let path = [];

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newPath = `${currentPath}:${key}`;
      path.push(newPath);

      if (typeof obj[key] == "object" && obj[key] !== null) {
        if (interator <= 4) {
          path = path.concat(
            await createRedisFiles(obj[key], newPath, interator + 1)
          );
        } else {
          let arr = newPath.split(":");
          arr.shift();
          const kes = arr.join(":");
          await redis.call("JSON.SET", kes, "$", JSON.stringify(obj[key]));
        }
      }
    }
  }
}

export async function getPathsAndCreateFolders(
  obj,
  currentPath = "",
  interator
) {
  let paths = [];

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newPath = `${currentPath}/${key}`;
      paths.push(newPath);

      if (typeof obj[key] === "object" && obj[key] !== null) {
        if (interator <= 4) {
          if (interator === 1 && fs.existsSync(`./${newPath}`)) {
            await fs.rmSync(`./${newPath}`, {
              recursive: true,
              force: true,
            });
          }
          fs.mkdirSync(`./${newPath}`);
          paths = paths.concat(
            await getPathsAndCreateFolders(obj[key], newPath, interator + 1)
          );
        } else {
          fs.writeFileSync(`./${newPath}.json`, JSON.stringify(obj[key]));
        }
      }
    }
  }
  return paths;
}

export async function newCreatePrcessFlow(edges, node) {
  let nodes = JSON.parse(JSON.stringify(node));
  let edge = JSON.parse(JSON.stringify(edges));

  const initElement = (item, element) => {
    item.role = element.data.role;

    item.nodeType =
      element.property.nodeType == "defaultNode"
        ? element.type
        : element.property.nodeType;

    item.nodeId = element.id;
    if (typeof element?.parentId === "object") {
      item.parentId = [...element?.parentId];
    } else {
      item.parentId = element?.parentId;
    }

    item.nodeName = element.property.name;

    item.nodeDesc = element.property.description;

    return item;
  };

  const addingElements = (item, array) => {
    if (array.filter((x) => x.id === item.id).length === 0) {
      let element = nodes.find((node) => node.id == item.source);

      array.push(initElement(item, element));
    }
  };

  const processFlow = () => {
    const resultObj = {};

    let array = [];

    let removeFields = [
      "source",

      "label",

      "sourceHandle",

      "selected",

      "targetHandle",

      "target",

      "type",

      "markerEnd",

      "id",
    ];

    edge.map((edges) => {
      addingElements(edges, array);
    });

    array.forEach((obj) => {
      let routeArray = [];

      const { source, target } = obj;

      let initRouteObj = {};

      if (!resultObj[source]) {
        resultObj[source] = obj;
      }

      if (obj.label) {
        initRouteObj["conditionResult"] = obj.label;
      }

      initRouteObj["nodeName"] = nodes.find(
        (node) => node.id == target
      ).data.label;

      initRouteObj["nodeId"] = target;

      routeArray.push(initRouteObj);

      if (resultObj[source]?.routeArray?.length > 0) {
        let check = resultObj[source].routeArray.findIndex(
          (index) => obj.nodeId == source
        );

        if (check >= 0) {
          resultObj[source].routeArray.push(initRouteObj);
        }
      } else {
        resultObj[source].routeArray = routeArray;
      }

      Object.keys(resultObj[source]).map((key) => {
        let status = removeFields.includes(key);

        if (status) {
          delete resultObj[source][key];
        }
      });
    });

    const updatedArray = Object.values(resultObj);

    let endNodeElement = nodes.find((node) => node.type == "endNode");

    let item = initElement({}, endNodeElement);

    updatedArray.push(item);

    return updatedArray;
  };

  let processFlowResult = processFlow();

  return processFlowResult;
}

// export async function sortProcessFlow(processFlow) {
//   const nodeIdToIndex = {};
//   processFlow.forEach((node, index) => {
//     nodeIdToIndex[node.nodeId] = index;
//   });

//   const getNodeIndex = (nodeId) => nodeIdToIndex[nodeId];

//   const sortRouteArray = (routeArray) => {
//     return (routeArray || []).sort((a, b) => {
//       const indexA = getNodeIndex(a.nodeId);
//       const indexB = getNodeIndex(b.nodeId);
//       return indexA - indexB;
//     });
//   };

//   const startNodeIds = processFlow
//     .filter((node) => node.nodeType === "startNode")
//     .map((node) => node.nodeId);
//   const endNodeIds = processFlow
//     .filter((node) => node.nodeType === "endNode")
//     .map((node) => node.nodeId);

//   processFlow.sort((a, b) => {
//     if (startNodeIds.includes(a.nodeId)) {
//       return -1;
//     } else if (startNodeIds.includes(b.nodeId)) {
//       return 1;
//     } else if (endNodeIds.includes(a.nodeId)) {
//       return 1;
//     } else if (endNodeIds.includes(b.nodeId)) {
//       return -1;
//     } else {
//       const indexA = getNodeIndex(a.nodeId);
//       const indexB = getNodeIndex(b.nodeId);
//       return indexA - indexB;
//     }
//   });

//   processFlow.forEach((node) => {
//     node.routeArray = sortRouteArray(node.routeArray);
//   });

//   return processFlow;
// }

export async function sortProcessFlow(processFlow) {
  let startNode = processFlow.find((node) => node.nodeType == "startNode");
  let uniId = [];
  processFlow.map((ele) => {
    if (!uniId.includes(ele.nodeId)) {
      uniId.push(ele.nodeId);
    }
  });
  let alterData = [];
  processFlow.map((ele) => {
    if (ele.parentId.length == 0) {
      alterData.push(ele);
    }
    if (ele.parentId.length > 0) {
      if (
        ele.parentId.every((v) => {
          uniId.includes(v);
        })
      ) {
        alterData.push(ele);
      } else {
        alterData.push({
          ...ele,
          parentId: ele.parentId.filter((v) => uniId.includes(v)),
        });
      }
    }
  });
  let proFlow = [];
  proFlow.push(startNode);

  let includedId = [startNode.nodeId];

  for (let j = 0; includedId.length + 1 != alterData.length; ) {
    if (proFlow[j]?.routeArray.length > 0) {
      let route = proFlow[j]?.routeArray;

      for (let rou of route) {
        let data = alterData.find((node) => node.nodeId == rou.nodeId);
        if (
          data.nodeType !== "endNode" &&
          !includedId.includes(data.nodeId) &&
          data.parentId.every((v) => includedId.includes(v))
        ) {
          includedId.push(data.nodeId);
          proFlow.push(data);
          // }
        }
      }
    }

    if (
      processFlow.length == j + 2 &&
      includedId.length + 1 !== processFlow.length
    ) {
      j = 0;
    } else {
      j = j + 1;
    }
  }

  proFlow.push(processFlow.find((node) => node.nodeType == "endNode"));

  return proFlow;
}

export async function serveArtifacts(appName, fabric) {
  const data = await readReddis(fabric);
  try {
    if (data) {
      const parsedData = JSON.parse(data);
      if (
        parsedData.hasOwnProperty(fabric) &&
        parsedData[fabric].hasOwnProperty(appName)
      ) {
        return Object.keys(parsedData[fabric][appName]);
      } else {
        return [];
      }
    } else {
      return [];
    }
  } catch (err) {
    return [];
  }
}

export async function findAllRoutesWithFormatAndDecision(node, edges) {
  let nodes = JSON.parse(JSON.stringify(node));
  let edge = JSON.parse(JSON.stringify(edges));
  let adjacencyList = {};
  const updateLable = (routeArray) => {
    let childRoute = [...routeArray];
    routeArray.forEach((parent) => {
      if (parent?.source) {
        childRoute.map((child) => {
          if (parent.source == child.NodeId) {
            if (parent?.conditionResult) {
              child.conditionResult = parent.conditionResult;
              delete parent.conditionResult;
            }
          }
        });
      }
    });
    childRoute.forEach((e) => {
      delete e.source;
    });
    return childRoute;
  };
  let findAllRoutes = (
    startNode,
    endNode,
    visited = new Set(),
    currentRoute = [],
    allRoutes = []
  ) => {
    visited.add(startNode);
    let getNode = nodes.find((node) => node.id == startNode);
    let nodeObj = {
      NodeId: startNode,
      NodeName: getNode.data.label,
      NodeType: getNode.type,
    };
    currentRoute.push(nodeObj);
    if (startNode === endNode) {
      let flowName = `flow${allRoutes.length + 1}`;
      allRoutes.push({ [flowName]: [...currentRoute] });
    } else if (adjacencyList[startNode]) {
      for (const neighbor of adjacencyList[startNode]) {
        if (!visited.has(neighbor)) {
          findAllRoutes(neighbor, endNode, visited, currentRoute, allRoutes);
        }
      }
    }
    visited.delete(startNode);
    currentRoute.pop();
  };

  const findAllRoutesWithFormatAndDecisionResults = (nodes, edges) => {
    const graph = {};
    edges.forEach((edge) => {
      if (!graph[edge.source]) {
        graph[edge.source] = [];
      }
      graph[edge.source].push({
        target: edge.target,
        sourcenodeid: edge.source,
        label: edge.label,
      });
    });
    const allRoutes = [];
    const dfs = (node, currentRoute) => {
      const neighbors = graph[node] || [];
      neighbors.forEach((neighborInfo) => {
        const newRoute = [
          ...currentRoute,
          {
            nodeId: neighborInfo.target,
            sourcenodeid: neighborInfo.sourcenodeid,
            label: neighborInfo.label,
          },
        ];
        dfs(neighborInfo.target, newRoute);
      });
      if (neighbors.length === 0) {
        allRoutes.push(currentRoute);
      }
    };
    nodes.forEach((node) => {
      if (node.type === "startNode") {
        const startNodeId = node.id;
        dfs(startNodeId, [{ nodeId: startNodeId, label: null }]);
      }
    });
    const formattedRoutes = allRoutes.map((route, index) => {
      let newArray = [];
      let currentConditionResult = null;
      let routeArray = route.map((routeItem) => {
        const sourceNodeId = routeItem.nodeId;
        const sourceNode = nodes.find((node) => node.id === sourceNodeId);
        if (sourceNode) {
          currentConditionResult = routeItem.label;
        }
        let routes = {
          nodeType:
            sourceNode.property.nodeType == "defaultNode"
              ? sourceNode.type
              : sourceNode.property.nodeType,
          NodeId: sourceNode.id,
          Nodename: sourceNode.data.label,
          source: routeItem.sourcenodeid,
        };
        if (currentConditionResult) {
          routes["conditionResult"] = currentConditionResult;
        }
        return routes;
      });
      let routeOptionArray = updateLable(routeArray);
      let flowName = `flow${index + 1}`;
      return { [flowName]: routeOptionArray };
    });
    return formattedRoutes;
  };

  const summeryFlow = () => {
    const adjacencyList = {};
    edge.forEach((edge) => {
      if (!adjacencyList[edge.source]) {
        adjacencyList[edge.source] = [];
      }
      adjacencyList[edge.source].push(edge.target);
    });
    const routesWithFormatAndDecisionResults =
      findAllRoutesWithFormatAndDecisionResults(nodes, edge);
    return routesWithFormatAndDecisionResults;
  };
  let summeryRoutes = summeryFlow();
  return summeryRoutes;
}

export const saveaWorkFlow = async (req, type, version, tenant) => {
  try {
    const workFlows = JSON.parse(JSON.stringify(req.workFlow));
    const nodes = JSON.parse(JSON.stringify(req.workFlow.node));
    const edges = JSON.parse(JSON.stringify(req.workFlow.edge));
    const processFlowSummary = await findAllRoutesWithFormatAndDecision(
      nodes,
      edges
    );

    const result = await newCreatePrcessFlow(edges, nodes);
    const processflowapi = await sortProcessFlow(result);

    if (type === "create") {
      const res = await readReddis(tenant);

      const applications = await JSON.parse(res);

      if (
        applications &&
        applications.hasOwnProperty(tenant) &&
        // applications[tenant].hasOwnProperty(appGroup) &&
        // applications[tenant][appGroup].hasOwnProperty(app) &&
        typeof applications === "object"
        // && Object.keys(applications[tenant][appGroup][app]).length
      ) {
        const application = { ...applications };

        if (application[tenant].hasOwnProperty(req.applicationName)) {
          if (
            application[tenant][req.applicationName].hasOwnProperty(
              req.processFlow
            )
          ) {
            const version = `v${
              Object.keys(
                applications[tenant][req.applicationName][req.processFlow]
              ).length + 1
            }`;
            applications[tenant][req.applicationName][req.processFlow] = {
              ...applications[tenant][req.applicationName][req.processFlow],
              [version]: {
                processFlow: {
                  ...workFlows,
                  ProcessFlow: [...processflowapi],
                },

                processFlowSummary: [...processFlowSummary],
                ...req.configuration,
              },
            };
          } else {
            applications[tenant][req.applicationName] = {
              ...applications[tenant][req.applicationName],
              [req.processFlow]: {
                v1: {
                  processFlow: {
                    ...workFlows,
                    ProcessFlow: [...processflowapi],
                  },

                  processFlowSummary: [...processFlowSummary],
                  ...req.configuration,
                },
              },
            };
          }

          await writeReddis(tenant, application);
          const versions = Object.keys(
            application[tenant][req.applicationName][req.processFlow]
          );

          const appw = JSON.parse(JSON.stringify(application));

          await createRedisFiles(appw, "", 1);
          return {
            msg: "New Application Created",
            versions: versions,
            code: 200,
          };
        } else {
          const version = `v1`;
          applications[tenant][req.applicationName] = {
            ...applications[tenant][req.applicationName],
            [req.processFlow]: {
              [version]: {
                processFlow: {
                  ...workFlows,
                  ProcessFlow: [...processflowapi],
                },

                processFlowSummary: [...processFlowSummary],
                ...req.configuration,
              },
            },
          };

          await writeReddis(tenant, application);

          const versions = Object.keys(
            application[tenant][req.applicationName][req.processFlow]
          );

          const appw = JSON.parse(JSON.stringify(application));

          await createRedisFiles(appw, "", 1);
          return {
            msg: "New Version Created",
            versions: versions,
            code: 200,
          };
        }
      } else {
        const res = await readReddis(tenant);
        let application = { ...(await JSON.parse(res)) };

        let appl = JSON.parse(JSON.stringify(application));
        const version = `v1`;
        if (!appl.hasOwnProperty(tenant)) {
          appl = {
            ...appl,
            [tenant]: {},
          };
        }
        // if (!appl[tenant].hasOwnProperty(appGroup)) {
        //   appl[tenant] = { ...appl[tenant], [appGroup]: {} };
        // }
        // if (!appl[tenant][appGroup].hasOwnProperty(app)) {
        //   appl[tenant][appGroup] = {
        //     ...appl[tenant][appGroup],
        //     [app]: {},
        //   };
        // }

        appl[tenant] = {
          [req.applicationName]: {
            [req.processFlow]: {
              [version]: {
                processFlow: {
                  ...workFlows,
                  ProcessFlow: [...processflowapi],
                },

                processFlowSummary: [...processFlowSummary],
                ...req.configuration,
              },
            },
          },
        };

        await writeReddis(tenant, appl);
        const versions = Object.keys(
          appl[tenant][req.applicationName][req.processFlow]
        );
        const appw = JSON.parse(JSON.stringify(appl));

        await createRedisFiles(appw, "", 1);

        return {
          msg: "New Application Created",
          versions: versions,
          code: 200,
        };
      }
    } else if (type === "update") {
      const res = await readReddis(tenant);
      const applications = await JSON.parse(res);
      const application = { ...applications };

      applications[tenant][req.applicationName][req.processFlow] = {
        ...applications[tenant][req.applicationName][req.processFlow],
        [version]: {
          // ...applications[tenant][req.applicationName][
          //   req.processFlow
          // ][version],
          processFlow: {
            ...workFlows,
            ProcessFlow: [...processflowapi],
          },

          processFlowSummary: [...processFlowSummary],
          ...req.configuration,
        },
      };

      await writeReddis(tenant, application);

      const appw = JSON.parse(JSON.stringify(application));

      await createRedisFiles(appw, "", 1);

      return { msg: `${version} Updated`, code: 201 };
    }
  } catch (error) {
    return error;
  }
};

//version controller
export const versionController = async (
  tenant,
  app = "App1",
  af = "Artifacts1"
) => {
  const res = await readReddis(tenant);
  const applications = await JSON.parse(res);
  let versions = [];
  if (
    applications &&
    applications.hasOwnProperty(tenant) &&
    applications[tenant].hasOwnProperty(app) &&
    applications[tenant][app].hasOwnProperty(af)
  ) {
    versions = Object.keys(applications[tenant][app][af]);
  }
  return versions;
};

//version server
export const versionServer = async (DF, app, af, version) => {
  const res = await readReddis(DF);
  const applications = await JSON.parse(res);
  const obj = applications[DF][app][af][version];
  let result = obj.processFlow;
  let config = {};
  Object.keys(obj).forEach((key) => {
    if (key !== "processFlow" || key !== "processFlowSummary") {
      config[key] = obj[key];
    } else {
      return true;
    }
  });
  return { result, config };
};

//file Syncer
export const fileSyncer = async (key) => {
  const res = await readReddis(key);
  const applications = await JSON.parse(res);
  if (applications && Object.keys(applications).length) {
    let keys = await getPathsAndCreateFolders(applications, "", 1);
    return applications;
  }
};

//SaveDefaultsForProcessFabrics
export const SaveDefaultConfigVersion = async (key, value) => {
  const fabrics = await readReddis(key);
  if (!fabrics) {
    const res = await writeReddis(key, { v1: value });
    return res;
  } else {
    const version = `v${Object.keys(JSON.parse(fabrics)).length + 1}`;
    const res = await writeReddis(key, {
      ...JSON.parse(fabrics),
      [version]: value,
    });
    return res;
  }
};

export const versionServerDefaultConfig = async (key) => {
  try {
    const fabrics = await readReddis(key);
    return Object.keys(JSON.parse(fabrics));
  } catch (err) {
    return [];
  }
};

//Currently for saving ERD diagram and can be reused in further additions
export const saveERDiagram = async (key, appName, artifacts, value) => {
  const fabrics = await readReddis(key);
  if (!fabrics) {
    const res = await writeReddis(key, {
      [key]: { [appName]: { [artifacts]: { v1: JSON.parse(value) } } },
    });

    await createRedisFiles(
      {
        [key]: { [appName]: { [artifacts]: { v1: JSON.parse(value) } } },
      },
      "",
      1
    );

    return res;
  } else {
    const fab = JSON.parse(fabrics);
    if (
      fab.hasOwnProperty(key) &&
      Object.keys(fab[key]).includes(appName) &&
      fab[key][appName].hasOwnProperty(artifacts)
    ) {
      const version = `v${
        Object.keys(fab[key][appName][artifacts]).length + 1
      }`;
      const file = {
        ...fab[key][appName][artifacts],
        [version]: JSON.parse(value),
      };
      fab[key][appName][artifacts] = file;
      const res = await writeReddis(key, fab);
      await createRedisFiles(fab, "", 1);
      return res;
    } else {
      const fab = JSON.parse(fabrics);
      const file = {
        ...fab[key][appName],
        [artifacts]: { v1: JSON.parse(value) },
      };
      fab[key][appName] = file;
      const res = await writeReddis(key, fab);
      await createRedisFiles(fab, "", 1);
      return res;
    }
  }
};

export const updateDiagram = async (
  key,
  appName,
  artifacts,
  version,
  value
) => {
  try {
    const fabrics = await readReddis(key);
    const fab = JSON.parse(fabrics);
    if (
      fabrics &&
      fab.hasOwnProperty(key) &&
      fab[key].hasOwnProperty(appName) &&
      fab[key][appName].hasOwnProperty(artifacts) &&
      fab[key][appName][artifacts].hasOwnProperty(version) &&
      fab[key][appName][artifacts][version]
    ) {
      const file = {
        ...fab[key][appName][artifacts],
        [version]: JSON.parse(value),
      };
      fab[key][appName][artifacts] = file;
      const res = await writeReddis(key, fab);
      return res;
    } else {
      return { key: "else" };
    }
  } catch (err) {
    return { key: "err" };
  }
};

export const versionServerERD = async (key, appName, artifacts) => {
  try {
    const fabrics = await readReddis(key);
    const fab = JSON.parse(fabrics);
    if (
      fabrics &&
      fab.hasOwnProperty(key) &&
      Object.keys(fab[key]).includes(appName) &&
      Object.keys(fab[key][appName]).includes(artifacts)
    ) {
      return Object.keys(fab[key][appName][artifacts]);
    } else {
      return [];
    }
  } catch (err) {
    return [];
  }
};

export const serveDataForERD = async (key, appName, artifacts, version) => {
  try {
    const fabrics = await readReddis(key);
    const fab = JSON.parse(fabrics);
    if (
      fabrics &&
      fab.hasOwnProperty(key) &&
      Object.keys(fab[key]).includes(appName) &&
      Object.keys(fab[key][appName]).includes(artifacts) &&
      Object.keys(fab[key][appName][artifacts]).includes(version)
    ) {
      return fab[key][appName][artifacts][version];
    } else {
      return {};
    }
  } catch (err) {
    return {};
  }
};

export async function getAllKeys() {
  try {
    // Get all keys
    const keys = await redis.keys("*");

    const keysWithTypes = await Promise.all(
      keys.map(async (key) => {
        const type = await redis.type(key);
        return { key, type };
      })
    );

    // Log the keys
    return keysWithTypes;
  } catch (error) {
    console.error("Error:", error);
  }
}

export async function getData(key, keyType) {
  switch (keyType) {
    case "string":
      return await redis.get(key);
    case "hash":
      return await redis.hgetall(key);
    case "list":
      return await redis.lrange(key, 0, -1);
    case "set":
      return await redis.smembers(key);
    case "zset":
      return await redis.zrange(key, 0, -1, "WITHSCORES");
    case "stream":
      return await redis.xrange(key, "-", "+");
    case "ReJSON-RL":
      const res = await redis.call("JSON.GET", key);
      return JSON.parse(res);
    default:
      return "";
  }
}

export async function postData(post) {
  const { key, value, jsonContent, valueType, restValues } = post;
  switch (valueType) {
    case "string":
      return await redis.call("SET", key, value);
    case "json":
      return await redis.call("JSON.SET", key, "$", jsonContent);
    case "hash":
      let resultArray = [];
      for (let i = 1; i <= Object.keys(restValues).length; i++) {
        const key = `key${i}`;
        const valueKey = `value${i}`;

        if (key in restValues && valueKey in restValues) {
          resultArray.push(restValues[key], restValues[valueKey]);
        }
      }
      return await redis.hmset(key, ...resultArray);
    case "list":
      const array = Object.values(restValues);
      return await redis.rpush(key, ...array);
    case "set":
      const arr_set = Object.values(restValues);
      return await redis.sadd(key, ...arr_set);
    case "sorted-set":
      let arr = [];
      for (let index = 0; index < Object.keys(restValues).length; index++) {
        arr.push(index + 1, Object.values(restValues)[index]);
      }
      return await redis.zadd(key, ...arr);
    case "stream":
      let resArray = [];
      for (let i = 1; i <= Object.keys(restValues).length; i++) {
        const key = `key${i}`;
        const valueKey = `value${i}`;

        if (key in restValues && valueKey in restValues) {
          resArray.push(restValues[key], restValues[valueKey]);
        }
      }
      return await redis.xadd(key, "*", ...resArray);
    default:
      return "error occured";
  }
}

export async function getString(keys) {
  console.log(keys);
  const data = await redis.call("GET", keys);
  console.log(data);
  return data;
}

export async function deleteData(key) {
  const deletedKey = await redis.del(key);
  return deletedKey;
}

// export async function deleteAllData() {
//   const deletedKey = await redis.flushdb();
//   return 'ellathayum delete panniten daaaaa'
// }
