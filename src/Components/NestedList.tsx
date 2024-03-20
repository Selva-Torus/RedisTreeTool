import { transformArray } from "@/utils/additionalFunctions";
import { getData } from "@/utils/utitsfunction";
import React, { useEffect, useState } from "react";

interface NestedObject {
  [key: string]: any;
}

interface Props {
  data: NestedObject;
  setviewData: any;
}

const NestedList: React.FC<Props> = ({ data, setviewData }) => {
  const [collapsedItems, setCollapsedItems] = useState<string[]>([]);
  const [transformedArray, setTransformedArray] = useState({});

  useEffect(() => {
    setTransformedArray(transformArray(data as any));
  }, []);

  const toggleCollapse = (key: string, path: string) => {
    const item = path ? `${path}.${key}` : key;
    if (collapsedItems.includes(item)) {
      setCollapsedItems(collapsedItems.filter((i) => i !== item));
    } else {
      setCollapsedItems([...collapsedItems, item]);
    }
  };

  const handleGetData = async (path: string) => {
    console.log(path, "path");

    let key = "";
    if (path.endsWith(".config")) {
      key = path.slice(0, -7).split(".").join(":") + ".config";
    } else if (path.endsWith(".WF")) {
      key = path.slice(0, -3).split(".").join(":") + ".WF";
    } else {
      key = path.split(".").join(":");
    }
    const foundObject = data.find((obj: any) => obj.key === key);

    const res = await getData(foundObject.key, foundObject.type);
    console.log(res);

    setviewData(res);
    console.log(foundObject, "foundobject");
  };

  const renderNested = (
    obj: NestedObject,
    depth: number,
    path: string = ""
  ): JSX.Element[] | JSX.Element => {
    return Object.entries(obj).map(([key, value]) => {
      const itemPath = path ? `${path}.${key}` : key;
      if (typeof value === "object" && value !== null) {
        return (
          <li key={key} style={{ marginLeft: depth * 10 + "px" }}>
            <span
              onClick={() => toggleCollapse(key, path)}
              style={{ cursor: "pointer" }}
            >
              {collapsedItems.includes(itemPath) ? "+" : "-"} {key}
            </span>
            {!collapsedItems.includes(itemPath) && (
              <ul>{renderNested(value, depth + 1, itemPath)}</ul>
            )}
          </li>
        );
      } else {
        return (
          <li key={key} style={{ marginLeft: depth * 10 + "px" }}>
            <span
              onClick={() => handleGetData(path)}
              style={{ cursor: "pointer" }}
            >
              {key}: {value}
            </span>
          </li>
        );
      }
    });
  };

  return <ul>{renderNested(transformedArray, 0)}</ul>;
};

export default NestedList;
