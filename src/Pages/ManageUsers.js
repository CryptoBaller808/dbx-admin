import React, { useState, useEffect } from "react";
import {
  PlusIcon,
  ReLoadIcon,
  DropDownIcon,
  HorzontalMenuIcon,
  UpIcon,
  EnvelopIcon,
  DelIcon,
  WarnningIcon,
  SearchIcon,
  PropertiesIcon,
  TelegramIcon,
  TwitterIcon
} from "../Icons";
import { FaInstagram, FaFacebook, FaTwitter, FaDiscord } from 'react-icons/fa';
import Toggle from "../components/Toggle";
import axios from "axios";
import { useAuthContext } from "../context/AuthContext";
import Spinner from "../components/Spinner/Spinner";
import Pagination from 'react-responsive-pagination';
import 'react-responsive-modal/styles.css';
import { Modal } from 'react-responsive-modal';
import InstagramIcon from "../Icons/InstagramIcon";
import { Link } from "react-router-dom";
import { API_URL } from '../config';

const ManageUsers = () => {
  const [hide, setHide] = useState(false);
  const { currentUser, verifyJwt } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [statusData, setStatusData] = useState([
    { id: 1, title: "All" },
    { id: 2, title: "Swap 1" },
    { id: 3, title: "Swap 2" },
  ]);
  const [selectedcompany, setselectedcompany] = useState();
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedUser, setSelectedUser] = useState();
  const [searchText, setSearchText] = useState('');
  let pageSize = 20;

  const [open, setOpen] = useState(false);

  const onOpenModal = () => setOpen(true);
  const onCloseModal = () => setOpen(false);

  // headers for axios 
  let headers = {
    Authorization: `Bearer ${currentUser}`
  }



  // get all users 
  const getAllUsers = async (pageNo, pageSize) => {
    setIsLoading(true);

    try {
      const res = await axios.get(`${API_URL}/admindashboard/user/getAllUser?page=${pageNo}&limit=${pageSize}`,
        { headers: headers });
      const data = res.data;
      let checkExpiry = verifyJwt(data);
      if (checkExpiry) {

        // total page size
        let count = parseInt(data?.count);
        let total = Math.ceil(count / pageSize);
        setTotalPages(total);
        setUsers(data?.users);

      }

      setIsLoading(false);
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  }

  // handle page change 
  const handlePageChange = (num) => {
    setCurrentPage(num);
    getAllUsers(num, pageSize);
  }

  // block / unblock user 
  const handleToggleBlock = async (id) => {
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/admindashboard/user/toggleBlockUser/${id}`, {}, { headers: headers });
      const data = res.data;
      let checkExpiry = verifyJwt(data);
      if (checkExpiry) {
        getAllUsers(currentPage, pageSize);
      }
      setIsLoading(false);
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  }


  // delete user 
  const handleDeleteUser = async (id) => {
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/admindashboard/user/deleteUser/${id}`, {}, { headers: headers });
      const data = res.data;
      let checkExpiry = verifyJwt(data);
      if (checkExpiry) {
        getAllUsers(currentPage, pageSize);
      }
      setIsLoading(false);
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  }


  // get user by id 
  const getUserById = async (id) => {
    setIsLoading(true);

    try {
      const res = await axios.get(`${API_URL}/admindashboard/user/getuserProfile/${id}`, { headers: headers });
      let checkExpiry = verifyJwt(res?.data);
      if (checkExpiry) {
        setSelectedUser(res?.data);
      }
      setIsLoading(false);
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  }

  // search user 
  const handleSearchUser = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/admindashboard/user/searchusers?searchTerm=${searchText}`, { headers: headers });
      let checkExpiry = verifyJwt(res?.data);
      if (checkExpiry) {
        setUsers(res.data);
      }
      setIsLoading(false);
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  }


  useEffect(() => {
    if (selectedUser) {
      onOpenModal();
    }
  }, [selectedUser])


  useEffect(() => {
    getAllUsers(currentPage, pageSize);
  }, [])

  useEffect(() => {
    document.addEventListener("click", () => {
      setHide(false);
    });
  }, []);
  return (
    <>
      <Modal open={open} onClose={onCloseModal} center>
        <div className="user-modal">

          <div class="max-w-xs">
            <div class="bg-white rounded-lg py-3">
              <div class="photo-wrapper p-2">
                <img class="w-32 h-32 rounded-full mx-auto"
                  src={selectedUser?.profile_image} alt="John Doe" />
              </div>
              <div class="p-2">
                <h3 class="text-center text-xl text-gray-900 font-medium leading-8">{selectedUser?.firstname} {selectedUser?.lastname}</h3>
                <div class="text-center text-gray-400 text-xs font-semibold">
                  <p>{selectedUser?.bio}</p>
                </div>
                <table class="text-xs my-3">
                  <tbody>
                    <tr>
                      <td class="px-2 py-2 text-gray-500 font-semibold">Email</td>
                      <td class="px-2 py-2">{selectedUser?.email}</td>
                    </tr>
                    <tr>
                      <td class="px-2 py-2 text-gray-500 font-semibold">Wallet Address</td>
                      <td class="px-2 py-2 user-modal-para"><p>{selectedUser?.wallet_address}</p></td>
                    </tr>
                    <tr>
                      <td class="px-2 py-2 text-gray-500 font-semibold">Status</td>
                      <td class="px-2 py-2 user-modal-para"><p>{selectedUser?.is_blocked ? "Inactive" : "Active"}</p></td>
                    </tr>
                    <tr>
                      <td class="px-2 py-2 text-gray-500 font-semibold">MFA Status</td>
                      <td class="px-2 py-2 user-modal-para">
                        <p className={selectedUser?.mfa_enabled ? "text-green-600" : "text-red-600"}>
                          {selectedUser?.mfa_enabled ? "Enabled" : "Disabled"}
                        </p>
                      </td>
                    </tr>
                  </tbody></table>

                <div class="text-center my-3 flex px-2">
                  <Link to={selectedUser?.insta_url} className="social-icon" target="_blank">
                    <FaInstagram size={25} />
                  </Link>
                  <Link to={selectedUser?.fb_url} className="social-icon" target="_blank">
                    <FaFacebook size={25} />
                  </Link>
                  <Link to={selectedUser?.twitter_url} className="social-icon" target="_blank">
                    <FaTwitter size={25} />
                  </Link>
                  <Link to={selectedUser?.discord_url} className="social-icon" target="_blank">
                    <FaDiscord size={25} />
                  </Link>
                </div>

              </div>
            </div>
          </div>
        </div>
      </Modal>
      {isLoading && <Spinner />}
      {/* <UserDetailsModal /> */}
      <div className="users-page flex flex-col">
        <div className="wrapWidth wrap flex flex-col">
          <div className="pg-hder flex aic">
            <div className="page-tag">Manage Users</div>
            <div className="right-side flex aic">
              <div className="actions flex aic">
                <form className="search-box flex aic" onSubmit={handleSearchUser}>
                  <input
                    type="text"
                    className="txt cleanbtn"
                    placeholder="Search User"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                  <button className="ico" type="submit">
                    <SearchIcon />
                  </button>
                </form>
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
          <div className="desc flex">
            <p>
              Here you can view the basic details of all the users. You can block, unblock and delete users. Clicking on the Home icon in Action will display user detail
            </p>
          </div>
          <div className="my-table flex">
            <div className="table-blk flex">
              <div className="crypto-tbl flex flex-col">
                <div className="tbl-row flex aic">
                  <div className="row-item flex">Wallet Address</div>
                  <div className="row-item flex">Email Address</div>
                  <div className="row-item flex">MFA Status</div>
                  <div className="row-item flex">Status</div>
                  <div className="row-item flex">Actions</div>
                </div>
                {users?.map((item, index) => (
                  <div className="tbl-row flex aic" key={index}>
                    <div className="row-item flex wallet-address">{item?.wallet_address}</div>
                    <div className="row-item flex">{item?.email}</div>
                    <div className="row-item flex aic">
                      <div className={`status flex aic ${item?.mfa_enabled ? "active" : "inactive"}`}>
                        <span className="dot"></span> {item?.mfa_enabled ? "Enabled" : "Disabled"}
                      </div>
                    </div>
                    <div className="row-item flex aic">
                      <div
                        className={`status flex aic ${item?.is_blocked ? "inactive" : ""}`}
                      >
                        <span className="dot"></span> {item?.is_blocked ? "Inactive" : "Active"}
                      </div>
                    </div>
                    <div className="row-item flex">
                      <div className="r-actions flex aic">
                        <div className="ico icon-warn flex aic jc" title="Block/Unblock User" onClick={() => handleToggleBlock(item?.id)}>
                          <WarnningIcon />
                        </div>
                        <div className="ico icon-del flex aic jc" title="Delete User" onClick={() => handleDeleteUser(item?.id)}>
                          <DelIcon />
                        </div>
                        <div className="ico icon-env flex aic jc" title="User Details" onClick={() => getUserById(item?.id)}>
                          <PropertiesIcon />
                        </div>
                        <div className="ico icon-up flex aic jc">
                          <UpIcon />
                        </div>
                        <div className="ico icon-up1 flex aic jc">
                          <UpIcon />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div>
            <Pagination
              current={currentPage}
              total={totalPages}
              onPageChange={handlePageChange}
            />

          </div>
        </div>
      </div>
    </>
  );
};

export default ManageUsers;
