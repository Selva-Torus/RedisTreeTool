import { transformArray } from "@/utils/additionalFunctions";
import { getData } from "@/utils/utitsfunction";
import React, { useEffect, useState } from "react";

interface NestedObject {
  [key: string]: any;
}

interface Props {
  data: NestedObject;

  setviewData: any;
  checkedData: any;
  setcheckedData: any;
}

const NestedList: React.FC<Props> = ({
  data,
  setviewData,
  checkedData,
  setcheckedData,
}) => {
  const [collapsedItems, setCollapsedItems] = useState<string[]>([]);
  const [transformedArray, setTransformedArray] = useState({});

  useEffect(() => {
    setTransformedArray(transformArray(data as any));
  }, []);

  const toggleCollapse = (key: string, path: string) => {
    const item = path ? `${path}:${key}` : key;
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

  const getPath = (newpath) => {
    console.log(newpath);

    const array = newpath.split(".");
    console.log(transformedArray);

    // array.forEach((x, i) => {
    //   console.log(x, i);
    // });
  };

  const renderNested = (
    obj: NestedObject,
    depth: number,
    path: string = ""
  ): JSX.Element[] | JSX.Element => {
    const checkEle = (itemPath) => {
      console.log(itemPath);
      // console.log(checkedData);

      // checkedData.map((ele) => {
      //   console.log(ele.indexOf(itemPath) !== -1);
      // });

      if (checkedData.includes(itemPath)) {
        const allele = checkedData;
        const index = allele.indexOf(itemPath);
        allele.splice(index, 1);
        setcheckedData(allele);
        return;
      }

      setcheckedData((pre) => [...pre, itemPath]);
    };

    return Object.entries(obj).map(([key, value]) => {
      const itemPath = path ? `${path}:${key}` : key;
      if (typeof value === "object" && value !== null) {
        return (
          <li key={key} style={{ marginLeft: depth * 10 + "px" }}>
            <span
              onClick={() => toggleCollapse(key, path)}
              style={{ cursor: "pointer" }}
            >
              <input
                type="checkbox"
                // id="vehicle1"
                // name="vehicle1"
                // value="Bike"
                onClick={() => {
                  // console.log(key);

                  // setCheck((pre) => !pre);
                  checkEle(itemPath);
                }}
              ></input>
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
