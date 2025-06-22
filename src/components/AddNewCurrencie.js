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
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Modal from "react-responsive-modal";
import { addCryptoCurrency } from "../api/executers/cryptoCurrency";
import UploadButton from "./UploadButton";
import { uploadFile } from "../api/executers/uploadFile";
// import top100Films from './top100Films';


const AddNewCurrencie = ({ setOpen, getAssetsList, selectedStatus, setIsLoading }) => {

  const { currentUser } = useAuthContext();
  const [hide, setHide] = useState(false);
  const [hide2, setHide2] = useState(false);

  const [step, setStep] = useState("General");
  const [step2, setStep2] = useState(false);
  const [step3, setStep3] = useState(false);
  const [step4, setStep4] = useState(false);
  const [isError, setIsError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");

  const [formData, setFormData] = useState({
    asset_code: "",
    asset_name: "",
    asset_issuer: "",
    ledger: "",
    is_live_net: false,
    visible: false,
    deposit: false,
    symbol: "",
    type: "",
    subunit: null,
    precision: null,
    blockchain_key: "",
    icon_url: null,
    deposit_fee: null,
    min_deposit_amount: null,
    min_collection_amount: null,
    withdraw: false,
    withdraw_fee: null,
    min_withdraw_amount: null,
    withdraw_limit_24hr: null,
    properties: {
      erc20_contract_address: "",
      gas_limit: null,
      gas_price: null

    },
    is_swap: null,
    is_exchange: null
  })

  // headers for axios 
  let headers = {
    Authorization: `Bearer ${currentUser}`
  }
  const mapList = [
    { lbl: "General", icon: <GeneralIcon /> },
    { lbl: "Deposit", icon: <DepositIcon /> },
    { lbl: "Withdrawal", icon: <WidthDrwal /> },
    { lbl: "Properties", icon: <PropertiesIcon /> },
  ];
  const Next = () => {
    if (step === "General") {
      setStep("Deposit");
      setStep2(true);
    }
    if (step == "Deposit") {
      setStep("Withdrawal");
      setStep3(true);
    }
    if (step == "Withdrawal") {
      setStep("Properties");
      setStep4(true);
    }

    // if (step4 === "Properties") {
    //   setStep4("Properties");
    //   console.log("Step 4");
    // }
  };

  const [addProp, setAddProp] = useState([
    { txt: { value: "" } },
    { txt: { value: "" } },
    { txt: { value: "" } },
  ]);

  // add new asset 



  const validateStep = () => {
    if (step === 'General') {
      if (
        !formData.asset_code ||
        !formData.asset_name ||
        (!formData.is_swap && !formData.is_exchange) ||
        !formData.symbol ||
        !formData.type ||
        !formData.subunit ||
        !formData.precision ||
        !formData.blockchain_key ||
        !formData.icon_url
      ) {
        setIsError(true);
      } else {
        setIsError(false);

        setStep("Deposit");
        setStep2(true);
      }
    }
    else if (step === 'Deposit') {
      if (
        !formData.deposit_fee ||
        !formData.min_deposit_amount ||
        !formData.min_collection_amount
      ) {

        setIsError(true);
      } else {
        setIsError(false);

        setStep("Withdrawal");
        setStep3(true);
      }
    } else if (step === 'Withdrawal') { // Withdrawal step
      if (
        !formData.withdraw_fee ||
        !formData.min_withdraw_amount ||
        !formData.withdraw_limit_24hr 
      ) {

        setIsError(true);
      } else {
        setIsError(false);

        setStep("Properties");
        setStep4(true);
      }
    } else if (step === 'Properties') { // Properties step
      handleAddCrypto()
    }
  };


  const handleAddCrypto = async () => {
    const { gas_limit, gas_price, erc20_contract_address } = formData.properties
    const finalPayload = {
      ...formData,
      gas_limit, gas_price, erc20_contract_address,
      properties: {
        network: null,
        smart_contract: null
      },
    }

    try {
      if (formData.icon_url) {
        const formdata = new FormData();
        formdata.append("file", formData.icon_url);

        const response = await uploadFile(formdata);

        if (response && response.data) {
          const payload = {
            ...finalPayload,
            icon_url: response.data
          };

          // Send the payload to your API
          const resp = await addCryptoCurrency(payload);
          if (resp.success) {
            toast.success(resp.data);
          }
        }
      } else {
        // Handle the case where no icon is provided
        const resp = await addCryptoCurrency(finalPayload);
        if (resp.success) {
          toast.success(resp.data);
        }
      }
    } catch (error) {
      console.error(error);
    }

    // Refresh the assets list and close the form/modal
    getAssetsList(selectedStatus);
    setOpen(false);
  };

  const handleIconChange = async (file) => {
    setFormData((prevData) => ({
      ...prevData,
      icon_url: file,
    }));
  };

  const handlePropertiesChange = (key, value) => {
    const updatedValue = key === "gas_limit" || key === "gas_price" || key === "subunit" // Add any other numeric keys here
      ? Number(value)  // Convert value to number
      : value;  // Keep as string if it's not a numberwithdraw_limit_24hr

    setFormData(prevFormData => ({
      ...prevFormData,
      properties: {
        ...prevFormData.properties,
        [key]: updatedValue
      }
    }));
  };
  //handle remove property
  const handleRemove = (key) => {
    setFormData((prev) => {
      const updatedProperties = { ...prev.properties };
      delete updatedProperties[key];
      return { ...prev, properties: updatedProperties };
    });
  };

  const handleAddProperty = (key, value) => {
    if (!key || !value) {
      setIsError(true)
    } else {
      setFormData((prev) => ({
        ...prev,
        properties: {
          ...prev.properties,
          [key]: value,
        },
      }));
      setKey("");
      setValue("");
      setModalOpen(false);
    }


  }
  const handleOpenModel = () => {
    setIsError(false)
    setModalOpen(true)
    setKey("")
    setValue("")
  }

  const propertiesJsonString = JSON.stringify(formData.properties, null, 2);
  

  useEffect(() => {
    document.addEventListener("click", () => {
      setHide(false);
      setHide2(false);
    });
  }, []);
  return (
    <>

      <div className="add-currencie flex flex-col">
        <div className=" wrap flex flex-col">
          <div className="add-hdr flex aic">
            <div className="lbl">New Cryptocurrency</div>
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
                {/* {mapList.map((item, index) => (
                <div
                  className={`item flex aic ${
          step === "General" ? "active" : ""
                  } ${ step === "Deposit" ? "active" : "" } ${
        step === "Withdrawal" ? "active" : ""e
      } ${ step === "Properties" ? "active" : "" } `}
                >
                  <div className="item-lbl flex">{item.lbl}</div>
                  <div className="item-icon flex aic jc ">{item.icon}</div>
                </div>
              ))} */}
                <div  
                  onClick={() => setStep("General")}
                  className={`item flex aic ${step === "General" ? "active" : ""
                } `}
                >
                  <div className="item-lbl flex">General</div>
                  <div className="item-icon flex aic jc ">
                    <GeneralIcon />
                  </div>
                </div>
               
                <div  className={`item flex aic ${step2 ? "active" : ""} `}>
                  <div className="item-lbl flex">Deposit</div>
                  <div className="item-icon flex aic jc ">
                    <DepositIcon />
                  </div>
                </div>
                <div className={`item flex aic ${step3 ? "active" : ""} `}>
                  <div className="item-lbl flex">Withdrawal</div>
                  <div className="item-icon flex aic jc ">
                    <WidthDrwal />
                  </div>
                </div>
                <div className={`item flex aic ${step4 ? "active" : ""} `}>
                  <div className="item-lbl flex">Properties</div>
                  <div className="item-icon flex aic jc ">
                    <PropertiesIcon />
                  </div>
                </div>
              </div>
            </div>
            {step === "General" && (
              <div className="right flex flex-col">
                <div className="flex items-center justify-between">
                  <div className="field flex flex-col visible-label">
                    <div className="f-lbl">Visible</div>
                    <Toggle onChange={(e) => setFormData(prevFormData => ({
                      ...prevFormData,
                      visible: e,
                    }))} />
                  </div>
                  <div className="field flex flex-col visible-label">
                    <div className="f-lbl">Live net?</div>
                    <Toggle onChange={(e) => setFormData(prevFormData => ({
                      ...prevFormData,
                      is_live_net: e,
                    }))} />
                  </div>
                  <div className="field flex flex-col visible-label">
                    <div className="f-lbl">Swap </div>
                    <Toggle onChange={(e) => setFormData(prevFormData => ({
                      ...prevFormData,
                      is_swap: e,
                    }))} />
                  </div>
                  <div className="field flex flex-col visible-label">
                    <div className="f-lbl">Exchange </div>
                    <Toggle onChange={(e) => setFormData(prevFormData => ({
                      ...prevFormData,
                      is_exchange: e,
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

                  {/* <div className="f-lbl">Asset Name</div>
                  <input
                    type="text"
                    className="txt cleanbtn"
                    placeholder="Name"
                    value={formData?.asset_name}
                    onChange={(e) => setFormData({ ...formData, asset_name: e.target.value })}
                  /> */}
                </div>
                <div className="field flex flex-col">
                  <TextField

                    label="Code"
                    variant="outlined"
                    value={formData?.asset_code}
                    onChange={(e) => setFormData({ ...formData, asset_code: e.target.value })}
                    className="w-full custom-number-input"
                  />
                  {/* <div className="field flex flex-col">
                    <div className="f-lbl">For Livenet?</div>
                    <input
                      type="checkbox"
                      onChange={(e) =>
                        setFormData({ ...formData, is_live_net: e.target.checked })
                      }
                      checked={formData?.is_live_net}
                    />
                  </div> */}

                  {/* <div className="f-lbl">Asset Code</div>
                  <input
                    type="text"
                    className="txt cleanbtn"
                    placeholder="Code"
                    value={formData?.asset_code}
                    onChange={(e) => setFormData({ ...formData, asset_code: e.target.value })}
                  /> */}
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

                  <TextField
                    id="asset_issue"
                    label="Asset Issuer"
                    variant="outlined"

                    value={formData?.asset_issuer}
                    onChange={(e) => setFormData({ ...formData, asset_issuer: e.target.value })}
                    className="w-full custom-number-input"
                  />
                  {/* <div className="  flex flex-col w-full">
                    <div className="f-lbl">Ledger</div>
                    <select
                      type="select"
                      className="txt cleanbtn w-full h-[46px]"
                      placeholder="Network"
                      value={formData?.ledger}
                      required={true}
                      onChange={(e) =>
                        setFormData({ ...formData, ledger: e.target.value })
                      }
                    >
                      <option value="" disabled  >
                        Select Ledger
                      </option>
                      <option value={"xrp"}>XRP Ledger</option>
                      <option value={"xlm"}>Stellar Network</option>
                    </select>
                  </div> */}
                  <Autocomplete
                    disablePortal
                    value={
                      formData.type
                        ? { name: formData.ledger, label: formData.ledger } // Match type to the corresponding label
                        : null
                    }
                    options={[
                      { name: "xrp", label: "XRP Ledger" },
                      { name: "xlm", label: "Stellar Network" },
                    ]}
                    getOptionLabel={(option) => option.label}
                    className="w-full custom-number-input"
                    renderInput={(params) => <TextField {...params} label="Ledger" />}
                    onChange={(event, newValue) => {

                      setFormData({ ...formData, ledger: newValue ? newValue.name : "" });

                    }}
                  />

                  <Autocomplete
                    disablePortal
                    options={[
                      { name: "type1", label: "type1" },
                      { name: "type2", label: "type2" },
                      { name: "type3", label: "type3" }
                    ]}
                    getOptionLabel={(option) => option.label}
                    className="w-full custom-number-input"
                    renderInput={(params) => <TextField {...params} label="Type" />}
                    onChange={(event, newValue) => {

                      setFormData({ ...formData, type: newValue ? newValue.name : "" });

                    }}
                  />
                  <TextField
                    type="number"
                    label="Subunits"
                    variant="outlined"
                    value={formData?.subunit}
                    onChange={(e) => setFormData({ ...formData, subunit: Number(e.target.value) })}
                    // sx={{
                    //   height: '50px',
                    //   '& .MuiOutlinedInput-root': {
                    //     height: '46px',
                    //   }, 
                    //   '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
                    //     '-webkit-appearance': 'none',
                    //     margin: 0,
                    //   },
                    //   '& input[type=number]': {
                    //     '-moz-appearance': 'textfield', // For Firefox
                    //   },
                    // }}
                    className="w-full custom-number-input"
                  />
                  <TextField
                    type="number"
                    label="Percision"
                    variant="outlined"
                    value={formData?.precision}
                    onChange={(e) => setFormData({ ...formData, precision: Number(e.target.value) })}
                    className="w-full custom-number-input"
                  />
                  <TextField
                    label="Blockchain key"
                    variant="outlined"
                    value={formData?.blockchain_key}
                    onChange={(e) => setFormData({ ...formData, blockchain_key: e.target.value })}
             
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
                  {/* <TextField

                    label="Percision  "
                    variant="outlined"
                    value={formData?.precision_blockchain}
                    onChange={(e) => setFormData({ ...formData, precision_blockchain: e.target.value })}
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
                  {/* <button className="button !p-[5px]"
                    onClick={() => {
                      // handleUploadLogo(item);

                    }}

                  > Upload</button> */}
                  <div>
                    <div className="f-lbl capitalize">Upload icon</div>
                    <UploadButton text="Upload file" onChange={handleIconChange} />
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
            {step === "Deposit" && (
              <div className="right flex flex-col">
                <div className="field flex flex-col">
                  <div className="f-lbl">Deposit</div>
                  <Toggle onChange={(e) => setFormData(prevFormData => ({
                    ...prevFormData,
                    deposit: e,
                  }))} />
                </div>
                <div className="field flex flex-col">
                  <TextField
                    type="number"
                    label="Deposit Fee"
                    variant="outlined"
                    value={formData?.deposit_fee}
                    onChange={(e) => setFormData({ ...formData, deposit_fee: Number(e.target.value) })}
                    className="w-full custom-number-input"
                  />
                  {/* <div className="f-lbl">Deposit Fee</div>
                  <input
                    type="text"
                    className="txt cleanbtn"
                    placeholder="Deposit Fee"
                  /> */}
                </div>
                <div className="field flex flex-col">
                  <TextField
                    type="number"
                    label="Mini deposit Amount"
                    variant="outlined"
                    value={formData?.min_collection_amount}
                    onChange={(e) => setFormData({ ...formData, min_collection_amount: Number(e.target.value) })}
                    className="w-full custom-number-input"
                  />
                  {/* <div className="f-lbl">Mini deposit Amount</div>
                  <input
                    type="text"
                    className="txt cleanbtn"
                    placeholder="Mini deposit Amount"
                  /> */}
                </div>

                <div className="field flex flex-col">
                  <TextField
                    type="number"
                    label="Mini Collection Amount"
                    variant="outlined"
                    value={formData?.min_deposit_amount}
                    onChange={(e) => setFormData({ ...formData, min_deposit_amount: Number(e.target.value) })}
                    className="w-full custom-number-input"
                  />

                  {/* <div className="f-lbl">Mini Collection Amount</div>
                  <input
                    type="text"
                    className="txt cleanbtn"
                    placeholder="Mini Collection Amount"
                  /> */}
                </div>
                {isError && <div className="field flex flex-col">
                  <p className="isValid">Please fill all the required fields</p>
                </div>}

              </div>
            )}
            {step === "Withdrawal" && (
              <div className="right flex flex-col">
                <div className="field flex flex-col">
                  <div className="f-lbl">Withdrawal</div>
                  <Toggle onChange={(e) => setFormData(prevFormData => ({
                    ...prevFormData,
                    withdraw: e,
                  }))} />
                </div>
                <div className="field flex flex-col">

                  <TextField
                    type="number"
                    label="Withdraw Fee"
                    variant="outlined"
                    value={formData?.withdraw_fee}
                    onChange={(e) => setFormData({ ...formData, withdraw_fee: Number(e.target.value) })}
                    className="w-full custom-number-input"
                  />

                  {/* <div className="f-lbl">Withdraw Fee</div>
                  <input
                    type="text"
                    className="txt cleanbtn"
                    placeholder="Withdraw Fee"
                  /> */}
                </div>
                <div className="field flex flex-col">


                  <TextField
                    type="number"
                    label="Min Withdraw Amount"
                    variant="outlined"
                    value={formData?.min_withdraw_amount}
                    onChange={(e) => setFormData({ ...formData, min_withdraw_amount: Number(e.target.value) })}
                    className="w-full custom-number-input"
                  />
                  {/* <div className="f-lbl">Mini Withdraw Amount</div>
                  <input
                    type="text"
                    className="txt cleanbtn"
                    placeholder="Mini Withdraw Amount"
                  /> */}
                </div>

                <div className="field flex flex-col">


                  <TextField
                    type="number"
                    label="24h Withdraw Limit"
                    variant="outlined"
                    value={formData?.withdraw_limit_24hr}
                    onChange={(e) => setFormData({ ...formData, withdraw_limit_24hr: Number(e.target.value) })}
                    className="w-full custom-number-input"
                  />
                  {/* <div className="f-lbl">24h Withdraw Limit</div>
                  <input
                    type="text"
                    className="txt cleanbtn"
                    placeholder="24h Withdraw Limit"
                  /> */}
                </div>
           
                {isError && <div className="field flex flex-col">
                  <p className="isValid">Please fill all the required fields</p>
                </div>}
              </div>
            )}


            {step === "Properties" && (
              <div className="right flex flex-col">
                <div className="btn-row flex flex-col">
                  <button
                    className="btn-add-propertiy button flex aic jc"
                    onClick={handleOpenModel}
                  >
                    <div className="ico flex aic jc">
                      <PlusIcon />
                    </div>
                    <div className="btn-lbl">Add Propertiy</div>
                  </button>
                </div>

                <div>

                  {Object.entries(formData.properties).map(([key, value], index) => (
                    <div key={index} className="row flex aic w-full gap-2.5">
                      <div className="row-txt flex flex-col w-full ">
                        <TextField
                          type={key === "erc20_contract_address" ? "text" : "number"}
                          label={key}
                          variant="outlined"
                          value={value}
                          onChange={(e) => handlePropertiesChange(key, e.target.value)}
                          className="w-full custom-number-input"
                        />
                      </div>
                      <div className="row-btn flex aic jc">
                        <button
                          className="btn-remove button"
                          onClick={() => handleRemove(key)}

                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="row flex aic w-full">
                  <div className="row-txt flex flex-col w-full">

                    <TextField
                      id="outlined-multiline-static"
                      label="JSON"
                      multiline
                      disabled
                      value={propertiesJsonString}
                      className="w-full"
                    />

                  </div>
                </div>

              </div>
            )}
          </div >

          <div className="action flex aic justify-end">


            <div type="submit" className="btn button" onClick={validateStep}>
              {step === 'Properties' ? 'Submit' : 'Next'}
            </div>
          </div>
        </div >
      </div >

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} zindex={999} >


        <div className="add-currencie flex flex-col" style={{
          width: '400px',
          minHeight: '250px',
        }}>
          <div className="flex justify-between items-center mb-4">
            <div className="text-lg font-bold mt-[-19px]">Add property </div>
            {/* <div className="flex items-center justify-center cursor-pointer"
              onClick={() => setModalOpen(false)}>
              <CrossIcon />
            </div> */}
          </div>

          <div>
            <div className="flex flex-col mb-4">
              <TextField
                label="Key"
                variant="outlined"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                sx={{
                  height: "50px",
                  "& .MuiOutlinedInput-root": {
                    height: "46px",
                  },
                  "& .MuiInputLabel-root": {
                    lineHeight: "46px",
                  },
                }}
                className="w-full"
              />
            </div>

            <div className="flex flex-col mb-4">
              <TextField
                label="Value"
                variant="outlined"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                sx={{
                  height: "50px",
                  "& .MuiOutlinedInput-root": {
                    height: "46px",
                  },
                  "& .MuiInputLabel-root": {
                    lineHeight: "46px",
                  },
                }}
                className="w-full"
              />
            </div>

            {isError && <div className="field flex flex-col">
              <p className="isValid">Please fill all the required fields</p>
            </div>}

            <div className="action flex aic justify-end">
              <div type="submit" className="btn button" onClick={() => handleAddProperty(key, value)}>
                Add Property </div>
            </div>

          </div>
        </div>

      </Modal >
    </>
  );
};

export default AddNewCurrencie