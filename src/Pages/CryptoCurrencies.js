import React, { useState, useEffect } from "react";
import {
  PlusIcon,
  ReLoadIcon,
  DropDownIcon,
  HorzontalMenuIcon,
  WarnningIcon,
  DelIcon,
  PropertiesIcon,
  UpIcon,
  CrossIcon,
} from "../Icons";

import AddNewCurrencie from "../components/AddNewCurrencie";
import Toggle from "../components/Toggle";
import Modal from "../components/Modal";
import { useAuthContext } from "../context/AuthContext";
import axios from "axios";
import Spinner from "../components/Spinner/Spinner";
import EditIcon from "../Icons/EditIcon";
import { ToastContainer, toast } from "react-toastify";
import UpdateCurrency from "../components/UpdateCurrency";
import { API_URL } from '../config';
import ImageUplodaer from "../components/ImageUplodaer";

import logofile from 'cryptocurrency-icons/manifest.json'
import { getCryptoCurrencyList, updateCryptoCurrency } from "../api/executers/cryptoCurrency";
import { formatDate } from "../utils";

// const requireLogo = require.context('../Crypto_logo', false, /\.svg$/);
// const logos = requireLogo.keys().map(requireLogo);

const CryptoCurrencies = () => {
  const [open, setOpen] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [openAction, setOpenAction] = useState(false);


  const [openLogo, setOpenLogo] = useState(false);
  const [hide, setHide] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAsset, setCurrentAsset] = useState();
  const [currentLogoAsset, setLogoCurrentAsset] = useState();
  const [selectedRow, setSelectedRow] = useState(null);


  const [statusData, setStatusData] = useState([
    { id: 'swap', title: "Swap" },
    { id: 'exchange', title: "Exchange" },

  ]);
  const [selectedStatus, setSelectedStatus] = useState("swap");

  const { currentUser, verifyJwt } = useAuthContext();
  const [selectedcompany, setselectedcompany] = useState();

  // headers for axios
  let headers = {
    Authorization: `Bearer ${currentUser}`,
  };

  const [cryptoVal, setCrytoVal] = useState([]);

  // get asset list
  const getAssetsList = async (type) => {
    setIsLoading(true);

    try {
      const resp = await getCryptoCurrencyList(type)
      if (resp) {

        setCrytoVal(resp?.data)
      }

    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  // delete asset
  const handleDeleteAsset = async (id) => {
    setIsLoading(true);

    try {
      const res = await axios.post(
        `${API_URL}/admindashboard/assets/delete`,
        { id },
        { headers: headers }
      );
      let checkExpiry = verifyJwt(res?.data);
      if (checkExpiry) {
        const getData = await getAssetsList();
        toast.success(res.data?.data, {
          position: "top-right",
          autoClose: 1500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      }
      setIsLoading(false);
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  };



  // update asset


  const handleUpdateAssetsModal = (item) => {
    setOpenAction(true)
    setSelectedRow(item)
  }

  const handleUpdateAsset = async () => {
    // setIsLoading(true);
    let payload;
    if (selectedStatus === "swap") {
      payload = {
        id: selectedRow.id,
        is_swap: false,
        asset_code: selectedRow.asset_code
      }
    }
    else if (selectedStatus === "exchange") {
      payload = {
        id: selectedRow.id,
        is_exchange: false,
        asset_code: selectedRow.asset_code
      }
    }

    try {
      const res = await updateCryptoCurrency(payload)
      if (res.success) {
        toast.success(res.message);
        getAssetsList(selectedStatus)
      }
      setIsLoading(false);
    } catch (e) {
      setIsLoading(false);
    }
    setOpenAction(false)
  };

  // handle edit asset
  const handleEditAsset = (asset) => {
    setCurrentAsset(asset);
    setOpenUpdate(true);
  };
  //handle upload logo
  const handleUploadLogo = (item) => {
    setOpenLogo(true)
    setLogoCurrentAsset(item)


  }
  const handleUpdatelogo = (img) => {
    const updatedAsset = {
      ...currentLogoAsset,
      asset_img: img
    };
    setCrytoVal((prevList) =>
      prevList.map((asset) =>
        asset.id === updatedAsset.id ? updatedAsset : asset
      )
    );

    // setCrytoVal((prevList) =>
    //   prevList.map((asset, i) =>
    //     i === index ? updatedAsset : asset
    //   )
    // );
    setOpenLogo(false);

  };

  useEffect(() => {
    document.addEventListener("click", () => {
      setHide(false);
    });
    getAssetsList(selectedStatus);

  }, []);

  const hanldeStatus = () => {
    setSelectedStatus(selectedcompany);

    getAssetsList(selectedStatus.id)
  }

  const handleVisibleChange = async (e, id) => {
    let payload = {
      visible: e,
      id: id
    }
    try {
      const resp = await updateCryptoCurrency(payload)
      if (resp.success) {
        toast.success(resp.message)
      }
      else {
        toast.error(resp.message)
      }
    } catch (error) {
      console.error(error);
    }
  }

  const handleDepositChange = async (e, id) => {
    let payload = {
      deposit: e,
      id: id
    }
    try {
      const resp = await updateCryptoCurrency(payload)
      if (resp.success) {
        toast.success(resp.message)
      }
      else {
        toast.error(resp.message)
      }
    } catch (error) {
      console.error(error);
    }
  }


  const handleWithdrawChange = async (e, id) => {
    let payload = {
      withdraw: e,
      id: id
    }

    try {
      const resp = await updateCryptoCurrency(payload)
      if (resp.success) {
        toast.success(resp.message)
      }
      else {
        toast.error(resp.message)
      }
    } catch (error) {
      console.error(error);
    }
  }

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
      <div className="crpto-page flex flex-col">
        <div className="wrapWidth wrap flex flex-col">
          <div className="pg-hder flex aic">
            <div className="page-tag">Cryptocurrencies</div>
            <div className="right-side flex aic">
              <div className="actions flex aic">
                <div className="dropDown flex aic jc flex-col rel">
                  <div className="category flex aic">
                    <div
                      className="cbox cleanbtn flex aic rel"
                      onClick={(e) => {
                        e.stopPropagation();
                        setHide(!hide);
                      }}
                    >
                      <div className="slt flex aic">
                        <div className="unit-name flex aic font s14 b4">
                          <span
                            className="unit-eng flex aic font s14 b4"
                            placeholder="Swap"
                          >
                            {selectedcompany ? selectedcompany.title : "Swap"}
                          </span>
                        </div>
                      </div>

                      <div>
                        <DropDownIcon />
                      </div>
                    </div>
                  </div>
                  <div className={`block flex aic abs ${hide ? "show" : ""}`}>
                    <div className="manue flex aic col anim">
                      {statusData.map((item, index) => (
                        <div
                          key={index}
                          className="slt flex aic"
                          onClick={(e) => {
                            setHide(!hide);
                            getAssetsList(item.id)
                            setselectedcompany(item);
                            setSelectedStatus(item.id)
                            // hanldeStatus()
                          }}
                        >
                          <div className="unit-name flex aic font s14 b4">
                            <span className="unit-eng flex aic font s14 b4">
                              {item.title}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div
                  className="btn-load button flex aic"
                  onClick={() => getAssetsList(selectedStatus
                  )}
                >
                  <div className="ico">
                    <ReLoadIcon />
                  </div>
                  <div className="btn-lbl">Reload</div>
                </div>
                <div
                  className="btn-new button flex aic"
                  onClick={() => setOpen(true)}
                >
                  <div className="ico">
                    <PlusIcon />
                  </div>
                  <div className="btn-lbl">New Currency</div>
                </div>


              </div>
            </div>
          </div>
          <div className="my-table flex ">
            <div className="table-blk flex ">
              <div className="crypto-tbl flex flex-col ">
                <div className="tbl-row flex aic">
                  <div className="row-item flex">Code</div>
                  <div className="row-item flex">Name</div>
                  <div className="row-item flex">ledger</div>
                  <div className="row-item flex">Logo</div>
                  <div className="row-item flex">Created At</div>
                  <div className="row-item flex">Visible</div>
                  <div className="row-item flex">Deposit</div>
                  <div className="row-item flex">Withdrawl</div>
                  <div className="row-item flex">Actions</div>
                </div>
                {cryptoVal?.map((item, i) => (
                  <div className="tbl-row flex aic">
                    <div className="row-item flex">{item?.asset_code}</div>
                    <div className="row-item flex">{item?.asset_name} </div>
                    <div className="row-item flex">{item?.ledger} </div>


                    <div className="row-item flex">
                      {/* {item?.icon_url ? ( */}
                      <img src={item.icon_url} alt="Asset" className="w-10 h-10" />
                      {/* ) : (
                        <button className="button !p-[5px]"
                          onClick={() => {
                            handleUploadLogo(item);

                          }}

                        > Upload</button>

                      )} */}
                    </div>
                    <div className="row-item flex">  {formatDate(item?.created_at)} </div>
                    < div className="row-item flex" >
                      <Toggle data={item?.visible} onChange={(e) => handleVisibleChange(e, item.id)} />
                    </div>

                    <div className="row-item flex">
                      <Toggle data={item?.deposit} onChange={(e) => handleDepositChange(e, item.id)} />
                    </div>

                    <div className="row-item flex">
                      <Toggle data={item?.withdraw} onChange={(e) => handleWithdrawChange(e, item.id)} />
                    </div>
                    <div className="row-item flex">
                      <div className="r-actions flex aic">
                        <div
                          className="ico icon-del flex aic jc"
                          title="Delete Asset"
                          onClick={() => handleUpdateAssetsModal(item)}
                        >
                          <DelIcon />
                        </div>
                        <div
                          className="ico icon-up flex aic jc"
                          title="Edit Asset"
                          onClick={() => handleEditAsset(item)}
                        >
                          <PropertiesIcon />
                        </div>
                      </div>
                    </div>
                    <Modal open={openAction} onClose={() => setOpenAction(false)}>
                      <div className="bg-white p-4 w-96">
                        <div className="flex items-center justify-between mb-3 ">
                          <p className="text-lg font-semibold"> Delete Asset </p>
                          <div className="bg-[#f3f4f8] h-10 w-10 rounded-full flex justify-center cursor-pointer">
                            <div
                              className="icon-close flex aic jc"
                              onClick={(e) => setOpenAction(false)}
                            >
                              <CrossIcon />
                            </div>
                          </div>
                        </div>
                        <p className="text-md font-medium mb-3">Do you want to delete the asset?</p>

                        <div className="w-full flex justify-end gap-3">
                          <button onClick={() => setOpenAction(false)} className="border py-2 px-3 rounded-md">Cancel</button>
                          <button onClick={() => handleUpdateAsset()} className="border py-2 px-3 rounded-md bg-red-600 text-white">Delete</button>
                        </div>
                      </div>
                    </Modal>
                  </div>
                ))}
                {/* <div className="tbl-row flex aic">
                  <div className="row-item flex"></div>
                  <div className="row-item flex"></div>
                  <div className="row-item flex"></div>
                  <div className="row-item flex"></div>
                  <div className="row-item flex"></div>
                  <div className="row-item flex"></div>
                  <div className="row-item flex"></div>
                </div> */}
              </div>
            </div>
          </div>


          <Modal open={open} onClose={() => setOpen(false)}>
            <AddNewCurrencie
              open={open}
              setOpen={setOpen}
              setIsLoading={setIsLoading}
              getAssetsList={getAssetsList}
              selectedStatus={selectedStatus}
            />
          </Modal>
          <Modal open={openUpdate} onClose={() => setOpenUpdate(false)}>
            <UpdateCurrency
              open={openUpdate}
              currentAsset={currentAsset}
              setOpen={setOpenUpdate}
              setIsLoading={setIsLoading}
              getAssetsList={getAssetsList}
              selectedStatus={selectedStatus}
            />
          </Modal>
          {/* upload logo model */}
          <Modal open={openLogo} onClose={() => setOpenLogo(false)}>

            <div
              className="add-currencie flex flex-col p-4 rounded-lg bg-white max-h-[80vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="text-lg font-bold">Select Logo</div>
                <div className="flex items-center justify-center cursor-pointer">

                </div>
              </div>

              <div className="flex flex-col gap-2 w-full">
                <div className="w-full">
                  <div className="grid grid-cols-5 gap-4">
                    {/* {logos.map((logo, index) => {
                      const logoSymbol = logo.replace('/static/media/', '').split('.')[0];
                      const logoData = logofile.find(
                        (item) => item.symbol.toLocaleLowerCase() === logoSymbol.toLocaleLowerCase()
                      );

                      return (
                        <div
                          key={index}
                          className="border-2 border-gray-300 p-2 rounded-lg text-center w-30 h-30 flex flex-col justify-center items-center"
                          onClick={() => {
                            handleUpdatelogo(logo)
                          }}
                        >
                          <img
                            src={logo}
                            alt={`Logo ${index}`}
                            className="w-20 h-20 object-contain"
                          />
                          {logoData && <p className="mt-2 text-sm  break-words">{logoData.name}</p>}
                        </div>
                      );
                    })} */}
                  </div>
                </div>
              </div>


            </div>



          </Modal>
        </div >
      </div >
    </>
  );
};

export default CryptoCurrencies;
