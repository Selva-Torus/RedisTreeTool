"use client";
import { getAllDataFromRedis, getData } from "@/utils/utitsfunction";
import React, { useEffect, useState } from "react";
import NestedList from "./NestedList";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  User,
  Pagination,
  Selection,
  SortDescriptor,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@nextui-org/react";
import DatasettingModal from "./DatasettingModal";
import { getAllKeys } from "./apiCallUnit";
import { typeOptions } from "./data";
import { capitalize } from "./utils";

interface NestedObject {
  [key: string]: any;
}

interface Key {
  key: string;
  type: string;
}

const RedisFolder = ({ setviewData, setRedisView }: any) => {
  const [data, setData] = useState<NestedObject>({});
  const [typeFilter, setTypeFilter] = React.useState<Selection>("all");

  function fetchData() {
    getAllDataFromRedis().then((res: any) => {
      if (res && Array.isArray(res)) {
        setData(res);
      }
    });
  }

  useEffect(() => {
    fetchData();
  }, []);

  // useEffect(() => {
  //   getAllDataFromRedis().then((res: any) => {
  //     if (res && Array.isArray(res)) {
  //       setData(res);
  //     }
  //   });
  // }, []);

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
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <div>
      <div className="flex w-full justify-between">
        <div>
          <Button onClick={Show}> Delete</Button>
        </div>
        <div className="flex gap-4">
          <Button onClick={onOpen} color="primary" className="flex gap-1">
            <span className="font-bold">Add New</span>
          </Button>
          <div className="flex gap-3 items-center">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button variant="flat">Types</Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={typeFilter}
                selectionMode="multiple"
                onSelectionChange={setTypeFilter}
              >
                {typeOptions.map((type) => (
                  <DropdownItem key={type.uid} className="capitalize">
                    {capitalize(type.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </div>
      <div>
        {Object.keys(data).length ? (
          <NestedList
            data={data}
            setviewData={setviewData}
            checkedData={checkedData}
            setcheckedData={setcheckedData}
            setRedisView={setRedisView}
          />
        ) : (
          <>djdh</>
        )}
      </div>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top-center">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Post Data
              </ModalHeader>
              <ModalBody>
                <DatasettingModal onClose={onClose} fetchData={fetchData} />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default RedisFolder;
