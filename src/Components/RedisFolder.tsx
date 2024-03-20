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

  return (
    <div>
      {Object.keys(data).length ? (
        <NestedList data={data} setviewData={setviewData} />
      ) : (
        <>djdh</>
      )}
    </div>
  );
};

export default RedisFolder;
