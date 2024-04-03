import { postData } from "@/Components/apiCallUnit";
import { Button, Input, Select, SelectItem, Textarea } from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { typeOptions } from "./data";
import { capitalize } from "./utils";

const DatasettingModal = ({ onClose, fetchData }: any) => {
  const [post, setPost] = React.useState({
    key: "",
    value: "",
    valueType: "",
    jsonContent: "",
    restValues: {},
  });
  const [count, setCount] = useState([1]);
  const handleClick = () => {
    const arr = [...count];
    const max = count[count.length - 1] + 1;
    arr.push(max);
    setCount(arr);
  };
  const handleRestValueChange = (e: any) => {
    const { name, value } = e.target;
    setPost((prevPost) => ({
      ...prevPost,
      restValues: {
        ...prevPost.restValues,
        [name]: value,
      },
    }));
  };
  useEffect(() => {
    setCount([1]);
    setPost((prev) => ({ ...prev, restValues: {} }));
  }, [post.valueType]);

  const handleSaveData = async () => {
    if (!post.key || !post.valueType) {
      toast.error("Please enter necessary credentials", {
        theme: "colored",
        // style: { backgroundColor: "blue" , color: "white" },
      });
    } else {
      const res = await postData(post);
      if (res) {
        toast.success("New Data added successfully", {
          // style: { backgroundColor: "green", color: "white" },
          theme: "colored",
        });
        onClose();
        fetchData();
      }
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-center items-center gap-2 p-2 ">
      <div className="flex flex-row gap-2 w-full justify-center items-center p-2  ">
        <Input
          style={{ border: "none", boxShadow: "none" }}
          autoFocus
          id="key"
          label="key"
          value={post?.key}
          // placeholder="Enter your key"
          variant="bordered"
          onChange={(e) => setPost({ ...post, key: e.target.value })}
        />
        <Select
          items={typeOptions}
          label="type"
          placeholder="Type"
          className="max-w-xs"
          onChange={(e) => setPost({ ...post, valueType: e.target.value })}
        >
          {(item) => (
            <SelectItem key={item.uid}>{capitalize(item.name)}</SelectItem>
          )}
        </Select>
      </div>
      {post.valueType === "string" && (
        <div className="w-full px-2">
          <Textarea
            id="value"
            onChange={(e) => setPost({ ...post, value: e.target.value })}
            className="text-right"
          >
            Value
          </Textarea>
        </div>
      )}
      {post.valueType === "ReJSON-RL" && (
        <div className="w-full px-2">
          <Textarea
            id="jsonContent"
            onChange={(e) => setPost({ ...post, jsonContent: e.target.value })}
            className="text-right"
          >
            JSON Content
          </Textarea>
        </div>
      )}
      {["hash", "stream"].includes(post.valueType) && (
        <div className="flex flex-col mb-2">
          <div>
            {count.map((item) => (
              <div
                className="flex justify-center w-full gap-2 p-1 mb-2"
                key={item}
              >
                <Input
                  className="w-1/2"
                  type="text"
                  name={`key${item}`}
                  onChange={handleRestValueChange}
                  placeholder={`Enter value for key${item}`}
                />
                <Input
                  className="w-1/2"
                  type="text"
                  name={`value${item}`}
                  onChange={handleRestValueChange}
                  placeholder={`Enter value for value${item}`}
                />
              </div>
            ))}
          </div>
          <div className="w-full flex justify-center">
            <Button size="sm" onClick={handleClick}>
              {" "}
              Add Column{" "}
            </Button>
          </div>
        </div>
      )}
      {["graph", "list", "set", "zset"].includes(post.valueType) && (
        <div className="flex flex-col mb-2">
          <div>
            {count.map((item) => (
              <div
                className="flex justify-center w-full gap-2 p-1 mb-2"
                key={item}
              >
                <Input
                  type="text"
                  name={`value${item}`}
                  onChange={handleRestValueChange}
                  placeholder={`Enter value for value${item}`}
                />
              </div>
            ))}
          </div>
          <Button size="sm" onClick={handleClick}>
            {" "}
            Add Column{" "}
          </Button>
        </div>
      )}
      <Button className="w-full" color="primary" onClick={handleSaveData}>
        Save
      </Button>
    </div>
  );
};

export default DatasettingModal;
