import React, { useState, useEffect } from "react";
import {
  PlusIcon,
  ReLoadIcon,
  DropDownIcon,
  HorzontalMenuIcon,
  SearchIcon,
} from "../Icons";
import Toggle from "../components/Toggle";
import axios from "axios";
import { useAuthContext } from "../context/AuthContext";
import Pagination from 'react-responsive-pagination';
import Spinner from "../components/Spinner/Spinner";
import moment from "moment";
import { Link } from "react-router-dom";
import { API_URL } from '../config';
import { getTransactions } from "../api/executers/transactions";

const TransactionDetails = () => {
  const [hide, setHide] = useState(false);
  const { currentUser, verifyJwt } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [transactionData, settransactionData] = useState([])
  const [statusData, setStatusData] = useState([
    { id: 1, title: "Swap" },
    { id: 2, title: "Swap 1" },
    { id: 3, title: "Swap 2" },
  ]);
  const [selectedcompany, setselectedcompany] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  let pageSize = 20;

  // headers for axios 
  let headers = {
    Authorization: `Bearer ${currentUser}`
  }

  const [cryptoVal, setCrytoVal] = useState([]);

  // get transaction details
  const getTransactionDetails = async (pageNo, pageSize) => {
    setIsLoading(true);

    try {
      const res = await axios.get(`${API_URL}/admindashboard/user/getNFTSalesLists?page_number=${pageNo}&page_size=${pageSize}`,
        { headers: headers });
      const data = res.data;

      let checkExpiry = verifyJwt(res?.data);
      if (checkExpiry) {
        // total page size
        let count = parseInt(data?.totalItems);
        let total = Math.ceil(count / pageSize);
        setTotalPages(total);
        console.log(data);
        setCrytoVal(data?.nftSales);
      }
      setIsLoading(false);
    } catch (e) {
      console.log(e);
      setIsLoading(false);
    }
  }

  // handle page change 
  const handlePageChange = (num) => {
    setCurrentPage(num);
    getTransactionDetails(num, pageSize);
  }

  useEffect(() => {
    getTransactionDetails(currentPage, pageSize);
  }, [])

  useEffect(() => {
    document.addEventListener("click", () => {
      setHide(false);
    });
  }, []);

  const handleGetTransactions = async () => {
    try {
      const resp = await getTransactions()
      if (resp.success) {
        settransactionData(resp.data)
      }

    } catch (error) {
      console.error(error);
    }
  }
  useEffect(() => {
    handleGetTransactions()
  }, [])

  return (
    <>
      {isLoading && <Spinner />}
      <div className="transaction-page flex flex-col">
        <div className="wrapWidth wrap flex flex-col">
          <div className="pg-hder flex aic">
            <div className="page-tag">Transaction Details</div>
            <div className="right-side flex aic">
              <div className="actions flex aic">
                <div className="search-box flex aic">
                  <div className="ico">
                    <SearchIcon />
                  </div>
                  <input
                    type="text"
                    className="txt cleanbtn"
                    placeholder="Search User"
                  />
                </div>
                {/* <div className="dropDown flex aic jc flex-col rel">
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
                            setselectedcompany(item);
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
                </div> */}
              </div>
            </div>
          </div>
          <div className="my-table flex">
            <div className="table-blk flex">
              <div className="crypto-tbl flex flex-col">
                <div className="tbl-row flex aic">
                  <div className="row-item flex">Seller Wallet <br />Address</div>
                  <div className="row-item flex">Buyer Wallet  <br />Address</div>

                  <div className="row-item flex">From</div>
                  <div className="row-item flex">To</div>
                  <div className="row-item flex">Order</div>
                  <div className="row-item flex">Price</div>
                  <div className="row-item flex">Amount</div>
                  <div className="row-item flex">Total</div>
                  <div className="row-item flex">Created at</div>
                  {/* <div className="row-item flex">View Details</div> */}
                </div>
                {transactionData?.map((item, index) => {
                  let entryDate = moment(item?.createdAt).utc().format('YYYY/MM/DD HH:mm:ss');
                  return (
                    <div className="tbl-row flex aic">
                      <div className="row-item flex">
                        {item?.seller ? `${item.seller.slice(0, 3)}...${item.seller.slice(-4)}` : '-'}
                      </div>
                      <div className="row-item flex">
                        {item?.buyer ? `${item.buyer.slice(0, 3)}...${item.buyer.slice(-4)}` : '-'}
                      </div>


                      <div className="row-item flex wallet-address gap-3 items-center" title={item?.from}>{item.from_icon_url ? <img src={item.from_icon_url} alt="Asset" className="w-10 h-10" /> : ""}<span>{item?.from}</span></div>
                      <div className="row-item flex wallet-address  gap-3 items-center" title={item?.to}>{item.to_icon_url ? <img src={item.to_icon_url} alt="Asset" className="w-10 h-10" /> : ""}<span>{item.to}</span></div>
                      <div className="row-item flex">{item?.orderType}</div>

                      <div className="row-item flex">{item?.price}</div>
                      <div className="row-item flex">{item?.amount}</div>
                      <div className="row-item flex">{item?.total}</div>
                      <div className="row-item flex">
                        {entryDate}
                      </div>
                      {/* <div className="row-item flex">
                        {item?.viewDetails}
                       </div> */}
                    </div>
                  )
                })
                }
              </div>
            </div>
          </div>

          <Pagination
            current={currentPage}
            total={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </>
  );
};

export default TransactionDetails;
