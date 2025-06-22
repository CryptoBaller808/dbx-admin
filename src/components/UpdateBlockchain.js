import React, { useState, useEffect } from "react";
import {
  CrossIcon,
  GeneralIcon,
  DepositIcon,
  WidthDrwal,
  PropertiesIcon,
  DropDownIcon,
  PlusIcon,
} from "../Icons";
import Toggle from "./Toggle";
import { ToastContainer, toast } from "react-toastify";
import { useAuthContext } from "../context/AuthContext";
import axios from "axios";
import { API_URL } from '../config'
import TextField from '@mui/material/TextField';
import assert from "assert";

import Autocomplete from '@mui/material/Autocomplete';
import Modal from "react-responsive-modal";
import { Button } from "@mui/material";
import { addBlockchain, getSingleBlockchain, updateBlockchain } from "../api/executers/blockchain";
import UploadButton from "./UploadButton";
import { uploadFile } from "../api/executers/uploadFile";
// import top100Films from './top100Films';


const UpdateBlockchain = ({ setOpen, currentAsset,
  setIsLoading,
  handleGetBlockChain }) => {

  const { currentUser } = useAuthContext();
  const [step, setStep] = useState("General");
  const [isError, setIsError] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [originalData, setOriginalData] = useState({});
  const [formData, setFormData] = useState({
    asset_code: "",
    asset_name: "",
    visible: false,
    symbol: "",
    type: "",
    subunit: null,
    precision: null,
    blockchain_key: "",
    icon_url: null,
    status: null
  })

  // headers for axios 
  let headers = {
    Authorization: `Bearer ${currentUser}`
  }

  const validatefields = () => {
    const { asset_code, asset_name, visible, symbol, type, subunit, precision, blockchain_key, icon_url } = formData;

    if (!asset_code || !asset_name || !visible || !symbol || !type || !subunit || !precision || blockchain_key || icon_url) {
      setIsError(true)
      return false;
    }
    return true; // Validation passed
  };


  //update blockchain

  const handleGetSingleBlockchain = async (id) => {
    setIsLoading(true)
    try {
      const resp = await getSingleBlockchain(id)
      if (resp.success) {
        setFormData({
          asset_code: resp.data.asset_code || "",
          asset_name: resp.data.asset_name || "",
          visible: resp.data.visible || false,
          symbol: resp.data.symbol || "",
          type: resp.data.type || "",
          subunit: resp.data.subunit || null,
          precision: resp.data.precision || null,
          blockchain_key: resp.data.blockchain_key || "",
          icon_url: resp.data.icon_url || "",
          status: resp.data.status || "",
        });
        setOriginalData(resp.data); // Store original data for comparison

      }

    } catch (error) {
      console.error(error);
    }
    setIsLoading(false)
  }

  useEffect(() => {
    handleGetSingleBlockchain(currentAsset.id)
  }, [])


  // add new blockchain  

  const updateAddBlockchain = async () => {
    setIsLoading(true)
    validatefields()
    // Compare formData with originalData to find updated fields 
    const updatedFields = Object.keys(formData).reduce((acc, key) => {
      if (formData[key] !== originalData[key]) {
        acc[key] = formData[key];
      }
      return acc;
    }, {});

    // Check if there are any changes
    if (Object.keys(updatedFields).length === 0) {
      toast.info("No changes detected.");
      return;
    }

    const finalPayload = {
      ...updatedFields,
      id: originalData.id
    }

    try {
      if (finalPayload.icon_url) {
        const formdata = new FormData();
        formdata.append("file", formData.icon_url);

        const response = await uploadFile(formdata);
        if (response) {
          const payload = {
            ...finalPayload,
            icon_url: response.data,
          }
          const resp = await updateBlockchain(payload)
          if (resp.success) {
            toast.success(resp.message)
          }
        }
      }
      else {
        const resp = await updateBlockchain(finalPayload)
        if (resp.success) {
          toast.success(resp.message)
        }
      }


    } catch (error) {
      console.error(error);

    }
    handleGetBlockChain()
    setOpen(false)
    setIsLoading(false)
  }

  const handleIconChange = async (file) => {
    setFormData((prevData) => ({
      ...prevData,
      icon_url: file,
    }));

    setSelectedFile(file)
  };

  return (
    <>

      <div className="add-currencie flex flex-col">
        <div className=" wrap flex flex-col">
          <div className="add-hdr flex aic">
            <div className="lbl">Update Blockchains</div>
            <div className="close-side flex">
              <div
                className="icon-close flex aic jc"
                onClick={(e) => setOpen(false)}
              >
                <CrossIcon />
              </div>
            </div>
          </div>
          <div className="data-block flex">
            <div className="left flex flex-col">
              <div className="road-map flex flex-col">

                <div
                  className={`item flex aic ${step === "General" ? "active" : ""
                    } `}
                >
                  <div className="item-lbl flex">General</div>
                  <div className="item-icon flex aic jc ">
                    <GeneralIcon />
                  </div>
                </div>

              </div>
            </div>
            {step === "General" && (
              <div className="right flex flex-col">
                <div className="flex items-center gap-5">
                  <div className="field flex flex-col visible-label">
                    <div className="f-lbl">Visible</div>
                    <Toggle data={formData.visible} onChange={(e) => setFormData(prevFormData => ({
                      ...prevFormData,
                      visible: e,
                    }))} />
                  </div>
                  <div className="field flex flex-col visible-label">
                    <div className="f-lbl">Status</div>
                    <Toggle data={formData.status} onChange={(e) => setFormData(prevFormData => ({
                      ...prevFormData,
                      status: e,
                    }))} />
                  </div>
                </div>
                <div className="field flex flex-col">
                  <TextField

                    label="Name"
                    variant="outlined"

                    value={formData?.asset_name}
                    onChange={(e) => setFormData({ ...formData, asset_name: e.target.value })}
                    className="w-full custom-number-input"
                  />
                </div>
                <div className="field flex flex-col">
                  <TextField

                    label="Code"
                    variant="outlined"
                    value={formData?.asset_code}
                    onChange={(e) => setFormData({ ...formData, asset_code: e.target.value })}
                    className="w-full custom-number-input"
                  />

                </div>
                <div className="field flex flex-col gap-7">
                  <TextField
                    id="symbol"
                    label="Symbol"
                    variant="outlined"

                    value={formData?.symbol}
                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                    className="w-full custom-number-input"
                  />
                  <Autocomplete
                    disablePortal
                    value={
                      formData.type
                        ? { name: formData.type, label: formData.type } // Match type to the corresponding label
                        : null
                    }
                    options={[
                      { name: "1", label: "1" },
                      { name: "2", label: "2" },
                      { name: "3", label: "3" }
                    ]}
                    getOptionLabel={(option) => option.label}
                    className="w-full custom-number-input"
                    renderInput={(params) => <TextField {...params} label="Type" />}
                    onChange={(event, newValue) => {

                      setFormData({ ...formData, type: newValue ? newValue.name : "" });

                    }}
                  />

                  <TextField
                    id="subunits"
                    label="Subunits"
                    variant="outlined"
                    value={formData?.subunit || ""}
                    onChange={(e) => setFormData({ ...formData, subunit: Number(e.target.value) })}
                    className="w-full custom-number-input"
                  />
                  <TextField

                    label="Percision"
                    variant="outlined"
                    value={formData?.precision || ""}
                    onChange={(e) => setFormData({ ...formData, precision: Number(e.target.value) })}
                    className="w-full custom-number-input"
                  />
                  {/* <Autocomplete
                    disablePortal
                    value={
                      formData.type
                        ? { name: formData.blockchain_key, label: formData.blockchain_key } // Match type to the corresponding label
                        : null
                    }
                    options={[
                      { name: "key1", label: "key1" },
                      { name: "key2", label: "key2" },
                      { name: "key3", label: "key3" }
                    ]}
                    className="w-full custom-number-input"
                    renderInput={(params) => <TextField {...params} label="Blockchain key" />}
                    onChange={(event, newValue) => {
                      setFormData({ ...formData, blockchain_key: newValue ? newValue.name : "" });
                    }}
                  /> */}

                  <TextField
                    label="Blockchain key"
                    variant="outlined"
                    value={formData?.blockchain_key}
                    onChange={(e) => setFormData({ ...formData, blockchain_key: e.target.value })}
                    className="w-full custom-number-input"
                  />
                  <div>
                    <div className="f-lbl">Update icon</div>
                    <div className="mb-3"><UploadButton onChange={handleIconChange} />
                      {
                        (!selectedFile && formData.icon_url) && <img src={formData?.icon_url} alt="" style={{ width: '100px', height: '100px', objectFit: 'cover', marginTop: "12px" }} />
                      }
                    </div>
                  </div>

                  {/* <TextField

                    label="Icon url"
                    variant="outlined"
                    value={formData?.icon_url}
                    onChange={(e) => setFormData({ ...formData, icon_url: e.target.value })}
                    sx={{
                      height: '50px',
                      '& .MuiOutlinedInput-root': {
                        height: '46px',
                      },
                      '& .MuiInputLabel-root': {
                        lineHeight: '46px',
                      }
                    }}
                    className="w-full"
                  /> */}
                </div>

                {isError && <div className="field flex flex-col">
                  <p className="isValid">Please fill all the required fields</p>
                </div>}
              </div>
            )}
          </div >

          <div className="action flex aic justify-end">
            <div type="submit" className="btn button" onClick={updateAddBlockchain}>
              Update
            </div>
          </div>
        </div >
      </div >

    </>
  );
};

export default UpdateBlockchain