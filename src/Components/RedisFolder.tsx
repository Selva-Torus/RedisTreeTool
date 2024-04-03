"use client";
import { getAllDataFromRedis, getData } from "@/utils/utitsfunction";
import React, { useEffect, useState } from "react";
import NestedList from "./NestedList";

interface NestedObject {
  [key: string]: any;
}

const RedisFolder = ({ setviewData }: any) => {
  const [data, setData] = useState<NestedObject>({});

  useEffect(() => {
    getAllDataFromRedis().then((res: any) => {
      if (res && Array.isArray(res)) {
        setData(res);
      }
    });
  }, []);

  const [checkedData, setcheckedData] = useState<any>([]);

  const Show = () => {
    console.log("checkedData", checkedData);

    var delArray: any = [];

    for (let i = 0; i < checkedData.length; i++) {
      data.map((ele) => {
        if (ele.key.includes(checkedData[i])) delArray = [...delArray, ele.key];
      });
    }

    let uniqueArray = delArray.filter((item, index) => {
      return delArray.indexOf(item) === index;
    });
    console.log("del array", uniqueArray);
  };

  return (
    <div>
      <div>
        <button onClick={Show}>show</button>
      </div>
      <div>
        {Object.keys(data).length ? (
          <NestedList
            data={data}
            setviewData={setviewData}
            checkedData={checkedData}
            setcheckedData={setcheckedData}
          />
        ) : (
          <>djdh</>
        )}
      </div>
    </div>
  );
};

export default RedisFolder;
