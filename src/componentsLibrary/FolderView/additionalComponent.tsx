"use client";
import { getAllDataFromRedis } from "@/utils/utitsfunction";
import React, { useEffect, useState } from "react";
import NestedList from "./NestedList";

interface NestedObject {
  [key: string]: any;
}

const MyComponent: React.FC = () => {
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
      {Object.keys(data).length ? <NestedList data={data} /> : <>djdh</>}
    </div>
  );
};

export default MyComponent;
