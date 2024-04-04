"use client";
import { getAllDataFromRedis } from "@/utils/utitsfunction";
import React, { useEffect, useState } from "react";
import NestedList from "./NestedList";
import {
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Selection,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
} from "@nextui-org/react";
import DatasettingModal from "./DatasettingModal";
import { typeOptions } from "./data";
import { capitalize } from "./utils";
import { deleteData } from "./apiCallUnit";

interface NestedObject {
  [key: string]: any;
}

interface Key {
  key: string;
  type: string;
}

const RedisFolder = ({ setviewData, setRedisView }: any) => {
  const [allData, setAllData] = useState<NestedObject>({});

  const [data, setData] = useState<NestedObject>({});
  const [checkedData, setcheckedData] = useState<any>([]);
  const [typeFilter, setTypeFilter] = React.useState<Selection>("all");
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [filterValue, setFilterValue] = React.useState("");
  const [deleteModal, setDeleteModal] = useState(false);

  const [bulkDeleteData, setBulkDeleteData] = useState<any>([]);

  const hasSearchFilter = Boolean(filterValue);

  function fetchData() {
    getAllDataFromRedis().then((res: any) => {
      if (res && Array.isArray(res)) {
        console.log(res);

        setData(res);
        setAllData(res);
      }
    });
  }

  useEffect(() => {
    fetchData();
  }, []);

  const filterWithTypes = () => {
    let filteredKeys = allData;
    if (hasSearchFilter) {
      filteredKeys = filteredKeys.filter((item: Key) =>
        item.key.toLowerCase().includes(filterValue.toLowerCase())
      );
    }
    if (
      typeFilter !== "all" &&
      Array.from(typeFilter).length !== typeOptions.length
    ) {
      filteredKeys = filteredKeys.filter((item: Key) =>
        Array.from(typeFilter).includes(item.type)
      );
    }
    setData(filteredKeys);
    // console.log(typeFilter);

    // console.log(typeof typeFilter);
  };
  useEffect(() => {
    filterWithTypes();
  }, [typeFilter]);

  const handleBulkDelete = async () => {
    // checkedData contains all deleting keys for child and parent
    console.log("checkedData", checkedData);
    var allKeys: any = [];
    for (let i = 0; i < data.length; i++) {
      allKeys = [...allKeys, data[i].key];
    }

    var final: any = [];
    for (let i = 0; i < checkedData.length; i++) {
      for (let j = 0; j < allKeys.length; j++) {
        if (allKeys[j] == checkedData[i]) {
          final = [...final, checkedData[i]];
          break;
        }
      }

      if (checkedData[i].includes(":")) {
        var temp = checkedData[i].split(":");
        // console.log("temp", temp);
        for (let j = 0; j < allKeys.length; j++) {
          if (allKeys[j].includes(":")) {
            var temp2 = allKeys[j].split(":");
            // console.log("temp2", temp2);
            for (let k = 0; k < temp2.length; k++) {
              if (temp2[k] == temp[k]) {
                // console.log("called");
                if (temp.length - 1 == k) {
                  final = [...final, allKeys[j]];
                  break;
                }
                // k++;
                continue;
              }
              break;
            }
          }
        }
      } else {
        for (let j = 0; j < allKeys.length; j++) {
          var temp = allKeys[j].split(":");
          if (temp[0] == checkedData[i]) final = [...final, allKeys[j]];
        }
      }
    }

    let uniqueArray = final.filter((item, index) => {
      return final.indexOf(item) === index;
    });

    console.log(uniqueArray);

    setBulkDeleteData(uniqueArray);
    setDeleteModal(true);

    return;
  };

  const reCheck = (id: any) => {
    alert(id);
    // const temp = bulkDeleteData;
    // temp.splice(id, 1);
    // setBulkDeleteData(temp);
    return 1;
  };

  async function performBulkDelete() {
    try {
      let res = await Promise.all(
        Array.from(bulkDeleteData).map((key) => deleteData(key))
      );
      console.log(res);
      if (res) {
        fetchData();
      }
    } catch (error) {
      console.log(error);
    } finally {
      setDeleteModal(false);
    }
  }

  function hadleDeletUI() {
    return (
      <div className="flex w-full justify-end gap-2">
        <Button size="sm" onClick={() => setDeleteModal(false)}>
          cancel
        </Button>
        <Button
          size="sm"
          color="danger"
          onClick={() => {
            performBulkDelete();
          }}
        >
          Delete
        </Button>
      </div>
    );
    // return (
    //   <div className="w-full h-full">
    //     <div className="grid grid-cols-2">
    //       {bulkDeleteData.map((ele, id) => (
    //         <div key={id} className="flex gap-2">
    //           <div>{ele}</div>
    //           <Button size="sm" onClick={() => reCheck(id)}>
    //             X
    //           </Button>
    //         </div>
    //       ))}
    //     </div>
    //   </div>
    // );
  }

  return (
    <div>
      <div className="flex w-full justify-between">
        <div>
          <Button onClick={handleBulkDelete}> Delete</Button>
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
      <Modal
        isOpen={deleteModal}
        onOpenChange={setDeleteModal}
        placement="center"
        // className="w-[80vw] h-[80vh]"
      >
        <ModalContent>
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="px-1 py-2">
                <div className="text-small font-bold">
                  Confirm Delete Action
                </div>
                <div className="text-tiny">
                  Are you sure you want to delete the selected items?
                </div>
                <div className="text-tiny">This action cannot be undone </div>
              </div>
            </ModalHeader>
            <ModalBody>{hadleDeletUI()}</ModalBody>
          </>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default RedisFolder;
