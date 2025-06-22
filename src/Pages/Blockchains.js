import React, { useState, useEffect } from "react";
import {
  PlusIcon,
  ReLoadIcon,
  DropDownIcon,
  HorzontalMenuIcon,
  DelIcon,
  PropertiesIcon,
} from "../Icons";

import AddNewBlockchains from "../components/AddNewBlockchains";
import Toggle from "../components/Toggle";
import Modal from "../components/Modal";
import { getBlockchainList, removeBlockchainList, updateBlockchain } from "../api/executers/blockchain";
import { formatDate } from "../utils";
import { toast, ToastContainer } from "react-toastify";
import Spinner from "../components/Spinner/Spinner";
import UpdateBlockchain from "../components/UpdateBlockchain";

const Blockchains = () => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [blockchainList, setBlockchainList] = useState([])
  const [openUpdate, setOpenUpdate] = useState(false);
  const [currentAsset, setCurrentAsset] = useState();


  const handleGetBlockChain = async () => {
    setIsLoading(true)
    try {
      const resp = await getBlockchainList()
      if (resp.success) {
        setBlockchainList(resp.data)
      }
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false)

  }

  const handleDeleteBlockchain = async (id) => {
    setIsLoading(true)

    try {
      const resp = await removeBlockchainList(id)
      if (resp.success) {
        toast.success(resp.message)
      }
      else {
        toast.error(resp.message)
      }

    } catch (error) {
      console.error(error);
    }

    handleGetBlockChain()
    setIsLoading(false)

  }
  // handle edit asset
  const handleEditAsset = (asset) => {
    setCurrentAsset(asset)
    setOpenUpdate(true);
  };

  const handleStatusBlockchain = async (e, id) => {
    let payload = {
      status: e,
      id: id
    }
    try {
      const resp = await updateBlockchain(payload)
      if (resp.success) {
        toast.success(resp.message)
      }
      else {
        toast.error(resp.message)
      }
    } catch (error) {
      console.error(error);
    }
    handleGetBlockChain()
  }

  useEffect(() => {
    handleGetBlockChain()
  }, [])

  return (

    <>
      <ToastContainer
        position="top-right"
        autoClose={1500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      {isLoading && <Spinner />}

      <div className="blockchain-page flex flex-col">
        <div className="wrapWidth wrap flex flex-col">
          <div className="pg-hder flex aic">
            <div className="page-tag">Blockchains</div>
            <div className="right-side flex aic">
              <div className="actions flex aic">
                <div className="btn-load button flex aic" onClick={handleGetBlockChain}>
                  <div className="ico">
                    <ReLoadIcon />
                  </div>
                  <div className="btn-lbl">Reload</div>
                </div>
                <div
                  className="btn-new button flex aic"
                  onClick={(e) => setOpen(true)}
                >
                  <div className="ico">
                    <PlusIcon />
                  </div>
                  <div className="btn-lbl">Blockchains</div>
                </div>
              </div>
            </div>
          </div>
          <div className="table-blk flex">
            <div className="crypto-tbl flex flex-col">
              <div className="tbl-row flex aic">
                <div className="row-item flex">ID</div>
                <div className="row-item flex">Code</div>
                <div className="row-item flex">Name</div>
                <div className="row-item flex">Logo</div>

                {/* <div className="row-item flex">Client</div>
              <div className="row-item flex">Height</div>
              <div className="row-item flex">Created At</div> */}
                <div className="row-item flex">Status</div>
                <div className="row-item flex">Action</div>
              </div>
              {blockchainList.map((item, i) => (
                <div className="tbl-row flex aic">
                  <div className="row-item flex">{item.id}</div>
                  <div className="row-item flex">{item.asset_code} </div>
                  <div className="row-item flex">{item.asset_name}</div>
                  <div className="row-item flex">
                    <img src={item.icon_url} alt="" className="w-10 h-10" />
                  </div>
                  {/* <div className="row-item flex">{formatDate(item.created_at)}</div> */}
                  <div className="row-item flex">
                    <Toggle data={item.status} onChange={(e) => handleStatusBlockchain(e, item.id)} />
                  </div>
                  <div className="row-item flex  ">
                    <button className="border px-5 py-2 border-[#a6aebb]" onClick={() => handleDeleteBlockchain(item.id)}>
                      <DelIcon />
                    </button>
                    <button className="border px-5 py-2 border-[#a6aebb]" onClick={() => handleEditAsset(item)}>
                      <PropertiesIcon />
                    </button>

                  </div>

                </div>
              ))}
              <div className="tbl-row flex aic">
                <div className="row-item flex"></div>
                <div className="row-item flex"></div>
                <div className="row-item flex"></div>
                <div className="row-item flex"></div>
                <div className="row-item flex"></div>
                <div className="row-item flex"></div>
                <div className="row-item flex"></div>
              </div>
            </div>
          </div>
        </div>
        <Modal open={open} onClose={() => setOpen(false)}>
          <AddNewBlockchains open={open} setOpen={setOpen} handleGetBlockChain={handleGetBlockChain} />
        </Modal>
      </div>

      <Modal open={openUpdate} onClose={() => setOpenUpdate(false)}>

        <UpdateBlockchain
          open={openUpdate}
          currentAsset={currentAsset}
          setOpen={setOpenUpdate}
          setIsLoading={setIsLoading}
          handleGetBlockChain={handleGetBlockChain} />
      </Modal>
    </>
  );
};

export default Blockchains;