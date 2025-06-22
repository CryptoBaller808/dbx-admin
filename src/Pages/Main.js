import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import { DropDownIcon } from "../Icons";

import TransaChart from "../components/TransaChart";
import axios from "axios";
import Spinner from "../components/Spinner/Spinner";
import { useAuthContext } from "../context/AuthContext";
import { API_URL } from '../config';

const Main = () => {
  const [hide, setHide] = useState(false);
  const { currentUser, verifyJwt } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [statusData, setStatusData] = useState([
    { id: 1, title: "Daily" },
    { id: 2, title: "Weekly" },
    { id: 3, title: "Monthly" },
  ]);
  const [selectedcompany, setselectedcompany] = useState();
  const [dashBoardData, setDashBoardData] = useState(null)

  let headers = {
    Authorization: `Bearer ${currentUser}`
  }


  useEffect(() => {
    document.addEventListener("click", () => {
      setHide(false);
    });
  }, []);

  // dashboard summary
  const getDashbaordSummary = async () => {
    setIsLoading(true);

    try {
      const res = await axios.get(`${API_URL}/admindashboard/user/dashboardSummary`,
        { headers: headers });
      const data = res.data;
      console.log(data)
      let checkExpiry = verifyJwt(data);
      if (checkExpiry) {
        setDashBoardData(data)
      }
      setIsLoading(false);
    } catch (e) {
      console.log(e);
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getDashbaordSummary()
  }, [])


  const reportsVal = [
    {
      val: "2500",
      lbl: "Cryptocurrencies",
      img: "./images/cryptio.svg",
      slug: "/cryptocurrencies",
      mape: "currencies",
    },
    { val: "3", lbl: "Users", img: "./images/users.svg", slug: "/users", mape: 'totalUsers' },

    {
      val: "48247",
      lbl: "No. of Trades",
      img: "./images/trade.svg",
      slug: "/transaction",
      mape: "TotalTrades"
    },

    {
      val: "25874",
      lbl: "Open Asks",
      img: "./images/openAsk.svg",
      slug: "/transaction",
      mape: "SellOffers"
    },
    {
      val: "12505",
      lbl: "Open Bids",
      img: "./images/opnebid.svg",
      slug: "/transaction",
      mape: "buyOffers"
    },

    {
      val: "35784",
      lbl: "No. of Sales NFT",
      img: "./images/sale.svg",
      slug: "/transaction",
      mape: "TotalNFTSales"
    },
    {
      val: "23684",
      lbl: "Open Ask NFT",
      img: "./images/openAsk.svg",
      slug: "/",
      mape: "TotalAskOffferNFT",
    },
    {
      val: "34128",
      lbl: "Open Bids NFT",
      img: "./images/opnebid.svg",
      slug: "/transaction",
      mape: "TotalBidOffferNFT"
    },
  ];



  return (
    <>
      {isLoading && <Spinner />}
      <div className="home-p flex flex-col">
        <div className="wrapWidth wrap flex flex-col">
          <div className="home-report">
            {reportsVal.map((item, index) => (
              <Link
                to={item.slug}
                className="report-item flex aic cursor-pointer"
              >
                <div className="icon flex aic jc">
                  <img src={item.img} className="icon-img" />
                </div>
                <div className="meta flex flex-col">
                  {dashBoardData && <div className="val">{dashBoardData[item.mape] || 0}</div>}
                  <div className="lbl">{item.lbl}</div>
                </div>
              </Link>
            ))}
          </div>
          {/* <div className="transation-chart-blk flex flex-col">
            <div className="chart-hdr flex aic">
              <div className="chart-tag">Transation Summary</div>
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
                          placeholder="Weekly"
                        >
                          {selectedcompany ? selectedcompany.title : "Weekly"}
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
              </div>
            </div>
            {/* <div className="chart flex aic">
              <TransaChart />
              <Chart
              chartType="Bar"
              width="100%"
              height="300px"
              data={data}
              options={options}
            />
            </div> 
          </div> */}
        </div>
      </div>
    </>
  );
};

export default Main;
