import { transformArray } from "@/utils/additionalFunctions";
import { getData } from "@/utils/utitsfunction";
import React, { useEffect, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowForward } from "react-icons/io";
import { FaRegFolderOpen } from "react-icons/fa";
import { FaRegFolder } from "react-icons/fa";
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
    setviewData(res);
  };

  const getPath = (newpath) => {
    const array = newpath.split(".");
  };

  const renderNested = (
    obj: NestedObject,
    depth: number,
    path: string = ""
  ): JSX.Element[] | JSX.Element => {
    return Object.entries(obj).map(([key, value], index) => {
      const itemPath = path ? `${path}:${key}` : key;
      const isEven = index % 2 === 0;
      const listItemStyle = {
        backgroundColor: isEven ? "#f3f4f6" : "#ffffff",
      };

      if (typeof value === "object" && value !== null) {
        return (
          <li key={key} style={listItemStyle}>
            <div
              className="flex items-center cursor-pointer text-blue-500 hover:text-blue-700"
              onClick={() => toggleCollapse(key, path)}
              style={{ paddingLeft: `${depth * 20}px` }}
            >
              <input
                type="checkbox"
                className="mr-2"
                onClick={() => checkEle(itemPath)}
              />
              {collapsedItems.includes(itemPath) ? (
                <FaRegFolderOpen size={20} />
              ) : (
                <FaRegFolder size={20} />
              )}
              <span className="ml-2">{key}</span>
            </div>
            {collapsedItems.includes(itemPath) && (
              <ul>{renderNested(value, depth + 1, itemPath)}</ul>
            )}
          </li>
        );
      } else {
        return (
          <li key={key} style={listItemStyle}>
            <span
              className="cursor-pointer text-green-500 hover:text-green-700"
              onClick={() => handleGetData(path)}
              style={{ paddingLeft: `${depth * 20}px` }}
            >
              {key}: {value}
            </span>
          </li>
        );
      }
    });
  };

  const checkEle = (itemPath) => {
    if (checkedData.includes(itemPath)) {
      const allele = checkedData;
      const index = allele.indexOf(itemPath);
      allele.splice(index, 1);
      setcheckedData(allele);
      return;
    }

    let index: any = [];
    let except: any = [];

    for (let i = 0; i < checkedData.length; i++) {
      if (checkedData[i].includes(itemPath)) index = [...index, i];
      else except.push(checkedData[i]);
    }

    if (index.length) {
      const dd = checkedData;
      for (let i = 0; i < index.length; i++) dd.splice(index[i], 1, ":");

      dd.push(itemPath);

      for (let i = 0; i < dd.length; i++)
        if (dd[i] === ":") {
          dd.splice(i, 1);
          i = i - 1;
        }

      setcheckedData([...dd, ...except]);
    } else {
      setcheckedData((pre) => [...pre, itemPath]);
    }
  };

  return <ul>{renderNested(transformedArray, 0)}</ul>;
};

export default NestedList;
