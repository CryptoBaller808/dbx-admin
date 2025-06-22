import React, { useState, useEffect } from "react";
import { DropDownIcon } from "../Icons";
import { getAnalyticData } from "../api/executers/visitor";
import DataChart from "../components/DataChart";
import MapComponent from "../components/GoogleMap";
import Spinner from "../components/Spinner/Spinner";

const chartColors = {
  newUsers: '#0BCAFF',
  onlineUsers: '#6D2AE8',
  pageViews: '#F5377B',
  sessionDuration: '#3662FB',

}

const Tracking = () => {
  const [hide, setHide] = useState(false);
  const [trackingData, setTrackingData] = useState({});
  const [generalStat, setGeneralState] = useState({});
  const [track, setTrack] = useState(['newUsers', 'onlineUsers', 'pageViews', 'sessionDuration']);
  const [loading, setLoading] = useState(null);


  const [statusData, setStatusData] = useState([
    { id: 1, title: "All", value: "365daysAgo" },
    { id: 2, title: "Today", value: "today" },
    { id: 3, title: "This Week", value: "7daysAgo" },
    { id: 4, title: "This Month", value: "30daysAgo" },
  ]);
  const [selectedcompany, setselectedcompany] = useState();
  useEffect(() => {
    document.addEventListener("click", () => {
      setHide(false);
    });
  }, []);


  const reportsVal = [
    { val: trackingData?.totalPageViews || 0, lbl: "Page Views", img: "./images/View.svg" },
    { val: trackingData?.totalVisitors || 0, lbl: "Visitors", img: "./images/visitor.svg" },
    {
      val: trackingData?.totalFirstTimeVisitors || 0,
      lbl: "First Time Visitors",
      img: "./images/firstVisitor.svg",
    },
    { val: trackingData?.totalOnlineUsers || 0, lbl: "User Online", img: "./images/online.svg" },
    {
      val: `${Math.floor(trackingData?.averageVisitDuration / 3600)}h ${Math.floor((trackingData?.averageVisitDuration % 3600) / 60)}m` || 0,
      lbl: "Average Visit Length", img: "./images/time.svg"
    },
    { val: trackingData?.pageViewsPerVisit?.toFixed(1) || 0, lbl: "Page Views Per Visit", img: "./images/page.svg" },
  ];

  const handleGetAnalytic = async (date) => {
    let startDate = date || "365daysAgo"
    let endDate = "today"
    setLoading(true)
    try {
      const resp = await getAnalyticData(startDate, endDate)
      if (resp.success) {
        setTrackingData(resp.data)
      }

    } catch (error) {
      console.error(error);
    }
    setLoading(false)
  }

  const getGeneralState = async (date) => {
    let startDate = "365daysAgo"
    let endDate = "today"
    setLoading(true)
    try {
      const resp = await getAnalyticData(startDate, endDate)
      if (resp.success) {
        setGeneralState(resp.data)
      }

    } catch (error) {
      console.error(error);
    }
    setLoading(false)
  }

  useEffect(() => {
    handleGetAnalytic()
    getGeneralState()
  }, [])

  const XAxis = trackingData?.chartData?.map((item) => {
    const dateStr = item.date;
    const year = dateStr.substring(0, 4); // Extract YYYY
    const month = dateStr.substring(4, 6); // Extract MM
    const day = dateStr.substring(6, 8); // Extract DD
    return `${day}-${month}-${year}`; // Combine in DD-MM-YYYY format
  })
  const YAxis = trackingData?.chartData?.map((item) => {
    console.log("item: ", item)
    // Check if the track is sessionDuration and convert to hours and minutes
    if (track === 'sessionDuration') {
      const durationInSeconds = item[track];
      const hours = Math.floor(durationInSeconds / 3600); // Convert seconds to hours
      const minutes = Math.floor((durationInSeconds % 3600) / 60); // Convert remaining seconds to minutes
      return minutes; // Format the result as "Xh Ym"
    } else {
      return item[track]; // For other tracks, return the raw value
    }
  });

  console.log("YAxis: ", JSON.stringify(trackingData?.chartData))

  // if(loading){
  //   return <div className="flex h-screen items-center justify-center">Pleae wait...</div>
  // }

  return (
    <div className="tracking-page flex relative">
      <div className="wrapWidth wrap flex flex-col">
        <div className="page-hdr">
          {reportsVal.map((item, index) => (
            <div className="box flex jc flex-col">
              <div className="icon">
                <img src={item.img} className="ico-img" />
              </div>
              <div className="meta flex flex-col">
                <div className="val">{item.val}</div>
                <div className="lbl">{item.lbl}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mid-sec">
          <div className="left flex flex-col">
            <div className="left-tag">General Stats</div>
            <div className="row-lists flex flex-col">
              <div className="row-item flex aic">
                <div className="le flex">Total Page Views</div>
                <div className="re flex">{generalStat?.totalPageViews}</div>
              </div>
              <div className="row-item flex aic">
                <div className="le flex">Total Visitors</div>
                <div className="re flex">{generalStat?.totalVisitors}</div>
              </div>
              <div className="row-item flex aic">
                <div className="le flex">Page Views Per Visit</div>
                <div className="re flex">{generalStat?.pageViewsPerVisit?.toFixed(1)}</div>
              </div>
              {/* <div className="row-item flex aic">
                <div className="le flex">Last Hits Time</div>
                <div className="re flex">15:10:32 29 April 2022</div>
              </div> */}
            </div>
          </div>
          <div className="right flex flex-col">
            <div className="right-tag">Geo Location</div>
            <div className="map-box">
              <MapComponent locations={trackingData?.locations || []} />
            </div>
          </div>
        </div>
        <div className="visitor-graph flex flex-col">
          <div className="chart-hdr flex aic">
            <div className="chart-tag">Visitors Processed</div>
            <div className="chart-right flex aic">
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
                          placeholder="All"
                        >
                          {selectedcompany ? selectedcompany.title : "All"}
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
                    {statusData?.map((item, index) => (
                      <div
                        key={index}
                        className="slt flex aic"
                        onClick={(e) => {
                          setHide(!hide);
                          setselectedcompany(item);
                          handleGetAnalytic(item.value)
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
          </div>
          <div className="graph">
            {
              trackingData?.chartData ? 
              <DataChart 
                label="" 
                data={trackingData?.chartData}  
                hideNewUsers = {!track.includes('newUsers')}
                hideOnlineUsers = {!track.includes('onlineUsers')}
                hidePageViews = {!track.includes('pageViews')}
                hideSessionDuration = {!track.includes('sessionDuration')}
                colors={chartColors}
              />
              : null
            }
            
          </div>
        </div>
      </div>
      {
        loading && (
          <Spinner />
          // <div className="opacity-80 bg-white absolute top-0 right-0 bottom-0 left-0 flex items-center justify-center">Loading...</div>
        )
      }
    </div>
    
  );
};

export default Tracking;
