"use client";
import React from "react";
import RedisFolder from "@/Components/RedisFolder";
import ShowJson from "@/Components/ShowJson";
//Main
interface Key {
  key: string;
  type: string;
}
export default function Home() {
  const [redisView, setRedisView] = React.useState<Key>({ key: "", type: "" });
  const [data, setData] = React.useState(null);

  return (
    <main className="flex w-full h-[93vh] mt-3">
      {/* <MyComponent />  */}
      <div
        className={`${
          data
            ? "overflow-y-auto overflow-x-hidden px-2 w-3/4 resize-x max-w-3/4"
            : "w-full px-2"
        }`}
      >
        <RedisFolder setviewData={setData} />
      </div>
      {data && (
        <div
          className={` ${
            data
              ? "overflow-auto w-1/4 pl-2 mt-5 resize-x max-w-1/2 min-w-1/4"
              : null
          }`}
        >
          <ShowJson
            data={data}
            setData={setData}
            selectedKey={redisView.key}
            selectedDataType={redisView.type}
          />
        </div>
      )}
    </main>
  );
}
