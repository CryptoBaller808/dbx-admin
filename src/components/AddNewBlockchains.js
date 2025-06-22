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
import { addBlockchain } from "../api/executers/blockchain";
import UploadButton from "./UploadButton";
import { uploadFile } from "../api/executers/uploadFile";
// import top100Films from './top100Films';


const AddNewBlockchains = ({ setOpen, handleGetBlockChain, setIsLoading, getTransactionDetails }) => {

  const { currentUser } = useAuthContext();
  const [step, setStep] = useState("General");
  const [isError, setIsError] = useState(false);

  const [formData, setFormData] = useState({
    asset_code: "",
    asset_name: "",
    visible: false,
    symbol: "",
    type: "",
    subunit: null,
    precision: null,
    blockchain_key: "",
    icon_url: "",
    status: false
  })

  // headers for axios 
  let headers = {
    Authorization: `Bearer ${currentUser}`
  }

  const validatefields = () => {
    const { asset_code, asset_name, visible, symbol, type, subunit, precision, blockchain_key, icon_url, status } = formData;

    if (!asset_code || !asset_name || !visible || !symbol || !type || !subunit || !precision || blockchain_key || icon_url || !status) {
      setIsError(true)
      return false;
    }
    return true; // Validation passed
  };


  // add new blockchain  

  const handleAddBlockchain = async () => {
    validatefields()
    const finalPayload = {
      asset_code: formData.asset_code,
      asset_name: formData.asset_name,
      visible: formData.visible,
      symbol: formData.symbol,
      type: formData.type,
      subunit: formData.subunit,
      precision: formData.precision,
      blockchain_key: formData.blockchain_key,
      icon_url: formData.icon_url,
      status: formData.status
    }
    try {

      if (formData.icon_url) {
        const formdata = new FormData();
        formdata.append("file", formData.icon_url);

        const response = await uploadFile(formdata);

        if (response) {
          const payload = {
            ...finalPayload,
            icon_url: response.data
          };
          const resp = await addBlockchain(payload)
          if (resp.success) {
            toast.success(resp.message)
          }
        }
      }
    } catch (error) {
      console.error(error);

    }
    handleGetBlockChain()
    setOpen(false)
  }


  const handleIconChange = async (file) => {
    setFormData((prevData) => ({
      ...prevData,
      icon_url: file,
    }));
  };

  return (
    <>

      <div className="add-currencie flex flex-col">
        <div className=" wrap flex flex-col">
          <div className="add-hdr flex aic">
            <div className="lbl">New Blockchains</div>
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
                    <Toggle onChange={(e) => setFormData(prevFormData => ({
                      ...prevFormData,
                      visible: e,
                    }))} />
                  </div>
                  <div className="field flex flex-col visible-label">
                    <div className="f-lbl">Status</div>
                    <Toggle onChange={(e) => setFormData(prevFormData => ({
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
                    options={[
                      { name: "type1", label: "1" },
                      { name: "type2", label: "2" },
                      { name: "type3", label: "3" }
                    ]}
                    getOptionLabel={(option) => option.label}
                    className="w-full custom-number-input"
                    renderInput={(params) => <TextField {...params} label="Type" />}
                    onChange={(event, newValue) => {
                      setFormData({ ...formData, type: newValue ? newValue.name : "" });

                    }}
                  />
                  <TextField

                    label="Subunits"
                    variant="outlined"
                    value={formData?.subunit}
                    onChange={(e) => setFormData({ ...formData, subunit: Number(e.target.value) })}
                    className="w-full custom-number-input"
                  />
                  <TextField

                    label="Percision"
                    variant="outlined"
                    value={formData?.precision}
                    onChange={(e) => setFormData({ ...formData, precision: Number(e.target.value) })}
                    className="w-full custom-number-input"
                  />
                  {/* <Autocomplete
                    disablePortal
                    options={[
                      { name: "key1", label: "key1" },
                      { name: "key2", label: "key2" },
                      { name: "key3", label: "key3" }
                    ]}
                    sx={{
                      width: 330, height: '46px',
                      '& .MuiOutlinedInput-root': {
                        height: '46px',

                      },
                    }}
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
                    <div className="f-lbl">Upload icon</div>
                    <UploadButton onChange={handleIconChange} />
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
            <div type="submit" className="btn button" onClick={handleAddBlockchain}>
              Submit
            </div>
          </div>
        </div >
      </div >

    </>
  );
};

export default AddNewBlockchains